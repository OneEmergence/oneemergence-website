import { spawnSync } from 'node:child_process'
import { expect, test } from '@playwright/test'

function bootEnv(values: Record<string, string>) {
  // A fresh process exercises the real module's boot validation without using
  // the developer's keys, importing Next, or contacting any external service.
  return spawnSync(process.execPath, ['--experimental-strip-types', 'src/lib/env.ts'], {
    cwd: process.cwd(),
    env: {
      SystemRoot: process.env.SystemRoot,
      PATH: process.env.PATH,
      NODE_ENV: 'development',
      ...values,
    },
    encoding: 'utf8',
  })
}

test('blank optional integrations allow boot; required production values remain enforced', () => {
  const optional = { ANTHROPIC_API_KEY: '', NEXT_PUBLIC_SENTRY_DSN: ' ', AI_MODEL: '' }
  expect(bootEnv({ NODE_ENV: 'development', ...optional }).status).toBe(0)
  expect(
    bootEnv({ NODE_ENV: 'production', NEXT_PHASE: 'phase-production-build', ...optional }).status
  ).toBe(0)

  const missing = bootEnv({ NODE_ENV: 'production', NEXT_PUBLIC_SUPABASE_URL: ' ' })
  expect(missing.status).not.toBe(0)
  expect(missing.stderr).toContain('Missing required environment variables in production')

  const invalid = bootEnv({ NEXT_PUBLIC_SUPABASE_URL: 'invalid-url' })
  expect(invalid.status).not.toBe(0)
  expect(invalid.stderr).toContain('Invalid environment variables')
})
