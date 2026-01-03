const fs = require('fs/promises');
const path = require('path');
const glob = require('glob');

async function buildWorker() {
  try {
    console.log('Starting Cloudflare Worker build...');

    // 1. Find all blog post files
    const blogFiles = glob.sync('src/blog/**/*.md');
    if (blogFiles.length === 0) {
      console.warn('No blog posts found.');
    } else {
      console.log(`Found ${blogFiles.length} blog posts.`);
    }

    // 2. Read and concatenate the content of all blog posts
    let allBlogContent = '';
    for (const file of blogFiles) {
      const content = await fs.readFile(file, 'utf-8');
      allBlogContent += `\n\n--- Blog Post: ${path.basename(file)} ---\n\n${content}`;
    }
    console.log('Successfully concatenated all blog content.');

    // 3. Write the content to a JSON file
    const jsonOutputPath = path.join(__dirname, '..', 'functions', 'api', 'blog-content.json');
    await fs.writeFile(jsonOutputPath, JSON.stringify(allBlogContent));
    console.log(`Successfully wrote blog content to ${jsonOutputPath}`);

    console.log('Cloudflare Worker build finished successfully.');

  } catch (error) {
    console.error('Error building the Cloudflare Worker:', error);
    process.exit(1); // Exit with an error code
  }
}

buildWorker();
