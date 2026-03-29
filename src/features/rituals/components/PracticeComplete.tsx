'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { PracticeType } from '../types'
import { logPractice } from '../actions'

interface PracticeCompleteProps {
  type: PracticeType
  duration: number // seconds
  onClose: () => void
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs} Sekunden`
  if (secs === 0) return `${mins} Minuten`
  return `${mins} Min. ${secs} Sek.`
}

const typeLabels: Record<PracticeType, string> = {
  meditation: 'Meditation',
  breathwork: 'Atemarbeit',
  soundscape: 'Klanglandschaft',
}

export function PracticeComplete({
  type,
  duration,
  onClose,
}: PracticeCompleteProps) {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const formData = new FormData()
    formData.set('type', type)
    formData.set('duration', String(duration))
    if (notes.trim()) {
      formData.set('notes', notes.trim())
    }

    startTransition(async () => {
      const result = await logPractice(formData)
      if (result.success) {
        setSaved(true)
      } else {
        setError(result.error)
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-oe-solar-gold/20"
      >
        <span className="text-2xl text-oe-solar-gold">&#10047;</span>
      </motion.div>

      <div>
        <h3 className="font-serif text-2xl font-semibold text-oe-pure-light">
          Praxis abgeschlossen
        </h3>
        <p className="mt-2 text-sm text-oe-pure-light/60">
          {typeLabels[type]} &middot; {formatDuration(duration)}
        </p>
      </div>

      {saved ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-oe-spirit-cyan"
        >
          Gespeichert. Danke für deine Praxis.
        </motion.p>
      ) : (
        <div className="flex w-full max-w-sm flex-col gap-4">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notizen zu deiner Praxis (optional)..."
            rows={3}
            className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-oe-pure-light placeholder:text-oe-pure-light/30 focus:border-oe-aurora-violet/50 focus:outline-none"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                'flex-1 rounded-lg bg-oe-aurora-violet/20 px-4 py-2.5 text-sm font-medium text-oe-aurora-violet transition-colors',
                'hover:bg-oe-aurora-violet/30 disabled:opacity-50'
              )}
            >
              {isPending ? 'Wird gespeichert...' : 'Speichern'}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2.5 text-sm text-oe-pure-light/50 transition-colors hover:text-oe-pure-light/80"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {saved && (
        <button
          onClick={onClose}
          className="rounded-lg px-4 py-2.5 text-sm text-oe-pure-light/50 transition-colors hover:text-oe-pure-light/80"
        >
          Schließen
        </button>
      )}
    </motion.div>
  )
}
