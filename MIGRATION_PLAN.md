# OneEmergence — Supabase Migration Plan

> Step-by-step plan to move from the current Neon + Auth.js setup to Supabase.
> No live credentials required to follow this plan. All code changes can be prepared offline.

---

## Current State

| Component | Status | Code Location |
|---|---|---|
| Database driver | Neon (`@neondatabase/serverless`) | `src/lib/db/index.ts` |
| ORM | Drizzle ORM | `src/lib/db/schema.ts` |
| Auth | Auth.js v5 beta + Drizzle adapter | `src/lib/auth/` |
| Auth middleware | NextAuth middleware | `middleware.ts` |
| Portal components | Sign-in via `signIn()` / `signOut()` | `src/app/(portal)/` |
| Database | **Not provisioned** — graceful null fallback | `requireDb()` pattern |
| Storage | **None** | — |
| Realtime | **None** | — |

**Key insight:** No database has ever been provisioned. No users exist. No data to migrate. This is a greenfield provisioning dressed as a migration.

---

## Phase 1: Environment Setup (No Code Changes)

### 1.1 Create Supabase Project
- Go to [supabase.com](https://supabase.com) → New Project
- **Region:** Frankfurt (eu-central-1) — EU data residency
- **Database password:** generate and store securely
- Note the project URL and keys from Settings → API

### 1.2 Configure OAuth Providers
In Supabase Dashboard → Authentication → Providers:
- **Google:** Enter Client ID + Secret (from Google Cloud Console)
- **GitHub:** Enter Client ID + Secret (from GitHub Developer Settings)
- Set redirect URL to `https://your-domain.com` (and `http://localhost:3000` for dev)

### 1.3 Enable Extensions
In Supabase Dashboard → Database → Extensions:
- Enable `pgvector`
- Enable `moddatetime` (may already be enabled)
- `pgcrypto` is enabled by default

### 1.4 Apply Database Schema
Run the SQL scripts from `database/` in order (00 → 09) via Supabase SQL Editor.
Skip `10_seed_dev.sql` for production.

### 1.5 Collect Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

---

## Phase 2: Dependency Swap

### 2.1 Install Supabase Packages
```bash
npm install @supabase/supabase-js @supabase/ssr postgres
```

### 2.2 Remove Auth.js and Neon Packages
```bash
npm uninstall next-auth @auth/drizzle-adapter @auth/core @neondatabase/serverless
```

### 2.3 Update Drizzle Config
Update `drizzle.config.ts` to use the new `DATABASE_URL` format (Supabase pooler URL).

---

## Phase 3: Database Client (`src/lib/db/`)

### 3.1 Replace `src/lib/db/index.ts`

**Before (Neon):**
```typescript
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
```

**After (Supabase Postgres via postgres-js):**
```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  const client = postgres(url, { prepare: false }) // prepare: false for Supabase pooler
  return drizzle(client, { schema })
}

export const db = createDb()
export type Database = NonNullable<ReturnType<typeof createDb>>

export function requireDb(): Database {
  if (!db) throw new Error('DATABASE_URL required')
  return db
}
```

### 3.2 Update `src/lib/db/schema.ts`

Major changes:
1. **Remove Auth.js tables:** `users`, `accounts`, `sessions`, `verificationTokens` — Supabase Auth manages these in its own `auth` schema
2. **Change `userId` type:** From `text` to `uuid`, referencing `auth.users(id)` conceptually (Drizzle doesn't cross-schema reference, so just use `uuid` type)
3. **Add new tables:** `profiles`, `practice_sessions`, `saved_practices`, `practice_streaks`
4. **Use Postgres enums** where the SQL schema defines them (or keep text with check constraints for Drizzle compatibility)

The Drizzle schema should mirror the SQL in `database/02-05_tables_*.sql`. The SQL is the source of truth; the Drizzle schema provides TypeScript types.

---

## Phase 4: Auth System (`src/lib/auth/`)

### 4.1 Create Supabase Client Utilities

**New file: `src/lib/supabase/server.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

**New file: `src/lib/supabase/client.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**New file: `src/lib/supabase/middleware.ts`**
```typescript
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /inner/* routes — redirect to /portal if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/inner')) {
    const url = request.nextUrl.clone()
    url.pathname = '/portal'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
```

### 4.2 Replace `src/lib/auth/session.ts`

**New session helpers:**
```typescript
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) throw new Error('Authentication required')
  return user
}
```

### 4.3 Update `middleware.ts`

Replace Auth.js middleware with Supabase session refresh:
```typescript
import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/inner/:path*', '/portal/:path*'],
}
```

### 4.4 Remove Auth.js Files
- Delete `src/lib/auth/config.ts` (Auth.js config)
- Delete or replace `src/lib/auth/index.ts`
- Remove `AdapterAccountType` import from schema

---

## Phase 5: Portal Components (~3-4 files)

### 5.1 Portal Entry (`/portal`)

Replace Auth.js `signIn()` calls with Supabase Auth:

**Before:**
```typescript
import { signIn } from '@/lib/auth'
// ...
<button onClick={() => signIn('google')}>Sign in with Google</button>
```

**After:**
```typescript
import { createClient } from '@/lib/supabase/client'
// ...
const supabase = createClient()
<button onClick={() => supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${location.origin}/inner` }
})}>Sign in with Google</button>
```

### 5.2 Sign Out

**Before:** `signOut()` from Auth.js
**After:** `supabase.auth.signOut()` then `router.push('/')`

### 5.3 User Display (Sidebar, Dashboard)

**Before:** `session.user.name`, `session.user.image`
**After:** `user.user_metadata.full_name`, `user.user_metadata.avatar_url`

Or better: read from `profiles` table via server component.

### 5.4 Files to Update

| File | Change |
|---|---|
| `src/app/(portal)/portal/page.tsx` | Replace signIn() calls |
| `src/app/(portal)/inner/PortalSidebar.tsx` | Replace session/user access |
| `src/app/(portal)/inner/page.tsx` | Replace getCurrentUser pattern |
| `src/app/(portal)/inner/layout.tsx` | Replace auth check if present |
| `src/app/api/guide/route.ts` | Replace auth check |

---

## Phase 6: Server Actions

### 6.1 Pattern Change

**Before (Auth.js session check):**
```typescript
const session = await auth()
if (!session?.user?.id) throw new Error('Unauthorized')
const userId = session.user.id
```

**After (Supabase auth check):**
```typescript
const user = await requireAuth()
const userId = user.id // UUID from Supabase Auth
```

### 6.2 Files to Update

All server actions that call `auth()` or check session:
- `src/lib/actions/journal.ts`
- `src/lib/actions/guide.ts`
- `src/lib/actions/preferences.ts`
- `src/features/map/actions.ts`
- `src/features/journal/actions.ts` (if separate)
- `src/app/api/guide/route.ts`

### 6.3 userId Type Change

Auth.js used `text` IDs (sometimes cuid or uuid strings). Supabase Auth uses UUID. The Drizzle schema column types change from `text` to `uuid`. Existing server actions that construct or compare userId values may need updates if they assumed string format.

---

## Phase 7: Storage Setup

### 7.1 Create Buckets (Supabase Dashboard → Storage)

| Bucket | Access | Purpose |
|---|---|---|
| `soundscapes` | Public | Meditation audio, ambient sounds |
| `user-uploads` | Private (RLS) | Profile images, vision board content |

### 7.2 Storage Policies

```sql
-- Public bucket: anyone can read soundscapes
create policy "Public soundscape access"
  on storage.objects for select
  using (bucket_id = 'soundscapes');

