// Neon Vice-style characters for three.js.
// The geometry, painted textures and poses come from ps2c.js (a port of Neon Vice's models.js); this file wraps
// them as SkinnedMeshes and keeps the old makePerson() contract: root.userData.{legs, arms, head, body, phase}.
// arms[0] / legs[0] are the character's right side (the gun hand), arms[1] / legs[1] the left.
// Callers may still set arms[i].rotation.x/z and legs[i].rotation.x; a value they set overrides the built-in walk/idle
// for that limb until they stop touching it. head.visible = false and arms[i].visible = false cut the head / arm off.
import * as THREE from '../vendor/three.module.min.js';
import * as P from './ps2c.js';

const TAU = Math.PI * 2;
const live = new Set();
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
export const hex01 = (h) => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];

function canvasTex(cv) {
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 4;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}
function geometry(M) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(M.p, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(P.normals(M), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(M.uv, 2));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(M.bi, 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(M.bw, 4));
  g.setIndex(M.idx);
  return g;
}

/* ---------- body painters for Spice Master clothes (Neon Vice paints suits; most of this cast wears shirts) ---------- */
const TY0 = 0.8, TY1 = 1.51, ROWT = 290;
const ty = (Y) => (TY1 - Y) / (TY1 - TY0) * ROWT, fx = (m) => 256 + m * 340;
function fabric(x, x0, y0, w, h, col, ribs = 0.07) {
  x.fillStyle = rgb(col); x.fillRect(x0, y0, w, h);
  x.save(); x.beginPath(); x.rect(x0, y0, w, h); x.clip();
  x.globalAlpha = ribs; x.strokeStyle = '#000'; x.lineWidth = 1; for (let i = x0; i < x0 + w; i += 3) { x.beginPath(); x.moveTo(i, y0); x.lineTo(i + h * 0.25, y0 + h); x.stroke(); }
  x.globalAlpha = 1; const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(1, 'rgba(0,0,0,.16)'); x.fillStyle = g; x.fillRect(x0, y0, w, h);
  x.restore();
}
function blob(x, cx, cy, rx, ry, col) { const g = x.createRadialGradient(cx, cy, 0, cx, cy, 1); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.translate(cx, cy); x.scale(rx, ry); x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, 7); x.fill(); x.restore(); }
// open-collar shirt tucked into trousers with a belt: S = { shirt, pants, skin, belt, vDepth, chestHair, chain, buttons, sleeves:'long'|'rolled'|'short', print }
export function paintShirt(cv, S) {
  const x = cv.getContext('2d'), sh = S.shirt, pa = S.pants, sk = S.skin, dk = sh.map((v) => v * 0.55);
  const tuck = S.tuck === false ? TY0 : 0.99;
  fabric(x, 0, 0, 512, ty(tuck), sh);
  if (S.print) S.print(x, 0, 0, 512, ty(tuck));
  for (const sx of [128, 384]) { blob(x, sx, ty(1.36), 70, 60, rgb(dk, 0.32)); blob(x, sx, ty(1.06), 50, 70, rgb(dk, 0.18)); }
  blob(x, 256, ty(1.3), 120, 50, 'rgba(255,255,255,.12)');
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) { x.strokeStyle = rgb(dk, 0.35); x.lineWidth = 2; x.beginPath(); const cx = 256 + sd * (110 + k * 16), cy = ty(1.08 + k * 0.04); x.moveTo(cx - 16, cy); x.quadraticCurveTo(cx, cy + 5, cx + 16, cy - 2); x.stroke(); }
  x.strokeStyle = rgb(dk, 0.45); x.lineWidth = 3; x.beginPath(); x.moveTo(1, 0); x.lineTo(1, ty(tuck)); x.moveTo(511, 0); x.lineTo(511, ty(tuck)); x.stroke();
  // V neck with skin, chest hair and a gold chain
  const vd = S.vDepth || 1.36, half = (Y) => 0.018 + (Y - vd) * 0.42;
  x.fillStyle = rgb(sk.map((v) => v * 0.9)); x.beginPath(); x.moveTo(fx(0), ty(vd)); for (let Y = vd; Y <= 1.52; Y += 0.01) x.lineTo(fx(half(Y)), ty(Y)); for (let Y = 1.52; Y >= vd; Y -= 0.01) x.lineTo(fx(-half(Y)), ty(Y)); x.closePath(); x.fill();
  if (S.chestHair) { x.save(); x.clip(); for (let i = 0; i < 220; i++) { x.fillStyle = 'rgba(45,26,14,.55)'; x.fillRect(fx((Math.random() - 0.5) * 0.12), ty(vd + Math.random() * 0.15), 2, 2); } x.restore(); }
  if (S.chain) { x.strokeStyle = '#7a5410'; x.lineWidth = 4; x.beginPath(); x.moveTo(fx(-0.06), ty(1.5)); x.quadraticCurveTo(fx(0), ty(vd + 0.02), fx(0.06), ty(1.5)); x.stroke(); x.strokeStyle = '#f5c64e'; x.lineWidth = 2.5; x.stroke(); }
  // collar edges, placket and buttons
  x.strokeStyle = rgb(dk, 0.9); x.lineWidth = 3; x.beginPath(); x.moveTo(fx(-half(1.52)), ty(1.52)); x.lineTo(fx(0), ty(vd)); x.lineTo(fx(half(1.52)), ty(1.52)); x.stroke();
  for (const sd of [-1, 1]) { x.fillStyle = rgb(sh.map((v) => Math.min(255, v * 1.06))); x.beginPath(); x.moveTo(fx(sd * half(1.5)), ty(1.5)); x.lineTo(fx(sd * (half(1.5) + 0.08)), ty(1.47)); x.lineTo(fx(sd * (half(1.42) + 0.01)), ty(1.4)); x.closePath(); x.fill(); x.strokeStyle = rgb(dk, 0.8); x.lineWidth = 2; x.stroke(); }
  x.strokeStyle = rgb(dk, 0.5); x.lineWidth = 1.5; x.beginPath(); x.moveTo(fx(0.006), ty(vd)); x.lineTo(fx(0.006), ty(tuck)); x.stroke();
  if (S.buttons !== false) for (let Y = vd - 0.07; Y > tuck + 0.02; Y -= 0.085) { x.fillStyle = '#eef3fb'; x.beginPath(); x.arc(fx(0.014), ty(Y), 3, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.35)'; x.lineWidth = 1; x.stroke(); }
  // trousers top + belt
  if (tuck > TY0) {
    fabric(x, 0, ty(tuck), 512, ROWT - ty(tuck), pa);
    blob(x, 256, ty(tuck) + 4, 220, 6, 'rgba(0,0,0,.25)');
    const bt = ty(tuck + 0.005), bb = ty(tuck - 0.03), bc = S.belt || [90, 48, 24];
    x.fillStyle = rgb(bc); x.fillRect(0, bt, 512, bb - bt); x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(0, bt, 512, 2);
    x.fillStyle = '#d8b040'; x.fillRect(fx(-0.03), bt - 1, fx(0.03) - fx(-0.03), bb - bt + 2); x.fillStyle = rgb(bc); x.fillRect(fx(-0.018), bt + 3, fx(0.018) - fx(-0.018), bb - bt - 6);
    for (const sd of [-1, 1]) { x.strokeStyle = rgb(pa.map((v) => v * 0.6), 0.6); x.lineWidth = 1.5; x.beginPath(); x.moveTo(fx(sd * 0.14), bb + 6); x.quadraticCurveTo(fx(sd * 0.17), bb + 18, fx(sd * 0.2), bb + 4); x.stroke(); }
  }
  // sleeves (rows 290..380) and cuffs (381..399)
  const sl = S.sleeves || 'long';
  if (sl === 'long') { fabric(x, 0, 290, 512, 90, sh); blob(x, 128, 300, 90, 26, rgb(dk, 0.3)); x.fillStyle = rgb(dk, 0.3); x.fillRect(0, 372, 512, 8); fabric(x, 0, 381, 512, 18, sh); x.fillStyle = rgb(dk, 0.45); x.fillRect(0, 381, 512, 3); }
  else { const cut = sl === 'rolled' ? 0.62 : 0.3; fabric(x, 0, 290, 512, 90 * cut, sh); x.fillStyle = rgb(dk, 0.5); x.fillRect(0, 290 + 90 * cut - 6, 512, 6); fabric(x, 0, 290 + 90 * cut, 512, 90 * (1 - cut), sk, 0.02); fabric(x, 0, 381, 512, 18, sk, 0.02); }
  // trousers (rows 440..512): plain cloth with a front crease
  fabric(x, 0, 440, 512, 72, pa, 0.04); x.strokeStyle = 'rgba(255,255,255,.3)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(256, 440); x.lineTo(256, 512); x.stroke();
  x.strokeStyle = rgb(pa.map((v) => v * 0.6), 0.45); x.lineWidth = 2; for (const sx of [2, 128, 384]) { x.beginPath(); x.moveTo(sx, 440); x.lineTo(sx, 512); x.stroke(); }
  x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(0, 508, 512, 4);
  // collar band around the neck (sampled from the cuff rows): shirt colour
  if (sl !== 'long') { x.fillStyle = rgb(sh); x.fillRect(0, 381, 512, 3); }
}

