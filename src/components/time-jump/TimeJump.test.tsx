import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { TimeJump } from './TimeJump'
import { JUMP_DURATION_MS, SKIP_DELAY_MS } from './jumpTiming'

/** The overlay that fills the screen while the jump is on. */
const overlay = () => screen.getByTestId('time-jump')

describe('TimeJump', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en')
    vi.useRealTimers()
  })

  it('stays out of the way while idle', () => {
    const onDone = vi.fn()
    render(<TimeJump active={false} onDone={onDone} />)
    expect(overlay()).toHaveAttribute('data-active', 'false')
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('paints the warp tunnel instead of loading a video', () => {
    const onDone = vi.fn()
    const { container } = render(<TimeJump active onDone={onDone} />)
    expect(screen.getByTestId('warp-field').tagName).toBe('CANVAS')
    // The old video file must not come back: it was the biggest download.
    expect(container.querySelector('video')).toBeNull()
  })

  it('hands off exactly once when the flight ends', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    expect(overlay()).toHaveAttribute('data-active', 'true')
    act(() => {
      vi.advanceTimersByTime(JUMP_DURATION_MS + 10)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('shows a skip control that hands off', async () => {
    const onDone = vi.fn()
    const user = userEvent.setup()
    render(<TimeJump active onDone={onDone} />)
    const skip = await screen.findByRole('button', { name: /skip/i }, { timeout: 3000 })
    await user.click(skip)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('waits a beat before offering the skip control', () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    expect(screen.queryByRole('button', { name: /skip/i })).not.toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(SKIP_DELAY_MS + 10)
    })
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('skips on the Escape key', () => {
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('skips on a tap on the jump', () => {
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    fireEvent.click(overlay())
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('hands off only once, even when the tap and the timer race', async () => {
    vi.useFakeTimers()
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    fireEvent.click(overlay())
    act(() => {
      vi.advanceTimersByTime(JUMP_DURATION_MS + 10)
    })
    expect(onDone).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('shows Pandastein looping over the jump', () => {
    const onDone = vi.fn()
    const { container } = render(<TimeJump active onDone={onDone} />)
    const panda = container.querySelector('img')
    expect(panda).toHaveAttribute('src', '/images/panda-ship.webp')
    expect(panda).toHaveAttribute('alt', '')
  })

  it('keeps the panda out of the way while idle', () => {
    const onDone = vi.fn()
    const { container } = render(<TimeJump active={false} onDone={onDone} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows the year, name and destination of the ghost we jump to', () => {
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} year="1966" title="Surveyor 1" info="went to the Moon" />)
    expect(screen.getByText('1966')).toBeInTheDocument()
    expect(screen.getByText('Surveyor 1')).toBeInTheDocument()
    expect(screen.getByText('went to the Moon')).toBeInTheDocument()
  })

  it('shows no destination lines when there is no ghost to travel to', () => {
    const onDone = vi.fn()
    const { container } = render(<TimeJump active onDone={onDone} />)
    expect(container.querySelector('.jump__text')).toBeNull()
  })

  it('labels the jump for screen readers', () => {
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} year="1966" />)
    expect(overlay()).toHaveAttribute('aria-label', 'Time jump to 1966')
  })

  it('still flies when the browser has no audio at all', async () => {
    const onDone = vi.fn()
    render(<TimeJump active onDone={onDone} />)
    await waitFor(() => expect(overlay()).toHaveAttribute('data-active', 'true'))
    fireEvent.click(overlay())
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
