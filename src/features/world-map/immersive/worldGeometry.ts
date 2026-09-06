import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Vector3 } from 'three'
import { GATE_ONE_PLACEMENTS, terrainHeightAt } from './placements'
import type { WorldScenePalette } from './scenePalette'

const ISLAND_CENTER = { x: 2, z: 4 }
const ISLAND_RADIUS = { x: 42, z: 26 }
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
  for (let index = 1; index < RIVER_XZ.length; index += 1) {
    distance = Math.min(distance, distanceToSegment(x, z, RIVER_XZ[index - 1], RIVER_XZ[index]))
  }
  return smoothstep(1 - distance / 2.8) * 0.58
}

function terrainColor(x: number, z: number, radius: number, palette: WorldScenePalette) {
  const tree = GATE_ONE_PLACEMENTS.tree.position
  const rootHome = GATE_ONE_PLACEMENTS['root-home'].position
  const earth = GATE_ONE_PLACEMENTS.earth.position
  const color = new Color(palette.solarpunk)
  color.lerp(new Color(palette.green), 0.08)
  color.lerp(new Color(palette.warmSand), influence(x, z, rootHome[0], rootHome[2], 10) * 0.5)
  color.lerp(new Color(palette.green), influence(x, z, earth[0], earth[2], 11) * 0.42)
  color.lerp(new Color(palette.gold), influence(x, z, tree[0], tree[2], 9) * 0.28)
  color.lerp(new Color(palette.warmDepth), smoothstep((radius - 0.76) / 0.24) * 0.8)
  return color
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

  const centerHeight = terrainHeightAt(ISLAND_CENTER.x, ISLAND_CENTER.z)
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
  const skirtStart = positions.length / 3
  const skirtColor = new Color(palette.warmDepth)

  for (let segment = 0; segment < radialSegments; segment += 1) {
    const topIndex = outerStart + segment
    positions.push(
      positions[topIndex * 3],
      positions[topIndex * 3 + 1] - 4.5,
      positions[topIndex * 3 + 2]
    )
    colors.push(skirtColor.r, skirtColor.g, skirtColor.b)
    uvs.push(uvs[topIndex * 2], uvs[topIndex * 2 + 1])
  }

  for (let segment = 0; segment < radialSegments; segment += 1) {
    const next = (segment + 1) % radialSegments
    const top = outerStart + segment
    const topNext = outerStart + next
    const bottom = skirtStart + segment
    const bottomNext = skirtStart + next
    indices.push(top, bottomNext, bottom, top, topNext, bottomNext)
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
    RIVER_XZ.map(([x, z]) => new Vector3(x, terrainHeightAt(x, z) + yOffset, z)),
    false,
    'catmullrom',
    0.45
  )
}

export function createRiverRibbonGeometry(width: number, segments: number, yOffset: number) {
  const curve = createRiverCurve(yOffset)
  const positions: number[] = []
  const indices: number[] = []

  for (let index = 0; index <= segments; index += 1) {
    const position = curve.getPointAt(index / segments)
    const tangent = curve.getTangentAt(index / segments).normalize()
    const taper = Math.min(1, index / 4, (segments - index) / 4)
    const side = new Vector3(-tangent.z, 0, tangent.x).normalize().multiplyScalar(width * taper)
    const left = position.clone().add(side)
    const right = position.clone().sub(side)
    positions.push(left.x, left.y, left.z, right.x, right.y, right.z)

    if (index === segments) continue
    const current = index * 2
    const next = current + 2
    indices.push(current, next, current + 1, current + 1, next, next + 1)
  }

  const geometry = new BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions), 3))
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}
