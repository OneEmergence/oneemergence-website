'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, type MapNodeType } from '@/lib/schemas/map'
import type { CreateNodeInput } from '@/lib/schemas/map'

interface CreateNodeDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateNodeInput) => void
}

const CREATABLE_TYPES: MapNodeType[] = ['theme', 'insight', 'practice', 'archetype']

export function CreateNodeDialog({ open, onClose, onSubmit }: CreateNodeDialogProps) {
  const [type, setType] = useState<MapNodeType>('insight')
  const [label, setLabel] = useState('')
  const [description, setDescription] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return

    onSubmit({
      type,
      label: label.trim(),
      description: description.trim() || undefined,
    })

    setLabel('')
    setDescription('')
    setType('insight')
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-oe-pure-light/5 bg-oe-deep-space p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg text-oe-pure-light">
                Neuer Knoten
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-oe-pure-light/40 hover:text-oe-pure-light/70"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="mb-2 block text-xs uppercase tracking-wider text-oe-pure-light/30">
                  Typ
                </label>
                <div className="flex gap-2">
                  {CREATABLE_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
                        type === t
                          ? 'bg-oe-pure-light/10 text-oe-pure-light'
                          : 'text-oe-pure-light/40 hover:text-oe-pure-light/60'
                      )}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: NODE_TYPE_COLORS[t] }}
                      />
                      {NODE_TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label
                  htmlFor="node-label"
                  className="mb-1.5 block text-xs uppercase tracking-wider text-oe-pure-light/30"
                >
                  Bezeichnung
                </label>
                <input
                  id="node-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="z.B. Innerer Frieden"
                  required
                  className="w-full rounded-lg border border-oe-pure-light/10 bg-oe-pure-light/[0.03] px-3 py-2 text-sm text-oe-pure-light placeholder-oe-pure-light/20 outline-none focus:border-oe-aurora-violet/30"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="node-description"
                  className="mb-1.5 block text-xs uppercase tracking-wider text-oe-pure-light/30"
                >
                  Beschreibung (optional)
                </label>
                <textarea
                  id="node-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Was bedeutet dieser Knoten für dich?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-oe-pure-light/10 bg-oe-pure-light/[0.03] px-3 py-2 text-sm text-oe-pure-light placeholder-oe-pure-light/20 outline-none focus:border-oe-aurora-violet/30"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!label.trim()}
                className={cn(
                  'w-full rounded-lg py-2.5 text-sm font-medium transition-colors',
                  label.trim()
                    ? 'bg-oe-aurora-violet/20 text-oe-aurora-violet hover:bg-oe-aurora-violet/30'
                    : 'cursor-not-allowed bg-oe-pure-light/5 text-oe-pure-light/20'
                )}
              >
                Knoten erstellen
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
