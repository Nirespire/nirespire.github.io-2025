import { test, expect } from '@playwright/test';

test.describe('Reads page', () => {
  test('should load and display article list', async ({ page }) => {
    await page.goto('/reads/');

    // Check page title - includes site name
    await expect(page).toHaveTitle(/All Reads/);
    const heading = page.getByRole('heading', { level: 1 });

    // Check source links are present
    const sourceLinks = [
      { text: 'Hacker News', href: 'https://news.ycombinator.com/' },
      { text: 'TLDR.tech', href: 'https://tldr.tech/' },
      { text: 'Software Lead Weekly', href: 'https://softwareleadweekly.com/' }
    ];

    for (const link of sourceLinks) {
      const sourceLink = page.getByRole('link', { name: link.text });
      await expect(sourceLink).toBeVisible();
      expect(await sourceLink.getAttribute('href')).toBe(link.href);
      expect(await sourceLink.getAttribute('target')).toBe('_blank');
      expect(await sourceLink.getAttribute('rel')).toBe('noopener noreferrer');
    }
  });

  test('should display articles with correct structure', async ({ page }) => {
    await page.goto('/reads/');

    // Get all articles
    const articles = await page.locator('article').all();
    expect(articles.length).toBeGreaterThan(0);

    // Check first article structure
    const firstArticle = articles[0];
    
    // Title should be visible and clickable
    const title = firstArticle.getByRole('heading');
    await expect(title).toBeVisible();
    
    // Date should be present and in correct format
    const date = firstArticle.locator('p.text-sm');
    await expect(date).toBeVisible();
    const dateText = await date.textContent();
    expect(dateText).toMatch(/Read on [A-Z][a-z]+ \d{1,2}, \d{4}/);

    // Article should have either excerpt or link
    const excerpt = firstArticle.locator('p.text-text-main');
    const readMoreLink = firstArticle.getByRole('link', { name: 'Read more →' });
    
    if (await excerpt.isVisible()) {
      expect(await excerpt.textContent()).not.toBe('');
    }
    await expect(readMoreLink).toBeVisible();
    expect(await readMoreLink.getAttribute('target')).toBe('_blank');
    expect(await readMoreLink.getAttribute('rel')).toBe('noopener noreferrer');
  });
});