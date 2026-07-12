// =============================================================================
// Runtime mirror of the desired SQL in supabase/schemas. Change both together,
// generate and review a matching append-only migration in supabase/migrations,
// then verify the declarative diff is empty. Drizzle never deploys migrations.
// =============================================================================

import {
  pgEnum,
  pgTable,
  primaryKey,
  foreignKey,
  index,
  uniqueIndex,
  text,
  uuid,
  timestamp,
  jsonb,
  integer,
  boolean,
  real,
} from 'drizzle-orm/pg-core'

export const appRoleEnum = pgEnum('app_role', ['user', 'agent', 'superuser', 'admin'])

export const membershipStatusEnum = pgEnum('membership_status', ['pending', 'active', 'suspended'])

// =============================================================================
// Profile (auto-created by Supabase trigger on auth.users insert)
// =============================================================================

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id').primaryKey(), // matches auth.users.id
    email: text('email'),
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('profiles_email_idx').on(table.email)]
)

// =============================================================================
// Global access roles and workspaces
// =============================================================================

export const userRoles = pgTable(
  'user_roles',
  {
    userId: uuid('user_id').primaryKey(), // matches auth.users.id
    role: appRoleEnum('role').default('user').notNull(),
    assignedBy: uuid('assigned_by'),
    assignedAt: timestamp('assigned_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [index('user_roles_role_idx').on(table.role)]
)

export const workspaces = pgTable('workspaces', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: uuid('created_by'),
  createdAt: timestamp('created_at', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', {
    mode: 'date',
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
})

export const workspaceMemberships = pgTable(
  'workspace_memberships',
  {
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(), // matches auth.users.id
    status: membershipStatusEnum('status').default('pending').notNull(),
    approvedBy: uuid('approved_by'),
    approvedAt: timestamp('approved_at', {
      mode: 'date',
      withTimezone: true,
    }),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    index('workspace_memberships_user_status_idx').on(table.userId, table.status),
    index('workspace_memberships_workspace_status_idx').on(table.workspaceId, table.status),
  ]
)

export const workspaceProfiles = pgTable(
  'workspace_profiles',
  {
    workspaceId: uuid('workspace_id').notNull(),
    userId: uuid('user_id').notNull(), // matches auth.users.id
    displayName: text('display_name'),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    intensityMode: text('intensity_mode').$type<'still' | 'balanced' | 'immersive'>(),
    audioEnabled: boolean('audio_enabled'),
    focusThemes: jsonb('focus_themes').$type<string[]>(),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.workspaceId, table.userId] }),
    foreignKey({
      columns: [table.workspaceId, table.userId],
      foreignColumns: [workspaceMemberships.workspaceId, workspaceMemberships.userId],
      name: 'workspace_profiles_workspace_id_user_id_fkey',
    }).onDelete('cascade'),
    index('workspace_profiles_user_idx').on(table.userId),
  ]
)

export const workspaceMembershipEvents = pgTable(
  'workspace_membership_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    workspaceId: uuid('workspace_id')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull(), // matches auth.users.id
    actorUserId: uuid('actor_user_id'), // matches auth.users.id
    eventType: text('event_type')
      .$type<'requested' | 'approved' | 'suspended' | 'reactivated'>()
      .notNull(),
    createdAt: timestamp('created_at', {
      mode: 'date',
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('workspace_membership_events_workspace_user_idx').on(
      table.workspaceId,
      table.userId,
      table.createdAt
    ),
  ]
)

// =============================================================================
// Application tables
// =============================================================================

export const journalEntries = pgTable(
  'journal_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    moodTags: jsonb('mood_tags').$type<string[]>().default([]),
    themes: jsonb('themes').$type<string[]>().default([]),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('journal_entries_user_created_at_idx').on(table.userId, table.createdAt.desc())]
)

export const practices = pgTable(
  'practices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    type: text('type').notNull(), // 'meditation' | 'breathwork' | 'soundscape'
    duration: integer('duration').notNull(), // seconds
    completedAt: timestamp('completed_at', { mode: 'date', withTimezone: true })
      .defaultNow()
      .notNull(),
    notes: text('notes'),
  },
  (table) => [index('practices_user_completed_at_idx').on(table.userId, table.completedAt.desc())]
)

// =============================================================================
// Consciousness Map tables
// =============================================================================

export const mapNodes = pgTable(
  'map_nodes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    type: text('type')
      .$type<'theme' | 'insight' | 'journal-entry' | 'practice' | 'archetype'>()
      .notNull(),
    label: text('label').notNull(),
    description: text('description'),
    sourceId: text('source_id'),
    sourceType: text('source_type'),
    color: text('color'),
    size: integer('size').default(1).notNull(),
    x: real('x'),
    y: real('y'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('map_nodes_user_created_at_idx').on(table.userId, table.createdAt.desc())]
)

export const mapEdges = pgTable(
  'map_edges',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    sourceNodeId: uuid('source_node_id')
      .notNull()
      .references(() => mapNodes.id, { onDelete: 'cascade' }),
    targetNodeId: uuid('target_node_id')
      .notNull()
      .references(() => mapNodes.id, { onDelete: 'cascade' }),
    label: text('label'),
    strength: integer('strength').default(1).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('map_edges_user_created_at_idx').on(table.userId, table.createdAt.desc())]
)

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  intensityMode: text('intensity_mode')
    .$type<'still' | 'balanced' | 'immersive'>()
    .default('balanced'),
  audioEnabled: boolean('audio_enabled').default(false),
  focusThemes: jsonb('focus_themes').$type<string[]>().default([]),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})

// =============================================================================
// AI Guide tables
// =============================================================================

export const guideConversations = pgTable(
  'guide_conversations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    title: text('title'),
    role: text('role').$type<'seer' | 'scientist' | 'architect' | 'mirror'>().notNull(),
    messageCount: integer('message_count').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('guide_conversations_user_updated_at_idx').on(table.userId, table.updatedAt.desc()),
  ]
)

export const guideMessages = pgTable(
  'guide_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => guideConversations.id, { onDelete: 'cascade' }),
    role: text('role').$type<'user' | 'assistant'>().notNull(),
    content: text('content').notNull(),
    structuredResponse: jsonb('structured_response'),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index('guide_messages_conversation_created_at_idx').on(table.conversationId, table.createdAt),
  ]
)

export const savedPromptCards = pgTable(
  'saved_prompt_cards',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull(),
    question: text('question').notNull(),
    context: text('context'),
    type: text('type').$type<'reflection' | 'inquiry' | 'practice' | 'vision'>().notNull(),
    sourceConversationId: uuid('source_conversation_id').references(() => guideConversations.id, {
      onDelete: 'set null',
    }),
    savedAt: timestamp('saved_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index('saved_prompt_cards_user_saved_at_idx').on(table.userId, table.savedAt.desc())]
)
