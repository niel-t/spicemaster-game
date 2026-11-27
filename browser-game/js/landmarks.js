// Kaasland's landmarks (Tristan 2026-11-27): every district looks like the part of Amsterdam it parodies, with a
// stylised take on a real building at the end of a dwarsstraat, where the street opens on a rotonde (js/rotonde.js).
//
//   Kipkruidenkwartier  = de Jordaan / Westelijke grachtengordel   Westerkruidkerk, Haringpoort, Noorderkruidmarkt
//   Oud-Vettenburg      = het Centrum (Damrak, de Dam)             Centraal Frietstation, Paleis op de Damp, Frietmunttoren
//   Hipsterheuvel       = Amsterdam-Noord (NDSM, Overhoeks)        A'KAAS Toren, OOG Filmmuseum, NDSMoothie-werf
//   De Duistere Dokken  = Oosterdok / Oostelijk Havengebied        NEEMO, Kruidvaartmuseum + De Kaneel, Molen De Gierige
//   De Zandwijk         = West (Westerpark, Spaarndammerbuurt)     Westershishafabriek, Het Woestijnschip, Ten Dadelmarkt
//   De Peperpijp        = De Pijp / Museumkwartier                 Brouwerij Heinekaas, Rijkskruidmuseum, De Vette Brug
//   Schiptagat          = Schiphol                                 the I KAASTERDAM letters on the forecourt
//
// Parody names and signs only, no real logos. Each landmark is one vertex-coloured kit mesh (one draw call, culled on its
// own) plus a sign or two; on phones the window grids and small ornaments thin out.
//
// build(kind, c): c = { THREE, kit(), x, z (centre of the front face, the building stands north of it), low,
//   sign(lines, w, h, x, y, z, bg, fg, ry) -> mesh, water(x0, x1, z0, z1, y) -> mesh, add(mesh), spin(mesh) }
// returns { name, real, blurb } (the plaque) or null

const BRICK = 0x8a3e2c, BRICK2 = 0x9c4c34, DBRICK = 0x6a2e22, STONE = 0xd8ccb0, STONE2 = 0xeae2ce, SLATE = 0x3a4250, GOLD = 0xd4a83a,
  COPPER = 0x5aa088, WIN = 0x24303c, WHITE = 0xf2f0ea, GREEN = 0x2f5a3a, WOOD = 0x5a4232;

export const LANDMARKS = {
  westerkerk: { name: 'Westerkruidkerk', real: 'Westerkerk', blurb: 'Built 1631. Rembrandt is buried here somewhere, nobody knows exactly where. The crown on the tower was a gift from an emperor who wanted his spice cut.' },
  haringpoort: { name: 'Haringpoort', real: 'Haarlemmerpoort', blurb: 'The old city gate to the west. Herring came in, tax went out. Now a gate to nowhere with flats inside.' },
  noordermarkt: { name: 'Noorderkruidmarkt', real: 'Noordermarkt', blurb: 'Saturday: organic market. Monday: flea market. Every day: someone selling “artisanal” paprika at four times Eddy’s price.' },
  krul: { name: 'De Krul', real: 'a plaskrul', blurb: 'The green curly urinal of Amsterdam. One person at a time, no roof, no shame. Free since 1870.' },
  centraal: { wide: true, name: 'Centraal Frietstation', real: 'Centraal Station', blurb: 'Two towers: one tells the time, the other the wind. Trains to everywhere, frites to everyone. The Lampas run the snack bar on platform 2.' },
  paleis: { wide: true, name: 'Paleis op de Damp', real: 'Paleis op de Dam', blurb: 'Once the city hall, now the palace. The weathervane is a ship full of spice. The obelisk on the rotonde is the Nationaal Frietmonument.' },
  munt: { name: 'Frietmunttoren', real: 'Munttoren', blurb: 'They minted coins here in 1673. Now it mints selfies. The carillon plays the Lampas jingle at noon.' },
  adam: { name: "A'KAAS Toren", real: "A'DAM Toren", blurb: 'Nineteen floors of offices, a club on top and a swing over the edge. Entry: one oat flat white. The view: all of Kaasland.' },
  eye: { wide: true, name: 'OOG Filmmuseum', real: 'EYE Filmmuseum', blurb: 'A white building that looks like it is about to take off. Inside: films about people opening kombucha bars in Hipsterheuvel.' },
  ndsm: { wide: true, name: 'NDSMoothie-werf', real: 'NDSM-werf', blurb: 'An old shipyard turned into studios, a flea market and a festival every weekend. The crane is a hotel now. Of course it is.' },
  nemo: { name: 'NEEMO', real: 'NEMO', blurb: 'A green science museum shaped like a ship, sinking into the harbour tunnel. The roof is a staircase with a terrace. Science!' },
  scheepvaart: { name: 'Kruidvaartmuseum', real: 'Het Scheepvaartmuseum', blurb: 'Kaasland got rich on spice ships. The replica in the dock is De Kaneel: three masts, forty cannons, zero paperwork.' },
  gooyer: { name: 'Molen De Gierige', real: 'Molen De Gooyer', blurb: 'The tallest wooden mill in the country, next to a brewery. Grinds pepper on Tuesdays, beer the rest of the week.' },
  gashouder: { wide: true, name: 'Westershishafabriek', real: 'Westergasfabriek', blurb: 'The old gasworks: the gas went, the shisha came. The round gasholder is a concert hall, the chimney a lookout for the Paravim.' },
  hetschip: { wide: true, name: 'Het Woestijnschip', real: 'Het Schip', blurb: 'Amsterdamse School: brick that waves, windows that dance and a tower that has no purpose at all. The ship of the desert, says Ras al Gara.' },
  dadelmarkt: { name: 'Ten Dadelmarkt', real: 'Ten Katemarkt', blurb: 'Dates, nuts, olives, fabric, phone cases. Haggle hard: the first price is for tourists from Hipsterheuvel.' },
  brouwerij: { wide: true, name: 'Brouwerij Heinekaas', real: 'the old Heineken brewery', blurb: 'The old brewery, now an “experience”. You pay twenty-five guilders to watch a kettle and get two small beers.' },
  rijks: { wide: true, name: 'Rijkskruidmuseum', real: 'Rijksmuseum', blurb: 'The Nachtwacht hangs inside, and a painting of Eddy’s great-great-grandfather selling cumin. You can cycle right through the middle.' },
  magerebrug: { name: 'De Vette Brug', real: 'Magere Brug', blurb: 'A white wooden drawbridge over the Amstel, lit by a thousand bulbs at night. The original was skinny. This one ate too many kapsalons.' },
  letters: { name: 'I KAASTERDAM', real: 'the I amsterdam letters', blurb: 'Climb on them for a photo. Everybody does. Then go home and tell people you saw Kaasland.' },
};
// which landmark stands at which rotonde, west to east. Phones have one fewer dwarsstraat in a district, so they get the first two.
export const WIJK_LANDMARKS = {
  lampas: ['centraal', 'paleis', 'munt'], nosh: ['adam', 'eye', 'ndsm'], docks: ['nemo', 'scheepvaart', 'gooyer'],
  sand: ['gashouder', 'hetschip', 'dadelmarkt'], pijp: ['brouwerij', 'rijks', 'magerebrug'],
};
// the island art at those rotondes
export const WIJK_ART = { lampas: ['xxx', 'obelisk', 'tulips'], nosh: ['tree', 'tulips', 'tree'], docks: ['anchor', 'tree', 'tulips'], sand: ['palm', 'palm', 'tulips'], pijp: ['tulips', 'xxx', 'tree'] };
export const KOMIJN_LANDMARKS = { '-330': 'haringpoort', '-224': 'krul', '-104': 'westerkerk', '104': 'noordermarkt', '210': 'krul' };

