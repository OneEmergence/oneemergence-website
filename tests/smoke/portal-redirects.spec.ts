import { test, expect } from "@playwright/test";

/**
 * Portal auth-redirect smoke tests.
 *
 * These tests verify that the Supabase middleware correctly redirects
 * unauthenticated users from /inner/* to /portal.
 *
 * The tests are skipped when NEXT_PUBLIC_SUPABASE_URL is not configured
 * (e.g. CI without Supabase credentials) to avoid false failures caused
 * by the middleware throwing when credentials are absent.
 */

const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

const protectedRoutes = [
  { path: "/inner", name: "Dashboard" },
  { path: "/inner/journal", name: "Journal" },
  { path: "/inner/guide", name: "AI Guide" },
  { path: "/inner/map", name: "Consciousness Map" },
  { path: "/inner/practice", name: "Practice" },
];

test.describe("Portal auth redirects (unauthenticated)", () => {
  test.skip(!supabaseConfigured, "Skipped: NEXT_PUBLIC_SUPABASE_URL not set — requires Supabase credentials");

  for (const route of protectedRoutes) {
    test(`${route.name} (${route.path}) redirects unauthenticated users to /portal`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      // Middleware redirects /inner/* → /portal when no session
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
