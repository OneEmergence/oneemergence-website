'use client'

import { useSyncExternalStore } from 'react'

const FINE_POINTER_QUERY = '(pointer: fine)'

function subscribe(callback: () => void) {
  const mql = window.matchMedia(FINE_POINTER_QUERY)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function getSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches
}

/** Server renders as coarse so the first client render matches the markup. */
function getServerSnapshot() {
  return false
}

/**
 * True for mouse/trackpad, false for touch.
 *
 * Via `useSyncExternalStore` rather than reading `matchMedia` during render:
 * a bare read makes the server and the first client render disagree on touch
 * devices (a hydration mismatch on every parallax cover in the journal grid),
 * never updates when the pointer type changes, and re-runs the media query on
 * every render.
 */
export function useFinePointer(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
