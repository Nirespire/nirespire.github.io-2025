// scripts/preview-routes.js
//
// The routes the PR-preview screenshotter knows about. STATIC_ROUTES is the
// curated "one of each page type" set used when a change is site-wide (or as a
// fallback); getDefaultRoutes() augments it with the most recent blog post.

const fs = require('node:fs');
const path = require('node:path');

// One representative route per distinct page type on the site.
const STATIC_ROUTES = [
  { label: 'Home', path: '/' },
  { label: 'Blog index', path: '/blog/' },
  { label: 'About', path: '/about/' },
  { label: 'Uses', path: '/uses/' },
  { label: 'Reads', path: '/reads/' },
  { label: 'Tags', path: '/tags/' },
  { label: '404', path: '/404.html' },
];

// Resolve the newest blog post from the built site. Post output directories are
// named with a leading ISO date (YYYY-MM-DD-...), so a descending sort surfaces
// the most recent one. Returns null when the directory or posts are unavailable.
function getLatestPostRoute(siteDir) {
  if (!siteDir) return null;
  let entries;
  try {
    entries = fs.readdirSync(path.join(siteDir, 'blog'), { withFileTypes: true });
  } catch {
    return null;
  }
  const slugs = entries
    .filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}-/.test(entry.name))
    .map((entry) => entry.name)
    .sort()
    .reverse();
  if (slugs.length === 0) return null;
  return { label: `Post: ${slugs[0]}`, path: `/blog/${slugs[0]}/` };
}

// The full curated capture set: one of each page type plus the latest post.
function getDefaultRoutes(siteDir) {
  const routes = [...STATIC_ROUTES];
  const latest = getLatestPostRoute(siteDir);
  if (latest) routes.push(latest);
  return routes;
}

module.exports = { STATIC_ROUTES, getLatestPostRoute, getDefaultRoutes };
