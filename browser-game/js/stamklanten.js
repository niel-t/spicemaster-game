// Stamklanten (2026-11-26): the neighbours who buy a bag of spice at the warehouse door. Each has a name, a favourite
// blend, a nose for quality and a purse, and each remembers the last bag: how good it was and what Eddy charged.
// Every market day the ones who feel like it come by (after the joints are served) and buy 1-3 kg at the door price
// Eddy sets (goedkoop / gewoon / duur). Good spice at a fair price earns hearts: more kilos, a tip, and at five hearts
// they send a friend. Dust at a silly price loses hearts; at zero they stay away for a few days.
// state.stam = { price: 0|1|2, open, r: { [id]: { h, q, p, day, say, away, n, miss } } }
import { BLENDS } from './economy.js';

export const REGS = [
  { id: 'sjaan', name: 'Tante Sjaan', likes: 'kip', taste: 2, purse: 'krap', kg: 1, bio: 'Three floors up, forty years on the Kipkruidenkade.' },
  { id: 'wim', name: 'Opa Wim', likes: 'slager', taste: 2, purse: 'gewoon', kg: 1, bio: 'Makes his own gehaktballen on Sunday. For nobody in particular.' },
  { id: 'dunya', name: 'Dunya', likes: 'lams', taste: 3, purse: 'gewoon', kg: 2, bio: 'Cooks for the whole stairwell on Fridays.' },
  { id: 'kevin', name: 'Kevin van 12-hoog', likes: 'kip', taste: 1, purse: 'krap', kg: 2, bio: 'Lives on shoarma and energy drink.' },
  { id: 'mevrprins', name: 'Mevrouw Prins', likes: 'speciaal', alt: 'lams', taste: 4, purse: 'ruim', kg: 1, bio: 'From the Herengracht. Smells the bag before she pays.' },
  { id: 'bayu', name: 'Bayu', likes: 'kebab', alt: 'kip', taste: 3, purse: 'gewoon', kg: 2, bio: 'Runs the toko round the corner. Knows his spice.' },
  { id: 'studenten', name: 'Het studentenhuis', likes: 'kip', taste: 1, purse: 'krap', kg: 3, bio: 'Eleven students, one pan.' },
  { id: 'ome', name: 'Ome Cor', likes: 'slager', taste: 3, purse: 'gewoon', kg: 2, bio: 'Retired butcher. Compares everything to 1974.' },
  { id: 'yasmina', name: 'Yasmina', likes: 'lams', taste: 4, purse: 'ruim', kg: 2, bio: 'Caters weddings. Buys small, tests, then buys big.' },
  { id: 'dirk', name: 'Dikke Dirk', likes: 'kebab', alt: 'kip', taste: 2, purse: 'gewoon', kg: 3, bio: 'Barbecues on his balcony in every weather.' },
  { id: 'zuster', name: 'Zuster Ria', likes: 'kip', taste: 3, purse: 'krap', kg: 1, bio: 'Wijkverpleegkundige. On her bike before six.' },
  { id: 'baron', name: 'Baron van Buren', likes: 'speciaal', alt: 'kebab', taste: 5, purse: 'ruim', kg: 2, bio: 'Sends his driver. Tips, if it is perfect.' },
];
const PRICE = [{ id: 'goedkoop', name: 'Goedkoop', m: 0.85 }, { id: 'gewoon', name: 'Gewoon', m: 1.05 }, { id: 'duur', name: 'Duur', m: 1.3 }];
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
const stars = (q) => '★'.repeat(Math.max(0, Math.round(q)));
const GOOD = ['"Dat is nog eens kruiden. Net als bij je vader."', '"Heerlijk. Ik kom terug."', '"De hele trap rook ernaar. Complimenten van de buren."', '"Zo hoort het. Niet veranderen."'];
const OK = ['"Prima. Niks mis mee."', '"Doet wat het moet doen."', '"Kan ermee door, jongen."'];
const BAD = ['"Dit is stof met een kleurtje, Eddy."', '"Vorige keer was het beter. Veel beter."', '"Mijn kat wilde het niet eens ruiken."'];
const DEAR = ['"Dat is geen prijs, dat is een overval."', '"Voor dat geld ga ik naar de Lampas."', '"Duur, hoor. Heel duur."'];
const CHEAP = ['"En nog betaalbaar ook. Je bent een goeie."', '"Voor die prijs neem ik er volgende keer twee."'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// deps: state, econ, addMoney, toast, save(), onServed(n), onHappy(), stats
export function createStamklanten(deps) {
  const { state, econ } = deps;
  function S() {
    const s = state.stam && typeof state.stam === 'object' ? state.stam : (state.stam = {});
    if (![0, 1, 2].includes(s.price)) s.price = 1; if (!s.r || typeof s.r !== 'object') s.r = {}; s.open = Math.max(4, Math.min(REGS.length, s.open | 0));
    return s;
  }
  const known = () => REGS.slice(0, S().open);
  const R = (id) => { const s = S(); return s.r[id] || (s.r[id] = { h: 2, n: 0, miss: 0, away: 0 }); };
  const maxHearts = () => Math.max(0, ...known().map((g) => Math.floor(R(g.id).h)));
  function onDay() { // called after the joints were served
    if (!state.table || state.step !== 'free') return;
    const s = S(), e = econ.ensure(), P = PRICE[s.price], rows = []; let friend = null;
    for (const g of known()) {
      const r = R(g.id);
      if (r.away > 0) { r.away--; if (!r.away) r.h = 1; continue; }
      if (Math.random() > 0.42 + r.h * 0.1) continue; // not today
      const bid = [g.likes, g.alt].find((b) => b && e.blends[b] && e.blends[b].kg >= 1);
      if (!bid) { r.miss = (r.miss | 0) + 1; if (r.miss >= 2) { r.h = Math.max(0, r.h - 0.5); r.miss = 0; r.say = '"Weer niks op de plank? Jammer."'; rows.push({ name: `${g.name} (stamklant)`, want: (BLENDS.find((b) => b.id === g.likes) || {}).name, note: 'nothing for them on the shelf', pay: 0 }); } continue; }
      r.miss = 0;
      const b = e.blends[bid], B = BLENDS.find((x) => x.id === bid), want = g.kg + (r.h >= 4 ? 1 : 0), kg = Math.min(want, Math.floor(b.kg)), q = b.q;
      b.kg = +(b.kg - kg).toFixed(2); if (b.kg <= 0.001) delete e.blends[bid];
      let pay = Math.round(B.value * (0.6 + 0.15 * q) * kg * P.m), dh = 0, say;
      if (Math.round(q) >= g.taste + 1) { dh += 0.5; say = pick(GOOD); } else if (Math.round(q) >= g.taste) { dh += 0.25; say = pick(OK); } else { dh -= 0.75; say = pick(BAD); } // trust comes slowly and goes quickly
      if (s.price === 2 && g.purse !== 'ruim') { dh -= g.purse === 'krap' ? 1 : 0.5; say = pick(DEAR); }
      else if (s.price === 0 && g.purse !== 'ruim' && dh >= 0) { dh += 0.25; if (g.purse === 'krap') say = pick(CHEAP); }
      if (bid !== g.likes) dh -= 0.25; // not their favourite, but it will do
      if (r.h >= 4 && dh > 0) { const tip = Math.round(pay * 0.1); pay += tip; }
      const h0 = r.h; r.h = Math.max(0, Math.min(5, r.h + dh)); r.q = Math.round(q); r.p = s.price; r.day = e.day; r.say = say; r.n = (r.n | 0) + 1;
      if (r.h <= 0) { r.away = 5; say += ' (stays away for a while)'; }
      if (h0 < 5 && r.h >= 5 && s.open < REGS.length) friend = g;
      if (dh > 0 && deps.onHappy) deps.onHappy();
      rows.push({ name: `${g.name} (stamklant ${'♥'.repeat(Math.floor(r.h))})`, want: `${want} kg ${B.name}`, kg, q, note: say, pay });
    }
    if (friend) { const nw = REGS[s.open]; s.open++; R(nw.id); deps.toast('NIEUWE STAMKLANT', `${friend.name} told ${nw.name} about your spice. ${nw.bio}`, 5); }
    if (!rows.length) return;
    const paid = rows.reduce((a, x) => a + x.pay, 0), served = rows.filter((x) => x.pay).length;
    if (paid) deps.addMoney(paid);
    const rep = e.report; if (rep && Array.isArray(rep.rows)) { rep.rows.push(...rows); rep.paid = (rep.paid || 0) + paid; }
    if (served && deps.onServed) deps.onServed(served);
    if (deps.save) deps.save();
  }
  function html() {
    const s = S(), e = econ.ensure();
    let h = `<div class="well"><b>Stamklanten</b> · neighbours who buy at the warehouse door after the joints are served. They remember the quality and the price of their last bag.<br>
      <b>Prijs aan de deur:</b> ${PRICE.map((p, i) => `<button class="ovb" data-stamprice="${i}" style="${i === s.price ? 'box-shadow:inset 0 0 0 2px #ffb43a;font-weight:700' : ''}">${p.name} (${p.m < 1 ? '−' : '+'}${Math.abs(Math.round((p.m - 1) * 100))}%)</button>`).join(' ')}
      <small> · Goedkoop wins hearts with thin purses, Duur loses them unless the customer is rich.</small></div>`;
    h += `<table class="list" style="margin-top:8px"><tr><th>Wie</th><th>Hart</th><th>Wil</th><th>Laatste zak</th></tr>${known().map((g) => { const r = R(g.id), B = BLENDS.find((x) => x.id === g.likes), have = e.blends[g.likes] && e.blends[g.likes].kg >= 1;
      return `<tr><td><b>${g.name}</b><br><small>${g.bio}</small></td><td style="white-space:nowrap;color:#d8304a">${'♥'.repeat(Math.floor(r.h))}<span style="color:#ccc">${'♥'.repeat(5 - Math.floor(r.h))}</span>${r.away ? `<br><small style="color:#888">away ${r.away} d</small>` : ''}</td><td>${g.kg} kg ${B ? B.name : g.likes}<br><small>${stars(g.taste)} or better · ${g.purse === 'krap' ? 'thin purse' : g.purse === 'ruim' ? 'money is no object' : 'ordinary purse'}${have ? '' : ' · <span style="color:#c33">not in stock</span>'}</small></td><td><small>${r.day ? `day ${r.day}: ${stars(r.q)} · ${PRICE[r.p || 1].name.toLowerCase()}<br>${r.say || ''}` : 'has not been by yet'}</small></td></tr>`; }).join('')}</table>`;
    if (s.open < REGS.length) h += `<p><small>${REGS.length - s.open} more neighbours have not heard of you yet. Five hearts and a stamklant sends a friend.</small></p>`;
    return h;
  }
  function bind(body, rerender) { body.querySelectorAll('[data-stamprice]').forEach((b) => b.onclick = () => { S().price = +b.dataset.stamprice; if (deps.save) deps.save(); rerender(); }); }
  return { onDay, html, bind, ensure: S, maxHearts, known, REGS };
}
