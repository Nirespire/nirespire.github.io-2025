const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const repoRoot = path.join(__dirname, '..', '..');
const srcDir = path.join(repoRoot, 'src');
const blogDir = path.join(srcDir, 'blog');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

// post.njk renders the cover as `alt="{{ coverImageAlt }}"`, so a post that
// sets coverImage without coverImageAlt ships an LCP image with an empty alt.
// axe accepts that (empty alt reads as decorative), so it never fails the a11y
// suite — this is the check that does.
test('every post with a cover image describes it in coverImageAlt', () => {
  const posts = fs.readdirSync(blogDir).filter((name) => name.endsWith('.md'));
  assert.ok(posts.length > 0, 'no posts found');

  for (const name of posts) {
    const { data } = matter(fs.readFileSync(path.join(blogDir, name), 'utf8'));
    if (!data.coverImage) continue;
    assert.ok(
      typeof data.coverImageAlt === 'string' && data.coverImageAlt.trim() !== '',
      `src/blog/${name} sets coverImage but no coverImageAlt`
    );
  }
});

// base.njk adds rel="noopener noreferrer" to external links at runtime, but
// only once its inline script runs; a hardcoded target="_blank" must carry the
// rel itself so the opened page never gets a window.opener handle.
test('every hardcoded target="_blank" link sets rel="noopener noreferrer"', () => {
  const sources = walk(srcDir).filter((file) => /\.(njk|md|html)$/.test(file));
  const anchor = /<a\b[^>]*>/gis;

  for (const file of sources) {
    const content = fs.readFileSync(file, 'utf8');
    for (const [tag] of content.matchAll(anchor)) {
      if (!/\btarget\s*=\s*["']?_blank/i.test(tag)) continue;
      const rel = tag.match(/\brel\s*=\s*["']([^"']*)["']/i)?.[1] ?? '';
      const tokens = rel.toLowerCase().split(/\s+/);
      assert.ok(
        tokens.includes('noopener') && tokens.includes('noreferrer'),
        `${path.relative(repoRoot, file)}: ${tag.replace(/\s+/g, ' ')} is missing rel="noopener noreferrer"`
      );
    }
  }
});
