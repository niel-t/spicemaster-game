// Act 3 (the Abdavissies, De Duistere Dokken): every territory sits on the same storm-lashed quay (03_Act3_*): a crane, the dock road,
// the sea. dock(cfg) builds a level def around that outside; each territory file brings its own building (cfg.plan: floor plan,
// rooms, furniture, spawns, signs) and its own twist. See spekbuurt.js for the coordinate conventions.
//
//   grid 46 × 30:  the building x1-44 z1-23 behind a front wall on row 24 · quay x1-44 z25-29 (open to the sea edge)
//   start bottom-left on the quay at 6,29; everything must be reachable from 6,26.

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

// Each territory brings its own building (cfg.plan): rooms, walls and doors, furniture, spawns, loot, lights and the signs on its
// front. Only the outside is shared: the quay strip z25-29 along the bottom (start bottom-left at cell 6,29), the dock road and the
// stormy sea. A plan:
//   { rooms: [[name, x0, z0, x1, z1, floor]], layout(api), spawns, loot, lights, hallCells, doorSigns, roomNames, neon,
//     signs: [[text, x, width, fg?, z?]] (on the front wall, z defaults to row 24; the first is the lit kiosk sign),
//     crane: [x, z, rotY] cell (or null), quay(api) to replace the default quay clutter, quaySpawns, rain: [[x0, z0, x1, z1]] }
// The old shared layout (kiosk + red room on the left, one big hall) stays as classic(cfg) for a level without a plan.
function classic(cfg) {
  return {
    rooms: [['redroom', 1, 1, 10, 12, cfg.red || 'red'], ['kiosk', 1, 14, 10, 23, 'kiosk'], ['hall', 12, 1, 44, 23, cfg.hall || 'depot']],
    layout(api) {
      const { carve, put, putR } = api;
      carve(5, 24, 6, 24); carve(20, 24, 23, 24);
      putR(5, 13, 6, 13, 'D'); putR(11, 18, 11, 19, 'D'); putR(11, 5, 11, 6, 'D'); putR(36, 24, 37, 24, 'D');
      putR(1, 24, 4, 24, '%'); putR(7, 24, 10, 24, '%');
      putR(2, 16, 8, 16, 'K'); put(10, 14, 'F'); put(3, 20, 'T'); put(8, 21, 'T');
      if (cfg.redLayout) cfg.redLayout(api); else { putR(3, 3, 6, 3, 'O'); put(1, 1, 'V'); putR(9, 7, 10, 9, 'S'); put(3, 9, 'T'); put(10, 1, 'p'); }
      cfg.hallLayout(api);
    },
    hallCells: [[5, 24], [6, 24], [20, 24], [21, 24], [22, 24], [23, 24]],
    doorSigns: { '36,24': 'PERSONEEL', '11,5': 'PRIVÉ' },
    neon: { redroom: 0xc2412d, kiosk: 0xd8a83a, hall: cfg.hallLight || 0xffd8a0 },
    lights: [[5, 19, 0xd8ccb0, 1.5], [5, 6, 0xc2412d, 1.6], [20, 6, 0xffd8a0, 1.4], [33, 6, 0xffd8a0, 1.4], [20, 17, 0xffd8a0, 1.4], [33, 17, 0xffd8a0, 1.4], [42, 12, 0x6ad8c8, 1.0], [8, 27, 0xd8a83a, 0.9], [30, 27, 0x6a8aa8, 0.6]],
    spawns: [[4, 18.5, 'makarov', Math.PI, 'kiosk'], [9, 22, 'bat', -Math.PI / 2, 'kiosk'], ...(cfg.redSpawns || [[5, 1.8, 'shotgun', 0, 'redroom', true], [8, 5, 'makarov', -Math.PI / 2, 'redroom']]), ...cfg.hallSpawns],
    loot: [[1.5, 12], [10, 1.5], [44, 1.5], [44, 22.5], [12.5, 22.5]],
    signs: [[cfg.kiosk || 'SHOARMA', 5.5, 4.8, '#d8a83a'], [cfg.sign || cfg.name.toUpperCase(), 28, 9, '#c8d8e0']],
    crane: [-3, 27],
  };
}

