// Cijfers en prestaties (2026-11-26): what Eddy has done so far, and a wall of prestaties to chase.
// Counters live in state.stats.n (kg sold, Wilders earned, raids won, metres walked...), the best week in state.stats.best,
// unlocked prestaties in state.stats.ach { id: day }. Other modules only call add(key, n) or max(key, v); the Stats tab
// in Overzicht (js/hub.js) shows it all. A new prestatie gives a toast and a small bonus.
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
const num = (n) => Math.round(n).toLocaleString('nl-NL');

const ROWS = [ // [key, label, format]
  ['days', 'Market days played', num], ['earned', 'Wilders earned', fmt], ['spent', 'Wilders spent', fmt], ['bestWeek', 'Best week (earned)', fmt], ['bestDay', 'Best single day (clients)', fmt],
  ['kg', 'Spice sold', (n) => num(n) + ' kg'], ['deliveries', 'Orders delivered', num], ['missed', 'Orders missed', num],
  ['raids', 'Raids won', num], ['sGrades', 'S grades', num], ['kos', 'Fights won (knock-outs)', num], ['heists', 'Nachtklussen pulled off', num],
  ['klusjes', 'Klusjes for shopkeepers', num], ['vaste', 'Vaste-klant orders served', num], ['stam', 'Stamklanten served', num], ['haggles', 'Deals haggled', num], ['goals', "Shooki's goals done", num], ['streak', 'Longest goal streak (days)', num],
  ['walked', 'Walked', (n) => (n / 1000).toFixed(1) + ' km'], ['biked', 'Cycled', (n) => (n / 1000).toFixed(1) + ' km'], ['driven', 'Driven in borrowed cars', (n) => (n / 1000).toFixed(1) + ' km'],
  ['borrowed', 'Cars borrowed', num], ['chases', 'Police chases', num], ['escapes', 'Times you shook them off', num], ['arrests', 'Times arrested', num], ['fines', 'Fines paid', fmt], ['billsPaid', 'Weeks of bills paid', num],
];
export const ACH = [
  { id: 'eerste', name: 'Eerste klant', desc: 'Deliver your first order.', w: 50, t: (n) => n.deliveries >= 1 },
  { id: 'honderd', name: 'Honderd kilo', desc: 'Sell 100 kg of spice.', w: 100, t: (n) => n.kg >= 100 },
  { id: 'ton', name: 'Een ton kruiden', desc: 'Sell 1.000 kg of spice.', w: 500, t: (n) => n.kg >= 1000 },
  { id: 'tienk', name: 'Tien mille', desc: 'Earn W 10.000 in total.', w: 150, t: (n) => n.earned >= 10000 },
  { id: 'ton2', name: 'Een ton Wilders', desc: 'Earn W 100.000 in total.', w: 750, t: (n) => n.earned >= 100000 },
  { id: 'week', name: 'Goede week', desc: 'Earn W 5.000 in one week.', w: 200, t: (n) => n.bestWeek >= 5000 },
  { id: 'raid1', name: 'Deur ingetrapt', desc: 'Win your first raid.', w: 100, t: (n) => n.raids >= 1 },
  { id: 'raid10', name: 'Vaste gast bij de Lampas', desc: 'Win 10 raids.', w: 400, t: (n) => n.raids >= 10 },
  { id: 'sgrade', name: 'Stijlvol', desc: 'Get an S grade on a raid.', w: 150, t: (n) => n.sGrades >= 1 },
  { id: 'ko50', name: 'Zware jongen', desc: 'Win 50 fights.', w: 250, t: (n) => n.kos >= 50 },
  { id: 'klus5', name: 'Buurtjongen', desc: 'Do 5 klusjes for shopkeepers.', w: 150, t: (n) => n.klusjes >= 5 },
  { id: 'klus13', name: 'Iedereen kent Eddy', desc: 'Do a klusje for all 13 shopkeepers.', w: 500, t: (n, c) => c.jobsDone() >= 13 },
  { id: 'stam10', name: 'Stamtafel', desc: 'Serve stamklanten 25 times.', w: 150, t: (n) => n.stam >= 25 },
  { id: 'hart', name: 'Hart van goud', desc: 'Get a stamklant to five hearts.', w: 200, t: (n, c) => c.maxHearts() >= 5 },
  { id: 'streak5', name: 'Shooki is trots', desc: "Do all three of Shooki's goals five days in a row.", w: 300, t: (n) => n.streak >= 5 },
  { id: 'wandel', name: 'Vierdaagse', desc: 'Walk 10 km.', w: 100, t: (n) => n.walked >= 10000 },
  { id: 'fiets', name: 'Echte Kaaslander', desc: 'Cycle 5 km.', w: 100, t: (n) => n.biked >= 5000 },
  { id: 'joyride', name: 'Even lenen', desc: 'Borrow a car.', w: 0, t: (n) => n.borrowed >= 1 },
  { id: 'ontsnapt', name: 'Kwijt!', desc: 'Shake off the police.', w: 100, t: (n) => n.escapes >= 1 },
  { id: 'boef', name: 'Bekende van de politie', desc: 'Get arrested three times.', w: 0, t: (n) => n.arrests >= 3 },
  { id: 'eenvanons', name: 'Een van ons', desc: 'Reach "Een van ons" in a buurt.', w: 300, t: (n, c) => c.maxRep() >= 70 },
  { id: 'rekening', name: 'Keurige burger', desc: 'Pay four weeks of bills.', w: 150, t: (n) => n.billsPaid >= 4 },
  { id: 'nacht', name: 'Nachtbraker', desc: 'Pull off a Nachtklus.', w: 150, t: (n) => n.heists >= 1 },
  { id: 'kwartier', name: 'Kipkruidenkwartier is van ons', desc: 'Take all three joints of Kipkruidenkwartier.', w: 500, t: (n, c) => c.state.district1 },
];

