import { describe, expect, it } from 'vitest'
import { en } from '../../i18n/locales/en'
import { bn } from '../../i18n/locales/bn'
import {
  ghostPhoto,
  machineAt,
  machineDetails,
  machines,
  machinesByDestination,
  pick,
} from './machines'

/**
 * The map's content comes from the supplied story bible, so these checks prove
 * the 17 machines survived the trip from the Bible to the screen: the names,
 * the years, the destinations and the endings all still match the source.
 */
describe('the 17 machines', () => {
  it('has all 17, in campaign order', () => {
    expect(machines).toHaveLength(17)
    expect(machines.map((m) => m.sequence)).toEqual(
      Array.from({ length: 17 }, (_, i) => i + 1),
    )
    expect(new Set(machines.map((m) => m.id)).size).toBe(17)
  })

  it('keeps the story bible names and years', () => {
    expect(machines[0].name.en).toBe('Ranger 7')
    expect(machines[0].name.bn).toBe('রেঞ্জার ৭')
    expect(machines[0].yearNumber).toBe(1964)
    expect(machines[16].name.en).toBe('Ingenuity')
    expect(machines[16].yearNumber).toBe(2021)
  })

  it('groups the machines by where they went', () => {
    expect(machinesByDestination.moon.map((m) => m.sequence)).toEqual([1, 2, 3, 4, 5])
    expect(machinesByDestination.mars.map((m) => m.sequence)).toEqual([7, 10, 11, 13, 15, 16, 17])
    expect(machinesByDestination.deep.map((m) => m.sequence)).toEqual([6, 8, 9, 12, 14])
  })

  it('keeps the four kinds of ending the bible groups them into', () => {
    const byEnding = machines.reduce<Record<string, number[]>>((groups, m) => {
      groups[m.ending] = [...(groups[m.ending] ?? []), m.sequence]
      return groups
    }, {})

    expect(byEnding.crashed).toEqual([1, 3])
    expect(byEnding.returned).toEqual([4, 5])
    expect(byEnding.talking).toEqual([8, 9, 14])
    expect(byEnding.silent).toEqual([2, 6, 7, 10, 11, 13, 15, 16, 17])
    expect(byEnding.retired).toEqual([12])
  })

  it('gives every machine a name, a year, a destination and an ending', () => {
    for (const machine of machines) {
      expect(machine.name.en).toBeTruthy()
      expect(machine.name.bn).toBeTruthy()
      expect(machine.yearNumber).toBeGreaterThan(1900)
      expect(machine.location.en).toBeTruthy()
      expect(machine.location.bn).toBeTruthy()
      expect(machine.status.en).toBeTruthy()
      expect(machine.status.bn).toBeTruthy()
    }
  })

  it('looks a machine up by its number', () => {
    expect(machineAt(1)?.id).toBe('machine-01')
    expect(machineAt(17)?.id).toBe('machine-17')
    expect(machineAt(99)).toBeUndefined()
  })

  it('points each ring at that machine\u2019s real photograph', () => {
    expect(ghostPhoto(machines[0])).toBe('/images/ghosts/ranger-7/real.jpg')
    expect(ghostPhoto(machines[16])).toBe('/images/ghosts/ingenuity/real.jpg')
  })
})

describe('machine details', () => {
  it('carries the seven story parts for every machine, in both languages', () => {
    for (const machine of machines) {
      const detail = machineDetails[machine.id]
      expect(detail).toBeDefined()
      expect(detail.parts).toHaveLength(7)
      expect(detail.parts.map((p) => p.part)).toEqual([1, 2, 3, 4, 5, 6, 7])
      for (const part of detail.parts) {
        expect(part.title.en.length).toBeGreaterThan(0)
        expect(part.title.bn.length).toBeGreaterThan(0)
        expect(part.text.en.length).toBeGreaterThan(0)
        expect(part.text.bn.length).toBeGreaterThan(0)
      }
    }
  })

  it('carries the at-a-glance box and the robot voice card', () => {
    const detail = machineDetails['machine-01']
    expect(detail.atAGlance.en).toContain('Launch')
    expect(detail.atAGlance.bn).toContain('উৎক্ষেপণ')
    expect(detail.voice.en).toContain('Ranger 7')
    expect(detail.voice.bn).toContain('রেঞ্জার ৭')
    expect(detail.answer.en).toContain('Moon')
    expect(detail.answer.bn).toBeTruthy()
    expect(detail.imaginedVoice.en).toContain('Imagined voice')
    expect(detail.imaginedVoice.bn).toContain('কল্পিত কণ্ঠ')
  })
})

describe('the map copy', () => {
  it('carries every machine name and destination in both languages', () => {
    for (const machine of machines) {
      expect(machine.name.en).toBeTruthy()
      expect(machine.name.bn).toBeTruthy()
      expect(machine.location.en).toBeTruthy()
      expect(machine.location.bn).toBeTruthy()
    }
  })

  it('has map copy in both languages', () => {
    expect(en.ghostsMap.title).toBeTruthy()
    expect(bn.ghostsMap.title).toBeTruthy()
  })

  it('picks the language of a bilingual pair', () => {
    expect(pick({ en: 'Moon', bn: 'চাঁদ' }, 'en')).toBe('Moon')
    expect(pick({ en: 'Moon', bn: 'চাঁদ' }, 'bn')).toBe('চাঁদ')
  })
})
