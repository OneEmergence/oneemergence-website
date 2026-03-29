import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("navbar links navigate correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    // Find all nav links and verify they have valid hrefs
    const navLinks = page.locator("nav a[href]");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // Check each nav link leads to a valid page
    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await navLinks.nth(i).getAttribute("href");
      if (href && href.startsWith("/")) {
        hrefs.push(href);
      }
    }

    for (const href of hrefs) {
      const response = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${href} should return success`).toBeLessThan(400);
    }
  });

  test("footer links navigate correctly", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const footerLinks = page.locator("footer a[href^='/']");
    const count = await footerLinks.count();

    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await footerLinks.nth(i).getAttribute("href");
      if (href) hrefs.push(href);
    }

    for (const href of hrefs) {
      const response = await page.goto(href, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${href} should return success`).toBeLessThan(400);
    }
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("page loads and navigation is accessible on mobile", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(await page.title()).toBeTruthy();

    // Check that the page doesn't have horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });
});
