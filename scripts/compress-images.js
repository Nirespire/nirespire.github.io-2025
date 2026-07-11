// scripts/compress-images.js
//
// Bring images within the size budgets enforced by
// tests/unit/image-budget.test.js (budgets defined in scripts/image-budgets.js).
//
// Usage:
//   npm run compress-images                 # scan src/assets/images, fix every over-budget file
//   npm run compress-images -- <file...>    # fix specific files
//
// Recompresses in place, keeping filename and format, by walking a ladder of
// progressively smaller widths and lower encode qualities until the file fits
// its budget. Exits non-zero if a file cannot be brought within budget
// (e.g. animated GIFs, which sharp cannot meaningfully recompress — convert
// those to a video or webp instead).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { BUDGETS, IMAGE_DIRS } = require('./image-budgets');

const WIDTHS = [1600, 1400, 1200, 1000, 800];
const QUALITIES = [90, 80, 70, 60];

if (require.main === module) {
  main(process.argv.slice(2)).then((ok) => process.exit(ok ? 0 : 1));
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function encode(pipeline, ext, quality) {
  if (ext === '.png') {
    return pipeline.png({ palette: true, quality, compressionLevel: 9, effort: 7 });
  }
  if (ext === '.jpg' || ext === '.jpeg') {
    return pipeline.jpeg({ quality, mozjpeg: true });
  }
  if (ext === '.webp') {
    return pipeline.webp({ quality });
  }
  return null;
}

// Returns the smallest compliant buffer, or null if no ladder step fits.
async function compressWithinBudget(file, budget) {
  const ext = path.extname(file).toLowerCase();
  for (const width of WIDTHS) {
    for (const quality of QUALITIES) {
      const pipeline = sharp(file).resize({ width, withoutEnlargement: true });
      const encoded = encode(pipeline, ext, quality);
      if (!encoded) {
        return null;
      }
      const buffer = await encoded.toBuffer();
      if (buffer.length <= budget) {
        return buffer;
      }
    }
  }
  return null;
}

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const budget = BUDGETS[ext];
  const label = path.relative(process.cwd(), file);
  if (budget === undefined) {
    console.error(`✗ ${label}: no budget defined for ${ext} (add one in scripts/image-budgets.js)`);
    return false;
  }
  const originalSize = fs.statSync(file).size;
  if (originalSize <= budget) {
    console.log(`  ${label}: ${kb(originalSize)} — already within budget`);
    return true;
  }
  const buffer = await compressWithinBudget(file, budget);
  if (!buffer) {
    console.error(
      `✗ ${label}: ${kb(originalSize)} cannot be brought under ${kb(budget)} ` +
        `(unsupported format or too complex — convert it manually)`
    );
    return false;
  }
  fs.writeFileSync(file, buffer);
  console.log(`✓ ${label}: ${kb(originalSize)} -> ${kb(buffer.length)} (budget ${kb(budget)})`);
  return true;
}

function kb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

async function main(args) {
  const files =
    args.length > 0 ? args.map((f) => path.resolve(f)) : IMAGE_DIRS.flatMap((dir) => walk(dir));
  let ok = true;
  for (const file of files) {
    ok = (await processFile(file)) && ok;
  }
  return ok;
}

module.exports = { compressWithinBudget, processFile, main };
