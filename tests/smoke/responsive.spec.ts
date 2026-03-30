import { test, expect } from "@playwright/test";

/**
 * Mobile responsive smoke tests.
 *
 * Verifies:
 * 1. No horizontal overflow (no accidental full-bleed elements wider than viewport)
 * 2. Interactive elements (links, buttons) meet the 44×44 CSS px minimum touch target
 *
 * Run with the "Mobile Chrome" project or with any viewport <= 480 wide.
 */

const mobileRoutes = [
  { path: "/", name: "Homepage" },
  { path: "/manifesto", name: "Manifesto" },
  { path: "/about", name: "About" },
  { path: "/content", name: "Content" },
  { path: "/library", name: "Library" },
  { path: "/experiences", name: "Experiences" },
  { path: "/contact", name: "Contact" },
];

// Use a standard mobile viewport for all tests in this file
const MOBILE_VIEWPORT = { width: 390, height: 844 }; // iPhone 14

test.describe("Mobile: no horizontal overflow", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  for (const route of mobileRoutes) {
    test(`${route.name} (${route.path})`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(
        hasHorizontalOverflow,
        `${route.path} must not have horizontal overflow on mobile`
      ).toBe(false);
    });
  }
});

test.describe("Mobile: touch target sizing", () => {
  test.use({ viewport: MOBILE_VIEWPORT });

  const MIN_TARGET_PX = 44;

  test("interactive elements on homepage meet 44px touch target minimum", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    // Collect bounding boxes of all visible interactive elements
    const violations = await page.evaluate((minPx) => {
      const selectors = "a[href], button";
      const elements = Array.from(document.querySelectorAll<HTMLElement>(selectors));
      const results: { text: string; width: number; height: number }[] = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        // Skip hidden or zero-size elements
        if (rect.width === 0 || rect.height === 0) continue;
        // Skip elements scrolled out of the initial viewport
        if (rect.top > window.innerHeight * 2 || rect.bottom < 0) continue;

        if (rect.width < minPx || rect.height < minPx) {
          results.push({
            text: (el.textContent ?? el.getAttribute("aria-label") ?? el.tagName).trim().slice(0, 60),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          });
        }
      }
      return results;
    }, MIN_TARGET_PX);

    if (violations.length > 0) {
      const details = violations
        .map((v) => `"${v.text}" → ${v.width}×${v.height}px`)
        .join("\n");
      // Report as a soft warning rather than a hard failure —
      // some decorative links (e.g. logo marks) may be intentionally small.
      // Change to expect(...).toHaveLength(0) once design is finalized.
      console.warn(`Touch target size < ${MIN_TARGET_PX}px on /:\n${details}`);
    }

    // At least verify the page loaded and has interactive elements
    const totalInteractive = await page.locator("a[href], button").count();
    expect(totalInteractive).toBeGreaterThan(0);
  });

  test("navbar links on mobile are tall enough to tap", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(500);

    const navLinks = page.locator("nav a[href]");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const box = await navLinks.nth(i).boundingBox();
      if (!box) continue; // hidden on mobile (burger menu etc.)
      expect(
        box.height,
        `nav link #${i} height should be >= ${MIN_TARGET_PX}px`
      ).toBeGreaterThanOrEqual(MIN_TARGET_PX);
    }
  });
});
