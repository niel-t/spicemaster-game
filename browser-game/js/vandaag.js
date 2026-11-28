// Vandaag (2026-11-26): three small goals from cousin Shooki every market day, so there is always an obvious next thing
// to do among all the systems. They suit Eddy's rank (Hulpje: order spice, rack pallets, talk to the street;
// Mengmeester: haggle, a raid, a klusje; Kruidenhandelaar and up: bigger stock, more cash, the buurt) and what is open
// to him (no van repair goal with a fresh van, no bills goal without open bills). Each one pays a little; all three
// pay a bonus. Rolled from the day number, so a reload shows the same three. A Frutiger Aero card like Shooki's tips,
// top right; on a phone it starts folded to one line.
// state.vandaag = { day, goals: [{ id, n, base, prog, done }], bonus, streak }

const RANK_PAY = [60, 120, 250, 400, 600];
// id: [rank from, label(n), n per rank, kind: 'note' (counted events) | 'poll' (a value read from the game), when(ctx)]
const GOALS = {
  order: { r: 0, label: () => 'Order spice on the Kruidenbeurs', n: [1], kind: 'note' },
  rack: { r: 0, label: () => 'Do warehouse work: rack the pallets', n: [1], kind: 'poll', val: (c) => (c.econ.today().did.loods ? 1 : 0) },
  rit: { r: 0, label: () => 'Do a delivery run in the Oofmobiel', n: [1], kind: 'poll', val: (c) => (c.econ.today().did.rit || c.econ.today().did.levering ? 1 : 0), when: (c) => !!(c.state.drives && Object.keys(c.state.drives).length) },
  talk: { r: 0, label: (n) => `Talk to ${n} shopkeepers on the block`, n: [2, 3, 3], kind: 'note' },
  naknik: { r: 0, label: () => 'Check on one of your Naknikim', n: [1], kind: 'note', when: (c) => (c.state.naknik | 0) > 0 },
  krant: { r: 0, label: () => 'Read the Krant voor het Kaasvolk', n: [1], kind: 'note', when: (c) => c.unlocked('krant') },
  klus: { r: 0, label: () => 'Do a klusje for a shopkeeper', n: [1], kind: 'note', when: (c) => c.klusOpen() },
  stock: { r: 1, label: (n) => `Get ${n} kg of blends on the shelves`, n: [10, 15, 30, 50], kind: 'poll', val: (c) => Math.floor(Object.values(c.econ.ensure().blends).reduce((a, b) => a + (b.kg || 0), 0)), abs: true, grow: 5 },
  haggle: { r: 1, label: () => 'Close a deal by haggling', n: [1], kind: 'note', when: (c) => c.unlocked('werk') },
  raid: { r: 1, label: () => 'Win a raid with a B or better', n: [1], kind: 'note', when: (c) => c.econ.canRaid ? c.econ.canRaid() !== false : true },
  cash: { r: 1, label: (n) => `Get your bank to W ${n.toLocaleString('nl-NL')}`, n: [1000, 2500, 6000, 12000, 25000], kind: 'poll', val: (c) => c.state.money, abs: true, money: true, grow: 500 },
  buurt: { r: 2, label: () => 'Win the Kipkruidenkade over a little (+3)', n: [3], kind: 'poll', val: (c) => Math.floor(c.rep('kade')) },
  repair: { r: 0, label: () => 'Get the Oofmobiel fixed at Garage Mo', n: [1], kind: 'poll', val: (c) => (c.wear() < 5 ? 1 : 0), abs: true, when: (c) => c.wear() >= 30, must: true },
  bills: { r: 0, label: () => 'Pay your open bills (Rekeningen)', n: [1], kind: 'poll', val: (c) => (c.owing() ? 0 : 1), abs: true, when: (c) => c.owing() > 0, must: true },
};
const rng = (seed) => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; };
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

