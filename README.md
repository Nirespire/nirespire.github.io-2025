# Sanjay Nair - Personal Website

## Overview

This project is my personal website/blog built using modern web development tools and practices:

- **Static Site Generator**: [11ty (Eleventy)](https://www.11ty.dev/) for fast and flexible static site generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Build Tools**: PostCSS, cssnano, and autoprefixer for CSS optimization
- **Hosting**: GitHub Pages with custom domain configuration
- **AI Assistance**: Developed with the help of AI tools including:
  - GitHub Copilot for code completion and pair programming
  - Claude 3.5 Sonnet for development assistance and content generation

## Setup

1. **Prerequisites**
   - Node.js (v22 or higher recommended)
   - npm (comes with Node.js)

2. **Install dependencies**  
   ```bash
   npm install
   ```

## Development

- **Start development server**
  ```bash
  npm run dev
  ```
  This will:
  - Build the initial CSS
  - Start the 11ty development server
  - Watch for CSS changes
  - Enable hot reloading

- **Build for production**
  ```bash
  npm run build
  ```
  This creates the production build in the `_site` directory.

- **Other available commands**:
  - `npm run start` - Start 11ty server only
  - `npm run build:css` - Build CSS only
  - `npm run watch:css` - Watch for CSS changes

## Project Structure

- `/src` - Source files
  - `/_includes` - Layout templates
  - `/assets` - CSS and images
  - `/blog` - Markdown blog posts
- `/_site` - Generated static site (not committed)
- `/postcss.config.js` - PostCSS configuration
- `/tailwind.config.js` - Tailwind CSS configuration
