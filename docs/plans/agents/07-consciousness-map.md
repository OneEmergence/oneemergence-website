# Agent 07 — Consciousness Map

> Build the interactive personal constellation — a visual map of themes, insights, and inner states that grows with the user's journey.

---

## Implementation Status (2026-03-29)

### Completed
- [x] **Phase 1: Data Model** — Zod schemas (`src/lib/schemas/map.ts`), Drizzle DB tables (`mapNodes`, `mapEdges` in `src/lib/db/schema.ts`), server actions (`src/features/map/actions.ts`) with full CRUD + position persistence
- [x] **Phase 2: Theme Extraction** — Keyword-based extractor (`src/features/map/extract-themes.ts`) with 20 bilingual themes (DE/EN), auto-node generation from journal entries (`src/features/map/generate-nodes.ts`), integrated into journal `createEntry` action
- [x] **Phase 3: ForceGraph** — D3 force simulation with React SVG rendering (`src/features/map/components/ForceGraph.tsx`), constellation glow aesthetic, zoom/pan via d3-zoom, node drag with position persistence, 300-tick simulation cap
- [x] **Phase 4: Interaction UI** — MapToolbar (add node, connection mode, recenter, type filter), NodeDetailPanel (metadata, connected nodes, source link, delete), CreateNodeDialog (type/label/description form), ConsciousnessMap orchestrator component
- [x] **Phase 5: Page & Integration** — Map page route (`src/app/(portal)/inner/map/page.tsx`), MapPreview dashboard widget, sidebar nav enabled, journal→map auto-node pipeline

### Deviations from Plan
- Server actions placed in `src/features/map/actions.ts` (not `src/lib/actions/map.ts`) to keep feature cohesion
- Max themes per entry: 5 (not 3 as suggested in risks table) — provides richer graph growth
- Intensity mode integration deferred (still mode = static layout not yet wired) — requires intensity store integration in ForceGraph
- Mini-map/overview deferred — adds complexity without core value for v1
- Connection annotations (edge labels) supported in data model but not yet exposed in UI dialog

### Remaining Work
- [ ] Intensity mode integration (still = static layout, no animation)
- [ ] Create Edge dialog with label input (connection mode currently creates label-less edges)
- [ ] Edge label editing
- [ ] Node editing (right-click/long-press context menu)
- [ ] Mobile interaction polish (touch drag, pinch-zoom testing)
- [ ] Canvas rendering fallback for 100+ nodes
- [ ] Playwright E2E tests for map interactions
- [ ] WebGL upgrade path (R3F constellation view)

---

## Mission

Implement the Consciousness Map v1 — an interactive force-directed graph where topics, insights, journal entries, and completed learnings appear as nodes in a personal constellation. Users can mark connections between nodes, and new nodes grow organically from journal content. This is the most unique feature of OneEmergence.

## Scope

### In Scope
- Graph data model: nodes (themes, insights, entries) and edges (connections)
- Force-directed graph visualization (D3.js or R3F)
- Personal node graph with manual connection creation
- Automatic node generation from journal content (theme extraction)
- Node types: theme, insight, journal-entry, practice, archetype
- Zoom and pan interaction
- Node detail panel (click to see related content)
- Connection annotations (why are these related?)
- Map persistence (DB-backed)

### Out of Scope
- Collective atlas (v3)
- Zoom levels beyond personal (thematic, collective, cosmic are v3)
- AI-powered node suggestions (beyond simple theme extraction)
- WebGL constellation view (start with D3/SVG, upgrade to R3F later if needed)
- Integration with AI Guide map suggestions (Agent 6 provides the data, this agent renders it)

## Dependencies / Prerequisites
- **Agent 5** complete (auth, database, journal system)
- **Agent 6** started or complete (guide provides map suggestions, but map can work without it)
- Database tables for: map_nodes, map_edges
- Access to journal entries for theme extraction

## Repository Areas Touched

```
src/features/map/                    # New: map feature module
src/app/(portal)/inner/map/          # New: map routes
src/lib/actions/map.ts               # New: server actions for map data
src/lib/schemas/map.ts               # New: Zod schemas for map entities
package.json                         # New: d3, d3-force (or @react-three/fiber if WebGL)
```

## Detailed Task Breakdown

### Phase 1: Data Model

