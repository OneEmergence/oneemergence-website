'use server'

import { eq, and } from 'drizzle-orm'
import { requireDb } from '@/lib/db'
import { mapNodes, mapEdges } from '@/lib/db/schema'
import { extractThemes } from './extract-themes'
import { NODE_TYPE_COLORS } from '@/lib/schemas/map'

/**
 * Generate map nodes from a journal entry.
 *
 * 1. Creates a journal-entry node linked to the entry
 * 2. Extracts themes from content
 * 3. Creates or finds existing theme nodes
 * 4. Creates edges between journal-entry node and theme nodes
 * 5. Increments size of existing theme nodes (they grow with use)
 *
 * Returns the number of new nodes created.
 */
export async function generateNodesFromJournal(
  userId: string,
  entryId: string,
  title: string,
  content: string
): Promise<{ newNodes: number; themes: string[] }> {
  const db = requireDb()

  // 1. Create the journal-entry node
  const [entryNode] = await db
    .insert(mapNodes)
    .values({
      userId,
      type: 'journal-entry',
      label: title.length > 40 ? title.slice(0, 37) + '…' : title,
      description: content.slice(0, 200),
      sourceId: entryId,
      sourceType: 'journal-entry',
      color: NODE_TYPE_COLORS['journal-entry'],
      size: 1,
    })
    .returning()

  let newNodesCount = 1
  const detectedThemes: string[] = []

  // 2. Extract themes
  const themes = extractThemes(content)

  for (const extracted of themes) {
    detectedThemes.push(extracted.theme)

    // 3. Check if theme node already exists for this user
    const [existingTheme] = await db
      .select()
      .from(mapNodes)
      .where(
        and(
          eq(mapNodes.userId, userId),
          eq(mapNodes.type, 'theme'),
          eq(mapNodes.label, extracted.theme)
        )
      )

    let themeNodeId: string

    if (existingTheme) {
      // Grow existing theme node (increase size, capped at 10)
      const newSize = Math.min(existingTheme.size + 1, 10)
      await db
        .update(mapNodes)
        .set({ size: newSize })
        .where(eq(mapNodes.id, existingTheme.id))
      themeNodeId = existingTheme.id
    } else {
      // Create new theme node
      const [newThemeNode] = await db
        .insert(mapNodes)
        .values({
          userId,
          type: 'theme',
          label: extracted.theme,
          color: NODE_TYPE_COLORS['theme'],
          size: Math.min(extracted.weight, 3),
        })
        .returning()
      themeNodeId = newThemeNode.id
      newNodesCount++
    }

    // 4. Create edge between journal entry and theme
    await db.insert(mapEdges).values({
      userId,
      sourceNodeId: entryNode.id,
      targetNodeId: themeNodeId,
      label: null,
      strength: Math.min(extracted.weight, 3),
    })
  }

  return { newNodes: newNodesCount, themes: detectedThemes }
}
