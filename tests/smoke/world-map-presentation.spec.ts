import { expect, test, type Page } from '@playwright/test'
import { WORLD_LANDMARKS } from '../../src/features/world-map/landmarks'
import messages from '../../src/i18n/messages/de.json'

const names = messages.worldMap.landmarks

async function openWorld(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 2 })
  })
  await page.goto('/map/immersive')
  await expect(page.locator('[data-world-scene-status="ready"]')).toBeVisible({ timeout: 20_000 })
}

async function expectFramed(page: Page, selectedId?: string) {
  await expect
    .poll(() =>
      page.locator('canvas').evaluate((canvas, expectedId) => {
        if (!canvas.dataset.worldSelectedBounds || !canvas.dataset.worldCameraSafeBounds)
          return false
        if (expectedId && canvas.dataset.worldSelectedLandmark !== expectedId) return false
        const selected = JSON.parse(canvas.dataset.worldSelectedBounds)
        const safe = JSON.parse(canvas.dataset.worldCameraSafeBounds)
        const panel = document.querySelector('#world-place-details')?.getBoundingClientRect()
        if (!panel) return false
        if (innerWidth >= 768 ? safe.right > panel.left - 15 : safe.bottom > panel.top - 15)
          return false
        return (
          selected.left >= safe.left - 1 &&
          selected.right <= safe.right + 1 &&
          selected.top >= safe.top - 1 &&
          selected.bottom <= safe.bottom + 1
        )
      }, selectedId)
    )
    .toBe(true)
}

for (const [width, height] of [
  [390, 844],
  [767, 900],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
]) {
  test(`all 15 places stay outside the detail panel at ${width}x${height}`, async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'chromium', 'Explicit viewport matrix is covered once')
    test.setTimeout(90_000)
    await page.setViewportSize({ width, height })
    await openWorld(page)
    for (const landmark of WORLD_LANDMARKS) {
      await page.getByRole('button', { name: 'Weltatlas', exact: true }).click()
      await page
        .locator('#world-atlas')
        .getByRole('button', { name: names[landmark.id].name, exact: true })
        .click()
      await expect(page.locator('#world-place-details').getByRole('heading')).toHaveText(
        names[landmark.id].name
      )
      await expectFramed(page, landmark.id)
      const { panel, safe } = await page.evaluate(() => {
        const rect = document.querySelector('#world-place-details')!.getBoundingClientRect()
        return {
          panel: { left: rect.left, top: rect.top },
          safe: JSON.parse(document.querySelector('canvas')!.dataset.worldCameraSafeBounds!),
        }
      })
      if (width >= 768) expect(safe.right).toBeLessThanOrEqual(panel.left - 15)
      else expect(safe.bottom).toBeLessThanOrEqual(panel.top - 15)
    }
  })
}

test('the journey exposes its primary action without scrolling and preserves framing on resize', async ({
  page,
}) => {
  await openWorld(page)
  await page.getByRole('button', { name: 'Zu Root Home', exact: true }).click()
  const focus = page.getByRole('button', { name: 'Aufmerksamkeit zu Root Home lenken' })
  await expect(focus).toBeInViewport({ ratio: 1 })
  await expectFramed(page)
  await focus.click()
  await focus.click()
  await expect(page.locator('#world-place-details')).toContainText('Root Home erwacht')
  await page.setViewportSize({ width: 768, height: 1024 })
  await expectFramed(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await expectFramed(page)
  await expect(focus).toBeInViewport({ ratio: 1 })
  await page.getByText('Über diesen Ort', { exact: true }).click()
  await expect(page.locator('#world-place-details details')).toHaveAttribute('open', '')
  await expectFramed(page)
  await page.getByRole('button', { name: 'Ortsdetails schließen' }).click()
  await expect(page.locator('[data-world-journey]')).toBeVisible()
  await expect(page.locator('[data-camera-surface]')).toBeFocused()
  await page.getByRole('button', { name: 'Kamerabewegung einblenden' }).click()
  await expect(page.getByRole('button', { name: 'Kamera nach links bewegen' })).toBeVisible()
})

test('a selected place is framed again after an explicit high-quality canvas remount', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'chromium', 'Canvas remount is covered once')
  await page.setViewportSize({ width: 1440, height: 900 })
  await openWorld(page)
  await page.getByRole('button', { name: 'Root Home', exact: true }).click()
  await expectFramed(page)
  const original = await page.locator('canvas').elementHandle()
  await page.getByRole('button', { name: 'Welteinstellungen', exact: true }).click()
  await page.getByRole('button', { name: 'Qualität: Sanft' }).click()
  await page.getByRole('button', { name: 'Qualität: Leuchtend' }).click()
  await expect(page.locator('canvas')).toHaveAttribute('data-world-lod', 'high')
  expect(await original?.evaluate((canvas) => canvas === document.querySelector('canvas'))).toBe(
    false
  )
  await expectFramed(page)
})

test('the guided first connection reaches a visible stabilization action and completes', async ({
  page,
}) => {
  test.setTimeout(45_000)
  await page.addInitScript(() => {
    const interval = window.setInterval
    window.setInterval = ((handler: TimerHandler, timeout?: number) =>
      interval(handler, timeout === 2_500 ? 25 : timeout)) as typeof window.setInterval
  })
  await openWorld(page)
  await page.getByRole('button', { name: 'Zu Root Home', exact: true }).click()
  const panel = page.locator('#world-place-details')
  const rootFocus = panel.getByRole('button', { name: 'Aufmerksamkeit zu Root Home lenken' })
  await rootFocus.click()
  await rootFocus.click()
  await panel.getByRole('button', { name: 'Zu Living Earth Institute', exact: true }).click()
  const earthFocus = panel.getByRole('button', {
    name: 'Aufmerksamkeit zu Living Earth Institute lenken',
  })
  await earthFocus.click()
  await earthFocus.click()
  const stabilize = panel.getByRole('button', { name: 'Verbindung stabilisieren', exact: true })
  await expect(stabilize).toBeInViewport({ ratio: 1 })
  await stabilize.click()
  await expect(page.locator('[data-world-harmonized-pairs]')).toHaveAttribute(
    'data-world-harmonized-pairs',
    '1',
    { timeout: 15_000 }
  )
  await expect(panel.getByRole('button', { name: 'Paar harmonisiert', exact: true })).toBeDisabled()
})
