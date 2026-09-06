'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Box,
  House,
  LocateFixed,
  MapPinned,
  Minus,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Sprout,
  SunMedium,
  TreePine,
  X,
} from 'lucide-react'
import { useMotionLevel } from '@/hooks/useMotionLevel'
import { cn } from '@/lib/utils'
import { WORLD_LANDMARKS, type WorldLandmarkId } from '../landmarks'
import {
  getCompletedPairCount,
  getPairForPlace,
  hasReachedEmergence,
  isPairReady,
  PLACE_ATTENTION_CAPACITY,
  PULSE_INTERVAL_MS,
  RESONANCE_PAIRS,
  TOTAL_ATTENTION,
  type AttentionNodeId,
  type ResonanceGameEvent,
  type ResonancePlaceId,
  type ResonanceSession,
  type ResonanceSessionCommand,
} from './game'
import { readWorldScenePalette } from './scenePalette'
import {
  WorldScene,
  type CameraAction,
  type CameraCommand,
  type WorldAtmosphere,
  type WorldQuality,
} from './WorldScene'
import { WorldSoundscape } from './WorldSoundscape'

interface ImmersiveThreeWorldProps {
  session: ResonanceSession
  dispatch: Dispatch<ResonanceSessionCommand>
  onReady: () => void
  onFailure: () => void
  onUse2d: () => void
}

const QUALITY_ORDER: WorldQuality[] = ['low', 'medium', 'high']
const ATMOSPHERE_ORDER: WorldAtmosphere[] = ['dawn', 'day', 'cosmic']
const WORLD_LAYERS = ['origin', 'center', 'journey'] as const
const CAMERA_KEYS: Record<string, CameraAction> = {
  ArrowLeft: 'pan-left',
  a: 'pan-left',
  ArrowRight: 'pan-right',
  d: 'pan-right',
  ArrowUp: 'pan-up',
  w: 'pan-up',
  ArrowDown: 'pan-down',
  s: 'pan-down',
  '+': 'zoom-in',
  '=': 'zoom-in',
  '-': 'zoom-out',
  _: 'zoom-out',
  Home: 'reset',
}

function initialQuality(): WorldQuality {
  return window.matchMedia('(max-width: 767px)').matches ||
    (navigator.hardwareConcurrency ?? 8) <= 4
    ? 'low'
    : 'medium'
}

