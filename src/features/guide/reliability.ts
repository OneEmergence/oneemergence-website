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
 * hits `canReuseUserMessage`, so the retry answers it without a duplicate row.
 */
export function unansweredTail(latest: LatestGuideMessage | undefined): string | undefined {
  return latest?.role === 'user' ? latest.content : undefined
}
