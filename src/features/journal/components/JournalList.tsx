import type { JournalEntry } from '../types'
import { JournalEntryCard } from './JournalEntryCard'

interface JournalListProps {
  entries: JournalEntry[]
}

export function JournalList({ entries }: JournalListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-6 h-16 w-16 rounded-full bg-oe-aurora-violet/10" />
        <h3 className="mb-2 font-serif text-xl text-oe-pure-light">
          Dein Journal ist noch leer
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-oe-pure-light/50">
          Beginne mit deinem ersten Eintrag. Schreibe, was dich bewegt —
          ohne Urteil, ohne Ziel. Dieser Raum gehört dir.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <JournalEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  )
}
