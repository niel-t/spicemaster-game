// Act 1, mission 6: Bitterbalbuurt (Oud-Vettenburg). Café De Gouden Bitterbal: a white stepped-gable shoarma shop next to an old
// brown café, with the Lampas treasury in the vault under it. Level data for the mission engine (js/mission.js); see spekbuurt.js for
// the coordinate conventions. Built after the concept art (01_Act1_Bitterbalbuurt): a white gabled shop with a lit window, a dark
// wood café with a long bar, stained glass, lamps and a pool table, and a stone cellar below with a round vault door and a card table.
// The engine is single-floor, so the cellar lies behind the café on the same grid, reached down the stairs behind the bar.
// The twist: the vault. Crack the Lampas safe (E) in the vault as well as clearing the floor: it pays out in Wilders.
//   street → shop → back hall → kitchen → cellar → vault · street → café → stairs behind the bar → cellar
//   back hall → mixing room → stairs · café → office → street (PERSONEEL)

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';

const W = 40, H = 28;

export default {
  id: 'bitterbalbuurt', name: 'Bitterbalbuurt', W, H,
  taskName: 'VAULT',
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['kitchen', 1, 1, 9, 6, 'tiles'], ['hall', 1, 8, 9, 12, 'hall'], ['shop', 1, 14, 9, 22, 'shoptile'],
    ['cellar', 11, 1, 30, 6, 'cellar'], ['vault', 32, 1, 38, 10, 'stone'],
    ['mixing', 11, 8, 24, 10, 'tiles'], ['stairs', 26, 8, 30, 10, 'steps'],
    ['cafe', 11, 12, 30, 22, 'wood'], ['office', 32, 12, 38, 22, 'panel'],
    ['street', 1, 24, 38, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(4, 23, 5, 23);        // the shop door (open)
    carve(19, 23, 20, 23);      // the café door (open)
    carve(0, 24, 0, 27); carve(39, 24, 39, 27);
    carve(27, 11, 29, 11); carve(27, 7, 29, 7); // the stairs: down from behind the bar into the cellar
    carve(31, 3, 31, 4);        // the round vault door, standing open
    putR(10, 18, 10, 19, 'D');  // shop ↔ café
    putR(4, 13, 5, 13, 'D');    // shop ↔ back hall
    putR(4, 7, 5, 7, 'D');      // back hall ↔ kitchen
    putR(10, 9, 10, 10, 'D');   // back hall ↔ mixing room
    putR(10, 3, 10, 4, 'D');    // kitchen ↔ cellar
    putR(25, 8, 25, 9, 'D');    // mixing room ↔ stairs
    putR(31, 17, 31, 18, 'D');  // café ↔ office
    putR(35, 23, 36, 23, 'D');  // office ↔ street (PERSONEEL)
    // glass: the shop window, the café's stained glass front
    putR(1, 23, 3, 23, '%'); putR(6, 23, 9, 23, '%'); putR(12, 23, 18, 23, '%'); putR(21, 23, 29, 23, '%');
    // shop
    putR(2, 16, 7, 16, 'K'); put(9, 14, 'F'); put(3, 20, 'T'); put(8, 21, 'p');
    // kitchen, back hall, mixing room
    putR(3, 3, 6, 3, 'w'); put(1, 1, 'F'); put(9, 6, 'C'); putR(1, 8, 2, 8, 'C'); putR(14, 9, 18, 9, 'w'); put(24, 10, 'C');
    // café: the long bar, a pool table, tables, plants, a slot machine
    putR(13, 13, 23, 13, 'B'); putR(25, 16, 26, 18, 'P'); put(13, 19, 'T'); put(16, 20, 'T'); put(21, 17, 'T'); put(22, 21, 'T'); put(11, 22, 'p'); put(30, 22, 'p'); put(30, 13, 'M');
    // cellar: wine racks, barrels, crates
    putR(13, 1, 18, 1, 'R'); putR(21, 1, 25, 1, 'R'); putR(12, 5, 13, 6, 'e'); put(18, 5, 'C'); put(23, 6, 'e'); putR(29, 1, 30, 1, 'C'); put(16, 4, 'X');
    // vault: the safes along the back wall, money crates, the card table
    putR(33, 1, 37, 1, 'V'); putR(34, 5, 35, 6, 'c'); putR(37, 8, 38, 9, 'C'); put(32, 9, 'C');
    // office
    putR(34, 15, 36, 15, 'O'); putR(38, 19, 38, 21, 'S'); put(32, 12, 'F');
    // street: lamps and bollards
    put(1, 26, 'l'); put(24, 26, 'l'); put(38, 26, 'l'); for (const x of [8, 14, 30]) put(x, 24, 'o');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xf3ecdc }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0x5a3018 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    B: { color: 0x4a2814 },
    P: { color: 0x2a5a2a },
    R: { color: 0x4a2a14 },
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { cyl(0.4, 0.4, 1.0, lam({ color: 0x6a3a1a }), OX + x + k + 0.5, 0.5, cz, root, 14); for (const y of [0.2, 0.8]) cyl(0.42, 0.42, 0.06, lam({ color: 0x2a2a2a }), OX + x + k + 0.5, y, cz, root, 14); } } }, // beer barrels
  },
  rackGoods: [0x2a4a2a, 0x6a1a1a, 0xe8a33d],
  floors: {
    wood: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#4a2c1a', '#5a3620', '#3e2416'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 7) % 64, y, 1, 8); } },
    cellar: (g) => { g.fillStyle = '#2a1410'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < 64; x += 16) { g.fillStyle = ['#5a2a1e', '#4a2218', '#62301f'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 14, 6); } },
    stone: (g) => { g.fillStyle = '#4a4844'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#2a2826'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    steps: (g) => { for (let y = 0; y < 64; y += 16) { g.fillStyle = '#5a5048'; g.fillRect(0, y, 64, 12); g.fillStyle = '#2a2420'; g.fillRect(0, y + 12, 64, 4); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3ecdc' : '#5a3018'; g.fillRect(x * 16, y * 16, 16, 16); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    hall: (g) => { g.fillStyle = '#4a3a2a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8a33d'; g.fillRect(0, 28, 64, 3); },
    cobble: (g) => { g.fillStyle = '#2e3036'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#44423e', '#4e4a44', '#3c3a36'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { wood: 1.5, cellar: 1.4, stone: 2, steps: 1, shoptile: 1.2, panel: 1.5, hall: 1.4, cobble: 1.6 },
  hallCells: [[4, 23], [5, 23], [19, 23], [20, 23], [27, 11], [28, 11], [29, 11], [27, 7], [28, 7], [29, 7], [31, 3], [31, 4]],
  doorSigns: { '35,23': 'PERSONEEL', '10,3': 'KELDER' },
  neon: { kitchen: 0xf2c14e, hall: 0xf2c14e, shop: 0xf3e6c8, cellar: 0xff8a3a, vault: 0xffd27a, mixing: 0xf2c14e, stairs: 0xff9a50, cafe: 0xe8a33d, office: 0xe8a33d, street: 0x3a3028 },
  lights: [[5, 18, 0xf3e6c8, 1.6], [5, 3, 0xf2c14e, 1.2], [5, 10, 0xf2c14e, 0.9], [18, 9, 0xf2c14e, 1.0], [15, 16, 0xffb050, 1.5], [21, 15, 0xffb050, 1.5], [25, 19, 0xffd27a, 1.3], [17, 20, 0xffb050, 1.2], [16, 3, 0xff8a3a, 1.2], [25, 4, 0xff8a3a, 1.1], [35, 5, 0xffd27a, 1.7], [35, 17, 0xe8a33d, 1.3], [5, 26, 0xf3e6c8, 1.0], [20, 26, 0xe8a33d, 1.2]],
  mood: { bg: 0x080a12, fogNear: 28, fogFar: 70, hemi: 0.45, sun: 0.5, sky: 0xfff0dc, ground: 0x3a3028, wall: 0x5a3020, cap: 0xe8dcc8, under: 0x2a2018 },
  van: { park: [13, 4.6], rot: Math.PI, from: W + 14, exit: [13.6, 3.0], solid: [9.7, 15.8, 3.45, 5.75] },
  start: [5, -0.8],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [5, 25],
  bossLook: { cap: 0x1a1a1a, shirt: 0x2a2a3a, front: '#2a2a3a', pants: 0x1a1a24, belly: 0.8, head: { hair: '#8a8a8a', brow: '#5a5a5a', hairLine: 38, glasses: true, iris: '#2a2a2a' } }, // the Penningmeester: grey suit, glasses
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [10, 25.5, 'bat', Math.PI / 2, 'street'], [28, 25.5, 'makarov', -Math.PI / 2, 'street'],
    [4, 18.5, 'bat', Math.PI, 'shop'], [8, 15, 'makarov', -Math.PI / 2, 'shop'], [5, 10, 'bat', 0, 'hall'], [6, 5, 'makarov', Math.PI, 'kitchen'],
    [18, 12.4, 'makarov', 0, 'cafe'], [14, 17, 'bat', Math.PI / 2, 'cafe'], [24, 15, 'makarov', Math.PI, 'cafe'], [27.5, 20, 'bat', -Math.PI / 2, 'cafe'], [19, 21, 'makarov', Math.PI, 'cafe'], [12, 14.5, 'bat', Math.PI / 2, 'cafe'],
    [20, 9, 'bat', Math.PI / 2, 'mixing'], [28, 9, 'makarov', Math.PI, 'stairs'],
    [15, 3, 'bat', Math.PI / 2, 'cellar'], [22, 3.5, null, -Math.PI / 2, 'cellar', true, 'zeegaal'], [28, 4.5, 'bat', Math.PI / 2, 'cellar'],
    [35, 3, 'shotgun', Math.PI, 'vault', true], [33, 7.5, 'makarov', 0, 'vault'], [37, 6, 'bat', -Math.PI / 2, 'vault'],
    [35, 18.5, 'makarov', Math.PI, 'office'], [33, 21, 'bat', Math.PI / 2, 'office'],
  ],
  loot: [[1.5, 5.5], [11.5, 1.5], [26.5, 1.5], [32.5, 1.5], [38, 10.5], [37.5, 13.5]], // cell
  text: {
    area: 'OUD-VETTENBURG · BITTERBALBUURT',
    banner: ['DE GOUDEN BITTERBAL', 'Bitterbalbuurt. The Lampas keep their Wilders under the café.'],
    objective: 'Take <b>De Gouden Bitterbal</b>: the shop, the café and the cellar below. <b>Crack the vault</b> (E) where the Penningmeester counts the Lampas money. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Bitterbalbuurt is <b>yours</b>. The Lampas treasury is empty. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Bitterbalbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'BITTERBALBUURT TAKEN',
    resultsHint: 'The vault is open and the Lampas are broke. Grab the spice crates (E), then drive home.',
    ownedBanner: ['BITTERBALBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE PENNINGMEESTER IS DOWN', 'Account closed.'],
    taskHint: 'Crack the Lampas vault (E).',
    tasksDone: 'VAULT CRACKED',
    tips: ['Two ways into the cellar: the stairs behind the bar, or the kitchen door at the back of the shop.', 'The vault is at the far end of the cellar, through the round door.', 'The bar stops bullets. The pool table doesn\'t.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 7.6, T.cobble, 1.6);
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      for (let s = 0; s < 3; s++) box(w * (0.8 - s * 0.25), 0.9, d * 0.9, lam({ color: c }), x, h + 0.45 + s * 0.9, z, root, false);
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 3) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xf2c14e, 0xe8a33d, 0x2a3040][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 11; i++) house(OX - 12 + i * 6.2, 11, 6, 6, 9 + (i * 3) % 4, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i % 4], -1);
    box(10, 9, H - 4, lam({ color: 0x4a2a24 }), OX - 5, 4.5, Z0 + (H - 4) / 2, root); box(10, 9, H - 4, lam({ color: 0x5a3428 }), OX + W + 5, 4.5, Z0 + (H - 4) / 2, root);
    // the white stepped gable over the shop, the café's dark front
    for (let s = 0; s < 4; s++) box(9 - s * 2.2, 1.0, 0.6, lam({ color: 0xf3ecdc }), OX + 5, WALL_H + 0.5 + s * 1.0, Z0 + 23.4, root, false);
    sign('HALAL SHOARMA', 4.8, 0.55, '#1a0e08', '#f2c14e', OX + 5, 2.65, Z0 + 23.02, 0, 60); neonRect(root, OX + 5, 2.65, 5, 0.7, Z0 + 23.06, 0xf2c14e);
    sign('CAFÉ DE GOUDEN BITTERBAL', 8, 0.55, '#1a0e08', '#e8a33d', OX + 20.5, 2.75, Z0 + 23.02, 0, 56);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = '#f2c14e'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#7a2e1a'; g.beginPath(); g.arc(64, 64, 48, 0, 7); g.fill(); g.fillStyle = '#f2c14e'; g.font = '900 18px Arial'; g.textAlign = 'center'; g.fillText('KAAS', 62, 60); g.fillText('PILS', 62, 82); }) }));
    disc.position.set(OX + 10.5, 2.5, Z0 + 23.4); disc.rotation.y = Math.PI / 4; root.add(disc);
    // stained glass glow over the café windows
    for (const x of [15, 25]) { const g = glowSprite(THREE, 0xe8a33d, 6, 2.2, 0.3); g.position.set(OX + x, 1.8, Z0 + 23.6); root.add(g); }
    // café: hanging lamps, bottles behind the bar
    for (const [x, z] of [[15, 15.5], [21, 15.5], [18, 19.5], [25.5, 17]]) { const b = glowSprite(THREE, 0xffc070, 2.2, 2.2, 0.28); b.position.set(OX + x, 1.95, Z0 + z); root.add(b); }
    for (let k = 0; k < 16; k++) cyl(0.05, 0.06, 0.3, lam({ color: [0x2a5a2a, 0x7a2e1a, 0xf2c14e, 0xf3e6c8][k % 4] }), OX + 13.3 + k * 0.6, 1.25, Z0 + 12.3, root, 8);
    // the stairs down behind the bar, getting darker
    for (let k = 0; k < 4; k++) box(3, 0.02, 0.9, lam({ color: [0x6a6058, 0x58504a, 0x48403a, 0x38322e][k] }), OX + 28.5, 0.03, Z0 + 10.5 - k, root, false);
    sign('KELDER ↓', 1.6, 0.4, '#1a1a1a', '#ffd27a', OX + 28.5, 1.95, Z0 + 11.9, 0, 40);
    // the round vault door, swung open against the cellar wall
    const vd = new THREE.Group(); vd.position.set(OX + 30.6, 0, Z0 + 2.2); vd.rotation.y = -0.9; root.add(vd);
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.35, 28), lam({ color: 0x8a8e92 })); disk.rotation.x = Math.PI / 2; disk.position.y = 1.25; vd.add(disk);
    for (let k = 0; k < 6; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), lam({ color: 0x5a5e62 })); s.position.set(0, 1.25, 0.22); s.rotation.z = k * Math.PI / 3; vd.add(s); }
    // the vault: the card table, stacks of Wilders; the task safe glows until cracked
    cyl(0.95, 0.95, 0.06, lam({ color: 0x2a5a2a }), OX + 35, 0.78, Z0 + 6, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + 35, 0.37, Z0 + 6, root);
    for (let k = 0; k < 6; k++) box(0.3, 0.1, 0.16, lam({ color: 0x6a9a4a }), OX + 34.6 + (k % 3) * 0.35, 0.86, Z0 + 5.7 + Math.floor(k / 3) * 0.3, root, false);
    const safeGlow = glowSprite(THREE, 0xf2c14e, 3.2, 2.2, 0.45); safeGlow.position.set(OX + 35.5, 1.2, Z0 + 2.2); root.add(safeGlow);
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 16), lam({ color: 0xf2c14e })); dial.rotation.x = Math.PI / 2; dial.position.set(OX + 35.5, 0.8, Z0 + 1.95); root.add(dial);
    const cash = new THREE.Group(); cash.visible = false; root.add(cash);
    for (let k = 0; k < 10; k++) box(0.32, 0.1, 0.16, lam({ color: 0x6a9a4a }), OX + 34 + Math.random() * 3, 0.06, Z0 + 2.4 + Math.random() * 1.2, cash, false);
    const tasks = [{ pos: new THREE.Vector3(OX + 35.5, 0, Z0 + 3.2), obj: dial, label: 'Crack the Lampas vault', score: 1500, doneText: 'VAULT CRACKED! +W 1.500',
      act() { safeGlow.visible = false; cash.visible = true; this.spin = 1; },
      reset(done) { safeGlow.visible = !done; cash.visible = !!done; } }];
    const pl = []; for (let i = 0; i < 24; i++) pl.push([OX - 10 + Math.random() * (W + 20), -4 + Math.random() * 11, 0.3 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 8]], 800));
    return { tasks, tick(dt) { for (const f of ticks) f(dt); if (tasks[0].spin > 0) { tasks[0].spin -= dt; dial.rotation.y += dt * 12; } } };
  },
};
