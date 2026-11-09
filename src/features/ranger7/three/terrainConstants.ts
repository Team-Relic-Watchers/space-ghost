/** Real lunar radius in kilometres (IAU mean value). */
export const MOON_RADIUS_KM = 1737.4

/** Render the 23.8 km terrain patch on a sphere of this radius, in world units. */
export const TERRAIN_SPHERE_UK = 240

/** Angular size of the terrain patch measured from the sphere's centre. */
export const TERRAIN_ARC = 23.8 / MOON_RADIUS_KM

/** Camera orbit distance used by the site explorer. */
export const ORBIT_DISTANCE_UK = TERRAIN_SPHERE_UK

/** Orbit pivot sits at the surface point under the patch centre. */
export const ORBIT_TARGET_UK: [number, number, number] = [0, 0, 0]
