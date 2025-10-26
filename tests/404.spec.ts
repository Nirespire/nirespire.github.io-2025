import { test, expect } from '@playwright/test';

test.describe('404 page', () => {
  test('should display correct heading and message', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Check main elements
    const heading = page.getByRole('heading', { name: '404' });
    await expect(heading).toBeVisible();
    
    const message = page.getByText('Oops! Page not found.');
    await expect(message).toBeVisible();
  });

  test('should display a random quote that changes on refresh', async ({ page }) => {
    // First load
    await page.goto('/nonexistent-page');
    
    // Wait for quote to load
    await page.waitForSelector('#quote-container p');
    
    // Get initial quote
    const initialQuote = await page.locator('#quote-container').textContent();
    expect(initialQuote).toBeTruthy();
    expect(initialQuote).not.toContain('Loading quote...');

    // Store first quote
    const firstQuote = initialQuote;

    // Refresh page multiple times to ensure quotes change
    let foundDifferentQuote = false;
    for (let i = 0; i < 5; i++) {
      await page.reload();
      await page.waitForSelector('#quote-container p');
      const newQuote = await page.locator('#quote-container').textContent();
      
      if (newQuote !== firstQuote) {
        foundDifferentQuote = true;
        break;
      }
    }

    // Verify that we found at least one different quote
    expect(foundDifferentQuote).toBeTruthy();
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Check heading structure
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Check quote container has proper ARIA attributes
    const quoteContainer = page.locator('#quote-container');
    await expect(quoteContainer).toBeVisible();
  });

  test('should have proper metadata', async ({ page }) => {
    await page.goto('/nonexistent-page');
    
    // Check page title
    await expect(page).toHaveTitle(/404 - Page Not Found/);

    // Check proper HTTP status code
    const response = await page.goto('/nonexistent-page');
    expect(response?.status()).toBe(404);
  });
});
