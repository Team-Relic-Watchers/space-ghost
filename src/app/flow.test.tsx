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

describe('Home page flow', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en', hasLaunched: false })
    await i18n.changeLanguage('en')
  })

  it('shows the title, the two ways in and the mascot', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1, name: /space ghosts/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start mission/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /play puzzle/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /prof\. pandastein/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /the moon/i })).toBeInTheDocument()
  })

  it('does not scroll: exposes a single main landmark', () => {
    renderAt('/')
    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('takes the reader straight to the campaign map', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: /start mission/i }))
    expect(useGameStore.getState().hasLaunched).toBe(true)
    // No warm-up and no jump video in between: the map is right there.
    expect(
      await screen.findByRole('heading', { name: /the 17 space ghosts/i }, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('opens the puzzle corner', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: /play puzzle/i }))
    expect(
      await screen.findByRole('heading', { name: /rebuild a space ghost/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('switches the whole screen to Bangla', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: 'বাংলা' }))
    expect(await screen.findByRole('button', { name: 'মিশন শুরু করো' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('bn')
  })

  it('sends visitors who open /warp directly back to the home page', async () => {
    renderAt('/warp')
    // The warp screen is its own chunk, so it arrives a moment later.
    expect(
      await screen.findByRole('button', { name: /start mission/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('keeps the whole journey (not a standalone scene) behind Follow Ranger 7', async () => {
    // The warp screen routes to the full Ranger 7 journey; the journey's stages
    // and the exploration stop are covered in journey.integration.test.tsx.
    expect(ROUTES.ranger7).toBe('/ranger-7')
    useGameStore.setState({ hasLaunched: true })
    renderAt('/warp')
    expect(
      await screen.findByRole('button', { name: /follow ranger 7/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })

  it('sends unlaunched players from /ranger-7 back to the home page', async () => {
    useGameStore.setState({ hasLaunched: false })
    renderAt('/ranger-7')
    expect(
      await screen.findByRole('button', { name: /start mission/i }, { timeout: 10000 }),
    ).toBeInTheDocument()
  }, 10000)

  it('redirects unknown routes to the home page', () => {
    renderAt('/nope')
    expect(screen.getByRole('button', { name: /start mission/i })).toBeInTheDocument()
  })

  it('opens the campaign map from the storytelling card', async () => {
    const user = userEvent.setup()
    renderAt('/')
    await user.click(screen.getByRole('button', { name: /storytelling/i }))
    expect(
      await screen.findByRole('heading', { name: /the 17 space ghosts/i }, { timeout: 5000 }),
    ).toBeInTheDocument()
  })
})
