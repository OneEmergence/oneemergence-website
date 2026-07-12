-- Global roles, workspace access, per-workspace profiles, and access audit.

do $$
begin
  create type public.app_role as enum ('user', 'agent', 'superuser', 'admin');
exception
  when duplicate_object then null;
end
$$;

alter table public.profiles add column if not exists email text;

insert into public.profiles (id, email, display_name)
select
  id,
  lower(email),
  coalesce(raw_user_meta_data ->> 'full_name', raw_user_meta_data ->> 'name')
from auth.users
on conflict (id) do update set email = excluded.email;

do $$
begin
  create type public.membership_status as enum ('pending', 'active', 'suspended');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (
    length(slug) between 2 and 63
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  name text not null check (length(name) between 1 and 100),
  description text check (length(description) <= 500),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_memberships (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.membership_status not null default 'pending',
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.workspace_profiles (
  workspace_id uuid not null,
  user_id uuid not null,
  display_name text check (length(display_name) <= 80),
  avatar_url text check (length(avatar_url) <= 2048),
  bio text check (length(bio) <= 500),
  intensity_mode text check (
    intensity_mode is null
    or intensity_mode in ('still', 'balanced', 'immersive')
  ),
  audio_enabled boolean,
  focus_themes jsonb check (
    focus_themes is null
    or jsonb_typeof(focus_themes) = 'array'
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id),
  foreign key (workspace_id, user_id)
    references public.workspace_memberships (workspace_id, user_id)
    on delete cascade
);

create table if not exists public.workspace_membership_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null check (
    event_type in ('requested', 'approved', 'suspended', 'reactivated')
  ),
  created_at timestamptz not null default now()
);

create index if not exists user_roles_role_idx
  on public.user_roles (role);
create unique index if not exists profiles_email_idx
  on public.profiles (email);
create index if not exists workspace_memberships_user_status_idx
  on public.workspace_memberships (user_id, status);
create index if not exists workspace_memberships_workspace_status_idx
  on public.workspace_memberships (workspace_id, status);
create index if not exists workspace_profiles_user_idx
  on public.workspace_profiles (user_id);
create index if not exists workspace_membership_events_workspace_user_idx
  on public.workspace_membership_events (workspace_id, user_id, created_at);
create index if not exists journal_entries_user_created_at_idx
  on public.journal_entries (user_id, created_at desc);
create index if not exists practices_user_completed_at_idx
  on public.practices (user_id, completed_at desc);
create index if not exists map_nodes_user_created_at_idx
  on public.map_nodes (user_id, created_at desc);
create index if not exists map_edges_user_created_at_idx
  on public.map_edges (user_id, created_at desc);
create index if not exists guide_conversations_user_updated_at_idx
  on public.guide_conversations (user_id, updated_at desc);
create index if not exists guide_messages_conversation_created_at_idx
  on public.guide_messages (conversation_id, created_at);
create index if not exists saved_prompt_cards_user_saved_at_idx
  on public.saved_prompt_cards (user_id, saved_at desc);

create or replace function public.is_app_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = 'admin'::public.app_role
  );
$$;

create or replace function public.has_any_active_workspace_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_app_admin() or exists (
    select 1
    from public.workspace_memberships
    where user_id = (select auth.uid())
      and status = 'active'::public.membership_status
  );
$$;

