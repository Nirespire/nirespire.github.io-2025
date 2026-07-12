const { test } = require('node:test');
const assert = require('node:assert');

const { safeUrl, sanitizeMention, processWebmentions } = require('../../src/_data/webmentions.js');

test('safeUrl keeps http and https URLs', () => {
  assert.strictEqual(safeUrl('https://example.com/a'), 'https://example.com/a');
  assert.strictEqual(safeUrl('http://example.com'), 'http://example.com');
});

test('safeUrl strips dangerous or malformed URLs', () => {
  assert.strictEqual(safeUrl('javascript:alert(1)'), '');
  assert.strictEqual(safeUrl('data:text/html,<script>'), '');
  assert.strictEqual(safeUrl('not a url'), '');
  assert.strictEqual(safeUrl(undefined), '');
  assert.strictEqual(safeUrl(null), '');
});

test('sanitizeMention neutralizes url, author.url and author.photo', () => {
  const out = sanitizeMention({
    url: 'javascript:alert(1)',
    author: {
      name: 'Mallory',
      url: 'https://ok.example/profile',
      photo: 'javascript:alert(2)',
    },
    activity: { type: 'like' },
  });
  assert.strictEqual(out.url, '');
  assert.strictEqual(out.author.url, 'https://ok.example/profile');
  assert.strictEqual(out.author.photo, '');
  assert.strictEqual(out.author.name, 'Mallory');
});

test('processWebmentions sanitizes while categorizing by activity type', () => {
  const result = processWebmentions([
    { url: 'javascript:alert(1)', author: {}, activity: { type: 'like' } },
    { url: 'https://ok.example/repost', author: {}, activity: { type: 'repost' } },
    { url: 'https://ok.example/reply', author: {}, activity: { type: 'reply' } },
    { url: 'https://ok.example/mention', author: {}, activity: { type: 'mention' } },
  ]);
  assert.strictEqual(result.likes.length, 1);
  assert.strictEqual(result.likes[0].url, '');
  assert.strictEqual(result.reposts.length, 1);
  assert.strictEqual(result.replies.length, 2);
});