export function ImmersiveThreeWorld({
  session,
  dispatch,
  onReady,
  onFailure,
  onUse2d,
}: ImmersiveThreeWorldProps) {
  const t = useTranslations('worldMap.immersive3d')
  const world = useTranslations('worldMap')
  const canSacred = useMotionLevel('sacred')
  const palette = useMemo(() => readWorldScenePalette(), [])
  const [selectedId, setSelectedId] = useState<WorldLandmarkId | null>(null)
  const [atlasOpen, setAtlasOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const atlasButtonRef = useRef<HTMLButtonElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const cameraSurfaceRef = useRef<HTMLDivElement>(null)
  const detailTriggerRef = useRef<HTMLElement | null>(null)
  const [quality, setQuality] = useState<WorldQuality>(initialQuality)
  const [atmosphere, setAtmosphere] = useState<WorldAtmosphere>('dawn')
  const [cameraCommand, setCameraCommand] = useState<CameraCommand>({
    action: 'reset',
    sequence: 0,
  })

  const { game } = session
  const selectedPair = selectedId ? getPairForPlace(selectedId) : undefined
  const navigationPair =
    selectedPair ??
    RESONANCE_PAIRS.find(({ id }) => game.pairs[id].completedAtPulse === null) ??
    RESONANCE_PAIRS[0]
  const navigationIds: AttentionNodeId[] = [
    'tree',
    navigationPair.personalId,
    navigationPair.globalId,
  ]
  const pair = game.pairs[navigationPair.id]
  const pairReady = isPairReady(game, navigationPair.id)
  const harmonized = pair.completedAtPulse !== null
  const selectedPlace =
    selectedId !== null && selectedId !== 'tree' && selectedPair
      ? (selectedId as ResonancePlaceId)
      : null
  const selectedResonance = selectedPlace ? game.resonance[selectedPlace] : 0
  const selectedAttention = game.attention[selectedPlace ?? 'tree']
  const globalLocked = selectedPlace === navigationPair.globalId && !pair.globalUnlocked
  const completedPairs = getCompletedPairCount(game)
  const emerged = hasReachedEmergence(game)
  const simulationActive =
    !emerged &&
    (game.attention.tree < TOTAL_ATTENTION ||
      RESONANCE_PAIRS.some(({ id }) => game.pairs[id].stabilizing))

  const sendCamera = useCallback((action: CameraAction) => {
    setCameraCommand((current) => ({
      action,
      sequence: current.sequence + 1,
    }))
  }, [])

  const lowerQuality = useCallback(() => {
    setQuality((current) =>
      current === 'high' ? 'medium' : current === 'medium' ? 'low' : current
    )
  }, [])

  useEffect(() => {
    if (!simulationActive) return

    const interval = window.setInterval(() => {
      if (!document.hidden) dispatch({ type: 'PULSE' })
    }, PULSE_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [dispatch, simulationActive])

  const closeDetails = useCallback((restoreFocus = true) => {
    const trigger = detailTriggerRef.current
    setSelectedId(null)
    if (restoreFocus) requestAnimationFrame(() => trigger?.focus())
  }, [])

  const selectPlace = useCallback((id: WorldLandmarkId, trigger: HTMLElement | null) => {
    detailTriggerRef.current = trigger
    setSelectedId(id)
  }, [])

  const selectScenePlace = useCallback(
    (id: WorldLandmarkId) => {
      selectPlace(id, cameraSurfaceRef.current)
    },
    [selectPlace]
  )

  useEffect(() => {
    if (!atlasOpen && !settingsOpen && selectedId === null) return

    function closeTopLayer(event: globalThis.KeyboardEvent) {
      if (event.key !== 'Escape') return

      if (atlasOpen) {
        setAtlasOpen(false)
        atlasButtonRef.current?.focus()
        return
      }

      if (settingsOpen) {
        setSettingsOpen(false)
        settingsButtonRef.current?.focus()
        return
      }

      closeDetails()
    }

    window.addEventListener('keydown', closeTopLayer)
    return () => window.removeEventListener('keydown', closeTopLayer)
  }, [atlasOpen, closeDetails, selectedId, settingsOpen])

  function describeEvent(event: ResonanceGameEvent | undefined) {
    if (!event) return ''

    switch (event.type) {
      case 'COMMAND_REJECTED':
        return t(`events.rejected.${event.code}`)
      case 'PLACE_ATTUNED':
        return t('events.placeAttuned', {
          place: world(`landmarks.${event.placeId}.name`),
        })
      case 'GLOBAL_UNLOCKED':
        return t('events.globalUnlocked')
      case 'PAIR_READY':
        return t('events.pairReady')
      case 'STABILIZATION_STARTED':
        return t('events.stabilizationStarted')
      case 'PAIR_HARMONIZED':
        return t('events.pairHarmonized')
      case 'PAIR_INFLUENCE_CHANGED':
        return t('events.pairInfluence')
      case 'PAIR_DISSONANT':
        return t('events.pairDissonant')
      case 'PAIR_REALIGNED':
        return t('events.pairRealigned')
      case 'EMERGENCE_REACHED':
        return t('events.emergenceReached')
    }
  }

  const announcement = describeEvent(session.events.at(-1))

  function moveAttention(to: Exclude<AttentionNodeId, 'tree'>) {
    const selectedPair = getPairForPlace(to)
    const partner =
      selectedPair?.personalId === to ? selectedPair.globalId : selectedPair?.personalId
    const source = (
      [
        'tree',
        ...(partner ? [partner] : []),
        ...RESONANCE_PAIRS.flatMap(({ personalId, globalId }) => [personalId, globalId]),
      ] as AttentionNodeId[]
    ).find((id) => id !== to && game.attention[id] > 0)
    if (source) dispatch({ type: 'MOVE_ATTENTION', from: source, to })
  }

  function returnAttention(from: Exclude<AttentionNodeId, 'tree'>) {
    dispatch({ type: 'MOVE_ATTENTION', from, to: 'tree' })
  }

  function cycleQuality() {
    setQuality((current) => {
      const index = QUALITY_ORDER.indexOf(current)
      return QUALITY_ORDER[(index + 1) % QUALITY_ORDER.length]
    })
  }

  function cycleAtmosphere() {
    setAtmosphere((current) => {
      const index = ATMOSPHERE_ORDER.indexOf(current)
      return ATMOSPHERE_ORDER[(index + 1) % ATMOSPHERE_ORDER.length]
    })
  }

  function handleCameraKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const action = CAMERA_KEYS[event.key]

    if (!action) return
    event.preventDefault()
    sendCamera(action)
  }

  const canAddAttention =
    selectedPlace !== null &&
    !globalLocked &&
    !harmonized &&
    selectedAttention < PLACE_ATTENTION_CAPACITY &&
    Object.entries(game.attention).some(([id, amount]) => id !== selectedPlace && amount > 0)
  const canReturnAttention =
    selectedPlace !== null && selectedAttention > 0 && game.attention.tree < TOTAL_ATTENTION

  return (
    <section
      data-world-active-streams={TOTAL_ATTENTION - game.attention.tree}
      data-world-harmonized-pairs={completedPairs}
      data-world-emergence={emerged}
      className="relative h-dvh overflow-hidden bg-oe-deep-space text-oe-pure-light"
    >
      <h1 className="sr-only">{t('title')}</h1>
      <p id="world-camera-help" className="sr-only">
        {t('camera.keyboardHint')}
      </p>

      <div
        ref={cameraSurfaceRef}
        data-camera-surface
        role="region"
        tabIndex={0}
        aria-label={t('sceneAria')}
        aria-describedby="world-camera-help"
        onKeyDown={handleCameraKeyDown}
        onPointerDown={(event) => event.currentTarget.focus({ preventScroll: true })}
        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-oe-spirit-cyan"
      >
        <WorldScene
          key={`${quality}-${atmosphere}`}
          palette={palette}
          quality={quality}
          atmosphere={atmosphere}
          selectedId={selectedId}
          game={game}
          canSacred={canSacred}
          cameraCommand={cameraCommand}
          onSelect={selectScenePlace}
          onClearSelection={() => closeDetails(false)}
          onReady={onReady}
          onFailure={onFailure}
          onQualityDecline={lowerQuality}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-oe-deep-space/15 via-transparent to-oe-deep-space/35"
      />

      <header className="pointer-events-none absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-3 sm:inset-x-5 sm:top-5">
        <div className="hidden rounded-2xl border border-oe-pure-light/10 bg-oe-deep-space/75 px-4 py-3 backdrop-blur-xl sm:block">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.28em] text-oe-spirit-cyan">
            {t('eyebrow')}
          </p>
          <p className="mt-1 font-serif text-2xl leading-none text-oe-pure-light">{t('title')}</p>
        </div>
        <div className="pointer-events-auto ml-auto flex gap-2">
          <button
            ref={atlasButtonRef}
            type="button"
            data-motion-level="micro"
            aria-label={t('atlas.open')}
            aria-expanded={atlasOpen}
            aria-controls="world-atlas"
            onClick={() => {
              setSettingsOpen(false)
              setAtlasOpen((open) => !open)
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-oe-spirit-cyan/25 bg-oe-deep-space/90 px-3 text-sm text-oe-spirit-cyan backdrop-blur-xl transition-colors hover:bg-oe-spirit-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan sm:px-4"
          >
            <MapPinned className="h-4 w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">{t('atlas.open')}</span>
          </button>
          <button
            ref={settingsButtonRef}
            type="button"
            data-motion-level="micro"
            aria-label={t('settings.open')}
            aria-expanded={settingsOpen}
            aria-controls="world-settings"
            onClick={() => {
              setAtlasOpen(false)
              setSettingsOpen((open) => !open)
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-oe-pure-light/15 bg-oe-deep-space/90 px-3 text-sm text-oe-pure-light/75 backdrop-blur-xl transition-colors hover:bg-oe-pure-light/10 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan sm:px-4"
          >
            <Settings2 className="h-4 w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">{t('settings.open')}</span>
          </button>
          <Link
            href="/map"
            data-motion-level="micro"
            aria-label={world('immersive.exit')}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-oe-pure-light/15 bg-oe-deep-space/90 px-3 text-sm text-oe-pure-light backdrop-blur-xl transition-colors hover:bg-oe-pure-light/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-pure-light sm:px-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="hidden 2xl:inline">{world('immersive.exit')}</span>
          </Link>
        </div>
      </header>

      <nav
        aria-label={t('places')}
        className="absolute left-3 top-16 z-20 flex gap-1 rounded-full border border-oe-pure-light/10 bg-oe-deep-space/88 p-1 backdrop-blur-xl sm:left-1/2 sm:top-5 sm:-translate-x-1/2"
      >
        {navigationIds.map((id) => {
          const Icon = id === 'tree' ? TreePine : id === navigationPair.personalId ? House : Sprout
          const active = selectedId === id
          const locked = id === navigationPair.globalId && !pair.globalUnlocked

          return (
            <button
              key={id}
              type="button"
              data-motion-level="micro"
              aria-current={active ? 'location' : undefined}
              aria-label={`${world(`landmarks.${id}.name`)}${locked ? ` · ${t('locked')}` : ''}`}
              onClick={(event) => selectPlace(id, event.currentTarget)}
              className={cn(
                'flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full px-2.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan sm:gap-2 sm:px-4',
                active
                  ? 'bg-oe-pure-light/10 text-oe-pure-light'
                  : locked
                    ? 'text-oe-pure-light/35'
                    : 'text-oe-pure-light/65 hover:bg-oe-pure-light/[0.06]'
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden md:inline">{world(`landmarks.${id}.name`)}</span>
              <span className="tabular-nums text-oe-solar-gold">{game.attention[id]}</span>
            </button>
          )
        })}
      </nav>

      {atlasOpen ? (
        <aside
          id="world-atlas"
          aria-labelledby="world-atlas-title"
          className="absolute inset-x-3 top-28 z-30 max-h-[62dvh] overflow-y-auto rounded-3xl border border-oe-spirit-cyan/20 bg-oe-deep-space/96 p-4 shadow-2xl shadow-oe-deep-space backdrop-blur-2xl sm:left-auto sm:right-5 sm:top-20 sm:w-[22rem] sm:p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.25em] text-oe-spirit-cyan">
                {t('atlas.eyebrow')}
              </p>
              <h2 id="world-atlas-title" className="mt-1 font-serif text-3xl text-oe-pure-light">
                {t('atlas.title')}
              </h2>
            </div>
            <button
              type="button"
              aria-label={t('atlas.close')}
              onClick={() => {
                setAtlasOpen(false)
                atlasButtonRef.current?.focus()
              }}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-oe-pure-light/60 transition-colors hover:bg-oe-pure-light/10 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div
            aria-hidden="true"
            className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl border border-oe-pure-light/10 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(rgba(10, 15, 31, 0.18), rgba(10, 15, 31, 0.62)), url('/images/world-map/world-map-river-master.png')",
            }}
          >
            {WORLD_LANDMARKS.map((landmark) => (
              <span
                key={landmark.id}
                className={cn(
                  'absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-oe-deep-space',
                  landmark.id === selectedId
                    ? 'scale-150 bg-oe-solar-gold'
                    : landmark.layer === 'center'
                      ? 'bg-oe-spirit-cyan'
                      : landmark.layer === 'journey'
                        ? 'bg-oe-aurora-violet'
                        : 'bg-oe-pure-light'
                )}
                style={{ left: `${landmark.x}%`, top: `${landmark.y}%` }}
              />
            ))}
          </div>

          <p className="mt-3 text-xs leading-5 text-oe-pure-light/55">{t('atlas.hint')}</p>

          <nav aria-label={t('places')} className="mt-4 space-y-4">
            {WORLD_LAYERS.map((layer) => (
              <section key={layer} aria-labelledby={`world-atlas-${layer}`}>
                <h3
                  id={`world-atlas-${layer}`}
                  className="text-[0.6rem] font-medium uppercase tracking-[0.22em] text-oe-pure-light/45"
                >
                  {world(`categories.${layer}`)}
                </h3>
                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  {WORLD_LANDMARKS.filter((landmark) => landmark.layer === layer).map(
                    (landmark) => (
                      <button
                        key={landmark.id}
                        type="button"
                        aria-current={landmark.id === selectedId ? 'location' : undefined}
                        onClick={() => {
                          selectPlace(landmark.id, atlasButtonRef.current)
                          setAtlasOpen(false)
                          requestAnimationFrame(() => atlasButtonRef.current?.focus())
                        }}
                        className={cn(
                          'min-h-11 rounded-xl border px-3 py-2 text-left text-xs leading-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan',
                          landmark.id === selectedId
                            ? 'border-oe-solar-gold/40 bg-oe-solar-gold/10 text-oe-pure-light'
                            : 'border-oe-pure-light/[0.08] text-oe-pure-light/65 hover:bg-oe-pure-light/[0.06] hover:text-oe-pure-light'
                        )}
                      >
                        {world(`landmarks.${landmark.id}.name`)}
                      </button>
                    )
                  )}
                </div>
              </section>
            ))}
          </nav>
        </aside>
      ) : null}

      <section
        id="world-settings"
        hidden={!settingsOpen}
        aria-labelledby="world-settings-title"
        className={cn(
          'absolute inset-x-3 top-20 z-30 max-h-[70dvh] overflow-y-auto rounded-2xl border border-oe-pure-light/15 bg-oe-deep-space/96 p-4 shadow-2xl shadow-oe-deep-space backdrop-blur-2xl md:left-auto md:w-80',
          selectedId ? 'md:right-[24rem]' : 'md:right-5'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.62rem] font-medium uppercase tracking-[0.25em] text-oe-spirit-cyan">
              {t('settings.eyebrow')}
            </p>
            <h2 id="world-settings-title" className="mt-1 font-serif text-2xl text-oe-pure-light">
              {t('settings.title')}
            </h2>
          </div>
          <button
            type="button"
            aria-label={t('settings.close')}
            onClick={() => {
              setSettingsOpen(false)
              settingsButtonRef.current?.focus()
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-oe-pure-light/60 transition-colors hover:bg-oe-pure-light/10 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            data-motion-level="micro"
            onClick={cycleQuality}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-oe-pure-light/10 px-3 text-xs text-oe-pure-light/65 transition-colors hover:bg-oe-pure-light/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            <Box className="h-4 w-4" aria-hidden="true" />
            {t('quality', { quality: t(`qualities.${quality}`) })}
          </button>
          <button
            type="button"
            data-motion-level="micro"
            onClick={cycleAtmosphere}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-oe-pure-light/10 px-3 text-xs text-oe-pure-light/65 transition-colors hover:bg-oe-pure-light/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            <SunMedium className="h-4 w-4" aria-hidden="true" />
            {t('atmosphere', { atmosphere: t(`atmospheres.${atmosphere}`) })}
          </button>
          <button
            type="button"
            data-motion-level="micro"
            onClick={onUse2d}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-oe-pure-light/10 px-3 text-xs text-oe-pure-light/65 transition-colors hover:bg-oe-pure-light/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            {t('use2d')}
          </button>
          <button
            type="button"
            data-motion-level="micro"
            onClick={() => dispatch({ type: 'RESET' })}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-oe-pure-light/10 px-3 text-xs text-oe-pure-light/65 transition-colors hover:bg-oe-pure-light/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t('resetJourney')}
          </button>
        </div>

        <WorldSoundscape
          className="mt-3 items-stretch"
          labels={{
            controls: t('sound.controls'),
            start: t('sound.start'),
            pause: t('sound.pause'),
            resume: t('sound.resume'),
            mute: t('sound.mute'),
            unmute: t('sound.unmute'),
            volume: t('sound.volume'),
            unavailable: t('sound.unavailable'),
          }}
        />
      </section>

      {selectedId ? (
        <aside
          id="world-place-details"
          aria-labelledby="resonance-place-title"
          className="absolute inset-x-3 bottom-3 z-20 max-h-[55dvh] overflow-y-auto rounded-2xl border border-oe-spirit-cyan/20 bg-oe-deep-space/94 p-5 shadow-2xl shadow-oe-deep-space/70 backdrop-blur-2xl md:bottom-5 md:left-auto md:right-5 md:top-28 md:w-[22rem] md:max-h-none"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.62rem] font-medium uppercase tracking-[0.25em] text-oe-spirit-cyan">
                {globalLocked ? t('locked') : t('selectedPlace')}
              </p>
              <h2
                id="resonance-place-title"
                className="mt-2 font-serif text-3xl leading-none text-oe-pure-light"
              >
                {world(`landmarks.${selectedId}.name`)}
              </h2>
            </div>
            <button
              type="button"
              aria-label={t('closePlace')}
              onClick={() => closeDetails()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-oe-pure-light/60 transition-colors hover:bg-oe-pure-light/10 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-oe-pure-light/60">
            {world(`landmarks.${selectedId}.description`)}
          </p>

          {selectedPlace ? (
            <>
              <div className="mt-4 border-y border-oe-pure-light/10 py-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs uppercase tracking-[0.16em] text-oe-pure-light/50">
                    {t('attention')}
                  </span>
                  <span className="font-serif text-xl tabular-nums text-oe-solar-gold">
                    {selectedAttention} / {PLACE_ATTENTION_CAPACITY}
                  </span>
                </div>

                <output aria-live="polite" aria-atomic="true" className="sr-only">
                  {t('campaign.attentionSummary', {
                    tree: game.attention.tree,
                    total: TOTAL_ATTENTION,
                    completed: completedPairs,
                  })}
                </output>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    data-motion-level="micro"
                    disabled={!canReturnAttention}
                    aria-label={t('returnAttention', {
                      place: world(`landmarks.${selectedPlace}.name`),
                    })}
                    onClick={() => returnAttention(selectedPlace)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-oe-pure-light/10 text-sm text-oe-pure-light/70 transition-colors hover:bg-oe-pure-light/[0.06] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-pure-light"
                  >
                    <Minus className="h-4 w-4" aria-hidden="true" />
                    {t('release')}
                  </button>
                  <button
                    type="button"
                    data-motion-level="micro"
                    disabled={!canAddAttention}
                    aria-label={t('addAttention', {
                      place: world(`landmarks.${selectedPlace}.name`),
                    })}
                    onClick={() => moveAttention(selectedPlace)}
                    className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-oe-solar-gold/35 bg-oe-solar-gold/[0.07] text-sm text-oe-solar-gold transition-colors hover:bg-oe-solar-gold/12 disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-solar-gold"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {t('focus')}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <label htmlFor="selected-place-resonance" className="text-oe-pure-light/55">
                    {t('resonance')}
                  </label>
                  <span className="tabular-nums text-oe-spirit-cyan">{selectedResonance}%</span>
                </div>
                <progress
                  id="selected-place-resonance"
                  max={100}
                  value={selectedResonance}
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-oe-pure-light/10 accent-oe-spirit-cyan"
                />
                {globalLocked ? (
                  <p className="mt-2 text-xs leading-5 text-oe-pure-light/45">
                    {t('unlockHint', {
                      personal: world(`landmarks.${navigationPair.personalId}.name`),
                    })}
                  </p>
                ) : null}
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-oe-pure-light/55">{t('coherence')}</span>
                  <span className="tabular-nums text-oe-aurora-violet-ink">{pair.coherence}%</span>
                </div>
                <progress
                  aria-label={t('coherence')}
                  max={100}
                  value={pair.coherence}
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-oe-pure-light/10 accent-oe-aurora-violet"
                />
                {pair.dissonance > 0 ? (
                  <p className="mt-2 text-xs leading-5 text-oe-aurora-violet-ink">
                    {t('campaign.dissonance', { value: pair.dissonance })}
                  </p>
                ) : null}
                <p className="mt-2 text-xs leading-5 text-oe-pure-light/50">
                  {harmonized
                    ? t('status.harmonized')
                    : pair.stabilizing
                      ? t('status.stabilizing')
                      : pairReady
                        ? t('status.ready')
                        : pair.globalUnlocked
                          ? t('status.connecting')
                          : t('status.personalFirst', {
                              personal: world(`landmarks.${navigationPair.personalId}.name`),
                            })}
                </p>

                <button
                  type="button"
                  data-motion-level={harmonized ? 'event' : 'micro'}
                  disabled={!pairReady || pair.stabilizing || harmonized}
                  onClick={() => dispatch({ type: 'STABILIZE_PAIR', pairId: navigationPair.id })}
                  className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-oe-aurora-violet/45 bg-oe-aurora-violet/10 px-4 text-sm text-oe-aurora-violet-ink transition-colors hover:bg-oe-aurora-violet/15 disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-aurora-violet"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  {harmonized
                    ? t('harmonized')
                    : pair.stabilizing
                      ? t('stabilizing')
                      : t('stabilize')}
                </button>
              </div>
            </>
          ) : (
            <div className="mt-4 border-y border-oe-pure-light/10 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.16em] text-oe-pure-light/50">
                  {t('campaign.progress')}
                </span>
                <span className="font-serif text-xl tabular-nums text-oe-solar-gold">
                  {completedPairs} / {RESONANCE_PAIRS.length}
                </span>
              </div>
              <progress
                aria-label={t('campaign.progress')}
                max={RESONANCE_PAIRS.length}
                value={completedPairs}
                className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-oe-pure-light/10 accent-oe-solar-gold"
              />
              <p className="mt-3 text-xs leading-5 text-oe-pure-light/55">
                {emerged ? t('campaign.emergence') : t('campaign.treeHint')}
              </p>
              <p className="mt-2 text-xs text-oe-spirit-cyan">
                {t('campaign.availableAttention', {
                  available: game.attention.tree,
                  total: TOTAL_ATTENTION,
                })}
              </p>
            </div>
          )}
        </aside>
      ) : null}

      <div
        role="group"
        aria-label={t('camera.label')}
        className="absolute right-3 top-32 z-20 grid grid-cols-3 rounded-2xl border border-oe-pure-light/10 bg-oe-deep-space/88 p-1 backdrop-blur-xl lg:bottom-5 lg:left-1/2 lg:right-auto lg:top-auto lg:-translate-x-1/2"
      >
        <span aria-hidden="true" />
        <CameraButton label={t('camera.up')} onClick={() => sendCamera('pan-up')}>
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
        <CameraButton label={t('camera.zoomIn')} onClick={() => sendCamera('zoom-in')}>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
        <CameraButton label={t('camera.left')} onClick={() => sendCamera('pan-left')}>
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
        <CameraButton label={t('camera.reset')} onClick={() => sendCamera('reset')}>
          <LocateFixed className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
        <CameraButton label={t('camera.right')} onClick={() => sendCamera('pan-right')}>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
        <span aria-hidden="true" />
        <CameraButton label={t('camera.down')} onClick={() => sendCamera('pan-down')}>
          <ArrowDown className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
        <CameraButton label={t('camera.zoomOut')} onClick={() => sendCamera('zoom-out')}>
          <Minus className="h-4 w-4" aria-hidden="true" />
        </CameraButton>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        <span key={session.revision}>{announcement}</span>
      </div>
    </section>
  )
}

function CameraButton({
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
      className="flex h-11 w-11 items-center justify-center rounded-xl text-oe-pure-light/60 transition-colors hover:bg-oe-pure-light/10 hover:text-oe-pure-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oe-spirit-cyan"
    >
      {children}
    </button>
  )
}
