import type { VisualEssayMeta } from '@/lib/schemas/content'
import { ContentRenderer } from './ContentRenderer'

interface VisualEssayRendererProps {
  meta: VisualEssayMeta
  content: React.ReactElement
}

/**
 * Scroll-driven visual narrative container (skeleton).
 * Full WebGL/interaction integration is Agent 4's responsibility.
 * This renderer provides the structural foundation.
 */
export function VisualEssayRenderer({ meta, content }: VisualEssayRendererProps) {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <header className="mb-12 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-oe-spirit-cyan/50">
          Visual Essay
        </p>
        <h1 className="font-serif text-4xl leading-tight text-oe-pure-light md:text-5xl">
          {meta.title}
        </h1>
        <p className="mt-4 text-oe-pure-light/50">{meta.excerpt}</p>
      </header>

      {/* Scene markers (for scroll-driven interaction — Agent 4 will wire these) */}
      {meta.scenes.length > 0 && (
        <nav className="mb-10 flex justify-center gap-3">
          {meta.scenes.map((scene) => (
            <span
              key={scene.id}
              className="rounded-full border border-oe-pure-light/10 px-3 py-1 text-xs text-oe-pure-light/30"
            >
              {scene.label ?? scene.id}
            </span>
          ))}
        </nav>
      )}

      {/* Content — wider layout for visual narratives */}
      <ContentRenderer>{content}</ContentRenderer>
    </div>
  )
}
