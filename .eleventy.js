const markdownIt = require('markdown-it');
const pluginRss = require('@11ty/eleventy-plugin-rss').rssPlugin;
const { eleventyImageTransformPlugin } = require('@11ty/eleventy-img');
const { wordcount, readingTime, formatDate, split, jsonString } = require('./src/_lib/filters');
const { IMAGE_WIDTHS, IMAGE_SIZES } = require('./scripts/image-budgets');

module.exports = function (eleventyConfig) {
  // Add RSS plugin
  eleventyConfig.addPlugin(pluginRss);

  // Responsive images. Every <img> in rendered HTML is rewritten into a
  // <picture> with a webp + original-format srcset, so a 1408px cover is no
  // longer shipped whole into a 192px-tall card. The full-size original stays
  // on disk untouched — og:image/twitter:image still point at it, which is why
  // the sources cannot simply be downscaled instead.
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: 'html',
    formats: ['webp', 'auto'],
    widths: IMAGE_WIDTHS,
    urlPath: '/assets/img/',
    outputDir: './_site/assets/img/',
    // Write real files in `--serve` too, instead of eleventy-img's dynamic
    // /.11ty/image/ dev endpoint, so the dev server the E2E suite runs against
    // serves exactly the markup and files a production build does.
    transformOnRequest: false,
    // Anything that is not a local file under _site (the wedding archive's
    // relative paths, any future remote URL) is left exactly as authored.
    failOnError: false,
    // sharp's PNG defaults are lossless and produce files several times larger
    // than the sources; quantize the same way `npm run compress-images` does so
    // the original-format fallback never outweighs the image it replaces.
    sharpPngOptions: { palette: true, quality: 90, compressionLevel: 9, effort: 7 },
    sharpJpegOptions: { quality: 82, mozjpeg: true },
    sharpWebpOptions: { quality: 80 },
    defaultAttributes: {
      loading: 'lazy',
      decoding: 'async',
      sizes: IMAGE_SIZES,
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

  // static/ is copied verbatim to the site root. It holds CNAME, which is what
  // pins the GitHub Pages custom domain to sanjaynair.me — without it in the
  // deployed artifact, re-enabling Pages drops the custom domain and the site
  // only answers on the github.io project URL.
  eleventyConfig.addPassthroughCopy({ static: '.' });

  // Wedding archive — copied verbatim (no Nunjucks templating) to /archive/wedding/
  eleventyConfig.addPassthroughCopy({
    archive: 'archive',
  });

  eleventyConfig.addCollection('blog', function (collectionApi) {
    return collectionApi.getFilteredByGlob('src/blog/*.md').sort((a, b) => {
      return b.date - a.date;
    });
  });

  eleventyConfig.addFilter('date', formatDate);

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

  // Emits a complete, JSON-escaped string literal (quotes included) for the
  // Schema.org JSON-LD block in base.njk. Used with `| safe`, because HTML
  // autoescaping is the wrong escaper for a JSON document — see the filter.
  eleventyConfig.addFilter('jsonString', jsonString);

  eleventyConfig.addFilter('wordcount', wordcount);
  eleventyConfig.addFilter('readingTime', readingTime);
  eleventyConfig.addFilter('split', split);

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
