// Neon Vice-style characters for three.js.
// The geometry, painted textures and poses come from ps2c.js (a port of Neon Vice's models.js); this file wraps
// them as SkinnedMeshes and keeps the old makePerson() contract: root.userData.{legs, arms, head, body, phase}.
// arms[0] / legs[0] are the character's right side (the gun hand), arms[1] / legs[1] the left.
// Callers may still set arms[i].rotation.x/z and legs[i].rotation.x; a value they set overrides the built-in walk/idle
// for that limb until they stop touching it. head.visible = false and arms[i].visible = false cut the head / arm off.
import * as THREE from '../vendor/three.module.min.js';
import * as P from './ps2c.js';
import { Gait, mocap } from './mocap.js';

const TAU = Math.PI * 2;
const live = new Set(), queue = [];
export const stats = { built: 0, ms: 0, first: 0, queued: 0 };
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
  if (S.skirt) { fabric(x, 0, ty(0.92), 512, ROWT - ty(0.92), S.skirt, 0.03); blob(x, 256, ty(0.92) + 3, 240, 5, 'rgba(0,0,0,.3)'); }
  if (S.stripes) for (let Y = 1.45; Y > tuck + 0.03; Y -= 0.085) { x.fillStyle = 'rgba(255,255,255,.6)'; x.fillRect(0, ty(Y), 512, 9); }
  if (S.apron) { const ac = S.apronC || [242, 239, 230], ae = S.apronC ? `rgb(${ac.map((v) => Math.round(v * 0.7))})` : '#d8d2c4'; fabric(x, fx(-0.17), ty(1.38), fx(0.17) - fx(-0.17), ROWT - ty(1.38), ac, 0.03); x.strokeStyle = ae; x.lineWidth = 4; x.beginPath(); x.moveTo(fx(-0.15), ty(1.38)); x.lineTo(fx(-0.1), 0); x.moveTo(fx(0.15), ty(1.38)); x.lineTo(fx(0.1), 0); x.stroke(); x.strokeStyle = ae; x.lineWidth = 3; x.beginPath(); x.moveTo(0, ty(1.12)); x.lineTo(fx(-0.17), ty(1.12)); x.moveTo(fx(0.17), ty(1.12)); x.lineTo(512, ty(1.12)); x.stroke(); }
  if (S.police) { x.fillStyle = '#d8b040'; x.beginPath(); x.arc(fx(-0.09), ty(1.33), 7, 0, 7); x.fill(); x.fillStyle = '#fff'; x.font = '900 22px Arial'; x.textAlign = 'center'; x.fillText('POLITIE', 0, ty(1.3)); x.fillText('POLITIE', 512, ty(1.3)); x.fillStyle = '#111'; x.fillRect(0, ty(1.0), 512, 12); }
  if (S.controle) { x.fillStyle = '#ffd23a'; x.fillRect(0, ty(1.2), 512, 16); x.fillStyle = '#fff'; x.font = '900 20px Arial'; x.textAlign = 'center'; x.fillText('CONTROLE', 0, ty(1.33)); x.fillText('CONTROLE', 512, ty(1.33)); }
  if (S.badge) S.badge(x, fx, ty);
  if (S.tracksuit) { // Lampas tracksuit: zip, two white stripes down the sleeves and trouser legs (drawn after the sleeves below)
    x.strokeStyle = 'rgba(30,30,30,.6)'; x.lineWidth = 3; x.beginPath(); x.moveTo(256, 0); x.lineTo(256, ROWT); x.stroke(); x.fillStyle = '#ddd'; x.fillRect(252, 28, 8, 14);
    x.fillStyle = 'rgba(255,255,255,.85)'; for (const sx of [124, 380]) x.fillRect(sx, 0, 8, ROWT); }
  if (S.neck === 'crew') { x.fillStyle = rgb(sk.map((v) => v * 0.9)); x.beginPath(); x.ellipse(256, 0, 40, 24, 0, 0, 7); x.fill(); x.strokeStyle = rgb(dk, 0.7); x.lineWidth = 4; x.beginPath(); x.ellipse(256, 0, 42, 26, 0, 0, Math.PI); x.stroke(); }
  else {
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
  }
  if (S.crewChain) { x.strokeStyle = '#f5c64e'; x.lineWidth = 3; x.beginPath(); x.moveTo(fx(-0.06), 0); x.quadraticCurveTo(fx(0), ty(1.4), fx(0.06), 0); x.stroke(); }
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
  if (S.tracksuit) { x.fillStyle = 'rgba(255,255,255,.88)'; for (const sx of [372, 386]) { x.fillRect(sx, 290, 6, 90); } for (const sx of [116, 130, 372, 386]) x.fillRect(sx, 440, 6, 72); }
  // collar band around the neck (sampled from the cuff rows): shirt colour
  if (sl !== 'long') { x.fillStyle = rgb(sh); x.fillRect(0, 381, 512, 3); }
}

