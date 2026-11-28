// The Blokaas hall at night (2026-11-28): Tristan wanted a heist where Eddy breaks into Blokaas Specijeren's warehouse in
// Almere and gathers their recipes and supplier details without being seen. Night only (a Nachtklus, js/heist.js), never a
// raid: Hans and Conny run the place day and night, unless Hans is out spotting planes or they are both out spying.
// Built after Tristan's photos: a blue corrugated shed with racks of big white bulk bags and pallets, a low office on the
// right where Hans keeps his paperwork in perfect order, and a kantine where Conny keeps her folder of complaints.
//   lot → side door → the hall (racks, bulk bags) → the office (recipes, suppliers) / the kantine (customers, orders)
//   lot → glass door → the kantine
// js/mission.js reads def.docs: where each folder lies (cell coords); opts.heist.docs says which ones are still there.

const W = 34, H = 22;

export default {
  id: 'blokaashal', name: 'Blokaas Specijeren', W, H, faction: 'BLOKAAS', factionName: 'Blokaas',
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['hal', 1, 1, 21, 14, 'concrete'], ['kantoor', 23, 1, 32, 7, 'parquet'], ['kantine', 23, 9, 32, 14, 'tiles'],
    ['lot', 1, 16, 32, 21, 'paving'],
  ],
  layout({ carve, put, putR }) {
    carve(0, 16, 0, 21); carve(33, 16, 33, 21); // the lot runs on past the level
    putR(17, 15, 18, 15, 'D');  // the side door into the hall (the roller door stays down at night)
    putR(29, 15, 30, 15, 'D');  // the glass front door into the kantine
    putR(22, 4, 22, 5, 'D');    // hall ↔ office
    putR(22, 11, 22, 12, 'D');  // hall ↔ kantine
    putR(27, 8, 28, 8, 'D');    // office ↔ kantine
    putR(24, 15, 27, 15, '%');  // the kantine windows onto the lot
    putR(31, 15, 32, 15, '%');
    // the hall: racks front to back, big bulk bags, pallets in the cross aisle
    for (const x of [3, 7, 11, 15]) { putR(x, 2, x, 6, 'R'); putR(x, 9, x, 12, 'R'); }
    put(19, 2, 'U'); put(20, 3, 'U'); put(19, 9, 'U'); put(20, 11, 'U'); put(5, 14, 'U'); put(13, 14, 'U'); put(1, 1, 'U');
    putR(9, 7, 9, 8, 'C'); putR(17, 7, 17, 8, 'C'); put(21, 14, 'X');
    // the office: two desks (his tidy, hers not), filing cabinets
    putR(25, 2, 26, 2, 'T'); putR(29, 2, 30, 2, 'T'); putR(32, 1, 32, 3, 'F'); put(23, 7, 'p');
    // the kantine: the koffiehoek, one table, the fridge
    putR(24, 9, 26, 9, 'w'); put(27, 12, 'T'); put(32, 9, 'F');
  },
  furn: {
    U: { h: 1.25, cover: true, draw: ({ box, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { box(0.92, 1.15, 0.92, lam({ color: 0xf4f2ec }), OX + x + k + 0.5, 0.62, cz, root); box(0.96, 0.06, 0.96, lam({ color: 0x8aa0c8 }), OX + x + k + 0.5, 1.2, cz, root, false); box(0.9, 0.12, 0.9, lam({ color: 0xb8925a }), OX + x + k + 0.5, 0.06, cz, root, false); } } },
    R: { color: 0x2a5aa0 },
  },
  rackGoods: [0xf4f2ec, 0xe8d8b8, 0xd8c8a8],
  floorRep: { concrete: 3, parquet: 1.4, tiles: 1.2, paving: 1.6 },
  hallCells: [[17, 15], [18, 15], [29, 15], [30, 15]],
  doorSigns: { '17,15': 'PERSONEEL', '22,4': 'KANTOOR', '22,11': 'KANTINE' },
  neon: { hal: 0x8a9aa8, kantoor: 0xf2e6c0, kantine: 0xe8d8b0, lot: 0x3a3a40 },
  lights: [[6, 4, 0x8a9aa8, 0.45], [14, 11, 0x8a9aa8, 0.45], [28, 4, 0xf2e6c0, 1.0], [27, 12, 0xe8d8b0, 0.55], [17, 18, 0xd8c8a0, 0.9], [29, 19, 0xd8c8a0, 0.6]],
  mood: { bg: 0x07080c, fogNear: 26, fogFar: 64, hemi: 0.26, sun: 0.2, sky: 0x8a96b0, ground: 0x202428, wall: 0x3a5a8a, cap: 0xc8ccd0, under: 0x2a2a2a },
  van: { park: [8, 4.6], rot: Math.PI, from: W + 14, exit: [8.6, 3.0], solid: [4.7, 10.8, 3.45, 5.75] }, // world: on the lot, lights off
  start: [12, -0.7],             // world: on the lot outside the side door
  bounds: [0.5, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [12, 20.5],      // cell: the lot
  // the folders (cell coords): opts.heist.docs picks which are still there tonight
  docs: { recepten: [30.5, 3.5], leveranciers: [31.5, 5.5], klanten: [24.5, 4.5], bestellingen: [24.5, 13.5], logboek: [20.5, 13.5] },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, type
    [28, 4.5, 'fists', Math.PI / 2, 'kantoor', false, 'hans'],
    [10.5, 7.5, 'fists', 0, 'hal', false, 'conny'],
  ],
  story: [
    { k: 'board', at: [27.5, 1.5], wall: 'n', title: 'ROOSTER', lines: ['06:00 hal openen', '06:02 koffie (1 kop)', '10:00 koffie (1 kop)', '12:30 boterham', 'di/do: Eddy kijken', 'za: vliegtuigen'], read: ['ROOSTER', "Hans's schedule, to the minute. Tuesday and Thursday: \"Eddy kijken\". Saturday: \"vliegtuigen\". The coffee is rationed to one cup at a time."] },
    { k: 'board', at: [24.5, 9.5], wall: 'n', style: 'chalk', title: 'KOFFIEPOT', lines: ['Hans: 0,40', 'Conny: 0,40', 'Personeel: 0,60', '(melk +0,05)'], read: ['KOFFIEPOT', 'The staff pay more for their coffee than the owners. Milk is five cents extra.'] },
    { k: 'papers', at: [12.5, 7.5], read: ['KLACHTBRIEF', 'Draft letter from Conny to the gemeente Almere: "Wij worden al dertig jaar benadeeld." It is four pages. Page three is about her sister.'] },
    { k: 'cups', at: [25.5, 2.5], y: 0.79 },
    { k: 'sacks', at: [6.5, 7.5] },
  ],
  loot: [[2.5, 13.5], [19.5, 6.5], [13.5, 1.5]], // cell: sacks of fenegriek
  text: {
    area: 'ALMERE · BLOKAAS SPECIJEREN',
    banner: ['BLOKAAS SPECIJEREN', 'Almere, two in the morning. The lights are on in the office.'],
    objective: 'Get their <b>paperwork</b> out without being seen.',
    objectiveOwned: 'Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: 'Drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'BLOKAAS SPECIJEREN',
    resultsHint: 'Back to the Oofmobiel.',
    ownedBanner: ['BLOKAAS SPECIJEREN', 'Back to the Oofmobiel.'],
    bossDown: ['', ''],
    tips: ['Hans sits in the office and counts. Conny walks the hall and complains to nobody.', 'The racks block sight both ways.', 'Paperwork is light: it never fills your bag.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, floorW, T, signTex }) {
    floorW(OX - 14, OX + W + 14, 0, 9, T.paving, 1.6); // the paved lot runs on outside
    for (let x = OX - 12; x < OX + W + 12; x += 2.5) box(0.06, 1.8, 0.06, lam({ color: 0x5a6a5a }), x, 0.9, 8.6, root, false); // the fence at the road
    const s = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 1.3), lam({ map: signTex([{ t: 'BLOKAAS', size: 64 }, { t: 'specijeren · groothandel · Almere', size: 22 }], '#ffffff', '#1a3a7a', 512, 120) }));
    s.position.set(OX + 8, 3.4, Z0 + 15.02 + 1); s.rotation.y = 0; root.add(s);
    return {};
  },
};
