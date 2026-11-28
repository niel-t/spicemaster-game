// More hand-drawn portraits in the Freddy / Eddy look (faces.js): the same saffron halftone backdrop, warm brown ink,
// flat cel shading and the same face construction, built from a short spec per character so they read as one family.
// cast(key, mouth 0|1|2, blink 0|1) -> SVG string, 256 x 320. Rendered by render.cjs to browser-game/assets/face_<key>*.jpg.
const INK = '#2a160e';
const bg = (id, tint) => `
<defs>
  <radialGradient id="bg${id}" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="${tint[0]}"/><stop offset=".45" stop-color="${tint[1]}"/><stop offset="1" stop-color="${tint[2]}"/></radialGradient>
  <pattern id="dots${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.7" fill="#5a1e0c" opacity=".22"/></pattern>
  <radialGradient id="dmask${id}" cx="50%" cy="40%" r="70%"><stop offset=".35" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="m${id}"><rect width="256" height="320" fill="url(#dmask${id})"/></mask>
  <pattern id="plaid${id}" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#6a3a2a"/><rect width="16" height="5" fill="#2a2a3a" opacity=".7"/><rect width="5" height="16" fill="#2a2a3a" opacity=".55"/><rect y="10" width="16" height="1.5" fill="#d8b878" opacity=".6"/><rect x="11" width="1.5" height="16" fill="#d8b878" opacity=".5"/></pattern>
  <pattern id="flor${id}" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#e9dcc8"/><circle cx="5" cy="6" r="3.2" fill="#d8566a"/><circle cx="16" cy="15" r="3" fill="#e8a23a"/><circle cx="15" cy="4" r="2.2" fill="#5a8a4a"/><circle cx="6" cy="17" r="2.4" fill="#4a6ab0"/></pattern>
  <pattern id="leo${id}" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="#d8b888"/><path d="M3 3 q3 -2 4 2 q-3 2 -4 -2z M9 9 q3 -2 4 2 q-3 2 -4 -2z" fill="#3a2418"/></pattern>
  <pattern id="velv${id}" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#3a2a22"/><path d="M2 10 q4 -8 8 0 q4 8 8 0" stroke="#7a5a44" stroke-width="2" fill="none"/></pattern>
  <pattern id="gingham${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#f2f4f8"/><rect width="5" height="10" fill="#3a5a9a" opacity=".55"/><rect width="10" height="5" fill="#3a5a9a" opacity=".55"/></pattern>
  <pattern id="polka${id}" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f4ece8"/><circle cx="6" cy="6" r="3.4" fill="#3a1a1a"/></pattern>
  <pattern id="knit${id}" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="#b86a4a"/><path d="M0 5 l5 -3 l5 3" stroke="#e8c47a" stroke-width="2" fill="none"/><rect y="8" width="10" height="2" fill="#5a7a5a"/></pattern>
</defs>
<rect width="256" height="320" fill="url(#bg${id})"/>
<rect width="256" height="320" fill="url(#dots${id})" mask="url(#m${id})"/>`;

const ST = `stroke="${INK}"`;
// the head, ears and the darker cheek side, scaled sideways around the centre (w = 1 is Eddy's round face)
const headShape = (w, skin, shade) => `<g transform="translate(128 0) scale(${w} 1) translate(-128 0)">
  <ellipse cx="46" cy="166" rx="13" ry="21" fill="${skin}" ${ST} stroke-width="3.5" vector-effect="non-scaling-stroke"/><ellipse cx="210" cy="166" rx="13" ry="21" fill="${skin}" ${ST} stroke-width="3.5" vector-effect="non-scaling-stroke"/>
  <path d="M128 58 q82 0 84 92 q2 66 -38 92 q-22 14 -46 14 q-24 0 -46 -14 q-40 -26 -38 -92 q2 -92 84 -92z" fill="${skin}" ${ST} stroke-width="4.5" vector-effect="non-scaling-stroke"/>
  <path d="M194 126 q10 60 -20 106 q-22 16 -46 20 q42 -28 48 -82 q2 -28 18 -44z" fill="${shade}" opacity=".5"/></g>`;
const scaleG = (w, inner) => `<g transform="translate(128 0) scale(${w} 1) translate(-128 0)">${inner}</g>`;

