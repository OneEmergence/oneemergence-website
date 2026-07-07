'use server'

import { requireDb } from '@/lib/db'
import { practices } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'
import { eq, desc } from 'drizzle-orm'
import { LogPracticeInputSchema } from './schemas'

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

    const parsed = LogPracticeInputSchema.safeParse({
      type: formData.get('type'),
      duration: formData.get('duration'),
      notes: formData.get('notes') ?? undefined,
    })

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [inserted] = await db
      .insert(practices)
      .values({
        userId: user.id as string,
        type: parsed.data.type,
        duration: parsed.data.duration,
        notes: parsed.data.notes,
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
