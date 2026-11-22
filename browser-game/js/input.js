// Spice Master Eddy: controller (Gamepad API, standard mapping, Xbox labels) and touch (phones / tablets) input.
// Modelled on Neon Vice's input: both devices are translated into the same key events the keyboard sends,
// so every screen (story, PC, shop, kluis, missions) keeps one input path. Analog movement and twin-stick aim
// go through `virt`, which main.js and mission.js read every frame.
//
// Controller: left stick move · right stick aim (missions) · RT attack · A interact / grab / confirm · B back
//             X or LT reload · Y switch weapon · LB / L3 sprint · RB map · D-pad menus (or weapon slots) · Start pause · Back restart
// Touch:      left thumb move · right thumb aim (missions; push past the ring to fire) · ACTIE · SLAAN · RELOAD · WISSEL
//             GRANAAT (hold, let go to throw) · ▸ grenade type · PLAAT (spare plate) · NACHTZICHT
//             SPRINT (toggle) · KAART · INV · OPNIEUW · II (pause)

export const virt = { mx: 0, mz: 0, aim: null }; // analog movement (-1..1, screen relative) and aim angle (rotation.y) or null
let mode = 'mouse'; // last device used: 'mouse' (keyboard + mouse), 'pad' or 'touch'
import { GFX_LABEL } from './post.js';
let paused = false, ctx = null, pausedAt = 0;
const listeners = [];
export const inputMode = () => mode;
export const isPaused = () => paused;
export function onInputMode(fn) { listeners.push(fn); }
function setMode(m) { if (m === mode) return; mode = m; releaseAll(); document.body.classList.toggle('touch', m === 'touch'); document.body.classList.toggle('pad', m === 'pad'); for (const fn of listeners) fn(m); }

// ------------------------------------------------------------------ button glyphs per device
const GLYPH = {
  pad: { E: 'A', F: 'RT', R: 'X', Tab: 'Y', Esc: 'B', Backspace: 'BACK', M: 'RB', I: 'START', Shift: 'LB', Enter: 'A', N: 'Y', J: 'A', '1': '◀', '2': '▲', '3': '▶', skip: 'A' },
  touch: { G: 'GRANAAT', Q: '▸', H: 'PLAAT', B: 'TIK', T: 'SHMOKIA', V: 'NACHTZICHT', E: 'ACTIE', F: 'SLAAN', R: 'RELOAD', Tab: 'WISSEL', Esc: '✕', Backspace: 'OPNIEUW', M: 'KAART', I: 'INV', Shift: 'SPRINT', Enter: 'TIK', N: 'TIK', J: 'TIK', skip: 'TIK' },
  mouse: { Esc: 'ESC', Enter: 'ENTER', skip: 'E / SPACE / CLICK' },
};
export function glyph(k) { return (GLYPH[mode] && GLYPH[mode][k]) || GLYPH.mouse[k] || k; }
export function controlsLine() {
  if (mode === 'pad') return 'Left stick move · Right stick aim · RT attack · A grab / throw · X reload · Y switch · LB sprint · Back restart';
  if (mode === 'touch') return 'Left thumb move · Right thumb aim, push past the ring to fire · ACTIE grab / throw · RELOAD · WISSEL · OPNIEUW';
  return 'Mouse aim · click / F attack · E grab / throw · 1 · 2 · 3 / wheel weapons · R reload · Shift sprint · I inventory · Backspace restart';
}

// ------------------------------------------------------------------ synthetic keys (the same events the keyboard sends)
function press(code) { const o = { code, key: code, bubbles: true, cancelable: true }; window.dispatchEvent(new KeyboardEvent('keydown', o)); window.dispatchEvent(new KeyboardEvent('keyup', o)); }
const held = new Set();
function hold(code, on) {
  if (on === held.has(code)) return;
  if (on) held.add(code); else held.delete(code);
  window.dispatchEvent(new KeyboardEvent(on ? 'keydown' : 'keyup', { code, key: code, bubbles: true, cancelable: true }));
}
function releaseAll() {
  for (const c of [...held]) hold(c, false);
  virt.mx = virt.mz = 0; virt.aim = null; sprintOn = false; fireHeld = false;
  for (const s of sticks) s.reset && s.reset();
  updateTouchButtons && updateTouchButtons();
}