// hair drawn behind the head (long hair, bobs) and in front of it (tops, fringes)
const HAIR = {
  curly: { front: (c) => `<path d="M46 132 q-6 -78 82 -82 q88 4 82 82 q-8 -26 -20 -36 q-4 10 -14 10 q-2 -14 -14 -18 q-6 12 -18 8 q-4 -10 -16 -10 q-10 10 -22 4 q-6 -8 -16 -4 q-6 12 -18 10 q-8 6 -12 20 q-10 6 -14 16z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/>` },
  short: { front: (c) => `<path d="M44 140 q-8 -86 84 -90 q92 4 84 90 q-8 -30 -22 -42 q-40 14 -64 4 q-30 12 -60 0 q-16 14 -22 38z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/><path d="M92 70 q30 -10 60 -4" stroke="#fff" stroke-width="3" opacity=".25" fill="none"/>` },
  messy: { front: (c) => `<path d="M42 146 q-14 -60 26 -84 l-8 -22 l26 14 l4 -28 l18 22 l16 -30 l12 30 l22 -22 l2 26 l24 -12 l-6 24 q32 20 30 82 q-12 -28 -26 -38 q-14 6 -26 -2 q-14 12 -30 2 q-16 10 -32 0 q-16 8 -28 -2 q-18 12 -24 40z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/>` },
  wild: { front: (c) => `<path d="M38 150 q-26 -50 6 -84 l-22 -10 l30 -4 l-8 -26 l28 16 l10 -30 l14 26 l20 -30 l8 32 l26 -24 l-4 30 l30 -14 l-12 26 l28 6 l-22 14 q30 34 8 84 q-6 -32 -20 -46 q-14 4 -24 -6 q-16 10 -30 0 q-16 8 -30 -2 q-16 8 -30 -2 q-20 14 -24 46z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/>` },
  bald: { front: (c) => `<path d="M44 156 q-6 -40 14 -66 q-2 30 6 56z M212 156 q6 -40 -14 -66 q2 30 -6 56z" fill="${c}" ${ST} stroke-width="3"/><ellipse cx="104" cy="82" rx="18" ry="8" fill="#fff" opacity=".3" transform="rotate(-18 104 82)"/><path d="M78 72 q50 -22 100 0" stroke="${c}" stroke-width="3" opacity=".5" fill="none"/>` },
  sidesWhite: { front: (c) => `<path d="M40 150 q-10 -40 16 -64 q-6 30 4 52 q-10 4 -20 12z M216 150 q10 -40 -16 -64 q6 30 -4 52 q10 4 20 12z" fill="${c}" ${ST} stroke-width="3"/><path d="M34 132 l-10 -6 M36 146 l-12 0 M222 132 l10 -6 M220 146 l12 0" stroke="${c}" stroke-width="4" stroke-linecap="round"/>` },
  bob: { back: (c) => `<path d="M128 46 q96 0 96 104 q0 50 -12 82 q-40 10 -84 8 q-44 2 -84 -8 q-12 -32 -12 -82 q0 -104 96 -104z" fill="${c}" ${ST} stroke-width="4"/>`,
    front: (c) => `<path d="M42 160 q-6 -108 86 -108 q92 0 86 108 q-10 -50 -30 -70 q-30 16 -94 10 q-28 6 -36 26 q-8 16 -12 34z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/><path d="M80 70 q20 -10 40 -8 M140 64 q22 0 40 10" stroke="#fff" stroke-width="3" opacity=".3" fill="none"/>` },
  curls: { front: (c) => { let s = ''; const pts = [[52, 134], [48, 108], [58, 84], [74, 66], [96, 54], [120, 48], [144, 50], [166, 56], [186, 70], [200, 90], [208, 114], [206, 138], [84, 76], [110, 66], [136, 64], [160, 72], [182, 92], [70, 100], [100, 84], [150, 84]]; for (const [x, y] of pts) s += `<circle cx="${x}" cy="${y}" r="15" fill="${c}" ${ST} stroke-width="3"/>`; for (const [x, y] of pts) s += `<path d="M${x - 6} ${y + 2} q6 -8 12 0" stroke="#8a8680" stroke-width="2" fill="none"/>`; return s; } },
  pony: { back: (c) => `<path d="M150 52 q60 -40 70 10 q8 50 -24 70 q20 -40 -4 -64 q-20 -8 -42 -16z" fill="${c}" ${ST} stroke-width="3.5"/><path d="M40 170 q-10 40 6 70 l14 -8 q-10 -30 -4 -60z M216 170 q10 40 -6 70 l-14 -8 q10 -30 4 -60z" fill="${c}" ${ST} stroke-width="3"/>`,
    front: (c) => `<path d="M42 150 q-6 -98 86 -100 q92 2 86 100 q-14 -40 -34 -56 q-30 4 -52 -6 q-26 12 -56 4 q-20 18 -30 58z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/><path d="M58 130 q4 30 -6 50 M198 130 q-4 30 6 50" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M84 70 q30 -14 60 -10 M150 60 q20 2 34 12" stroke="#fff" stroke-width="3" opacity=".35" fill="none"/>` },
  mullet: { back: (c) => `<path d="M34 150 q-6 70 18 120 l30 -10 q-16 -40 -14 -90z M222 150 q6 70 -18 120 l-30 -10 q16 -40 14 -90z" fill="${c}" ${ST} stroke-width="3.5"/>`,
    front: (c) => `<path d="M40 156 q-12 -70 22 -96 l-4 -16 l20 10 l10 -18 l14 16 l18 -20 l10 20 l20 -14 l2 20 l20 -6 l-8 18 q34 26 26 86 q-12 -34 -30 -48 q-20 8 -40 0 q-24 10 -50 0 q-22 16 -30 48z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/>` },
};
const HATS = {
  captain: (c) => `<path d="M40 116 q0 -62 88 -66 q88 4 88 66z" fill="${c}" ${ST} stroke-width="4"/><path d="M42 112 q86 -16 172 0 l-2 10 q-84 -14 -168 0z" fill="#11162a" ${ST} stroke-width="3"/><path d="M62 118 q66 -14 132 0 q-6 22 -66 22 q-60 0 -66 -22z" fill="#0a0d18" ${ST} stroke-width="3.5"/><path d="M70 74 q40 -18 80 -8" stroke="#fff" stroke-width="4" opacity=".18" fill="none"/>`,
  flatcap: (c) => `<path d="M36 120 q-2 -66 92 -72 q100 2 96 66 q-92 -16 -188 6z" fill="${c}" ${ST} stroke-width="4"/><path d="M56 120 q70 -22 150 -8 q-8 22 -76 24 q-66 2 -74 -16z" fill="#5a5648" ${ST} stroke-width="3.5"/><path d="M60 84 q50 -24 110 -10 M70 100 q40 -14 100 -6" stroke="#4a463a" stroke-width="2.5" fill="none"/>`,
};
const BROWS = {
  happy: (c) => `<path d="M72 126 q18 -10 36 -2 M148 128 q18 -8 36 4" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  raised: (c) => `<path d="M70 118 q20 -16 40 -4 M146 114 q20 -12 40 4" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  angry: (c) => `<path d="M70 120 q20 4 40 14 M186 120 q-20 4 -40 14" stroke="${c}" stroke-width="8" fill="none" stroke-linecap="round"/>`,
  sly: (c) => `<path d="M72 128 q18 -6 36 0 M146 118 q20 -10 40 2" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
};
function eyes(kind, blink, iris) {
  const shut = (x) => `<path d="M${x - 15} 150 q15 7 30 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const open = (x, y, r = 5) => `<path d="M${x - 15} ${y + 2} q15 -14 30 0 q-15 7 -30 0z" fill="#fff" ${ST} stroke-width="3"/><circle cx="${x}" cy="${y - 2}" r="${r}" fill="${iris}"/><circle cx="${x + 1.5}" cy="${y - 3.5}" r="1.5" fill="#fff"/>`;
  const wide = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="15" ry="13" fill="#fff" ${ST} stroke-width="3"/><circle cx="${x}" cy="${y}" r="6" fill="${iris}"/><circle cx="${x + 2}" cy="${y - 2}" r="2" fill="#fff"/>`;
  if (blink) return shut(91) + shut(167);
  if (kind === 'wide') return wide(91, 148) + wide(167, 148);
  if (kind === 'wink') return shut(91) + open(167, 150);
  if (kind === 'narrow') return `<path d="M76 152 q15 -8 30 0 q-15 5 -30 0z M152 152 q15 -8 30 0 q-15 5 -30 0z" fill="#fff" ${ST} stroke-width="3"/><circle cx="91" cy="150" r="4" fill="${iris}"/><circle cx="167" cy="150" r="4" fill="${iris}"/>`;
  return open(91, 150) + open(167, 150);
}
const GLASSES = {
  round: `<g fill="none" stroke="#6a4a2a" stroke-width="4"><circle cx="91" cy="150" r="21"/><circle cx="167" cy="150" r="21"/><path d="M112 148 q16 -8 34 0 M70 144 l-20 -6 M188 144 l20 -6"/></g><path d="M78 138 l8 -4 M154 138 l8 -4" stroke="#fff" stroke-width="3" opacity=".7"/>`,
  thin: `<g fill="none" stroke="#7a7470" stroke-width="3.5"><rect x="66" y="134" width="50" height="32" rx="7"/><rect x="142" y="134" width="50" height="32" rx="7"/><path d="M116 148 q13 -6 26 0 M66 144 l-18 -4 M192 144 l18 -4"/></g><path d="M74 142 l10 -4 M150 142 l10 -4" stroke="#fff" stroke-width="3" opacity=".7"/>`,
  shades: `<g ${ST} stroke-width="3.5"><path d="M62 136 h56 q2 30 -26 30 q-28 0 -30 -30z" fill="#1a1c22"/><path d="M138 136 h56 q-2 30 -30 30 q-28 0 -26 -30z" fill="#1a1c22"/><path d="M118 140 q10 -6 20 0 M62 140 l-16 -4 M194 140 l16 -4" fill="none"/></g><path d="M70 142 l14 -2 M146 142 l14 -2" stroke="#8ab4e8" stroke-width="3" opacity=".8"/>`,
  shadesUp: `<g ${ST} stroke-width="3"><path d="M64 88 h54 q0 22 -27 22 q-27 0 -27 -22z" fill="#5a3a1e"/><path d="M138 88 h54 q0 22 -27 22 q-27 0 -27 -22z" fill="#5a3a1e"/><path d="M118 92 q10 -6 20 0" fill="none"/></g><path d="M72 94 l12 -2 M146 94 l12 -2" stroke="#e8c87a" stroke-width="3" opacity=".8"/>`,
};
const NOSE = (skin) => `<path d="M124 170 q-2 10 -10 16 q-4 10 8 10 q8 4 16 0 q12 0 6 -10 q-8 -6 -10 -16" fill="${skin}" ${ST} stroke-width="3.5" stroke-linejoin="round"/>`;
const BIGNOSE = (skin) => `<path d="M122 164 q-4 14 -16 20 q-8 16 10 18 q12 6 24 0 q18 -2 10 -18 q-12 -6 -16 -20" fill="${skin}" ${ST} stroke-width="3.5" stroke-linejoin="round"/><circle cx="120" cy="190" r="3" fill="${INK}" opacity=".5"/><circle cx="136" cy="190" r="3" fill="${INK}" opacity=".5"/>`;
const STACHE = { walrus: (c) => `<path d="M86 206 q14 -16 42 -8 q28 -8 42 8 q-8 10 -22 4 q-12 -6 -20 -2 q-8 -4 -20 2 q-14 6 -22 -4z" fill="${c}" ${ST} stroke-width="3"/>` };

// mouths: 0 = closed (grin, frown or gap-tooth grin), 1 = half open, 2 = wide open, like faces.js
function mouth(kind, m) {
  const half = `<path d="M86 208 q42 8 84 0 q-8 34 -42 36 q-34 -2 -42 -36z" fill="#4a1410" ${ST} stroke-width="3.5" stroke-linejoin="round"/><path d="M92 209 q36 7 72 0 l-3 10 q-33 5 -66 0z" fill="#fbf6ea"/><path d="M110 236 q18 -8 36 0 q-18 7 -36 0z" fill="#d8605a"/>`;
  const wide = `<path d="M84 204 q44 10 88 0 q-6 46 -44 48 q-38 -2 -44 -48z" fill="#3e100c" ${ST} stroke-width="3.5" stroke-linejoin="round"/><path d="M90 205 q38 8 76 0 l-3 11 q-35 5 -70 0z" fill="#fbf6ea"/><path d="M104 240 q24 -14 48 0 q-24 12 -48 0z" fill="#d8605a"/>`;
  if (kind === 'frown') return [`<path d="M96 230 q32 -20 64 0" fill="none" ${ST} stroke-width="5" stroke-linecap="round"/><path d="M92 234 q2 -4 6 -4 M164 234 q-2 -4 -6 -4" ${ST} stroke-width="3" fill="none"/>`,
    `<path d="M98 224 q30 -10 60 0 q-4 20 -30 20 q-26 0 -30 -20z" fill="#4a1410" ${ST} stroke-width="3.5"/><path d="M104 224 q24 -6 48 0 l-2 6 q-22 -4 -44 0z" fill="#fbf6ea"/>`,
    `<path d="M94 218 q34 -10 68 0 q-4 30 -34 30 q-30 0 -34 -30z" fill="#3e100c" ${ST} stroke-width="3.5"/><path d="M100 219 q28 -7 56 0 l-2 8 q-26 -5 -52 0z" fill="#fbf6ea"/>`][m];
  if (m === 1) return half;
  if (m === 2) return wide;
  const grin = `<path d="M88 214 q40 24 80 0 q-40 10 -80 0z" fill="#fbf6ea" ${ST} stroke-width="3.5" stroke-linejoin="round"/><path d="M88 214 q40 30 80 0" fill="none" ${ST} stroke-width="4" stroke-linecap="round"/>`;
  if (kind === 'gap') return grin + `<rect x="118" y="216" width="9" height="9" fill="#3e100c"/><rect x="138" y="215" width="7" height="8" fill="#3e100c"/>`;
  if (kind === 'smirk') return `<path d="M96 220 q34 10 66 -6" fill="none" ${ST} stroke-width="4.5" stroke-linecap="round"/><path d="M160 210 q6 2 6 8" ${ST} stroke-width="3" fill="none"/>`;
  if (kind === 'smile') return `<path d="M94 214 q34 20 68 0" fill="none" ${ST} stroke-width="4.5" stroke-linecap="round"/><path d="M90 210 q3 5 7 6 M166 210 q-3 5 -7 6" ${ST} stroke-width="3" fill="none"/>`;
  return grin;
}

// clothes: the shoulders (Eddy's line) plus what makes each outfit
const BODY = `M8 320 q4 -62 70 -74 q50 16 100 0 q66 12 70 74z`;
const NECK = (shade) => `<path d="M102 226 v24 q26 12 52 0 v-24z" fill="${shade}" ${ST} stroke-width="3.5"/>`;
const CLOTHES = {
  teeApron: (o) => `<path d="${BODY}" fill="#2a3036" ${ST} stroke-width="4"/><path d="M98 248 q30 18 60 0" fill="none" ${ST} stroke-width="3.5"/>
    <path d="M78 262 l12 58 h18 l-8 -60z M178 262 l-12 58 h-18 l8 -60z" fill="#4a5e76" ${ST} stroke-width="3"/><path d="M96 296 h64 v24 h-64z" fill="#4a5e76" ${ST} stroke-width="3"/><circle cx="102" cy="300" r="3" fill="#c8a24a"/><circle cx="154" cy="300" r="3" fill="#c8a24a"/>`,
  floral: (o) => `<path d="${BODY}" fill="url(#flor${o.id})" ${ST} stroke-width="4"/><path d="M8 320 q4 -62 70 -74 l8 74z M248 320 q-4 -62 -70 -74 l-8 74z" fill="#3a4a7a" ${ST} stroke-width="3.5"/>
    <path d="M92 244 q36 30 72 0 l6 22 q-42 30 -84 0z" fill="url(#knit${o.id})" ${ST} stroke-width="3.5"/><path d="M146 262 l10 46 l-14 0 l-4 -40z" fill="url(#knit${o.id})" ${ST} stroke-width="3"/>`,
  plaidApron: (o) => `<path d="${BODY}" fill="url(#plaid${o.id})" ${ST} stroke-width="4"/><path d="M104 248 l24 18 l24 -18" fill="#f4f2ec" ${ST} stroke-width="3"/>
    <path d="M92 270 h72 l4 50 h-80z" fill="#f4f2ec" ${ST} stroke-width="3.5"/><path d="M92 270 l-12 -22 M164 270 l12 -22" stroke="#f4f2ec" stroke-width="7"/><path d="M92 270 l-12 -22 M164 270 l12 -22" ${ST} stroke-width="1.5" fill="none"/>`,
  hoodieVest: (o) => `<path d="${BODY}" fill="#74787c" ${ST} stroke-width="4"/><path d="M72 250 q56 -28 112 0 q-10 20 -56 22 q-46 -2 -56 -22z" fill="#8a8e92" ${ST} stroke-width="3.5"/>
    <path d="M8 320 q4 -62 70 -74 l30 30 v44z M248 320 q-4 -62 -70 -74 l-30 30 v44z" fill="#1e2a44" ${ST} stroke-width="3.5"/><path d="M30 290 h60 M24 306 h70 M166 290 h60 M162 306 h70" stroke="#2e3c5c" stroke-width="3"/><path d="M128 278 v42" ${ST} stroke-width="3"/>`,
  tracksuit: (o) => `<path d="${BODY}" fill="#1e2e6a" ${ST} stroke-width="4"/><path d="M78 246 q50 16 100 0 l-10 26 q-40 10 -80 0z" fill="#c82a2a" ${ST} stroke-width="3"/>
    <path d="M110 250 l18 34 l18 -34z" fill="#6a6a62" ${ST} stroke-width="3"/><path d="M22 300 q14 -34 44 -46 M30 310 q14 -34 44 -46 M38 318 q14 -34 44 -46 M234 300 q-14 -34 -44 -46 M226 310 q-14 -34 -44 -46 M218 318 q-14 -34 -44 -46" stroke="#f4f4f4" stroke-width="3.5" fill="none"/>`,
  trench: (o) => `<path d="${BODY}" fill="#c8b48a" ${ST} stroke-width="4"/><path d="M104 248 l24 50 l24 -50z" fill="url(#leo${o.id})" ${ST} stroke-width="3"/>
    <path d="M104 248 l-30 18 l18 14 l-6 30 l30 -12z M152 248 l30 18 l-18 14 l6 30 l-30 -12z" fill="#d8c49a" ${ST} stroke-width="3"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<circle cx="${106 + i * 5.5}" cy="${256 + Math.sin(i / 8 * Math.PI) * 18}" r="3" fill="#f6f2e8" ${ST} stroke-width="1"/>`).join('')}`,
  puffer: (o) => `<path d="${BODY}" fill="#f04a9a" ${ST} stroke-width="4"/><path d="M8 320 q4 -50 40 -66 l14 66z M248 320 q-4 -50 -40 -66 l-14 66z" fill="#2ab0b0" ${ST} stroke-width="3.5"/>
    <path d="M70 252 q58 -26 116 0 q-8 22 -58 26 q-50 -4 -58 -26z" fill="#f6a8cc" ${ST} stroke-width="3.5"/><path d="M40 288 q30 -6 60 0 M156 288 q30 -6 60 0 M30 306 q40 -6 70 0 M156 306 q40 -6 70 0" stroke="#c8307a" stroke-width="3" fill="none"/>
    <path d="M100 250 q28 18 56 0" stroke="#d8306a" stroke-width="4" fill="none"/><path d="M98 256 q30 20 60 0" stroke="#7ad85a" stroke-width="3" fill="none"/>`,
  velvet: (o) => `<path d="${BODY}" fill="#6a5a6a" ${ST} stroke-width="4"/><path d="M24 320 q4 -50 54 -70 l22 6 l10 64z M232 320 q-4 -50 -54 -70 l-22 6 l-10 64z" fill="url(#velv${o.id})" ${ST} stroke-width="3.5"/>
    <path d="M100 246 q28 26 56 0 l6 14 q-34 30 -68 0z" fill="#8a7a64" ${ST} stroke-width="3.5"/><path d="M122 268 l-8 28 l14 -6 l14 6 l-8 -28z" fill="#8a7a64" ${ST} stroke-width="3"/><path d="M112 300 v20 M140 300 v20" stroke="#4a3a4a" stroke-width="3"/>`,
  overall: (o) => `<path d="${BODY}" fill="#2a3a6a" ${ST} stroke-width="4"/><path d="M100 246 l-24 22 l22 12 l8 -26z M156 246 l24 22 l-22 12 l-8 -26z" fill="#34467a" ${ST} stroke-width="3"/>
    <path d="M110 250 l18 26 l18 -26z" fill="#6a6658" ${ST} stroke-width="3"/><rect x="150" y="288" width="44" height="18" rx="4" fill="#f0e6c8" ${ST} stroke-width="2.5"/><text x="172" y="301" font-family="Arial" font-weight="700" font-size="11" text-anchor="middle" fill="#2a3a6a">Rinus</text>
    <path d="M40 300 q10 -24 30 -36 M40 312 l10 -4" stroke="#1e2a50" stroke-width="3" fill="none"/><circle cx="72" cy="298" r="3" fill="#9aa0a8"/>`,
  collar: (o) => `<path d="${BODY}" fill="#232a40" ${ST} stroke-width="4"/><path d="M100 246 l28 34 l28 -34 q-28 10 -56 0z" fill="${o.shade}" ${ST} stroke-width="3.5"/>
    <path d="M100 246 l-18 24 l22 8 l6 -22z M156 246 l18 24 l-22 8 l-6 -22z" fill="#2e3654" ${ST} stroke-width="3"/><path d="M40 300 q8 -28 34 -40 M216 300 q-8 -28 -34 -40" stroke="#151a2a" stroke-width="4" fill="none"/>`,
};
const EXTRA = {
  hoops: `<circle cx="48" cy="196" r="9" fill="none" stroke="#e8c04a" stroke-width="3.5"/><circle cx="208" cy="196" r="9" fill="none" stroke="#e8c04a" stroke-width="3.5"/>`,
  beads: `<path d="M64 150 q-6 40 -2 70 M192 150 q6 40 2 70" stroke="#d84a6a" stroke-width="3" stroke-dasharray="3 3" fill="none"/>`,
  stubble: `<path d="M60 190 q10 50 68 64 q58 -14 68 -64 q-6 40 -68 52 q-62 -12 -68 -52z" fill="#5a3a2a" opacity=".25"/><path d="M96 230 q32 20 64 0" stroke="#5a3a2a" stroke-width="10" opacity=".18" fill="none"/>`,
  wrinkles: `<path d="M84 104 q44 -10 88 0 M90 114 q38 -8 76 0" stroke="#000" stroke-width="2" opacity=".15" fill="none"/><path d="M62 164 q-4 10 4 18 M194 164 q4 10 -4 18" stroke="#000" stroke-width="2" opacity=".18" fill="none"/>`,
  herring: `<path d="M208 320 q-6 -50 10 -96 q10 4 12 16 q-6 40 2 80z" fill="#b8c4cc" ${ST} stroke-width="3"/><path d="M212 236 l-6 -14 l16 4z" fill="#8a96a0" ${ST} stroke-width="2.5"/><circle cx="218" cy="248" r="2.5" fill="${INK}"/>`,
  phone: `<rect x="196" y="236" width="38" height="66" rx="6" fill="#c8ccd2" ${ST} stroke-width="3" transform="rotate(10 215 269)"/><circle cx="206" cy="250" r="4" fill="#2a2a30" transform="rotate(10 215 269)"/><circle cx="216" cy="250" r="4" fill="#2a2a30" transform="rotate(10 215 269)"/><path d="M222 232 l6 -30" stroke="#1a1a1a" stroke-width="5"/>`,
  tin: `<rect x="190" y="252" width="48" height="56" rx="6" fill="#c89a3a" ${ST} stroke-width="3.5"/><ellipse cx="214" cy="252" rx="24" ry="7" fill="#e0b85a" ${ST} stroke-width="3"/><rect x="204" y="250" width="20" height="4" fill="#3a2a1e"/>`,
  binoculars: `<g ${ST} stroke-width="3"><rect x="22" y="268" width="26" height="40" rx="6" fill="#2a2e2a"/><rect x="52" y="268" width="26" height="40" rx="6" fill="#2a2e2a"/><rect x="44" y="276" width="12" height="16" fill="#3a3e3a"/></g><circle cx="35" cy="272" r="7" fill="#6a8aa0" ${ST} stroke-width="2"/><circle cx="65" cy="272" r="7" fill="#6a8aa0" ${ST} stroke-width="2"/>`,
  keys: `<path d="M196 300 q20 -20 40 0" stroke="#9a9a9a" stroke-width="4" fill="none"/>${[0, 1, 2, 3, 4].map((i) => `<path d="M${200 + i * 8} ${296 - (i % 2) * 3} v18 l4 2 v4" stroke="#d8c88a" stroke-width="3" fill="none"/>`).join('')}`,
  bottles: `<g ${ST} stroke-width="3"><path d="M190 320 q-8 -40 20 -64 q30 -10 40 20 v44z" fill="#e8f0f2" opacity=".9"/></g><rect x="206" y="270" width="10" height="26" rx="3" fill="#4a9a4a" ${ST} stroke-width="2"/><rect x="222" y="276" width="10" height="24" rx="3" fill="#c84a3a" ${ST} stroke-width="2"/>`,
  clipboard: `<rect x="192" y="248" width="52" height="66" rx="4" fill="#a8743a" ${ST} stroke-width="3" transform="rotate(8 218 281)"/><rect x="198" y="256" width="40" height="52" fill="#f6f4ec" transform="rotate(8 218 281)"/><path d="M204 266 h28 M204 276 h28 M204 286 h20" stroke="#8a8a8a" stroke-width="2" transform="rotate(8 218 281)"/>`,
  finger: `<path d="M24 320 q0 -40 16 -56 l6 -40 q4 -8 10 0 l0 44 q14 6 10 52z" fill="#f0c8aa" ${ST} stroke-width="3.5"/>`,
  peace: `<path d="M196 320 q-4 -30 8 -44 l-4 -34 q4 -6 9 0 l5 30 l6 -30 q5 -6 9 0 l-4 36 q8 16 4 42z" fill="#f2c8a8" ${ST} stroke-width="3.5"/>`,
};

