import { describe, expect, it } from 'vitest'
import { buildDots, getGhostRingSize, getLayout } from './mapLayout'

/**
 * The dotted trail is the map's one piece of geometry, so it is easy to break:
 * a stale width or a translated node makes every chain miss its planets. These
 * tests pin the promises the map makes to the eye.
 */
describe('the flight trail', () => {
  for (const width of [1120, 820, 640, 390, 320]) {
    it(`starts and ends on the rings at ${width}px`, () => {
      const layout = getLayout(width)
      const ring = getGhostRingSize(width) / 2
      const dots = buildDots(width, layout).filter((dot) => !dot.glow)

      expect(dots.length).toBeGreaterThan(0)

      for (const placement of layout.placements) {
        const cx = (placement.x / 100) * width
        const nearest = Math.min(
          ...dots.map((dot) => Math.hypot(dot.x - cx, dot.y - placement.y)),
        )

        // The chain reaches the ring, but never buries itself under it.
        expect(nearest).toBeGreaterThan(ring + 2)
        expect(nearest).toBeLessThan(ring + 12)
      }
    })

    it(`never paints a dot over a planet at ${width}px`, () => {
      const layout = getLayout(width)
      const ring = getGhostRingSize(width) / 2

      for (const dot of buildDots(width, layout)) {
        for (const placement of layout.placements) {
          const cx = (placement.x / 100) * width
          expect(Math.hypot(dot.x - cx, dot.y - placement.y)).toBeGreaterThan(ring)
        }
      }
    })
  }

  it('draws small, even dots rather than chunky blobs', () => {
    const layout = getLayout(1120)
    const dots = buildDots(1120, layout)
    const solids = dots.filter((dot) => !dot.glow)
    const halos = dots.filter((dot) => dot.glow)

    expect(Math.max(...solids.map((dot) => dot.r))).toBeLessThan(4)
    // Every dot has exactly one halo behind it.
    expect(halos.length).toBe(solids.length)
  })

  it('has nothing to draw before the stage is measured', () => {
    expect(buildDots(0, getLayout(0))).toEqual([])
  })
})
