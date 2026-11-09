import { MapPin } from 'lucide-react'
import { Html } from '@react-three/drei'
import { useTranslation } from 'react-i18next'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { formatDigits } from '../../../i18n'
import { ranger7Mission } from '../../../content/ranger7/mission'

interface ImpactMarkerProps {
  /** x/z position on the terrain plane, in world units. */
  position: [number, number]
  /** Vertical offset so the pin sits just above the terrain. */
  height?: number
}

/** The acknowledged impact point: a pinned label, with no wreckage modelled. */
export function ImpactMarker({ position, height = 0.05 }: ImpactMarkerProps) {
  const { t } = useTranslation()
  const ring = useRef<Mesh>(null)

  useFrame((state) => {
    if (ring.current) {
      ring.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.08)
    }
  })

  return (
    <group position={[position[0], height, position[1]]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.16, 0.22, 48]} />
        <meshBasicMaterial color="#ffd43b" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color="#ff5ca8" depthWrite={false} />
      </mesh>
      <Html center distanceFactor={1.6} position={[0, 0.5, 0]} zIndexRange={[10, 0]}>
        <div className="site-marker">
          <MapPin size={18} aria-hidden="true" />
          <strong>{t('ranger7.site.marker')}</strong>
          <span>
            {formatDigits(1964)} · {ranger7Mission.impact.date} · {ranger7Mission.impact.utc} UT
          </span>
        </div>
      </Html>
    </group>
  )
}

