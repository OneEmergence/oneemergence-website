-- =============================================================================
-- 05_tables_practice.sql — Practice & Ritual Tables
-- =============================================================================
-- Practice sessions (meditation, breathwork, soundscapes), ritual memory
-- (saved practice sequences), and saved practices.

-- -----------------------------------------------------------------------------
-- practice_sessions: completed practice sessions (meditation, breathwork, etc.)
-- -----------------------------------------------------------------------------
create table practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type practice_type not null,
  -- Duration in seconds
  duration integer not null check (duration > 0),
  -- Optional: specific practice variant (e.g., "box-breathing", "4-7-8")
  variant text,
  -- Freeform notes after practice
  notes text,
  completed_at timestamptz not null default now()
);

comment on table practice_sessions is 'Logged practice sessions (meditation, breathwork, soundscape)';

-- -----------------------------------------------------------------------------
-- saved_practices: user's ritual memory — practices they want to return to
-- -----------------------------------------------------------------------------
create table saved_practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  -- Reference to a content slug (MDX practice definition)
  content_slug text,
  -- Or a custom practice definition
  practice_type practice_type not null,
  default_duration integer, -- seconds
  -- User's personal notes on this practice
  personal_notes text,
  -- Ordering within the user's ritual memory
  sort_order integer not null default 0,
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table saved_practices is 'Ritual Memory: user-curated library of practices they return to';

-- -----------------------------------------------------------------------------
-- practice_streaks: pre-computed daily practice streaks (denormalized for perf)
-- -----------------------------------------------------------------------------
-- This avoids computing streaks from practice_sessions on every dashboard load.
-- Updated via trigger or server action after each practice_sessions insert.
create table practice_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_practice_date date,
  total_sessions integer not null default 0,
  total_minutes integer not null default 0,
  updated_at timestamptz not null default now()
);

comment on table practice_streaks is 'Pre-computed practice streak stats for dashboard display';
