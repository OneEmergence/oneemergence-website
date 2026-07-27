'use client'

import { useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import { useIntensityStore } from '@/stores/intensity'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import {
  useSentryIntensityBreadcrumbs,
  useSentryNavigationBreadcrumbs,
} from '@/lib/analytics/sentry-breadcrumbs'

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
  const hasHydrated = useIntensityStore((s: { hasHydrated: boolean }) => s.hasHydrated)

  // Sentry observability: breadcrumbs for intensity changes and route navigations
  useSentryIntensityBreadcrumbs()
  useSentryNavigationBreadcrumbs()

  // Sync reduced-motion preference into the store
  useEffect(() => {
    setPrefersReducedMotion(prefersReducedMotion)
  }, [prefersReducedMotion, setPrefersReducedMotion])

  // Mirror effective mode onto <html> for CSS selectors
  // e.g. html[data-intensity="still"] .some-animation { display: none; }
  //
  // The attribute is NOT removed before hydration: the inline script in
  // src/app/layout.tsx has already written the correct value pre-paint, and
  // clearing it here would reintroduce the flash of full-motion styling that
  // script exists to prevent. Once hydrated the store is authoritative.
  useEffect(() => {
    if (!hasHydrated) return
    document.documentElement.setAttribute('data-intensity', effectiveMode)
  }, [effectiveMode, hasHydrated])

  // The CSS gates in globals.css cannot reach framer-motion — it animates via
  // WAAPI and rAF. `MotionConfig reducedMotion="always"` is the one switch
  // that does: it neutralises transform and layout animation across every
  // motion component while leaving opacity and colour (the Micro level)
  // intact. `useMotionLevel` stays the per-component gate on top of this.
  return (
    <MotionConfig reducedMotion={effectiveMode === 'still' ? 'always' : 'never'}>
      {children}
    </MotionConfig>
  )
}
