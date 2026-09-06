'use client'

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ErrorInfo,
  type ReactNode,
} from 'react'
import dynamic from 'next/dynamic'
import * as Sentry from '@sentry/nextjs'
import { Cuboid, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMotionLevel } from '@/hooks/useMotionLevel'
import { ImmersiveWorldMap } from '../components/WorldMap'
import {
  createResonanceSession,
  parseResonanceSession,
  reduceResonanceSession,
  RESONANCE_SESSION_STORAGE_KEY,
  type ResonanceSessionCommand,
} from './game'

const ImmersiveThreeWorld = dynamic(
  () => import('./ImmersiveThreeWorld').then((module) => module.ImmersiveThreeWorld),
  { ssr: false, loading: () => null }
)

interface SceneErrorBoundaryProps {
  children: ReactNode
  onFailure: () => void
}

class SceneErrorBoundary extends Component<SceneErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    })
    this.props.onFailure()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function supportsWebGL2() {
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    context?.getExtension('WEBGL_lose_context')?.loseContext()
    return context !== null
  } catch {
    return false
  }
}

let cachedWebglSupport: boolean | undefined

function subscribeWebglSupport() {
  return () => undefined
}

function getWebglSupport() {
  cachedWebglSupport ??= supportsWebGL2()
  return cachedWebglSupport
}

function getServerWebglSupport() {
  return false
}

export function ImmersiveMapBoundary() {
  const t = useTranslations('worldMap.immersive3d')
  const allows3d = useMotionLevel('flow')
  const webglSupported = useSyncExternalStore(
    subscribeWebglSupport,
    getWebglSupport,
    getServerWebglSupport
  )
  const [prefer2d, setPrefer2d] = useState(false)
  const [sceneStatus, setSceneStatus] = useState<'loading' | 'ready' | 'failed'>('loading')
  const [attempt, setAttempt] = useState(0)
  const [session, setSession] = useState(createResonanceSession)
  const [storageReady, setStorageReady] = useState(false)
  const returnButtonRef = useRef<HTMLButtonElement>(null)
  const dispatch = useCallback((command: ResonanceSessionCommand) => {
    setSession((current) => reduceResonanceSession(current, command))
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(RESONANCE_SESSION_STORAGE_KEY)
        const restored = stored ? parseResonanceSession(stored) : null
        if (restored) setSession(restored)
      } catch {
        // Storage may be unavailable in private browsing or hardened environments.
      } finally {
        setStorageReady(true)
      }
    }, 0)

    return () => window.clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!storageReady) return

    try {
      if (session.revision === 0) {
        window.localStorage.removeItem(RESONANCE_SESSION_STORAGE_KEY)
      } else {
        window.localStorage.setItem(RESONANCE_SESSION_STORAGE_KEY, JSON.stringify(session))
      }
    } catch {
      // The campaign remains playable when storage is unavailable or full.
    }
  }, [session, storageReady])

  const canOffer3d = allows3d && webglSupported
  const showScene = storageReady && canOffer3d && !prefer2d && sceneStatus !== 'failed'
  const showFallback = !showScene || sceneStatus !== 'ready'

  function returnTo3d() {
    setSceneStatus('loading')
    setPrefer2d(false)
    setAttempt((current) => current + 1)
  }

  function focusReturnButton() {
    requestAnimationFrame(() => returnButtonRef.current?.focus())
  }

  function handleFailure() {
    setSceneStatus('failed')
    focusReturnButton()
  }

  function handleUse2d() {
    setPrefer2d(true)
    focusReturnButton()
  }

  function handleReady() {
    setSceneStatus('ready')
    if (attempt > 0) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-camera-surface]')?.focus()
      })
    }
  }

  return (
    <div
      data-world-scene-status={sceneStatus}
      data-world-storage-ready={storageReady}
      data-world-renderer={showScene ? (sceneStatus === 'ready' ? '3d' : 'loading') : '2d'}
      className="relative h-dvh overflow-hidden bg-oe-deep-space"
    >
      {showFallback ? <ImmersiveWorldMap /> : null}

      {showScene ? (
        <div
          data-motion-level="flow"
          className={
            sceneStatus === 'ready'
              ? 'absolute inset-0 z-10 opacity-100'
              : 'pointer-events-none absolute inset-0 z-10 opacity-0'
          }
        >
          <SceneErrorBoundary key={attempt} onFailure={handleFailure}>
            <ImmersiveThreeWorld
              session={session}
              dispatch={dispatch}
              onReady={handleReady}
              onFailure={handleFailure}
              onUse2d={handleUse2d}
            />
          </SceneErrorBoundary>
        </div>
      ) : null}

      {canOffer3d && (prefer2d || sceneStatus === 'failed') ? (
        <button
          ref={returnButtonRef}
          type="button"
          autoFocus
          data-motion-level="micro"
          onClick={returnTo3d}
          className="fixed bottom-4 right-4 z-50 inline-flex min-h-11 items-center gap-2 rounded-full border border-oe-spirit-cyan/35 bg-oe-deep-space/95 px-4 text-sm text-oe-spirit-cyan backdrop-blur-md transition-colors hover:bg-oe-spirit-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
        >
          {sceneStatus === 'failed' ? (
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Cuboid className="h-4 w-4" aria-hidden="true" />
          )}
          {sceneStatus === 'failed' ? t('retry3d') : t('use3d')}
        </button>
      ) : null}
    </div>
  )
}
