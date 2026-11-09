import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../../i18n'
import { useGameStore } from '../../../game/store'
import { AppRoutes } from '../../../app/AppRoutes'
import { Ranger7Showcase } from './Ranger7Showcase'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

/**
 * jsdom has no WebGL, so the canvas itself cannot be asserted here. These checks
 * cover the parts that make the showcase reachable and readable: the route, the
 * heading text in both languages, and the loading state before a frame renders.
 */
describe('Ranger 7 showcase screen', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en', hasLaunched: false })
    await i18n.changeLanguage('en')
    // The canvas failure in jsdom is expected; keep the output readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('is reachable without launching the mission', async () => {
    renderAt('/ranger-7/scene')
    expect(
      await screen.findByRole('heading', { level: 1, name: /ranger 7/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('labels the scene with the controls hint', async () => {
    renderAt('/ranger-7/scene')
    expect(
      await screen.findByText(/drag to orbit/i, undefined, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('replaces the loading state with a usable fallback if the scene cannot start', async () => {
    // jsdom has no WebGL and no ResizeObserver, so the canvas genuinely fails here
    // — exactly the path a device without WebGL takes.
    renderAt('/ranger-7/scene')
    const alert = await screen.findByRole('alert', undefined, { timeout: 5000 })
    expect(alert).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument()
    // The spinner must not sit on top of the error message.
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('localises the showcase into Bangla', async () => {
    useGameStore.setState({ language: 'bn' })
    await i18n.changeLanguage('bn')
    renderAt('/ranger-7/scene')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'রেঞ্জার ৭' }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('does not require the mission to be launched, unlike the story route', async () => {
    renderAt('/ranger-7')
    expect(
      await screen.findByRole('button', { name: /start the adventure/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('offers a way into the full journey from the standalone scene', async () => {
    // The standalone route passes an onContinue that returns to /ranger-7, so the
    // scene is never a dead end. Rendering the component directly keeps this test
    // independent of the lazy route chunk (which jsdom will not resolve here).
    render(<Ranger7Showcase onContinue={() => {}} />)
    // The fallback overlay covers the dock in jsdom (no WebGL), so both the
    // overlay action and the dock action carry the same label.
    expect(
      (await screen.findAllByRole('button', { name: /continue to the story/i }, { timeout: 5000 })),
    ).not.toHaveLength(0)
  })
})
