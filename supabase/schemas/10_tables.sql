create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'user',
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
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

create table public.workspace_memberships (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status public.membership_status not null default 'pending',
  approved_by uuid references auth.users (id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.workspace_profiles (
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

create table public.workspace_membership_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  actor_user_id uuid references auth.users (id) on delete set null,
  event_type text not null check (
    event_type in ('requested', 'approved', 'suspended', 'reactivated')
  ),
  created_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  content text not null,
  mood_tags jsonb default '[]'::jsonb,
  themes jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.practices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  duration integer not null,
  completed_at timestamptz not null default now(),
  notes text
);

create table public.map_nodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  label text not null,
  description text,
  source_id text,
  source_type text,
  color text,
  size integer not null default 1,
  x real,
  y real,
  created_at timestamptz not null default now()
);

create table public.map_edges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source_node_id uuid not null references public.map_nodes (id) on delete cascade,
  target_node_id uuid not null references public.map_nodes (id) on delete cascade,
  label text,
  strength integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  intensity_mode text default 'balanced',
  audio_enabled boolean default false,
  focus_themes jsonb default '[]'::jsonb,
  onboarding_completed boolean default false,
  updated_at timestamptz not null default now()
);

create table public.guide_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text,
  role text not null,
  message_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.guide_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.guide_conversations (id) on delete cascade,
  role text not null,
  content text not null,
  structured_response jsonb,
  created_at timestamptz not null default now()
);

create table public.saved_prompt_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question text not null,
  context text,
  type text not null,
  source_conversation_id uuid
    references public.guide_conversations (id) on delete set null,
  saved_at timestamptz not null default now()
);

create index user_roles_role_idx on public.user_roles (role);
create unique index profiles_email_idx on public.profiles (email);
create index workspace_memberships_user_status_idx
  on public.workspace_memberships (user_id, status);
create index workspace_memberships_workspace_status_idx
  on public.workspace_memberships (workspace_id, status);
create index workspace_profiles_user_idx
  on public.workspace_profiles (user_id);
create index workspace_membership_events_workspace_user_idx
  on public.workspace_membership_events (workspace_id, user_id, created_at);
create index journal_entries_user_created_at_idx
  on public.journal_entries (user_id, created_at desc);
create index practices_user_completed_at_idx
  on public.practices (user_id, completed_at desc);
create index map_nodes_user_created_at_idx
  on public.map_nodes (user_id, created_at desc);
create index map_edges_user_created_at_idx
  on public.map_edges (user_id, created_at desc);
create index guide_conversations_user_updated_at_idx
  on public.guide_conversations (user_id, updated_at desc);
create index guide_messages_conversation_created_at_idx
  on public.guide_messages (conversation_id, created_at);
create index saved_prompt_cards_user_saved_at_idx
  on public.saved_prompt_cards (user_id, saved_at desc);
