'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { savePromptCard } from '@/lib/actions/guide'
import type { PromptCard } from '../types'

interface PromptCardDisplayProps {
  card: PromptCard
  conversationId?: string
}

const typeColors: Record<PromptCard['type'], string> = {
  reflection: 'border-oe-aurora-violet/30 bg-oe-aurora-violet/5',
  inquiry: 'border-oe-spirit-cyan/30 bg-oe-spirit-cyan/5',
  practice: 'border-oe-solar-gold/30 bg-oe-solar-gold/5',
  vision: 'border-oe-pure-light/30 bg-oe-pure-light/5',
}

const typeLabels: Record<PromptCard['type'], string> = {
  reflection: 'Reflexion',
  inquiry: 'Erkundung',
  practice: 'Praxis',
  vision: 'Vision',
}

export function PromptCardDisplay({ card, conversationId }: PromptCardDisplayProps) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (saved || saving) return
    setSaving(true)
    const result = await savePromptCard(card, conversationId)
    if (result.success) {
      setSaved(true)
    }
    setSaving(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border p-4',
        typeColors[card.type]
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-wider text-oe-pure-light/40">
          {typeLabels[card.type]}
        </span>
        <button
          onClick={handleSave}
          disabled={saved || saving}
          className="text-oe-pure-light/30 transition-colors hover:text-oe-pure-light/60 disabled:text-oe-solar-gold/60"
          title={saved ? 'Gespeichert' : 'Karte speichern'}
        >
          {saved ? (
            <BookmarkCheck className="h-4 w-4" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="font-serif text-lg leading-relaxed text-oe-pure-light/90">
        {card.question}
      </p>

      {card.context && (
        <p className="mt-2 text-sm text-oe-pure-light/40">
          {card.context}
        </p>
      )}
    </motion.div>
  )
}
