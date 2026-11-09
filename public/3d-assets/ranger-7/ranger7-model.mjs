// Ranger 7 (Block III) procedural model — same geometry, proportions, materials and
// texture as the standalone preview (ranger7.html). Only additions: names + grouping,
// and the preview's -1.2 viewing offset is dropped so the origin is the bus centre.
//
// Units: ~1 unit = 1 metre. Orientation (Three.js / glTF, Y-up):
//   +Y  tower / camera boresight (toward the Moon)
//   ±X  solar-panel axis
//   -Y  mid-course motor and high-gain dish (toward Earth)
//   Origin: centre of the hexagonal bus.
export function buildRanger7(THREE, makeCanvas) {
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.5, roughness: 0.4 });
  gold.name = 'GoldFoil';
  const silver = new THREE.MeshStandardMaterial({ color: 0xc4cad2, metalness: 0.5, roughness: 0.35 });
  silver.name = 'SilverMetal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x1c1f26, metalness: 0.3, roughness: 0.5 });
  dark.name = 'DarkInstrument';
  const white = new THREE.MeshStandardMaterial({ color: 0xe9ecef, metalness: 0.2, roughness: 0.5, side: THREE.DoubleSide });
  white.name = 'WhiteDish';

  // solar cell texture (identical drawing to the preview)
  const cv = makeCanvas(256, 256);
  const cx = cv.getContext('2d');
  cx.fillStyle = '#14306b'; cx.fillRect(0, 0, 256, 256);
  cx.strokeStyle = '#5f86c9'; cx.lineWidth = 2;
  for (let i = 0; i <= 256; i += 16) {
    cx.beginPath(); cx.moveTo(i, 0); cx.lineTo(i, 256); cx.stroke();
    cx.beginPath(); cx.moveTo(0, i); cx.lineTo(256, i); cx.stroke();
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 1.6);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.name = 'SolarCellGrid';
  const cells = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.3, roughness: 0.35 });
  cells.name = 'SolarCells';

  const named = (o, n) => { o.name = n; return o; };
  const group = (n) => named(new THREE.Group(), n);
  const mesh = (g, m, n) => named(new THREE.Mesh(g, m), n);

  function strut(a, b, r, m, n) {
    const d = new THREE.Vector3().subVectors(b, a);
    const s = mesh(new THREE.CylinderGeometry(r, r, d.length(), 8), m, n);
    s.position.copy(a).addScaledVector(d, 0.5);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize());
    return s;
  }

  const ship = group('Ranger7');

  // ---- hexagonal bus
  const body = group('Body'); ship.add(body);
  body.add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.35, 6), gold, 'Body_HexBus'));
  const rim = mesh(new THREE.CylinderGeometry(0.77, 0.77, 0.04, 6), silver, 'Body_HexRim');
  rim.position.y = 0.19; body.add(rim);

  // ---- truncated-cone lattice tower
  const tower = group('Tower'); ship.add(tower);
  const yb = 0.19, rb = 0.7, yt = 1.9, rt = 0.3;
  const ringR = y => rb + (rt - rb) * (y - yb) / (yt - yb);
  const ringsY = [yb, 1.05, yt];
  const pt = (k, y) => { const a = k * Math.PI / 3, r = ringR(y); return new THREE.Vector3(r * Math.sin(a), y, r * Math.cos(a)); };
  for (let k = 0; k < 6; k++) {
    tower.add(strut(pt(k, yb), pt(k, yt), 0.018, silver, `Tower_Leg_${k}`));
    for (let j = 0; j < 2; j++) {
      tower.add(strut(pt(k, ringsY[j]), pt(k + 1, ringsY[j + 1]), 0.01, silver, `Tower_BraceA_${k}_${j}`));
      tower.add(strut(pt(k + 1, ringsY[j]), pt(k, ringsY[j + 1]), 0.01, silver, `Tower_BraceB_${k}_${j}`));
    }
    ringsY.slice(1).forEach((y, i) => tower.add(strut(pt(k, y), pt(k + 1, y), 0.012, silver, `Tower_Ring_${k}_${i}`)));
  }

  // ---- camera assembly
  const cam = group('CameraAssembly'); ship.add(cam);
  const house = mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.28, 24), gold, 'Camera_Housing');
  house.position.y = 2.04; cam.add(house);
  const plate = mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.03, 24), silver, 'Camera_TopPlate');
  plate.position.y = 2.2; cam.add(plate);
  const lenses = [[-0.12, 0.1, 0.075], [0.12, 0.1, 0.075], [-0.2, -0.12, 0.045], [0, -0.17, 0.045], [0.2, -0.12, 0.045], [0, 0.22, 0.045]];
  const lensNames = ['Camera_Lens_WideA', 'Camera_Lens_WideB', 'Camera_Lens_NarrowA', 'Camera_Lens_NarrowB', 'Camera_Lens_NarrowC', 'Camera_Lens_NarrowD'];
  lenses.forEach(([x, z, r], i) => {
    const l = mesh(new THREE.CylinderGeometry(r, r, 0.1, 16), dark, lensNames[i]);
    l.position.set(x, 2.27, z); cam.add(l);
  });

  // ---- omni antenna
  const omni = group('OmniAntenna'); ship.add(omni);
  omni.add(strut(new THREE.Vector3(0, 2.2, -0.05), new THREE.Vector3(0, 3.5, -0.05), 0.014, silver, 'Omni_Mast'));
  const tip = mesh(new THREE.SphereGeometry(0.04, 12, 12), silver, 'Omni_Tip');
  tip.position.set(0, 3.52, -0.05); omni.add(tip);

  // ---- solar panels
  [-1, 1].forEach(s => {
    const tag = s < 0 ? 'NegX' : 'PosX';
    const sp = group(`SolarPanel_${tag}`); ship.add(sp);
    sp.add(strut(new THREE.Vector3(s * 0.62, 0.1, 0), new THREE.Vector3(s * 0.9, 0.1, 0), 0.03, silver, `SolarPanel_${tag}_Arm`));
    const mats = [silver, silver, cells, silver, silver, silver];
    const p = mesh(new THREE.BoxGeometry(1.8, 0.035, 1.5), mats, `SolarPanel_${tag}_Array`);
    p.position.set(s * 1.8, 0.1, 0); sp.add(p);
    const frameGeo = new THREE.BoxGeometry(1.84, 0.02, 0.04);
    [-0.75, 0.75].forEach((z, i) => {
      const f = mesh(frameGeo, silver, `SolarPanel_${tag}_Frame_${i}`);
      f.position.set(s * 1.8, 0.1, z); sp.add(f);
    });
    const jet = mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.12, 10), silver, `SolarPanel_${tag}_AttitudeJet`);
    jet.rotation.z = Math.PI / 2; jet.position.set(s * 2.75, 0.1, 0); sp.add(jet);
  });

  // ---- high-gain antenna
  const hga = group('HighGainAntenna'); ship.add(hga);
  const pts = []; for (let r = 0; r <= 0.6001; r += 0.05) pts.push(new THREE.Vector2(r, 0.555 * r * r));
  const pivot = group('HGA_Pivot'); pivot.position.set(0, -0.7, -0.5); pivot.rotation.x = -0.35; hga.add(pivot);
  const inner = group('HGA_Inner'); inner.rotation.x = Math.PI; pivot.add(inner);
  inner.add(mesh(new THREE.LatheGeometry(pts, 40), white, 'HGA_Dish'));
  inner.add(strut(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.45, 0), 0.012, silver, 'HGA_FeedBoom'));
  const horn = mesh(new THREE.ConeGeometry(0.05, 0.1, 12), gold, 'HGA_FeedHorn');
  horn.position.y = 0.47; inner.add(horn);
  hga.add(strut(new THREE.Vector3(0, -0.17, -0.45), new THREE.Vector3(0, -0.7, -0.5), 0.025, silver, 'HGA_Boom_Main'));
  hga.add(strut(new THREE.Vector3(0.3, -0.17, -0.35), new THREE.Vector3(0, -0.7, -0.5), 0.015, silver, 'HGA_Boom_PosX'));
  hga.add(strut(new THREE.Vector3(-0.3, -0.17, -0.35), new THREE.Vector3(0, -0.7, -0.5), 0.015, silver, 'HGA_Boom_NegX'));

  // ---- mid-course motor nozzle (preview sets the shared dark material double-sided)
  dark.side = THREE.DoubleSide;
  const noz = mesh(new THREE.ConeGeometry(0.13, 0.28, 20, 1, true), dark, 'MidcourseMotor_Nozzle');
  noz.rotation.x = Math.PI; noz.position.set(0, -0.31, 0); ship.add(noz);

  return ship;
}
