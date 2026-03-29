# Agent 06 — AI Guide

> Build the four-role consciousness companion using Vercel AI SDK with structured responses and rich output types.

---

## Mission

Implement the AI Guide — a dialogic companion with four distinct roles (Seer, Scientist, Architect, Mirror). The Guide returns not just text but rich structured responses: prompt cards, exercises, related journeys, sound activations, visual activations, and map suggestions. It streams responses using Vercel AI SDK with Claude as the model.

## Scope

### In Scope
- Vercel AI SDK integration with Claude API
- Four role system prompts (Seer, Scientist, Architect, Mirror)
- Structured response schema (Zod-validated)
- Response renderer components (prompt cards, exercises, etc.)
- Context injection: recent journal entries, practice history, user themes
- Guide chat interface with role switching
- Conversation history (persisted to DB)
- Streaming responses with graceful loading states

### Out of Scope
- Visual activations (WebGL sacred geometry responses) — placeholder only
- Sound activations (audio triggers) — placeholder only
- Consciousness Map integration (Agent 7 handles map, this agent provides suggestions)
- Learning Pathway recommendations beyond simple linking
- Voice input/output
- Multi-modal inputs (images, audio)

## Dependencies / Prerequisites
- **Agent 5** complete (auth, database, user session, journal data)
- Anthropic API key configured in env
- Database tables for: guide_conversations, guide_messages
- Access to user's journal entries and practice history for context

## Repository Areas Touched

```
src/features/guide/                  # New: guide feature module
src/app/(portal)/inner/guide/        # New: guide routes
src/lib/actions/guide.ts             # New: server actions for conversations
src/lib/schemas/guide.ts             # New: Zod schemas for guide responses
package.json                         # New: ai, @ai-sdk/anthropic
```

## Detailed Task Breakdown

### Phase 1: Vercel AI SDK Setup

**Task 1.1: Install dependencies**
- `ai` (Vercel AI SDK)
- `@ai-sdk/anthropic` (Claude provider)

**Task 1.2: Create AI provider configuration**
```typescript
// src/lib/ai/provider.ts
import { createAnthropic } from '@ai-sdk/anthropic'

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

**Task 1.3: Define response schemas**
```typescript
// src/lib/schemas/guide.ts
export const PromptCard = z.object({
  question: z.string(),
  context: z.string().optional(),
  type: z.enum(['reflection', 'inquiry', 'practice', 'vision']),
})

export const Exercise = z.object({
  title: z.string(),
  instructions: z.array(z.string()),
  duration: z.number().optional(),
  type: z.enum(['breathing', 'journaling', 'embodiment', 'meditation', 'visualization']),
})

