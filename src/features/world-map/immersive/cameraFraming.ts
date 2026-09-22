import type { WorldLandmarkId } from '../landmarks'
import { WORLD_LANDMARK_IDS, WORLD_PLACEMENTS, terrainHeightAt } from './placements'
import { WORLD_SPRITE_ASSETS } from './spriteAssets'
import { ISLAND_CENTER, ISLAND_RADIUS } from './worldGeometry'

export interface CameraPanelRect {
  left: number
  top: number
  width: number
  height: number
}

export interface CameraBounds {
  left: number
  top: number
  right: number
  bottom: number
}

export const WORLD_CAMERA_OFFSET = [
  Math.SQRT1_2 * Math.cos(Math.PI / 6) * 72,
  36,
  Math.SQRT1_2 * Math.cos(Math.PI / 6) * 72,
] as const
export const WORLD_CAMERA_TARGET = [ISLAND_CENTER.x, 0, ISLAND_CENTER.z] as const

// The painted sprites use this same 45-degree azimuth / 30-degree elevation.
// Coordinates are in camera-plane world units, with screen y pointing down.
export function projectWorldPoint([x, y, z]: readonly [number, number, number]) {
  return {
    x: Math.SQRT1_2 * (x - z),
    y: Math.SQRT1_2 * 0.5 * (x + z) - Math.cos(Math.PI / 6) * y,
  }
}

export function landmarkCameraBounds(id: WorldLandmarkId): CameraBounds {
  const { position } = WORLD_PLACEMENTS[id]
  const point = projectWorldPoint([position[0], position[1] + 0.08, position[2]])
  const {
    worldSize: [width, height],
    anchor,
  } = WORLD_SPRITE_ASSETS[id]
  return {
    left: point.x - width * anchor[0],
    right: point.x + width * (1 - anchor[0]),
    top: point.y - height * anchor[1],
    bottom: point.y + height * (1 - anchor[1]),
  }
}

function overviewBounds(): CameraBounds {
  const bounds = WORLD_LANDMARK_IDS.map(landmarkCameraBounds)
  // Conservative coastline envelope includes the irregular rim and island skirt.
  for (let index = 0; index < 120; index += 1) {
    const angle = (index / 120) * Math.PI * 2
    const x = ISLAND_CENTER.x + Math.cos(angle) * ISLAND_RADIUS.x * 1.06
    const z = ISLAND_CENTER.z + Math.sin(angle) * ISLAND_RADIUS.z * 1.06
    for (const y of [terrainHeightAt(x, z), terrainHeightAt(x, z) - 8]) {
      const point = projectWorldPoint([x, y, z])
      bounds.push({ left: point.x, right: point.x, top: point.y, bottom: point.y })
    }
  }
  return {
    left: Math.min(...bounds.map((bound) => bound.left)),
    right: Math.max(...bounds.map((bound) => bound.right)),
    top: Math.min(...bounds.map((bound) => bound.top)),
    bottom: Math.max(...bounds.map((bound) => bound.bottom)),
  }
}

const WORLD_BOUNDS = overviewBounds()

export function cameraSafeBounds(
  width: number,
  height: number,
  selectedId: WorldLandmarkId | null,
  selectionPanel?: CameraPanelRect | null
): CameraBounds {
  const hasPanel = selectedId !== null || selectionPanel != null
  const panel =
    selectionPanel ??
    (selectedId === null
      ? null
      : width >= 768
        ? { left: width - 372, top: 100, width: 352, height: height - 120 }
        : {
            left: 12,
            top: height - 12 - Math.min(285, height * 0.42),
            width: width - 24,
            height: Math.min(285, height * 0.42),
          })
  const bounds = {
    left: 24,
    top: 120,
    right: width - 24,
    bottom: height - (hasPanel ? 24 : width < 768 ? 148 : 96),
  }
  if (panel) {
    if (width >= 768) bounds.right = Math.min(bounds.right, panel.left - 16)
    else bounds.bottom = Math.min(bounds.bottom, panel.top - 16)
  }
  // Keep projection finite in a temporarily tiny canvas during a resize.
  bounds.right = Math.max(bounds.left + 1, bounds.right)
  bounds.bottom = Math.max(bounds.top + 1, bounds.bottom)
  return bounds
}

export interface WorldCameraFrame {
  target: readonly [number, number, number]
  zoom: number
  offsetX: number
  offsetY: number
  safeBounds: CameraBounds
}

export function getWorldCameraFrame(
  width: number,
  height: number,
  selectedId: WorldLandmarkId | null,
  selectionPanel?: CameraPanelRect | null
): WorldCameraFrame {
  const safeBounds = cameraSafeBounds(width, height, selectedId, selectionPanel)
  const bounds = selectedId ? landmarkCameraBounds(selectedId) : WORLD_BOUNDS
  const availableWidth = safeBounds.right - safeBounds.left
  const availableHeight = safeBounds.bottom - safeBounds.top
  const fitZoom = Math.min(
    availableWidth / (bounds.right - bounds.left),
    availableHeight / (bounds.bottom - bounds.top)
  )
  const overviewZoom = Math.min(
    availableWidth / (WORLD_BOUNDS.right - WORLD_BOUNDS.left),
    availableHeight / (WORLD_BOUNDS.bottom - WORLD_BOUNDS.top)
  )
  const zoom = selectedId
    ? Math.min(fitZoom * 0.8, Math.max(14, Math.min(22, overviewZoom * 1.15)))
    : fitZoom * 0.94
  const target = selectedId ? WORLD_PLACEMENTS[selectedId].focus : WORLD_CAMERA_TARGET
  const projectedTarget = projectWorldPoint(target)

  return {
    target,
    zoom,
    safeBounds,
    // Frustum offsets reserve HUD pixels without moving/clamping the world target.
    offsetX:
      width / 2 +
      ((bounds.left + bounds.right) / 2 - projectedTarget.x) * zoom -
      (safeBounds.left + safeBounds.right) / 2,
    offsetY:
      height / 2 +
      ((bounds.top + bounds.bottom) / 2 - projectedTarget.y) * zoom -
      (safeBounds.top + safeBounds.bottom) / 2,
  }
}

export function projectedLandmarkBounds(
  id: WorldLandmarkId,
  width: number,
  height: number,
  frame: Pick<WorldCameraFrame, 'target' | 'zoom' | 'offsetX' | 'offsetY'>
): CameraBounds {
  const bounds = landmarkCameraBounds(id)
  const target = projectWorldPoint(frame.target)
  return {
    left: width / 2 + (bounds.left - target.x) * frame.zoom - frame.offsetX,
    right: width / 2 + (bounds.right - target.x) * frame.zoom - frame.offsetX,
    top: height / 2 + (bounds.top - target.y) * frame.zoom - frame.offsetY,
    bottom: height / 2 + (bounds.bottom - target.y) * frame.zoom - frame.offsetY,
  }
}
