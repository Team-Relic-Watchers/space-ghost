import { describe, expect, it } from 'vitest'
import { journey, journeySchema } from './journey'

describe('journey content', () => {
  it('travels backward from 2026 to 1964 and starts with Ranger 7', () => {
    expect(journey.originYear).toBe(2026)
    expect(journey.destinationYear).toBe(1964)
    expect(journey.firstMachine.id).toBe('ranger-7')
  })

  it('rejects a journey that does not go backward in time', () => {
    const result = journeySchema.safeParse({
      originYear: 1964,
      destinationYear: 2026,
      firstMachine: { id: 'ranger-7', launchYear: 2026 },
    })
    expect(result.success).toBe(false)
  })

  it('rejects a first machine from the wrong year', () => {
    const result = journeySchema.safeParse({
      originYear: 2026,
      destinationYear: 1964,
      firstMachine: { id: 'ranger-7', launchYear: 1970 },
    })
    expect(result.success).toBe(false)
  })
})
