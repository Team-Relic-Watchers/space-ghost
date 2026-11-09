import {
  Environment,
  Float,
  GradientTexture,
  GradientType,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  Sparkles,
  useGLTF,
} from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo } from 'react'
import { useReducedMotion } from 'framer-motion'
import * as THREE from 'three'
import { GLB } from '../three/assetPaths'
import { MoonModel } from '../three/MoonModel'
import { MOON_RADIUS_UK } from '../three/MoonModel.constants'
import { mulberry32 } from '../../../components/backdrop/random'
import { SHOWCASE, normaliseShip, stageLayout } from './showcaseLayout'
import type { StageLayout } from './showcaseLayout'
import { SceneErrorBoundary } from './SceneErrorBoundary'

const STAR_COUNT = 1400
const STAR_COLORS = ['#ffffff', '#d9e9ff', '#ffe8c7', '#ffc7e4', '#c7f3ff']
/** Direction the key light — and therefore the Moon's day side — comes from. */
const KEY_LIGHT: [number, number, number] = [5, 6, 7]

/**
 * A dome of coloured stars. Seeded so the sky looks the same on every visit,
 * and owned here so its geometry is disposed with the scene.
 */
function CosmicStars() {
  const geometry = useMemo(() => {
    const rand = mulberry32(1964)
    const positions = new Float32Array(STAR_COUNT * 3)
    const colors = new Float32Array(STAR_COUNT * 3)
    const palette = STAR_COLORS.map((c) => new THREE.Color(c))
    for (let i = 0; i < STAR_COUNT; i++) {
      const y = rand() * 2 - 1
      const phi = rand() * Math.PI * 2
      const radius = 26 + rand() * 18
      const ring = Math.sqrt(1 - y * y)
      positions[i * 3] = radius * ring * Math.cos(phi)
      positions[i * 3 + 1] = radius * y
      positions[i * 3 + 2] = radius * ring * Math.sin(phi)
      const colour = palette[Math.floor(rand() * palette.length)]
      colors[i * 3] = colour.r
      colors[i * 3 + 1] = colour.g
      colors[i * 3 + 2] = colour.b
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    return geo
  }, [])

  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.18}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
        depthWrite={false}
      />
    </points>
  )
}

/**
 * A distant nebula wall behind everything, so the sky is not flat black. It is
 * a single sprite placed on the hero camera's forward axis and scaled far more
 * than generously, which keeps it behind the ship and the Moon from every
 * orbit angle the controls allow.
 */
function NebulaBackdrop({ layout }: { layout: StageLayout }) {
  const distance = layout.distance * 14
  // Straight along the hero camera's forward axis, so it stays behind both the
  // ship and the Moon at any orbit angle the limits allow.
  const [x, y, z] = layout.cameraPosition
  const scale = Math.hypot(x, y, z) / layout.distance
  return (
    <sprite position={[x * 14, y * 14, z * 14]} scale={distance * scale}>
      <spriteMaterial
        transparent
        depthWrite={false}
        depthTest={false}
        fog={false}
        opacity={0.55}
        color="#8f4bf0"
        blending={THREE.AdditiveBlending}
      >
        <GradientTexture
          attach="map"
          type={GradientType.Radial}
          stops={[0, 0.4, 0.75, 1]}
          colors={['#6a2bd1', '#43199a', '#1b0b4d', '#0a0320']}
          size={256}
        />
      </spriteMaterial>
    </sprite>
  )
}

/**
 * Soft bloom around the Moon's disc. A sprite, so it always faces the camera; it
 * sits at the Moon's centre and the opaque disc occludes its middle, which
 * leaves a clean halo around the limb.
 */
function MoonGlow({ layout }: { layout: StageLayout }) {
  return (
    <sprite position={layout.moonPosition} scale={layout.moonRadius * 5.5}>
      <spriteMaterial
        transparent
        depthWrite={false}
        fog={false}
        opacity={0.8}
        color="#c9a6ff"
        blending={THREE.AdditiveBlending}
      >
        <GradientTexture
          attach="map"
          type={GradientType.Radial}
          stops={[0, 0.3, 0.62, 1]}
          colors={['#f0e4ff', '#a97bff', '#4a1c9c', '#0a0320']}
          size={256}
        />
      </spriteMaterial>
    </sprite>
  )
}

/**
 * Hero pose. The GLB faces its cameras up +Y with the dish on -Z, so tilting the
 * top towards the viewer and turning it slightly shows the camera stack, the
 * solar panels and the high-gain dish at once.
 */
const HERO_POSE: [number, number, number] = [-0.42, 0.52, 0.08]

/**
 * The Ranger 7 GLB, centred on its own bounding box and normalised to
 * SHOWCASE.shipRadius, so the framing maths holds for any asset revision.
 * The cached GLB scene, its geometry and its materials are shared with the rest
 * of the app, so they are deliberately not disposed here. Reduced motion turns
 * off the gentle float but keeps the pose.
 */
