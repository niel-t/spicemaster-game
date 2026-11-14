// Spice Master Eddy: Chapter 0, Kipkruidenkwartier.
// Neon Vice-style top-down browser game: three.js, PS2-style low-poly people with photo faces.
import * as THREE from '../vendor/three.module.min.js';
import { Music } from './music.js';
import { initInput, virt, isPaused, glyph, inputMode, onInputMode, controlsTable } from './input.js';
import { initMission } from './mission.js';
import { createPost } from './post.js';
import { makePS2Person, ps2Animate, installCharacters, lookFromPerson, LOOKS, stats as charStats } from './characters.js';
import { makeOofmobiel, makeCar } from './vehicles.js'; // shared van and street cars
import { initDrive } from './drive.js'; // top-down Oofmobiel drive between districts
import { createEconomy, rankOf } from './economy.js';
import { initNpcs } from './npcs.js'; // the people of Kipkruidenkwartier who give Eddy ideas // spice market, stock (gang-wars economy layer)
let mission = null; // Mission 1: Spekbuurt (js/mission.js)
const music = new Music();

// ------------------------------------------------------------------ renderer / scene
const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const PIXEL = 1.0;
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2) * PIXEL);
renderer.setSize(innerWidth, innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const post = createPost(renderer); // Neon Vice-style screen pass: bloom, grade, vignette; GRAPHICS in the pause menu (js/post.js)

const scene = new THREE.Scene();
installCharacters(scene); // Neon Vice-style skinned characters pose themselves right before each render
scene.background = new THREE.Color(0xf0b4b8);
scene.fog = new THREE.Fog(0xf0b4b8, 70, 140);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.5, 300);
addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight, false);
});

{
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128);
  gr.addColorStop(0, '#3a4ab0'); gr.addColorStop(0.25, '#8a6ad0'); gr.addColorStop(0.42, '#ff8fb0'); gr.addColorStop(0.5, '#ffd0a0'); gr.addColorStop(0.56, '#7a6a80'); gr.addColorStop(1, '#3a3048');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(Math.random() * 256, 18 + Math.random() * 30, 14 + Math.random() * 18, 4, 0, 0, 7); g.fill(); }
  const t = new THREE.CanvasTexture(c); t.mapping = THREE.EquirectangularReflectionMapping; t.colorSpace = THREE.SRGBColorSpace;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(t).texture; scene.environmentIntensity = 0.55;
}
const hemi = new THREE.HemisphereLight(0xffe0f0, 0x6a5a80, 1.25); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd8a8, 2.9);
sun.position.set(-18, 30, 14);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 90 });
sun.shadow.bias = -0.0008;
scene.add(sun, sun.target);

// ------------------------------------------------------------------ helpers
const loader = new THREE.TextureLoader();
const texCache = {};
function tex(name, rx = 1, ry = 1) {
  const key = name + rx + 'x' + ry;
  if (texCache[key]) return texCache[key];
  const t = loader.load('./assets/' + name);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  t.magFilter = THREE.LinearFilter;
  t.anisotropy = 4;
  return (texCache[key] = t);
}
const lam = (o) => new THREE.MeshLambertMaterial(o);
function texN(name, rx = 1, ry = 1) {
  const key = 'N' + name + rx + 'x' + ry;
  if (texCache[key]) return texCache[key];
  const t = loader.load('./assets/' + name.replace('.jpg', '_n.jpg'));
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry); t.anisotropy = 4;
  return (texCache[key] = t);
}
// PBR-ish material from the CC0 library textures (colour + generated normal map)
function pbr(name, rx, ry, color = 0xffffff, rough = 0.9, nscale = 0.8) {
  return new THREE.MeshStandardMaterial({ map: tex(name, rx, ry), normalMap: texN(name, rx, ry), normalScale: new THREE.Vector2(nscale, nscale), color, roughness: rough, metalness: 0 });
}
const woodMat = pbr('wood.jpg', 1, 1, 0xb08a64, 0.8, 0.6);
const mat = {
  skin: lam({ color: 0xe0a985 }),
  steel: new THREE.MeshPhongMaterial({ color: 0xb8bec4, shininess: 70, specular: 0x666666 }),
  dark: lam({ color: 0x2a2a2e }),
  black: lam({ color: 0x111114 }),
  glass: new THREE.MeshPhongMaterial({ color: 0x1d2a38, shininess: 90, specular: 0x8899aa }),
  wood: woodMat,
  white: lam({ color: 0xf0eee8 }),
  gold: new THREE.MeshPhongMaterial({ color: 0xe8b84a, shininess: 90, specular: 0xffeeaa }),
};
function box(w, h, d, m, x = 0, y = 0, z = 0, parent = scene, shadow = true) {
  const g = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  g.position.set(x, y, z);
  g.castShadow = shadow; g.receiveShadow = true;
  parent.add(g);
  return g;
}
function cyl(rt, rb, h, m, x = 0, y = 0, z = 0, parent = scene, seg = 10) {
  const g = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  g.position.set(x, y, z); g.castShadow = true; g.receiveShadow = true;
  parent.add(g);
  return g;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function signTex(lines, bg = '#1a1a1a', fg = '#ffd36b', w = 512, h = 128) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => {
      let fs = l.size || 46; g.font = `900 ${fs}px Arial Black, Impact, sans-serif`;
      while (g.measureText(l.t).width > w - 36 && fs > 10) { fs -= 2; g.font = `900 ${fs}px Arial Black, Impact, sans-serif`; } // shrink to fit, never crop
      g.fillStyle = l.color || fg;
      g.fillText(l.t, w / 2, h * (lines.length === 1 ? 0.52 : (i + 0.75) / (lines.length + 0.5)));
    });
  });
}

// ------------------------------------------------------------------ collision
const solids = []; // {minx,maxx,minz,maxz}
const BOUNDS = { cur: null }; // walkable area override (missions)
function solid(x0, x1, z0, z1) { const s = { minx: Math.min(x0, x1), maxx: Math.max(x0, x1), minz: Math.min(z0, z1), maxz: Math.max(z0, z1) }; solids.push(s); return s; }
function collide(p, r) {
  for (const s of solids) {
    if (s.off) continue;
    const cx = Math.max(s.minx, Math.min(p.x, s.maxx)), cz = Math.max(s.minz, Math.min(p.z, s.maxz));
    const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
    if (d2 < r * r) {
      if (d2 > 1e-8) { const d = Math.sqrt(d2), push = r - d; p.x += dx / d * push; p.z += dz / d * push; }
      else { // inside: push out on the shortest axis
        const opts = [[s.minx - r - p.x, 0], [s.maxx + r - p.x, 0], [0, s.minz - r - p.z], [0, s.maxz + r - p.z]];
        opts.sort((a, b) => Math.abs(a[0] + a[1]) - Math.abs(b[0] + b[1]));
        p.x += opts[0][0]; p.z += opts[0][1];
      }
    }
  }
  const B = BOUNDS.cur || { x0: -33, x1: 33, z0: -27.5, z1: 10.6 + RC };
  p.x = Math.max(B.x0, Math.min(B.x1, p.x));
  p.z = Math.max(B.z0, Math.min(B.z1, p.z));
}

// ------------------------------------------------------------------ world: ground, street, canal
// Cross-section (north → south), road centre RC: facades z=-7 | pavement 3.4 m | kerb | parking | 2 lanes | parking |
// kerb | red two-way fietspad | pavement + trees | quay | canal (CZ)
const RC = 1.6;
const ROAD = { pN: RC - 5.0, lane: 3.0, pS: RC + 5.0, bike0: RC + 5.2, bike1: RC + 7.6, walk1: RC + 10.9 };
const CZ = 15 + RC;
const groundMat = lam({ map: tex('paving.jpg', 40, 20), color: 0xd8d2c4 });
for (const [z0, z1] of [[-70, CZ - 3.75], [CZ + 3.75, 70]]) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(140, z1 - z0), groundMat);
  g.rotation.x = -Math.PI / 2; g.position.z = (z0 + z1) / 2; g.receiveShadow = true; scene.add(g);
}
function strip(z0, z1, m, y = 0.02) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(140, z1 - z0), m);
  p.rotation.x = -Math.PI / 2; p.position.set(0, y, (z0 + z1) / 2); p.receiveShadow = true; scene.add(p); return p;
}
strip(RC - ROAD.lane, RC + ROAD.lane, lam({ map: tex('asphalt.jpg', 30, 3), color: 0xb0b0b0 }));
// parking bays: grey klinkers with white bay lines
const bayMat = lam({ map: tex('paving.jpg', 70, 1), color: 0x9a968e });
strip(ROAD.pN, RC - ROAD.lane, bayMat, 0.022); strip(RC + ROAD.lane, ROAD.pS, bayMat, 0.022);
for (let x = -66; x < 66; x += 5.6) for (const z of [RC - 4, RC + 4]) box(0.1, 0.01, 1.9, mat.white, x, 0.032, z, scene, false);
for (const z of [RC - ROAD.lane, RC + ROAD.lane]) box(140, 0.01, 0.1, mat.white, 0, 0.032, z, scene, false);
// centre line (dashed, Dutch style) — skipped at the zebra
for (let x = -66; x < 66; x += 4) if (Math.abs(x + 18) > 3) box(2, 0.01, 0.14, mat.white, x, 0.035, RC, scene, false);
// zebra crossing spans the lanes and the bays
for (let i = 0; i < 10; i++) box(3.2, 0.012, 0.5, mat.white, -18, 0.036, RC - 4.3 + i * 0.96, scene, false);
// kerbs
const kerbMat = pbr('concrete.jpg', 60, 1, 0xb8b4ac);
for (const z of [RC - 5.1, RC + 5.1]) box(140, 0.16, 0.18, kerbMat, 0, 0.08, z, scene, false);
// pavements
for (const [z0, z1] of [[-7, RC - 5.2], [ROAD.bike1, ROAD.walk1]]) strip(z0, z1, pbr('tiles_stone.jpg', 46, (z1 - z0) / 3, 0xc9c4ba, 0.85, 0.6), 0.012);
// fietspad: red asphalt with a dashed white centre line and bike symbols
strip(ROAD.bike0, ROAD.bike1, lam({ map: tex('asphalt.jpg', 30, 1), color: 0xb24a3a }), 0.016);
for (let x = -66; x < 66; x += 3) box(1.2, 0.01, 0.1, mat.white, x, 0.03, (ROAD.bike0 + ROAD.bike1) / 2, scene, false);
const bikeSym = canvasTex(128, 128, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 7; for (const x of [34, 94]) { g.beginPath(); g.arc(x, 82, 22, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(34, 82); g.lineTo(58, 50); g.lineTo(94, 50); g.lineTo(94, 82); g.moveTo(58, 50); g.lineTo(70, 82); g.lineTo(94, 50); g.moveTo(52, 40); g.lineTo(66, 40); g.moveTo(94, 50); g.lineTo(88, 34); g.stroke(); });
for (let x = -60; x < 60; x += 20) for (const [z, r] of [[RC + 5.8, 0], [RC + 7.0, Math.PI]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), lam({ map: bikeSym, transparent: true })); p.rotation.set(-Math.PI / 2, 0, r - Math.PI / 2); p.position.set(x, 0.034, z); scene.add(p); }
box(140, 0.08, 0.12, kerbMat, 0, 0.04, ROAD.bike1, scene, false);

// canal along the south side of the street (Amsterdam-style)
const water = new THREE.Mesh(new THREE.PlaneGeometry(140, 7.5), new THREE.MeshPhongMaterial({ color: 0x2e5a5c, shininess: 80, specular: 0x88aaaa }));
water.rotation.x = -Math.PI / 2; water.position.set(0, -1.1, CZ); scene.add(water);
const quayMat = lam({ map: tex('brick_red.jpg', 60, 1), color: 0x9a7a6a });
const q1 = new THREE.Mesh(new THREE.PlaneGeometry(140, 1.2), quayMat); q1.position.set(0, -0.55, CZ - 3.74); scene.add(q1);
const q2 = new THREE.Mesh(new THREE.PlaneGeometry(140, 1.2), quayMat); q2.position.set(0, -0.55, CZ + 3.74); q2.rotation.y = Math.PI; scene.add(q2);
box(140, 0.14, 0.4, pbr('concrete.jpg', 60, 1, 0xa8a49c), 0, 0.07, CZ - 3.9, scene, false);
// bridge over the canal
box(5, 0.4, 7.8, lam({ map: tex('paving.jpg', 2, 3) }), 14, -0.15, CZ);
for (const x of [11.6, 16.4]) box(0.2, 0.9, 7.8, lam({ color: 0x2a2a2a }), x, 0.45, CZ);
// trees between the fietspad and the pavement: Dutch lindens and the odd Vice palm, half-way between the lamps
function tree(x, z, s = 1) {
  cyl(0.12 * s, 0.16 * s, 2.4 * s, lam({ color: 0x5a4030 }), x, 1.2 * s, z);
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 * s, 0), lam({ color: [0x4f7a34, 0x5f8a3c, 0x46703a][Math.abs(Math.round(x)) % 3], flatShading: true }));
  m.position.set(x, 3.2 * s, z); m.castShadow = true; scene.add(m);
  solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2);
}
const frondTex = canvasTex(64, 256, (g, w, h) => {
  g.strokeStyle = '#3a6a22'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, 0); g.stroke();
  for (let y = 8; y < h - 6; y += 7) { const L = (w / 2 - 2) * Math.sin((y / h) * Math.PI) + 4; g.strokeStyle = y % 14 ? '#4f9a30' : '#5aa83a'; g.lineWidth = 4; g.beginPath(); g.moveTo(w / 2, y + 6); g.lineTo(w / 2 - L, y); g.moveTo(w / 2, y + 6); g.lineTo(w / 2 + L, y); g.stroke(); }
});
const frondMat = new THREE.MeshLambertMaterial({ map: frondTex, transparent: true, alphaTest: 0.4, side: THREE.DoubleSide });
function palm(x, z, s = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g);
  const bark = lam({ color: 0x8a6a48 }), lean = 0.12 + (Math.abs(x) % 3) * 0.05;
  let px = 0, py = 0;
  for (let i = 0; i < 7; i++) { // gently curved, ringed trunk
    const seg = cyl(0.17 - i * 0.012, 0.19 - i * 0.012, 0.75, bark, px, py + 0.37, 0, g, 8);
    seg.rotation.z = -lean * (i / 6); px += Math.sin(lean * (i / 6)) * 0.75; py += 0.72;
  }
  for (let k = 0; k < 8; k++) { // drooping fronds: two planes per frond
    const a = k / 8 * Math.PI * 2, fr = new THREE.Group(); fr.position.set(px, py + 0.1, 0); fr.rotation.y = a; g.add(fr);
    const p1 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.4), frondMat); p1.rotation.set(-Math.PI / 2 + 0.55, 0, 0); p1.position.set(0, 0.25, 0.6); fr.add(p1);
    const p2 = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 1.2), frondMat); p2.rotation.set(-Math.PI / 2 - 0.5, 0, 0); p2.position.set(0, -0.05, 1.75); fr.add(p2);
    p1.castShadow = p2.castShadow = true;
  }
  for (let k = 0; k < 3; k++) cyl(0.09, 0.09, 0.16, lam({ color: 0x6a4a20 }), px + Math.cos(k * 2) * 0.18, py - 0.08, Math.sin(k * 2) * 0.18, g, 8);
  g.scale.setScalar(s);
  solid(x - 0.22, x + 0.22, z - 0.22, z + 0.22);
}
for (let x = -54; x <= 54; x += 12) if (Math.abs(x - 14) > 3) (Math.abs(x / 12) % 2 === 0.5 || x === -6 || x === 30 ? palm : tree)(x, ROAD.bike1 + 0.45, x % 24 === 6 ? 1.05 : 0.9);

