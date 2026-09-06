import { expect, test, type Page } from '@playwright/test'
import { seedIntensity } from '../utils'
import { RESONANCE_SESSION_STORAGE_KEY } from '../../src/features/world-map/immersive/game'

test.describe.configure({ mode: 'serial' })

async function supportsWebGL2(page: Page) {
  return page.evaluate(() => {
    const context = document.createElement('canvas').getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return context !== null
  })
}

async function waitForWorldScene(page: Page) {
  test.skip(!(await supportsWebGL2(page)), 'WebGL2 is unavailable in this browser')
  await expect(page.locator('[data-world-scene-status="ready"]')).toBeVisible({
    timeout: 15_000,
  })
}

async function measureRuntime(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{
        fps: number
        transferBytes: number
        geometries: number
        textures: number
      }>((resolve) => {
        let frames = 0
        const startedAt = performance.now()

        const sample = (now: number) => {
          frames += 1
          if (now - startedAt < 1_500) {
            requestAnimationFrame(sample)
            return
          }

          const transferBytes = performance
            .getEntriesByType('resource')
            .map((entry) => entry as PerformanceResourceTiming)
            .filter(
              ({ name, initiatorType }) =>
                initiatorType === 'script' ||
                name.includes('/images/world-map/') ||
                name.includes('/models/world-map/')
            )
            .reduce((sum, entry) => sum + (entry.transferSize || entry.encodedBodySize), 0)

          resolve({
            fps: (frames * 1_000) / (now - startedAt),
            transferBytes,
            geometries: Number(document.querySelector('canvas')?.dataset.worldGeometries ?? 0),
            textures: Number(document.querySelector('canvas')?.dataset.worldTextures ?? 0),
          })
        }

        requestAnimationFrame(sample)
      })
  )
}

test('world map exposes every landmark without relying on the canvas', async ({ page }) => {
  const response = await page.goto('/map', { waitUntil: 'domcontentloaded' })

  expect(response?.status()).toBeLessThan(400)
  await expect(page.getByRole('heading', { name: 'One Emergence Map', level: 1 })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tree of Emergence' })).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Root Home' })).toHaveCount(2)
  await expect(page.getByRole('button', { name: 'Cosmic Control Center' })).toHaveCount(2)
})

