// Act 3 finale: Kardemomdok (De Duistere Dokken). The Abdavissies headquarters above the dock. Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Containerchaos_Kardemomdok, the upper floor): a quay with the crane, a dock
// office hall with desks and crates, a red club room, and the boss's wood-panelled office with a globe and a desk of files.
// The twist: the finale. De Abdavis (five hits) holds the office; the floor only clears once you take his files (E): they tell what
// really happened to Freddy Sr.'s empire, and where De Gouden Mix is hidden.

import { dock } from './docks.js';

export default dock({
  id: 'kardemomdok', name: 'Kardemomdok', kiosk: 'KARDEMOM', sign: 'KARDEMOMDOK · HOOFDKANTOOR', taskName: 'FILE',
  hall: 'office', floors: { office: (g) => { g.fillStyle = '#3a3430'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } }, panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } }, cold: (g) => { g.fillStyle = '#2a3440'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a4a5a'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); } } }, floorRep: { office: 3, panel: 1.5, cold: 2 },
  hallLight: 0xe8a33d,
  // The headquarters: three rooms across the back, the red club, De Abdavis's wood-panelled office in the middle (glass onto the
  // floor below it) and the records room of tall filing racks; an open-plan office floor across the middle; and along the front a
  // garage with its shutter up, the reception behind a glass front, and the security room.
  plan: {
    rooms: [['club', 1, 1, 14, 10, 'red'], ['boss', 16, 1, 29, 10, 'panel'], ['records', 31, 1, 44, 10, 'office'], ['hall', 1, 12, 44, 19, 'office'], ['garage', 1, 21, 12, 23, 'depot'], ['reception', 14, 21, 31, 23, 'kiosk'], ['security', 33, 21, 44, 23, 'cold']],
    layout({ carve, put, putR }) {
      putR(6, 11, 7, 11, 'D'); putR(22, 11, 23, 11, 'D'); putR(37, 11, 38, 11, 'D'); putR(15, 4, 15, 5, 'D'); putR(30, 4, 30, 5, 'D'); putR(17, 11, 20, 11, '%'); putR(25, 11, 28, 11, '%');
      putR(5, 20, 6, 20, 'D'); putR(22, 20, 23, 20, 'D'); putR(38, 20, 39, 20, 'D');
      carve(3, 24, 9, 24); putR(14, 24, 21, 24, '%'); putR(22, 24, 23, 24, 'D'); putR(24, 24, 31, 24, '%'); putR(36, 24, 41, 24, '%');
      // De Abdavis's office
      putR(20, 3, 24, 4, 'O'); put(29, 1, 'V'); putR(17, 8, 18, 9, 'S'); putR(27, 8, 28, 9, 'S'); put(16, 1, 'p');
      // the club
      putR(2, 1, 9, 1, 'B'); putR(1, 4, 1, 8, 'S'); put(4, 5, 'T'); put(4, 8, 'T'); putR(9, 5, 10, 6, 'P'); put(14, 10, 'p');
      // the records room
      for (const x of [34, 37, 40, 43]) putR(x, 2, x, 8, 'R');
      // the office floor
      for (const [x, z] of [[3, 13], [9, 13], [15, 13], [27, 13], [33, 13], [39, 13], [3, 17], [9, 17], [27, 17], [33, 17], [39, 17]]) putR(x, z, x + 2, z, 'O');
      putR(21, 15, 24, 16, 'C'); put(44, 12, 'X'); put(1, 19, 'X');
      // garage, reception, security
      putR(10, 21, 11, 22, 'C'); put(1, 21, 'X');
      putR(16, 22, 19, 22, 'K'); put(14, 21, 'p'); put(31, 21, 'p'); putR(27, 23, 30, 23, 'S');
      putR(41, 22, 43, 22, 'w'); putR(44, 21, 44, 23, 'F');
    },
    hallCells: [[3, 24], [4, 24], [5, 24], [6, 24], [7, 24], [8, 24], [9, 24]],
    doorSigns: { '22,11': 'DE ABDAVIS', '37,11': 'ARCHIEF' },
    roomNames: { club: 'DE CLUB', boss: 'DE ABDAVIS', records: 'ARCHIEF', hall: 'KANTOORTUIN', garage: 'GARAGE', reception: 'RECEPTIE', security: 'BEVEILIGING', quay: 'KADE' },
    neon: { club: 0xc2412d, boss: 0xe8a33d, records: 0xffd8a0, hall: 0xffd8a0, reception: 0xe8a33d, security: 0x8aa8c8 },
    lights: [[18, 22, 0xd8ccb0, 1.3], [6, 5, 0xc2412d, 1.6], [22, 6, 0xe8a33d, 2.0], [37, 5, 0xffd8a0, 1.1], [8, 15, 0xffd8a0, 1.4], [22, 15, 0xffd8a0, 1.4], [36, 15, 0xffd8a0, 1.4], [6, 22, 0x8a9aa8, 0.9], [39, 22, 0x8aa8c8, 1.0], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [22, 2, 'shotgun', 0, 'boss', true, 'abdavis'], [18, 6, 'makarov', Math.PI / 2, 'boss'], [27, 6, 'makarov', -Math.PI / 2, 'boss'],
      [5, 5, 'shotgun', 0, 'club'], [11, 8, 'makarov', -Math.PI / 2, 'club'], [3, 9, 'makarov', Math.PI / 2, 'club'],
      [35.5, 5, 'shotgun', 0, 'records'], [41.5, 7, 'makarov', Math.PI, 'records'],
      [7, 15, 'makarov', Math.PI, 'hall'], [13, 15, 'bat', Math.PI / 2, 'hall'], [19, 18, 'makarov', Math.PI, 'hall'], [26, 15, 'shotgun', Math.PI, 'hall'], [31, 18.5, 'bat', Math.PI, 'hall'], [37, 15, 'makarov', -Math.PI / 2, 'hall'], [43, 18, 'shotgun', -Math.PI / 2, 'hall'], [2, 15, 'bat', Math.PI / 2, 'hall'],
      [5, 22, 'makarov', Math.PI, 'garage'], [25, 22, 'makarov', Math.PI, 'reception'], [15, 23, 'bat', Math.PI / 2, 'reception'], [36, 22, 'makarov', Math.PI / 2, 'security'],
    ],
    loot: [[1.5, 1.5], [29, 2.5], [44, 19], [12, 23], [33, 23], [34, 10], [40, 1.5]],
    signs: [['KARDEMOM', 22.5, 4.4, '#e8a33d'], ['KARDEMOMDOK · HOOFDKANTOOR', 6, 8, '#c8d8e0']],
    crane: [47.5, 26.5],
  },
  bossLook: { cap: 0x1a1a1a, shirt: 0x1a2a3a, front: '#1a2a3a', pants: 0x1a1a1a, belly: 1.0 },
  text: {
    area: 'DE DUISTERE DOKKEN · KARDEMOMDOK',
    banner: ['KARDEMOMDOK', 'The Abdavissies headquarters. De Abdavis is waiting.'],
    objective: 'Storm <b>Kardemomdok</b>. Take down <b>De Abdavis</b> in his office and <b>take his files</b> (E) from the desk. <span style="color:#ffd36b">This ends the Abdavissies.</span>',
    objectiveOwned: 'Kardemomdok is <b>yours</b>. The Abdavissies are finished. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Kardemomdok has fallen.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'THE ABDAVISSIES ARE FINISHED',
    resultsHint: 'De Abdavis is down and his files are yours. They point to an island in the river. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KARDEMOMDOK IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['DE ABDAVIS IS DOWN', 'The Abdavissies are finished.'],
    taskHint: 'Take De Abdavis\'s files from his desk (E).', tasksDone: 'THE FILES ARE YOURS',
    tips: ['De Abdavis takes five hits. His office has a glass wall onto the hall.', 'The files are on his desk. The floor clears once you have them.', 'Desks in the office hall stop bullets.'],
  },
  decorate({ THREE, root, OX, Z0, box, cyl, lam, sign }) {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), lam({ color: 0x3a6a8a })); globe.position.set(OX + 27.5, 1.3, Z0 + 2.5); root.add(globe); cyl(0.05, 0.08, 0.9, lam({ color: 0x5a3a1a }), OX + 27.5, 0.45, Z0 + 2.5, root, 8);
    sign('DE ABDAVIS', 2.4, 0.4, '#1a0e08', '#e8a33d', OX + 22.5, 2.5, Z0 + 1.03, 0, 40);
    const files = new THREE.Group(); files.position.set(OX + 22.5, 0.85, Z0 + 4); root.add(files);
    for (let k = 0; k < 4; k++) box(0.35, 0.05, 0.45, lam({ color: [0xd8ccb0, 0xc2412d, 0xd8a83a, 0xf3ecdc][k] }), k * 0.4 - 0.6, 0.03 + k * 0.01, 0, files, false);
    const tasks = [{ pos: new THREE.Vector3(OX + 22.5, 0, Z0 + 5.6), obj: files, label: 'Take De Abdavis\'s files', score: 3000, doneText: 'DE DOSSIERS!',
      act() { files.visible = false; }, reset(done) { files.visible = !done; } }];
    let t = 0;
    return { tasks, tick(dt) { t += dt; globe.rotation.y += dt * 0.3; } };
  },
});
