# Design: The Records Substrate and Its Organs

Date: 2026-07-27 · Status: Approved, frozen for Wave 0

Turns the existing portal from four parallel silos into one substrate with
several views. Supersedes ROADMAP Phase 2 + Phase 3 sequencing: the substrate
comes first, and the Guide becomes its voice rather than a separate phase.

---

## I. Decisions locked in this design

| Topic | Decision | Rationale |
|---|---|---|
| Similarity engine | **Postgres-native**: `tsvector` (german config) + `pg_trgm`. No embeddings, no pgvector, no external provider. | Zero external calls, zero new infra, no journal content leaves the database. Matches "Privacy is absolute" (VISION) and the EU self-host path. pgvector stays an explicit later upgrade. |
| Agent stack | **Vercel AI SDK v6 natively** (`ai` ^6, `@ai-sdk/anthropic` ^3, both installed). No AG-UI, no CopilotKit. | AG-UI solves interop between foreign agent backends and clients; there is exactly one first-party client. The AG-UI decision in ROADMAP §II predates AI SDK v6 shipping streaming + tools + generative UI. **This consciously supersedes ROADMAP Phase 2's AG-UI decision.** |
| Scoping | **Records are user-scoped only.** No `workspace_id`. | ROADMAP Phase 1 locks the privacy boundary: journals, practices, maps and guide conversations stay user-owned. Workspace membership grants portal access, never content access. |
| Graph tables | `map_nodes` / `map_edges` are **replaced by** `records` / `record_links`, with data migrated. Not run in parallel. | ROADMAP Phase 3 already specifies this generalisation. Two graphs would immediately diverge, as the three schema representations did before Phase 0. |
| Write path | Single `emitRecord()`, invoked from feature actions via Next.js `after()`. | One write path is what makes "many views" possible. `after()` keeps the user's response off the graph-write latency. |
| Suggested links | Persisted with `confirmed_at IS NULL`; invisible to views until confirmed. | "The map grows with understanding" (VISION) expressed as a column, not as UI convention. |

## II. The core move

Today the four capabilities sit beside each other. `journal_entries` are rows;
the Consciousness Map is recomputed from them by a separate extraction pass
(`src/features/map/extract-themes.ts`, `generate-nodes.ts`); the Guide is a
single-shot `generateObject` whose memory is "the last N messages".

After Wave 1: **one write path, many views.** Everything a member writes,
practises, or discusses emits into one substrate. Map, Guide and Dashboard are
windows into it, not silos beside it.

The heart of the product is the *connection*, not any single organ.

---

## III. Data model

Not a data lake. The existing tables remain the source of truth for their own
content. The substrate adds a **thin index plus a graph**.

### `records`

```sql
-- The enum must exist before the table that references it.
create type public.record_kind as enum
  ('journal', 'practice', 'conversation', 'content', 'insight', 'theme');

create table public.records (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  kind          public.record_kind not null,
  source_table  text not null,
  source_id     uuid not null,
  title         text not null,
  excerpt       text not null default '',
  search_vector tsvector generated always as (
                  setweight(to_tsvector('german', coalesce(title, '')),   'A') ||
                  setweight(to_tsvector('german', coalesce(excerpt, '')), 'B')
                ) stored,
  occurred_at   timestamptz not null default now(),
  created_at    timestamptz not null default now(),
  unique (source_table, source_id)
);

create index records_user_occurred_at_idx on public.records (user_id, occurred_at desc);
create index records_search_idx           on public.records using gin (search_vector);
create index records_title_trgm_idx       on public.records using gin (title gin_trgm_ops);
```

`unique (source_table, source_id)` makes `emitRecord` idempotent — re-emitting
an edited journal entry updates its record rather than duplicating it.

`search_vector` is a **generated column**: Postgres maintains it on every write,
so there is no trigger to keep in sync and no way for the index to drift from
the content.

### `record_links`

```sql
create type public.record_link_kind as enum ('manual', 'suggested', 'derived');

create table public.record_links (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  from_record_id uuid not null references public.records(id) on delete cascade,
  to_record_id   uuid not null references public.records(id) on delete cascade,
  kind           public.record_link_kind not null default 'suggested',
  weight         real not null default 1,
  label          text,
  confirmed_at   timestamptz,
  created_at     timestamptz not null default now(),
  check (from_record_id <> to_record_id),
  unique (from_record_id, to_record_id)
);

create index record_links_user_idx on public.record_links (user_id);
create index record_links_from_idx on public.record_links (from_record_id);
create index record_links_to_idx   on public.record_links (to_record_id);
```

`confirmed_at IS NULL` means *suggested*. **Every view filters suggested links
out by default**; only the explicit consent surface shows them.

`manual` and `derived` links are created already-confirmed. `derived` covers
structural links the system can assert without interpretation (a conversation
that cites a journal entry). Only `suggested` requires consent, because only
`suggested` is an interpretation of the member's inner life.

