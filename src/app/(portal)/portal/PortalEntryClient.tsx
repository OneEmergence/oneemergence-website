'use client'

import { useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { Pause, Play } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { PortalAuth } from '@/features/auth'
import { useIntensityStore } from '@/stores/intensity'

interface NetworkConnection extends EventTarget {
  saveData?: boolean
}

function getConnection() {
  return (navigator as Navigator & { connection?: NetworkConnection }).connection
}

function subscribeToVideoCapability(onChange: () => void) {
  const media = window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)')
  const connection = getConnection()

  media.addEventListener('change', onChange)
  connection?.addEventListener('change', onChange)

  return () => {
    media.removeEventListener('change', onChange)
    connection?.removeEventListener('change', onChange)
  }
}

function canLoadVideo() {
  return (
    window.matchMedia('(min-width: 768px) and (prefers-reduced-motion: no-preference)').matches &&
    !getConnection()?.saveData
  )
}

export function PortalBackgroundVideo() {
  const t = useTranslations('auth.video')
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [hasFailed, setHasFailed] = useState(false)
  const deviceAllowsVideo = useSyncExternalStore(
    subscribeToVideoCapability,
    canLoadVideo,
    () => false
  )
  const hasHydrated = useIntensityStore((state) => state.hasHydrated)
  const effectiveMode = useIntensityStore((state) => state.effectiveMode)
  const showVideo = hasHydrated && deviceAllowsVideo && effectiveMode !== 'still'

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      void video.play().catch(() => setIsPaused(true))
    } else {
      video.pause()
    }
  }

  return (
    <div
      className="relative hidden min-h-[100dvh] overflow-hidden bg-oe-deep-space bg-[url('/media/auth/portal-poster.avif')] bg-cover bg-center md:block"
      data-motion-level="sacred"
      aria-hidden={!showVideo}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_42%,rgba(124,92,255,0.12),transparent_42%),linear-gradient(135deg,rgba(10,15,31,0.08),rgba(10,15,31,0.66))]" />
      {showVideo && !hasFailed ? (
        <video
          ref={videoRef}
          className="motion-sacred absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/media/auth/portal-poster.avif"
          tabIndex={-1}
          aria-hidden="true"
          onCanPlay={() => {
            setIsReady(true)
            setIsPaused(videoRef.current?.paused ?? true)
          }}
          onPlay={() => setIsPaused(false)}
          onPause={() => setIsPaused(true)}
          onError={() => {
            setHasFailed(true)
            setIsReady(false)
            setIsPaused(true)
          }}
        >
          <source src="/media/auth/portal-loop.webm" type="video/webm" />
          <source src="/media/auth/portal-loop.mp4" type="video/mp4" />
        </video>
      ) : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-oe-deep-space/70 via-transparent to-oe-deep-space/20" />
      {showVideo && isReady ? (
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPaused ? t('play') : t('pause')}
          aria-pressed={!isPaused}
          className="absolute bottom-6 right-6 flex min-h-11 min-w-11 items-center justify-center rounded-full border border-oe-pure-light/30 bg-oe-deep-space/90 text-oe-pure-light transition-colors hover:border-oe-solar-gold hover:text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
        >
          {isPaused ? (
            <Play className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Pause className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </div>
  )
}

export function PortalEntryClient() {
  const t = useTranslations('auth')

  return (
    <main
      id="main-content"
      className="grid min-h-[100dvh] bg-oe-depth-warm md:grid-cols-[42fr_58fr]"
    >
      <section className="relative flex min-h-[100dvh] flex-col px-5 py-6 sm:px-10 md:px-12 lg:px-16">
        <div
          className="mb-8 h-36 rounded-xl bg-oe-deep-space bg-[url('/media/auth/portal-poster.avif')] bg-cover bg-center md:hidden"
          aria-hidden="true"
        />

        <Link
          href="/"
          className="w-fit font-serif text-xl text-oe-solar-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
        >
          OneEmergence
        </Link>

        <div className="my-auto w-full max-w-md py-10">
          <header className="mb-9 space-y-3">
            <h1 className="max-w-sm font-serif text-4xl leading-[1.08] text-oe-pure-light md:text-5xl">
              {t('title')}
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-oe-pure-light/65 md:text-base">
              {t('intro')}
            </p>
          </header>

          <PortalAuth />
        </div>

        <footer className="flex flex-col gap-3 pb-2 text-xs text-oe-pure-light/50 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-xs leading-relaxed">{t('privacyNote')}</p>
          <Link
            href="/"
            className="w-fit text-oe-warm-sand/75 underline-offset-4 hover:text-oe-warm-sand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
          >
            {t('backToSite')}
          </Link>
        </footer>
      </section>

      <PortalBackgroundVideo />
    </main>
  )
}
