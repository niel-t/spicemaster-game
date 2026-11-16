// Canal boats seen from above, for the painted map (kaasaerial.js) and the title screen (titlecity.js). Bow along +x, centred.
// o: { l, w, kind: 'sloep' | 'tour' | 'barge' | 'cruiser', hull, deck, wake (0..1) }
const WOOD = '#a8703f', CREAM = '#f3e6c8', SAFFRON = '#e8a33d', CUMIN = '#7a4a26', CLOVE = '#3b2418', GLASS = '#bcdde6';
function pointed(ctx, l, w, k = 1) { // a sloep / cruiser hull outline, scaled by k
  const L = l * k, W = w * k;
  ctx.beginPath(); ctx.moveTo(L / 2, 0); ctx.bezierCurveTo(L * 0.38, -W * 0.48, L * 0.05, -W / 2, -L / 2, -W * 0.42);
  ctx.lineTo(-L / 2, W * 0.42); ctx.bezierCurveTo(L * 0.05, W / 2, L * 0.38, W * 0.48, L / 2, 0); ctx.closePath();
}
function rounded(ctx, l, w, k = 1, bow = 0.16) { // a tjalk / rondvaart hull: round both ends
  const L = l * k, W = w * k, r = W / 2;
  ctx.beginPath(); ctx.moveTo(-L / 2 + r * 0.8, -r);
  ctx.lineTo(L / 2 - L * bow, -r); ctx.quadraticCurveTo(L / 2, -r * 0.95, L / 2, 0); ctx.quadraticCurveTo(L / 2, r * 0.95, L / 2 - L * bow, r);
  ctx.lineTo(-L / 2 + r * 0.8, r); ctx.quadraticCurveTo(-L / 2, r, -L / 2, 0); ctx.quadraticCurveTo(-L / 2, -r, -L / 2 + r * 0.8, -r); ctx.closePath();
}
export function boatKind(o) { return o.kind || (o.tour ? 'tour' : o.barge ? 'barge' : o.hull === '#fbf8f0' ? 'cruiser' : 'sloep'); }
export function topBoat(ctx, o, t = 0) {
  const l = o.l, w = o.w, kind = boatKind(o), lw = Math.max(0.12, w * 0.07);
  // the wake: two strands peeling off the stern quarters, and churned water behind the screw
  if (o.wake !== 0) {
    const a = o.wake ?? 1;
    ctx.strokeStyle = `rgba(255,255,255,${0.5 * a})`; ctx.lineWidth = Math.max(0.2, w * 0.12); ctx.lineCap = 'round';
    ctx.beginPath(); for (const s of [-1, 1]) { ctx.moveTo(-l * 0.42, s * w * 0.4); ctx.quadraticCurveTo(-l * 0.95, s * w * 0.75, -l * 1.6, s * w * 1.5); } ctx.stroke();
    ctx.fillStyle = `rgba(255,255,255,${0.35 * a})`; ctx.beginPath(); ctx.ellipse(-l * 0.72, 0, l * 0.24, w * 0.16 * (1 + Math.sin(t * 6) * 0.08), 0, 0, 7); ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${0.45 * a})`; ctx.lineWidth = Math.max(0.15, w * 0.08); ctx.beginPath(); ctx.arc(l * 0.36, 0, w * 0.62, -1.1, 1.1); ctx.stroke(); // bow wave
  }
  // shadow on the water
  ctx.fillStyle = 'rgba(20,45,55,.25)'; ctx.save(); ctx.translate(w * 0.18, w * 0.22); (kind === 'tour' || kind === 'barge' ? rounded : pointed)(ctx, l, w); ctx.fill(); ctx.restore();
  // hull with a darker gunwale
  const shape = kind === 'tour' || kind === 'barge' ? rounded : pointed;
  ctx.fillStyle = o.hull; shape(ctx, l, w); ctx.fill(); ctx.strokeStyle = 'rgba(30,18,10,.45)'; ctx.lineWidth = lw; ctx.stroke();
  if (kind === 'sloep') {
    ctx.fillStyle = WOOD; shape(ctx, l, w, 0.8); ctx.fill(); // the floorboards
    ctx.fillStyle = o.deck || SAFFRON; ctx.fillRect(-l * 0.36, -w * 0.34, l * 0.46, w * 0.16); ctx.fillRect(-l * 0.36, w * 0.18, l * 0.46, w * 0.16); ctx.fillRect(-l * 0.4, -w * 0.3, l * 0.08, w * 0.6); // the U bench
    ctx.fillStyle = CREAM; ctx.fillRect(-l * 0.08, w * 0.04, l * 0.08, w * 0.22); // the console
    ctx.fillStyle = '#2a2c30'; ctx.fillRect(-l * 0.56, -w * 0.11, l * 0.07, w * 0.22); // the outboard
  } else if (kind === 'cruiser') {
    ctx.fillStyle = '#c8a070'; shape(ctx, l, w, 0.82); ctx.fill();
    ctx.fillStyle = o.hull; ctx.fillRect(-l * 0.12, -w * 0.33, l * 0.36, w * 0.66); // the cabin top
    ctx.fillStyle = '#2c3e48'; ctx.fillRect(-l * 0.14, -w * 0.3, l * 0.03, w * 0.6); // the windscreen
    ctx.fillStyle = CUMIN; ctx.fillRect(-l * 0.38, -w * 0.36, l * 0.22, w * 0.72); // the canopy
    ctx.fillStyle = '#2a2c30'; ctx.fillRect(-l * 0.56, -w * 0.1, l * 0.06, w * 0.2);
  } else if (kind === 'tour') {
    ctx.fillStyle = CREAM; rounded(ctx, l, w, 0.86); ctx.fill();
    ctx.fillStyle = GLASS; ctx.fillRect(-l * 0.33, -w * 0.38, l * 0.66, w * 0.76); // the glass roof
    ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.fillRect(-l * 0.33, -w * 0.12, l * 0.66, w * 0.08); // its shine
    ctx.strokeStyle = CREAM; ctx.lineWidth = Math.max(0.12, l * 0.008); ctx.beginPath(); for (let k = 0; k <= 10; k++) { const x = -l * 0.33 + l * 0.066 * k; ctx.moveTo(x, -w * 0.38); ctx.lineTo(x, w * 0.38); } ctx.stroke();
    ctx.fillStyle = SAFFRON; ctx.fillRect(-l * 0.44, -w * 0.12, l * 0.05, w * 0.24); // the skipper's stand
  } else { // the tjalk: leeboards, a cream cabin roof, the wheelhouse, the lowered mast
    ctx.fillStyle = '#c89a5a'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(l * 0.12, s * w * 0.55, l * 0.07, w * 0.09, 0, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#8a6040'; rounded(ctx, l, w, 0.84); ctx.fill();
    ctx.fillStyle = CREAM; ctx.fillRect(-l * 0.22, -w * 0.28, l * 0.52, w * 0.56); ctx.fillStyle = CUMIN; ctx.fillRect(-l * 0.2, -w * 0.22, l * 0.48, w * 0.44);
    ctx.fillStyle = CLOVE; ctx.fillRect(-l * 0.4, -w * 0.28, l * 0.13, w * 0.56); ctx.fillStyle = CREAM; ctx.fillRect(-l * 0.39, -w * 0.24, l * 0.11, w * 0.48);
    ctx.strokeStyle = '#c89060'; ctx.lineWidth = Math.max(0.15, w * 0.06); ctx.beginPath(); ctx.moveTo(-l * 0.25, 0); ctx.lineTo(l * 0.42, 0); ctx.stroke();
    ctx.fillStyle = o.deck || '#5a8a4a'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(l * 0.35, (k - 1) * w * 0.2, w * 0.07, 0, 7); ctx.fill(); }
  }
}
