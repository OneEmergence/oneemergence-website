'use client'

import { motion } from 'framer-motion'
import { Plus, Link2, Maximize, Filter, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NODE_TYPE_COLORS, NODE_TYPE_LABELS, type MapNodeType } from '@/lib/schemas/map'

interface MapToolbarProps {
  connectionMode: boolean
  onToggleConnectionMode: () => void
  onAddNode: () => void
  onRecenter: () => void
  visibleTypes: Set<MapNodeType>
  onToggleType: (type: MapNodeType) => void
  filterOpen: boolean
  onToggleFilter: () => void
}

const ALL_NODE_TYPES: MapNodeType[] = [
  'theme',
  'insight',
  'journal-entry',
  'practice',
  'archetype',
]

export function MapToolbar({
  connectionMode,
  onToggleConnectionMode,
  onAddNode,
  onRecenter,
  visibleTypes,
  onToggleType,
  filterOpen,
  onToggleFilter,
}: MapToolbarProps) {
  return (
    <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
      {/* Primary actions */}
      <div className="flex flex-col gap-1.5 rounded-xl border border-oe-pure-light/5 bg-oe-deep-space/90 p-1.5 backdrop-blur-sm">
        <ToolbarButton
          icon={Plus}
          label="Knoten hinzufügen"
          onClick={onAddNode}
        />
        <ToolbarButton
          icon={Link2}
          label="Verbindungsmodus"
          onClick={onToggleConnectionMode}
          active={connectionMode}
        />
        <ToolbarButton
          icon={Maximize}
          label="Ansicht zentrieren"
          onClick={onRecenter}
        />
        <ToolbarButton
          icon={Filter}
          label="Filtern"
          onClick={onToggleFilter}
          active={filterOpen}
        />
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-oe-pure-light/5 bg-oe-deep-space/90 p-3 backdrop-blur-sm"
        >
          <p className="mb-2 text-[10px] uppercase tracking-widest text-oe-pure-light/30">
            Knotentypen
          </p>
          <div className="space-y-1">
            {ALL_NODE_TYPES.map((type) => {
              const visible = visibleTypes.has(type)
              const color = NODE_TYPE_COLORS[type]
              return (
                <button
                  key={type}
                  onClick={() => onToggleType(type)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors',
                    visible
                      ? 'text-oe-pure-light/70'
                      : 'text-oe-pure-light/25'
                  )}
                >
                  {visible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: color,
                      opacity: visible ? 1 : 0.3,
                    }}
                  />
                  {NODE_TYPE_LABELS[type]}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center rounded-lg p-2 transition-colors',
        active
          ? 'bg-oe-aurora-violet/20 text-oe-aurora-violet'
          : 'text-oe-pure-light/40 hover:bg-oe-pure-light/5 hover:text-oe-pure-light/70'
      )}
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}
