// scripts/capture-previews.js
//
// Captures full-page screenshots of a set of routes from the built _site/, in
// both light and dark themes at desktop and mobile viewports, and writes them
// plus a manifest.json into previews-output/. Used by the PR-previews workflow;
// can also be run locally after `npm run build`:
//
//   node scripts/capture-previews.js                      # full curated set
//   node scripts/capture-previews.js --routes "/,/about/" # ad-hoc routes
//   node scripts/capture-previews.js --routes-file r.json # [{label,path}, ...]

/* global window, document -- referenced inside browser-context page callbacks */

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { chromium, devices } = require('@playwright/test');
const { getDefaultRoutes } = require('./preview-routes.js');

const SITE_DIR = path.resolve(process.env.PREVIEW_SITE_DIR || '_site');
const OUT_DIR = path.resolve(process.env.PREVIEW_OUT_DIR || 'previews-output');
const HOST = '127.0.0.1';
const PORT = Number(process.env.PREVIEW_PORT || 8080);

const VIEWPORTS = [
  { name: 'desktop', options: { viewport: { width: 1280, height: 800 } } },
  { name: 'mobile', options: { ...devices['iPhone 13'] } },
];
const THEMES = ['dark', 'light'];

const CONTENT_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function contentType(filePath) {
  return CONTENT_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream';
}

// Map a request URL to a file inside siteDir, applying GitHub Pages "pretty URL"
// rules (a trailing slash or extensionless path resolves to index.html). Returns
// null for attempts to escape siteDir.
function resolveFile(siteDir, requestUrl) {
  let pathname = decodeURIComponent(requestUrl.split('?')[0].split('#')[0]);
  if (pathname.endsWith('/')) pathname += 'index.html';
  else if (!path.extname(pathname)) pathname += '/index.html';
  const filePath = path.normalize(path.join(siteDir, pathname));
  if (filePath !== siteDir && !filePath.startsWith(siteDir + path.sep)) return null;
  return filePath;
}

function createStaticServer(siteDir) {
  return http.createServer((req, res) => {
    const filePath = resolveFile(siteDir, req.url);
    if (!filePath) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }
    fs.readFile(filePath, (err, data) => {
      if (err) {
        fs.readFile(path.join(siteDir, '404.html'), (notFoundErr, body) => {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(notFoundErr ? 'Not found' : body);
        });
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType(filePath) });
      res.end(data);
    });
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--routes-file') args.routesFile = argv[++i];
    else if (arg === '--routes') args.routes = argv[++i];
    else if (arg === '--out') args.out = argv[++i];
  }
  return args;
}

function loadRoutes(args, siteDir) {
  if (args.routesFile) {
    const parsed = JSON.parse(fs.readFileSync(args.routesFile, 'utf-8'));
    return parsed.filter((route) => route && route.path);
  }
  if (args.routes) {
    return args.routes
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => ({
        label: value === '/' ? 'Home' : value.replace(/^\/|\/$/g, ''),
        path: value,
      }));
  }
  return getDefaultRoutes(siteDir);
}

async function capture(routes, outDir) {
  const base = `http://${HOST}:${PORT}`;
  const browser = await chromium.launch();
  const manifest = [];
  try {
    for (const viewport of VIEWPORTS) {
      for (const theme of THEMES) {
        const context = await browser.newContext(viewport.options);
        // Seed the theme before any page script runs; theme-switcher.js reads
        // localStorage on load and applies the `light` class accordingly.
        await context.addInitScript((value) => {
          try {
            window.localStorage.setItem('theme', value);
          } catch {
            /* localStorage unavailable on some origins — ignored */
          }
        }, theme);
        const page = await context.newPage();
        await page.emulateMedia({ reducedMotion: 'reduce' });

        for (const route of routes) {
          await page.goto(base + route.path, { waitUntil: 'load', timeout: 30000 });
          await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
          // Force the theme class deterministically in case the deferred
          // theme-switcher script has not toggled it yet (no inline FOUC guard).
          await page.evaluate((value) => {
            document.documentElement.classList.toggle('light', value === 'light');
          }, theme);
          await page.evaluate(async () => {
            if (document.fonts && document.fonts.ready) await document.fonts.ready;
          });
          // Hide the third-party comment widget so previews are deterministic.
          await page.addStyleTag({
            content: '.giscus, iframe.giscus-frame { visibility: hidden !important; }',
          });
          await page.waitForTimeout(400);

          const file = `${slugify(route.label || route.path)}__${viewport.name}__${theme}.png`;
          await page.screenshot({ path: path.join(outDir, file), fullPage: true });
          manifest.push({
            label: route.label || route.path,
            path: route.path,
            theme,
            viewport: viewport.name,
            file,
          });
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  return manifest;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(args.out || OUT_DIR);

  if (!fs.existsSync(path.join(SITE_DIR, 'index.html'))) {
    throw new Error(`Built site not found at ${SITE_DIR}. Run "npm run build" first.`);
  }

  const routes = loadRoutes(args, SITE_DIR);
  if (routes.length === 0) {
    console.log('No routes to capture.');
    return;
  }

  await fsp.rm(outDir, { recursive: true, force: true });
  await fsp.mkdir(outDir, { recursive: true });

  const server = createStaticServer(SITE_DIR);
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, resolve);
  });
  console.log(`Serving ${SITE_DIR} at http://${HOST}:${PORT}`);

  try {
    const manifest = await capture(routes, outDir);
    await fsp.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    console.log(
      `Captured ${manifest.length} screenshots for ${routes.length} route(s) -> ${outDir}`
    );
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Error capturing previews:', err.message);
    process.exit(1);
  });
}

module.exports = { resolveFile, slugify, loadRoutes, createStaticServer };
