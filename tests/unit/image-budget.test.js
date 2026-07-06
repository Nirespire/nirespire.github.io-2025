const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Per-file weight budget for shipped images. Cover images render in a
// ~256px-tall banner (post.njk) and as card thumbnails, so anything beyond
// this is wasted bytes on every page view. Recompress before raising a limit:
//   npx sharp-cli --input <file> resize 1400 -o <file>  (or any PNG/JPEG optimizer)
const BUDGETS = {
  '.png': 700 * 1024,
  '.jpg': 400 * 1024,
  '.jpeg': 400 * 1024,
  '.webp': 300 * 1024,
  '.gif': 1100 * 1024, // legacy animated gif in a 2019 post; do not add more
  '.svg': 100 * 1024,
  '.ico': 50 * 1024,
};

const IMAGES_DIR = path.join(__dirname, '..', '..', 'src', 'assets', 'images');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

test('every shipped image stays within its size budget', () => {
  const overBudget = walk(IMAGES_DIR)
    .map((file) => {
      const ext = path.extname(file).toLowerCase();
      const budget = BUDGETS[ext];
      const size = fs.statSync(file).size;
      return { file: path.relative(IMAGES_DIR, file), ext, size, budget };
    })
    .filter(({ budget, size }) => budget !== undefined && size > budget);

  assert.deepEqual(
    overBudget.map(
      ({ file, size, budget }) =>
        `${file}: ${(size / 1024).toFixed(0)} KB (budget ${(budget / 1024).toFixed(0)} KB)`
    ),
    [],
    'Images exceed the size budget — recompress them (resize to <=1600px, quantize PNGs) before shipping.'
  );
});

test('every shipped image has a known extension with a budget', () => {
  const unknown = walk(IMAGES_DIR).filter(
    (file) => BUDGETS[path.extname(file).toLowerCase()] === undefined
  );
  assert.deepEqual(
    unknown.map((file) => path.relative(IMAGES_DIR, file)),
    [],
    'Unrecognized image type — add a budget for it in BUDGETS.'
  );
});
