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
 * A frontmatter date, normalised to a string.
 *
 * YAML parses an unquoted `date: 2026-07-27` into a JS `Date`, while a quoted
 * one stays a string — so requiring `z.string()` here fails the build on a
 * missing pair of quotes. Authors should not have to know that.
 */
export const DateString = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().min(1),
)

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
  date: DateString, // ISO date string (YYYY-MM-DD or datetime)
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
  date: DateString,
  excerpt: z.string().min(1),
  author: z.string().default('OneEmergence'),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  locale: Locale.default('de'),
})
export type JournalMeta = z.infer<typeof JournalMeta>

// ─── Stories (standalone, shareable long-form pages) ────────────────────────

/** Atmosphere presets — mirrors `AtmosphereVariant` in components/motion/LayerAtmosphere. */
export const Atmosphere = z.enum(['cosmic', 'solarpunk', 'transitional', 'warm'])
export type Atmosphere = z.infer<typeof Atmosphere>

/** Accent token used for rules, eyebrows, stat numbers and CTA. */
export const Accent = z.enum(['violet', 'gold', 'cyan', 'green', 'sand'])
export type Accent = z.infer<typeof Accent>

export const StoryMeta = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  /** One-line deck under the title. */
  subtitle: z.string().optional(),
  /** Small label above the title, e.g. "Für Partner" or "Whitepaper". */
  eyebrow: z.string().optional(),
  /** Meta description + OG description. Keep it under ~160 chars. */
  description: z.string().min(1),
  date: DateString,
  updated: DateString.optional(),
  author: z.string().default('OneEmergence'),
  atmosphere: Atmosphere.default('cosmic'),
  accent: Accent.default('violet'),
  hero: z.enum(['full', 'compact', 'cover']).default('full'),
  cover: z.string().optional(),
  tags: z.array(z.string()).default([]),
  /** false ⇒ route 404s. The draft switch. */
  published: z.boolean().default(true),
  /** false ⇒ reachable by direct link only: no /s index, no sitemap. */
  listed: z.boolean().default(true),
  /** true ⇒ `robots: noindex` on the page. Implied by `listed: false`. */
  noindex: z.boolean().default(false),
  /** Closing call to action rendered after the body. */
  cta: z
    .object({
      label: z.string().min(1),
      href: z.string().min(1),
      title: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
  locale: Locale.default('de'),
})
export type StoryMeta = z.infer<typeof StoryMeta>

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
