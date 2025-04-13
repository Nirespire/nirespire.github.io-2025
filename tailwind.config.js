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
            maxWidth: '75ch',
            h1: { 
              color: '#3B82F6',
              lineHeight: '1.3',
              fontWeight: '700',
              letterSpacing: '-0.025em'
            },
            h2: { 
              color: '#3B82F6',
              lineHeight: '1.4',
              fontWeight: '600',
              marginTop: '2em'
            },
            h3: { 
              color: '#3B82F6',
              lineHeight: '1.4',
              fontWeight: '600'
            },
            h4: { 
              color: '#3B82F6',
              fontWeight: '600'
            },
            strong: { color: '#fff' },
            a: { 
              color: '#F97316',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                color: '#3B82F6',
                borderBottomColor: '#3B82F6'
              }
            },
            code: { 
              color: '#F97316',
              backgroundColor: 'rgba(249, 115, 22, 0.1)',
              padding: '0.2em 0.4em',
              borderRadius: '0.25em'
            },
            pre: {
              backgroundColor: 'rgba(45, 45, 45, 0.8)',
              backdropFilter: 'blur(4px)',
              code: {
                backgroundColor: 'transparent',
                padding: 0
              }
            },
            blockquote: {
              color: '#fff',
              borderLeftColor: '#3B82F6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '1em 1.5em',
              borderRadius: '0.5em'
            },
            ul: {
              li: {
                '&::marker': {
                  color: '#F97316'
                }
              }
            }
          }
        }
      }
    },
    plugins: [
      require('@tailwindcss/typography')
    ]
  }
};
