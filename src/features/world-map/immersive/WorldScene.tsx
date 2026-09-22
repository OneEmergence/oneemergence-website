'use client'

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentRef,
  type ReactNode,
} from 'react'
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { MapControls, PerformanceMonitor, Stars, useCursor, useGLTF } from '@react-three/drei'
import {
  ACESFilmicToneMapping,
  AdditiveBlending,
  CatmullRomCurve3,
  Color,
  MathUtils,
  Mesh,
  Object3D,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
  type OrthographicCamera,
} from 'three'
import { LandscapeEnvironment } from './LandscapeEnvironment'
import { useWorldTexture as useIsometricSpriteTexture } from './useWorldTexture'
import type { WorldLandmarkId } from '../landmarks'
import { BlockoutLandmarkModel, type BlockoutLandmarkId } from './BlockoutLandmarkModel'
import {
  getWorldCameraFrame,
  projectedLandmarkBounds,
  WORLD_CAMERA_OFFSET,
  WORLD_CAMERA_TARGET,
  type CameraPanelRect,
  type WorldCameraFrame,
} from './cameraFraming'
import {
  ATTUNED_RESONANCE,
  getCompletedPairCount,
  getPairForPlace,
  hasReachedEmergence,
  RESONANCE_PAIRS,
  TOTAL_ATTENTION,
  type ResonanceGameState,
} from './game'
import { GATE_ONE_LANDMARK_IDS, WORLD_LANDMARK_IDS, WORLD_PLACEMENTS } from './placements'
import {
  createRiverCurve,
  createRiverRibbonGeometry,
  createTerrainGeometry,
  createTreeGroundGlowGeometry,
  terrainSurfaceHeightAt,
} from './worldGeometry'
import { riverDistanceAt, trailDistanceAt } from './landscapeGeometry'
import { createCliffMaterial, createPaintedWaterMaterial } from './landscapeMaterials'
import type { WorldScenePalette } from './scenePalette'
import {
  WORLD_SPRITE_ASSETS,
  isometricRenderOrder,
  toThreeSpriteCenter,
  type IsometricSpriteAsset,
} from './spriteAssets'

export type WorldQuality = 'low' | 'medium' | 'high'
export type WorldAtmosphere = 'dawn' | 'day' | 'cosmic'
export type CameraAction =
  'pan-left' | 'pan-right' | 'pan-up' | 'pan-down' | 'zoom-in' | 'zoom-out' | 'reset'

export interface CameraCommand {
  action: CameraAction
  sequence: number
}

interface WorldSceneProps {
  palette: WorldScenePalette
  quality: WorldQuality
  automaticQuality: boolean
  atmosphere: WorldAtmosphere
  selectedId: WorldLandmarkId | null
  selectionPanel?: CameraPanelRect | null
  game: ResonanceGameState
  canSacred: boolean
  cameraCommand: CameraCommand
  onSelect: (id: WorldLandmarkId) => void
  onClearSelection: () => void
  onReady: () => void
  onFailure: () => void
  onQualityDecline: () => void
}

const QUALITY: Record<
  WorldQuality,
  {
    dpr: number
    antialias: boolean
    shadows: boolean
    shadowSize: number
    terrainSegments: number
    terrainRings: number
    forestCount: number
    stars: number
    maxDrawCalls: number
    maxTriangles: number
  }
> = {
  low: {
    dpr: 1,
    antialias: false,
    shadows: false,
    shadowSize: 512,
    terrainSegments: 40,
    terrainRings: 12,
    forestCount: 14,
    stars: 350,
    maxDrawCalls: 205,
    maxTriangles: 120_000,
  },
  medium: {
    dpr: 1.5,
    // The landmark edges are already antialiased in their sprite textures.
    // Reserve framebuffer MSAA for the explicitly selected high tier.
    antialias: false,
    shadows: true,
    shadowSize: 1024,
    terrainSegments: 64,
    terrainRings: 18,
    forestCount: 24,
    stars: 650,
    maxDrawCalls: 355,
    maxTriangles: 250_000,
  },
  high: {
    dpr: 1.75,
    antialias: true,
    shadows: true,
    shadowSize: 2048,
    terrainSegments: 88,
    terrainRings: 24,
    forestCount: 36,
    stars: 900,
    maxDrawCalls: 520,
    maxTriangles: 420_000,
  },
}

const ATMOSPHERE: Record<
  WorldAtmosphere,
  {
    exposure: number
    hemisphere: number
    key: number
    fill: number
    fogNear: number
    fogFar: number
  }
> = {
  dawn: {
    exposure: 0.94,
    hemisphere: 0.36,
    key: 2.15,
    fill: 0.64,
    fogNear: 58,
    fogFar: 115,
  },
  day: {
    exposure: 1.08,
    hemisphere: 0.46,
    key: 2.4,
    fill: 0.5,
    fogNear: 65,
    fogFar: 125,
  },
  cosmic: {
    exposure: 0.78,
    hemisphere: 0.24,
    key: 1.55,
    fill: 0.82,
    fogNear: 48,
    fogFar: 102,
  },
}

const CAMERA_TARGET = new Vector3(...WORLD_CAMERA_TARGET)
const LOW_FRAMEBUFFER_PIXELS = 450_000
const CAMERA_OFFSET = new Vector3(...WORLD_CAMERA_OFFSET)
const CAMERA_POSITION = CAMERA_TARGET.clone().add(CAMERA_OFFSET)

function isBlockoutLandmarkId(id: WorldLandmarkId): id is BlockoutLandmarkId {
  return !GATE_ONE_LANDMARK_IDS.some((gateOneId) => gateOneId === id)
}

function landmarkVisualState(
  game: ResonanceGameState,
  id: BlockoutLandmarkId
): 'resting' | 'attuned' | 'harmonized' {
  const pair = getPairForPlace(id)
  if (!pair) return 'resting'
  if (game.pairs[pair.id].completedAtPulse !== null) return 'harmonized'
  return game.attention[id] > 0 || game.resonance[id] >= ATTUNED_RESONANCE ? 'attuned' : 'resting'
}

