// The timing of the time-travel jump, kept out of the component so it stays
// fast-refresh friendly and unit-testable.

/** How long the whole jump lasts, in milliseconds. */
export const JUMP_DURATION_MS = 3400

/** The skip control fades in after this long, so the jump can establish itself. */
export const SKIP_DELAY_MS = 1100

/**
 * With reduced motion the jump is a short flash rather than a long flight,
 * so nothing swoops across the screen.
 */
export const REDUCED_JUMP_DURATION_MS = 900

/** How long the jump takes to arrive, for the closing flash. */
export const ARRIVAL_FLASH_MS = 420
