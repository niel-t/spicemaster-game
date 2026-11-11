// Spice Master Eddy: Mission 1, Spekbuurt.
// A Lampas shoarma joint with a back of house full of enemies, built the way Neon Vice builds its levels:
// a 1 m cell grid (walls, glass, doors, furniture) that drives collision, cover, line of sight and pathing.
//   - walls and tall furniture (counters, bars, slot machines, racks, crates, cars) stop bullets: that's cover
//   - low furniture (tables, sofas, card tables, gym benches) blocks walking but bullets fly over it
//   - glass panes block walking, you can see through them, and any bullet shatters them
//   - red barrels explode when shot
// Rules: 3 lives (Neon Vice Easy), mouse aim, click / F attack, E grab / throw, 1 Maboota / 2 gun, R restart.
//
// The level is built once, 300 m east of De Natte Worst, in the same scene. initMission(ctx) gets the engine
// helpers from main.js.

export function initMission(ctx) {
  const { THREE, scene, camera, player, state, box, cyl, lam, solid, makePerson, animate, toast, beep, addMoney,
    neonTube, neonRect, signTex, canvasTex, car, $, maboota, equip, bubble, say, addInteract, clearPlayerSplats, sun, hemi,
    setBounds, updateObjective, setArea } = ctx;
  const OX = 300, Z0 = -26; // grid cell (x, z) covers world [OX + x, OX + x + 1] × [Z0 + z, Z0 + z + 1]
  const L = (x, z, y = 0) => new THREE.Vector3(OX + x, y, Z0 + z);
  const root = new THREE.Group(); root.visible = false; scene.add(root); // only drawn while the mission is on
  const rnd = (a, b) => a + Math.random() * (b - a);

  // ================================================================== THE MAP
  // Rooms connect in loops (Neon Vice style), so there is always more than one way in:
  //   restaurant → lounge → gambling room → landing → office / back corridor
  //   restaurant → landing → back corridor → gym / warehouse → garage → mixing room → restaurant
  const W = 46, H = 26;
  const G = Array.from({ length: H }, () => Array(W).fill('#'));
  const carve = (x0, z0, x1, z1, ch = '.') => { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) G[z][x] = ch; };
  const put = (x, z, ch) => { G[z][x] = ch; };
  const putR = (x0, z0, x1, z1, ch) => carve(x0, z0, x1, z1, ch);
  const ROOMS = [ // name, x0, z0, x1, z1 (interior cells), floor
    ['gambling', 1, 1, 14, 10, 'casino'], ['office', 16, 1, 24, 7, 'parquet'], ['gym', 26, 1, 32, 8, 'rubber'], ['warehouse', 34, 1, 44, 12, 'concrete'],
    ['landing', 16, 9, 24, 13, 'hall'], ['corridor', 26, 10, 32, 13, 'hall'],
    ['lounge', 1, 12, 9, 24, 'shag'], ['restaurant', 11, 15, 24, 24, 'checker'], ['mixing', 26, 15, 32, 24, 'tiles'], ['garage', 34, 14, 44, 24, 'garage'],
  ];
  for (const [, x0, z0, x1, z1] of ROOMS) carve(x0, z0, x1, z1);
  // doors (2 cells wide, swing doors are added below on every D run)
  putR(4, 11, 5, 11, 'D');   // gambling ↔ lounge
  putR(15, 9, 15, 10, 'D');  // gambling ↔ landing
  putR(19, 8, 20, 8, 'D');   // landing ↔ office
  putR(19, 14, 20, 14, 'D'); // restaurant ↔ landing (PERSONEEL)
  putR(25, 11, 25, 12, 'D'); // landing ↔ corridor
  putR(29, 9, 30, 9, 'D');   // corridor ↔ gym
  putR(33, 11, 33, 12, 'D'); // corridor ↔ warehouse
  putR(29, 14, 30, 14, 'D'); // corridor ↔ mixing room
  putR(10, 20, 10, 21, 'D'); // lounge ↔ restaurant
  putR(25, 22, 25, 23, 'D'); // restaurant ↔ mixing room (behind the counter)
  putR(33, 18, 33, 19, 'D'); // mixing room ↔ garage
  carve(37, 13, 41, 13);     // warehouse ↔ garage: wide open loading bay (no door)
  carve(18, 25, 19, 25);     // the front door of the snackbar (open)
  // glass: storefront, office window onto the gambling room, gym window onto the corridor
  putR(11, 25, 17, 25, '%'); putR(20, 25, 24, 25, '%');
  putR(15, 2, 15, 6, '%');
  putR(26, 9, 28, 9, '%'); putR(31, 9, 32, 9, '%');
  // pillars in the landing (cover in the middle of the room)
  put(18, 11, '#'); put(21, 11, '#');
  // furniture. K counter, B bar, M slot machine, F fridge/vending, R rack, C crates, w workbench / steel table,
  // O desk, V safe, Q pinball, b punching bag, X explosive barrel  (all cover)
  // T table, S sofa, c card table, P pool table, G gym bench, p plant  (low: bullets fly over)
  putR(13, 17, 18, 17, 'K'); put(14, 15, 'F'); putR(24, 15, 24, 16, 'F');                       // restaurant: counter, döner, drinks fridge
  putR(13, 20, 14, 21, 'T'); putR(16, 20, 17, 21, 'T'); putR(21, 20, 22, 21, 'T'); putR(13, 23, 14, 23, 'T'); putR(22, 23, 23, 23, 'T');
  put(11, 24, 'p'); put(24, 24, 'p');
  putR(2, 18, 5, 18, 'S'); putR(3, 20, 4, 20, 'T'); putR(7, 12, 8, 12, 'F'); putR(8, 15, 9, 16, 'Q'); putR(1, 23, 4, 24, 'S'); put(9, 24, 'p'); // lounge
  putR(3, 3, 4, 4, 'c'); putR(8, 3, 9, 4, 'c'); putR(8, 7, 9, 8, 'c'); putR(2, 7, 3, 9, 'P');          // gambling: card tables, pool table
  putR(1, 1, 1, 5, 'M'); putR(12, 2, 12, 6, 'B'); put(14, 1, 'F');                                    // slot machines, bar, fridge
  putR(18, 3, 21, 3, 'O'); putR(23, 1, 24, 1, 'V'); putR(16, 1, 16, 1, 'F'); put(24, 7, 'p');          // office
  put(23, 9, 'F'); put(24, 9, 'F'); put(16, 13, 'p');                                                  // landing: vending machines
  putR(27, 13, 28, 13, 'C'); put(31, 10, 'C');                                                         // corridor crates
  putR(27, 3, 28, 3, 'G'); putR(30, 3, 31, 3, 'G'); put(29, 6, 'b'); putR(32, 1, 32, 2, 'C');           // gym
  putR(36, 2, 36, 8, 'R'); putR(39, 2, 39, 8, 'R'); putR(42, 2, 42, 8, 'R'); putR(43, 11, 44, 12, 'C'); put(35, 10, 'C'); // warehouse
  putR(28, 18, 30, 19, 'w'); putR(31, 23, 32, 24, 'C'); put(32, 15, 'F'); put(26, 24, 'C');            // mixing room
  putR(36, 17, 37, 20, 'A'); putR(41, 17, 42, 20, 'A'); putR(44, 15, 44, 17, 'w'); put(35, 23, 'X'); put(44, 23, 'X'); put(34, 15, 'X'); // garage
  put(44, 1, 'X'); put(13, 10, 'X');
  const cellAt = (wx, wz) => { const x = Math.floor(wx - OX), z = Math.floor(wz - Z0); if (z >= H) return '.'; if (x < 0 || x >= W || z < 0) return '#'; return G[z][x]; };
  const BLOCK = new Set('#%KBMFRCwOVQbXATScPGp');
  const COVER = new Set('#KBMFRCwOVQbXA');
  const SIGHT = new Set('#R');
  const isBlock = (c) => BLOCK.has(c), isCover = (c) => COVER.has(c);

  // ================================================================== GEOMETRY
  const WALL_H = 2.3;
  const wallM = lam({ color: 0x2c2238 }), capM = lam({ color: 0xf2e6f4 });
  const cellSolids = new Map(); // "x,z" -> solid (for glass and barrels that can go away)
  const solidRun = (x0, x1, z0, z1) => solid(OX + x0, OX + x1, Z0 + z0, Z0 + z1);
  function floorW(x0, x1, z0, z1, tex, rep = 1, color = 0xffffff, y = 0.02) {
    const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((x1 - x0) / rep, (z1 - z0) / rep);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), lam({ map: t, color }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; root.add(m);
  }
  const T = {
    checker: canvasTex(64, 64, (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#b8202a' : '#f2e8d8'; g.fillRect(x * 32, y * 32, 32, 32); } }),
    shag: canvasTex(64, 64, (g) => { g.fillStyle = '#c8602a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 500; i++) { g.fillStyle = ['#d8743a', '#a84a1a', '#e08a4a'][i % 3]; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } }),
    hall: canvasTex(64, 64, (g) => { g.fillStyle = '#3a1a4a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#ff3fa4'; g.fillRect(0, 28, 64, 3); g.fillStyle = '#5a2a6a'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 2, 64); }),
    casino: canvasTex(64, 64, (g) => { g.fillStyle = '#123a2a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#d8b040'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 4); g.lineTo(60, 32); g.lineTo(32, 60); g.lineTo(4, 32); g.closePath(); g.stroke(); g.fillStyle = '#c8102e'; g.beginPath(); g.arc(32, 32, 5, 0, 7); g.fill(); }),
    parquet: canvasTex(64, 64, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#7a4a22', '#8a5a2a', '#6a3a1a'][(x + y * 3) % 3]; if ((x + y) % 2) g.fillRect(x * 16, y * 16, 16, 16); else { for (let k = 0; k < 4; k++) { g.fillRect(x * 16 + k * 4, y * 16, 3, 16); } } } }),
    rubber: canvasTex(64, 64, (g) => { g.fillStyle = '#2a2c30'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 64, 2); }),
    concrete: canvasTex(64, 64, (g) => { g.fillStyle = '#8a8680'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } }),
    tiles: canvasTex(64, 64, (g) => { g.fillStyle = '#e8eef0'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#a8b8c0'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } }),
    garage: canvasTex(64, 64, (g) => { g.fillStyle = '#6a6862'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(10,10,10,.35)'; g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 6 + Math.random() * 8, 4 + Math.random() * 5, Math.random(), 0, 7); g.fill(); } }),
    asphalt: canvasTex(64, 64, (g) => { g.fillStyle = '#3a3a40'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } }),
    paving: canvasTex(64, 64, (g) => { g.fillStyle = '#a89a8a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#7a6e62'; g.lineWidth = 2; for (let y = 0; y < 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y); g.stroke(); for (let x = (y / 16) % 2 ? 0 : 16; x < 64; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } } }),
  };
  // street, pavement, neighbours
  floorW(OX - 10, OX + 58, 2.6, 12, T.asphalt, 4); floorW(OX - 10, OX + 58, 0, 2.6, T.paving, 1.5);
  for (let x = -8; x < 58; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 7.3, root, false);
  for (const [x0, x1, c] of [[-10, 0, 0x2a3a5a], [W, W + 12, 0x3a2a4a]]) { box(x1 - x0, 7, 26, lam({ color: c }), OX + (x0 + x1) / 2, 3.5, -13, root); solid(OX + x0, OX + x1, -26, 0); }
  floorW(OX, OX + W, Z0, 0, T.concrete, 3, 0x554466, 0.01); // under walls and doorways
  for (const [, x0, z0, x1, z1, f] of ROOMS) floorW(OX + x0, OX + x1 + 1, Z0 + z0, Z0 + z1 + 1, T[f], f === 'checker' ? 1 : f === 'garage' || f === 'concrete' ? 3 : 1.4);
  for (const [x, z] of [[18, 25], [19, 25], [4, 11], [5, 11], [15, 9], [15, 10], [19, 8], [20, 8], [19, 14], [20, 14], [25, 11], [25, 12], [29, 9], [30, 9], [33, 11], [33, 12], [29, 14], [30, 14], [10, 20], [10, 21], [25, 22], [25, 23], [33, 18], [33, 19], [37, 13], [38, 13], [39, 13], [40, 13], [41, 13]])
    floorW(OX + x, OX + x + 1, Z0 + z, Z0 + z + 1, T.hall, 1, 0xffffff, 0.021);
  // walls: one box per horizontal run of '#'
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
    if (G[z][x] !== '#') continue; let x1 = x; while (x1 + 1 < W && G[z][x1 + 1] === '#') x1++;
    const n = x1 - x + 1; box(n, WALL_H, 1, wallM, OX + x + n / 2, WALL_H / 2, Z0 + z + 0.5, root);
    box(n + 0.02, 0.06, 1.02, capM, OX + x + n / 2, WALL_H + 0.03, Z0 + z + 0.5, root, false);
    solidRun(x, x1 + 1, z, z + 1); x = x1;
  }
  // glass panes: one pane per cell, oriented along its wall line
  const glassM = new THREE.MeshPhongMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.32, shininess: 120, specular: 0xffffff, depthWrite: false });
  const frameM = lam({ color: 0xe8e8f0 });
  const glass = new Map();
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '%') {
    const horiz = (x > 0 && '#%'.includes(G[z][x - 1])) || (x < W - 1 && '#%'.includes(G[z][x + 1]));
    const g = new THREE.Group(); g.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); if (!horiz) g.rotation.y = Math.PI / 2; root.add(g);
    box(1, 0.5, 0.3, wallM, 0, 0.25, 0, g); box(1, 0.06, 0.32, capM, 0, 0.52, 0, g, false);
    const pane = new THREE.Mesh(new THREE.BoxGeometry(1, 1.7, 0.06), glassM); pane.position.y = 1.4; g.add(pane);
    box(1, 0.06, 0.1, frameM, 0, 2.27, 0, g, false); box(0.06, 1.75, 0.1, frameM, 0.47, 1.4, 0, g, false);
    glass.set(x + ',' + z, { g, pane, s: solidRun(x, x + 1, z, z + 1), x, z, horiz });
  }
  // furniture: merged runs per type, with a look per type
  const FM = {
    K: [1.05, 0xc8402e], B: [1.1, 0x6a3a1a], M: [1.7, 0x7a1a3a], F: [1.8, 0xe8e8e0], R: [2.0, 0x3a5aa0], C: [1.0, 0x8a6a3a], w: [0.95, 0xc8ccd0],
    O: [0.8, 0x3a1a0a], V: [1.2, 0x3a3a40], Q: [1.4, 0xff3fa4], b: [1.4, 0xb8102e], T: [0.76, 0xf2efe6], S: [0.75, 0x6a2a5a], c: [0.78, 0x1f6a3a], P: [0.85, 0x1a6a3a], G: [0.5, 0x1a1a1a], p: [0.9, 0x2f7a2a],
  };
  const furnMeshes = [];
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
    const ch = G[z][x]; if (!FM[ch] && ch !== 'A') continue;
    let x1 = x; while (x1 + 1 < W && G[z][x1 + 1] === ch) x1++;
    if (ch === 'A') { solidRun(x, x1 + 1, z, z + 1); x = x1; continue; } // cars: the model is placed below
    const n = x1 - x + 1, [h, col] = FM[ch], cx = OX + x + n / 2, cz = Z0 + z + 0.5;
    if (ch === 'p') { for (let k = 0; k < n; k++) { cyl(0.22, 0.18, 0.4, lam({ color: 0x8a4a2a }), OX + x + k + 0.5, 0.2, cz, root, 10); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), lam({ color: col })); b.position.set(OX + x + k + 0.5, 0.8, cz); b.castShadow = true; root.add(b); } }
    else if (ch === 'c') { /* card tables are drawn per 2×2 block below */ }
    else if (ch === 'T') { box(n - 0.08, 0.06, 0.92, lam({ color: col }), cx, h, cz, root); for (const ox of [-n / 2 + 0.2, n / 2 - 0.2]) box(0.08, h, 0.08, lam({ color: 0x3a2212 }), cx + ox, h / 2, cz, root, false); }
    else if (ch === 'R') { box(n - 0.04, h, 0.9, lam({ color: col }), cx, h / 2, cz, root); for (let k = 0; k < n; k++) for (let s = 0; s < 2; s++) box(0.42, 0.42, 0.6, lam({ color: [0xe8a020, 0xc8402e, 0xf2c43a][(x + k + s + z) % 3] }), OX + x + k + 0.5, 0.45 + s * 0.85, cz + (s ? 0.12 : -0.12), root); }
    else if (ch === 'M') { box(n - 0.06, h, 0.8, lam({ color: col }), cx, h / 2, cz, root); for (let k = 0; k < n; k++) { const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), new THREE.MeshBasicMaterial({ color: [0xffe14a, 0x3ff0ff, 0xff3fa4][(x + k) % 3] })); sc.rotation.x = -Math.PI / 2.6; sc.position.set(OX + x + k + 0.5, h + 0.01, cz + 0.1); root.add(sc); } }
    else box(n - 0.06, h, 0.9, lam({ color: col }), cx, h / 2, cz, root);
    if (ch === 'K' || ch === 'w') box(n, 0.06, 1.0, new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.8 }), cx, h + 0.03, cz, root, false);
    solidRun(x, x1 + 1, z, z + 1); x = x1;
  }
  // vertical merges of the same furniture make a lot of boxes; that's fine at this size.
  for (const [x, z] of [[3, 3], [8, 3], [8, 7]]) { cyl(0.95, 0.95, 0.06, lam({ color: 0x1f6a3a }), OX + x + 1, 0.78, Z0 + z + 1, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + x + 1, 0.37, Z0 + z + 1, root); }
  box(1.8, 0.08, 2.8, lam({ color: 0x1a7a3a }), OX + 3, 0.86, Z0 + 8.5, root, false); // pool table felt
  // explosive barrels
  const barrels = new Map();
  const barrelM = lam({ color: 0xc81e1e });
  for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'X') {
    const g = new THREE.Group(); g.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); root.add(g);
    cyl(0.34, 0.34, 1.0, barrelM, 0, 0.5, 0, g, 14); cyl(0.35, 0.35, 0.05, lam({ color: 0xffd23a }), 0, 0.7, 0, g, 14);
    const lbl = new THREE.Mesh(new THREE.CircleGeometry(0.2, 3), new THREE.MeshBasicMaterial({ color: 0xffd23a })); lbl.rotation.x = -Math.PI / 2; lbl.position.y = 1.01; g.add(lbl);
    barrels.set(x + ',' + z, { g, s: solidRun(x, x + 1, z, z + 1), x, z });
  }
  // the restaurant front
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SNACKPALEIS SPEKBUURT', size: 90 }, { t: 'EIGENDOM VAN DE LAMPAS', size: 38, color: '#ffffff' }], '#1a0a10', '#ff7a1a', 1024, 150) }));
  sign.position.set(OX + 18.5, 2.75, 0.02); root.add(sign); neonRect(root, OX + 18.5, 2.75, 9.2, 1.25, 0.06, 0xff7a1a);
  box(14, 0.12, 1.2, lam({ color: 0xff7a1a }), OX + 18, 2.15, 0.6, root, false); // awning edge
  const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 14.5, 2.35, Z0 + 15.5); root.add(doner);
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.9), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'LAMPAS SHOARMA  W 5', size: 30 }, { t: 'Lampas spice: 100% echt*', size: 24, color: '#ffffff' }], '#1a0a10', '#3ff0ff', 512, 128) }));
  menu.rotation.x = -Math.PI / 2; menu.position.set(OX + 16.5, WALL_H + 0.08, Z0 + 14.5); root.add(menu);
  const rollT = canvasTex(64, 64, (g) => { for (let y = 0; y < 64; y += 6) { g.fillStyle = y % 12 ? '#8a8a86' : '#6a6a66'; g.fillRect(0, y, 64, 6); } });
  const roll = new THREE.Mesh(new THREE.PlaneGeometry(9, WALL_H), lam({ map: rollT })); roll.position.set(OX + 39.5, WALL_H / 2, 0.03); root.add(roll);
  const jvk = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8b040'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2a1a1a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(64, 44, 22, 0, 7); g.fill(); g.fillStyle = '#ff7a1a'; g.fillRect(36, 66, 56, 24); g.fillStyle = '#ffd36b'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText('JAN VAN KAAS', 64, 88); }) }));
  jvk.position.set(OX + 20, 1.7, Z0 + 1.02); root.add(jvk);
  const spice = cyl(0.42, 0.42, 0.05, lam({ color: 0xd8742a }), OX + 29.5, 1.02, Z0 + 19, root, 16); // the mixing bowl
  // cars in the garage (their cells are 'A' in the grid)
  car(OX + 37, Z0 + 19, 0xff7a1a, Math.PI / 2, false, 5); car(OX + 42, Z0 + 19, 0x1a1a1a, Math.PI / 2, false, 0);
  // neon: one strip per room, top of the walls
  for (const [name, x0, z0, x1, z1] of ROOMS) neonTube(root, OX + x0 + 0.2, WALL_H - 0.25, OX + x1 + 0.8, WALL_H - 0.25, Z0 + z0 + 0.04, { gambling: 0x3ff0ff, office: 0xffd23a, gym: 0x7dff9a, warehouse: 0xffd8a0, landing: 0xff3fa4, corridor: 0x3ff0ff, lounge: 0xff7a1a, restaurant: 0xff3fa4, mixing: 0x3ff0ff, garage: 0xffd23a }[name]);
  const lights = [];
  for (const [x, z, c, k] of [[18, 20, 0xff9a6a, 2.2], [20, 11, 0xff3fa4, 1.6], [7, 6, 0x3ff0ff, 1.8], [39, 7, 0xffd8a0, 2.0], [5, 18, 0xff7a1a, 1.3], [39, 19, 0xffd23a, 1.3]]) { const l = new THREE.PointLight(c, 0, 18, 1.3); l.position.set(OX + x, WALL_H + 0.6, Z0 + z); root.add(l); lights.push([l, k]); }
  // the Oofmobiel, parked outside
  const van = ctx.makeVan(); van.position.set(OX + 12, 0, 4.6); root.add(van);
  solid(OX + 8.9, OX + 15.2, 3.45, 5.75);

  // ================================================================== GRID QUERIES (Neon Vice: los / rayWall / pathing on cells)
  const walkable = (x, z) => x >= 0 && z >= 0 && x < W && z < H && !isBlock(G[z][x]);
  function los(a, b) { // walls and racks block sight; glass and low furniture don't
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), n = Math.ceil(d / 0.15);
    for (let i = 1; i < n; i++) { const t = i / n; if (SIGHT.has(cellAt(a.x + dx * t, a.z + dz * t))) return false; }
    return !doorBlocks(a.x, a.z, b.x, b.z);
  }
  const NB = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  function path(from, to) {
    const sx = Math.floor(from.x - OX), sz = Math.floor(from.z - Z0), tx = Math.floor(to.x - OX), tz = Math.floor(to.z - Z0);
    if (sx < 0 || sz < 0 || sx >= W || sz >= H || tx < 0 || tz < 0 || tx >= W || tz >= H) return null;
    const N = W * H, prev = new Int32Array(N).fill(-1), start = sz * W + sx, goal = tz * W + tx, q = new Int32Array(N); let h = 0, t = 0; q[t++] = start; prev[start] = start;
    while (h < t) { const c = q[h++]; if (c === goal) break; const cx = c % W, cz = (c / W) | 0;
      for (const [dx, dz] of NB) { const nx = cx + dx, nz = cz + dz, n = nz * W + nx; if (nx < 0 || nz < 0 || nx >= W || nz >= H || prev[n] !== -1) continue;
        if (!walkable(nx, nz) && n !== goal) continue; if (dx && dz && (!walkable(cx + dx, cz) || !walkable(cx, cz + dz))) continue; prev[n] = c; q[t++] = n; } }
    if (prev[goal] === -1) return null;
    const out = []; for (let c = goal; c !== start; c = prev[c]) out.push(c); out.reverse();
    return out.map((c) => new THREE.Vector3(OX + (c % W) + 0.5, 0, Z0 + ((c / W) | 0) + 0.5));
  }

  // ================================================================== SWING DOORS (on every run of D cells)
  const doors = [];
  const doorM = lam({ color: 0x8a1a2a }), doorM2 = lam({ color: 0x5a3a6a }), portM = lam({ color: 0x9ad0ff });
  function addDoor(hx, hz, base, len, sign) {
    const g = new THREE.Group(); g.position.set(hx, 0, hz); g.rotation.y = base; root.add(g);
    box(len - 0.06, 2.05, 0.07, sign ? doorM : doorM2, len / 2, 1.03, 0, g, false);
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.17, 14), portM); p.position.set(len / 2, 1.5, 0.04); g.add(p);
    const p2 = p.clone(); p2.rotation.y = Math.PI; p2.position.z = -0.04; g.add(p2);
    if (sign) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.28), lam({ map: signTex([{ t: sign, size: 40 }], '#1a1a1a', '#ffd23a', 256, 64) })); s.position.set(len / 2, 1.9, 0.045); g.add(s); }
    doors.push({ g, hx, hz, base, len, th: 0, w: 0, pusher: '' });
  }
  { const seen = new Set();
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { if (G[z][x] !== 'D' || seen.has(x + ',' + z)) continue;
      if (x + 1 < W && G[z][x + 1] === 'D') { let x1 = x; while (G[z][x1 + 1] === 'D') { x1++; } for (let k = x; k <= x1; k++) seen.add(k + ',' + z); addDoor(OX + x, Z0 + z + 0.5, 0, x1 - x + 1, x === 19 && z === 14 ? 'PERSONEEL' : ''); }
      else { let z1 = z; while (z1 + 1 < H && G[z1 + 1][x] === 'D') z1++; for (let k = z; k <= z1; k++) seen.add(x + ',' + k); addDoor(OX + x + 0.5, Z0 + z, -Math.PI / 2, z1 - z + 1); } } }
  const doorEnd = (d) => { const a = d.base + d.th; return [d.hx + Math.cos(a) * d.len, d.hz - Math.sin(a) * d.len]; };
  function segDist(px, pz, ax, az, bx, bz) { const sx = bx - ax, sz = bz - az; let t = ((px - ax) * sx + (pz - az) * sz) / (sx * sx + sz * sz); t = Math.max(0, Math.min(1, t)); const cx = ax + sx * t, cz = az + sz * t; return [Math.hypot(px - cx, pz - cz), cx, cz]; }
  function segInt(ax, az, bx, bz, cx, cz, dx, dz) { const d = (bx - ax) * (dz - cz) - (bz - az) * (dx - cx); if (Math.abs(d) < 1e-9) return false; const u = ((cx - ax) * (dz - cz) - (cz - az) * (dx - cx)) / d, v = ((cx - ax) * (bz - az) - (cz - az) * (bx - ax)) / d; return u >= 0 && u <= 1 && v >= 0 && v <= 1; }
  function collideDoors(p, r, vx, vz, isP) {
    for (const d of doors) {
      const e = doorEnd(d), [dist, cx, cz] = segDist(p.x, p.z, d.hx, d.hz, e[0], e[1]);
      if (dist >= r) continue;
      const nx = (p.x - cx) / (dist || 1), nz = (p.z - cz) / (dist || 1);
      p.x = cx + nx * r; p.z = cz + nz * r;
      const a = d.base + d.th, side = Math.sign(nx * Math.sin(a) + nz * Math.cos(a)) || 1;
      const vn = Math.hypot(vx, vz), target = 2 + vn * 1.6;
      if (Math.abs(d.w) < target || Math.sign(d.w) !== side) { if (isP && vn > 2 && Math.abs(d.w) < 2) sfx('door'); d.w = side * target; d.pusher = isP ? 'p' : 'e'; }
    }
  }
  function updateDoors(dt) {
    for (const d of doors) {
      d.th += d.w * dt; d.w *= Math.exp(-dt * 3.5);
      if (d.th > 1.57) { d.th = 1.57; d.w = -d.w * 0.25; } if (d.th < -1.57) { d.th = -1.57; d.w = -d.w * 0.25; }
      if (Math.abs(d.w) < 0.4) d.th *= Math.exp(-dt * 0.8); // swing doors drift shut
      d.g.rotation.y = d.base + d.th;
      if (Math.abs(d.w) > 3 && d.pusher === 'p') {
        const e2 = doorEnd(d);
        for (const e of enemies) { const f = e.userData.foe; if (!f.alive || f.down > 0) continue;
          if (segDist(e.position.x, e.position.z, d.hx, d.hz, e2[0], e2[1])[0] < 0.44) { const a = d.base + d.th, s = Math.sign(d.w); knockdown(e, [-Math.sin(a) * s, -Math.cos(a) * s]); sfx('door'); popup(e.position, 'DOOR SLAM!', '#ffd36b'); shake(0.25); d.w *= 0.4; } }
      }
    }
  }
  const doorBlocks = (ax, az, bx, bz) => doors.some((d) => { if (Math.abs(d.th) > 0.5) return false; const e = doorEnd(d); return segInt(ax, az, bx, bz, d.hx, d.hz, e[0], e[1]); });

  // ================================================================== SOUND (Neon Vice-style synth hits)
  const sfx = (k) => ({
    pistol: () => { beep(130, 0.07, 'square', 0.08); beep(70, 0.12, 'sawtooth', 0.06); },
    shotgun: () => { beep(80, 0.18, 'sawtooth', 0.1); beep(45, 0.25, 'square', 0.08); },
    epistol: () => { beep(160, 0.06, 'square', 0.05); beep(90, 0.1, 'sawtooth', 0.04); },
    swing: () => beep(220, 0.06, 'triangle', 0.03),
    hit: () => { beep(95, 0.12, 'square', 0.07); beep(55, 0.15, 'sawtooth', 0.05); },
    splat: () => { beep(60, 0.22, 'sawtooth', 0.07); beep(110, 0.08, 'square', 0.04); },
    door: () => { beep(95, 0.12, 'square', 0.06); beep(50, 0.1, 'sawtooth', 0.05); },
    throw: () => beep(500, 0.12, 'triangle', 0.04),
    pick: () => { beep(660, 0.05, 'square', 0.04); beep(990, 0.05, 'square', 0.03); },
    vest: () => { beep(300, 0.1, 'square', 0.06); beep(1200, 0.06, 'triangle', 0.03); },
    hurt: () => { beep(140, 0.25, 'sawtooth', 0.08); },
    die: () => { beep(110, 0.6, 'sawtooth', 0.09); beep(55, 0.8, 'square', 0.07); },
    alert: () => { beep(880, 0.05, 'square', 0.04); beep(1320, 0.07, 'square', 0.04); },
    thud: () => beep(48, 0.12, 'sine', 0.08),
    ric: () => { beep(2400 + Math.random() * 800, 0.05, 'triangle', 0.025); },
    glass: () => { for (let i = 0; i < 4; i++) setTimeout(() => beep(2600 + Math.random() * 2400, 0.06, 'triangle', 0.035), i * 25); beep(900, 0.12, 'sawtooth', 0.03); },
    boom: () => { beep(40, 0.6, 'sawtooth', 0.12); beep(65, 0.5, 'square', 0.1); beep(120, 0.2, 'sawtooth', 0.06); },
    empty: () => beep(900, 0.03, 'square', 0.03),
    cash: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.06), i * 110)),
  }[k] || (() => {}))();

  // ================================================================== WEAPONS (numbers from Neon Vice's WD table, Easy difficulty)
  const WD = {
    maboota: { name: 'MABOOTA', melee: true, knock: true, range: 1.15 },
    fists: { name: 'FISTS', melee: true, knock: true, range: 1.0 },
    bat: { name: 'HONKBALKNUPPEL', melee: true, kill: true, range: 1.25 },
    makarov: { name: 'MAKAROV', ammo: 8, cd: 0.2, pel: 1, spr: 0.025, mv: 0.07, bloom: 0.04, ecd: 0.8, loud: 13, kick: 0.1, snd: 'pistol' },
    shotgun: { name: 'SAWN-OFF', ammo: 6, cd: 0.75, pel: 7, spr: 0.26, mv: 0.04, bloom: 0, ecd: 1.2, loud: 16, kick: 0.4, snd: 'shotgun' },
  };
  const KILLPTS = { maboota: 450, bat: 450, fists: 500, exec: 800, door: 600, throw: 550, makarov: 300, shotgun: 300, boom: 700 };
  const FORCE = { makarov: 4.5, shotgun: 9.5, bat: 6.5, maboota: 5.5, fists: 5.5, exec: 1, throw: 5, door: 6, boom: 10 };
  const EASY = { hp: 3, react: 1.9, espr: 0.17, ebSpd: 15, vision: 9, cone: 0.85, ecd: 1.5, regen: 7 };
  const TIPS = ['Red laser = a Lampas is aiming at you. Get behind a counter, a bar or a rack.', 'Counters, bars, slot machines, racks and crates stop bullets. Tables and sofas don\'t.', 'Stand still for accurate shots. Running throws your aim off.', 'Run into a door to swing it. A fast door knocks people flat.', 'The Maboota knocks people down. Hit a downed Lampas again to finish him.', 'Out of ammo? Attack again to throw the gun. It knocks people down.', 'Shoot the red barrels. Stand back.', 'Glass stops you, not bullets. And they can see you through it.', 'Gunshots wake up the whole floor. The Maboota is quiet.', 'There is always another way round. The restaurant, the lounge and the garage all connect.'];
  function weaponMesh(id) {
    const g = new THREE.Group();
    if (id === 'bat') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.025, 0.85, 8), lam({ color: 0xc8a06a })); b.position.y = -0.4; g.add(b); }
    if (id === 'makarov') { box(0.05, 0.1, 0.26, lam({ color: 0x1a1a1a }), 0, -0.05, 0.1, g, false); box(0.05, 0.14, 0.07, lam({ color: 0x3a2a1a }), 0, -0.1, 0, g, false); }
    if (id === 'shotgun') { box(0.06, 0.07, 0.8, lam({ color: 0x1a1a1a }), 0, -0.03, 0.3, g, false); box(0.07, 0.11, 0.3, lam({ color: 0x6a3a1a }), 0, -0.06, -0.12, g, false); }
    return g;
  }
  const isGun = (id) => !!(id && WD[id] && !WD[id].melee);

  // ================================================================== THE PLAYER'S KIT
  // slot 1 = Maboota (always), slot 2 = a weapon bought from The Russian or picked up. Slot 2 only works on missions.
  state.ammo = state.ammo || {};
  const P = { slot: 1, held: null, hp: EASY.hp, maxhp: EASY.hp, armor: 0, invT: 0, lastHurt: 0, dead: false, deadT: 0, fireT: 0, bloom: 0, exec: 0, cause: '', vx: 0, vz: 0, last: new THREE.Vector3() };
  const handGun = new THREE.Group(); handGun.position.set(0, -0.68, 0.05); handGun.visible = false; player.userData.arms[0].add(handGun);
  const owned = () => ['shotgun', 'makarov', 'bat'].filter((k) => state.kit.includes(k));
  function setHeld(h) { P.held = h; handGun.clear(); if (h) handGun.add(weaponMesh(h.id)); hud(); }
  function ownWeapon(id) { return { id, ammo: isGun(id) ? (state.ammo[id] || 0) : 0, own: true }; }
  function saveOwnAmmo() { if (P.held && P.held.own && isGun(P.held.id)) state.ammo[P.held.id] = P.held.ammo; }
  function selectSlot(n) {
    if (n === 2) {
      if (!M.active) { toast('NOT ON THE STREET', 'Your guns stay in the Oofmobiel. Slot 2 works on missions only. Press I for your inventory.', 2); return; }
      const o = owned().filter((k) => !items.some((it) => it.own && it.id === k)); // a bought gun you threw is on the floor: go get it
      if (!P.held && !o.length) { toast('NO WEAPON IN SLOT 2', 'Grab one from a Lampas (E), or buy one from The Russian.', 1.6); return; }
      if (P.slot === 2 && P.held && P.held.own && o.length > 1) { saveOwnAmmo(); setHeld(ownWeapon(o[(o.indexOf(P.held.id) + 1) % o.length])); } // press 2 again: cycle what you own
      else if (!P.held) setHeld(ownWeapon(o[0]));
    }
    P.slot = n; maboota.visible = n === 1; handGun.visible = n === 2;
    state.armed = n === 1 || (P.held && WD[P.held.id].melee);
    $('weapon').className = 'hud on'; hud(); beep(300, 0.05, 'square', 0.03);
  }
  const gunOut = () => M.active && P.slot === 2 && P.held && isGun(P.held.id);
  function holster() { saveOwnAmmo(); P.slot = 1; handGun.visible = false; }

  // ================================================================== FX: popups, shake, flash, hitstop, blood, gibs, pools, casings, muzzle flash
  const FX = { shake: 0, freeze: 0, flash: 0, flashC: '255,0,30', kick: new THREE.Vector3(), hurtT: 0 };
  const shake = (v) => { FX.shake = Math.max(FX.shake, v); };
  const popLayer = document.createElement('div'); popLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;overflow:hidden'; document.body.appendChild(popLayer);
  const pops = [];
  function popup(at, txt, col = '#7dff9a', big) {
    const el = document.createElement('div'); el.textContent = txt;
    el.style.cssText = `position:absolute;transform:translate(-50%,-50%);font:${big ? 18 : 12}px 'Press Start 2P',monospace;color:${col};text-shadow:2px 2px 0 #000,0 0 8px ${col};white-space:nowrap`;
    popLayer.appendChild(el); pops.push({ el, p: new THREE.Vector3(at.x, 2.2, at.z), t: 0 });
  }
  const parts = [], partGeo = new THREE.BoxGeometry(1, 1, 1), bloodMs = [0x9a0a14, 0x7a0610, 0xc8141e].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  const sparkM = new THREE.MeshBasicMaterial({ color: 0xffd880 }), woodM = new THREE.MeshBasicMaterial({ color: 0xb08050 }), shardM = new THREE.MeshBasicMaterial({ color: 0xc8f0ff, transparent: true, opacity: 0.8 }), fireM = [0xffa020, 0xff6010, 0x3a3030].map((c) => new THREE.MeshBasicMaterial({ color: c }));
  function particle(mat, x, y, z, vx, vy, vz, s, life, kind) { if (parts.length > 500) return; const m = new THREE.Mesh(partGeo, mat); m.scale.setScalar(s); m.position.set(x, y, z); root.add(m); parts.push({ m, vx, vy, vz, life, kind }); }
  function bloodBurst(at, dir, n, spd, y = 0.85) {
    const base = Math.atan2(dir[0], dir[1]);
    for (let i = 0; i < n; i++) { const a = base + (Math.random() - 0.5) * 1.6, s = (0.25 + Math.random() * 0.75) * spd; particle(bloodMs[i % 3], at.x, y + Math.random() * 0.3, at.z, Math.sin(a) * s, 0.3 + Math.random() * 3.7, Math.cos(a) * s, 0.04 + Math.random() * 0.05, 3, 'blood'); }
  }
  function sparks(x, y, z, mat = sparkM, n = 5) { for (let i = 0; i < n; i++) particle(mat, x, y, z, rnd(-3, 3), rnd(0, 3), rnd(-3, 3), 0.04, rnd(0.1, 0.25), 'spark'); }
  const casingM = new THREE.MeshBasicMaterial({ color: 0xd0a040 }), shellM = new THREE.MeshBasicMaterial({ color: 0xc8202a });
  function casing(at, a, shell) { const side = a + Math.PI / 2; const m = new THREE.Mesh(partGeo, shell ? shellM : casingM); m.scale.set(0.03, 0.03, shell ? 0.09 : 0.05); m.position.set(at.x, 1.1, at.z); root.add(m); parts.push({ m, vx: Math.sin(side) * (1.5 + Math.random()), vy: 1.5 + Math.random(), vz: Math.cos(side) * (1.5 + Math.random()), life: 40, kind: 'casing' }); }
  // gibs: heads, limbs and chunks (Neon Vice's gib / headPop / limbGib)
  const gibs = [];
  function gib(x, y, z, vx, vy, vz, s, color) { const m = new THREE.Mesh(partGeo, new THREE.MeshLambertMaterial({ color })); m.scale.set(s[0], s[1], s[2]); m.position.set(x, y, z); m.castShadow = true; root.add(m); gibs.push({ m, vx, vy, vz, wx: rnd(-12, 12), wy: rnd(-12, 12) }); if (gibs.length > 220) root.remove(gibs.shift().m); }
  function headPop(e, dir) {
    const u = e.userData, f = u.foe; if (f.headless) return; f.headless = true; u.head.visible = false; R.heads++;
    const x = e.position.x, z = e.position.z;
    gib(x, 1.6, z, dir[0] * rnd(3, 5), rnd(3, 5), dir[1] * rnd(3, 5), [0.26, 0.26, 0.26], f.skin);
    for (let i = 0; i < 7; i++) gib(x, 1.55, z, dir[0] * rnd(1, 5) + rnd(-2, 2), rnd(2, 6), dir[1] * rnd(1, 5) + rnd(-2, 2), [rnd(0.06, 0.12), rnd(0.05, 0.1), rnd(0.06, 0.12)], i % 2 ? 0xbf2633 : 0x8c0a10);
    bloodBurst(e.position, dir, 30, 4, 1.5); f.fountain = 1.4; popup(e.position, 'HEADSHOT!', '#ff3a4a');
  }
  function limbOff(e, dir) {
    const u = e.userData, f = u.foe; const arm = u.arms[1]; if (!arm.visible) return; arm.visible = false;
    gib(e.position.x, 1.2, e.position.z, dir[0] * rnd(3, 6), rnd(3, 6), dir[1] * rnd(3, 6), [0.12, 0.55, 0.12], f.shirt); bloodBurst(e.position, dir, 14, 3, 1.2);
  }
  // decals: floor blood, smears, wall splats, bullet holes, scorch; pools grow under bodies
  const decalGeo = new THREE.PlaneGeometry(1, 1);
  const bloodTex = canvasTex(64, 64, (g) => { g.fillStyle = '#8a0a12'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(32 + (Math.random() - 0.5) * 30, 32 + (Math.random() - 0.5) * 30, 5 + Math.random() * 10, 0, 7); g.fill(); } });
  const poolTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 4, 32, 32, 31); gr.addColorStop(0, 'rgba(110,6,14,.95)'); gr.addColorStop(0.8, 'rgba(120,8,16,.9)'); gr.addColorStop(1, 'rgba(120,8,16,0)'); g.fillStyle = gr; g.beginPath(); g.arc(32, 32, 31, 0, 7); g.fill(); });
  const smearTex = canvasTex(64, 32, (g) => { const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(138,10,18,0)'); gr.addColorStop(0.3, 'rgba(138,10,18,.9)'); gr.addColorStop(1, 'rgba(138,10,18,.6)'); g.fillStyle = gr; g.fillRect(0, 8, 64, 16); });
  const holeTex = canvasTex(32, 32, (g) => { g.fillStyle = 'rgba(20,16,16,.9)'; g.beginPath(); g.arc(16, 16, 5, 0, 7); g.fill(); g.fillStyle = 'rgba(20,16,16,.35)'; g.beginPath(); g.arc(16, 16, 10, 0, 7); g.fill(); });
  const scorchTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31); gr.addColorStop(0, 'rgba(10,8,8,.95)'); gr.addColorStop(1, 'rgba(10,8,8,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  const DM = (map) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  const decalM = DM(bloodTex), smearM = DM(smearTex), holeM = DM(holeTex), scorchM = DM(scorchTex);
  const decals = [], pools = [];
  function floorDecal(x, z, s, rot, mat = decalM) { if (decals.length > 320) root.remove(decals.shift()); const m = new THREE.Mesh(decalGeo, mat); m.scale.set(s, s, 1); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, 0.03 + (decals.length % 60) * 0.0004, z); root.add(m); decals.push(m); return m; }
  function wallDecal(x, y, z, nx, nz, s, mat = decalM) { if (decals.length > 320) root.remove(decals.shift()); const m = new THREE.Mesh(decalGeo, mat); m.scale.setScalar(s); m.position.set(x + nx * 0.02, y, z + nz * 0.02); m.lookAt(m.position.x + nx, y, m.position.z + nz); root.add(m); decals.push(m); }
  function addPool(e, big) { const m = floorDecal(e.position.x, e.position.z, 0.2, Math.random() * 6, DM(poolTex)); pools.push({ m, e, s: 0.2, max: big ? rnd(1.6, 2.0) : rnd(1.0, 1.4) }); }
  const flashL = new THREE.PointLight(0xffd080, 0, 9, 1.5); root.add(flashL); let flashT = 0;
  const flashSp = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe0a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flashSp.scale.setScalar(0.7); flashSp.visible = false; root.add(flashSp);
  function muzzle(at, k = 4) { flashL.position.set(at.x, 1.3, at.z); flashL.intensity = k; flashSp.position.set(at.x, 1.25, at.z); flashSp.visible = true; flashT = 0.06; }

  // ================================================================== BREAKABLES: glass and barrels
  function breakGlass(key) {
    const q = glass.get(key); if (!q) return false;
    glass.delete(key); G[q.z][q.x] = '.'; q.s.off = true; q.pane.visible = false;
    const cx = OX + q.x + 0.5, cz = Z0 + q.z + 0.5;
    for (let n = 0; n < 22; n++) particle(shardM, cx + rnd(-0.45, 0.45), rnd(0.6, 2.2), cz + rnd(-0.45, 0.45), rnd(-2.5, 2.5), rnd(0, 2), rnd(-2.5, 2.5), rnd(0.04, 0.09), 1.2, 'shard');
    for (let n = 0; n < 6; n++) floorDecal(cx + rnd(-0.9, 0.9), cz + rnd(-0.9, 0.9), 0.12, Math.random() * 6, shardDecalM);
    sfx('glass'); alertNoise(new THREE.Vector3(cx, 0, cz), 6); R.glass++; return true;
  }
  const shardDecalM = new THREE.MeshBasicMaterial({ color: 0xd8f4ff, transparent: true, opacity: 0.55, depthWrite: false });
  function explode(key, by) {
    const b = barrels.get(key); if (!b) return; barrels.delete(key); G[b.z][b.x] = '.'; b.s.off = true; root.remove(b.g);
    const at = new THREE.Vector3(OX + b.x + 0.5, 0, Z0 + b.z + 0.5);
    sfx('boom'); shake(0.8); FX.flash = 0.4; FX.flashC = '255,140,40'; muzzle(at, 9); flashT = 0.25; FX.freeze = 0.08;
    for (let i = 0; i < 40; i++) { const a = rnd(0, 6.28), v = rnd(1.5, 6); particle(fireM[i % 3], at.x, 0.5, at.z, Math.cos(a) * v, rnd(1, 5), Math.sin(a) * v, rnd(0.08, 0.18), rnd(0.4, 0.9), 'fire'); }
    floorDecal(at.x, at.z, 3.2, Math.random() * 6, scorchM); alertNoise(at, 14); popup(at, 'BOOM!', '#ffa020', true);
    const RR = 2.4;
    for (const e of enemies) { const f = e.userData.foe; if (!f.alive) continue; const d = e.position.distanceTo(at); if (d < RR) { const dir = [(e.position.x - at.x) / (d || 1), (e.position.z - at.z) / (d || 1)]; killEnemy(e, 'boom', dir); if (Math.random() < 0.6) limbOff(e, dir); } else if (d < RR + 1.2) knockdown(e, [(e.position.x - at.x) / d, (e.position.z - at.z) / d]); }
    const pd = player.position.distanceTo(at); if (pd < RR * 0.9) { const dir = [(player.position.x - at.x) / (pd || 1), (player.position.z - at.z) / (pd || 1)]; P.invT = 0; hurtPlayer(dir, 'boom'); }
    for (const [k2, b2] of barrels) if (Math.hypot(OX + b2.x + 0.5 - at.x, Z0 + b2.z + 0.5 - at.z) < RR) setTimeout(() => explode(k2), 140); // chain reaction
    for (const [k2, q] of glass) if (Math.hypot(OX + q.x + 0.5 - at.x, Z0 + q.z + 0.5 - at.z) < RR + 0.6) breakGlass(k2);
  }

  // ================================================================== ENEMIES (the Lampas)
  const LAMPAS_LOOKS = [
    { front: '#e8641as', shirt: 0xe8641a, pants: 0x2a2a3a }, { front: '#2a1a12', shirt: 0x2a1a12, pants: 0x1a1a22 },
    { front: '#f2efe6', shirt: 0xf2efe6, pants: 0xe8641a }, { front: '#ff7a1a', shirt: 0xff7a1a, pants: 0xf2efe6 },
  ];
  const SPAWNS = [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [13, 19, 'bat', Math.PI, 'restaurant'], [22, 18, 'makarov', 0, 'restaurant'], [16, 15.6, 'makarov', 0, 'restaurant'], [23, 22, 'bat', -Math.PI / 2, 'restaurant'],
    [5, 15, 'makarov', Math.PI / 2, 'lounge'], [3, 21.5, 'bat', 0, 'lounge'], [7, 22, null, -Math.PI / 2, 'lounge'],
    [6, 5.5, 'makarov', Math.PI / 2, 'gambling'], [10.5, 6, 'bat', -Math.PI / 2, 'gambling'], [13.5, 3.5, 'makarov', -Math.PI / 2, 'gambling'], [5.5, 9, 'bat', Math.PI, 'gambling'],
    [19.5, 2, 'shotgun', 0, 'office', true], [22.5, 5.5, 'makarov', -Math.PI / 2, 'office'],
    [20, 10, 'bat', Math.PI / 2, 'landing'], [17, 12.5, 'makarov', Math.PI / 2, 'landing'],
    [28.5, 5.5, 'bat', Math.PI, 'gym'], [31, 6.5, null, -Math.PI / 2, 'gym'],
    [31.5, 12.5, 'bat', -Math.PI / 2, 'corridor'],
    [37.5, 4.5, 'makarov', 0, 'warehouse'], [40.5, 9.5, 'shotgun', Math.PI, 'warehouse'], [43.5, 3.5, 'bat', -Math.PI / 2, 'warehouse'],
    [27.5, 21.5, 'bat', Math.PI / 2, 'mixing'], [31, 16.5, 'makarov', 0, 'mixing'],
    [39.5, 22.5, 'makarov', Math.PI, 'garage'], [43.5, 20, 'bat', -Math.PI / 2, 'garage'],
  ];
  const enemies = [];
  const laserM = new THREE.MeshBasicMaterial({ color: 0xff1030, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  SPAWNS.forEach(([x, z, w, rot, room, boss], i) => {
    const look = LAMPAS_LOOKS[i % LAMPAS_LOOKS.length];
    const skin = boss ? 0xf0c8a8 : [0xf0c8a8, 0xe0a882, 0xf4d2bc, 0xd8a080][i % 4];
    const head = boss
      ? { skin, hair: '#d8c080', brow: '#a89060', hairLine: 80, sideLine: 116, backLine: 150, mouth: 'smile', glasses: true, iris: '#3a5a7a' }
      : { skin, hair: ['#2a2a2a', '#d8c080', '#7a5a30', '#1a1a1a'][i % 4], brow: '#3a2a1a', hairLine: i % 3 === 0 ? 40 : 96, sideLine: 120, backLine: 150, mouth: 'smile', iris: '#3a3a3a' };
    const shirt = boss ? 0xf2efe6 : look.shirt;
    const p = makePerson({ head, ballcap: i % 5 === 2 ? 0xff7a1a : undefined, front: boss ? '#f2efe6' : look.front, shirt, pants: boss ? 0xf2efe6 : look.pants, shoes: 0x111111, belly: boss ? 1.2 : (i % 3) * 0.4, skin, chain: boss || i % 4 === 1, scale: boss ? 1.08 : 1 });
    scene.remove(p); root.add(p);
    const hand = new THREE.Group(); hand.position.set(0, -0.68, 0.05); p.userData.arms[0].add(hand);
    const laser = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 1), laserM.clone()); laser.visible = false; root.add(laser);
    p.userData.foe = { id: i, spawn: [x, z, rot, w], room, boss: !!boss, hand, laser, skin, shirt, pers: ['rush', 'careful', 'normal'][i % 3], mass: boss ? 2.6 : 1 + (i % 3) * 0.15 };
    p.userData.bubble = bubble(); p.add(p.userData.bubble); p.userData.bubble.position.set(0, 2.5, 0);
    p.position.set(OX + x, 0, Z0 + z); p.rotation.y = rot;
    enemies.push(p);
  });
  function setFoeWeapon(e, id) { const f = e.userData.foe; f.weapon = id; f.hand.clear(); if (id) f.hand.add(weaponMesh(id)); }
  const ALERT_LINES = ['Hé! Wie ben jij?!', 'Het is die Eddy!', 'PAK HEM!', 'Lampas forever!', 'Dit is ons gebied!', 'Eddy Junior?! Grijp hem!'];
  const alive = () => enemies.filter((e) => e.userData.foe.alive);

  // ================================================================== ITEMS (weapons on the floor, flying thrown weapons, loot crates)
  const items = [];
  function dropItem(id, at, vx = 0, vz = 0, ammo, flying = false, own = false) {
    if (!id || id === 'maboota' || id === 'fists') return;
    const g = weaponMesh(id); g.rotation.set(Math.PI / 2, 0, Math.random() * 6); g.position.set(at.x, 0.08, at.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); ring.rotation.x = -Math.PI / 2;
    root.add(g, ring); items.push({ id, g, ring, ammo: ammo ?? (WD[id].ammo || 0), vx, vz, flying, own, age: 0 });
  }
  const lootCrates = [];
  const crateM = lam({ map: canvasTex(64, 64, (g) => { g.fillStyle = '#8a6a3a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#5a3a1a'; g.lineWidth = 4; g.strokeRect(3, 3, 58, 58); g.beginPath(); g.moveTo(3, 3); g.lineTo(61, 61); g.stroke(); g.fillStyle = '#ff7a1a'; g.font = '900 12px Arial'; g.textAlign = 'center'; g.fillText('LAMPAS', 32, 36); }) });
  const LOOT = [[37.5, 7.5], [38.5, 3.5], [40.5, 5.5], [43.5, 7.5], [22.5, 2.5], [27.5, 23.5]];
  for (const [x, z] of LOOT) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), crateM); c.position.set(OX + x, 0.23, Z0 + z); c.castShadow = true; root.add(c);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.7 })); glow.rotation.x = -Math.PI / 2; glow.position.set(OX + x, 0.04, Z0 + z); root.add(glow);
    lootCrates.push({ c, glow, taken: false });
  }

  // ================================================================== BULLETS (cover stops them, glass shatters, barrels explode, corpses get pushed)
  const bullets = [];
  const tracerM = [new THREE.MeshBasicMaterial({ color: 0xfff0a0 }), new THREE.MeshBasicMaterial({ color: 0xff5a3a })];
  function fireGun(from, a, id, byPlayer, moving) {
    const W2 = WD[id], muz = new THREE.Vector3(from.x + Math.sin(a) * 0.6, 0, from.z + Math.cos(a) * 0.6);
    const spr = byPlayer ? W2.spr + (moving ? W2.mv : 0) + P.bloom : EASY.espr * (W2.pel > 1 ? 1.6 : 1);
    for (let i = 0; i < W2.pel; i++) {
      const aa = a + (Math.random() - 0.5) * spr * 2, sp = byPlayer ? 40 : EASY.ebSpd;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, byPlayer ? 0.7 : 0.45), tracerM[byPlayer ? 0 : 1]);
      m.position.set(from.x + Math.sin(a) * 0.3, 1.25, from.z + Math.cos(a) * 0.3); m.rotation.y = aa; root.add(m);
      bullets.push({ m, dx: Math.sin(aa), dz: Math.cos(aa), sp, byPlayer, id, life: 1.4, pierce: 1, hit: new Set() });
    }
    muzzle(muz); casing(from, a, id === 'shotgun');
    sfx(byPlayer ? W2.snd : 'epistol'); if (id === 'shotgun' && !byPlayer) sfx('shotgun');
    if (byPlayer) { P.bloom = Math.min(0.2, P.bloom + W2.bloom); shake(W2.kick * 1.2); FX.kick.set(-Math.sin(a) * W2.kick * 0.6, 0, -Math.cos(a) * W2.kick * 0.6); }
    alertNoise(from, W2.loud);
  }
  function bulletHitsCell(b, px, pz, nx, nz) {
    const ch = cellAt(nx, nz), key = Math.floor(nx - OX) + ',' + Math.floor(nz - Z0);
    if (ch === '%') { breakGlass(key); return false; }   // glass shatters, the bullet keeps going
    if (ch === 'X') { explode(key); return true; }
    if (!isCover(ch) || (cellAt(px, pz) === ch && ch !== '#')) return false;
    // impact point on the cell face
    const ocx = Math.floor(px - OX), ocz = Math.floor(pz - Z0), ncx = Math.floor(nx - OX), ncz = Math.floor(nz - Z0);
    let wx, wz, nrx = 0, nrz = 0;
    if (ncx !== ocx) { wx = OX + (ncx > ocx ? ncx : ocx); nrx = ncx > ocx ? -1 : 1; wz = pz + (wx - px) / (b.dx || 1e-6) * b.dz; } else { wz = Z0 + (ncz > ocz ? ncz : ocz); nrz = ncz > ocz ? -1 : 1; wx = px + (wz - pz) / (b.dz || 1e-6) * b.dx; }
    if (ch === '#') { sparks(wx + nrx * 0.05, 1.25, wz + nrz * 0.05); wallDecal(wx, 1.25 + rnd(-0.08, 0.08), wz, nrx, nrz, 0.14, holeM); if (Math.random() < 0.3) sfx('ric'); }
    else { sparks(wx + nrx * 0.05, 1.0, wz + nrz * 0.05, woodM, 6); if (Math.random() < 0.4) sfx('thud'); }
    return true;
  }
  function alertNoise(at, r) {
    if (!M.active || r < 1) return;
    for (const e of enemies) { const f = e.userData.foe; if (!f.alive || f.down > 0 || f.state === 'chase') continue;
      if (e.position.distanceTo(at) < r) { f.state = 'search'; f.sx = at.x; f.sz = at.z; f.searchT = 0; f.path = null; } }
  }

  // ================================================================== HUD + Neon Vice-style screens
  const css = document.createElement('style'); css.textContent = `
    #nvHud{position:fixed;left:22px;bottom:20px;z-index:5;display:none;color:#fff;text-shadow:2px 2px 0 #000;font-family:'Press Start 2P',ui-monospace,monospace}
    #nvHud .hp{font-size:22px;letter-spacing:4px;color:#ff2a3a;text-shadow:2px 2px 0 #000,0 0 10px #ff0030}
    #nvHud .hp i{font-style:normal;color:rgba(255,255,255,.2)}
    #nvHud .w{font-size:11px;margin-top:8px}#nvHud .w span{margin-right:12px}
    #nvScore{position:fixed;right:24px;top:70px;z-index:5;display:none;text-align:right;color:#ff5fb8;text-shadow:3px 3px 0 #2de2e6,5px 5px 0 #3a0b4f;font-size:20px;font-family:'Press Start 2P',ui-monospace,monospace}
    #nvScore .c{font-size:14px;color:#ffd36b;text-shadow:2px 2px 0 #000;margin-top:8px}#nvScore .l{font-size:10px;color:#2de2e6;text-shadow:2px 2px 0 #000;margin-top:8px}
    #nvGrain{position:fixed;inset:0;pointer-events:none;z-index:4;display:none;opacity:.22;mix-blend-mode:overlay;background-size:160px 160px;animation:nvg .25s steps(4) infinite}
    #nvScan{position:fixed;inset:0;pointer-events:none;z-index:4;display:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)}
    @keyframes nvg{0%{background-position:0 0}25%{background-position:-40px 30px}50%{background-position:30px -50px}75%{background-position:-60px -20px}100%{background-position:10px 40px}}
    #nvVig,#nvFlash{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0}
    #nvScreen{position:fixed;inset:0;z-index:20;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(8,0,16,.72);color:#fff}
    #nvScreen .big{font-family:'Press Start 2P',monospace;font-size:clamp(26px,6vw,56px)}
    #nvScreen .red{color:#ff2a3a;text-shadow:3px 3px 0 #3a0010,0 0 18px #ff0030}
    #nvScreen .logo2{font-family:'Press Start 2P',monospace;font-size:clamp(14px,3vw,26px);color:#2de2e6;text-shadow:2px 2px 0 #ff3fa4}
    #nvScreen .hint{font-family:'VT323',monospace;font-size:22px;color:#e9c7ff;margin-top:14px;max-width:720px}
    #nvScreen .stats{font-family:'VT323',monospace;font-size:24px;line-height:1.25;margin:14px 0;color:#f3e6ff;text-align:left;min-width:min(420px,90vw)}
    #nvScreen .stats b{color:#7dff9a;float:right;margin-left:30px;font-weight:normal}
    #nvScreen .grade{font-family:'Press Start 2P',monospace;font-size:clamp(40px,9vw,84px);color:#ffd36b;text-shadow:4px 4px 0 #ff2d95}
    #nvScreen .btn{font-family:'Press Start 2P',monospace;font-size:13px;background:#ff2d95;color:#fff;padding:13px 20px;margin-top:16px;box-shadow:4px 4px 0 #2de2e6}
    #nvBanner{position:fixed;left:0;right:0;top:22%;z-index:6;text-align:center;pointer-events:none;opacity:0;transition:opacity .35s}
    #nvBanner .b1{font-family:'Press Start 2P',monospace;font-size:clamp(18px,4.5vw,38px);color:#ff3fa4;text-shadow:3px 3px 0 #2de2e6}
    #nvBanner .b2{font-family:'VT323',monospace;font-size:24px;color:#fff;margin-top:10px;text-shadow:2px 2px 0 #000}
    #nvInv{position:fixed;inset:0;z-index:25;display:none;align-items:center;justify-content:center;background:rgba(8,0,16,.78)}
    #nvInv .box{width:min(760px,94vw);max-height:86vh;overflow:auto;background:#140722;border:3px solid #ff3fa4;box-shadow:6px 6px 0 #2de2e6;padding:18px 22px;color:#f3e6ff}
    #nvInv h2{margin:0 0 4px;font:16px 'Press Start 2P',monospace;color:#ff5fb8;text-shadow:2px 2px 0 #2de2e6}
    #nvInv .sub{font:20px 'VT323',monospace;color:#bfa6d8;margin-bottom:12px}
    #nvInv .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
    #nvInv .it{background:#22103a;border:2px solid #3d2260;padding:10px;display:flex;gap:10px;align-items:flex-start}
    #nvInv .it.eq{border-color:#3ff0ff}
    #nvInv .ic{width:46px;height:46px;flex:none;background:#0d0418;border:2px solid #5a3a80;display:flex;align-items:center;justify-content:center;font-size:26px}
    #nvInv .nm{font:11px 'Press Start 2P',monospace;color:#fff;line-height:1.4}
    #nvInv .ds{font:18px 'VT323',monospace;color:#cbb6e6;line-height:1.05;margin-top:4px}
    #nvInv .tag{font:9px 'Press Start 2P',monospace;color:#3ff0ff;margin-top:6px}
    #nvInv .foot{font:18px 'VT323',monospace;color:#9a86b6;margin-top:14px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}`;
  document.head.appendChild(css);
  if (!document.querySelector('link[data-nvfont]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.nvfont = 1; l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap'; document.head.appendChild(l); }
  const mk = (id) => { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); return d; };
  const hudEl = mk('nvHud'), scoreEl = mk('nvScore'), grainEl = mk('nvGrain'), scanEl = mk('nvScan'), vigEl = mk('nvVig'), flashEl = mk('nvFlash'), screenEl = mk('nvScreen'), bannerEl = mk('nvBanner'), invEl = mk('nvInv');
  { const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'), id = g.createImageData(160, 160); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); grainEl.style.backgroundImage = `url(${c.toDataURL()})`; }
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#0a0410;opacity:0;pointer-events:none;transition:opacity .45s;z-index:30'; document.body.appendChild(fade);
  let bannerT = 0;
  function banner(a, b, t = 3) { bannerEl.innerHTML = `<div class="b1">${a}</div><div class="b2">${b || ''}</div>`; bannerEl.style.opacity = 1; bannerT = t; }
  function weaponLabel() {
    const h = P.held; if (!h) return owned().length ? '[2] ' + WD[owned()[0]].name : '[2] —';
    return '[2] ' + WD[h.id].name + (isGun(h.id) ? ' ' + h.ammo : '');
  }
  function hud() {
    const wbox = $('weapon');
    if (wbox) wbox.style.visibility = M.active ? 'hidden' : 'visible';
    if (wbox && state.kit.includes('maboota')) wbox.innerHTML = `<span style="color:${state.armed ? '#ff3fa4' : '#888'}">[1] MABOOTA</span><br><span style="color:#888;font-size:.8em">[I] INVENTORY</span>`;
    const on = M.active; hudEl.style.display = scoreEl.style.display = grainEl.style.display = scanEl.style.display = on ? 'block' : 'none';
    if (!on) return;
    let hp = ''; for (let i = 0; i < P.maxhp; i++) hp += i < P.hp ? '♥' : '<i>♥</i>';
    hudEl.innerHTML = `<div class="hp">${hp}${P.armor ? ' <span style="color:#ffd23a;font-size:12px">VEST</span>' : ''}</div><div class="w"><span style="color:${P.slot === 1 ? '#ff3fa4' : '#777'}">[1] MABOOTA</span><span style="color:${P.slot === 2 ? '#3ff0ff' : '#777'}">${weaponLabel()}</span></div><div class="w" style="color:#ff7a1a">LAMPAS LEFT: ${alive().length}${state.loot ? ` <span style="color:#ffd23a;margin-left:10px">SPICE ×${state.loot}</span>` : ''}</div>`;
    scoreEl.innerHTML = `W ${R.score.toLocaleString('nl-NL')}${R.combo > 1 ? `<div class="c">${R.combo}× COMBO</div>` : ''}<div class="l">KAASLAND · SPEKBUURT</div>`;
  }
  function showScreen(html) { screenEl.innerHTML = html; screenEl.style.display = 'flex'; bannerEl.style.opacity = 0; bannerT = 0; const t = $('toast'); if (t) t.style.display = 'none'; }
  function hideScreen() { screenEl.style.display = 'none'; }

  // ================================================================== INVENTORY (I)
  const ICON = { maboota: '🏏', makarov: '🔫', shotgun: '💥', bat: '⚾', vest: '🦺', ammo: '📦', shells: '🧨', loot: '🌶️', money: '💶', shoarma: '🥙' };
  const INFO = { maboota: ['Maboota', 'A Russian police truncheon. Knocks people down; hit them again on the floor to finish them.', 'A gift from The Russian'] };
  let invOpen = false;
  function openInv() {
    const shop = ctx.shop || [], row = [];
    const add = (id, name, desc, src, count, eq) => row.push(`<div class="it${eq ? ' eq' : ''}"><div class="ic">${ICON[id] || '▪'}</div><div><div class="nm">${name}${count > 1 ? ' ×' + count : ''}</div><div class="ds">${desc}</div><div class="tag">${src}${eq ? ' · EQUIPPED' : ''}</div></div></div>`);
    if (state.kit.includes('maboota')) add('maboota', ...INFO.maboota, 1, P.slot === 1 && state.armed);
    const counts = {}; for (const k of state.kit) if (k !== 'maboota') counts[k] = (counts[k] || 0) + 1;
    for (const [k, n] of Object.entries(counts)) {
      const it = shop.find((s) => s.id === k) || { name: k, desc: '' };
      let desc = (it.desc || '').replace(' (Slot 2)', ''); if (k === 'makarov') desc += ` Rounds: ${state.ammo.makarov || 0}.`; if (k === 'shotgun') desc += ` Shells: ${state.ammo.shotgun || 0}.`;
      if (isGun(k) || k === 'bat') desc += ' Slot 2, missions only.';
      add(k, it.name, desc, 'Bought from The Russian', k === 'ammo' || k === 'shells' ? n : 1, M.active && P.slot === 2 && P.held && P.held.id === k);
    }
    if (M.active && P.held && !P.held.own) add(P.held.id, WD[P.held.id].name, `Taken off a Lampas.${isGun(P.held.id) ? ' Ammo: ' + P.held.ammo + '.' : ''} Stays here when you leave.`, 'Picked up', 1, P.slot === 2);
    if (state.loot) add('loot', 'Lampas spice crate', 'Stolen from the Lampas warehouse. Sell it on Kaasplaats (PC) for W 150 each.', 'Loot', state.loot);
    if (state.metSchmatzel) add('shoarma', 'Shoarma broodje', 'Schmatzel\'s, on the house. Your father\'s favourite.', 'From Schmatzel', 1);
    invEl.innerHTML = `<div class="box"><h2>INVENTORY</h2><div class="sub">Eddy de Kruidenmeester Jr. · Wilders W ${(state.money || 0).toLocaleString('nl-NL')}${state.loan && state.loan.out ? ` · Nabil owes you W ${(state.loan.amount * 2).toLocaleString('nl-NL')}` : ''}</div><div class="grid">${row.join('') || '<div class="ds">Nothing yet. Talk to people. Visit The Russian.</div>'}</div><div class="foot"><span>Slot 1: Maboota (always). Slot 2: guns and the bat, on missions only.</span><span>[I] / [Esc] close</span></div></div>`;
    invEl.style.display = 'flex'; invOpen = true;
  }
  function closeInv() { invEl.style.display = 'none'; invOpen = false; }

  // ================================================================== RUN STATE
  const M = { active: false };
  const R = { score: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, execs: 0, heads: 0, glass: 0, shots: 0, hits: 0, taken: 0, time: 0, cleared: false, results: false, ammoAtStart: {}, lootAtStart: 0, lastOneShown: false };
  const saved = {};
  const pristine = { glass: new Map(glass), barrels: new Map(barrels) };
  function resetFloor() {
    const done = !!state.spekbuurt;
    // glass and barrels come back
    for (const [k, q] of pristine.glass) { glass.set(k, q); G[q.z][q.x] = '%'; q.s.off = false; q.pane.visible = true; }
    for (const [k, b] of pristine.barrels) { if (!barrels.has(k)) root.add(b.g); barrels.set(k, b); G[b.z][b.x] = 'X'; b.s.off = false; }
    for (const e of enemies) {
      const f = e.userData.foe, [x, z, r, w] = f.spawn, u = e.userData;
      Object.assign(f, { alive: !done, down: 0, hp: f.boss ? 2 : 1, state: 'idle', react: 0, cd: 0, wind: 0, seeT: 99, path: null, pathT: 0, sx: 0, sz: 0, searchT: 0, turnT: Math.random() * 3, ta: r, vx: 0, vz: 0, vy: 0, y: 0, spin: 0, lkx: 0, lkz: 0, found: false, wary: false, aiming: false, strT: 0, strD: 1, atkT: 0, body: false, mvx: 0, mvz: 0, headless: false, fountain: 0, smear: 0 });
      setFoeWeapon(e, done ? null : w);
      e.position.set(OX + x, 0, Z0 + z); e.rotation.y = r; e.visible = !done; u.body.rotation.set(0, 0, 0); u.body.position.y = 0; u.head.visible = true; u.arms[1].visible = true; u.bubble.visible = false; f.laser.visible = false;
    }
    for (const it of items) root.remove(it.g, it.ring); items.length = 0;
    for (const b of bullets) root.remove(b.m); bullets.length = 0;
    for (const p of parts) root.remove(p.m); parts.length = 0;
    for (const g of gibs) root.remove(g.m); gibs.length = 0;
    for (const d of decals) root.remove(d); decals.length = 0; pools.length = 0;
    for (const d of doors) { d.th = 0; d.w = 0; d.g.rotation.y = d.base; }
    for (const p of pops) p.el.remove(); pops.length = 0;
    state.loot = R.lootAtStart; lootCrates.forEach((l, i) => { const t = (state.spekbuurtLootTaken || []).includes(i); l.taken = t; l.c.visible = l.glow.visible = !t; });
    Object.assign(state.ammo, R.ammoAtStart);
    Object.assign(R, { score: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, execs: 0, heads: 0, glass: 0, shots: 0, hits: 0, taken: 0, time: 0, cleared: done, results: false, lastOneShown: false });
    const o = owned(); setHeld(o.length ? ownWeapon(o[0]) : null);
    Object.assign(P, { hp: EASY.hp, maxhp: EASY.hp, armor: state.kit.includes('vest') ? 1 : 0, invT: 0, lastHurt: 0, dead: false, deadT: 0, fireT: 0, bloom: 0, exec: 0, vx: 0, vz: 0 });
    const u = player.userData; u.body.rotation.set(0, 0, 0); u.body.position.y = 0;
    player.position.set(OX + 19, 0, 2.2); player.rotation.y = Math.PI; P.last.copy(player.position);
    selectSlot(o.some(isGun) ? 2 : 1); hideScreen(); FX.shake = FX.freeze = FX.flash = FX.hurtT = 0; M.snap = true; hud();
  }
  function enter() {
    if (M.active) return;
    fade.style.opacity = '1'; closeInv();
    setTimeout(() => {
      M.active = true; root.visible = true; clearPlayerSplats();
      saved.bg = scene.background.clone(); saved.fog = [scene.fog.color.clone(), scene.fog.near, scene.fog.far]; saved.hemi = hemi.intensity; saved.sun = sun.intensity;
      scene.background.set(0x1a0e2a); scene.fog.color.set(0x1a0e2a); scene.fog.near = 30; scene.fog.far = 70; hemi.intensity = 0.55; sun.intensity = 0.9;
      lights.forEach(([l, k]) => { l.intensity = k; });
      setBounds({ x0: OX - 6, x1: OX + W + 6, z0: Z0, z1: 10 });
      R.lootAtStart = state.loot || 0; saveOwnAmmo(); R.ammoAtStart = { ...state.ammo };
      resetFloor();
      setArea('KAASLAND · SPEKBUURT');
      $('objective').innerHTML = state.spekbuurt ? 'Spekbuurt is <b>yours</b>. Shop setup comes in a later build. Drive home in the <b>Oofmobiel</b>.' : 'Take <b>Snackpaleis Spekbuurt</b> from the Lampas. Clear the restaurant, then the back of house. <span style="color:#ffd36b">Leave nobody standing.</span>';
      fade.style.opacity = '0';
      if (!state.spekbuurt) banner('SNACKPALEIS SPEKBUURT', 'Lampas territory. Mouse aim · click / F attack · E grab / throw · 1 / 2 weapons · I inventory · R restart', 4.5);
    }, 480);
  }
  function exit() {
    fade.style.opacity = '1'; closeInv();
    setTimeout(() => {
      saveOwnAmmo(); M.active = false; root.visible = false; clearPlayerSplats();
      scene.background.copy(saved.bg); scene.fog.color.copy(saved.fog[0]); scene.fog.near = saved.fog[1]; scene.fog.far = saved.fog[2]; hemi.intensity = saved.hemi; sun.intensity = saved.sun;
      lights.forEach(([l]) => { l.intensity = 0; }); flashL.intensity = 0;
      setBounds(null);
      R.lootAtStart = state.loot || 0;
      if (P.held && !P.held.own) setHeld(null); // picked-up Lampas guns stay in Spekbuurt
      holster(); maboota.visible = true; equip(true);
      const u = player.userData; u.body.rotation.set(0, 0, 0); u.body.position.y = 0;
      player.position.set(5.3, 0, -5.8); player.rotation.y = Math.PI;
      setArea('KAASLAND · DE NATTE WORST'); hideScreen(); for (const p of pops) p.el.remove(); pops.length = 0;
      vigEl.style.opacity = flashEl.style.opacity = 0; bannerEl.style.opacity = 0; hud();
      updateObjective();
      fade.style.opacity = '0';
    }, 480);
  }
  addInteract({ obj: van, pos: () => van.position, r: 4.2, enabled: () => M.active && !P.dead && !R.results, label: () => state.spekbuurt ? 'Oofmobiel · drive home' : 'Oofmobiel · retreat to De Natte Worst', act: exit });

  // ================================================================== KILLS, KNOCKDOWNS, SCORE
  function addKillScore(e, type) {
    R.combo++; R.comboT = 3.5; R.maxCombo = Math.max(R.maxCombo, R.combo);
    const pts = (KILLPTS[type] || 300) * Math.min(R.combo, 8);
    R.score += pts; popup(e.position, '+W ' + pts.toLocaleString('nl-NL') + (R.combo > 1 ? '  ×' + R.combo : ''), R.combo > 2 ? '#ff5fb8' : '#7dff9a');
  }
  function poseDown(e, k) { const u = e.userData; u.body.rotation.x = -1.5 * k; u.body.position.y = 0.12 * k; }
  function launch(e, type, dir) { // Neon Vice launchBody: shotguns and blasts lift bodies off the floor and spin them
    const f = e.userData.foe, kb = (FORCE[type] || 4) * rnd(0.85, 1.15) / f.mass;
    f.vx = dir[0] * kb; f.vz = dir[1] * kb; f.vy = (type === 'shotgun' || type === 'boom') ? kb * 0.32 : kb * 0.12; f.y = 0.001; f.spin = rnd(-1, 1) * kb * 0.35; f.body = true;
  }
  function killEnemy(e, type, dir) {
    const f = e.userData.foe; if (!f.alive) return;
    f.alive = false; f.down = 0; f.wind = 0; f.laser.visible = false; e.userData.bubble.visible = false;
    if (f.weapon) { dropItem(f.weapon, e.position, dir[0] * 3, dir[1] * 3); setFoeWeapon(e, null); }
    launch(e, type, dir);
    e.rotation.y = Math.atan2(-dir[0], -dir[1]); poseDown(e, 1);
    bloodBurst(e.position, dir, type === 'shotgun' || type === 'exec' || type === 'boom' ? 40 : 22, type === 'shotgun' ? 6 : 4);
    floorDecal(e.position.x + dir[0] * 0.3, e.position.z + dir[1] * 0.3, 1.1 + Math.random() * 0.4, Math.random() * 6);
    addPool(e, type === 'shotgun' || type === 'exec' || type === 'boom');
    // gore (Neon Vice dismember): shotguns up close take heads and arms, bats sometimes
    const pd = e.position.distanceTo(player.position);
    if (type === 'shotgun' && pd < 3.2) { if (Math.random() < 0.55) headPop(e, dir); else limbOff(e, dir); }
    else if ((type === 'bat' && Math.random() < 0.2) || (type === 'makarov' && Math.random() < 0.08)) limbOff(e, dir);
    sfx('splat'); FX.freeze = type === 'exec' ? 0.14 : 0.045; shake(type === 'shotgun' ? 0.4 : 0.25);
    R.kills++; if (type === 'exec') R.execs++; addKillScore(e, type);
    if (f.boss) { banner('THE MANAGER IS DOWN', 'Jan van Kaas won\'t like this.', 2.5); shake(0.6); FX.freeze = 0.3; }
    const left = alive().length;
    if (left === 1 && !R.lastOneShown) { R.lastOneShown = true; popup(alive()[0].position, 'LAST ONE', '#ff3fa4', true); }
    if (left === 0 && !R.cleared) { R.cleared = true; popup(e.position, 'FLOOR CLEAR', '#ff3fa4', true); shake(0.5); setTimeout(results, 1500); }
    hud();
  }
  function knockdown(e, dir) {
    const f = e.userData.foe; if (!f.alive) return;
    if (f.boss) { stagger(e, dir); hitEnemy(e, 'door', dir, 1); return; }
    f.down = 3.0; f.vx = dir[0] * 4; f.vz = dir[1] * 4; f.wind = 0; f.laser.visible = false;
    if (f.weapon) { dropItem(f.weapon, e.position, dir[0] * 3, dir[1] * 3); setFoeWeapon(e, null); }
    e.rotation.y = Math.atan2(-dir[0], -dir[1]); f.state = 'chase'; sfx('hit'); bloodBurst(e.position, dir, 6, 2);
    say(e.userData.bubble, ['AU!', 'Mijn hoofd!', 'Ooompf!', 'Vuile...'][Math.floor(Math.random() * 4)], '#ff7a1a');
  }
  function stagger(e, dir) { const f = e.userData.foe; f.vx += dir[0] * 3; f.vz += dir[1] * 3; f.cd = Math.max(f.cd, 0.5); f.wind = 0; sfx('hit'); if (f.state !== 'chase') { f.state = 'chase'; f.react = 0.4; } }
  function hitEnemy(e, type, dir, dmg) {
    const f = e.userData.foe; if (!f.alive) return;
    if (f.hp > dmg) { f.hp -= dmg; bloodBurst(e.position, dir, 12, 3); floorDecal(e.position.x + dir[0] * 0.4, e.position.z + dir[1] * 0.4, 0.5, Math.random() * 6); popup(e.position, 'IS DAT ALLES?!', '#ffd36b'); f.state = 'chase'; f.react = Math.min(f.react, 0.2); return; }
    killEnemy(e, type, dir);
  }
  function execute(e) {
    const dir = [e.position.x - player.position.x, e.position.z - player.position.z], l = Math.hypot(dir[0], dir[1]) || 1; dir[0] /= l; dir[1] /= l;
    P.exec = 0.35; player.rotation.y = Math.atan2(dir[0], dir[1]);
    const gun = gunOut() && P.held.ammo > 0;
    if (gun) { P.held.ammo--; sfx(WD[P.held.id].snd); muzzle(e.position); alertNoise(player.position, WD[P.held.id].loud); } else { sfx('hit'); setTimeout(() => sfx('hit'), 120); }
    popup(e.position, 'EXECUTION', '#ff3a4a'); bloodBurst(e.position, dir, 30, 3); shake(0.45);
    killEnemy(e, 'exec', dir); if (gun && P.held.id === 'shotgun') headPop(e, dir);
  }

  // ================================================================== THE PLAYER GETS HURT (3 lives, Neon Vice Easy)
  function hurtPlayer(dir, cause) {
    if (P.dead || P.invT > 0 || R.results) return;
    R.taken++;
    if (P.armor > 0 && cause !== 'boom') { P.armor--; P.invT = 0.9; P.lastHurt = R.time; shake(0.45); FX.flash = 0.35; FX.flashC = '255,255,255'; sfx('vest'); popup(player.position, 'VEST HIT!', '#ffd36b'); bloodBurst(player.position, dir, 8, 2); hud(); return; }
    if (P.hp > 1 && cause !== 'boom') {
      P.hp--; P.invT = 1.1; P.lastHurt = R.time; shake(0.45); FX.flash = 0.45; FX.flashC = '230,0,13'; FX.hurtT = 0.7; sfx('hurt');
      popup(player.position, P.hp === 1 ? 'LAST HIT!' : 'HIT!', '#ff4a5a', true); bloodBurst(player.position, dir, 14, 3); floorDecal(player.position.x, player.position.z, 0.6, Math.random() * 6);
      P.vx += dir[0] * 5; P.vz += dir[1] * 5; hud(); return;
    }
    P.hp = 0; P.dead = true; P.deadT = 0; P.cause = cause; R.combo = 0; R.comboT = 0;
    player.rotation.y = Math.atan2(-dir[0], -dir[1]); P.vx = dir[0] * (FORCE[cause] || 4); P.vz = dir[1] * (FORCE[cause] || 4);
    bloodBurst(player.position, dir, 60, 5); floorDecal(player.position.x + dir[0] * 0.3, player.position.z + dir[1] * 0.3, 1.4, Math.random() * 6);
    sfx('splat'); sfx('die'); FX.flash = 0.5; FX.flashC = '204,0,13'; shake(0.6); hud();
    const by = { bat: 'Beaten with a honkbalknuppel.', makarov: 'Shot with a Makarov.', shotgun: 'Blown away by a sawn-off.', fists: 'Punched out by a Lampas.', boom: 'Too close to a red barrel.' }[cause] || 'Killed by the Lampas.';
    setTimeout(() => { if (P.dead && M.active) showScreen(`<div class="big red">JE BENT DOOD</div><div class="hint" style="color:#ffb3bd">${by}</div><div class="hint">${TIPS[Math.floor(Math.random() * TIPS.length)]}</div><div class="btn">RETRY · R</div>`); }, 900);
  }

  // ================================================================== RESULTS (Neon Vice grade: score vs. 700 per enemy)
  function results() {
    if (!M.active) return;
    R.results = true; state.spekbuurt = true; state.raids = (state.raids || 0) + 1;
    state.spekbuurtLootTaken = lootCrates.map((l, i) => (l.taken ? i : -1)).filter((i) => i >= 0);
    const ratio = R.score / (enemies.length * 700), gr = ratio > 3 ? 'S' : ratio > 2.2 ? 'A+' : ratio > 1.6 ? 'A' : ratio > 1.1 ? 'B' : ratio > 0.7 ? 'C' : 'D';
    const pay = Math.round(R.score / 100) * 10; R.pay = pay; R.grade = gr;
    const t = Math.floor(R.time), acc = R.shots ? Math.round(R.hits / R.shots * 100) + '%' : '—';
    showScreen(`<div class="logo2">SPEKBUURT UNLOCKED</div><div class="stats">KILLS<b>${R.kills}</b><br>EXECUTIONS<b>${R.execs}</b><br>HEADSHOTS<b>${R.heads}</b><br>BEST COMBO<b>${R.maxCombo}×</b><br>ACCURACY<b>${acc}</b><br>WINDOWS BROKEN<b>${R.glass}</b><br>HITS TAKEN<b>${R.taken}</b><br>TIME<b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b><br>SCORE<b>W ${R.score.toLocaleString('nl-NL')}</b><br>WILDERS EARNED<b style="color:#ffd36b">+W ${pay.toLocaleString('nl-NL')}</b></div><div class="grade">${gr}</div><div class="hint">The Lampas are out of Spekbuurt. Grab the spice crates (E), then drive home. You'll set up shop here later.</div><div class="btn">CONTINUE · E</div>`);
    sfx('cash'); addMoney(pay);
    $('objective').innerHTML = '<b style="color:#6ed36e">Spekbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.';
  }

  // ================================================================== PLAYER ACTIONS
  const mouseN = new THREE.Vector2(), rc = new THREE.Raycaster(), aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1), aim = new THREE.Vector3();
  let mouseSeen = false;
  addEventListener('mousemove', (e) => { mouseN.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); mouseSeen = true; });
  const moving = () => Math.hypot(player.position.x - P.last.x, player.position.z - P.last.z) > 0.01;
  function nearestDowned() { let best = null, bd = 1.15; for (const e of enemies) { const f = e.userData.foe; if (f.alive && f.down > 0) { const d = e.position.distanceTo(player.position); if (d < bd) { bd = d; best = e; } } } return best; }
  function attack() {
    if (!M.active || P.dead || P.exec > 0 || state.inDialogue || state.inPC || invOpen) return;
    const t = nearestDowned(); if (t && !(gunOut() && P.held.ammo <= 0)) { execute(t); return; }
    if (gunOut()) {
      if (P.fireT > 0) return;
      if (P.held.ammo <= 0) { throwHeld(); return; }
      const W2 = WD[P.held.id]; P.held.ammo--; P.fireT = W2.cd; R.shots++;
      fireGun(player.position, player.rotation.y, P.held.id, true, moving());
      player.userData.arms[0].rotation.x = -1.2; saveOwnAmmo(); hud(); return;
    }
    if (state.armed) { ctx.swing(); sfx('swing'); alertNoise(player.position, 3); }
  }
  function throwHeld() {
    const h = P.held; if (!h) return false;
    const a = player.rotation.y, at = player.position.clone().add(new THREE.Vector3(Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4));
    saveOwnAmmo(); dropItem(h.id, at, Math.sin(a) * 15, Math.cos(a) * 15, h.ammo, true, h.own); items[items.length - 1].g.position.y = 1.0;
    setHeld(null); selectSlot(1); sfx('throw'); P.fireT = 0.25; return true;
  }
  function grab() {
    if (P.dead || !M.active) return false;
    if (R.results) { hideScreen(); R.results = false; banner('SPEKBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.', 3); return true; }
    for (const [i, l] of lootCrates.entries()) if (!l.taken && Math.hypot(l.c.position.x - player.position.x, l.c.position.z - player.position.z) < 1.2) {
      l.taken = true; l.c.visible = l.glow.visible = false; state.loot = (state.loot || 0) + 1;
      if (state.spekbuurt) { state.spekbuurtLootTaken = state.spekbuurtLootTaken || []; state.spekbuurtLootTaken.push(i); }
      popup(player.position, '+1 CRATE OF LAMPAS SPICE', '#ffd23a'); toast('+1 CRATE OF LAMPAS SPICE', 'Sell it on Kaasplaats (PC) for W 150. Check it with I.', 1.8); sfx('pick'); hud(); return true;
    }
    let best = null, bd = 1.3;
    for (const it of items) { if (it.flying) continue; const k = Math.hypot(it.g.position.x - player.position.x, it.g.position.z - player.position.z); if (k < bd) { bd = k; best = it; } }
    if (!best) return P.slot === 2 && P.held ? throwHeld() : false; // nothing to grab: throw what you hold (Neon Vice)
    pickUp(best); return true;
  }
  function pickUp(it) {
    root.remove(it.g, it.ring); items.splice(items.indexOf(it), 1);
    if (P.held) { saveOwnAmmo(); dropItem(P.held.id, player.position, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, P.held.ammo, false, P.held.own); }
    setHeld({ id: it.id, ammo: it.ammo, own: it.own }); selectSlot(2); sfx('pick'); popup(player.position, WD[it.id].name, '#ffd36b');
  }

  // ================================================================== INPUT (capture phase: runs before main.js)
  addEventListener('keydown', (e) => {
    if (state.inDialogue || state.inPC || state.step === 'title') return;
    const stop = () => { e.stopImmediatePropagation(); e.preventDefault(); };
    if (e.code === 'KeyI') { stop(); invOpen ? closeInv() : openInv(); return; }
    if (invOpen) { if (e.code === 'Escape') { stop(); closeInv(); } else if (!['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(e.code)) stop(); return; }
    if (!M.active) { // street: slot 2 stays in the van
      if ((e.code === 'Digit2' || e.code === 'Numpad2') && state.kit.includes('maboota')) { stop(); selectSlot(2); }
      return;
    }
    if (e.code === 'KeyR' || e.code === 'Backspace') { stop(); if (!state.spekbuurt) resetFloor(); return; }
    if (P.dead) { stop(); return; }
    if (e.code === 'Digit1' || e.code === 'Numpad1') { stop(); selectSlot(1); }
    else if (e.code === 'Digit2' || e.code === 'Numpad2') { stop(); selectSlot(2); }
    else if (e.code === 'KeyF') { stop(); attack(); }
    else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') { if (grab()) stop(); }
  }, true);
  addEventListener('pointerdown', (e) => {
    if (invOpen) { if (e.target === invEl) closeInv(); e.stopImmediatePropagation(); return; }
    if (!M.active || state.inDialogue || state.inPC || e.target !== ctx.canvas) return;
    e.stopImmediatePropagation();
    if (R.results) { grab(); return; }
    if (e.button === 2) { grab(); return; } attack();
  }, true);
  ctx.canvas.addEventListener('contextmenu', (e) => { if (M.active) e.preventDefault(); });

  // ================================================================== UPDATE
  function aimAtMouse() {
    if (!mouseSeen) return;
    rc.setFromCamera(mouseN, camera);
    if (rc.ray.intersectPlane(aimPlane, aim)) player.rotation.y = Math.atan2(aim.x - player.position.x, aim.z - player.position.z);
  }
  function holdPose(dt) { if (P.slot === 2 && P.held && isGun(P.held.id)) { const a = player.userData.arms[0]; a.rotation.x += (-1.45 - a.rotation.x) * Math.min(1, dt * 12); a.rotation.z = 0; if (WD[P.held.id].pel > 1) player.userData.arms[1].rotation.x = -1.2; } }
  function street() { /* guns are mission-only; nothing to do on the street */ }
  function updateParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life -= dt;
      if (p.m.position.y > 0.03) { p.vy -= 14 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.m.rotation.x += dt * 8; p.m.rotation.y += dt * 6;
        if (p.m.position.y <= 0.03) { p.m.position.y = 0.03; p.vx *= 0.3; p.vz *= 0.3;
          if (p.kind === 'blood') { floorDecal(p.m.position.x, p.m.position.z, 0.12 + Math.random() * 0.18, Math.random() * 6); p.life = 0; }
          else if (p.kind === 'shard') p.life = Math.min(p.life, 8); } }
      if (p.kind === 'fire') p.m.scale.multiplyScalar(Math.exp(-dt * 2));
      if (p.life <= 0) { root.remove(p.m); parts.splice(i, 1); }
    }
    for (const g of gibs) { if (g.m.position.y > 0.05 || g.vy > 0) { g.vy -= 14 * dt; g.m.position.x += g.vx * dt; g.m.position.y += g.vy * dt; g.m.position.z += g.vz * dt; g.m.rotation.x += g.wx * dt; g.m.rotation.y += g.wy * dt;
        if (isBlock(cellAt(g.m.position.x, g.m.position.z)) && cellAt(g.m.position.x, g.m.position.z) !== 'T') { g.m.position.x -= g.vx * dt * 1.5; g.m.position.z -= g.vz * dt * 1.5; g.vx *= -0.3; g.vz *= -0.3; }
        if (g.m.position.y <= 0.05) { g.m.position.y = 0.05; if (g.vy < -2) { g.vy *= -0.3; floorDecal(g.m.position.x, g.m.position.z, 0.25, Math.random() * 6); } else g.vy = 0; g.vx *= 0.6; g.vz *= 0.6; g.wx *= 0.5; g.wy *= 0.5; } } }
    for (const pl of pools) if (pl.s < pl.max) { pl.s = Math.min(pl.max, pl.s + dt * 0.28); pl.m.scale.set(pl.s, pl.s, 1); pl.m.position.x = pl.e.position.x; pl.m.position.z = pl.e.position.z; }
  }
  function hitstop(dt) { if (FX.freeze > 0) { FX.freeze -= dt; return 0; } return dt; }
  function update(dt) {
    R.time += dt; if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) bannerEl.style.opacity = 0; }
    if (!P.dead) { if (P.exec > 0) P.exec -= dt; else aimAtMouse(); holdPose(dt); }
    else { P.deadT += dt; const u = player.userData; u.body.rotation.x = Math.max(-1.5, -P.deadT * 6); u.body.position.y = 0.1; slide(player, P, dt, 0.38); }
    if (!P.dead && (P.vx || P.vz)) { player.position.x += P.vx * dt; player.position.z += P.vz * dt; ctx.collide(player.position, 0.38); P.vx *= Math.exp(-dt * 8); P.vz *= Math.exp(-dt * 8); if (Math.hypot(P.vx, P.vz) < 0.05) P.vx = P.vz = 0; }
    const pv = [(player.position.x - P.last.x) / Math.max(dt, 1e-4), (player.position.z - P.last.z) / Math.max(dt, 1e-4)];
    if (!P.dead) collideDoors(player.position, 0.42, pv[0], pv[1], true);
    P.fireT -= dt; P.invT -= dt; P.bloom = Math.max(0, P.bloom - dt * 0.45); if (FX.hurtT > 0) FX.hurtT -= dt;
    if (!P.dead && P.hp < P.maxhp && R.time - P.lastHurt > EASY.regen) { P.hp++; P.lastHurt = R.time; popup(player.position, '+1 HEALTH', '#7dff9a'); sfx('pick'); hud(); }
    if (!P.dead && !P.held) for (const it of items) if (!it.flying && it.age > 1 && Math.hypot(it.g.position.x - player.position.x, it.g.position.z - player.position.z) < 0.45) { pickUp(it); break; }
    if (R.comboT > 0) { R.comboT -= dt; if (R.comboT <= 0) { R.combo = 0; hud(); } }
    updateDoors(dt);
    for (const e of enemies) updateEnemy(e, dt, pv);
    separate(); bodyPhysics();
    updateBullets(dt); updateItems(dt); updateParts(dt);
    if (flashT > 0) { flashT -= dt; if (flashT <= 0) { flashL.intensity = 0; flashSp.visible = false; } }
    FX.shake *= Math.exp(-dt * 8); FX.flash = Math.max(0, FX.flash - dt * 1.5); FX.kick.multiplyScalar(Math.exp(-dt * 12));
    flashEl.style.background = `rgba(${FX.flashC},1)`; flashEl.style.opacity = FX.flash * 0.6;
    const vig = FX.hurtT > 0 ? FX.hurtT / 0.7 * 0.55 : (!P.dead && P.hp === 1 ? 0.18 + Math.sin(R.time * 6) * 0.08 : 0);
    vigEl.style.background = `radial-gradient(ellipse at center, rgba(255,0,30,0) 45%, rgba(255,0,30,${vig.toFixed(3)}) 100%)`; vigEl.style.opacity = 1;
    for (const l of lootCrates) if (!l.taken) l.glow.material.opacity = 0.4 + Math.sin(performance.now() * 0.006) * 0.3;
    doner.rotation.y += dt * 0.8; spice.rotation.y += dt;
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i]; p.t += dt; p.p.y += dt * 0.8;
      const v = p.p.clone().project(camera); p.el.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; p.el.style.top = ((1 - v.y) / 2 * innerHeight) + 'px'; p.el.style.opacity = Math.min(1, 2.2 - p.t * 1.6);
      if (p.t > 1.4) { p.el.remove(); pops.splice(i, 1); }
    }
    P.last.copy(player.position);
  }
  // bodies: launched up, spin, slide, splat on walls and cover, smash through glass, bowl over standing Lampas (Neon Vice slideBody)
  function slide(obj, s, dt, r) {
    if ((s.y || 0) > 0 || (s.vy || 0) > 0) { s.vy -= 14 * dt; s.y = (s.y || 0) + s.vy * dt; if (s.y <= 0) { s.y = 0; if (s.vy < -1.5) { sfx('thud'); floorDecal(obj.position.x, obj.position.z, rnd(0.5, 0.8), Math.random() * 6); } s.vy = 0; } obj.position.y = s.y; }
    const sp = Math.hypot(s.vx, s.vz); if (sp < 0.05) return;
    const fr = (s.y || 0) > 0.02 ? 0.4 : 3.0; s.vx *= Math.exp(-dt * fr); s.vz *= Math.exp(-dt * fr);
    const nx0 = obj.position.x + s.vx * dt, nz0 = obj.position.z + s.vz * dt;
    if (sp > 4) { const k = Math.floor(nx0 - OX) + ',' + Math.floor(nz0 - Z0); if (glass.has(k)) { breakGlass(k); s.vx *= 0.6; s.vz *= 0.6; popup(obj.position, 'THROUGH THE WINDOW!', '#3ff0ff'); } }
    obj.position.x = nx0; obj.position.z = nz0; ctx.collide(obj.position, r);
    const cx = obj.position.x - nx0, cz = obj.position.z - nz0, cl = Math.hypot(cx, cz);
    if (cl > 1e-5) { const nx = cx / cl, nz = cz / cl, vn = s.vx * nx + s.vz * nz;
      if (vn < 0) { if (-vn > 2.2) { wallDecal(obj.position.x - nx * (r + 0.02), rnd(0.3, 0.9), obj.position.z - nz * (r + 0.02), nx, nz, rnd(0.6, 1.0)); sfx('thud'); bloodBurst(obj.position, [-nx, -nz], 10, 2, 0.5); s.spin = (s.spin || 0) + rnd(-3, 3); shake(0.08); }
        s.vx -= 1.5 * vn * nx; s.vz -= 1.5 * vn * nz; s.vx *= 0.55; s.vz *= 0.55; } }
    if (s.spin) { obj.rotation.y += s.spin * dt; s.spin *= Math.exp(-dt * 3); }
    if ((s.y || 0) <= 0.02 && sp > 0.8) { s.smear = (s.smear || 0) + sp * dt; if (s.smear > 0.16) { s.smear = 0; floorDecal(obj.position.x, obj.position.z, 0.55, Math.atan2(s.vz, s.vx), smearM); } }
    if (sp > 5 && obj !== player) for (const o of enemies) { const f = o.userData.foe; if (o === obj || !f.alive || f.down > 0 || f.boss) continue; if (o.position.distanceTo(obj.position) < 0.8) { knockdown(o, [s.vx / sp, s.vz / sp]); popup(o.position, 'BOWLED!', '#ffd36b'); s.vx *= 0.5; s.vz *= 0.5; } }
  }
  function bodyPhysics() { // corpses push each other and get shoved by the player walking into them
    const bs = enemies.filter((e) => e.visible && !e.userData.foe.alive);
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
      const a = bs[i], b = bs[j], fa = a.userData.foe, fb = b.userData.foe, dx = b.position.x - a.position.x, dz = b.position.z - a.position.z, d = Math.hypot(dx, dz), m = 0.62;
      if (d < m && d > 1e-4) { const nx = dx / d, nz = dz / d, p = (m - d) / 2; a.position.x -= nx * p; a.position.z -= nz * p; b.position.x += nx * p; b.position.z += nz * p;
        const rv = (fb.vx - fa.vx) * nx + (fb.vz - fa.vz) * nz; if (rv < 0) { const imp = -1.6 * rv / (1 / fa.mass + 1 / fb.mass); fa.vx -= imp / fa.mass * nx; fa.vz -= imp / fa.mass * nz; fb.vx += imp / fb.mass * nx; fb.vz += imp / fb.mass * nz; } } }
    if (!P.dead) for (const b of bs) { const f = b.userData.foe, dx = b.position.x - player.position.x, dz = b.position.z - player.position.z, d = Math.hypot(dx, dz); if (d < 0.65 && d > 1e-4) { const pv = Math.hypot(player.position.x - P.last.x, player.position.z - P.last.z) * 60; if (pv > 0.5) { f.vx += dx / d * pv * 0.4 / f.mass; f.vz += dz / d * pv * 0.4 / f.mass; } } }
  }
  function separate() {
    const cs = [player, ...enemies.filter((e) => e.userData.foe.alive && !(e.userData.foe.down > 0))];
    for (let i = 0; i < cs.length; i++) for (let j = i + 1; j < cs.length; j++) {
      const a = cs[i].position, b = cs[j].position, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), m = 0.7;
      if (d > 0 && d < m) { const k = (m - d) / 2 / d; if (cs[i] !== player || !P.dead) { a.x -= dx * k; a.z -= dz * k; } b.x += dx * k; b.z += dz * k; }
    }
  }
  function updateBullets(dt) {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]; let gone = (b.life -= dt) <= 0;
      const dist = b.sp * dt, steps = Math.ceil(dist / 0.2), st = dist / steps;
      for (let s = 0; s < steps && !gone; s++) {
        const px = b.m.position.x, pz = b.m.position.z, nx = px + b.dx * st, nz = pz + b.dz * st;
        if (bulletHitsCell(b, px, pz, nx, nz) || doorBlocks(px, pz, nx, nz)) { gone = true; break; }
        b.m.position.x = nx; b.m.position.z = nz;
        const dir = [b.dx, b.dz];
        if (b.byPlayer) {
          for (const e of enemies) { const f = e.userData.foe; if (!e.visible || b.hit.has(e)) continue;
            if (f.alive) { const r = f.down > 0 ? 0.5 : 0.42; if (Math.hypot(e.position.x - nx, e.position.z - nz) < r) { R.hits++; b.hit.add(e); f.down > 0 ? killEnemy(e, b.id, dir) : hitEnemy(e, b.id, dir, 1); if (--b.pierce <= 0) { gone = true; break; } } }
            else if (Math.hypot(e.position.x - nx, e.position.z - nz) < 0.45) { b.hit.add(e); const kk = (FORCE[b.id] || 4) * 0.45 / f.mass; f.vx += b.dx * kk; f.vz += b.dz * kk; f.spin = (f.spin || 0) + rnd(-2, 2); bloodBurst(e.position, dir, 8, 2.5, 0.3); floorDecal(nx + b.dx * 0.4, nz + b.dz * 0.4, rnd(0.3, 0.5), Math.random() * 6); } }
        } else if (!P.dead && Math.hypot(player.position.x - nx, player.position.z - nz) < 0.38) { hurtPlayer(dir, b.id); gone = true; }
      }
      if (gone) { root.remove(b.m); bullets.splice(i, 1); }
    }
  }
  function updateItems(dt) {
    for (const it of items) {
      it.age += dt; const p = it.g.position;
      if (Math.abs(it.vx) + Math.abs(it.vz) > 0.05) {
        const ox = p.x, oz = p.z; p.x += it.vx * dt; p.z += it.vz * dt;
        const ch = cellAt(p.x, p.z), key = Math.floor(p.x - OX) + ',' + Math.floor(p.z - Z0);
        if (ch === '%' && it.flying) { breakGlass(key); it.vx *= 0.7; it.vz *= 0.7; }
        else if ((it.flying ? isCover(ch) : isBlock(ch)) || doorBlocks(ox, oz, p.x, p.z)) { p.x = ox; p.z = oz; it.vx *= -0.3; it.vz *= -0.3; if (it.flying) { sfx('thud'); sparks(ox, 1, oz, woodM, 4); } it.flying = false; }
        if (it.flying) { it.g.rotation.z += dt * 18;
          for (const e of enemies) { const f = e.userData.foe; if (!f.alive || f.down > 0) continue;
            if (Math.hypot(e.position.x - p.x, e.position.z - p.z) < 0.5) { const l = Math.hypot(it.vx, it.vz) || 1, dir = [it.vx / l, it.vz / l];
              if (f.boss) stagger(e, dir); else { knockdown(e, dir); popup(e.position, 'DOWN!', '#ffd36b'); } it.flying = false; it.vx *= -0.2; it.vz *= -0.2; break; } } }
        const fr = it.flying ? 0.6 : 5; it.vx *= Math.exp(-dt * fr); it.vz *= Math.exp(-dt * fr);
        if (it.flying && Math.hypot(it.vx, it.vz) < 6) it.flying = false;
      }
      p.y += ((it.flying ? 1.0 : 0.08) - p.y) * Math.min(1, dt * 10);
      it.ring.position.set(p.x, 0.04, p.z); it.ring.visible = !it.flying;
    }
  }

  // ================================================================== ENEMY AI (Neon Vice's updateEnemy, Easy numbers)
  const angDiff = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));
  function laserTo(e, a) {
    const f = e.userData.foe, from = e.position.clone().add(new THREE.Vector3(Math.sin(a) * 0.5, 0, Math.cos(a) * 0.5));
    let len = 0.2; const q = from.clone();
    while (len < 16) { q.set(from.x + Math.sin(a) * len, 0, from.z + Math.cos(a) * len); const ch = cellAt(q.x, q.z); if ((isCover(ch) && ch !== 'X') || Math.hypot(q.x - player.position.x, q.z - player.position.z) < 0.35) break; len += 0.25; }
    f.laser.visible = true; f.laser.scale.z = len; f.laser.position.set(from.x + Math.sin(a) * len / 2, 1.25, from.z + Math.cos(a) * len / 2); f.laser.rotation.y = a;
    f.laser.material.opacity = 0.35 + (f.react < 0.35 ? 0.4 : 0);
  }
  function spot(e) { // Neon Vice spot(): whoever sees you calls the others within 5 m
    for (const o of enemies) { const of = o.userData.foe; if (o === e || !of.alive || of.down > 0 || of.state === 'chase') continue;
      if (o.position.distanceTo(e.position) < 5) { of.state = 'search'; of.sx = player.position.x; of.sz = player.position.z; of.searchT = 0; of.path = null; } }
  }
  function updateEnemy(e, dt, pv) {
    const f = e.userData.foe, u = e.userData;
    if (u.bubble.userData.life > 0 && (u.bubble.userData.life -= dt) <= 0) u.bubble.visible = false;
    if (f.fountain > 0) { f.fountain -= dt; if (Math.random() < dt * 40) bloodBurst(e.position, [-Math.sin(e.rotation.y), -Math.cos(e.rotation.y)], 2, 2.5, 0.3); }
    if (!f.alive) { if (f.body) slide(e, f, dt, 0.34); return; }
    if (f.down > 0) {
      f.down -= dt; poseDown(e, f.down > 0.4 ? 1 : f.down / 0.4); slide(e, f, dt, 0.34);
      if (f.down <= 0) { poseDown(e, 0); f.state = 'chase'; f.react = 0.6 * EASY.react; f.seeT = 0; e.rotation.y += Math.PI; say(u.bubble, 'Nu ben je echt dood!', '#ff7a1a'); }
      return;
    }
    if (Math.hypot(f.vx, f.vz) > 0.1) slide(e, f, dt, 0.34);
    f.cd -= dt; f.laser.visible = false;
    const wid = f.weapon || 'fists', W2 = WD[wid];
    const pp = player.position, dx = pp.x - e.position.x, dz = pp.z - e.position.z, dist = Math.hypot(dx, dz) || 0.001, ang = Math.atan2(dx, dz);
    let see = false;
    if (!P.dead && dist < (f.state === 'chase' ? 13 : EASY.vision)) {
      const cone = f.state === 'chase' || dist < 1.6 || Math.abs(angDiff(e.rotation.y, ang)) < (f.state === 'search' ? 1.3 : EASY.cone + (f.wary ? 0.35 : 0));
      if (cone && los(e.position, pp)) see = true;
    }
    if (!see && !P.dead && f.state !== 'chase') { const spd = Math.hypot(pv[0], pv[1]); const hear = (spd > 5 ? 3.2 : 1.4) * (spd > 0.6 ? 1 : 0); if (dist < hear && los(e.position, pp)) { f.state = 'search'; f.sx = pp.x; f.sz = pp.z; f.searchT = 0; f.path = null; } }
    if (!see && f.state === 'idle') for (const o of enemies) { const of = o.userData.foe; if (of.alive || of.found || o === e || !o.visible) continue;
      const bd = o.position.distanceTo(e.position); if (bd < EASY.vision * 0.8 && Math.abs(angDiff(e.rotation.y, Math.atan2(o.position.x - e.position.x, o.position.z - e.position.z))) < EASY.cone && los(e.position, o.position)) {
        of.found = true; f.wary = true; f.state = 'search'; f.sx = o.position.x; f.sz = o.position.z; f.searchT = 0; f.path = null; popup(e.position, 'BODY!', '#ffd36b'); sfx('alert'); say(u.bubble, 'Hé! Ze hebben Kees vermoord!', '#ff7a1a'); break; } }
    if (see) { if (f.state !== 'chase') { spot(e); f.state = 'chase'; f.react = (W2.melee ? 0.2 : 0.5 + Math.random() * 0.25) * EASY.react; say(u.bubble, ALERT_LINES[Math.floor(Math.random() * ALERT_LINES.length)], '#ff7a1a'); popup(e.position, '!', '#ff3fa4', true); sfx('alert'); } f.lkx = pp.x; f.lkz = pp.z; f.seeT = 0; }
    else f.seeT += dt;
    if (P.dead && f.state === 'chase') f.state = 'idle';
    let tvx = 0, tvz = 0, face = null;
    const goTo = (x, z, sp) => { f.pathT -= dt; if (f.pathT <= 0 || !f.path || !f.path.length) { f.pathT = 0.45; f.path = path(e.position, new THREE.Vector3(x, 0, z)); }
      if (f.path && f.path.length) { const t = f.path[0], ddx = t.x - e.position.x, ddz = t.z - e.position.z, l = Math.hypot(ddx, ddz); if (l < 0.3) f.path.shift(); else { tvx = ddx / l * sp; tvz = ddz / l * sp; face = Math.atan2(ddx, ddz); } return true; } return false; };
    switch (f.state) {
      case 'idle': f.turnT -= dt; if (f.turnT <= 0) { f.turnT = 1.5 + Math.random() * 2.5; f.ta = e.rotation.y + (Math.random() - 0.5) * 2.6; } face = f.ta; break;
      case 'search': { const dd = Math.hypot(f.sx - e.position.x, f.sz - e.position.z);
        if (dd > 0.9) { if (!goTo(f.sx, f.sz, 2.6)) f.searchT += dt; } else { f.searchT += dt; face = e.rotation.y + dt * 3; }
        if (f.searchT > (f.wary ? 6 : 3.5)) { f.state = 'idle'; f.turnT = 0; f.searchT = 0; } break; }
      case 'chase': {
        if (!f.weapon) { let bi = null, bd = 4.5; for (const it of items) { if (it.flying) continue; const d = Math.hypot(it.g.position.x - e.position.x, it.g.position.z - e.position.z); if (d < bd && los(e.position, it.g.position)) { bd = d; bi = it; } }
          if (bi && (dist > 2.5 || !see)) { const ddx = bi.g.position.x - e.position.x, ddz = bi.g.position.z - e.position.z; tvx = ddx / (bd || 1) * 3.2; tvz = ddz / (bd || 1) * 3.2; face = Math.atan2(ddx, ddz);
            if (bd < 0.5) { setFoeWeapon(e, bi.id); root.remove(bi.g, bi.ring); items.splice(items.indexOf(bi), 1); f.react = 0.5; say(u.bubble, 'Hebbes!', '#ff7a1a'); } break; } }
        if (see) { face = ang;
          if (W2.melee) { const sp = f.weapon ? 3.6 : 3.4;
            if (dist > 0.85) { // melee Lampas path round furniture instead of running into it
              const direct = !isBlock(cellAt(e.position.x + dx / dist * 0.7, e.position.z + dz / dist * 0.7));
              if (direct) { tvx = dx / dist * sp; tvz = dz / dist * sp; } else goTo(pp.x, pp.z, sp);
              if (gunOut() && dist > 2.2 && direct) { const zz = Math.sin(R.time * 5 + f.id * 1.7) * 0.85; tvx += dz / dist * sp * zz; tvz -= dx / dist * sp * zz; } }
            if (dist < 1.05 && f.wind <= 0 && f.cd <= 0) f.wind = 0.28 * Math.min(EASY.react, 1.6); }
          else { f.aiming = true; f.react -= dt; const want = f.pers === 'rush' ? 3.2 : f.pers === 'careful' ? 6.5 : 4.8;
            if (dist > want + 1.5) { tvx = dx / dist * 2.2; tvz = dz / dist * 2.2; } else if (dist < want - 1.5 && f.pers !== 'rush') { tvx = -dx / dist * 1.8; tvz = -dz / dist * 1.8; }
            f.strT -= dt; if (f.strT <= 0) { f.strT = 0.7 + Math.random() * 0.9; f.strD = Math.random() < 0.5 ? -1 : 1; } if (f.pers === 'rush') { tvx += dz / dist * 1.5 * f.strD; tvz -= dx / dist * 1.5 * f.strD; }
            laserTo(e, e.rotation.y);
            if (f.react <= 0 && f.cd <= 0 && Math.abs(angDiff(e.rotation.y, face)) < 0.22) { fireGun(e.position, e.rotation.y, wid, false, false); f.cd = W2.ecd * EASY.ecd; f.atkT = 0.1; } } }
        else if (!W2.melee && f.pers === 'careful' && f.seeT < 2.2) { face = Math.atan2(f.lkx - e.position.x, f.lkz - e.position.z); f.react = Math.max(f.react, 0.2); if (f.seeT < 1.2) laserTo(e, e.rotation.y); }
        else { if (f.seeT < 6) goTo(f.lkx || pp.x, f.lkz || pp.z, W2.melee ? 3.2 : 2.6); else { f.state = 'search'; f.sx = f.lkx; f.sz = f.lkz; f.searchT = 0; f.path = null; } f.react = Math.max(f.react, 0.35); }
        break; }
    }
    if (f.wind > 0) { f.wind -= dt; tvx *= 0.3; tvz *= 0.3;
      if (f.wind <= 0) { f.atkT = 0.2; f.cd = 0.8; sfx('swing'); const d2 = Math.hypot(pp.x - e.position.x, pp.z - e.position.z);
        if (!P.dead && d2 < 1.25 && Math.abs(angDiff(e.rotation.y, Math.atan2(pp.x - e.position.x, pp.z - e.position.z))) < 1.1) { sfx('hit'); hurtPlayer([(pp.x - e.position.x) / (d2 || 1), (pp.z - e.position.z) / (d2 || 1)], wid); } } }
    if (face !== null) { const turn = f.state === 'chase' ? 8 : 3; e.rotation.y += Math.max(-turn * dt, Math.min(turn * dt, angDiff(e.rotation.y, face))); }
    const k = 1 - Math.exp(-dt * 10); f.mvx += (tvx - f.mvx) * k; f.mvz += (tvz - f.mvz) * k;
    e.position.x += f.mvx * dt; e.position.z += f.mvz * dt; ctx.collide(e.position, 0.34); collideDoors(e.position, 0.36, f.mvx, f.mvz, false);
    animate(e, Math.hypot(f.mvx, f.mvz), dt);
    if (f.wind > 0) u.arms[0].rotation.x = -2.6; else if (f.atkT > 0) { f.atkT -= dt; u.arms[0].rotation.x = W2.melee ? 0.6 : -1.3; } else if (f.aiming && see) u.arms[0].rotation.x = -1.45;
    f.aiming = false;
  }
  // melee from main.js swing(): lunge at the target (Neon Vice), Maboota and fists knock down, a bat kills, downed = execution
  function melee(fv) {
    const id = P.slot === 2 && P.held && WD[P.held.id].melee ? P.held.id : 'maboota', W2 = WD[id];
    const sprinting = Math.hypot(player.position.x - P.last.x, player.position.z - P.last.z) * 60 > 5.5;
    let tgt = null, bd = W2.range + 0.45 + (sprinting ? 0.4 : 0);
    for (const e of enemies) { const f = e.userData.foe; if (!f.alive) continue;
      const d = e.position.clone().sub(player.position); d.y = 0; const L2 = d.length();
      if (L2 < bd && Math.abs(angDiff(Math.atan2(fv.x, fv.z), Math.atan2(d.x, d.z))) < 1.0 && los(player.position, e.position)) { bd = L2; tgt = e; } }
    if (!tgt) return;
    const f = tgt.userData.foe, d = tgt.position.clone().sub(player.position).setY(0), dist = d.length() || 1, dir = [d.x / dist, d.z / dist];
    player.rotation.y = Math.atan2(dir[0], dir[1]);
    if (dist > W2.range * 0.8) { P.vx += dir[0] * 7; P.vz += dir[1] * 7; } // lunge
    if (f.down > 0) { execute(tgt); return; }
    sfx('hit'); shake(0.15);
    if (W2.kill) hitEnemy(tgt, id, dir, 2); else if (f.boss) stagger(tgt, dir); else { knockdown(tgt, dir); popup(tgt.position, 'DOWN!', '#ffd36b'); }
  }
  function cameraFor(zoom) {
    const lean = P.dead ? new THREE.Vector3() : aim.clone().sub(player.position).setY(0).clampLength(0, 6).multiplyScalar(0.3);
    const look = player.position.clone().add(lean).add(FX.kick).setY(0.8);
    const sh = FX.shake; if (sh > 0.01) look.add(new THREE.Vector3((Math.random() - 0.5) * sh, 0, (Math.random() - 0.5) * sh));
    return { pos: look.clone().add(new THREE.Vector3(0, 17 * zoom, 3.6 * zoom)), look };
  }
  function onBuy(id) {
    if (id === 'makarov') state.ammo.makarov = (state.ammo.makarov || 0) + WD.makarov.ammo;
    if (id === 'ammo') state.ammo.makarov = (state.ammo.makarov || 0) + 50;
    if (id === 'shotgun') state.ammo.shotgun = (state.ammo.shotgun || 0) + 12;
    if (id === 'shells') state.ammo.shotgun = (state.ammo.shotgun || 0) + 12;
    if (['makarov', 'shotgun', 'bat'].includes(id)) toast(WD[id].name + ' · IN YOUR INVENTORY', 'Slot 2 on missions. On the street it stays in the Oofmobiel. Press I to check your kit.', 3);
    hud();
  }
  // level checks: every door has free floor on both sides, and every Lampas and crate can be reached from the front door
  function validate() {
    const issues = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'D') {
      const horiz = (x > 0 && G[z][x - 1] === 'D') || (x < W - 1 && G[z][x + 1] === 'D');
      for (const [ax, az] of horiz ? [[x, z - 1], [x, z + 1]] : [[x - 1, z], [x + 1, z]]) if (!walkable(ax, az)) issues.push(`door ${x},${z} blocked at ${ax},${az}`);
    }
    const start = new THREE.Vector3(OX + 18.5, 0, Z0 + 24.5);
    for (const e of enemies) { const [x, z] = e.userData.foe.spawn; if (isBlock(G[Math.floor(z)][Math.floor(x)])) issues.push(`spawn ${x},${z} inside furniture`); else if (!path(start, L(x, z))) issues.push(`spawn ${x},${z} unreachable`); }
    for (const [x, z] of LOOT) if (!path(start, L(x, z))) issues.push(`loot ${x},${z} unreachable`);
    return issues;
  }
  Object.assign(M, { enter, exit, update, street, melee, cameraFor, hitstop, onBuy, frozen: () => P.dead || R.results, aiming: () => M.active, invOpen: () => invOpen, openInv, closeInv,
    enemies, items, doors, glass, barrels, P, R, lootCrates, OX, L, G, resetFloor, hud, validate,
    _hit: (e) => killEnemy(e, 'maboota', [0, 1]), _hurt: (c) => hurtPlayer([0, 1], c || 'makarov'), _knock: (e) => knockdown(e, [0, 1]), _attack: attack, _grab: grab, _select: selectSlot, _explode: explode, _breakGlass: breakGlass, _fire: (a, id) => fireGun(player.position, a, id || 'makarov', true, false) });
  hud();
  return M;
}
