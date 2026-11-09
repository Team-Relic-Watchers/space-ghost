import { describe, expect, it } from 'vitest'
import {
  formatCoordinates,
  impactOffsetUk,
  impactSite,
  impactSiteSchema,
  sunDirection,
} from './impactSite'

describe('Ranger 7 impact site record', () => {
  it('matches the NASA impact point in Mare Cognitum', () => {
    expect(impactSite.latitude).toBeCloseTo(-10.7, 5)
    expect(impactSite.longitude).toBeCloseTo(-20.612, 3)
    expect(formatCoordinates()).toEqual({ lat: '10.70°S', lon: '20.61°W' })
  })

  it('rejects impossible coordinates', () => {
    const bad = impactSiteSchema.safeParse({ ...impactSite, latitude: -95 })
    expect(bad.success).toBe(false)
  })

  it('places the impact point north and east of the tile centre', () => {
    const { x, z } = impactOffsetUk()
    expect(x).toBeGreaterThan(0) // 20.612 W is east of 20.69 W
    expect(z).toBeGreaterThan(0) // south is +z, and 10.70 S is south of 10.60 S
    expect(Math.hypot(x, z) * impactSite.tileWidthKm).toBeLessThan(5)
  })

  it('derives a unit sun vector for 31 July 1964', () => {
    const s = sunDirection()
    expect(Math.hypot(s.x, s.y, s.z)).toBeCloseTo(1, 6)
    expect(s.y).toBeGreaterThan(0)
  })
})
