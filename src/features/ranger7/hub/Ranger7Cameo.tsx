import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, useGLTF } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useReducedMotion } from 'framer-motion'
import { GLB } from '../three/assetPaths'

function SpinningRanger() {
  const gltf = useGLTF(GLB.ranger7)
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const group = useRef<THREE.Group>(null)
  const reduce = useReducedMotion()
  useFrame((_, delta) => {
    if (group.current && !reduce) group.current.rotation.y += delta * 0.35
  })
  return (
    <group ref={group} rotation={[0.25, 0.6, 0]} scale={0.95}>
      <primitive object={model} />
    </group>
  )
}

/** Small, lazy 3D stage for the hub's mission title. */
export function Ranger7Cameo() {
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: [3.6, 2.2, 4.2], fov: 38 }} gl={{ alpha: true }}>
      
        <ambientLight intensity={1.1} />
        <directionalLight position={[4, 6, 3]} intensity={2.2} color="#fff2d9" />
        <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#7bd4ff" />
        <group position={[0, 0.2, 0]}>
          <SpinningRanger />
        </group>
        <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={6} blur={2.6} far={3} />
      
    </Canvas>
  )
}
