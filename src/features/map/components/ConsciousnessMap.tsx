'use client'

import { useCallback, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ForceGraph } from './ForceGraph'
import { NodeDetailPanel } from './NodeDetailPanel'
import { MapToolbar } from './MapToolbar'
import { CreateNodeDialog } from './CreateNodeDialog'
import { toGraphNode, toGraphEdge } from '../types'
import {
  createNode,
  createEdge,
  deleteNode,
  updateNodePosition,
} from '../actions'
import type { MapNode, MapEdge, MapData } from '@/lib/schemas/map'
import type { CreateNodeInput } from '@/lib/schemas/map'
import type { MapNodeType } from '@/lib/schemas/map'

interface ConsciousnessMapProps {
  initialData: MapData
}

export function ConsciousnessMap({ initialData }: ConsciousnessMapProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ---- data state -------------------------------------------------------
  const [nodes, setNodes] = useState<MapNode[]>(initialData.nodes)
  const [edges, setEdges] = useState<MapEdge[]>(initialData.edges)

  // ---- UI state ---------------------------------------------------------
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [connectionMode, setConnectionMode] = useState(false)
  const [connectionSource, setConnectionSource] = useState<string | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [visibleTypes, setVisibleTypes] = useState<Set<MapNodeType>>(
    new Set(['theme', 'insight', 'journal-entry', 'practice', 'archetype'])
  )

  // ---- derived data -----------------------------------------------------
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  )

  const connectedNodes = useMemo(() => {
    if (!selectedNodeId) return []
    const connectedIds = new Set<string>()
    for (const edge of edges) {
      if (edge.sourceNodeId === selectedNodeId) connectedIds.add(edge.targetNodeId)
      if (edge.targetNodeId === selectedNodeId) connectedIds.add(edge.sourceNodeId)
    }
    return nodes.filter((n) => connectedIds.has(n.id))
  }, [nodes, edges, selectedNodeId])

  const filteredNodes = useMemo(
    () => nodes.filter((n) => visibleTypes.has(n.type)),
    [nodes, visibleTypes]
  )

  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map((n) => n.id))
    return edges.filter(
      (e) => visibleNodeIds.has(e.sourceNodeId) && visibleNodeIds.has(e.targetNodeId)
    )
  }, [edges, filteredNodes])

  const graphNodes = useMemo(() => filteredNodes.map(toGraphNode), [filteredNodes])
  const graphEdges = useMemo(() => filteredEdges.map(toGraphEdge), [filteredEdges])

  // ---- handlers ---------------------------------------------------------
  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      if (connectionMode && nodeId) {
        if (!connectionSource) {
          setConnectionSource(nodeId)
          return
        }
        if (connectionSource !== nodeId) {
          startTransition(async () => {
            const result = await createEdge({
              sourceNodeId: connectionSource,
              targetNodeId: nodeId,
            })
            if (result.success) {
              setEdges((prev) => [result.data, ...prev])
            }
            setConnectionSource(null)
            setConnectionMode(false)
          })
          return
        }
        setConnectionSource(null)
        return
      }
      setSelectedNodeId(nodeId)
    },
    [connectionMode, connectionSource]
  )

  const handleNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    const roundedX = Math.round(x)
    const roundedY = Math.round(y)
    startTransition(async () => {
      await updateNodePosition(nodeId, roundedX, roundedY)
    })
  }, [])

  const handleCreateNode = useCallback(
    (data: CreateNodeInput) => {
      startTransition(async () => {
        const result = await createNode(data)
        if (result.success) {
          setNodes((prev) => [result.data, ...prev])
        }
      })
    },
    []
  )

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      startTransition(async () => {
        const result = await deleteNode(nodeId)
        if (result.success) {
          setNodes((prev) => prev.filter((n) => n.id !== nodeId))
          setEdges((prev) =>
            prev.filter((e) => e.sourceNodeId !== nodeId && e.targetNodeId !== nodeId)
          )
          setSelectedNodeId(null)
        }
      })
    },
    []
  )

  const handleToggleType = useCallback((type: MapNodeType) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
      } else {
        next.add(type)
      }
      return next
    })
  }, [])

  const handleNavigateToSource = useCallback(
    (sourceId: string, sourceType: string) => {
      if (sourceType === 'journal-entry') {
        router.push(`/inner/journal/${sourceId}`)
      }
    },
    [router]
  )

  const handleRecenter = useCallback(() => {
    // Force re-mount of the ForceGraph by toggling a key
    // This is a pragmatic approach — the graph will re-center
    setNodes((prev) => [...prev])
  }, [])

  // ---- render -----------------------------------------------------------
  return (
    <div className="relative h-full w-full">
      {/* Connection mode indicator */}
      {connectionMode && (
        <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2 rounded-full border border-oe-aurora-violet/30 bg-oe-deep-space/90 px-4 py-1.5 text-xs text-oe-aurora-violet backdrop-blur-sm">
          {connectionSource
            ? 'Wähle den zweiten Knoten'
            : 'Wähle den ersten Knoten'}
        </div>
      )}

      {/* Loading indicator */}
      {isPending && (
        <div className="absolute right-4 top-4 z-20 rounded-full bg-oe-deep-space/80 px-3 py-1 text-xs text-oe-pure-light/40">
          Speichern…
        </div>
      )}

      {/* Toolbar */}
      <MapToolbar
        connectionMode={connectionMode}
        onToggleConnectionMode={() => {
          setConnectionMode((prev) => !prev)
          setConnectionSource(null)
        }}
        onAddNode={() => setCreateDialogOpen(true)}
        onRecenter={handleRecenter}
        visibleTypes={visibleTypes}
        onToggleType={handleToggleType}
        filterOpen={filterOpen}
        onToggleFilter={() => setFilterOpen((prev) => !prev)}
      />

      {/* Force graph */}
      <ForceGraph
        nodes={graphNodes}
        edges={graphEdges}
        selectedNodeId={selectedNodeId}
        onNodeSelect={handleNodeSelect}
        onNodeDragEnd={handleNodeDragEnd}
      />

      {/* Detail panel */}
      <NodeDetailPanel
        node={selectedNode}
        connectedNodes={connectedNodes}
        onClose={() => setSelectedNodeId(null)}
        onDelete={handleDeleteNode}
        onNavigateToSource={handleNavigateToSource}
      />

      {/* Create node dialog */}
      <CreateNodeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateNode}
      />

      {/* Empty state */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-xs text-center">
            <p className="font-serif text-lg text-oe-pure-light/60">
              Deine Konstellation
            </p>
            <p className="mt-2 text-sm text-oe-pure-light/30">
              Schreibe Journal-Einträge, um Themen zu entdecken, oder erstelle
              manuell Knoten für Einsichten und Themen.
            </p>
            <button
              onClick={() => setCreateDialogOpen(true)}
              className="mt-4 rounded-lg bg-oe-aurora-violet/15 px-4 py-2 text-sm text-oe-aurora-violet transition-colors hover:bg-oe-aurora-violet/25"
            >
              Ersten Knoten erstellen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