test('the immersion gateway opens the playable fullscreen world', async ({ page }) => {
  await page.goto('/map', { waitUntil: 'networkidle' })

  const enter = page.getByRole('link', { name: 'Eintauchen' })
  await expect(enter).toHaveAttribute('href', '/map/immersive')
  await enter.click()

  await expect(page).toHaveURL(/\/map\/immersive$/)
  await waitForWorldScene(page)
  await expect(page.getByRole('link', { name: 'Zur Kartenübersicht' })).toBeVisible()
  const canvas = page.locator('canvas')
  await expect(canvas).toBeVisible()
  await expect(canvas).toHaveAttribute('data-world-asset-format', 'isometric-sprites')
  await expect(canvas).toHaveAttribute('data-world-budget', 'pass')
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-world-draw-calls')))
    .toBeGreaterThan(0)
  await expect(page.locator('[data-camera-surface]')).toBeVisible()
  await expect(page.locator('#world-place-details')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Tree of Emergence', exact: true })).toHaveCount(1)
  await expect(page.getByRole('heading', { name: 'Alle Orte' })).toHaveCount(0)
})

test('the immersive atlas exposes and focuses all 15 places without the canvas', async ({
  page,
}) => {
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  const atlasButton = page.getByRole('button', { name: 'Weltatlas' })
  const details = page.locator('#world-place-details')
  await expect(details).toHaveCount(0)
  await atlasButton.click()

  const atlas = page.locator('#world-atlas')
  await expect(atlas.getByRole('heading', { name: 'Alle Orte' })).toBeVisible()
  await expect(atlas.locator('nav button')).toHaveCount(15)

  await atlas.getByRole('button', { name: 'Cosmic Control Center' }).click()
  await expect(atlas).toHaveCount(0)
  await expect(atlasButton).toBeFocused()
  await expect(details.getByRole('heading', { name: 'Cosmic Control Center' })).toBeVisible()

  const canvasBounds = await page.locator('canvas').boundingBox()
  expect(canvasBounds).not.toBeNull()
  const emptyX = canvasBounds!.x + canvasBounds!.width * 0.08
  const emptyY = canvasBounds!.y + canvasBounds!.height * (canvasBounds!.width < 640 ? 0.22 : 0.72)
  await page.mouse.move(emptyX, emptyY)
  await page.mouse.down()
  await page.mouse.move(emptyX + 70, emptyY + 40, { steps: 4 })
  await page.mouse.up()
  await expect(details).toBeVisible()

  await page.mouse.click(emptyX, emptyY)
  await expect(details).toHaveCount(0)

  await atlasButton.click()
  await atlas.getByRole('button', { name: 'Cosmic Control Center' }).click()
  await page.keyboard.press('Escape')
  await expect(details).toHaveCount(0)
  await expect(atlasButton).toBeFocused()

  await atlasButton.click()
  await atlas.getByRole('button', { name: 'Cosmic Control Center' }).click()
  await details.getByRole('button', { name: 'Ortsdetails schließen' }).click()
  await expect(details).toHaveCount(0)
  await expect(atlasButton).toBeFocused()
})

test('a second resonance pair is playable and changes the world immediately', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The campaign trace is covered once on desktop')
  test.setTimeout(45_000)
  await page.addInitScript(() => {
    const nativeSetInterval = window.setInterval
    window.setInterval = ((handler: TimerHandler, timeout?: number) =>
      nativeSetInterval(handler, timeout === 2_500 ? 10 : timeout)) as typeof window.setInterval
  })
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  await page.getByRole('button', { name: 'Weltatlas' }).click()
  await page.locator('#world-atlas').getByRole('button', { name: 'Temple of Creation' }).click()

  const world = page.locator('[data-world-active-streams]')
  const panel = page.getByRole('complementary')
  const focusTemple = panel.getByRole('button', {
    name: 'Aufmerksamkeit zu Temple of Creation lenken',
  })
  await focusTemple.click()
  await focusTemple.click()
  await expect(world).toHaveAttribute('data-world-active-streams', '2')
  await expect(page.locator('canvas')).toHaveAttribute('data-world-river-energy', '2')
  await expect(page.locator('canvas')).toHaveAttribute('data-world-active-landmarks', '1')

  const creation = page.getByRole('button', { name: 'House of Creation', exact: true })
  await expect(creation).toBeVisible({ timeout: 8_000 })
  await creation.click()

  const focusCreation = panel.getByRole('button', {
    name: 'Aufmerksamkeit zu House of Creation lenken',
  })
  await focusCreation.click()
  await focusCreation.click()
  await expect(world).toHaveAttribute('data-world-active-streams', '4')
})

test('campaign progress survives reload and Reset removes the local save', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Local continuation is covered once on desktop')
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  await page.getByRole('button', { name: 'Root Home', exact: true }).click()
  await page
    .getByRole('complementary')
    .getByRole('button', { name: 'Aufmerksamkeit zu Root Home lenken' })
    .click()
  await expect(page.locator('[data-world-active-streams]')).toHaveAttribute(
    'data-world-active-streams',
    '1'
  )
  await expect
    .poll(() =>
      page.evaluate((key) => window.localStorage.getItem(key), RESONANCE_SESSION_STORAGE_KEY)
    )
    .not.toBeNull()

  await page.reload({ waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)
  await page.getByRole('button', { name: 'Root Home', exact: true }).click()
  await expect(page.getByRole('complementary').getByText('1 / 2')).toBeVisible()

  await page.getByRole('button', { name: 'Welteinstellungen' }).click()
  await page.getByRole('button', { name: 'Resonanzreise zurücksetzen' }).click()
  await expect(page.locator('[data-world-active-streams]')).toHaveAttribute(
    'data-world-active-streams',
    '0'
  )
  await expect
    .poll(() =>
      page.evaluate((key) => window.localStorage.getItem(key), RESONANCE_SESSION_STORAGE_KEY)
    )
    .toBeNull()
})

test('corrupt local campaign data falls back to a clean session', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Corrupt storage recovery is covered once')
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, '{not-json')
  }, RESONANCE_SESSION_STORAGE_KEY)
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  const world = page.locator('[data-world-active-streams]')
  await expect(world).toHaveAttribute('data-world-active-streams', '0')
  await expect(world).toHaveAttribute('data-world-harmonized-pairs', '0')
  await expect
    .poll(() =>
      page.evaluate((key) => window.localStorage.getItem(key), RESONANCE_SESSION_STORAGE_KEY)
    )
    .toBeNull()
})

