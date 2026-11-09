import { z } from 'zod'

export const journeySchema = z
  .object({
    originYear: z.number().int(),
    destinationYear: z.number().int(),
    firstMachine: z.object({
      id: z.string().min(1),
      launchYear: z.number().int(),
    }),
  })
  .refine((j) => j.destinationYear < j.originYear, {
    message: 'The journey must travel backward in time',
    path: ['destinationYear'],
  })
  .refine((j) => j.firstMachine.launchYear === j.destinationYear, {
    message: 'The first machine must belong to the destination year',
    path: ['firstMachine', 'launchYear'],
  })

export type Journey = z.infer<typeof journeySchema>

const rawJourney = {
  originYear: 2026,
  destinationYear: 1964,
  firstMachine: { id: 'ranger-7', launchYear: 1964 },
}

/** Parsed once at module load so bad content fails loudly during development. */
export const journey: Journey = journeySchema.parse(rawJourney)
