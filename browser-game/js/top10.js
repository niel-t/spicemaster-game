// De Kaasland Top 10 (2026-11-28): a weekly league of the country's spice traders, printed in the Krant voor het Kaasvolk
// every Maandag, next to the week's bills. Eddy is ranked on what he earned that week (the same figure as Cijfers'
// "this week"), with a buurt bonus (up to +10% when the buurten like him, down to -10% when they hate him) and a
// "wanbetaler" mark (-10%) when the gemeente's bills are still open. Against him: the four gangs, who shrink as he takes
// their joints and puff up when their heat squeezes tolls out of him; Blokaas Specijeren (Hans & Conny, Almere), whose
// fortunes follow their storyline (js/blokaas.js); Steven Zeegaal's dojo-spice brand, which never recovers from the
// Bitterbalbuurt cellar; and a handful of made-up traders up and down the country, each with their own reasons to move.
// Every trading day has a Dagdoel: the Wilders Eddy needs today to pass the trader above him by Zondag (or to keep the
// one below him off). Hit it for a small payout; hit all seven for a bonus on Maandag.
// Climbing pays: a one-off reward the first time he reaches the Top 10, Top 5, Top 3 and #1, W 100 for every place
// gained, and while he is in the published list the clients pay a little more (the Top 10 sticker on the van).
// Shooki and Pa (Freddy Sr.) have something to say about it every Maandag.
// state.top10 = { seed, week, pub, table: [{ id, s, pos, prev, why }], pos, best, hist: [{ w, pos, s }], got: {}, dd, hits: { w, n } }

const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hashStr = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const r10 = (n) => Math.round(n / 10) * 10;