// deps: state, econ, rank(), unlocked(tab), klusOpen(), rep(id), wear(), owing(), addMoney(n), addRep(n), toast(t, txt, s),
//       save(), hidden() (title, missions, PC, dialogue...), isTouch()
export function createVandaag(deps) {
  const { state, econ } = deps;
  const ctx = { state, econ, unlocked: deps.unlocked, klusOpen: deps.klusOpen, rep: deps.rep, wear: deps.wear, owing: deps.owing };
  const S = () => { const v = state.vandaag && typeof state.vandaag === 'object' ? state.vandaag : (state.vandaag = {}); if (!Array.isArray(v.goals)) v.goals = []; v.streak = v.streak | 0; return v; };
  const live = () => state.step === 'free' && !!state.table && !(deps.tutorial && deps.tutorial());
  const rank = () => Math.max(0, Math.min(4, deps.rank()));
  const nFor = (G) => G.n[Math.min(rank(), G.n.length - 1)];
  const valOf = (G) => { try { return G.val(ctx); } catch (e) { return 0; } };
  function roll(d) {
    const v = S(), r = rank(), R = rng(d * 7919 + (v.seed || (v.seed = 1 + Math.floor(Math.random() * 1e6))));
    const ok = Object.entries(GOALS).filter(([, G]) => r >= G.r && (!G.when || (() => { try { return G.when(ctx); } catch (e) { return false; } })()));
    const must = ok.filter(([, G]) => G.must).map(([id]) => id), pool = ok.filter(([, G]) => !G.must).map(([id]) => id);
    const pick = must.slice(0, 1); // one chore at most (fix the van, pay the bills)
    const fresh = pool.filter((id) => GOALS[id].r === r); // at least one that fits the rank you just reached
    if (fresh.length && pick.length < 3) pick.push(fresh[Math.floor(R() * fresh.length)]);
    const rest = pool.filter((id) => !pick.includes(id)); while (pick.length < 3 && rest.length) pick.push(rest.splice(Math.floor(R() * rest.length), 1)[0]);
    v.day = d; v.bonus = false; // goals with grow aim above what Eddy already has
    v.goals = pick.map((id) => { const G = GOALS[id], n = G.grow ? Math.ceil((Math.max(0, valOf(G)) + nFor(G)) / G.grow) * G.grow : nFor(G); return { id, n, base: G.kind === 'poll' && !G.abs ? valOf(G) : 0, prog: 0, done: false }; });
    render(true);
  }
  function check() {
    if (!live()) return; const v = S(), d = econ.ensure().day;
    if (v.day !== d) { roll(d); return; }
    let changed = false;
    for (const g of v.goals) {
      const G = GOALS[g.id]; if (!G || g.done) continue;
      if (G.kind === 'poll') { const p = Math.max(0, Math.min(g.n, valOf(G) - g.base)); if (p !== g.prog) { g.prog = p; changed = true; } }
      if (g.prog >= g.n) { g.done = true; changed = true; pay(g); }
    }
    if (changed) { if (!v.bonus && v.goals.length && v.goals.every((g) => g.done)) { v.bonus = true; v.streak++; const b = RANK_PAY[rank()] * 2; deps.addMoney(b); if (deps.addRep) deps.addRep(15); deps.toast('ALLE DRIE, CUZ!', `Shooki: "All three today, bro. Pa would be proud. Don't tell him I said that." Bonus +${fmt(b)}${v.streak > 1 ? ` · ${v.streak} days in a row` : ''}.`, 5); } render(); if (deps.save) deps.save(); }
  }
  function pay(g) { const w = RANK_PAY[rank()]; deps.addMoney(w); if (deps.addRep) deps.addRep(5); deps.beep && deps.beep(880, 0.06, 'triangle', 0.04); flash(g.id, w); }
  function note(kind, data) {
    if (!live()) return; const v = S(); if (v.day !== econ.ensure().day) return;
    for (const g of v.goals) { if (g.done || GOALS[g.id].kind !== 'note') continue;
      if (g.id === kind && !(kind === 'raid' && data && !/^(S|A|B)/.test(data))) g.prog = Math.min(g.n, g.prog + 1); }
    check(); render();
  }

  // ---------------------------------------------------------------- the card
  const el = document.createElement('div'); el.id = 'vandaag';
  const css = document.createElement('style');
  css.textContent = `#vandaag{position:fixed;right:16px;top:118px;z-index:30;width:268px;display:none;padding:9px 12px 10px;border-radius:16px 16px 6px 16px;color:#07304f;font:400 13px/1.35 "Segoe UI",Tahoma,Rubik,Arial,sans-serif;
  background:linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(236,248,255,.92) 42%,rgba(204,236,255,.9) 54%,rgba(226,246,255,.94) 100%);border:1px solid #fff;-webkit-backdrop-filter:blur(12px) saturate(1.6);backdrop-filter:blur(12px) saturate(1.6);
  box-shadow:0 0 0 2px rgba(80,170,230,.55),0 8px 22px rgba(0,40,80,.35),inset 0 1px 0 #fff,inset 0 -8px 16px rgba(90,180,240,.18);user-select:none}
#vandaag::before{content:"";position:absolute;left:8px;right:8px;top:3px;height:30%;border-radius:13px 13px 50% 50%/13px 13px 8px 8px;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,0))}
#vandaag>*{position:relative}
#vandaag .vd-h{display:flex;align-items:center;gap:8px;cursor:pointer}
#vandaag .vd-h img{width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 0 0 1px rgba(40,120,180,.5);background:#5ab4ea}
#vandaag .vd-t{flex:1;font-weight:700;color:#0a6ab0;font-size:11px;letter-spacing:.05em;text-transform:uppercase}#vandaag .vd-t b{display:block;color:#07406a;font-size:15px;letter-spacing:0;text-transform:none}
#vandaag .vd-n{font-weight:700;color:#07406a;font-size:13px;padding:2px 8px;border-radius:10px;background:linear-gradient(180deg,#fff,#d8efff);box-shadow:inset 0 0 0 1px #8cc4e8}
#vandaag ul{list-style:none;margin:7px 0 0;padding:0}#vandaag li{display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-top:1px solid rgba(90,160,210,.25)}
#vandaag li i{flex:none;width:16px;height:16px;margin-top:1px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#bfe2f8 45%,#7ab8e0);box-shadow:inset 0 0 0 1px #5e9cc6}
#vandaag li.ok i{background:radial-gradient(circle at 35% 30%,#f4ffe0,#9ae05a 45%,#3a9a2a);box-shadow:inset 0 0 0 1px #2a7a1a}#vandaag li.ok i::after{content:"✓";display:block;color:#fff;font:700 11px/16px Arial;text-align:center}
#vandaag li span{flex:1}#vandaag li.ok span{color:#5a7a8a;text-decoration:line-through}#vandaag li small{flex:none;color:#b8501a;font-weight:700}#vandaag li em{font-style:normal;color:#4a7a9a;font-size:11px}
#vandaag.fold ul,#vandaag.fold .vd-f{display:none}#vandaag .vd-f{margin-top:5px;font-size:11px;color:#4a7a9a}
#vandaag li.pop{animation:vdPop .9s ease-out}@keyframes vdPop{0%{background:rgba(154,224,90,.6)}100%{background:transparent}}
body.touch #vandaag{top:auto;bottom:auto;top:calc(150px + env(safe-area-inset-top));width:min(250px,46vw);font-size:12px}
@media (max-width:820px),(max-height:500px){#vandaag{top:calc(92px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));width:min(240px,48vw);padding:7px 9px;font-size:11.5px}#vandaag .vd-h img{width:24px;height:24px}#vandaag .vd-t b{font-size:13px}}`;
  document.head.appendChild(css); document.body.appendChild(el);
  let folded = null, popId = null;
  el.addEventListener('click', (e) => { e.stopPropagation(); if (e.target.closest('.vd-h')) { folded = !isFolded(); render(); } });
  const isFolded = () => (folded === null ? !!(deps.isTouch && deps.isTouch()) : folded);
  function flash(id, w) { popId = id; render(); setTimeout(() => { popId = null; }, 900); deps.toast('VANDAAG', `${GOALS[id].label(S().goals.find((g) => g.id === id).n)}: done. +${fmt(w)}`, 2.5); }
  let last = '';
  function render(force) {
    const v = S(), show = live() && v.goals.length && !deps.hidden();
    if (!show) { if (el.style.display !== 'none') el.style.display = 'none'; return; }
    const done = v.goals.filter((g) => g.done).length, w = RANK_PAY[rank()];
    const html = `<div class="vd-h"><img src="./assets/face_shooki_sq.jpg" alt=""><div class="vd-t">Shooki · vandaag<b>${done === v.goals.length ? 'Klaar voor vandaag!' : 'Three things for today'}</b></div><div class="vd-n">${done}/${v.goals.length}</div></div>
      <ul>${v.goals.map((g) => { const G = GOALS[g.id], cnt = g.n > 1 && !g.done && !G.money ? ` <em>${G.abs ? Math.min(g.n, Math.max(0, valOf(G))) : g.prog}/${g.n}</em>` : ''; return `<li class="${g.done ? 'ok' : ''}${popId === g.id ? ' pop' : ''}"><i></i><span>${G.label(g.n)}${cnt}</span><small>${g.done ? '' : '+' + fmt(w)}</small></li>`; }).join('')}</ul>
      ${deps.extra ? deps.extra() : ''}
      <div class="vd-f">${v.bonus ? `All three done${v.streak > 1 ? `, ${v.streak} days in a row` : ''}. New goals tomorrow.` : `All three: +${fmt(w * 2)} bonus. New ones every market day.`}</div>`;
    if (el.style.display !== 'block') el.style.display = 'block';
    if (innerWidth <= 600 && innerHeight > innerWidth) { // a phone held upright: under the objective box, clear of SHMOKIA
      const ob = document.getElementById('objective'); let bot = 0; if (ob && ob.style.opacity !== '0') for (const e of [ob, ...ob.querySelectorAll('*')]) { const r = e.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom); } const dsE = document.getElementById('dstrip'); if (dsE && dsE.style.display === 'block') bot = Math.max(bot, dsE.getBoundingClientRect().bottom); const y = Math.round(bot ? bot + 14 : 110) + 'px';
      if (el.style.top !== y) { el.style.top = y; el.style.left = 'calc(10px + env(safe-area-inset-left))'; el.style.right = 'auto'; }
    } else if (el.style.top) { el.style.top = el.style.left = el.style.right = ''; }
    el.classList.toggle('fold', isFolded());
    if (html !== last || force) { el.innerHTML = html; last = html; }
  }
  let t = 0;
  function update(dt) { t += dt; if (t < 0.4) return; t = 0; check(); render(); }
  return { update, note, roll, render, ensure: S, GOALS, el };
}
