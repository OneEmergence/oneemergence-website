-- =============================================================================
-- 08_triggers.sql — Automatic Triggers
-- =============================================================================
-- Automatic updated_at management and denormalized counter updates.
-- Uses the moddatetime extension for clean updated_at triggers.

-- -----------------------------------------------------------------------------
-- updated_at triggers (via moddatetime extension)
-- -----------------------------------------------------------------------------
-- These automatically set updated_at = now() on any UPDATE.

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function extensions.moddatetime(updated_at);

create trigger trg_user_preferences_updated_at
  before update on user_preferences
  for each row execute function extensions.moddatetime(updated_at);

create trigger trg_journal_entries_updated_at
  before update on journal_entries
  for each row execute function extensions.moddatetime(updated_at);

create trigger trg_guide_conversations_updated_at
  before update on guide_conversations
  for each row execute function extensions.moddatetime(updated_at);

create trigger trg_saved_practices_updated_at
  before update on saved_practices
  for each row execute function extensions.moddatetime(updated_at);

create trigger trg_practice_streaks_updated_at
  before update on practice_streaks
  for each row execute function extensions.moddatetime(updated_at);

-- -----------------------------------------------------------------------------
-- guide_conversations.message_count auto-increment
-- -----------------------------------------------------------------------------
create or replace function fn_increment_message_count()
returns trigger as $$
begin
  update guide_conversations
  set message_count = message_count + 1,
      updated_at = now()
  where id = NEW.conversation_id;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_guide_messages_count
  after insert on guide_messages
  for each row execute function fn_increment_message_count();

-- -----------------------------------------------------------------------------
-- Auto-create profile and preferences on new user signup
-- -----------------------------------------------------------------------------
-- When Supabase Auth creates a new user in auth.users, automatically create
-- corresponding rows in profiles and user_preferences.
create or replace function fn_handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, display_name)
  values (NEW.id, coalesce(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'));

  insert into public.user_preferences (user_id)
  values (NEW.id);

  insert into public.practice_streaks (user_id)
  values (NEW.id);

  return NEW;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function fn_handle_new_user();
