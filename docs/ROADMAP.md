# OneEmergence — Platform Roadmap

Date: 2026-07-07 · Status: Proposed (from full repo audit + vision session with Julius)

This document turns the website into an **expanding, emergently growing
OneEmergence app**. It has four parts: (I) critical findings from the repo
audit, (II) the best-practice target organization, (III) the evolved vision,
(IV) the phased roadmap — accounts, the AG-UI agent, the Akashic Records
knowledge graph, and Docker hosting.

Guiding principle: **the feature module is the unit of emergence.** The app
grows by adding self-contained `src/features/*` modules behind stable Zod
contracts — never by widening shared code. Everything below serves that.

---

## I. Critical Findings (repo audit, 2026-07-07)

Full details live in the audit; these are the load-bearing problems, ranked.

### P0 — Schema governance (the biggest risk)

There are **three divergent representations of the database** and no
migration tooling:

1. Runtime Drizzle schema (`src/lib/db/schema.ts`) — what the app actually
   queries (9 tables, jsonb tags, no embeddings).
2. Hand-written SQL (`database/00–10_*.sql`) — richer design (PG enums,
   pgvector `embedding vector(768)`, `practice_sessions`/`saved_practices`/
   `practice_streaks`) that **never creates the `practices` table the app
   uses**, and disagrees with Drizzle on `profiles` (own `id` + `user_id` FK
   vs. `id = auth.users.id`; no `avatar_url`) and `user_preferences`
   (`onboarding_completed` lives in different tables).
3. RLS policies (`database/09_rls.sql`) written against the SQL shape, while
   the app connects with a **service-role `DATABASE_URL` that bypasses RLS**
   — actual isolation is only manual `where userId = ...` filters.

Both `./drizzle` and `supabase/migrations` are empty. The `supabase/` folder
exists but is uninitialized (no `config.toml`).

### P1 — Trust and safety gaps

- No env validation: raw `process.env.X!` everywhere; a missing var fails at
  request time, not boot time.
- Sentry wiring predates Next 16: no `instrumentation.ts` /
  `instrumentation-client.ts`, so client-side Sentry is likely dead.
- `/og-image.png` referenced in metadata but missing from `public/`.

### P2 — Hygiene and consistency debt

- Dual lockfiles (`package-lock.json` tracked, `pnpm-lock.yaml` untracked);
  CI runs `npm ci`.
- No Node pin (`.nvmrc`/`engines`), no Prettier, no `.editorconfig`, no
  `typecheck`/`format`/`db:*` scripts.
- Server actions live in two homes (`src/features/*/actions.ts` AND
  `src/lib/actions/*`); feature modules follow four different internal
  shapes; one kebab-case outlier (`ambient-orb.tsx`); dead files
  (`src/styles/globals.css` is 0 bytes, starter SVGs, many `.gitkeep`s);
  duplicate page-transition templates (`src/app/template.tsx` keyed on
  `window.location.pathname` — an SSR anti-pattern — nested inside
  `(marketing)/template.tsx`).
- `@types/d3*` in `dependencies`; `tests/performance` and the `mobile`
  Playwright project exist but never run in CI.

### P3 — Honest-decision debt (not bugs, but drift)

- **i18n is scaffolding only**: `request.ts` hardcodes `de`, no component
  uses translations, `en.json` is unreachable. Either activate or remove.
- **Docs describe an older project**: README/AGENTS.md/ARCHITECTURE.md claim
  "Phase 1 complete, Next 15, React Hook Form, no API routes" — reality is
  Next 16.2, a full portal layer, an AI guide API route, and no React Hook
  Form anywhere.
- Guide model is hardcoded (`claude-sonnet-4-20250514`), single-shot
  `generateObject` — no streaming, no tools.

---

## II. Target Organization (best practices)

### Decisions to lock in (each is a conscious choice, not default drift)