Links are **stored directed** (the unique constraint is on the ordered pair) and
**rendered undirected** by the map. Before inserting, `suggestLinks` normalises
the pair so the lexicographically smaller UUID is always `from_record_id` —
without that, A→B and B→A are two rows and the constraint never fires.

### RLS

Both tables: RLS enabled, four policies each (select/insert/update/delete)
gated on `auth.uid() = user_id`, matching the shape already established in
`supabase/migrations/20260707120200_rls_policies.sql`.

`DATABASE_URL` is a service-role connection and bypasses RLS — manual
`where userId = ...` filters stay the first line of defence, exactly as
ROADMAP §II documents. RLS is the second.

### Migration and backfill

One migration, `supabase/migrations/20260727120000_records_substrate.sql`:

1. `create extension if not exists pg_trgm`
2. enums, tables, indexes, RLS policies
3. backfill `records` from `journal_entries`, `practices`, `guide_conversations`
4. migrate `map_nodes` → `records`, `map_edges` → `record_links`
   (existing edges become `kind = 'manual'`, `confirmed_at = now()` — they were
   already visible to the member, so they are already consented)
5. `drop table map_edges, map_nodes`

Mirrored into `supabase/schemas/` (declarative desired state) and
`src/lib/db/schema.ts` (Drizzle runtime types).

---

## IV. Contracts — frozen before Wave 1

`src/features/records/` follows the feature-module contract from AGENTS.md:
`actions.ts` · `schemas.ts` · `types.ts` · `components/` · `index.ts`.

### `schemas.ts` (Zod)

```ts
export const RecordKind = z.enum([
  'journal', 'practice', 'conversation', 'content', 'insight', 'theme',
])

export const RecordLinkKind = z.enum(['manual', 'suggested', 'derived'])

export const RecordSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  kind: RecordKind,
  sourceTable: z.string().min(1),
  sourceId: z.uuid(),
  title: z.string().min(1),
  excerpt: z.string(),
  occurredAt: z.date(),
  createdAt: z.date(),
})

export const RecordLinkSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  fromRecordId: z.uuid(),
  toRecordId: z.uuid(),
  kind: RecordLinkKind,
  weight: z.number(),
  label: z.string().nullable(),
  confirmedAt: z.date().nullable(),
  createdAt: z.date(),
})

export const EmitRecordInput = z.object({
  kind: RecordKind,
  sourceTable: z.string().min(1),
  sourceId: z.uuid(),
  title: z.string().min(1).max(200),
  excerpt: z.string().max(2000).default(''),
  occurredAt: z.date().optional(),
})

export const QueryRecordsInput = z.object({
  query: z.string().max(200).optional(),
  kinds: z.array(RecordKind).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  before: z.date().optional(),
})
```

### `index.ts` — the four frozen signatures

```ts
/** Idempotent on (sourceTable, sourceId). Safe to call from `after()`. */
export function emitRecord(input: EmitRecordInput): Promise<Record>

/** Full-text (german) + trigram fallback, newest-first when `query` is absent. */
export function queryRecords(input: QueryRecordsInput): Promise<Record[]>

/** Unconfirmed candidates for a record. Persists them as `suggested`. */
export function suggestLinks(recordId: string): Promise<RecordLink[]>

/** Sets `confirmed_at`. The only path by which a suggestion becomes real. */
export function confirmLink(linkId: string): Promise<RecordLink>
```

All four are user-scoped: each derives `userId` from the session server-side and
never accepts it as a parameter. A caller cannot address another member's data.

**These signatures are frozen at the end of Wave 0.** Wave 1 agents build
against them and may not change them. A genuine need to change one is an
escalation to the human, not a unilateral edit — this is precisely where two
concurrent sessions have already collided in this repository.

---

## V. Search strategy

`queryRecords` runs one SQL statement, no application-side ranking:

1. `search_vector @@ websearch_to_tsquery('german', :q)`, ordered by
   `ts_rank_cd(search_vector, query) desc`
2. When full-text returns fewer than `limit` rows, union with a trigram pass —
   `similarity(title, :q) > 0.3` — for typos and partial words
3. Without `query`, plain `order by occurred_at desc`

`suggestLinks(recordId)` takes the source record's `title || ' ' || excerpt` as
the query, runs the same search excluding the record itself and anything already
linked, and persists the top 5 above a rank threshold as `suggested`.

German text search matters: the content is German, and `to_tsvector('english')`
would fail to stem it. This is why the config is pinned in the generated column
rather than left to the database default.

> `ponytail:` no embeddings. Postgres FTS answers "what relates to this" today
> with no external call and no new infrastructure. Add pgvector when the
> substrate has proven its value and FTS is measurably the limit — the `records`
> table takes an `embedding vector(768)` column without any other change.

---

## VI. The Guide

`src/app/api/guide/route.ts` moves from `generateObject` to `streamText`.

