// Shooki's guided tutorial (Tristan 2026-11-19): a click-through, one card at a time. Cousin Shooki talks from a Frutiger
// Aero card with his animated portrait; a glowing ring picks out the button or icon he means (the rest of the screen dims),
// or a bouncing arrow hangs over the thing in the street. A card either has Next (or Enter), or waits until Eddy does it.
// "Skip tutorial" drops the lot. Scripts follow the game: Chapter 0 (Dad, the junk, Kaasplaats, table, Naknik, the Russian)
// and then Shooki's tour of the spice trade (js/tutorial.js steps). state.guide = { done: { script: true }, off }.

import { cardBottom, touchWords } from './mobile.js';
export function createGuide(d) {
  const { state, beep } = d;
  const G = () => (state.guide && typeof state.guide === 'object' ? state.guide : (state.guide = { done: {}, off: false }));
  let card = null, ring = null, arrow = null, av = null, avG = null, face = null;
  let cur = null, steps = [], i = 0, shown = null, talkUntil = 0, confirm = false, visible = false;

  function build() {
    const css = document.createElement('style');
    css.textContent = `
#guide{position:fixed;z-index:36;left:16px;bottom:44px;display:none;gap:12px;align-items:flex-start;width:min(440px,calc(100vw - 32px));box-sizing:border-box;padding:13px 15px 12px;border-radius:18px;color:#07304f;font:400 15px/1.42 "Segoe UI",Tahoma,Rubik,Arial,sans-serif;
  background:linear-gradient(180deg,rgba(255,255,255,.96) 0%,rgba(236,248,255,.93) 42%,rgba(204,236,255,.92) 54%,rgba(226,246,255,.95) 100%);border:1px solid rgba(255,255,255,.95);-webkit-backdrop-filter:blur(14px) saturate(1.6);backdrop-filter:blur(14px) saturate(1.6);
  box-shadow:0 0 0 2px rgba(80,170,230,.6),0 12px 32px rgba(0,40,80,.45),inset 0 1px 0 #fff,inset 0 -10px 20px rgba(90,180,240,.18);transition:left .25s ease,top .25s ease}
#guide::before{content:"";position:absolute;left:8px;right:8px;top:3px;height:34%;border-radius:15px 15px 50% 50%/15px 15px 10px 10px;pointer-events:none;background:linear-gradient(180deg,rgba(255,255,255,.9),rgba(255,255,255,0))}
#guide>*{position:relative}
#guide canvas{flex:none;width:72px;height:72px;border-radius:50%;background:linear-gradient(180deg,#bfe8ff,#5ab4ea);box-shadow:0 0 0 2px #fff,0 0 0 3px rgba(40,120,180,.5),0 4px 10px rgba(0,40,80,.3)}
#guide .g-body{flex:1;min-width:0}
#guide .g-from{font-weight:700;color:#0a6ab0;font-size:12px;letter-spacing:.05em;text-transform:uppercase;text-shadow:0 1px 0 #fff}#guide .g-from span{color:#4a7a9a;font-weight:400}
#guide .g-text{margin:3px 0 0}#guide .g-text b{color:#b8501a}
#guide .g-btns{margin-top:10px;display:flex;gap:10px;align-items:center;flex-wrap:wrap}
#guide button{font:600 14px "Segoe UI",Tahoma,Arial,sans-serif;color:#07304f;border:1px solid #5e9cc6;border-radius:10px;padding:5px 14px;cursor:pointer;background:linear-gradient(180deg,#fff 0%,#eef8fd 48%,#cfe9f8 52%,#e6f5fc 100%);box-shadow:inset 0 1px 0 #fff,0 1px 3px rgba(0,40,80,.22)}
#guide button:hover,#guide button:focus-visible{background:linear-gradient(180deg,#e6fbff,#8fe0ff 45%,#2fb4f0 52%,#7fe4ff);box-shadow:inset 0 1px 0 #fff,0 0 10px rgba(80,210,255,.8)}
#guide button small{opacity:.6;font-weight:400}
#guide .g-wait{font:600 13px "Segoe UI",Tahoma,Arial,sans-serif;color:#1b7a2a;padding:4px 11px;border-radius:10px;background:linear-gradient(180deg,#f4fff0,#c9f2b8);border:1px solid #79c46a;animation:gPulse 1.4s ease-in-out infinite}
#guide .g-skip{margin-left:auto;background:none!important;border:none!important;box-shadow:none!important;padding:2px 0!important;font:400 12px "Segoe UI",Tahoma,Arial!important;color:#3a6a8a!important;text-decoration:underline}
#guide .g-confirm{display:none;margin-top:9px;padding-top:8px;border-top:1px solid rgba(80,150,200,.35);font-size:13px}#guide .g-confirm button{margin:6px 8px 0 0;font-size:13px;padding:4px 11px}
#guide.ask .g-confirm{display:block}#guide.ask .g-btns{display:none}
#guidering{position:fixed;z-index:35;display:none;pointer-events:none;border-radius:12px;box-shadow:0 0 0 3px #fff,0 0 0 6px #2fb4f0,0 0 22px 8px rgba(80,210,255,.85),0 0 0 9999px rgba(4,24,44,.42);animation:gRing 1.3s ease-in-out infinite;transition:left .18s,top .18s,width .18s,height .18s}
#guidering.nodim{box-shadow:0 0 0 3px #fff,0 0 0 6px #2fb4f0,0 0 22px 8px rgba(80,210,255,.85)}
#guidearrow{position:fixed;z-index:35;display:none;pointer-events:none;width:46px;height:58px;margin:-58px 0 0 -23px;transform-origin:23px 58px}
#guidearrow svg{display:block;animation:gBob .8s ease-in-out infinite alternate;filter:drop-shadow(0 4px 6px rgba(0,30,60,.45))}
@keyframes gRing{0%,100%{outline:0 solid transparent}50%{box-shadow:0 0 0 3px #fff,0 0 0 8px #6fdcff,0 0 30px 12px rgba(80,210,255,.95),0 0 0 9999px rgba(4,24,44,.42)}}
@keyframes gPulse{0%,100%{opacity:1}50%{opacity:.6}}
@keyframes gBob{from{transform:translateY(-10px)}to{transform:translateY(0)}}
@keyframes gIn{from{transform:translateY(14px) scale(.97);opacity:0}to{transform:none;opacity:1}}
@media (max-width:700px){#guide{font-size:13px;padding:10px 12px;gap:9px}#guide canvas{width:52px;height:52px}}`;
    document.head.appendChild(css);
    card = document.createElement('div'); card.id = 'guide';
    card.innerHTML = '<canvas width="144" height="144"></canvas><div class="g-body"><div class="g-from">Shooki <span></span></div><div class="g-text"></div>'
      + '<div class="g-btns"><button class="g-next">Next ▸ <small>Enter</small></button><span class="g-wait">Your move, bro</span><button class="g-skip">Skip tutorial</button></div>'
      + '<div class="g-confirm">Skip all of Shooki\'s lessons? The objective top left still tells you what\'s next, and the PC\'s Help menu has his tips.<br><button class="g-yes">Yes, skip</button><button class="g-no">Keep going</button></div></div>';
    ring = document.createElement('div'); ring.id = 'guidering';
    arrow = document.createElement('div'); arrow.id = 'guidearrow';
    arrow.innerHTML = '<svg width="46" height="58" viewBox="0 0 46 58"><defs><linearGradient id="gaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e6fbff"/><stop offset=".45" stop-color="#8fe0ff"/><stop offset=".55" stop-color="#2fb4f0"/><stop offset="1" stop-color="#0a6ab0"/></linearGradient></defs><path d="M14 2h18v26h12L23 56 2 28h12z" fill="url(#gaG)" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M17 5h6v20h-6z" fill="#fff" opacity=".55"/></svg>';
    document.body.append(ring, arrow, card);
    av = card.querySelector('canvas'); avG = av.getContext('2d');
    face = new Image(); face.src = './assets/face_shooki_sq.jpg';
    card.addEventListener('click', (e) => e.stopPropagation());
    card.addEventListener('pointerdown', (e) => e.stopPropagation());
    card.querySelector('.g-next').onclick = () => next();
    card.querySelector('.g-skip').onclick = () => { confirm = true; card.classList.add('ask'); };
    card.querySelector('.g-no').onclick = () => { confirm = false; card.classList.remove('ask'); };
    card.querySelector('.g-yes').onclick = () => skip();
    // Enter = Next (only on a card with a Next button, and not while somebody is talking)
    addEventListener('keydown', (e) => {
      if (!visible || confirm || e.repeat || e.code !== 'Enter' && e.code !== 'NumpadEnter') return;
      const st = steps[i]; if (!st || st.wait) return;
      e.preventDefault(); e.stopImmediatePropagation(); next();
    }, true);
    requestAnimationFrame(frame);
  }

  // ---- the script
  function next() {
    const st = steps[i]; if (st && st.end) st.end();
    i++; shown = null; if (beep) beep(880, 0.05, 'triangle', 0.035);
    if (i >= steps.length) finish();
  }
  function finish() { if (cur) G().done[cur] = true; const last = steps[steps.length - 1]; cur = null; steps = []; i = 0; hide(); if (d.save) d.save(); if (last && last.after) last.after(); }
  function skip() { const g = G(); g.off = true; confirm = false; card.classList.remove('ask'); cur = null; steps = []; hide(); if (d.onSkip) d.onSkip(); if (d.save) d.save(); }

  const hide = () => { visible = false; if (card) { card.style.display = 'none'; ring.style.display = 'none'; arrow.style.display = 'none'; } };
  const txt = (v) => touchWords(typeof v === 'function' ? v() : v); // touch screens name the touch buttons (js/mobile.js)
  function frame(now) {
    requestAnimationFrame(frame);
    if (G().off) { if (visible) hide(); return; }
    const s = d.current ? d.current() : null;
    if (!s || G().done[s.id]) { if (cur && (!s || s.id !== cur)) { G().done[cur] = true; cur = null; } if (visible) hide(); return; }
    if (s.id !== cur) { if (cur) G().done[cur] = true; cur = s.id; steps = s.steps; i = 0; shown = null; }
    // steps already done (or not for this moment) fall through
    let guard = 0;
    while (i < steps.length && guard++ < 20 && ((steps[i].skip && steps[i].skip()) || (steps[i].wait && steps[i].wait()))) { const st = steps[i]; if (st.end) st.end(); i++; shown = null; }
    if (i >= steps.length) { finish(); return; }
    if (d.hidden && d.hidden()) { if (visible) hide(); return; }
    let st = steps[i];
    if (st.pc && !(d.pcReady && d.pcReady())) st = d.pcHint || st; // a PC lesson, but the PC is closed: back to the desk first
    draw(st, now);
  }
  function draw(st, now) {
    if (!visible) { visible = true; card.style.display = 'flex'; card.style.animation = 'gIn .28s ease-out'; }
    const key = cur + ':' + i + (st === steps[i] ? '' : ':hint'), text = txt(st.say);
    if (shown !== key || card.dataset.t !== text) {
      if (shown !== key) { talkUntil = performance.now() + Math.min(5000, Math.max(1200, text.replace(/<[^>]+>/g, '').length * 45)); card.style.animation = 'none'; void card.offsetWidth; card.style.animation = 'gIn .28s ease-out'; if (beep && shown) { beep(1180, 0.04, 'square', 0.025); setTimeout(() => beep(1480, 0.05, 'square', 0.025), 80); } }
      shown = key; card.dataset.t = text;
      card.querySelector('.g-text').innerHTML = text;
      const [k, total] = d.count ? d.count(cur, i) : [i + 1, steps.length]; card.querySelector('.g-from span').textContent = `· ${d.label ? d.label(cur) + ' · ' : ''}${k}/${total}`;
      card.querySelector('.g-next').style.display = st.wait ? 'none' : '';
      card.querySelector('.g-wait').style.display = st.wait ? '' : 'none';
      card.querySelector('.g-wait').textContent = st.wait ? (txt(st.doing) || 'Your move, bro') : '';
    }
    portrait(now);
    // what Shooki points at: an element (ring), or a spot in the street (arrow)
    const el = st.at ? (typeof st.at === 'string' ? document.querySelector(st.at) : st.at()) : null;
    const r = el && el.getClientRects().length ? el.getBoundingClientRect() : null;
    if (r && r.width > 0 && r.height > 0) {
      const p = st.pad ?? 6;
      Object.assign(ring.style, { display: 'block', left: r.left - p + 'px', top: r.top - p + 'px', width: r.width + p * 2 + 'px', height: r.height + p * 2 + 'px' });
      ring.classList.toggle('nodim', !!st.wait || st.dim === false);
      arrow.style.display = 'none';
      place(r);
    } else {
      ring.style.display = 'none';
      const w = st.world ? st.world() : null, sp = w && d.project ? d.project(w) : null;
      if (sp) pointAt(sp); else arrow.style.display = 'none';
      place(null);
    }
  }
  // the card goes next to what it talks about, never on top of it
  function place(r) {
    const cw = card.offsetWidth, ch = card.offsetHeight, W = innerWidth, H = innerHeight, m = 14;
    let x = 16, y = H - ch - cardBottom(); // clear of the thumb controls on touch screens (js/mobile.js)
    if (r) {
      const opts = [[r.right + m, r.top], [r.left - cw - m, r.top], [r.left, r.bottom + m], [r.left, r.top - ch - m]];
      const fit = opts.find(([a, b]) => a >= 8 && b >= 8 && a + cw <= W - 8 && b + ch <= H - 8)
        || opts.map(([a, b]) => [Math.min(Math.max(8, a), W - cw - 8), Math.min(Math.max(8, b), H - ch - 8)]).find(([a, b]) => a + cw < r.left || a > r.right || b + ch < r.top || b > r.bottom);
      if (fit) [x, y] = fit;
    }
    x = Math.round(Math.min(Math.max(8, x), W - cw - 8)); y = Math.round(Math.min(Math.max(8, y), H - ch - 8));
    card.style.left = x + 'px'; card.style.top = y + 'px'; card.style.bottom = 'auto';
  }
  function pointAt(sp) {
    const W = innerWidth, H = innerHeight, m = 40;
    let { x, y } = sp, rot = 0;
    const on = !sp.behind && x > m && x < W - m && y > m + 50 && y < H - m;
    if (!on) { // off screen: the arrow sits on the edge and points the way
      const cx = W / 2, cy = H / 2; let dx = x - cx, dy = y - cy; if (sp.behind) { dx = -dx; dy = -dy; }
      const k = Math.min((W / 2 - m) / Math.abs(dx || 1e-3), (H / 2 - m) / Math.abs(dy || 1e-3));
      x = cx + dx * k; y = cy + dy * k; rot = Math.atan2(dy, dx) * 180 / Math.PI - 90;
      y += 29 * Math.cos(rot * Math.PI / 180); x -= 29 * Math.sin(rot * Math.PI / 180) * -1;
    } else y -= 34; // hang above the head
    Object.assign(arrow.style, { display: 'block', left: x + 'px', top: y + 'px', transform: `rotate(${on ? 0 : rot}deg)` });
  }
  // Shooki's portrait: one cartoon frame, alive (breathing bob, a tilt, and a jaw bounce while he talks)
  function portrait(now) {
    if (!face.complete || !face.naturalWidth) return;
    const t = now / 1000, talking = now < talkUntil, S = 144;
    const bob = Math.sin(t * 1.9) * 2 + (talking ? Math.abs(Math.sin(t * 9.5)) * 3 : 0), tilt = Math.sin(t * 1.1) * 0.02 + (talking ? Math.sin(t * 3.7) * 0.025 : 0);
    const sq = talking ? 1 + Math.abs(Math.sin(t * 9.5)) * 0.035 : 1 + Math.sin(t * 1.9) * 0.006;
    avG.save(); avG.clearRect(0, 0, S, S); avG.beginPath(); avG.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); avG.clip();
    avG.translate(S / 2, S * 0.92); avG.rotate(tilt); avG.scale(1.06, 1.06 * sq); avG.translate(-S / 2, -S * 0.92 + bob);
    avG.drawImage(face, 0, 0, S, S); avG.restore();
  }

  // ---- what main.js asks
  const on = () => !G().off;
  const showing = () => visible;
  function migrate(saved) { state.guide = saved && typeof saved === 'object' ? { done: { ...(saved.done || {}) }, off: !!saved.off } : { done: {}, off: false }; }
  function reset() { state.guide = { done: {}, off: false }; }
  build();
  return { on, showing, migrate, reset, skip, next, get script() { return cur; }, get step() { return i; } };
}

