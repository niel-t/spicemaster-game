// Mission 2: Kroketkade. Snackbar Kroketkade, a brick corner snackbar on a cobbled quay that juts into the canal. Night, rain.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (00_Start_Kroketkade): the wet brick quay wraps the south and east sides, canal water beyond the bollards.
//
// Rooms: the warm yellow shop (counter, döner, snack display, tables by the window), the checkered kitchen behind it (fryers,
// prep tables, fridge), a storeroom top-left, a narrow staff room and back corridor, and the big purple garage at the back right
// with its roller shutter open onto the east quay. Two ways in: the glass front door and the roller shutter.
//   quay → shop → kitchen → corridor → garage → shutter → quay
//   shop → staff room → storeroom → corridor

import { rain, puddles, water, STREET_FURN } from './props.js';

const W = 31, H = 24;

export default {
  id: 'kroketkade', name: 'Kroketkade', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['storeroom', 1, 1, 5, 5, 'concrete'], ['staff', 1, 7, 5, 9, 'hall'], ['corridor', 7, 1, 13, 2, 'hall'], ['kitchen', 7, 4, 13, 9, 'checkbw'],
    ['shop', 1, 11, 13, 15, 'warm'], ['garage', 15, 1, 22, 15, 'garage'],
    ['quay', 1, 17, 29, 22, 'brick'], ['quayeast', 24, 1, 29, 16, 'brick'],
  ],
  layout({ carve, put, putR }) {
    // doors
    putR(6, 1, 6, 2, 'D');     // storeroom ↔ corridor
    putR(2, 6, 3, 6, 'D');     // storeroom ↔ staff room
    putR(6, 8, 6, 9, 'D');     // staff room ↔ kitchen
    putR(9, 3, 10, 3, 'D');    // kitchen ↔ back corridor
    putR(14, 1, 14, 2, 'D');   // back corridor ↔ garage
    putR(2, 10, 3, 10, 'D');   // staff room ↔ shop
    putR(10, 10, 11, 10, 'D'); // kitchen ↔ shop (behind the counter)
    putR(7, 16, 8, 16, 'D');   // the glass front door
    carve(23, 10, 23, 13);     // the garage roller shutter, rolled up
    carve(0, 17, 0, 22);       // the quay runs on west (the Oofmobiel comes from there)
    // the quay edge: bollards and a kerb, canal beyond
    putR(0, 23, 30, 23, '_'); putR(30, 1, 30, 22, '_'); for (const z of [3, 8, 13, 18]) put(30, z, 'o');
    for (let x = 2; x < 30; x += 5) put(x, 23, 'o');
    // glass: the shop windows on the quay
    putR(1, 16, 6, 16, '%'); putR(9, 16, 13, 16, '%');
    // storeroom: metal shelving, boxes
    putR(1, 1, 1, 4, 'R'); putR(3, 1, 3, 3, 'R'); put(5, 4, 'C'); put(5, 5, 'C');
    // staff room: lockers, a little table
    putR(1, 7, 1, 9, 'F'); put(4, 7, 'T');
    // kitchen: fryers under the hood, the tall fridge, steel prep tables
    putR(11, 4, 13, 4, 'Y'); putR(7, 4, 7, 5, 'F'); putR(9, 6, 11, 6, 'w');
    // shop: the counter with the döner and the heated display, bistro tables by the window
    putR(5, 12, 12, 12, 'K'); put(2, 14, 't'); put(4, 14, 't'); putR(11, 14, 12, 14, 't');
    // garage: stacked boxes, the dumpster, pallets, red barrels
    putR(16, 2, 17, 3, 'C'); putR(20, 2, 21, 2, 'C'); putR(16, 8, 17, 9, 'C'); putR(21, 5, 22, 6, 'U'); putR(18, 11, 19, 12, 'q'); putR(16, 13, 17, 13, 'q'); put(22, 1, 'X'); put(15, 14, 'X');
    // quay: parked bikes, street lamps, a crate stack, a barrel; the Oofmobiel's spot ('A')
    putR(10, 18, 12, 18, 'k'); put(3, 17, 'l'); put(14, 17, 'l'); put(27, 10, 'l'); put(27, 3, 'l'); putR(17, 19, 18, 19, 'C'); put(28, 15, 'X');
    putR(18, 20, 24, 22, 'A');
  },
  furn: {
    ...STREET_FURN,
    F: { color: 0xd8dcd8 },
    Y: { h: 1.0, cover: true, draw: ({ THREE, root, box, lam, n, h, cx, cz, x, OX }) => { // steel fryers with baskets
      box(n - 0.06, h, 0.9, lam({ color: 0xb8c0c4 }), cx, h / 2, cz, root);
      for (let k = 0; k < n; k++) { const oil = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.55), new THREE.MeshBasicMaterial({ color: 0xd8a030 })); oil.rotation.x = -Math.PI / 2; oil.position.set(OX + x + k + 0.5, h + 0.01, cz); root.add(oil); box(0.3, 0.05, 0.25, lam({ color: 0x3a3a3a }), OX + x + k + 0.5, h + 0.12, cz - 0.1, root, false); }
    } },
    U: { h: 1.3, cover: true, draw: ({ box, lam, root, n, h, cx, cz }) => { // dumpster
      box(n - 0.1, h, 0.95, lam({ color: 0x2a5a3a }), cx, h / 2, cz, root); box(n, 0.08, 1.0, lam({ color: 0x1a3a24 }), cx, h + 0.04, cz, root, false);
    } },
    q: { h: 0.25, cover: false, draw: ({ box, lam, root, n, cx, cz }) => { // wooden pallet
      for (const dz of [-0.35, 0, 0.35]) box(n - 0.1, 0.06, 0.2, lam({ color: 0xa87a4a }), cx, 0.2, cz + dz, root, false);
      for (const s of [-1, 1]) box(0.1, 0.14, 0.9, lam({ color: 0x8a6038 }), cx + s * (n / 2 - 0.15), 0.08, cz, root, false);
    } },
    _: { h: 0.4, cover: false, draw: ({ box, lam, root, n, h, cx, cz }) => { box(n, h, 0.9, lam({ color: 0x5a564e }), cx, h / 2, cz, root); } },
  },
  rackGoods: [0xc89a5a, 0xe8d8b0, 0xa8784a],
  floors: {
    warm: (g) => { g.fillStyle = '#e8c870'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#c8a050'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    checkbw: (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#1a1a1e' : '#e8ece6'; g.fillRect(x * 32, y * 32, 32, 32); } for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(140,110,40,.18)'; g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 8, 5, 0, 0, 7); g.fill(); } },
    brick: (g) => { g.fillStyle = '#4a3430'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < 64; x += 16) { g.fillStyle = ['#6a4038', '#5a3830', '#74483c'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 14, 6); } },
  },
  floorRep: { brick: 1.4, warm: 1.2, checkbw: 1.0 },
  hallCells: [[23, 10], [23, 11], [23, 12], [23, 13], [0, 17], [0, 18], [0, 19], [0, 20], [0, 21], [0, 22]],
  doorSigns: { '7,16': 'KROKETKADE' },
  neon: { storeroom: 0xffd8a0, staff: 0xe8f4ff, corridor: 0xe8f4ff, kitchen: 0xc8ffd0, shop: 0xffd27a, garage: 0x9a5aff, quay: 0x3ff0ff },
  lights: [[7, 13, 0xffd27a, 2.4], [10, 6.5, 0xc8ffd8, 1.9], [18.5, 7, 0x9a5aff, 1.8], [10, 1.5, 0xe8f4ff, 1.1], [3, 3, 0xffd8a0, 1.0], [3, 8, 0xe8f4ff, 0.9], [8, 20, 0x5a9aff, 1.6], [21, 20, 0x5a9aff, 1.4], [27, 8, 0x5a9aff, 1.5]],
  mood: { bg: 0x050b1a, fogNear: 24, fogFar: 62, hemi: 0.42, sun: 0.55, wall: 0x6a3428, cap: 0xd8c8b8, under: 0x3a3440 },
  van: { park: [21, -2.4], rot: 0, from: -16, exit: [20, -4.6], solid: [18.2, 24.3, -3.55, -1.25] }, // world; arrives along the quay from the west, nose first
  start: [8, -5.6],              // world: on the quay in front of the glass door
  bounds: [0.5, W - 0.4, -H, -0.6], // world: the canal stops you
  validateFrom: [8, 17.5],       // cell: the front door
  bossLook: { shirt: 0xf2efe6, front: '#f2efe6', pants: 0x2a2a3a, belly: 1.4, head: { hair: '#3a2a1a', brow: '#2a1a0a', glasses: false, hairLine: 60, iris: '#3a2a1a' } },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, { cap }
    [3, 13, 'bat', Math.PI, 'shop'], [8, 11.5, 'makarov', -Math.PI / 2, 'shop'],
    [8, 8, 'bat', Math.PI / 2, 'kitchen'], [12.5, 6.5, 'makarov', -Math.PI / 2, 'kitchen'], [8, 5, null, Math.PI, 'kitchen'],
    [2, 4, 'makarov', 0, 'storeroom'], [3, 8, 'bat', Math.PI / 2, 'staff'], [11, 1.5, 'makarov', -Math.PI / 2, 'corridor'],
    [19, 4.5, 'shotgun', Math.PI, 'garage', true], [16, 6, 'makarov', Math.PI / 2, 'garage'], [20, 9, 'bat', Math.PI, 'garage'], [17, 11, 'makarov', 0, 'garage'], [21, 14, 'bat', -Math.PI / 2, 'garage'],
    [20, 18, 'makarov', Math.PI / 2, 'quay'], [26, 12, 'bat', 0, 'quayeast'], [27, 5, 'makarov', Math.PI, 'quayeast'],
  ],
  loot: [[2, 1.5], [22, 3.5], [13, 9.5], [5, 7.5]], // cell
  text: {
    area: 'KAASLAND · KROKETKADE',
    banner: ['SNACKBAR KROKETKADE', 'Kroketkade. Rain on the quay, Lampas in the kitchen.'],
    objective: 'Take <b>Snackbar Kroketkade</b> on the quay from the Lampas: the shop, the kitchen, the back rooms and the garage. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Kroketkade is <b>yours</b>. The fryers are cold for now. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Kroketkade is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KROKETKADE UNLOCKED',
    resultsHint: 'The Lampas are off the quay. Their kroket filling was forty percent spice-flavoured sawdust. Grab the crates (E), then drive home.',
    ownedBanner: ['KROKETKADE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['DE FRITUURBAAS IS DOWN', 'No more Lampas krokets on the quay.'],
    tips: ['Two ways in: the glass front door, or round the corner through the garage roller shutter.', 'The bistro tables and the bikes are low. Bullets fly right over them.', 'The counter and the fryers stop bullets.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    // the canal on the open sides, the quay running on west, the neighbours
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 24, 0, OX + W + 30, 30));
    ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 10, OX + W + 30, 0));
    box(W + 2, 0.5, 0.25, lam({ color: 0x4a463e }), OX + W / 2, -0.2, 0.12, root); box(0.25, 0.5, H, lam({ color: 0x4a463e }), OX + W + 0.12, -0.2, Z0 + H / 2, root);
    floorW(OX - 24, OX, Z0 + 17, 0, T.brick, 1.4);
    box(24, 7.5, 16, lam({ color: 0x5a2e24 }), OX - 12, 3.75, Z0 + 8, root);
    for (let i = 0; i < 4; i++) box(1, 1.3, 0.05, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffd88a : 0x2a3040 }), OX - 3 - i * 5, 2.2, Z0 + 16.03, root, false);
    // houses on the far bank of the canal
    for (let i = 0; i < 9; i++) {
      const x = OX - 18 + i * 7, h = 7 + (i * 5) % 4, c = [0x5a2a22, 0x3a2a24, 0x6a4030, 0x4a3a34][i % 4];
      box(6.6, h, 5, lam({ color: c }), x, h / 2, 22, root);
      const gab = new THREE.Mesh(new THREE.ConeGeometry(3.6, 2.2, 4), lam({ color: c })); gab.position.set(x, h + 1, 22); gab.rotation.y = Math.PI / 4; root.add(gab);
      for (let k = 0; k < 2; k++) for (let r = 0; r < 3; r++) if ((i + k + r) % 3) box(1.1, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xffd88a, 0xffb04a, 0x9ad8ff][(i + k + r) % 3] }), x - 1.4 + k * 2.8, 1.8 + r * 2.2, 19.47, root, false);
    }
    // wall skins: purple garage, greasy kitchen tiles, warm shop
    const skin = (x0, z0, x1, z1, color) => {
      const m = lam({ color }), add = (x, z, rot) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1, WALL_H - 0.1), m); p.position.set(x, (WALL_H - 0.1) / 2, z); p.rotation.y = rot; root.add(p); };
      for (let x = x0; x <= x1; x++) { if (G[z0 - 1][x] === '#') add(OX + x + 0.5, Z0 + z0 + 0.012, 0); if (G[z1 + 1][x] === '#') add(OX + x + 0.5, Z0 + z1 + 1 - 0.012, Math.PI); }
      for (let z = z0; z <= z1; z++) { if (G[z][x0 - 1] === '#') add(OX + x0 + 0.012, Z0 + z + 0.5, Math.PI / 2); if (G[z][x1 + 1] === '#') add(OX + x1 + 1 - 0.012, Z0 + z + 0.5, -Math.PI / 2); }
    };
    skin(15, 1, 22, 15, 0x4a2a5a); skin(7, 4, 13, 9, 0xc8d8c8); skin(1, 11, 13, 15, 0xe8c890);
    // the shop front: neon window signs and the name board
    const neonSign = (t, x, w, c, hex) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.6), new THREE.MeshBasicMaterial({ map: signTex([{ t, size: 64 }], '#0a0a14', hex, 512, 80), transparent: true, opacity: 0.95 })); m.position.set(OX + x, 1.95, Z0 + 17.04); root.add(m); neonRect(root, OX + x, 1.95, w + 0.15, 0.72, Z0 + 17.08, c); };
    neonSign('SNACKS', 3.5, 3.6, 0x3ff0ff, '#3ff0ff'); neonSign('KROKETKADE', 11, 4.2, 0xff3f6a, '#ff3f6a');
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.9), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SNACKBAR KROKETKADE', size: 80 }], '#2a0a10', '#ffd27a', 1024, 110) }));
    sign.position.set(OX + 7.5, 2.75, Z0 + 17.02); root.add(sign);
    // inside the shop: döner, heated display, menu boards, clock
    const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.9, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 6, 1.55, Z0 + 12.5); root.add(doner);
    cyl(0.03, 0.03, 1.2, lam({ color: 0xc8ccd0 }), OX + 6, 1.6, Z0 + 12.5, root, 6);
    const disp = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 0.7), new THREE.MeshPhongMaterial({ color: 0xffe8a0, transparent: true, opacity: 0.35, shininess: 100 })); disp.position.set(OX + 9.5, 1.3, Z0 + 12.5); root.add(disp);
    for (let k = 0; k < 8; k++) { const s = cyl(0.06, 0.06, 0.24, lam({ color: [0xb8742a, 0x8a4a1a, 0xd8a050][k % 3] }), OX + 8.4 + k * 0.3, 1.15, Z0 + 12.5 + (k % 2 ? 0.12 : -0.12), root, 8); s.rotation.z = Math.PI / 2; }
    [['KROKET W 2', '#ffd27a'], ['FRIKANDEL W 2', '#ffffff'], ['DÖNER W 6', '#ffd27a']].forEach(([t, c], i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 0.6), new THREE.MeshBasicMaterial({ map: signTex([{ t, size: 44 }], '#1a1010', c, 384, 96) })); m.position.set(OX + 5.6 + i * 2.5, 1.9, Z0 + 11.03); root.add(m); });
    const clock = new THREE.Mesh(new THREE.CircleGeometry(0.28, 20), new THREE.MeshBasicMaterial({ map: canvasTex(64, 64, (g) => { g.fillStyle = '#f2efe6'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.stroke(); g.beginPath(); g.moveTo(32, 32); g.lineTo(32, 12); g.moveTo(32, 32); g.lineTo(46, 38); g.stroke(); }) }));
    clock.position.set(OX + 2.5, 1.95, Z0 + 11.03); root.add(clock);
    // kitchen: extraction hood over the fryers, mop bucket
    box(3, 0.4, 0.55, lam({ color: 0x9aa4a8 }), OX + 12.5, 2.05, Z0 + 4.3, root, false);
    cyl(0.18, 0.15, 0.3, lam({ color: 0xffd23a }), OX + 7.5, 0.15, Z0 + 9.6, root, 10); cyl(0.02, 0.02, 1.2, lam({ color: 0x8a6a3a }), OX + 7.6, 0.7, Z0 + 9.5, root, 6);
    // garage: the rolled-up shutter, a pallet jack
    box(0.4, 0.5, 4, lam({ color: 0x8a8a86 }), OX + 23.5, 2.05, Z0 + 12, root, false);
    box(0.5, 0.12, 1.2, lam({ color: 0xc83a2a }), OX + 20.5, 0.12, Z0 + 13.7, root, false); cyl(0.03, 0.03, 1.0, lam({ color: 0x1a1a1a }), OX + 20.5, 0.6, Z0 + 13.1, root, 6);
    // the wet quay
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 17 || x >= 24) && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    for (const [x, z] of [[17, 6], [20, 11], [18, 14]]) pl.push([OX + x, Z0 + z, 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 16, Z0 + 17, OX + W + 6, 12], [OX + 24, Z0 + 1, OX + W + 6, Z0 + 17]], 900));
    return { tick(dt) { doner.rotation.y += dt * 0.8; for (const t of ticks) t(dt); } };
  },
};
