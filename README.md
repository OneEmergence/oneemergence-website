# OneEmergence

A digital consciousness portal built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

> Einheit. Freiheit. Liebe.

## Stack

- **Framework:** Next.js 16.2 (App Router, Server Components first)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + design tokens
- **Animation:** Motion (Framer Motion)
- **State:** Zustand (client islands), Zod (validation)
- **Content:** MDX + frontmatter, sacred content types
- **i18n:** next-intl (DE default, EN growing incrementally)
- **Backend:** Supabase (Postgres, Auth, Storage) + Drizzle ORM, Vercel AI SDK
- **Monitoring/Testing:** Sentry, Playwright
- **Icons:** Lucide React
- **Package manager:** pnpm

## Getting Started

Requires Node 22+ and pnpm.

```bash
pnpm install
cp .env.example .env   # fill in Supabase/Sentry/AI keys
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  app/
    (marketing)/   → Public routes: home, manifesto, about, experiences,
                      library, events, community, contact, journal, brand
    (portal)/      → Auth + workspace routes: portal states, inner/{journal,map,guide,practice,settings,admin}
    api/           → API routes (guide streaming endpoint; webhooks/auth callbacks)
    auth/          → Auth callback routes
    legal/         → Imprint, privacy
  components/      → ui/, motion/, scene/, content/, layout/, sections/, providers/
  features/        → Feature modules: auth/, workspaces/, journal/, guide/, rituals/, map/
  lib/             → env.ts (Zod-validated env), db/ (Drizzle schema), supabase/, ai/,
                      content/, schemas/, analytics/, auth/, actions/, utils.ts
  stores/          → Zustand: intensity, audio, preferences
  i18n/            → next-intl config, request.ts, messages/{de,en}.json
  content/         → MDX by sacred content type (teachings, reflections, practices, ...)
supabase/
  schemas/         → declarative desired database state (source of truth)
  migrations/      → append-only deployment history (the only deployment channel)
tests/             → Playwright: smoke, a11y, content, performance, mobile
```

## Routes

| Route | Notes |
|---|---|
| `/` | Home — Living Portal |
| `/manifesto` | Vision, values, principles |
| `/about` | Origin story, team |
| `/experiences` | Experiences overview |
| `/library` | Content library (sacred content types) |
| `/library/[type]/[slug]` | Individual library item |
| `/content` | Content hub |
| `/journal/[slug]` | Public journal articles |
| `/events` | Gatherings, retreats, sessions |
| `/community` | Onboarding, values, join flow |
| `/contact` | Contact form |
| `/brand` | Brand & style guide |
| `/legal/imprint`, `/legal/privacy` | Legal pages |
| `/portal` | Portal entry / threshold experience (auth) |
| `/portal/pending`, `/portal/access` | Membership approval/access states |
| `/inner` | Dashboard (auth + active workspace membership) |
| `/inner/journal`, `/inner/map`, `/inner/guide`, `/inner/practice` | Portal features (auth) |
| `/inner/settings` | Global and workspace-specific profile preferences |
| `/inner/admin/members`, `/inner/admin/workspaces` | Admin-only access and workspace management |

## Environment

Copy `.env.example` to `.env` and fill in the values (`NEXT_PUBLIC_SITE_URL`,
Supabase project URL/keys, `DATABASE_URL`, Sentry DSN, AI provider key). Env access is Zod-validated at
boot via `src/lib/env.ts` — a missing/invalid var fails fast instead of at
request time.

## Scripts

```bash
pnpm dev              # dev server
pnpm build             # production build
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint
pnpm format            # prettier --write
pnpm test              # full Playwright suite
pnpm test:smoke        # smoke tests
pnpm test:a11y         # accessibility tests
pnpm test:content      # content/MDX validation
pnpm test:perf         # performance tests
pnpm test:mobile       # responsive/mobile smoke
pnpm db:push           # supabase db push (apply migrations)
pnpm db:diff           # diff migrations against supabase/schemas desired state
```

For the schema workflow and the one-time first-admin bootstrap, see
[`supabase/schemas/README.md`](./supabase/schemas/README.md).

## Planning

- [docs/ROADMAP.md](./docs/ROADMAP.md) — current phase, findings, decisions log (read this first)
- [VISION.md](./VISION.md) — Product vision, UX philosophy, AI Guide, content system, product staging
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical stack, coding paradigms, folder structure, migration path

## Design Tokens

| Token | Hex | Role |
|---|---|---|
| `oe-deep-space` | `#0A0F1F` | Background |
| `oe-aurora-violet` | `#7C5CFF` | Accent |
| `oe-solar-gold` | `#F6C453` | Headlines |
| `oe-spirit-cyan` | `#54E2E9` | Secondary accent |
| `oe-pure-light` | `#F7F8FB` | Text |

## Deploy

Hosted on [Vercel](https://vercel.com). Push to `main` triggers production deployment. EU self-hosting via Docker is planned (see ROADMAP Phase 4).
