import { test, expect } from '@playwright/test';

test.describe('Tag cloud page', () => {
  test('should not have excessively large tags', async ({ page }) => {
    await page.goto('/tags');

    // Find the tag cloud container
    const tagCloud = page.locator('#tagCloud');
    await expect(tagCloud).toBeVisible();

    // Find the "ai" tag specifically.
    const tag = tagCloud.getByRole('link', { name: 'ai', exact: true });
    await expect(tag).toBeVisible();

    // Get the computed font size of the tag
    const fontSize = await tag.evaluate(element => {
      return window.getComputedStyle(element).getPropertyValue('font-size');
    });

    // The font size is returned as a string, e.g., "48px".
    // I need to parse it to a number to compare it.
    const fontSizePx = parseFloat(fontSize);

    // The cap is 3rem. I need to convert this to pixels to compare.
    // The default font size of the root element is usually 16px.
    // So, 3rem = 3 * 16 = 48px.
    const maxSizePx = 3 * 16;

    // Assert that the font size is less than or equal to the max size.
    // I'll add a small tolerance to account for any minor rendering differences.
    expect(fontSizePx).toBeLessThanOrEqual(maxSizePx + 2);
  });
});
