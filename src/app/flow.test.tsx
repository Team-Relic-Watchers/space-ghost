import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../i18n'
import { useGameStore } from '../game/store'
import { AppRoutes } from './AppRoutes'
import { ROUTES } from './routes'

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )

describe('Mission Control flow', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en', hasLaunched: false })
    await i18n.changeLanguage('en')
  })

  it('shows one primary action and the mascot', () => {
    renderAt('/')
    expect(
      screen.getByRole('button', { name: /start the adventure/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /prof\. pandastein/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /the time machine/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /space ghosts/i })).toBeInTheDocument()
  })

  it('does not scroll: exposes a single main landmark and no extra navigation', () => {
    renderAt('/')
    expect(screen.getAllByRole('main')).toHaveLength(1)
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('takes the reader straight to the campaign map', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: /start the adventure/i }))
    expect(useGameStore.getState().hasLaunched).toBe(true)
    // No warm-up and no jump video in between: the map is right there.
    expect(
      await screen.findByRole('heading', { name: /the 17 space ghosts/i }, { timeout: 3000 }),
    ).toBeInTheDocument()
  })

  it('switches the whole screen to Bangla', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: /switch language/i }))
    expect(await screen.findByRole('button', { name: 'অভিযান শুরু করো' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('bn')
  })

  it('sends visitors who open /warp directly back to Mission Control', () => {
    renderAt('/warp')
    expect(screen.getByRole('button', { name: /start the adventure/i })).toBeInTheDocument()
  })

  it('keeps the whole journey (not a standalone scene) behind Follow Ranger 7', () => {
    // The warp screen routes to the full Ranger 7 journey; the journey's stages
    // and the exploration stop are covered in journey.integration.test.tsx.
    expect(ROUTES.ranger7).toBe('/ranger-7')
    useGameStore.setState({ hasLaunched: true })
    renderAt('/warp')
    expect(screen.getByRole('button', { name: /follow ranger 7/i })).toBeInTheDocument()
  })

  it('sends unlaunched players from /ranger-7 back to Mission Control', async () => {
    useGameStore.setState({ hasLaunched: false })
    renderAt('/ranger-7')
    expect(
      await screen.findByRole('button', { name: /start the adventure/i }, { timeout: 10000 }),
    ).toBeInTheDocument()
  }, 10000)

  it('redirects unknown routes to Mission Control', () => {
    renderAt('/nope')
    expect(screen.getByRole('button', { name: /start the adventure/i })).toBeInTheDocument()
  })

  it('opens the campaign map from Mission Control', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: /meet the 17 space ghosts/i }))
    expect(
      await screen.findByRole('heading', { name: /the 17 space ghosts/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })
})
