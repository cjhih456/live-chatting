import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec next dev -p 3000',
    cwd: __dirname,
    url: 'http://127.0.0.1:3000/login',
    reuseExistingServer: true,
    timeout: 180_000,
    env: {
      ...process.env,
      CI: '',
      NEXT_PUBLIC_API_ORIGIN: 'http://127.0.0.1:4010',
      NEXT_PUBLIC_DATA_SOURCE: 'mock',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
