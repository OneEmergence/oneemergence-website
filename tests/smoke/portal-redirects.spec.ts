import { test, expect } from "@playwright/test";

/**
 * Portal auth-redirect smoke tests.
 *
 * These tests verify that the Supabase session proxy correctly redirects
 * unauthenticated users from /inner/* to /portal.
 *
 * The tests are skipped when NEXT_PUBLIC_SUPABASE_URL is not configured
 * (e.g. CI without Supabase credentials) to avoid false failures caused
 * by the proxy throwing when credentials are absent.
 *
 * CI *does* set the var — `next start` refuses to boot without it — but to a
 * deliberately non-resolving placeholder (see .github/workflows/ci.yml).
 * Treat that as "not configured": pointing these tests at a host that never
 * answers buys nothing but supabase-js retry flake.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseConfigured = !!supabaseUrl && !supabaseUrl.includes("placeholder");

const protectedRoutes = [
  { path: "/inner", name: "Dashboard" },
  { path: "/inner/journal", name: "Journal" },
  { path: "/inner/guide", name: "AI Guide" },
  { path: "/inner/map", name: "Consciousness Map" },
  { path: "/inner/practice", name: "Practice" },
  { path: "/portal/account", name: "Account lifecycle" },
];

test.describe("Portal auth redirects (unauthenticated)", () => {
  test.skip(!supabaseConfigured, "Skipped: NEXT_PUBLIC_SUPABASE_URL not set — requires Supabase credentials");

  for (const route of protectedRoutes) {
    test(`${route.name} (${route.path}) redirects unauthenticated users to /portal`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      // The Next.js proxy redirects /inner/* → /portal when no session
      expect(page.url()).toContain("/portal");
    });
  }
});

test.describe("Portal entry page", () => {
  test.skip(!supabaseConfigured, "Skipped: NEXT_PUBLIC_SUPABASE_URL not set — requires Supabase credentials");

  test("/portal loads without errors", async ({ page }) => {
    const response = await page.goto("/portal", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(400);
    const title = await page.title();
    expect(title).toBeTruthy();
  });
});
