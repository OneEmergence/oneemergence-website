'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useIntensityStore, type IntensityMode } from '@/stores/intensity'
import { usePreferencesStore } from '@/stores/preferences'
import { cn } from '@/lib/utils'
import { updateWorkspaceProfile } from '../actions'
import {
  initialWorkspaceActionState,
  type WorkspaceActionState,
  type WorkspaceProfile,
} from '../types'
import { WorkspaceActionFeedback } from './WorkspaceActionFeedback'

const intensityModes: IntensityMode[] = ['still', 'balanced', 'immersive']

const inputClasses = cn(
  'w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-3',
  'text-sm text-oe-pure-light placeholder:text-oe-pure-light/55',
  'focus:border-oe-solar-gold focus:outline-none focus:ring-2 focus:ring-oe-solar-gold/30'
)

interface WorkspaceProfileFormProps {
  workspaceId: string
  workspaceName: string
  profile: WorkspaceProfile | null
  fallback: {
    displayName: string | null
    avatarUrl: string | null
    bio: string | null
    intensityMode: IntensityMode
    audioEnabled: boolean
  }
}

export function WorkspaceProfileForm({
  workspaceId,
  workspaceName,
  profile,
  fallback,
}: WorkspaceProfileFormProps) {
  const t = useTranslations('profile.workspace')
  const intensity = useTranslations('profile.intensity')
  const [displayName, setDisplayName] = useState(profile?.displayName ?? fallback.displayName ?? '')
  const [bio, setBio] = useState(profile?.bio ?? fallback.bio ?? '')
  const [focusThemes, setFocusThemes] = useState(profile?.focusThemes?.join(', ') ?? '')
  const [intensityMode, setIntensityMode] = useState<IntensityMode>(
    profile?.intensityMode ?? fallback.intensityMode
  )
  const [audioEnabled, setAudioEnabled] = useState(profile?.audioEnabled ?? fallback.audioEnabled)
  const [state, setState] = useState<WorkspaceActionState>(initialWorkspaceActionState)
  const [isPending, startTransition] = useTransition()
  const setMode = useIntensityStore((store) => store.setMode)
  const setPreferences = usePreferencesStore((store) => store.setPreferences)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setState(initialWorkspaceActionState)
    startTransition(async () => {
      try {
        const result = await updateWorkspaceProfile(formData)
        setState(result)
        if (result.status === 'success') {
          const themes = focusThemes
            .split(',')
            .map((theme) => theme.trim())
            .filter(Boolean)
          setMode(intensityMode)
          setPreferences({ intensityMode, audioEnabled, focusThemes: themes })
        }
      } catch {
        setState({ status: 'error', error: 'failed' })
      }
    })
  }

  return (
    <section className="space-y-6" aria-labelledby="workspace-profile-title">
      <div>
        <h2 id="workspace-profile-title" className="font-serif text-xl text-oe-pure-light">
          {t('title')}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-oe-pure-light/55">
          {t('description', { workspace: workspaceName })}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isPending}>
        <input type="hidden" name="workspaceId" value={workspaceId} />
        <input
          type="hidden"
          name="avatarUrl"
          value={profile?.avatarUrl ?? fallback.avatarUrl ?? ''}
        />

        <div className="space-y-1.5">
          <label
            htmlFor="workspace-display-name"
            className="block text-xs font-medium text-oe-pure-light/60"
          >
            {t('displayName')}
          </label>
          <input
            id="workspace-display-name"
            name="displayName"
            type="text"
            autoComplete="name"
            maxLength={80}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder={t('displayNamePlaceholder')}
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="workspace-bio"
            className="block text-xs font-medium text-oe-pure-light/60"
          >
            {t('bio')}
          </label>
          <textarea
            id="workspace-bio"
            name="bio"
            rows={4}
            maxLength={500}
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            placeholder={t('bioPlaceholder')}
            className={cn(inputClasses, 'resize-y')}
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="workspace-focus-themes"
            className="block text-xs font-medium text-oe-pure-light/60"
          >
            {t('focusThemes')}
          </label>
          <input
            id="workspace-focus-themes"
            name="focusThemes"
            type="text"
            maxLength={500}
            value={focusThemes}
            onChange={(event) => setFocusThemes(event.target.value)}
            placeholder={t('focusThemesPlaceholder')}
            aria-describedby="workspace-focus-themes-help"
            className={inputClasses}
          />
          <p id="workspace-focus-themes-help" className="text-xs text-oe-pure-light/55">
            {t('focusThemesHelp')}
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-medium text-oe-pure-light/60">
            {t('intensity')}
          </legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {intensityModes.map((mode) => (
              <button
                key={mode}
                type="button"
                name="intensity-option"
                aria-pressed={intensityMode === mode}
                onClick={() => setIntensityMode(mode)}
                className={cn(
                  'rounded-xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold',
                  intensityMode === mode
                    ? 'border-oe-solar-gold bg-oe-solar-gold/10'
                    : 'border-oe-warm-sand/15 hover:border-oe-warm-sand/35'
                )}
              >
                <span className="block text-sm font-medium text-oe-pure-light">
                  {intensity(mode)}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-oe-pure-light/55">
                  {intensity(`${mode}Description`)}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" name="intensityMode" value={intensityMode} />
        </fieldset>

        <label className="flex min-h-12 items-center justify-between gap-4 rounded-xl border border-oe-warm-sand/15 px-4 py-3 text-sm text-oe-pure-light">
          <span>{t('audio')}</span>
          <input
            type="checkbox"
            name="audioEnabled"
            value="true"
            checked={audioEnabled}
            onChange={(event) => setAudioEnabled(event.target.checked)}
            className="h-5 w-5 accent-oe-solar-gold"
          />
        </label>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={isPending}
            className="min-h-11 rounded-full bg-oe-solar-gold px-6 py-3 text-sm font-semibold text-oe-depth-warm transition-colors hover:bg-oe-warm-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm disabled:opacity-50"
          >
            {isPending ? t('saving') : t('save')}
          </button>
          <WorkspaceActionFeedback state={state} />
        </div>
      </form>
    </section>
  )
}
