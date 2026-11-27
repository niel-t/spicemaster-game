// Dutch rotondes (Tristan 2026-11-27: "streets whose ends face north dead-end; turn them into roundabouts").
// Where a dwarsstraat runs north into a long street it used to stop at a wall of houses. Now that T-junction is a
// compact Dutch rotonde: an island you may not drive over (grass, a kerb, something on it), a klinker apron round it you
// may, one lane of tarmac going round anticlockwise, a red fietspad ring outside it where cyclists have right of way,
// haaientanden (shark teeth) on every arm, a druppel splitting each arm, zebras just outside, and the blue round sign
// over the inverted triangle. North of it the row of houses opens on a little plein (js/landmarks.js puts a landmark there).
//
// Everything of every rotonde in one street or district shares one mesh per material (tarmac, fietspad, klinkers,
// pavement, the white paint and kerbs in a vertex-coloured kit, the signs on one atlas), so a district with three of
// them costs six draw calls in all, and they are frustum-culled with the rest of the street.
//
// Traffic (js/straatleven.js) keeps to its lanes but bends round the island with bend(): a car's lane is pushed out to
// the ring and back again over a short stretch, anticlockwise like the real thing (eastbound passes south of the island,
// westbound north of it). The island is a solid, so the Oofmobiel and borrowed cars go round it too.

// dims: ri island, ra apron (overrijdbaar), ro outer edge of the tarmac ring, rf outer edge of the fietspad, rw outer edge of the pavement
export const DIMS = {
  wijk: { ri: 2.6, ra: 3.3, ro: 7.0, rf: 8.4, rw: 9.8, hw: 4.0, hwS: 3.0 },
  komijn: { ri: 2.0, ra: 2.7, ro: 6.0, rf: 7.3, rw: 8.6, hw: 4.0, hwS: 2.5 },
};
// arms: angles in the ground plane, measured anticlockwise from east when looking down with north up (z grows southwards)
const ARM = { e: 0, n: Math.PI / 2, w: Math.PI, s: Math.PI * 1.5 };

// how far a lane at z (in a street through the rotonde at r.x, r.z) is pushed out at x. Returns { z, slope } (dz/dx).
// R: radius of the path round the island; L: half the length of the swerve.
export function bend(rings, x, z, R, L) {
  if (!rings) return null;
  for (const r of rings) {
    const d = x - r.x; if (d <= -L || d >= L || Math.abs(z - r.z) > 7) continue;
    const off = z - r.z, side = off < 0 ? -1 : 1, a = Math.abs(off); if (a >= R) return null;
    const t = Math.PI * d / (2 * L), b = Math.cos(t) ** 2, db = -Math.sin(2 * t) * Math.PI / (2 * L);
    return { z: r.z + side * (a + (R - a) * b), slope: side * (R - a) * db };
  }
  return null;
}

