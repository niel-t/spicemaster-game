// Mission 1: Spekbuurt. Snackpaleis Spekbuurt, a Lampas shoarma joint with a back of house full of enemies.
// Level data for the mission engine (js/mission.js). Grid cells are 1 m; cell (x, z) covers world
// [OX + x, OX + x + 1] × [Z0 + z, Z0 + z + 1] with Z0 = -H, so the building front sits on world z = 0 and the street lies south of it.
// Positions marked "world" use x relative to OX and absolute world z; everything else is in cells.
//
// Rooms connect in loops (Neon Vice style), so there is always more than one way in:
//   restaurant → lounge → gambling room → landing → office / back corridor
//   restaurant → landing → back corridor → gym / warehouse → garage → mixing room → restaurant

const W = 46, H = 26;

export default {
  id: 'spekbuurt', name: 'Spekbuurt', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['gambling', 1, 1, 14, 10, 'casino'], ['office', 16, 1, 24, 7, 'parquet'], ['gym', 26, 1, 32, 8, 'rubber'], ['warehouse', 34, 1, 44, 12, 'concrete'],
    ['landing', 16, 9, 24, 13, 'hall'], ['corridor', 26, 10, 32, 13, 'hall'],
    ['lounge', 1, 12, 9, 24, 'shag'], ['restaurant', 11, 15, 24, 24, 'checker'], ['mixing', 26, 15, 32, 24, 'tiles'], ['garage', 34, 14, 44, 24, 'garage'],
  ],
  layout({ carve, put, putR }) {
    // doors (2 cells wide, swing doors are added on every D run)
    putR(4, 11, 5, 11, 'D');   // gambling ↔ lounge
    putR(15, 9, 15, 10, 'D');  // gambling ↔ landing
    putR(19, 8, 20, 8, 'D');   // landing ↔ office
    putR(19, 14, 20, 14, 'D'); // restaurant ↔ landing (PERSONEEL)
    putR(25, 11, 25, 12, 'D'); // landing ↔ corridor
    putR(29, 9, 30, 9, 'D');   // corridor ↔ gym
    putR(33, 11, 33, 12, 'D'); // corridor ↔ warehouse
    putR(29, 14, 30, 14, 'D'); // corridor ↔ mixing room
    putR(10, 20, 10, 21, 'D'); // lounge ↔ restaurant
    putR(25, 22, 25, 23, 'D'); // restaurant ↔ mixing room (behind the counter)
    putR(33, 18, 33, 19, 'D'); // mixing room ↔ garage
    carve(37, 13, 41, 13);     // warehouse ↔ garage: wide open loading bay (no door)
    carve(18, 25, 19, 25);     // the front door of the snackbar (open)
    // glass: storefront, office window onto the gambling room, gym window onto the corridor
    putR(11, 25, 17, 25, '%'); putR(20, 25, 24, 25, '%');
    putR(15, 2, 15, 6, '%');
    putR(26, 9, 28, 9, '%'); putR(31, 9, 32, 9, '%');
    // pillars in the landing (cover in the middle of the room)
    put(18, 11, '#'); put(21, 11, '#');
    // furniture (see the legend in mission.js)
    putR(13, 17, 18, 17, 'K'); put(14, 15, 'F'); putR(24, 15, 24, 16, 'F');                       // restaurant: counter, döner, drinks fridge
    putR(13, 20, 14, 21, 'T'); putR(16, 20, 17, 21, 'T'); putR(21, 20, 22, 21, 'T'); putR(13, 23, 14, 23, 'T'); putR(22, 23, 23, 23, 'T');
    put(11, 24, 'p'); put(24, 24, 'p');
    putR(2, 18, 5, 18, 'S'); putR(3, 20, 4, 20, 'T'); putR(7, 12, 8, 12, 'F'); putR(8, 15, 9, 16, 'Q'); putR(1, 23, 4, 24, 'S'); put(9, 24, 'p'); // lounge
    putR(3, 3, 4, 4, 'c'); putR(8, 3, 9, 4, 'c'); putR(8, 7, 9, 8, 'c'); putR(2, 7, 3, 9, 'P');          // gambling: card tables, pool table
    putR(1, 1, 1, 5, 'M'); putR(12, 2, 12, 6, 'B'); put(14, 1, 'F');                                    // slot machines, bar, fridge
    putR(18, 3, 21, 3, 'O'); putR(23, 1, 24, 1, 'V'); putR(16, 1, 16, 1, 'F'); put(24, 7, 'p');          // office
    put(23, 9, 'F'); put(24, 9, 'F'); put(16, 13, 'p');                                                  // landing: vending machines
    putR(27, 13, 28, 13, 'C'); put(31, 10, 'C');                                                         // corridor crates
    putR(27, 3, 28, 3, 'G'); putR(30, 3, 31, 3, 'G'); put(29, 6, 'b'); putR(32, 1, 32, 2, 'C');           // gym
    putR(36, 2, 36, 8, 'R'); putR(39, 2, 39, 8, 'R'); putR(42, 2, 42, 8, 'R'); putR(43, 11, 44, 12, 'C'); put(35, 10, 'C'); // warehouse
    putR(28, 18, 30, 19, 'w'); putR(31, 23, 32, 24, 'C'); put(32, 15, 'F'); put(26, 24, 'C');            // mixing room
    putR(36, 17, 37, 20, 'A'); putR(41, 17, 42, 20, 'A'); putR(44, 15, 44, 17, 'w'); put(35, 23, 'X'); put(44, 23, 'X'); put(34, 15, 'X'); // garage
    put(44, 1, 'X'); put(13, 10, 'X');
  },
  hallCells: [[18, 25], [19, 25], [37, 13], [38, 13], [39, 13], [40, 13], [41, 13]], // doorway floor besides the D cells
  doorSigns: { '19,14': 'PERSONEEL' },
  neon: { gambling: 0x3ff0ff, office: 0xffd23a, gym: 0x7dff9a, warehouse: 0xffd8a0, landing: 0xff3fa4, corridor: 0x3ff0ff, lounge: 0xff7a1a, restaurant: 0xff3fa4, mixing: 0x3ff0ff, garage: 0xffd23a },
  lights: [[18, 20, 0xff9a6a, 2.2], [20, 11, 0xff3fa4, 1.6], [7, 6, 0x3ff0ff, 1.8], [39, 7, 0xffd8a0, 2.0], [5, 18, 0xff7a1a, 1.3], [39, 19, 0xffd23a, 1.3]],
  mood: { bg: 0x1a0e2a, fogNear: 30, fogFar: 70, hemi: 0.55, sun: 0.9, wall: 0x2c2238, cap: 0xf2e6f4, under: 0x554466 },
  van: { park: [12, 4.6], from: 44, exit: [12.8, 3.0], solid: [8.9, 15.2, 3.45, 5.75] }, // world
  start: [19, 2.2],              // world: where Eddy stands after the drive in (and on a restart)
  bounds: [-6, W + 6, -H, 10],   // world: x0, x1, z0, z1
  validateFrom: [18.5, 24.5],    // cell: the front door
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [13, 19, 'bat', Math.PI, 'restaurant'], [22, 18, 'makarov', 0, 'restaurant'], [16, 15.6, 'makarov', 0, 'restaurant'], [23, 22, 'bat', -Math.PI / 2, 'restaurant'],
    [5, 15, 'makarov', Math.PI / 2, 'lounge'], [3, 21.5, 'bat', 0, 'lounge'], [7, 22, null, -Math.PI / 2, 'lounge'],
    [6, 5.5, 'makarov', Math.PI / 2, 'gambling'], [10.5, 6, 'bat', -Math.PI / 2, 'gambling'], [13.5, 3.5, 'makarov', -Math.PI / 2, 'gambling'], [5.5, 9, 'bat', Math.PI, 'gambling'],
    [19.5, 2, 'shotgun', 0, 'office', true], [22.5, 5.5, 'makarov', -Math.PI / 2, 'office'],
    [20, 10, 'bat', Math.PI / 2, 'landing'], [17, 12.5, 'makarov', Math.PI / 2, 'landing'],
    [28.5, 5.5, 'bat', Math.PI, 'gym'], [31, 6.5, null, -Math.PI / 2, 'gym'],
    [31.5, 12.5, 'bat', -Math.PI / 2, 'corridor'],
    [37.5, 4.5, 'makarov', 0, 'warehouse'], [40.5, 9.5, 'shotgun', Math.PI, 'warehouse'], [43.5, 3.5, 'bat', -Math.PI / 2, 'warehouse'],
    [27.5, 21.5, 'bat', Math.PI / 2, 'mixing'], [31, 16.5, 'makarov', 0, 'mixing'],
    [39.5, 22.5, 'makarov', Math.PI, 'garage'], [43.5, 20, 'bat', -Math.PI / 2, 'garage'],
  ],
  loot: [[37.5, 7.5], [38.5, 3.5], [40.5, 5.5], [43.5, 7.5], [22.5, 2.5], [27.5, 23.5]], // cell
  text: {
    area: 'KAASLAND · SPEKBUURT',
    banner: ['SNACKPALEIS SPEKBUURT', 'Lampas territory.'],
    objective: 'Take <b>Snackpaleis Spekbuurt</b> from the Lampas. Clear the restaurant, then the back of house. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Spekbuurt is <b>yours</b>. Shop setup comes in a later build. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Spekbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'SPEKBUURT UNLOCKED',
    resultsHint: 'The Lampas are out of Spekbuurt. Grab the spice crates (E), then drive home. You\'ll set up shop here later.',
    ownedBanner: ['SPEKBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE MANAGER IS DOWN', 'Jan van Kaas won\'t like this.'],
    tips: ['There is always another way round. The restaurant, the lounge and the garage all connect.'],
  },
  // the unique props: street, neighbours, shop front, döner, portrait, mixing bowl, garage cars, card tables
  decorate({ THREE, root, OX, Z0, box, cyl, lam, solid, floorW, T, WALL_H, neonRect, signTex, canvasTex, car }) {
    // street, pavement, neighbours
    floorW(OX - 10, OX + 58, 2.6, 12, T.asphalt, 4); floorW(OX - 10, OX + 58, 0, 2.6, T.paving, 1.5);
    for (let x = -8; x < 58; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 7.3, root, false);
    for (const [x0, x1, c] of [[-10, 0, 0x2a3a5a], [W, W + 12, 0x3a2a4a]]) { box(x1 - x0, 7, 26, lam({ color: c }), OX + (x0 + x1) / 2, 3.5, -13, root); solid(OX + x0, OX + x1, -26, 0); }
    // card tables and the pool table felt in the gambling room
    for (const [x, z] of [[3, 3], [8, 3], [8, 7]]) { cyl(0.95, 0.95, 0.06, lam({ color: 0x1f6a3a }), OX + x + 1, 0.78, Z0 + z + 1, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + x + 1, 0.37, Z0 + z + 1, root); }
    box(1.8, 0.08, 2.8, lam({ color: 0x1a7a3a }), OX + 3, 0.86, Z0 + 8.5, root, false);
    // the restaurant front
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SNACKPALEIS SPEKBUURT', size: 90 }, { t: 'EIGENDOM VAN DE LAMPAS', size: 38, color: '#ffffff' }], '#1a0a10', '#ff7a1a', 1024, 150) }));
    sign.position.set(OX + 18.5, 2.75, 0.02); root.add(sign); neonRect(root, OX + 18.5, 2.75, 9.2, 1.25, 0.06, 0xff7a1a);
    box(14, 0.12, 1.2, lam({ color: 0xff7a1a }), OX + 18, 2.15, 0.6, root, false); // awning edge
    const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 14.5, 2.35, Z0 + 15.5); root.add(doner);
    const menu = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.9), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'LAMPAS SHOARMA  W 5', size: 30 }, { t: 'Lampas spice: 100% echt*', size: 24, color: '#ffffff' }], '#1a0a10', '#3ff0ff', 512, 128) }));
    menu.rotation.x = -Math.PI / 2; menu.position.set(OX + 16.5, WALL_H + 0.08, Z0 + 14.5); root.add(menu);
    const rollT = canvasTex(64, 64, (g) => { for (let y = 0; y < 64; y += 6) { g.fillStyle = y % 12 ? '#8a8a86' : '#6a6a66'; g.fillRect(0, y, 64, 6); } });
    const roll = new THREE.Mesh(new THREE.PlaneGeometry(9, WALL_H), lam({ map: rollT })); roll.position.set(OX + 39.5, WALL_H / 2, 0.03); root.add(roll);
    const jvk = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8b040'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2a1a1a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(64, 44, 22, 0, 7); g.fill(); g.fillStyle = '#ff7a1a'; g.fillRect(36, 66, 56, 24); g.fillStyle = '#ffd36b'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText('JAN VAN KAAS', 64, 88); }) }));
    jvk.position.set(OX + 20, 1.7, Z0 + 1.02); root.add(jvk);
    const spice = cyl(0.42, 0.42, 0.05, lam({ color: 0xd8742a }), OX + 29.5, 1.02, Z0 + 19, root, 16); // the mixing bowl
    // cars in the garage (their cells are 'A' in the grid)
    car(OX + 37, Z0 + 19, 0xff7a1a, Math.PI / 2, false, 5); car(OX + 42, Z0 + 19, 0x1a1a1a, Math.PI / 2, false, 0);
    return { tick(dt) { doner.rotation.y += dt * 0.8; spice.rotation.y += dt; } };
  },
};
