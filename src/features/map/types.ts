import type { MapNode, MapEdge, MapData } from '@/lib/schemas/map'

export type { MapNode, MapEdge, MapData }

/** Node shape used internally by the ForceGraph simulation. */
export interface GraphNode {
  id: string
  type: MapNode['type']
  label: string
  size: number
  color: string | null
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
}

/** Edge shape used internally by the ForceGraph simulation. */
export interface GraphEdge {
  id: string
  source: string
  target: string
  label: string | null
  strength: number
}

/** Convert database MapNode to ForceGraph GraphNode. */
export function toGraphNode(node: MapNode): GraphNode {
  return {
    id: node.id,
    type: node.type,
    label: node.label,
    size: node.size,
    color: node.color,
    x: node.x ?? undefined,
    y: node.y ?? undefined,
    fx: node.x != null ? node.x : null,
    fy: node.y != null ? node.y : null,
  }
}

/** Convert database MapEdge to ForceGraph GraphEdge. */
export function toGraphEdge(edge: MapEdge): GraphEdge {
  return {
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
    label: edge.label,
    strength: edge.strength,
  }
}