export function WorldScene({
  palette,
  quality,
  automaticQuality,
  atmosphere,
  selectedId,
  selectionPanel,
  game,
  canSacred,
  cameraCommand,
  onSelect,
  onClearSelection,
  onReady,
  onFailure,
  onQualityDecline,
}: WorldSceneProps) {
  const [lowDpr, setLowDpr] = useState(1)
  const settings = QUALITY[quality]
  const atmosphereSettings = ATMOSPHERE[atmosphere]
  const emerged = hasReachedEmergence(game)
  const completedPairs = getCompletedPairCount(game)
  const worldCoherence = Math.round(
    RESONANCE_PAIRS.reduce((sum, { id }) => sum + game.pairs[id].coherence, 0) /
      RESONANCE_PAIRS.length
  )
  const resonanceActive = !emerged && game.attention.tree < TOTAL_ATTENTION
  const activeStreams = TOTAL_ATTENTION - game.attention.tree
  const activeLandmarks = WORLD_LANDMARK_IDS.filter(
    (id) => id !== 'tree' && game.attention[id] > 0
  ).length
  const ambientMotion = canSacred && quality !== 'low'
  const activeAnimation = canSacred && (ambientMotion || resonanceActive)

  return (
    <Canvas
      // MSAA is a context-creation option. Only an explicit switch to/from
      // high needs a fresh canvas; automatic medium -> low keeps the camera.
      key={settings.antialias ? 'multisampled' : 'single-sampled'}
      aria-hidden="true"
      orthographic
      shadows={settings.shadows ? 'basic' : false}
      frameloop={activeAnimation ? 'always' : 'demand'}
      dpr={quality === 'low' ? lowDpr : [1, settings.dpr]}
      camera={{
        position: CAMERA_POSITION.toArray(),
        zoom: 11,
        near: 0.5,
        far: 150,
      }}
      gl={{
        antialias: settings.antialias,
        alpha: false,
        powerPreference: 'high-performance',
      }}
      onPointerMissed={onClearSelection}
      onCreated={({ camera, gl }) => {
        camera.lookAt(CAMERA_TARGET)
        gl.setClearColor(palette.deepSpace)
        gl.toneMapping = ACESFilmicToneMapping
        gl.toneMappingExposure = atmosphereSettings.exposure
        onReady()
      }}
    >
      {quality === 'low' ? <ScenePixelBudget onDprChange={setLowDpr} /> : null}
      <SceneLifecycle exposure={atmosphereSettings.exposure} onFailure={onFailure} />
      {automaticQuality && activeAnimation && quality !== 'low' ? (
        <AdaptiveQualityMonitor onDecline={onQualityDecline} />
      ) : null}
      <SceneBudgetProbe
        quality={quality}
        automaticQuality={automaticQuality}
        maxDrawCalls={settings.maxDrawCalls}
        maxTriangles={settings.maxTriangles}
        activeStreams={activeStreams}
        activeLandmarks={activeLandmarks}
      />
      <fog
        attach="fog"
        args={[palette.deepSpace, atmosphereSettings.fogNear, atmosphereSettings.fogFar]}
      />
      <Stars
        radius={90}
        depth={35}
        count={settings.stars}
        factor={2.4}
        saturation={0.18}
        fade
        speed={0}
      />

      <hemisphereLight
        args={[palette.cyan, palette.warmSand, atmosphereSettings.hemisphere]}
        position={[0, 30, 0]}
      />
      <directionalLight
        castShadow={settings.shadows}
        color={palette.light}
        intensity={atmosphereSettings.key}
        position={[-20, 35, 22]}
        shadow-mapSize-width={settings.shadowSize}
        shadow-mapSize-height={settings.shadowSize}
        shadow-normalBias={0.04}
        shadow-bias={-0.0004}
        shadow-camera-left={-45}
        shadow-camera-right={45}
        shadow-camera-top={35}
        shadow-camera-bottom={-35}
        shadow-camera-near={1}
        shadow-camera-far={110}
      />
      <directionalLight
        color={palette.cyan}
        intensity={atmosphereSettings.fill}
        position={[30, 18, -25]}
      />
      <AtmosphereBeacon atmosphere={atmosphere} palette={palette} animate={ambientMotion} />

      <RtsCameraRig
        selectedId={selectedId}
        selectionPanel={selectionPanel}
        command={cameraCommand}
        canFlow={canSacred}
      />
      <Terrain
        palette={palette}
        quality={quality}
        radialSegments={settings.terrainSegments}
        rings={settings.terrainRings}
      />
      <River
        palette={palette}
        quality={quality}
        animate={activeAnimation}
        energy={activeStreams / TOTAL_ATTENTION}
      />
      <Forest count={settings.forestCount} quality={quality} />
      {ambientMotion ? <AmbientWisps palette={palette} /> : null}

      {RESONANCE_PAIRS.flatMap((resonancePair) => {
        const progress = game.pairs[resonancePair.id]
        const harmonized = progress.completedAtPulse !== null
        const dissonant = progress.dissonance > 0
        const personalAttention = game.attention[resonancePair.personalId]
        const globalAttention = game.attention[resonancePair.globalId]
        const showRestingConnection = harmonized && quality !== 'low'
        const links: ReactNode[] = []

        if (personalAttention > 0 || dissonant || showRestingConnection) {
          links.push(
            <FlowLink
              key={`${resonancePair.id}-personal`}
              from="tree"
              to={resonancePair.personalId}
              palette={palette}
              amount={personalAttention}
              canSacred={canSacred}
              harmonized={harmonized}
              dissonant={dissonant}
            />
          )
        }

        if (globalAttention > 0 || dissonant || showRestingConnection) {
          links.push(
            <FlowLink
              key={`${resonancePair.id}-global`}
              from={resonancePair.personalId}
              to={resonancePair.globalId}
              palette={palette}
              amount={globalAttention}
              canSacred={canSacred}
              harmonized={harmonized}
              dissonant={dissonant}
            />
          )
        }

        return links
      })}

      <TreeLandmark
        palette={palette}
        quality={quality}
        selected={selectedId === 'tree'}
        coherence={Math.max(worldCoherence, completedPairs * 12, activeStreams * 8)}
        harmonized={emerged}
        shadows={settings.shadows}
        onSelect={onSelect}
      />
      <RootHomeLandmark
        palette={palette}
        quality={quality}
        selected={selectedId === 'root-home'}
        resonance={Math.max(
          game.resonance['root-home'],
          game.attention['root-home'] > 0 ? ATTUNED_RESONANCE : 0
        )}
        shadows={settings.shadows}
        onSelect={onSelect}
      />
      <EarthInstituteLandmark
        palette={palette}
        quality={quality}
        selected={selectedId === 'earth'}
        resonance={Math.max(game.resonance.earth, game.attention.earth > 0 ? ATTUNED_RESONANCE : 0)}
        shadows={settings.shadows}
        onSelect={onSelect}
      />
      {WORLD_LANDMARK_IDS.filter(isBlockoutLandmarkId).map((id) => (
        <InteractiveLandmark
          key={id}
          id={id}
          selected={selectedId === id}
          palette={palette}
          onSelect={onSelect}
        >
          <IsometricLandmarkSprite
            asset={WORLD_SPRITE_ASSETS[id]}
            worldPosition={WORLD_PLACEMENTS[id].position}
            quality={quality}
            fallback={
              <group scale={WORLD_PLACEMENTS[id].scale}>
                <BlockoutLandmarkModel
                  id={id}
                  palette={palette}
                  quality={quality}
                  state={landmarkVisualState(game, id)}
                  shadows={settings.shadows}
                />
              </group>
            }
          />
        </InteractiveLandmark>
      ))}
    </Canvas>
  )
}

