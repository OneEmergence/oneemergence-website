import { BufferGeometry, CatmullRomCurve3, Color, Float32BufferAttribute, Vector3 } from 'three'
import { WORLD_PLACEMENTS } from './placements'
import {
  ISLAND_CENTER,
  ISLAND_RADIUS,
  createRiverCurve,
  terrainSurfaceHeightAt,
} from './worldGeometry'
import type { WorldScenePalette } from './scenePalette'

type Point = readonly [number, number]
export type LandscapeDetail = { kind: 0 | 1 | 2 | 3; x: number; z: number; size: number }
const river = createRiverCurve().getSpacedPoints(120)

export function riverDistanceAt(x: number, z: number) {
  return Math.min(...river.map((point) => Math.hypot(point.x - x, point.z - z)))
}

function curve(points: readonly Point[], closed = false) {
  return new CatmullRomCurve3(
    points.map(([x, z]) => new Vector3(x, 0, z)),
    closed,
    'catmullrom',
    0.25
  )
}

// A garden circuit and a winding inner trail, with short entrances to every place.
const circuit = curve(
  [
    [-27, 9],
    [-29, -1],
    [-25, -11],
    [-13, -13],
    [1, -12],
    [14, -12],
    [24, -7],
    [29, 3],
    [23, 11],
    [15, 17],
    [2, 19],
    [-11, 20],
    [-22, 15],
  ],
  true
)
const inner = curve([
  [-9.6, 15.75],
  [-6, 12],
  [0.8, 13.5],
  [3, 10],
  [0, 5.85],
  [-4, 1],
  [-1.6, -3.6],
  [-5, -8],
  [-1.6, -15.3],
  [-12, -18],
  [-1.6, -20.25],
])
const trailPoints = [...circuit.getSpacedPoints(140), ...inner.getSpacedPoints(100)]
export const LANDSCAPE_ROUTES = [
  circuit,
  inner,
  ...Object.values(WORLD_PLACEMENTS).map(({ position }) => {
    const start = new Vector3(position[0], 0, position[2])
    const end = trailPoints.reduce((nearest, point) =>
      point.distanceToSquared(start) < nearest.distanceToSquared(start) ? point : nearest
    )
    const direction = end.clone().sub(start)
    return curve([
      [start.x, start.z],
      [(start.x + end.x) / 2 - direction.z * 0.08, (start.z + end.z) / 2 + direction.x * 0.08],
      [end.x, end.z],
    ])
  }),
]

export function trailDistanceAt(x: number, z: number) {
  return Math.min(...trailPoints.map((point) => Math.hypot(point.x - x, point.z - z)))
}

function clearOfPlaces(x: number, z: number, margin = 1.5) {
  return Object.values(WORLD_PLACEMENTS).every(
    ({ position, pickRadius }) => Math.hypot(x - position[0], z - position[2]) > pickRadius + margin
  )
}

export function createLandscapeDetails(count: number): LandscapeDetail[] {
  const details: LandscapeDetail[] = []
  // Outcrops describe the actual coast, not a grid of repeated forest sprites.
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + Math.sin(i * 1.7) * 0.045
    const radius = 0.92 + Math.sin(i * 2.3) * 0.02
    const x = ISLAND_CENTER.x + Math.cos(a) * ISLAND_RADIUS.x * radius
    const z = ISLAND_CENTER.z + Math.sin(a) * ISLAND_RADIUS.z * radius
    if (clearOfPlaces(x, z, 1)) details.push({ kind: 0, x, z, size: 5.4 + Math.sin(i * 2.1) * 1.2 })
  }
  // Gardens belong to places. Their small footprint preserves landmark silhouettes.
  for (const { position, pickRadius } of Object.values(WORLD_PLACEMENTS)) {
    const x = position[0] + pickRadius + 3.1
    const z = position[2] + 1.5
    if (clearOfPlaces(x, z, 1.1) && riverDistanceAt(x, z) > 2.8)
      details.push({ kind: 1, x, z, size: 5.2 })
  }
  for (let i = 7; i < river.length - 7; i += 7) {
    const p = river[i]
    const tangent = river[Math.min(i + 1, river.length - 1)]
      .clone()
      .sub(river[i - 1])
      .normalize()
    const side = i % 2 ? 1 : -1
    const x = p.x - tangent.z * 1.8 * side
    const z = p.z + tangent.x * 1.8 * side
    if (clearOfPlaces(x, z, 1.6) && trailDistanceAt(x, z) > 1.3)
      details.push({ kind: 2, x, z, size: 3.5 + (i % 3) * 0.4 })
  }
  let seed = 73019
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let attempt = 0; details.length < count && attempt < 800; attempt++) {
    const a = random() * Math.PI * 2
    const r = Math.sqrt(random()) * 0.88
    const x = ISLAND_CENTER.x + Math.cos(a) * ISLAND_RADIUS.x * r
    const z = ISLAND_CENTER.z + Math.sin(a) * ISLAND_RADIUS.z * r
    if (
      clearOfPlaces(x, z, 1.7) &&
      riverDistanceAt(x, z) > 3 &&
      trailDistanceAt(x, z) > 1.5 &&
      details.every((p) => Math.hypot(x - p.x, z - p.z) > 3)
    )
      details.push({ kind: 3, x, z, size: 2.7 + random() * 1.6 })
  }
  return details.slice(0, count)
}

