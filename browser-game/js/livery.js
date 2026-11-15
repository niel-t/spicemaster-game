// Vehicle liveries: printed vinyl the way real commercial vans wear it. A logo, a wordmark, a tagline, a phone number
// and a web address over a colour band, drawn on canvases (no image files). Used by js/vehicles.js:
//   'zn'     the old family firm on the Oofmobiel: Eddy & Zn, cream band, oval mortar badge, since 1987
//   'eddys'  the rebrand once Kipkruidenkwartier is Eddy's: Eddy's, a chili-pepper spice logo, a red-to-yellow swoosh
//   'shooki' Shooki Koerier on the Kangoo: green swoosh, a parcel with speed lines
//   BIZ      small Kaasland businesses some street vans and estates carry
const cache = {};

// ---- logos (drawn around 0,0 at a radius r)
function chili(c, r) { // Eddy's spice logo: a yellow disc, a red chili curling across it, a green stem, three seeds
  c.save();
  c.fillStyle = '#ffc82e'; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.lineWidth = r * 0.09; c.strokeStyle = '#7a1208'; c.stroke();
  c.beginPath(); c.moveTo(-r * 0.62, -r * 0.18);
  c.bezierCurveTo(-r * 0.35, -r * 0.62, r * 0.4, -r * 0.55, r * 0.62, r * 0.42);
  c.bezierCurveTo(r * 0.3, r * 0.02, -r * 0.2, -r * 0.05, -r * 0.62, -r * 0.18);
  const gr = c.createLinearGradient(-r, -r, r, r); gr.addColorStop(0, '#ff3a1a'); gr.addColorStop(1, '#a80c0c'); c.fillStyle = gr; c.fill();
  c.lineWidth = r * 0.05; c.strokeStyle = '#5a0606'; c.stroke();
  c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-r * 0.12, -r * 0.33, r * 0.22, r * 0.05, -0.35, 0, Math.PI * 2); c.fill(); // shine
  c.strokeStyle = '#2f8a2a'; c.lineWidth = r * 0.11; c.lineCap = 'round'; c.beginPath(); c.moveTo(-r * 0.6, -r * 0.2); c.quadraticCurveTo(-r * 0.78, -r * 0.42, -r * 0.62, -r * 0.6); c.stroke();
  c.fillStyle = '#7a1208'; for (const [x, y] of [[-r * 0.2, r * 0.45], [0, r * 0.6], [r * 0.2, r * 0.45]]) { c.beginPath(); c.ellipse(x, y, r * 0.07, r * 0.045, 0.4, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function mortar(c, r) { // the old Eddy & Zn badge: a maroon oval with a cream mortar and pestle
  c.save();
  c.fillStyle = '#6b1410'; c.beginPath(); c.ellipse(0, 0, r * 1.25, r, 0, 0, Math.PI * 2); c.fill();
  c.strokeStyle = '#e8c46a'; c.lineWidth = r * 0.08; c.beginPath(); c.ellipse(0, 0, r * 1.12, r * 0.87, 0, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#f2e6c8'; c.beginPath(); c.moveTo(-r * 0.55, -r * 0.05); c.lineTo(r * 0.55, -r * 0.05); c.quadraticCurveTo(r * 0.5, r * 0.55, 0, r * 0.55); c.quadraticCurveTo(-r * 0.5, r * 0.55, -r * 0.55, -r * 0.05); c.fill();
  c.fillRect(-r * 0.25, r * 0.5, r * 0.5, r * 0.1);
  c.save(); c.translate(r * 0.2, -r * 0.3); c.rotate(0.6); c.fillRect(-r * 0.07, -r * 0.42, r * 0.14, r * 0.62); c.beginPath(); c.arc(0, -r * 0.42, r * 0.11, 0, Math.PI * 2); c.fill(); c.restore();
  c.fillStyle = '#e8c46a'; c.font = `700 ${Math.round(r * 0.26)}px Georgia, serif`; c.textAlign = 'center'; c.fillText('1987', 0, r * 0.84);
  c.restore();
}
function parcel(c, r) { // Shooki Koerier: a parcel flying right, speed lines behind it
  c.save();
  c.strokeStyle = '#2f6a3a'; c.lineCap = 'round'; c.lineWidth = r * 0.12;
  for (const [y, l] of [[-0.35, 0.9], [0, 1.2], [0.35, 0.8]]) { c.beginPath(); c.moveTo(-r * 1.5, y * r); c.lineTo(-r * (1.5 - l), y * r); c.stroke(); }
  c.fillStyle = '#c8873a'; c.fillRect(-r * 0.45, -r * 0.6, r * 1.2, r * 1.2);
  c.fillStyle = '#a86a28'; c.fillRect(-r * 0.45, -r * 0.6, r * 1.2, r * 0.22);
  c.fillStyle = '#f2e0b0'; c.fillRect(r * 0.08, -r * 0.6, r * 0.16, r * 1.2);
  c.strokeStyle = '#5a3a14'; c.lineWidth = r * 0.06; c.strokeRect(-r * 0.45, -r * 0.6, r * 1.2, r * 1.2);
  c.restore();
}

// ---- full side liveries (1024 x 256 canvases for a panel about 3.2 x 0.8 m)
function sideZn(c, w, h) {
  c.fillStyle = '#f2e6c8'; c.fillRect(0, h * 0.08, w, h * 0.84); // cream band
  c.fillStyle = '#6b1410'; c.fillRect(0, h * 0.08, w, h * 0.035); c.fillRect(0, h * 0.885, w, h * 0.035);
  c.fillStyle = '#e8a33d'; c.fillRect(0, h * 0.135, w, h * 0.012); c.fillRect(0, h * 0.853, w, h * 0.012);
  c.save(); c.translate(h * 0.6, h * 0.5); mortar(c, h * 0.3); c.restore();
  c.textAlign = 'left'; c.fillStyle = '#6b1410'; c.font = `italic 700 ${Math.round(h * 0.36)}px Georgia, "Times New Roman", serif`; c.fillText('Eddy & Zn', h * 1.12, h * 0.5);
  c.fillStyle = '#3a2a1a'; c.font = `700 ${Math.round(h * 0.11)}px Arial`; c.fillText('SPECERIJEN · KRUIDEN · GROOTHANDEL', h * 1.15, h * 0.67);
  c.font = `400 ${Math.round(h * 0.095)}px Arial`; c.fillText('Familiebedrijf sinds 1987 · Kipkruidenkwartier', h * 1.15, h * 0.8);
  c.textAlign = 'right'; c.fillStyle = '#6b1410'; c.font = `700 ${Math.round(h * 0.13)}px Arial`; c.fillText('Tel. 020 - 555 1987', w - h * 0.25, h * 0.45);
  c.fillStyle = '#3a2a1a'; c.font = `400 ${Math.round(h * 0.09)}px Arial`; c.fillText('Levering aan horeca en slagerij', w - h * 0.25, h * 0.6);
}
function sideEddys(c, w, h) {
  // the swoosh: a dark band low down, a red-orange-yellow sweep rising towards the back, a white pinstripe
  c.beginPath(); c.moveTo(0, h * 0.62); c.bezierCurveTo(w * 0.35, h * 0.72, w * 0.65, h * 0.2, w, h * 0.08); c.lineTo(w, h); c.lineTo(0, h); c.closePath();
  const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ffc82e'); gr.addColorStop(0.45, '#ff7a1a'); gr.addColorStop(1, '#c4121a'); c.fillStyle = gr; c.fill();
  c.beginPath(); c.moveTo(0, h * 0.82); c.bezierCurveTo(w * 0.4, h * 0.9, w * 0.7, h * 0.45, w, h * 0.36); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = '#1a0e0a'; c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = h * 0.02; c.beginPath(); c.moveTo(0, h * 0.78); c.bezierCurveTo(w * 0.4, h * 0.86, w * 0.7, h * 0.41, w, h * 0.32); c.stroke();
  // logo + wordmark up front
  c.save(); c.translate(h * 0.48, h * 0.4); chili(c, h * 0.3); c.restore();
  c.textAlign = 'left'; c.lineJoin = 'round';
  c.font = `italic 900 ${Math.round(h * 0.4)}px "Arial Black", Arial`; c.lineWidth = h * 0.06; c.strokeStyle = '#1a0e0a'; c.strokeText("Eddy's", h * 0.9, h * 0.52); c.fillStyle = '#ffffff'; c.fillText("Eddy's", h * 0.9, h * 0.52);
  c.font = `700 ${Math.round(h * 0.1)}px Arial`; c.lineWidth = h * 0.03; c.strokeText('SPICE MASTER · KRUIDEN VOOR HEEL KAASLAND', h * 0.93, h * 0.67); c.fillStyle = '#ffd36b'; c.fillText('SPICE MASTER · KRUIDEN VOOR HEEL KAASLAND', h * 0.93, h * 0.67);
  c.textAlign = 'right'; c.fillStyle = '#ffffff'; c.font = `900 ${Math.round(h * 0.13)}px Arial`; c.fillText('0800 - EDDYS', w - h * 0.2, h * 0.84);
  c.font = `700 ${Math.round(h * 0.09)}px Arial`; c.fillText('www.eddys.kl', w - h * 0.2, h * 0.95);
}
function sideShooki(c, w, h) {
  c.beginPath(); c.moveTo(0, h * 0.75); c.bezierCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.95, w, h * 0.55); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = '#2f6a3a'; c.fill();
  c.strokeStyle = '#ffd36b'; c.lineWidth = h * 0.025; c.beginPath(); c.moveTo(0, h * 0.71); c.bezierCurveTo(w * 0.3, h * 0.56, w * 0.6, h * 0.91, w, h * 0.51); c.stroke();
  c.save(); c.translate(h * 0.75, h * 0.36); parcel(c, h * 0.2); c.restore();
  c.textAlign = 'left'; c.fillStyle = '#1f4a28'; c.font = `900 ${Math.round(h * 0.34)}px "Arial Black", Arial`; c.fillText('Shooki', h * 1.15, h * 0.42);
  c.fillStyle = '#2f6a3a'; c.font = `700 ${Math.round(h * 0.11)}px Arial`; c.fillText('KOERIER · SPOED · KIPKRAUD', h * 1.18, h * 0.57);
  c.textAlign = 'right'; c.fillStyle = '#ffffff'; c.font = `900 ${Math.round(h * 0.12)}px Arial`; c.fillText('06 - SHOOKI 1   ·   24/7', w - h * 0.2, h * 0.86);
  c.font = `700 ${Math.round(h * 0.085)}px Arial`; c.fillText('shooki.kl · familieprijs', w - h * 0.2, h * 0.96);
}
// shrink a font until the text fits (font template with # for the size); returns the size used
function fit(c, text, font, size, max) { let s = Math.round(size); c.font = font.replace('#', s); while (c.measureText(text).width > max && s > 8) { s -= 2; c.font = font.replace('#', s); } return s; }
function roofLogo(c, w, h, id) { // what the top-down cameras see: logo + wordmark, always inside the decal
  const M = h * 0.08;
  if (id === 'eddys') { c.save(); c.translate(h * 0.46, h * 0.5); chili(c, h * 0.36); c.restore(); c.textAlign = 'left'; c.lineJoin = 'round'; const s = fit(c, "EDDY'S", 'italic 900 #px "Arial Black", Arial', h * 0.52, w - h * 0.92 - M); c.lineWidth = s * 0.14; c.strokeStyle = '#1a0e0a'; c.strokeText("EDDY'S", h * 0.92, h * 0.5 + s * 0.36); c.fillStyle = '#ffc82e'; c.fillText("EDDY'S", h * 0.92, h * 0.5 + s * 0.36); return; }
  if (id === 'shooki') { c.save(); c.translate(h * 0.62, h * 0.5); parcel(c, h * 0.26); c.restore(); c.textAlign = 'left'; const s = fit(c, 'Shooki', '900 #px "Arial Black", Arial', h * 0.48, w - h * 1.05 - M); c.fillStyle = '#1f4a28'; c.fillText('Shooki', h * 1.05, h * 0.5 + s * 0.36); return; }
  c.save(); c.translate(h * 0.5, h * 0.5); mortar(c, h * 0.32); c.restore(); c.textAlign = 'left'; const s = fit(c, 'Eddy & Zn', 'italic 700 #px Georgia, serif', h * 0.5, w - h * 1.0 - M); c.lineJoin = 'round'; c.lineWidth = s * 0.08; c.strokeStyle = '#3a0c08'; c.strokeText('Eddy & Zn', h * 1.0, h * 0.5 + s * 0.32); c.fillStyle = '#ffd36b'; c.fillText('Eddy & Zn', h * 1.0, h * 0.5 + s * 0.32);
}

// small Kaasland businesses on street vans: [name, line, phone, band colour, text colour, logo]
export const BIZ = [
  ['Loodgieter Piet Lek', 'Lekkage? Verstopping? Piet komt.', '06 - 1234 LEK', '#1a5aa0', '#ffffff', 'drop'],
  ['Bakkerij De Krentenbol', 'Vers brood · gebak · taarten', '020 - 33 44 55', '#c8873a', '#fff6e0', 'bun'],
  ['Snackbar Bij Henk', 'Frites · kroketten · bezorging', '020 - FRIET 1', '#e8b020', '#3a1a0a', 'fries'],
  ['Rijschool Remmen', 'Rijles B · BE · in één keer slagen*', '06 - REM REM 1', '#c4121a', '#ffffff', 'L'],
  ['Bloemen Tulpje', 'Boeketten · rouw · bruiloft', '020 - TULP 22', '#d8508a', '#ffffff', 'tulip'],
  ['Schilder Kwast & Zn', 'Binnen · buiten · glas', '06 - KWAST 77', '#2a8a5a', '#ffffff', 'drop'],
];
function bizLogo(c, r, kind, col) {
  c.save(); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = r * 0.14;
  if (kind === 'drop') { c.beginPath(); c.moveTo(0, -r); c.bezierCurveTo(r * 0.9, 0, r * 0.7, r, 0, r); c.bezierCurveTo(-r * 0.7, r, -r * 0.9, 0, 0, -r); c.fill(); }
  else if (kind === 'bun') { c.beginPath(); c.ellipse(0, r * 0.1, r, r * 0.7, 0, 0, Math.PI * 2); c.fill(); }
  else if (kind === 'fries') { for (let k = -2; k <= 2; k++) c.fillRect(k * r * 0.3 - r * 0.1, -r * (0.9 - Math.abs(k) * 0.1), r * 0.2, r); c.fillRect(-r * 0.75, 0, r * 1.5, r * 0.8); }
  else if (kind === 'L') { c.fillRect(-r * 0.8, -r * 0.8, r * 1.6, r * 1.6); c.fillStyle = '#c4121a'; c.font = `900 ${Math.round(r * 1.5)}px Arial`; c.textAlign = 'center'; c.fillText('L', 0, r * 0.55); }
  else { c.beginPath(); c.moveTo(0, r); c.lineTo(0, -r * 0.1); c.stroke(); c.beginPath(); c.moveTo(-r * 0.6, -r); c.lineTo(-r * 0.2, -r * 0.5); c.lineTo(0, -r); c.lineTo(r * 0.2, -r * 0.5); c.lineTo(r * 0.6, -r); c.quadraticCurveTo(r * 0.6, 0, 0, 0); c.quadraticCurveTo(-r * 0.6, 0, -r * 0.6, -r); c.fill(); }
  c.restore();
}
function sideBiz(c, w, h, b) {
  const [name, line, tel, band, ink, logo] = b;
  c.fillStyle = band; c.fillRect(0, h * 0.62, w, h * 0.3);
  c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(h * 0.38, h * 0.36, h * 0.27, 0, Math.PI * 2); c.fill();
  c.save(); c.translate(h * 0.38, h * 0.36); bizLogo(c, h * 0.16, logo, band); c.restore();
  c.textAlign = 'left'; c.lineJoin = 'round'; c.font = `900 ${Math.round(h * 0.2)}px Arial`; c.lineWidth = h * 0.04; c.strokeStyle = 'rgba(255,255,255,.85)'; c.strokeText(name, h * 0.75, h * 0.38); c.fillStyle = band; c.fillText(name, h * 0.75, h * 0.38);
  c.font = `700 ${Math.round(h * 0.095)}px Arial`; c.strokeText(line, h * 0.77, h * 0.52); c.fillStyle = '#222'; c.fillText(line, h * 0.77, h * 0.52);
  c.fillStyle = ink; c.font = `900 ${Math.round(h * 0.14)}px Arial`; c.textAlign = 'center'; c.fillText(tel, w / 2, h * 0.82);
}

// a cached texture per livery and part ('side' | 'roof'); biz liveries are 'biz0'..'biz5'
export function liveryTex(canvasTex, id, part = 'side') {
  const k = id + ':' + part; if (cache[k]) return cache[k];
  const t = part === 'roof' ? canvasTex(1024, 480, (c, w, h) => roofLogo(c, w, h, id))
    : canvasTex(1024, 256, (c, w, h) => (id === 'zn' ? sideZn : id === 'eddys' ? sideEddys : id === 'shooki' ? sideShooki : (cc, ww, hh) => sideBiz(cc, ww, hh, BIZ[+id.slice(3)]))(c, w, h));
  t.anisotropy = 8; return (cache[k] = t);
}

// ---- the cargo sides of the Oofmobiel and the Kangoo, laid out around what covers them
// cargoTex(canvasTex, id, key, w, h, keep): key names the van side (one texture each, since the rear arch and the door
// handle sit at the other end on the other side); keep = rects {x0, x1, y0, y1} in canvas pixels that text must avoid.
// Every line is fitted to the free width, so nothing runs off the vinyl.
function freeSpan(keep, y0, y1, xa, xb) {
  let iv = [[xa, xb]];
  for (const k of keep) {
    if (k.y1 <= y0 || k.y0 >= y1) continue;
    iv = iv.flatMap(([a, b]) => (k.x1 <= a || k.x0 >= b ? [[a, b]] : [[a, Math.min(b, k.x0)], [Math.max(a, k.x1), b]].filter(([p, q]) => q - p > 4)));
  }
  return iv.reduce((m, s) => (s[1] - s[0] > m[1] - m[0] ? s : m), [0, 0]);
}
function cargoEddys(c, w, h, keep) {
  c.beginPath(); c.moveTo(0, h * 0.74); c.bezierCurveTo(w * 0.35, h * 0.82, w * 0.65, h * 0.5, w, h * 0.42); c.lineTo(w, h); c.lineTo(0, h); c.closePath();
  const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ffc82e'); gr.addColorStop(0.45, '#ff7a1a'); gr.addColorStop(1, '#c4121a'); c.fillStyle = gr; c.fill();
  c.beginPath(); c.moveTo(0, h * 0.9); c.bezierCurveTo(w * 0.4, h * 0.96, w * 0.7, h * 0.68, w, h * 0.62); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = '#1a0e0a'; c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = h * 0.012; c.beginPath(); c.moveTo(0, h * 0.86); c.bezierCurveTo(w * 0.4, h * 0.92, w * 0.7, h * 0.64, w, h * 0.58); c.stroke();
  const M = 34, R = h * 0.17, top = freeSpan(keep, h * 0.04, h * 0.56, M, w - M);
  c.save(); c.translate(top[0] + R * 1.05, h * 0.25); chili(c, R); c.restore();
  const x = top[0] + R * 2.35, mw = top[1] - x;
  c.textAlign = 'left'; c.lineJoin = 'round';
  let s = fit(c, "Eddy's", 'italic 900 #px "Arial Black", Arial', h * 0.3, mw); c.lineWidth = s * 0.12; c.strokeStyle = '#1a0e0a'; c.strokeText("Eddy's", x, h * 0.36); c.fillStyle = '#ffffff'; c.fillText("Eddy's", x, h * 0.36);
  const tag = 'SPICE MASTER · KRUIDEN VOOR HEEL KAASLAND';
  s = fit(c, tag, '700 #px Arial', h * 0.062, mw - 4); c.lineWidth = s * 0.28; c.strokeText(tag, x + 4, h * 0.47); c.fillStyle = '#ffd36b'; c.fillText(tag, x + 4, h * 0.47);
  const bot = freeSpan(keep, h * 0.62, h * 0.97, M, w - M), cx = (bot[0] + bot[1]) / 2;
  c.textAlign = 'center';
  s = fit(c, '0800 - EDDYS', '900 #px "Arial Black", Arial', h * 0.11, bot[1] - bot[0] - 20); c.lineWidth = s * 0.16; c.strokeText('0800 - EDDYS', cx, h * 0.8); c.fillStyle = '#ffffff'; c.fillText('0800 - EDDYS', cx, h * 0.8);
  s = fit(c, 'www.eddys.kl', '700 #px Arial', h * 0.055, bot[1] - bot[0] - 20); c.lineWidth = s * 0.25; c.strokeText('www.eddys.kl', cx, h * 0.9); c.fillStyle = '#ffd36b'; c.fillText('www.eddys.kl', cx, h * 0.9);
}
function cargoZn(c, w, h, keep) {
  const b0 = h * 0.05, b1 = h * 0.56;
  c.fillStyle = '#f2e6c8'; c.fillRect(0, b0, w, b1 - b0); // the cream band
  c.fillStyle = '#6b1410'; c.fillRect(0, b0, w, h * 0.022); c.fillRect(0, b1 - h * 0.022, w, h * 0.022);
  c.fillStyle = '#e8a33d'; c.fillRect(0, b0 + h * 0.032, w, h * 0.008); c.fillRect(0, b1 - h * 0.04, w, h * 0.008);
  const M = 34, R = h * 0.15, top = freeSpan(keep, b0, b1, M, w - M);
  c.save(); c.translate(top[0] + R * 1.3, (b0 + b1) / 2); mortar(c, R); c.restore();
  const x = top[0] + R * 2.75, mw = top[1] - x;
  c.textAlign = 'left'; c.fillStyle = '#6b1410'; fit(c, 'Eddy & Zn', 'italic 700 #px Georgia, "Times New Roman", serif', h * 0.22, mw); c.fillText('Eddy & Zn', x, h * 0.3);
  c.fillStyle = '#3a2a1a'; fit(c, 'SPECERIJEN · KRUIDEN · GROOTHANDEL', '700 #px Arial', h * 0.06, mw - 4); c.fillText('SPECERIJEN · KRUIDEN · GROOTHANDEL', x + 3, h * 0.39);
  fit(c, 'Familiebedrijf sinds 1987 · Kipkruidenkwartier', '400 #px Arial', h * 0.05, mw - 4); c.fillText('Familiebedrijf sinds 1987 · Kipkruidenkwartier', x + 3, h * 0.47);
  const bot = freeSpan(keep, h * 0.62, h * 0.95, M, w - M), pw = Math.min(bot[1] - bot[0] - 10, w * 0.62), px = (bot[0] + bot[1]) / 2 - pw / 2;
  c.fillStyle = '#6b1410'; c.beginPath(); if (c.roundRect) c.roundRect(px, h * 0.64, pw, h * 0.28, h * 0.05); else c.rect(px, h * 0.64, pw, h * 0.28); c.fill();
  c.strokeStyle = '#e8a33d'; c.lineWidth = h * 0.008; c.stroke();
  c.textAlign = 'center'; c.fillStyle = '#f2e6c8'; fit(c, 'Tel. 020 - 555 1987', '700 #px Arial', h * 0.085, pw - 30); c.fillText('Tel. 020 - 555 1987', px + pw / 2, h * 0.76);
  fit(c, 'Levering aan horeca en slagerij', '400 #px Arial', h * 0.05, pw - 30); c.fillText('Levering aan horeca en slagerij', px + pw / 2, h * 0.86);
}
function cargoShooki(c, w, h, keep) {
  c.beginPath(); c.moveTo(0, h * 0.74); c.bezierCurveTo(w * 0.3, h * 0.6, w * 0.6, h * 0.95, w, h * 0.58); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = '#2f6a3a'; c.fill();
  c.strokeStyle = '#ffd36b'; c.lineWidth = h * 0.022; c.beginPath(); c.moveTo(0, h * 0.7); c.bezierCurveTo(w * 0.3, h * 0.56, w * 0.6, h * 0.91, w, h * 0.54); c.stroke();
  const M = 34, R = h * 0.16, top = freeSpan(keep, h * 0.04, h * 0.56, M, w - M);
  c.save(); c.translate(top[0] + R * 1.6, h * 0.28); parcel(c, R); c.restore();
  const x = top[0] + R * 2.6, mw = top[1] - x;
  c.textAlign = 'left'; c.fillStyle = '#1f4a28'; fit(c, 'Shooki', '900 #px "Arial Black", Arial', h * 0.3, mw); c.fillText('Shooki', x, h * 0.38);
  c.fillStyle = '#2f6a3a'; fit(c, 'KOERIER · SPOED · KIPKRAUD', '700 #px Arial', h * 0.075, mw - 4); c.fillText('KOERIER · SPOED · KIPKRAUD', x + 4, h * 0.5);
  const bot = freeSpan(keep, h * 0.66, h * 0.98, M, w - M), cx = (bot[0] + bot[1]) / 2; c.textAlign = 'center'; c.fillStyle = '#ffffff';
  fit(c, '06 - SHOOKI 1   ·   24/7', '900 #px Arial', h * 0.1, bot[1] - bot[0] - 20); c.fillText('06 - SHOOKI 1   ·   24/7', cx, h * 0.83);
  fit(c, 'shooki.kl · familieprijs', '700 #px Arial', h * 0.06, bot[1] - bot[0] - 20); c.fillText('shooki.kl · familieprijs', cx, h * 0.93);
}
export function cargoTex(canvasTex, id, key, w, h, keep = []) {
  const k = `${id}:cargo:${key}`; if (cache[k]) return cache[k];
  const t = canvasTex(w, h, (c) => (id === 'eddys' ? cargoEddys : id === 'shooki' ? cargoShooki : cargoZn)(c, w, h, keep));
  t.anisotropy = 8; return (cache[k] = t);
}

// ---- shop signs (the warehouse front, the drive's start, the siege map): same brand as the van
// signFace(canvasTex, id, w, h, sub) → texture; sub = the small second line (null: the brand's own)
export function signFace(canvasTex, id, w = 1024, h = 180, sub = null) {
  const k = `${id}:sign:${w}x${h}:${sub}`; if (cache[k]) return cache[k];
  return (cache[k] = canvasTex(w, h, (c) => {
    if (id === 'eddys') {
      c.fillStyle = '#1a0e0a'; c.fillRect(0, 0, w, h);
      c.beginPath(); c.moveTo(w * 0.45, h); c.bezierCurveTo(w * 0.7, h * 0.92, w * 0.85, h * 0.55, w, h * 0.45); c.lineTo(w, h); c.closePath();
      const gr = c.createLinearGradient(w * 0.45, 0, w, 0); gr.addColorStop(0, '#ffc82e'); gr.addColorStop(0.5, '#ff7a1a'); gr.addColorStop(1, '#c4121a'); c.fillStyle = gr; c.fill();
      c.strokeStyle = '#ffc82e'; c.lineWidth = Math.max(4, h * 0.03); c.strokeRect(c.lineWidth, c.lineWidth, w - 2 * c.lineWidth, h - 2 * c.lineWidth);
      c.save(); c.translate(h * 0.58, h * 0.5); chili(c, h * 0.36); c.restore();
      c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.lineJoin = 'round';
      fit(c, "EDDY'S", 'italic 900 #px "Arial Black", Arial', Math.round(h * 0.5), w - h * 1.4); c.fillStyle = '#ffffff'; c.fillText("EDDY'S", h * 1.12, h * 0.6);
      const t = sub || 'SPICE MASTER · SPECERIJEN · KIPKRUIDENKWARTIER'; fit(c, t, '700 #px Arial', Math.round(h * 0.15), w - h * 1.4); c.fillStyle = '#ffd36b'; c.fillText(t, h * 1.15, h * 0.84);
      return;
    }
    c.fillStyle = '#6b1410'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ffd36b'; c.lineWidth = Math.max(4, h * 0.035); c.strokeRect(c.lineWidth, c.lineWidth, w - 2 * c.lineWidth, h - 2 * c.lineWidth);
    c.save(); c.translate(h * 0.62, h * 0.5); mortar(c, h * 0.3); c.restore();
    c.textAlign = 'center'; c.textBaseline = 'alphabetic'; const cx = h * 1.1 + (w - h * 1.1) / 2;
    fit(c, 'EDDY & ZN', '900 #px "Arial Black", Impact, sans-serif', Math.round(h * 0.42), w - h * 1.4); c.fillStyle = '#ffd36b'; c.fillText('EDDY & ZN', cx, h * 0.56);
    const t = sub || 'SPECERIJEN · SINDS 1987'; fit(c, t, '900 #px "Arial Black", Impact, sans-serif', Math.round(h * 0.17), w - h * 1.4); c.fillStyle = '#ffffff'; c.fillText(t, cx, h * 0.83);
  }));
}
