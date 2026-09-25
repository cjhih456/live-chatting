import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const repoRoot = path.join(__dirname, '../..');
const mockOrigin = 'http://127.0.0.1:4010';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: [
    {
      command:
        'pnpm exec ts-node --transpile-only --compiler-options \'{"module":"commonjs","moduleResolution":"node","esModuleInterop":true}\' libs/data/src/msw/listen.ts',
      cwd: repoRoot,
      url: `${mockOrigin}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        CI: '',
        NEXT_PUBLIC_API_ORIGIN: mockOrigin,
        EXPO_PUBLIC_API_ORIGIN: mockOrigin,
        NEXT_PUBLIC_DATA_SOURCE: 'mock',
      },
    },
    {
      command: 'pnpm exec next dev -p 3000',
      cwd: __dirname,
      url: 'http://127.0.0.1:3000/login',
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      env: {
        ...process.env,
        CI: '',
        NEXT_PUBLIC_API_ORIGIN: mockOrigin,
        NEXT_PUBLIC_DATA_SOURCE: 'mock',
      },
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
