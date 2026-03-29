import {
  pgTable,
  text,
  timestamp,
  jsonb,
  integer,
  boolean,
  primaryKey,
} from 'drizzle-orm/pg-core'
import type { AdapterAccountType } from 'next-auth/adapters'

// =============================================================================
// Auth.js tables (required by @auth/drizzle-adapter)
// =============================================================================

export const users = pgTable('users', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
)

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
})

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
)

// =============================================================================
// Application tables
// =============================================================================

export const journalEntries = pgTable('journal_entries', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  moodTags: jsonb('mood_tags').$type<string[]>().default([]),
  themes: jsonb('themes').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const practices = pgTable('practices', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // 'meditation' | 'breathwork' | 'soundscape'
  duration: integer('duration').notNull(), // seconds
  completedAt: timestamp('completed_at', { mode: 'date' }).defaultNow().notNull(),
  notes: text('notes'),
})

// =============================================================================
// Consciousness Map tables
// =============================================================================

export const mapNodes = pgTable('map_nodes', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  type: text('type')
    .$type<'theme' | 'insight' | 'journal-entry' | 'practice' | 'archetype'>()
    .notNull(),
  label: text('label').notNull(),
  description: text('description'),
  sourceId: text('source_id'),
  sourceType: text('source_type'),
  color: text('color'),
  size: integer('size').default(1).notNull(),
  x: integer('x'),
  y: integer('y'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const mapEdges = pgTable('map_edges', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sourceNodeId: text('source_node_id')
    .notNull()
    .references(() => mapNodes.id, { onDelete: 'cascade' }),
  targetNodeId: text('target_node_id')
    .notNull()
    .references(() => mapNodes.id, { onDelete: 'cascade' }),
  label: text('label'),
  strength: integer('strength').default(1).notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const userPreferences = pgTable('user_preferences', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  intensityMode: text('intensity_mode').$type<'still' | 'balanced' | 'immersive'>().default('balanced'),
  audioEnabled: boolean('audio_enabled').default(false),
  focusThemes: jsonb('focus_themes').$type<string[]>().default([]),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

// =============================================================================
// AI Guide tables
// =============================================================================

export const guideConversations = pgTable('guide_conversations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  title: text('title'),
  role: text('role').$type<'seer' | 'scientist' | 'architect' | 'mirror'>().notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
})

export const guideMessages = pgTable('guide_messages', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => guideConversations.id, { onDelete: 'cascade' }),
  role: text('role').$type<'user' | 'assistant'>().notNull(),
  content: text('content').notNull(),
  structuredResponse: jsonb('structured_response'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
})

export const savedPromptCards = pgTable('saved_prompt_cards', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  context: text('context'),
  type: text('type').$type<'reflection' | 'inquiry' | 'practice' | 'vision'>().notNull(),
  sourceConversationId: text('source_conversation_id')
    .references(() => guideConversations.id, { onDelete: 'set null' }),
  savedAt: timestamp('saved_at', { mode: 'date' }).defaultNow().notNull(),
})
