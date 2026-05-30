const fs = require('fs').promises;
const path = require('path');

const BLOG_DIR = path.join(__dirname, '../src/blog');
const IMAGES_BASE = path.join(__dirname, '../src/assets/images/blog');
const CDN_HOST = 'cdn-images-1.medium.com';
const CDN_REGEX = /!\[([^\]]*)\]\((https:\/\/cdn-images-1\.medium\.com\/[^)]+)\)/g;

// Medium CDN requires browser session cookies to serve images from server-side requests.
// Export MEDIUM_COOKIE from your browser's devtools (Application → Cookies → medium.com)
// and pass it via: MEDIUM_COOKIE="<value>" node scripts/download-medium-images.js
const MEDIUM_COOKIE = process.env.MEDIUM_COOKIE || '';

const FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  Referer: 'https://medium.com/',
  ...(MEDIUM_COOKIE ? { Cookie: MEDIUM_COOKIE } : {}),
};

function deriveSlug(filePath) {
  return path.basename(filePath, '.md');
}

function deriveFilename(cdnUrl) {
  const rawToken = new URL(cdnUrl).pathname.split('/').pop();
  // Replace * (Medium hash separator) with x for filesystem safety
  let sanitized = rawToken.replace(/\*/g, 'x');
  // Strip trailing dot (e.g. "0xWLrJSGVGb-wRTExG.")
  if (sanitized.endsWith('.')) {
    sanitized = sanitized.slice(0, -1);
  }
  const ext = path.extname(sanitized);
  const hasKnownExtension = ext.length > 1; // ".png" is length 4, "" is 0
  return { sanitizedBase: sanitized, hasKnownExtension };
}

function detectMimeExtension(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('image/png')) return '.png';
  if (contentType.includes('image/jpeg')) return '.jpg';
  if (contentType.includes('image/gif')) return '.gif';
  if (contentType.includes('image/webp')) return '.webp';
  console.warn(`  Warning: unknown Content-Type "${contentType}", defaulting to .png`);
  return '.png';
}

async function downloadImage(url, destDir) {
  const parsedUrl = new URL(url);
  if (parsedUrl.hostname !== CDN_HOST) {
    throw new Error(`Unexpected host: ${parsedUrl.hostname}`);
  }

  const { sanitizedBase, hasKnownExtension } = deriveFilename(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  let response;
  try {
    response = await fetch(url, { signal: controller.signal, headers: FETCH_HEADERS });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }

  const ext = hasKnownExtension ? path.extname(sanitizedBase) : detectMimeExtension(response);
  const filename = hasKnownExtension ? sanitizedBase : sanitizedBase + ext;

  await fs.mkdir(destDir, { recursive: true });
  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(path.join(destDir, filename), buffer);

  const localPath = `/assets/images/blog/${path.basename(destDir)}/${filename}`;
  return { filename, localPath };
}

async function processMarkdownFile(filePath) {
  const slug = deriveSlug(filePath);
  const imageDir = path.join(IMAGES_BASE, slug);
  let content = await fs.readFile(filePath, 'utf-8');

  const matches = [...content.matchAll(CDN_REGEX)];
  if (matches.length === 0) return;

  // Collect unique URLs to avoid duplicate downloads
  const seen = new Map();
  for (const match of matches) {
    const [full, alt, url] = match;
    if (!seen.has(url)) {
      seen.set(url, { full, alt });
    }
  }

  const replacementMap = new Map();
  for (const [url, { full, alt }] of seen) {
    try {
      const { localPath } = await downloadImage(url, imageDir);
      replacementMap.set(full, `![${alt}](${localPath})`);
      console.log(`  OK  ${url}`);
      console.log(`   -> ${localPath}`);
    } catch (err) {
      console.error(`  FAIL ${url}: ${err.message}`);
    }
  }

  for (const [original, replacement] of replacementMap) {
    content = content.replaceAll(original, replacement);
  }

  await fs.writeFile(filePath, content, 'utf-8');
}

async function main() {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter((f) => f.endsWith('.md')).map((f) => path.join(BLOG_DIR, f));

  for (const file of mdFiles) {
    const content = await fs.readFile(file, 'utf-8');
    if (content.includes(CDN_HOST)) {
      console.log(`\nProcessing: ${path.basename(file)}`);
      await processMarkdownFile(file);
    }
  }

  console.log('\nDone.');
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err.message);
    process.exit(1);
  });
}

module.exports = { deriveSlug, deriveFilename, detectMimeExtension };
