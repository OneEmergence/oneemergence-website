import Image from 'next/image'
import Link from 'next/link'
import { getFormatter, getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { StarField } from '@/components/scene/StarField'
import { EmblemMark } from '@/components/motion/EmblemMark'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { BreathingOrb } from '@/components/motion/BreathingOrb'
import { ButtonLink } from '@/components/ui/button'
import { getLibraryItems } from '@/lib/content'
import { libraryItemHref, libraryTypeMeta } from '@/lib/content/library-types'
import { cn } from '@/lib/utils'
import { HomeHeroDrift } from './HomeHeroDrift'

// The root layout no longer sets a canonical (it would be inherited by every
// route that does not declare one). The home page declares its own.
export const metadata = {
  alternates: { canonical: '/' },
}

type Depth = 'cosmic' | 'solarpunk' | 'warm'

/** The three public paths are the three depths, in descending order. */
const PATHS = [
  { key: 'library', href: '/library', depth: 'cosmic', numeral: 'I' },
  { key: 'map', href: '/map', depth: 'solarpunk', numeral: 'II' },
  { key: 'portal', href: '/portal', depth: 'warm', numeral: 'III' },
] as const satisfies readonly { key: string; href: string; depth: Depth; numeral: string }[]

const PORTAL_ROOMS = ['journal', 'map', 'guide', 'practice'] as const

/** Roman numeral + depth name, set on the same orb the hero's ecliptic uses. */
function DepthMark({ depth, numeral, label }: { depth: Depth; numeral: string; label: string }) {
  return (
    <p data-depth={depth} className="oe-depth-mark">
      <span aria-hidden="true" className="oe-depth-orb" />
      <span>
        {numeral} · {label}
      </span>
    </p>
  )
}

/**
 * One depth of the descent. Reuses the story-page stage (sticky colour field,
 * feathered edges, CSS scroll timeline), so the homepage changes depth
 * without any client JavaScript.
 */
function DepthStage({
  id,
  depth,
  image,
  labelledBy,
  className,
  children,
}: {
  id: string
  depth: Depth
  image?: string
  labelledBy: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className="oe-stage scroll-mt-20"
      data-atmosphere={depth}
      data-motion-level="flow"
    >
      <div className="oe-stage__bg" aria-hidden="true">
        <div className="oe-stage__layer">
          <div className="oe-stage__wash" />
          {image && (
            <div
              className="oe-stage__image"
              style={{ '--oe-stage-image': `url("${image}")` } as React.CSSProperties}
            />
          )}
        </div>
      </div>
      <div className={cn('relative mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>
        {children}
      </div>
    </section>
  )
}

export default async function Home() {
  const t = await getTranslations('home')
  const tc = await getTranslations('common')
  const format = await getFormatter()
  const latest = getLibraryItems().slice(0, 3)

  return (
    <div className="oe-home relative isolate overflow-hidden bg-oe-deep-space text-oe-pure-light">
      <LayerAtmosphere variant="cosmic" />

      {/* ── Threshold: the name, and the three depths laid out on one line ── */}
      <section className="oe-home-hero relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-16 pt-28 sm:px-8">
        <StarField />
        <div aria-hidden="true" className="oe-home-hero__tints">
          {PATHS.map((path) => (
            <span key={path.depth} data-depth={path.depth} />
          ))}
        </div>

        <HomeHeroDrift className="relative z-10 flex w-full flex-col items-center text-center">
          <EmblemMark size={96} priority />

          {/* Server-rendered and never hidden: this is the LCP element. */}
          <h1 className="mt-8 font-serif text-5xl leading-none text-oe-solar-gold sm:text-6xl md:text-7xl lg:text-8xl">
            OneEmergence
          </h1>

          <p className="mt-6 max-w-xl text-balance text-base leading-relaxed text-oe-pure-light/70 sm:text-lg">
            {t('tagline')}
          </p>

          <nav aria-label={t('pathsLabel')} className="oe-ecliptic mt-14 w-full max-w-4xl sm:mt-16">
            <span aria-hidden="true" className="oe-ecliptic__line" />
            <ol className="oe-ecliptic__list">
              {PATHS.map((path, i) => (
                <li key={path.key} style={{ '--i': i } as React.CSSProperties}>
                  <Link
                    href={path.href}
                    data-depth={path.depth}
                    className="oe-ecliptic__path group"
                  >
                    <span
                      aria-hidden="true"
                      className="oe-ecliptic__orb"
                      data-motion-level="flow"
                    />
                    <span className="oe-ecliptic__text">
                      <span className="oe-ecliptic__depth">
                        {path.numeral} · {t(`depth.${path.depth}`)}
                      </span>
                      <span className="oe-ecliptic__title">{t(`paths.${path.key}.title`)}</span>
                      <span className="oe-ecliptic__hint">{t(`paths.${path.key}.hint`)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <Link
            href="/manifesto"
            className="mt-12 inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-oe-pure-light/65 transition-colors hover:text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet"
          >
            {t('manifesto')}
            <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </HomeHeroDrift>
      </section>

      {/* ── I · Cosmos: the library ── */}
      <DepthStage
        id="bibliothek"
        depth="cosmic"
        labelledBy="home-library-title"
        className="grid gap-12 lg:grid-cols-2 lg:gap-20"
      >
        <div className="oe-reveal">
          <DepthMark depth="cosmic" numeral="I" label={t('depth.cosmic')} />
          <h2 id="home-library-title" className="oe-home-title mt-6">
            {t('library.title')}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-oe-pure-light/70">
            {t('library.lead')}
          </p>
          <ButtonLink href="/library" variant="primary" size="md" className="mt-10 min-h-11">
            {t('library.cta')}
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>

        <div className="oe-reveal lg:pt-4">
          <h3 className="text-sm text-oe-pure-light/60">{t('library.latest')}</h3>
          <ul className="mt-4 border-b border-oe-pure-light/10">
            {latest.map((item) => {
              const meta = libraryTypeMeta(item.libraryType)
              return (
                <li
                  key={`${item.libraryType}/${item.slug}`}
                  className="border-t border-oe-pure-light/10"
                >
                  <Link
                    href={libraryItemHref(item)}
                    className="group grid gap-2 py-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet sm:grid-cols-[1fr_auto] sm:gap-x-8"
                  >
                    <span className="flex items-center gap-2 text-xs text-oe-pure-light/60 sm:col-span-2">
                      <span
                        aria-hidden="true"
                        className={cn('size-1.5 rounded-full', meta.dotColor)}
                      />
                      {meta.label}
                      <span aria-hidden="true">·</span>
                      <time dateTime={item.date}>
                        {format.dateTime(new Date(item.date), {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </time>
                    </span>
                    <span className="text-balance font-serif text-2xl leading-snug text-oe-pure-light transition-colors group-hover:text-oe-solar-gold sm:text-3xl">
                      {item.title}
                    </span>
                    <span className="self-end whitespace-nowrap text-xs text-oe-pure-light/60">
                      {tc('readingTime', { minutes: item.readingTime })}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </DepthStage>

      {/* ── II · Solarpunk: the world map ── */}
      <DepthStage
        id="welt"
        depth="solarpunk"
        image="/images/backgrounds/depth-solarpunk.webp"
        labelledBy="home-map-title"
        className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-16"
      >
        <Link
          href="/map"
          // The CTA beside it is the keyboard/screen-reader path; this is the
          // same destination as a large pointer target.
          tabIndex={-1}
          aria-hidden="true"
          className="oe-reveal oe-map-window group order-last lg:order-first"
        >
          <Image
            src="/images/world-map/world-map-og.jpg"
            alt=""
            width={1200}
            height={630}
            sizes="(min-width: 1024px) 40rem, 100vw"
            className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]"
          />
        </Link>

        <div className="oe-reveal">
          <DepthMark depth="solarpunk" numeral="II" label={t('depth.solarpunk')} />
          <h2 id="home-map-title" className="oe-home-title mt-6">
            {t('map.title')}
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-oe-pure-light/75">
            {t('map.lead')}
          </p>
          <ButtonLink
            href="/map"
            variant="outline"
            size="md"
            className="mt-10 min-h-11 border-oe-living-green text-oe-living-green hover:bg-oe-living-green/10 active:bg-oe-living-green/20"
          >
            {t('map.cta')}
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </div>
      </DepthStage>

      {/* ── III · Warmth: the personal portal ── */}
      <DepthStage
        id="portal"
        depth="warm"
        image="/images/backgrounds/depth-warm.webp"
        labelledBy="home-portal-title"
        className="flex flex-col items-center pb-8 text-center"
      >
        <BreathingOrb
          color="gold"
          size={420}
          breathRate={10}
          glowIntensity={70}
          className="absolute left-1/2 top-4 -translate-x-1/2"
        />
        <div className="oe-reveal relative flex flex-col items-center">
          <DepthMark depth="warm" numeral="III" label={t('depth.warm')} />
          <h2 id="home-portal-title" className="oe-home-title mt-6 max-w-3xl">
            {t('portal.title')}
          </h2>
          <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-oe-pure-light/75">
            {t('portal.lead')}
          </p>

          <ul aria-label={t('portal.roomsLabel')} className="oe-portal-rooms mt-10">
            {PORTAL_ROOMS.map((room) => (
              <li key={room}>{t(`portal.rooms.${room}`)}</li>
            ))}
          </ul>

          <ButtonLink
            href="/portal"
            variant="primary"
            size="lg"
            className="mt-12 min-h-12 bg-oe-solar-gold text-oe-deep-space hover:opacity-90"
          >
            {t('portal.cta')}
            <ArrowRight aria-hidden="true" size={18} />
          </ButtonLink>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-oe-pure-light/65">
            {t('portal.access')}
          </p>
        </div>

        <div className="mt-24 flex w-full max-w-xl flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-oe-warm-sand/15 pt-8 text-sm text-oe-pure-light/65">
          <span className="mr-2">{t('community.lead')}</span>
          <Link
            href="/events"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-oe-warm-sand transition-colors hover:text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
          >
            {t('community.events')}
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center rounded-full px-3 text-oe-warm-sand transition-colors hover:text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
          >
            {t('community.contact')}
          </Link>
        </div>
      </DepthStage>
    </div>
  )
}
