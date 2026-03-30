import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Normalized user shape returned by auth helpers.
 * Maps Supabase Auth user metadata to the interface
 * that portal components and server actions expect.
 */
export interface AppUser {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

function toAppUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): AppUser {
  const meta = supabaseUser.user_metadata ?? {}
  return {
    id: supabaseUser.id,
    name: (meta.full_name as string) ?? (meta.name as string) ?? null,
    email: supabaseUser.email ?? null,
    image: (meta.avatar_url as string) ?? (meta.picture as string) ?? null,
  }
}

/**
 * Get the current user on the server.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return toAppUser(user)
}

/**
 * Require authentication on the server.
 * Redirects to /portal if not authenticated.
 */
export async function requireAuth(): Promise<AppUser> {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/portal')
  }
  return user
}
