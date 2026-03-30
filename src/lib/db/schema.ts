import {
  pgTable,
  text,
  uuid,
  timestamp,
  jsonb,
  integer,
  boolean,
  real,
} from 'drizzle-orm/pg-core'

// =============================================================================
// Profile (auto-created by Supabase trigger on auth.users insert)
// =============================================================================

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches auth.users.id
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})

// =============================================================================
// Application tables
// =============================================================================

export const journalEntries = pgTable('journal_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  moodTags: jsonb('mood_tags').$type<string[]>().default([]),
  themes: jsonb('themes').$type<string[]>().default([]),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})

export const practices = pgTable('practices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull(), // 'meditation' | 'breathwork' | 'soundscape'
  duration: integer('duration').notNull(), // seconds
  completedAt: timestamp('completed_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  notes: text('notes'),
})

// =============================================================================
// Consciousness Map tables
// =============================================================================

export const mapNodes = pgTable('map_nodes', {
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
})

export const mapEdges = pgTable('map_edges', {
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
})

export const userPreferences = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().unique(),
  intensityMode: text('intensity_mode').$type<'still' | 'balanced' | 'immersive'>().default('balanced'),
  audioEnabled: boolean('audio_enabled').default(false),
  focusThemes: jsonb('focus_themes').$type<string[]>().default([]),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})

// =============================================================================
// AI Guide tables
// =============================================================================

export const guideConversations = pgTable('guide_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  title: text('title'),
  role: text('role').$type<'seer' | 'scientist' | 'architect' | 'mirror'>().notNull(),
  messageCount: integer('message_count').default(0).notNull(),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})

export const guideMessages = pgTable('guide_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => guideConversations.id, { onDelete: 'cascade' }),
  role: text('role').$type<'user' | 'assistant'>().notNull(),
  content: text('content').notNull(),
  structuredResponse: jsonb('structured_response'),
  createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})

export const savedPromptCards = pgTable('saved_prompt_cards', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  question: text('question').notNull(),
  context: text('context'),
  type: text('type').$type<'reflection' | 'inquiry' | 'practice' | 'vision'>().notNull(),
  sourceConversationId: uuid('source_conversation_id')
    .references(() => guideConversations.id, { onDelete: 'set null' }),
  savedAt: timestamp('saved_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
})
