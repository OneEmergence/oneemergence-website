import { defineConfig, devices } from '@playwright/test'
import { loadEnvConfig } from '@next/env'

// Match the production server's .env loading so local auth checks are not
// silently skipped when credentials live in .env.local instead of the shell.
loadEnvConfig(process.cwd())

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
const serverPort = new URL(baseURL).port || '3000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // WebGL scenes and axe scans compete for the same GPU even in separate
  // contexts. One worker keeps local results reproducible; CLI can override.
  workers: 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  webServer: {
    command: `pnpm build && pnpm start --hostname 127.0.0.1 --port ${serverPort}`,
    url: new URL('/api/health', baseURL).href,
    reuseExistingServer: !process.env.CI && process.env.PLAYWRIGHT_REUSE_SERVER !== '0',
    timeout: 180000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
})