// ------------------------------------------------------------------ houses (Amsterdam-style gables)
const brickMats = [
  pbr('brick_red.jpg', 2, 3, 0xd08a6a),
  pbr('brick_red2.jpg', 2, 3, 0xb08070),
  pbr('brick_cream2.jpg', 2, 3, 0xe8dcc0),
  pbr('brick_red.jpg', 2, 3, 0x8a5a4a),
  pbr('plaster2.jpg', 2, 3, 0xf0e6d4, 0.95, 0.4),
  pbr('brick_red2.jpg', 2, 3, 0x8a7a76),
];
// Dutch 80s Neon Vice: Zaanse wooden houses (clapboard, white trim, pointed / bell gables, orange tiles) painted in Vice pastels
const VICE = [0x23a07a, 0x2fb8b0, 0xff8fb8, 0x9a86e0, 0x4f9ee0, 0xffb48a, 0x7ad8b0, 0xffd86a, 0x1f7a5e, 0x6ac0ff];
const NEON = [0xe8862c, 0xf2c14e, 0xffe14a, 0x8fbf4a];
const clapTex = canvasTex(64, 256, (g, w, h) => {
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) {
    const gr = g.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.75, 'rgba(225,225,225,1)'); gr.addColorStop(1, 'rgba(150,150,150,1)');
    g.fillStyle = gr; g.fillRect(0, y, w, 16); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + 15, w, 1);
  }
  for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`; g.fillRect(Math.random() * w, Math.random() * h, 6 + Math.random() * 14, 1); }
});
clapTex.wrapS = clapTex.wrapT = THREE.RepeatWrapping; clapTex.repeat.set(1, 3);
const clapMat = (c) => new THREE.MeshStandardMaterial({ map: clapTex, bumpMap: clapTex, bumpScale: 1.5, color: c, roughness: 0.72 });
const roofMat = pbr('roof_tiles.jpg', 2, 2, 0xf08048, 0.8, 1.0);
const glassTex = canvasTex(64, 96, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#ffd8f0'); gr.addColorStop(0.45, '#8ab8e4'); gr.addColorStop(1, '#3a4a90');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.moveTo(8, h); g.lineTo(26, h); g.lineTo(58, 0); g.lineTo(40, 0); g.fill();
  g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.moveTo(30, h); g.lineTo(36, h); g.lineTo(64, 10); g.lineTo(64, 0); g.fill();
});
const winMat = new THREE.MeshStandardMaterial({ map: glassTex, roughness: 0.05, metalness: 0.55, envMapIntensity: 1.4 });
const frameMat = lam({ color: 0xf6f4ee });
const neonMat = (c) => new THREE.MeshBasicMaterial({ color: c });
// soft additive glow strip that sits behind a neon tube (the Neon Vice glow without post-processing)
const glowTex = canvasTex(16, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const glowMat = (c, o = 0.55) => { const m = new THREE.MeshBasicMaterial({ color: c, map: glowTex, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false }); m.userData.baseOp = o; return m; };
function neonTube(g, x0, y0, x1, y1, z, c, t = 0.07) {
  const L = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0);
  const core = box(L + t, t, t, neonMat(c), (x0 + x1) / 2, (y0 + y1) / 2, z, g, false); core.rotation.z = a;
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(L + 0.5, 0.55), glowMat(c)); gl.position.set((x0 + x1) / 2, (y0 + y1) / 2, z - 0.02); gl.rotation.z = a; gl.userData.glow = true; g.add(gl);
}
function neonRect(g, x, y, w, h, z, c) { neonTube(g, x - w / 2, y - h / 2, x + w / 2, y - h / 2, z, c); neonTube(g, x + w / 2, y - h / 2, x + w / 2, y + h / 2, z, c); neonTube(g, x + w / 2, y + h / 2, x - w / 2, y + h / 2, z, c); neonTube(g, x - w / 2, y + h / 2, x - w / 2, y - h / 2, z, c); }
// vertical neon blade sign sticking out of the facade
const BLADES = ['SNACK', 'VIDEO', 'DISCO', 'FRITES', 'HOTEL', 'KAAS', 'BIER', 'ARCADE', 'BINGO', 'GRILL'];
function bladeSign(g, x, y, z, word, c) {
  const hex = '#' + c.toString(16).padStart(6, '0');
  const t = canvasTex(96, 64 * word.length + 32, (q, w, h) => { q.fillStyle = '#140a1c'; q.fillRect(0, 0, w, h); q.strokeStyle = hex; q.lineWidth = 5; q.strokeRect(5, 5, w - 10, h - 10); q.font = '900 54px Arial Black, Arial'; q.textAlign = 'center'; q.shadowColor = hex; q.shadowBlur = 14; q.fillStyle = '#fff'; [...word].forEach((ch, i) => q.fillText(ch, w / 2, 70 + i * 64)); });
  const H = 0.42 * word.length + 0.25;
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.7, H), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); p.position.set(x, y, z + 0.55); p.rotation.y = Math.PI / 2; g.add(p);
  box(0.06, 0.06, 0.6, mat.dark, x, y + H / 2 - 0.1, z + 0.3, g, false); box(0.06, 0.06, 0.6, mat.dark, x, y - H / 2 + 0.1, z + 0.3, g, false);
  const gl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, H + 0.8), glowMat(c, 0.35)); gl.position.set(x, y, z + 0.55); gl.rotation.y = Math.PI / 2; g.add(gl);
  const gl2 = gl.clone(); gl2.rotation.y = -Math.PI / 2; g.add(gl2);
}
// posters and graffiti (generated once, reused)
const POSTERS = [
  ['DISCO', 'KAASBAL', '12 MAART · 21:00', '#e8a33d', '#1e120a'], ['HOLLANDSE', 'HITS 86', 'MET DE ZINGENDE KAASBOER', '#ffd23a', '#2a1a5a'],
  ['GEZOCHT', 'JAN v. KAAS', 'BELONING: 500 WILDERS', '#1a1a1a', '#f2e6c8'], ['KOOP NU', 'KAASDOWS 95', 'DE TOEKOMST IS NU', '#a9c46a', '#0a1a3a'],
  ['CIRCUS', 'FRIKANDEL', 'KINDEREN HALF GELD', '#ff7a1a', '#fff2d8'], ['SPECERIJEN', 'EDDY & ZN', 'SINDS 1987', '#ffd36b', '#6b1410'],
].map(([a, b, c, fg, bg]) => canvasTex(128, 180, (g, w, h) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.fillRect(6, 6, w - 12, 6); g.fillRect(6, h - 12, w - 12, 6);
  g.textAlign = 'center'; g.font = '900 20px Arial Black, Arial'; g.fillText(a, w / 2, 44); g.font = '900 24px Arial Black, Arial'; let fs = 24; while (g.measureText(b).width > 118) { fs -= 2; g.font = `900 ${fs}px Arial Black, Arial`; } g.fillText(b, w / 2, 84);
  g.beginPath(); g.arc(w / 2, 122, 18, 0, 7); g.fill(); g.font = '700 10px Arial'; g.fillText(c, w / 2, 166);
}));
const TAGS = ['KAAS!', 'EDDY', 'NOSH', 'LAMPAS', 'D00D', 'WOEST', 'ZAAN', 'FRIET'];
const GRAFFITI = TAGS.map((word, i) => canvasTex(256, 96, (g, w, h) => {
  const cols = [['#e8a33d', '#a9c46a'], ['#ffd23a', '#8fbf4a'], ['#a9c46a', '#ff7a1a'], ['#7aff6a', '#e8a33d']][i % 4];
  g.translate(w / 2, h / 2); g.rotate(-0.08 + (i % 3) * 0.06); g.font = '900 64px Arial Black, Impact, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.lineJoin = 'round'; g.lineWidth = 14; g.strokeStyle = '#111'; g.strokeText(word, 0, 0); g.fillStyle = cols[0]; g.fillText(word, 0, 0);
  g.lineWidth = 3; g.strokeStyle = cols[1]; g.strokeText(word, 0, 0);
  g.fillStyle = cols[0]; for (let k = 0; k < 6; k++) g.fillRect(-90 + k * 34, 20, 4, 10 + (k * 7) % 22);
}));
function poster(g, x, y, z, k, rot = 0) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.88), lam({ map: POSTERS[k % POSTERS.length], transparent: true })); p.position.set(x, y, z); p.rotation.z = rot; g.add(p); return p; }
function graffiti(g, x, y, z, k, wdt = 1.6) { const p = new THREE.Mesh(new THREE.PlaneGeometry(wdt, wdt * 0.375), lam({ map: GRAFFITI[k % GRAFFITI.length], transparent: true, depthWrite: false })); p.position.set(x, y, z); g.add(p); return p; }
const fadeables = [];
// a thin bar from (x0,y0) to (x1,y1) on the facade plane
function edge(g, x0, y0, x1, y1, z, m, t = 0.16) { const b = box(Math.hypot(x1 - x0, y1 - y0) + t * 0.6, t, 0.1, m, (x0 + x1) / 2, (y0 + y1) / 2, z, g, false); b.rotation.z = Math.atan2(y1 - y0, x1 - x0); return b; }
function house(x, z, w, d, h, facing, mi, shopSign, opt = {}) {
  const g = new THREE.Group(); g.position.set(x, opt.y || 0, z); g.rotation.y = facing; scene.add(g);
  g.userData.fade = 1; fadeables.push(g);
  const col = opt.color ?? VICE[mi % VICE.length], wall = opt.brick ? brickMats[mi % brickMats.length] : clapMat(col);
  const kind = opt.gable ?? ['point', 'bell', 'point', 'step', 'point', 'bell'][mi % 6];
  const F = d / 2;
  box(w, h, d, wall, 0, h / 2, 0, g);
  // white corner boards and cornice
  for (const sx of [-1, 1]) box(0.18, h, 0.18, frameMat, sx * (w / 2 - 0.02), h / 2, F - 0.02, g, false);
  box(w + 0.12, 0.22, 0.3, frameMat, 0, h, F - 0.05, g, false);
  // gable on the street side + roof behind it
  let apex = 2.4;
  const gs = new THREE.Shape();
  if (kind === 'point') {
    apex = Math.min(w * 0.85, 5);
    gs.moveTo(-w / 2, 0); gs.lineTo(0, apex); gs.lineTo(w / 2, 0);
  } else if (kind === 'bell') {
    apex = 3.0;
    gs.moveTo(-w / 2, 0); gs.quadraticCurveTo(-w / 2, 1.2, -w / 4, 1.5); gs.lineTo(-w / 4, apex - 0.4); gs.quadraticCurveTo(0, apex + 0.3, w / 4, apex - 0.4); gs.lineTo(w / 4, 1.5); gs.quadraticCurveTo(w / 2, 1.2, w / 2, 0);
  } else {
    gs.moveTo(-w / 2, 0); gs.lineTo(-w / 2, 1.2); gs.lineTo(-w / 4, 1.2); gs.lineTo(-w / 4, 2.4); gs.lineTo(w / 4, 2.4); gs.lineTo(w / 4, 1.2); gs.lineTo(w / 2, 1.2); gs.lineTo(w / 2, 0);
  }
  const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(gs, { depth: 0.4, bevelEnabled: false }), wall);
  gm.position.set(0, h, F - 0.4); gm.castShadow = true; g.add(gm);
  const rs = new THREE.Shape(); rs.moveTo(-w / 2 - 0.25, -0.1); rs.lineTo(0, kind === 'point' ? apex : 2.3); rs.lineTo(w / 2 + 0.25, -0.1);
  const rm = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: d - 0.6, bevelEnabled: false }), roofMat);
  rm.position.set(0, h, -F); rm.castShadow = true; g.add(rm);
  if (opt.simple) { fadeables.pop(); return g; } // back-row filler: silhouette only
  // white bargeboards along the gable, neon tube on some houses
  const neon = opt.neon ?? (mi % 2 === 0 ? NEON[(mi >> 1) % NEON.length] : null);
  if (kind === 'point') {
    edge(g, -w / 2 - 0.1, h - 0.05, 0, h + apex + 0.08, F + 0.02, frameMat, 0.24); edge(g, 0, h + apex + 0.08, w / 2 + 0.1, h - 0.05, F + 0.02, frameMat, 0.24);
    box(0.9, 1.1, 0.06, frameMat, 0, h + apex * 0.38, F + 0.02, g, false); box(0.7, 0.9, 0.07, winMat, 0, h + apex * 0.38, F + 0.04, g, false);
    if (neon) { neonTube(g, -w / 2 + 0.25, h + 0.1, 0, h + apex - 0.3, F + 0.1, neon); neonTube(g, 0, h + apex - 0.3, w / 2 - 0.25, h + 0.1, F + 0.1, neon); }
  } else if (neon) neonTube(g, -w * 0.45, h + 0.25, w * 0.45, h + 0.25, F + 0.12, neon);
  // more Neon Vice: a neon band above the shop floor, blade signs, glowing window outlines
  const n2 = NEON[(mi + 1) % NEON.length];
  if (!opt.noDoor && mi % 3 !== 2) neonTube(g, -w / 2 + 0.2, 2.75, w / 2 - 0.2, 2.75, F + 0.12, n2);
  if (!opt.noDoor && mi % 3 === 1 && !shopSign) bladeSign(g, (mi % 2 ? 1 : -1) * (w / 2 - 0.35), 4.9, F, BLADES[mi % BLADES.length], NEON[(mi + 2) % NEON.length]);
  if (mi % 4 === 0 && h > 6) neonRect(g, (mi % 8 ? 1 : -1) * w * 0.24, 3.4, 1.35, 1.85, F + 0.1, NEON[(mi + 3) % NEON.length]);
  // windows: white frames, glassy panes, a mullion and a sill
  const floors = Math.floor((h - 1) / 2.8);
  for (let f = 0; f < floors; f++) {
    const y = 3.4 + f * 2.8;
    for (let k = 0; k < (w < 4.8 ? 1 : 2); k++) {
      const wx = w < 4.8 ? -w * 0.12 : (k - 0.5) * w * 0.48;
      box(1.2, 1.7, 0.06, frameMat, wx, y, F + 0.02, g, false);
      box(0.95, 1.45, 0.07, winMat, wx, y, F + 0.04, g, false);
      box(0.06, 1.45, 0.09, frameMat, wx, y, F + 0.05, g, false); box(0.95, 0.06, 0.09, frameMat, wx, y + 0.25, F + 0.05, g, false);
      box(1.3, 0.08, 0.22, frameMat, wx, y - 0.88, F + 0.1, g, false);
    }
  }
  if (opt.clock) { // Zaandam-style clock gable
    const ck = new THREE.Mesh(new THREE.CircleGeometry(0.85, 28), lam({ map: canvasTex(128, 128, (c) => { c.fillStyle = '#fbf6e8'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.strokeStyle = '#1a1a1a'; c.lineWidth = 6; c.stroke(); for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; c.fillStyle = '#1a1a1a'; c.fillRect(64 + Math.cos(a) * 48 - 3, 64 + Math.sin(a) * 48 - 3, 6, 6); } c.lineWidth = 7; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 26); c.moveTo(64, 64); c.lineTo(90, 70); c.stroke(); }) }));
    ck.position.set(0, h + apex * 0.42, F + 0.08); g.add(ck);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 6, 28), lam({ color: 0xd8b040 })); ring.position.copy(ck.position); g.add(ring);
  }
  if (shopSign) {
    box(w * 0.86, 2.2, 0.08, lam({ color: 0x1b2430 }), 0, 1.3, F + 0.03, g, false);
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, 0.7), lam({ map: signTex([{ t: shopSign, size: 44 }], '#1e120a', '#' + (neon || 0xe8862c).toString(16).padStart(6, '0')), emissive: 0x401838 }));
    s.position.set(0, 2.75, F + 0.09); g.add(s);
    const awnT = canvasTex(64, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#' + col.toString(16).padStart(6, '0'); c.fillRect(i * 8, 0, 8, 64); } });
    const awn = box(w * 0.9, 0.12, 1.2, lam({ map: awnT }), 0, 2.45, F + 0.6, g);
    awn.rotation.x = 0.25;
  } else if (!opt.noDoor) {
    box(1.1, 2.3, 0.08, frameMat, w * 0.28, 1.15, F + 0.02, g, false);
    box(0.9, 2.15, 0.1, lam({ color: [0x1f5a48, 0xffffff, 0x2a3a6a, 0x8a1a3a][mi % 4] }), w * 0.28, 1.08, F + 0.03, g, false);
    box(1.2, 1.5, 0.06, frameMat, -w * 0.2, 1.5, F + 0.02, g, false);
    box(1.0, 1.3, 0.07, winMat, -w * 0.2, 1.5, F + 0.04, g, false);
    // street wear: posters between window and door, tags under the window
    if (mi % 3 !== 1) poster(g, w * 0.04 + 0.1, 1.55, F + 0.03, mi * 3 + 1, ((mi % 5) - 2) * 0.04);
    if (mi % 5 === 1 || mi % 5 === 3) poster(g, w * 0.04 + 0.5, 1.75, F + 0.035, mi * 3 + 2, 0.06);
    if (mi % 2 === 1) graffiti(g, -w * 0.2, 0.42, F + 0.03, mi, 1.5);
  }
  g.traverse((c) => { if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; } });
  return g;
}
// Inntel-style stack of houses: a landmark at the west end of the street
function stackTower(x0, x1, z) {
  const W = x1 - x0, cx = (x0 + x1) / 2;
  house(cx, z, W, 9, 6.5, 0, 0, null, { gable: 'step', color: 0x1f7a5e, neon: 0xe8862c });
  house(cx - W * 0.24, z + 0.4, W * 0.5, 7, 4.2, 0, 1, null, { y: 6.5, gable: 'point', color: 0x4f9ee0, noDoor: true, neon: 0xf2c14e });
  house(cx + W * 0.26, z - 0.5, W * 0.48, 7, 5.6, 0, 3, null, { y: 6.5, gable: 'bell', color: 0x2fb8b0, noDoor: true });
  house(cx + 0.3, z + 0.2, W * 0.62, 6, 3.6, 0, 6, null, { y: 12.4, gable: 'point', color: 0x7ad8b0, noDoor: true, neon: 0xffe14a });
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.8), lam({ map: signTex([{ t: 'HOTEL KAASLAND', size: 40 }], '#1e120a', '#a9c46a'), emissive: 0x204050 }));
  hs.position.set(cx, 5.6, z + 4.55); scene.add(hs);
  solid(x0, x1, z - 4.5, z + 4.5);
}
// north side: houses west and east of the warehouse (fronts face south, +z)
// split a span into house widths of 4.5-7.5 m that fill it exactly (no sliver houses)
function spanWidths(len, k0) {
  const ws = []; let left = len, k = k0;
  while (left > 0.01) { let w = 5 + (k % 3); if (left - w < 4.5) w = left <= 7.5 ? left : left / 2; ws.push(w); left -= w; k++; }
  return ws;
}
// fill the far west, past the play area (so no empty plots), then the Hotel Kaasland stack
{ let x = -64; spanWidths(30, 0).forEach((w, i) => { house(x + w / 2, -11, w, 9, 9 + (i % 4), 0, i + 20); x += w; }); }
stackTower(-34, -26.5, -11);
const WH_X0_GAP = -11.2;
// Shoarma Schmatzel: loyal to Eddy Sr., right next to the Hotel Kaasland stack
const JS = { x0: -26.5, x1: -16.5, z0: -15.5, z1: -6.5, h: 4.8, doorX0: -21.6, doorX1: -20.2 };
let nx = JS.x1, hi = 3;
for (const w of spanWidths(WH_X0_GAP - nx, hi)) { house(nx + w / 2, -11, w, 9, 9 + (hi % 3) * 1.3, 0, hi); solid(nx, nx + w, -15.5, -6.5); nx += w; hi++; }
// east of the warehouse: Eddy's private parking (x 1..9.5), then the houses, with The Russian's pawnshop in between
const LOT = { x0: 1.15, x1: 9.5 };
const PS = { x0: 20, x1: 28, z0: -15.5, z1: -6.5, h: 4.8, doorX0: 23.2, doorX1: 24.6 };
nx = LOT.x1;
for (const [a, b] of [[LOT.x1, PS.x0], [PS.x1, 64]]) for (const w of spanWidths(b - a, hi)) {
  if (nx < a) nx = a;
  house(nx + w / 2, -11, w, 9, 9 + (hi % 4) * 1.1, 0, hi, hi === 7 ? 'BITTERBAL & ZO' : null, hi === 9 ? { gable: 'point', color: 0x23a07a, clock: true, neon: null } : {}); solid(nx, nx + w, -15.5, -6.5); nx += w; hi++;
}
// back row behind the street (only the roofs show) so nothing looks empty from the camera
for (let x = -64, i = 0; x < 64; i++) { const w = 5 + (i % 3); house(x + w / 2, -25.5, w, 9, 10 + (i % 4) * 1.2, 0, i + 7, null, { simple: true }); x += w; }
// backdrop houses across the canal
for (let x = -60, i = 0; x < 60; i++) { const w = 5 + (i % 3); house(x + w / 2, CZ + 8.5, w, 8, 9 + (i % 4), Math.PI, i + 2, i === 13 ? 'SHOARMA HABIBI' : null); x += w; }

// ------------------------------------------------------------------ the warehouse
const WH = { x0: -11, x1: 1, z0: -19, z1: -7, h: 5.2, doorX0: -7, doorX1: -2.5 };
const wh = new THREE.Group(); scene.add(wh);
// painted corrugated sheet (generated so the colour stays bright): mint walls like the outlet sheds
const corrTex = canvasTex(128, 32, (g, w, h) => { for (let x = 0; x < w; x++) { const v = 200 + Math.round(55 * Math.cos(x / w * Math.PI * 16)); g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h); } });
corrTex.wrapS = corrTex.wrapT = THREE.RepeatWrapping; corrTex.repeat.set(6, 1);
const corr = new THREE.MeshStandardMaterial({ map: corrTex, bumpMap: corrTex, bumpScale: 2, color: 0x8ae6da, roughness: 0.6 });
const corrS = new THREE.MeshStandardMaterial({ map: corrTex, bumpMap: corrTex, bumpScale: 2, color: 0x8ae6da, roughness: 0.6, transparent: true });
const whFloor = new THREE.Mesh(new THREE.PlaneGeometry(WH.x1 - WH.x0, WH.z1 - WH.z0), pbr('concrete_floor.jpg', 3, 3, 0xc8c6c0, 0.8, 0.5));
whFloor.rotation.x = -Math.PI / 2; whFloor.position.set((WH.x0 + WH.x1) / 2, 0.03, (WH.z0 + WH.z1) / 2); whFloor.receiveShadow = true; wh.add(whFloor);
// back + side walls
box(WH.x1 - WH.x0, WH.h, 0.3, corr, (WH.x0 + WH.x1) / 2, WH.h / 2, WH.z0, wh);
box(0.3, WH.h, WH.z1 - WH.z0, corr, WH.x0, WH.h / 2, (WH.z0 + WH.z1) / 2, wh);
box(0.3, WH.h, WH.z1 - WH.z0, corr, WH.x1, WH.h / 2, (WH.z0 + WH.z1) / 2, wh);
solid(WH.x0 - 0.2, WH.x1 + 0.2, WH.z0 - 0.3, WH.z0 + 0.15);
solid(WH.x0 - 0.15, WH.x0 + 0.15, WH.z0, WH.z1);
solid(WH.x1 - 0.15, WH.x1 + 0.15, WH.z0, WH.z1);
// front (south) wall: low strip always visible, the rest hides when you're inside
const frontHigh = new THREE.Group(); wh.add(frontHigh);
const frontLow = new THREE.Group(); wh.add(frontLow);
function frontWall(x0, x1) {
  box(x1 - x0, WH.h - 0.6, 0.3, corrS, (x0 + x1) / 2, 0.6 + (WH.h - 0.6) / 2, WH.z1, frontHigh);
  box(x1 - x0, 0.6, 0.3, corr, (x0 + x1) / 2, 0.3, WH.z1, frontLow);
  solid(x0, x1, WH.z1 - 0.15, WH.z1 + 0.15);
}
frontWall(WH.x0, WH.doorX0); frontWall(WH.doorX1, WH.x1);
box(WH.doorX1 - WH.doorX0, WH.h - 3.4, 0.3, corrS, (WH.doorX0 + WH.doorX1) / 2, 3.4 + (WH.h - 3.4) / 2, WH.z1, frontHigh);
// roller door
const shutterTex = canvasTex(64, 256, (g, w, h) => { for (let y = 0; y < h; y += 8) { g.fillStyle = y % 16 ? '#8c9298' : '#a8aeb4'; g.fillRect(0, y, w, 8); } });
const shutter = box(WH.doorX1 - WH.doorX0, 3.4, 0.12, lam({ map: shutterTex }), (WH.doorX0 + WH.doorX1) / 2, 1.7, WH.z1 + 0.05, wh);
const shutterSolid = solid(WH.doorX0, WH.doorX1, WH.z1 - 0.15, WH.z1 + 0.15);
// sign
const sign = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.35), lam({ map: signTex([{ t: 'EDDY & ZN', size: 52 }, { t: 'SPECERIJEN · SINDS 1987', size: 26, color: '#ffffff' }], '#6b1410', '#ffd36b', 512, 160) }));
sign.position.set((WH.doorX0 + WH.doorX1) / 2, 4.25, WH.z1 + 0.2); frontHigh.add(sign);
// roof (hidden while inside)
const roof = new THREE.Group(); wh.add(roof);
const roofMesh = box(WH.x1 - WH.x0 + 0.8, 0.25, WH.z1 - WH.z0 + 0.8, lam({ map: tex('roof_rust.jpg', 4, 4), color: 0xa08070 }), (WH.x0 + WH.x1) / 2, WH.h + 0.1, (WH.z0 + WH.z1) / 2, roof);
for (let i = 0; i < 2; i++) box(1.2, 0.5, 1.2, lam({ color: 0x8a8f94 }), WH.x0 + 3 + i * 6, WH.h + 0.45, -13, roof);
// sawtooth front parapet (like the outlet sheds), white trim + pink neon along the teeth
{
  const teeth = 4, tw = (WH.x1 - WH.x0) / teeth, th = 1.6;
  const ss = new THREE.Shape(); ss.moveTo(WH.x0, 0);
  for (let i = 0; i < teeth; i++) { ss.lineTo(WH.x0 + i * tw + tw * 0.78, th); ss.lineTo(WH.x0 + (i + 1) * tw, 0); }
  const saw = new THREE.Mesh(new THREE.ExtrudeGeometry(ss, { depth: 0.3, bevelEnabled: false }), new THREE.MeshStandardMaterial({ map: corrTex, color: 0xff7a68, roughness: 0.6 }));
  saw.position.set(0, WH.h, WH.z1 - 0.15); saw.castShadow = true; roof.add(saw);
  const white = lam({ color: 0xf6f4ee }), pink = new THREE.MeshBasicMaterial({ color: 0xe8862c });
  for (let i = 0; i < teeth; i++) {
    const a = [WH.x0 + i * tw, WH.h], b = [WH.x0 + i * tw + tw * 0.78, WH.h + th], c = [WH.x0 + (i + 1) * tw, WH.h];
    for (const [p, q, m, t, dz] of [[a, b, white, 0.18, 0.2], [b, c, white, 0.18, 0.2], [a, b, pink, 0.07, 0.3], [b, c, pink, 0.07, 0.3]]) {
      const e = box(Math.hypot(q[0] - p[0], q[1] - p[1]), t, 0.08, m, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, WH.z1 + dz, roof, false); e.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]);
    }
  }
  for (const x of [WH.x0, WH.x1]) box(0.22, WH.h, 0.22, white, x, WH.h / 2, WH.z1 + 0.05, frontLow, false);
  graffiti(frontLow, -9.2, 0.75, WH.z1 + 0.17, 1, 2.6); graffiti(frontLow, -0.7, 0.75, WH.z1 + 0.17, 4, 2.0);
  poster(frontHigh, -10.2, 2.2, WH.z1 + 0.17, 5); poster(frontHigh, -9.4, 2.25, WH.z1 + 0.17, 0, 0.05); poster(frontHigh, 0.2, 2.2, WH.z1 + 0.17, 1, -0.04);
  neonTube(frontHigh, WH.x0 + 0.3, 3.85, WH.doorX0 - 0.3, 3.85, WH.z1 + 0.22, 0xf2c14e); neonTube(frontHigh, WH.doorX1 + 0.3, 3.85, WH.x1 - 0.3, 3.85, WH.z1 + 0.22, 0xf2c14e);
  box(WH.x1 - WH.x0 + 0.2, 0.2, 0.25, white, (WH.x0 + WH.x1) / 2, WH.h - 0.05, WH.z1 + 0.06, frontHigh, false);
}
// interior lights
const inLight1 = new THREE.PointLight(0xfff0d0, 0, 14, 1.6); inLight1.position.set(-7.5, 4.2, -13); wh.add(inLight1);
const inLight2 = new THREE.PointLight(0xfff0d0, 0, 14, 1.6); inLight2.position.set(-2.5, 4.2, -13); wh.add(inLight2);
for (const x of [-7.5, -2.5]) box(2.4, 0.1, 0.25, lam({ color: 0xffffff, emissive: 0xfff6d8 }), x, 4.7, -13, roof, false);
// shelves along the back
for (let i = 0; i < 2; i++) {
  const sx = WH.x0 + 6.4 + i * 3.9;
  box(3.6, 0.08, 1.0, mat.wood, sx, 1.0, WH.z0 + 0.8, wh); box(3.6, 0.08, 1.0, mat.wood, sx, 2.1, WH.z0 + 0.8, wh);
  for (let k = 0; k < 4; k++) box(0.5, 0.6, 0.5, lam({ color: [0xb08a5a, 0x9a7a4a, 0xc0a070][k % 3] }), sx - 1.3 + k * 0.85, 1.35, WH.z0 + 0.8, wh);
  solid(sx - 1.8, sx + 1.8, WH.z0, WH.z0 + 1.35);
}
const isInside = (p) => p.x > WH.x0 && p.x < WH.x1 && p.z > WH.z0 && p.z < WH.z1 - 0.1;

// ------------------------------------------------------------------ street props
function lamp(x, z) {
  cyl(0.07, 0.09, 4.6, mat.dark, x, 2.3, z);
  const dir = z < 0 ? 1 : -1; // arm points out over the road
  box(0.22, 0.12, 1.1, mat.dark, x, 4.6, z + dir * 0.5);
  box(0.34, 0.1, 0.4, lam({ color: 0xfff4d0, emissive: 0x806a30 }), x, 4.52, z + dir * 0.95, scene, false);
}
for (let x = -30; x <= 30; x += 12) { lamp(x === 6 ? 10.6 : x, RC - 5.3); lamp(x + 6, ROAD.bike1 + 0.2); }
for (let x = -32; x <= 32; x += 2.6) if (Math.abs(x - 14) > 3) bollard(x, ROAD.walk1 + 0.05);
function bollard(x, z) { cyl(0.09, 0.11, 0.9, lam({ color: 0x5a1a14 }), x, 0.45, z); }
// 80s Kaasland cars: side profiles with rounded corners, extruded with a bevel, glass greenhouses, chrome bits
const CAR_PAINT = [0xc8102e, 0xf2e8c8, 0x1f4fa0, 0x2f6a3a, 0xe8b020, 0x7a2a5a, 0xd8d8d8, 0x1a1a1a, 0xff7a3a, 0x5ac8c0, 0xff8fb8, 0x8a6a4a, 0x3a3a6a];
let carSeed = 7;
const crand = () => { carSeed = (carSeed * 16807) % 2147483647; return (carSeed - 1) / 2147483646; };
function car(x, z, color, rot = 0, isSolid = true, model = -1) { // street cars come from js/vehicles.js
  const paint = crand() < 0.35 && color ? color : CAR_PAINT[Math.floor(crand() * CAR_PAINT.length)];
  const g = makeCar(THREE, canvasTex, { model, paint, rand: crand }); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const half = g.userData.half, W = g.userData.width;
  if (isSolid) solid(x - half, x + half, z - W / 2 - 0.05, z + W / 2 + 0.05);
  return g;
}
const parkedN = []; // x of cars parked along the north pavement (ticket inspectors work these)
const CAR_COLS = [0xb8b2a2, 0x6a1e22, 0x2a4a6a, 0xcfcfc8, 0x2d2d2d, 0x8a8f3a, 0xe0d8c0, 0x3a5a7a, 0x9a2a2a, 0x556b5a];
// parked cars in the bays (none in front of the warehouse, the lot, or on the zebra)
{
  let k = 0;
  for (let x = -63.2; x < 63; x += 5.6) for (const z of [RC - 4, RC + 4]) {
    k++;
    if (Math.abs(x + 18) < 4) continue;
    if (z < RC && x > -13 && x < 11) continue;
    if (z < RC && x > PS.doorX0 - 3.5 && x < PS.doorX1 + 2.5) continue;
    if ((k * 7) % 5 === 0) continue;
    car(x + 2.8, z, CAR_COLS[(k * 3) % CAR_COLS.length], (k % 2) * Math.PI, true);
    if (z < RC) parkedN.push(x + 2.8);
  }
}
// bike racks on the pavement (it's Kaasland after all)
for (const rx of [-24, 4, 30]) for (let i = 0; i < 5; i++) {
  const b = new THREE.Group(); b.position.set(rx + i * 0.7, 0, RC + 10.35); b.rotation.y = Math.PI / 2; scene.add(b);
  for (const zz of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 4, 12), mat.black); w.position.set(0, 0.35, zz); w.rotation.y = Math.PI / 2; b.add(w); }
  box(0.05, 0.05, 1.1, lam({ color: [0x223344, 0x553311, 0x335522, 0x6a1a1a][i % 4] }), 0, 0.6, 0, b, false);
  if (i === 0) solid(rx - 0.4, rx + 3.2, RC + 9.95, RC + 10.75);
}

// ------------------------------------------------------------------ the Oofmobiel
// Eddy's private parking: asphalt lot with a low back wall and a PRIVÉ sign
{
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(LOT.x1 - LOT.x0, 8.5), lam({ map: tex('asphalt.jpg', 4, 4), color: 0x8c8c8c }));
  lot.rotation.x = -Math.PI / 2; lot.position.set((LOT.x0 + LOT.x1) / 2, 0.018, -11.25); lot.receiveShadow = true; scene.add(lot);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(LOT.x1 - LOT.x0 - 1, RC - 5.1 + 7), lam({ map: tex('asphalt.jpg', 4, 1), color: 0x8c8c8c }));
  drive.rotation.x = -Math.PI / 2; drive.position.set((LOT.x0 + LOT.x1) / 2, 0.02, (RC - 5.1 - 7) / 2); scene.add(drive);
  for (const x of [LOT.x0 + 1.2, LOT.x1 - 1.0]) box(0.12, 0.01, 6.5, lam({ color: 0xf2d24a }), x, 0.03, -11.6, scene, false);
  const prive = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#ffd36b'; g.fillRect(0, 0, w, h); g.fillStyle = '#6b1410'; g.font = '900 34px Arial Black, Arial'; g.textAlign = 'center'; g.fillText('PRIVÉ', w / 2, 52); g.font = '700 22px Arial'; g.fillText('EDDY & ZN · OOFMOBIEL', w / 2, 90); g.fillText('wegsleepregeling', w / 2, 116); });
  box(LOT.x1 - LOT.x0, 1.6, 0.3, brickMats[3], (LOT.x0 + LOT.x1) / 2, 0.8, -15.35); solid(LOT.x0, LOT.x1, -15.5, -15.2);
  graffiti(scene, 3.4, 0.85, -15.18, 3, 2.6); graffiti(scene, 7.2, 0.8, -15.18, 6, 2.2);
  cyl(0.05, 0.05, 2.2, mat.dark, LOT.x1 - 0.6, 1.1, -7.2);
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), lam({ map: prive })); ps.position.set(LOT.x1 - 0.6, 2.0, -7.14); scene.add(ps);
  // painted word on the lot floor
  const pw = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), lam({ map: canvasTex(256, 64, (g) => { g.fillStyle = '#f2d24a'; g.font = '900 44px Arial'; g.textAlign = 'center'; g.fillText('PRIVÉ', 128, 50); }), transparent: true }));
  pw.rotation.x = -Math.PI / 2; pw.position.set((LOT.x0 + LOT.x1) / 2, 0.035, -7.8); scene.add(pw);
}
const oof = new THREE.Group(); oof.position.set((LOT.x0 + LOT.x1) / 2, 0, -11.4); oof.rotation.y = -Math.PI / 2; scene.add(oof);
{ const v = makeOofmobiel(THREE, canvasTex); v.rotation.y = Math.PI / 2; oof.add(v); } // nose along the group's +x, as before
solid(oof.position.x - 1.15, oof.position.x + 1.15, oof.position.z - 3.0, oof.position.z + 3.3);

// ------------------------------------------------------------------ characters
const faceTex = (f) => { const t = loader.load('./assets/' + f); t.colorSpace = THREE.SRGBColorSpace; return t; };
// ---- painted heads (Neon Vice approach: a stylised PS2 face painted from the reference photo's colours and features)
const hex = (c) => '#' + c.toString(16).padStart(6, '0');
function shade(c, k) { const r = Math.min(255, ((c >> 16) & 255) * k) | 0, g = Math.min(255, ((c >> 8) & 255) * k) | 0, b = Math.min(255, (c & 255) * k) | 0; return `rgb(${r},${g},${b})`; }
function paintHead(f) {
  // sphere UVs: face centre at u = 0.25 (x = 128), eyes on the equator (y ~ 124)
  return canvasTex(512, 256, (g, W, H) => {
    const C = 128, sk = f.skin;
    g.fillStyle = hex(sk); g.fillRect(0, 0, W, H);
    // soft shading: darker towards the sides/back, warm cheeks, brow ridge
    const grd = g.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, 'rgba(0,0,0,.18)'); grd.addColorStop(0.25, 'rgba(0,0,0,0)'); grd.addColorStop(0.5, 'rgba(0,0,0,.2)'); grd.addColorStop(0.75, 'rgba(0,0,0,.26)'); grd.addColorStop(1, 'rgba(0,0,0,.18)');
    g.fillStyle = grd; g.fillRect(0, 0, W, H);
    const soft = (x, y, rx, ry, col) => { g.save(); g.translate(x, y); g.scale(rx, ry); const r = g.createRadialGradient(0, 0, 0, 0, 0, 1); r.addColorStop(0, col); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(-1, -1, 2, 2); g.restore(); };
    g.save(); g.translate(C, 128); g.scale(1.32, 1.32); g.translate(-C, -128);
    for (const s of [-1, 1]) { soft(C + s * 30, 150, 16, 13, 'rgba(225,95,75,.28)'); soft(C + s * 34, 140, 10, 22, 'rgba(0,0,0,.12)'); }
    soft(C, 110, 42, 9, 'rgba(0,0,0,.14)');
    if (f.stubble) { for (let i = 0; i < 420; i++) { const x = C + (Math.random() - 0.5) * 92, y = 150 + Math.random() * 46; if (Math.abs(x - C) < 46 - (y - 150) * 0.25 && !(Math.abs(x - C) < 18 && Math.abs(y - 168) < 6)) { g.fillStyle = 'rgba(40,25,18,.18)'; g.fillRect(x, y, 1.4, 1.4); } } soft(C, 172, 34, 20, 'rgba(60,40,30,.12)'); }
    // ears
    for (const s of [-1, 1]) { g.fillStyle = shade(sk, 0.86); g.beginPath(); g.ellipse(C + s * 62, 130, 7, 13, 0, 0, 7); g.fill(); }
    // eyes: almond whites, iris, heavy upper lid
    for (const s of [-1, 1]) {
      const ex = C + s * 19, ey = 124;
      soft(ex, ey + 6, 12, 5, 'rgba(60,30,25,.25)');
      g.fillStyle = '#f2ece4'; g.beginPath(); g.moveTo(ex - 10, ey); g.quadraticCurveTo(ex, ey - (f.squint ? 5 : 7), ex + 10, ey); g.quadraticCurveTo(ex, ey + 5, ex - 10, ey); g.fill();
      g.fillStyle = f.iris || '#4a2e1c'; g.beginPath(); g.arc(ex, ey - 0.5, 4.2, 0, 7); g.fill();
      g.fillStyle = '#120a06'; g.beginPath(); g.arc(ex, ey - 0.5, 2, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.fillRect(ex + 1, ey - 3, 1.6, 1.6);
      g.strokeStyle = shade(sk, 0.45); g.lineWidth = 2.2; g.beginPath(); g.moveTo(ex - 11, ey + 0.5); g.quadraticCurveTo(ex, ey - (f.squint ? 6 : 8), ex + 11, ey + 0.5); g.stroke();
      // brows
      g.strokeStyle = f.brow; g.lineWidth = f.browW || 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - s * 9, ey - 13); g.quadraticCurveTo(ex, ey - 18, ex + s * 12, ey - 12); g.stroke();
    }
    // nose
    g.strokeStyle = shade(sk, 0.62); g.lineWidth = 2; g.beginPath(); g.moveTo(C - 3, 128); g.quadraticCurveTo(C - 6, 146, C - 8, 150); g.quadraticCurveTo(C, 156, C + 8, 150); g.stroke();
    soft(C, 152, 9, 5, 'rgba(0,0,0,.16)');
    if (f.beard) { // full ginger beard + moustache (The Russian, like Nine of Nine)
      g.fillStyle = f.beard;
      g.beginPath(); g.moveTo(C - 50, 132); g.quadraticCurveTo(C - 54, 196, C, 206); g.quadraticCurveTo(C + 54, 196, C + 50, 132); g.quadraticCurveTo(C + 30, 160, C, 158); g.quadraticCurveTo(C - 30, 160, C - 50, 132); g.fill();
      g.beginPath(); g.moveTo(C - 22, 162); g.quadraticCurveTo(C, 150, C + 22, 162); g.quadraticCurveTo(C, 158, C - 22, 162); g.fill();
      for (let i = 0; i < 200; i++) { const a = Math.random() * Math.PI, r = 30 + Math.random() * 22; g.strokeStyle = 'rgba(60,25,8,.35)'; g.lineWidth = 1; g.beginPath(); const x = C + Math.cos(a) * r * 0.95, y = 158 + Math.sin(a) * r * 0.85; g.moveTo(x, y); g.lineTo(x + 1.5, y + 3); g.stroke(); }
    }
    // mouth: big smile (both reference photos are laughing)
    const my = 166;
    if (f.mouth === 'laugh') {
      g.fillStyle = '#4a1414'; g.beginPath(); g.moveTo(C - 20, my); g.quadraticCurveTo(C, my + 22, C + 20, my); g.quadraticCurveTo(C, my + 4, C - 20, my); g.fill();
      g.fillStyle = '#f4efe2'; g.beginPath(); g.moveTo(C - 16, my + 1.5); g.quadraticCurveTo(C, my + 7, C + 16, my + 1.5); g.quadraticCurveTo(C, my + 3, C - 16, my + 1.5); g.fill();
    } else {
      g.fillStyle = '#5a1a16'; g.beginPath(); g.moveTo(C - 17, my - 2); g.quadraticCurveTo(C, my + 14, C + 17, my - 2); g.quadraticCurveTo(C, my + 4, C - 17, my - 2); g.fill();
      g.fillStyle = '#f4efe2'; g.fillRect(C - 11, my - 0.5, 22, 4);
    }
    g.strokeStyle = shade(sk, 0.6); g.lineWidth = 1.6; for (const s of [-1, 1]) { g.beginPath(); g.arc(C + s * 24, my - 4, 5, s > 0 ? 0.2 : 2.3, s > 0 ? 1.0 : 3.0); g.stroke(); }
    if (f.goatee) { // a trimmed goatee: thin moustache down into a pointed chin beard
      g.fillStyle = f.goatee;
      g.beginPath(); g.moveTo(C - 21, my - 1); g.quadraticCurveTo(C, my - 12, C + 21, my - 1); g.quadraticCurveTo(C, my - 6, C - 21, my - 1); g.fill();
      for (const s of [-1, 1]) { g.beginPath(); g.moveTo(C + s * 20, my - 1); g.lineTo(C + s * 17, my + 14); g.lineTo(C + s * 12, my + 13); g.lineTo(C + s * 15, my); g.fill(); }
      g.beginPath(); g.moveTo(C - 13, my + 10); g.quadraticCurveTo(C, my + 16, C + 13, my + 10); g.lineTo(C + 9, my + 26); g.quadraticCurveTo(C, my + 34, C - 9, my + 26); g.closePath(); g.fill();
    }
    if (f.glasses) {
      g.strokeStyle = '#0c0c10'; g.lineWidth = 3.2;
      for (const s of [-1, 1]) { const ex = C + s * 19; g.beginPath(); g.roundRect(ex - 14, 115, 28, 18, 5); g.stroke(); }
      g.beginPath(); g.moveTo(C - 5, 121); g.lineTo(C + 5, 121); g.stroke();
      g.fillStyle = f.tint || 'rgba(190,220,255,.16)'; for (const s of [-1, 1]) g.fillRect(C + s * 19 - 12, 117, 24, 14);
    }
    g.restore();
    if (f.glasses) { g.strokeStyle = '#0c0c10'; g.lineWidth = 3; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(C + s * 44, 120); g.lineTo(C + s * 66, 124); g.stroke(); } }
    // hair: everything above the hairline, plus the back of the head
    g.fillStyle = f.hair;
    g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, f.backLine); g.lineTo(C + 128 + 20, f.backLine);
    g.quadraticCurveTo(C + 70, f.sideLine, C + 50, f.hairLine + 14); g.quadraticCurveTo(C, f.hairLine - 6, C - 50, f.hairLine + 14); g.quadraticCurveTo(C - 70, f.sideLine, C - 128 - 20, f.backLine); g.lineTo(0, f.backLine); g.closePath(); g.fill();
    if (f.curls) for (let i = 0; i < 380; i++) { const x = Math.random() * W, y = Math.random() * (f.backLine + 6); const inFace = Math.abs(x - C) < 50 && y > f.hairLine; if (!inFace) { g.strokeStyle = Math.random() < 0.5 ? shade(0x3a2a20, 1) : 'rgba(0,0,0,.6)'; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 2 + Math.random() * 3, 0, 5); g.stroke(); } }
  });
}
// shoulder cap for an open shirt: skin all the way up to the neck (sphere UVs, front at x = 128, cap = top half)
function collarTex(kind = 'jr') {
  if (kind === 'ru') return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#121216'; g.fillRect(0, 0, W, H); dolphins(g, W, H, 2);
    g.fillStyle = '#d0682a'; g.beginPath(); g.moveTo(128 - 78, 0); g.lineTo(128 + 78, 0); g.lineTo(128 + 34, H + 2); g.lineTo(128 - 34, H + 2); g.closePath(); g.fill();
    g.fillStyle = '#e8b896'; g.beginPath(); g.ellipse(128, 0, 46, 40, 0, 0, Math.PI); g.fill();
    g.strokeStyle = '#b4561e'; g.lineWidth = 6; g.beginPath(); g.ellipse(128, 0, 48, 42, 0, 0, Math.PI); g.stroke();
    g.strokeStyle = '#000'; g.lineWidth = 5; g.beginPath(); g.moveTo(128 - 78, 0); g.lineTo(128 - 34, H + 2); g.moveTo(128 + 78, 0); g.lineTo(128 + 34, H + 2); g.stroke();
  });
  // the half-sphere cap maps the full texture height (top of canvas = neck, bottom = where it meets the torso)
  const T = 46, B = 20; // half-widths of the V at the neck and at the torso seam (px of 512 = full circle)
  return canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#86acdf'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#e2a886'; g.beginPath(); g.moveTo(128 - T, 0); g.lineTo(128 + T, 0); g.lineTo(128 + B, H + 2); g.lineTo(128 - B, H + 2); g.closePath(); g.fill();
    for (let i = 0; i < 260; i++) { const y = 70 + Math.random() * (H - 70), half = T - (y / H) * (T - B); const x = 128 + (Math.random() - 0.5) * half * 1.5; g.fillStyle = 'rgba(55,32,18,.5)'; g.fillRect(x, y, 2, 2); }
    g.strokeStyle = '#f5c64e'; g.lineWidth = 3; for (const y of [90, 160]) { const half = T - (y / H) * (T - B) - 3; g.beginPath(); g.moveTo(128 - half, y - 8); g.quadraticCurveTo(128, y + 16, 128 + half, y - 8); g.stroke(); }
    g.strokeStyle = '#6a8fc4'; g.lineWidth = 5; g.beginPath(); g.moveTo(128 - T, 0); g.lineTo(128 - B, H + 2); g.moveTo(128 + T, 0); g.lineTo(128 + B, H + 2); g.stroke();
  });
}
function dolphins(g, W, H, n = 1) {
  const cols = [['#ff5aa0', '#ffb36b'], ['#38c8e8', '#a46bff'], ['#ff8a5a', '#ff4a8a'], ['#5ae0c8', '#3a9aff']];
  for (let i = 0; i < 14 * n; i++) {
    const x = Math.random() * W, y = Math.random() * H, s = 0.5 + Math.random() * 0.5, c = cols[i % 4];
    const gr = g.createLinearGradient(x - 14 * s, y, x + 14 * s, y); gr.addColorStop(0, c[0]); gr.addColorStop(1, c[1]);
    g.fillStyle = gr; g.save(); g.translate(x, y); g.rotate(Math.random() * 6.3); g.scale(s, s);
    g.beginPath(); g.ellipse(0, 0, 14, 5, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(-12, 0); g.lineTo(-20, -6); g.lineTo(-18, 5); g.fill(); g.beginPath(); g.moveTo(0, -4); g.lineTo(-4, -10); g.lineTo(4, -4); g.fill();
    g.restore();
  }
}
function shirtTex(kind) {
  // cylinder UVs (thetaStart = PI): front centre at x = 128
  return canvasTex(256, 128, (g, W, H) => {
    if (kind === 'jr') {
      g.fillStyle = '#86acdf'; g.fillRect(0, 0, W, H);
      for (let x = 0; x < W; x += 3) { g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x, 0, 1, H); }
      g.fillStyle = '#e2a886'; g.beginPath(); g.moveTo(118, 0); g.lineTo(138, 0); g.lineTo(128, 46); g.closePath(); g.fill();
      for (let i = 0; i < 60; i++) { const x = 118 + Math.random() * 20, y = 2 + Math.random() * 40; if (Math.abs(x - 128) < (46 - y) * 0.22) { g.fillStyle = 'rgba(55,32,18,.55)'; g.fillRect(x, y, 1.5, 1.5); } }
      g.strokeStyle = '#f5c64e'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(121, 4); g.quadraticCurveTo(128, 22, 135, 4); g.stroke();
      g.strokeStyle = '#6a8fc4'; g.lineWidth = 3; g.beginPath(); g.moveTo(117, 0); g.lineTo(128, 47); g.lineTo(139, 0); g.stroke();
      g.fillStyle = '#eef3fb'; for (let y = 56; y < H; y += 14) { g.beginPath(); g.arc(128, y, 2, 0, 7); g.fill(); }
    } else if (kind === 'ru') {
      g.fillStyle = '#121216'; g.fillRect(0, 0, W, H); dolphins(g, W, H);
      g.fillStyle = '#d0682a'; g.fillRect(110, 0, 36, H);
      g.strokeStyle = '#000'; g.lineWidth = 3; g.beginPath(); g.moveTo(110, 0); g.lineTo(110, H); g.moveTo(146, 0); g.lineTo(146, H); g.stroke();
    } else if (kind === 'sr') {
      g.fillStyle = '#232a40'; g.fillRect(0, 0, W, H);
      for (let y = 0; y < H; y += 4) { g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(0, y, W, 2); }
      g.strokeStyle = '#9a2222'; g.lineWidth = 6; g.beginPath(); g.moveTo(98, 0); g.quadraticCurveTo(128, 46, 158, 0); g.stroke();
      g.strokeStyle = '#ece6d4'; g.lineWidth = 3; g.beginPath(); g.moveTo(104, 0); g.quadraticCurveTo(128, 38, 152, 0); g.stroke();
    } else if (kind && kind[0] === '#') { // plain tee for passers-by: crew neck, maybe stripes; 'p' = police uniform
      g.fillStyle = kind.slice(0, 7); g.fillRect(0, 0, W, H);
      const fl = kind.slice(7);
      if (fl.includes('s')) for (let y = 14; y < H; y += 18) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y, W, 7); }
      if (fl.includes('c')) { g.fillStyle = '#ffd23a'; g.fillRect(0, 62, W, 12); g.fillStyle = '#ffffff'; g.font = '900 16px Arial'; g.textAlign = 'center'; g.fillText('CONTROLE', 0, 40); g.fillText('CONTROLE', W, 40); g.fillStyle = '#ffd23a'; g.fillRect(104, 26, 14, 10); }
      if (fl.includes('a')) { g.fillStyle = '#f2efe6'; g.fillRect(96, 30, 64, H - 30); g.strokeStyle = '#d8d2c4'; g.lineWidth = 3; g.beginPath(); g.moveTo(100, 30); g.lineTo(84, 0); g.moveTo(156, 30); g.lineTo(172, 0); g.stroke(); g.fillStyle = '#c8402e'; g.font = '900 11px Arial'; g.textAlign = 'center'; g.fillText('SCHMATZEL', 128, 60); }
      if (fl.includes('p')) {
        g.fillStyle = '#d8b040'; g.beginPath(); g.moveTo(104, 30); g.lineTo(112, 26); g.lineTo(120, 30); g.lineTo(118, 42); g.lineTo(112, 46); g.lineTo(106, 42); g.fill();
        g.fillStyle = '#ffffff'; g.fillRect(126, 0, 4, H); g.font = '900 20px Arial'; g.textAlign = 'center'; g.fillText('POLITIE', 0, 50); g.fillText('POLITIE', W, 50);
        g.fillStyle = '#111'; g.fillRect(0, H - 14, W, 10);
      }
      g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 4; g.beginPath(); g.moveTo(108, 0); g.quadraticCurveTo(128, 18, 148, 0); g.stroke();
    } else {
      g.fillStyle = '#ec7d2c'; g.fillRect(0, 0, W, H);
      g.fillStyle = '#c45e1a'; g.fillRect(104, 0, 6, H); g.fillRect(146, 0, 6, H);
      g.fillStyle = '#ffd36b'; g.beginPath(); g.roundRect(114, 40, 28, 22, 4); g.fill();
      g.fillStyle = '#7a3a0a'; g.font = '900 16px Arial'; g.textAlign = 'center'; g.fillText('N', 128, 57);
    }
  });
}
const HEADS = {
  jr: { skin: 0xe4ab88, hair: '#1d1510', brow: '#20150f', hairLine: 92, sideLine: 120, backLine: 150, curls: true, glasses: true, stubble: true, mouth: 'smile' },
  sr: { skin: 0xdc9c82, hair: '#eceae4', brow: '#c8c4bc', browW: 5, hairLine: 84, sideLine: 116, backLine: 150, squint: true, mouth: 'laugh' },
  ru: { skin: 0xf0c4a2, hair: '#a0602e', brow: '#8a4a22', hairLine: 88, sideLine: 118, backLine: 150, glasses: true, beard: '#a85a28', mouth: 'smile', iris: '#5a7a8a' },
  nak: { skin: 0xe8b890, hair: '#e8792a', brow: '#5a3a1a', hairLine: 80, sideLine: 100, backLine: 110, mouth: 'laugh', iris: '#2a4a8a' },
};
function makePerson(o) {
  // Neon Vice-style model (js/characters.js): a named look, or one derived from these options. ps2: false keeps the old capsule figure
  if (o.ps2 !== false) return makePS2Person(o.ps2 || lookFromPerson(o, HEADS), { scale: o.scale, scene, lazy: !o.ps2 }); // extras finish in the background
  const s = o.scale || 1, belly = o.belly || 0;
  const root = new THREE.Group();
  const body = new THREE.Group(); body.scale.setScalar(s); root.add(body);
  const std = (c, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
  const skin = std(o.skin, 0.6);
  const topM = o.front === 'ru' ? new THREE.MeshStandardMaterial({ map: shirtTex('ru'), roughness: 0.8 }) : o.front && o.front[0] === '#' ? std(parseInt(o.front.slice(1, 7), 16), 0.85) : std(o.shirt, 0.85), legsM = std(o.pants, 0.85), shoeM = std(o.shoes, 0.4);
  const add = (geo, m, x, y, z, parent = body) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; me.receiveShadow = true; parent.add(me); return me; };
  // legs
  const legs = [];
  for (const sx of [-0.11, 0.11]) {
    const leg = new THREE.Group(); leg.position.set(sx, 0.9, 0); body.add(leg);
    add(new THREE.CapsuleGeometry(0.095, 0.6, 4, 10), legsM, 0, -0.4, 0, leg);
    const shoe = add(new THREE.CapsuleGeometry(0.075, 0.16, 4, 10), shoeM, 0, -0.84, 0.05, leg); shoe.rotation.x = Math.PI / 2; shoe.scale.set(1.1, 1, 0.7);
    legs.push(leg);
  }
  // hips + torso (textured cylinder, front at u = 0.5)
  add(new THREE.CylinderGeometry(0.23 + belly * 0.03, 0.21, 0.24, 18), legsM, 0, 0.98, 0).scale.z = 0.78;
  if (o.belt) add(new THREE.CylinderGeometry(0.235 + belly * 0.035, 0.235 + belly * 0.035, 0.06, 18), std(o.belt, 0.4), 0, 1.09, 0).scale.z = 0.8;
  const tm = new THREE.MeshStandardMaterial({ map: shirtTex(o.front), roughness: 0.85 });
  const torso = add(new THREE.CylinderGeometry(0.27, 0.235 + belly * 0.04, 0.56, 20, 1, false, Math.PI, Math.PI * 2), tm, 0, 1.38, 0);
  torso.scale.z = 0.72;
  const capM = (o.front === 'jr' || o.front === 'ru') ? new THREE.MeshStandardMaterial({ map: collarTex(o.front), roughness: 0.85 }) : topM;
  add(new THREE.SphereGeometry(0.27, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), capM, 0, 1.655, 0).scale.set(1, 0.24, 0.72);
  if (belly > 0) { const b = add(new THREE.SphereGeometry(0.24, 16, 12), topM, 0, 1.18, 0.07 + belly * 0.03); b.scale.set(1.0, 0.85, 0.72 + belly * 0.25); }
  if (o.chest) for (const sx of [-1, 1]) { const c = add(new THREE.SphereGeometry(0.1, 14, 10), topM, sx * 0.095, 1.42, 0.13); c.scale.set(1, 0.92, 0.85 * o.chest); }
  if (o.skirt) { const sk = add(new THREE.CylinderGeometry(0.235, 0.34, 0.46, 18), std(o.skirt, 0.8), 0, 0.82, 0); sk.scale.z = 0.85; }
  add(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 12), skin, 0, 1.72, 0);
  // head: smooth ellipsoid with a painted face, nose, curls
  const head = new THREE.Group(); head.position.y = 1.74; head.scale.setScalar(1.28); body.add(head);
  const hc = o.head || HEADS[o.headKind];
  const hm = new THREE.MeshStandardMaterial({ map: paintHead(hc), roughness: 0.6 });
  const hd = add(new THREE.SphereGeometry(0.15, 28, 20), hm, 0, 0.15, 0, head); hd.scale.set(0.92, 1.12, 1.0);
  add(new THREE.SphereGeometry(0.028, 10, 8), skin, 0, 0.13, 0.145, head).scale.set(0.8, 1.1, 1);
  if (o.headKind === 'jr' || o.headKind === 'sr') {
    const hairM = std(o.headKind === 'jr' ? 0x1d1510 : 0xeceae4, 0.9);
    const n = o.headKind === 'jr' ? 46 : 26;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, el = Math.random() * 0.9;
      const r = o.headKind === 'jr' ? 0.05 + Math.random() * 0.02 : 0.045;
      const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el));
      if (p.z > 0.55 && p.y < 0.55) continue; // keep the face clear
      if (o.headKind === 'sr' && p.y > 0.75) continue;
      add(new THREE.SphereGeometry(r, 8, 6), hairM, p.x * 0.145, 0.2 + p.y * 0.14, p.z * 0.15 - 0.01, head);
    }
  } else if (o.headKind === 'ru') {
    const hairM = std(0xa0602e, 0.85), beardM = std(0xa85a28, 0.9);
    for (let i = 0; i < 30; i++) { const a = Math.random() * Math.PI * 2, el = 0.25 + Math.random() * 0.75; const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); if (p.z > 0.5 && p.y < 0.5) continue; add(new THREE.SphereGeometry(0.05, 8, 6), hairM, p.x * 0.14, 0.2 + p.y * 0.13, p.z * 0.14 - 0.01, head); }
    for (let i = 0; i < 26; i++) { const a = -0.15 * Math.PI + Math.random() * 1.3 * Math.PI; const yy = -0.06 + Math.random() * 0.1; add(new THREE.SphereGeometry(0.038, 8, 6), beardM, Math.cos(a) * 0.115, 0.08 + yy, Math.sin(a) * 0.105 + 0.045, head); }
  } else if (o.head) { // passer-by: volume hair, optional long hair / bun
    if (o.feltHat) { // Nabil's green felt hat: wide brim, rope band, a feather
      const fm = std(o.feltHat, 0.95);
      add(new THREE.CylinderGeometry(0.215, 0.205, 0.022, 22), fm, 0, 0.255, 0.005, head).rotation.x = -0.12;
      const cr = add(new THREE.CylinderGeometry(0.125, 0.152, 0.12, 20), fm, 0, 0.325, -0.005, head); cr.scale.z = 1.08;
      add(new THREE.SphereGeometry(0.126, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), fm, 0, 0.383, -0.005, head).scale.set(1, 0.35, 1.08);
      const band = add(new THREE.TorusGeometry(0.147, 0.013, 6, 24), std(0x2f6a3a, 0.9), 0, 0.282, -0.005, head); band.rotation.x = Math.PI / 2;
      const fe = add(new THREE.SphereGeometry(0.05, 10, 6), std(0xb8a898, 1), 0.11, 0.38, -0.05, head); fe.scale.set(0.35, 1.9, 0.6); fe.rotation.set(-0.5, 0, -0.55);
    }
    if (o.cigarette) { // cigarette in the corner of the mouth, with a glowing tip
      const cg = new THREE.Group(); cg.position.set(0.03, 0.085, 0.15); cg.rotation.set(1.15, 0.25, 0); head.add(cg);
      add(new THREE.CylinderGeometry(0.008, 0.008, 0.075, 8), std(0xf4f0e8, 0.8), 0, 0.035, 0, cg);
      add(new THREE.CylinderGeometry(0.0085, 0.0085, 0.012, 8), new THREE.MeshBasicMaterial({ color: 0xff6a20 }), 0, 0.077, 0, cg);
    }
    if (o.ballcap) { // baseball cap
      const dome = add(new THREE.SphereGeometry(0.158, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(o.ballcap, 0.7), 0, 0.24, -0.005, head); dome.scale.set(1, 0.75, 1.05);
      const vis = add(new THREE.CylinderGeometry(0.13, 0.13, 0.015, 16, 1, false, -Math.PI / 2, Math.PI), std(o.ballcap, 0.6), 0, 0.245, 0.09, head); vis.scale.z = 1.25;
    }
    if (o.head.beard3d) { const bm = std(parseInt(o.head.beard3d.slice(1), 16), 0.9); for (let i = 0; i < 24; i++) { const a = -0.15 * Math.PI + Math.random() * 1.3 * Math.PI; add(new THREE.SphereGeometry(0.036, 8, 6), bm, Math.cos(a) * 0.112, 0.06 + Math.random() * 0.09, Math.sin(a) * 0.1 + 0.045, head); } }
    if (o.mandarin) { // silk jacket details: gold mandarin collar and three frog buttons down the chest
      const gm = std(o.mandarin, 0.3); const col = add(new THREE.CylinderGeometry(0.09, 0.1, 0.07, 18, 1, true), gm, 0, 1.69, 0); col.scale.z = 0.85;
      for (let k = 0; k < 3; k++) { add(new THREE.BoxGeometry(0.11, 0.022, 0.02), gm, 0, 1.56 - k * 0.11, 0.2); add(new THREE.SphereGeometry(0.016, 8, 6), gm, 0, 1.56 - k * 0.11, 0.212); }
    }
    if (o.chain) { const ch = add(new THREE.TorusGeometry(0.1, 0.012, 6, 18), std(0xe8c040, 0.2), 0, 1.66, 0.05); ch.rotation.x = Math.PI / 2 - 0.35; ch.scale.y = 1.2; }
    if (o.police || o.capColor) { // peaked cap: police navy, or the ticket inspectors' colour
      const cc = o.capColor || 0x1a2440;
      const cap = add(new THREE.CylinderGeometry(0.165, 0.15, 0.1, 18), std(cc, 0.6), 0, 0.31, -0.01, head); cap.scale.z = 1.05;
      add(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 18), std(cc, 0.6), 0, 0.37, -0.01, head);
      const pk = add(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 14, 1, false, -Math.PI / 2, Math.PI), std(0x111111, 0.3), 0, 0.27, 0.07, head); pk.scale.z = 1.2;
      add(new THREE.BoxGeometry(0.05, 0.05, 0.01), std(0xd8b040, 0.3), 0, 0.33, 0.155, head);
    }
    const hairM = std(parseInt(o.head.hair.slice(1), 16), 0.9);
    if (o.head.slick) { // slicked straight back: one smooth glossy cap instead of tufts
      const sm = new THREE.MeshStandardMaterial({ color: parseInt(o.head.hair.slice(1), 16), roughness: 0.25, metalness: 0.1 });
      const cap = add(new THREE.SphereGeometry(0.152, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), sm, 0, 0.165, -0.03, head); cap.scale.set(0.96, 0.82, 1.04); cap.rotation.x = -0.55; // tilted back: hairline high on the forehead, volume at the back
    }
    if (o.head.ponytail) { const pt = add(new THREE.CapsuleGeometry(0.032, 0.13, 4, 8), hairM, 0, 0.13, -0.17, head); pt.rotation.x = 0.35; add(new THREE.SphereGeometry(0.03, 8, 6), hairM, 0, 0.21, -0.155, head); }
    if (!o.head.bald && !o.head.slick) for (let i = 0; i < 22; i++) { const a = Math.random() * Math.PI * 2, el = 0.3 + Math.random() * 0.7; const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); if (p.z > 0.45 && p.y < 0.6) continue; add(new THREE.SphereGeometry(0.048, 8, 6), hairM, p.x * 0.14, 0.2 + p.y * 0.13, p.z * 0.14 - 0.01, head); }
    if (o.head.long) { const l = add(new THREE.CapsuleGeometry(0.11, 0.2, 4, 10), hairM, 0, 0.08, -0.08, head); l.scale.set(1.25, 1, 0.7); }
    if (o.head.bun) add(new THREE.SphereGeometry(0.07, 10, 8), hairM, 0, 0.36, -0.07, head);
  } else if (o.headKind === 'nak') {
    const cap = add(new THREE.SphereGeometry(0.16, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), std(0xf2c31a, 0.5), 0, 0.24, 0, head); cap.scale.set(1, 0.7, 1.05);
    add(new THREE.CylinderGeometry(0.11, 0.11, 0.02, 16, 1, false, -Math.PI / 2, Math.PI), std(0xf2c31a, 0.5), 0, 0.24, 0.1, head).scale.z = 1.4;
  }
  // arms
  const arms = [];
  for (const sx of [-1, 1]) {
    const arm = new THREE.Group(); arm.position.set(sx * (0.29 + belly * 0.03), 1.6, 0); body.add(arm);
    add(new THREE.CapsuleGeometry(0.075, 0.24, 4, 10), topM, 0, -0.16, 0, arm);
    add(new THREE.CapsuleGeometry(0.065, 0.22, 4, 10), o.rolled ? skin : topM, 0, -0.46, 0.02, arm);
    add(new THREE.SphereGeometry(0.06, 10, 8), skin, 0, -0.66, 0.03, arm).scale.set(0.8, 1.1, 0.7);
    arm.rotation.z = sx * 0.07;
    arms.push(arm);
  }
  root.userData = { legs, arms, head, body, phase: 0 };
  scene.add(root);
  return root;
}
function animate(p, speed, dt) {
  const u = p.userData;
  if (u.ps2) { ps2Animate(p, speed, dt); return; }
  if (speed > 0.05) {
    u.phase += dt * (5 + speed * 1.2);
    const sw = Math.sin(u.phase) * Math.min(0.7, 0.25 + speed * 0.12);
    u.legs[0].rotation.x = sw; u.legs[1].rotation.x = -sw;
    u.arms[0].rotation.x = -sw * 0.8; u.arms[1].rotation.x = sw * 0.8;
    u.body.position.y = Math.abs(Math.cos(u.phase)) * 0.04;
  } else {
    u.phase += dt * 1.5;
    for (const l of u.legs) l.rotation.x *= 0.8;
    for (const a of u.arms) a.rotation.x *= 0.8;
    u.body.position.y = Math.sin(u.phase) * 0.008;
  }
}

const player = makePerson({ ps2: LOOKS.eddyJr, headKind: 'jr', shirt: 0x86acdf, front: 'jr', pants: 0xe9e4d8, belt: 0x5a3018, shoes: 0x6a3a1c, belly: 1, skin: 0xe4ab88 });
const START_POS = new THREE.Vector3(-4.4, 0, -16.3); // a new game starts inside the warehouse (Eddy's place), next to the old PC
player.position.copy(START_POS); player.rotation.y = 0.5;
const dad = makePerson({ ps2: LOOKS.eddySr, headKind: 'sr', shirt: 0x232a40, front: 'sr', pants: 0x4a4a52, shoes: 0x2a2018, belly: 0.6, skin: 0xdc9c82, scale: 0.96 });
const DAD_IN = new THREE.Vector3(-2.5, 0, -12.9), DAD_OUT = new THREE.Vector3(-1.6, 0, -6.0); // waits inside, then stands out front
dad.position.copy(DAD_IN); dad.rotation.y = -2.6;
const dadSolid = solid(DAD_IN.x - 0.35, DAD_IN.x + 0.35, DAD_IN.z - 0.35, DAD_IN.z + 0.35);
function placeDadSolid(p) { Object.assign(dadSolid, { minx: p.x - 0.35, maxx: p.x + 0.35, minz: p.z - 0.35, maxz: p.z + 0.35 }); }
function dadOutside() { dad.position.copy(DAD_OUT); dad.rotation.y = -Math.PI * 0.75; placeDadSolid(DAD_OUT); dadSolid.off = false; dad.userData.walkTo = null; }
// The Russian (same look and vibe as Nine of Nine in Neon Vice), behind the counter of his pawnshop like a Stalker trader
const RU = { x: (PS.x0 + PS.x1) / 2, z: -12.3 };
const russian = makePerson({ ps2: LOOKS.russian, headKind: 'ru', shirt: 0x121216, front: 'ru', pants: 0x2a2c3a, shoes: 0x1e1814, belly: 0.9, skin: 0xf0c4a2, scale: 1.02 });
russian.position.set(RU.x, 0, RU.z); russian.rotation.y = 0;
const shop = new THREE.Group(); scene.add(shop);
const shopRoof = new THREE.Group(); shop.add(shopRoof);
const shopFrontHigh = new THREE.Group(); shop.add(shopFrontHigh);
const shopLights = [];
let shopDoorOpen = 0, shopDoorTarget = 0, shopDoor, shopDoorSolid;
{
  const W0 = PS.x0, W1 = PS.x1, Z0 = PS.z0, Z1 = PS.z1, H = PS.h, cx = (W0 + W1) / 2, cz = (Z0 + Z1) / 2;
  const outer = clapMat(0x7a4ab0), inner = pbr('plaster2.jpg', 2, 1, 0x6a6458, 0.95, 0.5), dark = lam({ color: 0x1a1a1e });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W1 - W0, Z1 - Z0), pbr('concrete_floor.jpg', 2, 2, 0x8a8478, 0.85, 0.5));
  fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.03, cz); fl.receiveShadow = true; shop.add(fl);
  // walls: brick outside, grubby plaster inside
  box(W1 - W0, H, 0.3, inner, cx, H / 2, Z0, shop); solid(W0, W1, Z0 - 0.2, Z0 + 0.15);
  for (const x of [W0, W1]) { box(0.3, H, Z1 - Z0, inner, x, H / 2, cz, shop); solid(x - 0.15, x + 0.15, Z0, Z1); }
  const front = (x0, x1) => {
    box(x1 - x0, H - 0.7, 0.3, outer, (x0 + x1) / 2, 0.7 + (H - 0.7) / 2, Z1, shopFrontHigh);
    box(x1 - x0, 0.7, 0.3, outer, (x0 + x1) / 2, 0.35, Z1, shop); solid(x0, x1, Z1 - 0.15, Z1 + 0.15);
  };
  front(W0, PS.doorX0); front(PS.doorX1, W1);
  box(PS.doorX1 - PS.doorX0, H - 2.4, 0.3, outer, (PS.doorX0 + PS.doorX1) / 2, 2.4 + (H - 2.4) / 2, Z1, shopFrontHigh);
  // shop window with bars, dark inside
  box(2.6, 1.5, 0.06, winMat, W0 + 1.8, 1.55, Z1 + 0.17, shopFrontHigh, false);
  for (let i = 0; i < 6; i++) box(0.04, 1.5, 0.04, mat.dark, W0 + 0.65 + i * 0.46, 1.55, Z1 + 0.24, shopFrontHigh, false);
  box(2.6, 1.5, 0.06, winMat, W1 - 1.4, 1.55, Z1 + 0.17, shopFrontHigh, false);
  // door (hinged on the left), green paint, brass knob
  const hinge = new THREE.Group(); hinge.position.set(PS.doorX0, 0, Z1 + 0.05); shop.add(hinge);
  box(PS.doorX1 - PS.doorX0, 2.35, 0.08, lam({ color: 0x24402e }), (PS.doorX1 - PS.doorX0) / 2, 1.18, 0, hinge);
  box(0.9, 0.7, 0.09, winMat, (PS.doorX1 - PS.doorX0) / 2, 1.75, 0.01, hinge, false);
  cyl(0.05, 0.05, 0.08, lam({ color: 0xd8b040 }), PS.doorX1 - PS.doorX0 - 0.18, 1.1, 0.07, hinge).rotation.x = Math.PI / 2;
  shopDoor = hinge; shopDoorSolid = solid(PS.doorX0, PS.doorX1, Z1 - 0.15, Z1 + 0.15);
  // façade: neon sign, OPEN sign, door mat, pink glow
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.95), lam({ map: signTex([{ t: 'PANDJESHUIS SPASIBO', size: 40 }], '#140818', '#e8a33d'), emissive: 0x401030 }));
  sg.position.set(cx, 3.3, Z1 + 0.18); shopFrontHigh.add(sg);
  const op = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), lam({ map: signTex([{ t: 'OPEN', size: 70 }], '#000000', '#a9c46a', 256, 100), emissive: 0x206070 }));
  op.position.set(W1 - 1.4, 2.0, Z1 + 0.22); shopFrontHigh.add(op);
  const neon = new THREE.PointLight(0xe8862c, 2.5, 7); neon.position.set(cx, 3.0, Z1 + 1.0); scene.add(neon);
  box(1.3, 0.02, 0.8, lam({ color: 0x3a2a1a }), (PS.doorX0 + PS.doorX1) / 2, 0.03, Z1 + 0.6, scene, false);
  neonRect(shopFrontHigh, W0 + 1.8, 1.55, 2.75, 1.65, Z1 + 0.26, 0xf2c14e); poster(shop, PS.doorX1 + 0.5, 1.5, Z1 + 0.17, 2); graffiti(shop, W1 - 1.6, 0.35, Z1 + 0.17, 0, 1.6);
  bladeSign(shopFrontHigh, W1 - 0.4, 3.0, Z1, 'GUNS', 0xe8862c);
  // flat roof with a parapet and an AC unit (hidden while you're inside)
  box(W1 - W0 + 0.4, 0.3, Z1 - Z0 + 0.4, lam({ map: tex('roof_rust.jpg', 3, 3), color: 0x6a6a6a }), cx, H + 0.15, cz, shopRoof);
  box(1.4, 0.8, 1.0, lam({ color: 0x9aa0a4 }), W0 + 2, H + 0.7, Z0 + 2, shopRoof);
  box(W1 - W0 + 0.4, 0.6, 0.3, outer, cx, H + 0.6, Z1 + 0.1, shopFrontHigh);

  // ---- inside: Stalker-trader bunker. Counter across the room, The Russian behind it, guns on the wall.
  const CZc = -10.9; // counter line
  const wood = mat.wood, metal = lam({ color: 0x4a4e52 }), olive = lam({ color: 0x4a5236 });
  box(W1 - W0 - 2.6, 1.05, 0.8, wood, cx, 0.53, CZc, shop); box(W1 - W0 - 2.4, 0.08, 1.0, lam({ color: 0x3a2618 }), cx, 1.09, CZc, shop);
  box(1.3, 1.05, 0.8, metal, W0 + 0.8, 0.53, CZc, shop); box(1.3, 1.05, 0.8, metal, W1 - 0.8, 0.53, CZc, shop);
  solid(W0, W1, CZc - 0.45, CZc + 0.45);
  // a security grille on the left half of the counter
  for (let i = 0; i < 9; i++) cyl(0.015, 0.015, 1.2, metal, W0 + 1.6 + i * 0.25, 1.7, CZc - 0.05);
  box(2.2, 0.04, 0.04, metal, W0 + 2.6, 2.3, CZc - 0.05, shop);
  // things on the counter: cash register, desk lamp, a pistol on a cloth, ammo boxes, a TV
  box(0.5, 0.3, 0.45, lam({ color: 0x2a2a2e }), cx + 1.6, 1.28, CZc, shop); box(0.44, 0.18, 0.06, lam({ color: 0x80ffa0, emissive: 0x206030 }), cx + 1.6, 1.5, CZc + 0.2, shop, false);
  cyl(0.12, 0.14, 0.04, metal, cx - 1.4, 1.15, CZc - 0.1, shop); cyl(0.02, 0.02, 0.45, metal, cx - 1.4, 1.38, CZc - 0.1, shop);
  const shade_ = cyl(0.04, 0.16, 0.18, lam({ color: 0x2e5a3a }), cx - 1.25, 1.6, CZc - 0.1, shop); shade_.rotation.z = -0.5;
  const lampL = new THREE.PointLight(0xffc070, 0, 6, 1.6); lampL.position.set(cx - 1.1, 1.45, CZc); shop.add(lampL); shopLights.push([lampL, 2.6]);
  box(0.6, 0.02, 0.4, lam({ color: 0x6a1a1a }), cx - 0.3, 1.14, CZc + 0.1, shop, false);
  box(0.3, 0.12, 0.05, mat.black, cx - 0.3, 1.2, CZc + 0.1, shop, false); box(0.07, 0.14, 0.05, mat.black, cx - 0.4, 1.12, CZc + 0.1, shop, false);
  for (let i = 0; i < 3; i++) box(0.22, 0.12, 0.14, lam({ color: [0x8a6a2a, 0x2a4a2a, 0x8a6a2a][i] }), cx + 0.5 + i * 0.26, 1.19 + (i === 1 ? 0.12 : 0), CZc + 0.1, shop);
  box(0.6, 0.5, 0.5, lam({ color: 0x2a2826 }), W1 - 1.0, 1.35, CZc - 0.1, shop);
  const tvS = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.36), lam({ color: 0x5a8a9a, emissive: 0x2a4a5a })); tvS.position.set(W1 - 1.0, 1.37, CZc + 0.16); shop.add(tvS);
  // the gun wall: pegboard, rifles, shotguns, pistols, and the Golden AK under a spotlight
  const peg = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#5a4a36'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,.45)'; for (let y = 6; y < h; y += 12) for (let x = 6; x < w; x += 12) g.fillRect(x, y, 3, 3); });
  const pegM = lam({ map: peg });
  const wallZ = Z0 + 0.2;
  box(W1 - W0 - 1.0, 2.8, 0.06, pegM, cx, 2.0, wallZ, shop, false);
  const gunM = lam({ color: 0x1c1c1e }), woodG = lam({ color: 0x6a3a1a });
  function rifle(x, y, len = 1.3, gold = false) {
    const g = new THREE.Group(); g.position.set(x, y, wallZ + 0.08); shop.add(g);
    const body = gold ? lam({ color: 0xd8a830, emissive: 0x4a3008 }) : gunM;
    box(len * 0.55, 0.09, 0.05, body, 0, 0, 0, g, false);
    box(len * 0.3, 0.05, 0.04, body, len * 0.42, 0.01, 0, g, false);
    box(len * 0.28, 0.12, 0.05, gold ? body : woodG, -len * 0.38, -0.02, 0, g, false);
    box(0.06, 0.22, 0.05, body, len * 0.1, -0.14, 0, g, false).rotation.z = 0.25;
    box(0.07, 0.15, 0.05, gold ? body : woodG, -len * 0.08, -0.1, 0, g, false);
    return g;
  }
  for (let i = 0; i < 3; i++) { rifle(cx - 2.2, 3.0 - i * 0.55); rifle(cx + 2.2, 3.0 - i * 0.55, 1.15); }
  rifle(cx, 2.9, 1.45, true);
  const gold = new THREE.SpotLight(0xffe0a0, 0, 5, 0.35, 0.5); gold.position.set(cx, 4.4, wallZ + 1.2); gold.target.position.set(cx, 2.9, wallZ); shop.add(gold, gold.target); shopLights.push([gold, 14]);
  const goldTag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.22), lam({ map: signTex([{ t: 'NOT FOR SALE', size: 54 }], '#000', '#ffd36b', 256, 64) }));
  goldTag.position.set(cx, 2.55, wallZ + 0.1); shop.add(goldTag);
  for (let i = 0; i < 4; i++) { const p = new THREE.Group(); p.position.set(cx - 0.75 + i * 0.5, 1.95, wallZ + 0.08); shop.add(p); box(0.22, 0.07, 0.04, gunM, 0, 0, 0, p, false); box(0.06, 0.14, 0.04, i === 2 ? woodG : gunM, -0.07, -0.08, 0, p, false); }
  // shelves on the side walls: green army crates, ammo cans, a stuffed dolphin
  for (const sx of [W0 + 0.5, W1 - 0.5]) {
    for (const y of [0.9, 1.8, 2.7]) box(0.7, 0.06, 3.6, wood, sx, y, Z0 + 2.4, shop);
    for (let i = 0; i < 6; i++) box(0.5, 0.32, 0.5, [olive, lam({ color: 0x3a4228 }), metal][i % 3], sx, 1.1 + (i % 3) * 0.9, Z0 + 1.0 + Math.floor(i / 3) * 2.2, shop);
    solid(sx - 0.4, sx + 0.4, Z0, Z0 + 4.3);
  }
  const dol = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.45, 4, 10), lam({ color: 0x7aa0c8 })); dol.rotation.z = Math.PI / 2; dol.position.set(W1 - 0.5, 3.0, Z0 + 2.4); shop.add(dol);
  // customer side: a couple of crates, a chair, a "NO CREDIT" sign
  box(0.7, 0.6, 0.7, olive, W0 + 0.8, 0.3, Z1 - 1.0, shop); box(0.6, 0.5, 0.6, olive, W0 + 0.85, 0.85, Z1 - 1.05, shop); solid(W0 + 0.4, W0 + 1.2, Z1 - 1.4, Z1 - 0.6);
  const nc = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), lam({ map: signTex([{ t: 'NO CREDIT · NO RECEIPTS', size: 30 }], '#e8e2d0', '#8a1010', 512, 128) }));
  nc.position.set(cx, 3.95, wallZ + 0.1); shop.add(nc);
  // light: one bare bulb on a wire + a pink neon strip, only lit while you're inside
  cyl(0.008, 0.008, 1.4, mat.black, cx + 0.8, H - 0.7, Z1 - 2.3, shop);
  const bulbM = lam({ color: 0xffe0a0, emissive: 0x806020 }); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), bulbM); bulb.position.set(cx + 0.8, H - 1.45, Z1 - 2.3); shop.add(bulb);
  const bulbL = new THREE.PointLight(0xffd8a0, 0, 10, 1.4); bulbL.position.copy(bulb.position); shop.add(bulbL); shopLights.push([bulbL, 2.6]);
  box(W1 - W0 - 1.2, 0.05, 0.05, lam({ color: 0xe8862c, emissive: 0xe8862c }), cx, H - 0.25, Z0 + 0.3, shop, false);
  const wallL = new THREE.PointLight(0xffd8a8, 0, 7, 1.4); wallL.position.set(cx, 3.6, Z0 + 1.6); shop.add(wallL); shopLights.push([wallL, 3.2]);
  const pinkL = new THREE.PointLight(0xe8862c, 0, 8, 1.6); pinkL.position.set(cx, H - 0.5, Z0 + 1.0); shop.add(pinkL); shopLights.push([pinkL, 1.4]);
}
const isInShop = (p) => p.x > PS.x0 && p.x < PS.x1 && p.z > PS.z0 && p.z < PS.z1 - 0.1;
function openShopDoor() { shopDoorTarget = 1; shopDoorSolid.off = true; beep(320, 0.12, 'triangle', 0.04); setTimeout(() => beep(1320, 0.25, 'sine', 0.03), 120); }

// ------------------------------------------------------------------ junk, desk, PC, mixing table
const junkDefs = [
  { id: 'doner', name: 'Döner Grill Turbo 3000', price: 650, x: -9.4, z: -9.6 },
  { id: 'fryer', name: 'Deep fryer "De Vetput"', price: 320, x: -5.6, z: -10.6 },
  { id: 'griddle', name: 'Griddle (rusty edges)', price: 280, x: -1.2, z: -9.8 },
  { id: 'fridge', name: 'Shoarma display fridge (leaks a bit)', price: 540, x: -0.9, z: -14.2 },
  { id: 'buckets', name: '14 buckets of garlic sauce (empty?)', price: 90, x: -9.6, z: -14.0 },
  { id: 'oven', name: 'Pita oven "Vulkaan"', price: 470, x: -5.0, z: -15.0 },
];
function buildJunk(d) {
  const g = new THREE.Group(); g.position.set(d.x, 0, d.z); scene.add(g);
  if (d.id === 'doner') {
    box(0.9, 0.12, 0.9, mat.steel, 0, 0.06, 0, g); box(0.9, 1.9, 0.12, mat.steel, 0, 1.0, -0.4, g);
    cyl(0.03, 0.03, 1.9, mat.steel, 0, 1.0, 0, g, 6);
    cyl(0.2, 0.3, 1.1, lam({ color: 0x8a4a22, flatShading: true }), 0, 1.0, 0, g, 9);
    box(0.7, 1.2, 0.05, lam({ color: 0xff5a22, emissive: 0x401000 }), 0, 1.0, -0.33, g, false);
  } else if (d.id === 'fryer') {
    box(1.0, 0.95, 0.75, mat.steel, 0, 0.48, 0, g);
    box(0.85, 0.02, 0.6, lam({ color: 0x8a6a1a }), 0, 0.97, 0, g, false);
    for (const x of [-0.22, 0.22]) { box(0.36, 0.25, 0.5, lam({ color: 0x777777, wireframe: true }), x, 1.1, 0, g, false); box(0.05, 0.05, 0.4, mat.black, x, 1.2, 0.45, g, false); }
  } else if (d.id === 'griddle') {
    box(1.4, 0.85, 0.8, mat.steel, 0, 0.43, 0, g); box(1.35, 0.06, 0.75, lam({ color: 0x2a2624 }), 0, 0.89, 0, g);
    box(0.2, 0.25, 0.25, lam({ color: 0x8a3a1a }), 0.5, 0.9, 0.1, g);
  } else if (d.id === 'fridge') {
    box(1.6, 0.8, 0.8, mat.steel, 0, 0.4, 0, g);
    const gl = box(1.55, 0.6, 0.75, new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.35, shininess: 100 }), 0, 1.1, 0, g, false);
    for (let i = 0; i < 3; i++) box(0.35, 0.12, 0.3, lam({ color: [0xd06040, 0x80a040, 0xe0d0a0][i] }), -0.45 + i * 0.45, 0.9, 0, g);
  } else if (d.id === 'buckets') {
    for (let i = 0; i < 6; i++) { const c = cyl(0.22, 0.19, 0.42, lam({ color: 0xf2f2ee }), (i % 3) * 0.48 - 0.48, 0.21 + Math.floor(i / 3) * 0.42, (i % 2) * 0.12, g, 10); }
    for (let i = 0; i < 3; i++) box(0.3, 0.08, 0.02, lam({ color: [0xd03020, 0x30a040, 0xe0c020][i] }), (i % 3) * 0.48 - 0.48, 0.25, 0.22, g, false);
  } else if (d.id === 'oven') {
    box(1.2, 1.1, 1.0, mat.steel, 0, 0.55, 0, g); box(0.8, 0.35, 0.05, lam({ color: 0x1a1a1a, emissive: 0x401000 }), 0, 0.65, 0.51, g, false);
    cyl(0.12, 0.12, 0.8, mat.steel, 0.35, 1.5, -0.3, g, 8);
  }
  const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), lam({ map: signTex([{ t: 'FOR SALE', size: 54 }], '#ffd36b', '#7a1a14', 256, 128), side: THREE.DoubleSide }));
  tag.position.set(0, 2.2, 0.2); tag.visible = false; g.add(tag);
  d.group = g; d.tag = tag; d.solid = solid(d.x - 0.8, d.x + 0.8, d.z - 0.55, d.z + 0.55);
  return g;
}
junkDefs.forEach(buildJunk);
// desk with the Kaasdows 95 PC
const desk = new THREE.Group(); desk.position.set(-8.8, 0, -17.6); scene.add(desk);
box(2.4, 0.08, 1.0, mat.wood, 0, 0.78, 0, desk); for (const [x, z] of [[-1.1, -0.42], [1.1, -0.42], [-1.1, 0.42], [1.1, 0.42]]) box(0.07, 0.78, 0.07, mat.wood, x, 0.39, z, desk);
const beige = lam({ color: 0xd8d0b8 });
box(0.62, 0.52, 0.55, beige, 0, 1.12, -0.12, desk); box(0.45, 0.12, 0.3, beige, 0, 0.86, -0.12, desk);
const screenTex = canvasTex(128, 96, (g) => { g.fillStyle = '#0b7b7b'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#c0c0c0'; g.fillRect(0, 84, 128, 12); g.fillStyle = '#fff'; g.font = 'bold 12px Arial'; g.fillText('Kaasdows 95', 22, 46); for (let i = 0; i < 3; i++) { g.fillStyle = '#c0c0c0'; g.fillRect(8, 8 + i * 22, 14, 12); } });
const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.38), lam({ map: screenTex, emissive: 0x0b4040, emissiveMap: screenTex }));
screen.position.set(0, 1.14, 0.16); desk.add(screen);
box(0.6, 0.04, 0.22, beige, 0, 0.84, 0.3, desk);
box(0.6, 0.08, 0.6, lam({ color: 0x333338 }), 0, 0.5, 1.0, desk); box(0.6, 0.7, 0.08, lam({ color: 0x333338 }), 0, 0.9, 1.3, desk);
const pcGlow = new THREE.PointLight(0x5ad0d0, 0.8, 4); pcGlow.position.set(0, 1.3, 0.8); desk.add(pcGlow);
solid(-10.05, -7.55, -18.15, -17.05);
// mixing table (appears after buying)
const mixTable = new THREE.Group(); mixTable.position.set(-4.6, 0, -12.6); mixTable.visible = false; scene.add(mixTable);
box(2.6, 0.08, 1.3, mat.steel, 0, 0.92, 0, mixTable); for (const [x, z] of [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55]]) box(0.07, 0.92, 0.07, mat.steel, x, 0.46, z, mixTable);
cyl(0.45, 0.3, 0.35, mat.steel, 0, 1.13, 0, mixTable, 14);
const spiceInBowl = cyl(0.42, 0.42, 0.04, lam({ color: 0xc8641e }), 0, 1.28, 0, mixTable, 14);
for (const [x, c] of [[-0.95, 0xd03a1a], [0.95, 0xe2b21a], [-0.6, 0x7a4a1e]]) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.3, 8), lam({ color: c })); p.position.set(x, 1.1, x < -0.8 ? 0.3 : -0.3); mixTable.add(p); }
for (let i = 0; i < 4; i++) box(0.5, 0.7, 0.4, lam({ color: 0xc8b48a }), -3.2 + (i % 2) * 0.55, 0.35 + Math.floor(i / 2) * 0.7, -0.3, mixTable);
let mixSolid = null;

// ------------------------------------------------------------------ UI
const $ = (id) => document.getElementById(id);
const ui = { money: $('money'), income: $('income'), obj: $('objective'), prompt: $('prompt'), toast: $('toast') };
const state = { step: 'title', money: 0, shown: 0, listed: new Set(), sold: new Set(), table: false, naknik: 0, income: 0, mapSeen: false, inDialogue: false, inPC: false, kit: [], metRussian: false,
  raids: 0, loan: { amount: 1000, out: false, at: 0 }, metNabil: false, metSchmatzel: false, armed: false };
function setObjective(t) { ui.obj.innerHTML = t; }
let toastT = 0;
function toast(big, small = '', t = 2.6) { ui.toast.innerHTML = big + (small ? `<small>${small}</small>` : ''); ui.toast.style.display = 'block'; toastT = t; }
function addMoney(n, fromEl) {
  state.money += n; beep(880, 0.08); setTimeout(() => beep(1320, 0.1), 90);
  const f = document.createElement('div'); f.className = 'fly'; f.textContent = (n >= 0 ? '+W ' : '-W ') + Math.abs(n);
  const r = fromEl ? fromEl.getBoundingClientRect() : { left: innerWidth - 220, top: 70 };
  f.style.left = r.left + 'px'; f.style.top = r.top + 'px'; document.body.appendChild(f);
  requestAnimationFrame(() => { f.style.transform = 'translateY(-60px)'; f.style.opacity = '0'; });
  setTimeout(() => f.remove(), 1300);
  if (state.inPC) renderPC();
}
let actx = null;
function beep(freq, dur, type = 'square', vol = 0.05) {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.value = freq; g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
    o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
  } catch (e) { /* audio is optional */ }
}

// dialogue
const faces = { 'Eddy Sr.': './assets/face_sr.jpg', 'Eddy Jr.': './assets/face_jr.jpg', 'The Russian': './assets/face_ru.jpg', 'Naknik': null, 'Nabil': './assets/face_nabil.jpg', 'Schmatzel': null };
let dlgQueue = [], dlgDone = null;
function dialogue(lines, done) { dlgQueue = lines.slice(); dlgDone = done; state.inDialogue = true; nextLine(); }
function nextLine() {
  if (!dlgQueue.length) { $('dialogue').style.display = 'none'; state.inDialogue = false; const d = dlgDone; dlgDone = null; if (d) d(); return; }
  const [who, line] = dlgQueue.shift();
  $('dlgwho').textContent = who; $('dlgline').textContent = line;
  const f = faces[who];
  $('dlgface').style.display = f ? 'block' : 'none'; if (f) $('dlgface').src = f;
  $('dialogue').style.display = 'block'; beep(520, 0.04, 'triangle');
}
$('dialogue').addEventListener('click', nextLine);

// ------------------------------------------------------------------ Kaasdows 95
const BUYERS = ['Snackbar Bij Henk', 'Mo van de markt', 'Grillroom Zuid', 'Tante Gerda', 'Frituur Het Gouden Frietje', 'Restaurant De Lepel', 'Anonymous (Lampas?)', 'Kees from Spekbuurt'];
const bids = {};
function bidFor(d) { if (!bids[d.id]) bids[d.id] = { who: BUYERS[Math.floor(Math.random() * BUYERS.length)], amount: Math.round(d.price * (0.9 + Math.random() * 0.25) / 5) * 5 }; return bids[d.id]; }
const TABLE_COST = 600, NAKNIK_COST = 450, NAKNIK_INCOME = 30;
let pcTab = 'sell', pcMode = 'pc';
const LOOT_PRICE = 150;
const icons = [['sell', 'K', 'Kaasplaats'], ['hire', 'N', 'Naknik Uitzendbureau'], ['shop', 'M', 'Buy mixing table'], ['beurs', '%', 'Kruidenbeurs'], ['meng', 'B', 'Mengkamer'], ['rapport', 'D', 'Dagrapport'], ['jobs', 'J', 'Klusbord'], ['ideas', 'I', 'Ideeënboek'], ['map', '⌖', 'Map of Kaasland'], ['bank', 'W', 'My Wilders']];
// the spice economy (js/economy.js): market days, the Kruidenbeurs and warehouse stock. Owned territories make the home market cheaper.
let npcs = null; // js/npcs.js, set up once the street and the mission engine exist
const econ = createEconomy({ state, addMoney, toast, daily: () => { const d = dailyChallenge(); return d && { date: d.date, name: JOINTS.find(([, id]) => id === d.id)[0], mod: mission.REMIX_MODS[d.remix.mod].name, best: state.daily && state.daily.date === d.date ? state.daily.best : 0 }; }, save: () => writeSave(), joints: () => ['schmatzel', ...JOINTS.filter(([, id]) => owns(id)).map(([, id]) => id)], discount: () => d1Owned() * 0.03 + (state.district1 ? 0.06 : 0) });
function openPC(tab = 'sell', mode = 'pc') {
  pcTab = tab; pcMode = mode; state.inPC = true; $('pc').style.display = 'block'; beep(330, 0.15, 'sine', 0.06); renderPC();
}
function closePC() { state.inPC = false; $('pc').style.display = 'none'; afterPC(); }
$('pcclose').onclick = closePC;
function renderPC() {
  const ic = $('pcicons'); ic.innerHTML = '';
  if (pcMode === 'pc') for (const [id, g, label] of icons.filter(([id]) => !['beurs', 'meng', 'rapport', 'jobs', 'ideas'].includes(id) || state.table)) {
    const d = document.createElement('div'); d.className = 'icon' + (pcTab === id ? ' sel' : '');
    d.innerHTML = `<div class="g">${g}</div><span>${label}</span>`; d.onclick = () => { pcTab = id; beep(700, 0.03); renderPC(); }; ic.appendChild(d);
  }
  const body = $('winbody'); const title = $('wintitle');
  const fmt = (n) => 'W ' + n.toLocaleString('nl-NL');
  if (pcMode === 'van') { title.textContent = 'Oofmobiel · Where to?'; body.innerHTML = mapHTML(true); bindMap(); return; }
  if (pcTab === 'sell') {
    title.textContent = 'Kaasplaats.kl · Second-hand catering gear';
    const rows = junkDefs.filter((d) => state.listed.has(d.id) && !state.sold.has(d.id));
    let h = `<div class="well" style="margin-bottom:10px"><b>Welcome to Kaasplaats!</b> Your listings and the best bids. Balance: <b>${fmt(state.money)}</b></div>`;
    if (!rows.length) h += `<div class="well">${state.sold.size === junkDefs.length ? 'Everything sold! Dad would be proud. (Or jealous.)' : 'No listings yet. Walk around the warehouse and list your old junk (E).'}</div>`;
    else {
      h += '<table class="list"><tr><th>Listing</th><th>Asking</th><th>Best bid</th><th></th></tr>';
      for (const d of rows) { const b = bidFor(d); h += `<tr><td>${d.name}</td><td>${fmt(d.price)}</td><td class="bid">${fmt(b.amount)}<br><small>${b.who}</small></td><td><button class="b95" data-sell="${d.id}">Sell</button></td></tr>`; }
      h += '</table>';
    }
    if (state.loot) h += `<table class="list" style="margin-top:8px"><tr><th>Listing</th><th>Asking</th><th>Best bid</th><th></th></tr><tr><td>Lampas spice, crate (×${state.loot})<br><small>"slightly borrowed"</small></td><td>${fmt(LOOT_PRICE)}</td><td class="bid">${fmt(LOOT_PRICE)}<br><small>Kees from Spekbuurt</small></td><td><button class="b95" id="sellLoot">Sell all</button></td></tr></table>`;
    const unl = junkDefs.length - state.listed.size;
    if (unl > 0 && state.step !== 'talk') h += `<p>${unl} more item(s) in the warehouse aren't listed yet.</p>`;
    if (state.table) h += econ.machinesHTML(); // Dad's old trade: machines for the joints
    body.innerHTML = h; econ.machinesBind(body, renderPC);
    body.querySelectorAll('[data-sell]').forEach((b) => b.onclick = () => sellItem(b.dataset.sell, b));
    const sl = $('sellLoot'); if (sl) sl.onclick = () => { addMoney(state.loot * LOOT_PRICE, sl); toast('SOLD', `${state.loot} crate(s) of Lampas spice. Kees doesn't ask questions.`, 2); state.loot = 0; writeSave(); renderPC(); };
  } else if (pcTab === 'hire') {
    title.textContent = 'Naknik Uitzendbureau · "They get it done. Mostly."';
    body.innerHTML = `<div class="well"><b>Naknikim</b>: hard workers, soft heads. They mix, restock and deliver so you don't have to.<br><br>
      Hire: <b>${fmt(NAKNIK_COST)}</b> one-off · Earns about <b>${fmt(NAKNIK_INCOME)}</b> per 6 seconds of mixing.<br>
      Employed: <b>${state.naknik}</b> ${state.table ? '' : '<br><span style="color:#a00">You need a mixing table first (Buy mixing table).</span>'}</div><br>
      <button class="b95" id="hireBtn" ${state.money < NAKNIK_COST || !state.table || state.naknik >= 3 ? 'disabled' : ''}>Hire a Naknik (${fmt(NAKNIK_COST)})</button>
      ${state.naknik >= 3 ? '<p>No room for more Naknikim in this warehouse. Buy a second warehouse later.</p>' : ''}`;
    $('hireBtn').onclick = hireNaknik;
  } else if (pcTab === 'shop') {
    title.textContent = 'Van Kruidenburg Wholesale · Mixing tables';
    body.innerHTML = `<div class="well"><b>Mixing table "Basis"</b><br>Steel table, mixing bowl, three sacks of starter spices (paprika, curry, cumin). Fine for beginners.<br><br>Price: <b>${fmt(TABLE_COST)}</b></div><br>
      <button class="b95" id="tableBtn" ${state.table || state.money < TABLE_COST ? 'disabled' : ''}>${state.table ? 'Bought' : 'Buy (' + fmt(TABLE_COST) + ')'}</button>`;
    $('tableBtn').onclick = buyTable;
  } else if (pcTab === 'beurs') {
    title.textContent = 'Kruidenbeurs.kl · Spice prices, live-ish';
    body.innerHTML = econ.html(); econ.bind(body, renderPC);
  } else if (pcTab === 'meng') {
    title.textContent = 'Mengkamer · What are the Naknikim mixing?';
    body.innerHTML = econ.mixHTML(); econ.mixBind(body, renderPC);
  } else if (pcTab === 'rapport') {
    title.textContent = 'Dagrapport · Clients, orders and who owes what';
    body.innerHTML = econ.reportHTML(); econ.reportBind(body, renderPC);
  } else if (pcTab === 'jobs') {
    title.textContent = 'Klusbord · Jobs for today';
    body.innerHTML = econ.jobsHTML(); econ.jobsBind(body, renderPC);
  } else if (pcTab === 'ideas') {
    title.textContent = "Ideeënboek · Eddy Jr.'s notebook";
    body.innerHTML = econ.ideasHTML();
  } else if (pcTab === 'map') {
    title.textContent = 'Map of Kaasland';
    body.innerHTML = mapHTML(false); bindMap();
    if (!state.mapSeen) { state.mapSeen = true; setTimeout(onMapSeen, 400); }
  } else if (pcTab === 'bank') {
    title.textContent = 'My Wilders · Kaasbank';
    body.innerHTML = `<div class="well">Balance: <b>${fmt(state.money)}</b><br>Passive income: <b>${fmt(state.income)}</b> per 6 sec<br>Naknikim employed: <b>${state.naknik}</b><br>Market day: <b>${econ.ensure().day}</b> · Spice in stock: <b>${econ.stockTotal()} kg</b><br>Territories: <b>${1 + JOINTS.filter(([, id]) => owns(id)).length}</b> (Kipkruidenkwartier${JOINTS.filter(([, id]) => owns(id)).map(([n]) => ', ' + n).join('')})<br><br><i>"Whoever holds the spice, holds Kaasland." · Eddy Sr.</i></div>${econ.rankHTML()}${state.table ? econ.propertyHTML() : ''}`;
    econ.propertyBind(body, renderPC);
  }
}
// ------------------------------------------------------------------ district 1: Kipkruidenkwartier (Spekbuurt, Kroketkade, Uitjesbuurt)
// Each territory is a mission (js/levels/*.js). Spekbuurt opens the other two; owning all three clears the district.
const D1 = [['Spekbuurt', 'spekbuurt', 1], ['Kroketkade', 'kroketkade', 2], ['Uitjesbuurt', 'uitjesbuurt', 3]];
// Act 1: Oud-Vettenburg, the Lampas heartland. One mission per territory (plan: Frietwijk first, then the rest, Pindasausplein last).
// [name, level id, mission number, unlocked(), drive target]; reached by the top-down Oofmobiel drive (js/drive.js), which starts the mission on arrival.
const LAMPAS = [['Frietwijk', 'frietwijk', 1, () => !!state.district1], ['Sauzenbuurt', 'sauzenbuurt', 2, () => owns('frietwijk'), [0, 6]], ['Knoflooksteeg', 'knoflooksteeg', 3, () => owns('frietwijk'), [2, 7]],
  ['Mayonaisemarkt', 'mayonaisemarkt', 4, () => owns('frietwijk'), [3, 9]], ['Halve Kip Plein', 'halvekipplein', 5, () => ['sauzenbuurt', 'knoflooksteeg', 'mayonaisemarkt'].filter(owns).length >= 2, [3, 6]],
  ['Bitterbalbuurt', 'bitterbalbuurt', 6, () => ['sauzenbuurt', 'knoflooksteeg', 'mayonaisemarkt'].filter(owns).length >= 2, [5, 7]],
  ['Pindasausplein', 'pindasausplein', 7, () => LAMPAS.filter(([, id]) => id !== 'pindasausplein' && owns(id)).length >= 6, [0, 8]]]; // the act finale: Jan van Kaas // 5th: the drive's parking crossing (default: the Frietwijk plaza)
