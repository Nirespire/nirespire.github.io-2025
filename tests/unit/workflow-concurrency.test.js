const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', '..', '.github', 'workflows');

// Every workflow must declare `concurrency` so overlapping runs are cancelled
// (PR-triggered) or serialised (jobs that push to main) instead of racing.
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
  test(`${file} declares concurrency`, () => {
    const src = fs.readFileSync(path.join(dir, file), 'utf8');
    assert.match(src, /^concurrency:/m);
  });
}
