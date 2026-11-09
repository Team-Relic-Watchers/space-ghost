import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { useMemo } from 'react'
import { GLB } from './assetPaths'

/**
 * Loads the NASA Moon GLB once, shared across scenes. The asset is a unit-radius
 * sphere (1.2719 units) centred at the origin with a 4096 px equirectangular map.
 */
export function MoonModel(props: ThreeElements['group']) {
  const gltf = useGLTF(GLB.moon)
  const scene = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  return <primitive object={scene} {...props} />
}

useGLTF.preload(GLB.moon)