function ScenePixelBudget({ onDprChange }: { onDprChange: (dpr: number) => void }) {
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)

  useLayoutEffect(() => {
    if (width <= 0 || height <= 0) return
    // Bound only the 3D framebuffer: DOM controls keep their native resolution.
    // Keep Canvas's prop in sync so its later renders retain this pixel budget.
    onDprChange(Math.min(1, Math.sqrt(LOW_FRAMEBUFFER_PIXELS / (width * height))))
  }, [height, onDprChange, width])

  return null
}

function subscribeVisibility(onChange: () => void) {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

function AdaptiveQualityMonitor({ onDecline }: { onDecline: () => void }) {
  const visible = useSyncExternalStore(
    subscribeVisibility,
    () => !document.hidden,
    () => true
  )
  if (!visible) return null

  return (
    <PerformanceMonitor
      ms={500}
      iterations={6}
      // Drei's "refreshRate" is the highest observed FPS, not the display's
      // refresh rate: deriving the floor from it accepted a steady 12 FPS.
      // Five of six slow windows must miss this fixed usability floor.
      bounds={() => [30, 55]}
      onDecline={onDecline}
    />
  )
}

function SceneLifecycle({ exposure, onFailure }: { exposure: number; onFailure: () => void }) {
  const gl = useThree((state) => state.gl)
  const get = useThree((state) => state.get)

  useEffect(() => {
    const renderer = get()
    renderer.gl.toneMappingExposure = exposure
    renderer.invalidate()
  }, [exposure, get])

  useEffect(() => {
    const canvas = gl.domElement

    function handleContextLost(event: Event) {
      event.preventDefault()
      onFailure()
    }

    canvas.addEventListener('webglcontextlost', handleContextLost)
    return () => canvas.removeEventListener('webglcontextlost', handleContextLost)
  }, [gl, onFailure])

  return null
}

function AtmosphereBeacon({
  atmosphere,
  palette,
  animate,
}: {
  atmosphere: WorldAtmosphere
  palette: WorldScenePalette
  animate: boolean
}) {
  const ref = useRef<Object3D>(null)
  const color =
    atmosphere === 'dawn' ? palette.gold : atmosphere === 'day' ? palette.light : palette.violet

  useFrame(({ clock }) => {
    if (!animate || !ref.current) return
    ref.current.position.y = 16 + Math.sin(clock.elapsedTime * 0.18) * 0.35
    ref.current.rotation.y = clock.elapsedTime * 0.025
  })

  return (
    <group ref={ref} position={[25, 16, -23]}>
      <mesh>
        <sphereGeometry args={[1.5, 20, 12]} />
        <meshStandardMaterial
          color={palette.warmSand}
          emissive={color}
          emissiveIntensity={0.06}
          roughness={0.85}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0.2, 0]}>
        <torusGeometry args={[2.45, 0.055, 6, 48]} />
        <meshBasicMaterial color={palette.cyan} transparent opacity={0.48} />
      </mesh>
      <pointLight color={color} intensity={0.55} distance={18} />
    </group>
  )
}

function SceneBudgetProbe({
  quality,
  automaticQuality,
  maxDrawCalls,
  maxTriangles,
  activeStreams,
  activeLandmarks,
}: {
  quality: WorldQuality
  automaticQuality: boolean
  maxDrawCalls: number
  maxTriangles: number
  activeStreams: number
  activeLandmarks: number
}) {
  const get = useThree((state) => state.get)
  const invalidate = useThree((state) => state.invalidate)
  const lastSample = useRef(0)

  const recordBudget = useCallback(() => {
    const { gl, camera } = get()
    const { calls, triangles } = gl.info.render
    const canvas = gl.domElement
    canvas.dataset.worldAssetFormat = 'isometric-sprites'
    canvas.dataset.worldLod = quality
    canvas.dataset.worldQualityMode = automaticQuality ? 'automatic' : 'manual'
    canvas.dataset.worldDpr = String(gl.getPixelRatio())
    canvas.dataset.worldAntialias = String(gl.getContext().getContextAttributes()?.antialias)
    canvas.dataset.worldShadows = String(gl.shadowMap.enabled)
    canvas.dataset.worldExposure = String(gl.toneMappingExposure)
    canvas.dataset.worldCameraZoom = String((camera as OrthographicCamera).zoom)
    canvas.dataset.worldCameraPosition = camera.position.toArray().join(',')
    canvas.dataset.worldDrawCalls = String(calls)
    canvas.dataset.worldTriangles = String(triangles)
    canvas.dataset.worldGeometries = String(gl.info.memory.geometries)
    canvas.dataset.worldTextures = String(gl.info.memory.textures)
    canvas.dataset.worldRiverEnergy = String(activeStreams)
    canvas.dataset.worldActiveLandmarks = String(activeLandmarks)
    canvas.dataset.worldBudget =
      calls <= maxDrawCalls && triangles <= maxTriangles ? 'pass' : 'fail'
  }, [activeLandmarks, activeStreams, automaticQuality, get, maxDrawCalls, maxTriangles, quality])

  useEffect(() => {
    invalidate()
    const frame = requestAnimationFrame(recordBudget)
    return () => cancelAnimationFrame(frame)
  }, [invalidate, recordBudget])

  // The first frame can still contain procedural loading fallbacks. Refresh
  // the existing diagnostic attributes without re-rendering React each frame.
  useFrame(({ clock }) => {
    if (clock.elapsedTime - lastSample.current < 1) return
    lastSample.current = clock.elapsedTime
    recordBudget()
  })

  return null
}

