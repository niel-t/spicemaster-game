// Spice Master Eddy: Chapter 0, De Natte Worst.
// Neon Vice-style top-down browser game: three.js, PS2-style low-poly people with photo faces.
import * as THREE from '../vendor/three.module.min.js';
import { Music } from './music.js';
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

const scene = new THREE.Scene();
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
scene.add(new THREE.HemisphereLight(0xffe0f0, 0x6a5a80, 1.25));
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
      g.font = `900 ${l.size || 46}px Arial Black, Impact, sans-serif`;
      g.fillStyle = l.color || fg;
      g.fillText(l.t, w / 2, h * (lines.length === 1 ? 0.52 : (i + 0.75) / (lines.length + 0.5)));
    });
  });
}

// ------------------------------------------------------------------ collision
const solids = []; // {minx,maxx,minz,maxz}
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
  p.x = Math.max(-33, Math.min(33, p.x));
  p.z = Math.max(-27.5, Math.min(10.6, p.z));
}

// ------------------------------------------------------------------ world: ground, street, canal
// Cross-section (north → south): facades z=-7 | pavement | kerb -5.1 | parking -5..-3 | lanes -3..3 | parking 3..5 |
// kerb 5.1 | red two-way fietspad 5.2..7.6 | pavement + trees 7.6..10.9 | quay 11.1 | canal (CZ = 15)
const ROAD = { pN: -5.0, lane: 3.0, pS: 5.0, bike0: 5.2, bike1: 7.6, walk1: 10.9 };
const CZ = 15;
const groundMat = lam({ map: tex('paving.jpg', 40, 20), color: 0xd8d2c4 });
for (const [z0, z1] of [[-70, CZ - 3.75], [CZ + 3.75, 70]]) {
  const g = new THREE.Mesh(new THREE.PlaneGeometry(140, z1 - z0), groundMat);
  g.rotation.x = -Math.PI / 2; g.position.z = (z0 + z1) / 2; g.receiveShadow = true; scene.add(g);
}
function strip(z0, z1, m, y = 0.02) {
  const p = new THREE.Mesh(new THREE.PlaneGeometry(140, z1 - z0), m);
  p.rotation.x = -Math.PI / 2; p.position.set(0, y, (z0 + z1) / 2); p.receiveShadow = true; scene.add(p); return p;
}
strip(-ROAD.lane, ROAD.lane, lam({ map: tex('asphalt.jpg', 30, 3), color: 0xb0b0b0 }));
// parking bays: grey klinkers with white bay lines
const bayMat = lam({ map: tex('paving.jpg', 70, 1), color: 0x9a968e });
strip(ROAD.pN, -ROAD.lane, bayMat, 0.022); strip(ROAD.lane, ROAD.pS, bayMat, 0.022);
for (let x = -66; x < 66; x += 5.6) for (const z of [-4, 4]) box(0.1, 0.01, 1.9, mat.white, x, 0.032, z, scene, false);
for (const z of [-ROAD.lane, ROAD.lane]) box(140, 0.01, 0.1, mat.white, 0, 0.032, z, scene, false);
// centre line (dashed, Dutch style) — skipped at the zebra
for (let x = -66; x < 66; x += 4) if (Math.abs(x + 18) > 3) box(2, 0.01, 0.14, mat.white, x, 0.035, 0, scene, false);
// zebra crossing spans the lanes and the bays
for (let i = 0; i < 10; i++) box(3.2, 0.012, 0.5, mat.white, -18, 0.036, -4.3 + i * 0.96, scene, false);
// kerbs
const kerbMat = pbr('concrete.jpg', 60, 1, 0xb8b4ac);
for (const z of [-5.1, 5.1]) box(140, 0.16, 0.18, kerbMat, 0, 0.08, z, scene, false);
// pavements
for (const [z0, z1] of [[-7, -5.2], [ROAD.bike1, ROAD.walk1]]) strip(z0, z1, pbr('tiles_stone.jpg', 46, (z1 - z0) / 3, 0xc9c4ba, 0.85, 0.6), 0.012);
// fietspad: red asphalt with a dashed white centre line and bike symbols
strip(ROAD.bike0, ROAD.bike1, lam({ map: tex('asphalt.jpg', 30, 1), color: 0xb24a3a }), 0.016);
for (let x = -66; x < 66; x += 3) box(1.2, 0.01, 0.1, mat.white, x, 0.03, (ROAD.bike0 + ROAD.bike1) / 2, scene, false);
const bikeSym = canvasTex(128, 128, (g) => { g.strokeStyle = '#fff'; g.lineWidth = 7; for (const x of [34, 94]) { g.beginPath(); g.arc(x, 82, 22, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(34, 82); g.lineTo(58, 50); g.lineTo(94, 50); g.lineTo(94, 82); g.moveTo(58, 50); g.lineTo(70, 82); g.lineTo(94, 50); g.moveTo(52, 40); g.lineTo(66, 40); g.moveTo(94, 50); g.lineTo(88, 34); g.stroke(); });
for (let x = -60; x < 60; x += 20) for (const [z, r] of [[5.8, 0], [7.0, Math.PI]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), lam({ map: bikeSym, transparent: true })); p.rotation.set(-Math.PI / 2, 0, r - Math.PI / 2); p.position.set(x, 0.034, z); scene.add(p); }
box(140, 0.08, 0.12, kerbMat, 0, 0.04, ROAD.bike1, scene, false);

// canal along the south side of the street (Amsterdam-style)
const water = new THREE.Mesh(new THREE.PlaneGeometry(140, 7.5), new THREE.MeshPhongMaterial({ color: 0x2e5a5c, shininess: 80, specular: 0x88aaaa }));
water.rotation.x = -Math.PI / 2; water.position.set(0, -1.1, CZ); scene.add(water);
const quayMat = lam({ map: tex('brick_red.jpg', 60, 1), color: 0x9a7a6a });
const q1 = new THREE.Mesh(new THREE.PlaneGeometry(140, 1.2), quayMat); q1.position.set(0, -0.55, CZ - 3.74); scene.add(q1);
const q2 = new THREE.Mesh(new THREE.PlaneGeometry(140, 1.2), quayMat); q2.position.set(0, -0.55, CZ + 3.74); q2.rotation.y = Math.PI; scene.add(q2);
box(140, 0.14, 0.4, pbr('concrete.jpg', 60, 1, 0xa8a49c), 0, 0.07, CZ - 3.9, scene, false);
for (const [x, c] of [[-20, 0x2b4a6b], [4, 0x7a2a22], [24, 0x2d2d2d], [-6, 0x3a5a3a]]) {
  const b = new THREE.Group(); b.position.set(x, -1.0, CZ + (x % 3 === 0 ? 1.6 : -1.4)); scene.add(b);
  box(6.5, 0.6, 2.1, lam({ color: c }), 0, 0.2, 0, b);
  box(2.4, 0.7, 1.6, lam({ color: 0xe8e2d0 }), -1.2, 0.8, 0, b);
}
// bridge over the canal
box(5, 0.4, 7.8, lam({ map: tex('paving.jpg', 2, 3) }), 14, -0.15, CZ);
for (const x of [11.6, 16.4]) box(0.2, 0.9, 7.8, lam({ color: 0x2a2a2a }), x, 0.45, CZ);
// trees between the fietspad and the pavement
function tree(x, z, s = 1) {
  cyl(0.12 * s, 0.16 * s, 2.4 * s, lam({ color: 0x5a4030 }), x, 1.2 * s, z);
  const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5 * s, 0), lam({ color: [0x4f7a34, 0x5f8a3c, 0x46703a][Math.abs(Math.round(x)) % 3], flatShading: true }));
  m.position.set(x, 3.2 * s, z); m.castShadow = true; scene.add(m);
  solid(x - 0.2, x + 0.2, z - 0.2, z + 0.2);
}
for (let x = -30; x <= 30; x += 7.5) if (Math.abs(x + 1.5 - 14) > 3) tree(x + 1.5, 8.0, 0.9);

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
const NEON = [0xff3fa4, 0x3ff0ff, 0xffe14a, 0xa86bff];
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
  // white bargeboards along the gable, neon tube on some houses
  const neon = opt.neon ?? (mi % 2 === 0 ? NEON[(mi >> 1) % NEON.length] : null);
  if (kind === 'point') {
    edge(g, -w / 2 - 0.1, h - 0.05, 0, h + apex + 0.08, F + 0.02, frameMat, 0.24); edge(g, 0, h + apex + 0.08, w / 2 + 0.1, h - 0.05, F + 0.02, frameMat, 0.24);
    box(0.9, 1.1, 0.06, frameMat, 0, h + apex * 0.38, F + 0.02, g, false); box(0.7, 0.9, 0.07, winMat, 0, h + apex * 0.38, F + 0.04, g, false);
    if (neon) { const nm = neonMat(neon); edge(g, -w / 2 + 0.25, h + 0.1, 0, h + apex - 0.3, F + 0.1, nm, 0.07); edge(g, 0, h + apex - 0.3, w / 2 - 0.25, h + 0.1, F + 0.1, nm, 0.07); }
  } else if (neon) box(w * 0.9, 0.07, 0.07, neonMat(neon), 0, h + 0.25, F + 0.12, g, false);
  // windows: white frames, glassy panes, a mullion and a sill
  const floors = Math.floor((h - 1) / 2.8);
  for (let f = 0; f < floors; f++) {
    const y = 3.4 + f * 2.8;
    for (let k = 0; k < 2; k++) {
      const wx = (k - 0.5) * w * 0.48;
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
    const s = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, 0.7), lam({ map: signTex([{ t: shopSign, size: 44 }], '#1a0a24', '#' + (neon || 0xff3fa4).toString(16).padStart(6, '0')), emissive: 0x401838 }));
    s.position.set(0, 2.75, F + 0.09); g.add(s);
    const awnT = canvasTex(64, 64, (c) => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ffffff' : '#' + col.toString(16).padStart(6, '0'); c.fillRect(i * 8, 0, 8, 64); } });
    const awn = box(w * 0.9, 0.12, 1.2, lam({ map: awnT }), 0, 2.45, F + 0.6, g);
    awn.rotation.x = 0.25;
  } else if (!opt.noDoor) {
    box(1.1, 2.3, 0.08, frameMat, w * 0.28, 1.15, F + 0.02, g, false);
    box(0.9, 2.15, 0.1, lam({ color: [0x1f5a48, 0xffffff, 0x2a3a6a, 0x8a1a3a][mi % 4] }), w * 0.28, 1.08, F + 0.03, g, false);
    box(1.2, 1.5, 0.06, frameMat, -w * 0.2, 1.5, F + 0.02, g, false);
    box(1.0, 1.3, 0.07, winMat, -w * 0.2, 1.5, F + 0.04, g, false);
  }
  g.traverse((c) => { if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; } });
  return g;
}
// Inntel-style stack of houses: a landmark at the west end of the street
function stackTower(x0, x1, z) {
  const W = x1 - x0, cx = (x0 + x1) / 2;
  house(cx, z, W, 9, 6.5, 0, 0, null, { gable: 'step', color: 0x1f7a5e, neon: 0xff3fa4 });
  house(cx - W * 0.24, z + 0.4, W * 0.5, 7, 4.2, 0, 1, null, { y: 6.5, gable: 'point', color: 0x4f9ee0, noDoor: true, neon: 0x3ff0ff });
  house(cx + W * 0.26, z - 0.5, W * 0.48, 7, 5.6, 0, 3, null, { y: 6.5, gable: 'bell', color: 0x2fb8b0, noDoor: true });
  house(cx + 0.3, z + 0.2, W * 0.62, 6, 3.6, 0, 6, null, { y: 12.4, gable: 'point', color: 0x7ad8b0, noDoor: true, neon: 0xffe14a });
  const hs = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.8), lam({ map: signTex([{ t: 'HOTEL KAASLAND', size: 40 }], '#1a0a24', '#3ff0ff'), emissive: 0x204050 }));
  hs.position.set(cx, 5.6, z + 4.55); scene.add(hs);
  solid(x0, x1, z - 4.5, z + 4.5);
}
// north side: houses west and east of the warehouse (fronts face south, +z)
stackTower(-34, -26.5, -11);
let nx = -26.5, hi = 3;
while (nx < -11.5 - 4) { const w = 5 + (hi % 3); house(nx + w / 2, -11, w, 9, 9 + (hi % 3) * 1.3, 0, hi); solid(nx, nx + w, -15.5, -6.5); nx += w; hi++; }
// east of the warehouse: Eddy's private parking (x 1..9.5), then the houses, with The Russian's pawnshop in between
const LOT = { x0: 1.15, x1: 9.5 };
const PS = { x0: 20, x1: 28, z0: -15.5, z1: -6.5, h: 4.8, doorX0: 23.2, doorX1: 24.6 };
nx = LOT.x1;
while (nx < 34) {
  if (nx >= PS.x0 - 0.01 && nx < PS.x1) { nx = PS.x1; continue; }
  let w = 5 + (hi % 3);
  if (nx < PS.x0 && nx + w > PS.x0) w = PS.x0 - nx;
  house(nx + w / 2, -11, w, 9, 9 + (hi % 4) * 1.1, 0, hi, hi === 7 ? 'BITTERBAL & ZO' : null, hi === 9 ? { gable: 'point', color: 0x23a07a, clock: true, neon: null } : {}); solid(nx, nx + w, -15.5, -6.5); nx += w; hi++;
}
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
  const white = lam({ color: 0xf6f4ee }), pink = new THREE.MeshBasicMaterial({ color: 0xff3fa4 });
  for (let i = 0; i < teeth; i++) {
    const a = [WH.x0 + i * tw, WH.h], b = [WH.x0 + i * tw + tw * 0.78, WH.h + th], c = [WH.x0 + (i + 1) * tw, WH.h];
    for (const [p, q, m, t, dz] of [[a, b, white, 0.18, 0.2], [b, c, white, 0.18, 0.2], [a, b, pink, 0.07, 0.3], [b, c, pink, 0.07, 0.3]]) {
      const e = box(Math.hypot(q[0] - p[0], q[1] - p[1]), t, 0.08, m, (p[0] + q[0]) / 2, (p[1] + q[1]) / 2, WH.z1 + dz, roof, false); e.rotation.z = Math.atan2(q[1] - p[1], q[0] - p[0]);
    }
  }
  for (const x of [WH.x0, WH.x1]) box(0.22, WH.h, 0.22, white, x, WH.h / 2, WH.z1 + 0.05, frontLow, false);
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
for (let x = -30; x <= 30; x += 12) { lamp(x, -5.25); lamp(x + 6 === 6 ? 11 : x + 6, x + 6 === 6 ? -5.25 : ROAD.bike1 + 0.2); if (x + 6 === 6) lamp(6, ROAD.bike1 + 0.2); }
for (let x = -32; x <= 32; x += 2.6) if (Math.abs(x - 14) > 3) bollard(x, ROAD.walk1 + 0.05);
function bollard(x, z) { cyl(0.09, 0.11, 0.9, lam({ color: 0x5a1a14 }), x, 0.45, z); }
function car(x, z, color, rot = 0, isSolid = true, kind = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; scene.add(g);
  const pm = new THREE.MeshPhongMaterial({ color, shininess: 60 });
  if (kind === 1) { // hatchback
    box(3.6, 0.8, 1.7, pm, 0, 0.6, 0, g); box(2.3, 0.7, 1.55, pm, -0.45, 1.33, 0, g);
    box(2.1, 0.58, 1.57, mat.glass, -0.45, 1.33, 0, g, false);
  } else {
    box(4.1, 0.8, 1.8, pm, 0, 0.6, 0, g); box(2.2, 0.65, 1.6, pm, -0.2, 1.3, 0, g);
    box(2.0, 0.55, 1.62, mat.glass, -0.2, 1.3, 0, g, false);
  }
  const L = kind === 1 ? 1.8 : 2.05;
  for (const s of [1, -1]) box(0.06, 0.18, 0.4, lam({ color: 0xfff6d0, emissive: 0x605030 }), L, 0.7, s * 0.6, g, false);
  for (const s of [1, -1]) box(0.06, 0.16, 0.36, lam({ color: 0xa01010, emissive: 0x400000 }), -L, 0.75, s * 0.62, g, false);
  for (const [wx, wz] of [[L - 0.75, 0.85], [L - 0.75, -0.85], [-L + 0.75, 0.85], [-L + 0.75, -0.85]]) { const w = cyl(0.33, 0.33, 0.22, mat.black, wx, 0.33, wz, g, 10); w.rotation.x = Math.PI / 2; }
  if (isSolid) solid(x - L - 0.05, x + L + 0.05, z - 0.95, z + 0.95);
  g.userData.half = L;
  return g;
}
const CAR_COLS = [0xb8b2a2, 0x6a1e22, 0x2a4a6a, 0xcfcfc8, 0x2d2d2d, 0x8a8f3a, 0xe0d8c0, 0x3a5a7a, 0x9a2a2a, 0x556b5a];
// parked cars in the bays (none in front of the warehouse, the lot, or on the zebra)
{
  let k = 0;
  for (let x = -63.2; x < 63; x += 5.6) for (const z of [-4, 4]) {
    k++;
    if (Math.abs(x + 18) < 4) continue;
    if (z < 0 && x > -13 && x < 11) continue;
    if (z < 0 && x > PS.doorX0 - 3.5 && x < PS.doorX1 + 2.5) continue;
    if ((k * 7) % 5 === 0) continue;
    car(x + 2.8, z, CAR_COLS[(k * 3) % CAR_COLS.length], (k % 2) * Math.PI, true, k % 3 === 0 ? 1 : 0);
  }
}
// bike racks on the pavement (it's Kaasland after all)
for (const rx of [-24, 4, 30]) for (let i = 0; i < 5; i++) {
  const b = new THREE.Group(); b.position.set(rx + i * 0.7, 0, 10.35); b.rotation.y = Math.PI / 2; scene.add(b);
  for (const zz of [-0.55, 0.55]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.04, 4, 12), mat.black); w.position.set(0, 0.35, zz); w.rotation.y = Math.PI / 2; b.add(w); }
  box(0.05, 0.05, 1.1, lam({ color: [0x223344, 0x553311, 0x335522, 0x6a1a1a][i % 4] }), 0, 0.6, 0, b, false);
  if (i === 0) solid(rx - 0.4, rx + 3.2, 9.95, 10.75);
}