export function build(kind, c) {
  const L = LANDMARKS[kind]; if (!L || !B[kind]) return null;
  const K = c.kit(), X = c.x, Z = c.z, low = c.low, T = c.THREE;
  // bx: a box by its bottom and its front face (z offsets are negative going north, away from the street)
  const h = {
    T, K, X, Z, low,
    bx: (w, hh, d, col, x, y0, zf, ry = 0) => K.box(w, hh, d, col, X + x, y0 + hh / 2, Z + zf - d / 2, ry),
    cy: (rt, rb, hh, col, x, y0, z, seg = 10, rx = 0, ry = 0, rz = 0) => K.cyl(rt, rb, hh, col, X + x, y0 + hh / 2, Z + z, low ? Math.max(4, Math.round(seg * 0.6)) : seg, rx, ry, rz),
    geo: (g, col, x, y, z, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1) => K.geo(g, col, X + x, y, Z + z, rx, ry, rz, sx, sy, sz),
    // a gable roof: ridge along x (alongX) or along z, eaves at y0, ridge hh above
    roof(w, hh, d, col, x, y0, zf, alongX = true) { const s = new T.Shape(), a = alongX ? d : w; s.moveTo(-a / 2, 0); s.lineTo(a / 2, 0); s.lineTo(0, hh); s.closePath();
      const g = new T.ExtrudeGeometry(s, { depth: alongX ? w : d, bevelEnabled: false }); g.translate(0, 0, -(alongX ? w : d) / 2); if (alongX) g.rotateY(Math.PI / 2);
      K.geo(g, col, X + x, y0, Z + zf - d / 2); },
    // a triangle in the front plane (a pediment)
    pediment(w, hh, d, col, x, y0, zf) { const s = new T.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, hh); s.closePath(); const g = new T.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); K.geo(g, col, X + x, y0, Z + zf - d); },
    // a grid of windows on a front face at zf
    wins(x0, x1, y0, rows, rowH, step, ww, wh, zf, col = WIN, arch = false) { const st = low ? step * 1.5 : step;
      for (let r = 0; r < rows; r++) for (let x = x0 + st / 2; x <= x1 - st / 2 + 0.01; x += st) { K.box(ww, wh, 0.14, col, X + x, y0 + r * rowH + wh / 2, Z + zf + 0.05); if (arch && !low) K.cyl(ww / 2, ww / 2, 0.14, col, X + x, y0 + r * rowH + wh, Z + zf + 0.05, 8, Math.PI / 2); } },
    clock(x, y, zf, r, face = WHITE) { K.cyl(r, r, 0.12, face, X + x, y, Z + zf + 0.07, low ? 12 : 20, Math.PI / 2); K.cyl(r * 0.82, r * 0.82, 0.14, 0xf8f4e8, X + x, y, Z + zf + 0.08, low ? 12 : 20, Math.PI / 2); K.box(0.07, r * 0.6, 0.05, 0x1a1a1a, X + x, y + r * 0.26, Z + zf + 0.17); K.box(r * 0.45, 0.07, 0.05, 0x1a1a1a, X + x + r * 0.2, y, Z + zf + 0.17); },
    sign: (lines, w, hh, x, y, z, bg, fg, ry = 0) => c.sign(lines, w, hh, X + x, y, Z + z, bg, fg, ry),
  };
  B[kind](h, c);
  const m = K.build(); if (m) { m.castShadow = true; m.receiveShadow = true; m.userData.landmark = kind; c.add(m); }
  return L;
}

// a market stall: table, poles, a striped awning, crates of produce
export function stall(K, x, z, k, low, ry = 0) {
  const AW = [[0xd8202a, 0xf4f2ec], [0x2f6a3a, 0xf4f2ec], [0x1f4fa0, 0xf4f2ec], [0xe8862c, 0xf4f2ec]][k % 4], c = Math.cos(ry), s = Math.sin(ry);
  const P = (dx, dz) => [x + dx * c + dz * s, z - dx * s + dz * c];
  { const [px, pz] = P(0, 0); K.box(3.0, 0.08, 1.4, 0x8a6a46, px, 0.86, pz, ry); K.box(2.9, 0.82, 1.3, 0x5a5048, px, 0.41, pz, ry); }
  for (const [dx, dz] of [[-1.45, -0.7], [1.45, -0.7], [-1.45, 0.7], [1.45, 0.7]]) { const [px, pz] = P(dx, dz); K.box(0.06, 2.3, 0.06, 0x8a8e94, px, 1.15, pz, ry); }
  for (let i = 0; i < (low ? 4 : 8); i++) { const n = low ? 4 : 8, w = 3.3 / n, [px, pz] = P(-1.65 + w * (i + 0.5), 0); K.box(w, 0.05, 1.9, AW[i % 2], px, 2.35, pz, ry, 0.12); }
  const FR = [0xd8202a, 0xf2c31a, 0x4f8f3a, 0xe8862c, 0x7a3a8a, 0xc8a070];
  for (let i = 0; i < 4; i++) { const [px, pz] = P(-1.05 + i * 0.7, 0.2); K.box(0.6, 0.18, 0.5, 0xb08a5a, px, 0.99, pz, ry); K.box(0.52, 0.1, 0.42, FR[(i + k) % FR.length], px, 1.12, pz, ry); }
}

// little bikes leaning on things: a frame, two wheels, a saddle, in one of eight Dutch colours
export function fiets(K, x, z, k, ry = 0) {
  const col = [0x1a1a1a, 0x2a4a7a, 0x8a1a1a, 0x2f5a3a, 0xe8e2d0, 0x6a6a6a, 0xd8a020, 0x5a2a5a][k % 8], c = Math.cos(ry), s = Math.sin(ry);
  for (const d of [-0.52, 0.52]) K.cyl(0.33, 0.33, 0.05, 0x222222, x + d * c, 0.34, z - d * s, 10, Math.PI / 2, ry);
  K.box(1.0, 0.05, 0.05, col, x, 0.62, z, ry); K.box(0.05, 0.4, 0.05, col, x - 0.12 * c, 0.5, z + 0.12 * s, ry); K.box(0.22, 0.05, 0.1, 0x1a1a1a, x - 0.18 * c, 0.78, z + 0.18 * s, ry); K.box(0.06, 0.06, 0.5, 0x8a8e94, x + 0.45 * c, 0.85, z - 0.45 * s, ry);
}

