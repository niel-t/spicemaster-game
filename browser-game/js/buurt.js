// De buurt: every business on Eddy's block in Kipkruidenkwartier, their advertisements and an interactive buurtkaart.
// - BIZ is the directory: the places that were already there (Schmatzel, Spasibo, Bitterbal & Zo, Hotel Kaasland, Shoarma Habibi,
//   Club Monique, Tryshtahn Auto, Eddy's own warehouse) and ten new shopfronts on houses that had none (bizSign() hands main.js
//   the shop sign while it builds the street, place() records where each one ended up).
// - Ads: posters on three green Amsterdam plakzuilen along the canal, and a display ad in Krant voor het Kaasvolk each day.
// - The buurtkaart: a top-down map of the block (on the PC, and on a plattegrond board by the zebra). Click a business for its ad,
//   who runs it and whether it is open today (opening days follow the weekday from js/kaasweer.js), then set a route: a beacon in
//   the street that goes out when Eddy gets there.

import { logoSVG, logoImages } from './buurtlogos.js'; // a round badge for every business

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
const ALL = [0, 1, 2, 3, 4, 5, 6];
export const KINDS = {
  eten: { name: 'Eten', col: '#e8862c', icon: '🍢' },
  winkel: { name: 'Winkels', col: '#3a8ad8', icon: '🛍️' },
  dienst: { name: 'Diensten', col: '#4a9a4a', icon: '🔧' },
  uit: { name: 'Uitgaan', col: '#c8407a', icon: '🎶' },
  eddy: { name: 'Eddy', col: '#e8a90a', icon: '🌶️' },
};
// x0/x1 for the places built by their own code; the rest get their spot from place() while main.js builds the houses.
// side n: the street side with the warehouse (facades at z -6.5); s: across the canal (facades at z 12.6+8, facing the water)
export const BIZ = [
  { id: 'eddy', name: "Eddy & Zn", kind: 'eddy', side: 'n', x0: -11, x1: 1, owner: 'Eddy Jr. (and Pa, in spirit)', open: ALL, hours: 'when the Naknikim are awake',
    blurb: "Dad's spice warehouse. The mixing table, the PC, the Naknikim and the Oofmobiel out front.", ad: { head: 'KRUIDEN', big: "EDDY & ZN", line: 'Zoals Pa ze maakte', foot: 'Groothandel · sinds 1987', bg: '#6b1410', fg: '#ffd36b' } },
  { id: 'schmatzel', short: 'Schmatzel', name: 'Shoarma Schmatzel', kind: 'eten', side: 'n', x0: -26.5, x1: -16.5, owner: 'Nabil', open: ALL, hours: '11:00 till late',
    blurb: "Freddy Sr.'s oldest client. Broodje shoarma W 4, and Nabil still asks after your father.", ad: { head: 'SINDS 1971', big: 'SCHMATZEL', line: 'Broodje shoarma W 4', foot: 'Ook voor Eddy', bg: '#1e120a', fg: '#ffd36b' } },
  { id: 'hotel', short: 'Hotel Kaasland', name: 'Hotel Kaasland', kind: 'dienst', side: 'n', x0: -34, x1: -26.5, owner: 'a chain from out of town', open: ALL, hours: '24 uur',
    blurb: 'The stack of houses on top of houses at the west end. Tourists with wheelie cases come and go all day.', ad: { head: 'SLAPEN IN', big: 'KAASLAND', line: 'Uitzicht op de gracht*', foot: '*vanaf kamer 7, als je staat', bg: '#1f7a5e', fg: '#f2e6c8' } },
  { id: 'club', name: 'Club Monique', kind: 'uit', side: 'n', x0: -66, x1: -50, owner: 'Monique (nobody has met her)', open: [3, 4, 5], hours: 'Do–Za 22:00–04:00',
    blurb: 'The club at the west end. Creplach on the door wants W 200, Jossi is always on the front row.', ad: { head: 'DO · VR · ZA', big: 'CLUB MONIQUE', line: 'Dresscode: netjes', foot: 'Creplach checks', bg: '#2a0a1e', fg: '#ff6aa8' } },
  { id: 'spasibo', short: 'Spasibo', name: 'Pandjeshuis Spasibo', kind: 'winkel', side: 'n', x0: 20, x1: 28, owner: 'The Russian', open: ALL, hours: 'when the Russian says so',
    blurb: "Dad's old friend. Guns, ammo, armour, and no questions. Cash only, no receipts.", ad: { head: 'WE KOPEN', big: 'ALLES', line: 'Wij vragen niets', foot: 'Pandjeshuis Spasibo · cash', bg: '#140818', fg: '#e8a33d' } },
  { id: 'dealer', name: 'Tryshtahn Auto', kind: 'winkel', side: 'n', x0: 52, x1: 80, owner: 'Tryshtahn', open: [0, 1, 2, 3, 4, 5], hours: 'Ma–Za 09:00–18:00',
    blurb: 'The glass showroom at the east end. Three cars on turntables, and a price for everybody. A special price for you.', ad: { head: 'NIEUW · GEBRUIKT', big: 'TRYSHTAHN', line: 'Een prijs voor iedereen', foot: 'Speciale prijs voor jou', bg: '#14161c', fg: '#7fd0ff' } },
  { id: 'bitterbal', short: 'Bitterbal & Zo', name: 'Bitterbal & Zo', kind: 'eten', side: 'n', sign: 'BITTERBAL & ZO', owner: 'Tante Riek', open: [1, 2, 3, 4, 5, 6], hours: 'Di–Zo 12:00–23:00',
    blurb: 'Bitterballen, kroketten, frikandellen. The fryer has been on since 1983.', ad: { head: 'WARM', big: 'BITTERBAL & ZO', line: '8 bitterballen W 5', foot: 'Mosterd gratis', bg: '#8a4a12', fg: '#fff2c8' } },
  { id: 'habibi', short: 'Habibi', name: 'Shoarma Habibi', kind: 'eten', side: 's', sign: 'SHOARMA HABIBI', owner: 'Mo (not Monteur Mo)', open: ALL, hours: '16:00–03:00',
    blurb: 'Across the canal. Buys its spice from whoever is cheapest this week. Might be you, one day.', ad: { head: 'HABIBI', big: 'COME EAT', line: 'Kapsalon W 7,50', foot: 'Bezorging tot 03:00', bg: '#0a3a2a', fg: '#ffe14a' } },
  // new shopfronts (north side, then across the canal); n is the house index in main.js
  { id: 'kapsalon', short: 'Knip & Kaas', name: 'Kapsalon Knip & Kaas', kind: 'dienst', side: 'n', row: 'nw', n: 3, sign: 'KNIP & KAAS', owner: 'Fatima', open: [1, 2, 3, 4, 5], hours: 'Di–Za 09:00–18:00',
    blurb: 'A barber with opinions. Knows everything that happens on the street before it happens.', ad: { head: 'KNIPPEN', big: 'W 15', line: 'Baard erbij? W 5', foot: 'Kapsalon Knip & Kaas', bg: '#1d2a4a', fg: '#f2e6c8' } },
  { id: 'avond', short: 'Altijd Open', name: 'Avondwinkel Altijd Open', kind: 'winkel', side: 'n', row: 'ne', n: 5, sign: 'ALTIJD OPEN', owner: 'Ravi', open: ALL, hours: '16:00–01:00*',
    blurb: 'Crisps, cola, batteries, a single onion. *Always open, except when Ravi is asleep.', ad: { head: 'ALTIJD', big: 'OPEN*', line: 'Chips · cola · één ui', foot: '*behalve als ik slaap', bg: '#e8202a', fg: '#ffffff' } },
  { id: 'fiets', short: 'De Lekke Band', name: 'Rijwielherstel De Lekke Band', kind: 'dienst', side: 'n', row: 'ne', n: 8, sign: 'DE LEKKE BAND', owner: 'Wim', open: [0, 1, 2, 3, 4, 5], hours: 'Ma–Za 08:30–17:30',
    blurb: 'Bike repairs. Wim fixes a flat in four minutes and talks for forty.', ad: { head: 'LEKKE BAND?', big: 'WIM', line: 'Klaar terwijl u wacht', foot: 'en wacht, en wacht', bg: '#2a6a4a', fg: '#ffe14a' } },
  { id: 'bakker', short: 'Brood & Spelen', name: 'Bakkerij Brood & Spelen', kind: 'eten', side: 'n', row: 'ne', n: 10, sign: 'BROOD & SPELEN', owner: 'Annie', open: [0, 1, 2, 3, 4, 5], hours: 'Ma–Za 07:00–17:00',
    blurb: 'Bread, krentenbollen and the best appeltaart in Kaasland. In December, speculaas made with your kaneel.', ad: { head: 'VERS', big: 'APPELTAART', line: 'Elke ochtend om 7 uur', foot: 'Bakkerij Brood & Spelen', bg: '#f2e6c8', fg: '#8a4a12' } },
  { id: 'was', short: 'Wasserette', name: 'Wasserette Schoon Genoeg', kind: 'dienst', side: 's', row: 's', n: 11, sign: 'WASSERETTE', owner: 'Mevrouw Bos', open: ALL, hours: '08:00–21:00',
    blurb: 'Six machines, four of them working. Mevrouw Bos folds your shirts if she likes you.', ad: { head: 'WASSEN', big: 'W 4', line: 'Drogen W 2 · vouwen gratis*', foot: '*als ze je aardig vindt', bg: '#7fc3ff', fg: '#0a2a4a' } },
  { id: 'bloem', short: 'De Tulp', name: 'Bloemist De Tulp', kind: 'winkel', side: 's', row: 's', n: 2, sign: 'DE TULP', owner: 'Henny', open: [0, 1, 2, 3, 4, 5], hours: 'Ma–Za 09:00–18:00',
    blurb: 'Tulips in every colour, and in winter, tulips in every colour from a greenhouse.', ad: { head: 'TULPEN', big: '10 VOOR W 5', line: 'Ook voor je moeder', foot: 'Bloemist De Tulp', bg: '#c8102e', fg: '#fff2d8' } },
  { id: 'kaas', short: 'Oud & Belegen', name: 'Kaashandel Oud & Belegen', kind: 'winkel', side: 's', row: 's', n: 5, sign: 'OUD & BELEGEN', owner: 'Gerard', open: [1, 2, 3, 4, 5], hours: 'Di–Za 09:00–17:30',
    blurb: 'Wheels of cheese to the ceiling. Gerard lets tourists taste until they buy, or until they leave.', ad: { head: 'PROEF', big: 'KAAS', line: 'Jong · belegen · oud', foot: 'Kaashandel Oud & Belegen', bg: '#f6c12a', fg: '#3a2412' } },
  { id: 'bel', short: 'Bel-Me', name: 'Belwinkel Bel-Me', kind: 'winkel', side: 's', row: 's', n: 8, sign: 'BEL-ME', owner: 'Yusuf', open: ALL, hours: '10:00–20:00',
    blurb: 'Phone repairs, prepaid cards, and a Shmokia in the window that nobody has ever bought.', ad: { head: 'SCHERM KAPOT?', big: 'BEL-ME', line: 'Gemaakt in 1 uur', foot: 'Prepaid · hoesjes · Shmokia', bg: '#2a1a5a', fg: '#a9c46a' } },
  { id: 'reis', short: 'Weg Ermee', name: 'Reisbureau Weg Ermee', kind: 'dienst', side: 's', row: 's', n: 16, sign: 'WEG ERMEE', owner: 'Sandra', open: [0, 1, 2, 3, 4], hours: 'Ma–Vr 09:30–17:00',
    blurb: 'Package holidays to Costa del Kaas. Freddy Sr. booked his here.', ad: { head: 'ZON!', big: 'COSTA DEL KAAS', line: '7 nachten v.a. W 299', foot: 'Reisbureau Weg Ermee', bg: '#ff9a2e', fg: '#1a2a5a' } },
  { id: 'makelaar', short: 'Duur & Zn', name: 'Makelaardij Duur & Zn', kind: 'dienst', side: 's', row: 's', n: 18, sign: 'DUUR & ZN', owner: 'Mr. Duur', open: [0, 1, 2, 3, 4], hours: 'Ma–Vr 09:00–17:00',
    blurb: 'Every flat in Kaasland is "charming". Every price is "a steal". Viewings at 9 a.m., 40 people per viewing.', ad: { head: 'TE KOOP', big: 'BOVENWONING', line: '18 m² · W 495.000', foot: 'Duur & Zn · charmant', bg: '#1a1a1a', fg: '#f2c14e' } },
];
const byId = Object.fromEntries(BIZ.map((b) => [b.id, b]));
// main.js asks while it builds a house: row 'nw' (between Schmatzel and the warehouse), 'ne' (east of the parking), 's' (across the canal)
export function bizSign(row, n) { const b = BIZ.find((x) => x.row === row && x.n === n); return b ? b.sign : null; }
export function bizBySign(sign) { return BIZ.find((x) => x.sign === sign) || null; }
export function place(id, x, w) { const b = byId[id]; if (b && b.x0 == null) { b.x0 = x - w / 2; b.x1 = x + w / 2; } }
const cx = (b) => (b.x0 + b.x1) / 2;
const openToday = (b, wd) => b.open.includes(wd);
const daysText = (b) => (b.open.length === 7 ? 'every day' : `${DAYS.filter((_, i) => b.open.includes(i)).join(' ')}`);

