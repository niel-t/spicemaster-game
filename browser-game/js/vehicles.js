// Shared vehicle models: the Oofmobiel and the street cars, used by the hub (main.js), the missions (through main.js'
// car() and the van clone) and the top-down drive (drive.js). Physically based paint, glass, rubber and chrome, so
// they pick up the scene's environment map.
//
//   makeOofmobiel(THREE, canvasTex)          → Group, nose towards local +z, wheels on y = 0
//   makeCar(THREE, canvasTex, opts)          → Group, nose towards local +x (main.js convention), wheels on y = 0
//     opts: { model: index or -1, paint: 0xrrggbb, rand: () => 0..1, lampas: bool }
//     userData: { half (half length), width, model (name), paint (the paint material) }

// ---------------------------------------------------------------- shared helpers and materials (built once per THREE)
let K = null;
function kit(THREE, canvasTex) {
  if (K) return K;
  const std = (o) => new THREE.MeshStandardMaterial(o), phys = (o) => new THREE.MeshPhysicalMaterial(o);
  K = {
    grey: std({ color: 0x55595d, roughness: 0.85 }),        // unpainted textured plastic
    black: std({ color: 0x141516, roughness: 0.7 }),
    rubber: std({ color: 0x1b1b1c, roughness: 0.95 }),
    glass: phys({ color: 0x0c1218, metalness: 0.2, roughness: 0.04, clearcoat: 1, envMapIntensity: 1.6 }),
    steel: std({ color: 0xa7abb0, metalness: 0.75, roughness: 0.38 }),
    chrome: std({ color: 0xe8e8f0, metalness: 0.95, roughness: 0.12 }),
    cream: std({ color: 0xf2e8c8, roughness: 0.4 }),
    lens: phys({ color: 0xe8eef4, metalness: 0.1, roughness: 0.05, emissive: 0xfff4d8, emissiveIntensity: 0.35, clearcoat: 1 }),
    tail: phys({ color: 0xb01010, roughness: 0.15, emissive: 0x500000, clearcoat: 1 }),
    amber: phys({ color: 0xff8a10, roughness: 0.15, emissive: 0x552200, clearcoat: 1 }),
    paints: {},
    plates: [],
    tyre: {}, rim: {}, disc: {},
  };
  const blobT = canvasTex(64, 128, (c) => { const gr = c.createRadialGradient(32, 64, 4, 32, 64, 60); gr.addColorStop(0, 'rgba(0,0,0,.75)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 128); });
  K.blob = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false });
  K.plate = (text) => { // Kaasland plates: yellow, a blue KL strip; a few cached texts
    let p = K.plates.find((q) => q.text === text);
    if (!p) {
      const t = canvasTex(256, 56, (c) => { c.fillStyle = '#f4c81c'; c.fillRect(0, 0, 256, 56); c.fillStyle = '#1a3a9a'; c.fillRect(0, 0, 26, 56); c.fillStyle = '#ffd84a'; c.font = '700 13px Arial'; c.textAlign = 'center'; c.fillText('KL', 13, 46); c.strokeStyle = '#111'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, 253, 53); c.fillStyle = '#111'; c.font = '900 40px "Arial Black", Arial'; c.fillText(text, 141, 44, 220); });
      p = { text, m: std({ map: t, roughness: 0.4 }) }; K.plates.push(p);
    }
    return p.m;
  };
  return K;
}
const paintM = (THREE, c) => K.paints[c] || (K.paints[c] = new THREE.MeshPhysicalMaterial({ color: c, metalness: 0.4, roughness: 0.34, clearcoat: 1, clearcoatRoughness: 0.08 }));
function boxIn(THREE, g, w, h, d, m, x, y, z, shadow = false) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); b.castShadow = shadow; g.add(b); return b; }
function cylIn(THREE, rt, rb, h, m, seg) { return new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); }
function roundShape(THREE, pts, r) {
  const sh = new THREE.Shape(), n = pts.length, P = (i) => pts[(i + n) % n];
  for (let i = 0; i < n; i++) {
    const [px, py] = P(i - 1), [cx, cy] = P(i), [nx, ny] = P(i + 1);
    const d1 = Math.hypot(cx - px, cy - py), d2 = Math.hypot(nx - cx, ny - cy), rr = Math.min(r, d1 / 2, d2 / 2);
    const ax = cx + (px - cx) / d1 * rr, ay = cy + (py - cy) / d1 * rr, bx = cx + (nx - cx) / d2 * rr, by = cy + (ny - cy) / d2 * rr;
    if (i === 0) sh.moveTo(ax, ay); else sh.lineTo(ax, ay);
    sh.quadraticCurveTo(cx, cy, bx, by);
  }
  sh.closePath(); return sh;
}
// a wheel facing ±z (side = +1 or -1): rounded tyre, rim (steel, chrome or cream hubcap), six holes or a cap
function wheel(THREE, r, side, rimM, holes = true) {
  const w = new THREE.Group(), key = r.toFixed(2);
  const tg = K.tyre[key] || (K.tyre[key] = new THREE.TorusGeometry(r * 0.72, r * 0.28, 10, 28));
  const tyre = new THREE.Mesh(tg, K.rubber); tyre.scale.set(1, 1, 1.15); tyre.castShadow = true; w.add(tyre);
  const rg = K.rim[key] || (K.rim[key] = new THREE.CylinderGeometry(r * 0.56, r * 0.56, r * 0.5, 22));
  const rim = new THREE.Mesh(rg, rimM); rim.rotation.x = Math.PI / 2; w.add(rim);
  const face = side * r * 0.26;
  const cap = cylIn(THREE, r * 0.18, r * 0.18, 0.03, K.black, 12); cap.rotation.x = Math.PI / 2; cap.position.z = face; w.add(cap);
  if (holes) {
    const hg = K.disc[key] || (K.disc[key] = new THREE.CircleGeometry(r * 0.075, 8));
    for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, h = new THREE.Mesh(hg, K.black); h.position.set(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36, face + side * 0.002); if (side < 0) h.rotation.y = Math.PI; w.add(h); }
  }
  return w;
}

