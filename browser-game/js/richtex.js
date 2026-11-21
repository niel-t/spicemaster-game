// Richer world surfaces (2026-11-21): procedural textures painted once at load, a world-space "macro" tint that breaks up
// tiling on big surfaces, upscaled + weathered mission floors, and a static mesh merger that pays for the extra detail.
// Everything here is drawn on canvases (no new downloads) in the spice-trader palette: saffron, turmeric, paprika, cumin,
// cardamom, cream.
//   LOW: phones (coarse pointer and a small screen) get half-size textures and skip the street clutter that only adds
//   draw calls. The Graphics setting (js/post.js) keeps working on top: Simpel hides the clutter group live.
import * as THREE from '../vendor/three.module.min.js';

export const LOW = (() => {
  try { return matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 900; } catch (e) { return false; }
})();
const RES = LOW ? 0.5 : 1;

// ------------------------------------------------------------------ small helpers
export function rng(seed = 1) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const clamp = (v, a = 0, b = 255) => (v < a ? a : v > b ? b : v);
const smooth = (e0, e1, x) => { const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
// tileable value noise on an n×n lattice
function vnoise(n, rand) {
  const L = new Float32Array(n * n); for (let i = 0; i < L.length; i++) L[i] = rand();
  return (u, v) => { // u, v in lattice units, wraps at n
    const x0 = Math.floor(u), y0 = Math.floor(v), fx = u - x0, fy = v - y0, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const a = (x, y) => L[(((y % n) + n) % n) * n + (((x % n) + n) % n)];
    const top = a(x0, y0) + (a(x0 + 1, y0) - a(x0, y0)) * sx, bot = a(x0, y0 + 1) + (a(x0 + 1, y0 + 1) - a(x0, y0 + 1)) * sx;
    return top + (bot - top) * sy;
  };
}
function fbm(S, rand, oct = 4, base = 4) { // S×S tileable fractal noise, 0..1
  const ns = []; for (let o = 0; o < oct; o++) ns.push(vnoise(base << o, rand));
  const out = new Float32Array(S * S);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let v = 0, amp = 0.5, tot = 0;
    for (let o = 0; o < oct; o++) { const k = (base << o) / S; v += ns[o](x * k, y * k) * amp; tot += amp; amp *= 0.5; }
    out[y * S + x] = v / tot;
  }
  return out;
}
function texFrom(c, rx = 1, ry = 1, srgb = true) {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = LOW ? 2 : 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
// normal map canvas from a tileable height field (0..1)
function normalCanvas(H, S, strength = 2) {
  const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), img = g.createImageData(S, S), d = img.data;
  const h = (x, y) => H[((y + S) % S) * S + ((x + S) % S)];
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = (h(x - 1, y) - h(x + 1, y)) * strength, dy = (h(x, y - 1) - h(x, y + 1)) * strength, l = Math.hypot(dx, dy, 1), k = (y * S + x) * 4;
    d[k] = 128 + (dx / l) * 127; d[k + 1] = 128 - (dy / l) * 127; d[k + 2] = 128 + (1 / l) * 127; d[k + 3] = 255;
  }
  g.putImageData(img, 0, 0); return c;
}
function canvasOf(S, fill) { const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'); const img = g.createImageData(S, S); fill(img.data); g.putImageData(img, 0, 0); return c; }
const cache = {};
const once = (k, f) => cache[k] || (cache[k] = f());

// ------------------------------------------------------------------ klinkers: Dutch brick pavers in herringbone
// tone: 'red' (paprika and cumin bricks, the street in the Drive photos) or 'grey' (parking bays, mixed with a few red)
export function klinker(tone = 'red') {
  return once('klinker' + tone, () => {
    const S = Math.round(512 * RES), U = S / 16, rand = rng(tone === 'red' ? 7 : 11), N = fbm(S, rand, 4, 8);
    const H = new Float32Array(S * S), col = new Uint8ClampedArray(S * S * 3);
    const PAL = tone === 'red'
      ? [[150, 72, 50], [128, 60, 44], [168, 92, 60], [112, 58, 46], [140, 84, 62], [96, 52, 42]]
      : [[132, 126, 118], [116, 110, 104], [148, 142, 132], [104, 98, 94], [126, 116, 106], [138, 128, 116], [122, 104, 92]];
    const hash = (a, b, k) => { let h = (a * 73856093) ^ (b * 19349663) ^ (k * 83492791); h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const u = x / U, v = y / U, a = Math.floor(u), b = Math.floor(v), s = (((a - b) % 4) + 4) % 4;
      let x0, y0, w, h, id;
      if (s < 2) { x0 = a - s; y0 = b; w = 2; h = 1; id = hash(((x0 % 16) + 16) % 16, ((y0 % 16) + 16) % 16, 1); }
      else { x0 = a; y0 = s === 3 ? b : b - 1; w = 1; h = 2; id = hash(((x0 % 16) + 16) % 16, ((y0 % 16) + 16) % 16, 2); }
      const lx = (u - x0) / w, ly = (v - y0) / h, ex = Math.min(lx, 1 - lx) * w, ey = Math.min(ly, 1 - ly) * h, e = Math.min(ex, ey); // distance to the brick edge, in cell units
      const joint = e < 0.06, bevel = smooth(0.04, 0.16, e), n = N[y * S + x];
      const p = PAL[Math.floor(id * PAL.length) % PAL.length], shade = 0.88 + id * 0.16 + (n - 0.5) * 0.28 - (1 - bevel) * 0.18;
      const k = (y * S + x) * 3;
      if (joint) { const j = 0.75 + n * 0.4; col[k] = 150 * j; col[k + 1] = 138 * j; col[k + 2] = 112 * j; H[y * S + x] = 0.05 + n * 0.05; } // sand in the joints
      else { col[k] = clamp(p[0] * shade); col[k + 1] = clamp(p[1] * shade); col[k + 2] = clamp(p[2] * shade); H[y * S + x] = 0.35 + bevel * 0.5 + (n - 0.5) * 0.12 + id * 0.06; }
    }
    // a few dark spots of chewing gum and old oil, and moss creeping into some joints
    const map = canvasOf(S, (d) => { for (let i = 0; i < S * S; i++) { d[i * 4] = col[i * 3]; d[i * 4 + 1] = col[i * 3 + 1]; d[i * 4 + 2] = col[i * 3 + 2]; d[i * 4 + 3] = 255; } });
    const g = map.getContext('2d');
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(30,24,20,${0.12 + rand() * 0.2})`; g.beginPath(); g.arc(rand() * S, rand() * S, 1 + rand() * 2.5 * RES * 2, 0, 7); g.fill(); }
    for (let i = 0; i < 6; i++) { const x = rand() * S, y = rand() * S, r = (10 + rand() * 26) * RES * 2, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(20,16,12,.22)'); gr.addColorStop(1, 'rgba(20,16,12,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    return { map, normal: normalCanvas(H, S, 3) };
  });
}

// ------------------------------------------------------------------ asphalt: aggregate, tar-sealed cracks, patches
export function asphalt(tint = 'grey') {
  return once('asphalt' + tint, () => {
    const S = Math.round(512 * RES), rand = rng(tint === 'grey' ? 3 : 5), N = fbm(S, rand, 5, 4), H = new Float32Array(S * S);
    const base = tint === 'grey' ? [70, 70, 74] : [150, 62, 50]; // grey road, red fietspad
    const map = canvasOf(S, (d) => {
      for (let i = 0; i < S * S; i++) {
        const n = N[i], gr = rand(), stone = gr > 0.93 ? (rand() - 0.3) * 70 : 0, v = (n - 0.5) * 34 + stone + (gr - 0.5) * 16;
        d[i * 4] = clamp(base[0] + v); d[i * 4 + 1] = clamp(base[1] + v * 0.95); d[i * 4 + 2] = clamp(base[2] + v * 0.9); d[i * 4 + 3] = 255;
        H[i] = n * 0.4 + (gr > 0.93 ? 0.25 : 0) + gr * 0.08;
      }
    });
    const g = map.getContext('2d');
    // patches: slightly darker newer squares of tar
    if (tint === 'grey') for (let i = 0; i < 2; i++) { const w = (50 + rand() * 90) * RES * 2, h = (30 + rand() * 50) * RES * 2, x = rand() * S, y = rand() * S; g.fillStyle = 'rgba(18,18,22,.1)'; g.fillRect(x, y, w, h); g.strokeStyle = 'rgba(10,10,12,.16)'; g.lineWidth = 1.5; g.strokeRect(x, y, w, h); }
    // tar-sealed cracks: dark glossy wiggles
    g.lineCap = 'round';
    for (let i = 0; i < (tint === 'grey' ? 3 : 1); i++) {
      let x = rand() * S, y = rand() * S, a = rand() * 6.3; g.strokeStyle = 'rgba(16,16,18,.3)'; g.lineWidth = (1 + rand() * 1.2) * RES * 2; g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 9; k++) { a += (rand() - 0.5) * 0.9; x += Math.cos(a) * 7 * RES * 2; y += Math.sin(a) * 7 * RES * 2; g.lineTo(x, y); }
      g.stroke();
    }
    return { map, normal: normalCanvas(H, S, 2.5) };
  });
}

// ------------------------------------------------------------------ painted clapboard with wood grain (Zaanse houses)
export function clapboard() {
  return once('clap', () => {
    const W = Math.round(256 * RES), Hh = W * 2, rand = rng(21), c = document.createElement('canvas'); c.width = W; c.height = Hh; const g = c.getContext('2d');
    const board = Hh / 16;
    for (let y = 0; y < Hh; y += board) {
      const gr = g.createLinearGradient(0, y, 0, y + board); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#e6e6e6'); gr.addColorStop(0.94, '#b8b8b8'); gr.addColorStop(1, '#6a6a6a');
      g.fillStyle = gr; g.fillRect(0, y, W, board);
      for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(90,80,70,${0.03 + rand() * 0.05})`; g.fillRect(rand() * W, y + rand() * board * 0.8, 20 + rand() * 60, 1); } // grain under the paint
      if (rand() < 0.5) { const x = rand() * W; g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x, y, 1.5, board); } // butt joint
    }
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(120,100,80,${0.08 + rand() * 0.12})`; const x = rand() * W, y = Math.floor(rand() * 16) * board + board - 3; g.fillRect(x, y, 2 + rand() * 8, 2); } // paint chips at the board edges
    const vg = g.createLinearGradient(0, Hh * 0.82, 0, Hh); vg.addColorStop(0, 'rgba(70,60,50,0)'); vg.addColorStop(1, 'rgba(70,60,50,.18)'); g.fillStyle = vg; g.fillRect(0, 0, W, Hh); // splash grime at the bottom of each repeat
    return c;
  });
}

// ------------------------------------------------------------------ stone coping / hardsteen (Belgian bluestone) for plinths and quays
export function hardsteen() {
  return once('hardsteen', () => {
    const S = Math.round(256 * RES), rand = rng(31), N = fbm(S, rand, 5, 4), H = new Float32Array(S * S);
    const map = canvasOf(S, (d) => {
      for (let i = 0; i < S * S; i++) {
        const x = i % S, n = N[i], fleck = rand() > 0.97 ? 30 : 0, joint = x % (S / 2) < 2 ? -40 : 0, v = 96 + (n - 0.5) * 40 + fleck + joint;
        d[i * 4] = clamp(v * 0.92); d[i * 4 + 1] = clamp(v * 0.95); d[i * 4 + 2] = clamp(v); d[i * 4 + 3] = 255; H[i] = n * 0.6 + (joint ? -0.3 : 0) + (fleck ? 0.1 : 0);
      }
    });
    return { map, normal: normalCanvas(H, S, 2) };
  });
}

// ------------------------------------------------------------------ decals: drain gully, manhole, oil stain, tree grate, leaf litter
export function decal(kind) {
  return once('decal' + kind, () => {
    const S = Math.round(128 * Math.max(RES, 0.75)) * (kind === 'manhole' || kind === 'grate' ? 2 : 1), c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), rand = rng(kind.length * 17);
    const s = S / 128; g.scale(s, s);
    if (kind === 'gully') { // kolk: cast iron grate in a kerb-side frame
      g.fillStyle = '#4a4844'; g.fillRect(8, 30, 112, 68); g.fillStyle = '#1c1c1e'; g.fillRect(16, 38, 96, 52);
      g.fillStyle = '#5a5854'; for (let x = 20; x < 108; x += 9) g.fillRect(x, 38, 4, 52); g.fillRect(16, 62, 96, 4);
      g.fillStyle = 'rgba(160,110,60,.25)'; for (let i = 0; i < 30; i++) g.fillRect(16 + rand() * 96, 38 + rand() * 52, 2, 2); // rust
    } else if (kind === 'manhole') {
      g.translate(64, 64); g.fillStyle = '#3e3c3a'; g.beginPath(); g.arc(0, 0, 62, 0, 7); g.fill(); g.fillStyle = '#56524c'; g.beginPath(); g.arc(0, 0, 54, 0, 7); g.fill();
      g.strokeStyle = '#34322e'; g.lineWidth = 3; for (let r = 14; r < 54; r += 10) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); }
      for (let k = 0; k < 12; k++) { g.save(); g.rotate(k * Math.PI / 6); g.fillStyle = '#34322e'; g.fillRect(-1.5, -54, 3, 40); g.restore(); }
      g.fillStyle = '#6a665e'; g.font = '900 13px Arial'; g.textAlign = 'center'; g.fillText('KAASLAND', 0, 5);
      g.fillStyle = 'rgba(150,100,50,.2)'; for (let i = 0; i < 40; i++) g.fillRect(-50 + rand() * 100, -50 + rand() * 100, 2, 2);
    } else if (kind === 'oil') {
      for (let i = 0; i < 7; i++) { const x = 30 + rand() * 68, y = 30 + rand() * 68, r = 10 + rand() * 26, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(14,12,10,.55)'); gr.addColorStop(0.7, 'rgba(14,12,10,.25)'); gr.addColorStop(1, 'rgba(14,12,10,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    } else if (kind === 'grate') { // round cast-iron tree grate with radial slots
      g.translate(64, 64); g.fillStyle = '#2e2c2a'; g.beginPath(); g.arc(0, 0, 63, 0, 7); g.fill();
      g.fillStyle = '#4a4640'; g.beginPath(); g.arc(0, 0, 60, 0, 7); g.fill(); g.fillStyle = '#3a2a1c'; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill();
      g.strokeStyle = '#1e1c1a'; g.lineWidth = 3; for (let k = 0; k < 28; k++) { const a = k / 28 * Math.PI * 2; g.beginPath(); g.moveTo(Math.cos(a) * 20, Math.sin(a) * 20); g.lineTo(Math.cos(a) * 56, Math.sin(a) * 56); g.stroke(); }
      for (const r of [28, 42]) { g.beginPath(); g.arc(0, 0, r, 0, 7); g.lineWidth = 4; g.strokeStyle = '#56524a'; g.stroke(); }
    } else if (kind === 'leaves') { // fallen linden leaves in saffron and turmeric
      for (let i = 0; i < 38; i++) { const x = rand() * 128, y = rand() * 128; g.save(); g.translate(x, y); g.rotate(rand() * 6.3); g.fillStyle = ['#d89a2a', '#e8b84a', '#b8782a', '#8a9a3a', '#c8602a'][i % 5]; g.globalAlpha = 0.7 + rand() * 0.3; g.beginPath(); g.ellipse(0, 0, 5, 3, 0, 0, 7); g.fill(); g.restore(); }
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  });
}

// ------------------------------------------------------------------ macro variation: big surfaces stop looking tiled
// Multiplies the surface colour by soft world-space noise (two scales) so 140 m of paving or a level floor shows
// sun-bleached and dirty patches instead of one repeating tile. One shader chunk, shared program per material type.
const MACRO_VS = 'varying vec3 vMacroW;';
const MACRO_FS = `varying vec3 vMacroW; uniform float uMacroAmt; uniform float uMacroScale; uniform float uMacroGrime;
float mcH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float mcN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(mcH(i), mcH(i + vec2(1.0, 0.0)), f.x), mix(mcH(i + vec2(0.0, 1.0)), mcH(i + vec2(1.0, 1.0)), f.x), f.y); }`;
export function macro(m, amt = 0.16, scale = 0.12, grime = 0) { // grime: darker splash zone at the foot of walls
  if (!m || m.userData.macro) return m;
  m.userData.macro = true;
  const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => {
    if (prev) prev(sh, r);
    sh.uniforms.uMacroAmt = { value: amt }; sh.uniforms.uMacroScale = { value: scale }; sh.uniforms.uMacroGrime = { value: grime };
    sh.vertexShader = MACRO_VS + '\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\nvMacroW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = MACRO_FS + '\n' + sh.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      { vec2 mp = vec2(vMacroW.x + vMacroW.y * 0.6, vMacroW.z - vMacroW.y * 0.6) * uMacroScale; float mn = mcN(mp) * 0.65 + mcN(mp * 3.7 + 11.0) * 0.35;
        diffuseColor.rgb *= 1.0 + (mn - 0.5) * 2.0 * uMacroAmt; diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.04, 0.98, 0.9), smoothstep(0.55, 0.85, mcN(mp * 0.5 + 3.0)) * uMacroAmt * 2.0);
        diffuseColor.rgb *= 1.0 - uMacroGrime * (1.0 - smoothstep(0.0, 0.55, vMacroW.y)); }`);
  };
  m.customProgramCacheKey = () => 'macro' + (prev ? prev.toString().length : 0);
  m.needsUpdate = true;
  return m;
}

