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

  DATABASE_URL: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  AI_MODEL: z.string().min(1).default('claude-sonnet-5'),

  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  ANALYZE: z.string().optional(),
})

/** Optional in dev (graceful degrade), but a production boot without these is a misconfiguration. */
const REQUIRED_IN_PROD = [
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

if (env.NODE_ENV === 'production') {
  const missing = REQUIRED_IN_PROD.filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`)
  }
}
