// Goederenverkeer (Tristan 2026-11-27): now that the day has hours, goods come and go in timeslots.
//   INKOMEND  09:00 - 11:30  the Groothandel's truck with the spice orders that are due today. The kilos are on the
//                            truck until it is unloaded: only then are they on the shelves (js/economy.js dockIn/receive).
//   UITGAAND  16:00 - 18:30  Kaasland Koerier collects the blends for the joints.
// The Naknikim do the work once their shift has started (08:00): the more of them, the quicker. Eddy can lend a hand
// (E at the truck), and with nobody on the payroll he does all of it. A truck that stands there until the end of its
// slot costs wachtgeld. And some nights the driver is early: the phone rings at 05:30, the truck is at the door, the
// Naknikim are still in bed, and Eddy does it himself in his pyjamas for a night bonus, or lets it ring and pays.
// Until De Hal is built the trucks stop in front of the shed; after that they back up to the hall's dock door and the
// shed's roller door is bricked up to an ordinary door (js/main.js shedFront).
// state.goed = { day, in: job | null, out: job | null, lastNight }, job = { st: 'due' | 'here' | 'done', prog, kg, night }

export const SLOTS = { in: [9, 11.5], out: [16, 18.5], night: [5.5, 7.5] };
const WACHTGELD = 30, NACHT = 40, STEPS = 6;

