// Weapon models: original low-poly designs in the spice-trader palette (blued steel, brass, walnut, saffron, paprika,
// cardamom, cumin). One prototype per weapon (and mod variant) is built once and cloned, so meshes share geometry.
//
// Gun frame: the origin is the centre of the shooting fist, +Z is the barrel, +Y up, +X the gun's left side.
// Every gun group carries userData:
//   kind   'pistol' | 'smg' | 'rifle' | 'melee' | 'toss'
//   muzzle Object3D at the muzzle (flashes, tracers)
//   fore   Vector3: where the support hand grabs (handguard / pump / front of the receiver), null for one-hand guns
//   eject  Vector3: the ejection port (casings)
//   flash  the muzzle-flash mesh (hidden; fireFlash() shows it for a frame or two)
// Melee weapons keep the old convention (hand spot origin, blade or barrel of the bat hanging down -Y) and ride the
// arm proxy; guns are held through characters.js setHold(), which puts both hands on them.
import * as THREE from '../vendor/three.module.min.js';

// realistic materials: PBR metals and woods (the game has a scene environment, so metal picks up reflections),
// a little procedural grain, stippled polymer, and the spice colours kept as accents (anodised grips, cerakote, wraps)
const canvasT = (w, h, draw, srgb = true) => { if (typeof document === 'undefined') return null; const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
const grain = (base, dark, light) => canvasT(128, 128, (x, w, h) => { // wood: long wavy grain with a few pores
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) { const y0 = Math.random() * h, a = 1 + Math.random() * 3, f = 0.02 + Math.random() * 0.05, ph = Math.random() * 6; x.strokeStyle = Math.random() < 0.7 ? dark : light; x.globalAlpha = 0.18 + Math.random() * 0.3; x.lineWidth = 0.6 + Math.random() * 1.6; x.beginPath(); for (let X = 0; X <= w; X += 4) x.lineTo(X, y0 + Math.sin(X * f + ph) * a); x.stroke(); }
  x.globalAlpha = 0.35; x.fillStyle = dark; for (let i = 0; i < 90; i++) x.fillRect(Math.random() * w, Math.random() * h, 2, 1); x.globalAlpha = 1; });
const noise = (k = 1) => canvasT(64, 64, (x, w, h) => { const d = x.createImageData(w, h); for (let i = 0; i < d.data.length; i += 4) { const v = 128 + (Math.random() - 0.5) * 255 * k; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; } x.putImageData(d, 0, 0); }, false);
const STIPPLE = noise(1), BRUSH = canvasT(64, 64, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); for (let i = 0; i < 160; i++) { x.fillStyle = Math.random() < 0.5 ? '#6a6a6a' : '#999'; x.fillRect(0, Math.random() * h, w, 1); } }, false);
const std = (color, roughness, metalness, o = {}) => new THREE.MeshStandardMaterial({ color, roughness, metalness, ...o });
const metal = (color, roughness, o = {}) => std(color, roughness, 1, { roughnessMap: BRUSH, envMapIntensity: 1.6, ...o });
export const GM = {
  blued: metal(0x34373e, 0.36),                                   // blued / nitrided steel
  park: metal(0x3c3d3e, 0.68, { metalness: 0.55 }),               // matte phosphate
  poly: std(0x1f1f20, 0.7, 0, { bumpMap: STIPPLE, bumpScale: 0.2 }), // polymer frames and furniture, stippled
  steel: metal(0xb9bec5, 0.24),                                   // stainless
  brass: metal(0xc39a48, 0.3),
  gold: metal(0xe0b44c, 0.2),
  walnut: std(0xffffff, 0.5, 0, { map: grain('#5a3018', '#2e170a', '#7a4524') }),
  teak: std(0xffffff, 0.55, 0, { map: grain('#8a5428', '#4a2a10', '#a8703a') }),
  ash: std(0xffffff, 0.6, 0, { map: grain('#cfa977', '#9a7448', '#e2c49a') }),
  saffron: metal(0xc9782a, 0.38, { metalness: 0.7 }),             // anodised aluminium grips, saffron orange
  paprika: std(0x6a1c14, 0.92, 0, { bumpMap: STIPPLE, bumpScale: 0.8 }), // worn cloth tape
  cardamom: std(0x4a5232, 0.74, 0, { bumpMap: STIPPLE, bumpScale: 0.5 }), // OD-green polymer
  cumin: std(0xffffff, 0.55, 0, { map: grain('#4a3020', '#24160c', '#5e3e28') }), // dark wood grips
  rubber: std(0x121212, 0.95, 0, { bumpMap: STIPPLE, bumpScale: 1 }),
  blade: metal(0xd2d6db, 0.16),
  lens: std(0x0c1830, 0.04, 0.3, { envMapIntensity: 2.5 }),
  bore: new THREE.MeshBasicMaterial({ color: 0x050505 }),
};

