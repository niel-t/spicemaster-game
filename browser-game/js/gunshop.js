// PANDJESHUIS SPASIBO: The Russian's gun shop, laid out like Neon Vice's Nine of Nine's catalogue (gunshop.js there):
// sections down the left, one row per item, a card with stat bars, attachments, ammo, armour and selling back at 40%.
// Every regular piece is always on the shelf; each market day The Russian rolls three pieces: the regular ones are 20% off
// (DEAL) and an exclusive among them (Golden AK, Golden Deagles, Katana) is the one he can actually sell you that day.
// Spice Master colours and fonts. Keyboard: ↑ ↓ rows, ← → sections, Enter buy, Esc close. Mouse and touch: tap.
import { WD, CAL, MODS, ARMOUR, SHOP_PRICE, SHOP_SECS, EXCL, SELL_FRAC, DEAL_OFF, WDESC, gunStats, isGunId } from './arsenal.js';

const RU_HI = ['Everything is quality. Everything is cash.', 'No receipts, no questions, no refunds.', 'Your father bought his first knife here. He still owes me for the sharpening.', 'Dolphins are smartest animal. After me.', 'Is not a gun. Is a statement, written in lead.'];
const RU_BUY = ['Good choice. Very ballistic.', 'Da! Treat her well, she is temperamental.', 'You have taste. Dangerous taste.', 'Pleasure doing business. Mostly the pleasure is mine.'];
const RU_EXCL = 'Ah, the exclusive! This one I smuggle through three borders and past one very angry douane officer.';
const RU_POOR = 'My friend, this costs more Wilders than you have. I am sorry, but is simple arithmetic.';
const RU_SELL = ['Is good piece. I give you fair price. Fair for me.', 'Da, I find her a new home. A worse one, probably.', 'Forty percent. Is not robbery, is economics.'];
const CSS = `
#shop .gsBox{width:min(1080px,96vw);height:min(640px,92vh);margin:4vh auto 0;display:grid;grid-template-columns:190px 1fr 330px;grid-template-rows:auto 1fr auto;gap:0 14px;border:3px solid #e8a33d;border-radius:12px;background:rgba(30,20,12,.95);box-shadow:0 0 24px #e8a33d,inset 0 0 18px rgba(242,193,78,.25);padding:14px 16px;box-sizing:border-box}
#shop .gsHead{grid-column:1/4;display:flex;align-items:center;gap:14px;padding-bottom:10px;border-bottom:2px solid rgba(232,163,61,.4);margin-bottom:10px}
#shop .gsHead img{width:56px;height:80px;object-fit:cover;border:2px solid #a9c46a;border-radius:6px}
#shop .gsWal{margin-left:auto;font:900 20px "Bungee","Arial Black",Impact;color:#f2b84b;text-shadow:2px 2px 0 #000}
#shop .gsX{background:none;border:2px solid #e8a33d;color:#e8a33d;font:900 22px "Rubik",Arial;width:40px;height:40px;border-radius:8px;cursor:pointer;margin-left:14px}
#shop .gsTabs{display:flex;flex-direction:column;gap:6px;overflow:auto}
#shop .gsTabs button{text-align:left;background:rgba(0,0,0,.35);border:2px solid #5a3a1a;color:#cdb894;font:900 13px "Rubik",Arial;padding:9px 10px;border-radius:7px;cursor:pointer;letter-spacing:.5px}
#shop .gsTabs button.on{border-color:#e8a33d;color:#fff;background:#7a3a12;box-shadow:0 0 10px rgba(232,163,61,.5)}
#shop .gsList{overflow:auto;padding-right:6px}
#shop .gsH{font:900 12px "Bungee","Arial Black";color:#a9c46a;letter-spacing:1px;margin:12px 0 4px;text-shadow:0 0 6px rgba(169,196,106,.6)}
#shop .gsH:first-child{margin-top:0}
#shop .gsR{display:flex;width:100%;align-items:center;gap:10px;background:none;border:0;border-bottom:1px solid rgba(232,163,61,.2);color:#fff;font:700 15px "Rubik",Arial;padding:8px 8px;cursor:pointer;text-align:left;border-radius:5px}
#shop .gsR:hover{background:rgba(232,163,61,.12)}
#shop .gsR.sel{background:#e8a33d;color:#1c1209}
#shop .gsR.sel .gsP{color:#1c1209}
#shop .gsR.lock{opacity:.45}
#shop .gsR .gsN{flex:1}
#shop .gsP{font:900 14px "Bungee","Arial Black";color:#f2b84b;white-space:nowrap}
#shop .gsTag{font:900 10px "Rubik",Arial;background:#c2412d;color:#fff;padding:2px 5px;border-radius:4px;margin-left:6px;vertical-align:2px}
#shop .gsTag.ex{background:#d8a820;color:#1c1209}
#shop .gsCard{overflow:auto;background:rgba(0,0,0,.3);border:2px solid #5a3a1a;border-radius:9px;padding:14px}
#shop .gsDT{font:900 22px "Bungee","Arial Black",Impact;color:#e8a33d;text-shadow:0 0 8px rgba(232,163,61,.6);line-height:1.1}
#shop .gsDS{font:700 11px "Rubik",Arial;color:#a9c46a;letter-spacing:.5px;margin:6px 0 10px;text-transform:uppercase}
#shop .gsQ{color:#cdb894;font-style:italic;font-size:14px;margin-bottom:12px}
#shop .gsBar{display:grid;grid-template-columns:96px 1fr;align-items:center;gap:8px;font:700 10px "Rubik",Arial;color:#cdb894;margin:5px 0}
#shop .gsBar i{position:relative;height:9px;background:#2a1a0e;border-radius:3px;overflow:hidden;display:block}
#shop .gsBar b{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#c2412d,#e8a33d,#ffd36b)}
#shop .gsBar u{position:absolute;top:-2px;bottom:-2px;width:2px;background:#fff}
#shop .gsCmp{font:700 10px "Rubik";color:#888;margin-top:2px}
#shop .gsXtra{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
#shop .gsXtra button{background:rgba(0,0,0,.4);border:2px solid #7a5a2a;color:#e9d8b8;font:700 11px "Rubik";padding:6px 8px;border-radius:6px;cursor:pointer}
#shop .gsXtra button.on{border-color:#a9c46a;color:#a9c46a}
#shop .gsAct{margin-top:14px;display:flex;gap:8px}
#shop .gsAct button{flex:1;background:#e8a33d;color:#fff;border:0;border-radius:7px;font:900 15px "Rubik",Arial;padding:11px 10px;cursor:pointer}
#shop .gsAct button.arm{background:#c2412d}
#shop .gsAct button:disabled{background:#444;color:#999;cursor:default}
#shop .gsAct s{opacity:.6;margin-left:6px}
#shop .gsFoot{grid-column:1/4;display:flex;justify-content:space-between;gap:12px;margin-top:10px;padding-top:8px;border-top:2px solid rgba(232,163,61,.4)}
#shop #shopsay{margin:0;color:#ffd36b;font-style:italic;min-height:20px;flex:1}
#shop .gsLoad{color:#cdb894;font:700 12px "Rubik";text-align:right}
@media (max-width:820px){#shop .gsBox{grid-template-columns:1fr;grid-template-rows:auto auto 1fr auto auto;height:96vh;margin-top:2vh}#shop .gsTabs{flex-direction:row;flex-wrap:wrap}#shop .gsTabs button{padding:6px 8px;font-size:11px}#shop .gsCard{max-height:36vh}#shop .gsHead,#shop .gsFoot{grid-column:1}}`;

