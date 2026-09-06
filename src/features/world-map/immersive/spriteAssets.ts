import type { WorldLandmarkId } from '../landmarks'

export interface IsometricSpriteAsset {
  src: string
  worldSize: readonly [width: number, height: number]
  anchor: readonly [xFromLeft: number, yFromTop: number]
  sortOffset: number
}

export const WORLD_SPRITE_ASSETS = {
  tree: {
    src: '/images/world-map/isometric/landmarks/tree/base.webp',
    worldSize: [11.7, 14],
    anchor: [0.5, 0.9],
    sortOffset: 0,
  },
  'root-home': {
    src: '/images/world-map/isometric/landmarks/root-home/base.webp',
    worldSize: [6.9, 7],
    anchor: [0.5, 0.88],
    sortOffset: 0,
  },
  earth: {
    src: '/images/world-map/isometric/landmarks/earth/base.webp',
    worldSize: [10.3, 8],
    anchor: [0.5, 0.88],
    sortOffset: 0,
  },
  council: {
    src: '/images/world-map/isometric/landmarks/council/base.webp',
    worldSize: [9, 7.3],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  noosphere: {
    src: '/images/world-map/isometric/landmarks/noosphere/base.webp',
    worldSize: [9.8, 6.1],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  ashram: {
    src: '/images/world-map/isometric/landmarks/ashram/base.webp',
    worldSize: [9, 8.2],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  energy: {
    src: '/images/world-map/isometric/landmarks/energy/base.webp',
    worldSize: [9.1, 7.2],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  creation: {
    src: '/images/world-map/isometric/landmarks/creation/base.webp',
    worldSize: [9.6, 7],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  exchange: {
    src: '/images/world-map/isometric/landmarks/exchange/base.webp',
    worldSize: [10, 5.8],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  'creation-temple': {
    src: '/images/world-map/isometric/landmarks/creation-temple/base.webp',
    worldSize: [7.3, 7.1],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  'solar-ark': {
    src: '/images/world-map/isometric/landmarks/solar-ark/base.webp',
    worldSize: [7.6, 5.5],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  'heart-caravan': {
    src: '/images/world-map/isometric/landmarks/heart-caravan/base.webp',
    worldSize: [5.8, 5],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  'voice-beacon': {
    src: '/images/world-map/isometric/landmarks/voice-beacon/base.webp',
    worldSize: [4.3, 8],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  observatory: {
    src: '/images/world-map/isometric/landmarks/observatory/base.webp',
    worldSize: [7.3, 7.4],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
  'cosmic-control': {
    src: '/images/world-map/isometric/landmarks/cosmic-control/base.webp',
    worldSize: [7.8, 8],
    anchor: [0.5, 0.94],
    sortOffset: 0,
  },
} as const satisfies Record<WorldLandmarkId, IsometricSpriteAsset>

export function toThreeSpriteCenter([
  xFromLeft,
  yFromTop,
]: IsometricSpriteAsset['anchor']): readonly [number, number] {
  return [xFromLeft, 1 - yFromTop]
}

export function isometricRenderOrder([x, , z]: readonly [number, number, number], sortOffset = 0) {
  const gridX = Math.round(x / 2)
  const gridZ = Math.round(z / 2)
  return (gridX + gridZ) * 4096 + gridX + sortOffset
}
