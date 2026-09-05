const { test } = require('node:test');
const assert = require('node:assert');

const { wordcount, readingTime, formatDate, split } = require('../../src/_lib/filters.js');

test('wordcount counts whitespace-separated words', () => {
  assert.strictEqual(wordcount('one two three'), 3);
  assert.strictEqual(wordcount('  leading and   collapsed\tspacing\nhere  '), 5);
});

test('wordcount reports empty or blank content as 0 (not 1)', () => {
  assert.strictEqual(wordcount(''), 0);
  assert.strictEqual(wordcount('   '), 0);
  assert.strictEqual(wordcount('\n\t'), 0);
});

test('wordcount guards non-string input', () => {
  assert.strictEqual(wordcount(undefined), 0);
  assert.strictEqual(wordcount(null), 0);
  assert.strictEqual(wordcount(42), 0);
});

test('readingTime rounds up at the 200 wpm boundary', () => {
  assert.strictEqual(readingTime(0), 0);
  assert.strictEqual(readingTime(1), 1);
  assert.strictEqual(readingTime(200), 1);
  assert.strictEqual(readingTime(201), 2);
  assert.strictEqual(readingTime(400), 2);
});

test('empty content yields a 0-minute read (regression for the empty-split bug)', () => {
  assert.strictEqual(readingTime(wordcount('')), 0);
});

test('formatDate formats ISO strings and JS Dates', () => {
  assert.strictEqual(formatDate('2024-01-15', 'yyyy-MM-dd'), '2024-01-15');
  assert.strictEqual(formatDate(new Date('2024-01-15T00:00:00Z'), 'yyyy-MM-dd'), '2024-01-15');
});

test('formatDate returns empty string for falsy input', () => {
  assert.strictEqual(formatDate(null), '');
  assert.strictEqual(formatDate(undefined), '');
  assert.strictEqual(formatDate(''), '');
});

test('formatDate falls back to the raw value instead of leaking "Invalid DateTime"', () => {
  assert.strictEqual(formatDate('not-a-date', 'yyyy-MM-dd'), 'not-a-date');
});

test('split guards non-string input to an empty array', () => {
  assert.deepStrictEqual(split('a,b,c', ','), ['a', 'b', 'c']);
  assert.deepStrictEqual(split(undefined, ','), []);
  assert.deepStrictEqual(split(null, ','), []);
});