export function createGunShop({ mission, state, $, addMoney, beep, save, kitText, onClose }) {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const box = $('shop');
  box.innerHTML = `<div class="gsBox"><div class="gsHead"><img src="./assets/face_ru.jpg" alt=""><div><div class="shopname">PANDJESHUIS SPASIBO</div><div class="shopsub">The Russian · cash only · no receipts</div></div><div class="gsWal" id="gsWal"></div><button class="gsX" id="shopclose">×</button></div>
    <div class="gsTabs" id="gsTabs"></div><div class="gsList" id="gsList"></div><div class="gsCard" id="gsCard"></div>
    <div class="gsFoot"><div id="shopsay"></div><div class="gsLoad" id="gsLoad"></div></div></div>`;
  let rows = [], sel = 1, sellArm = null;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const say = (t) => { $('shopsay').textContent = '"' + t + '" · The Russian'; };
  const L = () => state.loadout;
  const sfx = (k) => (k === 'buy' ? [523, 659, 784].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'triangle', 0.05), i * 80)) : beep(k === 'no' ? 160 : 700, 0.04, 'square', 0.03));
  // today's stock (Neon Vice rollStock), seeded by the market day so it changes after every outing
  function stock() {
    const day = (state.econ && state.econ.day) | 0;
    if (state.ruStock && state.ruStock.day === day) return state.ruStock.list;
    let a = day * 7919 + 13; const r = () => { a = (a * 16807) % 2147483647; return a / 2147483647; };
    const pool = Object.keys(SHOP_PRICE).filter((k) => !EXCL.includes(k)).sort(() => r() - 0.5), list = pool.slice(0, 3);
    if (r() < 0.4 && state.owned && Object.keys(state.owned).length >= 3) list[Math.floor(r() * 3)] = EXCL[Math.floor(r() * EXCL.length)];
    state.ruStock = { day, list }; return list;
  }
  const avail = (t) => !WD[t].excl || stock().includes(t);
  const deal = (t) => !WD[t].excl && stock().includes(t);
  const price = (t) => (deal(t) ? Math.round(SHOP_PRICE[t] * (1 - DEAL_OFF) / 10) * 10 : SHOP_PRICE[t]);
  const owns = (t) => mission.owns(t);
  const upgPrice = (c) => CAL[c].price * 3 * (1 + (state.upg[c] | 0));
  const sellPrice = (it) => { const base = Math.round((SHOP_PRICE[it.id] || (ARMOUR[it.id] && ARMOUR[it.id].price) || 0) * SELL_FRAC); return ARMOUR[it.id] && it.plates < ARMOUR[it.id].plates ? Math.round(base / 2) : base; };
  function build() {
    const R = [], ar = mission.armour();
    for (const s of SHOP_SECS) {
      const it = [];
      if (s.w) for (const t of s.w) it.push({ k: 'w', t });
      else if (s.id === 'mods') for (const m in MODS) it.push({ k: 'mod', m });
      else if (s.id === 'gear') {
        const cs = mission.ownCals(); if (!cs.length) it.push({ k: 'ammo', c: null }); for (const c of cs) it.push({ k: 'ammo', c });
        it.push({ k: 'vest' }); if (ar.type !== 'carrier') it.push({ k: 'carrier' });
        for (const c of cs) it.push({ k: 'stash', c }); if (L().guns[0] && L().guns[1]) it.push({ k: 'swap' });
      } else { for (const o of mission.sellables()) it.push({ k: 'sell', o }); if (!it.length) it.push({ k: 'none' }); }
      R.push({ h: 1, sec: s.id, name: s.name }); for (const q of it) { q.sec = s.id; R.push(q); }
    }
    return R;
  }
  const keyOf = (q) => q.k + ':' + (q.t || q.m || q.c || (q.o && q.o.key) || '');
  function label(q) {
    const ar = mission.armour();
    if (q.k === 'w') { const own = owns(q.t); return { n: WD[q.t].name, p: own ? 'OWNED' : !avail(q.t) ? 'NEXT SHIPMENT' : fmt(price(q.t)), tag: WD[q.t].excl ? (avail(q.t) ? 'EXCLUSIVE' : '') : deal(q.t) ? '-' + Math.round(DEAL_OFF * 100) + '%' : '' }; }
    if (q.k === 'mod') return { n: MODS[q.m].name, p: mission.hasMod(q.m) ? 'FITTED' : fmt(MODS[q.m].price) };
    if (q.k === 'ammo') return q.c ? { n: 'AMMO · ' + CAL[q.c].name, p: `${state.pool[q.c] | 0}/${mission.capOf(q.c)} · ${fmt(CAL[q.c].price)}` } : { n: 'AMMO', p: 'NEEDS A GUN' };
    if (q.k === 'stash') return { n: 'BIGGER ' + CAL[q.c].name + ' STASH', p: fmt(upgPrice(q.c)) };
    if (q.k === 'vest') { const A = ar.type && ARMOUR[ar.type]; return { n: A ? 'REPAIR ' + A.name : 'KEVLAR VEST', p: A && ar.plates >= A.plates ? 'READY' : fmt(A ? A.repair : ARMOUR.vest.price) }; }
    if (q.k === 'carrier') { const A = ar.type && ARMOUR[ar.type]; return { n: (A ? 'TRADE UP: ' : '') + ARMOUR.carrier.name, p: fmt(ARMOUR.carrier.price - (A ? sellPrice({ id: ar.type, plates: ar.plates }) : 0)) }; }
    if (q.k === 'swap') return { n: 'SWAP GUN SLOTS', p: 'FREE' };
    if (q.k === 'sell') return { n: WD[q.o.id] ? WD[q.o.id].name : ARMOUR[q.o.id].name, p: '+' + fmt(sellPrice(q.o)) + (q.o.where === 'kluis' ? ' · KLUIS' : '') };
    return { n: 'NOTHING TO SELL', p: '' };
  }
  function render(keep) {
    const prev = rows[sel] && keyOf(rows[sel]); rows = build();
    let i = prev ? rows.findIndex((q) => !q.h && keyOf(q) === prev) : -1; if (i < 0) i = Math.min(sel, rows.length - 1);
    while (rows[i] && rows[i].h) i++; if (!rows[i]) i = 1; sel = i;
    $('gsWal').textContent = fmt(state.money);
    $('gsTabs').innerHTML = SHOP_SECS.map((s) => `<button data-tab="${s.id}">${s.name}</button>`).join('');
    $('gsList').innerHTML = rows.map((q, j) => { if (q.h) return `<div class="gsH">${q.name}</div>`; const l = label(q), lock = q.k === 'w' && !avail(q.t);
      return `<button class="gsR${lock ? ' lock' : ''}" data-i="${j}"><span class="gsN">${l.n}${l.tag ? ` <b class="gsTag${l.tag === 'EXCLUSIVE' ? ' ex' : ''}">${l.tag}</b>` : ''}</span><span class="gsP">${l.p}</span></button>`; }).join('');
    const ar = mission.armour(), g = L().guns;
    $('gsLoad').innerHTML = `KIT: ${L().melee ? WD[L().melee].name + ' · ' : ''}${g.map((x) => (x ? WD[x.id].name : '—')).join(' · ')}${ar.type ? ' · ' + ARMOUR[ar.type].name + ' ' + ar.plates + '/' + ARMOUR[ar.type].plates : ''} · KLUIS ${state.stash.length}/${mission.STASH_CAP}`;
    select(sel, keep);
  }
  function bars(t) {
    const cur = L().guns.find((x) => x && x.id !== t), cs = cur && !WD[t].melee ? gunStats(cur.id) : null;
    return gunStats(t).map(([n, v], i) => { const c = cs && cs[i] && cs[i][0] === n ? cs[i][1] : null; return `<div class="gsBar"><span>${n}</span><i><b style="width:${Math.round(v * 100)}%"></b>${c !== null ? `<u style="left:${Math.round(c * 100)}%"></u>` : ''}</i></div>`; }).join('') + (cs ? `<div class="gsCmp">| = YOUR ${WD[cur.id].name}</div>` : '');
  }
  const btn = (txt, act, dis, arm) => `<div class="gsAct"><button data-act="${act}"${dis ? ' disabled' : ''}${arm ? ' class="arm"' : ''}>${txt}</button></div>`;
  function card(q) {
    if (q.k === 'w') {
      const t = q.t, w = WD[t], sec = SHOP_SECS.find((s) => s.id === q.sec), own = owns(t), av = avail(t);
      const sub = (w.excl ? 'RUSSIAN EXCLUSIVE · ' : '') + (w.toss ? 'THROWN' : sec.kind) + (w.cal ? ' · ' + CAL[w.cal].name : '') + (w.melee ? ' · ONE-HIT KILL' : ' · MAG ' + w.mag) + (w.burst ? ' · FULL AUTO' : w.burst3 ? ' · 3-ROUND BURST' : '') + (w.pierce > 1 ? ' · PIERCES ' + w.pierce : '') + (w.pen ? ' · THROUGH WALLS' : '');
      const mods = Object.keys(MODS).filter((m) => !w.melee && !w.toss && (MODS[m].gun === t || !MODS[m].gun)).map((m) => `<button data-x="mod" data-c="${m}"${mission.hasMod(m) ? ' class="on"' : ''}>${MODS[m].name}${mission.hasMod(m) ? ' · FITTED' : ' ' + fmt(MODS[m].price)}</button>`).join('');
      const ammo = w.cal && mission.ownCals().includes(w.cal) ? `<button data-x="ammo" data-c="${w.cal}">AMMO +${CAL[w.cal].box} ${fmt(CAL[w.cal].price)} (${state.pool[w.cal] | 0}/${mission.capOf(w.cal)})</button>` : '';
      return `<div class="gsDT">${w.name}</div><div class="gsDS">${sub}</div><div class="gsQ">"${WDESC[t] || ''}"</div>${bars(t)}${mods || ammo ? `<div class="gsXtra">${mods}${ammo}</div>` : ''}`
        + btn(own ? 'OWNED' : !av ? 'NEXT SHIPMENT' : `BUY ${fmt(price(t))}${deal(t) ? `<s>${fmt(SHOP_PRICE[t])}</s>` : ''}`, 'buy', own || !av);
    }
    if (q.k === 'mod') { const M = MODS[q.m]; return `<div class="gsDT">${M.name}</div><div class="gsDS">ATTACHMENT · ${M.gun ? 'FITS THE ' + WD[M.gun].name : 'FITS EVERY GUN'} · BOUGHT ONCE, ALWAYS FITTED</div><div class="gsQ">${M.info}</div>` + btn(mission.hasMod(q.m) ? 'FITTED' : 'BUY ' + fmt(M.price), 'x:mod:' + q.m, mission.hasMod(q.m)); }
    if (q.k === 'ammo') { if (!q.c) return `<div class="gsDT">AMMO</div><div class="gsQ">Bullets need a gun, my friend. Buy one first.</div>`; const C = CAL[q.c]; return `<div class="gsDT">${C.name} AMMO</div><div class="gsDS">+${C.box} ROUNDS A BOX · YOU CARRY ${state.pool[q.c] | 0}/${mission.capOf(q.c)}</div><div class="gsQ">Fresh rounds. Still warm from the factory. Which factory, I do not say.</div>` + btn('BUY ' + fmt(C.price), 'x:ammo:' + q.c); }
    if (q.k === 'stash') { const C = CAL[q.c]; return `<div class="gsDT">BIGGER ${C.name} STASH</div><div class="gsDS">CARRY +${C.up} MORE ${C.name} · NOW ${mission.capOf(q.c)}</div><div class="gsQ">More pouches. You rattle with confidence.</div>` + btn('BUY ' + fmt(upgPrice(q.c)), 'x:upg:' + q.c); }
    if (q.k === 'vest' || q.k === 'carrier') { const A = ARMOUR[q.k === 'vest' ? 'vest' : 'carrier'], l = label(q); return `<div class="gsDT">${l.n}</div><div class="gsDS">ARMOUR · ${A.plates} PLATE${A.plates > 1 ? 'S' : ''}${A.spd ? ' · A LITTLE SLOWER' : ''}</div><div class="gsQ">${q.k === 'vest' ? 'Kevlar. It stops one bullet. After that, it is just a nice shirt.' : 'Ceramic plates, front and back. Two bullets you never feel.'}</div>` + btn(l.p === 'READY' ? 'READY' : (q.k === 'vest' ? 'BUY ' : 'TRADE UP ') + l.p, 'x:' + q.k, l.p === 'READY'); }
    if (q.k === 'swap') return `<div class="gsDT">SWAP GUN SLOTS</div><div class="gsQ">Your other gun goes in slot 2.</div>` + btn('SWAP', 'x:swap');
    if (q.k === 'sell') { const l = label(q); return `<div class="gsDT">SELL ${l.n}</div><div class="gsDS">${q.o.where === 'kluis' ? 'FROM DE KLUIS' : 'FROM YOUR KIT'} · ${Math.round(SELL_FRAC * 100)}% OF ITS PRICE</div><div class="gsQ">Is good piece. I give you fair price. Fair for me.</div>` + btn((sellArm === q.o.key ? 'SURE? SELL FOR +' : 'SELL FOR +') + fmt(sellPrice(q.o)), 'sell:' + q.o.key, false, sellArm === q.o.key); }
    return `<div class="gsDT">NOTHING TO SELL</div><div class="gsQ">Empty pockets, my friend. Is very relaxing.</div>`;
  }
  function select(i, keep) {
    const q = rows[i]; if (!q || q.h) return; if (i !== sel) sellArm = null; sel = i;
    for (const b of $('gsList').querySelectorAll('.gsR')) b.classList.toggle('sel', +b.dataset.i === i);
    for (const b of $('gsTabs').querySelectorAll('button')) b.classList.toggle('on', b.dataset.tab === q.sec);
    $('gsCard').innerHTML = card(q);
    const r = $('gsList').querySelector('.gsR.sel'); if (r && !keep) r.scrollIntoView({ block: 'nearest' });
  }
  const pay = (n, el) => { if (state.money < n) { sfx('no'); say(RU_POOR); return false; } addMoney(-n, el); return true; };
  const done = (t) => { sfx('buy'); save(); kitText(); render(true); if (t) say(t); };
  function buy(t, el) {
    if (owns(t) || !avail(t)) return;
    if (!mission.canBuy(t)) { sfx('no'); say('Your hands are full and your kluis is full. Sell something. Or carry less.'); return; }
    if (!pay(price(t), el)) return;
    const where = mission.receive(t); if (!state.kit.includes(t)) state.kit.push(t);
    done(where === 'kluis' ? 'Your hands are full, so my boy drives her to your warehouse. She waits in the kluis.' : WD[t].excl ? RU_EXCL : pick(RU_BUY));
  }
  function extra(k, c, el) {
    const ar = mission.armour();
    if (k === 'mod') { if (mission.hasMod(c) || !pay(MODS[c].price, el)) return; mission.setMod(c); return done(MODS[c].say); }
    if (k === 'ammo') { if ((state.pool[c] | 0) >= mission.capOf(c)) { say('Your bag is full. More is not ammunition, is a hobby.'); return; } if (!pay(CAL[c].price, el)) return; state.pool[c] = Math.min(mission.capOf(c), (state.pool[c] | 0) + CAL[c].box); return done('Fresh rounds. Still warm from the factory.'); }
    if (k === 'upg') { if (!pay(upgPrice(c), el)) return; state.upg[c] = (state.upg[c] | 0) + 1; return done('More pouches. Now you rattle with confidence.'); }
    if (k === 'vest') {
      if (ar.type) { const A = ARMOUR[ar.type]; if (ar.plates >= A.plates || !pay(A.repair, el)) return; mission.setArmour(ar.type, A.plates); return done('Good as new. Almost. The hole is a feature.'); }
      if (!pay(ARMOUR.vest.price, el)) return; mission.setArmour('vest', 1); if (!state.kit.includes('vest')) state.kit.push('vest'); return done('Kevlar. Stops one bullet. Maybe two. Do not test.');
    }
    if (k === 'carrier') { const cost = ARMOUR.carrier.price - (ar.type ? sellPrice({ id: ar.type, plates: ar.plates }) : 0); if (!pay(cost, el)) return; mission.setArmour('carrier', 2); return done('Ceramic plates. You walk a little slower, you live a little longer.'); }
    if (k === 'swap') { mission.swapGuns(); return done(); }
  }
  function sell(key, el) {
    if (sellArm !== key) { sellArm = key; sfx('blip'); select(sel, true); return; }
    const o = mission.sellables().find((x) => x.key === key); if (!o) return; const v = sellPrice(o);
    const id = mission.sellKey(key); sellArm = null; if (!id) return render(true);
    addMoney(v, el); const i = state.kit.indexOf(id); if (i >= 0 && !mission.owns(id)) state.kit.splice(i, 1);
    done(pick(RU_SELL));
  }
  function act(a, el) {
    const q = rows[sel]; if (!q) return;
    if (a === 'buy') buy(q.t, el); else if (a.startsWith('x:')) { const [, k, c] = a.split(':'); extra(k, c, el); } else if (a.startsWith('sell:')) sell(a.slice(5), el);
  }
  const move = (d) => { let i = sel; for (let n = 0; n < rows.length; n++) { i = (i + d + rows.length) % rows.length; if (!rows[i].h) break; } sfx('blip'); select(i); };
  const jump = (d) => { const cur = SHOP_SECS.findIndex((s) => s.id === rows[sel].sec), n = SHOP_SECS.length; for (let k = 1; k <= n; k++) { const id = SHOP_SECS[(cur + d * k + n * 4) % n].id, i = rows.findIndex((q) => !q.h && q.sec === id); if (i >= 0) { sfx('blip'); select(i); return; } } };
  box.addEventListener('click', (e) => {
    const t = e.target.closest('[data-tab]'); if (t) { const i = rows.findIndex((q) => !q.h && q.sec === t.dataset.tab); if (i >= 0) { sfx('blip'); select(i); } return; }
    const r = e.target.closest('.gsR'); if (r) { sfx('blip'); select(+r.dataset.i, true); return; }
    const x = e.target.closest('[data-x]'); if (x) { extra(x.dataset.x, x.dataset.c, x); return; }
    const b = e.target.closest('[data-act]'); if (b && !b.disabled) act(b.dataset.act, b);
  });
  addEventListener('keydown', (e) => {
    if (box.style.display !== 'block') return;
    const k = e.code, stop = () => { e.preventDefault(); e.stopImmediatePropagation(); };
    if (k === 'ArrowDown' || k === 'KeyS') { stop(); move(1); } else if (k === 'ArrowUp' || k === 'KeyW') { stop(); move(-1); }
    else if (k === 'ArrowRight' || k === 'KeyD') { stop(); jump(1); } else if (k === 'ArrowLeft' || k === 'KeyA') { stop(); jump(-1); }
    else if (k === 'Enter' || k === 'Space') { stop(); const b = $('gsCard').querySelector('[data-act]'); if (b && !b.disabled) b.click(); }
    else if (k === 'Escape') { stop(); close(); }
  }, true);
  function open() { box.style.display = 'block'; state.inPC = true; sellArm = null; render(); say(pick(RU_HI)); beep(660, 0.06, 'triangle'); }
  function close() { if (box.style.display !== 'block') return; box.style.display = 'none'; state.inPC = false; onClose && onClose(); }
  $('shopclose').onclick = close;
  return { open, close, render, isOpen: () => box.style.display === 'block', stock };
}
