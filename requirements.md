# Site Requirements and Technical Specification

## Overview
Personal website and blog for Sanjay Nair, a software engineering leader based in Atlanta, Georgia. The site is built as a static site generator using modern web development tools with a focus on performance, accessibility, and maintainability.

**Live URL**: https://sanjaynair.me  
**GitHub Repository**: Nirespire/nirespire.github.io-2025

---

## Technology Stack

### Core Technologies
- **Static Site Generator**: 11ty (Eleventy) v3.0.0
- **Template Engine**: Nunjucks (.njk files)
- **Content Format**: Markdown (.md files)
- **Styling**: Tailwind CSS v3.2.7
- **Build Tools**: PostCSS, Autoprefixer, cssnano
- **Testing**: Playwright v1.56.1 (E2E tests)
- **Node Version**: 22.14.0 (specified in package.json engines)
- **Package Manager**: npm

### Key Dependencies
```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.62.0",
    "gray-matter": "^4.0.3",
    "luxon": "^3.6.1",
    "markdown-it": "^14.1.0",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "@11ty/eleventy-plugin-rss": "^2.0.3",
    "@playwright/test": "^1.56.1",
    "@tailwindcss/typography": "^0.5.16",
    "autoprefixer": "^10.4.13",
    "concurrently": "^9.1.2",
    "cssnano": "^7.0.6",
    "dotenv": "^16.5.0",
    "postcss": "^8.4.21",
    "tailwindcss": "^3.2.7"
  }
}
```

---

## Project Structure

```
/
├── .eleventy.js                 # Eleventy configuration
├── package.json                 # Dependencies and scripts
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── playwright.config.ts         # Playwright test configuration
├── _headers                     # HTTP headers for caching
├── README.md                    # Project documentation
├── LICENSE                      # MIT License
│
├── src/                         # Source files
│   ├── index.njk               # Homepage template
│   ├── about.njk               # About page
│   ├── uses.njk                # Uses page
│   ├── 404.njk                 # 404 error page
│   ├── hallucination.njk       # Hallucination page
│   ├── feed.xml.njk            # RSS feed template
│   ├── sitemap.xml.njk         # Sitemap template
│   ├── robots.txt              # Robots.txt
│   │
│   ├── _data/                  # Data files
│   │   ├── raindrop.json      # Latest reads from Raindrop.io
│   │   ├── quotes.json        # Quotes data
│   │   └── hallucinations.json # AI-generated hallucinations
│   │
│   ├── _includes/              # Template includes
│   │   ├── layouts/
│   │   │   ├── base.njk       # Base layout template
│   │   │   └── post.njk       # Blog post layout
│   │   └── macros/            # Nunjucks macros
│   │
│   ├── assets/                 # Static assets
│   │   ├── css/
│   │   │   ├── styles.css     # Source CSS with theme variables
│   │   │   └── tailwind-built.css # Generated CSS (gitignored)
│   │   ├── images/            # Images and favicon
│   │   │   ├── profile.png
│   │   │   └── favicon.ico
│   │   └── js/                # JavaScript files
│   │       ├── theme-switcher.js
│   │       ├── llm-copy.js
│   │       ├── scroll-to-top.js
│   │       └── dev-console.js
│   │
│   ├── blog/                   # Blog posts (markdown)
│   │   └── *.md               # Individual blog posts
│   │
│   ├── reads/                  # Reads page templates
│   └── tags/                   # Tag pages
│
├── scripts/                    # Build and utility scripts
│   ├── fetch-raindrop.js      # Fetch latest reads from Raindrop.io
│   └── generate-hallucinations.js # Generate AI hallucinations
│
├── tests/                      # Playwright E2E tests
│   ├── 404.spec.ts
│   ├── blog.spec.ts
│   ├── fetch-raindrop.spec.ts
│   ├── home.spec.ts
│   ├── llm-copy.spec.ts
│   ├── reads.spec.ts
│   ├── tags.spec.ts
│   └── uses.spec.ts
│
├── static/                     # Static files copied to output
│   └── CNAME                  # Custom domain configuration
│
└── _site/                      # Generated output (gitignored)
```

---

## Build Configuration

