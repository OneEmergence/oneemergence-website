import { z } from 'zod'

// ─── Shared Content Metadata ────────────────────────────────────────────────

export const ContentType = z.enum([
  'teaching',
  'reflection',
  'practice',
  'transmission',
  'visual-essay',
  'sound-journey',
])
export type ContentType = z.infer<typeof ContentType>

export const Locale = z.enum(['de', 'en'])
export type Locale = z.infer<typeof Locale>

export const Difficulty = z.enum(['beginner', 'intermediate', 'advanced'])
export type Difficulty = z.infer<typeof Difficulty>

/**
 * Shared metadata across all sacred content types.
 */
export const ContentMeta = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  type: ContentType,
  excerpt: z.string().min(1),
  tags: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
  difficulty: Difficulty.optional(),
  duration: z.number().positive().optional(), // minutes
  published: z.boolean().default(false),
  date: z.string().min(1), // ISO date string (YYYY-MM-DD or datetime)
  cover: z.string().optional(),
  locale: Locale.default('de'),
})
export type ContentMeta = z.infer<typeof ContentMeta>

// ─── Type-Specific Extensions ───────────────────────────────────────────────

export const TeachingMeta = ContentMeta.extend({
  type: z.literal('teaching'),
  references: z.array(z.string()).default([]),
  relatedConcepts: z.array(z.string()).default([]),
})
export type TeachingMeta = z.infer<typeof TeachingMeta>

export const ReflectionMeta = ContentMeta.extend({
  type: z.literal('reflection'),
  prompts: z.array(z.string()).default([]),
  journalSeed: z.string().optional(),
})
export type ReflectionMeta = z.infer<typeof ReflectionMeta>

const PracticeStep = z.object({
  instruction: z.string(),
  duration: z.number().optional(), // seconds
})

export const PracticeMeta = ContentMeta.extend({
  type: z.literal('practice'),
  audio: z.string().optional(),
  instructions: z.array(PracticeStep).default([]),
  posture: z.string().optional(),
})
export type PracticeMeta = z.infer<typeof PracticeMeta>

export const TransmissionMeta = ContentMeta.extend({
  type: z.literal('transmission'),
  medium: z.enum(['text', 'audio', 'visual']).default('text'),
  attribution: z.string().optional(),
})
export type TransmissionMeta = z.infer<typeof TransmissionMeta>

const Scene = z.object({
  id: z.string(),
  label: z.string().optional(),
  scrollStart: z.number().optional(), // 0–1 range
})

export const VisualEssayMeta = ContentMeta.extend({
  type: z.literal('visual-essay'),
  scenes: z.array(Scene).default([]),
  scrollLength: z.number().positive().optional(),
})
export type VisualEssayMeta = z.infer<typeof VisualEssayMeta>

export const SoundJourneyMeta = ContentMeta.extend({
  type: z.literal('sound-journey'),
  audio: z.string(),
  suggestedPosture: z.string().optional(),
  visualMode: z.string().optional(),
})
export type SoundJourneyMeta = z.infer<typeof SoundJourneyMeta>

// ─── Discriminated Union ────────────────────────────────────────────────────

export const AnyContentMeta = z.discriminatedUnion('type', [
  TeachingMeta,
  ReflectionMeta,
  PracticeMeta,
  TransmissionMeta,
  VisualEssayMeta,
  SoundJourneyMeta,
])
export type AnyContentMeta = z.infer<typeof AnyContentMeta>

// ─── Journal (simpler schema for blog-style articles) ───────────────────────

export const JournalMeta = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  date: z.string().min(1),
  excerpt: z.string().min(1),
  author: z.string().default('OneEmergence'),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  locale: Locale.default('de'),
})
export type JournalMeta = z.infer<typeof JournalMeta>

// ─── Content directory mapping ──────────────────────────────────────────────

export const CONTENT_TYPE_DIRS: Record<ContentType, string> = {
  teaching: 'teachings',
  reflection: 'reflections',
  practice: 'practices',
  transmission: 'transmissions',
  'visual-essay': 'essays',
  'sound-journey': 'journeys',
}

/**
 * Returns the correct Zod schema for a given content type.
 */
export function getSchemaForType(type: ContentType) {
  const schemas: Record<ContentType, z.ZodType<AnyContentMeta>> = {
    teaching: TeachingMeta,
    reflection: ReflectionMeta,
    practice: PracticeMeta,
    transmission: TransmissionMeta,
    'visual-essay': VisualEssayMeta,
    'sound-journey': SoundJourneyMeta,
  }
  return schemas[type]
}
