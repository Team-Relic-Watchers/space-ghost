import { z } from 'zod'
import { ranger7Mission } from './mission'

/**
 * Educational hotspots. Keys map onto the named node groups in ranger-7.glb.
 * Descriptions verified against the NSSDCA Ranger 7 spacecraft page and the
 * NSSDCA "Ranger to the Moon" camera description.
 */
export const hotspotSchema = z.object({
  id: z.enum(['cameras', 'solar', 'highGain', 'omni', 'structure']),
  /** Object names inside ranger-7.glb that make up this component. */
  nodes: z.array(z.string().min(1)).min(1),
  /** Offset from the component's centre for the info card, in model units. */
  anchor: z.tuple([z.number(), z.number(), z.number()]),
})

export type Hotspot = z.infer<typeof hotspotSchema>

export const hotspots: Hotspot[] = z.array(hotspotSchema).parse([
  {
    id: 'cameras',
    nodes: ['CameraAssembly'],
    anchor: [0.95, 0.25, 0],
  },
  {
    id: 'solar',
    nodes: ['SolarPanel_PosX', 'SolarPanel_NegX'],
    anchor: [0, 1.05, 0],
  },
  {
    id: 'highGain',
    nodes: ['HighGainAntenna'],
    anchor: [-0.55, -0.65, -0.55],
  },
  {
    id: 'omni',
    nodes: ['OmniAntenna'],
    anchor: [0.35, 0.95, 0],
  },
  {
    id: 'structure',
    nodes: ['Body', 'Tower', 'MidcourseMotor_Nozzle'],
    anchor: [0, -0.55, 0.55],
  },
])

export const HOTSPOT_IDS = hotspots.map((h) => h.id)

/** Ordered ids for progress display (re-exported so features share one list). */
export const inspectedTotal = HOTSPOT_IDS.length

/**
 * Key facts reused by the story panels and the challenge. Kept in one place so
 * numbers cannot drift between screens.
 */
export const keyFacts = {
  year: ranger7Mission.year,
  cameras: ranger7Mission.spacecraft.cameras,
  images: ranger7Mission.spacecraft.images,
  impactSpeedKmS: ranger7Mission.impact.speedMps / 1000,
  finalImageLeadS: ranger7Mission.imagery.finalImageLeadS,
  region: ranger7Mission.impact.region,
} as const
