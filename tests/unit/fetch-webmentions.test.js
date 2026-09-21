const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { fetchWebmentions, setFetchForTest } = require('../../scripts/fetch-webmentions.js');

const withToken = (links) =>
  setFetchForTest(async () => ({
    ok: true,
    statusText: 'OK',
    json: async () => ({ links }),
  }));

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

// Regression guard: update-webmentions.yml commits whatever this script writes
// and dispatches a full build + E2E + Pages deploy whenever the file changes.
// Stamping `timestamp` with Date.now() on every run made the file differ even
// when webmention.io returned an identical list, so the daily job committed a
// one-line no-op and redeployed the site every day. The bytes must be stable
// across runs when the mention list has not changed.
// Seeded with a fixed past timestamp rather than by running twice back to
// back: two consecutive runs can land in the same millisecond, so a
// `Date.now()` comparison would pass against the buggy code by coincidence.
const SEEDED_TIMESTAMP = 1700000000000;

async function seed(links) {
  await fs.writeFile(
    tmpFile,
    JSON.stringify({ all: links, timestamp: SEEDED_TIMESTAMP }, null, 2) + '\n'
  );
  return fs.readFile(tmpFile, 'utf-8');
}

test('rewrites byte-identical output when the mention list is unchanged (no token)', async () => {
  delete process.env.WEBMENTION_IO_TOKEN;
  const before = await seed([]);

  const result = await fetchWebmentions();

  assert.equal(result.timestamp, SEEDED_TIMESTAMP, 'an unchanged list must reuse the timestamp');
  assert.equal(
    await fs.readFile(tmpFile, 'utf-8'),
    before,
    'a second run must not produce a diff to commit'
  );
});

test('rewrites byte-identical output when the mention list is unchanged (with token)', async () => {
  process.env.WEBMENTION_IO_TOKEN = 'fake-token';
  const links = [{ source: 'https://a.example/', activity: { type: 'like' } }];
  const before = await seed(links);

  // A fresh but equal payload — what webmention.io returns on a quiet day.
  withToken([{ source: 'https://a.example/', activity: { type: 'like' } }]);
  const result = await fetchWebmentions();

  assert.equal(result.timestamp, SEEDED_TIMESTAMP, 'an unchanged list must reuse the timestamp');
  assert.equal(
    await fs.readFile(tmpFile, 'utf-8'),
    before,
    'a second run must not produce a diff to commit'
  );
});

test('advances the timestamp when the mention list actually changes', async () => {
  process.env.WEBMENTION_IO_TOKEN = 'fake-token';
  await seed([{ source: 'https://a.example/', activity: { type: 'like' } }]);

  withToken([
    { source: 'https://a.example/', activity: { type: 'like' } },
    { source: 'https://b.example/', activity: { type: 'reply' } },
  ]);
  const result = await fetchWebmentions();

  assert.equal(result.all.length, 2);
  assert.notEqual(
    result.timestamp,
    SEEDED_TIMESTAMP,
    'a real change must refresh the timestamp, not reuse the old one'
  );
  const written = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(written.all.length, 2);
});

test('starts a fresh timestamp when the existing file is corrupt', async () => {
  delete process.env.WEBMENTION_IO_TOKEN;

  await fs.writeFile(tmpFile, 'not json at all');
  const result = await fetchWebmentions();

  assert.deepEqual(result.all, []);
  assert.ok(typeof result.timestamp === 'number');
});

test('ends the data file with a trailing newline', async () => {
  delete process.env.WEBMENTION_IO_TOKEN;

  await fetchWebmentions();
  const raw = await fs.readFile(tmpFile, 'utf-8');
  assert.ok(raw.endsWith('\n'));
});
