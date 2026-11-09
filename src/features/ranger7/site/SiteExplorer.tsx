import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { Moon } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { impactSite, formatCoordinates } from '../../../content/ranger7/impactSite'
import { ranger7Mission } from '../../../content/ranger7/mission'
import { formatDigits } from '../../../i18n'
import { ImpactTerrain } from './ImpactTerrain'
import './site.css'

/**
 * Part 4: the real impact location in Mare Cognitum, on NASA Moon Trek terrain.
 * No spacecraft model is placed here — nothing of Ranger 7 survived the impact.
 */
export function SiteExplorer() {
  const { t } = useTranslation()
  const { lat, lon } = formatCoordinates(impactSite)
  const source = ranger7Mission.sources.find((s) => s.label.includes('Ranger to the Moon'))

  return (
    <main className="site screen story-frame">
      <header className="site__top">
        <div className="site__heading">
          <span className="site__eyebrow">
            <Moon size={16} aria-hidden="true" /> {formatDigits(1964)}
          </span>
          <h2>{t('ranger7.site.region')}</h2>
        </div>
        <div className="site__coords">
          <strong>{t('ranger7.site.coordinates', { lat, lon })}</strong>
          <span>{t('ranger7.site.impactTime', { utc: ranger7Mission.impact.utc })}</span>
        </div>
      </header>

      <div className="site__canvas">
        <Canvas
          dpr={[1, 1.75]}
          shadows
          camera={{ position: [0.6, 1.05, 1.15], fov: 42, near: 0.02, far: 120 }}
          gl={{ antialias: true }}
        >
            <color attach="background" args={['#07040f']} />
            <fog attach="fog" args={['#07040f', 22, 60]} />
            <ambientLight intensity={0.35} color="#9aa6e0" />
            <directionalLight position={[-8, 7, 5]} intensity={1.6} color="#fff3dd" castShadow shadow-mapSize={[1024, 1024]} />
            <ImpactTerrain />
            <MapControls
              makeDefault
              enableDamping
              dampingFactor={0.08}
              minDistance={0.25}
              maxDistance={3.2}
              maxPolarAngle={Math.PI / 2.25}
              screenSpacePanning={false}
              panSpeed={0.8}
            />
          
        </Canvas>
        <p className="site__hint">{t('ranger7.site.exploreHint')}</p>
      </div>

      <footer className="site__bottom">
        <p className="site__marker-note">{t('ranger7.site.markerNote')}</p>
        <p className="site__caveat">{t('ranger7.site.caveat')}</p>
        <p className="site__credits">
          {t('ranger7.site.credits')} · {t('ranger7.site.sunNote')}
          {source && (
            <a href={source.url} target="_blank" rel="noreferrer">
              {t('ranger7.photos.source')}
            </a>
          )}
        </p>
      </footer>
    </main>
  )
}
