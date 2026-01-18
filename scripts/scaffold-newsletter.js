#!/usr/bin/env node

/**
 * Newsletter Scaffolding Script
 *
 * Automatically generates a draft newsletter with:
 * - Latest blog post details
 * - This month's reads from raindrop.json
 * - Placeholders for manual authoring
 *
 * Usage: node scripts/scaffold-newsletter.js [--month YYYY-MM]
 *
 * Options:
 *   --month YYYY-MM   Specify the month (defaults to current month)
 *   --force           Overwrite existing newsletter file
 *   --help            Show this help message
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BLOG_DIR = path.join(__dirname, '..', 'src', 'blog');
const RAINDROP_FILE = path.join(__dirname, '..', 'src', '_data', 'raindrop.json');
const NEWSLETTER_DIR = path.join(__dirname, '..', 'src', 'newsletter');

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    month: null,
    force: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--month' && args[i + 1]) {
      options.month = args[i + 1];
      i++;
    } else if (args[i] === '--force') {
      options.force = true;
    } else if (args[i] === '--help' || args[i] === '-h') {
      options.help = true;
    }
  }

  return options;
}

/**
 * Get target month details
 * The newsletter is published in the target month but covers CONTENT from the previous month.
 * For example: January 2026 newsletter (sent first Friday of Jan) covers December 2025 content.
 */
function getTargetMonth(monthArg) {
  let year, month;

  if (monthArg) {
    const match = monthArg.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      console.error('Error: Invalid month format. Use YYYY-MM (e.g., 2026-01)');
      process.exit(1);
    }
    year = parseInt(match[1]);
    month = parseInt(match[2]) - 1; // 0-indexed
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth();
  }

  // Calculate the content month (previous month)
  // This is the month whose blog posts and reads we'll feature
  let contentYear = year;
  let contentMonth = month - 1;
  if (contentMonth < 0) {
    contentMonth = 11; // December
    contentYear = year - 1;
  }

  return {
    // Newsletter publication month
    year,
    month,
    monthName: MONTH_NAMES[month],
    // Content month (previous month) - what we're featuring
    contentYear,
    contentMonth,
    contentMonthName: MONTH_NAMES[contentMonth],
    contentStartDate: new Date(contentYear, contentMonth, 1),
    contentEndDate: new Date(contentYear, contentMonth + 1, 0, 23, 59, 59, 999)
  };
}

/**
 * Get the latest blog post from the content month (previous month)
 */
