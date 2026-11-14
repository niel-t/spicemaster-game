// Spice Master Eddy: the mission engine. Each level (js/levels/*.js) is data plus a decorate() hook; this file builds it and runs it.
// Levels are built the way Neon Vice builds its levels: a 1 m cell grid (walls, glass, doors, furniture) that drives collision,
// cover, line of sight and pathing.
//   - walls and tall furniture (counters, bars, slot machines, racks, crates, cars) stop bullets: that's cover
//   - low furniture (tables, sofas, card tables, gym benches) blocks walking but bullets fly over it
//   - glass panes block walking, you can see through them, and any bullet shatters them
//   - red barrels explode when shot
// Rules: 3 lives (Neon Vice Easy), mouse aim, click / F attack, E grab / throw, 1 melee / 2 + 3 guns (wheel / Tab cycle), R reload (active reload), Shift sprint (loud), Backspace restart.
//
// Only one level lives in the scene at a time: it is built 300 m east of Kipkruidenkwartier when a mission starts (enter(id)) and
// the previous one is torn down (meshes and collision solids). initMission(ctx) gets the engine helpers from main.js.
//
// Grid legend (shared by all levels):
//   # wall · % glass · D swing door (runs of 2) · . floor
//   cover (stops bullets): K counter, B bar, M slot machine, F fridge/vending, R rack (also blocks sight), C crates, w workbench / steel table,
//                          O desk, V safe, Q pinball, b punching bag, X explosive barrel, A car / boat (model placed by the level)
//   low (bullets fly over): T table, S sofa, c card table, P pool table, G gym bench, p plant
// A level can add its own furniture letters (def.furn) and recolour the shared ones.

import { virt, inputMode, glyph, controlsLine } from './input.js';
import { LOOKS, bloody, cleanBlood } from './characters.js';
import spekbuurt from './levels/spekbuurt.js';
import kroketkade from './levels/kroketkade.js';
import uitjesbuurt from './levels/uitjesbuurt.js';
import frietwijk from './levels/frietwijk.js';
import sauzenbuurt from './levels/sauzenbuurt.js';
import knoflooksteeg from './levels/knoflooksteeg.js';
import mayonaisemarkt from './levels/mayonaisemarkt.js';
import halvekipplein from './levels/halvekipplein.js';
import bitterbalbuurt from './levels/bitterbalbuurt.js';
import pindasausplein from './levels/pindasausplein.js';
import joppiehaven from './levels/joppiehaven.js';
import frikandelhaven from './levels/frikandelhaven.js';

export const LEVELS = { spekbuurt, kroketkade, uitjesbuurt, frietwijk, sauzenbuurt, knoflooksteeg, mayonaisemarkt, halvekipplein, bitterbalbuurt, pindasausplein, joppiehaven, frikandelhaven };

