const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');
const config = JSON.parse(fs.readFileSync(path.join(repoRoot, 'lighthouserc.json'), 'utf8'));

// Lighthouse CI audits a hardcoded list of URLs against the built `_site`.
// With `staticDistDir`, a URL that no longer exists is served as the 404 page
// rather than failing the run — the audit still reports healthy scores, so
// coverage disappears silently. These tests tie each configured URL back to the
// source file that produces it, and keep the assertions that caught the
// regressions in #371 from being dropped.

// The source files Eleventy could build an audited URL from: a post markdown
// file, a sibling template, or a directory-index template.
function sourcesFor(url) {
  const slug = new URL(url).pathname.replace(/\/index\.html$/, '').replace(/^\/|\/$/g, '');
  if (slug === '') {
    return [path.join(repoRoot, 'src', 'index.njk')];
  }
  return [
    path.join(repoRoot, 'src', `${slug}.md`),
    path.join(repoRoot, 'src', `${slug}.njk`),
    path.join(repoRoot, 'src', slug, 'index.njk'),
  ];
}

const urls = config.ci.collect.url;

test('every audited URL still has a source file', () => {
  for (const url of urls) {
    const candidates = sourcesFor(url);
    assert.ok(
      candidates.some((candidate) => fs.existsSync(candidate)),
      `lighthouserc.json audits ${url}, but none of ` +
        `${candidates.map((c) => path.relative(repoRoot, c)).join(', ')} exists — ` +
        `Lighthouse would audit the 404 page and report healthy scores`
    );
  }
});

test('a blog post page is among the audited URLs', () => {
  const postUrls = urls.filter((url) => /\/blog\/.+\/index\.html$/.test(new URL(url).pathname));
  assert.ok(
    postUrls.length > 0,
    'no post page in lighthouserc.json — post-layout regressions (cover banner, LCP) go unmeasured'
  );
});

test('every audited URL is asserted on LCP and responsive images', () => {
  const matrix = config.ci.assert.assertMatrix;
  for (const url of urls) {
    const pathname = new URL(url).pathname;
    const matching = matrix.filter((entry) =>
      new RegExp(entry.matchingUrlPattern).test(`http://localhost${pathname}`)
    );
    assert.ok(matching.length > 0, `no assertMatrix entry matches ${pathname}`);
    for (const audit of ['largest-contentful-paint', 'uses-responsive-images']) {
      assert.ok(
        matching.some((entry) => audit in entry.assertions),
        `${pathname} has no "${audit}" assertion — the /blog/ regression in #371 went unseen ` +
          `precisely because that matrix entry lacked one`
      );
    }
  }
});

test('scores are averaged over more than one run', () => {
  assert.ok(
    config.ci.collect.numberOfRuns > 1,
    'numberOfRuns must be > 1 — single-run scores flake on shared CI runners'
  );
});
