document.addEventListener('DOMContentLoaded', function() {
  const progressBar = document.getElementById('readingProgressBar');

  if (progressBar) {
    // Update progress bar on scroll
    window.addEventListener('scroll', function() {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Calculate the scroll percentage
      const scrollableHeight = documentHeight - windowHeight;
      const scrollPercentage = (scrollTop / scrollableHeight) * 100;

      // Update the width of the progress bar
      progressBar.style.width = scrollPercentage + '%';
    });

    // Set initial width on page load
    const initialScrollTop = window.scrollY || document.documentElement.scrollTop;
    const initialWindowHeight = window.innerHeight;
    const initialDocumentHeight = document.documentElement.scrollHeight;
    const initialScrollableHeight = initialDocumentHeight - initialWindowHeight;
    const initialScrollPercentage = (initialScrollTop / initialScrollableHeight) * 100;
    progressBar.style.width = initialScrollPercentage + '%';

  } else {
    console.warn('Reading progress bar with ID "readingProgressBar" not found.');
  }
});
