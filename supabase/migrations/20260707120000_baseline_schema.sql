-- =============================================================================
-- 20260707120000_baseline_schema.sql — Canonical baseline (9 tables)
-- =============================================================================
-- Source of truth: src/lib/db/schema.ts (Drizzle). This migration creates the
-- 9 application tables EXACTLY matching the Drizzle column names/types/defaults.
--
-- Context: the remote cloud schema could not be captured (`supabase db pull`
-- requires a linked+authenticated project; neither was true at authoring time).
-- This is therefore an idempotent baseline for a fresh/empty project. If the
-- remote already contains diverging tables, run `supabase db pull` first and
-- write reconciling ALTER migrations instead — `create table if not exists`
-- below will NOT alter pre-existing tables.
--
-- Referential integrity: Drizzle does not declare DB-level FKs to auth.users
-- (it cannot reference the auth schema). We add them here as an intentional,
-- shape-preserving enhancement so account deletion cascades cleanly. Column
-- names/types/defaults remain identical to the Drizzle schema.
-- =============================================================================

-- gen_random_uuid() is core in Postgres 13+; pgcrypto is enabled for parity
-- with the archived database/00_extensions.sql and as belt-and-suspenders.
create extension if not exists pgcrypto with schema extensions;

-- -----------------------------------------------------------------------------
-- profiles  (id = auth.users.id; auto-created by handle_new_user trigger)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- journal_entries
-- -----------------------------------------------------------------------------
create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  content    text not null,
  mood_tags  jsonb default '[]'::jsonb,
  themes     jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- practices  (single table; streaks/sessions deferred per roadmap YAGNI)
-- -----------------------------------------------------------------------------
create table if not exists public.practices (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  type         text not null,               -- 'meditation' | 'breathwork' | 'soundscape'
  duration     integer not null,            -- seconds
  completed_at timestamptz not null default now(),
  notes        text
);

-- -----------------------------------------------------------------------------
-- map_nodes
-- -----------------------------------------------------------------------------
create table if not exists public.map_nodes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  type        text not null,                -- 'theme'|'insight'|'journal-entry'|'practice'|'archetype'
  label       text not null,
  description text,
  source_id   text,
  source_type text,
  color       text,
  size        integer not null default 1,
  x           real,
  y           real,
  created_at  timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- map_edges  (references map_nodes)
-- -----------------------------------------------------------------------------
create table if not exists public.map_edges (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  source_node_id uuid not null references public.map_nodes (id) on delete cascade,
  target_node_id uuid not null references public.map_nodes (id) on delete cascade,
  label          text,
  strength       integer not null default 1,
  created_at     timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- user_preferences  (onboarding_completed lives here; unique per user)
-- -----------------------------------------------------------------------------
create table if not exists public.user_preferences (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null unique references auth.users (id) on delete cascade,
  intensity_mode       text default 'balanced',   -- 'still' | 'balanced' | 'immersive'
  audio_enabled        boolean default false,
  focus_themes         jsonb default '[]'::jsonb,
  onboarding_completed boolean default false,
  updated_at           timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- guide_conversations
-- -----------------------------------------------------------------------------
create table if not exists public.guide_conversations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  title         text,
  role          text not null,              -- 'seer'|'scientist'|'architect'|'mirror'
  message_count integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- guide_messages  (scoped through conversation ownership; no user_id column)
-- -----------------------------------------------------------------------------
create table if not exists public.guide_messages (
  id                  uuid primary key default gen_random_uuid(),
  conversation_id     uuid not null references public.guide_conversations (id) on delete cascade,
  role                text not null,        -- 'user' | 'assistant'
  content             text not null,
  structured_response jsonb,
  created_at          timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- saved_prompt_cards
-- -----------------------------------------------------------------------------
create table if not exists public.saved_prompt_cards (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users (id) on delete cascade,
  question               text not null,
  context                text,
  type                   text not null,     -- 'reflection'|'inquiry'|'practice'|'vision'
  source_conversation_id uuid references public.guide_conversations (id) on delete set null,
  saved_at               timestamptz not null default now()
);
