import { defineConfig, devices } from '@playwright/test'

/**
 * E2E tests target the **Vite production preview** of the React SPA (same UI as embedded in Tauri).
 * Native Tauri shell / WebView is out of scope for this harness — see ADR-0004.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'line' : 'list',
  // Login password: set BIZCODE_SEED_SUPERADMIN_PASSWORD in CI/env (see e2e/helpers and critical-paths.spec.ts).
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 200,
      animations: 'disabled',
    },
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm run build:web && pnpm --filter @bizcode/web exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
