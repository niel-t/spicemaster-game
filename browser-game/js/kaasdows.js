// Kaasdows XL ("eXtra Lekker"): the PC's desktop shell, with an Aero skin in index.html (glass frames, glossy aqua
// buttons, a glowing start orb, a bubbly polder wallpaper). Everything is drawn from scratch: every icon, the wallpaper, the logo and the startup
// chime below are original (inline SVG and WebAudio), nothing is taken from the real thing.
// main.js still renders each program's contents into #winbody; this module owns the frame around it: icons, the start
// menu, the window's open/minimised/maximised state, dragging, the boot screen and the chime.

// ------------------------------------------------------------------ icons (48x48, soft outlines, a white gloss on top)
const S = (inner) => `<svg class="ki" viewBox="0 0 48 48" aria-hidden="true">${inner}</svg>`;
const gloss = (d) => `<path d="${d}" fill="#fff" opacity=".35"/>`;
export const ICONS = {
  logo: S('<path d="M6 34 L40 14 L42 34 Z" fill="#f6c12a" stroke="#a8740a" stroke-width="2" stroke-linejoin="round"/><path d="M6 34 L42 34 L42 40 L6 40 Z" fill="#e7a91a" stroke="#a8740a" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="26" r="3" fill="#d9960f"/><circle cx="22" cy="30" r="2" fill="#d9960f"/><circle cx="36" cy="22" r="2" fill="#d9960f"/><ellipse cx="17" cy="37" rx="2.4" ry="1.4" fill="#c88a0c"/><path d="M10 32 L38 16" stroke="#fff6c8" stroke-width="2" opacity=".7"/>'),
  sell: S('<path d="M8 22 L22 8 L40 8 L40 26 L26 40 Z" fill="#ff9a2e" stroke="#b55d06" stroke-width="2" stroke-linejoin="round"/><circle cx="33" cy="15" r="3.4" fill="#fff" stroke="#b55d06" stroke-width="1.6"/>' + gloss('M11 22 L23 10 L37 10 L24 23 Z') + '<text x="23" y="31" font-family="Arial" font-weight="900" font-size="11" fill="#fff" text-anchor="middle" transform="rotate(-45 23 28)">W</text>'),
  hire: S('<circle cx="17" cy="15" r="7" fill="#f2c79a" stroke="#9a6a3a" stroke-width="1.6"/><path d="M5 40 C5 28 29 28 29 40 Z" fill="#3b8de0" stroke="#1d5a9e" stroke-width="1.8"/><circle cx="32" cy="18" r="6" fill="#e8b98a" stroke="#9a6a3a" stroke-width="1.6"/><path d="M22 41 C22 30 43 30 43 41 Z" fill="#4cb648" stroke="#2a7a28" stroke-width="1.8"/>' + gloss('M8 37 C9 31 16 30 20 31 C14 33 11 35 10 38 Z')),
  shop: S('<rect x="6" y="26" width="36" height="5" rx="1.5" fill="#b8c2cc" stroke="#5d6a76" stroke-width="1.6"/><path d="M10 31 L10 42 M38 31 L38 42" stroke="#5d6a76" stroke-width="3" stroke-linecap="round"/><path d="M14 26 C14 14 34 14 34 26 Z" fill="#e3e8ee" stroke="#5d6a76" stroke-width="1.8"/><path d="M30 6 L24 22" stroke="#8a5a2a" stroke-width="3" stroke-linecap="round"/><ellipse cx="24" cy="22" rx="8" ry="2.4" fill="#d8552a"/>' + gloss('M17 24 C17 18 22 16 26 16 C21 18 19 21 19 24 Z')),
  beurs: S('<rect x="5" y="7" width="38" height="32" rx="3" fill="#fff" stroke="#2f5fa8" stroke-width="2"/><rect x="5" y="7" width="38" height="7" rx="3" fill="#3a7bd5"/><path d="M10 33 L18 25 L24 29 L38 17" fill="none" stroke="#2ea836" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 17 L38 17 L38 23" fill="none" stroke="#2ea836" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 36 L38 36" stroke="#c6d4e8" stroke-width="1.4"/>'),
  meng: S('<path d="M10 20 L38 20 L35 40 C34 42 14 42 13 40 Z" fill="#c9773a" stroke="#7a3f12" stroke-width="2" stroke-linejoin="round"/><ellipse cx="24" cy="20" rx="14" ry="4" fill="#e8b94a" stroke="#7a3f12" stroke-width="2"/><path d="M18 6 C15 10 21 11 18 15 M26 4 C23 8 29 9 26 13" fill="none" stroke="#9fb1c4" stroke-width="2" stroke-linecap="round"/><path d="M30 8 L22 22" stroke="#6a4420" stroke-width="3" stroke-linecap="round"/>' + gloss('M14 24 L18 24 L17 37 L15 36 Z')),
  rapport: S('<rect x="9" y="7" width="30" height="36" rx="3" fill="#c88b4a" stroke="#7a4f1e" stroke-width="2"/><rect x="13" y="12" width="22" height="27" fill="#fff"/><rect x="17" y="4" width="14" height="7" rx="2" fill="#b8c2cc" stroke="#5d6a76" stroke-width="1.6"/><path d="M16 19 L32 19 M16 24 L32 24 M16 29 L28 29 M16 34 L25 34" stroke="#3a7bd5" stroke-width="2" stroke-linecap="round"/>'),
  jobs: S('<rect x="5" y="8" width="38" height="32" rx="3" fill="#d9a35e" stroke="#7a4f1e" stroke-width="2"/><rect x="9" y="12" width="13" height="12" fill="#fff59a" transform="rotate(-6 15 18)"/><rect x="25" y="13" width="13" height="11" fill="#a7e3ff" transform="rotate(5 31 18)"/><rect x="14" y="26" width="15" height="10" fill="#ffc2d6" transform="rotate(3 21 31)"/><circle cx="15" cy="13" r="1.8" fill="#d33"/><circle cx="31" cy="14" r="1.8" fill="#2a7"/><circle cx="21" cy="27" r="1.8" fill="#36c"/>'),
  ideas: S('<rect x="8" y="6" width="28" height="36" rx="2" fill="#3f9b4a" stroke="#1f5f28" stroke-width="2"/><path d="M12 6 L12 42" stroke="#1f5f28" stroke-width="2"/><circle cx="29" cy="20" r="9" fill="#fff27a" stroke="#b39a0a" stroke-width="1.8"/><rect x="25.5" y="28" width="7" height="6" rx="1" fill="#b8c2cc" stroke="#5d6a76" stroke-width="1.4"/><path d="M29 11 L29 8 M37 14 L40 12 M21 14 L18 12" stroke="#fff27a" stroke-width="2" stroke-linecap="round"/>' + gloss('M24 17 C25 13 29 12 31 13 C28 14 26 16 26 19 Z')),
  werk: S('<path d="M24 6 L28 6 L29 11 L33 13 L37 10 L40 13 L37 17 L39 21 L44 22 L44 26 L39 27 L37 31 L40 35 L37 38 L33 35 L29 37 L28 42 L24 42 L23 37 L19 35 L15 38 L12 35 L15 31 L13 27 L8 26 L8 22 L13 21 L15 17 L12 13 L15 10 L19 13 L23 11 Z" fill="#9aa8b6" stroke="#4d5a66" stroke-width="1.8" stroke-linejoin="round"/><circle cx="26" cy="24" r="6" fill="#e8edf2" stroke="#4d5a66" stroke-width="1.8"/><path d="M6 42 L18 30" stroke="#d8552a" stroke-width="5" stroke-linecap="round"/>'),
  garage: S('<path d="M5 32 L5 20 C5 15 9 12 14 12 L32 12 C37 12 41 16 43 22 L43 32 Z" fill="#f1f1f1" stroke="#4d5a66" stroke-width="2" stroke-linejoin="round"/><path d="M9 16 L21 16 L21 23 L8 23 Z M24 16 L33 16 C36 16 38 19 39 23 L24 23 Z" fill="#7fc3ff" stroke="#2f5fa8" stroke-width="1.4"/><rect x="5" y="26" width="38" height="4" fill="#d8552a"/><circle cx="14" cy="34" r="5" fill="#333" stroke="#111" stroke-width="1.4"/><circle cx="34" cy="34" r="5" fill="#333" stroke="#111" stroke-width="1.4"/><circle cx="14" cy="34" r="2" fill="#bbb"/><circle cx="34" cy="34" r="2" fill="#bbb"/>'),
  plan: S('<rect x="5" y="8" width="38" height="32" rx="2" fill="#2d5fb8" stroke="#163a7a" stroke-width="2"/><path d="M10 34 L10 18 L22 18 L22 26 L36 26 L36 34 Z M10 26 L22 26" fill="none" stroke="#dfeaff" stroke-width="1.8"/><path d="M30 12 C26 13 26 20 30 21 C27 22 23 18 24 15 C25 12 28 11 30 12 Z" fill="#fff6b0"/><path d="M27 34 L29 30 L31 34" fill="none" stroke="#ff7a5a" stroke-width="2"/>'),
  buurt: S('<rect x="5" y="8" width="38" height="32" rx="3" fill="#f3ead2" stroke="#6a5a3a" stroke-width="2"/><rect x="5" y="20" width="38" height="6" fill="#8a8c90"/><rect x="5" y="29" width="38" height="5" fill="#6ab0d8"/><rect x="9" y="11" width="7" height="8" fill="#e8862c"/><rect x="18" y="11" width="6" height="8" fill="#3a8ad8"/><rect x="26" y="11" width="8" height="8" fill="#4a9a4a"/><rect x="36" y="11" width="5" height="8" fill="#c8407a"/><path d="M29 18 C24 18 23 25 29 31 C35 25 34 18 29 18 Z" fill="#e2392f" stroke="#8a1a12" stroke-width="1.4"/><circle cx="29" cy="22.5" r="2" fill="#fff"/>' + gloss('M7 10 L41 10 L41 15 L7 15 Z')),
  bills: S('<path d="M11 6 L37 6 L37 42 L33 39 L29 42 L25 39 L21 42 L17 39 L11 42 Z" fill="#fffdf4" stroke="#6a5a3a" stroke-width="2" stroke-linejoin="round"/><path d="M16 13 L32 13 M16 18 L28 18 M16 23 L30 23" stroke="#8a8a8a" stroke-width="2"/><circle cx="29" cy="31" r="6.5" fill="#ffd34a" stroke="#b07a10" stroke-width="1.6"/><path d="M27 29 C28 27 31 27 31.5 28.5 M26 31 L31 31 M26 32.8 L31 32.8 M27 33 C28 35 31 35 31.5 33.5" fill="none" stroke="#7a4a00" stroke-width="1.2"/>'),
  krant: S('<path d="M9 9 L40 9 L40 38 C40 41 38 42 36 42 L10 42 C7 42 5 40 5 37 L5 16 L9 16 Z" fill="#f6f1e4" stroke="#6a5a3a" stroke-width="2" stroke-linejoin="round"/><path d="M9 16 L9 38 C9 40 7 41 6 40" fill="none" stroke="#6a5a3a" stroke-width="1.6"/><rect x="13" y="13" width="23" height="5" fill="#2a2a2a"/><rect x="13" y="21" width="10" height="9" fill="#7fb8e8" stroke="#2f5fa8" stroke-width="1"/><circle cx="19" cy="24" r="2.2" fill="#ffd34a"/><path d="M26 22 L36 22 M26 25 L36 25 M26 28 L36 28 M13 33 L36 33 M13 36 L30 36" stroke="#6a6a6a" stroke-width="1.6" stroke-linecap="round"/>' + gloss('M11 11 L38 11 L38 15 L11 15 Z')),
  map: S('<path d="M5 12 L17 8 L31 12 L43 8 L43 36 L31 40 L17 36 L5 40 Z" fill="#f3e3b2" stroke="#8a6a2a" stroke-width="2" stroke-linejoin="round"/><path d="M17 8 L17 36 M31 12 L31 40" stroke="#c9ad6a" stroke-width="1.6"/><path d="M8 30 C14 24 20 30 26 22 C30 17 36 22 40 16" fill="none" stroke="#5ab0d6" stroke-width="2.4"/><path d="M28 4 C22 4 20 12 28 22 C36 12 34 4 28 4 Z" fill="#e2392f" stroke="#8a1a12" stroke-width="1.6"/><circle cx="28" cy="10" r="2.6" fill="#fff"/>'),
  woning: S('<path d="M6 24 L24 8 L42 24" fill="none" stroke="#8a2a1a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M10 22 L24 10 L38 22 L38 42 L10 42 Z" fill="#f5e6c8" stroke="#7a5a3a" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 24 L24 9 L40 24 L36 24 L24 13 L12 24 Z" fill="#d8552a"/><rect x="20" y="29" width="8" height="13" fill="#3a7bd5" stroke="#1d4a8a" stroke-width="1.4"/><rect x="13" y="26" width="5" height="5" fill="#9fd4ff" stroke="#1d4a8a" stroke-width="1.2"/><rect x="30" y="26" width="5" height="5" fill="#9fd4ff" stroke="#1d4a8a" stroke-width="1.2"/>'),
  loods: S('<path d="M4 20 L24 8 L44 20 L44 42 L4 42 Z" fill="#c8ced6" stroke="#4d5a66" stroke-width="2" stroke-linejoin="round"/><rect x="11" y="24" width="26" height="18" fill="#e8a33d" stroke="#8a5a14" stroke-width="1.6"/><path d="M11 28 L37 28 M11 32 L37 32 M11 36 L37 36" stroke="#8a5a14" stroke-width="1.2"/>' + gloss('M7 21 L24 11 L41 21 L39 22 L24 14 L9 22 Z')),
  bank: S('<ellipse cx="24" cy="36" rx="16" ry="5" fill="#d9a21a" stroke="#8a6206" stroke-width="1.8"/><rect x="8" y="28" width="32" height="8" fill="#d9a21a"/><ellipse cx="24" cy="28" rx="16" ry="5" fill="#f6c94a" stroke="#8a6206" stroke-width="1.8"/><rect x="8" y="20" width="32" height="8" fill="#e6b22a"/><ellipse cx="24" cy="20" rx="16" ry="5" fill="#ffd95a" stroke="#8a6206" stroke-width="1.8"/><path d="M8 20 L8 36 M40 20 L40 36" stroke="#8a6206" stroke-width="1.8"/><text x="24" y="23.5" font-family="Arial" font-weight="900" font-size="9" fill="#8a6206" text-anchor="middle">W</text>'),
  desktop: S('<rect x="5" y="8" width="38" height="26" rx="2" fill="#4a90e2" stroke="#1d4a8a" stroke-width="2"/><path d="M5 28 C15 20 30 30 43 22 L43 34 L5 34 Z" fill="#5cb85c"/><rect x="18" y="34" width="12" height="4" fill="#9aa8b6"/><rect x="12" y="38" width="24" height="3" rx="1.5" fill="#6a7886"/>'),
  help: S('<circle cx="24" cy="24" r="17" fill="#3a8be0" stroke="#1d4a8a" stroke-width="2"/><text x="24" y="31" font-family="Georgia,serif" font-weight="900" font-size="22" fill="#fff" text-anchor="middle">?</text>' + gloss('M11 20 C13 12 22 8 30 10 C21 11 15 15 13 22 Z')),
  power: S('<circle cx="24" cy="24" r="17" fill="#e2492f" stroke="#8a1a12" stroke-width="2"/><path d="M17 16 A11 11 0 1 0 31 16" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/><path d="M24 10 L24 24" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>'),
  logoff: S('<rect x="6" y="6" width="36" height="36" rx="7" fill="#f2a52a" stroke="#9a5a06" stroke-width="2"/><path d="M20 15 L14 15 L14 33 L20 33" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 24 L35 24 M29 18 L35 24 L29 30" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>'),
  media: S('<circle cx="24" cy="24" r="18" fill="#2a9be0" stroke="#0d4f8a" stroke-width="2"/><circle cx="24" cy="24" r="12" fill="#7fd8ff" opacity=".5"/><path d="M20 16 L20 31 M20 16 L31 13 L31 28" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="17.5" cy="31.5" rx="3.6" ry="2.8" fill="#fff"/><ellipse cx="28.5" cy="28.5" rx="3.6" ry="2.8" fill="#fff"/>' + gloss('M9 20 C11 11 21 6 31 8 C21 10 14 14 11 22 Z')),
  van: S('<path d="M4 32 L4 18 C4 14 7 12 11 12 L30 12 L38 20 L44 22 L44 32 Z" fill="#e8e1cf" stroke="#4d5a66" stroke-width="2" stroke-linejoin="round"/><path d="M30 14 L36 21 L30 21 Z" fill="#7fc3ff"/><circle cx="13" cy="34" r="5" fill="#333"/><circle cx="35" cy="34" r="5" fill="#333"/>'),
};

