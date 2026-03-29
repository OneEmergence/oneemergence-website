# OneEmergence — Agent Orchestration Plan

> Master coordination document for parallel agent workstreams.

---

## Workstream Overview

| # | Agent | Mission | Can Start Immediately | Blocked By |
|---|-------|---------|----------------------|------------|
| 1 | **Architecture Migration** | Restructure repo to target folder layout | Yes | — |
| 2 | **Design System & Motion** | UI primitives, intensity modes, motion infrastructure | Yes (partially) | Agent 1 for `motion/` folder |
| 3 | **Content System** | MDX pipeline, Zod schemas, sacred content types, i18n | Yes (partially) | Agent 1 for `content/` folder reorg |
| 4 | **Public Experience** | Living Portal v2, Experiences, panel nav | No | Agents 1, 2, 3 |
| 5 | **Portal & Auth** | Auth, DB, dashboard, journal, ritual room | No | Agents 1, 2, 3, 4 (public layer stable) |
| 6 | **AI Guide** | Vercel AI SDK, roles, structured responses | No | Agent 5 (auth + DB) |
| 7 | **Consciousness Map** | Graph model, D3/R3F, node interactions | No | Agents 5, 6 (journal + guide data) |
| 8 | **Quality Platform** | Sentry, Playwright, CI pipeline, perf budgets | Yes | — |

---

## Execution Phases

### Phase 0 — Immediate Parallel Start

**Agents 1, 8** can begin right now with zero dependencies.

- **Agent 1 (Architecture Migration)** restructures folders and routes
- **Agent 8 (Quality Platform)** installs Sentry, sets up Playwright, configures CI

These two work on orthogonal concerns and will not conflict.

**Agent 2 (Design System)** can start on Zustand stores, intensity mode logic, and shadcn/ui initialization in parallel — but must coordinate with Agent 1 on when `components/motion/` exists.

### Phase 1 — Foundation Complete (Gate: Agent 1 done)

Once Agent 1 finishes, the repo has:
- `(marketing)` route group
- `components/{ui, motion, layout, sections}` split
- `lib/schemas/`, `lib/actions/`, `stores/` folders
- `features/` structure ready

Now **Agents 2, 3** can fully execute:
- Agent 2 completes motion infrastructure, intensity mode wiring
- Agent 3 builds MDX pipeline, content schemas, i18n setup

**Agent 8** continues independently (Playwright tests may need updating for new routes).

### Phase 2 — Public Layer (Gate: Agents 2 + 3 done)

**Agent 4 (Public Experience)** builds on top of:
- Motion components from Agent 2
- Content system from Agent 3
- UI primitives from Agent 2

Delivers: Living Portal v2, Experiences section, panel navigation, library with sacred content.

### Phase 3 — Portal Layer (Gate: Agent 4 stable)

**Agent 5 (Portal & Auth)** builds:
- Auth system (Auth.js or Better Auth)
- Database schema (Postgres)
- Inner Space dashboard, journal, ritual room
- Server actions in `lib/actions/`

### Phase 4 — Intelligence (Gate: Agent 5 done)

**Agents 6, 7** can run in parallel:
- Agent 6 (AI Guide) needs auth + DB for user context
- Agent 7 (Consciousness Map) needs journal data + guide integration

These two are mostly independent of each other but both depend on portal infrastructure.

---

## Dependency Graph

```
Phase 0:  [1: Architecture]  [8: Quality]
              |                   |
Phase 1:  [2: Design System] [3: Content]  [8 continues]
              |                   |
Phase 2:     [4: Public Experience]
                     |
Phase 3:     [5: Portal & Auth]
                  /         \
Phase 4:  [6: AI Guide]  [7: Consciousness Map]
```

---

## Merge Gates & Checkpoints

### Gate 0→1: Architecture Migration Complete
- [ ] All routes wrapped in `(marketing)` route group
- [ ] Components split into `ui/`, `motion/`, `layout/`
- [ ] Folder structure matches ARCHITECTURE.md Section III
- [ ] `next build` passes
- [ ] All existing pages render correctly
- [ ] No regressions in visual output

### Gate 1→2: Design + Content Foundation
- [ ] Intensity mode store functional, persisted to localStorage
- [ ] Motion components read intensity mode
- [ ] `prefers-reduced-motion` wired through
- [ ] MDX pipeline renders all sacred content types
- [ ] Zod schemas validate all content frontmatter
- [ ] next-intl configured with DE default
- [ ] shadcn/ui initialized, Button/Dialog/Input adopted

### Gate 2→3: Public Experience Complete
- [ ] Living Portal v2 with WebGL progressive enhancement
- [ ] At least 2 experiences (visual essays) published
- [ ] Panel navigation replaces hard route transitions
- [ ] Library page shows content by sacred type
- [ ] Performance budget met (LCP < 2.5s, CLS < 0.1)
- [ ] Playwright smoke tests pass for all public routes

### Gate 3→4: Portal Infrastructure
- [ ] Auth working with at least one OAuth provider
- [ ] Database provisioned with user + journal schema
- [ ] Portal entry threshold experience functional
- [ ] Dashboard renders with daily impulse
- [ ] Journal CRUD with server actions
- [ ] `(portal)` route group protected by middleware

### Gate 4→5: Intelligence Layer
- [ ] AI Guide streams responses in all four roles
- [ ] Structured outputs validated by Zod
- [ ] Guide has access to user journal context
- [ ] Consciousness Map renders personal nodes
- [ ] Nodes grow from journal content
- [ ] Manual connections between nodes work

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

### Rules

1. **No agent deletes another agent's output.** If a file needs restructuring after another agent worked on it, create a follow-up task.
2. **Each agent commits atomically.** Small, focused commits with clear messages. Never one giant commit.
3. **`next build` must pass after every commit.** If it breaks, fix before moving on.
4. **Each agent runs its own verification.** Build + lint + type-check at minimum.

---

## Agent Plan Files

| File | Agent |
|---|---|
| [`01-architecture-migration.md`](./01-architecture-migration.md) | Architecture Migration |
| [`02-design-system-motion.md`](./02-design-system-motion.md) | Design System & Motion |
| [`03-content-system.md`](./03-content-system.md) | Content System |
| [`04-public-experience.md`](./04-public-experience.md) | Public Experience |
| [`05-portal-auth.md`](./05-portal-auth.md) | Portal & Auth |
| [`06-ai-guide.md`](./06-ai-guide.md) | AI Guide |
| [`07-consciousness-map.md`](./07-consciousness-map.md) | Consciousness Map |
| [`08-quality-platform.md`](./08-quality-platform.md) | Quality Platform |

---

## Estimated Scope

| Agent | Complexity | Files Created/Modified | Risk Level |
|---|---|---|---|
| 1 Architecture | Medium | ~30 moves, ~10 edits | Medium (breaking imports) |
| 2 Design System | High | ~25 new, ~15 edits | Low |
| 3 Content System | High | ~20 new, ~10 edits | Medium (MDX pipeline) |
| 4 Public Experience | Very High | ~30 new, ~15 edits | High (WebGL, perf) |
| 5 Portal & Auth | Very High | ~40 new, ~10 edits | High (auth, DB) |
| 6 AI Guide | High | ~20 new, ~5 edits | Medium (prompt eng) |
| 7 Consciousness Map | High | ~15 new, ~5 edits | High (D3/R3F complexity) |
| 8 Quality Platform | Medium | ~15 new, ~5 edits | Low |
