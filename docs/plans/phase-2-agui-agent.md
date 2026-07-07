# Phase 2 — The AG-UI Agent (Implementation Plan)

Status: Planned (execute after Phase 0 + 1 are merged) · Est. 2–3 weeks
Prereqs: accounts live (Phase 1), env module, supabase migrations channel.
Reference: [ROADMAP.md](../ROADMAP.md) §IV Phase 2, VISION.md §III (four roles).

Goal: the AI Guide evolves from a single-shot `generateObject` endpoint into a
**streaming, tool-using, permission-asking companion** speaking the AG-UI
protocol, so agent output (text, prompt cards, exercises, map suggestions)
renders as generative UI while it arrives.

## Architectural decisions (made in roadmap session)

- **Wire format: AG-UI protocol** (SSE event stream: lifecycle, text-delta,
  tool-call, state-sync, generative-UI events).
- **LLM runtime: Vercel AI SDK** (already installed, `@ai-sdk/anthropic`) —
  no LangGraph/Mastra unless a real need appears.
- **Frontend: 1-day spike before committing** — CopilotKit React client vs.
  a thin custom client over `@ag-ui/client`. Decision criterion: does
  CopilotKit let us keep the existing bespoke `GuideChatView` look and the
  intensity-mode system without fighting it? If not, custom client.
- Model id comes from `env.AI_MODEL` (never hardcoded).
- ARCHITECTURE.md "no chatbot frameworks" is consciously superseded by this
  decision — update the doc in Task 0.

## Tasks

### Task 1 — Spike: AG-UI client choice (timeboxed 1 day)
- Branch. Install `@ag-ui/client` + `@ag-ui/core`; prototype streaming the
  existing prompt-card flow (a) via CopilotKit `useCoAgent`/custom renderer,
  (b) via a bare EventSource/fetch-stream client mapping AG-UI events to
  React state.
- Deliverable: a one-page decision note in `docs/plans/` + the winning
  branch. Everything below assumes the thin custom client (adjust if spike
  says otherwise).

### Task 2 — Agent endpoint: `src/app/api/agent/route.ts`
- POST route (nodejs runtime), auth via `getCurrentUser()`, Zod-validated
  body `{ conversationId?, role, message }`.
- Uses AI SDK `streamText` with the role's system prompt (reuse
  `src/features/guide/prompts.ts`) + tools (Task 3).
- A mapping layer translates AI SDK stream parts → AG-UI events
  (`RUN_STARTED`, `TEXT_MESSAGE_CONTENT` deltas, `TOOL_CALL_START/ARGS/END`,
  `STATE_DELTA`, `RUN_FINISHED`, `RUN_ERROR`), emitted as SSE.
- Persistence: same tables as today (`guide_conversations`,
  `guide_messages`); assistant message assembled from the stream and saved
  on `RUN_FINISHED`, structured payloads into `structuredResponse` jsonb.
- The legacy `/api/guide` route stays until the UI is migrated, then dies.

### Task 3 — Tools (server-side, Zod-schematized)
Each tool is a plain function in `src/features/guide/tools/` with a Zod
input schema, registered with `streamText`:

| Tool | Behavior | HITL? |
|---|---|---|
| `search_journal` | Full-text (ILIKE/tsvector) over the user's entries, top 5 snippets | no |
| `read_map` | Return the user's nodes/edges (labels + types) | no |
| `suggest_map_nodes` | Propose nodes/edges — emitted as a confirmation UI event; a server action performs the write only after user confirms | **yes** |
| `start_practice` | Emit a deep-link event the client renders as a "Begin practice" card | no (navigation only) |
| `recommend_content` | Query the content index by theme/tags, return 3 refs | no |

- HITL pattern: tool result = `{ pendingConfirmation: true, proposal }`;
  client renders confirm/decline; confirm calls the existing
  `src/features/map/actions.ts` mutations (they already enforce userId).

### Task 4 — Client: streaming guide view
- `src/features/guide/components/GuideChatView.tsx` consumes the AG-UI
  stream: token-by-token text, tool activity indicator ("Der Guide liest
  deine Records…"), generative UI blocks (PromptCardDisplay,
  ExerciseDisplay, VisualActivation already exist — they become event-driven
  renderers instead of post-hoc structured-response renderers).
- Confirmation UI for `suggest_map_nodes` (accept → action call → optimistic
  map badge; decline → tool result "declined").
- Abort/stop button (AbortController → run cancelled event).
- Motion: streaming text at Flow level; visual activations stay Sacred and
  intensity-gated.

### Task 5 — Shared state + context upgrade
- Conversation state (role, focus themes, active visual) synced via AG-UI
  `STATE_SNAPSHOT`/`STATE_DELTA` instead of ad-hoc props.
- `getUserContext` (src/features/guide/context.ts) becomes a tool-accessible
  provider; keep last-20-messages until Phase 3 swaps in Records retrieval.

### Task 6 — Hardening + tests
- Rate limit (per-user, simple upstash-free counter table or in-memory LRU
  per instance — document the ceiling).
- Playwright: guide happy path (send → streamed text appears), tool
  confirmation flow (mock model via env flag `AI_MOCK=1` returning a
  scripted stream), abort flow.
- Sentry breadcrumbs for run lifecycle events.

## Exit criteria
Guide streams token-by-token; renders at least prompt-card + exercise as
generative UI during the stream; three tools work end-to-end with the map
write behind explicit user confirmation; all events AG-UI-conformant; legacy
route removed.
