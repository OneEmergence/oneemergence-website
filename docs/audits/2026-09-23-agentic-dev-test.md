# Agentic Dev Test — 2026-09-23

Branch `agentic-dev-test` (from `dev`). First run of the two coordinated roles in
`.claude/agents/`. They worked in parallel in one checkout with disjoint file
ownership. For this run the i18n files were split by namespace: `guide` →
app-architect, everything else → frontend-artist. The coordinating agent
integrated, built, tested and committed.

## Lane 1: frontend-artist (homepage)

**Critique of the old page:** five sections with the same eyebrow → serif h2 → paragraph rhythm.
The page stayed cosmic for about 4,300 px without the promised cosmic → solarpunk → warm
descent. It had two near-identical card grids (one with placeholder content), more than 8
competing CTAs, and no link to `/map` or `/portal`. Everything was one 397-line client component
with hardcoded German strings.

**Outcome:** the homepage is a descent through the three depths.
- **Hero:** an "ecliptic" line with three orbs: I · Kosmos → `/library`,
  II · Solarpunk → `/map`, III · Wärme → `/portal`. On mobile it becomes a vertical descent.
- **Signature moment:** hover or focus on a path tints the sky toward that depth.
- **Below the hero:** three full-width depth stages. Newest library items as a typographic list;
  the world-map image as a window; the warm portal room with an honest note about activation.
- **Rendering:** a Server Component with the new `home` i18n namespace. Depth transitions reuse
  the story-page `.oe-stage` CSS, so they need no JS. The only client leaf is `HomeHeroDrift`,
  gated to Flow level.
- **Removed:** `LivingPortalClient.tsx`, the placeholder Experiences grid and the newsletter block
  (`/manifesto` and `/experiences` keep it).
- **Screenshots:** local `tmp/artist-home/` (ignored).

## Lane 2: app-architect (Guide reliability, ROADMAP item 3, first half)

**Defect fixed:** the conversation and user message were inserted before the provider call.
When the provider failed, the client never got the `conversationId`, so a retry created a second
conversation and left an unanswered orphan message.

**Outcome:**
- **Stable ids:** the client creates a stable conversation UUID (same pattern as the journal). The
  server resolves it through the owner or creates it with `onConflictDoNothing`. A foreign id
  returns 404.
- **Error responses:** every error after the conversation exists includes `conversationId`.
- **Retry:** reuses an identical unanswered user message instead of inserting it again.
- **Cancel:** an AbortController in the UI (the stop button replaces send) and
  `abortSignal: request.signal` on `generateObject`.
- **Daily limit:** `GUIDE_DAILY_LIMIT` (env, default 50) is counted from existing
  `guide_messages` over 24 h, so no schema change was needed. Over the limit the API returns 429
  with `code: 'limit_reached'`.
- **Pure decision functions:** `src/features/guide/reliability.ts`, covered by
  `tests/guide/reliability.spec.ts`.

## Verification (coordinator, production build)

| Command | Result |
|---|---|
| `pnpm check` (lint + tsc) | green |
| `pnpm test:journal-autosave` (unit config, now incl. guide) | 12 passed |
| `pnpm build` | green, `/` prerendered static |
| `pnpm exec playwright test tests/smoke tests/a11y tests/content tests/environment --project=chromium` (production server started by Playwright) | **141 passed, 2 skipped, 0 failed** |

Local Chromium had to be installed first (`pnpm exec playwright install chromium`).
The first run failed on browser launch, not on application code.
`tests/smoke/contact-intent.spec.ts` no longer expects the newsletter block on `/`.

## Not verified

- **Guide against a live DB/provider:** the 429 path with real rows, retry reuse, the foreign-id
  404, and whether Next fires `request.signal` on client disconnect in the Node runtime.
- **Homepage:** Immersive mode was not screenshotted; LCP/CLS not measured. EN strings exist but
  are not publicly reachable (the public provider pins `de`).
- **Known gaps (by design, marked in code):**
  - Cancel-and-retry of the same message is not counted again against the limit.
  - A lost *response* (assistant saved, client failed) retries as a new turn.

## Next

1. **Guide:** show "send again" after a reload when the last message is an unanswered user
   message. Then the streaming/AG-UI slice.
2. **Frontend:** carry the depth/ecliptic mark into the `/library` header (I · Kosmos), with axe
   in Still and Balanced.
