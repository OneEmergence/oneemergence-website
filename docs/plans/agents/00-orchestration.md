# OneEmergence — Agent Orchestration Plan

> Master coordination document for parallel agent workstreams.
> Updated 2026-03-30 after Supabase migration.

---

## Current Status Summary

The project has advanced well beyond the original phased plan. Most foundation and infrastructure agents are complete, the Supabase migration has consolidated the backend stack, and the remaining work is primarily in the Design System, Public Experience polish, Quality hardening, and portal feature completion.

---

## Workstream Overview

| # | Agent | Mission | Status | Notes |
|---|-------|---------|--------|-------|
| 1 | **Architecture Migration** | Restructure repo to target folder layout | ✅ Complete | Route groups, component split, features/ scaffold |
| 2 | **Design System & Motion** | UI primitives, intensity modes, motion infrastructure | ⏸ Blocked (unblock ready) | Agent 1 done — can resume. Intensity stores, motion components, shadcn/ui pending. |
| 3 | **Content System** | MDX pipeline, Zod schemas, sacred content types, i18n | ✅ Complete | MDX pipeline, Zod schemas, content renderers, next-intl configured |
| 4 | **Public Experience** | Living Portal v2, Experiences, panel nav | 🔄 Phase 2 in progress | Living Portal v2, Experiences, Library page + detail routes (`/library/[type]/[slug]`). Panel nav + visual essays remaining. |
| 5 | **Portal & Auth** | Auth, DB, dashboard, journal, ritual room | ✅ Foundation complete | **Stack migrated to Supabase** (commit f3447e4). Auth, middleware, portal, dashboard, journal CRUD, practice room built. Deferred: DB provisioning, OAuth credentials, onboarding flow, reflection graph. See `STACK_DECISION.md`. |
| 6 | **AI Guide** | Vercel AI SDK, roles, structured responses | ✅ Complete | Four-role consciousness companion, structured responses, chat UI |
| 7 | **Consciousness Map** | Graph model, D3/SVG, node interactions | ✅ Core complete | Force graph, CRUD, theme extraction, node editing, edge labels. Remaining: intensity mode integration, mobile polish, canvas fallback, E2E tests. |
| 8 | **Quality Platform** | Sentry, Playwright, CI pipeline, perf budgets | 🔄 Phase 1 done | Sentry, Playwright basics, CI pipeline configured. Perf budgets, coverage expansion remaining. |

### Cross-cutting: Supabase Migration (2026-03-30)

The backend stack was consolidated from Neon + Auth.js to **Supabase** (Auth + Postgres + Storage + Realtime). This was a greenfield provisioning (no data existed), applied in commit `f3447e4`. Canonical references:

- **`STACK_DECISION.md`** — Why Supabase, what changes, what stays
- **`MIGRATION_PLAN.md`** — Step-by-step implementation guide
- **`database/`** — SQL schema scripts (source of truth for DB structure)

Agent 05's plan (`05-portal-auth.md`) is marked superseded for its Neon/Auth.js specifics but remains useful for portal feature scope.

---

## Execution Phases — Actual Progress

### Phase 0 — Foundation ✅

Agents 1, 8 started in parallel. Agent 1 complete. Agent 8 Phase 1 complete.

### Phase 1 — Design + Content Foundation (partially complete)

- **Agent 3 (Content System)** ✅ Complete
- **Agent 2 (Design System)** ⏸ Blocked but ready to unblock — Agent 1 is done, folders exist

### Phase 2 — Public Experience (in progress)

- **Agent 4** Phase 1 complete. Blocked on Agent 2 for motion components and intensity mode wiring before full completion.

### Phase 3 — Portal & Auth ✅ Foundation complete

- **Agent 5** built with Neon/Auth.js, then **migrated to Supabase**.
- Portal entry, dashboard, journal CRUD, practice room all functional.
- Remaining: DB provisioning + OAuth credentials (human task), onboarding flow, reflection graph, soundscape player.

### Phase 4 — Intelligence ✅ Core complete