// the cast: skin / shade, face width, hair style + colour, hat, brows, eyes, glasses, nose, moustache, mouth, clothes, extras, backdrop tint
const SAFFRON = ['#f6c25a', '#e8903a', '#7a2c16'];
const CAST = {
  shooki: { skin: '#d8a07a', shade: '#b07a5a', w: 0.92, hair: 'bald', hc: '#2a1e18', brows: 'happy', bc: '#2a1e18', eyes: 'normal', iris: '#3a2a1e', mouth: 'smile', clothes: 'teeApron', extras: ['stubble'], tint: SAFFRON },
  jossi: { skin: '#f0c4a4', shade: '#d09a7c', w: 1.04, hair: 'short', hc: '#1e1814', brows: 'happy', bc: '#1e1814', eyes: 'narrow', iris: '#3a2a20', mouth: 'smile', clothes: 'collar', extras: [], tint: SAFFRON },
  truus: { skin: '#f0c8a8', shade: '#d09a80', w: 0.96, hair: 'curls', hc: '#cfcac2', brows: 'sly', bc: '#a8a49c', eyes: 'normal', iris: '#4a3a2a', glasses: 'round', mouth: 'smirk', clothes: 'floral', extras: ['wrinkles', 'binoculars'], tint: ['#f8d070', '#e8a04a', '#8a3a1a'] },
  haring: { skin: '#eab08e', shade: '#c88a6c', w: 1.02, hair: 'sidesWhite', hc: '#d8d2c6', hat: 'captain', hatc: '#1a2240', brows: 'raised', bc: '#c8c2b6', eyes: 'normal', iris: '#3a4a5a', nose: 'big', stache: 'walrus', sc: '#b8865a', mouth: 'grin', clothes: 'plaidApron', extras: ['wrinkles', 'herring'], tint: ['#f6d07a', '#e0904a', '#6a2a18'] },
  bram: { skin: '#eab490', shade: '#c88e6e', w: 0.94, hair: 'messy', hc: '#8a623e', brows: 'raised', bc: '#6a4a2e', eyes: 'wide', iris: '#4a6a8a', mouth: 'grin', clothes: 'hoodieVest', extras: ['stubble', 'tin'], tint: SAFFRON },
  sjonnie: { skin: '#dcae90', shade: '#b88a6e', w: 0.9, hair: 'messy', hc: '#7a6a58', brows: 'sly', bc: '#5a4a3a', eyes: 'wink', iris: '#4a3a2a', nose: 'big', mouth: 'gap', clothes: 'tracksuit', extras: ['stubble', 'wrinkles', 'bottles'], tint: ['#f2c050', '#d88a36', '#6a2814'] },
  visser: { skin: '#f0c8aa', shade: '#d0a088', w: 0.94, hair: 'bob', hc: '#d4c296', brows: 'angry', bc: '#8a7a58', eyes: 'narrow', iris: '#4a6a7a', glasses: 'thin', mouth: 'frown', clothes: 'trench', extras: ['beads', 'wrinkles', 'clipboard', 'finger'], tint: ['#f0b85a', '#d8783a', '#6a2414'] },
  lotte: { skin: '#f4caa8', shade: '#d8a284', w: 0.92, hair: 'pony', hc: '#e8c470', glasses: 'shadesUp', brows: 'raised', bc: '#b8904a', eyes: 'wide', iris: '#4a7aa8', mouth: 'grin', clothes: 'puffer', extras: ['hoops', 'peace'], tint: ['#f8c8d8', '#e8889a', '#7a2c4a'] },
  dirk: { skin: '#f0b090', shade: '#d08a6e', w: 1.0, hair: 'sidesWhite', hc: '#d0ccc4', hat: 'flatcap', hatc: '#7a7462', brows: 'raised', bc: '#c8c4bc', eyes: 'wide', iris: '#3a4a5a', nose: 'big', stache: 'walrus', sc: '#d8d2c8', mouth: 'grin', clothes: 'velvet', extras: ['wrinkles', 'tin'], tint: SAFFRON },
  rinus: { skin: '#e2b290', shade: '#c08c6c', w: 0.86, hair: 'mullet', hc: '#4a3424', brows: 'sly', bc: '#3a2818', glasses: 'shades', mouth: 'smirk', clothes: 'overall', extras: ['stubble', 'keys'], tint: ['#f0c060', '#d88a3a', '#5a2a1a'] },
};


