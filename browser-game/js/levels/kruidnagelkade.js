// Act 3, mission 4: Kruidnagelkade (De Duistere Dokken). Casino De Gouden Kruidnagel: a neon kiosk on the quay, a packing hall and
// an Abdavissies casino lounge. Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Kruidnagelkade):
// a stormy quay with a neon kiosk sign, a packing hall of crates and tables, and a red casino lounge with card tables and a bar.
// The twist: the casino guards are better armed (more shotguns), and the red room is a casino with card tables and slot machines.

import { dock } from './docks.js';

const CARD = [[16, 3], [21, 3], [16, 8], [21, 8]]; // the card tables (2x2)

export default dock({
  id: 'kruidnagelkade', name: 'Kruidnagelkade', kiosk: 'KRUIDNAGEL', sign: 'DE GOUDEN KRUIDNAGEL · CASINO',
  furn: { M: { color: 0x7a1a1a }, B: { color: 0x3a2010 } },
  floors: { cold: (g) => { g.fillStyle = '#2a3440'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a4a5a'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.stroke(); } } },
  // The building: the casino is the heart, top middle, with the neon kiosk in front of it as the way in for the punters. The tall
  // packing hall runs down the left side; the cashier's office sits top right over the loading floor.
  plan: {
    rooms: [['hall', 1, 1, 12, 23, 'depot'], ['casino', 14, 1, 31, 12, 'red'], ['office', 33, 1, 44, 9, 'cold'], ['loading', 33, 11, 44, 13, 'depot'], ['loading', 26, 14, 44, 23, 'depot'], ['kiosk', 14, 14, 24, 23, 'kiosk']],
    layout({ carve, put, putR }) {
      putR(13, 5, 13, 6, 'D'); putR(13, 18, 13, 19, 'D'); putR(18, 13, 19, 13, 'D'); putR(32, 11, 32, 12, 'D'); putR(38, 10, 39, 10, 'D'); putR(25, 18, 25, 19, 'D');
      putR(5, 24, 6, 24, 'D'); putR(14, 24, 17, 24, '%'); putR(18, 24, 19, 24, 'D'); putR(20, 24, 24, 24, '%'); carve(34, 24, 38, 24);
      // the casino: card tables, a wall of slot machines, the bar
      for (const [x, z] of CARD) putR(x, z, x + 1, z + 1, 'c');
      putR(26, 1, 31, 1, 'M'); putR(31, 4, 31, 8, 'M'); putR(25, 6, 28, 6, 'B'); put(14, 12, 'p');
      // the cashier's office
      putR(36, 3, 39, 4, 'O'); put(44, 1, 'V'); putR(33, 1, 33, 4, 'R'); putR(42, 6, 42, 8, 'S');
      // the packing hall
      putR(2, 2, 3, 3, 'C'); putR(8, 2, 9, 3, 'C'); putR(2, 9, 3, 10, 'C'); putR(8, 10, 9, 11, 'C'); putR(4, 15, 5, 16, 'C'); putR(8, 20, 9, 21, 'C');
      putR(5, 6, 8, 6, 'w'); put(1, 23, 'X'); put(12, 1, 'X');
      // the kiosk
      putR(20, 17, 23, 17, 'K'); put(24, 14, 'F'); put(16, 21, 'T'); put(22, 21, 'T');
      // the loading floor
      putR(28, 16, 29, 17, 'C'); putR(40, 15, 42, 16, 'C'); putR(30, 21, 32, 21, 'q'); putR(42, 20, 43, 21, 'C'); put(44, 23, 'X'); put(35, 16, 'e');
    },
    hallCells: [[34, 24], [35, 24], [36, 24], [37, 24], [38, 24]],
    doorSigns: { '18,13': 'CASINO', '38,10': 'KAS' },
    roomNames: { hall: 'INPAKHAL', casino: 'CASINO', office: 'KASKANTOOR', loading: 'LAADVLOER', kiosk: 'KRUIDNAGEL KIOSK', quay: 'KADE' },
    neon: { casino: 0xc2412d, kiosk: 0xff3f6a, hall: 0xffd8a0, office: 0x8aa8c8, loading: 0xffd8a0 },
    lights: [[19, 19, 0xd8ccb0, 1.4], [22, 6, 0xc2412d, 1.8], [28, 3, 0xff3f6a, 1.0], [39, 5, 0x8aa8c8, 1.2], [6, 6, 0xffd8a0, 1.3], [6, 17, 0xffd8a0, 1.3], [35, 18, 0xffd8a0, 1.3], [8, 27, 0xd8a83a, 0.9], [19, 27, 0xff3f6a, 0.8]],
    spawns: [
      [16, 19, 'makarov', Math.PI, 'kiosk'], [22, 22, 'bat', -Math.PI / 2, 'kiosk'],
      [24, 3, 'shotgun', 0, 'casino', true], [19, 6, 'shotgun', -Math.PI / 2, 'casino'], [28, 10, 'makarov', Math.PI, 'casino'], [15, 11, 'bat', Math.PI / 2, 'casino'],
      [41, 5, 'shotgun', Math.PI, 'office'], [35, 7, 'makarov', Math.PI / 2, 'office'],
      [6, 4.5, 'shotgun', Math.PI, 'hall'], [4, 11.5, 'makarov', Math.PI / 2, 'hall'], [10, 15, 'shotgun', 0, 'hall'], [6, 20, 'makarov', Math.PI, 'hall'], [11, 8, 'bat', -Math.PI / 2, 'hall'],
      [36, 19, 'makarov', Math.PI, 'loading'], [30, 15, 'shotgun', Math.PI / 2, 'loading'], [43, 12, 'bat', -Math.PI / 2, 'loading'],
    ],
    loot: [[1.5, 1.5], [12, 23], [44, 9], [31, 12], [44, 22.5]],
    signs: [['KRUIDNAGEL', 19, 4.4, '#ff3f6a'], ['DE GOUDEN KRUIDNAGEL · CASINO', 36, 9.5, '#e8a33d']],
    crane: [-3, 27],
  },
  decorate({ root, OX, Z0, cyl, lam }) { for (const [x, z] of CARD) { cyl(0.95, 0.95, 0.06, lam({ color: 0x1f5a2a }), OX + x + 1, 0.78, Z0 + z + 1, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + x + 1, 0.37, Z0 + z + 1, root); } },
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