const JOINTS = [...D1, ...LAMPAS]; // every territory with a mission: remix raids, the daily challenge and clients use all of them
const lampasOwned = () => LAMPAS.filter(([, id]) => owns(id)).length;
const ACT1_BONUS = 10000;
function checkAct1() { // Fort Pindasaus has fallen: the Lampas are finished (no more Lampas heat, retakes or raids)
  if (state.act1 || !owns('pindasausplein') || (mission && mission.active)) return false;
  state.act1 = true; addMoney(ACT1_BONUS);
  toast('THE LAMPAS ARE FINISHED', `Oud-Vettenburg is yours. Bonus: W ${ACT1_BONUS.toLocaleString('nl-NL')}. No more Lampas heat. Next: the Noshgey Kariot on Hipsterheuvel.`, 8);
  [523, 659, 784, 1046, 1318, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
const DISTRICT_BONUS = 5000;
const owns = (id) => !!(state.owned && state.owned[id]) || (id === 'spekbuurt' && !!state.spekbuurt);
const d1Owned = () => D1.filter(([, id]) => owns(id)).length;
function checkDistrict() { // all three owned: the district is yours, once
  if (state.district1 || d1Owned() < D1.length || (mission && mission.active)) return false;
  state.district1 = true; addMoney(DISTRICT_BONUS);
  toast('KIPKRUIDENKWARTIER IS YOURS', `All three territories are yours. Bonus: W ${DISTRICT_BONUS.toLocaleString('nl-NL')}. Next: Oud-Vettenburg, Lampas heartland.`, 7);
  [523, 659, 784, 1046, 1318].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'triangle', 0.06), i * 120));
  writeSave(); return true;
}
const PINS = [
  ['Kipkruidenkwartier', 235, 430, 'own'], ['Spekbuurt', 420, 465, 'next'],
  ['Sauzenbuurt', 145, 297, 'a1'], ['Frietwijk', 265, 274, 'a1'], ['Knoflooksteeg', 378, 286, 'a1'], ['Mayonaisemarkt', 475, 232, 'a1'], ['Halve Kip Plein', 475, 330, 'a1'], ['Bitterbalbuurt', 575, 286, 'a1'],
  ['Havermelkhaven', 330, 130, 'a2'], ['Kombucha-kwartier', 502, 147, 'a2'], ['Avocado-akkers', 645, 84, 'a2'],
  ['Komijnkade', 767, 242, 'a3'], ['Smokkelsloot', 620, 427, 'a3'], ['Containerchaos', 739, 476, 'a3'],
  ['Kroketkade', 452, 378, 'next'], ['Uitjesbuurt', 172, 490, 'next'], ['Pindasausplein', 95, 432, 'a1'], ['Quinoaplantage', 772, 82, 'a2'],
  ['Kurkumaloods', 562, 372, 'a3'], ['Nootmuskade', 876, 432, 'a3'], ['Kardemomdok', 626, 500, 'a3'],
  ['Joppiehaven', 190, 116, 'a2'], ['Speltpolder', 982, 58, 'a2'], ["Kaneelsilo's", 895, 258, 'a3'], ['Paprikapakhuis', 706, 284, 'a3'],
  ['De Gouden Molen', 640, 204, 'fin'],
];
let MAPL = null;
fetch('./assets/map_labels.json').then((r) => r.json()).then((j) => { MAPL = j; }).catch(() => {});
function mapHTML(van) {
  const col = { m3: '#e8a33d', later: '#ff8030', locked: '#ff8030', lost: '#e8a33d', m1: '#e8a33d', m2: '#e8a33d', own: '#2e8b2e', next: '#ffd36b', a1: '#ff8030', a2: '#6ed36e', a3: '#3cc8ff', fin: '#ffcc33' };
  const kindOf = (n, r) => { const l = LAMPAS.find((x) => x[0] === n); if (l) return owns(l[1]) ? (econ.isRetaken(l[1]) ? 'lost' : 'own') : l[3]() ? 'm3' : state.district1 ? 'locked' : 'a1'; const d = D1.find((x) => x[0] === n); if (d && owns(d[1]) && econ.isRetaken(d[1])) return 'lost'; if (n === 'Kipkruidenkwartier' || (d && owns(d[1]))) return 'own'; if (d) return d[2] === 1 ? 'm1' : owns('spekbuurt') ? 'm2' : 'next'; if (r === 'lampas' && state.district1) return 'next'; return ({ start: 'next', lampas: 'a1', nosh: 'a2', abd: 'a3', fin: 'fin' })[r]; };
  let h = `<div class="mapwrap"><img src="./assets/kaasland_map.jpg" alt="Map of Kaasland">`;
  if (MAPL) {
    const [W, H] = MAPL.size;
    for (const [n, { box, region }] of Object.entries(MAPL.labels)) {
      const k = kindOf(n, region), cy = (box[1] + box[3]) / 2;
      // dot sits just left of the label plate so it never covers the text; the plate itself is clickable too
      const dot = MAPL.labels[n].dot || [box[0] - 7, cy];
      h += `<div data-pin="${n}" data-k="${k}" style="position:absolute;left:${box[0] / W * 100}%;top:${box[1] / H * 100}%;width:${(box[2] - box[0]) / W * 100}%;height:${(box[3] - box[1]) / H * 100}%;cursor:pointer"></div>`;
      h += `<div class="pin" title="${n}" data-pin="${n}" data-k="${k}" style="left:${dot[0] / W * 100}%;top:${dot[1] / H * 100}%;background:${col[k]};cursor:pointer"></div>`;
    }
  } else {
    for (const [n, x, y, k] of PINS) h += `<div class="pin" title="${n}" data-pin="${n}" data-k="${k}" style="left:${x / 1024 * 100}%;top:${(y - 16) / 572 * 100}%;background:${col[k]};cursor:pointer"></div>`;
  }
  if (state.table) h += `</div><div class="well" style="margin-top:8px">${econ.turfHTML(true)}`;
  h += `</div><div class="well" id="pininfo" style="margin-top:8px">${van ? 'Pick a destination for the Oofmobiel.' : 'Click a territory. Green = yours.'}</div>`;
  return h;
}
// the daily challenge: one seeded raid per real day on one of your joints, the same for every player that day
function dailyChallenge() {
  const ids = JOINTS.filter(([, id]) => owns(id) && !econ.isRetaken(id)).map(([, id]) => id); if (!ids.length) return null;
  const t = new Date(), date = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  let h = 0; for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const all = JOINTS.map(([, id]) => id), id = all[h % all.length];
  const pickId = ids.includes(id) ? id : ids[h % ids.length];
  return { date, id: pickId, remix: { ...mission.remixFor(pickId, `daily-${date}`), daily: date } };
}
// an owned joint: the Lampas move back in every market day, so it can be raided again (a remix: js/mission.js)
function remixInfo(n, id) {
  const rx = mission.remixFor(id, econ.ensure().day), m = mission.REMIX_MODS[rx.mod], b = state.best && state.best[id];
  const job = econ.jobFor(id);
  if (econ.isRetaken(id)) return `<b style="color:#a00">${n}: the Lampas took it back!</b> No orders until you retake it. <b>Tonight: ${m.name}</b> (${m.line}) Winning it back drops Lampas heat by 30.`;
  const dc = dailyChallenge(), st = b && b.stars ? b.stars : {}, stars = ['S', 'melee', 'par', 'clean'].map((k) => (st[k] ? '★' : '☆')).join('');
  return (job ? `<b style="color:#a00">JOB: ${job.title} (+W ${job.reward.toLocaleString('nl-NL')})</b><br>` : '') + (dc && dc.id === id ? `<b style="color:#000080">DAILY CHALLENGE today: ${mission.REMIX_MODS[dc.remix.mod].name}</b>${pcMode === 'van' ? ' <button class="b95" id="goDaily">Play the daily challenge</button>' : ''}<br>` : '') + `Challenges: <b>${stars}</b> (S grade, no guns, under par, no hits)<br>` + `<b>${n}</b>: yours, and a client of Eddy & Zn. But the Lampas sneak back in every night. <b>Tonight's remix: ${m.name}</b> (${m.line})${b ? ` Your best: <b>${b.grade}</b> · W ${b.score.toLocaleString('nl-NL')} · ${b.runs || 1} run(s).` : ''}`;
}
function bindMap() {
  document.querySelectorAll('[data-pin]').forEach((p) => p.onclick = () => {
    const n = p.dataset.pin, k = p.dataset.k, info = $('pininfo'); beep(600, 0.04);
    const d1 = D1.find((x) => x[0] === n), lj = LAMPAS.find((x) => x[0] === n), jt = d1 || lj;
    const drive = (label) => (pcMode !== 'van' ? '<i>Drive there in the Oofmobiel.</i>' : state.kit.includes('maboota') ? `<button class="b95" id="goM">${label}</button>` : '<i>Get a weapon from The Russian first.</i>');
    const lblurb = { Pindasausplein: 'Fort Pindasaus: the Lampas headquarters on a fortified pier. Watchtowers, searchlights, and Jan van Kaas himself.', Bitterbalbuurt: 'Café De Gouden Bitterbal, a brown café next to a white gabled shoarma shop. The Lampas keep their Wilders in the vault below.', Mayonaisemarkt: 'De Witte Klodder on the market square, and behind it the Lampas wholesale depot: a huge open hall full of pallets and spice crates.', 'Halve Kip Plein': 'De Halve Haan, a chicken grill on the corner. Behind it, the office where every Lampas order is booked. Wipe their PCs.', Knoflooksteeg: 'De Knoflookbol, a takeaway hatch in a dark alley. Behind it, three Lampas gambling dens. Go quiet.', Sauzenbuurt: 'Het Dunne Sausje, on the west quay: the Lampas water down the garlic sauce here. Kick over their kettles.', Frietwijk: 'Friettent De Vette Hap: the Lampas’ busiest snack corner. Behind the counter, a kitchen made of glass and a back office full of Wilders.' };
    const blurb = { Kroketkade: 'A Lampas snackbar on the rainy corner of the quay. The kitchen and the garage behind it are full of Lampas.', Uitjesbuurt: 'De Zure Ui, the corner snackbar with a terrace. Underneath: an onion cellar and a Lampas gambling den.' };
    const t = {
      own: jt ? remixInfo(n, jt[1]) + (pcMode === 'van' ? ' <button class="b95" id="goM">Drive · remix raid</button>' : ' <i>Drive there in the Oofmobiel.</i>') : `<b>${n}</b>: your home base. The Eddy & Zn warehouse. ${pcMode === 'van' ? '<button class="b95" id="go">Drive</button>' : ''}`,
      lost: jt ? remixInfo(n, jt[1]) + (pcMode === 'van' ? ' <button class="b95" id="goM">Drive · retake it</button>' : ' <i>Drive there in the Oofmobiel.</i>') : '',
      m1: `<b>Spekbuurt</b>: Lampas turf. Snackpaleis Spekbuurt sells their watered-down spice, and the back of house is full of Lampas. <b>Mission 1.</b> ${pcMode !== 'van' ? '<i>Drive there in the Oofmobiel.</i>' : state.kit.includes('maboota') ? '<button class="b95" id="goM">Drive · start mission</button>' : '<i>Get a weapon from The Russian first.</i>'}`,
      m2: d1 ? `<b>${n}</b>: Lampas turf in Kipkruidenkwartier. ${blurb[n] || ''} <b>Mission ${d1[2]}.</b> ${drive('Drive · start mission')}` : '',
      next: d1 ? `<b>${n}</b>: part of Kipkruidenkwartier, but the shoarma joints here still buy Lampas spice. <i>Take Spekbuurt first.</i>` : state.district1 ? `<b>${n}</b>: Oud-Vettenburg, the Lampas heartland. Next on the list. <i>(Missions in a later build.)</i> ${pcMode === 'van' ? '<button class="b95" id="goD">Drive to Oud-Vettenburg</button>' : '<i>Drive there in the Oofmobiel.</i>'}` : `<b>${n}</b>: part of Kipkruidenkwartier, but the shoarma joints here still buy Lampas spice. <i>(Coming in the next build.)</i>`,
      m3: lj ? `<b>${n}</b>: Oud-Vettenburg, the Lampas heartland. ${lblurb[n] || ''} <b>Act 1 · mission ${lj[2]}.</b> ${pcMode !== 'van' ? '<i>Drive there in the Oofmobiel.</i>' : state.kit.includes('maboota') ? `<button class="b95" id="goL">Drive to ${n} · start mission</button>` : '<i>Get a weapon from The Russian first.</i>'}` : '',
      locked: `<b>${n}</b>: Oud-Vettenburg, the Lampas heartland. ${lblurb[n] || ''} <i>${n === 'Pindasausplein' ? 'Take the other six Oud-Vettenburg territories first.' : ['Halve Kip Plein', 'Bitterbalbuurt'].includes(n) ? 'Take two of Sauzenbuurt, Knoflooksteeg and Mayonaisemarkt first.' : 'Take Frietwijk first.'}</i>`,
      later: `<b>${n}</b>: Oud-Vettenburg, the Lampas heartland. ${lampasOwned() ? 'Next on the list.' : '<i>Take Frietwijk first.</i>'} <i>(This mission comes in a later build.)</i>`,
      a1: `<b>${n}</b>: Lampas territory. Their watered-down spice, your customers. <i>Locked.</i>`,
      a2: `<b>${n}</b>: Noshgey Kariot territory. Organic, artisanal, wildly overpriced. <i>Locked.</i>`,
      a3: `<b>${n}</b>: Abdavissies territory. Nobody asks questions here. <i>Locked.</i>`,
      fin: `<b>${n}</b>: where the secret of De Gouden Mix waits. Someday.`,
    }[k];
    info.innerHTML = t;
    const go = $('go'); if (go) go.onclick = () => { closePC(); toast('HOME', 'You\'re already at the warehouse.'); }; // travelling elsewhere must call clearPlayerSplats()
    const goM = $('goM'); if (goM) goM.onclick = () => { closePC(); const id = jt ? jt[1] : 'spekbuurt'; const rx = owns(id) ? { ...mission.remixFor(id, econ.ensure().day), retake: econ.isRetaken(id) } : null; if (rx && rx.retake) { const km = econ.retakeMod(); if (km) rx.mod = km; } mission.enter(id, rx ? { remix: rx } : {}); };
    const goD = $('goD'); if (goD) goD.onclick = () => { closePC(); startDrive(); };
    const goL = $('goL'); if (goL) goL.onclick = () => { closePC(); startDrive(lj[1]); };
    const goDaily = $('goDaily'); if (goDaily) goDaily.onclick = () => { const dc = dailyChallenge(); if (!dc) return; closePC(); mission.enter(dc.id, { remix: dc.remix }); };
  });
}
function sellItem(id, btn) {
  const d = junkDefs.find((j) => j.id === id); if (!d || state.sold.has(id)) return;
  const b = bidFor(d);
  state.sold.add(id); addMoney(b.amount, btn);
  d.solid.off = true; poof(d.group);
  if (state.sold.size === junkDefs.length) {
    setTimeout(() => { toast('ALL SOLD!', 'The warehouse is empty. Time to start mixing.'); }, 300);
    state.step = 'hire'; updateObjective();
  }
  renderPC(); writeSave();
}
function buyTable() {
  if (state.table || state.money < TABLE_COST) return;
  addMoney(-TABLE_COST, $('tableBtn')); state.table = true; mixTable.visible = true;
  mixSolid = solid(-8.0, -3.2, -13.4, -11.8);
  updateObjective(); renderPC(); writeSave();
}
const naknikim = [];
function hireNaknik() {
  if (!state.table || state.money < NAKNIK_COST || state.naknik >= 3) return;
  addMoney(-NAKNIK_COST, $('hireBtn'));
  spawnNaknik(true);
  toast('NAKNIK HIRED', 'He\'s heading to the mixing table. Passive income is running!');
  updateObjective(); renderPC(); writeSave();
}
function spawnNaknik(walk) {
  state.naknik++; state.income = state.naknik * NAKNIK_INCOME;
  const n = makePerson({ ps2: LOOKS.naknik, headKind: 'nak', shirt: 0xec7d2c, front: 'nak', pants: 0xc45e1a, shoes: 0x3a2a1a, belly: 0.8, skin: 0xe8b890, scale: 0.68, rolled: true });
  n.position.set((WH.doorX0 + WH.doorX1) / 2, 0, -6.2);
  const spots = [[-4.6, -11.3], [-3.1, -12.6], [-6.1, -12.6]];
  n.userData.target = new THREE.Vector3(spots[state.naknik - 1][0], 0, spots[state.naknik - 1][1]);
  n.userData.walking = walk; naknikim.push(n);
  if (!walk) { n.position.copy(n.userData.target); n.rotation.y = Math.atan2(-4.6 - n.position.x, -12.6 - n.position.z); n.userData.phase = Math.random() * 6; }
  addInteract({ obj: n, pos: () => n.position, r: 1.8, label: () => 'Talk to the Naknik', act: () => dialogue([['Naknik', ['I mix! I mix!', 'Boss, what is cumin? I just put lots in.', 'Paprika is red. Red is fast. I mix fast.', 'Can I have a break? No? Okay. I mix.'][Math.floor(Math.random() * 4)]]]) });
}
function poof(g) {
  const t0 = performance.now();
  const step = () => { const k = (performance.now() - t0) / 400; if (k >= 1) { g.visible = false; return; } g.scale.setScalar(1 - k); g.rotation.y += 0.3; requestAnimationFrame(step); };
  step();
}
function afterPC() { updateObjective(); }
function onMapSeen() {
}