test('the optimized Tree hero stays lazy and inside the High quality budget', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'High hero asset is a desktop quality tier')
  const treeRequests: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/models/world-map/tree/tree-optimized.glb')) {
      treeRequests.push(request.url())
    }
  })

  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)
  expect(treeRequests).toHaveLength(0)

  await page.getByRole('button', { name: 'Welteinstellungen' }).click()
  await page.getByRole('button', { name: 'Qualität: Leuchtend' }).click()
  const canvas = page.locator('canvas')
  await expect(canvas).toHaveAttribute('data-world-lod', 'high')
  await expect(canvas).toHaveAttribute('data-world-budget', 'pass')
  await expect.poll(() => treeRequests.length).toBe(1)
})

test('the living world changes atmosphere and keeps sound explicitly opt-in', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Desktop world controls cover this contract')
  await page.addInitScript(() => {
    const AudioContextConstructor = window.AudioContext
    Object.defineProperty(window, '__worldAudioContexts', {
      configurable: true,
      value: 0,
      writable: true,
    })
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: new Proxy(AudioContextConstructor, {
        construct(target, args, newTarget) {
          const trackedWindow = window as typeof window & { __worldAudioContexts: number }
          trackedWindow.__worldAudioContexts += 1
          return Reflect.construct(target, args, newTarget)
        },
      }),
    })
  })

  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  const soundscape = page.locator('[data-world-soundscape]')
  await expect(soundscape).toHaveAttribute('data-world-soundscape', 'idle')
  expect(await page.evaluate(() => Reflect.get(window, '__worldAudioContexts'))).toBe(0)

  await page.getByRole('button', { name: 'Welteinstellungen' }).click()
  await page.getByRole('button', { name: 'Klangwelt aktivieren' }).click()
  await expect(soundscape).toHaveAttribute('data-world-soundscape', 'playing')
  expect(await page.evaluate(() => Reflect.get(window, '__worldAudioContexts'))).toBe(1)

  await page.getByRole('button', { name: 'Atmosphäre: Morgengold' }).click()
  await expect(page.getByRole('button', { name: 'Atmosphäre: Taglicht' })).toBeVisible()
  await waitForWorldScene(page)
})

test('Still mode keeps the complete fullscreen 2D map', async ({ page }) => {
  await seedIntensity(page, 'still')
  await page.goto('/map/immersive', { waitUntil: 'networkidle' })

  await expect(
    page.getByRole('region', { name: 'Interaktive One Emergence Weltkarte' })
  ).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('[data-world-soundscape]')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Tree of Emergence' })).toHaveCount(1)
})

test('OS reduced motion keeps the complete fullscreen 2D map', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/map/immersive', { waitUntil: 'networkidle' })

  await expect(
    page.getByRole('region', { name: 'Interaktive One Emergence Weltkarte' })
  ).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('a weak device starts directly in the gentle quality tier', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'The device heuristic is covered once on desktop')
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'hardwareConcurrency', {
      configurable: true,
      value: 2,
    })
  })
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  await expect(page.locator('canvas')).toHaveAttribute('data-world-lod', 'low')
  await page.getByRole('button', { name: 'Welteinstellungen' }).click()
  await expect(page.getByRole('button', { name: 'Qualität: Sanft' })).toBeVisible()
})

test('the final realtime scene records frame cadence and stays inside deterministic budgets', async ({
  page,
}, testInfo) => {
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  const canvas = page.locator('canvas')
  await page.getByRole('button', { name: 'Root Home', exact: true }).click()
  await page
    .getByRole('complementary')
    .getByRole('button', { name: 'Aufmerksamkeit zu Root Home lenken' })
    .click()
  await page.waitForTimeout(4_000)

  const profile = await measureRuntime(page)
  const quality = await canvas.getAttribute('data-world-lod')
  console.log(`world-runtime:${testInfo.project.name}:${quality}:${JSON.stringify(profile)}`)
  expect(profile.transferBytes).toBeLessThan(6_000_000)
  expect(profile.geometries).toBeGreaterThan(0)
  expect(profile.textures).toBeGreaterThanOrEqual(0)
  await expect(canvas).toHaveAttribute('data-world-budget', 'pass')
})

