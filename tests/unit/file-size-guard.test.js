const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// A backstop against the repo bloating again. Images have their own, tighter
// budgets (tests/unit/image-budget.test.js); this catches *any* oversized
// tracked file — a stray video, zip, PSD, database, or an image type without a
// budget. Keep this cap comfortably above the largest legitimate asset (the
// legacy animated gif is ~1000 KB) so only genuine bloat trips it. If you have
// a real reason to exceed it, the answer is almost always "don't commit it" —
// use a release asset or external host instead of raising this number.
const MAX_TRACKED_FILE_BYTES = 1.5 * 1024 * 1024;

const REPO_ROOT = path.join(__dirname, '..', '..');

function trackedFiles() {
  return execFileSync('git', ['ls-files', '-z'], { cwd: REPO_ROOT })
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
}

test('no tracked file exceeds the hard size cap', () => {
  const oversized = trackedFiles()
    .map((file) => {
      const full = path.join(REPO_ROOT, file);
      // A file can be tracked but absent in a partial checkout; skip those.
      const size = fs.existsSync(full) ? fs.statSync(full).size : 0;
      return { file, size };
    })
    .filter(({ size }) => size > MAX_TRACKED_FILE_BYTES);

  assert.deepEqual(
    oversized.map(
      ({ file, size }) =>
        `${file}: ${(size / 1024 / 1024).toFixed(2)} MB (cap ${(MAX_TRACKED_FILE_BYTES / 1024 / 1024).toFixed(1)} MB)`
    ),
    [],
    'Tracked file(s) exceed the hard size cap — do not commit large binaries; use an external host or release asset.'
  );
});
