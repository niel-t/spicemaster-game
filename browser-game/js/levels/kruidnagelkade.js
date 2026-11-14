// Act 3, mission 4: Kruidnagelkade (De Duistere Dokken). Casino De Gouden Kruidnagel: a neon kiosk on the quay, a packing hall and
// an Abdavissies casino lounge. Built on the shared docks layout (js/levels/docks.js) after the concept art (03_Act3_Kruidnagelkade):
// a stormy quay with a neon kiosk sign, a packing hall of crates and tables, and a red casino lounge with card tables and a bar.
// The twist: the casino guards are better armed (more shotguns), and the red room is a casino with card tables and slot machines.

import { dock } from './docks.js';

export default dock({
  id: 'kruidnagelkade', name: 'Kruidnagelkade', kiosk: 'KRUIDNAGEL', sign: 'DE GOUDEN KRUIDNAGEL · CASINO',
  redLayout({ putR, put }) { putR(3, 3, 4, 4, 'c'); putR(7, 3, 8, 4, 'c'); putR(3, 8, 4, 9, 'c'); putR(1, 11, 4, 11, 'M'); putR(8, 7, 10, 7, 'B'); put(10, 1, 'V'); },
  furn: { M: { color: 0x7a1a1a }, B: { color: 0x3a2010 } },
  hallLayout({ putR, put }) {
    for (const [x, z] of [[15, 3], [24, 3], [33, 3], [40, 3], [15, 10], [33, 10], [20, 16], [29, 16], [38, 17]]) putR(x, z, x + 2, z + 1, 'C');
    putR(22, 9, 29, 10, 'w'); putR(14, 21, 17, 21, 'w'); put(44, 23, 'X'); put(44, 1, 'X');
  },
  hallSpawns: [
    [19, 6, 'shotgun', Math.PI, 'hall'], [28, 6, 'makarov', Math.PI / 2, 'hall'], [37, 6.5, 'shotgun', -Math.PI / 2, 'hall'], [19, 13, 'makarov', Math.PI / 2, 'hall'],
    [32, 13.5, 'shotgun', 0, 'hall'], [25, 19, 'makarov', Math.PI, 'hall'], [35, 21, 'bat', Math.PI, 'hall'], [42, 13, 'makarov', -Math.PI / 2, 'hall'],
  ],
  redSpawns: [[6, 6, 'shotgun', 0, 'redroom', true], [9, 10.5, 'shotgun', -Math.PI / 2, 'redroom'], [2, 6, 'makarov', Math.PI / 2, 'redroom']],
  decorate({ root, OX, Z0, cyl, lam }) { for (const [x, z] of [[3, 3], [7, 3], [3, 8]]) { cyl(0.95, 0.95, 0.06, lam({ color: 0x1f5a2a }), OX + x + 1, 0.78, Z0 + z + 1, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + x + 1, 0.37, Z0 + z + 1, root); } },
  bossLook: { cap: 0x1a1a1a, shirt: 0x1a1a1a, front: '#1a1a1a', pants: 0x1a1a1a, belly: 0.4, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 40, glasses: true, iris: '#2a2a2a' } }, // Croupier Clou: black waistcoat
  text: {
    area: 'DE DUISTERE DOKKEN · KRUIDNAGELKADE',
    banner: ['DE GOUDEN KRUIDNAGEL', 'Kruidnagelkade. The house always wins. Not tonight.'],
    objective: 'Take <b>De Gouden Kruidnagel</b>: the packing hall and the casino behind the kiosk. The guards here carry <b>shotguns</b>: keep cover between you. Croupier Clou deals in the red room. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Kruidnagelkade is <b>yours</b>. The casino is closed. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Kruidnagelkade is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KRUIDNAGELKADE TAKEN',
    resultsHint: 'The chips are down. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KRUIDNAGELKADE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['CROUPIER CLOU IS DOWN', 'Rien ne va plus.'],
    tips: ['Shotguns hit hard up close. Fight these guards at range or through swing doors.', 'Card tables don\'t stop bullets. Slot machines do.', 'The packing tables in the middle of the hall stop bullets.'],
  },
});
