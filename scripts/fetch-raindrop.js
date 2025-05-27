// scripts/fetch-raindrop.js

const fs = require('fs').promises;
const path = require('path');

// Since node-fetch is an ESM-only module, we need to use dynamic import
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
  main(); // Call main function after fetch is loaded
}).catch(err => {
  console.error('Failed to load node-fetch:', err);
  process.exit(1);
});

const RAINDROP_API_URL = 'https://api.raindrop.io/rest/v1/raindrops/0'; // 0 is for "Unsorted" or "All" collection, check API for specifics if needed
const OUTPUT_PATH = path.join(__dirname, '../src/_data/raindrop.json');

async function main() {
  console.log('Starting fetch-raindrop.js script...');

  const testToken = process.env.RAINDROP_TEST_TOKEN;
  const searchTag = process.env.RAINDROP_SEARCH_TAG;

  if (!testToken) {
    console.error('Error: RAINDROP_TEST_TOKEN environment variable is not set.');
    process.exit(1);
  }
  if (!searchTag) {
    console.error('Error: RAINDROP_SEARCH_TAG environment variable is not set.');
    process.exit(1);
  }

  console.log(`Fetching items with tag: #${searchTag}`);

  try {
    const queryParams = new URLSearchParams({
      search: `#${searchTag}`,
      sort: '-created', // Sort by creation date descending
      perpage: 5, // Get 5 items
      // collection: 'all' // This might be default or handled by using collection ID 0
    });

    const response = await fetch(`${RAINDROP_API_URL}?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Error fetching data from Raindrop.io: ${response.status} ${response.statusText}`);
      console.error('Error details:', errorBody);
      process.exit(1);
    }

    const data = await response.json();

    if (!data.items || !Array.isArray(data.items)) {
        console.error('Error: Unexpected data structure from Raindrop.io API. "items" array not found.');
        console.error('Received data:', JSON.stringify(data, null, 2));
        process.exit(1);
    }
    
    console.log(`Successfully fetched ${data.items.length} items.`);

    const transformedData = data.items.map(item => ({
      title: item.title || '',
      url: item.link || '',
      excerpt: item.excerpt || item.note || '', // Use note as fallback for excerpt
      dateAdded: new Date(item.created).toISOString(), // Ensure ISO string format
    }));

    await fs.writeFile(OUTPUT_PATH, JSON.stringify(transformedData, null, 2));
    console.log(`Successfully wrote ${transformedData.length} items to ${OUTPUT_PATH}`);

  } catch (error) {
    console.error('An error occurred during the fetch process:', error);
    process.exit(1);
  }
}
