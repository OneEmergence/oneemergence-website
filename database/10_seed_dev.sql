-- =============================================================================
-- 10_seed_dev.sql — Development Seed Data
-- =============================================================================
-- NEVER run this in production. This creates test data for local development
-- using Supabase local (supabase start).
--
-- Prerequisites:
-- - All schema scripts (00-09) already applied
-- - A test user exists in auth.users (created via Supabase Auth UI or CLI)
--
-- Usage with Supabase local:
--   1. supabase start
--   2. Create a test user via Dashboard (localhost:54323) or:
--      INSERT INTO auth.users (id, email, ...) — see below
--   3. Run this script against local Postgres
-- =============================================================================

-- Create a test user in auth.users (Supabase local only)
-- In production, users are created via OAuth / email signup.
-- Note: this insert format works with Supabase local. The trigger
-- fn_handle_new_user will auto-create profiles, preferences, and streaks.
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_user_meta_data, created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'authenticated', 'authenticated',
  'seeker@oneemergence.dev',
  crypt('testpassword123', gen_salt('bf')),
  now(),
  '{"full_name": "Test Seeker", "avatar_url": ""}',
  now(), now()
) on conflict (id) do nothing;

-- Wait for trigger to create profile/preferences/streaks
-- (triggers run synchronously, so the rows exist immediately)

-- Update profile with more detail
update profiles set
  display_name = 'Test Seeker',
  bio = 'A seeker of truth, testing the inner world.',
  onboarding_completed = true
where user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- =============================================================================
-- Journal Entries
-- =============================================================================
insert into journal_entries (id, user_id, title, content, mood_tags, themes, created_at) values
(
  '11111111-1111-1111-1111-111111111111',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Erste Morgenreflexion',
  'Heute Morgen bin ich mit einem tiefen Gefühl der Ruhe aufgewacht. Die Stille vor dem Sonnenaufgang hat etwas Heiliges. Ich habe 20 Minuten meditiert und dabei bemerkt, wie meine Gedanken sich langsam beruhigt haben. Das Thema Präsenz beschäftigt mich weiterhin.',
  '{calm,grateful}',
  '{presence,meditation,stillness}',
  now() - interval '7 days'
),
(
  '22222222-2222-2222-2222-222222222222',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Schatten und Licht',
  'Eine herausfordernde Sitzung heute. Ich habe mich mit meiner Angst vor Verletzlichkeit auseinandergesetzt. Der Spiegel-Guide hat mir geholfen zu erkennen, dass hinter der Angst ein tiefes Verlangen nach Verbindung steht. Schattenarbeit ist nicht leicht, aber notwendig.',
  '{heavy,curious}',
  '{shadow-work,vulnerability,connection}',
  now() - interval '5 days'
),
(
  '33333333-3333-3333-3333-333333333333',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Emergenz im Alltag',
  'Beim Spaziergang im Park habe ich beobachtet, wie ein Schwarm Vögel sich bewegt — wie ein einziges Wesen. Emergenz ist überall, wenn man die Augen öffnet. Diese Erkenntnis verbindet sich mit meiner Lektüre über Komplexitätstheorie.',
  '{inspired,light}',
  '{emergence,complexity,nature,oneness}',
  now() - interval '2 days'
),
(
  '44444444-4444-4444-4444-444444444444',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Abendrituale',
  'Ich habe begonnen, den Tag mit einer kurzen Atemübung abzuschließen. Box-Breathing, 5 Minuten. Es hilft mir, den Tag loszulassen und in einen ruhigen Schlaf zu finden. Das Ritual wird Teil meiner abendlichen Praxis.',
  '{calm,light}',
  '{breathwork,ritual,evening-practice}',
  now() - interval '1 day'
);

-- =============================================================================
-- Guide Conversations
-- =============================================================================
insert into guide_conversations (id, user_id, title, role, message_count, created_at) values
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Über Präsenz und Stille',
  'mirror',
  2,
  now() - interval '6 days'
);

