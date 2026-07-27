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

  // Session Replay is NOT listed here on purpose. `replayIntegration()` pulls
  // the rrweb recorder (~150 KB gzipped) into the root bundle and parses it
  // before anything else — on every visit, while only 10% of sessions are
  // sampled. Tracing is small and stays eager.
  integrations: [Sentry.browserTracingIntegration()],
})

// Load the replay recorder after the page is interactive, so it never competes
// with hydration on the LCP/INP path. `lazyLoadIntegration` fetches it from the
// Sentry CDN bundle rather than the app bundle.
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const loadReplay = () => {
    void Sentry.lazyLoadIntegration('replayIntegration')
      .then((replayIntegration) => Sentry.addIntegration(replayIntegration()))
      // A blocked CDN must never surface as a user-visible error.
      .catch(() => {})
  }

  const idle = (window as Window).requestIdleCallback
  if (typeof idle === 'function') idle(loadReplay, { timeout: 5000 })
  else setTimeout(loadReplay, 3000)
}

// Records App Router client-side navigations as Sentry spans.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
