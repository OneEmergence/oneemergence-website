import { expect, test } from '@playwright/test'

import { WORLD_LANDMARKS } from '../../src/features/world-map/landmarks'
import {
  GATE_ONE_LANDMARK_IDS,
  GATE_ONE_PLACEMENTS,
  WORLD_LANDMARK_IDS,
  WORLD_PLACEMENTS,
} from '../../src/features/world-map/immersive/placements'
import {
  isometricRenderOrder,
  toThreeSpriteCenter,
} from '../../src/features/world-map/immersive/spriteAssets'

test('world placements cover all landmarks with usable interaction bounds', () => {
  const expectedIds = WORLD_LANDMARKS.map(({ id }) => id)
  const uniqueIds = new Set(WORLD_LANDMARK_IDS)

  expect(WORLD_LANDMARK_IDS).toHaveLength(15)
  expect(uniqueIds.size).toBe(15)
  expect([...uniqueIds].sort()).toEqual([...expectedIds].sort())
  expect(Object.keys(WORLD_PLACEMENTS).sort()).toEqual([...expectedIds].sort())

  for (const id of WORLD_LANDMARK_IDS) {
    const placement = WORLD_PLACEMENTS[id]
    const values = [
      ...placement.position,
      ...placement.focus,
      placement.pickRadius,
      placement.focusHeight,
      placement.scale,
    ]

    expect(placement.id).toBe(id)
    expect(values.every(Number.isFinite)).toBe(true)
    expect(placement.pickRadius).toBeGreaterThanOrEqual(1.5)
    expect(placement.pickRadius).toBeLessThanOrEqual(4)
    expect(placement.focus[1] - placement.position[1]).toBeCloseTo(placement.focusHeight)
    expect(placement.scale).toBeGreaterThan(0)
  }

  expect(GATE_ONE_LANDMARK_IDS).toEqual(['tree', 'root-home', 'earth'])
  for (const id of GATE_ONE_LANDMARK_IDS) {
    expect(GATE_ONE_PLACEMENTS[id]).toBe(WORLD_PLACEMENTS[id])
  }

  const voice = WORLD_PLACEMENTS['voice-beacon']
  const control = WORLD_PLACEMENTS['cosmic-control']
  const northDistance = Math.hypot(
    voice.position[0] - control.position[0],
    voice.position[2] - control.position[2]
  )
  expect(voice.pickRadius + control.pickRadius).toBeLessThan(northDistance)
})

test('isometric sprite anchors and equal-depth cells sort deterministically', () => {
  const [centerX, centerY] = toThreeSpriteCenter([0.5, 0.92])

  expect(centerX).toBe(0.5)
  expect(centerY).toBeCloseTo(0.08)
  expect(isometricRenderOrder([2, 0, 0])).toBeGreaterThan(isometricRenderOrder([0, 0, 2]))
  expect(isometricRenderOrder([2, 0, 2])).toBeGreaterThan(isometricRenderOrder([0, 0, 0]))
})
