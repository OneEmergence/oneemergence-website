import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth/session'
import { requireDb } from '@/lib/db'
import { journalEntries } from '@/lib/db/schema'
import { JournalEditor } from '@/features/journal'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params

  try {
    const db = requireDb()
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.id, id))

    return { title: entry?.title ?? 'Eintrag' }
  } catch {
    return { title: 'Eintrag' }
  }
}

export default async function EditJournalEntryPage({ params }: PageProps) {
  const { id } = await params
  const user = await requireAuth()
  const db = requireDb()

  const [entry] = await db
    .select()
    .from(journalEntries)
    .where(
      and(eq(journalEntries.id, id), eq(journalEntries.userId, user.id!))
    )

  if (!entry) {
    notFound()
  }

  return (
    <div className="py-4">
      <JournalEditor
        initialData={{
          id: entry.id,
          title: entry.title,
          content: entry.content,
          moodTags: (entry.moodTags as string[]) ?? [],
          themes: (entry.themes as string[]) ?? [],
        }}
      />
    </div>
  )
}
