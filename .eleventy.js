const { DateTime } = require('luxon');
const markdownIt = require('markdown-it');
const pluginRss = require('@11ty/eleventy-plugin-rss').rssPlugin;

module.exports = function (eleventyConfig) {
  // Add RSS plugin
  eleventyConfig.addPlugin(pluginRss);

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
  // Code blocks can scroll horizontally; make them keyboard-focusable so
  // keyboard users can scroll them (axe: scrollable-region-focusable).
  for (const rule of ['fence', 'code_block']) {
    const defaultRender =
      markdownLibrary.renderer.rules[rule] ||
      ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
    markdownLibrary.renderer.rules[rule] = (tokens, idx, options, env, self) => {
      const html = defaultRender(tokens, idx, options, env, self);
      return html.replace('<pre>', '<pre tabindex="0">');
    };
  }

  // In-post images sit below the fold (the cover banner is templated in
  // post.njk), so defer them instead of blocking initial page load.
  const defaultImageRenderer =
    markdownLibrary.renderer.rules.image ||
    ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options));
  markdownLibrary.renderer.rules.image = (tokens, idx, options, env, self) => {
    tokens[idx].attrSet('loading', 'lazy');
    tokens[idx].attrSet('decoding', 'async');
    return defaultImageRenderer(tokens, idx, options, env, self);
  };

  eleventyConfig.setLibrary('md', markdownLibrary);

  // Render an arbitrary markdown string to HTML (reuses the configured lib).
  // Used for Raindrop-authored notes on the reads pages.
  eleventyConfig.addFilter('renderMarkdown', (str) => {
    if (typeof str !== 'string') {
      return '';
    }
    return markdownLibrary.render(str);
  });

  // Copy assets with cache busting
  eleventyConfig.addPassthroughCopy({
    'src/assets/css': 'assets/css',
    'src/assets/images': 'assets/images',
    'src/assets/js': 'assets/js',
  });

  // robots.txt is plain text — not in templateFormats, so we passthrough copy
  // it explicitly so it ends up at the site root.
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });

  // Wedding archive — copied verbatim (no Nunjucks templating) to /archive/wedding/
  eleventyConfig.addPassthroughCopy({
    archive: 'archive',
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
