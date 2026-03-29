-- =============================================================================
-- 01_types.sql — Custom Enum Types
-- =============================================================================
-- Postgres enums for closed value sets. These enforce valid values at the DB
-- level and map cleanly to TypeScript union types via Drizzle.

-- Intensity modes for user experience preference
create type intensity_mode as enum ('still', 'balanced', 'immersive');

-- Mood tags for journal entries
create type mood_tag as enum (
  'calm', 'restless', 'grateful', 'anxious', 'inspired',
  'heavy', 'light', 'curious', 'sad', 'joyful'
);

-- AI Guide roles — four distinct consciousness companion modes
create type guide_role as enum ('seer', 'scientist', 'architect', 'mirror');

-- Guide message sender
create type message_role as enum ('user', 'assistant');

-- Consciousness Map node types
create type map_node_type as enum (
  'theme', 'insight', 'journal-entry', 'practice', 'archetype'
);

-- Prompt card types (saved from AI Guide)
create type prompt_card_type as enum ('reflection', 'inquiry', 'practice', 'vision');

-- Practice types
create type practice_type as enum ('meditation', 'breathwork', 'soundscape', 'journaling', 'custom');

-- Sacred content types (for future content-DB integration)
create type content_type as enum (
  'teaching', 'reflection', 'practice', 'transmission', 'visual-essay', 'sound-journey'
);
