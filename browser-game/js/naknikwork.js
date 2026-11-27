// The Naknikim at work (Tristan 2026-11-15): between stints of stirring at their mixing table they run little jobs around
// De Loods: grab a sack from the pile by the table, a dock pallet or the racking, carry it across, put it on a rack beam,
// top up the pile, tip it into the menger, the mill or the kruidenketel, or take the big paddle and stir around the ketel.
// Paths: a coarse grid over the warehouse rooms, blocked by the game's own solids (walls, tables, racks, machines), A* plus
// string pulling. Poses: layered on the mocap base pose through the character's ps2 `extra` hook (js/characters.js), so the
// legs keep walking on motion capture while the arms carry, reach, pour and stir.
import * as THREE from '../vendor/three.module.min.js';

const X = [1, 0, 0], Y = [0, 1, 0];
const CELL = 0.3, PAD = 0.28, ROOM_PAD = 0.3;
const SPICE = [0xc2412d, 0x8a5a2a, 0xe2a21a, 0x9aa04a, 0xa0562a, 0xe86a1a];
const lerp = (a, b, k) => a + (b - a) * k;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// arm / body poses (radians): lo = arm lowered from the A-pose, ax = arm raised forward (negative), ay = arm turned inward,
// el = elbow bend, sp = bend at the waist, cr = crouch, on = how much the arms leave the mocap swing
const POSE = {
  none: { on: 0, lo: 0.5, ax: 0, ay: 0, el: 0.25, sp: 0, cr: 0 },
  carry: { on: 1, lo: 0.66, ax: -0.72, ay: 0.5, el: 1.5, sp: -0.08, cr: 0 },
  floor: { on: 1, lo: 0.6, ax: -1.05, ay: 0.32, el: 0.3, sp: 0.6, cr: 0.5 },
  mid: { on: 1, lo: 0.66, ax: -1.3, ay: 0.36, el: 0.45, sp: 0.18, cr: 0 },
  high: { on: 1, lo: 0.66, ax: -2.55, ay: 0.28, el: 0.35, sp: -0.1, cr: 0 },
  pour: { on: 1, lo: 0.66, ax: -2.05, ay: 0.42, el: 1.05, sp: -0.06, cr: 0 },
  stir: { on: 1, lo: 0.66, ax: -1.4, ay: 0.38, el: 0.85, sp: 0.22, cr: 0 }, // hands at shoulder height: the tables come up to a Naknik's chest
  push: { on: 1, lo: 0.66, ax: -0.95, ay: 0.16, el: 0.35, sp: 0.2, cr: 0 }, // both hands on the handle of a steekwagen or a pallet truck
  pack: { on: 1, lo: 0.66, ax: -1.25, ay: 0.46, el: 1.05, sp: 0.26, cr: 0 }, // scooping blend into a blue bag at the packing table
};
const KEYS = ['on', 'lo', 'ax', 'ay', 'el', 'sp', 'cr'];

