// Free roaming, step 1 (2026-11-26, a test): the home street no longer ends at the club and the showroom. It runs on
// into the three buurten of Kipkruidenkwartier as one continuous walk:
//   Uitjesbuurt (x -340..-220) | Spekbuurt (-220..-100) | Kipkruidenkade, the home street (-100..100) | Kroketkade (100..220)
// Each buurt is a "chunk": the same street cross-section (js/main.js streetPiece), its own shops, and the joint whose
// door starts that buurt's raid on foot (or a word with your client once it's yours).
// Streaming: a chunk is built the first time Eddy comes near, a few houses a frame so nothing hitches; it is hidden
// (no drawing, no matrix walk, no cutaway ray tests, collision boxes off) once he is far away and shown again when he
// comes back. Walkers, cyclists and traffic keep to a window around Eddy (js/main.js), so every stretch is as busy as
// the home street without one extra person or car.
// The top-down drive, the missions and the saves are untouched: this only adds street.

const NZ = -11.0002, SZoff = 0.0002; // a hair off the home rows, so these houses stay off the buurtkaart
export const CHUNKS = [
  { id: 'uitjesbuurt', name: 'Uitjesbuurt', a: -340, b: -220, seed: 61, joint: 'uitjesbuurt', jointSign: 'DE ZURE UI', jointAt: 8, end: -1, client: 'uitjesbuurt',
    signs: { 2: 'GROENTEBOER PREI', 5: 'UIENSOEP & CO', 12: 'AUGURKENKELDER', 15: 'DE HUILENDE UI', 18: 'ZUURKOOL & ZO' }, far: { 3: 'BROODJE UI', 9: 'TABAK & LOTTO', 14: 'STOMERIJ TRAAN' } },
  { id: 'spekbuurt', name: 'Spekbuurt', a: -220, b: -100, seed: 37, joint: 'spekbuurt', jointSign: 'SLAGER & SHOARMA', jointAt: 9, client: 'spekbuurt',
    signs: { 2: 'SLAGERIJ DE SPEKLAP', 5: 'ROOKWORST PALEIS', 13: 'POELIER KIPPETJE', 16: 'HET GEHAKTBALLETJE', 19: 'WORST & ZO' }, far: { 4: 'PARKEERBEHEER', 10: 'CAFE DE SPEKNEK', 15: 'SLIJTERIJ PROOST' } },
  { id: 'kroketkade', name: 'Kroketkade', a: 100, b: 220, seed: 83, joint: 'kroketkade', jointSign: 'SNACKBAR KROKETKADE', jointAt: 10, end: 1, client: 'kroketkade',
    signs: { 2: 'VISHANDEL DE HARING', 5: 'KROKETTENKONING', 7: 'UIT DE MUUR', 14: 'KIBBELING & CO', 17: 'TOUWSLAGERIJ ANKER' }, far: { 3: 'CAFE DE KADE', 8: 'BOOTVERHUUR', 13: 'FRITUUR DE MEEUW' } },
];
const NEAR = 95, FAR_HIDE = 150;
// the grid: the Komijnstraat one block north of the kade (z: garden wall, south pavement, road, parking strip, north pavement, houses)
// and the dwarsstraten that join them (x of their centre lines; each is 8 m between the house fronts)
export const BZ = { wall: -47.5, pS: -50, road: -56, bay: -58, pN: -60.5, house: -65 };
export const CROSS = [-330, -224, -104, 104, 210];
const CW = 4;

