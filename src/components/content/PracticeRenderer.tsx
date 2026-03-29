import type { PracticeMeta } from '@/lib/schemas/content'
import { ContentRenderer } from './ContentRenderer'

interface PracticeRendererProps {
  meta: PracticeMeta
  content: React.ReactElement
}

/**
 * Practice layout with instruction steps, duration/difficulty badges, and posture suggestion.
 * Timer and audio player are placeholders — Agent 4/5 will implement interactivity.
 */
export function PracticeRenderer({ meta, content }: PracticeRendererProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <header className="mb-10 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-oe-spirit-cyan/70">
          Praxis
        </p>
        <h1 className="font-serif text-3xl leading-tight text-oe-pure-light md:text-4xl">
          {meta.title}
        </h1>

        {/* Badges */}
        <div className="mt-4 flex justify-center gap-3">
          {meta.duration && (
            <span className="rounded-full bg-oe-spirit-cyan/10 px-3 py-1 text-xs text-oe-spirit-cyan/70">
              {meta.duration} Min.
            </span>
          )}
          {meta.difficulty && (
            <span className="rounded-full bg-oe-aurora-violet/10 px-3 py-1 text-xs text-oe-aurora-violet/70">
              {meta.difficulty}
            </span>
          )}
        </div>
      </header>

      {/* Posture suggestion */}
      {meta.posture && (
        <div className="mb-10 rounded-xl border border-oe-pure-light/10 bg-oe-pure-light/[0.03] p-5 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-oe-pure-light/40">
            Empfohlene Haltung
          </p>
          <p className="mt-2 font-serif text-lg text-oe-pure-light/70">{meta.posture}</p>
        </div>
      )}

      {/* Instructions */}
      {meta.instructions.length > 0 && (
        <div className="mb-10 space-y-4">
          {meta.instructions.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-oe-pure-light/8 bg-oe-pure-light/[0.02] p-5"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-oe-aurora-violet/10 text-sm font-medium text-oe-aurora-violet/70">
                {i + 1}
              </span>
              <div>
                <p className="text-oe-pure-light/70">{step.instruction}</p>
                {step.duration && (
                  <p className="mt-1 text-xs text-oe-pure-light/30">{step.duration}s</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Body content */}
      <ContentRenderer>{content}</ContentRenderer>

      {/* Audio placeholder */}
      {meta.audio && (
        <div className="mt-10 rounded-xl border border-oe-pure-light/10 bg-oe-pure-light/[0.03] p-6 text-center">
          <p className="text-sm text-oe-pure-light/40">
            Audio-Player wird in einer zukünftigen Version verfügbar sein.
          </p>
        </div>
      )}
    </div>
  )
}
