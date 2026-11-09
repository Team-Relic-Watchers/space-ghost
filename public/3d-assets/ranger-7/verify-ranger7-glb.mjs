// Loads the GLB with THREE.GLTFLoader and compares it to the procedural source model.
import fs from 'node:fs';
import { createCanvas, loadImage } from 'canvas';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { buildRanger7 } from './ranger7-model.mjs';

globalThis.self = globalThis;
// Node shim so GLTFLoader's ImageBitmapLoader path can decode the embedded PNG
globalThis.createImageBitmap = async (blob) => loadImage(Buffer.from(await blob.arrayBuffer()));

const file = process.argv[2];
const buf = fs.readFileSync(file);
const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
const gltf = await new Promise((res, rej) => new GLTFLoader().parse(ab, '', res, rej));
const loaded = gltf.scene.children[0] ?? gltf.scene;
console.log('loaded root:', loaded.name, '| scenes:', gltf.scenes.length, '| animations:', gltf.animations.length);

const src = buildRanger7(THREE, createCanvas); src.updateMatrixWorld(true);
loaded.updateMatrixWorld(true);

// Source: named meshes. Loaded: named nodes (multi-material meshes come back as a Group of per-material sub-meshes).
const collect = (root) => { const m = new Map(); root.traverse(o => { if (o.name && !m.has(o.name)) m.set(o.name, o); }); return m; };
const meshesOf = (o) => { const r = []; o.traverse(c => c.isMesh && r.push(c)); return r; };
const A = new Map([...collect(src)].filter(([, o]) => o.isMesh)), B = collect(loaded);
const trisOf = (ms) => ms.reduce((t, m) => t + (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3, 0);
const boxOf = (ms) => ms.reduce((b, m) => b.union(new THREE.Box3().setFromObject(m)), new THREE.Box3());
let bad = 0;
const fail = (s) => { bad++; console.log('  MISMATCH', s); };

console.log('named source meshes:', A.size, '| loaded meshes (incl. per-material sub-meshes):', meshesOf(loaded).length);
let multi = 0;
for (const [name, a] of A) {
  const node = B.get(name);
  if (!node) { fail('missing node ' + name); continue; }
  const bm = meshesOf(node), am = [a];
  if (Array.isArray(a.material)) multi++;
  if (trisOf(am) !== trisOf(bm)) fail(`${name} triangles ${trisOf(am)} vs ${trisOf(bm)}`);
  const ba = boxOf(am), bb = boxOf(bm);
  const d = Math.max(...['min', 'max'].flatMap(k => ba[k].toArray().map((v, i) => Math.abs(v - bb[k].getComponent(i)))));
  if (d > 1e-4) fail(`${name} world bbox drift ${d}`);
  const ma = [].concat(a.material).map(m => m.name).sort().join('|');
  const mb = bm.map(m => m.material.name).sort().join('|');
  if (ma !== mb) fail(`${name} materials ${ma} vs ${mb}`);
  const mats = new Map(bm.map(m => [m.material.name, m.material]));
  for (const x of [].concat(a.material)) {
    const y = mats.get(x.name);
    const dc = Math.abs(x.color.r - y.color.r) + Math.abs(x.color.g - y.color.g) + Math.abs(x.color.b - y.color.b);
    if (dc > 1e-3 || Math.abs(x.metalness - y.metalness) > 1e-3 || Math.abs(x.roughness - y.roughness) > 1e-3 || x.side !== y.side || !!x.map !== !!y.map)
      fail(`${name} material ${x.name} differs (color/metal/rough/side/map)`);
  }
}
console.log('compared', A.size, 'named meshes by triangles, world bounds, materials (', multi, 'multi-material )');
const bs = new THREE.Box3().setFromObject(src), bl = new THREE.Box3().setFromObject(loaded);
const sz = (b) => b.getSize(new THREE.Vector3()).toArray().map(v => +v.toFixed(3));
console.log('overall size  source', sz(bs), '| loaded', sz(bl));
console.log('overall min/max loaded', bl.min.toArray().map(v=>+v.toFixed(3)), bl.max.toArray().map(v=>+v.toFixed(3)));

// materials + textures
const mats = new Map(); loaded.traverse(o => o.isMesh && [].concat(o.material).forEach(m => mats.set(m.name, m)));
console.log('materials:', [...mats.keys()].join(', '));
const solar = mats.get('SolarCells');
const img = solar?.map?.image;
console.log('solar texture:', img ? `${img.width}x${img.height} decoded` : 'MISSING', '| repeat', solar?.map?.repeat?.toArray(), '| wrap', solar?.map?.wrapS === THREE.RepeatWrapping ? 'repeat' : solar?.map?.wrapS, '| colorSpace', solar?.map?.colorSpace);
if (!img || img.width !== 256) fail('solar texture not embedded/decoded');
if (Math.abs(solar.map.repeat.x - 2) > 1e-6 || Math.abs(solar.map.repeat.y - 1.6) > 1e-6) fail('texture repeat');

// named components
const names = []; loaded.traverse(o => { if (o.isGroup || o.isObject3D && !o.isMesh && o.children.length) names.push(o.name); });
console.log('component groups:', names.filter(Boolean).join(', '));
for (const n of ['Body_HexBus','Camera_Housing','Camera_Lens_WideA','Omni_Mast','SolarPanel_PosX_Array','SolarPanel_NegX_Array','HGA_Dish','MidcourseMotor_Nozzle'])
  if (!B.has(n)) fail('expected named mesh missing: ' + n);

console.log(bad ? `\nFAILED: ${bad} mismatches` : '\nPASS: GLB loads in GLTFLoader and matches the source model');
process.exit(bad ? 1 : 0);
