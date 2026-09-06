import { expect, test, type Page } from '@playwright/test'
import { seedIntensity } from '../utils'

// Delay animation callbacks rather than blocking the main thread. Input,
// network and Playwright's scheduler remain responsive during slow-frame tests.
async function installFrameThrottle(page: Page) {
  await page.addInitScript(() => {
    const request = window.requestAnimationFrame.bind(window)
    const cancel = window.cancelAnimationFrame.bind(window)
    const pending = new Map<number, { frame: number; timer: number }>()
    let sequence = 0

    window.requestAnimationFrame = (callback) => {
      const id = ++sequence
      const task = { frame: 0, timer: 0 }
      pending.set(id, task)
      const schedule = () => {
        task.frame = request((time) => {
          pending.delete(id)
          callback(time)
        })
      }
      const delay = Number(Reflect.get(window, '__worldFrameDelay') ?? 0)
      if (delay > 0) task.timer = window.setTimeout(schedule, delay)
      else schedule()
      return id
    }

    window.cancelAnimationFrame = (id) => {
      const task = pending.get(id)
      if (!task) return
      clearTimeout(task.timer)
      cancel(task.frame)
      pending.delete(id)
    }
  })
}

async function openWorld(page: Page) {
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  const supportsWebgl = await page.evaluate(() => {
    const context = document.createElement('canvas').getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return context !== null
  })
  test.skip(!supportsWebgl, 'WebGL2 is unavailable in this browser')
  await expect(page.locator('[data-world-scene-status="ready"]')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('canvas')).toHaveAttribute('data-world-lod', /low|medium|high/)
}

test.beforeEach(async ({ page }) => {
  await seedIntensity(page, 'balanced')
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await installFrameThrottle(page)
})

test('sustained slow frames lower automatic quality without replacing the world canvas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 })
    Reflect.set(window, '__worldFrameDelay', 110)
  })
  await openWorld(page)
  const canvas = page.locator('canvas')
  const originalCanvas = await canvas.elementHandle()
  await expect(canvas).toHaveAttribute('data-world-quality-mode', 'automatic')
  await expect(canvas).toHaveAttribute('data-world-lod', 'low', { timeout: 12_000 })
  expect(
    await originalCanvas?.evaluate((element) => element === document.querySelector('canvas'))
  ).toBe(true)
  await expect(canvas).toHaveAttribute('data-world-antialias', 'false')
  await expect(page.getByRole('button', { name: 'Tree of Emergence', exact: true })).toBeVisible()
})

test('low quality caps desktop framebuffer pixels and keeps mobile resolution through resize', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 2 })
  })
  await openWorld(page)
  const canvas = page.locator('canvas')
  const originalCanvas = await canvas.elementHandle()
  await expect(canvas).toHaveAttribute('data-world-lod', 'low')

  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 393, height: 727 },
    { width: 1600, height: 900 },
  ]) {
    await page.setViewportSize(viewport)
    await expect
      .poll(async () =>
        canvas.evaluate((element) => {
          const canvas = element as HTMLCanvasElement
          const bounds = canvas.getBoundingClientRect()
          return { width: bounds.width, height: bounds.height }
        })
      )
      .toEqual(viewport)
    const dpr = Math.min(1, Math.sqrt(450_000 / (viewport.width * viewport.height)))
    await expect
      .poll(async () =>
        canvas.evaluate((element) => {
          const canvas = element as HTMLCanvasElement
          return { width: canvas.width, height: canvas.height }
        })
      )
      .toEqual({
        width: Math.floor(viewport.width * dpr),
        height: Math.floor(viewport.height * dpr),
      })
    await expect
      .poll(async () =>
        canvas.evaluate((element) => {
          const canvas = element as HTMLCanvasElement
          return canvas.width * canvas.height
        })
      )
      .toBeLessThanOrEqual(450_000)

    expect(
      await originalCanvas?.evaluate((element) => element === document.querySelector('canvas'))
    ).toBe(true)
    await expect(page.getByRole('button', { name: 'Tree of Emergence', exact: true })).toBeVisible()
  }
})

test('manual quality survives sustained slow frames and atmosphere changes preserve the camera', async ({
  page,
}) => {
  // A deterministic low starting tier makes the first explicit choice Medium.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 2 })
  })
  await openWorld(page)
  const canvas = page.locator('canvas')
  const originalCanvas = await canvas.elementHandle()
  await page.getByRole('button', { name: 'Welteinstellungen' }).click()
  await page.getByRole('button', { name: 'Qualität: Sanft' }).click()
  await expect(canvas).toHaveAttribute('data-world-lod', 'medium')
  await expect(canvas).toHaveAttribute('data-world-quality-mode', 'manual')

  await page.locator('[data-camera-surface]').press('+')
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-world-camera-zoom')))
    .toBeGreaterThan(13)
  const zoom = await canvas.getAttribute('data-world-camera-zoom')
  const position = await canvas.getAttribute('data-world-camera-position')
  await page.getByRole('button', { name: 'Atmosphäre: Morgengold' }).click()
  await expect(canvas).toHaveAttribute('data-world-exposure', '1.08')
  expect(
    await originalCanvas?.evaluate((element) => element === document.querySelector('canvas'))
  ).toBe(true)
  await expect(canvas).toHaveAttribute('data-world-camera-zoom', zoom!)
  await expect(canvas).toHaveAttribute('data-world-camera-position', position!)

  await page.evaluate(() => Reflect.set(window, '__worldFrameDelay', 110))
  // Longer than the six sampling windows used by automatic quality.
  await page.waitForTimeout(5_000)
  await expect(canvas).toHaveAttribute('data-world-lod', 'medium')
  await expect(canvas).toHaveAttribute('data-world-quality-mode', 'manual')
  await expect(page.getByRole('button', { name: 'Qualität: Leuchtend' })).toBeVisible()
})