// ------------------------------------------------------------------ PBR-ish material from a {map, normal} pair
export function surface(pair, rx, ry, opt = {}) {
  const m = new THREE.MeshStandardMaterial({ map: texFrom(pair.map, rx, ry), color: opt.color ?? 0xffffff, roughness: opt.rough ?? 0.92, metalness: 0 });
  if (pair.normal && !LOW) { m.normalMap = texFrom(pair.normal, rx, ry, false); const k = opt.nscale ?? 0.9; m.normalScale.set(k, k); }
  return opt.macro === false ? m : macro(m, opt.macroAmt ?? 0.14, opt.macroScale ?? 0.1);
}
export function clapTexture(rx = 1, ry = 3) { return texFrom(clapboard(), rx, ry); }

// ------------------------------------------------------------------ mission floors: crisp 4× redraw + wear + a bump map
// Levels paint their floors as 64×64 canvas drawings. enrichFloor() runs the same drawing at 4× scale (so lines stay sharp
// instead of being magnified), then lays fine grain, scuffs and a vignette of grime over it, and derives a height map
// from the brightness so grout lines and planks catch the light.
export function enrichFloor(draw, key) {
  const K = LOW ? 2 : 4, S = 64 * K, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d');
  g.save(); g.scale(K, K); try { draw(g, 64, 64); } catch (e) { /* a level's drawing that needs the 64 px canvas */ } g.restore();
  const rand = rng(key ? [...key].reduce((a, ch) => a * 31 + ch.charCodeAt(0), 7) : 9), N = fbm(S, rand, 4, 4);
  const img = g.getImageData(0, 0, S, S), d = img.data, H = new Float32Array(S * S);
  for (let i = 0; i < S * S; i++) {
    const n = N[i], gr = rand(), k = 1 + (n - 0.5) * 0.16 + (gr - 0.5) * 0.07;
    d[i * 4] = clamp(d[i * 4] * k); d[i * 4 + 1] = clamp(d[i * 4 + 1] * k); d[i * 4 + 2] = clamp(d[i * 4 + 2] * k);
    H[i] = (d[i * 4] * 0.3 + d[i * 4 + 1] * 0.59 + d[i * 4 + 2] * 0.11) / 255 * 0.7 + n * 0.3;
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = 'rgba(0,0,0,.07)'; g.lineWidth = K * 0.5; for (let i = 0; i < 10; i++) { g.beginPath(); const x = rand() * S, y = rand() * S; g.moveTo(x, y); g.quadraticCurveTo(x + (rand() - 0.5) * S * 0.3, y + (rand() - 0.5) * S * 0.3, x + (rand() - 0.5) * S * 0.4, y + (rand() - 0.5) * S * 0.4); g.stroke(); } // scuffs
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = LOW ? 2 : 8;
  if (!LOW) NORMALS.set(t.source, new THREE.CanvasTexture(normalCanvas(H, S, 3.5)));
  return t;
}
const NORMALS = new WeakMap(); // floor texture source -> its normal map (clones share the source)
export function normalOf(t) { const n = t && NORMALS.get(t.source); if (!n) return null; const c = n.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.copy(t.repeat); return c; }

// ------------------------------------------------------------------ static merge: one mesh per material look inside a group
// The street's houses are built from dozens of little boxes, each with its own material clone. mergeStatic() bakes the
// plain ones (no texture flagged as a sign, no additive glow) into one mesh per look, which pays for the new detail.
export function mergeStatic(group, keep = () => false) {
  group.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(group.matrixWorld).invert(), buckets = new Map(), drop = [];
  group.traverse((o) => {
    if (!o.isMesh || o === group || o.isInstancedMesh || o.isSkinnedMesh || Array.isArray(o.material) || keep(o)) return;
    const m = o.material; if (m.blending !== THREE.NormalBlending || (m.map && m.map.userData && m.map.userData.sign) || m.userData.baseOp !== undefined) return;
    let p = o.parent, ok = true; while (p && p !== group) { if (!p.visible) ok = false; p = p.parent; } if (!ok || !o.visible) return;
    const key = [m.type, m.color ? m.color.getHex() : 0, m.map ? m.map.uuid : '', m.normalMap ? m.normalMap.uuid : '', m.bumpMap ? m.bumpMap.uuid : '', m.emissive ? m.emissive.getHex() : '', m.transparent, m.side, m.flatShading, m.vertexColors, o.castShadow].join('|');
    if (!buckets.has(key)) buckets.set(key, { m, cast: o.castShadow, recv: o.receiveShadow, parts: [], objs: [] });
    const mx = new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld);
    let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(mx);
    buckets.get(key).parts.push(geo); buckets.get(key).objs.push(o);
  });
  for (const b of buckets.values()) {
    if (b.parts.length < 2) { for (const p of b.parts) p.dispose(); continue; }
    drop.push(...b.objs);
    const names = ['position', 'normal', 'uv', 'color'].filter((n) => b.parts.every((p) => p.attributes[n]));
    let total = 0; for (const p of b.parts) total += p.attributes.position.count;
    const geo = new THREE.BufferGeometry();
    for (const n of names) {
      const size = b.parts[0].attributes[n].itemSize, arr = new Float32Array(total * size); let off = 0;
      for (const p of b.parts) { const a = p.attributes[n]; for (let i = 0; i < a.count; i++) for (let k = 0; k < size; k++) arr[(off + i) * size + k] = a.array[i * a.itemSize + k] ?? 0; off += a.count; }
      geo.setAttribute(n, new THREE.BufferAttribute(arr, size));
    }
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, b.m); mesh.castShadow = b.cast; mesh.receiveShadow = b.recv; mesh.userData.merged = true; group.add(mesh);
    for (const p of b.parts) p.dispose();
  }
  for (const o of drop) o.parent.remove(o);
  return group;
}

