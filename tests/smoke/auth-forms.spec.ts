import { test, expect } from "@playwright/test";

/**
 * Auth UI smoke tests — pure DOM presence, no mocking.
 *
 * The portal entry (`/portal`) and reset-password page both call the Supabase
 * server client during render (session lookup), so they are skipped when
 * NEXT_PUBLIC_SUPABASE_URL is absent (e.g. CI without Supabase credentials),
 * consistent with the other portal smoke tests.
 */

const supabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

test.describe("Portal entry — auth forms", () => {
  test.skip(
    !supabaseConfigured,
    "Skipped: NEXT_PUBLIC_SUPABASE_URL not set — requires Supabase credentials"
  );

  test("/portal renders the login/signup threshold with email + password fields", async ({
    page,
  }) => {
    await page.goto("/portal", { waitUntil: "domcontentloaded" });

    // Both threshold tabs are present.
    await expect(page.getByRole("tab", { name: "Eintreten" })).toBeVisible();
    await expect(
      page.getByRole("tab", { name: "Schwelle überschreiten" })
    ).toBeVisible();

    // Login form fields are present.
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();

    // Alternative entry paths.
    await expect(
      page.getByRole("button", { name: /Mit Google eintreten/i })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Magischen Link senden/i })
    ).toBeVisible();
  });

  test("/portal can switch to the signup tab", async ({ page }) => {
    await page.goto("/portal", { waitUntil: "domcontentloaded" });
    await page.getByRole("tab", { name: "Schwelle überschreiten" }).click();
    // The signup form exposes an optional name field.
    await expect(page.locator("#signup-email")).toBeVisible();
    await expect(page.locator("#signup-password")).toBeVisible();
  });
});

test.describe("Password reset page", () => {
  test.skip(
    !supabaseConfigured,
    "Skipped: NEXT_PUBLIC_SUPABASE_URL not set — requires Supabase credentials"
  );

  test("/auth/reset-password renders the request form", async ({ page }) => {
    const response = await page.goto("/auth/reset-password", {
      waitUntil: "domcontentloaded",
    });
    expect(response?.status()).toBeLessThan(400);

    await expect(
      page.getByRole("heading", { name: /Passwort zurücksetzen/i })
    ).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Link zum Zurücksetzen senden/i })
    ).toBeVisible();
  });
});