// ------------------------------------------------------------------ interactables
const inter = [];
function addInteract(o) { inter.push(o); return o; }
addInteract({ obj: dad, pos: () => dad.position, r: 2.2, enabled: () => dad.visible && !dad.userData.leaving, label: () => 'Talk to Dad', act: talkDad });
addInteract({ obj: russian, pos: () => russian.position, r: 2.9, enabled: () => isInShop(player.position), label: () => 'Talk to The Russian', act: talkRussian });
addInteract({ obj: shopDoor, pos: () => new THREE.Vector3((PS.doorX0 + PS.doorX1) / 2, 0, PS.z1 + 0.4), r: 1.6, enabled: () => shopDoorTarget === 0,
  label: () => ['russian', 'free'].includes(state.step) ? 'Open the door · Pandjeshuis Spasibo' : 'Pandjeshuis Spasibo · locked',
  act: () => { if (['russian', 'free'].includes(state.step)) openShopDoor(); else toast('LOCKED', 'A note on the door: "Back in 5 minutes. Or 5 days." · R.', 2.2); } });
junkDefs.forEach((d) => addInteract({
  obj: d.group, pos: () => d.group.position, r: 1.9,
  enabled: () => state.step !== 'talk' && !state.sold.has(d.id) && d.group.visible,
  label: () => state.listed.has(d.id) ? `${d.name} · listed (sell it on the PC)` : `List for sale: ${d.name}`,
  act: () => {
    if (state.listed.has(d.id)) { toast('ALREADY LISTED', 'Sell it on Kaasplaats on the PC.'); return; }
    state.listed.add(d.id); d.tag.visible = true; beep(980, 0.06, 'triangle');
    toast('LISTED', `${d.name} · asking W ${d.price}`, 1.8);
    if (state.listed.size === junkDefs.length && state.step === 'list') { state.step = 'sell'; }
    updateObjective();
  },
}));
addInteract({ obj: desk, pos: () => new THREE.Vector3(-8.8, 0, -16.6), r: 1.8, enabled: () => state.step !== 'talk', label: () => 'Kaasdows 95 · log in', act: () => openPC(state.step === 'hire' ? (state.table ? 'hire' : 'shop') : state.step === 'map' ? 'map' : 'sell') });
addInteract({ obj: oof, pos: () => oof.position, r: 4.2, label: () => 'Oofmobiel · get in', act: () => openPC('map', 'van'), far: true });

