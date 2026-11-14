// Mission 3: Uitjesbuurt. De Zure Ui, a pickled-onion cannery by the bridge, De Natte Worst.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions.
//
// In front: a narrow back-alley market where the Lampas collect protection money from the stalls (low cover, bullets fly over).
// Behind it, tighter and more maze-like than Mission 1: the counting room (the shop front), the kantine, a corridor,
// the storeroom, the cannery floor with pickle vats, shelving and a jar line, and the lieutenant's back office (boss).
// Loops: alley → counting room → corridor → cannery → loading door → alley
//        alley → kantine → office → storeroom → cannery / corridor

const W = 44, H = 29;

export default {
  id: 'uitjesbuurt', name: 'Uitjesbuurt', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['office', 1, 1, 8, 6, 'parquet'], ['storeroom', 10, 1, 20, 8, 'concrete'], ['cannery', 22, 1, 42, 16, 'pickle'],
    ['kantine', 1, 8, 8, 16, 'shag'], ['corridor', 10, 10, 20, 11, 'hall'], ['counting', 10, 13, 20, 16, 'checker'],
    ['alley', 1, 18, 42, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    // doors
    putR(9, 3, 9, 4, 'D');     // office ↔ storeroom
    putR(4, 7, 5, 7, 'D');     // office ↔ kantine
    putR(21, 2, 21, 3, 'D');   // storeroom ↔ cannery
    putR(14, 9, 15, 9, 'D');   // storeroom ↔ corridor
    putR(9, 10, 9, 11, 'D');   // kantine ↔ corridor
    putR(21, 10, 21, 11, 'D'); // corridor ↔ cannery
    putR(12, 12, 13, 12, 'D'); // corridor ↔ counting room
    putR(3, 17, 4, 17, 'D');   // kantine ↔ alley (back door)
    putR(16, 17, 17, 17, 'D'); // counting room ↔ alley (the shop door)
    putR(38, 17, 39, 17, 'D'); // cannery ↔ alley (loading door)
    carve(5, 28, 7, 28); carve(30, 28, 32, 28); // the alley opens onto the street in two places
    // glass: the shop window and the cannery windows onto the alley
    putR(11, 17, 14, 17, '%'); putR(19, 17, 20, 17, '%'); putR(24, 17, 27, 17, '%');
    // office: the lieutenant's desk, safe, sofa
    putR(2, 3, 6, 3, 'O'); put(8, 1, 'V'); putR(1, 5, 1, 6, 'S'); put(8, 6, 'p');
    // storeroom: racks of jars, crates
    putR(12, 2, 12, 6, 'R'); putR(18, 2, 18, 6, 'R'); putR(10, 7, 11, 8, 'C');
    // kantine: tables, vending machines, a sofa
    putR(2, 11, 3, 12, 'T'); putR(6, 11, 7, 12, 'T'); putR(8, 14, 8, 15, 'F'); putR(1, 15, 1, 16, 'S');
    // counting room: the money table and a safe
    putR(14, 14, 16, 15, 'T'); put(20, 13, 'V');
    // cannery: pickle vats, shelving, the jar line, barrels, crates
    for (const x of [24, 28, 32, 36]) putR(x, 3, x + 1, 4, 'J');
    putR(24, 8, 29, 8, 'R'); putR(32, 8, 38, 8, 'R');
    putR(24, 12, 29, 12, 'L'); putR(32, 12, 38, 12, 'L');
    put(42, 8, 'X'); putR(40, 10, 41, 11, 'C'); put(22, 16, 'X');
    // the alley market: two rows of stalls (low), walls that split it into a maze, crates and barrels
    putR(3, 20, 6, 20, 'm'); putR(9, 20, 12, 20, 'm'); putR(26, 20, 29, 20, 'm'); putR(32, 20, 35, 20, 'm');
    putR(6, 24, 9, 24, 'm'); putR(13, 24, 16, 24, 'm'); putR(22, 24, 25, 24, 'm'); putR(29, 24, 32, 24, 'm'); putR(36, 24, 39, 24, 'm');
    putR(20, 19, 20, 22, '#'); putR(20, 26, 20, 27, '#'); putR(41, 21, 42, 22, '#');
    putR(9, 26, 11, 27, '#'); putR(26, 21, 27, 22, '#'); putR(34, 26, 36, 27, '#'); putR(1, 22, 2, 23, '#'); putR(13, 21, 14, 21, 'C'); putR(30, 22, 30, 23, 'C'); // sheds and crate stacks
    putR(17, 19, 18, 19, 'C'); putR(38, 19, 38, 20, 'C'); put(2, 26, 'X'); put(26, 27, 'X');
  },
  furn: {
    m: { h: 0.9, cover: false, draw: ({ THREE, root, box, cyl, lam, n, h, cx, cz, x, OX }) => { // market stall
      box(n - 0.1, 0.08, 0.86, lam({ color: 0x8a6a3a }), cx, h - 0.04, cz, root);
      box(n - 0.2, h - 0.1, 0.7, lam({ color: 0x5a4028 }), cx, (h - 0.1) / 2, cz, root);
      for (let k = 0; k < n; k++) for (let j = 0; j < 3; j++) cyl(0.09, 0.09, 0.22, lam({ color: [0xd8e070, 0x9ac040, 0xf2efe6][(x + k + j) % 3] }), OX + x + k + 0.25 + j * 0.25, h + 0.11, cz + (j % 2 ? 0.15 : -0.15), root, 8);
      box(n - 0.1, 0.06, 0.12, lam({ color: [0xff3fa4, 0x3ff0ff, 0xffd23a, 0x7dff9a][x % 4] }), cx, h + 0.35, cz + 0.4, root, false);
    } },
    J: { h: 1.8, cover: true, draw: ({ THREE, root, cyl, lam, h, cx, cz, x, z, G }) => { // pickle vat (2×2): drawn once per block
      if (G[z - 1] && G[z - 1][x] === 'J') return;
      cyl(0.95, 0.95, h, lam({ color: 0x8a9a6a }), cx, h / 2, cz + 0.5, root, 20);
      for (const y of [0.4, 1.4]) cyl(0.97, 0.97, 0.08, lam({ color: 0x3a3a30 }), cx, y, cz + 0.5, root, 20);
      cyl(0.85, 0.85, 0.04, new THREE.MeshBasicMaterial({ color: 0xb8d040 }), cx, h + 0.01, cz + 0.5, root, 20);
    } },
    L: { h: 1.1, cover: true, draw: ({ THREE, root, box, cyl, lam, n, h, cx, cz, x, OX }) => { // jar filling line
      box(n - 0.04, h - 0.1, 0.8, lam({ color: 0x4a5a44 }), cx, (h - 0.1) / 2, cz, root);
      box(n - 0.08, 0.05, 0.6, lam({ color: 0x1a1a1e }), cx, h - 0.07, cz, root, false);
      for (let k = 0; k < n * 2; k++) cyl(0.11, 0.11, 0.28, lam({ color: 0xd8e070, transparent: true, opacity: 0.85 }), OX + x + 0.25 + k * 0.5, h + 0.1, cz, root, 8);
    } },
  },
  rackGoods: [0xd8e070, 0x9ac040, 0xf2efe6],
  floors: {
    pickle: (g) => { g.fillStyle = '#c8d4b8'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#8a9a78'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(150,180,40,.25)'; g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 4 + Math.random() * 8, 3 + Math.random() * 5, Math.random(), 0, 7); g.fill(); } },
    cobble: (g) => { g.fillStyle = '#4a4640'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#5a554c', '#645e54', '#524d45'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { cobble: 1.6 },
  hallCells: [[5, 28], [6, 28], [7, 28], [30, 28], [31, 28], [32, 28]],
  doorSigns: { '16,17': 'ZUURWINKEL', '38,17': 'LADEN' },
  neon: { office: 0xff4a3a, storeroom: 0xffd8a0, cannery: 0x9aff7a, kantine: 0xff7a1a, corridor: 0x3ff0ff, counting: 0xffd23a, alley: 0xff3fa4 },
  lights: [[4.5, 3.5, 0xff4a3a, 1.8], [15, 4, 0xffd8a0, 1.3], [30, 6, 0x9aff7a, 2.2], [36, 13, 0x9aff7a, 1.6], [4.5, 12, 0xff7a1a, 1.4], [15, 14.5, 0xffd23a, 1.6], [9, 22, 0xffc860, 1.8], [24, 22, 0xffc860, 1.8], [36, 22, 0xffc860, 1.6]],
  mood: { bg: 0x0e180c, fogNear: 28, fogFar: 70, hemi: 0.55, sun: 0.8, wall: 0x2e2a1e, cap: 0xf0ecd0, under: 0x5a5a3a },
  van: { park: [16, 4.6], rot: Math.PI, from: W + 16, exit: [16.6, 3.0], solid: [12.7, 18.8, 3.45, 5.75] }, // world; drives in over the bridge
  start: [6.5, 1.6],             // world: in front of the west alley mouth
  bounds: [-6, W + 9, -H, 10],   // world: x0, x1, z0, z1
  validateFrom: [6.5, 28.5],     // cell: the west alley mouth
  bossLook: { shirt: 0x1a1a1a, front: '#1a1a1a', pants: 0x2a2a3a, belly: 0.6, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 50, glasses: true, iris: '#3a3a3a' } },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [4, 22, 'bat', Math.PI / 2, 'alley'], [11, 22.5, 'makarov', Math.PI, 'alley'], [17.5, 26, 'bat', -Math.PI / 2, 'alley'], [24, 21.5, 'makarov', Math.PI / 2, 'alley'],
    [28, 26, 'bat', Math.PI, 'alley'], [35, 22, 'shotgun', -Math.PI / 2, 'alley'], [40, 26.5, 'makarov', Math.PI, 'alley'], [14, 19, 'bat', Math.PI / 2, 'alley'],
    [13, 15, 'makarov', 0, 'counting'], [19, 14, 'bat', -Math.PI / 2, 'counting'],
    [3, 10, 'bat', Math.PI / 2, 'kantine'], [6, 14, 'makarov', 0, 'kantine'], [7, 9, null, -Math.PI / 2, 'kantine'],
    [17, 10.5, 'bat', -Math.PI / 2, 'corridor'],
    [4, 2, 'shotgun', 0, 'office', true], [7, 5, 'makarov', -Math.PI / 2, 'office'],
    [13.5, 3.5, 'bat', Math.PI / 2, 'storeroom'], [19.5, 6, 'makarov', Math.PI, 'storeroom'], [16.5, 1.5, 'bat', 0, 'storeroom'],
    [27, 6, 'makarov', 0, 'cannery'], [31, 10, 'bat', Math.PI / 2, 'cannery'], [35, 6, 'bat', -Math.PI / 2, 'cannery'], [39, 14, 'makarov', Math.PI, 'cannery'],
    [24, 14.5, 'shotgun', Math.PI / 2, 'cannery'], [41, 3, 'bat', -Math.PI / 2, 'cannery'], [30, 15, 'makarov', 0, 'cannery'],
  ],
  loot: [[1.5, 1.5], [20, 1.5], [41.5, 15.5], [10.5, 16.5], [1.5, 13.5], [41.5, 19.5]], // cell
  text: {
    area: 'KAASLAND · UITJESBUURT',
    banner: ['DE ZURE UI', 'Uitjesbuurt. The Lampas collect protection money here.'],
    objective: 'Take <b>De Zure Ui</b>, the pickled-onion cannery by the bridge. Clear the market alley, then the cannery and the lieutenant\'s back office. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Uitjesbuurt is <b>yours</b>. The market pays nobody now. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Uitjesbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'UITJESBUURT UNLOCKED',
    resultsHint: 'The market stalls keep their Wilders now. Grab the spice crates (E), then drive home.',
    ownedBanner: ['UITJESBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE LIEUTENANT IS DOWN', 'The protection money stays in Uitjesbuurt.'],
    tips: ['Market stalls are low: bullets fly right over them.', 'The alley is a maze. The cannery has two doors onto it: the shop and the loading door.', 'The pickle vats stop bullets. The stalls don\'t.'],
  },
  // street, the canal and the bridge, neighbours, the cannery front, stall signs
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, solid, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    // street and pavement (over the bridge on the east side)
    floorW(OX - 10, OX + W + 16, 2.6, 12, T.asphalt, 4); floorW(OX - 10, OX + W + 16, 0, 2.6, T.paving, 1.5);
    for (let x = -8; x < W + 16; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 7.3, root, false);
    // neighbours: a block to the west, the canal to the east
    box(10, 7, H, lam({ color: 0x2a3a2a }), OX - 5, 3.5, Z0 + H / 2, root); solid(OX - 10, OX, Z0, 0);
    solid(OX + W, OX + W + 12, Z0, 0);
    const waterT = canvasTex(64, 64, (g) => { g.fillStyle = '#0c2228'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(140,220,160,${0.05 + Math.random() * 0.1})`; g.fillRect(Math.random() * 64, Math.random() * 64, 1, 6 + Math.random() * 10); } });
    const water = floorW(OX + W + 1, OX + W + 9, Z0 - 10, 30, waterT, 4, 0xffffff, -0.6);
    for (const x of [W + 0.8, W + 9.2]) box(0.4, 0.8, H + 10, lam({ color: 0x5a5650 }), OX + x, -0.2, Z0 + H / 2 - 5, root);
    box(3, 6, H, lam({ color: 0x3a2a3a }), OX + W + 11.5, 3, Z0 + H / 2, root); // houses on the far bank
    // the bridge: deck under the street, railings, a sign
    box(8.6, 0.5, 12.4, lam({ color: 0x6a5a4a }), OX + W + 5, -0.26, 6.0, root);
    for (const z of [-0.1, 12.1]) { box(8.6, 0.08, 0.1, lam({ color: 0xe8e8e8 }), OX + W + 5, 1.0, z, root, false); for (let k = 0; k <= 8; k += 1) box(0.06, 1.0, 0.06, lam({ color: 0xe8e8e8 }), OX + W + 1 + k, 0.5, z, root, false); }
    const brug = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'UITJESBRUG', size: 56 }], '#1a3a6a', '#ffffff', 512, 96) })); brug.position.set(OX + W + 5, 1.4, -0.06); root.add(brug);
    // the cannery front: sign over the windows and the loading door
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(13, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'DE ZURE UI · CONSERVENFABRIEK', size: 80 }, { t: 'ZILVERUITJES · AUGURKEN · EIGENDOM VAN DE LAMPAS', size: 34, color: '#ffffff' }], '#0e180c', '#b8e040', 1024, 150) }));
    sign.position.set(OX + 32, 2.8, Z0 + 18.02); root.add(sign); neonRect(root, OX + 32, 2.8, 13.2, 1.25, Z0 + 18.06, 0xb8e040);
    const shop = new THREE.Mesh(new THREE.PlaneGeometry(6, 0.8), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'ZUURWINKEL', size: 70 }], '#1a0a10', '#ffd23a', 512, 80) }));
    shop.position.set(OX + 15.5, 2.75, Z0 + 18.02); root.add(shop); neonRect(root, OX + 15.5, 2.75, 6.2, 0.95, Z0 + 18.06, 0xffd23a);
    // stall signs and Lampas money bags on the counting table
    const names = ['AUGURK', 'ZILVERUI', 'ZUURKOOL', 'PICCALILLY', 'HARING', 'BIETJES', 'MOSTERD', 'KAPPERTJES', 'RODE UI'];
    let ni = 0;
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'm' && G[z][x - 1] !== 'm') {
      let x1 = x; while (G[z][x1 + 1] === 'm') x1++;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x + 0.6, 0.32), new THREE.MeshBasicMaterial({ map: signTex([{ t: names[ni++ % names.length], size: 40 }], '#f2efe6', '#2a1a12', 256, 48) }));
      m.position.set(OX + (x + x1 + 1) / 2, 1.45, Z0 + z + 0.92); root.add(m);
      for (const px of [x + 0.08, x1 + 0.92]) box(0.06, 1.6, 0.06, lam({ color: 0x3a2a1a }), OX + px, 0.8, Z0 + z + 0.9, root, false);
    }
    for (const [x, z] of [[14.6, 14.4], [15.4, 14.8], [16.2, 14.3]]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lam({ color: 0xc8b070 })); b.position.set(OX + x, 0.92, Z0 + z); b.scale.y = 1.2; root.add(b); }
    let t = 0;
    return { tick(dt) { t += dt; water.material.map.offset.y = t * 0.03; } };
  },
};
