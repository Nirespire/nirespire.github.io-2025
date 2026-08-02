const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

const { buildUmamiConfig, DEFAULT_SRC, DEFAULT_DOMAINS } = require('../../src/_data/analytics.js');

const UMAMI_ENV_KEYS = ['UMAMI_WEBSITE_ID', 'UMAMI_SRC', 'UMAMI_DOMAINS'];
const originalEnv = {};

// buildUmamiConfig defaults to process.env, and a real .env or CI variable would
// otherwise leak into these assertions — clear the keys around every test.
beforeEach(() => {
  for (const key of UMAMI_ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of UMAMI_ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

test('is disabled when UMAMI_WEBSITE_ID is unset', () => {
  assert.deepEqual(buildUmamiConfig({}), { enabled: false });
});

test('is disabled when UMAMI_WEBSITE_ID is blank', () => {
  assert.equal(buildUmamiConfig({ UMAMI_WEBSITE_ID: '   ' }).enabled, false);
});

test('reads process.env by default', () => {
  assert.equal(buildUmamiConfig().enabled, false);
  process.env.UMAMI_WEBSITE_ID = 'from-process-env';
  assert.equal(buildUmamiConfig().websiteId, 'from-process-env');
});

test('defaults to umami cloud and the production domain', () => {
  const config = buildUmamiConfig({ UMAMI_WEBSITE_ID: 'abc-123' });

  assert.equal(config.enabled, true);
  assert.equal(config.websiteId, 'abc-123');
  assert.equal(config.src, DEFAULT_SRC);
  assert.equal(config.domains, DEFAULT_DOMAINS);
  assert.equal(config.origin, 'https://cloud.umami.is');
});

test('trims surrounding whitespace on the website id', () => {
  assert.equal(buildUmamiConfig({ UMAMI_WEBSITE_ID: '  abc-123  ' }).websiteId, 'abc-123');
});

test('derives the CSP origin from a self-hosted UMAMI_SRC', () => {
  const config = buildUmamiConfig({
    UMAMI_WEBSITE_ID: 'abc-123',
    UMAMI_SRC: 'https://analytics.example.com/umami/script.js',
  });

  assert.equal(config.src, 'https://analytics.example.com/umami/script.js');
  assert.equal(config.origin, 'https://analytics.example.com');
});

test('honours a UMAMI_DOMAINS override', () => {
  const config = buildUmamiConfig({
    UMAMI_WEBSITE_ID: 'abc-123',
    UMAMI_DOMAINS: 'sanjaynair.me,www.sanjaynair.me',
  });

  assert.equal(config.domains, 'sanjaynair.me,www.sanjaynair.me');
});

test('is disabled when UMAMI_SRC is not parseable', () => {
  const config = buildUmamiConfig({ UMAMI_WEBSITE_ID: 'abc-123', UMAMI_SRC: 'not a url' });

  assert.deepEqual(config, { enabled: false });
});

test('is disabled when UMAMI_SRC is not https', () => {
  // An http source in script-src would weaken the policy for every page.
  const config = buildUmamiConfig({
    UMAMI_WEBSITE_ID: 'abc-123',
    UMAMI_SRC: 'http://analytics.example.com/script.js',
  });

  assert.deepEqual(config, { enabled: false });
});
