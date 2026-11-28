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
  x.globalAlpha = 1; const g = x.createLinearGradient(0, y0, 0, y0 + h); g.addColorStop(0, 'rgba(255,236,200,.10)'); g.addColorStop(1, 'rgba(26,14,6,.2)'); /* warm spice shading */ x.fillStyle = g; x.fillRect(x0, y0, w, h);
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
/* ---------- character shading: soft toon bands + warm rim light + cloth weave (cheaper than the PBR material it replaces) ----------
   MeshToonMaterial with a 4-step soft gradient; onBeforeCompile adds a saffron rim on the edges that face up and away (what the
   overhead camera sees), and a fill term for the environment light toon materials ignore. Cloth gets a tiled weave normal map.
   SIMPEL graphics (localStorage spiceMasterEddy.gfx = 'simple') keeps the bands but drops the weave and the rim. */
const GFX = (() => { try { return localStorage.getItem('spiceMasterEddy.gfx') || ''; } catch (e) { return ''; } })();
const LITE = GFX === 'simple';
export const charLook = { rim: new THREE.Color(0xffc477), rimK: 0.3, fill: 0.08 }; // shared uniforms: tweak live (night, interiors)
const U_RIM = { value: charLook.rim }, U_RIMK = { value: LITE ? 0 : charLook.rimK }, U_FILL = { value: charLook.fill };
export function setCharLight(o) { if (o.rimK != null) U_RIMK.value = LITE ? 0 : o.rimK; if (o.fill != null) U_FILL.value = o.fill; if (o.rim != null) U_RIM.value.set(o.rim); }
let GRAD = null, WEAVE = null, NOISE = null;
function gradTex() {
  if (GRAD) return GRAD;
  const d = new Uint8Array([66, 66, 66, 255, 112, 112, 112, 255, 166, 166, 166, 255, 208, 208, 208, 255]); // shadow, mid, lit, highlight
  GRAD = new THREE.DataTexture(d, 4, 1, THREE.RGBAFormat); GRAD.minFilter = GRAD.magFilter = THREE.LinearFilter; GRAD.generateMipmaps = false; GRAD.needsUpdate = true;
  return GRAD;
}
function weaveTex() { // a 64 px twill weave as a tangent-space normal map, tiled many times over the clothes sheet
  if (WEAVE) return WEAVE;
  const n = 64, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), im = x.createImageData(n, n), D = im.data;
  const h = (i, j) => { const u = ((i + j) % 8) / 8, v = ((i - j + 64) % 8) / 8; return 0.5 + 0.5 * Math.sin(u * Math.PI * 2) * 0.6 + 0.25 * Math.sin(v * Math.PI * 2) + 0.12 * Math.sin(i * 1.7) * Math.sin(j * 2.3); };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const dx = h((i + 1) % n, j) - h((i + n - 1) % n, j), dy = h(i, (j + 1) % n) - h(i, (j + n - 1) % n), k = 1.6, l = Math.hypot(dx * k, dy * k, 1), o = (j * n + i) * 4;
    D[o] = (0.5 - dx * k / l * 0.5) * 255; D[o + 1] = (0.5 - dy * k / l * 0.5) * 255; D[o + 2] = (0.5 + 0.5 / l) * 255; D[o + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  WEAVE = new THREE.CanvasTexture(c); WEAVE.wrapS = WEAVE.wrapT = THREE.RepeatWrapping; WEAVE.repeat.set(22, 22); WEAVE.colorSpace = THREE.NoColorSpace;
  return WEAVE;
}
// fine fabric grain painted into the clothes sheet once (a shared noise pattern, soft-light blended)
function grain(cv) {
  if (!NOISE) { const n = 96; NOISE = document.createElement('canvas'); NOISE.width = NOISE.height = n; const x = NOISE.getContext('2d'), im = x.createImageData(n, n); for (let i = 0; i < n * n; i++) { const v = 128 + (Math.random() - 0.5) * 120; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); }
  const x = cv.getContext('2d'); x.save(); x.globalCompositeOperation = 'soft-light'; x.globalAlpha = 0.35; x.fillStyle = x.createPattern(NOISE, 'repeat'); x.fillRect(0, 0, cv.width, 400); x.fillRect(0, 440, cv.width, cv.height - 440); x.restore();
}
let GRAD3 = null, CLAY = null;
function grad3() { if (GRAD3) return GRAD3; const d = new Uint8Array([84, 84, 84, 255, 168, 168, 168, 255, 226, 226, 226, 255]); GRAD3 = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); GRAD3.minFilter = GRAD3.magFilter = THREE.NearestFilter; GRAD3.generateMipmaps = false; GRAD3.needsUpdate = true; return GRAD3; }
function clayTex() { // soft lumpy modelling marks as a normal map (clay style), shared and tiled
  if (CLAY) return CLAY;
  const n = 128, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'), im = x.createImageData(n, n), D = im.data, r = rnd('clay'), bumps = [];
  for (let i = 0; i < 40; i++) bumps.push([r() * n, r() * n, 10 + r() * 18, (r() - 0.5) * 2]);
  const H = new Float32Array(n * n);
  for (const [bx, by, br, a] of bumps) for (let j = Math.floor(by - br); j <= by + br; j++) for (let i = Math.floor(bx - br); i <= bx + br; i++) { const d2 = ((i - bx) ** 2 + (j - by) ** 2) / (br * br); if (d2 < 1) H[((j + n) % n) * n + (i + n) % n] += a * (1 - d2) * (1 - d2); }
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const dx = H[j * n + (i + 1) % n] - H[j * n + (i + n - 1) % n], dy = H[((j + 1) % n) * n + i] - H[((j + n - 1) % n) * n + i], k = 0.9, l = Math.hypot(dx * k, dy * k, 1), o = (j * n + i) * 4; D[o] = (0.5 - dx * k / l * 0.5) * 255; D[o + 1] = (0.5 - dy * k / l * 0.5) * 255; D[o + 2] = (0.5 + 0.5 / l) * 255; D[o + 3] = 255; }
  x.putImageData(im, 0, 0); CLAY = new THREE.CanvasTexture(c); CLAY.wrapS = CLAY.wrapT = THREE.RepeatWrapping; CLAY.repeat.set(3, 3); CLAY.colorSpace = THREE.NoColorSpace; return CLAY;
}
function skinGrain(cv, a) { // pores / clay grain on the head sheet below the swatch strip
  grain(document.createElement('canvas')); const x = cv.getContext('2d'); x.save(); x.globalCompositeOperation = 'soft-light'; x.globalAlpha = a; x.fillStyle = x.createPattern(NOISE, 'repeat'); x.fillRect(0, 16, cv.width, cv.height - 16); x.restore();
}
function charMaterial(map, cloth, mode, jig) {
  const head = !cloth;
  const mat = mode === 'latex' && head ? new THREE.MeshPhongMaterial({ map, shininess: 34, specular: new THREE.Color(0x4a3c36) })
    : mode === 'clay' ? new THREE.MeshLambertMaterial({ map })
    : new THREE.MeshToonMaterial({ map, gradientMap: gradTex() });
  if (mode === 'clay' && !LITE) { mat.normalMap = clayTex(); mat.normalScale.set(0.3, 0.3); }
  else if (cloth && !LITE) { const k = mode === 'latex' ? 0.5 : 0.35; mat.normalMap = weaveTex(); mat.normalScale.set(k, k); }

  mat.onBeforeCompile = (sh) => {
    if (jig) { /* butt jiggle: each cheek (a soft ellipsoid behind the hips, in rest space) is pushed by its own spring (jiggleStep) */
      sh.uniforms.uJigL = jig.L; sh.uniforms.uJigR = jig.R;
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform vec3 uJigL; uniform vec3 uJigR;\nfloat cheek(vec3 p, float sx) { vec3 d = (p - vec3(sx * 0.07, 0.89, -0.09)) / vec3(0.09, 0.11, 0.1); float m = 1.0 - clamp(dot(d, d), 0.0, 1.0); return m * m * smoothstep(0.0, -0.07, p.z); }')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += uJigL * cheek(position, 1.0) + uJigR * cheek(position, -1.0);');
    }
    sh.uniforms.uRim = U_RIM; sh.uniforms.uRimK = U_RIMK; sh.uniforms.uFill = U_FILL;
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform vec3 uRim; uniform float uRimK; uniform float uFill;')
      .replace('#include <opaque_fragment>', `{ vec3 vd = normalize(vViewPosition); float f = 1.0 - clamp(dot(normal, vd), 0.0, 1.0);
        float up = clamp(dot(normal, (viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz) * 0.5 + 0.5, 0.0, 1.0);
        outgoingLight += diffuseColor.rgb * (uFill + uRim * (pow(f, 4.0) * uRimK * 2.2 * (0.3 + 0.7 * up))); /* rim tinted by the surface: a navy suit stays navy */
        ${mode === 'print' ? `/* spotprent: pen hatching in the shadow band, an ink contour and a newsprint tint */
        float lit = dot(outgoingLight, vec3(0.333)) / max(dot(diffuseColor.rgb, vec3(0.333)), 0.02);
        float hx = step(0.55, fract((gl_FragCoord.x - gl_FragCoord.y) * 0.21)), hy = step(0.6, fract((gl_FragCoord.x + gl_FragCoord.y) * 0.21));
        float sh = (1.0 - smoothstep(0.5, 0.62, lit)) * hx + (1.0 - smoothstep(0.3, 0.4, lit)) * hy;
        outgoingLight *= 1.0 - 0.34 * clamp(sh, 0.0, 1.0) * (1.0 - smoothstep(3.0, 8.0, length(vViewPosition))); /* pen lines only close up: far away they read as dirt */
        outgoingLight = mix(outgoingLight, vec3(0.16, 0.09, 0.06), smoothstep(0.7, 0.86, f) * 0.85);
        float g = dot(outgoingLight, vec3(0.3, 0.55, 0.15)); outgoingLight = mix(vec3(g), outgoingLight, 0.8) * vec3(1.04, 1.0, 0.92);` : ''}
        ${mode === 'clay' ? 'outgoingLight = mix(outgoingLight, outgoingLight * vec3(1.06, 0.98, 0.9), 0.6);' : ''}
        ${mode === 'latex' ? 'outgoingLight += diffuseColor.rgb * vec3(0.10, 0.03, 0.02) * (1.0 - clamp(dot(normal, vd), 0.0, 1.0));' : ''} }
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'smeChar' + (mode || '') + (head ? 'H' : '') + (mat.normalMap ? 'N' : '') + (jig ? 'J' : '');
  return mat;
}

/* ---------- character style: persiflage options (dev: ?charstyle=spotprent|rubber|klei; game: localStorage spiceMasterEddy.charStyle) ----------
   The toon cast is the default. A persiflage style is a satirical caricature: a bigger head with a sculpted nose, ears, jowls
   and brow (ps2c.js buildHead B.px), a face painted over in that style (pxFace) and its own surface (charMaterial mode).
   Each person gets their own exaggeration from their look (older, heavier, balder people get more of it). */
export const CHAR_STYLE = (() => { try { return new URLSearchParams(location.search).get('charstyle') || localStorage.getItem('spiceMasterEddy.charStyle') || 'spotprent'; } catch (e) { return 'spotprent'; } })();
const rnd = (seed) => { let h = 2166136261; for (const ch of seed) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; };
const INKC = 'rgba(40,22,16,';
function softF(y) { return (cx, cy, rx, ry, col) => { const g = y.createRadialGradient(cx, cy, 0, cx, cy, 1); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); y.save(); y.translate(cx, cy); y.scale(rx, ry); y.fillStyle = g; y.fillRect(-1, -1, 2, 2); y.restore(); }; }
function faceSpotprent(y, F) { // newspaper caricature: pen lines and cross-hatching (the Dutch spotprent)
  const { C, V, L } = F, r = rnd(JSON.stringify(L.skin) + L.hs), old = L.pxOld, ey = V(1.705);
  const line = (a, w, pts) => { y.strokeStyle = INKC + a + ')'; y.lineWidth = w; y.beginPath(); y.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 4) y.quadraticCurveTo(pts[i], pts[i + 1], pts[i + 2], pts[i + 3]); y.stroke(); };
  for (const s of [1, -1]) {
    line(0.75, 1.1, [C + s * 8, V(1.668), C + s * 14, V(1.652), C + s * 13, V(1.628)]); // nasolabial fold
    line(0.5, 0.8, [C + s * 7, ey + 5, C + s * 12, ey + 8.5, C + s * 18, ey + 5]); // eye bag
    if (old) line(0.4, 0.7, [C + s * 8, ey + 8, C + s * 13, ey + 11.5, C + s * 19, ey + 8]);
    for (let k = 0; k < 3; k++) line(0.45, 0.6, [C + s * 20, ey - 1 + k * 2.6, C + s * 23, ey - 1.5 + k * 3.2, C + s * 25.5, ey - 2 + k * 4]); // crow's feet
    for (let k = 0; k < 6; k++) { const x0 = C + s * (17 + k * 2.1); line(0.24, 0.55, [x0 + s * 3, V(1.67), x0 + s * 1.5, V(1.652), x0 - s * 1, V(1.636) + k * 0.8]); } // hatching under the cheekbone
    for (let k = 0; k < 5; k++) { const x0 = C + s * (5 + k * 1.6); line(0.28, 0.5, [x0, ey - 13 - k * 0.4, x0 + s * 1, ey - 16, x0 + s * 2, ey - 19]); } // brow shading
  }
  const nf = old ? 4 : 2; for (let k = 0; k < nf; k++) { const yy = V(1.752) - k * 4.2; line(0.4, 0.75, [C - 15, yy + r() * 1.5, C - 5, yy - 1.8, C, yy, C + 6, yy + 1.4, C + 15, yy - r() * 1.5]); } // forehead lines
  line(0.55, 0.9, [C - 5, V(1.618), C, V(1.612), C + 5, V(1.618)]); // chin crease
}
function faceRubber(y, F) { // latex satire puppet: airbrushed blotches, deep sculpted creases, ruddy cheeks, a sheen
  const { C, V, L, SKIN, rgb } = F, r = rnd(JSON.stringify(L.skin) + 'r'), ey = V(1.705), soft = softF(y);
  const dk = SKIN.map((v) => v * 0.5), lt = SKIN.map((v) => Math.min(255, v * 1.2 + 14));
  for (let i = 0; i < 26; i++) soft(C + (r() - 0.5) * 60, V(1.74) + r() * 70, 3 + r() * 6, 2 + r() * 5, `rgba(${170 + r() * 50 | 0},${60 + r() * 30 | 0},${70 + r() * 30 | 0},${0.1 + r() * 0.14})`);
  for (const s of [1, -1]) {
    soft(C + s * 12, ey, 14, 10, rgb(dk, 0.3)); // deep sockets
    soft(C + s * 21, V(1.662), 12, 9, 'rgba(214,70,70,.38)'); // ruddy cheeks
    y.strokeStyle = 'rgba(190,50,60,.22)'; y.lineWidth = 0.45; for (let k = 0; k < 3; k++) { const vx = C + s * (16 + r() * 8), vy = V(1.67) + r() * 6; y.beginPath(); y.moveTo(vx, vy); y.lineTo(vx + s * (1.5 + r() * 2), vy + 1 + r() * 2); y.stroke(); } // broken veins
    for (const [w, a, c, o] of [[3.4, 0.38, dk, 0], [1.0, 0.22, lt, 1.6]]) { y.strokeStyle = rgb(c, a); y.lineWidth = w; y.beginPath(); y.moveTo(C + s * 9, V(1.672)); y.quadraticCurveTo(C + s * 16, V(1.652), C + s * (14 + o), V(1.622)); y.stroke(); } // sculpted fold
    soft(C + s * 20, V(1.69), 6, 3, rgb(lt, 0.55)); // cheekbone sheen
    soft(C + s * 12, ey + 7, 9, 3.2, rgb(dk, 0.3)); // bags
  }
  for (let k = 0; k < 3; k++) { const yy = V(1.756) - k * 5; y.strokeStyle = rgb(dk, 0.3); y.lineWidth = 2.2; y.beginPath(); y.moveTo(C - 17, yy + 1); y.quadraticCurveTo(C, yy - 2.5, C + 17, yy + 1); y.stroke(); y.strokeStyle = rgb(lt, 0.4); y.lineWidth = 1; y.beginPath(); y.moveTo(C - 16, yy + 2.6); y.quadraticCurveTo(C, yy - 0.8, C + 16, yy + 2.6); y.stroke(); }
  soft(C - 4, V(1.775), 12, 6, 'rgba(255,250,240,.35)'); // forehead sheen
  soft(C, V(1.612), 9, 4, rgb(dk, 0.28));
}
function faceKlei(y, F) { // stop-motion clay: thumb smudges and modelling marks, soft and matte
  const { C, V, L, SKIN, rgb } = F, r = rnd(JSON.stringify(L.skin) + 'k'), ey = V(1.705), soft = softF(y);
  const dk = SKIN.map((v) => v * 0.62), lt = SKIN.map((v) => Math.min(255, v * 1.12 + 8));
  for (let i = 0; i < 18; i++) { const cx = C + (r() - 0.5) * 64, cy = V(1.79) + r() * 80, a = r() * 3, c = r() > 0.5 ? lt : dk; y.save(); y.translate(cx, cy); y.rotate(a); y.strokeStyle = rgb(c, 0.22); y.lineWidth = 0.7; for (let k = 0; k < 3; k++) { y.beginPath(); y.arc(0, 0, 2 + k * 1.6, 0.3, 2.6); y.stroke(); } y.restore(); } // thumbprints
  for (const s of [1, -1]) {
    soft(C + s * 10, V(1.66), 4, 9, rgb(dk, 0.32)); soft(C + s * 12, V(1.64), 3, 8, rgb(dk, 0.22)); // pressed-in folds
    soft(C + s * 12, ey + 6, 8, 2.6, rgb(dk, 0.2));
    soft(C + s * 20, V(1.68), 8, 6, rgb(lt, 0.3));
  }
  soft(C, V(1.765), 18, 7, rgb(lt, 0.28));
}
const STYLES = {
  toon: null,
  spotprent: { head: 1.3, hand: 1.15, foot: 1.12, mat: 'print', px: { nose: 1.5, ear: 1.12, jaw: 0.006, brow: 2, chin: 1.5 }, L: { eyeK: 0.82, irisK: 0.7, pxFace: faceSpotprent } },
  rubber: { head: 1.42, hand: 1.25, foot: 1.1, mat: 'latex', px: { nose: 1.9, ear: 1.22, jaw: 0.012, brow: 2.6, chin: 1.9, chinOut: 0.004 }, L: { eyeK: 0.95, lidK: 0.82, irisK: 0.8, pxFace: faceRubber, rednose: 1 } },
  klei: { head: 1.2, hand: 1.22, foot: 1.18, mat: 'clay', px: { nose: 1.35, ear: 1.08, jaw: 0.004, brow: 1.6, chin: 1.2 }, L: { eyeK: 1.08, irisK: 1.05, pxFace: faceKlei } },
};
const STY = STYLES[CHAR_STYLE] || null;
const q1 = (v) => Math.round(v * 10) / 10; // quantised so heads still share geometry
// the persiflage look for one person: the style's base caricature bent by who they are
function styleLook(look) {
  if (!STY || look.toon === false || look.noPx || look.pxMat) return look;
  const r = rnd(JSON.stringify([look.skin, look.hair, look.hs, look.body, look.shirt])), hair = look.hair, old = !!(hair && hair[0] > 0.6 && Math.abs(hair[0] - hair[2]) < 0.16);
  const heavy = look.body === 'fat' ? 1.6 : look.body === 'stocky' || look.body === 'big' ? 1.25 : 1, k = look.pxK || {};
  const px = { ...STY.px, nose: q1(STY.px.nose * (0.85 + r() * 0.4) * (old ? 1.12 : 1) * (k.nose || 1)), droop: q1((old ? 0.006 : r() * 0.004) * 1000) / 1000, hook: r() > 0.7 ? 1 : 0,
    noseW: q1(0.9 + r() * 0.3), ear: q1(STY.px.ear * (0.9 + r() * 0.25) * (look.hs ? 1 : 1.12) * (k.ear || 1)), jaw: Math.round(STY.px.jaw * heavy * (old ? 1.3 : 1) * (k.jaw || 1) * 1000) / 1000 };
  if (look.fem) { px.nose = q1(px.nose * 0.7); px.jaw *= 0.3; px.brow *= 0.5; px.ear = q1(px.ear * 0.85); }
  const L = { ...look, ...STY.L, noNose: true, pxOld: old, headScale: look.headScale ?? STY.head, handScale: STY.hand, footScale: STY.foot, pxMat: STY.mat };
  if (STY.L.rednose) L.noseC = [Math.min(1, look.skin[0] * 1.03 + 0.03), look.skin[1] * 0.86, look.skin[2] * 0.84];
  else L.noseC = look.skin.map((v) => v * 0.96);
  L.B = { ...(look.B || {}), px };
  return L;
}
const SPHERE = new THREE.Sphere(new THREE.Vector3(0, 0.9, 0), 2.2); // covers standing and lying poses
export function prepModel(look) {
  look = styleLook(look);
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
  if (look.smile && look.toon === false) P.paintSmile(hc, {}); // toon faces paint their own mouth (ps2c.js paintToonFace)
  if (look.paintHead) look.paintHead(hc);
  const bc = P.paintBodyP(look);
  if (look.shirtPaint) paintShirt(bc, look.shirtPaint);
  if (look.paintBody) look.paintBody(bc);
  // extras get 256 px sheets (a quarter of the memory); the named cast keeps 512 (look.tex)
  const ts = look.tex || 256, shrink = (cv) => { if (cv.width <= ts) return cv; const c = document.createElement('canvas'); c.width = c.height = ts; const g = c.getContext('2d'); g.imageSmoothingQuality = 'high'; g.drawImage(cv, 0, 0, ts, ts); return c; };
  const key = JSON.stringify(cfg.B);
  let geos = geoCache.get(key);
  if (!geos) { geos = [geometry(P.buildBody(cfg.B)), geometry(P.buildHead(cfg.B))]; geoCache.set(key, geos); }
  grain(bc);
  if (look.pxMat === 'clay' || look.pxMat === 'latex') skinGrain(hc, look.pxMat === 'clay' ? 0.12 : 0.1);
  [shrink(bc), shrink(hc)].forEach((cv, i) => {
    const jig = i === 0 && look.jiggle ? (md.jig = { L: { value: new THREE.Vector3() }, R: { value: new THREE.Vector3() } }) : null;
    const mat = charMaterial(canvasTex(cv), i === 0, look.pxMat, jig);
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
  root.userData = { legs, arms, head, body, phase: 0, ps2: { md, look: md.look, seed: Math.random() * 100, moving: false, last: [0, 0, 0, 0, 0, 0], gait: md.cfg.gait } };
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

const HEAD_K = 1.1, hsCache = new Map();
function headScaleM(k) { let m = hsCache.get(k); if (!m) { const pv = P.BONES[P.BI.head][2]; m = P.M4.mul(P.M4.T(pv[0], pv[1], pv[2]), P.M4.mul([k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, 0, 0, 0, 1], P.M4.T(-pv[0], -pv[1], -pv[2]))); hsCache.set(k, m); } return m; }
function boneScaleM(b, k) { const key = b + k; let m = hsCache.get(key); if (!m) { const pv = P.BONES[P.BI[b]][2]; m = P.M4.mul(P.M4.T(pv[0], pv[1], pv[2]), P.M4.mul([k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0, 0, 0, 0, 1], P.M4.T(-pv[0], -pv[1], -pv[2]))); hsCache.set(key, m); } return m; }
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
  const holding = !!(u.hold && u.hold.gun && !u.seated && Math.abs(u.body.rotation.x) < 1); // a gun in setHold(): the IK below places the arms
  if (holding) arms = null;
  else if (!arms && !u.seated && u.arms[0].visible) {
    if (a0 < -2.2) { arms = 'melee'; kick = 0; }
    else if (a0 > 0.3) { arms = 'melee'; kick = 1; }
    else if (a0 < -1.2) arms = a1 < -1.0 ? (Math.abs(a0 - a1) < 0.2 ? 'dual' : 'rifle') : 'aim1';
  }
  const W = P.pose(t, base || (walk ? 'walk' : 'idle'), undefined, arms, kick, q.gait, (R, rot, lower, hinge) => {
    for (let i = 0; i < 2; i++) {
      const a = u.arms[i], A = ARM[i];
      if (!arms && !holding && (Math.abs(a.rotation.x) > 0.02 || Math.abs(a.rotation.z) > 0.02)) {
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
  if (holding) { const hdt = Math.min(0.1, (now - (q.holdT || now)) / 1000); q.holdT = now; applyHold(p, W, hdt); }
  else if (u.hold) { q.holdT = now; for (const g of [u.hold.gun, u.hold.gun2]) if (g && g.parent === u.body && !u.seated) layDown(p, g, W); }
  // cut limbs: collapse the bone group to a point at its pivot
  const cut = [];
  if (!u.arms[0].visible) cut.push(CUT.arm0);
  if (!u.arms[1].visible) cut.push(CUT.arm1);
  if (!u.head.visible) cut.push(CUT.head);
  if (q.look.neckDrop) W[P.BI.head] = P.M4.mul(P.M4.T(0, -q.look.neckDrop, 0), W[P.BI.head]);
  // toon proportions: a slightly bigger head (scaled about the neck pivot) so faces read from the game camera; hats and props ride along
  const hk = q.look.headScale ?? (q.look.toon === false ? 1 : HEAD_K);
  if (hk !== 1) W[P.BI.head] = P.M4.mul(W[P.BI.head], headScaleM(hk));
  if (q.look.handScale) for (const b of ['handL', 'handR']) W[P.BI[b]] = P.M4.mul(W[P.BI[b]], boneScaleM(b, q.look.handScale));
  if (q.look.footScale) for (const b of ['footL', 'footR']) W[P.BI[b]] = P.M4.mul(W[P.BI[b]], boneScaleM(b, q.look.footScale));
  for (const grp of cut) {
    const b0 = P.BI[grp[0]], pv = P.M4.ap(W[b0], P.BONES[b0][2]);
    const z = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, pv[0], pv[1], pv[2], 1];
    for (const nm of grp) W[P.BI[nm]] = z;
  }
  return W;
}

/* ---------- holding guns: place the gun first, then reach both hands for it (two-bone IK) ----------
   setHold(p, { gun, gun2, stance, aim }) — gun: a weapons.js group (grip origin, barrel +Z), gun2: the left-hand gun of a
   pair; stance: 'pistol' (two hands, cupped), 'pistol1' (one hand), 'smg', 'rifle' (shouldered), 'dual'.
   aim 1 = raised, 0 = low ready. holdRecoil(p, kick, left) jolts the gun back and up; the hands ride along. */
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const STANCE = { // [grip position, yaw, pitch, roll] in the body's rest space (facing +Z, the right hand at -X); [aim, ready]
  rifle: [[V3(-0.12, 1.28, 0.28), 0.1, 0, 0], [V3(-0.15, 1.04, 0.2), 0.6, 0.5, 0.2]],
  smg: [[V3(-0.09, 1.25, 0.33), 0.08, 0, 0], [V3(-0.12, 1.04, 0.22), 0.45, 0.6, 0.1]],
  pistol: [[V3(-0.05, 1.31, 0.43), 0.06, 0, 0], [V3(-0.09, 1.02, 0.25), 0.15, 0.85, 0]],
  pistol1: [[V3(-0.165, 1.33, 0.47), 0.02, 0, -0.18], [V3(-0.2, 0.98, 0.14), 0.05, 1.05, 0]],
  dual: [[V3(-0.19, 1.31, 0.45), -0.06, 0, -0.1], [V3(-0.21, 0.98, 0.15), 0, 1.05, 0]],
};
const TWIST = { rifle: -0.42, smg: -0.22, pistol: 0, pistol1: 0.25, dual: 0 }; // torso turn (bladed stance), the head keeps looking ahead
const KICK = { rifle: 0.07, smg: 0.05, pistol: 0.045, pistol1: 0.05, dual: 0.05 };
const POLE = [V3(-0.75, -1, -0.35).normalize(), V3(0.75, -1, -0.35).normalize()];
const POLE_RIFLE = [V3(-1, -0.45, -0.3).normalize(), V3(0.6, -1, 0).normalize()];
const ARMLEN = [Math.hypot(...P.V.sub(P.EL, P.SH)), Math.hypot(...P.V.sub(P.WR, P.EL))];
const REST = [-1, 1].map((s) => { // each hand's rest frame at the fist: z = hand axis, y = thumb side (+Z), x = y × z
  const a = V3(P.AD[0] * s, P.AD[1], 0), w = s > 0 ? P.WR : P.mir(P.WR), y = V3(0, 0, 1), x = y.clone().cross(a);
  const m = new THREE.Matrix4().makeBasis(x, y, a).setPosition(V3(...w).addScaledVector(a, 0.065));
  return { m, inv: m.clone().invert(), sh: V3(...(s > 0 ? P.SH : P.mir(P.SH))), el: V3(...(s > 0 ? P.EL : P.mir(P.EL))), wr: V3(...w), hinge: V3(P.AD[0] * s, P.AD[1], 0).cross(V3(0, 0, 1)).normalize() };
});
const tq = new THREE.Quaternion(), tq2 = new THREE.Quaternion(), tE = new THREE.Euler(), tv = [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector3());
const mA = new THREE.Matrix4(), mB = new THREE.Matrix4(), mR = new THREE.Matrix4(), mT1 = new THREE.Matrix4(), mT2 = new THREE.Matrix4(), mU = new THREE.Matrix4(), mF = new THREE.Matrix4();
export function setHold(p, h) {
  const u = p.userData, old = u.hold;
  for (const k of ['gun', 'gun2']) { const g = old && old[k]; if (g && (!h || h[k] !== g) && g.parent) g.parent.remove(g); }
  if (h) { h.a = h.a ?? (old ? old.a : h.aim ?? 1); h.r = h.r || 0; h.r2 = h.r2 || 0; h.aim = h.aim ?? 1; }
  u.hold = h || null;
}
export function holdPump(p) { const h = p.userData.hold; if (h) h.pumpT = 0; } // rack the pump (support hand slides back and forth)
export function holdRecoil(p, kick = 1, left = false) { const h = p.userData.hold; if (!h) return; if (left) h.r2 = Math.min(1.6, h.r2 + kick); else h.r = Math.min(1.6, h.r + kick); }
// gun frame (body space) for one side: blend ready -> aim, follow the chest, add recoil
function gunFrame(out, st, a, side, rec, chestOff) {
  const [A, R] = STANCE[st] || STANCE.pistol;
  const pos = tv[0].copy(R[0]).lerp(A[0], a);
  tq.setFromEuler(tE.set(R[2], R[1], R[3], 'YXZ')); tq2.setFromEuler(tE.set(A[2], A[1], A[3], 'YXZ')); tq.slerp(tq2, a);
  if (side > 0) { pos.x = -pos.x; tq.y = -tq.y; tq.z = -tq.z; } // mirror for the left hand
  pos.add(chestOff);
  out.compose(pos, tq, tv[1].set(1, 1, 1));
  if (rec > 0.001) { const k = KICK[st] || 0.05; out.multiply(mR.makeTranslation(0, rec * 0.012, -rec * k)).multiply(mR.makeRotationX(-rec * (st === 'rifle' ? 0.22 : 0.42))); }
  return out;
}
const aboutPoint = (out, c, q) => out.makeTranslation(c.x, c.y, c.z).multiply(mT1.makeRotationFromQuaternion(q)).multiply(mT2.makeTranslation(-c.x, -c.y, -c.z));
// hand target frame -> hand bone matrix, then bend the arm so the wrist lands where the hand starts
function reach(W, i, target, pole) {
  const A = ARM[i], r = REST[i];
  const Hd = mA.multiplyMatrices(target, r.inv);
  const Wu = mB.fromArray(W[P.BI[A.u]]), S = tv[2].copy(r.sh).applyMatrix4(Wu);
  const T = tv[3].copy(r.wr).applyMatrix4(Hd), d = tv[4].subVectors(T, S);
  const a = ARMLEN[0], b = ARMLEN[1]; let L = d.length();
  const Lc = Math.min(a + b - 0.004, Math.max(0.1, L));
  if (Lc !== L) { d.multiplyScalar(Lc / L); const dv = tv[5].addVectors(S, d).sub(T); Hd.premultiply(mR.makeTranslation(dv.x, dv.y, dv.z)); T.add(dv); L = Lc; }
  const n = d.normalize(), x = (a * a - b * b + L * L) / (2 * L), hh = Math.sqrt(Math.max(0, a * a - x * x));
  const pp = tv[5].copy(pole).addScaledVector(n, -pole.dot(n)); if (pp.lengthSq() < 1e-6) pp.set(0, -1, 0); pp.normalize();
  const E = tv[6].copy(S).addScaledVector(n, x).addScaledVector(pp, hh);
  // upper arm: swing its elbow onto E, then roll it so the elbow hinge is square to the arm plane
  const u0 = tv[7].copy(r.el).applyMatrix4(Wu).sub(S).normalize(), u1 = tv[1].subVectors(E, S).normalize();
  tq.setFromUnitVectors(u0, u1);
  const f1 = tv[0].subVectors(T, E).normalize();
  const hW = r.hinge.clone().transformDirection(Wu).applyQuaternion(tq), hWant = u1.clone().cross(f1);
  if (hWant.lengthSq() > 1e-6) { hWant.normalize(); hW.addScaledVector(u1, -hW.dot(u1)).normalize(); tq.premultiply(tq2.setFromAxisAngle(u1, Math.atan2(u1.dot(hW.clone().cross(hWant)), hW.dot(hWant)))); }
  const Ru = aboutPoint(mU, S, tq);
  const Wf = mF.multiplyMatrices(Ru, mR.fromArray(W[P.BI[A.f]]));
  Ru.multiply(Wu); // Ru is now the new upper arm
  // forearm: point it at the wrist, then roll it to match the hand so the wrist skin doesn't twist
  const wc = tv[7].copy(r.wr).applyMatrix4(Wf).sub(E).normalize();
  tq.setFromUnitVectors(wc, f1);
  const zF = tv[4].set(0, 0, 1).transformDirection(Wf).applyQuaternion(tq), zH = tv[5].set(0, 0, 1).transformDirection(Hd);
  zF.addScaledVector(f1, -zF.dot(f1)); zH.addScaledVector(f1, -zH.dot(f1));
  if (zF.lengthSq() > 1e-6 && zH.lengthSq() > 1e-6) { zF.normalize(); zH.normalize(); tq.premultiply(tq2.setFromAxisAngle(f1, Math.atan2(f1.dot(zF.clone().cross(zH)), zF.dot(zH)))); }
  Wf.premultiply(aboutPoint(mB, E, tq));
  Ru.toArray(W[P.BI[A.u]]); Wf.toArray(W[P.BI[A.f]]); Hd.toArray(W[P.BI[A.h]]);
}
const G1 = new THREE.Matrix4(), G2 = new THREE.Matrix4(), HT = new THREE.Matrix4(), chestRest = new THREE.Vector3(0, 1.36, 0), chestOff = new THREE.Vector3();
function holdFrame(g, G, sc) { // put the gun mesh at G (body space), undoing the body's uneven x/z scale
  if (!g) return;
  if (g.matrixAutoUpdate) g.matrixAutoUpdate = false;
  g.matrix.copy(G).multiply(mR.makeScale(sc.y / sc.x, 1, sc.y / sc.z));
  g.matrixWorldNeedsUpdate = true; g.updateMatrixWorld(true);
}
function layDown(p, g, W) { // knocked down with a gun: it stays in the fist
  const i = g === p.userData.hold.gun2 ? 1 : 0;
  holdFrame(g, G1.fromArray(W[P.BI[ARM[i].h]]).multiply(REST[i].m), p.userData.body.scale);
}
function applyHold(p, W, dt) {
  const u = p.userData, h = u.hold, st = h.stance || 'pistol';
  h.a += (h.aim - h.a) * Math.min(1, dt * 9); h.r *= Math.exp(-dt * 13); h.r2 *= Math.exp(-dt * 13);
  let rack = 0; if (h.pumpT !== undefined) { h.pumpT += dt; const t = (h.pumpT - 0.12) / 0.38; rack = t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0; if (h.pumpT > 0.5) h.pumpT = undefined; }
  const pumpG = h.gun && h.gun.userData.pump; if (pumpG) pumpG.position.z = -0.07 * rack;
  if (h.gun && h.gun.parent !== u.body) u.body.add(h.gun);
  if (h.gun2 && h.gun2.parent !== u.body) u.body.add(h.gun2);
  const tw = (TWIST[st] || 0) * h.a;
  if (tw) { // turn the upper body about the spine, then the neck back so the head faces the target
    const sp = P.BONES[P.BI.spine][2], nk = P.BONES[P.BI.neck][2];
    aboutPoint(mA, tv[0].set(sp[0], sp[1], sp[2]), tq.setFromAxisAngle(tv[1].set(0, 1, 0), tw));
    for (let b = P.BI.spine; b <= P.BI.handR; b++) mB.fromArray(W[b]).premultiply(mA).toArray(W[b]);
    const n = tv[2].set(nk[0], nk[1], nk[2]).applyMatrix4(mB.fromArray(W[P.BI.neck]));
    aboutPoint(mA, n, tq.setFromAxisAngle(tv[1].set(0, 1, 0), -tw * 0.85));
    for (const b of [P.BI.neck, P.BI.head]) mB.fromArray(W[b]).premultiply(mA).toArray(W[b]);
  }
  chestOff.copy(chestRest).applyMatrix4(mB.fromArray(W[P.BI.chest])).sub(chestRest);
  gunFrame(G1, st, h.a, -1, h.r, chestOff);
  const rifle = st === 'rifle' || st === 'smg', poles = rifle ? POLE_RIFLE : POLE;
  if (u.arms[0].visible) reach(W, 0, G1, poles[0]);
  if (st === 'dual') { gunFrame(G2, st, h.a, 1, h.r2, chestOff); if (u.arms[1].visible) reach(W, 1, G2, poles[1]); }
  else if (st !== 'pistol1' && u.arms[1].visible) {
    const gx = new THREE.Vector3().setFromMatrixColumn(G1, 0), gy = new THREE.Vector3().setFromMatrixColumn(G1, 1), gz = new THREE.Vector3().setFromMatrixColumn(G1, 2);
    let o, z, y;
    if (rifle && h.gun && h.gun.userData.fore) { // support hand under the handguard, palm up, thumb along the barrel
      o = h.gun.userData.fore.clone().addScaledVector(tv[3].set(0, 0, 1), -0.083 * rack).applyMatrix4(G1).addScaledVector(gy, -0.03);
      z = gx.clone().multiplyScalar(-1).addScaledVector(gy, 0.45).normalize(); y = gz.clone();
    } else { // cupping the shooting hand
      o = new THREE.Vector3(0.035, -0.03, -0.005).applyMatrix4(G1);
      y = gy.clone(); z = gz.clone().multiplyScalar(0.75).addScaledVector(gx, -0.66).normalize();
    }
    y.addScaledVector(z, -y.dot(z)).normalize(); const x = y.clone().cross(z);
    reach(W, 1, HT.makeBasis(x, y, z).setPosition(o), poles[1]);
  }
  const sc = u.body.scale;
  holdFrame(h.gun, G1, sc); if (st === 'dual') holdFrame(h.gun2, G2, sc);
}

function inScene(o) { for (let n = o; n; n = n.parent) if (n.isScene) return true; return false; }
function visibleInScene(o) { for (let n = o; n; n = n.parent) { if (!n.visible) return false; if (n.isScene) return true; } return false; }

// sync every live character's bones to its pose; runs right before each render (scene.onBeforeRender)
const frustum = new THREE.Frustum(), pv = new THREE.Matrix4(), ball = new THREE.Sphere();
const JV = new THREE.Vector3(), JA = new THREE.Vector3(), JQ = new THREE.Quaternion();
const JIG = [{ k: 190, c: 5.5 }, { k: 160, c: 5 }]; // the two cheeks ring at slightly different rates, so they don't move as one block
function jiggleStep(p, W, now) {
  const q = p.userData.ps2, md = q.md; if (!md.jig) return;
  const j = q.jg || (q.jg = { t: now, pos: null, vel: new THREE.Vector3(), s: [0, 1].map(() => ({ x: new THREE.Vector3(), v: new THREE.Vector3() })) });
  const dt = Math.min(1 / 30, (now - j.t) / 1000); j.t = now; if (dt <= 0) return;
  const pv = P.M4.ap(W[0], [0, 0.95, -0.06]); JV.set(pv[0], pv[1], pv[2]).applyMatrix4(p.userData.body.matrixWorld);
  if (!j.pos) { j.pos = JV.clone(); return; }
  const vel = JA.copy(JV).sub(j.pos).divideScalar(dt); j.pos.copy(JV);
  const acc = vel.clone().sub(j.vel).divideScalar(dt); j.vel.copy(vel);
  acc.clampLength(0, 60).applyQuaternion(p.userData.body.getWorldQuaternion(JQ).invert()); // into the body's own frame
  for (let i = 0; i < 2; i++) {
    const c = j.s[i], { k, c: damp } = JIG[i];
    for (let n = 0; n < 2; n++) { const h = dt / 2; c.v.addScaledVector(c.x, -k * h).addScaledVector(c.v, -damp * h).addScaledVector(acc, -h * 2.4); c.x.addScaledVector(c.v, h); }
    c.x.y = clamp(c.x.y, -0.035, 0.035); c.x.x = clamp(c.x.x, -0.015, 0.015); c.x.z = clamp(c.x.z, -0.02, 0.02);
  }
  md.jig.L.value.copy(j.s[0].x); md.jig.R.value.copy(j.s[1].x);
}
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
    if (u.ps2.md.jig) jiggleStep(p, W, now);
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
  // a full beard only when the head asks for a 3D one; a plain beard colour is the portraits' stubble shadow
  if (hd.beard3d) { L.beard = hex01(css(hd.beard3d)); L.fluff = true; }
  else if (hd.beard) { L.stubble = 1; L.stubbleC = hex01(css(hd.beard)); }
  if (hd.stubble) L.stubble = 1;
  // portrait face options: iris colour, brow colour and weight, squint, mouth shape
  if (hd.iris) L.iris = hex01(css(hd.iris));
  if (hd.brow) L.browC = hex01(css(hd.brow));
  if (hd.browW) L.browW = Math.min(4.4, 2.6 + hd.browW * 0.3);
  if (hd.squint) L.squint = 1;
  if (hd.mouth) L.mouth = hd.mouth === 'laugh' ? 'laugh' : hd.mouth === 'flat' ? 'flat' : hd.mouth === 'frown' ? 'frown' : 'smile';
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
    skin: hex01(0xdc9c82), hair: hex01(0xeceae4), hs: 'slick', stache: 1, beard: null, calm: 1, smile: 1, mouth: 'smile', squint: 1, browC: hex01(0xc8c4bc), browW: 4.2, body: 'stocky', B: { nowatch: true },
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
    skin: hex01(0xd8a07a), hair: hex01(0x1d1510), hs: 'normal', hat: 'beanie', hatC: hex01(0xe8a33d), calm: 1, smile: 1, mouth: 'laugh', iris: hex01(0x2a4a8a), body: 'stocky', B: { nowatch: true },
    shirt: hex01(0xa9c46a), jacket: hex01(0xa9c46a), pants: hex01(0x6a4a2a), shoes: hex01(0x2a1a10), tee: 1,
    shirtPaint: { shirt: [0xa9, 0xc4, 0x6a], pants: [0x6a, 0x4a, 0x2a], skin: [0xd8, 0xa0, 0x7a], tuck: true, neck: 'crew', sleeves: 'rolled', buttons: false,
      badge: (x, fx, ty) => { x.fillStyle = '#6a4a2a'; x.fillRect(fx(-0.13), 0, 10, ty(1.0)); x.fillRect(fx(0.11), 0, 10, ty(1.0)); x.fillRect(fx(-0.13), ty(1.0), fx(0.13) - fx(-0.13), ty(0.6) - ty(1.0)); naknikBadge(x, fx, ty); } },
  },
  // Johan: Eddy's childhood friend with The Letter (js/johan.js), after his photo: dark swept-back hair, stubble, navy blazer
  // over an open white shirt, dark trousers, brown loafers, a gold watch
  johan: {
    tex: 512, skin: hex01(0xe8bc9c), hair: hex01(0x3a2a1e), hs: 'slick', stubble: 1, smile: 1, calm: 0.6, body: 'slim', watch: 1,
    shirt: hex01(0x1e2a4a), jacket: hex01(0x1e2a4a), pants: hex01(0x1a1e2a), shoes: hex01(0x6a3a1c), tee: 1,
    shirtPaint: { shirt: [0x1e, 0x2a, 0x4a], pants: [0x1a, 0x1e, 0x2a], skin: [0xf2, 0xf0, 0xea], belt: [0x6a, 0x3a, 0x1c], vDepth: 1.36, chain: false, sleeves: 'long', buttons: true },
  },
  eddyJr: {
    tex: 512,
    skin: hex01(0xe4ab88), hair: hex01(0x1d1510), hs: 'curly', glasses: 1, stubble: 1, calm: 1, smile: 1, mouth: 'smile', body: 'fat', neckDrop: 0.03, B: { nowatch: true },
    shirt: hex01(0x86acdf), jacket: hex01(0x86acdf), pants: hex01(0xe9e4d8), shoes: hex01(0x6a3a1c), tee: 1,
    shirtPaint: { shirt: [0x86, 0xac, 0xdf], pants: [0xe9, 0xe4, 0xd8], skin: [0xe4, 0xab, 0x88], belt: [0x5a, 0x30, 0x18], vDepth: 1.38, chestHair: true, chain: true, sleeves: 'long' },
  },
};
