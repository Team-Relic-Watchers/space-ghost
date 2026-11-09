import { z } from 'zod'

/**
 * The educational stops of mission 1, in the order the player meets them.
 * The 3D spacecraft inspection is not a hub stop: it sits on the left as the
 * persistent 3D explorer (see Ranger7Explorer), so the player can interact with
 * the spacecraft while reading through the mission info.
 */
export const missionStopIds = ['story', 'photos', 'briefing', 'challenge'] as const
export const stopIdSchema = z.enum(missionStopIds)
export type MissionStopId = z.infer<typeof stopIdSchema>

/** Runtime guard for values coming from the URL or persisted state. */
export const isStopId = (value: unknown): value is MissionStopId => stopIdSchema.safeParse(value).success

/** Which stop a mission step belongs to. */
export const STEP_STOP: Record<string, MissionStopId> = {
  intro: 'story',
  inspect: 'story',
  site: 'story',
  photos: 'photos',
  briefing: 'briefing',
  challenge: 'challenge',
  complete: 'challenge',
}

export const stopToStep = (stop: MissionStopId) => (stop === 'story' ? 'intro' : stop)
