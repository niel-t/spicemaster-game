// Weekrekeningen (2026-11-26): the bills that come with running a spice business in Kaasland. Every Maandag morning
// (js/kaasweer.js: day 1 is a Maandag) the week's bills are paid out of Eddy's Wilders:
//   Erfpacht   the ground lease the gemeente charges on the loods plot, more once De Hal and De Overkapping stand
//   Panden     the extra warehouses (Kroketkade, Uitjesbuurt, Spekbuurt)
//   Woning     VvE service costs on the Bovenwoning, the erfpacht canon on the Grachtenpand
//   Lonen      the Naknikim's weekly pay
//   Brandstof  diesel for every drive in the Oofmobiel that week (bigger vans drink more)
//   Verzekering optional van insurance at Garage Mo: half price repairs and a free tow out of the canal
// Tuned to "start slow, hustle, become a trader": the first week is on Pa, rent is cheaper while Eddy is a Hulpje or
// Mengmeester, and a week he can't pay isn't game over: the bill waits (a 10% incasso fee after another week) and unpaid
// Naknikim sulk (mood drops, so they nap) until they get their money.
// state.bills = { from, week, fuel, ins, debt: [{ week, total, items, late }], last: { week, total, items, paid } }

const WAGE_DAY = 18; // W per Naknik per day
const FUEL = { blauw: 25, zilver: 32, reus: 45 };
const RENT = { loods: 100, hal: 160, tent: 140, pand: 70, boven: 55, gracht: 160, ins: 40 };
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

