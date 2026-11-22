// Act 3, mission 7: Saffraanpier (De Duistere Dokken). Restaurant De Rode Draad on the saffron pier, with the Abdavissies' saffron
// vault behind it. Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Saffraanpier): a pier gate
// hung with red lanterns, a red-lit restaurant with booths and a bar, a glass private dining room, and a gold-lit vault of crates.
// The twist: crack the saffron vault (E) as well as clearing the floor.

import { dock } from './docks.js';

export default dock({
  id: 'saffraanpier', name: 'Saffraanpier', kiosk: 'DE RODE DRAAD', sign: 'SAFFRAANPIER', taskName: 'VAULT',
  hall: 'redwood', floors: { redwood: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#5a2018', '#4a1a14', '#6a2a1a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } }, gold: (g) => { g.fillStyle = '#5a4a2a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.strokeRect(4, 4, 56, 56); }, deck: (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = ['#6a5038', '#5a4430', '#74583e'][(x / 8) % 3]; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 0, 1, 64); } } }, floorRep: { redwood: 1.5, gold: 2, deck: 1.6 },
  furn: { B: { color: 0x3a1a10 }, T: { color: 0x6a2a1a }, S: { color: 0x8a1a1a }, V: { color: 0xc8a040 } },
  // The building: the pier gate (the way in) and the kitchen stack up on the left; the red restaurant fills the middle behind a glass
  // front onto a wooden terrace over the water; the saffron vault and a glass private dining room hold the right.
  plan: {
    rooms: [['kitchen', 1, 1, 10, 12, 'tiles'], ['gate', 1, 14, 10, 23, 'kiosk'], ['rest', 12, 1, 33, 18, 'redwood'], ['vault', 35, 1, 44, 10, 'gold'], ['dining', 35, 12, 44, 18, 'redwood'], ['terrace', 12, 20, 44, 23, 'deck']],
    quayFloor: 'deck',
    layout({ carve, put, putR }) {
      putR(11, 5, 11, 6, 'D'); putR(5, 13, 6, 13, 'D'); putR(11, 16, 11, 17, 'D'); putR(11, 21, 11, 22, 'D');
      putR(12, 19, 33, 19, '%'); putR(22, 19, 23, 19, 'D'); putR(34, 5, 34, 6, 'D'); putR(34, 12, 34, 18, '%'); putR(34, 14, 34, 15, 'D');
      putR(35, 19, 37, 19, '%'); putR(38, 19, 39, 19, 'D'); putR(40, 19, 44, 19, '%');
      putR(1, 24, 4, 24, '%'); putR(5, 24, 6, 24, 'D'); putR(7, 24, 10, 24, '%'); carve(12, 24, 30, 24); putR(31, 24, 44, 24, 'f');
      // the restaurant: booths on the west wall, the bar, round tables
      putR(12, 1, 12, 3, 'S'); putR(12, 9, 12, 12, 'S'); putR(14, 2, 15, 2, 'T'); putR(14, 10, 15, 10, 'T'); putR(20, 1, 29, 1, 'B');
      for (const [x, z] of [[17, 6], [23, 6], [29, 6], [17, 12], [23, 12], [29, 12], [29, 16]]) putR(x, z, x + 1, z + 1, 'T');
      put(33, 1, 'p');
      // the vault
      putR(36, 2, 37, 3, 'C'); putR(43, 6, 44, 7, 'C'); putR(36, 8, 37, 9, 'C'); put(44, 1, 'V');
      // the private dining room
      putR(37, 15, 42, 16, 'T'); putR(37, 12, 42, 12, 'S'); put(44, 12, 'p');
      // the kitchen
      putR(3, 1, 8, 1, 'w'); putR(3, 6, 7, 6, 'w'); putR(10, 1, 10, 2, 'F'); putR(1, 9, 1, 12, 'R');
      // the pier gate
      putR(1, 17, 3, 17, 'K'); put(7, 19, 'T'); put(1, 23, 'p');
      // the terrace
      for (const [x, z] of [[15, 21], [18, 22], [26, 21], [29, 22], [33, 21], [42, 21]]) put(x, z, 't');
    },
    quay({ put }) { put(1, 27, 'l'); put(25, 28, 'l'); put(43, 26, 'X'); },
    hallCells: [[12, 24], [13, 24], [14, 24], [15, 24], [16, 24], [17, 24], [18, 24], [19, 24], [20, 24], [21, 24], [22, 24], [23, 24], [24, 24], [25, 24], [26, 24], [27, 24], [28, 24], [29, 24], [30, 24]],
    doorSigns: { '34,5': 'PRIVÉ' },
    roomNames: { kitchen: 'KEUKEN', gate: 'DE RODE DRAAD', rest: 'RESTAURANT', vault: 'SAFFRAANKLUIS', dining: 'SALON', terrace: 'TERRAS', quay: 'SAFFRAANPIER' },
    neon: { rest: 0xc2412d, gate: 0xc2412d, vault: 0xf2c14e, kitchen: 0xe8f0f0, dining: 0xe8a33d },
    lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xe8f0f0, 1.3], [18, 6, 0xc2412d, 1.5], [26, 13, 0xc2412d, 1.5], [28, 4, 0xe8a33d, 1.3], [40, 5, 0xf2c14e, 2.0], [40, 15, 0xc2412d, 1.4], [20, 22, 0xc2412d, 1.0], [36, 22, 0xc2412d, 1.0], [8, 27, 0xc2412d, 1.0]],
    spawns: [
      [4, 19, 'makarov', Math.PI, 'gate'], [8, 22, 'bat', -Math.PI / 2, 'gate'],
      [5, 4, 'makarov', Math.PI / 2, 'kitchen'], [8, 9, 'bat', Math.PI, 'kitchen'],
      [16, 7.5, 'makarov', Math.PI / 2, 'rest'], [21, 14, 'bat', Math.PI / 2, 'rest'], [26, 4, 'makarov', Math.PI, 'rest'], [26, 10, 'shotgun', Math.PI, 'rest'], [31, 15, 'makarov', -Math.PI / 2, 'rest'], [20, 17.5, 'bat', Math.PI, 'rest'],
      [39, 5, 'shotgun', 0, 'vault'], [42, 8.5, 'makarov', -Math.PI / 2, 'vault'],
      [39.5, 13.8, 'shotgun', Math.PI, 'dining', true], [43, 17.5, 'makarov', -Math.PI / 2, 'dining'],
      [16, 23, 'makarov', 0, 'terrace'], [36, 21.5, 'bat', Math.PI, 'terrace'],
    ],
    loot: [[2.5, 12], [32, 1.5], [44, 9.5], [44, 17.5], [44, 22.5]],
    signs: [['DE RODE DRAAD', 5.5, 4.6, '#c2412d'], ['SAFFRAANPIER', 22.5, 7, '#e8a33d', 19.6]],
    crane: null,
    rain: [[12, 20, 44, 24]], wet: (x, z) => x >= 12 && z >= 20,
  },
  bossLook: { cap: 0xc2412d, shirt: 0xc2412d, front: '#c2412d', pants: 0x1a1a1a, belly: 0.6, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 56, iris: '#2a1a1a' } }, // Mevrouw Saffraan: red silk
  text: {
    area: 'DE DUISTERE DOKKEN · SAFFRAANPIER',
    banner: ['DE RODE DRAAD', 'Saffraanpier. Saffron is worth more than gold. They keep it like gold.'],
    objective: 'Take <b>De Rode Draad</b> and <b>crack the saffron vault</b> (E) at the back. Mevrouw Saffraan holds court in the red room. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Saffraanpier is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Saffraanpier is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'SAFFRAANPIER TAKEN',
    resultsHint: 'The vault is open and the saffron is yours. Grab the spice crates (E), then drive home.',
    ownedBanner: ['SAFFRAANPIER IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['MEVROUW SAFFRAAN IS DOWN', 'Thread cut.'],
    taskHint: 'Crack the saffron vault (E).', tasksDone: 'VAULT CRACKED',
    tips: ['The vault is in the north-east corner, behind its own two doors.', 'The bar stops bullets. Booths and tables don\'t.', 'The glass dining room looks out over the whole restaurant.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, cyl }) {
    // red lanterns over the pier gate
    for (const x of [3, 9, 15, 21, 27, 33, 39]) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), new THREE.MeshBasicMaterial({ color: 0xc2412d })); l.scale.y = 1.3; l.position.set(OX + x, 2.8, Z0 + 26); root.add(l); }
    const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.06, 16), lam({ color: 0xc8a040 })); dial.rotation.x = Math.PI / 2; dial.position.set(OX + 41, 0.8, Z0 + 1.95); root.add(dial);
    const gold = new THREE.Group(); gold.visible = false; root.add(gold);
    for (let k = 0; k < 8; k++) box(0.4, 0.25, 0.3, lam({ color: 0xe8a33d }), OX + 39.5 + (k % 4) * 0.6, 0.13, Z0 + 2.5 + Math.floor(k / 4) * 0.5, gold, false);
    const tasks = [{ pos: new THREE.Vector3(OX + 41, 0, Z0 + 2.6), obj: dial, label: 'Crack the saffron vault', score: 2000, doneText: 'SAFFRAAN! +W 2.000', spin: 0,
      act() { this.spin = 1; gold.visible = true; }, reset(done) { gold.visible = !!done; } }];
    return { tasks, tick(dt) { if (tasks[0].spin > 0) { tasks[0].spin -= dt; dial.rotation.y += dt * 12; } } };
  },
});
