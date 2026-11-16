// Hand-drawn vector portraits of Freddy Sr. and Eddy Jr. in the Spice Master look (saffron -> paprika halftone backdrop,
// warm brown ink, flat cel shading). face(who, mouth 0|1|2, blink 0|1) -> SVG string, 256 x 320.
const INK = '#2a160e';
const bg = (id) => `
<defs>
  <radialGradient id="bg${id}" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#f6c25a"/><stop offset=".45" stop-color="#e8903a"/><stop offset="1" stop-color="#7a2c16"/></radialGradient>
  <pattern id="dots${id}" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><circle cx="4.5" cy="4.5" r="1.7" fill="#5a1e0c" opacity=".22"/></pattern>
  <radialGradient id="dmask${id}" cx="50%" cy="40%" r="70%"><stop offset=".35" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
  <mask id="m${id}"><rect width="256" height="320" fill="url(#dmask${id})"/></mask>
</defs>
<rect width="256" height="320" fill="url(#bg${id})"/>
<rect width="256" height="320" fill="url(#dots${id})" mask="url(#m${id})"/>
<g opacity=".18" fill="#5a1e0c"><path d="M18 250 q20 -8 40 0 l-6 40 h-28z"/><rect x="32" y="222" width="8" height="34" rx="4" transform="rotate(-25 36 239)"/>
<path d="M206 236 h30 v54 h-30z" rx="4"/><rect x="204" y="228" width="34" height="10" rx="3"/></g>`;

function freddy(mouth, blink) {
  const skin = '#e6a487', shade = '#c47a62', hair = '#efede6', hairS = '#c9c6bc';
  // mouth shapes: 0 = big closed grin, 1 = half open laugh, 2 = wide open laugh (the photo)
  const M = [
    `<path d="M92 214 q36 22 72 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/><path d="M88 210 q4 6 8 6 M168 210 q-4 6 -8 6" stroke="${INK}" stroke-width="3" fill="none"/>`,
    `<path d="M90 208 q38 6 76 0 q-6 30 -38 32 q-32 -2 -38 -32z" fill="#4a1410" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M96 209 q32 5 64 0 l-2 7 q-30 4 -60 0z" fill="#fbf6ea"/><path d="M110 232 q18 -10 36 0 q-18 8 -36 0z" fill="#d8605a"/>`,
    `<path d="M86 204 q42 8 84 0 q-4 44 -42 46 q-38 -2 -42 -46z" fill="#3e100c" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M92 205 q36 7 72 0 l-2 9 q-34 5 -68 0z" fill="#fbf6ea"/><path d="M104 238 q24 -14 48 0 q-24 12 -48 0z" fill="#d8605a"/>`,
  ][mouth];
  const eyes = blink
    ? `<path d="M70 150 q16 8 32 0 M154 150 q16 8 32 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M70 152 q16 -14 32 0 q-16 6 -32 0z M154 152 q16 -14 32 0 q-16 6 -32 0z" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="87" cy="149" r="4.5" fill="#3a2a1e"/><circle cx="171" cy="149" r="4.5" fill="#3a2a1e"/><circle cx="88.5" cy="147.5" r="1.4" fill="#fff"/><circle cx="172.5" cy="147.5" r="1.4" fill="#fff"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="256" height="320">${bg('f')}
  <!-- shoulders: navy shirt, maroon and cream scarf -->
  <path d="M14 320 q6 -58 62 -70 q52 18 104 0 q56 12 62 70z" fill="#232a40" stroke="${INK}" stroke-width="4"/>
  <path d="M40 300 q10 -30 40 -40 M216 300 q-10 -30 -40 -40" stroke="#151a2a" stroke-width="5" fill="none"/>
  <path d="M100 252 q28 30 56 0 l8 16 q-36 34 -72 0z" fill="#9a2222" stroke="${INK}" stroke-width="3.5"/><path d="M104 256 q24 24 48 0" stroke="#ece6d4" stroke-width="3" fill="none"/>
  <!-- neck + ears -->
  <path d="M100 230 v26 q28 14 56 0 v-26z" fill="${shade}" stroke="${INK}" stroke-width="3.5"/>
  <ellipse cx="50" cy="160" rx="14" ry="22" fill="${skin}" stroke="${INK}" stroke-width="3.5"/><ellipse cx="206" cy="160" rx="14" ry="22" fill="${skin}" stroke="${INK}" stroke-width="3.5"/>
  <path d="M46 152 q6 8 0 18 M210 152 q-6 8 0 18" stroke="${shade}" stroke-width="3" fill="none"/>
  <!-- head: broad, round, a big laugher -->
  <path d="M128 50 q78 0 80 92 q2 70 -36 98 q-22 16 -44 16 q-22 0 -44 -16 q-38 -28 -36 -98 q2 -92 80 -92z" fill="${skin}" stroke="${INK}" stroke-width="4.5"/>
  <path d="M190 120 q12 60 -18 112 q-20 16 -44 20 q40 -30 46 -84 q2 -30 16 -48z" fill="${shade}" opacity=".55"/>
  <!-- white hair: thin slick over the top, thick tufts at the sides -->
  <path d="M58 124 q-2 -46 34 -62 q-20 24 -22 58z M198 124 q2 -46 -34 -62 q20 24 22 58z" fill="${hair}" stroke="${INK}" stroke-width="3"/>
  <path d="M96 66 q32 -12 64 0 M102 76 q26 -8 52 0" stroke="${hairS}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M92 104 q36 -10 72 0 M98 116 q30 -8 60 0" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="104" cy="78" rx="16" ry="7" fill="#fff" opacity=".28" transform="rotate(-18 104 78)"/>
  <path d="M48 150 q-8 -34 14 -48 q2 22 10 30 q-14 4 -24 18z M208 150 q8 -34 -14 -48 q-2 22 -10 30 q14 4 24 18z" fill="${hair}" stroke="${INK}" stroke-width="3"/>
  <!-- brows: white and bushy, raised in a laugh -->
  <path d="M66 132 q20 -16 40 -4 q-20 -2 -40 4z M150 128 q20 -12 40 4 q-20 -8 -40 -4z" fill="${hair}" stroke="${INK}" stroke-width="3"/>
  ${eyes}
  <!-- laugh lines, cheeks, nose -->
  <path d="M64 160 q-4 10 4 18 M192 160 q4 10 -4 18 M78 134 q-2 -4 2 -8" stroke="${shade}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="80" cy="186" rx="20" ry="13" fill="#e8706a" opacity=".45"/><ellipse cx="176" cy="186" rx="20" ry="13" fill="#e8706a" opacity=".45"/>
  <path d="M120 164 q-4 12 -14 18 q-8 14 8 16 q14 6 28 0 q16 -2 8 -16 q-10 -6 -14 -18" fill="${skin}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M112 192 q6 4 10 0 M134 192 q6 4 10 0" stroke="${INK}" stroke-width="2.5" fill="none"/>
  <path d="M84 196 q-2 22 8 38 M172 196 q2 22 -8 38" stroke="${shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- the white moustache -->
  <path d="M90 204 q14 -12 38 -6 q24 -6 38 6 q-10 6 -20 2 q-10 -4 -18 0 q-8 -4 -18 0 q-10 4 -20 -2z" fill="${hair}" stroke="${INK}" stroke-width="3"/>
  ${M.replace(/translate/g, '')}
</svg>`;
}

