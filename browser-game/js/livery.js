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
function roofLogo(c, w, h, id) { // what you see from the top-down camera
  if (id === 'eddys') { c.save(); c.translate(h * 0.5, h * 0.5); chili(c, h * 0.4); c.restore(); c.textAlign = 'left'; c.font = `italic 900 ${Math.round(h * 0.55)}px "Arial Black", Arial`; c.lineWidth = h * 0.08; c.strokeStyle = '#1a0e0a'; c.strokeText("EDDY'S", h * 1.0, h * 0.7); c.fillStyle = '#ffc82e'; c.fillText("EDDY'S", h * 1.0, h * 0.7); return; }
  c.save(); c.translate(h * 0.62, h * 0.5); mortar(c, h * 0.36); c.restore(); c.textAlign = 'left'; c.fillStyle = '#ffd36b'; c.font = `italic 700 ${Math.round(h * 0.5)}px Georgia, serif`; c.fillText('Eddy & Zn', h * 1.15, h * 0.68);
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
  const t = part === 'roof' ? canvasTex(512, 160, (c, w, h) => roofLogo(c, w, h, id))
    : canvasTex(1024, 256, (c, w, h) => (id === 'zn' ? sideZn : id === 'eddys' ? sideEddys : id === 'shooki' ? sideShooki : (cc, ww, hh) => sideBiz(cc, ww, hh, BIZ[+id.slice(3)]))(c, w, h));
  t.anisotropy = 8; return (cache[k] = t);
}

// ---- the Oofmobiel's panel between the wheel arches (1024 x 384, about 2 x 0.75 m): stacked layouts
function panelZn(c, w, h) {
  c.fillStyle = '#f2e6c8'; c.fillRect(0, 0, w, h);
  c.fillStyle = '#6b1410'; c.fillRect(0, 0, w, 14); c.fillRect(0, h - 86, w, 86);
  c.fillStyle = '#e8a33d'; c.fillRect(0, 20, w, 5); c.fillRect(0, h - 94, w, 5);
  c.save(); c.translate(150, 150); mortar(c, 100); c.restore();
  c.textAlign = 'left'; c.fillStyle = '#6b1410'; c.font = 'italic 700 118px Georgia, "Times New Roman", serif'; c.fillText('Eddy & Zn', 300, 160);
  c.fillStyle = '#3a2a1a'; c.font = '700 33px Arial'; c.fillText('SPECERIJEN · KRUIDEN · GROOTHANDEL', 304, 214);
  c.font = '400 27px Arial'; c.fillText('Familiebedrijf sinds 1987 · Kipkruidenkwartier', 304, 256);
  c.textAlign = 'center'; c.fillStyle = '#f2e6c8'; c.font = '700 34px Arial'; c.fillText('Tel. 020 - 555 1987   ·   Levering aan horeca en slagerij', w / 2, h - 32);
}
function panelEddys(c, w, h) {
  c.beginPath(); c.moveTo(0, h * 0.7); c.bezierCurveTo(w * 0.35, h * 0.78, w * 0.65, h * 0.42, w, h * 0.3); c.lineTo(w, h); c.lineTo(0, h); c.closePath();
  const gr = c.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#ffc82e'); gr.addColorStop(0.45, '#ff7a1a'); gr.addColorStop(1, '#c4121a'); c.fillStyle = gr; c.fill();
  c.beginPath(); c.moveTo(0, h * 0.86); c.bezierCurveTo(w * 0.4, h * 0.92, w * 0.7, h * 0.6, w, h * 0.52); c.lineTo(w, h); c.lineTo(0, h); c.closePath(); c.fillStyle = '#1a0e0a'; c.fill();
  c.strokeStyle = '#ffffff'; c.lineWidth = 7; c.beginPath(); c.moveTo(0, h * 0.82); c.bezierCurveTo(w * 0.4, h * 0.88, w * 0.7, h * 0.56, w, h * 0.48); c.stroke();
  c.save(); c.translate(140, 135); chili(c, 110); c.restore();
  c.textAlign = 'left'; c.lineJoin = 'round';
  c.font = 'italic 900 140px "Arial Black", Arial'; c.lineWidth = 18; c.strokeStyle = '#1a0e0a'; c.strokeText("Eddy's", 275, 170); c.fillStyle = '#ffffff'; c.fillText("Eddy's", 275, 170);
  c.font = '700 28px Arial'; c.lineWidth = 8; c.strokeText('SPICE MASTER · KRUIDEN VOOR HEEL KAASLAND', 282, 222); c.fillStyle = '#ffd36b'; c.fillText('SPICE MASTER · KRUIDEN VOOR HEEL KAASLAND', 282, 222);
  c.textAlign = 'right'; c.fillStyle = '#ffffff'; c.font = '900 52px Arial'; c.fillText('0800 - EDDYS', w - 40, h - 52);
  c.font = '700 30px Arial'; c.fillText('www.eddys.kl', w - 40, h - 16);
}
export function panelTex(canvasTex, id) { const k = id + ':panel'; return cache[k] || (cache[k] = canvasTex(1024, 384, (c, w, h) => (id === 'eddys' ? panelEddys : panelZn)(c, w, h))); }
