'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditNodeDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { label: string; description?: string }) => void
  initialLabel: string
  initialDescription: string
}

export function EditNodeDialog({
  open,
  onClose,
  onSubmit,
  initialLabel,
  initialDescription,
}: EditNodeDialogProps) {
  const [label, setLabel] = useState(initialLabel)
  const [description, setDescription] = useState(initialDescription)

  useEffect(() => {
    if (open) {
      setLabel(initialLabel)
      setDescription(initialDescription)
    }
  }, [open, initialLabel, initialDescription])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!label.trim()) return

    onSubmit({
      label: label.trim(),
      description: description.trim() || undefined,
    })

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
                Knoten bearbeiten
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
              {/* Label */}
              <div>
                <label
                  htmlFor="edit-node-label"
                  className="mb-1.5 block text-xs uppercase tracking-wider text-oe-pure-light/30"
                >
                  Bezeichnung
                </label>
                <input
                  id="edit-node-label"
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
                  htmlFor="edit-node-description"
                  className="mb-1.5 block text-xs uppercase tracking-wider text-oe-pure-light/30"
                >
                  Beschreibung (optional)
                </label>
                <textarea
                  id="edit-node-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Was bedeutet dieser Knoten für dich?"
                  rows={3}
                  className="w-full resize-none rounded-lg border border-oe-pure-light/10 bg-oe-pure-light/[0.03] px-3 py-2 text-sm text-oe-pure-light placeholder-oe-pure-light/20 outline-none focus:border-oe-aurora-violet/30"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm text-oe-pure-light/40 hover:text-oe-pure-light/70"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={!label.trim()}
                  className={cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    label.trim()
                      ? 'bg-oe-aurora-violet/20 text-oe-aurora-violet hover:bg-oe-aurora-violet/30'
                      : 'cursor-not-allowed bg-oe-pure-light/5 text-oe-pure-light/20'
                  )}
                >
                  Änderungen speichern
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
