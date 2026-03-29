'use client'

import { useIntensityStore, type IntensityMode } from '@/stores/intensity'

/**
 * Convenience hook for reading and setting the intensity mode.
 * Returns the effective mode (respects prefers-reduced-motion override)
 * and the setter for the user's preferred mode.
 */
export function useIntensityMode(): {
  mode: IntensityMode
  effectiveMode: IntensityMode
  setMode: (mode: IntensityMode) => void
} {
  const mode = useIntensityStore((s) => s.mode)
  const effectiveMode = useIntensityStore((s) => s.effectiveMode)
  const setMode = useIntensityStore((s) => s.setMode)

  return { mode, effectiveMode, setMode }
}
