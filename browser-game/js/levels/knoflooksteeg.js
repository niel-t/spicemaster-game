// Act 1, mission 3: Knoflooksteeg (Oud-Vettenburg). Afhaalluik De Knoflookbol, a takeaway hatch in a narrow alley, and the
// Lampas gambling dens hidden in the back alley behind it. Level data for the mission engine (js/mission.js); see spekbuurt.js for
// the coordinate conventions. Built after the concept art (01_Act1_Knoflooksteeg): a dark street of canal houses, a hatch under a
// striped awning with a döner, and behind the wall a cluttered back alley (cables, bins, crates) that links three dens: a poker
// room under a spade sign, a smoky card room, and a bar.
// The twist: the dark alley. It is outdoors and almost unlit; only the den signs glow. Gunfire carries, so the quiet way
// (the Maboota, thrown weapons, swing doors) keeps the other dens from hearing you.
//   street → hatch shop → kitchen → back alley → poker room / card room / yard → bar → mixing room
//   street → alley gate → back alley · street → CAFÉ door → bar

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';

const W = 40, H = 28;

export default {
  id: 'knoflooksteeg', name: 'Knoflooksteeg', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['storage', 1, 1, 7, 10, 'concrete'], ['kitchen', 1, 12, 7, 17, 'tiles'], ['shop', 1, 19, 7, 24, 'shoptile'],
    ['alley', 9, 1, 13, 24, 'cobble'], ['yard', 15, 12, 26, 15, 'cobble'],
    ['poker', 15, 1, 26, 10, 'felt'], ['cards', 15, 17, 26, 24, 'wood'],
    ['bar', 28, 1, 38, 15, 'wood'], ['mixing', 28, 17, 38, 24, 'tiles'],
    ['street', 1, 26, 38, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    // doors and openings
    carve(5, 25, 6, 25);        // the shop door next to the hatch (open)
    carve(10, 25, 12, 25);      // the alley gate onto the street
    carve(14, 12, 14, 15);      // the back alley runs on into the yard
    carve(0, 26, 0, 27); carve(39, 26, 39, 27); // the street runs on past the level
    putR(3, 18, 4, 18, 'D');    // shop ↔ kitchen
    putR(3, 11, 4, 11, 'D');    // kitchen ↔ storage
    putR(8, 14, 8, 15, 'D');    // kitchen ↔ back alley
    putR(8, 4, 8, 5, 'D');      // storage ↔ back alley
    putR(14, 5, 14, 6, 'D');    // back alley ↔ poker room
    putR(20, 11, 21, 11, 'D');  // yard ↔ poker room
    putR(20, 16, 21, 16, 'D');  // yard ↔ card room
    putR(14, 21, 14, 22, 'D');  // back alley ↔ card room
    putR(27, 13, 27, 14, 'D');  // yard ↔ bar
    putR(27, 4, 27, 5, 'D');    // poker room ↔ bar
    putR(27, 20, 27, 21, 'D');  // card room ↔ mixing room
    putR(33, 16, 34, 16, 'D');  // bar ↔ mixing room
    putR(35, 25, 36, 25, 'D');  // the CAFÉ door onto the street
    // glass: the hatch window, the café windows
    putR(1, 25, 3, 25, '%'); putR(29, 25, 33, 25, '%');
    // shop: the hatch counter, a fridge; kitchen: steel table, a fridge; storage: racks and crates
    putR(1, 23, 3, 23, 'K'); put(7, 19, 'F'); put(1, 19, 'p');
    putR(2, 14, 5, 14, 'w'); put(1, 12, 'F'); put(7, 17, 'C');
    putR(2, 3, 6, 3, 'R'); putR(2, 7, 6, 7, 'R'); putR(6, 9, 7, 10, 'C'); put(1, 10, 'X');
    // the back alley: bins, crates, pallets (cover in the dark)
    put(9, 2, 'j'); putR(12, 2, 13, 2, 'C'); put(13, 8, 'j'); put(9, 10, 'C'); put(9, 12, 'j'); put(13, 18, 'j'); putR(9, 19, 9, 20, 'C'); put(13, 23, 'X'); put(12, 13, 'j');
    // yard: crates, a barrel, bins
    putR(17, 13, 18, 13, 'C'); put(25, 12, 'X'); put(23, 15, 'j');
    // poker room: three card tables, a bar shelf, a sofa
    putR(17, 3, 18, 4, 'c'); putR(23, 3, 24, 4, 'c'); putR(20, 7, 21, 8, 'c'); putR(15, 9, 15, 10, 'B'); putR(25, 8, 26, 9, 'S');
    // card room: two card tables in the smoke, slot machines, a sofa
    putR(17, 19, 18, 20, 'c'); putR(23, 19, 24, 20, 'c'); putR(26, 22, 26, 24, 'M'); putR(15, 24, 17, 24, 'S');
    // bar: the long bar, a pool table, tables, a jukebox
    putR(29, 3, 35, 3, 'B'); putR(32, 8, 33, 10, 'P'); put(29, 12, 'T'); put(36, 12, 'T'); put(37, 7, 'T'); put(38, 1, 'Q'); put(28, 15, 'p');
    // mixing room
    putR(31, 19, 34, 20, 'w'); putR(37, 23, 38, 24, 'C'); put(28, 17, 'F');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x7a2e1a }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    B: { color: 0x5a3018 },
    S: { color: 0x6a2a1a },
    j: { h: 1.1, cover: true, draw: ({ box, cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { box(0.8, 1.05, 0.75, lam({ color: [0x2a4a2a, 0x3a3a3a, 0x5a3a1a][(x + k) % 3] }), OX + x + k + 0.5, 0.52, cz, root); box(0.86, 0.06, 0.8, lam({ color: 0x1a1a1a }), OX + x + k + 0.5, 1.07, cz, root, false); } } }, // wheelie bins
  },
  rackGoods: [0xf3e6c8, 0xe8a33d, 0x7a2e1a],
  floors: {
    cobble: (g) => { g.fillStyle = '#26282c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#3a3836', '#44403c', '#34322e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
    felt: (g) => { g.fillStyle = '#3a1a14'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#7a2e1a'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 6); g.lineTo(58, 32); g.lineTo(32, 58); g.lineTo(6, 32); g.closePath(); g.stroke(); },
    wood: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#4a3020', '#5a3a24', '#3e281a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 7) % 64, y, 1, 8); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#7a2e1a'; g.fillRect(x * 16, y * 16, 16, 16); } },
  },
  floorRep: { cobble: 1.6, felt: 2.2, wood: 1.5, shoptile: 1.2 },
  hallCells: [[5, 25], [6, 25], [10, 25], [11, 25], [12, 25], [14, 12], [14, 13], [14, 14], [14, 15]],
  doorSigns: { '35,25': 'CAFÉ', '14,5': '♠', '8,14': 'KEUKEN' },
  neon: { storage: 0x8a6a4a, kitchen: 0xf2c14e, shop: 0xe8862c, alley: 0x3a3028, yard: 0x3a3028, poker: 0xc2412d, cards: 0xa9c46a, bar: 0xe8a33d, mixing: 0xf2c14e, street: 0x3a3028 },
  lights: [[4, 21, 0xe8862c, 1.6], [4, 15, 0xf2c14e, 1.0], [4, 5, 0x8a6a4a, 0.7], [20.5, 5, 0xc2412d, 1.8], [20.5, 20, 0xa9c46a, 1.5], [32, 6, 0xe8a33d, 1.7], [33, 12, 0xe8a33d, 1.0], [33, 20, 0xf2c14e, 1.2], [11, 6, 0xc2412d, 0.45], [11, 21, 0xa9c46a, 0.4], [21, 13.5, 0xe8a33d, 0.5], [3, 27, 0xe8862c, 1.0], [34, 27, 0xe8a33d, 1.0]],
  mood: { bg: 0x07080c, fogNear: 26, fogFar: 64, hemi: 0.28, sun: 0.22, sky: 0xd8c8b8, ground: 0x2a2420, wall: 0x4a2a20, cap: 0xc8b8a0, under: 0x2a2018 },
  van: { park: [16, 4.6], rot: Math.PI, from: W + 14, exit: [16.6, 3.0], solid: [12.7, 18.8, 3.45, 5.75] }, // world; down the street, nose first
  start: [6, -0.7],              // world: on the street outside the hatch
  bounds: [0.5, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [6, 26.5],       // cell: the street
  bossLook: { cap: 0x1a1a1a, shirt: 0x7a2e1a, front: '#7a2e1a', pants: 0x1a1a1a, belly: 0.5, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 44, iris: '#2a2a2a' } }, // De Kaartgever: dark red waistcoat
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [8, 26.5, 'bat', 0, 'street'], [24, 26.5, 'makarov', -Math.PI / 2, 'street'],
    [3, 21.5, 'bat', Math.PI, 'shop'], [5, 15.5, 'makarov', Math.PI / 2, 'kitchen'], [4, 5, 'bat', 0, 'storage'],
    [11, 4, 'bat', Math.PI, 'alley'], [10.5, 15.5, 'makarov', 0, 'alley'], [12, 21, 'bat', Math.PI, 'alley'], [20, 14, 'makarov', Math.PI / 2, 'yard'],
    [20.5, 3, 'shotgun', 0, 'poker', true], [16.5, 6, 'makarov', Math.PI / 2, 'poker'], [24, 6.5, 'bat', -Math.PI / 2, 'poker'], [19, 9.5, 'makarov', Math.PI, 'poker'],
    [16, 19, 'bat', Math.PI / 2, 'cards'], [21, 21.5, 'makarov', Math.PI, 'cards'], [25, 18, 'bat', -Math.PI / 2, 'cards'],
    [32, 1.8, 'makarov', 0, 'bar'], [30, 7, 'bat', Math.PI / 2, 'bar'], [35.5, 9, 'makarov', -Math.PI / 2, 'bar'], [30.5, 13.5, 'bat', 0, 'bar'], [37, 4.5, 'shotgun', -Math.PI / 2, 'bar'],
    [29.5, 22.5, 'bat', Math.PI / 2, 'mixing'], [36, 18.5, 'makarov', -Math.PI / 2, 'mixing'],
  ],
  loot: [[2.5, 9.5], [7.5, 2.5], [25.5, 1.5], [15.5, 18], [38, 14.5], [36.5, 22.5]], // cell
  text: {
    area: 'OUD-VETTENBURG · KNOFLOOKSTEEG',
    banner: ['DE KNOFLOOKBOL', 'Knoflooksteeg. Dark alley, three dens, one card shark.'],
    objective: 'Take <b>De Knoflookbol</b> and the dens behind it. The back alley is dark and <b>gunfire carries</b>: go quiet and the other dens won\'t hear you. De Kaartgever deals in the poker room. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Knoflooksteeg is <b>yours</b>. The dens are shut. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Knoflooksteeg is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KNOFLOOKSTEEG TAKEN',
    resultsHint: 'The cards are on the floor and the alley is quiet. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KNOFLOOKSTEEG IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['DE KAARTGEVER IS DOWN', 'He should have folded.'],
    tips: ['Four ways in: the hatch shop, the alley gate, the café door, and the kitchen door into the alley.', 'Shots in the alley bring every den running. The Maboota is silent.', 'Bins and crates in the alley stop bullets. Card tables and sofas don\'t.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the narrow street and the canal houses across it
    floorW(OX - 14, OX + W + 14, 0, 7.6, T.cobble, 1.6);
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      for (let s = 0; s < 3; s++) box(w * (0.8 - s * 0.25), 0.9, d * 0.9, lam({ color: c }), x, h + 0.45 + s * 0.9, z, root, false);
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 4 === 1) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xe8a33d, 0xf2c14e][(k + r) % 2] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 11; i++) house(OX - 12 + i * 6, 11, 5.8, 6, 10 + (i * 3) % 4, [0x4a2a24, 0x3a2420, 0x5a3428, 0x42302a][i % 4], -1);
    box(10, 9, H - 2, lam({ color: 0x3a2420 }), OX - 5, 4.5, Z0 + H / 2 - 1, root); box(10, 9, H - 2, lam({ color: 0x42302a }), OX + W + 5, 4.5, Z0 + H / 2 - 1, root);
    // the hatch: a striped awning, a döner in the window, the name board
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.3), lam({ side: THREE.DoubleSide, map: canvasTex(64, 16, (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = (x / 8) % 2 ? '#f3e6c8' : '#7a2e1a'; g.fillRect(x, 0, 8, 16); } }) }));
    awn.rotation.x = -Math.PI / 3; awn.position.set(OX + 3.4, 2.5, Z0 + 25.55); root.add(awn);
    sign('DE KNOFLOOKBOL', 4.2, 0.5, '#1a0e08', '#e8a33d', OX + 3.4, 3.1, Z0 + 25.02, 0, 60); neonRect(root, OX + 3.4, 3.1, 4.4, 0.62, Z0 + 25.06, 0xe8a33d);
    const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.9, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 2.5, 1.6, Z0 + 24.3); root.add(doner);
    const hatchGlow = glowSprite(THREE, 0xe8862c, 4, 2.5, 0.5); hatchGlow.position.set(OX + 2.5, 1.5, Z0 + 25.6); root.add(hatchGlow);
    // the alley gate: a rusty fence frame; the café front
    for (const x of [9.9, 13.1]) box(0.12, 2.6, 0.12, lam({ color: 0x3a2a24 }), OX + x, 1.3, Z0 + 25.5, root, false);
    box(3.3, 0.12, 0.12, lam({ color: 0x3a2a24 }), OX + 11.5, 2.6, Z0 + 25.5, root, false);
    sign('CAFÉ DE AAS', 3.4, 0.55, '#120a06', '#f2c14e', OX + 32, 2.7, Z0 + 25.02, 0, 60); neonRect(root, OX + 32, 2.7, 3.6, 0.68, Z0 + 25.06, 0xf2c14e);
    // den signs glowing into the dark alley: the spade over the poker room door, the cards sign
    const spade = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(64, 64, (g) => { g.fillStyle = '#c2412d'; g.font = '900 60px Arial'; g.textAlign = 'center'; g.fillText('♠', 32, 54); }) }));
    spade.position.set(OX + 14 - 0.05, 2.6, Z0 + 5.5); spade.rotation.y = -Math.PI / 2; root.add(spade);
    const spadeGlow = glowSprite(THREE, 0xc2412d, 3.2, 3.2, 0.55); spadeGlow.position.set(OX + 13.2, 2.4, Z0 + 5.5); root.add(spadeGlow);
    const cardGlow = glowSprite(THREE, 0xa9c46a, 2.6, 2.6, 0.4); cardGlow.position.set(OX + 13.2, 2.2, Z0 + 21.5); root.add(cardGlow);
    sign('KAARTEN', 1.6, 0.4, '#0a120a', '#a9c46a', OX + 13.95, 2.6, Z0 + 21.5, -Math.PI / 2, 40);
    // cables strung across the alley, a single bare bulb
    const cableM = lam({ color: 0x141414 });
    for (const z of [3, 7.5, 11, 16, 20.5]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 5.6, 4), cableM); c.rotation.z = Math.PI / 2; c.rotation.y = (z % 2) * 0.2; c.position.set(OX + 11.5, WALL_H + 0.4 - (z % 3) * 0.15, Z0 + z); root.add(c); }
    const bulb = glowSprite(THREE, 0xffd8a0, 1.4, 1.4, 0.6); bulb.position.set(OX + 11.5, WALL_H, Z0 + 11); root.add(bulb);
    // card tables (round green tops, chips, cards) in the poker room and the card room
    for (const [x, z] of [[17, 3], [23, 3], [20, 7], [17, 19], [23, 19]]) {
      cyl(0.95, 0.95, 0.06, lam({ color: 0x2a5a2a }), OX + x + 1, 0.78, Z0 + z + 1, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + x + 1, 0.37, Z0 + z + 1, root);
      for (let k = 0; k < 5; k++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.17), new THREE.MeshBasicMaterial({ color: k % 2 ? 0xf3e6c8 : 0xc2412d })); c.rotation.x = -Math.PI / 2; c.rotation.z = k + x; c.position.set(OX + x + 1 + Math.cos(k) * 0.5, 0.82, Z0 + z + 1 + Math.sin(k) * 0.5); root.add(c); }
      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.3, 14, 1, true), lam({ color: 0x2a2a20, side: THREE.DoubleSide })); shade.position.set(OX + x + 1, 2.05, Z0 + z + 1); root.add(shade);
      const g = glowSprite(THREE, z > 10 ? 0xa9c46a : 0xffd27a, 1.8, 1.8, 0.5); g.position.set(OX + x + 1, 1.85, Z0 + z + 1); root.add(g);
    }
    // smoke in the card room
    const smokeM = new THREE.MeshBasicMaterial({ color: 0xc8c0a0, transparent: true, opacity: 0.07, depthWrite: false }), smoke = [];
    for (let k = 0; k < 10; k++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), smokeM); s.rotation.x = -Math.PI / 2; s.position.set(OX + 15.5 + Math.random() * 11, 1.4 + k * 0.08, Z0 + 17 + Math.random() * 7); root.add(s); smoke.push(s); }
    // the bar: bottles on the shelf behind it
    for (let k = 0; k < 14; k++) cyl(0.05, 0.06, 0.3, lam({ color: [0x2a5a2a, 0x7a2e1a, 0xf2c14e, 0xf3e6c8][k % 4] }), OX + 29.3 + k * 0.48, 1.25, Z0 + 1.4, root, 8);
    box(7, 0.06, 0.4, lam({ color: 0x3a2214 }), OX + 32.5, 1.08, Z0 + 1.4, root, false);
    // rain on the street and in the alley and the yard (no roof there)
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && ((x >= 9 && x <= 13) || (z >= 12 && z <= 15 && x >= 14 && x <= 26) || z >= 26) && Math.random() < 0.07) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    for (let i = 0; i < 12; i++) pl.push([OX - 10 + Math.random() * (W + 20), Math.random() * 7, 0.4 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 26, OX + W + 12, 8], [OX + 9, Z0 + 1, OX + 14, Z0 + 25], [OX + 14, Z0 + 12, OX + 27, Z0 + 16]], 900));
    let t = 0;
    return { tick(dt) {
      t += dt; doner.rotation.y += dt * 0.8; for (const f of ticks) f(dt);
      smoke.forEach((s, i) => { s.rotation.z += dt * 0.05 * (i % 2 ? 1 : -1); s.position.x += Math.sin(t * 0.3 + i) * dt * 0.1; });
      bulb.material.opacity = 0.5 + (Math.sin(t * 13) > 0.9 ? -0.35 : 0.1 * Math.sin(t * 3)); // the bare bulb flickers
    } };
  },
};
