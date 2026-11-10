// Spice Master Eddy: Mission 1, Spekbuurt.
// A Lampas shoarma joint with a back of house full of enemies. Neon Vice / Hotline Miami rules:
// one hit kills (both ways, a vest soaks one bullet), mouse aim, click / F to attack, E to grab a weapon,
// 1 Maboota / 2 gun, R or Backspace restarts the floor. Clear everybody to unlock Spekbuurt.
//
// The level is built once, 300 m east of De Natte Worst, in the same scene. Everything here uses
// level-local coordinates (L(x, z) converts to world). initMission(ctx) gets the engine helpers from main.js.

export function initMission(ctx) {
  const { THREE, scene, camera, player, state, box, cyl, lam, solid, solids, makePerson, animate, toast, beep, addMoney,
    neonTube, neonRect, signTex, canvasTex, car, $, maboota, equip, bubble, say, addInteract, clearPlayerSplats, sun, hemi,
    setBounds, updateObjective, setArea } = ctx;
  const OX = 300; // level origin (world x)
  const L = (x, z, y = 0) => new THREE.Vector3(OX + x, y, z);
  const root = new THREE.Group(); scene.add(root);

  // ------------------------------------------------------------------ geometry helpers
  const walls = [];   // AABBs that stop bullets and sight
  const mSolids = []; // everything that blocks walking (for the nav grid)
  const WALL_H = 2.3, WT = 0.26;
  const wallM = lam({ color: 0x2c2238 }), capM = lam({ color: 0xf2e6f4 });
  function block(x0, x1, z0, z1, h, m, isWall) {
    const w = x1 - x0, d = z1 - z0;
    box(w, h, d, m, OX + (x0 + x1) / 2, h / 2, (z0 + z1) / 2, root);
    const s = solid(OX + x0, OX + x1, z0, z1); mSolids.push(s); if (isWall) walls.push(s);
    return s;
  }
  function wallSeg(x0, x1, z0, z1) {
    block(x0, x1, z0, z1, WALL_H, wallM, true);
    box(x1 - x0 + 0.02, 0.06, z1 - z0 + 0.02, capM, OX + (x0 + x1) / 2, WALL_H + 0.03, (z0 + z1) / 2, root, false);
  }
  // horizontal wall along z from x0..x1 with door gaps [[a,b],...]
  function wallH(z, x0, x1, gaps = []) {
    let x = x0; for (const [a, b] of [...gaps].sort((p, q) => p[0] - q[0])) { if (a > x) wallSeg(x, a, z - WT / 2, z + WT / 2); x = b; } if (x1 > x) wallSeg(x, x1, z - WT / 2, z + WT / 2);
  }
  function wallV(x, z0, z1, gaps = []) {
    let z = z0; for (const [a, b] of [...gaps].sort((p, q) => p[0] - q[0])) { if (a > z) wallSeg(x - WT / 2, x + WT / 2, z, a); z = b; } if (z1 > z) wallSeg(x - WT / 2, x + WT / 2, z, z1);
  }
  function floor(x0, x1, z0, z1, tex, rep = 1, color = 0xffffff) {
    const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((x1 - x0) / rep, (z1 - z0) / rep);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), lam({ map: t, color }));
    m.rotation.x = -Math.PI / 2; m.position.set(OX + (x0 + x1) / 2, 0.02, (z0 + z1) / 2); m.receiveShadow = true; root.add(m);
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

  // ------------------------------------------------------------------ the level (local coords: building x 4..48, z -24..0; street z 0..10)
  // street + pavement + façade
  floor(-10, 62, 2.6, 12, T.asphalt, 4); floor(-10, 62, 0, 2.6, T.paving, 1.5);
  for (let x = -8; x < 62; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 7.3, root, false);
  // neighbouring buildings (dark silhouettes) so the street isn't empty
  for (const [x0, x1, c] of [[-10, 4, 0x2a3a5a], [48, 62, 0x3a2a4a]]) { box(x1 - x0, 7, 24, lam({ color: c }), OX + (x0 + x1) / 2, 3.5, -12, root); solid(OX + x0, OX + x1, -24, 0); }
  // rooms: floors
  floor(4, 12, -10, 0, T.shag, 1.2);       // workers' lounge
  floor(12, 28, -10, 0, T.checker, 1.0);   // restaurant
  floor(28, 34, -10, 0, T.tiles, 1.0);     // mixing room
  floor(34, 48, -10, 0, T.garage, 3.0);    // garage
  floor(4, 48, -13, -10, T.hall, 1.5);     // hallway
  floor(4, 15, -24, -13, T.casino, 1.6);   // gambling room
  floor(15, 23, -24, -13, T.parquet, 1.2); // office
  floor(23, 30, -24, -13, T.rubber, 1.5);  // gym
  floor(30, 48, -24, -13, T.concrete, 3.0);// spice warehouse
  // walls (door gaps in brackets)
  wallH(0, 4, 48, [[18.2, 20.2]]);
  wallH(-24, 4, 48);
  wallV(4, -24, 0); wallV(48, -24, 0);
  wallH(-10, 4, 48, [[6, 7.6], [25, 26.6], [30, 31.6], [40, 41.6]]);
  wallH(-13, 4, 48, [[9, 10.6], [18, 19.6], [26, 27.6], [34, 35.6], [43, 44.6]]);
  wallV(12, -10, 0); wallV(28, -10, 0); wallV(34, -10, 0);
  wallV(15, -24, -13); wallV(23, -24, -13); wallV(30, -24, -13);
  // the door from the restaurant into the back of house: a swing door with a porthole
  const backDoor = new THREE.Group(); backDoor.position.set(OX + 25, 0, -10); root.add(backDoor);
  box(1.6, 2.1, 0.08, lam({ color: 0x8a1a2a }), 0.8, 1.05, 0, backDoor, false);
  const port = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), lam({ color: 0x9ad0ff })); port.position.set(0.8, 1.5, 0.05); backDoor.add(port);
  const STAFF = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), lam({ map: signTex([{ t: 'PERSONEEL', size: 40 }], '#1a1a1a', '#ffd23a', 256, 64) })); STAFF.position.set(0.8, 2.05, 0.06); backDoor.add(STAFF);
  // front: shop window, neon sign, awning, door
  for (const [x0, x1] of [[13, 17.6], [20.8, 27]]) { box(x1 - x0, 1.4, 0.06, lam({ color: 0x9ad0ff, transparent: true, opacity: 0.45 }), OX + (x0 + x1) / 2, 1.5, 0.16, root, false); neonRect(root, OX + (x0 + x1) / 2, 1.5, x1 - x0, 1.45, 0.2, 0xffe14a); }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'SNACKPALEIS SPEKBUURT', size: 90 }, { t: 'EIGENDOM VAN DE LAMPAS', size: 38, color: '#ffffff' }], '#1a0a10', '#ff7a1a', 1024, 150) }));
  sign.position.set(OX + 20, 2.75, 0.2); root.add(sign); neonRect(root, OX + 20, 2.75, 9.2, 1.25, 0.24, 0xff7a1a);
  // restaurant furniture
  const red = lam({ color: 0xc8402e }), steel = new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.8 }), wood = lam({ color: 0x6a3a1a });
  block(13, 23.5, -9.6, -8.6, 1.05, red); box(10.6, 0.08, 1.1, steel, OX + 18.25, 1.09, -9.1, root, false);
  box(0.9, 1.6, 0.4, steel, OX + 22.5, 1.9, -9.75, root, false);
  const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 1.1, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 22.5, 1.85, -9.3); root.add(doner);
  for (const [x, z] of [[14.5, -3], [17.5, -3], [21.5, -3], [24.5, -3], [15.5, -6], [23.5, -6]]) { block(x - 0.5, x + 0.5, z - 0.4, z + 0.4, 0.76, lam({ color: 0xf2efe6 })); }
  const menu = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'LAMPAS SHOARMA  W 5', size: 30 }, { t: 'Lampas spice: 100% echt*', size: 24, color: '#ffffff' }], '#1a0a10', '#3ff0ff', 512, 128) }));
  menu.position.set(OX + 18, 2.0, -9.86); root.add(menu);
  // lounge: sofa, TV, coffee table, fridge, pinball
  block(4.4, 8.4, -1.0, -0.3, 0.8, lam({ color: 0x6a2a5a })); block(5.2, 7.2, -3.0, -2.2, 0.45, wood);
  block(5.0, 7.4, -9.6, -9.0, 0.6, lam({ color: 0x2a2a2a })); box(1.6, 0.9, 0.5, lam({ color: 0x1a1a1e }), OX + 6.2, 1.05, -9.35, root);
  const tv = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshBasicMaterial({ color: 0x5ab8ff })); tv.position.set(OX + 6.2, 1.08, -9.08); root.add(tv);
  block(10.6, 11.6, -9.6, -8.8, 1.8, lam({ color: 0xe8e8e0 }));
  block(10.4, 11.6, -4, -2.4, 1.4, lam({ color: 0xff3fa4 }));
  // gambling room: two card tables, slot machines, a bar
  for (const [x, z] of [[8, -17], [11.5, -21]]) { cyl(1.0, 1.0, 0.06, lam({ color: 0x1f6a3a }), OX + x, 0.76, z, root, 24); cyl(0.1, 0.12, 0.74, lam({ color: 0x1a1a1a }), OX + x, 0.37, z, root); const s = solid(OX + x - 1.0, OX + x + 1.0, z - 1.0, z + 1.0); mSolids.push(s); }
  for (let i = 0; i < 6; i++) { const z = -14 - i * 1.5; block(4.2, 5.0, z - 0.6, z + 0.6, 1.7, lam({ color: 0x7a1a3a })); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.5), new THREE.MeshBasicMaterial({ color: [0xffe14a, 0x3ff0ff, 0xff3fa4][i % 3] })); sc.rotation.y = Math.PI / 2; sc.position.set(OX + 5.02, 1.3, z); root.add(sc); }
  block(13.2, 14.8, -23.6, -18, 1.1, wood);
  neonTube(root, OX + 4.4, WALL_H - 0.3, OX + 14.6, WALL_H - 0.3, -23.82, 0x3ff0ff);
  // office: desk, safe, filing cabinets, portrait of Jan van Kaas
  block(17, 21, -21.8, -20.8, 0.8, lam({ color: 0x3a1a0a })); block(21.6, 22.6, -23.6, -22.6, 1.2, lam({ color: 0x3a3a40 }));
  for (let i = 0; i < 3; i++) block(15.4, 16.1, -23.6 + i * 0.75, -22.9 + i * 0.75, 1.3, lam({ color: 0x8a8a8a }));
  const jvk = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.0), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8b040'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2a1a1a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(64, 44, 22, 0, 7); g.fill(); g.fillStyle = '#ff7a1a'; g.fillRect(36, 66, 56, 24); g.fillStyle = '#ffd36b'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText('JAN VAN KAAS', 64, 88); }) }));
  jvk.position.set(OX + 19, 1.7, -23.85); root.add(jvk);
  // gym: bench press, dumbbell rack, punching bag, mirror
  block(24, 26, -20.5, -19.8, 0.5, lam({ color: 0x1a1a1a })); cyl(0.04, 0.04, 2.0, steel, OX + 25, 1.0, -20.15, root).rotation.z = Math.PI / 2;
  block(28.4, 29.6, -23.6, -21, 0.9, lam({ color: 0x3a3a3a }));
  const bag = cyl(0.28, 0.28, 1.1, lam({ color: 0xb8102e }), OX + 26.5, 1.25, -16, root); const bs = solid(OX + 26.2, OX + 26.8, -16.3, -15.7); mSolids.push(bs);
  box(5.6, 1.8, 0.04, new THREE.MeshStandardMaterial({ color: 0xbfd8e8, roughness: 0.05, metalness: 0.9 }), OX + 26.5, 1.2, -23.82, root, false);
  // spice warehouse: pallet racks of sacks, and loot crates
  for (let i = 0; i < 4; i++) { const x = 31 + i * 4.2; block(x, x + 3.2, -23.7, -22.6, 2.0, lam({ color: 0x3a5aa0 })); for (let k = 0; k < 6; k++) box(0.5, 0.45, 0.6, lam({ color: [0xe8a020, 0xc8402e, 0xf2c43a][k % 3] }), OX + x + 0.35 + (k % 3) * 1.1, 0.5 + Math.floor(k / 3) * 0.9, -23.15, root); }
  block(36, 38, -18.5, -16.5, 1.2, lam({ color: 0x8a6a3a })); block(42, 44.5, -20, -18.5, 1.2, lam({ color: 0x8a6a3a }));
  // mixing room (standard in every level): steel table with a bowl and sacks
  block(30, 32.5, -6.2, -4.8, 0.95, steel); const bowl = cyl(0.45, 0.3, 0.25, lam({ color: 0xe8e8e8 }), OX + 31.25, 1.1, -5.5, root, 16);
  const spice = cyl(0.42, 0.42, 0.05, lam({ color: 0xd8742a }), OX + 31.25, 1.2, -5.5, root, 16);
  for (let i = 0; i < 4; i++) box(0.6, 0.7, 0.4, lam({ color: [0xe8a020, 0xc8402e, 0xf2c43a, 0x4f9a30][i] }), OX + 29 + i * 1.2, 0.35, -9.4, root);
  // garage: two cars, workbench, oil drums, roll-up door (closed)
  car(OX + 38.2, -5.2, 0xff7a1a, Math.PI / 2, true, 5); car(OX + 44.2, -5.0, 0x1a1a1a, Math.PI / 2, true, 0);
  block(45.6, 47.6, -9.6, -8.8, 0.95, wood); for (const z of [-2, -1.1]) cyl(0.32, 0.32, 0.9, lam({ color: 0x2a4a8a }), OX + 47.2, 0.45, z, root);
  const rollT = canvasTex(64, 64, (g) => { for (let y = 0; y < 64; y += 6) { g.fillStyle = y % 12 ? '#8a8a86' : '#6a6a66'; g.fillRect(0, y, 64, 6); } });
  const roll = new THREE.Mesh(new THREE.PlaneGeometry(8, WALL_H), lam({ map: rollT })); roll.position.set(OX + 41, WALL_H / 2, 0.15); root.add(roll);
  // neon strips along the hallway
  neonTube(root, OX + 4.3, WALL_H - 0.25, OX + 47.7, WALL_H - 0.25, -12.84, 0xff3fa4);
  neonTube(root, OX + 4.3, WALL_H - 0.25, OX + 47.7, WALL_H - 0.25, -10.16, 0x3ff0ff);
  // a few lights (kept low: every light costs on every material)
  const lights = [];
  for (const [x, z, c, k] of [[20, -5, 0xff9a6a, 2.2], [26, -11.5, 0xff3fa4, 1.6], [9, -18, 0x3ff0ff, 1.6], [39, -18, 0xffd8a0, 2.0]]) { const l = new THREE.PointLight(c, 0, 18, 1.3); l.position.set(OX + x, WALL_H + 0.6, z); root.add(l); lights.push([l, k]); }
  // the Oofmobiel, parked outside
  const van = ctx.makeVan(); van.position.set(OX + 12, 0, 4.6); root.add(van);
  const vanSolid = solid(OX + 8.9, OX + 15.2, 3.45, 5.75);

  // ------------------------------------------------------------------ nav grid (for enemies walking round walls)
  const G = { x0: 3.5, z0: -24.5, cs: 0.5, nx: 92, nz: 70 };
  let blocked = null;
  function buildGrid() {
    blocked = new Uint8Array(G.nx * G.nz);
    for (let iz = 0; iz < G.nz; iz++) for (let ix = 0; ix < G.nx; ix++) {
      const x = OX + G.x0 + (ix + 0.5) * G.cs, z = G.z0 + (iz + 0.5) * G.cs;
      for (const s of mSolids) if (!s.off && x > s.minx - 0.32 && x < s.maxx + 0.32 && z > s.minz - 0.32 && z < s.maxz + 0.32) { blocked[iz * G.nx + ix] = 1; break; }
    }
  }
  const cellOf = (p) => [Math.floor((p.x - OX - G.x0) / G.cs), Math.floor((p.z - G.z0) / G.cs)];
  const inGrid = (ix, iz) => ix >= 0 && iz >= 0 && ix < G.nx && iz < G.nz;
  function path(from, to) {
    const [sx, sz] = cellOf(from), [tx, tz] = cellOf(to);
    if (!inGrid(sx, sz) || !inGrid(tx, tz)) return null;
    const N = G.nx * G.nz, prev = new Int32Array(N).fill(-1), start = sz * G.nx + sx, goal = tz * G.nx + tx;
    const q = new Int32Array(N); let h = 0, t = 0; q[t++] = start; prev[start] = start;
    while (h < t) {
      const c = q[h++]; if (c === goal) break;
      const cx = c % G.nx, cz = (c / G.nx) | 0;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const nx = cx + dx, nz = cz + dz; if (!inGrid(nx, nz)) continue;
        const n = nz * G.nx + nx; if (prev[n] !== -1 || (blocked[n] && n !== goal)) continue;
        if (dx && dz && (blocked[cz * G.nx + nx] || blocked[nz * G.nx + cx])) continue;
        prev[n] = c; q[t++] = n;
      }
    }
    if (prev[goal] === -1) return null;
    const out = []; for (let c = goal; c !== start; c = prev[c]) out.push(c); out.reverse();
    return out.map((c) => new THREE.Vector3(OX + G.x0 + ((c % G.nx) + 0.5) * G.cs, 0, G.z0 + (((c / G.nx) | 0) + 0.5) * G.cs));
  }
  // does a straight line hit a wall? (slab test against wall boxes)
  function lineBlocked(a, b) {
    const dx = b.x - a.x, dz = b.z - a.z;
    for (const w of walls) {
      let t0 = 0, t1 = 1;
      for (const [p, d, lo, hi] of [[a.x, dx, w.minx, w.maxx], [a.z, dz, w.minz, w.maxz]]) {
        if (Math.abs(d) < 1e-9) { if (p < lo || p > hi) { t0 = 2; break; } continue; }
        let u0 = (lo - p) / d, u1 = (hi - p) / d; if (u0 > u1) [u0, u1] = [u1, u0];
        t0 = Math.max(t0, u0); t1 = Math.min(t1, u1); if (t0 > t1) break;
      }
      if (t0 <= t1 && t0 < 1) return true;
    }
    return false;
  }
  const inWall = (p) => walls.some((w) => p.x > w.minx && p.x < w.maxx && p.z > w.minz && p.z < w.maxz);

  // ------------------------------------------------------------------ weapons
  const WEAPONS = {
    maboota: { name: 'MABOOTA', melee: true, reach: 1.6 },
    bat: { name: 'HONKBALKNUPPEL', melee: true, reach: 1.7 },
    makarov: { name: 'MAKAROV', melee: false, mag: 12, rate: 0.22, pellets: 1, spread: 0.03, noise: 16 },
    shotgun: { name: 'SHOTGUN', melee: false, mag: 6, rate: 0.75, pellets: 6, spread: 0.22, noise: 20 },
  };
  function weaponMesh(id) {
    const g = new THREE.Group();
    if (id === 'bat') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.025, 0.85, 8), lam({ color: 0xc8a06a })); b.position.y = -0.4; g.add(b); }
    if (id === 'makarov') { box(0.05, 0.1, 0.26, lam({ color: 0x1a1a1a }), 0, -0.05, 0.1, g, false); box(0.05, 0.14, 0.07, lam({ color: 0x3a2a1a }), 0, -0.1, 0, g, false); }
    if (id === 'shotgun') { box(0.06, 0.07, 0.8, lam({ color: 0x1a1a1a }), 0, -0.03, 0.3, g, false); box(0.07, 0.11, 0.3, lam({ color: 0x6a3a1a }), 0, -0.06, -0.12, g, false); }
    return g;
  }
  // the player's hands
  const P = { gun: null, slot: 1, hp: 1, armour: 0, dead: false, deadT: 0, fireT: 0 };
  const handGun = new THREE.Group(); handGun.position.set(0, -0.68, 0.05); player.userData.arms[0].add(handGun);
  function setGun(g) { P.gun = g; handGun.clear(); if (g) handGun.add(weaponMesh(g.id)); hud(); }
  function selectSlot(n) {
    if (n === 2 && !P.gun) { toast('NO GUN', 'Grab one from a Lampas (E).', 1.2); return; }
    P.slot = n; maboota.visible = n === 1; handGun.visible = n === 2; state.armed = n === 1; hud(); beep(300, 0.05, 'square', 0.03);
  }

  // ------------------------------------------------------------------ enemies (the Lampas)
  const LAMPAS_LOOKS = [
    { front: '#e8641as', shirt: 0xe8641a, pants: 0x2a2a3a }, { front: '#2a1a12', shirt: 0x2a1a12, pants: 0x1a1a22 },
    { front: '#f2efe6', shirt: 0xf2efe6, pants: 0xe8641a }, { front: '#ff7a1a', shirt: 0xff7a1a, pants: 0xf2efe6 },
  ];
  const SPAWNS = [ // x, z, weapon, facing (radians, 0 = +z/south), room
    [15, -5, 'bat', 0, 'restaurant'], [22, -4, 'makarov', Math.PI, 'restaurant'], [25.8, -7.8, 'bat', Math.PI, 'restaurant'], [17, -7.9, 'makarov', 0, 'restaurant'],
    [20, -11.5, 'bat', Math.PI / 2, 'hallway'],
    [7.2, -15, 'makarov', 0, 'casino'], [9.8, -20.3, 'bat', Math.PI / 2, 'casino'], [12.8, -16, 'bat', -Math.PI / 2, 'casino'],
    [19, -22.6, 'shotgun', 0, 'office', true], [16.5, -15.2, 'makarov', Math.PI / 2, 'office'],
    [25, -18, 'bat', 0, 'gym'], [28.5, -19.5, 'bat', -Math.PI / 2, 'gym'],
    [33.5, -19.5, 'makarov', 0, 'warehouse'], [45.6, -16, 'bat', -Math.PI / 2, 'warehouse'], [40, -21.5, 'shotgun', 0, 'warehouse'],
    [32.8, -7.4, 'bat', Math.PI, 'mixing'],
    [36.6, -2.0, 'makarov', Math.PI, 'garage'], [46, -7, 'bat', -Math.PI / 2, 'garage'],
    [9.6, -6.5, 'bat', Math.PI / 2, 'lounge'], [6.2, -4.4, 'makarov', Math.PI, 'lounge'],
  ];
  const enemies = [];
  SPAWNS.forEach(([x, z, w, rot, room, boss], i) => {
    const look = LAMPAS_LOOKS[i % LAMPAS_LOOKS.length];
    const head = boss
      ? { skin: 0xf0c8a8, hair: '#d8c080', brow: '#a89060', hairLine: 80, sideLine: 116, backLine: 150, mouth: 'smile', glasses: true, iris: '#3a5a7a' }
      : { skin: [0xf0c8a8, 0xe0a882, 0xf4d2bc, 0xd8a080][i % 4], hair: ['#2a2a2a', '#d8c080', '#7a5a30', '#1a1a1a'][i % 4], brow: '#3a2a1a', hairLine: i % 3 === 0 ? 40 : 96, sideLine: 120, backLine: 150, mouth: 'smile', iris: '#3a3a3a' };
    const p = makePerson({ head, ballcap: i % 5 === 2 ? 0xff7a1a : undefined, front: boss ? '#f2efe6' : look.front, shirt: boss ? 0xf2efe6 : look.shirt, pants: boss ? 0xf2efe6 : look.pants, shoes: 0x111111, belly: boss ? 1.2 : (i % 3) * 0.4, skin: head.skin, chain: boss || i % 4 === 1, scale: boss ? 1.08 : 1 });
    scene.remove(p); root.add(p);
    const wm = weaponMesh(w); wm.position.set(0, -0.68, 0.05); p.userData.arms[0].add(wm);
    p.userData.foe = { spawn: [x, z, rot], weapon: w, room, boss: !!boss, hp: boss ? 2 : 1, state: 'idle', alert: 0, seen: null, path: null, pathT: 0, fireT: 0, react: 0, attackT: 0, dead: false, wm, shout: 0 };
    p.userData.bubble = bubble(); p.add(p.userData.bubble); p.userData.bubble.position.set(0, 2.5, 0);
    enemies.push(p);
  });
  const ALERT_LINES = ['Hé! Wie ben jij?!', 'Het is die Eddy!', 'PAK HEM!', 'Lampas forever!', 'Dit is ons gebied!'];

  // ------------------------------------------------------------------ pickups, loot, blood, bullets
  const drops = [], bullets = [], decals = [];
  const lootCrates = [];
  const crateM = lam({ map: canvasTex(64, 64, (g) => { g.fillStyle = '#8a6a3a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#5a3a1a'; g.lineWidth = 4; g.strokeRect(3, 3, 58, 58); g.beginPath(); g.moveTo(3, 3); g.lineTo(61, 61); g.stroke(); g.fillStyle = '#ff7a1a'; g.font = '900 12px Arial'; g.textAlign = 'center'; g.fillText('LAMPAS', 32, 36); }) });
  for (const [x, z] of [[31.2, -14.2], [32.2, -14.2], [37, -15.8], [46.8, -21.6], [46.8, -20.6], [29, -1.2]]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.7), crateM); c.position.set(OX + x, 0.28, z); c.castShadow = true; root.add(c);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.7 })); glow.rotation.x = -Math.PI / 2; glow.position.set(OX + x, 0.04, z); root.add(glow);
    lootCrates.push({ c, glow, taken: false });
  }
  const bloodTex = canvasTex(64, 64, (g) => { g.fillStyle = '#8a0a12'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(32 + (Math.random() - 0.5) * 30, 32 + (Math.random() - 0.5) * 30, 5 + Math.random() * 10, 0, 7); g.fill(); } });
  function blood(at, s = 1) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6 * s, 1.6 * s), new THREE.MeshBasicMaterial({ map: bloodTex, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, Math.random() * 6); m.position.set(at.x, 0.03 + decals.length * 0.0005, at.z); root.add(m); decals.push(m); }
  function drop(id, at, ammo) {
    if (id === 'maboota') return;
    const g = weaponMesh(id); g.rotation.set(Math.PI / 2, 0, Math.random() * 6); g.position.set(at.x, 0.08, at.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); ring.rotation.x = -Math.PI / 2; ring.position.set(at.x, 0.04, at.z);
    root.add(g, ring); drops.push({ id, g, ring, ammo: ammo ?? (WEAPONS[id].mag || 0) });
  }
  const tracerM = [new THREE.MeshBasicMaterial({ color: 0xfff0a0 }), new THREE.MeshBasicMaterial({ color: 0xff7a3a })];
  function shoot(from, dir, w, byPlayer) {
    const W = WEAPONS[w];
    for (let i = 0; i < W.pellets; i++) {
      const a = Math.atan2(dir.x, dir.z) + (Math.random() - 0.5) * W.spread * 2;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.6), tracerM[byPlayer ? 0 : 1]);
      m.position.set(from.x, 1.25, from.z); m.rotation.y = a; root.add(m);
      bullets.push({ m, vx: Math.sin(a) * (byPlayer ? 38 : 20), vz: Math.cos(a) * (byPlayer ? 38 : 20), byPlayer, life: 1.2 });
    }
    // bang
    beep(byPlayer ? 120 : 150, 0.08, 'square', 0.07); beep(w === 'shotgun' ? 70 : 90, 0.14, 'sawtooth', 0.05);
    if (byPlayer) noise(from, W.noise);
  }
  function noise(at, r) { for (const e of enemies) { const f = e.userData.foe; if (!f.dead && e.position.distanceTo(at) < r) { if (!f.alert) { f.react = 0.35; } f.alert = 1; f.seen = player.position.clone(); } } }

  // ------------------------------------------------------------------ HUD + overlays
  const hudEl = document.createElement('div'); hudEl.style.cssText = 'position:fixed;left:24px;bottom:24px;font:900 18px Arial Black,Arial;color:#fff;text-shadow:0 2px 0 #000;display:none;z-index:5';
  document.body.appendChild(hudEl);
  const over = document.createElement('div'); over.style.cssText = 'position:fixed;inset:0;display:none;align-items:center;justify-content:center;flex-direction:column;background:rgba(80,0,20,.45);z-index:20;font:900 64px Arial Black,Arial;color:#ff3fa4;text-shadow:0 0 18px #ff3fa4,0 4px 0 #000;pointer-events:none';
  document.body.appendChild(over);
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#0a0410;opacity:0;pointer-events:none;transition:opacity .45s;z-index:30';
  document.body.appendChild(fade);
  function hud() {
    if (!M.active) { hudEl.style.display = 'none'; return; }
    const left = enemies.filter((e) => !e.userData.foe.dead).length;
    const gun = P.gun ? `${WEAPONS[P.gun.id].name} ${P.gun.ammo}/${WEAPONS[P.gun.id].mag}` : '—';
    hudEl.innerHTML = `<div style="color:#ff7a1a">LAMPAS LEFT: ${left}</div><div style="font-size:15px;margin-top:4px"><span style="color:${P.slot === 1 ? '#ff3fa4' : '#888'}">[1] MABOOTA</span> &nbsp; <span style="color:${P.slot === 2 ? '#3ff0ff' : '#888'}">[2] ${gun}</span>${P.armour ? ' &nbsp; <span style="color:#ffd23a">VEST</span>' : ''}${state.loot ? ` &nbsp; <span style="color:#ffd23a">SPICE ×${state.loot}</span>` : ''}</div>`;
    hudEl.style.display = 'block';
  }

  // ------------------------------------------------------------------ mission state
  const M = { active: false, cleared: () => !!state.spekbuurt };
  const saved = {};
  let lootAtStart = 0;
  function resetFloor() {
    // enemies back to their posts (none if Spekbuurt is already ours)
    enemies.forEach((e) => {
      const f = e.userData.foe, [x, z, r] = f.spawn;
      Object.assign(f, { state: 'idle', alert: 0, seen: null, path: null, pathT: 0, fireT: 0, react: 0, attackT: 0, dead: !!state.spekbuurt, hp: f.boss ? 2 : 1, shout: 0 });
      e.position.set(OX + x, 0, z); e.rotation.y = r; e.visible = !state.spekbuurt;
      const u = e.userData; u.body.rotation.x = 0; u.body.position.y = 0; f.wm.visible = true; u.bubble.visible = false;
    });
    for (const d of drops) root.remove(d.g, d.ring); drops.length = 0;
    for (const b of bullets) root.remove(b.m); bullets.length = 0;
    for (const d of decals) root.remove(d); decals.length = 0;
    state.loot = lootAtStart; lootCrates.forEach((l, i) => { const t = state.spekbuurtLootTaken && state.spekbuurtLootTaken.includes(i); l.taken = t; l.c.visible = l.glow.visible = !t; });
    backDoor.rotation.y = 0;
    // the player's kit: Maboota + the best gun bought from The Russian
    const kit = state.kit, ammoBoxes = kit.filter((k) => k === 'ammo').length;
    setGun(kit.includes('shotgun') ? { id: 'shotgun', ammo: 6 + 6 * ammoBoxes } : kit.includes('makarov') ? { id: 'makarov', ammo: 12 + 12 * ammoBoxes } : null);
    P.armour = kit.includes('vest') ? 1 : 0; P.dead = false; P.deadT = 0; P.fireT = 0;
    player.userData.body.rotation.x = 0; player.userData.body.position.y = 0;
    player.position.copy(L(19.2, 2.2)); player.rotation.y = Math.PI;
    selectSlot(1); over.style.display = 'none'; M.snap = true; hud();
  }
  function enter() {
    if (M.active) return;
    fade.style.opacity = '1';
    setTimeout(() => {
      M.active = true; clearPlayerSplats();
      saved.bg = scene.background.clone(); saved.fog = [scene.fog.color.clone(), scene.fog.near, scene.fog.far]; saved.hemi = hemi.intensity; saved.sun = sun.intensity;
      scene.background.set(0x1a0e2a); scene.fog.color.set(0x1a0e2a); scene.fog.near = 30; scene.fog.far = 70; hemi.intensity = 0.55; sun.intensity = 0.9;
      lights.forEach(([l, k]) => { l.intensity = k; });
      setBounds({ x0: OX - 6, x1: OX + 58, z0: -24, z1: 10 });
      lootAtStart = state.loot || 0;
      resetFloor();
      setArea('KAASLAND · SPEKBUURT');
      $('objective').innerHTML = state.spekbuurt ? 'Spekbuurt is <b>yours</b>. Shop setup comes in a later build. Drive home in the <b>Oofmobiel</b>.' : 'Take <b>Snackpaleis Spekbuurt</b> from the Lampas. Clear the restaurant, then the back of house. <span style="color:#ffd36b">Leave nobody standing.</span>';
      fade.style.opacity = '0';
      if (!state.spekbuurt) toast('SPEKBUURT', 'Lampas territory. Mouse to aim · click / F attack · E grab · 1 / 2 weapons · R restart', 4.5);
    }, 480);
  }
  function exit() {
    fade.style.opacity = '1';
    setTimeout(() => {
      M.active = false; clearPlayerSplats();
      scene.background.copy(saved.bg); scene.fog.color.copy(saved.fog[0]); scene.fog.near = saved.fog[1]; scene.fog.far = saved.fog[2]; hemi.intensity = saved.hemi; sun.intensity = saved.sun;
      lights.forEach(([l]) => { l.intensity = 0; });
      setBounds(null);
      // keep what you picked up; the gun goes back in the kit
      lootAtStart = state.loot || 0;
      handGun.clear(); handGun.visible = false; P.gun = null; maboota.visible = state.armed = true; equip(true);
      player.userData.body.rotation.x = 0; player.userData.body.position.y = 0;
      player.position.set(5.3, 0, -5.8); player.rotation.y = Math.PI;
      setArea('KAASLAND · DE NATTE WORST'); hud(); over.style.display = 'none';
      updateObjective();
      fade.style.opacity = '0';
    }, 480);
  }
  addInteract({ obj: van, pos: () => van.position, r: 4.2, enabled: () => M.active && !P.dead, label: () => state.spekbuurt ? 'Oofmobiel · drive home' : 'Oofmobiel · retreat to De Natte Worst', act: exit });
  addInteract({ obj: backDoor, pos: () => L(25.8, -10), r: 1.4, enabled: () => false, label: () => '', act: () => {} });

  function cleared() {
    state.spekbuurt = true; state.raids = (state.raids || 0) + 1;
    state.spekbuurtLootTaken = lootCrates.map((l, i) => (l.taken ? i : -1)).filter((i) => i >= 0);
    toast('SPEKBUURT UNLOCKED', 'The Lampas are out. Grab the spice crates, then drive home. You\'ll set up shop here later.', 5);
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.22, 'triangle', 0.06), i * 140));
    $('objective').innerHTML = '<b style="color:#6ed36e">Spekbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.';
    hud();
  }
  function die(line) {
    if (P.dead) return;
    if (P.armour > 0 && line !== 'melee') { P.armour--; toast('VEST', 'The vest took that one.', 1.2); beep(400, 0.1, 'square', 0.05); hud(); return; }
    P.dead = true; P.deadT = 0; blood(player.position, 1.3);
    beep(80, 0.5, 'sawtooth', 0.08);
    over.innerHTML = 'JE BENT DOOD<div style="font:700 20px Arial;color:#fff;margin-top:12px;text-shadow:0 2px 0 #000">Press R or Backspace to try again</div>';
    over.style.display = 'flex';
  }
  function hitEnemy(e, dir, melee) {
    const f = e.userData.foe; if (f.dead) return;
    f.hp -= 1; f.alert = 1; f.seen = player.position.clone();
    if (f.hp > 0) { say(e.userData.bubble, 'AU! Is dat alles?!', '#ff7a1a'); beep(200, 0.08, 'square', 0.05); return; }
    f.dead = true; f.wm.visible = false; e.userData.bubble.visible = false;
    const u = e.userData; u.body.rotation.x = -1.5; u.body.position.y = 0.12; e.rotation.y = Math.atan2(-dir.x, -dir.z);
    blood(e.position, f.boss ? 1.5 : 1.1);
    drop(f.weapon, e.position.clone().add(new THREE.Vector3(dir.x * 0.8, 0, dir.z * 0.8)));
    beep(melee ? 90 : 70, 0.2, 'square', 0.07);
    if (f.boss) toast('THE MANAGER IS DOWN', 'Jan van Kaas won\'t like this.', 2);
    hud();
    if (enemies.every((x) => x.userData.foe.dead)) setTimeout(cleared, 600);
  }

  // ------------------------------------------------------------------ input (runs before main.js handlers while the mission is active)
  const mouseN = new THREE.Vector2(), rc = new THREE.Raycaster(), aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1), aim = new THREE.Vector3();
  addEventListener('mousemove', (e) => { mouseN.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); });
  function attack() {
    if (P.dead || state.inDialogue || state.inPC) return;
    if (P.slot === 1 || !P.gun) { ctx.swing(); noise(player.position, 4); return; }
    if (P.fireT > 0) return;
    if (P.gun.ammo <= 0) { beep(900, 0.03, 'square', 0.03); toast('EMPTY', 'Switch to the Maboota (1) or grab another gun (E).', 1.2); return; }
    P.gun.ammo--; P.fireT = WEAPONS[P.gun.id].rate;
    const d = new THREE.Vector3(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
    shoot(player.position.clone().addScaledVector(d, 0.5), d, P.gun.id, true);
    player.userData.arms[0].rotation.x = -1.3; hud();
  }
  function grab() {
    if (P.dead) return false;
    // loot first
    for (const [i, l] of lootCrates.entries()) if (!l.taken && l.c.position.distanceTo(player.position.clone().setY(0.28)) < 1.3) {
      l.taken = true; l.c.visible = l.glow.visible = false; state.loot = (state.loot || 0) + 1;
      if (state.spekbuurt) { state.spekbuurtLootTaken = state.spekbuurtLootTaken || []; state.spekbuurtLootTaken.push(i); }
      toast('+1 CRATE OF LAMPAS SPICE', 'Sell it on Kaasplaats (PC) for W 150.', 1.8); beep(880, 0.06, 'triangle'); hud(); return true;
    }
    let best = null, bd = 1.3;
    for (const d of drops) { const k = d.g.position.distanceTo(player.position.clone().setY(0.08)); if (k < bd) { bd = k; best = d; } }
    if (!best) return false;
    const W = WEAPONS[best.id];
    root.remove(best.g, best.ring); drops.splice(drops.indexOf(best), 1);
    if (W.melee) { toast(W.name, 'You keep the Maboota. (Bats are for amateurs.)', 1.2); return true; }
    if (P.gun) drop(P.gun.id, player.position, P.gun.ammo);
    setGun({ id: best.id, ammo: best.ammo }); selectSlot(2); beep(500, 0.06, 'square', 0.04);
    return true;
  }
  addEventListener('keydown', (e) => {
    if (!M.active || state.inDialogue || state.inPC) return;
    const stop = () => { e.stopImmediatePropagation(); e.preventDefault(); };
    if (e.code === 'KeyR' || e.code === 'Backspace') { if (!state.spekbuurt) { stop(); resetFloor(); } return; }
    if (P.dead) { stop(); return; }
    if (e.code === 'Digit1' || e.code === 'Numpad1') { stop(); selectSlot(1); }
    else if (e.code === 'Digit2' || e.code === 'Numpad2') { stop(); selectSlot(2); }
    else if (e.code === 'KeyF') { stop(); attack(); }
    else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') { if (grab()) stop(); }
  }, true);
  addEventListener('pointerdown', (e) => {
    if (!M.active || state.inDialogue || state.inPC || e.target !== ctx.canvas) return;
    e.stopImmediatePropagation(); if (e.button === 2) { grab(); return; } attack();
  }, true);
  ctx.canvas.addEventListener('contextmenu', (e) => { if (M.active) e.preventDefault(); });

  // ------------------------------------------------------------------ update (called from main.js tick while active)
  function update(dt) {
    hud.t = (hud.t || 0) + dt;
    // aim at the mouse
    if (!P.dead) {
      rc.setFromCamera(mouseN, camera);
      if (rc.ray.intersectPlane(aimPlane, aim)) player.rotation.y = Math.atan2(aim.x - player.position.x, aim.z - player.position.z);
      if (P.slot === 2) { const a = player.userData.arms[0]; a.rotation.x += (-1.45 - a.rotation.x) * Math.min(1, dt * 12); a.rotation.z = 0; }
    } else {
      P.deadT += dt; const u = player.userData; u.body.rotation.x = Math.max(-1.5, -P.deadT * 6); u.body.position.y = 0.1;
    }
    P.fireT -= dt;
    // the back door swings open when anyone is near
    const near = [player, ...enemies.filter((e) => !e.userData.foe.dead)].some((p) => Math.abs(p.position.x - (OX + 25.8)) < 1.2 && Math.abs(p.position.z + 10) < 1.3);
    backDoor.rotation.y += ((near ? -1.6 : 0) - backDoor.rotation.y) * Math.min(1, dt * 8);
    doner.rotation.y += dt * 0.8; spice.rotation.y += dt;
    for (const l of lootCrates) if (!l.taken) l.glow.material.opacity = 0.4 + Math.sin(performance.now() * 0.006) * 0.3;
    // enemies
    for (const e of enemies) {
      const f = e.userData.foe; if (f.dead || !e.visible) continue;
      f.aimArm = false; const u = e.userData; u.bubble.userData.life > 0 && (u.bubble.userData.life -= dt) <= 0 && (u.bubble.visible = false);
      const toP = player.position.clone().sub(e.position); toP.y = 0; const dist = toP.length();
      const face = new THREE.Vector3(Math.sin(e.rotation.y), 0, Math.cos(e.rotation.y));
      const sees = !P.dead && dist < 16 && (f.alert || (dist < 3 || face.dot(toP.clone().normalize()) > 0.35)) && !lineBlocked(e.position, player.position);
      if (sees) { if (!f.alert) { f.react = 0.45; f.shout = 1; } f.alert = 1; f.seen = player.position.clone(); }
      if (f.shout) { f.shout = 0; say(u.bubble, ALERT_LINES[Math.floor(Math.random() * ALERT_LINES.length)], '#ff7a1a'); }
      let speed = 0;
      if (f.alert && !P.dead) {
        f.react -= dt;
        const W = WEAPONS[f.weapon];
        const wantClose = W.melee ? 1.1 : (sees ? 7 : 0.5);
        if (sees) e.rotation.y += Math.atan2(Math.sin(Math.atan2(toP.x, toP.z) - e.rotation.y), Math.cos(Math.atan2(toP.x, toP.z) - e.rotation.y)) * Math.min(1, dt * 8);
        if (!W.melee && sees && f.react <= 0) {
          f.fireT -= dt; f.aimArm = true;
          if (f.fireT <= 0) { f.fireT = f.weapon === 'shotgun' ? 1.3 : 0.85 + Math.random() * 0.3; const d = toP.clone().normalize(); shoot(e.position.clone().addScaledVector(d, 0.5), d, f.weapon, false); }
        }
        if (W.melee && dist < 1.5 && f.react <= 0) {
          f.attackT += dt;
          if (f.attackT > 0.38) { f.attackT = 0; if (player.position.distanceTo(e.position) < 1.6) die('melee'); beep(160, 0.1, 'sawtooth', 0.05); }
        } else f.attackT = 0;
        // move: chase (melee) or close in until in sight (guns)
        if (dist > wantClose) {
          f.pathT -= dt;
          if (f.pathT <= 0 || !f.path || !f.path.length) { f.pathT = 0.45; f.path = sees && W.melee ? [player.position.clone()] : path(e.position, f.seen || player.position); }
          if (f.path && f.path.length) {
            const tgt = f.path[0], d = tgt.clone().sub(e.position); d.y = 0; const Ld = d.length();
            if (Ld < 0.3) f.path.shift(); else { speed = W.melee ? 3.9 : 2.8; d.normalize(); e.position.addScaledVector(d, speed * dt); if (!sees) e.rotation.y = Math.atan2(d.x, d.z); }
          }
        }
      }
      ctx.collide(e.position, 0.34);
      animate(e, speed, dt);
      if (f.aimArm) u.arms[0].rotation.x = -1.45;
      else if (f.attackT > 0) u.arms[0].rotation.x = -2.6 + f.attackT * 6;
    }
    // bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]; b.life -= dt; let gone = b.life <= 0;
      const steps = Math.ceil(Math.hypot(b.vx, b.vz) * dt / 0.25);
      for (let s = 0; s < steps && !gone; s++) {
        b.m.position.x += b.vx * dt / steps; b.m.position.z += b.vz * dt / steps;
        if (inWall(b.m.position)) { gone = true; break; }
        if (b.byPlayer) { for (const e of enemies) { const f = e.userData.foe; if (!f.dead && e.visible && Math.hypot(e.position.x - b.m.position.x, e.position.z - b.m.position.z) < 0.45) { hitEnemy(e, new THREE.Vector3(b.vx, 0, b.vz).normalize(), false); gone = true; break; } } }
        else if (!P.dead && Math.hypot(player.position.x - b.m.position.x, player.position.z - b.m.position.z) < 0.4) { die('bullet'); gone = true; }
      }
      if (gone) { root.remove(b.m); bullets.splice(i, 1); }
    }
  }
  // melee from main.js swing(): hit enemies in front
  function melee(f) {
    for (const e of enemies) {
      const fo = e.userData.foe; if (fo.dead || !e.visible) continue;
      const d = e.position.clone().sub(player.position); d.y = 0;
      if (d.length() < 1.7 && d.normalize().dot(f) > 0.2) hitEnemy(e, f, true);
    }
  }
  function cameraFor(zoom) { // Hotline-style: high, steep, leaning a little towards the mouse
    const lean = P.dead ? new THREE.Vector3() : aim.clone().sub(player.position).setY(0).clampLength(0, 6).multiplyScalar(0.3);
    const look = player.position.clone().add(lean).setY(0.8);
    return { pos: look.clone().add(new THREE.Vector3(0, 17 * zoom, 3.6 * zoom)), look };
  }
  buildGrid();
  Object.assign(M, { enter, exit, update, melee, cameraFor, frozen: () => P.dead, enemies, _hit: (e) => hitEnemy(e, new THREE.Vector3(0, 0, 1), true), _die: die, resetFloor, P, lootCrates, OX, L });
  return M;
}
