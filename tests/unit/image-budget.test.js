const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Budgets live in scripts/image-budgets.js, shared with the fixer script —
// bring a failing file within budget with `npm run compress-images`.
const { BUDGETS, IMAGES_DIR } = require('../../scripts/image-budgets.js');

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
    'Images exceed the size budget — run `npm run compress-images` to bring them within spec.'
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