/* ---------- build ---------- */
// look: Neon Vice look fields (colours 0..1): skin, hair, hs ('normal'|'slick'|'buzz'|'big'|'long'|'mohawk'), beard, stache,
// stubble, glasses, shades, hat, calm, fem, body ('fat'|'big'|'thin'|'slim'|'stocky'|'boss'), shirt, jacket, pants, shoes, tee, tank ...
// plus Spice Master extras: smile, shirtPaint (paintShirt options), B (raw geometry flags merged into the build), paintHead(cv), paintBody(cv)
export function buildModel(look) {
  const cfg = P.lookCfg(look, look.body);
  Object.assign(cfg.B, look.B || {});
  const hc = P.paintHeadP(look);
  if (look.smile) P.paintSmile(hc, {});
  if (look.paintHead) look.paintHead(hc);
  const bc = P.paintBodyP(look);
  if (look.shirtPaint) paintShirt(bc, look.shirtPaint);
  if (look.paintBody) look.paintBody(bc);
  const mats = [], meshes = [];
  const body = new THREE.Group();
  const bones = [];
  for (let i = 0; i < P.NB; i++) { const b = new THREE.Bone(); b.name = P.BONES[i][0]; b.matrixAutoUpdate = false; body.add(b); bones.push(b); }
  const skeleton = new THREE.Skeleton(bones, bones.map(() => new THREE.Matrix4()));
  for (const [M, cv] of [[P.buildBody(cfg.B), bc], [P.buildHead(cfg.B), hc]]) {
    const mat = new THREE.MeshStandardMaterial({ map: canvasTex(cv), roughness: 0.82, metalness: 0 });
    const m = new THREE.SkinnedMesh(geometry(M), mat);
    m.bind(skeleton, new THREE.Matrix4());
    m.frustumCulled = false; m.castShadow = true; // no receiveShadow: painted shading, and a belly shouldn't black out the hips
    body.add(m); mats.push(mat); meshes.push(m);
  }
  return { body, bones, skeleton, meshes, mats, cfg, canvases: { body: bc, head: hc } };
}

