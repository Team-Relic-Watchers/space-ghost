/**
 * The space music: the Interstellar theme, ten seconds of it, over and over.
 *
 * The track comes from YouTube, so it is played through the YouTube player
 * itself: the app never downloads, stores or re-encodes the audio. Only the
 * first ten seconds are played, then the player jumps back to the start, so
 * the loop stays short and the music never gets old.
 *
 * The player lives in a hidden frame at the edge of the page: the reader
 * hears the music and never sees a video.
 */

/** The video the theme lives in. */
const VIDEO_ID = '3hDzOa_VVeo'

/** How long one turn of the loop lasts, in milliseconds. */
const LOOP_MS = 10_000

/**
 * How loud the music plays, from 0 to 100.
 *
 * It is background music under Pandastein's voice, so it stays very low.
 */
const BACKGROUND_VOLUME = 24

/** How long we wait for the player before giving up, in milliseconds. */
const READY_TIMEOUT_MS = 8000

/** Where the music is right now. */
export type MusicState = 'idle' | 'playing' | 'paused'

/** The part of the YouTube player the app uses. */
interface YouTubePlayer {
  playVideo: () => void
  pauseVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  setVolume: (volume: number) => void
}

/** The YouTube player factory, once the script has loaded. */
interface YouTubeApi {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string
      width: number
      height: number
      playerVars: Record<string, number>
      events: {
        onReady: (event: { target: YouTubePlayer }) => void
        onError: () => void
      }
    },
  ) => YouTubePlayer
}

interface YouTubeWindow extends Window {
  YT?: YouTubeApi
  onYouTubeIframeAPIReady?: () => void
}

let player: YouTubePlayer | null = null
let host: HTMLElement | null = null
let apiPromise: Promise<void> | null = null
let readyPromise: Promise<YouTubePlayer | null> | null = null
let state: MusicState = 'idle'
let loopTimer: number | null = null

const listeners = new Set<() => void>()

const notify = () => {
  for (const listener of listeners) listener()
}

const clearLoop = () => {
  if (loopTimer === null) return
  window.clearTimeout(loopTimer)
  loopTimer = null
}

/** Brings the YouTube player script onto the page, once. */
const loadApi = (): Promise<void> => {
  if (apiPromise) return apiPromise

  apiPromise = new Promise<void>((resolve) => {
    const w = window as YouTubeWindow
    if (w.YT?.Player) {
      resolve()
      return
    }

    const previous = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve()
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    // A blocked network must not leave the app waiting forever.
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })

  return apiPromise
}

/** The hidden frame the music plays in. */
const ensureHost = (): HTMLElement => {
  if (host?.isConnected) return host
  const frame = document.createElement('div')
  frame.setAttribute('aria-hidden', 'true')
  frame.style.cssText =
    'position:fixed;left:-10000px;bottom:0;width:180px;height:100px;opacity:0;pointer-events:none;'
  document.body.appendChild(frame)
  host = frame
  return frame
}

/** Waits for the player to be ready, so no command is lost. */
const ensurePlayer = async (): Promise<YouTubePlayer | null> => {
  if (player && readyPromise) return readyPromise

  await loadApi()
  const w = window as YouTubeWindow
  const api = w.YT
  if (!api?.Player) return null

  readyPromise = new Promise<YouTubePlayer | null>((resolve) => {
    let settled = false
    const finish = (value: YouTubePlayer | null) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    const timeout = window.setTimeout(() => finish(null), READY_TIMEOUT_MS)

    try {
      player = new api.Player(ensureHost(), {
        videoId: VIDEO_ID,
        width: 180,
        height: 100,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          iv_load_policy: 3,
        },
        events: {
          onReady: (event) => {
            const target = event.target
            target.seekTo(0, true)
            target.pauseVideo()
            target.setVolume(BACKGROUND_VOLUME)
            window.clearTimeout(timeout)
            finish(target)
          },
          onError: () => {
            window.clearTimeout(timeout)
            finish(null)
          },
        },
      })
    } catch {
      window.clearTimeout(timeout)
      finish(null)
    }
  })

  return readyPromise
}

/** Starts the loop: ten seconds, then back to the beginning. */
const scheduleLoop = () => {
  clearLoop()
  loopTimer = window.setTimeout(() => {
    loopTimer = null
    if (state !== 'playing') return
    player?.seekTo(0, true)
    player?.playVideo()
    scheduleLoop()
  }, LOOP_MS)
}

const play = async (fromStart: boolean) => {
  const instance = await ensurePlayer()
  if (!instance) return

  if (fromStart) instance.seekTo(0, true)
  instance.playVideo()
  state = 'playing'
  scheduleLoop()
  notify()
}

const pause = () => {
  if (state !== 'playing') return
  player?.pauseVideo()
  state = 'paused'
  clearLoop()
  notify()
}

const resume = () => {
  if (state !== 'paused') return
  player?.playVideo()
  state = 'playing'
  scheduleLoop()
  notify()
}

const stop = () => {
  player?.pauseVideo()
  player?.seekTo(0, true)
  state = 'idle'
  clearLoop()
  notify()
}

/** The music of the app, shared by every screen, so it never restarts. */
export const spaceMusic = {
  /** True when this browser can play the theme at all. */
  supported: (): boolean => typeof document !== 'undefined',
  /** Where the music is right now. */
  state: (): MusicState => state,
  /** True while the music plays. */
  playing: (): boolean => state === 'playing',
  /** True while the music waits to be carried on. */
  paused: (): boolean => state === 'paused',
  /** Starts the music from the first second. */
  play: (): void => {
    void play(true)
  },
  /** Holds the music where it is. */
  pause,
  /** Carries the music on from where it stopped. */
  resume,
  /** Stops the music and sends it back to the first second. */
  stop,
  /** Starts the music, or holds it. */
  toggle: (): void => {
    if (state === 'playing') pause()
    else if (state === 'paused') resume()
    else void play(true)
  },
  /** Watches the music start, hold and carry on. */
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },
}