function getLatestBlogPost(targetMonth, blogDir = BLOG_DIR) {
  const files = fs.readdirSync(blogDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .reverse();

  if (files.length === 0) {
    return null;
  }

  // Find the most recent post from the content month
  for (const file of files) {
    const content = fs.readFileSync(path.join(blogDir, file), 'utf-8');

    // Parse frontmatter (handle trailing spaces and various line endings)
    const frontmatterMatch = content.match(/^---\s*[\r\n]+([\s\S]*?)[\r\n]+---/);
    if (!frontmatterMatch) {
      continue;
    }

    const frontmatter = frontmatterMatch[1];
    const dateMatch = frontmatter.match(/date:\s*(\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) {
      continue;
    }

    const postDate = new Date(dateMatch[1]);

    // Check if this post is from the content month
    if (postDate >= targetMonth.contentStartDate && postDate <= targetMonth.contentEndDate) {
      const title = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/)?.[1] || 'Untitled';
      const subtitle = frontmatter.match(/subtitle:\s*["']?([^"'\n]+)["']?/)?.[1] || '';
      const date = dateMatch[1];
      const slug = file.replace('.md', '');
      const url = `/blog/${slug}/`;

      return { title, subtitle, date, url, filename: file };
    }
  }

  return null;
}

/**
 * Get reads from the content month (previous month)
 */
function getMonthlyReads(targetMonth, raindropFile = RAINDROP_FILE) {
  if (!fs.existsSync(raindropFile)) {
    console.warn('Warning: raindrop.json not found. Skipping reads section.');
    return [];
  }

  const raindropData = JSON.parse(fs.readFileSync(raindropFile, 'utf-8'));

  return raindropData
    .filter(item => {
      if (!item.tags?.includes('to-share')) return false;

      const itemDate = new Date(item.dateAdded);
      // Use content month dates (previous month)
      return itemDate >= targetMonth.contentStartDate && itemDate <= targetMonth.contentEndDate;
    })
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
}

/**
 * Generate the newsletter markdown content
 */
function generateNewsletterContent(targetMonth, latestPost, reads) {
  const today = new Date().toISOString().split('T')[0];

  // Build readCommentary section with placeholders for each read
  let readCommentaryYaml = '';
  if (reads.length > 0) {
    readCommentaryYaml = '\nreadCommentary:\n';
    reads.forEach((read, index) => {
      // Escape backslashes and quotes in the URL for YAML safety
      const escapedUrl = read.url.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      readCommentaryYaml += `  # ${index + 1}. ${read.title.substring(0, 60)}${read.title.length > 60 ? '...' : ''}\n`;
      readCommentaryYaml += `  "${escapedUrl}": "[TODO: Add your commentary - why does this matter? What's the key insight?]"\n`;
    });
  }

  let content = `---
title: "The Monthly Retro - ${targetMonth.monthName} ${targetMonth.year}"
subtitle: "[TODO: Add a catchy subtitle that captures this month's theme]"
date: ${today}
month: "${targetMonth.monthName}"
year: ${targetMonth.year}
description: "[TODO: Write a 1-2 sentence description for SEO and social cards]"${readCommentaryYaml}
---

<!--
================================================================================
NEWSLETTER DRAFT - ${targetMonth.monthName.toUpperCase()} ${targetMonth.year}
Featuring content from: ${targetMonth.contentMonthName} ${targetMonth.contentYear}
================================================================================

This is an auto-generated draft. Complete the following sections before publishing:

1. FRONTMATTER (above)
   - Update the subtitle
   - Update the description
   - Verify the date
   - Edit 'readCommentary' to add your insights for each read

2. THE RETROSPECTIVE (below)
   - Write 1-2 paragraphs of prose reflecting on ${targetMonth.contentMonthName}
   - Should be distinct from blog content
   - Provide a "behind-the-scenes" look at the month's themes
   - Topics to consider: productivity, leadership challenges, personal growth

3. READS COMMENTARY (in frontmatter 'readCommentary' section)
   - Replace [TODO] placeholders with your original insights
   - Delete any reads you don't want to include
   - Commentary should answer: "Why does this matter?"

Generated on: ${new Date().toISOString()}
================================================================================
-->

[TODO: Write your retrospective here. This should be 1-2 paragraphs reflecting on ${targetMonth.contentMonthName}. Consider discussing:]

- [What were you thinking about in ${targetMonth.contentMonthName}?]
- [Any leadership challenges or insights?]
- [Personal growth reflections?]
- [What themes connect this month's content?]

[Delete this placeholder and write your retrospective prose above]

`;

  // Add latest blog post reference as a comment
  content += `<!--
================================================================================
BLOG POST FROM ${targetMonth.contentMonthName.toUpperCase()} ${targetMonth.contentYear}
================================================================================
`;

  if (latestPost) {
    content += `
Found blog post from ${targetMonth.contentMonthName} ${targetMonth.contentYear}:
- Title: ${latestPost.title}
- Subtitle: ${latestPost.subtitle || '(none)'}
- URL: ${latestPost.url}
- Date: ${latestPost.date}

Note: The template auto-pulls the latest blog post. If you want to feature
this specific post, no changes needed. To override, edit the template.
`;
  } else {
    content += `
No blog posts found for ${targetMonth.contentMonthName} ${targetMonth.contentYear}.
The "Latest Essay" section will show the most recent post from any month.
Consider publishing a blog post before sending this newsletter.
`;
  }

  content += `================================================================================
-->

`;

  // Add reads reference
  content += `<!--
================================================================================
READS FROM ${targetMonth.contentMonthName.toUpperCase()} ${targetMonth.contentYear} - CUSTOM COMMENTARY
================================================================================

The newsletter template pulls reads from raindrop.json and displays them
with your custom commentary from the 'readCommentary' section in the
frontmatter above.

HOW TO ADD COMMENTARY:
1. Find the 'readCommentary' section in the frontmatter at the top of this file
2. Each read is listed by URL with a [TODO] placeholder
3. Replace the placeholder with your personal insight (1-2 sentences)
4. To remove a read, delete or comment out its line in readCommentary

`;

  if (reads.length > 0) {
    content += `READS REFERENCE (${reads.length} found for ${targetMonth.contentMonthName} ${targetMonth.contentYear}):\n\n`;

    reads.forEach((read, index) => {
      const dateAdded = new Date(read.dateAdded).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      content += `${index + 1}. "${read.title}"
   URL: ${read.url}
   Date Added: ${dateAdded}
   Original Excerpt: ${read.excerpt ? read.excerpt.substring(0, 100) + '...' : '(none)'}

`;
    });
  } else {
    content += `No reads found for ${targetMonth.contentMonthName} ${targetMonth.contentYear}.

The "This Month's Reads" section will pull from recent reads instead.
Consider adding more reads to raindrop with the 'to-share' tag.
`;
  }

  content += `================================================================================
-->
`;

  return content;
}

/**
 * Main function
 */
function main() {
  const options = parseArgs();

  if (options.help) {
    console.log(`
Newsletter Scaffolding Script

Automatically generates a draft newsletter with:
- Blog post from the PREVIOUS month (content month)
- Reads from the PREVIOUS month (content month)
- Placeholders for manual authoring

The newsletter is published in the target month but covers content from
the previous month. For example, the January 2026 newsletter (sent on the
first Friday of January) features content from December 2025.

Usage:
  node scripts/scaffold-newsletter.js [options]

Options:
  --month YYYY-MM   Newsletter month (content will be from previous month)
  --force           Overwrite existing newsletter file
  --help, -h        Show this help message

Examples:
  node scripts/scaffold-newsletter.js                  # Current month newsletter
  node scripts/scaffold-newsletter.js --month 2026-02  # Feb newsletter (Jan content)
  node scripts/scaffold-newsletter.js --month 2026-03 --force
`);
    process.exit(0);
  }

  console.log('📰 Newsletter Scaffolding Script\n');

  // Get target month
  const targetMonth = getTargetMonth(options.month);
  console.log(`📅 Newsletter month: ${targetMonth.monthName} ${targetMonth.year}`);
  console.log(`📄 Content from: ${targetMonth.contentMonthName} ${targetMonth.contentYear}`);

  // Generate filename
  const monthNum = String(targetMonth.month + 1).padStart(2, '0');
  const filename = `${targetMonth.year}-${monthNum}-${targetMonth.monthName.toLowerCase()}.md`;
  const filepath = path.join(NEWSLETTER_DIR, filename);

  // Check if file already exists
  if (fs.existsSync(filepath) && !options.force) {
    console.error(`\n❌ Error: Newsletter file already exists: ${filename}`);
    console.error('   Use --force to overwrite.');
    process.exit(1);
  }

  // Get latest blog post from content month
  console.log(`\n📝 Finding blog post from ${targetMonth.contentMonthName} ${targetMonth.contentYear}...`);
  const latestPost = getLatestBlogPost(targetMonth);
  if (latestPost) {
    console.log(`   Found: "${latestPost.title}"`);
    console.log(`   URL: ${latestPost.url}`);
    console.log(`   Date: ${latestPost.date}`);
  } else {
    console.log(`   No blog posts found for ${targetMonth.contentMonthName} ${targetMonth.contentYear}.`);
  }

  // Get reads from content month
  console.log(`\n📚 Finding reads from ${targetMonth.contentMonthName} ${targetMonth.contentYear}...`);
  const reads = getMonthlyReads(targetMonth);
  console.log(`   Found ${reads.length} read(s) with 'to-share' tag`);

  // Generate content
  console.log('\n✍️  Generating newsletter draft...');
  const content = generateNewsletterContent(targetMonth, latestPost, reads);

  // Ensure newsletter directory exists
  if (!fs.existsSync(NEWSLETTER_DIR)) {
    fs.mkdirSync(NEWSLETTER_DIR, { recursive: true });
  }

  // Write file
  fs.writeFileSync(filepath, content, 'utf-8');

  console.log(`\n✅ Newsletter draft created: src/newsletter/${filename}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Open the file and write your retrospective');
  console.log('   2. Update the subtitle and description in frontmatter');
  console.log('   3. Review the auto-populated content references');
  console.log('   4. Run "npm run build" to preview');
  console.log('   5. Commit when ready to publish\n');
}

// Export for testing
module.exports = {
  parseArgs,
  getTargetMonth,
  getLatestBlogPost,
  getMonthlyReads,
  generateNewsletterContent,
  main,
  // Export for test configuration
  setDirs: (blogDir, raindropFile, newsletterDir) => {
    if (blogDir) module.exports._BLOG_DIR = blogDir;
    if (raindropFile) module.exports._RAINDROP_FILE = raindropFile;
    if (newsletterDir) module.exports._NEWSLETTER_DIR = newsletterDir;
  },
  _BLOG_DIR: BLOG_DIR,
  _RAINDROP_FILE: RAINDROP_FILE,
  _NEWSLETTER_DIR: NEWSLETTER_DIR
};

// Run the script only if called directly
if (require.main === module) {
  main();
}