create or replace function public.has_active_workspace_access(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_app_admin() or exists (
    select 1
    from public.workspace_memberships
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and status = 'active'::public.membership_status
  );
$$;

create or replace function public.protect_last_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role = 'admin'::public.app_role and (
      tg_op = 'DELETE'
      or (tg_op = 'UPDATE' and new.role <> 'admin'::public.app_role)
    )
  then
    perform pg_catalog.pg_advisory_xact_lock(7141202607120001);

    if not exists (
      select 1
      from public.user_roles
      where role = 'admin'::public.app_role
        and user_id <> old.user_id
    )
    then
      raise exception 'cannot remove the last admin'
        using errcode = 'check_violation';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

drop trigger if exists protect_last_admin on public.user_roles;
create trigger protect_last_admin
  before update of role or delete on public.user_roles
  for each row execute function public.protect_last_admin();

create or replace function public.audit_workspace_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  event_name text;
begin
  -- Service-role writes add the event explicitly in the same app transaction.
  if actor is null then return new; end if;

  if tg_op = 'INSERT' then
    event_name := case new.status
      when 'active'::public.membership_status then 'approved'
      when 'suspended'::public.membership_status then 'suspended'
      else 'requested'
    end;
  elsif old.status is distinct from new.status then
    event_name := case new.status
      when 'active'::public.membership_status then
        case when old.status = 'suspended'::public.membership_status
          then 'reactivated' else 'approved' end
      when 'suspended'::public.membership_status then 'suspended'
      else 'requested'
    end;
  else
    return new;
  end if;

  insert into public.workspace_membership_events (
    workspace_id,
    user_id,
    actor_user_id,
    event_type
  ) values (new.workspace_id, new.user_id, actor, event_name);
  return new;
end;
$$;

drop trigger if exists audit_workspace_membership_change
  on public.workspace_memberships;
create trigger audit_workspace_membership_change
  after insert or update of status on public.workspace_memberships
  for each row execute function public.audit_workspace_membership_change();

-- Data/bootstrap belongs in migrations, not the declarative schema files.
insert into public.workspaces (id, slug, name, description)
values (
  '00000000-0000-4000-8000-000000000001',
  'one-emergence',
  'OneEmergence',
  'The shared OneEmergence workspace.'
)
on conflict do nothing;

insert into public.user_roles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

with inserted_memberships as (
  insert into public.workspace_memberships (workspace_id, user_id)
  select workspace.id, users.id
  from auth.users as users
  cross join lateral (
    select id from public.workspaces where slug = 'one-emergence' limit 1
  ) as workspace
  on conflict (workspace_id, user_id) do nothing
  returning workspace_id, user_id
)
insert into public.workspace_membership_events (
  workspace_id,
  user_id,
  event_type
)
select workspace_id, user_id, 'requested'
from inserted_memberships;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    lower(new.email),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  with inserted_membership as (
    insert into public.workspace_memberships (workspace_id, user_id)
    select id, new.id
    from public.workspaces
    where slug = 'one-emergence'
    limit 1
    on conflict (workspace_id, user_id) do nothing
    returning workspace_id, user_id
  )
  insert into public.workspace_membership_events (
    workspace_id,
    user_id,
    event_type
  )
  select workspace_id, user_id, 'requested'
  from inserted_membership;

  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set email = lower(new.email), updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.user_roles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_profiles enable row level security;
alter table public.workspace_membership_events enable row level security;

-- Existing private tables stay owner-only and additionally require an active
-- workspace membership (global admins bypass access, never ownership).
drop policy if exists "profiles_owner" on public.profiles;
create policy "profiles_owner" on public.profiles
  for select to authenticated
  using (
    (select auth.uid()) = id
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "journal_entries_owner" on public.journal_entries;
create policy "journal_entries_owner" on public.journal_entries
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "practices_owner" on public.practices;
create policy "practices_owner" on public.practices
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "map_nodes_owner" on public.map_nodes;
create policy "map_nodes_owner" on public.map_nodes
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "map_edges_owner" on public.map_edges;
create policy "map_edges_owner" on public.map_edges
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
    and exists (
      select 1 from public.map_nodes as source
      where source.id = map_edges.source_node_id
        and source.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.map_nodes as target
      where target.id = map_edges.target_node_id
        and target.user_id = (select auth.uid())
    )
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
    and exists (
      select 1 from public.map_nodes as source
      where source.id = map_edges.source_node_id
        and source.user_id = (select auth.uid())
    )
    and exists (
      select 1 from public.map_nodes as target
      where target.id = map_edges.target_node_id
        and target.user_id = (select auth.uid())
    )
  );

drop policy if exists "user_preferences_owner" on public.user_preferences;
create policy "user_preferences_owner" on public.user_preferences
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "guide_conversations_owner" on public.guide_conversations;
create policy "guide_conversations_owner" on public.guide_conversations
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "guide_messages_owner" on public.guide_messages;
create policy "guide_messages_owner" on public.guide_messages
  for all to authenticated
  using (
    (select public.has_any_active_workspace_access())
    and exists (
      select 1
      from public.guide_conversations as conversation
      where conversation.id = guide_messages.conversation_id
        and conversation.user_id = (select auth.uid())
    )
  )
  with check (
    (select public.has_any_active_workspace_access())
    and exists (
      select 1
      from public.guide_conversations as conversation
      where conversation.id = guide_messages.conversation_id
        and conversation.user_id = (select auth.uid())
    )
  );

drop policy if exists "saved_prompt_cards_owner" on public.saved_prompt_cards;
create policy "saved_prompt_cards_owner" on public.saved_prompt_cards
  for all to authenticated
  using (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
    and (
      source_conversation_id is null
      or exists (
        select 1 from public.guide_conversations as conversation
        where conversation.id = saved_prompt_cards.source_conversation_id
          and conversation.user_id = (select auth.uid())
      )
    )
  )
  with check (
    (select auth.uid()) = user_id
    and (select public.has_any_active_workspace_access())
    and (
      source_conversation_id is null
      or exists (
        select 1 from public.guide_conversations as conversation
        where conversation.id = saved_prompt_cards.source_conversation_id
          and conversation.user_id = (select auth.uid())
      )
    )
  );

create policy "user_roles_read" on public.user_roles
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_app_admin())
  );
create policy "user_roles_admin_update" on public.user_roles
  for update to authenticated
  using ((select public.is_app_admin()))
  with check (
    (select public.is_app_admin())
    and user_id <> (select auth.uid())
  );

create policy "workspaces_read" on public.workspaces
  for select to authenticated
  using ((select public.has_active_workspace_access(id)));
