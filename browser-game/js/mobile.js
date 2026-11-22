// Spice Master Eddy on phones and tablets: what kind of device this is, lighter graphics picked by itself,
// a camera that still shows the street when the phone is held upright, and where cards can sit without
// covering the thumb controls.
//
// Auto graphics: phones start on SIMPEL (no screen pass), tablets on ENHANCED without the 4x MSAA target.
// A small governor watches the frame rate and lowers the render resolution step by step when the device
// can't keep up (and raises it again when there's headroom). If even the lowest step is too slow and the
// player never picked a GRAPHICS mode, it drops the screen pass too. A mode picked in the pause menu wins.

const mq = (q) => { try { return matchMedia(q).matches; } catch (e) { return false; } };
const UA = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
const IPAD_DESKTOP_UA = /Macintosh/.test(UA) && (navigator.maxTouchPoints || 0) > 1; // iPadOS pretends to be a Mac
export const IS_TOUCH_DEVICE = (mq('(pointer: coarse)') && !mq('(pointer: fine)')) || /Android|iPhone|iPad|iPod|Mobile/i.test(UA) || IPAD_DESKTOP_UA;
const shortSide = () => Math.min(screen.width || innerWidth, screen.height || innerHeight);
export const IS_PHONE = IS_TOUCH_DEVICE && shortSide() < 600;
export const IS_TABLET = IS_TOUCH_DEVICE && !IS_PHONE;
document.documentElement.classList.toggle('dev-phone', IS_PHONE);
document.documentElement.classList.toggle('dev-tablet', IS_TABLET);

// ------------------------------------------------------------------ camera: portrait keeps a usable width of street
// The street camera is a fixed vertical field of view, so a phone held upright (aspect ~0.46) would see a strip
// a few metres wide. Below aspect 1 the vertical angle opens up until the horizontal view is ~80% of what a square
// screen shows.
export function fitFov(camera, base) {
  const a = camera.aspect || 1;
  let f = base;
  if (a < 1) f = Math.min(74, Math.max(base, 2 * Math.atan(Math.tan(base * 0.8 * Math.PI / 360) / a) * 180 / Math.PI));
  if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
}

// ------------------------------------------------------------------ cards (Shooki's guide and tips) on touch screens
// Distance from the bottom of the screen that stays clear of the left stick and the ACTIE button.
export function cardBottom() {
  if (!document.body.classList.contains('touch')) return 44;
  const W = innerWidth, H = innerHeight;
  if (H > W) return Math.round(Math.min(H * 0.33, 266)); // upright: above the stick, ACTIE and the prompt
  if (H <= 500) return 140; // phone on its side
  return 170;
}

// ------------------------------------------------------------------ auto graphics
const GFX_KEY = 'spiceMasterEddy.gfx';
export const userPickedGfx = () => { try { return !!localStorage.getItem(GFX_KEY); } catch (e) { return false; } };
export const defaultGfx = () => (IS_PHONE ? 'simple' : 'enhanced');
export const msaaSamples = () => (IS_TOUCH_DEVICE ? 0 : 4);
export const shadowSize = () => (IS_PHONE ? 1024 : 2048);

const STEPS = [1, 0.85, 0.72, 0.6];
export function createAutoQuality(renderer, post) {
  const base = Math.min(devicePixelRatio || 1, IS_TOUCH_DEVICE ? 1.5 : 2);
  let step = 0, acc = 0, frames = 0, good = 0, last = 0, hold = 0, dropped = false;
  const apply = () => { const pr = Math.max(0.75, base * STEPS[step]); if (Math.abs(renderer.getPixelRatio() - pr) > 0.01) renderer.setPixelRatio(pr); }; // three.js resizes the drawing buffer itself
  apply();
  // call once per rendered frame; `busy` frames (title, loading, a paused game) don't count
  function tick(now, busy) {
    if (!last || busy || document.hidden) { last = now; acc = frames = 0; return; }
    const dt = now - last; last = now;
    if (dt > 250) { acc = frames = 0; return; } // a hitch (tab switch, level build), not the steady frame rate
    acc += dt; frames++;
    if (acc < 2000) return;
    const fps = frames * 1000 / acc; acc = frames = 0;
    if (hold > 0) { hold--; return; } // let a change settle before judging again
    if (fps < 40 && step < STEPS.length - 1) { step++; good = 0; hold = 1; apply(); return; }
    if (fps < 28 && step === STEPS.length - 1 && !dropped && post.mode !== 'simple' && !userPickedGfx()) { dropped = true; post.setAuto('simple'); hold = 1; return; }
    if (fps > 57) { if (++good >= 5 && step > 0) { step--; good = 0; hold = 1; apply(); } } else good = 0;
  }
  return { tick, get scale() { return STEPS[step]; }, get pixelRatio() { return renderer.getPixelRatio(); }, base };
}

// ------------------------------------------------------------------ words: Shooki's cards name the touch buttons on a touch screen
export const isTouchUI = () => document.body.classList.contains('touch');
export function touchWords(html) {
  if (!html || !isTouchUI()) return html;
  return String(html)
    .replace(/<b>WASD<\/b> \(or the arrow keys\)/g, 'your <b>left thumb</b>').replace(/<b>WASD<\/b>/g, '<b>left thumb</b>')
    .replace(/<b>Shift<\/b>/g, '<b>SPRINT</b>')
    .replace(/\b([Pp])ress <b>E<\/b>/g, (m, p) => (p === 'P' ? 'Tap' : 'tap') + ' <b>ACTIE</b>').replace(/<b>E<\/b>/g, '<b>ACTIE</b>').replace(/\(E\)/g, '(ACTIE)')
    .replace(/, or press <b>Esc<\/b>/g, '').replace(/<b>Esc<\/b>/g, '<b>✕</b>').replace(/\bEsc to\b/g, '✕ to')
    .replace(/<b>T<\/b>/g, '<b>SHMOKIA</b>').replace(/\(<b>B<\/b>\)/g, '(tap the blue <b>P</b> box)')
    .replace(/<b>mouse wheel<\/b> zoom/g, '<b>pinch</b> to zoom')
    .replace(/\bClick\b/g, 'Tap').replace(/\bclick\b/g, 'tap');
}
