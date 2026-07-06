const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  splitLinkHeader,
  findWebmentionInLinkHeader,
  findWebmentionInHtml,
  discoverWebmentionEndpoint,
  sendWebmention,
  readCappedText,
  MAX_HTML_BYTES,
} = require('../../scripts/send-webmentions.js');

// Swap global fetch for a stub and restore it when the test ends.
function mockFetch(t, impl) {
  const original = global.fetch;
  global.fetch = impl;
  t.after(() => {
    global.fetch = original;
  });
}

function htmlResponse(body, headers = {}) {
  return new Response(body, {
    headers: { 'content-type': 'text/html; charset=utf-8', ...headers },
  });
}

test('splitLinkHeader splits on top-level commas only', () => {
  const header = '<https://a.example/>; rel="next", <https://b.example/>; rel="prev"';
  assert.deepEqual(splitLinkHeader(header), [
    '<https://a.example/>; rel="next"',
    ' <https://b.example/>; rel="prev"',
  ]);
});

test('splitLinkHeader ignores commas inside <...> brackets', () => {
  const header = '<https://a.example/path,with,commas>; rel="webmention"';
  assert.deepEqual(splitLinkHeader(header), [header]);
});

test('findWebmentionInLinkHeader returns the URL for a webmention rel', () => {
  const header =
    '<https://other.example/>; rel="next", <https://wm.example/endpoint>; rel="webmention"';
  assert.equal(findWebmentionInLinkHeader(header), 'https://wm.example/endpoint');
});

test('findWebmentionInLinkHeader is case-insensitive on rel', () => {
  const header = '<https://wm.example/endpoint>; rel="WebMention"';
  assert.equal(findWebmentionInLinkHeader(header), 'https://wm.example/endpoint');
});

test('findWebmentionInLinkHeader supports multiple rel values', () => {
  const header = '<https://wm.example/endpoint>; rel="canonical webmention"';
  assert.equal(findWebmentionInLinkHeader(header), 'https://wm.example/endpoint');
});

test('findWebmentionInLinkHeader returns null when no webmention rel present', () => {
  const header = '<https://a.example/>; rel="next"';
  assert.equal(findWebmentionInLinkHeader(header), null);
});

test('findWebmentionInHtml finds a <link rel="webmention">', () => {
  const html = `
    <html><head>
      <link rel="canonical" href="https://example.com/">
      <link rel="webmention" href="https://wm.example/endpoint">
    </head></html>
  `;
  assert.equal(findWebmentionInHtml(html), 'https://wm.example/endpoint');
});

test('findWebmentionInHtml finds an <a rel="webmention">', () => {
  const html = `<body><a rel="webmention" href="/endpoint">wm</a></body>`;
  assert.equal(findWebmentionInHtml(html), '/endpoint');
});

test('findWebmentionInHtml supports single-quoted attributes', () => {
  const html = `<link rel='webmention' href='https://wm.example/'>`;
  assert.equal(findWebmentionInHtml(html), 'https://wm.example/');
});

test('findWebmentionInHtml supports unquoted href', () => {
  const html = `<link rel=webmention href=https://wm.example/path>`;
  assert.equal(findWebmentionInHtml(html), 'https://wm.example/path');
});

test('findWebmentionInHtml returns null when no rel="webmention" present', () => {
  const html = `<link rel="canonical" href="https://example.com/">`;
  assert.equal(findWebmentionInHtml(html), null);
});

test('findWebmentionInHtml handles multiple-rel link tags', () => {
  const html = `<link rel="me webmention" href="https://wm.example/">`;
  assert.equal(findWebmentionInHtml(html), 'https://wm.example/');
});

test('discoverWebmentionEndpoint prefers the Link header over the HTML body', async (t) => {
  mockFetch(t, async () =>
    htmlResponse('<link rel="webmention" href="https://html.example/wm">', {
      link: '<https://header.example/wm>; rel="webmention"',
    })
  );
  const endpoint = await discoverWebmentionEndpoint('https://target.example/post');
  assert.equal(endpoint, 'https://header.example/wm');
});

