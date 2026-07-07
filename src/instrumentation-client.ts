import * as Sentry from '@sentry/nextjs'

// This file runs in the browser bundle — it MUST keep literal
// `process.env.NEXT_PUBLIC_*` reads (not `@/lib/env`). Next.js statically
// replaces these exact `process.env.NEXT_PUBLIC_X` textual references at
// build time; a dynamic/re-exported access would resolve to `undefined`
// client-side. See src/lib/supabase/client.ts for the same rule.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
    Sentry.browserTracingIntegration(),
  ],
})

// Records App Router client-side navigations as Sentry spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
