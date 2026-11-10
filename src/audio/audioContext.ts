/**
 * The Web Audio door of this browser.
 *
 * Safari still hides the constructor behind a prefix, so every sound in the
 * app asks this helper first instead of guessing.
 */

export type AudioContextCtor = new () => AudioContext

/** The audio context class of this browser, or null when it has none. */
export const audioContextClass = (): AudioContextCtor | null => {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    AudioContext?: AudioContextCtor
    webkitAudioContext?: AudioContextCtor
  }
  return w.AudioContext ?? w.webkitAudioContext ?? null
}

/** True when this browser can make sound at all. */
export const canMakeSound = (): boolean => audioContextClass() !== null

/**
 * Builds a node when the browser knows it, and quietly skips it when it does
 * not. Some small browsers (and the test doubles) have no convolver or no
 * compressor: the music must still play without them.
 */
export const optionalNode = <T>(factory: (() => T) | undefined): T | null => {
  if (typeof factory !== 'function') return null
  try {
    return factory()
  } catch {
    return null
  }
}
