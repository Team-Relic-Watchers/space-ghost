// Pure logic for the fullscreen time-travel jump clip, kept out of the
// component so it stays fast-refresh friendly and unit-testable.

export const JUMP_VIDEO_SRC = '/video-animations/time-travel-jump.mp4'

/** Play the opening of the jump, then cut straight to its closing seconds. */
const OPENING_S = 5
const TAIL_S = 4

/**
 * Where playback should jump to when the middle of the clip must be cut out,
 * or null when it should keep playing where it is. Clips short enough to play
 * in full are never trimmed.
 */
export function nextSeekTime(currentTime: number, duration: number): number | null {
  if (!Number.isFinite(duration) || duration <= OPENING_S + TAIL_S) return null
  if (currentTime >= OPENING_S && currentTime < duration - TAIL_S) {
    return duration - TAIL_S
  }
  return null
}
