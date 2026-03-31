import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  getPostBySlug,
  getPosts,
  getContentBySlug,
  getAllContent,
  getLibraryItems,
} from '@/lib/content'
import { ContentRenderer } from '@/components/content/ContentRenderer'
import { CONTENT_TYPE_DIRS, type ContentType, type AnyContentMeta } from '@/lib/schemas/content'

// ─── Type labels & colors (German-first) ───────────────────────────────────

const TYPE_META: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  journal: {
    label: 'Journal',
    color: 'text-oe-aurora-violet',
    dotColor: 'bg-oe-aurora-violet',
  },
  teaching: {
    label: 'Lehre',
    color: 'text-oe-solar-gold',
    dotColor: 'bg-oe-solar-gold',
  },
  reflection: {
    label: 'Reflexion',
    color: 'text-oe-spirit-cyan',
    dotColor: 'bg-oe-spirit-cyan',
  },
  practice: {
    label: 'Praxis',
    color: 'text-oe-solar-gold',
    dotColor: 'bg-oe-solar-gold',
  },
  transmission: {
    label: 'Transmission',
    color: 'text-oe-aurora-violet',
    dotColor: 'bg-oe-aurora-violet',
  },
  'visual-essay': {
    label: 'Visueller Essay',
    color: 'text-oe-spirit-cyan',
    dotColor: 'bg-oe-spirit-cyan',
  },
  'sound-journey': {
    label: 'Klangreise',
    color: 'text-oe-aurora-violet',
    dotColor: 'bg-oe-aurora-violet',
  },
}

const VALID_TYPES = new Set(['journal', ...Object.keys(CONTENT_TYPE_DIRS)])

// ─── Static params ─────────────────────────────────────────────────────────

export function generateStaticParams() {
  const params: { type: string; slug: string }[] = []

  // Journal posts
  for (const post of getPosts()) {
    params.push({ type: 'journal', slug: post.slug })
  }

  // Sacred content types
  for (const type of Object.keys(CONTENT_TYPE_DIRS) as ContentType[]) {
    for (const item of getAllContent(type)) {
      if (item.published) {
        params.push({ type, slug: item.slug })
      }
    }
  }

  return params
}

