# Sanjay Nair - Personal Website

[![Build and Deploy](https://github.com/Nirespire/nirespire.github.io-2025/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nirespire/nirespire.github.io-2025/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node Version](https://img.shields.io/badge/node-%5E22.14.0-brightgreen)](https://nodejs.org)
[![Playwright Tests](https://img.shields.io/badge/tested%20with-Playwright-45ba4b.svg)](https://playwright.dev/)
[![Built with 11ty](https://img.shields.io/badge/Built%20with-11ty-black)](https://11ty.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styled%20with-Tailwind-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

## Overview

This project is my personal website/blog built using modern web development tools and practices:

- **Static Site Generator**: [11ty (Eleventy)](https://www.11ty.dev/) for fast and flexible static site generation
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Build Tools**: PostCSS, cssnano, and autoprefixer for CSS optimization
- **Hosting**: GitHub Pages with custom domain configuration
- **Latest Reads**: Integration with Raindrop.io API to display recently read articles
- **AI Assistance**: Developed with the help of AI coding tools, including
  GitHub Copilot and Anthropic's Claude (via Claude Code) for development
  assistance and content generation

## Setup

1. **Prerequisites**
   - Node.js v22.14.0 or higher within the v22 line (see `engines` in
     `package.json` and `.nvmrc`)
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
  - `npm test` - Run the Playwright E2E suite, including the `a11y.spec.ts`
    accessibility scan that runs [axe-core](https://github.com/dequelabs/axe-core)
    against every main page. The accessibility check fails on any `serious` or
    `critical` WCAG 2.1 A/AA violation.
  - `npm run test:unit` - Run Node's built-in test runner over
    `tests/unit/*.test.js` (covers the Node scripts in `scripts/`).
  - `npm run lint` / `npm run lint:fix` - Run ESLint (autofix with `:fix`).
  - `npm run format` / `npm run format:check` - Run Prettier (write / verify).
  - `npm run verify` - The **canonical CI suite**: lint, format check, unit
    tests, production build, and Playwright E2E — all in one command. Both the
    PR and deploy workflows run this same command via
    `.github/actions/setup-and-test`, and so does the `pre-push` git hook
    ([`.githooks/pre-push`](./.githooks/README.md)), so local and CI results
    stay in lock-step.

## Testing & quality gates

- **End-to-end** — Playwright specs in `tests/*.spec.ts` run against the dev
  server on `localhost:8080` across Chromium, Firefox, and WebKit.
- **Accessibility** — `tests/a11y.spec.ts` uses
  [`@axe-core/playwright`](https://www.npmjs.com/package/@axe-core/playwright)
  and fails on any `serious` or `critical` WCAG 2.1 A/AA violation.
- **Unit** — `tests/unit/*.test.js` covers the Node scripts under `scripts/`
  with Node's built-in test runner.
- **Pre-push hook** — installed automatically by `npm install` (via the
  `prepare` script). Runs `npm run verify` before every push so a green local
  run guarantees a green CI run on the same code.

## Integrations

### Raindrop.io Latest Reads
The site automatically fetches and displays my latest read articles from Raindrop.io:

1. **Setup required environment variables and secrets**:
   - `RAINDROP_TEST_TOKEN` (GitHub Secret): Your Raindrop.io API test token.
   - `RAINDROP_SEARCH_TAG` (GitHub Variable): The tag to filter articles by (e.g., "to-share").

2. **How it works**:
   - GitHub Actions runs daily to fetch the 5 latest articles tagged with `RAINDROP_SEARCH_TAG`.
   - Articles are stored in `src/_data/raindrop.json`
   - Latest reads are displayed on the homepage.
   - The fetch can also be triggered manually via GitHub Actions.
   - The script `scripts/fetch-raindrop.js` handles the fetching.
   - The workflow is defined in `.github/workflows/update-raindrop.reads.yml`.

## Project Structure

- `/src` - Source files
  - `/_includes` - Layout templates
  - `/assets` - CSS and images
  - `/blog` - Markdown blog posts
- `/_site` - Generated static site (not committed)
- `/postcss.config.js` - PostCSS configuration
- `/tailwind.config.js` - Tailwind CSS configuration
