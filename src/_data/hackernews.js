const fetch = require('node-fetch');

async function fetchComments(commentIds, depth = 0) {
  if (!commentIds || depth > 2) { // Stop recursion after two levels of comments
    return [];
  }
  return Promise.all(commentIds.map(async id => {
    const response = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const comment = await response.json();
    if (comment) {
      // Recursively fetch nested comments, but increment the depth
      comment.comments = await fetchComments(comment.kids, depth + 1);
    }
    return comment;
  }));
}

module.exports = async function() {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
  const storyIds = await response.json();
  const stories = await Promise.all(storyIds.slice(0, 10).map(async id => {
    const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    const story = await storyResponse.json();
    if (story) {
      story.comments = await fetchComments(story.kids);
    }
    return story;
  }));
  return stories;
};
