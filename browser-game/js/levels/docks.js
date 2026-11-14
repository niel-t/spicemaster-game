// Act 3 (the Abdavissies, De Duistere Dokken): every concept picture shares one layout (03_Act3_*): a storm-lashed quay with a crane,
// a lit kiosk front, a big warehouse behind it and a red private room. dock(cfg) builds a level def on that layout; each territory
// file fills the warehouse and adds its own twist. See spekbuurt.js for the coordinate conventions.
//
//   grid 46 × 30:  red room x1-10 z1-12 · kiosk x1-10 z14-23 · warehouse x12-44 z1-23 · quay x1-44 z25-29 (open to the sea edge)
//   doors: kiosk front 5-6,24 · kiosk ↔ red room 5-6,13 · kiosk ↔ warehouse 11,18-19 · red room ↔ warehouse 11,5-6
//          warehouse loading doors 20-23,24 and 36-37,24 (PERSONEEL)

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';

export const W = 46, H = 30;

export const ABDAVISSIES = {
  faction: 'ABDAVISSIES', factionName: 'Abdavissie',
  foeHp: 2,
  foeCap: 0x1a2a3a,
  foeLooks: [ // rust, navy and wet-weather yellow: dock coats, oilskins, knit caps
    { front: '#7a2e1a', shirt: 0x7a2e1a, pants: 0x1a2030 }, { front: '#1a2a3a', shirt: 0x1a2a3a, pants: 0x2a2a2a },
    { front: '#d8a83a', shirt: 0xd8a83a, pants: 0x1a2030 }, { front: '#3a3a3a', shirt: 0x3a3a3a, pants: 0x5a3a24 },
  ],
  alertLines: ['Wie heeft jou binnengelaten?', 'Dit is een privékade!', 'Pak hem, en gooi hem in het water!', 'Abdavissies houden niet van pottenkijkers.', 'Eddy junior. Je vader zei hetzelfde.', 'Geen vragen. Geen getuigen.'],
};

