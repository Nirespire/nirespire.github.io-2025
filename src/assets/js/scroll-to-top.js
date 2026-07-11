document.addEventListener('DOMContentLoaded', function () {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const scrollThreshold = 100; // Pixels

  if (!scrollToTopBtn) {
    console.warn('Scroll to top button with ID "scrollToTopBtn" not found.');
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Show or hide the button based on scroll position. Only write to the DOM when
  // the visible state actually changes, to avoid style thrash on every event.
  let isVisible = null;
  function updateVisibility() {
    const shouldShow = window.scrollY > scrollThreshold;
    if (shouldShow === isVisible) return;
    isVisible = shouldShow;
    scrollToTopBtn.style.display = shouldShow ? 'block' : 'none';
  }

  // The handler never calls preventDefault, so mark it passive: the browser can
  // keep scrolling smoothly without waiting on it.
  window.addEventListener('scroll', updateVisibility, { passive: true });

  // Scroll to top when the button is clicked, honoring reduced-motion.
  scrollToTopBtn.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion.matches ? 'auto' : 'smooth',
    });
  });

  // Set the correct initial visibility (page may not load at the top).
  updateVisibility();
});
