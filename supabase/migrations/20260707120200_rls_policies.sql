-- =============================================================================
-- 20260707120200_rls_policies.sql — Row-Level Security (defense-in-depth)
-- =============================================================================
-- IMPORTANT: The app's Drizzle connection uses a service-role DATABASE_URL,
-- which BYPASSES RLS. Today's real isolation is the manual `where user_id = ...`
-- filters in server actions. These policies are DEFENSE-IN-DEPTH: they make the
-- database safe against a future connection that runs as an authenticated user
-- (e.g. supabase-js with the anon/user JWT) and against accidental unscoped
-- queries. Enabling RLS with owner-only policies is the honest, safe default.
--
-- Ownership rule:
--   * profiles          -> auth.uid() = id        (profiles is keyed by the auth uid)
--   * all user tables   -> auth.uid() = user_id
--   * guide_messages    -> has NO user_id column; ownership is derived through
--                          its parent guide_conversations row.
--
-- `for all ... using (...) with check (...)` covers SELECT/INSERT/UPDATE/DELETE:
-- `using` gates SELECT/UPDATE/DELETE (row visibility), `with check` gates the
-- new-row values on INSERT/UPDATE. auth.uid() is wrapped in `(select ...)` per
-- Supabase's RLS performance guidance (caches the result per statement).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enable RLS on all 9 tables
-- -----------------------------------------------------------------------------
alter table public.profiles            enable row level security;
alter table public.journal_entries     enable row level security;
alter table public.practices           enable row level security;
alter table public.map_nodes           enable row level security;
alter table public.map_edges           enable row level security;
alter table public.user_preferences    enable row level security;
alter table public.guide_conversations enable row level security;
alter table public.guide_messages      enable row level security;
alter table public.saved_prompt_cards  enable row level security;

-- -----------------------------------------------------------------------------
-- profiles  (auth.uid() = id)
-- -----------------------------------------------------------------------------
create policy "profiles_owner" on public.profiles
  for all
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- journal_entries  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "journal_entries_owner" on public.journal_entries
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- practices  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "practices_owner" on public.practices
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- map_nodes  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "map_nodes_owner" on public.map_nodes
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- map_edges  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "map_edges_owner" on public.map_edges
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- user_preferences  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "user_preferences_owner" on public.user_preferences
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- guide_conversations  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "guide_conversations_owner" on public.guide_conversations
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- guide_messages  (ownership derived through parent conversation)
-- -----------------------------------------------------------------------------
-- guide_messages has no user_id; a row belongs to the user who owns its
-- conversation. Both `using` and `with check` verify that parent ownership.
create policy "guide_messages_owner" on public.guide_messages
  for all
  using (
    exists (
      select 1
      from public.guide_conversations c
      where c.id = guide_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.guide_conversations c
      where c.id = guide_messages.conversation_id
        and c.user_id = (select auth.uid())
    )
  );

-- -----------------------------------------------------------------------------
-- saved_prompt_cards  (auth.uid() = user_id)
-- -----------------------------------------------------------------------------
create policy "saved_prompt_cards_owner" on public.saved_prompt_cards
  for all
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
