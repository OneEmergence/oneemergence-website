import { z } from 'zod'

/**
 * Server-side environment access, validated once at module load.
 *
 * Client components must keep literal `process.env.NEXT_PUBLIC_*` reads so
 * Next.js can inline them at build time — never import this file from a
 * 'use client' module.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),

  // Service-role key — privileged, server-only. Required exclusively for admin
  // operations (GDPR account deletion and avatar cleanup). Optional: the app
  // runs fully without it; only account deletion degrades to a clear error.
  // MUST never be imported into a 'use client' module or exposed to the browser.
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  DATABASE_URL: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).default('claude-sonnet-5'),

  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  ANALYZE: z.string().optional(),
})

/** Optional in dev (graceful degrade), but a production boot without these is a misconfiguration. */
const REQUIRED_IN_PROD = [
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'DATABASE_URL',
] as const

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors)
  throw new Error('Invalid environment variables — see log above')
}

export const env = parsed.data
export const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

if (env.NODE_ENV === 'production') {
  const missing = REQUIRED_IN_PROD.filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`)
  }
}
