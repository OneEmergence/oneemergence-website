import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import { getMapData } from '@/features/map/actions'
import { ConsciousnessMap } from '@/features/map/components/ConsciousnessMap'

export const metadata: Metadata = {
  title: 'Bewusstseinskarte — Innerer Raum',
}

export default async function MapPage() {
  await requireAuth()

  const result = await getMapData()
  const data = result.success ? result.data : { nodes: [], edges: [] }

  return (
    <div className="h-[calc(100vh-2rem)] w-full md:h-screen">
      <ConsciousnessMap initialData={data} />
    </div>
  )
}
