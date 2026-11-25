// Oofmobiel drive: a top-down driving level between districts (Kipkruidenkwartier → Oud-Vettenburg).
// Classic overhead city driving: the camera looks straight down, north is up, the van rotates under it.
// Eddy drives the blue Oofmobiel through a grid of Kaasland streets: honk (E / Space) and pedestrians press
// themselves against the wall and cars pull over; run someone over and you pay smartengeld; cross the
// Grote Gracht into Lampas turf and the Lampas come to ram you. Park on the Frietwijk plaza to arrive.
//
// Self-contained: its own scene, camera, HUD and key handling. main.js only calls start(), update() and
// renders drive.scene with drive.camera while drive.active is true.

const GX = [0, 44, 88, 132, 176, 220];                       // x of the north-south roads
const GZ = [0, -44, -88, -132, -176, -220, -264, -308, -352, -396]; // z of the east-west roads (north is -z)
const RH = 5, SW = 8;                                        // road half width, sidewalk outer edge (from the road centre line)
const CANAL = { z0: -212, z1: -184, row: 4 };                 // the Grote Gracht fills block row 4
const OPEN_BRIDGES = [1, 3, 5];
const CLOSED = new Set(['v0,4', 'v2,4', 'v4,4', 'h2,2', 'h1,6', 'v3,7', 'h3,1']); // raised bridges + road works
const PARK = '1,6', PLAZA = '4,8';
const PLAZA_XZ = { x: (GX[4] + GX[5]) / 2, z: (GZ[8] + GZ[9]) / 2 }; // the Frietwijk plaza (the default target)
const TARGET = { ...PLAZA_XZ, r: 6 }; // where this drive ends: start({ target: [i, j] }) parks on the crossing of road GX[i] and GZ[j]
const START = { x: 12, z: 2.2, h: Math.PI / 2 };             // in front of Eddy & Zn, nose east
const MAXV = 26, REV = 11, PAR = 60; // top speed forward / in reverse (m/s)
const SMART = 15, LAMPAS_BOUNTY = 50, BASE_PAY = 250;

const HONK_LINES = ['HÈ!', 'GEK!', 'TOETER NIET!', 'MIJN FRIKANDEL!', 'RIJ NORMAAL!', 'OOF!', 'IK BEL DE WIJKAGENT!', 'KIJK UIT, SHOARMAMAN!', 'MOEDER!', 'HEB JE SAUS?'];
const HIT_LINES = ['AU!', 'MIJN HEUP!', 'SMARTENGELD!', 'IK HEB EEN ADVOCAAT!', 'NIET OP MIJN KAAS!', 'OEF!'];
const CAR_LINES = ['TOET TOET!', 'JA JA, RUSTIG!', 'BUSJE!', 'GA DAN!'];
const LAMPAS_LINES = ['DIT IS ONZE STRAAT!', 'LAMPAS!', 'STOP DAT BUSJE!', 'VERDUND IS LEKKER!'];
const ROOF_ADS = [['LAMPAS SPICE', '99% ZOUT · 1% SPICE'], ['FRIKANDEL XXL', 'NU MET MEER FRIKANDEL'], ['KAASLAND VERZEKERT', 'OOK UW BUSJE (NIET)'], ['KIPKRUIDENKWARTIER', 'GEKRUID SINDS 1652'], ['KAASDOWS XL', 'NU MET MUIS'], ['GOUDA GAMES', 'WIE KAAS ZEGT...']];

import { makeOofmobiel, makeCar as makeStreetCar, setLivery } from './vehicles.js';
import { signFace } from './livery.js';
import { makeMiata } from './johan.js';
import { fitFov, shadowSize } from './mobile.js';

