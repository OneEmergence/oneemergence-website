import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Vector3 } from 'three'
import { GATE_ONE_PLACEMENTS, terrainHeightAt } from './placements'
import type { WorldScenePalette } from './scenePalette'

export const ISLAND_CENTER = { x: 2, z: 4 }
export const ISLAND_RADIUS = { x: 42, z: 26 }
const RIVER_XZ = [
  [-18, 21],
  [-11, 16],
  [-13, 9],
  [-7, 4],
  [-4, -3],
  [3, -7],
  [11, -2],
  [19, 1],
  [27, 5],
  [34, 1],
] as const
const RIVER_PATH = new CatmullRomCurve3(
  RIVER_XZ.map(([x, z]) => new Vector3(x, 0, z)),
  false,
  'catmullrom',
  0.45
)
// The terrain cut and every ribbon share the same curved river, including bends.
const RIVER_BED_POINTS = RIVER_PATH.getSpacedPoints(96).map(({ x, z }) => [x, z] as const)

function smoothstep(value: number) {
  const clamped = Math.max(0, Math.min(1, value))
  return clamped * clamped * (3 - 2 * clamped)
}

function influence(x: number, z: number, centerX: number, centerZ: number, radius: number) {
  return smoothstep(1 - Math.hypot(x - centerX, z - centerZ) / radius)
}

function distanceToSegment(
  x: number,
  z: number,
  start: readonly [number, number],
  end: readonly [number, number]
) {
  const dx = end[0] - start[0]
  const dz = end[1] - start[1]
  const lengthSquared = dx * dx + dz * dz
  const position = Math.max(
    0,
    Math.min(1, ((x - start[0]) * dx + (z - start[1]) * dz) / lengthSquared)
  )
  return Math.hypot(x - (start[0] + dx * position), z - (start[1] + dz * position))
}

function riverBedDepth(x: number, z: number) {
  let distance = Number.POSITIVE_INFINITY
  for (let index = 1; index < RIVER_BED_POINTS.length; index += 1) {
    distance = Math.min(
      distance,
      distanceToSegment(x, z, RIVER_BED_POINTS[index - 1], RIVER_BED_POINTS[index])
    )
  }
  return smoothstep(1 - distance / 2.8) * 0.58
}

function terrainColor(x: number, z: number, radius: number, palette: WorldScenePalette) {
  const tree = GATE_ONE_PLACEMENTS.tree.position
  const rootHome = GATE_ONE_PLACEMENTS['root-home'].position
  const earth = GATE_ONE_PLACEMENTS.earth.position
  const color = new Color(palette.light).lerp(new Color(palette.green), 0.08)
  color.lerp(new Color(palette.warmSand), influence(x, z, rootHome[0], rootHome[2], 14) * 0.24)
  color.lerp(new Color(palette.green), influence(x, z, earth[0], earth[2], 15) * 0.2)
  color.lerp(new Color(palette.gold), influence(x, z, tree[0], tree[2], 9) * 0.1)
  color.multiplyScalar(0.78)
  const rim = new Color(palette.warmSand).lerp(new Color(palette.warmDepth), 0.55)
  color.lerp(rim, smoothstep((radius - 0.88) / 0.12) * 0.6)
  return color
}

/** The same continuous surface used by the terrain, paths and planted details. */
export function terrainSurfaceHeightAt(x: number, z: number) {
  const nx = (x - ISLAND_CENTER.x) / ISLAND_RADIUS.x
  const nz = (z - ISLAND_CENTER.z) / ISLAND_RADIUS.z
  const angle = Math.atan2(nz, nx)
  const edgeVariation = 0.035 * Math.sin(angle * 5 + 0.7) + 0.025 * Math.sin(angle * 11)
  const radial = Math.hypot(nx, nz)
  const radius = (2 * radial) / (1 + Math.sqrt(1 + 4 * edgeVariation * radial))
  return terrainHeightAt(x, z) - riverBedDepth(x, z) - smoothstep((radius - 0.82) / 0.18) ** 2 * 3.4
}

