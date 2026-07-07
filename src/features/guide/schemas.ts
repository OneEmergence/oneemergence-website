import { z } from 'zod'

// =============================================================================
// Guide Role
// =============================================================================

export const GuideRole = z.enum(['seer', 'scientist', 'architect', 'mirror'])
export type GuideRole = z.infer<typeof GuideRole>

// =============================================================================
// Structured Response Elements
// =============================================================================

export const PromptCard = z.object({
  question: z.string().describe('A powerful reflection question for the user'),
  context: z.string().optional().describe('Brief context for why this question matters'),
  type: z.enum(['reflection', 'inquiry', 'practice', 'vision']).describe('The nature of this prompt'),
})
export type PromptCard = z.infer<typeof PromptCard>

export const Exercise = z.object({
  title: z.string().describe('Name of the exercise'),
  instructions: z.array(z.string()).describe('Step-by-step instructions'),
  duration: z.number().optional().describe('Suggested duration in minutes'),
  type: z.enum(['breathing', 'journaling', 'embodiment', 'meditation', 'visualization']).describe('Category of practice'),
})
export type Exercise = z.infer<typeof Exercise>

// =============================================================================
// Full Guide Response (structured output from the model)
// =============================================================================

export const GuideResponse = z.object({
  text: z.string().describe('Main response text — the core of what the Guide says'),
  role: GuideRole.describe('Which role generated this response'),
  cards: z.array(PromptCard).optional().describe('Prompt cards for reflection or inquiry'),
  exercise: Exercise.optional().describe('A guided practice if relevant'),
  relatedJourneys: z.array(z.string()).optional().describe('Slugs of related content/journeys'),
  soundActivation: z.string().optional().describe('Suggested ambient sound mode'),
  visualActivation: z.enum(['breathing', 'mandala', 'constellation', 'void']).optional().describe('Visual atmosphere to activate'),
  mapSuggestions: z.array(z.string()).optional().describe('Suggested consciousness map node labels'),
})
export type GuideResponse = z.infer<typeof GuideResponse>

// =============================================================================
// API Input Schemas
// =============================================================================

export const GuideMessageInput = z.object({
  message: z.string().min(1).max(4000),
  role: GuideRole,
  conversationId: z.string().optional(),
})
export type GuideMessageInput = z.infer<typeof GuideMessageInput>

// =============================================================================
// Conversation & Message Types (for DB ↔ UI)
// =============================================================================

export interface GuideConversation {
  id: string
  userId: string
  title: string | null
  role: GuideRole
  createdAt: Date
  updatedAt: Date
}

export interface GuideMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  content: string
  structuredResponse: GuideResponse | null
  createdAt: Date
}

export interface SavedCard {
  id: string
  userId: string
  question: string
  context: string | null
  type: PromptCard['type']
  sourceConversationId: string | null
  savedAt: Date
}
