const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const sharp = require('sharp');

// sharp reads only the first frame/page of a source by default, which
// silently flattens an animated GIF into a still image once eleventy-img
// runs it through the responsive-image transform. `sharpOptions: { animated:
// true }` in .eleventy.js is what preserves every frame — this guards that
// config actually produces multi-frame output for the one animated source in
// the repo (see CLAUDE.md's "Responsive images" section and
// scripts/image-budgets.js's `.gif` budget comment). Nothing else in
// test:unit asserts frame count survives the transform, which is why this
// regression landed silently.

const repoRoot = path.join(__dirname, '..', '..');

const ANIMATED_SOURCE = path.join(
  repoRoot,
  'src',
  'assets',
  'images',
  'blog',
  '2019-06-11-why-i-think-software-should-be-rewritten-every-three-years',
  '1xpp9ITHW9tW79mxsqk3BOCw.gif'
);

// Pulls the exact `sharpOptions` passed to eleventyImageTransformPlugin out
// of .eleventy.js, the same way tests/unit/custom-domain.test.js reads its
// passthrough config — so this test exercises the real build config rather
// than a copy that can drift from it.
function imageTransformOptions() {
  let options;
  const noop = () => {};
  const stub = {
    addPlugin: (plugin, opts) => {
      if (opts && 'sharpOptions' in opts) {
        options = opts;
      }
    },
    addFilter: noop,
    setLibrary: noop,
    addCollection: noop,
    addPassthroughCopy: noop,
  };
  require(path.join(repoRoot, '.eleventy.js'))(stub);
  return options;
}

test('the responsive-image transform preserves all frames of the animated blog GIF', async () => {
  const { sharpOptions } = imageTransformOptions();
  assert.ok(sharpOptions, 'eleventyImageTransformPlugin must be configured with sharpOptions');

  const sourceMeta = await sharp(ANIMATED_SOURCE, sharpOptions).metadata();
  assert.ok(
    sourceMeta.pages > 1,
    'fixture must itself be a multi-frame source, or this test proves nothing'
  );

  // Exercise the same read + resize path the transform runs at build time,
  // using the widths eleventy-img actually generates for this source.
  const resized = await sharp(ANIMATED_SOURCE, sharpOptions).resize(400).webp().toBuffer();
  const outputMeta = await sharp(resized, sharpOptions).metadata();

  assert.ok(
    outputMeta.pages > 1,
    `expected the transformed output to keep more than 1 frame, got ${outputMeta.pages}`
  );
});