// deps: state, econ, garage, loods(), woning(), crew, rank(), addMoney(n, el), toast(t, txt, s), tip(k), save(), eligible(), dayName(d)
export function createBills(deps) {
  const { state, econ } = deps;
  function ensure() {
    const b = state.bills && typeof state.bills === 'object' ? state.bills : (state.bills = {});
    b.fuel = b.fuel | 0; b.ins = !!b.ins; if (!Array.isArray(b.debt)) b.debt = [];
    return b;
  }
  const day = () => econ.ensure().day;
  const weekOf = (d) => Math.floor((d - 1) / 7) + 1; // week 1 = days 1-7 (Maandag to Zondag)
  const rentMult = () => { const r = deps.rank ? deps.rank() : 2; return r <= 0 ? 0.6 : r === 1 ? 0.8 : 1; }; // the gemeente gives starters a break
  function items() {
    const L = deps.loods && deps.loods(), W = deps.woning && deps.woning(), out = [], m = rentMult();
    const add = (k, label, amt, note) => { if (amt > 0) out.push({ k, label, amt: Math.round(amt / 5) * 5, note: note || '' }); };
    let erf = RENT.loods; const notes = ['the loods plot'];
    if (L && L.has && L.has('hal')) { erf += RENT.hal; notes.push('De Hal'); }
    if (L && L.has && L.has('tent')) { erf += RENT.tent; notes.push('De Overkapping'); }
    add('erfpacht', 'Erfpacht', erf * m, notes.join(', '));
    const wh = econ.ensure().wh || {}, ret = econ.ensure().retaken || {}, panden = Object.keys(wh).filter((id) => wh[id] && !ret[id]);
    add('panden', 'Panden', panden.length * RENT.pand * m, `${panden.length} extra warehouse${panden.length === 1 ? '' : 's'}`);
    const homes = W && W.ensure ? W.ensure().homes || [] : [];
    if (homes.includes(1)) add('boven', 'VvE Bovenwoning', RENT.boven * m, 'service costs');
    if (homes.includes(2)) add('gracht', 'Erfpacht Grachtenpand', RENT.gracht * m, 'canon to the gemeente');
    const crew = deps.crew ? deps.crew.ensure().length : (state.naknik | 0);
    add('lonen', 'Lonen', crew * WAGE_DAY * 7, `${crew} Naknik${crew === 1 ? '' : 'im'} × ${fmt(WAGE_DAY)} a day`);
    const b = ensure(), tier = deps.garage ? deps.garage.ensure().tier : 'blauw';
    add('brandstof', 'Brandstof', b.fuel * (FUEL[tier] || 25), `${b.fuel} drive${b.fuel === 1 ? '' : 's'} this week`);
    if (b.ins) add('verzekering', 'Verzekering', RENT.ins, 'Garage Mo, van cover');
    return out;
  }
  const total = (list) => list.reduce((a, x) => a + x.amt, 0);
  const debtSum = () => ensure().debt.reduce((a, d) => a + d.total, 0);

  // a market day began (econ deps.onDay): on a Maandag the week that just ended is billed
  function onDay(d) {
    const b = ensure();
    if (!deps.eligible || !deps.eligible()) { b.from = null; return; }
    if (!b.from) { b.from = d; b.week = weekOf(d); b.fuel = 0; return; } // the clock starts once the business does
    for (const x of b.debt) if (!x.late && weekOf(d) > x.week + 1) { x.late = true; x.total = Math.round(x.total * 1.1 / 5) * 5; } // another week unpaid: incasso
    if ((d - 1) % 7 !== 0 || weekOf(d) <= (b.week || 0)) return;
    const wk = weekOf(d) - 1; b.week = weekOf(d);
    const list = items(), sum = total(list); b.fuel = 0;
    if (d - b.from < 7) { // the first (part) week: Pa paid it
      b.last = { week: wk, total: sum, items: list, paid: 'pa' };
      if (deps.toast) deps.toast('WEEKREKENINGEN', `Your first week of bills (${fmt(sum)}) is on Pa. "From now on the gemeente writes to you, jongen." Every Maandag: erfpacht, lonen, brandstof. <i>(Rekeningen on the PC)</i>`, 6);
      if (deps.tip) deps.tip('bills'); if (deps.save) deps.save(); return;
    }
    if (!sum) return;
    if (state.money >= sum) {
      deps.addMoney(-sum); b.last = { week: wk, total: sum, items: list, paid: true };
      if (deps.toast) deps.toast('WEEKREKENINGEN BETAALD', `${list.map((x) => `${x.label} ${fmt(x.amt)}`).join(' · ')}. Total −${fmt(sum)}.`, 5);
    } else {
      b.debt.push({ week: wk, total: sum, items: list, late: false }); b.last = { week: wk, total: sum, items: list, paid: false };
      sulk();
      if (deps.toast) deps.toast('AANMANING', `Not enough Wilders for this week's bills (${fmt(sum)}). They wait on the PC (Rekeningen), but the Naknikim want their pay and the gemeente adds 10% if it's still open next Maandag.`, 6);
      if (deps.tip) deps.tip('aanmaning');
    }
    if (deps.save) deps.save();
  }
  function sulk() { if (!deps.crew) return; for (const m of deps.crew.ensure()) m.mood = Math.max(0, (m.mood | 0) - 25); }
  function payDebt(el) {
    const b = ensure(), sum = debtSum(); if (!sum) return true;
    if (state.money < sum) { if (deps.toast) deps.toast('REKENINGEN', `You need ${fmt(sum)} to clear the open bills.`, 2.5); return false; }
    deps.addMoney(-sum, el); b.debt = []; if (b.last && b.last.paid === false) b.last.paid = true;
    if (deps.crew) for (const m of deps.crew.ensure()) m.mood = Math.min(100, (m.mood | 0) + 15);
    if (deps.toast) deps.toast('REKENINGEN BETAALD', `−${fmt(sum)}. The gemeente is quiet again and the Naknikim count their money twice.`, 3.5);
    if (deps.save) deps.save(); return true;
  }
  const drove = () => { ensure().fuel++; };
  const owing = () => debtSum();
  const nextMonday = () => { const d = day(); return d + ((8 - (d % 7)) % 7 || 7); };

  // ---- the PC tab
  function html() {
    const b = ensure(), now = items(), sum = total(now), owe = debtSum();
    const on = !!(deps.eligible && deps.eligible());
    const row = (x) => `<tr><td><b>${x.label}</b><br><small>${x.note}</small></td><td style="text-align:right">${fmt(x.amt)}</td></tr>`;
    let h = `<div class="well"><b>Weekrekeningen</b> · paid every <b>Maandag</b> morning from your Wilders. ${on ? `Next: <b>day ${nextMonday()}</b>${deps.dayName ? ` (${deps.dayName(nextMonday())})` : ''}.` : 'They start once the mixing table is running.'}${rentMult() < 1 ? ` <small>Starter discount on rent: ${Math.round((1 - rentMult()) * 100)}% while you're a ${rentMult() < 0.7 ? 'Hulpje' : 'Mengmeester'}.</small>` : ''}</div>`;
    if (owe) h += `<div class="well" style="margin-top:8px;background:#fff0f0"><b style="color:#a00">Open: ${fmt(owe)}</b> ${b.debt.map((d) => `(week ${d.week}${d.late ? ', +10% incasso' : ''})`).join(' ')}. <small>Unpaid Naknikim are grumpy and nap at the table.</small> <button class="b95" data-billpay="1">Pay ${fmt(owe)}</button></div>`;
    h += `<table class="list" style="margin-top:8px"><tr><th>This week so far</th><th style="text-align:right">Bill</th></tr>${now.map(row).join('') || '<tr><td colspan="2"><small>Nothing yet.</small></td></tr>'}<tr><td><b>Total on Maandag</b></td><td style="text-align:right"><b>${fmt(sum)}</b></td></tr></table>`;
    if (b.last) h += `<div class="well" style="margin-top:8px"><small>Last week (${b.last.week}): ${fmt(b.last.total)} · ${b.last.paid === 'pa' ? 'paid by Pa' : b.last.paid ? 'paid' : '<b style="color:#a00">not paid</b>'}</small></div>`;
    const tier = deps.garage ? deps.garage.ensure().tier : 'blauw';
    h += `<div class="well" style="margin-top:8px"><small><b>How it adds up:</b> erfpacht ${fmt(RENT.loods)} on the loods (+${fmt(RENT.hal)} De Hal, +${fmt(RENT.tent)} De Overkapping), ${fmt(RENT.pand)} a pand, Naknikim ${fmt(WAGE_DAY)} a day each, diesel ${fmt(FUEL[tier] || 25)} a drive in your van. Van insurance is at Garage Mo.</small></div>`;
    return h;
  }
  function bind(body, rerender) { body.querySelectorAll('[data-billpay]').forEach((x) => x.onclick = () => { payDebt(x); rerender(); }); }
  const setIns = (on) => { ensure().ins = !!on; if (deps.save) deps.save(); };
  return { ensure, items, onDay, payDebt, drove, owing, html, bind, setIns, insured: () => ensure().ins, weekOf, WAGE_DAY, FUEL, RENT };
}
