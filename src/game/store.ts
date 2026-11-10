import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'bn'

export const isLanguage = (value: unknown): value is Language =>
  value === 'en' || value === 'bn'

export const RANGER7_STEPS = ['intro', 'inspect', 'site', 'photos', 'challenge', 'complete'] as const
export type Ranger7Step = (typeof RANGER7_STEPS)[number]

export const isRanger7Step = (value: unknown): value is Ranger7Step =>
  typeof value === 'string' && (RANGER7_STEPS as readonly string[]).includes(value)

interface Ranger7Progress {
  step: Ranger7Step
  inspected: string[]
  bestScore: number | null
  completed: boolean
}

const defaultRanger7: Ranger7Progress = {
  step: 'intro',
  inspected: [],
  bestScore: null,
  completed: false,
}

/** The best star score earned on each machine's ten-question quiz. */
export type QuizStars = Record<string, number>

interface GameState {
  language: Language
  hasLaunched: boolean
  ranger7: Ranger7Progress
  quizStars: QuizStars
  /** Whether Pandastein reads the story aloud while the reader scrolls. */
  voiceEnabled: boolean
  /** The voice the reader picked for each language. */
  voiceChoice: Record<Language, string>
  setLanguage: (language: Language) => void
  toggleLanguage: () => void
  setVoiceEnabled: (enabled: boolean) => void
  setVoiceChoice: (language: Language, name: string) => void
  launch: () => void
  resetJourney: () => void
  setRanger7Step: (step: Ranger7Step) => void
  markInspected: (hotspotId: string) => void
  recordChallenge: (score: number) => void
  resetRanger7: () => void
  recordQuizStars: (machineId: string, stars: number) => void
}

const sanitizeProgress = (raw: unknown): Ranger7Progress => {
  const r = (raw ?? {}) as Partial<Ranger7Progress>
  return {
    step: isRanger7Step(r.step) ? r.step : defaultRanger7.step,
    inspected: Array.isArray(r.inspected) ? r.inspected.filter((v): v is string => typeof v === 'string') : [],
    bestScore: typeof r.bestScore === 'number' ? r.bestScore : null,
    completed: r.completed === true,
  }
}

const sanitizeQuizStars = (raw: unknown): QuizStars => {
  if (!raw || typeof raw !== 'object') return {}
  const stars: QuizStars = {}
  for (const [machineId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^machine-\d{2}$/.test(machineId)) continue
    if (typeof value !== 'number' || !Number.isFinite(value)) continue
    stars[machineId] = Math.max(0, Math.min(10, Math.round(value)))
  }
  return stars
}

const sanitizeVoiceChoice = (raw: unknown): Record<Language, string> => {
  const choice = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  return {
    en: typeof choice.en === 'string' ? choice.en : '',
    bn: typeof choice.bn === 'string' ? choice.bn : '',
  }
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      language: 'en',
      hasLaunched: false,
      ranger7: defaultRanger7,
      quizStars: {},
      voiceEnabled: false,
      voiceChoice: { en: '', bn: '' },
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((s) => ({ language: s.language === 'en' ? 'bn' : 'en' })),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setVoiceChoice: (language, name) =>
        set((s) => ({ voiceChoice: { ...s.voiceChoice, [language]: name } })),
      launch: () => set({ hasLaunched: true }),
      resetJourney: () => set({ hasLaunched: false }),
      setRanger7Step: (step) => set((s) => ({ ranger7: { ...s.ranger7, step } })),
      markInspected: (hotspotId) =>
        set((s) => ({ ranger7: { ...s.ranger7, step: 'inspect', inspected: s.ranger7.inspected.includes(hotspotId) ? s.ranger7.inspected : [...s.ranger7.inspected, hotspotId] } })),
      recordChallenge: (score) =>
        set((s) => ({
          ranger7: {
            ...s.ranger7,
            bestScore: Math.max(s.ranger7.bestScore ?? 0, score),
            completed: true,
          },
        })),
      resetRanger7: () => set({ ranger7: defaultRanger7 }),
      recordQuizStars: (machineId, stars) =>
        set((s) => {
          const safeStars = Math.max(0, Math.min(10, Math.round(stars)))
          return {
            quizStars: {
              ...s.quizStars,
              [machineId]: Math.max(s.quizStars[machineId] ?? 0, safeStars),
            },
          }
        }),
    }),
    {
      name: 'space-ghosts',
      version: 7,
      // Language, Ranger 7 progress, the star quiz results and the voice
      // settings survive a reload. The reading itself never does: the app
      // must never start talking on its own.
      partialize: (s) => ({
        language: s.language,
        ranger7: s.ranger7,
        quizStars: s.quizStars,
        voiceChoice: s.voiceChoice,
      }),
      migrate: (persisted) => {
        const state = (persisted ?? {}) as {
          language?: Language
          ranger7?: Ranger7Progress
          quizStars?: QuizStars
          voiceChoice?: Record<Language, string>
        }
        // The old reading switch is dropped on the way: the app must never
        // start talking on its own.
        return {
          language: state.language ?? 'en',
          ranger7: state.ranger7 ?? defaultRanger7,
          quizStars: state.quizStars ?? {},
          voiceChoice: state.voiceChoice ?? { en: '', bn: '' },
        }
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as {
          language?: unknown
          ranger7?: unknown
          quizStars?: unknown
          voiceEnabled?: unknown
          voiceChoice?: unknown
        }
        return {
          ...current,
          language: isLanguage(p.language) ? p.language : current.language,
          ranger7: sanitizeProgress(p.ranger7),
          quizStars: sanitizeQuizStars(p.quizStars),
          // Whatever was saved, the voice stays quiet until it is asked for.
          voiceEnabled: false,
          voiceChoice: sanitizeVoiceChoice(p.voiceChoice),
        }
      },
    },
  ),
)
