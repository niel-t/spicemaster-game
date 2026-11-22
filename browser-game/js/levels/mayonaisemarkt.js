// Act 1, mission 4: Mayonaisemarkt (Oud-Vettenburg). Groothandel De Witte Klodder: a little shoarma shop on the market square that
// fronts the Lampas wholesale depot, a huge arched hall where their cheap stock comes in. Level data for the mission engine
// (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art (01_Act1_Mayonaisemarkt): market stalls
// with white canopies on a wet square, a narrow shop with a "Halal Shoarma" sign, and behind it an arched steel hall full of pallets,
// crates, pallet jacks, shelving and ladders.
// The twist: the open hall. Long sightlines and no walls: the pallet stacks are the only cover. The most spice crates of the act.
//   market → shop → hall (or the two open loading bays straight into the hall) · shop → mixing room → depot office (window onto the hall)

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';

const W = 46, H = 30;
const STACKS = [[14, 7], [20, 6], [27, 8], [34, 6], [40, 9], [15, 13], [23, 12], [31, 14], [38, 14], [13, 19], [27, 19], [41, 19]]; // 2x2 pallet stacks (top-left cell)

export default {
  id: 'mayonaisemarkt', name: 'Mayonaisemarkt', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['office', 1, 1, 9, 7, 'panel'], ['mixing', 1, 9, 9, 13, 'tiles'], ['shop', 1, 15, 9, 23, 'shoptile'],
    ['hall', 11, 1, 44, 23, 'depot'], ['market', 1, 25, 44, 29, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(4, 24, 5, 24);        // the shop door on the square (open)
    carve(20, 24, 23, 24); carve(34, 24, 37, 24); // two loading bays, roller doors up
    carve(0, 25, 0, 29); carve(45, 25, 45, 29);   // the square runs on
    putR(10, 18, 10, 19, 'D');  // shop ↔ hall
    putR(4, 14, 5, 14, 'D');    // shop ↔ mixing room
    putR(4, 8, 5, 8, 'D');      // mixing room ↔ office
    putR(10, 10, 10, 11, 'D');  // mixing room ↔ hall
    putR(1, 24, 3, 24, '%'); putR(6, 24, 9, 24, '%'); // shop windows
    putR(10, 2, 10, 5, '%');    // the depot office window onto the hall
    // shop
    putR(2, 17, 7, 17, 'K'); put(9, 15, 'F'); put(3, 21, 'T'); put(7, 21, 'T');
    // mixing room and office
    putR(1, 11, 3, 12, 'w'); put(9, 13, 'C'); putR(3, 3, 6, 3, 'O'); putR(1, 1, 1, 2, 'V'); put(9, 1, 'F'); putR(8, 6, 9, 7, 'S');
    // the hall: shelving along the back wall, pallet stacks, crates, barrels
    putR(13, 1, 20, 1, 'R'); putR(24, 1, 31, 1, 'R'); putR(35, 1, 42, 1, 'R');
    for (const [x, z] of STACKS) putR(x, z, x + 1, z + 1, 'C');
    put(44, 23, 'X'); put(11, 1, 'X'); put(30, 22, 'X'); putR(43, 4, 44, 4, 'C');
    // the market: stalls with canopies (low counters), lamps, bollards
    for (const x of [3, 11, 27, 41]) putR(x, 27, x + 2, 27, 'k');
    put(8, 29, 'l'); put(25, 29, 'l'); put(39, 29, 'l'); for (const x of [15, 31]) put(x, 25, 'o');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xc2412d }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    C: { h: 1.6, cover: true, draw: ({ THREE, box, lam, root, n, cz, x, z, OX }) => { // pallet stacks: a wooden pallet with boxes and wrapped mayo buckets
      box(n - 0.04, 0.14, 0.96, lam({ color: 0x8a6a3a }), OX + x + n / 2, 0.07, cz, root, false);
      for (let k = 0; k < n; k++) { const h = 1.2 + ((x + k + z) % 3) * 0.25; box(0.9, h, 0.9, lam({ color: [0x9a7a4a, 0xb08a52, 0xf3ecdc][(x + k + z) % 3] }), OX + x + k + 0.5, 0.14 + h / 2, cz, root); }
    } },
    R: { color: 0x3a3a3a },
  },
  rackGoods: [0xf3ecdc, 0xb08a52, 0xe8a33d],
  floors: {
    depot: (g) => { g.fillStyle = '#7a746a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#e8a33d'; g.fillRect(0, 0, 64, 2); },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#c2412d'; g.fillRect(x * 16, y * 16, 16, 16); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { depot: 4, shoptile: 1.2, panel: 1.5, cobble: 1.6 },
  hallCells: [[4, 24], [5, 24], [20, 24], [21, 24], [22, 24], [23, 24], [34, 24], [35, 24], [36, 24], [37, 24]],
  doorSigns: { '10,18': 'DEPOT', '4,8': 'KANTOOR' },
  neon: { office: 0xe8a33d, mixing: 0xf2c14e, shop: 0x6ad86a, hall: 0xffd8a0, market: 0xe8a33d },
  lights: [[5, 19, 0xf3e6c8, 1.5], [5, 4, 0xe8a33d, 1.5], [5, 11, 0xf2c14e, 1.1], [17, 6, 0xffe0b0, 1.6], [28, 5, 0xffe0b0, 1.6], [39, 6, 0xffe0b0, 1.6], [19, 16, 0xffe0b0, 1.6], [30, 17, 0xffe0b0, 1.6], [40, 17, 0xffe0b0, 1.6], [8, 27, 0xe8a33d, 1.0], [25, 27, 0xe8a33d, 1.0], [39, 27, 0xe8a33d, 1.0]],
  mood: { bg: 0x0c1018, fogNear: 34, fogFar: 84, hemi: 0.55, sun: 0.6, sky: 0xfff0dc, ground: 0x4a4038, wall: 0x5a4a40, cap: 0xd8ccb8, under: 0x3a3028 },
  van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] }, // world; across the square, nose first
  start: [5, -1],                // world: on the square in front of the shop
  bounds: [0.5, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [5, 26],         // cell: the square
  bossLook: { cap: 0xe8a33d, shirt: 0x2a4a2a, front: '#2a4a2a', pants: 0x2a2a2a, belly: 1.0, head: { hair: '#3a2a1a', brow: '#3a2a1a', hairLine: 50, iris: '#3a2a1a' } }, // the Depotbaas: hi-vis cap, green overall
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [9, 26.5, 'bat', Math.PI / 2, 'market'], [30, 26, 'makarov', -Math.PI / 2, 'market'],
    [4, 19.5, 'bat', Math.PI, 'shop'], [8, 22, 'makarov', -Math.PI / 2, 'shop'], [6, 10, 'bat', 0, 'mixing'], [6, 5.5, 'makarov', -Math.PI / 2, 'office'],
    [29, 11, 'shotgun', Math.PI, 'hall', true], [26, 11, 'shotgun', Math.PI, 'hall'], [32, 11, 'shotgun', Math.PI, 'hall'],
    [17, 4, 'makarov', 0, 'hall'], [24, 4, 'bat', Math.PI / 2, 'hall'], [37, 4, 'makarov', -Math.PI / 2, 'hall'], [43, 7, 'bat', -Math.PI / 2, 'hall'],
    [13, 10.5, 'bat', Math.PI / 2, 'hall'], [19, 10, 'makarov', Math.PI / 2, 'hall'], [36, 11, 'bat', -Math.PI / 2, 'hall'], [43, 13, 'makarov', -Math.PI / 2, 'hall'],
    [16, 17, 'makarov', Math.PI, 'hall'], [22, 21, 'bat', Math.PI, 'hall'], [32, 18, 'makarov', Math.PI, 'hall'], [39, 21, 'bat', -Math.PI / 2, 'hall'], [24, 16, 'bat', 0, 'hall'],
  ],
  loot: [[12.5, 3.5], [22.5, 2.5], [33.5, 2.5], [43.5, 2.5], [18.5, 9.5], [36.5, 9.5], [12, 22.5], [25.5, 22.5], [43.5, 21.5], [2.5, 4.5]], // cell
  text: {
    area: 'OUD-VETTENBURG · MAYONAISEMARKT',
    banner: ['DE WITTE KLODDER', 'Mayonaisemarkt. Where the Lampas\' cheap stock comes in.'],
    objective: 'Take <b>De Witte Klodder</b> and the Lampas depot behind it. The hall is wide open: <b>the pallet stacks are your only cover</b>. The Depotbaas and his two shotgun guards hold the middle. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Mayonaisemarkt is <b>yours</b>, depot and all. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Mayonaisemarkt is yours.</b> The depot is full of spice crates (E). Then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'MAYONAISEMARKT TAKEN',
    resultsHint: 'The Lampas lost their depot. Grab the spice crates (E): there are ten in here. Then drive home.',
    ownedBanner: ['MAYONAISEMARKT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE DEPOTBAAS IS DOWN', 'Delivery cancelled.'],
    tips: ['The loading bays lead straight into the hall. The shop is the quiet way in.', 'Pallet stacks stop bullets. Out in the open aisles, nothing does.', 'Ten spice crates in this depot. Worth the walk.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.cobble, 1.6); floorW(OX - 14, OX + W + 14, 2.6, 12, T.asphalt, 4);
    // canal houses round the square
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      for (let s = 0; s < 3; s++) box(w * (0.8 - s * 0.25), 0.9, d * 0.9, lam({ color: c }), x, h + 0.45 + s * 0.9, z, root, false);
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 3) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xf2c14e, 0xe8a33d, 0x2a3040][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 12; i++) house(OX - 12 + i * 6, 16, 5.8, 6, 9 + (i * 3) % 4, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i % 4], -1);
    for (let i = 0; i < 4; i++) house(OX - 4, Z0 + 4 + i * 7, 6, 6.8, 10 + (i % 2) * 2, [0x4a2a24, 0x6a3428, 0x5a3a30, 0x7a4430][i], 1);
    // the arched roof: steel trusses along the side walls (the roof itself is left off so the camera sees in)
    for (let x = 12; x <= 44; x += 4) for (const z of [0.6, 23.4]) box(0.25, 0.9, 0.5, lam({ color: 0x3a3e44 }), OX + x, WALL_H + 0.45, Z0 + z, root, false);
    // the shop front: green HALAL SHOARMA, a round sign; the depot sign over the loading bays
    sign('HALAL SHOARMA', 5, 0.55, '#0a140c', '#6ad86a', OX + 5, 2.7, Z0 + 24.02, 0, 60); neonRect(root, OX + 5, 2.7, 5.2, 0.7, Z0 + 24.06, 0x6ad86a);
    sign('DE WITTE KLODDER', 4, 0.32, '#1a0e08', '#f3e6c8', OX + 5, 2.15, Z0 + 24.03, 0, 34);
    sign('GROOTHANDEL LAMPAS · ALLES VERDUND', 12, 0.7, '#1a1a1a', '#e8a33d', OX + 29, 3.0, Z0 + 24.02, 0, 46);
    // pallet jacks and a ladder in the aisles
    for (const [x, z, r] of [[24.5, 16.5, 0.3], [35.5, 10, -0.5], [18, 21.5, 1.2]]) { const g = new THREE.Group(); g.position.set(OX + x, 0, Z0 + z); g.rotation.y = r; root.add(g); box(0.6, 0.12, 1.2, lam({ color: 0xc2412d }), 0, 0.1, 0, g, false); box(0.08, 1.0, 0.08, lam({ color: 0x1a1a1a }), 0, 0.6, -0.6, g, false); }
    // market stalls: white canopies over the counters
    for (const x of [3, 11, 27, 41]) {
      const can = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), lam({ side: THREE.DoubleSide, map: canvasTex(64, 32, (g) => { for (let i = 0; i < 64; i += 8) { g.fillStyle = (i / 8) % 2 ? '#f3ecdc' : '#d8d0c0'; g.fillRect(i, 0, 8, 32); } }) })); can.rotation.x = -Math.PI / 2; can.position.set(OX + x + 1.5, 2.4, Z0 + 27.5); root.add(can);
      for (const dx of [-1.4, 1.4]) box(0.06, 2.2, 0.06, lam({ color: 0x5a5a5a }), OX + x + 1.5 + dx, 1.1, Z0 + 27.5, root, false);
      for (let k = 0; k < 3; k++) box(0.5, 0.2, 0.4, lam({ color: [0xc2412d, 0xf2c14e, 0xa9c46a][(x + k) % 3] }), OX + x + 0.5 + k, 0.72, Z0 + 27.5, root, false);
    }
    const pl = []; for (let z = 25; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    for (let i = 0; i < 14; i++) pl.push([OX - 10 + Math.random() * (W + 20), 1 + Math.random() * 10, 0.4 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 25, OX + W + 12, 12]], 800));
    return { tick(dt) { for (const f of ticks) f(dt); } };
  },
};
