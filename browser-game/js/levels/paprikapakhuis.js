// Act 3, mission 3: Paprikapakhuis (De Duistere Dokken). The Abdavissies paprika storehouse. Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Paprikapakhuis): a stormy quay, a kiosk, a dim storehouse of tall shelving and
// crates under a few teal lamps, and a red lounge.
// The twist: the storehouse is dark and the shelving blocks sight: every aisle is a blind corner.

import { dock } from './docks.js';

export default dock({
  id: 'paprikapakhuis', name: 'Paprikapakhuis', kiosk: 'PAPRIKA SNACKS', sign: 'PAPRIKAPAKHUIS · ALLEEN PERSONEEL',
  hallLight: 0x8ac8c8,
  mood: { hemi: 0.3, sun: 0.3 },
  rackGoods: [0xc2412d, 0x7a2e1a, 0xd8a83a],
  // The building: the storehouse fills the back, its tall shelving running front to back so every aisle is a blind corner. In front:
  // a loading bay with its shutter up, the red lounge behind a glass front, and the snack kiosk.
  plan: {
    rooms: [['hall', 1, 1, 44, 14, 'depot'], ['bay', 1, 16, 13, 23, 'depot'], ['lounge', 15, 16, 30, 23, 'red'], ['kiosk', 32, 16, 44, 23, 'kiosk']],
    layout({ carve, put, putR }) {
      carve(4, 15, 8, 15); putR(22, 15, 23, 15, 'D'); putR(38, 15, 39, 15, 'D'); putR(14, 19, 14, 20, 'D'); putR(31, 19, 31, 20, 'D');
      carve(3, 24, 10, 24); putR(15, 24, 30, 24, '%'); putR(32, 24, 36, 24, '%'); putR(37, 24, 38, 24, 'D'); putR(39, 24, 44, 24, '%');
      // the storehouse: shelving front to back, a cross aisle half blocked with crates
      for (const x of [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42]) { putR(x, 2, x, 6, 'R'); putR(x, 9, x, 12, 'R'); }
      putR(10, 7, 11, 8, 'C'); putR(28, 7, 29, 7, 'C'); putR(40, 7, 41, 8, 'C'); put(44, 13, 'X'); put(1, 1, 'X');
      // the bay
      putR(2, 18, 3, 19, 'C'); putR(9, 20, 11, 21, 'C'); putR(5, 22, 7, 22, 'q'); put(12, 17, 'e');
      // the lounge
      putR(25, 16, 29, 16, 'B'); putR(17, 22, 20, 22, 'S'); putR(24, 21, 24, 22, 'S'); put(19, 19, 'T'); put(27, 20, 'T'); put(30, 16, 'p');
      // the kiosk
      putR(34, 18, 37, 18, 'K'); put(44, 16, 'F'); put(42, 21, 'T');
    },
    quay({ put, putR }) { putR(9, 26, 10, 27, 'C'); putR(33, 26, 35, 26, 'q'); put(43, 27, 'X'); put(1, 27, 'l'); put(25, 28, 'l'); put(20, 26, 'e'); },
    hallCells: [[4, 15], [5, 15], [6, 15], [7, 15], [8, 15], [3, 24], [4, 24], [5, 24], [6, 24], [7, 24], [8, 24], [9, 24], [10, 24]],
    roomNames: { hall: 'PAKHUIS', bay: 'LAADDOK', lounge: 'DE RODE KAMER', kiosk: 'PAPRIKA SNACKS', quay: 'KADE' },
    neon: { hall: 0x8ac8c8, kiosk: 0xc2412d, lounge: 0xc2412d },
    lights: [[38, 20, 0xd8ccb0, 1.3], [22, 19, 0xc2412d, 1.5], [10, 4, 0x6ad8c8, 0.9], [25, 4, 0x6ad8c8, 0.9], [40, 4, 0x6ad8c8, 0.9], [18, 11, 0x6ad8c8, 0.8], [34, 11, 0x6ad8c8, 0.8], [7, 20, 0x8a9aa8, 0.9], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [35, 20, 'makarov', Math.PI, 'kiosk'], [41, 22, 'bat', -Math.PI / 2, 'kiosk'],
      [27, 18, 'shotgun', Math.PI, 'lounge', true], [18, 20, 'makarov', Math.PI / 2, 'lounge'], [22, 22, 'makarov', 0, 'lounge'],
      [6, 18, 'bat', Math.PI / 2, 'bay'], [11, 23, 'makarov', -Math.PI / 2, 'bay'],
      [4.5, 4, 'makarov', 0, 'hall'], [16.5, 5, 'bat', Math.PI, 'hall'], [25.5, 4, 'makarov', 0, 'hall'], [34.5, 10, 'shotgun', Math.PI, 'hall'], [43, 5, 'makarov', -Math.PI / 2, 'hall'],
      [19, 7.5, 'bat', Math.PI / 2, 'hall'], [31, 8, 'makarov', -Math.PI / 2, 'hall'], [13.5, 10, 'bat', 0, 'hall'], [40.5, 11, 'makarov', Math.PI, 'hall'],
    ],
    loot: [[1.5, 14], [44, 1.5], [43, 14], [1.5, 23], [30, 22.5]],
    signs: [['PAPRIKA SNACKS', 38, 4.4, '#c2412d'], ['PAPRIKAPAKHUIS · ALLEEN PERSONEEL', 22.5, 9, '#c8d8e0']],
    crane: null,
  },
  bossLook: { cap: 0x7a2e1a, shirt: 0x7a2e1a, front: '#7a2e1a', pants: 0x1a2030, belly: 0.9, head: { hair: '#2a1a12', brow: '#1a1a1a', hairLine: 44, iris: '#3a2a1a' } }, // the Pakhuismeester: rust work coat
  text: {
    area: 'DE DUISTERE DOKKEN · PAPRIKAPAKHUIS',
    banner: ['PAPRIKAPAKHUIS', 'Shelves to the ceiling, and the lights are out.'],
    objective: 'Take the <b>Paprikapakhuis</b>. The storehouse is <b>dark and the shelving blocks sight</b>: every aisle is a blind corner. The Pakhuismeester waits in the red lounge. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Paprikapakhuis is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Paprikapakhuis is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'PAPRIKAPAKHUIS TAKEN',
    resultsHint: 'The shelves are full of smuggled paprika, and they\'re yours now. Grab the spice crates (E), then drive home.',
    ownedBanner: ['PAPRIKAPAKHUIS IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE PAKHUISMEESTER IS DOWN', 'Out of stock.'],
    tips: ['Shelving blocks sight both ways: listen for footsteps and take corners slow.', 'The aisles run east to west. The middle row has crates for cover.', 'Gunfire carries through the whole storehouse.'],
  },
});
