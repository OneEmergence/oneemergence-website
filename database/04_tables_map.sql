-- =============================================================================
-- 04_tables_map.sql — Consciousness Map Tables
-- =============================================================================
-- The personal constellation: a force-directed graph of themes, insights,
-- journal entries, practices, and archetypes. Nodes grow organically from
-- journal content; users can also create manual connections.

-- -----------------------------------------------------------------------------
-- map_nodes: individual nodes in the consciousness constellation
-- -----------------------------------------------------------------------------
create table map_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type map_node_type not null,
  label text not null,
  description text,
  -- Link back to source content (e.g., journal entry that spawned this node)
  source_id uuid,
  source_type text,
  -- Visual properties
  color text,
  size integer not null default 1 check (size >= 1 and size <= 10),
  -- Persisted position (users develop spatial memory of their map)
  x real,
  y real,
  -- Optional embedding for semantic clustering
  embedding vector(768),
  created_at timestamptz not null default now()
);

comment on table map_nodes is 'Consciousness Map nodes: themes, insights, entries, practices, archetypes';
comment on column map_nodes.source_id is 'UUID of the source entity (e.g., journal_entries.id)';
comment on column map_nodes.x is 'Persisted x-position from force layout or user drag';
comment on column map_nodes.y is 'Persisted y-position from force layout or user drag';

-- -----------------------------------------------------------------------------
-- map_edges: connections between nodes
-- -----------------------------------------------------------------------------
create table map_edges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_node_id uuid not null references map_nodes(id) on delete cascade,
  target_node_id uuid not null references map_nodes(id) on delete cascade,
  label text,
  strength integer not null default 1 check (strength >= 1 and strength <= 5),
  created_at timestamptz not null default now(),
  -- Prevent duplicate edges between same node pair
  unique (source_node_id, target_node_id)
);

comment on table map_edges is 'Connections between Consciousness Map nodes';
comment on column map_edges.label is 'Optional annotation: why are these nodes connected?';

-- Prevent self-referencing edges
alter table map_edges add constraint no_self_edges
  check (source_node_id != target_node_id);
