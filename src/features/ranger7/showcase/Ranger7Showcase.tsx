import { Canvas } from '@react-three/fiber'
import { useGLTF, useProgress } from '@react-three/drei'
import { useCallback, useEffect, useState, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronRight, RotateCcw } from 'lucide-react'
import { GLB } from '../three/assetPaths'
import { Ranger7ShowcaseScene } from './Ranger7ShowcaseScene'
import { SceneErrorBoundary } from './SceneErrorBoundary'
import './showcase.css'

/** Both GLBs are needed before the scene is worth revealing. */
const ASSETS = [GLB.ranger7, GLB.moon] as const

/**
 * Old devices, blocked WebGL and very unusual browsers fail before the scene can
 * render. Those are reported as "no 3D here" rather than as a broken model, so
 * the player is offered a way onwards instead of a dead end.
 */
function isUnsupportedRenderer(error: Error): boolean {
  const message = error.message.toLowerCase()
  return (
    message.includes('webgl') ||
    message.includes('resizeobserver') ||
    message.includes('context lost') ||
    message.includes('not supported')
  )
}

interface Ranger7ShowcaseProps {
  /**
   * Presentation mode:
   *  - `full` (default): its own title, hint, credit and, optionally, a CTA —
   *    the standalone deep-link experience;
   *  - `panel`: just the canvas plus its loading/failure states, for the
   *    integrated two-column explorer where the surrounding UI supplies chrome.
   */
  variant?: 'full' | 'panel'
  /** When given, a primary button hands the player on to the next stage. */
  onContinue?: () => void
  /** False pauses rendering without unmounting, so camera state survives. */
  active?: boolean
}

/** A quiet progress read-out for the loading state. */
function LoadingOverlay({ label }: { label: string }) {
  const progress = useProgress()
  return (
    <div className="showcase__overlay" role="status" aria-live="polite">
      <span className="showcase__orb" aria-hidden="true" />
      <p>{label}</p>
      <span className="showcase__bar" aria-hidden="true">
        <span style={{ width: `${Math.max(8, progress.progress)}%` }} />
      </span>
    </div>
  )
}

interface FailureProps {
  error: Error
  onRetry: () => void
  /** Lets the player move on even if 3D is unavailable on this device. */
  onContinue?: () => void
}

/** Shown instead of the canvas when WebGL or a GLB fails. */
function FailureOverlay({ error, onRetry, onContinue }: FailureProps) {
  const { t } = useTranslation()
  const unsupported = isUnsupportedRenderer(error)
  return (
    <div className="showcase__overlay showcase__overlay--error" role="alert">
      <p>{unsupported ? t('ranger7.showcase.unsupported') : t('ranger7.showcase.failed')}</p>
      {!unsupported && <p className="showcase__detail">{error.message}</p>}
      <div className="showcase__overlay-actions">
        <button type="button" className="pill-button" onClick={onRetry}>
          <RotateCcw size={18} aria-hidden="true" />
          {t('common.retry')}
        </button>
        {onContinue && (
          <button type="button" className="pill-button pill-button--primary" onClick={onContinue}>
            {t('ranger7.showcase.continue')}
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * A self-contained, reusable showcase of Ranger 7 with the Moon behind it. It
 * owns the canvas, the loading and failure states; the 3D scene itself lives in
 * Ranger7ShowcaseScene, and every educational panel lives elsewhere.
 *
 * Used two ways:
 *  - `variant="full"` standalone at /ranger-7/scene as a deep link;
 *  - `variant="panel"` as the persistent left column of the integrated Ranger 7
 *    experience (desktop) and as the 3D tab (mobile).
 */
export function Ranger7Showcase({
  variant = 'full',
  onContinue,
  active = true,
}: Ranger7ShowcaseProps) {
  const { t } = useTranslation()
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const panel = variant === 'panel'

  const handleReady = useCallback(() => setReady(true), [])

  const handleFailure = useCallback(() => {
    // A failed fetch may be cached as a rejected promise; drop it so the retry
    // actually hits the network again.
    setFailed(true)
    ASSETS.forEach((path) => useGLTF.clear(path))
  }, [])

  // Warm the Moon GLB while Ranger 7 downloads. The hero does not wait for it:
  // the scene streams in behind its own Suspense boundary.
  useEffect(() => {
    useGLTF.preload(GLB.moon)
  }, [])

  return (
    <section
      className="showcase"
      data-variant={variant}
      data-active={active}
      aria-label={t('ranger7.showcase.title')}
    >
      <div className="showcase__stage">
        <SceneErrorBoundary
          onError={handleFailure}
          fallback={({ error, retry }) => (
            <FailureOverlay
              error={error}
              onContinue={onContinue}
              onRetry={() => {
                setFailed(false)
                setReady(false)
                retry()
              }}
            />
          )}
        >
          <Canvas
            // "never" keeps the canvas alive but stops the render loop, so a
            // hidden panel costs no GPU time while its camera state is kept.
            frameloop={active ? 'always' : 'never'}
            dpr={[1, 1.75]}
            camera={{ position: [0, 0, 6], fov: 38, near: 0.05, far: 200 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <Ranger7ShowcaseScene onReady={handleReady} />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>

        {!ready && !failed && <LoadingOverlay label={t('common.loading3d')} />}
      </div>

      {!panel && (
        <>
          <header className="showcase__title">
            <span className="showcase__eyebrow">{t('ranger7.showcase.eyebrow')}</span>
            <h1>{t('ranger7.showcase.title')}</h1>
            <p>{t('ranger7.showcase.subtitle')}</p>
          </header>

          <p className="showcase__hint">{t('ranger7.showcase.hint')}</p>
          <p className="showcase__credit">{t('ranger7.showcase.credit')}</p>
        </>
      )}

      {onContinue && (
        <div className="showcase__dock">
          <button type="button" className="pill-button pill-button--primary" onClick={onContinue}>
            {t('ranger7.showcase.continue')}
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  )
}
