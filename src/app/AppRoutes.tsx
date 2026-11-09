import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { MissionControl } from '../features/mission-control/MissionControl'
import { WarpScreen } from '../features/warp/WarpScreen'
import { ROUTES } from './routes'

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

export function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTES.missionControl} element={<MissionControl />} />
      <Route
        path={ROUTES.ghostsMap}
        element={
          <Suspense fallback={null}>
            <GhostsMap />
          </Suspense>
        }
      />
      <Route path={ROUTES.warp} element={<WarpScreen />} />
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
      <Route path="*" element={<Navigate to={ROUTES.missionControl} replace />} />
    </Routes>
  )
}

