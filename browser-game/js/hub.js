// The overview layer (2026-11-26, Tristan: "the UI is not really logical sometimes"):
//   Overzicht (Tab, or the OVERZICHT pill on touch): one window with tabs for everything you check during a day:
//            Vandaag, Geld (where the Wilders went), Voorraad, Rekeningen, Buurten, Bendes (heat) and the maps.
//   Dagstrook: a strip at the top with the weekday, the weather and what's due (the truck, the vaste klanten,
//            Maandag's bills), instead of all of it inside the objective box.
//   Geld:    every change of the Wilders gets a reason (the toast, the PC program or the button it came from), so
//            tapping the money shows why it moved.
//   Nieuw:   when a PC program opens up, a card says what it is with a "Laat zien" button, instead of it quietly appearing.
//   Route:   a goal or a shop can set the yellow light (js/buurt.js); when it is off screen an arrow on the edge points to it.
// Everything here only reads the other systems; it never changes their rules.
import { INGREDIENTS, BLENDS, GRADES } from './economy.js';

const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = (h) => String(h || '').replace(/<[^>]+>/g, '').trim();

// deps: THREE, state, econ, world(), bills(), brep(), vandaag(), winkels(), buurt(), openPC(tab), camera, player, toast, beep,
//       blocked() (title, mission, drive, dialogue: no hub), busy(), goalSpot(id) -> { x, z, name } | { biz },
//       tabLabel(id), isTouch(), save(), dueToday() -> [strings]
export function createHub(deps) {
  const { state, econ } = deps;
  const $ = (id) => document.getElementById(id);
  const css = document.createElement('style');
  css.textContent = `
#ovz{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(6,20,36,.35);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)}
#ovz .ov-w{width:min(820px,calc(100vw - 24px));height:min(600px,calc(100vh - 24px));display:flex;flex-direction:column;border-radius:14px;overflow:hidden;font:400 14px/1.4 "Segoe UI",Tahoma,Rubik,Arial,sans-serif;color:#07304f;
  background:linear-gradient(180deg,#f8fcff,#e6f3fc);box-shadow:0 0 0 1px rgba(255,255,255,.8),0 0 0 3px rgba(60,150,220,.55),0 18px 50px rgba(0,30,70,.5)}
#ovz .ov-h{display:flex;align-items:center;gap:10px;padding:8px 10px 8px 14px;background:linear-gradient(180deg,#5cb8f0 0%,#2a8ad8 48%,#1a6ac0 52%,#3a9ae0 100%);color:#fff;text-shadow:0 1px 2px rgba(0,30,70,.6)}
#ovz .ov-h b{flex:1;font:700 16px "Segoe UI",Tahoma,Arial}
.smeX{width:30px;height:24px;border-radius:5px;border:1px solid rgba(80,10,0,.6);background:linear-gradient(180deg,#f0a090,#d84a2a 48%,#c0301a 52%,#e86a4a);color:#fff;font:700 15px/20px Arial;cursor:pointer;box-shadow:inset 0 1px 0 rgba(255,255,255,.55);flex:none}
.smeX:hover,#bzov .bz-x:hover,#shop .gsX:hover{filter:brightness(1.12)}
#bzov .bz-x,#shop .gsX{width:30px!important;height:24px!important;border-radius:5px!important;border:1px solid rgba(80,10,0,.6)!important;background:linear-gradient(180deg,#f0a090,#d84a2a 48%,#c0301a 52%,#e86a4a)!important;color:#fff!important;font:700 17px/20px Arial!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.55)!important;cursor:pointer;padding:0!important}
#ovz .ov-t{display:flex;gap:4px;padding:8px 10px 0;flex-wrap:wrap;border-bottom:1px solid #9cc8e8}
#ovz .ov-t button{font:600 13px "Segoe UI",Tahoma,Arial;color:#07406a;border:1px solid #8cbce0;border-bottom:none;border-radius:8px 8px 0 0;padding:6px 12px;background:linear-gradient(180deg,#fff,#dceefa);cursor:pointer}
#ovz .ov-t button.on{background:#fff;color:#0a5aa0;box-shadow:inset 0 3px 0 #ffb43a;position:relative;top:1px}
#ovz .ov-b{flex:1;overflow:auto;padding:12px 14px;background:#fff}
#ovz .well{border:1px solid #cfe3f2;border-radius:8px;padding:8px 10px;background:#f6fbff}
#ovz table.list{width:100%;border-collapse:collapse}#ovz table.list th{text-align:left;font-weight:600;color:#3a6a8a;border-bottom:1px solid #cfe3f2;padding:4px}#ovz table.list td{border-bottom:1px solid #eef4f8;padding:5px 4px;vertical-align:top}
#ovz button.b95,#ovz .ovb{font:600 13px "Segoe UI",Tahoma,Arial;color:#07304f;border:1px solid #5e9cc6;border-radius:9px;padding:4px 11px;background:linear-gradient(180deg,#fff 0%,#eef8fd 48%,#cfe9f8 52%,#e6f5fc 100%);cursor:pointer}
#ovz .ovb:hover,#ovz button.b95:hover{background:linear-gradient(180deg,#e6fbff,#8fe0ff 45%,#2fb4f0 52%,#7fe4ff)}
#ovz .gl{display:flex;gap:10px;align-items:center;padding:7px 4px;border-bottom:1px solid #eef4f8}#ovz .gl i{width:16px;height:16px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 30%,#fff,#bfe2f8 45%,#7ab8e0);box-shadow:inset 0 0 0 1px #5e9cc6}
#ovz .gl.ok i{background:radial-gradient(circle at 35% 30%,#f4ffe0,#9ae05a 45%,#3a9a2a)}#ovz .gl span{flex:1}#ovz .gl.ok span{text-decoration:line-through;color:#6a8a9a}
#ovz .pos{color:#1a8a2a;font-weight:600}#ovz .neg{color:#c0301a;font-weight:600}
@media (max-width:600px){#ovz .ov-w{height:calc(100vh - 16px);width:calc(100vw - 12px)}#ovz .ov-t button{padding:5px 8px;font-size:12px}#ovz .ov-b{padding:10px}}
#dstrip{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:12;display:none;max-width:min(560px,46vw);padding:5px 14px 6px;border-radius:14px;text-align:center;color:#fff;font:600 13px/1.35 Rubik,"Segoe UI",Arial,sans-serif;text-shadow:0 1px 2px #000;
  background:rgba(30,18,10,.55);border:1px solid rgba(255,226,170,.45);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 4px 12px rgba(0,0,0,.3);cursor:pointer;pointer-events:auto}
html.aero #dstrip{background:linear-gradient(180deg,rgba(120,80,48,.62),rgba(70,42,22,.66) 48%,rgba(42,25,13,.74) 52%,rgba(54,33,18,.7));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#dstrip .d1 b{color:#ffd36b}#dstrip .d2{font-weight:400;font-size:12px;color:#f3e6c8}#dstrip .d2 span+span::before{content:" · ";color:#c8a47a}
@media (max-width:820px),(max-height:500px){#dstrip{font-size:11.5px;max-width:52vw;padding:4px 10px}#dstrip .d2{font-size:10.5px}}
#money{cursor:pointer;pointer-events:auto}
body.riding #dstrip{display:none!important}
#nieuwcard{position:fixed;left:50%;top:22%;transform:translateX(-50%);z-index:58;width:min(420px,calc(100vw - 28px));display:none;padding:14px 16px;border-radius:18px;color:#07304f;font:400 14px/1.4 "Segoe UI",Tahoma,Rubik,Arial,sans-serif;
  background:linear-gradient(180deg,rgba(255,255,255,.97),rgba(226,244,255,.95) 50%,rgba(204,236,255,.95) 52%,rgba(232,248,255,.97));box-shadow:0 0 0 2px rgba(80,170,230,.6),0 14px 34px rgba(0,40,80,.45);animation:stIn .25s ease-out}
#nieuwcard .nc-h{display:flex;gap:10px;align-items:center}#nieuwcard .nc-h svg,#nieuwcard .nc-h img{width:44px;height:44px;flex:none}#nieuwcard .nc-k{font-size:11px;font-weight:700;letter-spacing:.06em;color:#0a6ab0;text-transform:uppercase}#nieuwcard .nc-t{font:700 18px "Segoe UI",Tahoma,Arial;color:#07406a}
#nieuwcard .nc-x{margin:8px 0 10px}#nieuwcard .nc-b{display:flex;gap:10px;justify-content:flex-end}
#nieuwcard button{font:600 14px "Segoe UI",Tahoma,Arial;color:#07304f;border:1px solid #5e9cc6;border-radius:10px;padding:6px 14px;background:linear-gradient(180deg,#fff 0%,#eef8fd 48%,#cfe9f8 52%,#e6f5fc 100%);cursor:pointer}
#nieuwcard button.go{background:linear-gradient(180deg,#fff1c8,#ffd27a 22%,#f2b84b 49%,#df8d1c 51%,#eda43a 80%,#ffc865);border-color:#b07a10;color:#3a2000}
#wayarrow{position:fixed;z-index:11;display:none;pointer-events:none;width:0;height:0}
#wayarrow .wa{position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff6c8,#ffd36b 45%,#e8a01a);box-shadow:0 0 0 2px #fff,0 3px 10px rgba(0,0,0,.45)}
#wayarrow .wa::after{content:"";position:absolute;left:14px;top:-10px;border:8px solid transparent;border-bottom:14px solid #ffd36b;filter:drop-shadow(0 -1px 0 #fff)}
#wayarrow small{position:absolute;left:-40px;top:24px;width:80px;text-align:center;color:#fff;font:700 11px Rubik,Arial;text-shadow:0 1px 2px #000}`;
  document.head.appendChild(css);

  // ================================================================ Geld: why the Wilders moved
  const ledger = []; let lastToast = null;
  function noteMoney(n, why) {
    const t = performance.now(), L = ledger[0];
    if (!why && lastToast && t - lastToast.t < 700) why = lastToast.title;
    if (L && L.why && L.why === why && t - L.t < 60000 && Math.sign(L.n) === Math.sign(n)) { L.n += n; L.k++; L.t = t; L.day = day(); return; }
    ledger.unshift({ n, why: why || '', t, k: 1, day: day() }); if (ledger.length > 60) ledger.length = 60;
    const e = ledger[0]; if (!e.why) setTimeout(() => { if (!e.why && lastToast && lastToast.t >= e.t - 50) e.why = lastToast.title; if (!e.why) e.why = guess(); }, 700);
  }
  const guess = () => (deps.inPCTab && deps.inPCTab()) || (state.naknik ? 'Naknikim, sales' : 'Kipkruidenkwartier');
  function noteToast(title) { lastToast = { title: strip(title).slice(0, 48), t: performance.now() }; const e = ledger[0]; if (e && !e.why && performance.now() - e.t < 700) e.why = lastToast.title; }
  const day = () => econ.ensure().day;

  // ================================================================ Overzicht
  const TABS = [['vandaag', 'Vandaag'], ['klanten', 'Klanten'], ['geld', 'Geld'], ['voorraad', 'Voorraad'], ['bills', 'Rekeningen'], ['rep', 'Buurten'], ['heat', 'Bendes'], ['top10', 'Top 10'], ['stats', 'Cijfers'], ['kaart', 'Kaarten']];
  const ov = document.createElement('div'); ov.id = 'ovz';
  ov.innerHTML = '<div class="ov-w" role="dialog" aria-label="Overzicht"><div class="ov-h"><b>Overzicht</b><small class="ov-k"></small><button class="smeX" title="Close (Esc)" aria-label="Close">✕</button></div><div class="ov-t"></div><div class="ov-b"></div></div>';
  document.body.appendChild(ov);
  let tab = 'vandaag', open = false;
  ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
  ov.querySelector('.smeX').onclick = () => close();
  ov.querySelector('.ov-t').addEventListener('click', (e) => { const b = e.target.closest('button[data-t]'); if (b) { tab = b.dataset.t; render(); deps.beep && deps.beep(660, 0.03, 'triangle', 0.02); } });
  ['pointerdown', 'mousedown', 'touchstart', 'wheel'].forEach((ev) => ov.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  function show(t) { if (deps.blocked()) return false; if (t) tab = t; open = true; state.inPC = true; ov.style.display = 'flex'; render(); return true; }
  function close() { if (!open) return; open = false; state.inPC = false; ov.style.display = 'none'; }
  function toggle(t) { if (open) close(); else show(t); }
  function render() {
    ov.querySelector('.ov-k').textContent = deps.isTouch && deps.isTouch() ? '' : 'Tab / Esc to close';
    ov.querySelector('.ov-t').innerHTML = TABS.map(([id, n]) => `<button data-t="${id}" class="${id === tab ? 'on' : ''}">${n}</button>`).join('');
    const b = ov.querySelector('.ov-b'); b.innerHTML = body(tab); bind(tab, b);
  }
  function body(t) {
    if (t === 'vandaag') {
      const v = deps.vandaag(), s = v && v.ensure(), G = v ? v.GOALS : {};
      const due = deps.dueToday();
      let h = `<div class="well"><b>${deps.world() ? `${deps.world().cal().wdName}, day ${day()}` : `Day ${day()}`}</b> · ${strip(econ.planLine())}</div>`;
      if (due.length) h += `<div class="well" style="margin-top:8px"><b>Vandaag en morgen</b><br>${due.map((x) => `· ${x}`).join('<br>')}</div>`;
      if (s && s.goals.length) h += `<div style="margin-top:8px"><b>Shooki's three for today</b>${s.goals.map((g) => `<div class="gl${g.done ? ' ok' : ''}"><i></i><span>${G[g.id].label(g.n)}</span>${g.done ? '' : `<button class="ovb" data-way="${g.id}">Wijs de weg</button>`}</div>`).join('')}</div>`;
      else h += '<div class="well" style="margin-top:8px">Shooki\'s goals start once the mixing table is running.</div>';
      const t10 = deps.top10 && deps.top10(), dd = t10 && t10.ensure().dd;
      if (dd && dd.day === day()) h += `<div class="well" style="margin-top:8px;background:#fff6e4;border-color:#e8c088"><b>Top 10 dagdoel:</b> earn ${fmt(dd.n)} today, ${dd.label}. ${dd.done ? '<span class="pos">Done.</span>' : ''} <button class="ovb" data-t10="1">Kaasland Top 10</button></div>`;
      return h;
    }
    if (t === 'geld') {
      const rows = ledger.filter((l) => l.n);
      return `<div class="well"><b>${fmt(state.money)}</b> in the bank. Where it came from and where it went lately:</div><table class="list" style="margin-top:8px"><tr><th>Day</th><th>What</th><th style="text-align:right">Wilders</th></tr>${rows.map((l) => `<tr><td>${l.day}</td><td>${esc(l.why || 'other')}${l.k > 1 ? ` <small>(${l.k}×)</small>` : ''}</td><td style="text-align:right" class="${l.n >= 0 ? 'pos' : 'neg'}">${l.n >= 0 ? '+' : '−'}${fmt(Math.abs(l.n))}</td></tr>`).join('') || '<tr><td colspan="3"><small>Nothing yet this session.</small></td></tr>'}</table>`;
    }
    if (t === 'voorraad') {
      const e = econ.ensure(), bl = Object.entries(e.blends || {}).filter(([, b]) => b.kg > 0.05), ing = {};
      for (const [k, v] of Object.entries(e.stock || {})) { const [id, g] = k.split(':'); (ing[id] = ing[id] || {})[g] = v; }
      let h = `<div class="well">Warehouse: <b>${Math.round(econ.stockTotal())} kg</b> on the shelves.</div>`;
      h += `<table class="list" style="margin-top:8px"><tr><th>Blends</th><th style="text-align:right">kg</th><th>Quality</th></tr>${bl.map(([id, b]) => `<tr><td>${(BLENDS.find((x) => x.id === id) || { name: id }).name}</td><td style="text-align:right">${Math.floor(b.kg * 10) / 10}</td><td>${'★'.repeat(Math.round(b.q || 0))}</td></tr>`).join('') || '<tr><td colspan="3"><small>No blends mixed yet.</small></td></tr>'}</table>`;
      h += `<table class="list" style="margin-top:8px"><tr><th>Spices</th><th style="text-align:right">kg</th><th>Grades</th></tr>${Object.entries(ing).map(([id, gs]) => `<tr><td>${(INGREDIENTS.find((x) => x.id === id) || { name: id }).name}</td><td style="text-align:right">${Math.round(Object.values(gs).reduce((a, b) => a + b, 0) * 10) / 10}</td><td><small>${Object.entries(gs).map(([g, kg]) => `${(GRADES.find((x) => x.id === g) || { name: g }).name} ${Math.round(kg * 10) / 10}`).join(', ')}</small></td></tr>`).join('') || '<tr><td colspan="3"><small>Empty shelves. Order on the Kruidenbeurs (PC).</small></td></tr>'}</table>`;
      return h + (econ.inboundHTML() ? `<div style="margin-top:8px">${econ.inboundHTML()}</div>` : '');
    }
    if (t === 'bills') return deps.bills() ? deps.bills().html() : '';
    if (t === 'klanten') return deps.stam && deps.stam() ? deps.stam().html() : '';
    if (t === 'top10') return deps.top10 && deps.top10() ? deps.top10().html() : '';
    if (t === 'stats') return deps.stats && deps.stats() ? deps.stats().html() : '';
    if (t === 'rep') return deps.brep() ? deps.brep().html() : '';
    if (t === 'heat') {
      const H = econ.ensure().heat || {}, names = { lampas: 'Lampas', noshgey: 'Noshgey Kariot', abdavissies: 'Abdavissies', paravim: 'Paravim' }, done = { lampas: 'act1', noshgey: 'act2', abdavissies: 'act3', paravim: 'paravim' };
      const rows = Object.keys(names).filter((k) => (H[k] || 0) > 0 || (k === 'lampas' && !state.act1));
      return `<div class="well">How angry each gang is (0-100). It climbs with every joint of theirs you hold and cools a little each day; a buurt on your side cools it faster. At 100 they come for the warehouse.</div><table class="list" style="margin-top:8px">${rows.map((k) => { const v = Math.round(H[k] || 0), c = v >= 60 ? '#c0301a' : v >= 40 ? '#e08000' : '#3a9a2a'; return `<tr><td><b>${names[k]}</b>${state[done[k]] ? ' <small>(finished)</small>' : ''}</td><td><span style="display:inline-block;width:160px;height:10px;border:1px solid #888;vertical-align:middle;background:linear-gradient(90deg,${c} ${v}%,#eee ${v}%)"></span> ${v}</td></tr>`; }).join('') || '<tr><td><small>No gang is angry with you right now.</small></td></tr>'}</table><p><small>Tribute and turf details: Dagrapport on the PC.</small></p>`;
    }
    if (t === 'kaart') return `<div class="well">Two maps:</div><div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap"><button class="ovb" data-map="buurt">Buurtkaart · every shop on the block, open today, set a route</button><button class="ovb" data-map="kaasland">Kaart van Kaasland · districts and joints (M)</button></div>${deps.buurt() && deps.buurt().route ? '<p><button class="ovb" data-map="clear">Clear the route</button></p>' : ''}`;
    return '';
  }
  function bind(t, b) {
    if (t === 'bills' && deps.bills()) deps.bills().bind(b, render);
    if (t === 'klanten' && deps.stam && deps.stam()) deps.stam().bind(b, render);
    b.querySelectorAll('[data-t10]').forEach((x) => x.onclick = () => { tab = 'top10'; render(); });
    b.querySelectorAll('[data-way]').forEach((x) => x.onclick = () => { if (goTo(x.dataset.way)) close(); });
    b.querySelectorAll('[data-map]').forEach((x) => x.onclick = () => { const m = x.dataset.map; close(); if (m === 'buurt' && deps.buurt()) deps.buurt().open(); else if (m === 'kaasland') deps.openPC('map'); else if (m === 'clear' && deps.buurt()) deps.buurt().clearRoute(); });
  }
  function goTo(goal) {
    const s = deps.goalSpot(goal); const B = deps.buurt(); if (!s || !B) { deps.toast('VANDAAG', 'That one happens on the PC or on a mission: no route needed.', 2.4); return false; }
    if (s.biz) B.setRoute(s.biz); else B.setPoint(s.x, s.z, s.name);
    return true;
  }

  // ================================================================ Dagstrook
  const ds = document.createElement('div'); ds.id = 'dstrip'; ds.title = 'Overzicht (Tab)'; document.body.appendChild(ds);
  ds.addEventListener('click', (e) => { e.stopPropagation(); show('vandaag'); });
  let dsKey = '';
  function strip_() {
    const W = deps.world(), on = state.step === 'free' && !deps.blocked() && !state.inPC && W;
    if (!on) { if (ds.style.display !== 'none') ds.style.display = 'none'; return; }
    const c = W.cal(), w = W.weather(), due = deps.dueToday().slice(0, 3);
    const h = `<div class="d1">${w.icon} <b>${c.wdName}${deps.time ? ' ' + deps.time() : ''}</b> · day ${c.d} · ${w.name} ${w.temp}° · ${c.season.name || c.season.id}${c.holi ? ` · <b>${c.holi.name}</b>` : ''}</div>${due.length ? `<div class="d2">${due.map((x) => `<span>${x}</span>`).join('')}</div>` : ''}`;
    if (h !== dsKey) { ds.innerHTML = h; dsKey = h; }
    if (ds.style.display !== 'block') ds.style.display = 'block';
    if (innerWidth <= 600 && innerHeight > innerWidth) { // an upright phone: the top edge is full, so it sits under the objective box
      const ob = $('objective'); let bot = 0; if (ob && ob.style.opacity !== '0') for (const e of [ob, ...ob.querySelectorAll('*')]) { const r = e.getBoundingClientRect(); if (r.height) bot = Math.max(bot, r.bottom); }
      const y = Math.round(bot ? bot + 8 : 100) + 'px'; if (ds.style.top !== y) { ds.style.top = y; ds.style.left = 'calc(10px + env(safe-area-inset-left))'; ds.style.transform = 'none'; ds.style.textAlign = 'left'; ds.style.maxWidth = '70vw'; }
    } else if (ds.style.top) { ds.style.top = ds.style.left = ds.style.transform = ds.style.textAlign = ds.style.maxWidth = ''; }
  }

  // ================================================================ Nieuw: a program opened up
  const nc = document.createElement('div'); nc.id = 'nieuwcard'; document.body.appendChild(nc);
  const queue = []; let ncOpen = null;
  ['pointerdown', 'mousedown', 'touchstart'].forEach((ev) => nc.addEventListener(ev, (e) => e.stopPropagation(), { passive: true }));
  function unlocked(id, what, icon) { if (queue.some((q) => q.id === id) || (ncOpen && ncOpen.id === id)) return; queue.push({ id, what, icon }); }
  function nextCard() {
    if (ncOpen || !queue.length || deps.busy()) return;
    const q = ncOpen = queue.shift();
    nc.innerHTML = `<div class="nc-h">${q.icon || ''}<div><div class="nc-k">Nieuw op je pc</div><div class="nc-t">${esc(deps.tabLabel(q.id))}</div></div></div><div class="nc-x">${q.what}</div><div class="nc-b"><button class="later">Later</button><button class="go">Laat zien</button></div>`;
    nc.style.display = 'block'; state.inPC = true; deps.beep && deps.beep(990, 0.06, 'triangle', 0.04);
    nc.querySelector('.later').onclick = () => done(false); nc.querySelector('.go').onclick = () => done(true);
  }
  function done(go) { if (!ncOpen) return; const id = ncOpen.id; ncOpen = null; nc.style.display = 'none'; state.inPC = false; if (go) deps.openPC(id); }

  // ================================================================ Route: an arrow on the screen edge
  const wa = document.createElement('div'); wa.id = 'wayarrow'; wa.innerHTML = '<div class="wa"></div><small></small>'; document.body.appendChild(wa);
  const V = new deps.THREE.Vector3();
  function arrow() {
    const B = deps.buurt(), r = B && B.route;
    const trip = deps.arrowOk && deps.arrowOk(); // on a drive (js/rit.js) the arrow is the sat-nav
    if (!r || state.inPC || (!trip && (deps.blocked() || deps.indoors()))) { if (wa.style.display !== 'none') wa.style.display = 'none'; return; }
    const behind = V.set(r.x, 1, r.z).applyMatrix4(deps.camera.matrixWorldInverse).z > 0; // behind the camera (a point past the far plane is still ahead)
    V.set(r.x, 1, r.z).project(deps.camera); let x = (V.x + 1) / 2 * innerWidth, y = (1 - V.y) / 2 * innerHeight;
    const onScreen = !behind && x > 30 && x < innerWidth - 30 && y > 30 && y < innerHeight - 30;
    if (onScreen) { wa.style.display = 'none'; return; }
    const cx = innerWidth / 2, cy = innerHeight / 2; let dx = x - cx, dy = y - cy; if (behind) { dx = -dx; dy = -dy; }
    const k = Math.min((innerWidth / 2 - 46) / Math.abs(dx || 1e-3), (innerHeight / 2 - 60) / Math.abs(dy || 1e-3));
    wa.style.left = (cx + dx * k) + 'px'; wa.style.top = Math.max(trip ? (innerWidth < 600 ? 150 : 60) : 0, cy + dy * k) + 'px'; wa.style.display = 'block'; // clear of the trip card
    wa.querySelector('.wa').style.transform = `rotate(${Math.atan2(dx, -dy)}rad)`;
    const d = Math.round(Math.hypot(deps.player.position.x - r.x, deps.player.position.z - r.z)); wa.querySelector('small').textContent = `${r.name || ''} ${d} m`;
  }

  let t = 0;
  function update(dt) { arrow(); t += dt; if (t < 0.25) return; t = 0; strip_(); nextCard(); }
  const isOpen = () => open || !!ncOpen;
  function escape() { if (ncOpen) { done(false); return true; } if (open) { close(); return true; } return false; }
  return { show, close, toggle, isOpen, escape, update, noteMoney, noteToast, unlocked, goTo, ledger, el: ov };
}