const B = {
  westerkerk(h) {
    const { bx, cy, roof, wins, clock, geo, T } = h;
    bx(13, 13, 28, BRICK, 0, 0, -7.5); roof(13.6, 7, 28.4, SLATE, 0, 13, -7.3, false);
    for (const s of [-1, 1]) { bx(0.3, 13, 28, STONE, s * 6.6, 0, -7.5); wins(-5, 5, 2, 1, 0, 3.3, 1.4, 7, -7.5, 0x3a4a6a, true); }
    for (const s of [-1, 1]) { bx(5.5, 8, 7, BRICK2, s * 7.2, 0, -0.5); roof(5.7, 3, 7.2, SLATE, s * 7.2, 8, -0.4, true); wins(s * 7.2 - 2, s * 7.2 + 2, 1.6, 1, 0, 2, 1.0, 4, -0.5, 0x3a4a6a, true); }
    // the tower: brick, then stone, then the octagons, then the imperial crown
    bx(7.5, 20, 7.5, BRICK, 0, 0, 0); for (const y of [0, 6.5, 13.5, 19.6]) bx(7.8, 0.45, 7.8, STONE, 0, y, 0.15);
    wins(-1.5, 1.5, 7.5, 2, 6.8, 3, 1.3, 4.4, 0, 0x2a3242, true); bx(1.8, 3.2, 0.2, 0x3a2a1a, 0, 0, 0.1);
    bx(6.3, 6, 6.3, STONE, 0, 20, -0.6); for (const sx of [-1, 1]) bx(0.5, 6, 0.5, STONE2, sx * 3.0, 20, -0.45); clock(0, 23.4, -0.6, 1.6, GOLD);
    bx(5.4, 3.4, 5.4, STONE2, 0, 26, -1.05); wins(-1.2, 1.2, 26.6, 1, 0, 2.4, 1.0, 2.2, -1.05, 0x2a3242, true);
    const tz = -3.75;
    cy(2.6, 2.8, 4.2, STONE, 0, 29.4, tz, 8); cy(2.0, 2.2, 3.4, 0x3a4a5a, 0, 33.6, tz, 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; h.K.box(0.22, 3.4, 0.22, STONE2, h.X + Math.cos(a) * 2.1, 35.3, h.Z + tz + Math.sin(a) * 2.1); }
    cy(1.8, 1.8, 0.5, GOLD, 0, 37, tz, 12); cy(1.55, 1.25, 1.7, 0x2a4aa0, 0, 37.5, tz, 12);
    for (const ry of [0, Math.PI / 2]) geo(new T.TorusGeometry(1.4, 0.13, 6, 14, Math.PI), GOLD, 0, 38.9, tz, 0, ry, 0);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; geo(new T.SphereGeometry(0.14, 6, 4), 0xd8202a, Math.cos(a) * 1.55, 37.6, tz + Math.sin(a) * 1.55); }
    geo(new T.SphereGeometry(0.42, 10, 8), GOLD, 0, 40.5, tz); cy(0.05, 0.05, 1.4, GOLD, 0, 40.8, tz, 5); h.K.box(0.7, 0.08, 0.08, GOLD, h.X, 41.7, h.Z + tz);
    h.sign([['WESTERKRUIDKERK', 54], ['1631 · hier ligt Rembrandt (ergens)', 26]], 4.6, 1.15, 0, 3.2, 0.32, '#2a1a10', '#e8c868');
  },
  haringpoort(h) {
    const { bx, cy, roof, wins, pediment, geo, T } = h;
    bx(15, 1.0, 9.6, 0xbcae90, 0, 0, 0.3); bx(14, 11, 9, STONE, 0, 1, 0); roof(14.4, 3.4, 9.4, SLATE, 0, 12, 0.2, true);
    for (const x of [-5.4, -2.2, 2.2, 5.4]) { cy(0.45, 0.52, 7, STONE2, x, 1, 0.75, 12); bx(1.2, 0.4, 1.2, STONE2, x, 1, 1.35); bx(1.1, 0.4, 1.1, STONE2, x, 7.8, 1.3); }
    bx(14.6, 1.3, 1.6, STONE2, 0, 8.2, 1.5); pediment(14.6, 3.2, 1.4, STONE2, 0, 9.5, 1.4);
    bx(3.6, 5.6, 0.3, 0x1a1612, 0, 1, 0.12); cy(1.8, 1.8, 0.3, 0x1a1612, 0, 6.5, -0.03, 12, Math.PI / 2);
    wins(-7, -3, 2.5, 2, 3.4, 2, 1.0, 1.9, 0); wins(3, 7, 2.5, 2, 3.4, 2, 1.0, 1.9, 0);
    for (const s of [-1, 1]) { bx(6, 8, 7, STONE, s * 10, 0, -1); roof(6.2, 2.4, 7.2, SLATE, s * 10, 8, -0.9, true); wins(s * 10 - 2.5, s * 10 + 2.5, 2, 2, 3, 2.5, 1.0, 1.8, -1); }
    cy(1.3, 1.3, 2.4, WHITE, 0, 15.3, -4.5, 8); cy(0, 1.5, 1.8, SLATE, 0, 17.7, -4.5, 8); geo(new T.SphereGeometry(0.25, 8, 6), GOLD, 0, 19.7, -4.5);
    h.sign([['HARINGPOORT', 60]], 6.4, 0.9, 0, 8.85, 2.32, '#d8ccb0', '#3a2a1a');
  },
  noordermarkt(h) {
    const { bx, cy, roof, wins, geo, T } = h;
    bx(19, 9, 8, BRICK, 0, 0, -6); bx(8, 9, 19, BRICK, 0, 0, -0.5); roof(19.4, 5, 8.4, SLATE, 0, 9, -5.8, true); roof(8.4, 5, 19.4, SLATE, 0, 9, -0.3, false);
    wins(-3, 3, 1.8, 1, 0, 3, 1.2, 5, -0.5, 0x3a4a6a, true); wins(-9.5, -4.5, 1.8, 1, 0, 2.5, 1.1, 5, -6, 0x3a4a6a, true); wins(4.5, 9.5, 1.8, 1, 0, 2.5, 1.1, 5, -6, 0x3a4a6a, true);
    bx(2.6, 3.2, 2.6, WOOD, 0, 13.6, -8.7); cy(0, 1.6, 5.5, SLATE, 0, 16.8, -10, 4, 0, Math.PI / 4); geo(new T.SphereGeometry(0.22, 8, 6), GOLD, 0, 22.4, -10);
    for (let i = 0; i < (h.low ? 2 : 4); i++) stall(h.K, h.X + [-9, 9, -5.5, 5.5][i], h.Z + [1.6, 1.6, 3.4, 3.4][i], i, h.low);
    h.sign([['NOORDERKRUIDMARKT', 48], ['zaterdag boerenmarkt · maandag vlooien', 24]], 4.8, 1.1, 0, 3.0, 0.07, '#2f5a3a', '#f4f2ec');
  },
  krul(h) {
    const { cy, geo, T, K, X, Z, low } = h;
    // the kiosk, the plaskrul, two benches, lindens and bikes against the railings
    cy(1.7, 1.7, 2.6, GREEN, -5, 0, -2.5, 8); cy(0.3, 2.1, 0.9, GREEN, -5, 2.6, -2.5, 8); geo(new T.SphereGeometry(0.2, 8, 6), GOLD, -5, 3.7, -2.5);
    K.box(2.6, 0.5, 0.05, 0xf2c31a, X - 5, 2.0, Z - 0.75);
    geo(new T.CylinderGeometry(1.0, 1.0, 2.0, low ? 10 : 16, 1, true, 0.5, 4.6), GREEN, 4, 1.15, -2.5); cy(1.15, 1.15, 0.18, GREEN, 4, 2.2, -2.5, 12); cy(0.1, 0.1, 2.8, GREEN, 4, 0, -2.5, 6); geo(new T.SphereGeometry(0.28, 8, 6), GREEN, 4, 2.9, -2.5);
    for (const x of [-1.2, 1.2]) { K.box(1.8, 0.08, 0.5, 0x7a5a3a, X + x, 0.48, Z - 5); K.box(1.8, 0.5, 0.08, 0x7a5a3a, X + x, 0.78, Z - 5.24); }
    for (let i = 0; i < (low ? 3 : 7); i++) fiets(K, X - 2.2 + i * 0.75, Z - 0.9, i, Math.PI / 2);
    h.sign([['KRANTEN · LOTTO · STROOPWAFELS', 30]], 2.6, 0.45, -5, 2.0, -0.72, '#f2c31a', '#1a1a1a');
    h.sign([['DE KRUL', 50], ['gratis · sinds 1870', 26]], 1.6, 0.7, 4, 1.4, -1.32, '#2f5a3a', '#f4f2ec');
  },
  centraal(h) {
    const { bx, cy, roof, wins, clock, geo, T } = h;
    for (const s of [-1, 1]) { const x = s * 14.5; bx(15, 12, 10, BRICK, x, 0, 0); for (const y of [0, 4.2, 8.4, 11.6]) bx(15.2, 0.35, 10.2, STONE, x, y, 0.1); wins(x - 7, x + 7, 1.2, 3, 4.2, 2.3, 1.2, 2.6, 0, 0x2a3a4a, true); roof(15.4, 4, 10.4, SLATE, x, 12, 0.2, true); for (let d = -5; d <= 5; d += 5) { bx(1.4, 1.6, 1.0, SLATE, x + d, 13, -1.2); } }
    bx(14, 15, 11, BRICK2, 0, 0, 0.5); for (const y of [0, 7.6, 14.6]) bx(14.2, 0.4, 11.2, STONE, 0, y, 0.6);
    bx(6, 6.6, 0.4, 0x1a1a1a, 0, 0, 0.62); cy(3, 3, 0.4, 0x1a1a1a, 0, 6.6, 0.42, 14, Math.PI / 2); wins(-6, 6, 9, 1, 0, 2.4, 1.3, 3.6, 0.5, 0x2a3a4a, true);
    roof(14.4, 5, 11.4, SLATE, 0, 15, 0.7, false); h.pediment(14, 4, 0.5, BRICK2, 0, 15, 0.9);
    for (const s of [-1, 1]) { const x = s * 5.6; bx(4.6, 24, 4.6, BRICK, x, 0, 1.4); for (const y of [7.6, 14.6, 20.5]) bx(4.8, 0.4, 4.8, STONE, x, y, 1.5); bx(4.0, 3.2, 4.0, STONE2, x, 24, 1.1);
      cy(0, 3.0, 4.6, SLATE, x, 27.2, -0.9, 4, 0, Math.PI / 4); cy(0.05, 0.05, 1.6, GOLD, x, 31.8, -0.9, 5); geo(new T.SphereGeometry(0.28, 8, 6), GOLD, x, 31.9, -0.9); clock(x, 22.2, 1.4, 1.3, GOLD); }
    // the train shed behind: a long half barrel of glass and iron
    geo(new T.CylinderGeometry(10, 10, 52, h.low ? 10 : 18, 1, true, Math.PI / 2, Math.PI).rotateZ(Math.PI / 2), 0x8a9aa6, 0, 3.5, -20);
    for (let x = -24; x <= 24; x += h.low ? 12 : 6) geo(new T.TorusGeometry(10, 0.18, 4, h.low ? 10 : 18, Math.PI), 0x4a5058, x, 3.5, -20, 0, Math.PI / 2, 0);
    h.sign([['CENTRAAL FRIETSTATION', 54]], 9, 1.0, 0, 7.9, 1.13, '#1a1a1a', '#e8c868');
  },
  paleis(h) {
    const { bx, cy, wins, pediment, geo, T, K, X, Z } = h;
    bx(37, 1.4, 18.6, 0xb8aa8c, 0, 0, 0.3); bx(36, 16, 18, STONE, 0, 1.4, 0); bx(36.4, 0.6, 18.4, STONE2, 0, 9, 0.2); bx(36.6, 1.0, 18.6, STONE2, 0, 17.2, 0.3);
    wins(-18, -6.5, 2.4, 3, 4.6, 2.2, 1.0, 2.6, 0); wins(6.5, 18, 2.4, 3, 4.6, 2.2, 1.0, 2.6, 0);
    bx(12, 17, 18.6, STONE2, 0, 1.4, 0.6); wins(-6, 6, 2.4, 3, 4.6, 2.4, 1.1, 2.8, 0.6); for (const x of [-4.8, -2.4, 0, 2.4, 4.8]) bx(0.4, 15, 0.4, STONE, x, 1.6, 0.85);
    pediment(12.4, 3.4, 0.8, STONE2, 0, 18.4, 0.9); K.box(5, 1.4, 0.1, GOLD, X, 19.6, Z + 0.95);
    bx(36, 1.4, 18, SLATE, 0, 18.2, 0); bx(34, 2.2, 16, SLATE, 0, 19.6, -1);
    // the cupola: drum, copper dome, lantern and the golden ship
    const cz = -9; cy(3.0, 3.2, 1.2, STONE, 0, 21.8, cz, 8); cy(2.6, 2.6, 4.2, STONE2, 0, 23, cz, 8);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; K.box(0.8, 2.4, 0.12, WIN, X + Math.cos(a) * 2.62, 25.1, Z + cz + Math.sin(a) * 2.62, -a + Math.PI / 2); }
    geo(new T.SphereGeometry(2.7, h.low ? 8 : 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), COPPER, 0, 27.2, cz, 0, 0, 0, 1, 1.25, 1); cy(0.6, 0.7, 1.6, STONE2, 0, 30.4, cz, 8); cy(0, 0.7, 0.8, COPPER, 0, 32, cz, 8);
    K.box(1.6, 0.4, 0.4, GOLD, X, 33.3, Z + cz); K.box(0.06, 1.1, 0.06, GOLD, X, 33.9, Z + cz); K.box(0.7, 0.5, 0.04, GOLD, X + 0.1, 34.0, Z + cz);
    h.sign([['PALEIS OP DE DAMP', 56]], 6.4, 0.75, 0, 9.35, 0.95, '#eae2ce', '#3a2a1a');
  },
  munt(h) {
    const { bx, cy, roof, wins, clock, geo, T, K, X, Z } = h;
    for (const s of [-1, 1]) { bx(6, 6, 7, BRICK, s * 6.5, 0, -0.5); wins(s * 6.5 - 2.5, s * 6.5 + 2.5, 1.4, 2, 2.4, 1.7, 0.9, 1.5, -0.5); const sg = new T.Shape(); sg.moveTo(-3, 0); for (const [a, b] of [[-3, 1], [-2, 1], [-2, 2], [-1, 2], [-1, 3], [1, 3], [1, 2], [2, 2], [2, 1], [3, 1], [3, 0]]) sg.lineTo(a, b); sg.closePath(); h.geo(new T.ExtrudeGeometry(sg, { depth: 0.4, bevelEnabled: false }), BRICK2, s * 6.5, 6, -0.6); }
    bx(7, 10, 7, BRICK, 0, 0, 0); for (const sx of [-1, 1]) bx(0.5, 10, 0.5, STONE, sx * 3.3, 0, 0.1); bx(7.3, 0.5, 7.3, STONE, 0, 10, 0.15); bx(2.0, 3.0, 0.2, 0x3a2a1a, 0, 0, 0.1);
    bx(5.6, 3.6, 5.6, STONE2, 0, 10.5, -0.7); clock(0, 12.3, -0.7, 1.3, 0x1a1a1a);
    const tz = -3.5; cy(2.3, 2.5, 3.4, WHITE, 0, 14.1, tz, 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; K.box(0.6, 2.4, 0.1, 0x2a3242, X + Math.cos(a) * 2.4, 15.8, Z + tz + Math.sin(a) * 2.4, -a + Math.PI / 2); }
    cy(1.4, 2.0, 1.8, 0x2a3a4a, 0, 17.5, tz, 8); cy(0.9, 0.9, 1.4, WHITE, 0, 19.3, tz, 8); cy(0, 1.0, 4.6, 0x2a3a4a, 0, 20.7, tz, 8); geo(new T.SphereGeometry(0.3, 8, 6), GOLD, 0, 25.5, tz); K.box(0.05, 1.2, 0.05, GOLD, X, 26.2, Z + tz);
    h.sign([['FRIETMUNTTOREN', 50]], 4.4, 0.7, 0, 8.6, 0.37, '#2a1a10', '#e8c868');
  },
  adam(h) {
    const { bx, K, X, Z, low, T, geo } = h, G = 0x34444f, F = 0xe8eaec;
    bx(15, 3, 13, 0x2a2e34, 0, 0, 0); bx(14, 22, 12, G, 0, 3, -0.5);
    for (let x = -6.5; x <= 6.5; x += low ? 2.6 : 1.3) K.box(0.14, 22, 0.14, F, X + x, 14, Z - 0.42);
    for (let y = 3; y <= 25; y += low ? 2.2 : 1.1) K.box(14.1, 0.14, 0.14, F, X, y, Z - 0.42);
    // the twist: two sections turned against the rest, the club on top, the swing hanging over the edge
    K.box(14.4, 6, 12.4, 0x2c3c48, X + 0.4, 28, Z - 6.5, 0.16); for (let x = -6.5; x <= 6.5; x += low ? 2.6 : 1.3) K.box(0.14, 6, 0.14, F, X + 0.4 + x * Math.cos(0.16), 28, Z - 6.5 + 6.2 * Math.cos(0.16) - x * Math.sin(0.16) + 0.12, 0.16);
    K.box(13.6, 4, 11.6, 0x283642, X - 0.3, 33, Z - 6.5, -0.1); K.box(12, 2.2, 10, 0x1a1e24, X, 36.1, Z - 6.5); K.box(12.6, 0.3, 10.6, F, X, 37.3, Z - 6.5);
    K.box(0.35, 3.2, 0.35, 0xd8202a, X + 7.2, 38.8, Z - 2); K.box(0.35, 3.2, 0.35, 0xd8202a, X + 7.2, 38.8, Z - 4); K.box(5, 0.35, 0.35, 0xd8202a, X + 9.3, 40.3, Z - 3, 0, 0, 0); K.box(5, 0.35, 2.4, 0xd8202a, X + 9.3, 40.3, Z - 3, 0, 0, 0.0);
    for (const dz of [-3.6, -2.4]) K.box(0.04, 3.4, 0.04, 0x1a1a1a, X + 11.4, 38.5, Z + dz); K.box(0.6, 0.12, 1.6, 0xf2c31a, X + 11.4, 36.8, Z - 3);
    h.sign([["A'KAAS", 110]], 8, 2.4, 0, 39.4, -1.4, '#d8202a', '#ffffff');
    h.sign([["A'KAAS TOREN · uitkijk · schommel", 30]], 6, 0.7, 0, 1.6, 0.06, '#1a1e24', '#ffffff');
  },
  eye(h) {
    const { K, X, Z, T, low } = h, s = new T.Shape();
    s.moveTo(-15, 0); s.lineTo(-12, 7); s.lineTo(-2, 14.5); s.lineTo(9, 11); s.lineTo(15.5, 5.5); s.lineTo(13, 0); s.closePath();
    const g = new T.ExtrudeGeometry(s, { depth: 14, bevelEnabled: false }); K.geo(g, 0xf4f4f2, X, 0, Z - 16);
    const s2 = new T.Shape(); s2.moveTo(-9, 0); s2.lineTo(-6, 4.5); s2.lineTo(6, 6.5); s2.lineTo(11, 0); s2.closePath(); K.geo(new T.ExtrudeGeometry(s2, { depth: 4, bevelEnabled: false }), 0xe8e8e6, X + 2, 0, Z - 4);
    K.box(18, 3.2, 0.12, 0x2a3a4a, X + 2, 1.8, Z + 0.06, 0, 0, 0.0); K.box(20, 0.25, 6, 0xf4f4f2, X + 2, 3.5, Z - 1);
    h.sign([['OOG', 140]], 5, 2.2, -3, 9.5, -1.92, '#f4f4f2', '#1a1a1a');
    h.sign([['FILMMUSEUM · films over kombucha', 30]], 6, 0.6, 2, 2.6, 0.1, '#2a3a4a', '#ffffff');
    for (let i = 0; i < (low ? 3 : 6); i++) fiets(K, X - 12 + i * 0.75, Z + 0.8, i, Math.PI / 2);
  },
  ndsm(h) {
    const { bx, roof, K, X, Z, low } = h, RUST = 0x7a4a32;
    bx(30, 12, 16, RUST, 0, 0, -4); roof(30.4, 3, 16.4, 0x5a3a2a, 0, 12, -3.8, true);
    const GR = [0xd8202a, 0xf2c31a, 0x2a9ad8, 0x8ad83a, 0xf06aa0, 0x7a3ad8, 0xff7a3a];
    for (let i = 0; i < (low ? 9 : 20); i++) { const w = 1.5 + (i * 7 % 5), hh = 1 + (i * 3 % 4); K.box(w, hh, 0.1, GR[i % GR.length], X - 13 + (i * 5.3) % 26, 0.6 + (i * 1.7) % 6, Z - 3.94); }
    bx(6, 5, 0.3, 0x2a2a2a, 0, 0, -3.8);
    for (const x of [-9, 9]) { bx(1.2, 22, 1.2, 0x9a3a1a, x, 0, 1.5); bx(1.2, 22, 1.2, 0x9a3a1a, x, 0, -14); }
    for (const z of [1.5, -14]) bx(19.2, 1.6, 1.2, 0x9a3a1a, 0, 22, z); bx(1.6, 1.6, 17, 0x9a3a1a, -9, 22, 1.7); bx(1.6, 1.6, 17, 0x9a3a1a, 9, 22, 1.7);
    bx(5, 4, 4, 0xe8e2d0, -4, 23.6, -4); bx(28, 1.2, 1.4, 0x9a3a1a, 9, 25, -6);
    h.sign([['NDSMOOTHIE-WERF', 60]], 9, 1.2, 0, 10, -3.6, '#1a1a1a', '#f2c31a');
  },
  nemo(h) {
    const { K, X, Z, T, low } = h, s = new T.Shape();
    s.moveTo(2, 0); s.lineTo(4, 23); s.lineTo(-28, 1.5); s.lineTo(-28, 0); s.closePath(); // side profile (x here is z): the bow at the front, the roof stepping down behind
    for (const sd of [-1, 1]) { const g = new T.ExtrudeGeometry(s, { depth: 10, bevelEnabled: false }); g.rotateY(-Math.PI / 2); K.geo(g, 0x3e8c70, X + sd * 0.01, 0, Z - 1, 0, sd * 0.18, 0); }
    for (let i = 0; i < (low ? 8 : 16); i++) { const f = i / (low ? 8 : 16), y = 1.5 + f * 21, zz = -28 + f * 32; K.box(19.5 - f * 4, 0.1, 0.5, 0xb8e0c8, X, y + 0.06, Z + zz - 1); }
    for (let y = 3; y < 20; y += low ? 6 : 3) K.box(6 - y * 0.15, 0.6, 0.1, 0x1a3a30, X, y, Z + 2.0 + y * 0.087);
    h.sign([['NEEMO', 120]], 5.2, 1.7, 0, 15, 3.75, '#3e8c70', '#ffffff', 0);
    h.sign([['WETENSCHAP · dak = trap', 30]], 4.4, 0.6, 0, 1.6, 2.3, '#1a3a30', '#ffffff');
  },
  scheepvaart(h, c) {
    const { bx, cy, roof, wins, K, X, Z, T, low, geo } = h;
    // the museum behind its dock
    bx(26, 14, 20, STONE, 0, 0, -11); bx(26.4, 0.6, 20.4, STONE2, 0, 13.4, -10.8); roof(26.4, 3, 20.4, SLATE, 0, 14, -10.8, true); wins(-12, 12, 2, 3, 4, 2.4, 1.0, 2.4, -11);
    cy(1.6, 1.6, 2.6, STONE2, 0, 16, -21, 8); cy(0, 1.8, 2.2, COPPER, 0, 18.6, -21, 8); geo(new T.SphereGeometry(0.25, 8, 6), GOLD, 0, 20.9, -21);
    if (c.water) c.water(X - 12.6, X + 12.6, Z - 10.4, Z - 0.8, 0.016);
    for (const z of [-0.6, -10.6]) bx(25.4, 0.35, 0.5, 0x6a6a64, 0, 0, z + 0.25);
    // De Kaneel: hull, castle, three masts with furled sails, gold on the stern
    // De Kaneel seen from above: a pointed hull, a pale deck, the stern castle, a bowsprit
    const hz = Z - 5.6, plan = (k) => { const p = new T.Shape(); p.moveTo(-10 * k, -2.1 * k); p.lineTo(6 * k, -2.2 * k); p.quadraticCurveTo(10 * k, -1.4 * k, 11.5 * k, 0); p.quadraticCurveTo(10 * k, 1.4 * k, 6 * k, 2.2 * k); p.lineTo(-10 * k, 2.1 * k); p.closePath(); return p; };
    { const g = new T.ExtrudeGeometry(plan(1), { depth: 2.4, bevelEnabled: false }); g.rotateX(-Math.PI / 2); K.geo(g, 0x3a2418, X, -0.2, hz); }
    { const g = new T.ExtrudeGeometry(plan(0.9), { depth: 0.1, bevelEnabled: false }); g.rotateX(-Math.PI / 2); K.geo(g, 0xb89068, X - 0.3, 2.2, hz); }
    K.box(3, 2.2, 4.3, 0x4a2c1c, X - 8.6, 3.3, hz); K.box(3.1, 0.15, 4.4, 0xb89068, X - 8.6, 4.45, hz); K.box(0.2, 1.6, 4.4, 0xd4a83a, X - 10.1, 3.3, hz); K.box(5, 0.18, 0.18, 0x4a3020, X + 13, 3.2, hz, 0, 0, 0.3);
    K.box(17, 0.22, 0.12, 0xd4a83a, X + 0.5, 1.6, hz + 2.18); K.box(17, 0.22, 0.12, 0xd4a83a, X + 0.5, 1.6, hz - 2.18);
    for (let i = 0; i < (low ? 5 : 10); i++) K.box(0.4, 0.3, 0.1, 0x1a1a1a, X - 7 + i * 1.6, 1.0, hz + 2.24);
    for (const [mx, mh] of [[-6, 13], [0.5, 16], [6.5, 12]]) { K.cyl(0.16, 0.22, mh, 0x4a3020, X + mx, 2.2 + mh / 2, hz, 6); for (let y = 6; y < mh; y += 4) { K.box(0.18, 0.18, 6 - y * 0.18, 0x4a3020, X + mx, 2.2 + y, hz); K.cyl(0.32, 0.32, 5.6 - y * 0.18, 0xece4cc, X + mx, 2.5 + y, hz, 6, Math.PI / 2); } }
    for (const [mx, y, w] of [[-6, 8.5, 4.6], [0.5, 9.5, 5.4], [0.5, 13.5, 4.4], [6.5, 8.5, 4.2]]) K.box(0.08, 3.2, w, 0xf2ead4, X + mx + 0.35, 2.2 + y - 1.6, hz, 0, 0, 0.12);
    K.box(9, 0.06, 0.06, 0x1a1a1a, X + 3.5, 12, hz, 0, 0, -0.75); K.box(9, 0.06, 0.06, 0x1a1a1a, X - 2.8, 12.6, hz, 0, 0, 0.68);
    h.sign([['KRUIDVAARTMUSEUM', 54]], 7, 0.9, 0, 11.5, -10.82, '#eae2ce', '#1a2a4a');
    h.sign([['DE KANEEL · 1749 · replica', 30]], 3.2, 0.5, -1, 2.9, -3.3, '#3a2418', '#e8c868');
  },
  gooyer(h, c) {
    const { bx, cy, roof, K, X, Z, T, low } = h;
    bx(11, 6, 8, BRICK, -9, 0, -2); roof(11.2, 3, 8.2, 0x5a3a2a, -9, 6, -1.9, true); h.wins(-14, -4, 1.4, 1, 0, 2.5, 1.2, 2.2, -2, WIN, true);
    const mz = -6; cy(4.2, 4.6, 7, DBRICK, 5, 0, mz, 8); cy(5.6, 5.6, 0.25, WOOD, 5, 7, mz, 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; K.box(0.1, 1.0, 0.1, WOOD, X + 5 + Math.cos(a) * 5.5, 7.6, Z + mz + Math.sin(a) * 5.5); }
    cy(2.4, 3.9, 11, 0x5a4a3a, 5, 7.2, mz, 8); cy(2.0, 2.6, 2.4, 0x2a2a2a, 5, 18.2, mz, 8);
    // the sails on their own mesh, so they can turn
    const S = c.kit(), sx = X + 5, sy = 19.4, sz = Z + mz + 2.9;
    for (let i = 0; i < 2; i++) S.box(0.35, 22, 0.3, 0x4a3a2a, 0, 0, 0, 0, 0, i * Math.PI / 2);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
      for (let k = 0; k < (low ? 4 : 8); k++) { const r = 2 + k * (low ? 2.2 : 1.1); S.box(1.9, 0.07, 0.07, 0xd8d0c0, -sa * r + ca * 0.95, ca * r + sa * 0.95, 0.04, 0, 0, a); }
      S.box(1.7, 8.6, 0.04, 0xe8e0cc, -sa * 6.4 + ca * 0.95, ca * 6.4 + sa * 0.95, 0.1, 0, 0, a); }
    const sm = S.build(); if (sm) { sm.position.set(sx, sy, sz); sm.castShadow = true; c.add(sm); if (c.spin) c.spin(sm, 0.5); }
    K.cyl(0.4, 0.4, 2.2, 0x2a2a2a, sx, sy, sz - 1, 8, Math.PI / 2);
    h.sign([["BROUWERIJ 'T IJZER", 46]], 5.6, 0.8, -9, 4.4, -1.9, '#2a1a10', '#e8c868');
  },
  gashouder(h) {
    const { bx, cy, roof, wins, K, X, Z, T, low, geo } = h;
    const gz = -11; cy(9.5, 9.5, 11, BRICK, -3, 0, gz, 28); for (let i = 0; i < (low ? 12 : 24); i++) { const a = i / (low ? 12 : 24) * Math.PI * 2; K.box(0.7, 11, 0.4, BRICK2, X - 3 + Math.cos(a) * 9.6, 5.5, Z + gz + Math.sin(a) * 9.6, -a); if (Math.sin(a) > 0.2) K.box(0.9, 2.6, 0.1, WIN, X - 3 + Math.cos(a + 0.13) * 9.55, 7, Z + gz + Math.sin(a + 0.13) * 9.55, -a - 0.13 + Math.PI / 2); }
    cy(9.9, 9.9, 0.6, STONE, -3, 11, gz, 28); geo(new T.SphereGeometry(9.6, low ? 12 : 20, 4, 0, Math.PI * 2, 0, 0.5), 0x5a6068, -3, 6.3, gz);
    cy(1.0, 1.5, 28, DBRICK, -15, 0, -3, 12); cy(1.15, 1.15, 0.6, STONE, -15, 27.6, -3, 12);
    bx(12, 8, 10, BRICK, 11, 0, -1); roof(12.2, 4, 10.2, SLATE, 11, 8, -0.9, true); wins(5.5, 16.5, 1, 1, 0, 2.7, 1.5, 4.5, -1, 0x2a3a4a, true);
    h.sign([['WESTERSHISHAFABRIEK', 46]], 7.6, 0.9, 11, 6.6, -0.88, '#2a1a10', '#e8c868');
  },
  hetschip(h) {
    const { bx, cy, roof, wins, K, X, Z, T, low, geo } = h, TILE = 0xc8642e;
    bx(24, 12, 12, BRICK2, 2, 0, 0); for (let y = 1; y < 12; y += 2.2) bx(24.1, 0.35, 12.1, DBRICK, 2, y, 0.05); cy(4.5, 4.5, 12, BRICK2, -10, 0, -4.5, 14); for (let y = 1; y < 12; y += 2.2) cy(4.55, 4.55, 0.35, DBRICK, -10, y, -4.5, 14);
    roof(24.4, 3.6, 12.4, TILE, 2, 12, 0.2, true); cy(3.0, 4.7, 3.6, TILE, -10, 12, -4.5, 14);
    for (let r = 0; r < 3; r++) for (let x = -6; x <= 12; x += low ? 3.6 : 1.8) { K.box(1.1, 1.6, 0.14, WIN, X + x, 2.4 + r * 3.4, Z + 0.06); K.box(1.3, 0.1, 0.2, WHITE, X + x, 1.55 + r * 3.4, Z + 0.08); }
    bx(2.4, 9, 2.4, BRICK2, 6, 12, -4.8); cy(0, 1.8, 7, BRICK2, 6, 21, -6, 4, 0, Math.PI / 4); geo(new T.SphereGeometry(0.25, 8, 6), GOLD, 6, 28.2, -6);
    h.sign([['HET WOESTIJNSCHIP', 52]], 6, 0.85, 2, 3.9, 0.08, '#2a1a10', '#e8c868');
  },
  dadelmarkt(h) {
    const { K, X, Z, low } = h;
    for (let i = 0; i < (low ? 3 : 6); i++) stall(K, X - 8.5 + (i % 3) * 8.5, Z - 1.6 - Math.floor(i / 3) * 5, i + 2, low);
    for (const s of [-1, 1]) K.box(0.18, 4.6, 0.18, 0x8a8e94, X + s * 11, 2.3, Z - 0.4);
    h.sign([['TEN DADELMARKT', 56], ['dadels · noten · stoffen · elke dag', 24]], 8, 1.3, 0, 4.2, -0.4, '#c87848', '#ffffff');
  },
  brouwerij(h) {
    const { bx, cy, roof, wins, K, X, Z, T, low, geo } = h;
    for (const s of [-1, 1]) { const x = s * 11; bx(12, 13, 16, BRICK, x, 0, -1); for (const y of [0.1, 6.4, 12.6]) bx(12.2, 0.4, 16.2, STONE, x, y, -0.9); wins(x - 5.5, x + 5.5, 1.2, 2, 6.2, 2.7, 1.4, 4.2, -1, 0x2a3a4a, true); roof(12.4, 3, 16.4, SLATE, x, 13, -0.8, true); }
    bx(10, 17, 16, BRICK2, 0, 0, 0); for (const y of [0.1, 8.4, 16.6]) bx(10.2, 0.4, 16.2, STONE, 0, y, 0.1); h.pediment(10.4, 3, 0.6, BRICK2, 0, 17, 0.2);
    bx(7, 7, 0.3, 0x1a2228, 0, 1, 0.12); for (const x of [-1.8, 1.8]) { geo(new T.SphereGeometry(1.5, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), 0xc87a3a, x, 4.6, -0.5); cy(1.5, 1.5, 3.6, 0xc87a3a, x, 1, -0.5, 12); cy(0.15, 0.15, 1.6, 0xc87a3a, x, 6, -0.5, 6); }
    bx(3.2, 27, 3.2, BRICK, 14, 0, -12); bx(3.5, 0.5, 3.5, STONE, 14, 27, -11.85);
    h.sign([['BROUWERIJ', 40], ['HEINEKAAS', 64]], 6.6, 1.6, 0, 11.2, 0.12, '#6a2e22', '#f4f2ec');
    h.sign([['EXPERIENCE · 2 kleine biertjes inbegrepen', 26]], 6.4, 0.6, 0, 9.1, 0.12, '#1a1a1a', '#e8c868');
  },
  rijks(h) {
    const { bx, cy, roof, wins, K, X, Z, T, low, geo } = h;
    for (const s of [-1, 1]) { const x = s * 16; bx(14, 13, 14, BRICK, x, 0, -1); for (const y of [0.1, 5.4, 12.6]) bx(14.2, 0.4, 14.2, STONE, x, y, -0.9); wins(x - 6.5, x + 6.5, 1.2, 2, 5.6, 2.2, 1.2, 3.6, -1, 0x2a3a4a, true); roof(14.4, 4.5, 14.4, SLATE, x, 13, -0.8, true); }
    bx(18, 16, 14, BRICK2, 0, 0, 0); for (const y of [0.1, 6, 15.6]) bx(18.2, 0.45, 14.2, STONE, 0, y, 0.1);
    for (const x of [-2.4, 2.4]) { bx(3.6, 5.4, 0.4, 0x1a1612, x, 0, 0.12); cy(1.8, 1.8, 0.4, 0x1a1612, x, 5.4, -0.08, 12, Math.PI / 2); } // the passage the bikes ride through
    wins(-8, 8, 8, 1, 0, 2.6, 1.6, 4.8, 0, 0x2a3a4a, true); roof(18.4, 6, 14.4, SLATE, 0, 16, 0.2, true);
    for (const s of [-1, 1]) { const x = s * 7.4; bx(4.4, 25, 4.4, BRICK, x, 0, 0.9); for (const y of [6, 15.6, 22]) bx(4.6, 0.4, 4.6, STONE, x, y, 1.0); bx(3.8, 3, 3.8, STONE2, x, 25, 0.6);
      cy(0, 2.8, 6, SLATE, x, 28, -1.3, 4, 0, Math.PI / 4); geo(new T.SphereGeometry(0.3, 8, 6), GOLD, x, 34.2, -1.3); cy(0.05, 0.05, 1.4, GOLD, x, 34.3, -1.3, 5); h.clock(x, 20, 0.9, 1.1, GOLD); }
    h.sign([['RIJKSKRUIDMUSEUM', 56]], 8, 0.9, 0, 11.4, 0.13, '#d8ccb0', '#3a2a1a');
    for (let i = 0; i < (low ? 3 : 6); i++) fiets(K, X - 3.6 + i * 1.4, Z + 1.4, i + 3, 0.3);
  },
  magerebrug(h, c) {
    const { K, X, Z, T, low } = h, W = 0xf6f4ee;
    // the Amstel runs across behind the rotonde; the bridge crosses it; on the far quay the houses carry on
    if (c.water) c.water(X - 12.8, X + 12.8, Z - 12, Z - 1.2, 0.016);
    for (const z of [-1.0, -12.2]) K.box(25.6, 1.0, 0.5, 0x6a4a3a, X, -0.4, Z + z);
    for (let x = -12; x <= 12; x += 6) if (Math.abs(x) > 3) for (const z of [-0.6]) K.box(0.18, 0.6, 0.18, 0x2a2c30, X + x, 0.3, Z + z);
    for (const s of [-1, 1]) K.box(5.4, 0.35, 5.4, W, X, 0.45 + 0.35, Z - 6.6 + s * 3.0, 0, s * 0.06);
    K.box(5.4, 0.3, 1.6, W, X, 0.9, Z - 6.6);
    for (const sx of [-1, 1]) { K.box(0.12, 0.9, 11, W, X + sx * 2.6, 1.4, Z - 6.6); for (let z = -1.6; z >= -11.6; z -= low ? 2 : 1) K.box(0.06, 0.9, 0.06, W, X + sx * 2.6, 1.3, Z + z); }
    for (const pz of [-4.2, -9.0]) { for (const sx of [-1, 1]) { K.box(0.4, 6.5, 0.4, W, X + sx * 2.8, 3.6, Z + pz); K.box(0.3, 0.3, 6.0, W, X + sx * 2.8, 6.6, Z + pz + (pz > -6.6 ? 2.0 : -2.0), -0.0, 0.0); }
      K.box(6.0, 0.4, 0.4, W, X, 6.9, Z + pz); K.box(6.0, 0.3, 0.3, W, X, 5.4, Z + pz);
      for (let i = 0; i < 6; i++) K.box(0.1, 0.1, 0.1, 0xfff4c0, X - 2.5 + i, 7.15, Z + pz); }
    for (let i = 0; i < 7; i++) { const sx = -10 + i * 3.2; const hh = 9 + (i * 3) % 4; K.box(3.1, hh, 6, [0x8a3e2c, 0x6a3a2a, 0x9c4c34, 0x4a3a32][i % 4], X + sx, hh / 2, Z - 16.2); K.box(2.6, 0.12, 0.2, WHITE, X + sx, hh, Z - 13.18); for (let r = 0; r < 3; r++) K.box(1.6, 1.4, 0.1, WIN, X + sx, 2 + r * 2.8, Z - 13.15); }
    h.sign([['DE VETTE BRUG', 56], ['over de Amstel · vroeger mager', 24]], 4.6, 1.1, -5, 1.4, -0.75, '#f6f4ee', '#1a2a4a');
  },
};

// I KAASTERDAM in chunky blocks: a 5x7 pixel font, red and white, one kit mesh
const FONT = { I: ['111', '010', '010', '010', '010', '010', '111'], K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'], A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'], T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'], E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'], D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'], M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'] };
export function letters(K, x0, z, px = 0.26, depth = 0.7) {
  const text = 'I KAASTERDAM'; let x = x0;
  for (let i = 0; i < text.length; i++) { const ch = text[i]; if (ch === ' ') { x += px * 3; continue; } const F = FONT[ch], col = i < 6 ? 0xd8202a : 0xf4f2ec;
    F.forEach((row, r) => { let c0 = -1; for (let cc = 0; cc <= row.length; cc++) { const on = row[cc] === '1'; if (on && c0 < 0) c0 = cc; if (!on && c0 >= 0) { K.box((cc - c0) * px, px, depth, col, x + (c0 + (cc - c0) / 2) * px, (6.5 - r) * px + 0.1, z); c0 = -1; } } });
    x += (F[0].length + 1) * px; }
  return x;
}
