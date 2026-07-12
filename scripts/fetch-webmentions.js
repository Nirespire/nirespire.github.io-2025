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

async function fetchWebmentions() {
  const token = process.env.WEBMENTION_IO_TOKEN;
  const outputPath = getOutputPath();

  if (!token) {
    console.warn('WEBMENTION_IO_TOKEN is not set. Using dummy data for testing.');
    const dummyData = {
      all: [],
      timestamp: Date.now(),
    };
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(dummyData, null, 2));
    return dummyData;
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

  const data = {
    all: feed.links,
    timestamp: Date.now(),
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(data, null, 2));
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

module.exports = { fetchWebmentions, setFetchForTest };
