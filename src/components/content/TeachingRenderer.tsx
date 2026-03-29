import type { TeachingMeta } from '@/lib/schemas/content'
import { ContentRenderer } from './ContentRenderer'

interface TeachingRendererProps {
  meta: TeachingMeta
  content: React.ReactElement
  readingTime?: number
}

/**
 * Long-form reading layout with reference list and related concepts.
 */
export function TeachingRenderer({ meta, content, readingTime }: TeachingRendererProps) {
  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <header className="mb-10">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-oe-spirit-cyan/70">
          Lehre
        </p>
        <h1 className="font-serif text-4xl leading-tight text-oe-pure-light md:text-5xl">
          {meta.title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-oe-pure-light/40">
          <time>{meta.date}</time>
          {readingTime && (
            <>
              <span>·</span>
              <span>{readingTime} Min. Lesezeit</span>
            </>
          )}
          {meta.difficulty && (
            <>
              <span>·</span>
              <span className="rounded-full bg-oe-aurora-violet/10 px-2.5 py-0.5 text-xs text-oe-aurora-violet/70">
                {meta.difficulty}
              </span>
            </>
          )}
        </div>
      </header>

      {/* Body */}
      <ContentRenderer>{content}</ContentRenderer>

      {/* Related Concepts */}
      {meta.relatedConcepts.length > 0 && (
        <div className="mt-12 border-t border-oe-pure-light/10 pt-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-oe-pure-light/40">
            Verwandte Konzepte
          </h3>
          <div className="flex flex-wrap gap-2">
            {meta.relatedConcepts.map((concept) => (
              <span
                key={concept}
                className="rounded-full border border-oe-aurora-violet/20 px-3 py-1 text-sm text-oe-aurora-violet/70"
              >
                {concept}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {meta.references.length > 0 && (
        <div className="mt-8 border-t border-oe-pure-light/10 pt-8">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-oe-pure-light/40">
            Referenzen
          </h3>
          <ul className="space-y-2 text-sm text-oe-pure-light/50">
            {meta.references.map((ref, i) => (
              <li key={i}>{ref}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
