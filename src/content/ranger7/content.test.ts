import { describe, expect, it } from 'vitest'
import { ranger7Mission, ranger7MissionSchema } from './mission'
import { hotspots, HOTSPOT_IDS, keyFacts } from './hotspots'
import { photographs, quiz, firstPhotograph } from './imagery'
import { en } from '../../i18n/locales/en'
import { bn } from '../../i18n/locales/bn'

const read = (obj: object, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], obj)

describe('Ranger 7 facts', () => {
  it('uses sourced NASA values', () => {
    expect(ranger7Mission.spacecraft.cameras).toBe(6)
    expect(ranger7Mission.spacecraft.images).toBe(4316)
    expect(ranger7Mission.impact.speedMps).toBe(2620)
    expect(ranger7Mission.imagery.finalImageLeadS).toBe(2.3)
    expect(ranger7Mission.launch.date).toBe('28 July 1964')
    expect(ranger7Mission.impact.utc).toBe('13:25:49')
  })

  it('validates through Zod and lists the NASA source pages', () => {
    expect(ranger7MissionSchema.safeParse(ranger7Mission).success).toBe(true)
    expect(ranger7Mission.sources.length).toBeGreaterThanOrEqual(4)
    expect(ranger7Mission.sources.every((s) => s.url.includes('nasa.gov'))).toBe(true)
  })

  it('formats the impact speed as 2.62 km/s', () => {
    expect(keyFacts.impactSpeedKmS).toBeCloseTo(2.62, 5)
  })
})

describe('upgradeable hotspot map', () => {
  it('has one model-backed entry per required component', () => {
    expect(HOTSPOT_IDS).toEqual(['cameras', 'solar', 'highGain', 'omni', 'structure'])
    expect(hotspots.find((h) => h.id === 'cameras')?.nodes).toEqual(['CameraAssembly'])
    const allNodes = hotspots.flatMap((h) => h.nodes)
    expect(new Set(allNodes).size).toBe(allNodes.length)
  })

  it('has copy for every hotspot in both languages', () => {
    for (const h of hotspots) {
      for (const dict of [en, bn]) {
        expect(read(dict, `ranger7.inspect.hotspots.${h.id}.title`)).toBeTruthy()
        expect(read(dict, `ranger7.inspect.hotspots.${h.id}.body`)).toBeTruthy()
      }
    }
  })
})

describe('Ranger 7 photographs and challenge', () => {
  it('uses a local local copy of each NASA frame with its source page', () => {
    const frames = [...photographs, firstPhotograph]
    for (const p of frames) {
      expect(p.src.startsWith('/images/ranger-7/')).toBe(true)
      expect(p.sourceUrl).toContain('nssdc.gsfc.nasa.gov/imgcat')
      expect(p.credit).toContain('NASA')
    }
    expect(photographs.map((p) => p.id)).toEqual(['b001', 'a100', 'b200', 'a199'])
  })

  it('orders frames by closeness, with the last A-camera frame last', () => {
    expect(photographs[photographs.length - 1].id).toBe('a199')
  })

  it('has four questions whose answers and explanations exist in both languages', () => {
    expect(quiz).toHaveLength(4)
    for (const q of quiz) {
      expect(q.choices).toContain(q.correct)
      for (const dict of [en, bn]) {
        expect(read(dict, `ranger7.challenge.questions.${q.id}.question`)).toBeTruthy()
        expect(read(dict, `ranger7.challenge.questions.${q.id}.explain`)).toBeTruthy()
        for (const letter of q.choices) {
          expect(read(dict, `ranger7.challenge.questions.${q.id}.${letter}`)).toBeTruthy()
        }
      }
    }
  })
})
