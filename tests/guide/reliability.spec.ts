import { expect, test } from '@playwright/test'
import { canReuseUserMessage, isGuideLimitReached } from '../../src/features/guide/reliability'

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
