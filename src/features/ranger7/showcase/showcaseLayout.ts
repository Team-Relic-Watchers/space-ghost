import * as THREE from 'three'
import { MOON_RADIUS_UK } from '../three/MoonModel.constants'

/**
 * Art direction for the Ranger 7 showcase (Milestone 1).
 *
 * Ranger 7 is the subject and the Moon is the background, so the camera is
 * framed from the ship alone: the Moon is placed afterwards, using the camera's
 * own basis, so it always lands in the upper-left of the frame no matter how
 * wide or tall the viewport is. All the numbers that decide the look live here
 * so the composition can be tuned without touching the scene components.
 */
export const SHOWCASE = {
  /** Vertical field of view, in degrees. */
  fov: 38,
  /** World radius (bounding sphere) the Ranger 7 GLB is normalised to. */
  shipRadius: 1,
  /** Slack around the ship: 1 would touch the frame edge. */
  framing: 1.16,
  /** Direction from the ship to the camera; normalised at runtime. */
  cameraDir: [0.3, 0.17, 1] as const,
  /** Zoom limits, as multiples of the framing distance. */
  zoom: [0.62, 1.9] as const,
  /** How far the player may orbit away from the hero angle, in radians. */
  orbit: {
    azimuth: 0.42,
    /** Upward tilt limit from the hero angle; keeps the ship above the horizon. */
    polarUp: 0.34,
    /** Downward tilt limit; deliberately smaller so the camera never dips. */
    polarDown: 0.08,
  },
  moon: {
    /** Moon radius as a fraction of the frame's shorter half-axis. */
    size: 0.31,
    /** Where the Moon's centre wants to land, in normalised device coordinates. */
    ndc: [0.46, 0.24] as const,
    /** Keep the whole disc at least this far inside the frame edge. */
    margin: 0.06,
    /** Extra depth behind the ship, in world units. */
    depth: 7,
  },
} as const

export type Vec3 = [number, number, number]

export interface ShipBounds {
  /** Bounding box size of the loaded Ranger 7 GLB, in model units. */
  size: { x: number; y: number; z: number }
  /** Centre of that bounding box, in model units. */
  centre: { x: number; y: number; z: number }
}

/**
 * Turns a freshly loaded Ranger 7 GLB into the hero: centred on the origin and
 * scaled so its screen-facing half extent (the larger of width and height, as
 * the camera looks down -Z) equals SHOWCASE.shipRadius. Depth is ignored for
 * the fit because it barely changes the silhouette at this camera angle.
 *
 * Working in screen space is what keeps the hierarchy: in world space the solar
 * span is diagonal, which would shrink the spacecraft against the Moon.
 */
export function normaliseShip(bounds: ShipBounds): { scale: number; offset: Vec3 } {
  const halfExtent = Math.max(bounds.size.x, bounds.size.y) / 2
  return {
    scale: halfExtent > 0 ? SHOWCASE.shipRadius / halfExtent : 1,
    offset: [-bounds.centre.x, -bounds.centre.y, -bounds.centre.z],
  }
}

export interface StageLayout {
  /** Distance from the ship to the camera. */
  distance: number
  minDistance: number
  maxDistance: number
  cameraPosition: Vec3
  moonPosition: Vec3
  /** World radius of the Moon once scaled. */
  moonRadius: number
  /** Scale applied to the Moon GLB (unit radius 1.2719). */
  moonScale: number
  /** Where the Moon's centre lands on screen, in normalised device coordinates. */
  moonNdc: [number, number]
  /** Distance from the camera to the Moon's centre, along the view axis. */
  moonDepth: number
  minAzimuthAngle: number
  maxAzimuthAngle: number
  minPolarAngle: number
  maxPolarAngle: number
}

const WORLD_UP = new THREE.Vector3(0, 1, 0)
const clampAspect = (aspect: number) =>
  Number.isFinite(aspect) && aspect > 0 ? aspect : 1

