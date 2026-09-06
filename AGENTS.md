# Agent Instructions

## Projekt: OneEmergence

Dieses Dokument ist der Einstiegspunkt für Claude (und andere Agents), um an OneEmergence zu arbeiten. `.claude/CLAUDE.md` verweist hierher — dieses Dokument ist die Single Source of Truth für Agent-Instruktionen.

### Stack
- Next.js 16 (App Router, Server Components first)
- React 19
- TypeScript (strict, no `any`)
- Tailwind CSS v4 + CSS custom properties
- framer-motion v12 — importiert aus `"framer-motion"`, **nicht** aus `"motion/react"` (das Paket `motion` ist nicht installiert; der Import löst nicht auf, auch wenn das der aktuelle Name der Library ist)
- clsx, tailwind-merge, lucide-react
- Zustand (client state islands), Zod (validation)
- MDX for content, next-intl for i18n (activating incrementally, see below)
- Supabase (Postgres, Auth, Storage) + Drizzle ORM, Vercel AI SDK
- Sentry (monitoring), Playwright (E2E tests)
- React Three Fiber / Three.js are installed for the public world map; lazy-load WebGL and retain a usable fallback. GSAP and Tone.js remain uninstalled.

### Planning Documents
- **`docs/ROADMAP.md`** — current phase, findings, decisions log. Read this first for "what's next."
- **`VISION.md`** — Product vision, UX philosophy, content system, AI Guide, product staging
- **`ARCHITECTURE.md`** — Technical stack, coding paradigms, folder structure, migration path
- Always read `docs/ROADMAP.md` + the relevant planning doc before starting significant feature work.
- **`docs/ENGINEERING.md`** — local startup, verification tiers, CI coverage and agent handoff. Use executable code/config for current behavior; older plans may describe intended rather than shipped features.

### Reproducible Agent Workflow
- Inspect `git status --short` before editing and preserve unrelated work. Assign disjoint file ownership when agents work in parallel.
- Use the pinned Node/pnpm setup and existing scripts; run the smallest relevant check before broadening to lint, typecheck, build and affected browser flows.
- Coordinate build/dev/test processes: Playwright may reuse port 3000 locally. Record whether tests exercised a development or production server; never treat reuse as proof of a production build.
- Handoffs record the user-visible change, exact commands and results (including skipped tests), remaining limitations and the next concrete task. A passing public smoke run does not verify authenticated cloud flows, RLS, AI providers or deployment.

### Design System & Theme
- Farben sind in `src/app/globals.css` über `@theme` als Design-Tokens konfiguriert (Tailwind v4, CSS-first).
- Primärfarben:
  - Background: `--background` (Deep Space / Pure Light)
  - Foreground: `--foreground`
  - Brand: `oe-deep-space`, `oe-aurora-violet`, `oe-solar-gold`, `oe-spirit-cyan`, `oe-pure-light`
- Typografie:
  - Headers: Cormorant (serif)
  - Body: Inter (sans-serif)
- Darkness is space, not merely a dark theme. Light emerges intentionally from void.
- Style guide live at `/brand` — the "three depths" (cosmic → solarpunk → warm) design language applies across the site.

### Dateistruktur (current)
- `src/app/(marketing)/`: public routes (home, manifesto, about, experiences, library, events, community, contact, journal)
- `src/app/(portal)/`: authenticated routes (portal entry, inner/journal, inner/map, inner/guide, inner/practice)
- `src/app/(immersive)/`: public full-screen world map under `/map/immersive`
- `src/app/api/`: Guide JSON endpoint and health probe; streaming/AG-UI is planned, auth callbacks live in `src/app/auth/`.
- `src/app/auth/`: auth callback routes
- `src/components/`: `ui/`, `motion/`, `scene/`, `content/`, `layout/`, `sections/`, `providers/`
- `src/features/`: feature modules — `auth/`, `workspaces/`, `journal/`, `guide/`, `rituals/`, `map/`, `world-map/` (each with `components/`, actions co-located where needed)
- `src/lib/`: `env.ts` (Zod-validated env), `utils.ts`, `db/` (Drizzle schema), `supabase/`, `ai/`, `content/`, `schemas/`, `analytics/`, `auth/`; server actions live in feature modules.
- `src/stores/`: Zustand — `intensity.ts`, `audio.ts`, `preferences.ts`
- `src/i18n/`: next-intl config, `request.ts`, `messages/{de,en}.json`
- `src/content/`: MDX by sacred content type (`teachings/`, `reflections/`, `practices/`, `transmissions/`, `essays/`, `journeys/`, `journal/`, `pages/`)
- `supabase/schemas/`: declarative desired database state (human-readable source of truth)
- `supabase/migrations/`: the single append-only deployment channel (extensions, triggers, RLS, reviewed DML)
- `docs/archive/`: superseded planning docs (kept for traceability, not current guidance)

