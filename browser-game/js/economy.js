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
    e.day++;
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
    if (deps.toast) deps.toast(`MARKET DAY ${e.day}`, headline ? `Kruidenbeurs: ${headline.text}.` : `Spice prices moved${why ? ' while you were ' + why : ''}. Check the Kruidenbeurs on the PC.`, 3);
    return e.day;
  }
  // called every frame: a finished mission bumps state.raids, which ends the day
  function update() {
    const e = ensure(), r = state.raids || 0;
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
  const stockTotal = () => Object.values(ensure().stock).reduce((a, b) => a + b, 0);
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
    h += '<p><small>Naknikim start mixing blends from this stock in the next update. Until then they keep mixing the starter spices that came with the table.</small></p>';
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

  return { INGREDIENTS, GRADES, STOCK_CAP, ensure, advance, update, price, buy, sell, unpackCrates, stockOf, stockTotal, html, bind };
}
