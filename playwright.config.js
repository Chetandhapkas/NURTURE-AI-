const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: 'https://localhost:5173',

    // Allow Vite's self-signed HTTPS certificate
    ignoreHTTPSErrors: true,

    trace: 'on-first-retry',

    screenshot: 'only-on-failure',

    video: 'retain-on-failure',
  },

  webServer: [
    {
      command: 'npm run dev',
      url: 'https://localhost:5173',
      cwd: '.',
      reuseExistingServer: true,
      timeout: 120000,
      ignoreHTTPSErrors: true,
    },
    {
      command: 'npm run backend',
      url: 'http://localhost:8080/api/auth/test',
      cwd: '.',
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },
  ],
});