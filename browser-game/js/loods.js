// De Loods: Eddy's warehouse grows in three stages, after the Drive concept art (02_Warehouse): Stage 01 is Dad's shed on the street,
// Stage 02 a steel portal hall knocked through the back wall, Stage 03 a big tent hall (De Overkapping) for a real trader.
// Every upgrade costs Wilders and takes market days to build (one builder crew at a time: Bouwbedrijf Gerrit & Zonen).
// Racking adds stock space and shows the stock as pallets. The heftruck racks bulk pallet deals that the truck drops at the hall's dock.
// The Mengkamer gets machines: a drum mixer, a stone spice mill and an industrial ribbon blender.
// Everything lives in state.loods {built, racks, job, dock, deals}; economy.js reads boost() for capacity, mixing and the Groothandel.

const C = { blue: 0x2a5aa8, orange: 0xe8742a, pallet: 0xc49a62, slat: 0x8a6438, steel: 0x3a3e44, cream: 0xf2ead8, saffron: 0xf2b21a, paprika: 0xc2412d, cumin: 0x7a4a22, cardamom: 0x8aa04a, turmeric: 0xe2a21a };
const ING_COL = { paprika: 0xc2412d, komijn: 0x8a5a2a, knoflook: 0xe8e0c8, koriander: 0x9aa04a, kurkuma: 0xe2a21a, kaneel: 0xa0562a, kardemom: 0x7a9a4a, saffraan: 0xe86a1a };
const PALLET_KG = 50, RACK_KG = 120;
const HX = 0, HZ = -28.4; // the hall stands on the plot behind the shed (Tristan 2026-11-15), reached through a doorway in the shed's back wall
const DX = -4.6; // x of the doorway / corridor between the shed and the hall
const PLOT = { x0: -33.5, x1: 11.5, z0: -37.4, z1: -21.2 }; // the bouwkavel: for sale at the start
const HALL = { x0: -11, x1: 11, z0: -7, z1: 7, h: 4.8 }, TENT = { x0: -33, x1: -11, z0: -8.7, z1: 7 };
// rack bays: shed (1), hall (6, along the north wall), tent (6, along its north wall). [x, z, rotY] of the bay centre, world coords
const BAYS = [[-10.3, -15.05, Math.PI / 2],
  ...[0, 1, 2, 3, 4, 5].map((i) => [HX + HALL.x0 + 1.0 + 1.35 + i * 2.75, HZ + HALL.z0 + 0.65, 0]),
  ...[0, 1, 2, 3, 4, 5].map((i) => [HX + TENT.x0 + 1.5 + 1.35 + i * 2.75, HZ + TENT.z0 + 0.65, 0])];
const STAGE_BAYS = [1, 7, 13]; // bays open in the shed / with the hall / with the tent
const LEVELS = [0.12, 1.5, 2.9]; // beam heights (pallet bottom)

export const UPGRADES = [
  { id: 'rek', name: 'Palletstelling', what: `One bay of pallet racking: blue uprights, orange beams, 6 pallet places. ${RACK_KG} kg of vaten and bags.`, days: 1, rank: 0, repeat: true },
  { id: 'menger1', name: 'Mengmachine', what: 'The oak mengkuip makes way for a big electric drum mixer: the Naknikim tip their vaten in and it does the stirring. 15 kg per Naknik a market day instead of 10.', cost: 1500, days: 2, rank: 1, need: ['junk'] },
  { id: 'inpak', name: 'Inpakmachine', what: 'An automatic bagging line instead of the packing table: it fills, seals and labels the blue bags and rolls them out on a belt. Nobody stands scooping any more: +5 kg per Naknik a market day.', cost: 3000, days: 2, rank: 1, need: ['menger1'] },
  { id: 'roldeur', name: 'Stalen roldeur + camera', what: 'A steel roller door and a camera over the entrance. A raid on the warehouse steals half as much.', cost: 1800, days: 1, rank: 1, need: ['junk'] },
  { id: 'kavel', name: 'Bouwkavel', what: 'The empty plot behind the shed, TE KOOP for years. Buy it and the warehouse can grow onto it: De Hal first, De Overkapping later.', cost: 2500, days: 1, rank: 1, need: ['junk'] },
  { id: 'hal', name: 'De Hal', what: 'A steel portal hall on the plot, through a new doorway in the shed\'s back wall: room for 6 racking bays, a dock door and a second mixing table. 5 pallet places on the floor (+100 kg).', cost: 6000, days: 3, rank: 1, need: ['kavel', 'rek', 'menger1'], stage: 2 },
  { id: 'heftruck', name: 'Heftruck', what: 'A second-hand forklift for the hall. Buy bulk pallet deals (30% under the Kruidenbeurs) and rack them yourself.', cost: 2500, days: 1, rank: 1, need: ['hal'] },
  { id: 'tafel2', name: 'Tweede mengtafel', what: 'A second mixing table in the hall: room for 2 more Naknikim at home.', cost: 2500, days: 2, rank: 1, need: ['hal'] },
  { id: 'molen', name: 'Kruidenmolen', what: 'A stone spice mill: the Naknikim grind everything fresh. Blends come out half a star better.', cost: 3500, days: 2, rank: 2, need: ['menger1'] },
  { id: 'menger2', name: 'Industriële menger', what: 'A stainless ribbon blender replaces the drum mixer: 20 kg per Naknik a day, and half the mistakes.', cost: 5000, days: 3, rank: 2, need: ['menger1', 'hal'] },
  { id: 'menger3', name: 'De Reuzenmenger', what: 'A two-thousand-litre paddle mixer with a loading platform, second-hand from a stroopwafel factory. 30 kg per Naknik a day.', cost: 9000, days: 3, rank: 3, need: ['menger2'] },
  { id: 'dock', name: 'Laadperron', what: 'A proper loading dock with a leveller and dock lights: the Groothandel buys 40 kg more a day, and three pallet deals a day instead of two.', cost: 4000, days: 2, rank: 2, need: ['heftruck'] },
  { id: 'tent', name: 'De Overkapping', what: 'A huge tent hall on the west side of the hall: 6 more racking bays, a third mixing table (2 more Naknikim), 10 more pallet places on the floor (+200 kg). Eddy\'s is a real groothandel now.', cost: 15000, days: 4, rank: 3, need: ['hal', 'dock'], stage: 3 },
];
const NEED_TEXT = { kavel: 'buy the Bouwkavel first', junk: "sell all of Dad's junk first", rek: 'needs a Palletstelling', menger1: 'needs the Mengmachine', menger2: 'needs the Industriële menger', hal: 'needs De Hal', heftruck: 'needs the Heftruck', dock: 'needs the Laadperron' };
const RANK_NAMES = ['Hulpje', 'Mengmeester', 'Kruidenhandelaar', 'Kruidenbaron', 'Spice Master'];

