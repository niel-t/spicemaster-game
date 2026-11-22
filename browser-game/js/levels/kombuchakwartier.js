// Act 2, mission 4: Kombucha-kwartier (Hipsterheuvel). Kombucha Collectief: a gabled brick kombucha bar with a palm lounge, and the
// Noshgey fermentation hall behind it. Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate
// conventions. Built after the concept art (02_Act2_Kombucha_kwartier): a tall brick gable with a lit shop window, a lounge full of
// palms and padded booths, and a hall of copper fermentation tanks linked by pipes, with a control desk.
// The twist: the tanks are under pressure. Shoot one and it bursts like a barrel: everyone close is blown away.
//   street → bar → lounge → fermentation hall → lab (Fermenteur Floor) · lounge → mixing room → street (LEVERINGEN)

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { eastSide, plate } from './story.js';
import { NOSHGEY } from './noshgey.js';

const W = 40, H = 28;
const TANKS = [[16, 2], [21, 2], [26, 2], [31, 2], [16, 7], [26, 7], [35, 6]]; // 2x2 copper tanks (top-left cell)

export default eastSide({
  ...NOSHGEY,
  id: 'kombuchakwartier', name: 'Kombucha-kwartier', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['lab', 1, 1, 12, 11, 'tiles'], ['hall', 14, 1, 38, 11, 'brew'],
    ['bar', 1, 13, 12, 22, 'pine'], ['lounge', 14, 13, 26, 22, 'lounge'], ['mixing', 28, 13, 38, 22, 'tiles'],
    ['street', 1, 24, 38, 27, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(5, 23, 6, 23); carve(0, 24, 0, 27); carve(39, 24, 39, 27);
    putR(13, 17, 13, 18, 'D');  // bar ↔ lounge
    putR(19, 12, 20, 12, 'D');  // lounge ↔ hall
    putR(13, 5, 13, 6, 'D');    // hall ↔ lab
    putR(6, 12, 7, 12, 'D');    // bar ↔ lab
    putR(27, 17, 27, 18, 'D');  // lounge ↔ mixing room
    putR(33, 12, 34, 12, 'D');  // hall ↔ mixing room
    putR(33, 23, 34, 23, 'D');  // mixing room ↔ street (LEVERINGEN)
    putR(1, 23, 4, 23, '%'); putR(7, 23, 12, 23, '%'); putR(16, 23, 24, 23, '%'); putR(13, 3, 13, 4, '%'); // windows; the lab window onto the hall
    // bar: the counter with taps, palms, stools
    putR(2, 15, 9, 15, 'K'); put(12, 13, 'F'); put(1, 22, 'p'); put(12, 22, 'p'); put(4, 19, 'T'); put(9, 20, 'T');
    // lounge: padded booths, low tables, palms
    putR(14, 14, 14, 16, 'S'); putR(14, 20, 14, 22, 'S'); putR(26, 19, 26, 22, 'S'); put(18, 15, 'T'); put(18, 20, 'T'); put(23, 17, 'T'); put(26, 13, 'p'); put(22, 22, 'p'); put(17, 22, 'p');
    // fermentation hall: copper tanks (decorate), barrels, a control desk
    for (const [x, z] of TANKS) putR(x, z, x + 1, z + 1, 'U');
    putR(21, 8, 22, 9, 'e'); putR(31, 8, 32, 9, 'e'); put(38, 1, 'C'); putR(36, 10, 38, 10, 'C');
    // lab: control desk, a safe, shelves of SCOBY jars
    putR(3, 3, 7, 3, 'O'); put(1, 1, 'V'); putR(9, 1, 12, 1, 'R'); putR(2, 9, 4, 9, 'w');
    // mixing room
    putR(30, 15, 33, 16, 'w'); putR(37, 20, 38, 21, 'C'); put(28, 22, 'C');
    // street
    put(1, 27, 'l'); put(20, 27, 'l'); put(38, 27, 'l'); putR(15, 25, 17, 25, 'v'); put(10, 26, 't');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, cyl, lam, root, n, cx, cz, x, OX }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x6a3a1a }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xd8ccb0 }), cx, 1.03, cz, root, false); for (let k = 0; k < n; k += 2) cyl(0.04, 0.04, 0.4, lam({ color: 0xb8742a }), OX + x + k + 0.5, 1.25, cz - 0.2, root, 6); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    U: { h: 2.0, cover: true, draw: () => {} },
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { cyl(0.4, 0.4, 1.0, lam({ color: 0x6a3a1a }), OX + x + k + 0.5, 0.5, cz, root, 14); for (const y of [0.2, 0.8]) cyl(0.42, 0.42, 0.06, lam({ color: 0x2a2a2a }), OX + x + k + 0.5, y, cz, root, 14); } } },
    S: { color: 0xc2412d }, R: { color: 0x4a3a2a },
  },
  rackGoods: [0xd8c8a0, 0xa9c46a, 0xc87a3a],
  floors: {
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#8a5a3a', '#7a4e32', '#946240'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    lounge: (g) => { g.fillStyle = '#4a2a24'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(232,163,61,${Math.random() * 0.08})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } },
    brew: (g) => { g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#3e3228'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { pine: 1.5, lounge: 2, brew: 1.4, cobble: 1.6 },
  hallCells: [[5, 23], [6, 23]],
  doorSigns: { '33,23': 'LEVERINGEN', '19,12': 'FERMENTATIE', '13,5': 'LAB' },
  neon: { lab: 0xa9c46a, hall: 0xffa050, bar: 0xe8a33d, lounge: 0xc2412d, mixing: 0xf2c14e, street: 0xe8a33d },
  lights: [[6, 18, 0xe8a33d, 1.6], [20, 17, 0xff9a6a, 1.4], [6, 6, 0xa9c46a, 1.3], [19, 5, 0xffa050, 1.5], [29, 5, 0xffa050, 1.5], [35, 9, 0xffa050, 1.2], [33, 18, 0xf2c14e, 1.2], [6, 26, 0xe8a33d, 1.0], [28, 26, 0xe8a33d, 1.0]],
  mood: { bg: 0x081018, fogNear: 30, fogFar: 74, hemi: 0.48, sun: 0.5, sky: 0xf0f0dc, ground: 0x3a3830, wall: 0x7a3a2a, cap: 0xe0d4bc, under: 0x3a2a24 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [6, -0.7],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [6, 25.5],
  bossLook: { cap: 0xa9c46a, shirt: 0xf3ecdc, front: '#f3ecdc', pants: 0x3a3a2a, belly: 0.5, head: { hair: '#a8402a', brow: '#7a2e1a', hairLine: 48, glasses: true, iris: '#3a5a3a' } }, // Fermenteur Floor: lab coat, red hair
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [9, 25.5, 'bat', Math.PI / 2, 'street'], [27, 25.5, 'makarov', -Math.PI / 2, 'street'],
    [4, 17, 'makarov', Math.PI, 'bar'], [10, 21, 'bat', Math.PI, 'bar'], [11, 16.5, 'bat', -Math.PI / 2, 'bar'],
    [17, 18, 'makarov', Math.PI / 2, 'lounge'], [22, 14.5, 'bat', 0, 'lounge'], [24, 21, 'makarov', -Math.PI / 2, 'lounge'],
    [19, 5.5, 'bat', Math.PI / 2, 'hall'], [24, 5.5, 'makarov', Math.PI, 'hall'], [29, 6, 'bat', -Math.PI / 2, 'hall'], [34, 3, 'makarov', -Math.PI / 2, 'hall'], [24, 10, 'shotgun', Math.PI, 'hall'],
    [5, 1.6, 'shotgun', 0, 'lab', true], [9, 6, 'makarov', -Math.PI / 2, 'lab'],
    [31, 19.5, 'bat', Math.PI, 'mixing'], [36, 14, 'makarov', -Math.PI / 2, 'mixing'],
  ],
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a three-metre glass fermenting jar on the pavement, amber kombucha, the mother floating, bubbles rising
      const { THREE, root, box, cyl, lam } = c, p = c.at(24, 0); p.z = 1.5;
      cyl(0.8, 0.9, 0.3, lam({ color: 0xb87333 }), p.x, 0.15, p.z, root, 20); c.solid(p.x - 0.85, p.x + 0.85, p.z - 0.85, p.z + 0.85);
      const brew = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 2.3, 20), new THREE.MeshPhongMaterial({ color: 0xd8862a, transparent: true, opacity: 0.75, emissive: 0x4a2408 })); brew.position.set(p.x, 1.5, p.z); root.add(brew);
      const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 2.7, 20, 1, true), new THREE.MeshPhongMaterial({ color: 0xd8f0ff, transparent: true, opacity: 0.25, shininess: 140, side: THREE.DoubleSide, depthWrite: false })); jar.position.set(p.x, 1.65, p.z); root.add(jar);
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.74, 0.3, 20), lam({ color: 0xb87333 })); lid.position.set(p.x, 3.1, p.z); root.add(lid);
      const mother = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 18), lam({ color: 0xe8d8b0 })); mother.position.set(p.x, 2.55, p.z); root.add(mother);
      const bubbles = []; for (let i = 0; i < 10; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.04 + (i % 3) * 0.02, 6, 5), new THREE.MeshBasicMaterial({ color: 0xffe0a0, transparent: true, opacity: 0.7 })); b.position.set(p.x + Math.cos(i * 2.3) * 0.4, 0.5 + i * 0.2, p.z + Math.sin(i * 2.3) * 0.4); root.add(b); bubbles.push(b); }
      c.plate('LEVENDE KOMBUCHA · NIET TIKKEN', p.x, 0.15, p.z + 0.92, 0, 1.5, 0.22, '#2a1a0e', '#e8a33d');
      const gl = c.glow(0xe8a33d, 3, 4, 0.35); gl.position.set(p.x, 1.6, p.z); root.add(gl);
      let t = 0; return (dt) => { t += dt; mother.position.y = 2.55 + Math.sin(t * 0.8) * 0.03; for (const b of bubbles) { b.position.y += dt * 0.5; if (b.position.y > 2.45) b.position.y = 0.4; } };
    } },
    { k: 'board', at: [16.5, 1.5], wall: 'n', style: 'white', title: 'NIET AANRAKEN', lines: ['De moeder is heilig.', 'Wie haar aanraakt,', 'gaat de tank in.', '- Floor'], read: ['NIET AANRAKEN', '"The mother is sacred. Whoever touches her goes in the tank." Signed Floor, the head brewer.'] },
    { k: 'papers', at: [6.5, 8.5], read: ['LABJOURNAAL', "Batch 112: added Lampas fryer oil, tastes like victory. Batch 113: a pinch of kipkruiden from Eddy's stall. Customers cried. Sales doubled."] },
    { k: 'spill', at: [26.5, 9.5], color: 0xd8862a, r: 0.7 }, { k: 'crates', at: [36.5, 9.5], label: 'FLESSEN', color: '#b87333' },
    { k: 'candles', at: [18.5, 15.5], y: 0.77, n: 3 },
    { k: 'poster', at: [1.5, 18.5], wall: 'w', w: 0.9, h: 1.2, style: 'green', title: 'KOMBUCHA', lines: ['W 7', 'probiotisch', 'spiritueel', 'bubbels'] },
  ],
  loot: [[1.5, 10.5], [12, 2.5], [14.5, 10.5], [38, 3.5], [38, 13.5], [28.5, 21]], // cell
  text: {
    area: 'HIPSTERHEUVEL · KOMBUCHA-KWARTIER',
    banner: ['KOMBUCHA COLLECTIEF', 'Kombucha-kwartier. Fermented, filtered, under pressure.'],
    objective: 'Take the <b>Kombucha Collectief</b>: the bar, the palm lounge and the fermentation hall. <b>The copper tanks burst when shot</b>: lure the Noshgey close. Fermenteur Floor runs the lab. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Kombucha-kwartier is <b>yours</b>. Flat kombucha for everyone. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Kombucha-kwartier is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'KOMBUCHA-KWARTIER TAKEN',
    resultsHint: 'The tanks have popped and the lab is quiet. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KOMBUCHA-KWARTIER IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['FERMENTEUR FLOOR IS DOWN', 'Over-fermented.'],
    tips: ['Copper tanks burst like red barrels. Keep your distance when you shoot one.', 'The lab window looks out on the hall. Floor sees you coming.', 'Booths and tables in the lounge don\'t stop bullets.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, spill }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    // the tall brick gable over the bar, the shop sign
    for (let s = 0; s < 4; s++) box(12 - s * 3, 1.1, 0.6, lam({ color: 0x7a3a2a }), OX + 6.5, WALL_H + 0.55 + s * 1.1, Z0 + 23.4, root, false);
    sign('KOMBUCHA COLLECTIEF', 6, 0.55, '#0a140c', '#f3e6c8', OX + 6.5, 2.75, Z0 + 23.02, 0, 56); neonRect(root, OX + 6.5, 2.75, 6.2, 0.7, Z0 + 23.06, 0xa9c46a);
    sign('PALM LOUNGE', 3.6, 0.45, '#140a0a', '#e8a33d', OX + 20, 2.7, Z0 + 23.02, 0, 48);
    // palms (bigger than the default plant) in the bar and lounge
    for (const [x, z] of [[1, 22], [12, 22], [26, 13], [22, 22], [17, 22]]) for (let k = 0; k < 5; k++) { const leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.2), lam({ color: 0x4a7a3a, side: THREE.DoubleSide })); leaf.position.set(OX + x + 0.5, 1.5, Z0 + z + 0.5); leaf.rotation.set(-0.9, k * 1.25, 0); root.add(leaf); }
    // copper fermentation tanks with pipes: shoot one and it blows
    const tanks = new Map();
    for (const [x, z] of TANKS) {
      const g = new THREE.Group(); g.position.set(OX + x + 1, 0, Z0 + z + 1); root.add(g);
      cyl(0.9, 0.9, 2.0, lam({ color: 0xb8742a }), 0, 1.0, 0, g, 18); const top = new THREE.Mesh(new THREE.ConeGeometry(0.9, 0.6, 18), lam({ color: 0xc8843a })); top.position.y = 2.3; g.add(top);
      for (const a of [0.6, 2.4]) { const gauge = new THREE.Mesh(new THREE.CircleGeometry(0.14, 12), new THREE.MeshBasicMaterial({ color: 0xf3ecdc })); gauge.position.set(Math.sin(a) * 0.91, 1.4, Math.cos(a) * 0.91); gauge.rotation.y = a; g.add(gauge); }
      const t = { g, burst: false };
      for (const [dx, dz] of [[0, 0], [1, 0], [0, 1], [1, 1]]) tanks.set(`${x + dx},${z + dz}`, t);
    }
    for (const z of [1.3, 10.6]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 24, 8), lam({ color: 0xb8742a })); p.rotation.z = Math.PI / 2; p.position.set(OX + 26, WALL_H - 0.4, Z0 + z); root.add(p); }
    const pl = []; for (let z = 24; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 8]], 800));
    return {
      onShot(ch, x, z) { const t = tanks.get(`${x},${z}`); if (!t || t.burst) return false; t.burst = true; t.g.scale.set(1.08, 0.5, 1.08); t.g.rotation.z = 0.3; spill(t.g.position, 2.6, { text: 'FIZZ! BOOM!', color: 0xe8a33d, kill: true, scorch: true }); return true; },
      tick(dt) { for (const f of ticks) f(dt); },
    };
  },
}, { kind: 'door', door: [5, 6], street: [24, 27], sign: 'ACHTERDEUR', tip: 'The quiet way in: the alley on the east side, past the bottle bins, to the brew hall\'s back door. Nobody guards the empties.', read: ['ACHTERDEUR', '"LEGE FLESSEN HIER. Niet roken: alles hier gist." The back door is held open with a crate of empties.'] });