/* ---------- person (makePerson-compatible) ---------- */
const ARM = [{ s: -1, u: 'uarmR', f: 'farmR', h: 'handR' }, { s: 1, u: 'uarmL', f: 'farmL', h: 'handL' }];
const LEG = [{ t: 'thighR', s: 'shinR', f: 'footR' }, { t: 'thighL', s: 'shinL', f: 'footL' }];
const CUT = { arm0: ['uarmR', 'farmR', 'handR'], arm1: ['uarmL', 'farmL', 'handL'], head: ['head'] };
const X = [1, 0, 0], Z = [0, 0, 1];
// old makePerson arm space (shoulder origin, arm hanging down -Y, hand at y -0.68) -> Neon Vice rest space at the fist
const handOff = [-1, 1].map((s) => {
  const ad = [P.AD[0] * s, P.AD[1], 0], wr = s > 0 ? P.WR : P.mir(P.WR), fist = [wr[0] + ad[0] * 0.065, wr[1] + ad[1] * 0.065, wr[2]];
  const m = new THREE.Matrix4().makeRotationZ(s * Math.atan2(P.AD[0], -P.AD[1]));
  return new THREE.Matrix4().makeTranslation(fist[0], fist[1], fist[2]).multiply(m).multiply(new THREE.Matrix4().makeTranslation(0, 0.68, -0.04));
});
const tmpM = new THREE.Matrix4(), headOff = new THREE.Matrix4().compose(new THREE.Vector3(0, 1.6, 0), new THREE.Quaternion(), new THREE.Vector3(0.75, 0.75, 0.75));

