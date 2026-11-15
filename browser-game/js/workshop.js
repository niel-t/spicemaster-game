// De Werkplaats: Eddy builds and repairs shoarma machines part by part, and upgrades his own Kaasdows XL PC.
// A machine is five slots (frame, burner, motor, core, two extras). The core decides what it is (grill, oven,
// frituur, slicer). Parts have to fit: power budget, motor torque against spit weight, burner heat against the
// core's need. The draaitest scores capacity (kg/hour), reliability and style; machine orders on the PC carry a
// spec to beat. Repair jobs bring in a broken machine with a symptom: test it, find the bad part, swap it.
// Everything lives in state.ws (saved by main.js). Orders and used-part offers are rolled from the market day,
// so a reload shows the same day.
import { MACHINES } from './economy.js';
import { PEOPLE, CLIENT_IDS, portrait } from './haggle.js';

export const SLOTS = [
  ['frame', 'Frame'], ['burner', 'Burner'], ['motor', 'Motor'], ['core', 'Spit / core'], ['x1', 'Extra'], ['x2', 'Extra'],
];
// slot: which slot it fits. pw: power the frame supplies (frames) or uses (the rest). rel: base reliability.
export const PARTS = [
  { id: 'f_klein', slot: 'frame', name: 'Counter frame', price: 120, power: 2, rel: 0.9, style: 0, note: 'Small, fits any snackbar counter' },
  { id: 'f_std', slot: 'frame', name: 'Standard frame', price: 220, power: 3, rel: 0.93, style: 1, note: 'What Dad sold for thirty years' },
  { id: 'f_dubbel', rank: 2, slot: 'frame', name: 'Double-spit frame, stainless', price: 480, power: 5, rel: 0.95, style: 2, capX: 1.15, note: 'Room and power for everything, +15% capacity' },
  { id: 'b_gas', slot: 'burner', name: 'Gas burner, 3 rings', price: 150, heat: 3, pw: 0, kind: 'gas', rel: 0.9, note: 'Needs no power' },
  { id: 'b_elek', slot: 'burner', name: 'Electric element', price: 180, heat: 3, pw: 2, kind: 'electric', rel: 0.95, note: 'Clean, steady, uses 2 power' },
  { id: 'b_infra', rank: 2, slot: 'burner', name: 'Infrared panel', price: 420, heat: 5, pw: 3, kind: 'infrared', rel: 0.93, note: 'Fierce heat, only on the double-spit frame' },
  { id: 'm_goedkoop', slot: 'motor', name: 'Wiper motor (used)', price: 60, torque: 20, pw: 1, rel: 0.75, note: 'Turns 20 kg, on a good day' },
  { id: 'm_std', slot: 'motor', name: 'Standard spit motor', price: 160, torque: 40, pw: 1, rel: 0.9, note: 'Turns up to 40 kg' },
  { id: 'm_zwaar', rank: 2, slot: 'motor', name: 'Heavy-duty spit motor', price: 340, torque: 70, pw: 2, rel: 0.96, note: 'Turns up to 70 kg' },
  { id: 'c_spit15', slot: 'core', type: 'grill', name: 'Spit, 15 kg', price: 80, weight: 15, cap: 15, need: 2, rel: 0.95, note: 'Small döner spit' },
  { id: 'c_spit30', slot: 'core', type: 'grill', name: 'Spit, 30 kg', price: 150, weight: 30, cap: 30, need: 3, rel: 0.95, note: 'The standard döner spit' },
  { id: 'c_spit60', rank: 3, slot: 'core', type: 'grill', name: 'Spit, 60 kg', price: 320, weight: 60, cap: 60, need: 5, rel: 0.94, note: 'Kebab palace size. Needs big heat and a big motor' },
  { id: 'c_steen', slot: 'core', type: 'oven', name: 'Pita stone', price: 140, weight: 0, cap: 20, need: 3, rel: 0.97, note: 'Makes it a pita oven' },
  { id: 'c_bak', slot: 'core', type: 'frituur', name: 'Fryer tank, 2 × 8 L', price: 120, weight: 0, cap: 18, need: 3, rel: 0.92, note: 'Makes it a frituur' },
  { id: 'c_mes', slot: 'core', type: 'snijder', name: 'Slicer blade, 30 cm', price: 110, weight: 10, cap: 25, need: 0, rel: 0.95, note: 'Makes it a meat slicer (no burner needed)' },
  { id: 'e_thermo', slot: 'x', name: 'Thermostat', price: 60, pw: 0, relB: 0.05, rel: 1, note: '+5 reliability' },
  { id: 'e_timer', slot: 'x', name: 'Timer switch', price: 40, pw: 0, relB: 0.03, rel: 1, note: '+3 reliability' },
  { id: 'e_vetbak', slot: 'x', name: 'Fat tray', price: 30, pw: 0, relB: 0.02, capB: 0.05, rel: 1, note: '+5% capacity, +2 reliability' },
  { id: 'e_chroom', rank: 1, slot: 'x', name: 'Chrome panels', price: 70, pw: 0, styleB: 1, rel: 1, note: '+1 style' },
  { id: 'e_led', rank: 1, slot: 'x', name: 'LED sign "SHOARMA"', price: 90, pw: 1, styleB: 2, rel: 1, note: '+2 style, uses 1 power' },
  { id: 'e_spy', slot: 'x', name: 'Spy module (Mo)', price: 250, pw: 0, rel: 1, spy: true, idea: 'spion', note: 'Deliver it inside a machine: a free floor plan for a Nachtklus' },
];
const P = (id) => PARTS.find((p) => p.id === id);
const fitsSlot = (p, slot) => (slot === 'x1' || slot === 'x2' ? p.slot === 'x' : p.slot === slot);
// what each machine type needs besides frame and core
const NEEDS = { grill: { burner: true, motor: true }, oven: { burner: true }, frituur: { burner: true }, snijder: { motor: true } };
const TYPE_NAME = { grill: 'Döner grill', oven: 'Pita oven', frituur: 'Frituur', snijder: 'Meat slicer' };
const SYMPTOM = {
  frame: 'The whole thing wobbles. There is a crack in a weld.',
  burner: 'It never gets hot. The meat just stays grey and sad.',
  motor: 'The spit stops after five minutes, then hums.',
  core: 'Something is bent and scrapes every time it turns.',
  x1: 'It clicks off at random, mid-rush.', x2: 'It clicks off at random, mid-rush.',
};
// clients are Tristan's cast (js/haggle.js): the shoarma bosses and Gerrit from the pancake house (ovens and fryers only)
const clientsFor = (type) => CLIENT_IDS.filter((id) => !PEOPLE[id].types || PEOPLE[id].types.includes(type));
const whoName = (o) => (o.cid && PEOPLE[o.cid] ? `${PEOPLE[o.cid].name} · ${PEOPLE[o.cid].place}` : o.who);
// Kaasdows XL upgrades: each part makes one PC tab better
export const PC_PARTS = [
  { id: 'ram', rank: 1, name: '32 MB memory', price: 900, text: 'The Klusbord shows one more job every day, from the next market day.' },
  { id: 'modem', rank: 2, name: '56k modem', price: 700, text: "The Kruidenbeurs prints tomorrow's market rumour for free." },
  { id: 'cpu', rank: 2, name: 'Kruidium II, 300 MHz', price: 1200, text: 'The workbench shows a live draaitest preview while you pick parts.' },
  { id: 'gpu', rank: 3, name: 'Kaasdows 3D card', price: 1500, text: 'The Map of Kaasland shows your control % on every territory you hold.' },
];

