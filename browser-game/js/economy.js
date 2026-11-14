// Spice economy, step 1: De Kruidenbeurs (spice market) and the warehouse stock.
// A market day passes after every outing (a cleared mission or an Oofmobiel drive), the same clock Nabil uses.
// Prices drift every day, news events shake one ingredient up or down for a few days, and owned territories
// make the home market a little cheaper. Everything lives in state.econ, which main.js saves.
// Later steps (blends, clients, machines, territory control, faction heat) build on this module.

export const INGREDIENTS = [
  // id, name, base W/kg, daily supply in kg (null = unlimited), who controls it
  { id: 'paprika', name: 'Paprika', base: 6, supply: null, from: 'Open market' },
  { id: 'komijn', name: 'Komijn', base: 9, supply: null, from: 'Open market' },
  { id: 'knoflook', name: 'Knoflook', base: 5, supply: null, from: 'Open market' },
  { id: 'koriander', name: 'Koriander', base: 8, supply: null, from: 'Open market' },
  { id: 'kurkuma', name: 'Kurkuma', base: 11, supply: 40, from: 'Abdavissies (Kurkumaloods)' },
  { id: 'kaneel', name: 'Kaneel', base: 14, supply: 30, from: "Abdavissies (Kaneelsilo's)" },
  { id: 'kardemom', name: 'Kardemom', base: 28, supply: 15, from: 'Abdavissies (Kardemomdok)' },
  { id: 'saffraan', name: 'Saffraan', base: 90, supply: 3, from: 'Abdavissies (Saffraanpier)' },
];
export const GRADES = [
  { id: 'lampas', name: 'Lampas', mult: 0.6, stars: 1, note: 'cheap, diluted, smells of flour' },
  { id: 'std', name: 'Standaard', mult: 1, stars: 3, note: 'honest spice' },
  { id: 'bio', name: 'Bio', mult: 1.8, stars: 5, note: 'Noshgey Kariot artisanal, overpriced, very good' },
];
// Blends the Naknikim mix: kg of each ingredient per 10 kg of blend, and the blend's base value per kg.
export const BLENDS = [
  { id: 'kip', name: 'Kip Shoarma', mix: { paprika: 4, knoflook: 3, komijn: 3 }, value: 35, note: "Dad's classic. Every joint wants it." },
  { id: 'lams', name: 'Lams Shoarma', mix: { komijn: 3, koriander: 3, knoflook: 2, paprika: 2 }, value: 40, note: 'Earthy, for the lamb spit. Old-school clients love it.' },
  { id: 'kebab', name: 'Kebab Kruiden', mix: { paprika: 3, komijn: 2, koriander: 2, knoflook: 2, kaneel: 1 }, value: 60, note: 'Needs a pinch of Abdavissies kaneel.' },
  { id: 'gouden', name: 'De Gouden Mix', mix: null, value: 0, note: "The legendary blend. Eddy Sr.'s notebook holds the clues." },
];
const PER_NAKNIK = 10; // kg of blend each Naknik mixes per market day
const WHOLESALE_KG = 40;
// Clients: the joints Eddy owns (plus Schmatzel, Dad's oldest friend). Each orders one blend a day.
// kind: loyal (never complains), haggler (angles for discounts), late (pays a day or two late), picky (high minimum quality)
export const CLIENTS = [
  { id: 'schmatzel', name: 'Shoarma Schmatzel', blend: 'kip', kg: 8, minQ: 1, kind: 'loyal', who: 'Schmatzel' },
  { id: 'spekbuurt', name: 'Snackpaleis Spekbuurt', blend: 'kip', kg: 15, minQ: 2, kind: 'haggler', who: 'Manager Kees' },
  { id: 'kroketkade', name: 'Snackbar Kroketkade', blend: 'lams', kg: 10, minQ: 3, kind: 'picky', who: 'Frituurbaas Ruud' },
  { id: 'uitjesbuurt', name: 'Snackbar Uitjesbuurt', blend: 'kebab', kg: 8, minQ: 2, kind: 'late', who: 'Mevrouw Ui' },
];
const HAGGLES = [
  'Brother, this chicken spice makes my meat look sad, I no pay full today!',
  'My cousin sells paprika for half. Half! You give me discount or I call him.',
  'Customer said the shoarma tasted like Tuesday. You know what Tuesday tastes like? Discount.',
  'I pay you... next week. Or now, if 30% less. Your choice, my friend.',
];
const COMPLAINTS = ['This is Lampas quality! I can taste the flour!', 'My grill is crying. Better spice, or I go back to the Lampas.', 'Too much salt, not enough soul.']; // kg the Groothandel buys per day (clients pay better, from step 3)
const MISTAKES = ['Boss, I sneezed in the komijn.', 'I used the paprika as a pillow. Sorry.', 'I mixed in the dark. It is very... surprise.', 'The bowl fell. The floor is now Kip Shoarma.', 'I tasted to check. Then I tasted more.'];
// Shoarma machines: Eddy Sr.'s old trade. Buy used (Kaasplaats offers, rolled per day) or new (Van Kruidenburg),
// sell them to client joints. An installed machine makes that joint sell more shoarma, so it orders more spice.
export const MACHINES = [
  { id: 'grill', name: 'D\u00f6ner grill', used: 550, new: 1100, sell: 1400, vol: 0.4 },
  { id: 'oven', name: 'Pita oven', used: 380, new: 800, sell: 1000, vol: 0.2 },
  { id: 'frituur', name: 'Frituur', used: 300, new: 650, sell: 850, vol: 0.15 },
  { id: 'snijder', name: 'Vleessnijmachine', used: 200, new: 450, sell: 600, vol: 0.1 },
];
const MACHINE_CAP = 4; // machines the home warehouse can hold besides the spice
const CONDITION = ['a bit rusty', 'smells of 1994', 'one knob missing', 'like new (allegedly)', 'from a closed-down Lampas joint', 'Dad sold this one in 1998'];
export const STOCK_CAP = 200; // kg in the home warehouse
// Extra warehouses in the territories you own (Bible: buy warehouses in the districts you move into). Each adds space,
// a machine slot and two Naknik places, and steadies control there. A Naknik can stand guard against Lampas raids.
export const WAREHOUSES = [
  { id: 'kroketkade', name: 'Loods Kroketkade', cost: 6000, kg: 150, slots: 2, desc: 'An old fish store on the quay. Damp, but big.' },
  { id: 'uitjesbuurt', name: 'Kelder Uitjesbuurt', cost: 4500, kg: 100, slots: 2, desc: 'The onion cellar under De Zure Ui. Smells of onions forever.' },
  { id: 'spekbuurt', name: 'Opslag Spekbuurt', cost: 5000, kg: 120, slots: 2, desc: "The Snackpaleis' old storeroom, behind the gym." },
];
const WH_NAKNIK_COST = 450;
// Ranks: reputation (rep) comes from client sales, raids, S grades, jobs and retakes. Shown on the PC and the start menu.
export const RANKS = [[0, 'Hulpje'], [500, 'Mengmeester'], [1500, 'Kruidenhandelaar'], [4000, 'Kruidenbaron'], [10000, 'Spice Master']];
export const rankOf = (rep) => { let r = RANKS[0], i = 0; RANKS.forEach((x, k) => { if ((rep || 0) >= x[0]) { r = x; i = k; } }); return { name: r[1], i, next: RANKS[i + 1] || null }; };
const HISTORY = 8; // days of price history shown in the trend column
const CRATE_KG = 10; // a Lampas spice crate unpacks into 10 kg of Lampas-grade spice

