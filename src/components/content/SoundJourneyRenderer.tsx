import type { SoundJourneyMeta } from '@/lib/schemas/content'
import { ContentRenderer } from './ContentRenderer'

interface SoundJourneyRendererProps {
  meta: SoundJourneyMeta
  content: React.ReactElement
}

/**
 * Sound journey layout with audio player placeholder, posture suggestion, and duration.
 * Audio playback will be implemented by Agent 4/5.
 */
export function SoundJourneyRenderer({ meta, content }: SoundJourneyRendererProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {/* Header */}
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-oe-solar-gold/50">
          Klangreise
        </p>
        <h1 className="font-serif text-3xl leading-tight text-oe-pure-light md:text-4xl">
          {meta.title}
        </h1>

        {/* Duration + visual mode */}
        <div className="mt-4 flex justify-center gap-3">
          {meta.duration && (
            <span className="rounded-full bg-oe-solar-gold/10 px-3 py-1 text-xs text-oe-solar-gold/70">
              {meta.duration} Min.
            </span>
          )}
          {meta.visualMode && (
            <span className="rounded-full bg-oe-aurora-violet/10 px-3 py-1 text-xs text-oe-aurora-violet/70">
              {meta.visualMode}
            </span>
          )}
        </div>
      </header>

      {/* Suggested posture */}
      {meta.suggestedPosture && (
        <div className="mb-10 rounded-xl border border-oe-pure-light/10 bg-oe-pure-light/[0.03] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-oe-pure-light/40">
            Empfohlene Haltung
          </p>
          <p className="mt-2 font-serif text-lg text-oe-pure-light/70">{meta.suggestedPosture}</p>
        </div>
      )}

      {/* Audio player placeholder */}
      <div className="mb-10 rounded-2xl border border-oe-solar-gold/20 bg-oe-solar-gold/5 p-8">
        <div className="mx-auto h-16 w-16 rounded-full border-2 border-oe-solar-gold/30 flex items-center justify-center">
          <div className="ml-1 h-0 w-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-oe-solar-gold/50" />
        </div>
        <p className="mt-4 text-sm text-oe-pure-light/40">
          Audio-Player wird in einer zukünftigen Version verfügbar sein.
        </p>
      </div>

      {/* Body content */}
      <div className="text-left">
        <ContentRenderer>{content}</ContentRenderer>
      </div>
    </div>
  )
}
