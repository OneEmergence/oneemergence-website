import { test, expect } from '@playwright/test'
import { measureLCP, measureCLS } from '../utils'

// Use relaxed thresholds in CI (network/rendering variance)
const LCP_THRESHOLD = process.env.CI ? 5000 : 3000
const CLS_THRESHOLD = 0.25

const keyPages = [
  { path: '/', name: 'Homepage', lcp: LCP_THRESHOLD, cls: CLS_THRESHOLD },
  { path: '/manifesto', name: 'Manifesto', lcp: LCP_THRESHOLD, cls: CLS_THRESHOLD },
  { path: '/about', name: 'About', lcp: LCP_THRESHOLD, cls: CLS_THRESHOLD },
  { path: '/map', name: 'World map', lcp: 2500, cls: 0.1 },
]

test.describe('Web Vitals', () => {
  for (const route of keyPages) {
    test(`${route.name} LCP is within budget`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'load' })
      const lcp = await measureLCP(page)
      expect(lcp, `LCP for ${route.name}: ${lcp}ms`).toBeLessThan(route.lcp)
    })
  }

  for (const route of keyPages) {
    test(`${route.name} CLS is within budget`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: 'load' })
      const cls = await measureCLS(page)
      expect(cls, `CLS for ${route.name}: ${cls}`).toBeLessThan(route.cls)
    })
  }

  test('World map interaction stays inside the INP budget and loads no 3D model', async ({
    page,
  }) => {
    const modelRequests: string[] = []
    page.on('request', (request) => {
      if (request.url().includes('/models/world-map/')) modelRequests.push(request.url())
    })
    await page.goto('/map', { waitUntil: 'load' })
    const supportsEventTiming = await page.evaluate(() => {
      if (!PerformanceObserver.supportedEntryTypes.includes('event')) return false
      const durations: number[] = []
      Reflect.set(window, '__oeInteractionDurations', durations)
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const interaction = entry as PerformanceEntry & { interactionId?: number }
          if (interaction.interactionId) durations.push(interaction.duration)
        }
      })
      observer.observe({
        type: 'event',
        buffered: true,
        durationThreshold: 16,
      } as PerformanceObserverInit)
      return true
    })
    test.skip(!supportsEventTiming, 'Event Timing API is unavailable')

    await page.getByRole('button', { name: 'Tree of Emergence' }).first().click()
    await expect(page.locator('#world-map-landmark-details')).toBeVisible()
    await page.waitForTimeout(100)

    const durations = await page.evaluate(
      () => Reflect.get(window, '__oeInteractionDurations') as number[]
    )
    expect(Math.max(0, ...durations), `INP candidates: ${durations.join(', ')}ms`).toBeLessThan(200)
    expect(modelRequests).toHaveLength(0)
  })
})
