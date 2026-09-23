import { expect, test } from '@playwright/test'
import {
  canReuseUserMessage,
  decideGuideTurn,
  isGuideLimitReached,
  unansweredTail,
} from '../../src/features/guide/reliability'

// Tails are newest first, as the route loads them.
const answered = [
  { role: 'assistant' as const, content: 'Antwort' },
  { role: 'user' as const, content: 'Hallo' },
]
const unanswered = [
  { role: 'user' as const, content: 'Hallo' },
  { role: 'assistant' as const, content: 'Frühere Antwort' },
]

test('a retry of an answered message replays the stored reply', () => {
  expect(decideGuideTurn(answered, 'Hallo', true)).toBe('replay')
})

test('a retry of the unanswered tail reuses it', () => {
  expect(decideGuideTurn(unanswered, 'Hallo', true)).toBe('reuse')
  expect(decideGuideTurn(unanswered.slice(0, 1), 'Hallo', true)).toBe('reuse')
})

test('a retry with different text is a new turn', () => {
  expect(decideGuideTurn(answered, 'Etwas anderes', true)).toBe('new')
  expect(decideGuideTurn(unanswered, 'Etwas anderes', true)).toBe('new')
  expect(decideGuideTurn([], 'Hallo', true)).toBe('new')
})

test('without retry an answered text sent again is a new turn', () => {
  expect(decideGuideTurn(answered, 'Hallo', false)).toBe('new')
})

test('the unanswered tail is reused even without the flag (older clients, retyped text)', () => {
  expect(decideGuideTurn(unanswered, 'Hallo', false)).toBe('reuse')
})

test('a retry reuses only an unanswered user message with the same content', () => {
  expect(canReuseUserMessage(undefined, 'Hallo')).toBe(false)
  expect(canReuseUserMessage({ role: 'assistant', content: 'Hallo' }, 'Hallo')).toBe(false)
  expect(canReuseUserMessage({ role: 'user', content: 'Etwas anderes' }, 'Hallo')).toBe(false)
  expect(canReuseUserMessage({ role: 'user', content: 'Hallo' }, 'Hallo')).toBe(true)
})

test('a new message needs a free slot below the daily limit', () => {
  expect(isGuideLimitReached(0, 3, false)).toBe(false)
  expect(isGuideLimitReached(2, 3, false)).toBe(false)
  expect(isGuideLimitReached(3, 3, false)).toBe(true)
  expect(isGuideLimitReached(4, 3, false)).toBe(true)
})

test('retrying the stored message that used the last slot stays allowed', () => {
  expect(isGuideLimitReached(3, 3, true)).toBe(false)
  expect(isGuideLimitReached(4, 3, true)).toBe(true)
})

test('only a user message at the tail is offered for retry after a reload', () => {
  expect(unansweredTail(undefined)).toBeUndefined()
  expect(unansweredTail({ role: 'assistant', content: 'Antwort' })).toBeUndefined()
  expect(unansweredTail({ role: 'user', content: 'Hallo' })).toBe('Hallo')
})

test('the offered tail is exactly what the server reuses instead of inserting again', () => {
  const tail = { role: 'user' as const, content: 'Hallo' }
  expect(decideGuideTurn([tail], unansweredTail(tail)!, true)).toBe('reuse')
})
