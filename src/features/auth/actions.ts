'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { eq, inArray } from 'drizzle-orm'

import { createClient } from '@/lib/supabase/server'
import { env, siteUrl } from '@/lib/env'
import { requireAuth } from '@/lib/auth/session'
import { requireWorkspaceAccess } from '@/features/workspaces'
import { requireDb } from '@/lib/db'
import {
  profiles,
  journalEntries,
  practices,
  mapNodes,
  mapEdges,
  userPreferences,
  guideConversations,
  guideMessages,
  savedPromptCards,
  userRoles,
  workspaces,
  workspaceMemberships,
  workspaceProfiles,
  workspaceMembershipEvents,
} from '@/lib/db/schema'
import { createAdminClient } from './admin'
import {
  SignInSchema,
  SignUpSchema,
  MagicLinkSchema,
  ResetRequestSchema,
  UpdatePasswordSchema,
  ProfileSchema,
  DeleteAccountSchema,
} from './schemas'
import type { AuthActionState, ProfileRow, UserDataExport } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Absolute origin of the current request, for OAuth / email redirect URLs. */
function getOrigin(): string {
  return new URL(siteUrl).origin
}

async function clearWorkspaceSelection(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('oe-workspace')
}

/** Map known Supabase auth error strings to calm German UI copy. */
function toGermanAuthError(message: string | undefined): string {
  const m = (message ?? '').toLowerCase()
  if (m.includes('invalid login credentials'))
    return 'E-Mail oder Passwort ist falsch.'
  if (m.includes('email not confirmed'))
    return 'Bitte bestätige zuerst deine E-Mail-Adresse.'
  if (m.includes('user already registered') || m.includes('already been registered'))
    return 'Diese E-Mail-Adresse ist bereits registriert.'
  if (m.includes('rate limit') || m.includes('too many'))
    return 'Zu viele Versuche. Bitte warte einen Moment und versuche es erneut.'
  if (m.includes('password'))
    return 'Das Passwort erfüllt die Anforderungen nicht.'
  return 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
}

function firstZodMessage(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? 'Ungültige Eingabe.'
}

// ---------------------------------------------------------------------------
// Sign in / up
// ---------------------------------------------------------------------------

/** Email + password sign-in. Redirects to /inner on success. */
export async function signInWithPassword(
  formData: FormData
): Promise<AuthActionState> {
  const parsed = SignInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { status: 'error', error: toGermanAuthError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/inner')
}

/**
 * Sign up with email + password. If email confirmation is required (no session
 * returned) the user is asked to check their inbox; otherwise they enter directly.
 */
export async function signUp(formData: FormData): Promise<AuthActionState> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    displayName: formData.get('displayName') || undefined,
  })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  const supabase = await createClient()
  const origin = getOrigin()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: parsed.data.displayName
        ? { full_name: parsed.data.displayName }
        : undefined,
    },
  })

  if (error) {
    return { status: 'error', error: toGermanAuthError(error.message) }
  }

  // Email confirmation enabled → no session yet.
  if (!data.session) {
    return {
      status: 'success',
      message:
        'Fast geschafft. Wir haben dir eine E-Mail gesendet — bestätige sie, um über die Schwelle zu treten.',
    }
  }

  revalidatePath('/', 'layout')
  redirect('/inner')
}

/** Passwordless magic-link sign-in. */
export async function signInWithMagicLink(
  formData: FormData
): Promise<AuthActionState> {
  const parsed = MagicLinkSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  const supabase = await createClient()
  const origin = getOrigin()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: false,
    },
  })

  if (error) {
    return { status: 'error', error: toGermanAuthError(error.message) }
  }

  return {
    status: 'success',
    message:
      'Wir haben dir einen magischen Link gesendet. Öffne ihn auf diesem Gerät, um einzutreten.',
  }
}

