import { test, expect } from "@playwright/test";
import { measureLCP, measureCLS } from "../utils";

// Use relaxed thresholds in CI (network/rendering variance)
const LCP_THRESHOLD = process.env.CI ? 5000 : 3000;
const CLS_THRESHOLD = 0.25;

const keyPages = [
  { path: "/", name: "Homepage" },
  { path: "/manifesto", name: "Manifesto" },
  { path: "/about", name: "About" },
];

test.describe("Web Vitals", () => {
  for (const route of keyPages) {
    test(`${route.name} LCP is within budget`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "load" });
      const lcp = await measureLCP(page);
      expect(lcp, `LCP for ${route.name}: ${lcp}ms`).toBeLessThan(LCP_THRESHOLD);
    });
  }

  for (const route of keyPages) {
    test(`${route.name} CLS is within budget`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "load" });
      const cls = await measureCLS(page);
      expect(cls, `CLS for ${route.name}: ${cls}`).toBeLessThan(CLS_THRESHOLD);
    });
  }
});
