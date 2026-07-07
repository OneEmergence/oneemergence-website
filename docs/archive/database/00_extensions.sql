-- =============================================================================
-- 00_extensions.sql — Postgres Extensions
-- =============================================================================
-- Enable required extensions for OneEmergence.
-- Run this first, before any other schema scripts.
-- Supabase pre-enables some of these, but CREATE EXTENSION IF NOT EXISTS is safe.

-- UUID generation (usually pre-enabled in Supabase)
create extension if not exists "pgcrypto";

-- Vector embeddings for AI Guide context retrieval and semantic search
-- Used by: journal_entries.embedding, map_nodes.embedding (future)
create extension if not exists "vector";

-- Automatic updated_at timestamp management
-- Used by: 08_triggers.sql
create extension if not exists "moddatetime" schema extensions;
