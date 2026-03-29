'use client'

import { motion } from 'framer-motion'
import { Clock, Dumbbell } from 'lucide-react'
import type { Exercise } from '../types'

interface ExerciseDisplayProps {
  exercise: Exercise
}

const typeLabels: Record<Exercise['type'], string> = {
  breathing: 'Atemübung',
  journaling: 'Journaling',
  embodiment: 'Verkörperung',
  meditation: 'Meditation',
  visualization: 'Visualisierung',
}

export function ExerciseDisplay({ exercise }: ExerciseDisplayProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-oe-solar-gold/20 bg-oe-solar-gold/5 p-4"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4 text-oe-solar-gold/60" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-oe-solar-gold/60">
            {typeLabels[exercise.type]}
          </span>
        </div>
        {exercise.duration && (
          <div className="flex items-center gap-1 text-oe-pure-light/30">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{exercise.duration} Min.</span>
          </div>
        )}
      </div>

      <h4 className="mb-3 font-serif text-lg text-oe-pure-light/90">
        {exercise.title}
      </h4>

      <ol className="space-y-2">
        {exercise.instructions.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-oe-pure-light/60">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-oe-solar-gold/10 text-[10px] text-oe-solar-gold/80">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}