test('missing WebGL2 falls back to the complete fullscreen 2D map', async ({ page }) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value(type: string, ...args: unknown[]) {
        if (type === 'webgl2') return null
        return Reflect.apply(getContext, this, [type, ...args])
      },
    })
  })
  await page.goto('/map/immersive', { waitUntil: 'networkidle' })

  await expect(
    page.getByRole('region', { name: 'Interaktive One Emergence Weltkarte' })
  ).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('context loss preserves progress and returns keyboard focus', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Real WebGL context loss is covered once')
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  await page.getByRole('button', { name: 'Root Home', exact: true }).click()
  const panel = page.getByRole('complementary')
  await panel.getByRole('button', { name: /Aufmerksamkeit zu Root Home/ }).click()
  await panel.getByRole('button', { name: /Aufmerksamkeit zu Root Home/ }).click()
  await expect(panel.getByText('2 / 2')).toBeVisible()

  const lost = await page.locator('canvas').evaluate((element) => {
    const canvas = element as HTMLCanvasElement
    const context = canvas.getContext('webgl2')
    const extension = context?.getExtension('WEBGL_lose_context')
    if (!extension) return false
    extension.loseContext()
    return true
  })
  test.skip(!lost, 'WEBGL_lose_context is unavailable in this browser')

  const retry = page.getByRole('button', { name: '3D erneut versuchen' })
  await expect(retry).toBeFocused()
  await retry.click()
  await waitForWorldScene(page)

  await expect(page.locator('[data-camera-surface]')).toBeFocused()
  await page.getByRole('button', { name: 'Root Home', exact: true }).click()
  await expect(page.getByRole('complementary').getByText('2 / 2')).toBeVisible()
})

test('keyboard camera commands keep the strategic surface operable', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium', 'Keyboard camera is covered once on desktop')
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  const surface = page.locator('[data-camera-surface]')
  await surface.focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('+')
  await page.keyboard.press('Home')

  await expect(surface).toBeFocused()
  await expect(page.locator('[data-world-scene-status="ready"]')).toBeVisible()
})

test('touch can choose a landmark and operate the camera without canvas gestures', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Touch controls require the mobile project')
  await page.goto('/map/immersive', { waitUntil: 'domcontentloaded' })
  await waitForWorldScene(page)

  await page.getByRole('button', { name: 'Weltatlas' }).tap()
  await page.locator('#world-atlas').getByRole('button', { name: 'Solar Ark' }).tap()
  await expect(
    page.getByRole('complementary').getByRole('heading', { name: 'Solar Ark' })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Kamera zentrieren' }).tap()
  await expect(page.locator('[data-world-scene-status="ready"]')).toBeVisible()
})

test('a landmark opens an accessible menu and Escape restores focus', async ({ page }) => {
  await page.goto('/map', { waitUntil: 'networkidle' })

  const tree = page.getByRole('button', { name: 'Tree of Emergence' }).first()
  const details = page.locator('#world-map-landmark-details')

  await expect(details).toHaveCount(0)
  await tree.focus()
  await page.keyboard.press('Enter')

  await expect(details).toBeVisible()
  await expect(details.getByRole('heading', { name: 'Tree of Emergence' })).toBeVisible()
  await expect(details.locator('button').first()).toBeFocused()
  await expect(tree).toHaveAttribute('aria-expanded', 'true')

  await page.keyboard.press('Escape')
  await expect(details).toHaveCount(0)
  await expect(tree).toBeFocused()
})

test('the landmark menu remains usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/map', { waitUntil: 'networkidle' })

  await page.getByRole('button', { name: 'Root Home' }).last().click()

  const details = page.locator('#world-map-landmark-details')
  await expect(details).toBeVisible()
  await expect(details.getByRole('heading', { name: 'Root Home' })).toBeVisible()
  await expect(details.locator('a[href="/portal"]')).toBeVisible()
  await expect(details.locator('button').first()).toBeVisible()
})

test('the directory brings the desktop detail menu into view', async ({ page }) => {
  await page.goto('/map', { waitUntil: 'networkidle' })

  const rootHome = page.getByRole('button', { name: 'Root Home' }).last()
  await rootHome.scrollIntoViewIfNeeded()
  await rootHome.click()

  const details = page.locator('#world-map-landmark-details')
  await expect(details).toBeVisible()
  await expect
    .poll(() =>
      details.evaluate((element) => {
        const bounds = element.getBoundingClientRect()
        return bounds.top >= 0 && bounds.bottom <= window.innerHeight
      })
    )
    .toBe(true)
})
