import { getTranslations } from 'next-intl/server'
import { LayerAtmosphere } from '@/components/motion/LayerAtmosphere'
import { getPreferences, getProfile } from '@/features/auth'
import { getWorkspaceProfile, listWorkspaces, requireWorkspaceAccess } from '@/features/workspaces'
import { WorkspacePreferencesHydrator } from '@/features/workspaces/components'
import { PortalSidebar } from './PortalSidebar'

export default async function InnerLayout({ children }: { children: React.ReactNode }) {
  const access = await requireWorkspaceAccess()
  const activeWorkspace = access.activeWorkspace
  const [t, preferences, globalProfile, workspaceProfile, adminWorkspaces] = await Promise.all([
    getTranslations('common'),
    getPreferences(),
    getProfile(),
    getWorkspaceProfile(activeWorkspace.workspaceId),
    access.role === 'admin' ? listWorkspaces() : Promise.resolve([]),
  ])
  const workspaceOptions =
    access.role === 'admin'
      ? adminWorkspaces.map((workspace) => ({
          id: workspace.id,
          name: workspace.name,
        }))
      : access.memberships
          .filter((membership) => membership.status === 'active')
          .map((membership) => ({
            id: membership.workspaceId,
            name: membership.name,
          }))

  return (
    <div className="relative isolate flex min-h-[100dvh] bg-oe-depth-warm">
      <LayerAtmosphere variant="warm" />
      <WorkspacePreferencesHydrator
        workspaceId={activeWorkspace.workspaceId}
        intensityMode={workspaceProfile?.intensityMode ?? preferences?.intensityMode ?? 'balanced'}
        audioEnabled={workspaceProfile?.audioEnabled ?? preferences?.audioEnabled ?? false}
        focusThemes={workspaceProfile?.focusThemes ?? preferences?.focusThemes ?? []}
        onboardingCompleted={preferences?.onboardingCompleted ?? false}
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-oe-solar-gold focus:px-4 focus:py-2 focus:text-oe-depth-warm focus:outline-none focus:ring-2 focus:ring-oe-warm-sand"
      >
        {t('skipToContent')}
      </a>
      <PortalSidebar
        userName={workspaceProfile?.displayName ?? globalProfile?.displayName ?? access.user.name}
        userImage={workspaceProfile?.avatarUrl ?? globalProfile?.avatarUrl ?? access.user.image}
        role={access.role}
        workspaces={workspaceOptions}
        activeWorkspaceId={activeWorkspace.workspaceId}
      />
      <main
        id="main-content"
        className="relative min-w-0 flex-1 px-4 pb-8 pt-20 md:px-8 md:py-8 lg:px-12"
      >
        {children}
      </main>
    </div>
  )
}
