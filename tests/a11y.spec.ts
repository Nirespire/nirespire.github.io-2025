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

// Both themes are scanned. `theme-switcher.js` resolves the theme from
// `prefers-color-scheme` when no explicit choice is stored, so emulating the
// media query is enough to select one. This matters because the two palettes
// invert (`:root` vs `html.light` in styles.css): a color that clears WCAG AA
// against the dark background can fail against the light one, and vice versa,
// so scanning a single theme only ever checks half the site.
const THEMES = ['dark', 'light'] as const;

// Threshold ratchet: `critical` and `serious` violations fail the suite.
// Tighten to include `moderate` once any remaining lower-impact issues are
// cleared in follow-up PRs.
const FAILING_IMPACTS: Array<'critical' | 'serious' | 'moderate' | 'minor'> = [
  'critical',
  'serious',
];

async function scan(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  return results.violations.filter((v) =>
    FAILING_IMPACTS.includes(v.impact as (typeof FAILING_IMPACTS)[number])
  );
}

function describeViolations(where: string, violations: Awaited<ReturnType<typeof scan>>) {
  return (
    `${FAILING_IMPACTS.join('/')} a11y violations on ${where}:\n` +
    violations.map((v) => `  - ${v.id} (${v.impact}): ${v.help} — ${v.helpUrl}`).join('\n')
  );
}

for (const theme of THEMES) {
  test.describe(`Accessibility (axe-core, ${theme} theme)`, () => {
    test.use({ colorScheme: theme });

    for (const { name, url } of PAGES) {
      test(`${name} has no ${FAILING_IMPACTS.join('/')} violations`, async ({ page }) => {
        await page.goto(url);
        await freezeAnimations(page);

        const blocking = await scan(page);

        // Surface the offenders in the assertion message so CI logs are actionable.
        expect.soft(blocking, describeViolations(`${url} (${theme})`, blocking)).toEqual([]);
      });
    }

    test(`latest blog post has no ${FAILING_IMPACTS.join('/')} violations`, async ({ page }) => {
      await page.goto('/blog/');
      const firstPost = page.locator('article').first().getByRole('heading').getByRole('link');
      const href = await firstPost.getAttribute('href');
      expect(href, 'expected at least one blog post on /blog/').toBeTruthy();

      await page.goto(href!);
      await freezeAnimations(page);

      const blocking = await scan(page);

      expect
        .soft(blocking, describeViolations(`blog post ${href} (${theme})`, blocking))
        .toEqual([]);
    });

    // A tag detail page renders its own listing template (`tags/tag.njk`) rather
    // than reusing the blog index, so `/tags/` alone leaves it unscanned.
    test(`a tag page has no ${FAILING_IMPACTS.join('/')} violations`, async ({ page }) => {
      await page.goto('/tags/');
      const firstTag = page.locator('#tagCloud a').first();
      const href = await firstTag.getAttribute('href');
      expect(href, 'expected at least one tag on /tags/').toBeTruthy();

      await page.goto(href!);
      await freezeAnimations(page);

      const blocking = await scan(page);

      expect
        .soft(blocking, describeViolations(`tag page ${href} (${theme})`, blocking))
        .toEqual([]);
    });
  });
}
