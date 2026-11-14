// Act 3, mission 9: Smokkelsloot (De Duistere Dokken). The Abdavissies boathouse: a covered smuggling canal where their speedboats
// come in under the warehouse. Built on the shared docks layout (js/levels/docks.js) after the concept art (03_Act3_Smokkelsloot): a
// stormy quay, a kiosk, a dim workshop of crates, and a boathouse with a speedboat moored in an indoor canal behind railings.
// The twist: water inside. The canal runs through the hall: knock an Abdavissie into it and he's gone.

import { dock } from './docks.js';
import { WATER_FURN } from './noshgey.js';

export default dock({
  id: 'smokkelsloot', name: 'Smokkelsloot', kiosk: 'DE SLOOT', sign: 'SMOKKELSLOOT · BOTENHUIS',
  hazard: { ch: '~', text: 'IN DE SLOOT!', death: 'Fell in the smuggling canal.' },
  furn: { ...WATER_FURN },
  hallLight: 0x6ac8c8,
  lights: [[5, 19, 0xd8ccb0, 1.4], [5, 6, 0xc2412d, 1.5], [18, 5, 0xffd8a0, 1.4], [30, 5, 0xffd8a0, 1.3], [26, 15, 0x6ad8d8, 1.4], [38, 15, 0x6ad8d8, 1.4], [40, 5, 0xffd8a0, 1.2], [8, 27, 0xd8a83a, 0.9]],
  hallLayout({ putR, put }) {
    putR(20, 12, 44, 18, '~'); // the indoor canal, open to the sea through the east wall
    putR(14, 2, 16, 3, 'C'); putR(22, 2, 24, 3, 'C'); putR(30, 2, 32, 3, 'C'); putR(38, 2, 40, 3, 'C'); putR(18, 7, 21, 7, 'w'); putR(33, 7, 36, 7, 'w');
    putR(14, 15, 15, 16, 'C'); putR(14, 21, 16, 22, 'C'); putR(28, 21, 30, 22, 'C'); put(44, 1, 'X'); put(44, 22, 'X');
  },
  hallSpawns: [
    [18, 5, 'makarov', Math.PI, 'hall'], [27, 5, 'bat', Math.PI / 2, 'hall'], [36, 5, 'makarov', -Math.PI / 2, 'hall'], [26, 10, 'shotgun', Math.PI, 'hall'], [40, 10, 'makarov', Math.PI, 'hall'],
    [17, 13, 'bat', Math.PI / 2, 'hall'], [24, 20.5, 'makarov', 0, 'hall'], [36, 20.5, 'bat', 0, 'hall'], [42, 21, 'makarov', -Math.PI / 2, 'hall'],
  ],
  bossLook: { cap: 0x1a2a3a, shirt: 0xd8a83a, front: '#d8a83a', pants: 0x1a2030, belly: 0.5, head: { hair: '#5a3a1a', brow: '#3a2a1a', hairLine: 48, iris: '#3a4a5a', goatee: '#5a3a1a' } }, // Smokkelaar Sjaak
  text: {
    area: 'DE DUISTERE DOKKEN · SMOKKELSLOOT',
    banner: ['SMOKKELSLOOT', 'Where the speedboats come in under the warehouse.'],
    objective: 'Take the <b>Smokkelsloot</b> boathouse. A canal runs right through the hall: <b>knock the Abdavissies into the water</b>. Smokkelaar Sjaak hides in the red room. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Smokkelsloot is <b>yours</b>. No more boats tonight. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Smokkelsloot is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'SMOKKELSLOOT TAKEN',
    resultsHint: 'The canal is quiet and the boats are yours. Grab the spice crates (E), then drive home.',
    ownedBanner: ['SMOKKELSLOOT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['SMOKKELAAR SJAAK IS DOWN', 'Sunk.'],
    tips: ['Knock an Abdavissie into the canal edge: gone.', 'The canal splits the hall. The way round is on the west side.', 'Bullets fly over the water.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, floorW, canvasTex }) {
    const t = canvasTex(64, 64, (g) => { g.fillStyle = '#081a2c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,200,220,${0.05 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 6 + Math.random() * 10, 1); } });
    const w = floorW(OX + 20, OX + 45, Z0 + 12, Z0 + 19, t, 4, 0xffffff, 0.02);
    for (const z of [11.95, 19.05]) for (let x = 20; x <= 44; x += 2) box(0.08, 1.0, 0.08, lam({ color: 0x5a5e62 }), OX + x, 0.5, Z0 + z, root, false);
    for (const z of [11.95, 19.05]) box(25, 0.06, 0.06, lam({ color: 0x5a5e62 }), OX + 32.5, 1.0, Z0 + z, root, false);
    const boat = new THREE.Group(); boat.position.set(OX + 33, 0.1, Z0 + 15.5); root.add(boat);
    box(7, 0.6, 2.2, lam({ color: 0xf3ecdc }), 0, 0.2, 0, boat, false); box(2, 0.6, 1.6, lam({ color: 0x1a2a3a }), -1, 0.7, 0, boat, false);
    const nose = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 4), lam({ color: 0xf3ecdc })); nose.rotation.z = -Math.PI / 2; nose.position.set(4.2, 0.2, 0); boat.add(nose);
    for (let k = 0; k < 4; k++) box(0.6, 0.4, 0.5, lam({ color: 0x6a5032 }), 0.5 + k * 0.8, 0.7, 0, boat, false);
    let tt = 0;
    return { tick(dt) { tt += dt; w.material.map.offset.x = tt * 0.03; boat.position.y = 0.1 + Math.sin(tt * 1.5) * 0.05; boat.rotation.x = Math.sin(tt * 1.1) * 0.03; } };
  },
});
