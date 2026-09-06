import { expect, test } from '@playwright/test'
import { expectAccessible, seedIntensity } from '../utils'

const publicRoutes = [
  { path: '/', name: 'Homepage' },
  { path: '/manifesto', name: 'Manifesto' },
  { path: '/about', name: 'About' },
  { path: '/journal', name: 'Journal' },
  { path: '/library', name: 'Library' },
  { path: '/experiences', name: 'Experiences' },
  { path: '/community', name: 'Community' },
  { path: '/events', name: 'Events' },
  { path: '/contact', name: 'Contact' },
  { path: '/map', name: 'World map' },
  { path: '/legal/imprint', name: 'Imprint' },
  { path: '/legal/privacy', name: 'Privacy' },
  { path: '/journal/the-field-beneath-thought', name: 'Journal: Field Beneath Thought' },
]

for (const route of publicRoutes) {
  test(`${route.name} (${route.path}) passes accessibility checks`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: 'domcontentloaded' })
    // Wait for content to render
    await page.waitForTimeout(1000)
    await expectAccessible(page)
  })
}

for (const mode of ['still', 'balanced', 'immersive'] as const) {
  test(`Immersive world map in ${mode} mode passes accessibility checks`, async ({ page }) => {
    await seedIntensity(page, mode)
    await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
    await expect(
      page.locator(
        mode === 'still' ? '[data-world-renderer="2d"]' : '[data-world-scene-status="ready"]'
      )
    ).toBeVisible({ timeout: 15_000 })
    await expectAccessible(page)
  })
}

test('Immersive world map details pass accessibility checks', async ({ page }) => {
  await seedIntensity(page, 'immersive')
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('[data-world-scene-status="ready"]')).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Weltatlas' }).click()
  await page.locator('#world-atlas').getByRole('button', { name: 'Root Home' }).click()
  await expect(page.locator('#world-place-details')).toBeVisible()
  await expectAccessible(page)
})

test('Portal entry passes accessibility checks', async ({ page }) => {
  test.skip(
    !process.env.NEXT_PUBLIC_SUPABASE_URL,
    'Skipped: portal rendering requires Supabase credentials'
  )
  await page.goto('/portal', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  await expectAccessible(page)
})
