import { test } from "@playwright/test";
import { expectAccessible } from "../utils";

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
];

for (const route of publicRoutes) {
  test(`${route.name} (${route.path}) passes accessibility checks`, async ({ page }) => {
    await page.goto(route.path, { waitUntil: "domcontentloaded" });
    // Wait for content to render
    await page.waitForTimeout(1000);
    await expectAccessible(page);
  });
}
