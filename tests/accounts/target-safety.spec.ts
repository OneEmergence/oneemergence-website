import { expect, test } from '@playwright/test'
import { readDisposableConfig } from '../helpers/disposable-supabase'

test('disposable target configuration never falls back to application credentials', () => {
  expect(readDisposableConfig({})).toBeNull()
  expect(
    readDisposableConfig({
      NEXT_PUBLIC_SUPABASE_URL: 'https://application.example',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'application-public',
      SUPABASE_SERVICE_ROLE_KEY: 'application-private',
    })
  ).toBeNull()
  const explicit = {
    SUPABASE_TEST_URL: 'http://127.0.0.1:54321',
    SUPABASE_TEST_ANON_KEY: 'test-public',
    SUPABASE_TEST_SERVICE_ROLE_KEY: 'test-private',
  }
  expect(() => readDisposableConfig(explicit)).toThrow('SUPABASE_TEST_DISPOSABLE=1')
  expect(() => readDisposableConfig({ SUPABASE_TEST_DISPOSABLE: '1' })).toThrow('Incomplete')
  expect(readDisposableConfig({ ...explicit, SUPABASE_TEST_DISPOSABLE: '1' })?.url).toBe(
    'http://127.0.0.1:54321'
  )
  expect(() =>
    readDisposableConfig({
      ...explicit,
      SUPABASE_TEST_DISPOSABLE: '1',
      SUPABASE_TEST_URL: 'https://user:password@example.test',
    })
  ).toThrow('without credentials or paths')
})