// ------------------------------------------------------------------ wallpaper: an aqua polder morning with bubbles and light rays, all hand-drawn shapes
const WALL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0277c9"/><stop offset=".45" stop-color="#2fb6f0"/><stop offset=".75" stop-color="#9ee6ff"/><stop offset="1" stop-color="#e8fbff"/></linearGradient>
<radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="#fffbe0" stop-opacity=".9"/><stop offset="1" stop-color="#bff4ff" stop-opacity="0"/></radialGradient>
<radialGradient id="b" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="#e8fbff" stop-opacity=".35"/><stop offset=".8" stop-color="#7fd8ff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".7"/></radialGradient>
<linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b6f55a"/><stop offset=".5" stop-color="#5cc932"/><stop offset="1" stop-color="#1f7a1a"/></linearGradient>
<linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe84a"/><stop offset="1" stop-color="#17631a"/></linearGradient>
<linearGradient id="sh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="rib" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#e6fff6" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="wt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b9f1ff"/><stop offset="1" stop-color="#2aa7dc"/></linearGradient></defs>
<rect width="1600" height="1000" fill="url(#s)"/>
<g fill="#fff" opacity=".13"><path d="M260 -40 L520 1000 L640 1000 Z"/><path d="M260 -40 L820 1000 L1000 1000 Z"/><path d="M260 -40 L1250 900 L1400 780 Z"/><path d="M260 -40 L120 1000 L260 1000 Z"/></g>
<circle cx="260" cy="70" r="260" fill="url(#sun)"/>
<path d="M-50 520 C300 380 700 640 1050 470 C1300 350 1500 420 1700 360" fill="none" stroke="url(#rib)" stroke-width="70"/>
<path d="M-50 600 C350 470 760 700 1120 540 C1340 450 1500 500 1700 450" fill="none" stroke="url(#rib)" stroke-width="26"/>
<g fill="#fff" opacity=".9"><ellipse cx="1180" cy="170" rx="140" ry="30"/><ellipse cx="1250" cy="148" rx="80" ry="38"/><ellipse cx="1110" cy="160" rx="60" ry="26"/><ellipse cx="760" cy="250" rx="90" ry="18"/></g>
<g transform="translate(1320 540)"><path d="M-26 175 L26 175 L17 0 L-17 0 Z" fill="#f4f8fb" stroke="#bcd3e2" stroke-width="2"/><path d="M-26 175 L26 175 L24 150 L-24 150 Z" fill="#dfeaf2"/><rect x="-7" y="138" width="14" height="37" rx="7" fill="#3a6a8a"/><rect x="-6" y="70" width="12" height="16" rx="6" fill="#9fd8ff" stroke="#3a6a8a" stroke-width="2"/><path d="M-22 4 Q0 -34 22 4 Z" fill="#c43a2a"/><g><g transform="rotate(0)"><g><path d="M0 0 L0 -168" stroke="#5a4636" stroke-width="5"/><rect x="3" y="-166" width="26" height="124" fill="#fff" fill-opacity=".88" stroke="#7a6a5a" stroke-width="2"/><path d="M3 -135 H29 M3 -104 H29 M3 -73 H29 M16 -166 V-42" stroke="#9a8a7a" stroke-width="1.5"/></g></g><g transform="rotate(90)"><g><path d="M0 0 L0 -168" stroke="#5a4636" stroke-width="5"/><rect x="3" y="-166" width="26" height="124" fill="#fff" fill-opacity=".88" stroke="#7a6a5a" stroke-width="2"/><path d="M3 -135 H29 M3 -104 H29 M3 -73 H29 M16 -166 V-42" stroke="#9a8a7a" stroke-width="1.5"/></g></g><g transform="rotate(180)"><g><path d="M0 0 L0 -168" stroke="#5a4636" stroke-width="5"/><rect x="3" y="-166" width="26" height="124" fill="#fff" fill-opacity=".88" stroke="#7a6a5a" stroke-width="2"/><path d="M3 -135 H29 M3 -104 H29 M3 -73 H29 M16 -166 V-42" stroke="#9a8a7a" stroke-width="1.5"/></g></g><g transform="rotate(270)"><g><path d="M0 0 L0 -168" stroke="#5a4636" stroke-width="5"/><rect x="3" y="-166" width="26" height="124" fill="#fff" fill-opacity=".88" stroke="#7a6a5a" stroke-width="2"/><path d="M3 -135 H29 M3 -104 H29 M3 -73 H29 M16 -166 V-42" stroke="#9a8a7a" stroke-width="1.5"/></g></g><animateTransform attributeName="transform" type="rotate" from="0" to="-360" dur="16s" repeatCount="indefinite"/></g><circle cx="0" cy="0" r="9" fill="#2a5a7a" stroke="#fff" stroke-width="2"/></g>

