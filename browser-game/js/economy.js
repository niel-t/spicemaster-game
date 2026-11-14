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
export const STOCK_CAP = 200; // kg in the home warehouse
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
    const e = ensure(), n = state.naknik || 0, b = BLENDS.find((x) => x.id === e.order);
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
  const activeClients = () => { const ids = deps.joints ? deps.joints() : []; return CLIENTS.filter((c) => ids.includes(c.id)); };
  const trustOf = (id) => { const e = ensure(); if (e.trust[id] === undefined) e.trust[id] = 60; return e.trust[id]; };
  const addTrust = (id, d) => { const e = ensure(); e.trust[id] = clamp(trustOf(id) + d, 0, 100); };
  const clientPrice = (blendId, q) => { const b = BLENDS.find((x) => x.id === blendId); const ctl = deps.control ? deps.control(blendId) : 1; return Math.round(b.value * (0.6 + 0.15 * q) * ctl * 10) / 10; };
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
        missed++; addTrust(c.id, c.kind === 'loyal' ? -5 : -15);
        rows.push({ name: c.name, want: `${want} kg ${b.name}`, note: c.kind === 'loyal' ? '"No spice today? Next time, jongen."' : 'MISSED: no stock', pay: 0 });
      } else {
        have.kg -= kg; if (have.kg <= 0) delete e.blends[c.blend]; else e.blends[c.blend] = have;
        let pay = Math.round(clientPrice(c.blend, have.q) * kg * (e.event && e.event.blend === c.blend ? e.event.pay : 1)), note = kg < want ? `short ${want - kg} kg` : 'on time';
        if (Math.round(have.q) < c.minQ && c.kind !== 'loyal') { pay = Math.round(pay / 2); addTrust(c.id, -10); note = `"${pick(COMPLAINTS)}" paid half`; }
        else addTrust(c.id, kg < want ? 0 : 4);
        if (c.kind === 'haggler' && Math.random() < 0.35 && !e.cards.some((x) => x.id === c.id)) { e.cards.push({ id: c.id, name: c.name, who: c.who, text: pick(HAGGLES), amount: pay }); note += ', wants to haggle'; pay = 0; }
        else if (c.kind === 'late' && Math.random() < 0.5) { const d = 1 + Math.floor(Math.random() * 2); e.owed.push({ name: c.name, amount: pay, days: d }); note += `, pays in ${d} day(s)`; pay = 0; }
        rows.push({ name: c.name, want: `${want} kg ${b.name}`, kg, q: have.q, note, pay });
        paid += pay;
      }
      if (trustOf(c.id) < 20 && !e.pause[c.id]) { e.pause[c.id] = 2; rows.at(-1).note += '. Fed up: back to the Lampas for 2 days'; }
    }
    if (paid) deps.addMoney(paid);
    return { day: e.day, rows, paid, missed };
  }
  const orderKg = (c) => { const ev = ensure().event; return Math.round(c.kg * (ev && ev.vol && (!ev.only || ev.only === c.id) ? ev.vol : 1)); };

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
    if (state.district1) cand.push({ kind: 'scout', reward: 400, title: 'Scout Oud-Vettenburg', desc: 'Drive the Oofmobiel to Oud-Vettenburg and back. The Lampas will try to ram you.' });
    for (let i = cand.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [cand[i], cand[j]] = [cand[j], cand[i]]; }
    e.jobs = cand.slice(0, 3).map((j, i) => ({ ...j, n: i, done: false }));
    e.event = null;
    if (r() < 0.35) { const ev = rp(EVENTS), bl = rp(BLENDS.filter((x) => x.mix)); e.event = { id: ev.id, text: ev.text(bl), vol: ev.vol, pay: ev.pay, only: ev.only, blend: ev.pay ? bl.id : null }; }
  }
  function finishJob(j, el) {
    j.done = true; if (j.reward) deps.addMoney(j.reward, el);
    if (j.kind === 'debt') { const e = ensure(), i = e.owed.findIndex((o) => CLIENTS.find((c) => c.id === j.level)?.name === o.name); if (i >= 0) e.owed.splice(i, 1); }
    if (deps.toast) deps.toast('JOB DONE', `${j.title}${j.reward ? `: +${fmt(j.reward)}` : ''}.`, 3);
    if (deps.save) deps.save();
  }
  function raidDone(raid) { for (const j of ensure().jobs || []) if (!j.done && (j.kind === 'stash' || j.kind === 'debt') && j.level === raid.id && raid.remix) finishJob(j); }
  function driveDone(arrived) { for (const j of ensure().jobs || []) if (!j.done && j.kind === 'scout' && arrived) finishJob(j); }
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
    h += '<table class="list"><tr><th>Job</th><th>Pays</th><th></th></tr>';
    for (const j of e.jobs) {
      const cost = j.kind === 'deal' ? Math.round(price(j.ing, 'std') * (1 - j.off)) * j.kg : 0;
      const act = j.done ? '<b style="color:#070">DONE</b>' : j.kind === 'spoed' ? `<button class="b95" data-job="${j.n}">Deliver (${Math.floor(blendOf(j.blend).kg)}/${j.kg} kg)</button>` : j.kind === 'deal' ? `<button class="b95" data-job="${j.n}">Buy for ${fmt(cost)}</button>` : j.kind === 'scout' ? '<i>Van map: Drive to Oud-Vettenburg</i>' : '<i>Van map: remix raid</i>';
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
        <button class="b95" data-card="${i}:discount">Give 20% off</button> <button class="b95" data-card="${i}:insist">Insist on full pay</button> <button class="b95" data-card="${i}:cut">Cut off their supply</button></div>`;
    }
    const r = e.report;
    if (e.event) h += `<div class="well" style="margin-bottom:8px;background:#ffffe0"><b>TODAY:</b> ${e.event.text}.</div>`;
    h += `<div class="well" style="margin-bottom:8px"><b>${r ? `Day ${r.day}` : 'No report yet'}</b>${r ? ` · Paid today <b>${fmt(r.paid)}</b>${r.missed ? ` · <span style="color:#a00">${r.missed} missed</span>` : ''}` : ''}`;
    h += r && r.rows.length ? '<table class="list" style="margin-top:4px"><tr><th>Client</th><th>Order</th><th>Delivered</th><th>Paid</th><th></th></tr>' + r.rows.map((x) => `<tr><td>${x.name}</td><td>${x.want || ''}</td><td>${x.kg ? `${x.kg} kg ${stars(Math.round(x.q))}` : '-'}</td><td>${x.pay ? fmt(x.pay) : '-'}</td><td><small>${x.note}</small></td></tr>`).join('') + '</table>' : '<br>Go on an outing (a mission or a drive) to end the day.';
    h += '</div>';
    h += '<table class="list"><tr><th>Client</th><th>Wants daily</th><th>Min. quality</th><th>Pays now</th><th>Trust</th></tr>';
    for (const c of cl) {
      const b = BLENDS.find((x) => x.id === c.blend), t = trustOf(c.id);
      h += `<tr><td><b>${c.name}</b><br><small>${c.who} · ${{ loyal: 'loyal, never complains', haggler: 'haggles', late: 'pays late', picky: 'picky about quality' }[c.kind]}</small></td><td>${c.kg} kg ${b.name}</td><td>${stars(c.minQ)}</td><td>${fmt(clientPrice(c.blend, Math.max(1, blendOf(c.blend).q || 3)))}/kg</td><td>${e.pause[c.id] ? '<span style="color:#a00">with the Lampas</span>' : `<span style="color:${t < 35 ? '#a00' : t > 70 ? '#070' : '#000'}">${t}</span>`}</td></tr>`;
    }
    h += '</table>';
    if (e.owed.length) h += `<p>Owed to you: ${e.owed.map((o) => `${o.name} ${fmt(o.amount)} (in ${o.days} day${o.days > 1 ? 's' : ''})`).join(', ')}</p>`;
    h += `<p><small>Take more joints to win more clients. ${cl.length < CLIENTS.length ? 'Each De Natte Worst territory you own becomes a client.' : ''}</small></p>`;
    return h;
  }
  function reportBind(body, rerender) {
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
  const space = () => STOCK_CAP - stockTotal();

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
      Warehouse stock: <b>${stockTotal()} / ${STOCK_CAP} kg</b>${disc > 0 ? ` · Home turf discount <b>${Math.round(disc * 100)}%</b>` : ''}<br>
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
    const e = ensure(), n = state.naknik || 0;
    let h = `<div class="well" style="margin-bottom:8px"><b>Mengkamer</b> · Market day <b>${e.day}</b> · ${n ? `<b>${n}</b> Naknik${n > 1 ? 'im' : ''} mix <b>${n * PER_NAKNIK} kg</b> after every outing` : '<span style="color:#a00">No Naknikim yet. Hire them at the Uitzendbureau.</span>'}<br>
      Stock: <b>${stockTotal()} / ${STOCK_CAP} kg</b> (spices + blends)<br>
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

  return { INGREDIENTS, GRADES, BLENDS, STOCK_CAP, ensure, advance, update, price, buy, sell, unpackCrates, stockOf, stockTotal, mix, sellBlend, blendOf, deliver, settle, activeClients, trustOf, rollDay, doJob, jobFor, driveDone, jobsHTML, jobsBind, html, bind, mixHTML, mixBind, reportHTML, reportBind };
}
