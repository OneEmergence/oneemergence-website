import { requireAuth } from '@/lib/auth/session'
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
    <div className="flex min-h-screen bg-oe-deep-space">
      <PortalSidebar userName={user.name} userImage={user.image} />
      <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
        {children}
      </main>
    </div>
  )
}
