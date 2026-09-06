'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { select } from 'd3-selection'
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior, type ZoomTransform } from 'd3-zoom'
import {
  ArrowLeft,
  ArrowUpRight,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Heart,
  House,
  Landmark as LandmarkIcon,
  Layers3,
  LocateFixed,
  Maximize2,
  Minus,
  Mountain,
  Orbit,
  Palette,
  Plus,
  RadioTower,
  Sailboat,
  Ship,
  Sparkles,
  Sprout,
  Telescope,
  TreePine,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useMotionLevel } from '@/hooks/useMotionLevel'
import { cn } from '@/lib/utils'
import {
  WORLD_LANDMARKS,
  type WorldLandmark,
  type WorldLandmarkId,
  type WorldMapLayer,
} from '../landmarks'

const MAP_WIDTH = 1600
const MAP_HEIGHT = 900
const MIN_SCALE = 0.45
const MAX_SCALE = 2.5
const DETAILS_ID = 'world-map-landmark-details'

const CENTER_PATHS = WORLD_LANDMARKS.filter((landmark) => landmark.layer === 'center')
const JOURNEY_PATH = WORLD_LANDMARKS.filter((landmark) => landmark.layer === 'journey')
  .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
  .map((landmark) => `${landmark.x * 16},${landmark.y * 9}`)
  .join(' ')
const TREE = WORLD_LANDMARKS[0]

const LANDMARK_ICONS: Record<WorldLandmarkId, LucideIcon> = {
  tree: TreePine,
  council: LandmarkIcon,
  noosphere: BrainCircuit,
  ashram: Mountain,
  energy: Wind,
  earth: Sprout,
  creation: Palette,
  exchange: Ship,
  'root-home': House,
  'creation-temple': Droplets,
  'solar-ark': Sailboat,
  'heart-caravan': Heart,
  'voice-beacon': RadioTower,
  observatory: Telescope,
  'cosmic-control': Orbit,
}

type MapLandmark = (typeof WORLD_LANDMARKS)[number]
type WorldMapPresentation = 'overview' | 'immersive'

function toMapPosition(landmark: WorldLandmark) {
  return {
    left: `${landmark.x}%`,
    top: `${landmark.y}%`,
  }
}

export function WorldMap() {
  return <WorldMapExperience presentation="overview" />
}

export function ImmersiveWorldMap() {
  return <WorldMapExperience presentation="immersive" />
}

