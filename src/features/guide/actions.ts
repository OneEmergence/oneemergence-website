'use server'

import { revalidatePath } from 'next/cache'
import { eq, and, desc } from 'drizzle-orm'
import { requireDb } from '@/lib/db'
import { requireWorkspaceAccess } from '@/features/workspaces'
import {
  guideConversations,
  guideMessages,
  savedPromptCards,
} from '@/lib/db/schema'
import {
  GuideConversationId,
  PromptCard as PromptCardSchema,
} from './schemas'
import type {
  GuideConversation,
  GuideMessage,
  SavedCard,
  PromptCard,
} from './schemas'

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// =============================================================================
// Conversations
// =============================================================================

export async function getConversations(): Promise<
  ActionResult<GuideConversation[]>
> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()

    const conversations = await db
      .select()
      .from(guideConversations)
      .where(eq(guideConversations.userId, user.id!))
      .orderBy(desc(guideConversations.updatedAt))

    return {
      success: true,
      data: conversations as unknown as GuideConversation[],
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Konversationen konnten nicht geladen werden.',
    }
  }
}

export async function getConversation(
  id: string
): Promise<ActionResult<{ conversation: GuideConversation; messages: GuideMessage[] }>> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()

    const [conversation] = await db
      .select()
      .from(guideConversations)
      .where(
        and(
          eq(guideConversations.id, id),
          eq(guideConversations.userId, user.id!)
        )
      )

    if (!conversation) {
      return { success: false, error: 'Konversation nicht gefunden.' }
    }

    const messages = await db
      .select()
      .from(guideMessages)
      .where(eq(guideMessages.conversationId, id))
      .orderBy(guideMessages.createdAt)

    return {
      success: true,
      data: {
        conversation: conversation as unknown as GuideConversation,
        messages: messages as unknown as GuideMessage[],
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Konversation konnte nicht geladen werden.',
    }
  }
}

export async function deleteConversation(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()

    const [deleted] = await db
      .delete(guideConversations)
      .where(
        and(
          eq(guideConversations.id, id),
          eq(guideConversations.userId, user.id!)
        )
      )
      .returning({ id: guideConversations.id })

    if (!deleted) {
      return { success: false, error: 'Konversation nicht gefunden.' }
    }

    revalidatePath('/inner/guide')

    return { success: true, data: deleted }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Konversation konnte nicht gelöscht werden.',
    }
  }
}

// =============================================================================
// Saved Prompt Cards
// =============================================================================

export async function savePromptCard(
  card: PromptCard,
  conversationId?: string
): Promise<ActionResult<SavedCard>> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()
    const parsedCard = PromptCardSchema.safeParse(card)
    const parsedConversationId = GuideConversationId.optional().safeParse(
      conversationId
    )

    if (!parsedCard.success || !parsedConversationId.success) {
      return { success: false, error: 'Ungültige Karte.' }
    }

    if (parsedConversationId.data) {
      const [conversation] = await db
        .select({ id: guideConversations.id })
        .from(guideConversations)
        .where(
          and(
            eq(guideConversations.id, parsedConversationId.data),
            eq(guideConversations.userId, user.id!)
          )
        )
        .limit(1)

      if (!conversation) {
        return { success: false, error: 'Konversation nicht gefunden.' }
      }
    }

    const [saved] = await db
      .insert(savedPromptCards)
      .values({
        userId: user.id!,
        question: parsedCard.data.question,
        context: parsedCard.data.context ?? null,
        type: parsedCard.data.type,
        sourceConversationId: parsedConversationId.data ?? null,
      })
      .returning()

    revalidatePath('/inner/guide/cards')

    return {
      success: true,
      data: saved as unknown as SavedCard,
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Karte konnte nicht gespeichert werden.',
    }
  }
}

export async function getSavedCards(): Promise<ActionResult<SavedCard[]>> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()

    const cards = await db
      .select()
      .from(savedPromptCards)
      .where(eq(savedPromptCards.userId, user.id!))
      .orderBy(desc(savedPromptCards.savedAt))

    return {
      success: true,
      data: cards as unknown as SavedCard[],
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Karten konnten nicht geladen werden.',
    }
  }
}

export async function deleteSavedCard(
  id: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const { user } = await requireWorkspaceAccess()
    const db = requireDb()

    const [deleted] = await db
      .delete(savedPromptCards)
      .where(
        and(
          eq(savedPromptCards.id, id),
          eq(savedPromptCards.userId, user.id!)
        )
      )
      .returning({ id: savedPromptCards.id })

    if (!deleted) {
      return { success: false, error: 'Karte nicht gefunden.' }
    }

    revalidatePath('/inner/guide/cards')

    return { success: true, data: deleted }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Karte konnte nicht gelöscht werden.',
    }
  }
}
