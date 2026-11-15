// Kaasland from the air: paints a sketched satellite view of the whole city onto a canvas, once per session.
// Old-town rowhouses with canals for Kipkruidenkwartier and Oud-Vettenburg, villas, gardens, fields and
// greenhouses on Hipsterheuvel, sheds, container yards and tanks in De Duistere Dokken, main roads and bridges
// on top, boats in the harbours. Everything comes from a seeded random generator, so the city looks the same
// every time. Drawn in the 1024x572 map space at R pixels per unit.

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
function inPoly(x, y, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
const trace = (ctx, poly) => { ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

const STYLE = {
  start: { kind: 'town', block: [15, 10], angle: 10, ground: '#6f6b64', walk: '#a39b8e', yard: '#6d8650', roofs: ['#9c5034', '#8a4630', '#a8623f', '#7a4a3a', '#6b625a', '#b0734b', '#5d5a58'] },
  lampas: { kind: 'town', block: [13, 9], angle: -8, ground: '#6d6962', walk: '#a59c8d', yard: '#6a8450', roofs: ['#a3553a', '#8f4a33', '#b36a45', '#7d4636', '#9b8270', '#6a5f57', '#c07d52'] },
  nosh: { kind: 'villa', block: [24, 17], angle: 4, ground: '#80776a', walk: '#7b9a58', yard: '#86a660', roofs: ['#c9c2b4', '#8c5a44', '#5d6670', '#b07a52', '#e3ddd0', '#2f3d55', '#7b6a5a'] },
  abd: { kind: 'docks', block: [26, 17], angle: 0, ground: '#5f6365', walk: '#85898a', yard: '#7d8182', roofs: ['#7d8a93', '#9aa3a8', '#6e7f6e', '#8a5a44', '#b8bcbd', '#5e6d7a'] },
};
const CONTAINERS = ['#b5442f', '#2f6aa3', '#3f8a4a', '#d0892c', '#8d9196', '#7a3f6e', '#c7b23b'];

export function paintKaasland({ W, H, REGIONS, MOLEN, PARKS, ROADS, pt, S, R = 2.5 }) {
  const cv = document.createElement('canvas'); cv.width = Math.round(W * R); cv.height = Math.round(H * R);
  const ctx = cv.getContext('2d'); ctx.scale(R, R);
  const rand = rng(1971);
  const pick = (a) => a[Math.floor(rand() * a.length)];

  // ---- water: deep in the middle of the channels, lighter near the quays, small wave marks
  ctx.fillStyle = '#1f4656'; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(160,200,215,.10)'; ctx.lineWidth = 0.6;
  for (let i = 0; i < 1400; i++) { const x = rand() * W, y = rand() * H, l = 2 + rand() * 4; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + l / 2, y - 0.8, x + l, y); ctx.stroke(); }
  // shallow rim around every coast
  ctx.save(); ctx.lineJoin = 'round';
  for (const p of Object.values(REGIONS)) { trace(ctx, p); ctx.strokeStyle = 'rgba(70,130,140,.45)'; ctx.lineWidth = 14; ctx.stroke(); ctx.strokeStyle = 'rgba(90,150,150,.5)'; ctx.lineWidth = 6; ctx.stroke(); }
  ctx.restore();

  // ---- land, one district at a time, clipped to its outline
  for (const [r, poly] of Object.entries(REGIONS)) {
    const st = STYLE[r];
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 1.5; trace(ctx, poly); ctx.fillStyle = '#b3a88f'; ctx.fill(); ctx.restore(); // quay edge
    ctx.save(); trace(ctx, poly); ctx.clip();
    ctx.fillStyle = st.ground; ctx.fillRect(0, 0, W, H);
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2, ext = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    const a = st.angle * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a);
    const [bw0, bh0] = st.block;
    for (let gy = -ext / 2 - bh0, row = 0; gy < ext / 2 + bh0; row++) {
      const bh = bh0 * (0.8 + rand() * 0.45), wide = row % 4 === 0 ? 1.1 : 0; // every fourth street is wider
      for (let gx = -ext / 2 - bw0 + (row % 2) * bw0 * 0.4; gx < ext / 2 + bw0;) {
        const bw = bw0 * (0.7 + rand() * 0.6), mx = gx + bw / 2, my = gy + bh / 2;
        const wx = cx + mx * ca - my * sa, wy = cy + mx * sa + my * ca; // block centre on the map
        if (inPoly(wx, wy, poly)) block(ctx, st, gx + 1.1, gy + 1.1 + wide, bw - 2.2, bh - 2.2 - wide, rand, pick);
        gx += bw;
      }
      gy += bh;
    }
    ctx.restore();
    if (st.kind === 'town') canals(ctx, r, S, rand);
    if (r === 'nosh') marinaLand(ctx, S, rand);
    ctx.restore();
    trace(ctx, poly); ctx.strokeStyle = '#8f846f'; ctx.lineWidth = 0.9; ctx.stroke();
  }

  // ---- parks
  for (const [, x, y, rx, ry] of PARKS) {
    ctx.save(); ctx.beginPath(); ctx.ellipse(x * S, y * S, rx * S, ry * S, 0, 0, Math.PI * 2); ctx.fillStyle = '#5f8d45'; ctx.fill(); ctx.clip();
    for (let i = 0; i < rx * ry * 0.12; i++) tree(ctx, x * S + (rand() - 0.5) * rx * S * 2, y * S + (rand() - 0.5) * ry * S * 2, 0.9 + rand() * 1.4, rand);
    ctx.strokeStyle = 'rgba(220,210,180,.7)'; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.ellipse(x * S, y * S, rx * S * 0.6, ry * S * 0.55, 0.3, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // ---- the island with the windmill
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 5; ctx.beginPath(); ctx.ellipse(MOLEN.cx, MOLEN.cy, MOLEN.rx, MOLEN.ry, 0, 0, Math.PI * 2); ctx.fillStyle = '#c9b98e'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.ellipse(MOLEN.cx, MOLEN.cy, MOLEN.rx - 2, MOLEN.ry - 2, 0, 0, Math.PI * 2); ctx.fillStyle = '#6f9a4c'; ctx.fill(); ctx.clip();
  for (let i = 0; i < 40; i++) tree(ctx, MOLEN.cx + (rand() - 0.5) * MOLEN.rx * 2, MOLEN.cy + (rand() - 0.5) * MOLEN.ry * 2, 0.8 + rand(), rand);
  ctx.restore();
  ctx.save(); ctx.translate(MOLEN.cx, MOLEN.cy); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(1, 1, 3.4, 0, 7); ctx.fill();
  ctx.fillStyle = '#6b4a30'; ctx.beginPath(); ctx.arc(0, 0, 3.2, 0, 7); ctx.fill(); ctx.fillStyle = '#8a6440'; ctx.beginPath(); ctx.arc(-0.6, -0.6, 1.8, 0, 7); ctx.fill();
  ctx.strokeStyle = '#f4ead2'; ctx.lineWidth = 1.1; ctx.rotate(0.5); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -9); ctx.stroke(); }
  ctx.restore();

  // ---- main roads and bridges over everything
  const seg = (a, b) => { const [x1, y1] = pt(a), [x2, y2] = pt(b); ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); };
  ctx.lineCap = 'round';
  for (const [a, b, , br] of ROADS) { seg(a, b); ctx.strokeStyle = br ? 'rgba(0,0,0,.5)' : '#4c4944'; ctx.lineWidth = br ? 5.2 : 4.4; ctx.stroke(); }
  for (const [a, b, , br] of ROADS) { seg(a, b); ctx.strokeStyle = br ? '#b9b2a4' : '#57534d'; ctx.lineWidth = 3.4; ctx.stroke(); }
  ctx.setLineDash([1.6, 1.6]); ctx.strokeStyle = 'rgba(240,235,220,.75)'; ctx.lineWidth = 0.35;
  for (const [a, b] of ROADS) { seg(a, b); ctx.stroke(); }
  ctx.setLineDash([]);
  // a few cars on the main roads
  for (const [a, b] of ROADS) { const [x1, y1] = pt(a), [x2, y2] = pt(b), n = Math.floor(Math.hypot(x2 - x1, y2 - y1) / 14); for (let i = 0; i < n; i++) { if (rand() < 0.5) continue; const t = rand(); ctx.fillStyle = pick(['#e8e4dc', '#c23b2c', '#2d5d9a', '#222', '#d8b23a', '#9aa0a6']); ctx.save(); ctx.translate(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t); ctx.rotate(Math.atan2(y2 - y1, x2 - x1)); ctx.fillRect(-0.9, rand() < 0.5 ? -1.3 : 0.3, 1.8, 0.9); ctx.restore(); } }

  // ---- boats: a marina off Hipsterheuvel's west end, ships at the docks, barges on the river
  for (let i = 0; i < 26; i++) boat(ctx, (205 + rand() * 60) * S * 1.0, (215 + rand() * 40) * S, 1.6 + rand(), rand() * 0.4 - 0.2, '#f2efe8');
  for (const [x, y, ang] of [[1530, 470, 1.3], [1525, 610, 1.4], [1450, 790, 0.4], [1250, 830, 0.1], [1560, 700, 1.5]]) ship(ctx, x * S, y * S, ang, rand, pick);
  for (const [x, y, ang] of [[560, 320, 0.08], [1060, 300, -0.04], [880, 330, 0.02], [300, 335, -0.1]]) boat(ctx, x * S, y * S, 5, ang, '#6a5848');
  return cv;
}