const geoCache = new Map();
const gkey = (k, f) => { if (!geoCache.has(k)) geoCache.set(k, f()); return geoCache.get(k); };
const boxG = (w, h, d) => gkey(`b${w},${h},${d}`, () => { // machined look: every box gets chamfered edges
  const g = new THREE.BoxGeometry(w, h, d, 3, 3, 3), p = g.attributes.position, hx = w / 2, hy = h / 2, hz = d / 2, r = Math.min(0.004, Math.min(w, h, d) * 0.22), v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.set(THREE.MathUtils.clamp(v.x, -hx + r, hx - r), THREE.MathUtils.clamp(v.y, -hy + r, hy - r), THREE.MathUtils.clamp(v.z, -hz + r, hz - r)); const n = v.sub(c); if (n.lengthSq() > 1e-12) { n.normalize().multiplyScalar(r); p.setXYZ(i, c.x + n.x, c.y + n.y, c.z + n.z); } }
  g.computeVertexNormals(); return g; });
const cylG = (rt, rb, l, s) => gkey(`c${rt},${rb},${l},${s}`, () => new THREE.CylinderGeometry(rt, rb, l, Math.max(s, 12)));

// a tiny builder: B = box, C = cylinder along an axis, all in the gun frame
function kit(g) {
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; g.add(m); return m; };
  return {
    B: (w, h, d, mat, x, y, z, rx, ry, rz) => add(boxG(w, h, d), mat, x, y, z, rx, ry, rz),
    // cylinder along Z (default), 'y' or 'x'
    C: (r, l, mat, x, y, z, ax = 'z', s = 10, r2) => add(cylG(r, r2 ?? r, l, s), mat, x, y, z, ax === 'z' ? Math.PI / 2 : 0, 0, ax === 'x' ? Math.PI / 2 : 0),
    add, g,
  };
}

// muzzle flash: two crossed petals and a front star, additive, scaled per calibre
const flashTex = (() => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,235,1)'); g.addColorStop(0.25, 'rgba(255,214,120,.95)'); g.addColorStop(0.6, 'rgba(255,120,30,.45)'); g.addColorStop(1, 'rgba(255,60,0,0)');
  x.fillStyle = g; x.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 13 : 32; x.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const petalTex = (() => {
  if (typeof document === 'undefined') return null;
  const c = document.createElement('canvas'); c.width = 32; c.height = 64; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 64, 0, 0); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(0.35, 'rgba(255,190,80,.9)'); g.addColorStop(1, 'rgba(255,80,0,0)');
  x.fillStyle = g; x.beginPath(); x.moveTo(16, 0); x.quadraticCurveTo(30, 40, 16, 64); x.quadraticCurveTo(2, 40, 16, 0); x.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
const flashMat = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
const FLASH = { star: flashMat(flashTex), petal: flashMat(petalTex) };
function makeFlash(size, long) {
  const f = new THREE.Group(); f.visible = false; f.userData.size = size;
  const star = new THREE.Mesh(gkey('fq', () => new THREE.PlaneGeometry(1, 1)), FLASH.star); star.scale.setScalar(size * 0.7); f.add(star);
  const pg = gkey('fp', () => { const p = new THREE.PlaneGeometry(1, 1); p.translate(0, 0.5, 0); p.rotateX(Math.PI / 2); return p; }); // petal grows along +Z
  for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(pg, FLASH.petal); p.scale.set(size * 0.5, 1, size * (long ? 1.9 : 1.3)); p.rotation.z = i * Math.PI / 2; f.add(p); }
  return f;
}
// show a gun's flash for this frame; returns its world position in `out`
export function fireFlash(gun, out) {
  const u = gun && gun.userData; if (!u || !u.flash) return null;
  const f = u.flash; f.visible = true; f.rotation.z = Math.random() * Math.PI; const k = 0.8 + Math.random() * 0.45; f.scale.set(k, k, 0.8 + Math.random() * 0.6); f.userData.t = 0.05;
  if (out) u.muzzle.getWorldPosition(out);
  return out;
}
// call once per frame with dt for every gun that might be flashing
export function tickFlash(gun, dt) { const f = gun && gun.userData && gun.userData.flash; if (f && f.visible && (f.userData.t -= dt) <= 0) f.visible = false; }

