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

/**
 * Canonical origin used for `metadataBase`, canonicals, OG urls and the sitemap.
 *
 * The fallback is production-aware on purpose. Metadata is baked at build
 * time, and the REQUIRED_IN_PROD check below is deliberately skipped during
 * `next build` — so a production image built without NEXT_PUBLIC_SITE_URL
 * would otherwise bake `http://localhost:3000` into every canonical and
 * og:url. Falling back to the real origin keeps that failure mode harmless,
 * while a preview deploy that *does* set the var still gets its own origin.
 */
const PRODUCTION_ORIGIN = 'https://oneemergence.org'

export const siteUrl =
  env.NEXT_PUBLIC_SITE_URL ??
  (env.NODE_ENV === 'production' ? PRODUCTION_ORIGIN : 'http://localhost:3000')

// Skip during `next build` — this guards runtime boot, not build-time page-data
// collection (which has no runtime secrets and shouldn't need them).
// ponytail: NEXT_PHASE is Next's own build marker; no new dep.
if (env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build') {
  const missing = REQUIRED_IN_PROD.filter((key) => !env[key])
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables in production: ${missing.join(', ')}`)
  }
}
