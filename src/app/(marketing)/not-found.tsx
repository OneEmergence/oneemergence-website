import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'

/**
 * 404 for the public tree.
 *
 * Eight call sites invoke `notFound()` and none had a boundary, so every bad
 * slug, stale content link or mistyped URL landed on Next's unstyled white
 * default page — no chrome, no way back, and a hard white flash on a site
 * whose whole premise is an unbroken dark field.
 *
 * Living inside `(marketing)` means it inherits PublicChrome and the intl
 * provider, so the nav, the footer and the copy all come along.
 */
export default async function NotFound() {
  const t = await getTranslations('notFound')

  return (
    <div className="relative isolate flex min-h-[70svh] items-center overflow-hidden bg-oe-deep-space">
      <LayerAtmosphere variant="cosmic" />
      <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs tracking-[0.3em] text-oe-aurora-violet-ink uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="mt-5 font-serif text-4xl leading-tight text-balance text-oe-pure-light md:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-5 max-w-md leading-relaxed text-oe-pure-light/60">
          {t('body')}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            data-cursor-hover
            className="inline-flex min-h-11 items-center rounded-full bg-oe-aurora-violet-deep px-6 text-sm font-medium text-white transition-opacity duration-200 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold"
          >
            {t('home')}
          </Link>
          <Link
            href="/library"
            data-cursor-hover
            className="inline-flex min-h-11 items-center rounded-full border border-oe-pure-light/15 px-6 text-sm text-oe-pure-light/70 transition-colors duration-200 hover:border-oe-pure-light/35 hover:text-oe-pure-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-oe-solar-gold"
          >
            {t('library')}
          </Link>
        </div>
      </div>
    </div>
  )
}
