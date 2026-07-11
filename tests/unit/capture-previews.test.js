const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');

const {
  buildFileMap,
  requestKey,
  slugify,
  loadRoutes,
  createStaticServer,
} = require('../../scripts/capture-previews.js');

// Build a throwaway _site-like tree and return its root.
function makeSiteFixture() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'capture-previews-'));
  fs.writeFileSync(path.join(dir, 'index.html'), '<html>home</html>');
  fs.mkdirSync(path.join(dir, 'about'));
  fs.writeFileSync(path.join(dir, 'about', 'index.html'), '<html>about</html>');
  fs.writeFileSync(path.join(dir, '404.html'), '<html>not found</html>');
  fs.writeFileSync(path.join(dir, 'robots.txt'), 'User-agent: *');
  return dir;
}

test('slugify lowercases and collapses non-alphanumerics into single dashes', () => {
  assert.strictEqual(slugify('Blog Index'), 'blog-index');
  assert.strictEqual(slugify('/blog/2026-06-14-post/'), 'blog-2026-06-14-post');
  assert.strictEqual(slugify('Post: A/B & C!'), 'post-a-b-c');
  assert.strictEqual(slugify('---already---'), 'already');
});

test('requestKey strips query and fragment and decodes percent-encoding', () => {
  assert.strictEqual(requestKey('/about/?foo=bar'), '/about/');
  assert.strictEqual(requestKey('/about/#section'), '/about/');
  assert.strictEqual(requestKey('/tags/a%20b/'), '/tags/a b/');
  assert.strictEqual(requestKey(''), '/');
});

test('requestKey returns the raw path when decoding fails', () => {
  // A lone % is invalid percent-encoding; decodeURIComponent throws.
  assert.strictEqual(requestKey('/bad%'), '/bad%');
});

test('buildFileMap maps files and GitHub-Pages pretty URLs', () => {
  const dir = makeSiteFixture();
  try {
    const map = buildFileMap(dir);
    // Direct file paths
    assert.ok(map.has('/index.html'));
    assert.ok(map.has('/about/index.html'));
    assert.ok(map.has('/robots.txt'));
    // Pretty URLs for index.html, with and without trailing slash
    assert.ok(map.has('/about/'));
    assert.ok(map.has('/about'));
    assert.strictEqual(map.get('/about'), map.get('/about/index.html'));
    // Root index is reachable at "/"
    assert.strictEqual(map.get('/'), map.get('/index.html'));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('createStaticServer serves mapped routes and 404s untrusted/unknown paths', async () => {
  const dir = makeSiteFixture();
  const server = createStaticServer(dir);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const get = (p) =>
    new Promise((resolve, reject) => {
      http
        .get({ host: '127.0.0.1', port, path: p }, (res) => {
          let body = '';
          res.on('data', (c) => (body += c));
          res.on('end', () => resolve({ status: res.statusCode, body }));
        })
        .on('error', reject);
    });

  try {
    const home = await get('/');
    assert.strictEqual(home.status, 200);
    assert.match(home.body, /home/);

    const about = await get('/about');
    assert.strictEqual(about.status, 200);
    assert.match(about.body, /about/);

    // A traversal attempt (percent-encoded so the HTTP client doesn't
    // normalize it away) decodes to a "/../secret" map key that simply isn't
    // present — the server never turns a request URL into a filesystem path,
    // so it falls through to 404 rather than escaping the site dir.
    const traversal = await get('/%2e%2e/secret');
    assert.strictEqual(traversal.status, 404);

    const missing = await get('/does-not-exist');
    assert.strictEqual(missing.status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('loadRoutes parses a comma-separated --routes list', () => {
  const routes = loadRoutes({ routes: '/, /about/ , /uses/' });
  assert.deepStrictEqual(routes, [
    { label: 'Home', path: '/' },
    { label: 'about', path: '/about/' },
    { label: 'uses', path: '/uses/' },
  ]);
});

test('loadRoutes reads and filters a routes file', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'routes-'));
  const file = path.join(dir, 'routes.json');
  fs.writeFileSync(file, JSON.stringify([{ label: 'Home', path: '/' }, { label: 'Bad' }, null]));
  try {
    const routes = loadRoutes({ routesFile: file });
    assert.deepStrictEqual(routes, [{ label: 'Home', path: '/' }]);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