| Topic | Decision | Rationale |
|---|---|---|
| Package manager | **pnpm** (delete `package-lock.json`, commit `pnpm-lock.yaml`, CI → `pnpm/action-setup`, `corepack enable`) | Already generated locally; strict node_modules caught a real bug (d3); fastest CI cache |
| Node | **22 LTS** pinned via `.nvmrc` + `engines` | Reproducibility across dev/CI/Docker |
| Schema source of truth | **Drizzle owns app tables** (`drizzle-kit generate` → SQL migrations); **`supabase/migrations` owns platform SQL** (extensions, auth trigger, RLS, storage policies). `database/*.sql` is archived after reconciliation | One generator per concern; both land in git as migrations |
| Security model | **RLS on every user table as defense-in-depth**, manual `userId` filters stay as first line; document that `DATABASE_URL` is service-role; add a Playwright test that user A cannot read user B | Honest about today's architecture, safe against tomorrow's mistake |
| Env | **`src/lib/env.ts`** — Zod-validated `process.env`, fail fast at boot, typed access everywhere | Kills the `!` assertions; makes Docker/CI misconfig loud |
| Server actions | **All mutations live in `src/features/<feature>/actions.ts`**; `src/lib/actions/` dissolves into features (guide, onboarding→auth feature, preferences) | One rule, no exceptions; feature = unit of growth |
| Feature module contract | Every feature: `actions.ts` · `schemas.ts` · `types.ts` · `components/` · `index.ts` (public API — nothing else imported cross-feature) | The emergence mechanism: add features, don't grow shared code |
| i18n | **Keep next-intl, activate honestly**: cookie-based locale in `request.ts`, extract strings page-by-page as pages are touched; DE default, EN grows incrementally | Vision demands EN/DE; big-bang extraction is waste |
| API routes | Allowed for: webhooks, **streaming/AG-UI endpoints**, auth callbacks. Everything else stays server actions | Streaming agents genuinely need a route; update the paradigm docs instead of violating them silently |
| Docs | README/AGENTS.md/.claude/CLAUDE.md get a truth pass; stale planning docs move to `docs/archive/`; AGENTS.md is the single agent-facing file (`.claude/CLAUDE.md` just points to it) | Agents and humans currently get misled on every read |
| Formatting | Prettier + `.editorconfig`, `format` + `typecheck` scripts, CI gate | Boring, standard, ends drift |

### Target structure (delta from today)

```
src/
├── app/                  # routes only — thin, no logic
│   ├── (marketing)/ (portal)/ legal/ auth/
│   └── api/
│       ├── agent/        # AG-UI event stream endpoint (Phase 2)
│       └── webhooks/
├── components/           # shared presentational only (ui/motion/layout/...)
├── features/             # THE growth surface — one folder per capability
│   ├── auth/             # NEW: portal entry, onboarding, account settings
│   ├── journal/ map/ rituals/ guide/   # existing, normalized to contract
│   ├── records/          # NEW Phase 3: Akashic Records (graph + embeddings)
│   └── field/            # LATER v3: collective features
├── lib/
│   ├── env.ts            # NEW: validated env
│   ├── db/  supabase/  ai/  content/  schemas/(shared only)  analytics/
├── i18n/  hooks/  stores/  content/  types/
supabase/
├── config.toml           # NEW: supabase init + link
└── migrations/           # NEW: platform SQL (extensions, triggers, RLS)
drizzle/                  # NEW: generated app-table migrations
Dockerfile  .dockerignore # NEW Phase 4
```

---

## III. The Vision, Thought Further

The three depth layers (cosmic → solarpunk → warm) are not just visual — they
are the **product's expansion model**:

1. **The website is the outer shell** (done): brand, content, threshold.
2. **The app is the inner space** (now): every member grows a private world —
   journal, practices, dialogues, and a personal constellation of meaning.
3. **The Akashic Records are the connective tissue** (next): everything a
   member writes, practices, and discusses becomes nodes and edges in one
   personal knowledge graph. The graph is not a feature — it is the
   **substrate**. Journal entries, guide conversations, content read,
   practices completed: all emit into the Records. The Consciousness Map is
   merely the first *view* of the Records; the AI Guide is the first *voice*
   of them.
4. **The collective field is emergent aggregation** (later): anonymized
   resonance across personal graphs — the Collective Pulse — without ever
   exposing an individual's records. Personal graphs stay sovereign;
   the collective layer only sees themes, never entries.