export function createTerrainGeometry(
  palette: WorldScenePalette,
  radialSegments: number,
  rings: number
) {
  const positions: number[] = []
  const colors: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  const centerHeight =
    terrainHeightAt(ISLAND_CENTER.x, ISLAND_CENTER.z) -
    riverBedDepth(ISLAND_CENTER.x, ISLAND_CENTER.z)
  const centerColor = terrainColor(ISLAND_CENTER.x, ISLAND_CENTER.z, 0, palette)
  positions.push(ISLAND_CENTER.x, centerHeight, ISLAND_CENTER.z)
  colors.push(centerColor.r, centerColor.g, centerColor.b)
  uvs.push(0.5, 0.5)

  for (let ring = 1; ring <= rings; ring += 1) {
    const radius = ring / rings

    for (let segment = 0; segment < radialSegments; segment += 1) {
      const angle = (segment / radialSegments) * Math.PI * 2
      const edgeVariation = 1 + 0.035 * Math.sin(angle * 5 + 0.7) + 0.025 * Math.sin(angle * 11)
      const shapedRadius = radius * (1 + (edgeVariation - 1) * radius)
      const x = ISLAND_CENTER.x + Math.cos(angle) * ISLAND_RADIUS.x * shapedRadius
      const z = ISLAND_CENTER.z + Math.sin(angle) * ISLAND_RADIUS.z * shapedRadius
      const edgeDrop = smoothstep((radius - 0.82) / 0.18) ** 2 * 3.4
      const y = terrainHeightAt(x, z) - riverBedDepth(x, z) - edgeDrop
      const color = terrainColor(x, z, radius, palette)

      positions.push(x, y, z)
      colors.push(color.r, color.g, color.b)
      uvs.push(
        (x - (ISLAND_CENTER.x - ISLAND_RADIUS.x)) / (ISLAND_RADIUS.x * 2),
        (z - (ISLAND_CENTER.z - ISLAND_RADIUS.z)) / (ISLAND_RADIUS.z * 2)
      )
    }
  }

  for (let segment = 0; segment < radialSegments; segment += 1) {
    const next = (segment + 1) % radialSegments
    indices.push(0, 1 + next, 1 + segment)
  }

  for (let ring = 1; ring < rings; ring += 1) {
    const innerStart = 1 + (ring - 1) * radialSegments
    const outerStart = 1 + ring * radialSegments

    for (let segment = 0; segment < radialSegments; segment += 1) {
      const next = (segment + 1) % radialSegments
      const inner = innerStart + segment
      const innerNext = innerStart + next
      const outer = outerStart + segment
      const outerNext = outerStart + next

      indices.push(inner, outerNext, outer, inner, innerNext, outerNext)
    }
  }

  const topIndexCount = indices.length
  const outerStart = 1 + (rings - 1) * radialSegments
  let previousStart = outerStart

  // Two mineral shelves taper into the void; the living surface stays intact.
  for (const [layer, depth] of [1.45, 3.8].entries()) {
    const skirtStart = positions.length / 3
    for (let segment = 0; segment < radialSegments; segment += 1) {
      const topIndex = outerStart + segment
      const angle = (segment / radialSegments) * Math.PI * 2
      const strata = Math.sin(angle * 7 + 0.5) * 0.5 + Math.sin(angle * 13) * 0.25
      const inset = layer === 0 ? 0.99 + strata * 0.006 : 0.94 + strata * 0.012
      const x = ISLAND_CENTER.x + (positions[topIndex * 3] - ISLAND_CENTER.x) * inset
      const z = ISLAND_CENTER.z + (positions[topIndex * 3 + 2] - ISLAND_CENTER.z) * inset
      const color = new Color(palette.warmSand).lerp(
        new Color(layer === 0 ? palette.warmDepth : palette.deepSpace),
        layer === 0 ? 0.32 + strata * 0.14 : 0.75 + strata * 0.08
      )

      positions.push(x, positions[topIndex * 3 + 1] - depth + strata * 0.3, z)
      colors.push(color.r, color.g, color.b)
      uvs.push(uvs[topIndex * 2], uvs[topIndex * 2 + 1])
    }

    for (let segment = 0; segment < radialSegments; segment += 1) {
      const next = (segment + 1) % radialSegments
      const top = previousStart + segment
      const topNext = previousStart + next
      const bottom = skirtStart + segment
      const bottomNext = skirtStart + next
      indices.push(top, bottomNext, bottom, top, topNext, bottomNext)
    }
    previousStart = skirtStart
  }

  const geometry = new BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.addGroup(0, topIndexCount, 0)
  geometry.addGroup(topIndexCount, indices.length - topIndexCount, 1)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createRiverCurve(yOffset = 0.12) {
  return new CatmullRomCurve3(
    RIVER_BED_POINTS.map(([x, z]) => new Vector3(x, terrainHeightAt(x, z) + yOffset, z)),
    false,
    'catmullrom',
    0.45
  )
}

/** Sample the rendered triangles, so attached paths also fit coarse terrain. */
export function createTerrainHeightSampler(geometry: BufferGeometry) {
  const positions = geometry.getAttribute('position')
  const indices = geometry.getIndex()!
  const triangles = Array.from({ length: geometry.groups[0].count / 3 }, (_, face) => {
    const a = new Vector3().fromBufferAttribute(positions, indices.getX(face * 3))
    const b = new Vector3().fromBufferAttribute(positions, indices.getX(face * 3 + 1))
    const c = new Vector3().fromBufferAttribute(positions, indices.getX(face * 3 + 2))
    return {
      a,
      b,
      c,
      minX: Math.min(a.x, b.x, c.x),
      maxX: Math.max(a.x, b.x, c.x),
      minZ: Math.min(a.z, b.z, c.z),
      maxZ: Math.max(a.z, b.z, c.z),
    }
  })
  return (x: number, z: number) => {
    for (const { a, b, c, minX, maxX, minZ, maxZ } of triangles) {
      if (x < minX || x > maxX || z < minZ || z > maxZ) continue
      const divisor = (b.z - c.z) * (a.x - c.x) + (c.x - b.x) * (a.z - c.z)
      if (Math.abs(divisor) < 1e-8) continue
      const u = ((b.z - c.z) * (x - c.x) + (c.x - b.x) * (z - c.z)) / divisor
      const v = ((c.z - a.z) * (x - c.x) + (a.x - c.x) * (z - c.z)) / divisor
      if (u >= -1e-6 && v >= -1e-6 && u + v <= 1 + 1e-6)
        return u * a.y + v * b.y + (1 - u - v) * c.y
    }
    return terrainSurfaceHeightAt(x, z)
  }
}

export function createRiverRibbonGeometry(
  width: number,
  segments: number,
  yOffset: number,
  range: readonly [number, number] = [0, 1]
) {
  const positions: number[] = []
  const indices: number[] = []
  const uvs: number[] = []

  for (let index = 0; index <= segments; index += 1) {
    const progress = index / segments
    const alongRiver = range[0] + progress * (range[1] - range[0])
    const position = RIVER_PATH.getPointAt(alongRiver)
    const tangent = RIVER_PATH.getTangentAt(alongRiver).normalize()
    const taper = smoothstep(Math.min(progress / 0.06, (1 - progress) / 0.06))
    const bendWidth = 1 + Math.sin(alongRiver * Math.PI * 7) * 0.09
    const side = new Vector3(-tangent.z, 0, tangent.x)
      .normalize()
      .multiplyScalar(width * taper * bendWidth)
    const left = position.clone().add(side)
    const right = position.clone().sub(side)
    // Sample actual terrain at both banks, not heights interpolated between
    // distant control points, which previously cut the water into triangles.
    left.y = terrainHeightAt(left.x, left.z) + yOffset
    right.y = terrainHeightAt(right.x, right.z) + yOffset
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z)
    uvs.push(alongRiver * 36, 0, alongRiver * 36, 1)

    if (index === segments) continue
    const current = index * 2
    const next = current + 2
    indices.push(current, next, current + 1, current + 1, next, next + 1)
  }

  const geometry = new BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uvs), 2))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

export function createTreeGroundGlowGeometry(palette: WorldScenePalette) {
  const [originX, originY, originZ] = GATE_ONE_PLACEMENTS.tree.position
  const geometry = new BufferGeometry()
  const positions: number[] = [0, 0.12, 0]
  const color = new Color(palette.gold)
  const colors: number[] = [color.r, color.g, color.b, 0.16]
  const indices: number[] = []
  const segments = 40

  for (const [ring, radius] of [3.6, 6.8].entries()) {
    for (let segment = 0; segment < segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      positions.push(x, terrainHeightAt(originX + x, originZ + z) - originY + 0.12, z)
      colors.push(color.r, color.g, color.b, ring === 0 ? 0.12 : 0)
      const next = (segment + 1) % segments
      if (ring === 0) indices.push(0, 1 + next, 1 + segment)
      else {
        const inner = 1 + segment
        const innerNext = 1 + next
        const outer = inner + segments
        const outerNext = innerNext + segments
        indices.push(inner, outerNext, outer, inner, innerNext, outerNext)
      }
    }
  }

  geometry.setIndex(indices)
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.setAttribute('color', new BufferAttribute(new Float32Array(colors), 4))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
