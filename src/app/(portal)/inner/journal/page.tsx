import type { Metadata } from 'next'
import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { requireWorkspaceAccess } from '@/features/workspaces'
import { db } from '@/lib/db'
import { journalEntries } from '@/lib/db/schema'
import { JournalList } from '@/features/journal'
import type { JournalEntry } from '@/features/journal'

export const metadata: Metadata = {
  title: 'Journal',
}

export default async function JournalPage() {
  const { user } = await requireWorkspaceAccess()

  let entries: JournalEntry[] = []

  if (db) {
    const rows = await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id!))
      .orderBy(desc(journalEntries.createdAt))

    entries = rows as unknown as JournalEntry[]
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl text-oe-pure-light">Journal</h1>
        <Link
          href="/inner/journal/new"
          className="rounded-lg bg-oe-solar-gold px-4 py-2 text-sm font-medium text-oe-depth-warm transition-colors hover:bg-oe-solar-gold/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm"
        >
          Neuer Eintrag
        </Link>
      </div>

      <JournalList entries={entries} />
    </div>
  )
}