const SHOP = [
  { id: 'makarov', name: 'Makarov PM', desc: '9mm pistol, 8 rounds. Reliable. Like Lada, but works. (Gun slot)', price: 350 },
  { id: 'bat', name: 'Honkbalknuppel', desc: 'Baseball bat. Quiet. Very persuasive.', price: 90 },
  { id: 'ammo', name: '9mm ammo (50)', desc: 'For the Makarov. Bullets are not included, my friend. Never.', price: 40, multi: true },
  { id: 'vest', name: 'Kevlar vest', desc: 'Stops one bullet. Maybe two. Do not test.', price: 500 },
  { id: 'shotgun', name: 'Sawn-off shotgun', desc: 'Two barrels, one opinion. Comes with 12 shells. (Gun slot)', price: 1400 },
  { id: 'shells', name: 'Shotgun shells (12)', desc: 'For the sawn-off. Twelve opinions.', price: 60, multi: true },
  { id: 'goldak', name: 'Golden AK-47', desc: '"For you? Later. When you are big boss."', price: 0, locked: true },
];
const RU_SAY = ['Everything is quality. Everything is cash.', 'No receipts, no questions, no refunds.', 'Your father bought his first knife here. He still owes me for the sharpening.', 'Dolphins are smartest animal. After me.'];
function openShop() { $('shop').style.display = 'block'; state.inPC = true; renderShop(); beep(660, 0.06, 'triangle'); }
function closeShop() {
  $('shop').style.display = 'none'; state.inPC = false;
  if (state.step === 'russian' && state.kit.includes('maboota')) { state.step = 'free'; toast('END OF CHAPTER 0', 'You\'re armed. Next: take Spekbuurt from the Lampas.', 4); }
  updateObjective();
}
function kitText() { if (mission && mission.kitSummary) { $('kit').textContent = mission.kitSummary(); return; } const names = state.kit.filter((k, i, a) => a.indexOf(k) === i).map((k) => k === 'maboota' ? 'Maboota' : SHOP.find((x) => x.id === k).name); $('kit').textContent = names.length ? 'Kit: ' + names.join(', ') : ''; }
function giveMaboota() {
  if (state.kit.includes('maboota')) return;
  state.kit.unshift('maboota'); kitText(); equip(true);
  toast('MABOOTA ACQUIRED', 'Your first weapon. Press 1 to equip / holster, F or click to swing.', 4);
}
$('shopclose').onclick = closeShop;
function renderShop(msg) {
  const L = $('shoplist'); L.innerHTML = '';
  for (const it of SHOP) {
    const owned = !it.multi && (mission && mission.owns && ['makarov', 'shotgun', 'bat', 'vest'].includes(it.id) ? mission.owns(it.id) : state.kit.includes(it.id));
    const d = document.createElement('div'); d.className = 'item';
    d.innerHTML = `<div><div class="nm">${it.name}</div><div class="ds">${it.desc}</div></div><div class="pr">${it.locked ? 'LATER' : 'W ' + it.price}</div>`;
    const b = document.createElement('button'); b.textContent = it.locked ? 'Locked' : owned ? 'Owned' : 'Buy';
    b.disabled = it.locked || owned || state.money < it.price;
    b.onclick = () => buyItem(it, b); d.appendChild(b); L.appendChild(d);
  }
  $('shopsay').textContent = msg || '"' + RU_SAY[Math.floor(Math.random() * RU_SAY.length)] + '" · The Russian';
}
function buyItem(it, btn) {
  if (it.locked || state.money < it.price) return;
  if (!mission.canBuy(it.id)) { renderShop('"Your hands are full and your kluis is full. Make room first, my friend." · The Russian'); return; }
  addMoney(-it.price, btn); state.kit.push(it.id);
  mission.onBuy(it.id); kitText(); writeSave();
  renderShop('"Good choice. ' + (it.id === 'bat' ? 'Classic.' : 'Very good choice.') + '" · The Russian');

}
function talkRussian() {
  if (!['russian', 'free'].includes(state.step)) { dialogue([['The Russian', 'Pandjeshuis is closed for you, my friend. Come back when Eddy sends you.']]); return; }
  if (!state.metRussian) {
    state.metRussian = true;
    dialogue([
      ['The Russian', 'Ahh! Eddy\'s boy! Look at you, same shirt energy as your father. Your father and I, we go back. Before the Lampas. Before dolphins on shirts were cool.'],
      ['Eddy Jr.', 'Pa says you can help me. The Lampas run Spekbuurt.'],
      ['The Russian', 'Lampas boys do not negotiate with spice. They negotiate with this.'],
      ['The Russian', 'But first, a gift. For Eddy\'s boy. This is Maboota. Is not a gun. Is better: never runs out of bullets.'],
      ['Eddy Jr.', '...It\'s a stick.'],
      ['The Russian', 'Is a very persuasive stick. Welcome to Pandjeshuis Spasibo. Everything is quality, everything is cash. Pick, pay, go make your father proud.'],
    ], () => { giveMaboota(); openShop(); });
  } else openShop();
}
function talkDad() {
  if (state.step === 'talk') {
    dialogue([
      ['Eddy Sr.', 'Eddy! Jongen! There you are. Thirty years I ran this warehouse. Every shoarma joint in Kaasland got its spice from Eddy & Zn.'],
      ['Eddy Sr.', 'Then the Lampas came. Cheap, watered-down mixes. Half sawdust, half lies. My customers left me one by one.'],
      ['Eddy Jr.', 'So you\'re just giving up?'],
      ['Eddy Sr.', 'I\'m retiring. Here, the keys. The warehouse is yours. It\'s full of my old shoarma junk. Sell it, it\'s worth a few Wilders.'],
      ['Eddy Sr.', 'And Eddy... somewhere in Kaasland is the recipe for De Gouden Mix. The blend that made me king. Every faction wants it. Don\'t let them find it first.'],
      ['Eddy Jr.', 'De Gouden Mix... Right. First, the junk goes.'],
    ], () => {
      state.step = 'list'; openShutter(); updateObjective();
      dadSolid.off = true; dad.userData.walkTo = [new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, WH.z1 - 1.4), new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, WH.z1 + 1.0), DAD_OUT.clone()];
      toast('KEYS RECEIVED', 'The warehouse is yours');
    });
  } else if (state.step === 'dad2') {
    dialogue([
      ['Eddy Sr.', 'Look at you, jongen. Wilders in your pocket and a Naknik stirring the pot. Your old man is proud.'],
      ['Eddy Sr.', 'But the Lampas won\'t hand over Spekbuurt because you ask nicely. You\'ll need protection.'],
      ['Eddy Sr.', 'Go see an old friend of mine. The Russian. Pawn shop at the east end of the street. Tell him Eddy sent you.'],
      ['Eddy Jr.', 'And you?'],
      ['Eddy Sr.', 'Me? Costa del Kaas. Sun, sea, no spice wars. Don\'t call me unless you find De Gouden Mix.'],
      ['Eddy Jr.', 'Thanks, pa.'],
    ], () => { state.step = 'russian'; dad.userData.leaving = true; updateObjective(); });
  } else {
    const lines = {
      list: 'Walk around the warehouse. Everything you see can go. Except the PC, that still works fine.',
      sell: 'That old PC has Kaasplaats on it. Sell everything there. Don\'t let them rip you off, jongen.',
      hire: 'A mixing table and a few Naknikim. Those boys aren\'t smart, but they mix like nobody else.',
      russian: 'Go on, the pawn shop at the east end. The Russian is expecting you.',
      map: 'Have a look at the map. Kaasland is big, and the Lampas are everywhere.',
      free: state.district1 ? (owns('frietwijk') ? 'Frietwijk! You took a joint in Oud-Vettenburg, jongen. Jan van Kaas will be fuming in his pier.' : 'Kipkruidenkwartier is ours again, jongen. Your old man is proud. Oud-Vettenburg is where the Lampas really live. Start with Frietwijk, the snack corner on the plaza.') : owns('spekbuurt') ? `Spekbuurt is ours. Now ${D1.filter(([, id]) => !owns(id)).map(([n]) => n).join(' and ')}. Then Kipkruidenkwartier is ours again.` : 'Spekbuurt is next. Three joints, all selling Lampas rubbish. Start there.',
    };
    dialogue([['Eddy Sr.', lines[state.step] || 'Get to work, jongen.']]);
  }
}
let shutterOpen = 0, shutterTarget = 0;
function openShutter() { shutterTarget = 1; shutterSolid.off = true; beep(180, 0.5, 'sawtooth', 0.03); }

function updateObjective() {
  const n = state.listed.size, s = state.sold.size, N = junkDefs.length;
  if (state.step === 'list' && n === N) state.step = 'sell';
  const t = {
    title: '',
    talk: 'Talk to <b>Eddy Sr.</b> He\'s waiting for you in the warehouse.',
    list: `List the old shoarma junk for sale: walk up to each machine and press <b>E</b> (${n}/${N}).`,
    sell: `Sell everything on <b>Kaasplaats</b> using the Kaasdows 95 PC at the back (${s}/${N} sold).`,
    hire: !state.table ? `Buy a <b>mixing table</b> on the PC (W ${TABLE_COST}).` : state.naknik === 0 ? `Hire your first <b>Naknik</b> on the PC (W ${NAKNIK_COST}).` : 'Talk to <b>Eddy Sr.</b> one last time.',
    map: 'Check the <b>map of Kaasland</b> on the PC or in the Oofmobiel.',
    dad2: 'Talk to <b>Eddy Sr.</b> one last time.',
    russian: 'Visit <b>The Russian</b>: go inside <b>Pandjeshuis Spasibo</b>, east end of the street.',
    free: state.district1 ? `<b style="color:#6ed36e">Kipkruidenkwartier is yours.</b>${state.loot ? ` Sell your ${state.loot} spice crate(s) on <b>Kaasplaats</b>.` : ''} ${state.act1 ? ' <span style="color:#6ed36e">Oud-Vettenburg is yours: the Lampas are finished.</span> <span style="color:#ffd36b">The Noshgey Kariot on Hipsterheuvel are next (in a later build).</span>' : owns('frietwijk') ? ` <span style="color:#6ed36e">${lampasOwned()}/${LAMPAS.length} of Oud-Vettenburg is yours.</span> <span style="color:#ffd36b">Next: ${LAMPAS.filter(([, id, , ok]) => !owns(id) && ok()).map(([n]) => `<b>${n}</b>`).join(', ') || 'Pindasausplein'}. Drive there in the <b>Oofmobiel</b>.</span>` : ' <span style="color:#ffd36b">Next: <b>Frietwijk</b> in Oud-Vettenburg, Lampas heartland. Drive there in the <b>Oofmobiel</b>.</span>'}` : owns('spekbuurt') ? `<b style="color:#6ed36e">${D1.filter(([, id]) => owns(id)).map(([n]) => n).join(' and ')} ${d1Owned() > 1 ? 'are' : 'is'} yours.</b>${state.loot ? ` Sell your ${state.loot} spice crate(s) on <b>Kaasplaats</b>.` : ''} <span style="color:#ffd36b">Next: take ${D1.filter(([, id]) => !owns(id)).map(([n]) => `<b>${n}</b>`).join(' and ')}.</span> Drive there in the <b>Oofmobiel</b>.` : 'Kitted out. Chapter 0 done. <span style="color:#ffd36b">Next: take Spekbuurt from the Lampas.</span> Get in the <b>Oofmobiel</b> and drive there.',
  }[state.step];
  if (state.step === 'hire' && state.table && state.naknik > 0) state.step = 'dad2';
  setObjective(t || '');
  if (state.step === 'free' && checkDistrict()) updateObjective();
  if (state.step === 'free' && checkAct1()) updateObjective();
}

// ------------------------------------------------------------------ save (localStorage, one versioned key)
// Everything worth keeping lives in `state`; the world (sold junk, shutter, table, Naknikim, Eddy Sr. gone) is rebuilt from it on load.
// Unknown fields in a save (from a newer build) are kept and written back untouched.
const SAVE_KEY = 'spiceMasterEddy.save', SAVE_VER = 1;
const SAVE_FIELDS = ['step', 'money', 'table', 'naknik', 'mapSeen', 'kit', 'metRussian', 'raids', 'loan', 'metNabil', 'metSchmatzel', 'loot', 'spekbuurt', 'spekbuurtLootTaken', 'owned', 'lootTaken', 'district1', 'drives', 'ammo', 'pool', 'loadout', 'stash', 'econ', 'best', 'daily', 'act1', 'npcs'];
let saveExtra = {}, loadingSave = false, titleConfirm = false;
function readSave() { // the home district was renamed from De Natte Worst (2026-11): old saves carry the old name in news and turf text
  try { let raw = localStorage.getItem(SAVE_KEY); if (!raw) return null; raw = raw.replace(/(De |de )?Natte Worst/g, 'Kipkruidenkwartier'); const d = JSON.parse(raw); return d && typeof d === 'object' && d.state && typeof d.state === 'object' ? d : null; }
  catch (e) { return null; }
}
function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage blocked */ } saveExtra = {}; }
function writeSave() {
  if (loadingSave || state.step === 'title' || (mission && mission.active)) return false; // mid-mission progress is saved when the mission ends
  const st = { ...(saveExtra.state || {}) };
  for (const k of SAVE_FIELDS) if (state[k] !== undefined) st[k] = state[k];
  st.listed = [...state.listed]; st.sold = [...state.sold];
  const d = { ...saveExtra, v: SAVE_VER, at: Date.now(), state: st, settings: { ...(saveExtra.settings || {}), music: music.on } };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); saveExtra = d; return true; } catch (e) { return false; }
}
function applySave(d) {
  loadingSave = true; saveExtra = d;
  const s = d.state;
  for (const k of SAVE_FIELDS) if (s[k] !== undefined && k !== 'naknik') state[k] = s[k];
  state.kit = Array.isArray(s.kit) ? s.kit.slice() : []; state.ammo = { ...(s.ammo || {}) }; if (s.pool) state.pool = { ...s.pool };
  state.loan = { amount: 1000, out: false, at: 0, ...(s.loan || {}) };
  state.listed = new Set(s.listed || []); state.sold = new Set(s.sold || []); state.shown = state.money = +s.money || 0;
  for (const j of junkDefs) { if (state.sold.has(j.id)) { j.solid.off = true; j.group.visible = false; } else if (state.listed.has(j.id)) j.tag.visible = true; }
  if (state.step !== 'talk') { shutterTarget = shutterOpen = 1; shutterSolid.off = true; }
  if (state.table) { mixTable.visible = true; if (!mixSolid) mixSolid = solid(-8.0, -3.2, -13.4, -11.8); }
  state.naknik = 0; for (let i = 0; i < Math.min(3, +s.naknik || 0); i++) spawnNaknik(false);
  if (state.step !== 'talk') dadOutside(); // the keys were handed over: Eddy Sr. is out front (or gone)
  if (['russian', 'free'].includes(state.step)) { dad.visible = false; dad.userData.leaving = false; dadSolid.off = true; }
  kitText(); if (state.kit.includes('maboota')) equip(true);
  if (!s.loadout) state.loadout = null; if (!s.stash) state.stash = null; mission.migrateKit(); kitText();
  loadingSave = false;
}
let savedGame = readSave();
// ---- start menu: Continue / New Game / Controls / Music / Credits (mouse, keyboard, controller and touch)
let titleView = 'main', titleSel = 0;
const districtSummary = (st) => (st.econ && st.econ.rep ? ` · ${rankOf(st.econ.rep).name}` : '') + (st.district1 ? ' · Kipkruidenkwartier is yours' : ((n) => (n ? ` · ${n}/3 of Kipkruidenkwartier` : ''))(['spekbuurt', 'kroketkade', 'uitjesbuurt'].filter((id) => (st.owned && st.owned[id]) || (id === 'spekbuurt' && st.spekbuurt)).length));
const titleItems = () => titleView === 'confirm' ? [['no', 'Nee, terug'], ['yes', 'Ja, opnieuw beginnen']]
  : titleView === 'controls' || titleView === 'credits' ? [['back', 'Terug']]
  : [...(savedGame ? [['cont', 'Continue']] : []), ['new', 'New Game'], ['controls', 'Controls'], ['music', 'Music'], ['credits', 'Credits']];
function titleMenu(confirm) {
  if (confirm === true) titleView = 'confirm'; else if (confirm === false && titleView === 'confirm') titleView = 'main';
  titleConfirm = titleView === 'confirm';
  const items = titleItems(); titleSel = Math.max(0, Math.min(titleSel, items.length - 1));
  const sub = (t) => t === 'music' ? (musicWanted() ? 'ON' : 'OFF') : t === 'cont' && savedGame ? `W ${(+savedGame.state.money || 0).toLocaleString('nl-NL')}` : '';
  let panel = '';
  if (titleView === 'controls') panel = `<div class="tpanel"><h3>Controls</h3>${controlsTable()}</div>`;
  if (titleView === 'credits') panel = `<div class="tpanel"><h3>Credits</h3><p>An original Kaasland story about Eddy Jr., his father's spice warehouse and the Lampas.</p>
    <p><b>Engine:</b> three.js (MIT) · <b>Textures:</b> ambientCG (CC0) · <b>Music:</b> generated live in your browser</p>
    <p><b>Fonts</b> (SIL Open Font License): Bungee by David Jonathan Ross · Rubik by Hubert &amp; Fischer · VT323 by Peter Hull · Press Start 2P by Cody "CodeMan38" Boisclair</p>
    <p>Built with Claude Code.</p></div>`;
  if (titleView === 'confirm') panel = `<div class="tpanel"><h3>Nieuw spel?</h3>Your saved game will be gone for good.</div>`;
  $('tmenu').innerHTML = panel + items.map(([t, label], i) => `<div class="mi${i === titleSel ? ' sel' : ''}" data-t="${t}"><span>${label}</span><small>${sub(t)}</small></div>`).join('');
  const m = inputMode(), info = m === 'pad' ? 'D-pad to choose · A to select · B back' : m === 'touch' ? 'Tap to choose' : '↑ ↓ to choose · Enter to select · Esc back';
  $('tinfo').textContent = titleView === 'main' && savedGame ? `Saved ${new Date(savedGame.at || Date.now()).toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${districtSummary(savedGame.state)} · ${info}` : info;
}
let musicPref = !(savedGame && savedGame.settings && savedGame.settings.music === false);
const musicWanted = () => musicPref;
function titleAct(t) {
  beep(660, 0.05, 'triangle', 0.04);
  if (t === 'cont') continueGame();
  else if (t === 'new') { if (savedGame) { titleSel = 0; titleMenu(true); } else startGame(); }
  else if (t === 'yes') newGame();
  else if (t === 'no' || t === 'back') { titleView = 'main'; titleSel = 0; titleMenu(false); }
  else if (t === 'controls' || t === 'credits') { titleView = t; titleSel = 0; titleMenu(); }
  else if (t === 'music') { musicPref = !musicPref; try { if (musicPref) music.start(); else music.stop(); } catch (e) { /* audio optional */ } titleMenu(); }
}
titleMenu(false);
// hints follow the last device used (keyboard / controller / touch)
const HELP = {
  mouse: 'WASD move · Shift run · E interact / click · Wheel zoom · M map · N music · I inventory · 1 Maboota · F / click attack · P pause · guns on missions only',
  pad: 'Left stick move · LB run · A interact · RT attack · RB map · D-pad ▼ inventory · Start pause',
  touch: '',
};
function deviceHints() {
  const m = inputMode();
  $('help').textContent = HELP[m];
  const nx = document.querySelector('#dialogue .next'); if (nx) nx.textContent = m === 'pad' ? 'A to continue' : m === 'touch' ? 'tap to continue' : 'E / click to continue';
  if (state.step === 'title') titleMenu();
}
onInputMode(deviceHints);
addEventListener('pagehide', () => writeSave());