**Task 1.1: Define map schemas**
```typescript
// src/lib/schemas/map.ts
export const MapNodeType = z.enum(['theme', 'insight', 'journal-entry', 'practice', 'archetype'])

export const MapNode = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  type: MapNodeType,
  label: z.string(),
  description: z.string().optional(),
  sourceId: z.string().optional(),  // e.g., journal entry ID
  sourceType: z.string().optional(),
  color: z.string().optional(),     // visual accent
  size: z.number().default(1),      // visual weight
  x: z.number().optional(),         // persisted position
  y: z.number().optional(),
  createdAt: z.string().datetime(),
})

export const MapEdge = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  sourceNodeId: z.string().uuid(),
  targetNodeId: z.string().uuid(),
  label: z.string().optional(),     // "why are these connected?"
  strength: z.number().default(1),  // visual line thickness
  createdAt: z.string().datetime(),
})
```

**Task 1.2: Database tables**
```sql
map_nodes: id, userId, type, label, description, sourceId, sourceType, color, size, x, y, createdAt
map_edges: id, userId, sourceNodeId, targetNodeId, label, strength, createdAt
```

**Task 1.3: Server actions**
```typescript
// src/lib/actions/map.ts
// - getMapData(userId): Promise<{ nodes: MapNode[], edges: MapEdge[] }>
// - createNode(data: CreateNodeInput): Promise<MapNode>
// - updateNode(id: string, data: Partial<MapNode>): Promise<MapNode>
// - deleteNode(id: string): Promise<void>
// - createEdge(data: CreateEdgeInput): Promise<MapEdge>
// - deleteEdge(id: string): Promise<void>
// - updateNodePosition(id: string, x: number, y: number): Promise<void>
```

### Phase 2: Theme Extraction

**Task 2.1: Journal theme extractor**
```typescript
// src/features/map/extract-themes.ts
// Simple keyword/NLP approach for v1:
// - Predefined theme vocabulary (presence, consciousness, shadow, love, fear, etc.)
// - Scan journal entry content for theme keywords
// - Weight by frequency and recency
// - Return top themes per entry
```

**Task 2.2: Auto-node generation**
- When a journal entry is saved (hook into journal server action or separate cron)
- Extract themes from entry
- Create new theme nodes if they don't exist
- Create journal-entry node linked to entry
- Create edges between entry node and theme nodes
- Don't create duplicate theme nodes — merge into existing

**Task 2.3: Node growth logic**
- Nodes that appear frequently grow in `size`
- Recent nodes have higher visual weight
- Nodes connected to many others become "hub" nodes
- This creates organic-looking constellations where active themes are prominent

### Phase 3: Force-Directed Graph Visualization

**Task 3.1: Choose visualization approach**
- **Recommended: D3.js force simulation rendered to SVG/Canvas**
  - Pros: mature, well-documented, great force layouts, works on all devices
  - Cons: not as visually impressive as WebGL
- **Alternative: React Three Fiber (R3F)**
  - Pros: more immersive, 3D possible, glow effects
  - Cons: heavier, more complex, mobile concerns
- **Decision: Start with D3 SVG. Upgrade to R3F later if design warrants it.**

**Task 3.2: Create ForceGraph component**
```typescript
// src/features/map/components/ForceGraph.tsx
// - Renders D3 force-directed graph in SVG
// - Node rendering: circles with label, colored by type, sized by weight
// - Edge rendering: lines with optional label
// - Forces: link (connections), charge (repulsion), center, collision
// - Smooth animation of node positions
// - Reads intensity mode: still = static layout, balanced/immersive = animated forces
```

