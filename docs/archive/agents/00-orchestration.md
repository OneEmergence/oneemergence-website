# OneEmergence — Agent Orchestration Plan

> Master coordination document for parallel agent workstreams.
> Updated 2026-04-01 — truth-sync pass (Agent 2 complete, Agent 5 UX extras, Agent 8 residual pass).

---

## Current Status Summary

The project has advanced well beyond the original phased plan. All foundation and infrastructure agents are complete, the Supabase migration has consolidated the backend stack, and the remaining work is primarily in Public Experience polish (visual essays, panel nav, WebGL) and final portal features (soundscape player, reflection graph). Design System (Agent 2) and Quality Platform (Agent 8) residual passes are done. Portal UX extras (onboarding, autosave, practice history) landed 2026-03-31.

---

## Workstream Overview

| # | Agent | Mission | Status | Notes |
|---|-------|---------|--------|-------|
| 1 | **Architecture Migration** | Restructure repo to target folder layout | ✅ Complete | Route groups, component split, features/ scaffold |
| 2 | **Design System & Motion** | UI primitives, intensity modes, motion infrastructure | ✅ Complete | Phases 1-3 done (intensity stores, motion upgrades, typography, cursor gating, BreathingOrb, ParallaxLayer). shadcn/ui deferred (Tailwind v4 compat). |
| 3 | **Content System** | MDX pipeline, Zod schemas, sacred content types, i18n | ✅ Complete | MDX pipeline, Zod schemas, content renderers, next-intl configured |
| 4 | **Public Experience** | Living Portal v2, Experiences, panel nav | 🔄 Phase 2 done | Living Portal v2, Experiences, Library page + detail routes (`/library/[type]/[slug]`) all landed. Remaining: panel nav, visual essays, WebGL progressive enhancement, perf audit. |
| 5 | **Portal & Auth** | Auth, DB, dashboard, journal, ritual room | ✅ UX extras complete | **Stack migrated to Supabase** (commit f3447e4). Auth, middleware, portal, dashboard, journal CRUD, practice room built. UX extras landed (2026-03-31): onboarding flow, journal autosave, practice history. Deferred: DB provisioning, OAuth credentials, reflection graph, soundscape player. See `STACK_DECISION.md`. |
| 6 | **AI Guide** | Vercel AI SDK, roles, structured responses | ✅ Complete | Four-role consciousness companion, structured responses, chat UI |
| 7 | **Consciousness Map** | Graph model, D3/SVG, node interactions | ✅ Core complete | Force graph, CRUD, theme extraction, node editing, edge labels. Remaining: intensity mode integration, mobile polish, canvas fallback, E2E tests. |
| 8 | **Quality Platform** | Sentry, Playwright, CI pipeline, perf budgets | ✅ Residual pass complete | Sentry, Playwright (14 routes), CI pipeline, a11y, perf budgets, bundle analyzer, custom breadcrumbs, mobile responsive tests. Deferred: tighten perf thresholds, visual regression, portal tests in CI. |

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

### Phase 1 — Design + Content Foundation ✅

- **Agent 3 (Content System)** ✅ Complete
- **Agent 2 (Design System)** ✅ Complete (Phases 1-3; shadcn/ui deferred)

### Phase 2 — Public Experience (Phase 2 done, polish remaining)

- **Agent 4** Phases 1-2 complete. Library detail routes landed. Agent 2 dependency resolved. Remaining: panel nav, visual essays, WebGL, perf audit.

### Phase 3 — Portal & Auth ✅ Foundation complete

- **Agent 5** built with Neon/Auth.js, then **migrated to Supabase**.
- Portal entry, dashboard, journal CRUD, practice room all functional.
- UX extras landed (2026-03-31): onboarding flow, journal autosave, practice history.
- Remaining: DB provisioning + OAuth credentials (human task), reflection graph, soundscape player.

### Phase 4 — Intelligence ✅ Core complete

- **Agent 6 (AI Guide)** ✅ Complete
- **Agent 7 (Consciousness Map)** ✅ Core complete — node editing + edge labels added (commit 85820f6)

---

## What Remains — Next Parallelizable Tracks

### Track A: Design System & Motion (Agent 2) — ✅ COMPLETE

All phases done (intensity stores, motion upgrades, typography, cursor gating, BreathingOrb, ParallaxLayer). Only shadcn/ui deferred (Tailwind v4 compat).

### Track B: Quality Hardening (Agent 8) — ✅ RESIDUAL PASS COMPLETE

