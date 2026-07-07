-- =============================================================================
-- 03_tables_guide.sql — AI Guide Tables
-- =============================================================================
-- Conversations, messages, and saved prompt cards for the four-role AI Guide.
-- The Guide uses Vercel AI SDK + Anthropic Claude on the server side.
-- These tables persist conversation history and user-saved outputs.

-- -----------------------------------------------------------------------------
-- guide_conversations: a dialogue session with a specific role
-- -----------------------------------------------------------------------------
create table guide_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  role guide_role not null,
  -- Summary for context injection into future conversations
  summary text,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table guide_conversations is 'AI Guide conversation sessions, one per role interaction';

-- -----------------------------------------------------------------------------
-- guide_messages: individual messages within a conversation
-- -----------------------------------------------------------------------------
create table guide_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references guide_conversations(id) on delete cascade,
  role message_role not null,
  content text not null,
  -- Structured response from the Guide (Zod-validated JSON)
  -- Contains: cards, exercises, related journeys, visual/sound activations, map suggestions
  structured_response jsonb,
  created_at timestamptz not null default now()
);

comment on table guide_messages is 'Individual messages in an AI Guide conversation';
comment on column guide_messages.structured_response is 'Zod-validated structured output: prompt cards, exercises, activations';

-- -----------------------------------------------------------------------------
-- saved_prompt_cards: prompt cards saved by the user from Guide responses
-- -----------------------------------------------------------------------------
create table saved_prompt_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  context text,
  type prompt_card_type not null,
  source_conversation_id uuid references guide_conversations(id) on delete set null,
  saved_at timestamptz not null default now()
);

comment on table saved_prompt_cards is 'User-saved prompt cards from AI Guide responses';
