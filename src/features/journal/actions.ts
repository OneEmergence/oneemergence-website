'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, desc } from 'drizzle-orm'
import { requireDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth/session'
import { journalEntries } from '@/lib/db/schema'
import { JournalEntryInputSchema } from './schemas'
import { generateNodesFromJournal } from '@/features/map/generate-nodes'
import type { JournalEntry } from './types'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

export async function createEntry(
  formData: FormData
): Promise<ActionResult<JournalEntry>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const raw = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      moodTags: JSON.parse((formData.get('moodTags') as string) || '[]'),
      themes: JSON.parse((formData.get('themes') as string) || '[]'),
    }

    const parsed = JournalEntryInputSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId: user.id!,
        title: parsed.data.title,
        content: parsed.data.content,
        moodTags: parsed.data.moodTags,
        themes: parsed.data.themes,
      })
      .returning()

    // Generate consciousness map nodes from journal content
    try {
      await generateNodesFromJournal(
        user.id!,
        entry.id,
        parsed.data.title,
        parsed.data.content
      )
    } catch {
      // Map node generation is non-critical — don't fail the journal save
    }

    revalidatePath('/inner/journal')
    revalidatePath('/inner/map')

    return {
      success: true,
      data: entry as unknown as JournalEntry,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function updateEntry(
  id: string,
  formData: FormData
): Promise<ActionResult<JournalEntry>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    // Verify ownership
    const [existing] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id!)))

    if (!existing) {
      return { success: false, error: 'Eintrag nicht gefunden.' }
    }

    const raw = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      moodTags: JSON.parse((formData.get('moodTags') as string) || '[]'),
      themes: JSON.parse((formData.get('themes') as string) || '[]'),
    }

    const parsed = JournalEntryInputSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message }
    }

    const [updated] = await db
      .update(journalEntries)
      .set({
        title: parsed.data.title,
        content: parsed.data.content,
        moodTags: parsed.data.moodTags,
        themes: parsed.data.themes,
        updatedAt: new Date(),
      })
      .where(eq(journalEntries.id, id))
      .returning()

    revalidatePath('/inner/journal')

    return {
      success: true,
      data: updated as unknown as JournalEntry,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function deleteEntry(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    // Verify ownership
    const [existing] = await db
      .select()
      .from(journalEntries)
      .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id!)))

    if (!existing) {
      return { success: false, error: 'Eintrag nicht gefunden.' }
    }

    await db
      .delete(journalEntries)
      .where(eq(journalEntries.id, id))

    revalidatePath('/inner/journal')

    return { success: true, data: { id } }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function getEntries(): Promise<ActionResult<JournalEntry[]>> {
  try {
    const user = await requireAuth()
    const db = requireDb()

    const entries = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id!))
      .orderBy(desc(journalEntries.createdAt))

    return {
      success: true,
      data: entries as unknown as JournalEntry[],
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}
