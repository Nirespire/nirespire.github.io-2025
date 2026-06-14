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

module.exports = { notesByUrl };