### npm Scripts
```json
{
  "start": "npx eleventy --serve",
  "build:css": "npx tailwindcss -i ./src/assets/css/styles.css -o ./src/assets/css/tailwind-built.css --minify",
  "build": "npm run build:css && npx eleventy",
  "watch:css": "npx tailwindcss -i ./src/assets/css/styles.css -o ./src/assets/css/tailwind-built.css --watch",
  "dev": "npm run build && concurrently \"npm:start\" \"npm:watch:css\"",
  "test": "playwright test",
  "test:setup": "npx playwright install --with-deps",
  "test:ui": "playwright test --ui",
  "test:debug": "playwright test --debug"
}
```

### Eleventy Configuration (.eleventy.js)

**Key Features**:
- RSS plugin enabled
- Markdown-it with HTML, breaks, and linkify enabled
- Collections: `blog` collection sorted by date (newest first)
- Passthrough copy for assets (CSS, images, JS) and headers
- Custom filters:
  - `date`: Format dates using Luxon
  - `absoluteUrl`: Convert relative URLs to absolute
  - `getUniqueTags`: Extract unique tags from posts
  - `filterByTag`: Filter posts by tag
  - `wordcount`: Count words in text
  - `readingTime`: Estimate reading time
  - `split`: Split strings
  - `dichotomize`: Process collections

**Directory Structure**:
```javascript
{
  dir: {
    input: "src",
    output: "_site"
  },
  templateFormats: ["njk", "md", "html"],
  htmlTemplateEngine: "njk"
}
```

### Tailwind Configuration

**Content Sources**:
```javascript
content: ["./src/**/*.{html,njk,md}"]
```

**Custom Theme Extensions**:
```javascript
theme: {
  extend: {
    colors: {
      // CSS variable-based colors for theming
      'text-main': 'var(--color-text-main)',
      'text-secondary': 'var(--color-text-secondary)',
      'bg-main': 'var(--color-bg-main)',
      'accent': 'var(--color-accent)',
      'bg-interactive-strong': 'var(--color-bg-interactive-strong)',
      'text-interactive-strong': 'var(--color-text-interactive-strong)',
      'bg-interactive-soft': 'var(--color-bg-interactive-soft)',
      'link': 'var(--color-link-text)',
      'link-hover': 'var(--color-link-hover-text)',
      'selection-bg': 'var(--color-selection-bg)',
      'selection-text': 'var(--color-selection-text)',
      'border-subtle': 'var(--color-border-subtle)',
      'code-bg': 'var(--color-code-bg)',
      'code-text': 'var(--color-code-text)'
    },
    fontFamily: {
      sans: ['"Nebula Sans"', 'ui-sans-serif', 'system-ui']
    }
  }
}
```

**Plugins**: `@tailwindcss/typography`

### PostCSS Configuration

```javascript
{
  plugins: {
    'tailwindcss': {},
    'autoprefixer': {},
    'cssnano': {
      preset: ['default', {
        discardComments: { removeAll: true },
        normalizeWhitespace: true,
        minifyFontValues: true,
        colormin: true
      }]
    }
  }
}
```

---

## Theming System

### CSS Custom Properties

**Dark Theme (Default)**:
```css
:root {
  --color-bg-main: #2D2D2D;
  --color-text-main: #FFFFFF;
  --color-accent: #F97316;
  --color-text-secondary: #9CA3AF;
  --color-bg-interactive-strong: #1F2937;
  --color-text-interactive-strong: #FFFFFF;
  --color-bg-interactive-soft: #2D2D2D;
  --color-selection-bg: #3B82F6;
  --color-selection-text: #FFFFFF;
  --color-link-text: #FFFFFF;
  --color-link-hover-text: #F97316;
  --color-border-subtle: #4B5563;
  --color-code-bg: #1F2937;
  --color-code-text: #E5E7EB;
}
```

**Light Theme**:
```css
html.light {
  --color-bg-main: #FFFFFF;
  --color-text-main: #111827;
  --color-accent: #F97316;
  --color-text-secondary: #6B7280;
  --color-bg-interactive-strong: #E5E7EB;
  --color-text-interactive-strong: #111827;
  --color-bg-interactive-soft: #F3F4F6;
  --color-selection-bg: #3B82F6;
  --color-selection-text: #FFFFFF;
  --color-link-text: #111827;
  --color-link-hover-text: #F97316;
  --color-border-subtle: #D1D5DB;
  --color-code-bg: #F3F4F6;
  --color-code-text: #111827;
}
```

**Background Gradients**:
- Dark: Linear gradient from `var(--color-bg-main)` to `#111827`
- Light: Linear gradient from `var(--color-bg-main)` to `#e5e7eb`