insert into guide_messages (conversation_id, role, content, created_at) values
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'user',
  'Ich möchte tiefer in das Thema Präsenz eintauchen. Was bedeutet es wirklich, präsent zu sein?',
  now() - interval '6 days'
),
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'assistant',
  'Eine wunderbare Frage. Bevor ich dir meine Perspektive anbiete, möchte ich dich einladen, einen Moment innezuhalten: Wenn du jetzt, in diesem Augenblick, wirklich präsent bist — was nimmst du wahr? Was ist da, bevor der Verstand es benennt?',
  now() - interval '6 days'
);

-- =============================================================================
-- Map Nodes (seeded constellation)
-- =============================================================================
insert into map_nodes (id, user_id, type, label, description, color, size, x, y, created_at) values
('aaaa0001-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'theme', 'Präsenz', 'Das Fundament aller inneren Arbeit', '#7C5CFF', 3, 0, 0, now() - interval '7 days'),
('aaaa0002-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'theme', 'Schattenarbeit', 'Begegnung mit dem Unbewussten', '#7C5CFF', 2, 150, -80, now() - interval '5 days'),
('aaaa0003-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'theme', 'Emergenz', 'Das Ganze ist mehr als seine Teile', '#7C5CFF', 2, -120, 100, now() - interval '2 days'),
('aaaa0004-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'insight', 'Hinter Angst liegt Sehnsucht', NULL, '#F6C453', 1, 200, -30, now() - interval '5 days'),
('aaaa0005-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'insight', 'Emergenz ist überall', NULL, '#F6C453', 1, -80, 150, now() - interval '2 days'),
('aaaa0006-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'journal-entry', 'Erste Morgenreflexion', NULL, '#54E2E9', 1, 50, -50, now() - interval '7 days'),
('aaaa0007-0000-0000-0000-000000000000', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'practice', 'Box-Breathing', 'Abendliches Atemritual', '#4ADE80', 1, 100, 80, now() - interval '1 day');

-- =============================================================================
-- Map Edges
-- =============================================================================
insert into map_edges (user_id, source_node_id, target_node_id, label) values
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0000-0000-0000-000000000000', 'aaaa0006-0000-0000-0000-000000000000', 'Entstanden aus'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0002-0000-0000-0000-000000000000', 'aaaa0004-0000-0000-0000-000000000000', 'Erkenntnis'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0003-0000-0000-0000-000000000000', 'aaaa0005-0000-0000-0000-000000000000', 'Naturbeobachtung'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'aaaa0001-0000-0000-0000-000000000000', 'aaaa0007-0000-0000-0000-000000000000', 'Praxis der Präsenz');

-- =============================================================================
-- Practice Sessions
-- =============================================================================
insert into practice_sessions (user_id, type, duration, variant, notes, completed_at) values
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meditation', 1200, NULL, 'Tiefe Stille. Gedanken kamen und gingen.', now() - interval '7 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'breathwork', 300, 'box-breathing', 'Box-Breathing vor dem Schlaf.', now() - interval '5 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meditation', 900, NULL, NULL, now() - interval '3 days'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'breathwork', 300, '4-7-8', 'Abendübung. Spüre mehr Ruhe.', now() - interval '1 day'),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'meditation', 600, NULL, 'Kurze Morgensession.', now());

-- Update practice streaks for the test user
update practice_streaks set
  current_streak = 3,
  longest_streak = 3,
  last_practice_date = current_date,
  total_sessions = 5,
  total_minutes = 55
where user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

-- =============================================================================
-- Saved Practice (Ritual Memory)
-- =============================================================================
insert into saved_practices (user_id, title, description, practice_type, default_duration, sort_order) values
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Morgenmeditation', '20 Minuten Stille am Morgen', 'meditation', 1200, 1),
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Abend-Atemübung', 'Box-Breathing zum Tagesabschluss', 'breathwork', 300, 2);

-- =============================================================================
-- Saved Prompt Card
-- =============================================================================
insert into saved_prompt_cards (user_id, question, context, type, source_conversation_id) values
(
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Was nimmst du wahr, bevor der Verstand es benennt?',
  'Reflexion über Präsenz und unmittelbare Wahrnehmung',
  'reflection',
  'cccccccc-cccc-cccc-cccc-cccccccccccc'
);
