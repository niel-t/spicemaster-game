// Act 3, mission 8: Nootmuskade (De Duistere Dokken). Veilinghuis De Notenkraker: the Abdavissies' black-market spice auction.
// Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Nootmuskade): a stormy quay, a kiosk, an
// auction house with a round tiered bidding hall around the podium, side rooms of crates, and a red office.
// The twist: an auction is running. The bidders are civilians: they sit in the tiers until the first shot, then flee to the quay.

import { dock } from './docks.js';

const EXIT = [21.5, 26];
const BENCHES = [[10, 17, 28], [12, 15, 30], [14, 14, 31], [16, 14, 31]]; // [row, x0, x1]: benches in tiers, the aisle at x 22-23

export default dock({
  id: 'nootmuskade', name: 'Nootmuskade', kiosk: 'NOOT & CO', sign: 'VEILINGHUIS DE NOTENKRAKER',
  hall: 'auction', floors: { auction: (g) => { g.fillStyle = '#4a2a1a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(200,120,60,${Math.random() * 0.06})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } }, marble: (g) => { g.fillStyle = '#d8d0c0'; g.fillRect(0, 0, 64, 64); g.strokeStyle = 'rgba(120,100,80,.35)'; g.lineWidth = 1; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(Math.random() * 64, 0); g.bezierCurveTo(Math.random() * 64, 20, Math.random() * 64, 44, Math.random() * 64, 64); g.stroke(); } g.strokeStyle = '#a89a80'; g.lineWidth = 2; g.strokeRect(0, 0, 64, 64); } }, floorRep: { auction: 2, marble: 2 },
  hallLight: 0xe8a33d,
  furn: { Y: { h: 0.5, cover: false, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.45, 0.9, lam({ color: 0x6a3a22 }), cx, 0.22, cz, root); } } }, // the bidding benches: low
  // The building: the auction hall in the middle, the podium at the back and the benches in tiers facing it, a marble lobby with a
  // glass front (where the bidders run when it kicks off), lot stores on both sides, and the auctioneer's red office.
  plan: {
    rooms: [['lots', 1, 1, 10, 23, 'depot'], ['hall', 12, 1, 33, 19, 'auction'], ['lobby', 12, 21, 33, 23, 'marble'], ['lots', 35, 1, 44, 12, 'depot'], ['office', 35, 14, 44, 23, 'red']],
    layout({ carve, put, putR }) {
      putR(11, 6, 11, 7, 'D'); putR(11, 15, 11, 16, 'D'); putR(11, 21, 11, 22, 'D'); putR(16, 20, 17, 20, 'D'); putR(28, 20, 29, 20, 'D');
      putR(34, 5, 34, 6, 'D'); putR(34, 16, 34, 17, 'D'); putR(39, 13, 40, 13, 'D');
      putR(5, 24, 6, 24, 'D'); putR(12, 24, 20, 24, '%'); putR(21, 24, 22, 24, 'D'); putR(23, 24, 33, 24, '%'); putR(37, 24, 42, 24, '%');
      // the auction hall: the podium, benches in tiers with an aisle down the middle
      putR(21, 3, 24, 5, 'O');
      for (const [z, x0, x1] of BENCHES) { putR(x0, z, 21, z, 'Y'); putR(24, z, x1, z, 'Y'); }
      putR(13, 1, 14, 2, 'C'); putR(31, 1, 32, 2, 'C'); putR(16, 1, 19, 1, 'R'); putR(26, 1, 29, 1, 'R');
      // the lot stores
      putR(2, 2, 3, 3, 'C'); putR(7, 3, 8, 4, 'C'); putR(2, 9, 3, 10, 'C'); putR(7, 11, 8, 12, 'C'); putR(1, 14, 1, 20, 'R'); putR(4, 18, 7, 18, 'R'); put(10, 1, 'X');
      putR(36, 2, 37, 3, 'C'); putR(42, 2, 43, 3, 'C'); putR(36, 8, 37, 9, 'C'); putR(42, 9, 43, 10, 'C');
      // the auctioneer's office
      putR(38, 19, 41, 20, 'O'); put(44, 23, 'V'); putR(44, 15, 44, 17, 'S'); put(35, 23, 'p');
      // the lobby: plants
      put(14, 23, 'p'); put(33, 21, 'p');
    },
    hallCells: [],
    doorSigns: { '34,16': 'PRIVÉ', '21,24': 'VEILING' },
    roomNames: { lots: 'KAVELOPSLAG', hall: 'VEILINGZAAL', lobby: 'HAL', office: 'VEILINGMEESTER', quay: 'NOOTMUSKADE' },
    neon: { hall: 0xe8a33d, lobby: 0xf2c14e, office: 0xc2412d, lots: 0xffd8a0 },
    lights: [[22, 22, 0xd8ccb0, 1.3], [22, 8, 0xffc070, 2.2], [16, 5, 0xe8a33d, 1.2], [29, 5, 0xe8a33d, 1.2], [16, 15, 0xffd8a0, 1.1], [29, 15, 0xffd8a0, 1.1], [5, 10, 0xffd8a0, 1.0], [40, 6, 0xffd8a0, 1.0], [40, 18, 0xc2412d, 1.5], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [14, 22, 'makarov', Math.PI / 2, 'lobby'], [31, 22, 'bat', -Math.PI / 2, 'lobby'],
      [20, 6, 'makarov', Math.PI, 'hall'], [25, 6, 'makarov', Math.PI, 'hall'], [22.5, 7, 'shotgun', Math.PI, 'hall'], [15, 8, 'bat', Math.PI / 2, 'hall'], [31, 8, 'bat', -Math.PI / 2, 'hall'], [13, 18, 'makarov', 0, 'hall'], [32, 18, 'makarov', 0, 'hall'],
      [5, 6, 'makarov', Math.PI / 2, 'lots'], [4, 13, 'bat', 0, 'lots'], [8, 20, 'makarov', Math.PI, 'lots'], [39, 5, 'makarov', Math.PI, 'lots'], [40, 10, 'bat', 0, 'lots'],
      [40, 16.5, 'shotgun', Math.PI, 'office', true], [37, 21, 'makarov', Math.PI / 2, 'office'],
    ],
    loot: [[1.5, 1.5], [44, 1.5], [44, 12], [44, 21], [12, 1.5]],
    signs: [['NOOT & CO', 6, 4, '#e8a33d'], ['VEILINGHUIS DE NOTENKRAKER', 22.5, 10, '#f2c14e']],
    crane: [47.5, 26.5],
  },
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
    sign('LOT 47 · NOOTMUSKAAT', 3.6, 0.5, '#1a0e08', '#f2c14e', OX + 22.5, 2.2, Z0 + 1.04, 0, 40);
    const exitV = new THREE.Vector3(OX + EXIT[0], 0, Z0 + EXIT[1]);
    const seats = []; for (const [z, xs] of [[11, [18, 20, 25, 27]], [13, [16, 19, 26, 29]], [15, [15, 18, 27, 30]], [17, [14, 17, 28, 31]]]) for (const x of xs) seats.push([x, z]);
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