function eddy(mouth, blink) {
  const skin = '#ecb592', shade = '#cc8c6c', hair = '#24180f';
  const M = [
    `<path d="M88 214 q40 24 80 0 q-40 10 -80 0z" fill="#fbf6ea" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M88 214 q40 30 80 0" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    `<path d="M86 208 q42 8 84 0 q-8 34 -42 36 q-34 -2 -42 -36z" fill="#4a1410" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M92 209 q36 7 72 0 l-3 10 q-33 5 -66 0z" fill="#fbf6ea"/><path d="M110 236 q18 -8 36 0 q-18 7 -36 0z" fill="#d8605a"/>`,
    `<path d="M84 204 q44 10 88 0 q-6 46 -44 48 q-38 -2 -44 -48z" fill="#3e100c" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><path d="M90 205 q38 8 76 0 l-3 11 q-35 5 -70 0z" fill="#fbf6ea"/><path d="M104 240 q24 -14 48 0 q-24 12 -48 0z" fill="#d8605a"/>`,
  ][mouth];
  const eyes = blink
    ? `<path d="M76 150 q14 7 28 0 M152 152 q14 7 28 0" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<path d="M76 152 q14 -14 28 0 q-14 7 -28 0z M152 154 q14 -14 28 0 q-14 7 -28 0z" fill="#fff" stroke="${INK}" stroke-width="3"/><circle cx="91" cy="148" r="5" fill="#4a3a28"/><circle cx="167" cy="150" r="5" fill="#4a3a28"/><circle cx="92.5" cy="146.5" r="1.5" fill="#fff"/><circle cx="168.5" cy="148.5" r="1.5" fill="#fff"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="256" height="320">${bg('e')}
  <!-- shoulders: light blue shirt, open collar, chest hair and the gold chain -->
  <path d="M8 320 q4 -62 70 -74 q50 16 100 0 q66 12 70 74z" fill="#86acdf" stroke="${INK}" stroke-width="4"/>
  <path d="M100 246 l28 44 l28 -44 q-28 10 -56 0z" fill="${skin}" stroke="${INK}" stroke-width="3.5"/>
  <path d="M116 270 q4 -4 6 2 M130 278 q4 -4 6 2 M124 262 q4 -4 6 2" stroke="#3a2418" stroke-width="2" fill="none"/>
  <path d="M104 250 q24 34 48 0" stroke="#e8b84a" stroke-width="3.5" fill="none"/>
  <path d="M100 246 l-20 22 l20 10 l6 -24z M156 246 l20 22 l-20 10 l-6 -24z" fill="#a6c4ec" stroke="${INK}" stroke-width="3"/>
  <path d="M40 300 q8 -28 34 -40 M216 300 q-8 -28 -34 -40" stroke="#5e86bb" stroke-width="4" fill="none"/>
  <!-- neck + ears -->
  <path d="M102 226 v24 q26 12 52 0 v-24z" fill="${shade}" stroke="${INK}" stroke-width="3.5"/>
  <ellipse cx="46" cy="166" rx="13" ry="21" fill="${skin}" stroke="${INK}" stroke-width="3.5"/><ellipse cx="210" cy="166" rx="13" ry="21" fill="${skin}" stroke="${INK}" stroke-width="3.5"/>
  <!-- head: big round chubby face -->
  <path d="M128 58 q82 0 84 92 q2 66 -38 92 q-22 14 -46 14 q-24 0 -46 -14 q-40 -26 -38 -92 q2 -92 84 -92z" fill="${skin}" stroke="${INK}" stroke-width="4.5"/>
  <path d="M194 126 q10 60 -20 106 q-22 16 -46 20 q42 -28 48 -82 q2 -28 18 -44z" fill="${shade}" opacity=".5"/>
  <!-- stubble -->
  <path d="M60 190 q10 50 68 64 q58 -14 68 -64 q-6 40 -68 52 q-62 -12 -68 -52z" fill="#5a3a2a" opacity=".22"/>
  <!-- dark hair: short with a curly top -->
  <path d="M46 132 q-6 -78 82 -82 q88 4 82 82 q-8 -26 -20 -36 q-4 10 -14 10 q-2 -14 -14 -18 q-6 12 -18 8 q-4 -10 -16 -10 q-10 10 -22 4 q-6 -8 -16 -4 q-6 12 -18 10 q-8 6 -12 20 q-10 6 -14 16z" fill="${hair}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M86 66 q8 -6 16 0 M120 58 q8 -6 16 0 M154 64 q8 -6 16 0 M70 84 q8 -6 14 2" stroke="#4a3424" stroke-width="2.5" fill="none"/>
  <!-- brows -->
  <path d="M72 126 q18 -10 36 -2 M148 128 q18 -8 36 4" stroke="${hair}" stroke-width="7" fill="none" stroke-linecap="round"/>
  ${eyes}
  <!-- the glasses: thick black rectangles, slightly crooked like the photo -->
  <g fill="none" stroke="#141010" stroke-width="7" stroke-linejoin="round"><rect x="64" y="128" width="54" height="38" rx="9" transform="rotate(4 91 147)"/><rect x="140" y="132" width="54" height="38" rx="9" transform="rotate(6 167 151)"/><path d="M118 148 q11 -6 22 0"/><path d="M64 140 l-16 -4 M194 146 l14 -2"/></g>
  <path d="M72 136 l10 -4 M148 140 l10 -4" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>
  <!-- cheeks, nose -->
  <ellipse cx="80" cy="190" rx="18" ry="11" fill="#ea7a6a" opacity=".38"/><ellipse cx="178" cy="192" rx="18" ry="11" fill="#ea7a6a" opacity=".38"/>
  <path d="M124 170 q-2 10 -10 16 q-4 10 8 10 q8 4 16 0 q12 0 6 -10 q-8 -6 -10 -16" fill="${skin}" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M84 200 q-2 12 4 20 M172 200 q2 12 -4 20" stroke="${shade}" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${M}
</svg>`;
}
module.exports = { freddy, eddy };
