# Agent 08 — Quality Platform

> Set up Sentry monitoring, Playwright testing, CI pipeline, performance budgets, and accessibility enforcement.

---

## Status: Phase 2 In Progress (last updated 2026-03-30)

### Completed
- [x] **Sentry SDK** installed and configured (`@sentry/nextjs` v10)
  - `sentry.client.config.ts` — client-side: error tracking, performance traces, session replay
  - `sentry.server.config.ts` — server-side error tracking
  - `sentry.edge.config.ts` — edge runtime error tracking
  - `next.config.ts` — conditional `withSentryConfig()` wrapping (active only when `NEXT_PUBLIC_SENTRY_DSN` is set)
  - DSN-gated: Sentry is fully disabled when no DSN env var is present (zero overhead in dev)
- [x] **Error boundaries** created
  - `src/app/global-error.tsx` — root error boundary with Sentry capture
  - `src/app/error.tsx` — route-level error boundary with Sentry capture
  - Both styled with project brand (OE deep space, aurora violet)
- [x] **Playwright** installed and configured (`@playwright/test` + `@axe-core/playwright`)
  - `playwright.config.ts` — chromium + mobile (Pixel 5), trace on retry, screenshot on failure
  - `tests/utils.ts` — shared helpers (console error checking, axe-core wrapper, core layout assertions, LCP/CLS measurement)
- [x] **Smoke tests** for all 12 public routes (`tests/smoke/routes.spec.ts`)
  - Verifies: HTTP status, page title, core layout (nav/main/footer), no console errors
- [x] **Navigation tests** (`tests/smoke/navigation.spec.ts`)
  - Navbar links, footer links, mobile viewport (no horizontal scroll)
- [x] **Accessibility tests** with axe-core (`tests/a11y/accessibility.spec.ts`)
  - WCAG 2.0 A + AA scan on 10 public routes
  - Asserts no critical or serious violations
- [x] **Content validation** (`tests/content/content-validation.spec.ts`)
  - All journal markdown files exist and non-empty
  - Valid frontmatter with title field
  - Unique slugs
  - Route accessibility for each content file
- [x] **Performance budget tests** (`tests/performance/web-vitals.spec.ts`)
  - LCP measurement on homepage, manifesto, about (< 5s CI / < 3s local)
  - CLS measurement (< 0.25)
- [x] **GitHub Actions CI pipeline** (`.github/workflows/ci.yml`)
  - `quality` job: lint → type-check → build
  - `test` job: Playwright smoke, a11y, content tests (chromium only in CI)
  - Artifact upload on failure (playwright-report)
  - Concurrency grouping to cancel stale runs
- [x] **npm scripts** added: `test`, `test:smoke`, `test:a11y`, `test:content`, `test:perf`

### Phase 2 Completed (2026-03-30)
- [x] **Expanded smoke coverage** — `/library` and `/experiences` (Agent 4 routes) added to `tests/smoke/routes.spec.ts` (now 14 routes)
- [x] **Expanded a11y coverage** — `/library` and `/experiences` added to `tests/a11y/accessibility.spec.ts` (now 12 routes)
- [x] **Portal redirect smoke tests** — `tests/smoke/portal-redirects.spec.ts` created; verifies unauthenticated `/inner/*` redirects to `/portal`; gracefully skipped in CI when `NEXT_PUBLIC_SUPABASE_URL` is absent (commit 7d825c2)

