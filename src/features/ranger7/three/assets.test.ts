import { describe, expect, it } from 'vitest'
import { GLB, TERRAIN } from './assetPaths'
import { MOON_RADIUS_UK } from './MoonModel.constants'
import { isStopId } from '../stops'

/** These paths are also asserted at build time by scripts/check-glb-assets.mjs. */
describe('3D asset contract', () => {
  it('points at the supplied GLB assets, never primitives', () => {
    expect(GLB.moon).toBe('/3d-assets/moon_small.glb')
    expect(GLB.ranger7).toBe('/3d-assets/ranger-7/ranger-7.glb')
  })

  it('uses the NASA Moon Trek terrain texture set', () => {
    expect(Object.values(TERRAIN).every((p) => p.startsWith('/3d-assets/ranger-7-terrain/'))).toBe(true)
  })

  it('uses the asset radius measured from the Moon GLB', () => {
    expect(MOON_RADIUS_UK).toBeCloseTo(1.271864, 5)
  })

  it('accepts only known mission stops', () => {
    expect(isStopId('photos')).toBe(true)
    expect(isStopId('engine')).toBe(false)
  })
})
