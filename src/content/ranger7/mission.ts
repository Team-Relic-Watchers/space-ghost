import { z } from 'zod'

/**
 * Factual record for Ranger 7. Every value is drawn from NASA sources:
 *  - NSSDCA Ranger 7 spacecraft page (1964-041A)
 *  - NSSDCA "Ranger to the Moon" lunar page
 *  - NASA Science "Ranger 7" mission page
 *  - NSSDCA image catalog captions for frames A001, B001, A100, B200, A199
 */
export const ranger7MissionSchema = z.object({
  id: z.literal('ranger-7'),
  year: z.number().int(),
  launch: z.object({
    date: z.string(),
    utc: z.string(),
    vehicle: z.string(),
    site: z.string(),
  }),
  impact: z.object({
    date: z.string(),
    utc: z.string(),
    /** Seleneographic latitude in degrees (south negative). */
    lat: z.number().min(-90).max(90),
    /** Seleneographic longitude in degrees east (west negative). */
    lon: z.number().min(-180).max(180),
    region: z.string(),
    /** Speed at impact, metres per second. */
    speedMps: z.number().positive(),
  }),
  spacecraft: z.object({
    massKg: z.number().positive(),
    heightM: z.number().positive(),
    wingspanM: z.number().positive(),
    cameras: z.number().int().positive(),
    images: z.number().int().positive(),
  }),
  imagery: z.object({
    /** Seconds before impact that the final image was received. */
    finalImageLeadS: z.number().positive(),
  }),
  sources: z.array(z.object({ label: z.string(), url: z.string().url() })),
})

export type Ranger7Mission = z.infer<typeof ranger7MissionSchema>

export const ranger7Mission: Ranger7Mission = ranger7MissionSchema.parse({
  id: 'ranger-7',
  year: 1964,
  launch: {
    date: '28 July 1964',
    utc: '16:50:07',
    vehicle: 'Atlas-Agena B',
    site: 'Cape Canaveral, Launch Complex 12',
  },
  impact: {
    date: '31 July 1964',
    utc: '13:25:49',
    lat: -10.7,
    lon: -20.612,
    region: 'Mare Cognitum',
    speedMps: 2620,
  },
  spacecraft: {
    massKg: 365.6,
    heightM: 3.6,
    wingspanM: 4.6,
    cameras: 6,
    images: 4316,
  },
  imagery: { finalImageLeadS: 2.3 },
  sources: [
    { label: 'NASA NSSDCA — Ranger 7 spacecraft', url: 'https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1964-041A' },
    { label: 'NASA NSSDCA — Ranger to the Moon', url: 'https://nssdc.gsfc.nasa.gov/planetary/lunar/ranger.html' },
    { label: 'NASA Science — Ranger 7', url: 'https://science.nasa.gov/mission/ranger-7/' },
    { label: 'NASA NSSDCA — Ranger 7 images of the Moon', url: 'https://nssdc.gsfc.nasa.gov/imgcat/html/mission_page/EM_Ranger_7_page1.html' },
  ],
})
