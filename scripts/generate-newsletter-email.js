#!/usr/bin/env node

/**
 * Newsletter Email Generator
 *
 * Generates a standalone, email-client-compatible HTML version of a newsletter.
 * The email HTML uses inline styles and table-based layouts for maximum compatibility.
 *
 * Usage: node scripts/generate-newsletter-email.js <newsletter-slug>
 *
 * Example: node scripts/generate-newsletter-email.js 2026-01-january
 *
 * Output: _site/newsletter/<slug>/email.html
 *         Accessible at /newsletter/<slug>/email.html (not linked from site)
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

// Configuration
const NEWSLETTER_DIR = path.join(__dirname, '..', 'src', 'newsletter');
const BLOG_DIR = path.join(__dirname, '..', 'src', 'blog');
const RAINDROP_FILE = path.join(__dirname, '..', 'src', '_data', 'raindrop.json');
const OUTPUT_DIR = path.join(__dirname, '..', '_site', 'newsletter');
const SITE_URL = 'https://sanjaynair.me';

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Newsletter Email Generator

Generates an email-compatible HTML version of a newsletter.

Usage:
  node scripts/generate-newsletter-email.js <newsletter-slug>

Arguments:
  newsletter-slug   The newsletter file slug (e.g., 2026-01-january)

Examples:
  node scripts/generate-newsletter-email.js 2026-01-january
  node scripts/generate-newsletter-email.js 2026-02-february

Output:
  _site/newsletter/<slug>/email.html

Note: Run after 'npm run build' to ensure the output directory exists.
`);
    process.exit(args.includes('--help') || args.includes('-h') ? 0 : 1);
  }

  return { slug: args[0] };
}

/**
 * Get the latest blog post
 */
function getLatestBlogPost() {
  const files = fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .sort()
    .reverse();

  if (files.length === 0) return null;

  const latestFile = files[0];
  const content = fs.readFileSync(path.join(BLOG_DIR, latestFile), 'utf-8');
  const { data } = matter(content);

  const slug = latestFile.replace('.md', '');
  return {
    title: data.title || 'Untitled',
    subtitle: data.subtitle || '',
    url: `${SITE_URL}/blog/${slug}/`,
    date: data.date
  };
}

/**
 * Get reads with custom commentary
 */
function getReads(readCommentary) {
  if (!fs.existsSync(RAINDROP_FILE)) return [];

  const raindropData = JSON.parse(fs.readFileSync(RAINDROP_FILE, 'utf-8'));

  return raindropData
    .filter(item => item.tags?.includes('to-share'))
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
    .slice(0, 5)
    .map(item => ({
      title: item.title,
      url: item.url,
      commentary: readCommentary?.[item.url] || item.excerpt || ''
    }));
}

/**
 * Generate email-compatible HTML
 */
