const { DateTime } = require('luxon');
const path = require('path');
const markdownIt = require('markdown-it');
const pluginRss = require('@11ty/eleventy-plugin-rss').rssPlugin;
const { eleventyImageTransformPlugin } = require('@11ty/eleventy-img');

module.exports = function (eleventyConfig) {
  // Add RSS plugin
  eleventyConfig.addPlugin(pluginRss);

  // Transform <img> tags in the rendered HTML into responsive <picture>
  // elements with AVIF/WebP/JPEG variants. Avoids async-shortcode races with
  // `templateContent` consumers (index.njk, blog/index.njk, tags/tag.njk,
  // feed.xml.njk) by running after templates render.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['avif', 'webp', 'jpeg'],
    widths: [400, 800, 1200, 'auto'],
    urlPath: '/assets/images/optimized/',
    outputDir: './_site/assets/images/optimized/',
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: '(min-width: 1024px) 800px, 100vw',
    },
    filenameFormat: function (id, src, width, format) {
      const ext = path.extname(src);
      const name = path.basename(src, ext);
      return `${name}-${width}w-${id}.${format}`;
    },
  });

  // Add absolute URL filter for RSS
  eleventyConfig.addFilter('absoluteUrl', (url, base) => {
    return new URL(url, base).toString();
  });

  // Configure markdown-it
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });
  eleventyConfig.setLibrary('md', markdownLibrary);

  // Copy assets with cache busting
  eleventyConfig.addPassthroughCopy({
    'src/assets/css': 'assets/css',
    'src/assets/images': 'assets/images',
    'src/assets/js': 'assets/js',
  });

  // Add cache control headers
  eleventyConfig.addPassthroughCopy({
    _headers: '_headers',
  });

  eleventyConfig.addCollection('blog', function (collectionApi) {
    return collectionApi.getFilteredByGlob('src/blog/*.md').sort((a, b) => {
      return b.date - a.date;
    });
  });

  eleventyConfig.addFilter('date', (dateObj, format = 'LLL d, yyyy') => {
    if (!dateObj) {
      return '';
    }
    if (typeof dateObj === 'string') {
      try {
        return DateTime.fromISO(dateObj).toFormat(format);
      } catch (e) {
        console.error('Error parsing date:', dateObj, e);
        return dateObj;
      }
    }
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(format);
  });

  eleventyConfig.addFilter('getUniqueTags', function (posts) {
    const tags = {};
    posts.forEach((post) => {
      if (post.data.tags) {
        post.data.tags.forEach((tag) => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tags);
  });

  eleventyConfig.addFilter('filterByTag', function (posts, tag) {
    return posts.filter((post) => post.data.tags && post.data.tags.includes(tag));
  });

  eleventyConfig.addFilter('dichotomize', (collections) => {
    let result = {};
    for (let key in collections) {
      if (collections[key] && Array.isArray(collections[key])) {
        result[key] = collections[key];
      }
    }
    return result;
  });

  // Add word count filter
  eleventyConfig.addFilter('wordcount', function (text) {
    return text.split(/\s+/g).length;
  });

  // Add reading time estimate filter
  eleventyConfig.addFilter('readingTime', function (wordCount) {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute);
  });

  eleventyConfig.addFilter('split', function (str, separator) {
    if (typeof str !== 'string') {
      return [];
    }
    return str.split(separator);
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
    },
    templateFormats: ['njk', 'md', 'html'],
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
