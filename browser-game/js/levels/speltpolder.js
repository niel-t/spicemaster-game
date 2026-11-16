// Act 2 finale: Speltpolder (Hipsterheuvel, the far east tip). De Oerkorrel Commune: the Noshgey Kariot's island headquarters.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (02_Act2_Speltpolder): an island compound with a jetty and moored boats, a timber restaurant and kitchen, a disco dome full of
// coloured spots, a garden, and a glass greenhouse dome where a golden chest glows on a pedestal.
// The twist: the finale. Goeroe Granola (five hits) holds the meditation hall, the disco dome strobes, and the floor only clears once
// you open the chest in the greenhouse: inside is Eddy Sr.'s first notebook page, the first clue to De Gouden Mix.
//   jetty → restaurant → kitchen → garden → greenhouse (the chest) · restaurant → disco dome → meditation hall → greenhouse

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';
import { makeSloep, makeCruiser, rockBoat } from '../boats.js';
import { NOSHGEY } from './noshgey.js';

const W = 50, H = 34;

export default {
  ...NOSHGEY,
  id: 'speltpolder', name: 'Speltpolder', W, H,
  taskName: 'CHEST',
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['kitchen', 1, 1, 16, 12, 'tiles'], ['restaurant', 1, 14, 16, 26, 'timber'],
    ['garden', 18, 1, 34, 10, 'moss'], ['disco', 18, 12, 34, 26, 'disco'],
    ['greenhouse', 36, 1, 48, 14, 'soil'], ['hall', 36, 16, 48, 26, 'tatami'],
    ['jetty', 1, 28, 48, 33, 'deck'],
  ],
  layout({ carve, put, putR }) {
    carve(7, 27, 9, 27); carve(25, 27, 26, 27); carve(0, 28, 0, 33); carve(49, 28, 49, 33); // restaurant doors, disco door, the jetty runs on
    putR(8, 13, 9, 13, 'D');    // restaurant ↔ kitchen
    putR(17, 5, 17, 6, 'D');    // kitchen ↔ garden
    putR(17, 19, 17, 20, 'D');  // restaurant ↔ disco
    putR(25, 11, 26, 11, 'D');  // garden ↔ disco
    putR(35, 5, 35, 6, 'D');    // garden ↔ greenhouse
    putR(35, 20, 35, 21, 'D');  // disco ↔ meditation hall
    putR(42, 15, 43, 15, 'D');  // hall ↔ greenhouse
    putR(44, 27, 45, 27, 'D');  // hall ↔ jetty
    putR(1, 27, 6, 27, '%'); putR(10, 27, 16, 27, '%'); // restaurant windows on the water
    putR(35, 1, 35, 4, '%'); putR(35, 7, 35, 14, '%'); putR(36, 15, 41, 15, '%'); putR(44, 15, 48, 15, '%'); // the greenhouse glass
    // kitchen: wood-fired ovens, prep tables, sacks of spelt
    putR(2, 1, 5, 1, 'H'); putR(3, 5, 8, 6, 'w'); putR(12, 9, 14, 10, 'n'); put(16, 1, 'F');
    // restaurant: long timber tables, the bar
    putR(2, 15, 9, 15, 'B'); putR(3, 19, 7, 19, 'T'); putR(10, 19, 14, 19, 'T'); putR(3, 23, 7, 23, 'T'); putR(10, 23, 14, 23, 'T'); put(16, 14, 'p'); put(1, 26, 'p');
    // garden: beds and bamboo
    putR(20, 2, 23, 2, 'g'); putR(27, 2, 31, 2, 'g'); putR(20, 7, 23, 7, 'g'); putR(28, 7, 32, 7, 'g'); putR(33, 3, 34, 4, 'j');
    // disco dome: the DJ booth, booths round the edge
    putR(28, 12, 32, 12, 'B'); putR(18, 15, 18, 18, 'S'); putR(34, 15, 34, 18, 'S'); put(21, 24, 'T'); put(31, 24, 'T');
    // greenhouse: beds, the chest on its pedestal (decorate), a safe
    putR(37, 2, 39, 3, 'g'); putR(45, 2, 47, 3, 'g'); putR(37, 11, 39, 12, 'g'); putR(45, 11, 47, 12, 'g'); putR(41, 7, 43, 8, 'P');
    // meditation hall: cushions (low), incense, a gong
    putR(38, 19, 39, 19, 'c'); putR(45, 19, 46, 19, 'c'); putR(38, 23, 39, 23, 'c'); putR(45, 23, 46, 23, 'c'); put(48, 16, 'V'); put(36, 26, 'p');
    // jetty: boats are drawn on the water; crates, lamps, bollards
    putR(14, 30, 15, 31, 'C'); putR(33, 29, 34, 29, 'C'); put(1, 33, 'l'); put(24, 33, 'l'); put(48, 33, 'l'); for (const x of [6, 18, 30, 42]) put(x, 32, 'o');
  },
  furn: {
    ...STREET_FURN,
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x8a6a42 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xc8a070 }), cx, 0.93, cz, root, false); } },
    H: { h: 1.6, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz }) => { box(n - 0.06, 1.5, 0.9, lam({ color: 0x8a3a24 }), cx, 0.75, cz, root); const m = new THREE.Mesh(new THREE.PlaneGeometry(n - 1, 0.5), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); m.position.set(cx, 0.6, cz + 0.46); root.add(m); const g = glowSprite(THREE, 0xff7a1a, n + 1, 1.6, 0.5); g.position.set(cx, 0.8, cz + 0.9); root.add(g); } },
    g: { h: 0.9, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { box(n - 0.06, 0.6, 0.9, lam({ color: 0x6a4a2a }), cx, 0.3, cz, root); for (let k = 0; k < n; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.3, 0), lam({ color: [0x5a8a3a, 0xa9c46a, 0x7a9a3a][(x + k) % 3] })); b.position.set(OX + x + k + 0.5, 0.9, cz); root.add(b); } } },
    j: { h: 2.4, cover: false, sight: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) for (let s = 0; s < 5; s++) cyl(0.05, 0.06, 2.8, lam({ color: 0x6a8a3a }), OX + x + k + 0.2 + s * 0.15, 1.4, cz - 0.3 + (s % 3) * 0.3, root, 6); } },
    n: { h: 0.9, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.32, 0.55), lam({ color: [0xd8c8a0, 0xc8b890][(x + k + j) % 2] })); s.position.set(OX + x + k + 0.5, 0.17 + j * 0.34, cz); root.add(s); } } },
    P: { h: 1.0, cover: true, draw: () => {} }, // the chest's pedestal: drawn by decorate
    B: { color: 0x6a4426 }, T: { color: 0xa07a4a }, S: { color: 0xc2412d },
    c: { h: 0.3, cover: false, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) cyl(0.4, 0.42, 0.25, lam({ color: [0xa9c46a, 0xe8a33d][(x + k) % 2] }), OX + x + k + 0.5, 0.13, cz, root, 12); } }, // meditation cushions
  },
  rackGoods: [0xa9c46a, 0xd8c8a0, 0xc87a3a],
  floors: {
    timber: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#8a5a32', '#7a4e2a', '#946038'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 7) % 64, y, 1, 8); } },
    moss: (g) => { g.fillStyle = '#3a4a2a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '90,120,60' : '20,30,10'},${Math.random() * 0.3})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } },
    disco: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#2a1a24', '#3a2a1a', '#1a2420', '#2a2018'][(x + y * 3) % 4]; g.fillRect(x * 16, y * 16, 16, 16); g.strokeStyle = 'rgba(232,163,61,.3)'; g.strokeRect(x * 16 + 1, y * 16 + 1, 14, 14); } },
    soil: (g) => { g.fillStyle = '#4a3a2a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } g.fillStyle = '#8a8478'; g.fillRect(26, 0, 12, 64); },
    tatami: (g) => { g.fillStyle = '#c8b880'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#7a6a3a'; g.lineWidth = 2; g.strokeRect(1, 1, 30, 62); g.strokeRect(33, 1, 30, 62); },
    deck: (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = ['#7a5c38', '#6a4e30', '#846440'][(x / 8) % 3]; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, 0, 1, 64); } },
  },
  floorRep: { timber: 1.5, moss: 2.5, disco: 2, soil: 2.5, tatami: 2, deck: 2 },
  hallCells: [[7, 27], [8, 27], [9, 27], [25, 27], [26, 27]],
  doorSigns: { '44,27': 'GOEROE', '35,5': 'KAS', '17,19': 'DISCO' },
  neon: { kitchen: 0xff8a2a, restaurant: 0xe8a33d, garden: 0xa9c46a, disco: 0xc2412d, greenhouse: 0xf2c14e, hall: 0xa9c46a, jetty: 0xe8a33d },
  lights: [[8, 6, 0xff8a3a, 1.6], [8, 20, 0xffc070, 1.7], [26, 5, 0xc8e0a8, 1.0], [26, 19, 0xe8a33d, 1.2], [42, 8, 0xf2c14e, 2.2], [42, 21, 0xa9c46a, 1.4], [10, 31, 0xe8a33d, 1.0], [38, 31, 0xe8a33d, 1.0]],
  mood: { bg: 0x060c12, fogNear: 34, fogFar: 84, hemi: 0.45, sun: 0.45, sky: 0xf0f0dc, ground: 0x2a3424, wall: 0x6a4426, cap: 0xd8c8a8, under: 0x2a2018 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [8, 1.0],
  bounds: [0.5, W - 0.3, -H, 8],
  validateFrom: [8, 30],
  bossLook: { cap: 0xf3ecdc, shirt: 0xf3ecdc, front: '#f3ecdc', pants: 0xf3ecdc, belly: 0.6, head: { hair: '#d8d0c0', brow: '#a8a090', hairLine: 30, iris: '#3a5a3a' } },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, enemy type
    [12, 30.5, 'bat', Math.PI / 2, 'jetty'], [30, 31, 'makarov', -Math.PI / 2, 'jetty'], [40, 30, 'bat', Math.PI / 2, 'jetty'],
    [5, 17, 'makarov', Math.PI, 'restaurant'], [12, 21, 'bat', Math.PI / 2, 'restaurant'], [8, 25, 'makarov', Math.PI, 'restaurant'],
    [10, 3.5, 'bat', 0, 'kitchen'], [5, 9, 'makarov', Math.PI / 2, 'kitchen'],
    [25, 4.5, 'bat', Math.PI, 'garden'], [31, 9, 'makarov', -Math.PI / 2, 'garden'],
    [26, 15, 'makarov', Math.PI, 'disco'], [22, 20, 'bat', Math.PI / 2, 'disco'], [30, 21, 'makarov', -Math.PI / 2, 'disco'], [26, 25, 'shotgun', Math.PI, 'disco'],
    [40, 5, 'makarov', Math.PI / 2, 'greenhouse'], [46, 9, 'bat', -Math.PI / 2, 'greenhouse'],
    [42, 18, 'shotgun', 0, 'hall', true, 'goeroe'], [38, 21, 'makarov', Math.PI / 2, 'hall'], [46, 25, 'makarov', -Math.PI / 2, 'hall'],
  ],
  loot: [[1.5, 11.5], [16, 12.5], [18.5, 9.5], [48, 1.5], [48, 25.5], [32.5, 29.5], [18.5, 25.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · SPELTPOLDER',
    banner: ['DE OERKORREL COMMUNE', 'Speltpolder. The Noshgey Kariot\'s island headquarters.'],
    objective: 'Storm <b>De Oerkorrel Commune</b>. Take down <b>Goeroe Granola</b> in the meditation hall, and <b>open the golden chest</b> (E) in the greenhouse. <span style="color:#ffd36b">This ends the Noshgey Kariot.</span>',
    objectiveOwned: 'Speltpolder is <b>yours</b>. The Noshgey Kariot are finished. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">The Commune has fallen.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'THE NOSHGEY KARIOT ARE FINISHED',
    resultsHint: 'Goeroe Granola is down and you hold Dad\'s first notebook page. Grab the spice crates (E), then drive home.',
    ownedBanner: ['SPELTPOLDER IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['GOEROE GRANOLA IS DOWN', 'Namaste. Forever.'],
    taskHint: 'Open the golden chest in the greenhouse (E).',
    tasksDone: 'DAD\'S NOTEBOOK PAGE',
    tips: ['The chest is in the greenhouse at the back. The floor only clears once you open it.', 'Goeroe Granola takes five hits.', 'The disco dome strobes like Frikandelhaven\'s. Fight in the flashes.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, banner }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 7.6, T.asphalt, 4); // the causeway road
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, Z0 - 20, OX, 0)); ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 20, OX + W + 30, 0));
    // boats at the jetty
    const boats = [], boat = (x, z, r, c, cruiser) => { const g = cruiser ? makeCruiser({ L: 5.2, B: 1.9, hull: c, stripe: 0x7f9a5a }) : makeSloep({ L: 4.6, B: 1.7, hull: c }); g.position.set(OX + x, -0.15, Z0 + z); g.rotation.y = r - Math.PI / 2; root.add(g); boats.push(g); }; // js/boats.js
    boat(-2, 30, 0, 0xf6f2e8, true); boat(52, 31, Math.PI, 0x7f9a5a);
    sign('DE OERKORREL COMMUNE', 8, 0.6, '#0a140c', '#a9c46a', OX + 8.5, 2.8, Z0 + 27.02, 0, 56); neonRect(root, OX + 8.5, 2.8, 8.2, 0.75, Z0 + 27.06, 0xa9c46a);
    sign('DISCO DOME', 3.6, 0.5, '#140a0a', '#e8a33d', OX + 25.5, 2.8, Z0 + 27.02, 0, 50);
    // domes: ribs over the disco and the greenhouse
    for (const [cx, cz, r] of [[26, 19, 7.5], [42, 8, 6.5]]) for (let k = 0; k < 6; k++) { const rib = new THREE.Mesh(new THREE.TorusGeometry(r, 0.08, 4, 24, Math.PI), lam({ color: 0xd8dcd0 })); rib.position.set(OX + cx, WALL_H - 0.3, Z0 + cz); rib.rotation.y = k * Math.PI / 6; rib.scale.set(1, 0.25, 1); root.add(rib); }
    // the disco strobe
    const strobe = new THREE.PointLight(0xf3ecdc, 0, 18, 1.2); strobe.position.set(OX + 26, 2.6, Z0 + 19); root.add(strobe);
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(17, 15), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); dark.rotation.x = -Math.PI / 2; dark.position.set(OX + 26, WALL_H - 0.05, Z0 + 19); root.add(dark);
    const spots = [0xc2412d, 0xe8a33d, 0xa9c46a].map((c) => { const g = glowSprite(THREE, c, 3.6, 3.6, 0.32); g.position.y = 0.08; root.add(g); return g; });
    // the meditation hall: a gong, incense smoke
    const gong = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.08, 24), lam({ color: 0xc8a040 })); gong.rotation.x = Math.PI / 2; gong.position.set(OX + 42.5, 1.4, Z0 + 16.2); root.add(gong);
    // the golden chest on its pedestal: the task. Opening it gives Eddy Sr.'s first notebook page.
    box(3, 0.9, 2, lam({ color: 0xd8d0c0 }), OX + 42.5, 0.45, Z0 + 8, root);
    const chest = new THREE.Group(); chest.position.set(OX + 42.5, 0.9, Z0 + 8); root.add(chest);
    box(1.2, 0.6, 0.8, lam({ color: 0xc8a040 }), 0, 0.3, 0, chest, false);
    const lid = new THREE.Group(); lid.position.set(0, 0.6, -0.4); chest.add(lid); box(1.22, 0.2, 0.82, lam({ color: 0xd8b04a }), 0, 0.1, 0.4, lid, false);
    const beam = glowSprite(THREE, 0xf2c14e, 3, 5, 0.6); beam.position.set(0, 2.2, 0); chest.add(beam);
    const page = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), new THREE.MeshBasicMaterial({ color: 0xf3ecdc })); page.position.set(0, 0.7, 0); page.visible = false; chest.add(page);
    const tasks = [{ pos: new THREE.Vector3(OX + 42.5, 0, Z0 + 9.8), obj: chest, label: 'Open the golden chest', score: 3000, doneText: 'DAD\'S NOTEBOOK PAGE!', open: 0,
      act() { this.open = 0.001; page.visible = true; },
      reset(done) { this.open = done ? 1 : 0; lid.rotation.x = done ? -1.9 : 0; page.visible = !!done; } }];
    const pl = []; for (let z = 28; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.05) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 28, OX + W + 12, 8], [OX + 18, Z0 + 1, OX + 35, Z0 + 11]], 900));
    let t = 0;
    return { tasks, tick(dt) {
      t += dt; for (const f of ticks) f(dt); for (const b of boats) rockBoat(b, t, 0);
      const on = (t % 0.9) < 0.42; strobe.intensity = on ? 5 : 0; dark.material.opacity = on ? 0 : 0.72;
      spots.forEach((s, i) => { const a = t * (0.9 + i * 0.3) + i * 2; s.position.set(OX + 26 + Math.cos(a) * 5.5, 0.06, Z0 + 19 + Math.sin(a * 1.3) * 4.5); });
      const tk = tasks[0]; if (tk.open > 0 && tk.open < 1) { tk.open = Math.min(1, tk.open + dt * 2); lid.rotation.x = -1.9 * tk.open; page.position.y = 0.7 + tk.open * 0.6; }
      page.rotation.y += dt; beam.material.opacity = 0.5 + Math.sin(t * 2) * 0.12; gong.rotation.z = Math.sin(t * 0.8) * 0.05;
    } };
  },
};
