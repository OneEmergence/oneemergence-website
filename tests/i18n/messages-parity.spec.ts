import { expect, test } from '@playwright/test'
import de from '../../src/i18n/messages/de.json'
import en from '../../src/i18n/messages/en.json'

// AGENTS.md: every new UI string lands in both de.json and en.json.
// Several agents edit these files in parallel; this keeps the rule enforced.
function keys(messages: object, prefix = ''): string[] {
  return Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? keys(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

test('de.json and en.json define the same message keys', () => {
  const deKeys = new Set(keys(de))
  const enKeys = new Set(keys(en))

  expect([...deKeys].filter((key) => !enKeys.has(key)), 'only in de.json').toEqual([])
  expect([...enKeys].filter((key) => !deKeys.has(key)), 'only in en.json').toEqual([])
})
