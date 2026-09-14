'use strict';

// Guards the theme-token convention in the Nunjucks templates.
//
// The site ships two themes whose palettes invert (`:root` vs `html.light` in
// src/assets/css/styles.css), so a Tailwind palette utility such as
// `text-gray-500` is only ever tuned for one of them. It stays fixed while the
// background flips, which is how `text-gray-400` (subtitle) and `text-gray-500`
// (post byline) ended up at 2.6:1 and 2.85:1 — both below WCAG AA — in the
// theme they were not chosen for.
//
// The axe scan in tests/a11y.spec.ts cannot catch this class of regression:
// `body` carries a `linear-gradient`, and axe reports `color-contrast` as
// *incomplete* rather than a violation whenever it cannot resolve a flat
// background colour. Those incomplete results are not violations, so the suite
// passes. This test closes that gap deterministically instead: templates must
// use the CSS-variable-backed tokens (`text-text-secondary`,
// `border-border-subtle`, `text-accent`, …), which are redefined per theme.

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const TEMPLATE_ROOT = path.join(ROOT, 'src');

// Tailwind's fixed palette scales. A utility naming one of these hardcodes a
// colour that cannot follow the active theme.
const PALETTE =
  'slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black|white';
const PROPERTY =
  'text|bg|border|ring|divide|from|to|via|fill|stroke|decoration|outline|placeholder|shadow';
const UTILITY = new RegExp(`\\b(?:[a-z-]+:)*(?:${PROPERTY})-(?:${PALETTE})(?:-\\d{2,3})?\\b`, 'g');

// Deliberate exceptions, keyed by `<template path>:<utility>`. Each one is a
// colour that must NOT follow the theme, and the reason it must not.
const ALLOWED = new Map([
  [
    '_includes/layouts/base.njk:text-white',
    'Ko-fi button: white on the fixed #D63733 brand background, set inline alongside it.',
  ],
  [
    '_includes/layouts/base.njk:text-red-500',
    'Decorative heart emoji; the glyph carries its own colour in both themes.',
  ],
  [
    '_includes/layouts/post.njk:hover:text-white',
    'Copy-for-LLM button hover: pairs with hover:bg-accent, which is a solid fill in both themes.',
  ],
]);

function collectTemplates(dir, found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // `blog/` holds authored markdown, not layout markup.
      if (entry.name === 'blog' || entry.name === 'assets' || entry.name === '_data') continue;
      collectTemplates(full, found);
    } else if (entry.name.endsWith('.njk')) {
      found.push(full);
    }
  }
  return found;
}

test('templates use theme tokens instead of fixed Tailwind palette colours', () => {
  const offenders = [];

  for (const file of collectTemplates(TEMPLATE_ROOT)) {
    const rel = path.relative(TEMPLATE_ROOT, file).split(path.sep).join('/');
    const source = fs.readFileSync(file, 'utf8');

    // Only look inside class attributes: prose copy and comments may legitimately
    // mention a colour name.
    for (const attr of source.matchAll(/class="([^"]*)"/g)) {
      for (const match of attr[1].matchAll(UTILITY)) {
        const key = `${rel}:${match[0]}`;
        if (ALLOWED.has(key)) continue;
        offenders.push(key);
      }
    }
  }

  assert.deepStrictEqual(
    [...new Set(offenders)].sort(),
    [],
    'Fixed-palette utilities found in templates. Use a theme token ' +
      '(text-text-main, text-text-secondary, text-accent, bg-bg-main, ' +
      'bg-bg-interactive-strong, border-border-subtle, …) so the colour follows ' +
      'the active theme, or add a documented entry to ALLOWED in this test.'
  );
});

// A key is `<path>:<utility>`, and a utility may itself contain colons
// (`hover:text-white`), so split on the first colon only.
function splitKey(key) {
  const i = key.indexOf(':');
  return [key.slice(0, i), key.slice(i + 1)];
}

test('every ALLOWED exception still exists in the template it names', () => {
  for (const [key, reason] of ALLOWED) {
    const [rel, utility] = splitKey(key);
    const file = path.join(TEMPLATE_ROOT, rel);
    assert.ok(fs.existsSync(file), `ALLOWED names a missing template: ${rel} (${reason})`);
    const source = fs.readFileSync(file, 'utf8');
    assert.ok(
      source.includes(utility),
      `ALLOWED exception "${utility}" is no longer used in ${rel}; drop the entry.`
    );
  }
});
