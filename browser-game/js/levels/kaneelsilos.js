// Act 3, mission 2: Kaneelsilo's (De Duistere Dokken). The Abdavissies cinnamon silos. Built on the docks outside
// (js/levels/docks.js) with its own building, after the concept art (03_Act3_Kaneelsilos): a stormy silo yard with a crane, an office block, a round hall of
// tall silo tanks with catwalks, and a red still room where they cut the cinnamon.
// The twist: open the three silo valves (E) and dump the smuggled cinnamon, as well as clearing the floor.

import { dock } from './docks.js';

const SILOS = [[3, 2], [11, 2], [19, 2], [29, 2], [38, 2], [7, 9], [24, 9], [33, 9], [40, 9], [29, 18], [37, 18]]; // 3x3 silo tanks (the last two out in the yard)
const VALVES = [[11, 2], [7, 9], [33, 9]]; // the three silos with a valve (task)

export default dock({
  id: 'kaneelsilos', name: "Kaneelsilo's", kiosk: 'KANEEL KIOSK', sign: "KANEELSILO'S · NIET BETREDEN", taskName: 'VALVE',
  hall: 'silo', floors: { silo: (g) => { g.fillStyle = '#4e4a44'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a3630'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } g.fillStyle = 'rgba(160,90,40,.25)'; g.beginPath(); g.arc(32, 32, 14, 0, 7); g.fill(); } }, floorRep: { silo: 2 },
  furn: { U: { h: 2.6, cover: true, draw: () => {} } },
  // The building: the silo hall runs the whole width at the back; in front of it the red still room, the canteen kiosk, and an open
  // silo yard behind a wire fence with two more tanks standing in the rain.
  plan: {
    rooms: [['hall', 1, 1, 44, 14, 'silo'], ['still', 1, 16, 13, 23, 'red'], ['canteen', 15, 16, 24, 23, 'kiosk'], ['yard', 26, 16, 44, 23, 'quay']],
    layout({ carve, put, putR }) {
      putR(6, 15, 7, 15, 'D'); putR(19, 15, 20, 15, 'D'); carve(31, 15, 38, 15); putR(14, 19, 14, 20, 'D'); putR(25, 18, 25, 19, 'D');
      putR(3, 24, 5, 24, '%'); putR(9, 24, 11, 24, '%'); putR(15, 24, 15, 24, '%'); putR(16, 24, 17, 24, 'D'); putR(18, 24, 24, 24, '%');
      putR(26, 24, 29, 24, 'f'); carve(30, 24, 40, 24); putR(41, 24, 44, 24, 'f');
      for (const [x, z] of SILOS) putR(x, z, x + 2, z + 2, 'U');
      put(44, 1, 'X'); putR(43, 13, 44, 14, 'C'); putR(1, 1, 1, 4, 'R');
      // the still room: cutting benches, shelving, sacks
      putR(2, 18, 5, 18, 'w'); putR(8, 18, 11, 18, 'w'); putR(1, 20, 1, 23, 'R'); putR(11, 22, 12, 23, 'C'); put(6, 22, 'T');
      // the canteen
      putR(19, 22, 23, 22, 'K'); put(24, 16, 'F'); put(17, 18, 'T'); put(21, 19, 'T');
      // the yard
      putR(42, 21, 43, 22, 'C'); putR(27, 22, 28, 22, 'e'); putR(34, 22, 36, 22, 'q');
    },
    hallCells: [[31, 15], [32, 15], [33, 15], [34, 15], [35, 15], [36, 15], [37, 15], [38, 15], [30, 24], [31, 24], [32, 24], [33, 24], [34, 24], [35, 24], [36, 24], [37, 24], [38, 24], [39, 24], [40, 24]],
    roomNames: { hall: "SILOHAL", still: 'SNIJKAMER', canteen: 'KANEEL KIOSK', yard: 'SILOWERF', quay: 'KADE' },
    neon: { hall: 0xffb070, canteen: 0xe8a33d, still: 0xc2412d },
    lights: [[19, 20, 0xd8ccb0, 1.3], [7, 20, 0xc2412d, 1.6], [8, 7, 0xffb070, 1.4], [22, 7, 0xffb070, 1.4], [36, 7, 0xffb070, 1.4], [16, 13, 0xffb070, 1.0], [35, 20, 0x6a8aa8, 0.8], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [18, 20, 'makarov', Math.PI / 2, 'canteen'], [22, 18, 'bat', -Math.PI / 2, 'canteen'],
      [6, 20, 'shotgun', Math.PI, 'still', true], [10, 21, 'makarov', -Math.PI / 2, 'still'], [3, 17, 'makarov', Math.PI / 2, 'still'],
      [16, 7, 'makarov', Math.PI, 'hall'], [27, 6.5, 'bat', Math.PI / 2, 'hall'], [36, 6.5, 'makarov', -Math.PI / 2, 'hall'], [43, 8, 'shotgun', -Math.PI / 2, 'hall'],
      [20, 12.5, 'bat', Math.PI, 'hall'], [29, 13, 'makarov', 0, 'hall'], [3, 8, 'makarov', Math.PI / 2, 'hall'], [14, 12, 'bat', 0, 'hall'],
      [33, 19, 'makarov', Math.PI, 'yard'], [41, 18, 'bat', -Math.PI / 2, 'yard'],
    ],
    loot: [[1.5, 6], [44, 5], [1.5, 14], [13, 22.5], [44, 22.5]],
    signs: [['KANEEL KIOSK', 20, 4.4, '#e8a33d'], ["KANEELSILO'S · NIET BETREDEN", 7, 9, '#c8d8e0']],
    crane: [-3, 27],
    rain: [[26, 16, 44, 24]], wet: (x, z) => x >= 26 && z >= 16,
  },
  bossLook: { cap: 0xd8a83a, shirt: 0xd8a83a, front: '#d8a83a', pants: 0x1a2030, belly: 1.3, head: { hair: '#3a2a1a', brow: '#2a1a12', hairLine: 46, iris: '#3a2a1a' } }, // the Silobaas: oilskin coat
  text: {
    area: "DE DUISTERE DOKKEN · KANEELSILO'S",
    banner: ["KANEELSILO'S", 'Smuggled cinnamon, by the silo.'],
    objective: "Take the <b>Kaneelsilo's</b> and <b>open the three silo valves</b> (E) to dump the smuggled cinnamon. The Silobaas runs it from the red still room. <span style=\"color:#ffd36b\">Leave nobody standing.</span>",
    objectiveOwned: "Kaneelsilo's is <b>yours</b>. The yard smells of cinnamon for weeks. Drive home in the <b>Oofmobiel</b>.",
    objectiveCleared: "<b style=\"color:#6ed36e\">Kaneelsilo's is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.",
    resultsTitle: "KANEELSILO'S TAKEN",
    resultsHint: 'The silos are empty and the floor is brown. Grab the spice crates (E), then drive home.',
    ownedBanner: ["KANEELSILO'S IS YOURS", 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE SILOBAAS IS DOWN', 'Emptied.'],
    taskHint: 'Open every silo valve (E).', tasksDone: 'ALL VALVES OPEN',
    tips: ['Three silos have a red valve wheel. Walk up and press E.', 'The silos are thick: perfect cover.', 'The still room has two ways in: from the kiosk and from the hall.'],
  },
  decorate({ THREE, root, OX, Z0, cyl, box, lam }) {
    for (const [x, z] of SILOS) { cyl(1.45, 1.45, 4.2, lam({ color: 0x8a8e92 }), OX + x + 1.5, 2.1, Z0 + z + 1.5, root, 20); const top = new THREE.Mesh(new THREE.ConeGeometry(1.5, 0.8, 20), lam({ color: 0x6a6e72 })); top.position.set(OX + x + 1.5, 4.6, Z0 + z + 1.5); root.add(top); box(1.4, 0.3, 0.06, lam({ color: 0xa8542a }), OX + x + 1.5, 1.6, Z0 + z + 3.02, root, false); }
    const tasks = VALVES.map(([x, z]) => {
      const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.06, 6, 14), lam({ color: 0xc2412d })); wheel.position.set(OX + x + 1.5, 1.1, Z0 + z + 3.1); root.add(wheel);
      const pile = new THREE.Mesh(new THREE.CircleGeometry(1.6, 18), lam({ color: 0x8a4a22 })); pile.rotation.x = -Math.PI / 2; pile.position.set(OX + x + 1.5, 0.03, Z0 + z + 4); pile.visible = false; root.add(pile);
      return { pos: new THREE.Vector3(OX + x + 1.5, 0, Z0 + z + 3.8), obj: wheel, label: 'Open the silo valve', doneText: 'KANEEL!', spin: 0,
        act() { this.spin = 1.2; pile.visible = true; }, reset(done) { pile.visible = !!done; } };
    });
    return { tasks, tick(dt) { for (const t of tasks) if (t.spin > 0) { t.spin -= dt; t.obj.rotation.z += dt * 8; } } };
  },
});
