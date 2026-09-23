// Pure Guide request decisions. No server imports, so tests/guide can run them
// without a database, provider or Next runtime.

export type LatestGuideMessage = { role: 'user' | 'assistant'; content: string }

/**
 * A retry reuses the stored user message when it is the unanswered tail of the
 * conversation with identical content, instead of inserting a duplicate.
 */
export function canReuseUserMessage(
  latest: LatestGuideMessage | undefined,
  message: string
): boolean {
  return latest?.role === 'user' && latest.content === message
}

export type GuideTurn = 'new' | 'reuse' | 'replay'

/**
 * How the server answers a message. `tail` is the conversation's last two
 * stored messages, newest first.
 * - `reuse`: the message is the unanswered tail; answer it without a duplicate
 *   row. Safe on a text match alone, since there is no reply to repeat wrongly.
 * - `replay`: an explicit retry of a message whose reply was stored but never
 *   reached the client; return that reply (no insert, no provider call, no
 *   limit tick). Needs the flag: without it the same text sent twice is two turns.
 * ponytail: a retry after a deliberate repeat of the previous answered text
 * replays that old reply; a client message id (needs a column) would tell them apart.
 */
export function decideGuideTurn(
  tail: readonly LatestGuideMessage[],
  message: string,
  retry: boolean
): GuideTurn {
  const [latest, previous] = tail
  if (canReuseUserMessage(latest, message)) return 'reuse'
  if (retry && latest?.role === 'assistant' && canReuseUserMessage(previous, message)) {
    return 'replay'
  }
  return 'new'
}

/**
 * `sentLast24h` counts the account's stored user messages. A reused message is
 * already part of that count, so retrying it is allowed up to the limit itself;
 * a new message needs a free slot.
 */
export function isGuideLimitReached(
  sentLast24h: number,
  limit: number,
  reusesStoredMessage: boolean
): boolean {
  return reusesStoredMessage ? sentLast24h > limit : sentLast24h >= limit
}

/**
 * The content of an unanswered user message at the tail of a stored
 * conversation (failed, cancelled or lost first response). Sending it again
 * is a `reuse` turn, so it is answered without a duplicate row.
 */
export function unansweredTail(latest: LatestGuideMessage | undefined): string | undefined {
  return latest?.role === 'user' ? latest.content : undefined
}
