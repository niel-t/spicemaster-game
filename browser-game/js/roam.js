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

// deps: THREE, scene, player, state, streetPiece(a, b), house(...), spanWidths(len, k), solid(...), solids, fadeables, car(x, z, col, rot, solid),
//       box(...), lam, signTex, addInteract, busy(), SROW, RC, FAR, owns(id), raid(id), clientLine(id) -> [who, line] | null,
//       dialogue, choice, toast, setArea(text), canRoam(), low (phone), WALK, HOME: { x0, x1 }
export function createRoam(deps) {
  const { THREE, scene, player, state } = deps;
  const chunks = CHUNKS.map((c) => ({ ...c, st: 'none', steps: null, objs: [], sols: [], houses: [], built: 0, total: 0, vis: false, door: null }));
  // ---- the plan of a chunk: the same list every time (so the joint's door is known before anything is built)
  function plan(c) {
    const L = c.b - c.a, north = [], south = []; let x = c.a, k = 0;
    for (const w of deps.spanWidths(L, c.seed)) { north.push({ x: x + w / 2, w, k }); x += w; k++; }
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
    const S = [], { north, south } = c.plan, low = deps.low;
    S.push(() => { const g = deps.streetPiece(c.a, c.b); scene.add(g); });
    for (const h of north) S.push(() => {
      const joint = h === c.jointHouse, sign = joint ? c.jointSign : c.signs[h.k] || null;
      deps.house(h.x, NZ, h.w, 9, joint ? 10.5 : 9 + ((h.k + c.seed) % 4) * 1.1, 0, h.k + c.seed, sign); deps.solid(h.x - h.w / 2, h.x + h.w / 2, -15.5, -6.5);
    });
    for (const h of south) S.push(() => { deps.house(h.x, deps.SROW + SZoff, h.w, 8, 9 + ((h.k + c.seed) % 4), Math.PI, h.k + c.seed + 3, c.far[h.k] || null); });
    if (!low) { let x = c.a, i = 0; while (x < c.b) { const w = 5 + (i % 3), xx = x, ii = i; S.push(() => { deps.house(xx + w / 2, -25.5, w, 9, 10 + (ii % 4) * 1.2, 0, ii + c.seed, null, { simple: true }); }); x += w; i++; } }
    S.push(() => { // parked cars, thinner than on the home street
      let k = c.seed; for (let x = c.a + 2.8; x < c.b - 3; x += 5.6) for (const z of [deps.RC - 4, deps.RC + 4]) { k++; if ((k * 7) % (low ? 5 : 3) !== 0 || Math.abs(x - c.door.x) < 3.5) continue; deps.car(x, z, null, (k % 2) * Math.PI, true); }
    });
    if (c.end) S.push(() => { // where the street stops for now: roadworks
      const x = c.end > 0 ? c.b - 3 : c.a + 3, K = deps.kit();
      for (let z = -6; z <= deps.RC + 10.5; z += 2.4) { K.box(0.12, 1.0, 0.12, 0x8a8a8a, x, 0.5, z - 1.0); K.box(0.12, 1.0, 0.12, 0x8a8a8a, x, 0.5, z + 1.0); for (let q = 0; q < 4; q++) K.box(0.06, 0.22, 0.5, q % 2 ? 0xf4f2ec : 0xd8202a, x, 0.85, z - 0.75 + q * 0.5); }
      for (let z = deps.FAR.edge + 1; z <= deps.FAR.front - 0.5; z += 2.4) { K.box(0.12, 1.0, 0.12, 0x8a8a8a, x, 0.5, z - 1.0); for (let q = 0; q < 4; q++) K.box(0.06, 0.22, 0.5, q % 2 ? 0xf4f2ec : 0xd8202a, x, 0.85, z - 0.75 + q * 0.5); }
      const m = K.build(); if (m) scene.add(m);
      const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.0), deps.lam({ map: deps.signTex([{ t: 'WEGWERKZAAMHEDEN', size: 40 }, { t: 'Kaasland bouwt verder', size: 24, color: '#1a1a1a' }], '#f2c31a', '#1a1a1a', 512, 196) }));
      sg.position.set(x - c.end * 0.2, 1.6, deps.RC); sg.rotation.y = c.end > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(sg);
    });
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
    for (const o of c.objs) o.visible = on;
    for (const s of c.sols) s.off = !on;
    const F = deps.fadeables;
    if (on) { for (const h of c.houses) if (!F.includes(h)) F.push(h); }
    else for (const h of c.houses) { const i = F.indexOf(h); if (i >= 0) F.splice(i, 1); }
  }
  const distTo = (c, x) => (x < c.a ? c.a - x : x > c.b ? x - c.b : 0);
  const regionAt = (x) => { const c = chunks.find((q) => x >= q.a && x < q.b); return c ? c.name : 'Kipkruidenkwartier'; };
  let lastArea = '', frame = 0, wasMission = false;
  function update(dt, inMission) {
    if (inMission) { wasMission = true; return; }
    if (wasMission) { wasMission = false; lastArea = ''; if (back) { player.position.set(back.x, 0, back.z); back = null; if (deps.snapCam) deps.snapCam(); } }
    const on = deps.canRoam();
    deps.WALK.x0 = on ? chunks[0].a + 4 : deps.HOME.x0; deps.WALK.x1 = on ? chunks[chunks.length - 1].b - 4 : deps.HOME.x1;
    if (!on) return;
    const x = player.position.x; frame++;
    for (const c of chunks) {
      const d = distTo(c, x);
      if (d < NEAR) { if (c.st !== 'done' && (deps.low ? frame % 2 === 0 : true)) { buildStep(c); if (!c.vis) { c.vis = true; } } else if (c.st === 'done') setVis(c, true); }
      else if (d > FAR_HIDE && c.vis && c.st === 'done') setVis(c, false);
    }
    const a = regionAt(x); if (a !== lastArea) { lastArea = a; deps.setArea(`KAASLAND · ${a.toUpperCase()}`); if (a !== 'Kipkruidenkwartier') deps.toast(a.toUpperCase(), chunks.find((q) => q.name === a).joint && deps.owns(chunks.find((q) => q.name === a).joint) ? 'Your turf.' : 'Lampas turf.', 2.2); }
  }
  const stats = () => chunks.map((c) => ({ id: c.id, st: c.st, built: c.built, total: c.total, vis: c.vis, objs: c.objs.length, houses: c.houses.length }));
  function prebuild(id) { const c = chunks.find((q) => q.id === id); while (c && c.st !== 'done') buildStep(c); if (c) { c.vis = true; } return c; } // tests
  return { update, chunks, regionAt, stats, prebuild, setVis };
}
