import { useGLTF } from '@react-three/drei'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GLB } from './assetPaths'

export const HIGHLIGHT_COLOR = '#ffd43b'
const GLOW = 0.55
const DIM = 0.04
const DIM_OPACITY = 0.5

/** A material and its two preview variants (faint for non-selected, bright for selected). */
interface Variant {
  mesh: THREE.Mesh
  base: THREE.Material
  faint: THREE.Material
  bright: THREE.Material
}

const makeVariant = (base: THREE.Material, kind: 'faint' | 'bright'): THREE.Material => {
  const m = base.clone() as THREE.MeshStandardMaterial
  if (m.emissive) {
    m.emissive = new THREE.Color(kind === 'bright' ? HIGHLIGHT_COLOR : '#ffffff')
    m.emissiveIntensity = kind === 'bright' ? GLOW : DIM
  }
  if (kind === 'faint') {
    m.transparent = true
    m.opacity = DIM_OPACITY
  } else {
    m.transparent = base.transparent
    m.opacity = base.opacity
  }
  m.needsUpdate = true
  return m
}

/** The Ranger 7 GLB (ranger-7.glb) plus hotspot picking/highlighting helpers. */
export function useRanger7Model(componentNodes: Record<string, string[]>) {
  const gltf = useGLTF(GLB.ranger7)
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene])
  const variants = useRef<Variant[]>([])
  const owners = useRef<Map<THREE.Object3D, string>>(new Map())

  // Build variants once per model instance.
  useEffect(() => {
    const created: Variant[] = []
    const ownerMap = new Map<THREE.Object3D, string>()

    for (const [hotspotId, names] of Object.entries(componentNodes)) {
      for (const name of names) {
        const node = model.getObjectByName(name)
        if (!node) continue
        node.traverse((child) => {
          if (!(child as THREE.Mesh).isMesh) return
          const mesh = child as THREE.Mesh
          ownerMap.set(mesh, hotspotId)
          for (const m of [mesh.material].flat()) {
            created.push({
              mesh,
              base: m,
              faint: makeVariant(m, 'faint'),
              bright: makeVariant(m, 'bright'),
            })
          }
        })
      }
    }

    variants.current = created
    owners.current = ownerMap
    return () => {
      created.forEach((v) => {
        v.faint.dispose()
        v.bright.dispose()
      })
      variants.current = []
      owners.current = new Map()
    }
  }, [model, componentNodes])

  /** Swap materials for the selected component; everything else dims. */
  const highlight = (selectedId: string | null) => {
    variants.current.forEach((v) => {
      const id = owners.current.get(v.mesh)
      const next = !selectedId
        ? v.base
        : id === selectedId
          ? v.bright
          : v.faint
      v.mesh.material = next
    })
  }

  /** Walk up from a picked object to the component group it belongs to. */
  const ownerOf = (picked: THREE.Object3D | null): string | null => {
    let node: THREE.Object3D | null = picked
    while (node) {
      const owner = owners.current.get(node)
      if (owner) return owner
      node = node.parent
    }
    return null
  }

  return { model, highlight, ownerOf }
}
