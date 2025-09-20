import { test, expect } from '@playwright/test';

test.describe('RSS Feed Prompt', () => {
  test.beforeEach(async ({ page }) => {
    // Wait for page load and hydration
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
  });

  test('shows prompt when scrolling near bottom of page', async ({ page }) => {
    // Wait for the prompt to be in DOM but not visible
    const prompt = page.locator('#rss-prompt');
    await prompt.waitFor({ state: 'attached' });
    await expect(prompt).toBeHidden();
    
    // Add enough content to make page scrollable
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.height = '200vh';
      document.body.appendChild(div);
    });
    
    // Scroll to 85% of page height
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.85);
    });
    
    // Prompt should become visible
    await expect(prompt).toBeVisible();
  });

  test('dismisses prompt and sets cookie', async ({ page, context }) => {
    // Add scrollable content and show prompt
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.height = '200vh';
      document.body.appendChild(div);
      window.scrollTo(0, document.body.scrollHeight * 0.85);
    });
    
    const prompt = page.locator('#rss-prompt');
    await prompt.waitFor({ state: 'visible' });
    
    // Click dismiss button
    await page.locator('#rss-dismiss-btn').click();
    
    // Prompt should be hidden
    await expect(prompt).toBeHidden();
    
    // Cookie should be set
    const cookies = await context.cookies();
    const rssCookie = cookies.find(c => c.name === 'rss_prompt_dismissed');
    expect(rssCookie).toBeDefined();
    expect(rssCookie?.value).toBe('true');
  });

  test('does not show prompt if cookie is set', async ({ page, context }) => {
    // Set cookie before loading page
    await context.addCookies([{
      name: 'rss_prompt_dismissed',
      value: 'true',
      domain: 'localhost',
      path: '/'
    }]);
    
    await page.reload();
    
    // Add scrollable content
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.height = '200vh';
      document.body.appendChild(div);
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Prompt should remain hidden
    const prompt = page.locator('#rss-prompt');
    await prompt.waitFor({ state: 'attached' });
    await expect(prompt).toBeHidden();
  });

  test('shows correct button based on device', async ({ page }) => {
    // Add scrollable content and show prompt
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.height = '200vh';
      document.body.appendChild(div);
      window.scrollTo(0, document.body.scrollHeight * 0.85);
    });

    // Desktop view
    const copyBtn = page.locator('#rss-copy-btn');
    const shareBtn = page.locator('#rss-share-btn');
    
    await copyBtn.waitFor();
    await shareBtn.waitFor();
    
    await expect(copyBtn).toBeVisible();
    await expect(shareBtn).toBeHidden();

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight * 0.85);
    });
    
    await expect(copyBtn).toBeHidden();
    await expect(shareBtn).toBeVisible();
  });

  test('copy button functionality', async ({ page }) => {
    // Add scrollable content and show prompt
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.style.height = '200vh';
      document.body.appendChild(div);
      window.scrollTo(0, document.body.scrollHeight * 0.85);
    });
    
    const copyBtn = page.locator('#rss-copy-btn');
    await copyBtn.waitFor({ state: 'visible' });
    
    // Click copy button
    await copyBtn.click();
    
    // Button text should change temporarily
    await expect(copyBtn).toHaveText('Copied!');
    
    // Wait for text to revert
    await expect(copyBtn).toHaveText('Copy RSS URL', {
      timeout: 2500
    });
    
    // Note: Clipboard testing is limited in Playwright, this part might need to be mocked
    // or tested differently depending on the environment
  });
});