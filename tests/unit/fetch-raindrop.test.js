const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

const { main, setFetchForTest, toIsoOrNull } = require('../../scripts/fetch-raindrop.js');

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
    note: '',
    dateAdded: new Date('2024-05-01T12:00:00Z').toISOString(),
    tags: ['reading', 'js'],
  });
});

test('persists item.note as its own field without excerpt fallback', async () => {
  setFetchForTest(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      items: [
        {
          title: 'Note-only article',
          link: 'https://example.com/note',
          note: 'my commentary on this read',
          created: '2024-01-01T00:00:00Z',
          tags: [],
        },
        {
          title: 'Article with both',
          link: 'https://example.com/both',
          excerpt: 'the article excerpt',
          note: 'and my note',
          created: '2024-01-02T00:00:00Z',
          tags: [],
        },
      ],
      count: 2,
    }),
    text: async () => '',
  }));

  await main();
  const data = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(data[0].excerpt, '');
  assert.equal(data[0].note, 'my commentary on this read');
  assert.equal(data[1].excerpt, 'the article excerpt');
  assert.equal(data[1].note, 'and my note');
});

test('toIsoOrNull normalizes valid dates and tolerates bad ones', () => {
  assert.equal(toIsoOrNull('2024-05-01T12:00:00Z'), '2024-05-01T12:00:00.000Z');
  assert.equal(toIsoOrNull(undefined), null);
  assert.equal(toIsoOrNull('not-a-date'), null);
});

test('a single item with a missing/invalid date does not abort the whole fetch', async () => {
  setFetchForTest(async () => ({
    ok: true,
    status: 200,
    statusText: 'OK',
    json: async () => ({
      items: [
        { title: 'Bad date', link: 'https://example.com/bad', created: 'nope', tags: [] },
        { title: 'No date', link: 'https://example.com/none', tags: [] },
        {
          title: 'Good date',
          link: 'https://example.com/good',
          created: '2024-01-01T00:00:00Z',
          tags: [],
        },
      ],
      count: 3,
    }),
    text: async () => '',
  }));

  await main();
  const data = JSON.parse(await fs.readFile(tmpFile, 'utf-8'));
  assert.equal(data.length, 3);
  assert.equal(data[0].dateAdded, null);
  assert.equal(data[1].dateAdded, null);
  assert.equal(data[2].dateAdded, '2024-01-01T00:00:00.000Z');
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
