import { expect, test } from '@playwright/test'
import {
  createRiverRibbonGeometry,
  createTerrainGeometry,
} from '../../src/features/world-map/immersive/worldGeometry'
import type { WorldScenePalette } from '../../src/features/world-map/immersive/scenePalette'

const PALETTE: WorldScenePalette = {
  deepSpace: '#0A0F1F',
  cosmic: '#0A0F1F',
  solarpunk: '#101B2E',
  warmDepth: '#1A1610',
  violet: '#7C5CFF',
  gold: '#F6C453',
  cyan: '#54E2E9',
  light: '#F7F8FB',
  green: '#6EDB8F',
  warmSand: '#E8C9A8',
}

test('terrain faces the RTS camera', () => {
  const geometry = createTerrainGeometry(PALETTE, 16, 4)
  const normals = geometry.getAttribute('normal')
  const positions = geometry.getAttribute('position')
  const uvs = geometry.getAttribute('uv')

  expect(normals.getY(0)).toBeGreaterThan(0.5)
  expect(uvs.count).toBe(positions.count)

  for (let index = 0; index < uvs.count; index += 1) {
    expect(Number.isFinite(uvs.getX(index))).toBe(true)
    expect(Number.isFinite(uvs.getY(index))).toBe(true)
    expect(uvs.getX(index)).toBeGreaterThanOrEqual(-0.05)
    expect(uvs.getX(index)).toBeLessThanOrEqual(1.05)
    expect(uvs.getY(index)).toBeGreaterThanOrEqual(-0.05)
    expect(uvs.getY(index)).toBeLessThanOrEqual(1.05)
  }

  geometry.dispose()
})

test('river ribbons taper instead of ending in rectangular slabs', () => {
  const geometry = createRiverRibbonGeometry(2, 16, 0)
  const positions = geometry.getAttribute('position')
  const last = positions.count - 1

  expect(positions.getX(0)).toBeCloseTo(positions.getX(1))
  expect(positions.getZ(0)).toBeCloseTo(positions.getZ(1))
  expect(positions.getX(last)).toBeCloseTo(positions.getX(last - 1))
  expect(positions.getZ(last)).toBeCloseTo(positions.getZ(last - 1))

  geometry.dispose()
})
