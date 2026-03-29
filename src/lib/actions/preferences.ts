'use server'

import { z } from 'zod'
import { eq } from 'drizzle-orm'

import { requireDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { userPreferences } from '@/lib/db/schema'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const preferencesSchema = z.object({
  intensityMode: z
    .enum(['still', 'balanced', 'immersive'])
    .optional(),
  audioEnabled: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
  focusThemes: z
    .string()
    .transform((v) => {
      try {
        return z.array(z.string()).parse(JSON.parse(v))
      } catch {
        return undefined
      }
    })
    .optional(),
  onboardingCompleted: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true')
    .optional(),
})

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

type UpdateResult =
  | { success: true }
  | { success: false; error: string }

export interface PreferencesRow {
  intensityMode: 'still' | 'balanced' | 'immersive'
  audioEnabled: boolean
  focusThemes: string[]
  onboardingCompleted: boolean
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/**
 * Nutzer-Einstellungen aktualisieren (Upsert).
 * Erstellt einen Eintrag, falls noch keiner existiert.
 */
export async function updatePreferences(
  formData: FormData
): Promise<UpdateResult> {
  try {
    const db = requireDb()
    const user = await requireAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = preferencesSchema.parse(raw)

    // Nur definierte Felder in das Update aufnehmen
    const updates: Record<string, unknown> = { updatedAt: new Date() }
    if (parsed.intensityMode !== undefined)
      updates.intensityMode = parsed.intensityMode
    if (parsed.audioEnabled !== undefined)
      updates.audioEnabled = parsed.audioEnabled
    if (parsed.focusThemes !== undefined)
      updates.focusThemes = parsed.focusThemes
    if (parsed.onboardingCompleted !== undefined)
      updates.onboardingCompleted = parsed.onboardingCompleted

    const existing = await db
      .select({ id: userPreferences.id })
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id!))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(userPreferences)
        .set(updates)
        .where(eq(userPreferences.userId, user.id!))
    } else {
      await db.insert(userPreferences).values({
        userId: user.id!,
        ...updates,
      })
    }

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Einstellungen konnten nicht gespeichert werden.'
    return { success: false, error: message }
  }
}

/**
 * Einstellungen des aktuellen Nutzers laden.
 * Gibt null zurück, wenn kein Nutzer eingeloggt oder keine DB konfiguriert ist.
 */
export async function getPreferences(): Promise<PreferencesRow | null> {
  try {
    const db = requireDb()
    const user = await requireAuth()

    const rows = await db
      .select({
        intensityMode: userPreferences.intensityMode,
        audioEnabled: userPreferences.audioEnabled,
        focusThemes: userPreferences.focusThemes,
        onboardingCompleted: userPreferences.onboardingCompleted,
      })
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id!))
      .limit(1)

    if (rows.length === 0) return null

    const row = rows[0]
    return {
      intensityMode: row.intensityMode ?? 'balanced',
      audioEnabled: row.audioEnabled ?? false,
      focusThemes: row.focusThemes ?? [],
      onboardingCompleted: row.onboardingCompleted ?? false,
    }
  } catch {
    return null
  }
}
