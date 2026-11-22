// Act 3, mission 10: Containerchaos (De Duistere Dokken). The Abdavissies container yard and the dockers' bar. Built on the docks outside
// (js/levels/docks.js) with its own building, after the concept art (03_Act3_Containerchaos_Kardemomdok, the lower floor): a stormy quay with a
// crane, a kiosk, a yard stacked with shipping containers, and a red bar.
// The twist: a container maze. Stacks block sight and bullets, and every stack has two ways round.

import { dock } from './docks.js';

export default dock({
  id: 'containerchaos', name: 'Containerchaos', kiosk: 'HAVENKANTINE', sign: 'CONTAINERCHAOS · TERMINAL 7',
  hall: 'yard', floors: { yard: (g) => { g.fillStyle = '#3a3c3e'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#d8a83a'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64); } }, floorRep: { yard: 4 },
  hallLight: 0xd8e0e8,
  furn: { B: { color: 0x3a2010 }, P: { color: 0x1a5a2a } }, // containers (N) come from the dock set: they block sight and bullets
  // No warehouse here: the container yard is open to the sky behind a wire fence and a gate onto the quay. The dockers' red bar is a
  // brick block in the top left corner, the Havenkantine a portakabin in the front right. Every stack has two ways round.
  plan: {
    rooms: [['bar', 1, 1, 12, 10, 'red'], ['yard', 14, 1, 44, 11, 'yard'], ['yard', 1, 12, 33, 23, 'yard'], ['yard', 34, 12, 44, 16, 'yard'], ['canteen', 35, 18, 44, 23, 'kiosk']],
    layout({ carve, put, putR }) {
      carve(13, 11, 13, 11); carve(34, 17, 34, 17); // the yard runs round both buildings
      putR(5, 11, 6, 11, 'D'); putR(13, 4, 13, 5, 'D'); putR(39, 17, 40, 17, 'D'); putR(34, 20, 34, 21, 'D');
      putR(1, 24, 2, 24, 'f'); carve(3, 24, 14, 24); putR(15, 24, 33, 24, 'f'); putR(34, 24, 34, 24, '#'); putR(35, 24, 38, 24, '%'); putR(39, 24, 40, 24, 'D'); putR(41, 24, 44, 24, '%');
      // the container maze: two-high stacks, every one with a way round
      for (const [x, z, w] of [[16, 2, 5], [24, 2, 4], [31, 2, 5], [38, 2, 5], [18, 6, 4], [27, 6, 5], [36, 6, 4], [9, 13, 4], [17, 14, 4], [24, 13, 5], [36, 13, 5], [3, 18, 5], [12, 19, 4], [20, 18, 5], [27, 19, 4]]) putR(x, z, x + w - 1, z + 1, 'N');
      put(22, 11, 'l'); put(33, 16, 'l'); put(44, 1, 'X'); put(1, 23, 'X'); putR(42, 9, 43, 9, 'q'); putR(30, 22, 31, 22, 'e');
      // the dockers' bar
      putR(2, 2, 2, 8, 'B'); putR(5, 4, 6, 4, 'T'); putR(5, 8, 6, 8, 'T'); putR(9, 2, 10, 2, 'S'); putR(8, 6, 9, 7, 'P'); put(1, 10, 'p');
      // the canteen
      putR(42, 19, 43, 19, 'K'); put(44, 18, 'F'); put(38, 22, 'T');
    },
    hallCells: [[3, 24], [4, 24], [5, 24], [6, 24], [7, 24], [8, 24], [9, 24], [10, 24], [11, 24], [12, 24], [13, 24], [14, 24]],
    doorSigns: { '5,11': 'BAR' },
    roomNames: { bar: 'HAVENBAR', yard: 'TERMINAL 7', canteen: 'HAVENKANTINE', quay: 'KADE' },
    neon: { bar: 0xc2412d, canteen: 0xe8a33d },
    lights: [[40, 21, 0xd8ccb0, 1.4], [6, 5, 0xc2412d, 1.6], [22, 5, 0xd8e0e8, 1.4], [36, 9, 0xd8e0e8, 1.4], [12, 16, 0xd8e0e8, 1.3], [26, 21, 0xd8e0e8, 1.3], [40, 14, 0xd8e0e8, 1.2], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [7, 3, 'shotgun', Math.PI, 'bar', true], [10, 8.5, 'makarov', -Math.PI / 2, 'bar'], [4, 9, 'bat', 0, 'bar'],
      [39, 20, 'makarov', Math.PI, 'canteen'], [43, 22, 'bat', -Math.PI / 2, 'canteen'],
      [21, 4.5, 'makarov', Math.PI, 'yard'], [29, 4.5, 'bat', Math.PI / 2, 'yard'], [37, 4.5, 'makarov', -Math.PI / 2, 'yard'], [24, 8.5, 'shotgun', Math.PI, 'yard'], [42, 8, 'makarov', Math.PI, 'yard'], [15, 9, 'bat', Math.PI / 2, 'yard'],
      [14, 16.5, 'makarov', Math.PI / 2, 'yard'], [23, 16.5, 'makarov', 0, 'yard'], [31, 21, 'bat', Math.PI, 'yard'], [42, 15, 'shotgun', -Math.PI / 2, 'yard'], [8, 21, 'makarov', Math.PI, 'yard'],
    ],
    loot: [[1.5, 1.5], [44, 2.5], [44, 11], [33, 23], [1.5, 22]],
    signs: [['HAVENKANTINE', 39.5, 4.4, '#e8a33d'], ['CONTAINERCHAOS · TERMINAL 7', 24, 9, '#c8d8e0']],
    crane: [-3, 27, Math.PI / 4],
    rain: [[14, 1, 44, 11], [1, 12, 33, 23], [34, 12, 44, 16]], wet: (x, z) => !(x <= 12 && z <= 10) && !(x >= 35 && z >= 18),
  },
  bossLook: { cap: 0xd8a83a, shirt: 0x2a4a6a, front: '#2a4a6a', pants: 0x1a2030, belly: 1.4, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 42, iris: '#2a2a2a' } }, // the Containerkoning
  text: {
    area: 'DE DUISTERE DOKKEN · CONTAINERCHAOS',
    banner: ['CONTAINERCHAOS', 'Terminal 7. Every container a hiding place.'],
    objective: 'Take <b>Containerchaos</b>. The yard is <b>a maze of container stacks</b>: they block sight and bullets, and there\'s always a way round. The Containerkoning drinks in the red bar. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Containerchaos is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Containerchaos is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'CONTAINERCHAOS TAKEN',
    resultsHint: 'The yard is yours. Kardemomdok is next, the Abdavissies HQ. Grab the spice crates (E), then drive home.',
    ownedBanner: ['CONTAINERCHAOS IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE CONTAINERKONING IS DOWN', 'Shipped out.'],
    tips: ['Container stacks hide you and them. Listen, then take the corner.', 'Every stack has two ways round. Flank.', 'The bar in the red room stops bullets.'],
  },
});
