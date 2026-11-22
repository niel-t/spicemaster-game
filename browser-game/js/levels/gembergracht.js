// Act 2, mission 5: Gembergracht (Hipsterheuvel). Proeflokaal De Gemberwortel: a canal-house tasting room by the bridge, and under
// it Club Gember, the biggest club on the island. Level data for the mission engine (js/mission.js); see spekbuurt.js for the
// coordinate conventions. Built after the concept art (02_Act2_Gembergracht): a gabled canal house with a warm tasting room, a
// humpback bridge over the canal, and a huge neon cellar club with a long bar, a packed dance floor and booths.
// The twist: the dance floor is packed with clubgoers. They're civilians: they dance until the shooting starts, then stampede out
// of the club door. Hit one and the crowd... well, don't.
//   street → tasting room → kitchen → office · tasting room / kitchen → club → storage / VIP · street → CLUB door

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';
import { NOSHGEY } from './noshgey.js';

const W = 44, H = 30;
const EXIT = [38.5, 29.5]; // the club door: where the dancers run

export default {
  ...NOSHGEY,
  id: 'gembergracht', name: 'Gembergracht', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['office', 1, 1, 16, 10, 'panel'], ['kitchen', 1, 12, 16, 16, 'tiles'], ['tasting', 1, 18, 16, 26, 'pine'],
    ['storage', 18, 1, 30, 6, 'concrete'], ['vip', 32, 1, 42, 6, 'velvet'], ['club', 18, 8, 42, 26, 'club'],
    ['street', 1, 28, 42, 29, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(7, 27, 8, 27); carve(0, 28, 0, 29); carve(43, 28, 43, 29);
    putR(7, 17, 8, 17, 'D');    // tasting room ↔ kitchen
    putR(7, 11, 8, 11, 'D');    // kitchen ↔ office
    putR(17, 22, 17, 23, 'D');  // tasting room ↔ club
    putR(17, 14, 17, 15, 'D');  // kitchen ↔ club
    putR(24, 7, 25, 7, 'D');    // club ↔ storage
    putR(37, 7, 38, 7, 'D');    // club ↔ VIP
    putR(31, 3, 31, 4, 'D');    // storage ↔ VIP
    putR(38, 27, 39, 27, 'D');  // club ↔ street (the CLUB door)
    putR(1, 27, 6, 27, '%'); putR(9, 27, 16, 27, '%'); putR(32, 7, 36, 7, '%'); // tasting room windows; the VIP glass over the club
    // tasting room: the tasting bar, long tables
    putR(2, 19, 6, 19, 'K'); putR(3, 22, 6, 22, 'T'); putR(10, 22, 13, 22, 'T'); putR(3, 25, 6, 25, 'T'); putR(10, 25, 13, 25, 'T'); put(16, 18, 'p');
    // kitchen and office
    putR(3, 14, 10, 14, 'w'); put(16, 12, 'F'); putR(4, 3, 7, 3, 'O'); put(1, 1, 'V'); putR(12, 7, 14, 7, 'S'); put(16, 10, 'p');
    // club: the long bar, booths round the edge, the DJ booth; the middle is the dance floor
    putR(19, 9, 23, 9, 'B'); putR(27, 9, 34, 9, 'B'); putR(18, 17, 18, 20, 'S'); putR(42, 12, 42, 18, 'S'); putR(28, 25, 32, 25, 'B'); put(20, 24, 'T'); put(40, 23, 'T'); put(18, 26, 'p');
    // storage and VIP
    putR(19, 2, 22, 3, 'C'); putR(27, 1, 30, 1, 'R'); put(30, 6, 'X'); putR(34, 2, 40, 2, 'S'); put(37, 4, 'T'); put(42, 1, 'V');
    put(1, 29, 'l'); put(20, 29, 'l'); put(42, 29, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x6a4426 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xe8a33d }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    B: { color: 0x2a2a30 }, S: { color: 0xa9c46a }, T: { color: 0xc8a070 },
  },
  rackGoods: [0xe8a33d, 0xf3e6c8, 0xa9c46a],
  floors: {
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#a07a4a', '#906c40', '#aa8452'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    club: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#1a1a24', '#2a1a1a', '#1a241a', '#24201a'][(x * 3 + y) % 4]; g.fillRect(x * 16, y * 16, 16, 16); g.strokeStyle = 'rgba(232,163,61,.25)'; g.strokeRect(x * 16 + 1, y * 16 + 1, 14, 14); } },
    velvet: (g) => { g.fillStyle = '#4a1a14'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.2})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { pine: 1.5, club: 2.2, velvet: 2, panel: 1.5, cobble: 1.6 },
  hallCells: [[7, 27], [8, 27]],
  doorSigns: { '38,27': 'CLUB', '37,7': 'VIP', '7,11': 'KANTOOR' },
  neon: { office: 0xe8a33d, kitchen: 0xf2c14e, tasting: 0xe8a33d, storage: 0xffd8a0, vip: 0xc2412d, club: 0xa9c46a, street: 0xe8a33d },
  lights: [[8, 22, 0xffc070, 1.7], [8, 14, 0xf2c14e, 1.1], [8, 5, 0xe8a33d, 1.3], [24, 4, 0xffd8a0, 1.1], [37, 4, 0xc2412d, 1.4], [26, 11, 0xe8a33d, 1.5], [30, 17, 0xa9c46a, 1.4], [36, 21, 0xc2412d, 1.3], [24, 21, 0xf2c14e, 1.2], [8, 29, 0xe8a33d, 1.0], [34, 29, 0xa9c46a, 1.0]],
  mood: { bg: 0x081018, fogNear: 32, fogFar: 80, hemi: 0.45, sun: 0.5, sky: 0xf0f0dc, ground: 0x3a3830, wall: 0x6a3428, cap: 0xe0d4bc, under: 0x3a2a24 },
  van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] },
  start: [8, 1.0],
  bounds: [0.5, W - 0.3, -H, 7.5],
  validateFrom: [8, 28.5],
  bossLook: { cap: 0xe8a33d, shirt: 0xe8a33d, front: '#e8a33d', pants: 0x2a2a24, belly: 1.0, head: { hair: '#c86a2a', brow: '#8a4a1a', hairLine: 46, iris: '#5a3a1a', glasses: true } }, // the Gemberkoning: ginger suit, ginger hair
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [12, 28.5, 'bat', -Math.PI / 2, 'street'], [33, 28.5, 'makarov', Math.PI / 2, 'street'],
    [4, 20.5, 'makarov', Math.PI, 'tasting'], [12, 23.5, 'bat', -Math.PI / 2, 'tasting'], [8, 15.5, 'bat', Math.PI, 'kitchen'], [10, 5.5, 'makarov', Math.PI / 2, 'office'],
    [22, 11, 'makarov', Math.PI, 'club'], [30, 11, 'bat', Math.PI, 'club'], [20, 20, 'makarov', Math.PI / 2, 'club'], [40, 20.5, 'bat', -Math.PI / 2, 'club'], [36, 24, 'shotgun', Math.PI, 'club'], [24, 25, 'bat', Math.PI, 'club'],
    [25, 4.5, 'makarov', Math.PI / 2, 'storage'], [36.5, 1.6, 'shotgun', 0, 'vip', true], [40, 5, 'makarov', -Math.PI / 2, 'vip'], [33, 5, 'bat', Math.PI / 2, 'vip'],
  ],
  loot: [[1.5, 9.5], [16, 1.5], [18.5, 1.5], [42, 3.5], [41, 25.5], [18.5, 8.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · GEMBERGRACHT',
    banner: ['CLUB GEMBER', 'Gembergracht. The biggest club on the island, under the bridge.'],
    objective: 'Take <b>De Gemberwortel</b> and <b>Club Gember</b> underneath it. The dance floor is <b>packed with clubgoers</b>: they\'re not Noshgey and they\'ll stampede for the door once it kicks off. The Gemberkoning holds court in the VIP room. <span style="color:#ffd36b">Leave no Noshgey standing.</span>',
    objectiveOwned: 'Gembergracht is <b>yours</b>. The club is closed. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Gembergracht is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'GEMBERGRACHT TAKEN',
    resultsHint: 'The music stopped and the crowd went home. Grab the spice crates (E), then drive home.',
    ownedBanner: ['GEMBERGRACHT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE GEMBERKONING IS DOWN', 'Dethroned.'],
    tips: ['The crowd runs for the CLUB door the moment a shot is fired. Wait for them to clear before you go loud.', 'The VIP room looks down on the club through glass.', 'The long bar stops bullets. Booths don\'t.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, makePerson, animate, path, run }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the canal street, the canal and its humpback bridge
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.4, T.asphalt, 4);
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 14, 8, OX + W + 14, 22));
    const arch = new THREE.Mesh(new THREE.TorusGeometry(3, 0.6, 8, 20, Math.PI), lam({ color: 0x7a3a2a })); arch.position.set(OX + 34, 0, 11); root.add(arch);
    box(7, 0.4, 3, lam({ color: 0x6a3428 }), OX + 34, 3.2, 11, root, false);
    // the canal-house gable over the tasting room
    for (let s = 0; s < 4; s++) box(16 - s * 4, 1.1, 0.6, lam({ color: 0x7a3a2a }), OX + 8.5, WALL_H + 0.55 + s * 1.1, Z0 + 27.4, root, false);
    sign('PROEFLOKAAL DE GEMBERWORTEL', 9, 0.55, '#140a06', '#e8a33d', OX + 8.5, 2.75, Z0 + 27.02, 0, 46);
    sign('CLUB GEMBER', 5, 0.7, '#0a140c', '#a9c46a', OX + 38.5, 2.9, Z0 + 27.02, 0, 70); neonRect(root, OX + 38.5, 2.9, 5.2, 0.85, Z0 + 27.06, 0xa9c46a);
    // club: neon tubes along the walls, a mirror ball over the dance floor
    for (const z of [8.1, 25.9]) { const tube = new THREE.Mesh(new THREE.BoxGeometry(24, 0.08, 0.08), new THREE.MeshBasicMaterial({ color: z < 10 ? 0xe8a33d : 0xa9c46a })); tube.position.set(OX + 30, 2.4, Z0 + z); root.add(tube); }
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.45, 1), new THREE.MeshPhongMaterial({ color: 0xd8d8d8, shininess: 200, flatShading: true })); ball.position.set(OX + 30, 2.3, Z0 + 17); root.add(ball);
    const spots = [0xc2412d, 0xe8a33d, 0xa9c46a, 0xf3ecdc].map((c) => { const g = glowSprite(THREE, c, 3.6, 3.6, 0.3); g.position.y = 0.1; root.add(g); return g; });
    // the dancers: clubgoers, not Noshgey. They dance until the first shot, then stampede out of the club door.
    const exitV = new THREE.Vector3(OX + EXIT[0], 0, Z0 + EXIT[1] - 1);
    const dancers = [];
    for (let i = 0; i < 12; i++) {
      const x = 23 + (i % 4) * 3.2 + (i % 2) * 0.6, z = 12 + Math.floor(i / 4) * 3.4;
      const p = makePerson({ shirt: [0xc2412d, 0xf2c14e, 0xa9c46a, 0xf3ecdc, 0x3a5a7a, 0xe8a33d][i % 6], front: ['#c2412d', '#f2c14e', '#a9c46a', '#f3ecdc', '#3a5a7a', '#e8a33d'][i % 6], pants: [0x2a2a2a, 0x3a3a5a, 0xd8ccb0][i % 3], belly: (i % 3) * 0.3, skin: [0xe4ab88, 0xc88a64, 0x9a6a4a, 0xf0c4a2][i % 4] });
      p.position.set(OX + x, 0, Z0 + z); root.add(p); dancers.push({ p, home: [x, z], route: null, gone: false, ph: i * 0.7 });
    }
    let panic = false, lastT = 0, t = 0;
    const pl = []; for (let i = 0; i < 20; i++) pl.push([OX - 10 + Math.random() * (W + 20), Math.random() * 7, 0.3 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 28, OX + W + 12, 20]], 800));
    return { tick(dt) {
      t += dt; for (const f of ticks) f(dt);
      ball.rotation.y += dt; spots.forEach((s, i) => { const a = t * (0.8 + i * 0.25) + i * 1.6; s.position.set(OX + 30 + Math.cos(a) * 7, 0.06, Z0 + 17 + Math.sin(a * 1.2) * 5); });
      const R = run();
      if (R.time < lastT) { panic = false; for (const d of dancers) { d.gone = false; d.route = null; d.p.visible = true; d.p.position.set(OX + d.home[0], 0, Z0 + d.home[1]); } }
      lastT = R.time;
      if (!panic && (R.shots > 0 || R.kills > 0)) panic = true;
      for (const d of dancers) {
        if (d.gone) continue;
        if (!panic) { animate(d.p, 0, dt); d.p.position.y = Math.abs(Math.sin(t * 6 + d.ph)) * 0.12; d.p.rotation.y = Math.sin(t * 2 + d.ph) * 0.8; continue; }
        d.p.position.y = 0;
        if (!d.route) d.route = path(d.p.position, exitV) || [exitV.clone()];
        const nx = d.route[0]; if (!nx) { d.gone = true; d.p.visible = false; continue; }
        const dx = nx.x - d.p.position.x, dz = nx.z - d.p.position.z, dd = Math.hypot(dx, dz), sp = 4.6;
        if (dd < 0.25) { d.route.shift(); if (!d.route.length) { d.gone = true; d.p.visible = false; } continue; }
        d.p.position.x += dx / dd * sp * dt; d.p.position.z += dz / dd * sp * dt; d.p.rotation.y = Math.atan2(dx, dz); animate(d.p, sp, dt);
      }
    } };
  },
};
