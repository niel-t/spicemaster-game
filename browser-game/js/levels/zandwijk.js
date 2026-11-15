// De Zandwijk (the Paravim, Ras al Gara's turf): every Paravim mission shares one walled compound. souk(cfg) builds a level def on
// that layout; each place fills the courtyard, the back house and the store, and adds its own twist. No concept art yet: the look is
// the spice-trader palette with the clan's own colours (terracotta walls, sand, indigo and harissa red). See spekbuurt.js for the
// coordinate conventions.
//
//   grid 46 × 30:  diwan (Ras's sitting room by default) x1-10 z1-16 · theehuis x1-10 z18-28 · back house x12-44 z1-10
//                  courtyard x12-33 z12-28 (open gate onto the street) · store x35-44 z12-28
//   doors: theehuis front 5-6,29 · gate 20-25,29 (open arch) · theehuis ↔ diwan 5-6,17 · theehuis ↔ courtyard 11,22-23
//          diwan ↔ back house 11,4-5 · courtyard ↔ back house 18-19,11 and 28-29,11 · courtyard ↔ store 34,18-19 · store ↔ back house 40-41,11
//
// The Paravim rules live in mission.js (def.paravim): always wary, one loud shot alerts them all, Wraak, tray shields, arguing pairs.

import { glowSprite, STREET_FURN } from './props.js';

export const W = 46, H = 30;

const SAND = 0xd8b884, TERRA = 0xb4542c, INDIGO = 0x2a2e6a, HARISSA = 0xb8301a, SAFFRON = 0xe8a33d, CREAM = 0xf3e6c8;

export const PARAVIM = {
  faction: 'PARAVIM', factionName: 'Paravim', paravim: true,
  foeHp: 3, // the toughest clan: three hits each (Noshgey and Abdavissies take two)
  foeCap: 0, // no caps: head wraps
  foeLooks: [ // sand, terracotta, cream and indigo robes; wraps and sashes in the clan colours
    { front: '#d8b884', shirt: SAND, pants: 0xb89a6a, wrap: INDIGO, belt: HARISSA }, { front: '#b4542c', shirt: TERRA, pants: 0x5a3a24, wrap: CREAM, belt: INDIGO },
    { front: '#e8dcc0', shirt: 0xe8dcc0, pants: 0x8a6a4a, wrap: HARISSA, belt: SAFFRON }, { front: '#2a2e6a', shirt: INDIGO, pants: 0x3a3030, wrap: SAND, belt: HARISSA },
  ],
  foeSkins: [0xc8946a, 0xb07a52, 0xd8a47a, 0x9a6a46],
  foeHead: (i) => ({ hair: '#1a1410', brow: '#1a1410', iris: '#2a1a10', ...(i % 3 !== 1 ? { beard: ['#1a1410', '#3a2a1a', '#2a2a2a'][i % 3] } : {}) }),
  alertLines: ['Drie zendingen! DRIE!', 'Wie heeft er zand in mijn couscous gedaan?!', 'Jouw vader betaalde tenminste. Soms.', 'Eddy junior! Waar is ons geld?!', 'Ik ben al boos. Nu ben ik bozer!', 'Het is hier te koud en jij bent te brutaal!', 'Rente! Met rente!'],
};

// floors: sand courtyard, zellige tiles in the tea house, a carpet in the diwan, plaster in the back house, planks in the store
const DEF_FLOORS = {
  sand: (g) => { g.fillStyle = '#d8b884'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '120,80,40' : '255,240,200'},${Math.random() * 0.18})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 1); } g.strokeStyle = 'rgba(150,110,60,.25)'; for (let y = 8; y < 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(20, y - 4, 40, y + 4, 64, y); g.stroke(); } },
  zellige: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#2a6a7a', '#f3e6c8', '#b8301a', '#e8a33d'][(x + y * 2) % 4]; g.fillRect(x * 16, y * 16, 16, 16); g.fillStyle = '#f3e6c8'; g.beginPath(); g.moveTo(x * 16 + 8, y * 16 + 2); g.lineTo(x * 16 + 14, y * 16 + 8); g.lineTo(x * 16 + 8, y * 16 + 14); g.lineTo(x * 16 + 2, y * 16 + 8); g.fill(); } },
  carpet: (g) => { g.fillStyle = '#8a1a1a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#e8a33d'; g.lineWidth = 3; g.strokeRect(5, 5, 54, 54); g.strokeStyle = '#2a2e6a'; g.lineWidth = 2; g.strokeRect(12, 12, 40, 40); g.fillStyle = '#e8a33d'; g.beginPath(); g.moveTo(32, 18); g.lineTo(46, 32); g.lineTo(32, 46); g.lineTo(18, 32); g.fill(); g.fillStyle = '#2a2e6a'; g.fillRect(29, 29, 6, 6); },
  plaster: (g) => { g.fillStyle = '#c89a6a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 240; i++) { g.fillStyle = `rgba(90,50,20,${Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } },
  planks: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#7a5232', '#6a4628', '#845a36'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 7) % 64, y, 1, 8); } },
};

