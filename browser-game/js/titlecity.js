// The title screen backdrop: a slow flight over the painted Map of Kaasland (kaasaerial.js), with life on top of it
// (boats on the canals and De Kaas, bikes and trams in the streets, the windmill turning, cloud shadows, gulls),
// and in front a row of gabled canal houses on a quay with cyclists and a passing boat. Spice-trader palette.
// createTitleCity(host) puts a canvas behind the menu; stop() ends the animation and frees the canvases.
import * as G from './kaasgeo.js';
import { paintKaasland } from './kaasaerial.js';
import { topBoat } from './boat2d.js'; // sloepen, rondvaartboten, tjalks and cruisers from above

const { W, H, C0, polar, arc, RIVER, NORTH_BANK, SOUTH_BANK, ISLAND, CANALS, ROADS, RING_R, inPoly } = G;
const SPICE = { saffron: '#e8a33d', turmeric: '#f2c14e', paprika: '#b5442a', cumin: '#7a4a26', cardamom: '#7f9a5a', cream: '#f3e6c8', clove: '#3b2418' };
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const lerp = (a, b, k) => a + (b - a) * k;
const smooth = (k) => k * k * (3 - 2 * k);

// ---- paths things move along (map units): polylines with their cumulative length
function track(pts) { const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])); return { pts, cum, len: cum[cum.length - 1] }; }
function at(tr, d) { // position + heading at distance d (clamped)
  d = Math.max(0, Math.min(tr.len, d)); let i = 1; while (i < tr.cum.length - 1 && tr.cum[i] < d) i++;
  const [ax, ay] = tr.pts[i - 1], [bx, by] = tr.pts[i], k = (d - tr.cum[i - 1]) / ((tr.cum[i] - tr.cum[i - 1]) || 1);
  return [ax + (bx - ax) * k, ay + (by - ay) * k, Math.atan2(by - ay, bx - ax)];
}
const yAt = (bank, x) => { for (let i = 1; i < bank.length; i++) if (x <= bank[i][0]) { const [ax, ay] = bank[i - 1], [bx, by] = bank[i]; return ay + (by - ay) * (x - ax) / (bx - ax); } return bank[bank.length - 1][1]; };
const riverLane = (f, x1 = 1230) => { const pts = []; for (let x = -30; x <= x1; x += 10) pts.push([x, lerp(yAt(NORTH_BANK, x), yAt(SOUTH_BANK, x), f)]); return track(pts); };

// the flight: a closed loop of looks over the city [x, y, zoom]
const TOUR = [[300, 610, 1], [430, 505, 1.05], [520, 440, 1.15], [645, 425, 1.2], [760, 385, 1.1], [720, 300, 1.05], [870, 255, 1.05], [1005, 240, 1.5], [890, 285, 1], [600, 315, 1.15], [440, 385, 1.1], [335, 480, 1.05]]; // canal ring, De Kaas, the windmill, back through the centre
const SEG = 13; // seconds per leg
function catmull(p0, p1, p2, p3, t) { const t2 = t * t, t3 = t2 * t; return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3); }
function tourAt(t) {
  const n = TOUR.length, u = (t / SEG) % n, i = Math.floor(u), k = u - i, P = (j) => TOUR[(j + n) % n];
  return [0, 1, 2].map((c) => catmull(P(i - 1)[c], P(i)[c], P(i + 1)[c], P(i + 2)[c], k));
}

