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
            blue: "#1E3A8A"     // dark blue
          },
          accent: "#F97316"     // orange accent
        },
        fontFamily: {
          sans: ['"Nebula Sans"', 'ui-sans-serif', 'system-ui']
        }
      }
    },
    plugins: []
  };
  