// dock furniture every plan can use: shipping containers, pallets, oil drums, a low wire fence
const CONT = [0x7a2e1a, 0x2a4a6a, 0x5a6a3a, 0xd8a83a, 0x3a5a5a];
export const DOCK_FURN = {
  N: { h: 2.6, cover: true, sight: true, draw: ({ THREE, box, lam, root, n, cx, cz, x, z }) => { // a container (one row each), ribbed, with doors on the end
    const c = CONT[(x * 7 + z * 3) % CONT.length]; box(n - 0.06, 2.6, 0.96, lam({ color: c }), cx, 1.3, cz, root);
    const rib = lam({ color: new THREE.Color(c).multiplyScalar(0.75).getHex() });
    for (let k = 0.5; k < n - 0.3; k += 0.5) for (const s of [-1, 1]) box(0.06, 2.4, 0.03, rib, cx - n / 2 + k, 1.3, cz + s * 0.49, root, false);
  } },
  q: { h: 0.25, cover: false, draw: ({ box, lam, root, n, cx, cz }) => { // wooden pallets
    for (const dz of [-0.35, 0, 0.35]) box(n - 0.1, 0.06, 0.2, lam({ color: 0xa87a4a }), cx, 0.2, cz + dz, root, false);
    for (const s of [-1, 1]) box(0.1, 0.14, 0.9, lam({ color: 0x8a6038 }), cx + s * (n / 2 - 0.15), 0.08, cz, root, false);
  } },
  e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) cyl(0.4, 0.4, 1.0, lam({ color: [0x2a4a7a, 0x3a3e44][(x + k) % 2] }), OX + x + k + 0.5, 0.5, cz, root, 14); } }, // oil drums
  f: { h: 1.3, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz }) => { // a wire fence: posts and a see-through mesh panel
    for (let k = 0; k <= n; k++) box(0.07, 1.4, 0.07, lam({ color: 0x5a5e62 }), cx - n / 2 + k, 0.7, cz, root, false);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(n, 1.2), new THREE.MeshBasicMaterial({ color: 0x8a9298, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false })); m.position.set(cx, 0.75, cz); root.add(m);
  } },
};

