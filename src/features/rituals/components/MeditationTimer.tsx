'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MEDITATION_DURATIONS } from '../types'
import { PracticeComplete } from './PracticeComplete'

const CIRCLE_RADIUS = 90
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS

export function MeditationTimer() {
  const [selectedDuration, setSelectedDuration] = useState<number>(10) // minutes
  const [timeRemaining, setTimeRemaining] = useState<number>(10 * 60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSeconds = selectedDuration * 60

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const tick = useCallback(() => {
    setTimeRemaining((prev) => {
      if (prev <= 1) {
        clearTimer()
        setIsRunning(false)
        setIsComplete(true)
        return 0
      }
      return prev - 1
    })
  }, [clearTimer])

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000)
    }
    return clearTimer
  }, [isRunning, tick, clearTimer])

  function handleSelectDuration(mins: number) {
    if (isRunning) return
    setSelectedDuration(mins)
    setTimeRemaining(mins * 60)
    setIsComplete(false)
  }

  function handleStart() {
    if (isComplete) {
      setTimeRemaining(totalSeconds)
      setIsComplete(false)
    }
    setIsRunning(true)
  }

  function handlePause() {
    clearTimer()
    setIsRunning(false)
  }

  function handleReset() {
    clearTimer()
    setIsRunning(false)
    setIsComplete(false)
    setTimeRemaining(totalSeconds)
  }

  function handleCompleteClose() {
    setIsComplete(false)
    setTimeRemaining(totalSeconds)
  }

  const progress = 1 - timeRemaining / totalSeconds
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - progress)

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  if (isComplete) {
    return (
      <div className="flex justify-center">
        <PracticeComplete
          type="meditation"
          duration={totalSeconds - timeRemaining}
          onClose={handleCompleteClose}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Duration selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {MEDITATION_DURATIONS.map((mins) => (
          <button
            key={mins}
            onClick={() => handleSelectDuration(mins)}
            disabled={isRunning}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-colors',
              selectedDuration === mins
                ? 'bg-oe-aurora-violet/20 text-oe-aurora-violet'
                : 'text-oe-pure-light/50 hover:text-oe-pure-light/80',
              isRunning && 'cursor-not-allowed opacity-50'
            )}
          >
            {mins} Min
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="relative flex items-center justify-center">
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          className="-rotate-90"
          aria-hidden="true"
        >
          {/* Background ring */}
          <circle
            cx="110"
            cy="110"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-white/10"
          />
          {/* Progress ring */}
          <motion.circle
            cx="110"
            cy="110"
            r={CIRCLE_RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="text-oe-aurora-violet"
            strokeDasharray={CIRCLE_CIRCUMFERENCE}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'linear' }}
          />
        </svg>

        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-[family-name:var(--font-cormorant)] text-5xl font-light tracking-wider text-oe-pure-light"
            aria-live="polite"
            aria-atomic="true"
          >
            {display}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <AnimatePresence mode="wait">
          {!isRunning ? (
            <motion.button
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleStart}
              aria-label="Meditation starten"
              className="rounded-full bg-oe-aurora-violet/20 px-8 py-3 text-sm font-medium text-oe-aurora-violet transition-colors hover:bg-oe-aurora-violet/30"
            >
              {timeRemaining < totalSeconds ? 'Fortsetzen' : 'Starten'}
            </motion.button>
          ) : (
            <motion.button
              key="pause"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handlePause}
              aria-label="Meditation pausieren"
              className="rounded-full bg-oe-solar-gold/20 px-8 py-3 text-sm font-medium text-oe-solar-gold transition-colors hover:bg-oe-solar-gold/30"
            >
              Pausieren
            </motion.button>
          )}
        </AnimatePresence>

        {(isRunning || timeRemaining < totalSeconds) && (
          <button
            onClick={handleReset}
            aria-label="Timer zurücksetzen"
            className="rounded-full px-6 py-3 text-sm text-oe-pure-light/50 transition-colors hover:text-oe-pure-light/80"
          >
            Zurücksetzen
          </button>
        )}
      </div>

      {/* Guidance text */}
      <p className="max-w-xs text-center text-sm text-oe-pure-light/40">
        Finde eine bequeme Position. Schließe die Augen. Lass den Atem
        natürlich fließen.
      </p>
    </div>
  )
}