export function initDrive(ctx) {
  const { THREE, renderer, canvasTex, signTex, beep, isPaused } = ctx;
  const D = { active: false, scene: new THREE.Scene(), camera: new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 1, 260) };
  const scene = D.scene, camera = D.camera;
  scene.background = new THREE.Color(0x26303e);
  camera.up.set(0, 0, -1); // north up
  addEventListener('resize', () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); fitFov(camera, 42); }); fitFov(camera, 42);

  // ---------------------------------------------------------------- materials
  const lam = (o) => new THREE.MeshLambertMaterial(o);
  const noiseTex = (base, spots, n = 900, sz = 128) => canvasTex(sz, sz, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, sz, sz);
    for (let i = 0; i < n; i++) { g.fillStyle = spots[i % spots.length]; g.fillRect(Math.random() * sz, Math.random() * sz, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  });
  const rep = (t, x, y) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(x, y); return t; };
  const asphaltM = lam({ map: rep(noiseTex('#3a3a40', ['#44444a', '#303036', '#4a4a50']), 60, 100) });
  const paveT = canvasTex(64, 64, (g) => { g.fillStyle = '#b4aa9a'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#968c7e'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } });
  const roofT = noiseTex('#8a8a8a', ['#9a9a9a', '#7a7a7a', '#a4a4a4', '#6e6e6e'], 1400);
  const tileT0 = canvasTex(64, 64, (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = y % 16 ? '#b8b8b8' : '#a0a0a0'; g.fillRect(0, y, 64, 8); for (let x = (y % 16) / 2; x < 64; x += 8) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x, y, 1, 8); } } });
  const tileT = rep(tileT0, 1, 1); rep(roofT, 1, 1);
  const grassM = lam({ map: rep(noiseTex('#4f8a3a', ['#5c9a44', '#447a32', '#6aa84e']), 6, 6) });
  const waterM = lam({ map: rep(canvasTex(64, 64, (g) => { g.fillStyle = '#163a4c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(140,200,255,${0.05 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 6 + Math.random() * 10, 1); } }), 40, 4) });
  const quayM = lam({ color: 0x7a4a3a });
  const SOUTH_WALL = [0x8a3a2a, 0x6a2a20, 0x9a5a3a, 0x5a4a44, 0x7a6a5a, 0x9a8a70];
  const NORTH_WALL = [0xd8c8a8, 0x6a2a2a, 0x2a3a4a, 0xc89a5a, 0x3a5a4a, 0xe0d8c8, 0x8a4a2a];
  const ROOF_TINT = [0xd06a48, 0x9a4a3a, 0x7a7a7a, 0x5a5a62, 0xb88a6a, 0x4a4a4a];
  const matCache = {};
  const cm = (key, make) => matCache[key] || (matCache[key] = make());
  const wallM = (c) => cm('w' + c, () => lam({ color: c }));
  const flatRoofM = (c) => cm('f' + c, () => lam({ map: roofT, color: c }));
  const tileRoofM = (c) => cm('t' + c, () => lam({ map: tileT, color: c }));

  function box(w, h, d, m, x, y, z, parent = scene, shadow = true) {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z);
    if (shadow) { b.castShadow = true; b.receiveShadow = true; } parent.add(b); return b;
  }
  const cylMesh = (rt, rb, h, m, seg) => new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  function plane(w, d, m, x, y, z, parent = scene) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z); p.receiveShadow = true; parent.add(p); return p;
  }
  function label(lines, bg, fg, w, d, x, y, z, rot = 0, parent = scene, cw = 512, ch = 128) {
    const map = bg === 'none' ? canvasTex(cw, ch, (g) => { // painted on the street: no plate, no border
      g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach((l, i) => { let fs = l.size || 46; g.font = `900 ${fs}px Bungee, "Arial Black", sans-serif`; while (g.measureText(l.t).width > cw - 20 && fs > 10) { fs -= 2; g.font = `900 ${fs}px Bungee, "Arial Black", sans-serif`; } g.fillStyle = l.color || fg; g.fillText(l.t, cw / 2, ch * (lines.length === 1 ? 0.52 : (i + 0.75) / (lines.length + 0.5))); });
    }) : signTex(lines, bg, fg, cw, ch);
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: bg !== 'none' }));
    p.rotation.x = -Math.PI / 2; p.rotation.z = rot; p.position.set(x, y, z); parent.add(p); return p;
  }

  // ---------------------------------------------------------------- lights
  { // a soft dusk sky as the environment, so the van's paint and glass have something to reflect
    const sky = canvasTex(256, 128, (c) => {
      const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#4a6ab8'); gr.addColorStop(0.35, '#a8b8e0'); gr.addColorStop(0.5, '#ffe0c0'); gr.addColorStop(0.56, '#6a6070'); gr.addColorStop(1, '#2a2630');
      c.fillStyle = gr; c.fillRect(0, 0, 256, 128);
      for (let k = 0; k < 10; k++) { c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(Math.random() * 256, 20 + Math.random() * 28, 16 + Math.random() * 20, 4, 0, 0, 7); c.fill(); }
    });
    sky.mapping = THREE.EquirectangularReflectionMapping;
    const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(sky).texture; scene.environmentIntensity = 0.6; pm.dispose();
  }
  const hemi = new THREE.HemisphereLight(0xffe8d0, 0x4a4060, 1.5); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffd8a8, 2.4);
  sun.castShadow = true; sun.shadow.mapSize.set(shadowSize(), shadowSize());
  Object.assign(sun.shadow.camera, { left: -55, right: 55, top: 55, bottom: -55, near: 1, far: 140 });
  sun.shadow.bias = -0.0006; scene.add(sun, sun.target);

  // ---------------------------------------------------------------- static city (built on first start)
  const solids = []; // {x0,x1,z0,z1}
  const solid = (x0, x1, z0, z1) => { const s = { x0: Math.min(x0, x1), x1: Math.max(x0, x1), z0: Math.min(z0, z1), z1: Math.max(z0, z1) }; solids.push(s); return s; };
  const blocks = []; // {i, j, x0, x1, z0, z1, kind}
  let built = false, homeSign = null, targetRing, arrow, plazaGlow, parkLabel;
  const segOpen = (k) => !CLOSED.has(k);
  const BW = SW; // bridge half width: road plus both sidewalks, so you never snag on a railing end
  const isWater = (x, z) => z > CANAL.z0 && z < CANAL.z1 && !OPEN_BRIDGES.some((i) => Math.abs(x - GX[i]) < BW - 0.2);

  function build() {
    built = true;
    const XMIN = GX[0] - SW, XMAX = GX[5] + SW, ZMIN = GZ[9] - SW, ZMAX = GZ[0] + SW;
    // ground: asphalt south and north of the canal, water in between
    plane(XMAX - XMIN + 80, ZMAX - CANAL.z1 + 40, asphaltM, (XMIN + XMAX) / 2, 0, (CANAL.z1 + ZMAX + 40) / 2);
    plane(XMAX - XMIN + 80, CANAL.z0 - ZMIN + 40, asphaltM, (XMIN + XMAX) / 2, 0, (CANAL.z0 + ZMIN - 40) / 2);
    const water = plane(XMAX - XMIN + 80, CANAL.z1 - CANAL.z0, waterM, (XMIN + XMAX) / 2, -1.2, (CANAL.z0 + CANAL.z1) / 2);
    D._water = water;
    for (const [z, s] of [[CANAL.z1, 1], [CANAL.z0, -1]]) { const q = new THREE.Mesh(new THREE.PlaneGeometry(XMAX - XMIN + 80, 1.2), quayM); q.position.set((XMIN + XMAX) / 2, -0.6, z); q.rotation.y = s > 0 ? Math.PI : 0; scene.add(q); }
    // quay railings (not solid: you CAN drive into the canal, it's just a bad idea)
    for (const z of [CANAL.z1 - 0.3, CANAL.z0 + 0.3]) for (let x = XMIN; x < XMAX; x += 3) if (!OPEN_BRIDGES.some((i) => Math.abs(x + 1.5 - GX[i]) < BW + 1)) box(0.15, 0.6, 0.15, wallM(0x2a2a2a), x + 1.5, 0.3, z, scene, false);
    // bridges: open ones get a deck and railings, raised ones block the road
    for (let i = 0; i < GX.length; i++) {
      const x = GX[i];
      if (OPEN_BRIDGES.includes(i)) {
        plane(BW * 2, CANAL.z1 - CANAL.z0, asphaltM, x, 0.01, (CANAL.z0 + CANAL.z1) / 2);
        for (const s of [-1, 1]) plane(BW - RH, CANAL.z1 - CANAL.z0, lam({ map: rep(paveT.clone(), 1, 9) }), x + s * (RH + BW) / 2, 0.05, (CANAL.z0 + CANAL.z1) / 2);
        for (const s of [-1, 1]) box(0.4, 0.8, CANAL.z1 - CANAL.z0, wallM(0xe8e0d0), x + s * (BW + 0.2), 0.4, (CANAL.z0 + CANAL.z1) / 2);
        for (const s of [-1, 1]) solid(x + s * BW, x + s * (BW + 0.5), CANAL.z0, CANAL.z1);
      } else {
        for (const [z, s] of [[CANAL.z1, -1], [CANAL.z0, 1]]) {
          const leaf = box(RH * 2, 0.5, 10, wallM(0x6a4a2a), x, 3.2, z + s * 4, scene); leaf.rotation.x = s * 0.9;
          for (let k = -2; k <= 2; k++) box(1.8, 0.5, 0.5, wallM(k % 2 ? 0xffffff : 0xd8202a), x + k * 2, 0.6, z - s * 1.2);
          solid(x - RH, x + RH, z - s * 1.6, z - s * 0.8);
        }
        label([{ t: 'BRUG OPEN', size: 60 }, { t: 'even geduld (±3 uur)', size: 28, color: '#ffffff' }], '#d8202a', '#ffffff', 9, 2.3, x, 0.08, CANAL.z1 + 3.6);
        label([{ t: 'BRUG OPEN', size: 60 }, { t: 'zwem maar', size: 28, color: '#ffffff' }], '#d8202a', '#ffffff', 9, 2.3, x, 0.08, CANAL.z0 - 3.6);
      }
    }
    // lane markings (dashed centre lines) and closed road works
    const dash = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.04, 2.6), lam({ color: 0xf2f2e8 }), 2000);
    let nd = 0; const mtx = new THREE.Matrix4(), rotY = new THREE.Matrix4().makeRotationY(Math.PI / 2);
    for (let i = 0; i < GX.length; i++) for (let j = 0; j < GZ.length - 1; j++) {
      if (j === CANAL.row && !OPEN_BRIDGES.includes(i)) continue;
      const k = `v${i},${j}`; if (CLOSED.has(k)) { roadWorks(GX[i], (GZ[j] + GZ[j + 1]) / 2, false); continue; }
      for (let z = GZ[j] - SW - 1; z > GZ[j + 1] + SW; z -= 6) { mtx.makeTranslation(GX[i], 0.03, z); dash.setMatrixAt(nd++, mtx); }
    }
    for (let j = 0; j < GZ.length; j++) for (let i = 0; i < GX.length - 1; i++) {
      const k = `h${i},${j}`; if (CLOSED.has(k)) { roadWorks((GX[i] + GX[i + 1]) / 2, GZ[j], true); continue; }
      for (let x = GX[i] + SW + 1; x < GX[i + 1] - SW; x += 6) { mtx.makeTranslation(x, 0.03, GZ[j]).multiply(rotY); dash.setMatrixAt(nd++, mtx); }
    }
    dash.count = nd; scene.add(dash);
    // zebra crossings on every crossing
    const zebraM = lam({ color: 0xe8e8e0 });
    for (const x of GX) for (const z of GZ) for (const [dx, dz, rot] of [[0, -RH - 1.4, 0], [0, RH + 1.4, 0], [-RH - 1.4, 0, 1], [RH + 1.4, 0, 1]]) {
      for (let k = -3; k <= 3; k++) { const b = box(rot ? 2 : 0.7, 0.03, rot ? 0.7 : 2, zebraM, x + dx + (rot ? 0 : k * 1.3), 0.025, z + dz + (rot ? k * 1.3 : 0), scene, false); b.receiveShadow = true; }
    }
    // blocks
    for (let i = 0; i < GX.length - 1; i++) for (let j = 0; j < GZ.length - 1; j++) {
      if (j === CANAL.row) continue;
      const b = { i, j, x0: GX[i] + SW, x1: GX[i + 1] - SW, z0: GZ[j + 1] + SW, z1: GZ[j] - SW, kind: `${i},${j}` === PARK ? 'park' : `${i},${j}` === PLAZA ? 'plaza' : j > CANAL.row ? 'north' : 'south' };
      blocks.push(b);
      // sidewalk slab
      const sw = new THREE.Mesh(new THREE.BoxGeometry(b.x1 - b.x0 + 6, 0.14, b.z1 - b.z0 + 6), lam({ map: rep(paveT.clone(), (b.x1 - b.x0 + 6) / 3, (b.z1 - b.z0 + 6) / 3) }));
      sw.position.set((b.x0 + b.x1) / 2, 0.07, (b.z0 + b.z1) / 2); sw.receiveShadow = true; scene.add(sw);
      if (b.kind === 'park') buildPark(b); else if (b.kind === 'plaza') buildPlaza(b); else if (b.kind === 'north') buildCanalHouses(b); else buildSouthBlock(b);
    }
    // the edge of the map: a wall of buildings all round
    edgeRow(XMIN - 40, XMIN, ZMIN - 40, ZMAX + 40, 'v'); edgeRow(XMAX, XMAX + 40, ZMIN - 40, ZMAX + 40, 'v');
    edgeRow(XMIN, XMAX, ZMIN - 40, ZMIN, 'h'); edgeRow(XMIN, XMAX, ZMAX, ZMAX + 40, 'h', true);
    // Eddy & Zn on the south edge, where the drive starts
    homeSign = label([{ t: 'EDDY & ZN', size: 66 }, { t: 'SPECERIJEN · SINDS 1987', size: 30, color: '#ffffff' }], '#6b1410', '#ffd36b', 16, 4.5, 14, 21, 16);
    // welcome sign on the north quay
    const lampasSign = label([{ t: 'WELKOM IN OUD-VETTENBURG', size: 54 }, { t: 'LAMPAS GEBIED · VERDUNNEN VERPLICHT', size: 28, color: '#1a0a10' }], '#ff7a1a', '#1a0a10', 22, 4, 110, 0.09, CANAL.z0 - 6.2, 0, scene, 1024, 190);
    buildThemes(lampasSign);
    buildAirport();
    label([{ t: 'DE GROTE GRACHT', size: 60 }], 'none', '#bfe8ff', 26, 3, 110, -1.1, (CANAL.z0 + CANAL.z1) / 2, 0, scene, 1024, 110);
    // target ring on the plaza
    targetRing = new THREE.Mesh(new THREE.RingGeometry(TARGET.r - 0.8, TARGET.r, 48), new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.9, depthWrite: false }));
    targetRing.rotation.x = -Math.PI / 2; targetRing.position.set(TARGET.x, 0.2, TARGET.z); scene.add(targetRing);
    parkLabel = label([{ t: 'PARKEER HIER', size: 70 }], 'none', '#ffd36b', 9, 2, TARGET.x, 0.21, TARGET.z);
    plazaGlow = new THREE.PointLight(0xffb040, 40, 30, 1.6); plazaGlow.position.set(TARGET.x, 6, TARGET.z); scene.add(plazaGlow);
    // arrow that points the way
    const sh = new THREE.Shape(); sh.moveTo(0, 2.2); sh.lineTo(1.6, -0.6); sh.lineTo(0.5, -0.2); sh.lineTo(0.5, -1.8); sh.lineTo(-0.5, -1.8); sh.lineTo(-0.5, -0.2); sh.lineTo(-1.6, -0.6); sh.closePath();
    arrow = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
    arrow.rotation.x = -Math.PI / 2; const ar = new THREE.Group(); ar.add(arrow); scene.add(ar); arrow = ar;
    // static obstacles for traffic and the minimap
    drawMinimapBase();
  }
  function roadWorks(x, z, horiz) {
    const w = horiz ? 4 : RH * 2, d = horiz ? RH * 2 : 4;
    for (let k = -2; k <= 2; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), lam({ color: 0xff6a1a })); c.position.set(x + (horiz ? 0 : k * 2), 0.45, z + (horiz ? k * 2 : 0)); c.castShadow = true; scene.add(c); }
    box(horiz ? 3 : 7, 0.5, horiz ? 7 : 3, wallM(0xc8b030), x, 0.25, z); // a sand pile
    label([{ t: 'WERK IN UITVOERING', size: 44 }, { t: 'sinds 1998', size: 30, color: '#1a1a1a' }], '#ffd020', '#1a1a1a', 7, 2, x + (horiz ? 0 : 0), 0.6, z + (horiz ? -4.5 : -3.5), horiz ? Math.PI / 2 : 0);
    solid(x - w / 2, x + w / 2, z - d / 2, z + d / 2);
  }
  const northRoofs = [], lampasNeons = []; // Lampas neon signs hide on the other districts' drives // every roof in Oud-Vettenburg: the district themes lay their own roofs over these
  function building(x0, x1, z0, z1, h, wall, roofM, opt = {}) {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    if (opt.north) northRoofs.push({ w, d, h, cx, cz });
    box(w, h, d, wallM(wall), cx, h / 2, cz);
    const r = plane(Math.max(0.5, w - 0.7), Math.max(0.5, d - 0.7), roofM, cx, h + 0.02, cz); r.castShadow = false;
    const uv = r.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 6, uv.getY(k) * d / 6); // texture scale follows the roof size
    if (opt.ridge) box(opt.ridge === 'x' ? w - 0.4 : 0.35, 0.3, opt.ridge === 'x' ? 0.35 : d - 0.4, wallM(0x3a2a24), cx, h + 0.15, cz, scene, false);
    if (opt.ac) { box(1.4, 0.8, 1.1, wallM(0x9aa0a4), cx + (Math.random() - 0.5) * (w - 3), h + 0.4, cz + (Math.random() - 0.5) * (d - 3)); }
    if (opt.chimney) box(0.7, 1.4, 0.7, wallM(0x5a3a30), x0 + 1, h + 0.7, z0 + 1);
  }
  function buildSouthBlock(b) {
    // Kipkruidenkwartier: brick warehouses and flat-roofed blocks, split in quadrants
    const mx = (b.x0 + b.x1) / 2 + (Math.random() - 0.5) * 6, mz = (b.z0 + b.z1) / 2 + (Math.random() - 0.5) * 6;
    const quads = Math.random() < 0.35 ? [[b.x0, b.x1, b.z0, mz], [b.x0, b.x1, mz, b.z1]] : [[b.x0, mx, b.z0, mz], [mx, b.x1, b.z0, mz], [b.x0, mx, mz, b.z1], [mx, b.x1, mz, b.z1]];
    for (const [x0, x1, z0, z1] of quads) {
      const pick = SOUTH_WALL[(Math.random() * SOUTH_WALL.length) | 0], h = 5 + Math.random() * 9;
      const corr = Math.random() < 0.4;
      building(x0 + 0.2, x1 - 0.2, z0 + 0.2, z1 - 0.2, h, pick, corr ? tileRoofM(0x8ab0b0) : flatRoofM(ROOF_TINT[(Math.random() * ROOF_TINT.length) | 0]), { ac: !corr && Math.random() < 0.7, chimney: Math.random() < 0.3 });
    }
    if (Math.random() < 0.45) { const [t, s] = ROOF_ADS[(Math.random() * ROOF_ADS.length) | 0]; label([{ t, size: 56 }, { t: s, size: 28, color: '#ffffff' }], '#1a1a2a', '#ffd36b', 12, 3.2, (b.x0 + b.x1) / 2, 15.2, (b.z0 + b.z1) / 2); }
    solid(b.x0, b.x1, b.z0, b.z1);
  }
  function buildCanalHouses(b) {
    // Oud-Vettenburg: narrow canal houses round a green courtyard, tiled roofs, Lampas neon on the corners
    const D = 10;
    plane(b.x1 - b.x0 - 2 * D, b.z1 - b.z0 - 2 * D, grassM, (b.x0 + b.x1) / 2, 0.16, (b.z0 + b.z1) / 2);
    const row = (a0, a1, fixed0, fixed1, horiz) => {
      for (let a = a0; a < a1 - 0.5;) {
        const w = Math.min(a1 - a, 4.5 + Math.random() * 2.5), h = 9 + Math.random() * 7, c = NORTH_WALL[(Math.random() * NORTH_WALL.length) | 0];
        const roof = tileRoofM(Math.random() < 0.6 ? 0x9a4a3a : 0x5a4a4a);
        if (horiz) building(a + 0.1, a + w - 0.1, fixed0, fixed1, h, c, roof, { ridge: 'z', north: true }); else building(fixed0, fixed1, a + 0.1, a + w - 0.1, h, c, roof, { ridge: 'x', north: true });
        a += w;
      }
    };
    row(b.x0, b.x1, b.z0, b.z0 + D, true); row(b.x0, b.x1, b.z1 - D, b.z1, true);
    row(b.z0 + D, b.z1 - D, b.x0, b.x0 + D, false); row(b.z0 + D, b.z1 - D, b.x1 - D, b.x1, false);
    if (Math.random() < 0.6) {
      const neon = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'LAMPAS', size: 80 }], '#1a0a10', '#ff7a1a', 512, 128), transparent: true }));
      neon.rotation.x = -Math.PI / 2; neon.position.set(b.x0 + 5, 17, b.z1 - 5); scene.add(neon); lampasNeons.push(neon);
    }
    solid(b.x0, b.x1, b.z0, b.z1);
  }
  // District themes: the same street grid dressed for each act's destination (start({ theme })). Lampas is the base city;
  // 'nosh' turns the north into Hipsterheuvel (roof gardens, string lights, green signs), 'docks' into De Duistere Dokken
  // (container stacks, cranes, rust), 'sand' into De Zandwijk (dunes, palms, terracotta roofs). Each theme is one group that is shown or hidden when a drive starts.
  const THEMES = {};
  function buildThemes(lampasSign) {
    const north = blocks.filter((b) => b.kind === 'north');
    // Hipsterheuvel
    const g2 = new THREE.Group(); scene.add(g2);
    for (const b of north) { // the green courtyard inside each block (open to the sky): trees, string lights and a neon sign
      const D = 10, x0 = b.x0 + D, x1 = b.x1 - D, z0 = b.z0 + D, z1 = b.z1 - D, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      for (const [x, z] of [[x0 + 2.5, z0 + 2.5], [x1 - 2.5, z0 + 2.5], [x0 + 2.5, z1 - 2.5], [x1 - 2.5, z1 - 2.5], [cx, cz]]) {
        const t = new THREE.Mesh(new THREE.SphereGeometry(2, 10, 8), lam({ color: [0x4a8a3a, 0x5a9a3a, 0x3a7a2a][(Math.round(x + z)) % 3] })); t.position.set(x, 4, z); g2.add(t);
      }
      for (let x = x0 + 1; x < x1; x += 1.6) { const l = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 5), new THREE.MeshBasicMaterial({ color: 0xf2c14e })); l.position.set(x, 3 + Math.sin(x) * 0.3, cz + 3); g2.add(l); }
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.8), new THREE.MeshBasicMaterial({ map: signTex([{ t: ['BIO', 'VEGAN', 'KOMBUCHA', 'OAT'][(b.i + b.j) % 4], size: 80 }], '#0a140c', '#a9c46a', 512, 128), transparent: true }));
      sign.rotation.x = -Math.PI / 2; sign.position.set(cx, 0.3, cz - 4); g2.add(sign);
    }
    // roof gardens on every roof: green with planters
    const gardenT = canvasTex(64, 64, (g) => { g.fillStyle = '#4a7a32'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '120,170,70' : '30,60,20'},${Math.random() * 0.5})`; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } g.fillStyle = '#8a6a42'; g.fillRect(0, 0, 64, 4); g.fillRect(0, 60, 64, 4); });
    const gardenM = lam({ map: gardenT });
    for (const r of northRoofs) { const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.5, r.w - 0.7), Math.max(0.5, r.d - 0.7)), gardenM); m.rotation.x = -Math.PI / 2; m.position.set(r.cx, r.h + 0.4, r.cz); g2.add(m); if (Math.random() < 0.35) { const t = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), lam({ color: 0x3a7a2a })); t.position.set(r.cx, r.h + 1.2, r.cz); g2.add(t); } }
    g2.add(label([{ t: 'WELKOM OP HIPSTERHEUVEL', size: 54 }, { t: 'NOSHGEY KARIOT · 100% BIOLOGISCH', size: 28, color: '#0a140c' }], '#a9c46a', '#0a140c', 22, 4, 110, 0.1, CANAL.z0 - 6.2, 0, g2, 1024, 190));
    THEMES.nosh = { g: g2, hemi: [0xf0ffe0, 0x3a5a3a] };
    // De Duistere Dokken
    const g3 = new THREE.Group(); scene.add(g3);
    const contC = [0x7a2e1a, 0x2a4a6a, 0x5a6a3a, 0xd8a83a, 0x3a3a3a];
    for (const b of north) { // container stacks fill each courtyard, a small crane over every other one
      const D = 10, x0 = b.x0 + D, z0 = b.z0 + D, x1 = b.x1 - D, z1 = b.z1 - D;
      for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.BoxGeometry(5.5, 2.4, 2.3), lam({ color: contC[(k + b.i * 3 + b.j) % 5] })); c.position.set(x0 + 3.5 + (k % 2) * 6.5, 1.2 + Math.floor(k / 4) * 2.4, z0 + 2.5 + (Math.floor(k / 2) % 2) * 3.2); c.rotation.y = (k % 3) * 0.05; g3.add(c); }
      if ((b.i + b.j) % 2 === 0) { const cr = new THREE.Group(); cr.position.set(x1 - 3, 0, z1 - 3); g3.add(cr); for (const dx of [-1, 1]) for (const dz of [-1, 1]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.4, 12, 0.4), lam({ color: 0x8a2e1a })); leg.position.set(dx, 6, dz); cr.add(leg); } const jib = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 14), lam({ color: 0x8a2e1a })); jib.position.set(0, 12, -5); cr.add(jib); }
    }
    // rusty corrugated warehouse roofs everywhere
    const rustT = canvasTex(64, 64, (g) => { for (let x = 0; x < 64; x += 4) { g.fillStyle = x % 8 ? '#6a3a24' : '#5a2e1c'; g.fillRect(x, 0, 4, 64); } for (let i = 0; i < 30; i++) { g.fillStyle = `rgba(160,80,30,${Math.random() * 0.4})`; g.fillRect(Math.random() * 64, Math.random() * 64, 6, 3); } });
    const rustM = lam({ map: rustT });
    for (const r of northRoofs) { const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.5, r.w - 0.7), Math.max(0.5, r.d - 0.7)), rustM); m.rotation.x = -Math.PI / 2; m.position.set(r.cx, r.h + 0.4, r.cz); g3.add(m); }
    g3.add(label([{ t: 'DE DUISTERE DOKKEN', size: 54 }, { t: 'ABDAVISSIES · GEEN VRAGEN', size: 28, color: '#c8d8e0' }], '#1a2a3a', '#c8d8e0', 22, 4, 110, 0.1, CANAL.z0 - 6.2, 0, g3, 1024, 190));
    THEMES.docks = { g: g3, hemi: [0xc8d8e8, 0x2a3040] };
    // De Zandwijk (the Paravim): sand blown into every courtyard, date palms, terracotta flat roofs, striped market awnings
    const g4 = new THREE.Group(); scene.add(g4);
    const sandM = lam({ color: 0xd8b884 }), palmM = lam({ color: 0x7a5a3a }), frondM = lam({ color: 0x4a7a2a });
    for (const b of north) {
      const D = 10, x0 = b.x0 + D, z0 = b.z0 + D, x1 = b.x1 - D, z1 = b.z1 - D, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      const dune = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), sandM); dune.scale.set((x1 - x0) / 2, 1.2, (z1 - z0) / 2); dune.position.set(cx, 0, cz); g4.add(dune);
      for (const [x, z] of [[x0 + 2.5, z0 + 2.5], [x1 - 2.5, z1 - 2.5], [x1 - 2.5, z0 + 2.5]]) {
        const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, 7, 7), palmM); tr.position.set(x, 3.5, z); g4.add(tr);
        for (let f = 0; f < 7; f++) { const fr = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 3.6), frondM); const a = f / 7 * Math.PI * 2; fr.position.set(x + Math.sin(a) * 1.5, 6.8, z + Math.cos(a) * 1.5); fr.rotation.y = a; fr.rotation.x = 0.4; g4.add(fr); }
      }
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.8), new THREE.MeshBasicMaterial({ map: signTex([{ t: ['ZA’ATAR', 'SUMAK', 'HARISSA', 'DADELS'][(b.i + b.j) % 4], size: 80 }], '#2a2e6a', '#e8a33d', 512, 128), transparent: true }));
      sign.rotation.x = -Math.PI / 2; sign.position.set(cx, 1.4, cz + 4); g4.add(sign);
    }
    const terraT = canvasTex(64, 64, (g) => { g.fillStyle = '#b4542c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(${Math.random() < 0.5 ? '90,40,20' : '230,170,110'},${Math.random() * 0.25})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 3); } g.fillStyle = '#e8d0a0'; g.fillRect(0, 0, 64, 3); g.fillRect(0, 61, 64, 3); });
    const terraM = lam({ map: terraT }), awnT = canvasTex(64, 64, (g) => { for (let x = 0; x < 64; x += 16) { g.fillStyle = '#b8301a'; g.fillRect(x, 0, 8, 64); g.fillStyle = '#f3e6c8'; g.fillRect(x + 8, 0, 8, 64); } }), awnM = lam({ map: awnT });
    for (const r of northRoofs) { const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.max(0.5, r.w - 0.7), Math.max(0.5, r.d - 0.7)), terraM); m.rotation.x = -Math.PI / 2; m.position.set(r.cx, r.h + 0.4, r.cz); g4.add(m); if (Math.random() < 0.3) { const a = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(4, r.w * 0.6), 2), awnM); a.rotation.x = -Math.PI / 2; a.position.set(r.cx, r.h + 0.6, r.cz); g4.add(a); } }
    g4.add(label([{ t: 'WELKOM IN DE ZANDWIJK', size: 54 }, { t: 'PARAVIM · BETAAL JE SCHULDEN', size: 28, color: '#2a2e6a' }], '#e8a33d', '#2a2e6a', 22, 4, 110, 0.1, CANAL.z0 - 6.2, 0, g4, 1024, 190));
    THEMES.sand = { g: g4, hemi: [0xffe0b0, 0x6a4a2a] };
    THEMES.lampas = { g: null, sign: lampasSign, hemi: [0xffe8d0, 0x4a4060] };
  }
  function applyTheme(name) {
    const th = THEMES[name] ? name : 'lampas';
    for (const [k, t] of Object.entries(THEMES)) if (t.g) t.g.visible = k === th;
    if (THEMES.lampas.sign) THEMES.lampas.sign.visible = th === 'lampas';
    for (const n of lampasNeons) n.visible = th === 'lampas';
    hemi.color.set(THEMES[th].hemi[0]); hemi.groundColor.set(THEMES[th].hemi[1]);
  }
  // Schiptagat, the airport (Freddy Sr. flies home from Costa del Kaas, js/freddy.js): the kiss & ride on the east edge,
  // a control tower over the rooftops, planes coming in low, and Pa on the pavement with his suitcases and a sombrero
  let airport = null, jet = null;
  const AIR = { i: 5, j: 3 }; // the crossing the pick-up parks on (start({ target: [5, 3] }))
  function buildAirport() {
    const g = airport = new THREE.Group(); g.visible = false; scene.add(g);
    const x = GX[AIR.i], z = GZ[AIR.j];
    label([{ t: 'SCHIPTAGAT', size: 70 }, { t: 'AANKOMST · ARRIVALS · KISS & RIDE', size: 26, color: '#ffffff' }], '#1a3a8a', '#ffd36b', 22, 4.6, x + 22, 23, z, Math.PI / 2, g, 1024, 210);
    label([{ t: 'KISS & RIDE', size: 66 }, { t: 'max. 3 min · ook voor vaders', size: 28, color: '#ffffff' }], 'none', '#ffd36b', 9, 2.2, x, 0.2, z + 17, 0, g);
    // the control tower behind the edge row
    const tw = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.8, 34, 16), lam({ color: 0xe8e4dc })); tw.position.set(x + 30, 17, z - 18); tw.castShadow = true; g.add(tw);
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(4.4, 3.6, 3, 16), lam({ color: 0x3a6a9a, emissive: 0x10305a })); cab.position.set(x + 30, 35.5, z - 18); g.add(cab);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.8, 0.6, 16), lam({ color: 0xf2f0ea })); cap.position.set(x + 30, 37.3, z - 18); g.add(cap);
    // Pa: navy shirt, white hair, a sombrero you can see from the sky, two suitcases
    const pa = new THREE.Group(); pa.position.set(x + 6.6, 0, z + 7.5); g.add(pa);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 1.25, 10), lam({ color: 0x232a40 })); body.position.y = 0.82; body.castShadow = true; pa.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 10), lam({ color: 0xdc9c82 })); head.position.y = 1.66; pa.add(head);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.06, 20), lam({ color: 0xe8c860 })); brim.position.y = 1.86; brim.castShadow = true; pa.add(brim);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.5, 14), lam({ color: 0xd8a830 })); crown.position.y = 2.1; pa.add(crown);
    for (const [dx, c] of [[0.9, 0xb03a2a], [1.6, 0x2a6a4a]]) { const sc = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.75, 0.3), lam({ color: c })); sc.position.set(dx, 0.4, 0.2); sc.castShadow = true; pa.add(sc); }
    label([{ t: 'PA', size: 90 }], 'none', '#ffd36b', 3, 1.4, x + 6.6, 0.22, z + 9.6, 0, g, 256, 128);
    // a jet on final approach, over the rooftops
    jet = new THREE.Group(); g.add(jet);
    const white = lam({ color: 0xf4f4f0 }), blue = lam({ color: 0x1a3a8a });
    const fus = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 22, 12), white); fus.rotation.x = Math.PI / 2; fus.castShadow = true; jet.add(fus);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), white); nose.position.z = 11; nose.scale.z = 1.8; jet.add(nose);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 4), white); wing.position.z = 1; wing.castShadow = true; jet.add(wing);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 2.4), white); tail.position.z = -9.5; jet.add(tail);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 4, 3), blue); fin.position.set(0, 2, -9.5); jet.add(fin);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.5, 20), blue); stripe.position.y = 0.2; jet.add(stripe);
    jet.userData.t = 0;
  }
  function updateAirport(dt) { // a plane every dozen seconds, low over the kiss & ride
    if (!airport || !airport.visible || !jet) return;
    const T = 12, t = (jet.userData.t = (jet.userData.t + dt) % T), k = t / T;
    const x = GX[AIR.i] + 60 - k * 260, z = GZ[AIR.j] - 30 + k * 40;
    jet.position.set(x, 30 - k * 6, z); jet.rotation.y = -Math.PI / 2 + Math.atan2(40, 260);
    jet.visible = k < 0.9;
  }
  function buildPark(b) {
    plane(b.x1 - b.x0 + 2, b.z1 - b.z0 + 2, grassM, (b.x0 + b.x1) / 2, 0.16, (b.z0 + b.z1) / 2);
    label([{ t: 'KAASPARK', size: 60 }, { t: 'niet op het gras rijden', size: 28, color: '#ffffff' }], '#2a5a2a', '#ffd36b', 9, 2.3, (b.x0 + b.x1) / 2, 0.2, b.z1 - 3);
    const pond = new THREE.Mesh(new THREE.CircleGeometry(5, 24), waterM); pond.rotation.x = -Math.PI / 2; pond.position.set((b.x0 + b.x1) / 2 + 4, 0.18, (b.z0 + b.z1) / 2 - 3); scene.add(pond);
    for (let k = 0; k < 14; k++) {
      const x = b.x0 + 2 + Math.random() * (b.x1 - b.x0 - 4), z = b.z0 + 2 + Math.random() * (b.z1 - b.z0 - 4);
      if (Math.hypot(x - pond.position.x, z - pond.position.z) < 6.5) continue;
      const crown = new THREE.Mesh(new THREE.SphereGeometry(1.8 + Math.random(), 10, 8), lam({ color: [0x2f6a2a, 0x3a7a32, 0x4a8a3a][k % 3] }));
      crown.position.set(x, 4, z); crown.castShadow = true; scene.add(crown);
      solid(x - 0.5, x + 0.5, z - 0.5, z + 0.5); // only the trunk stops you
    }
  }
  function buildPlaza(b) {
    plane(b.x1 - b.x0 + 2, b.z1 - b.z0 + 2, lam({ map: rep(paveT.clone(), 10, 10), color: 0xd8c8a8 }), (b.x0 + b.x1) / 2, 0.15, (b.z0 + b.z1) / 2);
    // Frietwijk: a Lampas frites kiosk in the corner and a few terrace tables
    building(b.x1 - 9, b.x1 - 1, b.z0 + 1, b.z0 + 7, 3.4, 0xff7a1a, flatRoofM(0xffd36b));
    label([{ t: 'FRIETWIJK', size: 70 }, { t: 'LAMPAS FRITES · SAUS VERDUND', size: 26, color: '#1a0a10' }], '#ffd36b', '#1a0a10', 8, 2.4, b.x1 - 5, 3.5, b.z0 + 4);
    solid(b.x1 - 9, b.x1 - 1, b.z0 + 1, b.z0 + 7);
    for (const [x, z] of [[b.x0 + 4, b.z0 + 4], [b.x0 + 8, b.z0 + 4], [b.x0 + 4, b.z1 - 4], [b.x1 - 4, b.z1 - 4]]) {
      const u = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.6, 8), lam({ color: 0xd8202a })); u.position.set(x, 2.4, z); u.castShadow = true; scene.add(u);
    }
    label([{ t: 'OUD-VETTENBURG', size: 60 }], 'none', '#ffffff', 16, 2.4, (b.x0 + b.x1) / 2, 0.17, b.z1 - 2);
  }
  function edgeRow(x0, x1, z0, z1, dir, south) {
    const len = dir === 'v' ? z1 - z0 : x1 - x0;
    for (let a = 0; a < len;) {
      const w = 8 + Math.random() * 10, h = 8 + Math.random() * 12, c = SOUTH_WALL[(Math.random() * SOUTH_WALL.length) | 0], r = flatRoofM(ROOF_TINT[(Math.random() * ROOF_TINT.length) | 0]);
      if (dir === 'v') building(x0, x1, z0 + a, Math.min(z1, z0 + a + w), h, c, r, { ac: true }); else building(x0 + a, Math.min(x1, x0 + a + w), z0, z1, h, c, r, { ac: !south });
      a += w;
    }
    solid(x0, x1, z0, z1);
  }

  // ---------------------------------------------------------------- vehicles
  function makeVan() {
    const g = new THREE.Group(); g.add(makeOofmobiel(THREE, canvasTex)); // the shared Oofmobiel (js/vehicles.js), nose +z
    // headlight beams on the road
    const beamM = new THREE.MeshBasicMaterial({ color: 0xfff0b0, transparent: true, opacity: 0.16, depthWrite: false });
    for (const s of [-1, 1]) { const bm = new THREE.Mesh(new THREE.CircleGeometry(3, 16, -0.5, 1.0), beamM); bm.rotation.x = -Math.PI / 2; bm.rotation.z = -Math.PI / 2; bm.position.set(s * 0.72, 0.05, 2.75); g.add(bm); }
    // brake lights (red glow behind the van) and the white reversing light, so you can see what the van is doing
    const brakeM = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0, depthWrite: false });
    const revM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false });
    for (const s of [-1, 1]) { const bl = new THREE.Mesh(new THREE.CircleGeometry(0.6, 14), brakeM); bl.rotation.x = -Math.PI / 2; bl.position.set(s * 0.8, 0.06, -2.7); g.add(bl); }
    const rv = new THREE.Mesh(new THREE.CircleGeometry(3.4, 16, -0.45, 0.9), revM); rv.rotation.x = -Math.PI / 2; rv.rotation.z = Math.PI / 2; rv.position.set(0, 0.05, -2.6); g.add(rv);
    g.userData.brakeM = brakeM; g.userData.revM = revM;
    return g;
  }
  const CAR_COLS = [0xb8b2a2, 0x6a1e22, 0x2a4a6a, 0xcfcfc8, 0x2d2d2d, 0x8a8f3a, 0xe0d8c0, 0x3a5a7a, 0x9a2a2a, 0x556b5a, 0xe8b020, 0xff8fb8];
  function makeCar(color, lampas) { // the shared street cars (js/vehicles.js) turned to face +z like everything here
    const g = new THREE.Group(), c = makeStreetCar(THREE, canvasTex, { paint: color, lampas, model: lampas ? 0 : -1 });
    c.rotation.y = -Math.PI / 2; g.add(c);
    g.userData.body = c.userData.paint; g.userData.len = c.userData.half * 2;
    return g;
  }
  function makePed() {
    const g = new THREE.Group(), c = [0xd8202a, 0x2a6ad8, 0xe8b020, 0x3a9a4a, 0xf2f2f2, 0x7a3aa8, 0xff8a3a, 0x2a2a2a][(Math.random() * 8) | 0];
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 1.2, 8), lam({ color: c })); body.position.y = 0.8; body.castShadow = true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.26, 10, 8), lam({ color: [0xf0c4a2, 0xc88a60, 0x8a5a3a, 0xe4ab88][(Math.random() * 4) | 0] })); head.position.y = 1.62; g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: [0x2a1a10, 0x8a6a3a, 0xd8c070, 0x1a1a1a, 0xb8b8b8][(Math.random() * 5) | 0] })); hair.position.y = 1.66; g.add(hair);
    if (Math.random() < 0.25) { const bag = box(0.3, 0.3, 0.45, lam({ color: 0xf2e8d0 }), 0.42, 0.7, 0, g, false); bag.userData.bag = true; } // shopping bag (with cheese)
    g.scale.setScalar(1.35);
    return g;
  }

  // ---------------------------------------------------------------- dynamic state
  const van = { g: null, x: 0, z: 0, h: 0, vx: 0, vz: 0, hp: 100, safe: { x: 0, z: 0, h: 0 }, safeT: 0, freeze: 0, honkT: 0 };
  const cars = [], peds = [], lampas = [];
  let run = null; // per-attempt stats
  let shake = 0;
  const keys = {};

  // ---- bubbles (speech over people's heads)
  const bubbles = [];
  function say(t, x, z, col = '#ffffff') { // HTML Aero balloon over a point in the city (js/balloons.js)
    let b = bubbles.find((q) => q.t <= 0);
    if (!b) { if (bubbles.length >= 14) b = bubbles.reduce((a, q) => (q.t < a.t ? q : a)); else { b = { s: ctx.balloons.anchor(), t: 0 }; scene.add(b.s); bubbles.push(b); } }
    b.s.position.set(x, 6, z); ctx.balloons.say(b.s, t, col, 1.5); b.t = b.s.userData.life;
  }

  // ---- traffic on the lane graph
  const laneOf = (axis, dir, idx) => (axis === 'z' ? GX[idx] + (dir < 0 ? 2.2 : -2.2) : GZ[idx] + (dir > 0 ? 2.2 : -2.2));
  function options(i, j) { // directions you can leave crossing (i, j) in
    const o = [];
    if (j < GZ.length - 1 && segOpen(`v${i},${j}`) && !(j === CANAL.row && !OPEN_BRIDGES.includes(i))) o.push(['z', -1]);
    if (j > 0 && segOpen(`v${i},${j - 1}`) && !(j - 1 === CANAL.row && !OPEN_BRIDGES.includes(i))) o.push(['z', 1]);
    if (i < GX.length - 1 && segOpen(`h${i},${j}`)) o.push(['x', 1]);
    if (i > 0 && segOpen(`h${i - 1},${j}`)) o.push(['x', -1]);
    return o;
  }
  function placeCar(c, i, j) {
    const opts = options(i, j); if (!opts.length) return false;
    const [axis, dir] = opts[(Math.random() * opts.length) | 0];
    Object.assign(c, { axis, dir, line: axis === 'z' ? i : j, ni: i, nj: j, knock: 0, yieldT: 0, side: 0, sp: 0 });
    c.pos = (axis === 'z' ? GZ[j] : GX[i]) + dir * (SW + 2 + Math.random() * 20);
    c.max = 9 + Math.random() * 5;
    syncCar(c, true); return true;
  }
  function nextNode(c) { // the crossing this car drives towards
    if (c.axis === 'z') { const j = c.dir < 0 ? GZ.findIndex((z) => z < c.pos - 0.01) : GZ.length - 1 - [...GZ].reverse().findIndex((z) => z > c.pos + 0.01); return [c.line, j]; }
    const i = c.dir > 0 ? GX.findIndex((x) => x > c.pos + 0.01) : GX.length - 1 - [...GX].reverse().findIndex((x) => x < c.pos - 0.01); return [i, c.line];
  }
  function carXZ(c) {
    const lane = laneOf(c.axis, c.dir, c.line), side = c.side * (c.axis === 'z' ? -c.dir : c.dir); // pull towards the kerb (right-hand side)
    return c.axis === 'z' ? [lane + side, c.pos] : [c.pos, lane + side];
  }
  function syncCar(c, snap) {
    const [x, z] = carXZ(c), h = c.axis === 'z' ? (c.dir < 0 ? Math.PI : 0) : (c.dir > 0 ? Math.PI / 2 : -Math.PI / 2);
    if (snap) { c.g.position.set(x, 0, z); c.g.rotation.y = h; return; }
    c.g.position.x += (x - c.g.position.x) * 0.25; c.g.position.z += (z - c.g.position.z) * 0.25;
    let dr = h - c.g.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); c.g.rotation.y += dr * 0.18;
  }
  function respawnCar(c) {
    for (let tries = 0; tries < 30; tries++) {
      const i = (Math.random() * GX.length) | 0, j = (Math.random() * GZ.length) | 0;
      if (Math.hypot(GX[i] - van.x, GZ[j] - van.z) < 55) continue;
      if (placeCar(c, i, j)) { c.g.rotation.z = 0; c.g.position.y = 0; c.g.visible = true; return; }
    }
  }
  function updateCar(c, dt) {
    if (c.knock > 0) { // tumbling after a crash: free physics, then it goes away and comes back somewhere else
      c.knock -= dt; c.g.position.x += c.kvx * dt; c.g.position.z += c.kvz * dt; c.g.rotation.y += c.spin * dt;
      const k = Math.max(0, 1 - dt * 2.2); c.kvx *= k; c.kvz *= k; c.spin *= k;
      const p = { x: c.g.position.x, z: c.g.position.z }; collideStatic(p, 1.4); c.g.position.x = p.x; c.g.position.z = p.z;
      if (c.knock <= 0) { if (Math.hypot(c.g.position.x - van.x, c.g.position.z - van.z) > 50) respawnCar(c); else c.knock = 0.5; }
      return;
    }
    // look ahead for the van and other cars in the same lane
    const fx = c.axis === 'x' ? c.dir : 0, fz = c.axis === 'z' ? c.dir : 0;
    const [x, z] = carXZ(c); let blocked = 99;
    const check = (ox, oz) => { const dx = ox - x, dz = oz - z, ahead = dx * fx + dz * fz, lat = Math.abs(dx * fz - dz * fx); if (ahead > 0 && ahead < blocked && lat < 2.4) blocked = ahead; };
    check(van.x, van.z);
    for (const o of cars) if (o !== c && o.knock <= 0) { const [ox, oz] = carXZ(o); check(ox, oz); }
    for (const l of lampas) check(l.x, l.z);
    let target = c.yieldT > 0 ? 2.5 : c.max;
    { // give way at crossings: wait while another car is in the middle of the crossing ahead
      const [ni, nj] = nextNode(c), nx = GX[ni], nz = GZ[nj];
      if (nx !== undefined && nz !== undefined) {
        const dn = Math.hypot(nx - x, nz - z);
        if (dn > 5.5 && dn < 11) for (const o of cars) if (o !== c && o.knock <= 0 && o.axis !== c.axis && Math.hypot(o.g.position.x - nx, o.g.position.z - nz) < 6) { target = 0; break; }
      }
    }
    if (blocked < 9) target = Math.min(target, Math.max(0, (blocked - 5) * 2));
    c.sp += Math.sign(target - c.sp) * Math.min(Math.abs(target - c.sp), (target < c.sp ? 18 : 6) * dt);
    if (c.yieldT > 0) { c.yieldT -= dt; c.side = Math.min(1.8, c.side + dt * 3); } else c.side = Math.max(0, c.side - dt * 1.5);
    const [ni, nj] = nextNode(c);
    const nodeA = c.axis === 'z' ? GZ[nj] : GX[ni];
    const before = (nodeA - c.pos) * c.dir;
    c.pos += c.dir * c.sp * dt;
    if (ni < 0 || nj < 0 || ni >= GX.length || nj >= GZ.length || ni === undefined) { respawnCar(c); return; }
    if ((nodeA - c.pos) * c.dir <= 0 && before > 0) { // reached the crossing: pick a way on, never straight back unless it's a dead end
      let opts = options(ni, nj).filter(([a, d]) => !(a === c.axis && d === -c.dir));
      if (!opts.length) opts = options(ni, nj);
      const [axis, dir] = opts[(Math.random() * opts.length) | 0];
      if (axis !== c.axis) { c.axis = axis; c.line = axis === 'z' ? ni : nj; c.pos = axis === 'z' ? GZ[nj] : GX[ni]; }
      c.dir = dir;
    }
    syncCar(c);
  }

  // ---- pedestrians walk round their block
  function perim(b) { const x0 = b.x0 - 1.5, x1 = b.x1 + 1.5, z0 = b.z0 - 1.5, z1 = b.z1 + 1.5; return { x0, x1, z0, z1, w: x1 - x0, d: z1 - z0, L: 2 * (x1 - x0 + z1 - z0) }; }
  function perimAt(p, s) { // point on the walking loop + inward normal (towards the buildings)
    s = ((s % p.L) + p.L) % p.L;
    if (s < p.w) return [p.x0 + s, p.z0, 0, 1];
    if ((s -= p.w) < p.d) return [p.x1, p.z0 + s, -1, 0];
    if ((s -= p.d) < p.w) return [p.x1 - s, p.z1, 0, -1];
    s -= p.w; return [p.x0, p.z1 - s, 1, 0];
  }
  function perimProject(p, x, z) {
    x = Math.min(p.x1, Math.max(p.x0, x)); z = Math.min(p.z1, Math.max(p.z0, z));
    const dN = z - p.z0, dE = p.x1 - x, dS = p.z1 - z, dW = x - p.x0, m = Math.min(dN, dE, dS, dW);
    if (m === dN) return x - p.x0; if (m === dE) return p.w + (z - p.z0); if (m === dS) return p.w + p.d + (p.x1 - x); return 2 * p.w + p.d + (p.z1 - z);
  }
  function updatePed(p, dt) {
    const g = p.g;
    if (p.down > 0) { // launched by the van
      p.down -= dt;
      if (g.position.y > 0 || p.vy > 0) { p.vy -= 26 * dt; g.position.y = Math.max(0, g.position.y + p.vy * dt); g.position.x += p.vx * dt; g.position.z += p.vz * dt; g.rotation.x += p.spin * dt; }
      else { p.vx *= 0.9; p.vz *= 0.9; g.rotation.x = Math.PI / 2; }
      if (p.down <= 0) { g.rotation.x = 0; g.position.y = 0; p.s = perimProject(p.loop, g.position.x, g.position.z); p.off = 0; if (Math.random() < 0.5) say(HIT_LINES[(Math.random() * HIT_LINES.length) | 0], g.position.x, g.position.z, '#ffd0d0'); }
      return;
    }
    if (p.flee > 0) { p.flee -= dt; p.off = Math.min(1.35, p.off + dt * 6); p.hop += dt * 18; } else { p.off = Math.max(0, p.off - dt * 0.8); p.hop = 0; }
    p.s += p.dir * p.sp * dt * (p.flee > 0 ? 0.3 : 1);
    const [x, z, nx, nz] = perimAt(p.loop, p.s);
    g.position.set(x + nx * p.off, p.flee > 0 ? Math.abs(Math.sin(p.hop)) * 0.5 : 0, z + nz * p.off);
    const [x2, z2] = perimAt(p.loop, p.s + p.dir * 0.5);
    g.rotation.y = p.flee > 0 ? Math.atan2(-nx, -nz) : Math.atan2(x2 - x, z2 - z); // facing the street while pressed to the wall
    p.walk += dt * p.sp * 6; g.children[0].rotation.z = Math.sin(p.walk) * 0.08;
  }

  // ---- van and Lampas physics (shared simple car model)
  function collideStatic(p, r) { // pushes p out of solids; returns the strongest normal hit
    let hit = null;
    for (const s of solids) {
      const cx = Math.max(s.x0, Math.min(p.x, s.x1)), cz = Math.max(s.z0, Math.min(p.z, s.z1));
      let dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d >= r) continue;
      if (d < 1e-4) { // centre inside: push out the short way
        const o = [[p.x - s.x0, -1, 0], [s.x1 - p.x, 1, 0], [p.z - s.z0, 0, -1], [s.z1 - p.z, 0, 1]].sort((a, b) => a[0] - b[0])[0];
        dx = o[1]; dz = o[2]; d = 0; p.x += dx * (o[0] + r); p.z += dz * (o[0] + r);
      } else { dx /= d; dz /= d; p.x += dx * (r - d); p.z += dz * (r - d); }
      if (!hit) hit = { nx: dx, nz: dz }; else { hit.nx += dx; hit.nz += dz; }
    }
    if (hit) { const L = Math.hypot(hit.nx, hit.nz) || 1; hit.nx /= L; hit.nz /= L; }
    return hit;
  }
  function bodyCollide(o, half) { // three circles along the body
    const fx = Math.sin(o.h), fz = Math.cos(o.h); let best = null;
    for (const off of [-half, 0, half]) {
      const p = { x: o.x + fx * off, z: o.z + fz * off }, bx = p.x, bz = p.z;
      const hit = collideStatic(p, 1.15);
      if (hit) { o.x += p.x - bx; o.z += p.z - bz; const imp = -(o.vx * hit.nx + o.vz * hit.nz); if (!best || imp > best.imp) best = { ...hit, imp, off }; }
    }
    if (best && best.imp > 0) {
      o.vx += best.nx * best.imp * 1.3; o.vz += best.nz * best.imp * 1.3; o.vx *= 0.9; o.vz *= 0.9;
      o.h += best.off * 0.012 * best.imp * Math.sign(fx * best.nz - fz * best.nx); // glancing hits turn the nose
    }
    return best;
  }
  function drivePhysics(o, throttle, steer, dt, maxv, grip) {
    const fx = Math.sin(o.h), fz = Math.cos(o.h), sp = o.vx * fx + o.vz * fz;
    o.h += steer * 2.7 * Math.min(1, Math.abs(sp) / 6) * Math.sign(sp || 1) * (1 - 0.35 * Math.min(1, Math.abs(sp) / maxv)) * dt;
    let a = 0;
    if (throttle > 0) a = sp < -0.5 ? 30 : 15 * throttle * (1 - Math.max(0, sp) / maxv);
    else if (throttle < 0) a = sp > 0.5 ? -28 : -13 * -throttle * (1 + Math.min(0, sp) / REV); // brake first, then back up
    o.vx += fx * a * dt; o.vz += fz * a * dt;
    if (!throttle) { const k = Math.max(0, 1 - dt * 0.9); o.vx *= k; o.vz *= k; }
    const sp2 = o.vx * fx + o.vz * fz, lx = o.vx - fx * sp2, lz = o.vz - fz * sp2, gk = Math.min(1, grip * dt);
    o.vx -= lx * gk; o.vz -= lz * gk;
    o.x += o.vx * dt; o.z += o.vz * dt;
    return sp2;
  }
  function spawnLampas(x, z) {
    const g = makeCar(0xff7a1a, true); scene.add(g);
    const l = { g, x, z, h: 0, vx: 0, vz: 0, hp: 3, dead: false, stuck: 0, rev: 0, hitCd: 0, smoke: [] };
    l.h = Math.atan2(van.x - x, van.z - z); lampas.push(l);
    say(LAMPAS_LINES[(Math.random() * LAMPAS_LINES.length) | 0], x, z, '#ffb070');
  }
  const smokeM = new THREE.MeshBasicMaterial({ color: 0x3a3a3a, transparent: true, opacity: 0.5, depthWrite: false });
  function wreckLampas(l) {
    l.dead = true; l.g.userData.body.color.set(0x3a2a20); run.wrecked++; ev('wreck');
    banner('LAMPAS WEG!', `+W ${LAMPAS_BOUNTY}`, 1.6); beep(523, 0.12, 'triangle', 0.06); setTimeout(() => beep(784, 0.18, 'triangle', 0.06), 110);
    for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.9, 10), smokeM); s.rotation.x = -Math.PI / 2; s.position.set(l.x, 2 + k * 0.4, l.z); scene.add(s); l.smoke.push({ m: s, t: k * 0.4 }); }
  }
  function updateLampas(l, dt) {
    if (l.dead) {
      for (const s of l.smoke) { s.t += dt; const k = (s.t % 2) / 2; s.m.position.set(l.x + k * 2, 2 + k * 5, l.z - k * 2); s.m.scale.setScalar(0.6 + k * 2.2); s.m.material.opacity = 0.5 * (1 - k); }
      const k = Math.max(0, 1 - dt * 3); l.vx *= k; l.vz *= k; l.x += l.vx * dt; l.z += l.vz * dt; bodyCollide(l, 1.4);
    } else {
      l.hitCd -= dt;
      l.think -= dt;
      if (!(l.think > 0)) { l.think = 0.35; l.goal = chaseGoal(l); }
      const [tx, tz] = l.goal;
      let dh = Math.atan2(tx - l.x, tz - l.z) - l.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh));
      const lsp = Math.hypot(l.vx, l.vz); let thr = Math.abs(dh) > 1.2 ? 0.25 : (lsp > 11 && Math.abs(dh) > 0.5 ? -0.4 : 1), st = Math.max(-1, Math.min(1, dh * 2)); // brake into corners
      if (l.rev > 0) { l.rev -= dt; thr = -1; st = -st; }
      if (run.over) { thr = 0; st = 0; } // the chase is over once you've parked (or broken down)
      const sp = drivePhysics(l, thr, st, dt, 22, 5);
      if (Math.abs(sp) < 1.2 && l.rev <= 0) { l.stuck += dt; if (l.stuck > 1.2) { l.rev = 0.9; l.stuck = 0; } } else l.stuck = 0;
      const hit = bodyCollide(l, 1.4);
      if (hit && hit.imp > 10 && l.hitCd <= 0) { l.hitCd = 0.6; l.hp--; shakeAt(l.x, l.z, 0.3); beep(110, 0.12, 'sawtooth', 0.05); if (l.hp <= 0) wreckLampas(l); }
    }
    l.g.position.set(l.x, 0, l.z); l.g.rotation.y = l.h;
  }
  // Lampas pathing: straight at the van when nothing is in the way, otherwise along the streets (BFS over the crossings)
  function clearLine(x0, z0, x1, z1) {
    const n = Math.ceil(Math.hypot(x1 - x0, z1 - z0) / 2);
    for (let k = 1; k < n; k++) {
      const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n;
      if (isWater(x, z)) return false;
      for (const q of solids) if (x > q.x0 - 1.2 && x < q.x1 + 1.2 && z > q.z0 - 1.2 && z < q.z1 + 1.2) return false;
    }
    return true;
  }
  const nearestNode = (x, z) => [GX.reduce((b, v, i) => (Math.abs(v - x) < Math.abs(GX[b] - x) ? i : b), 0), GZ.reduce((b, v, j) => (Math.abs(v - z) < Math.abs(GZ[b] - z) ? j : b), 0)];
  function chaseGoal(l) {
    const tx = van.x + van.vx * 0.6, tz = van.z + van.vz * 0.6;
    if (clearLine(l.x, l.z, tx, tz)) return [tx, tz];
    const [gi, gj] = nearestNode(van.x, van.z), key = (a, b) => a * 100 + b;
    const dist = new Map([[key(gi, gj), 0]]), q = [[gi, gj]]; // street distance from the van's crossing
    while (q.length) {
      const [a, b] = q.shift(), d = dist.get(key(a, b));
      for (const [axis, dir] of options(a, b)) { const na = axis === 'x' ? a + dir : a, nb = axis === 'z' ? b - dir : b; if (!dist.has(key(na, nb))) { dist.set(key(na, nb), d + 1); q.push([na, nb]); } }
    }
    let best = null, bs = 1e9;
    for (let a = 0; a < GX.length; a++) for (let b = 0; b < GZ.length; b++) {
      const d = dist.get(key(a, b)); if (d === undefined) continue;
      const e = Math.hypot(GX[a] - l.x, GZ[b] - l.z); if (e > 60 || (e < 9 && d > 0)) continue; // skip the crossing we're on
      const sc = d * 44 + e; if (sc < bs && clearLine(l.x, l.z, GX[a], GZ[b])) { bs = sc; best = [GX[a], GZ[b]]; }
    }
    return best || [tx, tz];
  }
  function shakeAt(x, z, k) { if (Math.hypot(x - van.x, z - van.z) < 40) shake = Math.max(shake, k); }

  // ---- collisions between the van and everything that moves
  function vanVsMovers() {
    const fx = Math.sin(van.h), fz = Math.cos(van.h);
    const vanPts = [-1.7, 0, 1.7].map((o) => [van.x + fx * o, van.z + fz * o]);
    // cars
    for (const c of cars) {
      if (!c.g.visible) continue;
      const cx = c.g.position.x, cz = c.g.position.z; if (Math.abs(cx - van.x) > 7 || Math.abs(cz - van.z) > 7) continue;
      const ch = c.g.rotation.y, cfx = Math.sin(ch), cfz = Math.cos(ch);
      for (const [vx, vz] of vanPts) for (const o of [-1.2, 1.2]) {
        const px = cx + cfx * o, pz = cz + cfz * o, dx = vx - px, dz = vz - pz, d = Math.hypot(dx, dz);
        if (d >= 2.2 || d < 1e-3) continue;
        const nx = dx / d, nz = dz / d, cvx = c.knock > 0 ? c.kvx : cfx * c.sp, cvz = c.knock > 0 ? c.kvz : cfz * c.sp;
        const imp = -((van.vx - cvx) * nx + (van.vz - cvz) * nz);
        van.x += nx * (2.2 - d) * 0.5; van.z += nz * (2.2 - d) * 0.5;
        if (imp > 0) { van.vx += nx * imp * 0.55; van.vz += nz * imp * 0.55; }
        if (imp > 3) {
          c.knock = 2.5; c.kvx = cvx - nx * imp * 0.9; c.kvz = cvz - nz * imp * 0.9; c.spin = (Math.random() - 0.5) * imp * 0.6;
          damage(imp * 0.9); run.dents++; shake = Math.max(shake, Math.min(0.6, imp / 30));
          beep(90, 0.18, 'sawtooth', 0.06); if (Math.random() < 0.6) say(CAR_LINES[(Math.random() * CAR_LINES.length) | 0], cx, cz, '#e0e8ff');
        } else if (c.knock <= 0) { c.g.position.x -= nx * (2.2 - d) * 0.5; c.g.position.z -= nz * (2.2 - d) * 0.5; c.sp = Math.min(c.sp, 1); }
        break;
      }
    }
    // Lampas
    for (const l of lampas) {
      const dx = van.x - l.x, dz = van.z - l.z, d = Math.hypot(dx, dz);
      if (d >= 3.6 || d < 1e-3) continue;
      const nx = dx / d, nz = dz / d, imp = -((van.vx - l.vx) * nx + (van.vz - l.vz) * nz);
      van.x += nx * (3.6 - d) * 0.5; van.z += nz * (3.6 - d) * 0.5; l.x -= nx * (3.6 - d) * 0.5; l.z -= nz * (3.6 - d) * 0.5;
      if (imp > 0) { van.vx += nx * imp * 0.6; van.vz += nz * imp * 0.6; l.vx -= nx * imp * 0.8; l.vz -= nz * imp * 0.8; }
      if (imp > 4 && !l.dead && l.hitCd <= 0) {
        l.hitCd = 1.0;
        const vanFaster = Math.hypot(van.vx, van.vz) > Math.hypot(l.vx, l.vz);
        damage(vanFaster ? 1.5 + imp * 0.2 : 3 + imp * 0.3); l.rev = 0.6; // back off after a ram, then come again shake = Math.max(shake, 0.5); beep(80, 0.2, 'sawtooth', 0.07);
        if (vanFaster && imp > 7) { l.hp--; if (l.hp <= 0) wreckLampas(l); }
      }
    }
    // pedestrians
    const sp = Math.hypot(van.vx, van.vz);
    for (const p of peds) {
      if (p.down > 0) continue;
      const dx = p.g.position.x - van.x, dz = p.g.position.z - van.z; if (Math.abs(dx) > 5 || Math.abs(dz) > 5) continue;
      const lz = dx * fx + dz * fz, lx = dx * fz - dz * fx;
      if (Math.abs(lx) < 1.5 && Math.abs(lz) < 2.9) {
        if (sp < 2.5) { p.flee = Math.max(p.flee, 0.6); continue; } // slow bumps just make them hop
        p.down = 2.6; p.vx = van.vx * 0.8 + Math.sign(lx || 1) * fz * 3; p.vz = van.vz * 0.8 - Math.sign(lx || 1) * fx * 3; p.vy = 5 + sp * 0.15; p.spin = 8;
        run.bumped++; run.smart += SMART; ev('ped'); floatText(`−W ${SMART}`, p.g.position.x, p.g.position.z);
        beep(160, 0.1, 'square', 0.05); setTimeout(() => beep(120, 0.12, 'square', 0.04), 80);
        if (Math.random() < 0.7) say(HIT_LINES[(Math.random() * HIT_LINES.length) | 0], p.g.position.x, p.g.position.z, '#ffd0d0');
      }
    }
  }
  function floatText(t, x, z) { say(t, x + 1.5, z - 1.5, '#ff6a6a'); }
  function damage(n) { if (run.over) return; n *= (opts && opts.van && opts.van.dmg) || 1; van.hp = Math.max(0, van.hp - n); if (van.hp <= 0) fail('OOFMOBIEL KAPOT', 'The van gave up. Freddy Sr. will hear about this.'); }

  // ---- honk
  function honk() {
    if (!D.active || run.over || van.honkT > 0) return;
    van.honkT = 0.5; run.honks++;
    beep(392, 0.14, 'square', 0.07); setTimeout(() => beep(330, 0.14, 'square', 0.07), 140); setTimeout(() => beep(523, 0.28, 'square', 0.07), 280);
    const fx = Math.sin(van.h), fz = Math.cos(van.h);
    let said = 0;
    for (const p of peds) {
      if (p.down > 0) continue;
      const d = Math.hypot(p.g.position.x - van.x, p.g.position.z - van.z);
      if (d < 16) { p.flee = 1.6 + Math.random() * 0.6; if (said < 3 && Math.random() < 0.45) { said++; say(HONK_LINES[(Math.random() * HONK_LINES.length) | 0], p.g.position.x, p.g.position.z); } }
    }
    for (const c of cars) {
      if (c.knock > 0) continue;
      const dx = c.g.position.x - van.x, dz = c.g.position.z - van.z, ahead = dx * fx + dz * fz;
      if (ahead > -3 && ahead < 18 && Math.abs(dx * fz - dz * fx) < 6) { c.yieldT = 2.2; if (said < 4 && Math.random() < 0.3) { said++; say(CAR_LINES[(Math.random() * CAR_LINES.length) | 0], c.g.position.x, c.g.position.z, '#e0e8ff'); } }
    }
    for (const l of lampas) if (!l.dead && Math.hypot(l.x - van.x, l.z - van.z) < 18 && Math.random() < 0.5) say('TOEEET!', l.x, l.z, '#ffb070'); // they honk back
    honkRing.visible = true; honkRing.userData.t = 0; honkRing.position.set(van.x, 0.3, van.z);
  }
  const honkRing = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }));
  honkRing.rotation.x = -Math.PI / 2; honkRing.visible = false; scene.add(honkRing);

  // ---- route: a sat-nav line along the streets to the target (chevrons on the road + a line on the minimap)
  const route = { pts: [], len: 0, t: 0, dist: null, tn: null };
  const nkey = (a, b) => a * 100 + b;
  const step = (a, b, axis, dir) => [axis === 'x' ? a + dir : a, axis === 'z' ? b - dir : b];
  function routeField() { // street hops from every crossing to the one at the target (closed roads and raised bridges respected)
    const tn = nearestNode(TARGET.x, TARGET.z), dist = new Map([[nkey(...tn), 0]]), q = [tn];
    while (q.length) { const [a, b] = q.shift(), d = dist.get(nkey(a, b)); for (const [axis, dir] of options(a, b)) { const n = step(a, b, axis, dir); if (!dist.has(nkey(...n))) { dist.set(nkey(...n), d + 1); q.push(n); } } }
    route.dist = dist; route.tn = tn;
  }
  function routeCalc() {
    if (!route.dist) routeField();
    const fx = Math.sin(van.h), fz = Math.cos(van.h), pts = [[van.x, van.z]];
    if (Math.hypot(TARGET.x - van.x, TARGET.z - van.z) < 30 && clearLine(van.x, van.z, TARGET.x, TARGET.z)) pts.push([TARGET.x, TARGET.z]);
    else {
      let best = null, bs = 1e9; // the crossing to head for: close, in sight, few hops left; ones behind the van cost a little extra so the line doesn't flicker
      for (let a = 0; a < GX.length; a++) for (let b = 0; b < GZ.length; b++) {
        const d = route.dist.get(nkey(a, b)); if (d === undefined) continue;
        const dx = GX[a] - van.x, dz = GZ[b] - van.z, e = Math.hypot(dx, dz); if (e > 70) continue;
        const sc = e + d * 44 + ((dx * fx + dz * fz) < -3 ? 14 : 0);
        if (sc < bs && clearLine(van.x, van.z, GX[a], GZ[b])) { bs = sc; best = [a, b]; }
      }
      if (!best) { route.pts = [[van.x, van.z], [TARGET.x, TARGET.z]]; route.len = Math.hypot(TARGET.x - van.x, TARGET.z - van.z); return; }
      let [a, b] = best; pts.push([GX[a], GZ[b]]);
      for (let guard = 0; guard < 40 && route.dist.get(nkey(a, b)) > 0; guard++) {
        const d = route.dist.get(nkey(a, b));
        const nx = options(a, b).map(([axis, dir]) => step(a, b, axis, dir)).find((n) => route.dist.get(nkey(...n)) === d - 1); if (!nx) break;
        [a, b] = nx; pts.push([GX[a], GZ[b]]);
      }
      if (Math.hypot(TARGET.x - GX[a], TARGET.z - GZ[b]) > 1) pts.push([TARGET.x, TARGET.z]);
    }
    route.pts = pts; route.len = 0; for (let k = 1; k < pts.length; k++) route.len += Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]);
  }
  function routeAt(s) { // point and heading s metres along the route
    const P = route.pts;
    for (let k = 1; k < P.length; k++) {
      const dx = P[k][0] - P[k - 1][0], dz = P[k][1] - P[k - 1][1], L = Math.hypot(dx, dz);
      if (s <= L || k === P.length - 1) { const t = L ? Math.min(1, s / L) : 0; return [P[k - 1][0] + dx * t, P[k - 1][1] + dz * t, Math.atan2(dx, dz)]; }
      s -= L;
    }
    return [van.x, van.z, van.h];
  }
  const CHEV = 34, chevShape = new THREE.Shape();
  chevShape.moveTo(0, 0.9); chevShape.lineTo(1.5, -0.5); chevShape.lineTo(1.0, -0.95); chevShape.lineTo(0, 0.05); chevShape.lineTo(-1.0, -0.95); chevShape.lineTo(-1.5, -0.5); chevShape.closePath();
  const chevGeo = new THREE.ShapeGeometry(chevShape); chevGeo.rotateX(-Math.PI / 2); chevGeo.rotateY(Math.PI); // tip points +z, like the van
  const chevs = new THREE.InstancedMesh(chevGeo, new THREE.MeshBasicMaterial({ color: 0xffd36b, transparent: true, opacity: 0.6, depthWrite: false }), CHEV);
  chevs.renderOrder = 3; chevs.frustumCulled = false; scene.add(chevs);
  const chevM = new THREE.Matrix4(), chevQ = new THREE.Quaternion(), chevP = new THREE.Vector3(), chevS = new THREE.Vector3(1, 1, 1), chevUp = new THREE.Vector3(0, 1, 0);
  function drawRoute(show) {
    let n = 0;
    if (show) {
      const off = (performance.now() * 0.006) % 5; // the chevrons flow towards the target
      for (let s = 5 + off; s < route.len - 2 && n < CHEV; s += 5) {
        const [x, z, h] = routeAt(s); chevP.set(x, 0.16, z); chevQ.setFromAxisAngle(chevUp, h); chevM.compose(chevP, chevQ, chevS); chevs.setMatrixAt(n++, chevM);
      }
    }
    chevs.count = n; chevs.instanceMatrix.needsUpdate = true;
  }

  // ---------------------------------------------------------------- HUD (own DOM, removed from view when not driving)
  const css = document.createElement('style');
  css.textContent = `
  body.driving .hud, body.driving #help { display: none !important; }
  #drv { position: fixed; inset: 0; pointer-events: none; display: none; font-family: Rubik, Arial, sans-serif; color: #fff; z-index: 5; }
  #drv .top { position: absolute; left: 14px; top: 12px; text-shadow: 0 2px 0 #000; }
  #drv .route { font-family: Bungee, "Arial Black", sans-serif; font-size: 18px; color: #ffd36b; letter-spacing: 1px; }
  #drv .stats { font-family: VT323, monospace; font-size: 24px; line-height: 1; margin-top: 4px; }
  #drv .bar { width: 180px; height: 12px; border: 2px solid #fff; margin-top: 6px; background: rgba(0,0,0,.5); }
  #drv .bar i { display: block; height: 100%; background: #6ed36e; transition: width .2s; }
  #drv canvas { position: absolute; right: 12px; top: 12px; border: 2px solid #ffd36b; border-radius: 6px; background: #1a1a22; opacity: .9; }
  #drv .banner { position: absolute; left: 0; right: 0; top: 16%; text-align: center; font-family: Bungee, "Arial Black", sans-serif; font-size: clamp(28px, 6vw, 64px); color: #ffd36b; text-shadow: 0 4px 0 #000, 0 0 18px #e8a33d; display: none; }
  #drv .banner small { display: block; font-family: Rubik, Arial, sans-serif; font-size: clamp(14px, 2.4vw, 22px); color: #fff; text-shadow: 0 2px 0 #000; margin-top: 6px; }
  #drv .hint { position: absolute; left: 0; right: 0; bottom: 14px; text-align: center; font-size: 14px; color: #ddd; text-shadow: 0 2px 0 #000; }
  #drv .res { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); width: min(460px, 92vw); background: rgba(30,20,12,.95); border: 3px solid #ffd36b; border-radius: 12px; box-shadow: 0 0 24px #e8a33d; padding: 18px 20px; display: none; pointer-events: auto; }
  #drv .res h2 { margin: 0 0 4px; font-family: Bungee, "Arial Black", sans-serif; color: #ffd36b; font-size: 28px; }
  #drv .res table { width: 100%; font-size: 16px; margin: 10px 0; } #drv .res td:last-child { text-align: right; font-family: VT323, monospace; font-size: 22px; }
  #drv .res .tot td { border-top: 1px solid #555; color: #6ed36e; }
  #drv .res button { font-family: Bungee, "Arial Black", sans-serif; font-size: 15px; padding: 9px 14px; margin: 6px 6px 0 0; border: 2px solid #ffd36b; background: #2a1a3a; color: #ffd36b; border-radius: 6px; cursor: pointer; }
  #drv .res button:first-of-type { background: #ffd36b; color: #1a0a10; }
  #drv .hint b { display: inline-block; min-width: 18px; padding: 0 5px; margin: 0 1px; border: 1px solid rgba(255,255,255,.55); border-bottom-width: 3px; border-radius: 5px; background: rgba(0,0,0,.45); font-weight: 700; color: #fff; text-shadow: none; }
  #drv .gear { display: inline-block; margin-left: 8px; padding: 0 7px; border-radius: 5px; font-family: Bungee, "Arial Black", sans-serif; font-size: 13px; line-height: 20px; vertical-align: 3px; background: #2f6a2f; color: #e8ffe0; }
  #drv .gear.r { background: #f2f2f2; color: #1a0a10; } #drv .gear.b { background: #c82a1a; color: #fff; }
  #drv .goal { color: #ffd36b; }
  body.touch #drv .hint, body.pad #drv .hint.k, #drv .hint.p { display: none; } body.pad #drv .hint.p { display: block; }
  #drv .pedals { display: none; } body.touch #drv .pedals { display: block; }
  body.driving #touchUI .tzone, body.driving #touchUI .tb, body.driving #touchUI .tp:not([data-k=pause]) { display: none !important; }
  #drv .pd { position: absolute; pointer-events: auto; touch-action: none; user-select: none; -webkit-user-select: none; display: flex; align-items: center; justify-content: center; flex-direction: column;
    font-family: Bungee, "Arial Black", sans-serif; color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.6); border: 2px solid rgba(255,226,170,.8); box-shadow: 0 6px 14px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.35); }
  #drv .pd small { font-size: 10px; letter-spacing: .5px; opacity: .9; }
  #drv .pd.on { filter: brightness(1.35); transform: scale(.96); }
  #drv #drvSteer { left: max(16px, env(safe-area-inset-left)); bottom: 16px; width: 236px; height: 96px; border-radius: 48px; flex-direction: row; justify-content: space-between; padding: 0 22px; box-sizing: border-box; font-size: 34px;
    background: linear-gradient(180deg, rgba(90,60,36,.75), rgba(40,24,14,.8) 50%, rgba(28,16,8,.85) 51%); }
  #drvSteer i { font-style: normal; opacity: .55; transition: opacity .08s, transform .08s; } #drvSteer i.on { opacity: 1; transform: scale(1.2); color: #ffd36b; }
  #drvSteer .mid { font-size: 10px; opacity: .7; text-align: center; line-height: 1.2; }
  #drv #drvGas { right: max(16px, env(safe-area-inset-right)); bottom: 16px; width: 104px; height: 136px; border-radius: 22px; font-size: 20px; background: linear-gradient(180deg, #8fd36a, #3f8f2a 50%, #2f7a1e 51%, #3a8a26); }
  #drv #drvRev { right: calc(max(16px, env(safe-area-inset-right)) + 116px); bottom: 16px; width: 96px; height: 80px; border-radius: 20px; font-size: 13px; background: linear-gradient(180deg, #ff8a6a, #c8402a 50%, #a83020 51%, #b8382a); }
  #drv #drvHonk { right: calc(max(16px, env(safe-area-inset-right)) + 128px); bottom: 108px; width: 72px; height: 44px; border-radius: 22px; font-size: 11px; background: linear-gradient(180deg, rgba(90,60,36,.8), rgba(40,24,14,.85) 50%, rgba(28,16,8,.9) 51%); }
  @media (max-height: 420px) { #drv #drvGas { height: 116px; width: 96px; } #drv #drvRev { right: calc(max(16px, env(safe-area-inset-right)) + 106px); } #drv #drvHonk { right: calc(max(16px, env(safe-area-inset-right)) + 118px); bottom: 104px; } #drv #drvSteer { height: 84px; width: 210px; } }
  @media (max-height: 500px) { #drv .banner { top: 24%; font-size: 30px; padding: 0 12px; } #drv .banner small { font-size: 14px; } }
  @media (max-width: 700px) { #drv canvas { width: 84px; height: 150px; } #drv .route { font-size: 14px; } #drv .stats { font-size: 18px; } #drv .bar { width: 120px; } }`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'drv';
  hud.innerHTML = `<div class="top"><div class="route" id="drvRoute"></div><div class="stats" id="drvStats"></div><div class="bar"><i id="drvHp"></i></div></div>
    <canvas id="drvMap" width="112" height="196"></canvas><div class="banner" id="drvBanner"></div><div class="hint k" id="drvHint"></div><div class="hint p" id="drvHintP"></div><div class="res" id="drvRes"></div>
    <div class="pedals"><div class="pd" id="drvSteer"><i id="drvL">◀</i><span class="mid">STUUR<br>sleep</span><i id="drvR">▶</i></div>
    <div class="pd" id="drvHonk">TOETER</div><div class="pd" id="drvRev">▼<small>ACHTERUIT</small></div><div class="pd" id="drvGas">▲<br>GAS</div></div>`;
  document.body.appendChild(hud);
  const $ = (id) => document.getElementById(id);
  let bannerT = 0;
  function banner(big, small = '', t = 2.2) { const b = $('drvBanner'); b.innerHTML = big + (small ? `<small>${small}</small>` : ''); b.style.display = 'block'; bannerT = t; }
  // minimap
  const MS = 0.44, MX0 = GX[0] - 14, MZ0 = GZ[9] - 14;
  const mapBase = document.createElement('canvas'); mapBase.width = 112; mapBase.height = 196;
  const mp = (x, z) => [(x - MX0) * MS, (z - MZ0) * MS];
  function drawMinimapBase() {
    const g = mapBase.getContext('2d'); g.fillStyle = '#3a2e2a'; g.fillRect(0, 0, 112, 196);
    for (const b of blocks) { const [x0, z0] = mp(b.x0, b.z0), [x1, z1] = mp(b.x1, b.z1); g.fillStyle = b.kind === 'park' ? '#3a6a2a' : b.kind === 'plaza' ? '#c8a860' : b.kind === 'north' ? '#6a4a3a' : '#5a3a30'; g.fillRect(x0, z0, x1 - x0, z1 - z0); }
    const [, wz0] = mp(0, CANAL.z0), [, wz1] = mp(0, CANAL.z1); g.fillStyle = '#2a6a9a'; g.fillRect(0, wz0, 112, wz1 - wz0);
    g.lineWidth = 3.4; g.strokeStyle = '#8a8a90';
    for (let i = 0; i < GX.length; i++) for (let j = 0; j < GZ.length - 1; j++) { if (j === CANAL.row && !OPEN_BRIDGES.includes(i)) continue; const [x, a] = mp(GX[i], GZ[j]), [, b] = mp(GX[i], GZ[j + 1]); g.strokeStyle = CLOSED.has(`v${i},${j}`) ? '#c83a3a' : '#8a8a90'; g.beginPath(); g.moveTo(x, a); g.lineTo(x, b); g.stroke(); }
    for (let j = 0; j < GZ.length; j++) for (let i = 0; i < GX.length - 1; i++) { const [a, z] = mp(GX[i], GZ[j]), [b] = mp(GX[i + 1], GZ[j]); g.strokeStyle = CLOSED.has(`h${i},${j}`) ? '#c83a3a' : '#8a8a90'; g.beginPath(); g.moveTo(a, z); g.lineTo(b, z); g.stroke(); }
  }
  function drawMinimap() {
    const g = $('drvMap').getContext('2d'); g.drawImage(mapBase, 0, 0);
    if (route.pts.length > 1 && !run.over) { g.strokeStyle = '#ffd36b'; g.lineWidth = 2.2; g.setLineDash([4, 3]); g.lineDashOffset = -performance.now() * 0.02; g.beginPath(); route.pts.forEach(([x, z], k) => { const [px, pz] = mp(x, z); if (k) g.lineTo(px, pz); else g.moveTo(px, pz); }); g.stroke(); g.setLineDash([]); }
    const [tx, tz] = mp(TARGET.x, TARGET.z), pulse = 3 + Math.sin(performance.now() * 0.008) * 1.5;
    g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(tx, tz, pulse + 2, 0, 7); g.fill();
    g.fillStyle = '#ff7a1a'; for (const l of lampas) if (!l.dead) { const [x, z] = mp(l.x, l.z); g.fillRect(x - 2, z - 2, 4, 4); }
    const [vx, vz] = mp(van.x, van.z); g.save(); g.translate(vx, vz); g.rotate(-van.h + Math.PI); g.fillStyle = '#4fa0ff'; g.strokeStyle = '#fff'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(0, -5); g.lineTo(3.5, 4); g.lineTo(-3.5, 4); g.closePath(); g.fill(); g.stroke(); g.restore();
  }

  // ---------------------------------------------------------------- keys (captured before main.js sees them)
  const PASS = new Set(['KeyP', 'Escape', 'KeyN', 'F5', 'F11', 'F12']);
  addEventListener('keydown', (e) => {
    if (!D.active) return;
    if (PASS.has(e.code)) return;
    e.stopImmediatePropagation(); if (e.code === 'Space' || e.code.startsWith('Arrow')) e.preventDefault();
    if (isPaused && isPaused()) return;
    keys[e.code] = true;
    if (e.repeat) return;
    if (run && run.over) { if (['KeyE', 'Space', 'Enter'].includes(e.code)) resBtn(0); else if (e.code === 'Backspace') resBtn(1); return; }
    if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'KeyH') honk();
    if (e.code === 'Backspace') reset();
  }, true);
  addEventListener('keyup', (e) => { if (!D.active) return; keys[e.code] = false; if (!PASS.has(e.code)) e.stopImmediatePropagation(); }, true);

  // ---- touch pedals: GAS, ACHTERUIT (brakes first, then backs up), a steering bar you can slide your thumb along, TOETER
  const tp = { gas: 0, rev: 0, steer: 0 };
  function pedal(id, on, off) {
    const el = $(id), ptrs = new Set();
    const up = (e) => { if (!ptrs.delete(e.pointerId)) return; if (!ptrs.size) { el.classList.remove('on'); off && off(); } };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); ptrs.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } el.classList.add('on'); on(e); });
    el.addEventListener('pointermove', (e) => { if (ptrs.has(e.pointerId) && el._move) el._move(e); });
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false }); el.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  pedal('drvGas', () => { tp.gas = 1; }, () => { tp.gas = 0; });
  pedal('drvRev', () => { tp.rev = 1; }, () => { tp.rev = 0; });
  pedal('drvHonk', () => { if (run && run.over) return; honk(); });
  const steerAt = (e) => { const r = $('drvSteer').getBoundingClientRect(), k = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.3); tp.steer = -Math.max(-1, Math.min(1, Math.abs(k) < 0.12 ? 0 : k)); };
  pedal('drvSteer', steerAt, () => { tp.steer = 0; }); $('drvSteer')._move = steerAt;
  function padInput() { // a controller: RT gas, LT brake / reverse, left stick steers (A honks via input.js → E)
    let gps = []; try { gps = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return null; }
    for (const g of gps) {
      if (!g || !g.connected) continue;
      const v = (i) => { const b = g.buttons[i]; return b ? Math.max(b.value || 0, b.pressed ? 1 : 0) : 0; }, ax = g.axes[0] || 0;
      return { thr: v(7) - v(6), st: Math.abs(ax) > 0.15 ? -ax : 0 };
    }
    return null;
  }

  // ---------------------------------------------------------------- flow
  let opts = null, resActions = [];
  // ---------------------------------------------------------------- Johan (js/johan.js): his red Miata overtakes on a straight road, cuts in and brakes
  let miata = null, miataG = null;
  function johanStart() {
    const sp = van.vx * Math.sin(van.h) + van.vz * Math.cos(van.h);
    if (sp < 8 || run.over || van.freeze > 0) return;
    const sx = Math.sin(van.h), cz = Math.cos(van.h); let axis = null, road = 0;
    if (Math.abs(sx) > 0.94) { const j = GZ.reduce((b, z) => (Math.abs(z - van.z) < Math.abs(b - van.z) ? z : b), GZ[0]); if (Math.abs(van.z - j) < RH - 0.5) { axis = 'x'; road = j; } }
    else if (Math.abs(cz) > 0.94) { const i = GX.reduce((b, x) => (Math.abs(x - van.x) < Math.abs(b - van.x) ? x : b), GX[0]); if (Math.abs(van.x - i) < RH - 0.5) { axis = 'z'; road = i; } }
    if (!axis) return;
    const dir = axis === 'x' ? Math.sign(sx) : Math.sign(cz), lat0 = axis === 'x' ? van.z : van.x, pass = 2 * road - lat0 + (lat0 === road ? 2.6 : 0); // the other lane: he overtakes
    const along0 = (axis === 'x' ? van.x : van.z) - dir * 14;
    if (!miataG) { miataG = makeMiata(THREE, { driver: true }); miataG.scale.setScalar(1.05); scene.add(miataG); }
    miataG.visible = true;
    miata = { g: miataG, axis, dir, road, along: along0, lat: pass, latTo: lat0, sp: sp + 11, phase: 'pass', t: 0 };
    say('VROEEEM!', ...xyOf(miata), '#ffd36b'); beep(140, 0.5, 'sawtooth', 0.05);
  }
  const xyOf = (m) => (m.axis === 'x' ? [m.along, m.lat] : [m.lat, m.along]);
  function updateMiata(dt) {
    const m = miata; if (!m) return; m.t += dt;
    const vAlong = m.axis === 'x' ? van.x : van.z, ahead = (m.along - vAlong) * m.dir;
    if (m.phase === 'pass') { if (ahead > 7) { m.phase = 'cut'; m.t = 0; beep(700, 0.1, 'square', 0.03); } }
    else if (m.phase === 'cut') { m.lat += (m.latTo - m.lat) * Math.min(1, dt * 4); if (m.t > 0.5) { m.phase = 'brake'; m.t = 0; say('EDDY! STOP!', ...xyOf(m)); } }
    else if (m.phase === 'brake') {
      m.lat += (m.latTo - m.lat) * Math.min(1, dt * 4); m.sp = Math.max(0, m.sp - 18 * dt);
      van.freeze = Math.max(van.freeze, 0.3); van.vx *= Math.exp(-dt * 2.6); van.vz *= Math.exp(-dt * 2.6); // Eddy stands on the brake
      const vsp = Math.hypot(van.vx, van.vz), want = vAlong + m.dir * 6.5; // he stays just in front of the van, braking with it
      m.sp = Math.max(0, vsp + (6.5 - ahead) * 2.5); m.along += m.dir * m.sp * dt;
      if (vsp < 0.8) { m.phase = 'talk'; m.sp = 0; van.vx = van.vz = 0; m.along = want; const cue = opts.johan; opts.johan = null; if (cue && cue.onMeet) cue.onMeet(() => { m.phase = 'go'; m.t = 0; say('CIAO, BRO!', ...xyOf(m), '#ffd36b'); beep(140, 0.6, 'sawtooth', 0.05); }); else { m.phase = 'go'; m.t = 0; } }
    } else if (m.phase === 'talk') { van.freeze = Math.max(van.freeze, 0.3); van.vx = van.vz = 0; }
    else if (m.phase === 'go') { m.sp = Math.min(34, m.sp + 16 * dt); if (m.t > 4) { m.g.visible = false; miata = null; return; } }
    if (m.phase !== 'brake') m.along += m.dir * m.sp * dt;
    const [x, z] = xyOf(m); m.g.position.set(x, 0, z); m.g.rotation.y = m.axis === 'x' ? (m.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (m.dir > 0 ? 0 : Math.PI);
  }
  const ev = (type, data) => { if (opts && opts.onEvent) try { opts.onEvent(type, data); } catch (e) { console.error(e); } }; // a passenger (Freddy Sr., js/freddy.js) comments on the drive
  function resBtn(k) { const f = resActions[k]; if (f) f(); }
  function showRes(title, sub, rows, buttons) {
    const r = $('drvRes');
    r.innerHTML = `<h2>${title}</h2><div>${sub}</div><table>${rows.map(([a, b, cls]) => `<tr class="${cls || ''}"><td>${a}</td><td>${b}</td></tr>`).join('')}</table>${buttons.map(([t], k) => `<button data-k="${k}">${t}</button>`).join('')}`;
    resActions = buttons.map(([, f]) => f);
    r.querySelectorAll('button').forEach((b) => { b.onclick = () => resBtn(+b.dataset.k); });
    r.style.display = 'block';
  }
  function reset() {
    if (!built) build();
    if (!van.g) { van.g = makeVan(); scene.add(van.g); }
    if (opts && opts.van && opts.van.livery) { setLivery(van.g, opts.van.livery, canvasTex); if (homeSign) { homeSign.material.map = signFace(canvasTex, opts.van.livery, 512, 144); homeSign.material.needsUpdate = true; } } // Eddy & Zn or Eddy's, van and home sign
    if (opts && opts.van && opts.van.paint !== undefined) van.g.traverse((c) => { if (c.userData && c.userData.paint) c.userData.paint.color.setHex(opts.van.paint); }); // the van you own (Garage Mo)
    Object.assign(van, { x: START.x, z: START.z, h: START.h, vx: 0, vz: 0, hp: 100, freeze: 1.2, honkT: 0, safeT: 0 });
    van.safe = { x: START.x, z: START.z, h: START.h };
    run = { t: 0, bumped: 0, smart: 0, wrecked: 0, dents: 0, honks: 0, plunges: 0, ambush: 0, over: false };
    if (miata) miata.g.visible = false; miata = null; // js/johan.js: Johan's Miata, set up again per drive
    for (const l of lampas) { scene.remove(l.g); for (const s of l.smoke) scene.remove(s.m); } lampas.length = 0;
    if (!cars.length) for (let k = 0; k < 34; k++) { const c = { g: makeCar(CAR_COLS[k % CAR_COLS.length]) }; scene.add(c.g); cars.push(c); }
    for (const c of cars) respawnCar(c);
    if (!peds.length) for (const b of blocks) {
      const n = b.kind === 'plaza' ? 6 : b.kind === 'park' ? 3 : 2 + ((Math.random() * 2) | 0);
      for (let k = 0; k < n; k++) { const p = { g: makePed(), loop: perim(b), dir: Math.random() < 0.5 ? 1 : -1, sp: 1.1 + Math.random() * 0.8, off: 0, flee: 0, hop: 0, walk: 0, down: 0 }; p.s = Math.random() * p.loop.L; scene.add(p.g); peds.push(p); }
    }
    for (const p of peds) { p.down = 0; p.flee = 0; p.g.rotation.x = 0; p.g.position.y = 0; }
    $('drvRes').style.display = 'none';
    const how = document.body.classList.contains('touch') ? '<b>GAS</b> drives, <b>ACHTERUIT</b> brakes and backs up, slide on the bar to steer.'
      : document.body.classList.contains('pad') ? '<b>RT</b> gas, <b>LT</b> brake and reverse, stick steers.' : '<b>W</b> gas, <b>S</b> brake and reverse, <b>A D</b> steer.';
    banner(`${opts.from} → ${opts.to}`, `Follow the yellow arrows to ${opts.target ? opts.to : 'the Frietwijk plaza'} and park in the ring.<br>${how}`, 3.2);
    tp.gas = tp.rev = tp.steer = 0; route.t = 0; routeCalc();
    camera.position.set(van.x, 60, van.z); shake = 0;
  }
  function payFor() { if (opts && opts.noPay) return -run.smart; return Math.max(0, BASE_PAY + run.wrecked * LAMPAS_BOUNTY + Math.max(0, Math.round((PAR - run.t) * 3)) - run.smart); }
  function arrive() {
    run.over = true; const pay = payFor();
    beep(523, 0.15, 'triangle', 0.06); setTimeout(() => beep(659, 0.15, 'triangle', 0.06), 130); setTimeout(() => beep(784, 0.3, 'triangle', 0.06), 260);
    const tm = fmt(run.t);
    ev('arrive', { t: run.t, par: PAR, bumped: run.bumped, dents: Math.round(100 - van.hp) });
    if (opts.noPay) return showRes('AANGEKOMEN!', `${opts.to}. ${opts.arrived || ''}`, [ // a pick-up, not a delivery: nobody pays you to fetch your father
      ['Time', `${tm} (par ${fmt(PAR)})`], ['Smartengeld', `${run.bumped} × −W ${SMART}`], ['Dents in the Oofmobiel', `${Math.round(100 - van.hp)}%`], ['Honks', `${run.honks}`],
    ], [[(opts.doneLabel || 'Drive home') + ' · [E]', () => finish({ arrived: true, pay, time: run.t, wrecked: run.wrecked, bumped: run.bumped })], ['Drive again · [⌫]', reset]]);
    showRes('AANGEKOMEN!', opts.mission ? `${opts.to}. ${opts.mission}` : `${opts.to}. Lampas heartland, scouted.`, [
      ['Time', `${tm} (par ${fmt(PAR)})`], ['Delivery fee', `W ${BASE_PAY}`], ['On-time bonus', `W ${Math.max(0, Math.round((PAR - run.t) * 3))}`],
      ['Lampas cars wrecked', `${run.wrecked} × W ${LAMPAS_BOUNTY}`], ['Smartengeld', `${run.bumped} × −W ${SMART}`], ['Dents in the Oofmobiel', `${Math.round(100 - van.hp)}%`], ['Honks', `${run.honks}`],
      ['Total', `W ${pay}`, 'tot'],
    ], [[opts.mission ? 'Raid the joint · [E]' : 'Drive home · [E]', () => finish({ arrived: true, pay, time: run.t, wrecked: run.wrecked, bumped: run.bumped })], ['Drive again · [⌫]', reset]]);
  }
  function fail(title, sub) {
    run.over = true; ev('fail', { title }); beep(160, 0.3, 'sawtooth', 0.06); setTimeout(() => beep(110, 0.5, 'sawtooth', 0.06), 250);
    showRes(title, sub, [['Time', fmt(run.t)], ['Lampas cars wrecked', `${run.wrecked}`], ['Pedestrians bumped', `${run.bumped}`]],
      [['Try again · [E]', reset], ['Back to the warehouse · [⌫]', () => finish({ arrived: false, pay: 0 })]]);
  }
  function finish(res) { stop(); if (opts && opts.onDone) opts.onDone(res); }
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  function start(o) {
    opts = { from: 'Kipkruidenkwartier', to: 'Oud-Vettenburg', ...o };
    Object.assign(TARGET, opts.target ? { x: GX[opts.target[0]], z: GZ[opts.target[1]] } : PLAZA_XZ);
    if (built) { targetRing.position.set(TARGET.x, 0.2, TARGET.z); parkLabel.position.set(TARGET.x, 0.21, TARGET.z); plazaGlow.position.set(TARGET.x, 6, TARGET.z); }
    D.active = true; document.body.classList.add('driving'); hud.style.display = 'block';
    $('drvRoute').textContent = `${opts.from} → ${opts.to}`;
    $('drvHint').innerHTML = '<b>W</b> gas · <b>S</b> brake / reverse · <b>A</b> <b>D</b> steer · <b>Shift</b> handbrake · <b>Space</b> honk · <b>⌫</b> restart';
    $('drvHintP').innerHTML = '<b>RT</b> gas · <b>LT</b> brake / reverse · stick steers · <b>LB</b> handbrake · <b>A</b> honk';
    route.dist = null;
    for (const k in keys) keys[k] = false;
    reset(); applyTheme(opts.theme);
    if (airport) { airport.visible = !!opts.airport; if (THEMES.lampas.sign) THEMES.lampas.sign.visible = THEMES.lampas.sign.visible && !opts.airport; }
    ev('start', { to: opts.to });
  }
  function stop() { D.active = false; document.body.classList.remove('driving'); hud.style.display = 'none'; $('drvRes').style.display = 'none'; $('drvBanner').style.display = 'none'; }

  // ---------------------------------------------------------------- update
  function update(dt) {
    if (!D.active) return;
    if (!run.over) run.t += dt;
    van.honkT -= dt;
    // input, like a car: gas pushes the van forward, brake slows it and then backs it up, steering turns the van's own nose
    // (keyboard W/S A/D, touch GAS/ACHTERUIT pedals + steering bar, controller RT/LT + stick)
    let thr = 0, st = 0;
    if (!run.over && van.freeze <= 0) {
      if (keys.KeyW || keys.ArrowUp) thr += 1;
      if (keys.KeyS || keys.ArrowDown) thr -= 1;
      if (keys.KeyA || keys.ArrowLeft) st += 1;
      if (keys.KeyD || keys.ArrowRight) st -= 1;
      thr += tp.gas - tp.rev; st += tp.steer;
      const pad = padInput(); if (pad) { thr += pad.thr; st += pad.st; }
      thr = Math.max(-1, Math.min(1, thr)); st = Math.max(-1, Math.min(1, st));
    }
    van.freeze -= dt;
    const grip = keys.ShiftLeft || keys.ShiftRight ? 1.4 : 7 * (opts.grip || 1); // rain, frost and snow make the road slippery (js/kaasweer.js)
    const sp = drivePhysics(van, thr, st, dt, (opts.van && opts.van.maxV) || MAXV, grip); // Garage Mo: van tier + chip tuning
    const hit = bodyCollide(van, 1.7);
    if (hit && hit.imp > 6 && !run.over) { if (hit.imp > 14) ev('crash'); damage((hit.imp - 6) * 1.6); shake = Math.max(shake, Math.min(0.7, hit.imp / 25)); beep(70, 0.16, 'sawtooth', 0.06); run.dents++; }
    vanVsMovers();
    // into the canal? Splash, back to the last safe spot
    if (!run.over && isWater(van.x, van.z)) {
      run.plunges++; ev('canal'); banner('PLONS!', 'The Oofmobiel can\'t swim. A tow truck fishes you out.', 2); beep(200, 0.4, 'sine', 0.07);
      Object.assign(van, { x: van.safe.x, z: van.safe.z, h: van.safe.h, vx: 0, vz: 0, freeze: 1 }); damage(20);
    }
    van.safeT -= dt;
    if (van.safeT <= 0 && Math.abs(sp) > 1 && !run.over) { // remember a dry spot (not next to the water)
      van.safeT = 0.8; if (van.z > CANAL.z1 + 6 || van.z < CANAL.z0 - 6) van.safe = { x: van.x, z: van.z, h: van.h };
    }
    van.g.position.set(van.x, 0, van.z); van.g.rotation.y = van.h;
    const braking = thr < -0.1 && sp > 0.5, backing = sp < -0.4;
    van.g.userData.brakeM.opacity += (((braking || backing || (thr === 0 && Math.abs(sp) < 0.5)) ? (braking ? 0.75 : 0.22) : 0.08) - van.g.userData.brakeM.opacity) * Math.min(1, dt * 12);
    van.g.userData.revM.opacity += ((backing ? 0.28 : 0) - van.g.userData.revM.opacity) * Math.min(1, dt * 10);
    if (backing && !run.over) { van.beepT = (van.beepT || 0) - dt; if (van.beepT <= 0) { van.beepT = 0.7; beep(1050, 0.12, 'square', 0.025); } } else van.beepT = 0; // the reversing beeper
    van.g.rotation.z = Math.max(-0.08, Math.min(0.08, st * Math.abs(sp) * 0.004)); // body roll in corners
    // ambush when you cross into Lampas turf
    if (!run.over && van.z < CANAL.z0 - 10 && run.ambush === 0 && opts.van && opts.van.tint) run.ambush = 1; // tinted windows: they don't spot you at the canal
    if (!run.over && van.z < CANAL.z0 - 10 && run.ambush === 0) {
      run.ambush = 1; ev('ambush'); banner('HINDERLAAG!', `The ${({ nosh: 'Noshgey Kariot', docks: 'Abdavissies', sand: 'Paravim' })[opts.theme] || 'Lampas'} want their street back. Ram them into a wall.`, 2.6);
      for (const [dx, dz] of [[-30, -46], [26, -52], [0, -80]]) spawnLampas(Math.max(GX[0], Math.min(GX[5], Math.round((van.x + dx) / 44) * 44)) + 2.2, Math.max(GZ[9] + 2, van.z + dz));
    }
    if (!run.over && van.z < GZ[7] && run.ambush === 1) { run.ambush = 2; spawnLampas(GX[5] + 2.2, GZ[9] + 2); spawnLampas(GX[3] - 2.2, GZ[9] + 2); }
    if (opts.johan && !miata && run.t > 5 && van.z > CANAL.z1 + 8) johanStart(); // Johan only shows up on the home side of the canal
    updateMiata(dt);
    for (const c of cars) updateCar(c, dt);
    updateAirport(dt);
    for (const l of lampas) updateLampas(l, dt);
    for (const p of peds) updatePed(p, dt);
    for (const b of bubbles) if (b.t > 0) { b.t -= dt; b.s.position.y += dt * 2; b.s.userData.life = b.t; if (b.t <= 0) b.s.visible = false; }
    if (honkRing.visible) { const t = (honkRing.userData.t += dt); honkRing.scale.setScalar(1 + t * 28); honkRing.material.opacity = 0.6 * (1 - t / 0.5); honkRing.position.set(van.x, 0.3, van.z); if (t > 0.5) honkRing.visible = false; }
    // arrival
    const dT = Math.hypot(van.x - TARGET.x, van.z - TARGET.z);
    targetRing.scale.setScalar(1 + Math.sin(performance.now() * 0.006) * 0.06);
    if (!run.over && dT < TARGET.r && Math.abs(sp) < 6) arrive();
    else if (!run.over && dT < TARGET.r) banner('REM AF!', 'Slow down to park.', 0.3);
    // route + guide arrow: the arrow points along the streets (the next turn), not through the houses
    route.t -= dt; if (route.t <= 0 && !run.over) { route.t = 0.25; routeCalc(); }
    drawRoute(dT > 10 && !run.over);
    arrow.visible = dT > 24 && !run.over && !(miata && miata.phase !== 'pass' && miata.phase !== 'go'); // Johan's Miata in front: no arrow over it
    const [ax, az] = routeAt(Math.min(route.len, 16)), ah = Math.atan2(ax - van.x, az - van.z);
    arrow.position.set(van.x + Math.sin(ah) * 7.5, 3.2, van.z + Math.cos(ah) * 7.5); arrow.rotation.y = ah + Math.PI;
    // camera: straight down, higher when fast, leads where you're going
    const spd = Math.hypot(van.vx, van.vz), H = 44 + spd * 0.9;
    const cx = van.x + van.vx * 0.45, cz = van.z + van.vz * 0.45;
    camera.position.x += (cx - camera.position.x) * Math.min(1, dt * 4); camera.position.z += (cz - camera.position.z) * Math.min(1, dt * 4);
    camera.position.y += (H - camera.position.y) * Math.min(1, dt * 2);
    shake = Math.max(0, shake - dt * 1.8);
    const sx = (Math.random() - 0.5) * shake * 2, sz = (Math.random() - 0.5) * shake * 2;
    camera.position.x += sx; camera.position.z += sz;
    camera.lookAt(camera.position.x, 0, camera.position.z - 0.001);
    sun.position.set(camera.position.x - 30, 60, camera.position.z + 20); sun.target.position.set(camera.position.x, 0, camera.position.z);
    if (D._water) D._water.material.map.offset.x = (performance.now() * 0.00002) % 1; // the canal drifts
    // HUD
    const gear = sp < -0.4 ? '<span class="gear r">R</span>' : thr < -0.1 && sp > 0.5 ? '<span class="gear b">REM</span>' : '<span class="gear">D</span>';
    $('drvStats').innerHTML = `${fmt(run.t)} · ${Math.round(spd * 3.6)} KM/U${gear} · <span class="goal">${run.over ? 'GEPARKEERD' : `DOEL ${Math.round(route.len)} M`}</span><br>SMARTENGELD W ${run.smart} · ${({ nosh: 'NOSHGEY', docks: 'ABDAVISSIES', sand: 'PARAVIM' })[opts.theme] || 'LAMPAS'} ${run.wrecked}`;
    $('drvL').classList.toggle('on', tp.steer > 0.1); $('drvR').classList.toggle('on', tp.steer < -0.1);
    const hp = $('drvHp'); hp.style.width = van.hp + '%'; hp.style.background = van.hp > 60 ? '#6ed36e' : van.hp > 30 ? '#ffd36b' : '#ff4a4a';
    if (bannerT > 0) { bannerT -= dt; if (bannerT <= 0) $('drvBanner').style.display = 'none'; }
    drawMinimap();
  }

  Object.assign(D, { start, stop, update, honk, reset, van, cars, peds, lampas, TARGET });
  Object.defineProperty(D, 'run', { get: () => run });
  Object.defineProperty(D, 'miata', { get: () => miata });
  return D;
}
