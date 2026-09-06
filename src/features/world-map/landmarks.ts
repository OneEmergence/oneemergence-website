export type WorldMapLayer = 'center' | 'journey'

export interface WorldLandmark {
  id: string
  layer: WorldMapLayer | 'origin'
  x: number
  y: number
  href?: string
  step?: number
}

export const WORLD_LANDMARKS = [
  { id: 'tree', layer: 'origin', x: 48, y: 42 },
  { id: 'council', layer: 'center', x: 19, y: 26, href: '/manifesto' },
  { id: 'noosphere', layer: 'center', x: 67, y: 23, href: '/library' },
  { id: 'ashram', layer: 'center', x: 82, y: 39, href: '/experiences' },
  { id: 'energy', layer: 'center', x: 15, y: 44, href: '/manifesto' },
  { id: 'earth', layer: 'center', x: 80, y: 58, href: '/community' },
  { id: 'creation', layer: 'center', x: 17, y: 64, href: '/experiences' },
  { id: 'exchange', layer: 'center', x: 71, y: 77, href: '/community' },
  { id: 'root-home', layer: 'journey', x: 38, y: 85, href: '/portal', step: 1 },
  {
    id: 'creation-temple',
    layer: 'journey',
    x: 25,
    y: 68,
    href: '/experiences',
    step: 2,
  },
  {
    id: 'solar-ark',
    layer: 'journey',
    x: 51,
    y: 80,
    href: '/manifesto',
    step: 3,
  },
  {
    id: 'heart-caravan',
    layer: 'journey',
    x: 50,
    y: 63,
    href: '/community',
    step: 4,
  },
  {
    id: 'voice-beacon',
    layer: 'journey',
    x: 48,
    y: 16,
    href: '/contact',
    step: 5,
  },
  {
    id: 'observatory',
    layer: 'journey',
    x: 35,
    y: 10,
    href: '/library',
    step: 6,
  },
  {
    id: 'cosmic-control',
    layer: 'journey',
    x: 48,
    y: 5,
    href: '/portal',
    step: 7,
  },
] as const satisfies readonly WorldLandmark[]

export type WorldLandmarkId = (typeof WORLD_LANDMARKS)[number]['id']
