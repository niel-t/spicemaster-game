// Shared vehicle models: the Oofmobiel and the street cars, used by the hub (main.js), the missions (through main.js'
// car() and the van clone) and the drive (js/rit.js). Physically based paint, glass, rubber and chrome, so
// they pick up the scene's environment map.
//
//   makeOofmobiel(THREE, canvasTex)          → Group, nose towards local +z, wheels on y = 0
//   makeKangoo(THREE, canvasTex, opts)       → Group, nose towards local +x (like the street cars); opts { paint, plate, livery }
//   makeCar(THREE, canvasTex, opts)          → Group, nose towards local +x (main.js convention), wheels on y = 0
//     opts: { model: index or -1, paint: 0xrrggbb, rand: () => 0..1, lampas: bool }
//     userData: { half (half length), width, model (name), paint (the paint material) }

// ---------------------------------------------------------------- shared helpers and materials (built once per THREE)
import { liveryTex, cargoTex, BIZ } from './livery.js';
import { mergeStatic } from './richtex.js'; // street cars collapse to one mesh per material (phones drew ~75 meshes per car) // printed van liveries (Eddy & Zn, Eddy's, Shooki Koerier, street businesses)
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

// ---------------------------------------------------------------- panel vans (the Oofmobiel and Shooki's Kangoo)
// Both vans share one recipe: a side profile with real wheel-arch cut-outs, extruded across the width with rounded
// edges, then gently deformed (the glasshouse leans in above the beltline, the nose and tail round off in plan view).
// Glass, panel gaps and vinyl are built flat on the side and pushed through the same deformation, so they sit on the
// skin. Liveries are cut around the rear arch and laid out around it (js/livery.js cargoTex), so no text is ever lost.
function vanKit(THREE) {
  if (K.van) return K.van;
  const std = (o) => new THREE.MeshStandardMaterial(o), phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const V = K.van = {
    trim: std({ color: 0x2a2c2e, roughness: 0.78 }),                    // unpainted textured bumper plastic
    trimDark: std({ color: 0x161718, roughness: 0.82 }),
    gap: std({ color: 0x050506, roughness: 1, polygonOffset: true, polygonOffsetFactor: -4 }),
    seal: std({ color: 0x0c0c0d, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -1 }),
    glass: phys({ color: 0x0a1016, metalness: 0.1, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, polygonOffset: true, polygonOffsetFactor: -2 }),
    lensClear: phys({ color: 0xffffff, roughness: 0.02, transparent: true, opacity: 0.28, clearcoat: 1, envMapIntensity: 2.5, depthWrite: false }),
    reflector: std({ color: 0xf4f6fa, metalness: 1, roughness: 0.12 }),
    bulb: std({ color: 0xffffff, emissive: 0xfff2d0, emissiveIntensity: 0.9, roughness: 0.2 }),
    housing: std({ color: 0x101113, roughness: 0.55 }),
    redLens: phys({ color: 0xc8101a, roughness: 0.08, clearcoat: 1, emissive: 0x5a0006, emissiveIntensity: 0.6 }),
    redDeep: phys({ color: 0x7a0610, roughness: 0.1, clearcoat: 1, emissive: 0x2a0003 }),
    amberLens: phys({ color: 0xff9420, roughness: 0.08, clearcoat: 1, emissive: 0x5a2800, emissiveIntensity: 0.5 }),
    whiteLens: phys({ color: 0xe8e8ec, roughness: 0.05, clearcoat: 1 }),
    mirror: std({ color: 0xdfe6ee, metalness: 1, roughness: 0.04 }),
    tyre: std({ color: 0x1c1c1e, roughness: 0.92 }),
    tread: std({ color: 0x141415, roughness: 1 }),
    wheelSteel: std({ color: 0xb4b8bd, metalness: 0.7, roughness: 0.32 }),
    wheelCover: std({ color: 0x8e9398, metalness: 0.35, roughness: 0.4 }),
    disc: std({ color: 0x6c6f73, metalness: 0.8, roughness: 0.5 }),
    under: std({ color: 0x141414, roughness: 1, side: THREE.DoubleSide }),
    mesh: null, badges: {},
  };
  // honeycomb grille mesh
  const mt = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); x.fillStyle = '#050505'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#3a3c40'; x.lineWidth = 3; for (let r = 0; r < 9; r++) for (let q = 0; q < 9; q++) { const cx = q * 16 + (r % 2) * 8, cy = r * 14; x.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + Math.PI / 6; x.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8); } x.closePath(); x.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  V.meshTex = mt;
  V.mesh = (rx, ry) => { const t = mt.clone(); t.repeat.set(rx, ry); t.needsUpdate = true; return std({ map: t, roughness: 0.7, metalness: 0.2 }); };
  return V;
}
// a chrome script badge on a transparent plane ('Oofmobiel' on the back door)
function badgeM(THREE, canvasTex, text) {
  const V = K.van; if (V.badges[text]) return V.badges[text];
  const t = canvasTex(512, 128, (c, w, h) => {
    c.clearRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle';
    let s = 96; c.font = `italic 700 ${s}px "Brush Script MT", "Segoe Script", Georgia, serif`; while (c.measureText(text).width > w - 30 && s > 20) { s -= 4; c.font = `italic 700 ${s}px "Brush Script MT", "Segoe Script", Georgia, serif`; }
    const gr = c.createLinearGradient(0, h * 0.2, 0, h * 0.8); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#9aa2ac'); gr.addColorStop(0.55, '#e8ecf0'); gr.addColorStop(1, '#6a727c');
    c.lineWidth = 6; c.strokeStyle = '#2a2e34'; c.strokeText(text, w / 2, h / 2); c.fillStyle = gr; c.fillText(text, w / 2, h / 2);
  });
  return (V.badges[text] = new THREE.MeshStandardMaterial({ map: t, transparent: true, alphaTest: 0.35, metalness: 0.85, roughness: 0.22, polygonOffset: true, polygonOffsetFactor: -3 }));
}
// rounded polygon with a radius per corner ([x, y, r]; r 0 = sharp)
function roundPoly(THREE, pts, defR = 0) {
  const sh = new THREE.Shape(), n = pts.length, P = (i) => pts[(i + n) % n];
  for (let i = 0; i < n; i++) {
    const [px, py] = P(i - 1), [cx, cy, cr] = P(i), [nx, ny] = P(i + 1), r = cr ?? defR;
    const d1 = Math.hypot(cx - px, cy - py) || 1e-6, d2 = Math.hypot(nx - cx, ny - cy) || 1e-6, rr = Math.min(r, d1 / 2, d2 / 2);
    if (rr <= 1e-4) { if (i === 0) sh.moveTo(cx, cy); else sh.lineTo(cx, cy); continue; }
    const ax = cx + (px - cx) / d1 * rr, ay = cy + (py - cy) / d1 * rr, bx = cx + (nx - cx) / d2 * rr, by = cy + (ny - cy) / d2 * rr;
    if (i === 0) sh.moveTo(ax, ay); else sh.lineTo(ax, ay);
    sh.quadraticCurveTo(cx, cy, bx, by);
  }
  sh.closePath(); return sh;
}
// the closed side outline: `upper` runs from the rear-bottom corner over the roof to the front-bottom corner; the bottom
// edge comes back front → rear with an arc over each wheel ({z, y, R}, front first)
function sideOutline(upper, sill, arches) {
  const pts = upper.slice();
  for (const a of arches) {
    const s = Math.max(-0.99, Math.min(0.99, (sill - a.y) / a.R)), a0 = Math.asin(s), N = 18;
    for (let k = 0; k <= N; k++) { const t = a0 + (Math.PI - 2 * a0) * k / N; pts.push([a.z + Math.cos(t) * a.R, a.y + Math.sin(t) * a.R, k === 0 || k === N ? 0.035 : 0]); }
  }
  return pts;
}
// the van's skin deformation: x shrinks above the beltline (tumblehome) and towards the nose and tail (plan rounding)
function vanDeform(S) {
  const f = (y, z) => {
    const t = Math.min(1, Math.max(0, (y - S.belt) / (S.roofY - S.belt)));
    const n = Math.min(1, Math.max(0, (z - (S.zF - S.noseLen)) / S.noseLen)), r = Math.min(1, Math.max(0, ((S.zR + 0.3) - z) / 0.3));
    return (1 - S.kT * t) * (1 - S.kN * n * n) * (1 - 0.025 * r * r);
  };
  const apply = (geo) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * f(p.getY(i), p.getZ(i))); p.needsUpdate = true; geo.computeBoundingSphere(); return geo; };
  return { f, apply, X: (x, y, z) => x * f(y, z) };
}
// split triangles until no edge spans more than L in the side plane (y, z), so the beltline kink of the deformation
// lands on real vertices and decals follow the body exactly
function tessellate(THREE, geo, L, ax = [1, 2]) {
  const g0 = geo.index ? geo.toNonIndexed() : geo, names = ['position', 'normal', 'uv'].filter((n) => g0.attributes[n]);
  const A = names.map((n) => ({ n, s: g0.attributes[n].itemSize, a: g0.attributes[n].array }));
  let tri = [];
  for (let t = 0; t < g0.attributes.position.count / 3; t++) tri.push(A.map(({ s, a }) => [0, 1, 2].map((k) => Array.from(a.slice((t * 3 + k) * s, (t * 3 + k + 1) * s)))));
  const mid = (u, v, norm) => { const m = u.map((x, i) => (x + v[i]) / 2); if (!norm) return m; const l = Math.hypot(...m) || 1; return m.map((x) => x / l); };
  for (let pass = 0; pass < 6; pass++) {
    let split = false; const out = [];
    for (const t of tri) {
      const P = t[0], e = (i, j) => Math.hypot(P[i][ax[0]] - P[j][ax[0]], P[i][ax[1]] - P[j][ax[1]]);
      if (Math.max(e(0, 1), e(1, 2), e(2, 0)) <= L) { out.push(t); continue; }
      split = true;
      const M = t.map((v, ai) => [mid(v[0], v[1], A[ai].n === 'normal'), mid(v[1], v[2], A[ai].n === 'normal'), mid(v[2], v[0], A[ai].n === 'normal')]);
      for (const [i, j, k] of [[0, 3, 5], [3, 1, 4], [5, 4, 2], [3, 4, 5]]) out.push(t.map((v, ai) => [i, j, k].map((q) => (q < 3 ? v[q] : M[ai][q - 3]))));
    }
    tri = out; if (!split) break;
  }
  const g = new THREE.BufferGeometry();
  A.forEach(({ n, s }, ai) => g.setAttribute(n, new THREE.Float32BufferAttribute(tri.flatMap((t) => t[ai].flat()), s)));
  if (!g.attributes.normal) g.computeVertexNormals();
  return g;
}
// painted lamp interiors for the projected lenses: u runs inboard → outboard, v bottom → top
function lampTex(THREE, canvasTex, kind) {
  const V = K.van, k = 'lt:' + kind; if (V[k]) return V[k];
  const bowl = (c, x, y, r, warm) => {
    let g = c.createRadialGradient(x - r * 0.25, y - r * 0.3, r * 0.05, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.25, warm ? '#fff6dc' : '#eef3fa'); g.addColorStop(0.55, '#a9b2bd'); g.addColorStop(0.85, '#59616b'); g.addColorStop(1, '#2a2e34');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = r * 0.08; c.beginPath(); c.arc(x, y, r * 0.92, 0, Math.PI * 2); c.stroke();
    g = c.createRadialGradient(x, y, 0, x, y, r * 0.42); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#dfe8f2'); g.addColorStop(1, '#3a4048'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 0.42, 0, Math.PI * 2); c.fill();
  };
  const prism = (c, x0, y0, w, h, step, col) => { c.strokeStyle = col; c.lineWidth = 2; for (let x = x0; x < x0 + w; x += step) { c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y0 + h); c.stroke(); } };
  const sheen = (c, w, h) => { const g = c.createLinearGradient(0, 0, w * 0.4, h); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.35, 'rgba(255,255,255,.08)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); };
  let t;
  if (kind === 'head' || kind === 'headK') { // chrome housing, two reflector bowls (dipped + main beam), amber indicator outboard
    t = canvasTex(512, 256, (c, w, h) => {
      const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9aa3ad'); g.addColorStop(0.5, '#3c424a'); g.addColorStop(1, '#1a1d21'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const amb = kind === 'head' ? [w * 0.8, w] : [w * 0.78, w];
      const ag = c.createLinearGradient(amb[0], 0, amb[1], 0); ag.addColorStop(0, '#c86a08'); ag.addColorStop(0.5, '#ffb03a'); ag.addColorStop(1, '#d87a10'); c.fillStyle = ag; c.fillRect(amb[0], kind === 'head' ? 0 : h * 0.55, amb[1] - amb[0], kind === 'head' ? h : h * 0.45);
      prism(c, amb[0] + 6, 0, amb[1] - amb[0], h, 12, 'rgba(255,240,200,.35)');
      c.fillStyle = '#15181c'; c.fillRect(amb[0] - 6, 0, 6, h);
      if (kind === 'head') { bowl(c, w * 0.22, h * 0.5, h * 0.4, true); bowl(c, w * 0.56, h * 0.5, h * 0.34, false); }
      else { bowl(c, w * 0.24, h * 0.42, h * 0.36, true); bowl(c, w * 0.55, h * 0.5, h * 0.3, false); }
      c.strokeStyle = '#c8d0d8'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6);
      sheen(c, w, h);
    });
  } else { // tail cluster, top → bottom: brake/tail red, amber indicator, white reverse, rear fog red
    t = canvasTex(128, 512, (c, w, h) => {
      const seg = [[0, 0.4, '#d0101a', '#ff4a50'], [0.4, 0.6, '#e07010', '#ffb040'], [0.6, 0.76, '#d8dce2', '#ffffff'], [0.76, 1, '#8a0610', '#d02028']];
      for (const [a, b, c0, c1] of seg) { const g = c.createRadialGradient(w * 0.5, h * (a + b) / 2, 4, w * 0.5, h * (a + b) / 2, w * 0.9); g.addColorStop(0, c1); g.addColorStop(1, c0); c.fillStyle = g; c.fillRect(0, h * (1 - b), w, h * (b - a)); }
      c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 2; for (let y = 0; y < h; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      c.fillStyle = '#1a0a0c'; for (const b of [0.4, 0.6, 0.76]) c.fillRect(0, h * (1 - b) - 3, w, 6);
      c.strokeStyle = '#2a2a2e'; c.lineWidth = 8; c.strokeRect(0, 0, w, h);
      sheen(c, w, h);
    });
  }
  t.anisotropy = 8;
  return (V[k] = new THREE.MeshPhysicalMaterial({ map: t, emissiveMap: t, emissive: 0xffffff, emissiveIntensity: kind === 'tail' ? 0.35 : 0.22, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03, polygonOffset: true, polygonOffsetFactor: -3 }));
}
// helpers bound to one van group
function vanTools(THREE, g, S) {
  const D = vanDeform(S);
  const add = (m, shadow) => { m.castShadow = !!shadow; m.receiveShadow = !!shadow; g.add(m); return m; };
  const skin = (m) => { m.updateMatrix(); const g1 = m.geometry.clone(); g1.applyMatrix4(m.matrix); const geo = tessellate(THREE, g1, 0.1); D.apply(geo); m.geometry = geo; m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.scale.set(1, 1, 1); return m; };
  // a flat polygon on one side of the body (pts in z, y), facing out; off = distance off the side
  const sidePoly = (pts, sx, off, mat, r = 0.04) => {
    const sh = roundPoly(THREE, pts.map(([z, y, rr]) => [sx > 0 ? -z : z, y, rr ?? r]));
    const geo = new THREE.ShapeGeometry(sh, 6); geo.rotateY(sx > 0 ? Math.PI / 2 : -Math.PI / 2); geo.translate(sx * (S.W / 2 + off), 0, 0);
    return skin(add(new THREE.Mesh(geo, mat)));
  };
  // a thin dark line along a path of [z, y] points on one side (panel gaps, door seams)
  const gapPath = (path, sx, w = 0.011, off = 0.006, mat = K.van.gap) => {
    const pos = [], x = sx * (S.W / 2 + off);
    for (let i = 0; i < path.length - 1; i++) {
      const [z0, y0] = path[i], [z1, y1] = path[i + 1], l = Math.hypot(z1 - z0, y1 - y0), nz = -(y1 - y0) / l * w / 2, ny = (z1 - z0) / l * w / 2;
      const A = [x, y0 + ny, z0 + nz], B = [x, y0 - ny, z0 - nz], C = [x, y1 - ny, z1 - nz], E = [x, y1 + ny, z1 + nz];
      if (sx > 0) pos.push(...A, ...C, ...B, ...A, ...E, ...C); else pos.push(...A, ...B, ...C, ...A, ...C, ...E);
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    return skin(add(new THREE.Mesh(geo, mat)));
  };
  // a polygon in the plane of a sloping panel (windscreen, rear glass): from point a=[z,y] towards b, u across the van
  const slopePoly = (a, b, pts2, off, mat, r = 0.06) => { // pts2: [u (x), v (0..1 along a→b in metres)]
    const dz = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dz, dy), tz = dz / L, ty = dy / L, nz = ty, ny = -tz; // outward normal (front side)
    const sh = roundPoly(THREE, pts2.map(([u, v, rr]) => [u, v, rr ?? r])), geo = new THREE.ShapeGeometry(sh, 6), p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getY(i); p.setXYZ(i, u, a[1] + ty * v + ny * off, a[0] + tz * v + nz * off); }
    geo.computeVertexNormals(); const m = add(new THREE.Mesh(geo, mat)); return skin(m);
  };
  // a decal projected onto the body along z (dir +1 = onto the nose, -1 = onto the tail): pts are [x, y, r] seen
  // from that end; uvs run inboard → outboard (u) and bottom → top (v) so one painted texture serves both sides
  const ray = new THREE.Raycaster();
  const proj = (pts, dir, mat, off = 0.006) => {
    const sh = roundPoly(THREE, pts.map(([x, y, r]) => [x, y, r ?? 0.03])), g0 = new THREE.ShapeGeometry(sh, 6);
    const geo = tessellate(THREE, g0, 0.06, [0, 1]), p = geo.attributes.position, uv = [], hits = new Map();
    const xs = pts.map((q) => Math.abs(q[0])), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const key = 'proxy' + dir;
    if (!T[key]) { // only the body's triangles near this end, so the rays stay cheap
      const bp = T.body.geometry.attributes.position.array, out = [], lim = dir > 0 ? S.zF - 0.9 : S.zR + 0.9;
      for (let i = 0; i < bp.length; i += 9) { const cz = (bp[i + 2] + bp[i + 5] + bp[i + 8]) / 3; if (dir > 0 ? cz > lim : cz < lim) for (let k = 0; k < 9; k++) out.push(bp[i + k]); }
      const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.Float32BufferAttribute(out, 3)); pg.computeVertexNormals();
      T[key] = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide })); T[key].updateMatrixWorld(true);
    }
    const o = new THREE.Vector3(), d = new THREE.Vector3(0, 0, -dir);
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), hk = x.toFixed(4) + ',' + y.toFixed(4);
      let h = hits.get(hk);
      if (h === undefined) { o.set(x, y, dir * 6); ray.set(o, d); const r = ray.intersectObject(T[key], false)[0]; h = r ? { z: r.point.z, n: r.face.normal.clone() } : null; if (h && h.n.z * dir < 0) h.n.negate(); hits.set(hk, h); }
      p.setXYZ(i, x + (h ? h.n.x * off : 0), y + (h ? h.n.y * off : 0), h ? h.z + h.n.z * off : (dir > 0 ? S.zF : S.zR));
      uv.push((Math.abs(x) - x0) / (x1 - x0 || 1), (y - y0) / (y1 - y0 || 1));
    }
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (dir < 0) { const ix = geo.attributes.position.array; for (let i = 0; i < ix.length; i += 9) for (let k = 0; k < 3; k++) { const a = ix[i + 3 + k]; ix[i + 3 + k] = ix[i + 6 + k]; ix[i + 6 + k] = a; } const u = geo.attributes.uv.array; for (let i = 0; i < u.length; i += 6) for (let k = 0; k < 2; k++) { const a = u[i + 2 + k]; u[i + 2 + k] = u[i + 4 + k]; u[i + 4 + k] = a; } }
    geo.computeVertexNormals();
    return add(new THREE.Mesh(geo, mat));
  };
  const T = { D, add, skin, sidePoly, gapPath, slopePoly, proj, body: null };
  return T;
}
// a van wheel facing +x (turned for the other side): tyre with rounded shoulders and a tread band, steel or covered rim, brake disc
function vanWheel(THREE, r, cover) {
  const V = K.van, key = 'vw' + r.toFixed(3) + (cover ? 'c' : 's');
  if (!V[key]) {
    const tw = r * 0.62, rimR = r * 0.66, h = tw / 2, sh = r * 0.09;
    const tp = [[rimR, -h * 0.92], [rimR + 0.02, -h * 1.02], [r * 0.86, -h * 1.06], [r - sh * 0.4, -h * 0.98], [r, -h + sh], [r, h - sh], [r - sh * 0.4, h * 0.98], [r * 0.86, h * 1.06], [rimR + 0.02, h * 1.02], [rimR, h * 0.92]].map(([a, b]) => new THREE.Vector2(a, b));
    const tyre = new THREE.LatheGeometry(tp, 32); tyre.rotateZ(-Math.PI / 2);
    const tread = new THREE.CylinderGeometry(r + 0.004, r + 0.004, tw * 0.72, 32, 1, true); tread.rotateZ(Math.PI / 2);
    const dp = cover
      ? [[0, h * 0.62], [rimR * 0.25, h * 0.6], [rimR * 0.5, h * 0.5], [rimR * 0.8, h * 0.55], [rimR * 0.97, h * 0.72], [rimR * 1.02, h * 0.62], [rimR, h * 0.3]]
      : [[0, h * 0.42], [rimR * 0.2, h * 0.42], [rimR * 0.32, h * 0.3], [rimR * 0.62, h * 0.24], [rimR * 0.82, h * 0.36], [rimR * 0.98, h * 0.62], [rimR * 1.02, h * 0.55], [rimR, h * 0.2]];
    const disc = new THREE.LatheGeometry(dp.map(([a, b]) => new THREE.Vector2(a, b)), 28); disc.rotateZ(-Math.PI / 2);
    const barrel = new THREE.CylinderGeometry(rimR, rimR, tw * 0.9, 28, 1, true); barrel.rotateZ(Math.PI / 2);
    const brake = new THREE.CylinderGeometry(rimR * 0.78, rimR * 0.78, 0.025, 24); brake.rotateZ(Math.PI / 2);
    const hole = new THREE.CircleGeometry(rimR * 0.1, 10); hole.rotateY(Math.PI / 2);
    const nut = new THREE.CylinderGeometry(rimR * 0.045, rimR * 0.045, 0.025, 6); nut.rotateZ(Math.PI / 2);
    const cap = new THREE.SphereGeometry(rimR * 0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2); cap.rotateZ(-Math.PI / 2); cap.scale(0.35, 1, 1);
    V[key] = { tyre, tread, disc, barrel, brake, hole, nut, cap, h, rimR };
  }
  const G = V[key], w = new THREE.Group();
  const m = (geo, mat, sh) => { const o = new THREE.Mesh(geo, mat); o.castShadow = !!sh; w.add(o); return o; };
  m(G.tyre, V.tyre, true); m(G.tread, V.tread); m(G.barrel, V.housing); m(G.disc, cover ? V.wheelCover : V.wheelSteel, true);
  m(G.brake, V.disc).position.x = -G.h * 0.2;
  const face = cover ? G.h * 0.56 : G.h * 0.3;
  for (let k = 0; k < (cover ? 10 : 8); k++) { const a = k / (cover ? 10 : 8) * Math.PI * 2, hl = m(G.hole, V.housing); hl.position.set(face + 0.003, Math.cos(a) * G.rimR * 0.62, Math.sin(a) * G.rimR * 0.62); if (cover) hl.scale.set(1, 0.7, 1.6); }
  if (!cover) for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, n = m(G.nut, V.wheelSteel); n.position.set(G.h * 0.44, Math.cos(a) * G.rimR * 0.27, Math.sin(a) * G.rimR * 0.27); }
  m(G.cap, cover ? V.housing : V.wheelSteel).position.x = cover ? G.h * 0.62 : G.h * 0.42;
  return w;
}
// a lamp unit: a dark housing, a chrome reflector bowl, a bulb and a clear (or coloured) lens, facing local +z
function lampUnit(THREE, w, h, d, r, lensM, opts = {}) {
  const V = K.van, u = new THREE.Group();
  const shape = (ww, hh, rr) => roundPoly(THREE, [[-ww / 2, -hh / 2, rr * (opts.rBL ?? 1)], [ww / 2, -hh / 2, rr * (opts.rBR ?? 1)], [ww / 2 - (opts.slant || 0), hh / 2, rr], [-ww / 2 + (opts.slantL || 0), hh / 2, rr]]);
  const ex = (ww, hh, dd, mat, z, rr = r) => { const geo = new THREE.ExtrudeGeometry(shape(ww, hh, rr), { depth: dd, bevelEnabled: false, curveSegments: 6 }); const o = new THREE.Mesh(geo, mat); o.position.z = z; u.add(o); return o; };
  ex(w, h, d, V.housing, -d);
  if (lensM === V.lensClear) {
    for (const [cx, rr] of opts.bowls || [[0, Math.min(w, h) * 0.38]]) {
      const bowl = new THREE.Mesh(new THREE.SphereGeometry(rr, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), V.reflector); bowl.rotation.x = -Math.PI / 2; bowl.scale.z = 0.5; bowl.position.set(cx, 0, -0.005); u.add(bowl);
      const b = new THREE.Mesh(new THREE.SphereGeometry(rr * 0.28, 10, 8), V.bulb); b.position.set(cx, 0, -rr * 0.15); u.add(b);
    }
    ex(w * 0.98, h * 0.96, 0.012, V.lensClear, 0.0, r * 0.9);
  } else ex(w * 0.98, h * 0.96, 0.02, lensM, -0.004, r * 0.9);
  return u;
}
// a door mirror on an arm: housing, glass facing backwards, an indicator repeater
function vanMirror(THREE, sx, paint) {
  const V = K.van, m = new THREE.Group();
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.07), V.trimDark); arm.position.set(sx * 0.08, -0.06, 0.02); m.add(arm);
  const hs = roundPoly(THREE, [[-0.07, -0.15, 0.04], [0.07, -0.15, 0.04], [0.08, 0.15, 0.05], [-0.06, 0.15, 0.05]]);
  const hg = new THREE.ExtrudeGeometry(hs, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 3, curveSegments: 5 });
  const house = new THREE.Mesh(hg, paint || V.trimDark); house.position.set(sx * 0.22, 0.04, -0.03); house.castShadow = true; m.add(house);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.27), V.mirror); gl.rotation.y = Math.PI; gl.position.set(sx * 0.22, 0.04, -0.062); m.add(gl);
  const rep = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.02), V.amberLens); rep.position.set(sx * 0.27, -0.06, 0.1); m.add(rep);
  return m;
}
function vinylM(THREE, map) { return new THREE.MeshPhysicalMaterial({ map, transparent: true, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.1, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }); }
// the printed cargo-side vinyl: a polygon (with an arch notch) whose uvs read left-to-right from either side
function cargoVinyl(THREE, canvasTex, T, S, sx, id) {
  const { z0, z1, y0, y1 } = S.liv, len = z0 - z1, hgt = y1 - y0, cw = 1024, ch = Math.round(cw * hgt / len);
  const pts = [[z0, y1, 0.06], [z1, y1, 0.08], [z1, y0, 0.05]], keep = [];
  for (const a of S.arches) {
    if (a.z - a.R > z0 || a.z + a.R < z1) continue;
    const R = a.R + 0.03, top = a.y + R; if (top <= y0) continue;
    const s = Math.max(-0.99, (y0 - a.y) / R), a0 = Math.asin(s), N = 16;
    for (let k = 0; k <= N; k++) { const t = Math.PI - a0 - (Math.PI - 2 * a0) * k / N; pts.push([a.z + Math.cos(t) * R, a.y + Math.sin(t) * R, 0]); }
    const u0 = sx > 0 ? (z0 - (a.z + R)) / len : ((a.z - R) - z1) / len, u1 = sx > 0 ? (z0 - (a.z - R)) / len : ((a.z + R) - z1) / len;
    keep.push({ x0: u0 * cw - 18, x1: u1 * cw + 18, y0: (1 - (top - y0) / hgt) * ch - 18, y1: ch });
  }
  pts.push([z0, y0, 0.05]);
  for (const [hz, hy] of S.handles || []) { const u = sx > 0 ? (z0 - hz) / len : (hz - z1) / len, v = 1 - (hy - y0) / hgt; keep.push({ x0: u * cw - 0.16 / len * cw, x1: u * cw + 0.16 / len * cw, y0: v * ch - 0.07 / hgt * ch, y1: v * ch + 0.07 / hgt * ch }); }
  const m = vinylM(THREE, cargoTex(canvasTex, id, S.key + (sx > 0 ? 'R' : 'L'), cw, ch, keep));
  const mesh = T.sidePoly(pts, sx, 0.004, m, 0.0), p = mesh.geometry.attributes.position, uv = [];
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i), y = p.getY(i); uv.push(sx > 0 ? (z0 - z) / len : (z - z1) / len, (y - y0) / hgt); }
  mesh.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  mesh.userData.cargo = { key: S.key + (sx > 0 ? 'R' : 'L'), cw, ch, keep };
  return mesh;
}
// the shared body: profile extrusion, arch liners, underbody, wheels, shadow blob
function vanBody(THREE, g, S, T, paint) {
  const V = K.van, bev = S.bev, bs = S.bs;
  const shape = roundPoly(THREE, sideOutline(S.upper, S.sill, S.arches), 0.03);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: S.W - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bs, bevelSegments: 5, curveSegments: 8 });
  geo.rotateY(-Math.PI / 2); geo.translate(S.W / 2 - bev, 0, 0);
  const bg = tessellate(THREE, geo, 0.16); T.D.apply(bg);
  const body = new THREE.Mesh(bg, paint); body.castShadow = body.receiveShadow = true; g.add(body);
  for (const a of S.arches) { // black wheelhouse liners so the arches read as deep holes
    const lg = new THREE.CylinderGeometry(a.R - bs + 0.01, a.R - bs + 0.01, S.W - 0.06, 22, 1, true, -0.25, Math.PI + 0.5); lg.rotateZ(Math.PI / 2);
    const liner = new THREE.Mesh(lg, V.under); liner.position.set(0, a.y, a.z); g.add(liner);
    for (const sx of [-1, 1]) {
      const w = vanWheel(THREE, S.wr, S.cover); w.position.set(sx * (S.W / 2 - S.wr * 0.31 - S.tyreIn), S.wr, a.z); if (sx < 0) w.rotation.y = Math.PI; g.add(w);
    }
  }
  const ub = new THREE.Mesh(new THREE.PlaneGeometry(S.W - 0.1, S.zF - S.zR - 0.4), V.under); ub.rotation.x = Math.PI / 2; ub.position.set(0, S.sill - bs + 0.02, (S.zF + S.zR) / 2); g.add(ub);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(S.W + 0.8, S.zF - S.zR + 1.0), K.blob); blob.rotation.x = -Math.PI / 2; blob.position.set(0, 0.03, (S.zF + S.zR) / 2); g.add(blob);
  return body;
}

