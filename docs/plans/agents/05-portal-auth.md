# Agent 05 — Portal & Auth

> Build the authenticated inner space: auth system, database, portal entry, dashboard, journal, and ritual room.

---

## Mission

Create the personal inner space layer — the product core where users do their daily inner work. This includes authentication, database infrastructure, the portal entry threshold experience, inner state dashboard, journal system with mood tags and reflection graph, and the meditation/ritual room foundation.

## Scope

### In Scope
- Auth system (Auth.js or Better Auth) with OAuth providers (Google, GitHub, email/password)
- Portal Entry threshold experience (not a login form — a passage)
- Postgres database schema (users, journal entries, practices, preferences)
- `(portal)` route group with auth middleware
- Inner State Dashboard with daily impulse and focus themes
- Journal system: create, edit, view entries with mood tags, theme clusters
- Journal reflection graph visualization (simple graph of entries over time, themes)
- Meditation & Ritual Room: timer, basic soundscapes, breathwork flows
- Server actions for all mutations
- User preferences (intensity mode, audio, focus themes) persisted to DB

### Out of Scope
- AI Guide integration (Agent 6)
- Consciousness Map (Agent 7)
- Collective Field features (v3)
- Learning Pathways (v2 but after core portal)
- Dream / Vision Space (v2+)
- Stripe payments (v3)
- Full soundscape library (just basics)

## Dependencies / Prerequisites
- **Agents 1, 2, 3** complete (architecture, design system, content system)
- **Agent 4** stable (public layer working, no ongoing structural changes)
- Needs: Postgres provider decision (Neon vs Supabase) — recommend Neon for simplicity
- Needs: Auth provider decision — plan assumes Auth.js (Next-Auth v5)

## Repository Areas Touched

```
src/app/(portal)/                    # New: all portal routes
src/app/(portal)/portal/page.tsx     # New: threshold entry experience
src/app/(portal)/inner/              # New: dashboard, journal, practice, rituals
src/lib/auth/                        # New: auth config, session helpers
src/lib/actions/                     # New: server actions for journal, practice, preferences
src/lib/db/                          # New: database client, schema, migrations
src/features/journal/                # New: journal feature module
src/features/rituals/                # New: practice/ritual feature module
src/stores/audio.ts                  # New: audio state store
src/stores/preferences.ts           # New: user preferences store
middleware.ts                        # New: auth middleware
package.json                         # New: next-auth, @auth/core, drizzle-orm, @neondatabase/serverless
```

## Detailed Task Breakdown

### Phase 1: Database Infrastructure

**Task 1.1: Choose and provision Postgres**
- Neon (recommended): serverless, EU regions available, generous free tier
- Create project, get connection string
- Store in `.env.local` (never commit)

**Task 1.2: Set up Drizzle ORM**
- Install `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`
- Create `src/lib/db/index.ts` — database client
- Create `src/lib/db/schema.ts` — table definitions

**Task 1.3: Define database schema**
```typescript
// Tables:
// users — id, email, name, image, createdAt, preferences (jsonb)
// accounts — OAuth accounts (Auth.js managed)
// sessions — session management (Auth.js managed)
// journal_entries — id, userId, title, content, moodTags, themes, createdAt, updatedAt
// practices — id, userId, type, duration, completedAt, notes
// user_preferences — id, userId, intensityMode, audioEnabled, focusThemes
```

**Task 1.4: Create initial migration**
- `drizzle-kit generate` for initial schema
- `drizzle-kit push` to apply

### Phase 2: Authentication System

**Task 2.1: Install and configure Auth.js**
- Install `next-auth@beta`, `@auth/drizzle-adapter`
- Create `src/lib/auth/config.ts` — auth configuration
- Create `src/lib/auth/index.ts` — `auth()`, `signIn()`, `signOut()` exports
- Configure Drizzle adapter for session/account storage

**Task 2.2: Configure OAuth providers**
- Google OAuth (primary)
- GitHub OAuth (developer audience)
- Email/password with email verification (via Resend or similar)
- Store credentials in env vars

**Task 2.3: Create auth middleware**
```typescript
// middleware.ts
// - Protect all /inner/* routes
// - Redirect unauthenticated users to /portal (threshold)
// - Allow /portal route for auth flow
// - Pass session to server components via headers/cookies
```

**Task 2.4: Create session helpers**
```typescript
// src/lib/auth/session.ts
// - getCurrentUser() — server-side, returns user or null
// - requireAuth() — server-side, throws redirect if not authenticated
// - useSession() — client-side hook for session state
```

### Phase 3: Portal Entry Experience

