// Auth utilities — re-exported for convenience.
// The canonical implementations live in session.ts (server) and
// @/lib/supabase/client (browser).
export { getCurrentUser, requireAuth } from './session'
export type { AppUser } from './session'