/**
 * Distance at which a sphere of SHOWCASE.shipRadius fits the narrower side of
 * the frame. Portrait screens sit further back, landscape screens closer in.
 */
export function shipFitDistance(aspect: number, fov: number = SHOWCASE.fov): number {
  const safeAspect = clampAspect(aspect)
  const vertical = THREE.MathUtils.degToRad(fov) / 2
  const horizontal = Math.atan(Math.tan(vertical) * safeAspect)
  const halfAngle = Math.min(vertical, horizontal)
  return (SHOWCASE.shipRadius / Math.sin(halfAngle)) * SHOWCASE.framing
}

/** Camera, orbit limits and Moon placement for one viewport aspect ratio. */
export function stageLayout(aspect: number): StageLayout {
  const safeAspect = clampAspect(aspect)
  const dir = new THREE.Vector3(...SHOWCASE.cameraDir).normalize()
  const distance = shipFitDistance(safeAspect)
  const cameraPosition = dir.clone().multiplyScalar(distance)

  // Camera basis: the Moon is placed in frame space, then converted to world.
  const forward = dir.clone().negate()
  const right = new THREE.Vector3().crossVectors(forward, WORLD_UP).normalize()
  const up = new THREE.Vector3().crossVectors(right, forward).normalize()

  const halfFov = THREE.MathUtils.degToRad(SHOWCASE.fov) / 2
  const moonDepth = distance + SHOWCASE.moon.depth
  const halfHeight = Math.tan(halfFov) * moonDepth
  const halfWidth = halfHeight * safeAspect
  // Sized from the shorter half-axis so the Moon stays whole on portrait screens
  // and never grows into a wall on wide ones.
  const moonRadius = SHOWCASE.moon.size * Math.min(halfWidth, halfHeight)

  // Keep the whole disc inside the frame. The placement keeps its sign, so the
  // Moon stays on the side it was art-directed to, just pulled inwards on
  // viewports where it would otherwise overflow (tall phones, mostly).
  const limitX = Math.max(1 - SHOWCASE.moon.margin - moonRadius / halfWidth, 0)
  const limitY = Math.max(1 - SHOWCASE.moon.margin - moonRadius / halfHeight, 0)
  const sign = (n: number) => (n < 0 ? -1 : 1)
  const moonNdc: [number, number] = [
    sign(SHOWCASE.moon.ndc[0]) * Math.min(Math.abs(SHOWCASE.moon.ndc[0]), limitX),
    sign(SHOWCASE.moon.ndc[1]) * Math.min(Math.abs(SHOWCASE.moon.ndc[1]), limitY),
  ]

  const moonCentre = cameraPosition
    .clone()
    .addScaledVector(forward, moonDepth)
    .addScaledVector(right, moonNdc[0] * halfWidth)
    .addScaledVector(up, moonNdc[1] * halfHeight)

  const azimuth = Math.atan2(dir.x, dir.z)
  const polar = Math.acos(THREE.MathUtils.clamp(dir.y, -1, 1))

  return {
    distance,
    minDistance: distance * SHOWCASE.zoom[0],
    maxDistance: distance * SHOWCASE.zoom[1],
    cameraPosition: toVec3(cameraPosition),
    moonPosition: toVec3(moonCentre),
    moonRadius,
    moonScale: moonRadius / MOON_RADIUS_UK,
    moonNdc,
    moonDepth,
    minAzimuthAngle: azimuth - SHOWCASE.orbit.azimuth,
    maxAzimuthAngle: azimuth + SHOWCASE.orbit.azimuth,
    minPolarAngle: Math.max(0.2, polar - SHOWCASE.orbit.polarUp),
    maxPolarAngle: Math.min(2.6, polar + SHOWCASE.orbit.polarDown),
  }
}

const toVec3 = (v: THREE.Vector3): Vec3 => [v.x, v.y, v.z]
