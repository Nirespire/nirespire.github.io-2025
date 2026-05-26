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
    // In CI: build once (cold image processing ~2 min), then serve with
    // eleventy's BrowserSync (warm cache ~20s). This avoids the double-build
    // and tailwindcss watch noise from `npm run dev`, while still getting
    // correct 404 handling from BrowserSync (unlike Python's http.server).
    command: process.env.CI ? 'npm run build && npx eleventy --serve' : 'npm run dev',
    url: 'http://localhost:8080',
    timeout: 300 * 1000,
    reuseExistingServer: !process.env.CI,
  },
});
