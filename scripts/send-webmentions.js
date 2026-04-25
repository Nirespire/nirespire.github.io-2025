const webmention = require('@remy/webmention');
const fs = require('fs').promises;
const path = require('path');

const raindropFilePath = path.join(__dirname, '../src/_data/raindrop.json');
const cacheDir = path.join(__dirname, '../.cache');
const sentWebmentionsPath = path.join(cacheDir, 'sent-webmentions.json');
const sourceUrl = 'https://sanjaynair.me/reads';

async function main() {
  await fs.mkdir(cacheDir, { recursive: true });

  let sentWebmentions = {};
  try {
    const data = await fs.readFile(sentWebmentionsPath, 'utf8');
    sentWebmentions = JSON.parse(data);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error reading sent webmentions cache:', error);
      return;
    }
  }

  const raindropData = await fs.readFile(raindropFilePath, 'utf8');
  const items = JSON.parse(raindropData);

  for (const item of items) {
    const targetUrl = item.url;
    if (!sentWebmentions[targetUrl]) {
      console.log(`Sending webmention from ${sourceUrl} to ${targetUrl}`);
      try {
        const result = await webmention(sourceUrl, targetUrl, { send: true });
        if (result.success) {
          console.log(`Successfully sent webmention for: ${targetUrl}`);
          sentWebmentions[targetUrl] = new Date().toISOString();
        } else {
          console.error(`Failed to send webmention for ${targetUrl}:`, result.error);
        }
      } catch (error) {
        console.error(`Error sending webmention for ${targetUrl}:`, error);
      }
    }
  }

  await fs.writeFile(sentWebmentionsPath, JSON.stringify(sentWebmentions, null, 2));
  console.log('Finished sending webmentions.');
}

if (require.main === module) {
  main();
}
