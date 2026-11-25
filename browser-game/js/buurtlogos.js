// Logos for every business on Eddy's block (js/buurt.js): one round badge each, drawn as SVG so the same art works on the
// buurtkaart (inline), in Krant voor het Kaasvolk, on the posters and lit ad panels (drawn into a canvas) and on the
// uithangborden over the shop doors. A badge is a coloured disc, a ring, the name on an arc and one simple pictogram.
// logoSVG(id, px) returns markup; logoImages() resolves to { id: HTMLImageElement } for canvas drawing.

const P = { // pictograms, drawn in a 100×100 box around (50, 50); f = the badge's foreground colour, b = its background
  eddy: (f) => `<path d="M38 60 C34 44 44 34 56 36 C66 38 70 50 64 62 C58 73 44 76 38 60 Z" fill="#d8201a" stroke="${f}" stroke-width="2"/><path d="M55 37 C56 30 61 27 66 28" fill="none" stroke="#3f9b4a" stroke-width="4" stroke-linecap="round"/><path d="M44 52 C46 46 50 43 55 43" fill="none" stroke="#ff8a7a" stroke-width="2.5" stroke-linecap="round"/>`,
  schmatzel: (f) => `<path d="M50 26 L50 76" stroke="${f}" stroke-width="3" stroke-linecap="round"/><path d="M41 34 L59 34 L62 44 L38 44 Z M38 46 L62 46 L64 56 L36 56 Z M37 58 L63 58 L60 68 L40 68 Z" fill="#c9773a" stroke="${f}" stroke-width="1.6" stroke-linejoin="round"/><path d="M34 72 L66 72" stroke="${f}" stroke-width="4" stroke-linecap="round"/>`,
  hotel: (f, b) => `<path d="M32 70 L32 48 L41 40 L50 48 L50 70 Z" fill="${f}"/><path d="M50 70 L50 42 L59 33 L68 42 L68 70 Z" fill="${f}" opacity=".8"/><path d="M38 44 L38 34 L46 27 L54 34 L54 40" fill="none" stroke="${f}" stroke-width="2.5"/><rect x="37" y="52" width="6" height="7" fill="${b}"/><rect x="56" y="48" width="6" height="7" fill="${b}"/><rect x="56" y="59" width="6" height="11" fill="${b}"/>`,
  club: (f) => `<path d="M34 34 L66 34 L50 54 Z" fill="none" stroke="${f}" stroke-width="3.5" stroke-linejoin="round"/><path d="M50 54 L50 70 M40 72 L60 72" stroke="${f}" stroke-width="3.5" stroke-linecap="round"/><circle cx="57" cy="38" r="4" fill="#ffe14a"/><path d="M68 26 l1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 4 -1.6 Z" fill="${f}"/>`,
  spasibo: (f) => `<path d="M36 34 L64 34 M50 34 L50 44 M38 34 L38 50 M62 34 L62 50" stroke="${f}" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="50" cy="52" r="8" fill="${f}"/><circle cx="38" cy="60" r="8" fill="${f}"/><circle cx="62" cy="60" r="8" fill="${f}"/>`,
  dealer: (f, b) => `<path d="M28 60 L31 50 C33 44 37 42 43 42 L57 42 C63 42 66 45 69 50 L72 60 L72 66 L28 66 Z" fill="${f}"/><path d="M36 50 L40 45 L49 45 L49 51 Z M52 45 L59 45 L64 51 L52 51 Z" fill="${b}"/><circle cx="38" cy="67" r="6" fill="${b}" stroke="${f}" stroke-width="2.5"/><circle cx="62" cy="67" r="6" fill="${b}" stroke="${f}" stroke-width="2.5"/>`,
  bitterbal: (f) => `<circle cx="50" cy="58" r="15" fill="#b8651e" stroke="${f}" stroke-width="2"/><circle cx="44" cy="53" r="2" fill="#e8a34a"/><circle cx="55" cy="62" r="2" fill="#e8a34a"/><circle cx="52" cy="50" r="1.5" fill="#e8a34a"/><path d="M50 44 L50 24" stroke="${f}" stroke-width="2.5" stroke-linecap="round"/><path d="M50 25 L64 29 L50 34 Z" fill="#e8202a"/>`,
  habibi: (f) => `<path d="M50 72 C30 58 30 40 41 38 C46 37 49 40 50 44 C51 40 54 37 59 38 C70 40 70 58 50 72 Z" fill="#e8202a" stroke="${f}" stroke-width="2.5"/><path d="M50 60 C45 55 47 50 50 46 C51 50 55 51 54 56 C53 59 51 60 50 60 Z" fill="${f}"/>`,
  kapsalon: (f) => `<circle cx="38" cy="66" r="6" fill="none" stroke="${f}" stroke-width="3"/><circle cx="50" cy="70" r="6" fill="none" stroke="${f}" stroke-width="3"/><path d="M41 61 L62 30 M52 64 L52 28" stroke="${f}" stroke-width="3" stroke-linecap="round"/><path d="M58 52 L74 46 L74 58 Z" fill="#f6c12a" stroke="${f}" stroke-width="1.6" stroke-linejoin="round"/><circle cx="69" cy="52" r="1.6" fill="#a8740a"/>`,
  avond: (f, b) => `<path d="M58 30 C46 32 40 42 42 52 C44 63 54 69 66 66 C56 74 40 70 35 57 C30 43 40 29 58 30 Z" fill="${f}"/><rect x="44" y="44" width="30" height="14" rx="3" fill="${b}" stroke="${f}" stroke-width="2"/><text x="59" y="55" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="10" fill="${f}">OPEN</text>`,
  fiets: (f) => `<circle cx="50" cy="52" r="19" fill="none" stroke="${f}" stroke-width="4"/><circle cx="50" cy="52" r="3" fill="${f}"/><path d="M50 33 L50 71 M31 52 L69 52 M37 39 L63 65 M63 39 L37 65" stroke="${f}" stroke-width="1.4"/><rect x="57" y="29" width="14" height="9" rx="2" fill="#e8202a" stroke="${f}" stroke-width="1.5" transform="rotate(35 64 33)"/><path d="M30 73 q4 -3 8 0 t8 0" fill="none" stroke="${f}" stroke-width="2"/>`,
  bakker: (f) => `<path d="M30 58 C30 44 40 38 50 38 C60 38 70 44 70 58 C70 64 66 66 60 66 L40 66 C34 66 30 64 30 58 Z" fill="#d89a4a" stroke="${f}" stroke-width="2.5"/><path d="M40 44 L44 54 M49 42 L52 52 M58 43 L60 53" stroke="#8a4a12" stroke-width="2.5" stroke-linecap="round"/><path d="M44 30 q-3 -4 0 -8 M54 30 q-3 -4 0 -8" fill="none" stroke="${f}" stroke-width="2" stroke-linecap="round"/>`,
  was: (f, b) => `<rect x="33" y="30" width="34" height="42" rx="4" fill="${f}"/><circle cx="50" cy="55" r="11" fill="${b}" stroke="#fff" stroke-width="2"/><path d="M41 57 q4.5 -5 9 0 t9 0" fill="none" stroke="#fff" stroke-width="2"/><circle cx="39" cy="36" r="2" fill="${b}"/><rect x="46" y="34" width="16" height="4" rx="1" fill="${b}"/><circle cx="72" cy="34" r="4" fill="none" stroke="${f}" stroke-width="1.6"/><circle cx="76" cy="44" r="2.5" fill="none" stroke="${f}" stroke-width="1.4"/>`,
  bloem: (f) => `<path d="M50 74 L50 52" stroke="#2f8a3a" stroke-width="3.5" stroke-linecap="round"/><path d="M50 68 C42 66 38 60 38 56 C44 56 48 60 50 68 Z M50 64 C58 62 62 57 62 53 C56 53 52 57 50 64 Z" fill="#2f8a3a"/><path d="M40 34 C40 48 44 54 50 54 C56 54 60 48 60 34 C56 37 54 39 50 30 C46 39 44 37 40 34 Z" fill="${f}" stroke="${f}" stroke-width="1.5" stroke-linejoin="round"/>`,
  kaas: (f) => `<path d="M28 60 L64 38 L72 60 Z" fill="${f}" stroke="${f}" stroke-width="2" stroke-linejoin="round"/><path d="M28 60 L72 60 L72 70 L28 70 Z" fill="${f}" opacity=".8"/><circle cx="56" cy="52" r="4" fill="#f6c12a"/><circle cx="44" cy="57" r="2.6" fill="#f6c12a"/><circle cx="64" cy="56" r="2.2" fill="#f6c12a"/><circle cx="38" cy="65" r="2.4" fill="#f6c12a"/><circle cx="58" cy="65" r="2" fill="#f6c12a"/>`,
  bel: (f, b) => `<rect x="40" y="28" width="20" height="44" rx="4" fill="${f}"/><rect x="43" y="33" width="14" height="14" rx="1.5" fill="${b}"/><g fill="${b}"><circle cx="45" cy="53" r="1.7"/><circle cx="50" cy="53" r="1.7"/><circle cx="55" cy="53" r="1.7"/><circle cx="45" cy="59" r="1.7"/><circle cx="50" cy="59" r="1.7"/><circle cx="55" cy="59" r="1.7"/><circle cx="45" cy="65" r="1.7"/><circle cx="50" cy="65" r="1.7"/><circle cx="55" cy="65" r="1.7"/></g><path d="M66 36 q6 6 0 12 M71 31 q10 11 0 22" fill="none" stroke="${f}" stroke-width="2.4" stroke-linecap="round"/>`,
  reis: (f, b) => `<circle cx="62" cy="38" r="9" fill="#ffe14a"/><path d="M62 24 L62 27 M76 38 L73 38 M72 28 L70 30 M52 28 L54 30" stroke="#ffe14a" stroke-width="2.4" stroke-linecap="round"/><rect x="32" y="46" width="34" height="24" rx="4" fill="${f}"/><path d="M43 46 L43 41 L55 41 L55 46" fill="none" stroke="${f}" stroke-width="3"/><path d="M32 56 L66 56" stroke="${b}" stroke-width="2"/><rect x="46" y="53" width="6" height="6" rx="1" fill="${b}"/>`,
  makelaar: (f, b) => `<path d="M36 72 L36 46 L41 46 L41 40 L46 40 L46 34 L54 34 L54 40 L59 40 L59 46 L64 46 L64 72 Z" fill="${f}"/><rect x="46" y="60" width="8" height="12" fill="${b}"/><rect x="41" y="49" width="6" height="7" fill="${b}"/><rect x="53" y="49" width="6" height="7" fill="${b}"/><rect x="56" y="26" width="20" height="10" rx="1.5" fill="#e8202a" transform="rotate(-12 66 31)"/><text x="66" y="34" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="6" fill="#fff" transform="rotate(-12 66 31)">KOOP</text>`,
};
// badge colours and the words on the arcs: [background, foreground, top, bottom]
const B = {
  eddy: ['#6b1410', '#ffd36b', 'EDDY & ZN', 'KRUIDEN · 1987'],
  schmatzel: ['#1e120a', '#ffd36b', 'SCHMATZEL', 'SHOARMA · 1971'],
  hotel: ['#1f7a5e', '#f2e6c8', 'HOTEL', 'KAASLAND'],
  club: ['#2a0a1e', '#ff6aa8', 'CLUB', 'MONIQUE'],
  spasibo: ['#2a1038', '#e8a33d', 'SPASIBO', 'PANDJESHUIS'],
  dealer: ['#14161c', '#7fd0ff', 'TRYSHTAHN', 'AUTO'],
  bitterbal: ['#8a4a12', '#fff2c8', 'BITTERBAL', '& ZO · 1983'],
  habibi: ['#0a3a2a', '#ffe14a', 'SHOARMA', 'HABIBI'],
  kapsalon: ['#1d2a4a', '#f2e6c8', 'KNIP & KAAS', 'KAPSALON'],
  avond: ['#c81a24', '#ffffff', 'ALTIJD OPEN', 'AVONDWINKEL'],
  fiets: ['#2a6a4a', '#ffe14a', 'DE LEKKE BAND', 'RIJWIELHERSTEL'],
  bakker: ['#f2e6c8', '#8a4a12', 'BROOD & SPELEN', 'BAKKERIJ'],
  was: ['#bfe0ff', '#0a2a4a', 'SCHOON GENOEG', 'WASSERETTE'],
  bloem: ['#fff2d8', '#c8102e', 'DE TULP', 'BLOEMIST'],
  kaas: ['#f6c12a', '#3a2412', 'OUD & BELEGEN', 'KAASHANDEL'],
  bel: ['#2a1a5a', '#a9c46a', 'BEL-ME', 'BELWINKEL'],
  reis: ['#ff9a2e', '#1a2a5a', 'WEG ERMEE', 'REISBUREAU'],
  makelaar: ['#1a1a1a', '#f2c14e', 'DUUR & ZN', 'MAKELAARDIJ'],
};
export const LOGO_IDS = Object.keys(B);
let uid = 0;
// the badge as SVG markup; `attrs` goes on the <svg> (x/y/width/height when nested in the map)
export function logoSVG(id, px = 64, attrs = '') {
  const c = B[id]; if (!c) return '';
  const [bg, fg, top, bot] = c, k = `lg${++uid}`;
  const fs = (t) => Math.min(11, 150 / Math.max(8, t.length));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ${px ? `width="${px}" height="${px}"` : ''} ${attrs} class="bz-logo"><defs><path id="${k}a" d="M14 50 A36 36 0 0 1 86 50"/><path id="${k}b" d="M9 50 A41 41 0 0 0 91 50"/><radialGradient id="${k}g" cx=".35" cy=".25" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
<circle cx="50" cy="50" r="48" fill="${bg}" stroke="${fg}" stroke-width="3"/><circle cx="50" cy="50" r="27" fill="none" stroke="${fg}" stroke-width="1" opacity=".55"/>
<text font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="${fs(top)}" fill="${fg}" text-anchor="middle" letter-spacing=".6"><textPath href="#${k}a" startOffset="50%">${top.replace(/&/g, '&amp;')}</textPath></text>
<text font-family="Arial,sans-serif" font-weight="700" font-size="${Math.min(8, fs(bot))}" fill="${fg}" text-anchor="middle" letter-spacing="1"><textPath href="#${k}b" startOffset="50%">${bot.replace(/&/g, '&amp;')}</textPath></text>
${P[id](fg, bg)}<circle cx="50" cy="50" r="46.5" fill="url(#${k}g)"/></svg>`;
}
let imgs = null;
export function logoImages() { // for canvases: every badge as a loaded image
  if (imgs) return imgs;
  return (imgs = Promise.all(LOGO_IDS.map((id) => new Promise((res) => {
    const im = new Image(); im.onload = () => res([id, im]); im.onerror = () => res([id, null]);
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logoSVG(id, 256));
  }))).then((a) => Object.fromEntries(a)));
}
