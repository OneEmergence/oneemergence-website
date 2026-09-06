export interface WorldScenePalette {
  deepSpace: string
  cosmic: string
  solarpunk: string
  warmDepth: string
  violet: string
  gold: string
  cyan: string
  light: string
  green: string
  warmSand: string
}

const TOKENS: Record<keyof WorldScenePalette, string> = {
  deepSpace: '--color-oe-deep-space',
  cosmic: '--color-oe-depth-cosmic',
  solarpunk: '--color-oe-depth-solarpunk',
  warmDepth: '--color-oe-depth-warm',
  violet: '--color-oe-aurora-violet',
  gold: '--color-oe-solar-gold',
  cyan: '--color-oe-spirit-cyan',
  light: '--color-oe-pure-light',
  green: '--color-oe-living-green',
  warmSand: '--color-oe-warm-sand',
}

// Canvas boots after hydration, but these keep a valid first frame if a custom
// theme temporarily omits a token. Values mirror globals.css exactly.
const FALLBACKS: WorldScenePalette = {
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

export function readWorldScenePalette(): WorldScenePalette {
  const styles = getComputedStyle(document.documentElement)

  return Object.fromEntries(
    Object.entries(TOKENS).map(([key, token]) => [
      key,
      styles.getPropertyValue(token).trim() || FALLBACKS[key as keyof WorldScenePalette],
    ])
  ) as unknown as WorldScenePalette
}
