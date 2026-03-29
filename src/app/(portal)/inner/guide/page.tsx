import type { Metadata } from 'next'
import { GuideChatView } from '@/features/guide'

export const metadata: Metadata = {
  title: 'Guide — OneEmergence',
  description: 'Dein Bewusstseins-Begleiter mit vier Perspektiven.',
}

export default function GuidePage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <GuideChatView />
    </div>
  )
}
