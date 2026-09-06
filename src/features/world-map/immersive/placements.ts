import { WORLD_LANDMARKS, type WorldLandmarkId } from '../landmarks'

export const WORLD_LANDMARK_IDS: readonly WorldLandmarkId[] = WORLD_LANDMARKS.map(({ id }) => id)
export const GATE_ONE_LANDMARK_IDS = ['tree', 'root-home', 'earth'] as const
export type GateOneLandmarkId = (typeof GATE_ONE_LANDMARK_IDS)[number]

export interface WorldPlacement {
  id: WorldLandmarkId
  position: readonly [number, number, number]
  focus: readonly [number, number, number]
  pickRadius: number
  focusHeight: number
  scale: number
}

const WORLD_WIDTH = 80
const WORLD_DEPTH = 45

const WORLD_XZ = Object.fromEntries(
  WORLD_LANDMARKS.map(({ id, x, y }) => [
    id,
    {
      x: (x / 100) * WORLD_WIDTH - WORLD_WIDTH / 2,
      z: (y / 100) * WORLD_DEPTH - WORLD_DEPTH / 2,
    },
  ])
) as Record<WorldLandmarkId, { x: number; z: number }>

interface PlacementProfile {
  pickRadius: number
  focusHeight: number
  scale: number
}

const PLACEMENT_PROFILES = {
  tree: { pickRadius: 3.8, focusHeight: 4.5, scale: 1.2 },
  council: { pickRadius: 2.8, focusHeight: 2.4, scale: 1.05 },
  noosphere: { pickRadius: 2.6, focusHeight: 2.8, scale: 1 },
  ashram: { pickRadius: 2.8, focusHeight: 3.4, scale: 1.05 },
  energy: { pickRadius: 2.6, focusHeight: 2.7, scale: 1 },
  earth: { pickRadius: 3, focusHeight: 2.8, scale: 1.05 },
  creation: { pickRadius: 2.8, focusHeight: 2.5, scale: 1 },
  exchange: { pickRadius: 2.8, focusHeight: 2.6, scale: 1 },
  'root-home': { pickRadius: 2.4, focusHeight: 2.3, scale: 0.9 },
  'creation-temple': { pickRadius: 2.2, focusHeight: 2.5, scale: 0.88 },
  'solar-ark': { pickRadius: 2.2, focusHeight: 2.6, scale: 0.9 },
  'heart-caravan': { pickRadius: 2.2, focusHeight: 2.2, scale: 0.86 },
  'voice-beacon': { pickRadius: 1.6, focusHeight: 3.2, scale: 0.78 },
  observatory: { pickRadius: 2.2, focusHeight: 3.4, scale: 0.95 },
  'cosmic-control': { pickRadius: 1.6, focusHeight: 4.2, scale: 0.82 },
} satisfies Record<WorldLandmarkId, PlacementProfile>

function smoothstep(value: number) {
  const clamped = Math.max(0, Math.min(1, value))
  return clamped * clamped * (3 - 2 * clamped)
}

function plateau(
  height: number,
  x: number,
  z: number,
  centerX: number,
  centerZ: number,
  radius: number,
  target: number
) {
  const distance = Math.hypot(x - centerX, z - centerZ)
  const influence = smoothstep(1 - distance / radius)
  return height + (target - height) * influence
}

export function terrainHeightAt(x: number, z: number) {
  const tree = WORLD_XZ.tree
  const rootHome = WORLD_XZ['root-home']
  const earth = WORLD_XZ.earth
  let height =
    0.38 * Math.sin(x * 0.14) * Math.cos(z * 0.19) +
    0.22 * Math.sin((x + z) * 0.31) +
    0.12 * Math.cos(x * 0.47 - z * 0.21)

  height += smoothstep((-z - 3) / 20) * 1.6
  height = plateau(height, x, z, tree.x, tree.z, 5.8, 0.65)
  height = plateau(height, x, z, rootHome.x, rootHome.z, 3.8, 0.25)
  return plateau(height, x, z, earth.x, earth.z, 5, 0.55)
}

function toWorldPlacement(id: WorldLandmarkId): WorldPlacement {
  const { x, z } = WORLD_XZ[id]
  const y = terrainHeightAt(x, z)
  const profile = PLACEMENT_PROFILES[id]

  return {
    id,
    position: [x, y, z],
    focus: [x, y + profile.focusHeight, z],
    ...profile,
  }
}

export const WORLD_PLACEMENTS = Object.fromEntries(
  WORLD_LANDMARK_IDS.map((id) => [id, toWorldPlacement(id)])
) as Record<WorldLandmarkId, WorldPlacement>

export const GATE_ONE_PLACEMENTS = Object.fromEntries(
  GATE_ONE_LANDMARK_IDS.map((id) => [id, WORLD_PLACEMENTS[id]])
) as Record<GateOneLandmarkId, WorldPlacement>
