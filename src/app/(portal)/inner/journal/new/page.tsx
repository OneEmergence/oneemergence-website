import type { Metadata } from 'next'
import { JournalEditor } from '@/features/journal'

export const metadata: Metadata = {
  title: 'Neuer Eintrag',
}

export default function NewJournalEntryPage() {
  return (
    <div className="py-4">
      <JournalEditor />
    </div>
  )
}
