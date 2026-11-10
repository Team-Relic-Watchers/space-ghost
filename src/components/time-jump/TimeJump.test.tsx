import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { TimeJump } from './TimeJump'
import { JUMP_VIDEO_SRC, nextSeekTime } from './jumpClip'

/** jsdom cannot play media; resolve like a browser would. */
const mockPlay = () => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  return vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
}

/** The overlay's <video>, which always sits inside the test id container. */
const videoElement = () => screen.getByTestId('time-jump').querySelector('video')!

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

describe('TimeJump', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
  })

  it('preloads the clip but stays out of the way while idle', () => {
    const onDone = vi.fn()
    render(<TimeJump active={false} onDone={onDone} />)
    expect(videoElement()).toHaveAttribute('preload', 'auto')
    expect(videoElement()).toHaveAttribute('src', JUMP_VIDEO_SRC)
    expect(screen.getByTestId('time-jump')).toHaveAttribute('data-active', 'false')
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('plays the clip when activated and hands off exactly once when it ends', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    expect(screen.getByTestId('time-jump')).toHaveAttribute('data-active', 'true')
    fireEvent(videoElement(), new Event('ended'))
    fireEvent(videoElement(), new Event('ended'))
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('cuts from the opening to the tail while the jump plays', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
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
    render(<TimeJump active onDone={onDone} />)
    const skip = await screen.findByRole('button', { name: /skip/i }, { timeout: 3000 })
    await user.click(skip)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('skips on the Escape key', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('skips on a click on the video', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
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
    render(<TimeJump active onDone={onDone} />)
    await waitFor(() => expect(onDone).toHaveBeenCalledTimes(1), { timeout: 3000 })
  })

  it('shows Pandastein looping over the jump', () => {
    mockPlay()
    const onDone = vi.fn()
    const { container } = render(<TimeJump active onDone={onDone} />)
    const panda = container.querySelector('img')
    expect(panda).toHaveAttribute('src', '/images/panda.png')
    expect(panda).toHaveAttribute('alt', '')
  })

  it('keeps the panda out of the way while idle', () => {
    const onDone = vi.fn()
    const { container } = render(<TimeJump active={false} onDone={onDone} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows the year, name and destination of the ghost we jump to', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} year="1966" title="Surveyor 1" info="went to the Moon" />)
    expect(screen.getByText('1966')).toBeInTheDocument()
    expect(screen.getByText('Surveyor 1')).toBeInTheDocument()
    expect(screen.getByText('went to the Moon')).toBeInTheDocument()
  })

  it('shows no destination lines when there is no ghost to travel to', () => {
    mockPlay()
    const onDone = vi.fn()
    const { container } = render(<TimeJump active onDone={onDone} />)
    expect(container.querySelector('.jump__text')).toBeNull()
  })

  it('labels the jump for screen readers', () => {
    mockPlay()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} year="1966" />)
    expect(screen.getByTestId('time-jump')).toHaveAttribute('aria-label', 'Time jump to 1966')
  })
})