export function initMission(ctx) {
  const { THREE, scene, camera, player, state, box, cyl, lam, makePerson, animate, toast, beep, addMoney,
    neonTube, neonRect, signTex, canvasTex, $, maboota, equip, bubble, say, addInteract, clearPlayerSplats, sun, hemi,
    setBounds, updateObjective, setArea } = ctx;
  const OX = 300; // grid cell (x, z) covers world [OX + x, OX + x + 1] × [Z0 + z, Z0 + z + 1]; Z0 = -H puts the level front on world z = 0
  let LV = null, W = 0, H = 0, Z0 = 0, G = [], root = null; // the level that is built right now
  const L = (x, z, y = 0) => new THREE.Vector3(OX + x, y, Z0 + z);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const WALL_H = 2.3;

  // ================================================================== GRID QUERIES (Neon Vice: los / rayWall / pathing on cells)
  const BASE_BLOCK = '#%KBMFRCwOVQbXATScPGp', BASE_COVER = '#KBMFRCwOVQbXA', BASE_SIGHT = '#R';
  let BLOCK = new Set(BASE_BLOCK), COVER = new Set(BASE_COVER), SIGHT = new Set(BASE_SIGHT);
  const cellAt = (wx, wz) => { const x = Math.floor(wx - OX), z = Math.floor(wz - Z0); if (z >= H) return '.'; if (x < 0 || x >= W || z < 0) return '#'; return G[z][x]; };
  const isBlock = (c) => BLOCK.has(c), isCover = (c) => COVER.has(c);

  // ================================================================== GEOMETRY (shared materials and floor textures)
  let levelSolids = [];
  const solid = (...a) => { const s = ctx.solid(...a); levelSolids.push(s); return s; }; // level collision, removed on teardown
  const solidRun = (x0, x1, z0, z1) => solid(OX + x0, OX + x1, Z0 + z0, Z0 + z1);
  function floorW(x0, x1, z0, z1, tex, rep = 1, color = 0xffffff, y = 0.02) {
    const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((x1 - x0) / rep, (z1 - z0) / rep);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), lam({ map: t, color }));
    m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); m.receiveShadow = true; root.add(m); return m;
  }
  const T = {
    checker: canvasTex(64, 64, (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#b8202a' : '#f2e8d8'; g.fillRect(x * 32, y * 32, 32, 32); } }),
    shag: canvasTex(64, 64, (g) => { g.fillStyle = '#c8602a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 500; i++) { g.fillStyle = ['#d8743a', '#a84a1a', '#e08a4a'][i % 3]; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } }),
    hall: canvasTex(64, 64, (g) => { g.fillStyle = '#3a1a4a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8a33d'; g.fillRect(0, 28, 64, 3); g.fillStyle = '#5a2a6a'; for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 2, 64); }),
    casino: canvasTex(64, 64, (g) => { g.fillStyle = '#123a2a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#d8b040'; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 4); g.lineTo(60, 32); g.lineTo(32, 60); g.lineTo(4, 32); g.closePath(); g.stroke(); g.fillStyle = '#c8102e'; g.beginPath(); g.arc(32, 32, 5, 0, 7); g.fill(); }),
    parquet: canvasTex(64, 64, (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = ['#7a4a22', '#8a5a2a', '#6a3a1a'][(x + y * 3) % 3]; if ((x + y) % 2) g.fillRect(x * 16, y * 16, 16, 16); else { for (let k = 0; k < 4; k++) { g.fillRect(x * 16 + k * 4, y * 16, 3, 16); } } } }),
    rubber: canvasTex(64, 64, (g) => { g.fillStyle = '#2a2c30'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 64, 2); }),
    concrete: canvasTex(64, 64, (g) => { g.fillStyle = '#8a8680'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } }),
    tiles: canvasTex(64, 64, (g) => { g.fillStyle = '#e8eef0'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#a8b8c0'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } }),
    garage: canvasTex(64, 64, (g) => { g.fillStyle = '#6a6862'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(10,10,10,.35)'; g.beginPath(); g.ellipse(Math.random() * 64, Math.random() * 64, 6 + Math.random() * 8, 4 + Math.random() * 5, Math.random(), 0, 7); g.fill(); } }),
    asphalt: canvasTex(64, 64, (g) => { g.fillStyle = '#3a3a40'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } }),
    paving: canvasTex(64, 64, (g) => { g.fillStyle = '#a89a8a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#7a6e62'; g.lineWidth = 2; for (let y = 0; y < 64; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y); g.stroke(); for (let x = (y / 16) % 2 ? 0 : 16; x < 64; x += 32) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 16); g.stroke(); } } }),
  };
  const FLOOR_REP = { checker: 1, garage: 3, concrete: 3 }; // texture repeat size in metres (default 1.4)
  // furniture looks: [height, colour]; a level can recolour these and add its own letters
  // (def.furn: { ch: { h, color, cover: bool, sight: bool, draw(run) to draw it yourself } })
  const FM0 = {
    K: [1.05, 0xc8402e], B: [1.1, 0x6a3a1a], M: [1.7, 0x7a1a3a], F: [1.8, 0xe8e8e0], R: [2.0, 0x3a5aa0], C: [1.0, 0x8a6a3a], w: [0.95, 0xc8ccd0],
    O: [0.8, 0x3a1a0a], V: [1.2, 0x3a3a40], Q: [1.4, 0xe8862c], b: [1.4, 0xb8102e], T: [0.76, 0xf2efe6], S: [0.75, 0x6a2a5a], c: [0.78, 0x1f6a3a], P: [0.85, 0x1a6a3a], G: [0.5, 0x1a1a1a], p: [0.9, 0x2f7a2a],
  };
  let FM = FM0;
  const glassM = new THREE.MeshPhongMaterial({ color: 0x9ad8ff, transparent: true, opacity: 0.32, shininess: 120, specular: 0xffffff, depthWrite: false });
  const frameM = lam({ color: 0xe8e8f0 }), barrelM = lam({ color: 0xc81e1e });
  let wallM = null, capM = null, pristine = null;
  let glass = new Map(), barrels = new Map(), lights = [], van = null, levelTick = null, START = null, VAN_PARK = 0;

  // builds a level into a fresh root group; the previous level is torn down first
  function buildLevel(def) {
    teardown();
    LV = def; W = def.W; H = def.H; Z0 = -H;
    G = Array.from({ length: H }, () => Array(W).fill('#'));
    root = new THREE.Group(); root.visible = false; scene.add(root); // only drawn while the mission is on
    const carve = (x0, z0, x1, z1, ch = '.') => { for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) G[z][x] = ch; };
    const put = (x, z, ch) => { G[z][x] = ch; };
    const putR = (x0, z0, x1, z1, ch) => carve(x0, z0, x1, z1, ch);
    for (const [, x0, z0, x1, z1] of def.rooms) carve(x0, z0, x1, z1);
    def.layout({ carve, put, putR, G, W, H });
    // furniture rules: the shared letters plus the level's own
    FM = { ...FM0 }; BLOCK = new Set(BASE_BLOCK); COVER = new Set(BASE_COVER); SIGHT = new Set(BASE_SIGHT);
    for (const [ch, f] of Object.entries(def.furn || {})) {
      FM[ch] = [f.h ?? (FM0[ch] ? FM0[ch][0] : 1), f.color ?? (FM0[ch] ? FM0[ch][1] : 0x888888), f];
      BLOCK.add(ch);
      if (f.cover === true) COVER.add(ch); else if (f.cover === false) COVER.delete(ch); else if (!FM0[ch]) COVER.add(ch);
      if (f.sight) SIGHT.add(ch);
    }
    const mood = def.mood;
    wallM = lam({ color: mood.wall }); capM = lam({ color: mood.cap });
    const floorT = { ...T }; for (const [k, draw] of Object.entries(def.floors || {})) floorT[k] = canvasTex(64, 64, draw);
    const rep = { ...FLOOR_REP, ...(def.floorRep || {}) };
    floorW(OX, OX + W, Z0, 0, T.concrete, 3, mood.under, 0.01); // under walls and doorways
    for (const [, x0, z0, x1, z1, f] of def.rooms) floorW(OX + x0, OX + x1 + 1, Z0 + z0, Z0 + z1 + 1, floorT[f], rep[f] ?? 1.4);
    const hallCells = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'D') hallCells.push([x, z]);
    for (const c of def.hallCells || []) hallCells.push(c);
    for (const [x, z] of hallCells) floorW(OX + x, OX + x + 1, Z0 + z, Z0 + z + 1, floorT[def.doorFloor || 'hall'], 1, 0xffffff, 0.021);
    // walls: one box per horizontal run of '#'
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      if (G[z][x] !== '#') continue; let x1 = x; while (x1 + 1 < W && G[z][x1 + 1] === '#') x1++;
      const n = x1 - x + 1; box(n, WALL_H, 1, wallM, OX + x + n / 2, WALL_H / 2, Z0 + z + 0.5, root);
      box(n + 0.02, 0.06, 1.02, capM, OX + x + n / 2, WALL_H + 0.03, Z0 + z + 0.5, root, false);
      solidRun(x, x1 + 1, z, z + 1); x = x1;
    }
    // glass panes: one pane per cell, oriented along its wall line
    glass = new Map();
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '%') {
      const horiz = (x > 0 && '#%'.includes(G[z][x - 1])) || (x < W - 1 && '#%'.includes(G[z][x + 1]));
      const g = new THREE.Group(); g.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); if (!horiz) g.rotation.y = Math.PI / 2; root.add(g);
      box(1, 0.5, 0.3, wallM, 0, 0.25, 0, g); box(1, 0.06, 0.32, capM, 0, 0.52, 0, g, false);
      const pane = new THREE.Mesh(new THREE.BoxGeometry(1, 1.7, 0.06), glassM); pane.position.y = 1.4; g.add(pane);
      box(1, 0.06, 0.1, frameM, 0, 2.27, 0, g, false); box(0.06, 1.75, 0.1, frameM, 0.47, 1.4, 0, g, false);
      glass.set(x + ',' + z, { g, pane, s: solidRun(x, x + 1, z, z + 1), x, z, horiz });
    }
    // furniture: merged runs per type, with a look per type
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) {
      const ch = G[z][x]; if (!FM[ch] && ch !== 'A') continue;
      let x1 = x; while (x1 + 1 < W && G[z][x1 + 1] === ch) x1++;
      if (ch === 'A') { solidRun(x, x1 + 1, z, z + 1); x = x1; continue; } // cars and boats: the level places the model
      const n = x1 - x + 1, [h, col, own] = FM[ch], cx = OX + x + n / 2, cz = Z0 + z + 0.5;
      if (own && own.draw) own.draw({ THREE, root, box, cyl, lam, x, x1, z, n, h, col, cx, cz, OX, Z0, G });
      else if (ch === 'p') { for (let k = 0; k < n; k++) { cyl(0.22, 0.18, 0.4, lam({ color: 0x8a4a2a }), OX + x + k + 0.5, 0.2, cz, root, 10); const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 0), lam({ color: col })); b.position.set(OX + x + k + 0.5, 0.8, cz); b.castShadow = true; root.add(b); } }
      else if (ch === 'c') { /* card tables: the level draws the round tops */ }
      else if (ch === 'T') { box(n - 0.08, 0.06, 0.92, lam({ color: col }), cx, h, cz, root); for (const ox of [-n / 2 + 0.2, n / 2 - 0.2]) box(0.08, h, 0.08, lam({ color: 0x3a2212 }), cx + ox, h / 2, cz, root, false); }
      else if (ch === 'R') { box(n - 0.04, h, 0.9, lam({ color: col }), cx, h / 2, cz, root); for (let k = 0; k < n; k++) for (let s = 0; s < 2; s++) box(0.42, 0.42, 0.6, lam({ color: (def.rackGoods || [0xe8a020, 0xc8402e, 0xf2c43a])[(x + k + s + z) % 3] }), OX + x + k + 0.5, 0.45 + s * 0.85, cz + (s ? 0.12 : -0.12), root); }
      else if (ch === 'M') { box(n - 0.06, h, 0.8, lam({ color: col }), cx, h / 2, cz, root); for (let k = 0; k < n; k++) { const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.45), new THREE.MeshBasicMaterial({ color: [0xffe14a, 0xf2c14e, 0xe8862c][(x + k) % 3] })); sc.rotation.x = -Math.PI / 2.6; sc.position.set(OX + x + k + 0.5, h + 0.01, cz + 0.1); root.add(sc); } }
      else box(n - 0.06, h, 0.9, lam({ color: col }), cx, h / 2, cz, root);
      if ((ch === 'K' || ch === 'w') && !(own && own.draw)) box(n, 0.06, 1.0, new THREE.MeshStandardMaterial({ color: 0xc8ccd0, roughness: 0.3, metalness: 0.8 }), cx, h + 0.03, cz, root, false);
      solidRun(x, x1 + 1, z, z + 1); x = x1;
    }
    // explosive barrels
    barrels = new Map();
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'X') {
      const g = new THREE.Group(); g.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); root.add(g);
      cyl(0.34, 0.34, 1.0, barrelM, 0, 0.5, 0, g, 14); cyl(0.35, 0.35, 0.05, lam({ color: 0xffd23a }), 0, 0.7, 0, g, 14);
      const lbl = new THREE.Mesh(new THREE.CircleGeometry(0.2, 3), new THREE.MeshBasicMaterial({ color: 0xffd23a })); lbl.rotation.x = -Math.PI / 2; lbl.position.y = 1.01; g.add(lbl);
      barrels.set(x + ',' + z, { g, s: solidRun(x, x + 1, z, z + 1), x, z });
    }
    // the level's own props (street, signs, vehicles, ...)
    const carIn = (...a) => { const g = ctx.car(...a); root.add(g); return g; };
    const deco = def.decorate({ THREE, root, OX, Z0, W, H, G, L, box, cyl, lam, solid, solidRun, floorW, T: floorT, WALL_H, neonTube, neonRect, signTex, canvasTex, car: carIn, wallM, capM, makePerson, animate, player, path, run: () => R, LOOKS, alarm: alertNoise, popup }) || {};
    tasks = deco.tasks || []; for (const t of tasks) t.done = false; // objective props: sabotage these as well as clearing the floor
    levelTick = deco.tick || null;
    // neon: one strip per room, top of the walls
    for (const [name, x0, z0, x1] of def.rooms) if (def.neon[name] !== undefined) neonTube(root, OX + x0 + 0.2, WALL_H - 0.25, OX + x1 + 0.8, WALL_H - 0.25, Z0 + z0 + 0.04, def.neon[name]);
    lights = [];
    for (const [x, z, c, k] of def.lights) { const l = new THREE.PointLight(c, 0, 18, 1.3); l.position.set(OX + x, WALL_H + 0.6, Z0 + z); root.add(l); lights.push([l, k]); }
    // the Oofmobiel, parked outside
    const V = def.van; van = ctx.makeVan(); van.position.set(OX + V.park[0], 0, V.park[1]); if (V.rot !== undefined) van.rotation.y = V.rot; root.add(van);
    solid(OX + V.solid[0], OX + V.solid[1], V.solid[2], V.solid[3]);
    VAN_PARK = OX + V.park[0]; START = () => new THREE.Vector3(OX + def.start[0], 0, def.start[1]);
    root.add(flashL, flashSp);
    buildDoors(def);
    spawnEnemies(def);
    buildLoot(def);
    pristine = { glass: new Map(glass), barrels: new Map(barrels) };
    Object.assign(M, { enemies, doors, glass, barrels, lootCrates, L, G, level: def.id, def, W, H, Z0 });
  }
  function teardown() {
    if (!root) return;
    scene.remove(root);
    root.traverse((o) => { if (o.geometry && o.geometry !== partGeo && o.geometry !== decalGeo) o.geometry.dispose(); });
    for (const s of levelSolids) { const i = ctx.solids.indexOf(s); if (i >= 0) ctx.solids.splice(i, 1); }
    levelSolids = []; doors.length = 0; enemies.length = 0; lootCrates.length = 0; items.length = 0; bullets.length = 0; parts.length = 0; gibs.length = 0; decals.length = 0; pools.length = 0;
    root = null; LV = null;
  }

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
  function buildDoors(def) {
    const seen = new Set(), signs = def.doorSigns || {};
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) { if (G[z][x] !== 'D' || seen.has(x + ',' + z)) continue;
      if (x + 1 < W && G[z][x + 1] === 'D') { let x1 = x; while (G[z][x1 + 1] === 'D') { x1++; } for (let k = x; k <= x1; k++) seen.add(k + ',' + z); addDoor(OX + x, Z0 + z + 0.5, 0, x1 - x + 1, signs[x + ',' + z] || ''); }
      else { let z1 = z; while (z1 + 1 < H && G[z1 + 1][x] === 'D') z1++; for (let k = z; k <= z1; k++) seen.add(x + ',' + k); addDoor(OX + x + 0.5, Z0 + z, -Math.PI / 2, z1 - z + 1, signs[x + ',' + z] || ''); } } }
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
    rlStart: () => { beep(420, 0.04, 'square', 0.03); setTimeout(() => beep(260, 0.05, 'square', 0.03), 60); },
    rlDone: () => { beep(520, 0.04, 'square', 0.04); setTimeout(() => beep(780, 0.05, 'square', 0.035), 70); },
    rlPerfect: () => [880, 1175, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.06, 'triangle', 0.045), i * 45)),
    jam: () => { beep(110, 0.18, 'sawtooth', 0.06); beep(330, 0.06, 'square', 0.03); },
    cash: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.06), i * 110)),
  }[k] || (() => {}))();

  // ================================================================== WEAPONS (numbers from Neon Vice's WD table, Easy difficulty)
  const WD = {
    maboota: { name: 'MABOOTA', melee: true, knock: true, range: 1.15 },
    fists: { name: 'FISTS', melee: true, knock: true, range: 1.0 },
    bat: { name: 'HONKBALKNUPPEL', melee: true, kill: true, range: 1.25 },
    makarov: { name: 'MAKAROV', ammo: 8, cal: '9mm', mag: 8, rl: 1.3, ar: [0.45, 0.16], spare: 8, cd: 0.2, pel: 1, spr: 0.025, mv: 0.07, bloom: 0.04, ecd: 0.8, loud: 13, kick: 0.1, snd: 'pistol' },
    shotgun: { name: 'SAWN-OFF', ammo: 2, cal: '12ga', mag: 2, rl: 1.9, ar: [0.4, 0.18], spare: 4, cd: 0.75, pel: 7, spr: 0.26, mv: 0.04, bloom: 0, ecd: 1.2, loud: 16, kick: 0.4, snd: 'shotgun' },
  };
  // ammo pools per caliber (Neon Vice CAL): bought boxes and rounds stripped off Lampas guns; a reload tops the magazine up from here
  const CAL = { '9mm': { name: '9MM', cap: 90 }, '12ga': { name: 'HAGEL', cap: 30 } };
  const AR_JAM = 1.4; // a mistimed press: the rest of the reload takes 1.4x longer (Neon Vice W6c)
  const KILLPTS = { maboota: 450, bat: 450, fists: 500, exec: 800, door: 600, throw: 550, makarov: 300, shotgun: 300, boom: 700 };
  const FORCE = { makarov: 4.5, shotgun: 9.5, bat: 6.5, maboota: 5.5, fists: 5.5, exec: 1, throw: 5, door: 6, boom: 10 };
  const EASY = { hp: 3, react: 1.9, espr: 0.17, ebSpd: 15, vision: 9, cone: 0.85, ecd: 1.5, regen: 7 };
  const TIPS = ['A Lampas who stops and raises his gun is about to fire. Get behind a counter, a bar or a rack.', 'Counters, bars, slot machines, racks and crates stop bullets. Tables and sofas don\'t.', 'Stand still for accurate shots. Running throws your aim off.', 'Run into a door to swing it. A fast door knocks people flat.', 'The Maboota knocks people down. Hit a downed Lampas again to finish him.', 'Magazine and pocket both empty? Attack again to throw the gun. It knocks people down.', 'Shoot the red barrels. Stand back.', 'Glass stops you, not bullets. And they can see you through it.', 'Gunshots wake up the whole floor. The Maboota is quiet.', 'Press R while reloading: hit the green window for an instant reload. Miss it and the gun jams.', 'Sprinting (Shift) is loud. Every Lampas nearby hears your footsteps.', 'Grab (E) a Lampas gun of the same calibre to strip its rounds into your pocket.'];
  function weaponMesh(id) {
    const g = new THREE.Group();
    if (id === 'bat') { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.025, 0.85, 8), lam({ color: 0xc8a06a })); b.position.y = -0.4; g.add(b); }
    if (id === 'makarov') { box(0.05, 0.1, 0.26, lam({ color: 0x1a1a1a }), 0, -0.05, 0.1, g, false); box(0.05, 0.14, 0.07, lam({ color: 0x3a2a1a }), 0, -0.1, 0, g, false); }
    if (id === 'shotgun') { box(0.06, 0.07, 0.8, lam({ color: 0x1a1a1a }), 0, -0.03, 0.3, g, false); box(0.07, 0.11, 0.3, lam({ color: 0x6a3a1a }), 0, -0.06, -0.12, g, false); }
    return g;
  }
  const isGun = (id) => !!(id && WD[id] && !WD[id].melee);

  // ================================================================== THE PLAYER'S KIT
  // Neon Vice loadout: slot 1 = melee (the Maboota, always; a honkbalknuppel if you have one: press 1 again to switch),
  // slots 2 and 3 = guns, bought from The Russian or taken off a Lampas. Guns only come out on missions.
  state.ammo = state.ammo || {}; // rounds loaded in each owned gun
  if (!state.pool) { // ammo you carry, per caliber; before this, everything sat in state.ammo: move the overflow into the pool
    state.pool = { '9mm': 0, '12ga': 0 };
    for (const id of ['makarov', 'shotgun']) { const w = WD[id], n = state.ammo[id] || 0; if (n > w.mag) { state.pool[w.cal] += n - w.mag; state.ammo[id] = w.mag; } }
  }
  // what you carry between missions (Neon Vice kit): two guns with their loaded rounds, a melee weapon, a vest. Pocket ammo is state.pool.
  // Gear that doesn't fit goes to the kluis (stash) in the warehouse.
  const STASH_CAP = 6;
  function migrateKit() { // before the persistent kit, guns came from the purchase list
    if (!state.loadout || !Array.isArray(state.loadout.guns)) {
      const g = ['makarov', 'shotgun'].filter((k) => (state.kit || []).includes(k));
      state.loadout = { guns: [0, 1].map((i) => (g[i] ? { id: g[i], ammo: state.ammo[g[i]] ?? WD[g[i]].mag } : null)), melee: (state.kit || []).includes('bat') ? 'bat' : null, vest: (state.kit || []).includes('vest') ? 1 : 0 };
    }
    if (!Array.isArray(state.stash)) state.stash = [];
    migrateLevels();
  }
  // per-level progress: state.owned = { spekbuurt: true, ... }, state.lootTaken = { spekbuurt: [crate indices], ... }.
  // Saves from before the level engine had state.spekbuurt / state.spekbuurtLootTaken: those are migrated, and both stay
  // in sync for Spekbuurt so an older build still reads the save.
  function migrateLevels() {
    if (!state.owned || typeof state.owned !== 'object') state.owned = {};
    if (!state.lootTaken || typeof state.lootTaken !== 'object') state.lootTaken = {};
    if (state.spekbuurt) state.owned.spekbuurt = true;
    if (Array.isArray(state.spekbuurtLootTaken) && !state.lootTaken.spekbuurt) state.lootTaken.spekbuurt = state.spekbuurtLootTaken.slice();
    if (state.owned.spekbuurt) state.spekbuurt = true;
  }
  const ownsLevel = (id) => !!(state.owned && state.owned[id]);
  function setOwned(id, on = true) {
    migrateLevels(); if (on) state.owned[id] = true; else delete state.owned[id];
    if (id === 'spekbuurt') state.spekbuurt = on;
    if (ctx.onOwned) ctx.onOwned(id);
  }
  function setLootTaken(id, list) { state.lootTaken[id] = list; if (id === 'spekbuurt') state.spekbuurtLootTaken = list.slice(); }
  migrateKit();
  const P = { slot: 1, held: null, hp: EASY.hp, maxhp: EASY.hp, armor: 0, invT: 0, lastHurt: 0, dead: false, deadT: 0, fireT: 0, bloom: 0, exec: 0, cause: '', vx: 0, vz: 0, last: new THREE.Vector3(), rl: null, sprint: false, stepT: 0, guns: [null, null], melee: null, useBat: false, lastGun: 2 };
  const handGun = new THREE.Group(); handGun.position.set(0, -0.68, 0.05); handGun.visible = false; player.userData.arms[0].add(handGun);
  const owned = () => ['shotgun', 'makarov', 'bat'].filter((k) => state.kit.includes(k));
  const isMelee = (id) => !!(id && WD[id] && WD[id].melee);
  function ownWeapon(id) { return { id, ammo: isGun(id) ? (state.ammo[id] || 0) : 0, own: true }; }
  function saveOwnAmmo() { /* loaded rounds live on the gun itself and go home with you (commitKit) */ }
  let meshOf = null;
  function syncHeld() { // P.held = whatever is in the active slot; meshes and the armed flag follow
    if (P.slot >= 2 && !P.guns[P.slot - 2]) P.slot = 1;
    if (P.useBat && !P.melee) P.useBat = false;
    P.held = P.slot === 1 ? (P.useBat ? P.melee : null) : P.guns[P.slot - 2];
    if (meshOf !== P.held) { meshOf = P.held; handGun.clear(); if (P.held) handGun.add(weaponMesh(P.held.id)); }
    maboota.visible = M.active ? P.slot === 1 && !P.useBat : true; handGun.visible = !!P.held && M.active;
    state.armed = P.slot === 1 || isMelee(P.held && P.held.id);
    hud();
  }
  function selectSlot(n, quiet) {
    if (!M.active) { if (n >= 2) toast('NOT ON THE STREET', 'Your guns stay in the Oofmobiel. Slots 2 and 3 work on missions only. Press I for your inventory.', 2); return; }
    if (n === 1) { if (P.slot === 1 && P.melee) P.useBat = !P.useBat; P.slot = 1; }
    else { if (!P.guns[n - 2]) { if (!quiet) toast(`SLOT ${n} IS LEEG`, 'Grab a gun from a Lampas (E), or buy one from The Russian.', 1.4); return; } P.slot = n; P.lastGun = n; }
    $('weapon').className = 'hud on'; syncHeld(); beep(300, 0.05, 'square', 0.03);
  }
  function cycleSlot(dir) { // mouse wheel / Tab: 1 → 2 → 3 → 1, skipping empty gun slots
    const order = [1, 2, 3].filter((n) => n === 1 || P.guns[n - 2]); if (order.length < 2) return;
    selectSlot(order[(order.indexOf(P.slot) + dir + order.length) % order.length]);
  }
  // puts a weapon in your hands: melee goes to slot 1, a gun fills an empty gun slot or swaps with the gun you hold (the old one drops)
  function putInHand(it) {
    const drop = (old) => { if (old) dropItem(old.id, player.position, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, old.ammo, false, old.own); };
    if (isMelee(it.id)) { drop(P.melee); P.melee = it; P.useBat = true; P.slot = 1; syncHeld(); return; }
    saveOwnAmmo();
    const n = !P.guns[0] ? 2 : !P.guns[1] ? 3 : P.slot >= 2 ? P.slot : P.lastGun; // empty slot first, else swap with the gun in your hands
    drop(P.guns[n - 2]); P.guns[n - 2] = it; P.slot = n; P.lastGun = n; syncHeld();
  }
  const copyGun = (g) => (g && WD[g.id] ? { id: g.id, ammo: Math.max(0, g.ammo | 0), own: true } : null);
  function loadKit() { // what you bring into the mission: your carried kit
    const L = state.loadout; P.guns = [copyGun(L.guns[0]), copyGun(L.guns[1])];
    P.melee = L.melee ? { id: L.melee, ammo: 0, own: true } : null; P.useBat = false; P.lastGun = 2;
  }
  function commitKit() { // what you carry out of the mission is yours: Lampas guns included
    state.loadout = { guns: P.guns.map((g) => (g ? { id: g.id, ammo: g.ammo } : null)), melee: P.melee ? P.melee.id : null, vest: P.armor > 0 ? 1 : 0 };
  }
  const gearName = (id) => (WD[id] ? WD[id].name : id === 'vest' ? 'KEVLAR VEST' : id.toUpperCase());
  function fitsLoadout(id) { const L = state.loadout; return isGun(id) ? !L.guns[0] || !L.guns[1] : id === 'bat' ? !L.melee : id === 'vest' ? !L.vest : false; }
  function addToLoadout(it) { const L = state.loadout; if (isGun(it.id)) L.guns[L.guns[0] ? 1 : 0] = { id: it.id, ammo: it.ammo | 0 }; else if (it.id === 'bat') L.melee = 'bat'; else if (it.id === 'vest') L.vest = 1; }
  const GEAR = ['makarov', 'shotgun', 'bat', 'vest'];
  const owns = (id) => { const L = state.loadout; return L.guns.some((g) => g && g.id === id) || L.melee === id || (id === 'vest' && L.vest > 0) || state.stash.some((s) => s.id === id); };
  const canBuy = (id) => !GEAR.includes(id) || fitsLoadout(id) || state.stash.length < STASH_CAP;
  function kitSummary() { const L = state.loadout, n = [...(state.kit.includes('maboota') ? ['Maboota'] : []), ...(L.melee ? [WD.bat.name] : []), ...L.guns.filter(Boolean).map((g) => WD[g.id].name), ...(L.vest ? ['Vest'] : [])]; return n.length ? 'Kit: ' + n.join(', ') + (state.stash.length ? ` · Kluis ${state.stash.length}/${STASH_CAP}` : '') : ''; }
  const gunOut = () => M.active && P.slot >= 2 && P.held && isGun(P.held.id);
  function holster() { saveOwnAmmo(); P.slot = 1; P.useBat = false; P.rl = null; handGun.visible = false; }

  // ================================================================== ACTIVE RELOAD (Neon Vice W6c: Gears-style window)
  // R starts a reload that tops the magazine up from the caliber pool after WD.rl seconds. One more R inside the green window
  // finishes it at once; a press anywhere else jams the gun (the rest takes AR_JAM x longer) and locks further tries.
  const poolOf = (id) => state.pool[WD[id].cal] | 0;
  const reloadNeed = (h) => (h && isGun(h.id) ? Math.max(0, Math.min(WD[h.id].mag - h.ammo, poolOf(h.id))) : 0);
  function reloadStart() {
    if (!gunOut() || P.rl || P.dead || !reloadNeed(P.held)) return false;
    const w = WD[P.held.id], d = w.rl, a = w.ar;
    P.rl = { t: 0, dur: d, ar0: a[0] * d, ar1: (a[0] + a[1]) * d, tried: false, jam: false, h: P.held };
    sfx('rlStart'); hud(); return true;
  }
  function reloadDone(perfect) {
    const h = P.rl.h, n = reloadNeed(h); P.rl = null;
    state.pool[WD[h.id].cal] = poolOf(h.id) - n; h.ammo += n; P.fireT = Math.max(P.fireT, perfect ? 0 : 0.1);
    sfx(perfect ? 'rlPerfect' : 'rlDone'); saveOwnAmmo(); hud();
  }
  function reloadInput() {
    if (P.rl) {
      const r = P.rl; if (r.tried) return; r.tried = true;
      if (r.t >= r.ar0 && r.t <= r.ar1) { popup(player.position, 'PERFECT!', '#b9d46e'); reloadDone(true); }
      else { r.jam = true; r.dur = r.t + (r.dur - r.t) * AR_JAM; popup(player.position, 'VASTGELOPEN!', '#e46a4c'); sfx('jam'); hud(); }
      return;
    }
    if (reloadStart() || !gunOut()) return;
    if (P.held.ammo >= WD[P.held.id].mag) popup(player.position, 'AL VOL', '#d4bd92');
    else { popup(player.position, 'GEEN ' + CAL[WD[P.held.id].cal].name, '#e46a4c'); sfx('empty'); }
  }
  function reloadTick(dt) { const r = P.rl; if (!r) return; if (r.h !== P.held || !gunOut()) { P.rl = null; hud(); return; } r.t += dt; if (r.t >= r.dur) reloadDone(false); }
  // pockets the rounds of a dropped gun of the caliber you hold (Neon Vice: same-calibre pickups strip into the pool)
  function stripAmmo(it) {
    if (!isGun(it.id) || !P.guns.some((g) => g && WD[g.id].cal === WD[it.id].cal)) return false;
    const cal = WD[it.id].cal, room = CAL[cal].cap - (state.pool[cal] | 0), n = Math.min(room, it.ammo + (it.spare || 0));
    if (n <= 0) return false;
    const fromSpare = Math.min(it.spare || 0, n); it.spare = (it.spare || 0) - fromSpare; it.ammo -= n - fromSpare;
    state.pool[cal] = (state.pool[cal] | 0) + n; popup(player.position, `+${n} ${CAL[cal].name}`, '#ffd36b'); sfx('pick');
    if (it.ammo <= 0 && !it.own) { root.remove(it.g, it.ring); items.splice(items.indexOf(it), 1); }
    if (gunOut() && P.held.ammo <= 0) reloadStart(); hud(); return true;
  }

  // ================================================================== FX: popups, shake, flash, hitstop, blood, gibs, pools, casings, muzzle flash
  const FX = { shake: 0, freeze: 0, flash: 0, flashC: '255,0,30', kick: new THREE.Vector3(), hurtT: 0 };
  const shake = (v) => { FX.shake = Math.max(FX.shake, v); };
  const popLayer = document.createElement('div'); popLayer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;overflow:hidden'; document.body.appendChild(popLayer);
  const pops = [];
  function popup(at, txt, col = '#b9d46e', big) {
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
  const flashL = new THREE.PointLight(0xffd080, 0, 9, 1.5); let flashT = 0; // added to each level's root in buildLevel
  const flashSp = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffe0a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); flashSp.scale.setScalar(0.7); flashSp.visible = false;
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
  // Enemy types (data-driven): a level's spawn entry may name one as its 7th field (js/levels/*.js). Any level can place them.
  //   zeegaal: STEVEN ZEEGAAL, a 90s action-star parody mini-boss. Unarmed and slow, never picks up guns, takes 4 hits,
  //   lazily leans out of the way of bullets, and his grab is a wrist lock that twists the gun out of Eddy's hand.
  const FOE_TYPES = {
    //   janvankaas: JAN VAN KAAS, boss of the Lampas (Act 1 finale, Pindasausplein). White suit, gold hair; keeps his shotgun, takes 5 hits.
    janvankaas: {
      name: 'JAN VAN KAAS', hp: 5, speed: 0.85, dodge: 0.15, mass: 2.8, score: 5000,
      look: { head: { skin: 0xf2c8a0, hair: '#d8b040', brow: '#a88030', hairLine: 46, mouth: 'smile', iris: '#3a5a8a', slick: true }, front: '#f3ecdc', shirt: 0xf3ecdc, pants: 0xf3ecdc, shoes: 0x7a2e1a, belt: 0xc8a040, belly: 1.3, scale: 1.08 },
      alert: ['Wie laat die snotneus binnen?!', 'Eddy junior. Net zo dom als zijn vader.', 'Dit is MIJN stad!', 'Verdunnen is een kunst, jongen.'],
      hurt: ['Mijn pak!', 'Au! Weet je wel wie ik ben?!', 'Dat ga je betalen.', 'Bewakers!'],
      dodgeSay: ['Mis!', 'Te langzaam.'],
      disarm: ['Niemand pakt mijn geweer.'],
      down: ['JAN VAN KAAS IS DOWN', 'The Lampas are finished.'],
    },
    zeegaal: {
      name: 'STEVEN ZEEGAAL', ps2: 'zeegaal', hp: 4, speed: 0.62, dodge: 0.4, grab: true, noWeapons: true, mass: 2.4, score: 2500,
      look: { head: { skin: 0xe9c2a2, hair: '#0d0b0a', brow: '#14100c', browW: 5, hairLine: 70, sideLine: 112, backLine: 150, mouth: 'smile', squint: true, glasses: true, tint: 'rgba(70,40,30,.62)', goatee: '#17120e', iris: '#2a1c14', slick: true, ponytail: true },
        front: '#1d1a24', shirt: 0x1d1a24, pants: 0x121016, shoes: 0x050505, skirt: 0x1d1a24, belt: 0xc8a040, mandarin: 0xd8b04a, belly: 0.6, scale: 1.1 },
      alert: ['Ik vecht niet. Ik maak het af.', 'Jij hebt de verkeerde snackbar gekozen.', 'Dit wordt... onaangenaam.', 'Rustig. Ik ben getraind.'],
      hurt: ['Interessant.', 'Dat... was een vergissing.', 'Ik voelde niets.', 'Mijn chi is ongedeerd.'],
      dodgeSay: ['Te traag.', 'Hmm.', 'Ik zag het aankomen.'],
      disarm: ['Je pistool... is van mij.', 'Pols. Draaien. Klaar.', 'Dat hoort hier niet.'],
      down: ['STEVEN ZEEGAAL IS DOWN', 'Direct-to-video. Again.'],
    },
  };
  const enemies = [];
  const SHOW_LASERS = false;
  const laserM = new THREE.MeshBasicMaterial({ color: 0xff1030, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  // spawn entry: [cell x, cell z, weapon, facing, room, boss, extra]; extra is an enemy type name (FOE_TYPES) or { type, cap }
  function spawnEnemies(def) { def.spawns.forEach(([x, z, w, rot, room, boss, opt], i) => {
    if (typeof opt === 'string') opt = { type: opt };
    const type = opt && opt.type, FT = type && FOE_TYPES[type];
    const looks = def.foeLooks || LAMPAS_LOOKS, look = looks[i % looks.length], bl = def.bossLook || {}; // a level can dress its enemies (def.foeLooks: the Noshgey Kariot, the Abdavissies)
    const skin = boss ? (bl.skin ?? 0xf0c8a8) : [0xf0c8a8, 0xe0a882, 0xf4d2bc, 0xd8a080][i % 4];
    const head = boss
      ? { skin, hair: '#d8c080', brow: '#a89060', hairLine: 80, sideLine: 116, backLine: 150, mouth: 'smile', glasses: true, iris: '#3a5a7a', ...(bl.head || {}) }
      : { skin, hair: ['#2a2a2a', '#d8c080', '#7a5a30', '#1a1a1a'][i % 4], brow: '#3a2a1a', hairLine: i % 3 === 0 ? 40 : 96, sideLine: 120, backLine: 150, mouth: 'smile', iris: '#3a3a3a' };
    const shirt = boss ? (bl.shirt ?? 0xf2efe6) : look.shirt;
    const p = FT ? makePerson({ ...FT.look, skin: FT.look.head.skin, ps2: FT.ps2 && LOOKS[FT.ps2] }) : makePerson({ head, ballcap: opt && 'cap' in opt ? opt.cap : boss && bl.cap !== undefined ? bl.cap : i % 5 === 2 ? (def.foeCap ?? 0xff7a1a) : undefined, front: boss ? (bl.front ?? '#f2efe6') : look.front, shirt, pants: boss ? (bl.pants ?? 0xf2efe6) : look.pants, shoes: 0x111111, belly: boss ? (bl.belly ?? 1.2) : (i % 3) * 0.4, skin, chain: boss || i % 4 === 1, scale: boss ? 1.08 : 1, lampas: !boss, suit: !!boss });
    scene.remove(p); root.add(p);
    const hand = new THREE.Group(); hand.position.set(0, -0.68, 0.05); p.userData.arms[0].add(hand);
    const laser = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.025, 1), laserM.clone()); laser.visible = false; root.add(laser);
    p.userData.foe = { id: i, spawn: [x, z, rot, w], room, boss: !!boss, type: type || null, hand, laser, skin, shirt, pers: ['rush', 'careful', 'normal'][i % 3], mass: FT ? FT.mass : boss ? 2.6 : 1 + (i % 3) * 0.15 };
    p.userData.bubble = bubble(); p.add(p.userData.bubble); p.userData.bubble.position.set(0, 2.5, 0);
    p.position.set(OX + x, 0, Z0 + z); p.rotation.y = rot;
    enemies.push(p);
  }); }
  function setFoeWeapon(e, id) { const f = e.userData.foe; f.weapon = id; f.hand.clear(); if (id) f.hand.add(weaponMesh(id)); }
  const ALERT_LINES = ['Hé! Wie ben jij?!', 'Het is die Eddy!', 'PAK HEM!', 'Lampas forever!', 'Dit is ons gebied!', 'Eddy Junior?! Grijp hem!'];
  const alive = () => enemies.filter((e) => e.userData.foe.alive);
  // objectives (a level's decorate() returns tasks: [{ pos, obj, label, act(), reset(done) }]): the floor only clears when they are all done
  let tasks = [];
  const tasksLeft = () => tasks.filter((t) => !t.done).length;
  const nearTask = () => { let b = null, bd = 2.5; if (!M.active) return null; for (const t of tasks) if (!t.done) { const d = Math.hypot(player.position.x - t.pos.x, player.position.z - t.pos.z); if (d < bd) { bd = d; b = t; } } return b; };
  function doTask(t) {
    if (!t || t.done) return; t.done = true; if (t.act) t.act();
    R.score += t.score || 750; sfx('thud'); shake(0.35); popup(t.pos, t.doneText || 'SABOTAGED!', '#e8a33d', true);
    const n = tasksLeft(); if (n) banner(`${n} TO GO`, LV.text.taskHint || '', 1.6);
    else if (!alive().length && !R.cleared) { R.cleared = true; popup(t.pos, 'FLOOR CLEAR', '#e8a33d', true); setTimeout(results, 1500); }
    else banner(LV.text.tasksDone || 'ALL DONE', `Now finish off the ${LV.factionName || 'Lampas'}.`, 2);
    hud();
  }

  // ================================================================== ITEMS (weapons on the floor, flying thrown weapons, loot crates)
  const items = [];
  function dropItem(id, at, vx = 0, vz = 0, ammo, flying = false, own = false) {
    if (!id || id === 'maboota' || id === 'fists') return;
    const g = weaponMesh(id); g.rotation.set(Math.PI / 2, 0, Math.random() * 6); g.position.set(at.x, 0.08, at.z);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.35, 0.42, 20), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })); ring.rotation.x = -Math.PI / 2;
    root.add(g, ring); items.push({ id, g, ring, ammo: ammo ?? (WD[id].ammo || 0), spare: ammo === undefined && !own ? (WD[id].spare || 0) : 0, vx, vz, flying, own, age: 0 });
  }
  const lootCrates = [];
  const crateM = lam({ map: canvasTex(64, 64, (g) => { g.fillStyle = '#8a6a3a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#5a3a1a'; g.lineWidth = 4; g.strokeRect(3, 3, 58, 58); g.beginPath(); g.moveTo(3, 3); g.lineTo(61, 61); g.stroke(); g.fillStyle = '#ff7a1a'; g.font = '900 12px Arial'; g.textAlign = 'center'; g.fillText('LAMPAS', 32, 36); }) });
  function buildLoot(def) { for (const [x, z] of def.loot) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.45, 0.55), crateM); c.position.set(OX + x, 0.23, Z0 + z); c.castShadow = true; root.add(c);
    const glow = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.52, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.7 })); glow.rotation.x = -Math.PI / 2; glow.position.set(OX + x, 0.04, Z0 + z); root.add(glow);
    lootCrates.push({ c, glow, taken: false });
  } }

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
    #nvScore{position:fixed;right:24px;top:70px;z-index:5;display:none;text-align:right;color:#f08a3c;text-shadow:3px 3px 0 #7a2e1a,5px 5px 0 #3b1d0e;font-size:20px;font-family:'Press Start 2P',ui-monospace,monospace}
    #nvScore .c{font-size:14px;color:#ffd36b;text-shadow:2px 2px 0 #000;margin-top:8px}#nvScore .l{font-size:10px;color:#7a2e1a;text-shadow:2px 2px 0 #000;margin-top:8px}
    #nvGrain{position:fixed;inset:0;pointer-events:none;z-index:4;display:none;opacity:.22;mix-blend-mode:overlay;background-size:160px 160px;animation:nvg .25s steps(4) infinite}
    #nvScan{position:fixed;inset:0;pointer-events:none;z-index:4;display:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.18) 0 1px,transparent 1px 3px)}
    @keyframes nvg{0%{background-position:0 0}25%{background-position:-40px 30px}50%{background-position:30px -50px}75%{background-position:-60px -20px}100%{background-position:10px 40px}}
    #nvVig,#nvFlash{position:fixed;inset:0;pointer-events:none;z-index:4;opacity:0}
    #nvScreen{position:fixed;inset:0;z-index:20;display:none;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(16,9,4,.72);color:#fff}
    #nvScreen .big{font-family:'Press Start 2P',monospace;font-size:clamp(26px,6vw,56px)}
    #nvScreen .red{color:#ff2a3a;text-shadow:3px 3px 0 #3a0010,0 0 18px #ff0030}
    #nvScreen .logo2{font-family:'Press Start 2P',monospace;font-size:clamp(14px,3vw,26px);color:#7a2e1a;text-shadow:2px 2px 0 #e8a33d}
    #nvScreen .hint{font-family:'VT323',monospace;font-size:22px;color:#f0dcb4;margin-top:14px;max-width:720px}
    #nvScreen .stats{font-family:'VT323',monospace;font-size:24px;line-height:1.25;margin:14px 0;color:#f3e6c8;text-align:left;min-width:min(420px,90vw)}
    #nvScreen .stats b{color:#b9d46e;float:right;margin-left:30px;font-weight:normal}
    #nvScreen .grade{font-family:'Press Start 2P',monospace;font-size:clamp(40px,9vw,84px);color:#ffd36b;text-shadow:4px 4px 0 #c2412d}
    #nvScreen .btn{font-family:'Press Start 2P',monospace;font-size:13px;background:#c2412d;color:#fff;padding:13px 20px;margin-top:16px;box-shadow:4px 4px 0 #7a2e1a}
    #nvBanner{position:fixed;left:0;right:0;top:22%;z-index:6;text-align:center;pointer-events:none;opacity:0;transition:opacity .35s}
    #nvBanner .b1{font-family:'Press Start 2P',monospace;font-size:clamp(18px,4.5vw,38px);color:#e8a33d;text-shadow:3px 3px 0 #7a2e1a}
    #nvBanner .b2{font-family:'VT323',monospace;font-size:24px;color:#fff;margin-top:10px;text-shadow:2px 2px 0 #000}
    #nvInv{position:fixed;inset:0;z-index:25;display:none;align-items:center;justify-content:center;background:rgba(16,9,4,.78)}
    #nvInv .box{width:min(760px,94vw);max-height:86vh;overflow:auto;background:#1e140c;border:3px solid #e8a33d;box-shadow:6px 6px 0 #7a2e1a;padding:18px 22px;color:#f3e6c8}
    #nvInv h2{margin:0 0 4px;font:16px 'Press Start 2P',monospace;color:#f08a3c;text-shadow:2px 2px 0 #7a2e1a}
    #nvInv .sub{font:20px 'VT323',monospace;color:#c9ae86;margin-bottom:12px}
    #nvInv .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}
    #nvInv .it{background:#2a1a0e;border:2px solid #4a2c16;padding:10px;display:flex;gap:10px;align-items:flex-start}
    #nvInv .it.eq{border-color:#a9c46a}
    #nvInv .ic{width:46px;height:46px;flex:none;background:#140c06;border:2px solid #6b4426;display:flex;align-items:center;justify-content:center;font-size:26px}
    #nvInv .nm{font:11px 'Press Start 2P',monospace;color:#fff;line-height:1.4}
    #nvInv .ds{font:18px 'VT323',monospace;color:#d4bd92;line-height:1.05;margin-top:4px}
    #nvInv .tag{font:9px 'Press Start 2P',monospace;color:#a9c46a;margin-top:6px}
    #nvReload{position:fixed;z-index:6;display:none;width:84px;height:9px;margin-left:-42px;background:rgba(255,255,255,.16);outline:2px solid rgba(0,0,0,.8);pointer-events:none}
    #nvReload .g{position:absolute;top:0;bottom:0;background:#b9d46e}#nvReload .f{position:absolute;left:0;top:0;bottom:0;background:rgba(194,65,45,.5)}
    #nvReload .m{position:absolute;top:-3px;bottom:-3px;width:2px;margin-left:-1px;background:#fff}#nvReload.jam .f{background:rgba(255,74,90,.65)}
    #nvReload .t{position:absolute;left:50%;top:-17px;transform:translateX(-50%);font:8px 'Press Start 2P',monospace;color:#fff;text-shadow:1px 1px 0 #000;white-space:nowrap}
    @media (max-width:820px),(max-height:500px){#nvHud{left:12px;bottom:10px}#nvHud .hp{font-size:16px}#nvHud .w{font-size:8px;margin-top:5px}#nvScore{font-size:13px;right:12px;top:58px}#nvScore .c{font-size:10px}#nvScore .l{font-size:7px}#nvBanner .b2{font-size:18px;padding:0 12px}#nvInv .box{padding:12px}#nvInv .grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))}}
    body.touch #nvHud{bottom:auto;top:calc(96px + env(safe-area-inset-top));left:calc(12px + env(safe-area-inset-left))}
    #nvInv .box{touch-action:pan-y;-webkit-overflow-scrolling:touch}
    #nvInv button{min-height:36px}
    #nvInv .foot{font:18px 'VT323',monospace;color:#9a86b6;margin-top:14px;display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}`;
  document.head.appendChild(css);
  if (!document.querySelector('link[data-nvfont]')) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.dataset.nvfont = 1; l.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap'; document.head.appendChild(l); }
  const mk = (id) => { const d = document.createElement('div'); d.id = id; document.body.appendChild(d); return d; };
  const hudEl = mk('nvHud'), scoreEl = mk('nvScore'), grainEl = mk('nvGrain'), scanEl = mk('nvScan'), vigEl = mk('nvVig'), flashEl = mk('nvFlash'), screenEl = mk('nvScreen'), bannerEl = mk('nvBanner'), invEl = mk('nvInv'), reloadEl = mk('nvReload');
  reloadEl.innerHTML = '<div class="g"></div><div class="f"></div><div class="m"></div><div class="t"></div>';
  { const c = document.createElement('canvas'); c.width = c.height = 160; const g = c.getContext('2d'), id = g.createImageData(160, 160); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } g.putImageData(id, 0, 0); grainEl.style.backgroundImage = `url(${c.toDataURL()})`; }
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#0a0410;opacity:0;pointer-events:none;transition:opacity .45s;z-index:30'; document.body.appendChild(fade);
  let bannerT = 0;
  function banner(a, b, t = 3) { bannerEl.innerHTML = `<div class="b1">${a}</div><div class="b2">${b || ''}</div>`; bannerEl.style.opacity = 1; bannerT = t; }
  function gunLabel(n) {
    const h = P.guns[n - 2]; if (!h) return `[${n}] —`;
    const on = P.slot === n;
    return `[${n}] ${WD[h.id].name} ${h.ammo}/${WD[h.id].mag} <span style="color:#c9ae86">+${poolOf(h.id)}</span>` + (on && P.rl ? ` <span style="color:${P.rl.jam ? '#ff4a5a' : '#b9d46e'}">${P.rl.jam ? 'VASTGELOPEN' : 'HERLADEN'}</span>` : on && h.ammo <= 0 ? ` <span style="color:#ff4a5a">${poolOf(h.id) ? 'LEEG · ' + glyph('R') : 'LEEG · ' + glyph('F') + ' TO THROW'}</span>` : '');
  }
  function hud() {
    const wbox = $('weapon');
    if (wbox) wbox.style.visibility = M.active ? 'hidden' : 'visible';
    if (wbox && state.kit.includes('maboota')) wbox.innerHTML = `<span style="color:${state.armed ? '#e8a33d' : '#888'}">[1] MABOOTA</span><br><span style="color:#888;font-size:.8em">[I] INVENTORY</span>`;
    const on = M.active; hudEl.style.display = scoreEl.style.display = grainEl.style.display = scanEl.style.display = on ? 'block' : 'none';
    if (!on) return;
    let hp = ''; for (let i = 0; i < P.maxhp; i++) hp += i < P.hp ? '♥' : '<i>♥</i>';
    hudEl.innerHTML = `<div class="hp">${hp}${P.armor ? ' <span style="color:#ffd23a;font-size:12px">VEST</span>' : ''}</div><div class="w"><span style="color:${P.slot === 1 ? '#e8a33d' : '#777'}">[1] ${P.slot === 1 && P.useBat ? WD.bat.name : 'MABOOTA'}${P.melee && !(P.slot === 1 && P.useBat) ? ' <i style="font-style:normal;color:#777">/ BAT</i>' : ''}</span><span style="color:${P.slot === 2 ? '#a9c46a' : '#777'}">${gunLabel(2)}</span><span style="color:${P.slot === 3 ? '#a9c46a' : '#777'}">${gunLabel(3)}</span></div><div class="w" style="color:#ff7a1a">${LV.faction || 'LAMPAS'} LEFT: ${alive().length}${tasks.length ? ` <span style="color:#e8a33d;margin-left:10px">${(LV.taskName || 'TARGET')}S: ${tasks.length - tasksLeft()}/${tasks.length}</span>` : ''}${state.loot ? ` <span style="color:#ffd23a;margin-left:10px">SPICE ×${state.loot}</span>` : ''}</div>`;
    scoreEl.innerHTML = `W ${R.score.toLocaleString('nl-NL')}${R.combo > 1 ? `<div class="c">${R.combo}× COMBO</div>` : ''}<div class="l">${LV.text.area}</div>`;
  }
  function showScreen(html) { screenEl.innerHTML = html; screenEl.style.display = 'flex'; bannerEl.style.opacity = 0; bannerT = 0; const t = $('toast'); if (t) t.style.display = 'none'; }
  function hideScreen() { screenEl.style.display = 'none'; }

  // ================================================================== INVENTORY (I)
  const ICON = { maboota: '🏏', makarov: '🔫', shotgun: '💥', bat: '⚾', vest: '🦺', ammo: '📦', shells: '🧨', loot: '🌶️', stash: '🗄️', money: '💶', shoarma: '🥙' };
  const INFO = { maboota: ['Maboota', 'A Russian police truncheon. Knocks people down; hit them again on the floor to finish them.', 'A gift from The Russian'] };
  let invOpen = false, invMode = 'inv';
  function openInv() {
    const shop = ctx.shop || [], row = [];
    const add = (id, name, desc, src, count, eq) => row.push(`<div class="it${eq ? ' eq' : ''}"><div class="ic">${ICON[id] || '▪'}</div><div><div class="nm">${name}${count > 1 ? ' ×' + count : ''}</div><div class="ds">${desc}</div><div class="tag">${src}${eq ? ' · EQUIPPED' : ''}</div></div></div>`);
    if (state.kit.includes('maboota')) add('maboota', ...INFO.maboota, 1, P.slot === 1 && state.armed);
    const L = state.loadout, gear = M.active ? { guns: P.guns, melee: P.melee && P.melee.id, vest: P.armor > 0 } : { guns: L.guns, melee: L.melee, vest: L.vest > 0 };
    if (gear.melee) add('bat', WD.bat.name, 'Kills in one swing. On a mission: press 1 again to switch from the Maboota.', 'Slot 1', 1, M.active && P.held && P.held.id === 'bat');
    gear.guns.forEach((g, i) => { if (g) add(g.id, WD[g.id].name, `Loaded ${g.ammo}/${WD[g.id].mag}. Comes along on every mission.`, `Slot ${i + 2}`, 1, M.active && P.held === g); });
    if (gear.vest) add('vest', 'Kevlar vest', 'Stops one bullet, then it\'s done. Buy a new one from The Russian.', 'Worn', 1);
    if (state.pool['9mm']) add('ammo', '9mm rounds', 'In your pocket. R reloads the Makarov from here.', 'Pocket', state.pool['9mm']);
    if (state.pool['12ga']) add('shells', 'Hagel (shells)', 'In your pocket. R reloads the sawn-off from here.', 'Pocket', state.pool['12ga']);
    if (state.stash.length) add('stash', 'De Kluis', state.stash.map((s) => gearName(s.id)).join(', ') + '. Store and swap gear at the kluis in the warehouse.', `Home · ${state.stash.length}/${STASH_CAP}`, 1);
    if (state.loot) add('loot', 'Lampas spice crate', 'Stolen from the Lampas warehouse. Sell it on Kaasplaats (PC) for W 150 each.', 'Loot', state.loot);
    if (state.metSchmatzel) add('shoarma', 'Shoarma broodje', 'Schmatzel\'s, on the house. Your father\'s favourite.', 'From Schmatzel', 1);
    invEl.innerHTML = `<div class="box"><h2>INVENTORY</h2><div class="sub">Eddy de Kruidenmeester Jr. · Wilders W ${(state.money || 0).toLocaleString('nl-NL')}${state.loan && state.loan.out ? ` · Nabil owes you W ${(state.loan.amount * 2).toLocaleString('nl-NL')}` : ''}</div><div class="grid">${row.join('') || '<div class="ds">Nothing yet. Talk to people. Visit The Russian.</div>'}</div><div class="foot"><span>Slot 1: melee. Slots 2 + 3: guns, on missions only. What you carry out of a mission stays with you.</span><span>[I] / [Esc] close</span></div></div>`;
    invEl.style.display = 'flex'; invOpen = true; invMode = 'inv';
  }
  function closeInv() { invEl.style.display = 'none'; invOpen = false; }

  // ================================================================== RUN STATE
  const M = { active: false };
  // ================================================================== REMIX RAIDS (replayability)
  // An owned joint can be raided again: the Lampas restock it every market day. Each run is rolled from a seed
  // (level + market day), so a reload can't reroll it: non-boss Lampas swap spawn spots and weapons, some stay
  // home, loot crates sit at a random few of the level's spots, and one modifier changes the night.
  const REMIX_MODS = {
    normaal: { name: 'GEWONE AVOND', line: 'The Lampas restocked. Business as usual.', keep: [0.7, 0.9], pay: 1, w: 35 },
    stroom: { name: 'STROOMSTORING', line: 'Power cut. Listen for footsteps. Pay x1.3.', keep: [0.7, 0.9], pay: 1.3, dark: true, w: 20 },
    spits: { name: 'SPITSUUR', line: 'Rush hour: the whole crew is in. Pay x1.5.', keep: [1, 1], pay: 1.5, guns: 0.15, w: 20 },
    kassa: { name: 'KASSA VOL', line: 'The till is full and they are armed for it. Pay x2.', keep: [0.8, 1], pay: 2, guns: 0.5, w: 10 },
    rustig: { name: 'RUSTIGE AVOND', line: 'A quiet night. Fewer Lampas, half pay.', keep: [0.45, 0.55], pay: 0.5, w: 15 },
  };
  const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hashStr = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  function remixFor(id, day) { // what tonight's remix of a level is (deterministic per level and market day)
    const seed = hashStr(`${id}#${day}`), r = rng32(seed);
    let x = r() * Object.values(REMIX_MODS).reduce((a, m) => a + m.w, 0), mod = 'normaal';
    for (const [k, m] of Object.entries(REMIX_MODS)) { x -= m.w; if (x <= 0) { mod = k; break; } }
    return { seed, mod, day };
  }
  let REMIX = null;
  function rollRemix(opt) {
    const r = rng32(opt.seed ^ 0x9e3779b9), m = REMIX_MODS[opt.mod] || REMIX_MODS.normaal;
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const grunts = enemies.map((e, i) => i).filter((i) => !enemies[i].userData.foe.boss && !enemies[i].userData.foe.type);
    const spots = shuffle(grunts.map((i) => enemies[i].userData.foe.spawn));
    const arms = shuffle(grunts.map((i) => enemies[i].userData.foe.spawn[3]));
    const place = {}, weapons = {}, keep = new Set(enemies.map((e, i) => i).filter((i) => !grunts.includes(i)));
    const nKeep = Math.round(grunts.length * (m.keep[0] + r() * (m.keep[1] - m.keep[0])));
    grunts.forEach((i, k) => { place[i] = spots[k]; let w = arms[k]; if (m.guns && r() < m.guns) w = w === 'makarov' ? 'shotgun' : 'makarov'; weapons[i] = w; });
    for (const i of shuffle(grunts.slice()).slice(0, nKeep)) keep.add(i);
    const loot = new Set(shuffle(lootCrates.map((l, i) => i)).slice(0, Math.min(3, lootCrates.length)));
    return { ...opt, m, place, weapons, keep, loot };
  }
  M.REMIX_MODS = REMIX_MODS; M.remixFor = remixFor;
  Object.defineProperty(M, 'remix', { get: () => REMIX, enumerable: true });
  const R = { score: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, execs: 0, heads: 0, glass: 0, shots: 0, hits: 0, taken: 0, time: 0, cleared: false, results: false, ammoAtStart: {}, poolAtStart: {}, lootAtStart: 0, lastOneShown: false };
  const saved = {};
  function resetFloor() {
    cancelArrive(); // a restart never replays the drive in
    const done = ownsLevel(LV.id) && !REMIX;
    // glass and barrels come back
    for (const [k, q] of pristine.glass) { glass.set(k, q); G[q.z][q.x] = '%'; q.s.off = false; q.pane.visible = true; }
    for (const [k, b] of pristine.barrels) { if (!barrels.has(k)) root.add(b.g); barrels.set(k, b); G[b.z][b.x] = 'X'; b.s.off = false; }
    for (const e of enemies) {
      const f = e.userData.foe, u = e.userData, i = enemies.indexOf(e);
      let [x, z, r, w] = f.spawn, off = done;
      if (REMIX) { if (REMIX.place[i]) [x, z, r] = REMIX.place[i]; if (i in REMIX.weapons) w = REMIX.weapons[i]; off = !REMIX.keep.has(i); }
      Object.assign(f, { alive: !off, down: 0, hp: f.type ? FOE_TYPES[f.type].hp : f.boss ? 2 + (LV.foeHp || 1) - 1 : (LV.foeHp || 1), dodgeT: 0, named: false, leanT: 0, state: 'idle', react: 0, cd: 0, wind: 0, seeT: 99, path: null, pathT: 0, sx: 0, sz: 0, searchT: 0, turnT: Math.random() * 3, ta: r, vx: 0, vz: 0, vy: 0, y: 0, spin: 0, lkx: 0, lkz: 0, found: false, wary: false, aiming: false, strT: 0, strD: 1, atkT: 0, body: false, mvx: 0, mvz: 0, headless: false, fountain: 0, smear: 0 });
      setFoeWeapon(e, off ? null : w);
      e.position.set(OX + x, 0, Z0 + z); e.rotation.y = r; e.visible = !off; u.body.rotation.set(0, 0, 0); u.body.position.y = 0; u.head.visible = true; cleanBlood(e); u.arms[1].visible = true; u.bubble.visible = false; f.laser.visible = false;
    }
    for (const it of items) root.remove(it.g, it.ring); items.length = 0;
    for (const b of bullets) root.remove(b.m); bullets.length = 0;
    for (const p of parts) root.remove(p.m); parts.length = 0;
    for (const g of gibs) root.remove(g.m); gibs.length = 0;
    for (const d of decals) root.remove(d); decals.length = 0; pools.length = 0;
    for (const d of doors) { d.th = 0; d.w = 0; d.g.rotation.y = d.base; }
    for (const p of pops) p.el.remove(); pops.length = 0;
    state.loot = R.lootAtStart; lootCrates.forEach((l, i) => { const t = REMIX ? !REMIX.loot.has(i) : (state.lootTaken[LV.id] || []).includes(i); l.taken = t; l.c.visible = l.glow.visible = !t; });
    Object.assign(state.ammo, R.ammoAtStart); Object.assign(state.pool, R.poolAtStart);
    for (const t of tasks) { t.done = !!done; if (t.reset) t.reset(t.done); }
    Object.assign(R, { score: 0, combo: 0, comboT: 0, maxCombo: 0, kills: 0, execs: 0, heads: 0, glass: 0, shots: 0, hits: 0, taken: 0, time: 0, cleared: done, results: false, lastOneShown: false, foes: Math.max(1, alive().length) });
    if (R.loadoutAtStart) state.loadout = JSON.parse(JSON.stringify(R.loadoutAtStart)); // a restart puts back the kit you came in with
    loadKit(); P.rl = null;
    Object.assign(P, { hp: EASY.hp, maxhp: EASY.hp, armor: state.loadout.vest > 0 ? 1 : 0, invT: 0, lastHurt: 0, dead: false, deadT: 0, fireT: 0, bloom: 0, exec: 0, vx: 0, vz: 0, rl: null, sprint: false, stepT: 0 });
    const u = player.userData; u.body.rotation.set(0, 0, 0); u.body.position.y = 0; cleanBlood(player);
    player.position.copy(START()); player.rotation.y = Math.PI; P.last.copy(player.position);
    P.slot = 1; selectSlot(P.guns[0] ? 2 : P.guns[1] ? 3 : 1, true); hideScreen(); FX.shake = FX.freeze = FX.flash = FX.hurtT = 0; M.snap = true; hud();
  }
  function enter(id = 'spekbuurt', opts = {}) {
    if (M.active || !LEVELS[id]) return;
    fade.style.opacity = '1'; closeInv();
    setTimeout(() => {
      if (!LV || LV.id !== id) buildLevel(LEVELS[id]);
      REMIX = opts.remix && ownsLevel(id) ? rollRemix(opts.remix) : null;
      const mood = LV.mood;
      M.active = true; root.visible = true; clearPlayerSplats();
      saved.bg = scene.background.clone(); saved.fog = [scene.fog.color.clone(), scene.fog.near, scene.fog.far]; saved.hemi = hemi.intensity; saved.sun = sun.intensity; saved.hemiC = [hemi.color.clone(), hemi.groundColor.clone()];
      scene.background.set(mood.bg); scene.fog.color.set(mood.bg); scene.fog.near = mood.fogNear; scene.fog.far = mood.fogFar; hemi.intensity = mood.hemi; sun.intensity = mood.sun; if (mood.sky) hemi.color.set(mood.sky); if (mood.ground) hemi.groundColor.set(mood.ground); // optional per-level ambient colours
      lights.forEach(([l, k]) => { l.intensity = k; });
      if (REMIX && REMIX.m.dark) { lights.forEach(([l, k]) => { l.intensity = k * 0.2; }); hemi.intensity *= 0.45; sun.intensity *= 0.4; }
      setBounds({ x0: OX + LV.bounds[0], x1: OX + LV.bounds[1], z0: LV.bounds[2], z1: LV.bounds[3] });
      R.lootAtStart = state.loot || 0; saveOwnAmmo(); R.ammoAtStart = { ...state.ammo }; R.poolAtStart = { ...state.pool }; R.loadoutAtStart = JSON.parse(JSON.stringify(state.loadout));
      resetFloor();
      setArea(LV.text.area);
      $('objective').innerHTML = REMIX ? (REMIX.daily ? `<b>DAILY CHALLENGE ${REMIX.daily} · ${REMIX.m.name}</b>: the same raid for everyone today. Beat your best score. ${REMIX.m.line}` : REMIX.retake ? `<b>RETAKE · ${REMIX.m.name}</b>: the Lampas took this joint back. Clear them out and it's yours again. ${REMIX.m.line}` : `<b>Remix raid · ${REMIX.m.name}</b>: the Lampas moved back in. Clear the joint again. ${REMIX.m.line}`) : ownsLevel(LV.id) ? LV.text.objectiveOwned : LV.text.objective;
      fade.style.opacity = '0';
      startArrive(() => { if (REMIX) banner(REMIX.retake ? `TAKE IT BACK · ${REMIX.m.name}` : REMIX.daily ? `DAILY CHALLENGE · ${REMIX.m.name}` : `REMIX · ${REMIX.m.name}`, REMIX.m.line, 4); else if (!ownsLevel(LV.id)) banner(LV.text.banner[0], LV.text.banner[1] + ' ' + controlsLine(), 4.5); });
    }, 480);
  }
  function exit() {
    fade.style.opacity = '1'; closeInv();
    setTimeout(() => {
      saveOwnAmmo(); M.active = false; root.visible = false; REMIX = null; clearPlayerSplats(); P.rl = null; reloadEl.style.display = 'none';
      scene.background.copy(saved.bg); scene.fog.color.copy(saved.fog[0]); scene.fog.near = saved.fog[1]; scene.fog.far = saved.fog[2]; hemi.intensity = saved.hemi; if (saved.hemiC) { hemi.color.copy(saved.hemiC[0]); hemi.groundColor.copy(saved.hemiC[1]); } sun.intensity = saved.sun;
      lights.forEach(([l]) => { l.intensity = 0; }); flashL.intensity = 0;
      setBounds(null);
      R.lootAtStart = state.loot || 0;
      commitKit(); // guns, rounds and the vest you walk out with come home with you
      holster(); syncHeld(); maboota.visible = true; equip(true);
      const u = player.userData; u.body.rotation.set(0, 0, 0); u.body.position.y = 0; cleanBlood(player);
      player.position.set(5.3, 0, -5.8); player.rotation.y = Math.PI;
      setArea('KAASLAND · KIPKRUIDENKWARTIER'); hideScreen(); for (const p of pops) p.el.remove(); pops.length = 0;
      vigEl.style.opacity = flashEl.style.opacity = 0; bannerEl.style.opacity = 0; hud();
      updateObjective(); if (ctx.save) ctx.save();
      fade.style.opacity = '0';
    }, 480);
  }
  addInteract({ get obj() { const t = nearTask(); return t ? t.obj : van; }, pos: () => (nearTask() || { pos: van.position }).pos, r: 2.5, enabled: () => M.active && !P.dead && !R.results && !ARR && !!nearTask(), label: () => nearTask().label, act: () => doTask(nearTask()) });
  addInteract({ get obj() { return van; }, pos: () => van.position, r: 4.2, enabled: () => M.active && !P.dead && !R.results && !ARR, label: () => ownsLevel(LV.id) ? 'Oofmobiel · drive home' : 'Oofmobiel · retreat to Kipkruidenkwartier', act: exit });

  // ================================================================== KILLS, KNOCKDOWNS, SCORE
  function addKillScore(e, type) {
    R.combo++; R.comboT = 3.5; R.maxCombo = Math.max(R.maxCombo, R.combo);
    const pts = (KILLPTS[type] || 300) * Math.min(R.combo, 8);
    R.score += pts; popup(e.position, '+W ' + pts.toLocaleString('nl-NL') + (R.combo > 1 ? '  ×' + R.combo : ''), R.combo > 2 ? '#f08a3c' : '#b9d46e');
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
    bloody(e, type === 'exec' || type === 'shotgun' || type === 'boom' ? 3 : 2);
    bloodBurst(e.position, dir, type === 'shotgun' || type === 'exec' || type === 'boom' ? 40 : 22, type === 'shotgun' ? 6 : 4);
    floorDecal(e.position.x + dir[0] * 0.3, e.position.z + dir[1] * 0.3, 1.1 + Math.random() * 0.4, Math.random() * 6);
    addPool(e, type === 'shotgun' || type === 'exec' || type === 'boom');
    // gore (Neon Vice dismember): shotguns up close take heads and arms, bats sometimes
    const pd = e.position.distanceTo(player.position);
    if (type === 'shotgun' && pd < 3.2) { if (Math.random() < 0.55) headPop(e, dir); else limbOff(e, dir); }
    else if ((type === 'bat' && Math.random() < 0.2) || (type === 'makarov' && Math.random() < 0.08)) limbOff(e, dir);
    sfx('splat'); FX.freeze = type === 'exec' ? 0.14 : 0.045; shake(type === 'shotgun' ? 0.4 : 0.25);
    R.kills++; if (type === 'exec') R.execs++; addKillScore(e, type);
    if (f.type) { const FT = FOE_TYPES[f.type]; banner(FT.down[0], FT.down[1], 2.5); shake(0.6); FX.freeze = 0.3; R.score += FT.score; }
    else if (f.boss) { banner(LV.text.bossDown[0], LV.text.bossDown[1], 2.5); shake(0.6); FX.freeze = 0.3; }
    const left = alive().length;
    if (left === 1 && !R.lastOneShown) { R.lastOneShown = true; popup(alive()[0].position, 'LAST ONE', '#e8a33d', true); }
    if (left === 0 && !tasksLeft() && !R.cleared) { R.cleared = true; popup(e.position, 'FLOOR CLEAR', '#e8a33d', true); shake(0.5); setTimeout(results, 1500); }
    else if (left === 0 && tasksLeft()) popup(e.position, `${tasksLeft()} ${LV.taskName || 'TARGET'}${tasksLeft() > 1 ? 'S' : ''} LEFT`, '#e8a33d', true);
    hud();
  }
  function knockdown(e, dir) {
    const f = e.userData.foe; if (!f.alive) return;
    if (f.boss) { stagger(e, dir); hitEnemy(e, 'door', dir, 1); return; }
    f.down = 3.0; f.vx = dir[0] * 4; f.vz = dir[1] * 4; f.wind = 0; f.laser.visible = false;
    if (f.weapon) { dropItem(f.weapon, e.position, dir[0] * 3, dir[1] * 3); setFoeWeapon(e, null); }
    e.rotation.y = Math.atan2(-dir[0], -dir[1]); f.state = 'chase'; sfx('hit'); bloodBurst(e.position, dir, 6, 2); bloody(e, 1);
    say(e.userData.bubble, ['AU!', 'Mijn hoofd!', 'Ooompf!', 'Vuile...'][Math.floor(Math.random() * 4)], '#ff7a1a');
  }
  function stagger(e, dir) { const f = e.userData.foe; f.vx += dir[0] * 3; f.vz += dir[1] * 3; f.cd = Math.max(f.cd, 0.5); f.wind = 0; sfx('hit'); if (f.state !== 'chase') { f.state = 'chase'; f.react = 0.4; } }
  // Zeegaal-style dodge: a small, almost bored lean to the side; the bullet goes past (not while he's winding up or down)
  function tryDodge(e, b) {
    const f = e.userData.foe, FT = f.type && FOE_TYPES[f.type];
    if (!FT || !FT.dodge || f.down > 0 || f.wind > 0 || f.dodgeT > 0 || Math.random() > FT.dodge) return false;
    b.hit.add(e); f.dodgeT = 0.7; f.leanT = 0.45; f.leanS = Math.random() < 0.5 ? -1 : 1;
    say(e.userData.bubble, pickLine(FT, 'dodgeSay'), '#ffd36b');
    popup(e.position, 'ONTWEKEN', '#9fd3ff'); return true;
  }
  const pickLine = (FT, k) => { const a = k === 'dodgeSay' ? FT.dodgeSay || ['Te traag.'] : FT[k]; return a[Math.floor(Math.random() * a.length)]; };
  // wrist lock: twists the gun out of Eddy's hand and throws it behind him; bare-handed Eddy just gets hurt and shoved
  function wristLock(e, dir) {
    const f = e.userData.foe, FT = FOE_TYPES[f.type];
    if (gunOut()) {
      const h = P.held, a = Math.atan2(dir[0], dir[1]) + (Math.random() - 0.5) * 0.8;
      dropItem(h.id, player.position, Math.sin(a) * 9, Math.cos(a) * 9, h.ammo, false, h.own);
      P.guns[P.slot - 2] = null; P.slot = 1; P.rl = null; syncHeld();
      P.vx += dir[0] * 4; P.vz += dir[1] * 4; shake(0.35); sfx('throw'); sfx('hit');
      popup(player.position, 'ONTWAPEND!', '#e46a4c', true); say(e.userData.bubble, pickLine(FT, 'disarm'), '#ffd36b');
      f.cd = 1.4; return;
    }
    hurtPlayer(dir, 'fists'); P.vx += dir[0] * 6; P.vz += dir[1] * 6;
  }
  function hitEnemy(e, type, dir, dmg) {
    const f = e.userData.foe; if (!f.alive) return;
    if (f.hp > dmg) { f.hp -= dmg; bloodBurst(e.position, dir, 12, 3); floorDecal(e.position.x + dir[0] * 0.4, e.position.z + dir[1] * 0.4, 0.5, Math.random() * 6); popup(e.position, f.type ? FOE_TYPES[f.type].hurt[Math.floor(Math.random() * FOE_TYPES[f.type].hurt.length)] : 'IS DAT ALLES?!', '#ffd36b'); f.state = 'chase'; f.react = Math.min(f.react, 0.2); return; }
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
    bloody(player, R.taken >= 2 ? 2 : 1);
    if (P.hp > 1 && cause !== 'boom') {
      P.hp--; P.invT = 1.1; P.lastHurt = R.time; shake(0.45); FX.flash = 0.45; FX.flashC = '230,0,13'; FX.hurtT = 0.7; sfx('hurt');
      popup(player.position, P.hp === 1 ? 'LAST HIT!' : 'HIT!', '#ff4a5a', true); bloodBurst(player.position, dir, 14, 3); floorDecal(player.position.x, player.position.z, 0.6, Math.random() * 6);
      P.vx += dir[0] * 5; P.vz += dir[1] * 5; hud(); return;
    }
    P.hp = 0; P.dead = true; P.deadT = 0; P.cause = cause; R.combo = 0; R.comboT = 0;
    player.rotation.y = Math.atan2(-dir[0], -dir[1]); P.vx = dir[0] * (FORCE[cause] || 4); P.vz = dir[1] * (FORCE[cause] || 4);
    bloodBurst(player.position, dir, 60, 5); floorDecal(player.position.x + dir[0] * 0.3, player.position.z + dir[1] * 0.3, 1.4, Math.random() * 6);
    sfx('splat'); sfx('die'); FX.flash = 0.5; FX.flashC = '204,0,13'; shake(0.6); hud();
    const by = { bat: 'Beaten with a honkbalknuppel.', makarov: 'Shot with a Makarov.', shotgun: 'Blown away by a sawn-off.', fists: `Punched out by a ${(LV && LV.factionName) || 'Lampas'}.`, boom: 'Too close to a red barrel.', hazard: (LV && LV.hazard && LV.hazard.death) || 'Burnt.' }[cause] || 'Killed by the Lampas.';
    setTimeout(() => { if (P.dead && M.active) showScreen(`<div class="big red">JE BENT DOOD</div><div class="hint" style="color:#ffb3bd">${by}</div><div class="hint">${((tl) => tl[Math.floor(Math.random() * tl.length)])([...TIPS, ...(LV.text.tips || [])])}</div><div class="btn">RETRY · ${glyph('Backspace')}</div>`); }, 900);
  }

  // ================================================================== RESULTS (Neon Vice grade: score vs. 700 per enemy)
  function results() {
    if (!M.active) return;
    R.results = true; setOwned(LV.id); state.lastRaid = { id: LV.id, remix: !!REMIX, grade: null }; state.raids = (state.raids || 0) + 1;
    if (!REMIX) setLootTaken(LV.id, lootCrates.map((l, i) => (l.taken ? i : -1)).filter((i) => i >= 0));
    const ratio = R.score / ((R.foes || enemies.length) * 700), gr = ratio > 3 ? 'S' : ratio > 2.2 ? 'A+' : ratio > 1.6 ? 'A' : ratio > 1.1 ? 'B' : ratio > 0.7 ? 'C' : 'D';
    const pay = Math.round(R.score / 100 * (REMIX ? REMIX.m.pay : 1)) * 10; R.pay = pay; R.grade = gr;
    // personal bests per level (shown on the map); remixes count too
    state.best = state.best && typeof state.best === 'object' ? state.best : {};
    const prev = state.best[LV.id], isBest = !prev || R.score > prev.score;
    if (isBest) state.best[LV.id] = { score: R.score, grade: gr, time: Math.floor(R.time), runs: ((prev && prev.runs) || 0) + 1, stars: (prev && prev.stars) || {} }; else prev.runs = (prev.runs || 0) + 1;
    // level challenges: four stars per level, kept forever
    const par = LV.par || 60 + 8 * (R.foes || enemies.length);
    const ch = { S: gr === 'S', melee: R.shots === 0, par: R.time <= par, clean: R.taken === 0 };
    const bs = state.best[LV.id]; bs.stars = { ...(bs.stars || {}) }; const newStar = Object.keys(ch).some((k) => ch[k] && !bs.stars[k]); for (const k of Object.keys(ch)) if (ch[k]) bs.stars[k] = true;
    if (REMIX && REMIX.daily) { const d = state.daily && state.daily.date === REMIX.daily ? state.daily : { date: REMIX.daily, best: 0 }; d.best = Math.max(d.best, R.score); state.daily = d; }
    Object.assign(state.lastRaid, { grade: gr, score: R.score, daily: !!(REMIX && REMIX.daily) });
    const CH = [['S', 'S GRADE'], ['melee', 'NO GUNS FIRED'], ['par', `UNDER ${Math.floor(par / 60)}:${String(par % 60).padStart(2, '0')}`], ['clean', 'NO HITS TAKEN']];
    const chLine = CH.map(([k, t]) => `<span style="color:${ch[k] ? '#ffd36b' : bs.stars[k] ? '#9a8a60' : '#555'}">${ch[k] || bs.stars[k] ? '★' : '☆'} ${t}</span>`).join(' &nbsp; ');
    const t = Math.floor(R.time), acc = R.shots ? Math.round(R.hits / R.shots * 100) + '%' : '—';
    showScreen(`<div class="logo2">${REMIX ? (REMIX.daily ? 'DAILY CHALLENGE DONE' : REMIX.retake ? `${LV.text.area.split('·').pop().trim()} IS YOURS AGAIN` : 'REMIX CLEARED') : LV.text.resultsTitle}</div><div class="stats">KILLS<b>${R.kills}</b><br>EXECUTIONS<b>${R.execs}</b><br>HEADSHOTS<b>${R.heads}</b><br>BEST COMBO<b>${R.maxCombo}×</b><br>ACCURACY<b>${acc}</b><br>WINDOWS BROKEN<b>${R.glass}</b><br>HITS TAKEN<b>${R.taken}</b><br>TIME<b>${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}</b><br>SCORE<b>W ${R.score.toLocaleString('nl-NL')}${isBest ? ' <span style="color:#f08a3c">NEW BEST</span>' : ''}</b><br>${REMIX ? `${REMIX.daily ? 'DAILY' : 'REMIX'}<b>${REMIX.m.name} · x${REMIX.m.pay}</b><br>` : ''}WILDERS EARNED<b style="color:#ffd36b">+W ${pay.toLocaleString('nl-NL')}</b></div><div class="grade">${gr}</div><div class="hint" style="font-size:16px;letter-spacing:1px">${chLine}${newStar ? ' &nbsp; <span style="color:#f08a3c">NEW STAR</span>' : ''}</div><div class="hint">${LV.text.resultsHint}</div><div class="btn">CONTINUE · ${glyph('E')}</div>`);
    sfx('cash'); addMoney(pay); commitKit();
    if (ctx.save) setTimeout(() => { const a = M.active; M.active = false; ctx.save(); M.active = a; }, 0); // mission end: autosave the win
    $('objective').innerHTML = LV.text.objectiveCleared;
  }

  // ================================================================== PLAYER ACTIONS
  const mouseN = new THREE.Vector2(), rc = new THREE.Raycaster(), aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1), aim = new THREE.Vector3();
  let mouseSeen = false;
  addEventListener('mousemove', (e) => { mouseN.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); mouseSeen = true; });
  const moving = () => Math.hypot(player.position.x - P.last.x, player.position.z - P.last.z) > 0.01;
  function nearestDowned() { let best = null, bd = 1.15; for (const e of enemies) { const f = e.userData.foe; if (f.alive && f.down > 0) { const d = e.position.distanceTo(player.position); if (d < bd) { bd = d; best = e; } } } return best; }
  function attack() {
    if (!M.active || P.dead || P.exec > 0 || state.inDialogue || state.inPC || invOpen) return;
    const t = nearestDowned(); if (t && !(gunOut() && P.held.ammo <= 0) && !P.rl) { execute(t); return; }
    if (gunOut()) {
      if (P.fireT > 0 || P.rl) return;
      if (P.held.ammo <= 0) { if (!reloadStart()) throwHeld(); return; }
      const W2 = WD[P.held.id]; P.held.ammo--; P.fireT = W2.cd; R.shots++;
      fireGun(player.position, player.rotation.y, P.held.id, true, moving());
      player.userData.arms[0].rotation.x = -1.2; saveOwnAmmo(); if (P.held.ammo <= 0) reloadStart(); hud(); return;
    }
    if (state.armed) { ctx.swing(); sfx('swing'); alertNoise(player.position, 3); }
  }
  function throwHeld() {
    const h = P.held; if (!h) return false;
    const a = player.rotation.y, at = player.position.clone().add(new THREE.Vector3(Math.sin(a) * 0.4, 0, Math.cos(a) * 0.4));
    saveOwnAmmo(); dropItem(h.id, at, Math.sin(a) * 15, Math.cos(a) * 15, h.ammo, true, h.own); items[items.length - 1].g.position.y = 1.0;
    if (P.slot >= 2) P.guns[P.slot - 2] = null; else { P.melee = null; P.useBat = false; }
    const other = P.slot >= 2 ? P.guns[(P.slot === 2 ? 3 : 2) - 2] : null; P.slot = other ? (P.slot === 2 ? 3 : 2) : 1; syncHeld();
    sfx('throw'); P.fireT = 0.25; return true;
  }
  function grab() {
    if (P.dead || !M.active) return false;
    if (R.results) { hideScreen(); R.results = false; banner(LV.text.ownedBanner[0], LV.text.ownedBanner[1], 3); return true; }
    for (const [i, l] of lootCrates.entries()) if (!l.taken && Math.hypot(l.c.position.x - player.position.x, l.c.position.z - player.position.z) < 1.2) {
      l.taken = true; l.c.visible = l.glow.visible = false; state.loot = (state.loot || 0) + 1;
      if (ownsLevel(LV.id) && !REMIX) setLootTaken(LV.id, [...(state.lootTaken[LV.id] || []), i]);
      popup(player.position, '+1 CRATE OF LAMPAS SPICE', '#ffd23a'); toast('+1 CRATE OF LAMPAS SPICE', 'Sell it on Kaasplaats (PC) for W 150. Check it with I.', 1.8); sfx('pick'); hud(); return true;
    }
    let best = null, bd = 1.3;
    for (const it of items) { if (it.flying) continue; const k = Math.hypot(it.g.position.x - player.position.x, it.g.position.z - player.position.z); if (k < bd) { bd = k; best = it; } }
    if (!best) return P.held ? throwHeld() : false; // nothing to grab: throw what you hold (Neon Vice)
    // a gun of a calibre you carry: strip its rounds, unless it's a new gun and a slot is free (then take it)
    const fits = isGun(best.id) && (!P.guns[0] || !P.guns[1]) && !P.guns.some((g) => g && g.id === best.id);
    if (!fits && stripAmmo(best)) return true;
    pickUp(best); return true;
  }
  function pickUp(it) {
    root.remove(it.g, it.ring); items.splice(items.indexOf(it), 1);
    if (it.spare && isGun(it.id)) { const c = WD[it.id].cal, n = Math.min(it.spare, CAL[c].cap - (state.pool[c] | 0)); if (n > 0) { state.pool[c] = (state.pool[c] | 0) + n; setTimeout(() => popup(player.position, `+${n} ${CAL[c].name}`, '#ffd36b'), 250); } }
    putInHand({ id: it.id, ammo: it.ammo, own: it.own }); sfx('pick'); popup(player.position, WD[it.id].name, '#ffd36b');
  }

  // ================================================================== INPUT (capture phase: runs before main.js)
  addEventListener('keydown', (e) => {
    if (state.inDialogue || state.inPC || state.step === 'title') return;
    const stop = () => { e.stopImmediatePropagation(); e.preventDefault(); };
    if (e.code === 'KeyI') { stop(); invOpen ? closeInv() : openInv(); return; }
    if (invOpen) { if (e.code === 'Escape') { stop(); closeInv(); } else if (!['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight'].includes(e.code)) stop(); return; }
    if (!M.active) { // street: slot 2 stays in the van
      if (['Digit2', 'Numpad2', 'Digit3', 'Numpad3'].includes(e.code) && state.kit.includes('maboota')) { stop(); selectSlot(2); }
      return;
    }
    if (ARR) { stop(); if (['KeyE', 'Space', 'Enter', 'Escape', 'Backspace'].includes(e.code) && ARR.t > 0.4) endArrive(); return; }
    if (e.code === 'Backspace') { stop(); if (!ownsLevel(LV.id)) resetFloor(); return; }
    if (P.dead) { stop(); return; }
    if (e.code === 'KeyR') { stop(); if (!e.repeat) reloadInput(); return; }
    if (e.code === 'Digit1' || e.code === 'Numpad1') { stop(); selectSlot(1); }
    else if (e.code === 'Digit2' || e.code === 'Numpad2') { stop(); selectSlot(2); }
    else if (e.code === 'Digit3' || e.code === 'Numpad3') { stop(); selectSlot(3); }
    else if (e.code === 'Tab') { stop(); cycleSlot(e.shiftKey ? -1 : 1); }
    else if (e.code === 'KeyF') { stop(); attack(); }
    else if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') { if (grab()) stop(); }
  }, true);
  addEventListener('pointerdown', (e) => {
    if (invOpen) { if (e.target === invEl) closeInv(); e.stopImmediatePropagation(); return; }
    if (!M.active || state.inDialogue || state.inPC || e.target !== ctx.canvas) return;
    e.stopImmediatePropagation();
    if (e.pointerType === 'touch') { if (ARR && ARR.t > 0.4) endArrive(); return; }
    if (ARR) { if (ARR.t > 0.4) endArrive(); return; }
    if (R.results) { grab(); return; }
    if (e.button === 2) { grab(); return; } attack();
  }, true);
  let wheelT = 0; // mouse wheel cycles weapons on missions (zoom stays on the street)
  addEventListener('wheel', (e) => { if (!M.active || invOpen || state.inPC || P.dead) return; e.stopImmediatePropagation(); const t = performance.now(); if (t - wheelT < 140) return; wheelT = t; cycleSlot(Math.sign(e.deltaY) || 1); }, { capture: true, passive: true });
  const shift = { on: false };
  addEventListener('keydown', (e) => { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shift.on = true; });
  addEventListener('keyup', (e) => { if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') shift.on = false; });
  addEventListener('blur', () => { shift.on = false; });
  ctx.canvas.addEventListener('contextmenu', (e) => { if (M.active) e.preventDefault(); });

  // ================================================================== UPDATE
  function aimAtMouse(dt) {
    if (inputMode() !== 'mouse') { // controller / touch: right stick aims; idle right stick aims along movement
      const mvx = player.position.x - P.last.x, mvz = player.position.z - P.last.z;
      const a = virt.aim !== null ? virt.aim : Math.hypot(mvx, mvz) > 0.004 ? Math.atan2(mvx, mvz) : null;
      if (a !== null) player.rotation.y += angDiff(player.rotation.y, a) * Math.min(1, (dt || 0.016) * (virt.aim !== null ? 22 : 12));
      aim.set(player.position.x + Math.sin(player.rotation.y) * 4, 1.1, player.position.z + Math.cos(player.rotation.y) * 4);
      return;
    }
    if (!mouseSeen) return;
    rc.setFromCamera(mouseN, camera);
    if (rc.ray.intersectPlane(aimPlane, aim)) player.rotation.y = Math.atan2(aim.x - player.position.x, aim.z - player.position.z);
  }
  function holdPose(dt) { if (gunOut()) { const a = player.userData.arms[0]; a.rotation.x += (-1.45 - a.rotation.x) * Math.min(1, dt * 12); a.rotation.z = 0; if (WD[P.held.id].pel > 1) player.userData.arms[1].rotation.x = -1.2; } }
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
  function drawReload() {
    const r = P.rl; if (!r || !M.active) { reloadEl.style.display = 'none'; return; }
    const v = player.position.clone().setY(2.35).project(camera);
    reloadEl.style.display = 'block'; reloadEl.style.left = ((v.x + 1) / 2 * innerWidth) + 'px'; reloadEl.style.top = ((1 - v.y) / 2 * innerHeight) + 'px';
    reloadEl.className = r.jam ? 'jam' : '';
    const [g, f, m, t] = reloadEl.children, k = Math.min(1, r.t / r.dur);
    g.style.display = r.tried ? 'none' : 'block'; g.style.left = (r.ar0 / r.dur * 100) + '%'; g.style.width = Math.max(3, (r.ar1 - r.ar0) / r.dur * 100) + '%';
    f.style.width = (k * 100) + '%'; m.style.left = (k * 100) + '%'; t.textContent = r.jam ? 'VASTGELOPEN' : 'HERLADEN · ' + glyph('R');
  }
  function hitstop(dt) { if (FX.freeze > 0) { FX.freeze -= dt; return 0; } return dt; }
  function update(dt) {
    if (ARR) { updateArrive(dt); return; }
    R.time += dt; if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) bannerEl.style.opacity = 0; }
    if (!P.dead) { if (P.exec > 0) P.exec -= dt; else aimAtMouse(dt); holdPose(dt); }
    else { P.deadT += dt; const u = player.userData; u.body.rotation.x = Math.max(-1.5, -P.deadT * 6); u.body.position.y = 0.1; slide(player, P, dt, 0.38); }
    if (!P.dead && (P.vx || P.vz)) { player.position.x += P.vx * dt; player.position.z += P.vz * dt; ctx.collide(player.position, 0.38); P.vx *= Math.exp(-dt * 8); P.vz *= Math.exp(-dt * 8); if (Math.hypot(P.vx, P.vz) < 0.05) P.vx = P.vz = 0; }
    const pv = [(player.position.x - P.last.x) / Math.max(dt, 1e-4), (player.position.z - P.last.z) / Math.max(dt, 1e-4)];
    if (!P.dead) collideDoors(player.position, 0.42, pv[0], pv[1], true);
    reloadTick(dt); drawReload();
    // sprint (Shift, same speed as on the street): loud footsteps, every Lampas within 4.5 m hears them (Neon Vice alertNoise)
    const spd = Math.hypot(pv[0], pv[1]); P.sprint = !P.dead && shift.on && spd > 5;
    if (P.sprint) { P.stepT -= dt; if (P.stepT <= 0) { P.stepT = 0.3; alertNoise(player.position, 4.5); beep(70 + Math.random() * 20, 0.04, 'square', 0.02); } } else P.stepT = 0;
    P.fireT -= dt; P.invT -= dt; P.bloom = Math.max(0, P.bloom - dt * 0.45); if (FX.hurtT > 0) FX.hurtT -= dt;
    if (!P.dead && P.hp < P.maxhp && R.time - P.lastHurt > EASY.regen) { P.hp++; P.lastHurt = R.time; popup(player.position, '+1 HEALTH', '#b9d46e'); sfx('pick'); hud(); }
    if (!P.dead) for (const it of items) if (!it.flying && it.age > 1 && (isGun(it.id) ? !P.guns[0] || !P.guns[1] : !P.melee) && Math.hypot(it.g.position.x - player.position.x, it.g.position.z - player.position.z) < 0.45) { pickUp(it); break; }
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
    if (levelTick) levelTick(dt);
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
    if (sp > 4) { const k = Math.floor(nx0 - OX) + ',' + Math.floor(nz0 - Z0); if (glass.has(k)) { breakGlass(k); s.vx *= 0.6; s.vz *= 0.6; popup(obj.position, 'THROUGH THE WINDOW!', '#a9c46a'); } }
    obj.position.x = nx0; obj.position.z = nz0; ctx.collide(obj.position, r);
    const cx = obj.position.x - nx0, cz = obj.position.z - nz0, cl = Math.hypot(cx, cz);
    if (cl > 1e-5) { const nx = cx / cl, nz = cz / cl, vn = s.vx * nx + s.vz * nz;
      if (vn < 0) { if (-vn > 2.2 && LV.hazard) hazardHit(obj, cellAt(obj.position.x - nx * (r + 0.35), obj.position.z - nz * (r + 0.35)), [-nx, -nz]);
        if (-vn > 2.2) { wallDecal(obj.position.x - nx * (r + 0.02), rnd(0.3, 0.9), obj.position.z - nz * (r + 0.02), nx, nz, rnd(0.6, 1.0)); sfx('thud'); bloodBurst(obj.position, [-nx, -nz], 10, 2, 0.5); s.spin = (s.spin || 0) + rnd(-3, 3); shake(0.08); }
        s.vx -= 1.5 * vn * nx; s.vz -= 1.5 * vn * nz; s.vx *= 0.55; s.vz *= 0.55; } }
    if (s.spin) { obj.rotation.y += s.spin * dt; s.spin *= Math.exp(-dt * 3); }
    if ((s.y || 0) <= 0.02 && sp > 0.8) { s.smear = (s.smear || 0) + sp * dt; if (s.smear > 0.16) { s.smear = 0; floorDecal(obj.position.x, obj.position.z, 0.55, Math.atan2(s.vz, s.vx), smearM); } }
    if (sp > 5 && obj !== player) for (const o of enemies) { const f = o.userData.foe; if (o === obj || !f.alive || f.down > 0 || f.boss) continue; if (o.position.distanceTo(obj.position) < 0.8) { knockdown(o, [s.vx / sp, s.vz / sp]); popup(o.position, 'BOWLED!', '#ffd36b'); s.vx *= 0.5; s.vz *= 0.5; } }
  }
  // level hazards (def.hazard = { ch, text }): a body slammed into that furniture (Frietwijk's fryers) is finished off, and Eddy gets burnt
  function hazardHit(obj, ch, dir) {
    const hz = LV.hazard; if (ch !== hz.ch) return;
    if (obj === player) { hurtPlayer(dir, 'hazard'); return; }
    const f = obj.userData.foe; if (!f) return;
    if (f.alive) { killEnemy(obj, 'bat', dir); R.score += 500; }
    popup(obj.position, hz.text || 'OUCH!', '#e8a33d', true); sparks(obj.position.x, 1, obj.position.z, undefined, 12);
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
            if (f.alive) { const r = f.down > 0 ? 0.5 : 0.42; if (Math.hypot(e.position.x - nx, e.position.z - nz) < r) { if (tryDodge(e, b)) continue; R.hits++; b.hit.add(e); f.down > 0 ? killEnemy(e, b.id, dir) : hitEnemy(e, b.id, dir, 1); if (--b.pierce <= 0) { gone = true; break; } } }
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
  function laserTo(e, a) { // aim lasers are switched off (Tristan, 2026-11-14): the Lampas still aim and wind up, you just don't see a red line
    if (!SHOW_LASERS) return;
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
    const FT = f.type && FOE_TYPES[f.type];
    if (f.dodgeT > 0) f.dodgeT -= dt;
    if (f.leanT > 0) { f.leanT -= dt; u.body.rotation.z = Math.sin(Math.min(1, f.leanT / 0.45) * Math.PI) * 0.45 * f.leanS; } else if (FT) u.body.rotation.z = 0;
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
    if (see) { if (f.state !== 'chase') { spot(e); f.state = 'chase'; f.react = (W2.melee ? 0.2 : 0.5 + Math.random() * 0.25) * EASY.react; say(u.bubble, FT ? pickLine(FT, 'alert') : (LV.alertLines || ALERT_LINES)[Math.floor(Math.random() * (LV.alertLines || ALERT_LINES).length)], FT ? '#ffd36b' : '#ff7a1a'); if (FT && !f.named) { f.named = true; banner(FT.name, 'Mini-boss · ' + pickLine(FT, 'alert'), 2.2); } popup(e.position, '!', '#e8a33d', true); sfx('alert'); } f.lkx = pp.x; f.lkz = pp.z; f.seeT = 0; }
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
        if (!f.weapon && !(FT && FT.noWeapons)) { let bi = null, bd = 4.5; for (const it of items) { if (it.flying) continue; const d = Math.hypot(it.g.position.x - e.position.x, it.g.position.z - e.position.z); if (d < bd && los(e.position, it.g.position)) { bd = d; bi = it; } }
          if (bi && (dist > 2.5 || !see)) { const ddx = bi.g.position.x - e.position.x, ddz = bi.g.position.z - e.position.z; tvx = ddx / (bd || 1) * 3.2; tvz = ddz / (bd || 1) * 3.2; face = Math.atan2(ddx, ddz);
            if (bd < 0.5) { setFoeWeapon(e, bi.id); root.remove(bi.g, bi.ring); items.splice(items.indexOf(bi), 1); f.react = 0.5; say(u.bubble, 'Hebbes!', '#ff7a1a'); } break; } }
        if (see) { face = ang;
          if (W2.melee) { const sp = (f.weapon ? 3.6 : 3.4) * (FT ? FT.speed : 1);
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
        if (!P.dead && d2 < 1.25 && Math.abs(angDiff(e.rotation.y, Math.atan2(pp.x - e.position.x, pp.z - e.position.z))) < 1.1) { const hd = [(pp.x - e.position.x) / (d2 || 1), (pp.z - e.position.z) / (d2 || 1)]; if (FT && FT.grab) wristLock(e, hd); else { sfx('hit'); hurtPlayer(hd, wid); } } } }
    if (face !== null) { const turn = f.state === 'chase' ? 8 : 3; e.rotation.y += Math.max(-turn * dt, Math.min(turn * dt, angDiff(e.rotation.y, face))); }
    const k = 1 - Math.exp(-dt * 10); f.mvx += (tvx - f.mvx) * k; f.mvz += (tvz - f.mvz) * k;
    e.position.x += f.mvx * dt; e.position.z += f.mvz * dt; ctx.collide(e.position, 0.34); collideDoors(e.position, 0.36, f.mvx, f.mvz, false);
    animate(e, Math.hypot(f.mvx, f.mvz) * (FT ? 0.8 : 1), dt);
    if (FT && f.wind > 0) { u.arms[0].rotation.x = -1.3; u.arms[1].rotation.x = -1.3; } // both hands out for the grab
    else if (f.wind > 0) u.arms[0].rotation.x = -2.6; else if (f.atkT > 0) { f.atkT -= dt; u.arms[0].rotation.x = W2.melee ? 0.6 : -1.3; } else if (f.aiming && see) u.arms[0].rotation.x = -1.45;
    f.aiming = false;
  }
  // melee from main.js swing(): lunge at the target (Neon Vice), Maboota and fists knock down, a bat kills, downed = execution
  function melee(fv) {
    const id = P.slot === 1 && P.held && isMelee(P.held.id) ? P.held.id : 'maboota', W2 = WD[id];
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
    if (ARR) { const look = (ARR.ph === 'drive' ? van.position : player.position).clone().setY(0.8); return { pos: look.clone().add(new THREE.Vector3(0, 12 * zoom, 8 * zoom)), look }; }
    const lean = P.dead ? new THREE.Vector3() : aim.clone().sub(player.position).setY(0).clampLength(0, 6).multiplyScalar(0.3);
    const look = player.position.clone().add(lean).add(FX.kick).setY(0.8);
    const sh = FX.shake; if (sh > 0.01) look.add(new THREE.Vector3((Math.random() - 0.5) * sh, 0, (Math.random() - 0.5) * sh));
    return { pos: look.clone().add(new THREE.Vector3(0, 17 * zoom, 3.6 * zoom)), look };
  }
  function onBuy(id) {
    if (id === 'ammo') state.pool['9mm'] = (state.pool['9mm'] | 0) + 50;  // boxes go in your pocket: R reloads from there
    if (id === 'shells') state.pool['12ga'] = (state.pool['12ga'] | 0) + 12;
    if (id === 'shotgun') state.pool['12ga'] = (state.pool['12ga'] | 0) + 12 - WD.shotgun.mag; // 12 shells: 2 loaded, 10 spare
    if (GEAR.includes(id)) {
      const it = { id, ammo: isGun(id) ? WD[id].mag : 0 };
      if (fitsLoadout(id)) { addToLoadout(it); toast(gearName(id) + ' · IN YOUR KIT', isGun(id) ? 'A gun slot on missions. On the street it stays in the Oofmobiel. Press I to check your kit.' : 'Press I to check your kit.', 3); }
      else { state.stash.push(it); toast(gearName(id) + ' · IN DE KLUIS', 'Your hands are full. It\'s waiting in the kluis (stash) at the warehouse.', 3.2); }
    }
    hud();
  }
  // ================================================================== ARRIVAL (Neon Vice: every mission opens with you pulling up)
  // The Oofmobiel drives in along the street, parks out front, Eddy climbs out and walks to the door. E / Space / click skips it.
  let ARR = null;
  const lbCss = document.createElement('style'); lbCss.textContent = `
    #nvLbT,#nvLbB{position:fixed;left:0;right:0;height:0;background:#000;z-index:7;transition:height .35s;pointer-events:none;overflow:hidden}
    #nvLbT{top:0}#nvLbB{bottom:0;display:flex;align-items:center;justify-content:flex-end;padding:0 22px;box-sizing:border-box}
    #nvLbT.on,#nvLbB.on{height:11vh}
    #nvLbB span{font:10px 'Press Start 2P',monospace;color:#c9ae86;animation:nvblink 1.1s steps(2) infinite}
    #nvLbT span{display:block;padding:3.5vh 22px 0;font:clamp(12px,2.2vw,18px) 'Press Start 2P',monospace;color:#e8a33d;text-shadow:2px 2px 0 #7a2e1a}
    @keyframes nvblink{50%{opacity:.25}}`;
  document.head.appendChild(lbCss);
  const lbTop = mk('nvLbT'), lbBot = mk('nvLbB');
  
  function letterbox(on) {
    lbTop.innerHTML = `<span>${LV.text.area}</span>`; lbBot.innerHTML = `<span>${glyph('skip')} · OVERSLAAN</span>`;
    lbTop.className = lbBot.className = on ? 'on' : '';
    hudEl.style.opacity = scoreEl.style.opacity = on ? 0 : 1; $('objective').style.opacity = on ? 0 : 1;
  }
  function startArrive(then) {
    ARR = { ph: 'drive', t: 0, x0: OX + LV.van.from, then };
    van.position.set(ARR.x0, 0, van.position.z); player.visible = false; letterbox(true); M.snap = true;
    beep(70, 2.3, 'sawtooth', 0.04); beep(46, 2.3, 'square', 0.03); setTimeout(() => { if (ARR && ARR.ph === 'drive') beep(1900, 0.3, 'triangle', 0.015); }, 2050);
  }
  function endArrive() {
    if (!ARR) return; const then = ARR.then; ARR = null;
    van.position.set(VAN_PARK, 0, van.position.z); player.visible = true;
    player.position.copy(START()); player.rotation.y = Math.PI; P.last.copy(player.position); P.vx = P.vz = 0;
    letterbox(false); M.snap = true; if (then) then();
  }
  function cancelArrive() { if (ARR) { ARR.then = null; endArrive(); } }
  function updateArrive(dt) {
    const A = ARR; A.t += dt;
    if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) bannerEl.style.opacity = 0; }
    if (A.ph === 'drive') {
      const u = Math.min(1, A.t / 2.4), e = 1 - Math.pow(1 - u, 3);
      van.position.x = A.x0 + (VAN_PARK - A.x0) * e; van.position.y = Math.abs(Math.sin(A.t * 17)) * 0.035 * (1 - u);
      van.rotation.z = (1 - u) * 0.015 * Math.sin(A.t * 9);
      if (u >= 1) { A.ph = 'park'; A.t = 0; van.position.y = 0; van.rotation.z = 0; beep(415, 0.12, 'square', 0.03); setTimeout(() => beep(349, 0.16, 'square', 0.03), 130); } // a little Oof-Oof
    } else if (A.ph === 'park') {
      if (A.t > 0.45) { A.ph = 'out'; A.t = 0; player.visible = true; player.position.set(OX + LV.van.exit[0], 0, LV.van.exit[1]); player.rotation.y = Math.PI; sfx('door'); }
    } else {
      const d = START().sub(player.position); d.y = 0; const L2 = d.length();
      if (L2 > 0.05) { const st = Math.min(L2, 2.6 * dt); player.rotation.y = Math.atan2(d.x, d.z); player.position.addScaledVector(d.normalize(), st); animate(player, 2.6, dt); }
      if (L2 <= 0.05 || A.t > 3) endArrive();
    }
  }

  // ================================================================== DE KLUIS (stash at the warehouse: store and swap gear between missions)
  const kluis = new THREE.Group(); kluis.position.set(0.55, 0, -12); scene.add(kluis);
  { const g = lam({ color: 0x4a6a3a }), d = lam({ color: 0x2a3a22 });
    box(0.6, 2.0, 1.2, g, 0, 1.0, 0, kluis); box(0.03, 1.8, 0.03, d, -0.31, 1.0, 0, kluis);
    for (const z of [-0.3, 0.3]) { box(0.03, 0.12, 0.08, lam({ color: 0xc8c8c8 }), -0.32, 1.05, z * 0.25, kluis); for (let k = 0; k < 4; k++) box(0.02, 0.03, 0.3, d, -0.31, 1.65 - k * 0.07, z, kluis); }
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.24), lam({ map: signTex([{ t: 'KLUIS', size: 72 }], '#ffd36b', '#2a1a12', 256, 64) }));
    sign.rotation.y = -Math.PI / 2; sign.position.set(-0.32, 2.15, 0); kluis.add(sign); }
  solid(0.2, 0.9, -12.65, -11.35);
  addInteract({ obj: kluis, pos: () => new THREE.Vector3(-0.3, 0, -12), r: 1.7, enabled: () => !M.active && state.step !== 'talk', label: () => `Kluis · store / swap gear (${state.stash.length}/${STASH_CAP})`, act: () => openStash() });
  let stashMsg = '';
  function openStash(msg) {
    stashMsg = msg || ''; const L = state.loadout;
    const row = (ic, nm, ds, act, label, dis) => `<div class="it"><div class="ic">${ICON[ic] || '▪'}</div><div style="flex:1"><div class="nm">${nm}</div><div class="ds">${ds}</div>${act ? `<button data-k="${act}" ${dis ? 'disabled' : ''} style="margin-top:6px;font:9px 'Press Start 2P',monospace;background:${dis ? '#4a2c16' : '#c2412d'};color:#fff;border:0;padding:6px 8px;cursor:${dis ? 'default' : 'pointer'}">${label}</button>` : ''}</div></div>`;
    const desc = (it) => (isGun(it.id) ? `Loaded ${it.ammo}/${WD[it.id].mag}.` : it.id === 'vest' ? 'Stops one bullet.' : 'Kills in one swing.');
    const full = state.stash.length >= STASH_CAP;
    const kit = [
      row('maboota', 'Slot 1 · MABOOTA', 'Always with you.', '', ''),
      L.melee ? row('bat', 'Slot 1 · ' + WD.bat.name, 'Kills in one swing. Press 1 twice on a mission.', 'store:melee', 'IN DE KLUIS', full) : row('bat', 'Slot 1 · —', 'No second melee weapon.', '', ''),
      ...[0, 1].map((i) => (L.guns[i] ? row(L.guns[i].id, `Slot ${i + 2} · ${WD[L.guns[i].id].name}`, desc(L.guns[i]), 'store:' + i, 'IN DE KLUIS', full) : row('ammo', `Slot ${i + 2} · —`, 'Empty gun slot.', '', ''))),
      L.vest ? row('vest', 'KEVLAR VEST', 'Worn. Stops one bullet.', 'store:vest', 'IN DE KLUIS', full) : row('vest', 'No vest', 'Buy one from The Russian.', '', ''),
    ];
    const st = state.stash.map((it, i) => row(it.id, gearName(it.id), desc(it), 'take:' + i, 'PAKKEN'));
    for (let i = st.length; i < STASH_CAP; i++) st.push(`<div class="it" style="opacity:.35"><div class="ic"></div><div><div class="nm">—</div><div class="ds">Empty shelf.</div></div></div>`);
    invEl.innerHTML = `<div class="box"><h2>DE KLUIS</h2><div class="sub">Eddy's stash at the warehouse · ${state.stash.length}/${STASH_CAP} · Pockets: 9MM ${state.pool['9mm'] | 0} · HAGEL ${state.pool['12ga'] | 0}${stashMsg ? ` · <span style="color:#ffd36b">${stashMsg}</span>` : ''}</div>
      <div class="sub" style="color:#a9c46a;margin:8px 0 6px">WHAT YOU CARRY</div><div class="grid">${kit.join('')}</div>
      <div class="sub" style="color:#a9c46a;margin:14px 0 6px">IN DE KLUIS</div><div class="grid">${st.join('')}</div>
      <div class="foot"><span>Take a gun with a full kit and it swaps with slot 2. Everything you carry goes on the next mission.</span><span>[Esc] / [I] close</span></div></div>`;
    invEl.style.display = 'flex'; invOpen = true; invMode = 'stash';
  }
  function stashAct(k) {
    const L = state.loadout, [act, arg] = k.split(':');
    if (act === 'store') {
      if (state.stash.length >= STASH_CAP) return openStash('The kluis is full.');
      if (arg === 'melee') { state.stash.push({ id: L.melee, ammo: 0 }); L.melee = null; }
      else if (arg === 'vest') { state.stash.push({ id: 'vest', ammo: 0 }); L.vest = 0; }
      else { const i = +arg; state.stash.push({ id: L.guns[i].id, ammo: L.guns[i].ammo }); L.guns[i] = null; }
    } else if (act === 'take') {
      const i = +arg, it = state.stash[i]; if (!it) return;
      if (fitsLoadout(it.id)) { state.stash.splice(i, 1); addToLoadout(it); }
      else if (isGun(it.id)) { state.stash[i] = { id: L.guns[0].id, ammo: L.guns[0].ammo }; L.guns[0] = { id: it.id, ammo: it.ammo }; }
      else if (it.id === 'bat') return openStash('You already carry a bat.');
      else if (it.id === 'vest') return openStash('You\'re already wearing a vest.');
    }
    beep(520, 0.05, 'square', 0.03); ctx.kitChanged && ctx.kitChanged(); if (ctx.save) ctx.save(); openStash();
  }
  invEl.addEventListener('click', (e) => { const b = e.target.closest('button[data-k]'); if (b && !b.disabled && invMode === 'stash') stashAct(b.dataset.k); });
  // level checks: every door has free floor on both sides, and every Lampas and crate can be reached from the front door
  function validate() {
    const issues = [];
    for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === 'D') {
      const horiz = (x > 0 && G[z][x - 1] === 'D') || (x < W - 1 && G[z][x + 1] === 'D');
      for (const [ax, az] of horiz ? [[x, z - 1], [x, z + 1]] : [[x - 1, z], [x + 1, z]]) if (!walkable(ax, az)) issues.push(`door ${x},${z} blocked at ${ax},${az}`);
    }
    const start = L(LV.validateFrom[0], LV.validateFrom[1]);
    for (const e of enemies) { const [x, z] = e.userData.foe.spawn; if (isBlock(G[Math.floor(z)][Math.floor(x)])) issues.push(`spawn ${x},${z} inside furniture`); else if (!path(start, L(x, z))) issues.push(`spawn ${x},${z} unreachable`); }
    for (const [x, z] of LV.loot) if (!path(start, L(x, z))) issues.push(`loot ${x},${z} unreachable`);
    return issues;
  }
  Object.assign(M, { enter, exit, update, street, melee, cameraFor, hitstop, onBuy, frozen: () => P.dead || R.results || !!ARR, aiming: () => M.active, invOpen: () => invOpen, openInv, closeInv,
    enemies, items, doors, glass, barrels, P, R, lootCrates, OX, L, G, resetFloor, hud, validate, LEVELS, buildLevel, ownsLevel, setOwned, migrateLevels,
    canRestart: () => M.active && !!LV && !ownsLevel(LV.id), levelName: () => (LV ? LV.name : ''),
    _hit: (e) => killEnemy(e, 'maboota', [0, 1]), _hurt: (c) => hurtPlayer([0, 1], c || 'makarov'), _knock: (e) => knockdown(e, [0, 1]), _attack: attack, _grab: grab, _select: selectSlot, FOE_TYPES, _wristLock: wristLock, _tryDodge: tryDodge, endArrive, arriving: () => !!ARR, openStash, stashAct, migrateKit, owns, canBuy, kitSummary, commitKit, _cycle: cycleSlot, _putInHand: putInHand, _explode: explode, _breakGlass: breakGlass, _fire: (a, id) => fireGun(player.position, a, id || 'makarov', true, false), _reload: reloadInput, _strip: stripAmmo, shift, WD });
  Object.defineProperty(M, 'van', { get: () => van, enumerable: true });
  // test hooks: where the Lampas stand, and a forced clear (results screen) for remix/best-score checks
  M.debugFoes = () => enemies.map((e) => ({ alive: e.userData.foe.alive, x: +e.position.x.toFixed(1), z: +e.position.z.toFixed(1), w: e.userData.foe.weapon }));
  M.debugClear = () => { for (const e of enemies) e.userData.foe.alive = false; R.score = R.score || 9000; results(); };
  buildLevel(spekbuurt); // Mission 1 is built up front (as before); other levels replace it when they're launched
  hud();
  return M;
}
