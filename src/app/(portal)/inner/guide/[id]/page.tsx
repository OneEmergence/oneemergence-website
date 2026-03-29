import type { Metadata } from 'next'
import { getConversation } from '@/lib/actions/guide'
import { GuideChatView } from '@/features/guide'
import { redirect } from 'next/navigation'
import type { GuideRole, GuideResponse } from '@/lib/schemas/guide'

export const metadata: Metadata = {
  title: 'Guide — OneEmergence',
  description: 'Dein Bewusstseins-Begleiter mit vier Perspektiven.',
}

export default async function GuideConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const result = await getConversation(id)

  if (!result.success) {
    redirect('/inner/guide')
  }

  const { conversation, messages } = result.data

  const chatMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    guideRole: m.role === 'assistant' ? (conversation.role as GuideRole) : undefined,
    structuredResponse: m.structuredResponse as GuideResponse | null,
  }))

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <GuideChatView
        initialMessages={chatMessages}
        initialRole={conversation.role as GuideRole}
        conversationId={conversation.id}
      />
    </div>
  )
}
