export interface Journey {
  /** The year the explorer starts in. */
  originYear: number
  /** The year the explorer travels back to. */
  destinationYear: number
  firstMachine: {
    id: string
    launchYear: number
  }
}

/**
 * The shape of the journey.
 *
 * The data is a handful of numbers, so it is checked by the tests rather
 * than by a schema library in the browser: keeping the schema out of the
 * first page saves every explorer a download they never need.
 */
export const journey: Journey = {
  originYear: 2026,
  destinationYear: 1964,
  firstMachine: { id: 'ranger-7', launchYear: 1964 },
}

/** The journey must travel backward in time. */
export const travelsBackwards = (value: Journey): boolean =>
  value.destinationYear < value.originYear

/** The first machine must belong to the destination year. */
export const firstMachineMatches = (value: Journey): boolean =>
  value.firstMachine.launchYear === value.destinationYear
