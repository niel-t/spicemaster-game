// Mission 3: Uitjesbuurt. A white-painted brick corner snackbar on a street of tall canal houses, night, rain.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (00_Start_Uitjesbuurt): a terrace wraps the corner (planters, bistro tables, benches, lamps), the shop has neon and a döner,
// and a back hallway leads down the stairs into the basement: a vaulted onion cellar with a glowing oven, and through a
// hidden opening, the Lampas' smoky gambling den where the lieutenant plays cards.
// The engine is single-floor, so the basement lies behind the shop on the same grid, reached by a stair cell run.
//   terrace → shop → hallway → stairs → onion cellar → delivery ramp → side terrace → terrace
//   cellar → hidden opening / den door → gambling den

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';

const W = 34, H = 28;

export default {
  id: 'uitjesbuurt', name: 'Uitjesbuurt', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['den', 1, 1, 6, 11, 'wood'], ['cellar', 8, 1, 24, 11, 'cellarbrick'], ['stairs', 20, 12, 23, 16, 'steps'],
    ['shop', 1, 15, 15, 20, 'shoptile'], ['hallway', 17, 17, 24, 20, 'hall'],
    ['terrace', 1, 22, 32, 27, 'cobble'], ['side', 26, 5, 32, 21, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    // doors and openings
    putR(8, 21, 9, 21, 'D');   // the front door under the blue name plate
    putR(16, 18, 16, 19, 'D'); // shop ↔ back hallway
    putR(25, 18, 25, 19, 'D'); // back hallway ↔ side terrace
    putR(25, 7, 25, 8, 'D');   // onion cellar ↔ delivery ramp on the side street
    putR(7, 3, 7, 4, 'D');     // onion cellar ↔ gambling den
    carve(7, 9, 7, 10);        // the hidden opening behind the shelf
    carve(0, 22, 0, 27); carve(33, 5, 33, 27); // the pavement runs on round the corner
    // glass: shop windows and the hallway window onto the terrace
    putR(2, 21, 6, 21, '%'); putR(11, 21, 14, 21, '%'); putR(19, 21, 22, 21, '%');
    // shop: the counter with the döner, bistro tables
    putR(3, 16, 13, 16, 'K'); put(2, 19, 't'); put(13, 19, 't');
    put(24, 17, 'C');
    // onion cellar: the oven at the back, onion sacks, crates, vault pillars
    putR(14, 1, 17, 1, 'H'); putR(9, 2, 10, 3, 'n'); putR(19, 6, 20, 7, 'n'); putR(11, 8, 12, 8, 'n'); putR(22, 2, 23, 3, 'C'); putR(16, 9, 17, 9, 'C');
    put(12, 5, '#'); put(18, 5, '#');
    // gambling den: the poker table, a shelf of bottles, a barrel, crates of bottles
    putR(2, 4, 4, 5, 'c'); putR(1, 7, 1, 8, 'B'); put(6, 1, 'e'); putR(1, 10, 2, 11, 'C');
    // terrace: planters, bistro tables, a bench, street lamps, bollards
    putR(2, 23, 5, 23, 'v'); putR(11, 23, 14, 23, 'v'); put(3, 25, 't'); put(7, 25, 't'); put(12, 25, 't'); putR(17, 23, 19, 23, 'h');
    put(1, 26, 'l'); put(16, 26, 'l'); put(31, 26, 'l'); for (const x of [4, 10, 22, 28]) put(x, 27, 'o');
    putR(27, 12, 27, 15, 'v'); put(30, 11, 't'); put(30, 18, 't'); put(32, 9, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { color: 0x2a4a8a },
    B: { color: 0x5a3a1a },
    H: { h: 1.6, cover: true, draw: ({ THREE, root, box, lam, n, h, cx, cz }) => { // the brick oven, glowing
      box(n - 0.06, h, 0.95, lam({ color: 0x8a3a24 }), cx, h / 2, cz, root);
      const mouth = new THREE.Mesh(new THREE.PlaneGeometry(n - 1.2, 0.6), new THREE.MeshBasicMaterial({ color: 0xff8a2a })); mouth.position.set(cx, 0.6, cz + 0.48); root.add(mouth);
      const gl = glowSprite(THREE, 0xff7a1a, n + 1.5, 2.2, 0.6); gl.position.set(cx, 0.8, cz + 0.9); root.add(gl);
    } },
    n: { h: 0.9, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { // a pile of onion sacks
      for (let k = 0; k < n; k++) for (let j = 0; j < 3; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.32, 8, 6), lam({ color: [0xb89a6a, 0xa8885a, 0xc8aa78][(x + k + j) % 3] })); s.scale.set(1, 0.75, 1.2); s.position.set(OX + x + k + 0.5 + (j - 1) * 0.12, 0.25 + (j === 2 ? 0.45 : 0), cz + (j - 1) * 0.25); root.add(s); }
    } },
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { cyl(0.38, 0.38, 1.0, lam({ color: 0x7a4a24 }), OX + x + k + 0.5, 0.5, cz, root, 14); for (const y of [0.2, 0.8]) cyl(0.4, 0.4, 0.06, lam({ color: 0x2a2a2a }), OX + x + k + 0.5, y, cz, root, 14); } } },
  },
  rackGoods: [0xb89a6a, 0xd8c8a0, 0x8a6a3a],
  floors: {
    wood: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#5a3a20', '#6a4426', '#4a301a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 7) % 64, y, 1, 8); } },
    cellarbrick: (g) => { g.fillStyle = '#2a1410'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 8; x < 64; x += 16) { g.fillStyle = ['#5a2a1e', '#4a2218', '#62301f'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 14, 6); } },
    steps: (g) => { for (let y = 0; y < 64; y += 16) { g.fillStyle = '#5a5048'; g.fillRect(0, y, 64, 12); g.fillStyle = '#2a2420'; g.fillRect(0, y + 12, 64, 4); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#e8ecf0' : '#3a6ab8'; g.fillRect(x * 16, y * 16, 16, 16); } },
    cobble: (g) => { g.fillStyle = '#3a3a40'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4a52', '#55555c', '#44444a'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { cobble: 1.6, wood: 1.5, cellarbrick: 1.4, steps: 1.0, shoptile: 1.2 },
  hallCells: [[7, 9], [7, 10], [0, 22], [0, 23], [0, 24], [0, 25], [0, 26], [0, 27]],
  doorSigns: { '8,21': 'UITJESBUURT', '25,7': 'KELDER' },
  neon: { den: 0xffd27a, cellar: 0xff8a3a, shop: 0xff3fa4, hallway: 0x3ff0ff, terrace: 0x3ff0ff },
  lights: [[8, 18, 0xff3fa4, 2.0], [3, 17, 0x3ff0ff, 1.2], [21, 19, 0xe8f4ff, 1.0], [16, 3, 0xff8a3a, 2.4], [12, 8, 0xffa050, 1.5], [22, 8, 0xffa050, 1.4], [3.5, 4.5, 0xffd27a, 1.7], [21.5, 14, 0xff9a50, 0.8], [9, 25, 0x5a8aff, 1.4], [24, 25, 0x5a8aff, 1.4], [29, 12, 0x5a8aff, 1.2]],
  mood: { bg: 0x060d1c, fogNear: 26, fogFar: 66, hemi: 0.45, sun: 0.6, wall: 0xe4e0d6, cap: 0xf2f0ea, under: 0x3a3a44 },
  van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] }, // world; drives in along the street, nose first
  start: [9, -0.6],              // world: on the pavement in front of the terrace
  bounds: [0.5, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [9, 26.5],       // cell: the pavement
  bossLook: { cap: 0x1a1a1a, shirt: 0x1a1a1a, front: '#1a1a1a', pants: 0x2a2a3a, belly: 0.6, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 50, glasses: true, iris: '#3a3a3a' } },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, { cap }
    [4, 24, 'bat', Math.PI, 'terrace'], [20, 25, 'makarov', Math.PI / 2, 'terrace'], [29, 16, 'bat', Math.PI, 'side'], [30, 8, 'makarov', 0, 'side'],
    [4, 17.5, 'makarov', Math.PI, 'shop'], [12, 18, 'bat', -Math.PI / 2, 'shop'], [6, 15.5, 'bat', Math.PI / 2, 'shop'],
    [21, 19, 'makarov', Math.PI, 'hallway'],
    [10, 4.5, 'bat', 0, 'cellar', false, { cap: 0x2a6aff }], [15, 6, 'makarov', Math.PI, 'cellar', false, { cap: 0x2a6aff }], [20, 3, 'bat', Math.PI / 2, 'cellar', false, { cap: 0x2a6aff }],
    [22, 9, 'makarov', -Math.PI / 2, 'cellar'], [12, 10, 'bat', 0, 'cellar', false, { cap: 0x2a6aff }],
    [3, 3, 'shotgun', 0, 'den', true], [5.5, 4.5, 'makarov', -Math.PI / 2, 'den', false, { cap: 0x1a1a1a }], [3, 6.5, 'bat', Math.PI, 'den', false, { cap: 0x1a1a1a }],
  ],
  loot: [[1.5, 1.5], [24, 10.5], [14.5, 15.5], [24, 20.5]], // cell
  text: {
    area: 'KAASLAND · UITJESBUURT',
    banner: ['SNACKBAR UITJESBUURT', 'Uitjesbuurt. Something smells of onions downstairs.'],
    objective: 'Take <b>Snackbar Uitjesbuurt</b>: the shop, then down the stairs into the onion cellar. The lieutenant runs a card game somewhere down there. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Uitjesbuurt is <b>yours</b>. The card table is empty now. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Uitjesbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'UITJESBUURT UNLOCKED',
    resultsHint: 'The cellar is quiet and the card game is over. Grab the spice crates (E), then drive home.',
    ownedBanner: ['UITJESBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['THE LIEUTENANT IS DOWN', 'He folded.'],
    tips: ['Two ways into the cellar: the stairs behind the shop, or the delivery ramp on the side street.', 'The den has two ways in too. One of them is behind a shelf.', 'Planters, benches and bistro tables are low. Bullets fly over them.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the street and the pavement round the corner
    floorW(OX - 14, OX + W + 14, 2.6, 12, T.asphalt, 4); floorW(OX - 14, OX + W + 14, 0, 2.6, T.cobble, 1.6); floorW(OX - 14, OX, Z0 + 22, 0, T.cobble, 1.6);
    for (let x = -12; x < W + 14; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 7.3, root, false);
    // tall brick canal houses: next door, across the street, beyond the side street
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      const gab = new THREE.Mesh(new THREE.ConeGeometry(w * 0.55, 2.4, 4), lam({ color: c })); gab.position.set(x, h + 1.2, z); gab.rotation.y = Math.PI / 4; root.add(gab);
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 3) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xffd88a, 0xffb04a, 0x2a3040][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 3; i++) house(OX - 2.5 - i * 4.5, Z0 + 11, 4.4, 22, 9 + (i % 2) * 2, [0x6a3428, 0x4a2a24, 0x7a4430][i], 1);
    for (let i = 0; i < 10; i++) house(OX - 12 + i * 5.4, 16, 5.2, 6, 9 + (i * 3) % 4, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i % 4], -1);
    for (let i = 0; i < 3; i++) house(OX + W + 3, Z0 + 4 + i * 8, 6, 7.6, 10 + (i % 2) * 2, [0x4a2a24, 0x6a3428, 0x5a3a30][i], 1);
    box(8, 9, 5, lam({ color: 0x5a3a30 }), OX + 30, 4.5, Z0 + 2.5, root);
    // wall skins: vaulted red brick cellar, dark wood den, the stairwell
    const skin = (x0, z0, x1, z1, color) => {
      const m = lam({ color }), add = (x, z, rot) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1, WALL_H - 0.1), m); p.position.set(x, (WALL_H - 0.1) / 2, z); p.rotation.y = rot; root.add(p); };
      for (let x = x0; x <= x1; x++) { if (G[z0 - 1][x] === '#') add(OX + x + 0.5, Z0 + z0 + 0.012, 0); if (G[z1 + 1][x] === '#') add(OX + x + 0.5, Z0 + z1 + 1 - 0.012, Math.PI); }
      for (let z = z0; z <= z1; z++) { if (G[z][x0 - 1] === '#') add(OX + x0 + 0.012, Z0 + z + 0.5, Math.PI / 2); if (G[z][x1 + 1] === '#') add(OX + x1 + 1 - 0.012, Z0 + z + 0.5, -Math.PI / 2); }
    };
    skin(8, 1, 24, 11, 0x7a3424); skin(1, 1, 6, 11, 0x4a3020); skin(20, 12, 23, 16, 0x3a2a24);
    // the facade: blue name plate, neon in the windows, a round beer sign and a hanging sign (made-up names)
    sign('UITJESBUURT', 4.4, 0.6, '#1a4aa8', '#ffffff', OX + 8.5, 2.6, Z0 + 22.02, 0, 64);
    const neon = (t, x, w, c, hex) => { sign(t, w, 0.55, '#0a0a14', hex, OX + x, 1.9, Z0 + 22.04, 0, 64); neonRect(root, OX + x, 1.9, w + 0.15, 0.68, Z0 + 22.08, c); };
    neon('DÖNER', 4, 3.2, 0xff3fa4, '#ff3fa4'); neon('SNACKS', 12.5, 3, 0x3ff0ff, '#3ff0ff'); neon('OPEN', 20.5, 2, 0x7dff9a, '#7dff9a');
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.55, 24), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = '#c8202a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#f2efe6'; g.beginPath(); g.arc(64, 64, 48, 0, 7); g.fill(); g.fillStyle = '#c8202a'; g.font = '900 20px Arial'; g.textAlign = 'center'; g.fillText('KAAS', 64, 60); g.fillText('PILS', 64, 84); }) }));
    disc.position.set(OX + 25.6, 2.5, Z0 + 22.3); disc.rotation.y = Math.PI / 4; root.add(disc); box(0.6, 0.05, 0.05, lam({ color: 0x1a1a1a }), OX + 25.4, 2.5, Z0 + 22.1, root, false);
    box(0.05, 0.05, 1.0, lam({ color: 0x1a1a1a }), OX + 25.55, 2.9, Z0 + 18.5, root, false);
    sign('DE ZURE UI', 0.9, 0.55, '#2a1a12', '#ffd27a', OX + 25.58, 2.45, Z0 + 18.8, Math.PI / 2, 40);
    // inside the shop: döner, menu screens
    const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.9, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 5, 1.55, Z0 + 16.5); root.add(doner);
    [['DÖNER W 6', '#ffd27a'], ['UITJES W 1', '#7dff9a'], ['FRIET W 3', '#3ff0ff']].forEach(([t, c], i) => sign(t, 2.4, 0.65, '#0a0a14', c, OX + 5 + i * 3, 1.9, Z0 + 15.03, 0, 46));
    // the stairs down: steps getting darker, a rail, a sign
    for (let k = 0; k < 5; k++) box(4, 0.02, 0.9, lam({ color: [0x6a6058, 0x58504a, 0x48403a, 0x38322e, 0x2a2622][k] }), OX + 22, 0.03 + (4 - k) * 0.004, Z0 + 16.5 - k, root, false);
    box(0.06, 0.06, 5, lam({ color: 0xb8b0a0 }), OX + 20.1, 0.95, Z0 + 14.5, root, false); box(0.06, 0.06, 5, lam({ color: 0xb8b0a0 }), OX + 23.9, 0.95, Z0 + 14.5, root, false);
    sign('KELDER ↓', 1.6, 0.4, '#1a1a1a', '#ffd27a', OX + 22, 1.95, Z0 + 17 - 0.03 + 0.06, 0, 40);
    // the onion cellar: beams, hanging nets of onions
    for (const z of [3.5, 7.5, 10.5]) box(17, 0.18, 0.22, lam({ color: 0x3a2414 }), OX + 16.5, 2.12, Z0 + z, root, false);
    const onionM = lam({ color: 0xc8a060 });
    for (const [x, z] of [[9, 1.3], [11, 1.3], [20, 1.3], [24.6, 4], [24.6, 6], [8.4, 6], [13, 11.6], [22, 11.6]]) for (let k = 0; k < 5; k++) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.09, 6, 5), onionM); o.position.set(OX + x + (k % 2) * 0.12, 1.7 - Math.floor(k / 2) * 0.16, Z0 + z); root.add(o); }
    const ovenL = new THREE.PointLight(0xff6a1a, 1.4, 7, 1.5); ovenL.position.set(OX + 16, 1.0, Z0 + 2.4); root.add(ovenL);
    // the gambling den: rug, the green poker table under one lamp, cards, a shelf pulled aside, smoke
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.6), lam({ color: 0x6a1a2a })); rug.rotation.x = -Math.PI / 2; rug.position.set(OX + 3.5, 0.025, Z0 + 5); root.add(rug);
    cyl(1.25, 1.25, 0.08, lam({ color: 0x1a6a3a }), OX + 3.5, 0.8, Z0 + 5, root, 24); cyl(0.12, 0.2, 0.76, lam({ color: 0x2a1a12 }), OX + 3.5, 0.38, Z0 + 5, root, 8);
    for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.17), new THREE.MeshBasicMaterial({ color: k % 3 ? 0xf2efe6 : 0xc8202a })); c.rotation.x = -Math.PI / 2; c.rotation.z = k; c.position.set(OX + 3.5 + Math.cos(k) * 0.6, 0.85, Z0 + 5 + Math.sin(k) * 0.6); root.add(c); }
    for (let k = 0; k < 4; k++) cyl(0.05, 0.05, 0.08 + k * 0.03, lam({ color: [0xc8202a, 0x2a6aff, 0xf2efe6, 0x1a1a1a][k] }), OX + 3.3 + k * 0.15, 0.86, Z0 + 5.2, root, 10);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.3, 14, 1, true), lam({ color: 0x2a3a2a, side: THREE.DoubleSide })); shade.position.set(OX + 3.5, 2.05, Z0 + 5); root.add(shade);
    const bulb = glowSprite(THREE, 0xffd27a, 1.6, 1.6, 0.7); bulb.position.set(OX + 3.5, 1.9, Z0 + 5); root.add(bulb);
    const shelf = box(0.3, 1.9, 1.6, lam({ color: 0x4a3020 }), OX + 7.4, 0.95, Z0 + 11.4, root); shelf.rotation.y = 0.6;
    const smokeM = new THREE.MeshBasicMaterial({ color: 0xc8c0a0, transparent: true, opacity: 0.07, depthWrite: false }), smoke = [];
    for (let k = 0; k < 8; k++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), smokeM); s.rotation.x = -Math.PI / 2; s.position.set(OX + 1.5 + Math.random() * 4, 1.4 + k * 0.08, Z0 + 2 + Math.random() * 8); root.add(s); smoke.push(s); }
    // rain on the terrace, the side street and the road
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 22 || x >= 26) && Math.random() < 0.05) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    for (let i = 0; i < 12; i++) pl.push([OX - 10 + Math.random() * (W + 20), 1 + Math.random() * 10, 0.4 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 22, OX + W + 6, 12], [OX + 26, Z0 + 5, OX + W + 6, Z0 + 22]], 900));
    let t = 0;
    return { tick(dt) {
      t += dt; doner.rotation.y += dt * 0.8; for (const f of ticks) f(dt);
      ovenL.intensity = 1.2 + Math.sin(t * 9) * 0.15 + Math.sin(t * 23) * 0.1;
      smoke.forEach((s, i) => { s.rotation.z += dt * 0.05 * (i % 2 ? 1 : -1); s.position.x += Math.sin(t * 0.3 + i) * dt * 0.1; });
    } };
  },
};
