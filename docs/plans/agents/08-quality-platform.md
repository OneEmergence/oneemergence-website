# Agent 08 — Quality Platform

> Set up Sentry monitoring, Playwright testing, CI pipeline, performance budgets, and accessibility enforcement.

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
src/lib/analytics/sentry.ts          # New: Sentry configuration
sentry.client.config.ts              # New: Sentry client init
sentry.server.config.ts              # New: Sentry server init
sentry.edge.config.ts                # New: Sentry edge init
playwright.config.ts                 # New: Playwright configuration
tests/                               # New: test directory
tests/smoke/                         # New: smoke tests
tests/a11y/                          # New: accessibility tests
tests/content/                       # New: content validation tests
.github/workflows/ci.yml             # New: CI pipeline
package.json                         # Modified: new deps
next.config.ts                       # Modified: Sentry plugin
```

## Detailed Task Breakdown

### Phase 1: Sentry Installation

**Task 1.1: Install Sentry SDK**
- `@sentry/nextjs`
- Run Sentry wizard or manual configuration
- Configure DSN from environment variable

**Task 1.2: Configure Sentry for Next.js**
```typescript
// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,        // 100% in dev, reduce in prod
  replaysSessionSampleRate: 0.1, // 10% session replay
  replaysOnErrorSampleRate: 1.0, // 100% replay on error
  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
})
```

**Task 1.3: Configure server-side Sentry**
- `sentry.server.config.ts` — server-side error tracking
- `sentry.edge.config.ts` — edge runtime (middleware)
- Source maps upload via `@sentry/nextjs` webpack plugin

**Task 1.4: Configure `next.config.ts` with Sentry**
- Wrap Next.js config with `withSentryConfig()`
- Enable source map upload
- Configure tunnel route if needed (ad-blocker bypass)

**Task 1.5: Create custom error boundary**
```typescript
// src/app/global-error.tsx — Sentry-integrated error boundary
// src/app/error.tsx — route-level error boundary
```

**Task 1.6: Add custom breadcrumbs**
- Route change tracking
- Intensity mode changes
- Content type viewed
- Journal entry events (without content — privacy!)

### Phase 2: Playwright Setup

**Task 2.1: Install Playwright**
- `@playwright/test`
- `npx playwright install` (install browsers)

**Task 2.2: Configure Playwright**
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && npm run start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
})
```

**Task 2.3: Create test utilities**
```typescript
// tests/utils.ts
// - Helper to navigate and wait for page load
// - Helper to check no console errors
// - Helper to run axe-core accessibility check
// - Helper to measure LCP
```

### Phase 3: Smoke Tests

**Task 3.1: Route smoke tests**
```typescript
// tests/smoke/routes.spec.ts
// For every public route:
// - Navigate to route
// - Verify page loads (no 500 error)
// - Verify no console errors
// - Verify page title is set
// - Verify no broken images
// - Verify critical elements exist (navbar, footer, main content)
```

Routes to test:
- `/` (homepage)
- `/manifesto`
- `/about`
- `/content`
- `/community`
- `/events`
- `/contact`
- `/legal/imprint`
- `/legal/privacy`
- `/journal/the-field-beneath-thought`
- `/journal/the-illusion-of-separation`
- `/journal/the-practice-of-presence`

**Task 3.2: Navigation smoke test**
```typescript
// tests/smoke/navigation.spec.ts
// - Click every nav link, verify it navigates correctly
// - Click footer links
// - Test mobile hamburger menu
// - Verify back button works
```

**Task 3.3: Responsive smoke test**
```typescript
// tests/smoke/responsive.spec.ts
// - Verify layout at: mobile (375px), tablet (768px), desktop (1280px), wide (1920px)
// - No horizontal scroll
// - No overlapping elements
// - Touch targets > 44px on mobile
```

### Phase 4: Accessibility Testing

**Task 4.1: Install axe-core integration**
- `@axe-core/playwright`

**Task 4.2: Create accessibility test suite**
```typescript
// tests/a11y/accessibility.spec.ts
// For every public route:
// - Run axe-core scan
// - Assert no critical or serious violations
// - Log warnings for moderate/minor issues
// - Test keyboard navigation (tab through all interactive elements)
// - Verify focus indicators are visible
```

**Task 4.3: Specific accessibility checks**
- Color contrast (WCAG AA minimum, AAA for text)
- Image alt text
- Form labels
- ARIA roles on interactive elements
- Skip navigation link
- Route transition announcements for screen readers

### Phase 5: Content Validation

