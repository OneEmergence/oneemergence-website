# Declarative database schema

These files are the canonical desired state for app-owned database objects.
They are loaded lexicographically through `schema_paths` in
`supabase/config.toml`. `src/lib/db/schema.ts` mirrors the queryable public
tables for TypeScript; `supabase/migrations` remains the only deployment
history and is append-only.

Supabase-managed `auth` and `storage` tables are not copied here; app-owned
triggers, functions, grants, and storage policies are represented explicitly.

## Change workflow

1. Change the relevant file in this directory and the Drizzle mirror together.
2. Generate a migration with `pnpm exec supabase db diff -f <name>`.
3. Review the generated SQL, especially policies, grants, triggers, and drops.
4. Run `pnpm db:reset` and `pnpm exec supabase db lint`.
5. Confirm a second `pnpm exec supabase db diff` is empty.

Schema diffing does not reliably represent data changes or every policy
transition. The default workspace, existing-user backfill, avatar bucket row,
and other DML therefore live only in reviewed migrations (or seed files), not
in this directory.

## One-time first admin bootstrap

No signup is promoted automatically. After migrations are applied, replace the
email below and run this once in the Supabase SQL editor with database-owner
privileges:

```sql
begin;

with target as (
  select id from auth.users where lower(email) = lower('admin@example.com')
), promoted as (
  update public.user_roles
  set role = 'admin',
      assigned_by = user_id,
      assigned_at = now(),
      updated_at = now()
  where user_id = (select id from target)
  returning user_id
), activated as (
  update public.workspace_memberships
  set status = 'active',
      approved_by = user_id,
      approved_at = now(),
      updated_at = now()
  where user_id = (select user_id from promoted)
    and workspace_id = (
      select id from public.workspaces where slug = 'one-emergence'
    )
  returning workspace_id, user_id
)
insert into public.workspace_membership_events (
  workspace_id,
  user_id,
  actor_user_id,
  event_type
)
select workspace_id, user_id, user_id, 'approved' from activated;

commit;
```

The final insert must report one affected row. If it reports zero, verify the
email and confirm that the account has already been created before retrying.

The server-side admin guard also permits a global admin to manage any existing
workspace without a membership. Activating the default membership keeps the
bootstrap account's ordinary workspace profile and direct RLS access explicit.
