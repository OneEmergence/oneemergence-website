import type { Metadata } from 'next'
import { requireAuth } from '@/lib/auth/session'
import {
  getProfile,
  getPreferences,
  ProfileSettingsForm,
  PreferencesSettingsForm,
  DangerZone,
  type ProfileRow,
} from '@/features/auth'

export const metadata: Metadata = {
  title: 'Einstellungen',
}

export default async function SettingsPage() {
  const user = await requireAuth()

  const [profile, prefs] = await Promise.all([getProfile(), getPreferences()])

  const resolvedProfile: ProfileRow = profile ?? {
    displayName: user.name,
    bio: null,
    avatarUrl: user.image,
  }

  return (
    <div className="mx-auto max-w-2xl space-y-12 pb-16">
      <header className="space-y-1">
        <h1 className="font-serif text-3xl text-oe-pure-light">Einstellungen</h1>
        <p className="text-sm text-oe-pure-light/40">
          Dein Raum, deine Regeln. Alles hier lässt sich jederzeit ändern.
        </p>
      </header>

      <ProfileSettingsForm userId={user.id} profile={resolvedProfile} />

      <div className="h-px bg-oe-warm-sand/10" />

      <PreferencesSettingsForm
        initialIntensity={prefs?.intensityMode ?? 'balanced'}
        initialAudioEnabled={prefs?.audioEnabled ?? false}
      />

      <div className="h-px bg-oe-warm-sand/10" />

      <DangerZone />
    </div>
  )
}
