import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../../i18n'
import { useGameStore } from '../../game/store'
import { machineQuizzes } from '../../content/ranger7/quiz'
import { machines } from '../../content/ranger7/machines'
import { GhostQuizPage } from './GhostQuizPage'

const MapProbe = () => {
  const location = useLocation()
  return (
    <div data-testid="map-route" data-state={JSON.stringify(location.state)}>
      map
    </div>
  )
}

const renderQuiz = (sequence = machines[0].sequence) =>
  render(
    <MemoryRouter initialEntries={[`/ghosts/${sequence}/quiz`]}>
      <Routes>
        <Route path="/ghosts/:sequence/quiz" element={<GhostQuizPage />} />
        <Route path="/ghosts" element={<MapProbe />} />
      </Routes>
    </MemoryRouter>,
  )

describe('the star quiz page', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en' })
    await i18n.changeLanguage('en')
  })

  it('opens on the first question with the machine in the heading', () => {
    renderQuiz()

    expect(
      screen.getByRole('heading', { name: /ranger 7: the star quiz/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(`Question 1 of ${machineQuizzes[machines[0].id].length}`),
    ).toBeInTheDocument()
  })

  it('goes back to the map and asks it to reopen the same ghost', async () => {
    const user = userEvent.setup()
    renderQuiz(machines[4].sequence)

    await user.click(screen.getByRole('button', { name: /back to the story/i }))

    const map = await screen.findByTestId('map-route')
    expect(map).toBeInTheDocument()
    expect(JSON.parse(map.getAttribute('data-state') ?? '{}')).toEqual({
      openSequence: machines[4].sequence,
    })
  })
})
