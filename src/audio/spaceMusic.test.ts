import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/** The player the fake YouTube API hands out. */
interface FakePlayer {
  playVideo: ReturnType<typeof vi.fn>
  pauseVideo: ReturnType<typeof vi.fn>
  seekTo: ReturnType<typeof vi.fn>
  setVolume: ReturnType<typeof vi.fn>
}

let player: FakePlayer
let ready: (target: unknown) => void

/** Puts a fake YouTube player on the page. */
const installYouTube = () => {
  class FakeYouTubePlayer {
    playVideo = vi.fn()
    pauseVideo = vi.fn()
    seekTo = vi.fn()
    setVolume = vi.fn()

    constructor(
      _element: HTMLElement,
      options: { events: { onReady: (event: { target: unknown }) => void } },
    ) {
      player = this as unknown as FakePlayer
      ready = (target: unknown) => options.events.onReady({ target })
    }
  }

  Object.defineProperty(window, 'YT', {
    configurable: true,
    value: { Player: FakeYouTubePlayer },
  })
}

/** A fresh copy of the music, with its own memory. */
const loadMusic = async () => {
  vi.resetModules()
  return import('./spaceMusic')
}

describe('the space music', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    installYouTube()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('plays the theme from the first second', async () => {
    const { spaceMusic } = await loadMusic()

    spaceMusic.play()
    await vi.advanceTimersByTimeAsync(0)
    ready(player)

    await vi.advanceTimersByTimeAsync(0)

    expect(spaceMusic.playing()).toBe(true)
    expect(player.seekTo).toHaveBeenCalledWith(0, true)
    expect(player.playVideo).toHaveBeenCalled()
  })

  it('plays ten seconds and starts again', async () => {
    const { spaceMusic } = await loadMusic()

    spaceMusic.play()
    await vi.advanceTimersByTimeAsync(0)
    ready(player)
    await vi.advanceTimersByTimeAsync(0)

    expect(player.playVideo).toHaveBeenCalledTimes(1)

    // Ten seconds later the player goes back to the beginning.
    await vi.advanceTimersByTimeAsync(10_000)
    expect(player.seekTo).toHaveBeenLastCalledWith(0, true)
    expect(player.playVideo).toHaveBeenCalledTimes(2)

    // And ten seconds after that, once more.
    await vi.advanceTimersByTimeAsync(10_000)
    expect(player.playVideo).toHaveBeenCalledTimes(3)
  })

  it('holds the music and carries it on', async () => {
    const { spaceMusic } = await loadMusic()

    spaceMusic.play()
    await vi.advanceTimersByTimeAsync(0)
    ready(player)
    await vi.advanceTimersByTimeAsync(0)

    spaceMusic.pause()
    expect(spaceMusic.paused()).toBe(true)
    expect(player.pauseVideo).toHaveBeenCalled()

    // The loop waits while the music is held.
    await vi.advanceTimersByTimeAsync(12_000)
    expect(player.playVideo).toHaveBeenCalledTimes(1)

    spaceMusic.resume()
    expect(spaceMusic.playing()).toBe(true)
    expect(player.playVideo).toHaveBeenCalledTimes(2)
  })

  it('plays quietly, under the voice', async () => {
    const { spaceMusic } = await loadMusic()

    spaceMusic.play()
    await vi.advanceTimersByTimeAsync(0)
    ready(player)
    await vi.advanceTimersByTimeAsync(0)

    // The music is background: it never shouts over the story.
    expect(player.setVolume).toHaveBeenCalledWith(24)
  })
})
