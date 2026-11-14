// Act 3, mission 7: Saffraanpier (De Duistere Dokken). Restaurant De Rode Draad on the saffron pier, with the Abdavissies' saffron
// vault behind it. Built on the shared docks layout (js/levels/docks.js) after the concept art (03_Act3_Saffraanpier): a pier gate
// hung with red lanterns, a red-lit restaurant with booths and a bar, a glass private dining room, and a gold-lit vault of crates.
// The twist: crack the saffron vault (E) as well as clearing the floor.

import { dock } from './docks.js';

export default dock({
  id: 'saffraanpier', name: 'Saffraanpier', kiosk: 'DE RODE DRAAD', sign: 'SAFFRAANPIER', taskName: 'VAULT',
  hall: 'redwood', floors: { redwood: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#5a2018', '#4a1a14', '#6a2a1a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } }, gold: (g) => { g.fillStyle = '#5a4a2a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.strokeRect(4, 4, 56, 56); } }, floorRep: { redwood: 1.5, gold: 2 },
  hallLight: 0xc2412d,
  extraRooms: [],
  lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xc2412d, 1.5], [18, 6, 0xc2412d, 1.5], [18, 17, 0xc2412d, 1.5], [28, 12, 0xe8a33d, 1.5], [40, 6, 0xf2c14e, 2.0], [40, 18, 0xc2412d, 1.3], [8, 27, 0xc2412d, 1.0], [26, 27, 0xc2412d, 1.0]],
  hallLayout({ putR, put }) {
    putR(35, 1, 35, 11, '#'); putR(35, 5, 35, 6, 'D'); putR(36, 12, 44, 12, '#'); putR(39, 12, 40, 12, 'D'); // the vault walls
    putR(14, 2, 14, 5, 'S'); putR(14, 9, 14, 12, 'S'); putR(14, 16, 14, 19, 'S'); putR(17, 3, 18, 3, 'T'); putR(17, 10, 18, 10, 'T'); putR(17, 17, 18, 17, 'T');
    putR(22, 2, 31, 2, 'B'); putR(24, 8, 25, 9, 'T'); putR(30, 8, 31, 9, 'T'); putR(24, 15, 25, 16, 'T'); putR(30, 15, 31, 16, 'T');
    putR(25, 20, 30, 20, '%'); put(22, 22, 'p'); put(34, 22, 'p');
    putR(37, 2, 38, 3, 'C'); putR(42, 2, 43, 3, 'C'); putR(37, 8, 38, 9, 'C'); putR(43, 9, 44, 10, 'C'); putR(40, 1, 41, 1, 'V');
    putR(38, 16, 42, 16, 'T'); putR(38, 20, 42, 20, 'S');
  },
  furn: { B: { color: 0x3a1a10 }, T: { color: 0x6a2a1a }, S: { color: 0x8a1a1a }, V: { color: 0xc8a040 } },
  hallSpawns: [
    [16, 6.5, 'makarov', Math.PI / 2, 'hall'], [20, 13, 'bat', Math.PI / 2, 'hall'], [27, 4.5, 'makarov', Math.PI, 'hall'], [28, 12, 'shotgun', Math.PI, 'hall'],
    [33, 17, 'makarov', -Math.PI / 2, 'hall'], [20, 21.5, 'bat', Math.PI, 'hall'],
    [39, 5, 'shotgun', 0, 'hall'], [42, 7, 'makarov', -Math.PI / 2, 'hall'], [40, 18, 'makarov', Math.PI, 'hall'], [43, 22, 'bat', -Math.PI / 2, 'hall'],
  ],
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
