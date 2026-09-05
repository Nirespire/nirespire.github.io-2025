'use strict';

// Pure, unit-testable Eleventy filter implementations. Registered in
// `.eleventy.js`; kept here so their logic can be exercised directly in
// `tests/unit/eleventy-filters.test.js` instead of only through a full build.
const { DateTime } = require('luxon');

// Count whitespace-separated words. Guards non-strings and, unlike a bare
// `''.split(/\s+/)` (which returns `['']`), reports an empty/blank string as
// 0 words rather than 1 — so an empty post no longer claims "1 min read".
function wordcount(text) {
  if (typeof text !== 'string') {
    return 0;
  }
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

// Estimate reading time in whole minutes at 200 wpm.
function readingTime(wordCount) {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

// Format an ISO string or JS Date with Luxon. `DateTime.fromISO`/`fromJSDate`
// never throw on bad input — they yield an *invalid* DateTime whose
// `.toFormat()` renders the literal "Invalid DateTime". Check `.isValid`
// explicitly and fall back to the original value instead of leaking that
// placeholder into the page.
function formatDate(dateObj, format = 'LLL d, yyyy') {
  if (!dateObj) {
    return '';
  }
  const dt =
    typeof dateObj === 'string'
      ? DateTime.fromISO(dateObj)
      : DateTime.fromJSDate(dateObj, { zone: 'utc' });
  return dt.isValid ? dt.toFormat(format) : String(dateObj);
}

// Split a string, guarding non-string input to an empty array.
function split(str, separator) {
  if (typeof str !== 'string') {
    return [];
  }
  return str.split(separator);
}

module.exports = { wordcount, readingTime, formatDate, split };
