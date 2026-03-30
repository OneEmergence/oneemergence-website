'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface CreateEdgeDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (label?: string) => void
  sourceLabel: string
  targetLabel: string
}

export function CreateEdgeDialog({
  open,
  onClose,
  onSubmit,
  sourceLabel,
  targetLabel,
}: CreateEdgeDialogProps) {
  const [label, setLabel] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(label.trim() || undefined)
    setLabel('')
    onClose()
  }

  function handleClose() {
    setLabel('')
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
            onClick={handleClose}
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
                Verbindung erstellen
              </h2>
              <button
                onClick={handleClose}
                className="rounded-full p-1 text-oe-pure-light/40 hover:text-oe-pure-light/70"
                aria-label="Schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Node labels */}
            <div className="mt-4 flex items-center gap-2">
              <span className="rounded-md border border-oe-aurora-violet/20 bg-oe-aurora-violet/10 px-2 py-0.5 text-xs text-oe-aurora-violet">
                {sourceLabel}
              </span>
              <span className="text-xs text-oe-pure-light/30">→</span>
              <span className="rounded-md border border-oe-spirit-cyan/20 bg-oe-spirit-cyan/10 px-2 py-0.5 text-xs text-oe-spirit-cyan">
                {targetLabel}
              </span>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Label */}
              <div>
                <label
                  htmlFor="edge-label"
                  className="mb-1.5 block text-xs uppercase tracking-wider text-oe-pure-light/30"
                >
                  Bezeichnung (optional)
                </label>
                <input
                  id="edge-label"
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Warum sind diese verbunden?"
                  className="w-full rounded-lg border border-oe-pure-light/10 bg-oe-pure-light/[0.03] px-3 py-2 text-sm text-oe-pure-light placeholder-oe-pure-light/20 outline-none focus:border-oe-aurora-violet/30"
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-sm text-oe-pure-light/40 hover:text-oe-pure-light/70"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-oe-aurora-violet/20 px-4 py-2 text-sm font-medium text-oe-aurora-violet transition-colors hover:bg-oe-aurora-violet/30"
                >
                  Verbinden
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