// ------------------------------------------------------------------ overlays (menus the D-pad navigates, the touch UI hides behind)
const $ = (id) => document.getElementById(id);
const shown = (el) => el && el.style.display !== 'none' && getComputedStyle(el).display !== 'none';
function overlay() {
  if (paused) return pauseEl;
  if (!ctx) return null;
  const st = ctx.state;
  if (st.step === 'title' && shown($('title'))) return $('title');
  for (const id of ['nvInv', 'shop', 'pc', 'shmokia']) if (shown($(id))) return $(id);
  const dl = $('dialogue'); if (shown(dl) && dl.querySelector('button')) return dl; // a choice box
  return null;
}
let focusEl = null, lastRect = null, lastRoot = null;
const focusables = (root) => [...root.querySelectorAll('button, [data-pin], .icon, [data-t]')].filter((el) => !el.disabled && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden');
function setFocus(el) {
  if (focusEl) focusEl.classList.remove('sme-focus');
  focusEl = el;
  if (el) { el.classList.add('sme-focus'); lastRect = el.getBoundingClientRect(); try { el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* old browsers */ } }
}
function ensureFocus(root) {
  if (!root || mode !== 'pad' || root === $('title')) { if (focusEl) setFocus(null); lastRoot = null; return; } // the start menu has its own highlight
  if (root !== lastRoot || (root === pauseEl && focusEl && !root.contains(focusEl))) { lastRoot = root; lastRect = null; if (focusEl && !root.contains(focusEl)) setFocus(null); } // a menu just opened: start on its default
  const list = focusables(root);
  if (focusEl && list.includes(focusEl)) return;
  if (!list.length) { setFocus(null); return; }
  if (lastRect && root.contains(document.elementFromPoint(lastRect.x + lastRect.width / 2, lastRect.y + lastRect.height / 2))) { // the menu re-rendered: stay where you were
    const cx = lastRect.x + lastRect.width / 2, cy = lastRect.y + lastRect.height / 2;
    let best = null, bd = 1e9; for (const el of list) { const r = el.getBoundingClientRect(), d = Math.hypot(r.x + r.width / 2 - cx, r.y + r.height / 2 - cy); if (d < bd) { bd = d; best = el; } }
    setFocus(best); return;
  }
  const skip = (el) => ['pcclose', 'shopclose'].includes(el.id) || el.classList.contains('start');
  setFocus(list.find((el) => el.dataset.t === 'cont' || el.dataset.t === 'no' || el.dataset.p === 'resume' || el.dataset.p === 'back') || list.find((el) => !skip(el)) || list[0]);
}
function nav(dx, dy) {
  const root = overlay(); if (!root) return; const list = focusables(root); if (!list.length) return;
  if (!focusEl || !list.includes(focusEl)) { ensureFocus(root); return; }
  const r = focusEl.getBoundingClientRect(), cx = r.x + r.width / 2, cy = r.y + r.height / 2;
  let best = null, bs = 1e9;
  for (const el of list) {
    if (el === focusEl) continue;
    const q = el.getBoundingClientRect(), ex = q.x + q.width / 2 - cx, ey = q.y + q.height / 2 - cy;
    const along = ex * dx + ey * dy, across = Math.abs(ex * dy - ey * dx);
    if (along <= 2) continue;
    const s = along + across * 2.2; if (s < bs) { bs = s; best = el; }
  }
  if (best) { setFocus(best); beepNav(); }
}
function beepNav() { if (ctx && ctx.beep) ctx.beep(700, 0.03, 'square', 0.02); }

// ------------------------------------------------------------------ pause menu (Start / P / II)
const pauseEl = document.createElement('div'); pauseEl.id = 'smePause';
// full screen (phones lose a lot to the browser bars); iPhone Safari has no page full screen, so the button just isn't there
const fsOK = () => !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
const isFs = () => !!(document.fullscreenElement || document.webkitFullscreenElement);
function toggleFs() {
  const d = document, el = d.documentElement;
  try { if (isFs()) (d.exitFullscreen || d.webkitExitFullscreen).call(d); else { const p = (el.requestFullscreen || el.webkitRequestFullscreen).call(el, { navigationUI: 'hide' }); if (p && p.catch) p.catch(() => {}); } } catch (e) { /* not allowed here */ }
}
function pauseHTML(help) {
  const m = ctx && ctx.getMission(), inM = m && m.active, canRestart = inM && (m.canRestart ? m.canRestart() : !ctx.state.spekbuurt);
  const b = (k, t, dis) => `<button data-p="${k}" ${dis ? 'disabled' : ''}>${t}</button>`;
  return `<div class="pbox"><div class="ph">PAUZE</div>${help ? `<div class="pcontrols">${controlsTable()}</div>${b('back', 'TERUG')}` :
    `${b('resume', 'VERDER')}${b('inv', 'INVENTARIS')}${b('map', 'KAART', inM)}${b('music', 'MUZIEK AAN / UIT')}${ctx && ctx.gfx ? b('gfx', 'GRAPHICS: ' + GFX_LABEL[ctx.gfx.mode]) : ''}${ctx && ctx.fonts ? b('fonts', 'LETTERTYPE: ' + (ctx.fonts.mode === 'aero' ? 'AERO' : 'KLASSIEK')) : ''}${inM ? b('restart', 'MISSIE OPNIEUW', !canRestart) : ''}${b('help', 'BESTURING')}${fsOK() ? b('fs', isFs() ? 'VOLLEDIG SCHERM UIT' : 'VOLLEDIG SCHERM') : ''}`}</div>`;
}
export function controlsTable() {
  const rows = [['Move', 'WASD', 'Left stick', 'Left thumb'], ['Aim (missions)', 'Mouse', 'Right stick', 'Right thumb'], ['Attack / execute', 'Click / F', 'RT', 'SLAAN / push right thumb'],
    ['Interact / grab / throw', 'E', 'A', 'ACTIE'], ['Reload', 'R', 'X / LT', 'RELOAD'], ['Switch weapon', 'Wheel / Tab / 1-3', 'Y', 'WISSEL'], ['Sprint', 'Shift', 'LB / L3', 'SPRINT'],
    ['Map', 'M', 'RB', 'KAART'], ['Inventory', 'I', '—', 'INV'], ['Back / close', 'Esc', 'B', '✕'], ['Grenade (hold, let go)', 'G · Q type', '—', 'GRANAAT · ▸'], ['Spare plate', 'H', '—', 'PLAAT'], ['Phone', 'T', '—', 'SHMOKIA'], ['Restart mission', 'Backspace', 'Back', 'OPNIEUW'], ['Pause', 'P', 'Start', 'II']];
  return `<table><tr><th></th><th>Keyboard</th><th>Controller</th><th>Touch</th></tr>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th>${c}</th>`)).join('')}</tr>`).join('')}</table>`;
}
function canPause() { return ctx && ctx.state.step !== 'title' && !ctx.state.inDialogue && !overlay(); }
export function setPaused(on) {
  if (on && !canPause()) return; if (!on && !paused) return;
  paused = on; pausedAt = performance.now(); releaseAll();
  pauseEl.innerHTML = on ? pauseHTML(false) : ''; pauseEl.style.display = on ? 'flex' : 'none';
  if (ctx && ctx.beep) ctx.beep(on ? 330 : 520, 0.06, 'triangle', 0.04);
}
pauseEl.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-p]'); if (!b || b.disabled || performance.now() - pausedAt < 400) return; // the tap that opened it
  const k = b.dataset.p;
  if (k === 'help') { pauseEl.innerHTML = pauseHTML(true); return; }
  if (k === 'back') { pauseEl.innerHTML = pauseHTML(false); return; }
  if (k === 'gfx') { ctx.gfx.cycle(); pauseEl.innerHTML = pauseHTML(false); return; }
  if (k === 'fonts') { ctx.fonts.cycle(); pauseEl.innerHTML = pauseHTML(false); return; }
  if (k === 'fs') { toggleFs(); setTimeout(() => { if (paused) pauseEl.innerHTML = pauseHTML(false); }, 350); return; }
  setPaused(false);
  if (k === 'inv') press('KeyI'); else if (k === 'map') press('KeyM'); else if (k === 'music') press('KeyN'); else if (k === 'restart') press('Backspace');
});

