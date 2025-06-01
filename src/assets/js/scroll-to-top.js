document.addEventListener('DOMContentLoaded', function() {
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const scrollThreshold = 100; // Pixels

  if (scrollToTopBtn) {
    // Show or hide the button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.scrollY > scrollThreshold) {
        scrollToTopBtn.style.display = 'block';
      } else {
        scrollToTopBtn.style.display = 'none';
      }
    });

    // Scroll to top when the button is clicked
    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Initially hide the button (in case the page is loaded at the top)
    // Or if the button is meant to be initially visible and then hidden on scroll down
    // For this specific request, it should be hidden initially if scrollY <= threshold
    if (window.scrollY <= scrollThreshold) {
        scrollToTopBtn.style.display = 'none';
    }

  } else {
    console.warn('Scroll to top button with ID "scrollToTopBtn" not found.');
  }
});
