import { z } from 'zod'

export const JournalEntryInputSchema = z.object({
  title: z.string().min(1, 'Titel ist erforderlich'),
  content: z.string().min(1, 'Inhalt ist erforderlich'),
  moodTags: z.array(z.string()).default([]),
  themes: z.array(z.string()).default([]),
})

export type JournalEntryInput = z.infer<typeof JournalEntryInputSchema>

export const JournalFiltersSchema = z.object({
  moodTag: z.string().optional(),
  theme: z.string().optional(),
  search: z.string().optional(),
})

export type JournalFilters = z.infer<typeof JournalFiltersSchema>
