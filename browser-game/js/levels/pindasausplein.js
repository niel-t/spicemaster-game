// Act 1 finale: Pindasausplein (Oud-Vettenburg, the south-west pier). Fort Pindasaus: the Lampas headquarters on a fortified pier.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (01_Act1_Pindasausplein): a stormy pier with watchtowers and searchlights, sandbag walls, barbed wire and armed guards, a little
// "Halal Shawarma" kiosk at the gate, a factory hall with giant mixing hoppers, and Jan van Kaas's red office upstairs.
// The twist: a three-part assault. The yard (searchlights sweep it: get caught in a beam and every guard comes running),
// the hopper factory, then Jan van Kaas himself, who takes five hits and never drops his shotgun.
//   pier gate → yard (kiosk, towers, sandbags) → factory (roller door) → office · yard → barracks → office

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';

const W = 48, H = 34;
const HOPPERS = [[7, 6], [14, 6], [21, 6], [7, 13], [21, 13]]; // 2x2 hoppers (top-left cell)
const TOWERS = [[10, 23], [36, 23], [24, 29]]; // 2x2 watchtowers (top-left cell); each carries a searchlight

export default {
  id: 'pindasausplein', name: 'Pindasausplein', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['factory', 1, 1, 30, 18, 'factory'], ['office', 32, 1, 46, 10, 'redcarpet'], ['barracks', 32, 12, 46, 18, 'hall'],
    ['yard', 1, 20, 39, 32, 'pier'], ['yard2', 40, 20, 46, 24, 'pier'], ['kiosk', 41, 26, 46, 31, 'shoptile'],
  ],
  layout({ carve, put, putR }) {
    carve(21, 33, 26, 33);      // the pier gate (open)
    carve(12, 19, 15, 19);      // the factory roller door (up)
    putR(38, 19, 39, 19, 'D');  // yard ↔ barracks
    putR(31, 14, 31, 15, 'D');  // factory ↔ barracks
    putR(31, 4, 31, 5, 'D');    // factory ↔ office
    putR(39, 11, 40, 11, 'D');  // office ↔ barracks
    putR(31, 7, 31, 9, '%');    // Jan van Kaas's window onto the factory
    // the kiosk in the yard: walls, a door, a hatch window
    putR(40, 28, 40, 29, 'D'); putR(42, 25, 44, 25, '%');
    putR(42, 27, 45, 27, 'K'); put(46, 31, 'F');
    // factory: giant hoppers (drawn by decorate), conveyors, crates of peanut-sauce tubs, barrels
    for (const [x, z] of HOPPERS) putR(x, z, x + 1, z + 1, 'U');
    putR(3, 10, 26, 10, 'q'); putR(3, 16, 11, 16, 'q'); putR(18, 16, 26, 16, 'q');
    putR(26, 2, 29, 3, 'C'); putR(1, 1, 3, 2, 'C'); put(28, 13, 'C'); put(1, 18, 'X'); put(29, 18, 'X'); putR(16, 1, 18, 1, 'R');
    // office: desk, the big map on the wall, a safe, red sofas
    putR(37, 3, 40, 4, 'O'); putR(45, 1, 46, 1, 'V'); putR(33, 8, 35, 8, 'S'); putR(44, 7, 46, 7, 'S'); put(32, 1, 'p'); put(46, 10, 'p');
    // barracks: bunks, lockers, a table
    putR(33, 13, 36, 13, 'L'); putR(42, 13, 46, 13, 'L'); putR(34, 16, 36, 16, 'G'); putR(42, 16, 44, 16, 'G'); putR(39, 15, 40, 15, 'T');
    // the yard: watchtowers, sandbag walls, barbed wire, crates
    for (const [x, z] of TOWERS) putR(x, z, x + 1, z + 1, 'W');
    putR(3, 26, 7, 26, 'g'); putR(15, 24, 19, 24, 'g'); putR(28, 26, 32, 26, 'g'); putR(14, 30, 18, 30, 'g'); putR(30, 30, 34, 30, 'g');
    putR(2, 30, 9, 30, 'z'); putR(36, 21, 37, 21, 'z'); putR(41, 21, 46, 21, 'z');
    putR(22, 21, 23, 22, 'C'); put(3, 21, 'C'); put(46, 23, 'X'); put(1, 32, 'X');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x2a6a3a }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    U: { h: 1.6, cover: true, draw: () => {} }, // hoppers: drawn by decorate
    W: { h: 2.4, cover: true, draw: ({ box, cyl, lam, root, n, cx, cz, x, OX }) => { // watchtower legs (the cabin and the light are drawn by decorate)
      for (const dx of [-0.8, 0.8]) for (const dz of [-0.1, 0.9]) box(0.18, 4, 0.18, lam({ color: 0x3a3028 }), cx + dx, 2, cz + dz, root);
    } },
    g: { h: 0.95, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { // sandbags
      for (let k = 0; k < n; k++) for (let j = 0; j < 3; j++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 0.6), lam({ color: [0x9a8a64, 0x8a7a56, 0xa89870][(x + k + j) % 3] })); s.position.set(OX + x + k + 0.5 + (j % 2) * 0.2, 0.15 + j * 0.3, cz); s.rotation.y = (j % 2 ? 0.06 : -0.04); root.add(s); }
    } },
    z: { h: 0.6, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { // barbed wire: blocks walking, bullets fly over
      for (let k = 0; k <= n; k++) box(0.06, 0.9, 0.06, lam({ color: 0x3a3a3a }), OX + x + k, 0.45, cz, root, false);
      for (let k = 0; k < n * 3; k++) { const c = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.015, 4, 12), lam({ color: 0x8a8a8a })); c.position.set(OX + x + k / 3 + 0.15, 0.55, cz); c.rotation.y = Math.PI / 2; root.add(c); }
    } },
    q: { h: 0.85, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { box(n, 0.12, 0.7, lam({ color: 0x2a2a2a }), cx, 0.8, cz, root); for (const s of [-1, 1]) box(n, 0.8, 0.06, lam({ color: 0x8a8a84 }), cx, 0.4, cz + s * 0.33, root, false); for (let k = 0; k < n; k++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.24, 10), lam({ color: [0xc87a3a, 0xf3e6c8][(x + k) % 2] })); t.position.set(OX + x + k + 0.5, 0.98, cz); root.add(t); } } },
    L: { h: 1.9, cover: true, draw: ({ box, lam, root, n, cx, cz, x, OX }) => { box(n - 0.04, 1.9, 0.6, lam({ color: 0x4a5a4a }), cx, 0.95, cz - 0.15, root); } },
    S: { color: 0x7a2e1a },
    O: { color: 0x3a2010 },
    C: { color: 0x8a6a3a },
  },
  rackGoods: [0xc87a3a, 0xf3e6c8, 0x7a2e1a],
  floors: {
    factory: (g) => { g.fillStyle = '#5a564e'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.14})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } for (let i = 0; i < 4; i++) { g.fillStyle = 'rgba(200,122,58,.15)'; g.beginPath(); g.arc(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 7, 0, 7); g.fill(); } },
    redcarpet: (g) => { g.fillStyle = '#5a1a14'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#c8a040'; g.lineWidth = 2; g.strokeRect(6, 6, 52, 52); },
    pier: (g) => { for (let x = 0; x < 64; x += 8) { g.fillStyle = ['#4a3e30', '#3e3428', '#54463a'][(x / 8) % 3]; g.fillRect(x, 0, 8, 64); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 0, 1, 64); g.fillRect(x, (x * 5) % 64, 8, 1); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#2a6a3a'; g.fillRect(x * 16, y * 16, 16, 16); } },
    hall: (g) => { g.fillStyle = '#3e3a32'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8a33d'; g.fillRect(0, 28, 64, 3); },
  },
  floorRep: { factory: 3, redcarpet: 2.5, pier: 2, shoptile: 1.2, hall: 1.4 },
  hallCells: [[21, 33], [22, 33], [23, 33], [24, 33], [25, 33], [26, 33], [12, 19], [13, 19], [14, 19], [15, 19]],
  doorSigns: { '31,4': 'J. VAN KAAS', '38,19': 'KAZERNE', '40,28': 'KIOSK' },
  neon: { factory: 0xff9a50, office: 0xe8a33d, barracks: 0xa9c46a, yard: 0x5a6a7a, yard2: 0x5a6a7a, kiosk: 0x6ad86a },
  lights: [[10, 9, 0xff9a50, 1.6], [21, 9, 0xff9a50, 1.6], [14, 15, 0xffb070, 1.4], [26, 6, 0xffb070, 1.2], [39, 5, 0xe8a33d, 1.9], [44, 8, 0xc2412d, 1.0], [39, 15, 0xa9c46a, 1.2], [43, 29, 0x6ad86a, 1.2], [8, 27, 0x8aa0b8, 0.5], [30, 27, 0x8aa0b8, 0.5]],
  mood: { bg: 0x060a10, fogNear: 32, fogFar: 80, hemi: 0.46, sun: 0.42, sky: 0xc8d8e8, ground: 0x2a2a2a, wall: 0x4a4038, cap: 0xc8bca8, under: 0x2a241e },
  van: { park: [16, 4.6], rot: Math.PI, from: W + 14, exit: [16.6, 3.0], solid: [12.7, 18.8, 3.45, 5.75] }, // world; on the quay road outside the pier gate
  start: [23.5, 1.6],            // world: in front of the pier gate
  bounds: [0.5, W - 0.3, -H, 8], // world: x0, x1, z0, z1
  validateFrom: [23.5, 32.5],    // cell: inside the gate
  bossLook: { cap: 0xf3ecdc, shirt: 0xf3ecdc, front: '#f3ecdc', pants: 0xf3ecdc, belly: 1.2, head: { hair: '#d8b040', brow: '#a88030', hairLine: 46, iris: '#3a5a8a' } },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, enemy type
    [20, 31.5, 'makarov', Math.PI, 'yard'], [28, 32, 'bat', -Math.PI / 2, 'yard'], [5, 28, 'makarov', 0, 'yard'], [17, 26, 'shotgun', 0, 'yard'], [30, 28, 'makarov', 0, 'yard'],
    [11, 22, 'makarov', 0, 'yard'], [37, 25, 'makarov', -Math.PI / 2, 'yard'], [25, 22, 'bat', Math.PI / 2, 'yard'], [45, 24, 'bat', -Math.PI / 2, 'yard'],
    [43, 29.5, 'makarov', Math.PI, 'kiosk'],
    [12, 17, 'bat', 0, 'factory'], [18, 12, 'makarov', Math.PI, 'factory'], [4, 7, 'bat', Math.PI / 2, 'factory'], [26, 12, 'shotgun', -Math.PI / 2, 'factory'],
    [11, 3, 'makarov', 0, 'factory'], [24, 4, 'bat', Math.PI, 'factory'], [16, 8.5, 'makarov', 0, 'factory'], [3, 13, 'bat', Math.PI / 2, 'factory'],
    [35, 15, 'bat', Math.PI / 2, 'barracks'], [44, 15, 'makarov', -Math.PI / 2, 'barracks'], [39, 17.5, 'shotgun', Math.PI, 'barracks'],
    [38.5, 1.8, 'shotgun', 0, 'office', true, 'janvankaas'], [34, 5, 'makarov', Math.PI / 2, 'office'], [44, 4, 'makarov', -Math.PI / 2, 'office'],
  ],
  loot: [[2.5, 3.5], [29.5, 1.5], [24.5, 18], [46, 2.5], [46, 18], [45.5, 30.5], [1.5, 22.5], [33.5, 22]], // cell
  text: {
    area: 'OUD-VETTENBURG · PINDASAUSPLEIN',
    banner: ['FORT PINDASAUS', 'Pindasausplein. The Lampas headquarters. Jan van Kaas is home.'],
    objective: 'Storm <b>Fort Pindasaus</b>: cross the yard (<b>stay out of the searchlights</b>), clear the hopper factory, and take down <b>Jan van Kaas</b> in his office. <span style="color:#ffd36b">This ends the Lampas.</span>',
    objectiveOwned: 'Pindasausplein is <b>yours</b>. The Lampas are finished. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Fort Pindasaus has fallen.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'THE LAMPAS ARE FINISHED',
    resultsHint: 'Jan van Kaas is down and Oud-Vettenburg is yours. Grab the spice crates (E), then drive home.',
    ownedBanner: ['PINDASAUSPLEIN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['JAN VAN KAAS IS DOWN', 'The Lampas are finished.'],
    tips: ['A searchlight beam on you brings every guard in the yard. Watch the beams and move between them.', 'Sandbags stop bullets. Barbed wire does not, but you can\'t walk through it.', 'Jan van Kaas takes five hits. Use the factory door or the barracks to reach his office.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, player, run, alarm, popup }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the quay road outside the gate, the sea around the pier
    floorW(OX - 4, OX + W + 4, 0, 7.6, T.asphalt, 4);
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 30, Z0 - 20, OX, 8)); ticks.push(water(THREE, root, floorW, canvasTex, OX + W, Z0 - 20, OX + W + 30, 8));
    // the outer wall's gate posts, the fort sign
    for (const x of [20.6, 27.4]) box(0.8, 3.6, 0.8, lam({ color: 0x4a4038 }), OX + x, 1.8, Z0 + 33.5, root);
    sign('FORT PINDASAUS · VERBODEN TOEGANG', 9, 0.6, '#1a0e08', '#e8a33d', OX + 24, 3.4, Z0 + 34.02, 0, 44);
    // hoppers: huge copper funnels on legs, with peanut sauce glowing inside
    for (const [x, z] of HOPPERS) {
      const g = new THREE.Group(); g.position.set(OX + x + 1, 0, Z0 + z + 1); root.add(g);
      const fun = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 0.35, 1.6, 18, 1, true), lam({ color: 0xb8742a, side: THREE.DoubleSide })); fun.position.y = 2.0; g.add(fun);
      const sauce = new THREE.Mesh(new THREE.CircleGeometry(1.2, 18), lam({ color: 0xc87a3a })); sauce.rotation.x = -Math.PI / 2; sauce.position.y = 2.6; g.add(sauce);
      for (const [dx, dz] of [[-0.9, -0.9], [0.9, -0.9], [-0.9, 0.9], [0.9, 0.9]]) box(0.12, 1.4, 0.12, lam({ color: 0x3a3a3a }), dx, 0.7, dz, g);
      const gl = glowSprite(THREE, 0xffa050, 3, 3, 0.25); gl.position.y = 2.8; g.add(gl);
    }
    // office: the map of Kaasland on the wall, a portrait of Jan van Kaas himself
    const map = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.6), lam({ map: canvasTex(128, 68, (g) => { g.fillStyle = '#d8c8a0'; g.fillRect(0, 0, 128, 68); g.fillStyle = '#c2412d'; g.fillRect(30, 20, 50, 26); g.fillStyle = '#a9c46a'; g.fillRect(20, 4, 90, 14); g.fillStyle = '#5a8aa8'; g.fillRect(84, 22, 36, 34); g.fillStyle = '#1a1a1a'; g.font = '700 8px Arial'; g.fillText('KAASLAND', 46, 64); }) }));
    map.position.set(OX + 42, 1.7, Z0 + 1.02); root.add(map);
    sign('LAMPAS HOOFDKANTOOR', 3.2, 0.4, '#1a0e08', '#f2c14e', OX + 38.5, 2.5, Z0 + 1.03, 0, 40);
    // the kiosk front
    sign('HALAL SHAWARMA', 3.4, 0.45, '#0a140c', '#6ad86a', OX + 43.5, 2.6, Z0 + 25.0 - 0.02, Math.PI, 50); neonRect(root, OX + 43.5, 2.6, 3.6, 0.6, Z0 + 24.95, 0x6ad86a);
    // watchtowers: a cabin on the legs and a searchlight that sweeps the yard. Caught in a beam: every guard in the yard comes running.
    const beamM = new THREE.MeshBasicMaterial({ color: 0xf3ecdc, transparent: true, opacity: 0.16, depthWrite: false, blending: THREE.AdditiveBlending });
    const spots = TOWERS.map(([x, z], i) => {
      const cx = OX + x + 1, cz = Z0 + z + 1;
      box(2.2, 1.2, 2.2, lam({ color: 0x4a4038 }), cx, 4.4, cz, root, false); box(2.6, 0.12, 2.6, lam({ color: 0x2a241e }), cx, 5.05, cz, root, false);
      const lampG = glowSprite(THREE, 0xf3ecdc, 1.6, 1.6, 0.8); lampG.position.set(cx, 4.8, cz); root.add(lampG);
      const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 24), beamM); pool.rotation.x = -Math.PI / 2; root.add(pool);
      const light = new THREE.SpotLight(0xf3ecdc, 0, 30, 0.35, 0.5, 1.2); light.position.set(cx, 5, cz); root.add(light); root.add(light.target);
      return { cx, cz, pool, light, a: i * 2.1, sp: [0.45, -0.38, 0.32][i], r: [6.5, 6, 4.5][i] };
    });
    let cool = 0;
    // rain and spray over the pier
    const pl = []; for (let z = 20; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && Math.random() < 0.05) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 8, Z0 + 20, OX + W + 8, 8]], 1000));
    return { tick(dt) {
      for (const f of ticks) f(dt);
      const R = run(); cool -= dt;
      for (const s of spots) {
        s.a += s.sp * dt;
        const px = s.cx + Math.cos(s.a) * s.r, pz = Math.min(Z0 + 32.5, Math.max(Z0 + 20.5, s.cz + Math.sin(s.a) * s.r));
        s.pool.position.set(px, 0.05, pz); s.light.target.position.set(px, 0, pz); s.light.intensity = 30;
        if (!R.results && cool <= 0 && Math.hypot(player.position.x - px, player.position.z - pz) < 2.3) { cool = 4; alarm(player.position.clone(), 40); popup(player.position, 'SPOTTED!', '#f3ecdc', true); }
      }
    } };
  },
};