function RtsCameraRig({
  selectedId,
  selectionPanel,
  command,
  canFlow,
}: {
  selectedId: WorldLandmarkId | null
  selectionPanel?: CameraPanelRect | null
  command: CameraCommand
  canFlow: boolean
}) {
  const controlsRef = useRef<ComponentRef<typeof MapControls>>(null)
  const invalidate = useThree((state) => state.invalidate)
  const size = useThree((state) => state.size)
  const get = useThree((state) => state.get)
  const previousCommand = useRef(command.sequence)
  const animationFrame = useRef(0)
  const hasFramed = useRef(false)
  const panelLeft = selectionPanel?.left
  const panelTop = selectionPanel?.top
  const panelWidth = selectionPanel?.width
  const panelHeight = selectionPanel?.height
  const framing = useMemo(
    () =>
      getWorldCameraFrame(
        size.width,
        size.height,
        selectedId,
        panelLeft === undefined ||
          panelTop === undefined ||
          panelWidth === undefined ||
          panelHeight === undefined
          ? null
          : { left: panelLeft, top: panelTop, width: panelWidth, height: panelHeight }
      ),
    [panelHeight, panelLeft, panelTop, panelWidth, selectedId, size.height, size.width]
  )

  const stopAnimation = useCallback(() => {
    cancelAnimationFrame(animationFrame.current)
    animationFrame.current = 0
  }, [])

  const recordFraming = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return
    const { gl } = get()
    const camera = controls.object as OrthographicCamera
    gl.domElement.dataset.worldCameraSafeBounds = JSON.stringify(framing.safeBounds)
    gl.domElement.dataset.worldCameraViewOffset = [
      camera.view?.offsetX ?? 0,
      camera.view?.offsetY ?? 0,
    ].join(',')
    if (selectedId) {
      gl.domElement.dataset.worldSelectedLandmark = selectedId
      gl.domElement.dataset.worldSelectedBounds = JSON.stringify(
        projectedLandmarkBounds(selectedId, size.width, size.height, {
          target: controls.target.toArray(),
          zoom: camera.zoom,
          offsetX: camera.view?.offsetX ?? 0,
          offsetY: camera.view?.offsetY ?? 0,
        })
      )
    } else {
      delete gl.domElement.dataset.worldSelectedLandmark
      delete gl.domElement.dataset.worldSelectedBounds
    }
  }, [framing.safeBounds, get, selectedId, size.height, size.width])

  const applyFraming = useCallback(
    (next: WorldCameraFrame, animate: boolean) => {
      const controls = controlsRef.current
      if (!controls || size.width <= 0 || size.height <= 0) return
      stopAnimation()
      const camera = controls.object as OrthographicCamera
      const startTarget = controls.target.clone()
      const startPosition = camera.position.clone()
      const startZoom = camera.zoom
      const startOffsetX = camera.view?.offsetX ?? 0
      const startOffsetY = camera.view?.offsetY ?? 0
      const nextTarget = new Vector3(...next.target)
      const nextPosition = nextTarget.clone().add(CAMERA_OFFSET)

      function apply(progress: number) {
        controls!.target.lerpVectors(startTarget, nextTarget, progress)
        camera.position.lerpVectors(startPosition, nextPosition, progress)
        camera.zoom = MathUtils.lerp(startZoom, next.zoom, progress)
        camera.setViewOffset(
          size.width,
          size.height,
          MathUtils.lerp(startOffsetX, next.offsetX, progress),
          MathUtils.lerp(startOffsetY, next.offsetY, progress),
          size.width,
          size.height
        )
        controls!.update()
        recordFraming()
        invalidate()
      }

      if (!animate) {
        apply(1)
        return
      }
      const startedAt = performance.now()
      function move(now: number) {
        const progress = Math.min(1, (now - startedAt) / 600)
        apply(1 - (1 - progress) ** 4)
        animationFrame.current = progress < 1 ? requestAnimationFrame(move) : 0
      }
      animationFrame.current = requestAnimationFrame(move)
    },
    [invalidate, recordFraming, size.height, size.width, stopAnimation]
  )

  useLayoutEffect(() => {
    // Mount/remount must frame an already selected place before its first paint.
    applyFraming(framing, hasFramed.current && canFlow)
    hasFramed.current = true
    return stopAnimation
  }, [applyFraming, canFlow, framing, stopAnimation])

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls || command.sequence === previousCommand.current) return
    const camera = controls.object as OrthographicCamera
    previousCommand.current = command.sequence
    stopAnimation()

    const step = 2 * Math.SQRT1_2
    const offset = camera.position.clone().sub(controls.target)

    switch (command.action) {
      case 'pan-left':
        controls.target.x -= step
        controls.target.z += step
        break
      case 'pan-right':
        controls.target.x += step
        controls.target.z -= step
        break
      case 'pan-up':
        controls.target.x -= step
        controls.target.z -= step
        break
      case 'pan-down':
        controls.target.x += step
        controls.target.z += step
        break
      case 'zoom-in':
        camera.zoom = Math.min(28, camera.zoom * 1.15)
        camera.updateProjectionMatrix()
        controls.update()
        recordFraming()
        invalidate()
        return
      case 'zoom-out':
        camera.zoom = Math.max(1, camera.zoom / 1.15)
        camera.updateProjectionMatrix()
        controls.update()
        recordFraming()
        invalidate()
        return
      case 'reset':
        applyFraming(framing, canFlow)
        return
    }

    controls.target.x = MathUtils.clamp(controls.target.x, -34, 34)
    controls.target.z = MathUtils.clamp(controls.target.z, -22, 20)
    camera.position.copy(controls.target).add(offset)
    controls.update()
    recordFraming()
    invalidate()
  }, [applyFraming, canFlow, command, framing, invalidate, recordFraming, stopAnimation])

  const constrainCamera = useCallback(() => {
    const controls = controlsRef.current
    if (!controls) return

    const nextX = MathUtils.clamp(controls.target.x, -34, 34)
    const nextY = MathUtils.clamp(controls.target.y, 0, 7)
    const nextZ = MathUtils.clamp(controls.target.z, -22, 20)
    if (nextX === controls.target.x && nextY === controls.target.y && nextZ === controls.target.z) {
      recordFraming()
      return
    }

    const camera = controls.object as OrthographicCamera
    const offset = camera.position.clone().sub(controls.target)
    controls.target.set(nextX, nextY, nextZ)
    camera.position.copy(controls.target).add(offset)
    recordFraming()
    invalidate()
  }, [invalidate, recordFraming])

  return (
    <MapControls
      ref={controlsRef}
      onChange={constrainCamera}
      onStart={stopAnimation}
      makeDefault
      target={CAMERA_TARGET.toArray()}
      enableRotate={false}
      enableDamping={false}
      screenSpacePanning={false}
      minZoom={1}
      maxZoom={28}
      mouseButtons={{ LEFT: 2, MIDDLE: 1, RIGHT: 0 }}
    />
  )
}

