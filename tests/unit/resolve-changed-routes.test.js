const { test } = require('node:test');
const assert = require('node:assert/strict');

const { resolveChangedRoutes, isSiteWide } = require('../../scripts/resolve-changed-routes.js');
const { STATIC_ROUTES } = require('../../scripts/preview-routes.js');

test('maps a changed blog post to its page plus home and the blog index', () => {
  const routes = resolveChangedRoutes(['src/blog/2018-02-25-personal-project-career-fair.md']);
  assert.deepEqual(
    routes.map((route) => route.path),
    ['/blog/2018-02-25-personal-project-career-fair/', '/', '/blog/']
  );
});

test('maps standalone pages to their own route only', () => {
  assert.deepEqual(
    resolveChangedRoutes(['src/about.njk']).map((route) => route.path),
    ['/about/']
  );
  assert.deepEqual(
    resolveChangedRoutes(['src/uses.njk']).map((route) => route.path),
    ['/uses/']
  );
});

test('treats reads data changes as a Reads page change', () => {
  assert.deepEqual(
    resolveChangedRoutes(['src/_data/raindrop.json']).map((route) => route.path),
    ['/reads/']
  );
});

test('a shared layout change triggers the full curated set', () => {
  const routes = resolveChangedRoutes(['src/_includes/layouts/base.njk']);
  assert.deepEqual(
    routes.map((route) => route.path),
    STATIC_ROUTES.map((route) => route.path)
  );
});

test('a stylesheet change is site-wide', () => {
  assert.ok(isSiteWide('src/assets/css/styles.css'));
  assert.equal(resolveChangedRoutes(['src/assets/css/styles.css']).length, STATIC_ROUTES.length);
});

test('de-duplicates routes across multiple changed files', () => {
  const routes = resolveChangedRoutes(['src/blog/2020-01-01-a.md', 'src/blog/2020-02-02-b.md']);
  assert.deepEqual(
    routes.map((route) => route.path),
    ['/blog/2020-01-01-a/', '/', '/blog/', '/blog/2020-02-02-b/']
  );
});

test('returns no routes when nothing maps to a rendered page', () => {
  assert.deepEqual(resolveChangedRoutes(['src/feed.xml.njk', 'README.md']), []);
});
