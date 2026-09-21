// scripts/fetch-webmentions.js

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const DOMAIN = 'sanjaynair.me';
const DEFAULT_OUTPUT_PATH = path.join(__dirname, '../src/_data/webmentions.json');

// Abort a hung request so a stalled upstream can't hang the CI job indefinitely.
const FETCH_TIMEOUT_MS = 10000;

let fetchImpl = global.fetch;

function getOutputPath() {
  return process.env.WEBMENTIONS_OUTPUT_PATH || DEFAULT_OUTPUT_PATH;
}

// Read the currently committed data file, or null if it is absent/unparseable.
async function readExisting(outputPath) {
  try {
    return JSON.parse(await fs.readFile(outputPath, 'utf8'));
  } catch {
    return null;
  }
}

function sameMentions(previous, links) {
  return (
    previous !== null &&
    typeof previous === 'object' &&
    Array.isArray(previous.all) &&
    typeof previous.timestamp === 'number' &&
    JSON.stringify(previous.all) === JSON.stringify(links)
  );
}

// `timestamp` records when the mention list last *changed*, not when this job
// last ran.
//
// Stamping every run with `Date.now()` made the file differ on every run even
// when webmention.io returned an identical list, so update-webmentions.yml
// committed a one-line no-op *and* dispatched a full build + 3-browser E2E +
// Pages deploy every single day. Nothing in the site reads `timestamp` — it is
// not referenced by any template, filter or data file — so holding it steady
// while `all` is unchanged keeps the file byte-identical and lets the
// workflow's `git diff --staged --quiet` short-circuit the commit and deploy.
async function writeWebmentions(outputPath, links) {
  const previous = await readExisting(outputPath);
  const data = {
    all: links,
    timestamp: sameMentions(previous, links) ? previous.timestamp : Date.now(),
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2) + '\n');
  return data;
}

async function fetchWebmentions() {
  const token = process.env.WEBMENTION_IO_TOKEN;
  const outputPath = getOutputPath();

  if (!token) {
    console.warn('WEBMENTION_IO_TOKEN is not set. Using dummy data for testing.');
    return writeWebmentions(outputPath, []);
  }

  console.log(`Fetching webmentions for ${DOMAIN}...`);
  const url = `https://webmention.io/api/mentions.json?domain=${DOMAIN}&token=${token}&per-page=1000`;

  const response = await fetchImpl(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch webmentions: ${response.statusText}`);
  }
  const feed = await response.json();
  if (!feed || !Array.isArray(feed.links)) {
    throw new Error('Unexpected webmention.io response: "links" array not found.');
  }
  console.log(`Webmentions: ${feed.links.length} webmentions fetched from API.`);

  const data = await writeWebmentions(outputPath, feed.links);
  console.log(`Successfully wrote webmentions to ${outputPath}`);
  return data;
}

function setFetchForTest(fn) {
  fetchImpl = fn;
}

if (require.main === module) {
  fetchWebmentions().catch((err) => {
    console.error('Error fetching webmentions:', err.message);
    process.exit(1);
  });
}

module.exports = { fetchWebmentions, setFetchForTest, writeWebmentions, sameMentions };
