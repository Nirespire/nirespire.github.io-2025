const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.join(__dirname, '..', '..');

// GitHub Pages pins the custom domain from the CNAME file at the root of the
// deployed artifact. If it stops being copied into _site/, a deploy silently
// drops sanjaynair.me and the site only answers on the github.io project URL.
// These tests guard that path end to end: the file exists, says the right
// host, and the Eleventy config copies it to the site root.

function passthroughMappings() {
  const mappings = [];
  const noop = () => {};
  const stub = {
    addPlugin: noop,
    addFilter: noop,
    setLibrary: noop,
    addCollection: noop,
    addPassthroughCopy: (arg) => mappings.push(arg),
  };
  require(path.join(repoRoot, '.eleventy.js'))(stub);
  return mappings;
}

test('static/ is passthrough-copied to the site root', () => {
  const mappings = passthroughMappings();
  const staticMapping = mappings.find(
    (mapping) => typeof mapping === 'object' && mapping !== null && 'static' in mapping
  );

  assert.ok(
    staticMapping,
    'no addPassthroughCopy mapping for static/ — CNAME would not reach _site/ and the Pages custom domain would be dropped'
  );
  assert.strictEqual(
    staticMapping.static,
    '.',
    'static/ must land at the site root so CNAME sits at _site/CNAME'
  );
});

test('static/CNAME holds a single bare hostname', () => {
  const cnamePath = path.join(repoRoot, 'static', 'CNAME');
  assert.ok(fs.existsSync(cnamePath), 'static/CNAME is missing');

  const contents = fs.readFileSync(cnamePath, 'utf8').trim();
  assert.ok(contents.length > 0, 'static/CNAME is empty');
  assert.ok(!contents.includes('\n'), 'static/CNAME must contain exactly one hostname');
  assert.match(
    contents,
    /^[a-z0-9.-]+\.[a-z]{2,}$/,
    'static/CNAME must be a bare hostname (no scheme, port, or path)'
  );
});

test('static/CNAME matches the canonical host used to build absolute URLs', () => {
  const cname = fs.readFileSync(path.join(repoRoot, 'static', 'CNAME'), 'utf8').trim();
  const sitemap = fs.readFileSync(path.join(repoRoot, 'src', 'sitemap.xml.njk'), 'utf8');

  const match = sitemap.match(/absoluteUrl\("https:\/\/([a-z0-9.-]+)"\)/);
  assert.ok(match, 'could not find the canonical host in src/sitemap.xml.njk');
  assert.strictEqual(
    match[1],
    cname,
    'static/CNAME and the canonical host in sitemap.xml.njk disagree'
  );
});
