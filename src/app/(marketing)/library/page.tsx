import { getTranslations } from 'next-intl/server'
import { ArrowRight } from 'lucide-react'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { DepthMark } from '@/components/ui/DepthMark'
import { getLibraryItems } from '@/lib/content'
import { LibraryClient } from './LibraryClient'

export const metadata = {
  title: 'Bibliothek',
  description:
    'Philosophische Texte, Reflexionen, Lehren und Einladungen zum Erwachen — geordnet nach heiligen Inhaltstypen.',
  alternates: { canonical: '/library' },
  openGraph: { url: '/library' },
}

/** Depth I of the homepage descent. The header is static server markup; only the filter is a client island. */
export default async function LibraryPage() {
  const t = await getTranslations('library')
  const th = await getTranslations('home')
  const items = getLibraryItems()

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-oe-deep-space pt-24 pb-16 md:pt-28 md:pb-20">
      <LayerAtmosphere variant="cosmic" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <header className="mb-12 md:mb-16">
          <div className="oe-descent">
            <DepthMark depth="cosmic" numeral="I" label={th('depth.cosmic')} />
            <span aria-hidden="true" className="oe-descent__line" data-motion-level="flow" />
            <span className="hidden text-sm text-oe-pure-light/60 sm:inline">{t('onward')}</span>
            <DepthMark href="/map" depth="solarpunk" numeral="II" label={th('paths.map.title')}>
              <ArrowRight aria-hidden="true" size={14} />
            </DepthMark>
          </div>
          <h1 className="mt-8 font-serif text-5xl leading-none text-oe-pure-light sm:text-6xl md:text-7xl">
            {t('title')}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-oe-pure-light/70">{t('lead')}</p>
        </header>

        <LibraryClient items={items} />
      </div>
    </div>
  )
}