// ---- the second batch (2026-11-27 15:05): the people Eddy talks to most
Object.assign(HAIR, {
  shaggy: { front: (c) => `<path d="M40 176 q-14 -110 88 -116 q102 6 88 116 q-8 -40 -18 -56 q-10 20 -24 14 q-4 -24 -18 -30 q-10 22 -30 18 q-6 -18 -22 -18 q-12 18 -30 14 q-10 20 -22 10 q-8 20 -12 48z" fill="${c}" ${ST} stroke-width="3.5" stroke-linejoin="round"/>` },
  stringy: { back: (c) => `<path d="M36 140 q-10 70 6 120 l16 -4 q-10 -50 -4 -110z M220 140 q10 70 -6 120 l-16 -4 q10 -50 4 -110z" fill="${c}" ${ST} stroke-width="3"/>`,
    front: (c) => `<path d="M42 150 q-4 30 -10 54 M50 150 q0 34 -6 60 M214 150 q4 30 10 54 M206 150 q0 34 6 60" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>` },
  payot: { front: (c) => `<path d="M40 150 q-8 30 4 46 q-12 10 -2 26 q-10 12 2 26 M216 150 q8 30 -4 46 q12 10 2 26 q10 12 -2 26" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M44 148 q-4 -40 14 -60 q0 30 6 52z M212 148 q4 -40 -14 -60 q0 30 -6 52z" fill="${c}" ${ST} stroke-width="3"/>` },
  greySides: { front: (c) => `<path d="M42 156 q-8 -44 16 -72 q-4 34 6 60z M214 156 q8 -44 -16 -72 q4 34 -6 60z" fill="${c}" ${ST} stroke-width="3"/>` },
});
Object.assign(HATS, {
  police: (c) => `<path d="M40 118 q0 -66 88 -70 q88 4 88 70z" fill="${c}" ${ST} stroke-width="4"/><path d="M60 118 q68 -12 136 0 q-6 22 -68 22 q-62 0 -68 -22z" fill="#0c1428" ${ST} stroke-width="3.5"/>
    <path d="M118 76 l10 -14 l10 14 l-4 12 h-12z" fill="#e8b830" ${ST} stroke-width="2"/><path d="M122 80 q6 -8 12 0" stroke="#a87a10" stroke-width="2" fill="none"/>`,
  ballcap: (c) => `<path d="M42 120 q0 -68 86 -72 q86 4 86 72z" fill="${c}" ${ST} stroke-width="4"/><path d="M56 118 q72 -14 144 0 q-4 18 -72 22 q-68 -4 -72 -22z" fill="#2a3a5a" ${ST} stroke-width="3.5"/><circle cx="128" cy="50" r="5" fill="${c}" ${ST} stroke-width="2.5"/><path d="M86 64 q40 -14 80 -2" stroke="#fff" stroke-width="3" opacity=".2" fill="none"/>`,
  ballcapBack: (c) => `<path d="M42 118 q0 -66 86 -70 q86 4 86 70z" fill="${c}" ${ST} stroke-width="4"/><path d="M42 116 q86 -8 172 0" stroke="#1a1a1e" stroke-width="5" fill="none"/><path d="M104 108 h48 v10 h-48z" fill="#d8b04a" ${ST} stroke-width="2.5"/><path d="M190 96 q30 0 34 14 q-20 6 -40 0z" fill="${c}" ${ST} stroke-width="3"/>`,
  hairnet: (c) => `<path d="M34 124 q-6 -84 94 -84 q100 0 94 84 q-14 8 -24 0 q-12 8 -24 0 q-12 8 -24 0 q-12 8 -24 0 q-12 8 -22 0 q-12 8 -24 0 q-12 8 -24 0 q-10 8 -22 0z" fill="#f4f6fa" ${ST} stroke-width="3.5" stroke-linejoin="round"/>${[[70, 70], [100, 56], [130, 52], [160, 58], [188, 74], [86, 92], [120, 84], [154, 88], [180, 102], [60, 100]].map(([x, y]) => `<path d="M${x - 9} ${y} q9 -8 18 0" stroke="#c8ccd4" stroke-width="2.5" fill="none"/>`).join('')}`,
  beanie: (c) => `<path d="M42 126 q-4 -86 86 -88 q90 2 86 88z" fill="${c}" ${ST} stroke-width="4"/><path d="M40 112 q88 -14 176 0 l2 18 q-90 -14 -180 0z" fill="#26282c" ${ST} stroke-width="3.5"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<path d="M${66 + i * 18} 54 v54" stroke="#3a3c42" stroke-width="2.5"/>`).join('')}`,
  wideBrim: (c) => `<path d="M8 120 q120 -34 240 0 q-10 16 -120 16 q-110 0 -120 -16z" fill="${c}" ${ST} stroke-width="4"/><path d="M52 112 q-6 -76 76 -78 q82 2 76 78 q-76 -10 -152 0z" fill="${c}" ${ST} stroke-width="4"/><path d="M54 104 q74 -10 148 0 v8 q-74 -10 -148 0z" fill="#26262a"/><path d="M80 54 q40 -16 80 -4" stroke="#fff" stroke-width="3" opacity=".18" fill="none"/>`,
  hood: (c) => `<path d="M30 160 q-10 -128 98 -130 q108 2 98 130 q-6 -96 -98 -98 q-92 2 -98 98z" fill="${c}" ${ST} stroke-width="4"/><path d="M36 150 q4 -10 10 -14 M220 150 q-4 -10 -10 -14" stroke="#2a2c30" stroke-width="3" fill="none"/>`,
});
const HOODBACK = (c) => `<path d="M128 26 q112 0 112 130 q0 70 -30 110 q-82 -10 -164 0 q-30 -40 -30 -110 q0 -130 112 -130z" fill="${c}" ${ST} stroke-width="4"/>`;
const BEARD = {
  big: (c) => `<path d="M54 172 q-8 86 34 126 q40 26 80 0 q42 -40 34 -126 q-12 44 -44 56 q-30 10 -60 0 q-32 -12 -44 -56z" fill="${c}" ${ST} stroke-width="3.5"/><path d="M84 236 q4 30 18 44 M112 250 q2 30 10 44 M146 250 q-2 30 -10 44 M172 236 q-4 30 -18 44" stroke="#6a6660" stroke-width="2.5" fill="none"/><path d="M88 206 q14 -14 40 -8 q26 -6 40 8 q-10 12 -40 6 q-30 6 -40 -6z" fill="${c}" ${ST} stroke-width="3"/>`,
  short: (c) => `<path d="M62 186 q2 54 66 70 q64 -16 66 -70 q-10 34 -30 40 q-14 -8 -36 -6 q-22 -2 -36 6 q-20 -6 -30 -40z" fill="${c}" ${ST} stroke-width="3"/><path d="M92 206 q14 -10 36 -6 q22 -4 36 6 q-10 8 -36 4 q-26 4 -36 -4z" fill="${c}" ${ST} stroke-width="2.5"/>`,
};
Object.assign(CLOTHES, {
  police: (o) => `<path d="${BODY}" fill="#1a2546" ${ST} stroke-width="4"/><path d="M98 244 l30 22 l30 -22 l4 14 l-34 26 l-34 -26z" fill="#121a34" ${ST} stroke-width="3"/>
    <path d="M14 290 q114 -18 228 0 l2 14 q-116 -18 -232 0z" fill="#f2e43a" ${ST} stroke-width="2.5"/><path d="M14 304 q114 -18 232 0 v6 q-116 -18 -232 0z" fill="#2a5ab8"/><text x="128" y="300" font-family="Arial" font-weight="900" font-size="12" text-anchor="middle" fill="#1a2546">POLITIE</text>
    <path d="M30 262 l22 -8 l6 10 l-22 8z M226 262 l-22 -8 l-6 10 l22 8z" fill="#0c1428" ${ST} stroke-width="2"/>`,
  shirtApron: (o) => `<path d="${BODY}" fill="#3a6ab8" ${ST} stroke-width="4"/><path d="M100 246 l-20 22 l22 10 l6 -24z M156 246 l20 22 l-22 10 l-6 -24z" fill="#4a7ac8" ${ST} stroke-width="3"/><path d="M108 250 l20 22 l20 -22z" fill="#1a1a1e" ${ST} stroke-width="2.5"/>
    <path d="M88 270 h80 l6 50 h-92z" fill="#b8b098" ${ST} stroke-width="3.5"/><path d="M88 270 l-6 -24 M168 270 l6 -24" stroke="#b8b098" stroke-width="6"/>`,
  overallB: (o) => `<path d="${BODY}" fill="#2a3a6a" ${ST} stroke-width="4"/><path d="M100 246 l-24 22 l22 12 l8 -26z M156 246 l24 22 l-22 12 l-8 -26z" fill="#34467a" ${ST} stroke-width="3"/><path d="M110 250 l18 26 l18 -26z" fill="#6a6658" ${ST} stroke-width="3"/>
    <path d="M40 300 q10 -24 30 -36 M216 300 q-10 -24 -30 -36" stroke="#1e2a50" stroke-width="3" fill="none"/>`,
  blackCoat: (o) => `<path d="${BODY}" fill="#16161a" ${ST} stroke-width="4"/><path d="M104 246 l24 46 l24 -46z" fill="#f2f0ea" ${ST} stroke-width="3"/><path d="M104 246 l-26 20 l20 12 l-4 34 l32 -20z M152 246 l26 20 l-20 12 l4 34 l-32 -20z" fill="#222228" ${ST} stroke-width="3"/>
    <path d="M150 256 l18 34" stroke="#2a2a2a" stroke-width="2.5"/><rect x="156" y="288" width="40" height="26" rx="3" fill="#f4f4f0" ${ST} stroke-width="2.5"/><rect x="156" y="288" width="40" height="8" fill="#2a5ab8"/><rect x="160" y="299" width="9" height="11" fill="#8a8a8a"/><path d="M173 302 h18 M173 307 h14" stroke="#8a8a8a" stroke-width="2"/>`,
  cardigan: (o) => `<path d="${BODY}" fill="#5a4a36" ${ST} stroke-width="4"/><path d="M100 246 l28 40 l28 -40 q-28 10 -56 0z" fill="url(#plaid${o.id})" ${ST} stroke-width="3"/><path d="M100 246 l28 74 M156 246 l-28 74" ${ST} stroke-width="3"/><circle cx="118" cy="292" r="3.5" fill="#3a2a1a"/><circle cx="114" cy="310" r="3.5" fill="#3a2a1a"/>
    ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${30 + i * 12} ${300 - i * 6} q4 4 8 0" stroke="#6a5a44" stroke-width="2" fill="none"/>`).join('')}`,
  hoodieTrack: (o) => `<path d="${BODY}" fill="#55595e" ${ST} stroke-width="4"/><path d="M110 250 l18 70 l18 -70z" fill="#2a4a9a" ${ST} stroke-width="3"/><path d="M114 270 l14 12 l14 -12 v10 l-14 12 l-14 -12z" fill="#c82a3a"/><path d="M110 250 l18 70 M146 250 l-18 70" stroke="#c8c8c8" stroke-width="2"/><path d="M104 248 v40 M152 248 v40" stroke="#dcdcdc" stroke-width="2.5"/>`,
  butcher: (o) => `<path d="${BODY}" fill="#f2efe8" ${ST} stroke-width="4"/><path d="M100 246 l-20 22 l22 10 l6 -24z M156 246 l20 22 l-22 10 l-6 -24z" fill="#fbf8f2" ${ST} stroke-width="3"/>
    <path d="M86 268 h84 l8 52 h-100z" fill="#f2efe8" ${ST} stroke-width="3.5"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${88 + i * 12}" y="268" width="6" height="52" fill="#c83a3a"/>`).join('')}<path d="M86 268 l-6 -22 M170 268 l6 -22" stroke="#c83a3a" stroke-width="6"/>`,
  oliveCoat: (o) => `<path d="${BODY}" fill="#4a4a32" ${ST} stroke-width="4"/><path d="M100 244 l-28 22 l22 14 l-4 30 l32 -26z M156 244 l28 22 l-22 14 l4 30 l-32 -26z" fill="#56563a" ${ST} stroke-width="3"/>
    <path d="M94 240 q34 26 68 0 l6 22 q-40 30 -80 0z" fill="#232326" ${ST} stroke-width="3"/><path d="M140 258 l8 50 h-14 l-2 -46z" fill="#232326" ${ST} stroke-width="3"/><path d="M60 290 q20 -4 30 6 M180 280 q12 6 20 0" stroke="#3a3a24" stroke-width="3" fill="none"/>`,
});
Object.assign(EXTRA, {
  smudges: `<circle cx="80" cy="182" r="9" fill="#e8742a" opacity=".85"/><circle cx="176" cy="184" r="9" fill="#e8742a" opacity=".85"/><path d="M118 176 q10 -6 20 0 l-4 16 q-6 4 -12 0z" fill="#e8742a" opacity=".8"/>`,
  stains: `<circle cx="60" cy="290" r="8" fill="#e8c43a" opacity=".8"/><circle cx="196" cy="276" r="7" fill="#e8742a" opacity=".8"/><circle cx="130" cy="300" r="9" fill="#e8c43a" opacity=".7"/><circle cx="90" cy="310" r="6" fill="#e8742a" opacity=".8"/>`,
  paddle: `<path d="M198 320 l18 -110" stroke="#a8743a" stroke-width="10" stroke-linecap="round"/><path d="M200 216 q6 -50 30 -60 q20 4 16 30 l-18 40z" fill="#c8945a" ${ST} stroke-width="3.5"/><path d="M212 188 q6 -8 14 -6" stroke="#e8742a" stroke-width="4"/>`,
  sack: `<path d="M180 320 q-10 -60 14 -76 q-6 -10 6 -14 q20 6 30 0 q12 6 4 14 q22 20 14 76z" fill="#c8a46a" ${ST} stroke-width="3.5"/><path d="M196 238 q14 -8 30 0" stroke="#e8742a" stroke-width="5"/><path d="M196 270 h40 M192 292 h46" stroke="#a8844a" stroke-width="2"/>`,
  phoneEar: `<rect x="186" y="128" width="20" height="44" rx="5" fill="#1a1a1e" ${ST} stroke-width="3" transform="rotate(-14 196 150)"/><path d="M196 176 q14 30 2 64" stroke="#f0c8aa" stroke-width="18" fill="none" stroke-linecap="round"/><path d="M196 176 q14 30 2 64" stroke="${INK}" stroke-width="3" fill="none" opacity=".6"/>`,
  arms: `<path d="M28 318 q60 -40 150 -30" stroke="${INK}" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M28 318 q60 -40 150 -30" stroke="#e8a888" stroke-width="27" fill="none" stroke-linecap="round"/><path d="M228 318 q-60 -36 -150 -26" stroke="${INK}" stroke-width="34" fill="none" stroke-linecap="round"/><path d="M228 318 q-60 -36 -150 -26" stroke="#e8a888" stroke-width="27" fill="none" stroke-linecap="round"/><path d="M70 300 q30 -8 60 -6 M150 300 q24 -6 40 -2" stroke="#b8785a" stroke-width="2" fill="none"/>`,
  notebook: `<rect x="188" y="250" width="52" height="66" rx="4" fill="#8a5a2a" ${ST} stroke-width="3" transform="rotate(-6 214 283)"/><rect x="196" y="244" width="40" height="12" fill="#f4ecd8" ${ST} stroke-width="2" transform="rotate(-10 216 250)"/><path d="M196 284 q14 -4 30 0" stroke="#3a2a1a" stroke-width="2" transform="rotate(-6 214 283)"/>`,
  whisper: `<path d="M150 262 q0 -40 14 -66 q6 -8 10 0 q-4 20 -2 34 l8 -40 q6 -8 10 0 l-4 44 q6 18 -2 30z" fill="#e2b090" ${ST} stroke-width="3.5"/>`,
  thermos: `<rect x="40" y="246" width="30" height="70" rx="5" fill="#b8bcc0" ${ST} stroke-width="3.5"/><rect x="42" y="236" width="26" height="14" rx="3" fill="#6a6e72" ${ST} stroke-width="3"/><path d="M48 260 v40" stroke="#fff" stroke-width="3" opacity=".5"/>`,
  wrench: `<path d="M196 320 l26 -96" stroke="#e8c43a" stroke-width="12" stroke-linecap="round"/><path d="M210 214 q8 -30 30 -24 q-10 10 -4 18 q10 4 16 -6 q4 22 -22 30z" fill="#e8c43a" ${ST} stroke-width="3"/>`,
  sweat: `<path d="M196 118 q6 10 0 16 q-6 -6 0 -16z" fill="#bfe4ff" ${ST} stroke-width="2"/>`,
});
Object.assign(CAST, {
  mo: { skin: '#e2a888', shade: '#c0846a', w: 0.94, hair: 'greySides', hc: '#6a5038', hat: 'ballcapBack', hatc: '#2a2a2e', brows: 'raised', bc: '#5a4030', eyes: 'normal', iris: '#3a4a5a', stache: 'walrus', sc: '#7a5232', mouth: 'grin', clothes: 'overallB', extras: ['stubble', 'wrinkles', 'wrench'], tint: SAFFRON },
  bakker: { skin: '#e8b494', shade: '#c88e70', w: 0.92, hair: 'greySides', hc: '#8a8680', hat: 'police', hatc: '#1a2546', brows: 'happy', bc: '#7a7670', eyes: 'narrow', iris: '#3a4a5a', stache: 'walrus', sc: '#8a7a6a', mouth: 'smile', clothes: 'police', extras: ['stubble', 'wrinkles'], tint: ['#e8c87a', '#c8904a', '#4a2a1a'] },
  naknik1: { skin: '#f0c4a2', shade: '#d09c7e', w: 0.9, hair: 'shaggy', hc: '#6a4a2e', hat: 'hairnet', brows: 'raised', bc: '#5a3a22', eyes: 'normal', iris: '#3a5a7a', mouth: 'grin', clothes: 'shirtApron', extras: ['smudges', 'stains', 'paddle'], tint: SAFFRON },
  naknik2: { skin: '#f2c2a0', shade: '#d29a7c', w: 0.98, hair: 'shaggy', hc: '#7a5a38', hat: 'ballcap', hatc: '#3a4a7a', brows: 'happy', bc: '#6a4a2a', eyes: 'normal', iris: '#4a3a2a', mouth: 'gap', clothes: 'overallB', extras: ['stubble', 'stains', 'sack'], tint: SAFFRON },
  creplach: { skin: '#e6b496', shade: '#c48e70', w: 0.92, hair: 'payot', hc: '#2a2420', hat: 'wideBrim', hatc: '#121214', brows: 'angry', bc: '#3a3430', eyes: 'narrow', iris: '#3a2a1e', glasses: 'thin', beard: 'big', brd: '#8a8680', mouth: 'frown', clothes: 'blackCoat', extras: [], tint: ['#e898c8', '#9a4aa8', '#2a1a4a'] },
  joop: { skin: '#eab090', shade: '#c88a6c', w: 0.94, hair: 'sidesWhite', hc: '#d8d4cc', hat: 'flatcap', hatc: '#3a3c36', brows: 'sly', bc: '#d0ccc4', eyes: 'narrow', iris: '#4a6a8a', beard: 'short', brd: '#e8e4dc', mouth: 'smirk', clothes: 'cardigan', extras: ['wrinkles', 'finger', 'notebook'], tint: SAFFRON },
  kevin: { skin: '#eec2a4', shade: '#cc9c80', w: 0.86, hair: 'shaggy', hc: '#7a5a3a', hat: 'hood', hatc: '#55595e', hoodBack: '#4a4e52', brows: 'angry', bc: '#5a4030', eyes: 'wide', iris: '#5a7a8a', mouth: 'frown', clothes: 'hoodieTrack', extras: ['phoneEar', 'sweat'], tint: ['#c8b8a8', '#8a7a70', '#2a2420'] },
  slager: { skin: '#e8a68a', shade: '#c4806a', w: 1.06, hair: 'bald', hc: '#8a6a50', brows: 'angry', bc: '#7a5a40', eyes: 'narrow', iris: '#4a5a6a', nose: 'big', mouth: 'frown', clothes: 'butcher', extras: ['stubble', 'arms'], tint: ['#f0a87a', '#d8604a', '#6a1a14'] },
  fluister: { skin: '#dcaa8c', shade: '#b8866c', w: 0.9, hair: 'stringy', hc: '#8a8478', hat: 'beanie', hatc: '#2e3034', brows: 'raised', bc: '#5a5448', eyes: 'wide', iris: '#4a3a2a', nose: 'big', mouth: 'smirk', clothes: 'oliveCoat', extras: ['stubble', 'wrinkles', 'whisper', 'thermos'], tint: ['#d8c08a', '#a8804a', '#3a2814'] },
});
Object.assign(CLOTHES, {
  hansJacket: (o) => `<path d="${BODY}" fill="#6a6a5e" ${ST} stroke-width="4"/><path d="M98 246 l30 38 l30 -38 q-30 10 -60 0z" fill="#e8eef6" ${ST} stroke-width="3"/><path d="M98 246 l30 74 l30 -74" fill="url(#gingham${o.id})" ${ST} stroke-width="3"/><path d="M98 246 l-6 74 M158 246 l6 74" ${ST} stroke-width="3" fill="none"/><path d="M106 248 l18 62 M150 248 l-18 62" stroke="#3ab0c0" stroke-width="5" fill="none"/><rect x="118" y="304" width="20" height="16" rx="2" fill="#6abf4a" ${ST} stroke-width="2"/>`,
  connyTop: (o) => `<path d="${BODY}" fill="url(#flor${o.id})" ${ST} stroke-width="4"/><path d="M10 320 q6 -48 52 -64 l10 64z M246 320 q-6 -48 -52 -64 l-10 64z" fill="url(#polka${o.id})" ${ST} stroke-width="3"/><path d="M96 246 q32 40 64 0" fill="none" stroke="#c8ccd2" stroke-width="5"/><path d="M96 246 q32 40 64 0" fill="none" stroke="#8a8e94" stroke-width="2" stroke-dasharray="3 3"/>`,
});
// ---- the rivals (2026-11-28): Hans & Conny Blokaas of Blokaas Specijeren, Almere (js/blokaas.js). Lilac backdrop, the rival colour on the map
const RIVAL = ['#e6d8f4', '#a888d0', '#3a2458'];
Object.assign(CAST, {
  hans: { skin: '#eaa88a', shade: '#c8866c', w: 1.04, hair: 'short', hc: '#8c7a5e', brows: 'raised', bc: '#7a6a50', eyes: 'narrow', iris: '#5a7a8a', mouth: 'smirk', clothes: 'hansJacket', extras: ['wrinkles', 'binoculars'], tint: RIVAL }, // Tristan's photo 2026-11-28: swept brown-grey hair, broad face, checked shirt, grey jacket, lanyard
  conny: { skin: '#f2bca0', shade: '#d49a80', w: 0.98, hair: 'bob', hc: '#8a5a30', brows: 'happy', bc: '#6a4422', eyes: 'normal', iris: '#5a7a6a', mouth: 'grin', clothes: 'connyTop', extras: ['tin'], tint: RIVAL }, // Tristan's photo: wavy brown hair with a side fringe, big smile, pink floral top, silver chain
});

