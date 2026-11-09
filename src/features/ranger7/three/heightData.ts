import * as THREE from 'three'
import { TERRAIN } from './assetPaths'
import { impactSite } from '../../../content/ranger7/impactSite'

export interface HeightData {
  width: number
  height: number
  /** Metres above the datum (mean radius 1737.4 km), or null when decoding failed. */
  metres: Float32Array | null
}

export interface TerrainTextures {
  albedo: THREE.Texture
  lights: THREE.Texture
}

/** Loads the LRO WAC colour albedo and the pre-baked 1964 hillshade. */
export async function loadTerrainTextures(): Promise<TerrainTextures> {
  const loader = new THREE.TextureLoader()
  const [albedo, lights] = await Promise.all([loader.loadAsync(TERRAIN.albedo), loader.loadAsync(TERRAIN.lighting)])
  // Canvas decode + re-upload keeps the texture linear and flips V for the
  // mosaic's north-up rows (row 0 = the north edge of the tile).
  for (const tex of [albedo, lights]) {
    tex.flipY = false
    tex.colorSpace = THREE.NoColorSpace
    tex.needsUpdate = true
  }
  albedo.colorSpace = THREE.SRGBColorSpace
  return { albedo, lights }
}

/**
 * Decodes the two-byte height PNG (high byte in R, low byte in G) and maps it
 * to metres. Depends only on the Canvas API, so it is testable in jsdom.
 */
export async function decodeHeightPng(draw: (ctx: CanvasRenderingContext2D) => ImageData, width: number, height: number): Promise<HeightData> {
  const data = draw({} as CanvasRenderingContext2D).data
  const { minM, maxM } = impactSite.elevation
  const metres = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const texel = (data[i * 4] << 8) | data[i * 4 + 1]
    metres[i] = minM + (texel / 65535) * (maxM - minM)
  }
  return { width, height, metres }
}

/**
 * Decodes the 16-bit LOLA elevation PNG with the Canvas API and maps it back to
 * metres using the calibration stored in ranger7-terrain.json.
 */
export async function loadHeightData(loader: THREE.TextureLoader): Promise<HeightData> {
  let image: HTMLImageElement | ImageBitmap
  try {
    image = await loader.loadAsync(TERRAIN.height).then((tex) => {
      tex.dispose()
      return tex.image as HTMLImageElement | ImageBitmap
    })
  } catch (err) {
    console.error('Height map failed to load', err)
    return { width: 0, height: 0, metres: null }
  }

  const width = (image as ImageBitmap).width ?? (image as HTMLImageElement).naturalWidth
  const height = (image as ImageBitmap).height ?? (image as HTMLImageElement).naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { width, height, metres: null }
  ctx.drawImage(image as CanvasImageSource, 0, 0)
  const px = ctx.getImageData(0, 0, width, height).data

  const { minM, maxM } = impactSite.elevation
  const metres = new Float32Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const texel = (px[i * 4] << 8) | px[i * 4 + 1]
    metres[i] = minM + (texel / 65535) * (maxM - minM)
  }
  return { width, height, metres }
}
