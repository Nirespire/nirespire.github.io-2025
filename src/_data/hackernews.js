const fetch = require('node-fetch');

module.exports = async function() {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
  const stories = await Promise.all(storyIds.slice(0, 30).map(async id => {
    const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    return await storyResponse.json();
  }));
  return stories;
};