// ------------------------------------------------------------------ input
const keys = {};
addEventListener('keydown', (e) => {
  if (state.step === 'title') { titleKey(e); return; }
  keys[e.code] = true;
  if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
    if (state.inDialogue) { nextLine(); return; }
    if (choiceOpen) return;
    if (!state.inPC && current) current.act();
  }
  if (e.code === 'Escape' && choiceOpen) { closeChoice(-1); return; }
  if (e.code === 'Escape' && state.inPC) { if ($('shop').style.display === 'block') closeShop(); else closePC(); }
  if (e.code === 'KeyN') { const on = music.toggle(); toast(on ? 'MUSIC ON' : 'MUSIC OFF', '', 1); writeSave(); }
  if (e.code === 'KeyM' && !state.inDialogue && !choiceOpen) state.inPC ? closePC() : openPC('map', 'pc');
  if ((e.code === 'Digit1' || e.code === 'Numpad1') && !state.inPC && !state.inDialogue) { if (state.kit.includes('maboota')) equip(!state.armed); else toast('NO WEAPON', 'You have nothing to hold yet.', 1.4); }
  if (e.code === 'KeyF' && !state.inPC && !state.inDialogue) swing();
});
addEventListener('keyup', (e) => { keys[e.code] = false; });
let zoom = 1;
addEventListener('wheel', (e) => { if (!state.inPC) zoom = Math.max(0.6, Math.min(1.6, zoom + Math.sign(e.deltaY) * 0.08)); }, { passive: true });
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
canvas.addEventListener('pointerdown', (e) => {
  if (state.inDialogue) { nextLine(); return; }
  if (state.inPC) return;
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mouse, camera);
  for (const it of inter) {
    if (it.enabled && !it.enabled()) continue;
    if (ray.intersectObject(it.obj, true).length) {
      const d = it.pos().distanceTo(player.position);
      if (d <= it.r + 0.6 || it.far) it.act(); else if (state.armed) swing(); else toast('TOO FAR', 'Walk over there first.', 1.4);
      return;
    }
  }
  if (state.armed) swing();
});
$('title').addEventListener('click', (e) => { const t = e.target.closest('[data-t]'); if (t) titleAct(t.dataset.t); });
$('title').addEventListener('mousemove', (e) => { const t = e.target.closest('.mi'); if (!t) return; const i = [...$('tmenu').querySelectorAll('.mi')].indexOf(t); if (i >= 0 && i !== titleSel) { titleSel = i; $('tmenu').querySelectorAll('.mi').forEach((el, k) => el.classList.toggle('sel', k === i)); } });
function titleKey(e) {
  const items = titleItems();
  if (['ArrowUp', 'KeyW'].includes(e.code)) { titleSel = (titleSel + items.length - 1) % items.length; titleMenu(); beep(700, 0.03, 'square', 0.02); return; }
  if (['ArrowDown', 'KeyS', 'Tab'].includes(e.code)) { e.preventDefault(); titleSel = (titleSel + 1) % items.length; titleMenu(); beep(700, 0.03, 'square', 0.02); return; }
  if (['Enter', 'Space', 'KeyE'].includes(e.code)) { titleAct(items[titleSel][0]); return; }
  if (titleConfirm && ['KeyJ', 'KeyY'].includes(e.code)) { newGame(); return; }
  if (['Escape', 'Backspace'].includes(e.code) && titleView !== 'main') { titleAct('back'); return; }
  if (e.code === 'KeyN' && titleView === 'main') titleAct('new');
  if (e.code === 'KeyC' && titleView === 'main' && savedGame) titleAct('cont');
}
function newGame() { clearSave(); savedGame = null; startGame(); }
function continueGame() {
  if (state.step !== 'title') return;
  applySave(savedGame); $('title').style.display = 'none'; document.body.classList.remove('on-title'); camPos.copy(player.position).add(new THREE.Vector3(0, 14, 4.5)); camLook.copy(player.position); updateObjective(); beep(440, 0.1, 'triangle');
  toast('WELKOM TERUG', `W ${state.money.toLocaleString('nl-NL')} in your pocket.`, 2);
  if (musicPref) { try { music.start(); } catch (e) { /* audio optional */ } }
}
function startGame() {
  if (state.step !== 'title') return;
  $('title').style.display = 'none'; document.body.classList.remove('on-title'); camPos.copy(player.position).add(new THREE.Vector3(0, 14, 4.5)); camLook.copy(player.position); state.step = 'talk'; updateObjective(); beep(440, 0.1, 'triangle'); writeSave();
  if (musicPref) { try { music.start(); } catch (e) { /* audio optional */ } }
  toast('KIPKRUIDENKWARTIER', 'Eddy Sr. is waiting for you in the warehouse.', 2.6);
}

// ------------------------------------------------------------------ street life: traffic, cyclists, pedestrians
// Kaasland drives on the right: westbound on the north lane, eastbound on the south lane.
// Speech bubbles for angry drivers (canvas sprite, redrawn per shout)
function bubble() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  sp.scale.set(4.8, 1.2, 1); sp.visible = false; sp.renderOrder = 10; sp.userData = { c, t, life: 0 };
  return sp;
}
function say(sp, text, col = '#e8a33d') {
  const { c, t } = sp.userData, g = c.getContext('2d');
  g.clearRect(0, 0, 512, 128);
  g.fillStyle = '#fff'; g.strokeStyle = col; g.lineWidth = 8;
  g.beginPath(); g.roundRect(8, 8, 496, 88, 26); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(230, 94); g.lineTo(256, 122); g.lineTo(276, 94); g.fill();
  g.fillStyle = '#1a1020'; g.font = '900 34px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = 34; while (g.measureText(text).width > 470 && fs > 18) { fs -= 2; g.font = `900 ${fs}px Arial Black, Arial`; }
  g.fillText(text, 256, 53);
  t.needsUpdate = true; sp.visible = true; sp.userData.life = 2.2;
}
const DRIVER_SHOUTS = ['TOET TOET!', 'Hé kaaskop, aan de kant!', 'Get off the road, gek!', 'Doe normaal, man!', 'I\'m late for my frikandel!', 'MOVE IT, spice boy!', 'Rij ik jou aan of hoe zit het?', 'Ga fietsen ofzo!'];
const BIKE_SHOUTS = ['TRING TRING!', 'Fietspad, hè?!', 'Kijk uit, joh!', 'This is a BIKE lane!'];
function honk() { beep(415, 0.32, 'square', 0.035); setTimeout(() => beep(349, 0.42, 'square', 0.035), 160); }
function bell() { beep(2100, 0.12, 'sine', 0.04); setTimeout(() => beep(2100, 0.18, 'sine', 0.04), 140); }
// knockback when traffic hits you
const knock = { vx: 0, vz: 0, vy: 0, t: 0 };
function bump(vx, vz, up, line) {
  if (knock.t > 0) return;
  knock.vx = vx; knock.vz = vz; knock.vy = up; knock.t = 0.9;
  beep(110, 0.25, 'sawtooth', 0.06); setTimeout(() => beep(70, 0.3, 'square', 0.05), 60);
  toast('BONK!', line, 1.6);
}
const traffic = [];
for (let i = 0; i < 6; i++) {
  const dir = i % 2 ? 1 : -1, z = RC + (dir > 0 ? 1.5 : -1.5);
  const c = car(-60 + i * 21, z, CAR_COLS[(i * 4 + 1) % CAR_COLS.length], dir > 0 ? 0 : Math.PI, false, [0, 1, 6, 2, 5, 3][i]);
  c.userData.dir = dir; c.userData.v = 8; c.userData.vmax = 7 + (i % 3) * 1.5;
  c.userData.solid = solid(0, 0, 0, 0);
  c.userData.blockT = 0; c.userData.honkT = 0;
  c.userData.bubble = bubble(); c.add(c.userData.bubble); c.userData.bubble.position.set(0, 3.0, 0);
  traffic.push(c);
}
// bikes, Kaasland-style: kind 0 normal, 1 tricycle, 2 four-seater "vierfiets", 3 tall bike, 4 bakfiets with a cheese
function makeBike(color, kind = 0) {
  const b = new THREE.Group(), fm = lam({ color }), seats = [];
  const wheel = (x, r = 0.34, z = 0) => { const w = new THREE.Mesh(new THREE.TorusGeometry(r, 0.035, 6, 16), mat.black); w.position.set(x, r + 0.02, z); w.userData.r = r; b.add(w); for (let k = 0; k < 3; k++) { const sp = box(r * 1.9, 0.015, 0.015, mat.dark, 0, 0, 0, w, false); sp.rotation.z = k * Math.PI / 3; } return w; };
  const tube = (x0, y0, x1, y1, z = 0) => { const m = box(Math.hypot(x1 - x0, y1 - y0), 0.045, 0.045, fm, (x0 + x1) / 2, (y0 + y1) / 2, z, b, false); m.rotation.z = Math.atan2(y1 - y0, x1 - x0); };
  const seat = (x, y, pose) => { box(0.26, 0.05, 0.14, mat.black, x, y, 0, b, false); seats.push([x, y, pose]); };
  const bars = (x, y) => { box(0.05, 0.05, 0.55, mat.black, x, y, 0, b, false); };
  if (kind === 1) { // tricycle: big front wheel, two small rear wheels, a basket
    wheel(0.6, 0.42); wheel(-0.55, 0.28, 0.38); wheel(-0.55, 0.28, -0.38);
    box(0.05, 0.05, 0.8, fm, -0.55, 0.3, 0, b, false);
    tube(-0.55, 0.3, 0.0, 0.45); tube(0.0, 0.45, 0.52, 0.95); tube(0.6, 0.44, 0.52, 0.95); tube(0.0, 0.45, -0.12, 0.88);
    seat(-0.12, 0.92); bars(0.52, 1.02);
    box(0.5, 0.3, 0.6, lam({ color: 0xc8a060 }), -0.62, 0.62, 0, b);
  } else if (kind === 2) { // vierfiets: four riders on one long frame
    wheel(-1.75); wheel(1.75); wheel(-0.6, 0.3); wheel(0.6, 0.3);
    tube(-1.75, 0.36, 1.75, 0.36); tube(-1.6, 0.86, 1.6, 0.86);
    for (let i = 0; i < 4; i++) { const x = -1.35 + i * 0.9; tube(x, 0.36, x, 0.88); seat(x, 0.92); bars(x + 0.45, 1.02); tube(x + 0.45, 0.86, x + 0.45, 1.02); }
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), lam({ color: 0xff7a1a, side: THREE.DoubleSide })); flag.position.set(-1.75, 2.0, 0); b.add(flag);
    cyl(0.012, 0.012, 1.4, mat.dark, -1.75, 1.3, 0, b);
  } else if (kind === 3) { // tall bike: one frame welded on top of another
    wheel(-0.52); wheel(0.52);
    tube(-0.52, 0.36, -0.1, 0.36); tube(-0.1, 0.36, 0.42, 0.82); tube(-0.18, 0.86, 0.42, 0.82); tube(-0.1, 0.36, -0.18, 0.86); tube(0.52, 0.36, 0.42, 0.82);
    tube(-0.18, 0.86, -0.1, 1.86); tube(0.42, 0.82, 0.48, 1.9); tube(-0.1, 1.86, 0.48, 1.9); tube(-0.1, 1.4, 0.45, 1.4);
    seat(-0.12, 1.92); bars(0.48, 2.02);
  } else if (kind === 4) { // bakfiets with a wheel of Gouda in the box
    wheel(-0.7); wheel(1.25, 0.26);
    tube(-0.7, 0.36, -0.2, 0.36); tube(-0.2, 0.36, 0.3, 0.5); tube(0.3, 0.5, 1.25, 0.28); tube(-0.28, 0.88, 0.3, 0.86); tube(-0.2, 0.36, -0.28, 0.88);
    seat(-0.3, 0.92); bars(0.3, 1.05); tube(0.3, 0.5, 0.3, 1.05);
    box(0.85, 0.5, 0.7, lam({ color: 0x8a5a2a }), 0.78, 0.68, 0, b);
    const ch = cyl(0.3, 0.3, 0.22, lam({ color: 0xf2c43a }), 0.78, 1.03, 0, b, 18); ch.rotation.z = 0.3;
  } else if (kind === 5) { // mini bike: tiny wheels, rider squatting over it like a frog
    wheel(-0.32, 0.15); wheel(0.34, 0.15);
    tube(-0.32, 0.17, 0.0, 0.2); tube(0.0, 0.2, 0.3, 0.42); tube(0.34, 0.17, 0.28, 0.95); tube(-0.32, 0.17, -0.1, 0.5); tube(0.0, 0.2, -0.1, 0.5);
    seat(-0.12, 0.54, 'squat'); bars(0.28, 0.98);
  } else if (kind === 6) { // penny-farthing: huge front wheel, tiny rear wheel, rider way up top
    wheel(0.15, 0.78); wheel(-0.95, 0.19);
    tube(-0.95, 0.21, -0.55, 1.15); tube(-0.55, 1.15, 0.05, 1.6); tube(0.15, 0.8, 0.12, 1.62);
    seat(0.0, 1.66); bars(0.18, 1.78); tube(0.12, 1.62, 0.18, 1.78);
  } else if (kind === 7) { // double-decker: one rider on a tall frame, a second on a little bike tucked underneath
    wheel(-0.95, 0.36); wheel(0.95, 0.36);
    tube(-0.95, 0.38, -0.1, 2.35); tube(0.95, 0.38, 0.35, 2.4); tube(-0.95, 0.38, 0.95, 0.38); tube(-0.1, 2.35, 0.35, 2.4); tube(-0.5, 1.35, 0.6, 1.4);
    seat(-0.12, 2.42); bars(0.4, 2.52);
    wheel(-0.25, 0.13); wheel(0.3, 0.13); tube(-0.25, 0.15, 0.3, 0.15); tube(-0.1, 0.15, -0.12, 0.52); tube(0.3, 0.15, 0.25, 0.8);
    seat(-0.12, 0.56, 'squat'); bars(0.25, 0.82);
  } else if (kind === 8) { // extra-tall bike: a long fork and a seat up at first-floor windows
    wheel(-0.95, 0.38); wheel(0.95, 0.38);
    tube(-0.95, 0.4, -0.45, 0.9); tube(-0.45, 0.9, -0.2, 2.25); tube(-0.45, 0.9, 0.62, 0.95); tube(0.95, 0.4, 0.6, 2.35); tube(-0.2, 2.25, 0.6, 2.35); tube(-0.2, 2.25, -0.95, 0.4);
    seat(-0.25, 2.3); bars(0.62, 2.45);
  } else if (kind === 9) { // stacked four: one frame, four riders at three heights
    wheel(-0.85); wheel(0.85);
    tube(-0.85, 0.36, 0.85, 0.36); tube(-0.3, 0.36, -0.3, 2.75); tube(0.3, 0.36, 0.3, 2.75); tube(-0.3, 2.0, 0.85, 2.05); tube(-0.85, 1.75, 0.3, 1.75); tube(-0.3, 2.75, 0.3, 2.75); tube(0.85, 0.36, 0.85, 2.05); tube(-0.85, 0.36, -0.85, 1.75);
    seat(0.0, 0.9); bars(0.5, 1.0);
    seat(-0.75, 1.82); bars(-0.32, 1.95);
    seat(0.55, 2.12); bars(0.95, 2.25);
    seat(-0.05, 2.82); bars(0.35, 2.95);
  } else {
    wheel(-0.52); wheel(0.52);
    tube(-0.52, 0.36, -0.1, 0.36); tube(-0.1, 0.36, 0.42, 0.82); tube(-0.18, 0.86, 0.42, 0.82); tube(-0.1, 0.36, -0.18, 0.86); tube(0.52, 0.36, 0.42, 0.82); tube(-0.52, 0.36, -0.18, 0.86);
    seat(-0.2, 0.92); bars(0.42, 1.0); tube(0.42, 0.82, 0.42, 1.0);
    box(0.28, 0.06, 0.32, lam({ color: 0x3a2a1a }), -0.5, 0.7, 0, b);
  }
  b.userData.seats = seats; b.userData.len = kind === 2 ? 2.2 : kind === 4 ? 1.6 : kind === 6 || kind === 7 || kind === 8 ? 1.3 : kind === 9 ? 1.2 : 0.95;
  scene.add(b); return b;
}
const SKINS = [0xf0c8a8, 0xe0a882, 0xc8885e, 0x9a6440, 0x6a4028, 0xf4d2bc];
const HAIRS = ['#1a1410', '#3a2a1a', '#7a5a30', '#d8c080', '#a0602e', '#8a8a8a', '#202020'];
const SHIRTS = ['#c83a2a', '#2a5a9a', '#e8e2d0', '#3a7a4a', '#f2c31a', '#2a2a30', '#8a4aa0', '#e87a9a', '#1a6a6a', '#d06a20'];
const PANTS = [0x2a3a5a, 0x3a3a3a, 0xc8b89a, 0x1a1a22, 0x5a4a3a, 0x4a5a7a];
function passerBy(seed, opt = {}) {
  const r = (k) => (Math.sin(seed * 97.13 + k * 13.7) * 43758.5453) % 1, ri = (n, k) => Math.floor(Math.abs(r(k)) * n);
  const female = opt.female ?? (ri(2, 20) === 0), kid = !!opt.kid, police = !!opt.police;
  const skin = SKINS[ri(SKINS.length, 1)], hair = HAIRS[ri(HAIRS.length, 2)];
  const head = { skin, hair, brow: hair, hairLine: 84 + ri(10, 3), sideLine: 116, backLine: 150, mouth: ri(2, 4) ? 'smile' : 'laugh', iris: ['#4a2e1c', '#3a5a7a', '#2a2a2a'][ri(3, 5)], glasses: !kid && ri(5, 6) === 0,
    long: female ? ri(4, 7) !== 0 : ri(6, 7) === 0, bun: female && ri(3, 8) === 0, bald: !female && !kid && !police && ri(7, 9) === 0 };
  if (head.bald) head.hairLine = 40;
  if (female) head.mouth = 'smile';
  const shirt = police ? '#1d2a4ap' : SHIRTS[ri(SHIRTS.length, 10)] + (ri(4, 11) === 0 ? 's' : '');
  const skirt = female && !police && ri(2, 16) === 0 ? [0xe8862c, 0x2a2a30, 0x3a7ad8, 0xf2e8c8, 0x8a4aa0][ri(5, 17)] : null;
  return makePerson({ head, police, front: shirt, pants: police ? 0x1a2238 : skirt ? [0x2a1a1a, skin][ri(2, 18)] : PANTS[ri(PANTS.length, 12)], shoes: police ? 0x111111 : [0x1a1a1a, 0xe8e8e8, 0x5a3a1a, 0xc8102e][ri(4, 13)],
    belly: kid || female ? 0 : [0, 0, 0.4, 0.8][ri(4, 14)], chest: female && !kid ? 1 + Math.abs(r(19)) * 0.35 : 0, skirt, skin,
    scale: kid ? 0.56 + Math.abs(r(15)) * 0.1 : (female ? 0.88 : 0.93) + Math.abs(r(15)) * 0.12 });
}
// things people walk with
function makeStroller() {
  const g = new THREE.Group(), c = [0x2a4a7a, 0xd84a7a, 0x2a6a4a, 0xe8d8b0][Math.floor(Math.random() * 4)];
  for (const [x, z] of [[0.28, 0.22], [0.28, -0.22], [-0.25, 0.22], [-0.25, -0.22]]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.025, 5, 12), mat.black); w.position.set(x, 0.12, z); g.add(w); }
  box(0.62, 0.05, 0.42, mat.dark, 0, 0.26, 0, g, false);
  const tub = box(0.6, 0.3, 0.4, lam({ color: c }), 0.02, 0.48, 0, g); 
  const hood = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: c, side: THREE.DoubleSide })); hood.position.set(-0.12, 0.62, 0); hood.rotation.z = 0.4; hood.scale.set(1, 1, 0.95); g.add(hood);
  const baby = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), lam({ color: 0xf4d2bc })); baby.position.set(0.12, 0.66, 0); g.add(baby);
  box(0.04, 0.5, 0.04, mat.dark, -0.42, 0.62, 0, g, false).rotation.z = 0.5; box(0.04, 0.04, 0.42, mat.dark, -0.52, 0.84, 0, g, false);
  scene.add(g); return g;
}
function makeDog(seed) {
  const g = new THREE.Group(), cols = [0x8a5a2a, 0x1a1a1a, 0xe8d8b0, 0xd89a4a, 0x6a6a6a], c = lam({ color: cols[seed % cols.length] }), sz = [0.8, 1.15, 0.6][seed % 3];
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.36, 4, 10), c); body.rotation.z = Math.PI / 2; body.position.y = 0.36; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 8), c); head.position.set(0.32, 0.5, 0); g.add(head);
  const snout = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.09), c); snout.position.set(0.43, 0.47, 0); g.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 5), mat.black); nose.position.set(0.5, 0.49, 0); g.add(nose);
  for (const z of [-0.07, 0.07]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.04), c); e.position.set(0.3, 0.6, z); e.rotation.x = z > 0 ? 0.4 : -0.4; g.add(e); }
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.22, 6), c); tail.position.set(-0.3, 0.48, 0); tail.rotation.z = -0.8; g.add(tail);
  const legs = [];
  for (const [x, z] of [[0.18, 0.07], [0.18, -0.07], [-0.18, 0.07], [-0.18, -0.07]]) { const l = new THREE.Group(); l.position.set(x, 0.3, z); g.add(l); const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.05), c); m.position.y = -0.15; l.add(m); legs.push(l); }
  g.scale.setScalar(sz); g.userData = { legs, tail, ph: 0 };
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  scene.add(g); return g;
}
const leashMat = new THREE.LineBasicMaterial({ color: 0xe8862c });
const cyclists = [];
const BIKE_KINDS = [0, 2, 1, 0, 4, 3, 0, 1, 5, 6, 7, 8, 9, 6, 5, 7];
BIKE_KINDS.forEach((kind, i) => {
  const dir = i % 2 ? -1 : 1, z = RC + (dir > 0 ? 5.85 : 6.95);
  const bike = makeBike([0x1a1a1a, 0xff5fa2, 0x2fb8a8, 0x7a1a1a, 0xffd23a, 0x8a5ae0, 0xd8d0c0, 0x2a4a7a][i % 8], kind);
  const riders = bike.userData.seats.map(([sx, sy, pose], k) => {
    const r = passerBy(100 + i * 5 + k); scene.remove(r); bike.add(r);
    r.position.set(sx - 0.02, sy - 0.9, 0); r.rotation.y = Math.PI / 2;
    r.userData.arms[0].rotation.x = r.userData.arms[1].rotation.x = -1.0;
    r.userData.squat = pose === 'squat'; // mini bikes: knees up by the ears
    if (r.userData.squat) { r.position.y = sy - 0.62; r.scale.y = 0.94; }
    return r;
  });
  bike.position.set(-64 + i * 8.3, 0, z); bike.rotation.y = dir > 0 ? 0 : Math.PI;
  const len = bike.userData.len;
  bike.userData = { dir, v: 4, vmax: kind === 2 ? 3.2 : kind === 1 ? 2.8 : kind === 5 ? 2.6 : kind === 9 ? 2.4 : kind >= 6 ? 3.2 : 4 + (i % 3) * 0.6, riders, phase: i, len, kind, bubble: bubble(), shoutT: 0 };
  bike.add(bike.userData.bubble); bike.userData.bubble.position.set(0, { 3: 3.6, 6: 3.4, 7: 4.1, 8: 4.1, 9: 4.5 }[kind] || 2.7, 0);
  cyclists.push(bike);
});
const walkers = [];
const LANES = { N: [-4.5, -5.6], S: [RC + 8.55, RC + 9.45] };
for (let i = 0; i < 16; i++) {
  const side = i % 2 ? 'S' : 'N', dir = (i >> 1) % 2 ? 1 : -1;
  const police = i === 4 || i === 13, comp = police ? null : ['stroller', null, 'dog', null, 'kid', null, null, 'dog', null, 'stroller', null, 'kid'][i % 12];
  const p = passerBy(i + 1, { police, female: comp === 'stroller' ? true : undefined });
  p.position.set(-30 + ((i * 37) % 60), 0, LANES[side][dir > 0 ? 0 : 1]);
  const u = { side, dir, v: police ? 1.0 : 1.1 + ((i * 7) % 5) * 0.12, wait: 0, blocked: 0, police, comp: null };
  if (comp === 'stroller') { u.comp = { type: comp, obj: makeStroller(), ahead: 0.75, off: 0 }; u.v = 0.95; p.userData.arms[0].rotation.x = p.userData.arms[1].rotation.x = -0.9; }
  if (comp === 'dog') { const d = makeDog(i); const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), leashMat); scene.add(line); u.comp = { type: comp, obj: d, ahead: 1.3, off: 0.35, line }; }
  if (comp === 'kid') { const k = passerBy(i + 50, { kid: true }); u.comp = { type: comp, obj: k, ahead: 0.1, off: 0.55 }; }
  p.userData.walk = u;
  walkers.push(p);
}
const LINES_POLICE = ['Alles in orde hier, meneer?', 'No loitering near the canal.', 'We are watching the Lampas boys. And you.', 'Nice van. Is it registered?'];
const LINES_NPC = ['Lekker weertje, hè?', 'Watch it, I\'m walking here!', 'Have you seen the Lampas boys around? Bad news.', 'My snackbar only uses Eddy & Zn spice. Used to, anyway.', 'Fietsbel! Ring ring!', 'Nice shirt. Very... open.', 'They say the old Eddy had a secret recipe.'];
walkers.forEach((w, i) => addInteract({ obj: w, pos: () => w.position, r: 1.4, label: () => 'Say hi', act: () => { w.userData.walk.wait = 2.5; w.rotation.y = Math.atan2(player.position.x - w.position.x, player.position.z - w.position.z); const P_ = w.userData.walk.police, L_ = P_ ? LINES_POLICE : LINES_NPC; toast('"' + L_[(i + Math.floor(performance.now() / 5000)) % L_.length] + '"', P_ ? 'Politie' : 'Passer-by', 2.4); } }));
// ================================================================== SHOARMA SCHMATZEL
// A small choice menu in the dialogue box (used by Nabil)
let choiceOpen = false, choiceCb = null;
function choice(who, line, options, cb) {
  state.inPC = true; choiceOpen = true; choiceCb = cb;
  $('dlgwho').textContent = who; $('dlgline').innerHTML = line + '<div id="choices" style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap"></div>';
  const f = faces[who]; $('dlgface').style.display = f ? 'block' : 'none'; if (f) $('dlgface').src = f;
  options.forEach((o, i) => { const b = document.createElement('button'); b.textContent = (i + 1) + '. ' + o; b.style.cssText = 'font:700 15px Arial;padding:7px 14px;border-radius:6px;border:2px solid #ffd36b;background:#2a1a0e;color:#fff;cursor:pointer'; b.onclick = (ev) => { ev.stopPropagation(); closeChoice(i); }; $('choices').appendChild(b); });
  $('dialogue').style.display = 'block';
}
function closeChoice(i) { if (!choiceOpen) return; choiceOpen = false; state.inPC = false; $('dialogue').style.display = 'none'; const cb = choiceCb; choiceCb = null; if (cb) cb(i); }
addEventListener('keydown', (e) => { if (!choiceOpen) return; const n = { Digit1: 0, Numpad1: 0, Digit2: 1, Numpad2: 1 }[e.code]; if (n !== undefined) { e.stopImmediatePropagation(); closeChoice(n); } }, true);