// furniture letters (on top of the shared ones): m market stall, y sacks, h harissa pot, P date palm, W well, d floor cushions, u spice pyramid
const stripes = {};
const stripeTex = (THREE, a, b) => { const k = a + b; if (stripes[k]) return stripes[k]; const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  for (let x = 0; x < 64; x += 16) { g.fillStyle = a; g.fillRect(x, 0, 8, 64); g.fillStyle = b; g.fillRect(x + 8, 0, 8, 64); } g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 56, 64, 8);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (stripes[k] = t); };
export const SOUK_FURN = {
  m: { h: 1.0, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz, x }) => { // a market stall: a wooden counter under a striped awning on poles
    box(n - 0.06, 0.95, 0.9, lam({ color: 0x6a4628 }), cx, 0.48, cz, root);
    for (let k = 0; k < n; k++) for (let s = 0; s < 3; s++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.22, 10), lam({ color: [0xb8301a, 0xe8a33d, 0x6a7a2a, 0xd8461e, 0x8a3a1a][(x + k + s) % 5] })); c.position.set(cx - n / 2 + k + 0.2 + s * 0.3, 1.06, cz); root.add(c); }
    for (const ox of [-n / 2 + 0.1, n / 2 - 0.1]) box(0.06, 2.3, 0.06, lam({ color: 0x3a2412 }), cx + ox, 1.15, cz + 0.4, root, false);
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(n + 0.2, 1.3), lam({ color: 0xffffff, map: stripeTex(THREE, (x % 2) ? '#b8301a' : '#2a2e6a', '#f3e6c8'), side: THREE.DoubleSide }));
    aw.rotation.x = -Math.PI / 2 + 0.35; aw.position.set(cx, 2.25, cz + 0.15); root.add(aw);
  } },
  y: { h: 0.85, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { // sacks of couscous and semolina
    for (let k = 0; k < n; k++) for (let s = 0; s < 3; s++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), lam({ color: [0xd8c08a, 0xc8a870, 0xe0cc98][(x + k + s) % 3] })); b.scale.set(1, 0.85 + (s === 2 ? 0 : 0.25), 0.9); b.position.set(OX + x + k + 0.5 + (s - 1) * 0.22, s === 2 ? 0.75 : 0.3, cz + (s === 1 ? 0.2 : -0.15)); b.castShadow = true; root.add(b); }
  } },
  h: { h: 1.0, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { // a big terracotta harissa pot, red to the brim
    for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5; const pot = new THREE.Mesh(new THREE.SphereGeometry(0.42, 14, 10), lam({ color: 0xa8481e })); pot.scale.set(1, 1.15, 1); pot.position.set(px, 0.5, cz); pot.castShadow = true; root.add(pot);
      const top = new THREE.Mesh(new THREE.CircleGeometry(0.26, 14), lam({ color: 0xc81e0e, emissive: 0x3a0400 })); top.rotation.x = -Math.PI / 2; top.position.set(px, 0.98, cz); root.add(top); }
  } },
  P: { h: 0.5, cover: false, draw: ({ THREE, root, cyl, lam, n, cz, x, OX }) => { // a date palm
    for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5; cyl(0.12, 0.2, 4.2, lam({ color: 0x7a5a3a }), px, 2.1, cz, root, 8);
      for (let f = 0; f < 8; f++) { const fr = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.04, 1.9), lam({ color: f % 2 ? 0x4a7a2a : 0x5a8a32 })); const a = f / 8 * Math.PI * 2; fr.position.set(px + Math.sin(a) * 0.8, 4.0, cz + Math.cos(a) * 0.8); fr.rotation.set(0.45 * Math.cos(a), a, 0, 'YXZ'); fr.rotation.x = 0.4; fr.rotation.y = a; root.add(fr); }
      for (let d = 0; d < 5; d++) { const dt = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), lam({ color: 0x8a3a1a })); dt.position.set(px + Math.sin(d) * 0.18, 3.85, cz + Math.cos(d) * 0.18); root.add(dt); } }
  } },
  W: { h: 0.8, cover: true, draw: ({ root, cyl, box, lam, n, cx, cz }) => { // the well
    cyl(0.75, 0.8, 0.8, lam({ color: 0xc89a6a }), cx, 0.4, cz, root, 16); cyl(0.6, 0.6, 0.02, lam({ color: 0x1a3a4a }), cx, 0.79, cz, root, 16);
    for (const ox of [-0.7, 0.7]) box(0.08, 1.8, 0.08, lam({ color: 0x5a3a1a }), cx + ox, 0.9, cz, root, false); box(1.5, 0.08, 0.08, lam({ color: 0x5a3a1a }), cx, 1.8, cz, root, false);
  } },
  d: { h: 0.35, cover: false, draw: ({ box, lam, root, n, cx, cz, x }) => { box(n - 0.1, 0.32, 0.85, lam({ color: [0x8a1a1a, 0x2a2e6a, 0xe8a33d][x % 3] }), cx, 0.16, cz, root); } },
  u: { h: 0.9, cover: true, draw: ({ THREE, root, box, lam, n, cz, x, OX }) => { // spice pyramids on a low table: za'atar, sumak, ras el hanout, turmeric
    for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5; box(0.92, 0.5, 0.86, lam({ color: 0x5a3a1a }), px, 0.25, cz, root);
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.5, 12), lam({ color: [0x6a7a2a, 0x8a1a2a, 0xa8642a, 0xe8b020][(x + k) % 4] })); c.position.set(px, 0.75, cz); root.add(c); }
  } },
  o: STREET_FURN.o, l: STREET_FURN.l,
  S: { color: 0x8a1a1a }, O: { color: 0x5a3a1a }, C: { color: 0x8a6a3a }, R: { color: 0x6a4628 }, T: { color: 0x8a5a32 },
};

