const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', '..', '.github', 'workflows');

// actions/checkout persists GITHUB_TOKEN into .git/config by default, where
// every later step can read it — including the install scripts of every
// dependency `npm ci` runs. No checkout may do that (#413, #424): jobs that
// push authenticate git only inside their push step, via environment-scoped
// config (GIT_CONFIG_COUNT / GIT_CONFIG_KEY_0 / GIT_CONFIG_VALUE_0).
function checkoutSteps(src) {
  const lines = src.split('\n');
  const steps = [];
  lines.forEach((line, i) => {
    if (!/uses:\s*actions\/checkout@/.test(line)) return;
    const indent = line.search(/\S/);
    const body = [];
    for (let j = i + 1; j < lines.length; j++) {
      const next = lines[j];
      if (next.trim() === '') continue;
      // The step ends at the next list item or anything indented less.
      if (next.search(/\S/) < indent || /^\s*- /.test(next)) break;
      body.push(next);
    }
    steps.push({ line: i + 1, body: body.join('\n') });
  });
  return steps;
}

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
  const src = fs.readFileSync(path.join(dir, file), 'utf8');
  const steps = checkoutSteps(src);
  if (steps.length === 0) continue;

  test(`${file}: every checkout sets persist-credentials: false`, () => {
    for (const step of steps) {
      assert.match(
        step.body,
        /^\s*persist-credentials:\s*false\s*$/m,
        `${file}:${step.line} checks out without persist-credentials: false — the token ` +
          `would sit in .git/config for every later step`
      );
    }
  });
}

test('the checkout scan finds steps in both inline and named form', () => {
  const steps = checkoutSteps(
    [
      'steps:',
      '  - uses: actions/checkout@abc # v7',
      '    with:',
      '      persist-credentials: false',
      '  - name: Checkout',
      '    uses: actions/checkout@abc # v7',
      '  - run: echo hi',
    ].join('\n')
  );
  assert.equal(steps.length, 2);
  assert.match(steps[0].body, /persist-credentials: false/);
  assert.equal(steps[1].body, '');
});