The AI Guide evolves from a Q&A endpoint into an **inhabitant of the app**:
via AG-UI it streams thought, renders its own UI (prompt cards, exercises,
map suggestions as first-class components), asks permission before acting
(human-in-the-loop writes to the Records), and remembers through the graph.
The Guide is the gardener of the Akashic Records; the user is the garden's
owner.

**Emergence principle for engineering:** each phase ships a thin vertical
slice that works end-to-end, then widens. No infrastructure without a
feature that proves it.

---

## IV. Roadmap

### Phase 0 — Consolidate the Foundation (~1 week)

Goal: one truth per concern; boring, trustworthy plumbing. All P0–P2 findings.

1. pnpm migration (lockfile, CI, `.nvmrc`, `engines`).
2. `src/lib/env.ts` (Zod, fail-fast); replace all raw `process.env` reads.
3. **Schema reconciliation** (the careful one):
   - Decide the canonical shape per divergence — proposal: keep Drizzle's
     `profiles` (id = auth.users.id, keep `avatar_url`), keep
     `onboarding_completed` on `user_preferences`, keep single `practices`
     table until streaks are a real feature (YAGNI), adopt the SQL draft's
     pgvector + enums only in Phase 3 when embeddings ship.
   - `supabase init` + `supabase link` (cloud project exists); write
     migration 0001: extensions + `handle_new_user` trigger + RLS policies
     matching the **Drizzle** shape.
   - `drizzle-kit generate` baseline migration; add `db:generate`,
     `db:migrate`, `db:push` scripts; archive `database/` → `docs/archive/`.
4. Sentry → `instrumentation.ts` + `instrumentation-client.ts` (Next 16).
5. Hygiene sweep: dissolve `src/lib/actions/` into features; normalize the
   four feature folders to the contract; delete dead files/templates/starter
   SVGs; rename `ambient-orb.tsx`; `@types/*` → devDeps; Prettier +
   `.editorconfig` + `typecheck`/`format` scripts; create `og-image.png`
   (from the brand emblem); CI runs perf + mobile projects nightly.
6. Docs truth pass (README, AGENTS.md, ARCHITECTURE §VII status, archive
   stale plans).
7. i18n honesty: cookie-based locale resolution in `request.ts`; Navbar +
   Footer + one page migrated to `useTranslations` as the pattern.

Exit criteria: `pnpm i && pnpm typecheck && pnpm build && pnpm test:smoke`
green from a fresh clone with only `.env` filled; migrations apply to a fresh
Supabase project.

### Phase 1 — Accounts & Identity (~1–2 weeks)

Goal: real members. Supabase Auth end-to-end, GDPR-clean.

- **Auth feature module** (`src/features/auth/`): email+password, magic
  link, Google OAuth via Supabase; Portal Entry stays the threshold
  *experience* wrapping these flows (cosmic→warm gradient already built).
- Profile & settings page (display name, avatar via Supabase Storage +
  storage RLS policy, bio, locale, intensity default).
- Account lifecycle: email verification, password reset, **data export
  (JSON of all user rows) and account deletion** (cascade + auth.users) —
  "Privacy is absolute" (VISION) made real.
- RLS live on all user tables (from Phase 0 migration); add the A-cannot-
  read-B Playwright test.
- Onboarding flow persists to the reconciled schema.

Exit criteria: a stranger can sign up, cross the portal, journal, practice,
talk to the guide, export their data, and delete themselves — on the cloud
Supabase with RLS enforced.

### Phase 2 — The AG-UI Agent (~2–3 weeks)

Goal: the Guide becomes a streaming, acting, permission-asking companion.

- **Adopt the AG-UI protocol** as the wire format between guide backend and
  frontend: `src/app/api/agent/route.ts` streams AG-UI events (SSE).
  Recommended runtime: **Vercel AI SDK (already installed) + the AG-UI
  adapter/mapping layer**; evaluate CopilotKit React client for the frontend
  vs. a thin custom client over `@ag-ui/client` — decide by prototyping the
  prompt-card flow in both (1-day spike). Note: ARCHITECTURE.md's "no
  chatbot frameworks" rule is consciously superseded here by the AG-UI
  decision; update the doc.