// one advertisement as HTML (map card, the paper) or as a poster canvas (the plakzuilen)
export function adHTML(b, small) {
  const a = b.ad;
  return `<div class="bz-ad${small ? ' sm' : ''}" style="background:${a.bg};color:${a.fg};border-color:${a.fg}"><span class="bz-adl">${logoSVG(b.id, small ? 40 : 58)}</span><div><i>${a.head}</i><b>${a.big}</b><span>${a.line}</span><small>${a.foot}</small></div></div>`;
}
function posterDraw(g, x, y, w, h, b, img) {
  const a = b.ad; g.fillStyle = a.bg; g.fillRect(x, y, w, h); g.fillStyle = a.fg; g.fillRect(x + 6, y + 6, w - 12, 5); g.fillRect(x + 6, y + h - 11, w - 12, 5);
  g.textAlign = 'center'; const fit = (t, px, max, wt = 900) => { let s = px; g.font = `${wt} ${s}px Arial Black, Arial`; while (g.measureText(t).width > max && s > 8) { s -= 2; g.font = `${wt} ${s}px Arial Black, Arial`; } };
  const L = Math.min(w * 0.46, h * 0.3); if (img) g.drawImage(img, x + w / 2 - L / 2, y + 18, L, L); // the badge on top
  const t0 = img ? y + 18 + L : y + 10, H = y + h - t0;
  g.fillStyle = a.fg; fit(a.head, 20, w - 20); g.fillText(a.head, x + w / 2, t0 + H * 0.17);
  fit(a.big, 44, w - 16); g.fillText(a.big, x + w / 2, t0 + H * 0.46);
  g.globalAlpha = 0.85; g.fillRect(x + w * 0.25, t0 + H * 0.54, w * 0.5, 3); g.globalAlpha = 1;
  fit(a.line, 19, w - 18, 700); g.fillText(a.line, x + w / 2, t0 + H * 0.72);
  fit(a.foot, 13, w - 18, 700); g.fillText(a.foot, x + w / 2, y + h - 22);
}