function generateEmailHtml(newsletter, latestPost, reads, slug) {
  const { data, content } = newsletter;
  const retrospectiveHtml = md.render(content);
  const newsletterUrl = `${SITE_URL}/newsletter/${slug}/`;

  // Email-safe inline styles
  const styles = {
    body: 'margin: 0; padding: 0; background-color: #FAF8F5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;',
    container: 'max-width: 600px; margin: 0 auto; background-color: #FAF8F5;',
    header: 'text-align: center; padding: 40px 20px 30px; border-bottom: 2px solid #E5E0D8;',
    logo: 'font-family: Georgia, "Times New Roman", serif; font-size: 28px; font-weight: 700; color: #333333; margin: 0;',
    logoAccent: 'color: #F97316;',
    date: 'font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #666666; margin-top: 8px;',
    content: 'padding: 30px 24px;',
    section: 'margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #E5E0D8;',
    sectionLast: 'margin-bottom: 40px; padding-bottom: 0; border-bottom: none;',
    sectionTitle: 'font-family: Georgia, "Times New Roman", serif; font-size: 20px; font-weight: 700; color: #333333; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 3px solid #F97316; display: inline-block;',
    prose: 'font-size: 16px; line-height: 1.7; color: #333333;',
    proseP: 'margin: 0 0 16px 0;',
    featuredPost: 'background-color: #FFFFFF; border: 1px solid #E5E0D8; border-radius: 8px; padding: 20px; margin-top: 16px;',
    featuredLabel: 'font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #F97316; font-weight: 600; margin: 0 0 8px 0;',
    featuredTitle: 'font-family: Georgia, "Times New Roman", serif; font-size: 18px; font-weight: 700; color: #333333; margin: 0 0 8px 0;',
    featuredTitleLink: 'color: #333333; text-decoration: none;',
    featuredSubtitle: 'font-size: 14px; color: #666666; font-style: italic; margin: 0 0 16px 0;',
    button: 'display: inline-block; background-color: #F97316; color: #FFFFFF; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px;',
    readItem: 'margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px dashed #E5E0D8;',
    readItemLast: 'margin-bottom: 0; padding-bottom: 0; border-bottom: none;',
    readTitle: 'font-size: 15px; font-weight: 600; margin: 0 0 6px 0;',
    readTitleLink: 'color: #333333; text-decoration: none; border-bottom: 1px solid #F97316;',
    readCommentary: 'font-size: 14px; color: #666666; line-height: 1.5; margin: 0;',
    footer: 'background-color: #333333; color: #FAF8F5; padding: 40px 24px; text-align: center;',
    footerTitle: 'font-family: Georgia, "Times New Roman", serif; font-size: 18px; font-weight: 700; color: #FAF8F5; margin: 0 0 12px 0;',
    footerText: 'font-size: 14px; color: #CCCCCC; line-height: 1.6; margin: 0 0 20px 0;',
    footerLink: 'color: #F97316; text-decoration: none;',
    socialLinks: 'margin-bottom: 20px;',
    socialLink: 'display: inline-block; margin: 0 12px; color: #FAF8F5; text-decoration: none;',
    footerLegal: 'font-size: 12px; color: #999999; border-top: 1px solid #444444; padding-top: 20px; margin-top: 20px;',
    viewOnline: 'font-size: 12px; color: #666666; text-align: center; padding: 16px;',
    viewOnlineLink: 'color: #F97316; text-decoration: none;'
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${data.title} | Sanjay Nair</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="${styles.body}">
  <!-- View Online Link -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5;">
    <tr>
      <td style="${styles.viewOnline}">
        <a href="${newsletterUrl}" style="${styles.viewOnlineLink}">View this newsletter online</a>
      </td>
    </tr>
  </table>

  <!-- Main Container -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FAF8F5;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="${styles.container}">

          <!-- Header -->
          <tr>
            <td style="${styles.header}">
              <h1 style="${styles.logo}">The Monthly <span style="${styles.logoAccent}">Retro</span></h1>
              <p style="${styles.date}">${data.month} ${data.year}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="${styles.content}">

              <!-- The Retrospective -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${styles.section}">
                <tr>
                  <td>
                    <h2 style="${styles.sectionTitle}">The Retrospective</h2>
                    <div style="${styles.prose}">
                      ${retrospectiveHtml.replace(/<p>/g, `<p style="${styles.proseP}">`)}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Latest Essay -->
              ${latestPost ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${styles.section}">
                <tr>
                  <td>
                    <h2 style="${styles.sectionTitle}">Latest Essay</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${styles.featuredPost}">
                      <tr>
                        <td>
                          <p style="${styles.featuredLabel}">Featured Post</p>
                          <h3 style="${styles.featuredTitle}">
                            <a href="${latestPost.url}" style="${styles.featuredTitleLink}">${latestPost.title}</a>
                          </h3>
                          ${latestPost.subtitle ? `<p style="${styles.featuredSubtitle}">${latestPost.subtitle}</p>` : ''}
                          <a href="${latestPost.url}" style="${styles.button}">Read the full post</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ` : ''}

              <!-- This Month's Reads -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${styles.sectionLast}">
                <tr>
                  <td>
                    <h2 style="${styles.sectionTitle}">This Month's Reads</h2>
                    <p style="${styles.prose}; ${styles.proseP}">A curated selection of articles that caught my attention this month.</p>

                    ${reads.map((read, index) => `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${index === reads.length - 1 ? styles.readItemLast : styles.readItem}">
                      <tr>
                        <td>
                          <p style="${styles.readTitle}">
                            <a href="${read.url}" style="${styles.readTitleLink}">${read.title}</a>
                          </p>
                          ${read.commentary && !read.commentary.includes('[TODO') ? `<p style="${styles.readCommentary}">${read.commentary}</p>` : ''}
                        </td>
                      </tr>
                    </table>
                    `).join('')}

                    <p style="margin-top: 20px;">
                      <a href="${SITE_URL}/reads/" style="${styles.footerLink}; font-weight: 500;">View all reads &rarr;</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="${styles.footer}">
              <h3 style="${styles.footerTitle}">Let's Continue the Conversation</h3>
              <p style="${styles.footerText}">
                Found something valuable here? I'd love to hear your thoughts.
                <a href="mailto:email@sanjaynair.dev" style="${styles.footerLink}">Reply to this email</a> or connect with me on social media.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${styles.socialLinks}">
                <tr>
                  <td align="center">
                    <a href="https://linkedin.com/in/sanjay-nair" style="${styles.socialLink}">LinkedIn</a>
                    <a href="https://x.com/Nirespire" style="${styles.socialLink}">X</a>
                    <a href="https://bsky.app/profile/nirespire.bsky.social" style="${styles.socialLink}">Bluesky</a>
                  </td>
                </tr>
              </table>

              <p style="${styles.footerText}; font-style: italic;">
                Know someone who'd enjoy this? Forward it along!
              </p>

              <div style="${styles.footerLegal}">
                <p style="margin: 0;">
                  <a href="${SITE_URL}/" style="${styles.footerLink}">sanjaynair.me</a> &bull; Atlanta, GA
                </p>
                <p style="margin: 8px 0 0 0;">
                  <a href="${SITE_URL}/newsletter/" style="${styles.footerLink}">View past newsletters</a>
                </p>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Main function
 */
function main() {
  const { slug } = parseArgs();

  console.log('📧 Newsletter Email Generator\n');

  // Find the newsletter file
  const newsletterFile = path.join(NEWSLETTER_DIR, `${slug}.md`);
  if (!fs.existsSync(newsletterFile)) {
    console.error(`❌ Error: Newsletter file not found: ${slug}.md`);
    console.error(`   Looking in: ${NEWSLETTER_DIR}`);
    process.exit(1);
  }

  console.log(`📄 Reading newsletter: ${slug}.md`);

  // Parse newsletter
  const newsletterContent = fs.readFileSync(newsletterFile, 'utf-8');
  const newsletter = matter(newsletterContent);

  // Get latest blog post
  console.log('📝 Finding latest blog post...');
  const latestPost = getLatestBlogPost();
  if (latestPost) {
    console.log(`   Found: "${latestPost.title}"`);
  }

  // Get reads with commentary
  console.log('📚 Loading reads with commentary...');
  const reads = getReads(newsletter.data.readCommentary);
  console.log(`   Found ${reads.length} read(s)`);

  // Generate email HTML
  console.log('\n✍️  Generating email HTML...');
  const emailHtml = generateEmailHtml(newsletter, latestPost, reads, slug);

  // Ensure output directory exists
  const outputDir = path.join(OUTPUT_DIR, slug);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write email HTML
  const outputFile = path.join(outputDir, 'email.html');
  fs.writeFileSync(outputFile, emailHtml, 'utf-8');

  console.log(`\n✅ Email HTML generated: _site/newsletter/${slug}/email.html`);
  console.log(`\n📬 Access at: /newsletter/${slug}/email.html`);
  console.log('\n💡 Tips:');
  console.log('   - Test in email clients before sending');
  console.log('   - Copy the HTML content to your email service');
  console.log('   - The file is not linked from the site (hidden)');
}

// Export for testing
module.exports = {
  parseArgs,
  getLatestBlogPost,
  getReads,
  generateEmailHtml,
  main,
  SITE_URL
};

// Run only if called directly
if (require.main === module) {
  main();
}
