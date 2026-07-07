-- =============================================================================
-- 06_tables_collective_future.sql — Collective Field Tables (v3 / Future)
-- =============================================================================
-- These tables support the Collective Field Layer (VISION.md Layer 3):
-- Collective Pulse, Shared Spaces, Live Ceremonies, Field Contributions.
--
-- STATUS: Future-ready. These tables are designed now for schema coherence
-- but should NOT be created until v3 development begins. They are included
-- here for planning purposes and to ensure the MVP schema doesn't block them.
--
-- To skip: simply don't run this file against your database until v3.
-- =============================================================================

-- Uncomment the entire block below when starting v3 development.

/*

-- -----------------------------------------------------------------------------
-- collective_themes: aggregated theme activity across all users (anonymous)
-- -----------------------------------------------------------------------------
-- Powers the Collective Pulse visualization. No user attribution.
-- Populated by a scheduled job that aggregates from journal_entries.themes.
create table collective_themes (
  id uuid primary key default gen_random_uuid(),
  theme text not null unique,
  -- Rolling counts for pulse visualization
  activity_24h integer not null default 0,
  activity_7d integer not null default 0,
  activity_30d integer not null default 0,
  last_computed_at timestamptz not null default now()
);

comment on table collective_themes is 'Anonymous aggregate theme activity for Collective Pulse (v3)';

-- -----------------------------------------------------------------------------
-- shared_spaces: persistent thematic rooms
-- -----------------------------------------------------------------------------
create table shared_spaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  theme text not null, -- e.g., 'oneness', 'ai-consciousness', 'solarpunk'
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table shared_spaces is 'Persistent thematic community rooms (v3)';

-- -----------------------------------------------------------------------------
-- shared_space_messages: messages within shared spaces
-- -----------------------------------------------------------------------------
create table shared_space_messages (
  id uuid primary key default gen_random_uuid(),
  space_id uuid not null references shared_spaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  -- Anonymous by default, identity by choice
  is_anonymous boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table shared_space_messages is 'Messages in shared thematic spaces (v3)';

-- -----------------------------------------------------------------------------
-- live_ceremonies: scheduled synchronized sessions
-- -----------------------------------------------------------------------------
create table live_ceremonies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  -- Ceremony type: meditation, intention, reflection, custom
  ceremony_type text not null,
  scheduled_at timestamptz not null,
  duration_minutes integer not null,
  -- Presence tracking
  participant_count integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

comment on table live_ceremonies is 'Scheduled live ceremonies with presence tracking (v3)';

-- -----------------------------------------------------------------------------
-- field_contributions: community art, essays, poetry
-- -----------------------------------------------------------------------------
create table field_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  content text not null,
  -- Type: essay, art, sound, visual, poetry
  contribution_type text not null,
  -- Moderation: contributions are gifts, curated by resonance
  status text not null default 'pending' check (status in ('pending', 'approved', 'archived')),
  -- No likes, no followers — but resonance can be expressed
  resonance_count integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table field_contributions is 'Community contributions curated by resonance, not algorithms (v3)';

-- -----------------------------------------------------------------------------
-- collective_intentions: shared visions and manifestation seeds
-- -----------------------------------------------------------------------------
create table collective_intentions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intention text not null,
  is_anonymous boolean not null default true,
  resonance_count integer not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz -- intentions can have a time horizon
);

comment on table collective_intentions is 'Shared intentions and visions for the collective field (v3)';

*/
