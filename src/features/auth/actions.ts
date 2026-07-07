'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { eq, inArray } from 'drizzle-orm'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth/session'
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
async function getOrigin(): Promise<string> {
  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin
  const host = h.get('x-forwarded-host') ?? h.get('host')
  const proto = h.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : ''
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
  const origin = await getOrigin()
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
  const origin = await getOrigin()
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
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
  const origin = await getOrigin()
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
  const origin = await getOrigin()
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
    const user = await requireAuth()

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
    const user = await requireAuth()

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
  if (typeof avatarUrl !== 'string' || avatarUrl.length === 0) {
    return { status: 'error', error: 'Ungültige Avatar-Adresse.' }
  }

  try {
    const db = requireDb()
    const user = await requireAuth()

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
 * Gather every row the user owns across the 9 application tables into a single
 * JSON object. The client turns this into a downloadable file. "Privacy is
 * absolute" — the user can take everything with them.
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
    ] = await Promise.all([
      db.select().from(profiles).where(eq(profiles.id, uid)),
      db.select().from(userPreferences).where(eq(userPreferences.userId, uid)),
      db.select().from(journalEntries).where(eq(journalEntries.userId, uid)),
      db.select().from(practices).where(eq(practices.userId, uid)),
      db.select().from(mapNodes).where(eq(mapNodes.userId, uid)),
      db.select().from(mapEdges).where(eq(mapEdges.userId, uid)),
      db.select().from(guideConversations).where(eq(guideConversations.userId, uid)),
      db.select().from(savedPromptCards).where(eq(savedPromptCards.userId, uid)),
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
 * Permanently delete the account: every user-owned row (FK-safe order) and
 * finally the auth user via the service-role admin client. Requires the user to
 * type the confirmation word. If the service role is not configured, fails with
 * a clear message rather than leaving a half-deleted account.
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
      error:
        'Kontolöschung ist auf diesem Server nicht verfügbar (SUPABASE_SERVICE_ROLE_KEY fehlt). Bitte kontaktiere uns, damit wir dein Konto entfernen.',
    }
  }

  let uid: string
  try {
    const db = requireDb()
    const user = await requireAuth()
    uid = user.id

    // Delete owned rows in FK-safe order (edges before nodes, messages before
    // conversations). Uses the service-role Drizzle connection (bypasses RLS).
    const conversationRows = await db
      .select({ id: guideConversations.id })
      .from(guideConversations)
      .where(eq(guideConversations.userId, uid))
    const conversationIds = conversationRows.map((c) => c.id)

    await db.delete(savedPromptCards).where(eq(savedPromptCards.userId, uid))
    if (conversationIds.length > 0) {
      await db
        .delete(guideMessages)
        .where(inArray(guideMessages.conversationId, conversationIds))
    }
    await db.delete(guideConversations).where(eq(guideConversations.userId, uid))
    await db.delete(mapEdges).where(eq(mapEdges.userId, uid))
    await db.delete(mapNodes).where(eq(mapNodes.userId, uid))
    await db.delete(journalEntries).where(eq(journalEntries.userId, uid))
    await db.delete(practices).where(eq(practices.userId, uid))
    await db.delete(userPreferences).where(eq(userPreferences.userId, uid))
    await db.delete(profiles).where(eq(profiles.id, uid))
  } catch (error) {
    return {
      status: 'error',
      error:
        error instanceof Error
          ? error.message
          : 'Dein Konto konnte nicht gelöscht werden.',
    }
  }

  // Finally remove the auth user (cascades any residual FK rows too).
  const { error: adminError } = await admin.auth.admin.deleteUser(uid)
  if (adminError) {
    return {
      status: 'error',
      error:
        'Deine Daten wurden entfernt, aber das Auth-Konto konnte nicht gelöscht werden. Bitte kontaktiere uns.',
    }
  }

  // Clear the now-orphaned session and leave.
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}
