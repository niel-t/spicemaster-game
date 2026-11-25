// Logos for every business on Eddy's block (js/buurt.js), each drawn as its own identity: its own silhouette, lettering
// and colours, the way eighteen different shopkeepers would have ordered them from eighteen different sign painters.
// SVG, so the same art works inline on the buurtkaart and in Krant voor het Kaasvolk, and drawn into canvases for the
// posters, the lit ad panels and the uithangborden. Every logo sits in a 100×100 box and carries a white keyline so it
// reads on any wall, poster or map colour.
// logoSVG(id, px, attrs) returns markup; logoImages() resolves to { id: HTMLImageElement } for canvas drawing.

const AB = 'font-family="Arial Black,Arial,sans-serif" font-weight="900"', AR = 'font-family="Arial,sans-serif" font-weight="700"', GE = 'font-family="Georgia,Times New Roman,serif" font-weight="700"';
const W = 'stroke="#fff" stroke-width="3" stroke-linejoin="round"';
const scallop = (cx, cy, r, n, a) => { let d = ''; for (let i = 0; i < n; i++) { const t0 = (i / n) * 6.2832, t1 = ((i + 1) / n) * 6.2832, x0 = cx + Math.cos(t0) * r, y0 = cy + Math.sin(t0) * r, x1 = cx + Math.cos(t1) * r, y1 = cy + Math.sin(t1) * r; d += `${i ? '' : `M${x0.toFixed(1)} ${y0.toFixed(1)}`} A${a} ${a} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)} `; } return d + 'Z'; };