// deps: THREE, scene, player, state, streetPiece(a, b), house(...), spanWidths(len, k), solid(...), solids, fadeables, car(x, z, col, rot, solid),
//       box(...), lam, signTex, addInteract, busy(), SROW, RC, FAR, owns(id), raid(id), clientLine(id) -> [who, line] | null,
//       dialogue, choice, toast, setArea(text), canRoam(), low (phone), WALK, HOME: { x0, x1 }
export function createRoam(deps) {
  const { THREE, scene, player, state } = deps;
  const fresh = (c) => ({ ...c, st: 'none', steps: null, objs: [], sols: [], houses: [], built: 0, total: 0, vis: false, door: null });
  const chunks = CHUNKS.map(fresh);
  const homeBack = fresh({ id: 'komijnstraat', name: 'Kipkruidenkwartier', a: -100, b: 100, seed: 17, backOnly: true }); // the Komijnstraat behind the home street
  // ---- the grid behind the kade (Tristan 2026-11-26: "complete open world ... you can only drive one street"):
  // the Komijnstraat runs parallel to the kade, one block north, and five dwarsstraten join the two, so the buurten
  // are blocks you can walk and drive round. Built in the same streamed steps as the kade itself.
  const BACK_SIGNS = ['BAKKERIJ KOMIJN', 'FIETSENMAKER', 'WASSERETTE', 'AVONDWINKEL', 'CAFE DE NOOTMUSKAAT', 'KAPPER KNIP', 'TOKO PEPER', 'SNACKBAR DE HOEK', 'BLOEMEN', 'SLIJTERIJ'];
  const GARAGE = [0x2f6a3a, 0x1f4fa0, 0x8a2a22, 0xe8e2d0, 0x3a3a3a, 0xc8a020];
  const flat = (g, x0, x1, z0, z1, m, y, alongZ) => { // a strip of street: the texture runs along its length, like the kade's
    const len = alongZ ? z1 - z0 : x1 - x0, wid = alongZ ? x1 - x0 : z1 - z0, geo = new THREE.PlaneGeometry(len, wid), uv = geo.attributes.uv, k = len / 200;
    for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * k);
    const p = new THREE.Mesh(geo, m); p.rotation.x = -Math.PI / 2; if (alongZ) p.rotation.z = Math.PI / 2; p.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); p.receiveShadow = true; g.add(p); return p;
  };
  const cut = (a, b, half, min = 3) => { let out = [[a, b]]; for (const X of CROSS) out = out.flatMap(([p, q]) => (X + half <= p || X - half >= q ? [[p, q]] : [[p, X - half], [X + half, q]])); return out.filter(([p, q]) => q - p > min); };
  function backSteps(S, c) {
    const { a, b, seed } = c, L = b - a, cx = (a + b) / 2, low = deps.low, ST = deps.ST, W = 0xf4f2ec;
    S.push(() => { // the Komijnstraat itself: tarmac, a parking strip on the north side, klinker pavements
      const g = new THREE.Group(), K = deps.kit(), T = deps.kit();
      flat(g, a, b, -130, -70, deps.groundMat, 0);
      flat(g, a, b, BZ.road, BZ.pS, ST.road, 0.02); flat(g, a, b, BZ.bay, BZ.road, ST.bay, 0.022); flat(g, a, b, BZ.pN, BZ.bay, ST.paveN, 0.012); flat(g, a, b, BZ.pS, BZ.wall, ST.paveN, 0.012);
      for (const z of [BZ.bay - 0.1, BZ.pS + 0.1]) { const q = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, 0.18), deps.kerbMat); q.position.set(cx, 0.08, z); q.receiveShadow = true; g.add(q); }
      for (let x = a + 2; x < b; x += 4) K.box(2, 0.01, 0.12, W, x, 0.035, (BZ.road + BZ.pS) / 2);
      K.box(L, 0.01, 0.1, W, cx, 0.032, BZ.road);
      for (let x = a + 2.8; x < b; x += 5.6) K.box(0.1, 0.01, 1.9, W, x, 0.032, (BZ.bay + BZ.road) / 2);
      const km = K.build(); if (km) g.add(km);
      scene.add(g);
    });
    for (let sa = a; sa < b; sa += 40) S.push(() => { // lamps, lindens and Amsterdammertjes, a stretch at a time (so what is off screen is not drawn)
      const K = deps.kit(), T = deps.kit(), sb = Math.min(b, sa + 40), inS = (x) => x >= sa && x < sb;
      for (let x = a + 9; x < b; x += 18) if (inS(x)) deps.lamp(x, BZ.bay - 0.5, K);
      for (let x = a + 4; x < b; x += 13) if (inS(x) && CROSS.every((X) => Math.abs(x - X) > 5)) deps.tree(x, BZ.pS + 0.9, 0.8, T);
      for (let x = a + 1.4; x < b; x += 2.8) if (inS(x) && CROSS.every((X) => Math.abs(x - X) > 4.4)) deps.bollard(x, BZ.pS + 0.25, K);
      const km = K.build(), tm = T.build(); if (km) scene.add(km); if (tm) { tm.castShadow = !low; scene.add(tm); }
    });
    { let x = a, k = 0; for (const w of deps.spanWidths(L, seed + 11)) { const xx = x + w / 2, kk = k; // the north side: houses and corner shops
      S.push(() => { deps.house(xx, BZ.house, w, 9, 9 + ((kk + seed) % 4) * 1.1, 0, kk + seed + 6, kk % 4 === 1 ? BACK_SIGNS[(kk + seed) % BACK_SIGNS.length] : null, low ? { simple: true } : {}); }); x += w; k++; } }
    for (const [p0, q0] of cut(a, b, 13, 1)) for (let p = p0; p < q0; p += 50) S.push(() => { // the south side: the back of the kade's gardens, a long brick wall with garage doors and gates, trees over it
      const K = deps.kit(), T = deps.kit(), q = Math.min(q0, p + 50);
      {
        K.box(q - p, 2.3, 0.3, 0x8a4a3a, (p + q) / 2, 1.15, BZ.wall + 0.15); K.box(q - p, 0.1, 0.4, 0xcfc8b8, (p + q) / 2, 2.35, BZ.wall + 0.15);
        let i = Math.round(p);
        for (let x = p + 4; x < q - 1; x += 9, i++) {
          if (i % 3 === 2) { K.box(1.1, 1.9, 0.08, GARAGE[i % 6], x, 0.95, BZ.wall - 0.02); K.box(1.3, 0.12, 0.14, 0x4a2a22, x, 1.96, BZ.wall - 0.02); } // a garden gate
          else { K.box(2.7, 2.1, 0.08, GARAGE[(i * 5) % 6], x, 1.05, BZ.wall - 0.02); for (let r = 0; r < 4; r++) K.box(2.7, 0.03, 0.1, 0x1a1a1a, x, 0.4 + r * 0.5, BZ.wall - 0.03); K.box(3.0, 0.14, 0.5, 0x3a3c40, x, 2.5, BZ.wall + 0.2); } // a garage door under a flat roof
          if (i % 2 === 0 && !low) deps.tree(x + 4.5, BZ.wall + 2.6, 0.75, T);
        }
        deps.solid(p, q, BZ.wall, -37.6);
      }
      const km = K.build(), tm = T.build(); if (km) { km.castShadow = !low; scene.add(km); } if (tm) { tm.castShadow = true; scene.add(tm); }
    });
    S.push(() => { let k = seed; for (let x = a + 2.8; x < b - 3; x += 5.6) { k++; if ((k * 7) % (low ? 6 : 3) === 0) deps.car(x, (BZ.bay + BZ.road) / 2, null, (k % 2) * Math.PI, true); } }); // parked along the north kerb
    for (const X of CROSS) if (X > a && X < b) crossSteps(S, X, seed + Math.abs(X), low);
  }
  function crossSteps(S, X, seed, low) {
    const ST = deps.ST, z0 = BZ.wall, z1 = -15.5;
    S.push(() => { // a dwarsstraat: one lane of klinkers between two narrow pavements, from the kade to the Komijnstraat
      const g = new THREE.Group(), K = deps.kit();
      flat(g, X - 2.5, X + 2.5, BZ.pS, deps.RC - 5.0, ST.bay, 0.024, true);
      for (const s of [-1, 1]) { flat(g, X + s * 3.25 - 0.75, X + s * 3.25 + 0.75, z0, -7, ST.paveN, 0.014, true); const q = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, -7 - z0), deps.kerbMat); q.position.set(X + s * 2.5, 0.08, (z0 - 7) / 2); g.add(q); }
      for (let z = z0 + 6; z < -9; z += 14) deps.lamp(X - 3.3, z, K);
      for (let z = z0 + 2; z < -8; z += 2.6) deps.bollard(X + 2.75, z, K);
      const km = K.build(); if (km) g.add(km); scene.add(g);
    });
    for (const s of [-1, 1]) { let z = z0, k = 0; for (const w of deps.spanWidths(z1 - z0, seed + (s > 0 ? 3 : 0))) { const zz = z + w / 2, kk = k; // houses down both sides, facing the dwarsstraat
      S.push(() => { deps.house(X + s * 8.5, zz, w, 9, 9 + ((kk + seed) % 4) * 1.1, s < 0 ? Math.PI / 2 : -Math.PI / 2, kk + seed + 2, null, low ? { simple: true } : {}); }); z += w; k++; }
      S.push(() => { deps.solid(X + s * 4, X + s * 13, z0, z1); }); }
  }

  // ---- the plan of a chunk: the same list every time (so the joint's door is known before anything is built)
  function plan(c) {
    const L = c.b - c.a, north = [], south = []; let x = c.a, k = 0;
    cut(c.a, c.b, CW).forEach(([p, q], i) => { x = p; for (const w of deps.spanWidths(q - p, c.seed + i * 7)) { north.push({ x: x + w / 2, w, k }); x += w; k++; } });
    x = c.a; k = 0; for (const w of deps.spanWidths(L, c.seed + 5)) { south.push({ x: x + w / 2, w, k }); x += w; k++; }
    return { north, south };
  }
  for (const c of chunks) {
    c.plan = plan(c);
    const j = c.plan.north[Math.min(c.jointAt, c.plan.north.length - 1)]; c.jointHouse = j;
    c.door = { x: j.x + (j.w * 0.9 / 2 - 0.72), z: -5.9 }; // the shopfront's door is on the right (js/main.js shopfront)
    deps.addInteract({ pos: () => new THREE.Vector3(c.door.x, 0, c.door.z), r: 1.5, enabled: () => c.vis && c.st === 'done' && !deps.busy(),
      label: () => (deps.owns(c.joint) ? `${jointName(c)} · your client` : `${jointName(c)} · ${c.joint === 'spekbuurt' || deps.owns('spekbuurt') ? 'raid this joint' : 'Lampas joint'}`), act: () => knock(c) });
  }
  const jointName = (c) => c.jointSign.replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase()).replace('Snackbar Kroketkade', 'Snackbar Kroketkade');
  function knock(c) {
    const nm = jointName(c);
    if (deps.owns(c.joint) && !deps.retaken(c.joint)) { const l = deps.clientLine(c.client); deps.dialogue([l || [nm, 'Open for business. Your spice, our shoarma.']]); return; }
    if (state.step !== 'free' || !state.kit.includes('maboota')) { deps.toast(nm.toUpperCase(), 'Lampas inside. Get a weapon from The Russian first.', 3); return; }
    if (c.joint !== 'spekbuurt' && !deps.owns('spekbuurt')) { deps.toast(nm.toUpperCase(), 'Lampas turf. Take Spekbuurt first: their back office runs these streets.', 3.5); return; }
    deps.choice('Eddy Jr.', `${nm}. ${deps.retaken(c.joint) ? 'The Lampas took it back.' : 'The Lampas sell their watered-down spice here.'} Walk in and take it? <small>A raid takes the whole day.</small>`, ['Kick the door in', 'Not now'], (i) => { if (i === 0) { back = { x: c.door.x, z: c.door.z + 1.2 }; deps.raid(c.joint); } });
  }
  let back = null; // where Eddy stands again after a raid he walked into

  // ---- building, a step a frame
  function steps(c) {
    const S = []; if (c.backOnly) { backSteps(S, c); return S; }
    const { north, south } = c.plan, low = deps.low;
    S.push(() => { const g = deps.streetPiece(c.a, c.b); scene.add(g); });
    for (const h of north) S.push(() => {
      const joint = h === c.jointHouse, sign = joint ? c.jointSign : c.signs[h.k] || null;
      deps.house(h.x, NZ, h.w, 9, joint ? 10.5 : 9 + ((h.k + c.seed) % 4) * 1.1, 0, h.k + c.seed, sign); deps.solid(h.x - h.w / 2, h.x + h.w / 2, -15.5, -6.5);
    });
    for (const h of south) S.push(() => { deps.house(h.x, deps.SROW + SZoff, h.w, 8, 9 + ((h.k + c.seed) % 4), Math.PI, h.k + c.seed + 3, c.far[h.k] || null); });
    if (!low) { let x = c.a, i = 0; while (x < c.b) { const w = 5 + (i % 3), xx = x, ii = i; if (CROSS.every((X) => Math.abs(xx + w / 2 - X) > 13 + w / 2)) S.push(() => { deps.house(xx + w / 2, -25.5, w, 9, 10 + (ii % 4) * 1.2, 0, ii + c.seed, null, { simple: true }); }); x += w; i++; } }
    S.push(() => { // parked cars, thinner than on the home street
      let k = c.seed; for (let x = c.a + 2.8; x < c.b - 3; x += 5.6) for (const z of [deps.RC - 4, deps.RC + 4]) { k++; if ((k * 7) % (low ? 5 : 3) !== 0 || Math.abs(x - c.door.x) < 3.5 || (z < deps.RC && CROSS.some((X) => Math.abs(x - X) < 6))) continue; /* not across the mouth of a dwarsstraat */ deps.car(x, z, null, (k % 2) * Math.PI, true); }
    });
    if (c.end) S.push(() => { // where the street stops for now: roadworks
      const x = c.end > 0 ? c.b - 3 : c.a + 3, K = deps.kit();
      for (let z = -6; z <= deps.RC + 10.5; z += 2.4) { K.box(0.12, 1.0, 0.12, 0x8a8a8a, x, 0.5, z - 1.0); K.box(0.12, 1.0, 0.12, 0x8a8a8a, x, 0.5, z + 1.0); for (let q = 0; q < 4; q++) K.box(0.06, 0.22, 0.5, q % 2 ? 0xf4f2ec : 0xd8202a, x, 0.85, z - 0.75 + q * 0.5); }
      for (let z = deps.FAR.edge + 1; z <= deps.FAR.front - 0.5; z += 2.4) { K.box(0.12, 1.0, 0.12, 0x8a8a8a, x, 0.5, z - 1.0); for (let q = 0; q < 4; q++) K.box(0.06, 0.22, 0.5, q % 2 ? 0xf4f2ec : 0xd8202a, x, 0.85, z - 0.75 + q * 0.5); }
      const m = K.build(); if (m) scene.add(m);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.0), deps.lam({ map: deps.signTex([{ t: 'WEGWERKZAAMHEDEN', size: 40 }, { t: 'Kaasland bouwt verder', size: 24, color: '#1a1a1a' }], '#f2c31a', '#1a1a1a', 512, 196) }));
      sg.position.set(x - c.end * 0.2, 1.6, deps.RC); sg.rotation.y = c.end > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(sg);
    });
    backSteps(S, c);
    return S;
  }
  function buildStep(c) {
    if (!c.steps) { c.steps = steps(c); c.total = c.steps.length; c.st = 'building'; }
    const n0 = scene.children.length, s0 = deps.solids.length, f0 = deps.fadeables.length;
    try { c.steps[c.built](); } catch (e) { console.error('roam: ' + c.id + ' step ' + c.built, e); }
    c.built++;
    for (let i = n0; i < scene.children.length; i++) c.objs.push(scene.children[i]);
    for (let i = s0; i < deps.solids.length; i++) c.sols.push(deps.solids[i]);
    for (let i = f0; i < deps.fadeables.length; i++) c.houses.push(deps.fadeables[i]);
    if (c.built >= c.total) { c.st = 'done'; c.steps = null; }
  }
  function setVis(c, on) {
    if (c.vis === on) return; c.vis = on;
    for (const o of c.objs) if (!o.userData.moved) o.visible = on; // a car Eddy drove off in stays where he left it
    for (const s of c.sols) if (!s.moved) s.off = !on;
    const F = deps.fadeables;
    if (on) { for (const h of c.houses) if (!F.includes(h)) F.push(h); }
    else for (const h of c.houses) { const i = F.indexOf(h); if (i >= 0) F.splice(i, 1); }
  }
  const distTo = (c, x) => (x < c.a ? c.a - x : x > c.b ? x - c.b : 0);
  const regionAt = (x) => { const c = chunks.find((q) => x >= q.a && x < q.b); return c ? c.name : 'Kipkruidenkwartier'; };
  let lastArea = '', frame = 0, wasMission = false; const all = [homeBack, ...chunks];
  function update(dt, inMission) {
    if (inMission) { wasMission = true; return; }
    if (wasMission) { wasMission = false; lastArea = ''; if (back) { player.position.set(back.x, 0, back.z); back = null; if (deps.snapCam) deps.snapCam(); } }
    const on = deps.canRoam();
    deps.WALK.x0 = on ? chunks[0].a + 4 : deps.HOME.x0; deps.WALK.x1 = on ? chunks[chunks.length - 1].b - 4 : deps.HOME.x1; deps.WALK.z0 = on ? BZ.pN + 0.3 : -37.2;
    if (!on) { if (homeBack.st !== 'done') buildStep(homeBack); homeBack.vis = true; return; } // the Komijnstraat is the view behind the plot from day one
    const x = player.position.x; frame++;
    for (const c of all) {
      const d = distTo(c, x);
      if (d < NEAR) { if (c.st !== 'done' && (deps.low ? frame % 2 === 0 : true)) { buildStep(c); if (!c.vis) { c.vis = true; } } else if (c.st === 'done') setVis(c, true); }
      else if (d > FAR_HIDE && c.vis && c.st === 'done') setVis(c, false);
    }
    const a = regionAt(x); if (a !== lastArea) { lastArea = a; deps.setArea(`KAASLAND · ${a.toUpperCase()}`); if (a !== 'Kipkruidenkwartier') deps.toast(a.toUpperCase(), chunks.find((q) => q.name === a).joint && deps.owns(chunks.find((q) => q.name === a).joint) ? 'Your turf.' : 'Lampas turf.', 2.2); }
  }
  const stats = () => all.map((c) => ({ id: c.id, st: c.st, built: c.built, total: c.total, vis: c.vis, objs: c.objs.length, houses: c.houses.length }));
  function prebuild(id) { const c = all.find((q) => q.id === id); while (c && c.st !== 'done') buildStep(c); if (c) { c.vis = true; } return c; } // tests
  return { update, chunks, regionAt, stats, prebuild, setVis };
}
