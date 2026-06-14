const { test } = require('node:test');
const assert = require('node:assert/strict');

const { notesByUrl } = require('../../lib/notes-utils.js');

// Helper to build a note item shaped like an 11ty collection entry.
const note = (read, url) => ({ data: { read }, url });

test('notesByUrl maps a read URL to its note', () => {
  const a = note('https://example.com/a', '/notes/a/');
  const b = note('https://example.com/b', '/notes/b/');
  const map = notesByUrl([a, b]);
  assert.equal(map['https://example.com/a'], a);
  assert.equal(map['https://example.com/b'], b);
});

test('notesByUrl skips notes without a read field (standalone notes)', () => {
  const standalone = note(undefined, '/notes/standalone/');
  const tied = note('https://example.com/a', '/notes/a/');
  const map = notesByUrl([standalone, tied]);
  assert.deepEqual(Object.keys(map), ['https://example.com/a']);
});

test('notesByUrl keeps the first (newest) note when a read has duplicates', () => {
  // Collection is sorted newest-first, so the first entry should win.
  const newest = note('https://example.com/a', '/notes/newest/');
  const older = note('https://example.com/a', '/notes/older/');
  const map = notesByUrl([newest, older]);
  assert.equal(map['https://example.com/a'], newest);
});

test('notesByUrl returns an empty object for missing input', () => {
  assert.deepEqual(notesByUrl(undefined), {});
  assert.deepEqual(notesByUrl([]), {});
});
