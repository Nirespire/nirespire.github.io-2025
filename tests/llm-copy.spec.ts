import { test, expect } from '@playwright/test';

// How long the button shows 'Copied!'/'Error!' before reverting. Mirrors
// LLM_COPY_FEEDBACK_MS in src/assets/js/llm-copy.js — keep in sync.
const FEEDBACK_DURATION_MS = 2000;
// Feedback appears as soon as the (mocked) clipboard promise settles, so a
// short poll window is enough while still tolerating slow CI runners.
const FEEDBACK_APPEARS_TIMEOUT = FEEDBACK_DURATION_MS;
// The revert happens FEEDBACK_DURATION_MS after the click; give generous
// slack on top so a busy runner doesn't produce a flaky failure.
const FEEDBACK_REVERTS_TIMEOUT = FEEDBACK_DURATION_MS + 5000;

test.describe('LLM Copy Functionality', () => {
  test('should copy blog post content successfully', async ({ page }) => {
    // Mock clipboard API to succeed
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve(),
        },
        configurable: true,
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
    await expect(copyButton).toHaveText('Copied!', { timeout: FEEDBACK_APPEARS_TIMEOUT });

    // Wait for the button to return to original text
    await expect(copyButton).toHaveText('Copy for LLM', { timeout: FEEDBACK_REVERTS_TIMEOUT });
  });

  test('should handle copy error gracefully', async ({ page }) => {
    // Mock clipboard API to fail
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.reject(new Error('Clipboard access denied')),
        },
        configurable: true,
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
    await expect(copyButton).toHaveText('Error!', { timeout: FEEDBACK_APPEARS_TIMEOUT });

    // Should return to original text
    await expect(copyButton).toHaveText('Copy for LLM', { timeout: FEEDBACK_REVERTS_TIMEOUT });
  });

  test('should work on different blog posts', async ({ page }) => {
    // Mock clipboard API to succeed
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve(),
        },
        configurable: true,
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
    await expect(copyButton).toHaveText('Copied!', { timeout: FEEDBACK_APPEARS_TIMEOUT });

    // Verify markdown content exists for this post too
    const markdownContent = page.locator('#llm-markdown-content');
    await expect(markdownContent).toBeAttached();

    // Check that the content contains the expected title (in the hidden element)
    const content = await markdownContent.textContent();
    expect(content).toContain(
      'title: "Coding with Copilot - Rewriting My Personal Site Using Generative AI"'
    );
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
    expect(content).toContain(
      'tags: ["leadership", "gen-ai", "software engineering", "ai", "career"]'
    );
    expect(content).toContain('I constantly encourage my teams to leverage Generative AI');
  });

  test('should handle rapid clicking without getting stuck', async ({ page }) => {
    // Mock clipboard API to succeed
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: () => Promise.resolve(),
        },
        configurable: true,
      });
    });

    // Navigate to a blog post
    await page.goto('/blog/2025-07-10-genai-for-leaders/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    const copyButton = page.locator('button[onclick*="copyToClipboard"]');
    await expect(copyButton).toBeVisible();

    // Click multiple times rapidly
    await copyButton.click();
    await copyButton.click();
    await copyButton.click();

    // Should show success feedback
    await expect(copyButton).toHaveText('Copied!', { timeout: FEEDBACK_APPEARS_TIMEOUT });

    // Should eventually return to original text
    await expect(copyButton).toHaveText('Copy for LLM', { timeout: FEEDBACK_REVERTS_TIMEOUT });

    // Button should be clickable again after timeout
    await copyButton.click();
    await expect(copyButton).toHaveText('Copied!', { timeout: FEEDBACK_APPEARS_TIMEOUT });
  });
});
