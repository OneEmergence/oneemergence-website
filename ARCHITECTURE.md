# OneEmergence — Technical Architecture

> Server-first. Content as system. Motion as hierarchy. Performance as discipline.

Implementation snapshot: **2026-09-06**. Stack and current behavior below are
checked against the repository. Explicitly marked targets are plans, not shipped
capabilities; cloud operation still needs the acceptance checks in
[docs/ROADMAP.md](./docs/ROADMAP.md).

---

## I. Stack

### Core Stack (Non-negotiable)

| Technology | Role | Why |
|---|---|---|
| **Next.js 16.2.1** (App Router) | Framework | Server-first rendering, route groups, server actions, streaming |
| **React 19** | UI | Server Components, Suspense, `use()`, concurrent features |
| **TypeScript** (strict) | Language | No `any`. Types are documentation. |
| **Tailwind CSS v4** | Styling | Design tokens via CSS custom properties, JIT, zero-runtime |
| **Bespoke UI components** | Component primitives | `src/components/ui/`; shadcn/ui is not adopted |
| **framer-motion v12** | Animation | Import from `framer-motion`, not `motion/react`; gate motion with `useMotionLevel` |
| **MDX** | Content | Content as components. Embeddable interactivity in prose. |
| **next-intl** | i18n | Server-first message loading, type-safe keys, ICU syntax |
| **Zod** | Validation | Schema-first validation at system boundaries. Shared between client and server. |
| **React state + FormData + Zod** | Forms | Existing forms call feature-owned server actions; React Hook Form is not installed |
| **Zustand** | Client state | Minimal, no boilerplate. Used for: intensity mode, audio state, UI preferences |
| **Sentry** | Monitoring | Errors, performance traces, session replay. Non-negotiable from day one. |
| **Playwright** | Testing | E2E tests for critical flows. Visual regression for sacred motion components. |

### Artistic Stack (Opt-in per component)

| Technology | Role | When to Use |
|---|---|---|
| **React Three Fiber** + **Three.js** (installed) | 3D / WebGL | Opt-in world-map experience at `/map/immersive`; `/map` remains the lightweight overview |
| **GSAP** (not installed) | Future complex animation | Deferred; existing scenes use framer-motion and CSS. Add only for a demonstrated requirement |
| **Lenis** | Smooth scroll | Already installed. Smooth, inertia-based scrolling with programmatic control |
| **Web Audio API** / **Tone.js** (Tone.js not installed) | Sound | World soundscape and audio controls; Tone.js remains a future option |
| **D3.js** | Data visualization | Force-directed graph for Consciousness Atlas, collective pulse heatmap |

### Intelligence Stack (Portal layer, v2+)

| Technology | Role | When to Use |
|---|---|---|
| **Vercel AI SDK** | AI streaming | AI Guide streaming responses, structured outputs with Zod schemas |
| **Supabase Auth** *(decided — supersedes Auth.js/Better Auth)* | Authentication | Portal Entry, session management, OAuth providers |
| **Supabase Postgres** *(decided — supersedes Neon)*, **Drizzle ORM** | Database | User data, journal entries, map nodes, practice history |
| **Supabase Realtime** or **Liveblocks** | Realtime | Collective Pulse, Live Ceremonies, shared space presence |
| **Stripe** | Payments | Membership tiers (v3) |

> **AG-UI supersedes "no chatbot frameworks" for the Guide (Phase 2).** The
> Guide adopts the AG-UI protocol (streaming events, generative UI, tool
> calls with human-in-the-loop confirmation) as its wire format — a
> conscious, documented exception to the "Consciously Avoided" row below.
> See [docs/plans/phase-2-agui-agent.md](./docs/plans/phase-2-agui-agent.md)
> and [docs/ROADMAP.md](./docs/ROADMAP.md) Phase 2 for the rationale.

### Consciously Avoided

