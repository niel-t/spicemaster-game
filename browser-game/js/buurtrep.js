// Buurtreputatie (2026-11-26): what each neighbourhood thinks of Eddy, from -100 (gehaat) to +100 (een van ons).
// It moves with what he does there: on-time deliveries and missed orders to the joints, fair deals and lies caught
// while haggling, raids that free a street, swinging the Maboota or hitting people on the street, Wijkagent Bakker's
// visits, and the klusjes and vaste-klant orders of the shopkeepers (js/winkels.js). It drifts slowly back to neutral.
// What it changes (no new systems, it leans on the ones there are):
//   prices   joints in a buurt that likes Eddy pay up to 12% more for their spice, a buurt that hates him up to 12% less
//   hiring   the Uitzendbureau sends an extra candidate (a neighbour's kid, hard-working) when the Kipkruidenkade likes
//            Eddy, and one fewer when it doesn't
//   police   on a street that likes him people wait longer before calling the police about the Maboota (and quicker
//            where they don't); Wijkagent Bakker lets a well-liked Eddy off with a warning once
//   heat     the gangs' heat (economy.js) cools a little faster where the buurt is on Eddy's side, and climbs where it isn't
// state.buurtrep = { v: { [id]: n }, log: [{ day, id, d, why }], tier: { [id]: t } }

