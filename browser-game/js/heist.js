// Nachtklussen on the Kaasdows PC: the Plannenbord lists tonight's targets (a rival joint's back rooms at night),
// sells floor plans (show the guards' sight cones) and tools, and fences hot goods through The Russian.
// The heist itself runs in the mission engine (mission.js, opts.heist). A clean night adds no faction heat; a loud
// one does, and every hit on a faction raises its suspicion: more guards on the next Nachtklus against them.
// Stolen crates stay "hot" for 3 market days: The Russian buys them now at half price, or wait and sell them
// as ordinary Lampas crates on Kaasplaats. Lives in state.heists.

const TOOLS = [
  { id: 'lockpick', name: 'Lockpick set', price: 400, rank: 1, text: 'Safes open faster and much more quietly.' },
  { id: 'bag', name: 'Big sports bag', price: 600, rank: 2, text: '+1 bag slot: one more item per trip to the van.' },
  { id: 'nv', name: 'Night-vision goggles', price: 1800, rank: 3, text: 'Press N on a Nachtklus: see in the dark rooms, green and grainy.' },
];
const RANK_NAMES = ['Hulpje', 'Mengmeester', 'Kruidenhandelaar', 'Kruidenbaron', 'Spice Master'];
const PLAN_COST = 150, HOT_DAYS = 3, FENCE = 75;
const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hashStr = (str) => { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const FNAME = { lampas: 'Lampas', noshgey: 'Noshgey Kariot', abdavissies: 'Abdavissies' };

// deps: state, econ, garage, addMoney(n, el), toast, save(), levels() -> [{ id, name, faction, owned, unlocked }],
//       go(id, heistOpts) starts the mission, closePC()
export function createHeists(deps) {
  const { state, econ } = deps;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  const day = () => econ.ensure().day;
  function ensure() {
    const h = state.heists && typeof state.heists === 'object' ? state.heists : (state.heists = {});
    h.done = h.done || {}; h.hot = Array.isArray(h.hot) ? h.hot : []; h.susp = h.susp || {}; h.plans = h.plans || {}; h.tools = h.tools || {};
    h.runs = +h.runs || 0; h.clean = +h.clean || 0; h.freePlans = +h.freePlans || 0; h.dailyBest = h.dailyBest || {};
    if ((state.ngp || 0) !== (h.ngpSeen || 0)) { h.ngpSeen = state.ngp || 0; h.susp = {}; h.plans = {}; } // New Game+: the factions forget who robbed them
    if (h.day !== day()) roll(h);
    return h;
  }
  function roll(h) { // tonight's targets, seeded by the market day
    const d = day(), r = rng32(hashStr(`heist#${d}`));
    h.day = d; h.targets = [];
    if (!h.done.tutorial) h.targets.push({ id: 'spekbuurt', tutorial: true, title: "Dad's old grill", note: "The Lampas keep Eddy Sr.'s old döner grill in their Spekbuurt storeroom. Get it back. No safe, just the grill and whatever crates you can carry.", faction: 'lampas' });
    const lv = (deps.levels ? deps.levels() : []).filter((l) => l.unlocked && (h.done.tutorial || l.id !== 'spekbuurt'));
    const pool = lv.filter((l) => !l.owned).length ? lv.filter((l) => !l.owned) : lv;
    const pick = pool.slice(); for (let i = pick.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pick[i], pick[j]] = [pick[j], pick[i]]; }
    const t0 = new Date(), date = `${t0.getFullYear()}-${String(t0.getMonth() + 1).padStart(2, '0')}-${String(t0.getDate()).padStart(2, '0')}`;
    if (h.done.tutorial && lv.length) { const dl = lv[hashStr(`nachtklus#${date}`) % lv.length]; h.targets.push({ id: dl.id, title: `${dl.name} (daily)`, faction: dl.faction, safe: true, daily: date, note: `Today's daily Nachtklus, the same for everyone: the safe holds double. Your best haul today: ${fmt((h.dailyBest[date] || 0))}.` }); }
    for (const l of pick.filter((l) => !h.targets.some((t) => t.id === l.id)).slice(0, 2)) h.targets.push({ id: l.id, title: l.name, faction: l.faction, safe: true, note: `${FNAME[l.faction] || 'Rival'} back rooms at night: spice crates and a safe.${l.owned ? ' (Yours by day, but they sneak stock back in at night.)' : ''}` });
  }
  function cap() { const h = ensure(), c = deps.garage ? deps.garage.stats().cargo : 300; return 2 + (h.tools.bag ? 1 : 0) + (c >= 800 ? 2 : c >= 550 ? 1 : 0); }
  function coolDown() { // hot crates older than HOT_DAYS become ordinary crates (sell on Kaasplaats)
    const h = ensure(), d = day(); let n = 0;
    h.hot = h.hot.filter((x) => { if (d - x.day >= HOT_DAYS) { n += x.n; return false; } return true; });
    if (n) { state.loot = (state.loot || 0) + n; if (deps.toast) deps.toast('COOLED DOWN', `${n} stolen crate(s) aren't hot any more. Sell them on Kaasplaats as ordinary Lampas crates.`, 4); if (deps.save) deps.save(); }
  }
  const hotCount = () => ensure().hot.reduce((a, x) => a + x.n, 0);
  function fence(el) {
    const h = ensure(), n = hotCount(); if (!n) return;
    deps.addMoney(n * FENCE, el); h.hot = [];
    if (deps.toast) deps.toast('PANDJESHUIS SPASIBO', `The Russian takes ${n} hot crate(s): +${fmt(n * FENCE)}. "I don't ask, you don't tell. Is good system."`, 4);
    if (deps.save) deps.save();
  }
  function buyPlan(n, el) {
    const h = ensure(), t = h.targets[n]; if (!t) return;
    if (h.freePlans > 0) h.freePlans--; else { if (state.money < PLAN_COST) return 'Not enough Wilders.'; deps.addMoney(-PLAN_COST, el); }
    h.plans[t.id] = day();
    if (deps.toast) deps.toast('FLOOR PLAN', `Kevin sketched ${t.title} on a napkin: you'll see the guards' sight cones tonight.`, 3);
    if (deps.save) deps.save();
  }
  const rank = () => (deps.rank ? deps.rank() : 9);
  function buyTool(id, el) {
    const h = ensure(), T = TOOLS.find((x) => x.id === id); if (!T || h.tools[id]) return;
    if (rank() < (T.rank || 0)) return `The Russian: "For ${RANK_NAMES[T.rank]}, not for you. Yet."`;
    if (state.money < T.price) return 'Not enough Wilders.';
    deps.addMoney(-T.price, el); h.tools[id] = day(); if (deps.save) deps.save();
  }
  function go(n) {
    const h = ensure(), t = h.targets[n]; if (!t) return;
    const extra = Math.min(4, h.susp[t.faction] || 0);
    if (deps.closePC) deps.closePC();
    deps.go(t.id, { title: t.title, day: day(), cap: cap(), cased: h.plans[t.id] === day() || !!t.tutorial, lockpick: !!h.tools.lockpick, nv: !!h.tools.nv, safe: !!t.safe, special: t.tutorial ? 'grill' : null, cashX: t.daily ? 2 : 1, extra, onEnd: (res) => ended(t, res) });
  }
  function ended(t, res) {
    const h = ensure(), lines = [];
    h.runs++;
    let crates = res.crates;
    if (res.loud && crates && !(deps.garage && deps.garage.has('luik'))) { crates--; lines.push('The Lampas rammed the van on the way home: one crate fell out the back (a hidden compartment would have kept it).'); }
    if (crates) { h.hot.push({ n: crates, day: day() }); lines.push(`${crates} hot crate(s) in the warehouse: The Russian buys them now for ${fmt(FENCE)} each, or wait ${HOT_DAYS} days and sell them for W 150.`); }
    if (res.cash) { deps.addMoney(res.cash); lines.push(`Safe: +${fmt(res.cash)}.`); }
    if (t.daily) { const haul = res.cash + res.crates * 150; if (haul > (h.dailyBest[t.daily] || 0)) { h.dailyBest[t.daily] = haul; lines.push(`New best daily haul: ${fmt(haul)}.`); } }
    if (econ.addRep && (res.crates || res.cash || res.grill)) econ.addRep(res.loud ? 60 : 150);
    if (res.grill) {
      h.done.tutorial = true; const e = econ.ensure(); e.machines.grill = (e.machines.grill || 0) + 1;
      lines.push("Dad's old grill is back in the warehouse. Sell it to a joint, or strip it in the Werkplaats.");
      if (econ.learn) setTimeout(() => econ.learn('spion'), 8000);
    }
    if (res.loud) {
      const e = econ.ensure();
      if (t.faction === 'lampas' && !state.act1) { e.heat.lampas = Math.min(100, (e.heat.lampas || 0) + 20); lines.push('It got loud: Lampas heat +20.'); } else lines.push('It got loud. They will remember this.');
    } else if (res.crates || res.cash || res.grill) {
      h.clean++; lines.push('Clean: nobody saw a thing, no heat.');
      if (res.ghost) { const g = Math.round(((res.cash || 0) + res.crates * 75) * 0.5 / 10) * 10; h.ghosts = (+h.ghosts || 0) + 1; if (g) deps.addMoney(g); if (econ.addRep) econ.addRep(100); lines.push(`GHOST: no alarm, nobody hurt. Bonus +${fmt(g)} and extra reputation.`); }
    }
    if (res.crates || res.cash || res.grill) h.susp[t.faction] = (h.susp[t.faction] || 0) + 1;
    if (!lines.length) lines.push('You drove home with nothing. Tomorrow is another night.');
    if (deps.toast) deps.toast(res.loud ? 'NACHTKLUS · LOUD' : 'NACHTKLUS · CLEAN', lines.join('<br>'), 7);
    setTimeout(() => { econ.advance('on a Nachtklus'); coolDown(); if (deps.save) deps.save(); }, 4500); // a heist is a raid: it takes the whole day
    if (deps.save) deps.save();
  }

  function html() {
    if (econ.learn && !(econ.has && econ.has('nachtklus'))) setTimeout(() => econ.learn('nachtklus'), 300);
    const h = ensure(); coolDown();
    let out = `<div class="well"><b>Plannenbord</b> · tonight's Nachtklussen · bag: <b>${cap()} slots</b> per trip to the van · clean nights: <b>${h.clean}</b> of ${h.runs}${h.freePlans ? ` · free floor plans: <b>${h.freePlans}</b> (from a spy module or a Naknik scout)` : ''}<br><small>Sneak in at night, fill the bag, carry it out to the Oofmobiel, drive home. Being seen fills the alarm; a full alarm turns it into a loud raid (heat). A floor plan shows the guards' sight cones. Every hit on a faction makes them more careful next time.</small></div>`;
    out += '<table class="list" style="margin-top:8px"><tr><th>Target</th><th>What\'s there</th><th>Guards</th><th></th></tr>';
    for (const [n, t] of h.targets.entries()) {
      const planned = h.plans[t.id] === day() || t.tutorial, s = h.susp[t.faction] || 0;
      out += `<tr><td><b>${t.title}</b><br><small>${FNAME[t.faction] || ''}${t.tutorial ? ' · tutorial' : ''}</small></td><td><small>${t.note}</small></td><td><small>${s ? `on edge (+${Math.min(4, s)})` : 'skeleton crew'}</small></td><td>${planned ? '<small style="color:#070">floor plan ✓</small><br>' : `<button class="b95" data-hplan="${n}">${h.freePlans ? `Free floor plan (${h.freePlans} left)` : `Floor plan ${fmt(PLAN_COST)}`}</button><br>`}<button class="b95" data-hgo="${n}" style="margin-top:4px">Go tonight</button></td></tr>`;
    }
    out += '</table>';
    const hot = hotCount();
    out += `<div class="well" style="margin-top:8px"><b>Pandjeshuis Spasibo</b> · The Russian fences hot goods · Hot crates: <b>${hot}</b> ${hot ? `<button class="b95" data-hfence>Sell all for ${fmt(hot * FENCE)}</button>` : ''}<br><small>Or wait: a crate cools down after ${HOT_DAYS} market days and sells for W 150 on Kaasplaats.</small></div>`;
    out += '<table class="list" style="margin-top:8px"><tr><th>Tools from The Russian</th><th>What it does</th><th>Price</th><th></th></tr>';
    for (const T of TOOLS) out += `<tr><td><b>${T.name}</b></td><td><small>${T.text}</small></td><td>${fmt(T.price)}</td><td>${h.tools[T.id] ? '<b style="color:#070">owned</b>' : rank() < (T.rank || 0) ? `<small style="color:#888">at rank ${RANK_NAMES[T.rank]}</small>` : `<button class="b95" data-htool="${T.id}">Buy</button>`}</td></tr>`;
    out += '<tr><td colspan="4"><small>Guns are loud on a Nachtklus: any unsilenced shot fills the alarm. The Russian sells a silenced 9mm and a suppressor for the Makarov. No alarm and nobody hurt is a <b>ghost</b> run: +50% on the haul.</small></td></tr>';
    return out + '</table>';
  }
  function bind(body, rerender) {
    const msg = (m) => { if (m && deps.toast) deps.toast('PLANNENBORD', m, 2.5); rerender(); };
    body.querySelectorAll('[data-hplan]').forEach((b) => b.onclick = () => msg(buyPlan(+b.dataset.hplan, b)));
    body.querySelectorAll('[data-hgo]').forEach((b) => b.onclick = () => go(+b.dataset.hgo));
    const f = body.querySelector('[data-hfence]'); if (f) f.onclick = () => { fence(f); rerender(); };
    body.querySelectorAll('[data-htool]').forEach((b) => b.onclick = () => msg(buyTool(b.dataset.htool, b)));
  }
  return { ensure, html, bind, go, fence, cap, hotCount, coolDown };
}
