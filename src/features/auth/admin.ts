import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

// =============================================================================
// Supabase admin (service-role) client — server-only, privileged.
// =============================================================================
// The service-role key BYPASSES RLS and can perform auth.admin operations
// (e.g. deleting an auth user). It must NEVER reach the browser — the
// `server-only` import above makes an accidental client import a build error.
//
// Returns null when SUPABASE_SERVICE_ROLE_KEY (or the URL) is not configured,
// so callers can degrade to a clear, user-facing error instead of crashing.
// The only intended caller is the GDPR `deleteAccount` server action.

export function createAdminClient(): SupabaseClient | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