// deps: THREE, kit, ST (road, bike, bay, paveN), kerbMat, solid(x0, x1, z0, z1), low
// list: [{ x, z, arms: ['e', 'w', 's'], art: 'tree' | 'xxx' | 'tulips' | 'obelisk' | 'lamp' }]
export function buildRotondes(deps, list, dims, parent) {
  const { THREE } = deps, D = dims, low = deps.low, seg = low ? 28 : 44, WH = 0xf4f2ec;
  const parts = { road: [], bike: [], bay: [], pave: [] }, K = deps.kit(), SG = []; // SG: sign quads
  // a flat ring (or part of one) lying on the ground, its UVs taken from the world position so the texture runs on from the street
  const ring = (r, r0, r1, a0, a1, y, su, sv) => {
    const g = new THREE.RingGeometry(r0, r1, Math.max(6, Math.round(seg * (a1 - a0) / (Math.PI * 2))), 1, a0, a1 - a0).rotateX(-Math.PI / 2).translate(r.x, y, r.z);
    const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / su, p.getZ(i) / sv);
    return g.index ? g.toNonIndexed() : g;
  };
  const armHalf = (a, r) => Math.asin(Math.min(0.95, ((a === 's' || a === 'n') ? D.hwS : D.hw) / r));
  for (const r of list) {
    const arms = r.arms || ['e', 'w', 's'];
    parts.road.push(ring(r, 0, D.ro, 0, Math.PI * 2, 0.037, 200, 7));
    parts.bay.push(ring(r, D.ri, D.ra, 0, Math.PI * 2, 0.06, 30, 2));
    parts.bike.push(ring(r, D.ro + 0.25, D.rf, 0, Math.PI * 2, 0.039, 160, 2));
    // the pavement ring on the north side, between the arms (the plein side); on the arms themselves the zebras
    { const gaps = arms.map((a) => [ARM[a], armHalf(a, D.rw)]); const cuts = [];
      for (const [c, h] of gaps.sort((p, q) => p[0] - q[0])) cuts.push([c - h, c + h]);
      const free = []; for (let i = 0; i < cuts.length; i++) { const s = cuts[i][1], e = i + 1 < cuts.length ? cuts[i + 1][0] : cuts[0][0] + Math.PI * 2; if (e > s) free.push([s, e]); }
      for (const [s, e] of free) { const m = (s + e) / 2, mz = -Math.sin(m); if (mz < -0.2) parts.pave.push(ring(r, D.rf, D.rw, s, e, 0.041, 200, 5)); } // north half only: the south corners keep the street's own pavements
      }
    // the island: a kerb, grass and something on it
    K.cyl(D.ri + 0.12, D.ri + 0.16, 0.22, 0xcfcac0, r.x, 0.11, r.z, low ? 16 : 28);
    K.cyl(D.ri - 0.05, D.ri - 0.05, 0.26, 0x5a8a3e, r.x, 0.13, r.z, low ? 16 : 28);
    K.geo(new THREE.TorusGeometry(D.ra, 0.07, 3, low ? 24 : 40).rotateX(Math.PI / 2), 0xdcd8cc, r.x, 0.07, r.z); // the apron's edge
    art(K, r, D, low, THREE);
    deps.solid(r.x - D.ri * 0.78, r.x + D.ri * 0.78, r.z - D.ri * 0.78, r.z + D.ri * 0.78);
    // white edge lines: inside along the apron, outside along the fietspad (dashed where the arms cross)
    for (let i = 0; i < (low ? 36 : 56); i++) { const a = i / (low ? 36 : 56) * Math.PI * 2, c = Math.cos(a), s = -Math.sin(a);
      K.box(0.12, 0.012, 0.42, WH, r.x + c * (D.ra + 0.18), 0.05, r.z + s * (D.ra + 0.18), a);
      const onArm = arms.some((q) => Math.abs(Math.atan2(Math.sin(a - ARM[q]), Math.cos(a - ARM[q]))) < armHalf(q, D.ro)); if (!onArm || i % 2) K.box(0.1, 0.012, 0.5, WH, r.x + c * (D.ro + 0.12), 0.05, r.z + s * (D.ro + 0.12), a); }
    for (const a of arms) armDress(K, SG, r, a, D, THREE, low);
  }
  const mats = { road: deps.ST.road, bike: deps.ST.bike, bay: deps.ST.bay, pave: deps.ST.paveN }, out = [];
  for (const k of Object.keys(parts)) { if (!parts[k].length) continue; const m = new THREE.Mesh(merge(THREE, parts[k]), mats[k]); m.receiveShadow = true; m.renderOrder = 1; parent.add(m); out.push(m); }
  const km = K.build(); if (km) { km.castShadow = !low; parent.add(km); out.push(km); }
  if (SG.length) { const sm = new THREE.Mesh(merge(THREE, SG), signMat(THREE)); parent.add(sm); out.push(sm); }
  return out;
}

