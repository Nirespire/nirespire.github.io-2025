import { test, expect } from '@playwright/test';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const {
  parseArgs,
  getTargetMonth,
  getLatestBlogPost,
  getMonthlyReads,
  generateNewsletterContent
} = require('../scripts/scaffold-newsletter.js');

test.describe('Newsletter Scaffold Script', () => {
  let tempDir: string;
  let blogDir: string;
  let raindropFile: string;

  test.beforeEach(async () => {
    // Create temp directories for testing
    tempDir = path.join(os.tmpdir(), `newsletter-test-${Date.now()}`);
    blogDir = path.join(tempDir, 'blog');
    await fs.mkdir(blogDir, { recursive: true });
    raindropFile = path.join(tempDir, 'raindrop.json');
  });

  test.afterEach(async () => {
    // Cleanup temp directories
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  test.describe('parseArgs', () => {
    test('should parse empty args', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js'];
      const options = parseArgs();
      expect(options.month).toBeNull();
      expect(options.force).toBe(false);
      expect(options.help).toBe(false);
      process.argv = originalArgv;
    });

    test('should parse --month flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--month', '2026-02'];
      const options = parseArgs();
      expect(options.month).toBe('2026-02');
      process.argv = originalArgv;
    });

    test('should parse --force flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--force'];
      const options = parseArgs();
      expect(options.force).toBe(true);
      process.argv = originalArgv;
    });

    test('should parse --help flag', () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'script.js', '--help'];
      const options = parseArgs();
      expect(options.help).toBe(true);
      process.argv = originalArgv;
    });
  });

  test.describe('getTargetMonth', () => {
    test('should parse month argument correctly', () => {
      const result = getTargetMonth('2026-01');
      expect(result.year).toBe(2026);
      expect(result.month).toBe(0); // January is 0-indexed
      expect(result.monthName).toBe('January');
      // Content month should be December 2025
      expect(result.contentYear).toBe(2025);
      expect(result.contentMonth).toBe(11);
      expect(result.contentMonthName).toBe('December');
    });

    test('should calculate previous month for content correctly', () => {
      const result = getTargetMonth('2026-03');
      expect(result.year).toBe(2026);
      expect(result.monthName).toBe('March');
      // Content month should be February 2026
      expect(result.contentYear).toBe(2026);
      expect(result.contentMonthName).toBe('February');
    });

    test('should handle year boundary (January newsletter covers December)', () => {
      const result = getTargetMonth('2026-01');
      expect(result.contentYear).toBe(2025);
      expect(result.contentMonthName).toBe('December');
    });

    test('should set correct content date range', () => {
      const result = getTargetMonth('2026-02');
      // Content month is January 2026
      expect(result.contentStartDate.getFullYear()).toBe(2026);
      expect(result.contentStartDate.getMonth()).toBe(0); // January
      expect(result.contentStartDate.getDate()).toBe(1);
      // End date should be Jan 31st
      expect(result.contentEndDate.getMonth()).toBe(0);
      expect(result.contentEndDate.getDate()).toBe(31);
    });
  });

  test.describe('getLatestBlogPost', () => {
    test('should return null when no blog posts exist', async () => {
      const targetMonth = getTargetMonth('2026-01');
      const result = getLatestBlogPost(targetMonth, blogDir);
      expect(result).toBeNull();
    });

    test('should find blog post from content month', async () => {
      // Create a blog post from December 2025 (content month for January 2026 newsletter)
      const blogPost = `---
title: "Test Blog Post"
subtitle: "A test subtitle"
date: 2025-12-15
---

Blog content here.
`;
      await fs.writeFile(path.join(blogDir, '2025-12-15-test-post.md'), blogPost);

      const targetMonth = getTargetMonth('2026-01');
      const result = getLatestBlogPost(targetMonth, blogDir);

      expect(result).not.toBeNull();
      expect(result.title).toBe('Test Blog Post');
      expect(result.subtitle).toBe('A test subtitle');
      expect(result.date).toBe('2025-12-15');
      expect(result.url).toBe('/blog/2025-12-15-test-post/');
    });

    test('should not return post from wrong month', async () => {
      // Create a blog post from November 2025 (not December)
      const blogPost = `---
title: "November Post"
date: 2025-11-15
---

Content.
`;
      await fs.writeFile(path.join(blogDir, '2025-11-15-november.md'), blogPost);

      const targetMonth = getTargetMonth('2026-01');
      const result = getLatestBlogPost(targetMonth, blogDir);
      expect(result).toBeNull();
    });

    test('should skip index.md file', async () => {
      const indexContent = `---
title: "Blog Index"
---
`;
      await fs.writeFile(path.join(blogDir, 'index.md'), indexContent);

      const targetMonth = getTargetMonth('2026-01');
      const result = getLatestBlogPost(targetMonth, blogDir);
      expect(result).toBeNull();
    });
  });

  test.describe('getMonthlyReads', () => {
    test('should return empty array when raindrop file does not exist', () => {
      const targetMonth = getTargetMonth('2026-01');
      const result = getMonthlyReads(targetMonth, '/nonexistent/path.json');
      expect(result).toEqual([]);
    });

    test('should filter reads by to-share tag and content month', async () => {
      const raindropData = [
        {
          title: 'December Article',
          url: 'https://example.com/dec',
          tags: ['to-share'],
          dateAdded: '2025-12-15T10:00:00Z',
          excerpt: 'December excerpt'
        },
        {
          title: 'November Article',
          url: 'https://example.com/nov',
          tags: ['to-share'],
          dateAdded: '2025-11-15T10:00:00Z',
          excerpt: 'November excerpt'
        },
        {
          title: 'December No Tag',
          url: 'https://example.com/notag',
          tags: ['other-tag'],
          dateAdded: '2025-12-20T10:00:00Z'
        }
      ];
      await fs.writeFile(raindropFile, JSON.stringify(raindropData));

      const targetMonth = getTargetMonth('2026-01');
      const result = getMonthlyReads(targetMonth, raindropFile);

      expect(result.length).toBe(1);
      expect(result[0].title).toBe('December Article');
    });

    test('should sort reads by date descending', async () => {
      const raindropData = [
        {
          title: 'Early December',
          url: 'https://example.com/early',
          tags: ['to-share'],
          dateAdded: '2025-12-05T10:00:00Z'
        },
        {
          title: 'Late December',
          url: 'https://example.com/late',
          tags: ['to-share'],
          dateAdded: '2025-12-25T10:00:00Z'
        },
        {
          title: 'Mid December',
          url: 'https://example.com/mid',
          tags: ['to-share'],
          dateAdded: '2025-12-15T10:00:00Z'
        }
      ];
      await fs.writeFile(raindropFile, JSON.stringify(raindropData));

      const targetMonth = getTargetMonth('2026-01');
      const result = getMonthlyReads(targetMonth, raindropFile);

      expect(result.length).toBe(3);
      expect(result[0].title).toBe('Late December');
      expect(result[1].title).toBe('Mid December');
      expect(result[2].title).toBe('Early December');
    });
  });

  test.describe('generateNewsletterContent', () => {
    test('should generate correct frontmatter', () => {
      const targetMonth = getTargetMonth('2026-01');
      const content = generateNewsletterContent(targetMonth, null, []);

      expect(content).toContain('title: "The Monthly Retro - January 2026"');
      expect(content).toContain('month: "January"');
      expect(content).toContain('year: 2026');
      expect(content).toContain('[TODO: Add a catchy subtitle');
    });

    test('should include blog post reference when provided', () => {
      const targetMonth = getTargetMonth('2026-01');
      const latestPost = {
        title: 'Test Post',
        subtitle: 'Test Subtitle',
        date: '2025-12-15',
        url: '/blog/test-post/'
      };
      const content = generateNewsletterContent(targetMonth, latestPost, []);

      expect(content).toContain('Found blog post from December 2025');
      expect(content).toContain('Title: Test Post');
      expect(content).toContain('URL: /blog/test-post/');
    });

    test('should generate readCommentary section for reads', () => {
      const targetMonth = getTargetMonth('2026-01');
      const reads = [
        {
          title: 'Article One',
          url: 'https://example.com/one',
          excerpt: 'Excerpt one',
          dateAdded: '2025-12-15T10:00:00Z'
        },
        {
          title: 'Article Two',
          url: 'https://example.com/two',
          excerpt: 'Excerpt two',
          dateAdded: '2025-12-20T10:00:00Z'
        }
      ];
      const content = generateNewsletterContent(targetMonth, null, reads);

      expect(content).toContain('readCommentary:');
      expect(content).toContain('"https://example.com/one": "[TODO: Add your commentary');
      expect(content).toContain('"https://example.com/two": "[TODO: Add your commentary');
    });

    test('should escape quotes in URLs', () => {
      const targetMonth = getTargetMonth('2026-01');
      const reads = [
        {
          title: 'Article with Quote',
          url: 'https://example.com/path?foo="bar"',
          dateAdded: '2025-12-15T10:00:00Z'
        }
      ];
      const content = generateNewsletterContent(targetMonth, null, reads);

      expect(content).toContain('https://example.com/path?foo=\\"bar\\"');
    });

    test('should include content month references in comments', () => {
      const targetMonth = getTargetMonth('2026-01');
      const content = generateNewsletterContent(targetMonth, null, []);

      expect(content).toContain('Featuring content from: December 2025');
      expect(content).toContain('READS FROM DECEMBER 2025');
    });
  });
});
