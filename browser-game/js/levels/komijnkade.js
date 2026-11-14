// Act 3, mission 1: Komijnkade (De Duistere Dokken). Kiosk De Natte Komijn and the Abdavissies' first warehouse on the quay.
// Built on the shared docks layout (js/levels/docks.js) after the concept art (03_Act3_Komijnkade): a stormy quay with a crane, a
// lit kiosk, a warehouse of crate stacks and pallets, and a red smoking room.
// The twist: the storm. Every few seconds a wave breaks over the quay edge and knocks down everyone near the water, Eddy included.

import { dock } from './docks.js';

export default dock({
  id: 'komijnkade', name: 'Komijnkade', kiosk: 'DE NATTE KOMIJN', sign: 'KOMIJNKADE · OPSLAG ABDAVISSIES',
  hallLayout({ put, putR }) {
    for (const [x, z] of [[14, 3], [19, 3], [25, 3], [31, 3], [37, 3], [14, 9], [22, 9], [30, 9], [38, 9], [16, 15], [24, 15], [33, 15], [40, 16], [14, 20], [28, 20]]) putR(x, z, x + 2, z + 1, 'C');
    putR(42, 1, 44, 1, 'R'); put(44, 12, 'X'); put(12, 12, 'X');
  },
  hallSpawns: [
    [18, 6.5, 'makarov', Math.PI, 'hall'], [28, 6.5, 'bat', Math.PI / 2, 'hall'], [35, 7, 'makarov', -Math.PI / 2, 'hall'], [20, 12.5, 'shotgun', 0, 'hall'],
    [36, 13, 'bat', Math.PI, 'hall'], [21, 18, 'makarov', Math.PI / 2, 'hall'], [31, 19, 'bat', -Math.PI / 2, 'hall'], [42, 21, 'makarov', -Math.PI / 2, 'hall'], [13, 7, 'bat', Math.PI / 2, 'hall'],
  ],
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
      if (R.time >= next) { next = R.time + 6 + Math.random() * 3; spray.material.opacity = 0.45; for (let x = 4; x < 44; x += 6) spill(new THREE.Vector3(OX + x, 0, Z0 + 30), 2.4, { text: x === 22 ? 'GOLF!' : '', color: 0xd8e8f0 }); }
      spray.material.opacity = Math.max(0, spray.material.opacity - dt * 0.6);
    } };
  },
});
