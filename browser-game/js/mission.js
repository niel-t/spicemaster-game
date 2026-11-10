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

  // ================================================================== SWING DOORS (Neon Vice: run into a door to swing it; a fast door knocks people flat)
  const DOOR_LEN = 1.6, doors = [];
  const doorM = lam({ color: 0x8a1a2a }), doorM2 = lam({ color: 0x5a3a6a }), portM = lam({ color: 0x9ad0ff });
  function addDoor(hx, hz, base, sign) {
    const g = new THREE.Group(); g.position.set(OX + hx, 0, hz); g.rotation.y = base; root.add(g);
    box(DOOR_LEN - 0.04, 2.05, 0.07, sign ? doorM : doorM2, DOOR_LEN / 2, 1.03, 0, g, false);
    const p = new THREE.Mesh(new THREE.CircleGeometry(0.17, 14), portM); p.position.set(DOOR_LEN / 2, 1.5, 0.04); g.add(p);
    const p2 = p.clone(); p2.rotation.y = Math.PI; p2.position.z = -0.04; g.add(p2);
    if (sign) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.28), lam({ map: signTex([{ t: sign, size: 40 }], '#1a1a1a', '#ffd23a', 256, 64) })); s.position.set(DOOR_LEN / 2, 1.9, 0.045); g.add(s); }
    const d = { g, hx: OX + hx, hz, base, th: 0, w: 0, pusher: '' }; doors.push(d); return d;
  }
  const doorEnd = (d) => { const a = d.base + d.th; return [d.hx + Math.cos(a) * DOOR_LEN, d.hz - Math.sin(a) * DOOR_LEN]; };
  // door gaps (see the walls above): z -10 row, z -13 row
  addDoor(25, -10, 0, 'PERSONEEL'); addDoor(6, -10, 0); addDoor(30, -10, 0); addDoor(40, -10, 0);
  for (const x of [9, 18, 26, 34, 43]) addDoor(x, -13, 0);
  function segDist(px, pz, ax, az, bx, bz) { const sx = bx - ax, sz = bz - az; let t = ((px - ax) * sx + (pz - az) * sz) / (sx * sx + sz * sz); t = Math.max(0, Math.min(1, t)); const cx = ax + sx * t, cz = az + sz * t; return [Math.hypot(px - cx, pz - cz), cx, cz]; }
  function segInt(ax, az, bx, bz, cx, cz, dx, dz) { const d = (bx - ax) * (dz - cz) - (bz - az) * (dx - cx); if (Math.abs(d) < 1e-9) return false; const u = ((cx - ax) * (dz - cz) - (cz - az) * (dx - cx)) / d, v = ((cx - ax) * (bz - az) - (cz - az) * (bx - ax)) / d; return u >= 0 && u <= 1 && v >= 0 && v <= 1; }
  // characters push doors open and get pushed off them
  function collideDoors(p, r, vx, vz, isP) {
    for (const d of doors) {
      const e = doorEnd(d), [dist, cx, cz] = segDist(p.x, p.z, d.hx, d.hz, e[0], e[1]);
      if (dist >= r) continue;
      const nx = (p.x - cx) / (dist || 1), nz = (p.z - cz) / (dist || 1);
      p.x = cx + nx * r; p.z = cz + nz * r;
      // which way does the door swing? door normal (rotated +x by a) is (sin a, cos a) in x/z
      const a = d.base + d.th, dnx = Math.sin(a), dnz = Math.cos(a), side = Math.sign(nx * dnx + nz * dnz) || 1;
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
  const losClear = (a, b) => !lineBlocked(a, b) && !doorBlocks(a.x, a.z, b.x, b.z);

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
    empty: () => beep(900, 0.03, 'square', 0.03),
    cash: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.06), i * 110)),
  }[k] || (() => {}))();

  // ================================================================== WEAPONS (numbers from Neon Vice's WD table, Easy difficulty)
  const WD = {
    maboota: { name: 'MABOOTA', melee: true, knock: true },
    fists: { name: 'FISTS', melee: true, knock: true },
    bat: { name: 'HONKBALKNUPPEL', melee: true, kill: true },
    makarov: { name: 'MAKAROV', ammo: 8, cd: 0.2, pel: 1, spr: 0.025, mv: 0.07, bloom: 0.04, ecd: 0.8, loud: 13, kick: 0.1, snd: 'pistol' },
    shotgun: { name: 'SAWN-OFF', ammo: 6, cd: 0.75, pel: 7, spr: 0.26, mv: 0.04, bloom: 0, ecd: 1.2, loud: 16, kick: 0.4, snd: 'shotgun' },
  };
  const KILLPTS = { maboota: 450, bat: 450, fists: 500, exec: 800, door: 600, throw: 550, makarov: 300, shotgun: 300 };
  const FORCE = { makarov: 4.5, shotgun: 9.5, bat: 6.5, maboota: 5.5, fists: 5.5, exec: 1, throw: 5, door: 6 };
  const EASY = { hp: 3, react: 1.9, espr: 0.17, ebSpd: 15, vision: 9, cone: 0.85, ecd: 1.5, regen: 7 };
  const TIPS = ['Red laser = a Lampas is aiming at you. Break line of sight.', 'Stand still for accurate shots. Running throws your aim off.', 'Run into a door to swing it. A fast door knocks people flat.', 'The Maboota knocks people down. Hit a downed Lampas again to finish him.', 'Out of ammo? Attack again to throw the gun. It knocks people down.', 'Gunshots wake up the whole floor. The Maboota is quiet.', 'Downed Lampas get back up. Don\'t walk away from them.', 'Sprinting (Shift) is fast but loud. They hear your footsteps.'];
  function weaponMesh(id) {
    const g = new THREE.Group();
    if (id === 'bat') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.025, 0.85, 8), lam({ color: 0xc8a06a })); b.position.y = -0.4; g.add(b); }
    if (id === 'makarov') { box(0.05, 0.1, 0.26, lam({ color: 0x1a1a1a }), 0, -0.05, 0.1, g, false); box(0.05, 0.14, 0.07, lam({ color: 0x3a2a1a }), 0, -0.1, 0, g, false); }
    if (id === 'shotgun') { box(0.06, 0.07, 0.8, lam({ color: 0x1a1a1a }), 0, -0.03, 0.3, g, false); box(0.07, 0.11, 0.3, lam({ color: 0x6a3a1a }), 0, -0.06, -0.12, g, false); }
    return g;
  }
  const isGun = (id) => id && !WD[id].melee;

  // ================================================================== THE PLAYER'S KIT (shared by the street and the missions)
  // slot 1 = Maboota (always), slot 2 = held weapon: a bought one from The Russian or one picked up in a level.
  state.ammo = state.ammo || {};
  const P = { slot: 1, held: null, hp: EASY.hp, maxhp: EASY.hp, armor: 0, invT: 0, lastHurt: 0, dead: false, deadT: 0, fireT: 0, bloom: 0, exec: 0, cause: '', vx: 0, vz: 0, last: new THREE.Vector3() };
  const handGun = new THREE.Group(); handGun.position.set(0, -0.68, 0.05); handGun.visible = false; player.userData.arms[0].add(handGun);
  const owned = () => ['shotgun', 'makarov', 'bat'].filter((k) => state.kit.includes(k));
  function setHeld(h) { P.held = h; handGun.clear(); if (h) handGun.add(weaponMesh(h.id)); hud(); }
  function ownWeapon(id) { return { id, ammo: isGun(id) ? (state.ammo[id] || 0) : 0, own: true }; }
  function saveOwnAmmo() { if (P.held && P.held.own && isGun(P.held.id)) state.ammo[P.held.id] = P.held.ammo; }
  function selectSlot(n) {
    if (n === 2) {
      const o = owned().filter((k) => !items.some((it) => it.own && it.id === k)); // a bought gun you threw is on the floor: go get it
      if (!P.held && !o.length) { toast('NO WEAPON IN SLOT 2', M.active ? 'Grab one from a Lampas (E), or buy one from The Russian.' : 'Buy one from The Russian (Pandjeshuis Spasibo).', 1.6); return; }
      if (P.slot === 2 && P.held && P.held.own && o.length > 1) { saveOwnAmmo(); setHeld(ownWeapon(o[(o.indexOf(P.held.id) + 1) % o.length])); } // press 2 again: cycle what you own
      else if (!P.held) setHeld(ownWeapon(o[0]));
    }
    P.slot = n; maboota.visible = n === 1; handGun.visible = n === 2;
    state.armed = n === 1 || (P.held && WD[P.held.id].melee);
    $('weapon').className = 'hud on'; hud(); beep(300, 0.05, 'square', 0.03);
  }
  const gunOut = () => P.slot === 2 && P.held && isGun(P.held.id);
  function holster() { saveOwnAmmo(); P.slot = 1; handGun.visible = false; }

  // ================================================================== FX: popups, shake, flash, hitstop, blood, casings, muzzle flash
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
  function bloodBurst(at, dir, n, spd) {
    const base = Math.atan2(dir[0], dir[1]);
    for (let i = 0; i < n && parts.length < 400; i++) {
      const a = base + (Math.random() - 0.5) * 1.6, s = (0.25 + Math.random() * 0.75) * spd;
      const m = new THREE.Mesh(partGeo, bloodMs[i % 3]); m.scale.setScalar(0.04 + Math.random() * 0.05); m.position.set(at.x, 0.7 + Math.random() * 0.3, at.z); root.add(m);
      parts.push({ m, vx: Math.sin(a) * s, vy: 0.3 + Math.random() * 3.7, vz: Math.cos(a) * s, life: 3, blood: true });
    }
  }
  const casingM = new THREE.MeshBasicMaterial({ color: 0xd0a040 }), shellM = new THREE.MeshBasicMaterial({ color: 0xc8202a });
  function casing(at, a, shell) {
    const m = new THREE.Mesh(partGeo, shell ? shellM : casingM); m.scale.set(0.03, 0.03, shell ? 0.09 : 0.05); m.position.set(at.x, 1.1, at.z); root.add(m);
    const side = a + Math.PI / 2; parts.push({ m, vx: Math.sin(side) * (1.5 + Math.random()), vy: 1.5 + Math.random(), vz: Math.cos(side) * (1.5 + Math.random()), life: 30, casing: true });
  }
  const decalGeo = new THREE.PlaneGeometry(1, 1);
  const bloodTex = canvasTex(64, 64, (g) => { g.fillStyle = '#8a0a12'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(32 + (Math.random() - 0.5) * 30, 32 + (Math.random() - 0.5) * 30, 5 + Math.random() * 10, 0, 7); g.fill(); } });
  const smearTex = canvasTex(64, 32, (g) => { const gr = g.createLinearGradient(0, 0, 64, 0); gr.addColorStop(0, 'rgba(138,10,18,0)'); gr.addColorStop(0.3, 'rgba(138,10,18,.9)'); gr.addColorStop(1, 'rgba(138,10,18,.6)'); g.fillStyle = gr; g.fillRect(0, 8, 64, 16); });
  const decalM = new THREE.MeshBasicMaterial({ map: bloodTex, transparent: true, depthWrite: false }), smearM = new THREE.MeshBasicMaterial({ map: smearTex, transparent: true, depthWrite: false });
  const decals = [];
  function floorDecal(x, z, s, rot, mat = decalM) { if (decals.length > 260) root.remove(decals.shift()); const m = new THREE.Mesh(decalGeo, mat); m.scale.set(s, s, 1); m.rotation.set(-Math.PI / 2, 0, rot); m.position.set(x, 0.03 + (decals.length % 50) * 0.0004, z); root.add(m); decals.push(m); }
  function wallSplat(at, nx, nz) { if (decals.length > 260) root.remove(decals.shift()); const m = new THREE.Mesh(decalGeo, decalM); m.scale.setScalar(0.6 + Math.random() * 0.5); m.position.set(at.x - nx * 0.05, 0.4 + Math.random() * 0.8, at.z - nz * 0.05); m.lookAt(m.position.x + nx, m.position.y, m.position.z + nz); root.add(m); decals.push(m); }
  const flashL = new THREE.PointLight(0xffd080, 0, 9, 1.5); root.add(flashL); let flashT = 0;
  const flashSp = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe0a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flashSp.scale.setScalar(0.7); flashSp.visible = false; root.add(flashSp);
  function muzzle(at) { flashL.position.set(at.x, 1.3, at.z); flashL.intensity = 4; flashSp.position.set(at.x, 1.25, at.z); flashSp.visible = true; flashT = 0.06; }

  // ================================================================== ENEMIES (the Lampas)
  const LAMPAS_LOOKS = [
    { front: '#e8641as', shirt: 0xe8641a, pants: 0x2a2a3a }, { front: '#2a1a12', shirt: 0x2a1a12, pants: 0x1a1a22 },
    { front: '#f2efe6', shirt: 0xf2efe6, pants: 0xe8641a }, { front: '#ff7a1a', shirt: 0xff7a1a, pants: 0xf2efe6 },
  ];
  const SPAWNS = [ // x, z, weapon, facing (radians, 0 = +z/south), room, boss
    [15, -5, 'bat', 0, 'restaurant'], [22, -4, 'makarov', Math.PI, 'restaurant'], [25.8, -7.8, 'bat', Math.PI, 'restaurant'], [17, -7.9, 'makarov', 0, 'restaurant'],
    [20, -11.5, 'bat', Math.PI / 2, 'hallway'],
    [7.2, -15, 'makarov', 0, 'casino'], [9.8, -20.3, 'bat', Math.PI / 2, 'casino'], [12.8, -16, 'bat', -Math.PI / 2, 'casino'],
    [19, -22.6, 'shotgun', 0, 'office', true], [16.5, -15.2, 'makarov', Math.PI / 2, 'office'],
    [25, -18, 'bat', 0, 'gym'], [28.5, -19.5, null, -Math.PI / 2, 'gym'],
    [33.5, -19.5, 'makarov', 0, 'warehouse'], [45.6, -16, 'bat', -Math.PI / 2, 'warehouse'], [40, -21.5, 'shotgun', 0, 'warehouse'],
    [32.8, -7.4, 'bat', Math.PI, 'mixing'],
    [36.6, -2.0, 'makarov', Math.PI, 'garage'], [46, -7, 'bat', -Math.PI / 2, 'garage'],
    [9.6, -6.5, null, Math.PI / 2, 'lounge'], [6.2, -4.4, 'makarov', Math.PI, 'lounge'],
  ];
  const enemies = [];
  const laserM = new THREE.MeshBasicMaterial({ color: 0xff1030, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  SPAWNS.forEach(([x, z, w, rot, room, boss], i) => {
    const look = LAMPAS_LOOKS[i % LAMPAS_LOOKS.length];
    const head = boss
      ? { skin: 0xf0c8a8, hair: '#d8c080', brow: '#a89060', hairLine: 80, sideLine: 116, backLine: 150, mouth: 'smile', glasses: true, iris: '#3a5a7a' }
      : { skin: [0xf0c8a8, 0xe0a882, 0xf4d2bc, 0xd8a080][i % 4], hair: ['#2a2a2a', '#d8c080', '#7a5a30', '#1a1a1a'][i % 4], brow: '#3a2a1a', hairLine: i % 3 === 0 ? 40 : 96, sideLine: 120, backLine: 150, mouth: 'smile', iris: '#3a3a3a' };
    const p = makePerson({ head, ballcap: i % 5 === 2 ? 0xff7a1a : undefined, front: boss ? '#f2efe6' : look.front, shirt: boss ? 0xf2efe6 : look.shirt, pants: boss ? 0xf2efe6 : look.pants, shoes: 0x111111, belly: boss ? 1.2 : (i % 3) * 0.4, skin: head.skin, chain: boss || i % 4 === 1, scale: boss ? 1.08 : 1 });
    scene.remove(p); root.add(p);
    const hand = new THREE.Group(); hand.position.set(0, -0.68, 0.05); p.userData.arms[0].add(hand);
    const laser = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 1), laserM.clone()); laser.visible = false; root.add(laser);
    p.userData.foe = { id: i, spawn: [x, z, rot, w], room, boss: !!boss, hand, laser, pers: ['rush', 'careful', 'normal'][i % 3] };
    p.userData.bubble = bubble(); p.add(p.userData.bubble); p.userData.bubble.position.set(0, 2.5, 0);
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
  for (const [x, z] of [[31.2, -14.2], [32.2, -14.2], [37, -15.8], [46.8, -21.6], [46.8, -20.6], [29, -1.2]]) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.55, 0.7), crateM); c.position.set(OX + x, 0.28, z); c.castShadow = true; root.add(c);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.6, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.7 })); glow.rotation.x = -Math.PI / 2; glow.position.set(OX + x, 0.04, z); root.add(glow);
    lootCrates.push({ c, glow, taken: false });
  }

  // ================================================================== BULLETS
  const bullets = [];
  const tracerM = [new THREE.MeshBasicMaterial({ color: 0xfff0a0 }), new THREE.MeshBasicMaterial({ color: 0xff5a3a })];
  function fireGun(from, a, id, byPlayer, moving) {
    const W = WD[id], muz = new THREE.Vector3(from.x + Math.sin(a) * 0.6, 0, from.z + Math.cos(a) * 0.6);
    const spr = byPlayer ? W.spr + (moving ? W.mv : 0) + P.bloom : EASY.espr * (W.pel > 1 ? 1.6 : 1);
    for (let i = 0; i < W.pel; i++) {
      const aa = a + (Math.random() - 0.5) * spr * 2, sp = byPlayer ? 40 : EASY.ebSpd;
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, byPlayer ? 0.7 : 0.45), tracerM[byPlayer ? 0 : 1]);
      m.position.set(muz.x, 1.25, muz.z); m.rotation.y = aa; root.add(m);
      bullets.push({ m, vx: Math.sin(aa) * sp, vz: Math.cos(aa) * sp, byPlayer, id, life: 1.4, pierce: 1 });
    }
    muzzle(muz); casing(from, a, id === 'shotgun');
    sfx(byPlayer ? W.snd : 'epistol'); if (id === 'shotgun' && !byPlayer) sfx('shotgun');
    if (byPlayer) { P.bloom = Math.min(0.2, P.bloom + W.bloom); shake(W.kick * 1.2); FX.kick.set(-Math.sin(a) * W.kick * 0.6, 0, -Math.cos(a) * W.kick * 0.6); }
    alertNoise(from, W.loud);
  }
  function alertNoise(at, r) {
    if (!M.active || r < 1) return;
    for (const e of enemies) { const f = e.userData.foe; if (!f.alive || f.down > 0 || f.state === 'chase') continue;
      if (e.position.distanceTo(at) < r) { f.state = 'search'; f.sx = at.x; f.sz = at.z; f.searchT = 0; f.path = null; } }
  }

  // ================================================================== HUD + Neon Vice-style screens
  const css = document.createElement('style'); css.textContent = `
    .nv{font-family:'Press Start 2P',ui-monospace,monospace}.nv2{font-family:'VT323',ui-monospace,monospace}
    #nvHud{position:fixed;left:22px;bottom:20px;z-index:5;display:none;color:#fff;text-shadow:2px 2px 0 #000}
    #nvHud .hp{font-size:22px;letter-spacing:4px;color:#ff2a3a;text-shadow:2px 2px 0 #000,0 0 10px #ff0030}
    #nvHud .hp i{font-style:normal;color:rgba(255,255,255,.2)}
    #nvHud .w{font-size:11px;margin-top:8px}#nvHud .w span{margin-right:12px}
    #nvScore{position:fixed;right:24px;top:70px;z-index:5;display:none;text-align:right;color:#ff5fb8;text-shadow:3px 3px 0 #2de2e6,5px 5px 0 #3a0b4f;font-size:20px}
    #nvScore .c{font-size:14px;color:#ffd36b;text-shadow:2px 2px 0 #000;margin-top:8px}#nvScore .l{font-size:10px;color:#2de2e6;text-shadow:2px 2px 0 #000;margin-top:8px}
    #nvGrain{position:fixed;inset:0;pointer-events:none;z-index:4;display:none;opacity:.22;mix-blend-mode:overlay;background-size:160px 160px;animation:nvg .25s steps(4) infinite}
    #nvScan{position:fixed;inset:0;pointer-events:none;z-index:4;display:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)}
    @keyframes nvg{0%{background-position:0 0}25%{background-position:-40px 30px}50%{background-position:30px -50px}75%{background-position:-60px -20px}100%{background-position:10px 40px}}
    #nvVig{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0}
    #nvFlash{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0}
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
    #nvBanner .b2{font-family:'VT323',monospace;font-size:24px;color:#fff;margin-top:10px;text-shadow:2px 2px 0 #000}`;
  document.head.appendChild(css);
  if (!document.querySelector('link[data-nvfont]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.nvfont = 1; l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap'; document.head.appendChild(l); }
  const mk = (id, cls = '') => { const d = document.createElement('div'); d.id = id; d.className = cls; document.body.appendChild(d); return d; };
  const hudEl = mk('nvHud', 'nv'), scoreEl = mk('nvScore', 'nv'), grainEl = mk('nvGrain'), scanEl = mk('nvScan'), vigEl = mk('nvVig'), flashEl = mk('nvFlash'), screenEl = mk('nvScreen'), bannerEl = mk('nvBanner');
  { const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'), id = g.createImageData(160, 160); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); grainEl.style.backgroundImage = `url(${c.toDataURL()})`; }
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#0a0410;opacity:0;pointer-events:none;transition:opacity .45s;z-index:30'; document.body.appendChild(fade);
  let bannerT = 0;
  function banner(a, b, t = 3) { bannerEl.innerHTML = `<div class="b1">${a}</div><div class="b2">${b || ''}</div>`; bannerEl.style.opacity = 1; bannerT = t; }
  function weaponLabel() {
    const h = P.held; if (!h) return owned().length ? '[2] ' + WD[owned()[0]].name : '[2] —';
    return '[2] ' + WD[h.id].name + (isGun(h.id) ? ' ' + h.ammo : '');
  }
  function hud() {
    // the street HUD box (bottom right)
    const wbox = $('weapon');
    if (wbox) wbox.style.visibility = M.active ? 'hidden' : 'visible';
    if (wbox && state.kit.includes('maboota')) wbox.innerHTML = `<span style="color:${P.slot === 1 && state.armed ? '#ff3fa4' : '#888'}">[1] MABOOTA</span>${(P.held || owned().length) ? `<br><span style="color:${P.slot === 2 ? '#3ff0ff' : '#888'}">${weaponLabel()}</span>` : ''}`;
    const on = M.active; hudEl.style.display = scoreEl.style.display = grainEl.style.display = scanEl.style.display = on ? 'block' : 'none';
    if (!on) return;
    let hp = ''; for (let i = 0; i < P.maxhp; i++) hp += i < P.hp ? '♥' : '<i>♥</i>';
    hudEl.innerHTML = `<div class="hp">${hp}${P.armor ? ' <span style="color:#ffd23a;font-size:12px">VEST</span>' : ''}</div><div class="w"><span style="color:${P.slot === 1 ? '#ff3fa4' : '#777'}">[1] MABOOTA</span><span style="color:${P.slot === 2 ? '#3ff0ff' : '#777'}">${weaponLabel()}</span></div><div class="w" style="color:#ff7a1a">LAMPAS LEFT: ${alive().length}${state.loot ? ` <span style="color:#ffd23a;margin-left:10px">SPICE ×${state.loot}</span>` : ''}</div>`;
    scoreEl.innerHTML = `W ${R.score.toLocaleString('nl-NL')}${R.combo > 1 ? `<div class="c">${R.combo}× COMBO</div>` : ''}<div class="l">KAASLAND · SPEKBUURT</div>`;
  }
  function showScreen(html) { screenEl.innerHTML = html; screenEl.style.display = 'flex'; bannerEl.style.opacity = 0; bannerT = 0; const t = $('toast'); if (t) t.style.display = 'none'; }
  function hideScreen() { screenEl.style.display = 'none'; }

  // ================================================================== RUN STATE
  const M = { active: false };
  const R = { score: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, execs: 0, shots: 0, hits: 0, taken: 0, time: 0, cleared: false, results: false, ammoAtStart: {}, lootAtStart: 0, lastOneShown: false };
  const saved = {};
  function resetFloor() {
    const done = !!state.spekbuurt;
    for (const e of enemies) {
      const f = e.userData.foe, [x, z, r, w] = f.spawn, u = e.userData;
      Object.assign(f, { alive: !done, down: 0, hp: f.boss ? 2 : 1, state: 'idle', react: 0, cd: 0, wind: 0, seeT: 99, path: null, pathT: 0, sx: 0, sz: 0, searchT: 0, turnT: Math.random() * 3, ta: r, vx: 0, vz: 0, lkx: 0, lkz: 0, found: false, wary: false, aiming: false, strT: 0, strD: 1, atkT: 0, body: false, mvx: 0, mvz: 0 });
      setFoeWeapon(e, done ? null : w);
      e.position.set(OX + x, 0, z); e.rotation.y = r; e.visible = !done; u.body.rotation.set(0, 0, 0); u.body.position.y = 0; u.bubble.visible = false; f.laser.visible = false;
    }
    for (const it of items) root.remove(it.g, it.ring); items.length = 0;
    for (const b of bullets) root.remove(b.m); bullets.length = 0;
    for (const p of parts) root.remove(p.m); parts.length = 0;
    for (const d of decals) root.remove(d); decals.length = 0;
    for (const d of doors) { d.th = 0; d.w = 0; d.g.rotation.y = d.base; }
    for (const p of pops) p.el.remove(); pops.length = 0;
    state.loot = R.lootAtStart; lootCrates.forEach((l, i) => { const t = (state.spekbuurtLootTaken || []).includes(i); l.taken = t; l.c.visible = l.glow.visible = !t; });
    Object.assign(state.ammo, R.ammoAtStart);
    Object.assign(R, { score: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, execs: 0, shots: 0, hits: 0, taken: 0, time: 0, cleared: done, results: false, lastOneShown: false });
    const o = owned(); setHeld(o.length ? ownWeapon(o[0]) : null);
    Object.assign(P, { hp: EASY.hp, maxhp: EASY.hp, armor: state.kit.includes('vest') ? 1 : 0, invT: 0, lastHurt: 0, dead: false, deadT: 0, fireT: 0, bloom: 0, exec: 0 });
    const u = player.userData; u.body.rotation.set(0, 0, 0); u.body.position.y = 0;
    player.position.copy(L(19.2, 2.2)); player.rotation.y = Math.PI; P.last.copy(player.position);
    selectSlot(o.some(isGun) ? 2 : 1); hideScreen(); FX.shake = FX.freeze = FX.flash = FX.hurtT = 0; M.snap = true; hud();
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
      R.lootAtStart = state.loot || 0; saveOwnAmmo(); R.ammoAtStart = { ...state.ammo };
      resetFloor();
      setArea('KAASLAND · SPEKBUURT');
      $('objective').innerHTML = state.spekbuurt ? 'Spekbuurt is <b>yours</b>. Shop setup comes in a later build. Drive home in the <b>Oofmobiel</b>.' : 'Take <b>Snackpaleis Spekbuurt</b> from the Lampas. Clear the restaurant, then the back of house. <span style="color:#ffd36b">Leave nobody standing.</span>';
      fade.style.opacity = '0';
      if (!state.spekbuurt) banner('SNACKPALEIS SPEKBUURT', 'Lampas territory. Mouse aim · click / F attack · E grab / throw · 1 / 2 weapons · R restart', 4.5);
    }, 480);
  }
  function exit() {
    fade.style.opacity = '1';
    setTimeout(() => {
      saveOwnAmmo(); M.active = false; clearPlayerSplats();
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
  function killEnemy(e, type, dir) {
    const f = e.userData.foe; if (!f.alive) return;
    f.alive = false; f.down = 0; f.wind = 0; f.laser.visible = false; e.userData.bubble.visible = false;
    if (f.weapon) { dropItem(f.weapon, e.position, dir[0] * 3, dir[1] * 3); setFoeWeapon(e, null); }
    const F = FORCE[type] || 4; f.vx = dir[0] * F; f.vz = dir[1] * F; f.body = true;
    e.rotation.y = Math.atan2(-dir[0], -dir[1]); poseDown(e, 1);
    bloodBurst(e.position, dir, type === 'shotgun' || type === 'exec' ? 40 : 22, type === 'shotgun' ? 6 : 4);
    floorDecal(e.position.x + dir[0] * 0.3, e.position.z + dir[1] * 0.3, 1.1 + Math.random() * 0.4, Math.random() * 6);
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
    killEnemy(e, 'exec', dir);
  }

  // ================================================================== THE PLAYER GETS HURT (3 lives, Neon Vice Easy)
  function hurtPlayer(dir, cause) {
    if (P.dead || P.invT > 0 || R.results) return;
    R.taken++;
    if (P.armor > 0) { P.armor--; P.invT = 0.9; P.lastHurt = R.time; shake(0.45); FX.flash = 0.35; FX.flashC = '255,255,255'; sfx('vest'); popup(player.position, 'VEST HIT!', '#ffd36b'); bloodBurst(player.position, dir, 8, 2); hud(); return; }
    if (P.hp > 1) {
      P.hp--; P.invT = 1.1; P.lastHurt = R.time; shake(0.45); FX.flash = 0.45; FX.flashC = '230,0,13'; FX.hurtT = 0.7; sfx('hurt');
      popup(player.position, P.hp === 1 ? 'LAST HIT!' : 'HIT!', '#ff4a5a', true); bloodBurst(player.position, dir, 14, 3); floorDecal(player.position.x, player.position.z, 0.6, Math.random() * 6);
      P.vx += dir[0] * 5; P.vz += dir[1] * 5; hud(); return;
    }
    P.hp = 0; P.dead = true; P.deadT = 0; P.cause = cause; R.combo = 0; R.comboT = 0;
    player.rotation.y = Math.atan2(-dir[0], -dir[1]); P.vx = dir[0] * (FORCE[cause] || 4); P.vz = dir[1] * (FORCE[cause] || 4);
    bloodBurst(player.position, dir, 60, 5); floorDecal(player.position.x + dir[0] * 0.3, player.position.z + dir[1] * 0.3, 1.4, Math.random() * 6);
    sfx('splat'); sfx('die'); FX.flash = 0.5; FX.flashC = '204,0,13'; shake(0.6); hud();
    const by = { bat: 'Beaten with a honkbalknuppel.', makarov: 'Shot with a Makarov.', shotgun: 'Blown away by a sawn-off.', fists: 'Punched out by a Lampas.' }[cause] || 'Killed by the Lampas.';
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
    showScreen(`<div class="logo2">SPEKBUURT UNLOCKED</div><div class="stats">KILLS<b>${R.kills}</b><br>EXECUTIONS<b>${R.execs}</b><br>BEST COMBO<b>${R.maxCombo}×</b><br>ACCURACY<b>${acc}</b><br>HITS TAKEN<b>${R.taken}</b><br>TIME<b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b><br>SCORE<b>W ${R.score.toLocaleString('nl-NL')}</b><br>WILDERS EARNED<b style="color:#ffd36b">+W ${pay.toLocaleString('nl-NL')}</b></div><div class="grade">${gr}</div><div class="hint">The Lampas are out of Spekbuurt. Grab the spice crates (E), then drive home. You'll set up shop here later.</div><div class="btn">CONTINUE · E</div>`);
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
    if (P.dead || P.exec > 0 || state.inDialogue || state.inPC) return;
    if (M.active) { const t = nearestDowned(); if (t && !(gunOut() && P.held.ammo <= 0)) { execute(t); return; } }
    if (gunOut()) {
      if (P.fireT > 0) return;
      if (P.held.ammo <= 0) { throwHeld(); return; }
      const W = WD[P.held.id]; P.held.ammo--; P.fireT = W.cd; R.shots++;
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
    for (const [i, l] of lootCrates.entries()) if (!l.taken && l.c.position.distanceTo(player.position.clone().setY(0.28)) < 1.3) {
      l.taken = true; l.c.visible = l.glow.visible = false; state.loot = (state.loot || 0) + 1;
      if (state.spekbuurt) { state.spekbuurtLootTaken = state.spekbuurtLootTaken || []; state.spekbuurtLootTaken.push(i); }
      popup(player.position, '+1 CRATE OF LAMPAS SPICE', '#ffd23a'); toast('+1 CRATE OF LAMPAS SPICE', 'Sell it on Kaasplaats (PC) for W 150.', 1.8); sfx('pick'); hud(); return true;
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
    if (!M.active) { // street: slot 2 works with what you bought
      if (!state.kit.includes('maboota')) return;
      if (e.code === 'Digit2' || e.code === 'Numpad2') { stop(); selectSlot(2); }
      else if ((e.code === 'Digit1' || e.code === 'Numpad1') && P.slot === 2) { stop(); holster(); equip(true); hud(); }
      else if (e.code === 'KeyF' && gunOut()) { stop(); attack(); }
      return;
    }
    if (e.code === 'KeyR' || e.code === 'Backspace') { stop(); if (!state.spekbuurt) resetFloor(); return; }
    if (P.dead) { stop(); return; }
    if (e.code === 'Digit1' || e.code === 'Numpad1') { stop(); selectSlot(1); }
    else if (e.code === 'Digit2' || e.code === 'Numpad2') { stop(); selectSlot(2); }
    else if (e.code === 'KeyF') { stop(); attack(); }
    else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') { if (grab()) stop(); }
  }, true);
  let mouseDown = false;
  addEventListener('pointerdown', (e) => {
    if (state.inDialogue || state.inPC || e.target !== ctx.canvas) return;
    if (!M.active) { if (gunOut()) { e.stopImmediatePropagation(); mouseDown = e.button === 0; attack(); } return; }
    e.stopImmediatePropagation();
    if (R.results) { grab(); return; }
    if (e.button === 2) { grab(); return; } mouseDown = true; attack();
  }, true);
  addEventListener('pointerup', () => { mouseDown = false; });
  ctx.canvas.addEventListener('contextmenu', (e) => { if (M.active || gunOut()) e.preventDefault(); });

  // ================================================================== UPDATE: shared aim (street + mission)
  function aimAtMouse() {
    if (!mouseSeen) return;
    rc.setFromCamera(mouseN, camera);
    if (rc.ray.intersectPlane(aimPlane, aim)) player.rotation.y = Math.atan2(aim.x - player.position.x, aim.z - player.position.z);
  }
  function holdPose(dt) { if (P.slot === 2 && P.held && isGun(P.held.id)) { const a = player.userData.arms[0]; a.rotation.x += (-1.45 - a.rotation.x) * Math.min(1, dt * 12); a.rotation.z = 0; if (WD[P.held.id].pel > 1) { const b = player.userData.arms[1]; b.rotation.x = -1.2; } } }
  // the street: guns knock people over (they get up and run, like with the Maboota)
  const streetBullets = [];
  function street(dt) {
    P.fireT -= dt; P.bloom = Math.max(0, P.bloom - dt * 0.45);
    if (gunOut()) { aimAtMouse(); holdPose(dt); }
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i]; b.life -= dt; let gone = b.life <= 0;
      const steps = Math.ceil(Math.hypot(b.vx, b.vz) * dt / 0.25);
      for (let s = 0; s < steps && !gone; s++) {
        b.m.position.x += b.vx * dt / steps; b.m.position.z += b.vz * dt / steps;
        if (solids.some((w) => !w.off && b.m.position.x > w.minx && b.m.position.x < w.maxx && b.m.position.z > w.minz && b.m.position.z < w.maxz)) { gone = true; break; }
        for (const p of ctx.streetTargets()) if (Math.hypot(p.position.x - b.m.position.x, p.position.z - b.m.position.z) < 0.45) { const l = Math.hypot(b.vx, b.vz); ctx.streetHit(p, new THREE.Vector3(b.vx / l, 0, b.vz / l)); gone = true; break; }
      }
      if (gone) { root.remove(b.m); bullets.splice(i, 1); }
    }
    updateParts(dt);
    if (flashT > 0) { flashT -= dt; if (flashT <= 0) { flashL.intensity = 0; flashSp.visible = false; } }
    P.last.copy(player.position);
  }
  function updateParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life -= dt;
      if (p.m.position.y > 0.03) { p.vy -= 14 * dt; p.m.position.x += p.vx * dt; p.m.position.y += p.vy * dt; p.m.position.z += p.vz * dt; p.m.rotation.x += dt * 8; p.m.rotation.y += dt * 6;
        if (p.m.position.y <= 0.03) { p.m.position.y = 0.03; if (p.blood) { floorDecal(p.m.position.x, p.m.position.z, 0.12 + Math.random() * 0.18, Math.random() * 6); p.life = 0; } } }
      if (p.life <= 0) { root.remove(p.m); parts.splice(i, 1); }
    }
  }

  // ================================================================== UPDATE: the mission
  function hitstop(dt) { if (FX.freeze > 0) { FX.freeze -= dt; return 0; } return dt; }
  function update(dt) {
    R.time += dt; if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) bannerEl.style.opacity = 0; }
    // aim + hold
    if (!P.dead) { if (P.exec > 0) P.exec -= dt; else aimAtMouse(); holdPose(dt); }
    else { P.deadT += dt; const u = player.userData; u.body.rotation.x = Math.max(-1.5, -P.deadT * 6); u.body.position.y = 0.1; slide(player, P, dt, 0.38); }
    if (!P.dead && (P.vx || P.vz)) { player.position.x += P.vx * dt; player.position.z += P.vz * dt; P.vx *= Math.exp(-dt * 8); P.vz *= Math.exp(-dt * 8); if (Math.hypot(P.vx, P.vz) < 0.05) P.vx = P.vz = 0; }
    const pv = [(player.position.x - P.last.x) / Math.max(dt, 1e-4), (player.position.z - P.last.z) / Math.max(dt, 1e-4)];
    if (!P.dead) collideDoors(player.position, 0.42, pv[0], pv[1], true);
    P.fireT -= dt; P.invT -= dt; P.bloom = Math.max(0, P.bloom - dt * 0.45); if (FX.hurtT > 0) FX.hurtT -= dt;
    // Neon Vice Easy: heal when out of fire
    if (!P.dead && P.hp < P.maxhp && R.time - P.lastHurt > EASY.regen) { P.hp++; P.lastHurt = R.time; popup(player.position, '+1 HEALTH', '#7dff9a'); sfx('pick'); hud(); }
    // walk over a weapon with an empty slot 2: pick it up
    if (!P.dead && !P.held) for (const it of items) if (!it.flying && it.age > 1 && Math.hypot(it.g.position.x - player.position.x, it.g.position.z - player.position.z) < 0.45) { pickUp(it); break; }
    // combo timer
    if (R.comboT > 0) { R.comboT -= dt; if (R.comboT <= 0) { R.combo = 0; hud(); } }
    updateDoors(dt);
    for (const e of enemies) updateEnemy(e, dt, pv);
    separate();
    updateBullets(dt); updateItems(dt); updateParts(dt);
    // FX
    if (flashT > 0) { flashT -= dt; if (flashT <= 0) { flashL.intensity = 0; flashSp.visible = false; } }
    FX.shake *= Math.exp(-dt * 8); FX.flash = Math.max(0, FX.flash - dt * 1.5); FX.kick.multiplyScalar(Math.exp(-dt * 12));
    flashEl.style.background = `rgba(${FX.flashC},1)`; flashEl.style.opacity = FX.flash * 0.6;
    const vig = FX.hurtT > 0 ? FX.hurtT / 0.7 * 0.55 : (!P.dead && P.hp === 1 ? 0.18 + Math.sin(R.time * 6) * 0.08 : 0);
    vigEl.style.background = `radial-gradient(ellipse at center, rgba(255,0,30,0) 45%, rgba(255,0,30,${vig.toFixed(3)}) 100%)`; vigEl.style.opacity = 1;
    for (const l of lootCrates) if (!l.taken) l.glow.material.opacity = 0.4 + Math.sin(performance.now() * 0.006) * 0.3;
    doner.rotation.y += dt * 0.8; spice.rotation.y += dt;
    // popups float up and fade
    for (let i = pops.length - 1; i >= 0; i--) {
      const p = pops[i]; p.t += dt; p.p.y += dt * 0.8;
      const v = p.p.clone().project(camera); p.el.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; p.el.style.top = ((1 - v.y) / 2 * innerHeight) + 'px'; p.el.style.opacity = Math.min(1, 2.2 - p.t * 1.6);
      if (p.t > 1.4) { p.el.remove(); pops.splice(i, 1); }
    }
    P.last.copy(player.position);
  }
  // bodies slide and splat into walls (Neon Vice's slideBody)
  function slide(obj, s, dt, r) {
    const sp = Math.hypot(s.vx, s.vz); if (sp < 0.05) return;
    const ox = obj.position.x, oz = obj.position.z;
    obj.position.x += s.vx * dt; obj.position.z += s.vz * dt;
    const bx = obj.position.x, bz = obj.position.z; ctx.collide(obj.position, r);
    const cx = obj.position.x - bx, cz = obj.position.z - bz, cl = Math.hypot(cx, cz);
    if (cl > 1e-5) { const nx = cx / cl, nz = cz / cl, vn = s.vx * nx + s.vz * nz;
      if (vn < 0) { if (-vn > 2.2) { wallSplat(obj.position, -nx, -nz); sfx('thud'); bloodBurst(obj.position, [-nx, -nz], 10, 2); shake(0.08); } s.vx -= vn * nx * 1.3; s.vz -= vn * nz * 1.3; } }
    if (sp > 1.2 && Math.random() < dt * 20) floorDecal(obj.position.x, obj.position.z, 0.5, Math.atan2(s.vz, s.vx), smearM);
    // a flying body bowls over standing Lampas
    if (sp > 5) for (const o of enemies) { const f = o.userData.foe; if (o === obj || !f.alive || f.down > 0 || f.boss) continue; if (o.position.distanceTo(obj.position) < 0.8) { knockdown(o, [s.vx / sp, s.vz / sp]); popup(o.position, 'BOWLED!', '#ffd36b'); s.vx *= 0.5; s.vz *= 0.5; } }
    s.vx *= Math.exp(-dt * 4); s.vz *= Math.exp(-dt * 4);
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
      const b = bullets[i]; b.life -= dt; let gone = b.life <= 0;
      const steps = Math.ceil(Math.hypot(b.vx, b.vz) * dt / 0.2);
      for (let s = 0; s < steps && !gone; s++) {
        const px = b.m.position.x, pz = b.m.position.z;
        b.m.position.x += b.vx * dt / steps; b.m.position.z += b.vz * dt / steps;
        if (inWall(b.m.position) || doorBlocks(px, pz, b.m.position.x, b.m.position.z)) { gone = true; break; }
        const dir = [b.vx, b.vz], l = Math.hypot(dir[0], dir[1]); dir[0] /= l; dir[1] /= l;
        if (b.byPlayer) {
          for (const e of enemies) { const f = e.userData.foe; if (!f.alive || (b.hit && b.hit.has(e))) continue;
            const r = f.down > 0 ? 0.5 : 0.42;
            if (Math.hypot(e.position.x - b.m.position.x, e.position.z - b.m.position.z) < r) { R.hits++; (b.hit = b.hit || new Set()).add(e); f.down > 0 ? killEnemy(e, b.id, dir) : hitEnemy(e, b.id, dir, 1); if (--b.pierce <= 0) { gone = true; break; } } }
        } else if (!P.dead && Math.hypot(player.position.x - b.m.position.x, player.position.z - b.m.position.z) < 0.38) { hurtPlayer(dir, b.id); gone = true; }
      }
      if (gone) { root.remove(b.m); bullets.splice(i, 1); }
    }
  }
  function updateItems(dt) {
    for (const it of items) {
      it.age += dt; const p = it.g.position;
      if (Math.abs(it.vx) + Math.abs(it.vz) > 0.05) {
        const ox = p.x, oz = p.z; p.x += it.vx * dt; p.z += it.vz * dt;
        if (inWall(p) || doorBlocks(ox, oz, p.x, p.z)) { p.x = ox; p.z = oz; it.vx *= -0.3; it.vz *= -0.3; if (it.flying) sfx('thud'); it.flying = false; }
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
    let len = 0.2; const step = 0.25, q = from.clone();
    while (len < 16) { q.set(from.x + Math.sin(a) * len, 0, from.z + Math.cos(a) * len); if (inWall(q) || Math.hypot(q.x - player.position.x, q.z - player.position.z) < 0.35) break; len += step; }
    f.laser.visible = true; f.laser.scale.z = len; f.laser.position.set(from.x + Math.sin(a) * len / 2, 1.25, from.z + Math.cos(a) * len / 2); f.laser.rotation.y = a;
    f.laser.material.opacity = 0.35 + (f.react < 0.35 ? 0.4 : 0);
  }
  function updateEnemy(e, dt, pv) {
    const f = e.userData.foe, u = e.userData;
    if (u.bubble.userData.life > 0 && (u.bubble.userData.life -= dt) <= 0) u.bubble.visible = false;
    if (!f.alive) { if (f.body) slide(e, f, dt, 0.34); return; }
    if (f.down > 0) {
      f.down -= dt; poseDown(e, f.down > 0.4 ? 1 : f.down / 0.4); slide(e, f, dt, 0.34);
      if (f.down <= 0) { poseDown(e, 0); f.state = 'chase'; f.react = 0.6 * EASY.react; f.seeT = 0; e.rotation.y += Math.PI; say(u.bubble, 'Nu ben je echt dood!', '#ff7a1a'); }
      return;
    }
    if (Math.hypot(f.vx, f.vz) > 0.1) slide(e, f, dt, 0.34);
    f.cd -= dt; f.laser.visible = false;
    const wid = f.weapon || 'fists', W = WD[wid];
    const pp = player.position, dx = pp.x - e.position.x, dz = pp.z - e.position.z, dist = Math.hypot(dx, dz) || 0.001, ang = Math.atan2(dx, dz);
    // sight: vision 9 (13 when chasing), cone 0.85 rad, line of sight through walls and closed doors
    let see = false;
    if (!P.dead && dist < (f.state === 'chase' ? 13 : EASY.vision)) {
      const cone = f.state === 'chase' || dist < 1.6 || Math.abs(angDiff(e.rotation.y, ang)) < (f.state === 'search' ? 1.3 : EASY.cone + (f.wary ? 0.35 : 0));
      if (cone && losClear(e.position, pp)) see = true;
    }
    // hearing footsteps (louder when sprinting)
    if (!see && !P.dead && f.state !== 'chase') { const spd = Math.hypot(pv[0], pv[1]); const hear = (spd > 5 ? 3.2 : 1.4) * (spd > 0.6 ? 1 : 0); if (dist < hear && losClear(e.position, pp)) { f.state = 'search'; f.sx = pp.x; f.sz = pp.z; f.searchT = 0; f.path = null; } }
    // spotting a body
    if (!see && (f.state === 'idle')) for (const o of enemies) { const of = o.userData.foe; if (of.alive || of.found || o === e) continue;
      const bd = o.position.distanceTo(e.position); if (bd < EASY.vision * 0.8 && Math.abs(angDiff(e.rotation.y, Math.atan2(o.position.x - e.position.x, o.position.z - e.position.z))) < EASY.cone && losClear(e.position, o.position)) {
        of.found = true; f.wary = true; f.state = 'search'; f.sx = o.position.x; f.sz = o.position.z; f.searchT = 0; f.path = null; popup(e.position, 'BODY!', '#ffd36b'); sfx('alert'); say(u.bubble, 'Hé! Ze hebben Kees vermoord!', '#ff7a1a'); break; } }
    if (see) { if (f.state !== 'chase') { f.state = 'chase'; f.react = (W.melee ? 0.2 : 0.5 + Math.random() * 0.25) * EASY.react; say(u.bubble, ALERT_LINES[Math.floor(Math.random() * ALERT_LINES.length)], '#ff7a1a'); popup(e.position, '!', '#ff3fa4', true); sfx('alert'); } f.lkx = pp.x; f.lkz = pp.z; f.seeT = 0; }
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
        // unarmed: go grab the nearest weapon on the floor
        if (!f.weapon) { let bi = null, bd = 4.5; for (const it of items) { if (it.flying) continue; const d = Math.hypot(it.g.position.x - e.position.x, it.g.position.z - e.position.z); if (d < bd && losClear(e.position, it.g.position)) { bd = d; bi = it; } }
          if (bi && (dist > 2.5 || !see)) { const ddx = bi.g.position.x - e.position.x, ddz = bi.g.position.z - e.position.z; tvx = ddx / (bd || 1) * 3.2; tvz = ddz / (bd || 1) * 3.2; face = Math.atan2(ddx, ddz);
            if (bd < 0.5) { setFoeWeapon(e, bi.id); root.remove(bi.g, bi.ring); items.splice(items.indexOf(bi), 1); f.react = 0.5; say(u.bubble, 'Hebbes!', '#ff7a1a'); } break; } }
        if (see) { face = ang;
          if (W.melee) { const sp = f.weapon ? 3.6 : 3.4; if (dist > 0.85) { tvx = dx / dist * sp; tvz = dz / dist * sp; if (gunOut() && dist > 2.2) { const zz = Math.sin(R.time * 5 + f.id * 1.7) * 0.85; tvx += dz / dist * sp * zz; tvz -= dx / dist * sp * zz; } }
            if (dist < 1.05 && f.wind <= 0 && f.cd <= 0) f.wind = 0.28 * Math.min(EASY.react, 1.6); }
          else { f.aiming = true; f.react -= dt; const want = f.pers === 'rush' ? 3.2 : f.pers === 'careful' ? 6.5 : 4.8;
            if (dist > want + 1.5) { tvx = dx / dist * 2.2; tvz = dz / dist * 2.2; } else if (dist < want - 1.5 && f.pers !== 'rush') { tvx = -dx / dist * 1.8; tvz = -dz / dist * 1.8; }
            f.strT -= dt; if (f.strT <= 0) { f.strT = 0.7 + Math.random() * 0.9; f.strD = Math.random() < 0.5 ? -1 : 1; } if (f.pers === 'rush') { tvx += dz / dist * 1.5 * f.strD; tvz -= dx / dist * 1.5 * f.strD; }
            laserTo(e, e.rotation.y);
            if (f.react <= 0 && f.cd <= 0 && Math.abs(angDiff(e.rotation.y, face)) < 0.22) { fireGun(e.position, e.rotation.y, wid, false, false); f.cd = W.ecd * EASY.ecd; f.atkT = 0.1; } } }
        else if (!W.melee && f.pers === 'careful' && f.seeT < 2.2) { face = Math.atan2(f.lkx - e.position.x, f.lkz - e.position.z); f.react = Math.max(f.react, 0.2); if (f.seeT < 1.2) laserTo(e, e.rotation.y); }
        else { if (f.seeT < 6) goTo(pp.x, pp.z, W.melee ? 3.2 : 2.6); else { f.state = 'search'; f.sx = f.lkx; f.sz = f.lkz; f.searchT = 0; f.path = null; } f.react = Math.max(f.react, 0.35); }
        break; }
    }
    // melee wind-up, then the hit
    if (f.wind > 0) { f.wind -= dt; tvx *= 0.3; tvz *= 0.3;
      if (f.wind <= 0) { f.atkT = 0.2; f.cd = 0.8; sfx('swing'); const d2 = Math.hypot(pp.x - e.position.x, pp.z - e.position.z);
        if (!P.dead && d2 < 1.25 && Math.abs(angDiff(e.rotation.y, Math.atan2(pp.x - e.position.x, pp.z - e.position.z))) < 1.1) { sfx('hit'); hurtPlayer([(pp.x - e.position.x) / (d2 || 1), (pp.z - e.position.z) / (d2 || 1)], wid); } } }
    if (face !== null) { const turn = f.state === 'chase' ? 8 : 3; e.rotation.y += Math.max(-turn * dt, Math.min(turn * dt, angDiff(e.rotation.y, face))); }
    const k = 1 - Math.exp(-dt * 10); f.mvx = (f.mvx || 0) + (tvx - (f.mvx || 0)) * k; f.mvz = (f.mvz || 0) + (tvz - (f.mvz || 0)) * k;
    e.position.x += f.mvx * dt; e.position.z += f.mvz * dt; ctx.collide(e.position, 0.34); collideDoors(e.position, 0.36, f.mvx, f.mvz, false);
    const spd = Math.hypot(f.mvx, f.mvz); animate(e, spd, dt);
    if (f.wind > 0) u.arms[0].rotation.x = -2.6; else if (f.atkT > 0) { f.atkT -= dt; u.arms[0].rotation.x = W.melee ? 0.6 : -1.3; } else if (f.aiming && see) u.arms[0].rotation.x = -1.45;
    f.aiming = false;
  }
  // melee from main.js swing(): the Maboota and fists knock down, a bat kills, hitting a downed Lampas executes him
  function melee(fv) {
    const id = P.slot === 2 && P.held && WD[P.held.id].melee ? P.held.id : 'maboota', W = WD[id];
    let tgt = null, bd = 1.6;
    for (const e of enemies) { const f = e.userData.foe; if (!f.alive) continue;
      const d = e.position.clone().sub(player.position); d.y = 0; const L2 = d.length();
      if (L2 < bd && d.normalize().dot(fv) > 0.3) { bd = L2; tgt = e; } }
    if (!tgt) return;
    const f = tgt.userData.foe, dir = [fv.x, fv.z];
    if (f.down > 0) { execute(tgt); return; }
    sfx('hit'); shake(0.15);
    if (W.kill) hitEnemy(tgt, id, dir, 2); else if (f.boss) stagger(tgt, dir); else { knockdown(tgt, dir); popup(tgt.position, 'DOWN!', '#ffd36b'); }
  }
  function cameraFor(zoom) { // Neon Vice-style: high, steep, leaning towards the mouse, with shake and recoil kick
    const lean = P.dead ? new THREE.Vector3() : aim.clone().sub(player.position).setY(0).clampLength(0, 6).multiplyScalar(0.3);
    const look = player.position.clone().add(lean).add(FX.kick).setY(0.8);
    const sh = FX.shake; if (sh > 0.01) look.add(new THREE.Vector3((Math.random() - 0.5) * sh, 0, (Math.random() - 0.5) * sh));
    return { pos: look.clone().add(new THREE.Vector3(0, 17 * zoom, 3.6 * zoom)), look };
  }
  function onBuy(id) {
    if (id === 'makarov') state.ammo.makarov = (state.ammo.makarov || 0) + WD.makarov.ammo;
    if (id === 'ammo') { state.ammo.makarov = (state.ammo.makarov || 0) + 50; if (P.held && P.held.own && P.held.id === 'makarov') P.held.ammo = state.ammo.makarov; }
    if (id === 'shotgun') state.ammo.shotgun = (state.ammo.shotgun || 0) + 12;
    if (id === 'shells') { state.ammo.shotgun = (state.ammo.shotgun || 0) + 12; if (P.held && P.held.own && P.held.id === 'shotgun') P.held.ammo = state.ammo.shotgun; }
    if (['makarov', 'shotgun', 'bat'].includes(id) && !P.held) { setHeld(ownWeapon(id)); toast(WD[id].name + ' IN SLOT 2', 'Press 2 to draw it · mouse to aim · click / F to ' + (isGun(id) ? 'shoot' : 'swing') + '.', 3); }
    hud();
  }
  buildGrid();
  Object.assign(M, { enter, exit, update, street, melee, cameraFor, hitstop, onBuy, frozen: () => P.dead || R.results, aiming: () => M.active || gunOut(), enemies, items, doors, P, R, lootCrates, OX, L, resetFloor, hud,
    _hit: (e) => killEnemy(e, 'maboota', [0, 1]), _hurt: (c) => hurtPlayer([0, 1], c || 'makarov'), _knock: (e) => knockdown(e, [0, 1]), _attack: attack, _grab: grab, _select: selectSlot });
  hud();
  return M;
}