// seated pose for diners and card players (not driven by animate())
function sit(p, y = 0.47) { const u = p.userData; u.legs.forEach((l) => { l.rotation.x = -1.45; }); u.body.position.y = y - 0.9; u.seated = true; }
const joint = new THREE.Group(); scene.add(joint);
const jointRoof = new THREE.Group(); joint.add(jointRoof);
const jointFront = new THREE.Group(); joint.add(jointFront);
const jointLights = [];
let jDoorOpen = 0, jDoorTarget = 0, jDoor, jDoorSolid, doner;
{
  const W0 = JS.x0, W1 = JS.x1, Z0 = JS.z0, Z1 = JS.z1, H = JS.h, cx = (W0 + W1) / 2, cz = (Z0 + Z1) / 2;
  const outer = clapMat(0x1f9e6e), tiles = canvasTex(64, 64, (g, w, h) => { g.fillStyle = '#f2f2ea'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c8c8be'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } });
  tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(6, 2);
  const inner = lam({ map: tiles });
  const floorT = canvasTex(64, 64, (g, w, h) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#2a2a30' : '#e8e2d0'; g.fillRect(x * 8, y * 8, 8, 8); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(5, 4.5);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(W1 - W0, Z1 - Z0), lam({ map: floorT })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.03, cz); fl.receiveShadow = true; joint.add(fl);
  box(W1 - W0, H, 0.3, inner, cx, H / 2, Z0, joint); solid(W0, W1, Z0 - 0.2, Z0 + 0.15);
  for (const x of [W0, W1]) { box(0.3, H, Z1 - Z0, inner, x, H / 2, cz, joint); solid(x - 0.15, x + 0.15, Z0, Z1); }
  const front = (x0, x1) => { box(x1 - x0, H - 0.7, 0.3, outer, (x0 + x1) / 2, 0.7 + (H - 0.7) / 2, Z1, jointFront); box(x1 - x0, 0.7, 0.3, outer, (x0 + x1) / 2, 0.35, Z1, joint); solid(x0, x1, Z1 - 0.15, Z1 + 0.15); };
  front(W0, JS.doorX0); front(JS.doorX1, W1);
  box(JS.doorX1 - JS.doorX0, H - 2.4, 0.3, outer, (JS.doorX0 + JS.doorX1) / 2, 2.4 + (H - 2.4) / 2, Z1, jointFront);
  // big shop windows with gold lettering, neon frames
  for (const [x, w] of [[W0 + 2.6, 4.2], [W1 - 1.9, 2.6]]) { box(w, 1.8, 0.06, winMat, x, 1.6, Z1 + 0.17, jointFront, false); neonRect(jointFront, x, 1.6, w + 0.1, 1.9, Z1 + 0.24, 0xffe14a); }
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.5), lam({ map: signTex([{ t: 'DÖNER · SHOARMA · FALAFEL', size: 34 }], 'rgba(0,0,0,0)', '#ffd36b', 512, 72), transparent: true })); ws.position.set(W0 + 2.6, 1.15, Z1 + 0.22); jointFront.add(ws);
  const hinge = new THREE.Group(); hinge.position.set(JS.doorX0, 0, Z1 + 0.05); joint.add(hinge);
  box(JS.doorX1 - JS.doorX0, 2.35, 0.08, lam({ color: 0xc8402e }), (JS.doorX1 - JS.doorX0) / 2, 1.18, 0, hinge);
  box(0.9, 1.2, 0.09, winMat, (JS.doorX1 - JS.doorX0) / 2, 1.5, 0.01, hinge, false);
  jDoor = hinge; jDoorSolid = solid(JS.doorX0, JS.doorX1, Z1 - 0.15, Z1 + 0.15);
  // façade: big neon sign, awning, blade sign, menu board on the pavement
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SHOARMA SCHMATZEL', size: 96 }, { t: 'SINDS 1971 · OOK VOOR EDDY', size: 40, color: '#ffffff' }], '#1e120a', '#ff7a1a', 1024, 150) }));
  sg.position.set(cx, 3.35, Z1 + 0.2); jointFront.add(sg);
  neonRect(jointFront, cx, 3.35, 7.75, 1.25, Z1 + 0.24, 0xe8862c);
  const awnT = canvasTex(64, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#c8402e'; c.fillRect(i * 8, 0, 8, 64); } });
  // awnings only over the two windows, so the door stays visible
  for (const [x, w] of [[W0 + 2.6, 4.4], [W1 - 1.9, 2.8]]) { const awn = box(w, 0.12, 1.1, lam({ map: awnT }), x, 2.65, Z1 + 0.65, jointFront); awn.rotation.x = 0.28; }
  bladeSign(jointFront, W0 + 0.4, 3.0, Z1, 'DÖNER', 0xffe14a);
  const bord = new THREE.Group(); bord.position.set(JS.doorX1 + 1.1, 0, Z1 + 1.1); bord.rotation.y = -0.3; scene.add(bord);
  const bt = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1.0), lam({ map: signTex([{ t: 'VANDAAG', size: 26 }, { t: 'SHOARMA', size: 30, color: '#ffffff' }, { t: 'BROODJE W 4', size: 22, color: '#ffd36b' }], '#202018', '#ff7a1a', 256, 256) })); bt.position.y = 0.7; bt.rotation.x = -0.15; bord.add(bt);
  solid(JS.doorX1 + 0.8, JS.doorX1 + 1.4, Z1 + 0.8, Z1 + 1.4);
  // roof (hidden while inside)
  box(W1 - W0 + 0.4, 0.3, Z1 - Z0 + 0.4, lam({ map: tex('roof_rust.jpg', 3, 3), color: 0x6a6a6a }), cx, H + 0.15, cz, jointRoof);
  box(W1 - W0 + 0.4, 0.6, 0.3, outer, cx, H + 0.6, Z1 + 0.1, jointFront);
  cyl(0.3, 0.3, 1.2, lam({ color: 0x9aa0a4 }), W1 - 1.2, H + 0.6, Z0 + 1.2, jointRoof);
  // ---- inside: counter + döner spit on the right, the card table on the left, two tables for diners by the window
  const steel = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.8 });
  const CZc = -13.0;
  box(4.0, 1.05, 0.8, lam({ color: 0xc8402e }), W1 - 2.3, 0.53, CZc, joint); box(4.2, 0.08, 0.95, steel, W1 - 2.3, 1.09, CZc, joint);
  box(0.8, 1.05, 2.3, lam({ color: 0xc8402e }), W1 - 4.3, 0.53, CZc - 0.75, joint);
  solid(W1 - 4.7, W1, CZc - 0.45, CZc + 0.45); solid(W1 - 4.7, W1 - 3.9, Z0, CZc);
  // sneeze glass + salads
  box(3.0, 0.4, 0.04, new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.35, roughness: 0.05 }), W1 - 2.4, 1.35, CZc + 0.35, joint, false);
  for (let i = 0; i < 6; i++) box(0.45, 0.06, 0.32, lam({ color: [0xd84a2a, 0x4f9a30, 0xf2e8c8, 0xe8b020, 0x7a2a5a, 0xf2f2ea][i] }), W1 - 3.75 + i * 0.5, 1.15, CZc, joint, false);
  // döner spit: a turning cone of meat in front of a glowing grill
  box(0.9, 1.6, 0.4, steel, W1 - 0.9, 1.9, Z0 + 0.5, joint); box(0.7, 1.3, 0.05, lam({ color: 0xff7a1a, emissive: 0xc84010 }), W1 - 0.9, 1.9, Z0 + 0.72, joint, false);
  doner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 14), lam({ color: 0x9a5a2a, map: canvasTex(64, 64, (g) => { g.fillStyle = '#9a5a2a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 90; i++) { g.fillStyle = ['#c8783a', '#6a3a1a', '#e8a050'][i % 3]; g.fillRect(Math.random() * 64, Math.random() * 64, 6, 2); } }) }));
  doner.position.set(W1 - 0.9, 1.85, Z0 + 1.15); joint.add(doner); cyl(0.02, 0.02, 1.6, steel, W1 - 0.9, 1.85, Z0 + 1.15, joint);
  // menu board with neon
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.2), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'BROODJE SHOARMA  W 4', size: 26 }, { t: 'SCHOTEL KAASLAND  W 9', size: 26, color: '#ffffff' }, { t: 'KAPSALON EDDY  W 7', size: 26, color: '#ffd36b' }], '#1e120a', '#a9c46a', 512, 192) }));
  menu.position.set(W1 - 3.0, 3.2, Z0 + 0.17); joint.add(menu); neonRect(joint, W1 - 3.0, 3.2, 3.3, 1.3, Z0 + 0.2, 0xe8862c);
  // framed photo of young Schmatzel and Eddy Sr.
  const ph = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.6), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#8a6a4a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2d8b8'; for (const x of [40, 88]) { g.beginPath(); g.arc(x, 40, 13, 0, 7); g.fill(); g.fillRect(x - 15, 55, 30, 30); } g.fillStyle = '#1a1a1a'; g.font = '700 10px Arial'; g.fillText('EDDY & SCHMATZEL 1966', 6, 92); }) }));
  ph.position.set(W0 + 0.17, 2.4, cz); ph.rotation.y = Math.PI / 2; joint.add(ph);
  // card table (round, green felt) on the left
  const CT = { x: W0 + 2.25, z: -12.0 };
  cyl(1.05, 1.05, 0.06, lam({ color: 0x1f6a3a }), CT.x, 0.76, CT.z, joint, 28); cyl(1.1, 1.1, 0.05, lam({ color: 0x6a3a1a }), CT.x, 0.72, CT.z, joint, 28); cyl(0.08, 0.12, 0.72, mat.dark, CT.x, 0.36, CT.z, joint);
  for (let i = 0; i < 9; i++) { const c = box(0.12, 0.005, 0.17, lam({ color: 0xffffff }), CT.x + Math.cos(i) * 0.45, 0.8, CT.z + Math.sin(i * 1.7) * 0.4, joint, false); c.rotation.y = i; }
  for (let i = 0; i < 12; i++) cyl(0.05, 0.05, 0.03 + (i % 4) * 0.03, lam({ color: [0xc8102e, 0x1a1a1a, 0xffd23a][i % 3] }), CT.x + Math.cos(i * 0.52) * 0.7, 0.8 + (i % 4) * 0.015, CT.z + Math.sin(i * 0.52) * 0.7, joint, 10);
  solid(CT.x - 1.55, CT.x + 1.55, CT.z - 1.55, CT.z + 1.55);
  joint.userData.CT = CT;
  // diner tables by the window
  for (const [tx, tz] of [[W1 - 1.5, -8.1], [W1 - 1.5, -10.3], [W0 + 1.3, -7.9]]) { box(1.0, 0.05, 0.7, lam({ color: 0xf2efe6 }), tx, 0.76, tz, joint); cyl(0.05, 0.05, 0.74, mat.dark, tx, 0.37, tz, joint); solid(tx - 0.55, tx + 0.55, tz - 0.4, tz + 0.4); }
  // lights (only while you're inside): warm fluorescent tubes + a pink neon strip
  for (const x of [cx - 2.5, cx + 2.5]) { box(2.0, 0.08, 0.2, lam({ color: 0xffffff, emissive: 0xfff6d8 }), x, H - 0.3, cz, jointRoof, false); const l = new THREE.PointLight(0xfff0d8, 0, 12, 1.4); l.position.set(x, H - 0.6, cz); joint.add(l); jointLights.push([l, 2.6]); }
  const pl = new THREE.PointLight(0xe8862c, 0, 6, 1.6); pl.position.set(W1 - 3, 3, Z0 + 1); joint.add(pl); jointLights.push([pl, 1.2]);
}
const isInJoint = (p) => p.x > JS.x0 && p.x < JS.x1 && p.z > JS.z0 && p.z < JS.z1 - 0.1;
function openJointDoor() { jDoorTarget = 1; jDoorSolid.off = true; beep(1480, 0.1, 'sine', 0.03); setTimeout(() => beep(1180, 0.15, 'sine', 0.03), 110); }
// Schmatzel behind the counter
const schmatzel = makePerson({ chefHat: true, stache: true, head: { skin: 0xe0a882, hair: '#c8c4bc', brow: '#8a8478', hairLine: 70, sideLine: 112, backLine: 150, mouth: 'laugh', squint: true, iris: '#3a2a1a' }, front: '#3a6aa0a', shirt: 0x3a6aa0, pants: 0x3a3a3a, shoes: 0x1a1a1a, belly: 1, skin: 0xe0a882, scale: 0.95, rolled: true });
schmatzel.position.set(JS.x1 - 2.6, 0, -14.1); 
// chef's toque and moustache are part of his look (chefHat / stache)
// Nabil and the card players (Soprano types)
const CTp = joint.userData.CT;
const nabil = makePerson({ head: { skin: 0xc89070, hair: '#1a1410', brow: '#14100c', hairLine: 92, sideLine: 120, backLine: 150, mouth: 'laugh', iris: '#4a2e1a', beard: '#241c16', beard3d: '#241c16' }, feltHat: 0x3e4e36, cigarette: true, front: '#6a3e24', shirt: 0x6a3e24, pants: 0x2a2a30, shoes: 0x111111, belly: 0.5, skin: 0xc89070 });
const SOPRANOS = [
  { head: { skin: 0xe8b890, hair: '#151515', brow: '#111', hairLine: 78, sideLine: 110, backLine: 140, mouth: 'smile', iris: '#3a2a1a' }, front: '#2a2a2e', shirt: 0x2a2a2e, belly: 1.2, chain: true },
  { head: { skin: 0xdca07a, hair: '#2a2a2a', brow: '#222', hairLine: 60, sideLine: 100, backLine: 150, mouth: 'laugh', iris: '#3a2a1a', glasses: true }, front: '#f2efe6', shirt: 0xf2efe6, belly: 1.4, chain: true },
  { head: { skin: 0xf0c4a2, hair: '#3a2a1a', brow: '#2a1a10', hairLine: 84, sideLine: 116, backLine: 150, mouth: 'smile', iris: '#4a6a8a' }, front: '#4a1a2as', shirt: 0x4a1a2a, belly: 0.8 },
  { head: { skin: 0xc8885e, hair: '#8a8a8a', brow: '#6a6a6a', hairLine: 74, sideLine: 112, backLine: 150, mouth: 'smile', iris: '#2a2a2a', squint: true }, front: '#1a2a4a', shirt: 0x1a2a4a, belly: 1.1, chain: true },
];
const cardPlayers = [nabil, ...SOPRANOS.map((o) => makePerson({ ...o, pants: 0x1a1a1e, shoes: 0x111111, skin: o.head.skin, scale: 1.02 }))];
cardPlayers.forEach((p, i) => {
  const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
  p.position.set(CTp.x + Math.cos(a) * 1.45, 0, CTp.z + Math.sin(a) * 1.45);
  p.rotation.y = Math.atan2(CTp.x - p.position.x, CTp.z - p.position.z);
  sit(p); const u = p.userData; u.arms.forEach((ar) => { ar.rotation.x = -1.1; }); u.cardPhase = i * 1.3;
  // chair
  const ch = new THREE.Group(); ch.position.copy(p.position); ch.rotation.y = p.rotation.y; joint.add(ch);
  box(0.45, 0.06, 0.45, lam({ color: 0x6a3a1a }), 0, 0.45, -0.05, ch); box(0.45, 0.5, 0.06, lam({ color: 0x6a3a1a }), 0, 0.72, -0.28, ch);
});
// diners eating shoarma
const diners = [];
[[JS.x1 - 1.5, -8.75, 0], [JS.x1 - 1.5, -9.65, Math.PI], [JS.x1 - 1.5, -10.95, 0], [JS.x0 + 1.3, -8.55, 0]].forEach(([x, z, r], i) => {
  const p = passerBy(400 + i); p.position.set(x, 0, z); p.rotation.y = r; sit(p);
  const pita = new THREE.Mesh(new THREE.CapsuleGeometry(0.06, 0.16, 4, 8), lam({ color: 0xe8c890 })); pita.rotation.z = Math.PI / 2; pita.position.set(0, -0.68, 0.06); p.userData.arms[1].add(pita);
  p.userData.eatPh = i * 2; diners.push(p);
});
// quest marker: floating yellow prism over Nabil
const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), new THREE.MeshBasicMaterial({ color: 0xffe14a }));
prism.scale.set(0.8, 1.4, 0.8); scene.add(prism);
const prismGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,230,80,.9)'); r.addColorStop(1, 'rgba(255,230,80,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
scene.add(prismGlow);
const loanDue = () => state.loan.out && state.raids >= state.loan.at + 2;
const nabilHasAsk = () => !state.loan.out || loanDue();
function talkSchmatzel() {
  if (!state.metSchmatzel) {
    state.metSchmatzel = true;
    dialogue([
      ['Schmatzel', 'Eddy? Little Eddy?! Look at you! Last time you were here you could not see over the counter!'],
      ['Schmatzel', 'Your father and I, we grew up two streets from here. He sold me my first kilo of spice in 1971. On credit! Nobody gives credit anymore.'],
      ['Eddy Jr.', 'He says hi. From Costa del Kaas.'],
      ['Schmatzel', 'Of course he does. Sit, sit! A broodje shoarma, on the house. With Eddy & Zn spice, like the old days. Nobody else in this street gets it.'],
    ], () => { toast('BROODJE SHOARMA', 'On the house. Lekker.', 2.4); beep(660, 0.08, 'triangle'); setTimeout(() => beep(880, 0.12, 'triangle'), 90); });
  } else {
    const L = ['Another shoarma? You are too skinny, jongen. Here.', 'The Lampas sent a man last week. Wanted me to buy their spice. I gave him a kapsalon to go and showed him the door.', 'Nabil? He has been sitting at that table since 1983. Somehow he never loses.', 'When you find De Gouden Mix, you come here first. Promise me.'];
    dialogue([['Schmatzel', L[Math.floor(Math.random() * L.length)]]], () => toast('BROODJE SHOARMA', 'On the house.', 1.6));
  }
}
function talkNabil() {
  const L = state.loan;
  if (L.out && !loanDue()) { dialogue([['Nabil', ['Patience, my friend. The cards need time to warm up.', 'You will get it back. Nabil always pays. Ask anyone at this table.', 'Shh, shh. I am on a streak.'][Math.floor(Math.random() * 3)]]]); return; }
  if (L.out && loanDue()) {
    const back = L.amount * 2;
    dialogue([
      ['Nabil', 'Eddy! Come, come. Like I promised.'],
      ['Nabil', 'W ' + back + '. Count it. Go on, count it. Nabil always wins.'],
    ], () => { addMoney(back); L.out = false; L.amount *= 2; toast('NABIL PAID YOU BACK', '+W ' + back + '. He somehow always wins.', 3); });
    return;
  }
  const ask = () => choice('Nabil', `Listen. I need W ${L.amount}. Just a small loan. I give it back, double. Nabil always pays.`, [`Lend W ${L.amount}`, 'Not now'], (i) => {
    if (i !== 0) { dialogue([['Nabil', 'Your loss, my friend. The cards are hot today.']]); return; }
    if (state.money < L.amount) { dialogue([['Nabil', `W ${L.amount}, Eddy. Not less. Come back when your pockets are fatter.`]]); return; }
    addMoney(-L.amount); L.out = true; L.at = state.raids;
    dialogue([['Nabil', 'You are a good boy. Like your father. Now let me play.']], () => toast('LOAN TO NABIL', 'W ' + L.amount + ' gone into the card game.', 2.4));
  });
  if (!state.metNabil) {
    state.metNabil = true;
    dialogue([
      ['Nabil', 'Eddy & Zn! The son! Sit, sit. No, not there, that is Tony\'s chair. He gets upset.'],
      ['Nabil', 'Your father, he always believed in me. Even in 1984. Especially in 1984.'],
    ], ask);
  } else ask();
}
addInteract({ obj: jDoor, pos: () => new THREE.Vector3((JS.doorX0 + JS.doorX1) / 2, 0, JS.z1 + 0.4), r: 1.6, enabled: () => jDoorTarget === 0, label: () => 'Open the door · Shoarma Schmatzel', act: openJointDoor });
addInteract({ obj: schmatzel, pos: () => schmatzel.position, r: 2.6, enabled: () => isInJoint(player.position), label: () => 'Talk to Schmatzel', act: talkSchmatzel });
addInteract({ obj: nabil, pos: () => nabil.position, r: 1.9, enabled: () => isInJoint(player.position), label: () => nabilHasAsk() ? 'Talk to Nabil  (!)' : 'Talk to Nabil', act: talkNabil });
cardPlayers.slice(1).forEach((p, i) => addInteract({ obj: p, pos: () => p.position, r: 1.7, enabled: () => isInJoint(player.position), label: () => 'Talk', act: () => dialogue([['Card player', ['Fuhgeddaboudit.', 'You in or you out? We play for real Wilders here.', 'Nabil, it\'s your deal. AGAIN.', 'Hey. Respect the table.'][i]]]) }));
function updateJoint(dt) {
  jDoorOpen += (jDoorTarget - jDoorOpen) * Math.min(1, dt * 3); jDoor.rotation.y = jDoorOpen * 1.7;
  const inJ = isInJoint(player.position);
  jointRoof.visible = !inJ; jointFront.visible = !inJ;
  for (const [l, k] of jointLights) l.intensity += ((inJ ? k : 0) - l.intensity) * Math.min(1, dt * 4);
  doner.rotation.y += dt * 0.8;
  const t = performance.now() * 0.001;
  cardPlayers.forEach((p) => { const u = p.userData; u.cardPhase += dt; u.arms[0].rotation.x = -1.1 + Math.sin(u.cardPhase * 1.7) * 0.15; u.arms[1].rotation.x = -1.0 + (Math.sin(u.cardPhase * 0.6) > 0.85 ? -0.5 : 0); u.head.rotation.y = Math.sin(u.cardPhase * 0.4) * 0.3; });
  diners.forEach((p) => { const u = p.userData; u.eatPh += dt; const k = (Math.sin(u.eatPh * 1.2) + 1) / 2; u.arms[1].rotation.x = -0.6 - k * 1.5; u.arms[0].rotation.x = -0.5; });
  { const toP = Math.atan2(player.position.x - schmatzel.position.x, player.position.z - schmatzel.position.z); schmatzel.rotation.y += Math.atan2(Math.sin(toP - schmatzel.rotation.y), Math.cos(toP - schmatzel.rotation.y)) * Math.min(1, dt * 3); animate(schmatzel, 0, dt); }
  const show = nabilHasAsk();
  prism.visible = prismGlow.visible = show;
  if (show) { prism.position.set(nabil.position.x, 2.7 + Math.sin(t * 2.5) * 0.08, nabil.position.z); prism.rotation.y += dt * 2; prismGlow.position.copy(prism.position); prismGlow.lookAt(camera.position); }
  return inJ;
}

// ================================================================== MABOOTA (melee)
const maboota = new THREE.Group();
{ const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.62, 10), new THREE.MeshStandardMaterial({ color: 0x141418, roughness: 0.4 })); b.position.y = -0.31; maboota.add(b);
  const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.14, 10), new THREE.MeshStandardMaterial({ color: 0x6a1a1a, roughness: 0.9 })); grip.position.y = 0.02; maboota.add(grip);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 8), b.material); side.rotation.z = Math.PI / 2; side.position.set(0.07, -0.05, 0); maboota.add(side); }
maboota.position.set(0, -0.68, 0.06); maboota.rotation.x = -1.2; maboota.visible = false;
player.userData.arms[0].add(maboota);
let swingT = 0, swingHit = false;
function equip(on) { state.armed = on; maboota.visible = on; $('weapon').style.display = state.kit.includes('maboota') ? 'block' : 'none'; $('weapon').className = 'hud' + (on ? ' on' : ''); if (on) beep(300, 0.06, 'square', 0.03); }
function swing() {
  if (!state.armed || swingT > 0 || knock.t > 0) return;
  swingT = 0.38; swingHit = false; beep(180, 0.08, 'sawtooth', 0.02);
}
function personBubble(p, text, col) { if (!p.userData.bubble) { p.userData.bubble = bubble(); p.add(p.userData.bubble); p.userData.bubble.position.set(0, 2.5, 0); } say(p.userData.bubble, text, col); }
const OUCH = ['AU!', 'Hé! Doe normaal!', 'AAAH!', 'Waarom?!', 'Ik bel de politie!', 'Mijn bril!'];
function knockDown(p, dirX, dirZ, line) {
  const u = p.userData; u.down = 3.2; u.downDir = Math.atan2(dirX, dirZ);
  personBubble(p, line || OUCH[Math.floor(Math.random() * OUCH.length)], '#ff7a1a');
  beep(90, 0.18, 'square', 0.06); setTimeout(() => beep(60, 0.2, 'sawtooth', 0.05), 50);
}
// one person on the street gets hit (Maboota, bat or a bullet): they fall, get up complaining and run off
function streetTargets() { return [...walkers.filter((w) => !w.userData.walk.police && !w.userData.walk.flee), ...officers.map((o) => o.p)].filter((p) => p.visible && !(p.userData.down > 0)); }
function hitStreetPerson(p, f) {
  const off = officers.find((o) => o.p === p);
  if (off) { knockDown(p, f.x, f.z, ['Mijn bonnenboekje!', 'Au! Ik schrijf je op!', 'Dit is geen geldig vervoersbewijs!'][Math.floor(Math.random() * 3)]); hitOfficer(off); }
  else { knockDown(p, f.x, f.z); for (const w of walkers) if (w.userData.walk.police && w.position.distanceTo(player.position) < 10) personBubble(w, 'Hé! POLITIE! Doe normaal!', '#3a6aff'); }
}
function doHit() {
  const f = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  if (mission && mission.active) { mission.melee(f); return; }
  const targets = [...walkers.filter((w) => !w.userData.walk.police && !w.userData.walk.flee), ...officers.map((o) => o.p)];
  let any = false;
  for (const p of targets) {
    if (p.userData.down > 0 || !p.visible) continue;
    const d = p.position.clone().sub(player.position); d.y = 0; const L = d.length();
    if (L < 1.6 && d.normalize().dot(f) > 0.25) { any = true; hitStreetPerson(p, f); }
  }
  if (any) { /* screen thump */ camPos.y += 0.25; }
}
function updateMelee(dt) {
  if (swingT > 0) {
    swingT -= dt; const k = 1 - swingT / 0.38; const a = player.userData.arms[0];
    a.rotation.x = k < 0.35 ? -0.6 - k / 0.35 * 2.2 : -2.8 + (k - 0.35) / 0.65 * 3.6; a.rotation.z = -0.3;
    if (k > 0.5 && !swingHit) { swingHit = true; doHit(); }
    if (swingT <= 0) a.rotation.z = -0.07;
  } else if (state.armed) { const a = player.userData.arms[0]; a.rotation.x = Math.min(a.rotation.x, -0.25); }
  // people who got knocked over lie down, then get back up
  for (const p of [...walkers, ...officers.map((o) => o.p)]) {
    const u = p.userData; if (!(u.down > 0)) continue;
    u.down -= dt; const lying = u.down > 0.6 ? 1 : Math.max(0, u.down / 0.6);
    u.body.rotation.x = -1.5 * lying; u.body.position.y = 0.12 * lying;
    if (u.down <= 0) {
      u.body.rotation.x = 0; u.body.position.y = 0;
      if (u.walk) { u.walk.flee = true; u.walk.dir = Math.sign(p.position.x - player.position.x) || 1; personBubble(p, ['Ik bel de politie!', 'Gek! Gestoorde gek!', 'Mijn moeder hoort hiervan!', 'Dit pik ik niet!', 'Ik ga naar De Telegraaf!'][Math.floor(Math.random() * 5)], '#e8a33d'); }
    }
  }
}

// ================================================================== TICKET INSPECTORS (rare, drop a few Wilders)
const officers = [];
let officerT = 35;
const TICKET_Z = RC - 5.55; // on the pavement, right behind the parked cars
function spawnOfficer() {
  const from = Math.random() < 0.5 ? -1 : 1;
  const p = makePerson({ head: { skin: SKINS[Math.floor(Math.random() * SKINS.length)], hair: '#2a2a2a', brow: '#222', hairLine: 88, sideLine: 116, backLine: 150, mouth: 'smile', iris: '#3a3a3a' }, capColor: 0x6a1a2a, front: '#4a2a4ac', shirt: 0x4a2a4a, pants: 0x2a2a30, shoes: 0x111111, belly: 0.6, skin: 0xe0b090 });
  p.position.set(player.position.x + from * 22, 0, LANES.N[0]);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, 0.03), lam({ color: 0xffd23a })); pad.position.set(0, -0.62, 0.08); p.userData.arms[1].add(pad);
  const o = { p, state: 'walk', said: false, v: 1.3, car: null, t: 0, done: new Set() };
  officers.push(o); return o;
}
function nextCar(o) {
  let best = null, bd = 1e9;
  for (const cx of parkedN) { if (o.done.has(cx)) continue; const d = Math.abs(cx - o.p.position.x) + Math.abs(cx - player.position.x) * 0.3; if (d < bd) { bd = d; best = cx; } }
  o.car = best; o.state = best === null ? 'leave' : 'walk';
}
function hitOfficer(o) {
  if (o.state === 'flee') return;
  const n = 10 + Math.floor(Math.random() * 26);
  addMoney(n); toast('+W ' + n, 'The ticket inspector\'s petty cash.', 2); coins(o.p.position);
  o.state = 'flee';
}
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd23a, metalness: 0.9, roughness: 0.25, emissive: 0x402a00 });
const flying = [];
function coins(at) { for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 12), coinMat); c.position.set(at.x, 1.0, at.z); c.userData = { vx: (Math.random() - 0.5) * 3, vy: 4 + Math.random() * 2, vz: (Math.random() - 0.5) * 3, life: 1.3 }; scene.add(c); flying.push(c); } }
function updateOfficers(dt) {
  officerT -= dt;
  if (officerT < 0 && officers.length === 0 && state.step !== 'title') { spawnOfficer(); officerT = 60 + Math.random() * 60; }
  for (let i = officers.length - 1; i >= 0; i--) {
    const o = officers[i], p = o.p, u = p.userData;
    if (u.down > 0) continue;
    if (o.state === 'walk' && o.car === null) nextCar(o);
    if (o.state === 'walk') { // along the pavement to the spot behind the car, then step up to the kerb
      const tx = o.car + (Math.abs(o.car - p.position.x) > 0.4 ? 0 : 0), tz = Math.abs(o.car - p.position.x) > 0.3 ? LANES.N[0] : TICKET_Z;
      const d = new THREE.Vector3(tx - p.position.x, 0, tz - p.position.z), L = d.length();
      if (L < 0.08) { o.state = 'ticket'; o.t = 7 + Math.random() * 5; }
      else { d.normalize(); p.position.addScaledVector(d, Math.min(L, o.v * dt)); p.rotation.y = Math.atan2(d.x, d.z); animate(p, o.v, dt); }
    } else if (o.state === 'ticket') { // back to the pavement, facing the car, scribbling
      p.rotation.y += Math.atan2(Math.sin(0 - p.rotation.y), Math.cos(0 - p.rotation.y)) * Math.min(1, dt * 6);
      animate(p, 0, dt); const u2 = p.userData; u2.arms[1].rotation.x = -1.2 + Math.sin(performance.now() * 0.02) * 0.08; u2.arms[0].rotation.x = -0.9;
      if (!o.said && player.position.distanceTo(p.position) < 6) { o.said = true; personBubble(p, ['Foutparkeerder!', 'Bon. En nog een bon.', 'Vervoersbewijs? Nee? Ook een bon.'][Math.floor(Math.random() * 3)], '#ffd23a'); }
      o.t -= dt; if (o.t < 0) { o.done.add(o.car); o.said = false; nextCar(o); }
    } else { // flee or leave: run away from the player
      const d = p.position.x > player.position.x ? 1 : -1, sp = o.state === 'flee' ? 4.5 : 1.3;
      p.position.x += d * sp * dt; p.position.z += (LANES.N[1] - p.position.z) * Math.min(1, dt * 2); p.rotation.y = d > 0 ? Math.PI / 2 : -Math.PI / 2; animate(p, sp, dt);
    }
    if (Math.abs(p.position.x - player.position.x) > 40) { scene.remove(p); officers.splice(i, 1); }
    const bu = u.bubble && u.bubble.userData; if (bu && bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
  }
  for (let i = flying.length - 1; i >= 0; i--) { const c = flying[i], d = c.userData; d.life -= dt; d.vy -= 14 * dt; c.position.x += d.vx * dt; c.position.y = Math.max(0.03, c.position.y + d.vy * dt); c.position.z += d.vz * dt; c.rotation.x += dt * 10; if (d.life <= 0) { scene.remove(c); flying.splice(i, 1); } }
}

// ================================================================== SEAGULLS (they poop on people)
const gulls = [], poops = [];
function makeGull() {
  const g = new THREE.Group(), white = lam({ color: 0xf6f6f2 }), grey = lam({ color: 0xb8bcc4, side: THREE.DoubleSide });
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.35, 4, 8), white); b.rotation.z = Math.PI / 2; g.add(b);
  const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), white); h.position.set(0.3, 0.06, 0); g.add(h);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.14, 6), lam({ color: 0xf2c43a })); bk.rotation.z = -Math.PI / 2; bk.position.set(0.44, 0.05, 0); g.add(bk);
  const wings = [];
  for (const s of [1, -1]) { const w = new THREE.Group(); w.position.set(0.02, 0.06, s * 0.08); g.add(w); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.7), grey); m.rotation.x = -Math.PI / 2; m.position.z = s * 0.35; w.add(m); const tip = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), lam({ color: 0x1a1a1a, side: THREE.DoubleSide })); tip.rotation.x = -Math.PI / 2; tip.position.set(-0.08, 0.001, s * 0.62); w.add(tip); wings.push([w, s]); }
  g.scale.setScalar(1.1); scene.add(g);
  return { g, wings, a: Math.random() * 6, r: 9 + Math.random() * 5, h: 6.5 + Math.random() * 1.5, state: 'circle', t: 40 + Math.random() * 40, target: null, flap: Math.random() * 6 };
}
for (let i = 0; i < 2; i++) gulls.push(makeGull());
function squawk() { beep(1400, 0.08, 'sawtooth', 0.025); setTimeout(() => beep(1100, 0.12, 'sawtooth', 0.025), 90); setTimeout(() => beep(1300, 0.1, 'sawtooth', 0.02), 230); }
const splatMat = lam({ color: 0xf6f6ee });
// poop on Eddy's head stays until he changes location (travel); call clearPlayerSplats() on every location change
const playerSplats = [];
function clearPlayerSplats() { for (const sp of playerSplats) sp.parent && sp.parent.remove(sp); playerSplats.length = 0; }
function updateGulls(dt) {
  const P = player.position;
  for (const G of gulls) {
    G.flap += dt * (G.state === 'circle' ? 6 : 10);
    for (const [w, s] of G.wings) w.rotation.x = s * Math.sin(G.flap) * 0.6;
    let tx, ty, tz;
    if (G.state === 'circle') {
      G.a += dt * 0.35; tx = P.x + Math.cos(G.a) * G.r; tz = P.z + 2 + Math.sin(G.a) * G.r * 0.6; ty = G.h; G.t -= dt;
      if (G.t < 0) {
        const pool = walkers.filter((w) => w.position.distanceTo(P) < 14 && !(w.userData.down > 0));
        if (!pool.length) { G.t = 20; continue; }
        G.target = Math.random() < 0.1 ? player : pool[Math.floor(Math.random() * pool.length)];
        G.state = 'dive'; squawk();
      }
    } else if (G.state === 'dive') {
      const T = G.target.position; const lead = G.target === player ? 0 : G.target.userData.walk.dir * G.target.userData.walk.v * 0.9;
      tx = T.x + lead; tz = T.z; ty = 3.8;
      if (Math.hypot(G.g.position.x - tx, G.g.position.z - tz) < 0.6 && G.g.position.y < 4.4) {
        const pp = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), splatMat); pp.position.copy(G.g.position); pp.userData = { vy: 0, target: G.target }; scene.add(pp); poops.push(pp);
        G.state = 'leave'; G.t = 3; squawk();
      }
    } else { tx = G.g.position.x + 8; tz = G.g.position.z - 6; ty = G.h + 1; G.t -= dt; if (G.t < 0) { G.state = 'circle'; G.t = 60 + Math.random() * 60; } }
    const d = new THREE.Vector3(tx - G.g.position.x, ty - G.g.position.y, tz - G.g.position.z), L = d.length();
    const sp = G.state === 'dive' ? 9 : 6;
    if (L > 0.05) { G.g.position.addScaledVector(d.normalize(), Math.min(L, sp * dt)); G.g.rotation.y = Math.atan2(-d.z, d.x); }
  }
  for (let i = poops.length - 1; i >= 0; i--) {
    const pp = poops[i], u = pp.userData;
    if (u.ground !== undefined) { u.ground -= dt; if (u.ground < 0) { scene.remove(pp); poops.splice(i, 1); } continue; }
    u.vy -= 16 * dt; pp.position.y += u.vy * dt;
    const T = u.target, top = T === player ? 1.95 : 1.95 * (T.userData.body.scale.x || 1);
    if (pp.position.y < top && Math.hypot(pp.position.x - T.position.x, pp.position.z - T.position.z) < 0.7) {
      const sp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), splatMat); sp.scale.set(1.3, 0.35, 1.1); sp.position.set(0, 0.36, 0); T.userData.head.add(sp); if (T === player) playerSplats.push(sp); else setTimeout(() => sp.parent && sp.parent.remove(sp), 20000);
      if (T === player) toast('SPLAT!', 'A seagull got you. Lucky, they say.', 2.2); else { personBubble(T, ['GADVERDAMME!', 'Bah! Een meeuw!', 'Niet weer!', 'Mijn nieuwe jas!'][Math.floor(Math.random() * 4)], '#f6f6ee'); T.userData.walk.wait = 1.6; }
      beep(220, 0.05, 'sine', 0.05); scene.remove(pp); poops.splice(i, 1); continue;
    }
    if (pp.position.y <= 0.03) { pp.position.y = 0.03; pp.scale.set(2.2, 0.25, 2.2); u.ground = 12; }
  }
}