**Task 3.1: Design Portal Entry page**
- `src/app/(portal)/portal/page.tsx`
- This is NOT a login form. It is a **threshold experience**.
- Visual: dark space with a gently glowing portal/doorway
- Text: invitation to enter ("Cross the threshold into your inner space")
- Auth options appear elegantly, not as a corporate login box
- Animated transition from public site feel to personal space feel

**Task 3.2: Implement sign-in flow**
- OAuth buttons styled as OE brand elements
- Email sign-in option
- Loading state during auth
- Error states with graceful messaging
- Success: animated transition to dashboard

**Task 3.3: First-time user onboarding**
- After first login, brief onboarding flow:
  1. Welcome message
  2. Intensity mode selection
  3. Focus themes selection (what are you interested in?)
  4. Dashboard reveal
- Stored in user preferences

### Phase 4: Inner State Dashboard

**Task 4.1: Create dashboard layout**
- `src/app/(portal)/inner/page.tsx`
- Portal layout: different nav style (sidebar or minimal top nav)
- Warm, intimate feeling — "well-lit study" not corporate dashboard
- Responsive: works on mobile as primary use case

**Task 4.2: Dashboard components**
- **Daily Impulse** — a teaching/reflection snippet that changes daily (seeded by date)
- **Journal streak** — how many consecutive days user has journaled
- **Last session summary** — what they did last time
- **Focus themes** — user's selected themes with related content
- **Quick actions** — Journal, Practice, Guide (when available)

**Task 4.3: Create portal layout**
```typescript
// src/app/(portal)/inner/layout.tsx
// - Sidebar navigation (Journal, Practice, Map, Guide, Paths, Visions, Rituals)
// - User avatar/menu
// - IntensityToggle
// - Minimal, warm design
```

### Phase 5: Journal System

**Task 5.1: Create journal feature module**
```
src/features/journal/
├── components/
│   ├── JournalEditor.tsx      # Rich text editor for entries
│   ├── JournalEntryCard.tsx   # Entry preview card
│   ├── JournalList.tsx        # List of entries
│   ├── MoodTagSelector.tsx    # Mood tag picker
│   └── ReflectionGraph.tsx    # Visual graph of entries/themes
├── actions.ts                  # Server actions
├── schemas.ts                  # Zod schemas for journal
└── types.ts                    # TypeScript types
```

**Task 5.2: Journal server actions**
```typescript
// src/features/journal/actions.ts
'use server'
// - createEntry(data: JournalEntryInput): Promise<JournalEntry>
// - updateEntry(id: string, data: Partial<JournalEntryInput>): Promise<JournalEntry>
// - deleteEntry(id: string): Promise<void>
// - getEntries(userId: string, filters?: JournalFilters): Promise<JournalEntry[]>
// - getEntry(id: string): Promise<JournalEntry>
```

**Task 5.3: Journal Editor**
- Rich text editor (recommend: Tiptap or simple textarea with markdown)
- Mood tag selector (predefined tags: calm, restless, grateful, anxious, inspired, heavy, light, etc.)
- Theme auto-detection from content (simple keyword matching initially, AI later)
- Auto-save with debounce
- Mobile-friendly

**Task 5.4: Journal List & Filtering**
- Chronological list of entries
- Filter by mood tag, theme, date range
- Search within entries
- Entry preview cards with mood indicators

**Task 5.5: Reflection Graph**
- Simple visualization of journaling patterns
- X-axis: time, Y-axis: frequency
- Mood distribution over time
- Theme clusters (which themes appear together)
- Use a lightweight charting solution (recharts or custom SVG)

**Task 5.6: Journal routes**
```
src/app/(portal)/inner/journal/
├── page.tsx              # Journal list
├── new/page.tsx          # New entry
└── [id]/page.tsx         # View/edit entry
```

### Phase 6: Meditation & Ritual Room

**Task 6.1: Create ritual feature module**
```
src/features/rituals/
├── components/
│   ├── MeditationTimer.tsx    # Countdown/count-up timer
│   ├── BreathworkGuide.tsx    # Breathing pattern visualizer
│   ├── SoundscapePlayer.tsx   # Ambient sound player
│   └── PracticeComplete.tsx   # Completion screen
├── actions.ts                  # Log practice sessions
├── sounds/                     # Audio file references
└── types.ts
```

**Task 6.2: Meditation Timer**
- Configurable duration (5, 10, 15, 20, 30 min or custom)
- Start, pause, reset controls
- Visual progress (circle/ring animation, gated by intensity mode)
- Optional bell at intervals
- Session completion logging (server action)

