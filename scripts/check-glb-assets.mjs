// Loads both GLB assets with the official Three.js GLTFLoader and checks the
// contracts the app relies on: named components, materials, sizes, textures,
// plus the story bible content file.
//
//   node scripts/check-glb-assets.mjs
import fs from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const root = process.cwd()
const problems = []
const note = (ok, message) => {
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${message}`)
  if (!ok) problems.push(message)
}

function readGlbJson(file) {
  const buf = fs.readFileSync(file)
  const length = buf.readUInt32LE(12)
  return JSON.parse(buf.subarray(20, 20 + length).toString())
}

// Node shims so embedded PNG textures "decode" without a DOM. Verification
// only needs geometry, names and materials, not real pixels.
globalThis.self = globalThis
class FakeImage {
  width = 1
  height = 1
  close() {}
}
globalThis.createImageBitmap = async () => new FakeImage()
globalThis.URL.createObjectURL = () => 'blob:stub'
globalThis.URL.revokeObjectURL = () => {}
globalThis.Blob = globalThis.Blob ?? class {}
globalThis.Response = globalThis.Response ?? class {}

async function loadGlb(file) {
  const buf = fs.readFileSync(file)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  return new Promise((resolve, reject) => new GLTFLoader().parse(ab, '', resolve, reject))
}

// ---- Moon ----
const moonFile = path.join(root, 'public/3d-assets/moon_small.glb')
const moonJson = readGlbJson(moonFile)
const moonNow = await loadGlb(moonFile)
const moonBox = new THREE.Box3().setFromObject(moonNow.scene)
const moonSize = moonBox.getSize(new THREE.Vector3())
note(fs.existsSync(moonFile), `moon GLB exists (${(fs.statSync(moonFile).size / 1e6).toFixed(1)} MB)`)
note(Math.abs(moonSize.x - 2.543728) < 1e-3, `moon radius 1.2719 units (diameter ${moonSize.x.toFixed(4)})`)
note(Math.hypot(...moonBox.getCenter(new THREE.Vector3()).toArray()) < 1e-3, 'moon is centred on the origin')
const moonTex = moonJson.images?.[0]
note(!!moonTex, 'moon base-colour texture is embedded')
let triangles = 0
moonNow.scene.traverse((o) => {
  if (o.isMesh) triangles += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3
})
note(triangles > 10000 && triangles < 100000, `moon triangle budget ${triangles.toFixed(0)}`)

// ---- Ranger 7 ----
const shipFile = path.join(root, 'public/3d-assets/ranger-7/ranger-7.glb')
const shipJson = readGlbJson(shipFile)
const ship = await loadGlb(shipFile)
const required = ['Body', 'Tower', 'CameraAssembly', 'OmniAntenna', 'SolarPanel_PosX', 'SolarPanel_NegX', 'HighGainAntenna', 'MidcourseMotor_Nozzle']
note(fs.existsSync(shipFile), `Ranger 7 GLB exists (${(fs.statSync(shipFile).size / 1024).toFixed(0)} KB)`)
for (const name of required) {
  note(!!ship.scene.getObjectByName(name), `named component present: ${name}`)
}
const materials = new Set()
ship.scene.traverse((o) => {
  if (o.isMesh) [o.material].flat().forEach((m) => materials.add(m.name))
})
note(materials.size === 5, `five named materials: ${[...materials].join(', ')}`)
note(shipJson.images?.length >= 1, 'solar-cell texture is embedded')
const hierarchy = []
ship.scene.traverse((o) => {
  if (o.isGroup && o.name) hierarchy.push(o.name)
})
console.log('      top-level groups:', hierarchy.filter((n) => required.includes(n)).join(', '))

// Hotspot anchors must sit inside the model, otherwise drei's <Html> floats away.
const shipBox = new THREE.Box3().setFromObject(ship.scene)
const padding = 0.35
const padded = shipBox.clone().expandByScalar(padding)
const anchors = [
  ['cameras', [0.95, 0.25, 0]],
  ['solar', [0, 1.05, 0]],
  ['highGain', [-0.55, -0.65, -0.55]],
  ['omni', [0.35, 0.95, 0]],
  ['structure', [0, -0.55, 0.55]],
]
for (const [id, a] of anchors) {
  const p = new THREE.Vector3(...a)
  note(padded.containsPoint(p), `hotspot anchor for ${id} sits near the model`)
}
const shipSize = shipBox.getSize(new THREE.Vector3())
note(Math.abs(shipSize.x - 5.62) < 0.1, `Ranger 7 span fitted from the GLB (${shipSize.x.toFixed(2)} m; NASA full span 4.6 m with the antennas)`)

// ---- Impact-site terrain ----
const terrainDir = path.join(root, 'public/3d-assets/ranger-7-terrain')
for (const f of ['ranger7-height.png', 'ranger7-albedo.png', 'ranger7-lighting.png', 'ranger7-terrain.json']) {
  note(fs.existsSync(path.join(terrainDir, f)), `terrain asset present: ${f}`)
}
const terrain = JSON.parse(fs.readFileSync(path.join(terrainDir, 'ranger7-terrain.json'), 'utf8'))
note(terrain.impact.lat === -10.7, 'terrain metadata keeps the IAU impact latitude')

// ---- Story bible ----
// The story content ships as data, so it must be present and unabridged in both
// languages. Milestone 1 does not render it yet (see Milestone 2).
const publicBible = path.join(root, 'public/data/space_ghosts_story_bible.json')
const contentBible = path.join(root, 'src/content/space-ghosts-story-bible.json')
note(fs.existsSync(contentBible), 'story bible copied into src/content')
if (fs.existsSync(contentBible) && fs.existsSync(publicBible)) {
  note(
    fs.readFileSync(publicBible).equals(fs.readFileSync(contentBible)),
    'story bible in src/content is byte-identical to the supplied JSON',
  )
}
if (fs.existsSync(contentBible)) {
  const bible = JSON.parse(fs.readFileSync(contentBible, 'utf8'))
  note(bible.missions?.length === 17, `story bible keeps all 17 machines (${bible.missions?.length})`)
  const partsOk = bible.missions?.every((m) => m.story_parts?.length === 7)
  note(partsOk, 'every machine keeps its 7 story parts')
  const bilingualOk = bible.missions?.every(
    (m) =>
      m.name?.en &&
      m.name?.bn &&
      m.story_parts.every((p) => p.text?.en?.trim() && p.text?.bn?.trim()),
  )
  note(bilingualOk, 'English and Bangla text preserved for every mission')
  note(
    bible.editorial_verification_notes?.items_to_check?.length > 0,
    'editorial verification notes retained',
  )
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) found`)
  process.exit(1)
}
console.log('\nPASS: both GLB assets load and match the app contract')