// keyboard: P pauses, Esc pauses when nothing is open; while paused every key stops here (capture phase, registered first)
addEventListener('keydown', (e) => {
  if (e.isTrusted && mode !== 'mouse') setMode('mouse');
  if (!ctx) return;
  if (paused) {
    e.stopImmediatePropagation(); e.preventDefault();
    if (['Escape', 'KeyP'].includes(e.code)) setPaused(false);
    return;
  }
  if (e.code === 'KeyP' && canPause()) { e.stopImmediatePropagation(); setPaused(true); return; }
  if (e.code === 'Escape' && e.isTrusted && canPause() && !(ctx.getMission() && ctx.getMission().invOpen())) { e.stopImmediatePropagation(); setPaused(true); }
}, true);

// ------------------------------------------------------------------ gamepad
const PAD = { b: [], pb: [], lx: 0, ly: 0, rx: 0, ry: 0, navArm: true, navT: 0, rep: {}, fireT: 0 };
const DEAD = 0.22;
function dz(x, y) { const m = Math.hypot(x, y); if (m < DEAD) return [0, 0, 0]; const k = Math.min(1, (m - DEAD) / (1 - DEAD)) / m; return [x * k, y * k, Math.min(1, (m - DEAD) / (1 - DEAD))]; }
let padIdx = -1;
addEventListener('gamepadconnected', (e) => { padIdx = e.gamepad.index; if (ctx && ctx.toast) ctx.toast('CONTROLLER VERBONDEN', 'Left stick move · A interact · Start pause', 2.2); });
addEventListener('gamepaddisconnected', (e) => { if (e.gamepad.index === padIdx) padIdx = -1; if (mode === 'pad') releaseAll(); });
function getPad() {
  let gps = []; try { gps = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return null; }
  if (padIdx >= 0 && gps[padIdx] && gps[padIdx].connected) return gps[padIdx];
  for (const g of gps) if (g && g.connected) { padIdx = g.index; return g; }
  return null;
}
function pollPad(dt) {
  const gp = getPad(); if (!gp) { if (mode === 'pad' && held.size) releaseAll(); return; }
  const bt = (i) => { const b = gp.buttons[i]; return !!b && (b.pressed || b.value > 0.5); };
  PAD.pb = PAD.b; PAD.b = gp.buttons.map((_, i) => bt(i));
  const [lx, ly, lm] = dz(gp.axes[0] || 0, gp.axes[1] || 0), [rx, ry, rm] = dz(gp.axes[2] || 0, gp.axes[3] || 0);
  const edge = (i) => PAD.b[i] && !PAD.pb[i];
  if (PAD.lock) { if (lm || rm || PAD.b.some(Boolean)) return; PAD.lock = false; }
  if (lm > 0.3 || rm > 0.3 || PAD.b.some((v, i) => v && !PAD.pb[i])) setMode('pad');
  if (mode !== 'pad') return;
  const ov = overlay(), st = ctx.state, m = ctx.getMission();
  ensureFocus(ov);
  // menus: D-pad / left stick move the focus (re-armed by returning to neutral, then auto-repeat), A clicks, B goes back
  const dir = PAD.b[12] ? [0, -1] : PAD.b[13] ? [0, 1] : PAD.b[14] ? [-1, 0] : PAD.b[15] ? [1, 0] : lm > 0.55 ? (Math.abs(lx) > Math.abs(ly) ? [Math.sign(lx), 0] : [0, Math.sign(ly)]) : null;
  if (ov && ov === $('title')) {
    virt.mx = virt.mz = 0; if (focusEl) setFocus(null);
    const vd = dir && dir[1] !== 0 ? dir[1] : 0;
    if (!vd) { PAD.navArm = true; PAD.navT = 0; }
    else if (PAD.navArm) { press(vd < 0 ? 'ArrowUp' : 'ArrowDown'); PAD.navArm = false; PAD.navT = 0.42; }
    else if ((PAD.navT -= dt) <= 0) { press(vd < 0 ? 'ArrowUp' : 'ArrowDown'); PAD.navT = 0.15; }
    if (edge(0)) press('Enter'); if (edge(1)) press('Escape'); if (edge(3)) press('KeyN');
    return;
  }
  if (ov) {
    virt.mx = virt.mz = 0; virt.aim = null; hold('ShiftLeft', false); fireHeld = false;
    if (!dir) { PAD.navArm = true; PAD.navT = 0; }
    else if (PAD.navArm) { nav(dir[0], dir[1]); PAD.navArm = false; PAD.navT = 0.42; }
    else if ((PAD.navT -= dt) <= 0) { nav(dir[0], dir[1]); PAD.navT = 0.13; }
    if (edge(0)) { if (focusEl) focusEl.click(); else press('Enter'); }
    if (edge(1)) press('Escape');
    if (edge(9) && paused) setPaused(false);
    if (edge(2) || edge(3)) { if (st.step === 'title') press('KeyN'); } // X / Y on the title: New Game
    return;
  }
  // in the world
  virt.mx = lx; virt.mz = ly;
  virt.aim = rm > 0.35 ? Math.atan2(rx, ry) : null;
  hold('ShiftLeft', PAD.b[4] || PAD.b[10]);
  if (edge(0)) press('KeyE');
  if (st.inDialogue) return;
  const rt = PAD.b[7];
  if (rt && !PAD.pb[7]) { press('KeyF'); PAD.fireT = 0.3; } else if (rt && (PAD.fireT -= dt) <= 0) { press('KeyF'); PAD.fireT = 0.16; }
  if (edge(2) || edge(6)) press('KeyR');
  if (edge(3)) press('Tab');
  if (edge(5)) press('KeyM');
  if (edge(8)) press('Backspace');
  if (edge(9)) setPaused(true);
  if (edge(1)) press('Escape');
  if (edge(14)) press('Digit1'); if (edge(12)) press('Digit2'); if (edge(15)) press('Digit3'); if (edge(13)) press('KeyI');
  void m;
}

