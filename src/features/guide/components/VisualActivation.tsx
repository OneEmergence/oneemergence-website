'use client'

import { motion } from 'framer-motion'
import type { GuideResponse } from '../types'

type VisualMode = NonNullable<GuideResponse['visualActivation']>

interface VisualActivationProps {
  mode: VisualMode
}

const modeConfig: Record<VisualMode, { label: string; gradient: string }> = {
  breathing: {
    label: 'Breathing',
    gradient: 'from-oe-aurora-violet/20 via-oe-spirit-cyan/10 to-transparent',
  },
  mandala: {
    label: 'Mandala',
    gradient: 'from-oe-solar-gold/20 via-oe-aurora-violet/10 to-transparent',
  },
  constellation: {
    label: 'Constellation',
    gradient: 'from-oe-spirit-cyan/20 via-oe-pure-light/5 to-transparent',
  },
  void: {
    label: 'Void',
    gradient: 'from-oe-pure-light/5 via-transparent to-transparent',
  },
}

/**
 * Placeholder visual activation component.
 * In future: replaced with WebGL sacred geometry / particle fields.
 * For now: a subtle gradient pulse that sets the atmospheric tone.
 */
export function VisualActivation({ mode }: VisualActivationProps) {
  const config = modeConfig[mode]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative my-3 flex h-24 items-center justify-center overflow-hidden rounded-xl"
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient}`}
      />

      {/* Breathing animation for the breathing mode */}
      {mode === 'breathing' && (
        <motion.div
          className="absolute h-16 w-16 rounded-full bg-oe-aurora-violet/10"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Pulsing dot for constellation */}
      {mode === 'constellation' && (
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-oe-spirit-cyan/40"
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      <span className="relative z-10 text-xs uppercase tracking-[0.2em] text-oe-pure-light/20">
        {config.label}
      </span>
    </motion.div>
  )
}