export function souk(cfg) {
  const diwan = cfg.diwan || 'carpet', hall = cfg.hall || 'plaster', court = cfg.court || 'sand', store = cfg.store || 'planks';
  return {
    ...PARAVIM, ...(cfg.faction || {}),
    id: cfg.id, name: cfg.name, W, H,
    taskName: cfg.taskName, hazard: cfg.hazard,
    rooms: [
      ['diwan', 1, 1, 10, 16, diwan], ['theehuis', 1, 18, 10, 28, 'zellige'], ['hall', 12, 1, 44, 10, hall], ['court', ...(cfg.courtBox || [12, 12, 33, 28]), court], ['store', 35, 12, 44, 28, store],
      ...(cfg.extraRooms || []),
    ],
    roomNames: { diwan: cfg.diwanName || 'Diwan', theehuis: 'Theehuis', hall: cfg.hallName || 'Achterhuis', court: cfg.courtName || 'Binnenplaats', store: cfg.storeName || 'Opslag', ...(cfg.roomNames || {}) },
    layout(api) {
      const { carve, put, putR } = api;
      carve(5, 29, 6, 29); carve(20, 29, 25, 29); // the tea house door and the open gate
      putR(5, 17, 6, 17, 'D'); putR(11, 22, 11, 23, 'D'); putR(11, 4, 11, 5, 'D'); putR(18, 11, 19, 11, 'D'); putR(28, 11, 29, 11, 'D'); putR(34, 18, 34, 19, 'D'); putR(40, 11, 41, 11, 'D');
      putR(1, 29, 3, 29, '%'); putR(8, 29, 10, 29, '%'); // the tea house window onto the street
      // the tea house: low brass tables, cushions, the tea counter
      putR(2, 20, 7, 20, 'K'); put(10, 19, 'F'); put(3, 24, 'T'); put(8, 24, 'T'); putR(2, 27, 3, 27, 'd'); putR(8, 27, 9, 27, 'd');
      if (cfg.diwanLayout) cfg.diwanLayout(api); else { putR(2, 2, 8, 2, 'd'); putR(3, 6, 6, 7, 'O'); put(1, 1, 'V'); put(10, 1, 'p'); putR(1, 12, 1, 15, 'S'); put(10, 15, 'p'); }
      cfg.courtLayout(api); cfg.hallLayout(api);
      if (cfg.storeLayout) cfg.storeLayout(api); else { for (const z of [14, 18, 22, 26]) putR(37, z, 42, z, 'y'); put(44, 12, 'X'); }
    },
    furn: { ...SOUK_FURN, ...(cfg.furn || {}) },
    rackGoods: cfg.rackGoods || [0xb8301a, 0xe8a33d, 0x6a7a2a],
    floors: { ...DEF_FLOORS, ...(cfg.floors || {}) },
    floorRep: { sand: 3, zellige: 1.2, carpet: 3, plaster: 3, planks: 2, ...(cfg.floorRep || {}) },
    hallCells: [[5, 29], [6, 29], ...[20, 21, 22, 23, 24, 25].map((x) => [x, 29]), ...(cfg.hallCells || [])],
    doorFloor: 'plaster',
    doorSigns: { '5,17': 'PRIVÉ', ...(cfg.doorSigns || {}) },
    neon: { diwan: SAFFRON, theehuis: 0x2a8a9a, hall: cfg.hallLight || 0xffc878, store: 0xd8a83a, ...(cfg.neon || {}) },
    lights: cfg.lights || [[5, 23, 0xffd8a0, 1.4], [5, 8, SAFFRON, 1.6], [18, 5, 0xffc878, 1.3], [30, 5, 0xffc878, 1.3], [40, 5, 0xffc878, 1.2], [18, 18, 0xffb060, 1.0], [28, 22, 0xffb060, 1.0], [40, 20, 0xd8a83a, 1.2]],
    mood: { bg: 0x1a0e08, fogNear: 32, fogFar: 80, hemi: 0.62, sun: 0.6, sky: 0xf0c890, ground: 0xc8a070, wall: TERRA, cap: 0xe8d0a0, under: 0x6a4a2a, ...(cfg.mood || {}) },
    van: { park: [16, 4.6], rot: Math.PI, from: W + 14, exit: [16.6, 3.0], solid: [12.7, 18.8, 3.45, 5.75] },
    start: [6, -0.6],
    bounds: [0.5, W - 0.3, -H, 9],
    validateFrom: [6, 26],
    bossLook: cfg.bossLook || { shirt: INDIGO, front: '#2a2e6a', pants: INDIGO, belt: SAFFRON, wrap: SAFFRON, belly: 0.8, skin: 0xc8946a, head: { hair: '#5a5a5a', brow: '#3a3a3a', hairLine: 60, iris: '#2a1a10', beard: '#6a6a6a', glasses: false } },
    spawns: [
      [4, 22, 'makarov', Math.PI, 'theehuis', false, { argue: 'tea' }], [5, 22.8, 'machete', 0, 'theehuis', false, { argue: 'tea' }],
      ...(cfg.diwanSpawns || [[5, 4, 'revolver', 0, 'diwan', true], [8, 10, 'makarov', -Math.PI / 2, 'diwan']]),
      ...cfg.courtSpawns, ...cfg.hallSpawns, ...(cfg.storeSpawns || [[39, 16, 'machete', Math.PI / 2, 'store'], [42, 24, 'makarov', -Math.PI / 2, 'store']]),
    ],
    loot: [[1.5, 16], [9.5, 1.5], [44, 1.5], [44, 27.5], [12.5, 27.5], ...(cfg.loot || [])],
    text: cfg.text,
    decorate(ctx) {
      const { THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex } = ctx;
      const ticks = [];
      const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
      const sandT = canvasTex(64, 64, DEF_FLOORS.sand);
      // the street: sand blown over the cobbles, a dune bank on the far side
      floorW(OX - 14, OX + W + 14, 0, 2.6, sandT, 2); floorW(OX - 14, OX + W + 14, 2.6, 8.4, T.asphalt, 4); floorW(OX - 30, OX + W + 30, 8.4, 30, sandT, 6);
      for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xd8b884 })); d.scale.set(3 + (i % 3), 0.6 + (i % 2) * 0.4, 1.6); d.position.set(OX - 10 + i * 8, 0, 11 + (i % 3)); root.add(d); }
      // (no palms on the street: they'd stand between the camera and the action)
      // the gate arch over the courtyard entrance, with the clan sign; the tea house sign and lanterns
      box(0.6, WALL_H + 1.4, 0.8, lam({ color: TERRA }), OX + 19.7, (WALL_H + 1.4) / 2, Z0 + 29.5, root); box(0.6, WALL_H + 1.4, 0.8, lam({ color: TERRA }), OX + 26.3, (WALL_H + 1.4) / 2, Z0 + 29.5, root);
      box(7.2, 0.9, 0.8, lam({ color: TERRA }), OX + 23, WALL_H + 0.95, Z0 + 29.5, root);
      sign(cfg.sign || cfg.name.toUpperCase(), 6.2, 0.6, '#2a2e6a', '#e8a33d', OX + 23, WALL_H + 0.95, Z0 + 29.92, 0, 46);
      sign(cfg.kiosk || 'THEEHUIS', 4.8, 0.6, '#1a0e08', '#e8a33d', OX + 5.5, 2.7, Z0 + 29.98, 0, 60); neonRect(root, OX + 5.5, 2.7, 5, 0.75, Z0 + 30.02, SAFFRON);
      for (const x of [4, 7, 21, 25]) { const lan = new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), new THREE.MeshBasicMaterial({ color: 0xffc070 })); lan.position.set(OX + x, 2.5, Z0 + 30.3); root.add(lan); const gl = glowSprite(THREE, 0xffa040, 2.2, 2.2, 0.45); gl.position.copy(lan.position); root.add(gl); }
      const kGlow = glowSprite(THREE, SAFFRON, 6, 3, 0.35); kGlow.position.set(OX + 5.5, 1.6, Z0 + 31); root.add(kGlow);
      // blowing sand over the street
      const grains = new THREE.Points(new THREE.BufferGeometry(), new THREE.PointsMaterial({ color: 0xe8d0a0, size: 0.06, transparent: true, opacity: 0.6 }));
      const N = 500, gp = new Float32Array(N * 3); for (let i = 0; i < N; i++) { gp[i * 3] = OX - 14 + Math.random() * (W + 28); gp[i * 3 + 1] = Math.random() * 1.2; gp[i * 3 + 2] = Math.random() * 9; }
      grains.geometry.setAttribute('position', new THREE.BufferAttribute(gp, 3)); root.add(grains);
      ticks.push((dt) => { for (let i = 0; i < N; i++) { gp[i * 3] += dt * (3 + (i % 5)); if (gp[i * 3] > OX + W + 14) gp[i * 3] = OX - 14; } grains.geometry.attributes.position.needsUpdate = true; });
      const own = cfg.decorate ? cfg.decorate({ ...ctx, sign }) || {} : {};
      return { tasks: own.tasks, onShot: own.onShot, reset: own.reset, tick(dt) { for (const f of ticks) f(dt); if (own.tick) own.tick(dt); } };
    },
  };
}

