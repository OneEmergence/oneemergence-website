'use server'

import { z } from 'zod'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { requireDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { userPreferences } from '@/lib/db/schema'

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const onboardingSchema = z.object({
  intensityMode: z.enum(['still', 'balanced', 'immersive']),
  focusThemes: z.string().transform((v) => {
    return z.array(z.string()).parse(JSON.parse(v))
  }),
  audioEnabled: z
    .enum(['true', 'false'])
    .transform((v) => v === 'true'),
})

// ---------------------------------------------------------------------------
// Result type
// ---------------------------------------------------------------------------

type OnboardingResult =
  | { success: true }
  | { success: false; error: string }

// ---------------------------------------------------------------------------
// Action
// ---------------------------------------------------------------------------

/**
 * Onboarding abschließen und Nutzer-Einstellungen speichern.
 * Erstellt einen neuen Eintrag oder aktualisiert den bestehenden (Upsert).
 */
export async function completeOnboarding(
  formData: FormData
): Promise<OnboardingResult> {
  try {
    const db = requireDb()
    const user = await requireAuth()

    const raw = Object.fromEntries(formData.entries())
    const parsed = onboardingSchema.parse(raw)

    const values = {
      intensityMode: parsed.intensityMode as 'still' | 'balanced' | 'immersive',
      audioEnabled: parsed.audioEnabled,
      focusThemes: parsed.focusThemes,
      onboardingCompleted: true,
      updatedAt: new Date(),
    }

    const existing = await db
      .select({ id: userPreferences.id })
      .from(userPreferences)
      .where(eq(userPreferences.userId, user.id!))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(userPreferences)
        .set(values)
        .where(eq(userPreferences.userId, user.id!))
    } else {
      await db.insert(userPreferences).values({
        userId: user.id!,
        ...values,
      })
    }

    revalidatePath('/inner')

    return { success: true }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Onboarding konnte nicht abgeschlossen werden.'
    return { success: false, error: message }
  }
}
