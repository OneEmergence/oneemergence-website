-- =============================================================================
-- 02_tables_core.sql — Core Application Tables
-- =============================================================================
-- Profiles, journal entries, and user preferences.
-- All reference auth.users(id) — Supabase Auth manages the users table.
-- No Auth.js tables (users, accounts, sessions, verification_tokens) needed.

-- -----------------------------------------------------------------------------
-- profiles: extends Supabase auth.users with app-specific data
-- -----------------------------------------------------------------------------
-- Supabase Auth stores email, name, avatar in auth.users.
-- This table stores app-level profile data that doesn't belong in auth metadata.
create table profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  locale text default 'de' check (locale in ('de', 'en')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table profiles is 'App-level user profile extending Supabase auth.users';

-- -----------------------------------------------------------------------------
-- user_preferences: intensity mode, audio, focus themes
-- -----------------------------------------------------------------------------
create table user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  intensity_mode intensity_mode not null default 'balanced',
  audio_enabled boolean not null default false,
  focus_themes text[] default '{}',
  updated_at timestamptz not null default now()
);

comment on table user_preferences is 'User experience preferences (intensity, audio, themes)';

-- -----------------------------------------------------------------------------
-- journal_entries: the heart of the personal inner space
-- -----------------------------------------------------------------------------
create table journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  mood_tags mood_tag[] default '{}',
  themes text[] default '{}',
  -- Vector embedding for semantic search (populated async after save)
  -- 768 dimensions = suitable for most embedding models (e.g. Cohere embed-v3)
  -- Can be changed to 1536 for OpenAI ada-002 if needed
  embedding vector(768),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table journal_entries is 'User journal entries with mood tags, themes, and optional embeddings';
comment on column journal_entries.embedding is 'Semantic embedding for AI context retrieval. Populated asynchronously.';
