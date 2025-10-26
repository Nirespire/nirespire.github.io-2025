import { test, expect } from '@playwright/test';

test.describe('Uses page', () => {
  test('should be accessible from About page', async ({ page }) => {
    // Start at About page
    await page.goto('/about/');
    
    // Find and click Uses link
    const usesLink = page.getByRole('link', { name: 'Uses' });
    await expect(usesLink).toBeVisible();
    await usesLink.click();
    
    // Verify we're on the Uses page
    await expect(page).toHaveURL('/uses/');
    await expect(page.getByRole('heading', { name: 'What I Use' })).toBeVisible();
  });

  test('should display all equipment sections', async ({ page }) => {
    await page.goto('/uses/');

    // Check main heading
    await expect(page.getByRole('heading', { name: 'What I Use' })).toBeVisible();

    // Verify all section headings exist
    const sections = [
      'Personal PC',
      'Computers & Displays',
      'Desk Setup',
      'Audio & Video',
      'Accessories'
    ];

    for (const section of sections) {
      await expect(page.getByRole('heading', { name: section })).toBeVisible();
    }
  });

  test('should have working product links', async ({ page }) => {
    await page.goto('/uses/');

    // Sample of known product links to test
    const links = [
      'Adjustable Laptop Stand',
      'AmazonBasics Premium Dual Monitor Stand',
      'Jarvis Laminate Standing Desk',
      'Logitech MX Mechanical Mini',
      'Logitech MX Master',
      'Audio Technica ATH-AD500X'
    ];

    // Check each link exists and has proper attributes
    for (const linkText of links) {
      const link = page.getByRole('link', { name: linkText });
      await expect(link).toBeVisible();
      
      // Verify link has proper attributes for external links
      const linkElement = await link.elementHandle();
      const target = await linkElement?.getAttribute('target');
      const rel = await linkElement?.getAttribute('rel');
      
      expect(target).toBe('_blank');
      expect(rel).toContain('noopener');
      expect(rel).toContain('noreferrer');
    }
  });

  test('should display PC specifications', async ({ page }) => {
    await page.goto('/uses/');

    // Check PC specs are visible
    const specs = [
      'Intel Core i7-8700K',
      'Nvidia RTX 770',
      '16GB',
      'Samsung 850 500GB NVME SSD',
      'Samsung EVO 500GB SATA SSD',
      '1000W'
    ];

    for (const spec of specs) {
      await expect(page.getByText(spec, { exact: false })).toBeVisible();
    }
  });

  test('should have correct list structure', async ({ page }) => {
    await page.goto('/uses/');

    // Check that each section has a list
    const sections = [
      'Personal PC',
      'Computers & Displays',
      'Desk Setup',
      'Audio & Video',
      'Accessories'
    ];

    for (const section of sections) {
      // Find the section heading
      const heading = page.getByRole('heading', { name: section });
      await expect(heading).toBeVisible();

      // Find the list that follows the heading
      const list = heading.locator('xpath=following-sibling::ul').first();
      await expect(list).toBeVisible();
      
      // Verify list has items
      const items = await list.locator('li').count();
      expect(items).toBeGreaterThan(0);
    }
  });
});