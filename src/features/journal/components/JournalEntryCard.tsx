import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { JournalEntry } from '../types'

interface JournalEntryCardProps {
  entry: JournalEntry
  compact?: boolean
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function JournalEntryCard({ entry, compact = false }: JournalEntryCardProps) {
  const excerpt =
    entry.content.length > 120
      ? entry.content.slice(0, 120) + '...'
      : entry.content

  return (
    <Link
      href={`/inner/journal/${entry.id}`}
      className={cn(
        'group block rounded-xl border border-white/5 bg-white/[0.02] p-5',
        'transition-all duration-300',
        'hover:border-oe-aurora-violet/20 hover:bg-white/[0.04]',
        'hover:shadow-[0_0_30px_-10px_rgba(124,92,255,0.15)]',
        compact && 'p-4'
      )}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <h3
            className={cn(
              'font-serif text-oe-pure-light transition-colors group-hover:text-oe-aurora-violet',
              compact ? 'text-lg' : 'text-xl'
            )}
          >
            {entry.title}
          </h3>
          <time className="shrink-0 text-xs text-oe-pure-light/40">
            {formatDate(entry.createdAt)}
          </time>
        </div>

        {!compact && (
          <p className="text-sm leading-relaxed text-oe-pure-light/50">
            {excerpt}
          </p>
        )}

        {entry.moodTags && entry.moodTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {entry.moodTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-oe-aurora-violet/10 px-2 py-0.5 text-xs text-oe-aurora-violet/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