-- Private bucket: users can only access their own uploads
create policy "Users manage own uploads"
  on storage.objects for all
  using (bucket_id = 'user-uploads' and auth.uid()::text = (storage.foldername(name))[1]);
```

### 7.3 Upload Pattern

```typescript
const supabase = createClient()
const { data, error } = await supabase.storage
  .from('user-uploads')
  .upload(`${userId}/avatar.jpg`, file)
```

---

## Phase 8: Update Environment & Documentation

### 8.1 Update `.env.example`

Replace Auth.js variables with Supabase variables (see STACK_DECISION.md).

### 8.2 Update `ARCHITECTURE.md`

Update the Intelligence Stack table:
- Auth: Auth.js → Supabase Auth
- Database: Neon → Supabase Postgres
- Storage: None → Supabase Storage
- Realtime: Deferred → Supabase Realtime (v3)

### 8.3 Update `README.md`

Add Supabase local development instructions:
```bash
# Install Supabase CLI
npm i -D supabase

# Initialize (first time)
npx supabase init

# Start local Supabase
npx supabase start

# Apply schema
cat database/0[0-9]_*.sql | psql postgresql://postgres:postgres@localhost:54322/postgres

# Generate types
npx supabase gen types typescript --local > src/types/database.ts
```

---

## Phase 9: Validation

### 9.1 Build Check
```bash
npm run build  # Must pass with zero errors
```

### 9.2 Test Suite
```bash
npx playwright test  # All existing tests must pass
```

### 9.3 Manual Flow Testing
1. Open `/portal` → see threshold experience
2. Click Google sign-in → redirects to Google → returns authenticated
3. `/inner` → dashboard loads with user greeting
4. Create journal entry → saves, appears in list
5. Open Guide → send message → response renders
6. Open Map → nodes visible, can create new ones
7. Open Practice → timer works, session logged
8. Sign out → redirected to public site
9. Try `/inner` unauthenticated → redirected to `/portal`

### 9.4 RLS Verification
With two test users, verify:
- User A cannot see User B's journal entries
- User A cannot see User B's guide conversations
- User A cannot see User B's map nodes
- Direct Supabase client query with User A's token returns only User A's data

---

## Phase 10: Deploy

### 10.1 Vercel Environment Variables
Add to Vercel project settings:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `ANTHROPIC_API_KEY`

### 10.2 Remove Old Variables
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- `NEXTAUTH_URL`

### 10.3 Deploy
```bash
git push origin main  # Triggers Vercel deployment
```

---

## Refactoring Scope Summary

| Area | Files to Change | Effort |
|---|---|---|
| Database client | 1 file (`src/lib/db/index.ts`) | 15 min |
| Drizzle schema | 1 file (`src/lib/db/schema.ts`) | 1 hour |
| Auth system | 3-4 new files in `src/lib/supabase/` | 1 hour |
| Middleware | 1 file (`middleware.ts`) | 15 min |
| Portal components | 3-4 files (sign-in/out, sidebar, dashboard) | 1 hour |
| Server actions | 5-6 files (auth check pattern) | 30 min |
| API routes | 1 file (`src/app/api/guide/route.ts`) | 15 min |
| Environment | `.env.example`, Vercel settings | 15 min |
| Documentation | `README.md`, `ARCHITECTURE.md` | 30 min |
| **Total** | **~15-20 files** | **~5 hours** |

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Auth.js components deeply integrated | Medium | The current Auth.js integration is thin (~4 files). No deep coupling. |
| userId type change (text → uuid) | Low | No data exists. Schema change is safe. Drizzle handles UUID type natively. |
| Supabase free tier limits | Low | 500MB DB, 1GB storage, 50K auth users — far beyond MVP needs |
| OAuth redirect URL mismatch | Low | Configure both production and localhost URLs in Supabase Dashboard |
| Drizzle + Supabase pooler compatibility | Low | Use `prepare: false` option in postgres-js. Well-documented. |
| RLS blocking legitimate queries | Medium | Test RLS policies in Supabase SQL Editor before deploying. Seed data helps. |

---

## What This Plan Does NOT Cover

- **Supabase Edge Functions** — not needed. All server logic stays in Next.js.
- **Supabase Realtime** — deferred to v3. Schema is designed to support it.
- **pgvector embedding pipeline** — deferred. Columns exist. Async generation added later.
- **Storage upload UI** — deferred. Buckets created but no upload components yet.
- **Supabase self-hosting** — not needed. Frankfurt region satisfies EU requirements.

---

*This plan assumes the database SQL scripts in `database/` are the source of truth for the schema. The Drizzle schema in `src/lib/db/schema.ts` should be updated to match these SQL definitions during the migration.*
