import { beforeEach, describe, expect, it } from 'vitest'
import { useGameStore } from './store'

const freshRanger7 = {
  step: 'intro' as const,
  inspected: [] as string[],
  bestScore: null,
  completed: false,
}

describe('game store', () => {
  beforeEach(() => {
    useGameStore.setState({
      language: 'en',
      hasLaunched: false,
      ranger7: freshRanger7,
      quizStars: {},
    })
  })

  it('starts in English and not launched', () => {
    const s = useGameStore.getState()
    expect(s.language).toBe('en')
    expect(s.hasLaunched).toBe(false)
  })

  it('toggles between English and Bangla', () => {
    useGameStore.getState().toggleLanguage()
    expect(useGameStore.getState().language).toBe('bn')
    useGameStore.getState().toggleLanguage()
    expect(useGameStore.getState().language).toBe('en')
  })

  it('tracks launch and reset', () => {
    useGameStore.getState().launch()
    expect(useGameStore.getState().hasLaunched).toBe(true)
    useGameStore.getState().resetJourney()
    expect(useGameStore.getState().hasLaunched).toBe(false)
  })

  it('persists language, Ranger 7 progress and star results, but never the launch state', () => {
    useGameStore.getState().setLanguage('bn')
    useGameStore.getState().launch()
    const saved = JSON.parse(localStorage.getItem('space-ghosts') ?? '{}')
    expect(saved.state.language).toBe('bn')
    expect(Object.keys(saved.state)).toEqual(['language', 'ranger7', 'quizStars'])
  })

  it('keeps the best star score for each machine', () => {
    const s = useGameStore.getState()
    s.recordQuizStars('machine-01', 6)
    s.recordQuizStars('machine-01', 4)
    s.recordQuizStars('machine-01', 9)
    s.recordQuizStars('machine-02', 3)
    expect(useGameStore.getState().quizStars).toEqual({ 'machine-01': 9, 'machine-02': 3 })
  })

  it('tracks Ranger 7 hotspots, the step and the best score', () => {
    const s = useGameStore.getState()
    s.markInspected('cameras')
    s.markInspected('cameras')
    s.markInspected('solar')
    s.setRanger7Step('photos')
    s.recordChallenge(2)
    s.recordChallenge(3)
    const r = useGameStore.getState().ranger7
    expect(r.inspected).toEqual(['cameras', 'solar'])
    expect(r.step).toBe('photos')
    expect(r.bestScore).toBe(3)
    expect(r.completed).toBe(true)
    useGameStore.getState().resetRanger7()
    expect(useGameStore.getState().ranger7.inspected).toEqual([])
    expect(useGameStore.getState().ranger7.completed).toBe(false)
  })
})
