// Spoedleveringen (Tristan 2026-11-27): "for quick delivery Eddy can either drive himself and transport, or ask Shooki to
// put in the effort. It requires you to load up the van in front of the loading dock and fill it with spices and deliver it
// to the customer, and do the unloading there."
//
// A spoed job on the Klusbord is now a run, not a button:
//   1. PACK   the kilos leave the shelf as blue bags (2,5 kg each) on a pallet at the loading door: inside the shed's roller
//             door, or at DOCK 1 of De Hal once it is built. The van backs up to that door. A goods truck on the spot comes
//             first: the van waits on its bay until the truck has gone.
//   2. LOAD   E at the pallet takes a bag, E at the open back doors puts it in. A Naknik comes out to help when there is one.
//   3. DRIVE  Eddy: the Oofmobiel down the street, the A10, afrit S109, into De Peperpijp (js/wijk.js), the old quarter round the
//             Albert Kuipmarkt where the spoed customers have their kitchens.
//   4. UNLOAD on the yellow laad- en losplek in front of the shop: bag by bag from the back doors to the shop door. Laden en
//             lossen takes its time, but not forever: handhaving writes a bon if the van stands there too long (or off the bay).
// Or Shooki: he backs his Kangoo up to the door instead and loads it himself (Eddy and a Naknik can help), drives off, and
// comes back a few hours later with the money, minus his cut, and a story. Eddy earns the full price and a tip for speed,
// and more reputation; Shooki costs a third and an afternoon, but Eddy's day stays free.
//
// state.spoed = { run: null | { n, day, cust, blend, kg, q, reward, bags, who: 'eddy'|'shooki', ph, taken, loaded, unloaded, site, fast },
//                 shooki: null | { cust, pay, back, say, n, day, reward } }
//   ph: 'wacht' (truck on the spot) → 'laden' → 'klaar' (Eddy: get in) → 'rit' → 'lossen' (De Peperpijp); Shooki: 'laden' → his slot