// deps: THREE, scene, player, state, econ, klok, kit, lam, signTex, solid, addInteract, toast, beep, addMoney, dialogue, phone(),
//       naknik() -> how many are employed, hal() -> De Hal is built, inHall() -> Eddy is in it, front: { x, z }, dock: { x, z },
//       ready() (free play, tutorial done), busy(), save(), setHour(h), fmt(h) -> 'HH:MM'
export function createGoederen(deps) {
  const { THREE, scene, player, state, econ } = deps;
  const G = () => { const g = state.goed && typeof state.goed === 'object' ? state.goed : (state.goed = {}); if (g.in === undefined) g.in = null; if (g.out === undefined) g.out = null; return g; };
  const KIND = { in: { nm: 'INKOMEND', verb: 'lossen', who: 'Groothandel Peper & Zn', col: 0xe8862c, bg: '#e8862c', fg: '#ffffff' }, out: { nm: 'UITGAAND', verb: 'laden', who: 'Kaasland Koerier', col: 0x14499a, bg: '#14499a', fg: '#ffd23a' } };
  const blendKg = () => Object.values(econ.ensure().blends || {}).reduce((a, b) => a + ((b && b.kg) || 0), 0);
  const dockKg = () => (econ.dockIn ? econ.dockIn().reduce((a, o) => a + o.kg, 0) : 0);

  // ---- the trucks: a box truck with a tail lift (in front of the shed), or just its back in the hall's dock door
  function truck(kind) {
    const C = KIND[kind], g = new THREE.Group(), K = deps.kit(); g.visible = false; scene.add(g);
    K.box(1.9, 2.0, 2.3, 0xf4f4f0, 2.75, 1.45, 0); K.box(0.06, 0.8, 1.9, 0x1a2430, 3.72, 1.85, 0); K.box(0.3, 0.3, 2.34, 0x2a2c30, 3.6, 0.55, 0); // the cab
    K.box(5.2, 2.7, 2.4, C.col, -0.9, 2.05, 0); K.box(5.3, 0.14, 2.5, 0x2a2c30, -0.9, 0.62, 0); K.box(0.08, 2.5, 2.2, 0xd8dce2, -3.52, 2.0, 0); // the box, and its open back
    K.box(1.5, 0.08, 2.3, 0x8a8e94, -4.3, 0.34, 0); for (const s of [-1, 1]) K.box(0.06, 0.6, 0.06, 0xf2c31a, -5.0, 0.64, s * 1.1); // the tail lift, down
    for (const [x, z] of [[2.9, 1.05], [2.9, -1.05], [-1.6, 1.05], [-1.6, -1.05], [-2.5, 1.05], [-2.5, -1.05]]) K.cyl(0.46, 0.46, 0.3, 0x1b1b1c, x, 0.46, z, 14, Math.PI / 2);
    for (const s of [-1, 1]) { K.box(0.05, 0.16, 0.3, 0xff2a1a, -3.54, 0.95, s * 0.95); K.box(0.12, 0.12, 0.05, 0xffb41a, 3.74, 0.9, s * 0.9); }
    const m = K.build(); if (m) { m.castShadow = true; g.add(m); }
    const tex = deps.signTex([{ t: C.who.toUpperCase(), size: 46 }, { t: kind === 'in' ? 'specerijen · groot en klein' : 'vandaag besteld, vandaag geladen', size: 24, color: C.fg }], C.bg, C.fg, 512, 180);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.6), deps.lam({ map: tex })); p.position.set(-0.9, 2.2, s * 1.215); if (s < 0) p.rotation.y = Math.PI; g.add(p); }
    // what is on the lift: pallets of vaten (in) or of blue bags (out)
    const load = []; for (let i = 0; i < 4; i++) { const P = deps.kit(), px = -4.35 - (i >> 1) * 1.25, pz = (i % 2 ? 0.6 : -0.6);
      P.box(1.0, 0.12, 1.1, 0xb08a5a, px, 0.44, pz); if (kind === 'in') for (const [dx, dz] of [[-0.25, -0.27], [0.25, -0.27], [-0.25, 0.27], [0.25, 0.27]]) P.cyl(0.21, 0.21, 0.7, [0xc8a05a, 0xb88a48][(i + (dx > 0)) % 2], px + dx, 0.85, pz + dz, 10); else { P.box(0.9, 0.5, 1.0, 0x2f62b8, px, 0.75, pz); P.box(0.9, 0.06, 1.0, 0xf4f2ec, px, 1.03, pz); }
      const pm = P.build(); pm.castShadow = true; g.add(pm); load.push(pm); }
    return { g, load, sol: Object.assign(deps.solid(0, 0, 0, 0), { off: true }) };
  }
  const T = { in: truck('in'), out: truck('out') };
  const site = () => (deps.hal() ? { hall: true, x: deps.dock.x, z: deps.dock.z } : { hall: false, x: deps.front.x, z: deps.front.z });
  function show(kind, on) {
    const t = T[kind], s = site(); t.g.visible = on; t.sol.off = !on; if (!on) return;
    if (s.hall) { t.g.position.set(s.x + 4.6, 0, s.z); t.g.rotation.y = 0; Object.assign(t.sol, { minx: s.x + 0.6, maxx: s.x + 8.6, minz: s.z - 1.3, maxz: s.z + 1.3 }); } // backed up to the dock door, nose east
    else { t.g.position.set(s.x, 0, s.z); t.g.rotation.y = 0; Object.assign(t.sol, { minx: s.x - 3.6, maxx: s.x + 3.8, minz: s.z - 1.25, maxz: s.z + 1.25 }); }
  }
  const spot = () => { const s = site(); return s.hall ? new THREE.Vector3(s.x - 1.2, 0, s.z) : new THREE.Vector3(s.x - 4.6, 0, s.z - 1.9); }; // where Eddy stands to help
  const far = new THREE.Vector3(0, -99, 0);
  let lastHand = 0, active = null;
  const here = (k) => { const j = G()[k]; return j && j.st === 'here' ? j : null; };
  const cur = () => (here('in') ? 'in' : here('out') ? 'out' : null);
  deps.addInteract({ pos: () => (cur() && (!site().hall || deps.inHall()) ? spot() : far), r: 2.4, enabled: () => !!cur() && !deps.busy() && (!site().hall || deps.inHall()),
    label: () => { const k = cur(), j = G()[k]; return `${KIND[k].who} · ${KIND[k].verb} (${Math.round(j.prog * 100)}%)`; },
    act: () => { const k = cur(), j = G()[k], now = performance.now(); if (now - lastHand < 650) return; lastHand = now; j.prog = Math.min(1, j.prog + 1 / STEPS); j.hand = (j.hand | 0) + 1; deps.beep(k === 'in' ? 300 : 360, 0.07, 'square', 0.04); if (j.prog >= 1) finish(k, true); } });

  function arrive(k, night) {
    const j = G()[k]; j.st = 'here'; j.prog = 0; j.night = !!night; show(k, true); active = k;
    const n = deps.naknik(), slot = night ? SLOTS.night : SLOTS[k], where = site().hall ? 'at the dock of De Hal' : 'in front of the shed';
    if (!night) deps.toast(KIND[k].nm, `${KIND[k].who} is ${where} until ${deps.fmt(slot[1])}: ${Math.round(j.kg)} kg to ${k === 'in' ? 'unload' : 'load'}. ${n ? `The Naknikim are on it${n > 1 ? '' : ', slowly: there is only one'}. Lend a hand at the truck if you like.` : 'Nobody on the payroll: do it yourself at the truck.'}`, 6);
    deps.beep(196, 0.25, 'sawtooth', 0.04);
  }
  function finish(k, byEddy) {
    const j = G()[k], K = KIND[k]; j.st = 'done'; let bonus = 0, got = 0;
    if (k === 'in') got = econ.receive ? econ.receive() : 0;
    if (j.night) bonus += NACHT; else if (j.hand >= 3) bonus += 10; // the driver tips a man who carries his own vaten
    if (k === 'out') bonus += Math.min(40, Math.round(j.kg * 0.2)); // on time: the joints pay the freight
    if (bonus) deps.addMoney(bonus);
    deps.toast(k === 'in' ? 'GELOST' : 'GELADEN', k === 'in' ? `${Math.round(got || j.kg)} kg on the shelves.${bonus ? ` +W ${bonus}${j.night ? ' night bonus' : ' from the driver'}.` : ''}` : `${Math.round(j.kg)} kg of blend on its way to the joints. +W ${bonus}${j.night ? ' with the night bonus' : ' freight'}.`, 4.5);
    deps.beep(523, 0.12, 'triangle', 0.05); setTimeout(() => deps.beep(784, 0.2, 'triangle', 0.05), 140);
    leaveAt = 2.5; leaving = k; deps.save();
  }
  let leaving = null, leaveAt = 0;
  function timeout(k) {
    const j = G()[k], K = KIND[k];
    if (j.night) { j.night = false; j.st = 'due'; j.prog = 0; show(k, false); deps.addMoney(-WACHTGELD); deps.toast('TE LAAT', `${K.who} has gone. He is back at ${deps.fmt(SLOTS[k][0])}, and he charges the second trip: −W ${WACHTGELD}.`, 5); deps.save(); return; }
    j.st = 'done'; show(k, false); deps.addMoney(-WACHTGELD);
    if (k === 'in') { const got = econ.receive ? econ.receive() : 0; deps.toast('WACHTGELD', `Nobody came out. The driver stacked ${Math.round(got || j.kg)} kg on the pavement himself and wrote a bill: −W ${WACHTGELD}.`, 5); }
    else deps.toast('WACHTGELD', `The koerier waited until ${deps.fmt(SLOTS.out[1])} and left empty. The joints get their blend late tonight: −W ${WACHTGELD}.`, 5);
    deps.save();
  }

  // ---- a new market day: what is due, and whether the driver is early tonight
  function onDay(day) {
    const g = G(); g.day = day; for (const k of ['in', 'out']) show(k, false); leaving = null;
    if (!deps.ready()) { g.in = g.out = null; if (econ.receive) econ.receive(); return; }
    const kin = dockKg(), kout = blendKg();
    g.in = kin > 0 ? { st: 'due', prog: 0, kg: kin, night: false } : null;
    g.out = kout >= 5 ? { st: 'due', prog: 0, kg: Math.min(kout, 240), night: false } : null;
    const k = g.in ? 'in' : g.out ? 'out' : null;
    if (k && day - (g.lastNight || 0) >= 3 && (Math.random() < 0.3 || window.__goedNight)) { g.lastNight = day; nightCall(k); }
  }
  function nightCall(k) {
    const K = KIND[k], j = G()[k];
    deps.setHour(SLOTS.night[0]); arrive(k, true);
    const still = () => { const q = G()[k]; return q === j && q.st === 'here' && q.night; }; // (a call that comes through late is about nothing)
    const talk = () => still() && deps.dialogue([
      ['Chauffeur', k === 'in' ? `Meneer Eddy? ${K.who}. I am at your door with ${Math.round(j.kg)} kilo. Your men are not there. It is half past five, I know what time it is.` : `Kaasland Koerier. I am early, the ring was empty. You have ${Math.round(j.kg)} kilo for me or not?`],
      ['Eddy Jr.', 'It is the middle of the night.'],
      ['Chauffeur', `It is the start of my day. I wait until ${deps.fmt(SLOTS.night[1])}. After that I come back in my normal slot and you pay the second trip.`],
    ], () => deps.toast(K.nm + ' · 05:30', `The truck is ${site().hall ? 'at the dock of De Hal' : 'in front of the shed'} until ${deps.fmt(SLOTS.night[1])}. The Naknikim start at 08:00: do it yourself for a night bonus of W ${NACHT}, or go back to bed and pay W ${WACHTGELD}.`, 7));
    const missed = () => still() && deps.toast('GEMISTE OPROEP · 05:30', `${K.who} is ${site().hall ? 'at the dock' : 'at the door'} until ${deps.fmt(SLOTS.night[1])}. Night bonus W ${NACHT} if you ${K.verb === 'lossen' ? 'unload' : 'load'} it yourself.`, 6);
    const ph = deps.phone && deps.phone();
    if (!(ph && ph.ringWith && ph.ringWith('truck', { name: `Chauffeur · ${K.who}`, img: null, talk, missed }))) setTimeout(talk, 900);
  }
  function update(dt) {
    const g = G(); if (!deps.ready()) return;
    if (leaving) { if ((leaveAt -= dt) <= 0) { show(leaving, false); leaving = null; } }
    const h = deps.klok.hour(), n = deps.naknik();
    for (const k of ['in', 'out']) {
      const j = g[k]; if (!j) continue; const t = T[k];
      if (j.st === 'due' && h >= SLOTS[k][0] && h < SLOTS[k][1]) arrive(k, false);
      else if (j.st === 'due' && h >= SLOTS[k][1]) timeout(k); // Eddy was away all through the slot
      if (j.st !== 'here') continue;
      if (!t.g.visible) show(k, true); // (after a reload)
      if (n && !j.night && h >= 8) { j.prog = Math.min(1, j.prog + dt * 0.0105 * Math.min(4, n)); if (j.prog >= 1) { finish(k, false); continue; } }
      const left = k === 'in' ? Math.ceil((1 - j.prog) * 4 - 1e-6) : Math.ceil(j.prog * 4 - 1e-6); t.load.forEach((m, i) => { m.visible = i < left; });
      if (h >= (j.night ? SLOTS.night[1] : SLOTS[k][1])) timeout(k);
    }
  }
  // what the PC and the day strip can say about today
  function line() {
    const g = G(), out = [];
    for (const k of ['in', 'out']) { const j = g[k]; if (!j) continue; out.push(`${KIND[k].nm.toLowerCase()} ${deps.fmt(SLOTS[k][0])}–${deps.fmt(SLOTS[k][1])}: ${Math.round(j.kg)} kg ${j.st === 'done' ? '✓' : j.st === 'here' ? `(${Math.round(j.prog * 100)}%)` : ''}`); }
    return out.join(' · ');
  }
  return { onDay, update, line, SLOTS, trucks: T, state: G, site, nightCall, finish };
}
