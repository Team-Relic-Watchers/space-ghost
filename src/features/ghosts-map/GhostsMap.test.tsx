import { fireEvent, render, screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { useGameStore } from '../../game/store'
import { machines } from '../../content/ranger7/machines'
import { GhostsMap } from './GhostsMap'

const renderMap = () =>
  render(
    <MemoryRouter>
      <GhostsMap />
    </MemoryRouter>,
  )

/** jsdom cannot play media; resolve like a browser would. */
const mockMedia = () => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  return vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
}

/**
 * Taps a ghost, waits for its time jump to start and lets the jump land, so
 * the story card opens.
 */
const openGhost = async (user: ReturnType<typeof userEvent.setup>, name: RegExp) => {
  await user.click(screen.getByRole('button', { name }))
  const jump = screen.getByTestId('time-jump')
  await waitFor(() => expect(jump).toHaveAttribute('data-active', 'true'))
  fireEvent(jump.querySelector('video')!, new Event('ended'))
}

describe('the campaign map', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en' })
    await i18n.changeLanguage('en')
  })

  it('shows all 17 ghosts on one page', () => {
    renderMap()
    for (const machine of machines) {
      expect(
        screen.getByRole('button', { name: new RegExp(machine.name.en, 'i') }),
      ).toBeInTheDocument()
    }
  })

  it('gives every ghost its number, its year and where it went', () => {
    renderMap()
    const ranger = screen.getByRole('button', { name: /ranger 7, 1964, went to the moon/i })
    expect(ranger).toHaveTextContent('Ranger 7')
    expect(ranger).toHaveTextContent('1964')
    expect(ranger).toHaveTextContent('The Moon')
  })

  it('shows the full cartoon photograph inside every ghost circle', () => {
    renderMap()

    for (const machine of machines) {
      const ghost = screen.getByRole('button', { name: new RegExp(machine.name.en, 'i') })
      const photos = ghost.querySelectorAll('img')
      expect(photos).toHaveLength(1)
      expect(photos[0].getAttribute('src')).toBe(`/images/ghosts/${machine.slug}/cartoon.jpg`)
    }
  })

  it('opens a machine detail when its ghost is clicked', async () => {
    mockMedia()
    const user = userEvent.setup()
    renderMap()

    await openGhost(user, /voyager 1, 1977/i)

    const detail = screen.getByRole('dialog', { name: /voyager 1/i })
    expect(detail).toBeInTheDocument()
    expect(detail).toHaveTextContent('1977')
    expect(detail).toHaveTextContent('Deep space')
    // The mission file from the story bible is shown in the card.
    expect(detail).toHaveTextContent(/BEEP\. I am Voyager 1/)
  })

  it('jumps to a ghost first, showing its year, name and destination', async () => {
    mockMedia()
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getByRole('button', { name: /voyager 1, 1977/i }))

    const jump = screen.getByTestId('time-jump')
    await waitFor(() => expect(jump).toHaveAttribute('data-active', 'true'))
    expect(jump).toHaveTextContent('1977')
    expect(jump).toHaveTextContent('Voyager 1')
    expect(jump).toHaveTextContent('went to Deep space')
    // The story card waits for the jump to land.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens the story when the jump is skipped', async () => {
    mockMedia()
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getByRole('button', { name: /voyager 1, 1977/i }))
    const skip = await screen.findByRole('button', { name: /skip/i }, { timeout: 3000 })
    await user.click(skip)

    expect(screen.getByRole('dialog', { name: /voyager 1/i })).toBeInTheDocument()
  })

  it('shows every Apollo 15 rover photo and its cartoon in the detail page', async () => {
    mockMedia()
    const user = userEvent.setup()
    renderMap()

    await openGhost(user, /apollo 15 lunar roving vehicle/i)

    const detail = screen.getByRole('dialog', { name: /apollo 15 lunar roving vehicle/i })
    const gallery = within(detail).getByRole('region', { name: 'Mission photo album' })
    const images = gallery.querySelectorAll('img')

    expect(images).toHaveLength(4)
    expect(Array.from(images, (image) => image.getAttribute('src'))).toEqual([
      '/images/ghosts/apollo-15-lunar-roving-vehicle/real.jpg',
      '/images/ghosts/apollo-15-lunar-roving-vehicle/cartoon.jpg',
      '/images/ghosts/apollo-15-lunar-roving-vehicle/technical.png',
      '/images/ghosts/apollo-15-lunar-roving-vehicle/taken.jpeg',
    ])
    expect(within(detail).getByText('Robot voice')).toBeInTheDocument()
    expect(detail.querySelector('.ghost-voice__portrait')?.getAttribute('src')).toBe(
      '/images/ghosts/apollo-15-lunar-roving-vehicle/cartoon.jpg',
    )
  })

  it('switches language from the machine detail page', async () => {
    mockMedia()
    const user = userEvent.setup()
    renderMap()

    await openGhost(user, /voyager 1, 1977/i)
    const detail = screen.getByRole('dialog', { name: /voyager 1/i })
    await user.click(within(detail).getByRole('button', { name: 'Switch language to বাংলা' }))

    expect(within(detail).getByRole('button', { name: 'ভাষা বদলে English করো' })).toBeInTheDocument()
    expect(within(detail).getByRole('button', { name: /শুরুর কথা/ })).toBeInTheDocument()
  })

  it('closes the detail again', async () => {
    mockMedia()
    const user = userEvent.setup()
    renderMap()

    await openGhost(user, /surveyor 1, 1966/i)
    expect(screen.getByRole('dialog', { name: /surveyor 1/i })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /close/i }))
    // The card animates out before it leaves the DOM.
    await waitForElementToBeRemoved(() => screen.queryByRole('dialog'))
  })

  it('counts the ghosts', () => {
    renderMap()
    expect(screen.getByText('17 ghosts')).toBeInTheDocument()
  })

  it('translates the whole map into Bangla', async () => {
    useGameStore.setState({ language: 'bn' })
    await i18n.changeLanguage('bn')
    renderMap()

    expect(screen.getByRole('heading', { name: '১৭টি স্পেস ঘোস্ট' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /রেঞ্জার ৭/ })).toBeInTheDocument()
    expect(screen.getByText(/১৭টি ঘোস্ট/)).toBeInTheDocument()
    // The years follow the reader's own digits.
    expect(screen.getByRole('button', { name: /রেঞ্জার ৭, ১৯৬৪/ })).toBeInTheDocument()
  })
})
