import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { WorldMap } from '@/features/world-map'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldMap')
  const title = t('metadata.title')
  const description = t('metadata.description')
  const image = '/images/world-map/world-map-og.jpg'

  return {
    title,
    description,
    alternates: { canonical: '/map' },
    openGraph: {
      type: 'website',
      url: '/map',
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default function WorldMapPage() {
  return <WorldMap />
}