export function makePS2Person(look, opts = {}) {
  const root = new THREE.Group();
  const md = buildModel(look);
  const body = md.body; const s = opts.scale || 1;
  body.scale.set(md.cfg.scale[0] * s, md.cfg.scale[1] * s, md.cfg.scale[2] * s);
  root.add(body);
  const proxy = () => { const o = new THREE.Object3D(); o.userData.proxy = true; return o; };
  // arm proxies are real groups that ride the hands: props parented at the old hand spot (0, -0.68, 0.05) land in the fist
  const arms = [0, 1].map(() => { const g = new THREE.Group(); g.matrixAutoUpdate = false; body.add(g); return g; }), legs = [proxy(), proxy()];
  const head = new THREE.Group(); head.matrixAutoUpdate = false; body.add(head);
  root.userData = { legs, arms, head, body, phase: 0, ps2: { md, look, seed: Math.random() * 100, moving: false, last: [0, 0, 0, 0, 0, 0], gait: md.cfg.gait } };
  root.userData.ps2.away = 0;
  live.add(root); root.addEventListener('added', () => live.add(root));
  if (opts.scene) opts.scene.add(root);
  return root;
}

// called by animate() in main.js instead of swinging capsule limbs
export function ps2Animate(p, speed, dt) {
  const u = p.userData, q = u.ps2;
  q.moving = speed > 0.05;
  if (q.moving) u.phase += dt * (5 + speed * 1.2);
  // a limb rotation nobody set since the last call relaxes back to the built-in animation
  const vals = [u.arms[0].rotation.x, u.arms[0].rotation.z, u.arms[1].rotation.x, u.arms[1].rotation.z, u.legs[0].rotation.x, u.legs[1].rotation.x];
  const set = [(v) => (u.arms[0].rotation.x = v), (v) => (u.arms[0].rotation.z = v), (v) => (u.arms[1].rotation.x = v), (v) => (u.arms[1].rotation.z = v), (v) => (u.legs[0].rotation.x = v), (v) => (u.legs[1].rotation.x = v)];
  const k = Math.pow(0.8, dt * 60);
  for (let i = 0; i < 6; i++) {
    let v = vals[i];
    if (v === q.last[i]) { v *= k; if (Math.abs(v) < 0.01) v = 0; set[i](v); }
    q.last[i] = v;
  }
}

