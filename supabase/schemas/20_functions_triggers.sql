create function public.is_app_admin()
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

create function public.has_any_active_workspace_access()
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

create function public.has_active_workspace_access(target_workspace_id uuid)
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

create function public.protect_last_admin()
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

create trigger protect_last_admin
  before update of role or delete on public.user_roles
  for each row execute function public.protect_last_admin();

create function public.audit_workspace_membership_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  event_name text;
begin
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

create trigger audit_workspace_membership_change
  after insert or update of status on public.workspace_memberships
  for each row execute function public.audit_workspace_membership_change();

create function public.handle_new_user()
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

create function public.sync_profile_email()
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

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.sync_profile_email();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
