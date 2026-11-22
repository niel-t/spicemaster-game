// Act 2, mission 2: Frikandelhaven (Hipsterheuvel, the west harbour). Café De Ambachtelijke Frikandel: a harbour café with a
// planted terrace, a disco cellar underneath and a copper craft-beer brewery next door. Level data for the mission engine
// (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art (02_Act2_Frikandelhaven): a white
// harbour building with big glass doors, a terrace of planters and tall grasses, a wood-panelled café with framed art, a pink
// disco cellar with spotlights and a dance floor, and a brewery of copper kettles and kegs.
// The engine is single-floor, so the disco cellar lies behind the café, reached down a stair run.
// The twist: strobe lights. The disco flashes between bright and pitch dark.
//   quay → terrace → café → stairs → disco → brewery → loading door · café → office → brewery

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';
import { eastSide, plate } from './story.js';
import { NOSHGEY } from './noshgey.js';

const W = 42, H = 28;

export default eastSide({
  ...NOSHGEY,
  id: 'frikandelhaven', name: 'Frikandelhaven', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['disco', 1, 1, 16, 9, 'disco'], ['stairs', 12, 11, 16, 13, 'steps'], ['office', 1, 11, 10, 13, 'panel'],
    ['cafe', 1, 15, 16, 22, 'pine'], ['terrace', 1, 24, 40, 27, 'cobble'],
    ['brewery', 18, 1, 40, 14, 'brew'], ['mixing', 18, 16, 28, 22, 'tiles'], ['store', 30, 16, 40, 22, 'concrete'],
  ],
  layout({ carve, put, putR }) {
    carve(7, 23, 9, 23);        // the café's glass doors (open)
    carve(0, 24, 0, 27); carve(41, 24, 41, 27);
    carve(13, 14, 15, 14); carve(13, 10, 15, 10); // stairs: café → down → disco
    putR(5, 14, 6, 14, 'D');    // café ↔ office
    putR(11, 12, 11, 13, 'D');  // office ↔ stairs
    putR(17, 4, 17, 5, 'D');    // disco ↔ brewery
    putR(17, 18, 17, 19, 'D');  // café ↔ mixing room
    putR(23, 15, 24, 15, 'D');  // brewery ↔ mixing room
    putR(29, 18, 29, 19, 'D');  // mixing room ↔ store
    putR(35, 15, 36, 15, 'D');  // brewery ↔ store
    putR(34, 23, 35, 23, 'D');  // store ↔ terrace (LEVERINGEN)
    putR(1, 23, 6, 23, '%'); putR(10, 23, 16, 23, '%'); // the café's glass front
    // café: the counter, tables, framed art (decorate), plants
    putR(2, 16, 4, 16, 'K'); putR(8, 16, 9, 16, 'K'); put(16, 15, 'F'); put(3, 20, 'T'); put(7, 21, 'T'); put(12, 19, 'T'); put(16, 22, 'p'); put(1, 22, 'p');
    // office: desk, safe
    putR(2, 12, 4, 12, 'O'); put(1, 11, 'V');
    // disco: the DJ booth, booths along the walls, the bar
    putR(6, 1, 10, 1, 'B'); putR(1, 3, 1, 7, 'S'); putR(15, 6, 16, 8, 'S'); put(3, 8, 'T'); put(13, 2, 'T');
    // brewery: copper kettles (2x2), kegs, sacks of malt
    putR(20, 2, 21, 3, 'U'); putR(25, 2, 26, 3, 'U'); putR(30, 2, 31, 3, 'U'); putR(35, 2, 36, 3, 'U');
    putR(20, 9, 23, 9, 'e'); putR(28, 8, 30, 9, 'e'); putR(34, 10, 37, 10, 'e'); put(40, 1, 'X'); putR(39, 13, 40, 14, 'C');
    // mixing room and store
    putR(21, 18, 24, 19, 'w'); put(28, 22, 'C'); putR(32, 17, 33, 18, 'C'); putR(37, 17, 38, 18, 'C'); putR(32, 21, 33, 22, 'e'); put(40, 22, 'X');
    // terrace: planters with tall grasses, tables, benches, lamps
    putR(2, 25, 5, 25, 'v'); putR(12, 25, 15, 25, 'v'); put(8, 26, 't'); put(19, 25, 't'); put(24, 26, 't'); putR(27, 25, 29, 25, 'h'); put(1, 27, 'l'); put(20, 27, 'l'); put(38, 27, 'l');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x6a4426 }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    U: { h: 1.6, cover: true, draw: () => {} }, // copper kettles: drawn by decorate
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { cyl(0.32, 0.32, 0.9, lam({ color: 0xa8acb0 }), OX + x + k + 0.5, 0.45, cz, root, 12); cyl(0.33, 0.33, 0.05, lam({ color: 0x5a5e62 }), OX + x + k + 0.5, 0.2, cz, root, 12); } } }, // steel kegs
    B: { color: 0x2a2a30 }, S: { color: 0xc2412d },
  },
  rackGoods: [0xc87a3a, 0xf3e6c8, 0xa9c46a],
  floors: {
    pine: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#a07a4a', '#906c40', '#aa8452'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, y, 64, 1); } },
    disco: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#3a1a24', '#5a2a1a', '#1a1a24', '#4a3a1a'][(x + y * 2) % 4]; g.fillRect(x * 16, y * 16, 16, 16); g.strokeStyle = 'rgba(232,163,61,.3)'; g.strokeRect(x * 16 + 1, y * 16 + 1, 14, 14); } },
    steps: (g) => { for (let y = 0; y < 64; y += 16) { g.fillStyle = '#5a5048'; g.fillRect(0, y, 64, 12); g.fillStyle = '#2a2420'; g.fillRect(0, y + 12, 64, 4); } },
    brew: (g) => { g.fillStyle = '#6a5a4a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#4a3e32'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); } },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { pine: 1.5, disco: 2, steps: 1, brew: 1.4, panel: 1.5, cobble: 1.6 },
  hallCells: [[7, 23], [8, 23], [9, 23], [13, 14], [14, 14], [15, 14], [13, 10], [14, 10], [15, 10]],
  doorSigns: { '34,23': 'LEVERINGEN', '5,14': 'KANTOOR', '17,4': 'BROUWERIJ' },
  neon: { disco: 0xc2412d, stairs: 0xe8a33d, office: 0xe8a33d, cafe: 0xa9c46a, terrace: 0xa9c46a, brewery: 0xc87a3a, mixing: 0xf2c14e, store: 0xffd8a0 },
  lights: [[8, 19, 0xf3e6c8, 1.7], [5, 12, 0xe8a33d, 1.1], [14, 12, 0xff9a50, 0.7], [23, 6, 0xffa050, 1.6], [33, 6, 0xffa050, 1.6], [28, 11, 0xffb070, 1.2], [23, 19, 0xf2c14e, 1.2], [35, 19, 0xffd8a0, 1.1], [8, 26, 0xa9c46a, 1.0], [30, 26, 0xa9c46a, 1.0]],
  mood: { bg: 0x081018, fogNear: 30, fogFar: 76, hemi: 0.48, sun: 0.5, sky: 0xf0f0dc, ground: 0x3a4038, wall: 0xd8d0c0, cap: 0xf0e8d8, under: 0x4a4038 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] },
  start: [8, -0.7],
  bounds: [0.5, W - 0.3, -H, 10],
  validateFrom: [8, 25.5],
  bossLook: { cap: 0x1a1a1a, shirt: 0x2a2a30, front: '#2a2a30', pants: 0x2a2a30, belly: 0.3, head: { hair: '#1a1a1a', brow: '#1a1a1a', hairLine: 40, glasses: true, iris: '#2a2a2a' } }, // DJ Biologisch
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [10, 25.5, 'bat', Math.PI / 2, 'terrace'], [31, 26, 'makarov', -Math.PI / 2, 'terrace'],
    [4, 18.5, 'makarov', Math.PI, 'cafe'], [12, 17, 'bat', -Math.PI / 2, 'cafe'], [9, 21.5, 'bat', Math.PI, 'cafe'], [7, 12.5, 'makarov', Math.PI / 2, 'office'],
    [8, 2.3, 'shotgun', 0, 'disco', true], [4, 5, 'bat', Math.PI / 2, 'disco'], [11, 6, 'makarov', -Math.PI / 2, 'disco'], [8, 8, 'bat', Math.PI, 'disco'],
    [23, 5.5, 'makarov', Math.PI / 2, 'brewery'], [28, 5.5, 'bat', Math.PI, 'brewery'], [33, 7, 'makarov', -Math.PI / 2, 'brewery'], [38, 5, 'bat', -Math.PI / 2, 'brewery'], [25, 12, 'shotgun', 0, 'brewery'],
    [26, 21, 'bat', Math.PI, 'mixing'], [35, 20, 'makarov', Math.PI, 'store'],
  ],
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a four-metre plant-based frikandel on a stick, painted cardamom green, outside the café
      const { THREE, root, box, cyl, lam, canvasTex } = c, p = c.at(22, 0); p.z = 1.5;
      box(1.2, 0.5, 1.2, lam({ color: 0x5a6a3a }), p.x, 0.25, p.z, root); c.solid(p.x - 0.6, p.x + 0.6, p.z - 0.6, p.z + 0.6);
      cyl(0.06, 0.06, 1.6, lam({ color: 0xd8c8a0 }), p.x, 1.2, p.z, root, 8);
      const fk = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 2.4, 6, 14), lam({ color: 0x7a9a3a })); fk.position.set(p.x, 3.4, p.z); root.add(fk);
      for (let i = 0; i < 5; i++) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.03, 5, 16), lam({ color: 0x5a7a2a })); ring.rotation.x = Math.PI / 2; ring.position.set(p.x, 2.5 + i * 0.45, p.z); root.add(ring); }
      const sauce = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.0, 0.12), lam({ color: 0xf3ecd8 })); sauce.position.set(p.x, 3.4, p.z + 0.4); root.add(sauce);
      const onion = new THREE.Mesh(new THREE.BoxGeometry(0.22, 1.6, 0.06), lam({ color: 0xc8b080 })); onion.position.set(p.x + 0.12, 3.4, p.z + 0.44); root.add(onion);
      c.plate('100% PLANT · 0% SPIJT', p.x, 0.36, p.z + 0.62, 0, 1.15, 0.24, '#2a3a1a', '#a9c46a');
      const gl = c.glow(0xa9c46a, 3.2, 4.4, 0.25); gl.position.set(p.x, 3.4, p.z); root.add(gl);
    } },
    { k: 'board', at: [1.5, 8.5], wall: 'w', style: 'white', title: 'GASTENLIJST', lines: ['Goeroe Granola +1', 'DJ Linzensoep', 'Influencer Fleur', '~De Lampas', '~Eddy Jr.'], read: ['GASTENLIJST', "The disco guest list. Goeroe Granola is on it, plus one. The Lampas are crossed out, and so is Eddy."] },
    { k: 'board', at: [21.5, 1.5], wall: 'n', style: 'chalk', title: 'BROUWSCHEMA', lines: ['Frikandel-bier batch 9', 'hop, zeewier, gist', 'HET GEHEIME KRUID', '(van Eddy?? navragen)'], read: ['BROUWSCHEMA', 'The brewing schedule for "frikandel beer": hops, seaweed, yeast, and "the secret herb (Eddy\'s?? ask around)". They want his recipe.'] },
    { k: 'poster', at: [1.5, 19.5], wall: 'w', w: 0.9, h: 1.2, style: 'green', title: 'VEGAN FRIKANDEL', lines: ['W 4', '100% plant', '0% smaak'] },
    { k: 'crates', at: [35.5, 19.5], label: 'ZEEWIER', color: '#3a6a3a' }, { k: 'spill', at: [30.5, 11.5], color: 0xc87a3a, r: 0.6 },
    { k: 'papers', at: [5.5, 12.5], read: ['BRIEF AAN DE LAMPAS', 'A draft letter: "Dear Lampas, the harbour is ours now. You may keep one snack bar, as a museum." Signed with a little leaf.'] },
  ],
  loot: [[1.5, 12.5], [16, 1.5], [18.5, 13.5], [40, 3.5], [30.5, 21.5], [39.5, 16.5]], // cell
  text: {
    area: 'HIPSTERHEUVEL · FRIKANDELHAVEN',
    banner: ['DE AMBACHTELIJKE FRIKANDEL', 'Frikandelhaven. Craft frikandellen, craft beer, craft disco.'],
    objective: 'Take <b>De Ambachtelijke Frikandel</b>: the café, the disco cellar and the brewery. <b>The strobes flash the disco dark</b>: wait for the light. DJ Biologisch spins downstairs. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Frikandelhaven is <b>yours</b>. The music has stopped. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Frikandelhaven is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'FRIKANDELHAVEN TAKEN',
    resultsHint: 'The disco is dark for good. Grab the spice crates (E), then drive home.',
    ownedBanner: ['FRIKANDELHAVEN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['DJ BIOLOGISCH IS DOWN', 'Set over.'],
    tips: ['The disco strobes: fight in the flashes, hide in the dark.', 'Copper kettles and kegs stop bullets in the brewery.', 'The stairs behind the café go down to the disco. The brewery has its own door from the disco too.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.paving, 1.5); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 14, 8, OX + W + 14, 24));
    // the café sign, framed art inside
    sign('DE AMBACHTELIJKE FRIKANDEL', 8, 0.55, '#0a140c', '#a9c46a', OX + 8.5, 2.75, Z0 + 23.02, 0, 50); neonRect(root, OX + 8.5, 2.75, 8.2, 0.7, Z0 + 23.06, 0xa9c46a);
    sign('BROUWERIJ · DISCO', 4, 0.4, '#140a0a', '#e8a33d', OX + 30, 2.6, Z0 + 23.02, 0, 40);
    for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.7), lam({ color: [0xa9c46a, 0xe8a33d, 0xc87a3a, 0xf3e6c8][k] })); f.position.set(OX + 2.5 + k * 3.5, 1.8, Z0 + 15.02); root.add(f); }
    // brewery: copper kettles with domed lids and pipes
    for (const [x, z] of [[20, 2], [25, 2], [30, 2], [35, 2]]) {
      cyl(0.95, 0.95, 1.6, lam({ color: 0xb8742a }), OX + x + 1, 0.8, Z0 + z + 1, root, 18);
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.95, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: 0xc8843a })); lid.position.set(OX + x + 1, 1.6, Z0 + z + 1); root.add(lid);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), lam({ color: 0xb8742a })); p.position.set(OX + x + 1, 2.4, Z0 + z + 1); root.add(p);
    }
    // the stairs down
    for (let k = 0; k < 3; k++) box(3, 0.02, 0.9, lam({ color: [0x6a6058, 0x48403a, 0x2a2622][k] }), OX + 14.5, 0.03, Z0 + 13.5 - k, root, false);
    // the disco: a mirror ball, colour spots and the strobe
    const ball = new THREE.Mesh(new THREE.IcosahedronGeometry(0.4, 1), new THREE.MeshPhongMaterial({ color: 0xd8d8d8, shininess: 200, flatShading: true })); ball.position.set(OX + 8.5, 2.3, Z0 + 5); root.add(ball);
    const spots = [0xc2412d, 0xe8a33d, 0xa9c46a].map((c, i) => { const g = glowSprite(THREE, c, 3.4, 3.4, 0.35); g.position.set(OX + 8.5, 0.2, Z0 + 5); g.rotation.x = -Math.PI / 2; root.add(g); return g; });
    const strobe = new THREE.PointLight(0xf3ecdc, 0, 16, 1.2); strobe.position.set(OX + 8.5, 2.6, Z0 + 5); root.add(strobe);
    const dark = new THREE.Mesh(new THREE.PlaneGeometry(16, 9), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); dark.rotation.x = -Math.PI / 2; dark.position.set(OX + 8.5, WALL_H - 0.05, Z0 + 5); root.add(dark);
    const pl = []; for (let z = 24; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.06) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 24, OX + W + 12, 8]], 800));
    let t = 0;
    return { tick(dt) {
      t += dt; for (const f of ticks) f(dt);
      ball.rotation.y += dt * 0.8; spots.forEach((s, i) => { const a = t * (0.9 + i * 0.3) + i * 2; s.position.set(OX + 8.5 + Math.cos(a) * 4.5, 0.06, Z0 + 5 + Math.sin(a * 1.3) * 2.8); });
      const on = (t % 0.9) < 0.42; // the strobe: bright, then nearly black
      strobe.intensity = on ? 5 : 0; dark.material.opacity = on ? 0 : 0.78;
    } };
  },
}, { kind: 'canal', door: [11, 12], street: [24, 27], guard: [6, 'bat', Math.PI / 2], sign: 'WATERDEUR', tip: 'The quiet way in: a quay along the harbour canal on the east side, to the brewery\'s water door. One Noshgey keeps watch there, facing the water.', read: ['WATERDEUR', 'A chalkboard by the water door: "Hop en zeewier: per boot. Geen schoenen op de kade." Nobody else comes this way.'] });