const NEWS_UP = [
  (n) => `${n} harvest drowned in the Speltpolder floods`,
  (n) => `Abdavissies hold a ${n} shipment at Containerchaos`,
  (n) => `Hipsterheuvel discovers ${n} lattes, prices soar`,
  (n) => `${n} truck tipped over on the A-Kaas ring road`,
  (n) => `Kaasland Food Authority seizes "suspicious" ${n}`,
];
const NEWS_DOWN = [
  (n) => `Lampas dump cheap ${n} on every market`,
  (n) => `Record ${n} harvest, warehouses overflowing`,
  (n) => `${n} smuggler caught, his stock sold off cheap`,
  (n) => `Nobody wants ${n} this week, says Kaasplaats`,
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hashStr = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
// Daily events (one may roll each market day; they change the clients' orders for that day)
const EVENTS = [
  { id: 'pricewar', text: (b) => `The Lampas dump cheap ${b.name} on De Natte Worst: clients pay 25% less for it today`, pay: 0.75 },
  { id: 'kermis', text: () => 'Kermis in De Natte Worst! Every client orders 50% more today', vol: 1.5 },
  { id: 'feest', text: () => "Nabil throws a party at Schmatzel's: Schmatzel orders double today", vol: 2, only: 'schmatzel' },
  { id: 'regen', text: () => 'Three days of rain: nobody goes out, clients order 30% less today', vol: 0.7 },
];
const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// deps: state (the game state), addMoney(n, el), toast(title, text, sec), discount() -> 0..0.3, save()
export function createEconomy(deps) {
  const { state } = deps;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

  function ensure() {
    const e = state.econ && typeof state.econ === 'object' ? state.econ : (state.econ = {});
    e.day = +e.day || 1;
    e.raidsSeen = e.raidsSeen ?? (state.raids || 0); // a fresh economy on an old save doesn't count past raids
    e.mult = e.mult || {}; e.hist = e.hist || {}; e.stock = e.stock || {}; e.supply = e.supply || {};
    e.news = Array.isArray(e.news) ? e.news : [];
    e.blends = e.blends || {}; e.order = e.order || 'kip'; e.policy = e.policy || 'cheap';
    if (e.wholesaleLeft === undefined) e.wholesaleLeft = WHOLESALE_KG;
    e.trust = e.trust || {}; e.owed = Array.isArray(e.owed) ? e.owed : []; e.cards = Array.isArray(e.cards) ? e.cards : []; e.pause = e.pause || {};
    e.report = e.report || null; e.jobs = Array.isArray(e.jobs) ? e.jobs : null; e.event = e.event || null;
    e.wh = e.wh || {}; e.rep = +e.rep || 0;
    e.machines = e.machines || {}; e.installed = e.installed || {}; e.offers = Array.isArray(e.offers) ? e.offers : null;
    e.heat = e.heat || { lampas: 0 }; e.control = e.control || {}; e.retaken = e.retaken || {}; e.turfNews = Array.isArray(e.turfNews) ? e.turfNews : [];
    for (const g of INGREDIENTS) {
      if (!(e.mult[g.id] > 0)) e.mult[g.id] = 1;
      if (!Array.isArray(e.hist[g.id])) e.hist[g.id] = [e.mult[g.id]];
      if (g.supply && e.supply[g.id] === undefined) e.supply[g.id] = g.supply;
    }
    return e;
  }

  // one market day: drift, news, supply refills
  function advance(why) {
    const e = ensure();
    const made = mix(); // the Naknikim mix overnight with what's on the shelves
    const rep = deliver(); // then the clients get their orders and pay (the day report)
    const strikes = turf(); // the Lampas react to how much of their turf you hold
    e.day++; e.wholesaleLeft = WHOLESALE_KG; e.lastMix = made; e.report = rep;
    rollDay(); // the new day's job board and event (seeded by the day, so a reload shows the same)
    for (const n of e.news) n.days--;
    e.news = e.news.filter((n) => n.days > 0);
    for (const g of INGREDIENTS) {
      // random walk with a pull back to 1, so prices wander but don't run away
      let m = e.mult[g.id];
      m += (Math.random() * 2 - 1) * 0.15 + (1 - m) * 0.25;
      e.mult[g.id] = clamp(m, 0.55, 1.9);
      if (g.supply) e.supply[g.id] = g.supply;
    }
    let headline = null;
    if (Math.random() < 0.45) {
      const g = pick(INGREDIENTS), up = Math.random() < 0.55;
      const size = 0.25 + Math.random() * 0.2;
      e.news = e.news.filter((n) => n.id !== g.id);
      e.news.push({ id: g.id, f: up ? 1 + size : 1 - size, days: 2 + Math.floor(Math.random() * 2), text: cap((up ? pick(NEWS_UP) : pick(NEWS_DOWN))(g.name.toLowerCase())) });
      headline = e.news.at(-1);
    }
    for (const g of INGREDIENTS) { e.hist[g.id].push(effMult(g.id)); if (e.hist[g.id].length > HISTORY) e.hist[g.id].shift(); }
    const mixLine = made ? (made.kg ? `Naknikim mixed ${made.kg} kg ${made.name} ${stars(Math.round(made.q))}. ` : `Naknikim couldn't mix ${made.name}: ${made.why} `) : '';
    const payLine = rep.rows.length ? `Clients paid ${fmt(rep.paid)}${rep.missed ? `, ${rep.missed} order(s) missed` : ''}${e.cards.length ? ', a client wants a word (Dagrapport)' : ''}. ` : '';
    if (strikes.length && deps.toast) { deps.toast('THE LAMPAS STRIKE BACK', strikes.join(' '), 6); return e.day; }
    if (deps.toast) deps.toast(`MARKET DAY ${e.day}`, mixLine + payLine + (headline ? `Kruidenbeurs: ${headline.text}.` : `Spice prices moved${why ? ' while you were ' + why : ''}.`), mixLine || payLine ? 5 : 3);
    return e.day;
  }
  // called every frame: a finished mission bumps state.raids, which ends the day
  function update() {
    const e = ensure(), r = state.raids || 0;
    if (r > e.raidsSeen && state.lastRaid) { raidDone(state.lastRaid); state.lastRaid = null; }
    if (r > e.raidsSeen) { const n = r - e.raidsSeen; e.raidsSeen = r; for (let i = 0; i < n; i++) advance('out raiding'); return true; }
    return false;
  }

  const effMult = (id) => { const e = ensure(), n = e.news.find((x) => x.id === id); return e.mult[id] * (n ? n.f : 1); };
  function price(id, gradeId) {
    const g = INGREDIENTS.find((x) => x.id === id), gr = GRADES.find((x) => x.id === gradeId);
    const disc = clamp(deps.discount ? deps.discount() : 0, 0, 0.3);
    return Math.max(1, Math.round(g.base * effMult(id) * gr.mult * (1 - disc)));
  }
  const key = (id, gradeId) => `${id}:${gradeId}`;
  const stockOf = (id, gradeId) => ensure().stock[key(id, gradeId)] || 0;
  const stockTotal = () => { const e = ensure(); return Math.round(Object.values(e.stock).reduce((a, b) => a + b, 0) + Object.values(e.blends).reduce((a, b) => a + b.kg, 0)); };
  const have = (id) => GRADES.reduce((a, gr) => a + stockOf(id, gr.id), 0);
  const blendOf = (id) => ensure().blends[id] || { kg: 0, q: 0 };

  // the Naknikim mix today's order: PER_NAKNIK kg each, as far as the stock reaches. Grades are used cheapest
  // or best first (the player's policy); quality = the average stars of what went in. Now and then one messes up.
  function mix() {
    const e = ensure(), n = mixers(), b = BLENDS.find((x) => x.id === e.order);
    if (!n || !b || !b.mix) return null;
    let kg = n * PER_NAKNIK;
    for (const [id, w] of Object.entries(b.mix)) kg = Math.min(kg, Math.floor(have(id) * 10 / w));
    if (kg <= 0) return { name: b.name, kg: 0, why: `not enough ${Object.keys(b.mix).filter((id) => have(id) * 10 / b.mix[id] < 1).map((id) => INGREDIENTS.find((g) => g.id === id).name.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}.` };
    const order = e.policy === 'best' ? GRADES.slice().reverse() : GRADES;
    let starKg = 0, used = 0;
    for (const [id, w] of Object.entries(b.mix)) {
      let need = kg * w / 10;
      for (const gr of order) {
        const k = key(id, gr.id), take = Math.min(need, e.stock[k] || 0);
        if (take <= 0) continue;
        e.stock[k] = +(e.stock[k] - take).toFixed(2); if (e.stock[k] <= 0.001) delete e.stock[k];
        need -= take; starKg += take * gr.stars; used += take;
      }
    }
    let out = kg, oops = null;
    for (let i = 0; i < n; i++) if (Math.random() < 0.12) { out -= 2; oops = pick(MISTAKES); }
    out = Math.max(0, out);
    const q = used ? starKg / used : 1, cur = blendOf(b.id);
    e.blends[b.id] = { kg: cur.kg + out, q: cur.kg + out ? (cur.kg * cur.q + out * q) / (cur.kg + out) : q };
    return { name: b.name, kg: out, q, oops };
  }
  // ---- clients
  const ownedClients = () => { const ids = deps.joints ? deps.joints() : []; return CLIENTS.filter((c) => ids.includes(c.id)); };
  const activeClients = () => ownedClients().filter((c) => !ensure().retaken[c.id]);
  const trustOf = (id) => { const e = ensure(); if (e.trust[id] === undefined) e.trust[id] = 60; return e.trust[id]; };
  const addTrust = (id, d) => { const e = ensure(); e.trust[id] = clamp(trustOf(id) + d, 0, 100); };
  const controlOf = (id) => { const e = ensure(); if (id === 'schmatzel') return 100; if (e.control[id] === undefined) e.control[id] = 60; return e.control[id]; };
  const ctlMult = (id) => (id === 'schmatzel' ? 1.1 : 0.5 + 0.7 * controlOf(id) / 100); // 0 control: half pay, 100: x1.2
  const clientPrice = (blendId, q, cid) => { const b = BLENDS.find((x) => x.id === blendId); return Math.round(b.value * (0.6 + 0.15 * q) * (cid ? ctlMult(cid) : 1) * 10) / 10; };
  function deliver() {
    const e = ensure(), rows = []; let paid = 0, missed = 0;
    // late payments from earlier days come in first
    for (const o of e.owed) o.days--;
    for (const o of e.owed.filter((x) => x.days <= 0)) { paid += o.amount; rows.push({ name: o.name, note: `paid ${fmt(o.amount)} they owed`, pay: o.amount }); }
    e.owed = e.owed.filter((x) => x.days > 0);
    for (const c of activeClients()) {
      if (e.pause[c.id] > 0) { e.pause[c.id]--; if (!e.pause[c.id]) e.trust[c.id] = 30; rows.push({ name: c.name, note: e.pause[c.id] ? 'buying from the Lampas for now' : 'willing to talk again tomorrow', pay: 0 }); continue; }
      const b = BLENDS.find((x) => x.id === c.blend), have = blendOf(c.blend), want = orderKg(c), kg = Math.min(want, Math.floor(have.kg));
      if (kg <= 0) {
        missed++; addTrust(c.id, c.kind === 'loyal' ? -5 : -15); addControl(c.id, -10);
        rows.push({ name: c.name, want: `${want} kg ${b.name}`, note: c.kind === 'loyal' ? '"No spice today? Next time, jongen."' : 'MISSED: no stock', pay: 0 });
      } else {
        have.kg -= kg; if (have.kg <= 0) delete e.blends[c.blend]; else e.blends[c.blend] = have;
        let pay = Math.round(clientPrice(c.blend, have.q, c.id) * kg * (e.event && e.event.blend === c.blend ? e.event.pay : 1)), note = kg < want ? `short ${want - kg} kg` : 'on time';
        if (Math.round(have.q) < c.minQ && c.kind !== 'loyal') { pay = Math.round(pay / 2); addTrust(c.id, -10); note = `"${pick(COMPLAINTS)}" paid half`; }
        else { addTrust(c.id, kg < want ? 0 : 4); if (kg >= want) addControl(c.id, 5); }
        if (c.kind === 'haggler' && Math.random() < 0.35 && !e.cards.some((x) => x.id === c.id)) { e.cards.push({ id: c.id, name: c.name, who: c.who, text: pick(HAGGLES), amount: pay }); note += ', wants to haggle'; pay = 0; }
        else if (c.kind === 'late' && Math.random() < 0.5) { const d = 1 + Math.floor(Math.random() * 2); e.owed.push({ name: c.name, amount: pay, days: d }); note += `, pays in ${d} day(s)`; pay = 0; }
        rows.push({ name: c.name, want: `${want} kg ${b.name}`, kg, q: have.q, note, pay });
        paid += pay;
      }
      if (trustOf(c.id) < 20 && !e.pause[c.id]) { e.pause[c.id] = 2; rows.at(-1).note += '. Fed up: back to the Lampas for 2 days'; }
    }
    for (const c of ownedClients().filter((x) => e.retaken[x.id])) rows.push({ name: c.name, note: 'TAKEN BACK BY THE LAMPAS: raid it to win it back', pay: 0 });
    if (paid) { deps.addMoney(paid); addRep(paid / 20); }
    return { day: e.day, rows, paid, missed };
  }
  const addControl = (id, d) => { const e = ensure(); if (id !== 'schmatzel') e.control[id] = clamp(controlOf(id) + d, 0, 100); };
  const isRetaken = (id) => !!ensure().retaken[id];
  function addRep(n) {
    const e = ensure(), before = rankOf(e.rep).i; e.rep += Math.max(0, Math.round(n)); const r = rankOf(e.rep);
    if (r.i > before && deps.toast) setTimeout(() => deps.toast('NEW RANK', `Eddy Jr. is now <b>${r.name}</b>. Kaasland is starting to talk.`, 4), 5200);
  }
  function rankHTML() {
    const e = ensure(), r = rankOf(e.rep), pct = r.next ? Math.round((e.rep - RANKS[r.i][0]) / (r.next[0] - RANKS[r.i][0]) * 100) : 100;
    return `<div class="well" style="margin-top:8px"><b>Rank: ${r.name}</b> · reputation <b>${e.rep.toLocaleString('nl-NL')}</b>${r.next ? ` · next: ${r.next[1]} at ${r.next[0].toLocaleString('nl-NL')}` : ' · the top of Kaasland'}<br><span style="display:inline-block;width:240px;height:10px;border:1px solid #808080;background:#fff"><span style="display:block;height:100%;width:${pct}%;background:#000080"></span></span><br><small>Reputation comes from client sales, raids (S grades count double), jobs and retaking joints. ${RANKS.map((x) => x[1]).join(' · ')}</small></div>`;
  }
  // ---- turf: Lampas heat (0-100) rises with every joint you hold and every raid, and cools a little each day.
  // 40: price war and pressure on control · 60: they lean on a client · 80: they retake a joint · 100: they raid the warehouse
  function turf() {
    const e = ensure(), out = [], L = e.heat;
    const owned = ownedClients().map((c) => c.id).filter((id) => id !== 'schmatzel');
    if (!e.known) { e.known = owned.slice(); L.lampas = clamp(L.lampas + 15 * owned.length, 0, 100); } // first look at an older save
    for (const id of owned) if (!e.known.includes(id)) { e.known.push(id); e.control[id] = 60; L.lampas += 25; }
    const held = owned.filter((id) => !e.retaken[id]);
    L.lampas = clamp(L.lampas + 2 * held.length - 4, 0, 100);
    const name = (id) => CLIENTS.find((c) => c.id === id).name;
    if (L.lampas >= 40) { for (const id of held) if (!e.wh[id]) addControl(id, -5); if (!e.event) { const bl = pick(BLENDS.filter((x) => x.mix)); e.event = { id: 'pricewar', text: `The Lampas dump cheap ${bl.name} on your turf: clients pay 25% less for it today`, pay: 0.75, blend: bl.id }; } }
    if (L.lampas >= 60 && held.length && Math.random() < 0.5) { const id = pick(held); addControl(id, -10); out.push(`Lampas thugs leaned on ${name(id)} (control -10).`); }
    const weakest = held.slice().sort((a, b) => controlOf(a) - controlOf(b))[0];
    if (weakest && (L.lampas >= 80 || controlOf(weakest) <= 0) && !Object.keys(e.retaken).length) { e.retaken[weakest] = true; L.lampas = clamp(L.lampas - 15, 0, 100); out.push(`They took ${name(weakest)} back! Raid it from the van map to retake it.`); }
    if (L.lampas >= 100) { const g = guarded(), keep = g ? 0.9 : 0.7; for (const k of Object.keys(e.stock)) { e.stock[k] = Math.floor(e.stock[k] * keep); if (!e.stock[k]) delete e.stock[k]; } L.lampas = 60; out.push(g ? 'They raided your warehouses, but your Naknik guard scared most of them off: 10% of the spice gone.' : 'They raided the warehouse and ran off with 30% of your spice.'); }
    e.turfNews = out;
    return out;
  }
  function tribute(el) {
    const e = ensure(), cost = Math.round(e.heat.lampas * 40 / 10) * 10;
    if (e.heat.lampas < 10) return 'The Lampas are calm. Keep your Wilders.';
    if (state.money < cost) return `Tribute costs ${fmt(cost)}.`;
    deps.addMoney(-cost, el); e.heat.lampas = clamp(e.heat.lampas - 30, 0, 100); if (deps.save) deps.save();
    return null;
  }
  function turfHTML(short) {
    const e = ensure(), h0 = e.heat.lampas, owned = ownedClients().filter((c) => c.id !== 'schmatzel');
    const bar = (v, c) => `<span style="display:inline-block;width:120px;height:10px;border:1px solid #808080;background:#fff;vertical-align:middle"><span style="display:block;height:100%;width:${v}%;background:${c}"></span></span>`;
    const stage = h0 >= 80 ? 'retaking joints' : h0 >= 60 ? 'leaning on your clients' : h0 >= 40 ? 'price war' : h0 >= 20 ? 'grumbling' : 'calm';
    let h = `<b>Lampas heat</b> ${bar(h0, h0 >= 60 ? '#c00000' : h0 >= 40 ? '#e08000' : '#60a060')} <b>${h0}</b>/100 · ${stage}`;
    if (short) return h + (owned.length ? ` · Control: ${owned.map((c) => `${c.name.replace(/^Snack(paleis|bar) /, '')} ${e.retaken[c.id] ? '<b style="color:#a00">LOST</b>' : controlOf(c.id)}`).join(', ')}` : '');
    h += '<br><small>Heat rises with every joint you hold (+2 a day each) and every raid (+5), and cools 4 a day. 40: price war · 60: they lean on clients · 80: they retake a joint · 100: they raid your warehouse.</small>';
    if (owned.length) h += '<table class="list" style="margin-top:4px"><tr><th>Territory</th><th>Control</th><th>Pay</th></tr>' + owned.map((c) => `<tr><td>${c.name}</td><td>${e.retaken[c.id] ? '<b style="color:#a00">Taken back by the Lampas</b>' : bar(controlOf(c.id), '#2e8b2e') + ' ' + controlOf(c.id)}</td><td>x${ctlMult(c.id).toFixed(2)}</td></tr>`).join('') + '</table>';
    h += `<div style="margin-top:6px"><button class="b95" id="tribute" ${h0 < 10 ? 'disabled' : ''}>Pay tribute to the Lampas (${fmt(Math.round(h0 * 40 / 10) * 10)}, heat -30)</button> <small>Winning a joint back also drops heat by 30.</small></div>`;
    return h;
  }
  const machineVol = (cid) => 1 + (ensure().installed[cid] || []).reduce((a, id) => a + MACHINES.find((m) => m.id === id).vol, 0);
  const orderKg = (c) => { const ev = ensure().event; return Math.round(c.kg * machineVol(c.id) * (ev && ev.vol && (!ev.only || ev.only === c.id) ? ev.vol : 1)); };
  // ---- machine trade
  const machineCount = () => Object.values(ensure().machines).reduce((a, b) => a + b, 0);
  function rollOffers(r) { // two used machines on Kaasplaats per day
    const e = ensure(), rp = (a) => a[Math.floor(r() * a.length)];
    e.offers = [0, 1].map((n) => { const m = rp(MACHINES); return { n, id: m.id, price: Math.round(m.used * (0.8 + r() * 0.4) / 10) * 10, cond: rp(CONDITION), sold: false }; });
  }
  function buyMachine(id, used, el, offerN) {
    const e = ensure(), m = MACHINES.find((x) => x.id === id), off = used ? (e.offers || [])[offerN] : null;
    if (used && (!off || off.sold)) return 'Already sold.';
    if (machineCount() >= mcap()) return `Your warehouses hold ${mcap()} machines. Sell one first.`;
    const cost = used ? off.price : m.new;
    if (state.money < cost) return `Not enough Wilders (${fmt(cost)}).`;
    deps.addMoney(-cost, el); e.machines[id] = (e.machines[id] || 0) + 1; if (off) off.sold = true;
    if (deps.save) deps.save(); return null;
  }
  function installMachine(id, cid, el) { // sell a machine to a client joint: they pay, order more, and like you more
    const e = ensure(), m = MACHINES.find((x) => x.id === id);
    if (!(e.machines[id] > 0)) return 'No such machine in the warehouse.';
    const inst = e.installed[cid] || []; if (inst.includes(id)) return 'They already have one.';
    e.machines[id]--; if (!e.machines[id]) delete e.machines[id];
    e.installed[cid] = [...inst, id]; deps.addMoney(m.sell, el); addTrust(cid, 10); addControl(cid, 10);
    if (deps.save) deps.save(); return null;
  }
  function machinesHTML() {
    const e = ensure(); if (!e.offers) rollOffers(rng32(hashStr(`offers#${e.day}`)));
    const cl = activeClients();
    let h = `<div class="well" style="margin-top:10px"><b>Machinehandel Eddy & Zn</b> · Dad's old trade · Warehouses: <b>${machineCount()} / ${mcap()}</b> machines<br><small>Buy grills, ovens and fryers, then sell them to your joints: they pay well, order more spice every day and trust you more. Machine-delivery jobs on the Klusbord pay extra.</small></div>`;
    h += '<table class="list" style="margin-top:6px"><tr><th>Machine</th><th>Used (today)</th><th>New</th><th>Clients pay</th><th>Orders</th><th>In stock</th></tr>';
    for (const m of MACHINES) {
      const offs = (e.offers || []).filter((o) => o.id === m.id && !o.sold);
      h += `<tr><td><b>${m.name}</b></td><td>${offs.map((o) => `${fmt(o.price)} <small>(${o.cond})</small> <button class="b95" data-mbuy="${m.id}:used:${o.n}">Buy</button>`).join('<br>') || '-'}</td><td>${fmt(m.new)} <button class="b95" data-mbuy="${m.id}:new:0">Buy</button></td><td>${fmt(m.sell)}</td><td>+${Math.round(m.vol * 100)}%</td><td>${e.machines[m.id] || 0}</td></tr>`;
    }
    h += '</table>';
    const have = MACHINES.filter((m) => e.machines[m.id] > 0);
    if (have.length && cl.length) {
      h += '<table class="list" style="margin-top:6px"><tr><th>Sell to a client</th><th>Has</th><th></th></tr>';
      for (const c of cl) h += `<tr><td>${c.name}</td><td><small>${(e.installed[c.id] || []).map((id) => MACHINES.find((m) => m.id === id).name).join(', ') || 'nothing from you yet'}</small></td><td>${have.filter((m) => !(e.installed[c.id] || []).includes(m.id)).map((m) => `<button class="b95" data-minst="${m.id}:${c.id}">${m.name} · ${fmt(m.sell)}</button>`).join(' ') || '-'}</td></tr>`;
      h += '</table>';
    }
    return h;
  }
  function machinesBind(body, rerender) {
    body.querySelectorAll('[data-mbuy]').forEach((b) => b.onclick = () => { const [id, kind, n] = b.dataset.mbuy.split(':'); const m = buyMachine(id, kind === 'used', b, +n); if (m && deps.toast) deps.toast('MACHINEHANDEL', m, 2.5); rerender(); });
    body.querySelectorAll('[data-minst]').forEach((b) => b.onclick = () => { const [id, cid] = b.dataset.minst.split(':'); const m = installMachine(id, cid, b); if (deps.toast) deps.toast(m ? 'MACHINEHANDEL' : 'SOLD', m || `${CLIENTS.find((c) => c.id === cid).name} bought it. They'll order more spice from now on.`, 3); rerender(); });
  }

  // ---- job board (Klusbord) and daily events: rolled from the market day's seed
  function rollDay() {
    const e = ensure(), r = rng32(hashStr(`jobs#${e.day}`)), rp = (a) => a[Math.floor(r() * a.length)];
    const levels = (deps.joints ? deps.joints() : []).filter((id) => id !== 'schmatzel' && CLIENTS.some((c) => c.id === id));
    const name = (id) => CLIENTS.find((c) => c.id === id).name;
    const cand = [];
    if (levels.length) { const lv = rp(levels); cand.push({ kind: 'stash', level: lv, reward: 300 + Math.round(r() * 8) * 50, title: `Hit the Lampas stash at ${name(lv)}`, desc: `The Lampas moved a fresh stash into ${name(lv)}. Do tonight's remix raid there.` }); }
    const debtor = e.owed.find((o) => levels.includes(CLIENTS.find((c) => c.name === o.name)?.id));
    if (debtor) { const id = CLIENTS.find((c) => c.name === debtor.name).id; cand.push({ kind: 'debt', level: id, reward: Math.round(debtor.amount * 1.25), title: `Collect from ${debtor.name}`, desc: `They owe you W ${debtor.amount}. Raid ${name(id)} tonight and they'll pay now, plus 25% for the trouble.` }); }
    const b = rp(BLENDS.filter((x) => x.mix)), kg = 10 + Math.floor(r() * 3) * 5;
    cand.push({ kind: 'spoed', blend: b.id, kg, reward: Math.round(b.value * 1.6 * kg), title: `Spoed-order: ${kg} kg ${b.name}`, desc: `${rp(['Grillroom Zuid', 'Restaurant De Lepel', 'Kapsalon King', 'Snackbar Bij Henk'])} is out of spice and pays 60% over the odds, today only.` });
    const g = rp(INGREDIENTS.filter((x) => !x.supply)), dkg = 30;
    cand.push({ kind: 'deal', ing: g.id, kg: dkg, off: 0.4, title: `Supplier deal: ${dkg} kg ${g.name}`, desc: `A truck driver "found" ${dkg} kg of Standaard ${g.name.toLowerCase()}. 40% off, today only.`, reward: 0 });
    { const m = rp(MACHINES); cand.push({ kind: 'machine', machine: m.id, reward: Math.round(m.sell * 1.25 / 10) * 10, title: `Deliver a ${m.name} to Frietwijk`, desc: `${rp(['Kapsalon King', 'Grillroom Ali Baba', 'Shoarma Paleis'])} in Oud-Vettenburg needs a ${m.name.toLowerCase()} and pays 25% over the odds. Have one in the warehouse, then drive to Oud-Vettenburg. The Lampas won't like it (heat +10).`, needs: 'district1' }); }
    if (state.district1) cand.push({ kind: 'scout', reward: 400, title: 'Scout Oud-Vettenburg', desc: 'Drive the Oofmobiel to Oud-Vettenburg and back. The Lampas will try to ram you.' });
    rollOffers(r);
    const ok = cand.filter((j) => j.needs !== 'district1' || state.district1);
    for (let i = ok.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [ok[i], ok[j]] = [ok[j], ok[i]]; }
    e.jobs = ok.slice(0, 3).map((j, i) => ({ ...j, n: i, done: false }));
    e.event = null;
    if (r() < 0.35) { const ev = rp(EVENTS), bl = rp(BLENDS.filter((x) => x.mix)); e.event = { id: ev.id, text: ev.text(bl), vol: ev.vol, pay: ev.pay, only: ev.only, blend: ev.pay ? bl.id : null }; }
  }
  function finishJob(j, el) {
    j.done = true; if (j.reward) deps.addMoney(j.reward, el); addRep(60);
    if (j.kind === 'debt') { const e = ensure(), i = e.owed.findIndex((o) => CLIENTS.find((c) => c.id === j.level)?.name === o.name); if (i >= 0) e.owed.splice(i, 1); }
    if (deps.toast) deps.toast('JOB DONE', `${j.title}${j.reward ? `: +${fmt(j.reward)}` : ''}.`, 3);
    if (deps.save) deps.save();
  }
  function raidDone(raid) {
    const e = ensure();
    addRep(raid.grade === 'S' ? 250 : 100);
    if (raid.remix) e.heat.lampas = clamp(e.heat.lampas + 5, 0, 100);
    if (e.retaken[raid.id]) { delete e.retaken[raid.id]; e.control[raid.id] = 60; e.heat.lampas = clamp(e.heat.lampas - 30, 0, 100); if (deps.toast) deps.toast('TAKEN BACK', `${CLIENTS.find((c) => c.id === raid.id).name} is yours again. Lampas heat -30.`, 4); addRep(150); }
    for (const j of e.jobs || []) if (!j.done && (j.kind === 'stash' || j.kind === 'debt') && j.level === raid.id && raid.remix) finishJob(j); }
  function driveDone(arrived) {
    const e = ensure();
    for (const j of e.jobs || []) {
      if (j.done || !arrived) continue;
      if (j.kind === 'scout') finishJob(j);
      if (j.kind === 'machine' && e.machines[j.machine] > 0) { e.machines[j.machine]--; if (!e.machines[j.machine]) delete e.machines[j.machine]; e.heat.lampas = clamp(e.heat.lampas + 10, 0, 100); finishJob(j); }
    }
  }
  const jobFor = (level) => (ensure().jobs || []).find((j) => !j.done && j.level === level);
  function doJob(n, el) {
    const e = ensure(), j = (e.jobs || [])[n]; if (!j || j.done) return null;
    if (j.kind === 'spoed') {
      const cur = blendOf(j.blend); if (cur.kg < j.kg) return `You need ${j.kg} kg ${BLENDS.find((x) => x.id === j.blend).name} in stock (you have ${Math.floor(cur.kg)}).`;
      cur.kg -= j.kg; if (cur.kg <= 0) delete e.blends[j.blend]; else e.blends[j.blend] = cur;
      finishJob(j, el); return null;
    }
    if (j.kind === 'deal') {
      const cost = Math.round(price(j.ing, 'std') * (1 - j.off)) * j.kg;
      if (space() < j.kg) return 'Not enough room in the warehouse.';
      if (state.money < cost) return `Not enough Wilders (${fmt(cost)}).`;
      e.stock[key(j.ing, 'std')] = stockOf(j.ing, 'std') + j.kg; deps.addMoney(-cost, el); j.done = true; if (deps.save) deps.save(); return null;
    }
    return null;
  }
  function jobsHTML() {
    const e = ensure(); if (!e.jobs) rollDay();
    let h = `<div class="well" style="margin-bottom:8px"><b>Klusbord</b> · Market day <b>${e.day}</b> · New jobs after every outing.<br><small>Raids are done from the Oofmobiel map (owned joints show tonight's remix). Order and deal jobs are done right here.</small></div>`;
    if (e.event) h += `<div class="well" style="margin-bottom:8px;background:#ffffe0"><b>TODAY:</b> ${e.event.text}.</div>`;
    const dc = deps.daily ? deps.daily() : null;
    if (dc) h += `<div class="well" style="margin-bottom:8px;background:#f0f0ff"><b>DAGELIJKSE UITDAGING · ${dc.date}</b>: ${dc.name}, ${dc.mod}. The same raid for everyone today, a new one tomorrow. Your best today: <b>${dc.best ? 'W ' + dc.best.toLocaleString('nl-NL') : '-'}</b>. <i>Start it from the van map.</i></div>`;
    h += '<table class="list"><tr><th>Job</th><th>Pays</th><th></th></tr>';
    for (const j of e.jobs) {
      const cost = j.kind === 'deal' ? Math.round(price(j.ing, 'std') * (1 - j.off)) * j.kg : 0;
      const act = j.done ? '<b style="color:#070">DONE</b>' : j.kind === 'spoed' ? `<button class="b95" data-job="${j.n}">Deliver (${Math.floor(blendOf(j.blend).kg)}/${j.kg} kg)</button>` : j.kind === 'deal' ? `<button class="b95" data-job="${j.n}">Buy for ${fmt(cost)}</button>` : j.kind === 'scout' ? '<i>Van map: Drive to Oud-Vettenburg</i>' : j.kind === 'machine' ? `<i>${(e.machines[j.machine] || 0) > 0 ? 'In stock. ' : 'Buy one on Kaasplaats, then '}drive to Oud-Vettenburg</i>` : '<i>Van map: remix raid</i>';
      h += `<tr><td><b>${j.title}</b><br><small>${j.desc}</small></td><td>${j.reward ? fmt(j.reward) : `save ${fmt(cost / (1 - j.off) * j.off)}`}</td><td>${act}</td></tr>`;
    }
    h += '</table>';
    return h;
  }
  function jobsBind(body, rerender) {
    body.querySelectorAll('[data-job]').forEach((b) => b.onclick = () => { const m = doJob(+b.dataset.job, b); if (m && deps.toast) deps.toast('KLUSBORD', m, 2.5); rerender(); });
  }
  // a haggling client: discount (80%, +trust), insist (coin flip: full pay or nothing and -trust), cut them off (nothing, -trust, 2 days paused)
  function settle(cardIdx, choice, el) {
    const e = ensure(), c = e.cards[cardIdx]; if (!c) return null;
    e.cards.splice(cardIdx, 1);
    let msg;
    if (choice === 'discount') { const pay = Math.round(c.amount * 0.8); deps.addMoney(pay, el); addTrust(c.id, 8); msg = `${c.who} pays ${fmt(pay)} and calls you "brother".`; }
    else if (choice === 'insist') {
      if (Math.random() < 0.55) { deps.addMoney(c.amount, el); addTrust(c.id, -3); msg = `${c.who} grumbles and pays the full ${fmt(c.amount)}.`; }
      else { addTrust(c.id, -15); msg = `${c.who} brings out his cousins. No money today.`; }
    } else if (choice === 'repo' && (e.installed[c.id] || []).length) {
      const id = e.installed[c.id].pop(), m = MACHINES.find((x) => x.id === id);
      e.machines[id] = (e.machines[id] || 0) + 1; addTrust(c.id, -30); addControl(c.id, -5);
      msg = `You unbolt their ${m.name.toLowerCase()} and throw it in the Oofmobiel. ${c.who} shouts in three languages. Sell it to someone who pays.`;
    } else { addTrust(c.id, -20); e.pause[c.id] = 2; msg = `You cut off ${c.name}. They'll buy Lampas junk for two days.`; }
    if (deps.save) deps.save();
    return msg;
  }
  function reportHTML() {
    const e = ensure(), cl = activeClients();
    let h = `<div class="well" style="margin-bottom:8px"><b>Dagrapport</b> · Market day <b>${e.day}</b> · Balance <b>${fmt(state.money)}</b><br><small>Every outing ends the day: the Naknikim mix, then each client takes its order from your blend stock and pays. Good quality and full orders build trust; missed orders send them back to the Lampas.</small></div>`;
    for (let i = 0; i < e.cards.length; i++) {
      const c = e.cards[i];
      h += `<div class="well" style="margin-bottom:8px;background:#fff0f0"><b>${c.who}, ${c.name}:</b><br><i>"${c.text}"</i><br>They owe you <b>${fmt(c.amount)}</b>.<br>
        <button class="b95" data-card="${i}:discount">Give 20% off</button>${(e.installed[c.id] || []).length ? ` <button class="b95" data-card="${i}:repo">Repo their ${MACHINES.find((m) => m.id === e.installed[c.id].at(-1)).name.toLowerCase()}</button>` : ''} <button class="b95" data-card="${i}:insist">Insist on full pay</button> <button class="b95" data-card="${i}:cut">Cut off their supply</button></div>`;
    }
    const r = e.report;
    h += `<div class="well" style="margin-bottom:8px">${e.turfNews.length ? `<b style="color:#a00">THE LAMPAS STRUCK BACK:</b> ${e.turfNews.join(' ')}<br>` : ''}${turfHTML(false)}</div>`;
    if (e.event) h += `<div class="well" style="margin-bottom:8px;background:#ffffe0"><b>TODAY:</b> ${e.event.text}.</div>`;
    h += `<div class="well" style="margin-bottom:8px"><b>${r ? `Day ${r.day}` : 'No report yet'}</b>${r ? ` · Paid today <b>${fmt(r.paid)}</b>${r.missed ? ` · <span style="color:#a00">${r.missed} missed</span>` : ''}` : ''}`;
    h += r && r.rows.length ? '<table class="list" style="margin-top:4px"><tr><th>Client</th><th>Order</th><th>Delivered</th><th>Paid</th><th></th></tr>' + r.rows.map((x) => `<tr><td>${x.name}</td><td>${x.want || ''}</td><td>${x.kg ? `${x.kg} kg ${stars(Math.round(x.q))}` : '-'}</td><td>${x.pay ? fmt(x.pay) : '-'}</td><td><small>${x.note}</small></td></tr>`).join('') + '</table>' : '<br>Go on an outing (a mission or a drive) to end the day.';
    h += '</div>';
    h += '<table class="list"><tr><th>Client</th><th>Wants daily</th><th>Min. quality</th><th>Pays now</th><th>Trust</th></tr>';
    for (const c of cl) {
      const b = BLENDS.find((x) => x.id === c.blend), t = trustOf(c.id);
      h += `<tr><td><b>${c.name}</b><br><small>${c.who} · ${{ loyal: 'loyal, never complains', haggler: 'haggles', late: 'pays late', picky: 'picky about quality' }[c.kind]}</small></td><td>${orderKg(c)} kg ${b.name}${machineVol(c.id) > 1 ? ` <small>(machines +${Math.round((machineVol(c.id) - 1) * 100)}%)</small>` : ''}</td><td>${stars(c.minQ)}</td><td>${fmt(clientPrice(c.blend, Math.max(1, blendOf(c.blend).q || 3), c.id))}/kg</td><td>${e.pause[c.id] ? '<span style="color:#a00">with the Lampas</span>' : `<span style="color:${t < 35 ? '#a00' : t > 70 ? '#070' : '#000'}">${t}</span>`}</td></tr>`;
    }
    h += '</table>';
    if (e.owed.length) h += `<p>Owed to you: ${e.owed.map((o) => `${o.name} ${fmt(o.amount)} (in ${o.days} day${o.days > 1 ? 's' : ''})`).join(', ')}</p>`;
    h += `<p><small>Take more joints to win more clients. ${cl.length < CLIENTS.length ? 'Each De Natte Worst territory you own becomes a client.' : ''}</small></p>`;
    return h;
  }
  function reportBind(body, rerender) {
    const tb = body.querySelector('#tribute'); if (tb) tb.onclick = () => { const m = tribute(tb); if (deps.toast) deps.toast('TRIBUTE', m || 'The Lampas count the money and back off. For now.', 3); rerender(); };
    body.querySelectorAll('[data-card]').forEach((b) => b.onclick = () => { const [i, ch] = b.dataset.card.split(':'); const m = settle(+i, ch, b); if (m && deps.toast) deps.toast('DEAL', m, 3); rerender(); });
  }
  const wholesalePrice = (id) => { const b = BLENDS.find((x) => x.id === id); return Math.round(b.value * (0.3 + 0.08 * blendOf(id).q) * 10) / 10; };
  function sellBlend(id, kg, el) {
    const e = ensure(), cur = blendOf(id);
    kg = Math.min(kg, cur.kg, e.wholesaleLeft);
    if (kg <= 0) return { ok: false, why: cur.kg <= 0 ? 'Nothing in stock.' : 'The Groothandel has bought enough for today.' };
    const pay = Math.round(wholesalePrice(id) * kg);
    cur.kg -= kg; e.wholesaleLeft -= kg; if (cur.kg <= 0) delete e.blends[id]; else e.blends[id] = cur;
    deps.addMoney(pay, el); if (deps.save) deps.save();
    return { ok: true, kg, pay };
  }
  // ---- warehouses (home + bought ones). A warehouse in a joint the Lampas retook is shut until you win it back.
  const whOpen = () => WAREHOUSES.filter((w) => ensure().wh[w.id] && !ensure().retaken[w.id]);
  const cap = () => STOCK_CAP + whOpen().reduce((a, w) => a + w.kg, 0);
  const mcap = () => MACHINE_CAP + whOpen().length;
  const mixers = () => (state.naknik || 0) + whOpen().reduce((a, w) => a + ensure().wh[w.id].naknik - (ensure().wh[w.id].guard ? 1 : 0), 0);
  const guarded = () => whOpen().some((w) => ensure().wh[w.id].guard);
  function buyWarehouse(id, el) {
    const e = ensure(), w = WAREHOUSES.find((x) => x.id === id);
    if (e.wh[id]) return 'You already own it.';
    if (!ownedClients().some((c) => c.id === id) || e.retaken[id]) return 'You need to hold that territory first.';
    if (state.money < w.cost) return `Not enough Wilders (${fmt(w.cost)}).`;
    deps.addMoney(-w.cost, el); e.wh[id] = { naknik: 0, guard: false }; addControl(id, 10); if (deps.save) deps.save(); return null;
  }
  function hireAt(id, el) {
    const e = ensure(), w = WAREHOUSES.find((x) => x.id === id), h = e.wh[id];
    if (!h) return null; if (h.naknik >= w.slots) return 'No more room there.';
    if (state.money < WH_NAKNIK_COST) return `Not enough Wilders (${fmt(WH_NAKNIK_COST)}).`;
    deps.addMoney(-WH_NAKNIK_COST, el); h.naknik++; if (deps.save) deps.save(); return null;
  }
  function propertyHTML() {
    const e = ensure();
    let h = `<div class="well" style="margin-top:8px"><b>Panden · Eddy & Zn property</b><br>Home warehouse: <b>${STOCK_CAP} kg</b>, ${MACHINE_CAP} machines, ${state.naknik || 0} Naknik(im). Total now: <b>${cap()} kg</b>, ${mcap()} machines, <b>${mixers()}</b> Naknikim mixing (${mixers() * PER_NAKNIK} kg a day).<br><small>Buy a warehouse in a territory you hold for more space, a machine slot and two more Naknikim. A Naknik on guard duty stops mixing but cuts what a Lampas warehouse raid steals from 30% to 10%. If the Lampas retake that territory, its warehouse shuts until you win it back.</small></div>`;
    h += '<table class="list" style="margin-top:6px"><tr><th>Warehouse</th><th>Adds</th><th>Naknikim</th><th></th></tr>';
    for (const w of WAREHOUSES) {
      const own = e.wh[w.id], held = ownedClients().some((c) => c.id === w.id) && !e.retaken[w.id];
      h += `<tr><td><b>${w.name}</b><br><small>${w.desc}</small></td><td>+${w.kg} kg, +1 machine, ${w.slots} Naknik places</td>`;
      if (!own) h += `<td>-</td><td>${held ? `<button class="b95" data-wh="buy:${w.id}">Buy (${fmt(w.cost)})</button>` : `<small>${e.retaken[w.id] ? 'Retake the territory first' : 'Take the territory first'}</small>`}</td></tr>`;
      else h += `<td>${own.naknik} / ${w.slots}${own.guard ? ' (1 on guard)' : ''}${e.retaken[w.id] ? '<br><b style="color:#a00">Shut: Lampas territory</b>' : ''}</td><td>${own.naknik < w.slots ? `<button class="b95" data-wh="hire:${w.id}">Hire (${fmt(WH_NAKNIK_COST)})</button> ` : ''}${own.naknik ? `<button class="b95" data-wh="guard:${w.id}">${own.guard ? 'Back to mixing' : 'Put one on guard'}</button>` : ''}</td></tr>`;
    }
    return h + '</table>';
  }
  function propertyBind(body, rerender) {
    body.querySelectorAll('[data-wh]').forEach((b) => b.onclick = () => {
      const [act, id] = b.dataset.wh.split(':'), e = ensure(); let m = null;
      if (act === 'buy') m = buyWarehouse(id, b); else if (act === 'hire') m = hireAt(id, b); else if (e.wh[id]) { e.wh[id].guard = !e.wh[id].guard; if (deps.save) deps.save(); }
      if (m && deps.toast) deps.toast('PANDEN', m, 2.5); else if (act === 'buy' && deps.toast) deps.toast('NEW WAREHOUSE', `${WAREHOUSES.find((w) => w.id === id).name} is yours. Hire Naknikim there.`, 3);
      rerender();
    });
  }
  const space = () => cap() - stockTotal();

  function buy(id, gradeId, kg, el) {
    const e = ensure(), g = INGREDIENTS.find((x) => x.id === id);
    kg = Math.min(kg, space(), g.supply ? e.supply[id] : Infinity);
    if (kg <= 0) return { ok: false, why: space() <= 0 ? 'The warehouse is full.' : 'Sold out for today.' };
    const cost = price(id, gradeId) * kg;
    if (state.money < cost) return { ok: false, why: `Not enough Wilders (${fmt(cost)}).` };
    e.stock[key(id, gradeId)] = stockOf(id, gradeId) + kg;
    if (g.supply) e.supply[id] -= kg;
    deps.addMoney(-cost, el);
    if (deps.save) deps.save();
    return { ok: true, kg, cost };
  }
  function sell(id, gradeId, kg, el) { // sell stock back at 70% of today's price
    const e = ensure(); kg = Math.min(kg, stockOf(id, gradeId));
    if (kg <= 0) return { ok: false };
    const pay = Math.round(price(id, gradeId) * 0.7 * kg);
    e.stock[key(id, gradeId)] -= kg; if (!e.stock[key(id, gradeId)]) delete e.stock[key(id, gradeId)];
    deps.addMoney(pay, el); if (deps.save) deps.save();
    return { ok: true, kg, pay };
  }
  function unpackCrates(el) { // Lampas loot crates become Lampas-grade stock (a random open-market spice each)
    const e = ensure(); let n = 0;
    while (state.loot > 0 && space() >= CRATE_KG) {
      const g = pick(INGREDIENTS.filter((x) => !x.supply));
      e.stock[key(g.id, 'lampas')] = stockOf(g.id, 'lampas') + CRATE_KG; state.loot--; n++;
    }
    if (n && deps.save) deps.save();
    return n;
  }

  // ---- Kaasdows window
  const spark = (h) => {
    const w = 64, ht = 18, lo = 0.5, hi = 2, step = w / Math.max(1, HISTORY - 1);
    const pts = h.map((m, i) => `${(i * step).toFixed(1)},${(ht - (clamp(m, lo, hi) - lo) / (hi - lo) * ht).toFixed(1)}`).join(' ');
    const up = h.length > 1 && h.at(-1) > h.at(-2);
    return `<svg width="${w}" height="${ht}" viewBox="0 0 ${w} ${ht}" style="vertical-align:middle"><line x1="0" x2="${w}" y1="${(ht - (1 - lo) / (hi - lo) * ht).toFixed(1)}" y2="${(ht - (1 - lo) / (hi - lo) * ht).toFixed(1)}" stroke="#bbb" stroke-dasharray="2 2"/><polyline points="${pts}" fill="none" stroke="${up ? '#b00000' : '#007000'}" stroke-width="1.5"/></svg>`;
  };
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
  let qty = 5;
  function html() {
    const e = ensure(), disc = deps.discount ? deps.discount() : 0;
    let h = `<div class="well" style="margin-bottom:8px"><b>Kruidenbeurs De Natte Worst</b> · Market day <b>${e.day}</b> · Balance <b>${fmt(state.money)}</b><br>
      Warehouse stock: <b>${stockTotal()} / ${cap()} kg</b>${disc > 0 ? ` · Home turf discount <b>${Math.round(disc * 100)}%</b>` : ''}<br>
      <small>Prices move after every outing. Lampas grade is cheap and diluted, Bio is the Noshgey Kariot's overpriced best. Dock spices come through the Abdavissies, a few kilos a day.</small></div>`;
    if (e.news.length) h += `<div class="well" style="margin-bottom:8px;background:#ffffe0"><b>KAASLAND SPICE NEWS</b><br>${e.news.map((n) => `· ${n.text} <b style="color:${n.f > 1 ? '#b00000' : '#007000'}">${n.f > 1 ? '▲' : '▼'} ${Math.round(Math.abs(n.f - 1) * 100)}%</b>`).join('<br>')}</div>`;
    h += `<div style="margin-bottom:6px">Buy per click: ${[1, 5, 25].map((q) => `<button class="b95" data-qty="${q}" ${q === qty ? 'style="font-weight:bold;border-style:inset"' : ''}>${q} kg</button>`).join(' ')}</div>`;
    h += '<table class="list"><tr><th>Spice</th>' + GRADES.map((g) => `<th title="${g.note}">${g.name}<br><small>${stars(g.stars)}</small></th>`).join('') + '<th>Trend</th><th>In stock</th></tr>';
    for (const g of INGREDIENTS) {
      const left = g.supply ? e.supply[g.id] : null;
      h += `<tr><td><b>${g.name}</b><br><small>${g.from}${left !== null ? ` · ${left} kg left today` : ''}</small></td>`;
      for (const gr of GRADES) h += `<td>${fmt(price(g.id, gr.id))}/kg<br><button class="b95" data-buy="${g.id}:${gr.id}" ${left === 0 ? 'disabled' : ''}>Buy</button></td>`;
      const inStock = GRADES.map((gr) => [gr, stockOf(g.id, gr.id)]).filter(([, kg]) => kg > 0);
      h += `<td>${spark(e.hist[g.id])}</td><td>${inStock.map(([gr, kg]) => `${kg} kg ${gr.name} <button class="b95" data-sellst="${g.id}:${gr.id}" title="Sell 5 kg back at 70%">−5</button>`).join('<br>') || '-'}</td></tr>`;
    }
    h += '</table>';
    if (state.loot) h += `<p><button class="b95" id="unpack">Unpack ${state.loot} Lampas crate(s) into stock (${CRATE_KG} kg Lampas grade each)</button> <small>or sell them on Kaasplaats</small></p>`;
    h += '<p><small>Your Naknikim mix blends from this stock after every outing. Pick the blend in the <b>Mengkamer</b>.</small></p>';
    return h;
  }
  function bind(body, rerender) {
    body.querySelectorAll('[data-qty]').forEach((b) => b.onclick = () => { qty = +b.dataset.qty; rerender(); });
    body.querySelectorAll('[data-buy]').forEach((b) => b.onclick = () => {
      const [id, gr] = b.dataset.buy.split(':'); const r = buy(id, gr, qty, b);
      if (!r.ok && deps.toast) deps.toast('KRUIDENBEURS', r.why, 2);
      rerender();
    });
    body.querySelectorAll('[data-sellst]').forEach((b) => b.onclick = () => { const [id, gr] = b.dataset.sellst.split(':'); sell(id, gr, 5, b); rerender(); });
    const u = body.querySelector('#unpack');
    if (u) u.onclick = () => { const n = unpackCrates(); if (deps.toast) deps.toast('UNPACKED', n ? `${n} crate(s) of Lampas spice went onto the shelves.` : 'No room in the warehouse.', 2); rerender(); };
  }

  // ---- Mengkamer (mixing room) window: pick the blend, grade policy, blend stock, sell to the Groothandel
  const on = (yes) => (yes ? 'style="font-weight:bold;border-style:inset"' : '');
  function mixHTML() {
    const e = ensure(), n = mixers();
    let h = `<div class="well" style="margin-bottom:8px"><b>Mengkamer</b> · Market day <b>${e.day}</b> · ${n ? `<b>${n}</b> Naknik${n > 1 ? 'im' : ''} mix <b>${n * PER_NAKNIK} kg</b> after every outing` : '<span style="color:#a00">No Naknikim yet. Hire them at the Uitzendbureau.</span>'}<br>
      Stock: <b>${stockTotal()} / ${cap()} kg</b> (spices + blends)<br>
      <small>Quality = the average stars of the spices that went in. Lampas grade makes ★ blends, Bio makes ★★★★★.</small></div>`;
    if (e.lastMix) h += `<div class="well" style="margin-bottom:8px;background:#ffffe0"><b>Last night:</b> ${e.lastMix.kg ? `${e.lastMix.kg} kg ${e.lastMix.name} ${stars(Math.round(e.lastMix.q))}` : `no ${e.lastMix.name}, ${e.lastMix.why}`}${e.lastMix.oops ? `<br><i>Naknik: "${e.lastMix.oops}"</i>` : ''}</div>`;
    h += `<div style="margin-bottom:6px">Grades: <button class="b95" data-pol="cheap" ${on(e.policy === 'cheap')}>Cheapest first</button> <button class="b95" data-pol="best" ${on(e.policy === 'best')}>Best first</button></div>`;
    h += '<table class="list"><tr><th>Blend</th><th>Per 10 kg</th><th>Can mix now</th><th>Order</th></tr>';
    for (const b of BLENDS) {
      if (!b.mix) { h += `<tr><td><b>${b.name}</b><br><small>${b.note}</small></td><td>???</td><td>-</td><td><button class="b95" disabled>Locked</button></td></tr>`; continue; }
      let can = n * PER_NAKNIK || PER_NAKNIK; for (const [id, w] of Object.entries(b.mix)) can = Math.min(can, Math.floor(have(id) * 10 / w));
      h += `<tr><td><b>${b.name}</b><br><small>${b.note}</small></td><td><small>${Object.entries(b.mix).map(([id, w]) => `${w} kg ${INGREDIENTS.find((g) => g.id === id).name}${have(id) * 10 / w < 1 ? ' <b style="color:#a00">!</b>' : ''}`).join('<br>')}</small></td><td>${can} kg</td><td>${e.order === b.id ? '<b>Mixing this</b>' : `<button class="b95" data-order="${b.id}">Mix this</button>`}</td></tr>`;
    }
    h += '</table>';
    const stocked = BLENDS.filter((b) => blendOf(b.id).kg > 0);
    h += `<div class="well" style="margin-top:8px"><b>Blends in stock</b> · Groothandel Van Kruidenburg buys <b>${e.wholesaleLeft} kg</b> more today<br>`;
    h += stocked.length ? '<table class="list" style="margin-top:4px"><tr><th>Blend</th><th>Stock</th><th>Quality</th><th>Groothandel pays</th><th></th></tr>' + stocked.map((b) => `<tr><td>${b.name}</td><td>${blendOf(b.id).kg} kg</td><td>${stars(Math.round(blendOf(b.id).q))}</td><td>${fmt(wholesalePrice(b.id))}/kg</td><td><button class="b95" data-sellbl="${b.id}:10">Sell 10 kg</button> <button class="b95" data-sellbl="${b.id}:999">Sell max</button></td></tr>`).join('') + '</table>' : 'Nothing yet. Buy spices at the Kruidenbeurs, then go on an outing while the Naknikim mix.';
    h += '<br><small>Your own joints pay better than the Groothandel: keep enough stock for their orders (Dagrapport).</small></div>';
    return h;
  }
  function mixBind(body, rerender) {
    const e = ensure();
    body.querySelectorAll('[data-pol]').forEach((b) => b.onclick = () => { e.policy = b.dataset.pol; if (deps.save) deps.save(); rerender(); });
    body.querySelectorAll('[data-order]').forEach((b) => b.onclick = () => { e.order = b.dataset.order; if (deps.save) deps.save(); rerender(); });
    body.querySelectorAll('[data-sellbl]').forEach((b) => b.onclick = () => { const [id, kg] = b.dataset.sellbl.split(':'); const r = sellBlend(id, +kg, b); if (!r.ok && deps.toast) deps.toast('GROOTHANDEL', r.why, 2); rerender(); });
  }

  return { INGREDIENTS, GRADES, BLENDS, STOCK_CAP, ensure, advance, update, price, buy, sell, unpackCrates, stockOf, stockTotal, mix, sellBlend, blendOf, deliver, settle, activeClients, trustOf, rollDay, doJob, jobFor, driveDone, jobsHTML, jobsBind, turf, tribute, turfHTML, isRetaken, controlOf, buyMachine, installMachine, machinesHTML, machinesBind, buyWarehouse, hireAt, propertyHTML, propertyBind, cap, mixers, addRep, rankHTML, html, bind, mixHTML, mixBind, reportHTML, reportBind };
}
