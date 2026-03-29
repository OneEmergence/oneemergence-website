import { z } from 'zod'

// =============================================================================
// Consciousness Map — Zod Schemas
// =============================================================================

export const MapNodeType = z.enum([
  'theme',
  'insight',
  'journal-entry',
  'practice',
  'archetype',
])
export type MapNodeType = z.infer<typeof MapNodeType>

export const MapNodeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: MapNodeType,
  label: z.string(),
  description: z.string().nullable(),
  sourceId: z.string().nullable(),
  sourceType: z.string().nullable(),
  color: z.string().nullable(),
  size: z.number().int().default(1),
  x: z.number().int().nullable(),
  y: z.number().int().nullable(),
  createdAt: z.date(),
})
export type MapNode = z.infer<typeof MapNodeSchema>

export const MapEdgeSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  label: z.string().nullable(),
  strength: z.number().int().default(1),
  createdAt: z.date(),
})
export type MapEdge = z.infer<typeof MapEdgeSchema>

export const CreateNodeInputSchema = z.object({
  type: MapNodeType,
  label: z.string().min(1, 'Label ist erforderlich'),
  description: z.string().optional(),
  sourceId: z.string().optional(),
  sourceType: z.string().optional(),
  color: z.string().optional(),
  size: z.number().int().min(1).max(10).optional(),
})
export type CreateNodeInput = z.infer<typeof CreateNodeInputSchema>

export const CreateEdgeInputSchema = z.object({
  sourceNodeId: z.string().uuid('Ungültige Quell-Knoten-ID'),
  targetNodeId: z.string().uuid('Ungültige Ziel-Knoten-ID'),
  label: z.string().optional(),
  strength: z.number().int().min(1).max(5).optional(),
})
export type CreateEdgeInput = z.infer<typeof CreateEdgeInputSchema>

export const UpdateNodeInputSchema = z.object({
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  size: z.number().int().min(1).max(10).optional(),
})
export type UpdateNodeInput = z.infer<typeof UpdateNodeInputSchema>

export const UpdateNodePositionSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
})

export const MapDataSchema = z.object({
  nodes: z.array(MapNodeSchema),
  edges: z.array(MapEdgeSchema),
})
export type MapData = z.infer<typeof MapDataSchema>

/** Brand color assignments per node type (constellation aesthetic) */
export const NODE_TYPE_COLORS: Record<MapNodeType, string> = {
  theme: '#9b5de5',       // aurora-violet
  insight: '#f5cb5c',     // solar-gold
  'journal-entry': '#5ce1e6', // spirit-cyan
  practice: '#6bcb77',    // soft green
  archetype: '#f0f0f0',   // pure-light
}

export const NODE_TYPE_LABELS: Record<MapNodeType, string> = {
  theme: 'Thema',
  insight: 'Einsicht',
  'journal-entry': 'Journal-Eintrag',
  practice: 'Praxis',
  archetype: 'Archetyp',
}
