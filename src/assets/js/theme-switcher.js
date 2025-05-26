const themeToggleBtn = document.getElementById('theme-toggle');
const lightIcon = document.getElementById('theme-toggle-light-icon');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const htmlElement = document.documentElement;

// Function to update icon visibility
function updateIcons(theme) {
  if (theme === 'light') {
    lightIcon.classList.remove('hidden');
    darkIcon.classList.add('hidden');
  } else {
    darkIcon.classList.remove('hidden');
    lightIcon.classList.add('hidden');
  }
}

// On page load, check localStorage and apply theme
// Initialize to dark theme if no preference is found or if 'dark' is explicitly set.
let currentTheme = localStorage.getItem('theme');

if (currentTheme === 'light') {
  htmlElement.classList.add('light');
  updateIcons('light');
} else {
  // Default to dark: ensure 'light' class is removed and dark icon is shown.
  // This handles both 'dark' in localStorage and null (no preference).
  htmlElement.classList.remove('light'); 
  localStorage.setItem('theme', 'dark'); // Explicitly set to dark if no preference
  updateIcons('dark');
}

// Event listener for the toggle button
themeToggleBtn.addEventListener('click', () => {
  htmlElement.classList.toggle('light');
  const newTheme = htmlElement.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  updateIcons(newTheme);
});