function RangerHero({ onMeasured }: { onMeasured: () => void }) {
  const gltf = useGLTF(GLB.ranger7)
  const reduceMotion = useReducedMotion() === true

  const { scene, offset, scale } = useMemo(() => {
    const clone = gltf.scene.clone(true)
    const box = new THREE.Box3().setFromObject(clone)
    const size = box.getSize(new THREE.Vector3())
    const centre = box.getCenter(new THREE.Vector3())
    const { scale: uniform, offset: shift } = normaliseShip({ size, centre })
    return { scene: clone, offset: shift, scale: uniform }
  }, [gltf.scene])

  useEffect(() => {
    onMeasured()
  }, [onMeasured, scene])

  return (
    <Float
      enabled={!reduceMotion}
      speed={1.1}
      rotationIntensity={0.18}
      floatIntensity={0.5}
      floatingRange={[-0.04, 0.04]}
    >
      <group scale={scale} rotation={HERO_POSE}>
        <group position={offset}>
          <primitive object={scene} />
        </group>
      </group>
    </Float>
  )
}

/** Shaded stand-in Moon, used while the GLB streams in or if it cannot load. */
function PlaceholderMoon() {
  return (
    <mesh>
      <sphereGeometry args={[MOON_RADIUS_UK, 48, 32]} />
      <meshStandardMaterial color="#b8b2d8" roughness={1} metalness={0} flatShading />
    </mesh>
  )
}

/** The Moon GLB as a background object, with its own loading and error states. */
function MoonStage({ layout }: { layout: StageLayout }) {
  return (
    <group position={layout.moonPosition} scale={layout.moonScale}>
      <SceneErrorBoundary fallback={() => <PlaceholderMoon />}>
        <Suspense fallback={<PlaceholderMoon />}>
          <MoonModel rotation={[0.2, -0.7, 0.08]} />
        </Suspense>
      </SceneErrorBoundary>
    </group>
  )
}

/** Coloured studio light baked into an environment map, so the metals read. */
function StudioEnvironment() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={2.4} position={[0, 4, 3]} scale={[8, 5, 1]} color="#fff6e8" />
      <Lightformer form="rect" intensity={1.6} position={[-5, 1, -2]} scale={[6, 6, 1]} color="#6a2bd1" />
      <Lightformer form="ring" intensity={2.4} position={[5, 0, 1]} scale={3} color="#38e1ff" />
      <Lightformer form="rect" intensity={1.2} position={[0, -3, 2]} scale={[7, 3, 1]} color="#ff5ca8" />
    </Environment>
  )
}

/**
 * Frames the shot from the current aspect ratio. The camera is declared, not
 * mutated: when the viewport shape changes the framing recomputes, while
 * OrbitControls keeps the player's own rotate and zoom between resizes.
 */
function CameraRig() {
  const { width, height } = useThree((state) => state.size)
  const layout = useMemo(
    () => stageLayout(height > 0 ? width / height : 1),
    [width, height],
  )

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={layout.cameraPosition}
        fov={SHOWCASE.fov}
        near={Math.max(layout.distance * 0.02, 0.05)}
        far={layout.distance * 40}
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.6}
        zoomSpeed={0.7}
        target={[0, 0, 0]}
        minDistance={layout.minDistance}
        maxDistance={layout.maxDistance}
        minAzimuthAngle={layout.minAzimuthAngle}
        maxAzimuthAngle={layout.maxAzimuthAngle}
        minPolarAngle={layout.minPolarAngle}
        maxPolarAngle={layout.maxPolarAngle}
      />
    </>
  )
}


interface Ranger7ShowcaseSceneProps {
  /** Called once the Ranger 7 model is measured and on screen. */
  onReady: () => void
}

/**
 * The whole 3D stage: Ranger 7 is the subject, the Moon sits behind it, and the
 * backdrop is a rich purple starfield with a nebula bloom. Deliberately not a
 * mission recreation: no descent path, no impact, no lunar surface.
 */
export function Ranger7ShowcaseScene({ onReady }: Ranger7ShowcaseSceneProps) {
  const { width, height } = useThree((state) => state.size)
  const layout = useMemo(
    () => stageLayout(height > 0 ? width / height : 1),
    [width, height],
  )

  return (
    <>
      <color attach="background" args={['#0a0320']} />
      <fog attach="fog" args={['#0a0320', layout.distance * 7, layout.distance * 18]} />

      <ambientLight intensity={0.6} color="#a9b7ff" />
      <directionalLight position={KEY_LIGHT} intensity={2.2} color="#fff5e1" />
      <directionalLight position={[-6, 2, -5]} intensity={1.4} color="#57e6ff" />
      <pointLight position={[-2.2, -1.4, 3.2]} intensity={5} color="#ff5ca8" distance={16} />
      <StudioEnvironment />

      <NebulaBackdrop layout={layout} />
      <CosmicStars />
      <MoonGlow layout={layout} />
      <MoonStage layout={layout} />
      <RangerHero onMeasured={onReady} />

      {/* A little drifting dust around the ship, so the space feels alive. */}
      <Sparkles
        count={28}
        scale={[layout.distance * 0.9, layout.distance * 0.7, layout.distance * 0.9]}
        size={layout.distance * 0.55}
        speed={0.18}
        opacity={0.7}
        color="#ffe9a8"
      />
      <CameraRig />
    </>
  )
}