export function createBuurt(deps) {
  const { THREE, scene, state, player } = deps;
  const S = () => { const s = state.buurt && typeof state.buurt === 'object' ? state.buurt : (state.buurt = {}); return s; };
  const wd = () => (deps.world ? deps.world().cal().wd : 0);

  // ---------------------------------------------------------------- plakzuilen: green poster columns on the canal pavement
  const COLS = [{ x: -42, ads: ['schmatzel', 'kapsalon', 'club', 'bloem'] }, { x: 21, ads: ['eddy', 'avond', 'bakker', 'bel'] }, { x: 44, ads: ['spasibo', 'dealer', 'reis', 'bitterbal'] }];
  const FZ = deps.far.front, Z = deps.z, RC0 = deps.rc; // FZ: the shop fronts across the canal; // the pavement line the columns stand on, the road's centre line
  const green = new THREE.MeshStandardMaterial({ color: 0x1f4a32, roughness: 0.55, metalness: 0.25 });
  const zuilen = COLS.map((c) => {
    const g = new THREE.Group(); g.position.set(c.x, 0, Z); scene.add(g);
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 360; const ctx = cv.getContext('2d');
    ctx.fillStyle = '#e8e2d0'; ctx.fillRect(0, 0, 1024, 360);
    const paint = (im) => { ctx.fillStyle = '#e8e2d0'; ctx.fillRect(0, 0, 1024, 360); c.ads.forEach((id, i) => posterDraw(ctx, i * 256 + 6, 8, 244, 344, byId[id], im && im[id])); };
    paint(null);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
    logoImages().then((im) => { paint(im); tex.needsUpdate = true; });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 1.62, 32, 1, true), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 })); band.position.y = 1.55; band.castShadow = true; g.add(band);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.56, 0.7, 24), green); foot.position.y = 0.35; g.add(foot);
    for (const y of [0.72, 2.38]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 6, 28), green); r.rotation.x = Math.PI / 2; r.position.y = y; g.add(r); }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.5, 0.18, 24), green); cap.position.y = 2.5; g.add(cap);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), green); dome.scale.y = 0.6; dome.position.y = 2.58; g.add(dome);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 8), green); tip.position.y = 2.95; g.add(tip);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    if (deps.solid) deps.solid(c.x - 0.55, c.x + 0.55, Z - 0.55, Z + 0.55);
    return { ...c, g };
  });
  zuilen.forEach((c) => deps.addInteract({ pos: () => new THREE.Vector3(c.x, 0, Z - 0.6), r: 1.5, enabled: () => !deps.busy(), label: () => 'Plakzuil · read the posters', act: () => readPosters(c) }));
  function readPosters(c) {
    const list = c.ads.map((id) => byId[id]);
    deps.choice('Plakzuil', `<div class="bz-ads">${list.map((b) => adHTML(b, true)).join('')}</div><small>Posters for the businesses on the block. The buurtkaart shows where they are.</small>`, ['Open the buurtkaart', 'Walk on'], (k) => { if (k === 0) open(); });
  }
  // the plattegrond: a map board by the zebra crossing
  const BOARD = { x: -14.5 };
  {
    const g = new THREE.Group(); g.position.set(BOARD.x, 0, Z); scene.add(g);
    const post = new THREE.MeshStandardMaterial({ color: 0x2a2e34, roughness: 0.5, metalness: 0.5 });
    for (const x of [-0.75, 0.75]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), post); p.position.set(x, 1.1, 0); g.add(p); }
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 320; const c = cv.getContext('2d');
    drawBoard(c, 512, 320);
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.06, 0.06), [post, post, post, post, new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 })]);
    face.position.y = 1.6; face.rotation.y = Math.PI; g.add(face); // the map faces the street
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.24), post); roof.position.y = 2.18; g.add(roof);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    if (deps.solid) deps.solid(BOARD.x - 0.9, BOARD.x + 0.9, Z - 0.2, Z + 0.2);
    deps.addInteract({ pos: () => new THREE.Vector3(BOARD.x, 0, Z - 0.7), r: 1.5, enabled: () => !deps.busy(), label: () => 'Plattegrond · buurtkaart', act: () => open() });
  }
  function drawBoard(c, W, H) { // a simple painted version of the map for the board itself
    c.fillStyle = '#f4f0e4'; c.fillRect(0, 0, W, H); c.fillStyle = '#1f4a32'; c.fillRect(0, 0, W, 40);
    c.fillStyle = '#fff'; c.font = '900 24px Arial'; c.textAlign = 'left'; c.fillText('KIPKRUIDENKWARTIER · PLATTEGROND', 14, 28);
    const X = (x) => ((x + 72) / 158) * W, Zy = (z) => 40 + ((z + 20) / 55) * (H - 40);
    c.fillStyle = '#9a9a9a'; c.fillRect(0, Zy(RC0 - 3), W, Zy(RC0 + 3) - Zy(RC0 - 3));
    c.fillStyle = '#6ab0d8'; c.fillRect(0, Zy(deps.canal[0]), W, Zy(deps.canal[1]) - Zy(deps.canal[0]));
    c.fillStyle = '#c9c2b0'; for (const b of deps.bridges) c.fillRect(X(b.x0), Zy(deps.canal[0]), X(b.x1) - X(b.x0), Zy(deps.canal[1]) - Zy(deps.canal[0]));
    for (const b of BIZ) if (b.x0 != null) { c.fillStyle = KINDS[b.kind].col; const z0 = b.side === 'n' ? -15.5 : FZ; c.fillRect(X(b.x0) + 1, Zy(z0), X(b.x1) - X(b.x0) - 2, Zy(z0 + 8.5) - Zy(z0)); }
    c.fillStyle = '#e8202a'; c.beginPath(); c.arc(X(BOARD.x), Zy(Z), 8, 0, 7); c.fill(); c.fillStyle = '#111'; c.font = '700 16px Arial'; c.fillText('U bent hier', X(BOARD.x) + 12, Zy(Z) + 6);
  }

  // uithangborden: every business on the warehouse side hangs its badge over the pavement, by the corner of its front
  {
    const arm = new THREE.MeshStandardMaterial({ color: 0x1c1c20, roughness: 0.5, metalness: 0.6 }), disc = new THREE.PlaneGeometry(1.2, 1.2); // every sign has its own outline, so the board is the logo itself
    for (const b of BIZ) {
      if (b.x0 == null || b.id === 'club' || b.id === 'dealer') continue;
      const far = b.side === 's', fz = far ? FZ : b.id === 'eddy' ? -7 : -6.5, x = b.x1 - 0.85, g = new THREE.Group(); g.position.set(x, 0, fz); if (far) g.rotation.y = Math.PI; scene.add(g);
      const a1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 1.0), arm); a1.position.set(0, 4.42, 0.5); g.add(a1);
      const a2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.18, 0.03), arm); a2.position.set(0, 4.32, 0.9); g.add(a2);
      const cv = document.createElement('canvas'); cv.width = cv.height = 256; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(disc, new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, transparent: true, alphaTest: 0.4 })); m.position.set(0, 3.68, 0.9); g.add(m); // across the canal the camera swings round to face the shops, so the board reads the right way there too
      logoImages().then((im) => { if (im[b.id]) { cv.getContext('2d').drawImage(im[b.id], 0, 0, 256, 256); t.needsUpdate = true; } });
      b.board = m;
    }
  }
  // lit ad panels on the canal pavement: a different business every day on each side
  const PANELS = [{ x: -31, k: 0 }, { x: 34, k: 9 }].map((pn) => {
    const g = new THREE.Group(); g.position.set(pn.x, 0, Z); scene.add(g);
    const fr = new THREE.MeshStandardMaterial({ color: 0x2a2e34, roughness: 0.45, metalness: 0.6 });
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.16), fr); foot.position.y = 0.25; g.add(foot);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.9, 0.16), fr); frame.position.y = 1.45; frame.castShadow = true; g.add(frame);
    const faces = [0, 1].map((side) => {
      const cv = document.createElement('canvas'); cv.width = 256; cv.height = 384; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.14, 1.74), new THREE.MeshBasicMaterial({ map: t })); m.position.set(0, 1.45, side ? -0.085 : 0.085); m.rotation.y = side ? Math.PI : 0; g.add(m);
      return { cv, t };
    });
    if (deps.solid) deps.solid(pn.x - 0.7, pn.x + 0.7, Z - 0.15, Z + 0.15);
    return { ...pn, faces, day: -1 };
  });
  function panels() { // repaint when the market day changes
    const d = deps.world ? deps.world().cal().d : 1;
    for (const pn of PANELS) {
      if (pn.day === d) continue; pn.day = d;
      logoImages().then((im) => pn.faces.forEach((f, i) => { const b = BIZ[(d * 3 + pn.k + i * 5) % BIZ.length]; posterDraw(f.cv.getContext('2d'), 0, 0, 256, 384, b, im[b.id]); f.t.needsUpdate = true; }));
    }
  }

  // ---------------------------------------------------------------- route beacon
  const beacon = new THREE.Group(); beacon.visible = false; scene.add(beacon);
  { const m = new THREE.MeshBasicMaterial({ color: 0xffc83a, transparent: true, opacity: 0.45, depthWrite: false, fog: false });
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.6, 9, 16, 1, true), m); col.position.y = 4.5; beacon.add(col);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.05, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc83a, transparent: true, opacity: 0.8, fog: false })); ring.position.y = 0.06; beacon.add(ring);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), new THREE.MeshBasicMaterial({ color: 0xffd36b, fog: false })); arrow.rotation.x = Math.PI; arrow.position.y = 2.6; beacon.add(arrow); beacon.userData.arrow = arrow; }
  let route = null;
  function setRoute(id) {
    const b = byId[id]; if (!b || b.x0 == null) return;
    const x = Math.max(deps.walk.x0 + 1, Math.min(deps.walk.x1 - 1, cx(b)));
    route = { id, x, z: b.side === 'n' ? -5.4 : FZ - 1.3 }; beacon.position.set(route.x, 0, route.z); beacon.visible = true;
    deps.toast('ROUTE', `${b.name}: follow the yellow light.${b.side === 's' ? ' It is across the canal: take the bridge by your parking or the white ophaalbrug at the east end.' : ''}`, 2.6);
  }
  function update(dt) {
    panels();
    if (!route) return;
    const show = !deps.busy() && !deps.indoors(); beacon.visible = show;
    const t = performance.now() / 1000; beacon.userData.arrow.position.y = 2.6 + Math.sin(t * 3) * 0.25; beacon.userData.arrow.rotation.y = t * 1.5;
    if (show && Math.hypot(player.position.x - route.x, player.position.z - route.z) < 2.2) { const b = byId[route.id]; route = null; beacon.visible = false; deps.toast(b.name.toUpperCase(), openToday(b, wd()) ? `Open today · ${b.hours}` : `Closed today · open ${daysText(b)}`, 2.4); deps.beep(880, 0.08, 'triangle', 0.04); }
  }

  // ---------------------------------------------------------------- the buurtkaart (HTML + SVG), on the PC and as an overlay on the street
  let sel = null, filt = null, liveT = null, keepX = null; // keepX: the map's scroll, kept while you click around
  function svg() {
    const H = deps.houses(), now = wd();
    const R = (x0, z0, x1, z1, fill, extra = '') => `<rect x="${x0}" y="${z0}" width="${x1 - x0}" height="${z1 - z0}" fill="${fill}" ${extra}/>`;
    let s = `<svg class="bz-map" viewBox="-72 -20 158 55" preserveAspectRatio="xMidYMid meet">`;
    s += `<defs><linearGradient id="bzw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc4e8"/><stop offset="1" stop-color="#4a98c8"/></linearGradient></defs>`;
    s += R(-72, -20, 86, 35, '#ece6d6');
    s += R(-72, -7, 86, RC0 - 5.2, '#d8d2c4') + R(-72, RC0 - 5, 86, RC0 - 3, '#b8b4ac') + R(-72, RC0 - 3, 86, RC0 + 3, '#6a6c70') + R(-72, RC0 + 3, 86, RC0 + 5, '#b8b4ac');
    s += R(-72, RC0 + 5.2, 86, RC0 + 7.6, '#c86a5a') + R(-72, RC0 + 7.6, 86, RC0 + 10.9, '#d8d2c4') + R(-72, deps.canal[0], 86, deps.canal[1], 'url(#bzw)') + R(-72, deps.canal[1], 86, FZ, '#c8a090');
    for (const b of deps.bridges) s += R(b.x0, deps.canal[0] - 0.3, b.x1, deps.canal[1] + 0.3, '#d8d0bc', 'stroke="#7a7468" stroke-width="0.25"') + `<text x="${(b.x0 + b.x1) / 2}" y="${(deps.canal[0] + deps.canal[1]) / 2 + 0.4}" text-anchor="middle" font-size="1.05" fill="#4a463c" transform="rotate(-90 ${(b.x0 + b.x1) / 2} ${(deps.canal[0] + deps.canal[1]) / 2})">${b === deps.bridges[0] ? 'brug' : 'ophaalbrug'}</text>`;
    for (let x = -70; x < 86; x += 4) s += R(x, RC0 - 0.08, x + 2, RC0 + 0.08, '#fff');
    for (let i = 0; i < 6; i++) s += R(-19.6, RC0 - 2.9 + i, -16.4, RC0 - 2.5 + i, '#f4f4f4');
    for (const h of H) s += R(h.x - h.w / 2 + 0.15, h.z - h.d / 2, h.x + h.w / 2 - 0.15, h.z + h.d / 2, '#c9bfae', 'rx="0.4"');
    s += R(1.15, -7, 9.5, -3.4, '#a8a4a0'); // Eddy's parking
    for (const b of BIZ) {
      if (b.x0 == null) continue; const k = KINDS[b.kind], z0 = b.side === 'n' ? (b.id === 'eddy' ? -19 : -15.5) : FZ, z1 = b.side === 'n' ? -6.5 : FZ + 8, x = cx(b), dim = filt && filt !== b.kind;
      const op = openToday(b, now);
      s += `<g class="bz-b${sel === b.id ? ' on' : ''}" data-b="${b.id}" opacity="${dim ? 0.25 : 1}"><rect x="${b.x0 + 0.2}" y="${z0}" width="${b.x1 - b.x0 - 0.4}" height="${z1 - z0}" rx="0.6" fill="${k.col}" stroke="#fff" stroke-width="${sel === b.id ? 0.6 : 0.25}"/>`;
      const nm = b.x1 - b.x0 < 9 && b.short ? b.short : b.name, wds = nm.split(' '), narrow = b.x1 - b.x0 < 9 && nm.length > 9, half = Math.ceil(wds.length / 2), lines = narrow ? [wds.slice(0, half).join(' '), wds.slice(half).join(' ')] : [nm];
      const L = Math.min(4.8, b.x1 - b.x0 - 1), fs = narrow ? 1.2 : 1.5, ty = z0 + L + 2.1;
      s += logoSVG(b.id, 0, `x="${x - L / 2}" y="${z0 + 0.5}" width="${L}" height="${L}"`);
      s += `<text class="bz-l" x="${x}" y="${ty}" text-anchor="middle" font-size="${fs}">${lines.map((l, i) => `<tspan x="${x}" dy="${i ? fs * 1.15 : 0}">${l}</tspan>`).join('')}</text>`;
      s += `<circle cx="${b.x1 - 1.1}" cy="${z0 + 1.1}" r="0.6" fill="${op ? '#3ad04a' : '#e8302a'}" stroke="#fff" stroke-width="0.22"><title>${op ? 'open today' : 'closed today'}</title></circle>`;
      s += '</g>';
    }
    for (const c of COLS) s += `<circle cx="${c.x}" cy="${Z}" r="0.8" fill="#1f4a32" stroke="#fff" stroke-width="0.2"><title>Plakzuil</title></circle>`;
    s += `<rect x="${BOARD.x - 0.9}" y="${Z - 0.3}" width="1.8" height="0.6" fill="#2a2e34"><title>Plattegrond</title></rect>`;
    if (route) s += `<circle cx="${route.x}" cy="${route.z}" r="1.4" fill="none" stroke="#ffc83a" stroke-width="0.45" class="bz-rt"/>`;
    s += `<g id="bzme"><circle r="1.3" fill="#e8202a" stroke="#fff" stroke-width="0.35"/><text y="-1.9" text-anchor="middle" font-size="1.3" class="bz-me">Eddy</text></g>`;
    s += `<text x="-70.5" y="16.9" font-size="1.4" fill="#e8f6ff" font-style="italic">Kipkruidengracht</text><text x="60" y="${FZ - 2}" font-size="1.2" fill="#6a3a2a">Kipkruidenkade</text><text x="60" y="${RC0 + 0.9}" font-size="1.2" fill="#e8e8e8">Kruidenstraat</text>`;
    return s + '</svg>';
  }
  function cardHTML() {
    const b = sel && byId[sel];
    if (!b) return `<div class="bz-card bz-hint"><b>Kipkruidenkwartier</b><p>${BIZ.length} businesses on the block. Click one for its ad, who runs it and whether it is open today, then set a route.</p><p class="bz-dim">Today is ${deps.world ? deps.world().cal().wdName : ''}.</p></div>`;
    const op = openToday(b, wd());
    return `<div class="bz-card"><span class="bz-big">${logoSVG(b.id, 86)}</span><div class="bz-kind" style="background:${KINDS[b.kind].col}">${KINDS[b.kind].icon} ${KINDS[b.kind].name}</div><h3>${b.name}</h3>
      <p><b>Run by</b> ${b.owner}<br><b>${op ? '<span class="bz-op">Open today</span>' : '<span class="bz-sh">Closed today</span>'}</b> · ${b.hours}${b.open.length < 7 ? ` (${daysText(b)})` : ''}</p>${adHTML(b)}<p>${b.blurb}</p>
      <button class="b95" data-route="${b.id}">${route && route.id === b.id ? 'Route set ✓' : 'Set route'}</button></div>`;
  }
  function html() {
    return `<div class="bz"><div class="bz-top"><b>Buurtkaart · Kipkruidenkwartier</b><span class="bz-chips">${Object.entries(KINDS).map(([k, v]) => `<button class="bz-chip${filt === k ? ' on' : ''}" data-f="${k}" style="--c:${v.col}">${v.icon} ${v.name}</button>`).join('')}</span></div>
      <div class="bz-body"><div class="bz-mapw">${svg()}</div>${cardHTML()}</div>
      <div class="bz-gal"><b>Logo's van de buurt</b> <span class="bz-dim">green dot: open today · red: closed</span><div>${BIZ.filter((b) => !filt || filt === b.kind).map((b) => `<button class="bz-gi${sel === b.id ? ' on' : ''}" data-b="${b.id}" title="${b.name}">${logoSVG(b.id, 54)}<span>${b.short || b.name}</span><i style="background:${openToday(b, wd()) ? '#3ad04a' : '#e8302a'}"></i></button>`).join('')}</div></div></div>`;
  }
  function bind(root, rerender) {
    root.querySelectorAll('[data-b]').forEach((g) => g.addEventListener('click', () => { sel = g.dataset.b; deps.beep(660, 0.04, 'triangle', 0.03); rerender(); }));
    root.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => { filt = filt === b.dataset.f ? null : b.dataset.f; rerender(); });
    root.querySelectorAll('[data-route]').forEach((b) => b.onclick = () => { setRoute(b.dataset.route); rerender(); if (overlay.style.display === 'flex') setTimeout(close, 500); });
    clearInterval(liveT); const me = root.querySelector('#bzme');
    const tick = () => { if (!me.isConnected) { clearInterval(liveT); return; } me.setAttribute('transform', `translate(${player.position.x.toFixed(2)} ${player.position.z.toFixed(2)})`); };
    tick(); liveT = setInterval(tick, 250);
    const mw = root.querySelector('.bz-mapw'); if (mw) { if (keepX == null) { const fx = (player.position.x + 72) / 158; keepX = Math.max(0, fx * mw.scrollWidth - mw.clientWidth / 2); } mw.scrollLeft = keepX; mw.addEventListener('scroll', () => { keepX = mw.scrollLeft; }); }
    S().seen = true;
  }
  // the street overlay (an Aero glass window, no PC boot needed)
  const overlay = document.createElement('div'); overlay.id = 'bzov';
  overlay.innerHTML = '<div class="bz-win"><div class="bz-tb"><span>🗺️ Plattegrond · Kipkruidenkwartier</span><button class="bz-x" title="Close">×</button></div><div class="bz-in"></div></div>';
  document.body.appendChild(overlay);
  const inner = overlay.querySelector('.bz-in');
  overlay.querySelector('.bz-x').onclick = () => close();
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  addEventListener('keydown', (e) => { if (overlay.style.display === 'flex' && (e.code === 'Escape' || e.code === 'KeyE')) { e.stopPropagation(); close(); } }, true);
  const render = () => { inner.innerHTML = html(); bind(inner, render); };
  function open() { keepX = null; if (deps.tip) deps.tip('buurt'); state.inPC = true; overlay.style.display = 'flex'; render(); deps.beep(700, 0.05, 'triangle', 0.03); }
  function close() { if (overlay.style.display !== 'flex') return; overlay.style.display = 'none'; clearInterval(liveT); state.inPC = false; }
  const isOpen = () => overlay.style.display === 'flex';

  // today's ad in the paper (a different business every day)
  const paperAd = (d) => adHTML(BIZ[(d * 5 + 3) % BIZ.length]) + `<small class="kk-dim">${BIZ[(d * 5 + 3) % BIZ.length].name} · ${BIZ[(d * 5 + 3) % BIZ.length].hours}</small>`;

  if (!document.getElementById('bzcss')) {
    const css = document.createElement('style'); css.id = 'bzcss';
    css.textContent = `.bz-ad{display:flex;align-items:center;justify-content:center;gap:8px;border:2px solid;border-radius:6px;padding:7px 8px;text-align:center;font-family:'Arial Black',Arial,sans-serif;margin:6px 0;box-shadow:inset 0 0 0 3px rgba(0,0,0,.12),0 2px 6px rgba(0,0,0,.2)}
.bz-ad i{display:block;font-style:normal;font-size:11px;letter-spacing:1px;opacity:.9}.bz-ad b{display:block;font-size:22px;line-height:1.05;margin:3px 0}.bz-ad span{display:block;font:700 12px Arial,sans-serif}.bz-ad small{display:block;font:700 10px Arial,sans-serif;opacity:.85;margin-top:3px}
.bz-adl{display:block;flex:none;line-height:0}.bz-ad.sm .bz-adl{display:none}.bz-ad.sm{display:inline-block;width:132px;vertical-align:top;margin:3px;padding:5px}.bz-ad.sm b{font-size:15px}.bz-ads{text-align:center;margin-bottom:4px}
.bz{font-family:inherit}.bz-top{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin-bottom:6px}.bz-chips{display:flex;flex-wrap:wrap;gap:4px}
.bz-chip{border:1px solid var(--c);background:linear-gradient(#fff,#e8eef4);border-radius:12px;padding:2px 9px;font-size:12px;cursor:pointer}.bz-chip.on{background:var(--c);color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.5)}
.bz-body{display:grid;grid-template-columns:1fr 240px;gap:10px;align-items:start}.bz-mapw{background:linear-gradient(#f8fbff,#e2ecf4);border:1px solid #9ab4cc;border-radius:8px;padding:4px;overflow:auto}
.bz-map{width:1350px;max-width:none;display:block}.bz-b{cursor:pointer}.bz-b:hover rect{filter:brightness(1.15)}.bz-b.on rect{filter:drop-shadow(0 0 0.8px #fff)}.bz-l{fill:#fff;font-family:Arial;font-weight:700;paint-order:stroke;stroke:rgba(0,0,0,.55);stroke-width:.3px}
.bz-cl{fill:#ffd8d8;font-family:Arial;font-style:italic;font-weight:700;paint-order:stroke;stroke:rgba(80,0,0,.6);stroke-width:.25px}.bz-o{fill:#eaffea;font-family:Arial;font-weight:700;paint-order:stroke;stroke:rgba(0,60,0,.5);stroke-width:.25px}.bz-me{fill:#fff;font-family:Arial;font-weight:900;paint-order:stroke;stroke:#a00;stroke-width:.35px}.bz-rt{animation:bzp 1s ease-in-out infinite alternate}@keyframes bzp{to{stroke-width:.15}}
.bz-card{background:linear-gradient(#ffffff,#eef4fa);border:1px solid #9ab4cc;border-radius:8px;padding:8px 10px;font-size:13px}.bz-card h3{margin:4px 0 4px;font-size:16px}.bz-card p{margin:4px 0}.bz-kind{display:inline-block;color:#fff;border-radius:10px;padding:1px 8px;font-size:11px;font-weight:700}
.bz-big{float:right;margin:0 0 4px 6px;line-height:0;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}.bz-gal{margin-top:8px;background:linear-gradient(#fff,#eef4fa);border:1px solid #9ab4cc;border-radius:8px;padding:6px 8px;font-size:13px}.bz-gal>div{display:flex;flex-wrap:wrap;gap:4px;margin-top:5px}
.bz-gi{position:relative;width:74px;border:1px solid transparent;border-radius:8px;background:none;padding:4px 2px;cursor:pointer;font:inherit}.bz-gi:hover{background:rgba(90,160,232,.15);border-color:#9ab4cc}.bz-gi.on{background:rgba(90,160,232,.28);border-color:#3a7bd5}.bz-gi span{display:block;font-size:10.5px;line-height:1.1;margin-top:2px}.bz-gi i{position:absolute;right:8px;top:4px;width:10px;height:10px;border-radius:50%;border:1.5px solid #fff;box-shadow:0 0 2px rgba(0,0,0,.5)}
.bz-op{color:#1f7a2a}.bz-sh{color:#a02020}.bz-dim{color:#678;font-size:12px}
#bzov{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(10,20,30,.35)}
.bz-win{width:min(1040px,calc(100vw - 24px));max-height:calc(100vh - 24px);overflow:auto;border-radius:10px;background:rgba(236,244,250,.94);border:1px solid rgba(255,255,255,.8);box-shadow:0 10px 40px rgba(0,0,0,.45),inset 0 1px 0 #fff}
.bz-tb{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;padding:7px 10px;background:linear-gradient(#5aa0e8,#2a6ac0);color:#fff;font-weight:700;border-radius:10px 10px 0 0;text-shadow:0 1px 1px rgba(0,0,0,.4)}
.bz-x{background:linear-gradient(#f08a7a,#c8402a);color:#fff;border:1px solid #fff;border-radius:4px;width:28px;height:22px;font-weight:900;cursor:pointer}.bz-in{padding:10px}
@media (max-width:760px){.bz-body{grid-template-columns:1fr}}`;
    document.head.appendChild(css);
  }

  return { BIZ, html, bind, open, close, isOpen, update, setRoute, paperAd, get route() { return route; } };
}
