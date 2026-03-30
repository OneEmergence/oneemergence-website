'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import * as Sentry from '@sentry/nextjs'
import { useIntensityStore, type IntensityMode } from '@/stores/intensity'

/**
 * Tracks intensity mode changes as Sentry breadcrumbs.
 * Call once near the top of the component tree (e.g. inside IntensityProvider).
 */
export function useSentryIntensityBreadcrumbs() {
  const mode = useIntensityStore((s) => s.mode)
  const prevMode = useRef<IntensityMode | null>(null)

  useEffect(() => {
    if (prevMode.current !== null && prevMode.current !== mode) {
      Sentry.addBreadcrumb({
        category: 'intensity',
        message: `Intensity mode changed: ${prevMode.current} → ${mode}`,
        level: 'info',
        data: { from: prevMode.current, to: mode },
      })
    }
    prevMode.current = mode
  }, [mode])
}

/**
 * Tracks client-side route navigations as Sentry breadcrumbs.
 * Call once in a layout-level component.
 */
export function useSentryNavigationBreadcrumbs() {
  const pathname = usePathname()
  const prevPath = useRef<string | null>(null)

  useEffect(() => {
    if (prevPath.current !== null && prevPath.current !== pathname) {
      Sentry.addBreadcrumb({
        category: 'navigation',
        message: `Navigated to ${pathname}`,
        level: 'info',
        data: { from: prevPath.current, to: pathname },
        type: 'navigation',
      })
    }
    prevPath.current = pathname
  }, [pathname])
}

/**
 * Records a content view breadcrumb. Call from sacred content renderers.
 *
 * @example
 * addContentViewBreadcrumb('teaching', 'the-field-beneath-thought')
 */
export function addContentViewBreadcrumb(
  contentType: string,
  slug: string
) {
  Sentry.addBreadcrumb({
    category: 'content',
    message: `Viewed ${contentType}: ${slug}`,
    level: 'info',
    data: { contentType, slug },
  })
}
