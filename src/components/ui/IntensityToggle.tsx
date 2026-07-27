'use client'

import { useId, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Minimize2, Waves, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIntensityMode } from '@/hooks/useIntensityMode'
import type { IntensityMode } from '@/stores/intensity'

const modes: { value: IntensityMode; icon: typeof Minimize2 }[] = [
  { value: 'still', icon: Minimize2 },
  { value: 'balanced', icon: Waves },
  { value: 'immersive', icon: Sparkles },
]

/**
 * Three-state intensity toggle: Still / Balanced / Immersive.
 *
 * Implements the APG radiogroup pattern properly. It previously declared
 * `role="radiogroup"` without roving tabindex or arrow keys, so AT announced
 * "radio 1 of 3" and then the arrow keys did nothing. `aria-checked` also
 * tracked `mode` rather than `effectiveMode`, telling a user whose OS requests
 * reduced motion that Balanced was selected while the site actually ran Still.
 *
 * The override is now a separate `aria-describedby` note instead of being
 * glued onto one option's accessible name.
 */
export function IntensityToggle() {
  const { mode, effectiveMode, setMode } = useIntensityMode()
  const t = useTranslations('intensity')
  const noteId = useId()
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  // The OS preference wins over the stored choice; say so once, separately.
  const isOverridden = effectiveMode === 'still' && mode !== 'still'

  function focusMode(index: number) {
    const next = (index + modes.length) % modes.length
    setMode(modes[next].value)
    refs.current[next]?.focus()
  }

  function handleKeyDown(event: React.KeyboardEvent, index: number) {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        focusMode(index + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        focusMode(index - 1)
        break
      case 'Home':
        event.preventDefault()
        focusMode(0)
        break
      case 'End':
        event.preventDefault()
        focusMode(modes.length - 1)
        break
    }
  }

  return (
    <>
      <div
        className="flex items-center gap-0.5 rounded-full border border-oe-pure-light/15 bg-oe-deep-space/60 p-0.5"
        role="radiogroup"
        aria-label={t('groupLabel')}
        aria-describedby={isOverridden ? noteId : undefined}
      >
        {modes.map(({ value, icon: Icon }, index) => {
          // Reflects what is actually running, not what is stored.
          const isChecked = effectiveMode === value
          const isSelected = mode === value
          return (
            <button
              key={value}
              ref={(el) => {
                refs.current[index] = el
              }}
              type="button"
              role="radio"
              aria-checked={isChecked}
              aria-label={t(value)}
              // Roving tabindex: the group is one tab stop, arrows move within.
              tabIndex={isChecked ? 0 : -1}
              onClick={() => setMode(value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'relative flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oe-solar-gold',
                isSelected
                  ? 'text-oe-solar-gold'
                  : 'text-oe-pure-light/55 hover:text-oe-pure-light/70'
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="intensity-indicator"
                  className="absolute inset-0 rounded-full border border-oe-aurora-violet/30 bg-oe-aurora-violet/20"
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                />
              )}
              <Icon size={13} strokeWidth={1.5} className="relative z-10" aria-hidden="true" />
            </button>
          )
        })}
      </div>
      {isOverridden && (
        <span id={noteId} className="sr-only">
          {t('overridden')}
        </span>
      )}
    </>
  )
}