/* ---------------------------------------------------------------- the models ---------------------------------------------------------------- */
// shared parts
function pistolGrip(k, mat, panel, h = 0.11, rake = 0.3, z = -0.012) { // grip below the fist, raked back; panels on both sides
  k.B(0.032, h, 0.046, mat, 0, -0.015 - h / 2 + 0.04, z, rake);
  if (panel) for (const s of [-1, 1]) k.B(0.004, h * 0.78, 0.036, panel, s * 0.018, -0.02 - h / 2 + 0.04, z, rake);
}
function trigger(k, mat, z = 0.032, y = 0.008) { // trigger guard loop and blade
  k.B(0.008, 0.006, 0.058, mat, 0, y - 0.028, z + 0.006); k.B(0.008, 0.03, 0.006, mat, 0, y - 0.013, z + 0.034);
  k.B(0.005, 0.022, 0.006, GM.steel, 0, y - 0.012, z - 0.002, 0.3);
}
function curvedMag(k, mat, z0, n, h, w, d, a0, da, y0 = 0.02) { // a banana magazine: segments chained along an arc, curving forward
  let y = y0, z = z0, a = a0;
  for (let i = 0; i < n; i++) { const cy = y - Math.cos(a) * h / 2, cz = z + Math.sin(a) * h / 2; k.B(w, h * 1.1, d, mat, 0, cy, cz, -a); y -= Math.cos(a) * h; z += Math.sin(a) * h; a += da; }
}
function serrations(k, mat, x0, y, z0, n = 5) { for (let i = 0; i < n; i++) for (const s of [-1, 1]) k.B(0.002, 0.024, 0.004, mat, s * x0, y, z0 + i * 0.009); }

