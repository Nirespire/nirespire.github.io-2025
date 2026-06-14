import { test, expect } from '@playwright/test';

const TIED_NOTE = '/notes/2026-06-13-human-effort/';
const STANDALONE_NOTE = '/notes/2026-06-10-reading-as-thinking/';
const TIED_READ_URL = 'https://tombedor.dev/human-attention-and-human-effort/';

test.describe('Notes index', () => {
  test('should load and list notes', async ({ page }) => {
    await page.goto('/notes/');

    await expect(page).toHaveTitle(/Notes/);
    await expect(page.getByRole('heading', { name: 'Notes', level: 1 })).toBeVisible();

    const articles = await page.locator('article').all();
    expect(articles.length).toBeGreaterThan(0);

    // At least one card links through to an individual note.
    const noteLinks = page.getByRole('link', { name: 'Read my note →' });
    expect(await noteLinks.count()).toBeGreaterThan(0);
  });

  test('should distinguish tied and standalone notes', async ({ page }) => {
    await page.goto('/notes/');
    // Tied notes surface their source with a link to the external read inside the heading.
    const sourceLink = page.locator(`a[href="${TIED_READ_URL}"]`).first();
    await expect(sourceLink).toBeVisible();
    expect(await sourceLink.getAttribute('target')).toBe('_blank');
    expect(await sourceLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});

test.describe('Individual note page (tied to a read)', () => {
  test('should render the source read metadata and no excerpt', async ({ page }) => {
    await page.goto(TIED_NOTE);

    await expect(
      page.getByRole('heading', {
        name: 'Note on If You are Asking for Human Attention, Demonstrate Human Effort',
        level: 1,
      })
    ).toBeVisible();

    // The h1 itself links to the external read.
    const readLink = page.locator(`a[href="${TIED_READ_URL}"]`);
    await expect(readLink.first()).toBeVisible();
    expect(await readLink.first().getAttribute('target')).toBe('_blank');
    expect(await readLink.first().getAttribute('rel')).toBe('noopener noreferrer');

    // "read on" date metadata appears in the meta line.
    await expect(page.getByText('read on', { exact: false })).toBeVisible();

    // Back-to-notes link.
    await expect(page.getByRole('link', { name: '← Back to all notes' })).toBeVisible();
  });
});

test.describe('Individual note page (standalone)', () => {
  test('should render without a source-read aside', async ({ page }) => {
    await page.goto(STANDALONE_NOTE);

    await expect(
      page.getByRole('heading', { name: 'Note from June 10, 2026', level: 1 })
    ).toBeVisible();

    await expect(page.getByRole('link', { name: '← Back to all notes' })).toBeVisible();
  });
});
