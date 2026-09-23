import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { ButtonLink } from '@/components/ui/button'
import { DepthMark } from '@/components/ui/DepthMark'

/**
 * Depth III of the homepage descent: the warm stage's "Lieber zuerst gemeinsam?"
 * lands here, and the page hands the visitor back on to the portal. Static
 * server markup, no motion.
 */
// ponytail: no event data source exists. The six hardcoded gatherings were all
// dated 2025 and filtered out for every visitor; render a list above the empty
// state once real dates come from a source.
export default async function EventsPage() {
  const t = await getTranslations('events')
  const th = await getTranslations('home')

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-oe-deep-space pt-24 pb-16 text-oe-pure-light md:pt-28 md:pb-20">
      <LayerAtmosphere variant="warm" />
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header>
          <DepthMark depth="warm" numeral="III" label={th('depth.warm')} />
          <h1 className="mt-8 text-balance font-serif text-5xl leading-none text-oe-pure-light sm:text-6xl md:text-7xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-oe-pure-light/75">{t('lead')}</p>
        </header>

        <section aria-labelledby="events-empty-title" className="mt-16 md:mt-20">
          <h2
            id="events-empty-title"
            className="text-balance font-serif text-3xl text-oe-pure-light md:text-4xl"
          >
            {t('empty.title')}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-oe-pure-light/75">
            {t('empty.lead')}
          </p>
          <ButtonLink
            href="/contact"
            variant="primary"
            size="md"
            className="mt-8 min-h-11 bg-oe-solar-gold text-oe-deep-space hover:opacity-90 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-oe-deep-space"
          >
            {t('empty.cta')}
            <ArrowRight aria-hidden="true" size={16} />
          </ButtonLink>
        </section>

        <nav
          aria-label={t('onwardLabel')}
          className="mt-24 flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-oe-warm-sand/15 pt-8 text-sm text-oe-pure-light/65"
        >
          <span>{t('onward')}</span>
          <DepthMark href="/portal" depth="warm" numeral="III" label={th('paths.portal.title')}>
            <ArrowRight aria-hidden="true" size={14} />
          </DepthMark>
        </nav>
      </div>
    </div>
  )
}
