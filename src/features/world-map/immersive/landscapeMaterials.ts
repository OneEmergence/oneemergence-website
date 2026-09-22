import { Color, MeshBasicMaterial } from 'three'
import type { WorldScenePalette } from './scenePalette'

export function createCliffMaterial() {
  const material = new MeshBasicMaterial({ vertexColors: true, toneMapped: false, fog: false })
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = 'varying vec3 vCliffPosition;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      '#include <begin_vertex>\nvCliffPosition = position;'
    )
    shader.fragmentShader = 'varying vec3 vCliffPosition;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      float strata = sin(vCliffPosition.y * 3.8 + sin(vCliffPosition.x * 0.3 + vCliffPosition.z * 0.3) * 0.5);
      float grain = sin(vCliffPosition.x * 0.65 + vCliffPosition.z * 0.48);
      diffuseColor.rgb *= 0.78 + strata * 0.12 + grain * 0.05;
    `
    )
  }
  material.customProgramCacheKey = () => 'sandstone-cliff-v1'
  return material
}

/** Static painted water: no clock, extra texture or animation in Still mode. */
export function createPaintedWaterMaterial(palette: WorldScenePalette, energy: number) {
  const material = new MeshBasicMaterial({ toneMapped: false, fog: false })
  material.onBeforeCompile = (shader) => {
    shader.uniforms.waterDeep = {
      value: new Color(palette.cyan).lerp(new Color(palette.solarpunk), 0.72),
    }
    shader.uniforms.waterShallow = {
      value: new Color(palette.cyan).lerp(new Color(palette.warmSand), 0.28),
    }
    shader.uniforms.waterLight = { value: new Color(palette.light) }
    shader.uniforms.waterEnergy = { value: energy }
    shader.vertexShader = 'varying vec2 vWaterUv;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      '#include <uv_vertex>\nvWaterUv = uv;'
    )
    shader.fragmentShader =
      `varying vec2 vWaterUv;
      uniform vec3 waterDeep;
      uniform vec3 waterShallow;
      uniform vec3 waterLight;
      uniform float waterEnergy;\n` + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      float bank = abs(vWaterUv.y - 0.5) * 2.0;
      float brush = sin(vWaterUv.x * 3.1 + sin(vWaterUv.y * 17.0)) * 0.025;
      float ripple = pow(max(0.0, sin(vWaterUv.y * 85.0 + sin(vWaterUv.x * 2.0))), 24.0);
      ripple *= smoothstep(0.4, 0.9, sin(vWaterUv.x * 4.2 + vWaterUv.y * 21.0));
      vec3 water = mix(waterDeep, waterShallow, 0.12 + pow(bank, 2.4) * 0.6 + brush);
      water = mix(water, waterLight, ripple * 0.11 + smoothstep(0.93, 1.0, bank) * 0.17);
      diffuseColor.rgb = water * (1.0 + waterEnergy * 0.22);
    `
    )
  }
  material.customProgramCacheKey = () => 'painted-river-v1'
  return material
}