function WorldMapExperience({ presentation }: { presentation: WorldMapPresentation }) {
  const t = useTranslations('worldMap')
  const immersive = presentation === 'immersive'
  const viewportRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity)
  const [selectedId, setSelectedId] = useState<WorldLandmarkId | null>(null)
  const [visibleLayers, setVisibleLayers] = useState<Set<WorldMapLayer>>(
    new Set(['center', 'journey'])
  )
  const canFlow = useMotionLevel('flow')
  const canSacred = useMotionLevel('sacred')

  const visibleLandmarks = useMemo(
    () =>
      WORLD_LANDMARKS.filter(
        (landmark) => landmark.layer === 'origin' || visibleLayers.has(landmark.layer)
      ),
    [visibleLayers]
  )

  const selected: WorldLandmark | null =
    WORLD_LANDMARKS.find((landmark) => landmark.id === selectedId) ?? null
  const selectedSequence = selected
    ? WORLD_LANDMARKS.filter((landmark) => landmark.layer === selected.layer)
    : []
  const selectedIndex = selected
    ? selectedSequence.findIndex((landmark) => landmark.id === selected.id)
    : -1
  const SelectedIcon = selectedId ? LANDMARK_ICONS[selectedId] : TreePine

  const resetView = useCallback(() => {
    const viewport = viewportRef.current
    const zoom = zoomRef.current
    if (!viewport || !zoom) return

    const { width, height } = viewport.getBoundingClientRect()
    const scale = Math.max(Math.min(width / MAP_WIDTH, height / MAP_HEIGHT) * 0.94, MIN_SCALE)
    const next = zoomIdentity
      .translate((width - MAP_WIDTH * scale) / 2, (height - MAP_HEIGHT * scale) / 2)
      .scale(scale)

    select(viewport).call(zoom.transform, next)
  }, [])

  const closeDetails = useCallback(() => {
    setSelectedId(null)
    requestAnimationFrame(() => {
      if (triggerRef.current?.isConnected) triggerRef.current.focus()
    })
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const zoom = d3Zoom<HTMLDivElement, unknown>()
      .scaleExtent([MIN_SCALE, MAX_SCALE])
      .on('zoom', (event) => setTransform(event.transform))

    select(viewport).call(zoom).on('dblclick.zoom', null)
    zoomRef.current = zoom
    resetView()

    const observer = new ResizeObserver(resetView)
    observer.observe(viewport)

    return () => {
      observer.disconnect()
      select(viewport).on('.zoom', null)
      zoomRef.current = null
    }
  }, [resetView])

  useEffect(() => {
    if (!selectedId) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDetails()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeDetails, selectedId])

  function zoomBy(factor: number) {
    const viewport = viewportRef.current
    const zoom = zoomRef.current
    if (viewport && zoom) select(viewport).call(zoom.scaleBy, factor)
  }

  function openLandmark(landmark: MapLandmark, trigger?: HTMLButtonElement) {
    if (trigger) triggerRef.current = trigger
    setSelectedId(landmark.id)

    if (!selectedId) {
      requestAnimationFrame(() => closeButtonRef.current?.focus({ preventScroll: true }))
    }
  }

  function centerLandmark(landmark: MapLandmark) {
    const viewport = viewportRef.current
    const zoom = zoomRef.current
    if (!viewport || !zoom) return

    const { width, height } = viewport.getBoundingClientRect()
    const scale = Math.max(transform.k, 0.8)
    const x = (landmark.x / 100) * MAP_WIDTH
    const y = (landmark.y / 100) * MAP_HEIGHT
    const next = zoomIdentity.translate(width / 2 - x * scale, height / 2 - y * scale).scale(scale)

    select(viewport).call(zoom.transform, next)
  }

  function focusLandmark(landmark: MapLandmark, trigger?: HTMLButtonElement) {
    openLandmark(landmark, trigger)
    centerLandmark(landmark)
    viewportRef.current?.scrollIntoView({
      behavior: canFlow ? 'smooth' : 'auto',
      block: 'center',
    })
  }

  function toggleLayer(layer: WorldMapLayer) {
    setVisibleLayers((current) => {
      const next = new Set(current)
      if (next.has(layer)) next.delete(layer)
      else next.add(layer)
      return next
    })

    if (selected?.layer === layer) {
      triggerRef.current = null
      setSelectedId(null)
    }
  }

  function selectSibling(direction: -1 | 1) {
    if (selectedIndex < 0) return
    const index = (selectedIndex + direction + selectedSequence.length) % selectedSequence.length
    focusLandmark(selectedSequence[index])
  }

  return (
    <section
      className={cn(
        'bg-oe-deep-space text-oe-pure-light',
        immersive ? 'h-dvh overflow-hidden' : 'px-4 pb-20 pt-28 sm:px-6'
      )}
    >
      <div className={immersive ? 'h-full' : 'mx-auto max-w-[96rem]'}>
        {immersive ? (
          <>
            <h1 className="sr-only">{t('title')}</h1>
            <Link
              href="/map"
              data-motion-level="micro"
              className="absolute right-4 top-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-full border border-oe-pure-light/15 bg-oe-deep-space/90 px-4 text-sm text-oe-pure-light backdrop-blur-md transition-colors hover:bg-oe-pure-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-pure-light"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t('immersive.exit')}
            </Link>
          </>
        ) : (
          <header className="mb-7 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-oe-spirit-cyan">
                {t('eyebrow')}
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-none text-oe-pure-light sm:text-6xl">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-oe-pure-light/60 sm:text-base">
                {t('intro')}
              </p>
            </div>
            <Link
              href="/map/immersive"
              prefetch={false}
              data-motion-level="micro"
              className="group inline-flex min-h-12 w-fit items-center gap-3 rounded-full border border-oe-solar-gold/40 bg-oe-solar-gold/[0.08] px-6 text-sm font-medium text-oe-solar-gold transition-colors hover:bg-oe-solar-gold/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
            >
              <Maximize2
                className="h-4 w-4 transition-transform group-hover:scale-110"
                aria-hidden="true"
              />
              {t('immersive.enter')}
            </Link>
          </header>
        )}

        <div
          className={cn(
            'relative overflow-hidden bg-oe-depth-cosmic',
            immersive ? 'h-full' : 'rounded-2xl border border-oe-pure-light/10'
          )}
        >
          <div
            ref={viewportRef}
            role="region"
            aria-label={t('mapAria')}
            className={cn(
              'relative cursor-grab touch-none overflow-hidden active:cursor-grabbing',
              immersive ? 'h-dvh' : 'h-[68svh] min-h-[32rem] lg:h-[min(76svh,54rem)]'
            )}
          >
            <div
              className="absolute left-0 top-0 h-[900px] w-[1600px] origin-top-left"
              style={{
                transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
              }}
            >
              <MapTerrain
                showCenters={visibleLayers.has('center')}
                showJourney={visibleLayers.has('journey')}
                selectedId={selectedId}
                canSacred={canSacred}
              />

              {visibleLandmarks.map((landmark) => {
                const active = landmark.id === selectedId
                const Icon = LANDMARK_ICONS[landmark.id]

                return (
                  <button
                    key={landmark.id}
                    type="button"
                    data-motion-level="micro"
                    aria-expanded={active}
                    aria-controls={DETAILS_ID}
                    aria-label={t(`landmarks.${landmark.id}.name`)}
                    onPointerDown={(event) => event.stopPropagation()}
                    onFocus={(event) => {
                      if (event.currentTarget.matches(':focus-visible')) {
                        centerLandmark(landmark)
                      }
                    }}
                    onClick={(event) => openLandmark(landmark, event.currentTarget)}
                    className={cn(
                      'group absolute z-10 flex h-16 w-16 items-center justify-center rounded-full text-oe-pure-light focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-oe-pure-light',
                      active &&
                        (landmark.layer === 'origin'
                          ? 'glow-gold'
                          : landmark.layer === 'center'
                            ? 'glow-cyan'
                            : 'glow-violet')
                    )}
                    style={{
                      ...toMapPosition(landmark),
                      transform: `translate(-50%, -50%) scale(${1 / transform.k})`,
                    }}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute inset-2 rounded-full border bg-oe-deep-space/80 backdrop-blur-md transition-colors',
                        landmark.layer === 'origin'
                          ? 'border-oe-solar-gold/70'
                          : landmark.layer === 'center'
                            ? 'border-oe-spirit-cyan/55'
                            : 'border-oe-aurora-violet/70',
                        active && 'bg-oe-deep-space'
                      )}
                    />
                    <Icon
                      className={cn(
                        'relative h-5 w-5',
                        landmark.layer === 'origin'
                          ? 'text-oe-solar-gold'
                          : landmark.layer === 'center'
                            ? 'text-oe-spirit-cyan'
                            : 'text-oe-aurora-violet-ink'
                      )}
                      aria-hidden="true"
                    />
                    {landmark.layer === 'journey' && (
                      <span className="absolute right-0.5 top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-oe-aurora-violet-deep px-1 text-[0.65rem] font-semibold text-white">
                        {landmark.step}
                      </span>
                    )}
                    <span className="pointer-events-none absolute left-1/2 top-[calc(100%+0.35rem)] w-max max-w-48 -translate-x-1/2 rounded-full border border-oe-pure-light/10 bg-oe-deep-space/95 px-3 py-1.5 text-xs text-oe-pure-light opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      {t(`landmarks.${landmark.id}.name`)}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className={cn('absolute left-4 z-20', immersive ? 'top-20 sm:top-4' : 'top-4')}>
              <div
                role="group"
                aria-label={t('layers.label')}
                className="flex rounded-full border border-oe-pure-light/10 bg-oe-deep-space/90 p-1 backdrop-blur-md"
              >
                {(['center', 'journey'] as const).map((layer) => (
                  <button
                    key={layer}
                    type="button"
                    data-motion-level="micro"
                    aria-pressed={visibleLayers.has(layer)}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => toggleLayer(layer)}
                    className={cn(
                      'min-h-11 rounded-full px-3 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-pure-light',
                      visibleLayers.has(layer)
                        ? 'bg-oe-pure-light/10 text-oe-pure-light'
                        : 'text-oe-pure-light/55'
                    )}
                  >
                    {t(`layers.${layer}`)}
                  </button>
                ))}
              </div>
            </div>

            {!immersive && (
              <div className="pointer-events-none absolute right-4 top-4 z-20 hidden items-center gap-2 rounded-full border border-oe-pure-light/10 bg-oe-deep-space/75 px-4 py-2 text-xs text-oe-pure-light/70 backdrop-blur-md md:flex">
                <Sparkles className="h-4 w-4 text-oe-solar-gold" aria-hidden="true" />
                {t('interactionHint')}
              </div>
            )}

            <div className="absolute bottom-4 left-4 z-20 flex gap-1 rounded-full border border-oe-pure-light/10 bg-oe-deep-space/90 p-1 backdrop-blur-md">
              <MapControl label={t('controls.zoomIn')} onClick={() => zoomBy(1.25)}>
                <Plus className="h-4 w-4" aria-hidden="true" />
              </MapControl>
              <MapControl label={t('controls.zoomOut')} onClick={() => zoomBy(0.8)}>
                <Minus className="h-4 w-4" aria-hidden="true" />
              </MapControl>
              <MapControl label={t('controls.reset')} onClick={resetView}>
                <LocateFixed className="h-4 w-4" aria-hidden="true" />
              </MapControl>
            </div>
          </div>

          <AnimatePresence>
            {selected && selectedId && (
              <motion.aside
                key="landmark-details"
                id={DETAILS_ID}
                role="region"
                aria-live="polite"
                aria-atomic="true"
                aria-labelledby="world-map-landmark-title"
                data-motion-level="flow"
                initial={canFlow ? { opacity: 0, y: 20, scale: 0.98 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={canFlow ? { opacity: 0, y: 20, scale: 0.98 } : undefined}
                transition={{
                  duration: 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100svh-1.5rem)] overflow-x-hidden overflow-y-auto rounded-[1.75rem] border border-oe-pure-light/15 bg-oe-deep-space/95 p-6 backdrop-blur-xl lg:absolute lg:bottom-5 lg:left-auto lg:right-5 lg:top-5 lg:w-[24rem] lg:max-h-none"
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    'pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl',
                    selected.layer === 'origin'
                      ? 'bg-oe-solar-gold/15'
                      : selected.layer === 'center'
                        ? 'bg-oe-spirit-cyan/15'
                        : 'bg-oe-aurora-violet/20'
                  )}
                />

                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={cn(
                        'grid h-14 w-14 shrink-0 place-items-center rounded-2xl border bg-oe-pure-light/[0.04]',
                        selected.layer === 'origin'
                          ? 'border-oe-solar-gold/35 text-oe-solar-gold'
                          : selected.layer === 'center'
                            ? 'border-oe-spirit-cyan/35 text-oe-spirit-cyan'
                            : 'border-oe-aurora-violet/40 text-oe-aurora-violet-ink'
                      )}
                    >
                      <SelectedIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <button
                      ref={closeButtonRef}
                      type="button"
                      data-motion-level="micro"
                      onClick={() => closeDetails()}
                      aria-label={t('controls.close')}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-oe-pure-light/60 transition-colors hover:bg-oe-pure-light/5 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-pure-light"
                    >
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>

                  <p className="mt-6 text-[0.65rem] font-medium uppercase tracking-[0.24em] text-oe-spirit-cyan">
                    {selected.step ? `${String(selected.step).padStart(2, '0')} · ` : null}
                    {t(`categories.${selected.layer}`)}
                  </p>
                  <h2
                    id="world-map-landmark-title"
                    className="mt-2 max-w-xs font-serif text-3xl leading-[1.05] text-oe-pure-light sm:text-4xl"
                  >
                    {t(`landmarks.${selected.id}.name`)}
                  </h2>

                  <div className="mt-5 flex items-center gap-2" aria-hidden="true">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        selected.layer === 'origin'
                          ? 'bg-oe-solar-gold'
                          : selected.layer === 'center'
                            ? 'bg-oe-spirit-cyan'
                            : 'bg-oe-aurora-violet'
                      )}
                    />
                    <span className="h-px flex-1 bg-oe-pure-light/10" />
                  </div>

                  <p className="mt-5 text-sm leading-7 text-oe-pure-light/68">
                    {t(`landmarks.${selected.id}.description`)}
                  </p>

                  {'href' in selected && selected.href && (
                    <Link
                      href={selected.href}
                      data-motion-level="micro"
                      className="mt-7 inline-flex min-h-11 w-full items-center justify-between rounded-full border border-oe-solar-gold/35 bg-oe-solar-gold/[0.06] px-5 text-sm text-oe-solar-gold transition-colors hover:bg-oe-solar-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
                    >
                      {t('exploreCta')}
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}

                  {selectedSequence.length > 1 && (
                    <div className="mt-7 flex items-center justify-between border-t border-oe-pure-light/10 pt-4">
                      <MapControl label={t('controls.previous')} onClick={() => selectSibling(-1)}>
                        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                      </MapControl>
                      <span className="text-xs tabular-nums text-oe-pure-light/50">
                        {String(selectedIndex + 1).padStart(2, '0')} /{' '}
                        {String(selectedSequence.length).padStart(2, '0')}
                      </span>
                      <MapControl label={t('controls.next')} onClick={() => selectSibling(1)}>
                        <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </MapControl>
                    </div>
                  )}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>

        {!immersive && (
          <div className="mt-14">
            <div className="flex items-center gap-3">
              <Layers3 className="h-5 w-5 text-oe-spirit-cyan" aria-hidden="true" />
              <h2 className="font-serif text-3xl text-oe-pure-light">{t('directory.title')}</h2>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-oe-pure-light/55">
              {t('directory.description')}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {WORLD_LANDMARKS.map((landmark) => {
                const Icon = LANDMARK_ICONS[landmark.id]
                const active = landmark.id === selectedId

                return (
                  <button
                    key={landmark.id}
                    type="button"
                    data-motion-level="micro"
                    aria-expanded={active}
                    aria-controls={DETAILS_ID}
                    onClick={(event) => focusLandmark(landmark, event.currentTarget)}
                    className={cn(
                      'group flex min-h-20 items-center gap-4 rounded-2xl border bg-oe-pure-light/[0.03] px-4 py-4 text-left transition-colors hover:border-oe-spirit-cyan/30 hover:bg-oe-pure-light/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan',
                      active ? 'border-oe-spirit-cyan/40' : 'border-oe-pure-light/10'
                    )}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-oe-pure-light/10 bg-oe-deep-space/60 text-oe-pure-light/65 transition-colors group-hover:text-oe-spirit-cyan">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-oe-pure-light/55">
                        {t(`categories.${landmark.layer}`)}
                      </span>
                      <span className="mt-1 block font-serif text-lg leading-tight text-oe-pure-light">
                        {t(`landmarks.${landmark.id}.name`)}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

function MapTerrain({
  showCenters,
  showJourney,
  selectedId,
  canSacred,
}: {
  showCenters: boolean
  showJourney: boolean
  selectedId: WorldLandmarkId | null
  canSacred: boolean
}) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Image
        src="/images/world-map/world-map-river-master.png"
        alt=""
        width={1672}
        height={941}
        priority
        quality={75}
        sizes="(min-width: 1536px) 1536px, 100vw"
        draggable={false}
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-oe-deep-space/10 via-transparent to-oe-deep-space/35" />
      <svg
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        className="absolute inset-0"
      >
        {showCenters &&
          CENTER_PATHS.map((landmark) => {
            const active = landmark.id === selectedId
            return (
              <line
                key={landmark.id}
                x1={TREE.x * 16}
                y1={TREE.y * 9}
                x2={landmark.x * 16}
                y2={landmark.y * 9}
                className={active ? 'stroke-oe-spirit-cyan/65' : 'stroke-oe-spirit-cyan/18'}
                strokeWidth={active ? 3 : 2}
                strokeDasharray="5 12"
              />
            )
          })}
        {showJourney && (
          <>
            <polyline
              points={JOURNEY_PATH}
              className="fill-none stroke-oe-aurora-violet/10"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={JOURNEY_PATH}
              className="fill-none stroke-oe-aurora-violet/50"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 12"
            />
          </>
        )}
        <motion.g
          data-motion-level="sacred"
          animate={canSacred ? { opacity: [0.45, 0.9, 0.45] } : { opacity: 0.55 }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle
            cx={TREE.x * 16}
            cy={TREE.y * 9}
            r="86"
            className="fill-none stroke-oe-solar-gold/25"
            strokeWidth="3"
          />
          <circle
            cx={TREE.x * 16}
            cy={TREE.y * 9}
            r="105"
            className="fill-none stroke-oe-solar-gold/15"
            strokeWidth="2"
            strokeDasharray="3 12"
          />
        </motion.g>
      </svg>
    </div>
  )
}

function MapControl({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      data-motion-level="micro"
      aria-label={label}
      title={label}
      onClick={onClick}
      onPointerDown={(event) => event.stopPropagation()}
      className="flex h-11 w-11 items-center justify-center rounded-full text-oe-pure-light/65 transition-colors hover:bg-oe-pure-light/10 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-pure-light"
    >
      {children}
    </button>
  )
}
