// Act 2, mission 6: Avocado-akkers (Hipsterheuvel). Kas De Groene Goudmijn: a greenhouse café with a roof garden and the Noshgey
// hydroponics lab under glass. Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions.
// Built after the concept art (02_Act2_Avocado_akkers): a glass greenhouse wedged between gabled houses, a wooden café with a
// counter and hanging plants, a roof garden of planters and string lights, and a lab of tanks, shelves and growing tables.
// The twist: glass on every side. Most of the walls are greenhouse panes: you can see (and shoot) straight through them, and so
// can the Noshgey.
//   street → café → greenhouse beds → lab · café → garden → greenhouse · street → garden gate

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { eastSide, plate } from './story.js';
import { NOSHGEY } from './noshgey.js';

const W = 40, H = 28;

export default eastSide({
  ...NOSHGEY,
  id: 'avocadoakkers', name: 'Avocado-akkers', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['garden', 1, 1, 14, 11, 'deck'], ['cafe', 1, 13, 14, 22, 'pine'],
    ['beds', 16, 1, 26, 22, 'soil'], ['lab', 28, 1, 38, 10, 'tiles'], ['nursery', 28, 12, 38, 22, 'soil'],
    ['street', 1, 24, 38, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(6, 23, 7, 23); carve(0, 24, 0, 27); carve(39, 24, 39, 27);
    putR(6, 12, 7, 12, 'D');    // café ↔ roof garden
    putR(15, 17, 15, 18, 'D');  // café ↔ beds
    putR(15, 5, 15, 6, 'D');    // garden ↔ beds
    putR(27, 5, 27, 6, 'D');    // beds ↔ lab
    putR(27, 17, 27, 18, 'D');  // beds ↔ nursery
    putR(33, 11, 34, 11, 'D');  // lab ↔ nursery
    putR(33, 23, 34, 23, 'D');  // nursery ↔ street
    // glass everywhere: the greenhouse walls (the café keeps its brick back wall)
    putR(1, 23, 5, 23, '%'); putR(8, 23, 14, 23, '%');
    putR(15, 1, 15, 4, '%'); putR(15, 7, 15, 11, '%'); putR(15, 13, 15, 16, '%'); putR(15, 19, 15, 22, '%');
    putR(27, 1, 27, 4, '%'); putR(27, 7, 27, 10, '%'); putR(27, 12, 27, 16, '%'); putR(27, 19, 27, 22, '%');
    putR(28, 11, 32, 11, '%'); putR(35, 11, 38, 11, '%');
    putR(16, 23, 26, 23, '%'); putR(28, 23, 32, 23, '%'); putR(35, 23, 38, 23, '%');
    // café: counter, hanging plants (decorate), tables
    putR(2, 15, 9, 15, 'K'); put(14, 13, 'F'); put(3, 19, 'T'); put(8, 20, 'T'); put(12, 18, 'T'); put(1, 22, 'p'); put(14, 22, 'p');
    // roof garden: planters, a bench, string lights
    putR(2, 2, 6, 2, 'v'); putR(9, 2, 13, 2, 'v'); putR(3, 6, 4, 8, 'v'); putR(10, 6, 11, 8, 'v'); putR(6, 9, 9, 9, 'h');
    // greenhouse beds: long growing tables of avocado plants
    for (const z of [3, 7, 11, 15, 19]) { putR(17, z, 20, z, 'g'); putR(22, z, 25, z, 'g'); }
    // lab: tanks, a workbench, shelves, a safe
    putR(30, 2, 31, 3, 'C'); putR(34, 2, 37, 2, 'R'); putR(30, 7, 33, 7, 'w'); put(38, 10, 'V'); put(36, 6, 'F');
    // nursery: seedling racks and soil sacks
    putR(30, 14, 30, 19, 'R'); putR(34, 14, 37, 14, 'g'); putR(34, 18, 37, 18, 'g'); putR(37, 21, 38, 22, 'C');
    put(1, 27, 'l'); put(20, 27, 'l'); put(38, 27, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x8a6a42 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    g: { h: 0.9, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { // growing tables with avocado plants: low, bullets fly over
      box(n - 0.06, 0.6, 0.9, lam({ color: 0x6a4a2a }), cx, 0.3, cz, root); box(n - 0.1, 0.06, 0.82, lam({ color: 0x3a2a1a }), cx, 0.62, cz, root, false);
      for (let k = 0; k < n; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 0), lam({ color: [0x4a7a3a, 0x5a8a3a, 0x3a6a2a][(x + k) % 3] })); b.position.set(OX + x + k + 0.5, 0.95, cz); root.add(b); const a = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 5), lam({ color: 0x2a4a1a })); a.scale.set(1, 1.3, 1); a.position.set(OX + x + k + 0.7, 0.9, cz + 0.15); root.add(a); }
    } },
    R: { color: 0x5a4a3a },
  },
  rackGoods: [0xa9c46a, 0x5a8a3a, 0xc87a3a],
  floors: {
    deck: (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = ['#8a6a42', '#7a5c38', '#94744a'][(x / 8) % 3]; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, 0, 1, 64); } },
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#c8a070', '#b89060', '#d0a878'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    soil: (g) => { g.fillStyle = '#4a3a2a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '120,100,60'},${Math.random() * 0.2})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } g.fillStyle = '#7a7a70'; g.fillRect(28, 0, 8, 64); },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { deck: 2, pine: 1.5, soil: 2.5, cobble: 1.6 },
  hallCells: [[6, 23], [7, 23]],
  doorSigns: { '27,5': 'LAB', '33,23': 'KWEKERIJ' },
  neon: { garden: 0xf2c14e, cafe: 0xa9c46a, beds: 0xa9c46a, lab: 0xd8f0d8, nursery: 0xa9c46a, street: 0xe8a33d },
  lights: [[7, 18, 0xf3e6c8, 1.6], [7, 6, 0xf2c14e, 1.1], [21, 6, 0xd8f0c8, 1.4], [21, 17, 0xd8f0c8, 1.4], [33, 5, 0xd8f0f0, 1.6], [33, 17, 0xd8f0c8, 1.3], [7, 26, 0xe8a33d, 1.0], [30, 26, 0xe8a33d, 1.0]],
  mood: { bg: 0x081210, fogNear: 32, fogFar: 78, hemi: 0.55, sun: 0.55, sky: 0xf0f8e0, ground: 0x3a4030, wall: 0x7a3a2a, cap: 0xe0d8c0, under: 0x3a2a24 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [7, -0.7],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [7, 25.5],
  bossLook: { cap: 0xf3ecdc, shirt: 0xf3ecdc, front: '#f3ecdc', pants: 0x4a6a3a, belly: 0.7, head: { hair: '#4a3a2a', brow: '#2a1a12', hairLine: 44, glasses: true, iris: '#3a6a3a' } }, // Doctor Guacamole: lab coat, green trousers
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [10, 25.5, 'bat', Math.PI / 2, 'street'], [27, 25.5, 'makarov', -Math.PI / 2, 'street'],
    [4, 17, 'makarov', Math.PI, 'cafe'], [11, 21, 'bat', Math.PI, 'cafe'], [7, 4, 'bat', 0, 'garden'], [12, 9, 'makarov', -Math.PI / 2, 'garden'],
    [21, 5, 'makarov', Math.PI, 'beds'], [18, 9, 'bat', Math.PI / 2, 'beds'], [24, 13, 'makarov', -Math.PI / 2, 'beds'], [21, 17, 'bat', Math.PI, 'beds'], [25, 21, 'shotgun', Math.PI, 'beds'],
    [33, 4.5, 'shotgun', 0, 'lab', true], [36, 8.5, 'makarov', -Math.PI / 2, 'lab'],
    [32, 16, 'bat', Math.PI / 2, 'nursery'], [36, 20, 'makarov', -Math.PI / 2, 'nursery'], [35, 16, 'bat', 0, 'nursery'],
  ],
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a giant half avocado on the pavement, pit and all, the Noshgey's pride
      const { THREE, root, box, lam } = c, p = c.at(21, 0); p.z = 1.6;
      box(1.6, 0.4, 1.0, lam({ color: 0x5a6a3a }), p.x, 0.2, p.z, root); c.solid(p.x - 0.9, p.x + 0.9, p.z - 0.6, p.z + 0.6);
      const g = new THREE.Group(); g.position.set(p.x, 1.85, p.z - 0.1); g.rotation.x = -0.25; root.add(g);
      const skin = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0x2f4a1e, side: THREE.DoubleSide })); skin.scale.set(1.0, 0.35, 1.45); skin.rotation.x = Math.PI / 2; g.add(skin);
      const flesh = new THREE.Mesh(new THREE.CircleGeometry(0.97, 24), lam({ color: 0xd8e08a })); flesh.scale.set(1, 1.42, 1); flesh.position.z = 0.01; g.add(flesh);
      const rim = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.97, 24), lam({ color: 0x9ab84a })); rim.scale.set(1, 1.42, 1); rim.position.z = 0.015; g.add(rim);
      const pit = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), lam({ color: 0x7a4a2a })); pit.position.set(0, -0.25, 0.12); g.add(pit);
      c.plate('AVOCADO-AKKERS', p.x, 0.25, p.z + 0.52, 0, 1.4, 0.24, '#2a3a1a', '#d8e08a');
    } },
    { k: 'board', at: [38.5, 15.5], wall: 'e', style: 'green', title: 'OOGSTQUOTA', lines: ['Week 46: 400 avocado\'s', 'Week 47: 600', 'Week 48: ALLES', 'Wie achterloopt, wordt compost'], read: ['OOGSTQUOTA', 'Harvest quotas for the nursery workers. Week 48 just says "EVERYTHING". "Whoever falls behind becomes compost."'] },
    { k: 'board', at: [1.5, 15.5], wall: 'w', w: 1.6, h: 1.1, title: 'INFLUENCERS', lines: ['#avocadoakkers', '#plantbased', '#noshgey', '#eddyisuit'], read: ['INFLUENCERS', 'A wall of polaroids: influencers posing with avocado toast. The newest hashtag is #eddyisuit. "Eddy is out."'] },
    { k: 'crates', at: [31.5, 19.5], label: 'AVOCADO', color: '#2f4a1e' }, { k: 'spill', at: [32.5, 20.5], color: 0x9ab84a, r: 0.4 },
    { k: 'papers', at: [31.5, 8.5], read: ['KWEEKPROEF', 'Lab notes: "Avocado watered with chili oil from Eddy\'s recipe grows twice as fast." The page is stamped GEHEIM.'] },
    { k: 'bags', at: [5.5, 10.5], color: 0x5a4a2a, n: 2 },
  ],
  loot: [[1.5, 10.5], [14, 3.5], [26, 1.5], [38, 3.5], [38, 13.5], [28.5, 21.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · AVOCADO-AKKERS',
    banner: ['DE GROENE GOUDMIJN', 'Avocado-akkers. Avocados grown under glass, guarded by Noshgey.'],
    objective: 'Take <b>De Groene Goudmijn</b>: the café, the roof garden, the greenhouse and the lab. <b>The walls are glass</b>: you see them, they see you, and bullets go straight through. Doctor Guacamole runs the lab. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Avocado-akkers is <b>yours</b>. Smashed avocado, literally. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Avocado-akkers is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'AVOCADO-AKKERS TAKEN',
    resultsHint: 'Broken glass everywhere. Grab the spice crates (E), then drive home.',
    ownedBanner: ['AVOCADO-AKKERS IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['DOCTOR GUACAMOLE IS DOWN', 'Smashed.'],
    tips: ['Glass walls stop nothing: line up shots through them, and keep moving.', 'Growing tables are low. Bullets fly over them.', 'The roof garden behind the café is a quieter way into the greenhouse. The quietest: the compost path on the east side, straight to the lab.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    for (let i = 0; i < 3; i++) { const x = OX - 3 - i * 5.2, h = 10; box(5, h, 20, lam({ color: [0x6a3428, 0x4a2a24, 0x7a4430][i] }), x, h / 2, Z0 + 12, root); for (let s = 0; s < 3; s++) box(5 * (0.8 - s * 0.25), 0.9, 18, lam({ color: [0x6a3428, 0x4a2a24, 0x7a4430][i] }), x, h + 0.45 + s * 0.9, Z0 + 12, root, false); }
    // the greenhouse frame: thin white ribs over the glass rooms
    const ribM = lam({ color: 0xe8ecf0 });
    for (let x = 16; x <= 38; x += 2) box(0.06, 0.06, 22, ribM, OX + x, WALL_H + 0.6, Z0 + 12, root, false);
    for (let z = 1; z <= 23; z += 4) box(23, 0.06, 0.06, ribM, OX + 27, WALL_H + 0.6, Z0 + z, root, false);
    sign('DE GROENE GOUDMIJN', 6, 0.55, '#0a140c', '#a9c46a', OX + 7.5, 2.75, Z0 + 23.02, 0, 56); neonRect(root, OX + 7.5, 2.75, 6.2, 0.7, Z0 + 23.06, 0xa9c46a);
    sign('AVOCADO · KAS · KWEKERIJ', 5, 0.4, '#0a140c', '#f3e6c8', OX + 30, 2.7, Z0 + 23.02, 0, 40);
    // hanging plants in the café, string lights in the roof garden
    for (const [x, z] of [[3, 17], [7, 17], [11, 17], [5, 21], [10, 21]]) { const pot = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 0), lam({ color: 0x4a7a3a })); pot.position.set(OX + x, 2.2, Z0 + z); root.add(pot); }
    for (let x = 1.5; x < 14; x += 1.2) { const b = glowSprite(THREE, 0xf2c14e, 0.5, 0.5, 0.8); b.position.set(OX + x, 2.5, Z0 + 4.5 + Math.sin(x) * 1.5); root.add(b); }
    // grow lights over the beds
    for (const z of [3, 7, 11, 15, 19]) { const g = glowSprite(THREE, 0xd8f0a8, 8, 1.2, 0.18); g.position.set(OX + 21.5, 2.2, Z0 + z + 0.5); root.add(g); }
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 24 || (x <= 14 && z <= 11)) && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 8], [OX + 1, Z0 + 1, OX + 15, Z0 + 12]], 800));
    return { tick(dt) { for (const f of ticks) f(dt); } };
  },
}, { kind: 'door', door: [3, 4], street: [24, 27], sign: 'TUINDEUR', tip: 'The quiet way in: the compost path down the east side of the greenhouse, to the lab\'s garden door. It stinks, so nobody stands guard.', read: ['TUINDEUR', '"COMPOST: alleen GFT. Deur dicht ivm vliegjes." The door is not shut.'] });
