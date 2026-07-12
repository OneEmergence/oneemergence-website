// =============================================================================
// Auth & Identity — shared types (feature-owned)
// =============================================================================

/**
 * Discriminated result returned by the auth form actions. Actions that succeed
 * by navigating away (sign-in, update-password) redirect server-side and never
 * resolve to a value on the client; actions that stay on the page (sign-up,
 * magic link, reset request, profile save) resolve to `success` with a message.
 */
export type AuthActionState =
  | { status: 'idle' }
  | { status: 'success'; message?: string }
  | { status: 'error'; error: string }

export const initialAuthState: AuthActionState = { status: 'idle' }

/** Profile fields editable in settings. */
export interface ProfileRow {
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
}

/** Shape of the GDPR data export — every user-owned row, grouped by table. */
export interface UserDataExport {
  exportedAt: string
  userId: string
  email: string | null
  profile: unknown | null
  preferences: unknown | null
  journalEntries: unknown[]
  practices: unknown[]
  mapNodes: unknown[]
  mapEdges: unknown[]
  guideConversations: unknown[]
  guideMessages: unknown[]
  savedPromptCards: unknown[]
  role: unknown | null
  workspaces: unknown[]
  workspaceMemberships: unknown[]
  workspaceProfiles: unknown[]
  workspaceMembershipEvents: unknown[]
}