// ---- the canal: houseboats moored on the far side, a tour boat, a sloep, and ducks
const boats = [];
function houseboat(x, color, roofKind) {
  const b = new THREE.Group(); b.position.set(x, -1.1, CZ + 2.15); scene.add(b);
  box(12, 0.7, 3.2, lam({ color: 0x1e2a30 }), 0, 0.15, 0, b);
  box(12.1, 0.12, 3.3, lam({ color: 0xb03a2a }), 0, 0.52, 0, b, false);
  const wall = clapMat(color);
  box(9.2, 2.1, 2.7, wall, -0.6, 1.6, 0, b);
  for (let i = 0; i < 4; i++) { box(1.3, 0.95, 0.06, frameMat, -4.2 + i * 2.2, 1.85, -1.37, b, false); box(1.1, 0.75, 0.07, winMat, -4.2 + i * 2.2, 1.85, -1.39, b, false); }
  box(0.9, 1.7, 0.08, lam({ color: 0xf6f4ee }), 4.2, 1.4, 0.0, b, false).rotation.y = Math.PI / 2;
  if (roofKind === 'pitch') { const rs = new THREE.Shape(); rs.moveTo(-1.55, 0); rs.lineTo(0, 0.9); rs.lineTo(1.55, 0); const r = new THREE.Mesh(new THREE.ExtrudeGeometry(rs, { depth: 9.6, bevelEnabled: false }), roofMat); r.rotation.y = Math.PI / 2; r.position.set(-5.4, 2.65, 0); b.add(r); }
  else { box(9.6, 0.15, 3.0, lam({ color: 0xf6f4ee }), -0.6, 2.72, 0, b); for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35 + (i % 3) * 0.08, 0), lam({ color: [0x4f8a34, 0xd84a7a, 0x5a9a3c][i % 3], flatShading: true })); p.position.set(-4.6 + i * 1.6, 3.05, (i % 2 - 0.5) * 1.4); b.add(p); } }
  // deck: flower boxes, two chairs, a bike
  for (let i = 0; i < 5; i++) { box(0.5, 0.25, 0.25, lam({ color: 0x8a5a2a }), 4.5 + (i % 2) * 0.6, 0.72, -1.3 + i * 0.6, b); const fl = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 0), lam({ color: [0xff4f8a, 0xffd23a, 0xff7a2a][i % 3], flatShading: true })); fl.position.set(4.5 + (i % 2) * 0.6, 0.95, -1.3 + i * 0.6); b.add(fl); }
  for (const zz of [-0.5, 0.5]) box(0.45, 0.5, 0.45, lam({ color: 0xffffff }), 5.4, 0.85, zz, b);
  box(0.15, 0.6, 1.0, lam({ color: 0x2a4a7a }), -5.6, 0.95, -1.2, b);
  if (Math.abs(x) % 2 === 0) { const nb = neonMat(NEON[Math.abs(x) % 4]); box(9.2, 0.06, 0.06, nb, -0.6, 2.6, -1.38, b, false); }
  // moored: gangplank to the far quay
  box(1.0, 0.08, 1.2, mat.wood, 0, 1.0, 2.0, b);
  return b;
}
houseboat(-46, 0x2fb8b0, 'flat'); houseboat(-30, 0xff8fb8, 'pitch'); houseboat(-2, 0x9a86e0, 'flat'); houseboat(26, 0xffd86a, 'pitch'); houseboat(42, 0x7ad8b0, 'flat');
// rondvaartboot: long, low, glass roof; shuttles along the canal west of the bridge
const tour = new THREE.Group(); tour.position.set(-30, -1.1, CZ - 1.55); scene.add(tour);
{
  box(13, 0.6, 2.6, lam({ color: 0x1a2a5a }), 0, 0.1, 0, tour); box(13.1, 0.1, 2.7, lam({ color: 0xf6f4ee }), 0, 0.45, 0, tour, false);
  const nose = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.6, 16, 1, false, 0, Math.PI), lam({ color: 0x1a2a5a })); nose.position.set(6.5, 0.1, 0); tour.add(nose);
  box(10, 0.45, 2.4, lam({ color: 0xf6f4ee }), -0.6, 0.75, 0, tour);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 10, 18, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x9ad0ff, roughness: 0.05, metalness: 0.4, transparent: true, opacity: 0.55, side: THREE.DoubleSide }));
  glass.rotation.z = Math.PI / 2; glass.scale.set(1, 1, 0.42); glass.position.set(-0.6, 0.95, 0); tour.add(glass);
  for (let i = 0; i < 6; i++) { const p = passerBy(200 + i); scene.remove(p); tour.add(p); p.scale.setScalar(0.85); p.position.set(-4.5 + i * 1.6, 0.25, (i % 2 - 0.5) * 0.9); p.rotation.y = i % 2 ? 0 : Math.PI; }
  const ts = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.4), lam({ map: signTex([{ t: 'RONDVAART KAASLAND', size: 40 }], '#1a2a5a', '#ffd36b') })); ts.position.set(-0.6, 0.72, -1.22); ts.rotation.y = Math.PI; tour.add(ts);
  tour.userData = { dir: 1, v: 1.6 };
}
// sloep: a small wooden boat with three friends and a crate of beer
const sloep = new THREE.Group(); sloep.position.set(-12, -1.1, CZ - 0.2); scene.add(sloep);
{
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 5, 14, 1, false, Math.PI / 2, Math.PI), mat.wood); hull.rotation.z = Math.PI / 2; hull.scale.set(1, 1, 0.6); hull.position.y = 0.45; sloep.add(hull);
  box(5, 0.08, 1.75, lam({ color: 0x6a3a1a }), 0, 0.45, 0, sloep, false);
  for (let i = 0; i < 3; i++) { const p = passerBy(300 + i); scene.remove(p); sloep.add(p); p.scale.setScalar(0.8); p.position.set(-1.4 + i * 1.3, 0.05, 0); p.rotation.y = i === 1 ? Math.PI / 2 : -Math.PI / 2; }
  box(0.5, 0.35, 0.35, lam({ color: 0xffd23a }), 1.9, 0.65, 0, sloep);
  sloep.userData = { dir: -1, v: 2.2 }; sloep.rotation.y = Math.PI;
}
const ducks = [];
for (let i = 0; i < 18; i++) {
  const d = new THREE.Group(), male = i % 3 === 0, farm = i % 5 === 2, scale = (i % 4 === 3 ? 0.6 : 1) * 1.35;
  const bodyM = lam({ color: farm ? 0xfaf8f0 : male ? 0x8a8478 : 0x7a5a3a });
  const b0 = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), bodyM); b0.scale.set(1.5, 0.75, 0.95); b0.position.y = 0.08; d.add(b0);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 6), bodyM); tail.rotation.z = Math.PI / 2 + 0.5; tail.position.set(-0.38, 0.14, 0); d.add(tail);
  const hd = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), lam({ color: farm ? 0xfaf8f0 : male ? 0x1f7a3a : 0x6a4a2a })); hd.position.set(0.28, 0.32, 0); d.add(hd);
  if (male && !farm) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 4, 10), lam({ color: 0xffffff })); ring.rotation.x = Math.PI / 2; ring.position.set(0.25, 0.2, 0); d.add(ring); }
  const bk = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 0.1), lam({ color: 0xf2a020 })); bk.position.set(0.43, 0.3, 0); d.add(bk);
  d.scale.setScalar(scale); d.position.set(-50 + i * 6 + (i % 3), -1.08, CZ - 2.8 + (i % 4) * 0.5); d.rotation.y = Math.random() * 6;
  d.userData = { heading: d.rotation.y, t: Math.random() * 5, baby: scale < 1 };
  scene.add(d); ducks.push(d);
}
function updateCanal(dt) {
  for (const bt of [tour, sloep]) {
    const u = bt.userData; bt.position.x += u.v * u.dir * dt;
    const lo = bt === tour ? -55 : -50, hi = bt === tour ? 8 : 9;
    if (bt.position.x > hi) u.dir = -1; if (bt.position.x < lo) u.dir = 1;
    bt.rotation.y += ((u.dir > 0 ? 0 : Math.PI) - bt.rotation.y) * Math.min(1, dt * 0.8);
    bt.position.y = -1.1 + Math.sin(performance.now() * 0.0015 + bt.position.x) * 0.03;
  }
  for (const d of ducks) {
    const u = d.userData; u.t -= dt;
    if (u.t < 0) { u.heading += (Math.random() - 0.5) * 2.2; u.t = 1.5 + Math.random() * 3; }
    if (d.position.z < CZ - 3.2) u.heading = Math.PI / 2 * 0.8 * (Math.random() < 0.5 ? 1 : -1) + Math.PI / 2;
    if (d.position.z > CZ - 0.6) u.heading = -Math.PI / 2;
    if (Math.abs(d.position.x) > 50) u.heading = d.position.x > 0 ? Math.PI : 0;
    d.rotation.y += Math.atan2(Math.sin(-u.heading - d.rotation.y), Math.cos(-u.heading - d.rotation.y)) * Math.min(1, dt * 2);
    const sp = 0.35 * (u.baby ? 1.2 : 1);
    d.position.x += Math.cos(-d.rotation.y) * sp * dt; d.position.z += Math.sin(-d.rotation.y) * sp * dt;
    d.position.y = -1.08 + Math.sin(performance.now() * 0.004 + d.position.x * 3) * 0.015;
  }
}

function updateStreet(dt) {
  const P = player.position;
  for (const c of traffic) {
    const u = c.userData;
    // brake for the player (or anyone) in our lane ahead, and for the car in front
    let free = 99;
    const ahead = (x, z, half) => { if (Math.abs(z - c.position.z) < 1.5) { const d = (x - c.position.x) * u.dir - u.half - half; if (d > -1) free = Math.min(free, d); } };
    ahead(P.x, P.z, 0.4);
    const byPlayer = free < 4;
    for (const o of traffic) if (o !== c && o.userData.dir === u.dir) ahead(o.position.x, o.position.z, o.userData.half);
    // blocked by you: honk and shout; hit you if you jump in front at speed
    if (byPlayer && u.v < 2) { u.blockT += dt; u.honkT -= dt; if (u.blockT > 0.5 && u.honkT <= 0) { honk(); say(u.bubble, DRIVER_SHOUTS[Math.floor(Math.random() * DRIVER_SHOUTS.length)]); u.honkT = 2.6; } }
    else u.blockT = 0;
    if (u.v > 2.5 && Math.abs(P.z - c.position.z) < 1.3 && Math.abs(P.x - c.position.x) < u.half + 0.45 && P.y < 0.3)
      bump(u.dir * (3 + u.v * 0.9), Math.sign(P.z - c.position.z || 1) * 5, 6.5, 'You bounced off a ' + c.userData.model + '.');
    const want = free < 2.5 ? 0 : free < 9 ? u.vmax * (free - 2.5) / 6.5 : u.vmax;
    u.v += Math.max(-12 * dt, Math.min(4 * dt, want - u.v));
    c.position.x += u.v * u.dir * dt;
    if (c.position.x * u.dir > 68) c.position.x = -68 * u.dir;
    const bu = u.bubble.userData; if (bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
    const sd = u.solid; sd.off = knock.t > 0; sd.minx = c.position.x - u.half; sd.maxx = c.position.x + u.half; sd.minz = c.position.z - 0.95; sd.maxz = c.position.z + 0.95;
  }
  for (const b of cyclists) {
    const u = b.userData;
    let free = 99, byPlayer = false;
    if (Math.abs(P.z - b.position.z) < 0.9) { const d = (P.x - b.position.x) * u.dir - u.len - 0.3; if (d > -0.8) { free = Math.min(free, d); byPlayer = d < 2.5; } }
    for (const o of cyclists) if (o !== b && o.userData.dir === u.dir) { const d = (o.position.x - b.position.x) * u.dir - u.len - o.userData.len - 0.6; if (d > -1) free = Math.min(free, d); }
    const want = free < 0.8 ? 0 : free < 5 ? u.vmax * free / 5 : u.vmax;
    u.v += Math.max(-10 * dt, Math.min(3 * dt, want - u.v));
    if (byPlayer && u.v < 0.6) { u.shoutT -= dt; if (u.shoutT <= 0) { bell(); say(u.bubble, BIKE_SHOUTS[Math.floor(Math.random() * BIKE_SHOUTS.length)], '#2fb8a8'); u.shoutT = 3; } }
    if (u.v > 2 && Math.abs(P.z - b.position.z) < 0.6 && Math.abs(P.x - b.position.x) < u.len + 0.3 && P.y < 0.3) bump(u.dir * 4, Math.sign(P.z - b.position.z || 1) * 3, 4, 'Run over by a ' + ['bike', 'vierfiets', 'tricycle', 'tall bike', 'bakfiets full of Gouda', 'mini bike', 'penny-farthing', 'double-decker bike', 'extra-tall bike', 'four-man tower bike'][u.kind] + '.');
    b.position.x += u.v * u.dir * dt;
    if (b.position.x * u.dir > 66) b.position.x = -66 * u.dir;
    for (const w of b.children) if (w.userData.r) w.rotation.z -= u.v * dt / w.userData.r;
    u.phase += u.v * dt * 1.6;
    u.riders.forEach((r, k) => { const ru = r.userData, ph = u.phase + k * 0.7; const base = ru.squat ? -1.55 : -0.9, amp = ru.squat ? 0.25 : 0.5; ru.legs[0].rotation.x = base + Math.sin(ph * (ru.squat ? 2 : 1)) * amp; ru.legs[1].rotation.x = base - Math.sin(ph * (ru.squat ? 2 : 1)) * amp; });
    const bu = u.bubble.userData; if (bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
  }
  for (const w of walkers) {
    const u = w.userData.walk, cp = u.comp;
    let moving = false;
    const bu = w.userData.bubble && w.userData.bubble.userData; if (bu && bu.life > 0) { bu.life -= dt; if (bu.life <= 0) w.userData.bubble.visible = false; }
    if (w.userData.down > 0) continue;
    if (u.flee) { // running off the map; comes back later as an ordinary passer-by
      w.position.x += u.dir * 4.6 * dt; w.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2; animate(w, 4.6, dt);
      if (Math.abs(w.position.x) > 48) { u.flee = false; w.position.x = -Math.sign(w.position.x) * 44; u.wait = 20 + Math.random() * 30; }
      if (cp) { cp.obj.position.x += (w.position.x + u.dir * cp.ahead - cp.obj.position.x) * Math.min(1, dt * 6); cp.obj.rotation.y = cp.type === 'kid' ? w.rotation.y : (u.dir > 0 ? 0 : Math.PI); if (cp.type === 'kid') animate(cp.obj, 4.6, dt); if (cp.type === 'dog' && cp.line) { const a = cp.line.geometry.attributes.position, hand = w.userData.arms[0].localToWorld(new THREE.Vector3(0, -0.66, 0.03)); a.setXYZ(0, hand.x, hand.y, hand.z); a.setXYZ(1, cp.obj.position.x, 0.45 * cp.obj.scale.x, cp.obj.position.z); a.needsUpdate = true; } }
      continue;
    }
    if (u.wait > 0) u.wait -= dt;
    else {
      const lane = LANES[u.side][u.dir > 0 ? 0 : 1], reach = 1.0 + (cp ? cp.ahead : 0);
      let blocked = false;
      const near = (x, z, r) => { const dx = (x - w.position.x) * u.dir, dz = Math.abs(z - w.position.z); return dx > 0 && dx < r && dz < 0.6; };
      if (near(P.x, P.z, reach) || near(dad.position.x, dad.position.z, reach)) blocked = true;
      for (const o of walkers) if (o !== w && near(o.position.x, o.position.z, reach - 0.1)) blocked = true;
      if (blocked) { u.blocked += dt; if (u.blocked > 1.6) { u.dir *= -1; u.blocked = 0; } }
      else {
        u.blocked = 0; moving = true;
        w.position.x += u.v * u.dir * dt; w.position.z += (lane - w.position.z) * Math.min(1, dt * 2);
        w.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
        if (w.position.x * u.dir > 31) { u.dir *= -1; u.wait = 0.5 + Math.random(); }
      }
    }
    animate(w, moving ? u.v : 0, dt);
    if (cp) { if (cp.type === 'stroller') { w.userData.arms[0].rotation.x = w.userData.arms[1].rotation.x = -0.9; }
      const sideSign = u.side === 'N' ? 1 : -1; // companions walk on the kerb side
      const tx = w.position.x + u.dir * cp.ahead, tz = w.position.z + sideSign * cp.off;
      cp.obj.position.x += (tx - cp.obj.position.x) * Math.min(1, dt * 6); cp.obj.position.z += (tz - cp.obj.position.z) * Math.min(1, dt * 6);
      cp.obj.rotation.y = cp.type === 'kid' ? w.rotation.y : (u.dir > 0 ? 0 : Math.PI);
      if (cp.type === 'kid') animate(cp.obj, moving ? u.v * 1.3 : 0, dt);
      if (cp.type === 'dog') {
        const du = cp.obj.userData; du.ph += dt * (moving ? 12 : 3);
        du.legs.forEach((l, k) => { l.rotation.z = moving ? Math.sin(du.ph + (k % 2 ? Math.PI : 0) + (k > 1 ? 0.6 : 0)) * 0.5 : 0; });
        du.tail.rotation.x = Math.sin(du.ph * 1.5) * 0.6;
        const a = cp.line.geometry.attributes.position, hand = w.userData.arms[0].localToWorld(new THREE.Vector3(0, -0.66, 0.03));
        a.setXYZ(0, hand.x, hand.y, hand.z); a.setXYZ(1, cp.obj.position.x + (u.dir > 0 ? 0.25 : -0.25) * cp.obj.scale.x, 0.45 * cp.obj.scale.x, cp.obj.position.z); a.needsUpdate = true;
      }
    }
  }
}

// ------------------------------------------------------------------ loop
let current = null;
const clock = new THREE.Clock();
const occl = new THREE.Raycaster();
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
let incomeT = 0, lastStep = state.step;
function tick() {
  if (isPaused()) { clock.getDelta(); if (oofDrive.active) post.render(oofDrive.scene, oofDrive.camera); else post.render(scene, camera); requestAnimationFrame(tick); return; }
  if (oofDrive.active) { oofDrive.update(Math.min(clock.getDelta(), 0.05)); post.render(oofDrive.scene, oofDrive.camera); requestAnimationFrame(tick); return; }
  if (state.step !== lastStep) { lastStep = state.step; writeSave(); }
  let dt = Math.min(clock.getDelta(), 0.05);
  if (mission && mission.active) dt = mission.hitstop(dt); // Neon Vice hitstop on kills
  // movement (screen-relative: camera looks north)
  let mx = 0, mz = 0;
  const mOn = mission && mission.active;
  if (!state.inDialogue && !state.inPC && state.step !== 'title' && !(mOn && mission.frozen()) && !mission.invOpen()) {
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
    mx += virt.mx; mz += virt.mz; // controller / touch stick
  }
  if (knock.t > 0) { mx = mz = 0; }
  let len = Math.hypot(mx, mz); if (len < 0.15) { mx = mz = 0; len = 0; }
  const speed = len ? (keys.ShiftLeft || keys.ShiftRight ? 7.5 : 4.2) : 0;
  if (knock.t > 0) {
    knock.t -= dt;
    player.position.x += knock.vx * dt; player.position.z += knock.vz * dt;
    knock.vx *= 1 - dt * 2.5; knock.vz *= 1 - dt * 2.5;
    knock.vy -= 22 * dt; player.position.y = Math.max(0, player.position.y + knock.vy * dt);
    if (player.position.y === 0 && knock.vy < 0) knock.vy = Math.abs(knock.vy) > 3 ? -knock.vy * 0.35 : 0;
    player.rotation.y += dt * 14 * Math.min(1, knock.t * 2);
    if (knock.t <= 0) player.position.y = 0;
  }
  if (len) {
    player.position.x += mx / len * speed * dt; player.position.z += mz / len * speed * dt;
    const target = mission && mission.aiming() ? player.rotation.y : Math.atan2(mx, mz);
    let dr = target - player.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    player.rotation.y += dr * Math.min(1, dt * 14);
  }
  collide(player.position, 0.38);
  animate(player, speed, dt);
  updateMelee(dt);
  // dad faces the player when close
  const toP = Math.atan2(player.position.x - dad.position.x, player.position.z - dad.position.z);
  if (dad.userData.walkTo && dad.userData.walkTo.length) { // walking out through the shutter
    const t = dad.userData.walkTo[0], d = t.clone().sub(dad.position); d.y = 0; const L = d.length();
    if (L < 0.08) { dad.userData.walkTo.shift(); if (!dad.userData.walkTo.length) dadOutside(); }
    else if (shutterOpen > 0.6 || dad.userData.walkTo.length < 3) { const st = Math.min(L, 2.2 * dt); dad.position.addScaledVector(d.normalize(), st); dad.rotation.y = Math.atan2(d.x, d.z); animate(dad, 2.2, dt); }
  } else if (player.position.distanceTo(dad.position) < 6) { let dr = toP - dad.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); dad.rotation.y += dr * Math.min(1, dt * 4); }
  if (dad.userData.leaving && dad.visible) {
    dad.rotation.y = Math.PI / 2; dad.position.x -= 2.4 * dt; dad.position.z += (-5.3 - dad.position.z) * dt;
    dad.rotation.y = -Math.PI / 2; dadSolid.off = true; animate(dad, 2.4, dt);
    if (dad.position.x < -36) dad.visible = false;
  } else animate(dad, 0, dt);
  const toR = Math.atan2(player.position.x - russian.position.x, player.position.z - russian.position.z);
  if (isInShop(player.position)) { let dr = toR - russian.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); russian.rotation.y += dr * Math.min(1, dt * 4); }
  animate(russian, 0, dt);
  if (!mOn) { updateStreet(dt); updateCanal(dt); updateOfficers(dt); updateGulls(dt); mission.street(dt); } else mission.update(dt);
  const inJ = !mOn && updateJoint(dt);
  // naknikim walk to the table, then stir
  for (const n of naknikim) {
    const u = n.userData;
    if (u.walking) {
      const via = n.position.z > -7.5 ? new THREE.Vector3((WH.doorX0 + WH.doorX1) / 2, 0, -9) : u.target;
      const d = via.clone().sub(n.position); d.y = 0; const L = d.length();
      if (L < 0.15 && via === u.target) { u.walking = false; n.rotation.y = Math.atan2(-4.6 - n.position.x, -12.6 - n.position.z); }
      else { d.normalize(); n.position.addScaledVector(d, Math.min(L, 2.6 * dt)); n.rotation.y = Math.atan2(d.x, d.z); }
      animate(n, u.walking ? 2.6 : 0, dt);
    } else {
      u.phase += dt * 7; u.arms[1].rotation.x = -1.2 + Math.sin(u.phase) * 0.35; u.arms[0].rotation.x = -0.9 + Math.cos(u.phase) * 0.3;
      u.body.position.y = Math.abs(Math.sin(u.phase * 0.5)) * 0.03;
    }
  }
  if (state.table) spiceInBowl.rotation.y += dt * (state.naknik ? 2 : 0);
  // a finished mission ends the market day (checked back in the hub, so the toast doesn't cover the results screen)
  if (!mission.active && !state.inDialogue) econ.update();
  if (npcs) npcs.update(dt);
  // passive income
  if (state.income > 0) {
    incomeT += dt;
    if (incomeT > 6) { incomeT = 0; addMoney(state.income); }
  }
  ui.income.textContent = state.income ? `+W ${state.income} / 6 sec · ${state.naknik} Naknik${state.naknik > 1 ? 'im' : ''}` : '';
  // money counter
  if (state.shown !== state.money) { const d = state.money - state.shown; state.shown += Math.sign(d) * Math.max(1, Math.ceil(Math.abs(d) * dt * 4)); if (Math.sign(state.money - state.shown) !== Math.sign(d)) state.shown = state.money; }
  ui.money.textContent = 'W ' + String(Math.max(0, state.shown)).padStart(7, '0');
  // shutter
  shutterOpen += (shutterTarget - shutterOpen) * Math.min(1, dt * 1.5);
  shutter.position.y = 1.7 + shutterOpen * 3.1; shutter.scale.y = 1 - shutterOpen * 0.9;
  // inside the warehouse: hide roof + front wall, switch on lights
  const inside = isInside(player.position) && state.step !== 'title'; // the title backdrop shows the street with the roof on
  roof.visible = !inside; frontHigh.visible = !inside; shutter.visible = !inside || shutterOpen < 0.5;
  const li = inside ? 2.2 : 0; inLight1.intensity += (li - inLight1.intensity) * dt * 4; inLight2.intensity = inLight1.intensity;
  // pawnshop: door swings open, roof + façade hide while you're inside, bunker lights come on
  shopDoorOpen += (shopDoorTarget - shopDoorOpen) * Math.min(1, dt * 3); shopDoor.rotation.y = shopDoorOpen * 1.7;
  const inShop = isInShop(player.position);
  shopRoof.visible = !inShop; shopFrontHigh.visible = !inShop;
  for (const [l, k] of shopLights) l.intensity += ((inShop ? k : 0) - l.intensity) * Math.min(1, dt * 4);
  // interaction prompt
  current = null; let best = 1e9;
  for (const it of inter) {
    if (it.enabled && !it.enabled()) continue;
    const d = it.pos().distanceTo(player.position);
    if (d < it.r && d < best) { best = d; current = it; }
  }
  if (current && !state.inDialogue && !state.inPC && state.step !== 'title') { ui.prompt.style.display = 'block'; ui.prompt.innerHTML = `<b style="color:#ffd36b">[${glyph('E')}]</b> ${current.label()}`; }
  else ui.prompt.style.display = 'none';
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) ui.toast.style.display = 'none'; }
  // camera: Neon Vice-style high top-down, eased
  const off = new THREE.Vector3(0, 12.5 * zoom, 6 * zoom);
  if (inside || inShop || inJ) off.set(0, 14 * zoom, 4.5 * zoom);
  const jc = new THREE.Vector3(((JS.x0 + JS.x1) / 2) * 0.4 + player.position.x * 0.6, 0, -11.5 * 0.5 + player.position.z * 0.5);
  camPos.lerp((inJ ? jc.clone() : inShop ? new THREE.Vector3((PS.x0 + PS.x1) / 2 * 0.4 + player.position.x * 0.6, 0, -12.2 * 0.5 + player.position.z * 0.5) : player.position.clone()).add(off), Math.min(1, dt * 4));
  const lookAt = inJ ? jc.clone().setY(0.8) : inShop ? new THREE.Vector3((PS.x0 + PS.x1) / 2 * 0.4 + player.position.x * 0.6, 0.8, -12.2 * 0.5 + player.position.z * 0.5) : player.position.clone().add(new THREE.Vector3(0, 0.8, 0));
  if (state.step === 'title') { const tt = performance.now() * 0.001; camPos.set(-14 + Math.sin(tt * 0.045) * 16, 5.2 + Math.sin(tt * 0.11) * 0.6, 7.5); camLook.set(camPos.x * 0.85 + 2, 1.6, -7); }
  else if (mOn) { const mc = mission.cameraFor(zoom); if (mission.snap) { camPos.copy(mc.pos); mission.snap = false; } camPos.lerp(mc.pos, Math.min(1, dt * 5)); camLook.copy(camPos).sub(mc.pos).add(mc.look); }
  else camLook.lerp(lookAt, Math.min(1, dt * 6));
  camera.position.copy(camPos); camera.lookAt(camLook);
  sun.position.set(player.position.x - 18, 30, player.position.z + 14); sun.target.position.copy(player.position);
  water.material.color.setHSL(0.5, 0.55, 0.2 + Math.sin(performance.now() * 0.001) * 0.01);
  $('clock').textContent = new Date().toTimeString().slice(0, 5);
  // fade houses that stand between the camera and the player (Neon Vice-style cutaway)
  occl.set(camera.position, player.position.clone().add(new THREE.Vector3(0, 1, 0)).sub(camera.position).normalize());
  occl.far = camera.position.distanceTo(player.position);
  const hits = new Set(); for (const h of occl.intersectObjects(fadeables, true)) { let o = h.object; while (o && !o.userData.fade) o = o.parent; if (o) hits.add(o); }
  for (const g of fadeables) {
    const tgt = hits.has(g) ? 0.22 : 1;
    if (Math.abs(g.userData.fade - tgt) > 0.01) {
      g.userData.fade += (tgt - g.userData.fade) * Math.min(1, dt * 8);
      g.traverse((c) => { if (c.isMesh) { c.material.opacity = g.userData.fade * (c.material.userData.baseOp ?? 1); c.material.depthWrite = g.userData.fade > 0.95 && c.material.userData.baseOp === undefined; } });
    }
  }
  post.render(scene, camera);
  requestAnimationFrame(tick);
}
camPos.copy(player.position).add(new THREE.Vector3(0, 12.5, 6)); camLook.copy(player.position);
updateObjective();
mission = initMission({ THREE, scene, camera, player, state, box, cyl, lam, solid, solids, collide, makePerson, animate, toast, beep, addMoney,
  neonTube, neonRect, signTex, canvasTex, car, $, maboota, equip, swing, bubble, say, addInteract, clearPlayerSplats, sun, hemi, canvas,
  makeVan: () => oof.clone(true), save: () => writeSave(), kitChanged: () => kitText(), shop: SHOP, streetTargets, streetHit: hitStreetPerson, setBounds: (b) => { BOUNDS.cur = b; }, updateObjective, setArea: (t) => { $('area').textContent = t; } });
initInput({ state, getMission: () => mission, canvas, beep, toast, gfx: post });
// top-down drive to the next district (js/drive.js): from the van map once Kipkruidenkwartier is yours
const oofDrive = initDrive({ THREE, renderer, canvasTex, signTex, beep, virt, isPaused });
let driveMission = null; // the Lampas mission the drive is heading for (null: a scouting run)
function startDrive(id = null) { driveMission = id; const j = id && JOINTS.find((x) => x[1] === id); oofDrive.start({ from: 'Kipkruidenkwartier', to: j ? j[0] : 'Oud-Vettenburg', target: j && j[4], mission: id ? mission.LEVELS[id].text.banner[0] + ' is just round the corner.' : null, onDone: afterDrive }); }
function afterDrive(res) {
  clearPlayerSplats(); clock.getDelta();
  if (res.arrived) {
    addMoney(res.pay); state.drives = state.drives || {};
    state.drives.oudvettenburg = Math.min(state.drives.oudvettenburg ?? 1e9, Math.round(res.time));
    if (driveMission) { const id = driveMission; driveMission = null; econ.driveDone(true); econ.advance('on the road'); writeSave(); mission.enter(id, owns(id) ? { remix: { ...mission.remixFor(id, econ.ensure().day), retake: econ.isRetaken(id) } } : {}); return; } // arrived: straight into the mission
    toast('BACK AT THE WAREHOUSE', `Oud-Vettenburg scouted. +W ${res.pay}.`, 4);
  } else { driveMission = null; toast('BACK AT THE WAREHOUSE', 'The Oofmobiel limps home on three wheels.', 3); }
  econ.driveDone(!!res.arrived); // a scout job pays out
  setTimeout(() => { econ.advance('on the road'); writeSave(); }, 4200); // every outing is a market day
  writeSave(); updateObjective();
}
deviceHints();
npcs = initNpcs({ THREE, scene, makePerson: (o) => makePS2Person(lookFromPerson(o, HEADS), { scale: o.scale, scene }), addInteract, dialogue, choice, toast, state, econ, player, addMoney, animate, solid, owns, mission, sit, rankOf, save: () => writeSave() });
// test hooks: __sme.startLevel('kroketkade') jumps into a mission (skips Chapter 0), __sme.own('spekbuurt', 'kroketkade') marks territories owned
const startLevel = (id) => { if (!['russian', 'free'].includes(state.step)) state.step = 'free'; if (!state.kit.includes('maboota')) giveMaboota(); closePC(); mission.enter(id); };
const ownTerritories = (...ids) => { for (const id of ids) mission.setOwned(id); updateObjective(); writeSave(); };
window.__sme = { charStats, post, startLevel, startDrive, oofDrive, own: ownTerritories, checkDistrict, LEVELS: mission.LEVELS, writeSave, readSave, clearSave, SAVE_KEY, scene, camera, renderer, makeBike, mission, BOUNDS,  clearPlayerSplats, playerSplats, nabil, schmatzel, talkNabil, talkSchmatzel, openJointDoor, JS, giveMaboota, equip, swing, spawnOfficer, officers, gulls, ducks, knock, bump, say, traffic, cyclists, walkers, openShopDoor, PS, oof, talkRussian, russian, openShop, paintHead, HEADS, setZoom: (z) => { zoom = z; }, dad, player, state, junkDefs, talkDad, openPC, closePC, nextLine, sellItem, buyTable, hireNaknik, econ, get npcs() { return npcs; } };
tick();