**Theme Persistence**: Uses localStorage with key `'theme'`

---

## Page Templates and Layout

### Base Layout (`src/_includes/layouts/base.njk`)

**Required Front Matter Variables**:
- `title`: Page title
- `description` (optional): Meta description
- `coverImage` (optional): OpenGraph image
- `tags` (optional): Array of tags
- `page.url`: Provided by Eleventy

**Key Features**:
- Comprehensive meta tags (OpenGraph, Twitter)
- RSS feed link
- Theme color meta tag
- Preconnect and preload for performance
- Favicon and canonical URL
- Schema.org structured data
- Cache control headers
- Font: "Nebula Sans"

### Post Layout (`src/_includes/layouts/post.njk`)

Extends base layout, adds blog-specific features:
- Reading time display
- Tag navigation
- Cover images
- Post metadata

---

## Content Structure

### Blog Posts

**Location**: `src/blog/*.md`

**Required Front Matter**:
```yaml
---
title: "Post Title"
date: YYYY-MM-DD
tags: ["tag1", "tag2"]
subtitle: "Optional subtitle"
readingTime: "5 min read" # Optional
coverImage: "/path/to/image.jpg" # Optional
description: "Post description for SEO"
---
```

**Features**:
- Markdown content with markdown-it parser
- HTML allowed in markdown
- Automatic link detection
- Line breaks converted to `<br>`
- Collection: `collections.blog` (sorted newest first)
- URL structure: `/blog/slug/`

---

## JavaScript Features

### Theme Switcher (`theme-switcher.js`)
- Toggle between light/dark themes
- localStorage persistence
- Icon updates (sun/moon)
- Default: Dark theme
- Applies `.light` class to `<html>` element

### LLM Copy Feature (`llm-copy.js`)
- Copy content to clipboard
- Visual feedback on copy action
- Direct sharing to Claude, ChatGPT, and Gemini
- Fallback for older browsers

### Other Scripts
- `scroll-to-top.js`: Smooth scroll to top functionality
- `dev-console.js`: Development console utilities

---

## External Integrations

### Raindrop.io Integration

**Purpose**: Fetch and display latest read articles

**Configuration**:
- **Script**: `scripts/fetch-raindrop.js`
- **Output**: `src/_data/raindrop.json`
- **Workflow**: `.github/workflows/update-raindrop.reads.yml`

**Environment Variables**:
- `RAINDROP_TEST_TOKEN`: API token (GitHub Secret)
- `RAINDROP_SEARCH_TAG`: Tag to filter by (GitHub Variable)

**Behavior**:
- Fetches 5 latest articles with specified tag
- Validates links (checks for 404s)
- Runs daily via GitHub Actions
- Can be manually triggered

### Hallucination Generation

**Purpose**: Generate humorous AI-generated summaries

**Configuration**:
- **Script**: `scripts/generate-hallucinations.js`
- **Output**: `src/_data/hallucinations.json`
- **Workflow**: `.github/workflows/generate-hallucinations.yml`
- **API**: Anthropic Claude (claude-sonnet-4-0)

**Environment Variables**:
- `ANTHROPIC_API_KEY`: API key for Claude

---

## Testing

### Playwright Configuration

**Test Location**: `tests/`

**Test Suites**:
- `404.spec.ts`: 404 page functionality
- `blog.spec.ts`: Blog listing and posts
- `fetch-raindrop.spec.ts`: Raindrop integration
- `home.spec.ts`: Homepage
- `llm-copy.spec.ts`: LLM copy feature
- `reads.spec.ts`: Reads page
- `tags.spec.ts`: Tag pages
- `uses.spec.ts`: Uses page

**Configuration**:
```typescript
{
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry'
  },
  projects: ['chromium', 'firefox', 'webkit']
}
```

**Test Server**: Runs `npm run dev` on localhost:8080

---

## Deployment

### GitHub Pages

**Hosting**: GitHub Pages with custom domain (sanjaynair.me)

**Deploy Workflow**: `.github/workflows/deploy.yml`

**Process**:
1. Checkout code
2. Setup Node.js 20
3. Cache Playwright browsers
4. Install dependencies (`npm ci`)
5. Install Playwright browsers
6. Run tests (`npm run test`)
7. Build site (`npm run build`)
8. Upload artifact from `_site/`
9. Deploy to GitHub Pages

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch

