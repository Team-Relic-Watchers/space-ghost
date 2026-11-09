import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import { MOON_RADIUS_UK } from '../three/MoonModel.constants'
import { SHOWCASE, normaliseShip, shipFitDistance, stageLayout } from './showcaseLayout'

/** Viewports the scene must look right on, from phones to ultrawide desktops. */
const ASPECTS = [0.45, 0.56, 0.75, 1, 1.33, 1.78, 2.1, 2.5]
const FOV = THREE.MathUtils.degToRad(SHOWCASE.fov) / 2

/** Camera basis for a layout, matching the convention used inside the scene. */
function cameraBasis(layout: ReturnType<typeof stageLayout>) {
  const position = new THREE.Vector3(...layout.cameraPosition)
  const forward = position.clone().negate().normalize()
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()
  return { position, forward, right, up }
}

/** Project a world point into normalised device coordinates. */
function toNdc(
  layout: ReturnType<typeof stageLayout>,
  aspect: number,
  point: THREE.Vector3,
): [number, number] {
  const camera = new THREE.PerspectiveCamera(SHOWCASE.fov, aspect, 0.05, 500)
  camera.position.set(...layout.cameraPosition)
  camera.lookAt(0, 0, 0)
  camera.updateMatrixWorld()
  const ndc = point.clone().project(camera)
  return [ndc.x, ndc.y]
}

describe('showcase framing', () => {
  it('fits the whole spacecraft inside the frame at every aspect ratio', () => {
    for (const aspect of ASPECTS) {
      const distance = shipFitDistance(aspect)
      const halfAngle = Math.min(FOV, Math.atan(Math.tan(FOV) * aspect))
      // Angular radius of the ship as seen from the camera.
      const angularRadius = Math.asin(SHOWCASE.shipRadius / distance)
      expect(angularRadius, `aspect ${aspect}`).toBeLessThan(halfAngle)
    }
  })

  it('pushes the camera back on portrait screens and brings it in on wide ones', () => {
    expect(shipFitDistance(0.56)).toBeGreaterThan(shipFitDistance(1.78))
    expect(shipFitDistance(1)).toBeLessThan(shipFitDistance(0.75))
  })

  it('normalises any loaded model to the documented hero radius', () => {
    const { scale } = normaliseShip({
      size: { x: 4, y: 2, z: 2 },
      centre: { x: 0, y: 0, z: 0 },
    })
    expect(scale).toBeCloseTo(SHOWCASE.shipRadius / 2, 6)
  })

  it('centres the real Ranger 7 GLB and scales it to the hero size', () => {
    // Measured from ranger-7.glb by scripts/check-glb-assets.mjs: 5.62 m span,
    // 4.77 m tall, centred 1.177 m above the origin.
    const { scale, offset } = normaliseShip({
      size: { x: 5.62, y: 4.766, z: 1.834 },
      centre: { x: 0, y: 1.177, z: -0.147 },
    })
    // The larger screen-facing extent becomes the hero diameter.
    expect((5.62 / 2) * scale).toBeCloseTo(SHOWCASE.shipRadius, 6)
    // The model centre lands on the origin, so the camera composition holds.
    expect(offset).toEqual([-0, -1.177, 0.147])
  })

  it('does not divide by zero for a degenerate model', () => {
    const { scale } = normaliseShip({
      size: { x: 0, y: 0, z: 0 },
      centre: { x: 0, y: 0, z: 0 },
    })
    expect(scale).toBe(1)
  })

  it('survives a zero or nonsense aspect ratio from a collapsed container', () => {
    expect(Number.isFinite(shipFitDistance(0))).toBe(true)
    expect(Number.isFinite(shipFitDistance(Number.NaN))).toBe(true)
    expect(Number.isFinite(stageLayout(-3).distance)).toBe(true)
  })
})

