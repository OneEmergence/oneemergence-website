'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { updateProfile } from '../actions'
import { initialAuthState, type AuthActionState, type ProfileRow } from '../types'
import { AvatarUpload } from './AvatarUpload'

const inputClasses = cn(
  'w-full rounded-lg border border-oe-warm-sand/20 bg-oe-warm-sand/[0.04] px-4 py-2.5',
  'text-sm text-oe-pure-light placeholder:text-oe-pure-light/55',
  'transition-colors focus:border-oe-solar-gold/60 focus:outline-none focus:ring-1 focus:ring-oe-solar-gold/40'
)

interface ProfileSettingsFormProps {
  userId: string
  profile: ProfileRow
}

export function ProfileSettingsForm({ userId, profile }: ProfileSettingsFormProps) {
  const [displayName, setDisplayName] = useState(profile.displayName ?? '')
  const [bio, setBio] = useState(profile.bio ?? '')
  const [state, setState] = useState<AuthActionState>(initialAuthState)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('displayName', displayName)
    fd.set('bio', bio)
    setState(initialAuthState)
    startTransition(async () => {
      setState(await updateProfile(fd))
    })
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-oe-pure-light">Profil</h2>
        <p className="mt-1 text-sm text-oe-pure-light/55">
          Wie du im inneren Raum erscheinst.
        </p>
      </div>

      <AvatarUpload
        userId={userId}
        initialUrl={profile.avatarUrl}
        displayName={displayName || profile.displayName}
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="displayName" className="block text-xs text-oe-pure-light/50">
            Anzeigename
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Dein Name"
            className={inputClasses}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="bio" className="block text-xs text-oe-pure-light/50">
            Über dich <span className="text-oe-pure-light/55">(optional)</span>
          </label>
          <textarea
            id="bio"
            name="bio"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Ein paar Worte über deinen Weg …"
            className={cn(inputClasses, 'resize-y')}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              'rounded-full bg-oe-solar-gold px-6 py-2.5 text-sm font-medium text-oe-depth-warm',
              'transition-all duration-300 hover:bg-oe-solar-gold/90',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold focus-visible:ring-offset-2 focus-visible:ring-offset-oe-depth-warm',
              'disabled:cursor-not-allowed disabled:opacity-50'
            )}
          >
            {isPending ? 'Speichert …' : 'Speichern'}
          </button>
          {state.status === 'error' && (
            <span className="text-xs text-red-300">{state.error}</span>
          )}
          {state.status === 'success' && (
            <span className="text-xs text-oe-living-green">
              {state.message ?? 'Gespeichert.'}
            </span>
          )}
        </div>
      </form>
    </section>
  )
}
