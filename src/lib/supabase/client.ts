import { createBrowserClient } from '@supabase/ssr'

// This is a browser client — it MUST keep literal `process.env.NEXT_PUBLIC_*`
// reads (not `@/lib/env`). Next.js statically replaces these exact
// `process.env.NEXT_PUBLIC_X` textual references at build time so the values
// are inlined into the client bundle; a dynamic/re-exported access (like the
// validated `env` object) would resolve to `undefined` in the browser.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
