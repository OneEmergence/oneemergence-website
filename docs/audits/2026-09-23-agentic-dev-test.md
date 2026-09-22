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
