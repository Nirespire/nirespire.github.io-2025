# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development server:**
```bash
npm run dev
```
This builds CSS, starts the 11ty server, and watches for CSS changes with hot reloading.

**Build for production:**
```bash
npm run build
```
Builds optimized CSS and generates the static site in `_site/` directory.

**Testing:**
```bash
npm test           # Run Playwright tests
npm run test:ui    # Run tests with UI
npm run test:debug # Debug mode
```

**Individual commands:**
```bash
npm run start      # 11ty server only
npm run build:css  # Build Tailwind CSS only
npm run watch:css  # Watch CSS changes only
```

## Architecture Overview

This is a personal blog/website built with **11ty (Eleventy)** static site generator:

- **Template Engine**: Nunjucks (.njk files)
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Content**: Markdown blog posts in `src/blog/`
- **Layouts**: Base template in `src/_includes/layouts/base.njk`
- **Assets**: CSS, images, and JavaScript in `src/assets/`
- **Data**: External API integration with Raindrop.io for latest reads

## Key Files & Structure

- `src/` - Source files (templates, content, assets)
- `src/blog/` - Markdown blog posts 
- `src/_includes/layouts/` - Nunjucks layout templates
- `src/assets/css/styles.css` - Source Tailwind CSS
- `src/assets/css/tailwind-built.css` - Generated CSS (do not edit)
- `tailwind.config.js` - Tailwind configuration with custom theme colors
- `playwright.config.ts` - E2E test configuration
- `_site/` - Generated static site (excluded from git)

## Theming System

Uses CSS custom properties for light/dark theme support:
- Theme colors defined in `tailwind.config.js` reference CSS variables
- Theme switching handled by `theme-switcher.js`
- Custom colors: `--color-bg-main`, `--color-text-main`, `--color-accent`, etc.

## Raindrop.io Integration

The site fetches latest read articles via GitHub Actions:
- Script: `scripts/fetch-raindrop.js`
- Data stored in: `src/_data/raindrop.json`
- Requires `RAINDROP_TEST_TOKEN` and `RAINDROP_SEARCH_TAG` environment variables

## LLM Copy Feature

Custom JavaScript functionality in `src/assets/js/llm-copy.js` provides:
- Copy content to clipboard
- Direct sharing to Claude, ChatGPT, and Gemini with pre-filled content

## Testing

Playwright E2E tests in `tests/` directory:
- Tests run against development server on localhost:8080
- Configured for Chromium, Firefox, and WebKit
- Uses `npm run dev` as the test server command