| Tool | Effect | Write? |
|---|---|---|
| `search_records` | Semantic search across the member's substrate. Replaces "last N messages" as the context mechanism. | no |
| `suggest_link` | Proposes a connection → persisted `confirmed_at: NULL`, surfaced for consent | inert only |
| `start_practice` | Opens a practice, which emits its own record on completion | no |
| `recommend_content` | Library recommendation from the member's themes | no |

**No tool changes what the member sees without human confirmation.** The Guide
proposes; the member owns the garden. `suggest_link` is the only tool that
persists a row at all, and that row is invisible to every view until
`confirmLink` runs — so the member's map cannot change behind their back.

Model stays configurable via `AI_MODEL` (`src/lib/env.ts`, default
`claude-sonnet-5`). Adaptive thinking on; `effort` set per route. The system
prompt is stable and cacheable — placing the four role personas ahead of the
per-turn context keeps the cached prefix intact (min. 512 tokens on Opus 5,
1024 on Sonnet 5).

---

## VII. Waves and file ownership

Parallel agents are safe only if their write sets are disjoint. This table is
the contract that makes the fan-out safe; an agent that needs to write outside
its rows escalates rather than reaching across.

### Wave 0 — Substrate (sequential, 1 agent)

Owns: `supabase/migrations/20260727120000_records_substrate.sql`,
`supabase/schemas/`, `src/lib/db/schema.ts`, `src/features/records/**`.

Delivers: migration + backfill + the four frozen contracts + RLS.
Exit: `pnpm typecheck && pnpm build` green; migration applies to a fresh
database; contracts frozen.

### Wave 1 — Fan-out (8 agents, one git worktree each)

| # | Agent | Owns (writes) | Reads |
|---|---|---|---|
| 1 | `records-search` | `src/features/records/{queries,actions}.ts` (internals only — `index.ts` and `schemas.ts` stay frozen) | contracts |
| 2 | `records-emitters` | `src/features/journal/actions.ts`, `src/features/guide/actions.ts`, backfill verification | `records` barrel |
| 3 | `guide-streaming` | `src/app/api/guide/route.ts`, `src/features/guide/components/GuideChatView.tsx` | contracts |
| 4 | `guide-tools` | `src/features/guide/tools.ts`, `components/ToolConfirm*.tsx` | contracts |
| 5 | `map-as-view` | `src/features/map/**`, `src/app/(portal)/inner/map/**` | contracts |
| 6 | `dashboard-weave` | `src/app/(portal)/inner/page.tsx`, `DashboardClient.tsx` | contracts |
| 7 | `journal-depth` | `src/features/journal/components/**`, `inner/journal/**` | contracts |
| 8 | `practice-rhythm` | `src/features/rituals/**` (**including** its own `emitRecord` call), `inner/practice/**` | contracts |

Shared-by-necessity files — `src/i18n/messages/{de,en}.json` and
`src/app/globals.css` — are **append-only** for Wave 1 agents: add keys and
tokens, never reorder or edit existing ones. Merge conflicts on an append-only
file resolve trivially; conflicts on a reordered file do not.

Agents 3 and 4 both touch the Guide feature but own disjoint files; 4 exports
the tool array that 3 imports.

Agent 8 owns the practice emitter rather than agent 2, so that no two agents
write `src/features/rituals/actions.ts`. Agent 2 keeps journal and guide, whose
component files belong to agents 7 and 3 respectively — again disjoint.

### Wave 2 — Verification (parallel)

One adversarial reviewer per workstream, prompted to refute rather than confirm.
Plus one accessibility/i18n/performance sweep and one end-to-end run of §VIII.

---

## VIII. Acceptance criterion

> A member writes a journal entry. Within seconds their constellation visibly
> grows. In the next conversation the Guide references that entry and proposes a
> connection. The member confirms it. The map changes.

This single chain is the acceptance test for Wave 1. Anything that does not
serve it does not belong in this wave.

Mechanically, in `tests/`:

- `emitRecord` is idempotent under repeated calls with the same source
- `queryRecords` finds a German entry by a stemmed word from its body
- a `suggested` link is invisible to the map until `confirmLink` runs
- user A cannot read user B's records or links (extends the existing
  `tests/rls/rls-isolation.spec.ts` pattern)
- the Guide streams tokens and executes at least one tool with confirmation

## IX. Explicitly out of scope

- **Embeddings / pgvector.** Deferred until FTS is measurably the limit.
- **The collective field.** ROADMAP defers anonymised cross-member resonance to
  v3; personal graphs stay sovereign. Nothing in this design reads across users.
- **AG-UI protocol adoption.** Superseded (§I). Revisit if a third-party client
  or foreign agent backend ever needs to attach.
- **Rewriting the Stories system** (`/s/[slug]`), which a parallel session has
  just built and which is orthogonal to the substrate.

---

*Companion docs: [ROADMAP.md](../../ROADMAP.md) (phases),
[VISION.md](../../../VISION.md) (product),
[ARCHITECTURE.md](../../../ARCHITECTURE.md) (stack),
[AGENTS.md](../../../AGENTS.md) (agent instructions).*