const BAG_KG = 2.5, SHOOKI_CUT = 0.3, SHOOKI_HOURS = 3, TICKET = 95, LAST_ORDER = 20.5;
const PIJP = 'pijp';
// the two vans in their own frame (nose +x): the back doors, the cargo opening, the box the solids use
const VEH = {
  oof: { rear: -2.94, w: 0.95, y0: 0.62, y1: 2.0, col: 0xe8eaec, sol: [1.15, 3.0, 3.3], name: 'Oofmobiel' },
  kangoo: { rear: -2.56, w: 0.84, y0: 0.56, y1: 1.58, col: 0xf2f2f0, sol: [0.9, 2.2, 2.2], name: 'Kangoo' },
};
// where the loading happens: the van's spot (x, z, heading), the pallet with the bags, and where Eddy stands to put a bag in
const SITES = {
  front: { name: 'the shed door', oof: [-4.75, -4.0, -Math.PI / 2], kangoo: [-4.75, -4.38, -Math.PI / 2], stage: [-2.1, -9.9], put: [-4.75, -7.85] },
  hall: { name: 'DOCK 1 of De Hal', oof: [14.0, -26.6, 0], kangoo: [13.62, -26.6, 0], stage: [9.7, -30.0], put: [10.25, -26.6] },
};
const KLANT = {
  'Grillroom Zuid': 'Mehmet', 'Restaurant De Lepel': 'Chef Joris', 'Kapsalon King': 'Kenan', 'Snackbar Bij Henk': 'Henk',
  'Eetcafé Het Kuipje': 'Marleen', 'Toko Sranang': 'Tante Wilma', 'Shoarma Ferdinand Bol': 'Yusuf', 'Nachtwinkel Abdel': 'Abdel',
};
const HELLO = ['Eindelijk, man! De grill staat al een uur koud.', 'Zet maar achterin, naast de frituur. Niet tegen de fietsen aan.', 'Spoed is spoed, hè. Mooi zo.', 'Ik dacht al: komt-ie nog, of moet ik de Lampas bellen?', 'Rustig met die zakken, jongen, dit is een keuken, geen sportschool.'];
const DURING = ['Nog eentje? Lekker.', 'Pas op voor de bakfiets!', 'Mijn schoonmoeder tilt sneller.', 'Ja ja, daar, bij de rest.'];
const THANKS = ['Top. Hier, contant. Niks tegen de Belastingdienst zeggen.', 'Lekker gewerkt. Doe je vader de groeten.', 'Volgende keer net zo snel, dan word je mijn vaste.', 'Mooi spul. Heel de Pijp gaat dit ruiken.'];
const SHOOKI_OUT = [
  { p: 0.55, m: 1, say: 'Done, bro. Customer happy, Kangoo happy, me happy. Here is your money. Minus my part. Family price.' },
  { p: 0.15, m: 0.8, say: 'Bro, the Ceintuurbaan was dicht. Forty minutes behind a tram. He paid less. Not my fault, the gemeente\'s fault.' },
  { p: 0.15, m: 1.12, say: 'He liked me so much he tipped, bro. I said it was for you. It is for you. Minus my part.' },
  { p: 0.15, m: 0.9, say: 'One bag ripped in the back. The Kangoo smells like shoarma now, forever. He paid for the rest.' },
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

// deps: THREE, scene, player, state, econ, klok, kit, lam, signTex, addInteract, toast, beep, choice, dialogue, addMoney, save, objective,
//       oof, oofSolid, kangoo, goederen, hal(), inHall(), fade(fn), route(x, z, label) | route(null), makeBag(id), makeNaknik(), makeShooki(),
//       passerBy(seed), animate(p, v, dt), naknik(), kangooOn(), shookiNpc, drive(o) -> bool, par, vanStats(), clamp(), wijk, riding(),
//       dismount(), ready() (free play, home, nothing in the way), away() (a mission or a trip), closePC(), fmtH(h), onDelivered(who)
export function createSpoed(deps) {
  const { THREE, scene, player, state, econ } = deps;
  const D = () => { const s = state.spoed && typeof state.spoed === 'object' ? state.spoed : (state.spoed = {}); if (s.run === undefined) s.run = null; if (s.shooki === undefined) s.shooki = null; return s; };
  const R = () => D().run;
  const V3 = (x, z, y = 0) => new THREE.Vector3(x, y, z), far = V3(0, -99, 0);
  const blendName = (id) => ((econ.BLENDS || []).find((b) => b.id === id) || { name: id }).name;
  const vehOf = (who) => (who === 'shooki' ? deps.kangoo : deps.oof);
  const site = () => SITES[R() && R().site] || SITES.front;
  const siteNow = () => (deps.hal() ? 'hall' : 'front');
  const truckAt = (s) => { const G = deps.goederen && deps.goederen.state(); if (!G) return null; const here = ['in', 'out'].find((k) => G[k] && G[k].st === 'here'); return here && (deps.goederen.site().hall ? 'hall' : 'front') === s ? here : null; };

  // ---- the vans in their bays, and on the loading spot
  const bay = { oof: { x: deps.oof.position.x, z: deps.oof.position.z, r: deps.oof.rotation.y }, kangoo: { x: deps.kangoo.position.x, z: deps.kangoo.position.z, r: deps.kangoo.rotation.y } };
  const solOf = (k) => (k === 'oof' ? deps.oofSolid : deps.kangoo.userData.solid);
  function put(k, x, z, r) {
    const o = k === 'oof' ? deps.oof : deps.kangoo, s = solOf(k), [hw, back, front] = VEH[k].sol; o.position.set(x, 0, z); o.rotation.y = r;
    const fx = Math.cos(r), fz = -Math.sin(r); // the nose, in the world
    const ax = [x - fx * back, x + fx * front], az = [z - fz * back, z + fz * front], side = (Math.abs(fx) > 0.5);
    Object.assign(s, side ? { minx: Math.min(...ax), maxx: Math.max(...ax), minz: z - hw, maxz: z + hw } : { minx: x - hw, maxx: x + hw, minz: Math.min(...az), maxz: Math.max(...az) });
  }
  const home = (k) => put(k, bay[k].x, bay[k].z, bay[k].r);
  const atDock = (k) => { const s = SITES[R().site][k]; put(k, s[0], s[1], s[2]); };

  // ---- back doors open, the cargo opening, and the bags inside (on any van: the trip vans and the district van are clones of
  // the Oofmobiel, so the overlay is found by name on whatever object carries it)
  function ov(obj, k) {
    let g = obj.getObjectByName('spoedOv');
    if (!g) {
      const v = VEH[k], h = v.y1 - v.y0, K = deps.kit(); g = new THREE.Group(); g.name = 'spoedOv'; g.visible = false; obj.add(g);
      K.box(0.03, h, v.w * 1.9, 0x18130e, v.rear - 0.015, v.y0 + h / 2, 0); K.box(0.06, 0.05, v.w * 1.9, 0x3a3e44, v.rear - 0.03, v.y0, 0); // the dark bay, the sill
      const m = K.build(); if (m) g.add(m);
      for (const s of [1, -1]) { // the two back doors, swung all the way round and flat against the sides (they clear a dock door)
        const dg = new THREE.BoxGeometry(0.05, h, v.w); dg.translate(0, 0, -s * v.w / 2);
        const d = new THREE.Mesh(dg, deps.lam({ color: v.col })); d.position.set(v.rear - 0.03, v.y0 + h / 2, s * (v.w + 0.06)); d.rotation.y = -s * (Math.PI / 2 + 0.08); d.castShadow = true; g.add(d);
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.06, h * 0.32, v.w * 0.7), deps.lam({ color: 0x2a3a48 })); win.position.set(0, h * 0.24, -s * v.w * 0.5); d.add(win);
      }
      for (let i = 0; i < 8; i++) { const b = deps.makeBag('kip'); b.name = 'spoedBag'; b.rotation.y = Math.PI / 2; b.scale.set(1, 1, 0.4); b.position.set(v.rear + 0.06, v.y0 + 0.11 + Math.floor(i / 2) * 0.19, (i % 2 ? 0.29 : -0.29) * v.w); b.visible = false; g.add(b); }
    }
    return g;
  }
  function showOv(obj, k, open, n, blend) {
    const g = ov(obj, k); g.visible = !!open; let i = 0;
    for (const c of g.children) if (c.name === 'spoedBag') { c.visible = i < n; if (blend && c.userData.set && c.userData.b !== blend) { c.userData.set(blend); c.userData.b = blend; } i++; }
  }
  // (a cloned bag loses its userData.set: give clones a way to repaint)
  const repaint = (g, blend) => { const ref = deps.makeBag(blend); for (const c of g.children) if (c.name === 'spoedBag') c.material = ref.material; };

  // ---- the pallet at the door with today's blue bags
  const stage = new THREE.Group(); stage.visible = false; scene.add(stage);
  { const K = deps.kit(); K.box(1.0, 0.12, 1.1, 0xb08a5a, 0, 0.1, 0); for (const dz of [-0.45, 0, 0.45]) K.box(1.0, 0.08, 0.1, 0x9a7a4a, 0, 0.04, dz); const m = K.build(); if (m) stage.add(m);
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.32), deps.lam({ map: deps.signTex([{ t: 'SPOED', size: 70 }], '#d8202a', '#ffffff', 256, 90), side: THREE.DoubleSide })); tag.position.set(0, 0.72, 0.56); stage.add(tag); stage.userData.tag = tag; }
  const stageBags = []; for (let i = 0; i < 8; i++) { const b = deps.makeBag('kip'); b.position.set(i % 2 ? 0.24 : -0.24, 0.24 + Math.floor(i / 4) * 0.19, (Math.floor(i / 2) % 2 ? 0.25 : -0.25)); stage.add(b); stageBags.push(b); }
  function showStage() {
    const r = R(), on = !!r && (r.ph === 'laden' || r.ph === 'wacht'); stage.visible = on; if (!on) return;
    const s = site(); stage.position.set(s.stage[0], 0, s.stage[1]);
    stageBags.forEach((b, i) => { b.visible = i < r.bags - r.taken; if (b.userData.b !== r.blend) { b.userData.set(r.blend); b.userData.b = r.blend; } });
  }

  // ---- Eddy's hands
  const held = new THREE.Group(); held.position.set(0, 1.0, 0.44); held.visible = false; player.add(held);
  const heldBag = deps.makeBag('kip'); held.add(heldBag);
  let hold = false;
  const setHold = (on, blend) => { hold = on; held.visible = on; if (on && blend && heldBag.userData.b !== blend) { heldBag.userData.set(blend); heldBag.userData.b = blend; } };

  // ---- helpers who carry: a Naknik from the loods, or Shooki himself
  const helpers = [];
  function helper(kind) {
    let h = helpers.find((q) => q.kind === kind);
    if (!h) { const p = kind === 'shooki' ? deps.makeShooki() : deps.makeNaknik(); if (!p.parent) scene.add(p); const bag = deps.makeBag('kip'); bag.position.set(0, kind === 'shooki' ? 1.0 : 0.72, 0.36); bag.visible = false; p.add(bag); h = { kind, p, bag, st: 'go', t: 0, sp: kind === 'shooki' ? 1.75 : 1.45 }; helpers.push(h); }
    return h;
  }
  function walkTo(h, x, z, dt) {
    const p = h.p.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
    if (d < 0.06) { deps.animate(h.p, 0, dt); return true; }
    const st = Math.min(d, h.sp * dt); p.x += dx / d * st; p.z += dz / d * st;
    const want = Math.atan2(dx, dz); h.p.rotation.y += Math.atan2(Math.sin(want - h.p.rotation.y), Math.cos(want - h.p.rotation.y)) * Math.min(1, dt * 9);
    deps.animate(h.p, h.sp, dt); return false;
  }
  function helpers0() { for (const h of helpers) { h.p.visible = false; h.bag.visible = false; h.st = 'go'; } }
  function runHelper(h, dt) {
    const r = R(), s = site(), A = [s.stage[0] + (h.kind === 'shooki' ? -0.75 : 0.75), s.stage[1] + 0.2], B = [s.put[0] + (h.kind === 'shooki' ? -0.55 : 0.55), s.put[1] - 0.1];
    if (!h.p.visible) { h.p.visible = true; h.p.position.set(A[0] + 0.6, 0, A[1] - 0.8); h.st = 'go'; }
    if (h.st === 'go') { if (walkTo(h, A[0], A[1], dt)) { if (r.taken < r.bags) { r.taken++; h.bag.visible = true; if (h.bag.userData.b !== r.blend) { h.bag.userData.set(r.blend); h.bag.userData.b = r.blend; } h.st = 'pick'; h.t = 0.55; showStage(); } else { h.st = 'idle'; } } }
    else if (h.st === 'pick') { deps.animate(h.p, 0, dt); if ((h.t -= dt) <= 0) h.st = 'carry'; }
    else if (h.st === 'carry') { if (walkTo(h, B[0], B[1], dt)) { h.st = 'drop'; h.t = 0.45; } }
    else if (h.st === 'drop') { deps.animate(h.p, 0, dt); if ((h.t -= dt) <= 0) { h.bag.visible = false; loadOne(h.kind); h.st = 'go'; } }
    else if (h.st === 'idle') { deps.animate(h.p, 0, dt); const want = Math.atan2(B[0] - h.p.position.x, B[1] - h.p.position.z); h.p.rotation.y += Math.atan2(Math.sin(want - h.p.rotation.y), Math.cos(want - h.p.rotation.y)) * Math.min(1, dt * 4); }
  }

  // ---- taking a job from the Klusbord
  function offer(j, el) {
    const D0 = D(), cust = j.cust || 'Grillroom Zuid', bags = Math.max(1, Math.ceil(j.kg / BAG_KG)), name = blendName(j.blend);
    if (D0.run) return `Finish the spoed for ${D0.run.cust} first.`;
    if (deps.klok.hour() >= LAST_ORDER) return `${cust}: "De keuken gaat zo dicht, jongen. Morgen weer." Too late for spoed today.`;
    if ((econ.blendOf(j.blend).kg || 0) < j.kg) return `You need ${j.kg} kg ${name} in stock (you have ${Math.floor(econ.blendOf(j.blend).kg || 0)}).`;
    const shk = deps.kangooOn(), sh = D0.shooki, sPay = Math.round(j.reward * (1 - SHOOKI_CUT));
    const backAt = deps.fmtH(Math.min(26.5, deps.klok.hour() + SHOOKI_HOURS + 0.5));
    setTimeout(() => { deps.closePC(); deps.choice('Spoed', `<b>${cust}</b>, De Peperpijp: ${j.kg} kg ${name}, ${bags} blue bags, today. <small>Load the van at ${SITES[siteNow()].name}, drive it there (A10, afrit S109) and unload at the kerb.</small>`,
      [`I'll drive it myself: ${fmt(j.reward)} + a tip for speed`, sh ? 'Ask Shooki (he is still out)' : shk ? `Ask Shooki: ${fmt(sPay)} for you, back ~${backAt}` : 'Ask Shooki (he has no van yet)', 'Not now'], (i) => {
        if (i === 0) take(j, 'eddy');
        else if (i === 1) { if (sh) deps.toast('SHOOKI', `"Bro, I am still on the road for ${sh.cust}. One thing at a time. I am not a robot. I am a businessman."`, 4); else if (!shk) deps.toast('SHOOKI', '"With what, bro? My feet? Get me a van first." (The Kangoo comes when Kipkruidenkwartier is yours.)', 4); else take(j, 'shooki'); }
      }); }, 60);
    return null;
  }
  function take(j, who) {
    if (who === 'eddy' && deps.clamp()) { deps.toast('WIELKLEM', 'There is a wheel clamp on the Oofmobiel. Get it off first (Garage Mo, or pay the fine at the van), or ask Shooki.', 4.5); return; }
    const got = econ.spoedTake(j); if (typeof got === 'string') { deps.toast('KLUSBORD', got, 3); return; }
    const e = econ.ensure(), r = D().run = { n: j.n, day: e.day, cust: j.cust || 'Grillroom Zuid', blend: j.blend, kg: j.kg, q: got.q, reward: j.reward, bags: Math.max(1, Math.ceil(j.kg / BAG_KG)), who, ph: 'wacht', taken: 0, loaded: 0, unloaded: 0, site: siteNow(), fast: false };
    j.run = who === 'eddy' ? 'Eddy is loading the Oofmobiel' : 'Shooki is loading the Kangoo';
    toDock(true);
    if (r.ph === 'wacht') deps.toast('SPOED · WACHTEN', `${truckAt(r.site) === 'in' ? 'Peper & Zn' : 'Kaasland Koerier'} is at ${SITES[r.site].name}. The ${VEH[vk(r)].name} backs up as soon as the truck has gone. Help unload it and it goes quicker.`, 5.5);
    deps.save(); deps.objective();
  }
  const vk = (r) => (r.who === 'shooki' ? 'kangoo' : 'oof');
  function toDock(first) {
    const r = R(); if (!r) return;
    r.site = siteNow(); if (truckAt(r.site)) { r.ph = 'wacht'; showStage(); return; }
    const go = () => {
      if (r.site === 'front' && deps.openDoor) deps.openDoor(); atDock(vk(r)); r.ph = 'laden'; showOv(vehOf(r.who), vk(r), true, r.loaded, r.blend); showStage();
      deps.route(SITES[r.site].stage[0], SITES[r.site].stage[1], 'spoed');
      deps.toast(r.who === 'eddy' ? 'SPOED · LADEN' : 'SHOOKI LAADT', r.who === 'eddy' ? `The Oofmobiel is backed up to ${SITES[r.site].name}. ${r.bags} blue bags on the SPOED pallet: <b>E</b> at the pallet, <b>E</b> at the back doors.${deps.naknik() ? ' A Naknik comes out to help.' : ''}` : `Shooki backs the Kangoo up to ${SITES[r.site].name} and starts carrying. ${r.bags} bags. Lend a hand and he is gone sooner.`, 5.5);
      deps.objective();
    };
    if (first && deps.fade) deps.fade(go); else go();
  }
  function loadOne(by) {
    const r = R(); if (!r || r.ph !== 'laden') return;
    r.loaded = Math.min(r.bags, r.loaded + 1); showOv(vehOf(r.who), vk(r), true, r.loaded, r.blend); deps.beep(by === 'eddy' ? 260 : 300, 0.08, 'triangle', 0.035);
    if (r.loaded >= r.bags) loaded(); else deps.objective();
    deps.save();
  }
  function loaded() {
    const r = R(); deps.route(null); showStage();
    if (r.who === 'shooki') { setTimeout(shookiGo, 900); return; }
    r.ph = 'klaar'; helpers0(); { const j = (econ.ensure().jobs || [])[r.n]; if (j && econ.ensure().day === r.day) j.run = 'Loaded: drive it to the customer'; }
    deps.toast('GELADEN', `${r.bags} bags in the Oofmobiel. Get in and drive to <b>${r.cust}</b> in De Peperpijp: the A10, afrit S109.`, 5);
    deps.beep(523, 0.1, 'triangle', 0.05); setTimeout(() => deps.beep(659, 0.16, 'triangle', 0.05), 120);
    deps.objective();
  }

  // ---- E at the pallet and at the back doors (the pallet stands inside: in the hall, only from inside the hall)
  const here = () => { const r = R(); return !!r && r.ph === 'laden' && !deps.away() && (r.site !== 'hall' || deps.inHall()); };
  deps.addInteract({ pos: () => (here() ? V3(site().stage[0], site().stage[1]) : far), r: 1.5, enabled: () => here() && !hold && R().taken < R().bags,
    label: () => `SPOED · take a bag (${R().bags - R().taken} on the pallet)`, act: () => { const r = R(); r.taken++; setHold(true, r.blend); showStage(); deps.beep(330, 0.06, 'triangle', 0.03); } });
  deps.addInteract({ pos: () => (here() ? V3(site().put[0], site().put[1]) : far), r: 1.6, enabled: () => here() && hold,
    label: () => `Put it in the ${VEH[vk(R())].name} (${R().loaded}/${R().bags})`, act: () => { setHold(false); loadOne('eddy'); } });

  // loaded: the van is outside the door, so E at the door (where the bags went in) gets Eddy behind the wheel too
  const klaarHere = () => { const r = R(); return !!r && r.who === 'eddy' && r.ph === 'klaar' && !deps.away() && (r.site !== 'hall' || deps.inHall()); };
  deps.addInteract({ pos: () => (klaarHere() ? V3(site().put[0], site().put[1]) : far), r: 1.8, enabled: klaarHere, label: () => vanLabel(), act: () => { vanAct(); } });
  // ---- the Oofmobiel's own E while a run is on (main.js asks before its map)
  function vanLabel() { const r = R(); if (!r || r.who !== 'eddy') return null; return r.ph === 'klaar' ? `Oofmobiel · drive the spoed to ${r.cust}` : r.ph === 'laden' ? `Oofmobiel · loading (${r.loaded}/${r.bags})` : r.ph === 'wacht' ? 'Oofmobiel · waiting for the truck to leave' : null; }
  function vanAct() {
    const r = R(); if (!r || r.who !== 'eddy') return false;
    if (r.ph === 'laden') { deps.toast('SPOED', `Load it first: ${r.loaded}/${r.bags} bags in. The SPOED pallet is at ${site().name}.`, 3); return true; }
    if (r.ph === 'wacht') { deps.toast('SPOED', 'The truck is on the loading spot. Help it along, the Oofmobiel backs up when it leaves.', 3); return true; }
    if (r.ph !== 'klaar') return false;
    if (deps.clamp()) return false; // main.js deals with the wheel clamp first
    showOv(deps.oof, 'oof', false, 0); home('oof');
    if (deps.away()) return true;
    deps.drive({ van: deps.vanStats(), from: 'Kipkruidenkwartier', to: 'De Peperpijp', theme: PIJP, noPay: true, arrived: `${r.cust} is waiting. Park on the yellow laad- en losplek.`,
      onDone: (res) => {
        const q = R(); if (!q) return; home('oof');
        if (res.pay) deps.addMoney(res.pay); // flitsers and claxon, nothing more: the customer pays the run
        if (res.arrived) { q.ph = 'lossen'; q.fast = res.time <= (deps.par || 1e9); q.parked = null; deps.save(); deps.wijk.enter(PIJP); }
        else { q.ph = 'klaar'; deps.toast('SPOED', `The bags are still in the van. ${q.cust} is waiting: get back in when you are ready.`, 4); deps.save(); deps.objective(); }
      } });
    if (!deps.driving()) { atDock('oof'); showOv(deps.oof, 'oof', true, r.loaded, r.blend); return true; }
    r.ph = 'rit'; deps.save(); return true;
  }

  // ---- De Peperpijp: the shop, the laad- en losplek, the customer at the door
  const bayG = new THREE.Group(); bayG.visible = false; scene.add(bayG);
  { const K = deps.kit(), Y = 0xf2c31a; for (const [w, d, x, z] of [[7.2, 0.14, 0, -1.05], [7.2, 0.14, 0, 1.05], [0.14, 2.2, -3.6, 0], [0.14, 2.2, 3.6, 0]]) K.box(w, 0.012, d, Y, x, 0.045, z);
    for (let i = -3; i <= 3; i++) K.box(0.1, 0.012, 1.4, Y, i * 0.9, 0.045, 0, 0, 0.7, 0);
    K.box(0.1, 2.6, 0.1, 0x8a8e94, 3.0, 1.3, -1.6); const m = K.build(); if (m) bayG.add(m);
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.1), deps.lam({ map: deps.signTex([{ t: 'P', size: 90 }, { t: 'laden en', size: 30 }, { t: 'lossen', size: 30 }, { t: 'max 15 min', size: 26 }], '#14499a', '#ffffff', 256, 312) })); sg.position.set(3.0, 2.3, -1.54); bayG.add(sg); }
  let cust = null, custName = null, shop = null, ticketed = false, lineT = 0;
  const vanW = () => deps.wijk && deps.wijk.vehicle && deps.wijk.vehicle();
  function onEnter(t) {
    if (t.key !== PIJP) { bayG.visible = false; if (cust) cust.visible = false; return; }
    const r = R(); shop = null;
    if (r && r.who === 'eddy' && (r.ph === 'klaar' || r.ph === 'rit' || r.ph === 'lossen')) { r.ph = 'lossen'; r.parked = null; }
    if (!r || r.ph !== 'lossen') { bayG.visible = false; if (cust) cust.visible = false; return; }
    shop = t.shops && (t.shops[r.cust] || Object.values(t.shops)[0]); if (!shop) return;
    bayG.visible = true; bayG.position.set(shop.kerb.x, 0, shop.kerb.z);
    if (!cust || custName !== r.cust) { if (cust) { cust.visible = false; } cust = deps.passerBy(r.cust.length * 31 + 7); if (!cust.parent) scene.add(cust); custName = r.cust; }
    cust.visible = true; cust.position.set(shop.door.x + 0.9, 0, shop.door.z - 0.2); cust.rotation.y = 0;
    ticketed = false;
    const W = vanW(); if (W) { const k = 'oof'; repaint(ov(W.obj, k), r.blend); showOv(W.obj, k, false, r.loaded - r.unloaded, r.blend); }
    deps.route(shop.kerb.x, shop.kerb.z, r.cust);
    setTimeout(() => deps.toast('DE PEPERPIJP · SPOED', `<b>${r.cust}</b> is down the street. Step into the Oofmobiel and park it on the yellow <b>laad- en losplek</b> in front of the shop. Then the bags go in, one by one.`, 6), 5200);
    deps.objective();
  }
  const inPijp = () => !!(deps.wijk && deps.wijk.active && deps.wijk.town && deps.wijk.town.key === PIJP);
  function rearOf(W) { const o = W.obj, lx = VEH.oof.rear - 0.55; return V3(o.position.x + Math.cos(o.rotation.y) * lx, o.position.z - Math.sin(o.rotation.y) * lx); }
  const lossen = () => { const r = R(); return !!r && r.ph === 'lossen' && inPijp() && !!shop; };
  const vanNear = () => { const W = vanW(); return !!W && Math.hypot(W.B.x - shop.door.x, W.B.z - shop.door.z) < 15; };
  deps.addInteract({ pos: () => (lossen() && R().parked && vanW() ? rearOf(vanW()) : far), r: 1.6, enabled: () => lossen() && !!R().parked && !hold && !deps.riding() && R().loaded - R().unloaded > 0 && vanNear(),
    label: () => `Take a bag out of the van (${R().loaded - R().unloaded} left)`, act: () => { const r = R(); setHold(true, r.blend); showOv(vanW().obj, 'oof', true, r.loaded - r.unloaded - 1, r.blend); deps.beep(330, 0.06, 'triangle', 0.03); } });
  deps.addInteract({ pos: () => (lossen() ? V3(shop.door.x, shop.door.z) : far), r: 1.9, enabled: () => lossen() && hold,
    label: () => `${R().cust} · in through the door (${R().unloaded + 1}/${R().bags})`, act: () => {
      const r = R(); setHold(false); r.unloaded++; deps.beep(240, 0.09, 'square', 0.03);
      if (r.unloaded >= r.bags) delivered(); else { if (Math.random() < 0.35) say(pick(DURING)); deps.objective(); }
      deps.save(); } });
  const say = (line) => deps.toast((KLANT[R().cust] || 'Klant').toUpperCase() + ' · ' + R().cust, `"${line}"`, 2.6);
  function delivered() {
    const r = R(), W = vanW(); if (W) showOv(W.obj, 'oof', false, 0);
    const quick = r.parked && (performance.now() - r.parked.t) / 1000 < 70;
    const tip = Math.round(r.reward * ((r.fast ? 0.15 : 0) + (quick ? 0.05 : 0)));
    const who = KLANT[r.cust] || 'De baas', line = (r.fast ? 'Dat was snel, man! ' : '') + pick(THANKS);
    D().run = null; deps.route(null); bayG.visible = false;
    deps.klok.pass(1.5); // there and back, and a coffee on the terrace
    econ.spoedPaid(r.n, r.day, r.reward + tip, 80, null, `${r.cust}: ${fmt(r.reward)}${tip ? ` + ${fmt(tip)} tip${r.fast ? ' (on time)' : ''}${quick ? ' (quick hands)' : ''}` : ''}. The A10 oprit is at the east end of the street.`);
    if (deps.onDelivered) deps.onDelivered('eddy');
    setTimeout(() => deps.dialogue([[`${who} · ${r.cust}`, line]]), 400);
    deps.objective();
  }
  function lossenTick(dt) {
    const r = R(), W = vanW(); if (!W) return;
    const inBay = Math.abs(W.B.x - shop.kerb.x) < 3.4 && Math.abs(W.B.z - shop.kerb.z) < 1.6, still = Math.abs(W.B.v) < 0.6;
    if (!r.parked && still && (inBay || (!deps.riding() && vanNear()))) { // parked: on the bay, or (Amsterdam) wherever it fitted
      if (deps.riding() === W) { if (!inBay) return; deps.dismount(); }
      r.parked = { t: performance.now(), bay: inBay }; showOv(W.obj, 'oof', true, r.loaded - r.unloaded, r.blend);
      deps.toast(inBay ? 'LADEN EN LOSSEN' : 'DUBBEL GEPARKEERD', inBay ? `On the bay. Back doors open: <b>E</b> at the back of the van, <b>E</b> at the door of ${r.cust}. ${r.bags - r.unloaded} bags.` : `Not on the bay, but it fits. Quick, before handhaving comes round the corner: <b>E</b> at the back of the van, <b>E</b> at the door.`, 5);
      if (Math.random() < 0.8) setTimeout(() => R() && say(pick(HELLO)), 2200);
      deps.objective();
    }
    if (r.parked && (deps.riding() === W || !vanNear())) { r.parked = null; setHold(false); showOv(W.obj, 'oof', false, 0); deps.objective(); } // drove off with the doors shut
    if (r.parked && !ticketed && (performance.now() - r.parked.t) / 1000 > (r.parked.bay ? 150 : 45)) {
      ticketed = true; deps.addMoney(-TICKET); deps.beep(880, 0.08, 'square', 0.04);
      deps.toast('HANDHAVING', r.parked.bay ? `"Laden en lossen is laden en lossen, meneer. Niet de hele middag." A bon under the wiper: −${fmt(TICKET)}.` : `"U staat dubbel geparkeerd, meneer. Op de rijbaan. In de Pijp." A bon under the wiper: −${fmt(TICKET)}.`, 5);
    }
    if (cust && cust.visible) { const dx = player.position.x - cust.position.x, dz = player.position.z - cust.position.z, want = dx * dx + dz * dz < 64 ? Math.atan2(dx, dz) : 0; cust.rotation.y += Math.atan2(Math.sin(want - cust.rotation.y), Math.cos(want - cust.rotation.y)) * Math.min(1, dt * 3); deps.animate(cust, 0, dt); }
  }

  // ---- Shooki's run
  let kDrive = null; // the Kangoo pulling away from the door
  function shookiGo() {
    const r = R(); if (!r || r.who !== 'shooki') return;
    let a = Math.random(), o = SHOOKI_OUT[0]; for (const x of SHOOKI_OUT) { if (a < x.p) { o = x; break; } a -= x.p; }
    const pay = Math.round(r.reward * o.m * (1 - SHOOKI_CUT));
    D().shooki = { cust: r.cust, pay, say: o.say, back: Math.min(26.5, deps.klok.hour() + SHOOKI_HOURS), n: r.n, day: r.day, reward: r.reward };
    const j = (econ.ensure().jobs || [])[r.n]; if (j && econ.ensure().day === r.day) j.run = `Shooki is on his way, back ~${deps.fmtH(D().shooki.back)}`;
    D().run = null; helpers0(); showOv(deps.kangoo, 'kangoo', false, 0); showStage();
    deps.toast('SHOOKI RIJDT', `"Yalla, bro. ${r.cust}, De Peperpijp. Back around ${deps.fmtH(D().shooki.back)}. Do not touch my parking spot." You get ${fmt(pay)} if all goes well.`, 5);
    if (r.site === 'front') kDrive = { t: 0, pts: [[-4.75, -4.38], [-4.75, -1.2], [-3.2, 2.0], [0, 3.0], [110, 3.1]] }; else { deps.kangoo.visible = false; deps.kangoo.userData.solid.off = true; }
    deps.save(); deps.objective();
  }
  function kTick(dt) {
    const k = kDrive, K = deps.kangoo; k.t += dt; const sp = Math.min(13, 1.2 + k.t * 2.4);
    const [x0, z0] = k.pts[0], [x1, z1] = k.pts[1], dx = x1 - x0, dz = z1 - z0, d = Math.hypot(dx, dz);
    let px = K.position.x + 0, pz = K.position.z + 0; const tx = x1 - px, tz = z1 - pz, rd = Math.hypot(tx, tz), st = sp * dt;
    if (rd <= st) { K.position.set(x1, 0, z1); k.pts.shift(); if (k.pts.length < 2) { K.visible = false; K.userData.solid.off = true; kDrive = null; return; } }
    else { K.position.x += tx / rd * st; K.position.z += tz / rd * st; }
    const want = Math.atan2(-(z1 - z0), x1 - x0) || 0; K.rotation.y += Math.atan2(Math.sin(want - K.rotation.y), Math.cos(want - K.rotation.y)) * Math.min(1, dt * 4); K.userData.solid.off = true;
    void d;
  }
  function shookiBack(overnight) {
    const s = D().shooki; if (!s) return; D().shooki = null;
    home('kangoo'); deps.kangoo.visible = deps.kangooOn(); deps.kangoo.userData.solid.off = !deps.kangoo.visible; kDrive = null;
    if (overnight) { setTimeout(() => deps.toast('SHOOKI', `"Bro, I came back late, you were asleep. Money is in the letterbox." ${fmt(s.pay)} from ${s.cust}, ${fmt(Math.round(s.reward * SHOOKI_CUT))} for him.`, 5), 5400); econ.spoedPaid(s.n, s.day, s.pay, 30, null, ''); }
    else econ.spoedPaid(s.n, s.day, s.pay, 30, null, `Shooki is back from ${s.cust}${overnight ? ' (he dropped the money in the letterbox last night)' : ''}: ${fmt(s.pay)} for you, ${fmt(Math.round(s.reward * SHOOKI_CUT))} for him.`);
    if (deps.onDelivered) deps.onDelivered('shooki');
    if (!overnight) setTimeout(() => deps.dialogue([['Shooki', s.say]]), 600);
    deps.objective();
  }

  // ---- a new market day: what was still at the door goes back on the shelf; Shooki always comes back
  function onDay() {
    const r = R();
    if (r && (r.ph === 'wacht' || r.ph === 'laden' || r.ph === 'klaar')) {
      econ.spoedBack(r.blend, r.kg, r.q); D().run = null; setHold(false); helpers0(); showOv(r.who === 'shooki' ? deps.kangoo : deps.oof, vk(r), false, 0); home(vk(r)); showStage(); deps.route(null);
      const cn = r.cust, kg = r.kg; setTimeout(() => deps.toast('SPOED VERLOPEN', `${cn} gave up and called the Lampas. The ${kg} kg went back on the shelf.`, 5), 5200); // (after the market-day toast)
    }
    if (D().shooki) shookiBack(true);
  }
  // after a reload: put things back where the run says they are
  let restored = false;
  function restore() {
    restored = true; const r = R(); if (!r) return;
    if (r.ph === 'rit' || r.ph === 'lossen') { r.ph = 'klaar'; r.parked = null; } // saved on the road: the bags are still in the van at home
    r.taken = r.loaded;
    if (r.ph === 'klaar') { home('oof'); return; }
    if (r.ph === 'laden') { atDock(vk(r)); showOv(vehOf(r.who), vk(r), true, r.loaded, r.blend); showStage(); }
    else showStage();
  }

  function update(dt) {
    if (!restored && deps.ready()) restore();
    const r = R(), s = D().shooki;
    if (kDrive) kTick(dt);
    if (s && !kDrive && deps.kangoo.visible && !deps.away()) { deps.kangoo.visible = false; deps.kangoo.userData.solid.off = true; }
    if (s && deps.ready() && !deps.away() && deps.klok.hour() >= s.back) shookiBack(false);
    if (!r) { if (hold && !inPijp()) setHold(false); if (helpers.some((h) => h.p.visible)) helpers0(); return; }
    if (r.ph === 'wacht' && deps.ready() && !truckAt(siteNow())) toDock(false);
    if (r.ph === 'laden') {
      if (deps.away()) { for (const h of helpers) h.p.visible = false; return; }
      if (r.who === 'shooki') runHelper(helper('shooki'), dt);
      const hr = deps.klok.hour(); if (deps.naknik() && hr >= 8 && hr < 22) runHelper(helper('naknik'), dt);
    } else if (helpers.some((h) => h.p.visible)) helpers0();
    if (r.ph === 'lossen' && lossen()) lossenTick(dt);
  }

  function objective() {
    const r = R(), s = D().shooki, sh = s ? ` <span style="color:#cfe8cf">Shooki is on his way to ${s.cust}, back ~${deps.fmtH(s.back)}.</span>` : '';
    if (!r) return s ? `<b style="color:#ffd36b">Spoed</b>: Shooki took the Kangoo to <b>${s.cust}</b> in De Peperpijp. Back around ${deps.fmtH(s.back)} with the money.` : null;
    const S0 = SITES[r.site].name;
    const t = r.ph === 'wacht' ? `the ${VEH[vk(r)].name} waits for the truck at ${S0} to leave. Help it along.`
      : r.ph === 'laden' ? (r.who === 'eddy' ? `load the Oofmobiel at ${S0}: <b>${r.loaded}/${r.bags}</b> bags (E at the SPOED pallet, E at the back doors).` : `Shooki loads his Kangoo at ${S0}: <b>${r.loaded}/${r.bags}</b>. Lend a hand if you like.`)
        : r.ph === 'klaar' ? `loaded. Get in the <b>Oofmobiel</b> and drive to <b>${r.cust}</b>, De Peperpijp (A10, afrit S109).`
          : r.ph === 'rit' ? `drive to <b>${r.cust}</b>, De Peperpijp.`
            : !r.parked ? `park on the yellow laad- en losplek in front of <b>${r.cust}</b>.` : `unload: <b>${r.unloaded}/${r.bags}</b> bags into ${r.cust}.`;
    return `<b style="color:#ffd36b">Spoed</b>: ${t}${sh}`;
  }
  return { helpers, offer, update, onDay, onEnter, objective, vanLabel, vanAct, kangooAway: () => !!D().shooki || kDrive != null, shookiBusy: () => !!D().shooki || (!!R() && R().who === 'shooki'), busy: () => !!R(), atDoor: () => !!R() && R().site === 'front' && (R().ph === 'laden' || R().ph === 'klaar'), holding: () => hold, state: D, SITES, BAG_KG };
}
