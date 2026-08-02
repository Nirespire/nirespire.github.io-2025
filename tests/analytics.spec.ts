import { test, expect } from '@playwright/test';

// The whole umami integration rests on one property: it is off unless
// UMAMI_WEBSITE_ID is set at build time. The dev server these tests run against
// never sets it, so local runs, CI, Lighthouse and PR previews must all be
// completely analytics-free — no tracker request, and a CSP identical to the
// one shipped before analytics existed.
test.describe('Analytics (disabled build)', () => {
  const pages = ['/', '/blog/2025-07-10-genai-for-leaders/'];

  for (const path of pages) {
    test(`${path} ships no umami tracker`, async ({ page }) => {
      await page.goto(path);

      await expect(page.locator('script[data-website-id]')).toHaveCount(0);

      const csp = await page
        .locator('meta[http-equiv="Content-Security-Policy"]')
        .getAttribute('content');
      expect(csp).not.toContain('umami');
    });
  }

  test('trackEvent is defined and is a safe no-op without the tracker', async ({ page }) => {
    await page.goto('/');

    const result = await page.evaluate(() => {
      const fn = (window as unknown as { trackEvent?: unknown }).trackEvent;
      if (typeof fn !== 'function') return 'missing';
      // Must not throw when window.umami was never loaded.
      (fn as (name: string, data?: unknown) => void)('test-event', { a: 1 });
      return 'ok';
    });

    expect(result).toBe('ok');
  });

  // These attributes are inert markup that umami reads only when it loads, so
  // they render on every build — enabled or not.
  test('share links carry declarative umami event attributes', async ({ page }) => {
    await page.goto('/blog/2025-07-10-genai-for-leaders/');

    const networks = await page
      .locator('a.social-share-link[data-umami-event="share"]')
      .evaluateAll((links) => links.map((el) => el.getAttribute('data-umami-event-network')));

    expect(networks.sort()).toEqual(['email', 'linkedin', 'twitter']);
  });

  test('the theme toggle still works with analytics absent', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const before = await html.getAttribute('class');
    await page.locator('#theme-toggle').click();

    await expect(html).not.toHaveClass(before ?? '');
  });
});
