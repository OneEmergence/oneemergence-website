'use server'

import { requireDb } from '@/lib/db'
import { practices } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { eq, desc } from 'drizzle-orm'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string }

export interface PracticeSession {
  id: string
  type: string
  duration: number
  completedAt: Date
  notes: string | null
}

type HistoryResult =
  | { success: true; data: PracticeSession[] }
  | { success: false; error: string }

export async function getPracticeHistory(): Promise<HistoryResult> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const rows = await db
      .select({
        id: practices.id,
        type: practices.type,
        duration: practices.duration,
        completedAt: practices.completedAt,
        notes: practices.notes,
      })
      .from(practices)
      .where(eq(practices.userId, user.id as string))
      .orderBy(desc(practices.completedAt))
      .limit(100)

    return { success: true, data: rows as PracticeSession[] }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Verlauf konnte nicht geladen werden.',
    }
  }
}

export async function logPractice(formData: FormData): Promise<ActionResult> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const type = formData.get('type') as string
    const durationRaw = formData.get('duration') as string
    const notes = (formData.get('notes') as string) || null

    if (!type || !durationRaw) {
      return { success: false, error: 'Typ und Dauer sind erforderlich.' }
    }

    const duration = parseInt(durationRaw, 10)
    if (isNaN(duration) || duration <= 0) {
      return { success: false, error: 'Ungültige Dauer.' }
    }

    const validTypes = ['meditation', 'breathwork', 'soundscape']
    if (!validTypes.includes(type)) {
      return { success: false, error: 'Ungültiger Praxistyp.' }
    }

    const [inserted] = await db
      .insert(practices)
      .values({
        userId: user.id as string,
        type,
        duration,
        notes,
      })
      .returning({ id: practices.id })

    revalidatePath('/inner/practice')
    revalidatePath('/inner/practice/history')

    return { success: true, data: { id: inserted.id } }
  } catch (error) {
    console.error('logPractice error:', error)
    return {
      success: false,
      error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
    }
  }
}
