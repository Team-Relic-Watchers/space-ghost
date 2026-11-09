import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { useGameStore } from '../../game/store'
import { photographs, quiz } from '../../content/ranger7/imagery'
import { ranger7Story } from '../../content/storyBible'
import { GLB } from './three/assetPaths'
import { missionStopIds } from './stops'
import { stopMeta } from './stopsMeta'
import { Ranger7Experience } from './Ranger7Experience'

/**
 * jsdom cannot create a WebGL context, and these tests are about layout,
 * navigation and progress, not pixels. The 3D leaf is stubbed with a marker so
 * the surrounding integration can be driven for real.
 */
vi.mock('./inspect/InspectLab', () => ({
  InspectLab: ({ active }: { active?: boolean }) => (
    <div data-testid="model-panel" data-active={String(active !== false)}>
      <div data-testid="inspect-lab">Spacecraft - Spin it, open it up</div>
    </div>
  ),
}))

/** The hub header also renders a small 3D cameo; it is decoration, not content. */
vi.mock('./hub/Ranger7Cameo', () => ({
  Ranger7Cameo: () => <div data-testid="cameo" />,
}))

/** jsdom has no layout engine: pretend we are on desktop or phone on demand. */
function mockNarrow(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}

const freshProgress = {
  step: 'intro' as const,
  inspected: [] as string[],
  bestScore: null,
  completed: false,
}

const renderMission = () =>
  render(
    <MemoryRouter>
      <Ranger7Experience />
    </MemoryRouter>,
  )

const info = () => screen.getByTestId('explorer-info')
const model = () => screen.getByTestId('explorer-model')
const tabs = () => screen.getByRole('navigation', { name: /ranger 7 views/i })

