'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import { zoom as d3Zoom, type ZoomBehavior } from 'd3-zoom'
import { select } from 'd3-selection'
import { cn } from '@/lib/utils'
import { NODE_TYPE_COLORS } from '@/lib/schemas/map'
import type { MapNodeType } from '@/lib/schemas/map'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GraphNode extends SimulationNodeDatum {
  id: string
  type: MapNodeType
  label: string
  size: number
  color: string | null
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  id: string
  source: string
  target: string
  label: string | null
  strength: number
}

/** Resolved edge after the simulation replaces string ids with node refs. */
interface ResolvedEdge {
  id: string
  source: GraphNode
  target: GraphNode
  label: string | null
  strength: number
}

interface ForceGraphProps {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  onNodeSelect: (nodeId: string | null) => void
  onNodeDragEnd: (nodeId: string, x: number, y: number) => void
  className?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TICKS = 300
const CHARGE_STRENGTH = -80
const LINK_DISTANCE = 100
const NODE_SIZE_MULTIPLIER = 3
const GLOW_FILTER_ID = 'constellation-glow'
const GLOW_SELECTED_FILTER_ID = 'constellation-glow-selected'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function nodeColor(node: GraphNode): string {
  return node.color ?? NODE_TYPE_COLORS[node.type] ?? '#f0f0f0'
}

function nodeRadius(node: GraphNode): number {
  return 4 + node.size * 2
}

function isConnected(
  edge: ResolvedEdge,
  nodeId: string | null,
): boolean {
  if (!nodeId) return false
  return edge.source.id === nodeId || edge.target.id === nodeId
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ForceGraph({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodeDragEnd,
  className,
}: ForceGraphProps) {
  // ---- state for rendered positions ------------------------------------
  const [simNodes, setSimNodes] = useState<GraphNode[]>([])
  const [simEdges, setSimEdges] = useState<ResolvedEdge[]>([])
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 })

  // ---- refs ------------------------------------------------------------
  const simulationRef = useRef<Simulation<GraphNode, GraphEdge> | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sizeRef = useRef({ width: 800, height: 600 })

  // ---- drag state (ref to avoid re-renders during drag) ----------------
  const dragRef = useRef<{
    nodeId: string
    startX: number
    startY: number
    active: boolean
  } | null>(null)

  // ---- measure container -----------------------------------------------
  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        sizeRef.current = { width: rect.width, height: rect.height }
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  // ---- build / rebuild simulation when data changes --------------------
  useEffect(() => {
    // Deep-copy nodes so D3 can mutate them without touching props
    const simNodesCopy: GraphNode[] = nodes.map((n) => ({ ...n }))
    const simEdgesCopy: GraphEdge[] = edges.map((e) => ({ ...e }))

    const { width, height } = sizeRef.current

    const simulation = forceSimulation<GraphNode>(simNodesCopy)
      .force(
        'link',
        forceLink<GraphNode, GraphEdge>(simEdgesCopy)
          .id((d) => d.id)
          .distance(LINK_DISTANCE)
          .strength((d) => (d as GraphEdge).strength * 0.2),
      )
      .force('charge', forceManyBody<GraphNode>().strength(CHARGE_STRENGTH))
      .force('center', forceCenter(width / 2, height / 2))
      .force(
        'collide',
        forceCollide<GraphNode>().radius((d) => nodeRadius(d) * NODE_SIZE_MULTIPLIER),
      )

    let tickCount = 0

    simulation.on('tick', () => {
      tickCount++
      // Snapshot positions into React state
      setSimNodes([...simNodesCopy])
      setSimEdges(
        simEdgesCopy.map((e) => ({
          id: e.id,
          source: e.source as unknown as GraphNode,
          target: e.target as unknown as GraphNode,
          label: e.label,
          strength: e.strength,
        })),
      )
      if (tickCount >= MAX_TICKS) {
        simulation.stop()
      }
    })

    simulationRef.current = simulation

    return () => {
      simulation.stop()
      simulationRef.current = null
    }
    // We intentionally depend on serialized ids so the simulation only
    // rebuilds when the data actually changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(nodes.map((n) => n.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(edges.map((e) => e.id)),
  ])

