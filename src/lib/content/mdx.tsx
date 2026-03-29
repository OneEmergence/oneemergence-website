import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

/**
 * Custom MDX components available in all content files.
 * These are Server Components by default.
 */
const mdxComponents = {
  Callout,
  Prompt,
  Exercise,
}

function Callout({ children, type = 'note' }: { children: React.ReactNode; type?: 'note' | 'warning' | 'insight' }) {
  const styles: Record<string, string> = {
    note: 'border-oe-spirit-cyan/30 bg-oe-spirit-cyan/5',
    warning: 'border-oe-solar-gold/30 bg-oe-solar-gold/5',
    insight: 'border-oe-aurora-violet/30 bg-oe-aurora-violet/5',
  }
  return (
    <aside className={`my-6 rounded-xl border-l-4 p-5 ${styles[type] ?? styles.note}`}>
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