const DEF_FLOORS = {
  quay: (g) => { g.fillStyle = '#2e3236'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 16) for (let x = (y / 16) % 2 ? 0 : 16; x < 64; x += 32) { g.fillStyle = ['#3a3e42', '#34383c'][(x + y) % 2]; g.fillRect(x + 1, y + 1, 30, 14); } },
  kiosk: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#d8ccb0' : '#7a2e1a'; g.fillRect(x * 16, y * 16, 16, 16); } },
  red: (g) => { g.fillStyle = '#4a1414'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#8a2a1a'; g.lineWidth = 2; g.strokeRect(6, 6, 52, 52); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } },
  depot: (g) => { g.fillStyle = '#5e5a52'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#d8a83a'; g.fillRect(0, 0, 64, 2); },
};

export function dock(cfg) {
  const red = cfg.red || 'red', hall = cfg.hall || 'depot';
  return {
    ...ABDAVISSIES, ...(cfg.faction || {}),
    id: cfg.id, name: cfg.name, W, H,
    taskName: cfg.taskName, hazard: cfg.hazard,
    rooms: [
      ['redroom', 1, 1, 10, 12, red], ['kiosk', 1, 14, 10, 23, 'kiosk'], ['hall', 12, 1, 44, 23, hall], ['quay', 1, 25, 44, 29, 'quay'],
      ...(cfg.extraRooms || []),
    ],
    layout(api) {
      const { carve, put, putR } = api;
      carve(5, 24, 6, 24); carve(20, 24, 23, 24); carve(0, 25, 0, 29); carve(45, 25, 45, 29);
      putR(5, 13, 6, 13, 'D'); putR(11, 18, 11, 19, 'D'); putR(11, 5, 11, 6, 'D'); putR(36, 24, 37, 24, 'D');
      putR(1, 24, 4, 24, '%'); putR(7, 24, 10, 24, '%');
      // kiosk: the counter, a fridge, a stool row
      putR(2, 16, 8, 16, 'K'); put(10, 14, 'F'); put(3, 20, 'T'); put(8, 21, 'T');
      // red room: the default private room (a level can replace it with cfg.redLayout)
      if (cfg.redLayout) cfg.redLayout(api); else { putR(3, 3, 6, 3, 'O'); put(1, 1, 'V'); putR(9, 7, 10, 9, 'S'); put(3, 9, 'T'); put(10, 1, 'p'); }
      // the quay: bollards, crates, a barrel; the crane foot is drawn by decorate
      for (const x of [3, 15, 27, 39]) put(x, 29, 'o'); putR(14, 26, 15, 26, 'C'); putR(30, 27, 31, 27, 'C'); put(43, 26, 'X'); put(1, 27, 'l'); put(25, 28, 'l');
      cfg.hallLayout(api);
    },
    furn: {
      ...STREET_FURN,
      K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x3a2a1a }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xd8ccb0 }), cx, 1.03, cz, root, false); } },
      S: { color: 0x7a1a1a }, O: { color: 0x3a2010 }, R: { color: 0x3a3e44 }, C: { color: 0x6a5032 },
      ...(cfg.furn || {}),
    },
    rackGoods: cfg.rackGoods || [0x7a2e1a, 0xd8a83a, 0x5a4a3a],
    floors: { ...DEF_FLOORS, ...(cfg.floors || {}) },
    floorRep: { quay: 2.5, kiosk: 1.2, red: 2.2, depot: 3, ...(cfg.floorRep || {}) },
    hallCells: [[5, 24], [6, 24], [20, 24], [21, 24], [22, 24], [23, 24], ...(cfg.hallCells || [])],
    doorSigns: { '36,24': 'PERSONEEL', '11,5': 'PRIVÉ', ...(cfg.doorSigns || {}) },
    neon: { redroom: 0xc2412d, kiosk: 0xd8a83a, hall: cfg.hallLight || 0xffd8a0, quay: 0x4a6a7a, ...(cfg.neon || {}) },
    lights: cfg.lights || [[5, 19, 0xd8ccb0, 1.5], [5, 6, 0xc2412d, 1.6], [20, 6, 0xffd8a0, 1.4], [33, 6, 0xffd8a0, 1.4], [20, 17, 0xffd8a0, 1.4], [33, 17, 0xffd8a0, 1.4], [42, 12, 0x6ad8c8, 1.0], [8, 27, 0xd8a83a, 0.9], [30, 27, 0x6a8aa8, 0.6]],
    mood: { bg: 0x050a10, fogNear: 30, fogFar: 76, hemi: 0.5, sun: 0.45, sky: 0xc8d8e0, ground: 0x2a2e30, wall: 0x4a3a30, cap: 0xb8b0a0, under: 0x2a2420, ...(cfg.mood || {}) },
    van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] },
    start: [6, -0.6],
    bounds: [0.5, W - 0.3, -H, 9],
    validateFrom: [6, 26.5],
    bossLook: cfg.bossLook,
    spawns: [
      [9, 27, 'makarov', Math.PI / 2, 'quay'], [26, 26.5, 'bat', Math.PI, 'quay'], [40, 28, 'makarov', -Math.PI / 2, 'quay'],
      [4, 18.5, 'makarov', Math.PI, 'kiosk'], [9, 22, 'bat', -Math.PI / 2, 'kiosk'],
      ...(cfg.redSpawns || [[5, 1.8, 'shotgun', 0, 'redroom', true], [8, 5, 'makarov', -Math.PI / 2, 'redroom']]),
      ...cfg.hallSpawns,
    ],
    loot: [[1.5, 12], [10, 1.5], [44, 1.5], [44, 22.5], [12.5, 22.5], ...(cfg.loot || [])],
    text: cfg.text,
    decorate(ctx) {
      const { THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex } = ctx;
      const ticks = [];
      const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
      // the dock road and the stormy sea beyond the quay
      floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 8.4, T.asphalt, 4);
      ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, Z0 - 20, OX, 9)); ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 20, OX + W + 30, 9));
      ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, 9, OX + W + 30, 30));
      // the crane on the quay corner
      const cr = new THREE.Group(); cr.position.set(OX - 3, 0, Z0 + 27); root.add(cr);
      for (const dx of [-1, 1]) for (const dz of [-1, 1]) box(0.3, 9, 0.3, lam({ color: 0x8a2e1a }), dx, 4.5, dz, cr);
      box(2.4, 1.6, 2.4, lam({ color: 0x8a2e1a }), 0, 9.6, 0, cr); const jib = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 14), lam({ color: 0x8a2e1a })); jib.position.set(0, 10.6, -5); cr.add(jib);
      // the kiosk front: a lit sign over the hatch, the warehouse sign
      sign(cfg.kiosk || 'SHOARMA', 4.8, 0.6, '#0a0a10', '#d8a83a', OX + 5.5, 2.7, Z0 + 24.02, 0, 60); neonRect(root, OX + 5.5, 2.7, 5, 0.75, Z0 + 24.06, 0xd8a83a);
      sign(cfg.sign || cfg.name.toUpperCase(), 9, 0.6, '#1a1a1a', '#c8d8e0', OX + 28, 3.0, Z0 + 24.02, 0, 48);
      const kGlow = glowSprite(THREE, 0xd8a83a, 6, 3, 0.4); kGlow.position.set(OX + 5.5, 1.6, Z0 + 25); root.add(kGlow);
      // rain and spray
      const pl = []; for (let z = 25; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.08) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.5]);
      puddles(THREE, root, pl);
      ticks.push(rain(THREE, root, [[OX - 14, Z0 + 25, OX + W + 14, 9]], 1300));
      const own = cfg.decorate ? cfg.decorate({ ...ctx, sign }) || {} : {};
      return { tasks: own.tasks, onShot: own.onShot, tick(dt) { for (const f of ticks) f(dt); if (own.tick) own.tick(dt); } };
    },
  };
}
