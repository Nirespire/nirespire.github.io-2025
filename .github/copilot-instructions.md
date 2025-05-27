# Copilot Rules for Web Development Standards

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