export const BUURTEN = [
  { id: 'kade', name: 'Kipkruidenkade', what: 'your own block, both sides of the canal', start: 10 },
  { id: 'spekbuurt', name: 'Spekbuurt', what: 'butchers, the paid parking and Manager Kees', clients: ['spekbuurt', 'bram'], heat: 'lampas' },
  { id: 'kroketkade', name: 'Kroketkade', what: 'the quay with the snackbars and the fish stores', clients: ['kroketkade'], heat: 'lampas' },
  { id: 'uitjesbuurt', name: 'Uitjesbuurt', what: 'onion cellars and Mevrouw Ui', clients: ['uitjesbuurt'], heat: 'lampas' },
  { id: 'vettenburg', name: 'Oud-Vettenburg', what: 'the Lampas joints you took', group: 'Oud-Vettenburg', heat: 'lampas', show: (st) => !!st.district1 },
  { id: 'hipster', name: 'Hipsterheuvel', what: 'oat milk, beards, the Noshgey Kariot', group: 'Hipsterheuvel', heat: 'noshgey', show: (st) => !!st.act1 },
  { id: 'dokken', name: 'De Duistere Dokken', what: 'the Abdavissies\' docks', group: 'Dokken', heat: 'abdavissies', show: (st) => !!st.act2 },
  { id: 'zandwijk', name: 'De Zandwijk', what: 'the Paravim souk', group: 'Zandwijk', heat: 'paravim', show: (st) => !!st.act2 },
];
const TIERS = [[-60, 'Gehaat', '#b0201a'], [-25, 'Gewantrouwd', '#d06a1a'], [10, 'Onbekend', '#8a8a8a'], [35, 'Bekend gezicht', '#5a9a3a'], [70, 'Gerespecteerd', '#2a8a5a'], [101, 'Een van ons', '#1a6aa8']];
export const tierOf = (v) => { for (let i = 0; i < TIERS.length; i++) if (v < TIERS[i][0]) return { i, name: TIERS[i][1], col: TIERS[i][2] }; return { i: 5, name: TIERS[5][1], col: TIERS[5][2] }; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// deps: state, econ, toast(t, txt, s), save(), dayName?
export function createBuurtRep(deps) {
  const { state } = deps;
  function S() {
    const s = state.buurtrep && typeof state.buurtrep === 'object' ? state.buurtrep : (state.buurtrep = {});
    if (!s.v || typeof s.v !== 'object') s.v = {}; if (!Array.isArray(s.log)) s.log = []; if (!s.tier || typeof s.tier !== 'object') s.tier = {};
    for (const b of BUURTEN) if (typeof s.v[b.id] !== 'number') s.v[b.id] = b.start || 0;
    return s;
  }
  const get = (id) => S().v[id] || 0;
  const day = () => deps.econ.ensure().day;
  const byId = Object.fromEntries(BUURTEN.map((b) => [b.id, b]));
  const ofClient = (cid) => (BUURTEN.find((b) => b.clients && b.clients.includes(cid)) || (cid === 'schmatzel' ? byId.kade : null));
  function add(id, d, why, quiet) {
    if (!byId[id] || !d || state.step !== 'free') return;
    const s = S(), v0 = s.v[id], v1 = clamp(Math.round((v0 + d) * 10) / 10, -100, 100); s.v[id] = v1;
    if (why) { s.log.unshift({ day: day(), id, d: Math.round(d * 10) / 10, why }); if (s.log.length > 24) s.log.length = 24; }
    const t0 = tierOf(v0).i, t1 = tierOf(v1).i;
    if (t1 !== t0 && !quiet && deps.toast) {
      const T = tierOf(v1);
      deps.toast(byId[id].name.toUpperCase(), t1 > t0 ? `The ${byId[id].name} warms to you: <b>${T.name}</b>. ${perkLine(id, v1)}` : `The ${byId[id].name} goes cold on you: <b>${T.name}</b>. ${perkLine(id, v1)}`, 4.5);
    }
  }
  const perkLine = (id, v) => { const b = byId[id], pc = Math.round((priceBias(id, v) - 1) * 100); return !(b.clients || b.group) ? (id === 'kade' ? 'It shows in who applies for work and who calls the police.' : '') : !pc ? 'Prices are normal there.' : `Their joints pay ${pc > 0 ? '+' : ''}${pc}% for your spice.`; };
  // ---- effects
  const priceBias = (id, v = get(id)) => 1 + clamp(v, -100, 100) / 100 * 0.12;
  const sellBias = (cid) => { const b = ofClient(cid); return b ? priceBias(b.id) : 1; };
  const groupBias = (name) => { const b = BUURTEN.find((x) => x.group && name && name.includes(x.group)); return b ? priceBias(b.id) : 1; };
  const hireExtra = () => { const v = get('kade'); return v >= 35 ? 1 : v <= -25 ? -1 : 0; };
  const callMult = () => { const v = get('kade'); return v >= 35 ? 1 + Math.min(1, v / 100) : v <= -25 ? 0.6 : 1; }; // > 1: neighbours wait longer before calling
  const pardon = () => { const s = S(); if (get('kade') >= 50 && (s.pardonDay == null || day() - s.pardonDay >= 14)) { s.pardonDay = day(); return true; } return false; };
  function heatBias(faction) { // per day: added to that gang's heat change
    const ids = BUURTEN.filter((b) => b.heat === faction && (!b.show || b.show(state))).map((b) => b.id); if (!ids.length) return 0;
    const avg = ids.reduce((a, id) => a + get(id), 0) / ids.length; return avg >= 35 ? -2 : avg <= -25 ? 2 : 0;
  }
  // ---- events
  const sale = (cid, ok) => { const b = ofClient(cid); if (b) add(b.id, ok ? 0.8 : -1.5, ok ? null : 'a missed order'); };
  const group = (name, ok) => { const b = BUURTEN.find((x) => x.group && name && name.includes(x.group)); if (b) add(b.id, ok ? 0.5 : -0.8); };
  const RAID_BUURT = { spekbuurt: 'spekbuurt', kroketkade: 'kroketkade', uitjesbuurt: 'uitjesbuurt' };
  function raid(levelId, grade, sets) {
    const id = RAID_BUURT[levelId] || (sets && Object.keys(sets).find((k) => sets[k].includes(levelId)));
    if (id) add(id, /^(S|A)/.test(grade || '') ? 6 : grade === 'D' ? 2 : 4, `freed ${levelId} (${grade || '?'})`);
  }
  function onDay() { // slow drift back towards neutral
    const s = S(); for (const b of BUURTEN) { const v = s.v[b.id], base = b.start || 0; if (Math.abs(v - base) > 20) s.v[b.id] = Math.round((v - Math.sign(v - base) * 0.5) * 10) / 10; }
  }
  // ---- the PC tab
  function html() {
    const s = S(), rows = BUURTEN.filter((b) => !b.show || b.show(state));
    let h = '<div class="well"><b>Buurten</b> · what each neighbourhood thinks of you. Deliver on time, deal fair, help the shopkeepers and keep the Maboota holstered. It slowly drifts back to neutral.</div><table class="list" style="margin-top:8px"><tr><th>Buurt</th><th>Standing</th><th>What it does</th></tr>';
    for (const b of rows) {
      const v = s.v[b.id], T = tierOf(v), pct = (v + 100) / 2, eff = [];
      if (b.clients || b.group) { const pc = Math.round((priceBias(b.id) - 1) * 100); if (pc) eff.push(`joints pay ${pc > 0 ? '+' : ''}${pc}%`); }
      if (b.id === 'kade') { const he = hireExtra(); if (he) eff.push(he > 0 ? 'an extra candidate at the Uitzendbureau' : 'one candidate fewer at the Uitzendbureau'); const c = callMult(); if (c !== 1) eff.push(c > 1 ? 'neighbours are slow to call the police' : 'neighbours call the police quickly'); if (v >= 50) eff.push('Bakker lets you off once'); }
      if (b.heat) { const hb = heatBias(b.heat); if (hb) eff.push(hb < 0 ? 'gang heat cools faster' : 'gang heat climbs faster'); }
      h += `<tr><td><b>${b.name}</b><br><small>${b.what}</small></td><td style="white-space:nowrap"><span style="display:inline-block;width:110px;height:10px;border:1px solid #555;vertical-align:middle;background:linear-gradient(90deg,${T.col} ${pct}%,#eee ${pct}%)"></span> <b style="color:${T.col}">${T.name}</b> <small>(${Math.round(v)})</small></td><td><small>${eff.join(' · ') || 'nothing yet'}</small></td></tr>`;
    }
    h += '</table>';
    if (s.log.length) h += `<div class="well" style="margin-top:8px"><b>Lately</b><br><small>${s.log.slice(0, 8).map((l) => `Day ${l.day}: ${byId[l.id] ? byId[l.id].name : l.id} ${l.d > 0 ? '+' : ''}${l.d} (${l.why})`).join('<br>')}</small></div>`;
    return h;
  }
  return { ensure: S, get, add, sale, group, raid, onDay, priceBias, sellBias, groupBias, hireExtra, callMult, pardon, heatBias, html, tierOf, BUURTEN };
}
