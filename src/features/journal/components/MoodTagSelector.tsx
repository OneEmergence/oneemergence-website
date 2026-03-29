'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { MOOD_TAGS } from '../types'

interface MoodTagSelectorProps {
  selectedTags: string[]
  onChange: (tags: string[]) => void
}

export function MoodTagSelector({ selectedTags, onChange }: MoodTagSelectorProps) {
  function toggleTag(value: string) {
    if (selectedTags.includes(value)) {
      onChange(selectedTags.filter((t) => t !== value))
    } else {
      onChange([...selectedTags, value])
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-oe-pure-light/70">
        Stimmung
      </label>
      <div className="flex flex-wrap gap-2">
        {MOOD_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.value)
          return (
            <motion.button
              key={tag.value}
              type="button"
              whileTap={{ scale: 0.95 }}
              animate={{ scale: isSelected ? 1.05 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={() => toggleTag(tag.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm transition-colors',
                'border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet',
                isSelected
                  ? 'border-oe-aurora-violet bg-oe-aurora-violet/20 text-oe-aurora-violet'
                  : 'bg-white/5 text-oe-pure-light/60 hover:bg-white/10 hover:text-oe-pure-light'
              )}
            >
              {tag.label}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