// deps: state, econ, addMoney, toast, beep, save(), jobsDone(), maxHearts(), maxRep()
export function createStats(deps) {
  const { state } = deps;
  function S() { const s = state.stats && typeof state.stats === 'object' ? state.stats : (state.stats = {}); if (!s.n || typeof s.n !== 'object') s.n = {}; if (!s.ach || typeof s.ach !== 'object') s.ach = {}; s.week = +s.week || 0; return s; }
  const n = () => { const o = S().n; for (const [k] of ROWS) if (typeof o[k] !== 'number') o[k] = 0; return o; };
  const add = (k, v = 1) => { const o = n(); o[k] = (o[k] || 0) + v; };
  const max = (k, v) => { const o = n(); if (v > (o[k] || 0)) o[k] = v; };
  function money(v) { if (state.step !== 'free') return; if (v > 0) { add('earned', v); S().week += v; } else add('spent', -v); }
  function onDay(d) { // a market day began: yesterday's report, and on Maandag the week closes
    const s = S(); add('days');
    const rep = deps.econ.ensure().report;
    if (rep && Array.isArray(rep.rows)) { let kg = 0, ok = 0, miss = 0; for (const r of rep.rows) { if (r.pay > 0 && r.kg) { kg += r.kg; ok++; } else if (/MISSED/i.test(r.note || '')) miss++; } add('kg', kg); add('deliveries', ok); add('missed', miss); max('bestDay', rep.paid || 0); }
    if ((d - 1) % 7 === 0) { max('bestWeek', s.week); s.week = 0; }
    const v = state.vandaag; if (v) max('streak', v.streak | 0);
  }
  let t = 0;
  function update(dt) {
    if ((t += dt) < 2 || state.step !== 'free') return; t = 0;
    const s = S(), o = n(), ctx = { state, jobsDone: deps.jobsDone, maxHearts: deps.maxHearts, maxRep: deps.maxRep };
    max('bestWeek', s.week);
    for (const a of ACH) {
      if (s.ach[a.id]) continue; let ok = false; try { ok = !!a.t(o, ctx); } catch (e) { ok = false; }
      if (!ok) continue;
      s.ach[a.id] = deps.econ.ensure().day; if (a.w) deps.addMoney(a.w);
      deps.toast('PRESTATIE', `<b>${a.name}</b>: ${a.desc}${a.w ? ` +${fmt(a.w)}` : ''}`, 4.5); if (deps.beep) { deps.beep(784, 0.08, 'triangle', 0.05); setTimeout(() => deps.beep(1047, 0.14, 'triangle', 0.05), 110); }
      if (deps.save) deps.save(); break; // one at a time
    }
  }
  function html() {
    const s = S(), o = n(), got = ACH.filter((a) => s.ach[a.id]).length;
    let h = `<div class="well"><b>${got}/${ACH.length} prestaties</b> · this week so far: <b>${fmt(s.week)}</b> earned</div>`;
    h += `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:6px;margin-top:8px">${ACH.map((a) => { const g = s.ach[a.id]; return `<div class="well" style="${g ? 'background:#f2fbe8;border-color:#9ad06a' : 'opacity:.72'}"><b>${g ? '★' : '☆'} ${a.name}</b><br><small>${a.desc}${g ? ` · day ${g}` : a.w ? ` · ${fmt(a.w)}` : ''}</small></div>`; }).join('')}</div>`;
    h += `<table class="list" style="margin-top:10px"><tr><th>Cijfers</th><th style="text-align:right"></th></tr>${ROWS.filter(([k]) => o[k] > 0).map(([k, l, f]) => `<tr><td>${l}</td><td style="text-align:right"><b>${f(o[k])}</b></td></tr>`).join('') || '<tr><td colspan="2"><small>Nothing to count yet. Go and sell some spice.</small></td></tr>'}</table>`;
    return h;
  }
  return { add, max, money, onDay, update, html, n, ensure: S, ACH };
}
