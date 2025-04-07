const { DateTime } = require("luxon");

module.exports = function(eleventyConfig) {
    // Copy assets such as images and CSS to the output
    eleventyConfig.addPassthroughCopy("src/assets");

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
  
    return {
      dir: {
        input: "src",
        output: "_site"
      },
      templateFormats: ["njk", "md", "html"],
      htmlTemplateEngine: "njk"
    };
  };