const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Budgets live in scripts/image-budgets.js, shared with the fixer script —
// bring a failing file within budget with `npm run compress-images`.
const { BUDGETS, IMAGE_DIRS } = require('../../scripts/image-budgets.js');

const REPO_ROOT = path.join(__dirname, '..', '..');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function allImages() {
  return IMAGE_DIRS.flatMap((dir) => walk(dir));
}

test('every shipped image stays within its size budget', () => {
  const overBudget = allImages()
    .map((file) => {
      const ext = path.extname(file).toLowerCase();
      const budget = BUDGETS[ext];
      const size = fs.statSync(file).size;
      return { file: path.relative(REPO_ROOT, file), ext, size, budget };
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
  const unknown = allImages().filter(
    (file) => BUDGETS[path.extname(file).toLowerCase()] === undefined
  );
  assert.deepEqual(
    unknown.map((file) => path.relative(REPO_ROOT, file)),
    [],
    'Unrecognized image type — add a budget for it in BUDGETS.'
  );
});
