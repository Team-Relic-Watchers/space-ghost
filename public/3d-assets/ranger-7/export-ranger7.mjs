// Exports the procedural Ranger 7 model to a binary glTF (GLB) with embedded
// materials + textures, using Three.js's official GLTFExporter.
//
//   npm i three canvas
//   node scripts/export-ranger7.mjs [output.glb]     (default: public/models/ranger-7.glb)
import fs from 'node:fs';
import path from 'node:path';
import { createCanvas } from 'canvas';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildRanger7 } from './ranger7-model.mjs';

// ---- minimal browser shims for GLTFExporter (Node has no DOM) ----
const canvasProto = Object.getPrototypeOf(createCanvas(1, 1));
canvasProto.toBlob = function (cb, type = 'image/png') {
  cb(new Blob([this.toBuffer(type)], { type }));   // lossless PNG for the solar-cell texture
};
globalThis.document = { createElement: (t) => { if (t !== 'canvas') throw new Error(t); return createCanvas(1, 1); } };
globalThis.FileReader = class {
  readAsArrayBuffer(b) { b.arrayBuffer().then((r) => { this.result = r; this.onloadend?.(); }); }
  readAsDataURL(b) { b.arrayBuffer().then((r) => { this.result = `data:${b.type};base64,${Buffer.from(r).toString('base64')}`; this.onloadend?.(); }); }
};

const out = path.resolve(process.argv[2] ?? 'public/models/ranger-7.glb');
const ship = buildRanger7(THREE, createCanvas);
ship.updateMatrixWorld(true);

const glb = await new GLTFExporter().parseAsync(ship, {
  binary: true,          // single .glb, buffers + images embedded
  onlyVisible: true,
  embedImages: true,
  maxTextureSize: 1024,
});

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(glb));
console.log(`wrote ${out} (${(glb.byteLength / 1024).toFixed(1)} KB)`);
