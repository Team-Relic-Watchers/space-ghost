import { describe, expect, it } from 'vitest'
import { firstMachineMatches, journey, travelsBackwards } from './journey'

describe('journey content', () => {
  it('travels backward from 2026 to 1964 and starts with Ranger 7', () => {
    expect(journey.originYear).toBe(2026)
    expect(journey.destinationYear).toBe(1964)
    expect(journey.firstMachine.id).toBe('ranger-7')
  })

  it('travels backward in time', () => {
    expect(travelsBackwards(journey)).toBe(true)
    expect(
      travelsBackwards({
        originYear: 1964,
        destinationYear: 2026,
        firstMachine: { id: 'ranger-7', launchYear: 2026 },
      }),
    ).toBe(false)
  })

  it('starts with a machine from the destination year', () => {
    expect(firstMachineMatches(journey)).toBe(true)
    expect(
      firstMachineMatches({
        originYear: 2026,
        destinationYear: 1964,
        firstMachine: { id: 'ranger-7', launchYear: 1970 },
      }),
    ).toBe(false)
  })
})