function Terrain({
  palette,
  quality,
  radialSegments,
  rings,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  radialSegments: number
  rings: number
}) {
  const geometry = useMemo(
    () => createTerrainGeometry(palette, radialSegments, rings),
    [palette, radialSegments, rings]
  )
  const texture = useIsometricSpriteTexture(
    '/images/world-map/isometric/terrain/painted-meadow-v2.webp',
    quality
  )
  const cliff = useMemo(() => createCliffMaterial(), [])
  useEffect(() => () => cliff.dispose(), [cliff])
  useEffect(() => () => geometry.dispose(), [geometry])
  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshBasicMaterial
          key={texture?.uuid ?? 'loading-meadow'}
          attach="material-0"
          map={texture}
          color={texture ? palette.light : palette.green}
          vertexColors
          toneMapped={false}
          fog={false}
        />
        <primitive object={cliff} attach="material-1" />
      </mesh>
      <LandscapeDressing palette={palette} quality={quality} ground={geometry} />
    </group>
  )
}

function LandscapeDressing({
  palette,
  quality,
  ground,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  ground: BufferGeometry
}) {
  const texture = useIsometricSpriteTexture(
    '/images/world-map/isometric/terrain/landscape-details-v1.webp',
    quality
  )
  return (
    <LandscapeEnvironment palette={palette} quality={quality} texture={texture} ground={ground} />
  )
}

function River({
  palette,
  quality,
  animate,
  energy,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  animate: boolean
  energy: number
}) {
  const segments = quality === 'high' ? 72 : 48
  const bed = useMemo(() => createRiverRibbonGeometry(2.05, segments, 0.025), [segments])
  const water = useMemo(() => createRiverRibbonGeometry(1.55, segments, 0.075), [segments])
  const reflections = useMemo(
    () => [
      createRiverRibbonGeometry(0.13, 12, 0.105, [0.19, 0.26]),
      createRiverRibbonGeometry(0.1, 12, 0.105, [0.61, 0.69]),
    ],
    []
  )
  const flowCurve = useMemo(() => createRiverCurve(0.16), [])
  const waterMaterial = useMemo(
    () => createPaintedWaterMaterial(palette, energy),
    [palette, energy]
  )
  useEffect(() => () => waterMaterial.dispose(), [waterMaterial])
  const bankColor = useMemo(
    () =>
      new Color(palette.warmSand)
        .lerp(new Color(palette.green), 0.3)
        .lerp(new Color(palette.warmDepth), 0.25),
    [palette]
  )

  useEffect(
    () => () => {
      bed.dispose()
      water.dispose()
    },
    [bed, water]
  )
  useEffect(() => () => reflections.forEach((geometry) => geometry.dispose()), [reflections])

  return (
    <group>
      <mesh geometry={bed}>
        <meshBasicMaterial color={bankColor} toneMapped={false} fog={false} />
      </mesh>
      <mesh geometry={water} material={waterMaterial} />
      {reflections.map((geometry, index) => (
        <mesh key={index} geometry={geometry} renderOrder={-899_999}>
          <meshBasicMaterial
            color={palette.light}
            transparent
            opacity={0.12 + energy * 0.1}
            depthWrite={false}
          />
        </mesh>
      ))}
      {animate
        ? [0, 0.33, 0.66].map((offset) => (
            <RiverMote key={offset} curve={flowCurve} offset={offset} palette={palette} />
          ))
        : null}
    </group>
  )
}

function RiverMote({
  curve,
  offset,
  palette,
}: {
  curve: CatmullRomCurve3
  offset: number
  palette: WorldScenePalette
}) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.position.copy(curve.getPointAt((offset + clock.elapsedTime * 0.025) % 1))
  })

  return (
    <mesh ref={ref} position={curve.getPointAt(offset)}>
      <sphereGeometry args={[0.14, 8, 6]} />
      <meshBasicMaterial color={palette.light} transparent opacity={0.8} />
    </mesh>
  )
}

function createForestPoints(count: number) {
  let seed = 20260727
  const random = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
  const points: Array<readonly [number, number, number, number]> = []

  for (let attempt = 0; points.length < count && attempt < 2000; attempt += 1) {
    const angle = random() * Math.PI * 2
    const radius = Math.sqrt(random()) * 0.88
    const x = 2 + Math.cos(angle) * 40 * radius
    const z = 4 + Math.sin(angle) * 24 * radius
    const clearOfLandmarks = Object.values(WORLD_PLACEMENTS).every(
      (placement) =>
        Math.hypot(x - placement.position[0], z - placement.position[2]) >
        placement.pickRadius + 1.2
    )

    if (clearOfLandmarks && trailDistanceAt(x, z) > 1.8 && riverDistanceAt(x, z) > 2.8) {
      points.push([x, terrainSurfaceHeightAt(x, z) + 0.75, z, 0.65 + random() * 0.8])
    }
  }

  return points
}