// per arm: the druppel, haaientanden at the ring and before the fietspad, a zebra outside it, and the signs
function armDress(K, SG, r, a, D, THREE, low) {
  const th = ARM[a], ux = Math.cos(th), uz = -Math.sin(th), vx = uz, vz = -ux; // u: out along the arm; v: across it, towards the incoming lane
  // (incoming traffic keeps right; for an arm pointing east the incoming lane is its north half, which is +v here)
  const hw = (a === 's' || a === 'n') ? D.hwS : D.hw, P = (u, v) => [r.x + ux * u + vx * v, r.z + uz * u + vz * v], WH = 0xf4f2ec;
  const tooth = (u, v, out) => { const [x, z] = P(u, v), s = new THREE.Shape(); s.moveTo(-0.24, 0); s.lineTo(0.24, 0); s.lineTo(0, out ? 0.5 : -0.5); s.closePath();
    K.geo(new THREE.ShapeGeometry(s).rotateX(-Math.PI / 2), WH, x, 0.052, z, 0, th - Math.PI / 2, 0); };
  for (let v = 0.45; v < hw - 0.2; v += 0.62) { tooth(D.ro + 0.2, v, true); tooth(D.rf + 0.25, v, true); }
  // the druppel: a raised kerb island between the lanes, from the ring to the fietspad
  { const [x, z] = P((D.ro + D.rf) / 2 + 0.1, 0.1); K.geo(new THREE.CylinderGeometry(1, 1, 0.16, 12), 0xd8d4ca, x, 0.08, z, 0, th, 0, (D.rf - D.ro) * 0.5 + 0.2, 1, 0.42); K.geo(new THREE.CylinderGeometry(1, 1, 0.18, 12), 0x5a8a3e, x, 0.09, z, 0, th, 0, (D.rf - D.ro) * 0.5 - 0.05, 1, 0.28); }
  // zebra across the whole arm, just outside the fietspad
  for (let v = -hw + 0.4; v < hw - 0.2; v += 0.9) { const [x, z] = P(D.rf + 1.6, v); K.box(1.9, 0.012, 0.45, WH, x, 0.05, z, th); }
  // blue rotonde sign over the inverted triangle, on the right of the incoming lane
  { const [x, z] = P(D.rf + 0.4, hw + 0.55); K.cyl(0.045, 0.045, 2.9, 0x8a8e94, x, 1.45, z, 6);
    const face = th + Math.PI / 2; // facing traffic coming in along -u
    quad(SG, THREE, x, 2.55, z, 0.62, 0.62, face, 0); quad(SG, THREE, x, 1.85, z, 0.7, 0.62, face, 1); }
}
const SIGN = { m: null };
function signMat(THREE) { // atlas: left half the blue rotonde sign (D1), right half the red and white triangle (B6)
  if (SIGN.m) return SIGN.m;
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill(); g.fillStyle = '#1d4fa0'; g.beginPath(); g.arc(64, 64, 55, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.fillStyle = '#ffffff';
  for (let i = 0; i < 3; i++) { const a0 = i * 2.094 - 0.25, a1 = a0 + 1.45; g.beginPath(); g.arc(64, 64, 30, -a1, -a0); g.stroke(); const ax = 64 + Math.cos(-a1) * 30, ay = 64 + Math.sin(-a1) * 30, tx = Math.sin(-a1), ty = -Math.cos(-a1);
    g.beginPath(); g.moveTo(ax - tx * 12 + Math.cos(-a1) * 9, ay - ty * 12 + Math.sin(-a1) * 9); g.lineTo(ax - tx * 12 - Math.cos(-a1) * 9, ay - ty * 12 - Math.sin(-a1) * 9); g.lineTo(ax + tx * 4, ay + ty * 4); g.closePath(); g.fill(); }
  g.fillStyle = '#d8202a'; g.beginPath(); g.moveTo(134, 10); g.lineTo(250, 10); g.lineTo(192, 118); g.closePath(); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(152, 22); g.lineTo(232, 22); g.lineTo(192, 96); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return (SIGN.m = new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }));
}
function quad(SG, THREE, x, y, z, w, h, ry, cell) {
  const g = new THREE.PlaneGeometry(w, h).rotateY(ry).translate(x, y, z), uv = g.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 0.5 + cell * 0.5);
  SG.push(g.toNonIndexed());
}
// something on the island: Amsterdam puts a tree, flowers or a bit of art on its rotondes
function art(K, r, D, low, THREE) {
  const x = r.x, z = r.z, k = r.art || 'tree';
  if (k === 'tree') { K.cyl(0.14, 0.2, 2.6, 0x5a4636, x, 1.4, z, 7); for (const [dx, dy, dz, s] of [[0, 3.6, 0, 1.5], [0.7, 3.1, 0.4, 1.0], [-0.6, 3.2, -0.5, 1.1], [0.2, 4.4, -0.3, 0.9]]) K.geo(new THREE.IcosahedronGeometry(s, low ? 0 : 1), 0x4f7f34, x + dx, dy, z + dz); }
  else if (k === 'xxx') { // the three crosses of Amsterdam on a red mast
    K.cyl(0.12, 0.14, 3.4, 0xc8202a, x, 1.8, z, 8); K.box(0.5, 2.4, 0.12, 0xc8202a, x, 2.4, z);
    for (let i = 0; i < 3; i++) for (const s of [-1, 1]) K.box(0.08, 0.62, 0.14, 0xf4f2ec, x, 1.55 + i * 0.75, z + 0.0, 0, 0, s * 0.7); }
  else if (k === 'tulips') { const C = [0xd8202a, 0xf2c31a, 0xff7a3a, 0xf06aa0, 0xf4f2ec]; for (let i = 0; i < (low ? 26 : 60); i++) { const a = i * 2.39996, rr = Math.sqrt(i / (low ? 26 : 60)) * (D.ri - 0.35);
      K.cyl(0.02, 0.02, 0.36, 0x3a7a2a, x + Math.cos(a) * rr, 0.42, z + Math.sin(a) * rr, 3); K.cyl(0.07, 0.04, 0.13, C[i % C.length], x + Math.cos(a) * rr, 0.64, z + Math.sin(a) * rr, 5); } }
  else if (k === 'obelisk') { K.box(1.6, 0.5, 1.6, 0xe8e4da, x, 0.45, z); K.cyl(0.32, 0.62, 6.2, 0xf0ece2, x, 3.8, z, 4, 0, Math.PI / 4); K.cyl(0, 0.32, 0.6, 0xf0ece2, x, 7.2, z, 4, 0, Math.PI / 4); }
  else if (k === 'anchor') { K.cyl(0.08, 0.08, 2.4, 0x2a2c30, x, 1.4, z, 8); K.box(1.6, 0.1, 0.1, 0x2a2c30, x, 2.3, z); K.geo(new THREE.TorusGeometry(0.75, 0.08, 6, 14, Math.PI), 0x2a2c30, x, 0.95, z, Math.PI, 0, 0); }
  else if (k === 'palm') { K.cyl(0.12, 0.2, 4.2, 0x8a6a46, x, 2.3, z, 7); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; K.box(2.2, 0.06, 0.5, 0x4f8f3a, x + Math.cos(a) * 1.0, 4.2, z + Math.sin(a) * 1.0, -a, 0, -0.35); } }
}
function merge(THREE, geos) {
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const out = new THREE.BufferGeometry();
  for (const [k, s] of [['position', 3], ['normal', 3], ['uv', 2]]) { const a = new Float32Array(n * s); let o = 0; for (const g of geos) { a.set(g.attributes[k].array, o); o += g.attributes[k].array.length; } out.setAttribute(k, new THREE.BufferAttribute(a, s)); }
  for (const g of geos) g.dispose(); out.computeBoundingSphere(); return out;
}