| Technology | Why Not |
|---|---|
| **Redux / MobX** | Overkill. Zustand + server state covers everything. |
| **Styled Components / CSS-in-JS** | Runtime cost. Tailwind is zero-runtime. |
| **GraphQL** | Unnecessary abstraction. Server actions + direct DB queries are simpler. |
| **Firebase** | Vendor lock-in, not EU-friendly, poor DX for relational data. |
| **Electron / React Native** | PWA first. Native only if PWA proves insufficient. |
| **Heavy CMS platforms** | MDX + filesystem first. Headless CMS only when editorial team needs it. |
| **AI chatbot frameworks** | Build the Guide with Vercel AI SDK directly. No framework overhead. *(Superseded for the Guide's transport layer by the AG-UI decision, Phase 2 — see note above.)* |
| **Social features libraries** | No likes, follows, feeds. Build the minimal collective features from scratch. |

---

## II. Coding Paradigms

### Server-First, Client-Only-Where-Needed

- Default: **Server Components**. Every component is a Server Component unless it needs interactivity.
- Client Components are **islands** — small, focused, wrapped in their own files with `'use client'`.
- Never make a parent component client just because a child needs state. Extract the interactive part.
- Data fetching happens on the server. No `useEffect` for data loading.

### Server Actions for Mutations

```
// ✅ Do this
'use server'
export async function saveJournalEntry(data: JournalEntrySchema) { ... }

// ❌ Not this
app.post('/api/journal', handler)
```

Server actions own mutations. Route handlers are allowed for webhooks, auth
callbacks, streaming/AG-UI endpoints, and health checks. Current handlers are
`/api/guide` (JSON), `/api/health`, and `/auth/callback`; `/api/agent` is planned.

### Content as System, Not Scattered Pages

Content types (Teaching, Reflection, Practice, Transmission, Visual Essay, Sound Journey) are **first-class entities**:

- Each type has a Zod schema defining its frontmatter
- Each type has a dedicated renderer component
- Content lives in the filesystem as MDX, organized by type
- A unified content loader reads, validates, and indexes all content
- Tags, themes, difficulty, and duration are shared metadata across all types

### Motion Hierarchy as Discipline

Every animation must declare its level (Micro / Flow / Sacred / Event). Higher levels require:

- More intentional design review
- Reduced-motion fallbacks
- Performance profiling
- Intensity mode gating (Sacred and Event only render in Balanced/Immersive)

### Performance Budget

| Metric | Product target | Current measurement / gap |
|---|---|---|
| LCP | < 2.5s | Nightly Playwright: `/map` 2.5s; other sampled pages allow 3s locally / 5s in CI |
| CLS | < 0.1 | Nightly Playwright: `/map` 0.1; other sampled pages allow 0.25 |
| INP | < 200ms | One `/map` interaction probe; Sentry tracing when configured. Not a site-wide measured guarantee |
| JS bundle (initial) | < 150KB gzipped | Optional local bundle analyzer; no enforced size gate in CI |
| WebGL | Progressive enhancement | Core experience works without it |

WebGL, Three.js, and GSAP are **lazy-loaded** and **code-split**. They never block initial paint.

### Accessibility-First Mysticism

- WCAG AA baseline, aim for AAA on text contrast
- All motion respects `prefers-reduced-motion`
- Keyboard navigation for every interactive element
- Screen reader announcements for route transitions and dynamic content
- The Still intensity mode is a first-class experience, not a degraded fallback
- Focus management in panels, modals, and journey flows

---

## III. Information Architecture

### Target Route Structure

This tree includes future `paths`, `visions`, `rituals`, `field/*`, and
`legal/terms` routes, which do not exist yet. Additional current routes are
`/brand`, `/s` and `/s/[slug]`, `/map`, `/map/immersive` (its own `(immersive)`
layout), `/portal/pending`, `/portal/access`, and `/portal/account`.

```
app/
├── (marketing)/              # Public experience layer
│   ├── page.tsx              # Living Portal (homepage)
│   ├── manifesto/
│   ├── about/
│   ├── experiences/
│   ├── library/
│   ├── events/
│   ├── community/
│   ├── contact/
│   └── journal/[slug]/
├── (portal)/                 # Authenticated inner space
│   ├── portal/               # Threshold entry experience
│   ├── inner/
│   │   ├── page.tsx          # Dashboard — Inner State
│   │   ├── settings/         # Global + workspace profile personalization
│   │   ├── admin/            # Admin-only members and workspaces
│   │   ├── practice/
│   │   ├── journal/
│   │   ├── map/
│   │   ├── guide/            # AI Guide
│   │   ├── paths/
│   │   ├── visions/
│   │   └── rituals/
│   └── field/
│       ├── page.tsx          # Collective Field overview
│       ├── pulse/
│       ├── spaces/
│       ├── live/
│       ├── contributions/
│       └── intentions/
├── legal/
│   ├── imprint/
│   ├── privacy/
│   └── terms/
├── layout.tsx
├── globals.css
└── sitemap.ts
```

### Target Source Structure

Current additions: `features/world-map/` owns the public map and its opt-in
Three.js scene; `content/stories/` powers standalone shareable pages.
`features/paths/` is planned. Mutations have moved out of `lib/actions/`.

```
src/
├── app/                      # Routes (see above)
├── components/
│   ├── ui/                   # Primitives: Button, Input, Card, Dialog, etc.
│   ├── motion/               # Motion components: ScrollReveal, ParallaxLayer, BreathingOrb
│   ├── scene/                # WebGL scenes: LivingPortal, ConstellationView, SacredGeometry
│   ├── content/              # Content renderers: TeachingRenderer, PracticePlayer, VisualEssay
│   ├── layout/               # Navbar, Footer, PanelNavigation, IntensityToggle
│   └── sections/             # Page sections: Hero, ContentGrid, EventList
├── features/
│   ├── journal/              # Journal feature: entries, editor, graph, tags
│   ├── guide/                # AI Guide: roles, prompt system, response renderers
│   ├── rituals/              # Practice room: timer, soundscape, breathwork
│   ├── map/                  # Consciousness Map: nodes, connections, force layout
│   ├── auth/                 # Supabase Auth, account lifecycle, global profile
│   ├── workspaces/           # Membership access, global roles, workspace profiles
│   └── paths/                # Learning Pathways: progress, stages, flow
├── lib/
│   ├── env.ts                # Validated server environment; client public vars stay literal
│   ├── db/ supabase/ ai/     # Runtime infrastructure, feature actions own mutations
│   ├── schemas/              # Zod schemas: content types, forms, API responses
│   ├── content/              # Content loader, MDX pipeline, type validators
│   ├── analytics/            # Sentry setup, custom events, performance marks
│   ├── auth/                 # Auth config, session helpers, Next.js proxy
│   └── utils.ts              # cn(), formatDate, etc.
├── i18n/                     # next-intl messages: de.json, en.json
├── content/
│   ├── teachings/            # MDX: long-form concept articles
│   ├── reflections/          # MDX: short inquiry pieces with prompts
│   ├── practices/            # MDX + metadata: guided practice definitions
│   ├── transmissions/        # MDX: poetry, spoken word, atmospheric
│   ├── essays/               # MDX: scroll-driven visual narratives
│   ├── journeys/             # MDX + audio refs: sound journey definitions
│   └── journal/              # MDX: blog-style journal articles (existing)
├── hooks/                    # Custom React hooks
├── stores/                   # Zustand stores: intensity, audio, preferences
└── types/                    # Shared TypeScript types
```

---

## IV. Content Model

### Shared Metadata (all content types)

```typescript
const ContentMeta = z.object({
  title: z.string(),
  slug: z.string(),
  type: z.enum(['teaching', 'reflection', 'practice', 'transmission', 'visual-essay', 'sound-journey']),
  excerpt: z.string(),
  tags: z.array(z.string()),
  themes: z.array(z.string()),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  duration: z.number().optional(), // minutes
  published: z.boolean().default(false),
  date: z.string().datetime(),
  cover: z.string().optional(),
  locale: z.enum(['de', 'en']).default('de'),
})
```

### Type-Specific Extensions

| Type | Additional Fields |
|---|---|
| **Teaching** | `references: string[]`, `relatedConcepts: string[]` |
| **Reflection** | `prompts: string[]`, `journalSeed: string` |
| **Practice** | `audio: string`, `instructions: Step[]`, `posture: string` |
| **Transmission** | `medium: 'text' \| 'audio' \| 'visual'`, `attribution: string` |
| **Visual Essay** | `scenes: Scene[]`, `scrollLength: number` |
| **Sound Journey** | `audio: string`, `suggestedPosture: string`, `visualMode: string` |

---

## V. AI Guide Architecture

### Current System Design

```
User Input → Role Selection → System Prompt (role-specific) → Claude API (generateObject)
                                                                      ↓
                                                              Structured Output
                                                                      ↓
                                                    Response Renderer (cards, exercises, etc.)
```

`POST /api/guide` authenticates the user, checks workspace access and conversation
ownership, stores messages, and returns one complete JSON response. The model is
configured through `AI_MODEL` in `src/lib/env.ts`. There is no token stream,
AG-UI transport, tool execution, or request/cost quota yet. These are Phase 2
work; quotas and reliable retry/cancellation behavior precede broader AI access.

### Role System Prompts

Each role has a carefully crafted system prompt that defines:
- Voice and tone
- What it may and may not say
- Output format (Zod-validated structured responses)
- Current context: recent journal excerpts, practice history, global focus themes,
  and the selected workspace's display name. Map/Records retrieval is planned.

### Response Schema (target shape; runtime contract: `src/features/guide/schemas.ts`)

```typescript
const GuideResponse = z.object({
  text: z.string(),                    // Main response text
  role: z.enum(['seer', 'scientist', 'architect', 'mirror']),
  cards: z.array(PromptCard).optional(),
  exercise: Exercise.optional(),
  relatedJourneys: z.array(z.string()).optional(),
  soundActivation: z.string().optional(),
  visualActivation: z.enum(['breathing', 'mandala', 'constellation', 'void']).optional(),
  mapSuggestions: z.array(z.string()).optional(),
})
```

---

## VI. Monitoring & Testing

### Sentry (from day one)

- Error tracking with source maps
- Performance traces on critical routes (Living Portal, Journal, Guide)
- Session replay for debugging UX issues
- Custom breadcrumbs for journey flow and guide interactions
- Alert rules are an operational target; repository configuration alone does not
  verify that cloud alerts or dashboards are active.

### Playwright

- **Smoke tests**: every public route loads, no console errors
- **Current UI coverage**: public routes, auth forms/redirects, responsive layouts,
  intensity modes, and map interactions. Account creation through deletion and
  authenticated Journal/Guide flows still need end-to-end coverage.
- **RLS coverage**: disposable-project suites under `tests/rls/` cover owner and
  workspace isolation; they require explicit test credentials and are not part of
  the PR workflow's selected suites.
- **Accessibility**: axe-core integration in test suite
- **Content validation**: all MDX files parse without errors

### CI Pipeline

```
PR: lint → typecheck → build → Playwright (Chromium smoke, a11y, content)
Nightly: Playwright performance + mobile
Release tag / manual workflow: Docker build + GHCR publish
```

Formatting has a local check script but no PR gate. Lighthouse, a dedicated unit
runner, enforced bundle budgets, and verified preview deployments are targets,
not present CI stages. PR browser tests use placeholder services, so a green PR
does not establish cloud account or database readiness.

---

## VII. Migration Path from Current State

Status as of the Phase 0 audit (see [docs/ROADMAP.md](./docs/ROADMAP.md) for
the current phased plan) — this section records the foundation work and its
remaining acceptance gates.

### Immediate (before new feature work)

1. **Route groups** — ✅ done. Public pages live under `(marketing)`, portal under `(portal)`.
2. **Component reorganization** — ✅ done. `components/ui`, `motion/`, `layout/`, `scene/` split as planned.
3. **Content system** — ✅ done. MDX pipeline + Zod-validated content types under `src/content/`.
4. **Zustand store** — ✅ done. Intensity mode store wired to motion components.
5. **Sentry** — ✅ done (Phase 0). `instrumentation.ts` + `instrumentation-client.ts` (Next 16 convention).
6. **Playwright** — ✅ done. Smoke, a11y, content, perf, and mobile-responsive suites exist under `tests/`.

### Short-term (alongside MVP v1 features)

7. **shadcn/ui** — not adopted; forms/dialogs built as bespoke components instead.
8. **next-intl** — ✅ scaffolded, 🔄 activating. Public layouts pin German for static rendering; the dynamic portal resolves `NEXT_LOCALE` from a cookie. Several components use translations; remaining copy migrates incrementally. Public bilingual URLs are a future decision.
9. **Panel navigation** — not started.
10. **Feature folders** — ✅ live. `src/features/{auth,workspaces,journal,guide,rituals,map,world-map}`; `records` lands in Phase 3.
11. **Content folders** — ✅ done. `src/content/` organized by sacred content type.

### Before v2 (Portal layer)

12. **Auth & workspace access** — 🔄 in progress. Supabase Auth proves identity; active workspace membership authorizes the private app. Global `user`, `agent`, `superuser`, and `admin` roles provide capability tiers without conflating them with membership status.
13. **Database** — ✅ governed. **`supabase/schemas` is the declarative desired state**, **`supabase/migrations` is the only append-only deployment channel**, and **`src/lib/db/schema.ts` is the type-safe Drizzle mirror** used by the app. The old hand-written drafts remain archived in `docs/archive/database/`.
14. **Server actions** — ✅ feature-owned. `src/lib/actions/` no longer exists. Continue normalizing public feature entrypoints when touching modules.
15. **(portal) route group** — ✅ done. Authenticated layout + Next.js proxy protection live; journal/map/guide/practice ship inside it.

---

## VIII. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| SSR vs SSG | **Static public pages + dynamic portal** | Public layouts pin a locale for prerendering; authenticated portal reads happen per request. No blanket ISR policy is configured. |
| State management | **Server state + Zustand islands** | No global client store. Server is the source of truth. Zustand only for UI preferences. |
| Content pipeline | **MDX on filesystem** | No CMS dependency until editorial team exists. MDX gives component power. |
| Auth provider | **Supabase Auth** (supersedes the original Auth.js/Better Auth plan) | Ships together with Supabase Postgres/Storage; EU-region hosting available; see ROADMAP Phase 1. |
| Authorization | **Global capability role + per-workspace membership state** | Keeps account type (`user`, non-human `agent`, `superuser`, `admin`) separate from approval (`pending`, `active`, `suspended`). |
| Workspace data boundary | **Personal records remain user-owned; workspace sharing is explicit** | Joining a workspace must not silently expose journals, practices, maps, or guide conversations to its admins. |
| AI integration | **Vercel AI SDK + Claude** | Structured JSON today; streaming and AG-UI are Phase 2 targets. Current Postgres context/persistence runs server-side. |
| Realtime | **Deferred to v3** | Don't build infrastructure for collective features until personal layer is validated. |
| Testing strategy | **E2E first** | Sacred motion and journey flows can't be unit tested meaningfully. Playwright is primary. |
| Deployment | **Vercel path + Docker packaging** | Dockerfile, compose, GHCR workflow and health endpoint exist. Standalone output is opt-in via `NEXT_OUTPUT=standalone`; release readiness still requires an actual image/runtime check. |

---

*This is the canonical technical architecture for OneEmergence. For product vision, see [VISION.md](./VISION.md). For agent instructions, see [AGENTS.md](./AGENTS.md). For the current phased plan, see [docs/ROADMAP.md](./docs/ROADMAP.md). For the historical tech stack evaluation and Supabase migration recommendation (archived), see [docs/archive/TECH_STACK_RECOMMENDATION.md](./docs/archive/TECH_STACK_RECOMMENDATION.md).*