function Forest({ count, quality }: { count: number; quality: WorldQuality }) {
  const points = useMemo(() => createForestPoints(count), [count])
  const texture = useIsometricSpriteTexture(
    '/images/world-map/isometric/environment/ancient-grove.webp',
    quality
  )

  if (!texture) return null

  return points.map(([x, y, z, scale]) => (
    <sprite
      key={`${x}-${z}`}
      center={toThreeSpriteCenter([0.5, 0.96])}
      position={[x, y - 0.7, z]}
      renderOrder={isometricRenderOrder([x, y, z])}
      scale={[scale * 3.2, scale * 3.05, 1]}
    >
      <spriteMaterial
        map={texture}
        alphaTest={0.1}
        depthTest
        depthWrite={false}
        fog={false}
        toneMapped={false}
        transparent
      />
    </sprite>
  ))
}

const AMBIENT_WISPS = [
  { center: [-8, 2, 7] as const, radius: 6, speed: 0.09, offset: 0, color: 'gold' },
  { center: [12, 2.4, -6] as const, radius: 8, speed: 0.065, offset: 2, color: 'cyan' },
  {
    center: [-20, 2.1, -8] as const,
    radius: 5,
    speed: 0.075,
    offset: 4,
    color: 'violet',
  },
] as const satisfies readonly {
  center: readonly [number, number, number]
  radius: number
  speed: number
  offset: number
  color: 'gold' | 'cyan' | 'violet'
}[]

function AmbientWisps({ palette }: { palette: WorldScenePalette }) {
  return (
    <group>
      {AMBIENT_WISPS.map((wisp) => (
        <AmbientWisp key={wisp.color} {...wisp} palette={palette} />
      ))}
    </group>
  )
}

function AmbientWisp({
  center,
  radius,
  speed,
  offset,
  color,
  palette,
}: (typeof AMBIENT_WISPS)[number] & { palette: WorldScenePalette }) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const angle = clock.elapsedTime * speed + offset
    ref.current.position.set(
      center[0] + Math.cos(angle) * radius,
      center[1] + Math.sin(angle * 2) * 0.45,
      center[2] + Math.sin(angle) * radius * 0.62
    )
  })

  return (
    <mesh ref={ref} position={center}>
      <octahedronGeometry args={[0.18, 0]} />
      <meshBasicMaterial color={palette[color]} transparent opacity={0.78} depthWrite={false} />
    </mesh>
  )
}

function FlowLink({
  from,
  to,
  palette,
  amount,
  canSacred,
  harmonized,
  dissonant,
}: {
  from: WorldLandmarkId
  to: WorldLandmarkId
  palette: WorldScenePalette
  amount: number
  canSacred: boolean
  harmonized: boolean
  dissonant: boolean
}) {
  const start = WORLD_PLACEMENTS[from].position
  const end = WORLD_PLACEMENTS[to].position
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(start[0], start[1] + 0.5, start[2]),
        new Vector3(
          (start[0] + end[0]) / 2,
          Math.max(start[1], end[1]) + 1.2,
          (start[2] + end[2]) / 2
        ),
        new Vector3(end[0], end[1] + 0.5, end[2]),
      ]),
    [end, start]
  )
  const geometry = useMemo(() => new TubeGeometry(curve, 32, 0.08, 6, false), [curve])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group>
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color={harmonized ? palette.gold : dissonant ? palette.violet : palette.cyan}
          transparent
          opacity={amount > 0 || harmonized ? 0.72 : dissonant ? 0.34 : 0.12}
        />
      </mesh>
      {amount > 0 ? (
        <FlowOrb
          curve={curve}
          palette={palette}
          canSacred={canSacred}
          speed={0.08 + amount * 0.035}
        />
      ) : null}
    </group>
  )
}

function FlowOrb({
  curve,
  palette,
  canSacred,
  speed,
}: {
  curve: CatmullRomCurve3
  palette: WorldScenePalette
  canSacred: boolean
  speed: number
}) {
  const ref = useRef<Mesh>(null)

  useFrame(({ clock }) => {
    if (!ref.current || !canSacred) return
    ref.current.position.copy(curve.getPointAt((clock.elapsedTime * speed) % 1))
  })

  return (
    <mesh ref={ref} position={curve.getPointAt(0)}>
      <icosahedronGeometry args={[0.24, 1]} />
      <meshBasicMaterial color={palette.gold} />
    </mesh>
  )
}

function InteractiveLandmark({
  id,
  selected,
  palette,
  onSelect,
  children,
  pickProxy,
}: {
  id: WorldLandmarkId
  selected: boolean
  palette: WorldScenePalette
  onSelect: (id: WorldLandmarkId) => void
  children: ReactNode
  pickProxy?: ReactNode
}) {
  const [hovered, setHovered] = useState(false)
  const placement = WORLD_PLACEMENTS[id]
  useCursor(hovered)

  function selectLandmark(event: ThreeEvent<MouseEvent>) {
    event.stopPropagation()
    if (event.delta <= 4) onSelect(id)
  }

  return (
    <group
      position={placement.position}
      onClick={selectLandmark}
      onPointerOver={(event) => {
        event.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.16, 0]}>
        <torusGeometry
          args={[placement.pickRadius + (selected ? 0.2 : 0), selected ? 0.1 : 0.035, 8, 48]}
        />
        <meshBasicMaterial
          color={selected ? palette.violet : palette.cyan}
          transparent
          opacity={selected ? 0.95 : hovered ? 0.55 : 0.18}
        />
      </mesh>
      {pickProxy ?? (
        <mesh position={[0, placement.focusHeight / 2, 0]}>
          <cylinderGeometry
            args={[placement.pickRadius, placement.pickRadius, placement.focusHeight * 1.5, 12]}
          />
          <InvisibleMaterial color={palette.cyan} />
        </mesh>
      )}
    </group>
  )
}

