import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getStories, getStoryBySlug } from '@/lib/content'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { ACCENTS } from '@/components/content/mdx-kit'
import { cn } from '@/lib/utils'

/**
 * One MDX file in `src/content/stories/` ⇒ one shareable page here.
 *
 * Statically generated at build time (including `listed: false` pages — an
 * unlisted story is a real, permanent URL, it is only kept out of the index
 * and the sitemap).
 */
export async function generateStaticParams() {
  return getStories().map((s) => ({ slug: s.meta.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const story = await getStoryBySlug(slug)
  if (!story) return {}

  const { meta } = story
  const hidden = meta.noindex || !meta.listed
  const url = `/s/${meta.slug}`

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: url },
    // Unlisted pages are for a specific recipient. Keep them out of the index
    // — the link still renders a full preview card when pasted into a chat.
    robots: hidden ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      url,
      title: meta.title,
      description: meta.description,
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
      authors: [meta.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const story = await getStoryBySlug(slug)
  if (!story) notFound()

  const { meta, content, readingTime } = story
  const t = await getTranslations('story')
  const tc = await getTranslations('common')
  const a = ACCENTS[meta.accent]

  const dateFmt = new Intl.DateTimeFormat(meta.locale === 'en' ? 'en-GB' : 'de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-oe-deep-space">
      <LayerAtmosphere variant={meta.atmosphere} />

      {meta.hero === 'cover' && meta.cover && (
        <div className="relative h-[46svh] min-h-[18rem] w-full">
          <Image
            src={meta.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-oe-deep-space/40 via-transparent to-oe-deep-space" />
        </div>
      )}

      <header
        className={cn(
          'oe-measure mx-auto',
          meta.hero === 'cover' ? 'relative -mt-24 pb-4' : '',
          meta.hero === 'full' && 'flex min-h-[68svh] flex-col justify-center pt-28 pb-10',
          meta.hero === 'compact' && 'pt-28 pb-6',
        )}
      >
        {meta.eyebrow && (
          <p className={cn('mb-4 font-mono text-xs tracking-[0.3em] uppercase', a.text)}>
            {meta.eyebrow}
          </p>
        )}

        <h1
          className={cn(
            'font-serif leading-[1.05] text-balance text-oe-pure-light',
            meta.hero === 'full' ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-4xl md:text-5xl',
          )}
        >
          {meta.title}
        </h1>

        {meta.subtitle && (
          <p className="mt-6 max-w-2xl font-serif text-xl leading-relaxed text-balance text-oe-pure-light/60 sm:text-2xl">
            {meta.subtitle}
          </p>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-oe-pure-light/40">
          <span>{meta.author}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={meta.date}>{dateFmt.format(new Date(meta.date))}</time>
          <span aria-hidden="true">·</span>
          <span>{tc('readingTime', { minutes: readingTime })}</span>
          {meta.updated && (
            <>
              <span aria-hidden="true">·</span>
              <span>{t('updated', { date: dateFmt.format(new Date(meta.updated)) })}</span>
            </>
          )}
        </div>

        <div className={cn('mt-10 h-px bg-gradient-to-r to-transparent', a.rule)} />
      </header>

      <article
        className={cn(
          'oe-prose prose prose-invert prose-base sm:prose-lg max-w-none pb-24',
          'prose-headings:font-serif prose-headings:text-oe-pure-light prose-headings:text-balance',
          'prose-h2:mt-16 prose-h2:text-3xl sm:prose-h2:text-4xl prose-h3:mt-12 prose-h3:text-xl',
          'prose-p:mt-6 prose-p:text-oe-pure-light/70 prose-p:leading-relaxed prose-p:text-pretty',
          'prose-a:text-oe-aurora-violet prose-a:underline prose-a:underline-offset-4 prose-a:decoration-oe-aurora-violet/40 hover:prose-a:text-oe-solar-gold',
          'prose-strong:text-oe-pure-light prose-blockquote:border-oe-pure-light/15 prose-blockquote:text-oe-pure-light/60',
          'prose-hr:border-oe-pure-light/10',
          'prose-ul:mt-6 prose-ol:mt-6 prose-ul:text-oe-pure-light/70 prose-ol:text-oe-pure-light/70',
          'prose-li:marker:text-oe-aurora-violet prose-img:rounded-2xl',
        )}
      >
        {content}
      </article>

      <footer className="oe-measure mx-auto pb-28">
        {meta.cta && (
          <aside
            className={cn('rounded-3xl border p-8 text-center sm:p-12', a.border, a.bg)}
          >
            <p className="font-serif text-2xl text-balance text-oe-pure-light sm:text-3xl">
              {meta.cta.title ?? t('ctaFallbackTitle')}
            </p>
            {meta.cta.note && (
              <p className="mx-auto mt-3 max-w-xl text-sm text-oe-pure-light/55">{meta.cta.note}</p>
            )}
            <Link
              href={meta.cta.href}
              data-cursor-hover
              className={cn(
                'mt-6 inline-block rounded-full px-7 py-3 text-sm font-medium transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold',
                a.solid,
              )}
            >
              {meta.cta.label}
            </Link>
          </aside>
        )}

        {meta.tags.length > 0 && (
          <ul className="mt-12 flex flex-wrap gap-2">
            {meta.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-full border border-oe-pure-light/10 px-3 py-1 text-xs text-oe-pure-light/45"
              >
                {tag}
              </li>
            ))}
          </ul>
        )}

        {meta.listed && (
          <Link
            href="/s"
            className="mt-12 inline-flex min-h-11 items-center gap-2 text-sm text-oe-pure-light/40 transition-colors hover:text-oe-pure-light/70"
          >
            ← {t('backToIndex')}
          </Link>
        )}
      </footer>
    </div>
  )
}