3. **Housekeeping:** rename `test:journal-autosave` to `test:unit` (keep the old alias; update
   `ci.yml` and ENGINEERING.md).

---

## Run 2: the three "Next" items

- **frontend-artist, `/library` as the arrival of depth I:**
  - Cosmic atmosphere instead of solarpunk. The header is now static server markup with
    "I · Kosmos", the ecliptic line and an onward link "weiter hinab · II · Emergence Map" → `/map`;
    on mobile it becomes a vertical drop.
  - `DepthMark` is now shared in `src/components/ui/`. New `library` i18n namespace; filter pills use
    `aria-pressed`. Immersive screenshots of home and library taken (`tmp/artist-library/`).
- **app-architect, retry after reload:**
  - `/inner/guide/[id]` detects an unanswered user message at the end (`unansweredTail`) and offers
    "send again". The server reuses the stored row, so there is no duplicate.
  - Focus moves to retry or the composer after a request ends.
  - Lost *responses* deliberately stay open: a text match would wrongly repeat old answers when the
    same text is sent twice. It needs a `retry` flag in the request contract (its own slice).
- **coordinator:** `pnpm test:unit` replaces `test:journal-autosave` (alias kept); CI, README and
  ENGINEERING.md updated.

| Command | Result |
|---|---|
| `pnpm check` | green |
| `pnpm test:unit` | 14 passed |
| `pnpm build` | green |
| Playwright smoke/a11y/content/environment, chromium, production server | **141 passed, 2 skipped, 0 failed** |

**Still unverified:** everything the Guide does against a live DB/provider; focus behaviour in a
real browser in the portal; LCP/CLS.

**Next:**
1. **Guide:** a `retry` flag for lost responses (the stored answer is returned without a provider
   call), then streaming/AG-UI.
2. **Frontend:** `/map` header as II · Solarpunk with an onward link to III (coordinate with the
   world-map plan).
3. **i18n:** give `PublicIntlProvider` a `timeZone`, then card dates via `useFormatter`.
   Library type labels in `src/lib/content/library-types.ts` are still German.

---

## Run 3: four parallel lanes plus review

The coordinator ran four agents at once in one checkout, each owning its own files. Three wrote code, one reviewed read-only. The coordinator corrected, integrated, built, tested and committed (`efcb927`..`4fde618`).

- **app-architect, lost Guide responses (ROADMAP item 3):**
  - **Problem:** the server saved a reply but the client never received it. Retrying created a new turn: a duplicate user row, a second provider call and another tick against the daily limit.
  - **Fix:** retries now send `retry: true`. When the stored tail is [identical user message, reply], the server returns that reply with no provider call, no insert and no limit tick. The decision is the pure `decideGuideTurn` in `reliability.ts`, covered by 5 new unit tests.
  - **Coordinator correction:** my brief was ambiguous, and the agent also put *reuse* of an unanswered tail behind the flag. That would have brought back duplicate rows for older bundles and for retyped text. Reuse is safe on a text match, because no reply exists that could be wrongly repeated. Only replay needs the flag.
- **frontend-artist A, deterministic dates + reading pages in depth I:**
  - **Problem:** next-intl had no `timeZone`. The client-side library cards formatted dates in the browser's zone, the prerendered HTML in UTC. Visitors west of UTC saw a day shift and got a hydration mismatch.
  - **Fix:** `request.ts` now sets `Europe/Berlin` once. next-intl 4.14.2 passes the zone through server-rendered `NextIntlClientProvider`s (`react-server/NextIntlClientProviderServer.js`: `timeZone ?? await getTimeZone()`). Library, journal and `ContentGrid` dates use the next-intl formatter. Output is unchanged; `<time>` elements now carry `dateTime`.
  - **Reading pages:** `/library/[type]/[slug]` opens with the shared `DepthMark` (I · Kosmos) and ends with the descent row to `/map`.
