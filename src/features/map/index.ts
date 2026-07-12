export { ConsciousnessMap } from './components/ConsciousnessMap'
export { MapPreview } from './components/MapPreview'
export { ForceGraph } from './components/ForceGraph'
export { EditNodeDialog } from './components/EditNodeDialog'
export { CreateEdgeDialog } from './components/CreateEdgeDialog'
export { extractThemes, THEME_VOCABULARY, MAX_THEMES_PER_ENTRY } from './extract-themes'
export { toGraphNode, toGraphEdge } from './types'
export type { GraphNode, GraphEdge } from './types'

// Schemas (feature public contract)
export type { MapNode, MapEdge, MapData, CreateNodeInput, CreateEdgeInput } from './schemas'
export {
  MapNodeType,
  NODE_TYPE_COLORS,
  NODE_TYPE_LABELS,
  CreateNodeInputSchema,
  CreateEdgeInputSchema,
} from './schemas'