  // ---- d3-zoom (only touches the transform state, not the DOM) ---------
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', (event) => {
        const t = event.transform as { x: number; y: number; k: number }
        setTransform({ x: t.x, y: t.y, k: t.k })
      })

    // d3-zoom needs d3-selection to attach — this is the one permitted
    // use of d3-selection: binding the zoom listener to the SVG element.
    select(svg).call(zoomBehavior)

    // Prevent the zoom handler from intercepting clicks
    select(svg).on('dblclick.zoom', null)

    zoomRef.current = zoomBehavior

    return () => {
      select(svg).on('.zoom', null)
    }
  }, [])

  // ---- drag handlers ---------------------------------------------------
  const handlePointerDown = useCallback(
    (nodeId: string, event: React.PointerEvent) => {
      event.stopPropagation()
      const target = event.currentTarget as SVGElement
      target.setPointerCapture(event.pointerId)

      const node = simNodes.find((n) => n.id === nodeId)
      if (!node) return

      dragRef.current = {
        nodeId,
        startX: event.clientX,
        startY: event.clientY,
        active: true,
      }

      // Fix the node in place so the simulation doesn't fight the drag
      if (simulationRef.current) {
        node.fx = node.x
        node.fy = node.y
        simulationRef.current.alphaTarget(0.3).restart()
      }
    },
    [simNodes],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current
      if (!drag?.active) return

      const node = simNodes.find((n) => n.id === drag.nodeId)
      if (!node) return

      const dx = (event.clientX - drag.startX) / transform.k
      const dy = (event.clientY - drag.startY) / transform.k

      node.fx = (node.fx ?? node.x ?? 0) + dx
      node.fy = (node.fy ?? node.y ?? 0) + dy
      drag.startX = event.clientX
      drag.startY = event.clientY

      // Force re-render
      setSimNodes((prev) => [...prev])
    },
    [simNodes, transform.k],
  )

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const drag = dragRef.current
      if (!drag?.active) return

      event.stopPropagation()
      dragRef.current = null

      const node = simNodes.find((n) => n.id === drag.nodeId)
      if (!node) return

      if (simulationRef.current) {
        simulationRef.current.alphaTarget(0)
      }

      // Keep the node pinned where the user left it
      onNodeDragEnd(node.id, node.fx ?? node.x ?? 0, node.fy ?? node.y ?? 0)
    },
    [simNodes, onNodeDragEnd],
  )

  // ---- click on background to deselect ---------------------------------
  const handleBackgroundClick = useCallback(() => {
    if (!dragRef.current) {
      onNodeSelect(null)
    }
  }, [onNodeSelect])

  // ---- render ----------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className={cn('relative h-full w-full overflow-hidden bg-oe-deep-space', className)}
    >
      <svg
        ref={svgRef}
        className="h-full w-full"
        style={{ touchAction: 'none' }}
        onClick={handleBackgroundClick}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* ---- Filters ---- */}
        <defs>
          <filter id={GLOW_FILTER_ID} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={GLOW_SELECTED_FILTER_ID} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ---- Transformed group (zoom / pan) ---- */}
        <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
          {/* ---- Edges ---- */}
          {simEdges.map((edge) => {
            const connected = isConnected(edge, selectedNodeId)
            return (
              <line
                key={edge.id}
                x1={edge.source.x ?? 0}
                y1={edge.source.y ?? 0}
                x2={edge.target.x ?? 0}
                y2={edge.target.y ?? 0}
                stroke={connected ? '#ffffff' : '#ffffff'}
                strokeOpacity={connected ? 0.6 : 0.12}
                strokeWidth={connected ? 1.5 : 0.5}
              />
            )
          })}

          {/* ---- Nodes ---- */}
          {simNodes.map((node) => {
            const r = nodeRadius(node)
            const color = nodeColor(node)
            const isSelected = node.id === selectedNodeId
            const filter = isSelected
              ? `url(#${GLOW_SELECTED_FILTER_ID})`
              : `url(#${GLOW_FILTER_ID})`

            return (
              <g
                key={node.id}
                transform={`translate(${node.x ?? 0},${node.y ?? 0})`}
                style={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onNodeSelect(node.id)
                }}
                onPointerDown={(e) => handlePointerDown(node.id, e)}
              >
                {/* Outer halo for selected state */}
                {isSelected && (
                  <circle
                    r={r + 6}
                    fill="none"
                    stroke={color}
                    strokeOpacity={0.25}
                    strokeWidth={2}
                  />
                )}

                {/* Main node circle */}
                <circle
                  r={r}
                  fill={color}
                  fillOpacity={isSelected ? 1 : 0.85}
                  filter={filter}
                />

                {/* Label */}
                <text
                  y={r + 14}
                  textAnchor="middle"
                  fill="#ffffff"
                  fillOpacity={isSelected ? 0.95 : 0.55}
                  fontSize={11}
                  fontFamily="Inter, sans-serif"
                  pointerEvents="none"
                  style={{ userSelect: 'none' }}
                >
                  {node.label}
                </text>
              </g>
            )
          })}
        </g>
      </svg>
    </div>
  )
}

export type { ForceGraphProps, GraphNode, GraphEdge }
