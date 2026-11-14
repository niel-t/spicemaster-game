// Mission 2: Kroketkade. The Lampas kroket factory on the quay, De Natte Worst.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions.
//
// The front is a wall of glass snack hatches facing a long open quay along the water (long sightlines, little cover).
// Inside: the hatch shop, the frying hall with conveyor lines (rows of tall cover), a walk-in freezer (one door, tight),
// the frituurbaas' office, a packing room full of racks and the loading dock with containers and red barrels.
// Every room has two ways in except the freezer:
//   quay → shop → corridor → office → packing → dock → quay
//   quay → dock → frying hall → shop / corridor / packing

const W = 50, H = 32;

export default {
  id: 'kroketkade', name: 'Kroketkade', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['freezer', 1, 1, 8, 7, 'ice'], ['office', 10, 1, 19, 7, 'parquet'], ['packing', 21, 1, 38, 7, 'concrete'], ['dock', 40, 1, 48, 22, 'garage'],
    ['corridor', 1, 9, 19, 10, 'hall'], ['shop', 1, 12, 19, 22, 'redtile'], ['fryhall', 21, 9, 38, 22, 'grease'],
    ['quay', 1, 24, 48, 30, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    // doors
    putR(4, 8, 5, 8, 'D');     // freezer ↔ corridor (the only way in or out)
    putR(14, 8, 15, 8, 'D');   // office ↔ corridor
    putR(20, 3, 20, 4, 'D');   // office ↔ packing
    putR(26, 8, 27, 8, 'D'); putR(34, 8, 35, 8, 'D'); // packing ↔ frying hall
    putR(39, 3, 39, 4, 'D');   // packing ↔ dock
    putR(4, 11, 5, 11, 'D'); putR(15, 11, 16, 11, 'D'); // corridor ↔ shop
    putR(20, 9, 20, 10, 'D');  // corridor ↔ frying hall
    putR(20, 18, 20, 19, 'D'); // shop ↔ frying hall
    putR(39, 11, 39, 12, 'D'); putR(39, 19, 39, 20, 'D'); // frying hall ↔ dock
    putR(10, 23, 11, 23, 'D'); // shop ↔ quay: the front door
    carve(41, 23, 47, 23);     // the dock opens onto the quay (no door)
    carve(49, 24, 49, 30);     // the quay runs on east (the Oofmobiel drives in here)
    putR(1, 31, 49, 31, '_');  // quay edge with bollards: blocks walking, bullets and eyes go over it
    // glass: the snack hatches along the whole front, office windows onto the corridor
    putR(2, 23, 8, 23, '%'); putR(13, 23, 18, 23, '%'); putR(22, 23, 29, 23, '%'); putR(32, 23, 37, 23, '%');
    putR(11, 8, 12, 8, '%'); putR(17, 8, 18, 8, '%');
    // freezer: steel shelving and hanging racks, narrow aisles
    putR(1, 1, 1, 7, 'F'); putR(3, 2, 3, 5, 'R'); putR(6, 2, 6, 5, 'R');
    // office
    putR(13, 3, 17, 3, 'O'); putR(18, 1, 19, 1, 'V'); putR(10, 6, 10, 7, 'S'); put(19, 7, 'p');
    // packing room: racks of kroket boxes
    putR(24, 2, 28, 2, 'R'); putR(31, 2, 35, 2, 'R'); putR(24, 5, 28, 5, 'R'); putR(31, 5, 35, 5, 'R'); putR(37, 6, 38, 7, 'C'); put(21, 1, 'C');
    // frying hall: three conveyor lines with a gap down the middle, fryer vats by the hatches
    for (const z of [12, 16, 20]) { putR(23, z, 29, z, 'L'); putR(32, z, 37, z, 'L'); }
    putR(21, 21, 22, 22, 'Y'); put(38, 9, 'X');
    // shop: hatch counters behind the glass, fryer banks, potato sacks
    putR(2, 22, 8, 22, 'K'); putR(13, 22, 18, 22, 'K');
    putR(3, 18, 7, 18, 'F'); putR(12, 18, 16, 18, 'F'); putR(1, 12, 2, 12, 'C');
    // dock: containers, pallets, red barrels
    putR(42, 2, 43, 8, 'U'); putR(46, 6, 47, 12, 'U'); putR(41, 15, 42, 15, 'C'); put(44, 21, 'X'); put(45, 21, 'X'); put(48, 1, 'X');
    // quay: a few crate stacks and picnic tables, a barrel by the dock, the Oofmobiel's spot ('A')
    putR(14, 25, 15, 26, 'C'); putR(29, 25, 30, 25, 'C'); putR(37, 26, 38, 27, 'C'); putR(18, 27, 19, 27, 'T'); putR(33, 27, 34, 27, 'T'); put(45, 25, 'X');
    putR(3, 28, 8, 30, 'A');
  },
  // steel fryers instead of fridges, kroket boxes on the racks
  furn: {
    F: { color: 0xb8c4cc },
    L: { h: 1.15, cover: true, draw: ({ THREE, root, box, lam, n, h, cx, cz, x, OX }) => { // conveyor line
      box(n - 0.04, 0.12, 0.86, lam({ color: 0x5a6670 }), cx, h - 0.12, cz, root);
      box(n - 0.1, 0.03, 0.66, lam({ color: 0x1a1a1e }), cx, h - 0.04, cz, root, false);
      box(n - 0.04, h - 0.18, 0.7, lam({ color: 0x3a444c }), cx, (h - 0.18) / 2, cz, root);
      for (let k = 0; k <= n; k += 0.5) box(0.05, 0.05, 0.84, lam({ color: 0xa8b4bc }), OX + x + k, h - 0.18, cz, root, false);
    } },
    U: { h: 2.5, cover: true, sight: true, draw: ({ THREE, root, box, lam, n, h, cx, cz, x, z }) => { // shipping container
      const c = [0xc8402e, 0x2a6aa8, 0x3a8a4a][(x + z) % 3];
      box(n - 0.04, h, 0.98, lam({ color: c }), cx, h / 2, cz, root);
      box(n + 0.02, 0.08, 1.02, lam({ color: 0x1a1a1a }), cx, h, cz, root, false);
    } },
    Y: { h: 1.1, cover: true, draw: ({ THREE, root, box, lam, n, h, cx, cz }) => { // fryer vat full of hot oil
      box(n - 0.06, h, 0.92, lam({ color: 0x9aa4ac }), cx, h / 2, cz, root);
      const oil = new THREE.Mesh(new THREE.PlaneGeometry(n - 0.3, 0.7), new THREE.MeshBasicMaterial({ color: 0xe8a020 })); oil.rotation.x = -Math.PI / 2; oil.position.set(cx, h + 0.01, cz); root.add(oil);
    } },
    _: { h: 0.4, cover: false, draw: ({ THREE, root, box, cyl, lam, n, h, cx, cz, x, OX }) => { // quay edge and bollards
      box(n, h, 0.9, lam({ color: 0x7a7670 }), cx, h / 2, cz, root);
      for (let k = 1; k < n; k += 5) { cyl(0.16, 0.2, 0.75, lam({ color: 0x1a1a1e }), OX + x + k + 0.5, 0.38, cz, root, 10); cyl(0.24, 0.24, 0.08, lam({ color: 0x1a1a1e }), OX + x + k + 0.5, 0.78, cz, root, 10); }
    } },
  },
  rackGoods: [0xc87a3a, 0xe8a020, 0xf2efe6],
  floors: {
    ice: (g) => { g.fillStyle = '#c8e4f0'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#8ab4c8'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } for (let i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 1); } },
    redtile: (g) => { g.fillStyle = '#a83a2a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#6a2018'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    grease: (g) => { g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#a8a498'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(160,110,30,.25)'; g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 8, 3 + Math.random() * 5, Math.random(), 0, 7); g.fill(); } },
    cobble: (g) => { g.fillStyle = '#5a5a60'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#6a6a70', '#76767c', '#626268'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { cobble: 1.6, ice: 1.2 },
  hallCells: [[41, 23], [42, 23], [43, 23], [44, 23], [45, 23], [46, 23], [47, 23]],
  doorSigns: { '10,23': 'INGANG', '4,8': 'VRIESCEL' },
  neon: { freezer: 0x9ae8ff, office: 0xffd23a, packing: 0xffd8a0, dock: 0xffb040, corridor: 0x3ff0ff, shop: 0xff7a1a, fryhall: 0xffa040, quay: 0x3ff0ff },
  lights: [[10, 17, 0xff8a3a, 2.0], [30, 15, 0xffa040, 2.4], [4.5, 4, 0x9ae8ff, 1.8], [15, 4, 0xffd23a, 1.6], [30, 4, 0xffd8a0, 1.4], [44, 12, 0xffb040, 1.8], [12, 27, 0x6ab0ff, 1.6], [30, 27, 0x6ab0ff, 1.6], [44, 27, 0xffb040, 1.4]],
  mood: { bg: 0x08142a, fogNear: 28, fogFar: 72, hemi: 0.5, sun: 0.75, wall: 0x22303c, cap: 0xe6f0f2, under: 0x445566 },
  van: { park: [6, -2.4], rot: Math.PI, from: W + 12, exit: [6.8, -4.5], solid: [2.7, 8.8, -3.55, -1.25] }, // world; rot: nose west, the way it drives in
  start: [10.5, -5.6],          // world: on the quay, in front of the shop door
  bounds: [0.6, W - 0.4, -H, -0.5], // world: x0, x1, z0, z1 (the water stops you)
  validateFrom: [10.5, 24.5],   // cell: the front door
  bossLook: { shirt: 0xf2efe6, front: '#f2efe6', pants: 0x2a2a3a, belly: 1.4, head: { hair: '#3a2a1a', brow: '#2a1a0a', glasses: false, hairLine: 60, iris: '#3a2a1a' } },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [22, 27, 'makarov', Math.PI / 2, 'quay'], [34, 25.5, 'bat', Math.PI / 2, 'quay'], [44.5, 28, 'shotgun', -Math.PI / 2, 'quay'],
    [6, 20, 'bat', Math.PI, 'shop'], [15, 20, 'makarov', 0, 'shop'], [9, 13.5, 'bat', Math.PI / 2, 'shop'], [18.5, 13, 'makarov', Math.PI, 'shop'],
    [12, 9.5, 'bat', -Math.PI / 2, 'corridor'],
    [4.5, 3.5, 'makarov', 0, 'freezer'], [7.5, 6.5, 'bat', Math.PI, 'freezer'],
    [15, 2, 'shotgun', 0, 'office', true], [12, 5.5, 'makarov', Math.PI / 2, 'office'],
    [24, 3.5, 'bat', Math.PI / 2, 'packing'], [30, 2.5, 'makarov', 0, 'packing'], [36, 4, 'bat', -Math.PI / 2, 'packing'],
    [24.5, 10.5, 'makarov', Math.PI / 2, 'fryhall'], [30.5, 14, 'bat', 0, 'fryhall'], [36, 17.5, 'makarov', -Math.PI / 2, 'fryhall'], [26, 21.5, 'shotgun', Math.PI, 'fryhall'], [33, 10.5, 'bat', 0, 'fryhall'], [22.5, 17.5, null, Math.PI / 2, 'fryhall'],
    [44.5, 12, 'makarov', Math.PI, 'dock'], [41, 18, 'bat', Math.PI / 2, 'dock'], [46, 20, 'makarov', Math.PI, 'dock'], [45, 2.5, 'bat', 0, 'dock'],
  ],
  loot: [[2.5, 6.5], [7.5, 1.5], [19, 2.5], [37.5, 1.5], [47.5, 15.5], [38, 21.5]], // cell
  text: {
    area: 'KAASLAND · KROKETKADE',
    banner: ['LAMPAS KROKETTENFABRIEK', 'Kroketkade. Long quay, little cover.'],
    objective: 'Take the <b>Lampas kroket factory</b> on Kroketkade. Mind the long quay, then clear the frying hall, the freezer and the office. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Kroketkade is <b>yours</b>. The fryers are cold for now. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Kroketkade is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KROKETKADE UNLOCKED',
    resultsHint: 'The Lampas are off the quay. Their kroket filling was forty percent spice-flavoured sawdust. Grab the crates (E), then drive home.',
    ownedBanner: ['KROKETKADE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['DE FRITUURBAAS IS DOWN', 'No more Lampas krokets on the quay.'],
    tips: ['The quay has long sightlines. Hug the crates, or go round through the loading dock.', 'The freezer has one door. Don\'t get cornered in there.', 'Conveyor lines stop bullets. Picnic tables don\'t.'],
  },
  // water, the far bank, the moored boat, the factory front, krokets riding the conveyors
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, solid, floorW, T, WALL_H, neonRect, neonTube, signTex, canvasTex }) {
    // the water and the quay wall
    const waterT = canvasTex(64, 64, (g) => { g.fillStyle = '#0c2238'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,180,255,${0.05 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 6 + Math.random() * 10, 1); } });
    const water = floorW(OX - 20, OX + W + 30, 0, 26, waterT, 6, 0xffffff, -0.35);
    box(W + 50, 0.4, 0.3, lam({ color: 0x5a5650 }), OX + W / 2 + 5, -0.15, 0.15, root);
    // the far bank: a row of houses with lit windows
    box(W + 50, 0.6, 6, lam({ color: 0x3a3a40 }), OX + W / 2 + 5, 0, 24, root);
    for (let i = 0; i < 12; i++) {
      const x = OX - 18 + i * 6.5, h = 5 + (i * 7) % 4, c = [0x3a2a4a, 0x2a3a5a, 0x4a3a2a, 0x2a4a3a][i % 4];
      box(6, h, 4, lam({ color: c }), x, h / 2, 23, root);
      for (let k = 0; k < 3; k++) for (let r = 0; r < Math.floor(h / 2) - 1; r++) if ((i + k + r) % 3) box(0.8, 0.9, 0.05, new THREE.MeshBasicMaterial({ color: [0xffd88a, 0xffb04a, 0x9ad8ff][(i + k) % 3] }), x - 1.8 + k * 1.8, 1.6 + r * 1.8, 20.97, root, false);
    }
    // neighbours either side of the factory
    for (const [x0, x1, c] of [[-12, 0, 0x2a3a4a], [W, W + 12, 0x3a2a3a]]) box(x1 - x0, 6, H - 9, lam({ color: c }), OX + (x0 + x1) / 2, 3, Z0 + (H - 9) / 2, root);
    // the moored boat at the dock
    const boat = new THREE.Group(); boat.position.set(OX + 44, -0.2, 2.6); root.add(boat);
    box(7.5, 1.0, 2.6, lam({ color: 0x1a3a5a }), 0, 0.3, 0, boat); box(7.6, 0.12, 2.7, lam({ color: 0xf2efe6 }), 0, 0.85, 0, boat, false);
    box(2.4, 1.3, 1.9, lam({ color: 0xf2efe6 }), -1.6, 1.45, 0, boat); box(2.5, 0.1, 2.0, lam({ color: 0xff7a1a }), -1.6, 2.15, 0, boat, false);
    for (const k of [0, 1]) box(1.1, 0.9, 1.1, lam({ color: 0x8a6a3a }), 1.2 + k * 1.3, 1.25, 0, boat);
    const name = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.45), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'DE VETTE PAAL', size: 60 }], '#1a3a5a', '#ffffff', 512, 80) })); name.position.set(0.8, 0.45, -1.31); name.rotation.y = Math.PI; boat.add(name);
    solid(OX + 40, OX + 48, 1.2, 4);
    // the factory front: sign and hatch menus
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.2), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'LAMPAS KROKETTENFABRIEK', size: 92 }, { t: 'VERS VAN DE KADE · SINDS GISTEREN', size: 40, color: '#ffffff' }], '#0a1020', '#ffb040', 1024, 150) }));
    sign.position.set(OX + 20, 2.85, Z0 + 24.02); root.add(sign); neonRect(root, OX + 20, 2.85, 14.2, 1.35, Z0 + 24.06, 0xffb040);
    for (const [x, t, c] of [[5.5, 'KROKET W 2', '#ffb040'], [16, 'FRIKANDEL W 2', '#3ff0ff'], [26, 'BAMISCHIJF W 3', '#ff3fa4'], [35, 'KAASSOUFFLÉ W 3', '#7dff9a']]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.5), new THREE.MeshBasicMaterial({ map: signTex([{ t, size: 46 }], '#0a1020', c, 512, 64) }));
      m.position.set(OX + x, 1.95, Z0 + 24.04); root.add(m);
    }
    // the office: a portrait of the boss of bosses, and a whiteboard of kroket numbers in the frying hall
    const jvk = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8b040'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2a1a1a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(64, 44, 22, 0, 7); g.fill(); g.fillStyle = '#ff7a1a'; g.fillRect(36, 66, 56, 24); g.fillStyle = '#ffd36b'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText('JAN VAN KAAS', 64, 88); }) }));
    jvk.position.set(OX + 15, 1.7, Z0 + 1.02); root.add(jvk);
    const board = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.1), lam({ map: signTex([{ t: 'QUOTA: 40.000 / NACHT', size: 40 }, { t: 'zaagsel: 40%  vlees: ?', size: 30, color: '#c8402e' }], '#f2f2f2', '#1a1a1a', 512, 180) }));
    board.position.set(OX + 30, 1.6, Z0 + 9.02); root.add(board);
    // krokets riding the conveyors
    const krokM = lam({ color: 0xb8742a }), krokets = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'L' && (x === 0 || G[z][x - 1] !== 'L')) {
      let x1 = x; while (G[z][x1 + 1] === 'L') x1++;
      for (let k = x; k <= x1; k += 0.7) { const m = cyl(0.08, 0.08, 0.32, krokM, OX + k + 0.3, 1.2, Z0 + z + 0.5, root, 8); m.rotation.z = Math.PI / 2; krokets.push({ m, a: OX + x + 0.15, b: OX + x1 + 0.85 }); }
    }
    let t = 0;
    return { tick(dt) {
      t += dt; water.material.map.offset.x = t * 0.02; water.material.map.offset.y = Math.sin(t * 0.4) * 0.05;
      boat.position.y = -0.2 + Math.sin(t * 1.3) * 0.05; boat.rotation.z = Math.sin(t * 0.9) * 0.015;
      for (const k of krokets) { k.m.position.x += dt * 0.6; if (k.m.position.x > k.b) k.m.position.x = k.a; }
    } };
  },
};