- **frontend-artist B, `/events` in depth III** (the agent's pick after reviewing five pages):
  - **Before:** all six hardcoded gatherings were dated 2025, so every visitor saw only the empty state. That state promised a sign-up form that didn't exist, and "Nächstes Event" on `/community` led back to it. The page was entirely `"use client"`, with ungated motion and the h1 at opacity 0 until hydration.
  - **Now:** a Server Component with an `events` namespace (DE/EN), warm atmosphere and `DepthMark` III. An honest empty state leads to `/contact` ("Einladung anfragen"), and the page continues on to `/portal`.
  - **Removed:** the unreachable event data. It remains in git history (`8ff2bff`).
- **Coordinator:**
  - **Portal dashboard:** the greeting (`getHours()`) and the date were computed in each runtime's own zone. For Berlin users, server and browser disagreed around every greeting boundary. Both now use the zone the portal inherits from `request.ts`.
  - **New `tests/i18n/messages-parity.spec.ts`** in the unit tier, which CI runs. It fails when a key exists in only one of DE/EN. Before the run: 483 = 483 keys. After three agents edited the files in parallel: still equal.

### Review of runs 1–2 (read-only)

**Scope:** `git diff dev...HEAD` of the first 8 branch commits, pinned to `8ff2bff`.

**Verified as sound:**
- Ownership check for a client-supplied `conversationId`: a foreign id → `onConflictDoNothing` → 404, with no leak and no overwrite.
- Abort consistency: an unanswered tail, by design.
- DE/EN keys of the new namespaces.
- Hydration safety of `HomeHeroDrift`.

**Open findings, not fixed in this run:**

1. **Medium-high: the daily limit has a count-then-insert race** (`src/app/api/guide/route.ts`). Count and insert are separate round trips with no lock.
   - *Failure:* parallel requests at 49/50 all pass; a script gets well over `GUIDE_DAILY_LIMIT` paid calls.
   - *Fix:* count + insert in one transaction with a per-user `pg_advisory_xact_lock`. It needs a check against real Postgres, so it wasn't done blind here.
2. **Medium: cancel-and-retry of the same message** never counts again against the limit and triggers a new provider call each time. This was already known and is marked `ponytail:` in the route.
   - *Fix:* an attempt counter per message.
3. **Low: duplicate bubble in the client.** A first message that failed offline and is re-sent as text through the composer (instead of the retry button) shows twice, while the server stores one row.
   - *Fix:* allow only the retry button while a failure is shown.

### Verification (coordinator)

| Command | Result |
|---|---|
| `pnpm check` (lint + tsc) | green |
| `pnpm test:unit` | **20 passed** (10 Guide, 9 Journal, 1 i18n parity) |
| `pnpm build` | green, no `ENVIRONMENT_FALLBACK`; `/events` ○ static, `/library/[type]/[slug]` and `/journal/[slug]` ● SSG (prerendering preserved) |
| Playwright smoke/a11y/content/environment, chromium, **production server** (`pnpm start` on 127.0.0.1:3000 from the build above, reused via `PLAYWRIGHT_BASE_URL`) | **141 passed, 2 skipped, 0 failed** (3.8 min), the same as runs 1–2 |
| `curl` against that server | `/events` shows the new copy, the old eyebrow is gone; the reading page shows the descent row and `<time dateTime="2026-03-20">20. März 2026</time>` |

### Not verified

- **Guide:** the replay path has never run against a live DB or provider. Only the pure decision function is tested; the route branch that exits before the limit count is not.
- **Visual:** no lane took screenshots. Not checked: contrast of the warm atmosphere behind `/events` text, the focus ring of the closing `DepthMark` link, and the stacked end of the reading page (Community box plus descent row, two onward paths).
- **Dashboard fix:** typechecked only. The portal requires sign-in, and the public suites don't reach it.

### Next

1. **Guide, atomic limit (review finding 1):** count and insert in one transaction with a per-user advisory lock, checked against local PostgreSQL (like `test:journal-lifecycle`). Done when two parallel requests at 49/50 give exactly one 200 and one 429.
2. **Guide:** a route-level test with stubbed `db`/provider. Done when `retry: true` against a stored [user X, reply Y] returns 200 with Y and runs no count query, no insert and no provider call, even at the limit.
3. **`/community`:** the same upgrade as `/events` (Server Component, namespace, depth, `ButtonLink` instead of `router.push`).
4. **i18n:** move the German literals in `library/[type]/[slug]` and `journal/[slug]` to next-intl (reusing `common.*`).
5. **Decide:** whether the reading page keeps the Community box next to the descent row.
6. **Stays with the world-map plan:** `/map` header as II · Solarpunk.
