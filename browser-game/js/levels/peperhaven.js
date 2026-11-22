// Act 3, mission 5: Peperhaven (De Duistere Dokken). The harbour master's shed and the Abdavissies sorting hall. Built on the docks
// outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Peperhaven): a stormy quay, a kiosk, a sorting hall of crates and
// pallets behind glass partitions, and a cold-lit office.
// The twist: the power is off. Restore the fuse box (E) in the hall and the lights come up for everyone; leave it off and fight in
// the dark. Either way the floor clears when the Abdavissies are down.

import { dock } from './docks.js';

export default dock({
  id: 'peperhaven', name: 'Peperhaven', kiosk: 'PEPER & ZOUT', sign: 'HAVENMEESTER PEPERHAVEN',
  mood: { hemi: 0.4, sun: 0.35 },
  floors: { cold: (g) => { g.fillStyle = '#2a3440'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a4a5a'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); } } },
  // The building: an L. The sorting hall takes the left two thirds, split into three bays by glass partitions with a sorting aisle
  // across the middle. On the right the harbour master's office sits over an open wharf, and the kiosk tucks into the corner.
  plan: {
    rooms: [['hall', 1, 1, 30, 23, 'depot'], ['office', 32, 1, 44, 10, 'cold'], ['wharf', 32, 12, 44, 15, 'quay'], ['wharf', 32, 16, 36, 23, 'quay'], ['kiosk', 38, 17, 44, 23, 'kiosk']],
    layout({ carve, put, putR }) {
      putR(31, 4, 31, 5, 'D'); putR(31, 18, 31, 19, 'D'); putR(34, 11, 35, 11, 'D'); putR(40, 16, 41, 16, 'D');
      putR(5, 24, 6, 24, 'D'); carve(14, 24, 17, 24); carve(32, 24, 36, 24); putR(38, 24, 39, 24, '%'); putR(40, 24, 41, 24, 'D'); putR(42, 24, 44, 24, '%');
      // glass partitions split the sorting hall in three bays, open along the sorting aisle
      for (const x of [10, 20]) { putR(x, 1, x, 9, '%'); putR(x, 14, x, 23, '%'); }
      for (const [x, z] of [[3, 3], [6, 6], [13, 3], [16, 6], [24, 3], [27, 6], [3, 17], [6, 20], [13, 17], [16, 20], [24, 17], [27, 20]]) putR(x, z, x + 1, z + 1, 'C');
      putR(3, 11, 7, 12, 'w'); putR(13, 11, 17, 12, 'w'); putR(23, 11, 27, 11, 'w'); put(1, 13, 'X'); put(30, 23, 'X');
      // the harbour master's office
      putR(34, 3, 36, 4, 'O'); putR(44, 1, 44, 4, 'R'); put(40, 2, 'T'); put(44, 9, 'p'); putR(32, 1, 33, 1, 'F');
      // the wharf, out in the rain
      putR(32, 15, 33, 15, 'q'); put(43, 13, 'X'); putR(33, 20, 34, 21, 'C'); put(36, 16, 'l'); put(39, 13, 'e');
      // the kiosk
      putR(38, 19, 38, 21, 'K'); put(44, 17, 'F'); put(43, 21, 'T');
    },
    hallCells: [[14, 24], [15, 24], [16, 24], [17, 24], [32, 24], [33, 24], [34, 24], [35, 24], [36, 24]],
    doorSigns: { '34,11': 'HAVENMEESTER' },
    roomNames: { hall: 'SORTEERHAL', office: 'HAVENMEESTER', wharf: 'STEIGER', kiosk: 'PEPER & ZOUT', quay: 'PEPERHAVEN' },
    neon: { hall: 0x8aa8c8, office: 0x8aa8c8, kiosk: 0xd8a83a },
    lights: [[41, 20, 0xd8ccb0, 0.6], [38, 6, 0x8aa8c8, 0.9], [5, 5, 0xd8e8f0, 1.4], [15, 5, 0xd8e8f0, 1.4], [25, 5, 0xd8e8f0, 1.4], [5, 18, 0xd8e8f0, 1.4], [15, 18, 0xd8e8f0, 1.4], [25, 18, 0xd8e8f0, 1.4], [8, 27, 0xd8a83a, 0.6]],
    spawns: [
      [40, 20, 'makarov', Math.PI, 'kiosk'], [43, 19, 'bat', -Math.PI / 2, 'kiosk'],
      [38, 6, 'shotgun', Math.PI, 'office', true], [42, 8, 'makarov', -Math.PI / 2, 'office'], [33, 7, 'makarov', Math.PI / 2, 'office'],
      [5, 9, 'makarov', Math.PI, 'hall'], [15, 3, 'bat', Math.PI / 2, 'hall'], [26, 9, 'makarov', Math.PI, 'hall'], [29, 14, 'shotgun', -Math.PI / 2, 'hall'], [8, 4, 'makarov', -Math.PI / 2, 'hall'],
      [5, 18, 'bat', Math.PI / 2, 'hall'], [16, 22, 'makarov', Math.PI, 'hall'], [26, 18, 'bat', -Math.PI / 2, 'hall'], [18, 12.5, 'makarov', 0, 'hall'],
      [35, 14, 'makarov', Math.PI, 'wharf'], [34, 18, 'bat', Math.PI / 2, 'wharf'],
    ],
    loot: [[1.5, 1.5], [30, 8], [42, 9.5], [36, 22.5], [1.5, 22.5]],
    signs: [['PEPER & ZOUT', 41, 4, '#d8a83a'], ['HAVENMEESTER PEPERHAVEN', 15.5, 9, '#c8d8e0']],
    crane: [-3, 27],
    rain: [[32, 12, 44, 15], [32, 16, 36, 23]], wet: (x, z) => x >= 32 && z >= 12 && (z <= 15 || x <= 36),
  },
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
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(30, 23), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.6, depthWrite: false })); veil.rotation.x = -Math.PI / 2; veil.position.set(OX + 16, WALL_H - 0.05, Z0 + 12.5); root.add(veil);
    const fb = box(0.6, 0.8, 0.2, lam({ color: 0x5a5e62 }), OX + 29, 1.4, Z0 + 1.15, root, false);
    const lamp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ color: 0xc2412d })); lamp.position.set(OX + 29, 1.6, Z0 + 1.27); root.add(lamp);
    let on = false, k = 0;
    const tasks = [{ pos: new THREE.Vector3(OX + 29, 0, Z0 + 2.2), obj: fb, label: 'Throw the fuse box', score: 300, doneText: 'LICHT AAN!', optional: true,
      act() { on = true; lamp.material.color.set(0x6ad86a); }, reset(done) { on = !!done; k = on ? 1 : 0; lamp.material.color.set(done ? 0x6ad86a : 0xc2412d); } }];
    return { tasks, tick(dt) { k += ((on ? 1 : 0) - k) * Math.min(1, dt * 2); veil.material.opacity = 0.6 * (1 - k); } };
  },
});