// deps: THREE, scene, box, cyl, lam, canvasTex, signTex, solid, collide, addInteract, player, state, econ, rank(), addMoney, toast, beep, save,
// keys, virt, setBounds(b), snapCam(), junkDone(), hideShelf(on), shutter (mesh), naknikSpots(), glyph
export function createLoods(deps) {
  const { THREE, scene, box, cyl, lam, canvasTex, signTex, solid, player, state, econ, keys, virt } = deps;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  const M = {}; const mt = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return M[k] || (M[k] = lam({ color: c, ...(o || {}) })); };
  const G = {}; const geo = (k, f) => G[k] || (G[k] = f());
  const day = () => econ.ensure().day;

  function ensure() {
    const L = state.loods && typeof state.loods === 'object' ? state.loods : (state.loods = {});
    L.built = L.built || {}; L.racks = +L.racks || 0; L.job = L.job || null; L.dock = Array.isArray(L.dock) ? L.dock : [];
    return L;
  }
  const has = (id) => !!ensure().built[id] || (id === 'kavel' && !!ensure().built.hal); // halls built before the plot existed own it
  const stage = () => (has('tent') ? 3 : has('hal') ? 2 : 1);
  const bayLimit = () => STAGE_BAYS[stage() - 1];
  const rackCost = () => 600 + 350 * ensure().racks;
  const naknikCap = () => 3 + (has('tafel2') ? 2 : 0) + (has('tent') ? 2 : 0);
  function boost() {
    return { cap: (has('hal') ? 100 : 0) + (has('tent') ? 200 : 0) + ensure().racks * RACK_KG, mix: (has('menger3') ? 3 : has('menger2') ? 2 : has('menger1') ? 1.5 : 1) + (has('inpak') ? 0.5 : 0), care: has('menger2') ? 0.5 : 1, q: has('molen') ? 0.5 : 0, sell: has('dock') ? 40 : 0, keep: has('roldeur') ? 0.5 : 1 };
  }

  // ================================================================== shared props
  const palletGeo = geo('pal', () => new THREE.BoxGeometry(1.2, 0.05, 1.0));
  function pallet(load, parent) { // a wooden pallet with a stretch-wrapped load of spice sacks
    const g = new THREE.Group(); parent.add(g);
    const top = new THREE.Mesh(palletGeo, mt(C.pallet)); top.position.y = 0.12; g.add(top);
    for (const x of [-0.5, 0, 0.5]) { const b = new THREE.Mesh(geo('blk', () => new THREE.BoxGeometry(0.12, 0.09, 1.0)), mt(C.slat)); b.position.set(x, 0.05, 0); g.add(b); }
    const ld = new THREE.Mesh(geo('load', () => new THREE.BoxGeometry(1.1, 0.95, 0.92)), mt(load));
    ld.position.y = 0.62; ld.castShadow = true; g.add(ld);
    const wrap = new THREE.Mesh(geo('wrap', () => new THREE.BoxGeometry(1.13, 0.6, 0.95)), wrapMat); wrap.position.y = 0.55; g.add(wrap);
    g.userData.load = ld;
    return g;
  }
  const wrapMat = new THREE.MeshPhongMaterial({ color: 0xe8f0f4, transparent: true, opacity: 0.32, shininess: 120, depthWrite: false });
  // one bay of racking (local: along x, front +z), like Tristan's reference photo
  function bay(x, z, ry) {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.visible = false; scene.add(g);
    const up = geo('up', () => new THREE.BoxGeometry(0.09, 4.1, 0.09)), beam = geo('beam', () => new THREE.BoxGeometry(2.7, 0.12, 0.06)), brace = geo('brace', () => new THREE.BoxGeometry(0.03, 1.5, 0.03));
    for (const sx of [-1.35, 1.35]) for (const sz of [-0.5, 0.5]) { const u = new THREE.Mesh(up, mt(C.blue)); u.position.set(sx, 2.05, sz); u.castShadow = true; g.add(u); }
    for (const sx of [-1.35, 1.35]) for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(brace, mt(C.blue)); b.position.set(sx, 0.8 + k * 1.3, 0); b.rotation.x = k % 2 ? 0.75 : -0.75; g.add(b); }
    for (const y of LEVELS.slice(1).concat([4.0])) for (const sz of [-0.5, 0.5]) { const b = new THREE.Mesh(beam, mt(C.orange)); b.position.set(0, y, sz); g.add(b); }
    for (const sz of [-0.5, 0.5]) { const b = new THREE.Mesh(beam, mt(C.orange)); b.position.set(0, 0.1, sz); b.scale.y = 0.6; g.add(b); }
    const slots = [];
    for (const y of LEVELS) for (const sx of [-0.66, 0.66]) { const p = pallet(C.paprika, g); p.position.set(sx, y - 0.02, 0); p.visible = false; slots.push(p); }
    // footprint (world AABB)
    const along = Math.abs(Math.sin(ry)) > 0.5, hw = along ? 0.6 : 1.42, hd = along ? 1.42 : 0.6;
    const sol = solid(x - hw, x + hw, z - hd, z + hd); sol.off = true;
    const front = new THREE.Vector3(x + Math.sin(ry) * 0.6, 0, z + Math.cos(ry) * 0.6), dir = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
    return { g, slots, sol, front, dir, ry };
  }
  const bays = BAYS.map(([x, z, ry]) => bay(x, z, ry));

  // ================================================================== Stage 02: De Hal (and Stage 03: De Overkapping), off-map
  const hall = new THREE.Group(); hall.position.set(HX, 0, HZ); hall.visible = false; scene.add(hall);
  const tent = new THREE.Group(); tent.position.set(HX, 0, HZ); tent.visible = false; scene.add(tent);
  const concrete = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#8f8e8a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 900; i++) { const v = 120 + Math.random() * 40; g.fillStyle = `rgba(${v},${v},${v - 4},0.25)`; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 6, 1 + Math.random() * 3); } });
  concrete.wrapS = concrete.wrapT = THREE.RepeatWrapping;
  const ribTex = (base, rib) => { const t = canvasTex(128, 32, (g, w, h) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.fillStyle = rib; for (let x = 0; x < w; x += 8) g.fillRect(x, 0, 3, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  {
    const W = HALL.x1 - HALL.x0, D = HALL.z1 - HALL.z0, H = HALL.h;
    const ft = concrete.clone(); ft.needsUpdate = true; ft.repeat.set(W / 4, D / 4);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lam({ map: ft, color: 0xd0d6dc })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; hall.add(fl);
    // painted floor lines (aisles and pallet spots), like the Stage 02 art
    for (const z of [-4.6, 1.4]) box(W - 1.2, 0.01, 0.12, mt(0xf2f0e8), 0, 0.015, z, hall, false);
    for (const z of [3.6, 2.0, 0.4]) { box(1.5, 0.01, 0.08, mt(C.saffron), 8.9, 0.016, z + 0.62, hall, false); box(1.5, 0.01, 0.08, mt(C.saffron), 8.9, 0.016, z - 0.62, hall, false); }
    // walls: blue-grey ribbed steel below, lighter cladding above, steel portal columns
    const lowT = ribTex('#5a7088', '#4a5e74'), hiT = ribTex('#a8acb0', '#989ca2');
    const wall = (len, x, z, ry, parent = hall) => {
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
      const lt = lowT.clone(); lt.needsUpdate = true; lt.repeat.set(len / 2, 1); const ht = hiT.clone(); ht.needsUpdate = true; ht.repeat.set(len / 2, 1);
      box(len, 2.4, 0.15, lam({ map: lt }), 0, 1.2, 0, g); box(len, H - 2.4, 0.15, lam({ map: ht }), 0, 2.4 + (H - 2.4) / 2, 0, g);
      for (let k = 0; k <= Math.round(len / 4.4); k++) box(0.3, H, 0.3, mt(C.steel), -len / 2 + k * (len / Math.round(len / 4.4)), H / 2, 0.15, g);
      return g;
    };
    wall(W, 0, HALL.z0, 0); // north
    hall.userData.west = wall(D, HALL.x0, 0, Math.PI / 2); // west (opens up when the tent is built)
    // west wall dressing from the art: OSB panels below, plasterboard above
    { const g = hall.userData.west; box(D - 0.4, 2.2, 0.04, mt(0xb89a6a), 0, 1.1, -0.12, g, false); box(D - 0.4, 2.6, 0.04, mt(0xe8d4d0), 0, 3.6, -0.12, g, false); }
    // east wall with the dock door
    const east = new THREE.Group(); hall.add(east);
    const ew = (z0, z1) => { const len = z1 - z0, g = wall(len, HALL.x1, (z0 + z1) / 2, -Math.PI / 2, east); return g; };
    ew(HALL.z0, -0.8); ew(4.4, HALL.z1);
    box(0.15, H - 3.6, 5.2, lam({ map: hiT }), HALL.x1, 3.6 + (H - 3.6) / 2, 1.8, east);
    const roll = canvasTex(64, 256, (g, w, h) => { for (let y = 0; y < h; y += 8) { g.fillStyle = y % 16 ? '#8c9298' : '#a8aeb4'; g.fillRect(0, y, w, 8); } });
    box(0.1, 3.6, 5.2, lam({ map: roll }), HALL.x1 + 0.05, 1.8, 1.8, east);
    // the cutaway south wall: a low strip, the door back into the shed in the middle
    const a0 = DX - 0.8 - HALL.x0, a1 = HALL.x1 - DX - 0.8;
    box(a0, 0.6, 0.15, mt(0x5a7088), HALL.x0 + a0 / 2, 0.3, HALL.z1, hall); box(a1, 0.6, 0.15, mt(0x5a7088), HALL.x1 - a1 / 2, 0.3, HALL.z1, hall);
    box(1.6, 0.03, 0.7, mt(C.paprika), DX, 0.02, HALL.z1 - 0.45, hall, false);
    // seen from the street: the full south wall and a roof (they lift when Eddy walks in, like the shed's)
    const hi = new THREE.Group(); hall.add(hi); hall.userData.hi = hi;
    const sl = lowT.clone(); sl.needsUpdate = true; sl.repeat.set(W / 2, 1); const sh = hiT.clone(); sh.needsUpdate = true; sh.repeat.set(W / 2, 1);
    box(a0, 1.8, 0.15, lam({ map: sl }), HALL.x0 + a0 / 2, 1.5, HALL.z1, hi); box(a1, 1.8, 0.15, lam({ map: sl }), HALL.x1 - a1 / 2, 1.5, HALL.z1, hi);
    box(W, H - 2.4, 0.15, lam({ map: sh }), 0, 2.4 + (H - 2.4) / 2, HALL.z1, hi);
    const roofT = ribTex('#7a8290', '#6a7280'); roofT.repeat.set(W / 1.5, 1);
    box(W + 0.6, 0.22, D + 0.6, lam({ map: roofT }), 0, H + 0.11, 0, hi); for (let k = 0; k < 3; k++) box(1.6, 0.4, 1.0, mt(0x8a8f94), -6 + k * 6, H + 0.4, -1, hi);
    const rs = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.1), lam({ map: signTex([{ t: "EDDY'S · DE HAL", size: 46 }], '#2a1a0e', '#f2b21a', 640, 110) })); rs.position.set(4, 3.4, HALL.z1 + 0.1); hi.add(rs);
    const ds = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.5), lam({ map: signTex([{ t: 'NAAR DE LOODS', size: 40 }], '#1e120a', '#f2b21a', 512, 116) }));
    ds.rotation.x = -Math.PI / 2; ds.position.set(DX, 0.03, HALL.z1 - 1.3); hall.add(ds);
    const hs = new THREE.Mesh(new THREE.PlaneGeometry(5, 1.0), lam({ map: signTex([{ t: "EDDY'S · DE HAL", size: 44 }], '#2a1a0e', '#f2b21a', 640, 128) }));
    hs.scale.set(0.8, 0.6, 1); hs.position.set(-4.4, 4.42, HALL.z0 + 0.25); hall.add(hs);
    // ceiling lights (hanging high bays), only two real lights for speed
    hall.userData.lights = [[-5, 4], [5, 4]].map(([x, h]) => { const l = new THREE.PointLight(0xfff0d8, 0, 26, 1.2); l.position.set(x, h, 0); hall.add(l); return l; });
    // leftovers from the previous tenant, as in the art: boards leaning on the north wall
    for (let k = 0; k < 5; k++) { const b = box(0.9 + (k % 2) * 0.4, 1.6 + (k % 3) * 0.3, 0.06, mt([0xd8c098, 0x2a4a8a, 0xe8e4dc, 0xb89a6a, 0x3a3a3a][k]), 7.4 + k * 0.32, 0.85, HALL.z0 + 0.5 + k * 0.08, hall); b.rotation.x = -0.12; }
  }
  // walls block walking (world)
  const hallSol = [
    solid(HX + HALL.x0 - 0.3, HX + HALL.x1 + 0.3, HZ + HALL.z0 - 0.3, HZ + HALL.z0 + 0.1), // north
    solid(HX + HALL.x1 - 0.1, HX + HALL.x1 + 0.3, HZ + HALL.z0, HZ + HALL.z1), // east
    solid(HX + HALL.x0 - 0.3, HX + DX - 0.8, HZ + HALL.z1 - 0.1, HZ + HALL.z1 + 0.3), solid(HX + DX + 0.8, HX + HALL.x1 + 0.3, HZ + HALL.z1 - 0.1, HZ + HALL.z1 + 0.3), // south, with the doorway
  ];
  // the short corridor from the shed's back wall to the hall (z -19 .. -21.4)
  const corr = new THREE.Group(); corr.visible = false; scene.add(corr);
  { const len = -19.15 - (HZ + HALL.z1), cz = (-19.15 + HZ + HALL.z1) / 2;
    for (const x of [DX - 0.95, DX + 0.95]) box(0.15, 2.8, len, mt(0x5a7088), x, 1.4, cz, corr);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, len + 0.3), lam({ color: 0x9a9890 })); fl.rotation.x = -Math.PI / 2; fl.position.set(DX, 0.012, cz); corr.add(fl);
    corr.userData.roof = box(2.3, 0.15, len + 0.2, mt(0x7a8290), DX, 2.85, cz, corr);
    corr.userData.sol = [solid(DX - 1.05, DX - 0.85, HZ + HALL.z1, -19), solid(DX + 0.85, DX + 1.05, HZ + HALL.z1, -19)]; }
  const hallWestSol = solid(HX + HALL.x0 - 0.3, HX + HALL.x0 + 0.1, HZ + HALL.z0, HZ + HALL.z1);
  // ---- De Overkapping: white membrane on a steel truss frame, black-wrapped pallets along the walls
  {
    const W = TENT.x1 - TENT.x0, D = TENT.z1 - TENT.z0, cx = (TENT.x0 + TENT.x1) / 2, cz = (TENT.z0 + TENT.z1) / 2;
    const ft = concrete.clone(); ft.needsUpdate = true; ft.repeat.set(W / 4, D / 4);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lam({ map: ft, color: 0xc8b89a })); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, 0.011, cz); fl.receiveShadow = true; tent.add(fl);
    const memb = lam({ color: 0xe8e0cc, side: THREE.DoubleSide }), truss = mt(0x5a5a58);
    box(W, 5.5, 0.08, memb, cx, 2.75, TENT.z0, tent); box(0.08, 5.5, D, memb, TENT.x0, 2.75, cz, tent);
    box(0.08, 4.4, TENT.z0 - HALL.z0 > 0 ? 0 : HALL.z0 - TENT.z0, memb, TENT.x1, 2.2, (TENT.z0 + HALL.z0) / 2, tent); // the strip where the tent is wider than the hall
    for (let k = 0; k <= 6; k++) { const x = TENT.x0 + k * (W / 6); box(0.14, 5.5, 0.14, truss, x, 2.75, TENT.z0 + 0.1, tent); for (let y = 0.8; y < 5.4; y += 1.1) { const d = box(0.05, 1.3, 0.05, truss, x + 0.45, y, TENT.z0 + 0.12, tent, false); d.rotation.z = 0.7; } }
    for (let k = 0; k <= 4; k++) box(0.14, 5.5, 0.14, truss, TENT.x0 + 0.1, 2.75, TENT.z0 + k * (D / 4), tent);
    box(1.6, 0.6, 0.15, memb, cx, 0.3, TENT.z1, tent); box(W, 0.5, 0.15, mt(0xd8d0bc), cx, 0.25, TENT.z1, tent);
    const thi = new THREE.Group(); tent.add(thi); tent.userData.hi = thi;
    box(W, 5.0, 0.08, memb, cx, 3.0, TENT.z1, thi);
    box(W + 0.4, 0.16, D + 0.4, lam({ color: 0xece4d0 }), cx, 5.6, cz, thi); for (let k = 0; k <= 6; k++) box(0.12, 0.2, D + 0.4, truss, TENT.x0 + k * (W / 6), 5.75, cz, thi, false);
    const tsS = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.2), lam({ map: signTex([{ t: "EDDY'S GROOTHANDEL", size: 46 }], '#2a1a0e', '#f2b21a', 768, 132) })); tsS.position.set(cx, 3.6, TENT.z1 + 0.06); thi.add(tsS);
    for (let k = 0; k < 9; k++) { const p = pallet(0x141414, tent); p.position.set(TENT.x0 + 0.9, 0, TENT.z0 + 3.4 + k * 1.2); p.rotation.y = Math.PI / 2; p.userData.load.material = mt(0x161616); if (k % 3 === 1) { const q = pallet(0x141414, tent); q.position.set(TENT.x0 + 0.9, 1.1, TENT.z0 + 3.4 + k * 1.2); q.rotation.y = Math.PI / 2; q.userData.load.material = mt(0x161616); } }
    // an orange hand pallet truck, like the one in the art
    { const j = new THREE.Group(); j.position.set(TENT.x0 + 2.6, 0, TENT.z1 - 1.6); j.rotation.y = 0.4; tent.add(j); for (const x of [-0.18, 0.18]) box(0.16, 0.08, 1.2, mt(C.orange), x, 0.06, 0.4, j); box(0.5, 0.25, 0.25, mt(C.orange), 0, 0.15, -0.25, j); const h = box(0.05, 1.0, 0.05, mt(C.orange), 0, 0.6, -0.35, j); h.rotation.x = -0.35; }
    tent.userData.lights = [TENT.x0 + 5.5, TENT.x0 + 16.5].map((x) => { const l = new THREE.PointLight(0xfff0d8, 0, 26, 1.2); l.position.set(x, 4.2, cz); tent.add(l); return l; });
    const ts = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.3), lam({ map: signTex([{ t: "EDDY'S GROOTHANDEL", size: 46 }], '#2a1a0e', '#f2b21a', 768, 140) }));
    ts.position.set(cx + 2, 4.4, TENT.z0 + 0.2); tent.add(ts);
  }
  const tentSol = [
    solid(HX + TENT.x0 - 0.3, HX + TENT.x1, HZ + TENT.z0 - 0.3, HZ + TENT.z0 + 0.1),
    solid(HX + TENT.x0 - 0.3, HX + TENT.x0 + 0.1, HZ + TENT.z0, HZ + TENT.z1),
    solid(HX + TENT.x0 - 0.3, HX + TENT.x1, HZ + TENT.z1 - 0.1, HZ + TENT.z1 + 0.3), // south
    solid(HX + TENT.x0 + 0.4, HX + TENT.x0 + 1.4, HZ + TENT.z0 + 2.7, HZ + TENT.z1 - 0.6), // the wrapped pallets
  ];
  const tentNotch = solid(HX + HALL.x0 - 0.2, HX + HALL.x1 + 0.3, HZ + TENT.z0 - 0.3, HZ + HALL.z0 - 0.1); // north of the hall wall: outside

  // ================================================================== the plot behind the shed (bouwkavel): TE KOOP, then VERKOCHT, then built on
  const plot = new THREE.Group(); scene.add(plot);
  { const W = PLOT.x1 - PLOT.x0, D = PLOT.z1 - PLOT.z0, cx = (PLOT.x0 + PLOT.x1) / 2, cz = (PLOT.z0 + PLOT.z1) / 2;
    const dirt = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7a6a4a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1600; i++) { g.fillStyle = Math.random() < 0.35 ? `rgba(90,120,50,${0.3 + Math.random() * 0.4})` : `rgba(${60 + Math.random() * 60},${50 + Math.random() * 40},30,0.35)`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 7, 1 + Math.random() * 4); } });
    dirt.wrapS = dirt.wrapT = THREE.RepeatWrapping; dirt.repeat.set(W / 6, D / 6);
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lam({ map: dirt })); gr.rotation.x = -Math.PI / 2; gr.position.set(cx, 0.006, cz); gr.receiveShadow = true; plot.add(gr);
    const wild = new THREE.Group(); plot.add(wild); plot.userData.wild = wild; let r = 11; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    for (let k = 0; k < 70; k++) { const c = new THREE.Mesh(geo('weed', () => new THREE.ConeGeometry(0.22, 0.5, 5)), mt([0x6a8a3a, 0x8aa04a, 0x5a7a30][k % 3])); c.position.set(PLOT.x0 + 1 + rnd() * (W - 2), 0.25, PLOT.z0 + 1 + rnd() * (D - 2)); wild.add(c); }
    for (let k = 0; k < 6; k++) box(0.6 + rnd(), 0.3, 0.5, mt(0x8a8478), PLOT.x0 + 4 + rnd() * (W - 8), 0.15, PLOT.z0 + 2 + rnd() * (D - 4), wild); // rubble
    for (let x = PLOT.x0; x <= PLOT.x1 + 0.01; x += 2.5) { cyl(0.05, 0.05, 1.2, mt(0x8a6a4a), x, 0.6, PLOT.z1 - 0.1, wild, 6); cyl(0.05, 0.05, 1.2, mt(0x8a6a4a), x, 0.6, PLOT.z0 + 0.1, wild, 6); }
    for (const z of [PLOT.z1 - 0.1, PLOT.z0 + 0.1]) for (const y of [0.5, 1.0]) box(W, 0.03, 0.03, mt(0x9a9a9a), cx, y, z, wild, false);
    const board = new THREE.Group(); board.position.set(DX - 2.6, 0, PLOT.z1 - 3.2); plot.add(board); plot.userData.board = board;
    for (const x of [-1.5, 1.5]) box(0.12, 3.0, 0.12, mt(0x6a4a2a), x, 1.5, 0, board);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.0), lam({ map: signTex([{ t: 'TE KOOP', size: 54 }, { t: 'BOUWGROND · 720 m²', size: 26, color: '#2a1a0e' }, { t: 'Makelaardij Kaasvast', size: 22, color: '#2a1a0e' }], '#f2ead8', '#b83a1e', 512, 300) })); face.position.set(0, 2.4, 0.06); face.rotation.x = -0.55; board.add(face);
    plot.userData.face = face; plot.userData.sold = signTex([{ t: 'VERKOCHT', size: 54 }, { t: "aan Eddy's", size: 30, color: '#2a1a0e' }, { t: 'Makelaardij Kaasvast', size: 22, color: '#2a1a0e' }], '#f2ead8', '#2f7a3a', 512, 300); }

  // ================================================================== the Mengkamer machines (shed) and the extra tables (hall, tent)
  const shed = new THREE.Group(); scene.add(shed);
  const mixer1 = new THREE.Group(); mixer1.position.set(-3.2, 0, -14.7); mixer1.visible = false; shed.add(mixer1);
  { // electric drum mixer: a tilted saffron drum on a steel frame
    for (const x of [-0.45, 0.45]) box(0.08, 1.0, 0.08, mt(C.steel), x, 0.5, 0, mixer1);
    box(1.0, 0.08, 0.5, mt(C.steel), 0, 0.12, 0, mixer1);
    const drum = new THREE.Group(); drum.position.set(0, 1.05, 0); drum.rotation.x = 0.55; mixer1.add(drum);
    cyl(0.42, 0.3, 0.75, mt(C.saffron), 0, 0, 0, drum, 14); cyl(0.3, 0.2, 0.2, mt(C.saffron), 0, 0.46, 0, drum, 14);
    cyl(0.18, 0.18, 0.02, mt(C.paprika), 0, 0.57, 0, drum, 14);
    box(0.3, 0.3, 0.3, mt(0x2a6a3a), 0.55, 0.65, 0, mixer1);
    mixer1.userData.spin = drum;
  }
  const mixer2 = new THREE.Group(); mixer2.position.set(-3.2, 0, -14.75); mixer2.visible = false; shed.add(mixer2);
  { // industrial ribbon blender: a stainless trough on legs, a hopper, a motor and a control box
    const ss = new THREE.MeshPhongMaterial({ color: 0xc8ced4, shininess: 90, specular: 0x888888 });
    for (const [x, z] of [[-0.75, -0.35], [0.75, -0.35], [-0.75, 0.35], [0.75, 0.35]]) box(0.08, 0.7, 0.08, ss, x, 0.35, z, mixer2);
    box(1.7, 0.75, 0.85, ss, 0, 1.05, 0, mixer2); cyl(0.42, 0.42, 1.7, ss, 0, 0.75, 0, mixer2, 16).rotation.z = Math.PI / 2;
    const hop = cyl(0.45, 0.2, 0.5, ss, -0.4, 1.7, 0, mixer2, 4); hop.rotation.y = Math.PI / 4;
    box(0.4, 0.4, 0.45, mt(0x2a6a3a), 1.05, 0.95, 0, mixer2); box(0.3, 0.45, 0.12, mt(C.cream), 0.5, 1.35, 0.48, mixer2);
    const lamp = box(0.08, 0.08, 0.04, mt(0x40ff60, { emissive: 0x20a030 }), 0.5, 1.48, 0.55, mixer2, false);
    const shaft = box(1.75, 0.06, 0.06, mt(C.steel), 0, 1.45, 0, mixer2, false); mixer2.userData.spin = shaft; mixer2.userData.lamp = lamp;
  }
  const mill = new THREE.Group(); mill.position.set(-6.3, 0, -14.9); mill.visible = false; shed.add(mill);
  { // stone spice mill: oak frame, two millstones, a hopper with turmeric
    for (const [x, z] of [[-0.5, -0.4], [0.5, -0.4], [-0.5, 0.4], [0.5, 0.4]]) box(0.1, 0.8, 0.1, mt(0x6a4a2a), x, 0.4, z, mill);
    box(1.15, 0.08, 0.95, mt(0x6a4a2a), 0, 0.82, 0, mill);
    cyl(0.42, 0.42, 0.2, mt(0x8a8680), 0, 0.96, 0, mill, 16);
    const top = cyl(0.42, 0.42, 0.18, mt(0x9a968e), 0, 1.16, 0, mill, 16); mill.userData.spin = top;
    cyl(0.25, 0.08, 0.35, mt(0x6a4a2a), 0, 1.5, 0, mill, 8); cyl(0.2, 0.2, 0.03, mt(C.turmeric), 0, 1.66, 0, mill, 8);
    box(0.25, 0.2, 0.3, mt(C.turmeric), 0.62, 0.95, 0, mill);
  }
  const shedSol = { menger: solid(-4.15, -2.25, -15.25, -14.2), mill: solid(-6.9, -5.7, -15.4, -14.4) }; shedSol.menger.off = shedSol.mill.off = true;
  const cam = new THREE.Group(); cam.position.set(-7.4, 4.3, -7.35); cam.visible = false; scene.add(cam);
  { box(0.12, 0.12, 0.3, mt(0xe8e4dc), 0, 0, 0.1, cam, false); box(0.06, 0.06, 0.06, mt(0xff2020, { emissive: 0xc00000 }), 0, 0.05, 0.27, cam, false); }
  function table(x, z, parent) { // a second (and third) mixing table, with sacks
    const g = new THREE.Group(); g.position.set(x, 0, z); g.visible = false; parent.add(g);
    const st = new THREE.MeshPhongMaterial({ color: 0xb8bec4, shininess: 70 });
    box(2.6, 0.08, 1.3, st, 0, 0.92, 0, g); for (const [a, b] of [[-1.2, -0.55], [1.2, -0.55], [-1.2, 0.55], [1.2, 0.55]]) box(0.07, 0.92, 0.07, st, a, 0.46, b, g);
    cyl(0.45, 0.3, 0.35, st, 0, 1.13, 0, g, 14); g.userData.bowl = cyl(0.42, 0.42, 0.04, mt(0xc8641e), 0, 1.28, 0, g, 14);
    for (let i = 0; i < 4; i++) box(0.5, 0.7, 0.4, mt([0xc8b48a, C.paprika, 0xc8b48a, C.turmeric][i]), -1.9 + (i % 2) * 0.55, 0.35 + Math.floor(i / 2) * 0.7, -0.9, g);
    return g;
  }
  const table2 = table(-6.5, 3.6, hall), table3 = table(-22, 3.6, tent);
  const tableSol = [solid(HX - 7.9, HX - 5.1, HZ + 2.85, HZ + 4.35), solid(HX - 23.4, HX - 20.6, HZ + 2.85, HZ + 4.35)]; tableSol.forEach((s) => { s.off = true; });
  // Naknik spots: 3 in the shed (main.js), 2 at the hall table, 2 at the tent table (world coords + the table they face)
  const SPOTS = [[HX - 6.5, HZ + 4.6, HX - 6.5, HZ + 3.6], [HX - 4.85, HZ + 3.6, HX - 6.5, HZ + 3.6], [HX - 22, HZ + 4.6, HX - 22, HZ + 3.6], [HX - 20.35, HZ + 3.6, HX - 22, HZ + 3.6]];

  // ---- the loading dock (upgrade): bumpers, a leveller plate and dock lights
  const dock = new THREE.Group(); dock.visible = false; hall.add(dock);
  { const yb = canvasTex(64, 64, (g) => { for (let i = -64; i < 128; i += 16) { g.fillStyle = '#f2b21a'; g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 8, 0); g.lineTo(i + 72, 64); g.lineTo(i + 64, 64); g.fill(); g.fillStyle = '#1a1a1a'; g.beginPath(); g.moveTo(i + 8, 0); g.lineTo(i + 16, 0); g.lineTo(i + 80, 64); g.lineTo(i + 72, 64); g.fill(); } });
    box(1.2, 0.04, 2.6, lam({ map: yb }), HALL.x1 - 0.7, 0.03, 1.8, dock, false); box(0.3, 0.02, 2.4, mt(0x6a6e74), HALL.x1 - 0.2, 0.06, 1.8, dock, false);
    for (const z of [-0.6, 4.2]) { box(0.25, 0.6, 0.35, mt(0x1a1a1a), HALL.x1 - 0.2, 0.8, z, dock); box(0.14, 0.14, 0.14, mt(0x60ff60, { emissive: 0x30c030 }), HALL.x1 - 0.2, 2.6, z, dock, false); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), lam({ map: signTex([{ t: 'DOCK 1 · LAADPERRON', size: 36 }], '#1a1a1a', '#f2b21a', 512, 106) })); sg.position.set(HALL.x1 - 0.12, 4.0, 1.8); sg.rotation.y = -Math.PI / 2; dock.add(sg);
  }

  // ---- construction sites: barrier fence, cones and a sign with the days left
  const site = new THREE.Group(); site.visible = false; scene.add(site);
  const stripe = canvasTex(128, 16, (g) => { for (let x = 0; x < 128; x += 32) { g.fillStyle = '#c2412d'; g.fillRect(x, 0, 16, 16); g.fillStyle = '#f2ead8'; g.fillRect(x + 16, 0, 16, 16); } }); stripe.wrapS = THREE.RepeatWrapping;
  const siteParts = { bars: [], cones: [] };
  for (let k = 0; k < 4; k++) { const b = box(1, 0.12, 0.05, lam({ map: stripe }), 0, 0.85, 0, site, false); siteParts.bars.push(b); }
  for (let k = 0; k < 4; k++) { const c = new THREE.Mesh(geo('cone', () => new THREE.ConeGeometry(0.18, 0.5, 10)), mt(C.orange)); c.position.y = 0.25; site.add(c); siteParts.cones.push(c); }
  let signDays = -1; const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), lam({ map: signTex([{ t: 'VERBOUWING' }], '#f2b21a', '#1a1a1a', 256, 102), side: THREE.DoubleSide })); signMesh.position.y = 1.6; site.add(signMesh);
  function siteSpot(id) {
    const L = ensure();
    if (id === 'rek') { const b = BAYS[L.racks]; return b ? [b[0], b[1], Math.abs(Math.sin(b[2])) > 0.5 ? 1.4 : 3.0, Math.abs(Math.sin(b[2])) > 0.5 ? 3.0 : 1.4] : null; }
    return { menger1: [-2.4, -15.5, 3.0, 3.0], menger2: [-2.4, -15.5, 3.0, 3.0], menger3: [-2.4, -15.5, 3.2, 3.2], inpak: [0.2, -8.6, 1.6, 2.6], molen: [-6.3, -14.9, 1.6, 1.4], roldeur: [-4.75, -7.9, 4.2, 0.9], hal: [HX - 2, HZ + 1, 12, 8], kavel: [DX - 2.6, PLOT.z1 - 3.2, 4, 1.4], heftruck: [HX + 4.5, HZ + 4.2, 3, 2], tafel2: [HX - 6.5, HZ + 3.6, 3.2, 2], dock: [HX + 9.6, HZ + 1.8, 2.4, 5.4], tent: [HX + HALL.x0 + 1, HZ, 2, 10] }[id] || null;
  }
  function showSite() {
    const j = ensure().job, s = j && siteSpot(j.id); site.visible = !!s; if (!s) return;
    const [x, z, w, d] = s; site.position.set(x, 0, z);
    const [b0, b1, b2, b3] = siteParts.bars; b0.scale.x = b1.scale.x = w; b2.scale.x = b3.scale.x = d;
    b0.position.set(0, 0.85, -d / 2); b1.position.set(0, 0.85, d / 2); b2.position.set(-w / 2, 0.85, 0); b3.position.set(w / 2, 0.85, 0); b2.rotation.y = b3.rotation.y = Math.PI / 2;
    siteParts.cones.forEach((c, k) => c.position.set((k % 2 ? 1 : -1) * w / 2, 0.25, (k > 1 ? 1 : -1) * d / 2));
    signMesh.position.set(0, 1.6, d / 2 + 0.05);
    const left = Math.max(0, j.done - day());
    if (left !== signDays) { signDays = left; signMesh.material.map = signTex([{ t: 'VERBOUWING', size: 40 }, { t: left > 0 ? `nog ${left} marktdag${left > 1 ? 'en' : ''}` : 'bijna klaar', size: 26 }], '#f2b21a', '#1a1a1a', 256, 102); signMesh.material.needsUpdate = true; }
  }

  // ================================================================== the heftruck
  const fork = new THREE.Group(); fork.visible = false; scene.add(fork);
  const F = { x: HX + 4.5, z: HZ + 4.2, h: Math.PI / 2, v: 0, lift: 0.12, liftTo: 0.12, carry: null, drive: false, busy: 0 };
  {
    const body = mt(C.saffron), dark = mt(0x2a2a2e), black = mt(0x111114);
    box(1.05, 0.55, 1.5, body, 0, 0.55, -0.1, fork); box(1.05, 0.5, 0.45, mt(0xc89012), 0, 0.85, -0.75, fork); // chassis + counterweight
    box(0.5, 0.12, 0.45, black, 0, 1.0, -0.2, fork); box(0.5, 0.45, 0.1, black, 0, 1.2, -0.42, fork); // seat
    for (const [x, z] of [[-0.48, 0.55], [0.48, 0.55], [-0.48, -0.55], [0.48, -0.55]]) box(0.06, 1.25, 0.06, dark, x, 1.45, z, fork); // overhead guard
    box(1.05, 0.05, 1.2, dark, 0, 2.08, 0, fork);
    for (const [x, z, r] of [[-0.55, 0.45, 0.28], [0.55, 0.45, 0.28], [-0.55, -0.6, 0.22], [0.55, -0.6, 0.22]]) { const w = cyl(r, r, 0.22, black, x, r, z, fork, 12); w.rotation.z = Math.PI / 2; }
    box(0.08, 0.3, 0.06, dark, 0.15, 1.0, 0.45, fork); // steering column
    for (const x of [-0.38, 0.38]) box(0.1, 2.4, 0.1, dark, x, 1.25, 0.72, fork); // mast
    box(0.86, 0.08, 0.08, dark, 0, 2.42, 0.72, fork);
    const carriage = new THREE.Group(); carriage.position.set(0, 0.12, 0.8); fork.add(carriage);
    box(0.9, 0.5, 0.06, dark, 0, 0.25, 0, carriage);
    for (const x of [-0.25, 0.25]) box(0.12, 0.05, 1.05, mt(0x5a5a5e), x, 0.0, 0.55, carriage);
    fork.userData.carriage = carriage;
    const beacon = new THREE.Mesh(geo('beac', () => new THREE.SphereGeometry(0.07, 8, 6)), mt(0xff9a20, { emissive: 0xc06000 })); beacon.position.set(0.4, 2.15, -0.5); fork.add(beacon); fork.userData.beacon = beacon;
  }
  const forkSol = solid(0, 0, 0, 0);
  const fwd = () => new THREE.Vector3(Math.sin(F.h), 0, Math.cos(F.h));
  const tip = () => new THREE.Vector3(F.x, 0, F.z).addScaledVector(fwd(), 1.85);
  function placeFork() {
    fork.position.set(F.x, 0, F.z); fork.rotation.y = F.h; fork.userData.carriage.position.y = F.lift;
    const c = Math.abs(Math.cos(F.h)), s = Math.abs(Math.sin(F.h)), hw = 0.55 * c + 0.9 * s, hd = 0.55 * s + 0.9 * c;
    Object.assign(forkSol, { minx: F.x - hw, maxx: F.x + hw, minz: F.z - hd, maxz: F.z + hd, off: F.drive || !fork.visible });
  }
  // pallets waiting at the dock (bought deals): spots inside the dock door. A pallet lands two market days after you buy it (express: one).
  const landed = (p) => !(p.day > day());
  const DOCK_SPOTS = [[8.9, 3.6], [8.9, 2.0], [8.9, 0.4]].map(([x, z]) => [HX + x, HZ + z]);
  const dockPallets = DOCK_SPOTS.map(([x, z]) => { const p = pallet(C.paprika, scene); p.position.set(x, 0, z); p.rotation.y = Math.PI / 2; p.visible = false; const sol = solid(x - 0.5, x + 0.5, z - 0.6, z + 0.6); sol.off = true; return { g: p, sol }; });
  function showDock() {
    const L = ensure();
    dockPallets.forEach((d, i) => { const it = L.dock.find((p) => p.spot === i && landed(p) && !(F.carry && F.carry.spot === i)); d.g.visible = !!it && has('hal'); d.sol.off = !d.g.visible; if (it) d.g.userData.load.material = mt(ING_COL[it.id] || C.paprika); });
  }
  const carried = pallet(C.paprika, fork.userData.carriage); carried.position.set(0, -0.1, 0.62); carried.visible = false;
  const driver = deps.makeDriver ? deps.makeDriver() : null; // a Naknik on the seat when he racks the pallets himself
  if (driver) { driver.position.set(0, 0.62, -0.28); driver.visible = false; fork.add(driver); }

  // rack slots: which slots show a pallet. The fill follows stock / capacity; a racked pallet pins its own slot first.
  const filled = new Set(); let hint = -1;
  const openSlots = () => bays.slice(0, ensure().racks).flatMap((b, bi) => b.slots.map((s, si) => bi * 6 + si));
  function refreshSlots() {
    const open = openSlots(), cap = econ.cap(), tot = econ.stockTotal();
    const want = Math.min(open.length, Math.round(open.length * Math.min(1, tot / Math.max(1, cap)) * 1.15));
    for (const k of [...filled]) if (!open.includes(k)) filled.delete(k);
    while (filled.size > want) filled.delete(filled.values().next().value); // the oldest pallet goes first
    while (filled.size < want) { const k = hint >= 0 && open.includes(hint) && !filled.has(hint) ? hint : open.find((x) => !filled.has(x)); if (k === undefined) break; filled.add(k); hint = -1; }
    const stockIds = Object.keys(econ.ensure().stock).map((k) => k.split(':')[0]);
    bays.forEach((b, bi) => b.slots.forEach((s, si) => { const k = bi * 6 + si; s.visible = filled.has(k); if (s.visible && stockIds.length) s.userData.load.material = mt(ING_COL[stockIds[k % stockIds.length]] || C.paprika); }));
  }

  // ================================================================== building
  const reqOk = (u) => (u.need || []).every((n) => (n === 'junk' ? deps.junkDone() : n === 'rek' ? ensure().racks > 0 : has(n)));
  function why(u) {
    const L = ensure();
    if (u.repeat) { if (L.racks >= BAYS.length) return 'All racking bays are full.'; if (L.racks >= bayLimit()) return stage() === 1 ? (deps.junkDone() ? 'The shed has room for one bay. Build De Hal for more.' : NEED_TEXT.junk) : stage() === 2 ? 'The hall is full. De Overkapping has room for six more.' : 'No room left.'; if (L.racks === 0 && !deps.junkDone()) return NEED_TEXT.junk; if (deps.rank() < (L.racks >= 4 ? 2 : L.racks >= 1 ? 1 : 0)) return `rank ${RANK_NAMES[L.racks >= 4 ? 2 : 1]}`; return null; }
    if (has(u.id)) return 'built';
    const miss = (u.need || []).find((n) => !(n === 'junk' ? deps.junkDone() : n === 'rek' ? L.racks > 0 : has(n))); if (miss) return NEED_TEXT[miss];
    if (deps.rank() < u.rank) return `rank ${RANK_NAMES[u.rank]}`;
    return null;
  }
  const costOf = (u) => (u.repeat ? rackCost() : u.cost);
  function order(id, el) {
    const L = ensure(), u = UPGRADES.find((x) => x.id === id); if (!u) return 'Unknown.';
    if (L.job) return `Gerrit's crew is still busy on the ${UPGRADES.find((x) => x.id === L.job.id).name}.`;
    const w = why(u); if (w) return w === 'built' ? 'Already built.' : `Not yet: ${w}.`;
    const cost = costOf(u); if (state.money < cost) return `Not enough Wilders (${fmt(cost)}).`;
    deps.addMoney(-cost, el); L.job = { id, done: day() + u.days, start: day() };
    if (deps.beep) deps.beep(520, 0.1, 'square', 0.04);
    deps.save(); showSite(); return null;
  }
  function finish() {
    const L = ensure(), j = L.job; if (!j) return; L.job = null;
    const u = UPGRADES.find((x) => x.id === j.id);
    if (j.id === 'rek') L.racks++; else L.built[j.id] = day();
    if (j.id === 'heftruck') { F.x = HX + 4.5; F.z = HZ + 4.2; F.h = Math.PI / 2; }
    apply(); deps.save();
    const msg = { inpak: 'The Inpakmachine hums by the door: blue bags roll off the belt, labelled and all.', menger3: 'De Reuzenmenger is in. The Naknikim need the steps to tip their vaten.', rek: `Bay ${L.racks} of the racking is up: 6 pallet places (+${RACK_KG} kg).${L.racks === 1 ? ' Your stock now shows as pallets on it.' : ''}`, hal: 'The back wall is gone: De Hal is yours. Go through the new door at the back of the shed.', heftruck: 'The heftruck is parked in the hall. Pallet deals are open on the Loods tab.', tent: "De Overkapping stands. Eddy's Groothandel: a real trader's warehouse." }[j.id] || u.what;
    deps.toast('VERBOUWING KLAAR', `${u.name}: ${msg}`, 5);
  }
  function apply() { // show what's built
    const L = ensure();
    bays.forEach((b, i) => { b.g.visible = i < L.racks; b.sol.off = i >= L.racks; });
    mixer1.visible = mixer2.visible = false; mill.visible = has('molen'); // the mixers are drawn by the production line now (js/productie.js)
    shedSol.menger.off = true; shedSol.mill.off = !has('molen');
    cam.visible = has('roldeur'); if (deps.shutter && has('roldeur')) deps.shutter.material.color.setHex(0x6a7078);
    if (deps.hideShelf) deps.hideShelf(has('hal'));
    hallDoor.visible = corr.visible = hall.visible = has('hal'); corr.userData.sol.forEach((x) => { x.off = !has('hal'); }); hallSol.forEach((x) => { x.off = !has('hal'); });
    plot.userData.wild.visible = !has('hal'); plot.userData.board.visible = !has('hal'); plot.userData.face.material.map = has('kavel') ? plot.userData.sold : plot.userData.face.material.map; plot.userData.face.material.needsUpdate = true;
    table2.visible = has('tafel2'); tableSol[0].off = !has('tafel2'); table3.visible = has('tent'); tableSol[1].off = !has('tent');
    dock.visible = has('dock');
    hall.userData.west.visible = !has('tent'); tent.visible = has('tent'); hallWestSol.off = has('tent') || !has('hal'); tentSol.forEach((s) => { s.off = !has('tent'); }); tentNotch.off = !has('tent');
    fork.visible = has('heftruck'); placeFork();
    refreshSlots(); showDock(); showSite(); rollDeals();
  }

  // ================================================================== the door between the shed and the hall
  const hallDoor = new THREE.Group(); hallDoor.position.set(-4.6, 0, -18.83); hallDoor.visible = false; scene.add(hallDoor);
  { for (const x of [-1.0, 1.0]) box(0.12, 2.6, 0.2, mt(0x3a3e44), x, 1.3, 0.05, hallDoor, false); box(2.12, 0.14, 0.2, mt(0x3a3e44), 0, 2.6, 0.05, hallDoor, false);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.36), lam({ map: signTex([{ t: 'DE HAL', size: 44 }], '#f2b21a', '#1a1a1a', 256, 58) })); pl.position.set(0, 2.85, 0.05); hallDoor.add(pl); }
  let inHall = false;
  const fadeEl = document.createElement('div'); fadeEl.className = 'smeFade'; fadeEl.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40'; document.body.appendChild(fadeEl);
  const fadeTo = (fn) => { fadeEl.style.opacity = '1'; setTimeout(() => { fn(); setTimeout(() => { fadeEl.style.opacity = '0'; }, 60); }, 380); };
  function bounds() { return { x0: HX + (has('tent') ? TENT.x0 : HALL.x0) + 0.3, x1: HX + HALL.x1 - 0.3, z0: HZ + (has('tent') ? TENT.z0 : HALL.z0) + 0.3, z1: HZ + HALL.z1 - 0.3 }; }
  // the hall is walked into through the doorway (no fade): these two are shortcuts for tests
  function enterHall() { if (!has('hal')) return; player.position.set(DX, 0, HZ + HALL.z1 - 0.9); player.rotation.y = Math.PI; if (deps.snapCam) deps.snapCam(); }
  function leaveHall() { if (F.drive) getOff(); player.position.set(DX, 0, -17.9); player.rotation.y = 0; if (deps.snapCam) deps.snapCam(); }
  const inRect = (p, x0, x1, z0, z1) => p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1;
  const hallHere = (p) => has('hal') && (inRect(p, HX + HALL.x0, HX + HALL.x1, HZ + HALL.z0, -19) && (p.z < HZ + HALL.z1 || Math.abs(p.x - DX) < 1)) || (has('tent') && inRect(p, HX + TENT.x0, HX + TENT.x1, HZ + TENT.z0, HZ + TENT.z1));
  const far = new THREE.Vector3(0, -99, 0);
  deps.addInteract({ pos: () => (has('kavel') || !deps.inWarehouse() ? far : new THREE.Vector3(DX, 0, -17.9)), r: 1.4, enabled: () => !has('kavel') && deps.inWarehouse(), label: () => 'Behind this wall: an empty plot, TE KOOP · Loods tab', act: () => deps.toast('BOUWKAVEL', 'The plot behind the shed is for sale. Buy it on the Loods tab and the warehouse can grow onto it.', 3) });
  deps.addInteract({ pos: () => (inHall && fork.visible && !F.drive ? new THREE.Vector3(F.x, 0, F.z) : far), r: 1.9, enabled: () => inHall && fork.visible && !F.drive, label: () => (A.phase ? `Take over the heftruck from ${A.who}` : 'Drive the heftruck'), act: getOn });
  deps.addInteract({ pos: () => (F.drive ? player.position : far), r: 5, enabled: () => F.drive && !F.busy, label: () => forkAction().label, act: () => forkAction().act() });
  // the dock pallets can be looked at on foot too
  deps.addInteract({ pos: () => { const p = nearestDock(player.position, 1.6); return p ? DOCK_V(p.spot) : far; }, r: 1.6, enabled: () => inHall && !F.drive, label: () => { const p = nearestDock(player.position, 1.6); return p ? `Pallet: ${p.kg} kg ${p.name} · rack it with the heftruck` : ''; }, act: () => deps.toast('PALLET', fork.visible ? 'Get on the heftruck, lift it at the dock and put it in a free rack bay.' : 'You need a Heftruck to rack it (Loods tab).', 3) });
  const DOCK_V = (i) => new THREE.Vector3(DOCK_SPOTS[i][0], 0, DOCK_SPOTS[i][1]);
  function nearestDock(p, r) { let best = null, bd = r; for (const it of ensure().dock) { if ((F.carry && F.carry.spot === it.spot) || !landed(it)) continue; const d = DOCK_V(it.spot).distanceTo(p); if (d < bd) { bd = d; best = it; } } return best; }

  function getOn() { autoStop(); F.drive = true; F.v = 0; deps.beep(180, 0.2, 'sawtooth', 0.03); deps.toast('HEFTRUCK', `W/S drive · A/D steer · [${deps.glyph ? deps.glyph('E') : 'E'}] lift a pallet at the dock, set it in a rack bay, or get off`, 4); placeFork(); }
  function getOff() { F.drive = false; F.v = 0; const side = new THREE.Vector3(Math.cos(F.h), 0, -Math.sin(F.h)); player.position.set(F.x - side.x * 1.0, 0, F.z - side.z * 1.0); player.position.y = 0; placeFork(); deps.collide(player.position, 0.38); }
  function bayAhead() { // the racking bay the forks point into, and a free slot in it (lowest first)
    const t = tip(), L = ensure();
    for (let i = 0; i < L.racks; i++) {
      if (i === 0) continue; // the shed bay is filled by hand
      const b = bays[i], rel = t.clone().sub(b.front), along = rel.dot(b.dir), depth = rel.dot(new THREE.Vector3(Math.sin(b.ry), 0, Math.cos(b.ry)));
      if (Math.abs(along) < 1.45 && depth > -1.3 && depth < 0.9) { const free = b.slots.findIndex((s, si) => !filled.has(i * 6 + si)); return { i, free }; }
    }
    return null;
  }
  function forkAction() {
    if (!F.carry) {
      const p = nearestDock(tip(), 1.25);
      if (p) return { label: `Lift the pallet · ${p.kg} kg ${p.name}`, act: () => { F.carry = p; carried.visible = true; carried.userData.load.material = mt(ING_COL[p.id] || C.paprika); F.liftTo = 0.45; showDock(); deps.beep(240, 0.25, 'sawtooth', 0.03); } };
      return { label: 'Get off the heftruck', act: getOff };
    }
    const b = bayAhead();
    if (!b) return { label: `Carrying ${F.carry.kg} kg ${F.carry.name} · drive the forks into a rack bay`, act: () => deps.toast('HEFTRUCK', 'Point the forks into a racking bay in the hall, then press again.', 2.5) };
    if (b.free < 0) return { label: 'This bay is full · try another', act: () => deps.toast('HEFTRUCK', 'That bay is full. Find one with an empty place.', 2) };
    if (econ.space() < F.carry.kg) return { label: 'The warehouse is full', act: () => deps.toast('VOL', `No room for ${F.carry.kg} kg: mix or sell some stock first, or build more racking.`, 3) };
    return { label: `Put it in the rack · bay ${b.i}`, act: () => rack(b) };
  }
  // ---- the Naknik on the heftruck: racks waiting dock pallets by himself (Tristan 2026-11-15), and the night shift racks the rest
  const A = { phase: null, path: [], p: null, bay: -1, who: 'the Naknik', wait: 0 };
  const autoOn = () => has('heftruck') && ensure().autoFork !== false && (state.naknik || 0) > 0;
  const crewName = () => { const c = Array.isArray(state.crew) && state.crew.find((m) => m && !m.away); return c ? c.name : 'a Naknik'; };
  function freeBay() { // the first hall/tent bay with an empty place
    const L = ensure(); for (let i = 1; i < L.racks; i++) if (bays[i].slots.some((s, si) => !filled.has(i * 6 + si))) return i; return -1;
  }
  const LV = (x, z) => new THREE.Vector3(HX + x, 0, HZ + z);
  function autoPlan() {
    const L = ensure(), p = L.dock.find(landed); if (!p) return false;
    const bi = freeBay(); if (bi < 0 || econ.space() < p.kg) return false;
    const d = DOCK_SPOTS[p.spot], b = bays[bi], aisle = b.front.z + 2.7, park = LV(4.5, 4.2);
    A.p = p; A.bay = bi; A.who = crewName(); A.phase = 'go';
    A.path = [{ x: d[0] - 3.2, z: d[1] }, { x: d[0] - 2.05, z: d[1], h: Math.PI / 2, act: 'lift' }, { x: d[0] - 3.4, z: d[1], rev: true },
      { x: b.front.x, z: aisle }, { x: b.front.x, z: b.front.z + 1.3, h: Math.PI, act: 'rack' }, { x: b.front.x, z: aisle, rev: true }, { x: park.x, z: park.z, h: Math.PI / 2, act: 'park' }];
    if (driver) driver.visible = true;
    return true;
  }
  function autoStop() { // Eddy takes over: the pallet goes back to the dock
    if (!A.phase) return; A.phase = null; A.path = [];
    if (F.carry) { F.carry = null; carried.visible = false; showDock(); }
    F.liftTo = 0.12; if (driver) driver.visible = false;
  }
  function autoStep(dt) {
    if (!A.phase) { if (A.wait > 0) { A.wait -= dt; return; } if (autoOn() && ensure().dock.some(landed) && !F.drive) { if (!autoPlan()) A.wait = 3; } return; }
    if (F.busy > 0) return;
    const w = A.path[0]; if (!w) { A.phase = null; if (driver) driver.visible = false; return; }
    const dx = w.x - F.x, dz = w.z - F.z, dist = Math.hypot(dx, dz);
    if (dist > 0.06) {
      const want = Math.atan2(dx, dz) + (w.rev ? Math.PI : 0); let dh = Math.atan2(Math.sin(want - F.h), Math.cos(want - F.h));
      F.h += Math.sign(dh) * Math.min(Math.abs(dh), 2.4 * dt);
      if (Math.abs(dh) < 0.5) { const st = Math.min(dist, (w.rev ? 1.4 : 2.4) * dt); F.x += dx / dist * st; F.z += dz / dist * st; }
      return;
    }
    if (w.h !== undefined) { const dh = Math.atan2(Math.sin(w.h - F.h), Math.cos(w.h - F.h)); if (Math.abs(dh) > 0.02) { F.h += Math.sign(dh) * Math.min(Math.abs(dh), 2.4 * dt); return; } }
    A.path.shift();
    const L = ensure();
    if (w.act === 'lift') { if (!L.dock.includes(A.p)) { autoStop(); return; } F.carry = A.p; carried.visible = true; carried.userData.load.material = mt(ING_COL[A.p.id] || C.paprika); F.liftTo = 0.45; showDock(); F.busy = 0.6; }
    if (w.act === 'rack') {
      const b = bays[A.bay], free = b.slots.findIndex((sl, si) => !filled.has(A.bay * 6 + si));
      if (free < 0 || econ.space() < A.p.kg) { A.phase = 'back'; autoStop(); return; } // no room after all: it goes back to the dock
      rack({ i: A.bay, free }, true);
    }
    if (w.act === 'park') { A.phase = null; if (driver) driver.visible = false; }
  }
  function nightShift() { // racked overnight, so nothing waits at the dock for days
    const L = ensure(); if (!autoOn() || F.drive) return 0; let n = 0;
    for (const p of [...L.dock]) {
      if ((A.phase && A.p === p) || !(p.day === undefined || p.day < day())) continue; const bi = freeBay(); // only what stood there yesterday: this morning's truck waits for the day crew if (bi < 0) break;
      const si = bays[bi].slots.findIndex((sl, k) => !filled.has(bi * 6 + k)); if (si < 0 || !econ.stockIn(p.id, 'std', p.kg, true)) break;
      L.dock = L.dock.filter((x) => x !== p); filled.add(bi * 6 + si); n++;
    }
    if (n) { refreshSlots(); showDock(); deps.save(); }
    return n;
  }
  function rack(b, auto) {
    const p = F.carry, lvl = LEVELS[Math.floor(b.free / 2)];
    F.busy = 1.1; F.liftTo = lvl + 0.1; deps.beep(200, 0.6, 'sawtooth', 0.025);
    setTimeout(() => {
      const L = ensure(); if (!econ.stockIn(p.id, 'std', p.kg, auto)) { deps.toast('VOL', 'No room after all.', 2); return; }
      L.dock = L.dock.filter((x) => x !== p); F.carry = null; carried.visible = false; filled.delete(b.i * 6 + b.free); filled.add(b.i * 6 + b.free); refreshSlots(); F.liftTo = 0.12; showDock();
      econ.addRep(5); if (!auto || inHall) deps.toast('GERACKT', `${auto ? `${A.who} racked ` : ''}${p.kg} kg ${p.name} (Standaard)${auto ? '' : ' is in stock'}.`, 2.2); deps.save();
    }, 900);
  }

  // ================================================================== pallet deals (seeded per market day)
  function rollDeals() {
    const L = ensure(), d = day(); if (L.deals && L.deals.day === d) return L.deals;
    const n = has('dock') ? 3 : 2, pool = econ.INGREDIENTS.filter((g) => !g.supply || (g.id === 'kurkuma' || g.id === 'kaneel'));
    let s = d * 7919 + 13; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const offers = []; for (let k = 0; k < n; k++) { const g = pool[Math.floor(r() * pool.length)]; const kg = g.supply ? 30 : PALLET_KG; offers.push({ id: g.id, name: g.name, kg, off: 0.25 + Math.round(r() * 2) * 0.05, sold: false, who: ['Van Kruidenburg', 'a closing Lampas depot', 'an Abdavissies smuggler', 'Groothandel Peper & Zn'][Math.floor(r() * 4)] }); }
    return (L.deals = { day: d, offers });
  }
  const dealPrice = (o) => Math.round(econ.price(o.id, 'std') * (1 - o.off) * o.kg);
  function buyDeal(k, el, express) {
    const L = ensure(), o = rollDeals().offers[k]; if (!o || o.sold) return 'Gone.';
    if (!has('heftruck')) return 'You need a Heftruck to unload pallets.';
    const used = new Set(L.dock.map((p) => p.spot)), spot = [0, 1, 2].find((i) => !used.has(i));
    if (spot === undefined) return 'The dock is full: rack the pallets that are waiting first.';
    const cost = econ.expressCost(dealPrice(o), express); if (state.money < cost) return `Not enough Wilders (${fmt(cost)}).`;
    deps.addMoney(-cost, el); o.sold = true; L.dock.push({ id: o.id, name: o.name, kg: o.kg, spot, day: day() + (express ? 1 : econ.ORDER_DAYS) }); showDock(); if (deps.tip) deps.tip('order'); deps.save(); return null;
  }

  // ================================================================== Kaasdows tab
  const STAGE_NAME = ['', "Stage 1 · Dad's shed", 'Stage 2 · De Hal', "Stage 3 · Eddy's Groothandel"];
  function html() {
    const L = ensure(), B = boost(), j = L.job;
    let h = `<div class="well" style="margin-bottom:8px"><b>De Loods</b> · ${STAGE_NAME[stage()]} · Balance <b data-bal>${fmt(state.money)}</b><br>
      Pallet places <b>${econ.placesUsed()} / ${econ.places()}</b> (${econ.stockTotal()} / ${econ.cap()} kg · floor ${10 + (has('hal') ? 5 : 0) + (has('tent') ? 10 : 0)}, racking ${L.racks} bay${L.racks === 1 ? '' : 's'} × 6) · Each Naknik mixes <b>${econ.perNaknik()} kg</b> · Naknik places at home <b>${naknikCap()}</b>${B.q ? ' · blends <b>+½★</b>' : ''}<br>
      <small>Bouwbedrijf Gerrit &amp; Zonen builds one thing at a time. Building takes market days: they work while you raid, deliver or sleep.</small></div>`;
    if (j) { const u = UPGRADES.find((x) => x.id === j.id), left = Math.max(0, j.done - day()); h += `<div class="well" style="margin-bottom:8px;background:#ffffe0"><b>Under construction:</b> ${u.name}${u.repeat ? ` (bay ${L.racks + 1})` : ''} · ready in <b>${left}</b> market day${left === 1 ? '' : 's'}<br><small>Gerrit: "${['Nog effe, baas.', 'We are waiting for the concrete. And for coffee.', 'My nephew is on it. Mostly.', 'Two more days. Three. Dutch days.'][j.start % 4]}"</small></div>`; }
    h += '<table class="list"><tr><th>Upgrade</th><th>What it does</th><th>Cost</th><th>Build</th><th></th></tr>';
    for (const u of UPGRADES) {
      const w = why(u), cost = costOf(u), done = !u.repeat && has(u.id);
      const btn = done ? '<b style="color:#070">BUILT</b>' : j && j.id === u.id ? '<i>building…</i>' : w ? `<small style="color:#a00">${w}</small>` : `<button class="b95" data-build="${u.id}" ${j || state.money < cost ? 'disabled' : ''} data-need="${cost}">Build</button>`;
      h += `<tr><td><b>${u.name}</b>${u.repeat ? `<br><small>${L.racks}/${bayLimit()} bays</small>` : ''}${u.stage ? `<br><small>Stage ${u.stage}</small>` : ''}</td><td><small>${u.what}</small></td><td>${done ? '-' : fmt(cost)}</td><td>${u.days} day${u.days > 1 ? 's' : ''}</td><td>${btn}</td></tr>`;
    }
    h += '</table>';
    if (has('heftruck')) {
      const D = rollDeals();
      const on = ensure().autoFork !== false;
      h += `<div class="well" style="margin-top:8px"><b>Heftruck</b> · ${on ? `A Naknik drives it: he racks dock pallets by himself, and the night shift racks what's left after every outing.${(state.naknik || 0) ? '' : ' <i>(hire a Naknik first)</i>'}` : 'Only you drive it.'} <button class="b95" id="autofork">${on ? 'Drive it myself only' : 'Let a Naknik drive'}</button></div>`;
      h += `<div class="well" style="margin-top:8px"><b>Palletdeals</b> · market day ${D.day} · the truck drops them at the hall's dock (${L.dock.length}/3 places taken)<br><small>Bulk spice under the Kruidenbeurs price. The truck comes <b>two market days</b> after you buy (express: tomorrow, +${Math.round(econ.EXPRESS * 100)}%). It only counts as stock once you rack it with the heftruck, so make room first.</small></div>`;
      h += '<table class="list"><tr><th>Pallet</th><th>From</th><th>Price</th><th></th></tr>' + D.offers.map((o, k) => `<tr><td>${o.kg} kg <b>${o.name}</b> (Standaard)</td><td><small>${o.who}</small></td><td>${fmt(dealPrice(o))} <small style="color:#070">−${Math.round(o.off * 100)}%</small></td><td>${o.sold ? '<i>bought</i>' : `<button class="b95" data-deal="${k}" data-need="${dealPrice(o)}">Buy · 2 days</button> <button class="b95" data-deal="${k}:x" data-need="${econ.expressCost(dealPrice(o), true)}">Express ${fmt(econ.expressCost(dealPrice(o), true))}</button>`}</td></tr>`).join('') + '</table>';
      const here = L.dock.filter(landed), road = L.dock.filter((p) => !landed(p));
      if (here.length) h += `<p><small>Waiting at the dock: ${here.map((p) => `${p.kg} kg ${p.name}`).join(', ')}. Walk into De Hal and rack them (or let a Naknik do it).</small></p>`;
      if (road.length) h += `<p><small>On the truck: ${road.map((p) => `${p.kg} kg ${p.name} (day ${p.day})`).join(', ')}.</small></p>`;
    }
    h += '<p><small>Coming later, maybe: a delivery van fleet, a canteen that keeps the Naknikim happy, solar panels on the hall roof.</small></p>';
    return h;
  }
  function bind(body, rerender) {
    body.querySelectorAll('[data-build]').forEach((b) => b.onclick = () => { const m = order(b.dataset.build, b); deps.toast(m ? 'DE LOODS' : 'GERRIT IS ON IT', m || 'The crew arrives with a van full of tools and a radio. Go out and let them work.', 3); rerender(); });
    const af = body.querySelector('#autofork'); if (af) af.onclick = () => { const L = ensure(); L.autoFork = L.autoFork === false; if (!L.autoFork) autoStop(); deps.save(); rerender(); };
    body.querySelectorAll('[data-deal]').forEach((b) => b.onclick = () => { const [k, x] = b.dataset.deal.split(':'), m = buyDeal(+k, b, x === 'x'); deps.toast(m ? 'PALLETDEAL' : 'ON ITS WAY', m || `The truck drops the pallet at the dock of De Hal ${x === 'x' ? 'tomorrow morning' : 'in two days'}.`, 3); rerender(); });
  }

  // ================================================================== per frame
  let lastDay = -1, slotT = 0;
  function update(dt) {
    const L = ensure();
    const here = !deps.away() && hallHere(player.position); // walking in and out of the hall
    if (here !== inHall) { inHall = here; hall.userData.hi.visible = tent.userData.hi.visible = corr.userData.roof.visible = !here; if (here) { refreshSlots(); showDock(); } }
    if (deps.away() && F.drive) F.drive = false; // a mission or a drive took Eddy away
    if (L.job && day() >= L.job.done) finish();
    if (day() !== lastDay) { const first = lastDay < 0; lastDay = day(); showSite(); rollDeals(); showDock(); if (!first) { const n = nightShift(); if (n) deps.toast('NACHTPLOEG', `${crewName()} racked ${n} pallet${n > 1 ? 's' : ''} from the dock overnight.`, 3); } } // the morning truck may have dropped pallets
    slotT -= dt; if (slotT <= 0) { slotT = 1; refreshSlots(); }
    // machines run while Naknikim mix
    const on = (state.naknik || 0) > 0;
    if (on) { if (mixer1.visible) mixer1.userData.spin.rotation.y += dt * 3; if (mixer2.visible) mixer2.userData.spin.rotation.x += dt * 4; if (mill.visible) mill.userData.spin.rotation.y += dt * 1.2; if (table2.visible) table2.userData.bowl.rotation.y += dt * 2; if (table3.visible) table3.userData.bowl.rotation.y += dt * 2; }
    const li = inHall ? 2.4 : 0; for (const l of hall.userData.lights.concat(tent.userData.lights)) l.intensity += (li - l.intensity) * Math.min(1, dt * 4);
    // the heftruck
    if (fork.visible) {
      F.lift += (F.liftTo - F.lift) * Math.min(1, dt * 3);
      if (F.busy > 0) F.busy = Math.max(0, F.busy - dt);
      if (!F.drive) autoStep(dt);
      if (F.drive) {
        let th = 0, st = 0;
        if (!deps.frozen()) { if (keys.KeyW || keys.ArrowUp) th += 1; if (keys.KeyS || keys.ArrowDown) th -= 1; if (keys.KeyA || keys.ArrowLeft) st -= 1; if (keys.KeyD || keys.ArrowRight) st += 1; th -= virt.mz; st += virt.mx; }
        if (F.busy) th = 0;
        th = Math.max(-1, Math.min(1, th)); st = Math.max(-1, Math.min(1, st));
        const max = th >= 0 ? 4.2 : 2.4;
        if (Math.abs(th) > 0.1) F.v += th * 5 * dt; else F.v -= Math.sign(F.v) * Math.min(Math.abs(F.v), 6 * dt);
        F.v = Math.max(-max, Math.min(max, F.v));
        F.h -= st * 2.0 * dt * Math.max(-1, Math.min(1, F.v / 1.5));
        const f = fwd(), p = new THREE.Vector3(F.x + f.x * F.v * dt, 0, F.z + f.z * F.v * dt);
        // body circles: centre and nose
        const before = p.clone(); deps.collide(p, 0.72); const nose = p.clone().addScaledVector(f, 0.75), n0 = nose.clone(); deps.collide(nose, 0.5); p.add(nose.sub(n0));
        if (p.distanceTo(before) > 0.01) F.v *= 0.4;
        F.x = p.x; F.z = p.z;
        player.position.set(F.x - f.x * 0.25, 0.45, F.z - f.z * 0.25); player.rotation.y = F.h;
        fork.userData.beacon.material.emissive.setHex(Math.sin(performance.now() * 0.012) > 0 ? 0xff8000 : 0x301000);
      }
      placeFork();
    }
  }
  // ---- where the Naknikim work (js/naknikwork.js): the hall and tent floors, and spots to grab, rack and tip sacks (world coords)
  function workRooms() {
    const r = [];
    if (has('hal')) r.push({ x0: HX + HALL.x0, x1: HX + HALL.x1, z0: HZ + HALL.z0, z1: HZ + HALL.z1 }, { x0: DX - 0.85, x1: DX + 0.85, z0: HZ + HALL.z1 - 0.6, z1: -18.2 });
    if (has('tent')) r.push({ x0: HX + TENT.x0, x1: HX + TENT.x1 + 0.6, z0: HZ + TENT.z0, z1: HZ + TENT.z1 });
    return r;
  }
  function workStations() {
    const L = ensure(), out = [], area = (x, z) => (z > -19 ? 'shed' : x < HX + HALL.x0 ? 'tent' : 'hall');
    bays.forEach((b, i) => { // the two lower levels of every open bay: grab from a pallet, or put a sack on an empty beam
      if (i >= L.racks) return;
      const n = new THREE.Vector3(Math.sin(b.ry), 0, Math.cos(b.ry)), c = b.g.position;
      for (let si = 0; si < 4; si++) {
        const sx = si % 2 ? 0.66 : -0.66, lv = LEVELS[si >> 1], full = b.slots[si].visible;
        const p = new THREE.Vector3(c.x + b.dir.x * sx, 0, c.z + b.dir.z * sx), st = p.clone().addScaledVector(n, 1.05);
        // level 0: grab off the pallet at waist height, or put the sack on the floor beam / on top of the pallet; level 1: reach up
        const put = si < 2 ? (full ? lv + 1.32 : lv + 0.3) : full ? null : lv + 0.3;
        out.push({ key: `rack${i}:${si % 2}`, kind: 'rack', area: area(p.x, p.z), x: st.x, z: st.z, fx: p.x, fz: p.z, hg: si < 2 ? 'mid' : 'high', hs: si < 2 && !full ? 'floor' : 'high',
          grab: full, store: put !== null, put: put === null ? null : p.clone().addScaledVector(n, full ? 0.15 : 0.25).setY(put) });
      }
    });
    dockPallets.forEach((d, i) => { if (d.g.visible) { const [x, z] = DOCK_SPOTS[i]; out.push({ key: `dock${i}`, kind: 'pallet', area: 'hall', x: x - 1.05, z, fx: x, fz: z, h: 'mid', grab: true }); } });
    if (has('tent')) for (const k of [1, 4, 7]) { const x = HX + TENT.x0 + 0.9, z = HZ + TENT.z0 + 3.4 + k * 1.2; out.push({ key: `zwart${k}`, kind: 'pallet', area: 'tent', x: x + 1.15, z, fx: x, fz: z, h: 'mid', grab: true }); }
    for (const [t, ar] of [[table2, 'hall'], [table3, 'tent']]) if (t.visible) { const x = HX + t.position.x - 1.62, z = HZ + t.position.z - 0.9; out.push({ key: `pile${ar}`, kind: 'pile', area: ar, x: x - 0.85, z, fx: x, fz: z, h: 'floor', grab: true }); }
    if (mixer1.visible || mixer2.visible) out.push({ key: 'menger', kind: 'machine', area: 'shed', x: -3.2, z: -15.75, fx: -3.2, fz: -14.7, h: 'pour', pour: true, ty: 1.6 });
    if (mill.visible) out.push({ key: 'molen', kind: 'machine', area: 'shed', x: -6.3, z: -15.9, fx: -6.3, fz: -14.9, h: 'pour', pour: true, ty: 1.6 });
    return out;
  }

  apply();
  return {
    workRooms, workStations, hallAt: [HX, HZ],
    UPGRADES, ensure, boost, has, stage, naknikCap, html, bind, update, apply, order, finish, buyDeal, rollDeals, enterHall, leaveHall, getOn, getOff, forkAction,
    inside: () => inHall, driving: () => F.drive, fork: F, auto: A, nightShift, spots: () => SPOTS, bays, refreshSlots,
    camFocus: (p) => p.clone(), loaded: () => { F.drive = false; F.carry = null; carried.visible = false; apply(); },
  };
}