**Permissions**:
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

### Caching Strategy (_headers)

```
/assets/*: Cache-Control: public, max-age=604800, immutable
/*.html: Cache-Control: public, max-age=86400
/*: Cache-Control: public, max-age=604800
```

---

## SEO and Performance

### Meta Tags
- Primary meta tags (title, description, author, keywords)
- OpenGraph (og:type, og:url, og:title, og:description, og:image)
- Twitter Card (summary_large_image, creator, title, description, image)
- Canonical URLs
- RSS feed link

### Performance Optimizations
- Preconnect to external domains
- Preload critical CSS and images
- Minified CSS with cssnano
- Image optimization (fetchpriority="high" for above-fold)
- Service Worker (`sw.js`)
- Cache-Control headers

### Accessibility
- Semantic HTML
- Alt text for images
- ARIA labels where needed
- Theme color meta tag
- Proper heading hierarchy

### Structured Data
- Schema.org JSON-LD for Person/Blog
- Sitemap.xml
- Robots.txt

---

## Data Files

### `src/_data/raindrop.json`
Latest reads from Raindrop.io (generated by script)

### `src/_data/quotes.json`
Array of quote objects:
```json
[
  {
    "text": "Quote text",
    "author": "Author Name"
  }
]
```

### `src/_data/hallucinations.json`
AI-generated hallucinations (generated by script)

---

## Site Pages

### Core Pages
- **Home** (`index.njk`): Profile, latest post, latest reads
- **About** (`about.njk`): About the author
- **Blog** (`blog/index.njk`): Blog post listing
- **Reads** (`reads/index.njk`): Latest reads from Raindrop.io
- **Uses** (`uses.njk`): Tools and technologies used
- **Tags** (`tags/index.njk`): Tag cloud and tag pages
- **Hallucination** (`hallucination.njk`): AI-generated content
- **404** (`404.njk`): Error page

### Generated Pages
- RSS Feed (`feed.xml`)
- Sitemap (`sitemap.xml`)
- Individual blog posts
- Individual tag pages

---

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Development server runs on `http://localhost:8080` with hot reload.

### Building for Production
```bash
npm run build
```

Outputs to `_site/` directory.

### Running Tests
```bash
# Install Playwright browsers (first time)
npm run test:setup

# Run all tests
npm test

# Run with UI
npm run test:ui

# Debug mode
npm run test:debug
```

---

## Browser Support
- Latest 2 versions of major browsers
- Chromium, Firefox, WebKit (tested via Playwright)
- Progressive enhancement approach
- Graceful degradation for older browsers

---

## Code Style and Best Practices

### General
- 2-space indentation
- Meaningful variable/function names
- Single-purpose functions
- 100 character line limit
- JSDoc comments for complex code

### Web Development
- Semantic HTML
- WCAG 2.1 AA accessibility compliance
- Mobile-first responsive design
- Progressive enhancement
- Tailwind utility-first approach

### Performance Targets
- Lighthouse score > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1

---

## License
MIT License

---

## Author Information
- **Name**: Sanjay Nair
- **Email**: email@sanjaynair.dev
- **Twitter**: @Nirespire
- **Location**: Atlanta, Georgia
- **Role**: Software Engineering Leader

---

## Additional Notes

### Files Not Committed to Git
- `_site/` (generated output)
- `node_modules/`
- `src/assets/css/tailwind-built.css` (generated CSS)
- `playwright-report/`
- `test-results/`
- `.env` (environment variables)

### Custom Domain
CNAME file contains: `sanjaynair.me`

### Font
"Nebula Sans" is the primary font family (ensure it's loaded via web fonts or local)

### Color Scheme
- Primary accent color: Orange (#F97316)
- Dark background: #2D2D2D
- Light background: #FFFFFF
- Smooth transitions between themes (0.3s ease)

---

## Quick Start for AI Models

To recreate this site from scratch:

1. Initialize npm project with Node.js 22+
2. Install dependencies from package.json
3. Create directory structure as specified
4. Configure Eleventy, Tailwind, PostCSS, and Playwright
5. Set up base layout with theme system
6. Create CSS with custom properties for theming
7. Add JavaScript for theme switching and LLM copy
8. Configure GitHub Actions workflows
9. Set up external integrations (Raindrop.io, Anthropic)
10. Deploy to GitHub Pages

**Note**: Blog post content is excluded from this specification and should be created separately or migrated from existing sources.