// ------------------------------------------------------------------ touch
let lastTouch = 0, sprintOn = false, fireHeld = false, fireT = 0;
const sticks = [];
const ui = document.createElement('div'); ui.id = 'touchUI';
ui.innerHTML = `
  <div class="tzone" id="tzL"><div class="tbase"><div class="tknob"></div></div></div>
  <div class="tzone" id="tzR"><div class="tbase ring"><div class="tknob"></div></div></div>
  <div class="tb big" id="tbE" data-k="KeyE">ACTIE</div>
  <div class="tb big" id="tbF" data-k="KeyF">SLAAN</div>
  <div class="tb" id="tbR" data-k="KeyR">RELOAD</div>
  <div class="tb" id="tbW" data-k="Tab">WISSEL</div>
  <div class="tb" id="tbN" data-k="KeyV">NACHT<br>ZICHT</div>
  <div class="tb" id="tbG" data-k="nade">GRANAAT<small></small></div>
  <div class="tb" id="tbQ" data-k="KeyQ">&#9656;</div>
  <div class="tb" id="tbH" data-k="KeyH">PLAAT</div>
  <div class="tpills"><div class="tp" data-k="pause">II</div><div class="tp" data-k="KeyM">KAART</div><div class="tp" data-k="KeyI">INV</div><div class="tp" id="tpRestart" data-k="Backspace">OPNIEUW</div><div class="tp" id="tbS" data-k="sprint">SPRINT</div></div>`;
