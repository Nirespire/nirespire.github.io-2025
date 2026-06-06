import { test, expect } from '@playwright/test';

test.describe('Hallucinations page', () => {
  test('renders post links that resolve to real blog posts', async ({ page }) => {
    await page.goto('/hallucination/');

    const links = page.locator('.space-y-8 a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);

    const hrefs = await links.evaluateAll((els) => els.map((el) => (el as HTMLAnchorElement).href));

    for (const href of hrefs) {
      const response = await page.goto(href);
      expect(response?.status(), `Expected 200 for ${href}`).toBe(200);
      await expect(page.locator('article'), `Expected <article> at ${href}`).toBeVisible();
    }
  });

  test('post links are derived from filenames, not title slugs', async ({ page }) => {
    await page.goto('/hallucination/');

    const links = page.locator('.space-y-8 a');
    const hrefs: string[] = await links.evaluateAll((els) =>
      els.map((el) => new URL((el as HTMLAnchorElement).href).pathname)
    );

    for (const href of hrefs) {
      expect(href).toMatch(/^\/blog\/\d{4}-\d{2}-\d{2}-/);
    }
  });
});
