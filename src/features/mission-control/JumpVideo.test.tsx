import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { JumpVideo } from './JumpVideo'
import { JUMP_VIDEO_SRC, nextSeekTime } from './jumpClip'

/** jsdom cannot play media; resolve like a browser would. */
const mockPlay = () => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  return vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
}

/** The overlay's <video>, which always sits inside the test id container. */
const videoElement = () => screen.getByTestId('jump-video').querySelector('video')!

describe('nextSeekTime', () => {
  it('keeps playing inside the opening and the tail of the clip', () => {
    expect(nextSeekTime(0, 13)).toBeNull()
    expect(nextSeekTime(4.9, 13)).toBeNull()
    expect(nextSeekTime(9, 13)).toBeNull()
    expect(nextSeekTime(12.5, 13)).toBeNull()
  })

  it('cuts from the opening straight to the tail', () => {
    expect(nextSeekTime(5, 13)).toBe(9)
    expect(nextSeekTime(7.5, 13)).toBe(9)
  })

  it('never trims a clip that is already short enough', () => {
    expect(nextSeekTime(5, 9)).toBeNull()
    expect(nextSeekTime(5, 5)).toBeNull()
  })

  it('ignores an unknown duration', () => {
    expect(nextSeekTime(5, Number.NaN)).toBeNull()
  })
})

describe('JumpVideo', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('preloads the clip but stays out of the way while idle', () => {
    const onDone = vi.fn()
    render(<JumpVideo active={false} onDone={onDone} />)
    expect(videoElement()).toHaveAttribute('preload', 'auto')
    expect(videoElement()).toHaveAttribute('src', JUMP_VIDEO_SRC)
    expect(screen.getByTestId('jump-video')).toHaveAttribute('data-active', 'false')
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('plays the clip when activated and hands off exactly once when it ends', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<JumpVideo active onDone={onDone} />)
    expect(screen.getByTestId('jump-video')).toHaveAttribute('data-active', 'true')
    fireEvent(videoElement(), new Event('ended'))
    fireEvent(videoElement(), new Event('ended'))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('cuts from the opening to the tail while the jump plays', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<JumpVideo active onDone={onDone} />)
    const video = videoElement()
    Object.defineProperty(video, 'duration', { value: 13, configurable: true })
    Object.defineProperty(video, 'currentTime', { value: 5.2, writable: true, configurable: true })
    fireEvent(video, new Event('timeupdate'))
    expect(video.currentTime).toBe(9)
  })

  it('shows a skip control that hands off', async () => {
    mockPlay()
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<JumpVideo active onDone={onDone} />)
    const skip = await screen.findByRole('button', { name: /skip/i }, { timeout: 3000 })
    await user.click(skip)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('skips on the Escape key', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<JumpVideo active onDone={onDone} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('skips on a click on the video', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<JumpVideo active onDone={onDone} />)
    fireEvent.click(videoElement())
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('hands off when playback is refused, so the journey never blocks', async () => {
    // Both the audible and the muted play attempts are refused.
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(
      new DOMException('blocked', 'NotAllowedError'),
    )
    const onDone = vi.fn()
    render(<JumpVideo active onDone={onDone} />)
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1), { timeout: 3000 })
  })
})
