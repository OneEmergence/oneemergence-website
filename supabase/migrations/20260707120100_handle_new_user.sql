-- =============================================================================
-- 20260707120100_handle_new_user.sql — Auth signup trigger
-- =============================================================================
-- On INSERT into auth.users, create the matching public.profiles row
-- (id = new.id, per the canonical Drizzle shape) and a public.user_preferences
-- row. Adapted from the archived database/08_triggers.sql, but reshaped to the
-- Drizzle schema: profiles keyed by id (not a separate user_id column), and no
-- practice_streaks insert (that table does not exist in the canonical schema).
--
-- SECURITY DEFINER + `set search_path = ''` (empty) is the Supabase-recommended
-- hardening: the function runs with the definer's rights and must fully-qualify
-- every object it touches (public.profiles, public.user_preferences).
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  );

  insert into public.user_preferences (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
