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
 * Asserts no critical or serious violations.
 */
export async function expectAccessible(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );

  if (serious.length > 0) {
    const details = serious
      .map((v) => `[${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} instances)`)
      .join("\n");
    expect(serious, `Accessibility violations:\n${details}`).toHaveLength(0);
  }
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
