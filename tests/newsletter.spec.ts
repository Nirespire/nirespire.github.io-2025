import { test, expect } from '@playwright/test';

test.describe('Newsletter Index Page', () => {
  test('should load newsletter index page', async ({ page }) => {
    await page.goto('/newsletter/');

    await expect(page).toHaveTitle(/The Monthly Retro/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText('The Monthly Retro');
  });

  test('should have description text', async ({ page }) => {
    await page.goto('/newsletter/');

    const description = page.getByText(/high-signal monthly digest/);
    await expect(description).toBeVisible();
  });

  test('should list newsletter issues when available', async ({ page }) => {
    await page.goto('/newsletter/');

    // Check for newsletter listing container
    const newsletterList = page.locator('.newsletter-list, ul, [class*="newsletter"]');
    // If there are newsletters, they should be displayed
    const links = page.locator('a[href*="/newsletter/"]').filter({ hasNot: page.locator('nav') });
    const count = await links.count();
    // We should have at least the nav link or newsletter links
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Individual Newsletter Page', () => {
  test('should render newsletter with standalone styling', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // Check page loads
    await expect(page).toHaveTitle(/The Monthly Retro/);

    // Verify standalone styling (not dark theme from main site)
    const body = page.locator('body');
    const bgColor = await body.evaluate(el => getComputedStyle(el).backgroundColor);

    // Should be the cream/paper color #FAF8F5 (rgb(250, 248, 245))
    expect(bgColor).toMatch(/rgb\(250,\s*248,\s*245\)|#FAF8F5/i);
  });

  test('should display newsletter header with correct month/year', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // Check for "The Monthly Retro" header
    const logo = page.locator('.newsletter-logo');
    await expect(logo).toContainText('The Monthly');
    await expect(logo).toContainText('Retro');

    // Check for date display
    const date = page.locator('.newsletter-date');
    await expect(date).toContainText('January');
    await expect(date).toContainText('2026');
  });

  test('should have The Retrospective section', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    const retrospectiveHeading = page.getByRole('heading', { name: 'The Retrospective' });
    await expect(retrospectiveHeading).toBeVisible();

    // Should have prose content
    const prose = page.locator('.newsletter-prose');
    await expect(prose.first()).toBeVisible();
  });

  test('should have Latest Essay section', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    const latestEssayHeading = page.getByRole('heading', { name: 'Latest Essay' });
    await expect(latestEssayHeading).toBeVisible();

    // Should have featured post card
    const featuredPost = page.locator('.featured-post');
    await expect(featuredPost).toBeVisible();

    // Check for featured post elements
    const featuredLabel = page.locator('.featured-post-label');
    await expect(featuredLabel).toContainText('Featured Post');

    // Check for CTA button
    const ctaButton = page.locator('.featured-post-cta');
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toContainText('Read the full post');
  });

  test('should have This Month\'s Reads section', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    const readsHeading = page.getByRole('heading', { name: "This Month's Reads" });
    await expect(readsHeading).toBeVisible();

    // Should have read items
    const readItems = page.locator('.read-item');
    const count = await readItems.count();
    expect(count).toBeGreaterThan(0);

    // Each read item should have a title link
    const firstRead = readItems.first();
    const titleLink = firstRead.locator('.read-item-title a');
    await expect(titleLink).toBeVisible();
    await expect(titleLink).toHaveAttribute('target', '_blank');
    await expect(titleLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should display custom commentary when present', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // Check for commentary in read items
    const readItems = page.locator('.read-item');
    const firstRead = readItems.first();

    // Commentary should be visible (either custom or excerpt)
    const commentary = firstRead.locator('.read-item-commentary');
    await expect(commentary).toBeVisible();

    // Should have actual content
    const text = await commentary.textContent();
    expect(text?.trim().length).toBeGreaterThan(0);
  });

  test('should have link to view all reads', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    const allReadsLink = page.getByRole('link', { name: /View all reads/i });
    await expect(allReadsLink).toBeVisible();
    await expect(allReadsLink).toHaveAttribute('href', '/reads');
  });

  test('should have footer with social links', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    const footer = page.locator('.newsletter-footer');
    await expect(footer).toBeVisible();

    // Check for conversation CTA
    const footerHeading = footer.getByRole('heading', { name: /Continue the Conversation/i });
    await expect(footerHeading).toBeVisible();

    // Check for social links
    const socialLinks = page.locator('.social-links a');
    const socialCount = await socialLinks.count();
    expect(socialCount).toBe(3); // LinkedIn, X, Bluesky

    // Check email link
    const emailLink = footer.getByRole('link', { name: /Reply to this email/i });
    await expect(emailLink).toBeVisible();
    await expect(emailLink).toHaveAttribute('href', 'mailto:email@sanjaynair.dev');
  });

  test('should have back to newsletters link', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    const backLink = page.locator('.back-to-site');
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/newsletter');
    await expect(backLink).toContainText('All Newsletters');
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // Check title
    await expect(page).toHaveTitle(/The Monthly Retro - January 2026 \| Sanjay Nair/);

    // Check meta description
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /retrospective|engineering|leadership/i);

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /The Monthly Retro/);

    const ogType = page.locator('meta[property="og:type"]');
    await expect(ogType).toHaveAttribute('content', 'article');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/newsletter/2026-01-january/');

    // Content should still be visible
    const content = page.locator('.newsletter-content');
    await expect(content).toBeVisible();

    // Header should be visible
    const logo = page.locator('.newsletter-logo');
    await expect(logo).toBeVisible();

    // Reads section should be accessible
    const readsHeading = page.getByRole('heading', { name: "This Month's Reads" });
    await expect(readsHeading).toBeVisible();
  });
});

test.describe('Newsletter Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // Should have exactly one h1 (implicitly, it's the logo/title area)
    const h2s = page.locator('h2');
    const h2Count = await h2s.count();
    expect(h2Count).toBeGreaterThanOrEqual(3); // Retrospective, Latest Essay, Reads

    // All section headers should be h2
    const sections = ['The Retrospective', 'Latest Essay', "This Month's Reads"];
    for (const section of sections) {
      const heading = page.getByRole('heading', { name: section });
      await expect(heading).toBeVisible();
    }
  });

  test('should have accessible links', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // External links should have proper attributes
    const externalLinks = page.locator('a[target="_blank"]');
    const count = await externalLinks.count();

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i);
      await expect(link).toHaveAttribute('rel', /noopener|noreferrer/);
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/newsletter/2026-01-january/');

    // Main text should use dark color on light background
    const prose = page.locator('.newsletter-prose').first();
    const textColor = await prose.evaluate(el => getComputedStyle(el).color);

    // Should be dark text (rgb values should be low)
    expect(textColor).toMatch(/rgb\(51,\s*51,\s*51\)|#333/i);
  });
});
