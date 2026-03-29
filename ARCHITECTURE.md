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
| **Auth.js** or **Better Auth** | Authentication | Portal Entry, session management, OAuth providers |
| **Postgres** (Neon or Supabase) | Database | User data, journal entries, map nodes, practice history |
| **Supabase Realtime** or **Liveblocks** | Realtime | Collective Pulse, Live Ceremonies, shared space presence |
| **Stripe** | Payments | Membership tiers (v3) |

### Consciously Avoided

| Technology | Why Not |
|---|---|
| **Redux / MobX** | Overkill. Zustand + server state covers everything. |
| **Styled Components / CSS-in-JS** | Runtime cost. Tailwind is zero-runtime. |
| **GraphQL** | Unnecessary abstraction. Server actions + direct DB queries are simpler. |
| **Firebase** | Vendor lock-in, not EU-friendly, poor DX for relational data. |
| **Electron / React Native** | PWA first. Native only if PWA proves insufficient. |
| **Heavy CMS platforms** | MDX + filesystem first. Headless CMS only when editorial team needs it. |
| **AI chatbot frameworks** | Build the Guide with Vercel AI SDK directly. No framework overhead. |
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

The current codebase (Phase 1 complete) needs these structural changes to support the architecture above:

### Immediate (before new feature work)

1. **Route groups**: Wrap existing public pages in `(marketing)` route group
2. **Component reorganization**: Split `components/ui` into `ui/`, `motion/`, `layout/` (move ScrollReveal, ParallaxImage to `motion/`)
3. **Content system**: Replace raw markdown loader with MDX pipeline + Zod validation
4. **Zustand store**: Add intensity mode store, wire to existing motion components
5. **Sentry**: Install and configure — errors, traces, source maps
6. **Playwright**: Basic smoke tests for all existing routes

### Short-term (alongside MVP v1 features)

7. **shadcn/ui**: Initialize and adopt for form elements, dialogs, navigation
8. **next-intl**: Set up with DE as default, structure for EN
9. **Panel navigation**: Replace hard route transitions with slide/panel patterns
10. **Feature folders**: Create `features/` structure as features are built
11. **Content folders**: Reorganize `content/` by sacred content type

### Before v2 (Portal layer)

12. **Auth**: Install and configure Auth.js or Better Auth
13. **Database**: Provision Postgres, set up schema for users + journal + map
14. **Server actions**: Create `lib/actions/` for all mutations
15. **(portal) route group**: Add authenticated layout with middleware protection

---

## VIII. Key Architectural Decisions

| Decision | Choice | Rationale |
|---|---|---|
| SSR vs SSG | **SSR + ISR** | Dynamic portal content needs SSR. Public pages use ISR for performance. |
| State management | **Server state + Zustand islands** | No global client store. Server is the source of truth. Zustand only for UI preferences. |
| Content pipeline | **MDX on filesystem** | No CMS dependency until editorial team exists. MDX gives component power. |
| Auth provider | **Auth.js or Better Auth** | Self-hosted, EU-compatible, not a SaaS dependency. |
| AI integration | **Vercel AI SDK + Claude** | Streaming, structured outputs, edge-compatible. No chatbot framework. |
| Realtime | **Deferred to v3** | Don't build infrastructure for collective features until personal layer is validated. |
| Testing strategy | **E2E first** | Sacred motion and journey flows can't be unit tested meaningfully. Playwright is primary. |
| Deployment | **Vercel (MVP)** → **EU self-host (later)** | Fast iteration now. Data sovereignty when user data exists. |

---

*This is the canonical technical architecture for OneEmergence. For product vision, see [VISION.md](./VISION.md). For agent instructions, see [CLAUDE.md](./CLAUDE.md). For the tech stack evaluation and Supabase migration recommendation, see [TECH_STACK_RECOMMENDATION.md](./TECH_STACK_RECOMMENDATION.md).*
