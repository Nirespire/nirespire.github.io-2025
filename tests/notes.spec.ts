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
    await expect(page.getByText('on a shared read').first()).toBeVisible();
    await expect(page.getByText('standalone note').first()).toBeVisible();
  });
});

test.describe('Individual note page (tied to a read)', () => {
  test('should render the source read and a backlink', async ({ page }) => {
    await page.goto(TIED_NOTE);

    await expect(
      page.getByRole('heading', { name: "Demonstrate the effort you're asking for", level: 1 })
    ).toBeVisible();

    // "A note on:" aside links to the external read.
    await expect(page.getByText('A note on:')).toBeVisible();
    const readLink = page.locator(`a[href="${TIED_READ_URL}"]`);
    await expect(readLink.first()).toBeVisible();
    expect(await readLink.first().getAttribute('target')).toBe('_blank');
    expect(await readLink.first().getAttribute('rel')).toBe('noopener noreferrer');

    // Related posts backlink resolves to a blog post.
    await expect(page.getByRole('heading', { name: 'Related posts' })).toBeVisible();
    const backlink = page.locator('a[href="/blog/2025-10-28-coding-with-copilot-pt2/"]');
    await expect(backlink.first()).toBeVisible();

    // Back-to-notes link.
    await expect(page.getByRole('link', { name: '← Back to all notes' })).toBeVisible();
  });
});

test.describe('Individual note page (standalone)', () => {
  test('should render without a source-read aside', async ({ page }) => {
    await page.goto(STANDALONE_NOTE);

    await expect(
      page.getByRole('heading', { name: "Reading is thinking in someone else's head", level: 1 })
    ).toBeVisible();

    await expect(page.getByText('A note on:')).toHaveCount(0);
    await expect(page.getByRole('link', { name: '← Back to all notes' })).toBeVisible();
  });
});