// the gangs: [faction, joints in the game, boss, what high heat looks like]
const GANG = {
  lampas: { n: 10, boss: 'Jan van Kaas', done: 'act1', heat: 'tolls on your stock fill their tills' },
  noshgey: { n: 10, boss: 'Goeroe Granola', done: 'act2', heat: 'review-bombing your joints sends customers their way' },
  abdavissies: { n: 11, boss: 'De Abdavis', done: 'act3', heat: 'holding your shipments at the docks' },
  paravim: { n: 6, boss: 'Ras al Gara', done: 'paravim', heat: 'debt collectors at the door, money in their pocket' },
};
// base: a normal week's omzet in Wilders. vol: how much a week swings. up/down/same: what the paper says when they move.
export const RIVALS = [
  { id: 'abdavissies', name: 'Abdavissies Import', where: 'De Duistere Dokken', base: 42000, vol: 0.08, gang: 'abdavissies',
    up: ['a container "fell off" a ship again', 'bought up every kurkuma ship in the harbour'], down: ['customs found the false bottom', 'a crane dropped a pallet of saffraan in the IJ'], same: ['nobody at the docks wants to talk about it'] },
  { id: 'lampas', name: 'De Lampas', where: 'Oud-Vettenburg', base: 30000, vol: 0.07, gang: 'lampas',
    up: ['flour in the paprika again, but cheap', 'dumped cheap knoflook on every market'], down: ['the snackbars taste the flour', 'two drivers quit to sell frikandellen'], same: ['the same sad Kip Shoarma at the same sad price'] },
  { id: 'noshgey', name: 'Noshgey Kariot', where: 'Hipsterheuvel', base: 24000, vol: 0.12, gang: 'noshgey',
    up: ['"artisanal" masala in a jam jar for W 14', 'an influencer put their turmeric latte on a billboard'], down: ['the oat-milk masala trend is over', 'their kombucha exploded in the warehouse'], same: ['still explaining what "small batch" means'] },
  { id: 'paravim', name: 'Paravim', where: 'De Zandwijk', base: 19000, vol: 0.1, gang: 'paravim',
    up: ['a caravan of ras el hanout made it through', 'the souk had its best week in years'], down: ['a sandstorm (indoors, nobody knows how)', 'the camel strike'], same: ['the souk haggles, the numbers stand still'] },
  { id: 'kemal', name: 'Kruidenkoning Kemal', where: 'Zaandam · cash & carry', base: 13500, vol: 0.07,
    up: ['opened a second cash & carry next to the windmills', 'buy two kilo, get a free mortar'], down: ['his son ran the shop for a week', 'roadworks on the A8 again'], same: ['"the King is happy, the King says nothing"'] },
  { id: 'peper', name: 'Van der Peper & Zn.', where: 'Delfshaven · since 1888', base: 10500, vol: 0.05, fade: 0.008,
    up: ['grandpa Van der Peper found an old order book'], down: ['still only sells peper, and only black', 'the zoon wants to sell the shop'], same: ['five generations of peper, and it shows'] },
  { id: 'blokaas', name: 'Blokaas Specijeren', where: 'Almere-Buiten · Hans & Conny', base: 7800, vol: 0.02,
    up: ['cut the paprika with something even cheaper', 'Conny got a discount by crying at the wholesaler'], down: ['Hans counted the pallets twice; Conny says the whole market is against them', 'the hall heater was on for ten minutes'], same: ['exactly the same as last week, Hans checked'] },
  { id: 'zeegaal', name: 'Zeegaal Zen Kruiden', where: 'Steven Zeegaal · "Hard to Kruid"', base: 6000, vol: 0.22,
    up: ['a new infomercial: Steven karate-chops a bag of kurkuma', '"Under Seasoning" sauce in every petrol station'], down: ['Steven kicked the shop counter in half', 'the ponytail lotion line flopped'], same: ['Steven stared at the camera for the whole infomercial'] },
  { id: 'noot', name: 'Gebroeders Nootmuskaat', where: 'Rotterdam · twins', base: 4500, vol: 0.1,
    up: ['the twins stopped arguing for a whole Tuesday'], down: ['the twins split the warehouse with tape down the middle', 'one twin sold the van to the other twin'], same: ['still arguing about whose name goes first'] },
  { id: 'masala', name: 'Mevrouw Masala', where: 'Utrecht · market stalls', base: 3500, vol: 0.08,
    up: ['a queue at her stall on the Vredenburg', 'her garam masala won a prize at the braderie'], down: ['rain on every market day', 'the council moved her stall behind the bins'], same: ['steady, like her stall: in the same spot since 1991'] },
  { id: 'kaneel', name: 'De Kaneelfabriek', where: 'Zwolle · speculaas season', base: 2600, vol: 0.06, winter: 2.4,
    up: ['speculaas season: the ovens run day and night'], down: ['nobody wants kaneel after Sinterklaas', 'the summer slump: kaneel on ice cream did not catch on'], same: ['the ovens tick over'] },
  { id: 'frituur', name: 'Frituurland Groothandel', where: 'Leeuwarden', base: 2200, vol: 0.06,
    up: ['every snackbar in Friesland reordered at once'], down: ['the Elfstedentocht was cancelled again'], same: ['frikandel spice, frikandel spice, frikandel spice'] },
  { id: 'sjaak', name: 'Sambal Sjaak', where: 'Den Haag · one van', base: 1600, vol: 0.15,
    up: ['sold out at the Tong Tong Fair', 'his sambal made a TV chef cry'], down: ['the van broke down on the Utrechtsebaan', 'too spicy for the Scheveningen boulevard'], same: ['one van, one man, a lot of sambal'] },
  { id: 'piet', name: 'Peperbaron Piet', where: 'Hoorn · big plans', base: 1100, vol: 0.2,
    up: ['Piet put a second table on his market stall'], down: ['Piet spent the week on his business plan', 'Piet called himself "baron" in front of the tax man'], same: ['still a market stall, still big plans'] },
];
const MILES = [ // first time in: cash + rep
  { k: 'top10', pos: 10, w: 500, rep: 40, name: 'In de Top 10' },
  { k: 'top5', pos: 5, w: 2000, rep: 100, name: 'Top 5' },
  { k: 'top3', pos: 3, w: 5000, rep: 200, name: 'Op het podium' },
  { k: 'top1', pos: 1, w: 15000, rep: 500, name: 'Nummer één van Kaasland' },
];
const DD_PAY = [60, 120, 250, 400, 600]; // the Dagdoel, by rank (same scale as Shooki's goals)
const DD_MIN = [150, 300, 600, 1000, 1500];
const stickerOf = (pos) => (!pos || pos > 10 ? 1 : pos === 1 ? 1.06 : pos <= 3 ? 1.04 : pos <= 5 ? 1.03 : 1.02);
const WD_TAG = ['Krantendag', null, null, null, 'Vrijdag: the snackbars run flat out', 'Zaterdag: busiest day of the week', 'Zondag: the list closes tonight'];

