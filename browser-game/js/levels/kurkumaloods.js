// Act 3, mission 6: Kurkumaloods (De Duistere Dokken). The Abdavissies turmeric loods: a yellow-lit hall of barrels, pallets and
// shipping containers, with a container office up on stilts. Built on the shared docks layout (js/levels/docks.js) after the concept
// art (03_Act3_Kurkumaloods): a stormy quay with a crane, a kiosk, a big warm-yellow loods of crates, barrels and containers, and an
// office in a container at the back.
// The twist: an overhead crane carries a container back and forth across the loods. It sweeps anyone under it off their feet.

import { dock } from './docks.js';

export default dock({
  id: 'kurkumaloods', name: 'Kurkumaloods', kiosk: 'KURKUMA KIOSK', sign: 'KURKUMALOODS · LOODS 4',
  hallLight: 0xf2c14e,
  lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xc2412d, 1.5], [18, 5, 0xffc860, 1.8], [30, 5, 0xffc860, 1.8], [40, 5, 0xffc860, 1.6], [18, 18, 0xffc860, 1.7], [30, 18, 0xffc860, 1.7], [40, 18, 0xffc860, 1.6], [8, 27, 0xd8a83a, 0.9]],
  mood: { hemi: 0.55, sun: 0.5 },
  hall: 'yellow', floors: { yellow: (g) => { g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#f2c14e'; g.fillRect(0, 30, 64, 3); } }, floorRep: { yellow: 3 },
  furn: {
    N: { h: 2.4, cover: true, draw: ({ box, lam, root, n, cx, cz, x }) => { box(n - 0.06, 2.4, 0.96, lam({ color: [0x7a2e1a, 0x2a4a6a, 0x5a6a3a][x % 3] }), cx, 1.2, cz, root); } }, // shipping containers (one row each)
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) cyl(0.4, 0.4, 1.0, lam({ color: 0xd8a83a }), OX + x + k + 0.5, 0.5, cz, root, 14); } },
  },
  hallLayout({ putR, put }) {
    putR(14, 2, 19, 2, 'N'); putR(14, 3, 19, 3, 'N'); putR(37, 2, 43, 2, 'N'); putR(37, 3, 43, 3, 'N'); // containers along the back
    putR(36, 19, 42, 19, 'N'); putR(36, 20, 42, 20, 'N'); putR(14, 20, 18, 20, 'N'); putR(14, 21, 18, 21, 'N');
    for (const [x, z] of [[23, 4], [30, 4], [16, 8], [41, 8], [16, 15], [41, 15], [24, 19], [30, 19]]) putR(x, z, x + 1, z + 1, 'e');
    putR(24, 1, 33, 1, 'R'); put(44, 23, 'X'); put(12, 1, 'X');
  },
  hallSpawns: [
    [21, 6, 'makarov', Math.PI, 'hall'], [27, 7, 'bat', Math.PI / 2, 'hall'], [34, 6, 'makarov', -Math.PI / 2, 'hall'], [40, 12, 'shotgun', -Math.PI / 2, 'hall'],
    [20, 12, 'makarov', Math.PI / 2, 'hall'], [28, 16, 'bat', Math.PI, 'hall'], [34, 17, 'makarov', Math.PI, 'hall'], [22, 22.5, 'bat', Math.PI, 'hall'], [43, 22.5, 'makarov', -Math.PI / 2, 'hall'],
  ],
  bossLook: { cap: 0xf2c14e, shirt: 0xd8a83a, front: '#d8a83a', pants: 0x2a2a2a, belly: 1.2, head: { hair: '#2a1a12', brow: '#1a1a1a', hairLine: 46, iris: '#3a2a1a' } }, // the Loodsbaas: yellow hard hat, hi-vis
  text: {
    area: 'DE DUISTERE DOKKEN · KURKUMALOODS',
    banner: ['KURKUMALOODS', 'Loods 4. Turmeric by the container.'],
    objective: 'Take <b>Kurkumaloods</b>. <b>Watch the crane</b>: the container it carries across the loods sweeps anyone under it off their feet. The Loodsbaas waits in the red office. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Kurkumaloods is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Kurkumaloods is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KURKUMALOODS TAKEN',
    resultsHint: 'The loods is yellow from floor to ceiling. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KURKUMALOODS IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE LOODSBAAS IS DOWN', 'Shift over.'],
    tips: ['The crane container swings east and west across the middle of the loods. Lure the Abdavissies under it.', 'Containers and barrels stop bullets.', 'The crane knocks you down too. Time your run.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, spill, run, WALL_H }) {
    // the overhead crane: a beam across the loods and a container on cables that runs east and west
    box(34, 0.4, 0.4, lam({ color: 0xd8a83a }), OX + 28.5, WALL_H + 0.6, Z0 + 11.5, root, false);
    const cont = new THREE.Group(); root.add(cont);
    box(5, 1.6, 2, lam({ color: 0x7a2e1a }), 0, 0, 0, cont, false);
    for (const dx of [-2, 2]) box(0.05, 1.2, 0.05, lam({ color: 0x1a1a1a }), dx, 1.4, 0, cont, false);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; root.add(shadow);
    let hitT = 0;
    return { tick(dt) {
      const R = run(); const p = Math.sin(R.time * 0.45);
      const x = OX + 28.5 + p * 13, z = Z0 + 11.5;
      cont.position.set(x, 1.3, z); shadow.position.set(x, 0.03, z);
      hitT -= dt; if (hitT <= 0 && !R.results) { hitT = 0.35; spill(new THREE.Vector3(x, 0, z), 2.2, { quiet: true }); }
    } };
  },
});
