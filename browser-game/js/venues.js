// The two ends of the longer street (2026-11-24):
//  - West: CLUB MONIQUE, Eddy Jr.'s favourite strip club. A reception room with the bouncer, Creplach (a rabbi, strict, deadpan),
//    who wants W 200 a night to let you through. Inside: a bar, a centre stage with three dancers (Brie, Feta and Edam) who each run a string of moves, and on
//    a front seat Jossi, Eddy's friend, always there and always angling for the next dance. Tip a dancer and she comes over; the privé booth shows a lap dance up close; the paid extras happen behind a shut curtain, with a
//    text card: no nudity, stage lingerie only.
//  - East: TRYSHTAHN AUTO. A big empty plot off the street, then a round glass showroom with three cars on turntables: the boxy
//    Kaasland Kombi, the sporty Stuttgart 911-ish Zuidwester, and a golden Rolls-ish Koninklijke. Tryshtahn stands up front and always
//    asks Eddy double: the first time you come in, a local buys a Kombi for W 5,000 and you get quoted W 10,000 ("immigrant price").
//    Buying cars comes later.
// state.club = { paidDay, visits, dances }, state.dealer = { seen } are saved with the game.
import { hex01 } from './characters.js';

// ---- dance moves: a pose laid over the idle through the character's `extra` hook (characters.js poseOf), plus a root offset.
// st = { move, t (seconds into the move), w (0..1 blend in/out) }
const AX = [1, 0, 0], AZ = [0, 0, 1], AY = [0, 1, 0];
export const DANCE_MOVES = ['sway', 'roll', 'drop', 'shake', 'spin', 'lap'];
export function danceExtra(st) {
  return (R, rot) => {
    const t = st.t, w = st.w, m = st.move, s = Math.sin, hip = (x, z) => { rot('pelvis', AX, x * w); rot('pelvis', AZ, z * w); rot('spine', AX, -x * 0.8 * w); rot('spine', AZ, -z * 0.85 * w); rot('chest', AZ, -z * 0.2 * w); };
    const armsUp = (k) => { rot('uarmL', AZ, 2.0 * k * w); rot('uarmR', AZ, -2.0 * k * w); rot('farmL', AZ, 1.3 * k * w); rot('farmR', AZ, -1.3 * k * w); };
    const knees = (k, spread = 0) => { for (const [sd, sg] of [['L', 1], ['R', -1]]) { rot('thigh' + sd, AX, -k * w); rot('shin' + sd, AX, k * 1.55 * w); if (spread) rot('thigh' + sd, AZ, sg * spread * w); } };
    const lean = (a) => { rot('pelvis', AX, a * w); rot('thighL', AX, -a * w); rot('thighR', AX, -a * w); }; // tip the hips forward, legs stay under her
    if (m === 'sway') { hip(0, s(t * 3.2) * 0.2); armsUp(0.8 + 0.08 * s(t * 1.6)); knees(0.12 + 0.06 * s(t * 6.4)); }
    else if (m === 'roll') { hip(s(t * 3.4) * 0.17, Math.cos(t * 3.4) * 0.19); armsUp(0.25); knees(0.18); rot('head', AZ, s(t * 1.7) * 0.15 * w); }
    else if (m === 'drop') { const d = dropDepth(t); knees(0.1 + 1.15 * d, 0.3 * d); rot('spine', AX, 0.12 * d * w); hip(0, s(t * 6) * 0.08 * (1 - d)); armsUp(0.4 * (1 - d)); }
    else if (m === 'shake') { knees(0.32); lean(0.5); rot('spine', AX, 0.22 * w); rot('chest', AX, -0.3 * w); rot('head', AX, -0.35 * w); rot('pelvis', AZ, s(t * 17) * 0.085 * w); rot('spine', AZ, -s(t * 17) * 0.07 * w); rot('uarmL', AX, -0.5 * w); rot('uarmR', AX, -0.5 * w); }
    else if (m === 'spin') { rot('thighL', AX, -1.0 * w); rot('shinL', AX, 1.35 * w); rot('spine', AX, -0.22 * w); rot('head', AX, -0.25 * w); armsUp(0.75); rot('thighR', AX, 0.15 * w); }
    else if (m === 'lap') { const d = 0.55 + 0.2 * s(t * 2.4); knees(0.1 + 0.75 * d, 0.22); lean(0.34); rot('spine', AX, 0.1 * w); rot('chest', AX, -0.25 * w); rot('pelvis', AZ, s(t * 4.8) * 0.16 * w); rot('spine', AZ, -s(t * 4.8) * 0.13 * w); rot('uarmL', AX, -0.35 * w); rot('uarmR', AX, -0.35 * w); }
  };
}
function dropDepth(t) { const c = (t % 3.2) / 3.2; return c < 0.25 ? Math.pow(Math.sin(c / 0.25 * Math.PI / 2), 2) : c < 0.5 ? 1 - 0.25 * Math.abs(Math.sin((c - 0.25) / 0.25 * Math.PI * 2)) : c < 0.75 ? Math.pow(Math.cos((c - 0.5) / 0.25 * Math.PI / 2), 2) : 0; }
// how far the move lowers / bounces the whole body (metres, in the body's own scale)
export function danceY(st) {
  const t = st.t, w = st.w, m = st.move;
  if (m === 'drop') return -0.4 * dropDepth(t) * w;
  if (m === 'shake') return (-0.07 + Math.abs(Math.sin(t * 8.5)) * 0.035) * w;
  if (m === 'lap') return (-0.24 - 0.09 * Math.sin(t * 2.4) + Math.abs(Math.sin(t * 4.8)) * 0.03) * w;
  if (m === 'spin') return 0.1 * w;
  return Math.abs(Math.sin(t * 3.2)) * 0.05 * w;
}

const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
const pick = (a) => a[Math.floor(Math.random() * a.length)];

