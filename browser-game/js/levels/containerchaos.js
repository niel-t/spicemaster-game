// Act 3, mission 10: Containerchaos (De Duistere Dokken). The Abdavissies container yard and the dockers' bar. Built on the shared
// docks layout (js/levels/docks.js) after the concept art (03_Act3_Containerchaos_Kardemomdok, the lower floor): a stormy quay with a
// crane, a kiosk, a yard stacked with shipping containers, and a red bar.
// The twist: a container maze. Stacks block sight and bullets, and every stack has two ways round.

import { dock } from './docks.js';

export default dock({
  id: 'containerchaos', name: 'Containerchaos', kiosk: 'HAVENKANTINE', sign: 'CONTAINERCHAOS · TERMINAL 7',
  hall: 'yard', floors: { yard: (g) => { g.fillStyle = '#3a3c3e'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#d8a83a'; g.fillRect(0, 0, 64, 2); g.fillRect(0, 0, 2, 64); } }, floorRep: { yard: 4 },
  hallLight: 0xd8e0e8,
  redLayout({ putR, put }) { putR(2, 2, 2, 8, 'B'); putR(5, 4, 6, 4, 'T'); putR(5, 8, 6, 8, 'T'); putR(9, 2, 10, 2, 'S'); putR(9, 11, 10, 11, 'S'); put(9, 8, 'P'); },
  furn: {
    N: { h: 2.6, cover: true, sight: true, draw: ({ box, lam, root, n, cx, cz, x, z }) => { box(n - 0.06, 2.6, 0.96, lam({ color: [0x7a2e1a, 0x2a4a6a, 0x5a6a3a, 0xd8a83a][(x + z * 3) % 4] }), cx, 1.3, cz, root); } },
    B: { color: 0x3a2010 }, P: { color: 0x1a5a2a },
  },
  hallLayout({ putR, put }) {
    for (const [x, z, w] of [[14, 2, 5], [22, 2, 4], [30, 2, 5], [38, 2, 5], [16, 6, 4], [26, 6, 5], [35, 6, 4], [14, 10, 4], [21, 10, 5], [30, 10, 4], [38, 10, 5], [16, 14, 5], [25, 14, 4], [33, 14, 5], [14, 18, 4], [22, 18, 5], [31, 18, 4], [39, 18, 4]]) { putR(x, z, x + w - 1, z, 'N'); putR(x, z + 1, x + w - 1, z + 1, 'N'); }
    put(44, 23, 'X'); put(12, 22, 'X');
  },
  hallSpawns: [
    [20, 4.5, 'makarov', Math.PI, 'hall'], [28, 4.5, 'bat', Math.PI / 2, 'hall'], [37, 4.5, 'makarov', -Math.PI / 2, 'hall'], [24, 8.5, 'shotgun', Math.PI, 'hall'],
    [40, 8.5, 'makarov', Math.PI, 'hall'], [19, 12.5, 'bat', Math.PI / 2, 'hall'], [36, 12.5, 'makarov', -Math.PI / 2, 'hall'], [23, 16.5, 'makarov', Math.PI / 2, 'hall'], [30, 20.5, 'bat', Math.PI, 'hall'], [43, 16, 'shotgun', -Math.PI / 2, 'hall'],
  ],
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
