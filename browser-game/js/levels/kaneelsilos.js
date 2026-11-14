// Act 3, mission 2: Kaneelsilo's (De Duistere Dokken). The Abdavissies cinnamon silos. Built on the shared docks layout
// (js/levels/docks.js) after the concept art (03_Act3_Kaneelsilos): a stormy silo yard with a crane, an office block, a round hall of
// tall silo tanks with catwalks, and a red still room where they cut the cinnamon.
// The twist: open the three silo valves (E) and dump the smuggled cinnamon, as well as clearing the floor.

import { dock } from './docks.js';

const SILOS = [[15, 3], [22, 3], [29, 3], [36, 3], [18, 11], [33, 11], [15, 18], [26, 17], [37, 18]]; // 3x3 silo tanks
const VALVES = [[22, 3], [18, 11], [37, 18]]; // the three silos with a valve (task)

export default dock({
  id: 'kaneelsilos', name: "Kaneelsilo's", kiosk: 'KANEEL KIOSK', sign: "KANEELSILO'S · NIET BETREDEN", taskName: 'VALVE',
  hall: 'silo', floors: { silo: (g) => { g.fillStyle = '#4e4a44'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a3630'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } g.fillStyle = 'rgba(160,90,40,.25)'; g.beginPath(); g.arc(32, 32, 14, 0, 7); g.fill(); } }, floorRep: { silo: 2 },
  hallLight: 0xffb070,
  furn: { U: { h: 2.6, cover: true, draw: () => {} } },
  hallLayout({ putR, put }) { for (const [x, z] of SILOS) putR(x, z, x + 2, z + 2, 'U'); put(44, 1, 'X'); putR(42, 22, 44, 23, 'C'); },
  hallSpawns: [
    [19, 7.5, 'makarov', Math.PI, 'hall'], [26, 8, 'bat', Math.PI / 2, 'hall'], [33, 8, 'makarov', -Math.PI / 2, 'hall'], [41, 9, 'shotgun', -Math.PI / 2, 'hall'],
    [24, 13, 'bat', Math.PI, 'hall'], [29, 14.5, 'makarov', 0, 'hall'], [13, 15, 'makarov', Math.PI / 2, 'hall'], [21, 21.5, 'bat', Math.PI, 'hall'], [32, 21.5, 'makarov', Math.PI, 'hall'],
  ],
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
