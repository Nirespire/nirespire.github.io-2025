const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  splitLinkHeader,
  findWebmentionInLinkHeader,
  findWebmentionInHtml,
} = require('../../scripts/send-webmentions.js');

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
