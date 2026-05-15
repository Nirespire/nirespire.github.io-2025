const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { main, setFetchForTest } = require('../../scripts/fetch-raindrop.js');

let tmpFile;
const originalToken = process.env.RAINDROP_TEST_TOKEN;
const originalTag = process.env.RAINDROP_SEARCH_TAG;

beforeEach(async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'fetch-raindrop-test-'));
  tmpFile = path.join(dir, 'raindrop.json');
  process.env.RAINDROP_OUTPUT_PATH = tmpFile;
  process.env.RAINDROP_TEST_TOKEN = 'fake-token';
  process.env.RAINDROP_SEARCH_TAG = 'reading';
});

afterEach(async () => {
  delete process.env.RAINDROP_OUTPUT_PATH;
  if (originalToken === undefined) delete process.env.RAINDROP_TEST_TOKEN;
  else process.env.RAINDROP_TEST_TOKEN = originalToken;
  if (originalTag === undefined) delete process.env.RAINDROP_SEARCH_TAG;
  else process.env.RAINDROP_SEARCH_TAG = originalTag;
  if (tmpFile) {
    await fs.rm(path.dirname(tmpFile), { recursive: true, force: true });
  }
});

test('transforms raindrop items into the public shape', async () => {
  setFetchForTest(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      items: [
        {
          title: 'Article One',
          link: 'https://example.com/1',
          excerpt: 'a short excerpt',
          created: '2024-05-01T12:00:00Z',
          tags: ['reading', 'js'],
        },
      ],
      count: 1,
    }),
    text: async () => '',
  }));

  await main();

  const data = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(data.length, 1);
  assert.deepEqual(data[0], {
    title: 'Article One',
    url: 'https://example.com/1',
    excerpt: 'a short excerpt',
    dateAdded: new Date('2024-05-01T12:00:00Z').toISOString(),
    tags: ['reading', 'js'],
  });
});

test('falls back to item.note when excerpt is missing', async () => {
  setFetchForTest(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      items: [
        {
          title: 'Note-only article',
          link: 'https://example.com/note',
          note: 'fallback note body',
          created: '2024-01-01T00:00:00Z',
          tags: [],
        },
      ],
      count: 1,
    }),
    text: async () => '',
  }));

  await main();
  const data = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(data[0].excerpt, 'fallback note body');
});

test('paginates until the reported count is reached', async () => {
  let callCount = 0;
  setFetchForTest(async (url) => {
    callCount++;
    const u = new URL(String(url));
    const page = Number(u.searchParams.get('page'));
    const items = [
      {
        title: `item-${page}`,
        link: `https://example.com/${page}`,
        excerpt: '',
        created: '2024-01-01T00:00:00Z',
        tags: [],
      },
    ];
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({ items, count: 3 }),
      text: async () => '',
    };
  });

  await main();
  // 3 items total at 1-per-page = 3 fetch calls
  assert.equal(callCount, 3);
  const data = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(data.length, 3);
  assert.deepEqual(
    data.map((i) => i.title),
    ['item-0', 'item-1', 'item-2']
  );
});