function poseOf(p, now) {
  const u = p.userData, q = u.ps2;
  const walk = q.moving && !u.seated;
  const t = walk ? u.phase / (TAU * 0.95) : now * 0.001 + q.seed;
  const W = P.pose(t, walk ? 'walk' : 'idle', undefined, q.arms || null, q.kick || 0, q.gait, (R, rot, lower, hinge) => {
    for (let i = 0; i < 2; i++) {
      const a = u.arms[i], A = ARM[i];
      if (Math.abs(a.rotation.x) > 0.02 || Math.abs(a.rotation.z) > 0.02) {
        delete R[A.u]; delete R[A.f]; delete R[A.h];
        lower(A.s, 0.62); rot(A.u, X, a.rotation.x); if (a.rotation.z) rot(A.u, Z, a.rotation.z);
        rot(A.f, hinge(A.s), a.rotation.x < -0.6 ? 0.12 : 0.3);
      }
      const l = u.legs[i], Lg = LEG[i];
      if (Math.abs(l.rotation.x) > 0.02) {
        delete R[Lg.t]; delete R[Lg.s]; delete R[Lg.f];
        rot(Lg.t, X, l.rotation.x);
        if (l.rotation.x < -0.6) rot(Lg.s, X, Math.min(-l.rotation.x, 1.6)); // seated / riding: shins hang down
      }
    }
    if (q.extra) q.extra(R, rot, lower, hinge);
  });
  // cut limbs: collapse the bone group to a point at its pivot
  const cut = [];
  if (!u.arms[0].visible) cut.push(CUT.arm0);
  if (!u.arms[1].visible) cut.push(CUT.arm1);
  if (!u.head.visible) cut.push(CUT.head);
  if (q.look.neckDrop) W[P.BI.head] = P.M4.mul(P.M4.T(0, -q.look.neckDrop, 0), W[P.BI.head]);
  for (const grp of cut) {
    const b0 = P.BI[grp[0]], pv = P.M4.ap(W[b0], P.BONES[b0][2]);
    const z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, pv[0], pv[1], pv[2], 1];
    for (const nm of grp) W[P.BI[nm]] = z;
  }
  return W;
}

function inScene(o) { for (let n = o; n; n = n.parent) if (n.isScene) return true; return false; }
function visibleInScene(o) { for (let n = o; n; n = n.parent) { if (!n.visible) return false; if (n.isScene) return true; } return false; }

// sync every live character's bones to its pose; runs right before each render (scene.onBeforeRender)
export function syncCharacters() {
  const now = performance.now();
  for (const p of live) {
    if (!visibleInScene(p)) { const q = p.userData.ps2; if (++q.away > 600 && !inScene(p)) live.delete(p); continue; }
    p.userData.ps2.away = 0;
    const u = p.userData, W = poseOf(p, now), bones = u.ps2.md.bones;
    for (let i = 0; i < bones.length; i++) { bones[i].matrix.fromArray(W[i]); bones[i].matrixWorldNeedsUpdate = true; bones[i].updateMatrixWorld(); }
    // the head proxy follows the head bone so hats, poop splats and props parented to it ride along
    u.head.matrix.fromArray(W[P.BI.head]).multiply(headOff);
    u.head.matrixWorldNeedsUpdate = true; u.head.updateMatrixWorld(true);
    for (let i = 0; i < 2; i++) { const a = u.arms[i]; a.matrix.fromArray(W[P.BI[ARM[i].h]]).multiply(handOff[i]); a.matrixWorldNeedsUpdate = true; a.updateMatrixWorld(true); }
  }
}
export function installCharacters(scene) {
  const prev = scene.onBeforeRender;
  scene.onBeforeRender = function (...a) { syncCharacters(); if (prev) prev.apply(this, a); };
}
// characters detached from the scene for ~10 s drop out of the update set; adding the root back re-registers it,
// track() does the same when only an ancestor was re-added
export function track(p) { if (p.userData && p.userData.ps2) live.add(p); }

/* ---------- the cast ---------- */
export const LOOKS = {
  eddyJr: {
    skin: hex01(0xe4ab88), hair: hex01(0x1d1510), hs: 'curly', glasses: 1, stubble: 1, calm: 1, smile: 1, body: 'fat', neckDrop: 0.03, B: { nowatch: true },
    shirt: hex01(0x86acdf), jacket: hex01(0x86acdf), pants: hex01(0xe9e4d8), shoes: hex01(0x6a3a1c), tee: 1,
    shirtPaint: { shirt: [0x86, 0xac, 0xdf], pants: [0xe9, 0xe4, 0xd8], skin: [0xe4, 0xab, 0x88], belt: [0x5a, 0x30, 0x18], vDepth: 1.38, chestHair: true, chain: true, sleeves: 'long' },
  },
};
