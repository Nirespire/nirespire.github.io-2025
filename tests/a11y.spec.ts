import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Pages that should pass automated accessibility checks. Blog posts use the
// same `post.njk` layout, so scanning one representative post is sufficient
// coverage for the layout itself.
const PAGES = [
  { name: 'home', url: '/' },
  { name: 'blog index', url: '/blog/' },
  { name: 'about', url: '/about/' },
  { name: 'uses', url: '/uses/' },
  { name: 'reads', url: '/reads/' },
  { name: 'tags index', url: '/tags/' },
  { name: '404', url: '/this-page-does-not-exist/' },
];

test.describe('Accessibility (axe-core)', () => {
  for (const { name, url } of PAGES) {
    test(`${name} has no serious or critical violations`, async ({ page }) => {
      await page.goto(url);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical'
      );

      // Surface the offenders in the assertion message so CI logs are actionable.
      expect
        .soft(
          blocking,
          `Serious/critical a11y violations on ${url}:\n` +
            blocking
              .map((v) => `  - ${v.id} (${v.impact}): ${v.help} — ${v.helpUrl}`)
              .join('\n')
        )
        .toEqual([]);
    });
  }

  test('latest blog post has no serious or critical violations', async ({ page }) => {
    await page.goto('/blog/');
    const firstPost = page.locator('article').first().getByRole('heading').getByRole('link');
    const href = await firstPost.getAttribute('href');
    expect(href, 'expected at least one blog post on /blog/').toBeTruthy();

    await page.goto(href!);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect
      .soft(
        blocking,
        `Serious/critical a11y violations on blog post ${href}:\n` +
          blocking.map((v) => `  - ${v.id} (${v.impact}): ${v.help} — ${v.helpUrl}`).join('\n')
      )
      .toEqual([]);
  });
});
