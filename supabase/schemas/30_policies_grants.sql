alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_memberships enable row level security;
alter table public.workspace_profiles enable row level security;
alter table public.workspace_membership_events enable row level security;
alter table public.journal_entries enable row level security;
alter table public.practices enable row level security;
alter table public.map_nodes enable row level security;
alter table public.map_edges enable row level security;
alter table public.user_preferences enable row level security;
alter table public.guide_conversations enable row level security;
alter table public.guide_messages enable row level security;
alter table public.saved_prompt_cards enable row level security;

create policy "profiles_owner" on public.profiles
  for select to authenticated
  using (
    (select auth.uid()) = id
    and (select public.has_any_active_workspace_access())
  );

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
revoke all on function public.has_any_active_workspace_access()
  from public, anon;
revoke all on function public.has_active_workspace_access(uuid)
  from public, anon;
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
grant select, insert, update, delete on public.workspace_memberships
  to authenticated;
grant select, insert, update, delete on public.workspace_profiles
  to authenticated;
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
