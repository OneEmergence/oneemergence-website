import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { getStories } from '@/lib/content'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { ACCENTS } from '@/components/content/mdx-kit'
import { cn } from '@/lib/utils'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('story')
  return {
    title: t('indexTitle'),
    description: t('indexDescription'),
    alternates: { canonical: '/s' },
  }
}

export default async function StoriesIndex() {
  const t = await getTranslations('story')
  const tc = await getTranslations('common')
  // `listed: false` stories are reachable by direct link only.
  const stories = getStories().filter((s) => s.meta.listed)

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-oe-deep-space">
      <LayerAtmosphere variant="cosmic" />

      <div className="mx-auto w-full max-w-5xl px-4 pt-28 pb-28 sm:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-oe-aurora-violet uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-balance text-oe-pure-light md:text-6xl">
          {t('indexTitle')}
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-oe-pure-light/55">
          {t('indexDescription')}
        </p>

        <div className="mt-8 h-px bg-gradient-to-r from-oe-aurora-violet/40 via-oe-spirit-cyan/20 to-transparent" />

        {stories.length === 0 ? (
          <p className="mt-16 text-oe-pure-light/40">{tc('noContent')}</p>
        ) : (
          <ul className="mt-14 grid gap-5 md:grid-cols-2">
            {stories.map(({ meta, readingTime }) => {
              const a = ACCENTS[meta.accent]
              return (
                <li key={meta.slug}>
                  <Link
                    href={`/s/${meta.slug}`}
                    data-cursor-hover
                    className={cn(
                      'group flex h-full flex-col rounded-3xl border border-oe-pure-light/8 bg-oe-pure-light/[0.03] p-7 transition-colors duration-300',
                      a.hover,
                    )}
                  >
                    {meta.eyebrow && (
                      <span className={cn('font-mono text-[0.7rem] tracking-[0.25em] uppercase', a.text)}>
                        {meta.eyebrow}
                      </span>
                    )}
                    <span className="mt-3 font-serif text-2xl leading-snug text-balance text-oe-pure-light transition-colors duration-200 group-hover:text-oe-solar-gold">
                      {meta.title}
                    </span>
                    <span className="mt-3 text-sm leading-relaxed text-oe-pure-light/55">
                      {meta.description}
                    </span>
                    <span className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-oe-pure-light/35">
                      <time dateTime={meta.date}>
                        {new Intl.DateTimeFormat(meta.locale === 'en' ? 'en-GB' : 'de-DE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }).format(new Date(meta.date))}
                      </time>
                      <span aria-hidden="true">·</span>
                      <span>{tc('readingTime', { minutes: readingTime })}</span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