/* ---------- build ---------- */
// look: Neon Vice look fields (colours 0..1): skin, hair, hs ('normal'|'slick'|'buzz'|'big'|'long'|'mohawk'), beard, stache,
// stubble, glasses, shades, hat, calm, fem, body ('fat'|'big'|'thin'|'slim'|'stocky'|'boss'), shirt, jacket, pants, shoes, tee, tank ...
// plus Spice Master extras: smile, shirtPaint (paintShirt options), B (raw geometry flags merged into the build), paintHead(cv), paintBody(cv)
// building is split in two: prepModel (skeleton and body group, instant) and finishModel (textures, meshes: the slow part),
// so street extras can be finished in the background a few per frame (see the queue in syncCharacters)
const geoCache = new Map();
const SPHERE = new THREE.Sphere(new THREE.Vector3(0, 0.9, 0), 2.2); // covers standing and lying poses
export function prepModel(look) {
  const cfg = P.lookCfg(look, look.body);
  cfg.B.nowatch = !look.watch; // Neon Vice gives everyone a gold watch; here only looks that ask for one
  Object.assign(cfg.B, look.B || {});
  const body = new THREE.Group(), bones = [];
  for (let i = 0; i < P.NB; i++) { const b = new THREE.Bone(); b.name = P.BONES[i][0]; b.matrixAutoUpdate = false; body.add(b); bones.push(b); }
  const skeleton = new THREE.Skeleton(bones, bones.map(() => new THREE.Matrix4()));
  return { look, body, bones, skeleton, meshes: [], mats: [], cfg, done: false };
}
export function finishModel(md) {
  if (md.done) return md;
  const t0 = performance.now(); if (!stats.first) stats.first = t0;
  const { look, cfg } = md;
  const hc = P.paintHeadP(look);
  if (look.smile) P.paintSmile(hc, {});
  if (look.paintHead) look.paintHead(hc);
  const bc = P.paintBodyP(look);
  if (look.shirtPaint) paintShirt(bc, look.shirtPaint);
  if (look.paintBody) look.paintBody(bc);
  // extras get 256 px sheets (a quarter of the memory); the named cast keeps 512 (look.tex)
  const ts = look.tex || 256, shrink = (cv) => { if (cv.width <= ts) return cv; const c = document.createElement('canvas'); c.width = c.height = ts; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, 0, ts, ts); return c; };
  const key = JSON.stringify(cfg.B);
  let geos = geoCache.get(key);
  if (!geos) { geos = [geometry(P.buildBody(cfg.B)), geometry(P.buildHead(cfg.B))]; geoCache.set(key, geos); }
  [shrink(bc), shrink(hc)].forEach((cv, i) => {
    const mat = new THREE.MeshStandardMaterial({ map: canvasTex(cv), roughness: 0.82, metalness: 0 });
    const m = new THREE.SkinnedMesh(geos[i], mat);
    m.bind(md.skeleton, new THREE.Matrix4());
    m.boundingSphere = SPHERE.clone(); // fixed sphere: no per-vertex skinning pass to compute one
    m.castShadow = true; // no receiveShadow: painted shading, and a belly shouldn't black out the hips
    md.body.add(m); md.mats.push(mat); md.meshes.push(m);
  });
  md.done = true;
  stats.built++; stats.ms += performance.now() - t0;
  return md;
}
export function buildModel(look) { return finishModel(prepModel(look)); }
// repaint a character's clothes in place (Eddy's outfits, js/woning.js): the same body, a new shirtPaint / colours
export function repaint(p, patch) {
  const q = p && p.userData && p.userData.ps2; if (!q) return;
  finishModel(q.md);
  const base = q.base || (q.base = q.md.look);
  const look = { ...base, ...patch, shirtPaint: { ...(base.shirtPaint || {}), ...(patch.shirtPaint || {}) } };
  q.md.look = look; q.look = look;
  const bc = P.paintBodyP(look); if (look.shirtPaint) paintShirt(bc, look.shirtPaint); if (look.paintBody) look.paintBody(bc);
  const t = q.md.meshes[0].material.map, cv = t.image; cv.getContext('2d').drawImage(bc, 0, 0, cv.width, cv.height); t.needsUpdate = true;
  q.clean = null; q.bl = 0;
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
  const md = prepModel(look);
  if (opts.lazy) queue.push(md); else finishModel(md);
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
  if (mocap.on) {
    // travel speed actually covered (a blocked character runs on the spot otherwise), in the body's own scale
    const pos = p.position, lp = q.lastPos || (q.lastPos = pos.clone());
    const moved = dt > 0 ? Math.hypot(pos.x - lp.x, pos.z - lp.z) / dt : 0; lp.copy(pos);
    const v = speed > 0.05 ? (u.inPlace || moved >= 2 * speed ? speed : moved) : 0; // teleports count as the requested speed
    q.gaitV = v / (u.body.scale.y || 1); q.gaitDt = (q.gaitDt || 0) + dt;
  }
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
  let base = null;
  if (mocap.on) {
    if (!q.gait2) q.gait2 = new Gait(q.look.body === 'fat');
    // characters not driven by animate() (seated diners, card players) still get the clock
    const dt = Math.min(0.1, q.gaitDt || (now - (q.gaitT || now)) / 1000); q.gaitT = now; q.gaitDt = 0;
    const lying = Math.abs(u.body.rotation.x) > 1; // knocked down / dead: hold still instead of swaying on the floor
    const g = q.gait2.update(q.moving && !lying ? q.gaitV || 0 : 0, !!u.seated, lying ? 0 : dt, p.rotation.y);
    base = { R: g.R, root: g.root };
    if (g.lean || g.bank) base.R.spine = P.M4.mul(P.M4.mul(P.M4.R(X, g.lean), P.M4.R(Z, g.bank)), base.R.spine);
  }
  // read the old-style arm angles the game sets and play Neon Vice's matching arm pose instead:
  // right arm raised (-1.45) = aim one-handed, both raised = two-handed / grab, wound back (< -2.2) / swung through (> 0.3) = melee swing
  const a0 = u.arms[0].rotation.x, a1 = u.arms[1].rotation.x;
  let arms = q.arms || null, kick = q.kick || 0;
  if (!arms && !u.seated && u.arms[0].visible) {
    if (a0 < -2.2) { arms = 'melee'; kick = 0; }
    else if (a0 > 0.3) { arms = 'melee'; kick = 1; }
    else if (a0 < -1.2) arms = a1 < -1.0 ? (Math.abs(a0 - a1) < 0.2 ? 'dual' : 'rifle') : 'aim1';
  }
  const W = P.pose(t, base || (walk ? 'walk' : 'idle'), undefined, arms, kick, q.gait, (R, rot, lower, hinge) => {
    for (let i = 0; i < 2; i++) {
      const a = u.arms[i], A = ARM[i];
      if (!arms && (Math.abs(a.rotation.x) > 0.02 || Math.abs(a.rotation.z) > 0.02)) {
        delete R[A.u]; delete R[A.f]; delete R[A.h];
        lower(A.s, 0.62); rot(A.u, X, a.rotation.x); if (a.rotation.z) rot(A.u, Z, a.rotation.z);
        rot(A.f, hinge(A.s), a.rotation.x < -0.6 ? 0.12 : 0.3);
      }
      const l = u.legs[i], Lg = LEG[i];
      if (Math.abs(l.rotation.x) > 0.02 && !(base && u.seated)) { // seated mocap clips bring their own legs
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
const frustum = new THREE.Frustum(), pv = new THREE.Matrix4(), ball = new THREE.Sphere();
export function syncCharacters(camera) {
  const now = performance.now();
  // finish queued extras within a small time budget per frame (always at least one)
  for (let n = 0; queue.length && (n === 0 || performance.now() - now < 6); n++) finishModel(queue.shift());
  stats.queued = queue.length;
  if (camera) { pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(pv); }
  for (const p of live) {
    if (!visibleInScene(p)) { const q = p.userData.ps2; if (++q.away > 600 && !inScene(p)) live.delete(p); continue; }
    p.userData.ps2.away = 0;
    if (!p.userData.ps2.md.done) continue;
    if (camera) { ball.copy(SPHERE).applyMatrix4(p.userData.body.matrixWorld); if (!frustum.intersectsSphere(ball)) continue; } // off screen: keep the last pose
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
  scene.onBeforeRender = function (renderer, sc, camera, ...a) { syncCharacters(camera); if (prev) prev.call(this, renderer, sc, camera, ...a); };
}
// characters detached from the scene for ~10 s drop out of the update set; adding the root back re-registers it,
// track() does the same when only an ancestor was re-added
export function track(p) { if (p.userData && p.userData.ps2) live.add(p); }

/* ---------- blood on the clothes (Neon Vice bloodify): 1 hurt, 2 dead, 3 executed ---------- */
const BLOOD = { front: [[150, 30, 212, 250]], all: [[0, 0, 512, 290], [0, 290, 512, 90], [0, 440, 512, 72]], chest: [[150, 0, 212, 140]], face: [[150, 150, 212, 240]] };
function splat(cv, regions, n, big) {
  const x = cv.getContext('2d'), k = cv.width / 512;
  for (let i = 0; i < n; i++) {
    const r = regions[(Math.random() * regions.length) | 0], px = (r[0] + Math.random() * r[2]) * k, py = (r[1] + Math.random() * r[3]) * k, sz = ((big ? 8 : 4) + Math.random() * (big ? 18 : 10)) * k;
    x.fillStyle = `rgba(${(100 + Math.random() * 50) | 0},${(Math.random() * 12) | 0},${(10 + Math.random() * 12) | 0},${0.75 + Math.random() * 0.25})`;
    x.beginPath(); x.ellipse(px, py, sz, sz * (0.6 + Math.random() * 0.6), Math.random() * 3, 0, 7); x.fill();
    for (let j = 0; j < 5; j++) { x.beginPath(); x.arc(px + (Math.random() - 0.5) * sz * 3, py + (Math.random() - 0.5) * sz * 3, (1 + Math.random() * 3) * k, 0, 7); x.fill(); }
    if (Math.random() < 0.6) x.fillRect(px - 1.5 * k, py, 3 * k, sz * (1 + Math.random() * 2));
  }
}
export function bloody(p, lvl) {
  const q = p && p.userData && p.userData.ps2; if (!q || lvl <= (q.bl || 0)) return;
  finishModel(q.md);
  const [bm, hm] = q.md.meshes.map((m) => m.material.map);
  if (!q.clean) q.clean = [bm, hm].map((t) => { const c = document.createElement('canvas'); c.width = t.image.width; c.height = t.image.height; c.getContext('2d').drawImage(t.image, 0, 0); return c; });
  q.bl = lvl;
  if (lvl >= 1) splat(bm.image, BLOOD.front, lvl === 1 ? 4 : 10, lvl > 1);
  if (lvl >= 2) splat(bm.image, BLOOD.all, 8, false);
  if (lvl >= 3) splat(bm.image, BLOOD.chest, 14, true);
  if (lvl >= 2) { splat(hm.image, BLOOD.face, lvl >= 3 ? 12 : 4, false); hm.needsUpdate = true; }
  bm.needsUpdate = true;
}
export function cleanBlood(p) {
  const q = p && p.userData && p.userData.ps2; if (!q || !q.clean) return;
  q.md.meshes.forEach((m, i) => { const t = m.material.map; t.image.getContext('2d').drawImage(q.clean[i], 0, 0); t.needsUpdate = true; });
  q.bl = 0;
}

/* ---------- old makePerson options -> look ---------- */
const h255 = (h) => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
const css = (c) => (typeof c === 'string' ? parseInt(c.slice(1, 7), 16) : c);
// turns the options passersBy/diners/card players/Lampas were built from into a Neon Vice look, so every caller keeps working
export function lookFromPerson(o, HEADS = {}) {
  const hd = o.head || HEADS[o.headKind] || {};
  const skin = css(o.skin ?? hd.skin ?? 0xe0a882), hair = hd.hair ? css(hd.hair) : null;
  const fem = !!o.chest, front = typeof o.front === 'string' ? o.front : '';
  const shirt = front[0] === '#' ? parseInt(front.slice(1, 7), 16) : css(o.shirt ?? 0x888888), fl = front[0] === '#' ? front.slice(7) : '';
  const pants = css(o.pants ?? 0x2a2a30), shoes = css(o.shoes ?? 0x1a1a1a);
  const L = {
    skin: hex01(skin), hair: hair != null && !hd.bald ? hex01(hair) : null, calm: 1, smile: hd.mouth === 'laugh' ? 1 : 0, fem: fem ? 1 : 0,
    hs: hd.bald ? null : hd.slick ? 'slick' : hd.long ? 'long' : (hd.hairLine || 90) <= 66 ? 'buzz' : 'normal',
    glasses: hd.glasses ? 1 : 0, shirt: hex01(shirt), jacket: hex01(shirt), pants: hex01(pants), shoes: hex01(shoes), tee: 1,
    body: o.belly >= 1 ? 'fat' : o.belly >= 0.55 ? 'stocky' : 'normal',
  };
  if (hd.beard || hd.beard3d) { L.beard = hex01(css(hd.beard3d || hd.beard)); L.fluff = !!hd.beard3d; }
  if (o.police || o.capColor) { L.hat = 'peaked'; L.hatC = hex01(css(o.capColor || 0x1a2440)); }
  else if (o.ballcap) { L.hat = 'ballcap'; L.hatC = hex01(css(o.ballcap)); }
  else if (o.feltHat) { L.hat = 'fedora'; L.hatC = hex01(css(o.feltHat)); }
  else if (o.chefHat) L.hat = 'chef';
  else if (o.wrap) { L.hat = 'wrap'; L.hatC = hex01(css(o.wrap)); } // Paravim head wrap
  if (o.stache) L.stache = 1;
  if (L.hat) L.hair = L.hair || null;
  if (o.cigarette) L.cigar = 1;
  if (fem && o.skirt) L.skirt = 0.42;
  L.shirtPaint = {
    shirt: h255(shirt), pants: h255(pants), skin: h255(skin), belt: o.belt ? h255(css(o.belt)) : [30, 24, 20],
    tuck: !!o.belt, neck: o.mandarin || fl.includes('p') ? 'crew' : fem || !o.belt ? 'crew' : 'v', sleeves: o.rolled ? 'rolled' : 'long', buttons: !!o.belt,
    skirt: fem && o.skirt ? h255(css(o.skirt)) : null, stripes: fl.includes('s'), apron: fl.includes('a'), police: fl.includes('p'), controle: fl.includes('c'),
    crewChain: !!o.chain, chain: !!o.chain, apronC: o.apron ? h255(css(o.apron)) : null,
  };
  if (o.mandarin) { const g = h255(css(o.mandarin)); L.shirtPaint.badge = (x, fx, ty) => { x.fillStyle = `rgb(${g})`; x.fillRect(0, 0, 512, 14); for (let k = 0; k < 3; k++) x.fillRect(fx(-0.05), ty(1.4 - k * 0.11), fx(0.05) - fx(-0.05), 6); }; }
  if (o.suit) { delete L.shirtPaint; L.tee = 0; L.jacket = hex01(shirt); L.shirt = o.suitShirt ? hex01(css(o.suitShirt)) : [0.12, 0.12, 0.15]; L.chain = !!o.chain; L.watch = 1; }
  if (o.lampas) Object.assign(L.shirtPaint, { tracksuit: true, neck: 'crew', crewChain: !!o.chain, stripes: false });
  return L;
}

/* ---------- the cast ---------- */
const naknikBadge = (x, fx, ty) => { x.fillStyle = '#c45e1a'; x.fillRect(fx(-0.13), 0, 8, ty(0.8)); x.fillRect(fx(0.12), 0, 8, ty(0.8)); x.fillStyle = '#ffd36b'; x.beginPath(); x.roundRect(fx(-0.05), ty(1.36), fx(0.05) - fx(-0.05), 30, 5); x.fill(); x.fillStyle = '#7a3a0a'; x.font = '900 22px Arial'; x.textAlign = 'center'; x.fillText('N', fx(0), ty(1.36) + 23); };
function dolphinPrint(x, x0, y0, w, h) {
  const cols = [['#ff5aa0', '#ffb36b'], ['#38c8e8', '#a46bff'], ['#ff8a5a', '#ff4a8a'], ['#5ae0c8', '#3a9aff']];
  for (let i = 0; i < w * h / 2200; i++) { const px = x0 + Math.random() * w, py = y0 + Math.random() * h, c = cols[i % 4]; const g = x.createLinearGradient(px - 14, py, px + 14, py); g.addColorStop(0, c[0]); g.addColorStop(1, c[1]); x.fillStyle = g; x.save(); x.translate(px, py); x.rotate(Math.random() * 6.3); x.beginPath(); x.ellipse(0, 0, 14, 5, 0, 0, 7); x.fill(); x.beginPath(); x.moveTo(-12, 0); x.lineTo(-20, -6); x.lineTo(-18, 5); x.fill(); x.restore(); }
}
export const LOOKS = {
  eddySr: {
    tex: 512,
    skin: hex01(0xdc9c82), hair: hex01(0xeceae4), hs: 'slick', stache: 1, beard: null, calm: 1, smile: 1, body: 'stocky', B: { nowatch: true },
    shirt: hex01(0x232a40), jacket: hex01(0x232a40), pants: hex01(0x4a4a52), shoes: hex01(0x2a2018), tee: 1,
    shirtPaint: { shirt: [0x23, 0x2a, 0x40], pants: [0x4a, 0x4a, 0x52], skin: [0xdc, 0x9c, 0x82], belt: [0x2a, 0x20, 0x18], vDepth: 1.42, chain: false, sleeves: 'long', buttons: true,
      badge: (x, fx, ty) => { x.strokeStyle = '#9a2222'; x.lineWidth = 9; x.beginPath(); x.moveTo(fx(-0.08), 0); x.quadraticCurveTo(fx(0), ty(1.4), fx(0.08), 0); x.stroke(); x.strokeStyle = '#ece6d4'; x.lineWidth = 3; x.stroke(); } },
  },
  russian: {
    tex: 512,
    skin: hex01(0xf0c4a2), hair: hex01(0xa0602e), hs: 'normal', beard: hex01(0xa85a28), fluff: 1, glasses: 1, calm: 1, smile: 1, body: 'big', B: { nowatch: true },
    shirt: hex01(0x121216), jacket: hex01(0x121216), pants: hex01(0x2a2c3a), shoes: hex01(0x1e1814), tee: 1,
    shirtPaint: { shirt: [0x12, 0x12, 0x16], pants: [0x2a, 0x2c, 0x3a], skin: [0xf0, 0xc4, 0xa2], belt: [0x1a, 0x14, 0x10], vDepth: 1.34, chestHair: true, chain: true, sleeves: 'long', print: dolphinPrint,
      badge: (x, fx, ty) => { x.fillStyle = '#d0682a'; x.fillRect(fx(-0.025), ty(1.34), fx(0.025) - fx(-0.025), ty(0.99) - ty(1.34)); } },
  },
  // Steven Zeegaal: a painted 90s action-star parody (never a photo): slicked hair to a ponytail, tinted shades, goatee, black gi with gold collar
  zeegaal: {
    tex: 512, skin: hex01(0xe9c2a2), hair: hex01(0x0d0b0a), hs: 'long', shades: 1, calm: 0.3, body: 'stocky', B: { nowatch: true },
    shirt: hex01(0x1d1a24), jacket: hex01(0x1d1a24), pants: hex01(0x121016), shoes: hex01(0x050505), tee: 1,
    paintHead: (cv) => { const x = cv.getContext('2d'); x.fillStyle = 'rgba(23,18,14,.9)'; x.beginPath(); x.ellipse(256, 300, 22, 26, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(256, 262, 30, 7, 0, 0, 7); x.fill(); x.fillStyle = 'rgb(233,194,162)'; x.beginPath(); x.ellipse(256, 280, 14, 6, 0, 0, 7); x.fill(); },
    shirtPaint: { shirt: [0x1d, 0x1a, 0x24], pants: [0x12, 0x10, 0x16], skin: [0xe9, 0xc2, 0xa2], belt: [0xc8, 0xa0, 0x40], neck: 'crew', buttons: false, sleeves: 'long',
      badge: (x, fx, ty) => { x.fillStyle = '#d8b04a'; x.fillRect(0, 0, 512, 16); for (let k = 0; k < 3; k++) { x.fillRect(fx(-0.06), ty(1.4 - k * 0.11), fx(0.06) - fx(-0.06), 7); x.beginPath(); x.arc(fx(0), ty(1.4 - k * 0.11) + 3, 6, 0, 7); x.fill(); } } },
  },
  // Naknik look C (picked by Tristan, 14 Nov): saffron beanie, cardamom-green tee, cumin-brown dungarees with the N badge
  naknik: {
    skin: hex01(0xd8a07a), hair: hex01(0x1d1510), hs: 'normal', hat: 'beanie', hatC: hex01(0xe8a33d), calm: 1, smile: 1, body: 'stocky', B: { nowatch: true },
    shirt: hex01(0xa9c46a), jacket: hex01(0xa9c46a), pants: hex01(0x6a4a2a), shoes: hex01(0x2a1a10), tee: 1,
    shirtPaint: { shirt: [0xa9, 0xc4, 0x6a], pants: [0x6a, 0x4a, 0x2a], skin: [0xd8, 0xa0, 0x7a], tuck: true, neck: 'crew', sleeves: 'rolled', buttons: false,
      badge: (x, fx, ty) => { x.fillStyle = '#6a4a2a'; x.fillRect(fx(-0.13), 0, 10, ty(1.0)); x.fillRect(fx(0.11), 0, 10, ty(1.0)); x.fillRect(fx(-0.13), ty(1.0), fx(0.13) - fx(-0.13), ty(0.6) - ty(1.0)); naknikBadge(x, fx, ty); } },
  },
  eddyJr: {
    tex: 512,
    skin: hex01(0xe4ab88), hair: hex01(0x1d1510), hs: 'curly', glasses: 1, stubble: 1, calm: 1, smile: 1, body: 'fat', neckDrop: 0.03, B: { nowatch: true },
    shirt: hex01(0x86acdf), jacket: hex01(0x86acdf), pants: hex01(0xe9e4d8), shoes: hex01(0x6a3a1c), tee: 1,
    shirtPaint: { shirt: [0x86, 0xac, 0xdf], pants: [0xe9, 0xe4, 0xd8], skin: [0xe4, 0xab, 0x88], belt: [0x5a, 0x30, 0x18], vDepth: 1.38, chestHair: true, chain: true, sleeves: 'long' },
  },
};
