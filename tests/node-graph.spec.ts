import { test, expect } from '@playwright/test';

test.describe('Node-graph background', () => {
  test.use({ reducedMotion: 'reduce' }); // deterministic: static frame, no rAF loop

  test('canvas is present, hidden from a11y tree, and non-blocking', async ({ page }) => {
    await page.goto('/');

    const canvas = page.locator('#node-graph-bg');
    await expect(canvas).toHaveAttribute('aria-hidden', 'true');

    const styles = await canvas.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { pointerEvents: cs.pointerEvents, zIndex: cs.zIndex, position: cs.position };
    });
    expect(styles.pointerEvents).toBe('none');
    expect(styles.position).toBe('fixed');
    expect(Number(styles.zIndex)).toBeLessThan(0);
  });

  test('does not block interaction with the page', async ({ page }) => {
    await page.goto('/');

    // The full-viewport canvas overlays the nav, but pointer-events:none means
    // links underneath it still receive clicks.
    await page.getByRole('link', { name: 'Blog', exact: true }).click();
    await expect(page).toHaveURL(/\/blog\/?$/);
  });
});
