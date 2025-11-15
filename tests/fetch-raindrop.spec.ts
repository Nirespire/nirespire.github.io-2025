import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const { isLinkValid, setFetchForTest, main } = require('../scripts/fetch-raindrop.js');

test('isLinkValid returns false for 404 and true otherwise', async () => {
  // HEAD returning 404 -> invalid
  const stub404 = async (_url: string, opts?: any) => {
    return { status: 404 };
  };
  setFetchForTest(stub404);
  expect(await isLinkValid('http://example.com/404')).toBe(false);

  // HEAD returning 200 -> valid
  const stub200 = async (_url: string, opts?: any) => {
    return { status: 200 };
  };
  setFetchForTest(stub200);
  expect(await isLinkValid('http://example.com/200')).toBe(true);
});

test('main fetches items and writes transformed output file', async () => {
  // Ensure env vars are present for script
  process.env.RAINDROP_TEST_TOKEN = 'test-token';
  process.env.RAINDROP_SEARCH_TAG = 'test-tag';

  // Path where script writes output: use a temp file so we don't overwrite real data
  const outputPath = path.join(os.tmpdir(), `raindrop-test-${Date.now()}.json`);
  process.env.RAINDROP_OUTPUT_PATH = outputPath;

  // Stub fetch: return an API response for Raindrop and 200 for HEAD link checks
  const stubFetch = async (url: any, opts?: any) => {
    const method = opts && opts.method ? String(opts.method).toUpperCase() : 'GET';
    if (method === 'HEAD') {
      return { status: 200 };
    }

    // API GET
    if (new URL(String(url)).hostname === 'api.raindrop.io') {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        json: async () => ({
          items: [
            {
              title: 'Stubbed Item',
              link: 'http://example.com/item',
              excerpt: 'An example note',
              created: Date.now(),
              tags: ['test'],
            },
          ],
          count: 1,
        }),
        text: async () => '',
      };
    }

    return { status: 200 };
  };

  setFetchForTest(stubFetch);

  // Run main and verify file written
  try {
    await main();
    const raw = await fs.readFile(outputPath, 'utf8');
    const data = JSON.parse(raw);
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('title', 'Stubbed Item');
    expect(data[0]).toHaveProperty('url', 'http://example.com/item');
  } finally {
    // Cleanup - remove the generated file if present
    try {
      await fs.unlink(outputPath);
    } catch (e) {
      // ignore
    }
  }
});