// ---------------------------------------------------------------- the Oofmobiel: Dad's blue T5-style panel van
export function makeOofmobiel(THREE, canvasTex) {
  kit(THREE, canvasTex); const V = vanKit(THREE);
  const g = new THREE.Group();
  const blue = new THREE.MeshPhysicalMaterial({ color: 0x2c4fa6, metalness: 0.5, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06 });
  const S = {
    key: 'oof', W: 1.92, wr: 0.345, sill: 0.4, belt: 1.2, roofY: 2.0, zF: 2.46, zR: -2.44, kT: 0.075, kN: 0.07, noseLen: 0.55, bev: 0.11, bs: 0.06, tyreIn: 0.04, cover: false,
    arches: [{ z: 1.56, y: 0.345, R: 0.47 }, { z: -1.44, y: 0.345, R: 0.47 }],
    // rear-bottom → rear → roof → windscreen → bonnet → nose → front-bottom (profile, the bevel adds ~6 cm all round)
    upper: [[-2.39, 0.4, 0.05], [-2.4, 1.1, 0], [-2.39, 1.94, 0.16], [0.86, 1.95, 0.22], [1.0, 1.9, 0.06], [1.66, 1.16, 0.12], [2.22, 1.03, 0.2], [2.4, 0.86, 0.1], [2.42, 0.4, 0.04]],
    liv: { z0: 0.47, z1: -2.3, y0: 0.47, y1: 1.84 }, handles: [[0.36, 1.0]],
  };
  const T = vanTools(THREE, g, S), { D, add, sidePoly, gapPath, slopePoly, proj } = T, X = D.X, bs = S.bs;
  T.body = vanBody(THREE, g, S, T, blue);
  const ws0 = [1.66 + bs * 0.7, 1.16 + bs * 0.7], ws1 = [1.0 + bs * 0.7, 1.9 + bs * 0.7], wsL = Math.hypot(ws1[0] - ws0[0], ws1[1] - ws0[1]);
  // windscreen: black frit border, then the glass; two wipers parked on the scuttle
  slopePoly(ws0, ws1, [[-0.86, 0.02, 0.08], [0.86, 0.02, 0.08], [0.82, wsL - 0.03, 0.1], [-0.82, wsL - 0.03, 0.1]], 0.004, V.seal);
  slopePoly(ws0, ws1, [[-0.8, 0.07, 0.07], [0.8, 0.07, 0.07], [0.76, wsL - 0.07, 0.09], [-0.76, wsL - 0.07, 0.09]], 0.008, V.glass);
  for (const [x, a] of [[-0.42, 0.1], [0.36, 0.14]]) { const wp = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.022, 0.025), V.trimDark); wp.position.set(x, ws0[1] + 0.06, ws0[0] - 0.04); wp.rotation.set(-0.8, 0, a); add(wp); }
  const cowl = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 0.12), V.trimDark); cowl.position.set(0, ws0[1] + 0.005, ws0[0] + 0.02); cowl.rotation.x = -0.25; add(cowl);
  for (const sx of [-1, 1]) {
    // cab door glass in a rubber seal, quarter-light split
    const glass = [[0.6, 1.24], [1.42, 1.24], [0.98, 1.84], [0.6, 1.84]];
    sidePoly(glass.map(([z, y]) => [z + (z > 1 ? 0.03 : -0.03), y + (y > 1.5 ? 0.03 : -0.03)]), sx, 0.002, V.seal, 0.06);
    sidePoly(glass, sx, 0.006, V.glass, 0.05);
    gapPath([[1.2, 1.24], [1.2, 1.55]], sx, 0.02, 0.009, V.seal);
    // panel gaps: front door, sliding door (with its rail along the rear quarter), fuel flap, side marker
    gapPath([[1.1, 0.42], [1.12, 0.95], [1.62, 1.14], [1.0, 1.95 - 0.02]], sx);
    gapPath([[1.0, 1.93], [0.54, 1.93], [0.54, 0.42]], sx);
    gapPath([[0.48, 0.42], [0.48, 1.9], [-0.8, 1.9], [-0.8, 0.42]], sx);
    // handles: cab door and sliding door (front edge, below the lettering)
    for (const [z, y] of [[0.76, 1.14], ...S.handles]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.045, 0.2), V.trimDark); h.position.set(sx * X(S.W / 2 + 0.018, y, z), y, z); add(h); }
    const mk = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.04, 0.09), V.amberLens); mk.position.set(sx * X(S.W / 2 + 0.01, 0.98, 1.98), 0.98, 1.98); add(mk);
    // mirror on the door's front corner
    const mi = vanMirror(THREE, sx, blue); mi.position.set(sx * X(S.W / 2, 1.3, 1.42), 1.3, 1.42); add(mi);
  }
  // nose: bonnet shut line, grille, headlights, bumper with intake, fogs, plate
  const frontZ = 2.4 + bs;
  const grille = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), V.mesh(6, 1.5)); grille.position.set(0, 0.84, frontZ + 0.005); add(grille);
  for (const y of [0.92, 0.78]) { const sl = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.035, 0.03), blue); sl.position.set(0, y, frontZ + 0.01); add(sl); }
  { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.014, 0.02), K.chrome); ch.position.set(0, 0.86, frontZ + 0.022); add(ch); }
  { const em = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.025, 24), K.chrome); em.rotation.x = Math.PI / 2; em.position.set(0, 0.86, frontZ + 0.03); add(em);
    const eo = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.01, 6, 20), blue); eo.position.set(0, 0.86, frontZ + 0.045); add(eo); }
  for (const sx of [-1, 1]) {
    proj([[sx * 0.47, 0.76, 0.03], [sx * 0.89, 0.76, 0.05], [sx * 0.89, 0.98, 0.08], [sx * 0.47, 0.96, 0.03]], 1, lampTex(THREE, canvasTex, 'head'));
  }
  // front bumper: wraps round the corners (top view rounded shape, extruded up)
  const bumper = (zFront, zBack, y0, h, half, mat) => {
    const sh = roundPoly(THREE, [[-half, -zBack, 0.03], [half, -zBack, 0.03], [half, -(zFront - 0.18), 0.12], [half - 0.15, -zFront, 0.16], [-half + 0.15, -zFront, 0.16], [-half, -(zFront - 0.18), 0.12]]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 3, curveSegments: 6 }); geo.rotateX(-Math.PI / 2); geo.translate(0, y0, 0);
    return add(new THREE.Mesh(geo, mat), true);
  };
  bumper(frontZ + 0.1, 1.98, 0.27, 0.36, S.W / 2 * (1 - S.kN) + 0.04, V.trim);
  { const it = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.13), V.mesh(7, 1)); it.position.set(0, 0.38, frontZ + 0.135); add(it); }
  for (const sx of [-1, 1]) { const fg = lampUnit(THREE, 0.13, 0.08, 0.04, 0.035, V.lensClear, { bowls: [[0, 0.03]] }); fg.position.set(sx * 0.7, 0.4, frontZ + 0.12); add(fg); }
  { const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.11), K.plate('OOF-87-K')); pf.position.set(0, 0.56, frontZ + 0.15); add(pf); }
  // rear: barn doors with glass, tall tail-light clusters, third brake light, bumper with a step, plate, Oofmobiel badge
  const rearZ = -2.4 - bs;
  const rear = (w, h, x, y, mat, dz = 0, r = 0.05) => { const s = roundPoly(THREE, [[-w / 2, -h / 2, r], [w / 2, -h / 2, r], [w / 2, h / 2, r], [-w / 2, h / 2, r]]); const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 5), mat); m.rotation.y = Math.PI; m.position.set(x, y, rearZ - dz); return add(m); };
  for (const sx of [-1, 1]) { rear(0.72, 0.52, sx * 0.4, 1.56, V.seal, 0.003, 0.07); rear(0.66, 0.46, sx * 0.4, 1.56, V.glass, 0.006, 0.06); }
  rear(0.012, 1.48, 0, 1.16, V.gap, 0.007, 0);
  for (const y of [0.42, 1.9]) rear(1.62, 0.01, 0, y, V.gap, 0.007, 0);
  { const h = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 0.04), V.trimDark); h.position.set(-0.24, 1.18, rearZ - 0.015); add(h); }
  for (const sx of [-1, 1]) {
    proj([[sx * 0.77, 0.76, 0.03], [sx * 0.93, 0.76, 0.03], [sx * 0.93, 1.5, 0.05], [sx * 0.77, 1.5, 0.04]], -1, lampTex(THREE, canvasTex, 'tail'));
  }
  { const b3 = lampUnit(THREE, 0.32, 0.05, 0.03, 0.015, V.redLens); b3.rotation.y = Math.PI; b3.position.set(0, 1.9, rearZ + 0.01); add(b3); }
  bumper(-rearZ + 0.12, 2.2, 0.27, 0.32, S.W / 2 * 0.975 + 0.03, V.trim).rotation.y = Math.PI;
  { const step = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.012, 0.14), V.mesh(8, 1.2)); step.position.set(0, 0.622, rearZ - 0.06); add(step); }
  { const pb = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.11), K.plate('OOF-87-K')); pb.rotation.y = Math.PI; pb.position.set(0, 0.86, rearZ - 0.008); add(pb);
    const pl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.03), V.whiteLens); pl.position.set(0, 0.935, rearZ - 0.012); add(pl); }
  { const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.11), badgeM(THREE, canvasTex, 'Oofmobiel')); bd.rotation.y = Math.PI; bd.position.set(-0.46, 1.2, rearZ - 0.009); add(bd); }
  { const ex = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 12, 1, true), K.steel); ex.rotation.x = Math.PI / 2; ex.position.set(0.55, 0.24, rearZ + 0.05); add(ex); }
  // roof: transverse stiffening ribs, a small aerial; the lettering lives on vinyl
  for (const z of [-1.95, -1.25, -0.55]) { const rb = new THREE.Mesh(new THREE.BoxGeometry(S.W - 0.36, 0.022, 0.09), blue); rb.position.set(0, 1.95 + bs + 0.006, z); T.skin(add(rb)); }
  { const ae = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.008, 0.38, 6), V.trimDark); ae.position.set(0.3, 2.18, 0.7); ae.rotation.x = -0.35; add(ae); }
  // liveries: both cargo sides and the roof
  const sides = [-1, 1].map((sx) => cargoVinyl(THREE, canvasTex, T, S, sx, 'zn'));
  const roofM = vinylM(THREE, liveryTex(canvasTex, 'zn', 'roof'));
  { const rd = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 1.42), roofM); rd.rotation.x = -Math.PI / 2; rd.rotation.z = -Math.PI / 2; rd.position.set(0, 1.95 + bs + 0.03, -0.85); T.skin(add(rd)); }
  g.userData.paint = blue; g.userData.livery = { sides, roof: roofM, id: 'zn', toJSON: () => null }; // toJSON: clone() copies userData through JSON
  g.userData.half = 2.55; g.userData.width = S.W;
  return g;
}

