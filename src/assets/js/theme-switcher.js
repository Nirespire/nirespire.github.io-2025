const themeToggleBtn = document.getElementById('theme-toggle');
const lightIcon = document.getElementById('theme-toggle-light-icon');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const htmlElement = document.documentElement;

// Function to update icon visibility
function updateIcons(theme) {
  if (!lightIcon || !darkIcon) return;
  if (theme === 'light') {
    lightIcon.classList.remove('hidden');
    darkIcon.classList.add('hidden');
  } else {
    darkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
  }
}

// On page load, resolve the active theme:
//  1. An explicit choice the user made previously (localStorage) always wins.
//  2. Otherwise follow the OS's prefers-color-scheme, defaulting to dark.
// We intentionally do NOT persist the resolved default here — writing it would
// freeze the first-visit OS state and stop future OS changes from being picked
// up. Only an explicit toggle (below) persists a preference.
let currentTheme = localStorage.getItem('theme');

if (!currentTheme) {
  currentTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

if (currentTheme === 'light') {
  htmlElement.classList.add('light');
  updateIcons('light');
} else {
  htmlElement.classList.remove('light');
  updateIcons('dark');
}

// Event listener for the toggle button. The toggle is not guaranteed to exist
// on every page that loads this script, so guard before wiring it up —
// otherwise a missing button throws and kills every other script on the page.
if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    htmlElement.classList.toggle('light');
    const newTheme = htmlElement.classList.contains('light') ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    updateIcons(newTheme);
  });
}
