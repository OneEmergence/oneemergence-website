-- =============================================================================
-- 09_rls.sql — Row-Level Security Policies
-- =============================================================================
-- RLS is the primary security layer. Every user-owned table is locked down
-- so users can only access their own data. Supabase Auth provides auth.uid()
-- which returns the current user's UUID from the JWT.
--
-- Pattern: enable RLS → deny all by default → add explicit allow policies.
-- Service role key bypasses RLS (used in server actions via Drizzle).

-- =============================================================================
-- Enable RLS on all user-owned tables
-- =============================================================================
alter table profiles enable row level security;
alter table user_preferences enable row level security;
alter table journal_entries enable row level security;
alter table guide_conversations enable row level security;
alter table guide_messages enable row level security;
alter table saved_prompt_cards enable row level security;
alter table map_nodes enable row level security;
alter table map_edges enable row level security;
alter table practice_sessions enable row level security;
alter table saved_practices enable row level security;
alter table practice_streaks enable row level security;

-- =============================================================================
-- Profiles
-- =============================================================================
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);

-- Insert handled by trigger (fn_handle_new_user), not by client
-- Delete cascades from auth.users deletion

-- =============================================================================
-- User Preferences
-- =============================================================================
create policy "Users can view own preferences"
  on user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on user_preferences for update
  using (auth.uid() = user_id);

-- =============================================================================
-- Journal Entries
-- =============================================================================
create policy "Users own their journal entries"
  on journal_entries for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Guide Conversations
-- =============================================================================
create policy "Users own their guide conversations"
  on guide_conversations for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Guide Messages
-- =============================================================================
-- Messages are scoped through their conversation's ownership.
-- Users can read/write messages in their own conversations.
create policy "Users can access messages in own conversations"
  on guide_messages for all
  using (
    exists (
      select 1 from guide_conversations
      where guide_conversations.id = guide_messages.conversation_id
      and guide_conversations.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from guide_conversations
      where guide_conversations.id = guide_messages.conversation_id
      and guide_conversations.user_id = auth.uid()
    )
  );

-- =============================================================================
-- Saved Prompt Cards
-- =============================================================================
create policy "Users own their saved prompt cards"
  on saved_prompt_cards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Map Nodes
-- =============================================================================
create policy "Users own their map nodes"
  on map_nodes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Map Edges
-- =============================================================================
create policy "Users own their map edges"
  on map_edges for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Practice Sessions
-- =============================================================================
create policy "Users own their practice sessions"
  on practice_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Saved Practices
-- =============================================================================
create policy "Users own their saved practices"
  on saved_practices for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- Practice Streaks
-- =============================================================================
create policy "Users can view own practice streaks"
  on practice_streaks for select
  using (auth.uid() = user_id);

-- Update handled by server action with service role (streak computation)
-- Insert handled by trigger (fn_handle_new_user)
