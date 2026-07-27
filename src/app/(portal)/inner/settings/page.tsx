import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import {
  DangerZone,
  getPreferences,
  getProfile,
  PreferencesSettingsForm,
  ProfileSettingsForm,
  type ProfileRow,
} from '@/features/auth'
import { getWorkspaceProfile, requireWorkspaceAccess } from '@/features/workspaces'
import { WorkspaceProfileForm } from '@/features/workspaces/components'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('profile.settings')
  return { title: t('metadataTitle') }
}

export default async function SettingsPage() {
  const access = await requireWorkspaceAccess()
  const activeWorkspace = access.activeWorkspace
  const [profile, preferences, workspaceProfile, t] = await Promise.all([
    getProfile(),
    getPreferences(),
    getWorkspaceProfile(activeWorkspace.workspaceId),
    getTranslations('profile.settings'),
  ])

  const resolvedProfile: ProfileRow = profile ?? {
    displayName: access.user.name,
    bio: null,
    avatarUrl: access.user.image,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-12 pb-16">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl text-oe-pure-light">{t('title')}</h1>
        <p className="text-sm leading-relaxed text-oe-pure-light/55">{t('description')}</p>
      </header>

      <ProfileSettingsForm userId={access.user.id} profile={resolvedProfile} />

      <div className="h-px bg-oe-warm-sand/10" />

      <WorkspaceProfileForm
        workspaceId={activeWorkspace.workspaceId}
        workspaceName={activeWorkspace.name}
        profile={workspaceProfile}
        fallback={{
          displayName: resolvedProfile.displayName,
          avatarUrl: resolvedProfile.avatarUrl,
          bio: resolvedProfile.bio,
          intensityMode: preferences?.intensityMode ?? 'balanced',
          audioEnabled: preferences?.audioEnabled ?? false,
        }}
      />

      <div className="h-px bg-oe-warm-sand/10" />

      <PreferencesSettingsForm
        initialIntensity={preferences?.intensityMode ?? 'balanced'}
        initialAudioEnabled={preferences?.audioEnabled ?? false}
      />

      <div className="h-px bg-oe-warm-sand/10" />

      <DangerZone />
    </div>
  )
}
