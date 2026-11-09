import { Canvas } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HOTSPOT_IDS, hotspots } from '../../../content/ranger7/hotspots'
import { useGameStore } from '../../../game/store'
import { useRanger7Model } from '../three/useRanger7Model'
import { MoonModel } from '../three/MoonModel'
import { SceneErrorBoundary } from '../showcase/SceneErrorBoundary'
import './inspect.css'

const NODES = Object.fromEntries(hotspots.map((h) => [h.id, h.nodes]))
/** Turn the model so its +Y boresight points up; the camera then sees the camera stack. */
const STAGE: [number, number, number] = [-Math.PI / 2, 0, 0]

function Ship({ selected, onPick }: { selected: string | null; onPick: (id: string | null) => void }) {
  const { model, highlight, ownerOf } = useRanger7Model(NODES)

  useEffect(() => {
    highlight(selected)
  }, [selected, highlight, model])

  const pick = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation()
      onPick(ownerOf(e.object))
    },
    [ownerOf, onPick],
  )

  return (
    <group rotation={STAGE} onPointerDown={pick}>
      <primitive object={model} />
    </group>
  )
}

function HotspotMarker({
  id,
  selected,
  found,
  onPick,
}: {
  id: string
  selected: boolean
  found: boolean
  onPick: () => void
}) {
  const { t } = useTranslation()
  const meta = hotspots.find((h) => h.id === id)!
  return (
    <Html center position={meta.anchor} zIndexRange={[20, 0]} distanceFactor={3.2}>
      <button
        type="button"
        className="hotspot"
        data-selected={selected}
        data-found={found}
        onClick={onPick}
        aria-label={t(`ranger7.inspect.hotspots.${id}.title`)}
      >
        <span className="hotspot__pulse" aria-hidden="true" />
        <span className="hotspot__core" aria-hidden="true" />
      </button>
    </Html>
  )
}

interface InspectLabProps {
  /** Controls render loop pausing when hidden (e.g. mobile tab switch). */
  active?: boolean
}

/** Part 3.2: rotate/zoom the reconstruction and open educational hotspots. */
export function InspectLab({ active = true }: InspectLabProps) {
  const { t } = useTranslation()
  const inspected = useGameStore((s) => s.ranger7.inspected)
  const markInspected = useGameStore((s) => s.markInspected)
  const [selected, setSelected] = useState<string | null>(null)

  const pick = useCallback(
    (id: string | null) => {
      if (!id) return
      setSelected(id)
      markInspected(id)
    },
    [markInspected],
  )

  const found = HOTSPOT_IDS.filter((id) => inspected.includes(id))
  const allFound = found.length === HOTSPOT_IDS.length

  return (
    <main className="inspect screen story-frame" data-testid="inspect-lab">
      <header className="inspect__top">
        <div className="inspect__title">
          <span className="inspect__badge">{t('ranger7.inspect.reconstruction')}</span>
          <h2>{t('ranger7.inspect.title')}</h2>
        </div>
        <div className="inspect__progress">
          <span className="inspect__progress-bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${found.length / HOTSPOT_IDS.length})` }} />
          </span>
          <strong aria-live="polite">
            {allFound
              ? t('ranger7.inspect.allFound')
              : t('ranger7.inspect.progress', { found: found.length, total: HOTSPOT_IDS.length })}
          </strong>
        </div>
      </header>

      <div className="inspect__stage">
        <div className="inspect__canvas">
          <SceneErrorBoundary
            fallback={({ retry }) => (
              <div className="showcase__overlay showcase__overlay--error" role="alert">
                <p>{t('ranger7.showcase.unsupported')}</p>
                <button type="button" className="pill-button" onClick={retry}>
                  {t('common.retry')}
                </button>
              </div>
            )}
          >
            <Canvas
              frameloop={active ? 'always' : 'never'}
              dpr={[1, 1.75]}
              camera={{ position: [3.4, 2.6, 5.6], fov: 42, near: 0.05, far: 60 }}
              gl={{ antialias: true }}
            >
              <Suspense fallback={null}>
                <color attach="background" args={['#0b0524']} />
                <ambientLight intensity={0.55} color="#aab4ff" />
                <directionalLight position={[5, 7, 4]} intensity={2.4} color="#fff4df" />
                <directionalLight position={[-5, -1, -4]} intensity={1.1} color="#38e1ff" />
                <Ship selected={selected} onPick={pick} />
                {hotspots.map((h) => (
                  <HotspotMarker
                    key={h.id}
                    id={h.id}
                    selected={selected === h.id}
                    found={inspected.includes(h.id)}
                    onPick={() => pick(h.id)}
                  />
                ))}
                <Suspense fallback={null}>
                  <MoonModel position={[6.5, 4.2, -8]} scale={1.8} rotation={[0.2, -0.7, 0.08]} />
                </Suspense>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]}>
                  <circleGeometry args={[3.4, 48]} />
                  <meshBasicMaterial color="#140a38" transparent opacity={0.85} depthWrite={false} />
                </mesh>
                <OrbitControls
                  makeDefault
                  enablePan={false}
                  enableDamping
                  minDistance={2.6}
                  maxDistance={9}
                  minPolarAngle={0.35}
                  maxPolarAngle={Math.PI - 0.35}
                />
              </Suspense>
            </Canvas>
          </SceneErrorBoundary>
          <p className="inspect__hint">{t('ranger7.inspect.hint')}</p>
        </div>

        <aside className="inspect__card" key={selected ?? 'idle'} aria-live="polite">
          {selected ? (
            <>
              <h3>{t(`ranger7.inspect.hotspots.${selected}.title`)}</h3>
              <p>{t(`ranger7.inspect.hotspots.${selected}.body`)}</p>
            </>
          ) : (
            <p className="inspect__prompt">{t('ranger7.stops.inspect.sub')}</p>
          )}
          <p className="inspect__note">{t('ranger7.inspect.reconstructionNote')}</p>
        </aside>
      </div>
    </main>
  )
}