const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hashStr = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BOLTS = 4;
const RANK_NAMES = ['Hulpje', 'Mengmeester', 'Kruidenhandelaar', 'Kruidenbaron', 'Spice Master'];
const SYMPTOM_SHORT = { frame: 'cracked weld', burner: 'dead burner', motor: 'stalling motor', core: 'bent spit', x1: 'random cut-out', x2: 'random cut-out' };

// deps: state, econ, addMoney(n, el), toast(title, text, sec), save(), haggle (js/haggle.js, optional)
export function createWorkshop(deps) {
  const { state, econ } = deps;
  const rank = () => (deps.rank ? deps.rank() : 9), locked = (p) => rank() < (p.rank || 0);
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

  function ensure() {
    const w = state.ws && typeof state.ws === 'object' ? state.ws : (state.ws = {});
    w.parts = Array.isArray(w.parts) ? w.parts.filter((p) => p && P(p.id)) : [];
    w.bench = w.bench && typeof w.bench === 'object' ? w.bench : {};
    w.bench.slots = w.bench.slots || {}; w.bench.bolts = +w.bench.bolts || 0;
    w.pc = w.pc || {}; w.built = +w.built || 0; w.repaired = +w.repaired || 0;
    if (!w.started) { // Dad's junk pile: enough loose parts for a first small grill
      w.started = true;
      w.parts.push({ id: 'f_klein', wear: 0.15 }, { id: 'b_gas', wear: 0.2 }, { id: 'm_goedkoop', wear: 0.1 }, { id: 'c_spit15', wear: 0.05 });
    }
    const day = econ.ensure().day;
    if (w.day !== day) roll(w, day);
    return w;
  }
  // the day's machine orders and Kaasplaats used parts, seeded by the market day
  function roll(w, day) {
    const r = rng32(hashStr(`ws#${day}`)), rp = (a) => a[Math.floor(r() * a.length)];
    const tier = clamp(Math.floor((w.built + w.repaired) / 3), 0, 3); // specs grow as Eddy gets better
    w.day = day; w.orders = []; w.offers = [];
    for (let i = 0; i < 2; i++) {
      const type = rp(['grill', 'grill', 'grill', 'oven', 'frituur', 'snijder']);
      const base = { grill: [15, 25, 35, 50], oven: [15, 18, 20, 22], frituur: [14, 16, 18, 20], snijder: [20, 22, 25, 27] }[type];
      const cap = base[clamp(tier + Math.floor(r() * 2) - (i ? 0 : 1), 0, 3)];
      const rel = 70 + Math.round(r() * (8 + tier * 4));
      const kind = type !== 'snijder' && r() < 0.35 ? rp(['gas', 'electric']) : null;
      const style = r() < 0.25 + tier * 0.1 ? 1 + Math.floor(r() * 2) : 0;
      const m = MACHINES.find((x) => x.id === type);
      const pay = Math.round((m.sell * (0.45 + 0.8 * cap / (type === 'grill' ? 60 : 30)) + (rel - 70) * 12 + style * 120 + (kind ? 60 : 0)) / 10) * 10;
      const cid = rp(clientsFor(type));
      w.orders.push({ n: i, type, cap, rel, kind, style, pay, cid, who: PEOPLE[cid].place, done: false });
    }
    { // one repair job a day: a full machine with one bad part
      const type = rp(['grill', 'grill', 'oven', 'frituur', 'snijder']);
      const set = fullSet(type, r);
      const bad = rp(Object.keys(set).filter((s) => s !== 'x2'));
      const cid = rp(clientsFor(type));
      w.orders.push({ n: 2, repair: true, type, set, bad, pay: Math.round((150 + r() * 200) / 10) * 10, cid, who: PEOPLE[cid].place, done: false });
    }
    const pool = PARTS.filter((p) => p.slot !== 'x' || r() < 0.5);
    for (let i = 0; i < 3; i++) { const p = rp(pool); w.offers.push({ n: i, id: p.id, wear: Math.round((0.1 + r() * 0.15) * 100) / 100, price: Math.round(p.price * (0.4 + r() * 0.2) / 5) * 5, sold: false }); }
  }
  function fullSet(type, r) { // a sensible set of parts for a machine type (used for repair jobs)
    const pick = (ids) => ids[Math.floor(r() * ids.length)];
    const core = { grill: pick(['c_spit15', 'c_spit30']), oven: 'c_steen', frituur: 'c_bak', snijder: 'c_mes' }[type];
    const set = { frame: { id: pick(['f_klein', 'f_std']), wear: 0.1 }, core: { id: core, wear: 0.1 } };
    if (NEEDS[type].burner) set.burner = { id: pick(['b_gas', 'b_elek']), wear: 0.1 };
    if (NEEDS[type].motor) set.motor = { id: core === 'c_spit30' ? 'm_std' : pick(['m_std', 'm_goedkoop']), wear: 0.1 };
    set.x1 = { id: pick(['e_thermo', 'e_timer', 'e_vetbak']), wear: 0 };
    if (set.frame.id === 'f_klein' && set.burner && set.burner.id === 'b_elek') set.burner.id = 'b_gas'; // keep it inside the power budget
    return set;
  }

  // ---- scoring: fit rules and the draaitest
  function evaluate(slots) {
    const s = (k) => slots[k] && P(slots[k].id), errs = [], warns = [];
    const frame = s('frame'), core = s('core'), burner = s('burner'), motor = s('motor');
    if (!frame) errs.push('No frame: nothing to bolt it to.');
    if (!core) errs.push('No spit or core: it doesn\'t know what machine it is yet.');
    const type = core ? core.type : null, need = type ? NEEDS[type] : {};
    if (type && need.burner && !burner) errs.push(`A ${TYPE_NAME[type].toLowerCase()} needs a burner.`);
    if (type && need.motor && !motor) errs.push(`A ${TYPE_NAME[type].toLowerCase()} needs a motor.`);
    const used = ['burner', 'motor', 'x1', 'x2'].reduce((a, k) => a + ((s(k) && s(k).pw) || 0), 0);
    if (frame && used > frame.power) errs.push(`Power: the parts want ${used}, the ${frame.name.toLowerCase()} gives ${frame.power}. The fuse blows.`);
    if (burner && burner.kind === 'infrared' && frame && frame.id !== 'f_dubbel') errs.push('The infrared panel only fits the double-spit frame.');
    if (motor && core && core.weight && motor.torque < core.weight) errs.push(`The ${motor.name.toLowerCase()} can't turn a ${core.weight} kg spit. It stalls.`);
    if (!errs.length && type) {
      const heatF = need.burner ? clamp(burner.heat / core.need, 0, 1) : 1;
      if (heatF < 1) warns.push(`Not enough heat for the ${core.name.toLowerCase()}: it only cooks at ${Math.round(heatF * 100)}%.`);
      const capB = ['x1', 'x2'].reduce((a, k) => a + ((s(k) && s(k).capB) || 0), 0);
      const cap = Math.round(core.cap * (frame.capX || 1) * heatF * (1 + capB));
      const mainParts = ['frame', 'burner', 'motor', 'core'].filter((k) => s(k));
      let rel = mainParts.reduce((a, k) => a + s(k).rel - (slots[k].wear || 0), 0) / mainParts.length;
      rel += ['x1', 'x2'].reduce((a, k) => a + ((s(k) && s(k).relB) || 0), 0);
      if (motor && core && core.weight && core.weight / motor.torque > 0.85) { rel -= 0.08; warns.push('The motor is working at its limit: it will wear out fast.'); }
      const broken = Object.keys(slots).find((k) => slots[k] && slots[k].broken);
      const style = frame.style + ['x1', 'x2'].reduce((a, k) => a + ((s(k) && s(k).styleB) || 0), 0);
      return { ok: true, type, cap, rel: clamp(Math.round(rel * 100), 5, 99), style, kind: burner ? burner.kind : null, errs, warns, broken };
    }
    return { ok: false, type, errs, warns };
  }
  function meets(t, o) { // does a test result meet an order's spec?
    if (!t || !t.ok || t.broken || t.type !== o.type) return false;
    const looseRel = t.rel - (BOLTS - ensure().bench.bolts) * 4;
    return t.cap >= o.cap && looseRel >= o.rel && (!o.kind || o.kind === t.kind) && t.style >= (o.style || 0);
  }
  const relNow = (t) => t.rel - (BOLTS - ensure().bench.bolts) * 4; // loose bolts cost reliability
  function value(t) { // what a finished machine is worth to a buyer
    const m = MACHINES.find((x) => x.id === t.type), typical = { grill: 30, oven: 20, frituur: 18, snijder: 25 }[t.type];
    return Math.round(m.sell * (0.5 + 0.3 * (t.cap / typical) + 0.4 * (relNow(t) / 100) + 0.05 * t.style) / 10) * 10;
  }

  // ---- bench actions
  function takePart(slot, idx) { // put inventory part idx into a slot (old part goes back to the shelf)
    const w = ensure(), b = w.bench, p = w.parts[idx];
    if (p && !fitsSlot(P(p.id), slot)) return;
    if (b.slots[slot]) { if (!b.slots[slot].broken) w.parts.push(b.slots[slot]); else scrap(b.slots[slot]); }
    if (p) { w.parts.splice(idx, 1); b.slots[slot] = p; } else delete b.slots[slot];
    b.bolts = 0; b.test = null; b.work = (b.work || 0) + 1;
  }
  function scrap(part) { const v = Math.max(5, Math.round(P(part.id).price * 0.08)); deps.addMoney(v); if (deps.toast) deps.toast('SCRAP', `The broken ${P(part.id).name.toLowerCase()} goes to the scrap man: +${fmt(v)}.`, 2.5); }
  function clearBench() {
    const w = ensure(), b = w.bench;
    if (b.repair != null) return 'Finish or hand back the repair first.';
    for (const k of Object.keys(b.slots)) if (b.slots[k]) w.parts.push(b.slots[k]);
    w.bench = { slots: {}, bolts: 0 };
  }
  function runTest() {
    const w = ensure(), b = w.bench, t = evaluate(b.slots);
    b.test = t; b.work = (b.work || 0) + 1;
    if (t.ok && t.broken) { b.test.symptom = SYMPTOM[t.broken]; b.test.suspect = t.broken; }
    return t;
  }
  function deliver(n, el) { // the machine is done: the client comes round and the haggling starts
    const w = ensure(), o = w.orders[n], b = w.bench;
    if (!o || o.done) return 'That order is gone.';
    let list, lev = 0;
    if (o.repair) {
      if (b.repair !== n) return 'This repair isn\'t on the bench.';
      const t = b.test; if (!t || !t.ok || t.broken) return 'Run the draaitest first: it has to run clean.';
      list = o.pay;
    } else {
      const t = b.test; if (!meets(t, o)) return 'The machine on the bench doesn\'t meet the spec yet (run the draaitest).';
      const bonus = t.cap >= o.cap * 1.2 && relNow(t) >= o.rel + 5 ? Math.round(o.pay * 0.2 / 10) * 10 : 0;
      list = o.pay + bonus; lev = bonus ? 1 : t.cap >= o.cap * 1.1 ? 0.5 : 0;
    }
    if (!deps.haggle || !o.cid || !PEOPLE[o.cid]) return pay(n, list, el); // old saves: a client without a face just pays
    const work = b.work || 0, effort = clamp((work - (o.repair ? 3 : 6)) / 8, 0, 1), lost = spentToday();
    const ask = Math.round((list * (1.15 + Math.random() * 0.12) + Math.min(lost * 0.5, list * 0.25)) / 10) * 10;
    const kind = o.repair ? 'repair' : TYPE_NAME[o.type].toLowerCase();
    const excuse = o.repair
      ? `"That ${SYMPTOM_SHORT[o.bad]} took me all night. Three test runs, Mo came by twice, I had to order parts${lost ? `. I'm ${fmt(lost)} down on parts today alone` : ''}."`
      : `"This took way longer than planned. The ${kind} fought me every bolt of the way${lost ? `, and I'm ${fmt(lost)} down on parts today` : ''}. That's extra hours."`;
    deps.haggle.open({ key: `ws:${w.day}:${n}`, tab: 'werk', who: o.cid, side: 'sell', list, leverage: lev,
      what: o.repair ? `Picks up their ${TYPE_NAME[o.type].toLowerCase()}, fixed. Job price ${fmt(o.pay)}.` : `Collects the ${kind} they ordered. Job price ${fmt(o.pay)}${list > o.pay ? ` + ${fmt(list - o.pay)} for beating the spec` : ''}.`,
      story: { label: o.repair ? '"It took all night..."' : '"It took way longer..."', line: excuse, ask, effort },
      note: `${work} bench actions on this job${lost ? ` · ${fmt(lost)} spent on parts today` : ''}. A long, honest-looking job makes the "took longer" story easier to believe.`,
      walk: o.repair ? null : 'Keep the machine', onDeal: (price) => pay(n, price) });
  }
  function pay(n, price, el) {
    const w = ensure(), o = w.orders[n]; if (!o || o.done) return;
    const spy = !o.repair && Object.values((w.bench && w.bench.slots) || {}).some((q) => q && P(q.id) && P(q.id).spy);
    o.done = true; deps.addMoney(price, el); w.bench = { slots: {}, bolts: 0 }; if (econ.addRep) econ.addRep(o.repair ? 40 : 80);
    if (spy) { const hs = state.heists || (state.heists = {}); hs.freePlans = (+hs.freePlans || 0) + 1; if (deps.toast) setTimeout(() => deps.toast('SPY MODULE', `The module in ${whoName(o)}'s machine is listening. You have a free floor plan on the Plannenbord.`, 4), 2500); }
    const name = whoName(o), diff = price - o.pay;
    const d = diff ? ` (${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))} on the job price)` : '';
    if (o.repair) { w.repaired++; if (deps.toast) deps.toast('REPAIRED', `${name} has their ${TYPE_NAME[o.type].toLowerCase()} back: +${fmt(price)}${d}.`, 3.5); }
    else { w.built++; if (deps.toast) deps.toast('MACHINE DELIVERED', `${name} pays ${fmt(price)}${d}. The Naknikim carry it over.`, 4); }
    if (deps.save) deps.save();
  }
  function stock(el) { // a finished build goes into the warehouse, for the machine trade (sell to your joints)
    const w = ensure(), b = w.bench, t = b.test;
    if (b.repair != null) return 'That machine belongs to a client.';
    if (!t || !t.ok || t.broken) return 'Run the draaitest first.';
    const e = econ.ensure(); e.machines[t.type] = (e.machines[t.type] || 0) + 1; w.built++;
    w.bench = { slots: {}, bolts: 0 };
    if (deps.toast) deps.toast('WERKPLAATS', `A home-built ${TYPE_NAME[t.type].toLowerCase()} is in the warehouse. Sell it to a joint under Kaasplaats.`, 3.5);
    if (deps.save) deps.save();
  }
  function startRepair(n) {
    const w = ensure(), o = w.orders[n];
    if (!o || !o.repair || o.done) return;
    const m = clearBench(); if (m) return m;
    w.bench = { slots: {}, bolts: BOLTS, repair: n };
    for (const [k, p] of Object.entries(o.set)) w.bench.slots[k] = { ...p, broken: k === o.bad ? true : undefined };
    w.bench.test = null;
  }
  function dropRepair() { // hand the broken machine back (no pay); swapped-in parts come back to the shelf
    const w = ensure(), b = w.bench, o = w.orders[b.repair]; if (b.repair == null) return;
    for (const [k, p] of Object.entries(b.slots)) if (p && !(o.set[k] && o.set[k].id === p.id && (o.set[k].wear || 0) === (p.wear || 0))) w.parts.push(p);
    w.bench = { slots: {}, bolts: 0 };
  }
  function spend(n) { const w = ensure(), day = econ.ensure().day; if (!w.spent || w.spent.day !== day) w.spent = { day, amt: 0 }; w.spent.amt += n; }
  const spentToday = () => { const w = ensure(); return w.spent && w.spent.day === econ.ensure().day ? w.spent.amt : 0; };
  function buyNew(id, el, price) {
    const p = P(id); if (locked(p)) return `Fenna: "That one is for ${RANK_NAMES[p.rank]} and up, sorry."`; price = price == null ? p.price : price; if (state.money < price) return 'Not enough Wilders.';
    deps.addMoney(-price, el); spend(price); ensure().parts.push({ id, wear: 0 }); if (deps.save) deps.save();
  }
  function haggleNew(id) { // Fenna at the Kaasland Auto Parts counter
    const p = P(id);
    deps.haggle.open({ key: `part:${id}`, tab: 'werk', who: 'fenna', side: 'buy', list: p.price, what: `New: ${p.name}. ${p.note}.`,
      story: { label: '"Dad\'s old account..."', line: '"Eddy & Zn always had a trade account here. Dad would want you to honour it. And the Lampas robbed me again."', ask: Math.round(p.price * 0.7 / 5) * 5, effort: 0.2 },
      walk: 'Leave it', onDeal: (price) => { const m = buyNew(id, null, price); if (m && deps.toast) deps.toast('KAASLAND AUTO PARTS', m, 2.5); } });
  }
  function buyUsed(n, el) {
    const w = ensure(), o = w.offers[n]; if (!o || o.sold) return; if (state.money < o.price) return 'Not enough Wilders.';
    deps.addMoney(-o.price, el); spend(o.price); o.sold = true; w.parts.push({ id: o.id, wear: o.wear }); if (deps.save) deps.save();
  }
  function sellPart(idx, el) { const w = ensure(), p = w.parts[idx]; if (!p) return; const v = Math.round(P(p.id).price * (0.35 - (p.wear || 0)) / 5) * 5; w.parts.splice(idx, 1); deps.addMoney(Math.max(5, v), el); if (deps.save) deps.save(); }
  function strip(type) { // take a stocked machine apart for used parts
    const e = econ.ensure(); if (!(e.machines[type] > 0)) return 'No such machine in the warehouse.';
    e.machines[type]--; if (!e.machines[type]) delete e.machines[type];
    const set = fullSet(type, Math.random), w = ensure(), got = [];
    for (const p of Object.values(set)) { const q = { id: p.id, wear: Math.round((0.1 + Math.random() * 0.15) * 100) / 100 }; w.parts.push(q); got.push(P(q.id).name); }
    if (deps.save) deps.save();
    return `Stripped: ${got.join(', ')}.`;
  }
  function buyPC(id, el) {
    const w = ensure(), p = PC_PARTS.find((x) => x.id === id); if (!p || w.pc[id]) return; if (locked(p)) return `Needs rank ${RANK_NAMES[p.rank]}.`; if (state.money < p.price) return 'Not enough Wilders.';
    deps.addMoney(-p.price, el); w.pc[id] = econ.ensure().day;
    if (deps.toast) deps.toast('KAASDOWS XL', `${p.name} installed. ${p.text}`, 4);
    if (deps.save) deps.save();
  }
  const hasPC = (id) => !!(state.ws && state.ws.pc && state.ws.pc[id]);

  // ---- the PC tab
  const partLabel = (p) => `${P(p.id).name}${p.wear ? ` <small>(worn ${Math.round(p.wear * 100)}%)</small>` : ''}`;
  function statLine(t, live) {
    if (!t) return '';
    if (!t.ok) return `<div style="color:#a00">${t.errs.map((x) => '✗ ' + x).join('<br>')}</div>`;
    const loose = BOLTS - ensure().bench.bolts;
    return `<b>${TYPE_NAME[t.type]}</b> · <b>${t.cap} kg/hour</b> · reliability <b>${relNow(t)}%</b>${loose ? ` <small style="color:#a00">(${loose} loose bolt${loose > 1 ? 's' : ''}: −${loose * 4})</small>` : ''} · style <b>${t.style}</b>${t.kind ? ` · ${t.kind}` : ''}${live ? '' : ` · worth about <b>${fmt(value(t))}</b>`}${t.warns.length ? `<br><small style="color:#a60">${t.warns.join(' ')}</small>` : ''}`;
  }
  function html() {
    if (econ.learn && !(econ.has && econ.has('werkplaats'))) setTimeout(() => econ.learn('werkplaats'), 300);
    const w = ensure(), b = w.bench, rep = b.repair != null ? w.orders[b.repair] : null;
    let h = `<style>@keyframes wsSpin{to{transform:rotate(360deg)}}.ws-spit{display:inline-block;width:34px;height:34px;border-radius:50%;background:repeating-conic-gradient(#c2412d 0 30deg,#e8a33d 30deg 60deg);vertical-align:middle;margin-right:8px}.ws-spit.on{animation:wsSpin .6s linear infinite}.ws-bolt{width:30px;padding:4px 0}</style>`;
    h += `<div class="well"><b>De Werkplaats</b> · Dad's old junk corner, now a workbench · Built: <b>${w.built}</b> · Repaired: <b>${w.repaired}</b><br><small>Put parts in the slots, tighten the bolts, run the draaitest. A machine that beats an order's spec pays; a spare one goes to the warehouse for your joints. <i>Monteur Mo: "Heavy spit, heavy motor. And never trust a wiper motor."</i></small></div>`;
    // orders
    h += '<table class="list" style="margin-top:8px"><tr><th>Order (today)</th><th>Spec</th><th>Pays</th><th></th></tr>';
    for (const o of w.orders) {
      const spec = o.repair ? `<i>Repair.</i> ${TYPE_NAME[o.type]}: "${SYMPTOM[o.bad]}"` : `${TYPE_NAME[o.type]} · ≥ <b>${o.cap} kg/h</b> · ≥ <b>${o.rel}%</b> reliable${o.kind ? ` · <b>${o.kind}</b>` : ''}${o.style ? ` · style ≥ <b>${o.style}</b>` : ''}`;
      const act = o.done ? '<b style="color:#070">DONE</b>' : o.repair ? (b.repair === o.n ? `<button class="b95" data-wsdel="${o.n}">Hand it back fixed</button>` : `<button class="b95" data-wsrep="${o.n}">Put on bench</button>`) : `<button class="b95" data-wsdel="${o.n}" ${meets(b.test, o) ? '' : 'disabled'}>Deliver</button>`;
      const face = portrait(o.cid), pp = PEOPLE[o.cid];
      h += `<tr><td>${face ? `<img src="${face}" alt="" style="width:34px;height:38px;object-fit:cover;vertical-align:middle;margin-right:6px;border:1px solid #888">` : ''}<b>${pp ? pp.name : o.who}</b>${pp ? `<br><small>${pp.place}</small>` : ''}</td><td><small>${spec}</small></td><td>${fmt(o.pay)}</td><td>${act}</td></tr>`;
    }
    h += '</table>';
    // bench
    const live = hasPC('cpu') ? evaluate(b.slots) : null;
    h += `<div class="well" style="margin-top:8px"><b>Workbench</b>${rep ? ` · <span style="color:#a00">repair for ${rep.who}</span> <button class="b95" data-wsdrop>Hand back unfixed</button>` : ''}<table class="list" style="margin-top:6px">`;
    for (const [k, label] of SLOTS) {
      const cur = b.slots[k], opts = w.parts.map((p, i) => [p, i]).filter(([p]) => fitsSlot(P(p.id), k));
      const show = cur ? `${partLabel(cur)}` : '<i style="color:#888">empty</i>';
      h += `<tr><td style="width:90px"><b>${label}</b></td><td>${show}</td><td><select data-wsslot="${k}" style="max-width:230px"><option value="">${cur ? '— swap for… —' : '— pick a part —'}</option>${opts.map(([p, i]) => `<option value="${i}">${P(p.id).name}${p.wear ? ` (worn ${Math.round(p.wear * 100)}%)` : ''}</option>`).join('')}${cur ? '<option value="-1">(take it out)</option>' : ''}</select></td></tr>`;
    }
    h += '</table>';
    if (live) h += `<div style="margin-top:6px"><small>Kruidium II preview:</small> ${statLine(live, true)}</div>`;
    h += `<div style="margin-top:8px">Bolts: ${Array.from({ length: BOLTS }, (_, i) => `<button class="b95 ws-bolt" data-wsbolt="${i}" ${i < b.bolts ? 'disabled' : ''}>${i < b.bolts ? '✓' : '⚙'}</button>`).join(' ')} <button class="b95" data-wstest style="margin-left:12px"><span class="ws-spit"></span>Draaitest</button></div>`;
    if (b.test) h += `<div class="well" style="margin-top:8px">${b.test.symptom ? `<b style="color:#a00">It runs... badly.</b> ${b.test.symptom} <small>(which part does that? Swap it for a working one and test again. Mo: "Listen to the machine.")</small>` : statLine(b.test)}</div>`;
    if (!rep) h += `<div style="margin-top:8px"><button class="b95" data-wsstock ${b.test && b.test.ok && !b.test.broken ? '' : 'disabled'}>Put in the warehouse</button> <button class="b95" data-wsclear>Clear the bench</button></div>`;
    h += '</div>';
    // shelf
    h += `<div class="well" style="margin-top:8px"><b>Parts shelf</b> (${w.parts.length})<br>${w.parts.length ? w.parts.map((p, i) => `${partLabel(p)} <button class="b95" data-wssell="${i}" style="padding:1px 6px">sell</button>`).join(' · ') : '<i>empty</i>'}</div>`;
    const held = Object.entries(econ.ensure().machines).filter(([, n]) => n > 0);
    if (held.length) h += `<div class="well" style="margin-top:8px"><b>Strip for parts</b> · machines in your warehouse: ${held.map(([id, n]) => `<button class="b95" data-wsstrip="${id}">${TYPE_NAME[id]} (${n})</button>`).join(' ')}</div>`;
    h += '<table class="list" style="margin-top:8px"><tr><th>Used parts on Kaasplaats today</th><th>Price</th><th></th></tr>';
    for (const o of w.offers) h += `<tr><td>${P(o.id).name} <small>(worn ${Math.round(o.wear * 100)}%)</small></td><td>${fmt(o.price)}</td><td>${o.sold ? 'sold' : `<button class="b95" data-wsused="${o.n}">Buy</button>`}</td></tr>`;
    h += `</table><div class="well" style="margin-top:8px"><img src="${portrait('fenna')}" alt="" style="width:40px;height:44px;object-fit:cover;float:left;margin-right:8px;border:1px solid #888"><b>Kaasland Auto Parts</b> · Fenna at the counter${spentToday() ? ` · spent on parts today: <b>${fmt(spentToday())}</b>` : ''}<br><small>Pay the sticker price, or haggle. She has heard every story twice.</small><div style="clear:both"></div></div><table class="list"><tr><th>New parts</th><th>What it does</th><th>Price</th><th></th></tr>`;
    for (const p of PARTS.filter((q) => !q.idea || (econ.has && econ.has(q.idea)))) h += `<tr><td><b>${p.name}</b></td><td><small>${p.note}</small></td><td>${fmt(p.price)}</td><td style="white-space:nowrap">${locked(p) ? `<small style="color:#888">at rank ${RANK_NAMES[p.rank]}</small>` : `<button class="b95" data-wsnew="${p.id}">Buy</button>${deps.haggle ? ` <button class="b95" data-wshag="${p.id}">Haggle</button>` : ''}`}</td></tr>`;
    h += '</table><table class="list" style="margin-top:8px"><tr><th>Kaasdows XL upgrades</th><th>What it does</th><th>Price</th><th></th></tr>';
    for (const p of PC_PARTS) h += `<tr><td><b>${p.name}</b></td><td><small>${p.text}</small></td><td>${fmt(p.price)}</td><td>${w.pc[p.id] ? '<b style="color:#070">installed</b>' : locked(p) ? `<small style="color:#888">at rank ${RANK_NAMES[p.rank]}</small>` : `<button class="b95" data-wspc="${p.id}">Install</button>`}</td></tr>`;
    return h + '</table>';
  }
  function bind(body, rerender) {
    const msg = (m) => { if (m && deps.toast) deps.toast('WERKPLAATS', m, 2.5); rerender(); };
    body.querySelectorAll('[data-wsslot]').forEach((s) => s.onchange = () => { if (s.value === '') return; takePart(s.dataset.wsslot, +s.value); rerender(); });
    body.querySelectorAll('[data-wsbolt]').forEach((b) => b.onclick = () => { const w = ensure(); w.bench.bolts = Math.min(BOLTS, w.bench.bolts + 1); if (deps.beep) deps.beep(900 + w.bench.bolts * 120, 0.03); rerender(); });
    const t = body.querySelector('[data-wstest]');
    if (t) t.onclick = () => { const sp = t.querySelector('.ws-spit'); sp.classList.add('on'); t.disabled = true; if (deps.beep) deps.beep(180, 0.5, 'sawtooth', 0.03); setTimeout(() => { runTest(); if (deps.save) deps.save(); rerender(); }, 900); };
    body.querySelectorAll('[data-wsdel]').forEach((b) => b.onclick = () => msg(deliver(+b.dataset.wsdel, b)));
    body.querySelectorAll('[data-wsrep]').forEach((b) => b.onclick = () => msg(startRepair(+b.dataset.wsrep)));
    const d = body.querySelector('[data-wsdrop]'); if (d) d.onclick = () => { dropRepair(); rerender(); };
    const st = body.querySelector('[data-wsstock]'); if (st) st.onclick = () => msg(stock(st));
    const cl = body.querySelector('[data-wsclear]'); if (cl) cl.onclick = () => msg(clearBench());
    body.querySelectorAll('[data-wssell]').forEach((b) => b.onclick = () => { sellPart(+b.dataset.wssell, b); rerender(); });
    body.querySelectorAll('[data-wsstrip]').forEach((b) => b.onclick = () => msg(strip(b.dataset.wsstrip)));
    body.querySelectorAll('[data-wsused]').forEach((b) => b.onclick = () => msg(buyUsed(+b.dataset.wsused, b)));
    body.querySelectorAll('[data-wsnew]').forEach((b) => b.onclick = () => msg(buyNew(b.dataset.wsnew, b)));
    body.querySelectorAll('[data-wshag]').forEach((b) => b.onclick = () => { haggleNew(b.dataset.wshag); rerender(); });
    body.querySelectorAll('[data-wspc]').forEach((b) => b.onclick = () => msg(buyPC(b.dataset.wspc, b)));
  }
  return { ensure, evaluate, html, bind, hasPC, takePart, runTest, deliver, stock, startRepair, buyNew, buyPC, strip, meets, TYPE_NAME };
}
