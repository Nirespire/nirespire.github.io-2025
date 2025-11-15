# AI Assistant Guide for This Repository

This file provides guidance to AI assistants when working with code in this repository.

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

---

## Code Style & Formatting
- Use consistent indentation (2 spaces for this project)
- Follow TypeScript strict mode guidelines
- Use meaningful and descriptive variable/function names
- Keep functions focused and single-purpose
- Limit line length to 100 characters
- Use proper JSDoc comments for functions and complex code blocks

## Web Development Best Practices
- Follow Eleventy.js and Nunjucks templating best practices
- Implement responsive design principles using Tailwind CSS
- Ensure WCAG 2.1 AA accessibility compliance
- Use semantic HTML elements appropriately
- Implement progressive enhancement
- Follow mobile-first design principles

## Performance
- Minimize and optimize assets (images, CSS, JavaScript)
- Implement lazy loading for images and heavy content
- Use appropriate caching strategies
- Keep bundle sizes minimal
- Implement code splitting where beneficial

## Testing
- Write meaningful Playwright tests for all new features
- Include accessibility tests
- Test across multiple browsers (Chrome, Firefox, Safari)
- Test responsive layouts across different viewport sizes
- Maintain test coverage for critical user paths

## Security
- Implement Content Security Policy headers
- Sanitize user inputs
- Use HTTPS for all external resources
- Follow OWASP security guidelines
- Properly escape dynamic content

## SEO & Metadata
- Include appropriate meta tags
- Implement structured data where relevant
- Ensure proper heading hierarchy
- Use descriptive alt text for images
- Include robots.txt and sitemap.xml

## Git Practices
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Follow conventional commit format
- Reference issues in commits where applicable

## Documentation
- Document all new features and changes
- Keep README up to date
- Include inline documentation for complex logic
- Document build and deployment processes

## Dependencies
- Keep dependencies up to date
- Audit dependencies for security vulnerabilities
- Use exact versions in package.json
- Document major dependency updates

## Performance Metrics
- Maintain Lighthouse score above 90
- Keep First Contentful Paint under 1.5s
- Ensure Time to Interactive under 3.5s
- Optimize Largest Contentful Paint under 2.5s
- Keep Cumulative Layout Shift below 0.1

## Build Process
- Ensure clean builds with no warnings
- Optimize asset bundling and minification
- Implement proper source maps
- Use appropriate environment variables

## Error Handling
- Implement proper error boundaries
- Log errors appropriately
- Provide user-friendly error messages
- Handle edge cases gracefully

## Browser Support
- Support latest two versions of major browsers
- Implement graceful degradation
- Test on both desktop and mobile devices
- Consider reduced motion preferences
