// Garage Mo: the Oofmobiel gets stats, two trade-ups and add-ons, plus the street-life nuisances that come with
// owning a van and a pile of cash: parking fines (a wheel clamp after a mission) and tax inspector Van der Belasting.
// Van stats feed the top-down drive (js/drive.js): top speed, how hard hits dent it, and whether the Lampas spot
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
];
const CLAMP_FINE = 150, MO_CLAMP = 100;
const RANK_NAMES = ['Hulpje', 'Mengmeester', 'Kruidenhandelaar', 'Kruidenbaron', 'Spice Master'];
const INSPECTOR_CASH = 8000; // he only bothers with people who carry this much
const HIDE = 5000;

// deps: state, econ, addMoney(n, el), toast(title, text, sec), save(), onPaint(color)
export function createGarage(deps) {
  const { state, econ } = deps;
  const rank = () => (deps.rank ? deps.rank() : 9), locked = (x) => rank() < (x.rank || 0);
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  function ensure() {
    const v = state.van && typeof state.van === 'object' ? state.van : (state.van = {});
    if (!VANS.some((x) => x.id === v.tier)) v.tier = 'blauw';
    v.mods = v.mods || {}; v.fines = +v.fines || 0;
    return v;
  }
  const van = () => VANS.find((x) => x.id === ensure().tier);
  const has = (id) => !!ensure().mods[id];
  function stats() {
    const V = van();
    return { name: V.name, paint: V.paint, cargo: V.cargo + (has('veren') ? 150 : 0), maxV: V.maxV + (has('chip') ? 3 : 0), dmg: V.dmg, tint: has('ramen'), hidden: has('luik') ? HIDE : 0 };
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
    if (!M || v.mods[id]) return; if (locked(M)) return `Mo: "That's for a ${RANK_NAMES[M.rank]}."`; if (state.money < M.price) return 'Not enough Wilders.';
    deps.addMoney(-M.price, el); v.mods[id] = econ.ensure().day;
    if (deps.toast) deps.toast('GARAGE MO', `${M.name} fitted. ${M.text}`, 3.5);
    if (deps.save) deps.save();
  }

  // ---- parking fines: after a long time away on a mission, the van may come back clamped
  function afterMission() {
    const v = ensure(); if (v.clamp) return;
    if (Math.random() < 0.22) { v.clamp = true; if (deps.toast) deps.toast('WIELKLEM!', 'You left the Oofmobiel on the pavement with the hazards on. There\'s a clamp on the front wheel.', 4.5); if (deps.save) deps.save(); }
  }
  function unclamp(how, el) { // how: 'pay' | 'mo'
    const v = ensure(); if (!v.clamp) return true;
    const cost = how === 'mo' ? MO_CLAMP : CLAMP_FINE;
    if (state.money < cost) { if (deps.toast) deps.toast('WIELKLEM', 'Not enough Wilders. The clamp stays.', 2.5); return false; }
    deps.addMoney(-cost, el); v.clamp = false; v.fines++;
    if (deps.toast) deps.toast('WIELKLEM', how === 'mo' ? 'Mo turns up with an angle grinder and a sigh. "Don\'t tell anyone." −' + fmt(cost) : `Fine paid at the Kaasland parking office: −${fmt(cost)}. The clamp is gone.`, 3.5);
    if (deps.save) deps.save(); return true;
  }

  // ---- tax inspector Van der Belasting: rolled on a market day when Eddy has a lot of cash
  function onMarketDay() {
    const v = ensure(), day = econ.ensure().day;
    if (v.inspector && v.inspector.day < day - 1) v.inspector = null; // he gave up
    if (v.inspector || (v.lastInspector && day - v.lastInspector < 6)) return;
    if (state.money < INSPECTOR_CASH) return;
    if (v.warned === day) { v.inspector = { day }; v.warned = null; return; } // Henk warned yesterday: here he is
    if (Math.random() < 0.25) {
      if (econ.has && econ.has('prognose')) { v.warned = day + 1; if (deps.toast) deps.toast('HENK CIJFER', '"Eddy. Psst. A tax inspector is coming tomorrow. Van der Belasting. Spend some cash, or hide it."', 5); }
      else v.inspector = { day };
    }
  }
  function dayCheck() { const v = ensure(), d = econ.ensure().day; if ((state.ngp || 0) !== (v.ngpSeen || 0)) { v.ngpSeen = state.ngp || 0; v.clamp = false; v.inspector = null; } /* New Game+: a clean slate on the street */ if (v.seenDay === undefined) { v.seenDay = d; return; } if (v.seenDay !== d) { v.seenDay = d; onMarketDay(); } }
  const inspectorDue = () => !!ensure().inspector;
  function inspectorFine() { const s = stats(); return Math.min(2500, Math.round(Math.max(0, state.money - s.hidden) * 0.1 / 10) * 10); }
  function settleInspector(how) { // how: 'pay' | 'bribe' | 'saus'; returns the line he says
    const v = ensure(); if (!v.inspector) return '';
    const fine = inspectorFine(); v.inspector = null; v.lastInspector = econ.ensure().day;
    let line;
    if (how === 'bribe') {
      if (state.money >= 500 && Math.random() < 0.6) { deps.addMoney(-500); line = '(pockets the envelope) I see nothing. I was never here. Lovely weather.'; }
      else { deps.addMoney(-Math.min(state.money, fine * 2)); line = `A BRIBE? That's double, Mr. Eddy. ${fmt(fine * 2)}. And I'm writing it down.`; }
    } else if (how === 'saus') {
      if (Math.random() < 0.35) line = '(eats it, closes his eyes) ...Garlic. Real garlic. I will report that everything here is in order.';
      else { deps.addMoney(-fine); line = `Delicious. Also: ${fmt(fine)}. Sauce is not a currency in Kaasland.`; }
    } else { deps.addMoney(-fine); line = fine ? `${fmt(fine)}, thank you. Your paperwork is a disgrace, but your cash is real.` : 'Hm. Nothing to find. Suspicious, but nothing to find.'; }
    if (deps.save) deps.save();
    return line;
  }

  // ---- the PC tab
  function html() {
    const v = ensure(), s = stats(), cur = van();
    let h = `<div class="well"><b>Garage Mo</b> · under the railway · "No phone. Just come by."<br>Your van: <b>${s.name}</b> · cargo <b>${s.cargo} kg</b> · top speed <b>${s.maxV}</b> · damage taken <b>${Math.round(s.dmg * 100)}%</b>${v.clamp ? ' · <b style="color:#a00">clamped!</b>' : ''}<br><small>Speed and armour count on every Oofmobiel drive. Cargo will cap what one Nachtklus can carry home. Fines paid so far: ${v.fines}.</small></div>`;
    h += '<table class="list" style="margin-top:8px"><tr><th>Van</th><th>Cargo</th><th>Speed</th><th>Damage taken</th><th>Price (Mo takes yours for half)</th><th></th></tr>';
    for (const V of VANS) {
      const cost = Math.max(0, V.price - Math.round(cur.price * 0.5));
      const act = v.tier === V.id ? '<b style="color:#070">yours</b>' : !unlocked(V) ? `<small>${locked(V) ? `rank ${RANK_NAMES[V.rank]}` : ''}${locked(V) && V.needs && !state[V.needs] ? ', ' : ''}${V.needs && !state[V.needs] ? V.needsText : ''}</small>` : VANS.indexOf(V) < VANS.indexOf(cur) ? '-' : `<button class="b95" data-vanbuy="${V.id}">Trade up</button>`;
      h += `<tr><td><span style="display:inline-block;width:12px;height:12px;background:#${V.paint.toString(16).padStart(6, '0')};border:1px solid #000;margin-right:6px"></span><b>${V.name}</b><br><small>${V.note}</small></td><td>${V.cargo} kg</td><td>${V.maxV}</td><td>${Math.round(V.dmg * 100)}%</td><td>${V.price && v.tier !== V.id && VANS.indexOf(V) > VANS.indexOf(cur) ? fmt(cost) : '-'}</td><td>${act}</td></tr>`;
    }
    h += '</table><table class="list" style="margin-top:8px"><tr><th>Add-on</th><th>What it does</th><th>Price</th><th></th></tr>';
    for (const M of MODS) h += `<tr><td><b>${M.name}</b></td><td><small>${M.text}</small></td><td>${fmt(M.price)}</td><td>${v.mods[M.id] ? '<b style="color:#070">fitted</b>' : locked(M) ? `<small style="color:#888">at rank ${RANK_NAMES[M.rank]}</small>` : `<button class="b95" data-vanmod="${M.id}">Fit it</button>`}</td></tr>`;
    h += '</table>';
    if (v.clamp) h += `<div class="well" style="margin-top:8px"><b style="color:#a00">Wheel clamp on the Oofmobiel.</b> <button class="b95" data-vanclamp="pay">Pay the fine (${fmt(CLAMP_FINE)})</button> <button class="b95" data-vanclamp="mo">Ask Mo (${fmt(MO_CLAMP)})</button></div>`;
    return h;
  }
  function bind(body, rerender) {
    const msg = (m) => { if (m && deps.toast) deps.toast('GARAGE MO', m, 3); rerender(); };
    body.querySelectorAll('[data-vanbuy]').forEach((b) => b.onclick = () => msg(buyVan(b.dataset.vanbuy, b)));
    body.querySelectorAll('[data-vanmod]').forEach((b) => b.onclick = () => msg(buyMod(b.dataset.vanmod, b)));
    body.querySelectorAll('[data-vanclamp]').forEach((b) => b.onclick = () => { unclamp(b.dataset.vanclamp, b); rerender(); });
  }
  return { ensure, stats, has, buyVan, buyMod, afterMission, unclamp, onMarketDay, dayCheck, inspectorDue, inspectorFine, settleInspector, html, bind, CLAMP_FINE, MO_CLAMP };
}