// ---------------------------------------------------------------- the Oofmobiel
export function makeOofmobiel(THREE, canvasTex) {
  kit(THREE, canvasTex);
  const { grey, black, rubber, glass, steel, lens, tail, amber } = K;
  const box = (w, h, d, m, x, y, z, shadow) => boxIn(THREE, g, w, h, d, m, x, y, z, shadow);
  const g = new THREE.Group(), W = 2.0;
  // a mid-blue panel van (the T5-style reference on the Drive): metallic clear-coat paint
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x2c4fa6, metalness: 0.45, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.08 });
  // body: one side profile (z forward, y up) extruded across the width, generously rounded like pressed steel
  const pr = new THREE.Shape();
  pr.moveTo(-2.42, 0.46); pr.lineTo(-2.42, 1.8); pr.quadraticCurveTo(-2.42, 1.98, -2.24, 1.98); pr.lineTo(0.66, 1.98);
  pr.quadraticCurveTo(0.86, 1.98, 0.94, 1.87); pr.lineTo(1.76, 1.29); pr.quadraticCurveTo(1.86, 1.22, 2.0, 1.19); pr.lineTo(2.32, 1.1);
  pr.quadraticCurveTo(2.46, 1.05, 2.46, 0.9); pr.lineTo(2.46, 0.46); pr.closePath();
  const bev = 0.14;
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(pr, { depth: W - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: 0.07, bevelSegments: 5, curveSegments: 10 }), blue);
  body.geometry.rotateY(-Math.PI / 2); body.geometry.translate(W / 2 - bev, 0, 0); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const SX = W / 2 + 0.005; // the flat side of the body
  const onSide = (sx, w, h, z, y, m, out = 0.004) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); q.rotation.y = sx * Math.PI / 2; q.position.set(sx * (SX + out), y, z); g.add(q); return q; };
  // windscreen with a black rubber surround and two wipers
  const slope = Math.atan2(0.58, 0.82), wsLen = Math.hypot(0.82, 0.58);
  const wsAt = (w, h, m, off) => { const q = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); q.rotation.x = -(Math.PI / 2 - slope); q.position.set(0, 1.58, 1.35); q.translateZ(0.075 + off); g.add(q); return q; };
  wsAt(W - 0.12, wsLen - 0.02, rubber, 0); wsAt(W - 0.24, wsLen - 0.12, glass, 0.004);
  for (const x of [-0.45, 0.35]) { const wp = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.025, 0.03), black); wp.position.set(x, 1.33, 1.79); wp.rotation.z = 0.12; g.add(wp); }
  for (const sx of [-1, 1]) {
    for (const [w, h, z, y] of [[0.74, 0.5, 0.46, 1.6], [1.25, 0.48, -0.62, 1.63], [0.78, 0.48, -1.78, 1.63]]) { onSide(sx, w + 0.07, h + 0.07, z, y, rubber, 0.003); onSide(sx, w, h, z, y, glass, 0.006); }
    for (const z of [0.98, 0.06, -1.32]) onSide(sx, 0.014, 1.38, z, 1.2, black, 0.007); // panel gaps
    onSide(sx, 3.3, 0.012, -0.2, 0.62, black, 0.007);
    onSide(sx, 1.4, 0.03, -0.62, 1.33, black, 0.007);                                // sliding door rail
    for (const z of [0.82, -0.1]) onSide(sx, 0.16, 0.04, z, 1.27, grey, 0.012);       // handles
    box(0.14, 0.06, 0.12, black, sx * (W / 2 + 0.08), 1.4, 0.98);
    box(0.07, 0.28, 0.2, black, sx * (W / 2 + 0.2), 1.48, 0.98, true);
    box(0.06, 0.26, 0.04, blue, sx * (W / 2 + 0.2), 1.48, 1.09);
    box(0.04, 0.04, 0.08, amber, sx * (W / 2 + 0.008), 1.0, 1.95);
    for (const z of [1.6, -1.58]) { // wheel wells and grey arch lips
      const well = new THREE.Mesh(new THREE.CircleGeometry(0.47, 24, 0, Math.PI), rubber); well.rotation.y = sx * Math.PI / 2; well.position.set(sx * (SX + 0.002), 0.4, z); g.add(well);
      const lip = new THREE.Mesh(new THREE.TorusGeometry(0.48, 0.035, 6, 24, Math.PI), grey); lip.rotation.y = sx * Math.PI / 2; lip.position.set(sx * (SX + 0.01), 0.4, z); g.add(lip);
    }
  }
  // rear: twin-door glass, split line, handle, tall tail lights
  for (const sx of [-1, 1]) { const rw = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.48), glass); rw.rotation.y = Math.PI; rw.position.set(sx * 0.46, 1.62, -2.505); g.add(rw); }
  { const sl = new THREE.Mesh(new THREE.PlaneGeometry(0.014, 1.4), black); sl.rotation.y = Math.PI; sl.position.set(0, 1.2, -2.507); g.add(sl); }
  box(0.18, 0.04, 0.03, grey, 0.2, 1.15, -2.51);
  for (const sx of [-1, 1]) box(0.16, 0.56, 0.05, tail, sx * 0.88, 1.2, -2.495);
  // rounded grey bumpers, grille, headlights with an inner reflector, indicators, fog lights
  const bump = (z, d) => { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, W - 0.1, 4, 10), grey); b.rotation.z = Math.PI / 2; b.scale.set(1, 1, d); b.position.set(0, 0.56, z); b.castShadow = true; g.add(b); };
  bump(2.48, 0.85); bump(-2.44, 0.75);
  box(0.95, 0.26, 0.05, grey, 0, 0.92, 2.555);
  for (let k = -1; k <= 1; k++) box(0.86, 0.03, 0.06, black, 0, 0.92 + k * 0.075, 2.575);
  for (const sx of [-1, 1]) {
    box(0.44, 0.21, 0.06, lens, sx * 0.72, 0.94, 2.545).rotation.y = sx * -0.12;
    const refl = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), steel); refl.position.set(sx * 0.66, 0.94, 2.58); g.add(refl);
    box(0.1, 0.13, 0.06, amber, sx * 0.97, 0.94, 2.52);
    box(0.12, 0.06, 0.03, lens, sx * 0.75, 0.52, 2.66);
  }
  { const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.11), K.plate('OOF-87-K')); pf.position.set(0, 0.56, 2.67); g.add(pf); }
  { const pb = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.11), K.plate('OOF-87-K')); pb.rotation.y = Math.PI; pb.position.set(0, 0.9, -2.508); g.add(pb); }
  // wheels (the helper faces ±z, so turn each one to face ±x)
  for (const [x, z] of [[0.93, 1.6], [-0.93, 1.6], [0.93, -1.58], [-0.93, -1.58]]) { const w = wheel(THREE, 0.39, 1, steel); w.rotation.y = Math.sign(x) * Math.PI / 2; w.position.set(x, 0.39, z); g.add(w); }
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 6.0), K.blob); blob.rotation.x = -Math.PI / 2; blob.position.y = 0.03; g.add(blob);
  // EDDY & ZN lettering on the cargo sides, a small roof decal (what you see from above), roof seams
  const sideT = canvasTex(512, 160, (c) => { c.textAlign = 'center'; c.fillStyle = '#ffd36b'; c.font = '900 70px "Arial Black", Arial'; c.fillText('EDDY & ZN', 256, 80); c.fillStyle = '#ffffff'; c.font = '700 30px Arial'; c.fillText('SPECERIJEN · SINDS 1987', 256, 128); });
  const sideM = new THREE.MeshStandardMaterial({ map: sideT, transparent: true, roughness: 0.3, depthWrite: false });
  for (const sx of [-1, 1]) onSide(sx, 1.6, 0.5, -0.6, 0.98, sideM, 0.008);
  for (const z of [-1.75, -1.05, -0.35]) box(W - 0.4, 0.025, 0.08, blue, 0, 2.06, z);
  const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), new THREE.MeshStandardMaterial({ map: canvasTex(256, 96, (c) => { c.textAlign = 'center'; c.fillStyle = '#ffd36b'; c.font = '900 52px "Arial Black", Arial'; c.fillText('EDDY & ZN', 128, 66); }), transparent: true, roughness: 0.3, depthWrite: false }));
  decal.rotation.x = -Math.PI / 2; decal.rotation.z = -Math.PI / 2; decal.position.set(0, 2.11, -1.4); g.add(decal);
  g.userData.paint = blue;
  return g;
}

