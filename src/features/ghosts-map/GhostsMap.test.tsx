import { render, screen, waitForElementToBeRemoved, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
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
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getByRole('button', { name: /voyager 1, 1977/i }))

    const detail = screen.getByRole('dialog', { name: /voyager 1/i })
    expect(detail).toBeInTheDocument()
    expect(detail).toHaveTextContent('1977')
    expect(detail).toHaveTextContent('Deep space')
    // The mission file from the story bible is shown in the card.
    expect(detail).toHaveTextContent(/BEEP\. I am Voyager 1/)
  })

  it('shows every Apollo 15 rover photo and its cartoon in the detail page', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getByRole('button', { name: /apollo 15 lunar roving vehicle/i }))

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
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getByRole('button', { name: /voyager 1, 1977/i }))
    const detail = screen.getByRole('dialog', { name: /voyager 1/i })
    await user.click(within(detail).getByRole('button', { name: 'Switch language to বাংলা' }))

    expect(within(detail).getByRole('button', { name: 'ভাষা বদলে English করো' })).toBeInTheDocument()
    expect(within(detail).getByRole('button', { name: /শুরুর কথা/ })).toBeInTheDocument()
  })

  it('closes the detail again', async () => {
    const user = userEvent.setup()
    renderMap()

    await user.click(screen.getByRole('button', { name: /surveyor 1, 1966/i }))
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
