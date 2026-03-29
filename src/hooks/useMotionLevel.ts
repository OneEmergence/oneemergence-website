'use client'

import { useIntensityStore, type MotionLevel } from '@/stores/intensity'

/**
 * Motion hierarchy gate. Returns true if the current effective intensity
 * mode allows animation at the given motion level.
 *
 * Motion levels (from VISION.md):
 * - micro:  feedback, affordance (always allowed)
 * - flow:   navigation, continuity (balanced + immersive)
 * - sacred: contemplation, presence (balanced + immersive)
 * - event:  ceremony, threshold (immersive only)
 */

const ALLOWED_LEVELS: Record<string, Set<MotionLevel>> = {
  still: new Set(['micro']),
  balanced: new Set(['micro', 'flow', 'sacred']),
  immersive: new Set(['micro', 'flow', 'sacred', 'event']),
}

export function useMotionLevel(level: MotionLevel): boolean {
  const effectiveMode = useIntensityStore((s) => s.effectiveMode)
  return ALLOWED_LEVELS[effectiveMode].has(level)
}
