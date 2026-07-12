import { test, expect } from '@playwright/test'

const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL)

test.describe('Portal entry auth forms', () => {
  test.skip(!supabaseConfigured, 'Skipped: NEXT_PUBLIC_SUPABASE_URL is required')

  test('/portal renders login and signup options', async ({ page }) => {
    await page.goto('/portal', { waitUntil: 'domcontentloaded' })

    await expect(page.getByRole('button', { name: 'Anmelden' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    await expect(page.getByRole('button', { name: 'Registrieren' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    await expect(page.locator('#login-email')).toBeVisible()
    await expect(page.locator('#login-password')).toBeVisible()
    await expect(page.getByRole('button', { name: /Mit Google anmelden/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Login-Link senden/i })).toBeVisible()
  })

  test('/portal can switch to signup', async ({ page }) => {
    await page.goto('/portal', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Registrieren' }).click()

    await expect(page.locator('#signup-name')).toBeVisible()
    await expect(page.locator('#signup-email')).toBeVisible()
    await expect(page.locator('#signup-password')).toBeVisible()
  })

  test('/portal skips video when reduced motion is requested', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/portal', { waitUntil: 'domcontentloaded' })

    await expect(page.locator('[data-motion-level="sacred"]')).toBeVisible()
    await expect(page.locator('video')).toHaveCount(0)
    await context.close()
  })
})

test.describe('Password reset page', () => {
  test.skip(!supabaseConfigured, 'Skipped: NEXT_PUBLIC_SUPABASE_URL is required')

  test('/auth/reset-password renders the request form', async ({ page }) => {
    const response = await page.goto('/auth/reset-password', {
      waitUntil: 'domcontentloaded',
    })
    expect(response?.status()).toBeLessThan(400)

    await expect(page.getByRole('heading', { name: /Passwort zurücksetzen/i })).toBeVisible()
    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /Link zum Zurücksetzen senden/i })).toBeVisible()
  })
})