function InvisibleMaterial({ color }: { color: string }) {
  return (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={0}
      depthWrite={false}
      colorWrite={false}
    />
  )
}

function IsometricLandmarkSprite({
  asset,
  worldPosition,
  quality,
  fallback,
}: {
  asset: IsometricSpriteAsset
  worldPosition: readonly [number, number, number]
  quality: WorldQuality
  fallback: ReactNode
}) {
  const texture = useIsometricSpriteTexture(asset.src, quality)

  if (!texture) return fallback

  return (
    <sprite
      center={toThreeSpriteCenter(asset.anchor)}
      position={[0, 0.08, 0]}
      renderOrder={isometricRenderOrder(worldPosition, asset.sortOffset)}
      scale={[asset.worldSize[0], asset.worldSize[1], 1]}
    >
      <spriteMaterial
        map={texture}
        alphaTest={0.1}
        depthTest
        depthWrite={false}
        fog={false}
        toneMapped={false}
        transparent
      />
    </sprite>
  )
}

function TreeLandmark({
  palette,
  quality,
  selected,
  coherence,
  harmonized,
  shadows,
  onSelect,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  selected: boolean
  coherence: number
  harmonized: boolean
  shadows: boolean
  onSelect: (id: WorldLandmarkId) => void
}) {
  const energy = harmonized ? 1.2 : 0.25 + coherence / 160

  return (
    <InteractiveLandmark
      id="tree"
      selected={selected}
      palette={palette}
      onSelect={onSelect}
      pickProxy={
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[5.8, 5.8, 11, 12]} />
          <InvisibleMaterial color={palette.gold} />
        </mesh>
      }
    >
      <TreeGroundGlow palette={palette} />
      <IsometricLandmarkSprite
        asset={WORLD_SPRITE_ASSETS.tree}
        worldPosition={WORLD_PLACEMENTS.tree.position}
        quality={quality}
        fallback={
          quality === 'high' ? (
            <Suspense
              fallback={<ProceduralTreeModel palette={palette} energy={energy} shadows={shadows} />}
            >
              <GeneratedTreeModel shadows={shadows} />
            </Suspense>
          ) : (
            <ProceduralTreeModel palette={palette} energy={energy} shadows={shadows} />
          )
        }
      />
      {[0, Math.PI / 2, Math.PI / 4].map((rotation) => (
        <mesh key={rotation} position={[0, 8.7, 0]} rotation={[rotation, rotation / 2, 0]}>
          <torusGeometry args={[1.35, 0.035, 8, 48]} />
          <meshStandardMaterial
            color={palette.gold}
            emissive={palette.gold}
            emissiveIntensity={energy}
          />
        </mesh>
      ))}
      <mesh position={[0, 8.7, 0]}>
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={palette.gold}
          emissive={palette.gold}
          emissiveIntensity={energy}
        />
      </mesh>
      <pointLight color={palette.gold} intensity={energy} distance={12} position={[0, 8.7, 0]} />
    </InteractiveLandmark>
  )
}

function TreeGroundGlow({ palette }: { palette: WorldScenePalette }) {
  const geometry = useMemo(() => createTreeGroundGlowGeometry(palette), [palette])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <mesh geometry={geometry} renderOrder={-800_000} raycast={() => undefined}>
      <meshBasicMaterial
        vertexColors
        transparent
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function GeneratedTreeModel({ shadows }: { shadows: boolean }) {
  const { scene } = useGLTF('/models/world-map/tree/tree-optimized.glb')

  useLayoutEffect(() => {
    scene.traverse((object) => {
      if (!(object instanceof Mesh)) return
      object.castShadow = shadows
      object.receiveShadow = true
    })
  }, [scene, shadows])

  return <primitive object={scene} position={[0, 5.15, 0]} rotation={[0, 0.5, 0]} scale={5.4} />
}

function ProceduralTreeModel({
  palette,
  energy,
  shadows,
}: {
  palette: WorldScenePalette
  energy: number
  shadows: boolean
}) {
  return (
    <group>
      {[5.7, 4.9, 4.1].map((radius, index) => (
        <mesh key={radius} receiveShadow position={[0, 0.16 + index * 0.18, 0]}>
          <cylinderGeometry args={[radius, radius + 0.15, 0.32, 32]} />
          <meshStandardMaterial color={palette.solarpunk} roughness={0.94} />
        </mesh>
      ))}
      <mesh castShadow={shadows} position={[0, 3.8, 0]}>
        <cylinderGeometry args={[0.72, 1.62, 7.2, 10]} />
        <meshStandardMaterial color={palette.warmSand} roughness={0.9} />
      </mesh>
      {Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * Math.PI * 2
        return (
          <mesh
            key={angle}
            castShadow={shadows}
            position={[Math.cos(angle) * 2.1, 0.7, Math.sin(angle) * 2.1]}
            rotation={[0, -angle, Math.PI / 2.7]}
          >
            <cylinderGeometry args={[0.14, 0.46, 4.6, 6]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.92} />
          </mesh>
        )
      })}
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2 + 0.18
        return (
          <mesh
            key={`branch-${index}`}
            castShadow={shadows}
            position={[
              Math.cos(angle) * (1.15 + (index % 3) * 0.18),
              5.45 + (index % 2) * 0.35,
              Math.sin(angle) * (1.15 + (index % 3) * 0.18),
            ]}
            rotation={[0, -angle, 0.82 + (index % 3) * 0.08]}
          >
            <cylinderGeometry args={[0.1, 0.3, 3.6 + (index % 2) * 0.5, 7]} />
            <meshStandardMaterial color={palette.warmSand} roughness={0.9} />
          </mesh>
        )
      })}
      {[
        [-2.7, 7.2, 0.3, 1.45],
        [-1.6, 8.15, -1.2, 1.35],
        [-1.2, 7.35, 2.1, 1.25],
        [-0.3, 8.9, 0.4, 1.55],
        [0.1, 7.75, -2.45, 1.3],
        [1.2, 8.4, 1.7, 1.35],
        [2.55, 7.45, 0.2, 1.5],
        [1.85, 7.1, -1.75, 1.2],
        [-2.1, 6.75, -1.8, 1.15],
        [0.1, 6.75, 2.8, 1.15],
        [0.25, 9.65, -0.45, 1.25],
        [2.3, 8.5, -0.8, 1.1],
        [-2.4, 8.6, 1.15, 1.05],
      ].map(([x, y, z, scale]) => (
        <mesh key={`${x}-${z}`} castShadow={shadows} position={[x, y, z]} scale={scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={palette.green}
            emissive={palette.gold}
            emissiveIntensity={energy * 0.18}
            roughness={0.76}
          />
        </mesh>
      ))}
    </group>
  )
}

