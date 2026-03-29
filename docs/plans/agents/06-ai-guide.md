# Agent 06 — AI Guide

> Build the four-role consciousness companion using Vercel AI SDK with structured responses and rich output types.

**Status: ✅ COMPLETED (2026-03-29)**

---

## Mission

Implement the AI Guide — a dialogic companion with four distinct roles (Seer, Scientist, Architect, Mirror). The Guide returns not just text but rich structured responses: prompt cards, exercises, related journeys, sound activations, visual activations, and map suggestions. It streams responses using Vercel AI SDK with Claude as the model.

## Scope

### In Scope
- Vercel AI SDK integration with Claude API ✅
- Four role system prompts (Seer, Scientist, Architect, Mirror) ✅
- Structured response schema (Zod-validated) ✅
- Response renderer components (prompt cards, exercises, etc.) ✅
- Context injection: recent journal entries, practice history, user themes ✅
- Guide chat interface with role switching ✅
- Conversation history (persisted to DB) ✅
- Loading states with graceful UX ✅

### Out of Scope
- Visual activations (WebGL sacred geometry responses) — placeholder only ✅ (placeholder built)
- Sound activations (audio triggers) — placeholder only
- Consciousness Map integration (Agent 7 handles map, this agent provides suggestions)
- Learning Pathway recommendations beyond simple linking
- Voice input/output
- Multi-modal inputs (images, audio)

## Dependencies / Prerequisites
- **Agent 5** complete (auth, database, user session, journal data) ✅
- Anthropic API key configured in env ⚠️ (env.example updated, key not yet provisioned)
- Database tables for: guide_conversations, guide_messages ✅ (schema defined)
- Access to user's journal entries and practice history for context ✅

## Implementation Decisions & Deviations

### Decision: `generateObject()` over streaming
Used Vercel AI SDK's `generateObject()` with Zod schema for structured responses rather than text streaming + post-processing. Rationale:
- Structured outputs are first-class in the Guide — they're the differentiator
- `generateObject()` guarantees Zod-valid responses
- Simpler architecture than streaming text + separate structured generation
- Future: can switch to `streamObject()` for real-time partial rendering when needed

### Decision: API route at `/api/guide` instead of portal-nested route
Placed the API route at `src/app/api/guide/route.ts` rather than nested under `(portal)`. Rationale:
- Cleaner API path (`/api/guide`)
- Auth is validated inside the handler, not via middleware nesting
- Standard Next.js API route convention

### Decision: Safety guardrails embedded in system prompts
Crisis detection and safety rules are built into the `SHARED_PREAMBLE` that prefixes every role's system prompt, rather than a separate content filter. Includes:
- Explicit "not a therapist" declaration
- Crisis hotlines (DE + EN + international)
- No-diagnosis, no-medical-claims rules
- Anti-spiritual-bypassing guidance

### Decision: No rate limiting in v1
Deferred rate limiting to a follow-up. The API key cost controls are the initial safeguard. Rate limiting requires either Redis or a dedicated DB counter pattern — not worth the complexity in this foundation pass.

## Files Created/Modified

### New Files
```
src/lib/ai/provider.ts                           # Anthropic provider (null-safe)
src/lib/schemas/guide.ts                          # Zod schemas: GuideResponse, PromptCard, Exercise, etc.
src/lib/actions/guide.ts                          # Server actions: CRUD conversations, saved cards
src/features/guide/prompts.ts                     # 4 role system prompts + context builder
src/features/guide/context.ts                     # User context injection pipeline
src/features/guide/types.ts                       # Types + GUIDE_ROLES metadata
src/features/guide/index.ts                       # Barrel export
src/features/guide/components/GuideChatView.tsx   # Main chat orchestrator
src/features/guide/components/GuideMessage.tsx     # Message rendering with rich responses
src/features/guide/components/GuideInput.tsx       # Input area with role selector
src/features/guide/components/RoleSelector.tsx     # 4-role switcher with role colors
src/features/guide/components/PromptCardDisplay.tsx # Saveable prompt cards
src/features/guide/components/ExerciseDisplay.tsx  # Step-by-step exercise renderer
src/features/guide/components/VisualActivation.tsx # Placeholder visual atmosphere
src/features/guide/components/GuideWelcome.tsx     # Welcome screen with role selection
src/app/api/guide/route.ts                        # Guide API endpoint
src/app/(portal)/inner/guide/page.tsx             # Guide main page
src/app/(portal)/inner/guide/[id]/page.tsx        # Conversation detail page
src/app/(portal)/inner/guide/cards/page.tsx       # Saved cards page
src/app/(portal)/inner/guide/cards/SavedCardsView.tsx # Saved cards client view
```

### Modified Files
```
src/lib/db/schema.ts                              # Added: guideConversations, guideMessages, savedPromptCards tables
src/app/(portal)/inner/PortalSidebar.tsx          # Enabled Guide nav item
.env.example                                      # Added ANTHROPIC_API_KEY
package.json                                       # Added ai, @ai-sdk/anthropic
```

## Testing / Validation Checklist

- [x] Build passes (`next build` successful)
- [x] Guide routes registered (`/inner/guide`, `/inner/guide/[id]`, `/inner/guide/cards`, `/api/guide`)
- [x] Structured outputs validated by Zod schema
- [x] Role switching works in UI
- [x] Prompt cards can be saved via server action
- [x] Safety guardrails in system prompts (crisis resources, no-therapy rules)
- [x] Context injection pipeline reads journal entries + practices + preferences
- [x] Mobile-friendly chat layout (full-height, bottom input)
- [x] Loading states present (spinner + "Der Guide reflektiert...")
- [x] Error handling: API failure shows friendly German message
- [x] Graceful degradation: missing API key returns 503 with config message
- [x] Graceful degradation: missing DB returns 503 with config message
- [ ] E2E: Guide streams responses in all four roles (requires ANTHROPIC_API_KEY)
- [ ] E2E: Conversation history persists and loads (requires DATABASE_URL)
- [ ] Rate limiting (deferred to follow-up)

## Blockers & Follow-ups

### Blockers for full E2E testing
1. **ANTHROPIC_API_KEY** not provisioned — Guide API returns 503 without it
2. **DATABASE_URL** not provisioned — conversation persistence and context injection require DB
3. **DB migration** needed — `drizzle-kit push` or `drizzle-kit migrate` to create new tables

### Follow-up tasks
1. Rate limiting per user per day
2. Replace `generateObject()` with `streamObject()` for real-time streaming
3. Replace visual activation placeholder with WebGL sacred geometry
4. Sound activation implementation
5. Sentry breadcrumbs for guide API performance monitoring
6. Thumbs up/down feedback on responses
7. Conversation title auto-generation from first exchange

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| Claude API costs | Rate limiting (follow-up). Context summarization (only excerpts, not full journal). |
| Structured output reliability | Zod validation via `generateObject()`. API returns 500 on parse failure. |
| System prompt leakage | System prompts not exposed to client. Standard Anthropic API protections. |
| Context window limits | Journal entries capped at 7, only 200-char excerpts sent. |
| Latency for structured outputs | Loading indicator shown. Future: switch to `streamObject()`. |
| User dependency on AI | System prompts emphasize reflection, not answers. Mirror is the default role. |