export const GuideResponse = z.object({
  text: z.string(),
  role: z.enum(['seer', 'scientist', 'architect', 'mirror']),
  cards: z.array(PromptCard).optional(),
  exercise: Exercise.optional(),
  relatedJourneys: z.array(z.string()).optional(),
  soundActivation: z.string().optional(),
  visualActivation: z.enum(['breathing', 'mandala', 'constellation', 'void']).optional(),
  mapSuggestions: z.array(z.string()).optional(),
})
```

### Phase 2: Role System Prompts

**Task 2.1: Craft Seer system prompt**
- Voice: Poetic, intuitive, metaphorical
- Approach: Sees patterns, offers symbolic perspective, speaks from the imaginal
- Constraints: No literal diagnoses. No clinical language. Always invitational.
- Output guidance: Favor prompt cards (reflection type), visual activations
- Context use: Read journal themes to find patterns, reflect them symbolically

**Task 2.2: Craft Scientist system prompt**
- Voice: Rational, clear, structured
- Approach: References research, explains mechanisms, grounds experience
- Constraints: Cite actual research when possible. No pseudo-science. Acknowledge uncertainty.
- Output guidance: Favor exercises (journaling, embodiment), related journeys
- Context use: Reference specific journal entries by theme, suggest evidence-based practices

**Task 2.3: Craft Architect system prompt**
- Voice: Strategic, practical, integrative
- Approach: Designs routines, bridges insight and action
- Constraints: Practical, actionable. No spiritual bypassing. Respect user's pace.
- Output guidance: Favor exercises (all types), prompt cards (practice type)
- Context use: Look at practice history, journal frequency, suggest improvements

**Task 2.4: Craft Mirror system prompt**
- Voice: Reflective, questioning, awareness-making
- Approach: Asks rather than tells, reflects back what it notices
- Constraints: Mostly questions. Minimal advice. Hold space. Don't interpret too strongly.
- Output guidance: Favor prompt cards (inquiry type), minimal exercises
- Context use: Gently reference what user has written, notice what's unsaid

**Task 2.5: Create system prompt builder**
```typescript
// src/features/guide/prompts.ts
function buildSystemPrompt(role: GuideRole, context: UserContext): string
// - Combines role-specific prompt with user context
// - Injects recent journal entries (last 5-10, summarized)
// - Injects practice history summary
// - Injects user's focus themes
// - Adds output format instructions for structured responses
```

### Phase 3: Guide API Route

**Task 3.1: Create streaming API endpoint**
```typescript
// src/app/(portal)/inner/guide/api/route.ts
// Exception to "no API routes" rule: Vercel AI SDK requires a route handler for streaming
// - Validates auth session
// - Accepts: message, role, conversationId
// - Loads user context (journal, practices, themes)
// - Builds system prompt for selected role
// - Streams response via Vercel AI SDK
// - Saves conversation to DB
```

**Task 3.2: Implement structured output generation**
- Use Vercel AI SDK's `generateObject()` or `streamObject()` for structured parts
- Stream the text response, then generate structured elements
- Or: use tool calls within the AI response for structured outputs

**Task 3.3: Context injection pipeline**
```typescript
// src/features/guide/context.ts
async function getUserContext(userId: string): Promise<UserContext> {
  // - Last 10 journal entries (titles + excerpts + mood tags)
  // - Practice history (last 30 days summary)
  // - Focus themes
  // - Current intensity mode
  // - Time of day + day of week
}
```

### Phase 4: Guide UI

**Task 4.1: Guide chat interface**
```
src/features/guide/components/
├── GuideChatView.tsx          # Main chat container
├── GuideMessage.tsx           # Individual message rendering
├── GuideInput.tsx             # Input area with role selector
├── RoleSelector.tsx           # Switch between 4 roles
├── PromptCardDisplay.tsx      # Rendered prompt cards
├── ExerciseDisplay.tsx        # Rendered exercises
├── RelatedJourneys.tsx        # Journey links
├── VisualActivation.tsx       # Placeholder for visual response
└── GuideWelcome.tsx           # Initial state before first message
```

**Task 4.2: GuideChatView**
- Shows conversation history
- Streams new responses with typing indicator
- Role indicator on each message (which role responded)
- Auto-scroll to latest message
- Mobile-friendly (full-height, bottom input)

**Task 4.3: RoleSelector**
- Four role buttons with icons and brief descriptions
- Currently active role highlighted
- Can switch mid-conversation
- Each role has a distinct visual accent color:
  - Seer: aurora-violet
  - Scientist: spirit-cyan
  - Architect: solar-gold
  - Mirror: pure-light (subtle)

**Task 4.4: Rich response rendering**
- **PromptCardDisplay**: Beautifully formatted card with question, save button
- **ExerciseDisplay**: Step-by-step exercise with optional timer integration
- **RelatedJourneys**: Linked cards to content in the library
- **VisualActivation**: Placeholder component that shows visual mode name (actual WebGL later)

**Task 4.5: Prompt card save action**
- Users can save prompt cards to their collection
- Saved cards accessible from dashboard or ritual memory
- Server action: `savePromptCard(userId, card)`

### Phase 5: Conversation Persistence

**Task 5.1: Database tables**
```sql
guide_conversations: id, userId, title, role, createdAt, updatedAt
guide_messages: id, conversationId, role ('user' | 'assistant'), content, structuredResponse (jsonb), createdAt
saved_prompt_cards: id, userId, question, context, type, savedAt
```

**Task 5.2: Server actions**
```typescript
// src/lib/actions/guide.ts
// - createConversation(userId, role): Promise<Conversation>
// - getConversations(userId): Promise<Conversation[]>
// - getConversation(id): Promise<ConversationWithMessages>
// - deleteConversation(id): Promise<void>
// - savePromptCard(userId, card): Promise<SavedCard>
// - getSavedCards(userId): Promise<SavedCard[]>
```

**Task 5.3: Guide routes**
```
src/app/(portal)/inner/guide/
├── page.tsx              # Guide home: new conversation or history
├── [id]/page.tsx         # Active conversation
└── cards/page.tsx        # Saved prompt cards
```

### Phase 6: Safety & Guardrails

**Task 6.1: Content safety**
- System prompts include: "You are not a therapist. You are not qualified to diagnose. If someone expresses crisis, provide crisis resources."
- Crisis detection: if user mentions self-harm, suicide, or acute mental health crisis → respond with empathy + crisis resources (not AI advice)
- No medical claims. No diagnostic language.

**Task 6.2: Rate limiting**
- Limit API calls per user per day (generous but not unlimited)
- Store count in DB or Redis
- Graceful messaging when limit reached

**Task 6.3: Response quality monitoring**
- Log all interactions (anonymized) for quality review
- Sentry breadcrumbs for guide API failures
- Track: response latency, structured output success rate, user satisfaction (optional thumbs up/down)

## Best Practices & Constraints

1. **The Guide is not a chatbot.** It's a mirror. System prompts must enforce this identity.
2. **Structured outputs are first-class.** The text response is important but the cards, exercises, and suggestions are the differentiator.
3. **Context injection is the magic.** The Guide's value comes from knowing the user's journey. Invest in the context pipeline.
4. **Streaming is non-negotiable.** Users should see text appear in real-time.
5. **Role switching should feel like meeting a different aspect of the same being.** Not a complete personality change.
6. **Privacy: journal content sent to Claude is transient.** Not stored by Anthropic (API use). But inform users their journal context is used.

## Testing / Validation Checklist

- [ ] Guide streams responses in all four roles
- [ ] Structured outputs (cards, exercises) render correctly
- [ ] Role switching works mid-conversation
- [ ] Conversation history persists and loads
- [ ] User context (journal, practices) injected correctly
- [ ] Prompt cards can be saved and viewed
- [ ] Crisis content triggers safety response
- [ ] Rate limiting works
- [ ] Mobile interface is usable
- [ ] Loading states are graceful (not blank screen during stream)
- [ ] Error handling: API failure shows friendly message

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| Claude API costs | Rate limiting. Context summarization (don't send full journal). Monitor costs. |
| Structured output reliability | Use Zod validation. Fallback to text-only if structured parsing fails. |
| System prompt leakage | Don't expose system prompts to users. Use Anthropic's system prompt protection. |
| Context window limits | Summarize journal entries, don't send raw content. Limit to last 10 entries. |
| Latency for structured outputs | Stream text first, generate structured elements after. |
| User dependency on AI | System prompts emphasize reflection, not answers. Mirror role is the default. |

## Handoff Outputs

- Working AI Guide with 4 roles, streaming responses
- Structured response rendering (prompt cards, exercises, journeys)
- Conversation persistence in database
- Context injection from journal and practice data
- Safety guardrails and crisis detection
- Guide routes in portal
- Saved prompt cards feature

## Subagent Strategy

1. **Prompt engineering agent** — Draft and refine all four role system prompts, test with sample conversations
2. **Vercel AI SDK agent** — Handle SDK setup, streaming configuration, structured output integration
3. **UI component agent** — Build the chat interface components, role selector, rich response renderers
4. **Safety review agent** — Test edge cases: crisis content, inappropriate requests, prompt injection attempts

## Commit Strategy

```
feat(ai): set up Vercel AI SDK with Anthropic provider
feat(guide): define Zod schemas for structured guide responses
feat(guide): create system prompts for Seer, Scientist, Architect, Mirror roles
feat(guide): implement streaming guide API with context injection
feat(guide): build guide chat interface with role selector
feat(guide): add rich response renderers (prompt cards, exercises, journeys)
feat(guide): add conversation persistence and history
feat(guide): implement safety guardrails and crisis detection
feat(guide): add prompt card save feature
```
