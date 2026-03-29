import { redirect } from 'next/navigation'
import { auth } from './index'

/**
 * Get the current user session on the server.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth()
  return session?.user ?? null
}

/**
 * Require authentication on the server.
 * Redirects to /portal if not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/portal')
  }
  return user
}
