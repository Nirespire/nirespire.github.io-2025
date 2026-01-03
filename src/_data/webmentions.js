const fs = require('fs').promises;
const path = require('path');
const fetch = require('node-fetch');

// Define the cache file path
const CACHE_FILE_PATH = path.resolve(__dirname, '../../.cache/webmentions.json');
const DOMAIN = 'sanjaynair.net';
const TOKEN = process.env.WEBMENTION_IO_TOKEN;

// Function to write to the cache file
async function writeToCache(data) {
  try {
    await fs.mkdir(path.dirname(CACHE_FILE_PATH), { recursive: true });
    await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to cache:', err);
  }
}

// Function to read from the cache file
async function readFromCache() {
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, 'utf8');
    const cache = JSON.parse(data);

    // Cache is valid for 1 hour
    const isCacheValid = (Date.now() - cache.timestamp) < 3600000;

    if (isCacheValid) {
      console.log('Webmentions: serving from cache.');
      return cache.webmentions;
    }
  } catch (err) {
    // Cache miss or error reading file
  }
  return null;
}

// Function to fetch webmentions from the API
async function fetchWebmentions() {
  if (!TOKEN) {
    console.warn('WEBMENTION_IO_TOKEN is not set. Skipping webmention fetch.');
    return [];
  }

  const url = `https://webmention.io/api/mentions.json?domain=${DOMAIN}&token=${TOKEN}&per-page=1000`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch webmentions: ${response.statusText}`);
    }
    const feed = await response.json();
    console.log(`Webmentions: ${feed.links.length} webmentions fetched from API.`);

    const webmentions = {
      all: feed.links,
      timestamp: Date.now()
    };

    await writeToCache({ webmentions, timestamp: Date.now() });

    return webmentions;
  } catch (err) {
    console.error('Error fetching webmentions:', err.message);
    // On error, try to serve from cache even if stale
    const cachedMentions = await readFromCache();
    if (cachedMentions) {
        console.log('Webmentions: serving stale data from cache due to API error.');
        return cachedMentions;
    }
    return [];
  }
}

// Function to process and categorize webmentions
function processWebmentions(mentions) {
  const likes = mentions.filter(m => m.activity.type === 'like');
  const reposts = mentions.filter(m => m.activity.type === 'repost');
  const replies = mentions.filter(m => m.activity.type === 'reply' || m.activity.type === 'mention');

  return {
    likes,
    reposts,
    replies,
  };
}

module.exports = async function() {
  const cachedMentions = await readFromCache();
  if (cachedMentions) {
    return processWebmentions(cachedMentions.all);
  }

  const newMentions = await fetchWebmentions();
  return processWebmentions(newMentions.all || []);
};
