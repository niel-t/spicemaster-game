// Act 3, mission 3: Paprikapakhuis (De Duistere Dokken). The Abdavissies paprika storehouse. Built on the shared docks layout
// (js/levels/docks.js) after the concept art (03_Act3_Paprikapakhuis): a stormy quay, a kiosk, a dim storehouse of tall shelving and
// crates under a few teal lamps, and a red lounge.
// The twist: the storehouse is dark and the shelving blocks sight: every aisle is a blind corner.

import { dock } from './docks.js';

export default dock({
  id: 'paprikapakhuis', name: 'Paprikapakhuis', kiosk: 'PAPRIKA SNACKS', sign: 'PAPRIKAPAKHUIS · ALLEEN PERSONEEL',
  hallLight: 0x8ac8c8,
  lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xc2412d, 1.6], [18, 4, 0x6ad8c8, 0.9], [38, 4, 0x6ad8c8, 0.9], [28, 12, 0x6ad8c8, 0.8], [18, 20, 0x6ad8c8, 0.8], [38, 20, 0x6ad8c8, 0.8], [8, 27, 0xd8a83a, 0.9]],
  mood: { hemi: 0.3, sun: 0.3 },
  rackGoods: [0xc2412d, 0x7a2e1a, 0xd8a83a],
  hallLayout({ putR, put }) {
    for (const z of [3, 7, 15, 19]) { putR(14, z, 22, z, 'R'); putR(26, z, 33, z, 'R'); putR(37, z, 43, z, 'R'); }
    putR(14, 11, 16, 12, 'C'); putR(27, 11, 29, 11, 'C'); putR(40, 11, 42, 12, 'C'); put(44, 23, 'X'); put(12, 1, 'X');
  },
  hallSpawns: [
    [18, 5, 'makarov', Math.PI / 2, 'hall'], [30, 5, 'bat', -Math.PI / 2, 'hall'], [41, 5, 'makarov', -Math.PI / 2, 'hall'], [21, 9.5, 'shotgun', Math.PI, 'hall'],
    [34, 13, 'makarov', Math.PI, 'hall'], [19, 17, 'bat', Math.PI / 2, 'hall'], [30, 17, 'makarov', Math.PI, 'hall'], [41, 21, 'bat', -Math.PI / 2, 'hall'], [24, 21.5, 'makarov', Math.PI / 2, 'hall'],
  ],
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
