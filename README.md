# OneEmergence

A digital consciousness portal built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

> Einheit. Freiheit. Liebe.

## Stack

- **Framework:** Next.js 16.2 (App Router, Server Components first)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 + design tokens
- **Animation:** `framer-motion`, with intensity and reduced-motion support
- **World map:** React Three Fiber + Three.js (progressive enhancement)
- **State:** Zustand (client islands), Zod (validation)
- **Content:** MDX + frontmatter, sacred content types
- **i18n:** next-intl (DE default, EN growing incrementally)
- **Backend:** Supabase (Postgres, Auth, Storage) + Drizzle ORM, Vercel AI SDK
- **Monitoring/Testing:** Sentry, Playwright
- **Icons:** Lucide React
- **Package manager:** pnpm

## Getting Started

Use Node 22 (`.nvmrc`) and pnpm 11.1.3 (`packageManager` in `package.json`).
The public website can run locally without cloud credentials:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).
For connected portal development, copy `.env.example` to `.env.local` and fill
in the Supabase project values; see [Environment](#environment). Detailed test
commands, CI scope and agent handoff guidance live in
[docs/ENGINEERING.md](./docs/ENGINEERING.md).

## Project Structure

```
src/
  app/
    (marketing)/   → Public routes: home, manifesto, about, experiences,
                      library, events, community, contact, journal, brand
    (portal)/      → Auth + workspace routes: portal states, inner/{journal,map,guide,practice,settings,admin}
    (immersive)/   → Full-screen public world map
    api/           → Guide JSON endpoint and liveness probe (streaming planned)
    auth/          → Auth callback routes
    legal/         → Imprint, privacy
  components/      → ui/, motion/, scene/, content/, layout/, sections/, providers/
  features/        → Feature modules: auth/, workspaces/, journal/, guide/, rituals/, map/, world-map/
  lib/             → env.ts (Zod-validated env), db/ (Drizzle schema), supabase/, ai/,
                      content/, schemas/, analytics/, auth/, utils.ts
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
| `/map`, `/map/immersive` | Public world map and immersive exploration |
| `/s`, `/s/[slug]` | Story index and shareable MDX pages |
| `/journal/[slug]` | Public journal articles |
| `/events` | Gatherings, retreats, sessions |
| `/community` | Onboarding, values, join flow |
| `/contact` | Contact form |
| `/brand` | Brand & style guide |
| `/legal/imprint`, `/legal/privacy` | Legal pages |
| `/portal` | Portal entry / threshold experience (auth) |
| `/portal/pending`, `/portal/access` | Membership approval/access states |
| `/portal/account` | Account export and deletion, including pending members |
| `/inner` | Dashboard (auth + active workspace membership) |
| `/inner/journal`, `/inner/map`, `/inner/guide`, `/inner/practice` | Portal features (auth) |
| `/inner/settings` | Global and workspace-specific profile preferences |
| `/inner/admin/members`, `/inner/admin/workspaces` | Admin-only access and workspace management |

## Environment

For Next.js development, copy `.env.example` to `.env.local` (`Copy-Item
.env.example .env.local` in PowerShell, `cp .env.example .env.local` in Bash).
Use the URL and keys from the same Supabase project and its migrated database.

`src/lib/env.ts` validates environment values. Production startup requires
`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` and `DATABASE_URL`. Development and builds
allow these to be absent. The AI provider key, Sentry DSN and service-role key
are optional; account deletion needs the service-role key and Guide responses
need the AI key. Leave unused optional values unset.

Next.js inlines `NEXT_PUBLIC_*` values at build time. Set the intended values
before production builds. Docker Compose uses `.env` as its runtime env file;
its public build arguments must also match the target environment.

## Scripts

```bash
pnpm dev              # dev server
pnpm build             # production build
pnpm check             # lint + typecheck
pnpm typecheck         # tsc --noEmit
pnpm lint              # eslint
pnpm format:check      # check formatting without rewriting files
pnpm format            # prettier --write
pnpm test              # full Playwright suite
pnpm test:smoke        # smoke tests
pnpm test:a11y         # accessibility tests
pnpm test:content      # content/MDX validation
pnpm test:perf         # performance tests
pnpm test:mobile       # responsive/mobile smoke
pnpm test:world-assets # validate the world-map GLB asset contract
pnpm test:journal-autosave # save scheduling; no browser/server required
pnpm test:accounts:local   # real accounts + RLS in disposable local Supabase (Docker)
pnpm db:push           # supabase db push (apply migrations)
pnpm db:diff           # diff migrations against supabase/schemas desired state
```

For the schema workflow and the one-time first-admin bootstrap, see
[`supabase/schemas/README.md`](./supabase/schemas/README.md).

## Planning

- [docs/ROADMAP.md](./docs/ROADMAP.md) — current phase, findings, decisions log (read this first)
- [docs/ENGINEERING.md](./docs/ENGINEERING.md) — reproducible local checks, CI and agent workflow
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

Vercel remains the primary hosting target. The repository also contains a
multi-stage `Dockerfile`, `docker-compose.yml` and a GHCR publishing workflow
triggered by `v*` tags or manual dispatch. `/api/health` checks process liveness;
it does not verify database or provider connectivity. Deployment settings,
container runtime and live account flows require environment-specific
verification; see [the roadmap](./docs/ROADMAP.md).
