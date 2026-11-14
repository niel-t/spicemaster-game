// Act 2, mission 8: Quinoaplantage (Hipsterheuvel). Graanschuur De Superkorrel: a gabled grain shop fronting the Noshgey grain
// warehouse, with a lounge on the mezzanine. Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate
// conventions. Built after the concept art (02_Act2_Quinoaplantage): two gabled houses on a corner, a warehouse of grain sacks,
// barrels, copper vats and crates, and a neon-lit lounge up on the mezzanine.
// The twist: shoot a pile of grain sacks and it bursts into a dust cloud that blocks sight for a few seconds, for everyone.
//   street → shop → warehouse → stairs → lounge · shop → office → lounge · street → loading door → warehouse

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { NOSHGEY } from './noshgey.js';

const W = 44, H = 30;

export default {
  ...NOSHGEY,
  id: 'quinoaplantage', name: 'Quinoaplantage', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['office', 1, 1, 12, 13, 'panel'], ['shop', 1, 15, 12, 24, 'shoptile'],
    ['lounge', 14, 1, 42, 9, 'lounge'], ['warehouse', 14, 11, 42, 24, 'concrete'],
    ['street', 1, 26, 42, 29, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    carve(5, 25, 6, 25); carve(0, 26, 0, 29); carve(43, 26, 43, 29);
    carve(38, 10, 40, 10);      // the stairs up to the mezzanine lounge
    putR(5, 14, 6, 14, 'D');    // shop ↔ office
    putR(13, 19, 13, 20, 'D');  // shop ↔ warehouse
    putR(13, 4, 13, 5, 'D');    // office ↔ lounge
    putR(20, 10, 21, 10, 'D');  // warehouse ↔ lounge
    putR(30, 25, 31, 25, 'D');  // warehouse ↔ street (loading door)
    putR(1, 25, 4, 25, '%'); putR(7, 25, 12, 25, '%'); putR(25, 10, 33, 10, '%'); // shop windows; the mezzanine rail looks down on the warehouse
    // shop: counter, shelves of grains, a table
    putR(2, 17, 9, 17, 'K'); putR(12, 15, 12, 18, 'R'); put(4, 21, 'T'); put(1, 24, 'p');
    // office: desk, safe, filing
    putR(4, 4, 7, 4, 'O'); put(1, 1, 'V'); putR(10, 1, 12, 1, 'F'); putR(2, 10, 3, 11, 'C');
    // lounge: the bar, sofas, tables, plants
    putR(16, 1, 24, 1, 'B'); putR(27, 4, 27, 6, 'S'); putR(42, 2, 42, 6, 'S'); put(31, 5, 'T'); put(36, 3, 'T'); put(17, 7, 'T'); put(14, 9, 'p'); put(34, 9, 'p');
    // warehouse: sack piles (shootable), barrels, copper vats, crates
    for (const [x, z, w] of [[16, 13, 3], [24, 13, 2], [33, 13, 3], [17, 18, 2], [27, 17, 3], [36, 19, 2], [20, 22, 3], [32, 22, 2]]) putR(x, z, x + w - 1, z, 'n');
    putR(40, 13, 41, 14, 'U'); putR(40, 17, 41, 18, 'U'); putR(23, 19, 24, 20, 'e'); putR(14, 24, 15, 24, 'C'); put(42, 24, 'X'); put(14, 11, 'X');
    put(1, 29, 'l'); put(22, 29, 'l'); put(42, 29, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x8a6a42 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xd8c8a0 }), cx, 1.03, cz, root, false); } },
    n: { h: 1.1, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { for (let k = 0; k < n; k++) for (let j = 0; j < 3; j++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.34, 0.6), lam({ color: [0xd8c8a0, 0xc8b48a, 0xe0d4b0][(x + k + j) % 3] })); s.position.set(OX + x + k + 0.5, 0.18 + j * 0.35, cz + (j % 2 ? 0.05 : -0.05)); s.rotation.y = (j % 2 ? 0.1 : -0.06); root.add(s); } } },
    U: { h: 2.0, cover: true, draw: ({ cyl, lam, root, cx, cz, z, x, G }) => { if (G[z - 1][x] === 'U') return; cyl(0.9, 0.9, 2.0, lam({ color: 0xb8742a }), cx, 1.0, cz + 0.5, root, 16); } },
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) cyl(0.4, 0.4, 1.0, lam({ color: 0x6a3a1a }), OX + x + k + 0.5, 0.5, cz, root, 14); } },
    B: { color: 0x3a2a24 }, S: { color: 0xc2412d }, R: { color: 0x6a4a2a },
  },
  rackGoods: [0xd8c8a0, 0xe8a33d, 0xa9c46a],
  floors: {
    lounge: (g) => { g.fillStyle = '#3a1e1a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(232,163,61,${Math.random() * 0.07})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3ecdc' : '#c8a060'; g.fillRect(x * 16, y * 16, 16, 16); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { lounge: 2, shoptile: 1.2, panel: 1.5, cobble: 1.6 },
  hallCells: [[5, 25], [6, 25], [38, 10], [39, 10], [40, 10]],
  doorSigns: { '30,25': 'LOSSEN', '13,4': 'LOUNGE', '5,14': 'KANTOOR' },
  neon: { office: 0xe8a33d, shop: 0xf3e6c8, lounge: 0xc2412d, warehouse: 0xffd8a0, street: 0xe8a33d },
  lights: [[6, 20, 0xf3e6c8, 1.6], [6, 6, 0xe8a33d, 1.3], [20, 5, 0xc2412d, 1.5], [33, 5, 0xe8a33d, 1.5], [20, 16, 0xffe0b0, 1.5], [30, 16, 0xffe0b0, 1.5], [36, 21, 0xffe0b0, 1.3], [24, 22, 0xffe0b0, 1.2], [8, 28, 0xe8a33d, 1.0], [34, 28, 0xe8a33d, 1.0]],
  mood: { bg: 0x081018, fogNear: 32, fogFar: 78, hemi: 0.48, sun: 0.5, sky: 0xf0f0dc, ground: 0x3a3830, wall: 0x6a3428, cap: 0xe0d4bc, under: 0x3a2a24 },
  van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] },
  start: [6, 1.0],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [6, 27.5],
  bossLook: { cap: 0xc8a060, shirt: 0x5a6a3a, front: '#5a6a3a', pants: 0xd8c8a0, belly: 1.2, head: { hair: '#5a4a3a', brow: '#3a2a1a', hairLine: 50, iris: '#3a3a2a' } }, // Opzichter Korrel: overseer's waistcoat, straw hat
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [10, 27.5, 'bat', Math.PI / 2, 'street'], [36, 27.5, 'makarov', -Math.PI / 2, 'street'],
    [4, 19, 'makarov', Math.PI, 'shop'], [10, 22, 'bat', -Math.PI / 2, 'shop'], [8, 8, 'bat', Math.PI, 'office'],
    [20, 15.5, 'makarov', Math.PI, 'warehouse'], [29, 15, 'bat', Math.PI / 2, 'warehouse'], [37, 16, 'makarov', -Math.PI / 2, 'warehouse'], [16, 21, 'bat', Math.PI / 2, 'warehouse'], [28, 21, 'shotgun', Math.PI, 'warehouse'], [38, 23, 'bat', -Math.PI / 2, 'warehouse'],
    [33, 2.5, 'shotgun', 0, 'lounge', true], [20, 4.5, 'makarov', Math.PI / 2, 'lounge'], [38, 7, 'makarov', -Math.PI / 2, 'lounge'], [29, 8, 'bat', Math.PI, 'lounge'],
  ],
  loot: [[1.5, 12.5], [12, 2.5], [41.5, 1.5], [14.5, 12.5], [42, 21.5], [26.5, 24]], // cell
  text: {
    area: 'HIPSTERHEUVEL · QUINOAPLANTAGE',
    banner: ['DE SUPERKORREL', 'Quinoaplantage. Superfoods by the tonne.'],
    objective: 'Take <b>De Superkorrel</b>: the shop, the grain warehouse and the lounge on the mezzanine. <b>Shoot a sack pile</b> and the dust cloud blinds everyone for a few seconds. Opzichter Korrel watches from the lounge. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Quinoaplantage is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Quinoaplantage is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'QUINOAPLANTAGE TAKEN',
    resultsHint: 'The dust has settled. Grab the spice crates (E), then drive home.',
    ownedBanner: ['QUINOAPLANTAGE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['OPZICHTER KORREL IS DOWN', 'Harvested.'],
    tips: ['Shoot a sack pile to throw up a dust cloud: nobody sees through it, you included.', 'The mezzanine rail is glass: the lounge looks down on the warehouse.', 'Sack piles stop bullets until you burst them.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, smokeAt, popup }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    for (let s = 0; s < 4; s++) box(12 - s * 3, 1.1, 0.6, lam({ color: 0x7a3a2a }), OX + 6.5, WALL_H + 0.55 + s * 1.1, Z0 + 25.4, root, false);
    sign('DE SUPERKORREL', 5.4, 0.55, '#0a140c', '#e8a33d', OX + 6.5, 2.75, Z0 + 25.02, 0, 60); neonRect(root, OX + 6.5, 2.75, 5.6, 0.7, Z0 + 25.06, 0xe8a33d);
    sign('QUINOA · SPELT · GIERST', 6, 0.42, '#1a1a1a', '#d8c8a0', OX + 28, 2.8, Z0 + 25.02, 0, 40);
    // dust clouds: a burst sack pile throws up a cloud that blocks sight for 5 seconds
    const dustM = new THREE.MeshBasicMaterial({ color: 0xe8dcc0, transparent: true, opacity: 0.0, depthWrite: false });
    const clouds = [];
    const piles = new Map();
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'n') piles.set(`${x},${z}`, { x, z, burst: false });
    const pl = []; for (let z = 26; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 26, OX + W + 12, 8]], 800));
    return {
      onShot(ch, x, z) {
        const p = piles.get(`${x},${z}`); if (ch !== 'n' || !p || p.burst) return false;
        p.burst = true; smokeAt(x + 0.5, z + 0.5, 2.6, 5); popup(new THREE.Vector3(OX + x + 0.5, 0, Z0 + z + 0.5), 'STOFWOLK!', '#e8dcc0', true);
        const g = new THREE.Group(); g.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); root.add(g);
        for (let k = 0; k < 9; k++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), dustM.clone()); m.rotation.x = -Math.PI / 2; m.position.set((Math.random() - 0.5) * 2.6, 0.6 + k * 0.22, (Math.random() - 0.5) * 2.6); g.add(m); }
        clouds.push({ g, t: 0 }); return true;
      },
      tick(dt) {
        for (const f of ticks) f(dt);
        for (let i = clouds.length - 1; i >= 0; i--) { const c = clouds[i]; c.t += dt; const op = c.t < 0.3 ? c.t / 0.3 * 0.55 : c.t > 4.2 ? Math.max(0, 0.55 * (5 - c.t) / 0.8) : 0.55; c.g.children.forEach((m, k) => { m.material.opacity = op; m.rotation.z += dt * 0.2 * (k % 2 ? 1 : -1); m.scale.setScalar(1 + c.t * 0.12); }); if (c.t > 5) { root.remove(c.g); clouds.splice(i, 1); } }
      },
    };
  },
};
