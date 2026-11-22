// Act 3, mission 9: Smokkelsloot (De Duistere Dokken). The Abdavissies boathouse: a covered smuggling canal where their speedboats
// come in under the warehouse. Built on the docks outside (js/levels/docks.js) with its own building, after the concept art (03_Act3_Smokkelsloot): a
// stormy quay, a kiosk, a dim workshop of crates, and a boathouse with a speedboat moored in an indoor canal behind railings.
// The twist: water inside. The canal runs through the hall: knock an Abdavissie into it and he's gone.

import { dock } from './docks.js';
import { WATER_FURN } from './noshgey.js';
import { makeCruiser, rockBoat } from '../boats.js';

export default dock({
  id: 'smokkelsloot', name: 'Smokkelsloot', kiosk: 'DE SLOOT', sign: 'SMOKKELSLOOT · BOTENHUIS',
  hazard: { ch: '~', text: 'IN DE SLOOT!', death: 'Fell in the smuggling canal.' },
  furn: { ...WATER_FURN },
  hallLight: 0x6ac8c8,
  // The building: a dim workshop on the left; the boathouse fills the rest, cut in two by the indoor canal that runs in from the sea
  // through the east wall, with one footbridge across. Smokkelaar Sjaak's red room sits over the water in the back corner; the
  // kiosk is boxed into the front.
  plan: {
    rooms: [['shop', 1, 1, 14, 23, 'depot'], ['boat', 16, 1, 35, 9, 'depot'], ['boat', 16, 10, 44, 17, 'depot'], ['boat', 16, 18, 28, 23, 'depot'], ['boat', 39, 18, 44, 23, 'depot'], ['red', 37, 1, 44, 8, 'red'], ['kiosk', 30, 19, 37, 23, 'kiosk']],
    layout({ carve, put, putR }) {
      putR(16, 11, 44, 16, '~'); carve(24, 11, 25, 16); carve(45, 11, 45, 16, '~'); // the canal, open to the sea, and the footbridge
      putR(15, 4, 15, 5, 'D'); putR(15, 20, 15, 21, 'D'); putR(36, 4, 36, 5, 'D'); putR(40, 9, 41, 9, 'D'); putR(29, 21, 29, 22, 'D'); putR(38, 20, 38, 21, 'D');
      putR(2, 24, 3, 24, '%'); putR(5, 24, 6, 24, 'D'); putR(8, 24, 11, 24, '%'); carve(18, 24, 23, 24); putR(30, 24, 33, 24, '%'); putR(34, 24, 35, 24, 'D'); putR(36, 24, 37, 24, '%');
      // the workshop
      putR(2, 3, 6, 3, 'w'); putR(9, 3, 12, 3, 'w'); putR(1, 8, 1, 14, 'R'); putR(4, 10, 5, 11, 'C'); putR(10, 13, 11, 14, 'C'); putR(3, 18, 4, 19, 'C'); putR(9, 20, 10, 21, 'C'); put(14, 1, 'X');
      // the boathouse
      putR(18, 2, 20, 3, 'C'); putR(26, 2, 28, 3, 'C'); putR(32, 6, 33, 7, 'C'); putR(19, 7, 22, 7, 'w'); put(16, 9, 'X');
      putR(17, 22, 18, 23, 'C'); putR(25, 20, 27, 20, 'q'); putR(42, 21, 43, 22, 'C'); put(44, 18, 'X');
      // Sjaak's room, the kiosk
      putR(38, 2, 40, 2, 'O'); putR(43, 2, 43, 4, 'S'); put(44, 1, 'V'); put(40, 6, 'T');
      putR(32, 20, 32, 22, 'K'); put(37, 19, 'F');
    },
    hallCells: [[18, 24], [19, 24], [20, 24], [21, 24], [22, 24], [23, 24]],
    doorSigns: { '36,4': 'PRIVÉ' },
    roomNames: { shop: 'WERKPLAATS', boat: 'BOTENHUIS', red: 'SJAAKS KAMER', kiosk: 'DE SLOOT', quay: 'KADE' },
    neon: { shop: 0xffd8a0, boat: 0x6ac8c8, red: 0xc2412d, kiosk: 0x6ac8c8 },
    lights: [[33, 21, 0xd8ccb0, 1.4], [40, 5, 0xc2412d, 1.5], [7, 8, 0xffd8a0, 1.2], [7, 18, 0xffd8a0, 1.2], [24, 5, 0xffd8a0, 1.3], [24, 14, 0x6ad8d8, 1.4], [36, 14, 0x6ad8d8, 1.4], [22, 21, 0x8a9aa8, 1.0], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [33, 21, 'makarov', Math.PI, 'kiosk'], [36, 22, 'bat', -Math.PI / 2, 'kiosk'],
      [41.5, 6, 'shotgun', 0, 'red', true], [38, 5, 'makarov', Math.PI / 2, 'red'],
      [7, 6, 'makarov', Math.PI, 'shop'], [3, 15, 'bat', Math.PI / 2, 'shop'], [12, 9, 'makarov', -Math.PI / 2, 'shop'], [7, 21, 'bat', Math.PI, 'shop'],
      [24, 5, 'makarov', Math.PI, 'boat'], [30, 4, 'bat', Math.PI / 2, 'boat'], [34, 8.5, 'shotgun', Math.PI, 'boat'], [20, 10, 'makarov', Math.PI / 2, 'boat'], [36, 17, 'bat', 0, 'boat'], [42, 10, 'makarov', Math.PI, 'boat'],
      [21, 20, 'makarov', 0, 'boat'], [41, 19, 'bat', -Math.PI / 2, 'boat'],
    ],
    loot: [[1.5, 1.5], [16, 1.5], [44, 7.5], [28, 22.5], [44, 22.5]],
    signs: [['DE SLOOT', 34.5, 3.6, '#6ac8c8'], ['SMOKKELSLOOT · BOTENHUIS', 20.5, 8, '#c8d8e0']],
    crane: [-3, 27],
  },
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
    const w = floorW(OX + 26, OX + 46, Z0 + 11, Z0 + 17, t, 4, 0xffffff, 0.02), w2 = floorW(OX + 16, OX + 24, Z0 + 11, Z0 + 17, t, 4, 0xffffff, 0.02); w2.material = w.material;
    // railings along both banks, broken by the footbridge; the bridge deck and its rails
    const rail = lam({ color: 0x5a5e62 });
    for (const z of [10.95, 17.05]) { for (let x = 16; x <= 44; x += 2) if (x < 24 || x > 26) box(0.08, 1.0, 0.08, rail, OX + x, 0.5, Z0 + z, root, false); box(8, 0.06, 0.06, rail, OX + 20, 1.0, Z0 + z, root, false); box(19, 0.06, 0.06, rail, OX + 35.5, 1.0, Z0 + z, root, false); }
    box(2, 0.08, 6, lam({ color: 0x6a5038 }), OX + 25, 0.06, Z0 + 14, root, false);
    for (const x of [24.04, 25.96]) { box(0.06, 0.06, 6, rail, OX + x, 1.0, Z0 + 14, root, false); for (let z = 11; z <= 17; z += 2) box(0.08, 1.0, 0.08, rail, OX + x, 0.5, Z0 + z, root, false); }
    // the Abdavissies' speedboat (js/boats.js), with the night's crates on the foredeck
    const boat = makeCruiser({ speed: true, L: 7.5, B: 2.2, hull: 0xf3ecdc, stripe: 0xb5442a }); boat.position.set(OX + 34, 0.02, Z0 + 14); root.add(boat);
    for (let k = 0; k < 4; k++) box(0.6, 0.4, 0.5, lam({ color: [0x6a5032, 0x8a6a42][k % 2] }), 0.6 + k * 0.7, 0.72, (k % 2 - 0.5) * 0.5, boat.userData.body, false);
    let tt = 0;
    return { tick(dt) { tt += dt; w.material.map.offset.x = tt * 0.03; rockBoat(boat, tt, 0); } };
  },
});