const L = { // k: a unique id prefix for gradients, filters and clip paths
  // Eddy & Zn: the old trade mark. A saffron lozenge, a red chilli and a ribbon, like the stencil on Dad's spice sacks.
  eddy: () => `<path d="M50 3 L97 50 L50 97 L3 50 Z" fill="#f4b81a" ${W}/><path d="M50 10 L90 50 L50 90 L10 50 Z" fill="none" stroke="#7a1712" stroke-width="1.6"/>
<path d="M35 41 C38 26 55 19 67 25 C60 28 52 35 47 45 C44 50 34 48 35 41 Z" fill="#d6201a" stroke="#7a1712" stroke-width="1.5"/><path d="M65 25 C67 20 71 18 76 19" fill="none" stroke="#2f8a3a" stroke-width="4" stroke-linecap="round"/><path d="M41 40 C44 33 50 29 56 28" fill="none" stroke="#ff9a8a" stroke-width="2" stroke-linecap="round"/>
<path d="M1 49 L99 49 L93 58 L99 67 L1 67 L7 58 Z" fill="#7a1712" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><text x="50" y="62.5" text-anchor="middle" ${GE} font-size="12.5" letter-spacing="1" fill="#ffe9a8">EDDY &amp; ZN</text>
<text x="50" y="78.5" text-anchor="middle" ${GE} font-size="7.4" letter-spacing=".6" fill="#7a1712">1987</text>`,
  // Shoarma Schmatzel: 1971, so seventies stripes stacked into a spit on chocolate brown.
  schmatzel: () => `<rect x="4" y="4" width="92" height="92" rx="20" fill="#3a1e10" ${W}/><path d="M50 10 L50 66" stroke="#ffe9c0" stroke-width="2.5" stroke-linecap="round"/>
<rect x="40" y="16" width="20" height="10" rx="5" fill="#f6c12a"/><rect x="35" y="28" width="30" height="10" rx="5" fill="#f08a1c"/><rect x="31" y="40" width="38" height="10" rx="5" fill="#d8501a"/><rect x="36" y="52" width="28" height="9" rx="4.5" fill="#f08a1c"/><rect x="29" y="64" width="42" height="4" rx="2" fill="#ffe9c0"/>
<text x="50" y="83" text-anchor="middle" ${AB} font-size="12" textLength="78" lengthAdjust="spacingAndGlyphs" fill="#ffe9c0">SCHMATZEL</text><text x="50" y="91.5" text-anchor="middle" ${AR} font-size="5" textLength="70" lengthAdjust="spacingAndGlyphs" fill="#f6c12a">SHOARMA · SINDS 1971</text>`,
  // Hotel Kaasland: a trapgevel plaque in bottle green and brass.
  hotel: () => `<path d="M14 97 L14 46 L24 46 L24 34 L34 34 L34 22 L42 22 L42 10 L58 10 L58 22 L66 22 L66 34 L76 34 L76 46 L86 46 L86 97 Z" fill="#0f4a3a" ${W}/>
<path d="M19 92 L19 51 L29 51 L29 39 L39 39 L39 27 L46 27 L46 15 L54 15 L54 27 L61 27 L61 39 L71 39 L71 51 L81 51 L81 92 Z" fill="none" stroke="#e8c46a" stroke-width="1"/>
<g fill="#e8c46a"><circle cx="43" cy="34" r="1.8"/><circle cx="50" cy="32" r="1.8"/><circle cx="57" cy="34" r="1.8"/></g><text x="50" y="47" text-anchor="middle" ${AR} font-size="6.4" letter-spacing="2.4" fill="#e8c46a">HOTEL</text>
<text x="50" y="77" text-anchor="middle" ${GE} font-size="36" fill="#e8c46a">K</text><text x="50" y="88" text-anchor="middle" ${AR} font-size="6" letter-spacing="1.6" fill="#e8c46a">KAASLAND</text>`,
  // Club Monique: a neon sign. Pink handwriting, a cyan swoosh, nothing else.
  club: (k) => `<defs><filter id="${k}n" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="2.2"/></filter></defs><rect x="3" y="19" width="94" height="62" rx="31" fill="#14060f" ${W}/><rect x="8" y="24" width="84" height="52" rx="26" fill="none" stroke="#ff4f9a" stroke-width="1.6"/>
<text x="50" y="39" text-anchor="middle" ${AR} font-size="7.5" letter-spacing="5" fill="#5ae0ff">CLUB</text>
<g font-family="Georgia,Times New Roman,serif" font-style="italic" font-weight="700" font-size="18" text-anchor="middle"><text x="50" y="59" textLength="66" lengthAdjust="spacingAndGlyphs" fill="#ff4f9a" filter="url(#${k}n)">Monique</text><text x="50" y="59" textLength="66" lengthAdjust="spacingAndGlyphs" fill="#ffd0e4">Monique</text></g>
<path d="M22 67 Q50 73 79 65" fill="none" stroke="#5ae0ff" stroke-width="2" stroke-linecap="round"/><path d="M82 30 l1.4 3.4 3.4 1.4 -3.4 1.4 -1.4 3.4 -1.4 -3.4 -3.4 -1.4 3.4 -1.4 Z" fill="#ffe14a"/>`,
  // Pandjeshuis Spasibo: the pawnbroker's three golden balls, the oldest logo in the world, under a purple name board.
  spasibo: (k) => `<defs><radialGradient id="${k}g" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe89a"/><stop offset=".5" stop-color="#f0b830"/><stop offset="1" stop-color="#a86a10"/></radialGradient></defs>
<path d="M24 24 L24 54 M50 24 L50 40 M76 24 L76 54" stroke="#8a5a14" stroke-width="3" stroke-linecap="round"/><rect x="8" y="6" width="84" height="19" rx="3.5" fill="#3a1450" ${W}/><text x="50" y="20" text-anchor="middle" ${AB} font-size="11.5" letter-spacing="1" fill="#f0b830">SPASIBO</text>
<g fill="url(#${k}g)" stroke="#5a3a0a" stroke-width="1.8"><circle cx="50" cy="52" r="13"/><circle cx="24" cy="66" r="13"/><circle cx="76" cy="66" r="13"/></g>
<text x="50" y="95" text-anchor="middle" ${AR} font-size="7" letter-spacing="1.6" fill="#3a1450" stroke="#fff" stroke-width="2.4" paint-order="stroke">PANDJESHUIS</text>`,
  // Tryshtahn Auto: a winged bonnet badge in chrome and black.
  dealer: (k) => `<defs><linearGradient id="${k}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset=".5" stop-color="#b8c8d8"/><stop offset="1" stop-color="#7a8a9a"/></linearGradient></defs>
<g fill="url(#${k}c)" stroke="#10151c" stroke-width="1.8" stroke-linejoin="round"><path id="${k}w" d="M34 36 L2 26 L9 37 L4 41 L12 47 L8 52 L34 58 Z"/><use href="#${k}w" transform="translate(100 0) scale(-1 1)"/></g>
<circle cx="50" cy="46" r="25" fill="#10151c" stroke="url(#${k}c)" stroke-width="3.5"/><circle cx="50" cy="46" r="19.5" fill="none" stroke="#7fd0ff" stroke-width="1"/><text x="50" y="58" text-anchor="middle" ${GE} font-size="34" fill="#eef6fc">T</text>
<text x="50" y="86" text-anchor="middle" ${AB} font-size="9.6" textLength="84" lengthAdjust="spacingAndGlyphs" fill="#10151c" stroke="#fff" stroke-width="2.6" paint-order="stroke">TRYSHTAHN</text><text x="50" y="96" text-anchor="middle" ${AR} font-size="6.4" letter-spacing="4" fill="#10151c" stroke="#fff" stroke-width="2.2" paint-order="stroke">AUTO</text>`,
  // Bitterbal & Zo: the logo is the bitterbal. Crumbed, on a cocktail stick with its little flag.
  bitterbal: (k) => `<defs><radialGradient id="${k}g" cx=".38" cy=".3" r=".8"><stop offset="0" stop-color="#e8a040"/><stop offset=".6" stop-color="#b8681e"/><stop offset="1" stop-color="#7a400e"/></radialGradient></defs>
<path d="M56 22 L67 2" stroke="#e8d8b0" stroke-width="3" stroke-linecap="round"/><path d="M67 2 L89 8 L71 17 Z" fill="#e8202a" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/><circle cx="50" cy="48" r="34" fill="url(#${k}g)" ${W}/>
<g fill="#f2c070"><circle cx="34" cy="34" r="2"/><circle cx="46" cy="24" r="1.6"/><circle cx="66" cy="32" r="2"/><circle cx="72" cy="46" r="1.5"/><circle cx="28" cy="48" r="1.5"/></g><g fill="#6a3408"><circle cx="58" cy="26" r="1.5"/><circle cx="26" cy="40" r="1.3"/><circle cx="74" cy="38" r="1.3"/></g>
<text x="50" y="50" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-style="italic" font-weight="700" font-size="19" fill="#fff2c8">&amp; Zo</text>
<path d="M3 57 L97 57 L91 67 L97 77 L3 77 L9 67 Z" fill="#f6c12a" stroke="#5a2e0a" stroke-width="2" stroke-linejoin="round"/><text x="50" y="72" text-anchor="middle" ${AB} font-size="12.5" textLength="72" lengthAdjust="spacingAndGlyphs" fill="#5a2e0a">BITTERBAL</text>`,
  // Shoarma Habibi: a pointed arch in green and gold with a heart on fire. Habibi means "my love".
  habibi: () => `<path d="M12 97 L12 46 C12 30 30 22 50 3 C70 22 88 30 88 46 L88 97 Z" fill="#0c5a40" ${W}/><path d="M19 92 L19 47 C19 35 34 28 50 13 C66 28 81 35 81 47 L81 92 Z" fill="none" stroke="#ffd23a" stroke-width="1.5"/>
<path d="M50 66 C33 53 33 39 43 37 C47 36 49.5 39 50 42 C50.5 39 53 36 57 37 C67 39 67 53 50 66 Z" fill="#e8202a"/><path d="M50 60 C44.5 54.5 47 49.5 50 44.5 C51 49.5 55.5 50.5 54.5 55.5 C53.5 59 51 60 50 60 Z" fill="#ffd23a"/>
<text x="50" y="81" text-anchor="middle" ${AB} font-size="13.5" letter-spacing="1" fill="#ffd23a">HABIBI</text><text x="50" y="89" text-anchor="middle" ${AR} font-size="5.6" letter-spacing="2.4" fill="#fff">SHOARMA</text>`,
  // Kapsalon Knip & Kaas: a barber's pole, but in cheese yellow, with the scissors crossed behind it.
  kapsalon: (k) => `<defs><clipPath id="${k}p"><rect x="38" y="13" width="24" height="60" rx="3"/></clipPath></defs>
<g stroke="#fff" stroke-width="9" stroke-linecap="round"><path d="M10 16 L78 60 M90 16 L22 60"/></g><g stroke="#9aa8b6" stroke-width="5" stroke-linecap="round"><path d="M10 16 L78 60 M90 16 L22 60"/></g>
<g fill="none" stroke="#1d2a4a" stroke-width="4"><circle cx="84" cy="66" r="7.5"/><circle cx="16" cy="66" r="7.5"/></g>
<rect x="36.5" y="11.5" width="27" height="63" rx="4" fill="#fff" stroke="#fff" stroke-width="3"/><rect x="38" y="13" width="24" height="60" rx="3" fill="#fff"/>
<g clip-path="url(#${k}p)"><path d="M38 31 L62 17 L62 26 L38 40 Z M38 67 L62 53 L62 62 L38 76 Z" fill="#1d2a4a"/><path d="M38 49 L62 35 L62 44 L38 58 Z M38 13 L62 -1 L62 8 L38 22 Z" fill="#f6c12a"/></g>
<rect x="38" y="13" width="24" height="60" rx="3" fill="none" stroke="#1d2a4a" stroke-width="2"/><rect x="35" y="7" width="30" height="8" rx="3" fill="#1d2a4a"/><rect x="35" y="71" width="30" height="8" rx="3" fill="#1d2a4a"/>
<text x="50" y="94" text-anchor="middle" ${AB} font-size="10.5" textLength="88" lengthAdjust="spacingAndGlyphs" fill="#1d2a4a" stroke="#fff" stroke-width="2.8" paint-order="stroke">KNIP &amp; KAAS</text>`,
  // Avondwinkel Altijd Open: a night sky, a fat moon and a red OPEN tag.
  avond: () => `<rect x="4" y="4" width="92" height="92" rx="16" fill="#14204a" ${W}/><circle cx="40" cy="36" r="23" fill="#ffd23a"/><circle cx="50" cy="29" r="19.5" fill="#14204a"/>
<g fill="#fff"><circle cx="72" cy="18" r="1.6"/><circle cx="84" cy="34" r="1.2"/><circle cx="62" cy="14" r="1"/><circle cx="16" cy="14" r="1.1"/></g><text x="66" y="44" text-anchor="middle" ${AR} font-size="8.4" letter-spacing="2" fill="#fff">ALTIJD</text>
<rect x="11" y="61" width="78" height="27" rx="7" fill="#e8202a" stroke="#fff" stroke-width="2.2"/><text x="50" y="82" text-anchor="middle" ${AB} font-size="20" letter-spacing="2.5" fill="#fff">OPEN</text>`,
  // Rijwielherstel De Lekke Band: a bicycle wheel gone flat on the name board, with a red patch on the tyre.
  fiets: () => `<path d="M30.7 72 A34 34 0 1 1 69.3 72 Z" fill="none" stroke="#fff" stroke-width="12" stroke-linejoin="round"/><path d="M30.7 72 A34 34 0 1 1 69.3 72 Z" fill="#f4f0e4" stroke="#1c1c1c" stroke-width="7" stroke-linejoin="round"/>
<g stroke="#6a6a6a" stroke-width="1.5"><path d="M50 44 L50 13 M50 44 L20 36 M50 44 L80 36 M50 44 L28 22 M50 44 L72 22 M50 44 L32 68 M50 44 L68 68 M50 44 L50 69"/></g><circle cx="50" cy="44" r="4.5" fill="#1c1c1c"/>
<rect x="64" y="12" width="17" height="11" rx="2.5" fill="#e8202a" stroke="#fff" stroke-width="1.6" transform="rotate(38 72 18)"/>
<rect x="2" y="74" width="96" height="22" rx="5" fill="#1f6a44" stroke="#fff" stroke-width="2.5"/><text x="50" y="89.5" text-anchor="middle" ${AB} font-size="9.6" textLength="86" lengthAdjust="spacingAndGlyphs" fill="#ffe14a">DE LEKKE BAND</text>`,
  // Bakkerij Brood & Spelen: the crowned krakeling, the Dutch baker's sign, on a scalloped cake-box seal.
  bakker: () => `<path d="${scallop(50, 50, 44, 16, 9.5)}" fill="#fbf1dc" stroke="#fff" stroke-width="3"/><path d="${scallop(50, 50, 44, 16, 9.5)}" fill="none" stroke="#8a4a12" stroke-width="1.2"/>
<path d="M40 22 L38 11 L45 16.5 L50 8 L55 16.5 L62 11 L60 22 Z" fill="#e8a90a" stroke="#8a4a12" stroke-width="1.2" stroke-linejoin="round"/>
<g fill="none" stroke-linecap="round"><path d="M33 63 C52 54 61 42 57 33 C53 24 37 25 33 37 C29 49 40 58 50 58 C60 58 71 49 67 37 C63 25 47 24 43 33 C39 42 48 54 67 63" stroke="#6a3a10" stroke-width="8.5"/><path d="M33 63 C52 54 61 42 57 33 C53 24 37 25 33 37 C29 49 40 58 50 58 C60 58 71 49 67 37 C63 25 47 24 43 33 C39 42 48 54 67 63" stroke="#c07a2a" stroke-width="5.5"/></g>
<g fill="#fff"><circle cx="35" cy="42" r="1.1"/><circle cx="65" cy="42" r="1.1"/><circle cx="50" cy="57" r="1.1"/><circle cx="43" cy="30" r="1.1"/><circle cx="57" cy="30" r="1.1"/></g>
<text x="50" y="78" text-anchor="middle" font-family="Georgia,Times New Roman,serif" font-style="italic" font-weight="700" font-size="9.6" fill="#6a3a10">Brood &amp; Spelen</text><text x="50" y="86.5" text-anchor="middle" ${AR} font-size="5.4" letter-spacing="2.2" fill="#8a4a12">BAKKERIJ</text>`,
  // Wasserette Schoon Genoeg: a water drop with a washing-machine porthole in it.
  was: () => `<circle cx="80" cy="20" r="6.5" fill="#fff" stroke="#2a8ad8" stroke-width="2.4"/><circle cx="90" cy="35" r="3.6" fill="#fff" stroke="#2a8ad8" stroke-width="2"/>
<path d="M50 3 C50 3 16 44 16 62 C16 82 31 97 50 97 C69 97 84 82 84 62 C84 44 50 3 50 3 Z" fill="#2a8ad8" ${W}/><path d="M36 40 C29 50 25 58 25 64" fill="none" stroke="#9ad0ff" stroke-width="3" stroke-linecap="round"/>
<text x="51" y="37" text-anchor="middle" ${AB} font-size="6.6" fill="#fff">SCHOON</text><circle cx="50" cy="62" r="21" fill="#fff"/><circle cx="50" cy="62" r="16" fill="#c8ecff" stroke="#0a3a6a" stroke-width="2.6"/>
<path d="M36 64 q7 -7 14 0 t14 0 L64 70 C60 76 40 76 36 70 Z" fill="#2a8ad8"/><circle cx="57" cy="55" r="2.4" fill="#fff"/><text x="50" y="92" text-anchor="middle" ${AR} font-size="5.6" letter-spacing="1.4" fill="#fff">GENOEG</text>`,
  // Bloemist De Tulp: one red tulip, cut flat like a tile.
  bloem: () => `<g stroke="#fff" stroke-width="2.4" stroke-linejoin="round" fill="#3aa04a"><path d="M50 79 C35 77 25 65 23 52 C36 54 46 62 50 79 Z"/><path d="M50 79 C65 77 75 65 77 52 C64 54 54 62 50 79 Z"/></g><path d="M50 52 L50 80" stroke="#2f8a3a" stroke-width="5" stroke-linecap="round"/>
<path d="M30 13 C30 40 38 53 50 53 C62 53 70 40 70 13 C64 20 58 24 50 6 C42 24 36 20 30 13 Z" fill="#e8203a" ${W}/><path d="M50 12 C44 26 44 40 50 51 C56 40 56 26 50 12 Z" fill="#b80e26"/>
<text x="50" y="96" text-anchor="middle" ${AB} font-size="14" letter-spacing="1" fill="#1f5a2a" stroke="#fff" stroke-width="3" paint-order="stroke">DE TULP</text>`,
  // Kaashandel Oud & Belegen: a Gouda wheel from above, red wax rind, one wedge already sold.
  kaas: () => `<path d="M50 50 L82.5 17.5 A46 46 0 1 0 96 50 Z" fill="#f6c12a" ${W}/><path d="M79 21 A41 41 0 1 0 91 50" fill="none" stroke="#c8201a" stroke-width="4.5"/><path d="M50 50 L82.5 17.5 M50 50 L96 50" stroke="#c88a0a" stroke-width="1.5"/>
<g fill="#dea010"><circle cx="30" cy="28" r="4.5"/><circle cx="52" cy="22" r="3"/><circle cx="22" cy="60" r="3.4"/><circle cx="70" cy="68" r="4.2"/><circle cx="40" cy="80" r="2.6"/><circle cx="60" cy="82" r="2"/></g>
<text x="42" y="50" text-anchor="middle" ${GE} font-size="13" fill="#5a3208">Oud &amp;</text><text x="46" y="63" text-anchor="middle" ${GE} font-size="12" fill="#5a3208">Belegen</text><text x="48" y="72" text-anchor="middle" ${AR} font-size="4.8" letter-spacing="1.4" fill="#8a5a10">KAASHANDEL</text>`,
  // Belwinkel Bel-Me: a turn-of-the-century telecom brand. Lowercase, purple and lime, in a speech bubble.
  bel: () => `<path d="M12 12 H88 A9 9 0 0 1 97 21 V61 A9 9 0 0 1 88 70 H48 L27 92 L31 70 H12 A9 9 0 0 1 3 61 V21 A9 9 0 0 1 12 12 Z" fill="#5a2ad8" ${W}/>
<g fill="none" stroke="#c8f04a" stroke-width="2.6" stroke-linecap="round"><path d="M79 30 A7 7 0 0 0 72 23"/><path d="M87 30 A15 15 0 0 0 72 15"/></g><circle cx="72" cy="30" r="2.6" fill="#c8f04a"/>
<text x="50" y="55" text-anchor="middle" ${AB} font-size="23" textLength="80" lengthAdjust="spacingAndGlyphs"><tspan fill="#c8f04a">bel</tspan><tspan fill="#fff">-me</tspan></text><text x="50" y="65" text-anchor="middle" ${AR} font-size="5.4" letter-spacing="2.6" fill="#d8ccff">BELWINKEL</text>`,
  // Reisbureau Weg Ermee: a luggage label. Orange card, a sun on the horizon, a plane leaving.
  reis: () => `<g transform="rotate(-7 50 50)"><path d="M50 15 C45 4 60 -1 67 3" fill="none" stroke="#1a2a5a" stroke-width="2" stroke-linecap="round"/><path d="M27 7 L73 7 L91 25 L91 94 L9 94 L9 25 Z" fill="#ff8a1c" ${W}/><circle cx="50" cy="19" r="5.5" fill="#fff" stroke="#1a2a5a" stroke-width="2"/>
<path d="M31 62 A19 19 0 0 1 69 62 Z" fill="#ffe14a"/><g stroke="#ffe14a" stroke-width="2.4" stroke-linecap="round"><path d="M50 38 L50 33 M32 46 L28 43 M68 46 L72 43"/></g><path d="M15 62 L85 62" stroke="#1a2a5a" stroke-width="2.6" stroke-linecap="round"/>
<path d="M58 44 L84 30 L76 51 L70 44 L64 47 Z" fill="#1a2a5a" stroke="#ff8a1c" stroke-width="1"/><text x="50" y="78" text-anchor="middle" ${AB} font-size="11.5" textLength="72" lengthAdjust="spacingAndGlyphs" fill="#1a2a5a">WEG ERMEE</text><text x="50" y="87.5" text-anchor="middle" ${AR} font-size="5.6" letter-spacing="1.8" fill="#1a2a5a">REISBUREAU</text></g>`,
  // Makelaardij Duur & Zn: expensive on purpose. Black, a thin gold line, a serif monogram in a house.
  makelaar: () => `<path d="M50 4 L94 38 L94 96 L6 96 L6 38 Z" fill="#121212" ${W}/><path d="M50 12.5 L88 41.5 L88 90 L12 90 L12 41.5 Z" fill="none" stroke="#d8b040" stroke-width="1.2"/>
<text x="50" y="68" text-anchor="middle" font-family="Georgia,Times New Roman,serif" fill="#d8b040"><tspan font-weight="700" font-size="30">D</tspan><tspan font-style="italic" font-size="19" dy="-3">&amp;</tspan><tspan font-weight="700" font-size="30" dy="3">Z</tspan></text>
<path d="M30 74 L70 74" stroke="#d8b040" stroke-width="0.8"/><text x="50" y="83.5" text-anchor="middle" ${AR} font-size="5.2" letter-spacing="2.6" fill="#d8b040">MAKELAARDIJ</text>`,
};
export const LOGO_IDS = Object.keys(L);
let uid = 0;
// the logo as SVG markup; `attrs` goes on the <svg> (x/y/width/height when nested in the map, with px 0)
export function logoSVG(id, px = 64, attrs = '') {
  if (!L[id]) return '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" ${px ? `width="${px}" height="${px}"` : ''} ${attrs} class="bz-logo">${L[id](`lg${++uid}`)}</svg>`;
}
let imgs = null;
export function logoImages() { // for canvases: every logo as a loaded image
  if (imgs) return imgs;
  return (imgs = Promise.all(LOGO_IDS.map((id) => new Promise((res) => {
    const im = new Image(); im.onload = () => res([id, im]); im.onerror = () => res([id, null]);
    im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(logoSVG(id, 256));
  }))).then((a) => Object.fromEntries(a)));
}
