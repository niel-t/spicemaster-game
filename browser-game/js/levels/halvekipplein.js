// Act 1, mission 5: Halve Kip Plein (Oud-Vettenburg). Grillroom De Halve Haan: a chicken grill on a corner square, and behind it the
// Lampas order office where every Lampas delivery in Oud-Vettenburg is booked. Level data for the mission engine (js/mission.js); see
// spekbuurt.js for the coordinate conventions. Built after the concept art (01_Act1_Halve_Kip_Plein): a brick corner with a chicken
// neon sign and a terrace, an orange kitchen with rotisserie ovens under big hoods, and a cold-lit office packed with CRT computers.
// The twist: wipe the three order PCs (E) as well as clearing the floor. No orders, no Lampas deliveries: each wiped PC is a
// client the Lampas lose (a score bonus, and Lampas heat cools when you own the joint).
//   terrace → grill shop → kitchen → order office → server room / Kippenvel's office → mixing room → storage → terrace

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { eastSide } from './story.js';

const W = 42, H = 28;
const PCS = [[22, 15.5, 'Order PC · bookings'], [18, 3.5, 'Server · the client list'], [27, 3.5, 'Kippenvel\'s PC · the ledger']]; // world cell of each task terminal

export default eastSide({
  id: 'halvekipplein', name: 'Halve Kip Plein', W, H,
  taskName: 'PC',
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['kitchen', 1, 1, 12, 13, 'orange'], ['shop', 1, 15, 12, 22, 'shoptile'],
    ['server', 14, 1, 22, 8, 'concrete'], ['boss', 24, 1, 30, 8, 'panel'], ['office', 14, 10, 30, 22, 'carpet'],
    ['mixing', 32, 1, 40, 10, 'tiles'], ['storage', 32, 12, 40, 22, 'concrete'],
    ['terrace', 1, 24, 40, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(5, 23, 6, 23);        // the grill door on the square (open)
    carve(0, 24, 0, 27); carve(41, 24, 41, 27);
    putR(5, 14, 6, 14, 'D');    // shop ↔ kitchen
    putR(13, 10, 13, 11, 'D');  // kitchen ↔ order office
    putR(13, 18, 13, 19, 'D');  // shop ↔ order office
    putR(17, 9, 18, 9, 'D');    // office ↔ server room
    putR(27, 9, 28, 9, 'D');    // office ↔ Kippenvel's office
    putR(23, 4, 23, 5, 'D');    // server room ↔ Kippenvel's office
    putR(31, 3, 31, 4, 'D');    // Kippenvel's office ↔ mixing room
    putR(31, 16, 31, 17, 'D');  // office ↔ storage
    putR(36, 11, 37, 11, 'D');  // mixing room ↔ storage
    putR(36, 23, 37, 23, 'D');  // storage ↔ terrace (PERSONEEL)
    // glass: the grill windows, the office's long window onto the square, Kippenvel's window onto the office
    putR(1, 23, 4, 23, '%'); putR(7, 23, 12, 23, '%'); putR(16, 23, 28, 23, '%'); putR(25, 9, 26, 9, '%');
    // grill shop: counter, a fridge, tables
    putR(2, 17, 9, 17, 'K'); put(12, 15, 'F'); put(3, 20, 'T'); put(9, 20, 'T'); put(12, 22, 'p');
    // kitchen: the rotisserie ovens under their hoods, the steel table, sacks
    putR(2, 1, 4, 1, 'H'); putR(6, 1, 8, 1, 'H'); putR(10, 1, 11, 1, 'H'); putR(4, 6, 8, 7, 'w'); putR(11, 12, 12, 12, 'C'); put(1, 12, 'F');
    // order office: rows of desks with CRTs (the task PC is drawn by decorate), filing cabinets
    putR(16, 12, 19, 12, 'Y'); putR(24, 12, 28, 12, 'Y'); putR(16, 16, 20, 16, 'Y'); putR(24, 16, 28, 16, 'Y'); putR(16, 20, 19, 20, 'Y'); putR(24, 20, 28, 20, 'Y');
    putR(30, 10, 30, 12, 'F'); put(14, 22, 'p'); put(22, 14, 'O'); // the order PC's desk
    // server room: racks of computers; Kippenvel's office: desk, safe, sofa
    putR(15, 1, 21, 1, 'R'); putR(15, 6, 16, 6, 'R'); putR(20, 6, 21, 6, 'R'); putR(17, 4, 19, 4, 'O');
    putR(26, 4, 28, 4, 'O'); putR(29, 1, 30, 1, 'V'); putR(24, 6, 24, 8, 'S');
    // mixing room and storage
    putR(34, 4, 37, 5, 'w'); put(40, 1, 'C'); putR(33, 14, 34, 15, 'C'); putR(38, 14, 40, 14, 'C'); putR(33, 20, 34, 21, 'C'); put(40, 22, 'X');
    // terrace: bistro tables, planters, lamps
    put(3, 25, 't'); put(9, 25, 't'); put(15, 26, 't'); putR(18, 24, 21, 24, 'v'); put(25, 26, 't'); put(31, 25, 't'); putR(28, 24, 29, 24, 'h');
    put(1, 27, 'l'); put(22, 27, 'l'); put(40, 27, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xe8a33d }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    H: { h: 1.7, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz, x, OX }) => { // rotisserie ovens: glass fronts full of turning chickens, a hood above
      box(n - 0.06, 1.6, 0.9, lam({ color: 0x5a5a5a }), cx, 0.8, cz, root);
      const glow = new THREE.Mesh(new THREE.PlaneGeometry(n - 0.4, 1.0), new THREE.MeshBasicMaterial({ color: 0xff9a3a })); glow.position.set(cx, 0.95, cz + 0.46); root.add(glow);
      for (let k = 0; k < n * 2; k++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lam({ color: 0xb8742a })); c.scale.set(1, 0.8, 1.2); c.position.set(OX + x + 0.3 + k * 0.5, 0.75 + (k % 2) * 0.35, cz + 0.36); c.userData.chick = true; root.add(c); }
      box(n + 0.2, 0.5, 1.3, lam({ color: 0xa8acb0 }), cx, 2.3, cz + 0.1, root, false);
      const g = glowSprite(THREE, 0xff8a2a, n + 1, 1.8, 0.45); g.position.set(cx, 1.0, cz + 0.9); root.add(g);
    } },
    Y: { h: 0.8, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz, x, OX }) => { // office desks with beige CRT monitors
      box(n - 0.06, 0.75, 0.9, lam({ color: 0x8a7a64 }), cx, 0.375, cz, root);
      for (let k = 0; k < n; k++) { box(0.42, 0.36, 0.38, lam({ color: 0xd8d0b8 }), OX + x + k + 0.5, 0.95, cz - 0.1, root, false); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.24), new THREE.MeshBasicMaterial({ color: [0x9ad8c8, 0xa9c46a, 0xc8e0d8][(x + k) % 3] })); s.position.set(OX + x + k + 0.5, 0.97, cz + 0.095); root.add(s); }
    } },
    R: { color: 0x2a2c30 },
  },
  rackGoods: [0x3a3e44, 0x6ad86a, 0x2a2c30],
  floors: {
    orange: (g) => { g.fillStyle = '#c87a3a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#8a4a1e'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#e8a33d'; g.fillRect(x * 16, y * 16, 16, 16); } },
    carpet: (g) => { g.fillStyle = '#3a4a4a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.05})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { orange: 1.3, shoptile: 1.2, carpet: 2, panel: 1.5, cobble: 1.6 },
  hallCells: [[5, 23], [6, 23]],
  doorSigns: { '36,23': 'PERSONEEL', '27,9': 'BOEKHOUDING', '17,9': 'SERVER' },
  neon: { kitchen: 0xff8a2a, shop: 0xe8a33d, server: 0x6ad86a, boss: 0xe8a33d, office: 0xc8e0d8, mixing: 0xf2c14e, storage: 0xffd8a0, terrace: 0xe8a33d },
  lights: [[6, 18, 0xf3e6c8, 1.5], [6, 4, 0xff8a3a, 2.2], [6, 10, 0xff9a50, 1.2], [18, 4, 0x8ad8a0, 1.2], [27, 4, 0xe8a33d, 1.5], [18, 14, 0xc8e0e0, 1.4], [26, 14, 0xc8e0e0, 1.4], [18, 19, 0xc8e0e0, 1.3], [26, 19, 0xc8e0e0, 1.3], [36, 5, 0xf2c14e, 1.3], [36, 17, 0xffd8a0, 1.2], [8, 26, 0xe8a33d, 1.1], [30, 26, 0xe8a33d, 1.1]],
  mood: { bg: 0x0a0d14, fogNear: 30, fogFar: 74, hemi: 0.5, sun: 0.55, sky: 0xfff0dc, ground: 0x4a4038, wall: 0x6a3428, cap: 0xe0d0b8, under: 0x3a2a24 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [6, -0.6],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [6, 25],
  bossLook: { cap: 0x1a1a1a, shirt: 0xf3e6c8, front: '#f3e6c8', pants: 0x3a3a3a, belly: 0.4, head: { hair: '#5a5a5a', brow: '#3a3a3a', hairLine: 40, glasses: true, iris: '#3a3a3a' } }, // Boekhouder Kippenvel: shirt and glasses
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [11, 25.5, 'bat', Math.PI / 2, 'terrace'], [33, 25.5, 'makarov', -Math.PI / 2, 'terrace'],
    [4, 19, 'makarov', Math.PI, 'shop'], [10, 15.5, 'bat', 0, 'shop'], [7, 21.5, 'bat', Math.PI / 2, 'shop'],
    [3, 4, 'bat', 0, 'kitchen'], [10, 8, 'makarov', -Math.PI / 2, 'kitchen'], [6, 10, 'bat', Math.PI, 'kitchen'],
    [15, 14, 'makarov', Math.PI / 2, 'office'], [22, 11, 'bat', Math.PI, 'office'], [29, 14, 'makarov', -Math.PI / 2, 'office'], [22, 18, 'bat', 0, 'office'], [15, 18, 'makarov', Math.PI / 2, 'office'], [29.5, 21.5, 'shotgun', -Math.PI / 2, 'office'],
    [17, 2.5, 'makarov', 0, 'server'], [21, 5, 'bat', -Math.PI / 2, 'server'],
    [27, 2.2, 'shotgun', 0, 'boss', true], [29.5, 6.5, 'makarov', -Math.PI / 2, 'boss'],
    [35, 7.5, 'bat', Math.PI, 'mixing'], [38.5, 2.5, 'makarov', -Math.PI / 2, 'mixing'], [36, 18, 'makarov', Math.PI, 'storage'], [39, 20.5, 'bat', -Math.PI / 2, 'storage'],
  ],
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a big painted rooster on a pole over the corner, turning in the wind like a weathervane
      const { THREE, root, box, cyl, lam } = c, p = c.at(26, 0); p.z = 1.4;
      cyl(0.1, 0.13, 4.4, lam({ color: 0x2a2a2e }), p.x, 2.2, p.z, root, 10); c.solid(p.x - 0.25, p.x + 0.25, p.z - 0.25, p.z + 0.25);
      const g = new THREE.Group(); g.position.set(p.x, 5.1, p.z); root.add(g);
      const gold = lam({ color: 0xe8a33d }), red = lam({ color: 0xc2412d }), cream = lam({ color: 0xf3e6c8 });
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 12), gold); body.scale.set(1.3, 0.9, 0.8); g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 10), gold); head.position.set(0.75, 0.55, 0); g.add(head);
      const comb = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.22, 0.06), red); comb.position.set(0.78, 0.88, 0); g.add(comb);
      const beak = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.25, 6), cream); beak.rotation.z = -Math.PI / 2; beak.position.set(1.1, 0.52, 0); g.add(beak);
      const wattle = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), red); wattle.position.set(0.98, 0.38, 0); g.add(wattle);
      for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.75, 0.05), i % 2 ? red : gold); f.position.set(-0.85, 0.45 + i * 0.05, 0); f.rotation.z = 0.5 + i * 0.22; g.add(f); }
      box(0.06, 0.4, 0.06, cream, 0.1, -0.7, 0, g, false); box(1.4, 0.04, 0.04, lam({ color: 0x2a2a2e }), 0, -0.95, 0, g, false);
      const gl = c.glow(0xe8862c, 3.2, 3.2, 0.4); gl.position.set(p.x, 5.1, p.z); root.add(gl);
      let t = 0; return (dt) => { t += dt; g.rotation.y = Math.sin(t * 0.25) * 1.2 + Math.sin(t * 1.3) * 0.08; };
    } },
    { k: 'board', at: [20.5, 10.5], wall: 'n', w: 2.2, h: 1.3, strings: true, title: 'BESTELLINGEN', big: 40, left: true, size: 21, lines: ['Snackbar Bram: 40 kg', 'Café Ans: 12 kg', 'Kapsalon Koning: 25 kg', 'KLANTEN VAN EDDY:', '~Restaurant Mok', '~Shoarma Ali', 'Lunchroom Fien: deze week'], read: ['BESTELLINGEN', "Every Lampas delivery in Oud-Vettenburg, with red string between the snack bars. A column on the right is headed 'KLANTEN VAN EDDY'. Half of them are already crossed out: taken over."] },
    { k: 'candles', at: [27.5, 4.5], y: 0.81, n: 4, photo: 'JAN VAN KAAS', read: ['ALTAARTJE', 'Kippenvel keeps a little shrine to Jan van Kaas on his desk. The candles are still warm.'] },
    { k: 'papers', at: [18.5, 7.5], n: 8 }, { k: 'spill', at: [8.5, 10.5], color: 0x9a6a2a, r: 0.6 },
    { k: 'crates', at: [37.5, 16.5], label: 'BEZORGING', color: '#c2412d' },
    { k: 'poster', at: [1.5, 16.5], wall: 'w', w: 0.9, h: 1.2, title: 'HALVE HAAN', lines: ['halve kip', 'W 5', 'heel gezin', 'W 9'], style: 'menu' },
    { k: 'chair', at: [25.5, 19.5], color: 0x2a2a2a }, { k: 'cups', at: [22.5, 14.5], y: 0.81 },
  ],
  loot: [[1.5, 9.5], [14.5, 2.5], [30, 2.5], [39.5, 9.5], [36.5, 13.5], [32.5, 22.5]], // cell
  text: {
    area: 'OUD-VETTENBURG · HALVE KIP PLEIN',
    banner: ['DE HALVE HAAN', 'Halve Kip Plein. Every Lampas order goes through here.'],
    objective: 'Take <b>De Halve Haan</b> and wipe the <b>three order PCs</b> (E): the bookings, the server and Kippenvel\'s ledger. No orders, no Lampas deliveries. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Halve Kip Plein is <b>yours</b>. The Lampas order books are blank. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Halve Kip Plein is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'HALVE KIP PLEIN TAKEN',
    resultsHint: 'The order books are wiped and the chickens keep turning. Grab the spice crates (E), then drive home.',
    ownedBanner: ['HALVE KIP PLEIN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['KIPPENVEL IS DOWN', 'The books don\'t balance.'],
    taskHint: 'Wipe every order PC (E).',
    tasksDone: 'ALL ORDERS WIPED',
    tips: ['Three PCs to wipe: one in the office, one in the server room, one on Kippenvel\'s desk.', 'The office windows face the square. The Lampas inside can see you coming.', 'Desks stop bullets. The office has rows of them.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.cobble, 1.6); floorW(OX - 14, OX + W + 14, 2.6, 12, T.asphalt, 4);
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 3) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xf2c14e, 0xe8a33d, 0x2a3040][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 11; i++) house(OX - 12 + i * 6.2, 16, 6, 6, 9 + (i * 3) % 4, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i % 4], -1);
    box(10, 9, H - 4, lam({ color: 0x5a3428 }), OX - 5, 4.5, Z0 + (H - 4) / 2, root); box(10, 9, H - 4, lam({ color: 0x4a2a24 }), OX + W + 5, 4.5, Z0 + (H - 4) / 2, root);
    // the chicken neon on the corner and the name boards
    const chick = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.3), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(96, 84, (g) => {
      g.strokeStyle = '#f2c14e'; g.lineWidth = 5; g.beginPath(); g.ellipse(48, 50, 34, 24, 0, 0, 7); g.stroke(); g.beginPath(); g.arc(74, 26, 11, 0, 7); g.stroke();
      g.strokeStyle = '#c2412d'; g.beginPath(); g.moveTo(70, 14); g.lineTo(78, 6); g.stroke(); g.fillStyle = '#e8a33d'; g.beginPath(); g.moveTo(84, 26); g.lineTo(94, 30); g.lineTo(84, 32); g.fill();
    }) }));
    chick.position.set(OX + 1.2, 3.0, Z0 + 23.6); chick.rotation.y = -Math.PI / 5; root.add(chick);
    const chickGlow = glowSprite(THREE, 0xf2c14e, 3, 3, 0.45); chickGlow.position.set(OX + 1.2, 3.0, Z0 + 23.8); root.add(chickGlow);
    sign('DE HALVE HAAN', 5.6, 0.6, '#1a0e08', '#e8a33d', OX + 6.5, 2.75, Z0 + 23.02, 0, 64); neonRect(root, OX + 6.5, 2.75, 5.8, 0.75, Z0 + 23.06, 0xe8a33d);
    sign('HALVE KIP PLEIN', 3.2, 0.34, '#0a120a', '#a9c46a', OX + 6.5, 2.2, Z0 + 23.03, 0, 34);
    sign('LAMPAS LOGISTIEK · BESTELLINGEN', 9, 0.5, '#0e1414', '#c8e0d8', OX + 22, 2.75, Z0 + 23.02, 0, 40);
    // the task terminals: big beige PCs on a stand, screens full of Lampas orders; E wipes them
    const tasks = [];
    for (const [x, z, label] of PCS) {
      const g = new THREE.Group(); g.position.set(OX + x, 0, Z0 + z); root.add(g);
      box(0.6, 0.5, 0.5, lam({ color: 0xd8d0b8 }), 0, 1.1, 0, g, false);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.34), new THREE.MeshBasicMaterial({ map: canvasTex(64, 48, (c) => { c.fillStyle = '#0a1a0a'; c.fillRect(0, 0, 64, 48); c.fillStyle = '#6ad86a'; c.font = '7px monospace'; for (let i = 0; i < 6; i++) c.fillText(`BESTELLING ${100 + i * 7}`, 3, 8 + i * 7); }) }));
      scr.position.set(0, 1.12, 0.26); g.add(scr);
      const glow = glowSprite(THREE, 0x6ad86a, 1.4, 1.2, 0.45); glow.position.set(0, 1.2, 0.5); g.add(glow);
      const wiped = new THREE.MeshBasicMaterial({ color: 0x3a0a0a });
      const t = { pos: new THREE.Vector3(OX + x, 0, Z0 + z + 0.8), obj: g, label: `Wipe the ${label.split(' · ')[0]} (${label.split(' · ')[1]})`, doneText: 'ORDERS WIPED!', mat0: scr.material,
        act() { scr.material = wiped; glow.material.color.set(0xc2412d); },
        reset(done) { scr.material = done ? wiped : t.mat0; glow.material.color.set(done ? 0xc2412d : 0x6ad86a); } };
      tasks.push(t);
    }
    const pl = []; for (let z = 24; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    for (let i = 0; i < 12; i++) pl.push([OX - 10 + Math.random() * (W + 20), 1 + Math.random() * 10, 0.4 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 12]], 800));
    const chicks = []; root.traverse((o) => { if (o.userData.chick) chicks.push(o); });
    let t = 0;
    return { tasks, tick(dt) { t += dt; for (const f of ticks) f(dt); for (const c of chicks) c.rotation.z += dt * 2; chickGlow.material.opacity = 0.4 + Math.sin(t * 2) * 0.08; } };
  },
}, { kind: 'door', door: [5, 6], street: [24, 27], guard: [11, 'makarov', -Math.PI / 2], sign: 'ACHTERDEUR', tip: 'The quiet way in: the back alley on the east side, past the bins, to the mixing room\'s back door. One Lampas is out there on his phone.', read: ['ACHTERDEUR', 'Taped to the back door: "Kippen worden hier geleverd. NIET via de zaak!" The chicken deliveries come in round the back.'] });