// Dadelplein's sandstorm (and anything else that wants one): every `every` seconds the wind brings a wall of sand for `dur` seconds.
// Guards see only `sight` metres (ctx.sight), and a sand-coloured haze closes in on the screen. Returns { tick, reset }.
export function sandstorm(ctx, { every = 45, dur = 12, sight = 3, first = 25 } = {}) {
  const { root, run, sight: setSight, banner } = ctx;
  const el = document.createElement('div'); el.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0;transition:opacity .8s;background:radial-gradient(ellipse at center,rgba(216,184,132,0) 8%,rgba(216,184,132,.82) 38%,rgba(196,150,90,.96) 75%)';
  document.body.appendChild(el);
  let next = first, on = false, last = 0;
  const guard = () => { if (!el.isConnected) return; if (!root.parent || !root.visible) el.style.opacity = 0; requestAnimationFrame(guard); }; guard();
  const stop = () => { on = false; el.style.opacity = 0; setSight(Infinity); };
  return {
    reset() { next = first; stop(); last = 0; },
    tick() {
      const R = run(); if (R.time < last) { next = first; stop(); } last = R.time;
      if (R.results) { if (on) stop(); return; }
      if (!on && R.time > next - 4 && R.time < next - 3.9) banner('ZANDSTORM!', 'Sand on the wind. In a few seconds nobody sees further than an arm.', 2.2);
      if (!on && R.time >= next) { on = true; el.style.opacity = 1; setSight(sight); }
      if (on && R.time >= next + dur) { stop(); next = R.time + every; }
    },
    get on() { return on; },
  };
}
