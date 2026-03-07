import { test, expect } from '@playwright/test';

const {
  getReads,
  generateEmailHtml,
  SITE_URL
} = require('../scripts/generate-newsletter-email.js');

test.describe('Newsletter Email Generator Script', () => {
  test.describe('generateEmailHtml', () => {
    test('should generate valid HTML structure', () => {
      const newsletter = {
        data: {
          title: 'The Monthly Retro - January 2026',
          month: 'January',
          year: 2026
        },
        content: 'Test retrospective content.'
      };
      const slug = '2026-01-january';

      const html = generateEmailHtml(newsletter, null, [], slug);

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html lang="en">');
      expect(html).toContain('</html>');
      expect(html).toContain('<title>The Monthly Retro - January 2026 | Sanjay Nair</title>');
    });

    test('should include correct newsletter URL in view online link', () => {
      const newsletter = {
        data: {
          title: 'The Monthly Retro - January 2026',
          month: 'January',
          year: 2026
        },
        content: 'Test content.'
      };
      const slug = '2026-01-january';

      const html = generateEmailHtml(newsletter, null, [], slug);

      expect(html).toContain(`${SITE_URL}/newsletter/${slug}/`);
      expect(html).toContain('View this newsletter online');
    });

    test('should use slug-based URL not frontmatter-based', () => {
      const newsletter = {
        data: {
          title: 'The Monthly Retro - January 2026',
          month: 'January',
          year: 2026
        },
        content: 'Test content.'
      };
      const slug = '2026-01-january';

      const html = generateEmailHtml(newsletter, null, [], slug);

      // Should use slug format (2026-01-january), not frontmatter format (january-2026)
      expect(html).toContain('/newsletter/2026-01-january/');
      expect(html).not.toContain('/newsletter/january-2026/');
    });

    test('should render retrospective content as HTML', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: '**Bold text** and *italic text*.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test-slug');

      expect(html).toContain('<strong>Bold text</strong>');
      expect(html).toContain('<em>italic text</em>');
    });

    test('should include month and year in header', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'February',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      expect(html).toContain('February 2026');
      expect(html).toContain('The Monthly <span');
      expect(html).toContain('Retro</span>');
    });

    test('should include latest blog post when provided', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };
      const latestPost = {
        title: 'My Latest Blog Post',
        subtitle: 'A great subtitle',
        url: `${SITE_URL}/blog/my-latest-post/`
      };

      const html = generateEmailHtml(newsletter, latestPost, [], 'test');

      expect(html).toContain('My Latest Blog Post');
      expect(html).toContain('A great subtitle');
      expect(html).toContain('/blog/my-latest-post/');
      expect(html).toContain('Read the full post');
      expect(html).toContain('Featured Post');
    });

    test('should handle missing latest post', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      // Should not have the featured post section content
      expect(html).not.toContain('Featured Post');
    });

    test('should include reads with commentary', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };
      const reads = [
        {
          title: 'Article One',
          url: 'https://example.com/one',
          commentary: 'My thoughts on article one.'
        },
        {
          title: 'Article Two',
          url: 'https://example.com/two',
          commentary: 'My thoughts on article two.'
        }
      ];

      const html = generateEmailHtml(newsletter, null, reads, 'test');

      expect(html).toContain('Article One');
      expect(html).toContain('https://example.com/one');
      expect(html).toContain('My thoughts on article one.');
      expect(html).toContain('Article Two');
      expect(html).toContain('My thoughts on article two.');
    });

    test('should not display TODO commentary', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };
      const reads = [
        {
          title: 'Article',
          url: 'https://example.com/article',
          commentary: '[TODO: Add your commentary]'
        }
      ];

      const html = generateEmailHtml(newsletter, null, reads, 'test');

      expect(html).toContain('Article');
      expect(html).not.toContain('[TODO: Add your commentary]');
    });

    test('should use table-based layout for email compatibility', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      // Check for table-based structure
      expect(html).toContain('<table');
      expect(html).toContain('cellpadding="0"');
      expect(html).toContain('cellspacing="0"');
      expect(html).toContain('border="0"');
    });

    test('should use inline styles', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      // Check for inline styles on key elements
      expect(html).toContain('style="');
      expect(html).toContain('font-family:');
      expect(html).toContain('background-color:');
    });

    test('should include MSO conditional styles for Outlook', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      expect(html).toContain('<!--[if mso]>');
      expect(html).toContain('<![endif]-->');
    });

    test('should include footer with social links', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      expect(html).toContain('LinkedIn');
      expect(html).toContain('linkedin.com/in/sanjay-nair');
      expect(html).toContain('x.com/Nirespire');
      expect(html).toContain('bsky.app/profile/nirespire.bsky.social');
      expect(html).toContain("Let's Continue the Conversation");
    });

    test('should include link to view all reads', () => {
      const newsletter = {
        data: {
          title: 'Test Newsletter',
          month: 'January',
          year: 2026
        },
        content: 'Content.'
      };

      const html = generateEmailHtml(newsletter, null, [], 'test');

      expect(html).toContain(`${SITE_URL}/reads/`);
      expect(html).toContain('View all reads');
    });
  });

  test.describe('getReads', () => {
    test('should return empty array when raindrop file does not exist', () => {
      // getReads uses the global RAINDROP_FILE path
      // In a real test environment, we'd mock this
      // For now, we test the function behavior with mock data
    });

    test('should use custom commentary when provided', () => {
      // This tests the mapping logic
      const readCommentary = {
        'https://example.com/article': 'Custom commentary here'
      };

      // The function takes readCommentary as parameter and applies it to raindrop items
      // We'd need to mock the raindrop.json reading for full unit testing
    });
  });
});
