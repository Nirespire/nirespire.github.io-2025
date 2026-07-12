import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The theme is applied by a deferred script that toggles the `.light` class,
// and the body/links animate color over 0.3s. Scanning immediately after load
// can catch a mid-transition color (flaky on WebKit), so freeze transitions and
// animations to their settled state before running axe.
async function freezeAnimations(page: Page) {
  await page.addStyleTag({
    content: '*, *::before, *::after { transition: none !important; animation: none !important; }',
  });
}

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

// Threshold ratchet: `critical` and `serious` violations fail the suite.
// Tighten to include `moderate` once any remaining lower-impact issues are
// cleared in follow-up PRs.
const FAILING_IMPACTS: Array<'critical' | 'serious' | 'moderate' | 'minor'> = [
  'critical',
  'serious',
];

test.describe('Accessibility (axe-core)', () => {
  for (const { name, url } of PAGES) {
    test(`${name} has no ${FAILING_IMPACTS.join('/')} violations`, async ({ page }) => {
      await page.goto(url);
      await freezeAnimations(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      const blocking = results.violations.filter((v) =>
        FAILING_IMPACTS.includes(v.impact as (typeof FAILING_IMPACTS)[number])
      );

      // Surface the offenders in the assertion message so CI logs are actionable.
      expect
        .soft(
          blocking,
          `${FAILING_IMPACTS.join('/')} a11y violations on ${url}:\n` +
            blocking.map((v) => `  - ${v.id} (${v.impact}): ${v.help} — ${v.helpUrl}`).join('\n')
        )
        .toEqual([]);
    });
  }

  test(`latest blog post has no ${FAILING_IMPACTS.join('/')} violations`, async ({ page }) => {
    await page.goto('/blog/');
    const firstPost = page.locator('article').first().getByRole('heading').getByRole('link');
    const href = await firstPost.getAttribute('href');
    expect(href, 'expected at least one blog post on /blog/').toBeTruthy();

    await page.goto(href!);
    await freezeAnimations(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const blocking = results.violations.filter((v) =>
      FAILING_IMPACTS.includes(v.impact as (typeof FAILING_IMPACTS)[number])
    );

    expect
      .soft(
        blocking,
        `${FAILING_IMPACTS.join('/')} a11y violations on blog post ${href}:\n` +
          blocking.map((v) => `  - ${v.id} (${v.impact}): ${v.help} — ${v.helpUrl}`).join('\n')
      )
      .toEqual([]);
  });
});
