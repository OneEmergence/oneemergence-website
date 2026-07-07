import { z } from 'zod'

// =============================================================================
// Rituals / Practice — Zod Schemas (feature-owned)
// =============================================================================
// Extracted from the inline validation that previously lived in actions.ts so
// the feature follows the standard contract (actions · schemas · types · …).

export const PracticeTypeSchema = z.enum([
  'meditation',
  'breathwork',
  'soundscape',
])
export type PracticeTypeInput = z.infer<typeof PracticeTypeSchema>

/**
 * Input for logging a completed practice session. `duration` arrives from a
 * FormData string, so it is coerced to a positive integer number of seconds.
 * German messages are surfaced directly to the UI.
 */
export const LogPracticeInputSchema = z.object({
  type: PracticeTypeSchema,
  duration: z.coerce
    .number({ message: 'Ungültige Dauer.' })
    .int('Ungültige Dauer.')
    .positive('Ungültige Dauer.'),
  notes: z
    .string()
    .trim()
    .max(2000, 'Notiz ist zu lang.')
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
})
export type LogPracticeInput = z.infer<typeof LogPracticeInputSchema>
