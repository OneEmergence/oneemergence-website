'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { BREATH_PATTERNS, type BreathPattern } from '../types'
import { PracticeComplete } from './PracticeComplete'

const PHASE_LABELS: Record<string, string> = {
  inhale: 'Einatmen',
  hold: 'Halten',
  exhale: 'Ausatmen',
  rest: 'Ruhe',
}

const PHASE_COLORS: Record<string, string> = {
  inhale: 'text-oe-spirit-cyan',
  hold: 'text-oe-solar-gold',
  exhale: 'text-oe-aurora-violet',
  rest: 'text-oe-pure-light/50',
}

const PHASE_CIRCLE_SCALE: Record<string, number> = {
  inhale: 1,
  hold: 1,
  exhale: 0.5,
  rest: 0.5,
}

const PHASE_CIRCLE_COLORS: Record<string, string> = {
  inhale: 'rgba(84, 226, 233, 0.15)',
  hold: 'rgba(246, 196, 83, 0.15)',
  exhale: 'rgba(124, 92, 255, 0.15)',
  rest: 'rgba(247, 248, 251, 0.05)',
}

const PHASE_BORDER_COLORS: Record<string, string> = {
  inhale: 'rgba(84, 226, 233, 0.4)',
  hold: 'rgba(246, 196, 83, 0.4)',
  exhale: 'rgba(124, 92, 255, 0.4)',
  rest: 'rgba(247, 248, 251, 0.1)',
}

export function BreathworkGuide() {
  const [selectedPattern, setSelectedPattern] = useState<BreathPattern>(
    BREATH_PATTERNS[0]
  )
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [cycleCount, setCycleCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [showComplete, setShowComplete] = useState(false)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phaseIndexRef = useRef(0)

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    if (elapsedRef.current) {
      clearInterval(elapsedRef.current)
      elapsedRef.current = null
    }
  }, [])

  const advancePhase = useCallback(() => {
    const pattern = selectedPattern
    const nextIndex = phaseIndexRef.current + 1

    if (nextIndex >= pattern.phases.length) {
      // Completed a full cycle
      phaseIndexRef.current = 0
      setCurrentPhaseIndex(0)
      setCycleCount((prev) => prev + 1)
    } else {
      phaseIndexRef.current = nextIndex
      setCurrentPhaseIndex(nextIndex)
    }

    // Schedule next phase
    const nextPhaseIndex = phaseIndexRef.current
    const nextPhase = pattern.phases[nextPhaseIndex]
    timerRef.current = setTimeout(advancePhase, nextPhase.duration * 1000)
  }, [selectedPattern])

  function handleStart() {
    setIsRunning(true)
    setCycleCount(0)
    setElapsed(0)
    setCurrentPhaseIndex(0)
    phaseIndexRef.current = 0

    const firstPhase = selectedPattern.phases[0]
    timerRef.current = setTimeout(advancePhase, firstPhase.duration * 1000)
    elapsedRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }

  function handleStop() {
    clearTimers()
    setIsRunning(false)
    if (elapsed > 0) {
      setShowComplete(true)
    }
  }

  function handleSelectPattern(pattern: BreathPattern) {
    if (isRunning) return
    setSelectedPattern(pattern)
    setCurrentPhaseIndex(0)
    phaseIndexRef.current = 0
    setCycleCount(0)
    setElapsed(0)
  }

  function handleCompleteClose() {
    setShowComplete(false)
    setElapsed(0)
    setCycleCount(0)
    setCurrentPhaseIndex(0)
    phaseIndexRef.current = 0
  }

  useEffect(() => {
    return clearTimers
  }, [clearTimers])

  if (showComplete) {
    return (
      <div className="flex justify-center">
        <PracticeComplete
          type="breathwork"
          duration={elapsed}
          onClose={handleCompleteClose}
        />
      </div>
    )
  }

  const currentPhase = selectedPattern.phases[currentPhaseIndex]
  const phaseAction = currentPhase?.action ?? 'rest'

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Pattern selector */}
      {!isRunning && (
        <div className="grid w-full max-w-lg gap-3">
          {BREATH_PATTERNS.map((pattern) => (
            <button
              key={pattern.name}
              onClick={() => handleSelectPattern(pattern)}
              className={cn(
                'rounded-xl border p-4 text-left transition-colors',
                selectedPattern.name === pattern.name
                  ? 'border-oe-aurora-violet/40 bg-oe-aurora-violet/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              )}
            >
              <p className="text-sm font-medium text-oe-pure-light">
                {pattern.label}
              </p>
              <p className="mt-1 text-xs text-oe-pure-light/50">
                {pattern.description}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Breathing circle */}
      <div className="relative flex h-56 w-56 items-center justify-center">
        <motion.div
          className="absolute rounded-full"
          animate={{
            width: isRunning
              ? `${PHASE_CIRCLE_SCALE[phaseAction] * 100}%`
              : '60%',
            height: isRunning
              ? `${PHASE_CIRCLE_SCALE[phaseAction] * 100}%`
              : '60%',
            backgroundColor: isRunning
              ? PHASE_CIRCLE_COLORS[phaseAction]
              : 'rgba(124, 92, 255, 0.08)',
            borderColor: isRunning
              ? PHASE_BORDER_COLORS[phaseAction]
              : 'rgba(255, 255, 255, 0.1)',
          }}
          transition={{
            duration: isRunning ? currentPhase.duration : 0.5,
            ease: 'easeInOut',
          }}
          style={{ borderWidth: 1 }}
        />

        <div className="relative z-10 flex flex-col items-center gap-1">
          {isRunning ? (
            <>
              <motion.span
                key={phaseAction}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  'font-serif text-2xl font-semibold',
                  PHASE_COLORS[phaseAction]
                )}
                aria-live="assertive"
              >
                {PHASE_LABELS[phaseAction]}
              </motion.span>
              <span className="text-xs text-oe-pure-light/40">
                Zyklus {cycleCount + 1}
              </span>
            </>
          ) : (
            <span className="text-sm text-oe-pure-light/40">Bereit</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={handleStart}
            aria-label="Atemübung starten"
            className="rounded-full bg-oe-spirit-cyan/20 px-8 py-3 text-sm font-medium text-oe-spirit-cyan transition-colors hover:bg-oe-spirit-cyan/30"
          >
            Starten
          </button>
        ) : (
          <button
            onClick={handleStop}
            aria-label="Atemübung beenden"
            className="rounded-full bg-oe-aurora-violet/20 px-8 py-3 text-sm font-medium text-oe-aurora-violet transition-colors hover:bg-oe-aurora-violet/30"
          >
            Beenden
          </button>
        )}
      </div>

      {/* Elapsed time */}
      <AnimatePresence>
        {isRunning && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-oe-pure-light/30"
          >
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, '0')}{' '}
            vergangen
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
