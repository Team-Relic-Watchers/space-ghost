import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '../../../i18n'
import { useGameStore } from '../../../game/store'
import { ranger7Story } from '../../../content/storyBible'
import { Briefing } from './Briefing'

const renderBriefing = (onContinue = () => {}) =>
  render(<Briefing onContinue={onContinue} />)

describe('Pandastein Explains / Mission File', () => {
  beforeEach(async () => {
    useGameStore.setState({ language: 'en' })
    await i18n.changeLanguage('en')
  })

  it('shows the story bible question, answer and mission file in English', () => {
    renderBriefing()
    expect(screen.getByRole('heading', { name: /pandastein explains/i })).toBeInTheDocument()
    expect(screen.getByText(ranger7Story.pandastein_question.en)).toBeInTheDocument()
    expect(screen.getByText(`Answer:`, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(ranger7Story.pandastein_question.answer_en, { exact: false })).toBeInTheDocument()
    // The Mission File lines are the source's own at-a-glance block, unsplit.
    for (const line of ranger7Story.at_a_glance.en.split('\n').filter((l) => l.trim())) {
      expect(screen.getByText(line)).toBeInTheDocument()
    }
  })

  it('switches the whole brief to Bangla with the same content', async () => {
    useGameStore.setState({ language: 'bn' })
    await i18n.changeLanguage('bn')
    renderBriefing()
    expect(screen.getByRole('heading', { name: 'পান্ডাস্টেইন বুঝিয়ে দেন' })).toBeInTheDocument()
    expect(screen.getByText(ranger7Story.pandastein_question.bn)).toBeInTheDocument()
    expect(screen.getByText(ranger7Story.pandastein_question.answer_bn, { exact: false })).toBeInTheDocument()
  })

  it('keeps the source caveat visible rather than presenting facts as verified', () => {
    renderBriefing()
    expect(screen.getByText(/editorial notes still list facts to double-check/i)).toBeInTheDocument()
  })

  it('hands the player on to the challenge', async () => {
    const user = userEvent.setup()
    let continued = false
    renderBriefing(() => {
      continued = true
    })
    await user.click(screen.getByRole('button', { name: /start the challenge/i }))
    expect(continued).toBe(true)
  })
})
