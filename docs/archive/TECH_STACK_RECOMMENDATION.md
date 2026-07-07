# OneEmergence — Tech Stack Recommendation

> Opinionated, implementation-aware stack recommendation for the consciousness portal product.
> Created 2026-03-29. Based on analysis of current repo state, planning documents, and product trajectory.

---

## Executive Recommendation

**Adopt Supabase as the unified backend platform.** Replace the current Neon + Auth.js + custom-everything approach with Supabase Postgres + Supabase Auth + Supabase Storage + Supabase Realtime. Keep Drizzle ORM as the query layer. Keep Vercel AI SDK + Anthropic for AI. Keep Vercel for hosting (with EU migration path via Supabase's EU regions). Keep the existing frontend stack (Next.js 15 / React 19 / Tailwind v4 / Motion) untouched.

**Why:** Supabase gives you auth, database, storage, realtime, and edge functions in one platform with one dashboard, one billing relationship, and native EU hosting. The current repo has Neon + Auth.js + no storage + no realtime — four separate decisions that Supabase collapses into one. The code investment so far (Drizzle schema, Auth.js config, server actions) is modest and migratable in a single focused session. The product roadmap (journal, AI guide, consciousness map, collective field, live ceremonies) demands realtime, file storage, and row-level security — all first-class in Supabase, all absent from the current setup.

---

## 1. Frontend / App Framework Layer

### Keep: Next.js 15 + React 19 + App Router

**No change needed.** The current choice is correct and deeply embedded.

- Server Components, server actions, streaming, ISR — all align with the architecture doc
- The portal features (journal, guide, map) are built as server-first with client islands
- Next.js 15+ on Vercel gives the best deployment DX for this project's scale
- Supabase works seamlessly with Next.js (official `@supabase/ssr` package)

**Risk to monitor:** Next.js 16 is already in use (package.json shows `16.2.1`). Stay on latest stable but pin exact versions before production launch.

---

## 2. Auth Layer

### Recommendation: Supabase Auth (replace Auth.js)

| Factor | Auth.js (current) | Supabase Auth (recommended) | Better Auth |
|---|---|---|---|
| OAuth providers | Google, GitHub configured | Google, GitHub, Apple, 20+ built-in | Similar to Auth.js |
| Email/password | Needs email provider (Resend) | Built-in, including magic links | Built-in |
| Session strategy | DB sessions via Drizzle adapter | JWT + refresh tokens, server-verified | DB or JWT |
| RLS integration | Manual — no row security | Native — auth.uid() in RLS policies | Manual |
| Admin dashboard | None | Built-in user management UI | None |
| MFA / 2FA | Plugin-based | Built-in TOTP | Plugin-based |
| Self-hosted option | Yes (code) | Yes (Supabase self-host) | Yes (code) |
| EU compliance | Depends on where you host DB | EU region available (Frankfurt) | Depends on host |
| Migration effort | Already installed | Replace ~4 files | Replace ~4 files |

**Why Supabase Auth wins here:**
1. **RLS integration is the killer feature.** Journal entries, guide conversations, map nodes — all user-owned data. With Supabase Auth, you write `auth.uid() = user_id` in a policy once, and every query is automatically scoped. With Auth.js, you manually add `AND userId = ?` to every server action — which the codebase already does, repeatedly.
2. **Email auth is free.** The current setup defers email/password because it needs Resend. Supabase Auth includes email confirmation, magic links, and password reset out of the box.
3. **No adapter complexity.** Auth.js requires `@auth/drizzle-adapter` with specific table shapes. Supabase Auth manages its own `auth` schema — your app tables stay clean.
4. **Portal Entry UX is preserved.** Supabase Auth is headless — you control every pixel of the sign-in UI. The threshold experience in `/portal` can remain exactly as designed, calling `supabase.auth.signInWithOAuth()` instead of `signIn('google')`.

**Migration cost:** Moderate but bounded. Replace `src/lib/auth/` (3 files), update `middleware.ts`, update `src/lib/db/` (remove auth tables from Drizzle schema — Supabase manages those), update sign-in/sign-out calls in 3-4 components. Auth.js auth tables are dropped; Supabase creates its own in the `auth` schema. Half a day of focused work.

**What you lose:** Auth.js's familiarity if you've used NextAuth before. But the current Auth.js setup is v5 beta, which is itself a significant rewrite from v4 — the sunk cost is low.

---

## 3. Database Layer

### Recommendation: Supabase Postgres (replace Neon)

| Factor | Neon (current target) | Supabase Postgres (recommended) |
|---|---|---|
| Postgres version | Latest | Latest |
| Serverless driver | `@neondatabase/serverless` | `@supabase/ssr` or direct connection |
| Connection pooling | Built-in (HTTP) | Built-in (Supavisor, PgBouncer) |
| RLS | Manual SQL | First-class UI + SQL |
| Extensions | Standard | Standard + `pgvector` for embeddings |
| Branching / preview DBs | Yes (Neon's strength) | Not yet (but planned) |
| Migrations | Drizzle Kit | Drizzle Kit (same workflow) |
| EU regions | Yes (Frankfurt) | Yes (Frankfurt) |
| Dashboard | SQL editor | Full admin UI + SQL editor |
| Free tier | Generous | Generous (500MB, 50K auth users) |
| Pricing at scale | Usage-based | Predictable tiers ($25/mo Pro) |

**Keep Drizzle ORM.** The existing schema (`src/lib/db/schema.ts`) ports directly. Replace `@neondatabase/serverless` with `postgres` (node-postgres) or Supabase's pooler URL. The Drizzle queries, server actions, and type safety remain identical.

**Key advantage for this product:** `pgvector` extension. The Consciousness Map and AI Guide both benefit from embedding-based similarity search. Supabase supports `pgvector` natively. Neon does too, but with Supabase you get the embedding storage + auth + RLS in one integrated system. Future feature: "show me journal entries that feel similar to this one" becomes a vector similarity query with RLS automatically scoping to the current user.

**What Neon does better:** Database branching for preview deployments. This is genuinely useful but not critical at current scale. If you need it later, you can use Supabase's upcoming branching or manage dev/staging/prod as separate projects.

**Migration cost:** Low. Change the connection string in `src/lib/db/index.ts`. Replace `neon()` driver with `postgres` or Supabase pooler. Run `drizzle-kit push` against the new database. The schema file stays the same.

---

## 4. Storage Layer

### Recommendation: Supabase Storage

The current codebase has **no file storage solution**. The plan mentions audio files ("public/audio or CDN"), practice recordings, and potentially user-uploaded vision board content. This is a gap.

| Factor | Supabase Storage | Vercel Blob | S3 + CloudFront |
|---|---|---|---|
| Integration | Same project, same auth | Vercel-only | Manual setup |
| Access control | RLS on storage buckets | Token-based | IAM policies |
| CDN | Built-in (via CDN) | Built-in | CloudFront setup |
| Image transforms | Built-in (resize, crop) | None | Lambda@Edge |
| Cost | Included in plan (1GB free) | $0.15/GB/mo | Variable |
| EU storage | Yes (same region as DB) | No guarantee | Choose region |

**Use cases in this product:**
- **Soundscape audio files** for meditation room and sound journeys
- **User profile images** (if not relying solely on OAuth avatars)
- **Vision Space uploads** (v2+ dream boards, intention images)
- **Community contributions** (v3 field contributions: art, audio, poetry)
- **Practice content** (guided meditation audio, breathwork audio cues)

Supabase Storage with bucket-level RLS means: public bucket for soundscapes (anyone can stream), private bucket for user uploads (only owner can read/write), moderated bucket for community contributions (write-only, admin-read).

---

## 5. Realtime / Presence Layer

### Recommendation: Supabase Realtime (for v3, but architecture now)

| Factor | Supabase Realtime | Liveblocks | PartyKit / Durable Objects |
|---|---|---|---|
| Data sync | Postgres changes → client | CRDT-based room state | Custom logic |
| Presence | Built-in presence API | Built-in presence API | Custom |
| Auth integration | Same Supabase Auth | Separate auth tokens | Separate |
| Pricing | Included (200 concurrent) | $99/mo (10K MAU) | Usage-based |
| Complexity | Low (subscribe to table changes) | Medium (room/state model) | High (custom code) |
| Best for | DB-driven realtime updates | Collaborative editing | Custom multiplayer logic |

**For this product's needs:**

- **Collective Pulse** (v3): aggregate visualization of what people reflect on → Supabase Realtime listening to aggregated DB changes. No complex CRDT needed.
- **Live Ceremonies** (v3): presence indicators ("12 people sitting in silence") → Supabase Presence channel. Dead simple.
- **Shared Spaces** (v3): persistent thematic rooms → Supabase Realtime channels per room + DB persistence.

Liveblocks would be better if you were building Google Docs-style collaborative editing. You're not. The collective field features are about **presence awareness and aggregate visualization**, not collaborative state — Supabase Realtime is the right weight.

**Architecture decision now:** Design DB tables with realtime in mind (e.g., a `presence_heartbeats` table, a `collective_themes` materialized view). Don't build the features yet, but don't make schema decisions that block them.

---

## 6. AI Integration Layer

### Keep: Vercel AI SDK + Anthropic (`@ai-sdk/anthropic`)

**No change needed.** The current setup is correct.

- Vercel AI SDK provides `generateObject()` / `streamObject()` / `streamText()` with Zod schema validation
- Claude (Anthropic) is the right model for this product — best at nuanced, reflective, non-generic responses
- The four-role system prompt architecture is well-designed and already implemented
- `@ai-sdk/anthropic` is a thin wrapper; easy to add OpenAI as a fallback if needed

**Enhancement with Supabase:** Store conversation context and user embeddings in Supabase Postgres with `pgvector`. The AI Guide's context injection pipeline (currently reads journal entries + practices) can evolve into semantic retrieval: "find the 5 most relevant journal entries for this conversation topic" via vector similarity, rather than "take the 7 most recent entries."

**Concrete next step:** When provisioning Supabase, enable the `vector` extension. Add an `embedding` column (type `vector(1536)` or `vector(768)`) to `journal_entries` and `map_nodes`. Generate embeddings asynchronously via a server action or edge function after each journal save.

**Multi-model strategy:** Keep Anthropic as the primary Guide model (quality matters for consciousness-related dialogue). Consider adding a cheaper/faster model (e.g., Claude Haiku) for utilitarian tasks: auto-tagging journal entries, generating map node suggestions, summarizing conversation titles.

---

## 7. Content / CMS Layer

### Keep: MDX filesystem (with future headless CMS option)

**No change needed now.** The architecture doc's position is sound: MDX on filesystem until an editorial team exists.

| Approach | When to use |
|---|---|
| **MDX filesystem** (current) | Solo creator or small team. Content is code-reviewed. Developer-authored. |
| **Headless CMS** (future) | Multiple non-technical editors. Translation workflows. Scheduled publishing. |

**If/when a CMS is needed, consider:**
- **Sanity** — Best DX, real-time collaboration, great with Next.js, generous free tier, EU hosting possible
- **Keystatic** — Git-backed, works with MDX, zero-cost, keeps content in repo
- **Payload CMS** — Self-hosted, Postgres-backed (could share Supabase DB), full control

**Avoid:** Contentful (expensive at scale, poor DX), Strapi (heavy, self-host overhead), WordPress (wrong paradigm).

The sacred content type system (Teaching, Reflection, Practice, etc.) with Zod schemas is a strong foundation regardless of whether content lives in files or a CMS. Keep this pattern.

---

## 8. Observability / Monitoring

### Keep: Sentry (already configured)

**No change needed.** Sentry is installed, configured conditionally (DSN-gated), and has error boundaries. The quality platform agent did solid work here.

**Additions to consider:**
- **Sentry Crons** for monitoring any scheduled tasks (e.g., daily impulse generation, embedding computation)
- **Vercel Analytics** (free tier) for Web Vitals in production — complements Sentry's performance traces
- **Supabase Dashboard** provides its own Postgres metrics, auth metrics, and storage metrics — no extra tooling needed

**What to avoid:** Don't add Datadog, New Relic, or LogRocket. Sentry + Vercel Analytics + Supabase Dashboard covers observability for a product of this scale. Adding more tools creates dashboard sprawl with no added insight.

---

## 9. Testing / CI

### Keep: Playwright + GitHub Actions (already configured)

**No change needed.** The testing setup is solid:
- Smoke tests for all routes
- Accessibility tests with axe-core
- Performance budget tests (LCP, CLS)
- Content validation
- CI pipeline with quality + test jobs

**Additions to consider:**
- **Vitest** for unit testing server actions and Zod schema validation (faster than Playwright for non-browser tests)
- **Database test utilities** — use Supabase's local development (`supabase start`) in CI for integration tests against a real Postgres
- **Supabase CLI** in CI — validate RLS policies, run migrations, seed test data

---

## 10. Deployment / Hosting

### Keep: Vercel (with Supabase EU region for data)

| Concern | Solution |
|---|---|
| **App hosting** | Vercel (global edge, instant deploys, preview per PR) |
| **Data residency** | Supabase Frankfurt region (EU data stays in EU) |
| **GDPR compliance** | User data in Supabase EU; app logic on Vercel edge (stateless) |
| **Future self-hosting** | Supabase is open-source, self-hostable on any VPS/Kubernetes |

**The EU question:** The architecture doc mentions "EU self-host later." With Supabase's Frankfurt region, you get EU data residency without self-hosting. The app on Vercel's edge is stateless — no user data touches non-EU servers if your Supabase project is in Frankfurt. This satisfies GDPR for the vast majority of cases without the operational burden of self-hosting.

**If full self-hosting is eventually required:**
1. Supabase self-hosted (Docker Compose or Kubernetes) on Hetzner/OVH
2. Next.js on a VPS with `next start` or via Coolify/Dokku
3. Caddy or Traefik as reverse proxy
4. This path exists but should only be taken if there's a specific legal or business reason. Vercel + Supabase EU is sufficient for launch and likely for years.

---

## 11. Internationalization

### Keep: next-intl

**No change needed.** `next-intl` is installed and the architecture specifies DE as default with EN planned.

**Implementation note:** With Supabase Auth, user locale preference can be stored in `user_metadata` (a JSON field on the auth user), synced to the next-intl middleware cookie, and persisted without a separate preferences table column.

---

## 12. Design System / Motion / 3D

### Keep: Tailwind v4 + Motion (Framer Motion) + React Three Fiber

**No change needed.** The artistic stack is well-chosen and deeply considered in VISION.md.

**One recommendation:** Add **shadcn/ui** initialization (already in the architecture doc as a planned step). shadcn/ui components are copied source (not a dependency), accessible by default, and styled with Tailwind — they'll accelerate portal UI development without adding runtime cost. The architecture doc already recommends this.

---

## 13. Security / Privacy / GDPR / EU Considerations

### With Supabase, you get:

| Concern | How Supabase addresses it |
|---|---|
| **Row-Level Security** | Native RLS policies. Journal entries visible only to owner. No server-side filter bugs. |
| **Data residency** | Frankfurt region. Data never leaves EU. |
| **Encryption at rest** | Default on all Supabase Postgres instances |
| **Encryption in transit** | TLS enforced |
| **SOC 2 Type II** | Supabase is SOC 2 certified |
| **GDPR data deletion** | `supabase.auth.admin.deleteUser()` cascades to all user data via FK constraints |
| **Audit logging** | Postgres `pgaudit` extension available |
| **Backup** | Daily automated backups (Pro plan: point-in-time recovery) |

**Additional measures for this product:**
1. **Journal encryption at rest** — noted as a requirement in the portal plan. Supabase encrypts the entire disk, but for defense-in-depth, consider application-level encryption of journal `content` column using a per-user key derived from their auth credentials. This is a significant implementation effort — defer to post-MVP unless the threat model demands it.
2. **Cookie consent** — required for EU users. Use a minimal consent banner. Sentry, Supabase Analytics (if used), and any tracking require consent.
3. **Privacy policy** — already has `/legal/privacy`. Update to reference Supabase as data processor.
4. **Data export** — GDPR right to portability. Build a "download my data" server action that exports journal entries, map nodes, and preferences as JSON.

---

## 14. Local Dev Ergonomics

### Supabase local development is excellent

```bash
# One command to start local Supabase (Postgres, Auth, Storage, Realtime, Studio)
supabase start

# Local Studio dashboard at localhost:54323
# Local Postgres at localhost:54322
# Local Auth at localhost:54321

# Apply migrations
supabase db push

# Generate TypeScript types from schema
supabase gen types typescript --local > src/types/database.ts
```

**Compared to current setup:** Right now there's no local database. The app gracefully degrades to no-DB mode, which is clever for bootstrapping but means you can't actually test portal features locally. Supabase CLI gives you a full local stack that mirrors production exactly.

**Drizzle + Supabase local:** Use Supabase local Postgres URL for Drizzle migrations in development. `drizzle-kit push` works against local Supabase Postgres identically to production.

---

## 15. Migration Path: Current State to Recommended Stack

### What exists now
- **Neon Postgres** (configured but not provisioned — no DATABASE_URL set)
- **Auth.js v5 beta** (configured with Google + GitHub, Drizzle adapter, database sessions)
- **Drizzle ORM** (schema defined for all tables: users, accounts, sessions, journal, practices, map, guide)
- **Vercel AI SDK + Anthropic** (configured, guide built)
- **No storage solution**
- **No realtime solution**
- **No actual database running** (everything gracefully degrades to mock/empty state)

### The migration is low-risk because nothing is provisioned yet

This is the ideal moment to switch. There are no users, no data to migrate, no production database to worry about. The "migration" is really just: point the code at Supabase instead of Neon before first provisioning.

### Step-by-step migration

#### Step 1: Provision Supabase (30 min)
1. Create Supabase project in Frankfurt region
2. Install Supabase CLI locally: `npx supabase init`
3. Note: `DATABASE_URL` (Supabase Postgres connection string)
4. Enable `pgvector` extension in Supabase Dashboard → Extensions
5. Install `supabase` CLI: `npm i -D supabase`

#### Step 2: Replace database driver (15 min)
```diff
# package.json
- "@neondatabase/serverless": "^1.0.2",
+ "postgres": "^3.4.0",

# or use Supabase's pooler URL with Drizzle's postgres-js driver
```

Update `src/lib/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL required')

const client = postgres(connectionString)
export const db = drizzle(client, { schema })
```

#### Step 3: Replace Auth.js with Supabase Auth (2-3 hours)
1. `npm uninstall next-auth @auth/drizzle-adapter`
2. `npm install @supabase/supabase-js @supabase/ssr`
3. Replace `src/lib/auth/config.ts` with Supabase client setup
4. Replace `src/lib/auth/session.ts` with Supabase session helpers
5. Update `middleware.ts` to use Supabase auth middleware
6. Remove auth tables from `src/lib/db/schema.ts` (users, accounts, sessions, verification_tokens) — Supabase manages its own `auth.users` table
7. Update FK references in app tables: `userId` references Supabase's `auth.users.id` (UUID type)
8. Update sign-in/sign-out calls in portal components (~3-4 files)
9. Configure OAuth providers in Supabase Dashboard (Google, GitHub)

#### Step 4: Push Drizzle schema (15 min)
1. Update schema: remove auth tables, keep app tables, change userId type to UUID
2. `drizzle-kit push` against Supabase Postgres
3. Verify tables in Supabase Dashboard → Table Editor

#### Step 5: Add RLS policies (1 hour)
```sql
-- Journal entries: users can only access their own
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their journal entries"
  ON journal_entries FOR ALL
  USING (auth.uid() = user_id);

-- Same pattern for: practices, map_nodes, map_edges, user_preferences,
-- guide_conversations, guide_messages, saved_prompt_cards
```

#### Step 6: Set up Supabase Storage (30 min)
1. Create buckets: `soundscapes` (public), `user-uploads` (private)
2. Upload existing audio files (if any) to `soundscapes`
3. Add storage policies for user-uploads bucket

#### Step 7: Update env and docs (15 min)
1. Update `.env.example` with Supabase variables
2. Update README with Supabase local dev instructions
3. Update ARCHITECTURE.md intelligence stack table

**Total estimated effort: 4-5 focused hours.** This is a one-time cost that eliminates several categories of future work (auth provider setup, storage solution, realtime infrastructure, RLS implementation).

---

## 16. What to Avoid / Anti-patterns

| Anti-pattern | Why | What to do instead |
|---|---|---|
| **Supabase client-side JS SDK for everything** | Bypasses server-first architecture, exposes queries to client | Use Supabase server-side via Drizzle ORM in server actions. Use `@supabase/ssr` for auth only. |
| **Dropping Drizzle for Supabase JS client** | Loses type safety, query composition, migration tooling | Keep Drizzle as query layer. Supabase Postgres is just a Postgres — Drizzle connects to it. |
| **Building a custom auth system** | Auth is solved. Don't solve it again. | Use Supabase Auth. |
| **Adding Redis/Upstash "just in case"** | Premature. Supabase Postgres handles sessions, rate limiting counters, and caching at this scale. | Only add Redis when you measure a specific need (>1000 concurrent users, sub-ms cache requirements). |
| **Multiple Postgres databases** | Neon for some things, Supabase for others | One database. One source of truth. |
| **Supabase Edge Functions instead of Next.js server actions** | Splits server logic across two runtimes | Keep server actions in Next.js. Use Supabase Edge Functions only for webhooks or async background jobs. |
| **Over-abstracting database access** | Repository pattern, service layer, DAO — unnecessary at this scale | Server actions call Drizzle directly. Simple is correct. |
| **Firebase for anything** | Vendor lock-in, US-only, poor relational data support | Already in the "consciously avoided" list. Keep it there. |
| **GraphQL** | Unnecessary abstraction layer between Next.js server components and Postgres | Already in the "consciously avoided" list. Keep it there. |

---

## 17. Layer-by-Layer Summary

| Layer | Current | Recommended | Change? |
|---|---|---|---|
| **Framework** | Next.js 15 (16.2.1) | Next.js 15+ | No |
| **UI** | React 19 | React 19 | No |
| **Language** | TypeScript (strict) | TypeScript (strict) | No |
| **Styling** | Tailwind v4 | Tailwind v4 | No |
| **Animation** | Motion (Framer Motion) | Motion (Framer Motion) | No |
| **3D** | React Three Fiber (planned) | React Three Fiber | No |
| **State** | Zustand | Zustand | No |
| **Validation** | Zod | Zod | No |
| **Auth** | Auth.js v5 beta | **Supabase Auth** | **Yes** |
| **Database** | Neon Postgres (not provisioned) | **Supabase Postgres** | **Yes** |
| **ORM** | Drizzle | Drizzle | No |
| **Storage** | None | **Supabase Storage** | **Yes (new)** |
| **Realtime** | None | **Supabase Realtime** (v3) | **Yes (new)** |
| **AI** | Vercel AI SDK + Anthropic | Vercel AI SDK + Anthropic | No |
| **Content** | MDX filesystem | MDX filesystem | No |
| **i18n** | next-intl | next-intl | No |
| **Monitoring** | Sentry | Sentry | No |
| **Testing** | Playwright + axe-core | Playwright + axe-core | No |
| **CI** | GitHub Actions | GitHub Actions | No |
| **Hosting** | Vercel | Vercel + Supabase EU | No |

**4 changes total.** Three are additions (storage, realtime, Supabase platform), one is a swap (Auth.js → Supabase Auth). Everything else stays exactly as is.

---

## 18. Checklist: When Back at Laptop

### Immediate (this session or next)
- [ ] Create Supabase project at [supabase.com](https://supabase.com) — choose **Frankfurt (eu-central-1)** region
- [ ] Enable `pgvector` extension in Dashboard → Database → Extensions
- [ ] Configure Google OAuth in Supabase Dashboard → Authentication → Providers
- [ ] Configure GitHub OAuth in Supabase Dashboard → Authentication → Providers
- [ ] Copy connection strings to `.env.local` (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)

### Migration session (4-5 hours)
- [ ] `npm install @supabase/supabase-js @supabase/ssr postgres`
- [ ] `npm uninstall next-auth @auth/drizzle-adapter @neondatabase/serverless`
- [ ] Rewrite `src/lib/db/index.ts` — switch driver from Neon to postgres-js
- [ ] Rewrite `src/lib/auth/` — replace Auth.js with Supabase Auth helpers
- [ ] Update `middleware.ts` — Supabase auth session refresh
- [ ] Remove auth tables from `src/lib/db/schema.ts`, update userId types to UUID
- [ ] Update portal components — `signIn()`/`signOut()` calls (3-4 files)
- [ ] `drizzle-kit push` against Supabase Postgres
- [ ] Write RLS policies for all app tables
- [ ] Create storage buckets (soundscapes, user-uploads)
- [ ] Update `.env.example`
- [ ] Run `next build` — verify zero errors
- [ ] Run `npm test` — verify Playwright tests pass

### Post-migration
- [ ] Install Supabase CLI: `npm i -D supabase && npx supabase init`
- [ ] Set up local development: `npx supabase start`
- [ ] Add `ANTHROPIC_API_KEY` to env — test AI Guide end-to-end
- [ ] Test full flow: Portal Entry → Sign in → Dashboard → Journal → Guide
- [ ] Update ARCHITECTURE.md intelligence stack table
- [ ] Commit and deploy to Vercel

### Future considerations
- [ ] Add `embedding vector(768)` column to journal_entries and map_nodes (when AI context retrieval is prioritized)
- [ ] Evaluate Supabase Realtime when starting v3 collective features
- [ ] Evaluate Sanity or Keystatic if a non-technical editor joins the team
- [ ] Consider Supabase self-hosting only if Vercel + Supabase EU proves insufficient for compliance

---

*This document is a point-in-time recommendation. It should be revisited if the product scope changes significantly, the team grows beyond solo/small, or Supabase's pricing/capabilities shift. The core thesis — one cohesive backend platform instead of a Frankenstack — should hold regardless.*