describe('showcase composition', () => {
  it('places the Moon in the upper right, clear of the title, disc fully on screen', () => {
    for (const aspect of ASPECTS) {
      const layout = stageLayout(aspect)
      const [x, y] = toNdc(layout, aspect, new THREE.Vector3(...layout.moonPosition))
      // The heading occupies the upper left, so the Moon keeps to the right.
      expect(x, `aspect ${aspect} x`).toBeGreaterThan(0.1)
      expect(y, `aspect ${aspect} y`).toBeGreaterThan(0.1)
      // Measure the disc, not just the centre: project the sphere's silhouette
      // radius, then require both edges to stay inside the frame.
      const radiusNdcX = layout.moonRadius / (Math.tan(FOV) * layout.moonDepth * aspect)
      const radiusNdcY = layout.moonRadius / (Math.tan(FOV) * layout.moonDepth)
      expect(x + radiusNdcX, `aspect ${aspect} right edge`).toBeLessThan(1)
      expect(y + radiusNdcY, `aspect ${aspect} top edge`).toBeLessThan(1)
      // And the placement matches what the layout reports.
      expect(layout.moonNdc[0]).toBeCloseTo(x, 6)
      expect(layout.moonNdc[1]).toBeCloseTo(y, 6)
    }
  })

  it('keeps the Moon behind the ship so the ship is never hidden', () => {
    for (const aspect of ASPECTS) {
      const layout = stageLayout(aspect)
      const { position, forward } = cameraBasis(layout)
      const toMoon = new THREE.Vector3(...layout.moonPosition).sub(position)
      const toShip = new THREE.Vector3().sub(position)
      expect(toMoon.dot(forward)).toBeGreaterThan(toShip.dot(forward))
      expect(layout.moonScale * MOON_RADIUS_UK).toBeCloseTo(layout.moonRadius, 6)
    }
  })

  it('keeps the Moon clear of the spacecraft', () => {
    for (const aspect of ASPECTS) {
      const layout = stageLayout(aspect)
      const gap = new THREE.Vector3(...layout.moonPosition).length() - layout.moonRadius
      expect(gap, `aspect ${aspect}`).toBeGreaterThan(SHOWCASE.shipRadius * 1.5)
    }
  })
})

describe('showcase orbit limits', () => {
  it('allows a little orbit but never a full orbit that loses the composition', () => {
    const layout = stageLayout(1.78)
    expect(layout.maxAzimuthAngle - layout.minAzimuthAngle).toBeCloseTo(
      SHOWCASE.orbit.azimuth * 2,
      6,
    )
  })

  it('never lets the camera swing round to the Moon’s dark side', () => {
    // The hero angle is well to the right of the Moon, so limiting the azimuth
    // keeps the camera — and the Sun it shares — on the lit side.
    for (const aspect of ASPECTS) {
      const layout = stageLayout(aspect)
      expect(layout.maxAzimuthAngle, `aspect ${aspect}`).toBeLessThan(Math.PI / 2)
      expect(layout.minAzimuthAngle).toBeGreaterThan(-Math.PI / 2)
    }
  })

  it('stops the camera tilting far enough down to leave the starfield', () => {
    for (const aspect of ASPECTS) {
      const layout = stageLayout(aspect)
      expect(layout.maxPolarAngle - layout.minPolarAngle).toBeLessThanOrEqual(
        SHOWCASE.orbit.polarUp + SHOWCASE.orbit.polarDown + 1e-9,
      )
      // 0 is straight above the ship, PI is straight below: stay well away from both.
      expect(layout.minPolarAngle).toBeGreaterThan(0.2)
      expect(layout.maxPolarAngle).toBeLessThan(2.6)
    }
  })

  it('stops zooming before the camera reaches the ship or leaves the nebula', () => {
    const layout = stageLayout(1.78)
    expect(layout.minDistance).toBeGreaterThan(SHOWCASE.shipRadius * 1.2)
    expect(layout.maxDistance).toBeGreaterThan(layout.minDistance)
  })
})