// ------------------------------------------------------------------ the Oofmobiel
// Eddy's private parking: asphalt lot with a low back wall and a PRIVÉ sign
{
  const lot = new THREE.Mesh(new THREE.PlaneGeometry(LOT.x1 - LOT.x0, 8.5), lam({ map: tex('asphalt.jpg', 4, 4), color: 0x8c8c8c }));
  lot.rotation.x = -Math.PI / 2; lot.position.set((LOT.x0 + LOT.x1) / 2, 0.018, -11.25); lot.receiveShadow = true; scene.add(lot);
  const drive = new THREE.Mesh(new THREE.PlaneGeometry(LOT.x1 - LOT.x0 - 1, 2.0), lam({ map: tex('asphalt.jpg', 4, 1), color: 0x8c8c8c }));
  drive.rotation.x = -Math.PI / 2; drive.position.set((LOT.x0 + LOT.x1) / 2, 0.02, -6.1); scene.add(drive);
  for (const x of [LOT.x0 + 1.2, LOT.x1 - 1.0]) box(0.12, 0.01, 6.5, lam({ color: 0xf2d24a }), x, 0.03, -11.6, scene, false);
  const prive = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#ffd36b'; g.fillRect(0, 0, w, h); g.fillStyle = '#6b1410'; g.font = '900 34px Arial Black, Arial'; g.textAlign = 'center'; g.fillText('PRIVÉ', w / 2, 52); g.font = '700 22px Arial'; g.fillText('EDDY & ZN · OOFMOBIEL', w / 2, 90); g.fillText('wegsleepregeling', w / 2, 116); });
  box(LOT.x1 - LOT.x0, 1.6, 0.3, brickMats[3], (LOT.x0 + LOT.x1) / 2, 0.8, -15.35); solid(LOT.x0, LOT.x1, -15.5, -15.2);
  cyl(0.05, 0.05, 2.2, mat.dark, LOT.x1 - 0.6, 1.1, -7.2);
  const ps = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.55), lam({ map: prive })); ps.position.set(LOT.x1 - 0.6, 2.0, -7.14); scene.add(ps);
  // painted word on the lot floor
  const pw = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.8), lam({ map: canvasTex(256, 64, (g) => { g.fillStyle = '#f2d24a'; g.font = '900 44px Arial'; g.textAlign = 'center'; g.fillText('PRIVÉ', 128, 50); }), transparent: true }));
  pw.rotation.x = -Math.PI / 2; pw.position.set((LOT.x0 + LOT.x1) / 2, 0.035, -7.8); scene.add(pw);
}
const oof = new THREE.Group(); oof.position.set((LOT.x0 + LOT.x1) / 2, 0, -11.4); oof.rotation.y = -Math.PI / 2; scene.add(oof);
const vanBlue = new THREE.MeshPhongMaterial({ color: 0x1f5fb8, shininess: 70 });
box(5.0, 2.1, 2.1, vanBlue, -0.3, 1.45, 0, oof);
box(1.3, 1.3, 2.05, vanBlue, 2.6, 1.05, 0, oof);
box(1.0, 0.8, 2.07, mat.glass, 2.3, 2.0, 0, oof, false);
box(0.06, 0.8, 1.7, mat.glass, 3.27, 1.45, 0, oof, false);
const vanSide = signTex([{ t: 'EDDY & ZN', size: 54 }, { t: 'SPECERIJEN · OOFMOBIEL', size: 24, color: '#ffffff' }], '#1f5fb8', '#ffd36b', 512, 160);
for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.3), lam({ map: vanSide, transparent: true })); p.position.set(-0.4, 1.6, s * 1.07); p.rotation.y = s > 0 ? 0 : Math.PI; oof.add(p); }
for (const [wx, wz] of [[1.8, 1.0], [1.8, -1.0], [-1.9, 1.0], [-1.9, -1.0]]) { const w = cyl(0.42, 0.42, 0.3, mat.black, wx, 0.42, wz, oof, 12); w.rotation.x = Math.PI / 2; }
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
    if (f.glasses) {
      g.strokeStyle = '#0c0c10'; g.lineWidth = 3.2;
      for (const s of [-1, 1]) { const ex = C + s * 19; g.beginPath(); g.roundRect(ex - 14, 115, 28, 18, 5); g.stroke(); }
      g.beginPath(); g.moveTo(C - 5, 121); g.lineTo(C + 5, 121); g.stroke();
      g.fillStyle = 'rgba(190,220,255,.16)'; for (const s of [-1, 1]) g.fillRect(C + s * 19 - 12, 117, 24, 14);
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
    } else if (kind && kind[0] === '#') { // plain tee for passers-by: crew neck, maybe stripes
      g.fillStyle = kind.slice(0, 7); g.fillRect(0, 0, W, H);
      if (kind.includes('s')) for (let y = 14; y < H; y += 18) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, y, W, 7); }
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
    const hairM = std(parseInt(o.head.hair.slice(1), 16), 0.9);
    if (!o.head.bald) for (let i = 0; i < 22; i++) { const a = Math.random() * Math.PI * 2, el = 0.3 + Math.random() * 0.7; const p = new THREE.Vector3(Math.cos(a) * Math.cos(el), Math.sin(el), Math.sin(a) * Math.cos(el)); if (p.z > 0.45 && p.y < 0.6) continue; add(new THREE.SphereGeometry(0.048, 8, 6), hairM, p.x * 0.14, 0.2 + p.y * 0.13, p.z * 0.14 - 0.01, head); }
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

