import { test, expect } from '@playwright/test';

test.describe('Commonplace page', () => {
  test('should display header and search bar', async ({ page }) => {
    await page.goto('/commonplace/');
    
    // Check header
    const header = page.getByRole('heading', { name: 'Commonplace Book' });
    await expect(header).toBeVisible();
    
    // Check search input
    const searchInput = page.getByPlaceholder('Search quotes and sources...');
    await expect(searchInput).toBeVisible();
  });

  test('should display quotes with sources', async ({ page }) => {
    await page.goto('/commonplace/');
    
    // Check quotes exist
    const entries = page.locator('.commonplace-entry');
    await expect(entries.first()).toBeVisible();
    
    // Check quote structure
    const firstEntry = entries.first();
    await expect(firstEntry.locator('blockquote p')).toBeVisible();
    await expect(firstEntry.locator('footer p')).toHaveCount(2); // Source and date
    
    // Verify source formatting
    const source = firstEntry.locator('footer p').first();
    await expect(source).toContainText('Source:');
    await expect(source.locator('.text-accent')).toBeVisible();
  });

  test('search functionality should filter entries', async ({ page }) => {
    await page.goto('/commonplace/');
    
    // Store initial entry count
    const entries = page.locator('.commonplace-entry');
    const initialCount = await entries.count();
    expect(initialCount).toBeGreaterThan(0);
    
    // Search for specific content
    const searchInput = page.getByPlaceholder('Search quotes and sources...');
    await searchInput.fill('wittgenstein');
    
    // Wait for debounced search to complete
    await page.waitForTimeout(300); // Slightly longer than debounce delay
    
    // Check filtered results
    const visibleEntries = entries.filter({ hasText: 'Wittgenstein' });
    await expect(visibleEntries).toBeVisible();
    
    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(300);
    
    // Verify all entries are visible again
    const finalCount = await entries.filter({ hasNotText: 'display: none' }).count();
    expect(finalCount).toBe(initialCount);
  });

  test('external source links should have correct attributes', async ({ page }) => {
    await page.goto('/commonplace/');
    
    // Find entries with source URLs
    const sourceLinks = page.locator('.commonplace-entry a[href^="http"]');
    
    // Test each source link
    for (const link of await sourceLinks.all()) {
      // Check link attributes
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      
      // Verify link has text
      const linkText = await link.textContent();
      expect(linkText?.length).toBeGreaterThan(0);
      
      // Verify link styling
      await expect(link).toHaveClass(/text-accent/);
    }
  });
});
