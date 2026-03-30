'use client'

import { motion } from 'framer-motion'
import { Minimize2, Waves, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useIntensityMode } from '@/hooks/useIntensityMode'
import type { IntensityMode } from '@/stores/intensity'

const modes: { value: IntensityMode; label: string; icon: typeof Minimize2 }[] = [
  { value: 'still', label: 'Still', icon: Minimize2 },
  { value: 'balanced', label: 'Balanced', icon: Waves },
  { value: 'immersive', label: 'Immersiv', icon: Sparkles },
]

/**
 * Three-state intensity toggle: Still / Balanced / Immersive.
 * Compact pill design for Navbar integration.
 */
export function IntensityToggle() {
  const { mode, effectiveMode, setMode } = useIntensityMode()
  const prefersReduced = effectiveMode === 'still' && mode !== 'still'

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-oe-pure-light/15 bg-oe-deep-space/60 p-0.5"
      role="radiogroup"
      aria-label="Intensitätsmodus"
    >
      {modes.map(({ value, label, icon: Icon }) => {
        const isActive = mode === value
        return (
          <button
            key={value}
            role="radio"
            aria-checked={isActive}
            aria-label={`${label}${prefersReduced && value === mode ? ' (überschrieben durch Barrierefreiheit)' : ''}`}
            onClick={() => setMode(value)}
            className={cn(
              'relative flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200',
              isActive
                ? 'text-oe-solar-gold'
                : 'text-oe-pure-light/40 hover:text-oe-pure-light/70'
            )}
          >
            {isActive && (
              <motion.span
                layoutId="intensity-indicator"
                className="absolute inset-0 rounded-full bg-oe-aurora-violet/20 border border-oe-aurora-violet/30"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            )}
            <Icon size={13} strokeWidth={1.5} className="relative z-10" />
          </button>
        )
      })}
    </div>
  )
}
