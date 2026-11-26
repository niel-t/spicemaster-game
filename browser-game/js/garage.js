// Garage Mo: the Oofmobiel gets stats, two trade-ups and add-ons, plus the street-life nuisances that come with
// owning a van and a pile of cash: parking fines (a wheel clamp after a mission), parking tickets from levels with a paid
// bay (def.parking in js/levels: the gemeente scan car), and tax inspector Van der Belasting, who also collects unpaid tickets.
// Van stats feed the 3D drive (js/rit.js): top speed, how hard hits dent it, and whether the Lampas spot
// you early. Cargo is shown now and caps Nachtklus hauls once those exist. Everything lives in state.van.

export const VANS = [
  { id: 'blauw', name: 'Oofmobiel', paint: 0x2c4fa6, price: 0, cargo: 300, maxV: 26, dmg: 1, note: "Dad's blue van. Rattles, but it's family." },
  { id: 'zilver', rank: 2, name: 'Oofmobiel Zilver', paint: 0xb8bcc4, price: 6500, cargo: 550, maxV: 29, dmg: 0.75, note: 'Silver, newer, a real heater.', needs: 'act1', needsText: 'after the Lampas are finished' },
  { id: 'reus', rank: 3, name: 'De Grijze Reus', paint: 0x5a5e66, price: 14000, cargo: 800, maxV: 32, dmg: 0.55, note: 'The grey top model. Big, fast, and it barely notices a Lampas ram.', needs: 'act2', needsText: 'after Act 2' },
];
export const MODS = [
  { id: 'veren', rank: 2, name: 'Heavy-duty leaf springs', price: 900, text: '+150 kg cargo, and the bumper stops dragging.' },
  { id: 'luik', rank: 2, name: 'Hidden compartment', price: 1500, text: 'Hides W 5.000 of cash from the tax inspector (and later, hot goods from an ambush).' },
  { id: 'chip', rank: 1, name: 'Chip tuning', price: 1200, text: '+3 top speed on every drive.' },
  { id: 'ramen', rank: 1, name: 'Tinted windows', price: 800, text: 'The Lampas spot you later: the first ambush on a drive never happens.' },
  // Act 2 (Hipsterheuvel) and Act 3 (De Duistere Dokken): Mo only gets these parts once you hold a joint there
  { id: 'koel', act: 2, name: 'Refrigerated hold', price: 2400, text: 'Off a Noshgey oat-milk van: +100 kg cargo, and Bio spice stays fresh.' },
  { id: 'eco', act: 2, name: 'Electric assist motor', price: 2800, text: 'Silent take-off from a hipster cargo-bike kit, scaled up: +2 top speed.' },
  { id: 'staal', act: 3, name: 'Dockside steel plating', price: 3600, text: 'Smuggler armour from Kardemomdok: rams do 30% less damage.' },
  { id: 'nitro', act: 3, name: "Smuggler's nitrous", price: 4200, text: 'A bottle in the back, a button on the dash: +4 top speed.' },
];
const ACT_TXT = { 2: 'after a Hipsterheuvel joint', 3: 'after a dock joint' };
const CLAMP_FINE = 150, MO_CLAMP = 100;
const TICKET = 95, CLAMP_AT = 2, COLLECT = 1.5; // a naheffingsaanslag; open tickets that bring the handhaver; the inspector's collection markup
const RANK_NAMES = ['Hulpje', 'Mengmeester', 'Kruidenhandelaar', 'Kruidenbaron', 'Spice Master'];
const INSPECTOR_CASH = 8000; // he only bothers with people who carry this much
const HIDE = 5000;

