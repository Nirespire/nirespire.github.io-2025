from playwright.sync_api import Page, expect

def test_rss_prompt_appears_on_scroll(page: Page):
    """
    This test verifies that the RSS prompt appears when the user
    scrolls to the bottom of a blog post.
    """
    print("Starting test...")
    # 1. Arrange: Go to a blog post page.
    page.goto("http://localhost:8080/blog/2025-08-14-professional-productivity-system/")

    # 2. Act: Scroll to the bottom of the page.
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")

    # 3. Assert: Check that the RSS prompt is visible.
    rss_prompt = page.locator("#rss-prompt")
    expect(rss_prompt).to_be_visible(timeout=10000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/rss-prompt.png")
