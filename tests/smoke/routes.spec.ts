import { test, expect } from "@playwright/test";
import { expectNoConsoleErrors, expectCoreLayout } from "../utils";

const publicRoutes = [
  { path: "/", name: "Homepage" },
  { path: "/manifesto", name: "Manifesto" },
  { path: "/about", name: "About" },
  { path: "/content", name: "Content" },
  { path: "/community", name: "Community" },
  { path: "/events", name: "Events" },
  { path: "/contact", name: "Contact" },
  { path: "/legal/imprint", name: "Imprint" },
  { path: "/legal/privacy", name: "Privacy" },
  { path: "/journal/the-field-beneath-thought", name: "Journal: Field Beneath Thought" },
  { path: "/journal/the-illusion-of-separation", name: "Journal: Illusion of Separation" },
  { path: "/journal/the-practice-of-presence", name: "Journal: Practice of Presence" },
];

for (const route of publicRoutes) {
  test(`${route.name} (${route.path}) loads without errors`, async ({ page }) => {
    const errors = await expectNoConsoleErrors(page);

    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);

    // Page has a title
    const title = await page.title();
    expect(title).toBeTruthy();

    // Core layout elements present
    await expectCoreLayout(page);

    // No critical console errors
    expect(errors).toHaveLength(0);
  });
}
