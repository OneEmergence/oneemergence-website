import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getPracticeHistory, type PracticeSession } from '@/features/rituals/actions'

export const metadata: Metadata = {
  title: 'Praxis-Verlauf',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  meditation: 'Meditation',
  breathwork: 'Atemarbeit',
  soundscape: 'Klanglandschaft',
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remaining = seconds % 60
  if (minutes === 0) return `${remaining}s`
  if (remaining === 0) return `${minutes} Min.`
  return `${minutes} Min. ${remaining}s`
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function groupByDate(sessions: PracticeSession[]) {
  const groups = new Map<string, PracticeSession[]>()
  for (const session of sessions) {
    const key = new Date(session.completedAt).toLocaleDateString('de-DE')
    const existing = groups.get(key)
    if (existing) {
      existing.push(session)
    } else {
      groups.set(key, [session])
    }
  }
  return groups
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function PracticeHistoryPage() {
  const result = await getPracticeHistory()

  return (
    <div className="mx-auto max-w-2xl">
      {/* Back link */}
      <Link
        href="/inner/practice"
        className="mb-6 inline-flex items-center gap-2 text-sm text-oe-pure-light/40 transition-colors hover:text-oe-pure-light/70"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Praxis
      </Link>

      <h1 className="font-serif text-3xl font-semibold text-oe-pure-light md:text-4xl">
        Praxis-Verlauf
      </h1>
      <p className="mt-3 text-sm text-oe-pure-light/50">
        Deine bisherigen Sitzungen.
      </p>

      <div className="mt-8">
        {!result.success ? (
          <p className="text-sm text-oe-pure-light/40">
            Verlauf konnte nicht geladen werden.
          </p>
        ) : result.data.length === 0 ? (
          <div className="rounded-xl border border-oe-pure-light/5 p-6 text-center">
            <p className="text-sm text-oe-pure-light/40">
              Noch keine Praxis-Sitzungen. Starte deine erste Meditation.
            </p>
            <Link
              href="/inner/practice/meditation"
              className="mt-4 inline-block rounded-lg bg-oe-aurora-violet px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-oe-aurora-violet/80"
            >
              Jetzt starten
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {Array.from(groupByDate(result.data).entries()).map(([dateLabel, sessions]) => (
              <section key={dateLabel}>
                <p className="mb-3 text-xs uppercase tracking-widest text-oe-pure-light/30">
                  {formatDate(sessions[0].completedAt)}
                </p>
                <div className="space-y-2">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between rounded-xl border border-oe-pure-light/5 bg-oe-pure-light/[0.02] px-5 py-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-oe-pure-light/80">
                          {TYPE_LABELS[session.type] ?? session.type}
                        </p>
                        {session.notes && (
                          <p className="mt-1 text-xs text-oe-pure-light/40">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <span className="ml-4 shrink-0 text-sm tabular-nums text-oe-pure-light/40">
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            {/* Summary */}
            <div className="rounded-xl border border-oe-pure-light/5 bg-oe-pure-light/[0.02] px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-oe-pure-light/30">
                Gesamt
              </p>
              <p className="mt-2 text-sm text-oe-pure-light/60">
                {result.data.length} Sitzung{result.data.length !== 1 ? 'en' : ''},{' '}
                {formatDuration(
                  result.data.reduce((acc, s) => acc + s.duration, 0)
                )}{' '}
                Gesamtdauer
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
