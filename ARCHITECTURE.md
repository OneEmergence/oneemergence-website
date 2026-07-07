# OneEmergence — Technical Architecture

> Server-first. Content as system. Motion as hierarchy. Performance as discipline.

---

## I. Stack

### Core Stack (Non-negotiable)

| Technology | Role | Why |
|---|---|---|
| **Next.js 15** (App Router) | Framework | Server-first rendering, route groups, server actions, streaming |
| **React 19** | UI | Server Components, Suspense, `use()`, concurrent features |
| **TypeScript** (strict) | Language | No `any`. Types are documentation. |
| **Tailwind CSS v4** | Styling | Design tokens via CSS custom properties, JIT, zero-runtime |
| **shadcn/ui** | Component primitives | Accessible, composable, ownable — not a dependency but copied source |
| **Motion** (Framer Motion) | Animation | Layout animations, gesture support, `AnimatePresence`, reduced-motion |
| **MDX** | Content | Content as components. Embeddable interactivity in prose. |
| **next-intl** | i18n | Server-first message loading, type-safe keys, ICU syntax |
| **Zod** | Validation | Schema-first validation at system boundaries. Shared between client and server. |
| **React Hook Form** | Forms | Performant, uncontrolled by default, Zod resolver integration |
| **Zustand** | Client state | Minimal, no boilerplate. Used for: intensity mode, audio state, UI preferences |
| **Sentry** | Monitoring | Errors, performance traces, session replay. Non-negotiable from day one. |
| **Playwright** | Testing | E2E tests for critical flows. Visual regression for sacred motion components. |

### Artistic Stack (Opt-in per component)

| Technology | Role | When to Use |
|---|---|---|
| **React Three Fiber** + **Three.js** | 3D / WebGL | Living Portal, Consciousness Atlas, sacred geometry, particle fields |
| **GSAP** | Complex animation | Timeline orchestration beyond Motion's capabilities, ScrollTrigger for scroll-driven scenes |
| **Lenis** | Smooth scroll | Already installed. Smooth, inertia-based scrolling with programmatic control |
| **Tone.js** / Web Audio API | Sound | Ambient soundscapes, audio-reactive visuals, Sound Journey content type |
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

API routes only for webhooks and third-party integrations. Everything else: server actions.

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

| Metric | Target | Enforcement |
|---|---|---|
| LCP | < 2.5s | Lighthouse CI in PR checks |
| CLS | < 0.1 | Playwright visual regression |
| INP | < 200ms | Sentry performance monitoring |
| JS bundle (initial) | < 150KB gzipped | Bundle analyzer in CI |
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

### Route Structure

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

### Source Structure

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
│   └── paths/                # Learning Pathways: progress, stages, flow
├── lib/
│   ├── actions/              # Server actions: saveEntry, updateMap, submitContact
│   ├── schemas/              # Zod schemas: content types, forms, API responses
│   ├── content/              # Content loader, MDX pipeline, type validators
│   ├── analytics/            # Sentry setup, custom events, performance marks
│   ├── auth/                 # Auth config, session helpers, middleware
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

### System Design

```
User Input → Role Selection → System Prompt (role-specific) → Claude API (streaming)
                                                                      ↓
                                                              Structured Output
                                                                      ↓
                                                    Response Renderer (cards, exercises, etc.)
```

### Role System Prompts

Each role has a carefully crafted system prompt that defines:
- Voice and tone
- What it may and may not say
- Output format (Zod-validated structured responses)
- Context injection: recent journal entries, map nodes, practice history

### Response Schema

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
- Alert rules: error spike, LCP regression, Guide API failures

### Playwright

- **Smoke tests**: every public route loads, no console errors
- **Critical flows**: Portal Entry → Dashboard → Journal entry → Save
- **Visual regression**: Living Portal, sacred motion components, intensity mode switching
- **Accessibility**: axe-core integration in test suite
- **Content validation**: all MDX files parse without errors

### CI Pipeline

```
lint → typecheck → unit tests → build → playwright → lighthouse → deploy preview
```

