import { test, expect } from '@playwright/test';

test.describe('Wide-screen layout centering', () => {
  const WIDE_VIEWPORT = { width: 1920, height: 900 };
  const TOLERANCE_PX = 20; // allow for scrollbar width differences

  for (const path of ['/', '/blog/', '/about/']) {
    test(`content is horizontally centered on ${path} at 1920px`, async ({ page }) => {
      await page.setViewportSize(WIDE_VIEWPORT);
      await page.goto(path);

      const main = page.locator('main');
      const box = await main.boundingBox();
      expect(box).not.toBeNull();

      const leftMargin = box!.x;
      const rightMargin = WIDE_VIEWPORT.width - box!.x - box!.width;

      expect(Math.abs(leftMargin - rightMargin)).toBeLessThan(TOLERANCE_PX);
    });
  }
});

test.describe('Skip to main content link', () => {
  test('is the first tab stop and reveals on focus, targeting <main>', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    // Visually hidden (sr-only) until focused.
    await expect(skipLink).not.toBeInViewport();

    // First Tab lands on the skip link and makes it visible.
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    // Its target exists and is the main landmark.
    const target = page.locator('#main-content');
    await expect(target).toHaveCount(1);
    expect(await target.evaluate((el) => el.tagName)).toBe('MAIN');
  });
});
