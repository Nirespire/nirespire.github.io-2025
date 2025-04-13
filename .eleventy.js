const { DateTime } = require("luxon");
const markdownIt = require("markdown-it");

module.exports = function(eleventyConfig) {
    // Configure markdown-it
    let markdownLibrary = markdownIt({
      html: true,
      breaks: true,
      linkify: true
    });
    eleventyConfig.setLibrary("md", markdownLibrary);

    // Copy assets with cache busting
    eleventyConfig.addPassthroughCopy({
      "src/assets/css": "assets/css",
      "src/assets/images": "assets/images"
    });

    // Add cache control headers
    eleventyConfig.addPassthroughCopy({
      "_headers": "_headers"
    });

    eleventyConfig.addCollection("blog", function(collectionApi) {
      return collectionApi.getFilteredByGlob("src/blog/*.md").sort((a, b) => {
        return b.date - a.date;
      });
    });

    eleventyConfig.addFilter("date", (dateObj, format = "LLL d, yyyy") => {
      return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(format);
    });

    eleventyConfig.addFilter("getUniqueTags", function(posts) {
      const tags = {};
      posts.forEach(post => {
        if (post.data.tags) {
          post.data.tags.forEach(tag => {
            tags[tag] = (tags[tag] || 0) + 1;
          });
        }
      });
      return Object.entries(tags);
    });

    eleventyConfig.addFilter("filterByTag", function(posts, tag) {
      return posts.filter(post => post.data.tags && post.data.tags.includes(tag));
    });

    eleventyConfig.addFilter("dichotomize", collections => {
      let result = {};
      for (let key in collections) {
        if (collections[key] && Array.isArray(collections[key])) {
          result[key] = collections[key];
        }
      }
      return result;
    });

    // Add word count filter
    eleventyConfig.addFilter("wordcount", function(text) {
      return text.split(/\s+/g).length;
    });

    // Add reading time estimate filter
    eleventyConfig.addFilter("readingTime", function(wordCount) {
      const wordsPerMinute = 200;
      return Math.ceil(wordCount / wordsPerMinute);
    });

    return {
      dir: {
        input: "src",
        output: "_site"
      },
      templateFormats: ["njk", "md", "html"],
      htmlTemplateEngine: "njk"
    };
  };