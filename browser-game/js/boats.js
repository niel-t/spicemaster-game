// Amsterdam canal boats, shared by the hub canal and the harbour levels: an open sloep with an outboard, the glass-roofed
// rondvaartboot, a woonark on a concrete pontoon, a woonschip (a converted tjalk with leeboards, a big wooden rudder and a
// lowered mast), and a white motor cruiser / speedboat.
// Every boat is an outer group (position at the waterline y = 0, heading, bow along +x) holding userData.body, which bobs and
// rolls, plus a flat foam wake and a soft contact shadow on the water. rockBoat(g, t, speed) animates one per frame.
// Hulls are lofted from a plan shape and a section, with a painted band texture (antifouling, boot-top, topsides, planks) so a
// hull is one mesh. Materials are cached and the hand rails are thin tubes, so a canal full of boats stays light for phones.
import * as THREE from '../vendor/three.module.min.js';

export const PAL = { saffron: 0xe8a33d, turmeric: 0xf2c14e, paprika: 0xb5442a, cumin: 0x7a4a26, cardamom: 0x7f9a5a, cream: 0xf3e6c8, clove: 0x3b2418, navy: 0x24303a, white: 0xf6f2e8 };
const hex = (c) => '#' + c.toString(16).padStart(6, '0');

// ---- materials and textures (cached)
const cache = new Map();
const once = (k, f) => (cache.has(k) ? cache.get(k) : (cache.set(k, f()), cache.get(k)));
const lam = (c, o = {}) => once('L' + c + JSON.stringify(o), () => new THREE.MeshLambertMaterial({ color: c, ...o }));
const std = (c, r = 0.6, m = 0, o = {}) => once('S' + c + r + m + JSON.stringify(o), () => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o }));
function tex(key, w, h, draw, rep) {
  return once('T' + key, () => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; });
}
const woodTex = () => tex('wood', 256, 64, (g, w, h) => { // teak / varnished planks, along u
  g.fillStyle = '#9a6234'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) { g.fillStyle = `rgba(${60 + (y * 7) % 40},${30 + (y * 3) % 20},10,.35)`; g.fillRect(0, y, w, 7); g.fillStyle = 'rgba(30,15,5,.55)'; g.fillRect(0, y + 7, w, 1); }
  for (let i = 0; i < 90; i++) { g.fillStyle = `rgba(255,220,170,${0.04 + Math.random() * 0.06})`; g.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 40, 1); }
}, true);
const woodMat = (c = 0xffffff) => once('W' + c, () => new THREE.MeshStandardMaterial({ map: woodTex(), color: c, roughness: 0.45 }));
const glassMat = () => once('glass', () => new THREE.MeshStandardMaterial({ color: 0xcfe8f0, roughness: 0.06, metalness: 0.25, envMapIntensity: 0.6, transparent: true, opacity: 0.24, side: THREE.DoubleSide, depthWrite: false }));
const winMat = () => once('win', () => new THREE.MeshStandardMaterial({ color: 0x2c3e48, roughness: 0.1, metalness: 0.6 }));
const ropeMat = () => lam(0xd8c08a);
const steel = () => std(0xb8bec4, 0.35, 0.7);
const black = () => lam(0x1c1a1a);

// ---- small builders
function bx(p, w, h, d, m, x = 0, y = 0, z = 0, sh = false) { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = sh; p.add(o); return o; }
function cy(p, rt, rb, h, m, x = 0, y = 0, z = 0, seg = 8) { const o = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m); o.position.set(x, y, z); p.add(o); return o; }
function tube(p, pts, r, m, closed = false, seg) { const c = new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(...q)), closed, 'catmullrom', 0.2); const o = new THREE.Mesh(new THREE.TubeGeometry(c, seg || pts.length * 4, r, 5, closed), m); p.add(o); return o; }
// a hand rail: posts at each point and a tube along the tops
function rail(p, pts, h = 0.55, r = 0.022, m = steel()) { for (const [x, y, z] of pts) cy(p, r, r, h, m, x, y + h / 2, z, 5); tube(p, pts.map(([x, y, z]) => [x, y + h, z]), r * 1.1, m); }
function flag(p, x, y, z, kind = 'nl', h = 1.0) {
  cy(p, 0.018, 0.022, h, lam(0xf3ece0), x, y + h / 2, z, 5);
  const t = tex('flag' + kind, 64, 40, (g, w, hh) => { const cols = kind === 'ams' ? ['#c8102e', '#111111', '#c8102e'] : ['#ae1c28', '#ffffff', '#21468b']; cols.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, i * hh / 3, w, hh / 3 + 1); }); if (kind === 'ams') { g.fillStyle = '#fff'; g.font = 'bold 13px Arial'; g.textAlign = 'center'; g.fillText('XXX', w / 2, hh / 2 + 5); } });
  const f = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.27, 4, 1), new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide }));
  const pa = f.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin((pa.getX(i) + 0.21) * 9) * 0.03 * (pa.getX(i) + 0.21)); // a little wave
  f.geometry.computeVertexNormals(); f.position.set(x - 0.22, y + h - 0.15, z); p.add(f); return f;
}
function fender(p, x, y, z) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.22, 3, 8), lam(0xf3ece0)); f.position.set(x, y, z); p.add(f); return f; }
function lifebuoy(p, x, y, z, ry = 0) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.06, 6, 14), lam(0xf06a2a)); t.position.set(x, y, z); t.rotation.y = ry; p.add(t); return t; }

