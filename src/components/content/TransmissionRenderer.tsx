import type { TransmissionMeta } from '@/lib/schemas/content'
import { ContentRenderer } from './ContentRenderer'

interface TransmissionRendererProps {
  meta: TransmissionMeta
  content: React.ReactElement
}

/**
 * Atmospheric, minimal, full-width layout for transmissions.
 * Different visual treatment based on medium (text/audio/visual).
 */
export function TransmissionRenderer({ meta, content }: TransmissionRendererProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Atmospheric header — minimal */}
      <header className="mb-16 text-center">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-oe-solar-gold/50">
          Transmission
        </p>
        <h1 className="font-serif text-3xl leading-tight text-oe-pure-light/90 md:text-4xl lg:text-5xl">
          {meta.title}
        </h1>
        {meta.attribution && (
          <p className="mt-6 text-sm italic text-oe-pure-light/40">— {meta.attribution}</p>
        )}
      </header>

      {/* Body — immersive reading */}
      <div className="space-y-6">
        <ContentRenderer>{content}</ContentRenderer>
      </div>

      {/* Audio/visual placeholder for non-text mediums */}
      {meta.medium !== 'text' && (
        <div className="mt-12 rounded-xl border border-oe-solar-gold/15 bg-oe-solar-gold/5 p-8 text-center">
          <p className="text-sm text-oe-pure-light/40">
            {meta.medium === 'audio' ? 'Audio-Wiedergabe' : 'Visuelle Erfahrung'} wird in einer
            zukünftigen Version verfügbar sein.
          </p>
        </div>
      )}
    </div>
  )
}
