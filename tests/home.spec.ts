import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const nav = await page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check main nav links
    const links = ['Blog', 'Contact'];
    for (const link of links) {
      const navLink = nav.locator(`a:has-text("${link}")`);
      await expect(navLink).toBeVisible();
      await navLink.click();
      await expect(page).toHaveURL(new RegExp(`/${link.toLowerCase()}`));
      await page.goto('/'); // Go back to home
    }
  });

  test('should display latest blog post', async ({ page }) => {
    await page.goto('/');
    
    // Check latest post section
    const latestPost = await page.locator('h2:text("Latest Post")').first();
    await expect(latestPost).toBeVisible();
    
    // Verify post content
    const article = latestPost.locator('xpath=following-sibling::article').first();
    await expect(article.locator('h2 a')).toBeVisible(); // Title
    await expect(article.locator('p >> nth=1')).toBeVisible(); // Date
    
    // Check post link works
    const postLink = article.locator('h2 a');
    const href = await postLink.getAttribute('href');
    await postLink.click();
    await expect(page).toHaveURL(new RegExp(href));
  });

  test('should have working tag links', async ({ page }) => {
    await page.goto('/');
    
    // Check tags section
    const tags = await page.locator('a[href*="/tags/"]');
    if (await tags.count() > 0) {
      const firstTag = tags.first();
      const href = await firstTag.getAttribute('href');
      await firstTag.click();
      await expect(page).toHaveURL(new RegExp('/tags/'));
    }
  });

  test('should render profile section', async ({ page }) => {
    await page.goto('/');
    
    // Check profile/bio section
    const profileImage = await page.locator('img[alt*="Sanjay Nair"]');
    await expect(profileImage).toBeVisible();
    
    // Check bio text
    const bio = await page.locator('p:has-text("Hi, I\'m Sanjay Nair —")').first();
    await expect(bio).toBeVisible();
    
    // Check footer
    const footer = await page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    await expect(footer).toHaveText('Made with ❤️ by Sanjay Nair');
  });
});