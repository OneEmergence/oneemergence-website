'use server'

import { requireDb } from '@/lib/db'
import { practices } from '@/lib/db/schema'
import { requireAuth } from '@/lib/auth/session'
import { revalidatePath } from 'next/cache'

type ActionResult =
  | { success: true; data: { id: string } }
  | { success: false; error: string }

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

    return { success: true, data: { id: inserted.id } }
  } catch (error) {
    console.error('logPractice error:', error)
    return {
      success: false,
      error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
    }
  }
}
