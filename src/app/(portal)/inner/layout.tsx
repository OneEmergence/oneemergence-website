import { requireAuth } from '@/lib/auth/session'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { PortalSidebar } from './PortalSidebar'

/**
 * Inner space layout — the authenticated portal environment.
 * Warm, intimate feel — "well-lit study" not corporate dashboard.
 */
export default async function InnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()

  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-oe-depth-warm">
      <LayerAtmosphere variant="warm" />
      <PortalSidebar userName={user.name} userImage={user.image} />
      <main className="relative flex-1 px-4 py-8 md:px-8 lg:px-12">
        {children}
      </main>
    </div>
  )
}
