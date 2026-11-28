// Persiflage portraits of Hans and Conny Blokaas (Tristan 2026-11-28: "less animated, more realistic", then "a persiflage
// of them instead"): painted caricatures, not their real faces. Soft gradients and thin ink instead of the flat cartoon
// cast, and every trait pushed: Hans's swept-back quiff, long jaw, squint, tight frugal mouth, the lanyard with an
// oversized badge, binoculars and a calculator in his pocket; Conny's huge cloud of brown curls, a big smile with one
// crocodile tear and a tissue at the ready, the silver chain and the pink floral top.
// node tools/portraits/render-blokaas.cjs renders them to browser-game/assets/face_hans.jpg / face_conny.jpg (256 x 320).
const INK = '#3a2418';
const ST = `stroke="${INK}" stroke-linejoin="round" stroke-linecap="round"`;
const defs = `<defs>
  <radialGradient id="bg" cx="50%" cy="38%" r="80%"><stop offset="0" stop-color="#efe4f6"/><stop offset=".55" stop-color="#b79ad8"/><stop offset="1" stop-color="#4a2e6a"/></radialGradient>
  <radialGradient id="skinH" cx="44%" cy="40%" r="70%"><stop offset="0" stop-color="#f2c0a0"/><stop offset=".6" stop-color="#e09c7c"/><stop offset="1" stop-color="#b8705a"/></radialGradient>
  <radialGradient id="skinC" cx="46%" cy="42%" r="70%"><stop offset="0" stop-color="#fbd2b8"/><stop offset=".6" stop-color="#eeac90"/><stop offset="1" stop-color="#c88068"/></radialGradient>
  <radialGradient id="cheek" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#e8505a" stop-opacity=".55"/><stop offset="1" stop-color="#e8505a" stop-opacity="0"/></radialGradient>
  <linearGradient id="hairH" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a89478"/><stop offset=".5" stop-color="#7e6a50"/><stop offset="1" stop-color="#5a4a36"/></linearGradient>
  <radialGradient id="curl" cx="38%" cy="35%" r="70%"><stop offset="0" stop-color="#b07a44"/><stop offset=".6" stop-color="#8a5a2e"/><stop offset="1" stop-color="#5a3618"/></radialGradient>
  <linearGradient id="jacket" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a7a70"/><stop offset="1" stop-color="#4a4a44"/></linearGradient>
  <pattern id="ging" width="9" height="9" patternUnits="userSpaceOnUse"><rect width="9" height="9" fill="#eef2f8"/><rect width="4.5" height="9" fill="#34508a" opacity=".55"/><rect width="9" height="4.5" fill="#34508a" opacity=".55"/></pattern>
  <pattern id="flor" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#f7e4e6"/><path d="M5 7 q5 -5 10 0 q-5 5 -10 0z M15 18 q5 -5 10 0 q-5 5 -10 0z" fill="#e6a2b2"/><path d="M18 5 l3 3 M4 18 l3 3" stroke="#9a94b8" stroke-width="1.6"/></pattern>
  <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#f4ece8"/><circle cx="6" cy="6" r="3.3" fill="#2a1414"/></pattern>
  <radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#1a0a24" stop-opacity=".45"/></radialGradient>
</defs>`;
const frame = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 320" width="256" height="320">${defs}<rect width="256" height="320" fill="url(#bg)"/>${inner}<rect width="256" height="320" fill="url(#vig)"/></svg>`;

function hans(blink) {
  const eye = (x) => blink ? `<path d="M${x - 15} 168 q15 5 30 0" ${ST} stroke-width="3" fill="none"/>`
    : `<path d="M${x - 16} 168 q16 -9 32 0 q-16 5 -32 0z" fill="#fff" ${ST} stroke-width="2.4"/><circle cx="${x + 1}" cy="166.5" r="3.6" fill="#4a6a7a"/><circle cx="${x + 2}" cy="165.5" r="1.1" fill="#fff"/><path d="M${x - 17} 173 q17 7 34 0" stroke="#a8665a" stroke-width="2" fill="none" opacity=".7"/>`;
  return frame(`
  <!-- jacket, checked shirt, lanyard with an oversized badge -->
  <path d="M0 320 q8 -66 72 -84 q30 -8 56 -8 q26 0 56 8 q64 18 72 84z" fill="url(#jacket)" ${ST} stroke-width="3"/>
  <path d="M96 232 l32 62 l32 -62 q-32 12 -64 0z" fill="url(#ging)" ${ST} stroke-width="2.5"/>
  <path d="M96 232 l-12 88 M160 232 l12 88" ${ST} stroke-width="2.5" fill="none"/>
  <path d="M100 236 l20 70 M156 236 l-20 70" stroke="#2ab0c4" stroke-width="6" fill="none"/>
  <rect x="104" y="282" width="48" height="26" rx="3" fill="#f4f4ee" ${ST} stroke-width="2"/><text x="128" y="293" text-anchor="middle" font-family="Arial" font-weight="900" font-size="8" fill="#2a2a5a">H. BLOKAAS</text><text x="128" y="302" text-anchor="middle" font-family="Arial" font-size="6" fill="#2a2a5a">DIRECTIE</text>
  <rect x="172" y="262" width="22" height="30" rx="3" fill="#3a3c40" ${ST} stroke-width="2"/><rect x="175" y="265" width="16" height="7" fill="#9ac0a0"/><g fill="#d8d8d0">${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${176 + c * 5}" y="${275 + r * 5}" width="3.5" height="3.5"/>`).join('')).join('')}</g>
  <!-- binoculars on their strap -->
  <path d="M84 240 q-14 24 -10 46 M172 240 q8 18 -10 40" stroke="#2a2420" stroke-width="2.5" fill="none"/>
  <g ${ST} stroke-width="2.2"><rect x="48" y="270" width="22" height="34" rx="5" fill="#2e322e"/><rect x="74" y="270" width="22" height="34" rx="5" fill="#2e322e"/><rect x="68" y="278" width="8" height="12" fill="#444844"/></g><circle cx="59" cy="300" r="6" fill="#6a8aa0"/><circle cx="85" cy="300" r="6" fill="#6a8aa0"/>
  <!-- neck, long head, big jaw -->
  <path d="M106 210 q0 24 -6 30 q28 14 56 0 q-6 -6 -6 -30z" fill="#c88a6c" ${ST} stroke-width="2.5"/>
  <ellipse cx="62" cy="168" rx="11" ry="19" fill="url(#skinH)" ${ST} stroke-width="2.5"/><ellipse cx="194" cy="168" rx="11" ry="19" fill="url(#skinH)" ${ST} stroke-width="2.5"/>
  <path d="M128 84 q64 0 66 74 q2 50 -14 74 q-18 24 -52 24 q-34 0 -52 -24 q-16 -24 -14 -74 q2 -74 66 -74z" fill="url(#skinH)" ${ST} stroke-width="3"/>
  <path d="M88 132 q40 -10 80 0 M92 142 q36 -8 72 0" stroke="#b8705a" stroke-width="1.6" fill="none" opacity=".6"/>
  <!-- the quiff: swept back, high, grey at the temples -->
  <path d="M64 160 q-10 -50 6 -86 q16 -36 58 -46 q46 -8 70 22 q20 26 0 48 q16 20 6 62 q-4 -30 -16 -44 q-24 -14 -60 -12 q-34 2 -48 18 q-10 12 -16 38z" fill="url(#hairH)" ${ST} stroke-width="3"/>
  <path d="M80 112 q14 -50 70 -66 M94 104 q20 -40 84 -42 M112 98 q30 -24 80 -10 M176 36 q22 10 22 34" stroke="#4a3a28" stroke-width="2" opacity=".55" fill="none"/>
  <path d="M110 50 q30 -14 60 -6" stroke="#fff" stroke-width="3.5" opacity=".35" fill="none"/>
  <path d="M68 150 q-4 -22 4 -40 M190 152 q6 -24 -2 -44" stroke="#d6d0c4" stroke-width="8" opacity=".85" fill="none"/>
  <!-- straight bushy brows, the squint, a big nose, a tight frugal mouth -->
  <path d="M94 152 q16 -4 32 0 M136 152 q16 -4 32 0" stroke="#6a5a44" stroke-width="7" fill="none"/>
  ${eye(110)}${eye(152)}
  <path d="M128 168 q-4 18 -12 28 q-6 10 6 12 q6 4 12 0 q14 0 6 -12 q-8 -10 -12 -28" fill="#e2a084" ${ST} stroke-width="2.4"/><ellipse cx="120" cy="204" rx="4" ry="2.5" fill="#8a4a3a" opacity=".6"/><ellipse cx="138" cy="204" rx="4" ry="2.5" fill="#8a4a3a" opacity=".6"/>
  <ellipse cx="92" cy="200" rx="18" ry="11" fill="url(#cheek)"/><ellipse cx="166" cy="200" rx="18" ry="11" fill="url(#cheek)"/>
  <path d="M108 226 q20 4 42 -2" ${ST} stroke-width="3.2" fill="none"/><path d="M106 224 q-2 3 0 6 M152 222 q2 3 0 6" ${ST} stroke-width="2" fill="none"/>
  <path d="M110 244 q18 8 38 0" stroke="#b8705a" stroke-width="2" fill="none" opacity=".6"/>
  `);
}

function conny(blink) {
  const eye = (x) => blink ? `<path d="M${x - 14} 162 q14 6 28 0" ${ST} stroke-width="3" fill="none"/>`
    : `<path d="M${x - 15} 163 q15 -13 30 0 q-15 7 -30 0z" fill="#fff" ${ST} stroke-width="2.4"/><circle cx="${x}" cy="160" r="5" fill="#6a8a78"/><circle cx="${x}" cy="160" r="2.2" fill="#1a1a1a"/><circle cx="${x + 2}" cy="158" r="1.5" fill="#fff"/><path d="M${x - 15} 163 q15 -15 30 0" ${ST} stroke-width="3.4" fill="none"/>`;
  const curls = []; // a huge cloud of brown curls
  for (const [x, y, r] of [[60, 90, 34], [96, 64, 38], [138, 58, 40], [180, 70, 38], [208, 100, 32], [40, 132, 32], [222, 140, 32], [30, 180, 32], [230, 186, 32], [34, 228, 30], [226, 230, 30], [56, 262, 28], [204, 264, 28]]) curls.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="url(#curl)" ${ST} stroke-width="2.6"/><path d="M${x - r * 0.5} ${y + r * 0.1} q${r * 0.5} ${-r * 0.7} ${r} 0 M${x - r * 0.3} ${y + r * 0.45} q${r * 0.3} ${-r * 0.4} ${r * 0.6} 0" stroke="#4a2c12" stroke-width="2" fill="none" opacity=".55"/>`);
  return frame(`
  ${curls.join('')}
  <!-- pink floral sleeveless top with polka-dot panels, the silver chain -->
  <path d="M0 320 q6 -60 64 -80 q30 -10 64 -10 q34 0 64 10 q58 20 64 80z" fill="url(#flor)" ${ST} stroke-width="3"/>
  <path d="M8 320 q6 -42 46 -60 l12 60z M248 320 q-6 -42 -46 -60 l-12 60z" fill="url(#dots)" ${ST} stroke-width="2.4"/>
  <path d="M104 214 q0 18 -4 24 q28 14 56 0 q-4 -6 -4 -24z" fill="#e2a088" ${ST} stroke-width="2.4"/>
  <path d="M92 240 q36 50 72 0" fill="none" stroke="#c8ccd4" stroke-width="7"/><path d="M92 240 q36 50 72 0" fill="none" stroke="#7a7e88" stroke-width="2.6" stroke-dasharray="4 4"/>
  <!-- round face, rosy cheeks -->
  <path d="M128 76 q72 0 74 82 q2 52 -22 74 q-22 18 -52 18 q-30 0 -52 -18 q-24 -22 -22 -74 q2 -82 74 -82z" fill="url(#skinC)" ${ST} stroke-width="3"/>
  <ellipse cx="86" cy="196" rx="24" ry="15" fill="url(#cheek)"/><ellipse cx="170" cy="196" rx="24" ry="15" fill="url(#cheek)"/>
  <!-- the side fringe -->
  <path d="M58 150 q-6 -64 52 -84 q60 -16 96 22 q14 18 6 50 q-20 -30 -44 -38 q-34 30 -78 34 q-20 2 -32 16z" fill="url(#curl)" ${ST} stroke-width="2.8"/>
  <path d="M190 92 q-30 36 -96 46 M170 76 q-30 26 -88 34" stroke="#4a2c12" stroke-width="2.2" fill="none" opacity=".55"/>
  <!-- brows up in the middle (poor me) over a big smile: the victim card, with one crocodile tear -->
  <path d="M84 142 q14 -10 32 -4 M140 138 q18 -6 32 4" stroke="#5a3a1e" stroke-width="5" fill="none"/>
  ${eye(100)}${eye(156)}
  ${blink ? '' : '<path d="M164 172 q-5 9 0 14 q5 -5 0 -14z" fill="#bfe6ff" stroke="#5a8ab0" stroke-width="1.6"/>'}
  <path d="M128 166 q-3 14 -10 22 q-4 8 6 10 q4 3 8 0 q10 0 6 -10 q-7 -8 -10 -22" fill="#eaa48a" ${ST} stroke-width="2.2"/>
  <path d="M94 210 q34 30 70 0 q-34 10 -70 0z" fill="#fbf6ee" ${ST} stroke-width="2.6"/><path d="M94 210 q34 34 70 0" ${ST} stroke-width="3" fill="none"/><path d="M110 214 v6 M122 216 v7 M134 216 v7 M146 214 v6" stroke="#d8cfc0" stroke-width="1.4"/>
  <!-- a tissue at the ready -->
  <path d="M196 262 q10 -16 28 -10 q10 4 6 18 q-6 14 -22 12 q-14 -4 -12 -20z" fill="#f8f8fc" ${ST} stroke-width="2.2"/><path d="M204 262 q8 -6 16 0" stroke="#b8b8c8" stroke-width="1.6" fill="none"/>
  <path d="M188 320 q-6 -30 8 -52 q10 -6 18 2 q-8 20 -4 50z" fill="url(#skinC)" ${ST} stroke-width="2.4"/>
  `);
}
module.exports = { hans, conny };