// ---- the hull loft
// bow: 'point' (sloep, cruiser), 'round' (tjalk, rondvaart spoon bow, rounded stern too), 'box' (ark pontoon)
// stern: transom width as a share of the beam (point bows); p: section squareness (0.3 boxy … 1 round); sheer: rise at the bow
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function hullShape(o, u) {
  const { L, B, D = 0.5, F = 0.45, bow = 'point', stern = 0.7, sheer = 0.12 } = o;
  let hb = B / 2, bot = -D, top = F;
  if (bow === 'point') {
    const t = Math.max(0, (u - 0.42) / 0.58), s = smooth(0, 0.2, u);
    hb *= (stern + (1 - stern) * s) * (1 - Math.pow(t, 2.1) * 0.985);
    bot = -D * (1 - Math.pow(t, 2.4)) + F * 0.35 * Math.pow(t, 3); top = F + sheer * t * t;
    bot += D * 0.25 * (1 - smooth(0, 0.12, u)); // the stern lifts a little for the transom
  } else if (bow === 'round') {
    const tb = Math.max(0, (u - 0.8) / 0.2), ts = Math.max(0, (0.14 - u) / 0.14), t = Math.max(tb, ts);
    hb *= Math.sqrt(Math.max(0, 1 - t * t * 0.9));
    bot = -D + (D + F * 0.3) * Math.pow(t, 2.2); top = F + sheer * tb * tb + sheer * 0.45 * ts * ts;
  } else { const t = Math.max(smooth(0.96, 1, u), smooth(0.04, 0, u)); bot = -D + D * 0.6 * t; }
  return { x: -L / 2 + u * L, hb, bot, top };
}
function hullGeo(o) {
  const { nL = 24, nS = 6, p = 0.6, flare = 0.12 } = o, M = nS * 2 + 1;
  const pos = [], uv = [], idx = [], rings = [];
  const yMin = -(o.D || 0.5), yMax = (o.F || 0.45) + (o.sheer || 0.12) + 0.01;
  for (let i = 0; i <= nL; i++) {
    const u = i / nL, s = hullShape(o, u), ring = [];
    for (let k = -nS; k <= nS; k++) {
      const th = Math.abs(k) / nS * Math.PI / 2, sn = Math.pow(Math.sin(th), p), cs = Math.pow(Math.cos(th), p);
      const y = s.bot + (s.top - s.bot) * (1 - cs), f = (y - s.bot) / Math.max(0.01, s.top - s.bot);
      const z = Math.sign(k) * s.hb * sn * (1 - flare + flare * f);
      ring.push([s.x, y, z]); pos.push(s.x, y, z); uv.push(u, (y - yMin) / (yMax - yMin));
    }
    rings.push(ring);
  }
  for (let i = 0; i < nL; i++) for (let j = 0; j < M - 1; j++) { const a = i * M + j, b = a + 1, c = a + M, d = c + 1; idx.push(a, c, b, b, c, d); }
  // caps at the stern (transom) and bow
  for (const [i, fwd] of [[0, false], [nL, true]]) {
    const r = rings[i], cx = r[0][0], cyv = r.reduce((s2, q) => s2 + q[1], 0) / M, ci = pos.length / 3;
    pos.push(cx, cyv, 0); uv.push(i / nL, (cyv - yMin) / (yMax - yMin));
    for (let j = 0; j < M; j++) { const a = i * M + j, b = i * M + ((j + 1) % M); if (fwd) idx.push(ci, b, a); else idx.push(ci, a, b); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return { geo: g, rings, top: (u) => hullShape(o, u), yMin, yMax };
}
// the band texture: bands = [[yTop, color]] from the bottom up, in metres; planks: clinker / steel plate lines
function hullTex(o, bands, extra) {
  const yMin = -(o.D || 0.5), yMax = (o.F || 0.45) + (o.sheer || 0.12) + 0.01, key = 'H' + JSON.stringify([o.D, o.F, o.sheer, bands, extra && extra.key]);
  return tex(key, 256, 128, (g, w, h) => {
    const Y = (y) => (1 - (y - yMin) / (yMax - yMin)) * h;
    let y0 = yMin; for (const [y1, c] of bands) { g.fillStyle = typeof c === 'number' ? hex(c) : c; g.fillRect(0, Y(Math.min(y1, yMax + 1)), w, Y(y0) - Y(Math.min(y1, yMax + 1)) + 1); y0 = y1; }
    if (extra && extra.planks) { g.fillStyle = 'rgba(0,0,0,.18)'; for (let y = 0; y < yMax; y += extra.planks) g.fillRect(0, Y(y), w, 1); }
    if (extra && extra.plates) { g.fillStyle = 'rgba(0,0,0,.14)'; for (let x = 0; x < w; x += w / extra.plates) g.fillRect(x, 0, 1, h); }
    if (extra && extra.grime) for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(40,50,30,${Math.random() * 0.12})`; g.fillRect(Math.random() * w, Y(0) - Math.random() * 10, 2, 4 + Math.random() * 12); }
    if (extra && extra.ports) { g.fillStyle = '#d8c48a'; for (const u of extra.ports) { g.beginPath(); g.arc(u * w, Y(extra.portY), 4.5, 0, 7); g.fill(); g.fillStyle = '#263640'; g.beginPath(); g.arc(u * w, Y(extra.portY), 3.2, 0, 7); g.fill(); g.fillStyle = '#d8c48a'; } }
  });
}
function hull(body, o, bands, extra, side = THREE.FrontSide) {
  const h = hullGeo(o);
  const m = new THREE.Mesh(h.geo, new THREE.MeshStandardMaterial({ map: hullTex(o, bands, extra), roughness: o.rough ?? 0.55, metalness: o.metal ?? 0.05, side }));
  m.castShadow = true; m.receiveShadow = true; body.add(m);
  return h;
}
// the gunwale line (port side stern→bow, then starboard back), lifted by dy
function gunwale(h, n = 16, dy = 0, inset = 0) {
  const pts = [];
  for (let i = 0; i <= n; i++) { const s = h.top(i / n); pts.push([s.x, s.top + dy, -(s.hb - inset)]); }
  for (let i = n; i >= 0; i--) { const s = h.top(i / n); pts.push([s.x, s.top + dy, s.hb - inset]); }
  return pts;
}
// a flat deck filling the hull's top outline
function deck(body, h, m, dy = 0, u0 = 0, u1 = 1, inset = 0.02, n = 16) {
  const sh = new THREE.Shape(), pts = [];
  for (let i = 0; i <= n; i++) { const s = h.top(u0 + (u1 - u0) * i / n); pts.push([s.x, Math.max(0.001, s.hb - inset)]); }
  pts.forEach(([x, z], i) => (i ? sh.lineTo(x, z) : sh.moveTo(x, z))); for (let i = pts.length - 1; i >= 0; i--) sh.lineTo(pts[i][0], -pts[i][1]);
  const g = new THREE.ShapeGeometry(sh); g.rotateX(-Math.PI / 2); // lay it flat, facing up (it used to face down, so from above you looked straight through every deck into the canal)
  const mesh = new THREE.Mesh(g, m); const s0 = h.top(u0); mesh.position.y = s0.top + dy; mesh.receiveShadow = true; body.add(mesh);
  // map planks along the length
  const p = g.attributes.position, uvA = []; for (let i = 0; i < p.count; i++) uvA.push(p.getX(i) / 2.5, p.getZ(i) / 0.6); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvA, 2));
  return mesh;
}

// ---- water: wake, bow wave and the soft dark patch under a hull
const wakeTex = () => tex('wake', 256, 128, (g, w, h) => { // stern at the right edge, trailing off to the left
  const fade = g.createLinearGradient(0, 0, w, 0); fade.addColorStop(0, 'rgba(255,255,255,0)'); fade.addColorStop(1, 'rgba(255,255,255,1)');
  g.lineCap = 'round';
  for (let k = 0; k < 3; k++) { // the V arms, a few strands each
    g.strokeStyle = `rgba(255,255,255,${0.55 - k * 0.15})`; g.lineWidth = 3 - k * 0.7;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(w, h / 2 + s * h * 0.12); g.quadraticCurveTo(w * 0.55, h / 2 + s * h * (0.28 + k * 0.04), 0, h / 2 + s * h * (0.47 - k * 0.03)); g.stroke(); }
  }
  g.filter = 'blur(1.2px)';
  for (let i = 0; i < 420; i++) { // churned water from the screw
    const x = Math.pow(Math.random(), 0.6) * w, spread = 0.05 + (1 - x / w) * 0.22, y = h / 2 + (Math.random() - 0.5) * h * spread * 2;
    g.fillStyle = `rgba(255,255,255,${0.1 + 0.35 * (x / w) * Math.random()})`; g.beginPath(); g.ellipse(x, y, 1.5 + Math.random() * 4, 0.8 + Math.random() * 1.4, 0, 0, 7); g.fill();
  }
  g.filter = 'none';
  g.globalCompositeOperation = 'destination-in'; g.fillStyle = fade; g.fillRect(0, 0, w, h);
});
const bowTex = () => tex('bow', 128, 128, (g, w, h) => { // the bow at the right edge, spray peeling back along both sides
  g.lineCap = 'round';
  for (let k = 0; k < 4; k++) {
    g.strokeStyle = `rgba(255,255,255,${0.85 - k * 0.18})`; g.lineWidth = 3.5 - k * 0.7;
    for (const s of [-1, 1]) { g.beginPath(); g.moveTo(w * 0.92 - k * 6, h / 2); g.quadraticCurveTo(w * 0.6 - k * 4, h / 2 + s * h * (0.2 + k * 0.05), 0, h / 2 + s * h * (0.3 + k * 0.06)); g.stroke(); }
  }
  const f = g.createLinearGradient(0, 0, w, 0); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(0.5, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-in'; g.fillStyle = f; g.fillRect(0, 0, w, h);
});
const shadowTex = () => tex('hullshadow', 64, 32, (g, w, h) => { const r = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); r.addColorStop(0, 'rgba(8,20,24,.55)'); r.addColorStop(1, 'rgba(8,20,24,0)'); g.fillStyle = r; g.save(); g.scale(1, h / w); g.fillRect(0, 0, w, w); g.restore(); });
// An open boat's floor lies below the waterline, and the canal is one flat plane, so the water used to show inside the hull:
// the boat looked flooded. dryWell() lays an invisible lid over the well at the waterline that only writes depth. A scene
// whose water draws after it (water.renderOrder above DRY_ORDER, as the hub canal does) then leaves the inside of the boat dry.
export const DRY_ORDER = 9;
const dryMat = () => once('dry', () => new THREE.MeshBasicMaterial({ colorWrite: false }));
function dryWell(body, h, u0 = 0.03, u1 = 0.97, inset = 0.07) {
  const m = deck(body, h, dryMat(), 0, u0, u1, inset, 20); m.position.y = 0.045; m.renderOrder = DRY_ORDER; m.receiveShadow = false; return m;
}
const stripeTex = (a, b, n = 8) => tex('stripe' + a + b + n, 64, 64, (g, w, hh) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n + 1, hh); } });
const panelTex = () => tex('solar', 64, 64, (g, w, hh) => { g.fillStyle = '#16243c'; g.fillRect(0, 0, w, hh); g.strokeStyle = '#6a86b0'; g.lineWidth = 1.5; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, hh); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); } g.strokeStyle = '#c8d0d8'; g.lineWidth = 3; g.strokeRect(1, 1, w - 2, hh - 2); });
function deckChair(p, x, y, z, ry, colA, colB) { // a folding strandstoel with a striped sling
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g);
  const sl = new THREE.MeshLambertMaterial({ map: stripeTex(colA, colB), side: THREE.DoubleSide }), wd = woodMat(0xd8b080);
  const seat = bx(g, 0.75, 0.03, 0.5, sl, 0.1, 0.22, 0); seat.rotation.z = 0.25; const back = bx(g, 0.7, 0.03, 0.5, sl, -0.42, 0.48, 0); back.rotation.z = 1.05;
  for (const s of [-1, 1]) { bx(g, 1.1, 0.04, 0.04, wd, -0.05, 0.3, s * 0.27).rotation.z = 0.42; bx(g, 0.9, 0.04, 0.04, wd, 0.0, 0.2, s * 0.27).rotation.z = -0.4; }
  return g;
}
function skylight(p, x, y, z, w = 0.9, d = 0.7, rx = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.x = rx; p.add(g); bx(g, w + 0.12, 0.1, d + 0.12, lam(PAL.white)); bx(g, w, 0.11, d, winMat(), 0, 0.01, 0); bx(g, 0.04, 0.12, d, lam(PAL.white), 0, 0.01, 0); return g; }
function solar(p, x, y, z, w = 1.0, d = 0.6, rx = 0) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), new THREE.MeshStandardMaterial({ map: panelTex(), roughness: 0.25, metalness: 0.4 })); m.position.set(x, y, z); m.rotation.x = rx; p.add(m); return m; }
function coil(p, x, y, z, r = 0.22) { for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(r - i * 0.06, 0.03, 5, 16), lam(0xd8c8a0)); t.rotation.x = Math.PI / 2; t.position.set(x, y + 0.03, z); p.add(t); } }
function waterBits(g, L, B, moving) {
  const sh = new THREE.Mesh(new THREE.PlaneGeometry(L * 1.25, B * 1.9), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; sh.renderOrder = 1; g.add(sh);
  if (!moving) return;
  const wl = Math.min(L * 2.6, 16), wk =new THREE.Mesh(new THREE.PlaneGeometry(wl, B * 3.4), new THREE.MeshBasicMaterial({ map: wakeTex(), transparent: true, depthWrite: false, opacity: 0 }));
  wk.rotation.x = -Math.PI / 2; wk.position.set(-L / 2 - wl / 2 + 0.3, 0.02, 0); wk.renderOrder = 2; g.add(wk);
  const bl = Math.min(L * 0.45, B * 2.2), bw = new THREE.Mesh(new THREE.PlaneGeometry(bl, B * 1.7), new THREE.MeshBasicMaterial({ map: bowTex(), transparent: true, depthWrite: false, opacity: 0 }));
  bw.rotation.x = -Math.PI / 2; bw.position.set(L / 2 - bl * 0.42, 0.025, 0); bw.renderOrder = 2; g.add(bw);
  g.userData.wake = wk; g.userData.bowWave = bw;
}
function shell(L, B, opts = {}) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  g.rotation.order = 'YXZ';
  g.userData = { body, L, B, ph: opts.phase ?? Math.random() * 6, heavy: opts.heavy || 1 };
  waterBits(g, L, B, opts.moving);
  return { g, body };
}
// one frame: a slow bob, a roll and a pitch; under way the bow lifts a little and the wake shows
export function rockBoat(g, t, speed = 0) {
  const u = g.userData, b = u.body, k = 1 / u.heavy, ph = u.ph;
  b.position.y = (Math.sin(t * 1.3 + ph) * 0.03 + Math.sin(t * 2.1 + ph * 2) * 0.012) * k;
  b.rotation.x = (Math.sin(t * 0.9 + ph) * 0.025 + Math.sin(t * 1.7 + ph) * 0.01) * k;
  b.rotation.z = Math.sin(t * 1.1 + ph * 1.3) * 0.012 * k + Math.min(0.035, Math.abs(speed) * 0.012);
  const a = Math.min(1, Math.abs(speed) / 2);
  if (u.wake) { u.wake.material.opacity = a * (0.75 + Math.sin(t * 7 + ph) * 0.08); u.wake.visible = a > 0.02; u.bowWave.material.opacity = a * 0.7; u.bowWave.visible = a > 0.02; u.wake.scale.x = 0.7 + a * 0.3; u.wake.position.x = -u.L / 2 - u.wake.geometry.parameters.width * u.wake.scale.x / 2 + 0.3; }
  if (u.prop) u.prop.rotation.x += Math.abs(speed) * 0.6;
}
// people go where the boat says: crew = [Object3D], spots = [[x, y, z, ry, seat height or null to stand]]; sit(p, h) is the game's
// own seating pose (main.js sit())
function seatCrew(body, crew, spots, sit) {
  (crew || []).forEach((p, i) => {
    const s = spots[i]; if (!s || !p) return;
    if (p.parent) p.parent.remove(p); body.add(p); p.position.set(s[0], s[1], s[2]); p.rotation.y = s[3];
    if (s[4] != null) { if (sit) sit(p, s[4] / (p.scale.y || 1)); else p.userData.seated = true; }
  });
}

const u = (g) => g.userData;

// ---- outboard motor on a transom (faces +x)
function outboard(body, x, y, z = 0, sc = 1, col = 0x2a2c30) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(sc); body.add(g);
  const cowl = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.2, 4, 10), std(col, 0.35, 0.2)); cowl.scale.set(1.25, 1, 0.85); cowl.position.set(-0.12, 0.2, 0); g.add(cowl);
  bx(g, 0.34, 0.05, 0.3, lam(0x9a9ea2), -0.1, 0.02, 0);
  bx(g, 0.12, 0.62, 0.08, std(0x3a3c40, 0.5, 0.3), -0.12, -0.3, 0); // the leg
  const prop = new THREE.Group(); prop.position.set(-0.18, -0.58, 0); g.add(prop);
  for (let i = 0; i < 3; i++) { const bl = bx(prop, 0.02, 0.16, 0.06, steel(), 0, 0, 0); bl.rotation.x = i * 2.09; bl.position.set(0, Math.cos(i * 2.09) * 0.07, Math.sin(i * 2.09) * 0.07); }
  bx(g, 0.22, 0.04, 0.03, lam(0xdcdcdc), -0.05, 0.1, 0.15); // tiller arm
  return prop;
}

// ===================================================================== the sloep
// An open Amsterdam party sloep: varnished top strake, U bench with saffron cushions, a console with a wheel at the back,
// an outboard, a flag and fenders. opts: L, B, hull colour, crew [persons], cargo (crates instead of cushions), moving
export function makeSloep(opts = {}) {
  const L = opts.L || 5.6, B = opts.B || 1.8, F = opts.F || 0.42, col = opts.hull ?? PAL.cardamom;
  const { g, body } = shell(L, B, { moving: opts.moving, phase: opts.phase });
  const o = { L, B, D: 0.32, F, bow: 'point', stern: 0.66, sheer: 0.14, p: 0.75, flare: 0.18, nL: 20, nS: 5 };
  const h = hull(body, o, [[0.03, 0x5a2a1e], [0.07, PAL.cream], [F - 0.1, col], [9, '#a8693a']], { planks: 0.09, key: 's' }, THREE.DoubleSide);
  tube(body, gunwale(h, 14, 0.01), 0.04, woodMat(0xc88a50), true, 60); // the rubbing strake
  // floorboards and the bench round the back
  deck(body, h, woodMat(0xb07848), 0, 0.05, 0.9, 0.2).position.y = -0.12; // floorboards
  dryWell(body, h); // keep the canal out of the boat
  const seatM = lam(opts.cargo ? 0x6a4a2a : (opts.cushion ?? PAL.saffron));
  const sb = (x0, x1, s) => { // a side bench with its cushion
    const z = s * (Math.min(h.top((x0 + L / 2) / L).hb, h.top((x1 + L / 2) / L).hb) - 0.22);
    bx(body, x1 - x0, 0.22, 0.34, woodMat(0xd09a60), (x0 + x1) / 2, 0.1, z);
    if (!opts.cargo) bx(body, x1 - x0 - 0.06, 0.08, 0.3, seatM, (x0 + x1) / 2, 0.25, z);
  };
  sb(-L * 0.4, L * 0.12, -1); sb(-L * 0.4, L * 0.12, 1);
  bx(body, 0.34, 0.22, B * 0.62, woodMat(0xd09a60), -L * 0.43, 0.1, 0); if (!opts.cargo) bx(body, 0.3, 0.08, B * 0.58, seatM, -L * 0.43, 0.25, 0);
  bx(body, L * 0.16, 0.08, B * 0.5, woodMat(0xd09a60), L * 0.27, 0.2, 0); // the foredeck locker
  // the console and wheel, starboard aft
  const cx = -L * 0.08, cz = B * 0.24;
  bx(body, 0.4, 0.62, 0.42, lam(PAL.cream), cx, 0.18, cz, true);
  bx(body, 0.36, 0.04, 0.38, woodMat(0xc88a50), cx, 0.5, cz);
  const wh = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 5, 14), black()); wh.position.set(cx - 0.18, 0.62, cz); wh.rotation.y = Math.PI / 2; wh.rotation.x = 0.5; body.add(wh);
  const ws = bx(body, 0.03, 0.22, 0.4, glassMat(), cx + 0.2, 0.62, cz); ws.rotation.z = 0.35;
  // a table, the crate of beer, a cool box
  cy(body, 0.03, 0.03, 0.3, steel(), -L * 0.2, 0.05, 0, 6); bx(body, 0.6, 0.03, 0.45, woodMat(0xd8a868), -L * 0.2, 0.22, 0);
  if (opts.cargo) { for (let i = 0; i < opts.cargo; i++) bx(body, 0.5, 0.36, 0.42, lam([0x6a5032, 0x8a6a42, PAL.saffron][i % 3]), -L * 0.32 + i * 0.55, 0.06, (i % 2 - 0.5) * 0.45, true); }
  else { bx(body, 0.34, 0.22, 0.25, lam(PAL.turmeric), -L * 0.2, 0.35, 0.05); bx(body, 0.4, 0.28, 0.28, lam(0x2f5f8a), L * 0.05, 0.02, -B * 0.2); }
  // the outboard on the transom, flag on the stern, fenders on the side
  const s0 = h.top(0);
  u(g).prop = outboard(body, s0.x - 0.02, s0.top - 0.05, 0, 0.9);
  flag(body, s0.x + 0.12, s0.top, B * 0.28, opts.flag || 'ams', 0.9);
  for (const fx of [-L * 0.25, L * 0.05]) fender(body, fx, 0.15, -(h.top((fx + L / 2) / L).hb + 0.06));
  bx(body, 0.06, 0.12, 0.08, steel(), L / 2 - 0.25, h.top(0.95).top + 0.05, 0); // bow cleat
  seatCrew(body, opts.crew, [[cx - 0.4, -0.1, cz, Math.PI / 2, null], [-L * 0.3, -0.1, -B * 0.22, 0, 0.4], [-L * 0.3, -0.1, B * 0.22, Math.PI, 0.4], [-L * 0.43, -0.1, 0, Math.PI / 2, 0.4], [-L * 0.08, -0.1, -B * 0.22, 0, 0.4]], opts.sit);
  return g;
}

// ===================================================================== the rondvaartboot
// Long, low and dark with a spoon bow, a cream rubbing band, a glass house with a curved glass roof on cream ribs, benches in
// rows, the skipper's stand at the back, and the company name on the side. opts: L, B, name (a Material for the sign), crew
export function makeTourBoat(opts = {}) {
  const L = opts.L || 13, B = opts.B || 2.4, F = 0.42, col = opts.hull ?? PAL.navy;
  const { g, body } = shell(L, B, { moving: opts.moving !== false, phase: opts.phase, heavy: 1.8 });
  const o = { L, B, D: 0.45, F, bow: 'round', sheer: 0.06, p: 0.4, flare: 0.06, nL: 26, nS: 5 };
  const h = hull(body, o, [[0.02, 0x4a2a20], [0.08, PAL.cream], [F - 0.07, col], [9, PAL.saffron]], { key: 't' });
  deck(body, h, woodMat(0xc09060), 0.005);
  tube(body, gunwale(h, 20, -0.04, -0.04), 0.06, black(), true, 90); // the black rubber fender band
  // the glass house
  const x0 = -L * 0.33, x1 = L * 0.35, hw = B / 2 - 0.12, cl = x1 - x0, cxm = (x0 + x1) / 2, yb = F;
  const cream = lam(PAL.cream);
  for (const s of [-1, 1]) {
    bx(body, cl, 0.32, 0.06, cream, cxm, yb + 0.16, s * hw, true); // low side panel
    bx(body, cl, 0.06, 0.1, lam(PAL.saffron), cxm, yb + 0.34, s * hw); // sill
    const gl = bx(body, cl, 0.62, 0.02, glassMat(), cxm, yb + 0.68, s * hw); gl.renderOrder = 3;
  }
  // the curved glass roof and its ribs
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(hw, hw, cl, 18, 1, true, -Math.PI / 2, Math.PI), glassMat());
  roof.rotation.z = Math.PI / 2; roof.scale.set(1, 1, 0.42); roof.position.set(cxm, yb + 0.99, 0); roof.renderOrder = 3; body.add(roof);
  bx(body, cl, 0.03, 0.46, lam(PAL.saffron), cxm, yb + 0.99 + hw * 0.42, 0); // the canvas sun strip along the ridge
  const ribs = 11;
  for (let i = 0; i <= ribs; i++) {
    const x = x0 + cl * i / ribs;
    const rb = new THREE.Mesh(new THREE.TorusGeometry(hw, 0.025, 4, 14, Math.PI), cream); rb.rotation.y = Math.PI / 2; rb.scale.set(1, 0.42, 1); rb.position.set(x, yb + 0.99, 0); body.add(rb);
    for (const s of [-1, 1]) bx(body, 0.05, 0.64, 0.05, cream, x, yb + 0.68, s * hw);
  }
  // rounded front of the glass house
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(hw, hw, 0.94, 14, 1, true, 0, Math.PI), glassMat()); nose.scale.set(0.55, 1, 1); nose.position.set(x1, yb + 0.53, 0); nose.renderOrder = 3; body.add(nose);
  const nosec = new THREE.Mesh(new THREE.SphereGeometry(hw, 14, 6, 0, Math.PI, 0, Math.PI / 2), glassMat()); nosec.scale.set(0.55, 0.42, 1); nosec.position.set(x1, yb + 0.99, 0); nosec.renderOrder = 3; body.add(nosec);
  bx(body, 0.06, 0.94, hw * 2, cream, x0, yb + 0.53, 0); // back bulkhead
  // benches in rows, a centre aisle
  for (let x = x0 + 0.5; x < x1 - 0.2; x += 0.85) for (const s of [-1, 1]) { bx(body, 0.38, 0.06, hw * 0.78, lam(PAL.paprika), x, yb + 0.3, s * hw * 0.5); bx(body, 0.06, 0.32, hw * 0.78, lam(PAL.paprika), x - 0.17, yb + 0.45, s * hw * 0.5); }
  // the open stern deck: the skipper's stand, a rail, the flag
  const sx = x0 - 0.9;
  bx(body, 0.5, 0.75, 0.6, lam(PAL.cream), sx, yb + 0.38, 0, true);
  const wh = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.02, 5, 14), woodMat(0xb07040)); wh.position.set(sx + 0.05, yb + 0.95, 0); wh.rotation.y = Math.PI / 2; wh.rotation.x = 0.4; body.add(wh);
  const ss = h.top(0.02);
  rail(body, [[x0 - 0.05, yb, -hw], [x0 - 0.8, yb, -hw], [ss.x + 0.4, yb, -ss.hb * 0.75], [ss.x + 0.2, yb, 0], [ss.x + 0.4, yb, ss.hb * 0.75], [x0 - 0.8, yb, hw], [x0 - 0.05, yb, hw]], 0.5, 0.018, cream);
  flag(body, ss.x + 0.25, yb, 0, 'nl', 1.2);
  // foredeck: bollards and a lifebuoy
  for (const s of [-1, 1]) cy(body, 0.06, 0.07, 0.18, black(), x1 + 0.9, yb + 0.09, s * 0.5, 8);
  lifebuoy(body, x0 + 0.4, yb + 0.68, -hw - 0.03);
  // the name, both sides
  if (opts.sign) for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.26), opts.sign); n.position.set(cxm, yb + 0.16, s * (hw + 0.035)); n.rotation.y = s < 0 ? Math.PI : 0; body.add(n); }
  const spots = [];
  for (let x = x0 + 0.5, i = 0; x < x1 - 0.2; x += 0.85, i++) for (const s of [-1, 1]) spots.push([x - 0.02, yb + 0.02, s * hw * 0.5, Math.PI / 2, 0.33]);
  seatCrew(body, opts.crew, [[sx - 0.45, yb, 0, Math.PI / 2, null], ...spots.filter((_, i) => i % 3 !== 1)], opts.sit);
  return g;
}

// ===================================================================== the woonark
// A houseboat on a concrete pontoon: a timber cabin, framed windows, a front door to a deck with flowers and chairs, a stove
// pipe, and either a pitched roof or a flat roof terrace behind a rail. opts: L, B, wall (Material or colour), roof ('pitch'|'flat'),
// roofMat, winMat, frameMat, trim colour
export function makeArk(opts = {}) {
  const L = opts.L || 12, B = opts.B || 2.9, F = 0.5;
  const { g, body } = shell(L, B, { phase: opts.phase, heavy: 3 });
  const o = { L, B, D: 0.6, F, bow: 'box', p: 0.12, flare: 0, nL: 6, nS: 2 };
  o.rough = 0.95;
  const h = hull(body, o, [[-0.05, '#3a4a3a'], [0.06, '#5a6a4a'], [F - 0.08, '#8e8a80'], [9, hex(opts.trim ?? PAL.paprika)]], { grime: true, key: 'ark' + (opts.trim ?? '') });
  deck(body, h, woodMat(0xa87850), 0.004, 0, 1, 0.02, 4);
  const wall = opts.wall && opts.wall.isMaterial ? opts.wall : lam(opts.wall ?? PAL.cream), frame = opts.frameMat || lam(PAL.cream), win = opts.winMat || winMat();
  const cl = L * 0.74, cx = -L * 0.06, cw = B - 0.32, chh = 2.0, y0 = F;
  bx(body, cl, chh, cw, wall, cx, y0 + chh / 2, 0, true).receiveShadow = true;
  bx(body, cl + 0.08, 0.1, cw + 0.08, lam(opts.trim ?? PAL.paprika), cx, y0 + 0.05, 0); // skirting
  // windows on both long sides, a door at the front end
  const nW = Math.max(3, Math.round(cl / 2.2));
  for (let i = 0; i < nW; i++) for (const s of [-1, 1]) {
    const x = cx - cl / 2 + (i + 0.5) * cl / nW;
    bx(body, 1.25, 1.0, 0.06, frame, x, y0 + 1.15, s * (cw / 2 + 0.02));
    bx(body, 1.05, 0.8, 0.07, win, x, y0 + 1.15, s * (cw / 2 + 0.025));
    bx(body, 0.05, 0.8, 0.08, frame, x, y0 + 1.15, s * (cw / 2 + 0.03));
    if ((i + (s > 0 ? 1 : 0)) % 2 === 0) bx(body, 1.0, 0.18, 0.2, lam(PAL.saffron), x, y0 + 0.58, s * (cw / 2 + 0.1)); // a flower box
  }
  const fx = cx + cl / 2 + 0.02;
  bx(body, 0.06, 1.75, 0.85, lam(opts.door ?? 0x2f4a3a), fx, y0 + 0.88, -0.35);
  bx(body, 0.07, 0.9, 0.7, win, fx, y0 + 1.15, 0.6);
  bx(body, 0.08, 0.06, 0.8, frame, fx, y0 + 1.62, 0.6);
  // the roof
  if (opts.roof === 'pitch') {
    const rs = new THREE.Shape(); rs.moveTo(-cw / 2 - 0.25, 0); rs.lineTo(0, 0.95); rs.lineTo(cw / 2 + 0.25, 0); rs.lineTo(-cw / 2 - 0.25, 0);
    const rg = new THREE.ExtrudeGeometry(rs, { depth: cl + 0.4, bevelEnabled: false }); rg.translate(0, 0, -(cl + 0.4) / 2);
    const r = new THREE.Mesh(rg, lam(opts.roofCol ?? 0x9a3e26)); r.rotation.y = Math.PI / 2; r.position.set(cx, y0 + chh, 0); r.castShadow = true; body.add(r);
    const hwR = cw / 2 + 0.25, th = Math.atan2(0.95, hwR), onSlope = (z) => y0 + chh + 0.95 * (1 - Math.abs(z) / hwR) + 0.04;
    bx(body, cl + 0.5, 0.1, 0.16, lam(PAL.white), cx, y0 + chh + 0.98, 0); // ridge cap
    for (const s of [-1, 1]) { // white bargeboards at both ends, skylights on one slope, solar panels on the other
      for (const e of [-1, 1]) { const bb = bx(body, 0.08, 0.14, Math.hypot(hwR, 0.95) + 0.1, lam(PAL.white), cx + e * (cl / 2 + 0.2), y0 + chh + 0.5, s * hwR / 2); bb.rotation.x = s * th; }
      bx(body, cl + 0.44, 0.08, 0.1, lam(PAL.white), cx, y0 + chh - 0.02, s * (hwR + 0.02)); // gutter
    }
    for (const fx of [-0.28, 0.02, 0.3]) skylight(body, cx + cl * fx, onSlope(0.75), 0.75, 0.8, 0.7, th);
    for (let i = 0; i < 4; i++) solar(body, cx - cl * 0.3 + i * 1.08, onSlope(-0.75), -0.75, 1.0, 0.75, -th);
  } else {
    bx(body, cl + 0.2, 0.14, cw + 0.2, lam(PAL.white), cx, y0 + chh + 0.07, 0, true);
    const yt = y0 + chh + 0.14, xa = cx - cl / 2, xb = cx + cl / 2, zz = cw / 2;
    { const tm = woodMat(0xc49a66), td = bx(body, cl - 0.5, 0.03, cw - 0.4, tm, cx, yt + 0.015, 0); td.receiveShadow = true; } // teak boards on the roof terrace
    deckChair(body, xa + cl * 0.68, yt + 0.03, -0.45, 0.2, opts.chairA ?? '#e8a33d', '#fbf6ea'); deckChair(body, xa + cl * 0.68, yt + 0.03, 0.5, -0.15, opts.chairA ?? '#e8a33d', '#fbf6ea');
    skylight(body, xa + cl * 0.2, yt + 0.08, 0, 1.1, 0.8); solar(body, xb - 1.0, yt + 0.12, -zz + 0.55, 1.2, 0.7, -0.2); solar(body, xb - 1.0, yt + 0.12, zz - 0.55, 1.2, 0.7, -0.2);
    bx(body, 0.9, 0.04, 0.5, lam(0x5f8a4a), xa + 0.9, yt + 0.05, 0); // a strip of sedum
    rail(body, [[xa, yt, -zz], [xb, yt, -zz], [xb, yt, zz], [xa, yt, zz]], 0.75, 0.022, lam(PAL.clove));
    for (let i = 0; i < 5; i++) { const pl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.28 + (i % 3) * 0.06, 0), lam([0x5f7a40, PAL.paprika, 0x6f8a4a][i % 3], { flatShading: true })); pl.position.set(xa + 0.8 + i * (cl - 1.6) / 4, yt + 0.35, (i % 2 - 0.5) * cw * 0.7); body.add(pl); bx(body, 0.5, 0.3, 0.5, lam(PAL.cumin), pl.position.x, yt + 0.15, pl.position.z); }
    bx(body, 0.8, 0.05, 0.8, woodMat(0xc09060), xa + cl * 0.5, yt + 0.42, 0); cy(body, 0.03, 0.03, 0.4, lam(PAL.clove), xa + cl * 0.5, yt + 0.2, 0, 5); // a terrace table
  }
  // a stove pipe with a little hat
  const px = cx - cl * 0.3, py = y0 + chh + (opts.roof === 'pitch' ? 0.45 : 0.14);
  cy(body, 0.07, 0.07, 0.9, lam(0x3a3a3a), px, py + 0.45, cw * 0.18, 8); cy(body, 0.0, 0.16, 0.12, lam(0x3a3a3a), px, py + 0.96, cw * 0.18, 8);
  // the front deck: flowers, two chairs, a bike
  for (let i = 0; i < 4; i++) { const z = -B / 2 + 0.4 + i * (B - 0.8) / 3; bx(body, 0.5, 0.28, 0.32, lam(PAL.cumin), L / 2 - 0.35, y0 + 0.14, z); const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 0), lam([PAL.paprika, PAL.turmeric, 0xe86a1a, PAL.cream][i], { flatShading: true })); fl.position.set(L / 2 - 0.35, y0 + 0.4, z); body.add(fl); }
  for (const z of [-0.45, 0.45]) { bx(body, 0.45, 0.06, 0.45, woodMat(0xc8a070), L / 2 - 1.3, y0 + 0.42, z); bx(body, 0.06, 0.45, 0.45, woodMat(0xc8a070), L / 2 - 1.55, y0 + 0.65, z); for (const dx of [-0.18, 0.18]) for (const dz of [-0.18, 0.18]) cy(body, 0.02, 0.02, 0.42, lam(PAL.clove), L / 2 - 1.3 + dx, y0 + 0.21, z + dz, 4); }
  if (opts.bike !== false) { const bk = new THREE.Group(); bk.position.set(-L / 2 + 0.6, y0 + 0.36, -B / 2 + 0.3); body.add(bk); for (const x of [-0.5, 0.5]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.025, 4, 14), black()); w.position.x = x; bk.add(w); } bx(bk, 0.9, 0.05, 0.04, lam(opts.bikeCol ?? PAL.paprika), 0, 0.25, 0).rotation.z = 0.15; bx(bk, 0.05, 0.4, 0.04, lam(opts.bikeCol ?? PAL.paprika), 0.42, 0.25, 0); }
  lifebuoy(body, cx + cl / 2 - 0.6, y0 + 1.3, -(cw / 2 + 0.09));
  { const aw = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.04, cw * 0.9), new THREE.MeshLambertMaterial({ map: stripeTex(hex(opts.trim ?? PAL.paprika), '#fbf6ea') })); aw.position.set(fx + 0.42, y0 + 1.95, 0); aw.rotation.z = -0.32; body.add(aw); } // markies over the door
  tube(body, gunwale(h, 4, 0.03), 0.045, lam(PAL.white), true, 24); // a white rubbing strake round the pontoon
  // a hose and an electricity cable to the quay, and the gangplank
  if (opts.plank !== false) bx(body, 1.0, 0.07, 1.4, woodMat(0xb08860), cx + cl * 0.3, y0 + 0.45, B / 2 + 0.55).rotation.x = -0.25;
  return g;
}

// ===================================================================== the woonschip (converted tjalk)
// The classic Dutch barge: a round bow with a strong sheer, leeboards on both sides, a big wooden rudder with a tiller,
// the mast lowered onto a crutch, a long roof over the old hold with portholes, and a little wheelhouse aft.
export function makeBarge(opts = {}) {
  const L = opts.L || 12, B = opts.B || 2.9, F = 0.55, col = opts.hull ?? 0x2a3a30;
  const { g, body } = shell(L, B, { phase: opts.phase, heavy: 3 });
  const o = { L, B, D: 0.7, F, bow: 'round', sheer: 0.55, p: 0.55, flare: 0.08, nL: 26, nS: 6, metal: 0.25, rough: 0.5 };
  const ports = []; for (let i = 0; i < 6; i++) ports.push(0.3 + i * 0.075);
  const h = hull(body, o, [[0.0, PAL.paprika], [0.08, PAL.cream], [F - 0.08, col], [F + 0.06, hex(opts.band ?? PAL.saffron)], [9, col]], { plates: 10, key: 'b' + col });
  deck(body, h, woodMat(0x8a6040), -0.02, 0.02, 0.98);
  tube(body, gunwale(h, 20, 0.04), 0.05, lam(opts.band ?? PAL.saffron), true, 90);
  // the roof over the hold, with portholes, and the wheelhouse aft
  const rx0 = -L * 0.22, rx1 = L * 0.3, rw = B - 0.7, ry = F;
  bx(body, rx1 - rx0, 0.75, rw, lam(opts.cabin ?? PAL.cream), (rx0 + rx1) / 2, ry + 0.37, 0, true);
  { const ht = stripeTex(hex(opts.hatchA ?? 0x1f6a44), hex(opts.hatchB ?? 0xf3e6c8), 8).clone(); ht.wrapS = THREE.RepeatWrapping; ht.repeat.set(2, 1); ht.needsUpdate = true;
    const hm = new THREE.MeshLambertMaterial({ map: ht }), top = bx(body, rx1 - rx0 + 0.1, 0.08, rw + 0.12, [lam(PAL.cumin), lam(PAL.cumin), hm, lam(PAL.cumin), lam(PAL.cumin), lam(PAL.cumin)], (rx0 + rx1) / 2, ry + 0.78, 0, true); top.receiveShadow = true; } // the luiken: painted hatch boards
  skylight(body, rx0 + (rx1 - rx0) * 0.3, ry + 0.86, 0, 0.7, 0.6); skylight(body, rx0 + (rx1 - rx0) * 0.72, ry + 0.86, 0, 0.7, 0.6);
  for (let x = rx0 + 0.6; x < rx1 - 0.3; x += 1.1) for (const s of [-1, 1]) { const pw = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 12), lam(0xc8a860)); pw.rotation.x = Math.PI / 2; pw.position.set(x, ry + 0.42, s * (rw / 2 + 0.01)); body.add(pw); const pg = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), winMat()); pg.position.set(x, ry + 0.42, s * (rw / 2 + 0.035)); pg.rotation.y = s > 0 ? 0 : Math.PI; body.add(pg); }
  const wx = -L * 0.33;
  bx(body, 1.3, 1.25, rw, lam(PAL.cumin), wx, ry + 0.62, 0, true);
  bx(body, 1.42, 0.08, rw + 0.14, lam(PAL.white), wx, ry + 1.28, 0, true); solar(body, wx, ry + 1.34, 0, 0.9, 0.9);
  for (const s of [-1, 1]) { bx(body, 1.0, 0.5, 0.03, winMat(), wx, ry + 0.95, s * (rw / 2 + 0.01)); }
  bx(body, 0.03, 0.5, rw * 0.8, winMat(), wx + 0.66, ry + 0.95, 0);
  // the lowered mast on its crutch, with the furled sail
  const ms = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, L * 0.7, 8), woodMat(0xc89060)); ms.rotation.z = Math.PI / 2 - 0.04; ms.position.set(L * 0.05, ry + 1.15, 0); body.add(ms);
  const sail = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, L * 0.38, 3, 8), lam(0x8a3a22)); sail.rotation.z = Math.PI / 2 - 0.04; sail.position.set(L * 0.02, ry + 1.27, 0); body.add(sail);
  bx(body, 0.08, 0.5, 0.08, woodMat(0xa07040), rx1 + 0.2, ry + 0.3, 0);
  // leeboards (zwaarden), pivoting at the gunwale
  for (const s of [-1, 1]) {
    const lb = new THREE.Shape(); lb.moveTo(-0.14, 0); lb.lineTo(0.14, 0); lb.quadraticCurveTo(0.75, -0.45, 0.6, -0.72); lb.quadraticCurveTo(0, -0.88, -0.6, -0.72); lb.quadraticCurveTo(-0.75, -0.45, -0.14, 0);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(lb, { depth: 0.06, bevelEnabled: false }), woodMat(opts.leeboard ?? 0xd8a050)); m.castShadow = true;
    const st = h.top(0.62); m.position.set(st.x, st.top + 0.08, s * (st.hb + 0.03) + (s < 0 ? 0 : -0.06)); m.rotation.x = s * -0.12; body.add(m);
    cy(body, 0.05, 0.05, 0.12, black(), st.x, st.top + 0.05, s * (st.hb + 0.06), 6).rotation.x = Math.PI / 2; // the pivot
  }
  // the big rudder and its tiller at the stern
  const rs = h.top(0), rud = new THREE.Shape(); rud.moveTo(0, 0.5); rud.lineTo(0, -0.7); rud.quadraticCurveTo(-0.55, -0.75, -0.6, -0.2); rud.lineTo(-0.15, 0.5); rud.lineTo(0, 0.5);
  const rm = new THREE.Mesh(new THREE.ExtrudeGeometry(rud, { depth: 0.07, bevelEnabled: false }), woodMat(0x9a6a3a)); rm.position.set(rs.x - 0.05, F, -0.035); body.add(rm);
  const til = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 1.4, 6), woodMat(0xc89060)); til.rotation.z = Math.PI / 2 + 0.25; til.position.set(rs.x + 0.55, F + 0.82, 0); body.add(til);
  // the bow: anchor winch, a name board, flowers and a bike on deck
  const bs = h.top(0.93); bx(body, 0.5, 0.3, 0.6, lam(PAL.clove), bs.x - 0.2, bs.top + 0.12, 0);
  coil(body, bs.x - 0.95, F, 0.45); flag(body, rs.x + 0.25, F + 0.1, 0.5, 'nl', 1.3); tube(body, gunwale(h, 20, -0.16), 0.03, lam(PAL.white), true, 90); // rope, the flag at the stern, a white strake
  for (let i = 0; i < 3; i++) { const pz = (i - 1) * 0.55; bx(body, 0.35, 0.3, 0.35, lam(PAL.paprika), rx1 + 0.7, F + 0.15, pz); const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), lam([0x5f7a40, PAL.turmeric, 0x6f8a4a][i], { flatShading: true })); fl.position.set(rx1 + 0.7, F + 0.45, pz); body.add(fl); }
  if (opts.name) for (const s of [-1, 1]) { const n = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.24), opts.name); const ns = h.top(0.86); n.position.set(ns.x, ns.top - 0.18, s * (ns.hb + 0.015)); n.rotation.y = s < 0 ? Math.PI : 0; n.rotation.y += s * -0.18; body.add(n); }
  if (opts.plank !== false) bx(body, 1.0, 0.07, 1.4, woodMat(0xb08860), 0, F + 0.4, B / 2 + 0.55).rotation.x = -0.25;
  for (const fx of [-L * 0.2, L * 0.1]) for (const s of [-1, 1]) fender(body, fx, 0.3, s * (h.top((fx + L / 2) / L).hb + 0.07));
  return g;
}

// ===================================================================== the motor cruiser / speedboat
// A white GRP cruiser with a little cabin, windscreen and pulpit rail; speed: true makes a low smugglers' speedboat
// with a wrap-round screen and twin outboards. opts: L, B, hull, stripe, speed, crew, moving
export function makeCruiser(opts = {}) {
  const speed = !!opts.speed, L = opts.L || (speed ? 6.5 : 7), B = opts.B || (speed ? 2.1 : 2.4), F = speed ? 0.5 : 0.6;
  const { g, body } = shell(L, B, { moving: opts.moving, phase: opts.phase, heavy: speed ? 1 : 1.4 });
  const o = { L, B, D: 0.4, F, bow: 'point', stern: 0.85, sheer: speed ? 0.12 : 0.22, p: 0.85, flare: 0.22, nL: 22, nS: 6, rough: 0.3 };
  const h = hull(body, o, [[0.04, PAL.navy], [0.12, opts.stripe ?? PAL.saffron], [F - 0.12, opts.hull ?? PAL.white], [F - 0.06, opts.stripe ?? PAL.saffron], [9, opts.hull ?? PAL.white]], { key: 'c' + speed + (opts.stripe || '') + (opts.hull || '') });
  deck(body, h, woodMat(0xc8a070), -0.01, 0.02, 0.98); dryWell(body, h);
  tube(body, gunwale(h, 16, 0.02), 0.035, lam(0xdcdcdc), true, 70);
  const white = lam(opts.hull ?? PAL.white);
  if (speed) {
    deck(body, h, white, 0.006, 0.48, 0.995, 0.01); // the white foredeck over the wooden cockpit floor
    const sc = new THREE.Mesh(new THREE.CylinderGeometry(B * 0.38, B * 0.38, 0.4, 14, 1, true, 0, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.05, metalness: 0.6, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); sc.scale.set(0.5, 1, 1); sc.position.set(-L * 0.08, F + 0.42, 0); sc.rotation.z = 0.35; body.add(sc);
    for (const s of [-1, 1]) { bx(body, 0.6, 0.35, 0.55, lam(PAL.clove), -L * 0.22, F + 0.17, s * 0.38); bx(body, 0.1, 0.45, 0.55, lam(PAL.clove), -L * 0.38, F + 0.35, s * 0.38); }
    const s0 = h.top(0); u(g).prop = outboard(body, s0.x - 0.02, s0.top - 0.05, -0.35, 1.1, 0x1a1a1e); outboard(body, s0.x - 0.02, s0.top - 0.05, 0.35, 1.1, 0x1a1a1e);
  } else {
    const cx0 = -L * 0.12, cx1 = L * 0.22, cw = B * 0.66;
    bx(body, cx1 - cx0, 0.55, cw, white, (cx0 + cx1) / 2, F + 0.27, 0, true);
    const top = bx(body, cx1 - cx0 + 0.3, 0.06, cw + 0.1, white, (cx0 + cx1) / 2 - 0.1, F + 0.58, 0, true);
    for (const s of [-1, 1]) bx(body, (cx1 - cx0) * 0.7, 0.22, 0.02, winMat(), (cx0 + cx1) / 2, F + 0.33, s * (cw / 2 + 0.005));
    const ws = bx(body, 0.03, 0.5, cw * 0.95, glassMat(), cx0 - 0.05, F + 0.85, 0); ws.rotation.z = -0.3;
    bx(body, 0.04, 0.6, 0.04, lam(0xdcdcdc), cx0 - 1.1, F + 0.9, 0); // the canopy frame
    const bim = bx(body, 1.3, 0.04, cw + 0.2, lam(opts.canopy ?? PAL.cumin), cx0 - 0.55, F + 1.2, 0); bim.castShadow = true;
    bx(body, 0.05, 0.62, 0.05, lam(0xdcdcdc), cx0 - 0.02, F + 0.9, -cw / 2); bx(body, 0.05, 0.62, 0.05, lam(0xdcdcdc), cx0 - 0.02, F + 0.9, cw / 2);
    for (const s of [-1, 1]) bx(body, 1.0, 0.3, 0.35, lam(PAL.cream), cx0 - 0.7, F + 0.15, s * B * 0.27);
    // the pulpit rail round the bow
    const pts = []; for (let i = 0; i <= 5; i++) { const s = h.top(0.6 + i * 0.075); pts.push([s.x, s.top, -(s.hb - 0.06)]); } for (let i = 5; i >= 0; i--) { const s = h.top(0.6 + i * 0.075); pts.push([s.x, s.top, s.hb - 0.06]); }
    rail(body, pts.filter((_, i) => i !== 5), 0.42, 0.016);
    const s0 = h.top(0); u(g).prop = outboard(body, s0.x - 0.02, s0.top - 0.05, 0, 1.1);
    flag(body, s0.x + 0.1, s0.top, 0.6, 'nl', 1.0);
    for (const fx of [-L * 0.2, L * 0.15]) fender(body, fx, 0.25, -(h.top((fx + L / 2) / L).hb + 0.06));
  }
  seatCrew(body, opts.crew, [[-L * 0.22, F - 0.05, -0.4, Math.PI / 2, 0.38], [-L * 0.22, F - 0.05, 0.4, Math.PI / 2, 0.38], [-L * 0.32, F - 0.05, 0, Math.PI / 2, 0.38]], opts.sit);
  return g;
}
