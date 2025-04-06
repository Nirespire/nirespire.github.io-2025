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
  
    return {
      dir: {
        input: "src",
        output: "_site"
      },
      templateFormats: ["njk", "md", "html"],
      htmlTemplateEngine: "njk"
    };
  };