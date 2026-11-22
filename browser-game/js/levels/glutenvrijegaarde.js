// Act 2, mission 7: Glutenvrije Gaarde (Hipsterheuvel). Deli De Glutenvrije Gaarde: a white townhouse deli on a street corner, an
// inner bamboo garden, and the Noshgey conservatory lab behind it. Level data for the mission engine (js/mission.js); see
// spekbuurt.js for the coordinate conventions. Built after the concept art (02_Act2_Glutenvrije_Gaarde): a white corner house with a
// round sign and window boxes, a deli with shelves of jars, an inner courtyard of tall bamboo, steps and a fountain, and a glass
// conservatory full of lab shelves and steel tables.
// The twist: the bamboo garden. Tall bamboo blocks sight but not bullets: a stealth garden between the deli and the lab.
//   street → deli → kitchen · deli / kitchen → bamboo garden → conservatory → mixing room · street → garden gate

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { NOSHGEY } from './noshgey.js';

const W = 42, H = 28;

export default {
  ...NOSHGEY,
  id: 'glutenvrijegaarde', name: 'Glutenvrije Gaarde', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['kitchen', 1, 1, 12, 10, 'tiles'], ['deli', 1, 12, 12, 22, 'deli'],
    ['garden', 14, 1, 28, 22, 'moss'], ['conservatory', 30, 1, 40, 14, 'tiles'], ['mixing', 30, 16, 40, 22, 'tiles'],
    ['street', 1, 24, 40, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(5, 23, 6, 23); carve(19, 23, 21, 23); carve(0, 24, 0, 27); carve(41, 24, 41, 27); // the deli door, the garden gate
    putR(5, 11, 6, 11, 'D');    // deli ↔ kitchen
    putR(13, 16, 13, 17, 'D');  // deli ↔ garden
    putR(13, 5, 13, 6, 'D');    // kitchen ↔ garden
    putR(29, 6, 29, 7, 'D');    // garden ↔ conservatory
    putR(29, 19, 29, 20, 'D');  // garden ↔ mixing room
    putR(34, 15, 35, 15, 'D');  // conservatory ↔ mixing room
    putR(1, 23, 4, 23, '%'); putR(7, 23, 12, 23, '%');  // deli windows
    putR(29, 1, 29, 4, '%'); putR(29, 9, 29, 14, '%');  // the conservatory's glass wall onto the garden
    // deli: counter, shelves of jars, a table
    putR(2, 14, 9, 14, 'K'); putR(12, 12, 12, 15, 'R'); put(3, 19, 'T'); put(9, 20, 'T'); put(1, 22, 'p');
    // kitchen
    putR(3, 3, 9, 3, 'w'); put(1, 1, 'F'); putR(11, 8, 12, 9, 'C');
    // the garden: bamboo clumps (block sight), a fountain, stepping stones, benches
    for (const [x, z, w, d] of [[15, 2, 2, 2], [19, 1, 3, 1], [25, 2, 2, 3], [15, 7, 1, 3], [22, 6, 2, 2], [27, 9, 2, 2], [16, 13, 2, 2], [24, 14, 3, 1], [15, 19, 2, 2], [25, 18, 2, 2], [20, 19, 1, 2]]) putR(x, z, x + w - 1, z + d - 1, 'j');
    putR(20, 10, 21, 11, 'f'); putR(17, 11, 18, 11, 'h'); putR(23, 11, 24, 11, 'h');
    // conservatory: lab shelves, steel tables, a safe
    putR(31, 1, 36, 1, 'R'); putR(32, 5, 35, 6, 'w'); putR(32, 10, 35, 10, 'w'); put(40, 1, 'V'); put(40, 14, 'F');
    // mixing room
    putR(32, 18, 35, 19, 'w'); putR(39, 21, 40, 22, 'C');
    put(1, 27, 'l'); put(16, 27, 'l'); put(30, 27, 'l'); putR(8, 25, 11, 25, 'v');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xf3ecdc }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0x8a6a42 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    j: { h: 2.4, cover: false, sight: true, draw: ({ THREE, cyl, lam, root, n, cz, x, z, OX }) => { // tall bamboo: blocks sight and walking, bullets pass through the gaps
      for (let k = 0; k < n; k++) for (let s = 0; s < 5; s++) { const px = OX + x + k + 0.2 + ((s * 37 + z) % 7) / 10, pz = cz - 0.35 + ((s * 53 + x) % 8) / 10; cyl(0.05, 0.06, 2.6 + (s % 3) * 0.3, lam({ color: [0x6a8a3a, 0x7a9a4a, 0x5a7a2a][s % 3] }), px, 1.3, pz, root, 6); const tuft = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), lam({ color: 0x5a8a3a })); tuft.position.set(px, 2.7 + (s % 3) * 0.3, pz); root.add(tuft); }
    } },
    f: { h: 0.6, cover: false, draw: ({ THREE, cyl, lam, root, cx, cz }) => { cyl(0.95, 1.0, 0.5, lam({ color: 0xc8c4b8 }), cx, 0.25, cz + 0.5, root, 20); const w = new THREE.Mesh(new THREE.CircleGeometry(0.85, 20), lam({ color: 0x3a6a8a })); w.rotation.x = -Math.PI / 2; w.position.set(cx, 0.51, cz + 0.5); root.add(w); cyl(0.12, 0.15, 0.9, lam({ color: 0xc8c4b8 }), cx, 0.7, cz + 0.5, root, 10); } },
    R: { color: 0xe8e4d8 },
  },
  rackGoods: [0xf3ecdc, 0xa9c46a, 0xe8a33d],
  floors: {
    deli: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3ecdc' : '#a9c46a'; g.fillRect(x * 16, y * 16, 16, 16); } },
    moss: (g) => { g.fillStyle = '#3a4a2a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '90,120,60' : '20,30,10'},${Math.random() * 0.3})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#8a8478'; for (let i = 0; i < 4; i++) g.fillRect(8 + i * 14, 24 + (i % 2) * 8, 10, 8); },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { deli: 1.2, moss: 2.5, cobble: 1.6 },
  hallCells: [[5, 23], [6, 23], [19, 23], [20, 23], [21, 23]],
  doorSigns: { '29,6': 'LAB', '13,16': 'TUIN' },
  neon: { kitchen: 0xf2c14e, deli: 0xf3e6c8, garden: 0xa9c46a, conservatory: 0xd8f0f0, mixing: 0xf2c14e, street: 0xe8a33d },
  lights: [[6, 18, 0xf3e6c8, 1.6], [6, 5, 0xf2c14e, 1.2], [20, 5, 0xc8e0a8, 0.9], [21, 16, 0xc8e0a8, 0.9], [35, 7, 0xd8f0f0, 1.6], [35, 19, 0xf2c14e, 1.2], [6, 26, 0xe8a33d, 1.0], [30, 26, 0xe8a33d, 1.0]],
  mood: { bg: 0x081210, fogNear: 30, fogFar: 74, hemi: 0.45, sun: 0.45, sky: 0xf0f8e0, ground: 0x2a3424, wall: 0xe8e4d8, cap: 0xf3ecdc, under: 0x4a4a40 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [6, -0.7],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [6, 25.5],
  bossLook: { cap: 0xf3ecdc, shirt: 0xa9c46a, front: '#a9c46a', pants: 0xf3ecdc, belly: 1.1, head: { hair: '#d8d8d0', brow: '#a8a8a0', hairLine: 56, glasses: true, iris: '#3a5a3a' } }, // Tante Tarwevrij: grey bun, green cardigan
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [13, 25.5, 'bat', Math.PI / 2, 'street'], [26, 25.5, 'makarov', -Math.PI / 2, 'street'],
    [4, 17, 'makarov', Math.PI, 'deli'], [10, 21, 'bat', Math.PI, 'deli'], [6, 6, 'bat', 0, 'kitchen'], [10, 4.5, 'makarov', -Math.PI / 2, 'kitchen'],
    [18, 4, 'bat', Math.PI / 2, 'garden'], [24, 5, 'makarov', Math.PI, 'garden'], [19, 15, 'bat', Math.PI, 'garden'], [27, 13, 'makarov', -Math.PI / 2, 'garden'], [22, 21, 'bat', Math.PI, 'garden'], [17, 9, 'makarov', Math.PI / 2, 'garden'],
    [37, 3, 'shotgun', 0, 'conservatory', true], [33, 12.5, 'makarov', Math.PI, 'conservatory'], [38, 8, 'bat', -Math.PI / 2, 'conservatory'],
    [33, 21, 'bat', Math.PI, 'mixing'],
  ],
  loot: [[1.5, 9.5], [12, 1.5], [14.5, 11.5], [28.5, 21.5], [40, 3.5], [40, 17.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · GLUTENVRIJE GAARDE',
    banner: ['DE GLUTENVRIJE GAARDE', 'Glutenvrije Gaarde. A deli, a bamboo garden, and something brewing in the glasshouse.'],
    objective: 'Take <b>De Glutenvrije Gaarde</b>: the deli, the garden and the conservatory lab. <b>The bamboo blocks sight</b>: slip through the garden unseen, or get jumped. Tante Tarwevrij runs the lab. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Glutenvrije Gaarde is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Glutenvrije Gaarde is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'GLUTENVRIJE GAARDE TAKEN',
    resultsHint: 'The garden is quiet. Grab the spice crates (E), then drive home.',
    ownedBanner: ['GLUTENVRIJE GAARDE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['TANTE TARWEVRIJ IS DOWN', 'No crumbs left.'],
    tips: ['Bamboo hides you from the Noshgey, and them from you. Bullets go through it.', 'The garden gate off the street skips the deli.', 'The conservatory\'s glass wall faces the garden: they can see you from the lab.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    box(12, 2.2, 0.4, lam({ color: 0xf3ecdc }), OX + 6.5, WALL_H + 1.1, Z0 + 23.2, root, false); // the white townhouse rises above the deli
    sign('DE GLUTENVRIJE GAARDE', 6, 0.5, '#f3ecdc', '#5a6a3a', OX + 6.5, 2.75, Z0 + 23.02, 0, 50);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = '#5a6a3a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#f3ecdc'; g.font = '900 20px Arial'; g.textAlign = 'center'; g.fillText('GLUTEN', 64, 58); g.fillText('VRIJ', 64, 82); }) }));
    disc.position.set(OX + 0.6, 2.6, Z0 + 23.5); disc.rotation.y = -Math.PI / 4; root.add(disc);
    for (const x of [2.5, 10.5]) box(2.4, 0.3, 0.4, lam({ color: 0x5a6a3a }), OX + x, 1.4, Z0 + 23.3, root, false); // window boxes
    // the conservatory frame
    const ribM = lam({ color: 0x2a2a24 });
    for (let x = 30; x <= 40; x += 2) box(0.06, 0.06, 14, ribM, OX + x, WALL_H + 0.6, Z0 + 8, root, false);
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 24 || (x >= 14 && x <= 28 && z <= 22)) && Math.random() < 0.05) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 8], [OX + 14, Z0 + 1, OX + 29, Z0 + 23]], 900));
    return { tick(dt) { for (const f of ticks) f(dt); } };
  },
};
