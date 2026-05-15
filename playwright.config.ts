import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    // In CI, build once and serve the static _site over Python's http.server.
    // The dev script's concurrently+watch combo plus the eleventy-img cold pass
    // (every /assets/images/* into AVIF/WebP/JPEG variants) is slow and brittle
    // under Playwright's webServer wait. Locally, keep the watch flow.
    command: process.env.CI
      ? 'npm run build && cd _site && python3 -m http.server 8080'
      : 'npm run dev',
    url: 'http://localhost:8080',
    timeout: 300 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
