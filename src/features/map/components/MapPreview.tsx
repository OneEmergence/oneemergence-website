'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import { NODE_TYPE_COLORS } from '@/lib/schemas/map'
import type { MapNode, MapEdge } from '@/lib/schemas/map'

interface MapPreviewProps {
  nodes: MapNode[]
  edges: MapEdge[]
}

/**
 * Non-interactive miniature preview of the consciousness map.
 * Renders a simplified static view for the dashboard.
 */
export function MapPreview({ nodes, edges }: MapPreviewProps) {
  // Simple grid layout for preview (no force simulation needed)
  const previewNodes = useMemo(() => {
    const slice = nodes.slice(0, 12) // Show at most 12 nodes
    const cols = Math.ceil(Math.sqrt(slice.length))
    return slice.map((node, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const jitterX = (Math.sin(i * 7.3) * 15)
      const jitterY = (Math.cos(i * 5.1) * 15)
      return {
        ...node,
        px: 30 + col * 40 + jitterX,
        py: 25 + row * 40 + jitterY,
      }
    })
  }, [nodes])

  const previewEdges = useMemo(() => {
    const nodePositions: Record<string, { x: number; y: number }> = {}
    for (const n of previewNodes) {
      nodePositions[n.id] = { x: n.px, y: n.py }
    }
    return edges
      .filter(
        (e) => e.sourceNodeId in nodePositions && e.targetNodeId in nodePositions
      )
      .map((e) => ({
        id: e.id,
        source: nodePositions[e.sourceNodeId],
        target: nodePositions[e.targetNodeId],
      }))
  }, [edges, previewNodes])

  if (nodes.length === 0) {
    return (
      <Link
        href="/inner/map"
        className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-oe-pure-light/5 p-5 transition-all hover:border-oe-pure-light/10 hover:bg-oe-pure-light/[0.02]"
      >
        <Map className="h-5 w-5 text-oe-aurora-violet/40" />
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-oe-pure-light/30">
            Bewusstseinskarte
          </p>
          <p className="mt-1 text-sm text-oe-pure-light/50">
            Deine persönliche Konstellation wartet.
          </p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href="/inner/map"
      className="group block rounded-xl border border-oe-pure-light/5 p-4 transition-all hover:border-oe-pure-light/10 hover:bg-oe-pure-light/[0.02]"
    >
      <p className="mb-3 text-xs uppercase tracking-widest text-oe-pure-light/30">
        Bewusstseinskarte
      </p>

      {/* Mini SVG constellation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <svg
          viewBox="0 0 200 150"
          className="h-24 w-full"
          aria-label={`Bewusstseinskarte mit ${nodes.length} Knoten`}
        >
          {/* Edges */}
          {previewEdges.map((edge) => (
            <line
              key={edge.id}
              x1={edge.source.x}
              y1={edge.source.y}
              x2={edge.target.x}
              y2={edge.target.y}
              stroke="#ffffff"
              strokeOpacity={0.08}
              strokeWidth={0.5}
            />
          ))}

          {/* Nodes */}
          {previewNodes.map((node) => {
            const color = node.color ?? NODE_TYPE_COLORS[node.type] ?? '#f0f0f0'
            return (
              <circle
                key={node.id}
                cx={node.px}
                cy={node.py}
                r={2 + node.size}
                fill={color}
                fillOpacity={0.7}
              />
            )
          })}
        </svg>
      </motion.div>

      <p className="mt-2 text-xs text-oe-pure-light/40">
        {nodes.length} Knoten · {edges.length} Verbindungen
      </p>
    </Link>
  )
}
