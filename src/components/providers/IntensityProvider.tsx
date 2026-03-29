'use client'

import { useEffect } from 'react'
import { useIntensityStore } from '@/stores/intensity'
import { useReducedMotion } from '@/hooks/useReducedMotion'

/**
 * IntensityProvider — Client island that:
 * 1. Syncs the OS prefers-reduced-motion media query into the Zustand store
 * 2. Sets a `data-intensity` attribute on <html> for CSS-based intensity gating
 *
 * Mount once in the root layout. Does not render children differently —
 * it's a side-effect-only provider.
 */
export function IntensityProvider({ children }: { children: React.ReactNode }) {
  const prefersReducedMotion = useReducedMotion()
  const setPrefersReducedMotion = useIntensityStore(
    (s: { setPrefersReducedMotion: (prefers: boolean) => void }) => s.setPrefersReducedMotion
  )
  const effectiveMode = useIntensityStore((s: { effectiveMode: string }) => s.effectiveMode)

  // Sync reduced-motion preference into the store
  useEffect(() => {
    setPrefersReducedMotion(prefersReducedMotion)
  }, [prefersReducedMotion, setPrefersReducedMotion])

  // Mirror effective mode onto <html> for CSS selectors
  // e.g. html[data-intensity="still"] .some-animation { display: none; }
  useEffect(() => {
    document.documentElement.setAttribute('data-intensity', effectiveMode)
  }, [effectiveMode])

  return <>{children}</>
}
