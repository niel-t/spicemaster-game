// The finale: De Gouden Molen. A windmill on a small island in the river, where Eddy Sr. hid the recipe for De Gouden Mix thirty years
// ago. Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (04_Finale_De_Gouden_Molen): a windmill on an island with a jetty and a garden, a little shoarma counter at its foot, wooden
// grinding floors inside, and a golden chest glowing in the cap.
// The engine is single-floor, so the climb is laid out as a spiral round the mill: each floor is a room further in, joined by stairs.
// Lieutenants of all three factions guard the way up, and Oom Gerrit, Dad's old partner, waits by the chest.
//   jetty → garden → shop → stairs → grinding floor → stairs → sack loft → stairs → the cap (chest, Oom Gerrit)

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';

const W = 44, H = 34;

export default {
  id: 'goudenmolen', name: 'De Gouden Molen', W, H,
  faction: 'BEWAKERS', factionName: 'bewaker', foeHp: 2,
  foeLooks: [ // a guard from every faction: Lampas orange, Noshgey green, Abdavissies navy
    { front: '#e8641a', shirt: 0xe8641a, pants: 0x2a2a3a }, { front: '#a9c46a', shirt: 0xa9c46a, pants: 0x3a3a2a },
    { front: '#1a2a3a', shirt: 0x1a2a3a, pants: 0x2a2a2a }, { front: '#f3ecdc', shirt: 0xf3ecdc, pants: 0x5a6a3a }, { front: '#7a2e1a', shirt: 0x7a2e1a, pants: 0x1a2030 },
  ],
  alertLines: ['De Gouden Mix is van ons!', 'Lampas, Noshgey, Abdavissies: allemaal tegen jou!', 'Hier eindigt het, Eddy junior!', 'Je vader kwam ook niet verder.', 'PAK HEM!'],
  taskName: 'CHEST',
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['cap', 15, 6, 28, 13, 'gold'], ['loft', 7, 1, 36, 4, 'planks'], ['grind', 30, 6, 36, 20, 'planks'], ['shop', 7, 6, 13, 20, 'shoptile'],
    ['grindfloor', 15, 15, 28, 20, 'stone'],
    ['garden', 1, 22, 42, 26, 'grass'], ['jetty', 17, 28, 26, 33, 'deck'],
  ],
  layout({ carve, put, putR }) {
    // the island: water all round the garden and the jetty
    putR(1, 28, 16, 33, '~'); putR(27, 28, 42, 33, '~'); carve(1, 27, 42, 27); putR(1, 27, 16, 27, '~'); putR(27, 27, 42, 27, '~');
    carve(17, 27, 26, 27); carve(0, 22, 0, 26); carve(43, 22, 43, 26);
    // the climb: garden → shop → (stairs) grinding floor → (stairs) grind tower → (stairs) loft → (stairs) cap
    carve(9, 21, 11, 21);       // the shop's front door onto the garden (open)
    putR(14, 17, 14, 18, 'D');  // shop ↔ grinding floor
    putR(29, 17, 29, 18, 'D');  // grinding floor ↔ grind tower
    carve(33, 5, 35, 5);        // grind tower stairs up to the loft
    carve(21, 5, 22, 5);        // the loft stairs down into the cap
    putR(16, 21, 18, 21, '%'); putR(25, 21, 27, 21, '%'); // mill windows onto the garden
    // shop: the counter, a döner, a fridge
    putR(8, 9, 12, 9, 'K'); put(13, 6, 'F'); put(8, 14, 'T'); put(12, 17, 'p');
    // grinding floor: two millstones, sacks
    putR(18, 16, 19, 17, 'U'); putR(24, 16, 25, 17, 'U'); putR(15, 20, 16, 20, 'n'); putR(27, 20, 28, 20, 'n');
    // grind tower: the great shaft and gears, sacks
    putR(33, 11, 34, 13, 'U'); putR(31, 7, 32, 7, 'n'); putR(35, 18, 36, 19, 'n');
    // loft: sack stacks along the beams
    for (const x of [9, 14, 19, 26, 30]) putR(x, 2, x + 1, 2, 'n');
    // the cap: the chest on its plinth (decorate), braziers
    putR(21, 8, 22, 9, 'P'); put(16, 7, 'X'); put(27, 7, 'X');
    // the garden: hedges, a bench, lamps
    putR(3, 23, 6, 23, 'v'); putR(36, 23, 39, 23, 'v'); putR(20, 24, 23, 24, 'h'); put(1, 26, 'l'); put(42, 26, 'l'); put(17, 33, 'l'); put(26, 33, 'l');
  },
  furn: {
    ...STREET_FURN,
    '~': { h: 0.05, cover: false, draw: () => {} },
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xc8a040 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    U: { h: 1.2, cover: true, draw: ({ cyl, lam, root, cx, cz, x, z, G }) => { if (G[z][x - 1] === 'U' || G[z - 1][x] === 'U') return; cyl(1.0, 1.0, 0.6, lam({ color: 0x8a8478 }), cx + 0.5, 0.3, cz + 0.5, root, 20); cyl(0.95, 0.95, 0.5, lam({ color: 0x9a948a }), cx + 0.5, 0.85, cz + 0.5, root, 20); } },
    n: { h: 0.9, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.32, 0.55), lam({ color: [0xd8c8a0, 0xc8b890][(x + k + j) % 2] })); s.position.set(OX + x + k + 0.5, 0.17 + j * 0.34, cz); root.add(s); } } },
    P: { h: 1.0, cover: true, draw: () => {} },
  },
  hazard: { ch: '~', text: 'IN DE RIVIER!', death: 'Fell in the river.' },
  rackGoods: [0xc8a040, 0xd8c8a0, 0xe8a33d],
  floors: {
    gold: (g) => { g.fillStyle = '#5a4420'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.beginPath(); g.arc(32, 32, 26, 0, 7); g.stroke(); g.beginPath(); g.arc(32, 32, 12, 0, 7); g.stroke(); },
    planks: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#7a5432', '#6a4a2a', '#84603a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 5) % 64, y, 1, 8); } },
    stone: (g) => { g.fillStyle = '#5a5650'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3a3630'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#c8a040'; g.fillRect(x * 16, y * 16, 16, 16); } },
    grass: (g) => { g.fillStyle = '#2a4a24'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '90,140,60' : '20,40,10'},${Math.random() * 0.4})`; g.fillRect(Math.random() * 64, Math.random() * 64, 1, 3); } },
    deck: (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = ['#7a5c38', '#6a4e30', '#846440'][(x / 8) % 3]; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, 0, 1, 64); } },
  },
  floorRep: { gold: 3, planks: 1.6, stone: 2, shoptile: 1.2, grass: 2, deck: 2 },
  hallCells: [[9, 21], [10, 21], [11, 21], [33, 5], [34, 5], [35, 5], [21, 5], [22, 5]],
  doorSigns: { '14,17': 'MOLEN', '29,17': 'MAALVLOER' },
  neon: { cap: 0xf2c14e, loft: 0xe8a33d, grind: 0xe8a33d, shop: 0xf2c14e, grindfloor: 0xe8a33d, garden: 0xa9c46a, jetty: 0xe8a33d },
  lights: [[10, 13, 0xf3e6c8, 1.6], [21, 18, 0xffb060, 1.5], [33, 13, 0xffb060, 1.4], [20, 3, 0xffb060, 1.2], [21.5, 9, 0xf2c14e, 2.6], [10, 24, 0xa9c46a, 0.9], [32, 24, 0xa9c46a, 0.9], [21.5, 31, 0xe8a33d, 1.0]],
  mood: { bg: 0x08080e, fogNear: 34, fogFar: 84, hemi: 0.5, sun: 0.5, sky: 0xfff0d0, ground: 0x3a3424, wall: 0x6a5032, cap: 0xd8c8a8, under: 0x3a2a1a },
  van: { park: [21.5, 4.6], rot: Math.PI, from: W + 14, exit: [22.1, 3.0], solid: [18.2, 24.3, 3.45, 5.75] }, // on the river road; the jetty is the way in
  start: [21.5, 0.8],
  bounds: [0.5, W - 0.3, -H, 9],
  validateFrom: [21.5, 32.5],
  bossLook: { cap: 0xc8a040, shirt: 0xc8a040, front: '#c8a040', pants: 0x3a2a1a, belly: 1.0 },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, enemy type
    [19, 30, 'makarov', Math.PI, 'jetty'], [24, 31, 'bat', Math.PI, 'jetty'],
    [6, 24.5, 'makarov', Math.PI / 2, 'garden'], [14, 25.5, 'bat', Math.PI, 'garden'], [29, 25, 'makarov', Math.PI, 'garden'], [38, 25.5, 'shotgun', -Math.PI / 2, 'garden'],
    [10, 12, 'makarov', Math.PI, 'shop'], [9, 18, 'bat', Math.PI / 2, 'shop'],
    [21, 19, 'shotgun', Math.PI, 'grindfloor'], [16, 15.5, 'makarov', Math.PI / 2, 'grindfloor'], [27, 15.5, 'bat', -Math.PI / 2, 'grindfloor'],
    [33, 8.5, 'makarov', Math.PI, 'grind'], [35, 15, 'shotgun', Math.PI, 'grind'], [32, 19, 'bat', Math.PI / 2, 'grind'],
    [12, 3.5, 'makarov', Math.PI / 2, 'loft'], [24, 3, 'bat', Math.PI / 2, 'loft'], [33, 3.5, 'shotgun', -Math.PI / 2, 'loft'],
    [17, 11, 'makarov', Math.PI / 2, 'cap'], [26, 11, 'makarov', -Math.PI / 2, 'cap'], [21.5, 11.5, 'shotgun', Math.PI, 'cap', true, 'gerrit'],
  ],
  loot: [[13, 20], [36, 6.5], [7.5, 1.5], [36, 1.5], [15.5, 6.5], [28, 13]], // cell
  text: {
    area: 'DE GOUDEN MOLEN',
    banner: ['DE GOUDEN MOLEN', 'Thirty years ago, Eddy Sr. hid the recipe here.'],
    objective: 'Climb <b>De Gouden Molen</b>: the shop, the grinding floor, the tower, the loft, and the cap. Every faction has sent its last men. <b>Open the golden chest</b> (E) at the top. <span style="color:#ffd36b">Someone you know is waiting there.</span>',
    objectiveOwned: 'De Gouden Mix is <b>yours</b>. Kaasland is yours. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">De Gouden Molen is yours.</b> Drive home in the <b>Oofmobiel</b> and show your father.',
    resultsTitle: 'DE GOUDEN MIX',
    resultsHint: 'The recipe for De Gouden Mix is in your hands. Drive home and show your father.',
    ownedBanner: ['DE GOUDEN MIX IS YOURS', 'Drive home in the Oofmobiel.'],
    bossDown: ['OOM GERRIT IS DOWN', 'Dad\'s old partner. The one who sold him out.'],
    taskHint: 'Open the golden chest in the cap (E).', tasksDone: 'DE GOUDEN MIX!',
    tips: ['The way up spirals inward: shop, grinding floor, tower, loft, cap.', 'Oom Gerrit takes six hits and never drops his shotgun.', 'The island is ringed with water. Knock them in.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 8.4, T.asphalt, 4); // the river road
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, Z0 - 20, OX, 0)); ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 20, OX + W + 30, 0));
    const wt = canvasTex(64, 64, (g) => { g.fillStyle = '#081a2c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,170,255,${0.05 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 6 + Math.random() * 10, 1); } });
    for (const [x0, x1] of [[OX + 1, OX + 17], [OX + 27, OX + 43]]) floorW(x0, x1, Z0 + 27, Z0 + 34, wt, 4, 0xffffff, 0.02);
    // the windmill: the cap tower with its sails turning over the whole level
    const hub = new THREE.Group(); hub.position.set(OX + 21.5, WALL_H + 3, Z0 + 22.4); // on the south face, over the garden root.add(hub);
    cyl(0.6, 0.6, 1.2, lam({ color: 0x4a3420 }), 0, 0, 0, hub, 12).rotation.x = Math.PI / 2;
    const sails = new THREE.Group(); sails.position.z = 0.7; hub.add(sails);
    for (let k = 0; k < 4; k++) { const arm = new THREE.Group(); arm.rotation.z = k * Math.PI / 2; sails.add(arm); box(0.3, 7, 0.12, lam({ color: 0x5a3a20 }), 0, 3.8, 0, arm, false); box(1.4, 5.5, 0.05, lam({ color: 0xd8c8a0 }), 0.8, 4.2, 0.05, arm, false); }
    sign('DE GOUDEN MOLEN', 6, 0.7, '#1a0e08', '#f2c14e', OX + 21.5, 2.8, Z0 + 21.02, 0, 64); neonRect(root, OX + 21.5, 2.8, 6.2, 0.85, Z0 + 21.06, 0xf2c14e);
    sign('SHOARMA · SINDS 1971', 4, 0.42, '#1a0e08', '#f3e6c8', OX + 10, 2.6, Z0 + 21.02, 0, 40);
    // the chest on its plinth, in a pillar of gold light
    box(2.4, 0.9, 2.4, lam({ color: 0xd8d0c0 }), OX + 22, 0.45, Z0 + 9, root);
    const chest = new THREE.Group(); chest.position.set(OX + 22, 0.9, Z0 + 9); root.add(chest);
    box(1.2, 0.6, 0.8, lam({ color: 0xc8a040 }), 0, 0.3, 0, chest, false);
    const lid = new THREE.Group(); lid.position.set(0, 0.6, -0.4); chest.add(lid); box(1.22, 0.2, 0.82, lam({ color: 0xe8c050 }), 0, 0.1, 0.4, lid, false);
    const beam = glowSprite(THREE, 0xf2c14e, 4, 7, 0.6); beam.position.set(0, 3, 0); chest.add(beam);
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.4, 12), new THREE.MeshBasicMaterial({ color: 0xf2c14e })); jar.position.set(0, 0.5, 0); jar.visible = false; chest.add(jar);
    const tasks = [{ pos: new THREE.Vector3(OX + 22, 0, Z0 + 10.9), obj: chest, label: 'Open the golden chest', score: 10000, doneText: 'DE GOUDEN MIX!', open: 0,
      act() { this.open = 0.001; jar.visible = true; }, reset(done) { this.open = done ? 1 : 0; lid.rotation.x = done ? -1.9 : 0; jar.visible = !!done; } }];
    // stairs: darkening steps where the climb goes up
    for (const [x, z] of [[34, 5], [21.5, 5]]) box(3, 0.02, 0.9, lam({ color: 0x3a2a1a }), OX + x, 0.03, Z0 + z + 0.5, root, false);
    const pl = []; for (let z = 22; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.05) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 22, OX + W + 12, 9]], 900));
    let t = 0;
    return { tasks, tick(dt) {
      t += dt; for (const f of ticks) f(dt); sails.rotation.z += dt * 0.35;
      const tk = tasks[0]; if (tk.open > 0 && tk.open < 1) { tk.open = Math.min(1, tk.open + dt * 1.5); lid.rotation.x = -1.9 * tk.open; jar.position.y = 0.5 + tk.open * 0.8; }
      jar.rotation.y += dt; beam.material.opacity = 0.5 + Math.sin(t * 2) * 0.12;
    } };
  },
};
