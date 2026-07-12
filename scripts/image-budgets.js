// Single source of truth for shipped-image weight budgets, keyed by
// extension. Enforced by tests/unit/image-budget.test.js; bring a
// violating file within budget with `npm run compress-images`.
//
// Cover images render in a ~256px-tall banner (post.njk) and as card
// thumbnails, so anything beyond these limits is wasted bytes on every
// page view.
const path = require('path');

const BUDGETS = {
  '.png': 700 * 1024,
  '.jpg': 400 * 1024,
  '.jpeg': 400 * 1024,
  '.webp': 300 * 1024,
  '.gif': 1100 * 1024, // legacy animated gif in a 2019 post; do not add more
  '.svg': 100 * 1024,
  '.ico': 50 * 1024,
};

// Directories whose images are scanned/compressed against BUDGETS. The wedding
// archive (archive/wedding/img) ships full-size photos and used to escape the
// budget entirely, which is how the repo bloated — keep it in this list.
const IMAGE_DIRS = [
  path.join(__dirname, '..', 'src', 'assets', 'images'),
  path.join(__dirname, '..', 'archive', 'wedding', 'img'),
];

module.exports = { BUDGETS, IMAGE_DIRS };