const player = makePerson({ headKind: 'jr', shirt: 0x86acdf, front: 'jr', pants: 0xe9e4d8, belt: 0x5a3018, shoes: 0x6a3a1c, belly: 1, skin: 0xe4ab88 });
player.position.set(-8.5, 0, -6.0); player.rotation.y = Math.PI / 2;
const dad = makePerson({ headKind: 'sr', shirt: 0x232a40, front: 'sr', pants: 0x4a4a52, shoes: 0x2a2018, belly: 0.6, skin: 0xdc9c82, scale: 0.96 });
dad.position.set(-1.6, 0, -6.75); dad.rotation.y = -Math.PI * 0.75;
const dadSolid = solid(-1.95, -1.25, -7.1, -6.4);
// The Russian (same look and vibe as Nine of Nine in Neon Vice), behind the counter of his pawnshop like a Stalker trader
const RU = { x: (PS.x0 + PS.x1) / 2, z: -12.3 };
const russian = makePerson({ headKind: 'ru', shirt: 0x121216, front: 'ru', pants: 0x2a2c3a, shoes: 0x1e1814, belly: 0.9, skin: 0xf0c4a2, scale: 1.02 });
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
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 0.95), lam({ map: signTex([{ t: 'PANDJESHUIS SPASIBO', size: 40 }], '#140818', '#ff3fa4'), emissive: 0x401030 }));
  sg.position.set(cx, 3.3, Z1 + 0.18); shopFrontHigh.add(sg);
  const op = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.35), lam({ map: signTex([{ t: 'OPEN', size: 70 }], '#000000', '#3ff0ff', 256, 100), emissive: 0x206070 }));
  op.position.set(W1 - 1.4, 2.0, Z1 + 0.22); shopFrontHigh.add(op);
  const neon = new THREE.PointLight(0xff3fa4, 2.5, 7); neon.position.set(cx, 3.0, Z1 + 1.0); scene.add(neon);
  box(1.3, 0.02, 0.8, lam({ color: 0x3a2a1a }), (PS.doorX0 + PS.doorX1) / 2, 0.03, Z1 + 0.6, scene, false);
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
  box(W1 - W0 - 1.2, 0.05, 0.05, lam({ color: 0xff3fa4, emissive: 0xff3fa4 }), cx, H - 0.25, Z0 + 0.3, shop, false);
  const wallL = new THREE.PointLight(0xffd8a8, 0, 7, 1.4); wallL.position.set(cx, 3.6, Z0 + 1.6); shop.add(wallL); shopLights.push([wallL, 3.2]);
  const pinkL = new THREE.PointLight(0xff3fa4, 0, 8, 1.6); pinkL.position.set(cx, H - 0.5, Z0 + 1.0); shop.add(pinkL); shopLights.push([pinkL, 1.4]);
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
const state = { step: 'title', money: 0, shown: 0, listed: new Set(), sold: new Set(), table: false, naknik: 0, income: 0, mapSeen: false, inDialogue: false, inPC: false, kit: [], metRussian: false };
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
const faces = { 'Eddy Sr.': './assets/face_sr.jpg', 'Eddy Jr.': './assets/face_jr.jpg', 'The Russian': './assets/face_ru.jpg', 'Naknik': null };
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
const icons = [['sell', 'K', 'Kaasplaats'], ['hire', 'N', 'Naknik Uitzendbureau'], ['shop', 'M', 'Buy mixing table'], ['map', '⌖', 'Map of Kaasland'], ['bank', 'W', 'My Wilders']];
function openPC(tab = 'sell', mode = 'pc') {
  pcTab = tab; pcMode = mode; state.inPC = true; $('pc').style.display = 'block'; beep(330, 0.15, 'sine', 0.06); renderPC();
}
function closePC() { state.inPC = false; $('pc').style.display = 'none'; afterPC(); }
$('pcclose').onclick = closePC;
function renderPC() {
  const ic = $('pcicons'); ic.innerHTML = '';
  if (pcMode === 'pc') for (const [id, g, label] of icons) {
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
    const unl = junkDefs.length - state.listed.size;
    if (unl > 0 && state.step !== 'talk') h += `<p>${unl} more item(s) in the warehouse aren't listed yet.</p>`;
    body.innerHTML = h;
    body.querySelectorAll('[data-sell]').forEach((b) => b.onclick = () => sellItem(b.dataset.sell, b));
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
  } else if (pcTab === 'map') {
    title.textContent = 'Map of Kaasland';
    body.innerHTML = mapHTML(false); bindMap();
    if (!state.mapSeen) { state.mapSeen = true; setTimeout(onMapSeen, 400); }
  } else if (pcTab === 'bank') {
    title.textContent = 'My Wilders · Kaasbank';
    body.innerHTML = `<div class="well">Balance: <b>${fmt(state.money)}</b><br>Passive income: <b>${fmt(state.income)}</b> per 6 sec<br>Naknikim employed: <b>${state.naknik}</b><br>Territories: <b>1</b> (De Natte Worst)<br><br><i>"Whoever holds the spice, holds Kaasland." · Eddy Sr.</i></div>`;
  }
}
const PINS = [
  ['De Natte Worst', 235, 430, 'own'], ['Spekbuurt', 420, 465, 'next'],
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
  const col = { own: '#2e8b2e', next: '#ffd36b', a1: '#ff8030', a2: '#6ed36e', a3: '#3cc8ff', fin: '#ffcc33' };
  const kindOf = (n, r) => n === 'De Natte Worst' ? 'own' : ({ start: 'next', lampas: 'a1', nosh: 'a2', abd: 'a3', fin: 'fin' })[r];
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
  h += `</div><div class="well" id="pininfo" style="margin-top:8px">${van ? 'Pick a destination for the Oofmobiel.' : 'Click a territory. Green = yours.'}</div>`;
  return h;
}
function bindMap() {
  document.querySelectorAll('[data-pin]').forEach((p) => p.onclick = () => {
    const n = p.dataset.pin, k = p.dataset.k, info = $('pininfo'); beep(600, 0.04);
    const t = {
      own: `<b>${n}</b>: your home base. The Eddy & Zn warehouse. ${pcMode === 'van' ? '<button class="b95" id="go">Drive</button>' : ''}`,
      next: `<b>${n}</b>: part of De Natte Worst, but the shoarma joints here still buy Lampas spice. <i>(Coming in the next build.)</i>`,
      a1: `<b>${n}</b>: Lampas territory. Their watered-down spice, your customers. <i>Locked.</i>`,
      a2: `<b>${n}</b>: Noshgey Kariot territory. Organic, artisanal, wildly overpriced. <i>Locked.</i>`,
      a3: `<b>${n}</b>: Abdavissies territory. Nobody asks questions here. <i>Locked.</i>`,
      fin: `<b>${n}</b>: where the secret of De Gouden Mix waits. Someday.`,
    }[k];
    info.innerHTML = t;
    const go = $('go'); if (go) go.onclick = () => { closePC(); toast('HOME', 'You\'re already at the warehouse.'); };
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
  renderPC();
}
function buyTable() {
  if (state.table || state.money < TABLE_COST) return;
  addMoney(-TABLE_COST, $('tableBtn')); state.table = true; mixTable.visible = true;
  mixSolid = solid(-8.0, -3.2, -13.4, -11.8);
  updateObjective(); renderPC();
}
const naknikim = [];
function hireNaknik() {
  if (!state.table || state.money < NAKNIK_COST || state.naknik >= 3) return;
  addMoney(-NAKNIK_COST, $('hireBtn')); state.naknik++; state.income = state.naknik * NAKNIK_INCOME;
  const n = makePerson({ headKind: 'nak', shirt: 0xec7d2c, front: 'nak', pants: 0xc45e1a, shoes: 0x3a2a1a, belly: 0.8, skin: 0xe8b890, scale: 0.68, rolled: true });
  n.position.set((WH.doorX0 + WH.doorX1) / 2, 0, -6.2);
  const spots = [[-4.6, -11.3], [-3.1, -12.6], [-6.1, -12.6]];
  n.userData.target = new THREE.Vector3(spots[state.naknik - 1][0], 0, spots[state.naknik - 1][1]);
  n.userData.walking = true; naknikim.push(n);
  addInteract({ obj: n, pos: () => n.position, r: 1.8, label: () => 'Talk to the Naknik', act: () => dialogue([['Naknik', ['I mix! I mix!', 'Boss, what is cumin? I just put lots in.', 'Paprika is red. Red is fast. I mix fast.', 'Can I have a break? No? Okay. I mix.'][Math.floor(Math.random() * 4)]]]) });
  toast('NAKNIK HIRED', 'He\'s heading to the mixing table. Passive income is running!');
  updateObjective(); renderPC();
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
  { id: 'makarov', name: 'Makarov PM', desc: '9mm pistol, 8 rounds. Reliable. Like Lada, but works.', price: 350 },
  { id: 'bat', name: 'Honkbalknuppel', desc: 'Baseball bat. Quiet. Very persuasive.', price: 90 },
  { id: 'ammo', name: '9mm ammo (50)', desc: 'For the Makarov. Bullets are not included, my friend. Never.', price: 40, multi: true },
  { id: 'vest', name: 'Kevlar vest', desc: 'Stops one bullet. Maybe two. Do not test.', price: 500 },
  { id: 'shotgun', name: 'Sawn-off shotgun', desc: 'Two barrels, one opinion.', price: 1400 },
  { id: 'goldak', name: 'Golden AK-47', desc: '"For you? Later. When you are big boss."', price: 0, locked: true },
];
const RU_SAY = ['Everything is quality. Everything is cash.', 'No receipts, no questions, no refunds.', 'Your father bought his first knife here. He still owes me for the sharpening.', 'Dolphins are smartest animal. After me.'];
function openShop() { $('shop').style.display = 'block'; state.inPC = true; renderShop(); beep(660, 0.06, 'triangle'); }
function closeShop() { $('shop').style.display = 'none'; state.inPC = false; updateObjective(); }
$('shopclose').onclick = closeShop;
function renderShop(msg) {
  const L = $('shoplist'); L.innerHTML = '';
  for (const it of SHOP) {
    const owned = state.kit.includes(it.id) && !it.multi;
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
  addMoney(-it.price, btn); state.kit.push(it.id);
  const names = state.kit.filter((k, i, a) => a.indexOf(k) === i).map((k) => SHOP.find((x) => x.id === k).name);
  $('kit').textContent = 'Kit: ' + names.join(', ');
  renderShop('"Good choice. ' + (it.id === 'bat' ? 'Classic.' : 'Very good choice.') + '" · The Russian');
  if (state.step === 'russian' && ['makarov', 'bat', 'shotgun'].includes(it.id)) {
    state.step = 'free'; updateObjective();
    setTimeout(() => { closeShop(); toast('END OF CHAPTER 0', 'You\'re armed. Next: take Spekbuurt from the Lampas.', 4); }, 900);
  }
}
function talkRussian() {
  if (!['russian', 'free'].includes(state.step)) { dialogue([['The Russian', 'Pandjeshuis is closed for you, my friend. Come back when Eddy sends you.']]); return; }
  if (!state.metRussian) {
    state.metRussian = true;
    dialogue([
      ['The Russian', 'Ahh! Eddy\'s boy! Look at you, same shirt energy as your father. Your father and I, we go back. Before the Lampas. Before dolphins on shirts were cool.'],
      ['Eddy Jr.', 'Pa says you can help me. The Lampas run Spekbuurt.'],
      ['The Russian', 'Lampas boys do not negotiate with spice. They negotiate with this.'],
      ['The Russian', 'Welcome to Pandjeshuis Spasibo. Everything is quality, everything is cash. Pick, pay, go make your father proud.'],
    ], openShop);
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
      free: 'Spekbuurt is next. Three joints, all selling Lampas rubbish. Start there.',
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
    talk: 'Talk to <b>Eddy Sr.</b> outside the warehouse.',
    list: `List the old shoarma junk for sale: walk up to each machine and press <b>E</b> (${n}/${N}).`,
    sell: `Sell everything on <b>Kaasplaats</b> using the Kaasdows 95 PC at the back (${s}/${N} sold).`,
    hire: !state.table ? `Buy a <b>mixing table</b> on the PC (W ${TABLE_COST}).` : state.naknik === 0 ? `Hire your first <b>Naknik</b> on the PC (W ${NAKNIK_COST}).` : 'Talk to <b>Eddy Sr.</b> one last time.',
    map: 'Check the <b>map of Kaasland</b> on the PC or in the Oofmobiel.',
    dad2: 'Talk to <b>Eddy Sr.</b> one last time.',
    russian: 'Visit <b>The Russian</b>: go inside <b>Pandjeshuis Spasibo</b>, east end of the street.',
    free: 'Kitted out. Chapter 0 done. <span style="color:#ffd36b">Next: take Spekbuurt from the Lampas.</span>',
  }[state.step];
  if (state.step === 'hire' && state.table && state.naknik > 0) state.step = 'dad2';
  setObjective(t || '');
}

// ------------------------------------------------------------------ input
const keys = {};
addEventListener('keydown', (e) => {
  if (state.step === 'title') { startGame(); return; }
  keys[e.code] = true;
  if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
    if (state.inDialogue) { nextLine(); return; }
    if (!state.inPC && current) current.act();
  }
  if (e.code === 'Escape' && state.inPC) { if ($('shop').style.display === 'block') closeShop(); else closePC(); }
  if (e.code === 'KeyN') { const on = music.toggle(); toast(on ? 'MUSIC ON' : 'MUSIC OFF', '', 1); }
  if (e.code === 'KeyM' && !state.inDialogue) state.inPC ? closePC() : openPC('map', 'pc');
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
      if (d <= it.r + 0.6 || it.far) it.act(); else toast('TOO FAR', 'Walk over there first.', 1.4);
      return;
    }
  }
});
$('title').addEventListener('click', startGame);
function startGame() {
  if (state.step !== 'title') return;
  $('title').style.display = 'none'; state.step = 'talk'; updateObjective(); beep(440, 0.1, 'triangle');
  try { music.start(); } catch (e) { /* audio optional */ }
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
function say(sp, text, col = '#ff3fa4') {
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
  const dir = i % 2 ? 1 : -1, z = dir > 0 ? 1.5 : -1.5;
  const c = car(-60 + i * 21, z, CAR_COLS[(i * 4 + 1) % CAR_COLS.length], dir > 0 ? 0 : Math.PI, false, i % 3 === 2 ? 1 : 0);
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
  const seat = (x, y) => { box(0.26, 0.05, 0.14, mat.black, x, y, 0, b, false); seats.push([x, y]); };
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
  } else {
    wheel(-0.52); wheel(0.52);
    tube(-0.52, 0.36, -0.1, 0.36); tube(-0.1, 0.36, 0.42, 0.82); tube(-0.18, 0.86, 0.42, 0.82); tube(-0.1, 0.36, -0.18, 0.86); tube(0.52, 0.36, 0.42, 0.82); tube(-0.52, 0.36, -0.18, 0.86);
    seat(-0.2, 0.92); bars(0.42, 1.0); tube(0.42, 0.82, 0.42, 1.0);
    box(0.28, 0.06, 0.32, lam({ color: 0x3a2a1a }), -0.5, 0.7, 0, b);
  }
  b.userData.seats = seats; b.userData.len = kind === 2 ? 2.2 : kind === 4 ? 1.6 : 0.95;
  scene.add(b); return b;
}
const SKINS = [0xf0c8a8, 0xe0a882, 0xc8885e, 0x9a6440, 0x6a4028, 0xf4d2bc];
const HAIRS = ['#1a1410', '#3a2a1a', '#7a5a30', '#d8c080', '#a0602e', '#8a8a8a', '#202020'];
const SHIRTS = ['#c83a2a', '#2a5a9a', '#e8e2d0', '#3a7a4a', '#f2c31a', '#2a2a30', '#8a4aa0', '#e87a9a', '#1a6a6a', '#d06a20'];
const PANTS = [0x2a3a5a, 0x3a3a3a, 0xc8b89a, 0x1a1a22, 0x5a4a3a, 0x4a5a7a];
function passerBy(seed) {
  const r = (k) => (Math.sin(seed * 97.13 + k * 13.7) * 43758.5453) % 1, ri = (n, k) => Math.floor(Math.abs(r(k)) * n);
  const skin = SKINS[ri(SKINS.length, 1)], hair = HAIRS[ri(HAIRS.length, 2)];
  const head = { skin, hair, brow: hair, hairLine: 84 + ri(10, 3), sideLine: 116, backLine: 150, mouth: ri(2, 4) ? 'smile' : 'laugh', iris: ['#4a2e1c', '#3a5a7a', '#2a2a2a'][ri(3, 5)], glasses: ri(5, 6) === 0, long: ri(3, 7) === 0, bun: ri(6, 8) === 0, bald: ri(9, 9) === 0 };
  if (head.bald) head.hairLine = 40;
  const shirt = SHIRTS[ri(SHIRTS.length, 10)] + (ri(4, 11) === 0 ? 's' : '');
  return makePerson({ head, front: shirt, pants: PANTS[ri(PANTS.length, 12)], shoes: [0x1a1a1a, 0xe8e8e8, 0x5a3a1a][ri(3, 13)], belly: [0, 0, 0.4, 0.8][ri(4, 14)], skin, scale: 0.9 + Math.abs(r(15)) * 0.14 });
}
const cyclists = [];
const BIKE_KINDS = [0, 2, 1, 0, 4, 3, 0, 1];
BIKE_KINDS.forEach((kind, i) => {
  const dir = i % 2 ? -1 : 1, z = dir > 0 ? 5.85 : 6.95;
  const bike = makeBike([0x1a1a1a, 0xff5fa2, 0x2fb8a8, 0x7a1a1a, 0xffd23a, 0x8a5ae0, 0xd8d0c0, 0x2a4a7a][i], kind);
  const riders = bike.userData.seats.map(([sx, sy], k) => {
    const r = passerBy(100 + i * 5 + k); scene.remove(r); bike.add(r);
    r.position.set(sx - 0.02, sy - 0.9, 0); r.rotation.y = Math.PI / 2;
    r.userData.arms[0].rotation.x = r.userData.arms[1].rotation.x = -1.0;
    return r;
  });
  bike.position.set(-60 + i * 16, 0, z); bike.rotation.y = dir > 0 ? 0 : Math.PI;
  const len = bike.userData.len;
  bike.userData = { dir, v: 4, vmax: kind === 2 ? 3.2 : kind === 1 ? 2.8 : 4 + (i % 3) * 0.6, riders, phase: i, len, kind, bubble: bubble(), shoutT: 0 };
  bike.add(bike.userData.bubble); bike.userData.bubble.position.set(0, kind === 3 ? 3.6 : 2.7, 0);
  cyclists.push(bike);
});
const walkers = [];
const LANES = { N: [-5.75, -6.3], S: [8.55, 9.45] };
for (let i = 0; i < 12; i++) {
  const side = i % 2 ? 'S' : 'N', dir = (i >> 1) % 2 ? 1 : -1;
  const p = passerBy(i + 1);
  p.position.set(-30 + ((i * 37) % 60), 0, LANES[side][dir > 0 ? 0 : 1]);
  p.userData.walk = { side, dir, v: 1.1 + ((i * 7) % 5) * 0.12, wait: 0, blocked: 0 };
  walkers.push(p);
}
const LINES_NPC = ['Lekker weertje, hè?', 'Watch it, I\'m walking here!', 'Have you seen the Lampas boys around? Bad news.', 'My snackbar only uses Eddy & Zn spice. Used to, anyway.', 'Fietsbel! Ring ring!', 'Nice shirt. Very... open.', 'They say the old Eddy had a secret recipe.'];
walkers.forEach((w, i) => addInteract({ obj: w, pos: () => w.position, r: 1.4, label: () => 'Say hi', act: () => { w.userData.walk.wait = 2.5; w.rotation.y = Math.atan2(player.position.x - w.position.x, player.position.z - w.position.z); toast('"' + LINES_NPC[(i + Math.floor(performance.now() / 5000)) % LINES_NPC.length] + '"', 'Passer-by', 2.4); } }));
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
      bump(u.dir * (3 + u.v * 0.9), Math.sign(P.z - c.position.z || 1) * 5, 6.5, 'You bounced off ' + ['a Daf', 'an Opel Kadett', 'a Volvo 240', 'a Citroën BX'][traffic.indexOf(c) % 4] + '.');
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
    if (u.v > 2 && Math.abs(P.z - b.position.z) < 0.6 && Math.abs(P.x - b.position.x) < u.len + 0.3 && P.y < 0.3) bump(u.dir * 4, Math.sign(P.z - b.position.z || 1) * 3, 4, 'Run over by a ' + ['bike', 'vierfiets', 'tricycle', 'bike', 'bakfiets full of Gouda', 'tall bike'][u.kind] + '.');
    b.position.x += u.v * u.dir * dt;
    if (b.position.x * u.dir > 66) b.position.x = -66 * u.dir;
    for (const w of b.children) if (w.userData.r) w.rotation.z -= u.v * dt / w.userData.r;
    u.phase += u.v * dt * 1.6;
    u.riders.forEach((r, k) => { const ru = r.userData, ph = u.phase + k * 0.7; ru.legs[0].rotation.x = -0.9 + Math.sin(ph) * 0.5; ru.legs[1].rotation.x = -0.9 - Math.sin(ph) * 0.5; });
    const bu = u.bubble.userData; if (bu.life > 0) { bu.life -= dt; if (bu.life <= 0) u.bubble.visible = false; }
  }
  for (const w of walkers) {
    const u = w.userData.walk;
    if (u.wait > 0) { u.wait -= dt; animate(w, 0, dt); continue; }
    const lane = LANES[u.side][u.dir > 0 ? 0 : 1];
    let blocked = false;
    const near = (x, z, r) => { const dx = (x - w.position.x) * u.dir, dz = Math.abs(z - w.position.z); return dx > 0 && dx < r && dz < 0.6; };
    if (near(P.x, P.z, 1.0) || near(dad.position.x, dad.position.z, 1.0)) blocked = true;
    for (const o of walkers) if (o !== w && near(o.position.x, o.position.z, 0.9)) blocked = true;
    if (blocked) { u.blocked += dt; if (u.blocked > 1.6) { u.dir *= -1; u.blocked = 0; } animate(w, 0, dt); continue; }
    u.blocked = 0;
    w.position.x += u.v * u.dir * dt; w.position.z += (lane - w.position.z) * Math.min(1, dt * 2);
    w.rotation.y = u.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    if (w.position.x * u.dir > 31) { u.dir *= -1; u.wait = 0.5 + Math.random(); }
    animate(w, u.v, dt);
  }
}

