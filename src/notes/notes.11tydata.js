module.exports = {
  layout: 'layouts/note.njk',
  tags: [],
  eleventyComputed: {
    title: (data) => {
      if (data.title) return data.title;
      if (data.read) {
        const source = (data.raindrop || []).find((r) => r.url === data.read);
        const label = source ? source.title : data.read;
        return `Note on ${label}`;
      }
      const d = data.date instanceof Date ? data.date : new Date(data.date);
      const formatted = d.toLocaleString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      return `Note from ${formatted}`;
    },
  },
};
