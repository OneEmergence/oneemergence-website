'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, desc } from 'drizzle-orm'
import { requireDb, type Database } from '@/lib/db'
import { requireWorkspaceAccess } from '@/features/workspaces'
import { journalEntries, mapNodes } from '@/lib/db/schema'
import { JournalEntryIdSchema, JournalEntryInputSchema } from './schemas'
import { generateNodesFromJournal } from '@/features/map/generate-nodes'
import type { JournalEntry } from './types'

type ActionResult<T> = { success: true; data: T } | { success: false; error: string }

async function syncJournalMapCopy(
  tx: Pick<Database, 'update'>,
  entry: Pick<JournalEntry, 'id' | 'userId' | 'title' | 'content'>
) {
  await tx
    .update(mapNodes)
    .set({
      label: entry.title.length > 40 ? entry.title.slice(0, 37) + '…' : entry.title,
      description: entry.content.slice(0, 200),
    })
    .where(
      and(
        eq(mapNodes.userId, entry.userId),
        eq(mapNodes.sourceId, entry.id),
        eq(mapNodes.sourceType, 'journal-entry')
      )
    )
}

export async function createEntry(formData: FormData): Promise<ActionResult<JournalEntry>> {
  try {
    const { user } = await requireWorkspaceAccess()
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
    const requestedId = JournalEntryIdSchema.optional().safeParse(
      formData.get('entryId') ?? undefined
    )
    if (!requestedId.success) {
      return { success: false, error: requestedId.error.issues[0].message }
    }

    const entry = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(journalEntries)
        .values({
          id: requestedId.data,
          userId: user.id,
          title: parsed.data.title,
          content: parsed.data.content,
          moodTags: parsed.data.moodTags,
          themes: parsed.data.themes,
        })
        .onConflictDoNothing({ target: journalEntries.id })
        .returning()

      if (!created) {
        if (!requestedId.data) return undefined
        // A committed create may lose its response. Reusing the draft's ID
        // updates only its owner's row and applies any newer retry content.
        const [existing] = await tx
          .update(journalEntries)
          .set({ ...parsed.data, updatedAt: new Date() })
          .where(and(eq(journalEntries.id, requestedId.data), eq(journalEntries.userId, user.id)))
          .returning()
        if (!existing) return undefined
        await syncJournalMapCopy(tx, existing)
        return existing
      }

      // Publish the journal and its map copies together, so another tab cannot
      // edit/delete an entry before a delayed map insert recreates its old text.
      // A savepoint keeps map generation optional and rolls back any partial graph.
      try {
        await tx.transaction((mapTx) =>
          generateNodesFromJournal(
            mapTx,
            user.id,
            created.id,
            parsed.data.title,
            parsed.data.content
          )
        )
      } catch {
        // A journal save remains successful when map generation is unavailable.
      }

      return created
    })

    if (!entry) {
      return { success: false, error: 'Eintrag nicht gefunden.' }
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
      error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function updateEntry(
  id: string,
  formData: FormData
): Promise<ActionResult<JournalEntry>> {
  try {
    const { user } = await requireWorkspaceAccess()
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

    const updated = await db.transaction(async (tx) => {
      const [entry] = await tx
        .update(journalEntries)
        .set({
          title: parsed.data.title,
          content: parsed.data.content,
          moodTags: parsed.data.moodTags,
          themes: parsed.data.themes,
          updatedAt: new Date(),
        })
        .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
        .returning()

      if (!entry) return undefined

      // Map nodes retain a copy of the journal title and excerpt. Keep those
      // copies current, including after autosave, without changing map layout
      // or connections the user has created.
      await syncJournalMapCopy(tx, entry)

      return entry
    })

    if (!updated) {
      return { success: false, error: 'Eintrag nicht gefunden.' }
    }

    revalidatePath('/inner/journal')
    revalidatePath('/inner/map')

    return {
      success: true,
      data: updated as unknown as JournalEntry,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function deleteEntry(id: string): Promise<ActionResult<{ id: string }>> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()

    const deleted = await db.transaction(async (tx) => {
      const [entry] = await tx
        .delete(journalEntries)
        .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id)))
        .returning({ id: journalEntries.id })

      if (!entry) return undefined

      // source_id is polymorphic text, not a foreign key. Remove the private
      // excerpt explicitly; map_edges already cascade when their node is deleted.
      await tx
        .delete(mapNodes)
        .where(
          and(
            eq(mapNodes.userId, user.id),
            eq(mapNodes.sourceId, entry.id),
            eq(mapNodes.sourceType, 'journal-entry')
          )
        )

      return entry
    })

    if (!deleted) {
      return { success: false, error: 'Eintrag nicht gefunden.' }
    }

    revalidatePath('/inner/journal')
    revalidatePath('/inner/map')

    return { success: true, data: deleted }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}

export async function getEntries(): Promise<ActionResult<JournalEntry[]>> {
  try {
    const { user } = await requireWorkspaceAccess()
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
      error: error instanceof Error ? error.message : 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}
