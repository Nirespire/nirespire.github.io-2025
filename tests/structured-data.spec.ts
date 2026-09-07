import { test, expect } from '@playwright/test';

// The Schema.org block in base.njk is JSON embedded in HTML. Nunjucks
// autoescaping is an HTML escaper, so interpolating values through it silently
// corrupted them for every JSON consumer — a post titled "How to Make a Q&A
// Chatbot..." published `"name": "How to Make a Q&amp;A Chatbot..."`, because a
// JSON parser reads entities literally rather than decoding them.
//
// These tests assert on the *parsed* JSON, which is what a search engine sees,
// so they fail on that corruption rather than on the raw markup.

const AMPERSAND_POST = '/blog/2018-07-11-how-to-make-a-qa-chatbot-with-machine-learning/';

const PAGES = [
  { name: 'home', url: '/', type: 'WebSite' },
  { name: 'blog index', url: '/blog/', type: 'WebSite' },
  { name: 'about', url: '/about/', type: 'WebSite' },
  { name: 'blog post', url: AMPERSAND_POST, type: 'BlogPosting' },
];

async function readJsonLd(page: import('@playwright/test').Page) {
  const raw = await page.locator('script[type="application/ld+json"]').innerText();
  return JSON.parse(raw);
}

test.describe('Schema.org JSON-LD', () => {
  for (const { name, url, type } of PAGES) {
    test(`${name} embeds parseable JSON-LD of the right type`, async ({ page }) => {
      await page.goto(url);
      const data = await readJsonLd(page);

      expect(data['@context']).toBe('https://schema.org');
      expect(data['@type']).toBe(type);
      expect(typeof data.name).toBe('string');
      expect(data.name.length).toBeGreaterThan(0);
      expect(typeof data.description).toBe('string');
      expect(data.url).toMatch(/^https:\/\/sanjaynair\.me\//);
    });
  }

  test('a title containing "&" survives as a literal ampersand, not an entity', async ({
    page,
  }) => {
    await page.goto(AMPERSAND_POST);
    const data = await readJsonLd(page);

    expect(data.name).toContain('Q&A');
    // The regression this guards: HTML entity escaping leaking into JSON.
    expect(data.name).not.toContain('&amp;');
    expect(data.name).not.toMatch(/&(amp|quot|#\d+);/);
  });

  test('a blog post carries the author and date fields', async ({ page }) => {
    await page.goto(AMPERSAND_POST);
    const data = await readJsonLd(page);

    expect(data.author).toMatchObject({ '@type': 'Person', name: 'Sanjay Nair' });
    expect(data.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(data.image).toMatch(/^https:\/\/sanjaynair\.me\//);
  });
});
