import { test, expect } from '@playwright/test';

test.describe('Wedding archive', () => {
  test('page loads and is noindex', async ({ page }) => {
    const response = await page.goto('/archive/wedding/');
    expect(response?.status()).toBe(200);

    // noindex meta tag must be present
    const robotsMeta = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robotsMeta).toContain('noindex');
  });

  test('all images are served locally (no external CDN references)', async ({ page }) => {
    await page.goto('/archive/wedding/');

    // Collect src attributes of all <img> tags on the page
    const imgSrcs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('img')).map((el) => el.getAttribute('src') ?? '')
    );

    const externalHosts = ['res.cloudinary.com', 'fonts.gstatic.com', 'maxcdn.bootstrapcdn.com'];
    for (const src of imgSrcs) {
      for (const host of externalHosts) {
        expect(src, `img src "${src}" must not reference external CDN "${host}"`).not.toContain(
          host
        );
      }
    }
  });

  test('archive path is absent from sitemap', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
    const body = await response?.text();
    expect(body).not.toContain('/archive/');
  });
});
