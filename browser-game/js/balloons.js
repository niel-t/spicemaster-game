// Speech balloons, Frutiger Aero style (Tristan 2026-11-16): glossy glass, aqua gradient, soft top highlight, the same
// look as the Kaasdows XL Aero skin. They used to be canvas sprites in the 3D scene, which could slide off the edge of a
// phone screen and got blurry when the camera zoomed out. Now every balloon is an HTML element placed over its 3D anchor
// each frame and kept inside the screen; the tail keeps pointing at the speaker even when the balloon is pushed in.
//
// anchor()  -> an Object3D to parent to a person/car (same contract as the old sprite: .visible, .userData.life)
// say(anchor, text, col, life, name) -> show text; col tints the rim (orange = angry, blue = police, grey = muttering)
// sync(scene, camera) -> once per frame, after the camera moved
import * as THREE from '../vendor/three.module.min.js';

const CSS = `
#balloons { position: fixed; inset: 0; pointer-events: none; z-index: 6; overflow: hidden; contain: strict; }
.abal { position: absolute; left: 0; top: 0; box-sizing: border-box; max-width: min(250px, 64vw); padding: 7px 14px 8px; border-radius: 17px;
  font: 600 15px/1.25 "Segoe UI", Tahoma, "Rubik", Arial, sans-serif; color: #07304f; text-align: center; letter-spacing: .1px; overflow-wrap: anywhere;
  background: linear-gradient(180deg, rgba(255,255,255,.97) 0%, rgba(238,249,255,.94) 46%, rgba(196,234,255,.92) 54%, rgba(222,245,255,.95) 100%);
  border: 1px solid color-mix(in srgb, var(--c) 65%, #ffffff);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 42%, transparent), 0 6px 16px rgba(0,40,80,.34), inset 0 1px 0 #fff,
    inset 0 -7px 12px color-mix(in srgb, var(--c) 16%, transparent);
  -webkit-backdrop-filter: blur(6px) saturate(1.5); backdrop-filter: blur(6px) saturate(1.5); will-change: transform, opacity; }
.abal::before { content: ""; position: absolute; left: 7px; right: 7px; top: 2px; height: 46%; border-radius: 13px 13px 50% 50% / 13px 13px 9px 9px;
  background: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,.12)); pointer-events: none; }
.abal .bt { position: relative; display: block; }
.abal .nm { position: relative; display: block; margin: -1px 0 1px; font-size: 11px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
  color: color-mix(in srgb, var(--c) 60%, #0a3a60); }
.abal .tl { position: absolute; bottom: -8px; width: 14px; height: 14px; margin-left: -7px; transform: rotate(45deg); border-radius: 0 0 4px 0;
  background: linear-gradient(135deg, rgba(200,236,255,.0) 50%, rgba(214,242,255,.97) 50%);
  border-right: 1px solid color-mix(in srgb, var(--c) 65%, #ffffff); border-bottom: 1px solid color-mix(in srgb, var(--c) 65%, #ffffff);
  box-shadow: 2px 2px 0 0 color-mix(in srgb, var(--c) 42%, transparent); }
.abal.loud { font-weight: 800; font-size: 17px; padding: 6px 15px 7px; }
.abal.long { text-align: left; }
@media (max-width: 700px), (max-height: 500px) {
  .abal { font-size: 13px; max-width: min(210px, 58vw); padding: 6px 11px 7px; border-radius: 14px; }
  .abal.loud { font-size: 14px; }
  .abal .nm { font-size: 10px; }
}`;

export function createBalloons() {
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const layer = document.createElement('div'); layer.id = 'balloons'; document.body.appendChild(layer);
  const all = new Set(), v = new THREE.Vector3(), placed = [];

  function anchor() {
    const a = new THREE.Object3D(); a.visible = false;
    a.userData = { life: 0, op: 1, el: null, w: 0, h: 0, balloon: true };
    all.add(a); return a;
  }
  function el(a) {
    const u = a.userData; if (u.el) return u.el;
    const d = document.createElement('div'); d.className = 'abal'; d.style.opacity = '0';
    d.innerHTML = '<b class="nm"></b><span class="bt"></span><i class="tl"></i>'; layer.appendChild(d);
    u.el = d; return d;
  }
  function say(a, text, col = '#e8a33d', life = 2.2, name = '') {
    const u = a.userData, d = el(a), t = String(text);
    d.style.setProperty('--c', col);
    d.querySelector('.bt').textContent = t;
    const nm = d.querySelector('.nm'); nm.textContent = name || ''; nm.style.display = name ? 'block' : 'none';
    const letters = t.replace(/[^A-Za-zÀ-ÿ]/g, '');
    d.classList.toggle('loud', t.length <= 18 && letters.length > 2 && letters === letters.toUpperCase());
    d.classList.toggle('long', t.length > 70);
    d.style.display = 'block'; u.w = d.offsetWidth; u.h = d.offsetHeight; // measured once per line, not per frame
    u.life = Math.max(life, 0.8 + t.length * 0.06); u.op = 1; a.visible = true;
  }
  function hide(a) { const u = a.userData; if (u.el && u.el.style.display !== 'none') u.el.style.display = 'none'; }
  function rootOf(o) { for (let n = o; n; n = n.parent) { if (!n.visible) return null; if (n.isScene) return n; } return null; }

  function sync(scene, camera) {
    const W = innerWidth, H = innerHeight, pad = 8, top = 64; // keep clear of the objective and money HUD
    placed.length = 0;
    const show = [];
    for (const a of all) {
      const u = a.userData;
      if (!(u.life > 0) || rootOf(a) !== scene) { hide(a); continue; }
      a.getWorldPosition(v); v.project(camera);
      const x = (v.x + 1) / 2 * W, y = (1 - v.y) / 2 * H;
      if (v.z > 1 || x < -W * 0.25 || x > W * 1.25 || y < -H * 0.25 || y > H * 1.25) { hide(a); continue; } // behind the camera or far off-screen
      show.push([a, x, y]);
    }
    show.sort((p, q) => q[2] - p[2]); // nearest the bottom first; later ones stack above if they overlap
    for (const [a, x, y] of show) {
      const u = a.userData, d = u.el, w = u.w, h = u.h;
      let left = Math.min(Math.max(x - w / 2, pad), W - w - pad), tp = y - h - 10;
      for (const r of placed) if (left < r[0] + r[2] && left + w > r[0] && tp < r[1] + r[3] && tp + h > r[1]) tp = r[1] - h - 4;
      tp = Math.min(Math.max(tp, top), H - h - pad);
      placed.push([left, tp, w, h]);
      if (d.style.display === 'none') d.style.display = 'block';
      d.style.transform = `translate3d(${left | 0}px, ${tp | 0}px, 0)`;
      d.style.opacity = String(Math.min(1, u.op, u.life * 4));
      const tl = d.lastChild, tx = Math.min(Math.max(x - left, 16), w - 16), below = y > tp + h - 2;
      tl.style.left = tx + 'px'; tl.style.display = below ? 'block' : 'none';
    }
  }
  return { anchor, say, sync, hide };
}
