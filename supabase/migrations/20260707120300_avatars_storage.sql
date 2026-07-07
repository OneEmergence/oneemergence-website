-- =============================================================================
-- 20260707120300_avatars_storage.sql — Avatar storage bucket + RLS policies
-- =============================================================================
-- Phase 1 (Accounts & Identity): profile avatar uploads. Users upload their
-- avatar client-side (browser Supabase client) into the 'avatars' bucket; the
-- resulting public URL is stored on public.profiles.avatar_url.
--
-- Isolation rule: an object's path is `<auth.uid()>/<filename>`, so a user may
-- only write/modify objects inside their OWN uid-prefixed folder. Reads are
-- public (the bucket is public) so avatar URLs render everywhere.
--
-- `storage.foldername(name)` returns the path segments as a 1-indexed array;
-- `[1]` is the top folder, which must equal the caller's auth.uid(). auth.uid()
-- is wrapped in `(select ...)` per Supabase RLS performance guidance.
-- =============================================================================

-- Public bucket (idempotent).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- storage.objects already has RLS enabled by Supabase; (re)declare our policies.

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
  );

drop policy if exists "avatars_owner_update" on storage.objects;
create policy "avatars_owner_update"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_owner_delete" on storage.objects;
create policy "avatars_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
