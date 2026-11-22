// Act 2, mission 1: Joppiehaven (Hipsterheuvel, the marina). Joppiehaven Organic Wrap Bar: the Noshgey Kariot's front door on the
// island, a wrap bar on a wooden boardwalk over the harbour. Level data for the mission engine (js/mission.js); see spekbuurt.js for
// the coordinate conventions. Built after the concept art (02_Act2_Joppiehaven): a brick boathouse on a boardwalk with planters,
// boats moored alongside, a big neon name sign, a wrap counter with juice dispensers, and a pink-lit smoothie lounge at the back.
// The twist: the boardwalk is over open water. Knock a Noshgey into the edge and he goes in the harbour.
//   jetty → boardwalk → wrap bar → kitchen / smoothie lounge → office → mixing room · boardwalk → lounge terrace door

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';
import { NOSHGEY, WATER_FURN, WATER_HAZARD } from './noshgey.js';
import { makeSloep, makeCruiser, rockBoat } from '../boats.js';

const W = 44, H = 30;

export default {
  ...NOSHGEY,
  id: 'joppiehaven', name: 'Joppiehaven', W, H,
  hazard: WATER_HAZARD,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['kitchen', 6, 1, 20, 4, 'tiles'], ['office', 22, 1, 30, 4, 'panel'], ['mixing', 32, 1, 37, 4, 'tiles'],
    ['bar', 6, 6, 20, 14, 'pine'], ['lounge', 22, 6, 37, 14, 'lounge'],
    ['deck', 6, 16, 37, 23, 'deck'], ['jetty', 18, 24, 25, 28, 'deck'],
    ['w1', 1, 1, 4, 28, 'harbour'], ['w2', 40, 1, 42, 28, 'harbour'], ['w2c', 39, 17, 39, 28, 'harbour'], ['quay', 39, 1, 39, 16, 'deck'], ['quay', 38, 16, 38, 16, 'deck'], ['w3', 6, 24, 16, 28, 'harbour'], ['w4', 27, 24, 37, 28, 'harbour'],
  ],
  layout({ carve, put, putR }) {
    // the harbour water around the boardwalk (the walls between the water patches open up so it reads as one harbour)
    carve(5, 16, 5, 28); carve(38, 16, 38, 28); carve(17, 24, 17, 28); carve(26, 24, 26, 28); carve(6, 24, 37, 24);
    carve(0, 1, 0, 28); carve(43, 1, 43, 28); put(0, 1, '~'); putR(0, 1, 0, 28, '~'); putR(43, 1, 43, 28, '~'); // the harbour runs on past the level edge
    putR(1, 1, 4, 28, '~'); putR(39, 1, 42, 28, '~'); putR(5, 16, 5, 28, '~'); putR(38, 16, 38, 28, '~');
    putR(6, 24, 17, 28, '~'); putR(26, 24, 38, 28, '~');
    carve(18, 29, 25, 29);      // the jetty meets the quay road
    carve(39, 1, 39, 16); carve(38, 16, 38, 16); // the quiet way in: a plank walkway along the boathouse over the harbour
    put(38, 1, 'D');            // walkway ↔ mixing room (the water door)
    // doors
    carve(12, 15, 13, 15);      // the wrap bar's front door onto the boardwalk (open)
    putR(30, 15, 31, 15, 'D');  // lounge ↔ boardwalk
    putR(12, 5, 13, 5, 'D');    // bar ↔ kitchen
    putR(21, 9, 21, 10, 'D');   // bar ↔ lounge
    putR(21, 2, 21, 3, 'D');    // kitchen ↔ office
    putR(25, 5, 26, 5, 'D');    // lounge ↔ office
    putR(31, 2, 31, 3, 'D');    // office ↔ mixing room
    // glass: the boathouse front
    putR(6, 15, 11, 15, '%'); putR(14, 15, 20, 15, '%'); putR(22, 15, 29, 15, '%'); putR(32, 15, 37, 15, '%');
    // wrap bar: the counter with juice dispensers, stools and tables, plants
    putR(8, 8, 17, 8, 'K'); putR(18, 6, 20, 6, 'F'); put(7, 12, 'T'); put(10, 13, 'T'); put(16, 12, 'T'); put(19, 14, 'p'); put(6, 14, 'p');
    // kitchen
    putR(9, 2, 14, 2, 'w'); put(6, 1, 'F'); put(20, 1, 'C');
    // smoothie lounge: the smoothie bar, sofas, low tables
    putR(28, 6, 34, 6, 'B'); putR(24, 10, 24, 12, 'S'); putR(36, 9, 36, 12, 'S'); put(27, 11, 'T'); put(32, 11, 'T'); put(37, 14, 'p'); put(29, 13, 'p');
    // office and mixing room
    putR(25, 2, 27, 2, 'O'); put(30, 1, 'V'); putR(34, 2, 36, 3, 'w'); put(37, 4, 'C');
    // boardwalk: tables, planters, crates of produce, lamps
    putR(7, 17, 10, 17, 'v'); put(8, 20, 't'); put(13, 21, 't'); put(25, 20, 't'); put(30, 21, 't'); putR(33, 17, 36, 17, 'v'); putR(16, 18, 17, 18, 'C'); put(35, 22, 'C');
    put(6, 23, 'l'); put(37, 23, 'l'); put(18, 28, 'l'); put(25, 28, 'l');
  },
  furn: {
    ...STREET_FURN, ...WATER_FURN,
    K: { h: 1.05, cover: true, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x8a6a42 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); for (let k = 0; k < n; k += 3) box(0.3, 0.4, 0.3, lam({ color: [0xa9c46a, 0xe8a33d, 0xc2412d][k % 3] }), OX + x + k + 0.5, 1.26, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    B: { color: 0x5a6a3a }, S: { color: 0xa9c46a }, F: { color: 0xf3e6c8 },
  },
  rackGoods: [0xa9c46a, 0xf3e6c8, 0xc87a3a],
  floors: {
    deck: (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = ['#8a6a42', '#7a5c38', '#94744a'][(x / 8) % 3]; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x, 0, 1, 64); g.fillRect(x, (x * 5) % 64, 8, 1); } },
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#c8a070', '#b89060', '#d0a878'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    lounge: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#5a6a3a'; g.fillRect(x * 16, y * 16, 16, 16); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    harbour: (g) => { g.fillStyle = '#081a2c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,170,255,${0.04 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 10, 1); } },
  },
  floorRep: { deck: 2, pine: 1.5, lounge: 1.4, panel: 1.5, harbour: 4 },
  hallCells: [[12, 15], [13, 15]],
  doorSigns: { '30,15': 'LOUNGE', '21,2': 'KANTOOR', '38,1': 'WATERDEUR' },
  neon: { kitchen: 0xf2c14e, office: 0xe8a33d, mixing: 0xf2c14e, bar: 0xa9c46a, lounge: 0xe8a33d, deck: 0xa9c46a, jetty: 0xa9c46a, w1: 0x1a2a3a, w2: 0x1a2a3a, w3: 0x1a2a3a, w4: 0x1a2a3a },
  lights: [[13, 10, 0xf3e6c8, 1.7], [13, 3, 0xf2c14e, 1.1], [29, 10, 0xe8a33d, 1.6], [34, 10, 0xc87a3a, 1.2], [26, 3, 0xe8a33d, 1.3], [34, 3, 0xf2c14e, 1.0], [10, 20, 0xa9c46a, 1.1], [22, 20, 0xf2c14e, 1.2], [33, 20, 0xa9c46a, 1.1], [21, 27, 0xf2c14e, 0.9]],
  mood: { bg: 0x081018, fogNear: 32, fogFar: 80, hemi: 0.5, sun: 0.55, sky: 0xf0f0dc, ground: 0x3a4038, wall: 0x7a3a2a, cap: 0xe0d4bc, under: 0x3a2a24 },
  van: { park: [21.5, 4.6], rot: Math.PI, from: W + 14, exit: [22.1, 3.0], solid: [18.2, 24.3, 3.45, 5.75] },
  start: [21.5, 1.0],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [21.5, 28.5],
  bossLook: { cap: 0xa9c46a, shirt: 0xf3e6c8, front: '#f3e6c8', pants: 0x5a6a3a, belly: 0.4, head: { hair: '#8a5a2a', brow: '#6a4020', hairLine: 50, iris: '#3a5a3a' } }, // Wrapmeester Wessel: linen apron, man bun
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [21.5, 25.5, 'bat', Math.PI, 'jetty'], [9, 22, 'makarov', Math.PI / 2, 'deck'], [20, 17, 'bat', 0, 'deck'], [28, 22.5, 'makarov', Math.PI, 'deck'], [34, 19, 'bat', -Math.PI / 2, 'deck'],
    [12, 10.5, 'makarov', Math.PI, 'bar'], [8, 6.5, 'bat', 0, 'bar'], [17, 11, 'bat', -Math.PI / 2, 'bar'],
    [11, 3.5, 'makarov', Math.PI, 'kitchen'], [17, 3, 'bat', -Math.PI / 2, 'kitchen'],
    [26, 8.5, 'makarov', Math.PI, 'lounge'], [30, 12, 'bat', Math.PI / 2, 'lounge'], [35, 8, 'makarov', -Math.PI / 2, 'lounge'], [24, 13.5, 'shotgun', Math.PI / 2, 'lounge'],
    [26, 3.5, 'shotgun', 0, 'office', true], [29, 3, 'makarov', -Math.PI / 2, 'office'],
    [34.5, 1.5, 'bat', 0, 'mixing'],
  ],
  side: { doors: [[38, 1]], name: 'WATERDEUR', kind: 'canal' },
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a little striped lighthouse on a pile in the harbour, its lamp turning
      const { THREE, root, box, cyl, lam } = c, p = c.at(32, 26.5);
      cyl(0.9, 1.0, 0.6, lam({ color: 0x5a5048 }), p.x, 0.1, p.z, root, 14);
      for (let i = 0; i < 5; i++) cyl(0.62 - i * 0.05, 0.66 - i * 0.05, 0.9, lam({ color: i % 2 ? 0xf3ecd8 : 0xe8862c }), p.x, 0.85 + i * 0.9, p.z, root, 14);
      const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.5, 12), new THREE.MeshBasicMaterial({ color: 0xffe8a8 })); lamp.position.set(p.x, 5.2, p.z); root.add(lamp);
      const roof = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.6, 12), lam({ color: 0x2f7a2a })); roof.position.set(p.x, 5.75, p.z); root.add(roof);
      const beam = new THREE.Mesh(new THREE.ConeGeometry(1.4, 9, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xffe8a8, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
      beam.rotation.z = Math.PI / 2; beam.position.x = 4.5; const piv = new THREE.Group(); piv.position.set(p.x, 5.2, p.z); piv.add(beam); root.add(piv);
      const gl = c.glow(0xffe8a8, 3, 3, 0.5); gl.position.set(p.x, 5.2, p.z); root.add(gl);
      c.plate('JOPPIE-VUUR', p.x, 0.55, p.z + 0.95, 0, 1.0, 0.22, '#1a2a1a', '#a9c46a');
      return (dt) => { piv.rotation.y += dt * 0.6; };
    } },
    { k: 'board', at: [36.5, 6.5], wall: 'n', style: 'green', title: 'ONZE MISSIE', lines: ['1. Geen vlees', '2. Geen plastic', '3. Geen Lampas', '4. Wel winst'], read: ['ONZE MISSIE', 'The Noshgey mission statement, on recycled board: no meat, no plastic, no Lampas. Point four: profit.'] },
    { k: 'board', at: [14.5, 1.5], wall: 'n', style: 'chalk', title: 'WRAPS', lines: ['hummus · tempeh', 'jackfruit "pulled"', 'JOPPIE (vegan!)', 'kipkruiden: UITVERKOCHT'], read: ['WRAPS', "The wrap menu. At the bottom: 'chicken spice: SOLD OUT'. They have been buying up Eddy's spice to keep it off the market."] },
    { k: 'crates', at: [14.5, 7.5], label: 'LAMPAS FRITUUR', color: '#c2412d', read: ['SLECHT KARMA', 'A deep fryer taken off a Lampas snack bar, covered in stickers: "SLECHT KARMA". The Noshgey are moving in on Lampas turf.'] },
    { k: 'papers', at: [24.5, 2.5], read: ['HUURCONTRACT', 'A lease: the Noshgey got Joppiehaven from the harbour board for one Wilder and "a lifetime supply of oat milk".'] },
    { k: 'cups', at: [8.5, 20.5], y: 0.77 }, { k: 'spill', at: [27.5, 19.5], color: 0xe8dcc0, r: 0.5 },
    { k: 'boat', at: [40.8, 9.5], rot: 0.05 }, { k: 'bollard', at: [39.85, 8.6], rope: [40.4, 9.2], free: true }, { k: 'bollard', at: [39.85, 13.5], free: true },
    { k: 'ring', at: [39.5, 6.5], wall: 'w' }, { k: 'chalk', at: [39.5, 15.3], dir: 0, free: true }, { k: 'chalk', at: [38.5, 16.5], dir: -Math.PI / 2, free: true },
    { k: 'lamp', at: [39.35, 1.9], color: 0x9ab8e8 },
    { k: 'sign', at: [39.5, 4.6], wall: 'w', title: 'WATERDEUR', w: 0.8, h: 0.5, style: 'paper', hy: 1.5, read: ['WATERDEUR', '"Leveringen per sloep. Geen schoenen op de steiger." The planks creak, but nobody listens.'] },
  ],
  loot: [[6.5, 2.5], [20.5, 3.5], [30, 3.5], [37, 3.5], [37, 13.5], [7, 22.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · JOPPIEHAVEN',
    banner: ['JOPPIEHAVEN', 'Organic Wrap Bar. The Noshgey Kariot\'s front door on the island.'],
    objective: 'Take the <b>Joppiehaven Organic Wrap Bar</b> from the Noshgey Kariot. Their guards wear <b>artisan body armour: two hits each</b>. The boardwalk is over the harbour: <b>knock them into the edge</b> and they go in. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Joppiehaven is <b>yours</b>. A foothold on Hipsterheuvel. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Joppiehaven is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'JOPPIEHAVEN TAKEN',
    resultsHint: 'The wraps are cold and the Noshgey are wet. Grab the spice crates (E), then drive home.',
    ownedBanner: ['JOPPIEHAVEN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['WRAPMEESTER WESSEL IS DOWN', 'That\'s a wrap.'],
    tips: ['Noshgey guards take two hits. The Maboota knocks them down; hit them again on the floor.', 'Knock a Noshgey into the harbour edge: splash, gone.', 'Two ways in on the boardwalk: the wrap bar door and the lounge door. The quiet third: the plank walkway round the east side of the boathouse to the water door.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 12, T.asphalt, 4);
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, Z0 - 10, OX, 0)); ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 10, OX + W + 30, 0));
    // boats moored in the harbour
    const boats = [], boat = (x, z, r, c, cruiser) => { const g = cruiser ? makeCruiser({ L: 5.2, B: 1.9, hull: c, stripe: 0x7f9a5a }) : makeSloep({ L: 4.6, B: 1.7, hull: c }); g.position.set(OX + x, -0.15, Z0 + z); g.rotation.y = r - Math.PI / 2; root.add(g); boats.push(g); }; // sloepen and small cruisers (js/boats.js), bow along +z at r = 0
    boat(2.5, 6, 0, 0xf6f2e8, true); boat(2.5, 14, 0.1, 0x3a5a7a); boat(40.5, 9, Math.PI, 0xb5442a); boat(40.5, 20, -0.08, 0xf6f2e8, true); boat(11, 26.5, Math.PI / 2, 0x7f9a5a); boat(32, 26.5, -Math.PI / 2, 0xf6f2e8, true);
    // pilings along the boardwalk edge
    for (let x = 6; x <= 37; x += 3) cyl(0.14, 0.14, 1.2, lam({ color: 0x4a3a2a }), OX + x, 0.4, Z0 + 23.95, root, 8);
    for (let z = 16; z <= 23; z += 3) { cyl(0.14, 0.14, 1.2, lam({ color: 0x4a3a2a }), OX + 6.05, 0.4, Z0 + z, root, 8); cyl(0.14, 0.14, 1.2, lam({ color: 0x4a3a2a }), OX + 37.95, 0.4, Z0 + z, root, 8); }
    // the big neon name sign and the boathouse front
    sign('JOPPIEHAVEN', 7.5, 1.0, '#0a140c', '#a9c46a', OX + 13, 3.0, Z0 + 15.02, 0, 90); neonRect(root, OX + 13, 3.0, 7.7, 1.15, Z0 + 15.06, 0xa9c46a);
    sign('ORGANIC WRAP BAR', 5, 0.38, '#0a140c', '#f3e6c8', OX + 13, 2.25, Z0 + 15.03, 0, 40);
    sign('SMOOTHIE LOUNGE', 4.4, 0.5, '#140a0a', '#e8a33d', OX + 30, 2.7, Z0 + 15.02, 0, 50); neonRect(root, OX + 30, 2.7, 4.6, 0.62, Z0 + 15.06, 0xe8a33d);
    // the lounge glow, the juice dispensers' glow
    const lg = glowSprite(THREE, 0xe8a33d, 10, 6, 0.18); lg.position.set(OX + 30, 1.8, Z0 + 10); root.add(lg);
    for (let k = 0; k < 3; k++) { const g = glowSprite(THREE, [0xa9c46a, 0xe8a33d, 0xc2412d][k], 1.2, 1.2, 0.5); g.position.set(OX + 18.5 + k, 1.6, Z0 + 6.8); root.add(g); }
    // string lights over the boardwalk
    for (let x = 7; x < 37; x += 1.5) { const b = glowSprite(THREE, 0xf2c14e, 0.5, 0.5, 0.8); b.position.set(OX + x, 2.6 + Math.sin(x) * 0.15, Z0 + 18 + ((x * 2) % 4)); root.add(b); }
    const pl = []; for (let i = 0; i < 30; i++) pl.push([OX + 6 + Math.random() * 31, Z0 + 16 + Math.random() * 8, 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 16, OX + W + 12, 12], [OX - 12, Z0, OX + 6, Z0 + 16], [OX + 38, Z0, OX + W + 12, Z0 + 16]], 900));
    return { tick(dt) { for (const f of ticks) f(dt); const bt = performance.now() / 1000; for (const b of boats) rockBoat(b, bt, 0); } };
  },
};
