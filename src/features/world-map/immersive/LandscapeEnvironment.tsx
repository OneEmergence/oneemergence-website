'use client'

import { useEffect, useMemo } from 'react'
import { MeshBasicMaterial, type BufferGeometry, type Texture } from 'three'
import { createTerrainHeightSampler } from './worldGeometry'
import {
  createGardenPathsGeometry,
  createLandscapeDetails,
  createLandscapeDetailsGeometry,
  createPlaceTerracesGeometry,
} from './landscapeGeometry'
import type { WorldScenePalette } from './scenePalette'
import type { WorldQuality } from './WorldScene'

function pavingMaterial() {
  const material = new MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = 'varying vec2 vPavingUv;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      '#include <uv_vertex>\nvPavingUv = uv;'
    )
    shader.fragmentShader = 'varying vec2 vPavingUv;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      vec2 cell = vec2(vPavingUv.x * 1.8 + mod(floor(vPavingUv.y * 3.0), 2.0) * 0.5, vPavingUv.y * 3.0);
      vec2 edge = min(fract(cell), 1.0 - fract(cell));
      float joint = smoothstep(0.035, 0.09, min(edge.x, edge.y));
      float variation = fract(sin(dot(floor(cell), vec2(12.9898,78.233))) * 43758.5453);
      diffuseColor.rgb *= (0.76 + variation * 0.22) * mix(0.51, 1.0, joint);
    `
    )
  }
  material.customProgramCacheKey = () => 'garden-paving-v1'
  return material
}

function detailMaterial(texture: Texture | null) {
  const material = new MeshBasicMaterial({
    map: texture,
    alphaTest: 0.5,
    toneMapped: false,
    fog: false,
  })
  // The generated atlas has a deliberate magenta key, not baked checkerboard.
  // Key in the material so the original painted pixels remain a single reusable asset.
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      float spill = max(0.0, min(diffuseColor.r, diffuseColor.b) - diffuseColor.g);
      float key = smoothstep(0.12, 0.36, spill);
      diffuseColor.a *= 1.0 - key;
      diffuseColor.rb -= vec2(spill);
    `
    )
  }
  material.customProgramCacheKey = () => 'garden-atlas-key-v1'
  return material
}

export function LandscapeEnvironment({
  palette,
  quality,
  texture,
  ground,
}: {
  palette: WorldScenePalette
  quality: WorldQuality
  texture: Texture | null
  ground: BufferGeometry
}) {
  const heightAt = useMemo(() => createTerrainHeightSampler(ground), [ground])
  const paths = useMemo(() => createGardenPathsGeometry(palette, heightAt), [palette, heightAt])
  const terraces = useMemo(
    () => createPlaceTerracesGeometry(palette, heightAt),
    [palette, heightAt]
  )
  const details = useMemo(
    () =>
      createLandscapeDetailsGeometry(
        createLandscapeDetails(quality === 'low' ? 68 : quality === 'medium' ? 94 : 120)
      ),
    [quality]
  )
  const paving = useMemo(() => pavingMaterial(), [])
  const paint = useMemo(() => detailMaterial(texture), [texture])
  useEffect(
    () => () => {
      paths.dispose()
      terraces.dispose()
    },
    [paths, terraces]
  )
  useEffect(() => () => details.dispose(), [details])
  useEffect(() => () => paving.dispose(), [paving])
  useEffect(() => () => paint.dispose(), [paint])
  return (
    <group>
      <mesh geometry={paths} material={paving} />
      <mesh geometry={terraces} material={paving} />
      {texture ? <mesh geometry={details} material={paint} /> : null}
    </group>
  )
}
