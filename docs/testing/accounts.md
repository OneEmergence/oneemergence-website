# Account acceptance

Run the real account lifecycle against a fresh local Supabase stack:

```bash
pnpm exec playwright install chromium
pnpm test:accounts:local
```

Docker must be running. Node/pnpm versions come from the repository. The first
run downloads the Supabase images pinned by the installed CLI. No cloud account,
access token, `.env` edits or external mail delivery are needed.

The runner copies the committed Supabase config, schemas and migrations into
`tmp/oe-accounts-<random>/`. It uses a new project and Docker network bound to
127.0.0.1, reserves ports 55320–55324 and serves Next on 127.0.0.1:3100. It supplies
matching local Auth/SQL credentials only to its child process. An existing app
server is never reused. Stop other Next servers/builds in this checkout first:
the production build uses the shared `.next` directory. Rebuild with the intended
environment before resuming normal production serving.

The database's last-admin protection stays enabled. One bootstrap admin belongs
to the temporary stack; each test owns additional random identities and cleans
them up in `finally`, including partially completed signup/setup. At the end the
runner removes only its own project's containers, data volumes and network.
SIGINT/SIGTERM request cleanup too; forced process termination or machine failure
can still require the exact project ID in the log to be stopped manually:

```bash
pnpm exec supabase stop --project-id oe-accounts-<exact-id> --no-backup
docker network rm oe-accounts-<exact-id>
```

Never substitute a cloud project or use `--all`. Logs and copied config remain
under that ignored `tmp/` directory for diagnosis; keep the logs local because
Supabase's startup output contains temporary local keys. The browser report is
`playwright-report/index.html` (or `PLAYWRIGHT_HTML_OUTPUT_DIR`).

## What the checks prove

- Real UI signup, default user role, pending access restrictions and export.
- Admin UI approval and its recorded actor; ordinary users cannot enter admin UI.
- Real Journal autosave overlapping manual save, with exactly one entry containing
  the latest text; the first real response is lost after its SQL commit, then an
  explicit retry must update that same entry. Owner-specific Journal/map data
  appears in the exported JSON.
- Suspension blocks workspace access while export and deletion remain available.
- Account deletion removes Auth and owned SQL rows, preserving another owner's data.
- PostgREST/RLS owner isolation, pending/suspended restrictions and role escalation
  defenses with two users; cleanup on partially failed setup.

The local Auth config auto-confirms signup. External email verification, password
reset delivery, OAuth providers, avatar upload and remote hosting configuration
remain separate staging checks. The account deletion check verifies that Storage
is available and the avatars bucket exists; it does not upload an avatar.

`Local account acceptance` runs on relevant pull-request changes and manual
dispatch with runner-local services and no cloud secrets. It retains the HTML
report. Ordinary smoke CI does not replace this check.

## Explicit disposable staging

The same tests can run against an already migrated **disposable** environment:

```text
SUPABASE_TEST_URL
SUPABASE_TEST_ANON_KEY
SUPABASE_TEST_SERVICE_ROLE_KEY
SUPABASE_TEST_DISPOSABLE=1
```

Partial configuration fails. There is no fallback to app credentials. Account
E2E additionally requires the app to be built and served against exactly the
same Supabase origin, signup auto-confirmation, an existing bootstrap admin and
the avatars bucket. `PLAYWRIGHT_BASE_URL` sets the app origin;
`PLAYWRIGHT_REUSE_SERVER=0` forces a fresh build/server.

```bash
pnpm exec playwright test tests/accounts tests/rls --project=chromium
```

The local workflow follows the official [Supabase local development
guide](https://supabase.com/docs/guides/local-development) and
[Playwright web server configuration](https://playwright.dev/docs/test-webserver).
