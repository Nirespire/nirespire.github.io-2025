const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
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
      return collectionApi.getFilteredByGlob("src/blog/*.md");
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

    // Add reading time estimate filter
    eleventyConfig.addFilter("readingTime", function(text) {
      const wordsPerMinute = 200;
      const numberOfWords = text.split(/\s/g).length;
      const minutes = Math.ceil(numberOfWords / wordsPerMinute);
      return `${minutes} min read`;
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