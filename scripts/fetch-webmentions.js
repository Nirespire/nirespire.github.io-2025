// scripts/fetch-webmentions.js

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

const DOMAIN = 'sanjaynair.me';
const TOKEN = process.env.WEBMENTION_IO_TOKEN;
const OUTPUT_PATH = path.join(__dirname, '../src/_data/webmentions.json');

async function fetchWebmentions() {
  if (!TOKEN) {
    console.warn('WEBMENTION_IO_TOKEN is not set. Using dummy data for testing.');
    const dummyData = {
        all: [],
        timestamp: Date.now()
    };
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(dummyData, null, 2));
    return;
  }

  console.log(`Fetching webmentions for ${DOMAIN}...`);
  const url = `https://webmention.io/api/mentions.json?domain=${DOMAIN}&token=${TOKEN}&per-page=1000`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch webmentions: ${response.statusText}`);
    }
    const feed = await response.json();
    console.log(`Webmentions: ${feed.links.length} webmentions fetched from API.`);

    const data = {
      all: feed.links,
      timestamp: Date.now()
    };

    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2));
    console.log(`Successfully wrote webmentions to ${OUTPUT_PATH}`);

  } catch (err) {
    console.error('Error fetching webmentions:', err.message);
    process.exit(1);
  }
}

fetchWebmentions();
