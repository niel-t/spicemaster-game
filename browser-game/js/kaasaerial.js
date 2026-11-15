// Paints the Map of Kaasland: a clean illustrated city map (kaasgeo.js has the layout). Houses are placed lot by
// lot along the streets so the blocks follow the street pattern: gabled canal houses in Oud-Vettenburg, brick
// terraces on the Kipkruidenkwartier grid, villas in gardens on Hipsterheuvel, long sheds and container yards in
// the docks, flat-roofed courtyard houses in the Paravim's walled desert quarter. Then trees, palms, parks,
// farmland, cranes, boats and the windmill. Seeded, so it looks the same every time.
// Painted once per session into a canvas at R pixels per map unit.
import * as G from './kaasgeo.js';

const { W, H, C0, polar, arc, RIVER, ISLAND, CANALS, BASINS, MARINA, SLOOT, YARDS, SILOS, PARKS, FIELDS, REGIONS, ROADS, HOME, KASBAH, SOUK, inPoly } = G;
const DUNE = [40, 506, 42, 26]; // a sand lot at the edge of De Zandwijk

const PAL = {
  land: '#efe7d6', water: '#94c9d7', shore: '#b6dce6', quay: '#d8ccb2',
  street: '#fffdf8', streetCase: '#d6cbb8', main: '#f8de98', mainCase: '#cfa95f',
  park: '#c2d99d', parkEdge: '#a6c47f', path: '#f6f0e0', pond: '#a5d3de',
  field: ['#ead68f', '#d6dd98', '#c4d68a', '#e7cb83', '#dfe3a8', '#cfd28c'],
  tree: ['#93b86f', '#86ad63', '#9cbf76', '#7ea55c', '#8bb168'],
  ground: { start: '#ebe2cf', lampas: '#e7dfc9', nosh: '#e1e8c9', abd: '#e0ddd4', para: '#ecd9aa' },
  roofs: {
    lampas: ['#c8704c', '#b9603f', '#d3875e', '#a95a3d', '#c97b55', '#9f6a55', '#d79a6c', '#8c6b5c', '#b07a5e'],
    start: ['#bf7a5c', '#b06d52', '#c98a66', '#a76a55', '#cf9a75', '#9a6f5f', '#b98568', '#8f7466'],
    nosh: ['#f1ece2', '#e2dbcd', '#d2c9b8', '#c78e6a', '#5c6b80', '#ece4d4', '#b9a68e', '#e9e1cf'],
    para: ['#ead6a6', '#dfc28c', '#f3e8cc', '#d4b27a', '#e6cb98', '#efdcb2', '#cda26a', '#f6eedb'],
    abd: ['#9fb0b8', '#b6c1c6', '#8b9ea8', '#a7a59b', '#c2c7c6', '#8d9a93', '#b48a70', '#a9b5a2'],
  },
  container: ['#c4604a', '#4a80ad', '#5c9e66', '#dc9a45', '#9aa1a6', '#8b5f8a', '#c9b052'],
};
const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const trace = (ctx, poly, close = true) => { ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); if (close) ctx.closePath(); };
function shade(hex, f) { const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255, c = (v) => Math.max(0, Math.min(255, Math.round(v * f))); return `rgb(${c(r)},${c(g)},${c(b)})`; }

