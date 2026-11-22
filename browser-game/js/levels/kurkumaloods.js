// Act 3, mission 6: Kurkumaloods (De Duistere Dokken). The Abdavissies turmeric loods: a yellow-lit hall of barrels, pallets and
// shipping containers, with a container office up on stilts. Built on the docks outside (js/levels/docks.js) with its own building, after the concept
// art (03_Act3_Kurkumaloods): a stormy quay with a crane, a kiosk, a big warm-yellow loods of crates, barrels and containers, and an
// office in a container at the back.
// The twist: an overhead crane carries a container back and forth across the loods. It sweeps anyone under it off their feet.

import { dock } from './docks.js';

export default dock({
  id: 'kurkumaloods', name: 'Kurkumaloods', kiosk: 'KURKUMA KIOSK', sign: 'KURKUMALOODS · LOODS 4',
  hallLight: 0xf2c14e,
  mood: { hemi: 0.55, sun: 0.5 },
  hall: 'yellow', floors: { yellow: (g) => { g.fillStyle = '#6a5a3a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#f2c14e'; g.fillRect(0, 30, 64, 3); }, cont: (g) => { g.fillStyle = '#7a2e1a'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(0,0,0,.25)'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 3, 64); } }, floorRep: { yellow: 3, cont: 1.5 },
  // The building: one tall loods under the overhead crane, with the boss's container office walled off in its back corner (windows
  // onto the floor). Along the front: the kiosk, a truck bay with a trailer backed in from the quay, and the red break room.
  plan: {
    rooms: [['hall', 12, 1, 44, 18, 'yellow'], ['hall', 1, 8, 11, 18, 'yellow'], ['office', 1, 1, 10, 6, 'cont'], ['kiosk', 1, 20, 12, 23, 'kiosk'], ['bay', 14, 20, 30, 23, 'quay'], ['red', 32, 20, 44, 23, 'red']],
    layout({ carve, put, putR }) {
      putR(11, 3, 11, 4, 'D'); putR(3, 7, 8, 7, '%'); putR(6, 19, 7, 19, 'D'); carve(17, 19, 27, 19); putR(38, 19, 39, 19, 'D'); putR(13, 21, 13, 22, 'D'); putR(31, 21, 31, 22, 'D');
      putR(1, 24, 4, 24, '%'); putR(5, 24, 6, 24, 'D'); putR(7, 24, 12, 24, '%'); carve(16, 24, 28, 24); putR(32, 24, 44, 24, '%');
      // the loods: containers along the back and front, drums in pairs, shelving
      putR(14, 2, 19, 3, 'N'); putR(37, 2, 43, 3, 'N'); putR(36, 15, 42, 16, 'N'); putR(14, 16, 18, 17, 'N');
      for (const [x, z] of [[23, 4], [30, 4], [16, 8], [41, 8], [16, 12], [41, 12], [24, 15], [30, 15]]) putR(x, z, x + 1, z + 1, 'e');
      putR(24, 1, 33, 1, 'R'); put(44, 18, 'X'); put(1, 18, 'X');
      // the container office
      putR(3, 2, 5, 3, 'O'); put(1, 1, 'V'); put(10, 1, 'p'); putR(9, 5, 10, 5, 'S');
      // the kiosk, the trailer in the bay, the break room
      putR(1, 21, 3, 21, 'K'); put(12, 20, 'F'); put(9, 22, 'T');
      putR(19, 21, 25, 22, 'N'); put(15, 23, 'e');
      putR(33, 23, 36, 23, 'S'); put(40, 21, 'T'); put(44, 20, 'p');
    },
    hallCells: [[17, 19], [18, 19], [19, 19], [20, 19], [21, 19], [22, 19], [23, 19], [24, 19], [25, 19], [26, 19], [27, 19], [16, 24], [17, 24], [18, 24], [19, 24], [20, 24], [21, 24], [22, 24], [23, 24], [24, 24], [25, 24], [26, 24], [27, 24], [28, 24]],
    doorSigns: { '11,3': 'KANTOOR' },
    roomNames: { hall: 'LOODS 4', office: 'CONTAINERKANTOOR', kiosk: 'KURKUMA KIOSK', bay: 'LAADKUIL', red: 'KANTINE', quay: 'KADE' },
    neon: { hall: 0xf2c14e, office: 0xe8a33d, kiosk: 0xf2c14e, red: 0xc2412d },
    lights: [[6, 21, 0xd8ccb0, 1.3], [6, 4, 0xe8a33d, 1.4], [18, 5, 0xffc860, 1.8], [30, 5, 0xffc860, 1.8], [40, 6, 0xffc860, 1.6], [18, 14, 0xffc860, 1.7], [30, 14, 0xffc860, 1.7], [40, 13, 0xffc860, 1.6], [38, 21, 0xc2412d, 1.3], [8, 27, 0xd8a83a, 0.9]],
    spawns: [
      [3, 23, 'makarov', 0, 'kiosk'], [9, 21, 'bat', -Math.PI / 2, 'kiosk'],
      [7, 4, 'shotgun', Math.PI, 'office', true], [2, 5, 'makarov', Math.PI / 2, 'office'],
      [21, 6, 'makarov', Math.PI, 'hall'], [27, 7, 'bat', Math.PI / 2, 'hall'], [34, 6, 'makarov', -Math.PI / 2, 'hall'], [40, 12, 'shotgun', -Math.PI / 2, 'hall'], [20, 12, 'makarov', Math.PI / 2, 'hall'],
      [28, 16, 'bat', Math.PI, 'hall'], [34, 14, 'makarov', Math.PI, 'hall'], [6, 14, 'bat', Math.PI / 2, 'hall'], [44, 5, 'makarov', -Math.PI / 2, 'hall'],
      [16, 21, 'makarov', Math.PI / 2, 'bay'], [28, 20.5, 'shotgun', Math.PI, 'bay'],
      [36, 21, 'makarov', Math.PI / 2, 'red'], [42, 22, 'bat', -Math.PI / 2, 'red'],
    ],
    loot: [[12, 1.5], [44, 1.5], [1.5, 8.5], [44, 16.5], [44, 22.5]],
    signs: [['KURKUMA KIOSK', 6, 4.4, '#f2c14e'], ['KURKUMALOODS · LOODS 4', 22, 8, '#f2c14e']],
    crane: [-3, 26, Math.PI / 2],
    rain: [[14, 20, 30, 24]], wet: (x, z) => x >= 14 && x <= 30 && z >= 20,
  },
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
    box(42, 0.4, 0.4, lam({ color: 0xd8a83a }), OX + 22.5, WALL_H + 0.6, Z0 + 11.5, root, false);
    const cont = new THREE.Group(); root.add(cont);
    box(5, 1.6, 2, lam({ color: 0x7a2e1a }), 0, 0, 0, cont, false);
    for (const dx of [-2, 2]) box(0.05, 1.2, 0.05, lam({ color: 0x1a1a1a }), dx, 1.4, 0, cont, false);
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(5, 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; root.add(shadow);
    let hitT = 0;
    return { tick(dt) {
      const R = run(); const p = Math.sin(R.time * 0.45);
      const x = OX + 26.5 + p * 15, z = Z0 + 11.5;
      cont.position.set(x, 1.3, z); shadow.position.set(x, 0.03, z);
      hitT -= dt; if (hitT <= 0 && !R.results) { hitT = 0.35; spill(new THREE.Vector3(x, 0, z), 2.2, { quiet: true }); }
    } };
  },
});
