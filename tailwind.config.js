/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,njk,md}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-bg-main)',
        },
        accent: 'var(--color-accent)',
        'text-main': 'var(--color-text-main)',
        'text-secondary': 'var(--color-text-secondary)',
        'bg-main': 'var(--color-bg-main)',
        'bg-interactive-strong': 'var(--color-bg-interactive-strong)',
        'text-interactive-strong': 'var(--color-text-interactive-strong)',
        'bg-interactive-soft': 'var(--color-bg-interactive-soft)',
        'link': 'var(--color-link-text)',
        'link-hover': 'var(--color-link-hover-text)',
        'selection-bg': 'var(--color-selection-bg)',
        'selection-text': 'var(--color-selection-text)',
        'border-subtle': 'var(--color-border-subtle)',
        'code-bg': 'var(--color-code-bg)',
        'code-text': 'var(--color-code-text)',
      },
      fontFamily: {
        sans: ['"Nebula Sans"', 'ui-sans-serif', 'system-ui']
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
};
