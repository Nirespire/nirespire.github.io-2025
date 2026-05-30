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
