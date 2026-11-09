import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import { impactSite, impactOffsetUk, sunDirection } from '../../../content/ranger7/impactSite'
import { ImpactMarker } from './ImpactMarker'

import { loadHeightData, loadTerrainTextures, type HeightData, type TerrainTextures } from '../three/heightData'

const WIDTH_UK = 8 // visual size of the 23.8 km patch; see SITE_SCALE below
const GRID = 96

/**
 * Vertical scale in world units per kilometre. Height exports use kilometres
 * above the 1737.4 km datum; only the patch-wide relief (< 1 km) is drawn, so
 * this large factor is safe and keeps craters visible.
 */
const SITE_SCALE = 6

/** Lowest point of the patch, subtracted so the ground sits at y = 0. */
const BASELINE_KM = impactSite.elevation.minM / 1000

/** Flat mosaic terrain in the local horizontal plane: x = east, -z = north. */
export function ImpactTerrain() {
  const { t } = useTranslation()
  const [height, setHeight] = useState<HeightData | null>(null)
  const [tex, setTex] = useState<TerrainTextures | null>(null)

  useEffect(() => {
    let alive = true
    loadHeightData(new THREE.TextureLoader()).then((h) => alive && setHeight(h))
    loadTerrainTextures().then((tex) => alive && setTex(tex))
    return () => {
      alive = false
    }
  }, [])

  useEffect(
    () => () => {
      tex?.albedo.dispose()
      tex?.lights.dispose()
    },
    [tex],
  )

  const terrain = useMemo(() => {
    const w = WIDTH_UK
    const n = GRID + 1
    const pos = new Float32Array(n * n * 3)
    const colors = new Float32Array(n * n * 3)
    const index: number[] = []
    const scaleHeight = SITE_SCALE
    const sun = sunDirection()
    const sunVec = new THREE.Vector3(sun.x, sun.y, -sun.z).normalize()

    const sample = (i: number, j: number) => {
      if (!height?.metres) return 0
      const px = Math.min(height.width - 1, Math.round((i / GRID) * (height.width - 1)))
      const py = Math.min(height.height - 1, Math.round((j / GRID) * (height.height - 1)))
      return height.metres[py * height.width + px]
    }

    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const k = j * n + i
        const x = (i / GRID - 0.5) * w
        const z = (j / GRID - 0.5) * w
        const hKm = sample(i, j) / 1000 - BASELINE_KM
        pos[k * 3] = x
        pos[k * 3 + 1] = height?.metres ? hKm * scaleHeight : 0
        pos[k * 3 + 2] = z

        // Analytic hillshade from the elevation grid, so the light direction is
        // exactly the 1964 sub-solar direction regardless of the baked texture.
        const dzdx = (sample(Math.min(GRID, i + 1), j) - sample(Math.max(0, i - 1), j)) / (2 * (impactSite.tileWidthKm * 1000 / GRID))
        const dzdy = (sample(i, Math.min(GRID, j + 1)) - sample(i, Math.max(0, j - 1))) / (2 * (impactSite.tileWidthKm * 1000 / GRID))
        const normal = new THREE.Vector3(-dzdx, 1, -dzdy).normalize()
        const shade = height?.metres ? Math.max(0, normal.dot(sunVec)) : 0.75
        const lift = 0.22 + shade * 0.95
        colors[k * 3] = Math.min(1, lift * 1.03)
        colors[k * 3 + 1] = Math.min(1, lift)
        colors[k * 3 + 2] = Math.min(1, lift * 0.94)
      }
    }
    for (let j = 0; j < GRID; j++) {
      for (let i = 0; i < GRID; i++) {
        const a = j * n + i
        index.push(a, a + n, a + 1, a + 1, a + n, a + n + 1)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setIndex(index)
    geo.computeVertexNormals()
    return geo
  }, [height])

  useEffect(() => () => terrain.dispose(), [terrain])

  const offset = impactOffsetUk()
  const marker: [number, number] = [offset.x * WIDTH_UK, offset.z * WIDTH_UK]

  return (
    <group>
      <mesh geometry={terrain} receiveShadow>
        <meshStandardMaterial
          map={tex?.albedo}
          vertexColors
          roughness={1}
          metalness={0}
        />
      </mesh>
      <ImpactMarker position={marker} />
      {!height?.metres && (
        <Html center position={[0, 1.2, 0]}>
          <div className="site-marker site-marker--warning">{t('ranger7.site.terrainFallback')}</div>
        </Html>
      )}
    </group>
  )
}