function geometry(positions: number[], uvs: number[], indices: number[], colors?: number[]) {
  const mesh = new BufferGeometry()
  mesh.setAttribute('position', new Float32BufferAttribute(positions, 3))
  mesh.setAttribute('uv', new Float32BufferAttribute(uvs, 2))
  if (colors) mesh.setAttribute('color', new Float32BufferAttribute(colors, 3))
  mesh.setIndex(indices)
  mesh.computeVertexNormals()
  mesh.computeBoundingSphere()
  return mesh
}

export function createGardenPathsGeometry(
  palette: WorldScenePalette,
  heightAt: (x: number, z: number) => number
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [],
    colors: number[] = []
  const stone = new Color(palette.warmSand).lerp(new Color(palette.gold), 0.09)
  const wood = new Color(palette.warmSand).lerp(new Color(palette.warmDepth), 0.55)
  for (const [routeIndex, route] of LANDSCAPE_ROUTES.entries()) {
    const length = route.getLength()
    if (length < 0.2) continue
    const segments = Math.max(4, Math.ceil(length * 2))
    const start = positions.length / 3
    const width = routeIndex === 0 ? 0.82 : routeIndex === 1 ? 0.68 : 0.48
    for (let i = 0; i <= segments; i++) {
      const point = route.getPointAt(i / segments)
      const tangent = route.getTangentAt(i / segments)
      const side = new Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width)
      for (const [edge, sign] of [-1, 1].entries()) {
        const x = point.x + side.x * sign,
          z = point.z + side.z * sign
        const water = riverDistanceAt(x, z)
        // Low arched timber fords carry paths over the water instead of ending at it.
        const raised = Math.max(0, 1 - water / 3.2) * 0.72
        positions.push(x, heightAt(x, z) + 0.1 + raised, z)
        uvs.push((i / segments) * length, edge)
        const color = water < 2.5 ? wood : stone
        colors.push(color.r, color.g, color.b)
      }
      if (i < segments) {
        const n = start + i * 2
        indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2)
      }
    }
  }
  return geometry(positions, uvs, indices, colors)
}

export function createPlaceTerracesGeometry(
  palette: WorldScenePalette,
  heightAt: (x: number, z: number) => number
) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = [],
    colors: number[] = []
  const innerColor = new Color(palette.warmSand).lerp(new Color(palette.warmDepth), 0.26)
  const rimColor = new Color(palette.warmSand).lerp(new Color(palette.gold), 0.12)
  for (const { position, pickRadius, id } of Object.values(WORLD_PLACEMENTS)) {
    const radius = pickRadius * (id === 'tree' ? 1.45 : 1.25)
    const start = positions.length / 3
    for (let ring = 0; ring < 2; ring++) {
      for (let i = 0; i <= 48; i++) {
        const angle = (i / 48) * Math.PI * 2
        const r = radius * (ring === 0 ? 0.06 : 1)
        const x = position[0] + Math.cos(angle) * r
        const z = position[2] + Math.sin(angle) * r
        positions.push(x, heightAt(x, z) + 0.1, z)
        uvs.push((i / 48) * Math.PI * 2 * radius, ring)
        const c = ring === 0 ? innerColor : rimColor
        colors.push(c.r, c.g, c.b)
        if (ring === 0 && i < 48) {
          const a = start + i
          indices.push(a, a + 1, a + 49, a + 1, a + 50, a + 49)
        }
      }
    }
  }
  return geometry(positions, uvs, indices, colors)
}

export function createLandscapeDetailsGeometry(details: readonly LandscapeDetail[]) {
  const positions: number[] = [],
    uvs: number[] = [],
    indices: number[] = []
  // Fixed billboard basis matches the buildings' baked 45°/30° view.
  const right = new Vector3(Math.SQRT1_2, 0, -Math.SQRT1_2)
  const up = new Vector3(-Math.SQRT1_2 * 0.5, Math.cos(Math.PI / 6), -Math.SQRT1_2 * 0.5)
  const anchors = [0.89, 0.92, 0.77, 0.78]
  for (const detail of details) {
    const start = positions.length / 3
    const row = Math.floor(detail.kind / 2),
      col = detail.kind % 2
    const center = new Vector3(
      detail.x,
      terrainSurfaceHeightAt(detail.x, detail.z) + 0.14,
      detail.z
    )
    for (const [x, y] of [
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
    ]) {
      const point = center
        .clone()
        .addScaledVector(right, (x - 0.5) * detail.size)
        .addScaledVector(up, (y - (1 - anchors[detail.kind])) * detail.size)
      positions.push(point.x, point.y, point.z)
      uvs.push((col + x) / 2, (1 - row + y) / 2)
    }
    indices.push(start, start + 1, start + 2, start + 1, start + 3, start + 2)
  }
  return geometry(positions, uvs, indices)
}