describe('Ranger 7 integrated experience', () => {
  beforeEach(async () => {
    mockNarrow(false)
    useGameStore.setState({ language: 'en', hasLaunched: true, ranger7: freshProgress })
    await i18n.changeLanguage('en')
  })

  describe('architecture & stop definitions', () => {
    it('opens directly on the mission map — the landing cinematic is gone', () => {
      renderMission()
      expect(screen.getByRole('heading', { level: 1, name: /ranger 7/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /skip cinematic/i })).not.toBeInTheDocument()
    })

    it('moves Spacecraft to 3D explorer, removes Impact site card, and requires no separate hub stop', () => {
      // The 3D spacecraft inspection is on the left, and Impact site card is removed from the hub.
      expect(missionStopIds).toEqual(['story', 'photos', 'briefing', 'challenge'])
      expect(missionStopIds).not.toContain('inspect')
      expect(missionStopIds).not.toContain('explore')
      expect(missionStopIds).not.toContain('site')
      expect(stopMeta.some((stop) => (stop.id as string) === 'inspect')).toBe(false)
      expect(stopMeta.some((stop) => (stop.id as string) === 'explore')).toBe(false)
      expect(stopMeta.some((stop) => (stop.id as string) === 'site')).toBe(false)
    })

    it('preserves all educational stops in stop definitions', () => {
      for (const stopId of ['story', 'photos', 'briefing', 'challenge']) {
        expect(missionStopIds).toContain(stopId)
        expect(stopMeta.some((stop) => stop.id === stopId)).toBe(true)
      }
    })

    it('renders the 3D scene from the actual GLB asset rather than a static image', () => {
      expect(GLB.ranger7).toBe('/3d-assets/ranger-7/ranger-7.glb')
      expect(GLB.moon).toBe('/3d-assets/moon_small.glb')

      renderMission()
      const modelContainer = model()
      expect(modelContainer.querySelector('img')).toBeNull()
      expect(modelContainer.querySelector('picture')).toBeNull()
    })
  })

  describe('desktop layout (two-column split)', () => {
    it('displays the 3D Explorer on the left and Mission Info on the right simultaneously', () => {
      mockNarrow(false)
      const { container } = renderMission()

      const root = container.querySelector('.explorer')
      expect(root).toHaveAttribute('data-layout', 'split')

      const modelEl = model()
      const infoEl = info()
      expect(modelEl).toBeInTheDocument()
      expect(infoEl).toBeInTheDocument()

      // Neither panel is inert on desktop
      expect(modelEl).not.toHaveAttribute('inert')
      expect(infoEl).not.toHaveAttribute('inert')

      // 3D model panel and educational hub are both active
      expect(screen.getByTestId('model-panel')).toHaveAttribute('data-active', 'true')
      expect(screen.getByRole('heading', { level: 1, name: /ranger 7/i })).toBeInTheDocument()
    })
  })

  describe('mobile layout & bottom toggle', () => {
    it('renders a bottom two-option toggle on narrow screens', () => {
      mockNarrow(true)
      renderMission()

      const nav = tabs()
      expect(nav).toBeInTheDocument()

      const modelTab = screen.getByRole('button', { name: /3d explorer/i })
      const infoTab = screen.getByRole('button', { name: /mission info/i })
      expect(modelTab).toBeInTheDocument()
      expect(infoTab).toBeInTheDocument()
    })

    it('displays only the selected view on mobile and preserves both in DOM', async () => {
      const user = userEvent.setup()
      mockNarrow(true)
      const { container } = renderMission()

      const root = container.querySelector('.explorer')
      expect(root).toHaveAttribute('data-layout', 'single')
      expect(root).toHaveAttribute('data-view', 'model')

      // Initially, 3D model view is selected
      expect(model()).not.toHaveAttribute('inert')
      expect(info()).toHaveAttribute('inert')
      expect(screen.getByTestId('model-panel')).toHaveAttribute('data-active', 'true')

      // Switch to Mission Info
      const infoTab = screen.getByRole('button', { name: /mission info/i })
      await user.click(infoTab)

      expect(root).toHaveAttribute('data-view', 'info')
      expect(model()).toHaveAttribute('inert')
      expect(info()).not.toHaveAttribute('inert')
      expect(screen.getByTestId('model-panel')).toHaveAttribute('data-active', 'false')

      // Switch back to 3D Explorer
      const modelTab = screen.getByRole('button', { name: /3d explorer/i })
      await user.click(modelTab)

      expect(root).toHaveAttribute('data-view', 'model')
      expect(model()).not.toHaveAttribute('inert')
      expect(info()).toHaveAttribute('inert')
      expect(screen.getByTestId('model-panel')).toHaveAttribute('data-active', 'true')
    })

    it('switching views preserves Mission Info state, current section, and progress', async () => {
      const user = userEvent.setup()
      mockNarrow(true)
      renderMission()

      // Switch to Mission Info
      await user.click(screen.getByRole('button', { name: /mission info/i }))

      // Open "The story" stop
      await user.click(screen.getByRole('button', { name: /the story/i }))
      expect(await screen.findByRole('heading', { name: /a flying camera/i })).toBeInTheDocument()

      // Switch away to 3D Explorer
      await user.click(screen.getByRole('button', { name: /3d explorer/i }))
      expect(screen.getByTestId('model-panel')).toBeInTheDocument()

      // Switch back to Mission Info — story is STILL open, state was not reset
      await user.click(screen.getByRole('button', { name: /mission info/i }))
      expect(screen.getByRole('heading', { name: /a flying camera/i })).toBeInTheDocument()
    })
  })

  describe('educational content & progression', () => {
    it('keeps all educational sections accessible from the hub', async () => {
      const user = userEvent.setup()
      renderMission()

      const stopButtons = [
        /the story/i,
        /photos/i,
        /mission file/i,
        /challenge/i,
      ]

      for (const label of stopButtons) {
        expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
      }

      // Impact site card is removed from the hub
      expect(screen.queryByRole('button', { name: /impact site/i })).not.toBeInTheDocument()

      // Spacecraft inspection lives on the left as the 3D explorer
      expect(screen.getByTestId('inspect-lab')).toBeInTheDocument()

      // Check Mission File stop and back navigation
      await user.click(screen.getByRole('button', { name: /mission file/i }))
      expect(await screen.findByRole('heading', { name: /pandastein explains/i })).toBeInTheDocument()

      // Use back to hub
      await user.click(screen.getByRole('button', { name: /mission map/i }))
      expect(await screen.findByRole('heading', { level: 1, name: /ranger 7/i })).toBeInTheDocument()
    })

    it('completes the challenge and records the score and badge', async () => {
      const user = userEvent.setup()
      renderMission()

      await user.click(screen.getByRole('button', { name: /challenge/i }))
      expect(await screen.findByRole('heading', { name: /how many tv cameras/i })).toBeInTheDocument()

      // Answer question 1 correctly (Choice B: 6)
      await user.click(screen.getByRole('button', { name: /^B/i }))
      expect(await screen.findByText(/exactly/i)).toBeInTheDocument()

      // Record score in store and verify completion
      useGameStore.getState().recordChallenge(3)
      const progress = useGameStore.getState().ranger7
      expect(progress.completed).toBe(true)
      expect(progress.bestScore).toBe(3)
    })

    it('preserves all NASA photographs, metadata, credits, and quiz content', () => {
      expect(photographs.length).toBe(4)
      for (const photo of photographs) {
        expect(photo.src).toMatch(/^\/images\/ranger-7\/ra7_\w+\.jpg$/)
        expect(photo.credit).toContain('NASA')
        expect(photo.sourceUrl).toContain('nssdc.gsfc.nasa.gov')
      }

      expect(quiz.length).toBe(4)
      for (const question of quiz) {
        expect(question.choices.length).toBe(3)
        expect(question.choices).toContain(question.correct)
      }
    })

    it('still tracks inspected hotspots independently', () => {
      useGameStore.getState().markInspected('cameras')
      useGameStore.getState().markInspected('solar')
      expect(useGameStore.getState().ranger7.inspected).toEqual(['cameras', 'solar'])
    })
  })

  describe('bilingual support (English & Bangla)', () => {
    it('provides bilingual content across the integrated experience', async () => {
      useGameStore.setState({ language: 'bn' })
      await i18n.changeLanguage('bn')
      mockNarrow(true)
      renderMission()

      // Bangla bottom tabs
      expect(screen.getByRole('button', { name: /ত্রিমাত্রিক নভোযান/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /মিশন তথ্য/i })).toBeInTheDocument()

      // Story bible translations
      expect(ranger7Story.name.bn).toBe('রেঞ্জার ৭')
      expect(ranger7Story.pandastein_question.bn).toBeTruthy()
      expect(ranger7Story.at_a_glance.bn).toBeTruthy()
    })
  })
})
