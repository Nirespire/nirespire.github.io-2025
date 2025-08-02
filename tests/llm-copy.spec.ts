import { test, expect } from '@playwright/test';

test.describe('LLM Copy Functionality', () => {
  test('should copy blog post content successfully', async ({ page }) => {
    // Mock clipboard API to succeed
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve()
        },
        configurable: true
      });
    });
    
    // Navigate to a blog post
    await page.goto('/blog/2025-07-10-genai-for-leaders/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the copy button exists
    const copyButton = page.locator('button[onclick*="copyToClipboard"]');
    await expect(copyButton).toBeVisible();
    await expect(copyButton).toHaveText('Copy for LLM');
    
    // Check that the hidden markdown content exists
    const markdownContent = page.locator('#llm-markdown-content');
    await expect(markdownContent).toBeAttached();
    
    // Click the copy button
    await copyButton.click();
    
    // Wait for the success feedback
    await expect(copyButton).toHaveText('Copied!', { timeout: 2000 });
    
    // Wait for the button to return to original text
    await expect(copyButton).toHaveText('Copy for LLM', { timeout: 3000 });
  });

  test('should handle copy error gracefully', async ({ page }) => {
    // Mock clipboard API to fail
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.reject(new Error('Clipboard access denied'))
        },
        configurable: true
      });
    });
    
    // Navigate to a blog post
    await page.goto('/blog/2025-07-10-genai-for-leaders/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click the copy button
    const copyButton = page.locator('button[onclick*="copyToClipboard"]');
    await copyButton.click();
    
    // Should show error feedback
    await expect(copyButton).toHaveText('Error!', { timeout: 2000 });
    
    // Should return to original text
    await expect(copyButton).toHaveText('Copy for LLM', { timeout: 3000 });
  });

  test('should work on different blog posts', async ({ page }) => {
    // Mock clipboard API to succeed
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve()
        },
        configurable: true
      });
    });
    
    // Test on a different blog post
    await page.goto('/blog/2025-05-09-coding-with-copilot/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click the copy button
    const copyButton = page.locator('button[onclick*="copyToClipboard"]');
    await copyButton.click();
    
    // Wait for the success feedback
    await expect(copyButton).toHaveText('Copied!', { timeout: 2000 });
    
    // Verify markdown content exists for this post too
    const markdownContent = page.locator('#llm-markdown-content');
    await expect(markdownContent).toBeAttached();
    
    // Check that the content contains the expected title (in the hidden element)
    const content = await markdownContent.textContent();
    expect(content).toContain('title: "Coding with Copilot - Rewriting My Personal Site Using Generative AI"');
  });

  test('should have markdown content with proper structure', async ({ page }) => {
    // Navigate to a blog post
    await page.goto('/blog/2025-07-10-genai-for-leaders/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check the markdown content structure
    const markdownContent = page.locator('#llm-markdown-content');
    const content = await markdownContent.textContent();
    
    // Verify frontmatter structure
    expect(content).toMatch(/^---\ntitle:/);
    expect(content).toContain('title: "GenAI Augmentation for Technology Leaders"');
    expect(content).toContain('subtitle: "There\'s more to it than just the coding agents"');
    expect(content).toContain('date: 2025-07-10');
    expect(content).toContain('tags: ["leadership", "gen-ai", "software engineering", "ai", "career"]');
    expect(content).toContain('I constantly encourage my teams to leverage Generative AI');
  });
});