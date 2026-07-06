const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const { compressWithinBudget, processFile } = require('../../scripts/compress-images.js');
const { BUDGETS } = require('../../scripts/image-budgets.js');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compress-images-test-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

// Random noise is the worst case for PNG compression, so an over-budget
// noise image exercises the full resize/quality ladder.
async function writeNoisePng(file, width, height) {
  const raw = crypto.randomBytes(width * height * 3);
  await sharp(raw, { raw: { width, height, channels: 3 } })
    .png()
    .toFile(file);
}

test('brings an over-budget png within the png budget', async () => {
  const file = path.join(tmpDir, 'huge.png');
  await writeNoisePng(file, 1600, 1200);
  assert.ok(fs.statSync(file).size > BUDGETS['.png'], 'fixture must start over budget');

  const buffer = await compressWithinBudget(file, BUDGETS['.png']);
  assert.ok(buffer, 'expected the ladder to find a compliant encoding');
  assert.ok(buffer.length <= BUDGETS['.png'], 'result must be within budget');

  const meta = await sharp(buffer).metadata();
  assert.equal(meta.format, 'png', 'format must be preserved');
});

test('processFile leaves files already within budget untouched', async () => {
  const file = path.join(tmpDir, 'small.png');
  await sharp({
    create: { width: 100, height: 100, channels: 3, background: { r: 20, g: 40, b: 80 } },
  })
    .png()
    .toFile(file);
  const before = fs.readFileSync(file);

  const ok = await processFile(file);

  assert.equal(ok, true);
  assert.deepEqual(fs.readFileSync(file), before, 'compliant file must not be rewritten');
});

test('processFile rewrites an over-budget file in place, within budget', async () => {
  const file = path.join(tmpDir, 'banner.png');
  await writeNoisePng(file, 1600, 1200);

  const ok = await processFile(file);

  assert.equal(ok, true);
  assert.ok(fs.statSync(file).size <= BUDGETS['.png']);
});

test('processFile fails on extensions with no budget', async () => {
  const file = path.join(tmpDir, 'movie.mp4');
  fs.writeFileSync(file, 'not really a video');

  assert.equal(await processFile(file), false);
});
