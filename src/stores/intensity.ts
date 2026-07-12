'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Intensity modes control how much motion, sound, and visual complexity
 * the user experiences. This is both an accessibility feature and a
 * conscious design choice — the Still mode is a first-class experience.
 *
 * - Still: minimal motion (micro only), no sound, clean flat visuals
 * - Balanced: subtle transitions, optional ambient, moderate depth (default)
 * - Immersive: full WebGL, particles, sacred geometry, active soundscapes
 */
export type IntensityMode = 'still' | 'balanced' | 'immersive'

export type MotionLevel = 'micro' | 'flow' | 'sacred' | 'event'

interface IntensityState {
  /** Whether the persisted preference has finished hydrating on the client. */
  hasHydrated: boolean
  /** User-selected intensity mode */
  mode: IntensityMode
  /** Whether the OS/browser prefers reduced motion */
  prefersReducedMotion: boolean
  /** Resolved mode: overrides to 'still' when reduced motion is active */
  effectiveMode: IntensityMode
  /** Set the user's preferred intensity mode */
  setMode: (mode: IntensityMode) => void
  /** Called internally to sync the reduced-motion media query state */
  setPrefersReducedMotion: (prefers: boolean) => void
  /** Called by Zustand after the persisted preference has been restored. */
  finishHydration: () => void
}

function resolveEffectiveMode(
  mode: IntensityMode,
  prefersReducedMotion: boolean
): IntensityMode {
  if (prefersReducedMotion) return 'still'
  return mode
}

export const useIntensityStore = create<IntensityState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      mode: 'balanced',
      prefersReducedMotion: false,
      effectiveMode: 'balanced',

      setMode: (mode) =>
        set((state) => ({
          mode,
          effectiveMode: resolveEffectiveMode(mode, state.prefersReducedMotion),
        })),

      setPrefersReducedMotion: (prefers) =>
        set((state) => ({
          prefersReducedMotion: prefers,
          effectiveMode: resolveEffectiveMode(state.mode, prefers),
        })),

      finishHydration: () =>
        set((state) => ({
          hasHydrated: true,
          effectiveMode: resolveEffectiveMode(
            state.mode,
            state.prefersReducedMotion
          ),
        })),
    }),
    {
      name: 'oe-intensity-mode',
      partialize: (state) => ({ mode: state.mode }),
      // Recalculate the derived mode before CSS is allowed to load rich assets.
      onRehydrateStorage: () => (state) => {
        state?.finishHydration()
      },
    }
  )
)
