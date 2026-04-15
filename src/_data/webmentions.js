const fs = require('fs').promises;
const path = require('path');

// Define the data file path
const DATA_FILE_PATH = path.resolve(__dirname, './webmentions.json');

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
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const webmentions = JSON.parse(data);
    return processWebmentions(webmentions.all || []);
  } catch (err) {
    console.warn('Webmentions: No data file found or error reading it. Returning empty webmentions.');
    return processWebmentions([]);
  }
};
