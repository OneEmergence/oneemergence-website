import { expect, test, type Page } from '@playwright/test'
import { seedIntensity } from '../utils'

async function trackAudioContexts(page: Page) {
  await page.addInitScript(() => {
    const contexts: AudioContext[] = []
    Object.defineProperty(window, '__publicAudioContexts', { value: contexts })
    window.AudioContext = new Proxy(window.AudioContext, {
      construct(target, args, newTarget) {
        const context = Reflect.construct(target, args, newTarget) as AudioContext
        contexts.push(context)
        return context
      },
    })
  })
}

async function audioStates(page: Page) {
  return page.evaluate(() => {
    const contexts = Reflect.get(window, '__publicAudioContexts') as AudioContext[]
    return contexts.map((context) => context.state)
  })
}

test('mobile navigation identifies its panel and returns focus on Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await seedIntensity(page, 'still')
  await page.goto('/about', { waitUntil: 'domcontentloaded' })

  const toggle = page.getByRole('button', { name: 'Menü öffnen' })
  await toggle.click()
  const close = page.getByRole('button', { name: 'Menü schließen' })
  await expect(close).toHaveAttribute('aria-expanded', 'true')
  const panelId = await close.getAttribute('aria-controls')
  expect(panelId).toBeTruthy()
  const panel = page.locator(`[id="${panelId}"]`)
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('link', { name: 'Über uns' })).toHaveAttribute(
    'aria-current',
    'page'
  )
  await expect(panel.getByRole('button', { name: 'Ambient-Ton einschalten' })).toBeDisabled()

  await panel.getByRole('link', { name: 'Manifest', exact: true }).focus()
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
  await expect(panel).toHaveCount(0)

  await toggle.click()
  await page
    .locator(`[id="${panelId}"]`)
    .getByRole('link', { name: 'Manifest', exact: true })
    .click()
  await expect(page).toHaveURL(/\/manifesto$/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})

test('public calls to action use one interactive link', async ({ page }) => {
  await seedIntensity(page, 'still')
  for (const route of ['/', '/manifesto', '/experiences']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a button')).toHaveCount(0)
  }
})

test('Still keeps the homepage hero visible and unscaled while scrolling', async ({ page }) => {
  await seedIntensity(page, 'still')
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('html')).toHaveAttribute('data-intensity', 'still')
  const hero = page.locator('main section').first().locator('[data-motion-level="flow"]').first()
  await expect(hero).toHaveCSS('opacity', '1')
  await page.evaluate(() => window.scrollTo(0, 200))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(200)
  await expect(hero).toHaveCSS('opacity', '1')
  await expect(hero).toHaveCSS('transform', 'none')
  await expect(page.getByRole('link', { name: 'Manifesto entdecken' })).toBeVisible()
})

test('homepage headline and primary links are visible without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL })
  const page = await context.newPage()
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const hero = page.locator('main section').first()
    await expect(hero.getByRole('heading', { name: 'OneEmergence', exact: true })).toBeVisible()
    const link = hero.getByRole('link', { name: 'Manifesto entdecken' })
    await expect(link).toBeVisible()
    // Playwright visibility alone does not reject an opacity-zero ancestor.
    expect(
      await link.evaluate((element) => {
        for (let node: Element | null = element; node; node = node.parentElement) {
          if (getComputedStyle(node).opacity === '0') return false
        }
        return true
      })
    ).toBe(true)
  } finally {
    await context.close()
  }
})

test.describe('public ambient audio', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await seedIntensity(page, 'balanced')
    await trackAudioContexts(page)
  })

  test('mute suspends the audio and Still releases it without restarting later', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    expect(await audioStates(page)).toEqual([])
    await page.getByRole('button', { name: 'Ambient-Ton einschalten' }).click()
    await expect.poll(() => audioStates(page)).toEqual(['running'])

    await page.getByRole('button', { name: 'Ambient-Ton ausschalten' }).click()
    await expect.poll(() => audioStates(page), { timeout: 6000 }).toEqual(['suspended'])
    await page.getByRole('button', { name: 'Ambient-Ton einschalten' }).click()
    await expect.poll(() => audioStates(page)).toEqual(['running'])

    await page.getByRole('radio', { name: 'Still', exact: true }).click()
    await expect.poll(() => audioStates(page)).toEqual(['closed'])
    const sound = page.getByRole('button', { name: 'Ambient-Ton einschalten' })
    await expect(sound).toBeDisabled()
    await expect(sound).toHaveAttribute('aria-pressed', 'false')
    await page.getByRole('radio', { name: 'Balanciert', exact: true }).click()
    await expect(sound).toBeEnabled()
    await expect(sound).toHaveAttribute('aria-pressed', 'false')
    expect(await audioStates(page)).toEqual(['closed'])
  })

  test('entering the portal releases the public audio context', async ({ page }) => {
    await page.goto('/community', { waitUntil: 'domcontentloaded' })
    await page.getByRole('button', { name: 'Ambient-Ton einschalten' }).click()
    await expect.poll(() => audioStates(page)).toEqual(['running'])
    await page.locator('main a[href="/portal"]').click()
    await expect(page).toHaveURL(/\/portal$/)
    await expect.poll(() => audioStates(page)).toEqual(['closed'])
  })
})
