# OneEmergence — Stack Decision

> Canonical backend platform decision. This document supersedes any conflicting statements in ARCHITECTURE.md or agent plans.

**Decision: Supabase is the unified backend platform for OneEmergence.**

Approved: 2026-03-29

---

## What Changes

| Layer | Before | After | Migration Effort |
|---|---|---|---|
| **Auth** | Auth.js v5 beta + Drizzle adapter | Supabase Auth | Replace ~4 files |
| **Database** | Neon Postgres (not provisioned) | Supabase Postgres (Frankfurt) | Change connection string |
| **Storage** | None | Supabase Storage | New capability |
| **Realtime** | None | Supabase Realtime (v3) | New capability, deferred |

## What Stays Unchanged

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15+ / React 19 / App Router | No change |
| Language | TypeScript (strict) | No change |
| Styling | Tailwind CSS v4 + design tokens | No change |
| Animation | Motion (Framer Motion) | No change |
| ORM | Drizzle ORM | Connects to Supabase Postgres instead of Neon |
| AI | Vercel AI SDK + Anthropic Claude | No change |
| Content | MDX filesystem + Zod schemas | No change |
| i18n | next-intl | No change |
| State | Zustand (client islands) | No change |
| Monitoring | Sentry | No change |
| Testing | Playwright + axe-core | No change |
| CI/CD | GitHub Actions + Vercel | No change |

## Why Supabase

1. **One platform instead of four decisions.** Auth, database, storage, and realtime collapse into a single project with one dashboard, one billing relationship, and native EU hosting (Frankfurt).

2. **RLS is the killer feature.** Journal entries, guide conversations, map nodes, saved practices — all user-owned data. With Supabase Auth, `auth.uid() = user_id` in a single RLS policy automatically scopes every query. Without it, every server action manually filters by userId — a source of bugs and security gaps.

3. **Nothing is provisioned yet.** There are zero users, zero data, no production database. The "migration" is pointing code at Supabase before first launch — not a data migration.

4. **The product roadmap demands it.** Journal, AI Guide, Consciousness Map, collective features, live ceremonies — all need auth + database + storage + realtime. Supabase provides all four; the current setup provides one (database, unplugged).

5. **EU data residency without self-hosting.** Supabase Frankfurt region keeps all user data in the EU. The app on Vercel's edge is stateless — no user data touches non-EU servers.

6. **Free email auth.** The current Auth.js setup defers email/password because it needs Resend. Supabase Auth includes email confirmation, magic links, and password reset out of the box.

7. **pgvector for AI features.** The Consciousness Map and AI Guide benefit from embedding-based similarity search. Supabase supports pgvector natively, integrated with auth and RLS.

## Migration Principles

1. **Drizzle stays as the ORM.** Supabase Postgres is just Postgres — Drizzle connects to it. All existing queries, server actions, and type safety are preserved.

2. **Server-first architecture preserved.** Use `@supabase/ssr` for auth middleware only. All data queries go through Drizzle in server actions — never through the Supabase JS client on the frontend.

3. **Auth.js tables are dropped, not migrated.** Supabase Auth manages its own `auth` schema. App tables reference `auth.users(id)` via UUID foreign keys.

4. **RLS from day one.** Every table with a `user_id` column gets row-level security policies before the first user signs up.

5. **No Supabase Edge Functions.** Keep all server logic in Next.js server actions. Supabase Edge Functions only for webhooks or async background jobs if needed later.

6. **Local development via Supabase CLI.** `supabase start` provides a full local stack (Postgres, Auth, Storage, Realtime, Studio) that mirrors production exactly.

## Rollout Strategy

### Phase 1: Provision & Wire (Day 1)
- Create Supabase project in Frankfurt region
- Enable pgvector extension
- Apply database schema from `database/` SQL scripts
- Configure OAuth providers (Google, GitHub) in Supabase Dashboard
- Swap Neon driver for postgres-js, update connection string
- Replace Auth.js with Supabase Auth helpers

### Phase 2: Validate (Day 1-2)
- Run `next build` — zero errors
- Run Playwright tests — all passing
- Test full flow: Portal Entry → Sign in → Dashboard → Journal → Guide
- Verify RLS policies block cross-user access

### Phase 3: Storage & Cleanup (Day 2)
- Create storage buckets (soundscapes public, user-uploads private)
- Update `.env.example` with Supabase variables
- Remove Auth.js and Neon dependencies from package.json
- Update ARCHITECTURE.md intelligence stack table

### Phase 4: Local Dev (Day 2-3)
- `supabase init` + `supabase start` for local development
- Generate TypeScript types from schema
- Seed local database with dev data
- Document local dev workflow in README

## Environment Variables

### Remove
```
DATABASE_URL              # Neon connection string
AUTH_SECRET               # Auth.js secret
AUTH_GOOGLE_ID            # Auth.js Google OAuth
AUTH_GOOGLE_SECRET        # Auth.js Google OAuth
AUTH_GITHUB_ID            # Auth.js GitHub OAuth
AUTH_GITHUB_SECRET        # Auth.js GitHub OAuth
NEXTAUTH_URL              # Auth.js base URL
```

### Add
```
NEXT_PUBLIC_SUPABASE_URL          # Supabase project URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY     # Supabase anonymous key (public, safe for browser)
SUPABASE_SERVICE_ROLE_KEY         # Supabase service role key (server-only, never expose)
DATABASE_URL                      # Supabase Postgres connection string (for Drizzle)
```

Note: OAuth providers (Google, GitHub) are configured in the Supabase Dashboard, not via env vars in the app.

## Human Checklist

### Before coding
- [ ] Create Supabase project at [supabase.com](https://supabase.com) — **Frankfurt (eu-central-1)** region
- [ ] Enable `pgvector` extension: Dashboard → Database → Extensions
- [ ] Configure Google OAuth: Dashboard → Authentication → Providers
- [ ] Configure GitHub OAuth: Dashboard → Authentication → Providers
- [ ] Copy credentials to `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`

### Apply database schema
- [ ] Run SQL scripts from `database/` folder in order (00 through 10) against Supabase SQL Editor
- [ ] Or use `supabase db push` if using Supabase CLI migrations

### After coding migration
- [ ] `npm install @supabase/supabase-js @supabase/ssr postgres`
- [ ] `npm uninstall next-auth @auth/drizzle-adapter @neondatabase/serverless`
- [ ] Verify `next build` passes
- [ ] Verify Playwright tests pass
- [ ] Test Portal Entry → OAuth sign-in → Dashboard → Journal CRUD
- [ ] Deploy to Vercel with new env vars

---

*For the full tech stack analysis, see [TECH_STACK_RECOMMENDATION.md](./TECH_STACK_RECOMMENDATION.md). For database schema details, see [database/README.md](./database/README.md). For migration implementation steps, see [MIGRATION_PLAN.md](./MIGRATION_PLAN.md).*
