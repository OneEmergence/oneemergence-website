import { expect, test } from '@playwright/test'
import { OrthographicCamera, Vector3 } from 'three'
import {
  getWorldCameraFrame,
  projectedLandmarkBounds,
  WORLD_CAMERA_OFFSET,
  type CameraBounds,
  type CameraPanelRect,
  type WorldCameraFrame,
} from '../../src/features/world-map/immersive/cameraFraming'
import {
  WORLD_LANDMARK_IDS,
  WORLD_PLACEMENTS,
} from '../../src/features/world-map/immersive/placements'
import { WORLD_SPRITE_ASSETS } from '../../src/features/world-map/immersive/spriteAssets'
import type { WorldLandmarkId } from '../../src/features/world-map/landmarks'

const VIEWPORTS = [
  [390, 844],
  [767, 900],
  [768, 1024],
  [1024, 768],
  [1440, 900],
  [1920, 1080],
] as const

function contains(outer: CameraBounds, inner: CameraBounds) {
  expect(inner.left).toBeGreaterThanOrEqual(outer.left - 0.01)
  expect(inner.top).toBeGreaterThanOrEqual(outer.top - 0.01)
  expect(inner.right).toBeLessThanOrEqual(outer.right + 0.01)
  expect(inner.bottom).toBeLessThanOrEqual(outer.bottom + 0.01)
}

// Project the actual billboard corners through Three's orthographic camera,
// independently of the framing helper's camera-plane arithmetic.
function threeSpriteBounds(
  id: WorldLandmarkId,
  width: number,
  height: number,
  frame: WorldCameraFrame
) {
  const camera = new OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.5, 150)
  const target = new Vector3(...frame.target)
  camera.position.copy(target).add(new Vector3(...WORLD_CAMERA_OFFSET))
  camera.lookAt(target)
  camera.zoom = frame.zoom
  camera.setViewOffset(width, height, frame.offsetX, frame.offsetY, width, height)
  camera.updateMatrixWorld()
  const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0)
  const up = new Vector3().setFromMatrixColumn(camera.matrixWorld, 1)
  const origin = new Vector3(...WORLD_PLACEMENTS[id].position)
  origin.y += 0.08
  const { worldSize, anchor } = WORLD_SPRITE_ASSETS[id]
  const corners = [0, 1].flatMap((x) =>
    [0, 1].map((y) => {
      const corner = origin
        .clone()
        .addScaledVector(right, (x - anchor[0]) * worldSize[0])
        .addScaledVector(up, (anchor[1] - y) * worldSize[1])
        .project(camera)
      return { x: ((corner.x + 1) * width) / 2, y: ((1 - corner.y) * height) / 2 }
    })
  )
  return {
    left: Math.min(...corners.map(({ x }) => x)),
    right: Math.max(...corners.map(({ x }) => x)),
    top: Math.min(...corners.map(({ y }) => y)),
    bottom: Math.max(...corners.map(({ y }) => y)),
  }
}

for (const [width, height] of VIEWPORTS) {
  test(`all 15 sprite bounds remain clear of the measured panel at ${width}x${height}`, () => {
    const panel: CameraPanelRect =
      width >= 768
        ? { left: width - 372, top: 100, width: 352, height: height - 120 }
        : {
            left: 12,
            top: height - 12 - Math.min(340, height * 0.42),
            width: width - 24,
            height: Math.min(340, height * 0.42),
          }

    for (const id of WORLD_LANDMARK_IDS) {
      const frame = getWorldCameraFrame(width, height, id, panel)
      const actualBounds = threeSpriteBounds(id, width, height, frame)
      contains(frame.safeBounds, actualBounds)
      if (width >= 768) expect(actualBounds.right).toBeLessThanOrEqual(panel.left - 16)
      else expect(actualBounds.bottom).toBeLessThanOrEqual(panel.top - 16)
      expect(actualBounds.top).toBeGreaterThanOrEqual(120)
      expect(frame.target).toEqual(WORLD_PLACEMENTS[id].focus)
      const diagnosticBounds = projectedLandmarkBounds(id, width, height, frame)
      for (const edge of ['left', 'right', 'top', 'bottom'] as const) {
        expect(diagnosticBounds[edge]).toBeCloseTo(actualBounds[edge], 5)
      }
    }
  })

  test(`overview fits all landmarks and reserves HUD space at ${width}x${height}`, () => {
    const frame = getWorldCameraFrame(width, height, null)
    for (const id of WORLD_LANDMARK_IDS) {
      contains(frame.safeBounds, threeSpriteBounds(id, width, height, frame))
    }
    expect(frame.safeBounds.bottom).toBe(height - (width < 768 ? 148 : 96))
    expect(frame.zoom).toBeGreaterThan(1)
    expect(frame.zoom).toBeLessThan(28)
  })
}

test('an unchanged selection adapts to panel height and orientation without shifting its world target', () => {
  const portrait = getWorldCameraFrame(390, 844, 'root-home', {
    left: 12,
    top: 500,
    width: 366,
    height: 332,
  })
  const tallerSheet = getWorldCameraFrame(390, 844, 'root-home', {
    left: 12,
    top: 420,
    width: 366,
    height: 412,
  })
  const landscape = getWorldCameraFrame(844, 390, 'root-home', {
    left: 472,
    top: 100,
    width: 352,
    height: 270,
  })
  expect(tallerSheet.offsetY).not.toBe(portrait.offsetY)
  expect(landscape.offsetX).not.toBe(portrait.offsetX)
  for (const [width, height, frame] of [
    [390, 844, portrait],
    [390, 844, tallerSheet],
    [844, 390, landscape],
  ] as const) {
    expect(frame.target).toEqual(WORLD_PLACEMENTS['root-home'].focus)
    contains(frame.safeBounds, threeSpriteBounds('root-home', width, height, frame))
  }
})

test('fallback panel framing handles the former 640-1023 breakpoint gaps', () => {
  for (const width of [640, 767, 768, 1023]) {
    const frame = getWorldCameraFrame(width, 900, 'tree')
    contains(frame.safeBounds, threeSpriteBounds('tree', width, 900, frame))
    if (width < 768) expect(frame.safeBounds.bottom).toBeLessThan(900 - 285)
    else expect(frame.safeBounds.right).toBe(width - 372 - 16)
  }
})
