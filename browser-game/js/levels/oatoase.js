// Act 2, mission 9: Oat-oase (Hipsterheuvel). Oat-oase: a café with an umbrella terrace, a lounge, and a pool party on the deck behind
// it. Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (02_Act2_Oat_oase): a corner café with "OAT OASE" in neon, a terrace of umbrellas and palms in the rain, a glowing lounge, and a
// rooftop pool deck with cabanas, loungers and palms.
// The twist: a VIP party. Guards stand in pairs, the party guests (civilians) flee at the first shot, and the pool is a hazard:
// knock a Noshgey into it and he's out.
//   street → café → lounge → office · café / lounge / office → pool deck

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { NOSHGEY, WATER_FURN } from './noshgey.js';

const W = 44, H = 30;
const GUESTS = [[6, 4], [9, 11], [33, 3], [36, 11], [14, 12], [28, 12], [40, 6], [3, 9]];

export default {
  ...NOSHGEY,
  id: 'oatoase', name: 'Oat-oase', W, H,
  hazard: { ch: '~', text: 'IN HET ZWEMBAD!', death: 'Pushed into the pool.' },
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['deck', 1, 1, 42, 14, 'pooldeck'], ['cafe', 1, 16, 14, 24, 'pine'], ['lounge', 16, 16, 30, 24, 'lounge'], ['office', 32, 16, 42, 24, 'panel'],
    ['street', 1, 26, 42, 29, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(6, 25, 7, 25); carve(0, 26, 0, 29); carve(43, 26, 43, 29);
    putR(15, 19, 15, 20, 'D');  // café ↔ lounge
    putR(31, 19, 31, 20, 'D');  // lounge ↔ office
    putR(6, 15, 7, 15, 'D');    // café ↔ deck
    putR(22, 15, 23, 15, 'D');  // lounge ↔ deck
    putR(37, 15, 38, 15, 'D');  // office ↔ deck
    putR(1, 25, 5, 25, '%'); putR(8, 25, 14, 25, '%'); putR(18, 25, 28, 25, '%'); // the café and lounge fronts
    putR(16, 15, 21, 15, '%'); putR(24, 15, 30, 15, '%'); // the lounge's glass wall onto the pool deck
    // the pool (hazard) and the deck: cabanas, loungers, palms, the pool bar
    putR(12, 4, 30, 10, '~');
    putR(2, 2, 4, 2, 'S'); putR(38, 2, 40, 2, 'S'); putR(2, 12, 3, 12, 'S'); putR(39, 12, 40, 12, 'S');
    for (const x of [13, 17, 21, 25, 29]) { put(x, 2, 'G'); put(x, 12, 'G'); }
    putR(34, 6, 36, 6, 'B'); put(1, 1, 'p'); put(42, 1, 'p'); put(1, 14, 'p'); put(42, 14, 'p'); put(10, 7, 'p'); put(32, 7, 'p');
    // café: counter, tables
    putR(2, 18, 9, 18, 'K'); put(14, 16, 'F'); put(3, 22, 'T'); put(9, 22, 'T'); put(12, 20, 'T');
    // lounge: sofas, low tables, a DJ desk
    putR(16, 22, 16, 24, 'S'); putR(30, 21, 30, 24, 'S'); put(20, 21, 'T'); put(25, 18, 'T'); putR(24, 24, 26, 24, 'B');
    // office: desk, safe
    putR(35, 18, 37, 18, 'O'); put(42, 16, 'V'); putR(33, 23, 34, 23, 'S');
    // street terrace: umbrella tables, palms in planters, lamps
    put(3, 27, 't'); put(10, 28, 't'); put(17, 27, 't'); put(24, 28, 't'); putR(30, 26, 32, 26, 'v'); put(1, 29, 'l'); put(36, 29, 'l');
  },
  furn: {
    ...STREET_FURN, ...WATER_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0xf3ecdc }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xa9c46a }), cx, 1.03, cz, root, false); } },
    G: { color: 0xf3ecdc }, S: { color: 0xe8a33d }, B: { color: 0x5a6a3a },
  },
  rackGoods: [0xa9c46a, 0xf3e6c8, 0xe8a33d],
  floors: {
    pooldeck: (g) => { g.fillStyle = '#d8ccb0'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#b8ac90'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#c8a070', '#b89060', '#d0a878'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    lounge: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#e8a33d' : '#7a2e1a'; g.fillRect(x * 16, y * 16, 16, 16); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { pooldeck: 2, pine: 1.5, lounge: 1.6, panel: 1.5, cobble: 1.6 },
  hallCells: [[6, 25], [7, 25]],
  doorSigns: { '31,19': 'KANTOOR', '22,15': 'ZWEMBAD' },
  neon: { deck: 0xa9c46a, cafe: 0xf3e6c8, lounge: 0xe8a33d, office: 0xe8a33d, street: 0xa9c46a },
  lights: [[7, 21, 0xf3e6c8, 1.6], [23, 20, 0xe8a33d, 1.6], [37, 20, 0xe8a33d, 1.2], [21, 7, 0x8ad8d8, 1.6], [6, 7, 0xf2c14e, 1.1], [37, 7, 0xf2c14e, 1.1], [8, 28, 0xa9c46a, 1.0], [30, 28, 0xa9c46a, 1.0]],
  mood: { bg: 0x081018, fogNear: 32, fogFar: 80, hemi: 0.5, sun: 0.5, sky: 0xf0f0dc, ground: 0x3a4038, wall: 0xe8e0d0, cap: 0xf3ecdc, under: 0x4a4038 },
  van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] },
  start: [7, 1.0],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [7, 27.5],
  bossLook: { cap: 0xf3ecdc, shirt: 0xe8a33d, front: '#e8a33d', pants: 0xf3ecdc, belly: 0.2, head: { hair: '#e8c870', brow: '#a88a4a', hairLine: 60, glasses: true, iris: '#3a5a7a' } }, // Influencer Isa: sunglasses, saffron kaftan
  spawns: [ // pairs of guards (cell x, cell z, weapon, facing, room, boss)
    [11, 27.5, 'bat', Math.PI / 2, 'street'], [12, 28.5, 'makarov', Math.PI / 2, 'street'],
    [4, 20, 'makarov', Math.PI, 'cafe'], [5, 21, 'bat', Math.PI, 'cafe'],
    [20, 18, 'makarov', Math.PI, 'lounge'], [21, 19, 'bat', Math.PI, 'lounge'], [27, 22, 'makarov', -Math.PI / 2, 'lounge'],
    [36, 21, 'makarov', Math.PI, 'office'], [39, 22, 'bat', -Math.PI / 2, 'office'],
    [8, 2.5, 'makarov', 0, 'deck'], [9, 3.5, 'bat', 0, 'deck'], [33, 11, 'makarov', Math.PI, 'deck'], [34, 12, 'bat', Math.PI, 'deck'], [20, 13, 'shotgun', Math.PI, 'deck'],
    [39, 4, 'shotgun', Math.PI / 2, 'deck', true], [41, 8, 'makarov', -Math.PI / 2, 'deck'],
  ],
  loot: [[1.5, 6.5], [42, 10.5], [14.5, 23.5], [42, 23.5], [16.5, 23.5], [30, 2.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · OAT-OASE',
    banner: ['OAT-OASE', 'Pool party. Guest list only.'],
    objective: 'Crash the <b>Oat-oase</b> VIP party. The guards stand in pairs; the guests aren\'t Noshgey and will run. <b>Knock a Noshgey into the pool</b> and he\'s out. Influencer Isa holds court in her cabana. <span style="color:#ffd36b">Leave no Noshgey standing.</span>',
    objectiveOwned: 'Oat-oase is <b>yours</b>. Party\'s over. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Oat-oase is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'OAT-OASE TAKEN',
    resultsHint: 'The pool is full of Noshgey and nobody is posting. Grab the spice crates (E), then drive home.',
    ownedBanner: ['OAT-OASE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['INFLUENCER ISA IS DOWN', 'Unfollowed.'],
    tips: ['Guards come in pairs. Split them with a thrown weapon or a swing door.', 'Knock a Noshgey into the pool edge: splash, out.', 'The lounge\'s glass wall faces the pool deck.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, makePerson, animate, path, run }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    sign('OAT-OASE', 4.6, 0.8, '#0a140c', '#a9c46a', OX + 7.5, 2.8, Z0 + 25.02, 0, 80); neonRect(root, OX + 7.5, 2.8, 4.8, 0.95, Z0 + 25.06, 0xa9c46a);
    sign('LOUNGE · POOL · VIP', 5.2, 0.42, '#140a0a', '#e8a33d', OX + 23, 2.7, Z0 + 25.02, 0, 40);
    // the pool: glowing water, a tiled rim, a lilo
    const poolM = new THREE.MeshPhongMaterial({ color: 0x3a9aa8, transparent: true, opacity: 0.85, shininess: 120, emissive: 0x0a3a40 });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(19, 7), poolM); pool.rotation.x = -Math.PI / 2; pool.position.set(OX + 21.5, 0.04, Z0 + 7.5); root.add(pool);
    box(19.4, 0.1, 0.2, lam({ color: 0xf3ecdc }), OX + 21.5, 0.06, Z0 + 3.95, root, false); box(19.4, 0.1, 0.2, lam({ color: 0xf3ecdc }), OX + 21.5, 0.06, Z0 + 11.05, root, false);
    const glow = glowSprite(THREE, 0x6ad8d8, 22, 9, 0.18); glow.position.set(OX + 21.5, 0.3, Z0 + 7.5); glow.rotation.x = -Math.PI / 2; root.add(glow);
    const lilo = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.22, 8, 16), lam({ color: 0xe8a33d })); lilo.rotation.x = -Math.PI / 2; lilo.position.set(OX + 18, 0.15, Z0 + 6); root.add(lilo);
    // umbrellas on the terrace, palms by the pool
    for (const [x, z] of [[3, 27], [10, 28], [17, 27], [24, 28]]) { const u = new THREE.Mesh(new THREE.ConeGeometry(1.3, 0.5, 8), lam({ color: [0xf3ecdc, 0xa9c46a][x % 2] })); u.position.set(OX + x + 0.5, 2.3, Z0 + z + 0.5); root.add(u); cyl(0.04, 0.04, 2.2, lam({ color: 0x2a2a2a }), OX + x + 0.5, 1.1, Z0 + z + 0.5, root, 6); }
    for (const [x, z] of [[1, 1], [42, 1], [1, 14], [42, 14], [10, 7], [32, 7]]) for (let k = 0; k < 6; k++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.35, 1.5), lam({ color: 0x4a7a3a, side: THREE.DoubleSide })); leaf.position.set(OX + x + 0.5, 2.2, Z0 + z + 0.5); leaf.rotation.set(-1.0, k * 1.05, 0); root.add(leaf); }
    // the party guests: civilians lounging by the pool. They flee into the café and out of the front door at the first shot.
    const exitV = new THREE.Vector3(OX + 6.5, 0, Z0 + 27.5);
    const guests = GUESTS.map(([x, z], i) => { const p = makePerson({ shirt: [0xf3ecdc, 0xe8a33d, 0xa9c46a, 0xc2412d][i % 4], front: ['#f3ecdc', '#e8a33d', '#a9c46a', '#c2412d'][i % 4], pants: [0xf3ecdc, 0x3a5a7a][i % 2], belly: (i % 3) * 0.2, skin: [0xe4ab88, 0xc88a64, 0x9a6a4a, 0xf0c4a2][i % 4] }); p.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); p.rotation.y = i; root.add(p); return { p, home: [x, z], route: null, gone: false }; });
    let panic = false, lastT = 0, t = 0;
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 26 || z <= 14) && Math.random() < 0.04) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 26, OX + W + 12, 8], [OX + 1, Z0 + 1, OX + 43, Z0 + 15]], 900));
    return { tick(dt) {
      t += dt; for (const f of ticks) f(dt); lilo.position.x = OX + 18 + Math.sin(t * 0.3) * 3; lilo.rotation.z += dt * 0.2;
      const R = run();
      if (R.time < lastT) { panic = false; for (const g of guests) { g.gone = false; g.route = null; g.p.visible = true; g.p.position.set(OX + g.home[0] + 0.5, 0, Z0 + g.home[1] + 0.5); } }
      lastT = R.time;
      if (!panic && (R.shots > 0 || R.kills > 0)) panic = true;
      for (const g of guests) {
        if (g.gone) continue;
        if (!panic) { animate(g.p, 0, dt); continue; }
        if (!g.route) g.route = path(g.p.position, exitV) || [exitV.clone()];
        const nx = g.route[0]; if (!nx) { g.gone = true; g.p.visible = false; continue; }
        const dx = nx.x - g.p.position.x, dz = nx.z - g.p.position.z, d = Math.hypot(dx, dz), sp = 4.4;
        if (d < 0.25) { g.route.shift(); if (!g.route.length) { g.gone = true; g.p.visible = false; } continue; }
        g.p.position.x += dx / d * sp * dt; g.p.position.z += dz / d * sp * dt; g.p.rotation.y = Math.atan2(dx, dz); animate(g.p, sp, dt);
      }
    } };
  },
};
