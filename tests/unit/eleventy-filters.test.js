const { test } = require('node:test');
const assert = require('node:assert');

const {
  wordcount,
  readingTime,
  formatDate,
  split,
  jsonString,
} = require('../../src/_lib/filters.js');

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

// jsonString backs the Schema.org JSON-LD block in base.njk. Nunjucks
// autoescaping is an HTML escaper and JSON-LD is JSON, so entity-escaping there
// corrupted the published value ("Q&A" -> "Q&amp;A"). Each case below asserts
// on the *parsed* value, which is what a search engine actually reads.
const parse = (value) => JSON.parse(jsonString(value));

test('jsonString round-trips an ampersand instead of HTML-escaping it', () => {
  assert.strictEqual(jsonString('Q&A'), '"Q\\u0026A"');
  assert.strictEqual(parse('Q&A'), 'Q&A');
});

test('jsonString emits a complete, quoted JSON string literal', () => {
  assert.strictEqual(jsonString('plain'), '"plain"');
});

test('jsonString escapes quotes and newlines that would break the JSON', () => {
  assert.strictEqual(parse('He said "hi"'), 'He said "hi"');
  assert.strictEqual(parse('line one\nline two'), 'line one\nline two');
  assert.strictEqual(parse('back\\slash'), 'back\\slash');
});

test('jsonString neutralizes a </script> that would close the block early', () => {
  const encoded = jsonString('</script><img src=x onerror=alert(1)>');
  assert.ok(!encoded.includes('<'), 'no raw < may reach the HTML parser');
  assert.ok(!encoded.includes('>'), 'no raw > may reach the HTML parser');
  // ...while still decoding back to the original text for a JSON consumer.
  assert.strictEqual(JSON.parse(encoded), '</script><img src=x onerror=alert(1)>');
});

test('jsonString escapes U+2028/U+2029 so the block stays valid as JS', () => {
  assert.ok(!jsonString('a\u2028b').includes('\u2028'));
  assert.strictEqual(parse('a\u2028b'), 'a\u2028b');
});

test('jsonString renders null and undefined as an empty JSON string', () => {
  assert.strictEqual(jsonString(null), '""');
  assert.strictEqual(jsonString(undefined), '""');
});
