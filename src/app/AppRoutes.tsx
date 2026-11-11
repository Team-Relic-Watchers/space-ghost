import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { ROUTES } from './routes'

// The launch tunnel is its own screen, so it loads only when it is opened.
const WarpScreen = lazy(() =>
  import('../features/warp/WarpScreen').then((m) => ({ default: m.WarpScreen })),
)

// The Ranger 7 mission is 3D-heavy (Three.js, R3F, Drei, GLBs), so the whole
// integrated screen is code-split away from the shell.
const Ranger7Experience = lazy(() =>
  import('../features/ranger7/Ranger7Experience').then((m) => ({ default: m.Ranger7Experience })),
)

const Ranger7Showcase = lazy(() =>
  import('../features/ranger7/showcase/Ranger7Showcase').then((m) => ({ default: m.Ranger7Showcase })),
)

// The campaign map shows all 17 machines at a glance. It carries no 3D, but
// it is its own screen, so it loads as a separate chunk.
const GhostsMap = lazy(() =>
  import('../features/ghosts-map/GhostsMap').then((m) => ({ default: m.GhostsMap })),
)

// The puzzle screen reads the whole story bible to list the machines.
const PuzzleScreen = lazy(() =>
  import('../features/puzzle/PuzzleScreen').then((m) => ({ default: m.PuzzleScreen })),
)

// One machine's star quiz, opened from its story page.
const GhostQuizPage = lazy(() =>
  import('../features/quiz/GhostQuizPage').then((m) => ({ default: m.GhostQuizPage })),
)

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route
        path={ROUTES.ghostsMap}
        element={
          <Suspense fallback={null}>
            <GhostsMap />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.puzzle}
        element={
          <Suspense fallback={null}>
            <PuzzleScreen />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.ghostQuiz}
        element={
          <Suspense fallback={null}>
            <GhostQuizPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.warp}
        element={
          <Suspense fallback={null}>
            <WarpScreen />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.ranger7}
        element={
          <Suspense fallback={null}>
            <Ranger7Experience />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.ranger7Showcase}
        element={
          <Suspense fallback={null}>
            <Ranger7Showcase />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