- **Agent 6 (AI Guide)** ✅ Complete
- **Agent 7 (Consciousness Map)** ✅ Core complete — node editing + edge labels added (commit 85820f6)

---

## What Remains — Next Parallelizable Tracks

### Track A: Design System & Motion (Agent 2) — UNBLOCKED

Agent 1 is complete; `components/motion/`, stores, and folder structure exist. Agent 2 can now fully execute:
- Zustand intensity mode store (persisted)
- Motion infrastructure: ScrollReveal, ParallaxLayer, BreathingOrb wired to intensity
- `prefers-reduced-motion` integration
- shadcn/ui initialization
- Wire intensity mode into existing components (including Map's ForceGraph)

### Track B: Quality Hardening (Agent 8 Phase 2) — UNBLOCKED

- Expand Playwright coverage for portal routes (journal, map, practice, guide)
- Performance budget enforcement (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- axe-core accessibility testing
- CI pipeline: add type-check + lint + build gates

### Track C: Public Experience Polish (Agent 4 Phase 2) — BLOCKED on Agent 2

Needs motion components and intensity modes from Agent 2 before:
- Panel navigation (replace hard route transitions)
- WebGL progressive enhancement
- Visual essays
- Performance optimization pass

### Track D: Portal Feature Completion — UNBLOCKED (human provisioning needed for E2E)

Items deferred from Agent 5 that can be built without live credentials:
- First-time onboarding flow UI
- Journal auto-save (debounced)
- Practice history page
- Soundscape player component

Items requiring live Supabase project:
- E2E auth flow testing
- RLS policy verification
- OAuth credential configuration

### Track E: Map & Guide Remaining Items — UNBLOCKED

- Map: intensity mode integration (depends on Track A for store)
- Map: mobile interaction polish, canvas rendering fallback for 100+ nodes
- Map: Playwright E2E tests (Track B)
- Guide: E2E testing with live Supabase auth

**Recommended parallel execution:** Tracks A + B + D can run simultaneously. Track C follows Track A. Track E items are distributed across A, B, and D.

---

## Dependency Graph — Updated

```
COMPLETED                               REMAINING
─────────                               ─────────

[1: Architecture]  ✅                   [2: Design System]  ← READY NOW (Track A)
[3: Content]       ✅                       |
[8: Quality Ph1]   ✅                   [4: Public Experience Ph2]  (Track C, after A)
[5: Portal Auth]   ✅ (Supabase)        [8: Quality Ph2]    ← READY NOW (Track B)
[6: AI Guide]      ✅                   [5: Portal extras]  ← READY NOW (Track D)
[7: Map core]      ✅                   [7: Map polish]     ← partial dep on Track A
```

---

## Merge Gates & Checkpoints — Updated

### Gate 0→1: Architecture Migration Complete ✅
- [x] All routes wrapped in route groups
- [x] Components split into `ui/`, `motion/`, `layout/`
- [x] Folder structure matches target
- [x] `next build` passes
- [x] All existing pages render correctly

### Gate 1→2: Design + Content Foundation (partially met)
- [ ] Intensity mode store functional, persisted to localStorage
- [ ] Motion components read intensity mode
- [ ] `prefers-reduced-motion` wired through
- [x] MDX pipeline renders all sacred content types
- [x] Zod schemas validate all content frontmatter
- [x] next-intl configured with DE default
- [ ] shadcn/ui initialized, Button/Dialog/Input adopted

### Gate 2→3: Public Experience Complete
- [ ] Living Portal v2 with WebGL progressive enhancement
- [ ] At least 2 experiences (visual essays) published
- [ ] Panel navigation replaces hard route transitions
- [ ] Library page shows content by sacred type
- [ ] Performance budget met (LCP < 2.5s, CLS < 0.1)
- [ ] Playwright smoke tests pass for all public routes

### Gate 3→4: Portal Infrastructure ✅ (Supabase)
- [x] Auth working (Supabase Auth — needs OAuth credentials for E2E)
- [x] Database schema defined (SQL scripts in `database/`, Drizzle schema aligned)
- [x] Portal entry threshold experience functional
- [x] Dashboard renders with daily impulse
- [x] Journal CRUD with server actions
- [x] `(portal)` route group protected by middleware

### Gate 4→5: Intelligence Layer ✅ (core)
- [x] AI Guide streams responses in all four roles
- [x] Structured outputs validated by Zod
- [x] Guide has access to user journal context
- [x] Consciousness Map renders personal nodes
- [x] Nodes grow from journal content
- [x] Manual connections between nodes work
- [x] Node editing and edge labels (commit 85820f6)

---

## Conflict Zones & Coordination Rules

### Files touched by multiple agents

| File / Area | Agents | Resolution |
|---|---|---|
| `package.json` | All | Each agent adds only its deps. No removal of others' deps. |
| `src/app/layout.tsx` | 1, 2, 3 | Agent 1 restructures. Agent 2 adds IntensityProvider. Agent 3 adds IntlProvider. Sequential. |
| `tailwind.config.ts` | 1, 2 | Agent 2 owns design tokens. Agent 1 only moves if needed. |
| `globals.css` | 1, 2 | Agent 2 owns CSS custom properties. |
| `src/lib/utils.ts` | 1, 2, 3 | Append-only. No agent removes existing utils. |
| `src/lib/supabase/*` | 5, 6, 7 | Auth utilities shared. Changes must be backwards-compatible. |
| `src/lib/db/schema.ts` | 5, 7 | Schema is aligned with `database/` SQL (source of truth). |

### Rules

1. **No agent deletes another agent's output.** If a file needs restructuring after another agent worked on it, create a follow-up task.
2. **Each agent commits atomically.** Small, focused commits with clear messages. Never one giant commit.
3. **`next build` must pass after every commit.** If it breaks, fix before moving on.
4. **Each agent runs its own verification.** Build + lint + type-check at minimum.
5. **`STACK_DECISION.md` is canonical for backend architecture.** Any agent touching auth, database, or storage must align with this document.

---

## Agent Plan Files

| File | Agent | Status |
|---|---|---|
| [`01-architecture-migration.md`](./01-architecture-migration.md) | Architecture Migration | ✅ Complete |
| [`02-design-system-motion.md`](./02-design-system-motion.md) | Design System & Motion | ⏸ Ready to resume |
| [`03-content-system.md`](./03-content-system.md) | Content System | ✅ Complete |
| [`04-public-experience.md`](./04-public-experience.md) | Public Experience | 🔄 Phase 1 done |
| [`05-portal-auth.md`](./05-portal-auth.md) | Portal & Auth | ✅ Foundation done (⚠️ Supabase supersedes Neon/Auth.js specifics) |
| [`06-ai-guide.md`](./06-ai-guide.md) | AI Guide | ✅ Complete |
| [`07-consciousness-map.md`](./07-consciousness-map.md) | Consciousness Map | ✅ Core complete |
| [`08-quality-platform.md`](./08-quality-platform.md) | Quality Platform | 🔄 Phase 1 done |

### Canonical Backend References

| Document | Purpose |
|---|---|
| [`STACK_DECISION.md`](../../../STACK_DECISION.md) | Why Supabase, what changes, migration principles |
| [`MIGRATION_PLAN.md`](../../../MIGRATION_PLAN.md) | Step-by-step Supabase migration implementation |
| [`database/`](../../../database/) | SQL schema scripts (source of truth for DB structure) |

---

## Estimated Remaining Scope

| Track | Complexity | Key Deliverables | Risk Level |
|---|---|---|---|
| A: Design System (Agent 2) | High | Intensity stores, motion infra, shadcn/ui | Low |
| B: Quality Ph2 (Agent 8) | Medium | Expanded Playwright, perf budgets, a11y | Low |
| C: Public Experience Ph2 (Agent 4) | High | Panel nav, WebGL, visual essays | High (perf) |
| D: Portal extras | Medium | Onboarding, auto-save, practice history, soundscapes | Low |
| E: Map/Guide polish | Low | Intensity integration, mobile polish, E2E tests | Low |
