import { generateObject } from 'ai'
import { requireAnthropic } from '@/lib/ai/provider'
import { requireDb } from '@/lib/db'
import { createClient } from '@/lib/supabase/server'
import {
  guideConversations,
  guideMessages,
  profiles,
  workspaceProfiles,
} from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { GuideMessageInput, GuideResponse } from '@/lib/schemas/guide'
import { getUserContext } from '@/features/guide/context'
import { buildSystemPrompt } from '@/features/guide/prompts'
import { getWorkspaceAccess } from '@/features/workspaces'
import { env, siteUrl } from '@/lib/env'

export async function POST(request: Request) {
  try {
    const requestOrigin = request.headers.get('origin')
    if (requestOrigin && requestOrigin !== new URL(siteUrl).origin) {
      return Response.json({ error: 'Ung\u00fcltige Anfrage.' }, { status: 403 })
    }

    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return Response.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
    }

    const access = await getWorkspaceAccess()
    if (!access.activeWorkspace) {
      return Response.json(
        { error: 'Dein Workspace-Zugang ist nicht aktiv.' },
        { status: 403 }
      )
    }

    const userId = user.id
    let userName =
      (user.user_metadata?.full_name as string) ??
      (user.user_metadata?.name as string) ??
      null

    // Parse and validate input
    const body = await request.json()
    const parsed = GuideMessageInput.safeParse(body)
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { message, role, conversationId } = parsed.data
    const provider = requireAnthropic()
    const db = requireDb()
    const [workspaceProfileRows, profileRows] = await Promise.all([
      db
        .select({ displayName: workspaceProfiles.displayName })
        .from(workspaceProfiles)
        .where(
          and(
            eq(
              workspaceProfiles.workspaceId,
              access.activeWorkspace.workspaceId
            ),
            eq(workspaceProfiles.userId, userId)
          )
        )
        .limit(1),
      db
        .select({ displayName: profiles.displayName })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1),
    ])
    userName =
      workspaceProfileRows[0]?.displayName ??
      profileRows[0]?.displayName ??
      userName

    // Get or create conversation. Existing conversations are always resolved
    // through their owner in the same query because the DB connection bypasses RLS.
    let convId = conversationId
    let conversationRole = role
    if (!convId) {
      const [conv] = await db
        .insert(guideConversations)
        .values({
          userId,
          role,
          title: message.slice(0, 100),
        })
        .returning()
      convId = conv.id
    } else {
      const [conversation] = await db
        .select({ role: guideConversations.role })
        .from(guideConversations)
        .where(
          and(
            eq(guideConversations.id, convId),
            eq(guideConversations.userId, userId)
          )
        )
        .limit(1)

      if (!conversation) {
        return Response.json(
          { error: 'Unterhaltung nicht gefunden.' },
          { status: 404 }
        )
      }

      conversationRole = conversation.role
    }

    // Save user message
    await db.insert(guideMessages).values({
      conversationId: convId,
      role: 'user',
      content: message,
    })

    // Load conversation history (last 20 messages for context)
    const history = await db
      .select({ role: guideMessages.role, content: guideMessages.content })
      .from(guideMessages)
      .where(eq(guideMessages.conversationId, convId))
      .orderBy(desc(guideMessages.createdAt))
      .limit(20)

    // Reverse to chronological order (newest first → oldest first)
    history.reverse()

    // Build context and system prompt
    const userContext = await getUserContext(userId, userName)
    const systemPrompt = buildSystemPrompt(conversationRole, userContext)

    // Build message array for Claude
    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Generate structured response using Vercel AI SDK
    const { object: guideResponse } = await generateObject({
      model: provider(env.AI_MODEL),
      schema: GuideResponse,
      system: systemPrompt,
      messages,
    })

    // Save assistant message with structured response
    await db.insert(guideMessages).values({
      conversationId: convId,
      role: 'assistant',
      content: guideResponse.text,
      structuredResponse: guideResponse,
    })

    // Update conversation timestamp
    await db
      .update(guideConversations)
      .set({ updatedAt: new Date() })
      .where(
        and(
          eq(guideConversations.id, convId),
          eq(guideConversations.userId, userId)
        )
      )

    return Response.json({
      conversationId: convId,
      response: guideResponse,
    })
  } catch (error) {
    if (error instanceof Error && error.message.includes('Anthropic API key')) {
      return Response.json(
        {
          error: 'AI Guide ist noch nicht konfiguriert. ANTHROPIC_API_KEY fehlt.',
          configurationRequired: true,
        },
        { status: 503 }
      )
    }

    if (error instanceof Error && error.message.includes('Database not configured')) {
      return Response.json(
        {
          error: 'Datenbank ist nicht konfiguriert. DATABASE_URL fehlt.',
          configurationRequired: true,
        },
        { status: 503 }
      )
    }

    console.error('[Guide API Error]', {
      name: error instanceof Error ? error.name : 'UnknownError',
    })

    return Response.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
