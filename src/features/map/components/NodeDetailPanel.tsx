'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Link2, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS } from '@/lib/schemas/map'
import type { MapNode } from '@/lib/schemas/map'

interface NodeDetailPanelProps {
  node: MapNode | null
  connectedNodes: MapNode[]
  onClose: () => void
  onDelete: (nodeId: string) => void
  onNavigateToSource: (sourceId: string, sourceType: string) => void
}

export function NodeDetailPanel({
  node,
  connectedNodes,
  onClose,
  onDelete,
  onNavigateToSource,
}: NodeDetailPanelProps) {
  if (!node) return null

  const color = node.color ?? NODE_TYPE_COLORS[node.type] ?? '#f0f0f0'
  const typeLabel = NODE_TYPE_LABELS[node.type] ?? node.type

  return (
    <AnimatePresence>
      <motion.aside
        key={node.id}
        initial={{ x: 320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 320, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-0 top-0 z-20 flex h-full w-80 flex-col border-l border-oe-pure-light/5 bg-oe-deep-space/95 backdrop-blur-sm"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-oe-pure-light/5 px-5 py-4">
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs uppercase tracking-wider text-oe-pure-light/40">
              {typeLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-oe-pure-light/40 transition-colors hover:bg-oe-pure-light/5 hover:text-oe-pure-light/70"
            aria-label="Panel schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <h2 className="font-serif text-lg text-oe-pure-light">{node.label}</h2>

          {node.description && (
            <p className="mt-3 text-sm leading-relaxed text-oe-pure-light/60">
              {node.description}
            </p>
          )}

          {/* Metadata */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-xs text-oe-pure-light/30">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {node.createdAt.toLocaleDateString('de-DE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-oe-pure-light/30">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: color + '20', color }}>
                {node.size}
              </span>
              <span>Gewicht</span>
            </div>
          </div>

          {/* Source link */}
          {node.sourceId && node.sourceType && (
            <button
              onClick={() => onNavigateToSource(node.sourceId!, node.sourceType!)}
              className="mt-4 flex items-center gap-2 rounded-lg border border-oe-pure-light/5 px-3 py-2 text-xs text-oe-spirit-cyan/70 transition-colors hover:bg-oe-pure-light/5"
            >
              <Link2 className="h-3.5 w-3.5" />
              Quelle anzeigen
            </button>
          )}

          {/* Connected nodes */}
          {connectedNodes.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-oe-pure-light/30">
                Verbunden mit
              </p>
              <div className="mt-2 space-y-1.5">
                {connectedNodes.map((connected) => {
                  const connColor = connected.color ?? NODE_TYPE_COLORS[connected.type] ?? '#f0f0f0'
                  return (
                    <div
                      key={connected.id}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-oe-pure-light/60"
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: connColor }}
                      />
                      {connected.label}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-oe-pure-light/5 px-5 py-3">
          <button
            onClick={() => onDelete(node.id)}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs',
              'text-red-400/60 transition-colors hover:bg-red-400/5 hover:text-red-400/80'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Knoten löschen
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
