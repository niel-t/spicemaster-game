// Warehouse defence: Eddy & Zn's own warehouse as a mission map, for the spice war at heat 100 (mission.js opts.defend).
// Nobody lives here at the start: the attackers come in waves from the street through three entrances (the front
// shutter, the loading bay and the side door off the alley), tagged by their spawn's room. The Naknikim hide under
// the mixing tables. Coordinates follow spekbuurt.js (cells; world z = cell z - H).
//
//   street → front shutter → hall (mixing tables, racks)        hall ↔ office ↔ storeroom
//   street → loading bay → storeroom;  alley → side door → storeroom

import { signFace } from '../livery.js'; // the shop sign follows the van's brand
const W = 33, H = 22;

export default {
  id: 'warehouse', name: 'Eddy & Zn warehouse', W, H,
  rooms: [
    ['hall', 1, 1, 20, 14, 'concrete'], ['office', 22, 1, 28, 6, 'parquet'], ['store', 22, 8, 28, 14, 'garage'],
    ['street', 1, 16, 31, 20, 'paving'], ['alley', 30, 1, 31, 15, 'asphalt'],
  ],
  layout({ carve, put, putR }) {
    putR(21, 3, 21, 4, 'D');   // hall ↔ office
    putR(21, 10, 21, 11, 'D'); // hall ↔ storeroom
    putR(24, 7, 25, 7, 'D');   // office ↔ storeroom
    carve(7, 15, 10, 15);      // the front shutter, rolled up
    carve(24, 15, 26, 15);     // the loading bay
    putR(29, 11, 29, 12, 'D'); // the side door onto the alley
    carve(30, 15, 31, 15);     // the alley runs into the street
    carve(0, 16, 0, 20); carve(32, 16, 32, 20); // the street runs on
    // hall: spice racks on the north wall, Naknik mixing tables, sacks
    putR(2, 1, 8, 1, 'R'); putR(11, 1, 18, 1, 'R');
    for (const [x, z] of [[4, 6], [9, 6], [14, 6], [4, 10], [14, 10]]) putR(x, z, x + 1, z, 'T');
    putR(18, 12, 19, 13, 'C'); putR(2, 13, 3, 13, 'C');
    // office: Dad's desk, lockers, the Kaasdows corner
    putR(24, 3, 26, 3, 'T'); putR(28, 1, 28, 3, 'F');
    // storeroom: stacked spice crates
    putR(23, 9, 23, 10, 'C'); putR(27, 9, 28, 9, 'C'); putR(26, 12, 26, 13, 'C');
    // red oil drums by each entrance (the trap: only the one you set stays)
    put(11, 13, 'X'); put(23, 13, 'X'); put(28, 12, 'X');
    // the Oofmobiel's spot on the street
    putR(2, 18, 6, 20, 'A');
  },
  furn: {},
  rackGoods: [0xe8a33d, 0xc2412d, 0xf2c14e],
  hallCells: [[7, 15], [8, 15], [9, 15], [10, 15], [24, 15], [25, 15], [26, 15], [30, 15], [31, 15], [0, 16], [0, 20], [32, 16], [32, 20]],
  doorSigns: {},
  neon: { hall: 0xffd8a0, office: 0xffe8c0, store: 0xe8f4ff, street: 0xf2c14e, alley: 0x9ad8ff },
  lights: [[6, 6, 0xffd8a0, 1.8], [14, 6, 0xffd8a0, 1.8], [10, 11, 0xffd8a0, 1.4], [25, 3.5, 0xffe8c0, 1.2], [25, 11, 0xe8f4ff, 1.2], [9, 18, 0xf2c14e, 1.4], [25, 18, 0xf2c14e, 1.4], [31, 8, 0x9ad8ff, 0.9]],
  mood: { bg: 0x0a0806, fogNear: 22, fogFar: 60, hemi: 0.4, sun: 0.5, wall: 0x6a5a48, cap: 0xd8c8a8, under: 0x2a241e },
  van: { park: [4.5, -2.6], rot: 0, from: -16, exit: [4, -4.6], solid: [1.6, 7.4, -3.75, -1.45] },
  start: [9, -9.5],               // world: inside the hall, behind the shutter
  bounds: [0.5, W - 0.4, -H, -0.6],
  validateFrom: [9, 16.5],
  spawns: [ // the attackers, by entrance (room tag): front, bay, side
    [7, 18, 'bat', Math.PI, 'front'], [9, 19, 'makarov', Math.PI, 'front'], [11, 18, 'bat', Math.PI, 'front'], [13, 19, 'makarov', Math.PI, 'front'], [8, 20, 'shotgun', Math.PI, 'front'],
    [24, 18, 'bat', Math.PI, 'bay'], [26, 19, 'makarov', Math.PI, 'bay'], [22, 18, 'bat', Math.PI, 'bay'], [27, 20, 'shotgun', Math.PI, 'bay'],
    [30.5, 6, 'bat', -Math.PI / 2, 'side'], [31, 9, 'makarov', -Math.PI / 2, 'side'], [30.5, 3, 'bat', -Math.PI / 2, 'side'],
  ],
  loot: [],
  text: {
    area: 'KAASLAND · THE WAREHOUSE',
    banner: ['SPICE WAR', 'They are coming for the warehouse.'],
    objective: 'Hold the warehouse. Stop every wave before they drag off your Naknikim.',
    objectiveOwned: 'The warehouse is safe. Drive... no, walk home: you are home.',
    objectiveCleared: '<b style="color:#6ed36e">The warehouse held.</b>',
    resultsTitle: 'THE WAREHOUSE HELD', resultsHint: '', ownedBanner: ['HOME', 'The warehouse is yours.'], bossDown: ['', ''],
    tips: ['Three ways in: the front shutter, the loading bay and the side door off the alley.', 'An oil drum by a door goes up when you shoot it.', 'The mixing tables are low: bullets fly over them.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, signTex, canvasTex, brand }) {
    // the shop front: the old EDDY & ZN sign over the shutter, neighbours on the street
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.1), new THREE.MeshBasicMaterial({ map: brand === 'eddys' ? signFace(canvasTex, 'eddys', 1024, 124, 'SPICE MASTER · SPECERIJEN') : signTex([{ t: 'EDDY & ZN · SPECERIJEN', size: 80 }], '#4a0a0a', '#e8a33d', 1024, 120) }));
    sign.position.set(OX + 9, 2.9, Z0 + 16.03); root.add(sign);
    for (let i = 0; i < 6; i++) { const c = [0x5a2a22, 0x3a3a44, 0x6a4a30][i % 3]; box(5.2, 6 + (i % 3), 4, lam({ color: c }), OX + 2.6 + i * 5.4, 3, Z0 + 23.5, root); }
    return { tick() {} };
  },
};