function shadowRect(ctx, x, y, w, h, fill) { ctx.fillStyle = 'rgba(0,0,0,.32)'; ctx.fillRect(x + 0.45, y + 0.55, w, h); ctx.fillStyle = fill; ctx.fillRect(x, y, w, h); }
function roof(ctx, x, y, w, h, fill, rand) { // a pitched roof: lit side and shaded side
  shadowRect(ctx, x, y, w, h, fill);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; if (w > h) ctx.fillRect(x, y + h / 2, w, h / 2); else ctx.fillRect(x + w / 2, y, w / 2, h);
  if (rand() < 0.08) { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(x + w * 0.2, y + h * 0.15, Math.min(0.8, w * 0.2), Math.min(0.8, h * 0.2)); } // a skylight
}
function tree(ctx, x, y, r, rand) {
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.arc(x + r * 0.35, y + r * 0.4, r, 0, 7); ctx.fill();
  ctx.fillStyle = ['#3f6a33', '#4a7a3a', '#557f3c', '#3a5f30'][Math.floor(rand() * 4)]; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,220,.13)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.55, 0, 7); ctx.fill();
}
function block(ctx, st, x, y, w, h, rand, pick) {
  if (w < 2 || h < 2) return;
  if (st.kind === 'town') {
    const roll = rand();
    shadowRect(ctx, x, y, w, h, st.walk);
    if (roll < 0.06) { // a little square with trees
      ctx.fillStyle = '#b9ad98'; ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1);
      for (let i = 0; i < 4; i++) tree(ctx, x + 1.5 + rand() * (w - 3), y + 1.5 + rand() * (h - 3), 0.9 + rand() * 0.5, rand);
      return;
    }
    if (roll < 0.09) { roof(ctx, x + 0.6, y + 0.6, w - 1.2, h - 1.2, pick(['#4f5458', '#6b5a50']), rand); return; } // church or school
    ctx.fillStyle = st.yard; ctx.fillRect(x + 0.4, y + 0.4, w - 0.8, h - 0.8);
    const d = Math.min(h * 0.4, 3.6), n = Math.max(2, Math.round(w / (1.8 + rand() * 0.8)));
    for (const side of [0, 1]) for (let i = 0; i < n; i++) { // rowhouses along both long sides
      const hw = (w - 0.8) / n, hd = d * (0.8 + rand() * 0.35);
      roof(ctx, x + 0.4 + i * hw, side ? y + h - 0.4 - hd : y + 0.4, hw - 0.12, hd, pick(st.roofs), rand);
    }
    const ends = Math.max(1, Math.round((h - 2 * d) / 2.2)); // and the short ends
    for (const side of [0, 1]) for (let i = 0; i < ends; i++) { const eh = (h - 0.8 - 2 * d) / ends; if (eh > 0.6) roof(ctx, side ? x + w - 0.4 - d * 0.9 : x + 0.4, y + 0.4 + d + i * eh, d * 0.9, eh - 0.12, pick(st.roofs), rand); }
    if (rand() < 0.7) tree(ctx, x + w / 2 + (rand() - 0.5) * w * 0.3, y + h / 2, 0.8 + rand() * 0.5, rand);
  } else if (st.kind === 'villa') {
    const roll = rand();
    if (roll < 0.16) { // a field in stripes
      const cs = pick([['#9fae5c', '#8ea050'], ['#c9b560', '#b8a452'], ['#7d9c4c', '#6f8e43']]);
      for (let i = 0; i < w; i += 1.4) { ctx.fillStyle = cs[Math.floor(i / 1.4) % 2]; ctx.fillRect(x + i, y, Math.min(1.4, w - i), h); }
      return;
    }
    shadowRect(ctx, x, y, w, h, st.yard);
    if (roll < 0.25) { // greenhouses
      for (let i = 0; i < 3; i++) { const gx = x + 0.6 + i * (w - 1.2) / 3, gw = (w - 1.2) / 3 - 0.4; shadowRect(ctx, gx, y + 0.6, gw, h - 1.2, '#cfe0dc'); ctx.strokeStyle = 'rgba(120,150,150,.55)'; ctx.lineWidth = 0.15; for (let k = 0.8; k < gw; k += 0.8) { ctx.beginPath(); ctx.moveTo(gx + k, y + 0.6); ctx.lineTo(gx + k, y + h - 0.6); ctx.stroke(); } }
      return;
    }
    const nH = 2 + Math.floor(rand() * 3);
    for (let i = 0; i < nH; i++) {
      const hw = 2.6 + rand() * 2.4, hh = 2.2 + rand() * 1.8, hx = x + 0.6 + rand() * Math.max(0.1, w - hw - 1.2), hy = y + 0.6 + rand() * Math.max(0.1, h - hh - 1.2);
      roof(ctx, hx, hy, hw, hh, pick(st.roofs), rand);
      if (rand() < 0.18) { ctx.fillStyle = '#5fc4d8'; ctx.fillRect(hx + hw + 0.5, hy + 0.4, 1.6, 1); } // a pool
    }
    for (let i = 0; i < 4 + rand() * 6; i++) tree(ctx, x + rand() * w, y + rand() * h, 0.6 + rand() * 0.9, rand);
  } else { // docks
    const roll = rand();
    shadowRect(ctx, x, y, w, h, st.walk);
    if (roll < 0.45) { // one or two sheds
      const two = rand() < 0.4, sw = two ? (w - 1.6) / 2 : w - 1.2;
      for (let i = 0; i < (two ? 2 : 1); i++) {
        const sx = x + 0.6 + i * (sw + 0.4), fill = pick(st.roofs);
        shadowRect(ctx, sx, y + 0.6, sw, h - 1.2, fill);
        ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 0.15; for (let k = 0.7; k < sw; k += 0.7) { ctx.beginPath(); ctx.moveTo(sx + k, y + 0.6); ctx.lineTo(sx + k, y + h - 0.6); ctx.stroke(); }
      }
    } else if (roll < 0.82) { // container yard
      for (let cy = y + 0.6; cy < y + h - 1.2; cy += 1.25) for (let cx = x + 0.6; cx < x + w - 2.6; cx += 2.7) if (rand() < 0.85) shadowRect(ctx, cx, cy, 2.5, 1.05, CONTAINERS[Math.floor(rand() * CONTAINERS.length)]);
    } else if (roll < 0.92) { // tanks
      for (let i = 0; i < 4; i++) { const r = 1.6 + rand() * 1.2, tx = x + 2 + rand() * (w - 4), ty = y + 2 + rand() * (h - 4); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(tx + 0.6, ty + 0.6, r, 0, 7); ctx.fill(); ctx.fillStyle = '#d4d3cc'; ctx.beginPath(); ctx.arc(tx, ty, r, 0, 7); ctx.fill(); ctx.fillStyle = '#b7b6af'; ctx.beginPath(); ctx.arc(tx, ty, r * 0.55, 0, 7); ctx.fill(); }
    } else { ctx.fillStyle = '#8f8a7c'; ctx.fillRect(x + 0.5, y + 0.5, w - 1, h - 1); } // empty lot
  }
}
function canals(ctx, r, S, rand) { // grachten: rings of canals lined with trees
  const rings = r === 'lampas' ? [[740, 640, 225, 3.6], [740, 640, 300, 3.2], [740, 640, 370, 2.8]] : [[520, 900, 230, 3.0]];
  for (const [x, y, rad, wdt] of rings) {
    ctx.beginPath(); ctx.arc(x * S, y * S, rad * S, 0, Math.PI * 2);
    ctx.strokeStyle = '#8c8270'; ctx.lineWidth = wdt + 1.6; ctx.stroke();
    ctx.strokeStyle = '#2b5866'; ctx.lineWidth = wdt; ctx.stroke();
    const n = Math.floor(rad * S * Math.PI * 2 / 2.2);
    for (let i = 0; i < n; i++) { const t = i / n * Math.PI * 2; for (const o of [-1, 1]) { const rr = rad * S + o * (wdt / 2 + 1.1); tree(ctx, x * S + Math.cos(t) * rr, y * S + Math.sin(t) * rr, 0.75 + rand() * 0.35, rand); } }
  }
}
function marinaLand(ctx, S, rand) { // jetties on Hipsterheuvel's west end
  ctx.strokeStyle = '#c8bca2'; ctx.lineWidth = 0.6;
  for (let i = 0; i < 5; i++) { const x = (230 + i * 14) * S, y = 205 * S; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 20 * S); ctx.stroke(); }
}
function boat(ctx, x, y, len, ang, fill) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.ellipse(-len * 0.9, 0, len * 0.8, len * 0.16, 0, 0, 7); ctx.fill(); // wake
  ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(len / 2, 0); ctx.quadraticCurveTo(0, -len * 0.22, -len / 2, -len * 0.18); ctx.lineTo(-len / 2, len * 0.18); ctx.quadraticCurveTo(0, len * 0.22, len / 2, 0); ctx.fill();
  ctx.restore();
}
function ship(ctx, x, y, ang, rand, pick) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(-15, -3, 31, 7);
  ctx.fillStyle = '#7a2e22'; ctx.beginPath(); ctx.moveTo(16, 0); ctx.lineTo(12, -3.2); ctx.lineTo(-15, -3.2); ctx.lineTo(-15, 3.2); ctx.lineTo(12, 3.2); ctx.closePath(); ctx.fill();
  for (let cx = -11; cx < 9; cx += 2.6) for (const cy of [-2.6, -1.3, 0, 1.3]) ctx.fillStyle = CONTAINERS[Math.floor(rand() * CONTAINERS.length)], ctx.fillRect(cx, cy, 2.4, 1.2);
  ctx.fillStyle = '#e8e4dc'; ctx.fillRect(-14.5, -2.6, 3, 5.2);
  ctx.restore();
}
