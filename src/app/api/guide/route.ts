import { generateObject } from 'ai'
import { requireAnthropic } from '@/lib/ai/provider'
import { requireDb } from '@/lib/db'
import { auth } from '@/lib/auth'
import { guideConversations, guideMessages } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { GuideMessageInput, GuideResponse } from '@/lib/schemas/guide'
import { getUserContext } from '@/features/guide/context'
import { buildSystemPrompt } from '@/features/guide/prompts'

export async function POST(request: Request) {
  try {
    // Auth check
    const session = await auth()
    if (!session?.user?.id) {
      return Response.json({ error: 'Nicht authentifiziert.' }, { status: 401 })
    }

    const userId = session.user.id
    const userName = session.user.name ?? null

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

    // Get or create conversation
    let convId = conversationId
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
    const systemPrompt = buildSystemPrompt(role, userContext)

    // Build message array for Claude
    const messages = history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Generate structured response using Vercel AI SDK
    const { object: guideResponse } = await generateObject({
      model: provider('claude-sonnet-4-20250514'),
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
      .where(eq(guideConversations.id, convId))

    return Response.json({
      conversationId: convId,
      response: guideResponse,
    })
  } catch (error) {
    console.error('[Guide API Error]', error)

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

    return Response.json(
      { error: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.' },
      { status: 500 }
    )
  }
}