// ---------------------------------------------------------------- street cars
// Kaasland's 80s/90s street cars, as side profiles (x forward, y up): body outline, side glass outline.
export const CAR_MODELS = [
  { n: 'Volvo 240', W: 1.75, r: 0.12, wr: 0.31, body: [[-2.3, 0.3], [2.3, 0.3], [2.35, 0.85], [1.1, 0.95], [0.6, 1.45], [-0.9, 1.45], [-1.5, 0.98], [-2.3, 0.95]], glass: [[1.05, 0.97], [0.58, 1.39], [-0.86, 1.39], [-1.42, 0.99]], lights: 'rect', rack: true },
  { n: 'Opel Kadett', W: 1.66, r: 0.16, wr: 0.3, body: [[-1.9, 0.3], [1.9, 0.3], [1.95, 0.8], [0.9, 0.92], [0.3, 1.42], [-1.6, 1.42], [-1.95, 0.95]], glass: [[0.85, 0.94], [0.3, 1.37], [-1.55, 1.37], [-1.86, 0.98]], lights: 'rect' },
  { n: 'Kever', W: 1.55, r: 0.38, wr: 0.3, body: [[-1.95, 0.32], [1.95, 0.32], [2.0, 0.62], [1.4, 0.9], [0.5, 1.05], [0.1, 1.5], [-0.7, 1.55], [-1.6, 1.1], [-2.0, 0.7]], glass: [[0.45, 1.06], [0.13, 1.44], [-0.68, 1.49], [-1.15, 1.2]], lights: 'round', chromeHub: true },
  { n: 'Lelijke Eend', W: 1.5, r: 0.3, wr: 0.3, body: [[-1.9, 0.4], [1.9, 0.4], [1.95, 0.75], [1.2, 0.95], [0.6, 1.0], [0.35, 1.55], [-0.9, 1.6], [-1.7, 1.1], [-1.95, 0.8]], glass: [[0.55, 1.04], [0.37, 1.5], [-0.85, 1.55], [-1.05, 1.08]], lights: 'round', fenders: true },
  { n: 'Volvo 245', W: 1.75, r: 0.1, wr: 0.31, body: [[-2.4, 0.3], [2.35, 0.3], [2.4, 0.85], [1.2, 0.95], [0.7, 1.48], [-2.3, 1.5], [-2.4, 0.95]], glass: [[1.15, 0.98], [0.7, 1.43], [-2.2, 1.45], [-2.3, 1.0]], lights: 'rect', rack: true },
  { n: 'Countach', W: 1.9, r: 0.06, wr: 0.32, body: [[-2.1, 0.25], [2.1, 0.25], [2.2, 0.5], [0.6, 0.82], [-0.2, 1.12], [-1.2, 1.08], [-2.1, 0.82]], glass: [[0.5, 0.86], [-0.18, 1.08], [-1.0, 1.05], [-1.3, 0.88]], lights: 'none', wing: true },
  { n: 'VW T3', W: 1.85, r: 0.22, wr: 0.33, body: [[-2.25, 0.35], [2.25, 0.35], [2.3, 1.0], [2.15, 1.9], [-2.25, 1.92]], glass: [[2.24, 1.15], [2.12, 1.78], [1.3, 1.8], [1.3, 1.15]], glass2: [[1.1, 1.25], [1.1, 1.78], [-2.05, 1.8], [-2.05, 1.25]], lights: 'round', twoTone: true },
  { n: 'Daf 33', W: 1.45, r: 0.2, wr: 0.28, body: [[-1.55, 0.3], [1.55, 0.3], [1.6, 0.75], [0.8, 0.85], [0.45, 1.35], [-1.25, 1.35], [-1.55, 0.85]], glass: [[0.75, 0.88], [0.45, 1.3], [-1.2, 1.3], [-1.46, 0.88]], lights: 'round' },
];
const PLATE_TEXTS = ['KL-04-FR', 'NW-12-KS', '37-GVT-9', 'ZT-88-PJ', 'SPK-21-B', 'FR-1T-ES', 'KAA-5-LD', '06-BRD-2'];
const ACCENTS = [0xffffff, 0xffd23a, 0xff3fa4, 0x1a1a1a];