// deps: state, econ, stats(), world(), rank(), rankName(), held(gang), owns(id), brepAvg(), owing(), blokaas(), addMoney(n), addRep(n),
//       toast(t, txt, s), beep(), save(), eligible(), busy(), hidden(), openKrant()
export function createTop10(deps) {
  const { state, econ } = deps;
  function S() {
    const s = state.top10 && typeof state.top10 === 'object' ? state.top10 : (state.top10 = {});
    if (!s.seed) s.seed = 1 + Math.floor(Math.random() * 1e9);
    if (!Array.isArray(s.table)) s.table = []; if (!Array.isArray(s.hist)) s.hist = []; if (!s.got || typeof s.got !== 'object') s.got = {};
    if (!s.hits || typeof s.hits !== 'object') s.hits = { w: 0, n: 0 };
    return s;
  }
  const day = () => econ.ensure().day;
  const weekOf = (d) => Math.floor((d - 1) / 7) + 1;
  const wd = (d = day()) => (Math.max(1, d) - 1) % 7;
  const rank = () => clamp(deps.rank ? deps.rank() : 0, 0, 4);
  const weekSoFar = () => { const st = deps.stats && deps.stats(); return st ? st.ensure().week || 0 : 0; };

  // ---------------------------------------------------------------- the rivals' week
  function drive(r) { // what the game world does to a rival this week: { m, why }
    let m = 1; const why = [];
    if (r.gang) {
      const G = GANG[r.gang], h = deps.held ? deps.held(r.gang) : 0, heat = (econ.ensure().heat || {})[r.gang] || 0;
      if (h) { m *= Math.max(0.25, 1 - 0.7 * h / G.n); why.push(`${h} of their joint${h > 1 ? 's' : ''} now buy${h > 1 ? '' : 's'} from Eddy Jr.`); }
      if (state[G.done]) { m *= 0.55; why.unshift(`${G.boss} is finished; the snackbars switched sides`); }
      else if (heat >= 50) { m *= heat >= 80 ? 1.18 : 1.1; why.push(G.heat); }
    }
    if (r.id === 'blokaas') {
      const b = (deps.blokaas && deps.blokaas()) || {};
      if (b.stage === 2) { m *= 1.12; why.push(`poached ${b.cname || 'one of Eddy’s clients'} at 20% under his price`); }
      else if (b.stage === 3 || b.stage === 4) { m *= 0.92; why.push('the whole street knows about the fenegriek and the Ve-tsin now'); }
      else if (b.stage >= 5 && b.how === 'bought') { m *= 0.35; why.unshift('sold their Almere snackbars to Eddy Jr.'); }
      else if (b.stage >= 5) { m *= 0.55; why.unshift('exposed in this paper: Ve-tsin in the "Polderkruiden"'); }
    }
    if (r.id === 'zeegaal' && deps.owns && deps.owns('bitterbalbuurt')) { m *= 0.6; why.push('still looking for his ponytail after the Bitterbalbuurt cellar'); }
    if (r.winter) { const W = deps.world && deps.world(), c = W && W.cal(); if (c && c.season.id === 'winter') { m *= r.winter; why.push('speculaas season: the ovens run day and night'); } }
    return { m, why };
  }
  function rivalScore(r, wk) {
    const R = rng32(hashStr(`top10#${S().seed}#${wk}#${r.id}`)), noise = 1 + (R() * 2 - 1) * r.vol;
    const grow = r.fade ? Math.max(0.6, 1 - r.fade * (wk - 1)) : Math.min(1.5, 1 + 0.015 * (wk - 1));
    const d = drive(r); return { s: r10(r.base * grow * noise * d.m), why: d.why, R };
  }
  // ---------------------------------------------------------------- Eddy's week
  const buurtBonus = () => clamp(deps.brepAvg ? deps.brepAvg() : 0, -100, 100) / 100 * 0.1;
  function eddyScore(earned) {
    const bb = buurtBonus(), late = deps.owing && deps.owing() > 0;
    const s = r10(Math.max(0, earned) * (1 + bb) * (late ? 0.9 : 1)), why = [`${fmt(earned)} earned`];
    if (Math.abs(bb) >= 0.005) why.push(`buurt ${bb > 0 ? '+' : '−'}${Math.round(Math.abs(bb) * 100)}%`);
    if (late) why.push('open bills: wanbetaler −10%');
    return { s, why, late };
  }
  const eddyRow = () => ({ id: 'eddy', name: 'Eddy Jr.', where: `Kipkruidenkade · ${deps.rankName ? deps.rankName() : 'Hulpje'}` });
  const info = (id) => (id === 'eddy' ? eddyRow() : RIVALS.find((r) => r.id === id) || { name: id, where: '' });
  // this week's projected table (rivals at their full week, Eddy at what he has so far)
  function projection(wk = weekOf(day())) {
    const rows = RIVALS.map((r) => ({ id: r.id, s: rivalScore(r, wk).s }));
    rows.push({ id: 'eddy', s: eddyScore(weekSoFar()).s, me: true });
    return rows.sort((a, b) => b.s - a.s);
  }

  // ---------------------------------------------------------------- Maandag: the new list
  function publish(d) {
    const s = S(), wk = weekOf(d) - 1; if (wk < 1 || s.week >= wk) return null;
    const prevPos = Object.fromEntries(s.table.map((x) => [x.id, x.pos]));
    const prevS = Object.fromEntries(s.table.map((x) => [x.id, x.s]));
    const rows = RIVALS.map((r) => {
      const x = rivalScore(r, wk); let why = x.why[0];
      if (!why) { const was = prevS[r.id], dir = was == null ? 'same' : x.s > was * 1.04 ? 'up' : x.s < was * 0.96 ? 'down' : 'same'; why = r[dir][Math.floor(x.R() * r[dir].length)]; }
      return { id: r.id, s: x.s, why };
    });
    const E = eddyScore(weekSoFar()); rows.push({ id: 'eddy', s: E.s, why: E.why.join(' · ') });
    const had = s.table.length > 0;
    rows.sort((a, b) => b.s - a.s); rows.forEach((x, i) => { x.pos = i + 1; x.prev = prevPos[x.id] || null; x.nw = !x.prev && (had || x.id === 'eddy'); });
    const me = rows.find((x) => x.id === 'eddy'), was = s.pos || null;
    s.table = rows; s.week = wk; s.pub = d; s.pos = me.pos; s.best = Math.min(s.best || 99, me.pos);
    s.hist.push({ w: wk, pos: me.pos, s: me.s }); if (s.hist.length > 26) s.hist.shift();
    // rewards
    const got = [];
    for (const M of MILES) if (me.pos <= M.pos && !s.got[M.k]) { s.got[M.k] = wk; deps.addMoney(M.w); if (deps.addRep) deps.addRep(M.rep); got.push(`<b>${M.name}</b> +${fmt(M.w)}`); }
    if (was && me.pos < was) { const w = Math.min(10, was - me.pos) * 100; deps.addMoney(w); got.push(`${was - me.pos} place${was - me.pos > 1 ? 's' : ''} up +${fmt(w)}`); }
    if (s.hits.w === wk && s.hits.n >= 7) { const w = DD_PAY[rank()] * 5; deps.addMoney(w); got.push(`all seven Dagdoelen +${fmt(w)}`); }
    const res = { wk, pos: me.pos, was, s: me.s, got, late: E.late, rows };
    s.card = res.wk; pending = res;
    if (deps.save) deps.save();
    return res;
  }

  // ---------------------------------------------------------------- the Dagdoel
  function rollDD() {
    const s = S(), d = day(), wk = weekOf(d), proj = projection(wk), i = proj.findIndex((x) => x.me), mine = proj[i].s;
    const left = 7 - wd(d), avg = Math.max(DD_MIN[rank()], ...s.hist.slice(-2).map((h) => h.s / 7));
    let n, label, rival = null;
    // chase the trader just above Eddy in last Maandag's list (on a Maandag he has earned nothing yet, so the live
    // projection would aim at the bottom of the table); once he is past them this week, the next one up
    const lm = s.table.find((x) => x.id === 'eddy'); let above = null;
    if (lm) for (const c of s.table.filter((x) => x.pos < lm.pos).reverse()) { const p = proj.find((x) => x.id === c.id); if (p && p.s > mine) { above = p; break; } }
    if (!above && i > 0 && !(lm && lm.pos === 1 && wd(d) < 3)) above = proj[i - 1];
    const below = lm && lm.pos === 1 ? proj.find((x) => !x.me) : proj[i + 1];
    if (above) {
      const need = (above.s - mine + 10) / left, ai = proj.indexOf(above); rival = above.id;
      if (need <= avg * 2.5) { n = need; label = ai === 9 && (!lm || lm.pos > 10) ? `get into the Top 10 (pass ${info(above.id).name})` : `pass ${info(above.id).name} by Zondag`; }
      else { n = avg * 1.2; label = `beat your average (${info(above.id).name} is ${fmt(above.s - mine)} ahead)`; }
    } else { const gap = below ? Math.max(0, below.s - mine) : 0; n = gap / left + avg * 0.3; rival = below ? below.id : null; label = `stay number one (${below ? info(below.id).name : 'nobody'} is chasing)`; }
    n = Math.max(DD_MIN[rank()], Math.ceil(n / 10) * 10);
    s.dd = { day: d, n, base: weekSoFar(), rival, label, done: false };    if (deps.save) deps.save();
  }
  const ddProg = () => { const s = S(); return s.dd ? Math.max(0, weekSoFar() - s.dd.base) : 0; };
  function settleDD(quiet) { // the clients pay at night, so a goal is settled when the next day starts as well
    const s = S(), dd = s.dd; if (!dd || dd.done || ddProg() < dd.n) return false;
    dd.done = true; const w = DD_PAY[rank()]; deps.addMoney(w); if (deps.addRep) deps.addRep(3);
    const wk = weekOf(dd.day); if (s.hits.w !== wk) s.hits = { w: wk, n: 0 }; s.hits.n++;
    if (deps.beep) deps.beep(988, 0.07, 'triangle', 0.04);
    if (!quiet) deps.toast('DAGDOEL GEHAALD', `${fmt(dd.n)} earned today: ${dd.label}. +${fmt(w)}${s.hits.n > 1 ? ` · ${s.hits.n} this week` : ''}.`, 4);
    else s.ddLate = { day: dd.day, w };
    if (deps.save) deps.save(); return true;
  }

  // a market day began (called after the bills, before Cijfers closes the week)
  function onDay(d) {
    if (!deps.eligible || !deps.eligible()) return;
    settleDD(true);
    if (wd(d) === 0) publish(d);
  }

  // ---------------------------------------------------------------- what Shooki and Pa say
  function comments(r) {
    const R = rng32(hashStr(`t10say#${S().seed}#${r.wk}`)), pk = (a) => a[Math.floor(R() * a.length)], rk = deps.rankName ? deps.rankName() : 'Hulpje';
    const first = r.got.find((g) => /Top 10|Top 5|podium|één/.test(g));
    let sh, pa;
    if (r.pos === 1) { sh = pk(['NUMMER ÉÉN, CUZ! I\'m printing this and putting it on the van. On both sides.', 'Bro. BRO. Number one. The Abdavissies are reading this right now and crying into their containers.']); pa = pk(['Number one. Your mother would have framed it. ...I framed it.', 'First of Kaasland. Good. Now stay humble and check the komijn.']); }
    else if (first && r.pos <= 10) { sh = pk([`We're in the paper, bro! Number ${r.pos}! Tante Gerda already called four people.`, `Top ${r.pos <= 3 ? 3 : r.pos <= 5 ? 5 : 10}, cuz! I told everyone at the shoarma place. Twice.`]); pa = pk([`A ${rk} in the Kaasland Top 10. Don't let it go to your head, jongen. Let it go to your books.`, 'In the paper. In my day the paper was for the fish. ...Still. Well done.']); }
    else if (r.was && r.pos < r.was) { sh = pk([`Up ${r.was - r.pos}, bro! ${info(r.rows[r.pos] ? r.rows[r.pos].id : '').name || 'They'} didn't see you coming.`, `Number ${r.pos} now. Next week we take ${info(r.rows[r.pos - 2] ? r.rows[r.pos - 2].id : '').name || 'the next one'}.`]); pa = pk(['Climbing. Good. A trader who stands still is a trader who sinks.', 'Up again. Keep the deliveries on time and the list follows by itself.']); }
    else if (r.was && r.pos > r.was) { sh = pk([`Down to ${r.pos}... it's fine, bro. It's fine. It's a newspaper. Nobody reads newspapers. (Everybody reads newspapers.)`, `${info(r.rows[r.pos - 2] ? r.rows[r.pos - 2].id : '').name || 'Someone'} passed us. I'm taking it personally.`]); pa = pk(['Down. It happens. Look at what you missed this week, not at the list.', 'A bad week. Your grandfather had a bad year once. One. Fix it.']); }
    else if (r.pos > 10) { sh = pk([`Number ${r.pos}. Close! The Top 10 is right there, bro, I can smell it.`, `We're not in the Top 10 yet, but we're IN THE PAPER. Small print. Very small print.`]); pa = pk([`Number ${r.pos}. The Lampas were also small once. Then they got lazy. Don't get lazy.`, 'Not in the ten yet. Good. A man needs something to chase.']); }
    else { sh = pk([`Still number ${r.pos}. Same spot. Like a parking space we own.`, `Number ${r.pos} again, cuz. Stable. Boring. Profitable.`]); pa = pk(['The same place. Fine. Now find the next one above you and ask why they are there.', 'Steady. Steady is good. Steady pays the gemeente.']); }
    if (r.late) pa = 'And jongen: pay the gemeente. A wanbetaler in the Krant, with our name on it? Not in this family.';
    return { sh, pa };
  }

  // ---------------------------------------------------------------- the Maandag card
  const css = document.createElement('style');
  css.textContent = `
#t10card{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:59;width:min(470px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;display:none;border-radius:18px;color:#3a2410;font:400 13.5px/1.4 "Segoe UI",Tahoma,Rubik,Arial,sans-serif;
  background:linear-gradient(180deg,rgba(255,252,244,.98),rgba(250,238,214,.97) 50%,rgba(244,226,194,.97) 52%,rgba(252,244,228,.98));box-shadow:0 0 0 2px rgba(232,163,61,.75),0 16px 40px rgba(60,30,0,.5),inset 0 1px 0 #fff;animation:t10In .3s ease-out}
@keyframes t10In{0%{opacity:0;transform:translate(-50%,-46%) scale(.96)}100%{opacity:1;transform:translate(-50%,-50%)}}
#t10card .t10-h{position:relative;padding:10px 14px 9px;border-radius:16px 16px 0 0;color:#fff;text-shadow:0 1px 2px rgba(80,20,0,.7);background:linear-gradient(180deg,#f6b25a 0%,#e0802a 46%,#c4561a 52%,#d8742a 100%)}
#t10card .t10-h::before{content:"";position:absolute;left:8px;right:8px;top:2px;height:45%;border-radius:14px 14px 40% 40%/14px 14px 8px 8px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0));pointer-events:none}
#t10card .t10-k{font:700 11px "Segoe UI",Arial;letter-spacing:.1em;text-transform:uppercase;opacity:.92}#t10card .t10-t{font:900 22px/1.1 Georgia,"Times New Roman",serif}
#t10card .t10-b{padding:10px 14px 12px}
.t10-list{width:100%;border-collapse:collapse;font-size:12.5px}.t10-list td{padding:3px 4px;border-bottom:1px solid rgba(160,110,50,.18);vertical-align:top}
.t10-list td.p{width:22px;text-align:right;font:700 13px Georgia,serif;color:#8a4a10}.t10-list td.s{text-align:right;white-space:nowrap;font-weight:600}.t10-list td.m{width:28px;white-space:nowrap;font-size:11px;font-weight:700}
.t10-list tr.me td{background:linear-gradient(90deg,rgba(255,214,120,.55),rgba(255,236,190,.35));font-weight:700}.t10-list small{color:#8a6a4a;font-weight:400}
.t10-up{color:#2a8a2a}.t10-dn{color:#b8301a}.t10-nw{color:#c07a10}
.t10-got{margin:8px 0 2px;padding:6px 9px;border-radius:9px;background:linear-gradient(180deg,#f4ffe4,#dcf4c4);box-shadow:inset 0 0 0 1px #9ad06a;color:#2a5a10}
.t10-say{display:flex;gap:9px;align-items:flex-start;margin-top:8px}.t10-say img{width:38px;height:38px;border-radius:50%;object-fit:cover;flex:none;border:2px solid #fff;box-shadow:0 0 0 1px rgba(160,100,30,.6)}
.t10-say div{flex:1;padding:6px 9px;border-radius:4px 12px 12px 12px;background:rgba(255,255,255,.75);box-shadow:inset 0 0 0 1px rgba(200,150,80,.45)}.t10-say b{display:block;font-size:11px;color:#a0581a;letter-spacing:.04em}
#t10card .t10-bt{display:flex;gap:10px;justify-content:flex-end;margin-top:10px}
#t10card button{font:600 14px "Segoe UI",Tahoma,Arial;color:#3a2000;border:1px solid #b07a10;border-radius:10px;padding:6px 14px;cursor:pointer;background:linear-gradient(180deg,#fff,#fbeed4 48%,#f2dcb0 52%,#f8ead0)}
#t10card button.go{background:linear-gradient(180deg,#fff1c8,#ffd27a 22%,#f2b84b 49%,#df8d1c 51%,#eda43a 80%,#ffc865)}
#vandaag .vd-t10{margin-top:6px;padding:5px 7px 6px;border-radius:9px;background:linear-gradient(180deg,rgba(255,244,220,.95),rgba(250,226,180,.9));box-shadow:inset 0 0 0 1px rgba(214,140,40,.55);color:#4a2a08}
#vandaag .vd-t10 .k{display:flex;justify-content:space-between;font:700 10.5px "Segoe UI",Arial;letter-spacing:.06em;text-transform:uppercase;color:#b0600f}
#vandaag .vd-t10 .bar{height:7px;margin-top:4px;border-radius:4px;background:rgba(120,70,20,.15);overflow:hidden}#vandaag .vd-t10 .bar i{display:block;height:100%;border-radius:4px;background:linear-gradient(180deg,#ffd27a,#e0802a)}
#vandaag .vd-t10.ok{background:linear-gradient(180deg,#f4ffe4,#dcf4c4);box-shadow:inset 0 0 0 1px #9ad06a}#vandaag .vd-t10 small{color:#8a5a2a}
#vandaag.fold .vd-t10{display:none}`;
  document.head.appendChild(css);
  const card = document.createElement('div'); card.id = 't10card'; document.body.appendChild(card);
  ['pointerdown', 'mousedown', 'touchstart', 'wheel'].forEach((ev) => card.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  let pending = null, cardOpen = false;
  const mv = (x) => (x.nw ? '<span class="t10-nw">NIEUW</span>' : !x.prev ? '' : x.prev > x.pos ? `<span class="t10-up">▲${x.prev - x.pos}</span>` : x.prev < x.pos ? `<span class="t10-dn">▼${x.pos - x.prev}</span>` : '<span style="color:#a08a6a">=</span>');
  function listHTML(rows, opts = {}) {
    const top = rows.slice(0, 10), me = rows.find((x) => x.id === 'eddy');
    const tr = (x) => { const I = info(x.id); return `<tr class="${x.id === 'eddy' ? 'me' : ''}"><td class="p">${x.pos}</td><td class="m">${mv(x)}</td><td>${I.name}${opts.why ? `<br><small>${x.why || I.where}</small>` : ` <small>${I.where}</small>`}</td><td class="s">${fmt(x.s)}</td></tr>`; };
    return `<table class="t10-list">${top.map(tr).join('')}${me && me.pos > 10 ? `<tr><td colspan="4" style="text-align:center;color:#a08a6a">…</td></tr>${tr(me)}` : ''}</table>`;
  }
  function showCard() {
    const r = pending; pending = null; if (!r) return; cardOpen = true; state.inPC = true;
    const c = comments(r), head = r.pos === 1 ? 'Eddy Jr. is nummer één!' : !r.was ? (r.pos <= 10 ? `Eddy Jr. enters at number ${r.pos}` : `Eddy Jr. in the paper: number ${r.pos}`) : r.pos < r.was ? `Eddy Jr. climbs to number ${r.pos}` : r.pos > r.was ? `Eddy Jr. slips to number ${r.pos}` : `Eddy Jr. holds number ${r.pos}`;
    card.innerHTML = `<div class="t10-h"><div class="t10-k">Krant voor het Kaasvolk · Kaasland Top 10 · week ${r.wk}</div><div class="t10-t">${head}</div></div><div class="t10-b">
      ${listHTML(r.rows)}
      ${r.got.length ? `<div class="t10-got">${r.got.join(' · ')}</div>` : ''}
      ${r.pos <= 10 ? `<div style="margin-top:6px;font-size:12px;color:#7a5020">Top 10 sticker on the van: clients pay <b>+${Math.round((stickerOf(r.pos) - 1) * 100)}%</b> this week.</div>` : `<div style="margin-top:6px;font-size:12px;color:#7a5020">Reach the Top 10 and the clients pay more for your spice.</div>`}
      <div class="t10-say"><img src="./assets/face_shooki_sq.jpg" alt=""><div><b>SHOOKI</b>${c.sh}</div></div>
      <div class="t10-say"><img src="./assets/face_sr.jpg" alt=""><div><b>PA</b>${c.pa}</div></div>
      <div class="t10-bt"><button class="ok">Ok</button><button class="go">Lees de Krant</button></div></div>`;
    card.style.display = 'block'; if (deps.beep) { deps.beep(659, 0.08, 'triangle', 0.05); setTimeout(() => deps.beep(988, 0.12, 'triangle', 0.05), 120); }
    card.querySelector('.ok').onclick = () => closeCard(false); card.querySelector('.go').onclick = () => closeCard(true);
  }
  function closeCard(krant) { if (!cardOpen) return; cardOpen = false; card.style.display = 'none'; state.inPC = false; if (krant && deps.openKrant) deps.openKrant(); }

  // ---------------------------------------------------------------- the Dagdoel row in Shooki's card (js/vandaag.js)
  function vandaagHTML() {
    const s = S(), dd = s.dd; if (!dd || dd.day !== day() || !live()) return '';
    const p = Math.min(dd.n, ddProg()), pct = Math.round(p / dd.n * 100), tag = WD_TAG[wd()];
    return `<div class="vd-t10${dd.done ? ' ok' : ''}"><div class="k"><span>Top 10 · dagdoel</span><span>${s.pos ? `#${s.pos}` : 'nieuw'}</span></div>
      <div>${dd.done ? '✓ ' : ''}Earn <b>${fmt(dd.n)}</b> today: ${dd.label}</div>${dd.done ? '' : `<div class="bar"><i style="width:${pct}%"></i></div><small>${fmt(p)} so far${tag ? ` · ${tag}` : ''} · tonight's client pay counts · +${fmt(DD_PAY[rank()])}</small>`}</div>`;
  }

  // ---------------------------------------------------------------- the Krant
  function stories(d) { // the Maandag lead
    const s = S(); if (s.pub !== d || !s.table.length) return [];
    const me = s.table.find((x) => x.id === 'eddy'), top = s.table[0], movers = s.table.filter((x) => x.prev && x.id !== 'eddy').sort((a, b) => Math.abs(b.prev - b.pos) - Math.abs(a.prev - a.pos)), mv1 = movers[0];
    const head = me.pos === 1 ? 'Kipkruidenkade boy tops the Kaasland Top 10' : me.prev && me.pos < me.prev ? `Top 10: Eddy Jr. climbs to number ${me.pos}` : me.prev && me.pos > me.prev ? `Top 10: ${info(s.table[me.pos - 2].id).name} passes Eddy Jr.` : me.pos <= 10 ? `Kaasland Top 10: Eddy Jr. at number ${me.pos}` : `${info(top.id).name} top the Kaasland Top 10 again`;
    const body = `${info(top.id).name} lead the week with ${fmt(top.s)}${top.why ? ` (${top.why})` : ''}.${mv1 && mv1.prev !== mv1.pos ? ` Biggest mover: ${info(mv1.id).name}, ${mv1.prev > mv1.pos ? 'up' : 'down'} ${Math.abs(mv1.prev - mv1.pos)}: ${mv1.why}.` : ''} Eddy Jr. of the Kipkruidenkade: number ${me.pos} with ${fmt(me.s)}.`;
    return [{ p: me.pos <= 3 || (me.prev && me.prev > 10 && me.pos <= 10) ? 9.5 : 7.5, head, body }];
  }
  function paperBox(d) {
    const s = S(); if (!live()) return '';
    const c = wd(d), next = c === 0 ? 7 : 7 - c;
    if (!s.table.length) return `<div class="kk-box"><h4>Kaasland Top 10</h4><p>Every Maandag this paper ranks the spice traders of Kaasland on the week's omzet. Your first week counts: the list comes out in ${next} day${next > 1 ? 's' : ''}.</p></div>`;
    const rows = s.table, me = rows.find((x) => x.id === 'eddy');
    return `<div class="kk-box kk-t10"><h4>Kaasland Top 10 · week ${s.week}</h4><ol>${rows.slice(0, 10).map((x) => `<li${x.id === 'eddy' ? ' class="me"' : ''}><span>${info(x.id).name}</span><b>${fmt(x.s)}</b></li>`).join('')}</ol>${me.pos > 10 ? `<p class="kk-dim">${me.pos}. Eddy Jr. · ${fmt(me.s)}</p>` : ''}<p class="kk-dim">Next list: ${c === 0 ? 'next Maandag' : `Maandag, in ${next} day${next > 1 ? 's' : ''}`}.</p></div>`;
  }
  if (!document.getElementById('t10kk')) { const k = document.createElement('style'); k.id = 't10kk'; k.textContent = '.kk-t10 ol{margin:0;padding:0 0 0 20px;font-size:12px}.kk-t10 li{padding:1px 0;border-bottom:1px dotted #d8cba8}.kk-t10 li span{display:inline-block;max-width:70%}.kk-t10 li b{float:right;font-weight:600}.kk-t10 li.me{background:#ffe7a8;font-weight:700}'; document.head.appendChild(k); }

  // ---------------------------------------------------------------- Overzicht tab (js/hub.js)
  function html() {
    const s = S(), dd = s.dd, wk = weekOf(day()), proj = projection(wk), myI = proj.findIndex((x) => x.me);
    let h = `<div class="well" style="background:linear-gradient(180deg,#fff8ea,#fbe9c8);border-color:#e8c088"><b>Kaasland Top 10</b> · printed in the Krant every <b>Maandag</b>, ranking the spice traders on the week's omzet. Yours is what you earned this week, +/− up to 10% for what the buurten think of you, −10% with open bills.</div>`;
    if (!live()) return h + '<div class="well" style="margin-top:8px">Your name goes on the list once the mixing table is running.</div>';
    const E = eddyScore(weekSoFar());
    h += `<div class="well" style="margin-top:8px"><b>This week so far:</b> ${fmt(E.s)} <small>(${E.why.join(' · ')})</small>${wd() ? ` · against the others' usual week that is <b>number ${myI + 1}</b>${myI > 0 ? `, ${fmt(proj[myI - 1].s - E.s)} behind ${info(proj[myI - 1].id).name}` : ''}` : ' · a new week: everybody starts at zero today'}.`;
    if (dd && dd.day === day()) h += `<br><b>Dagdoel:</b> earn ${fmt(dd.n)} today, ${dd.label}. ${dd.done ? '<span class="pos">Done.</span>' : `${fmt(Math.min(dd.n, ddProg()))} so far.`} <small>(${s.hits.w === wk ? s.hits.n : 0}/7 this week; all seven pay a bonus on Maandag)</small>`;
    h += '</div>';
    if (s.table.length) h += `<div style="margin-top:8px"><b>Week ${s.week}</b> <small>(published day ${s.pub})</small>${listHTML(s.table, { why: true })}</div>`;
    else h += '<div class="well" style="margin-top:8px">The first list with your name in it comes out on Maandag.</div>';
    const st = stickerOf(s.pos);
    h += `<table class="list" style="margin-top:10px"><tr><th>Klimmen</th><th style="text-align:right"></th></tr>${MILES.map((M) => `<tr><td>${s.got[M.k] ? '★' : '☆'} <b>${M.name}</b> <small>(reach number ${M.pos})</small></td><td style="text-align:right">${s.got[M.k] ? `<small>week ${s.got[M.k]}</small>` : `${fmt(M.w)} + reputation`}</td></tr>`).join('')}
      <tr><td>Every place gained on Maandag</td><td style="text-align:right">${fmt(100)}</td></tr><tr><td>In the Top 10: the sticker on the van</td><td style="text-align:right">${st > 1 ? `<b class="pos">clients +${Math.round((st - 1) * 100)}% now</b>` : '+2% to +6%'}</td></tr></table>`;
    if (s.hist.length > 1) h += `<div class="well" style="margin-top:8px"><small><b>Your weeks:</b> ${s.hist.map((x) => `wk ${x.w}: #${x.pos}`).join(' · ')}${s.best ? ` · best ever #${s.best}` : ''}</small></div>`;
    return h;
  }

  // ---------------------------------------------------------------- per frame
  const live = () => state.step === 'free' && !!state.table && !!(deps.eligible && deps.eligible());
  let t = 0;
  function update(dt) {
    if ((t += dt) < 0.5) return; t = 0;
    if (!live()) return;
    const s = S();
    if (!s.dd || s.dd.day !== day()) { if (s.dd && !s.dd.done && s.dd.day === day() - 1) settleDD(true); rollDD(); }
    else if (!s.dd.done) settleDD(false);
    if (s.ddLate && !deps.busy()) { const L = s.ddLate; s.ddLate = null; deps.toast('DAGDOEL GEHAALD', `Last night's client pay did it: yesterday's Top 10 goal is in. +${fmt(L.w)}${s.hits.n > 1 ? ` · ${s.hits.n} this week` : ''}.`, 4); }
    if (pending && !cardOpen && !deps.busy()) showCard();
  }
  const sellBias = () => (live() ? stickerOf(S().pos) : 1);
  const isOpen = () => cardOpen;
  function escape() { if (cardOpen) { closeCard(false); return true; } return false; }
  return { ensure: S, onDay, update, publish, projection, rollDD, settleDD, vandaagHTML, stories, paperBox, html, sellBias, isOpen, escape, comments, RIVALS, get pending() { return pending; } };
}