// ------------------------------------------------------------------ loop
let current = null;
const clock = new THREE.Clock();
const occl = new THREE.Raycaster();
const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
let incomeT = 0;
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  // movement (screen-relative: camera looks north)
  let mx = 0, mz = 0;
  if (!state.inDialogue && !state.inPC && state.step !== 'title') {
    if (keys.KeyW || keys.ArrowUp) mz -= 1; if (keys.KeyS || keys.ArrowDown) mz += 1;
    if (keys.KeyA || keys.ArrowLeft) mx -= 1; if (keys.KeyD || keys.ArrowRight) mx += 1;
  }
  if (knock.t > 0) { mx = mz = 0; }
  const len = Math.hypot(mx, mz);
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
    const target = Math.atan2(mx, mz);
    let dr = target - player.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr));
    player.rotation.y += dr * Math.min(1, dt * 14);
  }
  collide(player.position, 0.38);
  animate(player, speed, dt);
  // dad faces the player when close
  const toP = Math.atan2(player.position.x - dad.position.x, player.position.z - dad.position.z);
  if (player.position.distanceTo(dad.position) < 6) { let dr = toP - dad.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); dad.rotation.y += dr * Math.min(1, dt * 4); }
  if (dad.userData.leaving && dad.visible) {
    dad.rotation.y = Math.PI / 2; dad.position.x -= 2.4 * dt; dad.position.z += (-6.4 - dad.position.z) * dt;
    dad.rotation.y = -Math.PI / 2; dadSolid.off = true; animate(dad, 2.4, dt);
    if (dad.position.x < -36) dad.visible = false;
  } else animate(dad, 0, dt);
  const toR = Math.atan2(player.position.x - russian.position.x, player.position.z - russian.position.z);
  if (isInShop(player.position)) { let dr = toR - russian.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); russian.rotation.y += dr * Math.min(1, dt * 4); }
  animate(russian, 0, dt);
  updateStreet(dt);
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
  const inside = isInside(player.position);
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
  if (current && !state.inDialogue && !state.inPC && state.step !== 'title') { ui.prompt.style.display = 'block'; ui.prompt.innerHTML = `<b style="color:#ffd36b">[E]</b> ${current.label()}`; }
  else ui.prompt.style.display = 'none';
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) ui.toast.style.display = 'none'; }
  // camera: Neon Vice-style high top-down, eased
  const off = new THREE.Vector3(0, 12.5 * zoom, 6 * zoom);
  if (inside || inShop) off.set(0, 14 * zoom, 4.5 * zoom);
  camPos.lerp((inShop ? new THREE.Vector3((PS.x0 + PS.x1) / 2 * 0.4 + player.position.x * 0.6, 0, -12.2 * 0.5 + player.position.z * 0.5) : player.position.clone()).add(off), Math.min(1, dt * 4));
  const lookAt = inShop ? new THREE.Vector3((PS.x0 + PS.x1) / 2 * 0.4 + player.position.x * 0.6, 0.8, -12.2 * 0.5 + player.position.z * 0.5) : player.position.clone().add(new THREE.Vector3(0, 0.8, 0));
  camLook.lerp(lookAt, Math.min(1, dt * 6));
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
      g.traverse((c) => { if (c.isMesh) { c.material.opacity = g.userData.fade; c.material.depthWrite = g.userData.fade > 0.95; } });
    }
  }
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
camPos.copy(player.position).add(new THREE.Vector3(0, 12.5, 6)); camLook.copy(player.position);
updateObjective();
window.__sme = { knock, bump, say, traffic, cyclists, walkers, openShopDoor, PS, oof, talkRussian, russian, openShop, paintHead, HEADS, setZoom: (z) => { zoom = z; }, dad, player, state, junkDefs, talkDad, openPC, closePC, nextLine, sellItem, buyTable, hireNaknik };
tick();
