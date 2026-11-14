// Act 3, mission 5: Peperhaven (De Duistere Dokken). The harbour master's shed and the Abdavissies sorting hall. Built on the shared
// docks layout (js/levels/docks.js) after the concept art (03_Act3_Peperhaven): a stormy quay, a kiosk, a sorting hall of crates and
// pallets behind glass partitions, and a cold-lit office.
// The twist: the power is off. Restore the fuse box (E) in the hall and the lights come up for everyone; leave it off and fight in
// the dark. Either way the floor clears when the Abdavissies are down.

import { dock } from './docks.js';

export default dock({
  id: 'peperhaven', name: 'Peperhaven', kiosk: 'PEPER & ZOUT', sign: 'HAVENMEESTER PEPERHAVEN',
  hallLight: 0x8aa8c8,
  lights: [[5, 19, 0xd8ccb0, 0.6], [5, 6, 0x8aa8c8, 0.8], [20, 6, 0xd8e8f0, 1.5], [33, 6, 0xd8e8f0, 1.5], [20, 17, 0xd8e8f0, 1.5], [33, 17, 0xd8e8f0, 1.5], [8, 27, 0xd8a83a, 0.6]],
  mood: { hemi: 0.4, sun: 0.35 },
  red: 'cold', floors: { cold: (g) => { g.fillStyle = '#2a3440'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a4a5a'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); } } },
  neon: { redroom: 0x8aa8c8 },
  hallLayout({ putR, put }) {
    putR(24, 1, 24, 8, '%'); putR(24, 14, 24, 23, '%'); putR(34, 1, 34, 8, '%'); putR(34, 14, 34, 23, '%'); // glass partitions split the sorting hall in three
    for (const [x, z] of [[15, 3], [19, 6], [27, 3], [30, 6], [38, 3], [41, 7], [15, 16], [19, 20], [28, 17], [38, 16], [41, 20]]) putR(x, z, x + 1, z + 1, 'C');
    putR(27, 11, 31, 12, 'w'); put(44, 12, 'X'); put(12, 22, 'X');
  },
  hallSpawns: [
    [17, 9, 'makarov', Math.PI, 'hall'], [21, 3, 'bat', Math.PI / 2, 'hall'], [29, 9, 'makarov', Math.PI, 'hall'], [36, 10, 'shotgun', -Math.PI / 2, 'hall'],
    [40, 4, 'makarov', -Math.PI / 2, 'hall'], [17, 18, 'bat', Math.PI / 2, 'hall'], [30, 20, 'makarov', Math.PI, 'hall'], [40, 18, 'bat', -Math.PI / 2, 'hall'], [22, 13, 'makarov', 0, 'hall'],
  ],
  bossLook: { cap: 0x1a2a3a, shirt: 0x1a2a3a, front: '#1a2a3a', pants: 0x1a2030, belly: 1.0, head: { hair: '#8a8a8a', brow: '#5a5a5a', hairLine: 38, glasses: true, iris: '#3a4a5a' } }, // Havenmeester Peper
  text: {
    area: 'DE DUISTERE DOKKEN · PEPERHAVEN',
    banner: ['PEPERHAVEN', 'The harbour master turned the lights off.'],
    objective: 'Take <b>Peperhaven</b>. The power is off: <b>throw the fuse box</b> (E) in the sorting hall to bring the lights back, or fight in the dark. Havenmeester Peper waits in his cold office. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Peperhaven is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Peperhaven is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'PEPERHAVEN TAKEN',
    resultsHint: 'The harbour master is out. Grab the spice crates (E), then drive home.',
    ownedBanner: ['PEPERHAVEN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['HAVENMEESTER PEPER IS DOWN', 'Lights out.'],
    tips: ['The fuse box is on the north wall of the sorting hall. Lights help you, and them.', 'Glass partitions split the hall: you see through, bullets go through.', 'The packing table in the middle stops bullets.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, WALL_H }) {
    // the blackout: a dark veil over the sorting hall until the fuse box is thrown (an optional task: it doesn't block the clear)
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(34, 24), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false })); veil.rotation.x = -Math.PI / 2; veil.position.set(OX + 28.5, WALL_H - 0.05, Z0 + 12); root.add(veil);
    const fb = box(0.6, 0.8, 0.2, lam({ color: 0x5a5e62 }), OX + 29, 1.4, Z0 + 1.15, root, false);
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xc2412d })); lamp.position.set(OX + 29, 1.6, Z0 + 1.27); root.add(lamp);
    let on = false, k = 0;
    const tasks = [{ pos: new THREE.Vector3(OX + 29, 0, Z0 + 2.2), obj: fb, label: 'Throw the fuse box', score: 300, doneText: 'LICHT AAN!', optional: true,
      act() { on = true; lamp.material.color.set(0x6ad86a); }, reset(done) { on = !!done; k = on ? 1 : 0; lamp.material.color.set(done ? 0x6ad86a : 0xc2412d); } }];
    return { tasks, tick(dt) { k += ((on ? 1 : 0) - k) * Math.min(1, dt * 2); veil.material.opacity = 0.6 * (1 - k); } };
  },
});
