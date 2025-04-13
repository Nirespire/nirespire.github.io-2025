/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{html,njk,md}",
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: "#2D2D2D", // dark grey
            blue: "#3B82F6"     // brighter blue (tailwind blue-500)
          },
          accent: "#F97316"     // orange accent
        },
        fontFamily: {
          sans: ['"Nebula Sans"', 'ui-sans-serif', 'system-ui']
        },
        typography: {
          DEFAULT: {
            css: {
              color: '#fff',
              h1: { color: '#3B82F6' },
              h2: { color: '#3B82F6' },
              h3: { color: '#3B82F6' },
              h4: { color: '#3B82F6' },
              strong: { color: '#fff' },
              a: { 
                color: '#F97316',
                '&:hover': {
                  color: '#3B82F6'
                }
              },
              code: { color: '#F97316' },
              blockquote: {
                color: '#fff',
                borderLeftColor: '#3B82F6'
              }
            }
          }
        }
      }
    },
    plugins: [
      require('@tailwindcss/typography')
    ]
  };
