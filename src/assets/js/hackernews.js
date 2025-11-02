document.addEventListener('DOMContentLoaded', () => {
  // Comment toggling
  document.querySelectorAll('.comments-section').forEach(container => {
    container.addEventListener('click', event => {
      const toggle = event.target.closest('.toggle-comment');
      if (toggle) {
        event.preventDefault();
        const commentContent = toggle.closest('.comment').querySelector('.comment-content');
        if (commentContent) {
          const isHidden = commentContent.classList.toggle('hidden');
          toggle.textContent = isHidden ? '[+]' : '[–]';
        }
      }
    });
  });

  // Filtering
  const scoreFilter = document.getElementById('score-filter');
  const keywordFilter = document.getElementById('keyword-filter');
  const storiesContainer = document.getElementById('stories-container');

  function applyFilters() {
    const minScore = parseInt(scoreFilter.value, 10) || 0;
    const keywords = keywordFilter.value.toLowerCase().split(',').map(k => k.trim()).filter(k => k);

    storiesContainer.querySelectorAll('.story').forEach(story => {
      const score = parseInt(story.dataset.score, 10);
      const title = story.dataset.title.toLowerCase();

      const scoreMatch = score >= minScore;
      const keywordMatch = keywords.length === 0 || keywords.some(k => title.includes(k));

      if (scoreMatch && keywordMatch) {
        story.style.display = 'block';
      } else {
        story.style.display = 'none';
      }
    });
  }

  scoreFilter.addEventListener('input', applyFilters);
  keywordFilter.addEventListener('input', applyFilters);

  // Reading Optimization
  const fontSizeSelector = document.getElementById('font-size-selector');
  const fontFamilySelector = document.getElementById('font-family-selector');
  const readerContainer = document.getElementById('hackernews-reader');
  const proseElements = readerContainer.querySelectorAll('.prose');

  function applyReadingOptimizations() {
    const selectedFontSize = fontSizeSelector.value;
    const fontSizes = ['text-sm', 'text-base', 'text-lg', 'text-xl'];
    fontSizes.forEach(size => readerContainer.classList.remove(size));
    readerContainer.classList.add(selectedFontSize);

    const selectedFontFamily = fontFamilySelector.value;
    const fontFamilies = ['font-sans', 'font-serif', 'font-mono'];
    fontFamilies.forEach(family => {
        readerContainer.classList.remove(family);
        proseElements.forEach(el => el.classList.remove(family));
    });
    readerContainer.classList.add(selectedFontFamily);
    proseElements.forEach(el => el.classList.add(selectedFontFamily));
  }

  fontSizeSelector.addEventListener('change', applyReadingOptimizations);
  fontFamilySelector.addEventListener('change', applyReadingOptimizations);

  readerContainer.classList.add('text-base');
});