/** Google OAuth. Redirects the browser to the provider consent screen. */
export async function signInWithGoogle(): Promise<AuthActionState> {
  const supabase = await createClient()
  const origin = getOrigin()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${origin}/auth/callback` },
  })

  if (error || !data.url) {
    return {
      status: 'error',
      error: 'Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.',
    }
  }

  redirect(data.url)
}

/** Sign out and return to the public site. */
export async function signOut(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  await clearWorkspaceSelection()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

/** Send a password-reset email. Always reports success (no account enumeration). */
export async function resetPassword(
  formData: FormData
): Promise<AuthActionState> {
  const parsed = ResetRequestSchema.safeParse({ email: formData.get('email') })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  const supabase = await createClient()
  const origin = getOrigin()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  })

  if (error) {
    return { status: 'error', error: toGermanAuthError(error.message) }
  }

  return {
    status: 'success',
    message:
      'Wenn ein Konto zu dieser Adresse existiert, haben wir dir einen Link zum Zurücksetzen gesendet.',
  }
}

/** Set a new password (used after arriving via the recovery link). */
export async function updatePassword(
  formData: FormData
): Promise<AuthActionState> {
  const parsed = UpdatePasswordSchema.safeParse({
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      status: 'error',
      error:
        'Dein Wiederherstellungslink ist abgelaufen. Bitte fordere einen neuen an.',
    }
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  })

  if (error) {
    return { status: 'error', error: toGermanAuthError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/inner')
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/** Load the current user's profile row. */
export async function getProfile(): Promise<ProfileRow | null> {
  try {
    const db = requireDb()
    const { user } = await requireWorkspaceAccess()

    const rows = await db
      .select({
        displayName: profiles.displayName,
        bio: profiles.bio,
        avatarUrl: profiles.avatarUrl,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1)

    if (rows.length === 0) return { displayName: user.name, bio: null, avatarUrl: user.image }
    return rows[0]
  } catch {
    return null
  }
}

/** Update display name and bio. */
export async function updateProfile(
  formData: FormData
): Promise<AuthActionState> {
  const parsed = ProfileSchema.safeParse({
    displayName: formData.get('displayName') || undefined,
    bio: formData.get('bio') || undefined,
  })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  try {
    const db = requireDb()
    const { user } = await requireWorkspaceAccess()

    await db
      .insert(profiles)
      .values({
        id: user.id,
        displayName: parsed.data.displayName ?? null,
        bio: parsed.data.bio ?? null,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          displayName: parsed.data.displayName ?? null,
          bio: parsed.data.bio ?? null,
          updatedAt: new Date(),
        },
      })

    revalidatePath('/inner/settings')
    revalidatePath('/inner')

    return { status: 'success', message: 'Gespeichert.' }
  } catch (error) {
    return {
      status: 'error',
      error:
        error instanceof Error
          ? error.message
          : 'Profil konnte nicht gespeichert werden.',
    }
  }
}

/**
 * Persist the public URL of an uploaded avatar. The file itself is uploaded
 * client-side (browser Supabase client) to the 'avatars' storage bucket; this
 * only records the resulting URL on the profile.
 */
export async function updateAvatarUrl(
  avatarUrl: string
): Promise<AuthActionState> {
  if (
    typeof avatarUrl !== 'string' ||
    avatarUrl.length === 0 ||
    avatarUrl.length > 2048 ||
    !URL.canParse(avatarUrl)
  ) {
    return { status: 'error', error: 'Ungültige Avatar-Adresse.' }
  }

  try {
    const db = requireDb()
    const { user } = await requireWorkspaceAccess()
    const storageUrl = env.NEXT_PUBLIC_SUPABASE_URL
    if (!storageUrl) {
      return { status: 'error', error: 'Avatar-Upload ist nicht konfiguriert.' }
    }

    const parsedUrl = new URL(avatarUrl)
    const expectedOrigin = new URL(storageUrl).origin
    const expectedPath = `/storage/v1/object/public/avatars/${user.id}/`
    if (
      parsedUrl.origin !== expectedOrigin ||
      !parsedUrl.pathname.startsWith(expectedPath)
    ) {
      return { status: 'error', error: 'Ungültige Avatar-Adresse.' }
    }

    await db
      .insert(profiles)
      .values({ id: user.id, avatarUrl, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: profiles.id,
        set: { avatarUrl, updatedAt: new Date() },
      })

    revalidatePath('/inner/settings')
    revalidatePath('/inner')

    return { status: 'success', message: 'Profilbild aktualisiert.' }
  } catch (error) {
    return {
      status: 'error',
      error:
        error instanceof Error
          ? error.message
          : 'Profilbild konnte nicht gespeichert werden.',
    }
  }
}

// ---------------------------------------------------------------------------
// GDPR lifecycle — data export & account deletion
// ---------------------------------------------------------------------------

type ExportResult =
  | { success: true; data: UserDataExport }
  | { success: false; error: string }

/**
 * Gather the user's identity, access, personalization, and private application
 * rows into a single JSON object. The client turns this into a downloadable
 * file. "Privacy is absolute" — the user can take everything with them.
 */
export async function exportUserData(): Promise<ExportResult> {
  try {
    const db = requireDb()
    const user = await requireAuth()
    const uid = user.id

    const [
      profileRows,
      preferenceRows,
      journalRows,
      practiceRows,
      nodeRows,
      edgeRows,
      conversationRows,
      cardRows,
      roleRows,
      membershipRows,
      workspaceProfileRows,
      membershipEventRows,
    ] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.id, uid)),
      db.select().from(userPreferences).where(eq(userPreferences.userId, uid)),
      db.select().from(journalEntries).where(eq(journalEntries.userId, uid)),
      db.select().from(practices).where(eq(practices.userId, uid)),
      db.select().from(mapNodes).where(eq(mapNodes.userId, uid)),
      db.select().from(mapEdges).where(eq(mapEdges.userId, uid)),
      db.select().from(guideConversations).where(eq(guideConversations.userId, uid)),
      db.select().from(savedPromptCards).where(eq(savedPromptCards.userId, uid)),
      db.select().from(userRoles).where(eq(userRoles.userId, uid)),
      db
        .select()
        .from(workspaceMemberships)
        .where(eq(workspaceMemberships.userId, uid)),
      db
        .select()
        .from(workspaceProfiles)
        .where(eq(workspaceProfiles.userId, uid)),
      db
        .select()
        .from(workspaceMembershipEvents)
        .where(eq(workspaceMembershipEvents.userId, uid)),
    ])

    // guide_messages has no user_id — scope through owned conversations.
    const conversationIds = conversationRows.map((c) => c.id)
    const messageRows =
      conversationIds.length > 0
        ? await db
            .select()
            .from(guideMessages)
            .where(inArray(guideMessages.conversationId, conversationIds))
        : []

    const workspaceIds = membershipRows.map((membership) => membership.workspaceId)
    const workspaceRows =
      workspaceIds.length > 0
        ? await db
            .select()
            .from(workspaces)
            .where(inArray(workspaces.id, workspaceIds))
        : []

    const data: UserDataExport = {
      exportedAt: new Date().toISOString(),
      userId: uid,
      email: user.email,
      profile: profileRows[0] ?? null,
      preferences: preferenceRows[0] ?? null,
      journalEntries: journalRows,
      practices: practiceRows,
      mapNodes: nodeRows,
      mapEdges: edgeRows,
      guideConversations: conversationRows,
      guideMessages: messageRows,
      savedPromptCards: cardRows,
      role: roleRows[0] ?? null,
      workspaces: workspaceRows,
      workspaceMemberships: membershipRows,
      workspaceProfiles: workspaceProfileRows,
      workspaceMembershipEvents: membershipEventRows,
    }

    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Deine Daten konnten nicht exportiert werden.',
    }
  }
}

/**
 * Permanently delete the auth user through the service-role admin client.
 * Every user-owned row references auth.users with ON DELETE CASCADE, so the
 * database performs the deletion atomically instead of a fragile manual sweep.
 * Requires the confirmation word and a sign-in no more than 15 minutes old.
 * Admins must first hand their role to another account and be demoted.
 */
export async function deleteAccount(
  formData: FormData
): Promise<AuthActionState> {
  const parsed = DeleteAccountSchema.safeParse({
    confirmation: formData.get('confirmation'),
  })
  if (!parsed.success) {
    return { status: 'error', error: firstZodMessage(parsed.error) }
  }

  const admin = createAdminClient()
  if (!admin) {
    return {
      status: 'error',
      error: 'deletion-unavailable',
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/portal')

  const signedInAt = Date.parse(user.last_sign_in_at ?? '')
  if (
    !Number.isFinite(signedInAt) ||
    Date.now() - signedInAt > 15 * 60 * 1000
  ) {
    return {
      status: 'error',
      error: 'recent-sign-in-required',
    }
  }

  const uid = user.id
  const [roleRow] = await requireDb()
    .select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, uid))
    .limit(1)
  if (roleRow?.role === 'admin') {
    return { status: 'error', error: 'admin-deletion-forbidden' }
  }

  const avatarPaths: string[] = []
  let avatarListError: string | null = null
  const avatarFolders = [uid]

  for (let folderIndex = 0; folderIndex < avatarFolders.length; folderIndex++) {
    const folder = avatarFolders[folderIndex]

    for (let offset = 0; ; offset += 1000) {
      const { data: avatarFiles, error } = await admin.storage
        .from('avatars')
        .list(folder, { limit: 1000, offset })

      if (error) {
        avatarListError = error.message
        break
      }

      for (const file of avatarFiles ?? []) {
        const path = `${folder}/${file.name}`
        if (file.id === null) {
          avatarFolders.push(path)
        } else {
          avatarPaths.push(path)
        }
      }

      if (!avatarFiles || avatarFiles.length < 1000) break
    }

    if (avatarListError) break
  }

  if (avatarListError) {
    console.error('[Account deletion] Avatar listing failed', avatarListError)
    return { status: 'error', error: 'deletion-failed' }
  }

  for (let offset = 0; offset < avatarPaths.length; offset += 1000) {
    const { error: storageError } = await admin.storage
      .from('avatars')
      .remove(avatarPaths.slice(offset, offset + 1000))
    if (storageError) {
      console.error('[Account deletion] Avatar cleanup failed', storageError)
      return { status: 'error', error: 'deletion-failed' }
    }
  }

  const { error: adminError } = await admin.auth.admin.deleteUser(uid)
  if (adminError) {
    return {
      status: 'error',
      error: 'deletion-failed',
    }
  }

  // Clear the now-orphaned session and leave.
  await supabase.auth.signOut()
  await clearWorkspaceSelection()
  revalidatePath('/', 'layout')
  redirect('/')
}
