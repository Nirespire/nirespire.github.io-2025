// scripts/resolve-changed-routes.js
//
// Maps the files changed in a pull request to the set of rendered routes worth
// screenshotting. A change to a shared layout, component, stylesheet or build
// config affects every page, so those trigger a full curated capture; otherwise
// only the directly affected routes are returned.

const fs = require('node:fs');
const path = require('node:path');
const { getDefaultRoutes } = require('./preview-routes.js');

// Source paths that influence every rendered page.
const SITE_WIDE_PATTERNS = [
  /^src\/_includes\//,
  /^src\/assets\/css\//,
  /^src\/assets\/js\//,
  /^tailwind\.config\.js$/,
  /^postcss\.config\.js$/,
  /^\.eleventy\.js$/,
];

// Static source files that map to one (or a few) rendered routes.
const EXACT_ROUTES = {
  'src/index.njk': [{ label: 'Home', path: '/' }],
  'src/about.njk': [{ label: 'About', path: '/about/' }],
  'src/uses.njk': [{ label: 'Uses', path: '/uses/' }],
  'src/hallucination.njk': [{ label: 'Hallucination', path: '/hallucination/' }],
  'src/404.njk': [{ label: '404', path: '/404.html' }],
  'src/webmentions.md': [{ label: 'Webmentions', path: '/webmentions/' }],
  'src/blog/index.njk': [{ label: 'Blog index', path: '/blog/' }],
  'src/tags/index.njk': [{ label: 'Tags', path: '/tags/' }],
  'src/reads/index.njk': [{ label: 'Reads', path: '/reads/' }],
  'src/reads/reads.json': [{ label: 'Reads', path: '/reads/' }],
  'src/_data/raindrop.json': [{ label: 'Reads', path: '/reads/' }],
};

function isSiteWide(file) {
  return SITE_WIDE_PATTERNS.some((pattern) => pattern.test(file));
}

// Pick any one built tag page as a representative sample for tag-template changes.
function representativeTagRoute(siteDir) {
  if (!siteDir) return null;
  try {
    const entries = fs.readdirSync(path.join(siteDir, 'tags'), { withFileTypes: true });
    const tag = entries.find((entry) => entry.isDirectory());
    return tag ? { label: `Tag: ${tag.name}`, path: `/tags/${tag.name}/` } : null;
  } catch {
    return null;
  }
}

// Resolve the route(s) a single changed source file maps to.
function routesForFile(file, siteDir) {
  const postMatch = file.match(/^src\/blog\/(.+)\.md$/);
  if (postMatch) {
    const slug = postMatch[1];
    // A post also surfaces on the home page card and the blog index.
    return [
      { label: `Post: ${slug}`, path: `/blog/${slug}/` },
      { label: 'Home', path: '/' },
      { label: 'Blog index', path: '/blog/' },
    ];
  }

  if (EXACT_ROUTES[file]) return EXACT_ROUTES[file];

  if (file === 'src/tags/tag.njk') {
    const routes = [{ label: 'Tags', path: '/tags/' }];
    const tagRoute = representativeTagRoute(siteDir);
    if (tagRoute) routes.push(tagRoute);
    return routes;
  }

  return [];
}

// Given the files changed in a PR, return the de-duplicated routes to capture.
// Returns the full curated set when any change is site-wide, or an empty array
// when nothing maps to a rendered page.
function resolveChangedRoutes(changedFiles, options = {}) {
  const siteDir = options.siteDir || null;
  const files = (changedFiles || [])
    .map((file) => file.replace(/^\.\//, '').trim())
    .filter(Boolean);

  if (files.some(isSiteWide)) {
    return getDefaultRoutes(siteDir);
  }

  const byPath = new Map();
  for (const file of files) {
    for (const route of routesForFile(file, siteDir)) {
      if (!byPath.has(route.path)) byPath.set(route.path, route);
    }
  }
  return [...byPath.values()];
}

module.exports = { resolveChangedRoutes, routesForFile, isSiteWide };
