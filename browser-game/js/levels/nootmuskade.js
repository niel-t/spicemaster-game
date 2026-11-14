// Act 3, mission 8: Nootmuskade (De Duistere Dokken). Veilinghuis De Notenkraker: the Abdavissies' black-market spice auction.
// Built on the shared docks layout (js/levels/docks.js) after the concept art (03_Act3_Nootmuskade): a stormy quay, a kiosk, an
// auction house with a round tiered bidding hall around the podium, side rooms of crates, and a red office.
// The twist: an auction is running. The bidders are civilians: they sit in the tiers until the first shot, then flee to the quay.

import { dock } from './docks.js';

const EXIT = [21.5, 26];

export default dock({
  id: 'nootmuskade', name: 'Nootmuskade', kiosk: 'NOOT & CO', sign: 'VEILINGHUIS DE NOTENKRAKER',
  hall: 'auction', floors: { auction: (g) => { g.fillStyle = '#4a2a1a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(200,120,60,${Math.random() * 0.06})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } } }, floorRep: { auction: 2 },
  hallLight: 0xe8a33d,
  lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xc2412d, 1.5], [28, 9, 0xffc070, 2.2], [20, 5, 0xe8a33d, 1.2], [36, 5, 0xe8a33d, 1.2], [16, 18, 0xffd8a0, 1.2], [40, 18, 0xffd8a0, 1.2], [8, 27, 0xd8a83a, 0.9]],
  furn: { Y: { h: 0.5, cover: false, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.45, 0.9, lam({ color: 0x6a3a22 }), cx, 0.22, cz, root); } } }, // the bidding benches: low
  hallLayout({ putR, put }) {
    putR(26, 7, 30, 9, 'O'); // the podium
    for (const [z, x0, x1] of [[12, 21, 35], [14, 19, 37], [16, 17, 39]]) { putR(x0, z, 26, z, 'Y'); putR(30, z, x1, z, 'Y'); } // benches in tiers, an aisle in the middle
    putR(14, 2, 15, 3, 'C'); putR(14, 6, 15, 7, 'C'); putR(41, 2, 42, 3, 'C'); putR(41, 6, 42, 7, 'C'); putR(20, 2, 23, 2, 'R'); putR(33, 2, 36, 2, 'R');
    putR(14, 20, 16, 21, 'C'); putR(40, 20, 42, 21, 'C'); put(44, 23, 'X');
  },
  hallSpawns: [
    [24, 6, 'makarov', Math.PI, 'hall'], [32, 6, 'makarov', Math.PI, 'hall'], [28, 5, 'shotgun', Math.PI, 'hall'], [18, 9, 'bat', Math.PI / 2, 'hall'], [38, 9, 'bat', -Math.PI / 2, 'hall'],
    [16, 19, 'makarov', 0, 'hall'], [40, 18.5, 'makarov', 0, 'hall'], [28, 21, 'bat', Math.PI, 'hall'],
  ],
  bossLook: { cap: 0x1a1a1a, shirt: 0x2a2a3a, front: '#2a2a3a', pants: 0x1a1a24, belly: 1.0, head: { hair: '#c8c8c0', brow: '#8a8a80', hairLine: 36, glasses: true, iris: '#3a3a3a' } }, // the Veilingmeester
  text: {
    area: 'DE DUISTERE DOKKEN · NOOTMUSKADE',
    banner: ['DE NOTENKRAKER', 'Nootmuskade. Tonight\'s lot: smuggled nutmeg.'],
    objective: 'Take <b>Veilinghuis De Notenkraker</b>. An auction is running: <b>the bidders aren\'t Abdavissies</b> and they\'ll run for the quay when it kicks off. The Veilingmeester runs it from the red office. <span style="color:#ffd36b">Leave no Abdavissie standing.</span>',
    objectiveOwned: 'Nootmuskade is <b>yours</b>. Sold. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Nootmuskade is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'NOOTMUSKADE TAKEN',
    resultsHint: 'Going, going, gone. Grab the spice crates (E), then drive home.',
    ownedBanner: ['NOOTMUSKADE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE VEILINGMEESTER IS DOWN', 'Sold to the man in the blue shirt.'],
    tips: ['The bidders flee at the first shot. Let them out before you go loud.', 'The podium stops bullets. The benches don\'t.', 'Side rooms at either end of the hall hold the stock.'],
  },
  decorate({ THREE, root, OX, Z0, makePerson, animate, path, run, sign }) {
    sign('LOT 47 · NOOTMUSKAAT', 3.6, 0.5, '#1a0e08', '#f2c14e', OX + 28, 2.2, Z0 + 6.6, 0, 40);
    const exitV = new THREE.Vector3(OX + EXIT[0], 0, Z0 + EXIT[1]);
    const seats = []; for (const [z, xs] of [[13, [20, 23, 33, 36]], [15, [18, 22, 25, 31, 35, 38]], [17, [19, 24, 32, 37]]]) for (const x of xs) seats.push([x, z]);
    const bidders = seats.map(([x, z], i) => { const p = makePerson({ shirt: [0x2a2a3a, 0x5a3a24, 0x3a4a5a, 0xd8ccb0][i % 4], front: ['#2a2a3a', '#5a3a24', '#3a4a5a', '#d8ccb0'][i % 4], pants: 0x1a1a1a, belly: (i % 3) * 0.4, skin: [0xe4ab88, 0xc88a64, 0x9a6a4a, 0xf0c4a2][i % 4] }); p.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); p.rotation.y = Math.PI; root.add(p); return { p, home: [x, z], route: null, gone: false }; });
    let panic = false, last = 0;
    return { tick(dt) {
      const R = run();
      if (R.time < last) { panic = false; for (const b of bidders) { b.gone = false; b.route = null; b.p.visible = true; b.p.position.set(OX + b.home[0] + 0.5, 0, Z0 + b.home[1] + 0.5); } }
      last = R.time; if (!panic && (R.shots > 0 || R.kills > 0)) panic = true;
      for (const b of bidders) {
        if (b.gone) continue; if (!panic) { animate(b.p, 0, dt); continue; }
        if (!b.route) b.route = path(b.p.position, exitV) || [exitV.clone()];
        const nx = b.route[0]; if (!nx) { b.gone = true; b.p.visible = false; continue; }
        const dx = nx.x - b.p.position.x, dz = nx.z - b.p.position.z, d = Math.hypot(dx, dz), sp = 4.4;
        if (d < 0.25) { b.route.shift(); if (!b.route.length) { b.gone = true; b.p.visible = false; } continue; }
        b.p.position.x += dx / d * sp * dt; b.p.position.z += dz / d * sp * dt; b.p.rotation.y = Math.atan2(dx, dz); animate(b.p, sp, dt);
      }
    } };
  },
});