### Deferred / Blocked
- [ ] **Custom Sentry breadcrumbs** (Task 1.6) — Deferred until intensity mode store (Agent 2) and content system (Agent 3) are stable. Breadcrumbs for route changes, intensity mode changes, and content type views should be added once those features are committed.
- [ ] **Bundle size analysis** — Deferred. Requires stable build output (currently blocked by Agent 2's uncommitted TypeScript changes).
- [ ] **Performance test thresholds tightening** — Current thresholds are relaxed (5s LCP in CI). Tighten to 2.5s once WebGL progressive enhancement and lazy-loading patterns are established by Agent 4.
- [ ] **Portal redirect tests in CI** — `tests/smoke/portal-redirects.spec.ts` exists but skips in CI; will activate once Supabase credentials are added as CI secrets.
- [ ] **Visual regression testing** — Out of scope per plan. Defer until design stabilizes.
- [ ] **Responsive smoke tests** (Task 3.3) — Touch target sizing and overlap detection deferred; basic mobile viewport tested in navigation spec.

### Decisions & Deviations
1. **Sentry wrapping is conditional** — `withSentryConfig()` only applies when `NEXT_PUBLIC_SENTRY_DSN` is set. This prevents build interference in dev and avoids the Turbopack compatibility issue observed with unconditional wrapping.
2. **Performance thresholds are relaxed** — LCP < 5s in CI (vs 2.5s target) and CLS < 0.25 (vs 0.1 target). CI environments have limited resources; strict thresholds should be enforced in production monitoring via Sentry, not in CI Playwright runs.
3. **Chromium-only in CI** — Mobile project runs locally but not in CI, per risk mitigation in original plan.
4. **Content validation uses `@playwright/test` runner** — Even for non-browser tests (frontmatter validation), using Playwright's test runner keeps one unified test framework. The route accessibility test within the content suite does need a browser.

### Blockers Observed
- **Build fails due to Agent 2 (Design System) uncommitted code** — `src/components/providers/IntensityProvider.tsx:18` has an implicit `any` type. This is a pre-existing issue, not caused by quality platform changes. Quality platform files have zero type errors.
- **Agent 1 (Architecture Migration) is actively restructuring routes** — Routes are being moved to `(marketing)` route group. Test URLs remain unchanged (route groups don't affect URLs). Tests should be stable across this migration.

---

## Mission

Build the quality infrastructure that keeps the project healthy as features are added. This means error monitoring from day one (Sentry), automated E2E testing (Playwright), a CI pipeline that enforces quality gates, performance budget checks, and accessibility testing. This agent works independently and continuously adapts as other agents add features.

## Scope

### In Scope
- Sentry SDK installation and configuration (errors, performance, session replay)
- Playwright installation and initial test suite
- Smoke tests for all existing routes
- Accessibility testing with axe-core in Playwright
- Performance budget enforcement (Lighthouse CI or custom)
- CI pipeline configuration (GitHub Actions)
- Bundle size analysis
- Content validation (all MDX files parse without errors)

### Out of Scope
- Writing unit tests for individual components (each agent tests its own work)
- Visual regression testing setup (complex, defer to after design stabilizes)
- Load testing
- Security scanning (defer to pre-launch)
- Deployment pipeline (Vercel handles this)

## Dependencies / Prerequisites
- None — this agent starts immediately
- Must adapt test suite as other agents add routes and features

## Repository Areas Touched

```
sentry.client.config.ts              # New: Sentry client init ✅
sentry.server.config.ts              # New: Sentry server init ✅
sentry.edge.config.ts                # New: Sentry edge init ✅
src/app/global-error.tsx              # New: Sentry error boundary ✅
src/app/error.tsx                     # New: Route error boundary ✅
playwright.config.ts                 # New: Playwright configuration ✅
tests/utils.ts                       # New: Test utilities ✅
tests/smoke/routes.spec.ts           # New: Route smoke tests ✅
tests/smoke/navigation.spec.ts       # New: Navigation tests ✅
tests/a11y/accessibility.spec.ts     # New: Accessibility tests ✅
tests/content/content-validation.spec.ts # New: Content validation ✅
tests/performance/web-vitals.spec.ts # New: LCP/CLS tests ✅
.github/workflows/ci.yml            # New: CI pipeline ✅
package.json                         # Modified: deps + scripts ✅
next.config.ts                       # Modified: Sentry plugin ✅
```

## Next Steps (for future runs)

1. **CI Supabase secrets** — Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as GitHub Actions secrets to activate portal redirect tests in CI
2. **Tighten performance thresholds** — LCP < 2.5s / CLS < 0.1 once WebGL lazy-loading (Agent 4) is in place
3. **Bundle size analysis** — Once Agent 2 design system is committed and build is clean
4. **Custom Sentry breadcrumbs** — Once intensity mode store (Agent 2) is stable
5. **Visual regression testing** — Once design system is stable
