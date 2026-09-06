import { defineConfig } from '@playwright/test'

// Persistence scheduling uses controlled promises/timers; no browser or server.
export default defineConfig({
  testDir: './tests/journal',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
})