export function makeCar(THREE, canvasTex, opts = {}) {
  kit(THREE, canvasTex);
  const rand = opts.rand || Math.random;
  const M = CAR_MODELS[opts.model >= 0 ? opts.model : Math.floor(rand() * CAR_MODELS.length)];
  const g = new THREE.Group(), pm = opts.lampas ? paintM(THREE, 0xff7a1a).clone() : paintM(THREE, opts.paint ?? 0xb8b2a2); // Lampas get their own paint (it turns black when wrecked)
  const box = (w, h, d, m, x, y, z, shadow) => boxIn(THREE, g, w, h, d, m, x, y, z, shadow);
  const ext = (pts, r, depth, m, bevel, y = 0) => {
    const geo = new THREE.ExtrudeGeometry(roundShape(THREE, pts, r), { depth, bevelEnabled: !!bevel, bevelThickness: 0.07, bevelSize: 0.06, bevelSegments: 4, curveSegments: 8 });
    geo.translate(0, y, -depth / 2); const me = new THREE.Mesh(geo, m); me.castShadow = true; me.receiveShadow = true; g.add(me); return me;
  };
  const xs = M.body.map((p) => p[0]), L = Math.max(...xs), Lb = -Math.min(...xs), top = Math.max(...M.body.map((p) => p[1]));
  ext(M.body, M.r, M.W - 0.14, pm, true);
  // side glass sits in a black rubber band (a slightly bigger, darker copy behind it)
  ext(M.glass, 0.05, M.W + 0.025, K.rubber);
  const glassOf = (pts) => { const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length; return pts.map(([x, y]) => [cx + (x - cx) * 0.94, cy + (y - cy) * 0.9]); };
  ext(glassOf(M.glass), 0.04, M.W + 0.04, K.glass);
  if (M.glass2) { ext(M.glass2, 0.05, M.W + 0.025, K.rubber); ext(glassOf(M.glass2), 0.04, M.W + 0.04, K.glass); }
  // B-pillar in body colour through the middle of the side glass
  const gx = M.glass.map((p) => p[0]), gy = M.glass.map((p) => p[1]), gMid = (Math.max(...gx) + Math.min(...gx)) / 2, gLow = Math.min(...gy), gTop = Math.max(...gy);
  if (!M.twoTone) box(0.1, gTop - gLow, M.W + 0.05, pm, gMid, (gTop + gLow) / 2, 0);
  // two-tone lower half or a black sill, an accent stripe on some
  if (M.twoTone || rand() < 0.2) { const lo = M.body.map(([px, py]) => [px, Math.min(py, 0.75)]); ext(lo, M.r * 0.6, M.W - 0.1, M.twoTone ? K.cream : K.black, false).position.y = 0.001; }
  else box(L + Lb - 1.0, 0.12, M.W + 0.04, K.black, (L - Lb) / 2, 0.38, 0);
  if (rand() < 0.35) box(L + Lb - 0.7, 0.06, M.W + 0.13, new THREE.MeshStandardMaterial({ color: ACCENTS[Math.floor(rand() * 4)], roughness: 0.4 }), (L - Lb) / 2, 0.72, 0);
  // panel gaps for the doors and handles
  for (const s of [1, -1]) {
    const zs = s * (M.W / 2 + 0.01);
    for (const x of [Math.max(...gx) + 0.05, gMid, Math.min(...gx) + (M.glass2 ? 0 : 0.05)]) { const gap = new THREE.Mesh(new THREE.PlaneGeometry(0.014, gLow - 0.38), K.black); gap.position.set(x, (gLow + 0.38) / 2, zs); if (s < 0) gap.rotation.y = Math.PI; g.add(gap); }
    for (const x of [gMid - 0.15, Math.min(...gx) + 0.25]) box(0.16, 0.035, 0.03, K.chrome, x, gLow - 0.08, s * (M.W / 2 + 0.005));
    box(0.12, 0.1, 0.16, K.black, Math.max(...gx) - 0.08, gLow + 0.05, s * (M.W / 2 + 0.08)); // mirror
  }
  // bumpers (chrome or black, rounded), lights with lenses, indicators, plates
  const bumpM = M.n === 'Countach' ? pm : rand() < 0.55 ? K.chrome : K.black;
  for (const [x, d] of [[L + 0.04, 1], [-Lb - 0.04, -1]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, M.W - 0.12, 3, 8), bumpM); b.rotation.x = Math.PI / 2; b.position.set(x, 0.42, 0); b.castShadow = true; g.add(b); }
  for (const sd of [1, -1]) {
    if (M.lights === 'round') { const l = cylIn(THREE, 0.11, 0.11, 0.06, K.lens, 14); l.rotation.z = Math.PI / 2; l.position.set(L - 0.01, 0.72, sd * (M.W / 2 - 0.28)); g.add(l); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 6, 16), K.chrome); rim.rotation.y = Math.PI / 2; rim.position.set(L + 0.02, 0.72, sd * (M.W / 2 - 0.28)); g.add(rim); }
    else if (M.lights === 'rect') box(0.06, 0.18, 0.42, K.lens, L + 0.02, 0.7, sd * (M.W / 2 - 0.32));
    else box(0.04, 0.05, 0.4, K.lens, L - 0.1, 0.52, sd * (M.W / 2 - 0.3));
    box(0.05, 0.08, 0.12, K.amber, L + 0.02, 0.56, sd * (M.W / 2 - 0.12));
    box(0.06, 0.16, 0.34, K.tail, -Lb - 0.02, 0.72, sd * (M.W / 2 - 0.3));
  }
  const pt = PLATE_TEXTS[Math.floor(rand() * PLATE_TEXTS.length)];
  { const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), K.plate(pt)); pf.rotation.y = Math.PI / 2; pf.position.set(L + 0.13, 0.42, 0); g.add(pf); }
  { const pb = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), K.plate(pt)); pb.rotation.y = -Math.PI / 2; pb.position.set(-Lb - 0.13, 0.42, 0); g.add(pb); }
  if (M.rack && rand() < 0.6) { for (const zz of [-0.55, 0.55]) box(1.6, 0.05, 0.05, K.black, -0.3, top + 0.12, zz); if (rand() < 0.5) box(1.2, 0.35, 0.9, new THREE.MeshStandardMaterial({ color: [0x2a5aa0, 0xd84a2a, 0xf2e8c8][Math.floor(rand() * 3)], roughness: 0.6 }), -0.3, top + 0.32, 0, true); }
  if (M.wing) { box(0.5, 0.06, M.W, pm, -Lb + 0.25, 1.1, 0); for (const zz of [-0.7, 0.7]) box(0.08, 0.25, 0.06, pm, -Lb + 0.25, 0.97, zz); }
  if (opts.lampas) { // Lampas chase car: black racing stripes and a big L on the roof
    for (const s of [-1, 1]) box(L + Lb - 0.4, 0.02, 0.14, K.black, (L - Lb) / 2, top + 0.075, s * 0.22);
    const t = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshStandardMaterial({ map: canvasTex(128, 128, (c) => { c.fillStyle = '#1a0a10'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#ff7a1a'; c.lineWidth = 8; c.strokeRect(6, 6, 116, 116); c.fillStyle = '#ff7a1a'; c.font = '900 96px "Arial Black", Arial'; c.textAlign = 'center'; c.fillText('L', 64, 100); }), roughness: 0.5 }));
    t.rotation.x = -Math.PI / 2; t.rotation.z = -Math.PI / 2; t.position.set(-0.2, top + 0.09, 0); g.add(t);
  }
  // wheels in dark wells, with hubcaps (and 2CV-style fenders)
  const rimM = M.chromeHub || rand() < 0.35 ? K.chrome : rand() < 0.3 ? K.cream : K.steel;
  for (const wx of [L - 0.72, -Lb + 0.72]) for (const sd of [1, -1]) {
    const well = new THREE.Mesh(new THREE.CircleGeometry(M.wr + 0.07, 20, 0, Math.PI), K.rubber); well.position.set(wx, M.wr, sd * (M.W / 2 + 0.002)); if (sd < 0) well.rotation.y = Math.PI; g.add(well);
    const w = wheel(THREE, M.wr, sd, rimM, rimM === K.steel); w.position.set(wx, M.wr, sd * (M.W / 2 - 0.01)); g.add(w); // tyre face just proud of the body, in front of the dark well
    if (M.fenders) { const f = new THREE.Mesh(new THREE.CylinderGeometry(M.wr + 0.08, M.wr + 0.08, 0.3, 14, 1, false, -Math.PI / 2, Math.PI), pm); f.rotation.x = Math.PI / 2; f.position.set(wx, M.wr, sd * (M.W / 2 - 0.1)); g.add(f); }
  }
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(L + Lb + 0.6, M.W + 0.5), K.blob); blob.rotation.x = -Math.PI / 2; blob.position.set((L - Lb) / 2, 0.025, 0); g.add(blob);
  g.userData.half = Math.max(L, Lb) + 0.08; g.userData.width = M.W; g.userData.model = M.n; g.userData.paint = pm;
  return g;
}
