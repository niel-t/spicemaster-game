// Animated conversation portraits (Tristan 2026-11-16): Freddy Sr. and Eddy Jr. are hand-drawn cartoons in the Spice Master
// look, with drawn frames for the mouth (closed grin, half open, wide laugh) and for blinking. While a line is on screen the
// mouth flips between frames in a talking rhythm; they blink every few seconds, the head bobs and tilts a little, and they
// breathe while listening. Frames: face_xx.jpg (mouth closed), face_xx_m1 / _m2, and the same with _b (eyes shut).
const ANIM = ['./assets/face_sr.jpg', './assets/face_jr.jpg'];
const W = 256, H = 320;

export function createPortraits(img) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.className = 'pface';
  cv.style.display = 'none'; img.after(cv);
  const g = cv.getContext('2d');
  const sets = {}; // path -> [mouth][blink] images
  let cur = null, talkUntil = 0, t0 = performance.now(), nextBlink = 0, raf = 0;
  function load(path) {
    if (sets[path]) return sets[path];
    if (!ANIM.includes(path)) { const i = new Image(); i.src = path; return (sets[path] = [0, 1, 2].map(() => [i, i])); } // one drawn frame (Shooki, Razim, Henk...): it still breathes and nods along
    const base = path.replace(/\.jpg$/, '');
    return (sets[path] = [0, 1, 2].map((m) => [0, 1].map((e) => { const i = new Image(); i.src = base + (m ? '_m' + m : '') + (e ? '_b' : '') + '.jpg'; return i; })));
  }
  ANIM.forEach(load); // fetch early so the first line doesn't flash

  // show(path, line): animate if this face has drawn frames, else leave the plain <img> alone
  function show(path, line) {
    if (!path) { hide(); return; }
    cur = load(path);
    talkUntil = performance.now() + Math.min(6000, Math.max(1100, String(line || '').length * 55));
    img.style.display = 'none'; cv.style.display = 'block';
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function hide() { cur = null; cv.style.display = 'none'; cancelAnimationFrame(raf); raf = 0; }

  function frame(now) {
    raf = 0;
    if (!cur || cv.offsetParent === null) return; // dialogue closed: stop drawing
    raf = requestAnimationFrame(frame);
    const t = (now - t0) / 1000, talking = now < talkUntil;
    // mouth: syllables while talking (wide on the stressed beats), the closed grin when done
    let m = 0;
    if (talking) { const s = Math.abs(Math.sin(t * 9.5)) * (0.55 + 0.45 * Math.sin(t * 2.7 + 1)); m = s > 0.62 ? 2 : s > 0.25 ? 1 : 0; }
    if (now > nextBlink + 130) nextBlink = now + 2200 + Math.random() * 3200;
    const e = now > nextBlink ? 1 : 0;
    const want = cur[m][e], pic = want.complete && want.naturalWidth ? want : cur[0][0];
    if (!pic.complete || !pic.naturalWidth) return;
    const one = cur[1][0] === cur[0][0], jaw = one && talking ? Math.abs(Math.sin(t * 9.5)) * 0.03 : 0; // a single frame: the head bounces on the syllables instead
    const bob = Math.sin(t * 1.9) * 1.6 + (talking ? Math.sin(t * 6.3) * 1.6 : 0) - jaw * 40, tilt = Math.sin(t * 1.1) * 0.012 + (talking ? Math.sin(t * 3.7) * (one ? 0.022 : 0.012) : 0);
    g.save(); g.clearRect(0, 0, W, H);
    g.translate(W / 2, H * 0.85); g.rotate(tilt); g.scale(1.05, 1.05 + Math.sin(t * 1.9) * 0.005 + jaw); g.translate(-W / 2, -H * 0.85 + bob);
    if (one) { const k = Math.min(pic.naturalWidth / W, pic.naturalHeight / H), sw = W * k, sh = H * k; g.drawImage(pic, (pic.naturalWidth - sw) / 2, 0, sw, sh, 0, 0, W, H); } // cover, top-aligned like the <img>
    else g.drawImage(pic, 0, 0, W, H);
    g.restore();
  }
  return { show, hide };
}