<path d="M0 720 C320 600 660 660 920 720 C1180 780 1400 690 1600 680 L1600 1000 L0 1000 Z" fill="url(#g1)"/>
<path d="M0 720 C320 600 660 660 920 720 C1180 780 1400 690 1600 680 L1600 730 C1400 740 1180 820 920 770 C660 715 320 655 0 770 Z" fill="url(#sh)" opacity=".55"/>
<path d="M0 850 C380 770 760 820 1100 880 C1300 915 1460 870 1600 850 L1600 1000 L0 1000 Z" fill="url(#g2)"/>
<path d="M-20 935 C420 860 900 950 1620 860 L1620 900 C900 990 420 905 -20 975 Z" fill="url(#wt)" opacity=".85"/>
<path d="M-20 935 C420 860 900 950 1620 860" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>
<g fill="url(#b)" stroke="#fff" stroke-opacity=".6" stroke-width="1.5">
<circle cx="140" cy="520" r="46"/><circle cx="230" cy="430" r="22"/><circle cx="90" cy="370" r="14"/><circle cx="1480" cy="420" r="58"/><circle cx="1390" cy="330" r="26"/><circle cx="1540" cy="270" r="16"/>
<circle cx="980" cy="580" r="34"/><circle cx="1040" cy="510" r="14"/><circle cx="560" cy="430" r="18"/><circle cx="640" cy="560" r="40"/><circle cx="1220" cy="620" r="20"/><circle cx="380" cy="640" r="28"/></g>
<g fill="#fff"><path d="M500 300 l3 -12 l3 12 l12 3 l-12 3 l-3 12 l-3 -12 l-12 -3 Z" opacity=".9"/><path d="M1120 380 l2 -9 l2 9 l9 2 l-9 2 l-2 9 l-2 -9 l-9 -2 Z" opacity=".8"/><path d="M860 140 l2 -8 l2 8 l8 2 l-8 2 l-2 8 l-2 -8 l-8 -2 Z" opacity=".8"/></g>
<g><circle cx="230" cy="905" r="6" fill="#ffd23a"/><circle cx="260" cy="915" r="6" fill="#ff5a4a"/><circle cx="290" cy="903" r="6" fill="#ffd23a"/><circle cx="1290" cy="932" r="6" fill="#ff5a4a"/><circle cx="1320" cy="920" r="6" fill="#ffd23a"/><circle cx="1350" cy="934" r="6" fill="#ff5a4a"/></g>
</svg>`;
export const WALLPAPER = `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(WALL)}")`;

