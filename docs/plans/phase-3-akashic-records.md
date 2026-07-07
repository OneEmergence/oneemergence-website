# Phase 3 — Akashic Records (Implementation Plan)

Status: Planned (execute after Phase 2) · Est. 3–4 weeks, ship incrementally
Prereqs: accounts + RLS (Phase 1), AG-UI agent with tools (Phase 2).
Reference: [ROADMAP.md](../ROADMAP.md) §IV Phase 3, VISION.md §V.C
(Consciousness Atlas).

Goal: one personal **knowledge-graph substrate** under everything. Journal
entries, guide conversations, content, practices become nodes with
embeddings; edges grow manually and by consented suggestion. The
Consciousness Map becomes the first *view* of the Records; the Guide their
first *voice*.

## Design principles

- **Postgres only.** pgvector + recursive CTEs. No Neo4j, no external vector
  DB until scale forces it (ponytail: the upgrade path exists, don't walk it
  early).
- **Sovereignty**: every row user-scoped + RLS; the data export includes the
  full graph; nothing collective in this phase.
- **Consent for machine edges**: auto-suggested links require user
  confirmation before they exist as real edges (VISION: "the map grows with
  understanding").
- **Incremental shipping**: each task below is releasable alone.

## Data model (migration sketch, supabase/migrations)

```sql
create extension if not exists vector;

-- Generalize: map_nodes grows into the Records node table
alter table map_nodes
  add column if not exists embedding vector(768),
  add column if not exists content text,          -- snippet the embedding covers
  add column if not exists origin text;           -- 'user' | 'agent-suggested' | 'system'

alter table journal_entries
  add column if not exists embedding vector(768);

-- Content chunks (site MDX content, referenced not copied per-user)
create table if not exists records_content_chunks (
  id uuid primary key default gen_random_uuid(),
  content_slug text not null,
  content_type text not null,
  chunk_index int not null,
  body text not null,
  embedding vector(768),
  unique (content_slug, chunk_index)
);

-- Suggested edges awaiting consent
create table if not exists record_edge_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_node_id uuid not null references map_nodes(id) on delete cascade,
  target_node_id uuid not null references map_nodes(id) on delete cascade,
  score real not null,
  reason text,
  status text not null default 'pending',  -- pending | accepted | dismissed
  created_at timestamptz not null default now()
);
-- + RLS owner policies, ivfflat/hnsw index on embeddings
```

Mirror all shapes in `src/lib/db/schema.ts` (canonical types) per the
schema-governance rule.

## Tasks

### Task 1 — Embedding pipeline
- `src/features/records/embeddings.ts`: provider-agnostic `embed(texts) →
  vector(768)[]` — pick one model via `env.EMBEDDING_MODEL` (candidates:
  Voyage `voyage-3.5-lite`, Google `gemini-embedding-001` truncated to 768;
  decide by price/EU-availability at implementation time; add the env var +
  key to env.ts).
- Compute on write via Next `after()` in journal/map server actions (no new
  infra); backfill script `scripts/backfill-embeddings.ts` (paginated, rate-
  limited) run once manually.
- Content chunks: build-time script chunks MDX content (~500 tokens/chunk)
  and upserts `records_content_chunks` (runs in CI on content change, or
  manually via `pnpm records:index`).

### Task 2 — Records feature module (`src/features/records/`)
- `actions.ts`: `semanticSearch(query, kinds[], k)` (cosine over
  journal/map/content, user-scoped), `acceptSuggestion(id)`,
  `dismissSuggestion(id)`.
- `suggest-edges.ts`: after a node/entry gains an embedding, find top-k
  similar user nodes above threshold (start 0.82 cosine similarity, tune),
  dedupe against existing edges AND prior dismissed suggestions, insert
  `record_edge_suggestions`.
- `schemas.ts`, `types.ts`, `index.ts` per feature contract.

### Task 3 — Views of the Records
- **Map view**: suggestion badges on the Consciousness Map — pending
  suggestions render as dashed ghost-edges; accept/dismiss inline
  (`src/features/map/components/` additions, warm-layer styling).
- **Dashboard**: "Themes moving in you" cluster chips (top themes by node
  degree + recency) on `/inner`.
- **Timeline/retrospective** (releasable later): `/inner/records` route —
  chronological entry/insight stream with theme filters.

### Task 4 — Agent integration (the Guide speaks from the Records)
- New tools (Phase 2 registry): `query_records` (semanticSearch → cited
  snippets with node refs) and `link_records` (HITL — creates an edge
  suggestion the user confirms in-chat).
- `getUserContext` replaces "last 20 messages + recent entries" with top-k
  Records retrieval for the current message (RAG); guide answers cite which
  records they drew on (client renders source chips).
- Auto-node growth: after a guide conversation ends, extract candidate
  insights (`extract-themes.ts` exists in map feature — generalize) →
  suggestions, never silent writes.

### Task 5 — Sovereignty + tests
- Extend the Phase 1 data export with nodes/edges/suggestions/embeddings
  (embeddings as arrays — they are the user's data).
- Playwright: entry → node appears; suggestion → accept → edge exists;
  dismissed suggestions never resurface; RLS isolation on new tables.
- Perf guard: semanticSearch p95 < 300ms on 10k nodes (hnsw index).

## Exit criteria
Writing a journal entry visibly grows the graph within seconds; the map
shows consented machine-suggested edges as such; the Guide cites records in
conversation; export contains the full graph; all new tables RLS-protected.

## Explicitly deferred (v3 / Collective Field)
Cross-user aggregation (Collective Pulse), theme-level anonymized rollups,
shared spaces. The Records stay strictly personal in this phase.
