import * as Sentry from '@sentry/nextjs'

/**
 * Next.js instrumentation hook (App Router, Next 15+).
 *
 * Registers the Sentry SDK for the runtime this server process is actually
 * running under. Runs once per server/edge instance at boot.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

// Captures errors from Server Components, Route Handlers, and Middleware
// that Next.js routes through the `onRequestError` instrumentation hook.
export const onRequestError = Sentry.captureRequestError
