'use client'

import { useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { usePreferencesStore } from '@/stores/preferences'
import { updatePreferences } from '../preferences'
import { initialAuthState, type AuthActionState } from '../types'

type IntensityMode = 'still' | 'balanced' | 'immersive'

const INTENSITY_OPTIONS: { value: IntensityMode; label: string; desc: string }[] = [
  { value: 'still', label: 'Still', desc: 'Minimal, klar — keine Bewegung' },
  { value: 'balanced', label: 'Ausgewogen', desc: 'Sanfte Animationen, angenehme Tiefe' },
  { value: 'immersive', label: 'Immersiv', desc: 'Volle Erfahrung — Klang, Bewegung, Präsenz' },
]

interface PreferencesSettingsFormProps {
  initialIntensity: IntensityMode
  initialAudioEnabled: boolean
}

export function PreferencesSettingsForm({
  initialIntensity,
  initialAudioEnabled,
}: PreferencesSettingsFormProps) {
  const [intensity, setIntensity] = useState<IntensityMode>(initialIntensity)
  const [audioEnabled, setAudioEnabled] = useState(initialAudioEnabled)
  const [state, setState] = useState<AuthActionState>(initialAuthState)
  const [isPending, startTransition] = useTransition()
  const setPreferences = usePreferencesStore((s) => s.setPreferences)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fd = new FormData()
    fd.set('intensityMode', intensity)
    fd.set('audioEnabled', audioEnabled ? 'true' : 'false')
    setState(initialAuthState)
    startTransition(async () => {
      const result = await updatePreferences(fd)
      if (result.success) {
        // Reflect immediately in the live client store.
        setPreferences({ intensityMode: intensity, audioEnabled })
        setState({ status: 'success', message: 'Gespeichert.' })
      } else {
        setState({ status: 'error', error: result.error })
      }
    })
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-oe-pure-light">Erlebnis</h2>
        <p className="mt-1 text-sm text-oe-pure-light/40">
          Wie sich dein innerer Raum anfühlt — Bewegung und Klang.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs text-oe-pure-light/50">Intensität</legend>
          {INTENSITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setIntensity(opt.value)}
              aria-pressed={intensity === opt.value}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
                intensity === opt.value
                  ? 'border-oe-solar-gold bg-oe-solar-gold/10'
                  : 'border-oe-warm-sand/10 hover:border-oe-warm-sand/20 hover:bg-oe-warm-sand/[0.03]'
              )}
            >
              <p className="text-sm font-medium text-oe-pure-light">{opt.label}</p>
              <p className="mt-0.5 text-xs text-oe-pure-light/40">{opt.desc}</p>
            </button>
          ))}
        </fieldset>

        <label className="flex items-center justify-between rounded-xl border border-oe-warm-sand/10 px-4 py-3">
          <span>
            <span className="block text-sm text-oe-pure-light">Ambient-Klang</span>
            <span className="block text-xs text-oe-pure-light/40">
              Sanfte Klanglandschaft standardmäßig aktivieren
            </span>
          </span>
          <input
            type="checkbox"
            checked={audioEnabled}
            onChange={(e) => setAudioEnabled(e.target.checked)}
            className="h-5 w-5 accent-oe-solar-gold"
          />
        </label>

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
