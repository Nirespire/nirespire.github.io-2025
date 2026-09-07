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

// Encode a value as a complete JSON string literal (quotes included) for
// embedding in a <script type="application/ld+json"> block.
//
// Nunjucks autoescaping is an HTML escaper, and JSON-LD is JSON, not HTML — a
// JSON parser does not decode HTML entities. Interpolating a title through
// autoescaping therefore *corrupts* the structured data: "Q&A" was emitted as
// "Q&amp;A" and search engines read that literal string. Encoding with
// JSON.stringify produces the correct value and quotes/escapes it properly, so
// a title containing a quote or newline can no longer break the block.
//
// The output is marked `| safe` at the call site (it is already JSON-escaped),
// which re-opens the HTML-context hole autoescaping was closing: an unescaped
// `</script>` inside a value would end the block early. `<`, `>` and `&` are
// therefore emitted as \uXXXX escapes — invisible to a JSON parser, which
// decodes them back to the original characters, but inert to an HTML parser.
// U+2028/U+2029 are escaped too so the block stays valid when read as JS.
function jsonString(value) {
  const str = value === null || value === undefined ? '' : String(value);
  return JSON.stringify(str).replace(
    /[<>&\u2028\u2029]/g,
    (ch) => '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')
  );
}

module.exports = { wordcount, readingTime, formatDate, split, jsonString };