export function createNaknikWork(deps) {
  const { scene, solids, animate } = deps;
  const lam = (o) => new THREE.MeshLambertMaterial(o);

  // ---------------------------------------------------------------- props
  const burlap = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#c8b088'; g.fillRect(0, 0, 64, 64);
    g.globalAlpha = 0.25; g.strokeStyle = '#7a6040'; for (let i = 0; i < 64; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); }
    g.globalAlpha = 1; g.fillStyle = '#b8402a'; g.fillRect(18, 22, 28, 20); g.fillStyle = '#f2ead8'; g.font = 'bold 13px sans-serif'; g.textAlign = 'center'; g.fillText('E', 32, 37);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const sackGeo = new THREE.BoxGeometry(0.34, 0.24, 0.26), tieGeo = new THREE.CylinderGeometry(0.05, 0.09, 0.08, 6);
  const sackMat = lam({ map: burlap });
  function makeSack() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(sackGeo, sackMat); b.castShadow = true; g.add(b);
    const t = new THREE.Mesh(tieGeo, lam({ color: 0xc8b088 })); t.position.y = 0.15; g.add(t);
    return g;
  }
  const paddleGeo = new THREE.CylinderGeometry(0.026, 0.026, 1, 6); paddleGeo.translate(0, -0.5, 0);
  const bladeGeo = new THREE.BoxGeometry(0.14, 0.2, 0.03);
  const woodMat = lam({ color: 0x8a6438 });
  function makePaddle() {
    const g = new THREE.Group(); const s = new THREE.Mesh(paddleGeo, woodMat); g.add(s); g.userData.shaft = s;
    const b = new THREE.Mesh(bladeGeo, woodMat); g.add(b); g.userData.blade = b; return g;
  }
  // sacks left on a rack beam: they stay a while, then count as stock on the pallets
  const placed = [];
  function placeSack(p, ry) {
    const s = makeSack(); s.position.copy(p); s.rotation.y = ry + rnd(-0.3, 0.3); scene.add(s); placed.push({ s, life: rnd(35, 60) });
    while (placed.length > 14) scene.remove(placed.shift().s);
  }
  // a stream of spice from a tipped sack
  const streams = [];
  const streamGeo = new THREE.CylinderGeometry(0.03, 0.05, 1, 6); streamGeo.translate(0, -0.5, 0);
  function pourStream(from, toY, col, dur) {
    const m = new THREE.Mesh(streamGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, depthWrite: false }));
    m.position.copy(from); m.scale.y = Math.max(0.05, from.y - toY); scene.add(m); streams.push({ m, t: dur, d: dur });
  }

  // ---------------------------------------------------------------- the kruidenketel: a big iron pot on a gas ring
  const swirl = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, '#e8862a'); gr.addColorStop(1, '#a8401a'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(255,214,140,0.55)'; g.lineWidth = 4;
    for (let a = 0; a < 3; a++) { g.beginPath(); for (let k = 0; k < 60; k++) { const r = k * 1.05, t = k * 0.12 + a * 2.1; g.lineTo(64 + Math.cos(t) * r, 64 + Math.sin(t) * r); } g.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const ketels = (deps.ketels || []).map((k) => {
    const g = new THREE.Group(); g.position.set(k.x, 0, k.z); g.visible = false; scene.add(g);
    const iron = new THREE.MeshPhongMaterial({ color: 0x2a2a2c, shininess: 40 }), steel = new THREE.MeshPhongMaterial({ color: 0x6a6e74, shininess: 60 });
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, l = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.32, 0.06), steel); l.position.set(Math.cos(a) * 0.42, 0.16, Math.sin(a) * 0.42); g.add(l); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.03, 6, 20), steel); ring.rotation.x = Math.PI / 2; ring.position.y = 0.32; g.add(ring);
    const flame = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 0.06, 14), new THREE.MeshBasicMaterial({ color: 0x4a7aff, transparent: true, opacity: 0.75 })); flame.position.y = 0.27; g.add(flame);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.46, 0.62, 18, 1, true), new THREE.MeshPhongMaterial({ color: 0x2a2a2c, shininess: 40, side: THREE.DoubleSide })); pot.position.y = 0.66; pot.castShadow = true; g.add(pot);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(0.46, 18), iron); bottom.rotation.x = -Math.PI / 2; bottom.position.y = 0.36; g.add(bottom);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.035, 6, 24), iron); rim.rotation.x = Math.PI / 2; rim.position.y = 0.97; g.add(rim);
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.02, 5, 10, Math.PI), iron); h.position.set(s * 0.62, 0.88, 0); h.rotation.y = Math.PI / 2; h.rotation.z = s > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(h); }
    const soup = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshLambertMaterial({ map: swirl, emissive: 0x401400 })); soup.rotation.x = -Math.PI / 2; soup.position.y = 0.88; g.add(soup);
    const bub = [], steam = [];
    for (let i = 0; i < 5; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshLambertMaterial({ color: 0xf0a040 })); b.visible = false; g.add(b); bub.push({ m: b, t: rnd(0, 1.5) }); }
    for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshBasicMaterial({ color: 0xf4efe6, transparent: true, opacity: 0, depthWrite: false })); g.add(s); steam.push({ m: s, t: i * 0.8 }); }
    const sol = deps.solid(k.x - 0.66, k.x + 0.66, k.z - 0.66, k.z + 0.66); sol.off = true;
    return { ...k, g, soup, bub, steam, sol, stirBy: null, spin: 0.4, area: k.area };
  });
  function updateKetels(dt) {
    for (const k of ketels) {
      const on = k.on(); if (on !== k.g.visible) { k.g.visible = on; k.sol.off = !on; }
      if (!on || !k.g.visible) continue;
      k.spin += ((k.stirBy ? 2.6 : 0.35) - k.spin) * Math.min(1, dt * 2);
      k.soup.rotation.z += dt * k.spin;
      for (const b of k.bub) { b.t -= dt; if (b.t <= 0) { b.t = rnd(0.5, 1.4); const a = rnd(0, 6.3), r = rnd(0, 0.42); b.m.position.set(Math.cos(a) * r, 0.88, Math.sin(a) * r); b.m.scale.setScalar(0.2); b.m.visible = true; } const s = Math.min(1.4, (1.4 - b.t) * 2.5); b.m.scale.setScalar(Math.max(0.2, s)); if (b.t < 0.12) b.m.visible = false; }
      for (const s of k.steam) { s.t += dt * (k.stirBy ? 0.9 : 0.6); const u = (s.t % 3.2) / 3.2; s.m.position.set(Math.sin(s.t * 1.3) * 0.15, 1.0 + u * 1.6, Math.cos(s.t) * 0.12); s.m.scale.setScalar(0.5 + u * 1.2); s.m.material.opacity = 0.2 * Math.sin(u * Math.PI); }
    }
  }

  // ---------------------------------------------------------------- walking grid
  let grid = null, gridAt = -1e9;
  function buildGrid() {
    const rooms = deps.rooms();
    let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
    for (const r of rooms) { x0 = Math.min(x0, r.x0); x1 = Math.max(x1, r.x1); z0 = Math.min(z0, r.z0); z1 = Math.max(z1, r.z1); }
    const w = Math.ceil((x1 - x0) / CELL), h = Math.ceil((z1 - z0) / CELL), f = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const cx = x0 + (i + 0.5) * CELL, cz = z0 + (j + 0.5) * CELL;
      for (const r of rooms) if (cx > r.x0 + ROOM_PAD && cx < r.x1 - ROOM_PAD && cz > r.z0 + ROOM_PAD && cz < r.z1 - ROOM_PAD) { f[j * w + i] = 1; break; }
    }
    for (const s of solids) {
      if (s.off || s.maxx < x0 || s.minx > x1 || s.maxz < z0 || s.minz > z1) continue;
      const i0 = Math.max(0, Math.floor((s.minx - PAD - x0) / CELL)), i1 = Math.min(w - 1, Math.floor((s.maxx + PAD - x0) / CELL));
      const j0 = Math.max(0, Math.floor((s.minz - PAD - z0) / CELL)), j1 = Math.min(h - 1, Math.floor((s.maxz + PAD - z0) / CELL));
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const cx = x0 + (i + 0.5) * CELL, cz = z0 + (j + 0.5) * CELL;
        if (cx > s.minx - PAD && cx < s.maxx + PAD && cz > s.minz - PAD && cz < s.maxz + PAD) f[j * w + i] = 0;
      }
    }
    grid = { x0, z0, w, h, f }; gridAt = performance.now();
  }
  const freshGrid = () => { if (!grid || performance.now() - gridAt > 2500) buildGrid(); return grid; };
  const cellOf = (G, x, z) => [Math.floor((x - G.x0) / CELL), Math.floor((z - G.z0) / CELL)];
  const free = (G, i, j) => i >= 0 && j >= 0 && i < G.w && j < G.h && G.f[j * G.w + i] === 1;
  const centre = (G, i, j) => ({ x: G.x0 + (i + 0.5) * CELL, z: G.z0 + (j + 0.5) * CELL });
  function snap(G, x, z) {
    const [ci, cj] = cellOf(G, x, z); if (free(G, ci, cj)) return [ci, cj];
    let best = null, bd = 1e9;
    for (let r = 1; r <= 8 && !best; r++) for (let j = cj - r; j <= cj + r; j++) for (let i = ci - r; i <= ci + r; i++) {
      if (Math.max(Math.abs(i - ci), Math.abs(j - cj)) !== r || !free(G, i, j)) continue;
      const c = centre(G, i, j), d = (c.x - x) ** 2 + (c.z - z) ** 2; if (d < bd) { bd = d; best = [i, j]; }
    }
    return best;
  }
  function los(G, a, b) {
    const d = Math.hypot(b.x - a.x, b.z - a.z), n = Math.ceil(d / (CELL * 0.4));
    for (let k = 1; k < n; k++) { const t = k / n, [i, j] = cellOf(G, a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t); if (!free(G, i, j)) return false; }
    return true;
  }
  function findPath(from, to) {
    const G = freshGrid(), s = snap(G, from.x, from.z), e = snap(G, to.x, to.z);
    if (!s || !e) return null;
    const W = G.w, N = W * G.h, si = s[1] * W + s[0], ei = e[1] * W + e[0];
    const gs = new Float32Array(N).fill(1e9), came = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
    const heap = []; const push = (i, f) => { heap.push([f, i]); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] <= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { const l = 2 * k + 1, r = l + 1; let m = k; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const hx = (i) => { const dx = Math.abs((i % W) - e[0]), dz = Math.abs(((i / W) | 0) - e[1]); return Math.max(dx, dz) + 0.414 * Math.min(dx, dz); };
    gs[si] = 0; push(si, hx(si));
    let found = si === ei;
    while (heap.length && !found) {
      const [, c] = pop(); if (closed[c]) continue; closed[c] = 1;
      if (c === ei) { found = true; break; }
      const ci = c % W, cj = (c / W) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const ni = ci + di, nj = cj + dj; if (!free(G, ni, nj)) continue;
        if (di && dj && (!free(G, ci + di, cj) || !free(G, ci, cj + dj))) continue; // no corner cutting
        const n = nj * W + ni; if (closed[n]) continue;
        const g = gs[c] + (di && dj ? 1.414 : 1); if (g < gs[n]) { gs[n] = g; came[n] = c; push(n, g + hx(n)); }
      }
    }
    if (!found) return null;
    const cells = []; for (let c = ei; c !== -1; c = c === si ? -1 : came[c]) cells.push(centre(G, c % W, (c / W) | 0));
    cells.reverse();
    // string pulling
    const out = [cells[0]];
    for (let k = 1; k < cells.length; k++) { if (k === cells.length - 1 || !los(G, out[out.length - 1], cells[k + 1])) out.push(cells[k]); }
    const pts = [];
    if (Math.hypot(out[0].x - from.x, out[0].z - from.z) > 0.15) pts.push(out[0]);
    for (let k = 1; k < out.length; k++) pts.push(out[k]);
    pts.push({ x: to.x, z: to.z });
    return pts;
  }

  // ---------------------------------------------------------------- one Naknik's job
  const busy = new Map(); // station key -> Naknik
  // his place at the table: the spots along the long side step a little closer, so the paddle reaches the bowl
  const homeOf = (n) => {
    const t = n.userData.target, f = n.userData.face, dx = f[0] - t.x, dz = f[1] - t.z, d = Math.hypot(dx, dz);
    const k = Math.abs(dz) > Math.abs(dx) && d > 1 ? 0.3 / d : 0;
    return { x: t.x + dx * k, z: t.z + dz * k };
  };
  const bowlOf = (n) => new THREE.Vector3(n.userData.face[0], 1.3, n.userData.face[1]);
  function init(n) {
    const u = n.userData; if (u.work) return u.work;
    const W = u.work = { plan: [], step: null, path: null, t: rnd(2, 9), stir: 0, pp: { ...POSE.none }, pose: 'stir', sack: null, sackCol: pick(SPICE), tilt: 0, paddle: makePaddle(), ph: Math.random() * 6, keys: [] };
    const h = homeOf(n); u.workArea = h.z > -21 ? 'shed' : h.x < -11 ? 'tent' : 'hall';
    W.paddle.visible = false; n.add(W.paddle);
    W.sack = new THREE.Group(); W.sack.visible = false; n.add(W.sack); W.carry = {};
    W.carry.sack = makeSack(); W.sack.add(W.carry.sack);
    for (const [k, f] of Object.entries(deps.carry || {})) { const m = f(); m.visible = false; W.sack.add(m); W.carry[k] = m; } // the production line's vat, bucket and blue bag (js/productie.js)
    if (u.ps2) u.ps2.extra = (R, rot, lower, hinge) => poseArms(W, R, rot, lower, hinge);
    return W;
  }
  function poseArms(W, R, rot, lower, hinge) {
    const P = W.pp, k = P.on, st = W.pose === 'stir' || W.pose === 'ketel' ? 1 : W.pose === 'pack' ? 0.55 : 0;
    if (k > 0.02) for (const s of [-1, 1]) {
      const u = s > 0 ? 'uarmL' : 'uarmR', f = s > 0 ? 'farmL' : 'farmR', h = s > 0 ? 'handL' : 'handR';
      delete R[u]; delete R[f]; delete R[h];
      // stirring: the paddle hand circles, the other follows half a beat behind
      const ph = W.ph + (s > 0 ? 0.9 : 0), cx = st * Math.sin(ph) * (s > 0 ? 0.2 : 0.28), cy = st * Math.cos(ph) * 0.16;
      lower(s, lerp(0.5, P.lo, k)); rot(u, X, (P.ax + cx) * k); rot(u, Y, -s * (P.ay + cy) * k); rot(f, hinge(s), lerp(0.25, P.el + st * Math.sin(ph + 1.2) * 0.2, k));
    }
    if (Math.abs(P.sp) > 0.005) { rot('spine', X, P.sp * 0.6); rot('chest', X, P.sp * 0.4); }
    if (st && k > 0.5) rot('chest', Y, Math.sin(W.ph) * 0.12);
    if (P.cr > 0.01) { const c = P.cr; rot('thighL', X, -1.3 * c); rot('thighR', X, -1.2 * c); rot('shinL', X, 2.0 * c); rot('shinR', X, 1.9 * c); rot('footL', X, -0.7 * c); rot('footR', X, -0.7 * c); }
  }
  const fist = new THREE.Vector3(), fist2 = new THREE.Vector3(), tmp = new THREE.Vector3();
  function hands(n) { // world positions of both fists (from last frame's pose)
    const a = n.userData.arms; a[0].updateWorldMatrix(true, false); a[1].updateWorldMatrix(true, false);
    fist.set(0, -0.68, 0.05).applyMatrix4(a[0].matrixWorld); fist2.set(0, -0.68, 0.05).applyMatrix4(a[1].matrixWorld);
  }
  const hold = (W, kind) => { const kk = W.carry[kind] ? kind : 'sack'; W.floor = W.carry[kk].userData.floor || 0; for (const [k, m] of Object.entries(W.carry)) m.visible = k === kk; if (W.carry[kind] && W.carry[kind].userData.paint) W.carry[kind].userData.paint(); };
  const pace = (n) => (deps.pace ? deps.pace(n) : null) || { speed: 1, rest: 1 }; // Tempo and Werkethiek of this Naknik (js/crew.js)
  function release(W) { for (const k of W.keys) busy.delete(k); W.keys = []; }
  function reserve(W, n, key) { if (!key) return true; if (busy.has(key) && busy.get(key) !== n) return false; busy.set(key, n); W.keys.push(key); return true; }

  // what this Naknik could do now: { grab: [...], store: [...], pour: [...], ketel: [...] } from the sites near him
  function options(n) {
    const S = deps.stations(n), home = homeOf(n), near = (s) => Math.hypot(s.x - home.x, s.z - home.z);
    const ok = (s) => near(s) < (s.far ? 80 : s.area === n.userData.workArea ? 30 : 16) && !(busy.has(s.key) && busy.get(s.key) !== n);
    const by = (f) => S.filter((s) => f(s) && ok(s)).sort((a, b) => near(a) - near(b));
    const line = {}; for (const s of S) if (s.prod && ok(s)) (line[s.prod] || (line[s.prod] = [])).push(s); // the production line: vat, mixer, scoop, pack, hopper, belt, out
    return { grab: by((s) => s.grab && !s.prod), store: by((s) => s.store && !s.prod), drop: by((s) => s.kind === 'pile'), pour: by((s) => s.pour && !s.prod), line, all: S };
  }
  const nearPick = (list, k = 3) => (list.length ? list[Math.floor(Math.random() * Math.min(k, list.length))] : null);
  function planErrand(n) {
    const crew = deps.list(); // Naknikim the siege dragged off leave their spots free
    for (const [k, v] of busy) if (!crew.includes(v)) busy.delete(k);
    for (const k of ketels) if (k.stirBy && !crew.includes(k.stirBy)) k.stirBy = null;
    const W = n.userData.work, o = options(n), home = homeOf(n), bowl = bowlOf(n);
    const kets = ketels.filter((k) => k.g.visible && !k.stirBy && Math.hypot(k.x - home.x, k.z - home.z) < 16);
    const kinds = [];
    if (o.grab.length && o.store.length) kinds.push('store', 'store');
    if (o.grab.length && o.drop.length) kinds.push('restock');
    if (o.grab.length && (o.pour.length || kets.length)) kinds.push('feed', 'feed');
    if (o.grab.length) kinds.push('bowl');
    if (kets.length) kinds.push('ketel', 'ketel');
    // the line comes first while today's batch isn't done: vaten into the mixer, blend into blue bags, bags onto the pallet
    const Ln = o.line, lk = [];
    if (Ln.vat && Ln.mixer) lk.push('l-vat', 'l-vat');
    if (Ln.scoop && Ln.pack && Ln.out) lk.push('l-pack', 'l-pack');
    if (Ln.scoop && Ln.hopper) lk.push('l-feed', 'l-feed');
    if (Ln.belt && Ln.out) lk.push('l-belt', 'l-belt', 'l-belt');
    if (Ln.haulA && Ln.haulB) lk.push('l-haul');
    const truck = !!(Ln.truckA && Ln.truckB); // a goods truck is in (js/goederen.js): the pallets come first
    if ((lk.length || truck) && (truck || Math.random() < 0.8 || !kinds.length)) {
      const kd = truck && (Math.random() < 0.75 || lk.length === 0) ? 'l-truck' : pick(lk), one = (a) => a[Math.floor(Math.random() * a.length)];
      const steps = kd === 'l-vat' ? [[one(Ln.vat), 'grab'], [Ln.mixer[0], 'pour']] : kd === 'l-pack' ? [[Ln.scoop[0], 'grab'], [Ln.pack[0], 'pack'], [Ln.out[0], 'drop']] : kd === 'l-feed' ? [[Ln.scoop[0], 'grab'], [Ln.hopper[0], 'pour']] : kd === 'l-haul' ? [[one(Ln.haulA), 'grab'], [one(Ln.haulB), 'drop']] : kd === 'l-truck' ? [[one(Ln.truckA), 'grab'], [one(Ln.truckB), 'drop']] : [[Ln.belt[0], 'grab'], [Ln.out[0], 'drop']];
      if (steps.every(([s]) => reserve(W, n, s.key))) {
        const plan = []; for (const [s, act] of steps) plan.push({ go: s }, { act, s });
        plan.push({ go: { x: home.x, z: home.z, fx: bowl.x, fz: bowl.z, home: true } });
        W.plan = plan; W.step = null; return true;
      }
      release(W);
    }
    if (!kinds.length) return false;
    const kind = pick(kinds), plan = [];
    if (kind === 'ketel') { const k = pick(kets); k.stirBy = n; W.ketel = k; plan.push({ ketel: k, dur: rnd(9, 15) }); }
    else {
      let src = nearPick(o.grab.filter((s) => s.kind !== 'pile' || kind !== 'restock'));
      if (!src) return false;
      let dst = null;
      if (kind === 'store') dst = nearPick(o.store.filter((s) => s.key !== src.key));
      else if (kind === 'restock') dst = o.drop.find((s) => s.key !== src.key) || null;
      else if (kind === 'feed') { const pool = o.pour.concat(kets.map((k) => ketelPour(k))); dst = nearPick(pool.sort((a, b) => Math.hypot(a.x - home.x, a.z - home.z) - Math.hypot(b.x - home.x, b.z - home.z)), 2); }
      else dst = { kind: 'bowl', x: home.x, z: home.z, fx: bowl.x, fz: bowl.z, h: 'mid', pour: true, ty: 1.3 };
      if (!dst) return false;
      if (!reserve(W, n, src.key) || !reserve(W, n, dst.key)) { release(W); return false; }
      plan.push({ go: src }, { act: 'grab', s: src }, { go: dst }, { act: dst.pour ? 'pour' : dst.kind === 'pile' ? 'drop' : 'store', s: dst });
    }
    plan.push({ go: { x: home.x, z: home.z, fx: bowl.x, fz: bowl.z, home: true } });
    W.plan = plan; W.step = null;
    return true;
  }
  const ketelPour = (k) => { const a = rnd(0, Math.PI * 2); return { kind: 'ketel', key: null, x: k.x + Math.cos(a) * 1.0, z: k.z + Math.sin(a) * 1.0, fx: k.x, fz: k.z, h: 'pour', pour: true, ty: 0.9, area: k.area }; };

  // at most half of a table's Naknikim (rounded up) are off on a job at once, so the bowl keeps turning
  function mayLeave(n) {
    let out = 0, all = 0;
    for (const m of deps.list()) { if (!m.userData.work || m.userData.workArea !== n.userData.workArea) continue; all++; if (m.userData.work.plan.length) out++; }
    return out < Math.max(1, Math.ceil(all / 2));
  }

  function face(n, x, z, dt, rate = 6) {
    const want = Math.atan2(x - n.position.x, z - n.position.z); let d = want - n.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    n.rotation.y += d * Math.min(1, dt * rate); return Math.abs(d);
  }
  function setPose(W, name) { W.pose = name; }
  function blend(W, dt) {
    const T = POSE[W.pose === 'ketel' ? 'stir' : W.pose] || POSE.none, k = Math.min(1, dt * 7);
    for (const key of KEYS) W.pp[key] += (T[key] - W.pp[key]) * k;
  }

  // walk along W.path; returns true on arrival
  function walk(n, W, dt, speed) {
    const p = W.path; if (!p || !p.length) return true;
    const w = p[0], dx = w.x - n.position.x, dz = w.z - n.position.z, d = Math.hypot(dx, dz);
    if (d < 0.08) { p.shift(); if (!p.length) return true; }
    const st = Math.min(d, speed * dt); n.position.x += dx / (d || 1) * st; n.position.z += dz / (d || 1) * st;
    face(n, w.x, w.z, dt, 9);
    animate(n, speed, dt);
    return false;
  }

  function update(n, dt, napping) {
    const u = n.userData, W = init(n);
    if (!n.visible) { reset(n); return false; }
    if (deps.frozen && deps.frozen(n)) { animate(n, 0, dt); return false; } // Eddy is talking to him
    W.ph += dt * 5.5;
    const home = homeOf(n), atHome = Math.hypot(n.position.x - home.x, n.position.z - home.z) < 0.12;
    if (napping && !W.plan.length && atHome) { W.pp = { ...POSE.none }; W.pose = 'none'; W.paddle.visible = false; W.sack.visible = false; u.body.position.y = 0; return true; }
    if (napping && W.plan.length && !(W.plan[0].go && W.plan[0].go.home)) { drop(n, W); W.plan = [{ go: { x: home.x, z: home.z, fx: W.plan.length ? bowlOf(n).x : 0, fz: bowlOf(n).z, home: true } }]; W.step = null; W.path = null; }
    u.body.rotation.x = 0;

    if (!W.plan.length) {
      if (!atHome) { W.plan = [{ go: { x: home.x, z: home.z, fx: bowlOf(n).x, fz: bowlOf(n).z, home: true } }]; }
      else { // stir at the table
        face(n, u.face[0], u.face[1], dt);
        setPose(W, 'stir'); animate(n, 0, dt);
        W.t -= dt;
        if (W.t <= 0 && !napping) {
          if (mayLeave(n) && planErrand(n)) { /* off he goes */ } else W.t = rnd(2, 5);
        }
      }
    }
    if (W.plan.length) runPlan(n, W, dt);
    blend(W, dt);
    props(n, W, dt);
    // crouch: the body sinks with the knees
    u.body.position.y = -0.4 * W.pp.cr * (u.body.scale.y || 1);
    return false;
  }

  function runPlan(n, W, dt) {
    const s = W.plan[0];
    if (!W.step) { W.step = s; W.st = 0; if (s.go) { W.path = findPath(n.position, s.go); if (!W.path) { abort(n, W); return; } } if (s.ketel) { const k = s.ketel; W.orbit = Math.atan2(n.position.z - k.z, n.position.x - k.x); W.path = findPath(n.position, { x: k.x + Math.cos(W.orbit) * 1.0, z: k.z + Math.sin(W.orbit) * 1.0 }); if (!W.path) { abort(n, W); return; } W.circling = false; } }
    W.st += dt;
    const next = () => { W.plan.shift(); W.step = null; W.path = null; };
    if (s.go) {
      setPose(W, W.sack.visible ? (W.floor ? 'push' : 'carry') : 'none');
      if (walk(n, W, dt, (W.sack.visible ? (W.floor ? 1.25 : 1.5) : 1.9) * pace(n).speed)) {
        if (face(n, s.go.fx, s.go.fz, dt, 8) < 0.15 || W.st > 30) { if (s.go.home) { release(W); W.t = rnd(7, 18) * pace(n).rest * (deps.lineBusy && deps.lineBusy() ? 0.2 : 1); } next(); }
        else animate(n, 0, dt);
      }
      return;
    }
    if (s.ketel) { // stir around the ketel with the big paddle, walking slowly round it
      const k = s.ketel;
      if (!W.circling) { setPose(W, 'none'); if (walk(n, W, dt, 1.9)) { W.circling = true; W.st = 0; } return; }
      setPose(W, 'ketel');
      W.orbit += dt * 0.32;
      const tx = k.x + Math.cos(W.orbit) * 1.0, tz = k.z + Math.sin(W.orbit) * 1.0, sp = Math.hypot(tx - n.position.x, tz - n.position.z) / Math.max(dt, 1e-3);
      n.position.x = tx; n.position.z = tz; face(n, k.x, k.z, dt, 5);
      animate(n, Math.min(0.45, sp), dt);
      if (W.st > s.dur) { k.stirBy = null; W.ketel = null; next(); }
      return;
    }
    // acts at a station
    const st = s.s; face(n, st.fx, st.fz, dt, 8); animate(n, 0, dt);
    const h = (s.act === 'grab' ? st.hg : st.hs) || st.h || 'mid';
    if (s.act === 'grab') {
      setPose(W, W.st < 0.85 ? h : W.floor ? 'push' : 'carry');
      if (W.st > 0.5 && !W.sack.visible) { W.sack.visible = true; W.sackCol = st.col || pick(SPICE); if (st.onGrab) { const c = st.onGrab(W); if (c) W.sackCol = c; } hold(W, st.carry || 'sack'); }
      if (W.st > 1.25) next();
    } else if (s.act === 'store' || s.act === 'drop') {
      setPose(W, W.st < 0.75 ? h : 'none');
      if (W.st > 0.6 && W.sack.visible) { W.sack.visible = false; if (s.act === 'store' && st.put) placeSack(st.put, n.rotation.y); if (st.onDrop) st.onDrop(n); }
      if (W.st > 1.1) next();
    } else if (s.act === 'pack') { // at the packing table: the bucket goes down, he scoops and weighs, and a labelled blue bag comes up
      setPose(W, W.st < 3.0 ? 'pack' : 'carry');
      if (W.st > 0.5 && W.st < 3.0) W.sack.visible = false;
      if (W.st >= 3.0 && !W.sack.visible) { W.sack.visible = true; hold(W, 'zak'); if (st.onPack) st.onPack(n); }
      if (W.st > 3.5) next();
    } else if (s.act === 'pour') {
      if (W.floor) hold(W, 'vat'); // off the steekwagen: he lifts the vat to tip it
      setPose(W, W.st < 2.1 ? 'pour' : 'none');
      W.tilt = W.st > 0.6 && W.st < 2.0 ? Math.min(1, (W.st - 0.6) * 3) : Math.max(0, W.tilt - dt * 4);
      if (W.st > 0.8 && W.st < 1.9 && !W.poured) { W.poured = true; tmp.copy(W.sack.position); n.localToWorld(tmp); pourStream(tmp.setY(tmp.y - 0.08), st.ty || 1.0, W.sackCol, 1.1); if (st.onPour) st.onPour(n); if (deps.onPour) deps.onPour(n, st); }
      if (W.st > 2.0 && W.sack.visible) W.sack.visible = false;
      if (W.st > 2.4) { W.poured = false; W.tilt = 0; next(); }
    } else next();
  }
  function drop(n, W) { W.sack.visible = false; W.tilt = 0; if (W.ketel) { W.ketel.stirBy = null; W.ketel = null; } release(W); }
  function abort(n, W) { drop(n, W); W.plan = []; W.step = null; W.path = null; const home = homeOf(n); if (Math.hypot(n.position.x - home.x, n.position.z - home.z) > 0.12) { const p = findPath(n.position, home); if (p) { W.plan = [{ go: { ...home, fx: bowlOf(n).x, fz: bowlOf(n).z, home: true } }]; } else { n.position.set(home.x, 0, home.z); } } W.t = rnd(4, 8); }
  function reset(n) {
    const W = n.userData.work; if (!W) return;
    drop(n, W); W.plan = []; W.step = null; W.path = null; W.pp = { ...POSE.none }; W.pose = 'stir';
    const home = homeOf(n); n.position.set(home.x, 0, home.z); n.rotation.y = Math.atan2(n.userData.face[0] - home.x, n.userData.face[1] - home.z);
    W.paddle.visible = false; n.userData.body.position.y = 0; W.t = rnd(3, 9);
  }

  // the sack follows both fists, the paddle runs from the paddle hand into the bowl or the ketel
  function props(n, W, dt) {
    const stirring = (W.pose === 'stir' && !W.plan.length) || (W.pose === 'ketel' && W.circling);
    if (!W.sack.visible && !stirring) { W.paddle.visible = false; return; }
    hands(n);
    if (W.sack.visible && W.floor) { W.sack.position.set(0, 0, W.floor); W.sack.rotation.set(0, 0, 0); W.sack.userData.set = false; } // it rolls on the floor in front of him
    else if (W.sack.visible) {
      tmp.addVectors(fist, fist2).multiplyScalar(0.5);
      const fw = new THREE.Vector3(Math.sin(n.rotation.y), 0, Math.cos(n.rotation.y));
      tmp.addScaledVector(fw, 0.1); tmp.y -= W.pose === 'high' || W.pose === 'pour' ? -0.06 : 0.05;
      n.worldToLocal(tmp); W.sack.position.lerp(tmp, W.sack.userData.set ? Math.min(1, dt * 20) : 1); W.sack.userData.set = true;
      W.sack.rotation.set(-W.tilt * 1.7, 0, 0);
    } else W.sack.userData.set = false;
    if (stirring) {
      W.paddle.visible = W.pp.on > 0.7;
      const k = W.pose === 'ketel' ? W.ketel : null;
      const r = k ? 0.3 : 0.18, cx = k ? k.x : bowlOf(n).x, cz = k ? k.z : bowlOf(n).z, cy = k ? 0.75 : 1.2;
      // the blade circles in the pot; the shaft runs up to the fist
      // the paddle rides the paddle hand (so it stays in the fist the same frame the arm moves); only its aim uses last frame's arm
      const arm = n.userData.arms[0]; if (W.paddle.parent !== arm) arm.add(W.paddle);
      const tip = new THREE.Vector3(cx + Math.cos(W.ph) * r, cy, cz + Math.sin(W.ph) * r);
      const ws = arm.getWorldScale(tmp).y || 1, inv = arm.matrixWorld.clone().invert();
      const fl = new THREE.Vector3(0, -0.68, 0.05), tl = tip.applyMatrix4(inv), dir = tl.sub(fl), len = dir.length() * ws; dir.normalize();
      W.paddle.scale.setScalar(1 / ws);
      W.paddle.position.copy(fl).addScaledVector(dir, -0.14 / ws);
      W.paddle.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      W.paddle.userData.shaft.scale.y = len + 0.14; W.paddle.userData.blade.position.set(0, -(len + 0.14), 0);
    }
  }

  // per frame, once: ketels, sacks left on the racks, pour streams
  function tick(dt) {
    updateKetels(dt);
    for (let i = placed.length - 1; i >= 0; i--) { placed[i].life -= dt; if (placed[i].life <= 0) { scene.remove(placed[i].s); placed.splice(i, 1); } }
    for (let i = streams.length - 1; i >= 0; i--) { const s = streams[i]; s.t -= dt; s.m.material.opacity = 0.8 * Math.min(1, s.t / 0.3); if (s.t <= 0) { scene.remove(s.m); s.m.material.dispose(); streams.splice(i, 1); } }
  }
  return { update, reset, tick, ketels, findPath, buildGrid, busy, placed };
}