function makeStick(zone, onMove, onEnd) {
  const base = zone.querySelector('.tbase'), knob = zone.querySelector('.tknob'), R = 56;
  const s = { id: null, ox: 0, oy: 0, x0: 0, y0: 0, t0: 0, moved: 0 };
  s.reset = () => { s.id = null; base.classList.remove('on'); base.style.left = base.style.top = ''; knob.style.transform = ''; onEnd(s, true); };
  zone.addEventListener('pointerdown', (e) => {
    e.preventDefault(); if (s.id !== null) return; s.id = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (_) { /* fine */ }
    const r = zone.getBoundingClientRect(); s.ox = e.clientX; s.oy = e.clientY; s.x0 = e.clientX; s.y0 = e.clientY; s.t0 = performance.now(); s.moved = 0;
    base.classList.add('on'); base.style.left = (e.clientX - r.left) + 'px'; base.style.top = (e.clientY - r.top) + 'px'; onMove(s, 0, 0, 0);
  });
  zone.addEventListener('pointermove', (e) => {
    if (e.pointerId !== s.id) return; e.preventDefault();
    let dx = e.clientX - s.ox, dy = e.clientY - s.oy; const d = Math.hypot(dx, dy); s.moved = Math.max(s.moved, Math.hypot(e.clientX - s.x0, e.clientY - s.y0));
    if (d > R) { dx = dx / d * R; dy = dy / d * R; }
    knob.style.transform = `translate(${dx}px,${dy}px)`; onMove(s, dx / R, dy / R, Math.min(1, d / R));
  });
  const end = (e) => { if (e.pointerId !== s.id) return; const tap = s.moved < 12 && performance.now() - s.t0 < 300; const at = [e.clientX, e.clientY]; s.reset(); if (tap) onEnd(s, false, at); };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
  sticks.push(s); return s;
}
let updateTouchButtons = null;
function setupTouch() {
  document.body.appendChild(ui);
  makeStick($('tzL'), (s, x, y, m) => { const k = m < 0.15 ? 0 : 1; virt.mx = x * k; virt.mz = y * k; }, (s, cancel, at) => {
    virt.mx = virt.mz = 0;
    if (at && ctx && !(ctx.getMission() && ctx.getMission().active)) { // a quick tap on the street: same as clicking that spot
      const c = ctx.canvas; c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: at[0], clientY: at[1], pointerType: 'mouse', button: 0, isPrimary: true }));
    }
  });
  makeStick($('tzR'), (s, x, y, m) => { virt.aim = m > 0.2 ? Math.atan2(x, y) : virt.aim; fireHeld = m > 0.85; $('tzR').classList.toggle('fire', fireHeld); }, () => { virt.aim = null; fireHeld = false; $('tzR').classList.remove('fire'); });
  ui.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('[data-k]'); if (!b) return; e.preventDefault(); e.stopPropagation();
    const k = b.dataset.k; b.classList.add('down'); setTimeout(() => b.classList.remove('down'), 140);
    if (k === 'nade') { hold('KeyG', true); const id = e.pointerId, up = (ev) => { if (ev.pointerId !== id) return; hold('KeyG', false); removeEventListener('pointerup', up, true); removeEventListener('pointercancel', up, true); }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true); } // held like G: let go to throw where you aim
    else if (k === 'pause') setPaused(true);
    else if (k === 'sprint') { sprintOn = !sprintOn; hold('ShiftLeft', sprintOn); updateTouchButtons(); }
    else press(k);
  });
  ui.addEventListener('contextmenu', (e) => e.preventDefault());
  ui.addEventListener('touchstart', (e) => { if (e.target.closest('[data-k], .tzone')) e.preventDefault(); }, { passive: false }); // no emulated click after a button tap
  updateTouchButtons = () => { $('tbS').classList.toggle('active', sprintOn); };
  // two fingers on the street: pinch to zoom (the same steps as the mouse wheel)
  const fingers = new Map(); let pd = 0;
  const spread = () => { const [a, b] = [...fingers.values()]; return Math.hypot(a[0] - b[0], a[1] - b[1]); };
  const pinchOK = () => mode === 'touch' && ui.style.display === 'block' && ui.classList.contains('street');
  addEventListener('pointerdown', (e) => { if (e.pointerType !== 'touch') return; fingers.set(e.pointerId, [e.clientX, e.clientY]); if (fingers.size === 2) pd = spread(); }, true);
  addEventListener('pointermove', (e) => {
    if (!fingers.has(e.pointerId)) return; fingers.set(e.pointerId, [e.clientX, e.clientY]);
    if (fingers.size !== 2 || !pinchOK() || !pd) return;
    const d = spread(); if (Math.abs(d / pd - 1) < 0.12) return;
    dispatchEvent(new WheelEvent('wheel', { deltaY: d > pd ? -100 : 100 })); pd = d;
    for (const st of sticks) if (st.id !== null) st.reset(); // a pinch, not a walk
  }, true);
  const lift = (e) => { fingers.delete(e.pointerId); if (fingers.size < 2) pd = 0; };
  addEventListener('pointerup', lift, true); addEventListener('pointercancel', lift, true);
}
addEventListener('touchstart', () => { lastTouch = performance.now(); setMode('touch'); }, { passive: true, capture: true });
for (const ev of ['touchmove', 'touchend', 'touchcancel']) addEventListener(ev, () => { lastTouch = performance.now(); }, { passive: true, capture: true });
for (const ev of ['mousemove', 'mousedown', 'wheel']) addEventListener(ev, (e) => {
  if (!e.isTrusted || performance.now() - lastTouch < 900 || (e.sourceCapabilities && e.sourceCapabilities.firesTouchEvents)) return; // the browser's emulated mouse events after a tap
  if (ev === 'mousemove' && Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0) < 3) return;
  if (mode !== 'mouse') setMode('mouse');
}, { passive: true, capture: true });
document.addEventListener('gesturestart', (e) => e.preventDefault()); // iOS pinch zoom
const lostFocus = () => { releaseAll(); PAD.lock = true; }; // the controller re-arms only after everything is back to neutral
addEventListener('blur', lostFocus);
document.addEventListener('visibilitychange', () => { if (document.hidden) lostFocus(); });
const refit = () => setTimeout(() => dispatchEvent(new Event('resize')), 120);
addEventListener('orientationchange', refit);
if (window.visualViewport) visualViewport.addEventListener('resize', refit);

