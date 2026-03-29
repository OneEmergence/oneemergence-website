'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { deleteSavedCard } from '@/lib/actions/guide'
import type { SavedCard } from '@/lib/schemas/guide'
import Link from 'next/link'

const typeColors: Record<string, string> = {
  reflection: 'border-oe-aurora-violet/30 bg-oe-aurora-violet/5',
  inquiry: 'border-oe-spirit-cyan/30 bg-oe-spirit-cyan/5',
  practice: 'border-oe-solar-gold/30 bg-oe-solar-gold/5',
  vision: 'border-oe-pure-light/30 bg-oe-pure-light/5',
}

const typeLabels: Record<string, string> = {
  reflection: 'Reflexion',
  inquiry: 'Erkundung',
  practice: 'Praxis',
  vision: 'Vision',
}

interface SavedCardsViewProps {
  cards: SavedCard[]
}

export function SavedCardsView({ cards: initialCards }: SavedCardsViewProps) {
  const [cards, setCards] = useState(initialCards)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDelete(id: string) {
    setDeleting(id)
    const result = await deleteSavedCard(id)
    if (result.success) {
      setCards((prev) => prev.filter((c) => c.id !== id))
    }
    setDeleting(null)
  }

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <BookOpen className="mb-4 h-10 w-10 text-oe-pure-light/20" />
        <p className="text-sm text-oe-pure-light/40">
          Noch keine Karten gespeichert.
        </p>
        <Link
          href="/inner/guide"
          className="mt-4 text-sm text-oe-aurora-violet/60 hover:text-oe-aurora-violet/80"
        >
          Zum Guide →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {cards.map((card) => (
          <motion.div
            key={card.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'rounded-xl border p-5',
              typeColors[card.type] ?? 'border-oe-pure-light/10'
            )}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-medium uppercase tracking-wider text-oe-pure-light/40">
                {typeLabels[card.type] ?? card.type}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-oe-pure-light/20">
                  {new Date(card.savedAt).toLocaleDateString('de-DE', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => handleDelete(card.id)}
                  disabled={deleting === card.id}
                  className="text-oe-pure-light/20 transition-colors hover:text-red-400/60 disabled:opacity-40"
                  title="Karte löschen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
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
        ))}
      </AnimatePresence>
    </div>
  )
}