- **Streaming first**: token streaming into `GuideChatView`, replacing
  single-shot `generateObject`; structured outputs become **generative UI
  events** (prompt cards, exercises, visual activations render as they
  arrive).
- **Tools with human-in-the-loop**: `search_journal`, `read_map`,
  `suggest_map_nodes` (user confirms before write), `start_practice`,
  `recommend_content`. Tool calls and confirmations flow as AG-UI events.
- **Shared state**: conversation + user context synchronized via AG-UI state
  events; model configurable via env (`AI_MODEL`), default a current Claude.
- Keep the four roles as system-prompt personas; context injection upgraded
  to pull from the Records once Phase 3 lands.

Exit criteria: guide streams, renders its own UI, executes at least three
tools with confirmation UX, all events AG-UI-conformant.

### Phase 3 — Akashic Records (~3–4 weeks, incremental)

Goal: the knowledge-graph substrate under everything.

- **Data layer** (`src/features/records/`): enable pgvector; add
  `embedding vector(768)` to `journal_entries`, `map_nodes`, and a new
  `records_chunks` table for content; embeddings computed on write via
  Supabase Edge Function or Next `after()` (start with `after()` — no new
  infra, swap later if volume demands).
- **Graph model**: `map_nodes`/`map_edges` generalize into the Records
  (nodes: entry, insight, theme, practice, content, conversation; edges:
  manual + auto-suggested via cosine similarity above threshold — suggested
  edges require user confirmation, per "the map grows with understanding").
- **Views of the Records**: Consciousness Map (exists, becomes a view),
  timeline/retrospective view, theme clusters on the dashboard.
- **Agent integration**: guide tools `query_records` (semantic search) and
  `link_records` (HITL edge creation); guide context = top-k relevant
  records instead of "last 20 messages".
- **Sovereignty**: everything user-scoped + RLS; export includes the graph;
  collective aggregation explicitly deferred to v3 and only ever
  theme-level.

Exit criteria: writing a journal entry visibly grows the graph within
seconds; the guide cites records in conversation; similarity suggestions
appear and require consent.

### Phase 4 — Docker & Sovereign Hosting (~3–4 days)

Goal: the app runs anywhere; EU self-host path open (per ARCHITECTURE
decision "Vercel MVP → EU self-host later").

- `next.config.ts`: `output: 'standalone'`.
- **Multi-stage Dockerfile**: `node:22-alpine` base → corepack/pnpm install
  (cached) → build → distroless-style runner (non-root `nextjs` user, only
  `.next/standalone` + `static` + `public`), `HEALTHCHECK` on `/api/health`
  (tiny new route), port 3000.
- `.dockerignore` (node_modules, .next, .git, docs, tests, .env*).
- `docker-compose.yml`: app + env-file; Supabase stays cloud for now —
  compose gains a self-hosted Supabase profile only when data sovereignty
  demands it (the CLI supports self-hosted; keep the door open, don't walk
  through it yet).
- CI: build + push image to GHCR on tags; deploy target recommendation:
  Hetzner + Coolify/Dokploy when leaving Vercel.

Exit criteria: `docker run --env-file .env ghcr.io/...` serves the full app;
image < 300 MB; health check green.

### Sequencing & effort summary

| Phase | Scope | Est. effort | Unblocks |
|---|---|---|---|
| 0 | Foundation consolidation | ~1 week | everything |
| 1 | Accounts & identity | 1–2 weeks | real users, RLS |
| 2 | AG-UI agent | 2–3 weeks | living guide |
| 3 | Akashic Records | 3–4 weeks | the substrate |
| 4 | Docker & hosting | 3–4 days | sovereignty (parallelizable after 0) |

Phases 1→2→3 are strictly sequential (identity → agent → memory). Phase 4
can run in parallel any time after Phase 0.

---

*Companion docs: [VISION.md](../VISION.md) (product),
[ARCHITECTURE.md](../ARCHITECTURE.md) (technical — update pending per
Phase 0), [brand spec](./superpowers/specs/2026-07-07-brand-guide-design.md).*