// ---------------------------------------------------------------- the lessons
// c: { state, tutorial, near(v, r), icon(label), tab(id), pcReady(), pos: { dad, desk, door, russian, oof, shooki, joop, junk() }, isInShop(), money() }
export function lessons(c) {
  const { state, tutorial: tut } = c;
  const W = () => 'W ' + c.money().toLocaleString('nl-NL');
  const left = () => c.junkLeft();
  const S = {
    'c0:talk': [
      { say: 'Bro! It\'s me, cousin <b>Shooki</b>. Your dad called me: "help the boy". So I help. One thing at a time. Click <b>Next</b>, or just do what I say.' },
      { at: '#objective', say: 'Top left is your <b>objective</b>. Lost? Look there, it always says what\'s next.' },
      { at: '#money', say: 'Your <b>Wilders</b>. Zero, bro. Dad left you a warehouse, not a bank account.' },
      { world: c.pos.dad, wait: () => c.near(c.pos.dad(), 2.6), doing: 'Walk to Dad', say: 'Walk with <b>WASD</b> (or the arrow keys), run with <b>Shift</b>. Go to your dad, the old man in the warehouse.' },
      { world: c.pos.dad, wait: () => state.step !== 'talk', doing: 'Press E', say: 'Press <b>E</b> to talk to him. <b>E</b> works on everything: people, machines, the PC, the van.' },
    ],
    'c0:list': [
      { world: () => c.pos.junk(), wait: () => state.listed.size > 0, doing: 'List a machine', say: 'All this shoarma junk was Dad\'s. Walk up to a machine and press <b>E</b> to list it on Kaasplaats, the second-hand market.' },
      { world: () => c.pos.junk(), wait: () => state.step !== 'list', doing: () => `${left()} to go`, say: () => `See the price tag? Listed. <b>${left()} more</b>. Your objective counts them for you.` },
    ],
    'c0:sell': [
      { world: c.pos.desk, wait: () => c.pcReady(), doing: 'Go to the PC', say: 'All listed. Now the <b>Kaasdows XL</b> PC at the back of the warehouse. Walk over and press <b>E</b> to log in.' },
      { pc: true, at: () => document.querySelector('#winbody td.bid'), say: 'These are the <b>bids</b>. Buyers offer what they want. Sometimes more than you asked, sometimes less. Today you take them all.' },
      { pc: true, at: () => document.querySelector('#winbody [data-sell]'), wait: () => state.step !== 'sell', doing: () => `Sell all (${state.sold.size}/6)`, say: 'Click <b>Sell</b>. All six, bro. Watch your Wilders go up.' },
    ],
    'c0:hire': [
      { pc: true, say: () => `${W()}. Look at you. Now we make money <i>work</i>: a mixing table and a Naknik to mix spice on it.` },
      { pc: true, at: () => c.icon('mixing table'), wait: () => state.table || c.tab('shop'), doing: 'Open it', say: 'First a <b>mixing table</b>. No table, no spice. Click <b>Buy mixing table</b> on the desktop.' },
      { pc: true, at: '#tableBtn', wait: () => state.table, doing: 'Buy the table', say: 'Steel table, bowls, sacks. W 600. Buy it.' },
      { pc: true, at: () => c.icon('Naknik'), wait: () => state.naknik > 0 || c.tab('hire'), doing: 'Open it', say: 'Now somebody to mix. Open the <b>Naknik Uitzendbureau</b>.' },
      { pc: true, at: '#hireBtn', wait: () => state.naknik > 0, doing: 'Hire one', say: 'Hire one. A <b>Naknik</b> mixes 10 kg of blend every night from the spice on your shelves. Not smart, but he mixes. More Naknikim come when you have a bigger name.' },
      { at: '#pcoff', wait: () => !state.inPC, doing: 'Log off', say: 'That\'s the PC for now. Log off with the red button bottom right, or press <b>Esc</b>.' },
      { world: c.pos.dad, wait: () => state.step === 'russian', doing: 'Talk to Dad', say: 'Your dad wants a last word before he goes. Talk to him.' },
    ],
    'c0:russian': [
      { world: c.pos.door, wait: () => c.isInShop() || state.metRussian, doing: 'Go to the pawn shop', say: '<b>The Russian</b>, Dad\'s old friend. His pawn shop is at the east end of the street, past the van. Walk in.' },
      { world: c.pos.russian, wait: () => state.metRussian, doing: 'Talk to him', say: 'That\'s him behind the counter. Press <b>E</b>. He talks a lot. Nod.' },
      { at: '#shop .shopbox', dim: false, wait: () => state.step === 'free', doing: 'Esc to leave', say: 'His shop. Guns only work on <b>missions</b>; in the street you have the stick. Buy something if you want, or keep your Wilders. <b>Esc</b> to leave.' },
    ],
    'tour:shooki': [
      { world: c.pos.shooki, wait: () => !tut.at('shooki'), doing: 'Talk to Shooki', say: 'Chapter 0 done, bro! Now the real trade. I\'m outside the warehouse, come talk to me. I brought you something.' },
    ],
    'tour:beurs': [
      { world: c.pos.desk, wait: () => c.pcReady(), doing: 'Go to the PC', say: 'My sack is on your shelves. Back to the PC, I show you the <b>Kruidenbeurs</b>: the spice market.' },
      { pc: true, at: () => c.icon('Kruidenbeurs'), wait: () => c.tab('beurs'), doing: 'Open it', say: 'There. The new icon with the % sign. Open the <b>Kruidenbeurs</b>.' },
      { pc: true, at: () => c.row('beurs'), say: 'Every spice in three grades. <b>Lampas</b> is cheap and smells of flour, <b>Standaard</b> is honest, <b>Bio</b> is five stars. The Noshgey only sell Bio to a <b>Kruidenhandelaar</b>, so that comes later.' },
      { pc: true, at: () => c.q('#winbody [data-exp="0"]', 1), say: 'Nothing arrives the same day, bro. Orders come <b>two days</b> later. Express is tomorrow, 25% extra. Order before the shelves run empty.' },
      { pc: true, at: () => c.q('#winbody [data-endday]', 1), say: 'Your <b>day</b>. One plan a day: a <b>raid</b> takes the whole day, or <b>work and deliveries</b> together. Then you sleep. Lying in bed all day? Once in three days, bro. The rest you hustle.' },
      { pc: true, at: () => c.stockCell(), say: 'Thirty kilo already in stock: my sack. Enough for three nights of Kip Shoarma. Buy nothing yet.', end: () => tut.next() },
    ],
    'tour:meng': [
      { pc: true, at: () => c.icon('Mengkamer'), wait: () => c.tab('meng'), doing: 'Open it', say: 'Now the <b>Mengkamer</b>: what your Naknik mixes tonight.' },
      { pc: true, at: () => c.cell('Mixing this'), say: '<b>Kip Shoarma</b>, Dad\'s classic. Already picked. Four paprika, three knoflook, three komijn for ten kilo. Every joint wants it.' },
      { pc: true, at: () => c.q('#winbody [data-pol]', 1), say: 'Quality is the average stars of what goes in. <b>Cheapest first</b> saves money, <b>best first</b> keeps picky clients happy.', end: () => tut.next() },
    ],
    'tour:raid': [
      { at: '#pcoff', wait: () => !state.inPC, doing: 'Log off', say: 'Enough reading. Time for work. Log off.' },
      { world: c.pos.oof, wait: () => state.inPC || !tut.at('raid'), doing: 'Get in the van', say: 'The <b>Oofmobiel</b> is out front. Get in (<b>E</b>). <b>Spekbuurt</b> is a Lampas joint around the corner. Three guys. Take it, and they buy your spice.' },
      { wait: () => !tut.at('raid'), doing: 'Take Spekbuurt', say: 'Pick <b>Spekbuurt</b> and drive. A raid takes the whole day: when you get back, the market day turns.' },
    ],
    'tour:rapport': [
      { world: c.pos.desk, wait: () => c.pcReady(), doing: 'Go to the PC', say: 'Spekbuurt is yours! Respect. A market day went by while you were out. To the PC: see who paid.' },
      { pc: true, at: () => c.icon('Dagrapport'), wait: () => c.tab('rapport'), doing: 'Open it', say: 'The <b>Dagrapport</b>. Open it.' },
      { pc: true, at: () => c.table('Delivered') || c.q('#winbody table.list', 0), say: 'Every client, every day. Schmatzel paid for your Kip Shoarma, and now Spekbuurt orders too. Miss an order and they trust you less.' },
      { pc: true, say: 'Watch the <b>heat</b> bars on this page. Angry gangs start price wars, lean on clients, and take joints back. Every Wilder clients pay makes your name: that\'s your <b>rank</b>.', end: () => tut.next() },
    ],
    'tour:jobs': [
      { pc: true, at: () => c.icon('Klusbord'), wait: () => c.tab('jobs'), doing: 'Open it', say: 'Last PC thing: the <b>Klusbord</b>.' },
      { pc: true, at: () => c.q('#winbody table.list, #winbody .well', 0), say: 'New jobs every market day: <b>spoed</b> orders pay extra for blend you have, <b>deals</b> are cheap spice, <b>stash</b> jobs pay for a raid. Jobs count as work: do one and you can sleep.', end: () => tut.next() },
    ],
    'tour:joop': [
      { at: '#pcoff', wait: () => !state.inPC, doing: 'Log off', say: 'That\'s the PC, bro. Log off.' },
      { world: c.pos.joop, wait: () => !tut.at('joop'), doing: 'Visit Ome Joop', say: 'One more. <b>Ome Joop</b> sits on the bench by the canal, south of the street. He ground spice for your dad for forty years. He explains rank. Then you\'re on your own, bro.' },
    ],
  };
  const NAMES = { c0: 'Chapter 0', tour: 'Spice trade' };
  function current() {
    const st = state.step; if (!st || st === 'title') return null;
    const id = st === 'talk' ? 'c0:talk' : st === 'list' ? 'c0:list' : st === 'sell' ? 'c0:sell' : st === 'hire' || st === 'dad2' ? 'c0:hire' : st === 'russian' ? 'c0:russian'
      : st === 'free' && tut.active() && tut.step() ? 'tour:' + tut.step().id : null;
    return id && S[id] ? { id, steps: S[id] } : null;
  }
  const pcHint = { world: c.pos.desk, wait: null, doing: 'Back to the PC', say: 'Back to the PC at the back, bro. Press <b>E</b> at the desk. I wait.' };
  pcHint.wait = () => false;
  // the step counter runs over the whole chapter, not one script
  const count = (id, i) => { const g = String(id).split(':')[0], ids = Object.keys(S).filter((k) => k.startsWith(g + ':')), at = ids.indexOf(id); return [ids.slice(0, at).reduce((a, k) => a + S[k].length, 0) + i + 1, ids.reduce((a, k) => a + S[k].length, 0)]; };
  return { current, pcHint, count, label: (id) => NAMES[String(id).split(':')[0]] || 'Tutorial' };
}
// tips the guide already covers: held back while it runs (they still show later, or from the Help menu)
export const GUIDE_TIPS = ['start', 'step:list', 'step:sell', 'step:hire', 'step:russian', 'step:free', 'tab:sell', 'tab:shop', 'tab:hire', 'tab:beurs', 'tab:meng', 'tab:rapport', 'tab:jobs', 'shop', 'day'];
