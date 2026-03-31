'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { usePreferencesStore } from '@/stores/preferences'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const FOCUS_THEMES = [
  'Meditation & Stille',
  'Atemarbeit',
  'Bewusstseinserforschung',
  'Traumarbeit',
  'Schattenarbeit',
  'Kreatives Schreiben',
  'Naturverbindung',
  'Archetypische Muster',
  'Energiearbeit',
  'Tägliche Reflexion',
]

type IntensityMode = 'still' | 'balanced' | 'immersive'

const INTENSITY_OPTIONS: {
  value: IntensityMode
  label: string
  desc: string
}[] = [
  {
    value: 'still',
    label: 'Still',
    desc: 'Minimal, klar, fokussiert — keine Bewegung',
  },
  {
    value: 'balanced',
    label: 'Ausgewogen',
    desc: 'Sanfte Animationen, angenehme Tiefe',
  },
  {
    value: 'immersive',
    label: 'Immersiv',
    desc: 'Volle Erfahrung — Klang, Bewegung, Präsenz',
  },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0)
  const [intensityMode, setIntensityMode] = useState<IntensityMode>('balanced')
  const [focusThemes, setFocusThemes] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const setPreferences = usePreferencesStore((s) => s.setPreferences)

  function toggleTheme(theme: string) {
    setFocusThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    )
  }

  function handleComplete() {
    const formData = new FormData()
    formData.set('intensityMode', intensityMode)
    formData.set('focusThemes', JSON.stringify(focusThemes))
    formData.set('audioEnabled', 'false')

    startTransition(async () => {
      await completeOnboarding(formData)
      setPreferences({ intensityMode, focusThemes, onboardingCompleted: true })
      onComplete()
    })
  }

  function handleSkip() {
    // Mark completed locally so the modal doesn't reappear in this session
    setPreferences({ onboardingCompleted: true })
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-oe-deep-space/95 p-4 backdrop-blur-sm">
      <motion.div
        className="relative w-full max-w-lg rounded-2xl border border-oe-pure-light/10 bg-oe-deep-space p-8 shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Step progress bar */}
        <div className="mb-8 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-colors duration-500',
                i <= step ? 'bg-oe-aurora-violet' : 'bg-oe-pure-light/10'
              )}
            />
          ))}
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="font-serif text-2xl text-oe-pure-light">
                Willkommen in deinem inneren Raum
              </h2>
              <p className="text-sm leading-relaxed text-oe-pure-light/60">
                Dieser Raum gehört dir — ein Ort für Reflexion, Praxis und
                Wachstum. Lass uns kurz einrichten, was dir wichtig ist.
              </p>
              <p className="text-sm text-oe-pure-light/30">
                Drei kurze Schritte. Du kannst alles jederzeit ändern.
              </p>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="intensity"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="font-serif text-2xl text-oe-pure-light">
                Wie intensiv möchtest du erleben?
              </h2>
              <p className="text-sm text-oe-pure-light/50">
                Beeinflusst Animationen, Klänge und visuelle Tiefe.
              </p>
              <div className="mt-2 space-y-2">
                {INTENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIntensityMode(opt.value)}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left transition-all duration-200',
                      intensityMode === opt.value
                        ? 'border-oe-aurora-violet bg-oe-aurora-violet/10'
                        : 'border-oe-pure-light/10 hover:border-oe-pure-light/20 hover:bg-oe-pure-light/[0.03]'
                    )}
                  >
                    <p className="text-sm font-medium text-oe-pure-light">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-xs text-oe-pure-light/40">
                      {opt.desc}
                    </p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="themes"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <h2 className="font-serif text-2xl text-oe-pure-light">
                Was interessiert dich?
              </h2>
              <p className="text-sm text-oe-pure-light/50">
                Wähle Themen, die dich ansprechen. Auch optional.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {FOCUS_THEMES.map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs transition-all duration-200',
                      focusThemes.includes(theme)
                        ? 'border-oe-spirit-cyan bg-oe-spirit-cyan/10 text-oe-spirit-cyan'
                        : 'border-oe-pure-light/10 text-oe-pure-light/50 hover:border-oe-pure-light/20 hover:text-oe-pure-light/70'
                    )}
                  >
                    {theme}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-oe-pure-light/25 transition-colors hover:text-oe-pure-light/50"
          >
            Überspringen
          </button>

          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg px-4 py-2 text-sm text-oe-pure-light/50 transition-colors hover:text-oe-pure-light"
              >
                Zurück
              </button>
            )}
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="rounded-lg bg-oe-aurora-violet px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-oe-aurora-violet/80"
              >
                Weiter
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isPending}
                className={cn(
                  'rounded-lg bg-oe-aurora-violet px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-oe-aurora-violet/80',
                  'disabled:cursor-not-allowed disabled:opacity-50'
                )}
              >
                {isPending ? 'Speichert...' : 'Starten'}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
