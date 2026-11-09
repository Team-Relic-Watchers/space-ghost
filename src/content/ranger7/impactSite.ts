import { z } from 'zod'

/** Constant from the exported Moon Trek tiles (see ranger7-terrain.json). */
const MEAN_LUNAR_RADIUS_M = 1_737_400
const KM_PER_DEG = (Math.PI / 180) * (MEAN_LUNAR_RADIUS_M / 1000)

export const impactSiteSchema = z.object({
  name: z.string(),
  /** Sketchfab/NSSDCA text sometimes gives the older value; the IAU 2015 value is used. */
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  /** Width of the exported NASA Moon Trek tile in kilometres. */
  tileWidthKm: z.number().positive(),
  tileCenter: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  sun: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }),
  elevation: z.object({
    /** LOLA elevation of the tile's lowest / highest point, relative to 1737.4 km. */
    minM: z.number(),
    maxM: z.number(),
  }),
})

export type ImpactSite = z.infer<typeof impactSiteSchema>

export const impactSite: ImpactSite = impactSiteSchema.parse({
  name: 'Mare Cognitum',
  latitude: -10.7,
  longitude: -20.612,
  tileWidthKm: 23.8,
  tileCenter: { latitude: -10.6, longitude: -20.69 },
  sun: { latitude: 21.68, longitude: -71.71 },
  elevation: { minM: -2186.9, maxM: -1249.1 },
})

/**
 * Where the impact point sits on the terrain plane, in world units.
 * The plane is `tileWidthKm` wide with its centre at the origin, x pointing
 * east and z pointing south (the lunar surface normal is +y).
 */
export function impactOffsetUk(site: ImpactSite = impactSite) {
  const xKm =
    (site.longitude - site.tileCenter.longitude) * KM_PER_DEG * Math.cos((site.tileCenter.latitude * Math.PI) / 180)
  const zKm = -(site.latitude - site.tileCenter.latitude) * KM_PER_DEG
  return { x: xKm / site.tileWidthKm, z: zKm / site.tileWidthKm }
}

/** Unit sun direction in the same frame as the terrain plane. */
export function sunDirection(site: ImpactSite = impactSite) {
  const lat = (site.sun.latitude * Math.PI) / 180
  const lon = (site.sun.longitude * Math.PI) / 180
  const x = Math.cos(lat) * Math.sin(lon)
  const y = Math.cos(lat) * Math.cos(lon)
  const z = -Math.sin(lat)
  return { x, y, z }
}

export const formatCoordinates = (site: ImpactSite = impactSite) => {
  const lat = `${Math.abs(site.latitude).toFixed(2)}°${site.latitude < 0 ? 'S' : 'N'}`
  const lon = `${Math.abs(site.longitude).toFixed(2)}°${site.longitude < 0 ? 'W' : 'E'}`
  return { lat, lon }
}
