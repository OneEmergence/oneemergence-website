import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { ImmersiveMapBoundary } from '@/features/world-map/immersive/ImmersiveMapBoundary'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('worldMap.metadata')

  return {
    title: t('title'),
    description: t('description'),
    alternates: { canonical: '/map' },
    robots: { index: false, follow: true },
  }
}

export default function ImmersiveWorldMapPage() {
  return (
    <main>
      <ImmersiveMapBoundary />
    </main>
  )
}
