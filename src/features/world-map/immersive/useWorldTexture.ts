'use client'
import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { TextureLoader, SRGBColorSpace, type Texture } from 'three'
import type { WorldQuality } from './WorldScene'

export function useWorldTexture(src: string, quality: WorldQuality) {
  const gl = useThree((state) => state.gl)
  const [texture, setTexture] = useState<Texture | null>(null)

  useEffect(() => {
    let active = true
    const pendingTexture = new TextureLoader().load(
      src,
      (loadedTexture) => {
        if (!active) {
          loadedTexture.dispose()
          return
        }

        loadedTexture.colorSpace = SRGBColorSpace
        loadedTexture.needsUpdate = true
        setTexture(loadedTexture)
      },
      undefined,
      () => {
        if (active) setTexture(null)
      }
    )

    return () => {
      active = false
      pendingTexture.dispose()
    }
  }, [src])

  // A quality change only adjusts sampling; it must not download/recreate
  // every sprite or briefly restore all procedural fallback models.
  useEffect(() => {
    if (!texture) return
    // Three textures are mutable GPU resources: update their sampler in place
    // instead of allocating a replacement image/texture for a quality change.
    // eslint-disable-next-line react-hooks/immutability
    texture.anisotropy = Math.min(
      gl.capabilities.getMaxAnisotropy(),
      quality === 'low' ? 1 : quality === 'medium' ? 2 : 4
    )
    texture.needsUpdate = true
  }, [gl, quality, texture])

  return texture
}
