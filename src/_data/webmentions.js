const fs = require('fs').promises;
const path = require('path');

// Define the data file path
const DATA_FILE_PATH = path.resolve(__dirname, './webmentions.json');

// Webmention data is third-party and attacker-influenceable: anyone can send a
// webmention targeting the site, so author/target URLs and avatar sources are
// untrusted input. Nunjucks autoescaping stops HTML/attribute breakout, but it
// does NOT stop a `javascript:` (or `data:`) URL from executing when rendered
// into an href, and the page CSP allows inline script. Allow only http(s) URLs;
// anything else is dropped to an empty string so it renders inert.
function safeUrl(url) {
  if (typeof url !== 'string') return '';
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : '';
  } catch {
    return '';
  }
}

// Return a copy of a mention with its URL fields scheme-sanitized.
function sanitizeMention(mention) {
  const author = mention.author || {};
  return {
    ...mention,
    url: safeUrl(mention.url),
    author: {
      ...author,
      url: safeUrl(author.url),
      photo: safeUrl(author.photo),
    },
  };
}

// Function to process and categorize webmentions
function processWebmentions(mentions) {
  const safe = mentions.map(sanitizeMention);
  const likes = safe.filter((m) => m.activity.type === 'like');
  const reposts = safe.filter((m) => m.activity.type === 'repost');
  const replies = safe.filter((m) => m.activity.type === 'reply' || m.activity.type === 'mention');

  return {
    likes,
    reposts,
    replies,
  };
}

module.exports = async function () {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const webmentions = JSON.parse(data);
    return processWebmentions(webmentions.all || []);
  } catch (_err) {
    console.warn(
      'Webmentions: No data file found or error reading it. Returning empty webmentions.'
    );
    return processWebmentions([]);
  }
};

module.exports.processWebmentions = processWebmentions;
module.exports.sanitizeMention = sanitizeMention;
module.exports.safeUrl = safeUrl;