function updateTouchUI(dt) {
  const m = ctx.getMission(), st = ctx.state;
  document.body.classList.toggle('in-mission', !!(m && m.active)); // the street-only touch buttons (SHMOKIA) step aside
  const on = mode === 'touch' && st.step !== 'title' && !overlay() && !st.inDialogue && !paused;
  ui.style.display = on ? 'block' : 'none';
  if (!on) { if (mode === 'touch' && (fireHeld || virt.mx || virt.mz || sprintOn)) releaseAll(); return; } // only the touch sticks are released here
  const inM = !!(m && m.active);
  ui.classList.toggle('mission', inM); ui.classList.toggle('street', !inM);
  const tk = inM && m.touchKit; // grenades and spare plates: their buttons only show when there's something to use
  ui.classList.toggle('nades', !!(tk && tk.nades)); ui.classList.toggle('ntypes', !!(tk && tk.types > 1)); ui.classList.toggle('plate', !!(tk && tk.plate));
  if (tk && tk.nades) { const sm = $('tbG').querySelector('small'), t = `${tk.nade} ×${tk.nades}`; if (sm.textContent !== t) sm.textContent = t; }
  ui.classList.toggle('armed', st.kit.includes('maboota'));
  ui.classList.toggle('nvok', inM && !!m.nvOK); // a Nachtklus with night-vision goggles: a NACHTZICHT button
  layoutMission(inM);
  stackLeft(inM);
  $('tpRestart').style.display = inM && (m.canRestart ? m.canRestart() : !st.spekbuurt) ? '' : 'none';
  if (fireHeld && inM) { if ((fireT -= dt) <= 0) { press('KeyF'); fireT = 0.12; } } else fireT = 0;
}

