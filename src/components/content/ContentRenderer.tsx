/**
 * Base content renderer — wraps MDX output with OE-styled typography.
 * Used by all sacred content type renderers.
 */
export function ContentRenderer({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="prose prose-invert prose-base sm:prose-lg max-w-none
        prose-headings:font-serif prose-headings:text-oe-pure-light
        prose-h2:text-3xl prose-h3:text-xl
        prose-p:text-oe-pure-light/70 prose-p:leading-relaxed
        prose-a:text-oe-aurora-violet prose-a:no-underline hover:prose-a:text-oe-solar-gold
        prose-blockquote:border-oe-aurora-violet/50 prose-blockquote:text-oe-pure-light/60
        prose-strong:text-oe-pure-light
        prose-hr:border-oe-pure-light/10
        prose-ol:text-oe-pure-light/70 prose-ul:text-oe-pure-light/70
        prose-li:marker:text-oe-aurora-violet"
    >
      {children}
    </article>
  )
}