See `ARCHITECTURE.md` §III for the full target structure.

### Coding Paradigms
1. **Server-first**: Default to Server Components. Client Components are islands with `'use client'`.
2. **Server actions for mutations**; API routes are allowed for webhooks, auth callbacks, and streaming/AG-UI endpoints (per `docs/ROADMAP.md` §II) — everything else stays a server action.
3. **Content as system**: Sacred content types (Teaching, Reflection, Practice, Transmission, Visual Essay, Sound Journey) are first-class entities with Zod schemas and dedicated renderers.
4. **Motion hierarchy**: Every animation declares its level (Micro / Flow / Sacred / Event). Sacred and Event only render in Balanced/Immersive intensity modes.
5. **Performance budget**: LCP < 2.5s, CLS < 0.1, INP < 200ms. WebGL is lazy-loaded.
6. **Accessibility-first mysticism**: WCAG AA baseline, `prefers-reduced-motion` respected, Still mode is a first-class experience.

### Story Pages (`/s/<slug>`)
Standalone, teilbare Seiten — Blogposts, Info-Seiten, One-Pager für Kunden und Partner.
**Eine `.mdx`-Datei in `src/content/stories/` ⇒ eine Seite unter `/s/<slug>`.** Keine Route
anlegen, keine Komponente importieren. Frontmatter steuert Atmosphäre, Akzent, Hero, CTA
und Sichtbarkeit (`listed: false` = nur per Direktlink, nicht im Index und nicht in der
Sitemap). Das MDX-Kit (`src/components/content/mdx-kit.tsx`) ist global registriert und
liefert **null Client-JavaScript** — Scroll-Hintergründe laufen über CSS
`animation-timeline: view()`, nicht über framer-motion.
Vor jeder solchen Aufgabe `.agents/skills/story-pages/SKILL.md` lesen.

### Frontend-Skill-Routing
Für JEDE Frontend-/Design-Arbeit zuerst `.agents/skills/frontend-workflow/SKILL.md` lesen — es routet zwischen den überlappenden Design-Skills (impeccable, ui-ux-pro-max, frontend-design, accessibility, dataviz) und pinnt die Projekt-Constraints, die deren generische Empfehlungen überstimmen (framer-motion statt GSAP, `useMotionLevel`-Gating statt CSS-Nuke, committed Brand-Tokens).

### Aufgaben für Agents
1. **Komponentenbau**: Erstelle UI-Komponenten in `src/components/ui/` und nutze `cn()` aus `src/lib/utils.ts`.
2. **Seitenaufbau**: Folge `VISION.md` für Produkt-Vision und `ARCHITECTURE.md` für technische Entscheidungen.
3. **Styling**: Strikt Tailwind und die definierten Brand-Farben. Darkness as space.
4. **Motion**: Verwende framer-motion (Import aus `"framer-motion"`) und deklariere die Motion-Ebene (Micro/Flow/Sacred/Event).
5. **Content**: Sacred Content System Typen respektieren. Zod-Schema für Frontmatter.
6. **i18n**: Neue UI-Strings über `useTranslations()`/`getTranslations()` aus `src/i18n/messages/{de,en}.json` — keine neuen hardcodierten Strings in Komponenten.
7. **Code-Style**: Striktes TypeScript, funktionale Komponenten, Server Components by default, Mobile-first.
8. **Feature entrypoints**: Server-Code importiert über `src/features/<feature>/index.ts`. Client-Komponenten nutzen einen client-sicheren Barrel wie `src/features/<feature>/components/index.ts`, wenn der Root-Barrel `server-only` Exports enthält.

### Aktueller Stand
- Brand-System + "three depths" Design (cosmic → solarpunk → warm) live across the site; Style-Guide unter `/brand`.
- Portal-Layer live: Workspace-Freigabe, Profile, Journal, Map, Guide, Practice und Admin-Verwaltung unter `(portal)/inner/*`.
- Phase 0 (Foundation) abgeschlossen: pnpm-Migration, `src/lib/env.ts` (Zod, fail-fast), deklarative Schemas plus append-only Migrationen, Sentry via `instrumentation.ts`/`instrumentation-client.ts`.
- In Arbeit: Abschluss/Cloud-Verifikation von Accounts & Workspace Identity (Phase 1) und Docker-Hosting (Phase 4, parallelisierbar).
- Siehe **`docs/ROADMAP.md`** für den vollständigen Phasenplan (Accounts → AG-UI Agent → Akashic Records → Docker).
