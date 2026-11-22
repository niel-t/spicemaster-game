// Act 3, mission 1: Komijnkade (De Duistere Dokken). Kiosk De Natte Komijn and the Abdavissies' first warehouse on the quay.
// Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Komijnkade): a stormy quay with a crane, a
// lit kiosk, a warehouse of crate stacks and pallets, and a red smoking room.
// The twist: the storm. Every few seconds a wave breaks over the quay edge and knocks down everyone near the water, Eddy included.

import { dock } from './docks.js';

export default dock({
  id: 'komijnkade', name: 'Komijnkade', kiosk: 'DE NATTE KOMIJN', sign: 'KOMIJNKADE · OPSLAG ABDAVISSIES',
  // The building: one long storehouse across the back, the kiosk on the left, a rain-soaked loading yard open to the quay in the
  // middle, and the red smoking room on the right with a glass front onto the sea.
  plan: {
    rooms: [['hall', 1, 1, 44, 12, 'depot'], ['kiosk', 1, 14, 9, 23, 'kiosk'], ['yard', 11, 14, 33, 23, 'quay'], ['smoke', 35, 14, 44, 23, 'red']],
    layout({ carve, put, putR }) {
      putR(4, 13, 5, 13, 'D'); putR(10, 19, 10, 20, 'D'); putR(34, 17, 34, 18, 'D'); putR(40, 13, 41, 13, 'D');
      carve(15, 13, 18, 13); carve(26, 13, 29, 13); // two loading doors, rolled up
      putR(1, 24, 4, 24, '%'); putR(5, 24, 6, 24, 'D'); putR(7, 24, 9, 24, '%'); carve(12, 24, 32, 24); putR(35, 24, 44, 24, '%');
      // the storehouse: crate stacks in two rows, shelving on the back wall
      for (const x of [3, 9, 15, 21, 27, 33, 39]) putR(x, 3, x + 2, 4, 'C');
      for (const x of [6, 12, 24, 30, 36]) putR(x, 8, x + 2, 9, 'C');
      putR(18, 1, 25, 1, 'R'); put(44, 1, 'X'); put(1, 12, 'X');
      // the kiosk
      putR(2, 16, 6, 16, 'K'); put(9, 14, 'F'); put(2, 20, 'T'); put(8, 21, 'T');
      // the yard: a container pair, pallets, crates, oil drums, a lamp
      putR(20, 17, 25, 18, 'N'); putR(13, 16, 14, 16, 'q'); putR(29, 21, 31, 21, 'q'); putR(12, 22, 13, 23, 'C'); putR(28, 15, 29, 15, 'C'); putR(31, 16, 32, 16, 'e'); put(17, 22, 'l');
      // the smoking room
      putR(36, 21, 38, 21, 'S'); putR(43, 17, 43, 19, 'S'); putR(39, 18, 40, 18, 'T'); put(44, 14, 'V'); put(35, 14, 'p');
    },
    hallCells: [[15, 13], [16, 13], [17, 13], [18, 13], [26, 13], [27, 13], [28, 13], [29, 13]],
    doorSigns: { '40,13': 'PRIVÉ' },
    roomNames: { hall: 'OPSLAG', kiosk: 'DE NATTE KOMIJN', yard: 'LAADPLAATS', smoke: 'ROOKHOK', quay: 'KOMIJNKADE' },
    neon: { hall: 0xffd8a0, kiosk: 0xd8a83a, smoke: 0xc2412d },
    lights: [[5, 19, 0xd8ccb0, 1.4], [39, 18, 0xc2412d, 1.6], [8, 6, 0xffd8a0, 1.3], [22, 6, 0xffd8a0, 1.3], [36, 6, 0xffd8a0, 1.3], [22, 20, 0x6a8aa8, 0.8], [8, 27, 0xd8a83a, 0.9], [30, 27, 0x6a8aa8, 0.6]],
    spawns: [
      [4, 18.5, 'makarov', Math.PI, 'kiosk'], [7, 22, 'bat', -Math.PI / 2, 'kiosk'],
      [8, 6, 'makarov', Math.PI, 'hall'], [19, 6.5, 'bat', Math.PI / 2, 'hall'], [30, 6, 'makarov', -Math.PI / 2, 'hall'], [13, 11, 'shotgun', 0, 'hall'], [25, 11, 'bat', Math.PI, 'hall'], [37, 10.5, 'makarov', Math.PI, 'hall'], [43, 6, 'bat', -Math.PI / 2, 'hall'],
      [16, 19, 'makarov', Math.PI / 2, 'yard'], [27, 18, 'shotgun', Math.PI, 'yard'], [22, 21.5, 'bat', 0, 'yard'],
      [39, 15.5, 'shotgun', 0, 'smoke', true], [42, 21, 'makarov', -Math.PI / 2, 'smoke'], [37, 19, 'makarov', Math.PI / 2, 'smoke'],
    ],
    loot: [[1.5, 1.5], [44, 11.5], [44, 22.5], [12, 15], [8, 15]],
    signs: [['DE NATTE KOMIJN', 5, 4.6, '#d8a83a'], ['KOMIJNKADE · OPSLAG ABDAVISSIES', 22, 10, '#c8d8e0', 14]],
    crane: [47.5, 26.5],
    rain: [[11, 14, 33, 24]], wet: (x, z) => x >= 11 && x <= 33 && z >= 14,
  },
  bossLook: { cap: 0x1a2a3a, shirt: 0x1a2a3a, front: '#1a2a3a', pants: 0x2a2a2a, belly: 1.1, head: { hair: '#5a5a5a', brow: '#3a3a3a', hairLine: 44, iris: '#3a4a5a', goatee: '#5a5a5a' } }, // Kademeester Kees: navy pea coat, grey beard
  text: {
    area: 'DE DUISTERE DOKKEN · KOMIJNKADE',
    banner: ['DE NATTE KOMIJN', 'Komijnkade. The Abdavissies\' first warehouse on the quay.'],
    objective: 'Take <b>De Natte Komijn</b> and the warehouse behind it from the Abdavissies. <b>Two hits each</b>, and they carry guns. <b>Waves break over the quay</b>: keep away from the edge. Kademeester Kees waits in the red room. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Komijnkade is <b>yours</b>. A foothold in the docks. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Komijnkade is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KOMIJNKADE TAKEN',
    resultsHint: 'The first Abdavissies warehouse is yours. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KOMIJNKADE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['KADEMEESTER KEES IS DOWN', 'Washed up.'],
    tips: ['A wave breaks over the quay every few seconds. Get knocked down out there and you\'re a sitting duck.', 'Abdavissies take two hits. Hit them again on the floor.', 'Crate stacks stop bullets in the warehouse.'],
  },
  decorate({ THREE, root, OX, Z0, lam, spill, run }) {
    const spray = new THREE.Mesh(new THREE.PlaneGeometry(52, 3), new THREE.MeshBasicMaterial({ color: 0xd8e8f0, transparent: true, opacity: 0, depthWrite: false })); spray.rotation.x = -Math.PI / 2; spray.position.set(OX + 23, 0.4, Z0 + 29); root.add(spray);
    let next = 6, t = 0, last = 0;
    return { tick(dt) {
      const R = run(); if (R.time < last) next = R.time + 6; last = R.time;
      if (R.results) return;
      if (R.time > next - 1 && R.time < next) spray.material.opacity = (R.time - (next - 1)) * 0.5;
      if (R.time >= next) { next = R.time + 6 + Math.random() * 3; spray.material.opacity = 0.45; for (let x = 4; x < 44; x += 6) spill(new THREE.Vector3(OX + x, 0, Z0 + 30), 2.4, { text: 'GOLF!', color: 0xd8e8f0, quiet: x !== 22 }); }
      spray.material.opacity = Math.max(0, spray.material.opacity - dt * 0.6);
    } };
  },
});
