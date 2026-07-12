import { test, expect } from "@playwright/test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Row-Level Security isolation test — user A must not be able to read user B's
 * data (and vice versa). This exercises the RLS policies from
 * supabase/migrations/20260707120200_rls_policies.sql against a REAL Supabase
 * project, using per-user JWTs (NOT the service role, which bypasses RLS).
 *
 * REQUIRED ENVIRONMENT (test is skipped unless all are present):
 *   SUPABASE_TEST_URL               – project URL (e.g. https://xxxx.supabase.co)
 *   SUPABASE_TEST_SERVICE_ROLE_KEY  – service role key (creates/deletes test users)
 *   SUPABASE_TEST_ANON_KEY          – anon/public key (user-scoped clients)
 *
 * ⚠ Point these at a DISPOSABLE/staging project only — the test creates and
 * deletes auth users. Never run against production.
 */

const url = process.env.SUPABASE_TEST_URL;
const serviceRoleKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_TEST_ANON_KEY;

const configured = Boolean(url && serviceRoleKey && anonKey);

test.describe("RLS: user A cannot read user B's journal entries", () => {
  test.skip(
    !configured,
    "Skipped: set SUPABASE_TEST_URL, SUPABASE_TEST_SERVICE_ROLE_KEY and SUPABASE_TEST_ANON_KEY (disposable project) to run"
  );

  // These are set inside beforeAll; the guard above guarantees presence.
  let admin: SupabaseClient;
  const password = "Test-Passw0rd!";
  const suffix = Math.random().toString(36).slice(2, 10);
  const emailA = `rls-a-${suffix}@example.com`;
  const emailB = `rls-b-${suffix}@example.com`;
  let userAId = "";
  let userBId = "";

  test.beforeAll(async () => {
    admin = createClient(url!, serviceRoleKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const a = await admin.auth.admin.createUser({
      email: emailA,
      password,
      email_confirm: true,
    });
    const b = await admin.auth.admin.createUser({
      email: emailB,
      password,
      email_confirm: true,
    });

    expect(a.error, a.error?.message).toBeNull();
    expect(b.error, b.error?.message).toBeNull();
    userAId = a.data.user!.id;
    userBId = b.data.user!.id;

    // This suite tests owner isolation, so both users must first pass the
    // independent workspace-access gate introduced by the workspace schema.
    const workspace = await admin
      .from("workspaces")
      .select("id")
      .eq("slug", "one-emergence")
      .single();
    expect(workspace.error, workspace.error?.message).toBeNull();
    const approval = await admin
      .from("workspace_memberships")
      .update({ status: "active", approved_at: new Date().toISOString() })
      .eq("workspace_id", workspace.data!.id)
      .in("user_id", [userAId, userBId]);
    expect(approval.error, approval.error?.message).toBeNull();
  });

  test.afterAll(async () => {
    if (userAId) await admin.auth.admin.deleteUser(userAId);
    if (userBId) await admin.auth.admin.deleteUser(userBId);
  });

  test("B's client sees zero rows for A's entry; A's client sees it", async () => {
    // --- User A: sign in and write a private journal entry ---
    const clientA = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signInA = await clientA.auth.signInWithPassword({
      email: emailA,
      password,
    });
    expect(signInA.error, signInA.error?.message).toBeNull();

    const insert = await clientA
      .from("journal_entries")
      .insert({
        user_id: userAId,
        title: "Privat für A",
        content: "Nur A darf das lesen.",
      })
      .select()
      .single();
    expect(insert.error, insert.error?.message).toBeNull();
    const entryId = insert.data!.id as string;

    // --- User B: sign in and attempt to read A's entry ---
    const clientB = createClient(url!, anonKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const signInB = await clientB.auth.signInWithPassword({
      email: emailB,
      password,
    });
    expect(signInB.error, signInB.error?.message).toBeNull();

    const bReadsA = await clientB
      .from("journal_entries")
      .select("*")
      .eq("id", entryId);
    // RLS filters the row out entirely — no error, just no rows.
    expect(bReadsA.error).toBeNull();
    expect(bReadsA.data ?? []).toHaveLength(0);

    // B also cannot see the row via an unfiltered select.
    const bReadsAll = await clientB.from("journal_entries").select("id");
    expect((bReadsAll.data ?? []).map((r) => r.id)).not.toContain(entryId);

    // --- Sanity: A CAN read its own entry ---
    const aReadsOwn = await clientA
      .from("journal_entries")
      .select("*")
      .eq("id", entryId);
    expect(aReadsOwn.error).toBeNull();
    expect(aReadsOwn.data ?? []).toHaveLength(1);
  });

});