// stage lingerie, painted over the body sheet (characters.js layout: torso rows 0-290 from Y 1.51 down to 0.8, u 256 = centre front,
// 0/512 = centre back; sleeves 290-380, cuffs 381-399 (also the neck band: a choker), legs 440-512): smooth skin, a plunge balconette
// bra with a lace edge, a thong on a thin waistband, sheer hold-up stockings with lace tops.
// No nudity: the bra and the brief are always on.
function paintLingerie(cv, skin, col) {
  const x = cv.getContext('2d'), W = cv.width, k = W / 512, ty = (Y) => (1.51 - Y) / 0.71 * 290 * k, fx = (m) => (256 + m * 340) * k;
  const rgb = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`, sk = [(skin >> 16) & 255, (skin >> 8) & 255, skin & 255], cl = [(col >> 16) & 255, (col >> 8) & 255, col & 255];
  const dark = cl[0] + cl[1] + cl[2] < 150, dk = dark ? [8, 6, 10] : cl.map((v) => v * 0.45), lt = dark ? [110, 100, 124] : cl.map((v) => Math.min(255, v * 1.25 + 40)), skd = sk.map((v, i) => v * [0.8, 0.72, 0.7][i]), skl = sk.map((v) => Math.min(255, v * 1.1 + 8));
  const blob = (cx, cy, rx, ry, c) => { const g = x.createRadialGradient(cx, cy, 0, cx, cy, 1); g.addColorStop(0, c); g.addColorStop(1, 'rgba(0,0,0,0)'); x.save(); x.translate(cx, cy); x.scale(rx, ry); x.fillStyle = g; x.fillRect(-1, -1, 2, 2); x.restore(); };
  const mOf = (u) => (u / k - 256) / 340; // metres round the body from the centre front; the centre back is about +-0.75
  // smooth warm skin with soft modelling: spine, shoulder blades, collar bones, a toned belly, the small of the back
  x.fillStyle = rgb(sk); x.fillRect(0, 0, W, 400 * k);
  for (const u of [0, W]) { blob(u, ty(1.2), 10 * k, 130 * k, rgb(skd, 0.5)); blob(u, ty(0.97), 26 * k, 12 * k, rgb(skd, 0.4)); }
  for (const s of [-1, 1]) { blob(fx(s * 0.37), ty(1.12), 34 * k, 80 * k, rgb(skd, 0.32)); blob(fx(s * 0.6), ty(1.36), 30 * k, 22 * k, rgb(skl, 0.3)); blob(fx(s * 0.09), ty(1.455), 34 * k, 5 * k, rgb(skd, 0.35)); blob(fx(s * 0.05), ty(1.08), 8 * k, 40 * k, rgb(skl, 0.25)); }
  x.strokeStyle = rgb(skd, 0.4); x.lineWidth = 2 * k; x.beginPath(); x.moveTo(fx(0), ty(1.17)); x.lineTo(fx(0), ty(1.0)); x.stroke(); blob(fx(0), ty(1.04), 4 * k, 6 * k, rgb(skd, 0.7)); // belly line and navel
  const scallop = (pts, r, c) => { x.fillStyle = c; for (const [px, py] of pts) { x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); } };
  const laceFill = (path, c) => { x.save(); path(); x.clip(); x.fillStyle = c; x.fillRect(0, 0, W, 300 * k); x.strokeStyle = rgb(lt, dark ? 0.3 : 0.4); x.lineWidth = 0.8 * k; for (let d = -300; d < 812; d += 7) { x.beginPath(); x.moveTo(d * k, 0); x.lineTo((d + 150) * k, 300 * k); x.moveTo((d + 150) * k, 0); x.lineTo(d * k, 300 * k); x.stroke(); } x.restore(); };
  // --- bra: a thin band round the back, plunge cups with a scalloped lace top edge, thin straps, a bow
  x.fillStyle = rgb(cl); x.fillRect(0, ty(1.235), W, ty(1.218) - ty(1.235)); x.fillStyle = rgb(dk, 0.6); x.fillRect(0, ty(1.221), W, 1.5 * k);
  for (const s of [-1, 1]) {
    const cup = () => { x.beginPath(); x.moveTo(fx(s * 0.012), ty(1.228)); x.quadraticCurveTo(fx(s * 0.03), ty(1.29), fx(s * 0.105), ty(1.335)); x.quadraticCurveTo(fx(s * 0.165), ty(1.32), fx(s * 0.185), ty(1.235)); x.quadraticCurveTo(fx(s * 0.1), ty(1.195), fx(s * 0.012), ty(1.228)); x.closePath(); };
    laceFill(cup, rgb(cl));
    blob(fx(s * 0.1), ty(1.275), 20 * k, 13 * k, rgb(lt, 0.5)); blob(fx(s * 0.1), ty(1.225), 26 * k, 6 * k, rgb(dk, 0.45)); // sheen, underwire shade
    x.strokeStyle = rgb(dk); x.lineWidth = 2 * k; cup(); x.stroke();
    const top = []; for (let t = 0; t <= 1; t += 0.125) { const a = 1 - t, px = a * a * fx(s * 0.012) + 2 * a * t * fx(s * 0.03) + t * t * fx(s * 0.105), py = a * a * ty(1.228) + 2 * a * t * ty(1.29) + t * t * ty(1.335); top.push([px, py]); } scallop(top, 2.6 * k, rgb(dk));
    x.strokeStyle = rgb(cl); x.lineWidth = 2.6 * k; x.beginPath(); x.moveTo(fx(s * 0.105), ty(1.335)); x.lineTo(fx(s * 0.115), 0); x.moveTo(fx(s * 0.6), 0); x.lineTo(fx(s * 0.62), ty(1.235)); x.stroke(); // straps, front and back
    blob(fx(s * 0.045), ty(1.31), 12 * k, 16 * k, rgb(skl, 0.35)); // a soft highlight above the cup
  }
  blob(fx(0), ty(1.275), 4 * k, 16 * k, rgb(skd, 0.6)); // cleavage
  x.fillStyle = rgb(lt); for (const s of [-1, 1]) { x.beginPath(); x.ellipse(fx(s * 0.012), ty(1.226), 4 * k, 2.4 * k, s * 0.4, 0, 7); x.fill(); } x.fillStyle = rgb(dk); x.beginPath(); x.arc(fx(0), ty(1.226), 1.6 * k, 0, 7); x.fill(); // bow
  // --- thong: a string waistband, a deep V front panel, a small triangle and string at the back (no garter belt: the stockings are hold-ups)
  // lower edge of the cloth at u: a narrow V at the front, bare hips, and at the back only the thong's small triangle and its string
  const low = (u) => { const m = Math.abs(mOf(u)); const f = m < 0.3 ? Math.min(1, Math.max(0, (m - 0.022) / 0.15)) : Math.pow(Math.min(1, Math.max(0, (0.753 - m - 0.012) / 0.07)), 0.55); return 0.795 + 0.118 * Math.pow(f, 0.8); };
  const brief = () => { x.beginPath(); x.moveTo(0, ty(0.925)); x.lineTo(W, ty(0.925)); for (let u = W; u >= 0; u -= 2 * k) x.lineTo(u, Math.max(ty(0.925), ty(low(u)) + 3 * k)); x.closePath(); };
  laceFill(brief, rgb(cl));
  x.save(); brief(); x.clip(); blob(fx(0), ty(0.84), 22 * k, 26 * k, rgb(cl, 0.9)); blob(fx(0), ty(0.86), 12 * k, 14 * k, rgb(lt, 0.4)); x.restore(); // a satin front panel
  x.strokeStyle = rgb(dk); x.lineWidth = 2 * k; x.beginPath(); for (let u = 0; u <= W; u += 2 * k) { const yy = Math.max(ty(0.925), ty(low(u)) + 3 * k); if (!u) x.moveTo(u, yy); else x.lineTo(u, yy); } x.stroke();
  x.fillStyle = rgb(cl); x.fillRect(0, ty(0.925) - 2 * k, W, 4 * k); x.fillStyle = rgb(lt, 0.6); x.fillRect(0, ty(0.925) - 2 * k, W, 1 * k); // the string
  x.fillStyle = rgb(lt); for (const s of [-1, 1]) { x.beginPath(); x.ellipse(fx(s * 0.014), ty(0.925), 4 * k, 2.4 * k, s * 0.4, 0, 7); x.fill(); }
  for (const u of [fx(-0.58), fx(0.58)]) { blob(u, ty(0.85), 44 * k, 26 * k, rgb(skl, 0.4)); blob(u, ty(0.8), 50 * k, 5 * k, rgb(skd, 0.4)); } // a highlight on each bare cheek, the crease under it
  for (const s of [-1, 1]) { blob(fx(s * 0.2), ty(0.96), 16 * k, 26 * k, rgb(skd, 0.3)); blob(fx(s * 0.075), ty(1.1), 5 * k, 34 * k, rgb(skd, 0.28)); blob(fx(s * 0.04), ty(1.11), 9 * k, 26 * k, rgb(skl, 0.3)); } // hip-bone hollows and the soft lines of a toned belly
  x.fillStyle = '#e8eef8'; x.beginPath(); x.arc(fx(0), ty(1.035), 2.2 * k, 0, 7); x.fill(); x.fillStyle = rgb(lt); x.beginPath(); x.arc(fx(0), ty(1.022), 1.6 * k, 0, 7); x.fill(); // a navel piercing
  // --- arms: bare, a lace wrist band; the cuff rows double as the neck band, so that is a choker
  x.fillStyle = rgb(sk); x.fillRect(0, 290 * k, W, 110 * k); blob(128 * k, 320 * k, 120 * k, 20 * k, rgb(skl, 0.25));
  x.fillStyle = rgb(dk); x.fillRect(0, 381 * k, W, 5 * k); x.fillStyle = rgb(lt, 0.5); x.fillRect(0, 381 * k, W, 1 * k);
  // --- legs: bare thigh, then a lace stocking top and sheer stockings with a back seam and a soft sheen down the shin
  x.fillStyle = rgb(sk); x.fillRect(0, 440 * k, W, 72 * k);
  const st = sk.map((v, i) => v * 0.5 + dk[i] * 0.3 + 6), g = x.createLinearGradient(0, 463 * k, 0, 512 * k); g.addColorStop(0, rgb(st)); g.addColorStop(1, rgb(st.map((v) => v * 0.85)));
  x.fillStyle = g; x.fillRect(0, 463 * k, W, 49 * k);
  x.save(); x.globalAlpha = 0.9; laceFill(() => { x.beginPath(); x.rect(0, 0, 0, 0); }, 'rgba(0,0,0,0)'); x.restore();
  x.fillStyle = rgb(dk); x.fillRect(0, 459 * k, W, 7 * k); x.strokeStyle = rgb(lt, 0.45); x.lineWidth = 0.8 * k; for (let u = 0; u < W; u += 5 * k) { x.beginPath(); x.moveTo(u, 459 * k); x.lineTo(u + 4 * k, 466 * k); x.moveTo(u + 4 * k, 459 * k); x.lineTo(u, 466 * k); x.stroke(); }
  const hem = []; for (let u = 0; u <= W; u += 6 * k) hem.push([u, 459 * k]); scallop(hem, 2.2 * k, rgb(dk));
  // the leg's own shading (u 256 = the front of the leg, 0/512 = the back): a long sheen down thigh and shin, darker sides, a knee, a back seam
  { const gg = x.createLinearGradient(0, 0, W, 0); gg.addColorStop(0, 'rgba(0,0,0,.2)'); gg.addColorStop(0.22, 'rgba(0,0,0,.28)'); gg.addColorStop(0.5, 'rgba(255,255,255,.2)'); gg.addColorStop(0.78, 'rgba(0,0,0,.28)'); gg.addColorStop(1, 'rgba(0,0,0,.2)'); x.fillStyle = gg; x.fillRect(0, 440 * k, W, 72 * k); }
  blob(256 * k, 462 * k, 22 * k, 14 * k, 'rgba(255,255,255,.2)'); blob(256 * k, 494 * k, 14 * k, 14 * k, 'rgba(255,255,255,.2)'); blob(256 * k, 477 * k, 26 * k, 3 * k, 'rgba(0,0,0,.2)');
  x.strokeStyle = rgb(dk, 0.8); x.lineWidth = 1.4 * k; for (const u of [1 * k, W - 1 * k]) { x.beginPath(); x.moveTo(u, 466 * k); x.lineTo(u, 512 * k); x.stroke(); }
}

// looks (js/characters.js fields)
const LOOK = {
  creplach: { tex: 512, skin: hex01(0xe8c0a0), hair: hex01(0x1a1410), hs: 'normal', beard: hex01(0x2a2018), fluff: 1, glasses: 1, hat: 'fedora', hatC: hex01(0x111114), calm: 1, body: 'big', B: { nowatch: true },
    shirt: hex01(0x111114), jacket: hex01(0x111114), pants: hex01(0x111114), shoes: hex01(0x0a0a0a), tee: 1,
    shirtPaint: { shirt: [0x11, 0x11, 0x14], pants: [0x11, 0x11, 0x14], skin: [0xf4, 0xf2, 0xec], belt: [0x0a, 0x0a, 0x0a], vDepth: 1.4, chain: false, sleeves: 'long', buttons: true } },
  jossi: { tex: 512, skin: hex01(0xf0c4a8), hair: hex01(0x2a1e16), hs: 'normal', stubble: 1, smile: 1, calm: 0.4, body: 'fat', B: { nowatch: true },
    shirt: hex01(0x1e3a8a), jacket: hex01(0x1e3a8a), pants: hex01(0x2a2c34), shoes: hex01(0x1a1410), tee: 1,
    shirtPaint: { shirt: [0x1e, 0x3a, 0x8a], pants: [0x2a, 0x2c, 0x34], skin: [0xf0, 0xc4, 0xa8], belt: [0x1a, 0x14, 0x10], vDepth: 1.38, chain: false, sleeves: 'long', buttons: true } },
  tryshtahn: { tex: 512, skin: hex01(0xc8906a), hair: hex01(0x1a1410), hs: 'buzz', stubble: 1, stache: 1, smile: 1, calm: 1, hat: 'wrap', hatC: hex01(0x1c2a5a), body: 'big', watch: 1, B: { nowatch: false },
    shirt: hex01(0x14161c), jacket: hex01(0x14161c), pants: hex01(0x14161c), shoes: hex01(0x0e0c0a), tee: 1,
    shirtPaint: { shirt: [0x14, 0x16, 0x1c], pants: [0x14, 0x16, 0x1c], skin: [0xf6, 0xf6, 0xf2], belt: [0x0e, 0x0c, 0x0a], vDepth: 1.42, chain: false, sleeves: 'long', buttons: true } },
  dancer: (skin, hair, outfit, hs, lingerie, extra, bust = 1.3, hairK) => ({ ...(extra || {}), bustJig: 0.7 + bust * 0.3, paintBody: (cv) => paintLingerie(cv, skin, lingerie || outfit), tex: 512, fem: 1, skin: hex01(skin), hair: hex01(hair), hs, smile: 1, calm: 1, body: 'slim', heels: 1, jiggle: 1, glam: 1, B: { nowatch: true, gluteK: 4.4, hourglass: 1, bustK: bust, hairK: hairK || null },
    shirt: hex01(outfit), jacket: hex01(outfit), pants: hex01(outfit), shoes: hex01(0x111111), tee: 1, /* a stage catsuit: no skirt tube over the hips */
    shirtPaint: { shirt: [(outfit >> 16) & 255, (outfit >> 8) & 255, outfit & 255], pants: [(outfit >> 16) & 255, (outfit >> 8) & 255, outfit & 255], skin: [(skin >> 16) & 255, (skin >> 8) & 255, skin & 255], neck: 'crew', sleeves: 'rolled', buttons: false } }),
};
LOOK.statue = { tex: 512, fem: 1, skin: hex01(0xf2f0ea), hair: hex01(0xe8e4dc), hs: 'long', calm: 1, body: 'slim', B: { nowatch: true },
  shirt: hex01(0xf4f2ee), jacket: hex01(0xf4f2ee), pants: hex01(0xf4f2ee), shoes: hex01(0xf2f0ea), tee: 1, skirt: hex01(0xf4f2ee),
  shirtPaint: { shirt: [0xf4, 0xf2, 0xee], pants: [0xf4, 0xf2, 0xee], skin: [0xf2, 0xf0, 0xea], neck: 'crew', sleeves: 'long', buttons: false } }; // a marble figure in a draped robe
const DANCERS = [
  { name: 'Brie', bust: 1.3, skin: 0xf2d0b8, hair: 0xe8c46a, outfit: 0xe83a8a, lingerie: 0xe8287a, hairK: 'pony', // Brie: the girl next door. A high blonde ponytail, big round blue eyes, a button nose, a soft pink pout, freckles
    extra: { lips: hex01(0xe84a86), shadow: hex01(0xc87aa8), iris: hex01(0x3a8ad0), browW: 2.6, hatC: hex01(0xe8287a), glamF: { eye: 1.3, iris: 1.2, lid: 1.2, wing: 0.5, lash: 1.1, nose: 0.55, noseW: 0.8, chin: 0.55, lipW: 0.86, lipUp: 1.1, lipLo: 1.15, bow: 1.5, smile: 2.2, freckles: 1 } }, hs: 'long', card: 'Brie dances to "Gouda Vibrations". Eddy Jr. holds his breath for the entire song. Jossi claps on the wrong beat.' },
  { name: 'Feta', bust: 1.65, skin: 0xc89070, hair: 0x1a1410, outfit: 0x3ad8e8, lingerie: 0x1c1a24, hairK: 'bob', // Feta: the femme fatale. A sleek black bob with a blunt fringe, narrow green cat eyes, a straight slim nose, wide dark-red lips, a beauty mark
    extra: { lips: hex01(0xa80e22), shadow: hex01(0x2a2030), iris: hex01(0x3aa06a), browW: 3, calm: 0.55, mole: 1, glamF: { eye: 1.12, iris: 1.0, lid: 0.78, wing: 1.8, wingUp: 1.2, lash: 1.2, nose: 0.9, noseW: 0.7, chin: 1.1, lipW: 1.15, lipUp: 0.9, lipLo: 0.9, bow: 0.8, smile: 0.6 } }, hs: 'long', card: 'Feta does a slow spin and a sequin lands in Eddy Jr.\'s hair. He keeps it. He will always keep it.' },
  { name: 'Edam', bust: 2.05, skin: 0x8a5a3a, hair: 0x1a1410, outfit: 0xf2c14e, lingerie: 0xc8141e, // Edam: the diva. Big curls, wide-set almond brown eyes under gold lids, a broader nose, very full lips
    extra: { lips: hex01(0xc8204a), shadow: hex01(0xd09a2a), iris: hex01(0x7a4a22), browW: 3.6, glamF: { eye: 1.2, iris: 1.15, lid: 0.95, wing: 1.1, lash: 1.5, nose: 0.75, noseW: 1.25, chin: 0.8, jaw: 0.003, lipW: 1.05, lipUp: 1.35, lipLo: 1.4, bow: 1.0, smile: 1.4 } }, hs: 'big', card: 'Edam dances like the rent is due. Eddy Jr. forgets his own name, the warehouse and most of the alphabet.' },
];
export const DANCER_LOOKS = () => DANCERS.map((d) => LOOK.dancer(d.skin, d.hair, d.outfit, d.hs, d.lingerie, d.extra, d.bust, d.hairK)); // dev/characters.html ?set=dancers
const DANCE = 50, ENTRY = 200;

export function createVenues(deps) {
  const { THREE, scene, box, cyl, lam, signTex, solid, addInteract, player, state, dialogue, choice, toast, beep, addMoney } = deps;
  const day = () => deps.day();
  const far = new THREE.Vector3(0, -99, 0);
  const V3 = (x, z) => new THREE.Vector3(x, 0, z);
  const C = () => { if (!state.club || typeof state.club !== 'object') state.club = {}; const c = state.club; c.visits = c.visits | 0; c.dances = c.dances | 0; return c; };
  const D = () => { if (!state.dealer || typeof state.dealer !== 'object') state.dealer = {}; return state.dealer; };
  const neon = (c) => new THREE.MeshBasicMaterial({ color: c });

  // ================================================================== CLUB MONIQUE
  const K = { x0: -66, x1: -50, z0: -21, z1: -6.5, h: 4.6, door: -58, part: -11 }; // part = the wall between the reception and the club
  const club = new THREE.Group(), clubHi = new THREE.Group(); scene.add(club); scene.add(clubHi);
  const inClub = (p) => p.x > K.x0 && p.x < K.x1 && p.z > K.z0 && p.z < K.z1 - 0.05;
  const inBack = (p) => inClub(p) && p.z < K.part;
  {
    const brick = lam({ color: 0x2a1e2a }), black = lam({ color: 0x121014 }), velvet = lam({ color: 0x5a0a2a }), gold = lam({ color: 0xd8a83a, emissive: 0x3a2a00 }), wood = lam({ color: 0x3a2014 });
    const W = K.x1 - K.x0, Dp = K.z1 - K.z0, cx = (K.x0 + K.x1) / 2, cz = (K.z0 + K.z1) / 2;
    // floors: a checker in the reception, dark purple carpet in the club
    box(W, 0.02, K.z1 - K.part, lam({ map: deps.canvasTex(64, 64, (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#e8e0d0' : '#1a1418'; g.fillRect(x * 32, y * 32, 32, 32); } }) }), cx, 0.015, (K.z1 + K.part) / 2, club, false).material.map; { const m = club.children[club.children.length - 1].material.map; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(W / 1.2, 3.5); m.needsUpdate = true; }
    box(W, 0.02, K.part - K.z0, new THREE.MeshPhongMaterial({ color: 0x15111c, shininess: 70, specular: 0x404050 }), cx, 0.015, (K.part + K.z0) / 2, club, false); // glossy dark dance floor
    // Club Monique, after the photo: white plaster walls, a red pantile roof, an arched door with a dark wrought-iron door
    // folded open, white flags with the red heart and M, a white classical statue, an urn on a column, white lanterns, red brick paving.
    // Walls: the low parts stay, the upper parts and the roof go when you are inside.
    const plaster = lam({ color: 0xf2efe8 }), trim = lam({ color: 0xffffff }), iron = lam({ color: 0x2a1c14 });
    const wall = (x0, x1, z0, z1) => { const w = Math.max(0.3, x1 - x0), d = Math.max(0.3, z1 - z0); box(w, 1.1, d, plaster, (x0 + x1) / 2, 0.55, (z0 + z1) / 2, club); box(w, K.h - 1.1, d, plaster, (x0 + x1) / 2, 1.1 + (K.h - 1.1) / 2, (z0 + z1) / 2, clubHi); solid(x0, x1, z0, z1); };
    wall(K.x0 - 0.3, K.x0, K.z0, K.z1); wall(K.x1, K.x1 + 0.3, K.z0, K.z1); wall(K.x0 - 0.3, K.x1 + 0.3, K.z0 - 0.3, K.z0);
    const front = (x0, x1) => { box(x1 - x0, K.h, 0.3, plaster, (x0 + x1) / 2, K.h / 2, K.z1, clubHi); box(x1 - x0, 1.1, 0.3, plaster, (x0 + x1) / 2, 0.55, K.z1, club); solid(x0, x1, K.z1 - 0.15, K.z1 + 0.15); };
    front(K.x0 - 0.3, K.door - 1.0); front(K.door + 1.0, K.x1 + 0.3);
    box(2.0, K.h - 3.1, 0.3, plaster, K.door, 3.1 + (K.h - 3.1) / 2, K.z1, clubHi);
    // the arch: a white moulding round the top of the door opening, glazed side lights in white frames
    { const arch = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.13, 8, 20, Math.PI), trim); arch.position.set(K.door, 2.1, K.z1 + 0.17); club.add(arch);
      const fill = new THREE.Mesh(new THREE.CircleGeometry(0.98, 20, 0, Math.PI), plaster); fill.position.set(K.door, 2.1, K.z1 + 0.16); clubHi.add(fill);
      for (const sx of [-1, 1]) { box(0.12, 2.1, 0.2, trim, K.door + sx * 1.06, 1.05, K.z1 + 0.15, club, false);
        const lite = box(0.7, 2.0, 0.04, lam({ color: 0x9ab4c8, transparent: true, opacity: 0.55 }), K.door + sx * 1.55, 1.05, K.z1 + 0.17, club, false);
        for (let k = 0; k < 4; k++) box(0.72, 0.04, 0.05, trim, K.door + sx * 1.55, 0.3 + k * 0.5, K.z1 + 0.19, club, false); box(0.04, 2.0, 0.05, trim, K.door + sx * 1.55, 1.05, K.z1 + 0.19, club, false); }
      // the wrought-iron door, both leaves folded open against the inside of the facade
      const ornate = deps.canvasTex(128, 256, (g) => { g.fillStyle = '#2a1c14'; g.fillRect(0, 0, 128, 256); g.strokeStyle = '#6a4a30'; g.lineWidth = 6; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(64, 40 + k * 58, 22, 0, 7); g.stroke(); g.beginPath(); g.arc(64, 40 + k * 58, 9, 0, 7); g.stroke(); } g.strokeRect(6, 6, 116, 244); });
      for (const sx of [-1, 1]) { const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.05, 0.95), lam({ map: ornate })); leaf.position.set(K.door + sx * 0.97, 1.03, K.z1 - 0.62); club.add(leaf); } }
    // a plaque over the arch: CLUB MONIQUE with the red heart
    { const heart = (g, x, y, r, col) => { g.fillStyle = col; g.beginPath(); g.moveTo(x, y + r * 0.9); g.bezierCurveTo(x - r * 1.6, y - r * 0.2, x - r * 0.7, y - r * 1.3, x, y - r * 0.45); g.bezierCurveTo(x + r * 0.7, y - r * 1.3, x + r * 1.6, y - r * 0.2, x, y + r * 0.9); g.fill(); };
      K.heart = heart;
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.0), new THREE.MeshBasicMaterial({ map: deps.canvasTex(512, 122, (g) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, 512, 122); g.strokeStyle = '#c8b890'; g.lineWidth = 4; g.strokeRect(6, 6, 500, 110); heart(g, 70, 64, 30, '#d8202a'); g.fillStyle = '#fff'; g.font = '900 34px Georgia, serif'; g.textAlign = 'center'; g.fillText('M', 70, 74); g.fillStyle = '#b81822'; g.font = 'italic 700 58px Georgia, serif'; g.textAlign = 'left'; g.fillText('Club Monique', 118, 82); }) }));
      pl.position.set(K.door, 3.65, K.z1 + 0.17); club.add(pl);
      // two white flags on poles, angled out from the wall over the door
      const flagT = deps.canvasTex(128, 256, (g) => { g.fillStyle = '#fbfaf6'; g.fillRect(0, 0, 128, 256); g.fillStyle = '#b81822'; g.font = '700 22px Georgia, serif'; g.textAlign = 'center'; g.fillText('CLUB', 64, 46); heart(g, 64, 118, 40, '#d8202a'); g.fillStyle = '#fff'; g.font = '900 40px Georgia, serif'; g.fillText('M', 64, 130); g.fillStyle = '#b81822'; g.font = '700 22px Georgia, serif'; g.fillText('MONIQUE', 64, 206); });
      for (const sx of [-1, 1]) { const fg = new THREE.Group(); fg.position.set(K.door + sx * 2.2, 3.3, K.z1 + 0.2); fg.rotation.z = -sx * 0.45; fg.rotation.x = 0.35; club.add(fg);
        cyl(0.03, 0.03, 2.4, lam({ color: 0xd8d8d8 }), 0, 1.2, 0, fg); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.5), lam({ map: flagT, side: THREE.DoubleSide })); f.position.set(sx * 0.4, 1.55, 0.02); fg.add(f); } }
    // hanging baskets beside the door
    for (const sx of [-1, 1]) { const x = K.door + sx * 2.05; cyl(0.01, 0.01, 0.5, iron, x, 2.75, K.z1 + 0.45, club); const pot = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 10), lam({ color: 0x6a6a6a })); pot.rotation.x = Math.PI; pot.position.set(x, 2.35, K.z1 + 0.45); club.add(pot);
      for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), lam({ color: [0x6a8a3a, 0x8aa04a, 0x5a7a2a][k % 3] })); b.position.set(x + Math.cos(k * 1.3) * 0.18, 2.56, K.z1 + 0.45 + Math.sin(k * 1.3) * 0.18); club.add(b); } }
    // red brick paving in front, white lanterns, an urn on a column (right) and a classical statue on a plinth (left)
    box(7.4, 0.02, 3.4, lam({ map: deps.canvasTex(64, 64, (g) => { g.fillStyle = '#9a4a3a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#7a3a2a'; for (let y = 0; y < 64; y += 8) { g.fillRect(0, y, 64, 1); for (let x = (y / 8) % 2 ? 0 : 8; x < 64; x += 16) g.fillRect(x, y, 1, 8); } }) }), K.door, 0.022, K.z1 + 1.8, club, false).material.map.repeat.set(4, 2);
    { const m = club.children[club.children.length - 1].material.map; m.wrapS = m.wrapT = THREE.RepeatWrapping; m.needsUpdate = true; }
    // the red carpet, brass posts and a velvet rope, back by request (on top of the brick paving)
    box(1.8, 0.02, 3.2, lam({ color: 0xa01828 }), K.door, 0.035, K.z1 + 1.7, club, false);
    for (const x of [K.door - 1.3, K.door + 1.3]) for (const z of [K.z1 + 0.7, K.z1 + 2.7]) cyl(0.05, 0.07, 0.95, gold, x, 0.48, z, club);
    for (const x of [K.door - 1.3, K.door + 1.3]) { const r = box(0.04, 0.04, 2.0, velvet, x, 0.82, K.z1 + 1.7, club, false); r.rotation.x = 0.05; }
    const marble = lam({ color: 0xf4f2ee });
    for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(K.door + sx * 3.3, 0, K.z1 + 0.55); club.add(g);
      box(0.42, 0.06, 0.42, trim, 0, 0.03, 0, g); box(0.34, 0.6, 0.34, lam({ color: 0xffffff, transparent: true, opacity: 0.5 }), 0, 0.36, 0, g, false); box(0.12, 0.25, 0.12, lam({ color: 0xffd890, emissive: 0xc08a30 }), 0, 0.34, 0, g, false);
      for (const k of [0.06, 0.66]) box(0.4, 0.05, 0.4, trim, 0, k, 0, g, false); const cap = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.22, 4), trim); cap.position.y = 0.8; cap.rotation.y = Math.PI / 4; g.add(cap); }
    { const g = new THREE.Group(); g.position.set(K.door + 2.6, 0, K.z1 + 1.1); club.add(g); // the urn on its column
      box(0.5, 0.1, 0.5, marble, 0, 0.05, 0, g); cyl(0.17, 0.2, 0.85, marble, 0, 0.52, 0, g, 14); box(0.46, 0.08, 0.46, marble, 0, 0.98, 0, g);
      cyl(0.36, 0.16, 0.34, marble, 0, 1.2, 0, g, 16); cyl(0.4, 0.36, 0.06, marble, 0, 1.39, 0, g, 16);
      for (let k = 0; k < 6; k++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), lam({ color: [0x8aa04a, 0x6a8a3a][k % 2] })); b.position.set(Math.cos(k) * 0.16, 1.52 + (k % 2) * 0.12, Math.sin(k) * 0.16); g.add(b); }
      solid(K.door + 2.35, K.door + 2.85, K.z1 + 0.85, K.z1 + 1.35); }
    { const g = new THREE.Group(); g.position.set(K.door - 2.6, 0, K.z1 + 1.1); club.add(g); // the statue: a white marble figure in a draped robe
      box(0.6, 0.35, 0.6, marble, 0, 0.17, 0, g); solid(K.door - 2.9, K.door - 2.3, K.z1 + 0.8, K.z1 + 1.4);
      const fig = deps.makePerson(LOOK.statue, 0.92); fig.position.y = 0.35; fig.rotation.y = 0.25; g.add(fig); K.statue = fig; }
    // the partition between the reception and the club, with the inner door Creplach guards (and a rope until you have paid)
    const part = (x0, x1) => { box(x1 - x0, 2.8, 0.2, lam({ color: 0x3a1a3a }), (x0 + x1) / 2, 1.4, K.part, club); solid(x0, x1, K.part - 0.12, K.part + 0.12); };
    part(K.x0, K.door - 1.0); part(K.door + 1.0, K.x1);
    box(2.0, 0.6, 0.2, lam({ color: 0x3a1a3a }), K.door, 2.5, K.part, club);
    const ms = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.4), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'MEMBERS ONLY', size: 60 }], '#120a14', '#ff5ac8', 384, 96) })); ms.position.set(K.door, 2.5, K.part + 0.11); club.add(ms);
    K.rope = new THREE.Group(); club.add(K.rope);
    for (const x of [K.door - 0.9, K.door + 0.9]) cyl(0.05, 0.07, 0.95, gold, x, 0.48, K.part + 0.35, K.rope);
    box(1.8, 0.05, 0.05, velvet, K.door, 0.82, K.part + 0.35, K.rope, false);
    K.gate = solid(K.door - 1.0, K.door + 1.0, K.part - 0.12, K.part + 0.5);
    // reception: a desk, a coat rack, a framed sign
    box(1.8, 1.0, 0.7, wood, K.x0 + 2.2, 0.5, K.z1 - 2.2, club); box(1.9, 0.06, 0.8, gold, K.x0 + 2.2, 1.02, K.z1 - 2.2, club, false); solid(K.x0 + 1.3, K.x0 + 3.1, K.z1 - 2.55, K.z1 - 1.85);
    cyl(0.04, 0.04, 1.8, gold, K.x1 - 1.0, 0.9, K.z1 - 1.0, club); for (let k = 0; k < 3; k++) box(0.42, 0.6, 0.2, lam({ color: [0x3a3a3a, 0x8a2a2a, 0x2a3a6a][k] }), K.x1 - 1.0 + (k - 1) * 0.2, 1.4, K.z1 - 1.0 + (k - 1) * 0.15, club, false);
    const price = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.7), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'ENTREE', size: 50 }, { t: fmt(ENTRY), size: 64 }], '#1a1014', '#f2c14e', 256, 128) })); price.position.set(K.door - 2.6, 1.7, K.part + 0.11); club.add(price);
    // the bar along the west wall: counter, brass rail, shelves of bottles, stools
    box(1.0, 1.1, 7.0, wood, K.x0 + 1.6, 0.55, -16.0, club); box(1.15, 0.06, 7.1, lam({ color: 0x1a0a10 }), K.x0 + 1.6, 1.12, -16.0, club, false); solid(K.x0 + 1.1, K.x0 + 2.1, -19.5, -12.5);
    box(0.3, 1.6, 7.0, black, K.x0 + 0.2, 1.8, -16.0, club, false);
    for (let k = 0; k < 18; k++) cyl(0.05, 0.05, 0.3, lam({ color: [0x2a7a3a, 0xc8a040, 0x8a2a1a, 0xe8e8f0][k % 4], emissive: 0x101010 }), K.x0 + 0.25, 1.35 + (k % 2) * 0.6, -19.2 + (k >> 1) * 0.78, club);
    box(0.1, 0.4, 7.0, neon(0x8a3aff), K.x0 + 0.36, 2.75, -16.0, club, false);
    for (let k = 0; k < 4; k++) { cyl(0.22, 0.22, 0.06, velvet, K.x0 + 2.6, 0.72, -18.6 + k * 1.8, club); cyl(0.04, 0.04, 0.7, gold, K.x0 + 2.6, 0.36, -18.6 + k * 1.8, club); }
    const bs = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.5), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'BAR', size: 80 }], '#120a14', '#8a3aff', 256, 72) })); bs.rotation.y = Math.PI / 2; bs.position.set(K.x0 + 0.4, 3.3, -16.0); club.add(bs);
    // the stage: a round platform with a pink edge glow and three brass poles; front seats on an arc in front of it
    K.stage = { x: -55.2, z: -16.6, r: 2.4 };
    { const plate = deps.canvasTex(64, 64, (g) => { g.fillStyle = '#b8bcc4'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8ecf2'; for (let y = 0; y < 64; y += 16) for (let x = 0; x < 64; x += 16) { g.save(); g.translate(x + 8 + ((y / 16) % 2) * 8, y + 8); g.rotate(((x + y) / 16) % 2 ? 0.7 : -0.7); g.fillRect(-6, -1.5, 12, 3); g.restore(); } }); plate.wrapS = plate.wrapT = THREE.RepeatWrapping; plate.repeat.set(8, 1);
      cyl(K.stage.r, K.stage.r, 0.5, new THREE.MeshPhongMaterial({ map: plate, shininess: 90, specular: 0x888888 }), K.stage.x, 0.25, K.stage.z, club, 32); } // silver diamond-plate stage
    const edge = new THREE.Mesh(new THREE.TorusGeometry(K.stage.r, 0.04, 6, 48), neon(0xff3ab8)); edge.rotation.x = Math.PI / 2; edge.position.set(K.stage.x, 0.5, K.stage.z); club.add(edge);
    solid(K.stage.x - K.stage.r * 0.8, K.stage.x + K.stage.r * 0.8, K.stage.z - K.stage.r * 0.8, K.stage.z + K.stage.r * 0.8);
    K.poles = [-0.9, 0, 0.9].map((a, i) => { const ang = Math.PI + a, x = K.stage.x + Math.sin(ang) * 1.4, z = K.stage.z + Math.cos(ang) * 1.4 + (i === 1 ? 0 : 0); cyl(0.04, 0.04, K.h - 0.5, gold, x, 0.5 + (K.h - 0.5) / 2, z, club); return { x, z }; });
    K.seats = [-1.0, -0.5, 0, 0.5, 1.0].map((a) => { const r = 3.7, x = K.stage.x + Math.sin(a) * r, z = K.stage.z + Math.cos(a) * r, ry = a + Math.PI;
      const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; club.add(g);
      box(0.8, 0.45, 0.75, velvet, 0, 0.22, 0, g); box(0.8, 0.7, 0.18, velvet, 0, 0.75, -0.3, g); for (const sx of [-0.36, 0.36]) box(0.14, 0.3, 0.72, velvet, sx, 0.55, 0, g);
      solid(x - 0.4, x + 0.4, z - 0.4, z + 0.4); return { x, z, ry }; });
    // lights: pink and violet over the stage (on while you are inside)
    K.lights = [[0xff3ab8, K.stage.x - 1.5, K.stage.z], [0x8a3aff, K.stage.x + 1.5, K.stage.z], [0xffc070, K.door, (K.z1 + K.part) / 2]].map(([c, x, z]) => { const l = new THREE.PointLight(c, 0, 9, 1.4); l.position.set(x, 3.6, z); club.add(l); return l; });
    // DISCO: a mirror ball over the stage, coloured spots that sweep the floor, fairy lights along the walls and strands round the stage,
    // a silver truss tower, two potted bamboo, glass drinks fridges with bottles on top
    { const facets = deps.canvasTex(64, 32, (g) => { for (let y = 0; y < 32; y += 4) for (let x = 0; x < 64; x += 4) { const v = 120 + Math.floor(Math.random() * 135); g.fillStyle = `rgb(${v},${v},${v + 10})`; g.fillRect(x, y, 4, 4); } });
      K.ball = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), new THREE.MeshPhongMaterial({ map: facets, shininess: 120, specular: 0xffffff, emissive: 0x202028 })); K.ball.position.set(K.stage.x, 3.9, K.stage.z); club.add(K.ball);
      cyl(0.01, 0.01, K.h - 4.3, lam({ color: 0x888888 }), K.stage.x, 4.3 + (K.h - 4.3) / 2 - 0.1, K.stage.z, club);
      const dotGeo = new THREE.CircleGeometry(0.2, 10), cols = [0xff2a4a, 0x2aff6a, 0x3a6aff, 0xb03aff, 0x2ad8ff];
      K.dots = []; for (let k = 0; k < 90; k++) { const m = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: cols[k % cols.length], transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.scale.setScalar(0.45 + Math.random() * 0.5); m.visible = false; club.add(m); K.dots.push({ m, r: 0.8 + Math.sqrt(Math.random()) * 7.5, a: Math.random() * Math.PI * 2, sp: 0.25 + (k % 3) * 0.08 }); }
      const fairy = new THREE.MeshBasicMaterial({ color: 0xffd890 }), fGeo = new THREE.SphereGeometry(0.035, 5, 4);
      const string = (x0, z0, x1, z1, y0, y1, n) => { for (let k = 0; k <= n; k++) { const t = k / n, b = new THREE.Mesh(fGeo, fairy); b.position.set(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z0 + (z1 - z0) * t); club.add(b); } };
      string(K.x0 + 0.2, K.z0 + 0.2, K.x1 - 0.2, K.z0 + 0.2, 3.0, 3.0, 64); string(K.x1 - 0.2, K.z0 + 0.2, K.x1 - 0.2, K.part - 0.2, 3.0, 3.0, 40); string(K.x0 + 0.2, K.z0 + 0.2, K.x0 + 0.2, K.part - 0.2, 3.2, 3.2, 40);
      for (const a of [0.6, 1.6, 2.6, 3.6, 4.6, 5.6]) { const x = K.stage.x + Math.sin(a) * 3.0, z = K.stage.z + Math.cos(a) * 3.0; if (z > K.stage.z + 2.4) continue; string(x, z, x, z, 0.6, 3.4, 18); }
      // the truss tower by the stage
      const ts = lam({ color: 0xc8ccd2 }), tx = K.stage.x + 3.2, tz = K.stage.z - 2.2;
      for (const [dx, dz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) cyl(0.025, 0.025, 3.6, ts, tx + dx, 1.8, tz + dz, club, 6);
      for (let y = 0.3; y < 3.6; y += 0.4) for (const [dx, dz, w, d] of [[0, -0.2, 0.4, 0.03], [0, 0.2, 0.4, 0.03], [-0.2, 0, 0.03, 0.4], [0.2, 0, 0.03, 0.4]]) box(w, 0.03, d, ts, tx + dx, y, tz + dz, club, false);
      solid(tx - 0.25, tx + 0.25, tz - 0.25, tz + 0.25);
      // bamboo in black pots
      for (const [x, z] of [[K.x1 - 0.8, K.z0 + 0.8], [K.x1 - 0.8, K.part - 0.9]]) { cyl(0.3, 0.24, 0.5, lam({ color: 0x1a1a1a }), x, 0.25, z, club); for (let k = 0; k < 5; k++) { cyl(0.025, 0.025, 2.6, lam({ color: 0x6a8a3a }), x + Math.cos(k * 1.3) * 0.12, 1.5, z + Math.sin(k * 1.3) * 0.12, club, 5); const l = new THREE.Mesh(new THREE.SphereGeometry(0.38, 7, 6), lam({ color: [0x3a6a2a, 0x4a7a32][k % 2] })); l.scale.y = 1.6; l.position.set(x + Math.cos(k * 1.3) * 0.25, 2.2 + k * 0.18, z + Math.sin(k * 1.3) * 0.25); club.add(l); } solid(x - 0.35, x + 0.35, z - 0.35, z + 0.35); }
      // glass drinks fridges along the east wall, bottles on top, a red glow inside
      for (let k = 0; k < 3; k++) { const z = -19.4 + k * 1.3, x = K.x1 - 0.55; box(0.7, 1.9, 1.0, lam({ color: 0xc8ccd2 }), x, 0.95, z, club); box(0.04, 1.6, 0.85, lam({ color: 0xff6a8a, emissive: 0x801030, transparent: true, opacity: 0.6 }), x - 0.37, 1.05, z, club, false);
        for (let b = 0; b < 3; b++) cyl(0.05, 0.06, 0.34, lam({ color: 0x1a2a1a }), x, 2.07, z - 0.3 + b * 0.3, club, 8); }
      solid(K.x1 - 0.95, K.x1, -20.0, -15.9);
    }
    // the roof (hidden inside): red pantiles, a gable along the street
    { const tiles = deps.canvasTex(64, 64, (g) => { g.fillStyle = '#b8502e'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, y + 6, 64, 2); for (let x = 0; x < 64; x += 8) { g.fillStyle = 'rgba(255,200,160,.18)'; g.fillRect(x + 1, y, 3, 6); } } }); tiles.wrapS = tiles.wrapT = THREE.RepeatWrapping; tiles.repeat.set(W / 1.2, 5);
      const half = Dp / 2 + 0.5, rise = 2.4, slope = Math.hypot(half, rise), ang = Math.atan2(rise, half), tm = lam({ map: tiles });
      for (const sz of [-1, 1]) { const r = box(W + 0.8, 0.18, slope, tm, cx, K.h + rise / 2, cz + sz * half / 2, clubHi, false); r.rotation.x = sz * ang; }
      for (const sx of [-1, 1]) { const tri = new THREE.Shape(); tri.moveTo(-half, 0); tri.lineTo(half, 0); tri.lineTo(0, rise); const gm = new THREE.Mesh(new THREE.ShapeGeometry(tri), lam({ color: 0xf2efe8, side: THREE.DoubleSide })); gm.rotation.y = Math.PI / 2; gm.position.set(sx > 0 ? K.x1 + 0.3 : K.x0 - 0.3, K.h, cz); clubHi.add(gm); } }
  }
  // the people
  const creplach = deps.makePerson(LOOK.creplach); creplach.position.set(K.door + 1.45, 0, K.part + 0.75); creplach.rotation.y = 0; scene.add(creplach);
  const jossi = deps.makePerson(LOOK.jossi, 0.92); const js = K.seats[2]; jossi.position.set(js.x, 0, js.z); jossi.rotation.y = js.ry + Math.PI; scene.add(jossi); deps.sit(jossi, 0.5);
  const dancers = DANCERS.map((d, i) => { const p = deps.makePerson(LOOK.dancer(d.skin, d.hair, d.outfit, d.hs, d.lingerie, d.extra, d.bust, d.hairK)); const pole = K.poles[i]; p.position.set(pole.x, 0.5, pole.z); scene.add(p); p.userData.dancer = { ...d, pole, ph: i * 2.1 }; return p; });
  const extras = [0, 4].map((k, i) => { const s = K.seats[k], p = deps.passerBy(700 + i * 13); p.position.set(s.x, 0, s.z); p.rotation.y = s.ry + Math.PI; scene.add(p); deps.sit(p, 0.5); return p; });

  const paid = () => C().paidDay === day();
  const CREP_HI = ['Shoes clean? Shirt tucked in? Hm. Close enough.', 'Hands where I can see them. The girls dance. You sit.', 'No photos. No touching. No singing along.', 'You again. Go on. Behave.'];
  addInteract({
    pos: () => (inClub(player.position) || player.position.distanceTo(V3(K.door, K.part)) < 3 ? creplach.position : far), r: 1.9,
    enabled: () => inClub(player.position) || player.position.distanceTo(V3(K.door, K.part)) < 3,
    label: () => (paid() ? 'Talk to Creplach' : `Talk to Creplach · entry ${fmt(ENTRY)}`),
    act: () => {
      if (paid()) { dialogue([['Creplach', pick(CREP_HI)]]); return; }
      const first = !C().visits;
      choice('Creplach', first ? 'Club Monique. Members only. Tonight\'s membership is ' + fmt(ENTRY) + '. I check the shoes, I check the attitude, I check the wallet.' : `Eddy Jr. ${fmt(ENTRY)} for tonight, same as always.`, [`Pay ${fmt(ENTRY)}`, 'Not tonight'], (i) => {
        if (i !== 0) { dialogue([['Creplach', 'Then you stand outside. Like a lamppost. A very sad lamppost.']]); return; }
        if (state.money < ENTRY) { dialogue([['Creplach', `${fmt(ENTRY)}, Eddy. Not a cent less. Come back when your pockets agree with you.`]]); beep(160, 0.2, 'square', 0.04); return; }
        addMoney(-ENTRY); const c = C(); c.paidDay = day(); c.visits++; if (deps.save) deps.save(); beep(660, 0.08, 'triangle', 0.04);
        dialogue([['Creplach', first ? 'Welcome to Club Monique. The bar is left, the stage is straight ahead, the rules are on my face.' : 'In you go. Behave.'], ...(first ? [['Eddy Jr.', '(Jossi is already here. Of course Jossi is already here.)']] : [])]);
      });
    },
  });
  // Jossi: always on a front seat, always happy to see Eddy, always distracted by the next lapdance
  const JOSSI = [
    [['Jossi', 'EDDY! My brother! Sit, sit, sit! ...Wait. Is that Feta? FETA! Over here! I have tips!'], ['Eddy Jr.', 'Hi Jossi.'], ['Jossi', 'Hi, hi. Love you. One second. FETA!']],
    [['Jossi', 'Eddy Jr.! How\'s the spice business? Big? Huge? ...Hold on, Brie just looked at me. She LOOKED at me, Eddy.'], ['Eddy Jr.', 'She looks at everyone, Jossi.'], ['Jossi', 'Not like that. Not like THAT.']],
    [['Jossi', 'You know what, Eddy? You\'re my best friend. My best, best friend. Do you have fifty Wilders? Edam is free.'], ['Eddy Jr.', 'No.'], ['Jossi', 'Okay. Still my best friend. Mostly.']],
    [['Jossi', 'I\'ve been here since four. I live here now. Creplach brings me soup.'], ['Eddy Jr.', 'Creplach brings you soup?'], ['Jossi', 'Kreplach soup. From Creplach. It\'s a whole thing. SHHH, Edam is starting!']],
  ];
  addInteract({ pos: () => (inBack(player.position) ? jossi.position : far), r: 1.6, enabled: () => inBack(player.position), label: () => 'Talk to Jossi', act: () => { dialogue(JOSSI[(C().jossiK = ((C().jossiK | 0) + 1)) % JOSSI.length]); } });
  let card = null;
  // ================================================================== the show: dance moves, tips, the privé booth
  // --- the booth in the north-west corner behind the stage: a couch on the back wall, velvet side walls, a curtain across the front
  const BO = { cx: -61.0, x0: -62.6, x1: -59.4, zb: -20.9, zf: -18.7, seatZ: -20.38 };
  {
    const velvet = lam({ color: 0x6a0a34 }), dark = lam({ color: 0x1a0c18 }), gold = lam({ color: 0xd8a83a, emissive: 0x3a2a00 });
    for (const x of [BO.x0, BO.x1]) { box(0.1, 2.5, BO.zf - BO.zb, velvet, x, 1.25, (BO.zf + BO.zb) / 2, club); solid(x - 0.08, x + 0.08, BO.zb, BO.zf); cyl(0.05, 0.05, 2.6, gold, x, 1.3, BO.zf, club, 8); }
    box(BO.x1 - BO.x0, 2.5, 0.06, lam({ color: 0x3a0820 }), BO.cx, 1.25, BO.zb + 0.04, club, false); // padded back wall
    for (let k = 0; k < 6; k++) cyl(0.03, 0.03, 0.03, gold, BO.x0 + 0.5 + k * 0.44, 1.5 + (k % 2) * 0.5, BO.zb + 0.09, club, 6).rotation.x = Math.PI / 2;
    box(2.7, 0.45, 0.8, velvet, BO.cx, 0.22, BO.zb + 0.5, club); box(2.7, 0.75, 0.16, velvet, BO.cx, 0.82, BO.zb + 0.16, club, false); for (const sx of [-1.3, 1.3]) box(0.14, 0.34, 0.8, velvet, BO.cx + sx, 0.6, BO.zb + 0.5, club, false);
    solid(BO.cx - 1.35, BO.cx + 1.35, BO.zb, BO.zb + 0.9);
    box(BO.x1 - BO.x0 + 0.1, 0.07, 0.07, gold, BO.cx, 2.55, BO.zf, club, false); // the curtain rail
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'PRIVÉ', size: 70 }], '#120a14', '#ff5ac8', 320, 90) })); sign.position.set(BO.cx, 2.86, BO.zf + 0.02); club.add(sign);
    box(1.6, 0.02, 1.4, dark, BO.cx, 0.012, BO.zb + 1.5, club, false); // a rug
    BO.light = new THREE.PointLight(0xff4aa8, 0, 6, 1.4); BO.light.position.set(BO.cx, 2.2, BO.zb + 1.2); club.add(BO.light);
    // the curtain: two halves that hang open at the sides and draw shut
    BO.curt = [-1, 1].map((s) => { const m = box(1.6, 2.45, 0.06, lam({ color: 0x8a0e3e, emissive: 0x18020a }), 0, 1.25, BO.zf, club, false); m.userData.s = s; return m; }); BO.shut = 0;
    // hearts that rise over the booth when the curtain is shut
    const hT = deps.canvasTex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.fillStyle = '#ff5aa8'; g.beginPath(); g.moveTo(32, 54); g.bezierCurveTo(4, 34, 8, 8, 32, 22); g.bezierCurveTo(56, 8, 60, 34, 32, 54); g.fill(); });
    BO.hearts = [0, 1, 2, 3, 4, 5, 6].map((k) => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: hT, transparent: true, depthWrite: false })); m.scale.set(0.3, 0.3, 1); m.visible = false; m.userData.k = k; club.add(m); return m; });
  }
  function setCurtain(c) { BO.shut = c; const w = BO.x1 - BO.x0; for (const m of BO.curt) { const s = m.userData.s, k = 0.16 + 0.84 * c * 0.5 / 0.5; m.scale.x = (0.16 + (0.5 - 0.16) * c) * w / 1.6; m.position.x = BO.cx + s * (w / 2 - m.scale.x * 0.8); } }
  setCurtain(0);
  // --- every dancer runs her own string of moves round her pole
  const SEQ = ['sway', 'spin', 'roll', 'drop', 'sway', 'shake', 'roll', 'spin', 'drop', 'shake'];
  const DUR = { sway: 6, roll: 6, spin: 4.2, drop: 6.4, shake: 5, lap: 5 };
  const setMove = (u, mv, dur) => { if (u.st.move !== mv) { u.st.move = mv; u.st.t = 0; u.st.w = 0; } u.mvT = dur ?? DUR[mv]; };
  dancers.forEach((p, i) => { const u = p.userData.dancer; u.st = { move: 'sway', t: i * 1.3, w: 1 }; u.a = u.ph; u.mvI = i * 3; u.mvT = 2 + i * 1.7; u.face = 0; p.userData.ps2.extra = danceExtra(u.st); });
  const turnTo = (p, a, k) => { p.rotation.y += Math.atan2(Math.sin(a - p.rotation.y), Math.cos(a - p.rotation.y)) * Math.min(1, k); };
  function stageDance(p, dt) {
    const u = p.userData.dancer, st = u.st; st.t += dt; st.w = Math.min(1, st.w + dt * 2.6);
    let tx, tz, face;
    if (u.tip) { // tipped: over to the edge of the stage nearest Eddy, a drop facing him, then a shake with her back to him
      u.tip.t -= dt; const dx = player.position.x - K.stage.x, dz = player.position.z - K.stage.z, dl = Math.hypot(dx, dz) || 1; tx = K.stage.x + dx / dl * (K.stage.r - 0.45); tz = K.stage.z + dz / dl * (K.stage.r - 0.45);
      const toHim = Math.atan2(dx, dz), half = u.tip.t > u.tip.d * 0.5; setMove(u, half ? 'drop' : 'shake', 9); face = half ? toHim : toHim + Math.PI;
      if (u.tip.t <= 0) { u.tip = null; u.mvT = 0; }
    } else {
      u.mvT -= dt; if (u.mvT <= 0) { u.mvI++; setMove(u, SEQ[u.mvI % SEQ.length]); }
      const m = st.move, sp = m === 'spin' ? 3.3 : m === 'sway' || m === 'roll' ? 0.55 : 0, r = m === 'spin' ? 0.3 : 0.44;
      u.a += dt * sp * st.w; tx = u.pole.x + Math.sin(u.a) * r; tz = u.pole.z + Math.cos(u.a) * r;
      face = m === 'spin' ? u.a + Math.PI / 2 : m === 'shake' ? Math.PI : m === 'drop' ? 0 : u.a * 0.35 + Math.sin(st.t * 0.7) * 0.5; // a drop faces the front row, a shake shows them her back
    }
    const k = Math.min(1, dt * (u.tip ? 2.2 : 5)); p.position.x += (tx - p.position.x) * k; p.position.z += (tz - p.position.z) * k; p.position.y = 0.5 + danceY(st) * 0.93;
    turnTo(p, face, dt * (st.move === 'spin' ? 12 : 3.5));
    if (deps.animate) deps.animate(p, dt);
  }
  // --- tips: notes thrown at the stage
  const billT = deps.canvasTex(64, 32, (g) => { g.fillStyle = '#3f9a52'; g.fillRect(0, 0, 64, 32); g.strokeStyle = '#d8f2c8'; g.lineWidth = 2; g.strokeRect(3, 3, 58, 26); g.fillStyle = '#eaffd8'; g.font = '900 20px Arial'; g.textAlign = 'center'; g.fillText('W', 32, 23); });
  const billM = new THREE.MeshBasicMaterial({ map: billT, side: THREE.DoubleSide }), billG = new THREE.PlaneGeometry(0.2, 0.1), bills = [];
  function throwBills(n, p) {
    for (let i = 0; i < n; i++) {
      while (bills.length >= 48) { const o = bills.shift(); club.remove(o.m); }
      const m = new THREE.Mesh(billG, billM), T = 0.8 + Math.random() * 0.5, g = 3.4; m.position.set(player.position.x, 1.25, player.position.z);
      const ex = p.position.x + (Math.random() - 0.5) * 1.1, ez = p.position.z + (Math.random() - 0.5) * 1.1;
      club.add(m); bills.push({ m, v: new THREE.Vector3((ex - m.position.x) / T, (0.55 - 1.25) / T + 0.5 * g * T, (ez - m.position.z) / T), g, wait: i * 0.07, life: 45, sp: 4 + Math.random() * 6, down: false });
    }
  }
  function billsStep(dt) {
    for (let i = bills.length - 1; i >= 0; i--) { const b = bills[i], m = b.m;
      if (b.wait > 0) { b.wait -= dt; m.visible = false; continue; } m.visible = true;
      if (!b.down) { b.v.y -= b.g * dt; m.position.addScaledVector(b.v, dt); m.position.x += Math.sin(b.life * 9 + i) * dt * 0.5; m.rotation.x += dt * b.sp; m.rotation.z += dt * b.sp * 0.6;
        const fl = Math.hypot(m.position.x - K.stage.x, m.position.z - K.stage.z) < K.stage.r ? 0.515 + i * 0.0004 : 0.03; if (m.position.y <= fl && b.v.y < 0) { m.position.y = fl; b.down = true; m.rotation.set(-Math.PI / 2, 0, Math.random() * 6.3); } }
      b.life -= dt; if (b.life <= 0) { club.remove(m); bills.splice(i, 1); } }
  }
  const TIP_SAY = { Brie: ['For me? You\'re sweet, spice boy.', 'Aww. Watch this one.'], Feta: ['Mm. Keep them coming.', 'That buys you a look. Just a look.'], Edam: ['Now THAT is how you say hello.', 'Rain, baby. I like the weather in here.'] };
  function tip(p, amt) {
    const d = p.userData.dancer;
    if (state.money < amt) { dialogue([[d.name, 'Sweetie, that wallet is empty. I can hear it from here.']]); return; }
    addMoney(-amt); const c = C(); c.tips = c.tips && typeof c.tips === 'object' ? c.tips : {}; c.tips[d.name] = (c.tips[d.name] | 0) + amt; if (deps.save) deps.save();
    throwBills(amt >= 100 ? 14 : 3, p); const dur = amt >= 100 ? 11 : 6; d.tip = { t: dur, d: dur };
    beep(880, 0.06, 'triangle', 0.04); setTimeout(() => beep(1175, 0.08, 'triangle', 0.04), 90);
    toast(d.name.toUpperCase(), pick(TIP_SAY[d.name] || ['Thanks, sweetie.']), 2.6);
    if (amt >= 100 && Math.random() < 0.6) setTimeout(() => { if (!sc && !state.inDialogue) toast('JOSSI', pick(['A HUNDRED?! Eddy, who ARE you?', 'I tip in coins. COINS, Eddy. Don\'t make me look bad.']), 2.6); }, 3200);
  }
  // --- the privé booth: Eddy on the couch, the dancer in front of him, the camera up close. With extras the curtain shuts and stays shut.
  const PRIVE = 150, EXTRA = 500;
  const EXTRA_CARD = {
    Brie: 'The curtain closes. Seven minutes later Eddy Jr. comes out with his glasses on upside down and one shoe missing. Brie hands him the shoe. "Call me, spice boy."',
    Feta: 'The curtain closes. Nobody knows what happened in there. Eddy Jr. knows. Eddy Jr. will never talk about it, and never stop thinking about it.',
    Edam: 'The curtain closes. The whole booth moves a metre to the left. Creplach looks at his watch, twice. Eddy Jr. comes out a changed man, and ' + fmt(EXTRA) + ' lighter.',
  };
  let sc = null, veil = null, cap = null;
  const fade = (cb) => { if (!veil) { veil = document.createElement('div'); veil.style.cssText = 'position:fixed;inset:0;z-index:54;background:#000;opacity:0;pointer-events:none;transition:opacity .4s'; document.body.appendChild(veil); } veil.style.opacity = 1; setTimeout(() => { cb(); veil.style.opacity = 0; }, 450); };
  const caption = (html) => { if (!cap) { cap = document.createElement('div'); cap.style.cssText = 'position:fixed;left:50%;bottom:7%;transform:translateX(-50%);z-index:53;padding:8px 18px;border-radius:999px;background:rgba(20,6,16,.72);color:#ffd6f0;font:700 15px Rubik,Arial;border:1px solid #ff5ac8;cursor:pointer;display:none;text-align:center'; cap.addEventListener('click', (e) => { e.stopPropagation(); if (sc && sc.phase === 'dance' && sc.t > 1.5) sc.t = sc.dur; }); document.body.appendChild(cap); } cap.style.display = html ? 'block' : 'none'; if (html) cap.innerHTML = html; };
  function prive(p, extra) {
    const d = p.userData.dancer, cost = extra ? EXTRA : PRIVE;
    if (state.money < cost) { dialogue([[d.name, `The booth is ${fmt(cost)}, sweetie. Come back when you're liquid.`]]); return; }
    addMoney(-cost); const c = C(); c.dances++; if (extra) c.extras = (c.extras | 0) + 1; if (deps.save) deps.save();
    sc = { p, d, extra, phase: 'in', t: 0, dur: 19, cut: 0 }; state.inDialogue = true; d.tip = null;
    fade(() => { player.position.set(BO.cx, 0, BO.seatZ); player.rotation.y = 0; deps.sit(player, 0.5); p.position.set(BO.cx, 0, BO.seatZ + 1.1); p.rotation.y = Math.PI; setMove(d, 'sway', 99); sc.phase = 'dance'; sc.t = 0; BO.light.intensity = 1.8; caption(`PRIVÉ · ${d.name.toUpperCase()} <span style="opacity:.6;font-weight:400">· click to end</span>`); });
  }
  function endPrive() {
    const { p, d, extra } = sc; sc.phase = 'out'; caption('');
    fade(() => {
      const u = player.userData; u.seated = false; u.body.position.y = 0; u.legs.forEach((l) => { l.rotation.x = 0; }); player.position.set(BO.cx, 0, BO.zf + 1.0); player.rotation.y = 0;
      p.position.set(d.pole.x, 0.5, d.pole.z); d.mvT = 0; setCurtain(0); clubHi.visible = false; BO.light.intensity = 0; for (const h of BO.hearts) h.visible = false; sc = null; state.inDialogue = false;
      const jos = ['Jossi', pick([`EDDY! You got ${d.name}?! I've been asking for ${d.name} for an HOUR!`, `${d.name}?! Eddy, that's MY ${d.name}! ...Was it nice? Don't tell me. Tell me.`, 'Next one\'s mine. NEXT ONE IS MINE.'])];
      if (extra) showCard(d.name, EXTRA_CARD[d.name] || EXTRA_CARD.Brie, () => dialogue([['Creplach', 'I saw nothing. I heard nothing. That is also what you saw and heard.'], jos]));
      else dialogue([['Eddy Jr.', '(' + d.card + ')'], jos]);
    });
  }
  function priveStep(dt) {
    const { p, d } = sc; state.inDialogue = true; sc.t += dt; clubHi.visible = true; // the upper walls and the roof are back while the camera is down in the room
    if (sc.phase === 'dance') {
      const t = sc.t, st = d.st; st.t += dt; st.w = Math.min(1, st.w + dt * 2.4);
      // four beats: a sway in front of him, a lap dance with her back to him, hip rolls up close, a shake to finish
      const beat = t < 4.5 ? ['sway', 1.1, Math.PI] : t < 9.5 ? ['lap', 0.72, 0] : t < 14 ? ['roll', 0.8, Math.PI] : ['shake', 0.9, 0];
      if (st.move !== beat[0]) { st.move = beat[0]; st.t = 0; st.w = 0; }
      p.position.x = BO.cx + Math.sin(t * 1.1) * 0.05; p.position.z += (BO.seatZ + beat[1] - p.position.z) * Math.min(1, dt * 2.5); p.position.y = danceY(st) * 0.93; turnTo(p, beat[2], dt * 3.2);
      player.position.set(BO.cx, 0, BO.seatZ); player.rotation.y = 0;
      if (deps.animate) deps.animate(p, dt);
      if (t >= sc.dur) { if (sc.extra) { sc.phase = 'curtain'; sc.t = 0; sc.sq = 0; caption(''); st.move = 'sway'; } else endPrive(); }
    } else if (sc.phase === 'curtain') { // the extras happen behind the curtain: all you get is the curtain, the hearts and the couch springs
      const t = sc.t; setCurtain(Math.min(1, t / 0.8)); const wob = Math.min(1, t / 2) * (t < 7 ? 1 : Math.max(0, 8 - t));
      for (const m of BO.curt) { m.position.z = BO.zf + Math.sin(t * 13 + m.userData.s) * 0.035 * wob; m.rotation.y = Math.sin(t * 9 + m.userData.s * 2) * 0.03 * wob; }
      for (const h of BO.hearts) { const k = h.userData.k, c = ((t * 0.45 + k / 7) % 1); h.visible = t > 1; h.position.set(BO.cx + Math.sin(k * 2.4 + t) * 1.1, 2.3 + c * 1.6, BO.zf - 0.6 + Math.cos(k * 1.7) * 0.5); h.material.opacity = 1 - c; const s = 0.22 + c * 0.2; h.scale.set(s, s, 1); }
      sc.sq -= dt; if (sc.sq <= 0 && t > 1 && t < 7.4) { sc.sq = Math.max(0.16, 0.5 - t * 0.05); sc.sqN = (sc.sqN | 0) + 1; beep(sc.sqN % 2 ? 620 : 520, 0.04, 'square', 0.02); }
      p.position.set(BO.cx, 0, BO.seatZ + 0.7); player.position.set(BO.cx, 0, BO.seatZ);
      if (t >= 8.4) { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.16, 'triangle', 0.04), i * 110)); endPrive(); }
    }
  }
  // the camera while a privé scene runs (main.js asks every frame): three close angles in turn, or the shut curtain from outside
  const camP = new THREE.Vector3(), camL = new THREE.Vector3();
  function cam() {
    if (!sc || sc.phase === 'in') return null;
    const z = sc.p.position.z, t = sc.t;
    if (sc.phase === 'curtain' || (sc.phase === 'out' && sc.extra)) { camP.set(BO.cx + Math.sin(t * 0.3) * 0.3, 1.5, BO.zf + 3.9); camL.set(BO.cx, 1.75, BO.zf); }
    else { const k = Math.floor(t / 4.75) % 4, dr = (t % 4.75) / 4.75;
      if (k === 0) { camP.set(BO.cx + 1.2 - dr * 0.5, 1.5, BO.zf + 1.9); camL.set(BO.cx, 1.0, BO.seatZ + 0.5); } // from the opening, drifting
      else if (k === 1) { camP.set(BO.x0 + 0.4, 0.95 + dr * 0.25, z + 0.55); camL.set(BO.cx, 0.9, z - 0.1); } // low from the side, on her
      else if (k === 2) { camP.set(BO.cx + 0.42, 1.52, BO.seatZ - 0.28); camL.set(BO.cx - 0.05, 1.05 - dr * 0.15, z); } // over Eddy's shoulder
      else { camP.set(BO.x1 - 0.45, 1.25, z + 0.9 - dr * 0.5); camL.set(BO.cx, 0.85, z); } } // from the other side, sliding past
    return { pos: camP, look: camL };
  }
  function showCard(name, text, done) {
    if (!card) { card = document.createElement('div'); card.style.cssText = 'position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:#000;opacity:0;transition:opacity .6s;cursor:pointer'; document.body.appendChild(card); }
    card.innerHTML = `<div style="max-width:560px;text-align:center;color:#ffd6f0;font:20px/1.5 Rubik,Arial;padding:20px"><div style="font:900 34px Bungee,'Arial Black';color:#ff5ac8;text-shadow:0 0 14px #ff3ab8;margin-bottom:12px">${name.toUpperCase()}</div>${text}<div style="margin-top:18px;font-size:12px;color:#a07a9a">click to continue</div></div>`;
    card.style.display = 'flex'; requestAnimationFrame(() => { card.style.opacity = 1; }); state.inDialogue = true;
    card.onclick = () => { card.style.opacity = 0; setTimeout(() => { card.style.display = 'none'; state.inDialogue = false; if (done) done(); }, 600); };
  }
  const MENU_SAY = { Brie: 'Hi! You\'re the spice one, right? Jossi talks about you all the time.', Feta: 'You\'re staring. That\'s fine. Staring is free. The rest is not.', Edam: 'Well, look who found his way to the front. What will it be, baby?' };
  dancers.forEach((p) => addInteract({ pos: () => (inBack(player.position) && !sc ? p.position : far), r: 2.7, enabled: () => inBack(player.position) && !sc && !(card && card.style.display === 'flex'), label: () => `${p.userData.dancer.name} · tip or privé`,
    act: () => { const d = p.userData.dancer; choice(d.name, MENU_SAY[d.name] || 'Hi, sweetie.', [`Tip ${fmt(20)}`, `Make it rain ${fmt(100)}`, `Privé booth ${fmt(PRIVE)}`, `Privé with extras ${fmt(EXTRA)}`, 'Just looking'], (i) => { if (i === 0) tip(p, 20); else if (i === 1) tip(p, 100); else if (i === 2) prive(p, false); else if (i === 3) prive(p, true); }); } }));
  addInteract({ pos: () => (inBack(player.position) ? V3(K.x0 + 2.6, -16.0) : far), r: 1.8, enabled: () => inBack(player.position), label: () => 'A jenever at the bar · W 10', act: () => { if (state.money < 10) return; addMoney(-10); dialogue([['Eddy Jr.', pick(['(Jenever. It burns. It burns in a good way.)', '(The bartender doesn\'t talk. The bartender pours.)', '(Jossi waves from the front row with both hands. Eddy waves back with one.)'])]]); } });

  // ================================================================== TRYSHTAHN AUTO
  const S = { x0: 52, x1: 80, z0: -36, z1: -6.5, cx: 66, cz: -25.2, r: 9.6, h: 4.6 };
  const lot = new THREE.Group(), showHi = new THREE.Group(); scene.add(lot); scene.add(showHi);
  const inShow = (p) => Math.hypot(p.x - S.cx, p.z - S.cz) < S.r - 0.2;
  const onLot = (p) => p.x > S.x0 && p.x < S.x1 && p.z > S.z0 && p.z < S.z1;
  const cars = [];
  {
    // the plot: fresh asphalt, white lines, flags, a pylon sign at the street
    box(S.x1 - S.x0, 0.02, S.z1 - S.z0, lam({ color: 0x3a3c40 }), (S.x0 + S.x1) / 2, 0.012, (S.z0 + S.z1) / 2, lot, false);
    for (let x = S.x0 + 1.5; x < S.x1 - 1; x += 3) box(0.1, 0.01, 4.5, lam({ color: 0xe8e8e8 }), x, 0.025, S.z1 - 3, lot, false);
    for (const [x0, x1, z0, z1] of [[S.x0 - 0.2, S.x0, S.z0, S.z1 - 0.8], [S.x1, S.x1 + 0.2, S.z0, S.z1 - 0.8], [S.x0, S.x1, S.z0 - 0.2, S.z0]]) solid(x0, x1, z0, z1); // a low fence round the plot
    for (const [x0, x1, z] of [[S.x0, S.x1, S.z0]]) box(x1 - x0, 0.9, 0.08, lam({ color: 0x8a8e94 }), (x0 + x1) / 2, 0.45, z, lot, false);
    for (const x of [S.x0, S.x1]) box(0.08, 0.9, S.z1 - S.z0 - 0.8, lam({ color: 0x8a8e94 }), x, 0.45, (S.z0 + S.z1 - 0.8) / 2, lot, false);
    // bunting
    const flagCols = [0xe83a3a, 0xf2c14e, 0x3a8ae8, 0x3ac85a];
    for (const [x0, x1, z] of [[S.x0 + 0.5, S.x1 - 0.5, S.z1 - 0.6]]) { for (const x of [x0, x1]) cyl(0.06, 0.06, 4.2, lam({ color: 0xc8ccd0 }), x, 2.1, z, lot); for (let k = 0, n = 34; k < n; k++) { const t = k / (n - 1), x = x0 + (x1 - x0) * t, y = 4.0 - Math.sin(t * Math.PI) * 0.9; const f = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 3), lam({ color: flagCols[k % 4] })); f.position.set(x, y - 0.2, z); f.rotation.x = Math.PI; lot.add(f); } }
    cyl(0.18, 0.22, 6.5, lam({ color: 0x2a2c30 }), S.x0 + 1.8, 3.25, S.z1 - 1.6, lot); solid(S.x0 + 1.55, S.x0 + 2.05, S.z1 - 1.85, S.z1 - 1.35);
    const pyl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.2), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'TRYSHTAHN', size: 74 }, { t: 'AUTO', size: 74 }, { t: 'EERLIJKE PRIJZEN*', size: 30 }], '#101a3a', '#f2c14e', 512, 320) }));
    pyl.position.set(S.x0 + 1.8, 5.6, S.z1 - 1.4); lot.add(pyl); const pb = pyl.clone(); pb.rotation.y = Math.PI; pb.position.z -= 0.02; lot.add(pb);
    // the round glass showroom: white floor disc, glass ring with a door gap facing the street, steel rings and mullions, a flat roof
    cyl(S.r, S.r, 0.12, lam({ color: 0xf2f2f4 }), S.cx, 0.06, S.cz, lot, 48);
    const gap = 0.17; // radians each side of due south (+z)
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(S.r, S.r, S.h, 48, 1, true, gap, Math.PI * 2 - gap * 2), new THREE.MeshPhongMaterial({ color: 0x9ad0f0, transparent: true, opacity: 0.22, side: THREE.DoubleSide, shininess: 90, depthWrite: false }));
    glass.position.set(S.cx, S.h / 2 + 0.12, S.cz); showHi.add(glass);
    const steel = lam({ color: 0xc8ccd2 });
    for (const y of [0.15, S.h + 0.1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(S.r, 0.07, 6, 64, Math.PI * 2 - gap * 2), steel); ring.rotation.x = -Math.PI / 2; ring.rotation.z = Math.PI / 2 + gap; ring.position.set(S.cx, y, S.cz); (y < 1 ? lot : showHi).add(ring); }
    for (let k = 0; k < 24; k++) { const a = gap + (Math.PI * 2 - gap * 2) * (k / 23); const m = box(0.1, S.h, 0.1, steel, S.cx + Math.sin(a) * S.r, S.h / 2 + 0.12, S.cz + Math.cos(a) * S.r, k === 0 || k === 23 ? lot : showHi, false); }
    for (let a = gap + 0.06; a < Math.PI * 2 - gap - 0.03; a += 0.12) { const x = S.cx + Math.sin(a) * S.r, z = S.cz + Math.cos(a) * S.r; solid(x - 0.5, x + 0.5, z - 0.5, z + 0.5); }
    const roof = cyl(S.r + 0.4, S.r + 0.4, 0.3, lam({ color: 0xe8eaee }), S.cx, S.h + 0.3, S.cz, showHi, 48);
    const ss = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.7), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'TRYSHTAHN AUTO', size: 64 }], '#101a3a', '#f2c14e', 512, 80) }));
    ss.position.set(S.cx, S.h + 0.75, S.cz + S.r + 0.05); showHi.add(ss);
    box(2.6, 0.02, 1.6, lam({ color: 0x2a2a2e }), S.cx, 0.13, S.cz + S.r + 0.9, lot, false); // doormat
    // three cars on turntables
    const prof = {
      kombi: { n: 'Kaasland Kombi', W: 1.75, r: 0.1, wr: 0.31, body: [[-2.4, 0.3], [2.35, 0.3], [2.4, 0.85], [1.2, 0.95], [0.7, 1.48], [-2.3, 1.5], [-2.4, 0.95]], glass: [[1.15, 0.97], [0.68, 1.42], [-2.22, 1.44], [-2.3, 1.0]] },
      zuid: { n: 'Zuidwester 911', W: 1.8, r: 0.32, wr: 0.32, body: [[-2.15, 0.3], [2.15, 0.3], [2.2, 0.6], [1.4, 0.76], [0.35, 1.24], [-0.55, 1.27], [-1.55, 0.98], [-2.2, 0.72]], glass: [[0.3, 1.18], [-0.5, 1.2], [-1.25, 0.98], [0.95, 0.85]] },
      rolls: { n: 'Koninklijke Phantom', W: 2.0, r: 0.08, wr: 0.36, body: [[-2.8, 0.34], [2.8, 0.34], [2.85, 1.05], [1.5, 1.14], [0.85, 1.72], [-2.25, 1.74], [-2.8, 1.18]], glass: [[0.8, 1.64], [-2.15, 1.66], [-2.2, 1.18], [1.35, 1.16]] },
    };
    const MODELS = [
      { id: 'kombi', name: 'Kaasland Kombi', paint: 0xd8cca8, others: 5000, prof: prof.kombi, ang: -0.62, say: 'The Kombi. Boxy, honest, indestructible. Like me.' },
      { id: 'zuid', name: 'Zuidwester 911', paint: 0xc81e1e, others: 24000, prof: prof.zuid, ang: 0, say: 'The Zuidwester. German engineering, Kaasland paperwork. Zero to frikandel in four seconds.' },
      { id: 'rolls', name: 'Koninklijke Phantom (gold)', paint: 0xd8b040, others: 250000, prof: prof.rolls, ang: 0.62, gold: true, say: 'The Phantom. Solid gold paint. The King of Kaasland has one. Well. Had one. Now I have it.' },
    ];
    for (const M of MODELS) {
      const i = MODELS.indexOf(M), x = S.cx + (i - 1) * 5.8, z = S.cz - 2.6 + (i === 1 ? -0.8 : 0); // a row across the back, the Zuidwester a step back in the middle
      cyl(2.75, 2.75, 0.16, lam({ color: 0x1a1c22 }), x, 0.2, z, lot, 40);
      const spin = new THREE.Group(); spin.position.set(x, 0.28, z); lot.add(spin);
      const c = deps.makeCar({ profile: M.prof, paint: M.paint }); c.rotation.y = -Math.PI / 2; spin.add(c);
      if (M.gold && c.userData.paint) { c.userData.paint.emissive = new THREE.Color(0x4a3400); c.userData.paint.color.setHex(0xe8c048); }
      solid(x - 1.9, x + 1.9, z - 1.9, z + 1.9);
      cars.push({ ...M, x, z, spin });
    }
    S.lights = [new THREE.PointLight(0xffffff, 0, 16, 1.2)]; S.lights[0].position.set(S.cx, S.h - 0.4, S.cz); lot.add(S.lights[0]);
  }
  const tryshtahn = deps.makePerson(LOOK.tryshtahn, 1.08); tryshtahn.position.set(S.cx, 0.12, S.cz + 5.6); tryshtahn.rotation.y = 0; scene.add(tryshtahn);
  const buyer = deps.passerBy(733); buyer.position.set(S.cx - 1.3, 0.12, S.cz + 4.8); buyer.rotation.y = Math.PI * 0.85; scene.add(buyer); buyer.visible = !D().seen;
  const myPrice = (M) => M.others * 2;
  function firstVisit() {
    const kombi = cars[0];
    dialogue([
      ['Tryshtahn', 'My friend! Kaasland Kombi, full tank, new mats, five thousand Wilders. Special price. Today only.'],
      ['Customer', 'Deal! Five thousand. Here you go.'],
      ['Tryshtahn', 'Pleasure doing business! Drive safe, my brother, may your parking always be free!'],
      ['Eddy Jr.', 'Hi. I\'ll take one of those Kombis too.'],
      ['Tryshtahn', 'Ah! Welcome, welcome! The Kombi, for you... ten thousand Wilders.'],
      ['Eddy Jr.', 'He just paid five thousand. I heard it. I was standing right here.'],
      ['Tryshtahn', 'Yes, but he is from here. You are an immigrant to Kaasland. Immigrant price. Very standard. Everybody knows.'],
      ['Eddy Jr.', 'I was BORN on this street! My dad\'s shop is two hundred metres that way!'],
      ['Tryshtahn', 'Exactly what an immigrant would say. Ten thousand. And I am being generous, because I like your face.'],
    ], () => { D().seen = 1; buyer.visible = false; if (deps.save) deps.save(); toast('TRYSHTAHN AUTO', 'The customer drove off in his W 5,000 Kombi. Your price: W 10,000. Buying cars comes later.', 5); });
    void kombi;
  }
  addInteract({
    pos: () => (inShow(player.position) || player.position.distanceTo(tryshtahn.position) < 2.5 ? tryshtahn.position : far), r: 2.0,
    enabled: () => inShow(player.position) || player.position.distanceTo(tryshtahn.position) < 2.5,
    label: () => (D().seen ? 'Talk to Tryshtahn' : 'Listen in'),
    act: () => {
      if (!D().seen) { firstVisit(); return; }
      dialogue([
        ['Tryshtahn', pick(['Eddy! My favourite immigrant! What can I overcharge you for today?', 'Welcome back! Prices went up since this morning. For you. Only for you.', 'My brother! You look like a man with a car-shaped hole in his heart. And a wallet-shaped hole I can make.'])],
        ['Tryshtahn', `Today: the Kombi ${fmt(myPrice(cars[0]))}, the Zuidwester ${fmt(myPrice(cars[1]))}, the golden Phantom ${fmt(myPrice(cars[2]))}. Locals pay half. You are not a local.`],
        ['Tryshtahn', 'Financing department is closed for now. Come back soon, I will have paperwork. Lots of paperwork.'],
      ]);
    },
  });
  cars.forEach((M) => addInteract({ pos: () => (inShow(player.position) ? V3(M.x, M.z) : far), r: 2.8, enabled: () => inShow(player.position), label: () => `${M.name} · ${fmt(myPrice(M))} (locals: ${fmt(M.others)})`, act: () => { dialogue([['Tryshtahn', M.say], ['Tryshtahn', `For you: ${fmt(myPrice(M))}. Not for sale yet, though. Paperwork.`]]); } }));

  // ================================================================== per frame
  let wasClub = false, wasShow = false, t = 0;
  function update(dt) {
    t += dt;
    const p = player.position, ic = inClub(p), is = inShow(p);
    if (ic !== wasClub) { wasClub = ic; clubHi.visible = !ic; for (const l of K.lights) l.intensity = ic ? 2.2 : 0; if (ic && !C().visits) toast('CLUB MONIQUE', 'Reception first. The bouncer is Creplach. Talk to him to get in.', 3.5); }
    if (is !== wasShow) { wasShow = is; showHi.visible = !is; S.lights[0].intensity = is ? 1.4 : 0; }
    // the rope opens for the night once you've paid
    const open = paid(); K.gate.off = open; K.rope.visible = !open;
    if (!open && inBack(p)) { p.z = K.part + 0.6; } // no sneaking in round Creplach
    // the dancers run their moves (js above); a privé scene takes one of them to the booth
    for (const d of dancers) { if (sc && sc.p === d) continue; stageDance(d, dt); }
    if (sc) priveStep(dt);
    billsStep(dt);
    jossi.rotation.x = Math.sin(t * 1.3) * 0.06;
    if (!ic && K.dotsOn) { K.dotsOn = false; for (const d of K.dots) d.m.visible = false; } // nobody inside: nothing to draw
    if (ic) { K.dotsOn = true; // the disco: the mirror ball turns, the spots sweep the floor, the lights cycle through colours
      K.ball.rotation.y += dt * 0.9;
      for (const d of K.dots) { const a = d.a + t * d.sp, x = K.stage.x + Math.sin(a) * d.r, z = K.stage.z + Math.cos(a) * d.r * 0.9; const ok = x > K.x0 + 0.2 && x < K.x1 - 0.2 && z > K.z0 + 0.2 && z < K.part - 0.2; d.m.visible = ok; if (ok) d.m.position.set(x, 0.035, z); }
      K.lights[0].color.setHSL((t * 0.08) % 1, 1, 0.55); K.lights[1].color.setHSL((t * 0.08 + 0.5) % 1, 1, 0.55);
    }
    if (deps.animate) { deps.animate(creplach, dt); deps.animate(tryshtahn, dt); if (buyer.visible) deps.animate(buyer, dt); }
    for (const c of cars) c.spin.rotation.y += dt * 0.25;
    if (onLot(p) && !D().seen && !D().hinted) { D().hinted = 1; toast('TRYSHTAHN AUTO', 'Somebody is buying a car inside. Walk in and listen.', 3); }
  }
  const inside = () => inClub(player.position) || inShow(player.position);
  return { update, inside, inClub, inShow, cam, club: K, show: S, cars, creplach, jossi, tryshtahn, dancers, test: { tip, prive, booth: BO, scene: () => sc } };
}