const BUILD = {
  // Makarov .22: compact blued pocket pistol, cumin wood grips with a brass star
  makarov(k, o) {
    k.B(0.03, 0.03, 0.165, GM.blued, 0, 0.052, 0.058);           // slide
    k.B(0.028, 0.02, 0.15, GM.blued, 0, 0.03, 0.052);            // frame
    serrations(k, GM.park, 0.0155, 0.052, -0.012);
    k.B(0.006, 0.008, 0.01, GM.blued, 0, 0.071, 0.13); k.B(0.012, 0.008, 0.008, GM.blued, 0, 0.071, -0.016); // sights
    k.C(0.0065, 0.01, GM.steel, 0, 0.055, 0.142, 'z', 8);        // muzzle crown
    pistolGrip(k, GM.blued, GM.cumin, 0.1);
    for (const s of [-1, 1]) k.C(0.006, 0.003, GM.brass, s * 0.021, -0.02, -0.025, 'x', 5);
    trigger(k, GM.blued);
    k.B(0.012, 0.012, 0.012, GM.blued, 0, 0.06, -0.03, 0.4);      // hammer
    if (o.quiet) { k.C(0.016, 0.12, GM.steel, 0, 0.054, 0.205, 'z', 12); k.C(0.0168, 0.016, GM.saffron, 0, 0.054, 0.2, 'z', 12); return [0, 0.054, 0.27]; }
    return [0, 0.055, 0.15];
  },
  // CZ Shadow 2: long steel slide with front and rear serrations, black frame and dust-cover rail, saffron grips
  cz(k, o) {
    k.B(0.03, 0.032, 0.21, GM.steel, 0, 0.056, 0.07);
    k.B(0.03, 0.022, 0.19, GM.poly, 0, 0.031, 0.065);
    k.B(0.022, 0.01, 0.08, GM.poly, 0, 0.016, 0.12);               // rail
    serrations(k, GM.blued, 0.0155, 0.056, -0.025, 6); serrations(k, GM.blued, 0.0155, 0.056, 0.12, 4);
    k.B(0.004, 0.008, 0.012, GM.saffron, 0, 0.077, 0.165); k.B(0.016, 0.009, 0.01, GM.blued, 0, 0.077, -0.025);
    k.C(0.0075, 0.012, GM.brass, 0, 0.058, 0.176, 'z', 8);
    pistolGrip(k, GM.poly, GM.saffron, 0.12, 0.25);
    k.B(0.024, 0.012, 0.03, GM.brass, 0, -0.07, -0.03, 0.25);       // brass magwell / base pad
    trigger(k, GM.poly);
    if (o.quiet || o.can) { k.C(0.018, 0.15, GM.blued, 0, 0.058, 0.255, 'z', 12); for (const z of [0.2, 0.31]) k.C(0.0188, 0.008, GM.brass, 0, 0.058, z, 'z', 12); return [0, 0.058, 0.335]; }
    return [0, 0.058, 0.185];
  },
  silenced(k, o) { return BUILD.cz(k, { ...o, can: true }); },
  // Colt Python-style .357: stainless, vent-ribbed barrel with full lug, six-flute cylinder, walnut grip, brass cap
  revolver(k) {
    k.B(0.03, 0.05, 0.075, GM.steel, 0, 0.035, 0.0);              // frame
    k.C(0.026, 0.045, GM.steel, 0, 0.04, 0.025, 'z', 6);          // cylinder (six flats)
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6; k.B(0.006, 0.006, 0.038, GM.blued, Math.cos(a) * 0.024, 0.04 + Math.sin(a) * 0.024, 0.025); }
    k.C(0.0105, 0.15, GM.steel, 0, 0.052, 0.12, 'z', 10);         // barrel
    k.B(0.02, 0.022, 0.14, GM.steel, 0, 0.037, 0.12);              // full lug
    k.B(0.008, 0.012, 0.16, GM.steel, 0, 0.068, 0.11);             // vent rib
    for (let i = 0; i < 5; i++) k.B(0.0085, 0.006, 0.01, GM.blued, 0, 0.066, 0.05 + i * 0.028);
    k.B(0.006, 0.012, 0.012, GM.saffron, 0, 0.078, 0.19);
    k.B(0.012, 0.016, 0.014, GM.steel, 0, 0.066, -0.04, -0.5);     // hammer
    pistolGrip(k, GM.walnut, null, 0.105, 0.45, -0.03);
    k.B(0.03, 0.01, 0.04, GM.brass, 0, -0.068, -0.058, 0.45);
    trigger(k, GM.steel, 0.025);
    return [0, 0.052, 0.198];
  },
  // compact black 9mm with cardamom grips (one per hand for Dual 9MMs)
  dual(k) {
    k.B(0.028, 0.03, 0.175, GM.blued, 0, 0.052, 0.06); k.B(0.026, 0.02, 0.16, GM.poly, 0, 0.03, 0.055);
    serrations(k, GM.park, 0.0145, 0.052, -0.015, 4);
    k.B(0.005, 0.007, 0.01, GM.blued, 0, 0.07, 0.135);
    pistolGrip(k, GM.poly, GM.cardamom, 0.105);
    trigger(k, GM.poly);
    return [0, 0.054, 0.15];
  },
  // Golden Deagles: slab-sided gold hand cannon, triangular barrel, ported muzzle, black grips
  golddeagle(k) {
    k.B(0.036, 0.042, 0.23, GM.gold, 0, 0.058, 0.07);
    k.B(0.03, 0.022, 0.2, GM.gold, 0, 0.026, 0.065);
    k.B(0.012, 0.012, 0.2, GM.gold, 0, 0.083, 0.08, 0, 0, Math.PI / 4); // triangular top
    for (const s of [-1, 1]) k.B(0.003, 0.012, 0.03, GM.blued, s * 0.0185, 0.05, 0.16);
    serrations(k, GM.brass, 0.0185, 0.06, -0.035, 5);
    k.C(0.009, 0.01, GM.blued, 0, 0.06, 0.186, 'z', 8);
    pistolGrip(k, GM.gold, GM.rubber, 0.125, 0.22);
    trigger(k, GM.gold);
    return [0, 0.06, 0.19];
  },
  // Uzi-style SMG: boxy parkerized receiver, ribbed cover, magazine through the grip, folded stock, cardamom grip
  smg(k, o) {
    k.B(0.042, 0.05, 0.25, GM.park, 0, 0.055, 0.055);
    for (let i = 0; i < 6; i++) k.B(0.044, 0.004, 0.006, GM.blued, 0, 0.081, -0.04 + i * 0.03);
    k.B(0.03, 0.012, 0.02, GM.blued, 0, 0.087, 0.15); k.B(0.03, 0.014, 0.02, GM.blued, 0, 0.088, -0.05);   // sight ears
    k.C(0.012, 0.05, GM.blued, 0, 0.05, 0.2, 'z', 8); k.C(0.016, 0.02, GM.blued, 0, 0.05, 0.185, 'z', 8);  // barrel + nut
    pistolGrip(k, GM.park, GM.cardamom, 0.1, 0.12, 0.0);
    const ml = o.xmag ? 0.2 : 0.13; k.B(0.026, ml, 0.032, GM.blued, 0, -0.02 - ml / 2 + 0.03, -0.004, 0.12); k.B(0.03, 0.012, 0.036, GM.park, 0, -0.02 - ml + 0.03, -0.004 - ml * 0.12, 0.12);
    k.B(0.036, 0.04, 0.07, GM.park, 0, 0.016, 0.135);              // lower fore body (support hand)
    trigger(k, GM.park, 0.03, 0.02);
    for (const s of [-1, 1]) k.B(0.006, 0.008, 0.15, GM.blued, s * 0.018, 0.03, -0.02);  // folded wire stock
    return [0, 0.05, 0.226];
  },
  dualuzi(k, o) { return BUILD.smg(k, o); },
  // MP5SD: slim receiver, fat integral suppressor, curved mag, cardamom handguard, slim stock
  mp5sd(k) {
    k.B(0.036, 0.05, 0.22, GM.blued, 0, 0.058, 0.03);
    k.B(0.04, 0.04, 0.14, GM.cardamom, 0, 0.05, 0.19);             // handguard
    k.C(0.026, 0.26, GM.blued, 0, 0.062, 0.33, 'z', 12); k.C(0.0275, 0.01, GM.brass, 0, 0.062, 0.45, 'z', 12);
    k.C(0.014, 0.04, GM.blued, 0, 0.09, -0.045, 'z', 8);          // drum rear sight
    k.B(0.02, 0.024, 0.016, GM.blued, 0, 0.096, 0.15);
    curvedMag(k, GM.blued, 0.075, 3, 0.05, 0.022, 0.03, 0.12, 0.12, 0.035);
    pistolGrip(k, GM.poly, null, 0.1, 0.25, 0.0);
    trigger(k, GM.poly, 0.025, 0.02);
    k.B(0.02, 0.03, 0.2, GM.blued, 0, 0.052, -0.17); k.B(0.026, 0.07, 0.03, GM.rubber, 0, 0.035, -0.28);   // stock
    return [0, 0.062, 0.462];
  },
  // pump shotgun: long blued barrel over the mag tube, walnut pump and stock, brass bead
  pump(k) {
    k.B(0.036, 0.05, 0.16, GM.blued, 0, 0.055, 0.02);
    k.C(0.0115, 0.48, GM.blued, 0, 0.07, 0.34, 'z', 10); k.C(0.0105, 0.4, GM.blued, 0, 0.045, 0.3, 'z', 10);
    const slide = new THREE.Group(); slide.name = 'pump'; k.g.add(slide); const ks = kit(slide); // the pump racks back after each shot
    ks.add(gkey('pumpF', () => new THREE.CylinderGeometry(0.022, 0.022, 0.13, 8)), GM.walnut, 0, 0.046, 0.25, Math.PI / 2);
    for (let i = 0; i < 4; i++) ks.C(0.0228, 0.006, GM.cumin, 0, 0.046, 0.2 + i * 0.03, 'z', 8);
    k.C(0.004, 0.006, GM.brass, 0, 0.083, 0.57, 'y', 6);
    k.B(0.03, 0.06, 0.08, GM.walnut, 0, 0.02, -0.06, 0.3);         // wrist
    k.B(0.034, 0.075, 0.22, GM.walnut, 0, 0.025, -0.19, -0.08); k.B(0.036, 0.08, 0.02, GM.rubber, 0, 0.018, -0.3, -0.08);
    trigger(k, GM.blued, 0.0, 0.03);
    return [0, 0.07, 0.58];
  },
  // sawn-off double: two short side-by-side barrels, brass hinge, walnut pistol grip wrapped in paprika tape
  shotgun(k) {
    for (const s of [-1, 1]) k.C(0.0125, 0.27, GM.blued, s * 0.0125, 0.062, 0.2, 'z', 10);
    for (const s of [-1, 1]) { const b = k.add(gkey('bore', () => new THREE.CircleGeometry(1, 12)), GM.bore, s * 0.0125, 0.062, 0.3358); b.scale.setScalar(0.0085); }
    k.B(0.012, 0.008, 0.26, GM.blued, 0, 0.076, 0.2);              // rib
    k.B(0.042, 0.03, 0.1, GM.walnut, 0, 0.04, 0.17);               // forend
    k.B(0.046, 0.05, 0.08, GM.steel, 0, 0.052, 0.03); k.C(0.008, 0.05, GM.brass, 0, 0.04, 0.07, 'x', 8); // action + hinge pin
    k.B(0.012, 0.014, 0.02, GM.steel, 0, 0.08, -0.005, -0.4);
    k.B(0.032, 0.11, 0.05, GM.walnut, 0, -0.02, -0.035, 0.45);
    for (let i = 0; i < 3; i++) k.B(0.035, 0.012, 0.053, GM.paprika, 0, -0.01 - i * 0.025, -0.03 - i * 0.012, 0.45);
    trigger(k, GM.steel, 0.0, 0.025);
    return [0, 0.062, 0.335];
  },
  // auto shotgun: boxy cumin polymer, box magazine, ribbed handguard, saffron follower
  autosg(k) {
    k.B(0.042, 0.06, 0.24, GM.poly, 0, 0.06, 0.03);
    k.C(0.013, 0.44, GM.blued, 0, 0.075, 0.38, 'z', 10);
    k.B(0.046, 0.046, 0.2, GM.cumin, 0, 0.055, 0.25); for (let i = 0; i < 5; i++) k.B(0.048, 0.006, 0.01, GM.poly, 0, 0.062, 0.17 + i * 0.04);
    k.B(0.032, 0.11, 0.06, GM.poly, 0, -0.01, 0.08, 0.15); k.B(0.034, 0.012, 0.062, GM.saffron, 0, -0.067, 0.07, 0.15);
    pistolGrip(k, GM.poly, null, 0.1, 0.25, 0.0); trigger(k, GM.poly, 0.025, 0.025);
    k.B(0.03, 0.06, 0.24, GM.cumin, 0, 0.04, -0.18); k.B(0.034, 0.075, 0.02, GM.rubber, 0, 0.035, -0.3);
    return [0, 0.075, 0.6];
  },
  // Jackhammer: bullpup with a rotary drum, carry-handle rib, brass-ringed muzzle
  jackhammer(k) {
    k.B(0.05, 0.07, 0.42, GM.cumin, 0, 0.055, -0.04);
    k.C(0.045, 0.07, GM.blued, 0, 0.03, -0.1, 'z', 10); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; k.B(0.005, 0.005, 0.072, GM.steel, Math.cos(a) * 0.045, 0.03 + Math.sin(a) * 0.045, -0.1); }
    k.C(0.013, 0.3, GM.blued, 0, 0.075, 0.3, 'z', 10); k.C(0.016, 0.014, GM.brass, 0, 0.075, 0.44, 'z', 10);
    k.B(0.016, 0.03, 0.28, GM.poly, 0, 0.11, 0.0); k.B(0.016, 0.03, 0.02, GM.poly, 0, 0.095, 0.13); k.B(0.016, 0.03, 0.02, GM.poly, 0, 0.095, -0.13);
    k.B(0.044, 0.04, 0.12, GM.poly, 0, 0.03, 0.2);
    pistolGrip(k, GM.poly, GM.saffron, 0.1, 0.2, 0.0); trigger(k, GM.poly, 0.025, 0.025);
    return [0, 0.075, 0.45];
  },
  // AWP: long fluted barrel, cardamom thumbhole stock, big scope with saffron caps, muzzle brake
  awp(k) {
    k.B(0.04, 0.05, 0.3, GM.cardamom, 0, 0.045, 0.1);              // forestock
    k.B(0.03, 0.04, 0.2, GM.blued, 0, 0.068, 0.02);                // action
    k.C(0.0115, 0.5, GM.blued, 0, 0.068, 0.48, 'z', 10); k.C(0.017, 0.05, GM.blued, 0, 0.068, 0.74, 'z', 8);
    for (let i = 0; i < 3; i++) k.B(0.024, 0.005, 0.03, GM.steel, 0, 0.068, 0.72 + i * 0.016);
    k.C(0.02, 0.24, GM.blued, 0, 0.12, 0.04, 'z', 10); k.C(0.027, 0.06, GM.blued, 0, 0.12, 0.16, 'z', 12, 0.022); k.C(0.024, 0.04, GM.blued, 0, 0.12, -0.09, 'z', 12);
    k.C(0.0272, 0.012, GM.saffron, 0, 0.12, 0.195, 'z', 12); k.C(0.0242, 0.012, GM.saffron, 0, 0.12, -0.112, 'z', 12);
    k.add(gkey('lens', () => new THREE.CircleGeometry(0.02, 12)), GM.lens, 0, 0.12, 0.202);
    for (const z of [-0.02, 0.1]) k.B(0.02, 0.03, 0.016, GM.blued, 0, 0.095, z);
    k.C(0.006, 0.02, GM.steel, 0.02, 0.07, -0.02, 'x', 6);         // bolt handle
    k.B(0.036, 0.09, 0.08, GM.cardamom, 0, 0.0, -0.06, 0.25);       // thumbhole grip
    k.B(0.04, 0.11, 0.22, GM.cardamom, 0, 0.04, -0.22); k.B(0.042, 0.12, 0.025, GM.rubber, 0, 0.04, -0.34);
    k.B(0.02, 0.008, 0.06, GM.cardamom, 0, 0.1, -0.2);              // cheek rest
    trigger(k, GM.blued, 0.0, 0.025);
    return [0, 0.068, 0.765];
  },
  // black rifle: lower and upper receiver, carry handle, ribbed round handguard, A-frame front sight, birdcage, tapered stock
  m16(k) {
    k.B(0.03, 0.045, 0.2, GM.park, 0, 0.03, 0.03);                    // lower receiver
    k.B(0.032, 0.05, 0.05, GM.park, 0, 0.0, 0.085);                   // magazine well
    curvedMag(k, GM.park, 0.085, 3, 0.045, 0.024, 0.04, 0.06, 0.07, -0.02);
    k.B(0.032, 0.042, 0.25, GM.park, 0, 0.072, 0.04);                 // upper receiver
    k.B(0.002, 0.014, 0.045, GM.bore, -0.0165, 0.07, 0.07);            // ejection port
    k.C(0.007, 0.02, GM.park, -0.017, 0.082, -0.01, 'x', 8);          // forward assist
    for (const z of [-0.06, 0.12]) k.B(0.014, 0.03, 0.02, GM.park, 0, 0.105, z);
    k.B(0.018, 0.012, 0.21, GM.park, 0, 0.122, 0.03);                 // carry handle
    k.C(0.032, 0.012, GM.blued, 0, 0.065, 0.165, 'z', 14);            // delta ring
    k.C(0.027, 0.19, GM.poly, 0, 0.065, 0.265, 'z', 14);              // handguard
    for (let i = 0; i < 6; i++) k.B(0.056, 0.006, 0.012, GM.poly, 0, 0.065, 0.19 + i * 0.03);
    k.C(0.0075, 0.2, GM.blued, 0, 0.065, 0.45, 'z', 10);              // barrel
    k.B(0.014, 0.05, 0.022, GM.blued, 0, 0.088, 0.38); k.B(0.004, 0.022, 0.004, GM.blued, 0, 0.12, 0.38); // front sight
    k.C(0.0105, 0.05, GM.blued, 0, 0.065, 0.57, 'z', 10);             // flash hider
    pistolGrip(k, GM.poly, null, 0.1, 0.32, 0.0); trigger(k, GM.park, 0.025, 0.025);
    k.C(0.014, 0.12, GM.park, 0, 0.065, -0.11, 'z', 10);              // buffer tube
    k.add(gkey('m16stock', () => new THREE.CylinderGeometry(0.026, 0.038, 0.2, 4).rotateY(Math.PI / 4).scale(0.75, 1, 1.3)), GM.poly, 0, 0.05, -0.23, Math.PI / 2 - 0.06);
    k.B(0.03, 0.09, 0.016, GM.rubber, 0, 0.042, -0.335, -0.06);       // butt plate
    k.C(0.006, 0.02, GM.blued, 0, 0.022, 0.29, 'x', 6);               // sling swivel
    return [0, 0.065, 0.595];
  },
  // golden AK: gold receiver with ribbed dust cover, walnut handguards around the gas tube, curved mag, walnut stock
  goldak(k) {
    k.B(0.034, 0.046, 0.25, GM.gold, 0, 0.052, 0.02);
    k.B(0.032, 0.014, 0.23, GM.gold, 0, 0.081, 0.015); for (let i = 0; i < 4; i++) k.B(0.033, 0.003, 0.006, GM.brass, 0, 0.087, -0.06 + i * 0.012);
    k.B(0.002, 0.012, 0.05, GM.bore, -0.0175, 0.06, 0.06);            // ejection port
    k.B(0.022, 0.03, 0.03, GM.gold, 0, 0.082, 0.16);                  // rear sight block
    k.B(0.04, 0.042, 0.14, GM.walnut, 0, 0.048, 0.225);               // lower handguard
    k.B(0.03, 0.026, 0.12, GM.walnut, 0, 0.08, 0.22);                 // upper handguard
    k.C(0.0085, 0.08, GM.gold, 0, 0.085, 0.32, 'z', 10); k.B(0.024, 0.04, 0.02, GM.gold, 0, 0.072, 0.37); // gas tube + block
    k.C(0.0085, 0.2, GM.blued, 0, 0.058, 0.42, 'z', 10);
    k.B(0.012, 0.04, 0.014, GM.gold, 0, 0.078, 0.49); k.C(0.011, 0.025, GM.gold, 0, 0.058, 0.53, 'z', 10);
    curvedMag(k, GM.gold, 0.085, 4, 0.042, 0.026, 0.042, 0.08, 0.17, 0.03);
    pistolGrip(k, GM.walnut, null, 0.1, 0.32, 0.0); trigger(k, GM.gold, 0.025, 0.025);
    k.add(gkey('akstock', () => new THREE.CylinderGeometry(0.024, 0.042, 0.26, 4).rotateY(Math.PI / 4).scale(0.72, 1, 1.35)), GM.walnut, 0, 0.03, -0.22, Math.PI / 2 - 0.16);
    k.B(0.03, 0.09, 0.012, GM.gold, 0, 0.01, -0.35, -0.16);
    return [0, 0.058, 0.545];
  },
  /* melee (old convention: hand spot origin, hanging down -Y) */
  bat(k) { const b = k.add(gkey('bat', () => new THREE.CylinderGeometry(0.042, 0.017, 0.82, 10)), GM.ash, 0, -0.39, 0); b.castShadow = true;
    k.C(0.0195, 0.2, GM.paprika, 0, -0.02, 0, 'y', 8); k.C(0.026, 0.02, GM.ash, 0, 0.09, 0, 'y', 8); k.C(0.043, 0.04, GM.saffron, 0, -0.56, 0, 'y', 10, 0.04); },
  knife(k) { k.B(0.022, 0.1, 0.03, GM.cumin, 0, -0.04, 0); k.B(0.05, 0.01, 0.034, GM.brass, 0, -0.095, 0); k.C(0.016, 0.014, GM.brass, 0, 0.015, 0, 'y', 8);
    k.B(0.006, 0.17, 0.04, GM.blade, 0, -0.18, 0.004); k.B(0.006, 0.04, 0.02, GM.blade, 0, -0.27, 0.014, -0.5); },
  tknife(k) { k.B(0.012, 0.09, 0.024, GM.steel, 0, -0.03, 0); for (let i = 0; i < 3; i++) k.B(0.014, 0.012, 0.026, GM.paprika, 0, -0.005 - i * 0.025, 0);
    k.B(0.004, 0.15, 0.032, GM.blade, 0, -0.15, 0); k.B(0.004, 0.03, 0.016, GM.blade, 0, -0.235, 0, 0.6); },
  machete(k) { k.B(0.026, 0.12, 0.034, GM.cardamom, 0, -0.04, 0); k.B(0.03, 0.012, 0.05, GM.brass, 0, -0.105, 0.004);
    k.B(0.006, 0.46, 0.07, GM.blade, 0, -0.34, 0.012); k.B(0.006, 0.08, 0.05, GM.blade, 0, -0.6, 0.02, 0.35); k.B(0.007, 0.44, 0.012, GM.blued, 0, -0.34, -0.02); },
  katana(k) { k.B(0.03, 0.24, 0.034, GM.paprika, 0, -0.07, 0); for (let i = 0; i < 6; i++) k.B(0.032, 0.008, 0.036, GM.rubber, 0, 0.03 - i * 0.04, 0, 0, 0, i % 2 ? 0.4 : -0.4);
    k.C(0.045, 0.012, GM.gold, 0, -0.2, 0, 'y', 10); k.B(0.032, 0.03, 0.036, GM.gold, 0, -0.22, 0);
    k.B(0.008, 0.7, 0.03, GM.blade, 0, -0.58, 0.002); k.B(0.008, 0.06, 0.02, GM.blade, 0, -0.95, 0.008, 0.3); },
};
const KIND = { makarov: 'pistol', cz: 'pistol', silenced: 'pistol', revolver: 'pistol', dual: 'pistol', golddeagle: 'pistol', smg: 'smg', dualuzi: 'smg', mp5sd: 'rifle', pump: 'rifle', shotgun: 'rifle', autosg: 'rifle', jackhammer: 'rifle', awp: 'rifle', m16: 'rifle', goldak: 'rifle', tknife: 'toss' };
// where the support hand goes (gun frame); pistols get a cupping hand from the stance instead
const FORE = { smg: [0, -0.01, 0.13], mp5sd: [0, 0.03, 0.16], pump: [0, 0.03, 0.2], shotgun: [0, 0.025, 0.15], autosg: [0, 0.03, 0.19], jackhammer: [0, 0.01, 0.17], awp: [0, 0.02, 0.17], m16: [0, 0.03, 0.18], goldak: [0, 0.03, 0.18] };
const FLASH_SIZE = { makarov: 0.12, cz: 0.15, revolver: 0.22, dual: 0.15, golddeagle: 0.24, smg: 0.16, dualuzi: 0.14, pump: 0.3, shotgun: 0.34, autosg: 0.3, jackhammer: 0.3, awp: 0.3, m16: 0.22, goldak: 0.24 };