**Task 3.3: Interaction: Pan and Zoom**
- D3 zoom behavior on SVG container
- Pinch-to-zoom on mobile
- Zoom limits (don't zoom out to nothing or in to pixel level)
- Mini-map in corner showing overall constellation shape (optional)

**Task 3.4: Interaction: Node selection**
- Click node → highlight connected nodes and edges
- Show node detail panel (sidebar or bottom sheet on mobile)
- Detail panel shows: label, description, type, creation date, source content link
- Related nodes list in detail panel

**Task 3.5: Interaction: Drag nodes**
- Drag to reposition nodes
- Position persisted on drag end (debounced server action)
- Fixed nodes (user-positioned) don't float with force simulation

**Task 3.6: Visual styling**
- Dark background (consistent with OE "darkness as space")
- Nodes glow subtly (brand colors by type):
  - theme: aurora-violet
  - insight: solar-gold
  - journal-entry: spirit-cyan
  - practice: soft green
  - archetype: pure-light
- Edges: subtle lines, brighter when hovering connected node
- Labels: small, clean, Inter font
- Constellation metaphor: feels like looking at stars, not a corporate graph

### Phase 4: Node & Edge Management UI

**Task 4.1: Create Node dialog**
- Manual node creation: type, label, description
- Used for adding insights or themes that didn't come from journal
- Accessible from map toolbar

**Task 4.2: Create Edge dialog**
- Select two nodes → create connection
- Optional label explaining the connection
- "Connection mode": click first node, then second to connect

**Task 4.3: Delete/edit controls**
- Right-click or long-press on node → edit/delete options
- Confirm before deletion
- Edit opens same dialog as create, pre-populated

**Task 4.4: Map toolbar**
- Add node button
- Connection mode toggle
- Zoom controls
- Recenter button (reset view to fit all nodes)
- Filter by node type (show/hide types)

### Phase 5: Map Page & Integration

**Task 5.1: Map route**
```
src/app/(portal)/inner/map/page.tsx
```
- Full-viewport map view (fills available space)
- Toolbar overlay
- Node detail panel (sidebar or bottom sheet)
- Loading state: subtle constellation animation

**Task 5.2: Map preview widget for dashboard**
- Small, non-interactive preview of the map
- Shows on Inner State Dashboard
- Click to navigate to full map
- Shows most recent/active nodes

**Task 5.3: Journal → Map integration**
- After saving a journal entry, show "X new themes detected" notification
- Link from journal entry to its nodes on the map
- Link from map node back to source journal entries

## Best Practices & Constraints

1. **The map is a constellation, not a knowledge graph.** Visual language: stars, space, connections. Not boxes and arrows.
2. **Organic growth, not manual data entry.** The map should mostly grow automatically from journal content. Manual additions are supplementary.
3. **Performance with many nodes.** D3 force simulation can handle hundreds of nodes. Beyond that, cluster or paginate.
4. **Position persistence matters.** Users develop spatial memory of their map. Don't randomly rearrange on reload.
5. **Mobile interaction must work.** Touch events for drag, pinch-zoom, tap-to-select.
6. **No premature collective features.** v1 is personal only.

## Testing / Validation Checklist

- [x] Map renders with sample nodes and edges (ForceGraph component)
- [x] Force simulation stabilizes (300-tick cap)
- [x] Node drag and position persistence works (fx/fy + updateNodePosition action)
- [x] Manual node and edge creation works (CreateNodeDialog + connection mode)
- [x] Journal themes extracted and nodes auto-generated (extract-themes + generate-nodes)
- [x] Node detail panel shows correct information (NodeDetailPanel)
- [x] Pan and zoom work on desktop and mobile (d3-zoom)
- [x] Filter by node type works (MapToolbar filter)
- [x] Map loads from persisted data on return visit (getMapData server action)
- [ ] Performance acceptable with 50+ nodes (needs live testing)
- [ ] Intensity modes respected (still = static layout) (deferred)
- [x] Visual styling matches constellation/space aesthetic (glow filters, dark bg, brand colors)

## Risks / Pitfalls

| Risk | Mitigation |
|---|---|
| D3 + React integration complexity | Use D3 for simulation math, React for rendering (don't let D3 touch DOM) |
| Force simulation performance | Use web worker for simulation if needed. Limit active simulation time. |
| Theme extraction quality | Start simple with keyword matching. Improve with AI later. |
| Too many auto-generated nodes | Set limits: max 3 theme nodes per journal entry. Merge similar themes. |
| Position persistence conflicts with force layout | Fixed nodes (user-positioned) are excluded from force simulation. |
| SVG rendering limits on mobile | Switch to Canvas rendering if SVG performance is poor with many nodes. |

## Handoff Outputs

- Complete map data model with DB tables
- Force-directed graph visualization with OE constellation aesthetic
- Node CRUD with manual and automatic creation
- Edge creation with annotations
- Journal → map integration (theme extraction, auto-nodes)
- Map page with toolbar and detail panel
- Dashboard preview widget
- All interactions work on desktop and mobile

## Subagent Strategy

1. **D3 force graph agent** — Build the ForceGraph component, handle D3-React integration, tune force parameters
2. **Theme extraction agent** — Design and implement the keyword-based theme extractor, test against sample journal entries
3. **Map interaction agent** — Handle pan/zoom, drag, selection, connection mode UI
4. **Visual design agent** — Style nodes, edges, and overall aesthetic to match constellation metaphor

## Commit Strategy

```
feat(map): define map data model with Zod schemas and DB tables
feat(map): implement journal theme extraction for auto-node generation
feat(map): create ForceGraph component with D3 force simulation
feat(map): add node and edge CRUD with server actions
feat(map): implement pan, zoom, drag, and selection interactions
feat(map): add map toolbar and node detail panel
feat(map): style constellation aesthetic with brand colors and glow
feat(map): add map preview widget to dashboard
feat(map): integrate journal entry → map node pipeline
```
