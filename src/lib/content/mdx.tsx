import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

import { mdxKit } from '@/components/content/mdx-kit'

/**
 * Custom MDX components available in all content files.
 * These are Server Components by default.
 *
 * The `mdx-kit` layout/editorial set (Stage, Lead, PullQuote, Stats, Cards,
 * Figure, Steps, FAQ, CTA, Reveal, …) is spread in first, so every `.mdx`
 * under src/content/ can use it with no imports. See
 * `.agents/skills/story-pages/SKILL.md` for the authoring guide.
 */
const mdxComponents = {
  ...mdxKit,
  Callout,
  Prompt,
  Exercise,
}

function Callout({ children, type = 'note' }: { children: React.ReactNode; type?: 'note' | 'warning' | 'insight' }) {
  // The accent reads through the tint and a hairline at the top edge. A thick
  // coloured side tab is the loudest generic-template tell there is.
  const styles: Record<string, string> = {
    note: 'border-oe-spirit-cyan/20 bg-oe-spirit-cyan/[0.04] before:bg-oe-spirit-cyan/50',
    warning: 'border-oe-solar-gold/20 bg-oe-solar-gold/[0.04] before:bg-oe-solar-gold/50',
    insight: 'border-oe-aurora-violet/20 bg-oe-aurora-violet/[0.04] before:bg-oe-aurora-violet/50',
  }
  return (
    <aside
      className={`relative my-6 overflow-hidden rounded-xl border p-5 before:absolute before:inset-x-0 before:top-0 before:h-px before:content-[''] ${styles[type] ?? styles.note}`}
    >
      {children}
    </aside>
  )
}

function Prompt({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-6 rounded-xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 p-6 text-center font-serif text-lg italic text-oe-pure-light/80">
      {children}
    </div>
  )
}

function Exercise({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="my-8 rounded-2xl border border-oe-spirit-cyan/20 bg-oe-spirit-cyan/5 p-6">
      {title && (
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-oe-spirit-cyan/70">
          {title}
        </p>
      )}
      {children}
    </div>
  )
}

/**
 * Compile an MDX string into a React element + parsed frontmatter.
 */
export async function compileMdx<TFrontmatter extends Record<string, unknown>>(
  source: string,
): Promise<{ content: React.ReactElement; frontmatter: TFrontmatter }> {
  const result = await compileMDX<TFrontmatter>({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
      },
    },
    components: mdxComponents,
  })

  return {
    content: result.content,
    frontmatter: result.frontmatter,
  }
}