export function createTitleCity(host) {
  const cv = document.createElement('canvas'); cv.id = 'tcity'; host.prepend(cv);
  const ctx = cv.getContext('2d');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = rng(4242), rr = (a, b) => a + rand() * (b - a), pick = (a) => a[Math.floor(rand() * a.length)];
  let vw = 0, vh = 0, dpr = 1, stripH = 0, strip = null, map = null, mapAt = 0, raf = 0, running = true, t0 = performance.now(), last = t0;

  // ---- moving things on the map
  const canalTracks = CANALS.flatMap((r) => [track(arc(4, 176, r - 1.4, 2)), track(arc(176, 4, r + 1.4, 2))]);
  const quayTracks = CANALS.flatMap((r) => [-7.5, 7.5].map((s) => track(arc(4, 176, r + s, 2))));
  const roadTracks = ROADS.map((r) => track(r.pts.length > 2 ? r.pts : (() => { const [a, b] = r.pts, n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6); return Array.from({ length: n + 1 }, (_, i) => [lerp(a[0], b[0], i / n), lerp(a[1], b[1], i / n)]); })()));
  const ringTrack = track(arc(178, 2, RING_R, 2));
  const lanes = [riverLane(0.25), riverLane(0.75), riverLane(0.5, 930)]; // the middle lane stops short of the windmill island
  const boats = [
    ...Array.from({ length: 16 }, (_, i) => ({ tr: canalTracks[i % canalTracks.length], d: rand(), v: rr(3, 5), l: rr(4, 5.5), w: 1.7, hull: pick(['#e6dccb', '#3d6b55', '#7a4a3a', '#2f4f5f', SPICE.paprika]), deck: rand() < 0.4 ? SPICE.cream : null })),
    ...Array.from({ length: 5 }, (_, i) => ({ tr: canalTracks[(i * 3 + 1) % canalTracks.length], d: rand(), v: 4, l: 8, w: 2.2, hull: '#2d3b44', deck: '#cfe3ea', tour: true })),
    ...Array.from({ length: 5 }, (_, i) => ({ tr: lanes[i % 2], d: rand(), v: rr(5, 8) * (i % 2 ? 1 : -1), l: 20, w: 4.5, hull: '#5c4a3c', deck: '#3f5560', barge: true })),
    ...Array.from({ length: 4 }, (_, i) => ({ tr: lanes[2], d: rand(), v: rr(6, 10) * (i % 2 ? 1 : -1), l: 9, w: 2.6, hull: '#fbf8f0', deck: SPICE.turmeric })),
  ];
  const bikes = Array.from({ length: 140 }, () => { const tr = rand() < 0.45 ? pick(quayTracks) : pick(roadTracks); return { tr, d: rand(), v: rr(2.4, 4) * (rand() < 0.5 ? -1 : 1), coat: pick([SPICE.paprika, SPICE.saffron, SPICE.cardamom, SPICE.cumin, '#3d5a73', '#efe7d6', '#2b2b2b', SPICE.turmeric]) }; });
  const trams = Array.from({ length: 3 }, (_, i) => ({ tr: ringTrack, d: i / 3, v: 6 * (i === 1 ? -1 : 1) }));
  const glints = []; while (glints.length < 70) { const x = rr(0, W), y = rr(150, 330); if (inPoly(x, y, RIVER)) glints.push([x, y, rand() * 6]); }
  const clouds = Array.from({ length: 5 }, () => ({ x: rr(0, W), y: rr(0, H), r: rr(70, 130), v: rr(2, 4) }));
  const gulls = Array.from({ length: 6 }, () => ({ x: rand(), y: rr(0.08, 0.5), v: rr(0.012, 0.025), f: rand() * 6, s: rr(0.7, 1.2) }));
  const posOn = (o, t) => { const L = o.tr.len, s = ((o.d * L + t * o.v) % (2 * L) + 2 * L) % (2 * L), back = s > L, p = at(o.tr, back ? 2 * L - s : s); if (back) p[2] += Math.PI; return p; };

  // ---- a quick placeholder map, shown until the painted one is ready
  function drawPlaceholder() {
    ctx.fillStyle = '#efe7d6'; ctx.fillRect(-50, -50, W + 100, H + 100);
    ctx.beginPath(); RIVER.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = '#94c9d7'; ctx.fill();
    ctx.strokeStyle = '#94c9d7'; ctx.lineWidth = 6.5; for (const r of CANALS) { ctx.beginPath(); arc(0, 180, r, 3).forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); }
  }

  // ---- the row of canal houses (front view), drawn once per size into a tile that scrolls
  function buildStrip() {
    const hF = stripH, wallH = Math.round(hF * 0.74), u = hF / 200, R2 = rng(77), r2 = (a, b) => a + R2() * (b - a), p2 = (a) => a[Math.floor(R2() * a.length)];
    const houses = []; let x = 0; const want = Math.max(vw * 1.4, 1100);
    while (x < want) { const w = Math.round(r2(34, 56) * u), h = Math.round(r2(0.55, 0.82) * wallH); houses.push({ x, w, h, type: p2(['step', 'bell', 'neck', 'spout', 'step', 'bell', 'cornice', 'neck']), wall: p2(['#9c3b22', '#8a3a24', '#7a4a26', '#a8532e', '#6b3a28', '#d9a441', '#efe2c4', '#55603a', '#3a2c25', '#b5442a', '#8d5a3a']), floors: 3 + Math.floor(R2() * 3) }); x += w; }
    const tw = x, th = wallH, c = document.createElement('canvas'); c.width = Math.ceil(tw * dpr); c.height = Math.ceil(th * dpr);
    const g = c.getContext('2d'); g.scale(dpr, dpr); g.lineJoin = 'round';
    const base = wallH - Math.round(hF * 0.1); // the quay's top edge
    const trimC = '#f6ecd6', lit = ['#f6c35a', '#f2b84b', '#ffd98a'], dark = '#2e2420';
    // trees behind? no: a soft back row of roofs for depth
    g.fillStyle = 'rgba(122,74,38,.35)'; for (let bx = 0; bx < tw; bx += 22 * u) { const bh = r2(0.6, 0.95) * wallH; g.fillRect(bx, base - bh, 23 * u, bh); }
    for (const hs of houses) {
      const { x: hx, w, h, type } = hs, top = base - h, light = hs.wall === '#efe2c4' || hs.wall === '#d9a441';
      const trim = light ? '#6b4a30' : trimC;
      g.fillStyle = hs.wall; g.strokeStyle = trim; g.lineWidth = Math.max(1, 1.2 * u);
      // the gable
      g.beginPath(); g.moveTo(hx, base); g.lineTo(hx, top);
      const gw = w, gh = w * 0.75, cx = hx + w / 2;
      if (type === 'step') { const n = 4, sw = gw / 2 / (n + 0.5), sh = gh / n; let px = hx; for (let i = 0; i < n; i++) { g.lineTo(px, top - sh * i - sh); px += sw; g.lineTo(px, top - sh * i - sh); } g.lineTo(cx + sw / 2, top - gh - sh * 0.3); px = hx + w - sw * n; for (let i = n - 1; i >= 0; i--) { g.lineTo(px, top - sh * i - sh); px += sw; g.lineTo(px, top - sh * i); } g.lineTo(hx + w, top); }
      else if (type === 'bell') { const nw = w * 0.56; g.quadraticCurveTo(hx, top - gh * 0.45, cx - nw / 2, top - gh * 0.55); g.lineTo(cx - nw / 2, top - gh * 0.8); g.quadraticCurveTo(cx, top - gh * 1.25, cx + nw / 2, top - gh * 0.8); g.lineTo(cx + nw / 2, top - gh * 0.55); g.quadraticCurveTo(hx + w, top - gh * 0.45, hx + w, top); }
      else if (type === 'neck') { const nw = w * 0.5; g.arc(cx - nw / 2, top, (w - nw) / 2, Math.PI, Math.PI * 1.5); g.lineTo(cx - nw / 2, top - gh * 0.75); g.lineTo(cx, top - gh * 1.05); g.lineTo(cx + nw / 2, top - gh * 0.75); g.lineTo(cx + nw / 2, top - (w - nw) / 2); g.arc(cx + nw / 2, top, (w - nw) / 2, Math.PI * 1.5, 0); }
      else if (type === 'spout') { g.lineTo(cx - w * 0.14, top - gh * 0.9); g.lineTo(cx + w * 0.14, top - gh * 0.9); g.lineTo(hx + w, top); }
      else { g.lineTo(hx + w, top); }
      g.lineTo(hx + w, base); g.closePath(); g.fill(); g.stroke();
      if (type === 'cornice') { g.fillStyle = trimC; g.fillRect(hx - 2 * u, top - 7 * u, w + 4 * u, 7 * u); g.fillRect(cx - w * 0.2, top - 13 * u, w * 0.4, 6 * u); }
      if (type === 'spout' || type === 'neck') { g.fillStyle = trim; g.fillRect(cx - 1.2 * u, top - gh * (type === 'neck' ? 0.62 : 0.6), 2.4 * u, 7 * u); }
      // hoisting beam
      g.strokeStyle = dark; g.lineWidth = 2 * u; const hy = type === 'cornice' ? top - 2 * u : top - gh * 0.35; g.beginPath(); g.moveTo(cx, hy); g.lineTo(cx, hy + 5 * u); g.stroke(); g.lineWidth = 0.8 * u; g.beginPath(); g.moveTo(cx, hy + 5 * u); g.lineTo(cx, hy + 11 * u); g.stroke();
      // windows: floors from the top, a tall ground floor with the door
      const cols = w > 46 * u ? 3 : 2, gf = h * 0.26, fh = (h - gf) / hs.floors, ww = w / cols * 0.5;
      for (let f = 0; f < hs.floors; f++) for (let k = 0; k < cols; k++) {
        const wx = hx + (k + 0.5) * w / cols - ww / 2, wy = top + f * fh + fh * 0.18, wh = fh * 0.62;
        g.fillStyle = trimC; g.fillRect(wx - 1.3 * u, wy - 1.3 * u, ww + 2.6 * u, wh + 2.6 * u);
        g.fillStyle = R2() < 0.3 ? p2(lit) : '#34424a'; g.fillRect(wx, wy, ww, wh);
        g.fillStyle = trimC; g.fillRect(wx, wy + wh * 0.48, ww, 1 * u); g.fillRect(wx + ww / 2 - 0.5 * u, wy, 1 * u, wh);
      }
      // gable window
      if (type !== 'cornice') { g.fillStyle = trimC; g.fillRect(cx - ww * 0.4 - u, top - gh * 0.42 + 6 * u, ww * 0.8 + 2 * u, gh * 0.22 + 2 * u); g.fillStyle = '#34424a'; g.fillRect(cx - ww * 0.4, top - gh * 0.42 + 7 * u, ww * 0.8, gh * 0.22); }
      // ground floor: door with a little stoop, and a shop window
      const dx = hx + w * (R2() < 0.5 ? 0.18 : 0.58), dw = w * 0.24;
      g.fillStyle = trimC; g.fillRect(dx - u, base - gf * 0.86 - u, dw + 2 * u, gf * 0.86 + u);
      g.fillStyle = p2(['#2f4a3a', '#3b2418', '#5a2a1e', '#26384a']); g.fillRect(dx, base - gf * 0.86, dw, gf * 0.86);
      g.fillStyle = '#f6c35a'; g.fillRect(dx, base - gf * 0.86, dw, gf * 0.16);
      const sx = dx < hx + w / 2 ? dx + dw + w * 0.08 : hx + w * 0.1, sw = w * 0.34;
      g.fillStyle = trimC; g.fillRect(sx - u, base - gf * 0.8 - u, sw + 2 * u, gf * 0.62 + 2 * u); g.fillStyle = R2() < 0.5 ? '#f2b84b' : '#3b4b52'; g.fillRect(sx, base - gf * 0.8, sw, gf * 0.62);
      if (R2() < 0.35) { g.fillStyle = p2([SPICE.paprika, SPICE.cardamom, SPICE.saffron]); g.beginPath(); g.moveTo(sx - 2 * u, base - gf * 0.84); g.lineTo(sx + sw + 2 * u, base - gf * 0.84); g.lineTo(sx + sw + 4 * u, base - gf * 0.7); g.lineTo(sx - 4 * u, base - gf * 0.7); g.fill(); }
    }
    // the quay: cobbles, kerb, lamp posts, parked bikes, elms
    g.fillStyle = '#b9a58a'; g.fillRect(0, base, tw, th - base);
    g.fillStyle = 'rgba(90,70,50,.18)'; for (let qx = 0; qx < tw; qx += 6 * u) g.fillRect(qx, base + (qx / (6 * u)) % 2 * 3 * u, 3 * u, 2 * u);
    g.fillStyle = '#8d7a62'; g.fillRect(0, th - 4 * u, tw, 4 * u);
    for (let lx = 60 * u; lx < tw - 20 * u; lx += r2(150, 220) * u) { // elms first, so lamps stand in front
      g.fillStyle = 'rgba(70,52,30,.9)'; g.fillRect(lx - 2 * u, base - 46 * u, 4 * u, 50 * u);
      for (let k = 0; k < 7; k++) { g.fillStyle = p2(['#5f7040', '#6f7f4a', '#7f9a5a', '#556638']); g.beginPath(); g.arc(lx + r2(-22, 22) * u, base - r2(46, 78) * u, r2(12, 20) * u, 0, 7); g.fill(); }
    }
    for (let lx = 30 * u; lx < tw - 10 * u; lx += 95 * u) { g.fillStyle = '#2e2420'; g.fillRect(lx, base - 34 * u, 1.8 * u, 38 * u); g.fillRect(lx - 3 * u, base - 38 * u, 7.8 * u, 5 * u); g.fillStyle = '#ffd98a'; g.fillRect(lx - 2 * u, base - 37 * u, 5.8 * u, 3 * u); }
    g.strokeStyle = '#2e2420'; g.lineWidth = 1.2 * u;
    for (let bx = 12 * u; bx < tw - 12 * u; bx += r2(10, 40) * u) { if (R2() < 0.4) continue; const by = base + 5 * u, r = 4.2 * u; g.beginPath(); g.arc(bx, by, r, 0, 7); g.arc(bx + 13 * u, by, r, 0, 7); g.moveTo(bx, by); g.lineTo(bx + 5 * u, by - 6 * u); g.lineTo(bx + 11 * u, by - 6 * u); g.lineTo(bx + 13 * u, by); g.moveTo(bx + 5 * u, by - 6 * u); g.lineTo(bx + 6.5 * u, by); g.lineTo(bx + 11 * u, by - 6 * u); g.stroke(); g.fillStyle = p2([SPICE.paprika, SPICE.saffron, '#2e2420', SPICE.cardamom]); g.fillRect(bx + 3.5 * u, by - 8 * u, 4 * u, 1.6 * u); }
    // the reflection: houses upside down, squashed, softened, tinted by the water (rippled per frame in slices)
    const waterH = Math.ceil(hF - th) + 2, rc = document.createElement('canvas'); rc.width = c.width; rc.height = Math.ceil(waterH * dpr);
    const rg = rc.getContext('2d'); rg.filter = `blur(${Math.max(1, 1.6 * u * dpr)}px)`; rg.setTransform(dpr, 0, 0, -0.62 * dpr, 0, base * 0.62 * dpr); rg.drawImage(c, 0, 0, c.width, base * dpr, 0, 0, tw, base);
    rg.filter = 'none'; rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'source-atop'; const fadeG = rg.createLinearGradient(0, 0, 0, rc.height); fadeG.addColorStop(0, 'rgba(70,110,118,.25)'); fadeG.addColorStop(1, 'rgba(47,85,96,.85)'); rg.fillStyle = fadeG; rg.fillRect(0, 0, rc.width, rc.height);
    strip = { c, rc, tw, th, base, hF, u };
  }

  function resize() {
    vw = window.innerWidth; vh = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, vw < 700 ? 1.75 : 1.5);
    cv.width = Math.round(vw * dpr); cv.height = Math.round(vh * dpr); cv.style.width = vw + 'px'; cv.style.height = vh + 'px';
    stripH = vh < 430 ? 0 : Math.round(Math.max(110, Math.min(vh * (vw < vh ? 0.2 : 0.25), 250)));
    host.style.setProperty('--strip', stripH ? Math.round(stripH * 0.74) + 'px' : '0px');
    if (stripH) buildStrip(); else strip = null;
  }

  function paint() { // the painted map, after the menu has shown
    const s = Math.sqrt(vw * vh / (440 * 290)) * 1.45; // the deepest zoom of the tour
    const R = Math.max(2, Math.min(vw < 700 ? 2.5 : 3.2, s * dpr)); // phones get a smaller canvas (iOS caps canvas memory)
    try { map = paintKaasland({ R, still: true }); mapAt = performance.now(); } catch (e) { console.error(e); }
  }

  // ---- one frame
  function boat(o, t) {
    const [x, y, a] = posOn(o, t); ctx.save(); ctx.translate(x, y); ctx.rotate(a);
    topBoat(ctx, o, t);
    ctx.restore();
  }
  function cyclist(gx, gy, sc, dir, t, coat) { // side view, on the quay
    ctx.save(); ctx.translate(gx, gy); ctx.scale(dir * sc, sc);
    const r = 4.4, cr = t * 9;
    ctx.strokeStyle = '#2e2420'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(-7, -r, r, 0, 7); ctx.arc(7, -r, r, 0, 7); ctx.stroke();
    ctx.beginPath(); for (const wx of [-7, 7]) for (let k = 0; k < 3; k++) { const a = cr + k * 2.1; ctx.moveTo(wx, -r); ctx.lineTo(wx + Math.cos(a) * r, -r + Math.sin(a) * r); } ctx.lineWidth = 0.4; ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-7, -r); ctx.lineTo(-1, -r); ctx.lineTo(5, -10); ctx.lineTo(7, -r); ctx.moveTo(-1, -r); ctx.lineTo(-3, -11); ctx.moveTo(5, -10); ctx.lineTo(5, -13); ctx.lineTo(7, -13.5); ctx.stroke();
    const fx = Math.cos(cr * 0.5) * 2.6, fy = Math.sin(cr * 0.5) * 2.6;
    ctx.strokeStyle = '#3a2c25'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-2.5, -12); ctx.lineTo(-1 + fx * 0.6, -7.5 + fy * 0.3); ctx.lineTo(-1 + fx, -r + fy); ctx.moveTo(-2.5, -12); ctx.lineTo(-1 - fx * 0.6, -7.5 - fy * 0.3); ctx.lineTo(-1 - fx, -r - fy); ctx.stroke();
    ctx.strokeStyle = coat; ctx.lineWidth = 3.2; ctx.beginPath(); ctx.moveTo(-2.5, -12); ctx.lineTo(0.5, -19); ctx.stroke();
    ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(0.5, -18); ctx.lineTo(5, -13.5); ctx.stroke();
    ctx.fillStyle = '#c99872'; ctx.beginPath(); ctx.arc(1.4, -21.6, 2.2, 0, 7); ctx.fill();
    ctx.restore();
  }
  const quayRiders = Array.from({ length: 4 }, (_, i) => ({ p: rand(), v: rr(0.035, 0.06), dir: i % 2 ? 1 : -1, coat: pick([SPICE.paprika, SPICE.saffron, SPICE.cardamom, '#3d5a73', SPICE.turmeric]) }));

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000); last = now;
    const t = (now - t0) / 1000 * (reduce ? 0.25 : 1), tt = t + 6;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // camera
    const [cx0, cy0, z] = tourAt(tt);
    const s = Math.sqrt(vw * vh / (440 * 290)) * z * (1 + 0.03 * Math.sin(t * 0.07));
    const viewH = vh - stripH * 0.55, hw = vw / 2 / s, hh = viewH / 2 / s;
    const cx = hw * 2 >= W ? W / 2 : Math.max(hw, Math.min(W - hw, cx0)), cy = hh * 2 >= H ? H / 2 : Math.max(hh, Math.min(H - hh, cy0));
    ctx.setTransform(dpr * s, 0, 0, dpr * s, dpr * (vw / 2 - cx * s), dpr * (viewH / 2 - cy * s));
    // the map
    const fade = map ? Math.min(1, (now - mapAt) / 1200) : 0;
    if (fade < 1) drawPlaceholder();
    if (map) { ctx.globalAlpha = smooth(fade); ctx.drawImage(map, 0, 0, W, H); ctx.globalAlpha = 1; }
    // water glints
    for (const [gx, gy, ph] of glints) { const a = Math.max(0, Math.sin(t * 1.3 + ph * 3)) ** 6; if (a < 0.05) continue; ctx.fillStyle = `rgba(255,255,255,${(a * 0.9).toFixed(2)})`; ctx.fillRect(gx - 1.6, gy - 0.25, 3.2, 0.5); }
    for (const b of boats) boat(b, t);
    // trams on the Ringweg, bikes everywhere
    for (const tr of trams) { const [x, y, a] = posOn(tr, t); ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = 'rgba(40,30,20,.25)'; ctx.fillRect(-6.5, -0.9, 14, 2.6); ctx.fillStyle = SPICE.turmeric; ctx.fillRect(-7, -1.3, 14, 2.6); ctx.fillStyle = '#5a3a24'; for (let k = -5; k < 6; k += 3.4) ctx.fillRect(k, -1.3, 0.4, 2.6); ctx.restore(); }
    for (const b of bikes) { const [x, y, a] = posOn(b, t); const ox = Math.cos(a + Math.PI / 2) * 0.9, oy = Math.sin(a + Math.PI / 2) * 0.9; ctx.strokeStyle = '#2e2420'; ctx.lineWidth = 0.35; ctx.beginPath(); ctx.moveTo(x + ox - Math.cos(a) * 0.8, y + oy - Math.sin(a) * 0.8); ctx.lineTo(x + ox + Math.cos(a) * 0.8, y + oy + Math.sin(a) * 0.8); ctx.stroke(); ctx.fillStyle = b.coat; ctx.beginPath(); ctx.arc(x + ox, y + oy, 0.48, 0, 7); ctx.fill(); }
    // the windmill's sails
    ctx.save(); ctx.translate(ISLAND.cx, ISLAND.cy); ctx.rotate(0.45 + t * 0.8);
    for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = 'rgba(40,40,30,.22)'; ctx.fillRect(1.6, 1.6, 2.4, 12); ctx.fillStyle = '#f4eddc'; ctx.fillRect(0, 0.4, 2.4, 12); ctx.strokeStyle = '#a99b80'; ctx.lineWidth = 0.2; for (let k = 2; k < 12; k += 1.6) { ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(2.4, k); ctx.stroke(); } ctx.fillStyle = '#6b4a30'; ctx.fillRect(-0.3, 0, 0.6, 12.5); }
    ctx.fillStyle = '#4b3a2c'; ctx.beginPath(); ctx.arc(0, 0, 1.2, 0, 7); ctx.fill();
    ctx.restore();
    // cloud shadows drifting over the city
    for (const c of clouds) { const x = ((c.x + t * c.v) % (W + 400)) - 200, gr = ctx.createRadialGradient(x, c.y, 0, x, c.y, c.r); gr.addColorStop(0, 'rgba(70,45,20,.13)'); gr.addColorStop(1, 'rgba(70,45,20,0)'); ctx.fillStyle = gr; ctx.fillRect(x - c.r, c.y - c.r, c.r * 2, c.r * 2); }

    // ---- screen space: warm light, gulls, the canal-house strip
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const warm = ctx.createLinearGradient(0, 0, 0, vh); warm.addColorStop(0, 'rgba(232,163,61,.16)'); warm.addColorStop(0.5, 'rgba(232,163,61,.04)'); warm.addColorStop(1, 'rgba(181,68,42,.10)');
    ctx.fillStyle = warm; ctx.fillRect(0, 0, vw, vh);
    const vig = ctx.createRadialGradient(vw / 2, viewH * 0.45, Math.min(vw, vh) * 0.35, vw / 2, viewH * 0.45, Math.max(vw, vh) * 0.8); vig.addColorStop(0, 'rgba(59,36,24,0)'); vig.addColorStop(1, 'rgba(59,36,24,.45)');
    ctx.fillStyle = vig; ctx.fillRect(0, 0, vw, vh);
    ctx.strokeStyle = 'rgba(59,36,24,.75)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    for (const g of gulls) { const x = ((g.x + t * g.v) % 1.2 - 0.1) * vw, y = g.y * viewH + Math.sin(t * 0.6 + g.f) * 8, f = Math.sin(t * 5 + g.f) * 4 * g.s, w = 9 * g.s; ctx.beginPath(); ctx.moveTo(x - w, y - f); ctx.quadraticCurveTo(x - w * 0.4, y - 3 * g.s, x, y); ctx.quadraticCurveTo(x + w * 0.4, y - 3 * g.s, x + w, y - f); ctx.stroke(); }
    if (strip) drawStrip(t, dt);
  }

  function drawStrip(t, dt) {
    const { c, tw, th, hF, u } = strip, y0 = vh - hF, waterY = y0 + th, waterH = vh - waterY;
    // a warm haze rises behind the rooftops, so the map melts into sky
    const hz = ctx.createLinearGradient(0, y0 - hF * 0.55, 0, y0 + hF * 0.4); hz.addColorStop(0, 'rgba(243,222,180,0)'); hz.addColorStop(0.65, 'rgba(243,214,160,.85)'); hz.addColorStop(1, 'rgba(240,200,130,1)');
    ctx.fillStyle = hz; ctx.fillRect(0, y0 - hF * 0.55, vw, hF * 0.95 + 2);
    const off = (t * 9) % tw;
    for (let x = -off; x < vw; x += tw) ctx.drawImage(c, x, y0, tw, th);
    // the canal: deep water, a rippled reflection of the houses, light on the surface
    const wg = ctx.createLinearGradient(0, waterY, 0, vh); wg.addColorStop(0, '#5e8f96'); wg.addColorStop(1, '#2f5560');
    ctx.fillStyle = wg; ctx.fillRect(0, waterY, vw, waterH);
    ctx.save(); ctx.globalAlpha = 0.55; const sl = Math.max(3, Math.round(3 * u)), rc = strip.rc;
    for (let yy = 0; yy < waterH; yy += sl) { const dx = Math.sin(t * 1.4 + yy * 0.25) * (0.6 + yy * 0.05) * u; for (let x = -off; x < vw; x += tw) ctx.drawImage(rc, 0, yy * dpr, rc.width, sl * dpr, x + dx, waterY + yy, tw, sl); }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,240,210,.35)'; for (let k = 0; k < 18; k++) { const lx = ((k * 137.5 + t * (6 + k % 3 * 4)) % (vw + 60)) - 30, ly = waterY + 4 + (k * 29 % Math.max(6, waterH - 8)); ctx.fillRect(lx, ly, (8 + k % 4 * 5) * u, Math.max(1, 0.9 * u)); }
    // a boat across the canal: the tour boat one way, a sloep with friends the other
    const bt = (t / 38) % 2, dir = bt < 1 ? 1 : -1, bk = bt % 1, bw = 150 * u, bx = dir > 0 ? lerp(-bw * 1.2, vw + bw * 0.2, bk) : lerp(vw + bw * 0.2, -bw * 1.2, bk), by = waterY + waterH * 0.48;
    ctx.save(); ctx.translate(bx + bw / 2, by); ctx.scale(dir, 1); ctx.translate(-bw / 2, 0);
    const bob = Math.sin(t * 1.6) * 0.8 * u; ctx.translate(0, bob);
    if (bt < 1) { // the rondvaartboot: a long dark hull with a spoon bow, a cream band, a glass house full of heads, the skipper aft
      ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-34 * u, 7 * u, 34 * u, 1.2 * u); ctx.fillRect(-20 * u, 9.5 * u, 22 * u, 0.9 * u);
      ctx.fillStyle = '#24303a'; ctx.beginPath(); ctx.moveTo(-2 * u, -1 * u); ctx.lineTo(bw, -1 * u); ctx.quadraticCurveTo(bw + 13 * u, -1 * u, bw + 15 * u, -5 * u); ctx.quadraticCurveTo(bw + 10 * u, 8 * u, bw - 6 * u, 8 * u); ctx.lineTo(6 * u, 8 * u); ctx.quadraticCurveTo(-3 * u, 7 * u, -2 * u, -1 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = SPICE.cream; ctx.fillRect(-1 * u, -1 * u, bw + 9 * u, 2.2 * u); ctx.fillStyle = SPICE.saffron; ctx.fillRect(16 * u, -5 * u, bw - 26 * u, 1.2 * u);
      ctx.fillStyle = SPICE.cream; ctx.fillRect(16 * u, -4 * u, bw - 26 * u, 3 * u);
      for (let k = 0; k < 9; k++) { const hx = 22 * u + k * (bw - 40 * u) / 8; ctx.fillStyle = ['#3b2418', '#c99872', '#8d5a3a', '#e8c39e'][k % 4]; ctx.beginPath(); ctx.arc(hx, -10 * u, 2.6 * u, 0, 7); ctx.fill(); ctx.fillStyle = [SPICE.paprika, '#3d5a73', SPICE.turmeric, SPICE.cardamom][k % 4]; ctx.fillRect(hx - 3 * u, -7.5 * u, 6 * u, 3 * u); }
      ctx.fillStyle = 'rgba(190,225,235,.32)'; ctx.beginPath(); ctx.moveTo(16 * u, -5 * u); ctx.lineTo(16 * u, -15 * u); ctx.quadraticCurveTo(17 * u, -19 * u, 24 * u, -19 * u); ctx.lineTo(bw - 16 * u, -19 * u); ctx.quadraticCurveTo(bw - 6 * u, -19 * u, bw - 6 * u, -5 * u); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = SPICE.cream; ctx.lineWidth = 1.3 * u; ctx.stroke(); for (let k = 24 * u; k < bw - 14 * u; k += 11 * u) { ctx.beginPath(); ctx.moveTo(k, -5 * u); ctx.lineTo(k, -19 * u); ctx.stroke(); }
      ctx.fillStyle = SPICE.cream; ctx.fillRect(4 * u, -9 * u, 6 * u, 8 * u); ctx.fillStyle = '#c99872'; ctx.beginPath(); ctx.arc(7 * u, -17 * u, 2.6 * u, 0, 7); ctx.fill(); ctx.fillStyle = SPICE.saffron; ctx.fillRect(4.5 * u, -14.5 * u, 5 * u, 6 * u);
      ctx.strokeStyle = '#3b2418'; ctx.lineWidth = 0.8 * u; ctx.beginPath(); ctx.moveTo(0, -1 * u); ctx.lineTo(0, -16 * u); ctx.stroke(); ['#ae1c28', '#ffffff', '#21468b'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-7 * u, (-16 + i * 1.6) * u, 7 * u, 1.6 * u); });
    } else { // the sloep: varnished top strake, friends on the bench, an outboard and the Amsterdam flag
      const sw = 60 * u; ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(-24 * u, 6 * u, 22 * u, 1.2 * u);
      ctx.fillStyle = '#7f9a5a'; ctx.beginPath(); ctx.moveTo(0, -2 * u); ctx.lineTo(sw, -2 * u); ctx.quadraticCurveTo(sw + 10 * u, -2.5 * u, sw + 12 * u, -9 * u); ctx.quadraticCurveTo(sw + 6 * u, 7 * u, sw - 8 * u, 7 * u); ctx.lineTo(3 * u, 7 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#a8693a'; ctx.beginPath(); ctx.moveTo(0, -2 * u); ctx.lineTo(sw, -2 * u); ctx.quadraticCurveTo(sw + 10 * u, -2.5 * u, sw + 12 * u, -9 * u); ctx.lineTo(sw + 11 * u, -5.5 * u); ctx.quadraticCurveTo(sw + 8 * u, 0.6 * u, sw, 0.6 * u); ctx.lineTo(0, 0.6 * u); ctx.closePath(); ctx.fill();
      ctx.fillStyle = SPICE.cream; ctx.fillRect(1 * u, 5 * u, sw, 1.2 * u);
      for (let k = 0; k < 4; k++) { ctx.fillStyle = [SPICE.paprika, SPICE.turmeric, '#3d5a73', SPICE.cumin][k]; ctx.fillRect(10 * u + k * 11 * u, -11 * u, 7 * u, 9 * u); ctx.fillStyle = ['#c99872', '#8d5a3a', '#e8c39e', '#c99872'][k]; ctx.beginPath(); ctx.arc(13.5 * u + k * 11 * u, -14 * u, 3 * u, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#2a2c30'; ctx.beginPath(); ctx.ellipse(-2 * u, -4 * u, 3.5 * u, 3 * u, 0, 0, 7); ctx.fill(); ctx.fillRect(-3 * u, -1 * u, 2 * u, 8 * u); // the outboard
      ctx.strokeStyle = '#f3ece0'; ctx.lineWidth = 0.8 * u; ctx.beginPath(); ctx.moveTo(3 * u, -2 * u); ctx.lineTo(3 * u, -20 * u); ctx.stroke();
      ['#c8102e', '#111111', '#c8102e'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(3 * u, (-20 + i * 1.8) * u, 9 * u, 1.8 * u); }); ctx.fillStyle = '#fff'; for (let k = 0; k < 3; k++) ctx.fillRect(4.6 * u + k * 2.4 * u, -17.6 * u, 1.2 * u, 0.9 * u);
    }
    ctx.restore();
    // cyclists on the quay, in front of the parked bikes
    const qy = y0 + th - 5 * u;
    for (const r of quayRiders) { r.p += r.v * dt * (reduce ? 0.25 : 1) * r.dir; if (r.p > 1.1) r.p = -0.1; if (r.p < -0.1) r.p = 1.1; cyclist(r.p * vw, qy, u * 1.1, r.dir, t, r.coat); }
  }

  resize();
  const onResize = () => { if (!running) return; const s = window.innerWidth + 'x' + window.innerHeight; if (s !== onResize.k) { onResize.k = s; resize(); } };
  window.addEventListener('resize', onResize);
  raf = requestAnimationFrame((now) => { last = now; frame(now); setTimeout(paint, 60); });
  return {
    get ready() { return !!map; },
    stop() { running = false; cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); cv.remove(); map = null; strip = null; },
  };
}