// touch screens on a mission: the objective, the health / weapon panel and the parking box share the top-left corner,
// so they stack under each other (the objective can be one line or four)
let stackT = 0, stacked = false;
function stackLeft(inM) {
  const els = ['nvHud', 'nvPark'].map($).filter(Boolean);
  if (!inM || mode !== 'touch') { if (stacked) { for (const el of els) el.style.top = ''; stacked = false; } return; }
  if ((stackT = (stackT + 1) % 6)) return; stacked = true; // ten times a second is plenty
  const ob = $('objective'); let y = ob && shown(ob) && ob.style.opacity !== '0' ? ob.getBoundingClientRect().bottom + 8 : 40;
  for (const el of els) { if (!shown(el)) continue; const t = Math.round(y) + 'px'; if (el.style.top !== t) el.style.top = t; y += el.offsetHeight + 8; }
}
// mission buttons: one row from the right edge, just above the thumb zones, wrapping upward only when the row would
// cross into the left half (the night-vision, grenade and plate buttons come and go, so CSS alone can't place them)
let lastLay = '';
function layoutMission(inM) {
  const ids = ['tbE', 'tbR', 'tbW', 'tbN', 'tbG', 'tbQ', 'tbH'];
  const els = ids.map($).filter((el) => inM && getComputedStyle(el).display !== 'none');
  const key = inM ? els.map((el) => el.id).join() + innerWidth + 'x' + innerHeight : '';
  if (key === lastLay) return; lastLay = key;
  for (const id of ids) { const el = $(id); el.style.right = el.style.bottom = ''; }
  if (!inM) return;
  const W = innerWidth, H = innerHeight, gap = 8, maxW = W * (W > H ? 0.6 : 0.96);
  let x = 14, y = H * 0.58 + 8, rowH = 0;
  for (const el of els) {
    const w = el.offsetWidth, h = el.offsetHeight;
    if (x + w > maxW && x > 14) { x = 14; y += rowH + gap; rowH = 0; }
    el.style.right = `calc(${x}px + env(safe-area-inset-right))`; el.style.bottom = `calc(${Math.round(y)}px + env(safe-area-inset-bottom))`;
    x += w + gap; rowH = Math.max(rowH, h);
  }
}

// ------------------------------------------------------------------ boot
export function initInput(c) {
  ctx = c;
  document.body.appendChild(pauseEl); pauseEl.style.display = 'none';
  setupTouch();
  if (matchMedia('(pointer: coarse)').matches && !matchMedia('(pointer: fine)').matches) setMode('touch');
  let last = performance.now();
  const loop = (t) => { const dt = Math.min(0.05, (t - last) / 1000); last = t; try { pollPad(dt); updateTouchUI(dt); if (mode !== 'pad' && focusEl) setFocus(null); } catch (e) { console.error(e); } requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
export const _test = { press, hold, overlay, nav, get focus() { return focusEl; }, setMode, PAD, virt };
window.__smeInput = _test;
