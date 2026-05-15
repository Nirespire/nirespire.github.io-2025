const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const {
  fetchWebmentions,
  setFetchForTest,
} = require('../../scripts/fetch-webmentions.js');

let tmpFile;
const originalToken = process.env.WEBMENTION_IO_TOKEN;

beforeEach(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fetch-webmentions-test-'));
  tmpFile = path.join(dir, 'webmentions.json');
  process.env.WEBMENTIONS_OUTPUT_PATH = tmpFile;
});

afterEach(async () => {
  delete process.env.WEBMENTIONS_OUTPUT_PATH;
  if (originalToken === undefined) {
    delete process.env.WEBMENTION_IO_TOKEN;
  } else {
    process.env.WEBMENTION_IO_TOKEN = originalToken;
  }
  if (tmpFile) {
    await fs.rm(path.dirname(tmpFile), { recursive: true, force: true });
  }
});

test('writes dummy data when WEBMENTION_IO_TOKEN is unset', async () => {
  delete process.env.WEBMENTION_IO_TOKEN;

  const result = await fetchWebmentions();
  assert.deepEqual(result.all, []);
  assert.ok(typeof result.timestamp === 'number');

  const written = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.deepEqual(written.all, []);
  assert.ok(typeof written.timestamp === 'number');
});

test('fetches and persists links when token is set', async () => {
  process.env.WEBMENTION_IO_TOKEN = 'fake-token';

  const fakeLinks = [
    { source: 'https://a.example/', activity: { type: 'like' } },
    { source: 'https://b.example/', activity: { type: 'reply' } },
  ];

  let calledUrl;
  setFetchForTest(async (url) => {
    calledUrl = url;
    return {
      ok: true,
      statusText: 'OK',
      json: async () => ({ links: fakeLinks }),
    };
  });

  const result = await fetchWebmentions();
  assert.equal(result.all.length, 2);
  assert.deepEqual(result.all[0].activity, { type: 'like' });
  assert.ok(calledUrl.includes('domain=sanjaynair.me'));
  assert.ok(calledUrl.includes('token=fake-token'));

  const written = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(written.all.length, 2);
});

test('throws when the API returns a non-ok response', async () => {
  process.env.WEBMENTION_IO_TOKEN = 'fake-token';

  setFetchForTest(async () => ({
    ok: false,
    statusText: 'Service Unavailable',
    json: async () => ({}),
  }));

  await assert.rejects(fetchWebmentions(), /Service Unavailable/);
});