function cast(key, m, blink) {
  const c = CAST[key], H = HAIR[c.hair] || {}, id = key[0] + key.length;
  const shades = c.glasses === 'shades';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="256" height="320">${bg(id, c.tint)}
  ${c.hoodBack ? scaleG(c.w, HOODBACK(c.hoodBack)) : ''}${H.back ? scaleG(c.w, H.back(c.hc)) : ''}
  ${(CLOTHES[c.clothes] || CLOTHES.collar)({ id, shade: c.shade })}
  ${NECK(c.shade)}
  ${headShape(c.w, c.skin, c.shade)}
  ${c.extras.includes('stubble') ? EXTRA.stubble : ''}${c.extras.includes('wrinkles') ? EXTRA.wrinkles : ''}
  ${H.front ? scaleG(c.w, H.front(c.hc)) : ''}
  ${c.hat ? scaleG(c.w, HATS[c.hat](c.hatc)) : ''}
  ${shades ? '' : BROWS[c.brows](c.bc)}
  ${shades ? '' : eyes(c.eyes, blink, c.iris)}
  ${c.glasses ? GLASSES[c.glasses] : ''}
  ${shades ? BROWS[c.brows](c.bc).replace(/M72 128|M70 118|M72 126/, (s) => s) : ''}
  <ellipse cx="80" cy="190" rx="18" ry="11" fill="#ea7a6a" opacity=".38"/><ellipse cx="178" cy="192" rx="18" ry="11" fill="#ea7a6a" opacity=".38"/>
  ${c.nose === 'big' ? BIGNOSE(c.skin) : NOSE(c.skin)}
  <path d="M84 200 q-2 12 4 20 M172 200 q2 12 -4 20" stroke="${c.shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${c.beard ? BEARD[c.beard](c.brd) : ''}${mouth(c.mouth, m)}
  ${c.stache ? STACHE[c.stache](c.sc) : ''}
  ${c.extras.includes('hoops') ? EXTRA.hoops : ''}${c.extras.includes('beads') ? EXTRA.beads : ''}
  ${c.extras.filter((e) => !['stubble', 'wrinkles', 'hoops', 'beads'].includes(e)).map((e) => EXTRA[e]).join('')}
</svg>`;
}
module.exports = { cast, CAST };