create policy "workspaces_admin_insert" on public.workspaces
  for insert to authenticated
  with check ((select public.is_app_admin()));
create policy "workspaces_admin_update" on public.workspaces
  for update to authenticated
  using ((select public.is_app_admin()))
  with check ((select public.is_app_admin()));
create policy "workspaces_admin_delete" on public.workspaces
  for delete to authenticated
  using ((select public.is_app_admin()));

create policy "workspace_memberships_read" on public.workspace_memberships
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_app_admin())
  );
create policy "workspace_memberships_admin_insert"
  on public.workspace_memberships
  for insert to authenticated
  with check ((select public.is_app_admin()));
create policy "workspace_memberships_admin_update"
  on public.workspace_memberships
  for update to authenticated
  using ((select public.is_app_admin()))
  with check ((select public.is_app_admin()));
create policy "workspace_memberships_admin_delete"
  on public.workspace_memberships
  for delete to authenticated
  using ((select public.is_app_admin()));

create policy "workspace_profiles_read" on public.workspace_profiles
  for select to authenticated
  using (
    (
      (select auth.uid()) = user_id
      and (select public.has_active_workspace_access(workspace_id))
    )
    or (select public.is_app_admin())
  );
create policy "workspace_profiles_insert" on public.workspace_profiles
  for insert to authenticated
  with check (
    (
      (select auth.uid()) = user_id
      and (select public.has_active_workspace_access(workspace_id))
    )
    or (select public.is_app_admin())
  );
create policy "workspace_profiles_update" on public.workspace_profiles
  for update to authenticated
  using (
    (
      (select auth.uid()) = user_id
      and (select public.has_active_workspace_access(workspace_id))
    )
    or (select public.is_app_admin())
  )
  with check (
    (
      (select auth.uid()) = user_id
      and (select public.has_active_workspace_access(workspace_id))
    )
    or (select public.is_app_admin())
  );
create policy "workspace_profiles_delete" on public.workspace_profiles
  for delete to authenticated
  using (
    (
      (select auth.uid()) = user_id
      and (select public.has_active_workspace_access(workspace_id))
    )
    or (select public.is_app_admin())
  );

create policy "workspace_membership_events_read"
  on public.workspace_membership_events
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.is_app_admin())
  );
revoke all on function public.is_app_admin() from public, anon;
revoke all on function public.has_any_active_workspace_access() from public, anon;
revoke all on function public.has_active_workspace_access(uuid) from public, anon;
revoke all on function public.protect_last_admin()
  from public, anon, authenticated;
revoke all on function public.audit_workspace_membership_change()
  from public, anon, authenticated;
revoke all on function public.handle_new_user()
  from public, anon, authenticated;
revoke all on function public.sync_profile_email()
  from public, anon, authenticated;
grant execute on function public.is_app_admin() to authenticated, service_role;
grant execute on function public.has_any_active_workspace_access()
  to authenticated, service_role;
grant execute on function public.has_active_workspace_access(uuid)
  to authenticated, service_role;

grant usage on type public.app_role, public.membership_status to authenticated;
grant select, update on public.user_roles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_memberships to authenticated;
grant select, insert, update, delete on public.workspace_profiles to authenticated;
revoke insert, update, delete on public.workspace_membership_events
  from authenticated;
grant select on public.workspace_membership_events to authenticated;
revoke insert, update, delete on public.profiles from authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update, delete on public.journal_entries to authenticated;
grant select, insert, update, delete on public.practices to authenticated;
grant select, insert, update, delete on public.map_nodes to authenticated;
grant select, insert, update, delete on public.map_edges to authenticated;
grant select, insert, update, delete on public.user_preferences to authenticated;
grant select, insert, update, delete on public.guide_conversations to authenticated;
grant select, insert, update, delete on public.guide_messages to authenticated;
grant select, insert, update, delete on public.saved_prompt_cards to authenticated;

revoke all on public.user_roles from anon;
revoke all on public.workspaces from anon;
revoke all on public.workspace_memberships from anon;
revoke all on public.workspace_profiles from anon;
revoke all on public.workspace_membership_events from anon;
revoke all on public.profiles from anon;
revoke all on public.journal_entries from anon;
revoke all on public.practices from anon;
revoke all on public.map_nodes from anon;
revoke all on public.map_edges from anon;
revoke all on public.user_preferences from anon;
revoke all on public.guide_conversations from anon;
revoke all on public.guide_messages from anon;
revoke all on public.saved_prompt_cards from anon;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

drop policy if exists "avatars_owner_insert" on storage.objects;
create policy "avatars_owner_insert"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and cardinality(storage.foldername(name)) = 1
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and cardinality(storage.foldername(name)) = 1
    and (select public.has_any_active_workspace_access())
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and cardinality(storage.foldername(name)) = 1
    and (select public.has_any_active_workspace_access())
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and cardinality(storage.foldername(name)) = 1
    and (select public.has_any_active_workspace_access())
  );