// ------------------------------------------------------------------ the startup chime: an original WebAudio phrase
// A soft rising figure over a warm pad (B-flat lydian-ish), with a bell on top and a little echo. About 3.5 seconds.
let actx = null, chimeBus = null;
function ctx() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (e) { actx = null; } return actx; }
export function unlockAudio() { ctx(); }
export function stopChime() { if (chimeBus) { try { chimeBus.gain.cancelScheduledValues(actx.currentTime); chimeBus.gain.setTargetAtTime(0, actx.currentTime, 0.03); } catch (e) { /* fine */ } chimeBus = null; } }
export function playChime(delay = 0, vol = 0.32) {
  const a = ctx(); if (!a) return; stopChime();
  const t0 = a.currentTime + delay + 0.02;
  const bus = a.createGain(); bus.gain.value = vol; chimeBus = bus;
  // a cheap echo: two taps, filtered
  const dl = a.createDelay(1); dl.delayTime.value = 0.27; const fb = a.createGain(); fb.gain.value = 0.28; const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400;
  bus.connect(a.destination); bus.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(a.destination);
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const voice = (m, at, dur, type, peak, attack = 0.04, detune = 0) => {
    const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = hz(m); o.detune.value = detune;
    g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(peak, at + attack); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g).connect(bus); o.start(at); o.stop(at + dur + 0.05);
  };
  // pad: two slow chords, slightly detuned saws through a filter would be nicer, triangles keep it gentle
  for (const [ch, at, dur] of [[[46, 53, 57, 62], 0, 1.9], [[51, 58, 62, 67], 1.5, 2.2]]) for (const m of ch) { voice(m, t0 + at, dur, 'triangle', 0.07, 0.35, -4); voice(m, t0 + at, dur, 'sine', 0.05, 0.4, 5); }
  // the rising figure
  [[70, 0.15], [74, 0.42], [77, 0.69], [81, 0.96], [79, 1.5], [86, 1.78]].forEach(([m, at], i) => { voice(m, t0 + at, i === 5 ? 1.8 : 0.9, 'sine', 0.16, 0.012); voice(m + 12, t0 + at, 0.5, 'sine', 0.03, 0.01); });
  // a bright little sparkle at the end
  [93, 98, 101].forEach((m, i) => voice(m, t0 + 2.05 + i * 0.07, 0.6, 'sine', 0.025, 0.005));
}
// ------------------------------------------------------------------ interface sounds: soft glassy blips, all original
// open: a bright upward swish with a fifth; close: the same going down; min/max: short swooshes; menu: a bubble pop;
// ding: a two-note bell for a message box; click: a small tok.
export function ui(kind) {
  const a = ctx(); if (!a) return; const t = a.currentTime + 0.005, out = a.createGain(); out.gain.value = 0.5; out.connect(a.destination);
  const tone = (f, at, dur, peak, type = 'sine', glide = 0) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t + at); if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + at + dur * 0.8); g.gain.setValueAtTime(0.0001, t + at); g.gain.exponentialRampToValueAtTime(peak, t + at + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + at + dur); o.connect(g).connect(out); o.start(t + at); o.stop(t + at + dur + 0.03); };
  const swish = (f0, f1, dur, peak) => { const n = a.createBufferSource(), len = Math.floor(a.sampleRate * dur), b = a.createBuffer(1, len, a.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len); n.buffer = b; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2.5; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur); const g = a.createGain(); g.gain.value = peak; n.connect(f).connect(g).connect(out); n.start(t); };
  const hzm = (m) => 440 * Math.pow(2, (m - 69) / 12);
  if (kind === 'open') { swish(900, 5200, 0.22, 0.5); tone(hzm(76), 0.05, 0.25, 0.08); tone(hzm(83), 0.11, 0.35, 0.07); }
  else if (kind === 'close') { swish(4200, 800, 0.2, 0.45); tone(hzm(83), 0.02, 0.2, 0.06); tone(hzm(76), 0.08, 0.28, 0.06); }
  else if (kind === 'min') { swish(3000, 500, 0.18, 0.5); tone(hzm(79), 0, 0.18, 0.05, 'sine', 0.6); }
  else if (kind === 'max') { swish(600, 3600, 0.16, 0.5); tone(hzm(74), 0, 0.18, 0.05, 'sine', 1.5); }
  else if (kind === 'menu') { tone(520, 0, 0.09, 0.09, 'sine', 2.6); tone(hzm(88), 0.05, 0.18, 0.03); }
  else if (kind === 'ding') { for (const [m, at] of [[81, 0], [88, 0.12]]) { tone(hzm(m), at, 0.9, 0.09); tone(hzm(m) * 2.76, at, 0.25, 0.02); } }
  else if (kind === 'error') { tone(hzm(57), 0, 0.3, 0.12, 'triangle'); tone(hzm(52), 0.14, 0.45, 0.12, 'triangle'); }
  else if (kind === 'notify') { [79, 83, 86].forEach((m, i) => tone(hzm(m), i * 0.08, 0.5, 0.06)); }
  else tone(1250, 0, 0.04, 0.05, 'sine', 0.6); // click
}
export function playLogoff() { // two notes down
  const a = ctx(); if (!a) return; const t0 = a.currentTime + 0.01; const g0 = a.createGain(); g0.gain.value = 0.25; g0.connect(a.destination);
  [[81, 0], [74, 0.16], [69, 0.32]].forEach(([m, at]) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = 440 * Math.pow(2, (m - 69) / 12); g.gain.setValueAtTime(0.0001, t0 + at); g.gain.exponentialRampToValueAtTime(0.18, t0 + at + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.5); o.connect(g).connect(g0); o.start(t0 + at); o.stop(t0 + at + 0.55); });
}

