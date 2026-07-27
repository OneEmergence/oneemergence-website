import { type Page, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Verify a page loads without critical console errors.
 * Collects console messages during navigation and asserts none are errors.
 */
export async function expectNoConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      // Ignore known non-critical browser errors
      if (text.includes("favicon") || text.includes("404")) return;
      errors.push(text);
    }
  });
  return errors;
}

/**
 * Run axe-core accessibility scan on the current page.
 *
 * The stated target is WCAG 2.2 AA, but this used to scan only the `wcag2a` /
 * `wcag2aa` tags — the WCAG **2.0** sets. Every 2.1 and 2.2 rule, including
 * `target-size` (SC 2.5.8), was therefore never run. It also dropped every
 * `moderate` violation, which is the impact axe assigns to `heading-order`,
 * `landmark-unique` and `region` — the reason the h1→h3 skips on the home page
 * never failed CI.
 */
export async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();

  const violations = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious" || v.impact === "moderate"
  );

  if (violations.length > 0) {
    const details = violations
      .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`)
      .join("\n");
    expect(violations, `Accessibility violations:\n${details}`).toHaveLength(0);
  }
}

/**
 * Seed the persisted intensity preference before navigation.
 *
 * The suite only ever exercised the default Balanced mode, so Still and
 * Immersive — the two the motion contract is written for — went untested.
 * Mirrors the shape written by the Zustand `persist` middleware
 * (`src/stores/intensity.ts`) and read by the pre-paint script.
 */
export async function seedIntensity(page: Page, mode: "still" | "balanced" | "immersive") {
  await page.addInitScript(
    ([key, value]) => {
      window.localStorage.setItem(key, JSON.stringify({ state: { mode: value }, version: 0 }));
    },
    ["oe-intensity-mode", mode] as const
  );
}

/**
 * Verify core layout elements are present on the page.
 */
export async function expectCoreLayout(page: Page) {
  await expect(page.locator("nav").first()).toBeVisible();
  await expect(page.locator("main").first()).toBeVisible();
  await expect(page.locator("footer").first()).toBeVisible();
}

/**
 * Measure Largest Contentful Paint via Performance Observer.
 */
export async function measureLCP(page: Page): Promise<number> {
  const lcp = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let lastLCP = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        for (const entry of entries) {
          lastLCP = entry.startTime;
        }
      });
      observer.observe({ type: "largest-contentful-paint", buffered: true });

      // Give the page time to settle, then return the LCP value
      setTimeout(() => {
        observer.disconnect();
        resolve(lastLCP);
      }, 3000);
    });
  });
  return lcp;
}

/**
 * Measure Cumulative Layout Shift via Performance Observer.
 */
export async function measureCLS(page: Page): Promise<number> {
  const cls = await page.evaluate(() => {
    return new Promise<number>((resolve) => {
      let totalCLS = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!layoutShift.hadRecentInput) {
            totalCLS += layoutShift.value;
          }
        }
      });
      observer.observe({ type: "layout-shift", buffered: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(totalCLS);
      }, 3000);
    });
  });
  return cls;
}