Sentry, Playwright (14 routes), CI pipeline, a11y, perf budgets, bundle analyzer, custom breadcrumbs, mobile responsive tests all done. Remaining:
- Tighten performance thresholds (LCP < 2.5s once WebGL lazy-loading lands)
- Portal redirect tests in CI (needs Supabase secrets)
- Touch target hard enforcement (after design system finalizes)
- Visual regression testing (after design stabilizes)

### Track C: Public Experience Polish (Agent 4) — UNBLOCKED

Agent 2 dependency resolved. Library detail routes landed. Remaining:
- Panel navigation (replace hard route transitions)
- WebGL progressive enhancement (three.js/R3F)
- Visual essays (2-3 actual MDX content files)
- Performance optimization pass (formal Lighthouse audit)

### Track D: Portal Feature Completion — MOSTLY DONE

Completed (2026-03-31):
- ~~First-time onboarding flow UI~~ ✅
- ~~Journal auto-save (debounced)~~ ✅
- ~~Practice history page~~ ✅

Still remaining:
- Soundscape player component (needs audio files)
- Reflection graph (deferred to v2, needs data accumulation)

Items requiring live Supabase project:
- E2E auth flow testing
- RLS policy verification
- OAuth credential configuration

### Track E: Map & Guide Remaining Items — UNBLOCKED

- Map: intensity mode integration (intensity store now exists from Track A)
- Map: mobile interaction polish, canvas rendering fallback for 100+ nodes
- Map: Playwright E2E tests
- Map: edge label UI, node editing context menu
- Guide: E2E testing with live Supabase auth

**Recommended parallel execution:** Tracks C + E can run now. Track D has minimal remaining scope (soundscape player).

---

## Dependency Graph — Updated

```
COMPLETED                               REMAINING
─────────                               ─────────

[1: Architecture]  ✅                   [4: Public Experience polish]  ← panel nav, WebGL, visual essays (Track C)
[2: Design System] ✅                   [5: Portal extras]  ← soundscape player, reflection graph (Track D)
[3: Content]       ✅                   [7: Map polish]     ← intensity integration, mobile, edge UI (Track E)
[5: Portal Auth]   ✅ (+ UX extras)    [8: Quality deferred] ← tighten perf thresholds, visual regression
[6: AI Guide]      ✅
[7: Map core]      ✅
[8: Quality]       ✅ (residual pass)
```

---

## Merge Gates & Checkpoints — Updated

### Gate 0→1: Architecture Migration Complete ✅
- [x] All routes wrapped in route groups
- [x] Components split into `ui/`, `motion/`, `layout/`
- [x] Folder structure matches target
- [x] `next build` passes
- [x] All existing pages render correctly

### Gate 1→2: Design + Content Foundation ✅ (shadcn/ui deferred)
- [x] Intensity mode store functional, persisted to localStorage
- [x] Motion components read intensity mode
- [x] `prefers-reduced-motion` wired through
- [x] MDX pipeline renders all sacred content types
- [x] Zod schemas validate all content frontmatter
- [x] next-intl configured with DE default
- [ ] shadcn/ui initialized, Button/Dialog/Input adopted (deferred — Tailwind v4 compat)

### Gate 2→3: Public Experience Complete
- [ ] Living Portal v2 with WebGL progressive enhancement
- [ ] At least 2 experiences (visual essays) published
- [ ] Panel navigation replaces hard route transitions
- [x] Library page shows content by sacred type (+ detail routes `/library/[type]/[slug]`)
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
| [`02-design-system-motion.md`](./02-design-system-motion.md) | Design System & Motion | ✅ Complete (shadcn/ui deferred) |
| [`03-content-system.md`](./03-content-system.md) | Content System | ✅ Complete |
| [`04-public-experience.md`](./04-public-experience.md) | Public Experience | 🔄 Phase 2 done, polish remaining |
| [`05-portal-auth.md`](./05-portal-auth.md) | Portal & Auth | ✅ UX extras complete (⚠️ Supabase supersedes Neon/Auth.js specifics) |
| [`06-ai-guide.md`](./06-ai-guide.md) | AI Guide | ✅ Complete |
| [`07-consciousness-map.md`](./07-consciousness-map.md) | Consciousness Map | ✅ Core complete |
| [`08-quality-platform.md`](./08-quality-platform.md) | Quality Platform | ✅ Residual pass complete |

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
| A: Design System (Agent 2) | ✅ Done | — | — |
| B: Quality (Agent 8) | ✅ Done | Deferred: tighten perf thresholds, visual regression | Low |
| C: Public Experience polish (Agent 4) | High | Panel nav, WebGL, visual essays, perf audit | High (perf) |
| D: Portal extras | Low | Soundscape player, reflection graph (v2) | Low |
| E: Map/Guide polish | Low | Intensity integration, mobile polish, edge UI, E2E tests | Low |
