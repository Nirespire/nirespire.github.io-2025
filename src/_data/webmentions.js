const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

// Define the cache file path - using src/_data so it can be committed
const CACHE_FILE_PATH = path.resolve(__dirname, 'webmentions.json');
const DOMAIN = 'sanjaynair.me';
const TOKEN = process.env.WEBMENTION_IO_TOKEN;

// Function to write to the cache file
async function writeToCache(data) {
  try {
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to cache:', err);
  }
}

// Function to read from the cache file
async function readFromCache() {
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    // Cache miss or error reading file
  }
  return null;
}

// Function to fetch webmentions from the API
async function fetchWebmentions() {
  if (!TOKEN) {
    console.warn('WEBMENTION_IO_TOKEN is not set. Skipping webmention fetch.');
    return null;
  }

  const url = `https://webmention.io/api/mentions.json?domain=${DOMAIN}&token=${TOKEN}&per-page=1000`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch webmentions: ${response.statusText}`);
    }
    const feed = await response.json();
    console.log(`Webmentions: ${feed.links.length} webmentions fetched from API.`);

    const webmentionsData = {
      all: feed.links,
      timestamp: Date.now()
    };

    await writeToCache(webmentionsData);

    return webmentionsData;
  } catch (err) {
    console.error('Error fetching webmentions:', err.message);
    return null;
  }
}

// Function to process and categorize webmentions
function processWebmentions(mentions) {
  if (!mentions || !Array.isArray(mentions)) {
    return { likes: [], reposts: [], replies: [] };
  }

  const likes = mentions.filter(m => m.activity && m.activity.type === 'like');
  const reposts = mentions.filter(m => m.activity && m.activity.type === 'repost');
  const replies = mentions.filter(m => m.activity && (m.activity.type === 'reply' || m.activity.type === 'mention'));

  return {
    likes,
    reposts,
    replies,
  };
}

module.exports = async function() {
  let webmentionsData = await fetchWebmentions();

  if (!webmentionsData) {
    console.log('Webmentions: Falling back to local cache.');
    webmentionsData = await readFromCache();
  }

  return processWebmentions(webmentionsData ? webmentionsData.all : []);
};