// ─── Metadata ──────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string; slug: string }>
}) {
  const { type, slug } = await params
  if (!VALID_TYPES.has(type)) return {}

  if (type === 'journal') {
    const post = await getPostBySlug(slug)
    if (!post) return {}
    return {
      title: `${post.meta.title} | OneEmergence`,
      description: post.meta.excerpt,
    }
  }

  const result = await getContentBySlug(type as ContentType, slug)
  if (!result) return {}
  return {
    title: `${result.meta.title} | OneEmergence`,
    description: result.meta.excerpt,
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function LibraryDetailPage({
  params,
}: {
  params: Promise<{ type: string; slug: string }>
}) {
  const { type, slug } = await params

  if (!VALID_TYPES.has(type)) notFound()

  // ── Resolve content ────────────────────────────────────────────────────
  let title: string
  let excerpt: string
  let date: string
  let cover: string | undefined
  let tags: string[]
  let readingTime: number
  let content: React.ReactElement
  let difficulty: string | undefined
  let references: string[] | undefined
  let prompts: string[] | undefined
  let journalSeed: string | undefined

  if (type === 'journal') {
    const post = await getPostBySlug(slug)
    if (!post) notFound()

    title = post.meta.title
    excerpt = post.meta.excerpt
    date = post.meta.date
    cover = post.meta.cover
    tags = post.meta.tags
    readingTime = post.readingTime
    content = post.content
  } else {
    const result = await getContentBySlug(type as ContentType, slug)
    if (!result) notFound()

    const meta: AnyContentMeta = result.meta
    title = meta.title
    excerpt = meta.excerpt
    date = meta.date
    cover = meta.cover
    tags = meta.tags
    readingTime = meta.duration ?? 5
    content = result.content
    difficulty = meta.difficulty

    // Type-specific fields
    if (meta.type === 'teaching') {
      references = meta.references
    }
    if (meta.type === 'reflection') {
      prompts = meta.prompts
      journalSeed = meta.journalSeed
    }
  }

  const typeMeta = TYPE_META[type] ?? TYPE_META.journal

  // ── Adjacent items for navigation ──────────────────────────────────────
  const allItems = getLibraryItems()
  const currentIndex = allItems.findIndex(
    (item) => item.slug === slug && item.libraryType === type
  )
  const prev = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null
  const next = currentIndex > 0 ? allItems[currentIndex - 1] : null

  return (
    <div className="min-h-screen bg-oe-deep-space">
      {/* Hero Cover */}
      {cover && (
        <div className="relative h-[220px] w-full sm:h-[300px] md:h-[400px]">
          <Image
            src={cover}
            alt={title}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A0F1F]" />
        </div>
      )}

      <div
        className={`mx-auto max-w-3xl px-4 sm:px-6 ${
          cover
            ? 'relative -mt-12 pb-24 sm:-mt-16 md:-mt-20'
            : 'pb-24 pt-24 sm:pt-28'
        }`}
      >
        {/* Back link */}
        <Link
          href="/library"
          className="mb-10 inline-flex items-center gap-2 text-sm text-oe-pure-light/40 transition-colors hover:text-oe-pure-light/70"
        >
          &larr; Zurück zur Bibliothek
        </Link>

        {/* Type indicator */}
        <div className="mb-3 flex items-center gap-3">
          <span className={`inline-block h-2 w-2 rounded-full ${typeMeta.dotColor}`} />
          <span
            className={`text-xs font-semibold uppercase tracking-[0.3em] ${typeMeta.color}`}
          >
            {typeMeta.label}
          </span>
          {difficulty && (
            <span className="rounded-full bg-oe-pure-light/5 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-oe-pure-light/30">
              {difficulty === 'beginner'
                ? 'Einsteiger'
                : difficulty === 'intermediate'
                  ? 'Fortgeschritten'
                  : 'Vertiefung'}
            </span>
          )}
        </div>

        <h1 className="font-serif text-4xl leading-tight text-oe-pure-light md:text-5xl">
          {title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-oe-pure-light/40">
          <time>
            {new Date(date).toLocaleDateString('de-DE', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </time>
          <span>&middot;</span>
          <span>{readingTime} Min. Lesezeit</span>
          {tags.length > 0 && (
            <>
              <span>&middot;</span>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-oe-aurora-violet/10 px-2.5 py-0.5 text-xs text-oe-aurora-violet/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-gradient-to-r from-oe-aurora-violet/30 via-oe-spirit-cyan/20 to-transparent" />

        {/* Reflection prompts (before content) */}
        {prompts && prompts.length > 0 && (
          <div className="mb-10 rounded-2xl border border-oe-spirit-cyan/20 bg-oe-spirit-cyan/5 p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-oe-spirit-cyan/70">
              Reflexionsfragen
            </p>
            <ul className="space-y-2">
              {prompts.map((prompt, i) => (
                <li
                  key={i}
                  className="text-sm italic leading-relaxed text-oe-pure-light/60"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* MDX Content */}
        <ContentRenderer>{content}</ContentRenderer>

        {/* Journal seed (after content) */}
        {journalSeed && (
          <div className="mt-10 rounded-2xl border border-oe-spirit-cyan/20 bg-oe-spirit-cyan/5 p-6 text-center">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-oe-spirit-cyan/70">
              Journal-Impuls
            </p>
            <p className="font-serif text-lg italic leading-relaxed text-oe-pure-light/70">
              &ldquo;{journalSeed}&rdquo;
            </p>
          </div>
        )}

        {/* References (teaching type) */}
        {references && references.length > 0 && (
          <div className="mt-10 rounded-2xl border border-oe-solar-gold/20 bg-oe-solar-gold/5 p-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-oe-solar-gold/70">
              Referenzen
            </p>
            <ul className="space-y-1.5">
              {references.map((ref, i) => (
                <li
                  key={i}
                  className="text-sm leading-relaxed text-oe-pure-light/50"
                >
                  {ref}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prev/Next Navigation */}
        {(prev || next) && (
          <div className="mt-16 grid gap-4 sm:grid-cols-2">
            {prev ? (
              <Link
                href={`/library/${prev.libraryType}/${prev.slug}`}
                className="group rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
              >
                <span className="text-xs uppercase tracking-wider text-oe-pure-light/30">
                  &larr; Vorheriger
                </span>
                <p className="mt-2 font-serif text-lg leading-snug text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={`/library/${next.libraryType}/${next.slug}`}
                className="group rounded-2xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-6 text-right transition-all duration-300 hover:border-oe-aurora-violet/40 hover:bg-oe-aurora-violet/5"
              >
                <span className="text-xs uppercase tracking-wider text-oe-pure-light/30">
                  N&auml;chster &rarr;
                </span>
                <p className="mt-2 font-serif text-lg leading-snug text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className="mt-16 rounded-2xl border border-oe-aurora-violet/20 bg-oe-aurora-violet/5 p-8 text-center">
          <p className="font-serif text-xl text-oe-pure-light">
            Bereit, tiefer einzutauchen?
          </p>
          <p className="mt-2 text-sm text-oe-pure-light/50">
            Entdecke unsere Community und kommende Gatherings.
          </p>
          <Link
            href="/community"
            data-cursor-hover
            className="mt-5 inline-block rounded-full bg-oe-aurora-violet px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
          >
            Community beitreten
          </Link>
        </div>
      </div>
    </div>
  )
}