**Task 5.1: Create content validation test**
```typescript
// tests/content/content-validation.spec.ts
// (This can be a Node.js test, not browser-based)
// - Scan all .md/.mdx files in src/content/
// - Parse frontmatter
// - Validate against Zod schemas (when Agent 3 has schemas ready)
// - Assert no parsing errors
// - Assert required fields present
// - Assert dates are valid
// - Assert slugs are unique
```

### Phase 6: Performance Budget

**Task 6.1: LCP measurement test**
```typescript
// tests/performance/lcp.spec.ts
// - Navigate to homepage
// - Measure LCP via Performance Observer
// - Assert LCP < 2.5s
// - Navigate to key pages, repeat
```

**Task 6.2: CLS measurement test**
```typescript
// tests/performance/cls.spec.ts
// - Navigate to homepage
// - Measure CLS via Performance Observer
// - Assert CLS < 0.1
// - Wait for all animations to complete
```

**Task 6.3: Bundle size check**
```typescript
// Script or test that:
// - Runs next build
// - Parses .next/build-manifest.json
// - Checks initial JS bundle < 150KB gzipped
// - Warns if any single page bundle is unusually large
```

### Phase 7: CI Pipeline

**Task 7.1: Create GitHub Actions workflow**
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit          # type-check
      - run: npm run build

  test:
    needs: quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

**Task 7.2: Add npm scripts**
```json
{
  "test": "playwright test",
  "test:smoke": "playwright test tests/smoke",
  "test:a11y": "playwright test tests/a11y",
  "test:perf": "playwright test tests/performance"
}
```

**Task 7.3: Branch protection recommendations**
- Document recommended branch protection rules:
  - CI must pass before merge
  - At least 1 review
  - No force push to main

## Best Practices & Constraints

1. **Sentry from day one, not day ninety.** Errors caught early are cheap to fix.
2. **Tests must be maintainable.** Write tests that break for real reasons, not for CSS class changes.
3. **No flaky tests.** If a test is flaky, fix or remove it. Don't retry blindly.
4. **Performance budgets are enforced, not aspirational.** If LCP > 2.5s in CI, the build fails.
5. **Accessibility is a requirement, not a nice-to-have.** axe-core violations block CI.
6. **Keep CI fast.** Target < 5 minutes total. Parallelize where possible.
7. **Adapt tests as features are added.** When Agent 4 adds Living Portal v2, add WebGL-specific tests.

## Testing / Validation Checklist

- [ ] Sentry captures errors in dev environment
- [ ] Sentry performance traces visible in dashboard
- [ ] All smoke tests pass locally
- [ ] Accessibility tests pass on all public routes
- [ ] Content validation catches intentionally broken frontmatter
- [ ] LCP test measures and asserts correctly
- [ ] CI pipeline runs on push and PR
- [ ] CI catches lint errors (test with intentional lint failure)
- [ ] CI catches type errors (test with intentional type error)
- [ ] CI catches test failures (test with intentional assertion failure)
- [ ] Playwright reports are archived on failure

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| Sentry SDK breaks Next.js build | Pin version, test upgrade separately |
| Playwright tests slow in CI | Limit to chromium only in CI, run mobile locally |
| LCP measurement flaky in CI | Allow margin (assert < 3s in CI, < 2.5s target) |
| Tests break with every UI change | Test behavior, not implementation details |
| CI costs with many PRs | Cache node_modules and Playwright browsers |
| Source maps expose code | Sentry source map upload is auth-gated, not public |

## Handoff Outputs

- Sentry configured and capturing errors + performance + replays
- Playwright test suite: smoke, accessibility, performance
- Content validation for MDX files
- GitHub Actions CI pipeline
- npm scripts for local test runs
- Error boundary components
- Custom Sentry breadcrumbs for key user interactions

## Subagent Strategy

1. **Sentry setup agent** — Handle Sentry installation, configuration, and verification
2. **Playwright test writer agent** — Write all smoke and accessibility tests
3. **CI pipeline agent** — Create and test GitHub Actions workflow
4. **Performance measurement agent** — Build LCP/CLS/bundle measurement tooling

## Commit Strategy

```
feat(monitoring): install and configure Sentry with error tracking and performance
feat(monitoring): add custom error boundaries and Sentry breadcrumbs
feat(testing): install Playwright and create configuration
feat(testing): add smoke tests for all public routes
feat(testing): add accessibility tests with axe-core
feat(testing): add content validation tests
feat(testing): add performance budget tests (LCP, CLS, bundle size)
feat(ci): create GitHub Actions CI pipeline
chore: add test npm scripts
```