// ------------------------------------------------------------------ vertex-coloured detail kit: one geometry, one material
// Builders push coloured boxes / cylinders into a kit; build() returns a single mesh (vertexColors) for one draw call.
export function kit() {
  const parts = [], tmp = new THREE.Object3D(), col = new THREE.Color();
  function push(geo, color, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    tmp.position.set(x, y, z); tmp.rotation.set(rx, ry, rz); tmp.scale.set(sx, sy, sz); tmp.updateMatrix();
    const g = (geo.index ? geo.toNonIndexed() : geo.clone()).applyMatrix4(tmp.matrix); col.set(color);
    const n = g.attributes.position.count, c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const v = 0.92 + ((i * 2654435761) % 97) / 97 * 0.16 * (geo.userData.jitter || 0); c[i * 3] = col.r * v; c[i * 3 + 1] = col.g * v; c[i * 3 + 2] = col.b * v; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); if (!g.attributes.uv) g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    parts.push(g);
  }
  return {
    box(w, h, d, color, x, y, z, ry = 0, rx = 0, rz = 0) { push(new THREE.BoxGeometry(w, h, d), color, x, y, z, rx, ry, rz); },
    cyl(rt, rb, h, color, x, y, z, seg = 8, rx = 0, ry = 0, rz = 0) { push(new THREE.CylinderGeometry(rt, rb, h, seg), color, x, y, z, rx, ry, rz); },
    geo(g, color, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) { push(g, color, x, y, z, rx, ry, rz, sx, sy, sz); },
    get count() { return parts.length; },
    build(mat) {
      if (!parts.length) return null;
      let total = 0; for (const p of parts) total += p.attributes.position.count;
      const geo = new THREE.BufferGeometry();
      for (const [n, size] of [['position', 3], ['normal', 3], ['uv', 2], ['color', 3]]) {
        const arr = new Float32Array(total * size); let off = 0;
        for (const p of parts) { arr.set(p.attributes[n].array, off); off += p.attributes[n].array.length; p.attributes[n] = null; }
        geo.setAttribute(n, new THREE.BufferAttribute(arr, size));
      }
      for (const p of parts) p.dispose(); parts.length = 0; geo.computeBoundingSphere();
      const m = new THREE.Mesh(geo, mat || kitMat()); m.castShadow = true; m.receiveShadow = true; return m;
    },
  };
}
export function kitMat() { return once('kitMat', () => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.78, metalness: 0.05 })); }

