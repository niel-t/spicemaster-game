// Animated conversation portraits (Tristan 2026-11-16): Freddy Sr. and Eddy Jr. keep their real photos, but the photo
// comes alive while they talk. A small 2D puppet rig per face on a canvas: the jaw (everything below the mouth line) drops
// in vertical strips that fall off away from the mouth, so the cheeks stretch instead of tearing; the eyes blink with lids
// painted in the skin colour sampled just above them; the head bobs and tilts a little; it breathes while listening.
// Coordinates are in the photo's own pixels (128 x 160).
const RIGS = {
  './assets/face_sr.jpg': { cut: 117, mx: 64, mw: 26, x0: 38, x1: 91, drop: 7, close: 4, mouth: '#1e0d0c', fall: 46,
    eyes: [[24, 61, 12, 6], [85, 54, 14, 6]] },
  './assets/face_jr.jpg': { cut: 100, mx: 63, mw: 24, x0: 39, x1: 88, drop: 6, close: 0, mouth: null, fall: 44,
    eyes: [[45, 46, 10, 5], [99, 57, 10, 5]] },
};
const W = 128, H = 160, STRIP = 2;

export function createPortraits(img) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'pface';
  cv.style.display = 'none'; img.after(cv);
  const g = cv.getContext('2d');
  const src = document.createElement('canvas'); src.width = W; src.height = H; const sg = src.getContext('2d', { willReadFrequently: true });
  let rig = null, ready = false, talkUntil = 0, t0 = performance.now(), nextBlink = 0, lids = [], raf = 0;
  const pic = new Image();
  pic.onload = () => { sg.clearRect(0, 0, W, H); sg.drawImage(pic, 0, 0, W, H); ready = true;
    lids = rig.eyes.map(([x, y, , ry]) => { const d = sg.getImageData(x - 2, Math.max(0, y - ry - 4), 5, 3).data; let r = 0, gg = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; } const n = d.length / 4; return `rgb(${r / n | 0},${gg / n | 0},${b / n | 0})`; }); };

  // show(path, line): animate if this face has a rig, else leave the plain <img> alone
  function show(path, line) {
    const r = path && RIGS[path];
    if (!r) { rig = null; cv.style.display = 'none'; cancelAnimationFrame(raf); raf = 0; return; }
    if (rig !== r) { rig = r; ready = false; g.clearRect(0, 0, W, H); pic.src = path; }
    talkUntil = performance.now() + Math.min(6000, Math.max(1100, String(line || '').length * 55));
    img.style.display = 'none'; cv.style.display = 'block';
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function hide() { rig = null; cv.style.display = 'none'; cancelAnimationFrame(raf); raf = 0; }

  function frame(now) {
    raf = 0;
    if (!rig || cv.offsetParent === null) return; // dialogue closed: stop drawing
    raf = requestAnimationFrame(frame);
    if (!ready) return;
    const t = (now - t0) / 1000, talking = now < talkUntil, r = rig;
    // jaw: syllable rhythm while talking, settles shut-ish when done
    let open = 0;
    if (talking) { const s = Math.abs(Math.sin(t * 9.5)) * (0.55 + 0.45 * Math.sin(t * 2.7 + 1)), k = Math.min(1, (talkUntil - now) / 250); open = (s * r.drop - r.close * (1 - s)) * k; }
    g.save(); g.clearRect(0, 0, W, H);
    // head: breathe, bob, tilt (scaled up a touch so the edges never show)
    const bob = Math.sin(t * 1.9) * 0.8 + (talking ? Math.sin(t * 6.3) * 0.9 : 0), tilt = Math.sin(t * 1.1) * 0.012 + (talking ? Math.sin(t * 3.7) * 0.01 : 0);
    g.translate(W / 2, H * 0.6); g.rotate(tilt); g.scale(1.07, 1.07 + Math.sin(t * 1.9) * 0.004); g.translate(-W / 2, -H * 0.6 + bob);
    if (Math.abs(open) < 0.15) g.drawImage(src, 0, 0);
    else {
      g.drawImage(src, 0, 0, W, r.cut, 0, 0, W, r.cut); // above the mouth line
      for (let x = 0; x < W; x += STRIP) {
        const cx = x + STRIP / 2, fall = Math.exp(-(((cx - r.mx) / r.fall) ** 2)), d = open * fall;
        // the opening is lens-shaped: deepest in the middle of the mouth, lips and cheeks stretch over the rest of the gap
        const u = (cx - r.mx) / r.mw, fh = r.mouth && d > 0 && Math.abs(u) < 1 ? d * Math.sqrt(1 - u * u) : 0;
        if (d > 0) g.drawImage(src, x, r.cut - 6, STRIP, 6, x, r.cut - 6, STRIP, 6 + d - fh); // (a closed-teeth grin just stretches: no dark slit)
        if (fh > 0.3) { g.fillStyle = r.mouth; g.fillRect(x, r.cut + d - fh - 0.5, STRIP, fh + 1); }
        g.drawImage(src, x, r.cut, STRIP, H - r.cut, x, r.cut + d, STRIP, H - r.cut);
      }
    }
    // blink every few seconds
    if (now > nextBlink + 140) nextBlink = now + 2200 + Math.random() * 3200;
    if (now > nextBlink) {
      const k = 1 - Math.abs((now - nextBlink) / 70 - 1); // close then open
      r.eyes.forEach(([x, y, rx, ry], i) => {
        g.fillStyle = lids[i]; g.beginPath(); g.ellipse(x, y - ry + ry * k, rx, ry * k + 0.5, 0, 0, Math.PI * 2); g.fill();
        g.strokeStyle = 'rgba(40,24,20,.55)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, rx, ry * 0.25, 0, 0, Math.PI); if (k > 0.6) g.stroke();
      });
    }
    g.restore();
  }
  return { show, hide };
}
