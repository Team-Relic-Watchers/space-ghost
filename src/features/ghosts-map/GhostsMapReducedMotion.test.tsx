import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { useGameStore } from '../../game/store'
import { GhostsMap } from './GhostsMap'

/**
 * This file stands alone on purpose: framer-motion reads the reduced-motion
 * setting once per module registry, so the mock has to be in place before the
 * first render anywhere in the file.
 */
describe('the campaign map with reduced motion', () => {
  beforeEach(async () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query.includes('prefers-reduced-motion'),
          media: query,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    )
    useGameStore.setState({ language: 'en' })
    await i18n.changeLanguage('en')
  })

  it('opens the story straight away, without playing the time jump', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <GhostsMap />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: /voyager 1, 1977/i }))

    expect(screen.getByRole('dialog', { name: /voyager 1/i })).toBeInTheDocument()
    expect(screen.getByTestId('time-jump')).toHaveAttribute('data-active', 'false')
  })
})