// lumpy canopy blob: an icosphere with its vertices pushed in and out (shared, so the trees cost one geometry)
export function blobGeo(seed = 1, detail = 1) {
  return once('blob' + seed + '_' + detail, () => {
    const g = new THREE.IcosahedronGeometry(1, detail), p = g.attributes.position, r = rng(seed), seen = new Map();
    for (let i = 0; i < p.count; i++) {
      const k = `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`; if (!seen.has(k)) seen.set(k, 0.82 + r() * 0.32);
      const s = seen.get(k); p.setXYZ(i, p.getX(i) * s, p.getY(i) * s * 0.9, p.getZ(i) * s);
    }
    const nr = g.attributes.normal; // soft shading: normals from the sphere direction, not the facets
    for (let i = 0; i < p.count; i++) { const v = new THREE.Vector3(p.getX(i), p.getY(i) / 0.9, p.getZ(i)).normalize(); nr.setXYZ(i, v.x, v.y, v.z); }
    g.userData.jitter = 1; return g;
  });
}

// ------------------------------------------------------------------ canal ripples (Klassiek water; Aero has its own in aeroworld.js)
export function rippleNormal() {
  return once('ripple', () => {
    const S = Math.round(256 * RES), rand = rng(41), N = fbm(S, rand, 3, 4), H = new Float32Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) H[y * S + x] = Math.sin((x / S) * Math.PI * 8 + N[y * S + x] * 6) * 0.25 + N[y * S + x] * 0.6;
    const t = texFrom(normalCanvas(H, S, 1.6), 30, 1.6, false); return t;
  });
}
