// Act 3 finale: Kardemomdok (De Duistere Dokken). The Abdavissies headquarters above the dock. Built on the shared docks layout
// (js/levels/docks.js) after the concept art (03_Act3_Containerchaos_Kardemomdok, the upper floor): a quay with the crane, a dock
// office hall with desks and crates, a red club room, and the boss's wood-panelled office with a globe and a desk of files.
// The twist: the finale. De Abdavis (five hits) holds the office; the floor only clears once you take his files (E): they tell what
// really happened to Eddy Sr.'s empire, and where De Gouden Mix is hidden.

import { dock } from './docks.js';

export default dock({
  id: 'kardemomdok', name: 'Kardemomdok', kiosk: 'KARDEMOM', sign: 'KARDEMOMDOK · HOOFDKANTOOR', taskName: 'FILE',
  hall: 'office', floors: { office: (g) => { g.fillStyle = '#3a3430'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } }, panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } } }, floorRep: { office: 3, panel: 1.5 },
  hallLight: 0xe8a33d,
  extraRooms: [['boss', 34, 1, 44, 10, 'panel']],
  neon: { boss: 0xe8a33d },
  lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xc2412d, 1.6], [20, 6, 0xffd8a0, 1.4], [28, 6, 0xffd8a0, 1.4], [20, 17, 0xffd8a0, 1.4], [33, 17, 0xffd8a0, 1.4], [39, 5, 0xe8a33d, 2.0], [8, 27, 0xd8a83a, 0.9]],
  redSpawns: [[5, 5, 'shotgun', 0, 'redroom'], [8, 9, 'makarov', -Math.PI / 2, 'redroom'], [2, 6, 'makarov', Math.PI / 2, 'redroom']],
  hallLayout({ putR, put }) {
    putR(33, 1, 33, 11, '#'); putR(34, 11, 44, 11, '#'); putR(33, 5, 33, 6, 'D'); putR(39, 11, 40, 11, 'D'); putR(33, 8, 33, 10, '%'); // the boss office
    putR(37, 3, 41, 4, 'O'); put(44, 1, 'V'); putR(35, 8, 36, 9, 'S'); putR(43, 7, 44, 9, 'S'); put(34, 1, 'p');
    for (const [x, z] of [[15, 3], [21, 3], [27, 3], [15, 8], [21, 8], [27, 8]]) putR(x, z, x + 2, z, 'O');
    for (const [x, z] of [[15, 14], [22, 15], [30, 14], [38, 15], [16, 20], [26, 20], [36, 20]]) putR(x, z, x + 1, z + 1, 'C');
    put(44, 23, 'X'); put(12, 1, 'X');
  },
  hallSpawns: [
    [18, 5.5, 'makarov', Math.PI, 'hall'], [24, 5.5, 'bat', Math.PI / 2, 'hall'], [30, 6, 'makarov', -Math.PI / 2, 'hall'], [18, 11, 'shotgun', 0, 'hall'],
    [26, 12, 'makarov', Math.PI, 'hall'], [34, 13, 'shotgun', Math.PI, 'hall'], [20, 18, 'makarov', Math.PI / 2, 'hall'], [31, 18, 'bat', Math.PI, 'hall'], [42, 18, 'makarov', -Math.PI / 2, 'hall'], [41, 13, 'bat', -Math.PI / 2, 'hall'],
    [39, 2, 'shotgun', 0, 'boss', true, 'abdavis'], [36, 6, 'makarov', Math.PI / 2, 'boss'], [43, 5, 'makarov', -Math.PI / 2, 'boss'],
  ],
  loot: [[34, 10], [40, 1.5]],
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
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), lam({ color: 0x3a6a8a })); globe.position.set(OX + 43, 1.3, Z0 + 3); root.add(globe); cyl(0.05, 0.08, 0.9, lam({ color: 0x5a3a1a }), OX + 43, 0.45, Z0 + 3, root, 8);
    sign('DE ABDAVIS', 2.4, 0.4, '#1a0e08', '#e8a33d', OX + 39.5, 2.5, Z0 + 1.03, 0, 40);
    const files = new THREE.Group(); files.position.set(OX + 39, 0.85, Z0 + 3.6); root.add(files);
    for (let k = 0; k < 4; k++) box(0.35, 0.05, 0.45, lam({ color: [0xd8ccb0, 0xc2412d, 0xd8a83a, 0xf3ecdc][k] }), k * 0.4 - 0.6, 0.03 + k * 0.01, 0, files, false);
    const tasks = [{ pos: new THREE.Vector3(OX + 39, 0, Z0 + 5.6), obj: files, label: 'Take De Abdavis\'s files', score: 3000, doneText: 'DE DOSSIERS!',
      act() { files.visible = false; }, reset(done) { files.visible = !done; } }];
    let t = 0;
    return { tasks, tick(dt) { t += dt; globe.rotation.y += dt * 0.3; } };
  },
});