const BORE = { shotgun: 0.0001, revolver: 0.0055, golddeagle: 0.0065, pump: 0.0095, autosg: 0.0095, jackhammer: 0.0095, awp: 0.0055, m16: 0.004, goldak: 0.0055, mp5sd: 0.006 };
const protos = new Map(), GUN_SCALE = 1.06;
// opts: { quiet: suppressor fitted (Makarov / CZ mods), xmag: extended Uzi mag }
export function weaponMesh(id, opts = {}) {
  const key = `${id}|${opts.quiet ? 'q' : ''}${opts.xmag ? 'x' : ''}`;
  let p = protos.get(key);
  if (!p) {
    p = new THREE.Group(); const f = BUILD[id];
    const inner = new THREE.Group(); p.add(inner); const k = kit(inner);
    const muz = f ? f(k, opts) : null;
    if (KIND[id] && KIND[id] !== 'toss') inner.scale.setScalar(GUN_SCALE); // a touch oversized so they read from the top-down camera
    p.userData.kind = KIND[id] || (f ? 'melee' : 'none');
    if (Array.isArray(muz)) {
      const m = new THREE.Object3D(); m.position.fromArray(muz); m.name = 'muzzle'; inner.add(m);
      const bore = new THREE.Mesh(gkey('bore', () => new THREE.CircleGeometry(1, 12)), GM.bore); bore.scale.setScalar(BORE[id] || 0.0045); bore.position.z = 0.0008; m.add(bore); // the dark hole you look down
      const quiet = opts.quiet || id === 'silenced' || id === 'mp5sd';
      const fl = makeFlash((FLASH_SIZE[id] || 0.18) * (quiet ? 0.35 : 1), p.userData.kind === 'rifle'); fl.name = 'flash'; m.add(fl);
    }
    protos.set(key, p);
  }
  const g = p.clone();
  const u = g.userData = { kind: p.userData.kind, id };
  u.muzzle = g.getObjectByName('muzzle') || null; u.pump = g.getObjectByName('pump') || null; u.flash = g.getObjectByName('flash') || null;
  u.fore = FORE[id] ? new THREE.Vector3().fromArray(FORE[id]).multiplyScalar(GUN_SCALE) : null;
  u.eject = new THREE.Vector3(-0.02, 0.06, 0.02);
  return g;
}
export const isTwoGun = (id) => id === 'dual' || id === 'dualuzi' || id === 'golddeagle';
export const weaponKind = (id) => KIND[id] || 'melee';
