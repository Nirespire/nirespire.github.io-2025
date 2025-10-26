import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Test navigation links
    const nav = await page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Check main nav links
    const links = [
      { text: 'Blog', href: '/blog/' },
      { text: 'About', href: '/about/' }
    ];
    for (const link of links) {
      const navLink = nav.getByRole('link', { name: link.text });
      await expect(navLink).toBeVisible();
      await navLink.click();
      await expect(page).toHaveURL(link.href);
      await page.goto('/'); // Go back to home
    }
  });

  test('should display latest blog post', async ({ page }) => {
    await page.goto('/');
    
    // Check latest post section
    const latestPost = page.getByRole('heading', { name: 'Latest Post' });
    await expect(latestPost).toBeVisible();
    
    // Verify post content
    const article = page.locator('article').first();
    await expect(article.getByRole('heading', { level: 2 }).getByRole('link')).toBeVisible();
    await expect(article.locator('p.text-sm.text-text-secondary')).toBeVisible();
    
    // Check post link works
    const postLink = article.getByRole('heading').getByRole('link');
    const href = await postLink.getAttribute('href');
    expect(href).toBeTruthy();
    await postLink.click();
    await expect(page.url()).toContain(href!);
  });

  test('should have working tag links', async ({ page }) => {
    await page.goto('/');
    
    // Check tags section
    const tags = page.locator('.post-tag');
    const tagCount = await tags.count();
    if (tagCount > 0) {
      const firstTag = tags.first();
      const href = await firstTag.getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('/tags/');
      await firstTag.click();
      await expect(page.url()).toContain('/tags/');
    }
  });

  test('should render profile section', async ({ page }) => {
    await page.goto('/');
    
    // Check profile/bio section
    const profileImage = page.locator('img[alt="Sanjay Nair"]');
    await expect(profileImage).toBeVisible();
    
    // Check bio text
    const bio = page.getByText(/Hi, I'm Sanjay Nair — a software engineering leader/);
    await expect(bio).toBeVisible();
    
    // Verify profile content is meaningful
    const bioContent = await bio.textContent();
    expect(bioContent).toBeTruthy();
    expect(bioContent?.length).toBeGreaterThan(50);
  });

  test('should toggle light and dark themes', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.locator('#theme-toggle');

    // Default theme should be dark
    let isLight = await html.evaluate(el => el.classList.contains('light'));
    expect(isLight).toBe(false);
    let storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');

    // Switch to light mode
    await toggle.click();
    isLight = await html.evaluate(el => el.classList.contains('light'));
    expect(isLight).toBe(true);
    storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('light');

    // Reload and ensure light mode persists
    await page.reload();
    isLight = await html.evaluate(el => el.classList.contains('light'));
    expect(isLight).toBe(true);
    storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('light');

    // Switch back to dark mode
    await toggle.click();
    isLight = await html.evaluate(el => el.classList.contains('light'));
    expect(isLight).toBe(false);
    storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');

    // Reload and ensure dark mode persists
    await page.reload();
    isLight = await html.evaluate(el => el.classList.contains('light'));
    expect(isLight).toBe(false);
    storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(storedTheme).toBe('dark');
  });
});