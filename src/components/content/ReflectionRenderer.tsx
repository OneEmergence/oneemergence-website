import type { ReflectionMeta } from '@/lib/schemas/content'
import { ContentRenderer } from './ContentRenderer'

interface ReflectionRendererProps {
  meta: ReflectionMeta
  content: React.ReactElement
}

/**
 * Contemplative layout with journal prompts and spacious design.
 */
export function ReflectionRenderer({ meta, content }: ReflectionRendererProps) {
  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-oe-aurora-violet/70">
          Reflexion
        </p>
        <h1 className="font-serif text-3xl leading-tight text-oe-pure-light md:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-4 text-oe-pure-light/50">{meta.excerpt}</p>
      </header>

      {/* Body — spacious */}
      <div className="space-y-8">
        <ContentRenderer>{content}</ContentRenderer>
      </div>

      {/* Journal Prompts */}
      {meta.prompts.length > 0 && (
        <div className="mt-14 space-y-4">
          <h3 className="text-center text-xs font-medium uppercase tracking-[0.2em] text-oe-aurora-violet/50">
            Journal-Impulse
          </h3>
          <div className="space-y-3">
            {meta.prompts.map((prompt, i) => (
              <div
                key={i}
                className="rounded-xl border border-oe-aurora-violet/15 bg-oe-aurora-violet/5 p-5 text-center font-serif text-lg italic text-oe-pure-light/70"
              >
                {prompt}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Journal Seed CTA */}
      {meta.journalSeed && (
        <div className="mt-12 rounded-2xl border border-oe-spirit-cyan/20 bg-oe-spirit-cyan/5 p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-oe-spirit-cyan/60">
            Journal-Samen
          </p>
          <p className="mt-3 font-serif text-xl text-oe-pure-light/80">
            {meta.journalSeed}
          </p>
        </div>
      )}
    </div>
  )
}