// ---------------------------------------------------------------- Shooki's Renault Kangoo ("Kangoofie"): small white panel van
export function makeKangoo(THREE, canvasTex, opts = {}) {
  kit(THREE, canvasTex); const V = vanKit(THREE);
  const g = new THREE.Group(); // built nose +z like the Oofmobiel, then turned so its nose is +x like the street cars
  const body = new THREE.Group(); g.add(body);
  const white = new THREE.MeshPhysicalMaterial({ color: opts.paint ?? 0xbfbdb6, metalness: 0, roughness: 0.4, clearcoat: 0.8, clearcoatRoughness: 0.1 });
  const S = {
    key: 'kangoo', W: 1.82, wr: 0.31, sill: 0.37, belt: 1.08, roofY: 1.8, zF: 2.08, zR: -2.06, kT: 0.08, kN: 0.12, noseLen: 0.75, bev: 0.12, bs: 0.06, tyreIn: 0.05, cover: true,
    arches: [{ z: 1.34, y: 0.31, R: 0.43 }, { z: -1.36, y: 0.31, R: 0.43 }],
    upper: [[-2.0, 0.37, 0.05], [-2.02, 1.0, 0], [-1.97, 1.73, 0.18], [0.3, 1.76, 0.3], [0.5, 1.7, 0.08], [1.3, 1.04, 0.14], [1.86, 0.92, 0.26], [2.02, 0.7, 0.14], [2.04, 0.37, 0.04]],
    liv: { z0: 0.1, z1: -1.92, y0: 0.76, y1: 1.64 }, handles: [[0.02, 0.98]],
  };
  const T = vanTools(THREE, body, S), { D, add, sidePoly, gapPath, slopePoly, proj } = T, X = D.X, bs = S.bs;
  T.body = vanBody(THREE, body, S, T, white);
  const ws0 = [1.3 + bs * 0.7, 1.04 + bs * 0.7], ws1 = [0.5 + bs * 0.7, 1.7 + bs * 0.7], wsL = Math.hypot(ws1[0] - ws0[0], ws1[1] - ws0[1]);
  slopePoly(ws0, ws1, [[-0.8, 0.02, 0.1], [0.8, 0.02, 0.1], [0.74, wsL - 0.03, 0.14], [-0.74, wsL - 0.03, 0.14]], 0.004, V.seal);
  slopePoly(ws0, ws1, [[-0.74, 0.07, 0.09], [0.74, 0.07, 0.09], [0.68, wsL - 0.07, 0.12], [-0.68, wsL - 0.07, 0.12]], 0.008, V.glass);
  for (const [x, a] of [[-0.38, 0.1], [0.34, 0.14]]) { const wp = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.02, 0.022), V.trimDark); wp.position.set(x, ws0[1] + 0.05, ws0[0] - 0.05); wp.rotation.set(-0.9, 0, a); add(wp); }
  const cowl = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.12), V.trimDark); cowl.position.set(0, ws0[1] + 0.005, ws0[0] + 0.02); cowl.rotation.x = -0.3; add(cowl);
  for (const sx of [-1, 1]) {
    const glass = [[0.24, 1.1], [1.16, 1.1], [0.56, 1.62], [0.24, 1.62]];
    sidePoly(glass.map(([z, y]) => [z + (z > 0.8 ? 0.03 : -0.03), y + (y > 1.4 ? 0.03 : -0.03)]), sx, 0.002, V.seal, 0.07);
    sidePoly(glass, sx, 0.006, V.glass, 0.06);
    // gaps: front door (with its shut line rising up the A-pillar), sliding door with its rail, fuel flap
    gapPath([[0.9, 0.42], [0.92, 0.84], [1.3, 1.02], [0.52, 1.72]], sx);
    gapPath([[0.52, 1.73], [0.18, 1.73], [0.18, 0.42]], sx);
    gapPath([[0.12, 0.42], [0.12, 1.69], [-0.92, 1.69], [-0.92, 0.42]], sx);
    // the Kangoo's wide black protective strip low down the doors
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.17, 1.76), V.trim); strip.position.set(sx * X(S.W / 2 + 0.012, 0.62, 0), 0.62, -0.03); add(strip, true);
    for (const [z, y] of [[0.36, 0.98], ...S.handles]) { const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.17), V.trimDark); h.position.set(sx * X(S.W / 2 + 0.016, y, z), y, z); add(h); }
    const mi = vanMirror(THREE, sx); mi.scale.setScalar(0.85); mi.position.set(sx * X(S.W / 2, 1.16, 1.12), 1.16, 1.12); add(mi);
    const rep = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.035, 0.08), V.amberLens); rep.position.set(sx * X(S.W / 2 + 0.008, 0.82, 1.5), 0.82, 1.5); add(rep);
  }
  // nose: big swept-back headlights up the bonnet corners, a slim grille with a chrome badge, a deep black bumper
  const frontZ = 2.02 + bs;
  for (const sx of [-1, 1]) {
    proj([[sx * 0.3, 0.68, 0.04], [sx * 0.8, 0.66, 0.06], [sx * 0.88, 0.8, 0.08], [sx * 0.84, 0.95, 0.06], [sx * 0.52, 0.86, 0.1]], 1, lampTex(THREE, canvasTex, 'headK'));
  }
  { proj([[-0.27, 0.7, 0.03], [0.27, 0.7, 0.03], [0.27, 0.78, 0.03], [-0.27, 0.78, 0.03]], 1, V.mesh(4, 1), 0.004);
    const em = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20), K.chrome); em.rotation.set(Math.PI / 2, 0, 0); em.scale.set(1.3, 1, 0.8); em.position.set(0, 0.79, frontZ - 0.035); add(em); }
  const bumper = (zFront, zBack, y0, h, half, mat) => {
    const sh = roundPoly(THREE, [[-half, -zBack, 0.03], [half, -zBack, 0.03], [half, -(zFront - 0.24), 0.16], [half - 0.22, -zFront, 0.2], [-half + 0.22, -zFront, 0.2], [-half, -(zFront - 0.24), 0.16]]);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3, curveSegments: 6 }); geo.rotateX(-Math.PI / 2); geo.translate(0, y0, 0);
    return add(new THREE.Mesh(geo, mat), true);
  };
  bumper(frontZ + 0.08, 1.7, 0.24, 0.4, S.W / 2 + 0.025, V.trim);
  { const it = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 0.16), V.mesh(7, 1.2)); it.position.set(0, 0.4, frontZ + 0.115); add(it); }
  for (const sx of [-1, 1]) { const fg = lampUnit(THREE, 0.1, 0.1, 0.04, 0.05, V.lensClear, { bowls: [[0, 0.035]] }); fg.position.set(sx * 0.66, 0.4, frontZ + 0.09); fg.rotation.y = sx * 0.25; add(fg); }
  { const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), K.plate(opts.plate || 'SH-00-KI')); pf.position.set(0, 0.56, frontZ + 0.125); add(pf); }
  // rear: asymmetric barn doors (60/40) with glass, tail lights on the pillars, black bumper, plate, Kangoofie badge
  const rearZ = -2.02 - bs;
  const rear = (w, h, x, y, mat, dz = 0, r = 0.05) => { const s = roundPoly(THREE, [[-w / 2, -h / 2, r], [w / 2, -h / 2, r], [w / 2, h / 2, r], [-w / 2, h / 2, r]]); const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 5), mat); m.rotation.y = Math.PI; m.position.set(x, y, rearZ - dz); return add(m); };
  const split = -0.14; // seen from behind the wide door is on the left
  rear(0.78, 0.46, 0.27, 1.38, V.seal, 0.003, 0.07); rear(0.72, 0.4, 0.27, 1.38, V.glass, 0.006, 0.06);
  rear(0.5, 0.46, -0.44, 1.38, V.seal, 0.003, 0.07); rear(0.44, 0.4, -0.44, 1.38, V.glass, 0.006, 0.06);
  rear(0.012, 1.3, split, 1.06, V.gap, 0.007, 0);
  for (const y of [0.42, 1.68]) rear(1.42, 0.01, 0, y, V.gap, 0.007, 0);
  { const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.045, 0.04), V.trimDark); h.position.set(split + 0.14, 1.06, rearZ - 0.015); add(h); }
  for (const sx of [-1, 1]) {
    proj([[sx * 0.72, 0.78, 0.03], [sx * 0.88, 0.78, 0.03], [sx * 0.87, 1.32, 0.06], [sx * 0.72, 1.32, 0.04]], -1, lampTex(THREE, canvasTex, 'tail'));
  }
  { const b3 = lampUnit(THREE, 0.26, 0.04, 0.03, 0.015, V.redLens); b3.rotation.y = Math.PI; b3.position.set(0, 1.71, rearZ + 0.012); add(b3); }
  bumper(-rearZ + 0.1, 1.85, 0.24, 0.36, S.W / 2 * 0.975 + 0.03, V.trim).rotation.y = Math.PI;
  { const pb = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), K.plate(opts.plate || 'SH-00-KI')); pb.rotation.y = Math.PI; pb.position.set(0.3, 0.84, rearZ - 0.008); add(pb); }
  { const bd = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.09), badgeM(THREE, canvasTex, 'Kangoofie')); bd.rotation.y = Math.PI; bd.position.set(-0.42, 1.06, rearZ - 0.009); add(bd); }
  // roof: two shallow pressed channels, and Shooki's roof logo for the camera up top
  for (const x of [-0.42, 0.42]) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 2.2), white); ch.position.set(x, 1.76 + bs + 0.004, -0.8); T.skin(add(ch)); }
  const sides = [-1, 1].map((sx) => cargoVinyl(THREE, canvasTex, T, S, sx, opts.livery || 'shooki'));
  const roofM = vinylM(THREE, liveryTex(canvasTex, opts.livery || 'shooki', 'roof'));
  { const rd = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.16), roofM); rd.rotation.x = -Math.PI / 2; rd.rotation.z = -Math.PI / 2; rd.position.set(0, 1.76 + bs + 0.02, -0.8); T.skin(add(rd)); }
  body.rotation.y = Math.PI / 2; // nose +x
  g.userData.paint = white; g.userData.livery = { sides, roof: roofM, id: opts.livery || 'shooki', toJSON: () => null };
  g.userData.half = 2.18; g.userData.width = S.W; g.userData.model = 'Kangoo';
  return g;
}
// swap the livery on every van inside a group ('zn' before the rebrand, 'eddys' after); Shooki's Kangoo keeps its own
export function setLivery(group, id, canvasTex) {
  group.traverse((o) => {
    const L = o.userData && o.userData.livery; if (!L || L.id === id || L.id === 'shooki') return;
    for (const s of L.sides) { const c = s.userData.cargo; s.material.map = cargoTex(canvasTex, id, c.key, c.cw, c.ch, c.keep); s.material.needsUpdate = true; }
    L.roof.map = liveryTex(canvasTex, id, 'roof'); L.roof.needsUpdate = true; L.id = id;
  });
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
// Shooki's Renault Kangoo: a small panel van, short sloping bonnet, tall boxy load space, windows only up front (not in the street-car pool)
export const KANGOO = { n: 'Kangoo', W: 1.8, r: 0.2, wr: 0.3, body: [[-2.0, 0.3], [2.0, 0.3], [2.06, 0.78], [1.45, 0.98], [0.78, 1.74], [-1.94, 1.8], [-2.02, 0.95]], glass: [[1.34, 1.0], [0.8, 1.66], [0.12, 1.68], [0.12, 1.0]], lights: 'rect' };
const PLATE_TEXTS = ['KL-04-FR', 'NW-12-KS', '37-GVT-9', 'ZT-88-PJ', 'SPK-21-B', 'FR-1T-ES', 'KAA-5-LD', '06-BRD-2'];
const ACCENTS = [0xffffff, 0xffd23a, 0xff3fa4, 0x1a1a1a];

export function makeCar(THREE, canvasTex, opts = {}) {
  if (opts.profile === KANGOO) return makeKangoo(THREE, canvasTex, opts); // Shooki's Kangoo has its own detailed van model
  kit(THREE, canvasTex);
  const rand = opts.rand || Math.random;
  const M = opts.profile || CAR_MODELS[opts.model >= 0 ? opts.model : Math.floor(rand() * CAR_MODELS.length)];
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
  const bumpM = M.n === 'Countach' ? pm : M.n === 'Kangoo' ? K.black : rand() < 0.55 ? K.chrome : K.black;
  for (const [x, d] of [[L + 0.04, 1], [-Lb - 0.04, -1]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, M.W - 0.12, 3, 8), bumpM); b.rotation.x = Math.PI / 2; b.position.set(x, 0.42, 0); b.castShadow = true; g.add(b); }
  for (const sd of [1, -1]) {
    if (M.lights === 'round') { const l = cylIn(THREE, 0.11, 0.11, 0.06, K.lens, 14); l.rotation.z = Math.PI / 2; l.position.set(L - 0.01, 0.72, sd * (M.W / 2 - 0.28)); g.add(l); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.018, 6, 16), K.chrome); rim.rotation.y = Math.PI / 2; rim.position.set(L + 0.02, 0.72, sd * (M.W / 2 - 0.28)); g.add(rim); }
    else if (M.lights === 'rect') box(0.06, 0.18, 0.42, K.lens, L + 0.02, 0.7, sd * (M.W / 2 - 0.32));
    else box(0.04, 0.05, 0.4, K.lens, L - 0.1, 0.52, sd * (M.W / 2 - 0.3));
    box(0.05, 0.08, 0.12, K.amber, L + 0.02, 0.56, sd * (M.W / 2 - 0.12));
    box(0.06, 0.16, 0.34, K.tail, -Lb - 0.02, 0.72, sd * (M.W / 2 - 0.3));
  }
  const pt = opts.plate || PLATE_TEXTS[Math.floor(rand() * PLATE_TEXTS.length)];
  { const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), K.plate(pt)); pf.rotation.y = Math.PI / 2; pf.position.set(L + 0.13, 0.42, 0); g.add(pf); }
  { const pb = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.1), K.plate(pt)); pb.rotation.y = -Math.PI / 2; pb.position.set(-Lb - 0.13, 0.42, 0); g.add(pb); }
  if (M.rack && rand() < 0.6) { for (const zz of [-0.55, 0.55]) box(1.6, 0.05, 0.05, K.black, -0.3, top + 0.12, zz); if (rand() < 0.5) box(1.2, 0.35, 0.9, new THREE.MeshStandardMaterial({ color: [0x2a5aa0, 0xd84a2a, 0xf2e8c8][Math.floor(rand() * 3)], roughness: 0.6 }), -0.3, top + 0.32, 0, true); }
  if (M.n === 'Kangoo') { // a black grille band between swept-back headlights, a grey lower intake, a black rubbing strip down the sides
    box(0.06, 0.15, 0.78, K.black, L + 0.0, 0.7, 0); box(0.04, 0.1, 0.16, K.chrome, L + 0.035, 0.7, 0);
    for (const sd of [1, -1]) box(0.3, 0.2, 0.36, K.lens, L - 0.12, 0.74, sd * (M.W / 2 - 0.3));
    box(0.05, 0.14, 0.9, K.black, L + 0.08, 0.5, 0); box(L + Lb - 0.9, 0.1, M.W + 0.05, K.black, (L - Lb) / 2 - 0.1, 0.62, 0);
  }
  const liv = opts.livery || (!opts.lampas && !opts.profile && (M.n === 'VW T3' || M.n === 'Volvo 245') && rand() < 0.45 ? 'biz' + Math.floor(rand() * BIZ.length) : null);
  if (liv) {
    const glassAll = [...M.glass, ...(M.glass2 || [])], panelVan = !M.glass2 && Math.min(...M.glass.map((p) => p[0])) > -0.5;
    const x0 = -Lb + (panelVan ? 0.14 : 0.35), x1 = panelVan ? Math.min(...M.glass.map((p) => p[0])) - 0.08 : L - 0.65;
    const y0 = panelVan ? 0.66 : 0.5, y1 = panelVan ? top - 0.12 : Math.min(...glassAll.map((p) => p[1])) - 0.04;
    const pw = x1 - x0, ph = Math.min(y1 - y0, pw / 3.4), vm = vinylM(THREE, liveryTex(canvasTex, liv));
    for (const s of [1, -1]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), vm); q.position.set((x0 + x1) / 2, (y0 + y1) / 2, s * (M.W / 2 + 0.012)); if (s < 0) q.rotation.y = Math.PI; g.add(q); }
  }
  { // roof detail, the side the street camera sees most: rain gutters, a sunroof on some, an aerial on others
    const roofX = M.body.filter((p) => p[1] > top - 0.06).map((p) => p[0]), rx0 = Math.min(...roofX), rx1 = Math.max(...roofX), rl = rx1 - rx0;
    if (rl > 0.5 && M.n !== 'Countach' && !opts.lampas) {
      for (const s of [1, -1]) box(rl, 0.03, 0.035, K.black, (rx0 + rx1) / 2, top + 0.012, s * (M.W / 2 - 0.1), false);
      const r2 = rand();
      if (r2 < 0.3 && rl > 1.1) { box(Math.min(0.7, rl * 0.45), 0.02, Math.min(0.62, M.W * 0.42), K.glass, rx0 + rl * 0.62, top + 0.012, 0, false); box(Math.min(0.76, rl * 0.48), 0.012, Math.min(0.68, M.W * 0.46), K.black, rx0 + rl * 0.62, top + 0.006, 0, false); }
      else if (r2 < 0.6) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 0.55, 4), K.black); a.position.set(rx0 + 0.15, top + 0.27, M.W / 2 - 0.25); a.rotation.z = 0.35; g.add(a); }
    }
  }
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
  pm.userData.mergeKey = pm.uuid; mergeStatic(g); // the paint stays its own material: wrecks blacken it and the drive repaints it
  return g;
}
