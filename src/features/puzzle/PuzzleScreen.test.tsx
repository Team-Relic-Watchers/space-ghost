import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import { useGameStore } from '../../game/store'
import { PuzzleScreen } from './PuzzleScreen'

const renderScreen = () =>
  render(
    <MemoryRouter>
      <PuzzleScreen />
    </MemoryRouter>,
  )

describe('the puzzle corner', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en' })
    await i18n.changeLanguage('en')
  })

  it('offers every machine to puzzle', () => {
    renderScreen()
    expect(
      screen.getByRole('heading', { name: /rebuild a space ghost/i }),
    ).toBeInTheDocument()
    // 17 machines, the back button, the two language buttons and the
    // "play puzzle game" button of the puzzle card.
    expect(screen.getAllByRole('button')).toHaveLength(17 + 4)
  })

  it('starts on the first machine', () => {
    renderScreen()
    expect(screen.getByText(/pieces of ranger 7/i)).toBeInTheDocument()
  })

  it('switches to another machine when the reader picks it', async () => {
    const user = userEvent.setup()
    renderScreen()
    await user.click(screen.getByRole('button', { name: /voyager 1/i }))
    expect(screen.getByText(/pieces of voyager 1/i)).toBeInTheDocument()
  })

  it('plays the jigsaw and keeps the missing pieces in a tray', async () => {
    const user = userEvent.setup()
    renderScreen()
    await user.click(screen.getByRole('button', { name: /play puzzle game/i }))
    expect(screen.getByText(/5 pieces left/i)).toBeInTheDocument()
    expect(screen.getByText(/^missing pieces$/i)).toBeInTheDocument()
    // Five holes are waiting in the board, and the five missing pieces sit in
    // the tray beside it.
    expect(screen.getAllByRole('button', { name: /empty space/i })).toHaveLength(5)
    expect(screen.getAllByRole('button', { name: /puzzle piece/i })).toHaveLength(5)
  })

  it('says the puzzle in Bangla too', async () => {
    const user = userEvent.setup()
    renderScreen()
    await user.click(screen.getByRole('button', { name: 'বাংলা' }))
    expect(
      await screen.findByRole('heading', { name: /একটি স্পেস ঘোস্ট আবার সাজাও/ }),
    ).toBeInTheDocument()
  })
})
