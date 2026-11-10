import { useCallback, useEffect, useState } from 'react'
import { spaceMusic } from './spaceMusic'
import type { MusicState } from './spaceMusic'

export interface SpaceMusicControls {
  /** True when this browser can play the theme. */
  supported: boolean
  /** Where the music is right now. */
  state: MusicState
  /** True while the music plays. */
  playing: boolean
  /** True while the music waits to be carried on. */
  paused: boolean
  /** Starts the music from the first second. */
  play: () => void
  /** Holds the music where it is. */
  pause: () => void
  /** Carries the music on from where it stopped. */
  resume: () => void
  /** Stops the music and sends it back to the first second. */
  stop: () => void
}

/**
 * The space music, seen from React.
 *
 * The music itself lives in one shared player, so it keeps playing while the
 * reader walks from one screen to the next.
 */
export function useSpaceMusic(): SpaceMusicControls {
  const [supported] = useState(() => spaceMusic.supported())
  const [state, setState] = useState<MusicState>(() => spaceMusic.state())

  useEffect(
    () =>
      spaceMusic.subscribe(() => {
        setState(spaceMusic.state())
      }),
    [],
  )

  const play = useCallback(() => spaceMusic.play(), [])
  const pause = useCallback(() => spaceMusic.pause(), [])
  const resume = useCallback(() => spaceMusic.resume(), [])
  const stop = useCallback(() => spaceMusic.stop(), [])

  return {
    supported,
    state,
    playing: state === 'playing',
    paused: state === 'paused',
    play,
    pause,
    resume,
    stop,
  }
}