function RootHomeLandmark({
  palette,
  quality,
  selected,
  resonance,
  shadows,
  onSelect,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  selected: boolean
  resonance: number
  shadows: boolean
  onSelect: (id: WorldLandmarkId) => void
}) {
  return (
    <InteractiveLandmark
      id="root-home"
      selected={selected}
      palette={palette}
      onSelect={onSelect}
      pickProxy={
        <mesh position={[0, 2.5, 0]}>
          <boxGeometry args={[7, 5, 7]} />
          <InvisibleMaterial color={palette.gold} />
        </mesh>
      }
    >
      <IsometricLandmarkSprite
        asset={WORLD_SPRITE_ASSETS['root-home']}
        worldPosition={WORLD_PLACEMENTS['root-home'].position}
        quality={quality}
        fallback={
          <group>
            <mesh castShadow={shadows} receiveShadow position={[0, 1.5, 0]} scale={[3.2, 1.8, 2.8]}>
              <sphereGeometry args={[1, 28, 16]} />
              <meshStandardMaterial
                color={palette.warmSand}
                emissive={palette.gold}
                emissiveIntensity={0.04}
                roughness={0.9}
              />
            </mesh>
            {Array.from({ length: 8 }, (_, index) => {
              const angle = -1.1 + index * 0.31
              return (
                <mesh
                  key={angle}
                  castShadow={shadows}
                  position={[Math.sin(angle) * 2, 2.3, Math.cos(angle) * 1.7]}
                  rotation={[Math.PI / 2.7, 0, -angle * 0.55]}
                >
                  <cylinderGeometry args={[0.12, 0.32, 4.5, 6]} />
                  <meshStandardMaterial color={palette.warmSand} roughness={0.94} />
                </mesh>
              )
            })}
            <mesh position={[0, 1.55, 2.55]}>
              <circleGeometry args={[0.95, 32]} />
              <meshBasicMaterial color={palette.cosmic} />
            </mesh>
            <mesh position={[0, 1.55, 2.58]}>
              <torusGeometry args={[1.15, 0.18, 8, 32]} />
              <meshStandardMaterial
                color={palette.gold}
                emissive={palette.gold}
                emissiveIntensity={0.18 + resonance / 130}
                metalness={0.45}
                roughness={0.42}
              />
            </mesh>
          </group>
        }
      />
      <pointLight
        color={palette.gold}
        intensity={0.35 + resonance / 100}
        distance={5}
        position={[0, 1.5, 3]}
      />
    </InteractiveLandmark>
  )
}

function EarthInstituteLandmark({
  palette,
  quality,
  selected,
  resonance,
  shadows,
  onSelect,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  selected: boolean
  resonance: number
  shadows: boolean
  onSelect: (id: WorldLandmarkId) => void
}) {
  const domes = [
    [0, 0.62, 0, 2.4],
    [-3, 0.62, 1.7, 1.6],
    [2.8, 0.62, 1.9, 1.35],
  ] as const

  return (
    <InteractiveLandmark
      id="earth"
      selected={selected}
      palette={palette}
      onSelect={onSelect}
      pickProxy={
        <mesh position={[0, 2.5, 0]}>
          <cylinderGeometry args={[6, 6, 5, 16]} />
          <InvisibleMaterial color={palette.cyan} />
        </mesh>
      }
    >
      <IsometricLandmarkSprite
        asset={WORLD_SPRITE_ASSETS.earth}
        worldPosition={WORLD_PLACEMENTS.earth.position}
        quality={quality}
        fallback={
          <group>
            <mesh castShadow={shadows} receiveShadow position={[0, 0.3, 0]}>
              <cylinderGeometry args={[4.4, 4.8, 0.6, 32]} />
              <meshStandardMaterial
                color={palette.solarpunk}
                emissive={palette.cyan}
                emissiveIntensity={0.05}
                roughness={0.84}
              />
            </mesh>
            {domes.map(([x, y, z, radius]) => (
              <group key={`${x}-${z}`} position={[x, y, z]}>
                <mesh castShadow={shadows}>
                  <sphereGeometry args={[radius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial
                    color={palette.green}
                    transparent
                    opacity={0.13 + resonance / 900}
                    roughness={0.2}
                    depthWrite={false}
                  />
                </mesh>
                <mesh>
                  <sphereGeometry args={[radius * 1.01, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshStandardMaterial
                    color={palette.cyan}
                    emissive={palette.cyan}
                    emissiveIntensity={0.15 + resonance / 180}
                    wireframe
                  />
                </mesh>
              </group>
            ))}
            {Array.from({ length: 6 }, (_, index) => {
              const angle = (index / 6) * Math.PI * 2
              return (
                <mesh
                  key={angle}
                  castShadow={shadows}
                  position={[Math.cos(angle) * 5, 0.85, Math.sin(angle) * 5]}
                  rotation={[0, -angle, 0.15]}
                >
                  <boxGeometry args={[2.4, 0.08, 0.85]} />
                  <meshStandardMaterial
                    color={palette.cyan}
                    emissive={palette.cyan}
                    emissiveIntensity={0.08}
                    metalness={0.35}
                    roughness={0.4}
                  />
                </mesh>
              )
            })}
          </group>
        }
      />
      <pointLight
        color={palette.cyan}
        intensity={0.25 + resonance / 120}
        distance={10}
        position={[0, 4, 0]}
      />
    </InteractiveLandmark>
  )
}
