# Journal / map lifecycle regression

Run `pnpm test:journal-lifecycle` against a running **local PostgreSQL** server
with `CREATEDB` permission. Set the dedicated variable explicitly; the check does
not read `.env`, `DATABASE_URL`, or Supabase configuration.

PowerShell example (adjust the local role and port):

```powershell
$env:JOURNAL_TEST_ADMIN_URL = 'postgresql://journal_test@127.0.0.1:55441/postgres'
pnpm test:journal-lifecycle
```

Only literal loopback addresses (`127.0.0.1`, `[::1]`) are accepted. The script
creates a randomly named `oe_journal_test_*` database, loads the journal/map table
definitions from `supabase/schemas/10_tables.sql`, and drops its own database in
`finally`. It never resets the database in the connection URL. If the process is
forcibly terminated, its temporary database can remain for manual cleanup.

The test executes the actual Journal server actions and map generation with real
Zod validation, Drizzle queries, and PostgreSQL transactions. Only authenticated
user resolution and Next cache invalidation are substituted so the check needs
neither an app server nor an external identity provider.

It verifies:

- Editing a journal refreshes its map title/excerpt while preserving positions
  and connections.
- Queries keep other users and other source types untouched; a foreign journal
  ID cannot mutate either its journal or map nodes.
- A failed map update/deletion rolls back the accompanying journal mutation.
- Deleting a journal removes its copied text and attached edges, retaining
  independent theme nodes.
- Failed map generation still saves the journal and rolls back the partial graph
  through a savepoint within the creation transaction.
- Repeated or concurrent creates with the same draft UUID produce one entry and
  one source node. A retry applies the latest content without regenerating the
  graph; invalid UUIDs and another owner's ID cannot change existing records.

Validated on PostgreSQL 16. This checks persistence and ownership filtering, not
Supabase RLS, browser autosave timing, or historical orphan cleanup. The first
two have real local coverage in [account acceptance](./accounts.md); historical
orphan cleanup remains separately planned in `docs/ROADMAP.md`.
