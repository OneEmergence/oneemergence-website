import { defineConfig } from '@playwright/test'

// Pure logic only (journal save scheduling, guide request decisions); no browser or server.
export default defineConfig({
  testDir: './tests',
  testMatch: /(journal|guide)\/.*\.spec\.ts$/,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
})