---

## VII. Migration Path from Current State

Status as of the Phase 0 audit (see [docs/ROADMAP.md](./docs/ROADMAP.md) for
the current phased plan — this section is now a historical checklist, kept
for traceability.

### Immediate (before new feature work)

1. **Route groups** — ✅ done. Public pages live under `(marketing)`, portal under `(portal)`.
2. **Component reorganization** — ✅ done. `components/ui`, `motion/`, `layout/`, `scene/` split as planned.
3. **Content system** — ✅ done. MDX pipeline + Zod-validated content types under `src/content/`.
4. **Zustand store** — ✅ done. Intensity mode store wired to motion components.
5. **Sentry** — ✅ done (Phase 0). `instrumentation.ts` + `instrumentation-client.ts` (Next 16 convention).
6. **Playwright** — ✅ done. Smoke, a11y, content, perf, and mobile-responsive suites exist under `tests/`.

### Short-term (alongside MVP v1 features)

7. **shadcn/ui** — not adopted; forms/dialogs built as bespoke components instead.
8. **next-intl** — ✅ scaffolded, 🔄 activating. Cookie-based locale resolution live in `request.ts`; Navbar/Footer migrated to `useTranslations`; remaining pages migrate incrementally (Phase 0 step 7 in ROADMAP).
9. **Panel navigation** — not started.
10. **Feature folders** — ✅ live. `src/features/{journal,guide,rituals,map}`; `auth` and `records` land in Phases 1 and 3.
11. **Content folders** — ✅ done. `src/content/` organized by sacred content type.

### Before v2 (Portal layer)

12. **Auth** — 🔄 in progress. Supabase Auth (not Auth.js/Better Auth — superseded decision), see ROADMAP Phase 1.
13. **Database** — ✅ done. Supabase Postgres provisioned; **`supabase/migrations` is the single migration channel** (platform SQL: extensions, `handle_new_user` trigger, RLS) and **`src/lib/db/schema.ts` (Drizzle) is the canonical shape mirror** for app tables — `drizzle-kit generate` produces the app-table migrations that land alongside it. The old hand-written `database/*.sql` drafts are archived in `docs/archive/database/`.
14. **Server actions** — 🔄 in progress. Feature modules own their `actions.ts`; `src/lib/actions/` is being dissolved into features per ROADMAP §II.
15. **(portal) route group** — ✅ done. Authenticated layout + middleware protection live; journal/map/guide/practice ship inside it.

---

## VIII. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| SSR vs SSG | **SSR + ISR** | Dynamic portal content needs SSR. Public pages use ISR for performance. |
| State management | **Server state + Zustand islands** | No global client store. Server is the source of truth. Zustand only for UI preferences. |
| Content pipeline | **MDX on filesystem** | No CMS dependency until editorial team exists. MDX gives component power. |
| Auth provider | **Supabase Auth** (supersedes the original Auth.js/Better Auth plan) | Ships together with Supabase Postgres/Storage; EU-region hosting available; see ROADMAP Phase 1. |
| AI integration | **Vercel AI SDK + Claude** | Streaming, structured outputs, edge-compatible. No chatbot framework. |
| Realtime | **Deferred to v3** | Don't build infrastructure for collective features until personal layer is validated. |
| Testing strategy | **E2E first** | Sacred motion and journey flows can't be unit tested meaningfully. Playwright is primary. |
| Deployment | **Vercel (MVP)** → **EU self-host (later)** | Fast iteration now. Data sovereignty when user data exists. |

---

*This is the canonical technical architecture for OneEmergence. For product vision, see [VISION.md](./VISION.md). For agent instructions, see [AGENTS.md](./AGENTS.md). For the current phased plan, see [docs/ROADMAP.md](./docs/ROADMAP.md). For the historical tech stack evaluation and Supabase migration recommendation (archived), see [docs/archive/TECH_STACK_RECOMMENDATION.md](./docs/archive/TECH_STACK_RECOMMENDATION.md).*
