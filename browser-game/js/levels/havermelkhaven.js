// Act 2, mission 3: Havermelkhaven (Hipsterheuvel). Havermelkerij De Volle Korrel: an oat-milk café on the canal, with the Noshgey
// oat-milk plant in an arched hall behind it and a club room at the back. Level data for the mission engine (js/mission.js); see
// spekbuurt.js for the coordinate conventions. Built after the concept art (02_Act2_Havermelkhaven): a canal-side café with a striped
// awning and string lights, a wooden café inside, an arched hall of steel tanks and crate stacks, and a neon club room.
// The twist: shoot a tank and oat milk floods out: everyone near it is knocked flat (Eddy too, if he stands too close).
//   street → terrace → café → kitchen → tank hall → club → office · street → office (PERSONEEL)

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { NOSHGEY } from './noshgey.js';

const W = 44, H = 28;
const TANKS = [[19, 3], [24, 3], [29, 3], [34, 3], [19, 9], [29, 9]]; // 2x2 oat-milk tanks (top-left cell)

export default {
  ...NOSHGEY,
  id: 'havermelkhaven', name: 'Havermelkhaven', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['kitchen', 1, 1, 14, 11, 'tiles'], ['cafe', 1, 13, 14, 22, 'pine'],
    ['hall', 16, 1, 42, 14, 'concrete'], ['club', 16, 16, 30, 22, 'club'], ['office', 32, 16, 42, 22, 'panel'],
    ['street', 1, 24, 42, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(6, 23, 7, 23); carve(0, 24, 0, 27); carve(43, 24, 43, 27);
    putR(6, 12, 7, 12, 'D');    // café ↔ kitchen
    putR(15, 18, 15, 19, 'D');  // café ↔ club
    putR(15, 5, 15, 6, 'D');    // kitchen ↔ tank hall
    putR(22, 15, 23, 15, 'D');  // tank hall ↔ club
    putR(37, 15, 38, 15, 'D');  // tank hall ↔ office
    putR(31, 19, 31, 20, 'D');  // club ↔ office
    putR(40, 23, 41, 23, 'D');  // office ↔ street (PERSONEEL)
    putR(1, 23, 5, 23, '%'); putR(8, 23, 14, 23, '%'); // the café windows
    // café: the counter, shelves of oat-milk cartons, tables
    putR(2, 15, 10, 15, 'K'); putR(13, 13, 14, 13, 'F'); put(3, 19, 'T'); put(7, 20, 'T'); put(11, 18, 'T'); put(14, 22, 'p');
    // kitchen: a carton filling line, crates of cartons
    putR(3, 3, 11, 3, 'q'); putR(3, 7, 7, 8, 'w'); putR(12, 9, 13, 10, 'C'); put(1, 1, 'F');
    // tank hall: steel tanks (drawn by decorate), crate stacks, a pallet of oat sacks
    for (const [x, z] of TANKS) putR(x, z, x + 1, z + 1, 'U');
    putR(24, 10, 25, 11, 'C'); putR(35, 9, 36, 10, 'C'); putR(40, 5, 41, 6, 'C'); putR(39, 12, 42, 12, 'n'); put(16, 14, 'X'); put(42, 1, 'X');
    // club: the bar, booths, a DJ desk
    putR(25, 16, 29, 16, 'B'); putR(30, 21, 30, 22, 'S'); put(20, 20, 'T'); put(26, 20, 'T'); putR(16, 21, 16, 22, 'S');
    // office: desk, safe, a sofa
    putR(35, 18, 37, 18, 'O'); put(42, 16, 'V'); putR(33, 21, 34, 21, 'S');
    // the terrace: tables under the awning, planters, lamps
    put(3, 25, 't'); put(8, 26, 't'); put(13, 25, 't'); putR(18, 24, 21, 24, 'v'); put(26, 26, 't'); put(32, 25, 't'); put(1, 27, 'l'); put(22, 27, 'l'); put(42, 27, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xd8ccb0 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0x6a4426 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    U: { h: 2.0, cover: true, draw: () => {} },
    q: { h: 0.85, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { box(n, 0.12, 0.7, lam({ color: 0x2a2a2a }), cx, 0.8, cz, root); for (const s of [-1, 1]) box(n, 0.8, 0.06, lam({ color: 0x8a8a84 }), cx, 0.4, cz + s * 0.33, root, false); for (let k = 0; k < n * 2; k++) box(0.22, 0.32, 0.22, lam({ color: [0xf3ecdc, 0xa9c46a][(x + k) % 2] }), OX + x + 0.25 + k * 0.5, 1.02, cz, root, false); } },
    n: { h: 0.9, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.32, 0.55), lam({ color: [0xd8c8a0, 0xc8b890][(x + k + j) % 2] })); s.position.set(OX + x + k + 0.5, 0.17 + j * 0.34, cz); root.add(s); } } },
    B: { color: 0x2a3a2a }, S: { color: 0xa9c46a },
  },
  rackGoods: [0xf3ecdc, 0xa9c46a, 0xd8c8a0],
  floors: {
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#b89060', '#a8804e', '#c09866'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    club: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#1a2a24', '#2a3a1a', '#24201a', '#1a2a2a'][(x + y * 3) % 4]; g.fillRect(x * 16, y * 16, 16, 16); } g.strokeStyle = 'rgba(169,196,106,.35)'; g.strokeRect(1, 1, 62, 62); },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { pine: 1.5, club: 2, panel: 1.5, cobble: 1.6 },
  hallCells: [[6, 23], [7, 23]],
  doorSigns: { '40,23': 'PERSONEEL', '15,5': 'FABRIEK', '31,19': 'KANTOOR' },
  neon: { kitchen: 0xf2c14e, cafe: 0xf3e6c8, hall: 0xe0e8f0, club: 0xa9c46a, office: 0xe8a33d, street: 0xe8a33d },
  lights: [[7, 18, 0xf3e6c8, 1.7], [7, 6, 0xf2c14e, 1.2], [22, 6, 0xe8ecf0, 1.5], [32, 6, 0xe8ecf0, 1.5], [26, 12, 0xe8ecf0, 1.2], [38, 10, 0xe8ecf0, 1.1], [23, 19, 0xa9c46a, 1.4], [37, 19, 0xe8a33d, 1.3], [8, 26, 0xf2c14e, 1.1], [30, 26, 0xf2c14e, 1.0]],
  mood: { bg: 0x081018, fogNear: 32, fogFar: 78, hemi: 0.5, sun: 0.55, sky: 0xf0f0dc, ground: 0x3a4038, wall: 0x6a3428, cap: 0xe8dcc8, under: 0x3a2a24 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [7, -0.7],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [7, 25.5],
  bossLook: { cap: 0x6a4426, shirt: 0xd8ccb0, front: '#d8ccb0', pants: 0x3a3a2a, belly: 0.5, head: { hair: '#c89a5a', brow: '#8a6a3a', hairLine: 52, iris: '#3a5a3a' } }, // Barista Bram: beanie, oat-coloured apron
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [11, 25.5, 'bat', Math.PI / 2, 'street'], [28, 25.5, 'makarov', -Math.PI / 2, 'street'],
    [4, 17, 'makarov', Math.PI, 'cafe'], [10, 21, 'bat', Math.PI, 'cafe'], [13, 16.5, 'bat', -Math.PI / 2, 'cafe'],
    [6, 5, 'bat', 0, 'kitchen'], [10, 9, 'makarov', -Math.PI / 2, 'kitchen'],
    [22, 6.5, 'makarov', Math.PI / 2, 'hall'], [27, 6.5, 'bat', Math.PI, 'hall'], [32, 7, 'makarov', -Math.PI / 2, 'hall'], [38, 3, 'bat', -Math.PI / 2, 'hall'], [24, 13, 'shotgun', 0, 'hall'], [33, 12, 'bat', Math.PI, 'hall'],
    [21, 18.5, 'makarov', Math.PI, 'club'], [27, 21, 'bat', Math.PI / 2, 'club'],
    [36, 17, 'shotgun', 0, 'office', true], [40, 21, 'makarov', -Math.PI / 2, 'office'],
  ],
  loot: [[1.5, 10.5], [14, 1.5], [21.5, 13.5], [42, 3.5], [29.5, 22], [41.5, 17.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · HAVERMELKHAVEN',
    banner: ['DE VOLLE KORREL', 'Havermelkhaven. Oat milk by the tank.'],
    objective: 'Take <b>De Volle Korrel</b> and the oat-milk plant behind it. <b>Shoot a tank</b> and the flood knocks everyone near it flat. Barista Bram runs it from the back office. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Havermelkhaven is <b>yours</b>. The oat milk is all over the floor. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Havermelkhaven is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'HAVERMELKHAVEN TAKEN',
    resultsHint: 'The tanks are empty and the Noshgey slipped up. Grab the spice crates (E), then drive home.',
    ownedBanner: ['HAVERMELKHAVEN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['BARISTA BRAM IS DOWN', 'Extra froth.'],
    tips: ['Shoot an oat-milk tank when Noshgey stand near it: the flood knocks them down. Hit them again on the floor.', 'Don\'t stand next to a tank you shoot.', 'Tanks and crate stacks stop bullets in the hall.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, spill }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    // the striped awning, the café sign, string lights
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(14, 2), lam({ side: THREE.DoubleSide, map: canvasTex(64, 16, (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = (x / 8) % 2 ? '#f3e6c8' : '#5a6a3a'; g.fillRect(x, 0, 8, 16); } }) }));
    awn.rotation.x = -Math.PI / 3; awn.position.set(OX + 7.5, 2.5, Z0 + 23.8); root.add(awn);
    sign('DE VOLLE KORREL', 6, 0.6, '#0a140c', '#f3e6c8', OX + 7.5, 3.2, Z0 + 23.02, 0, 64); neonRect(root, OX + 7.5, 3.2, 6.2, 0.75, Z0 + 23.06, 0xa9c46a);
    sign('OAT', 1.4, 0.6, '#0a140c', '#f2c14e', OX + 1.6, 2.0, Z0 + 23.6, -Math.PI / 4, 60);
    sign('HAVERMELKERIJ · CLUB', 5, 0.42, '#140a0a', '#e8a33d', OX + 24, 2.7, Z0 + 23.02, 0, 40);
    for (let x = 1; x < 42; x += 1.5) { const b = glowSprite(THREE, 0xf2c14e, 0.5, 0.5, 0.8); b.position.set(OX + x, 3.0 + Math.sin(x * 0.7) * 0.2, Z0 + 25 + (x % 3) * 0.3); root.add(b); }
    // the arched hall roof trusses along the walls
    for (let x = 17; x <= 42; x += 4) for (const z of [0.6, 14.4]) box(0.25, 0.9, 0.5, lam({ color: 0x3a3e44 }), OX + x, WALL_H + 0.45, Z0 + z, root, false);
    // oat-milk tanks: shoot one and it bursts
    const tanks = new Map();
    for (const [x, z] of TANKS) {
      const g = new THREE.Group(); g.position.set(OX + x + 1, 0, Z0 + z + 1); root.add(g);
      cyl(0.95, 0.95, 2.2, lam({ color: 0xc8ccd0 }), 0, 1.1, 0, g, 18); const top = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xd8dce0 })); top.position.y = 2.2; g.add(top);
      g.add(sign('HAVER', 1.2, 0.35, '#f3ecdc', '#5a6a3a', 0, 1.3, 0.96, 0, 40));
      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 24), new THREE.MeshPhongMaterial({ color: 0xf3ecdc, transparent: true, opacity: 0.85, shininess: 90 })); pool.rotation.x = -Math.PI / 2; pool.position.set(OX + x + 1, 0.03, Z0 + z + 1.4); pool.visible = false; root.add(pool);
      const t = { g, top, pool, burst: false, grow: 0 };
      for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) tanks.set(`${x + dx},${z + dz}`, t);
    }
    const pl = []; for (let z = 24; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 8]], 800));
    const all = [...new Set(tanks.values())];
    return {
      onShot(ch, x, z) { const t = tanks.get(`${x},${z}`); if (!t || t.burst) return false; t.burst = true; t.pool.visible = true; t.top.visible = false; spill(t.g.position, 2.8, { text: 'HAVERMELK!', color: 0xf3ecdc }); return true; },
      tick(dt) { for (const f of ticks) f(dt); for (const t of all) if (t.burst && t.grow < 1) { t.grow = Math.min(1, t.grow + dt * 2); t.pool.scale.setScalar(0.1 + t.grow * 0.9); } },
    };
  },
};
