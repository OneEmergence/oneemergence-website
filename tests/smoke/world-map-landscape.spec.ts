import { expect, test } from '@playwright/test'
import { Mesh, MeshBasicMaterial, Raycaster, Vector3 } from 'three'
import {
  createRiverRibbonGeometry,
  createTerrainGeometry,
  createTreeGroundGlowGeometry,
  ISLAND_CENTER,
  terrainSurfaceHeightAt,
  createTerrainHeightSampler,
} from '../../src/features/world-map/immersive/worldGeometry'
import {
  createGardenPathsGeometry,
  createLandscapeDetails,
  createLandscapeDetailsGeometry,
  LANDSCAPE_ROUTES,
} from '../../src/features/world-map/immersive/landscapeGeometry'
import { WORLD_PLACEMENTS } from '../../src/features/world-map/immersive/placements'
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

test('island shelves narrow toward the underside without changing the living edge', () => {
  const segments = 40
  const rings = 12
  const geometry = createTerrainGeometry(PALETTE, segments, rings)
  const positions = geometry.getAttribute('position')
  const surfaceEnd = 1 + segments * rings

  for (let segment = 0; segment < segments; segment += 1) {
    const edge = surfaceEnd - segments + segment
    const shelf = surfaceEnd + segment
    const bottom = surfaceEnd + segments + segment
    const radius = (index: number) =>
      Math.hypot(positions.getX(index) - ISLAND_CENTER.x, positions.getZ(index) - ISLAND_CENTER.z)
    expect(radius(bottom)).toBeLessThan(radius(shelf))
    expect(radius(shelf)).toBeLessThan(radius(edge))
    expect(positions.getY(bottom)).toBeLessThan(positions.getY(shelf))
    expect(positions.getY(shelf)).toBeLessThan(positions.getY(edge))
  }
  geometry.dispose()
})

test('river banks and water remain above the rendered low terrain through its bends', () => {
  const terrain = createTerrainGeometry(PALETTE, 40, 12)
  const material = new MeshBasicMaterial()
  const mesh = new Mesh(terrain, material)
  const ray = new Raycaster()
  mesh.updateMatrixWorld()

  for (const [width, elevation] of [
    [2.05, 0.025],
    [1.55, 0.075],
  ]) {
    const ribbon = createRiverRibbonGeometry(width, 48, elevation)
    const positions = ribbon.getAttribute('position')
    for (let index = 0; index < positions.count; index += 1) {
      ray.set(new Vector3(positions.getX(index), 20, positions.getZ(index)), new Vector3(0, -1, 0))
      const [hit] = ray.intersectObject(mesh)
      expect(hit, `river vertex ${index} has terrain beneath it`).toBeDefined()
      expect(positions.getY(index), `river width ${width}, vertex ${index}`).toBeGreaterThan(
        hit.point.y
      )
    }
    ribbon.dispose()
  }
  terrain.dispose()
  material.dispose()
})

test('tree contact light has a transparent outer edge and upward-facing triangles', () => {
  const geometry = createTreeGroundGlowGeometry(PALETTE)
  const colors = geometry.getAttribute('color')
  const normals = geometry.getAttribute('normal')
  expect(colors.itemSize).toBe(4)
  expect(colors.getW(0)).toBeGreaterThan(0)
  for (let index = 41; index < colors.count; index += 1) expect(colors.getW(index)).toBe(0)
  for (let index = 0; index < normals.count; index += 1)
    expect(normals.getY(index)).toBeGreaterThan(0)
  geometry.dispose()
})

test('landscape height sampling agrees with terrain vertices, including the cliff edge', () => {
  const geometry = createTerrainGeometry(PALETTE, 40, 12)
  const positions = geometry.getAttribute('position')
  for (let index = 0; index < 1 + 40 * 12; index++) {
    expect(terrainSurfaceHeightAt(positions.getX(index), positions.getZ(index))).toBeCloseTo(
      positions.getY(index),
      4
    )
  }
  geometry.dispose()
})

test('every landmark has an entrance connected to the garden trail network', () => {
  const entrances = LANDSCAPE_ROUTES.slice(2)
  for (const { position } of Object.values(WORLD_PLACEMENTS)) {
    const entrance = entrances.find(
      (route) => route.getPoint(0).distanceTo(new Vector3(position[0], 0, position[2])) < 0.01
    )
    expect(entrance).toBeDefined()
    const end = entrance!.getPoint(1)
    const network = LANDSCAPE_ROUTES.slice(0, 2).flatMap((route) => route.getSpacedPoints(300))
    expect(Math.min(...network.map((point) => point.distanceTo(end)))).toBeLessThan(0.4)
  }
})

test('garden paths face upward and stay above the rendered low terrain', () => {
  const terrain = createTerrainGeometry(PALETTE, 40, 12)
  const material = new MeshBasicMaterial()
  const mesh = new Mesh(terrain, material)
  mesh.updateMatrixWorld()
  const paths = createGardenPathsGeometry(PALETTE, createTerrainHeightSampler(terrain))
  const positions = paths.getAttribute('position')
  const normals = paths.getAttribute('normal')
  const ray = new Raycaster()
  for (let index = 0; index < positions.count; index++) {
    expect(normals.getY(index), `path normal ${index}`).toBeGreaterThan(0)
    ray.set(new Vector3(positions.getX(index), 20, positions.getZ(index)), new Vector3(0, -1, 0))
    const [hit] = ray.intersectObject(mesh)
    expect(hit, `path vertex ${index} has terrain beneath it`).toBeDefined()
    expect(positions.getY(index), `path vertex ${index} is visible`).toBeGreaterThan(hit.point.y)
  }
  paths.dispose()
  terrain.dispose()
  material.dispose()
})

test('landscape dressing preserves landmark pick areas and the low quality detail budget', () => {
  const details = createLandscapeDetails(68)
  expect(details).toEqual(createLandscapeDetails(68))
  expect(details).toHaveLength(68)
  expect(new Set(details.map(({ kind }) => kind)).size).toBe(4)
  for (const detail of details) {
    for (const { position, pickRadius } of Object.values(WORLD_PLACEMENTS)) {
      expect(Math.hypot(detail.x - position[0], detail.z - position[2])).toBeGreaterThan(
        pickRadius + 1
      )
    }
  }
  const geometry = createLandscapeDetailsGeometry(details)
  expect(geometry.getAttribute('position').count).toBe(68 * 4)
  expect(geometry.getIndex()!.count / 3).toBe(136)
  geometry.dispose()
})