// deps: state, econ, addMoney(n, el), toast(title, text, sec), save(), onPaint(color)
export function createGarage(deps) {
  const { state, econ } = deps;
  const rank = () => (deps.rank ? deps.rank() : 9), actLocked = (x) => !!x.act && !!deps.actOpen && !deps.actOpen(x.act), locked = (x) => rank() < (x.rank || 0) || actLocked(x);
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  function ensure() {
    const v = state.van && typeof state.van === 'object' ? state.van : (state.van = {});
    if (!VANS.some((x) => x.id === v.tier)) v.tier = 'blauw';
    v.mods = v.mods || {}; v.fines = +v.fines || 0; v.wear = Math.max(0, Math.min(100, +v.wear || 0)); if (!Array.isArray(v.tickets)) v.tickets = [];
    return v;
  }
  const van = () => VANS.find((x) => x.id === ensure().tier);
  const has = (id) => !!ensure().mods[id];
  function stats() {
    const V = van();
    return { livery: deps.livery ? deps.livery() : 'zn', name: V.name, paint: V.paint, cargo: V.cargo + (has('veren') ? 150 : 0) + (has('koel') ? 100 : 0), maxV: V.maxV + (has('chip') ? 3 : 0) + (has('eco') ? 2 : 0) + (has('nitro') ? 4 : 0) - wearSlow(), wear: Math.round(ensure().wear), dmg: V.dmg * (has('staal') ? 0.7 : 1), tint: has('ramen'), hidden: has('luik') ? HIDE : 0 };
  }
  // ---- slijtage (2026-11-26): every drive wears the van a little, dents and the canal a lot. A worn van rattles (slower);
  // Mo fixes it for a price per point that grows with the van (insurance via js/bills.js halves it).
  const WEAR_COST = { blauw: 6, zilver: 8, reus: 11 }, WEAR_RATE = { blauw: 1, zilver: 0.8, reus: 0.6 };
  const wearSlow = () => { const w = ensure().wear; return w >= 90 ? 6 : w >= 60 ? 3 : 0; };
  const wearWord = (w) => (w >= 90 ? 'falling apart' : w >= 60 ? 'rattling' : w >= 30 ? 'worn' : 'fine');
  function addWear(n) { const v = ensure(), before = v.wear; v.wear = Math.min(100, v.wear + n * (WEAR_RATE[v.tier] || 1));
    if (deps.toast && before < 60 && v.wear >= 60) deps.toast('DE OOFMOBIEL RAMMELT', 'Something knocks under the van and the top speed is gone. Garage Mo can fix it.', 4);
    else if (deps.toast && before < 90 && v.wear >= 90) deps.toast('DE OOFMOBIEL VALT UIT ELKAAR', 'Smoke, a whine, and the speedo barely moves. Get it to Garage Mo.', 4.5);
    if (deps.tip && v.wear >= 30) deps.tip('wear'); }
  const insured = () => !!(deps.bills && deps.bills() && deps.bills().insured());
  const repairCost = () => { const v = ensure(); return Math.round(v.wear * (WEAR_COST[v.tier] || 6) * (insured() ? 0.5 : 1) / 5) * 5; };
  function repair(el) {
    const v = ensure(), cost = repairCost(); if (v.wear < 1) return 'Mo: "Nothing to fix. Go and earn some money."';
    if (state.money < cost) return 'Not enough Wilders.';
    deps.addMoney(-cost, el); v.wear = 0; v.repairs = (v.repairs | 0) + 1;
    if (deps.save) deps.save();
    return `Mo: "New shocks, a weld on the exhaust, and I found your sunglasses." −${fmt(cost)}${insured() ? ' (half paid by the insurance)' : ''}.`;
  }
  const unlocked = (V) => (!V.needs || !!state[V.needs]) && !locked(V);
  function buyVan(id, el) {
    const V = VANS.find((x) => x.id === id), v = ensure();
    if (!V || v.tier === id) return;
    if (!unlocked(V)) return `Mo: "Not yet. Come back ${locked(V) ? `when you're ${RANK_NAMES[V.rank]}` : V.needsText}."`;
    const trade = Math.round(van().price * 0.5), cost = V.price - trade;
    if (state.money < cost) return 'Not enough Wilders.';
    deps.addMoney(-cost, el); v.tier = id;
    if (deps.onPaint) deps.onPaint(V.paint);
    if (deps.toast) deps.toast('GARAGE MO', `The ${V.name} is parked outside the warehouse. Your add-ons moved over with you.`, 4);
    if (deps.save) deps.save();
  }
  function buyMod(id, el) {
    const M = MODS.find((x) => x.id === id), v = ensure();
    if (!M || v.mods[id]) return; if (actLocked(M)) return `Mo: "I can't get those parts yet. Come back ${ACT_TXT[M.act]}."`; if (locked(M)) return `Mo: "That's for a ${RANK_NAMES[M.rank]}."`; if (state.money < M.price) return 'Not enough Wilders.';
    deps.addMoney(-M.price, el); v.mods[id] = econ.ensure().day;
    if (deps.toast) deps.toast('GARAGE MO', `${M.name} fitted. ${M.text}`, 3.5);
    if (deps.save) deps.save();
  }

  // ---- parking tickets: the scan car in a level with a paid bay (js/mission.js parking). Two open ones: the handhaver clamps.
  function addTicket(where) {
    const v = ensure(); v.tickets.push({ amt: TICKET, day: econ.ensure().day, where: where || '' });
    const clamp = !v.clamp && v.tickets.length >= CLAMP_AT; if (clamp) v.clamp = true;
    if (deps.save) deps.save();
    return { fine: TICKET, n: v.tickets.length, clamp };
  }
  const ticketSum = () => ensure().tickets.reduce((a, t) => a + (t.amt || TICKET), 0);
  function payTickets(el) {
    const v = ensure(), sum = ticketSum(); if (!sum) return true;
    if (state.money < sum) { if (deps.toast) deps.toast('PARKEERBONNEN', 'Not enough Wilders for the open tickets.', 2.5); return false; }
    deps.addMoney(-sum, el); v.fines += v.tickets.length; v.tickets = [];
    if (deps.toast) deps.toast('PARKEERBONNEN', `Paid ${fmt(sum)} to the gemeente. The handhavers have lost interest in you. For now.`, 3.5);
    if (deps.save) deps.save(); return true;
  }
  // a mission in a level with a paid bay settles its own parking: no random clamp on top of it
  function parkingDone() { ensure().skipClamp = true; }
  // ---- parking fines: after a long time away on a mission, the van may come back clamped
  function afterMission() {
    const v = ensure(); if (v.skipClamp) { v.skipClamp = false; return; } if (v.clamp) return;
    if (Math.random() < 0.22) { v.clamp = true; if (deps.toast) deps.toast('WIELKLEM!', 'You left the Oofmobiel on the pavement with the hazards on. There\'s a clamp on the front wheel.', 4.5); if (deps.save) deps.save(); }
  }
  function unclamp(how, el) { // how: 'pay' | 'mo'
    const v = ensure(); if (!v.clamp) return true;
    const cost = how === 'mo' ? MO_CLAMP : CLAMP_FINE;
    if (state.money < cost) { if (deps.toast) deps.toast('WIELKLEM', 'Not enough Wilders. The clamp stays.', 2.5); return false; }
    const tix = how === 'pay' ? ticketSum() : 0; // the parking office wants the open tickets as well; Mo just cuts the clamp
    if (state.money < cost + tix) { if (deps.toast) deps.toast('WIELKLEM', `The parking office wants ${fmt(cost + tix)}: the clamp and your open tickets. Not enough Wilders.`, 3); return false; }
    deps.addMoney(-(cost + tix), el); v.clamp = false; v.fines++; if (tix) { v.fines += v.tickets.length; v.tickets = []; }
    if (deps.toast) deps.toast('WIELKLEM', how === 'mo' ? 'Mo turns up with an angle grinder and a sigh. "Don\'t tell anyone." −' + fmt(cost) + (ticketSum() ? '. The tickets are still open.' : '') : `Paid at the Kaasland parking office: −${fmt(cost + tix)}${tix ? ' (the clamp and your open tickets)' : ''}. The clamp is gone.`, 3.5);
    if (deps.save) deps.save(); return true;
  }

  // ---- tax inspector Van der Belasting: rolled on a market day when Eddy has a lot of cash
  function onMarketDay() {
    const v = ensure(), day = econ.ensure().day;
    if (v.inspector && v.inspector.day < day - 1) v.inspector = null; // he gave up
    if (v.inspector || (v.lastInspector && day - v.lastInspector < 6)) return;
    if (v.tickets.length >= 3 && Math.random() < 0.5) { v.inspector = { day, tickets: true }; return; } // a pile of unpaid tickets: he comes to collect
    if (state.money < INSPECTOR_CASH) return;
    if (v.warned === day) { v.inspector = { day }; v.warned = null; return; } // Henk warned yesterday: here he is
    if (Math.random() < 0.25) {
      if (econ.has && econ.has('prognose')) { v.warned = day + 1; const ph = deps.phone && deps.phone(); if (!(ph && ph.warnHenk()) && deps.toast) deps.toast('HENK CIJFER', '"Eddy. Psst. A tax inspector is coming tomorrow. Van der Belasting. Spend some cash, or hide it."', 5); }
      else v.inspector = { day };
    }
  }
  function dayCheck() { const v = ensure(), d = econ.ensure().day; if ((state.ngp || 0) !== (v.ngpSeen || 0)) { v.ngpSeen = state.ngp || 0; v.clamp = false; v.inspector = null; v.tickets = []; } /* New Game+: a clean slate on the street */ if (v.seenDay === undefined) { v.seenDay = d; return; } if (v.seenDay !== d) { v.seenDay = d; onMarketDay(); } }
  const inspectorDue = () => !!ensure().inspector;
  const ticketsDue = () => Math.round(ticketSum() * COLLECT / 10) * 10; // open parking tickets, plus collection costs
  function inspectorFine() { const s = stats(); return Math.min(2500, Math.round(Math.max(0, state.money - s.hidden) * 0.1 / 10) * 10) + ticketsDue(); }
  function settleInspector(how) { // how: 'pay' | 'bribe' | 'saus'; returns the line he says
    const v = ensure(); if (!v.inspector) return '';
    const fine = inspectorFine(), hadTix = v.tickets.length; v.inspector = null; v.lastInspector = econ.ensure().day;
    let line;
    if (how === 'bribe') {
      if (state.money >= 500 && Math.random() < 0.6) { deps.addMoney(-500); line = '(pockets the envelope) I see nothing. I was never here. Lovely weather.'; }
      else { deps.addMoney(-Math.min(state.money, fine * 2)); line = `A BRIBE? That's double, Mr. Eddy. ${fmt(fine * 2)}. And I'm writing it down.`; }
    } else if (how === 'saus') {
      if (Math.random() < 0.35) line = '(eats it, closes his eyes) ...Garlic. Real garlic. I will report that everything here is in order.';
      else { deps.addMoney(-fine); line = `Delicious. Also: ${fmt(fine)}. Sauce is not a currency in Kaasland.`; }
    } else { deps.addMoney(-fine); line = fine ? `${fmt(fine)}, thank you. Your paperwork is a disgrace, but your cash is real.` : 'Hm. Nothing to find. Suspicious, but nothing to find.'; }
    if (hadTix && !/I see nothing|in order/.test(line)) { v.fines += v.tickets.length; v.tickets = []; line += ` (${hadTix} parking ticket${hadTix > 1 ? 's' : ''} settled, with collection costs.)`; }
    if (deps.save) deps.save();
    return line;
  }

  // ---- the PC tab
  function html() {
    const v = ensure(), s = stats(), cur = van();
    const wearRow = `<div class="well" style="margin-top:8px"><b>Slijtage:</b> <span style="display:inline-block;width:120px;height:10px;border:1px solid #555;vertical-align:middle;background:linear-gradient(90deg,${v.wear >= 60 ? '#c33' : v.wear >= 30 ? '#d90' : '#3a3'} ${v.wear}%,#eee ${v.wear}%)"></span> ${Math.round(v.wear)}% · ${wearWord(v.wear)}${wearSlow() ? ` (−${wearSlow()} top speed)` : ''} <button class="b95" data-vanfix="1"${v.wear < 1 ? ' disabled' : ''}>Repair (${fmt(repairCost())})</button><br>
      <small>Every drive wears the van; dents, a wreck or a swim in the canal wear it a lot. ${deps.bills ? `<label><input type="checkbox" data-vanins="1"${insured() ? ' checked' : ''}> Van insurance, W 40 a week on the Maandag bills: repairs half price, the canal tow is free.</label>` : ''}</small></div>`;
    let h = `<div class="well"><b>Garage Mo</b> · under the railway · "No phone. Just come by."<br>Your van: <b>${s.name}</b> · cargo <b>${s.cargo} kg</b> · top speed <b>${s.maxV}</b> · damage taken <b>${Math.round(s.dmg * 100)}%</b>${v.clamp ? ' · <b style="color:#a00">clamped!</b>' : ''}<br><small>Speed and armour count on every Oofmobiel drive. Cargo will cap what one Nachtklus can carry home. Fines paid so far: ${v.fines}.</small></div>`;
    if (v.tickets.length) h += `<div class="well" style="margin-top:8px"><b style="color:#a00">${v.tickets.length} open parking ticket${v.tickets.length > 1 ? 's' : ''}</b> (${v.tickets.map((t) => t.where || '?').join(', ')}): ${fmt(ticketSum())}. <small>At ${CLAMP_AT} open tickets a handhaver clamps the van. Leave them and Van der Belasting adds them to his bill, with ${Math.round((COLLECT - 1) * 100)}% collection costs.</small> <button class="b95" data-vantix="1">Pay the tickets</button></div>`;
    h += '<table class="list" style="margin-top:8px"><tr><th>Van</th><th>Cargo</th><th>Speed</th><th>Damage taken</th><th>Price (Mo takes yours for half)</th><th></th></tr>';
    for (const V of VANS) {
      const cost = Math.max(0, V.price - Math.round(cur.price * 0.5));
      const act = v.tier === V.id ? '<b style="color:#070">yours</b>' : !unlocked(V) ? `<small>${locked(V) ? `rank ${RANK_NAMES[V.rank]}` : ''}${locked(V) && V.needs && !state[V.needs] ? ', ' : ''}${V.needs && !state[V.needs] ? V.needsText : ''}</small>` : VANS.indexOf(V) < VANS.indexOf(cur) ? '-' : `<button class="b95" data-vanbuy="${V.id}">Trade up</button>`;
      h += `<tr><td><span style="display:inline-block;width:12px;height:12px;background:#${V.paint.toString(16).padStart(6, '0')};border:1px solid #000;margin-right:6px"></span><b>${V.name}</b><br><small>${V.note}</small></td><td>${V.cargo} kg</td><td>${V.maxV}</td><td>${Math.round(V.dmg * 100)}%</td><td>${V.price && v.tier !== V.id && VANS.indexOf(V) > VANS.indexOf(cur) ? fmt(cost) : '-'}</td><td>${act}</td></tr>`;
    }
    h += '</table><table class="list" style="margin-top:8px"><tr><th>Add-on</th><th>What it does</th><th>Price</th><th></th></tr>';
    for (const M of MODS) h += `<tr><td><b>${M.name}</b></td><td><small>${M.text}</small></td><td>${fmt(M.price)}</td><td>${v.mods[M.id] ? '<b style="color:#070">fitted</b>' : actLocked(M) ? `<small style="color:#888">${ACT_TXT[M.act]}</small>` : locked(M) ? `<small style="color:#888">at rank ${RANK_NAMES[M.rank]}</small>` : `<button class="b95" data-vanmod="${M.id}">Fit it</button>`}</td></tr>`;
    h += '</table>';
    if (v.clamp) h += `<div class="well" style="margin-top:8px"><b style="color:#a00">Wheel clamp on the Oofmobiel.</b> <button class="b95" data-vanclamp="pay">Pay the fine (${fmt(CLAMP_FINE + ticketSum())}${ticketSum() ? ' with the tickets' : ''})</button> <button class="b95" data-vanclamp="mo">Ask Mo (${fmt(MO_CLAMP)})</button></div>`;
    { const i = h.indexOf('</div>') + 6; h = h.slice(0, i) + wearRow + h.slice(i); } // wear right under the van line
    return h;
  }
  function bind(body, rerender) {
    const msg = (m) => { if (m && deps.toast) deps.toast('GARAGE MO', m, 3); rerender(); };
    body.querySelectorAll('[data-vanbuy]').forEach((b) => b.onclick = () => msg(buyVan(b.dataset.vanbuy, b)));
    body.querySelectorAll('[data-vanmod]').forEach((b) => b.onclick = () => msg(buyMod(b.dataset.vanmod, b)));
    body.querySelectorAll('[data-vanclamp]').forEach((b) => b.onclick = () => { unclamp(b.dataset.vanclamp, b); rerender(); });
    body.querySelectorAll('[data-vanfix]').forEach((b) => b.onclick = () => msg(repair(b)));
    body.querySelectorAll('[data-vanins]').forEach((b) => b.onchange = () => { if (deps.bills && deps.bills()) deps.bills().setIns(b.checked); rerender(); });
    body.querySelectorAll('[data-vantix]').forEach((b) => b.onclick = () => { payTickets(b); rerender(); });
  }
  return { addWear, repair, repairCost, insured, ensure, stats, has, buyVan, buyMod, afterMission, unclamp, addTicket, payTickets, ticketSum, parkingDone, TICKET, onMarketDay, dayCheck, inspectorDue, inspectorFine, settleInspector, html, bind, CLAMP_FINE, MO_CLAMP };
}
