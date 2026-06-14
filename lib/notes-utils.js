'use strict';

/**
 * Build a lookup map from a shared read's URL to the note that annotates it.
 *
 * Notes are joined to "latest reads" (raindrop.json) by the note's `read`
 * front-matter field, because raindrop.json is fully overwritten on every
 * sync and cannot itself carry note data.
 *
 * The notes collection is expected to be sorted newest-first; when more than
 * one note targets the same read we keep the first (newest) one for inline
 * contexts. All notes still appear individually on the /notes index.
 *
 * @param {Array<{data?: {read?: string}}>} notes 11ty notes collection
 * @returns {Object<string, object>} map of read URL -> note item
 */
function notesByUrl(notes) {
  const map = {};
  (notes || []).forEach((note) => {
    const url = note && note.data && note.data.read;
    if (url && !map[url]) {
      map[url] = note;
    }
  });
  return map;
}

/**
 * Resolve site-relative blog backlink URLs into { url, title } objects so
 * templates can display the linked post's title instead of a bare URL.
 *
 * @param {string[]} urls site-relative blog post URLs (e.g. "/blog/foo/")
 * @param {Array<{url: string, data?: {title?: string}}>} blog 11ty blog collection
 * @returns {Array<{url: string, title: string}>}
 */
function resolveBacklinks(urls, blog) {
  if (!Array.isArray(urls)) {
    return [];
  }
  return urls.map((url) => {
    const match = (blog || []).find((post) => post.url === url);
    return { url, title: match && match.data && match.data.title ? match.data.title : url };
  });
}

module.exports = { notesByUrl, resolveBacklinks };