**Task 6.3: Breathwork Guide**
- Breathing patterns: Box breathing (4-4-4-4), 4-7-8, coherent breathing
- Visual guide: expanding/contracting circle synced to breath phase
- Configurable cycles
- Motion level: sacred

**Task 6.4: Soundscape Player**
- Basic ambient sounds: rain, forest, ocean, singing bowl, silence
- Audio files served from public/audio or CDN
- Volume control
- Uses AudioProvider context from existing layout

**Task 6.5: Practice routes**
```
src/app/(portal)/inner/practice/
├── page.tsx              # Practice room selection
├── meditation/page.tsx   # Meditation timer
├── breathwork/page.tsx   # Breathwork guide
└── history/page.tsx      # Practice history
```

### Phase 7: Server Actions & Data Layer

**Task 7.1: Create all server actions**
```typescript
// src/lib/actions/journal.ts — journal CRUD
// src/lib/actions/practice.ts — practice logging
// src/lib/actions/preferences.ts — user preference updates
// src/lib/actions/onboarding.ts — first-time setup
```

**Task 7.2: Data validation**
- All server actions validate input with Zod
- All actions verify user session before proceeding
- Error handling: typed errors, not generic strings

**Task 7.3: User preferences sync**
- Intensity mode persisted to DB (not just localStorage)
- Audio preferences persisted
- Focus themes persisted
- On login: hydrate Zustand stores from DB values

## Best Practices & Constraints

1. **Privacy is absolute.** Journal entries are encrypted at rest. No analytics on journal content. No sharing without explicit user action.
2. **Server actions for all mutations.** No API routes.
3. **Auth middleware is the single gate.** No client-side auth checks for route protection.
4. **Mobile-first for portal.** People do daily practice on their phones.
5. **No gamification for its own sake.** Journal streak is information, not a leaderboard.
6. **Progressive disclosure.** Don't overwhelm new users. Onboarding introduces features gradually.
7. **Auto-save journal entries.** Don't lose user's writing.

## Testing / Validation Checklist

- [ ] Auth flow works end-to-end (sign in, session, sign out)
- [ ] Unauthenticated users redirected from /inner/* to /portal
- [ ] Portal Entry renders as a threshold, not a login form
- [ ] Dashboard shows daily impulse and user data
- [ ] Journal CRUD works (create, read, update, delete)
- [ ] Mood tags saved and filterable
- [ ] Reflection graph renders with real data
- [ ] Meditation timer counts down correctly
- [ ] Breathwork guide animation syncs with breath phases
- [ ] Practice sessions logged to database
- [ ] User preferences persist across sessions
- [ ] Mobile layout is usable for all portal features
- [ ] `next build` passes

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| Auth.js v5 (beta) instability | Pin version, test thoroughly. Auth.js v5 is mature enough for production. |
| Database schema migrations | Use Drizzle migrations. Plan schema carefully before first deploy. |
| Journal editor complexity | Start simple (textarea + markdown). Don't build a Notion clone. |
| Audio on mobile browsers | Respect autoplay policies. User-initiated audio only. |
| Session handling with server components | Use `auth()` in server components, `useSession()` only in client islands. |
| Onboarding too complex | Keep it to 3 steps max. Make it skippable. |

## Handoff Outputs

- Working auth system with portal entry
- Database with users, journal, practice tables
- Inner state dashboard with daily impulse
- Complete journal system (CRUD, mood tags, reflection graph)
- Meditation timer and breathwork guide
- Server actions for all mutations
- `(portal)` route group fully protected
- Mobile-responsive portal layout

## Subagent Strategy

1. **Database schema agent** — Design complete schema, generate migrations, verify relationships
2. **Auth integration agent** — Handle Auth.js setup, OAuth configuration, middleware
3. **Journal editor agent** — Build the editor component, auto-save logic, mood tag UI
4. **Ritual room agent** — Build timer, breathwork, and soundscape components independently
5. **Dashboard layout agent** — Design and implement the inner space layout and navigation

## Commit Strategy

```
feat(db): set up Drizzle ORM with Neon Postgres, define schema
feat(auth): configure Auth.js with Google/GitHub/email providers
feat(auth): add auth middleware for portal route protection
feat(portal): create Portal Entry threshold experience
feat(portal): create inner space layout with sidebar navigation
feat(portal): build Inner State Dashboard with daily impulse
feat(journal): implement journal system with CRUD and mood tags
feat(journal): add reflection graph visualization
feat(rituals): build meditation timer with configurable duration
feat(rituals): add breathwork guide with visual pattern sync
feat(rituals): create soundscape player with ambient sounds
feat(actions): create server actions for journal, practice, preferences
feat(portal): add first-time user onboarding flow
```