// ------------------------------------------------------------------ the shell
// deps: { $, beep, onOpenTab(id), onLogoff(), refresh(), programs(), user: () => ({ name, face }), money: () => string, help(tab) }
export function createKaasdows(deps) {
  const $ = deps.$;
  const pc = $('pc'), win = $('pcwin'), icons = $('pcicons'), tasks = $('pctasks'), menu = $('startmenu'), boot = $('pcboot');
  let winState = 'open', maxed = false, booted = false, bootTimer = 0, drag = null, off = [0, 0], lastTab = null, openMenu = null;
  pc.style.setProperty('--wall', WALLPAPER);
  $('klogo').innerHTML = ICONS.logo; $('bootlogo').innerHTML = ICONS.logo; $('pcoff').innerHTML = ICONS.power;
  const phone = () => innerWidth <= 760 || innerHeight <= 480;

  function applyWin() {
    pc.classList.toggle('nowin', winState !== 'open');
    win.classList.toggle('max', maxed || phone());
    win.style.transform = maxed || phone() ? '' : `translate(${off[0]}px, ${off[1]}px)`;
    $('pcmax').innerHTML = maxed ? restoreGlyph : maxGlyph; $('pcmax').title = maxed ? 'Restore' : 'Maximise';
  }
  const maxGlyph = '<i class="g-max"></i>', restoreGlyph = '<i class="g-res"></i>';

  // the window: title-bar buttons, double-click to maximise, drag by the title bar (mouse and touch, not on phones)
  $('pcmin').onclick = (e) => { e.stopPropagation(); winState = 'min'; ui('min'); applyWin(); deps.renderTasks && deps.renderTasks(); };
  $('pcmax').onclick = (e) => { e.stopPropagation(); maxed = !maxed; ui(maxed ? 'max' : 'min'); applyWin(); };
  const tb = win.querySelector('.tb');
  tb.addEventListener('dblclick', (e) => { if (e.target.closest('button')) return; maxed = !maxed; applyWin(); });
  tb.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button') || maxed || phone()) return;
    drag = { x: e.clientX, y: e.clientY, o: off.slice() }; tb.setPointerCapture(e.pointerId); win.classList.add('dragging');
  });
  tb.addEventListener('pointermove', (e) => {
    if (!drag) return; const r = win.getBoundingClientRect();
    let nx = drag.o[0] + e.clientX - drag.x, ny = drag.o[1] + e.clientY - drag.y;
    const bx = r.left - off[0], by = r.top - off[1]; // where the window sits with no offset
    nx = Math.max(-bx - r.width + 120, Math.min(innerWidth - bx - 120, nx)); ny = Math.max(-by, Math.min(innerHeight - by - 80, ny));
    off = [nx, ny]; win.style.transform = `translate(${nx}px, ${ny}px)`;
  });
  const endDrag = () => { if (drag) { drag = null; win.classList.remove('dragging'); } };
  tb.addEventListener('pointerup', endDrag); tb.addEventListener('pointercancel', endDrag);
  addEventListener('resize', () => { if (pc.style.display === 'block') { off = [0, 0]; applyWin(); } });

  // menus in the window's menu bar: File / View / Help, each item does something real
  const MENUS = {
    File: [['Close window', () => api.closeWindow()], ['Minimise', () => $('pcmin').click()], null, ['Log off Kaasdows', () => deps.onLogoff()]],
    View: [[() => (maxed ? 'Restore window' : 'Maximise window'), () => $('pcmax').click()], ['Show desktop', () => api.showDesktop()], ['Refresh', () => deps.refresh()]],
    Help: [['Help for this program', () => deps.help(lastTab)], ['About Kaasdows XL', () => api.about()]],
  };
  const mb = $('pcmenubar');
  mb.innerHTML = Object.keys(MENUS).map((k) => `<button class="mbi" data-m="${k}">${k}</button>`).join('');
  const drop = $('pcdrop');
  function closeDrop() { drop.style.display = 'none'; openMenu = null; mb.querySelectorAll('.mbi').forEach((b) => b.classList.remove('on')); }
  mb.querySelectorAll('.mbi').forEach((b) => {
    const show = () => {
      const k = b.dataset.m; openMenu = k; mb.querySelectorAll('.mbi').forEach((x) => x.classList.toggle('on', x === b));
      drop.innerHTML = MENUS[k].map((it, i) => (it ? `<button class="dri" data-i="${i}">${typeof it[0] === 'function' ? it[0]() : it[0]}</button>` : '<hr>')).join('');
      const r = b.getBoundingClientRect(), wr = win.getBoundingClientRect(); drop.style.left = r.left - wr.left + 'px'; drop.style.top = r.bottom - wr.top + 'px'; drop.style.display = 'block';
      drop.querySelectorAll('.dri').forEach((d) => d.onclick = (e) => { e.stopPropagation(); const fn = MENUS[k][+d.dataset.i][1]; closeDrop(); ui(); fn(); });
    };
    b.onclick = (e) => { e.stopPropagation(); openMenu === b.dataset.m ? closeDrop() : show(); };
    b.onpointerenter = () => { if (openMenu && openMenu !== b.dataset.m) show(); };
  });

  // start menu
  const startBtn = $('pcstart');
  function toggleStart(on = menu.style.display !== 'block') {
    closeDrop(); menu.style.display = on ? 'block' : 'none'; startBtn.classList.toggle('on', on);
    if (on) { ui('menu'); renderStart(); }
  }
  startBtn.onclick = (e) => { e.stopPropagation(); toggleStart(); };
  pc.addEventListener('pointerdown', (e) => { if (!menu.contains(e.target) && !startBtn.contains(e.target)) toggleStart(false); if (!drop.contains(e.target) && !mb.contains(e.target)) closeDrop(); });
  function renderStart() {
    const u = deps.user(), progs = deps.programs();
    const pin = progs.filter((p) => ['sell', 'beurs', 'map', 'bank'].includes(p.id));
    const rest = progs.filter((p) => !pin.includes(p));
    menu.innerHTML = `<div class="sm-head">${u.face ? `<img src="${u.face}" alt="">` : ''}<b>${u.name}</b></div>
      <div class="sm-cols"><div class="sm-left">${pin.map(item).join('')}${pin.length && rest.length ? '<hr>' : ''}${rest.map(item).join('')}</div>
      <div class="sm-right"><button class="smi" data-x="desktop">${ICONS.desktop}<span>Show desktop</span></button>${progs.some((p) => p.id === 'bank') ? `<button class="smi" data-p="bank">${ICONS.bank}<span>My Wilders<small>${deps.money()}</small></span></button>` : ''}
      ${progs.some((p) => p.id === 'map') ? `<button class="smi" data-p="map">${ICONS.map}<span>Map of Kaasland</span></button>` : ''}<button class="smi" data-x="help">${ICONS.help}<span>Help and tips</span></button><button class="smi" data-x="about">${ICONS.logo}<span>About Kaasdows</span></button></div></div>
      <div class="sm-foot"><button class="smf" data-x="logoff">${ICONS.logoff}<span>Log Off</span></button></div>`;
    menu.querySelectorAll('[data-p]').forEach((b) => b.onclick = () => { toggleStart(false); api.open(b.dataset.p); });
    menu.querySelectorAll('[data-x]').forEach((b) => b.onclick = () => { const x = b.dataset.x; toggleStart(false); if (x === 'desktop') api.showDesktop(); else if (x === 'help') deps.help(winState === 'open' ? lastTab : null); else if (x === 'about') api.about(); else deps.onLogoff(); });
  }
  const item = (p) => `<button class="smi" data-p="${p.id}">${ICONS[p.id] || ICONS.logo}<span>${p.label}${p.isNew ? ' <em>NEW</em>' : ''}</span></button>`;

  $('pcoff').onclick = (e) => { e.stopPropagation(); deps.onLogoff(); };

  // boot screen: the first login of a session gets the full boot, later logins a short welcome fade
  function runBoot(full) {
    clearTimeout(bootTimer); boot.className = full ? 'full' : 'quick'; boot.style.display = 'flex';
    const ms = full ? 2600 : 650;
    unlockAudio(); if (full) playChime(ms / 1000 - 0.25);
    bootTimer = setTimeout(endBoot, ms);
  }
  function endBoot() { clearTimeout(bootTimer); boot.style.display = 'none'; }
  boot.addEventListener('pointerdown', (e) => { e.stopPropagation(); if (boot.className === 'full') { endBoot(); playChime(0); } else endBoot(); });

  const api = {
    get winOpen() { return winState === 'open'; },
    get booting() { return boot.style.display === 'flex'; },
    login(mode) { // called by openPC
      toggleStart(false); closeDrop(); winState = 'open'; off = [0, 0];
      pc.classList.toggle('van', mode === 'van');
      if (mode === 'van') { endBoot(); deps.beep(330, 0.15, 'sine', 0.06); }
      else { runBoot(!booted); booted = true; }
      applyWin();
    },
    logoff() { toggleStart(false); closeDrop(); endBoot(); stopChime(); playLogoff(); },
    open(id) { const was = winState === 'open' && lastTab === id; lastTab = id; winState = 'open'; ui(was ? 'click' : 'open'); deps.onOpenTab(id); applyWin(); },
    setTab(id) { lastTab = id; },
    closeWindow() { winState = 'closed'; ui('close'); applyWin(); deps.refresh(); },
    showDesktop() { if (winState === 'open') winState = 'min'; applyWin(); deps.refresh(); },
    restore() { ui('max'); winState = 'open'; applyWin(); deps.refresh(); },
    about() { api.msg('About Kaasdows XL', `<div class="xpm-about">${ICONS.logo}<div><b>Kaasdows XL</b> · eXtra Lekker Edition<br>Version 2002 (build 1652)<br><br>Licensed to: <b>${deps.user().name}</b><br>Physical memory: 128 MB of kaas<br><br><small>Kaasland Software. Not affiliated with any other window company. No cheese was harmed.</small></div></div>`); },
    // a small modal box over the desktop, with an OK button
    msg(title, html, icon = 'help') {
      let m = $('xpmsg'); if (!m) { m = document.createElement('div'); m.id = 'xpmsg'; pc.appendChild(m); }
      m.innerHTML = `<div class="xpm"><div class="tb"><span class="ti">${ICONS[icon] || ICONS.help}</span><span class="tt">${title}</span><button class="xpb cls" data-ok>×</button></div><div class="xpm-b">${html}</div><div class="xpm-f"><button class="b95" data-ok>OK</button></div></div>`;
      m.style.display = 'grid'; ui(icon === 'power' ? 'error' : 'ding');
      m.querySelectorAll('[data-ok]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); m.style.display = 'none'; });
    },
    escape() { // Esc: close the menu first, then the window, then log off
      if (menu.style.display === 'block') { toggleStart(false); return true; }
      if (drop.style.display === 'block') { closeDrop(); return true; }
      if (boot.style.display === 'flex') { endBoot(); return true; }
      const m = $('xpmsg'); if (m && m.style.display === 'grid') { m.style.display = 'none'; return true; }
      return false;
    },
    // icons on the desktop and the window's button on the taskbar
    render(progs, sel, title, iconId) {
      icons.innerHTML = '';
      for (const p of progs) {
        const d = document.createElement('div'); d.className = 'icon' + (sel === p.id && winState === 'open' ? ' sel' : ''); d.tabIndex = 0;
        d.innerHTML = `<div class="g">${ICONS[p.id] || ICONS.logo}${p.isNew ? '<b class="new">NEW</b>' : ''}</div><span>${p.label}</span>`;
        d.onclick = () => api.open(p.id); d.onkeydown = (e) => { if (e.key === 'Enter') api.open(p.id); };
        icons.appendChild(d);
      }
      $('winicon').innerHTML = ICONS[iconId] || ICONS.logo;
      tasks.innerHTML = winState === 'closed' ? '' : `<button class="task${winState === 'open' ? ' on' : ''}" id="pctask">${ICONS[iconId] || ICONS.logo}<span>${title}</span></button>`;
      const t = $('pctask'); if (t) t.onclick = (e) => { e.stopPropagation(); winState === 'open' ? (winState = 'min', applyWin(), deps.refresh()) : api.restore(); };
      // leave room for the icon columns beside a window that isn't maximised
      requestAnimationFrame(() => { if (!phone()) pc.style.setProperty('--iconsW', icons.scrollWidth + 'px'); });
    },
  };
  return api;
}
