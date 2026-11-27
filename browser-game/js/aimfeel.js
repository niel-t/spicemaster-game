// Aim feel on missions (Tristan 2026-11-27, gameplay feel pass): a crosshair at the mouse that opens up with your spread and
// turns red over a Lampas the shot would reach, and hit markers: a tick on a hit, a bigger X on a kill, with a short click.
// On touch and controller there is no cursor, so the marker pops over the enemy that was hit instead.
export function createAimFeel({ beep }) {
  const css = document.createElement('style');
  css.textContent = `
  #aimRet{position:fixed;left:0;top:0;width:0;height:0;pointer-events:none;z-index:24;display:none}
  #aimRet i{position:absolute;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.65);border-radius:1px;transition:background .08s}
  #aimRet .t,#aimRet .b{width:2px;height:8px;left:-1px}#aimRet .l,#aimRet .r{height:2px;width:8px;top:-1px}
  #aimRet .d{width:3px;height:3px;left:-1.5px;top:-1.5px;border-radius:50%}
  #aimRet.hot i{background:#ff4a3a}
  #aimRet.dry i{background:#8a8a8a}
  .aimHit{position:fixed;width:0;height:0;pointer-events:none;z-index:25;animation:aimHit .22s ease-out forwards}
  .aimHit i{position:absolute;left:-1px;top:-11px;width:2px;height:7px;background:#fff;box-shadow:0 0 0 1px rgba(0,0,0,.6);transform-origin:1px 11px}
  .aimHit.kill i{background:#ff4a3a;height:10px;top:-15px;width:3px;transform-origin:1.5px 15px}
  .aimHit i:nth-child(1){transform:rotate(45deg)}.aimHit i:nth-child(2){transform:rotate(135deg)}.aimHit i:nth-child(3){transform:rotate(225deg)}.aimHit i:nth-child(4){transform:rotate(315deg)}
  @keyframes aimHit{0%{transform:scale(.6);opacity:1}35%{transform:scale(1.15);opacity:1}100%{transform:scale(1.35);opacity:0}}`;
  document.head.appendChild(css);
  const ret = document.createElement('div'); ret.id = 'aimRet';
  ret.innerHTML = '<i class="t"></i><i class="b"></i><i class="l"></i><i class="r"></i><i class="d"></i>';
  document.body.appendChild(ret);
  const [t, b, l, r] = ret.querySelectorAll('i');
  let shown = false, gap = 10, canvas = null;

  // on: a gun is out on a mission with the mouse; x, y: the mouse in px; spread: px radius of the cone at the aim point
  function update({ on, x, y, spread, hot, dry, el }) {
    if (el) canvas = el;
    if (on !== shown) { shown = on; ret.style.display = on ? 'block' : 'none'; if (canvas) canvas.style.cursor = on ? 'none' : ''; }
    if (!on) return;
    gap += (Math.max(5, Math.min(60, spread)) - gap) * 0.45; // eases open and shut, never jumps
    ret.style.transform = `translate(${x}px,${y}px)`;
    t.style.top = `${-gap - 8}px`; b.style.top = `${gap}px`; l.style.left = `${-gap - 8}px`; r.style.left = `${gap}px`;
    ret.classList.toggle('hot', !!hot); ret.classList.toggle('dry', !!dry);
  }
  // a hit (kill = it put him down for good) at screen px x, y
  let lastTick = 0;
  function hit(kill, x, y) {
    const m = document.createElement('div'); m.className = 'aimHit' + (kill ? ' kill' : '');
    m.innerHTML = '<i></i><i></i><i></i><i></i>'; m.style.left = x + 'px'; m.style.top = y + 'px';
    document.body.appendChild(m); setTimeout(() => m.remove(), 260);
    const now = performance.now(); if (now - lastTick > 40) { lastTick = now; // a shotgun's pellets give one click, not six
      if (kill) { beep(1250, 0.05, 'square', 0.03); setTimeout(() => beep(620, 0.08, 'triangle', 0.04), 35); }
      else beep(1700, 0.035, 'square', 0.022); }
  }
  function hide() { update({ on: false }); }
  return { update, hit, hide };
}
