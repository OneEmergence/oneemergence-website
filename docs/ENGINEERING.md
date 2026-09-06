# Engineering workflow

This is the operating guide for local work and agent handoffs. Product priorities
and dated verification results belong in [ROADMAP.md](./ROADMAP.md); architecture
constraints and skill routing belong in [AGENTS.md](../AGENTS.md).

## Start locally

Use Node 22 and the pnpm version pinned in `package.json` (11.1.3). From the
repository root:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://localhost:3000`. Public pages can be developed without environment
files. For portal work, copy `.env.example` to `.env.local` and configure a
migrated Supabase test project. `README.md` describes required versus optional
values. Keep all actual keys in local environment files or the relevant secret
store; logs and handoffs should report variable names and configuration status.

## Verify a change

Install the browser once with `pnpm exec playwright install chromium` (Linux CI
uses `--with-deps`). Both configured projects use Chromium: desktop and Pixel 5
emulation. Mobile emulation is not a physical-device or Safari check.

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm exec playwright test tests/smoke tests/a11y tests/content tests/environment --project=chromium
```

Start with a relevant test file while debugging; run the combined command after
the fix. Playwright starts a production build/server when port 3000 is free and
reuses an existing server locally. For a production check, stop the development
server first and provide the required production environment. A test run against
`pnpm dev` is useful for iteration but must be labelled as such in the handoff.
Do not run competing production builds into the same `.next` directory.
Stop every existing server in this checkout before rebuilding. On Windows,
`localhost` and `127.0.0.1` can reach different IPv6/IPv4 listeners; a stale process
can serve cached HTML pointing at removed build assets. Use an explicit
`PLAYWRIGHT_BASE_URL` when checking a selected server and verify its CSS loads.

Additional checks depend on the changed surface:

| Change | Command |
|---|---|
| Responsive layout | `pnpm exec playwright test tests/smoke/responsive.spec.ts --project=mobile` |
| Performance | `pnpm exec playwright test tests/performance --project=chromium` |
| World-map model | `pnpm test:world-assets` |
| Journal/map persistence | `pnpm test:journal-lifecycle` — [local PostgreSQL setup and scope](./testing/journal-lifecycle.md) |
| Autosave scheduling | `pnpm test:journal-autosave` — controlled requests/timers, no browser/server |
| Accounts and RLS | `pnpm test:accounts:local` — [fresh local Supabase stack and real browser lifecycle](./testing/accounts.md) |
| Formatting | `pnpm format:check` |
| Full configured suite | `pnpm test` |
| Inspect the last HTML report | `pnpm exec playwright show-report` |

Formatting checks cover `src`. The September 2026 audit baseline reported
existing formatting differences in 158 source files; this cleanup is still open.
Format touched files and avoid rewriting the whole tree for a focused change. Browser reports live in `playwright-report/`, failure artifacts
in `test-results/`. Preserve the failing test's error and trace while debugging.
The default uses one browser worker because parallel WebGL scenes compete with
axe scans for graphics resources. Override `--workers` only for a suitable focused run.

## What CI proves

| Workflow | Scope |
|---|---|
| `CI` on PRs/pushes to `main` or `dev` | Lint, types, build; one desktop run of smoke, accessibility, content and environment tests; HTML report retained for 14 days |
| `CI / Journal lifecycle` | Eight groups of real SQL Journal/map lifecycle checks against a disposable PostgreSQL 16 service, including create retries; auth/cache are stubbed, all credentials are local to the CI job |
| `Local account acceptance`, relevant PR paths or manual | Fresh local Supabase, actual UI signup/approval/Journal/export/deletion plus RLS; no cloud secrets |
| `Nightly`, 03:00 UTC or manual | Desktop performance and the full mobile project in independent jobs, each retaining its own HTML report |
| `Supabase Migration Preview`, manual | Lists pending `supabase/migrations` using `db push --dry-run` and the configured `SUPABASE_DB_URL` secret; applies no migrations |
| `Docker`, `v*` tags or manual | Builds and publishes GHCR image using configured public build arguments |

CI browser jobs use placeholder Supabase credentials. They exercise public UI
and form rendering, not live authentication. Check skipped tests explicitly;
`tests/rls` needs a disposable migrated Supabase project and these shell variables:

```text
SUPABASE_TEST_URL
SUPABASE_TEST_ANON_KEY
SUPABASE_TEST_SERVICE_ROLE_KEY
SUPABASE_TEST_DISPOSABLE=1
```

With those variables set, run
`pnpm exec playwright test tests/rls --project=chromium`. These tests create and
delete test users and records, approve memberships, and check owner isolation
and suspension. Use a disposable project as required by the test fixtures.
RLS checks alone do not validate UI export/deletion; `test:accounts:local` adds
that lifecycle. External email delivery, OAuth, avatar uploads and the AI provider
remain separate checks. `/api/health` only proves that the process serves requests.

Database changes follow [the schema workflow](../supabase/schemas/README.md):
desired state in `supabase/schemas`, reviewed append-only migrations in
`supabase/migrations`, and the matching Drizzle runtime schema. The old
`DB/supabase` replay workflow has been replaced by the manual migration preview.
Deployment of reviewed migrations remains a separate operation.

Reporter and migration-preview behavior follow the official
[Playwright CLI](https://playwright.dev/docs/test-cli) and
[Supabase CLI](https://supabase.com/docs/reference/cli/supabase-db-push) references.

## Work with agents

1. Read `AGENTS.md`, the current roadmap and the relevant feature code. Separate
   shipped behavior from proposals in historical plans.
2. Capture the working-tree state, reproduce one concrete problem, and assign
   disjoint file ownership for useful parallel work. Coordinate shared config,
   dependency changes and dev/build processes through the main agent.
3. Ship a small working slice: user flow, server boundary, error/empty states,
   translations, accessibility and relevant verification together. Add a test
   when it protects meaningful behavior; avoid scaffolding for hypothetical use.
4. Record the result in the existing roadmap or task handoff, using this shape:

```text
Outcome: observable behavior now available or corrected
Changed: relevant files and why
Verified: exact commands, server mode, pass/fail/skip counts
Open: unverified services or remaining reproducible failures
Next: one bounded task and its completion criterion
```

Keep secrets and personal records out of this evidence. A finished local slice
is ready for review; only claim cloud readiness after its environment-specific
checks actually pass.