export function paintKaasland({ R = 2.5 } = {}) {
  const rand = rng(1971), pick = (a) => a[Math.floor(rand() * a.length)], rr = (a, b) => a + rand() * (b - a);
  const cv = document.createElement('canvas'); cv.width = Math.round(W * R); cv.height = Math.round(H * R);
  const ctx = cv.getContext('2d'); ctx.scale(R, R); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const parkPolys = PARKS.map((p) => p[1]);
  const inPark = (x, y) => parkPolys.some((p) => inPoly(x, y, p));
  const inBasin = (x, y) => BASINS.some(([bx, by, bw, bh]) => x > bx && x < bx + bw && y > by && y < by + bh) || (x > MARINA[0] && x < MARINA[0] + MARINA[2] && y > MARINA[1] && y < MARINA[1] + MARINA[3]);
  const wet = (x, y) => inPoly(x, y, RIVER) || inBasin(x, y);

  // ---- streets, per district (polylines with a width)
  const streets = [];
  const keepRuns = (pts, ok, w, region) => { let run = []; for (const p of pts) { if (ok(p[0], p[1])) run.push(p); else { if (run.length > 1) streets.push({ pts: run, w, region }); run = []; } } if (run.length > 1) streets.push({ pts: run, w, region }); };
  const line = (a, b, step = 2) => { const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); return Array.from({ length: n + 1 }, (_, i) => [a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };
  // Oud-Vettenburg: streets on both quays of every canal, radial streets, an inner ring and crooked alleys in the core
  const inOld = (x, y) => Math.hypot(x - C0[0], y - C0[1]) < 258 && y > C0[1] + 2;
  for (const r of CANALS) for (const s of [-7.5, 7.5]) keepRuns(arc(3, 177, r + s, 1.5), inOld, 3, 'lampas');
  keepRuns(arc(4, 176, 62, 2), inOld, 2.6, 'lampas');
  for (let a = 5; a < 178; a += 7.5) { if (rand() < 0.22) continue; keepRuns(line(polar(a, a % 15 < 7.5 ? 22 : 64), polar(a, 258)), inOld, 2.6, 'lampas'); }
  for (let i = 0; i < 12; i++) { let p = polar(rr(15, 165), rr(18, 40)), h = rr(0, Math.PI * 2); const pts = [p]; for (let k = 0; k < 7; k++) { h += rr(-0.7, 0.7); p = [p[0] + Math.cos(h) * 6, p[1] + Math.sin(h) * 6]; pts.push(p); } keepRuns(pts, (x, y) => inOld(x, y) && Math.hypot(x - C0[0], y - C0[1]) < 95, 2, 'lampas'); }
  // Kipkruidenkwartier: a grid at an angle
  const grid = (cx, cy, ang, su, sv, ext, ok, w, region) => {
    const ca = Math.cos(ang), sa = Math.sin(ang), to = (u, v) => [cx + u * ca - v * sa, cy + u * sa + v * ca];
    for (let v = -ext; v <= ext; v += sv) keepRuns(line(to(-ext, v), to(ext, v)), ok, w, region);
    for (let u = -ext; u <= ext; u += su) keepRuns(line(to(u, -ext), to(u, ext)), ok, w, region);
  };
  const okStart = (x, y) => inPoly(x, y, REGIONS.start) && Math.hypot(x - C0[0], y - C0[1]) > 268 && !inPark(x, y) && !wet(x, y);
  grid(330, 600, -12 * Math.PI / 180, 26, 18, 460, okStart, 3, 'start');
  // Hipsterheuvel: winding lanes and cross streets, farmland further east
  const okNosh = (x, y) => inPoly(x, y, REGIONS.nosh) && x < 885 && !inPark(x, y) && !wet(x, y) && y < G.NORTH_BANK.reduce((m, [bx, by], i, a) => (i && x >= a[i - 1][0] && x <= bx ? a[i - 1][1] + (by - a[i - 1][1]) * (x - a[i - 1][0]) / (bx - a[i - 1][0]) : m), 230) - 3;
  for (let k = 0; k < 9; k++) { const y0 = 18 + k * 25, ph = rand() * 6; const pts = []; for (let x = -10; x <= 900; x += 3) pts.push([x, y0 + 6 * Math.sin(x / 55 + ph) + 3 * Math.sin(x / 21 + ph * 2)]); keepRuns(pts, okNosh, 2.8, 'nosh'); }
  for (let x = 20; x < 890; x += rr(38, 62)) { const pts = [], ph = rand() * 6; for (let y = -10; y < 250; y += 3) pts.push([x + 7 * Math.sin(y / 30 + ph), y]); keepRuns(pts, okNosh, 2.6, 'nosh'); }
  const tracks = [];
  { const okF = (x, y) => inPoly(x, y, FIELDS) && !wet(x, y); const a = 8 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    for (let v = -200; v < 200; v += 34) { const pts = line([1050 - 300 * ca - v * sa, 80 - 300 * sa + v * ca], [1050 + 300 * ca - v * sa, 80 + 300 * sa + v * ca]); let run = []; for (const p of pts) { if (okF(p[0], p[1])) run.push(p); else { if (run.length > 1) tracks.push(run); run = []; } } if (run.length > 1) tracks.push(run); } }
  // De Duistere Dokken: wide truck roads on a straight grid
  const inYard = (x, y) => YARDS.some(([yx, yy, yw, yh]) => x > yx - 2 && x < yx + yw + 2 && y > yy - 2 && y < yy + yh + 2);
  const okAbd = (x, y) => inPoly(x, y, REGIONS.abd) && Math.hypot(x - C0[0], y - C0[1]) > 270 && !wet(x, y) && !inYard(x, y);
  grid(1000, 560, 0, 46, 36, 420, okAbd, 3.6, 'abd');
  // De Zandwijk: a maze of crooked alleys that stop and start, and the souk street through the middle
  const inKasbah = (x, y) => Math.abs(x - KASBAH.cx) < KASBAH.s / 2 + 5 && Math.abs(y - KASBAH.cy) < KASBAH.s / 2 + 5;
  const inDune = (x, y) => ((x - DUNE[0]) / DUNE[2]) ** 2 + ((y - DUNE[1]) / DUNE[3]) ** 2 < 1.1;
  const okPara = (x, y) => inPoly(x, y, REGIONS.para) && !inPark(x, y) && !wet(x, y) && !inKasbah(x, y) && !inDune(x, y);
  { const a = 18 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), to = (u, v) => [190 + u * ca - v * sa, 425 + u * sa + v * ca];
    const alley = (fixed, along) => { const ph = rand() * 6; let on = rand() < 0.8, run = []; for (let k = -230; k <= 230; k += 2) { const wob = 2.2 * Math.sin(k / 9 + ph) + 1.1 * Math.sin(k / 4.1 + ph * 2), p = along ? to(fixed + wob, k) : to(k, fixed + wob); if (rand() < 0.03) on = !on; if (on) run.push(p); else { if (run.length > 1) keepRuns(run, okPara, 2, 'para'); run = []; } } if (run.length > 1) keepRuns(run, okPara, 2, 'para'); };
    for (let v = -200; v <= 200; v += 12) alley(v, false);
    for (let u = -230; u <= 230; u += 15) alley(u, true); }
  keepRuns(SOUK.flatMap((p, i) => (i ? line(SOUK[i - 1], p, 1.5).slice(1) : [p])), (x, y) => inPoly(x, y, REGIONS.para), 3.4, 'para');

  // ---- where nothing may be built: water, streets, parks, fields, yards (an occupancy mask at M px per unit)
  const M = 2, MW = W * M, MH = H * M, mk = document.createElement('canvas'); mk.width = MW; mk.height = MH;
  const m = mk.getContext('2d'); m.scale(M, M); m.fillStyle = '#000'; m.strokeStyle = '#000'; m.lineCap = 'round'; m.lineJoin = 'round';
  trace(m, RIVER); m.fill(); for (const [x, y, w, h] of [...BASINS, MARINA, ...YARDS]) m.fillRect(x, y, w, h);
  m.beginPath(); m.ellipse(ISLAND.cx, ISLAND.cy, ISLAND.rx + 2, ISLAND.ry + 2, 0, 0, 7); m.fill();
  for (const r of CANALS) { trace(m, arc(0, 180, r, 1.5), false); m.lineWidth = 9.5; m.stroke(); }
  trace(m, SLOOT, false); m.lineWidth = 9; m.stroke();
  for (const p of parkPolys) { trace(m, p); m.fill(); }
  trace(m, FIELDS); m.fill();
  for (const s of streets) { trace(m, s.pts, false); m.lineWidth = s.w + (s.region === 'nosh' ? 6 : s.region === 'abd' ? 3 : s.region === 'start' ? 2.2 : s.region === 'para' ? 0.6 : 1); m.stroke(); }
  for (const r of ROADS) { trace(m, r.pts, false); m.lineWidth = r.ring ? 10 : 8; m.stroke(); }
  m.beginPath(); m.arc(600, 352, 15, 0, 7); m.fill(); // the market square
  m.beginPath(); m.arc(SILOS[0], SILOS[1], 16, 0, 7); m.fill();
  m.save(); m.translate(HOME[0], HOME[1]); m.rotate(-12 * Math.PI / 180); m.fillRect(-12, -9, 24, 18); m.restore(); // the warehouse
  m.beginPath(); m.arc(362, 300, 18, 0, 7); m.fill(); // the fort
  m.fillRect(KASBAH.cx - KASBAH.s / 2 - 3, KASBAH.cy - KASBAH.s / 2 - 3, KASBAH.s + 6, KASBAH.s + 6); // the kasbah
  m.beginPath(); m.ellipse(DUNE[0], DUNE[1], DUNE[2], DUNE[3], 0, 0, 7); m.fill();
  const md = m.getImageData(0, 0, MW, MH).data, occ = new Uint8Array(MW * MH);
  for (let i = 0; i < occ.length; i++) occ[i] = md[i * 4 + 3] > 20 ? 1 : 0;
  const free = (x, y) => { const i = Math.floor(x * M), j = Math.floor(y * M); return i >= 0 && j >= 0 && i < MW && j < MH && !occ[j * MW + i]; };
  const take = (x, y) => { const i = Math.floor(x * M), j = Math.floor(y * M); if (i >= 0 && j >= 0 && i < MW && j < MH) occ[j * MW + i] = 1; };

  // ---- ground
  ctx.fillStyle = PAL.land; ctx.fillRect(0, 0, W, H);
  for (const [r, poly] of Object.entries(REGIONS)) { trace(ctx, poly); ctx.fillStyle = PAL.ground[r]; ctx.fill(); }
  // farmland
  ctx.save(); trace(ctx, FIELDS); ctx.clip();
  { const a = 8 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    for (let u = -300; u < 300; u += 50) for (let v = -200; v < 200; v += 34) {
      const corner = (du, dv) => [1050 + (u + du) * ca - (v + dv) * sa, 80 + (u + du) * sa + (v + dv) * ca];
      const q = [corner(0, 0), corner(50, 0), corner(50, 34), corner(0, 34)], col = pick(PAL.field);
      trace(ctx, q); ctx.fillStyle = col; ctx.fill();
      ctx.save(); trace(ctx, q); ctx.clip(); ctx.strokeStyle = shade(col, 0.93); ctx.lineWidth = 0.5; const along = rand() < 0.5;
      for (let k = 0; k < 50; k += 2.2) { const p0 = along ? corner(k, 0) : corner(0, k * 0.68), p1 = along ? corner(k, 34) : corner(50, k * 0.68); ctx.beginPath(); ctx.moveTo(...p0); ctx.lineTo(...p1); ctx.stroke(); }
      ctx.restore();
    } }
  ctx.strokeStyle = '#efe4c4'; ctx.lineWidth = 2; for (const t of tracks) { trace(ctx, t, false); ctx.stroke(); }
  ctx.restore();
  // parks
  for (const [, poly, pond] of PARKS) {
    trace(ctx, poly); ctx.fillStyle = PAL.park; ctx.fill(); ctx.strokeStyle = PAL.parkEdge; ctx.lineWidth = 1.2; ctx.stroke();
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, rx = (Math.max(...xs) - Math.min(...xs)) / 2, ry = (Math.max(...ys) - Math.min(...ys)) / 2;
    ctx.save(); trace(ctx, poly); ctx.clip();
    ctx.strokeStyle = PAL.path; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.ellipse(cx, cy, rx * 0.62, ry * 0.55, 0.25, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - rx, cy + ry * 0.2); ctx.quadraticCurveTo(cx, cy - ry * 0.4, cx + rx, cy + ry * 0.1); ctx.stroke();
    if (pond) { ctx.beginPath(); ctx.ellipse(cx + rx * 0.2, cy + ry * 0.1, rx * 0.22, ry * 0.2, 0.4, 0, 7); ctx.fillStyle = PAL.pond; ctx.fill(); ctx.strokeStyle = '#8fc0cc'; ctx.lineWidth = 0.6; ctx.stroke(); }
    ctx.restore();
  }
  // yards
  for (const [x, y, w, h] of YARDS) { ctx.fillStyle = '#d3cdc0'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#bdb6a6'; ctx.lineWidth = 0.6; ctx.strokeRect(x, y, w, h); }

  // ---- water
  const water = (fn) => { fn(); ctx.fillStyle = PAL.water; ctx.fill(); };
  water(() => trace(ctx, RIVER));
  ctx.save(); trace(ctx, RIVER); ctx.clip();
  for (const bank of [G.NORTH_BANK, G.SOUTH_BANK]) { trace(ctx, bank, false); ctx.strokeStyle = 'rgba(182,220,230,.8)'; ctx.lineWidth = 7; ctx.stroke(); ctx.strokeStyle = '#cbe7ee'; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 0.5;
  for (let i = 0; i < 260; i++) { const x = rand() * W, y = rr(150, 320), l = rr(2, 5); ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 0.7, x + l, y); ctx.stroke(); }
  ctx.restore();
  for (const [x, y, w, h] of [...BASINS, MARINA]) { ctx.fillStyle = PAL.water; ctx.fillRect(x, y, w, h); ctx.strokeStyle = PAL.quay; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + 4); ctx.stroke(); }
  for (const r of CANALS) { trace(ctx, arc(0, 180, r, 1.5), false); ctx.strokeStyle = PAL.quay; ctx.lineWidth = 9; ctx.stroke(); ctx.strokeStyle = PAL.water; ctx.lineWidth = 6.5; ctx.stroke(); }
  trace(ctx, SLOOT, false); ctx.strokeStyle = PAL.quay; ctx.lineWidth = 8; ctx.stroke(); ctx.strokeStyle = '#86b9c4'; ctx.lineWidth = 5.5; ctx.stroke();
  // the windmill island
  ctx.beginPath(); ctx.ellipse(ISLAND.cx, ISLAND.cy, ISLAND.rx, ISLAND.ry, 0, 0, 7); ctx.fillStyle = '#e6d9b4'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(ISLAND.cx, ISLAND.cy, ISLAND.rx - 3, ISLAND.ry - 3, 0, 0, 7); ctx.fillStyle = PAL.park; ctx.fill();
  ctx.strokeStyle = PAL.path; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.ellipse(ISLAND.cx, ISLAND.cy, 12, 7, 0, 0, 7); ctx.stroke();
  ctx.strokeStyle = '#a08d70'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(ISLAND.cx - ISLAND.rx + 2, ISLAND.cy + 4); ctx.lineTo(ISLAND.cx - ISLAND.rx - 8, ISLAND.cy + 6); ctx.stroke(); // jetty

  // ---- streets: casings first, then the white tops; main roads on top in yellow
  const strokeAll = (list, color, extra, sand) => { for (const s of list) { ctx.strokeStyle = s.region === 'para' ? sand : color; trace(ctx, s.pts, false); ctx.lineWidth = s.w + extra; ctx.stroke(); } };
  strokeAll(streets, PAL.streetCase, 1.1, '#d3b980'); strokeAll(streets, PAL.street, 0, '#f6ead0'); // sandy alleys in De Zandwijk
  ctx.strokeStyle = PAL.streetCase; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.arc(600, 352, 14, 0, 7); ctx.fillStyle = '#efe5cf'; ctx.fill(); ctx.stroke(); // market square
  for (const r of ROADS.filter((x) => x.bridge)) { trace(ctx, r.pts.map(([x, y]) => [x + 1.4, y + 1.8]), false); ctx.strokeStyle = 'rgba(40,80,95,.25)'; ctx.lineWidth = 7; ctx.stroke(); }
  for (const r of ROADS) { trace(ctx, r.pts, false); ctx.strokeStyle = r.bridge ? '#a89a80' : PAL.mainCase; ctx.lineWidth = r.ring ? 8.2 : 6.6; ctx.stroke(); }
  for (const r of ROADS) { trace(ctx, r.pts, false); ctx.strokeStyle = PAL.main; ctx.lineWidth = r.ring ? 6.6 : 5; ctx.stroke(); }
  ctx.setLineDash([2.2, 2.2]); ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 0.45; for (const r of ROADS.filter((x) => x.ring)) { trace(ctx, r.pts, false); ctx.stroke(); } ctx.setLineDash([]);

  // ---- buildings, lot by lot along the streets
  const palm = (x, y, r) => { // a date palm from above: fronds around a dark crown
    ctx.fillStyle = 'rgba(70,55,30,.25)'; ctx.beginPath(); ctx.arc(x + r * 0.6, y + r * 0.7, r * 1.1, 0, 7); ctx.fill();
    const a0 = rand() * 6; for (let i = 0; i < 7; i++) { const a = a0 + i / 7 * Math.PI * 2; ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = i % 2 ? '#6f9a45' : '#5d8a3a'; ctx.beginPath(); ctx.ellipse(r * 0.75, 0, r * 0.8, r * 0.24, 0, 0, 7); ctx.fill(); ctx.restore(); }
    ctx.fillStyle = '#7a6440'; ctx.beginPath(); ctx.arc(x, y, r * 0.22, 0, 7); ctx.fill();
  };
  const house = (c, t, n, w, d, col, kind) => {
    const P = (u, v) => [c[0] + t[0] * u + n[0] * v, c[1] + t[1] * u + n[1] * v], q = [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)];
    trace(ctx, q.map(([x, y]) => [x + 0.6, y + 0.8])); ctx.fillStyle = 'rgba(70,52,34,.22)'; ctx.fill();
    trace(ctx, q); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = shade(col, 0.87);
    if (kind === 'gable') trace(ctx, [P(0, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(0, d / 2)]); // ridge runs back from the street
    else trace(ctx, [P(-w / 2, 0), P(w / 2, 0), P(w / 2, d / 2), P(-w / 2, d / 2)]);
    if (kind !== 'flat' && kind !== 'court' && kind !== 'cube') ctx.fill();
    if (kind === 'court' && w > 4.6 && d > 4.6) { trace(ctx, [P(-w * 0.22, -d * 0.22), P(w * 0.22, -d * 0.22), P(w * 0.22, d * 0.22), P(-w * 0.22, d * 0.22)]); ctx.fillStyle = shade(col, 1.07); ctx.fill(); ctx.strokeStyle = shade(col, 0.8); ctx.lineWidth = 0.25; ctx.stroke(); if (rand() < 0.35) { const [x, y] = P(0, 0); palm(x, y, 1.2); } }
    if (kind === 'cube' || kind === 'court') { trace(ctx, [P(w / 2 - 1.3, -d / 2 + 0.3), P(w / 2 - 0.3, -d / 2 + 0.3), P(w / 2 - 0.3, -d / 2 + 1.3), P(w / 2 - 1.3, -d / 2 + 1.3)]); ctx.fillStyle = shade(col, 0.82); ctx.fill(); }
    if (kind === 'shed') { ctx.strokeStyle = shade(col, 0.82); ctx.lineWidth = 0.18; for (let u = -w / 2 + 1.2; u < w / 2; u += 1.2) { ctx.beginPath(); ctx.moveTo(...P(u, -d / 2)); ctx.lineTo(...P(u, d / 2)); ctx.stroke(); } }
    trace(ctx, q); ctx.strokeStyle = shade(col, 0.72); ctx.lineWidth = 0.22; ctx.stroke();
  };
  const fits = (c, t, n, w, d) => { for (let u = -w / 2 + 0.45; u <= w / 2 - 0.45; u += 0.5) for (let v = -d / 2 + 0.45; v <= d / 2 - 0.45; v += 0.5) if (!free(c[0] + t[0] * u + n[0] * v, c[1] + t[1] * u + n[1] * v)) return false; return true; };
  const claim = (c, t, n, w, d) => { for (let u = -w / 2 + 0.25; u <= w / 2 - 0.25; u += 0.4) for (let v = -d / 2 + 0.25; v <= d / 2 - 0.25; v += 0.4) take(c[0] + t[0] * u + n[0] * v, c[1] + t[1] * u + n[1] * v); };
  const LOT = {
    lampas: { w: [2.8, 4.6], d: [8, 12], set: 0.5, gap: [0, 0.15], skip: 0.03, kind: 'gable' },
    start: { w: [4, 6.5], d: [5, 6.5], set: 1.5, gap: [0, 0.35], skip: 0.03, kind: 'ridge' },
    nosh: { w: [5.5, 9], d: [5.5, 8.5], set: 4.5, gap: [3, 9], skip: 0.18, kind: 'ridge' },
    abd: { w: [10, 26], d: [8, 12.5], set: 2, gap: [1.5, 4], skip: 0.08, kind: 'shed' },
    para: { w: [4.5, 7.5], d: [4.5, 7], set: 0.4, gap: [0, 0.25], skip: 0.04, kind: 'court' },
  };
  const stats = {};
  // two passes: full-size lots first, then smaller ones fill the gaps
  const FILL = { para: { w: [2.6, 4], d: [2.6, 4], set: 0.4, gap: [0, 0.2], skip: 0, kind: 'cube' }, lampas: { w: [2.4, 3.4], d: [5, 7.5], set: 0.5, gap: [0, 0.1], skip: 0, kind: 'gable' }, abd: { w: [6, 12], d: [5, 8], set: 2, gap: [1, 3], skip: 0.1, kind: 'shed' }, start: LOT.start, nosh: { ...LOT.nosh, skip: 0.5 } };
  for (const pass of [LOT, FILL]) for (const s of streets) {
    const L = pass[s.region], st = stats[s.region] = stats[s.region] || { try: 0, ok: 0, region: 0, fit: 0 }, cum = [0]; for (let i = 1; i < s.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1]));
    const total = cum[cum.length - 1];
    const at = (d) => { let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const a = s.pts[i - 1], b = s.pts[i], f = (d - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]), len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [[a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], [(b[0] - a[0]) / len, (b[1] - a[1]) / len]]; };
    for (const side of [-1, 1]) for (let d = rand() * 3; d < total - 1;) {
      const w = rr(...L.w), dep = rr(...L.d);
      if (rand() < L.skip) { d += w; continue; }
      const [p, t] = at(Math.min(total, d + w / 2)), n = [-t[1] * side, t[0] * side], off = s.w / 2 + L.set + dep / 2, c = [p[0] + n[0] * off, p[1] + n[1] * off];
      st.try++; const inR = inPoly(c[0], c[1], REGIONS[s.region]); if (!inR) st.region++; const fit = inR && fits(c, t, n, w, dep); if (inR && !fit) st.fit++; if (fit) st.ok++;
      if (fit) { house(c, t, n, w, dep, pick(PAL.roofs[s.region]), s.region === 'nosh' && rand() < 0.2 ? 'flat' : L.kind); claim(c, t, n, w, dep); if (s.region === 'nosh' && rand() < 0.15) { ctx.fillStyle = '#7fd0e0'; const pc = [c[0] + n[0] * (dep / 2 + 2.4), c[1] + n[1] * (dep / 2 + 2.4)]; ctx.fillRect(pc[0] - 1.3, pc[1] - 0.8, 2.6, 1.6); } }
      d += w + rr(...L.gap);
    }
  }
  // the Eddy & Zn warehouse: a big saffron roof
  { const a = -12 * Math.PI / 180, t = [Math.cos(a), Math.sin(a)], n = [-t[1], t[0]]; house(HOME, t, n, 20, 13, '#e8a33d', 'ridge'); ctx.fillStyle = '#2f6fb5'; ctx.save(); ctx.translate(HOME[0] + 2, HOME[1] + 10); ctx.rotate(a); ctx.fillRect(-2, -0.9, 4, 1.8); ctx.restore(); }
  // Sharma al Gara's kasbah: thick walls, four round towers, a courtyard with a well and the keep
  { const { cx, cy, s: S } = KASBAH, h = S / 2;
    ctx.fillStyle = 'rgba(70,50,25,.3)'; ctx.fillRect(cx - h + 1.5, cy - h + 2, S, S);
    ctx.fillStyle = '#c99a5e'; ctx.fillRect(cx - h, cy - h, S, S); ctx.fillStyle = '#ead3a2'; ctx.fillRect(cx - h + 4, cy - h + 4, S - 8, S - 8);
    ctx.strokeStyle = '#9e7340'; ctx.lineWidth = 0.5; ctx.strokeRect(cx - h, cy - h, S, S); ctx.strokeRect(cx - h + 4, cy - h + 4, S - 8, S - 8);
    ctx.setLineDash([1.2, 1.2]); ctx.strokeStyle = '#a97b45'; ctx.lineWidth = 0.9; ctx.strokeRect(cx - h + 1.2, cy - h + 1.2, S - 2.4, S - 2.4); ctx.setLineDash([]); // crenellations
    for (const [dx, dy] of [[-h, -h], [h, -h], [h, h], [-h, h]]) { ctx.fillStyle = 'rgba(70,50,25,.3)'; ctx.beginPath(); ctx.arc(cx + dx + 1, cy + dy + 1.3, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#b8864b'; ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 5, 0, 7); ctx.fill(); ctx.fillStyle = '#d4a86c'; ctx.beginPath(); ctx.arc(cx + dx - 0.8, cy + dy - 0.8, 2.6, 0, 7); ctx.fill(); }
    ctx.fillStyle = 'rgba(70,50,25,.3)'; ctx.fillRect(cx - 5 + 1, cy - 7 + 1.4, 10, 10); ctx.fillStyle = '#b07a44'; ctx.fillRect(cx - 5, cy - 7, 10, 10); ctx.fillStyle = '#c28b52'; ctx.fillRect(cx - 5, cy - 7, 10, 5);
    ctx.fillStyle = '#4a7fa0'; ctx.beginPath(); ctx.arc(cx + 6, cy + 7, 1.8, 0, 7); ctx.fill(); // the well
    ctx.fillStyle = '#5b4026'; ctx.fillRect(cx + h - 1, cy + 2, 2, 5); // the gate
    ctx.strokeStyle = '#4b3a2c'; ctx.lineWidth = 0.4; ctx.beginPath(); ctx.moveTo(cx - h, cy - h); ctx.lineTo(cx - h, cy - h - 6); ctx.stroke(); ctx.fillStyle = '#b8322a'; ctx.fillRect(cx - h, cy - h - 6, 4, 2.4); // the Paravim flag
    for (const [dx, dy] of [[-8, 8], [-2, 9], [9, -6], [-9, -2]]) palm(cx + dx, cy + dy, 1.6); }
  // the souk: striped awnings along the market street
  { const cols = ['#c4473a', '#e09a3c', '#2f7d7a', '#efe2c4', '#8a3b5c'];
    for (let i = 1; i < SOUK.length; i++) { const [a, b] = [SOUK[i - 1], SOUK[i]], len = Math.hypot(b[0] - a[0], b[1] - a[1]), t = [(b[0] - a[0]) / len, (b[1] - a[1]) / len], n = [-t[1], t[0]];
      for (let d = 1; d < len - 1; d += 2.6) for (const side of [-1, 1]) { const c = [a[0] + t[0] * d + n[0] * side * 2.9, a[1] + t[1] * d + n[1] * side * 2.9], col = pick(cols); ctx.save(); ctx.translate(...c); ctx.rotate(Math.atan2(t[1], t[0])); ctx.fillStyle = 'rgba(70,50,25,.25)'; ctx.fillRect(-1 + 0.4, -0.8 + 0.5, 2.2, 1.6); ctx.fillStyle = col; ctx.fillRect(-1, -0.8, 2.2, 1.6); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(-1, -0.8, 0.55, 1.6); ctx.fillRect(0.1, -0.8, 0.55, 1.6); ctx.restore(); } } }
  // a sand lot with wind ripples
  { const [x, y, rx, ry] = DUNE; ctx.save(); ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 7); ctx.fillStyle = '#efd9a2'; ctx.fill(); ctx.clip(); ctx.strokeStyle = 'rgba(190,150,90,.45)'; ctx.lineWidth = 0.45; for (let k = -ry; k < ry; k += 2.4) { ctx.beginPath(); for (let u = -rx; u <= rx; u += 2) ctx[u === -rx ? 'moveTo' : 'lineTo'](x + u, y + k + 1.2 * Math.sin(u / 5 + k)); ctx.stroke(); } ctx.restore(); }
  // the fort on the pier (Pindasausplein)
  { const pts = []; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r = i % 2 ? 9 : 16; pts.push([362 + Math.cos(a) * r, 300 + Math.sin(a) * r * 0.8]); }
    trace(ctx, pts.map(([x, y]) => [x + 0.8, y + 1])); ctx.fillStyle = 'rgba(40,60,70,.25)'; ctx.fill(); trace(ctx, pts); ctx.fillStyle = '#cdbd9c'; ctx.fill(); ctx.strokeStyle = '#9b8a6a'; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.fillStyle = '#b55f42'; ctx.fillRect(357, 296, 10, 7); }
  // container stacks, silos, tanks
  for (const [x, y, w, h] of YARDS) for (let yy = y + 2; yy < y + h - 2; yy += 3.4) for (let xx = x + 2; xx < x + w - 3; xx += 3.1) if (rand() < 0.86) { ctx.fillStyle = 'rgba(60,50,40,.25)'; ctx.fillRect(xx + 0.4, yy + 0.5, 2.8, 1.25); ctx.fillStyle = pick(PAL.container); ctx.fillRect(xx, yy, 2.8, 1.25); ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.fillRect(xx, yy, 2.8, 0.35); }
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, x = SILOS[0] + Math.cos(a) * 8, y = SILOS[1] + Math.sin(a) * 8; ctx.fillStyle = 'rgba(60,50,40,.3)'; ctx.beginPath(); ctx.arc(x + 0.8, y + 1, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#c98a5a'; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); ctx.fillStyle = '#d9a274'; ctx.beginPath(); ctx.arc(x - 0.8, y - 0.8, 2.2, 0, 7); ctx.fill(); }
  // cranes along the basins, and a ship in the long basin
  for (const [x, y, w, h] of BASINS) for (const side of [0, 1]) for (let yy = y + 14; yy < y + h - 4; yy += 24) {
    const qx = side ? x + w + 2.5 : x - 2.5, dir = side ? -1 : 1;
    ctx.fillStyle = 'rgba(40,40,40,.25)'; ctx.fillRect(qx - 2 + 1, yy - 2.5 + 1.2, 4, 5);
    ctx.fillStyle = '#d0613f'; ctx.fillRect(qx - 2, yy - 2.5, 4, 5);
    ctx.strokeStyle = '#a84a30'; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(qx, yy); ctx.lineTo(qx + dir * 11, yy); ctx.stroke();
  }
  { const [bx, by, bw, bh] = BASINS[1]; ctx.fillStyle = 'rgba(30,60,70,.3)'; ctx.fillRect(bx + 6, by + 40, bw - 10, 120); ctx.fillStyle = '#7a3a2e'; ctx.fillRect(bx + 5, by + 38, bw - 10, 120); for (let yy = by + 46; yy < by + 150; yy += 3.2) for (let xx = bx + 7; xx < bx + bw - 7; xx += 3) { ctx.fillStyle = pick(PAL.container); ctx.fillRect(xx, yy, 2.7, 2.8); } ctx.fillStyle = '#f2eee6'; ctx.fillRect(bx + 7, by + 150, bw - 14, 6); }

  // ---- trees
  const tree = (x, y, r) => { ctx.fillStyle = 'rgba(60,72,40,.22)'; ctx.beginPath(); ctx.arc(x + r * 0.35, y + r * 0.45, r, 0, 7); ctx.fill(); ctx.fillStyle = pick(PAL.tree); ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,230,.16)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.32, r * 0.5, 0, 7); ctx.fill(); };
  for (const r of CANALS) for (const s of [-4.6, 4.6]) { const pts = arc(4, 176, r + s, 360 * 2.7 / (2 * Math.PI * (r + s))); for (const [x, y] of pts) if (y > C0[1] + 3) tree(x, y, rr(1.1, 1.45)); }
  for (const [, poly] of PARKS) { const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]); for (let c = 0; c < 9; c++) { const cx = rr(Math.min(...xs), Math.max(...xs)), cy = rr(Math.min(...ys), Math.max(...ys)); for (let i = 0; i < 16; i++) { const x = cx + rr(-9, 9), y = cy + rr(-6, 6); if (inPoly(x, y, poly)) (inPoly(x, y, REGIONS.para) ? palm(x, y, rr(1.4, 2)) : tree(x, y, rr(1.3, 2.4))); } } }
  const scatter = (n, region, prob, r0, r1, extra = () => true, draw = tree) => { for (let i = 0; i < n; i++) { const x = rand() * W, y = rand() * H; if (rand() < prob && free(x, y) && free(x + r1, y) && free(x - r1, y) && inPoly(x, y, REGIONS[region]) && extra(x, y)) { draw(x, y, rr(r0, r1)); take(x, y); } } };
  scatter(26000, 'nosh', 0.6, 1.2, 2.3, (x) => x < 885);
  scatter(14000, 'lampas', 0.5, 0.9, 1.3);
  scatter(18000, 'start', 0.45, 1, 1.6);
  scatter(9000, 'abd', 0.25, 1, 1.5);
  scatter(9000, 'para', 0.4, 1.2, 1.8, () => true, palm);
  for (let i = 0; i < SOUK.length; i++) palm(SOUK[i][0], SOUK[i][1] - 5, 1.5);
  for (const t of tracks) for (let i = 0; i < t.length; i += 4) if (rand() < 0.5) tree(t[i][0] + 2, t[i][1] + 2, rr(1, 1.6));
  for (let i = 0; i < 26; i++) { const a = rand() * Math.PI * 2, x = ISLAND.cx + Math.cos(a) * rr(16, 30), y = ISLAND.cy + Math.sin(a) * rr(9, 15); tree(x, y, rr(1.2, 2)); }

  // ---- the windmill
  ctx.save(); ctx.translate(ISLAND.cx, ISLAND.cy);
  ctx.fillStyle = 'rgba(40,40,30,.3)'; ctx.beginPath(); ctx.arc(1.2, 1.6, 4.6, 0, 7); ctx.fill();
  ctx.fillStyle = '#7a5236'; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx[i ? 'lineTo' : 'moveTo'](Math.cos(a) * 4.4, Math.sin(a) * 4.4); } ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4b3a2c'; ctx.beginPath(); ctx.arc(0, 0, 2.2, 0, 7); ctx.fill();
  ctx.rotate(0.45);
  for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = 'rgba(40,40,30,.25)'; ctx.fillRect(1.2, 1.2, 2.4, 12); ctx.fillStyle = '#f4eddc'; ctx.fillRect(0, 0.4, 2.4, 12); ctx.strokeStyle = '#a99b80'; ctx.lineWidth = 0.2; for (let k = 2; k < 12; k += 1.6) { ctx.beginPath(); ctx.moveTo(0, k); ctx.lineTo(2.4, k); ctx.stroke(); } ctx.fillStyle = '#6b4a30'; ctx.fillRect(-0.3, 0, 0.6, 12.5); }
  ctx.restore();

  // ---- boats
  const boat = (x, y, l, wd, ang, hull, deck) => { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-l * 0.75, 0, l * 0.55, wd * 0.35, 0, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(30,60,70,.25)'; ctx.beginPath(); ctx.ellipse(0.8, 1, l / 2, wd / 2, 0, 0, 7); ctx.fill(); ctx.fillStyle = hull; ctx.beginPath(); ctx.moveTo(l / 2, 0); ctx.quadraticCurveTo(l * 0.35, -wd / 2, -l / 2, -wd / 2); ctx.lineTo(-l / 2, wd / 2); ctx.quadraticCurveTo(l * 0.35, wd / 2, l / 2, 0); ctx.fill(); if (deck) { ctx.fillStyle = deck; ctx.fillRect(-l * 0.38, -wd * 0.3, l * 0.6, wd * 0.6); } ctx.restore(); };
  for (const [x, y, a] of [[90, 268, 0.04], [470, 276, -0.05], [700, 278, 0.02], [830, 262, -0.4], [260, 262, 0.05]]) boat(x, y, 20, 4.5, a, '#5c4a3c', '#3f5560');
  for (const [x, y, a] of [[1080, 205, 0.6], [1135, 190, 2.4], [955, 225, -0.3], [1170, 240, 1.2], [1050, 270, 3]]) boat(x, y, 6, 2.2, a, '#fbf8f0', '#d7c7a6');
  for (let i = 0; i < 14; i++) boat(MARINA[0] + 6 + (i % 7) * 7.5, MARINA[1] + 10 + Math.floor(i / 7) * 20, 5, 2, Math.PI / 2, '#fbf8f0', '#c8d6de');
  for (let i = 0; i < 10; i++) { const r = pick(CANALS), a = rr(10, 170), [x, y] = polar(a, r); boat(x, y, 4.5, 1.6, (a + 90) * Math.PI / 180, pick(['#e6dccb', '#3d6b55', '#7a4a3a']), null); }

  // ---- a light paper grain over everything
  const gr = document.createElement('canvas'); gr.width = gr.height = 96; const g = gr.getContext('2d'), gd = g.createImageData(96, 96);
  for (let i = 0; i < gd.data.length; i += 4) { const v = 200 + rand() * 55; gd.data[i] = gd.data[i + 1] = gd.data[i + 2] = v; gd.data[i + 3] = 255; }
  g.putImageData(gd, 0, 0);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.18; ctx.fillStyle = ctx.createPattern(gr, 'repeat'); ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  cv.stats = stats;
  return cv;
}
