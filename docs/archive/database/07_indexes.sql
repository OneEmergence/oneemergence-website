-- =============================================================================
-- 07_indexes.sql — Performance Indexes
-- =============================================================================
-- Indexes for common query patterns. Supabase Postgres auto-creates indexes
-- on primary keys and unique constraints. These cover the remaining hot paths.

-- Core: user lookups (all user-owned tables share this pattern)
create index idx_profiles_user_id on profiles(user_id);
create index idx_journal_entries_user_id on journal_entries(user_id);
create index idx_journal_entries_user_created on journal_entries(user_id, created_at desc);

-- Journal: theme and mood filtering
create index idx_journal_entries_themes on journal_entries using gin(themes);
create index idx_journal_entries_mood_tags on journal_entries using gin(mood_tags);

-- Journal: semantic search via embedding vector
-- IVFFlat index — efficient for approximate nearest neighbor search
-- Create after sufficient data exists (100+ entries per user)
-- Uncomment when embedding pipeline is active:
-- create index idx_journal_entries_embedding on journal_entries
--   using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Guide: conversation lookups
create index idx_guide_conversations_user_id on guide_conversations(user_id);
create index idx_guide_conversations_user_updated on guide_conversations(user_id, updated_at desc);
create index idx_guide_messages_conversation_id on guide_messages(conversation_id);
create index idx_guide_messages_conversation_created on guide_messages(conversation_id, created_at asc);

-- Saved prompt cards
create index idx_saved_prompt_cards_user_id on saved_prompt_cards(user_id);

-- Map: node and edge lookups
create index idx_map_nodes_user_id on map_nodes(user_id);
create index idx_map_nodes_user_type on map_nodes(user_id, type);
create index idx_map_nodes_source on map_nodes(source_id) where source_id is not null;
create index idx_map_edges_user_id on map_edges(user_id);
create index idx_map_edges_source_node on map_edges(source_node_id);
create index idx_map_edges_target_node on map_edges(target_node_id);

-- Practice: session history
create index idx_practice_sessions_user_id on practice_sessions(user_id);
create index idx_practice_sessions_user_completed on practice_sessions(user_id, completed_at desc);
create index idx_practice_sessions_user_type on practice_sessions(user_id, type);

-- Saved practices: user's ritual memory
create index idx_saved_practices_user_id on saved_practices(user_id);
create index idx_saved_practices_user_sort on saved_practices(user_id, sort_order asc);
