create policy "avatars_public_read"
  on storage.objects
  for select
  using (bucket_id = 'avatars');

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