export function dock(cfg) {
  const P = cfg.plan || classic(cfg);
  const quaySpawns = P.quaySpawns || [[13, 27.5, 'makarov', Math.PI / 2, 'quay'], [26, 26.5, 'bat', Math.PI, 'quay'], [40, 28, 'makarov', -Math.PI / 2, 'quay']];
  return {
    ...ABDAVISSIES, ...(cfg.faction || {}),
    id: cfg.id, name: cfg.name, W, H,
    taskName: cfg.taskName, hazard: cfg.hazard,
    rooms: [...P.rooms, ['quay', 1, 25, 44, 29, P.quayFloor || 'quay'], ...(cfg.extraRooms || [])],
    layout(api) {
      const { carve, put, putR } = api;
      carve(0, 25, 0, 29); carve(45, 25, 45, 29);
      P.layout(api);
      // the quay: bollards along the sea edge, then the plan's own clutter (or a few crates, a barrel and two lamps)
      for (const x of [3, 15, 27, 39]) put(x, 29, 'o');
      if (P.quay) P.quay(api); else { putR(14, 26, 15, 26, 'C'); putR(30, 27, 31, 27, 'C'); put(43, 26, 'X'); put(1, 27, 'l'); put(25, 28, 'l'); }
    },
    furn: {
      ...STREET_FURN,
      K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x3a2a1a }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xd8ccb0 }), cx, 1.03, cz, root, false); } },
      S: { color: 0x7a1a1a }, O: { color: 0x3a2010 }, R: { color: 0x3a3e44 }, C: { color: 0x6a5032 }, w: { color: 0x6a6a64 },
      ...DOCK_FURN,
      ...(cfg.furn || {}),
    },
    rackGoods: cfg.rackGoods || [0x7a2e1a, 0xd8a83a, 0x5a4a3a],
    floors: { ...DEF_FLOORS, ...(cfg.floors || {}) },
    floorRep: { quay: 2.5, kiosk: 1.2, red: 2.2, depot: 3, ...(cfg.floorRep || {}) },
    hallCells: [...(P.hallCells || []), ...(cfg.hallCells || [])],
    doorSigns: { ...(P.doorSigns || {}), ...(cfg.doorSigns || {}) },
    roomNames: P.roomNames,
    neon: { quay: 0x4a6a7a, ...(P.neon || {}), ...(cfg.neon || {}) },
    lights: cfg.lights || P.lights,
    mood: { bg: 0x050a10, fogNear: 30, fogFar: 76, hemi: 0.5, sun: 0.45, sky: 0xc8d8e0, ground: 0x2a2e30, wall: 0x4a3a30, cap: 0xb8b0a0, under: 0x2a2420, ...(cfg.mood || {}) },
    van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] },
    start: [6, -0.6],
    bounds: [0.5, W - 0.3, -H, 9],
    validateFrom: [6, 26.5],
    bossLook: cfg.bossLook,
    spawns: [...quaySpawns, ...P.spawns],
    loot: [...P.loot, ...(cfg.loot || [])],
    text: cfg.text,
    decorate(ctx) {
      const { THREE, root, OX, Z0, G, box, lam, floorW, T, neonRect, signTex, canvasTex } = ctx;
      const ticks = [];
      const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
      // the dock road and the stormy sea beyond the quay
      floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 8.4, T.asphalt, 4);
      ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, Z0 - 20, OX, 9)); ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 20, OX + W + 30, 9));
      ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, 9, OX + W + 30, 30));
      // the crane on the quay
      if (P.crane) {
        const cr = new THREE.Group(); cr.position.set(OX + P.crane[0], 0, Z0 + P.crane[1]); cr.rotation.y = P.crane[2] || 0; root.add(cr);
        const cm = lam({ color: cfg.craneColor || 0x8a2e1a });
        for (const dx of [-1, 1]) for (const dz of [-1, 1]) box(0.3, 9, 0.3, cm, dx, 4.5, dz, cr);
        box(2.4, 1.6, 2.4, cm, 0, 9.6, 0, cr); const jib = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 14), cm); jib.position.set(0, 10.6, -5); cr.add(jib);
      }
      // the signs on the front: the first one is the lit kiosk sign
      P.signs.forEach(([t, x, w, fg, z], i) => {
        const zz = Z0 + (z ?? 24) + 0.02, col = fg || (i ? '#c8d8e0' : '#d8a83a');
        sign(t, w, 0.6, i ? '#1a1a1a' : '#0a0a10', col, OX + x, i ? 3.0 : 2.7, zz, 0, i ? 48 : 60);
        if (!i) { const c = new THREE.Color(col).getHex(); neonRect(root, OX + x, 2.7, w + 0.2, 0.75, zz + 0.04, c); const gl = glowSprite(THREE, c, 6, 3, 0.4); gl.position.set(OX + x, 1.6, zz + 1); root.add(gl); }
      });
      // rain and spray (the quay, plus any open yards the plan has)
      const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 25 || (P.wet && P.wet(x, z))) && Math.random() < 0.08) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.5]);
      puddles(THREE, root, pl);
      ticks.push(rain(THREE, root, [[OX - 14, Z0 + 25, OX + W + 14, 9], ...(P.rain || []).map(([x0, z0, x1, z1]) => [OX + x0, Z0 + z0, OX + x1 + 1, Z0 + z1 + 1])], 1300));
      const own = cfg.decorate ? cfg.decorate({ ...ctx, sign }) || {} : {};
      return { tasks: own.tasks, onShot: own.onShot, tick(dt) { for (const f of ticks) f(dt); if (own.tick) own.tick(dt); } };
    },
  };
}