test('discoverWebmentionEndpoint falls back to the HTML body when no Link header', async (t) => {
  mockFetch(t, async () =>
    htmlResponse(
      '<html><head><link rel="webmention" href="https://wm.example/endpoint"></head></html>'
    )
  );
  const endpoint = await discoverWebmentionEndpoint('https://target.example/post');
  assert.equal(endpoint, 'https://wm.example/endpoint');
});

test('discoverWebmentionEndpoint resolves relative endpoints against the page URL', async (t) => {
  mockFetch(t, async () => htmlResponse('<link rel="webmention" href="/webmention">'));
  const endpoint = await discoverWebmentionEndpoint('https://target.example/deep/post');
  assert.equal(endpoint, 'https://target.example/webmention');
});

test('discoverWebmentionEndpoint returns null for non-HTML responses without a Link header', async (t) => {
  mockFetch(t, async () => new Response('{}', { headers: { 'content-type': 'application/json' } }));
  const endpoint = await discoverWebmentionEndpoint('https://target.example/api');
  assert.equal(endpoint, null);
});

test('discoverWebmentionEndpoint returns null when no endpoint is advertised', async (t) => {
  mockFetch(t, async () => htmlResponse('<html><head><title>hi</title></head></html>'));
  const endpoint = await discoverWebmentionEndpoint('https://target.example/post');
  assert.equal(endpoint, null);
});

test('readCappedText truncates the body at the byte cap', async () => {
  const chunk = 'a'.repeat(1024);
  let pushed = 0;
  const stream = new ReadableStream({
    pull(controller) {
      if (pushed >= 64) {
        controller.close();
        return;
      }
      pushed++;
      controller.enqueue(new TextEncoder().encode(chunk));
    },
  });
  const res = new Response(stream, { headers: { 'content-type': 'text/html' } });
  const text = await readCappedText(res, 4096);
  assert.ok(text.length >= 4096, 'reads up to the cap');
  assert.ok(text.length < 64 * 1024, `stops well short of the full body (got ${text.length})`);
});

test('MAX_HTML_BYTES stays bounded for endpoint discovery', () => {
  assert.ok(MAX_HTML_BYTES <= 262_144, 'discovery reads should stay small');
});

test('sendWebmention posts source/target form-encoded to the discovered endpoint', async (t) => {
  const calls = [];
  mockFetch(t, async (url, opts = {}) => {
    calls.push({ url: String(url), method: opts.method || 'GET', body: opts.body });
    if ((opts.method || 'GET') === 'GET') {
      return htmlResponse('<link rel="webmention" href="https://wm.example/endpoint">');
    }
    return new Response('accepted', { status: 202 });
  });

  const result = await sendWebmention('https://me.example/reads', 'https://target.example/post');
  assert.equal(result.success, true);
  assert.equal(result.endpoint, 'https://wm.example/endpoint');

  const post = calls.find((c) => c.method === 'POST');
  assert.ok(post, 'expected a POST to the endpoint');
  assert.equal(post.url, 'https://wm.example/endpoint');
  assert.equal(
    post.body.toString(),
    'source=https%3A%2F%2Fme.example%2Freads&target=https%3A%2F%2Ftarget.example%2Fpost'
  );
});

test('sendWebmention reports failure when discovery throws', async (t) => {
  mockFetch(t, async () => {
    throw new Error('boom');
  });
  const result = await sendWebmention('https://me.example/reads', 'https://target.example/post');
  assert.equal(result.success, false);
  assert.match(result.error, /discovery failed: boom/);
});

test('sendWebmention rejects non-http(s) endpoint schemes', async (t) => {
  mockFetch(t, async () =>
    htmlResponse('<link rel="webmention" href="ftp://wm.example/endpoint">')
  );
  const result = await sendWebmention('https://me.example/reads', 'https://target.example/post');
  assert.equal(result.success, false);
  assert.match(result.error, /unsupported endpoint scheme/);
});

test('sendWebmention surfaces non-2xx endpoint responses as failures', async (t) => {
  mockFetch(t, async (url, opts = {}) => {
    if ((opts.method || 'GET') === 'GET') {
      return htmlResponse('<link rel="webmention" href="https://wm.example/endpoint">');
    }
    return new Response('nope', { status: 500 });
  });
  const result = await sendWebmention('https://me.example/reads', 'https://target.example/post');
  assert.equal(result.success, false);
  assert.equal(result.status, 500);
});
