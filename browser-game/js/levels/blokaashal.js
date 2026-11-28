// The Blokaas hall at night (2026-11-28). Tristan wanted a heist where Eddy breaks into Blokaas Specijeren's warehouse in
// Almere and gathers their recipes and supplier details without being seen; then: "overhaul and add textures and assets,
// make it interesting to move through their warehouse and office stealthily". Night only (a Nachtklus, js/heist.js).
//
// Built after Tristan's photos: a blue corrugated shed full of blue-and-orange pallet racking, big white bulk bags and
// pallets of paper sacks; a low office wing on the right.
//   lot → side door → EXPEDITIE (the dock, a forklift, the phone) → the HAL (five rack aisles, the cross aisle)
//   HAL → WEEGKAMER (Hans's scale, the mixer, the recipe folder)
//   HAL / KANTINE → GANG → KANTOOR (two desks, a window on to the hall) and ARCHIEF (ordners to the ceiling)
//   lot → glass door → KANTINE (Conny's corner, the coffee machine)
//
// What makes it a stealth level:
//   · Hans and Conny walk rounds (def.routes, js/mission.js): Hans from his desk past the racks to his scale and back,
//     counting; Conny hall → expeditie → kantine → gang, complaining. Their cones are always drawn here.
//   · the hall is dark (Hans will not pay for light); racks and double-stacked bulk bags block sight, so every aisle is cover.
//   · bewegingsmelders (def.sensors) at the dock, in the cross aisle and in the gang: run under one and a lamp comes on
//     for five seconds. Walk and it stays dark. They also light up when Hans or Conny pass: you can see them coming.
//   · the office window: from his desk Hans looks straight down the cross aisle.
//   · four things to lure them with (decorate() tasks, reusable): the radio in the hall and the phone on the dock bring
//     Conny, the coffee machine and the scale bring Hans. Hans stays at his scale a long time.
// js/mission.js reads def.docs: where each folder lies (cell coords); opts.heist.docs says which ones are still there.

const W = 43, H = 28;
const LIGHTS = [[31, 4, 0xf2e6c0, 2.2], [38, 4, 0xf2e6c0, 1.6], [34, 18.5, 0xe8d8b0, 1.5], [6, 4, 0x9ab0c8, 0.7], [21, 14, 0x9ab0c8, 0.7], [5.5, 20, 0xc8d8e0, 1.0], [20, 26, 0xd8c8a0, 1.6], [38, 26, 0xd8c8a0, 1.0]];
const SENSORS = [[18.5, 20, 3.2, 0xfff2d0, 2.4], [13, 9, 3.0, 0xfff2d0, 2.2], [31, 11.5, 2.6, 0xfff2d0, 2.2]];

// ---------- small canvas textures, shared ----------
const TEX = {};
function tex(THREE, key, w, h, draw, rep) {
  if (TEX[key]) return TEX[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); }
  return (TEX[key] = t);
}
const MATS = {};
const mat = (lam, key, o) => MATS[key] || (MATS[key] = lam(o));
const BAGS = [['FENEGRIEK', '#b8862a'], ['PAPRIKA', '#c2412d'], ['VE-TSIN', '#5a5a9a'], ['KOMIJN', '#8a6a3a'], ['KERRIE', '#d8a020'], ['ZOUT', '#6a8aa8']];
const bagTex = (THREE, i) => tex(THREE, 'bag' + i, 128, 128, (g) => {
  g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, 128, 128);
  for (let y = 0; y < 128; y += 4) { g.fillStyle = `rgba(120,120,110,${y % 8 ? 0.05 : 0.1})`; g.fillRect(0, y, 128, 1); } for (let x = 0; x < 128; x += 4) { g.fillStyle = 'rgba(120,120,110,.05)'; g.fillRect(x, 0, 1, 128); } // woven polypropylene
  g.strokeStyle = BAGS[i][1]; g.lineWidth = 5; g.strokeRect(14, 30, 100, 62);
  g.fillStyle = BAGS[i][1]; g.font = '900 19px Arial'; g.textAlign = 'center'; g.fillText(BAGS[i][0], 64, 58, 92); g.font = '700 13px Arial'; g.fillText(i === 2 ? '25 KG · NIET VERTELLEN' : '500 KG', 64, 80, 92);
  g.fillStyle = '#2a4a8a'; g.font = '700 10px Arial'; g.fillText('BLOKAAS SPECIJEREN', 64, 108);
});
const sackTex = (THREE) => tex(THREE, 'sack', 64, 64, (g) => { g.fillStyle = '#c8a878'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 16) { g.fillStyle = 'rgba(60,40,10,.3)'; g.fillRect(0, y, 64, 2); g.fillStyle = '#2a4a8a'; g.fillRect(8, y + 5, 30, 6); g.fillStyle = '#a84a2a'; g.fillRect(42, y + 5, 14, 6); } });
const ordnerTex = (THREE) => tex(THREE, 'ordner', 256, 128, (g) => {
  g.fillStyle = '#5a4a3a'; g.fillRect(0, 0, 256, 128);
  for (let r = 0; r < 3; r++) for (let x = 2; x < 254; x += 14) { const c = ['#2a5aa0', '#2a5aa0', '#2a5aa0', '#1a1a1e', '#c8302a', '#2a8a4a', '#e8a33d'][(x * 7 + r * 3) % 7]; g.fillStyle = c; g.fillRect(x, r * 42 + 4, 12, 36); g.fillStyle = '#f4f0e4'; g.fillRect(x + 2, r * 42 + 10, 8, 12); g.fillStyle = '#1a1a1e'; g.beginPath(); g.arc(x + 6, r * 42 + 32, 2.4, 0, 7); g.fill(); }
  for (let r = 1; r < 3; r++) { g.fillStyle = '#3a2e22'; g.fillRect(0, r * 42, 256, 3); }
});
const screenTex = (THREE) => tex(THREE, 'screen', 128, 96, (g) => { g.fillStyle = '#0a2a1a'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#6aff8a'; g.font = '9px monospace'; ['VOORRAAD.XLS', 'fenegriek   412,0 kg', 've-tsin      38,5 kg', 'koffie        0,4 kg', 'EDDY: TE VEEL', '> _'].forEach((t, i) => g.fillText(t, 6, 14 + i * 14)); });

export default {
  id: 'blokaashal', name: 'Blokaas Specijeren', W, H, faction: 'BLOKAAS', factionName: 'Blokaas', minimap: true,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['hal', 1, 1, 25, 16, 'epoxy'], ['weegkamer', 1, 18, 9, 22, 'tiles'], ['expeditie', 11, 18, 25, 22, 'epoxy'],
    ['kantoor', 27, 1, 41, 7, 'carpet'], ['gang', 27, 9, 34, 13, 'lino'], ['archief', 36, 9, 41, 13, 'carpet'], ['kantine', 27, 15, 41, 22, 'lino'],
    ['lot', 1, 24, 41, 27, 'paving'],
  ],
  roomNames: { hal: 'DE HAL', weegkamer: 'WEEGKAMER', expeditie: 'EXPEDITIE', kantoor: 'KANTOOR', gang: 'GANG', archief: 'ARCHIEF', kantine: 'KANTINE', lot: 'HET TERREIN' },
  layout({ carve, put, putR }) {
    carve(0, 24, 0, 27); carve(42, 24, 42, 27); // the lot runs on past the level
    putR(20, 23, 21, 23, 'D');  // lot → expeditie (the side door; the roller door stays down at night)
    putR(38, 23, 39, 23, 'D');  // lot → kantine (the glass front door)
    putR(28, 23, 36, 23, '%'); putR(40, 23, 41, 23, '%'); // the kantine windows
    carve(16, 17, 19, 17);      // expeditie ↔ hal: the open bay
    putR(4, 17, 5, 17, 'D');    // weegkamer ↔ hal
    putR(10, 20, 10, 21, 'D');  // weegkamer ↔ expeditie
    putR(26, 11, 26, 12, 'D');  // hal ↔ gang
    putR(26, 20, 26, 21, 'D');  // expeditie ↔ kantine
    putR(26, 3, 26, 5, '%');    // the office window on to the hall: Hans sees the cross aisle from his desk
    putR(30, 8, 31, 8, 'D');    // gang ↔ kantoor
    putR(35, 11, 35, 12, 'D');  // gang ↔ archief
    putR(30, 14, 31, 14, 'D');  // gang ↔ kantine
    // ---- the hall: five rack aisles north and south of the cross aisle (z 8..10), bulk bags against the walls
    for (const x of [4, 8, 12, 16, 20]) { for (let z = 2; z <= 6; z++) put(x, z, 'R'); for (let z = 12; z <= 15; z++) put(x, z, 'R'); }
    putR(1, 1, 2, 1, 'J'); put(24, 1, 'J'); put(25, 2, 'J'); putR(23, 15, 24, 15, 'J'); put(1, 16, 'J'); // double-stacked big bags: they block sight
    put(6, 8, 'U'); put(10, 10, 'U'); put(18, 8, 'U'); put(14, 10, 'g'); put(22, 10, 'g'); put(2, 10, 'g'); put(24, 6, 'U'); put(23, 12, 'g'); put(10, 16, 'g'); put(14, 1, 'U');
    put(1, 13, 'r');            // the radio, on a crate by the west wall
    // ---- weegkamer: the scale, the mixer, a steel table, sacks
    put(5, 20, 'z'); putR(8, 18, 9, 18, 'm'); putR(1, 18, 2, 18, 'w'); put(1, 22, 'g'); put(9, 22, 'g');
    // ---- expeditie: the forklift, pallets waiting to go, a standing desk with the phone
    putR(13, 19, 14, 19, 'h'); put(23, 18, 'g'); put(24, 18, 'g'); put(11, 22, 'U'); put(12, 22, 'U'); put(25, 22, 'g'); put(23, 22, 'e');
    // ---- kantoor: Hans's desk facing the window, Conny's desk, filing cabinets, the ordner wall
    putR(28, 3, 29, 3, 'd'); putR(34, 2, 35, 2, 'd'); putR(38, 1, 41, 1, 'y'); put(27, 1, 'f'); put(28, 1, 'f'); put(41, 6, 'f'); put(33, 7, 'p'); put(27, 7, 'f');
    // ---- archief: ordners to the ceiling, two aisles
    putR(36, 9, 41, 9, 'y'); putR(37, 11, 39, 11, 'y'); putR(36, 13, 40, 13, 'y');
    // ---- gang: the copier, a plant
    put(27, 9, 'x'); put(34, 9, 'p'); put(34, 13, 'f');
    // ---- kantine: the counter with the coffee machine, two tables, the fridge, Conny's armchair
    putR(27, 15, 29, 15, 'k'); put(41, 15, 'F'); putR(33, 18, 34, 19, 't'); putR(37, 20, 38, 21, 't'); put(41, 19, 'S'); put(27, 22, 'p');
    // ---- the lot: a skip and pallets for cover
    putR(3, 25, 5, 25, 'j'); put(12, 25, 'g'); put(13, 25, 'g'); put(30, 26, 'g');
  },
  furn: {
    // a big bag (FIBC) on a pallet: woven white, four lifting loops, the product printed on the side
    U: { h: 1.3, cover: true, draw: ({ THREE, box, lam, root, n, cz, x, z, OX }) => { for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5, i = (x * 3 + z + k) % BAGS.length;
      box(0.96, 0.12, 0.96, mat(lam, 'pal', { color: 0xb08a52 }), px, 0.06, cz, root, false);
      box(0.88, 1.08, 0.88, mat(lam, 'bag' + i, { map: bagTex(THREE, i) }), px, 0.66, cz, root);
      for (const [dx, dz] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]]) box(0.06, 0.2, 0.06, mat(lam, 'loop', { color: 0x3a6ab8 }), px + dx, 1.3, cz + dz, root, false); } } },
    // two big bags stacked: taller than Eddy, nobody sees over it
    J: { h: 2.4, cover: true, sight: true, draw: ({ THREE, box, lam, root, n, cz, x, z, OX }) => { for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5, i = (x + z * 2 + k) % BAGS.length;
      box(0.96, 0.12, 0.96, mat(lam, 'pal', { color: 0xb08a52 }), px, 0.06, cz, root, false);
      box(0.9, 1.08, 0.9, mat(lam, 'bag' + i, { map: bagTex(THREE, i) }), px, 0.66, cz, root);
      box(0.96, 0.1, 0.96, mat(lam, 'pal', { color: 0xb08a52 }), px, 1.25, cz, root, false);
      box(0.88, 1.04, 0.88, mat(lam, 'bag' + ((i + 2) % BAGS.length), { map: bagTex(THREE, (i + 2) % BAGS.length) }), px, 1.82, cz, root); } } },
    // a pallet of 25 kg paper sacks, five layers, shrink-wrapped
    g: { h: 0.95, cover: true, draw: ({ THREE, box, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5;
      box(0.98, 0.12, 0.98, mat(lam, 'pal', { color: 0xb08a52 }), px, 0.06, cz, root, false);
      box(0.9, 0.78, 0.9, mat(lam, 'sack', { map: sackTex(THREE) }), px, 0.51, cz, root);
      box(0.93, 0.8, 0.93, mat(lam, 'wrap', { color: 0xdfe8f0, transparent: true, opacity: 0.22 }), px, 0.51, cz, root, false); } } },
    // pallet racking like in the photo: blue uprights, orange beams, bulk bags and sacks on two levels
    R: { h: 2.6, cover: true, sight: true, draw: ({ THREE, box, lam, root, n, cz, x, z, OX }) => { for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5, i = (x + z + k) % BAGS.length;
      for (const dx of [-0.46, 0.46]) for (const dz of [-0.46, 0.46]) box(0.07, 2.6, 0.07, mat(lam, 'upr', { color: 0x2a5ab0 }), px + dx, 1.3, cz + dz, root, false);
      for (const y of [0.12, 1.36]) { for (const dx of [-0.46, 0.46]) box(0.06, 0.1, 1.0, mat(lam, 'beam', { color: 0xe8862c }), px + dx, y, cz, root, false); box(0.9, 0.04, 0.96, mat(lam, 'deck', { color: 0x9a8a6a }), px, y + 0.06, cz, root, false); }
      box(0.82, 0.98, 0.84, mat(lam, 'bag' + i, { map: bagTex(THREE, i) }), px, 0.68, cz, root);
      if ((x + z) % 3) box(0.84, 0.7, 0.86, mat(lam, 'sack', { map: sackTex(THREE) }), px, 1.8, cz, root); else box(0.8, 0.9, 0.82, mat(lam, 'bag' + ((i + 1) % BAGS.length), { map: bagTex(THREE, (i + 1) % BAGS.length) }), px, 1.9, cz, root); } } },
    // the forklift, parked for the night (two cells)
    h: { h: 1.9, cover: true, draw: ({ box, cyl, lam, root, cx, cz }) => {
      const y = mat(lam, 'fk', { color: 0xe8a020 }), d = mat(lam, 'dark', { color: 0x1e2024 });
      box(1.25, 0.55, 0.95, y, cx - 0.15, 0.5, cz, root); box(0.5, 0.5, 0.9, d, cx - 0.6, 0.95, cz, root, false); box(0.5, 0.08, 0.5, d, cx - 0.1, 0.84, cz, root, false);
      for (const dz of [-0.42, 0.42]) { box(0.06, 1.25, 0.06, d, cx + 0.25, 1.35, cz + dz, root, false); box(0.06, 1.25, 0.06, d, cx - 0.55, 1.35, cz + dz, root, false); box(0.07, 1.9, 0.07, d, cx + 0.5, 0.95, cz + dz * 0.6, root, false); box(0.85, 0.05, 0.1, mat(lam, 'steel', { color: 0x8a8e94 }), cx + 0.95, 0.08, cz + dz * 0.6, root, false); }
      box(0.9, 0.05, 0.95, d, cx - 0.15, 1.98, cz, root, false);
      for (const [dx, r] of [[0.25, 0.24], [-0.6, 0.2]]) for (const dz of [-0.48, 0.48]) { const w = cyl(r, r, 0.16, d, cx + dx, r, cz + dz, root, 12); if (w) w.rotation.x = Math.PI / 2; }
      box(0.12, 0.12, 0.12, mat(lam, 'beacon', { color: 0xff8a1c, emissive: 0x6a2a00 }), cx - 0.15, 2.07, cz, root, false); } },
    // Hans's scale: a platform scale with a display on a post, calibrated every morning at six
    z: { h: 1.1, cover: false, draw: ({ box, lam, root, cx, cz }) => {
      box(0.9, 0.1, 0.9, mat(lam, 'steel', { color: 0x8a8e94 }), cx, 0.05, cz, root, false); box(0.8, 0.03, 0.8, mat(lam, 'plate', { color: 0xc8ccd0 }), cx, 0.115, cz, root, false);
      box(0.06, 1.1, 0.06, mat(lam, 'steel', { color: 0x8a8e94 }), cx + 0.4, 0.55, cz - 0.4, root, false); box(0.3, 0.2, 0.08, mat(lam, 'dark', { color: 0x1e2024 }), cx + 0.4, 1.15, cz - 0.4, root, false);
      box(0.24, 0.1, 0.02, mat(lam, 'led', { color: 0x6aff7a, emissive: 0x2a8a3a }), cx + 0.4, 1.16, cz - 0.35, root, false); box(0.32, 0.3, 0.32, mat(lam, 'sackp', { color: 0xc8a878 }), cx - 0.1, 0.28, cz + 0.1, root); } },
    // the ribbon mixer: a stainless trough on legs, lid open
    m: { h: 1.3, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { const st = mat(lam, 'inox', { color: 0xb8bcc2 });
      box(n - 0.2, 0.7, 0.84, st, cx, 0.95, cz, root);
      for (const dx of [-n / 2 + 0.2, n / 2 - 0.2]) for (const dz of [-0.36, 0.36]) box(0.06, 0.6, 0.06, mat(lam, 'steel', { color: 0x8a8e94 }), cx + dx, 0.3, cz + dz, root, false);
      box(0.3, 0.36, 0.3, mat(lam, 'motor', { color: 0x2a5ab0 }), cx + n / 2 - 0.05, 0.9, cz, root, false); box(n - 0.3, 0.02, 0.7, mat(lam, 'fen', { color: 0xb8862a }), cx, 1.31, cz, root, false); } },
    w: { h: 0.92, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.05, 0.9, mat(lam, 'inox', { color: 0xb8bcc2 }), cx, 0.9, cz, root); for (const dx of [-n / 2 + 0.1, n / 2 - 0.1]) for (const dz of [-0.38, 0.38]) box(0.05, 0.9, 0.05, mat(lam, 'steel', { color: 0x8a8e94 }), cx + dx, 0.45, cz + dz, root, false);
      box(0.26, 0.2, 0.2, mat(lam, 'scoop', { color: 0xe8e4d8 }), cx - 0.3, 1.02, cz, root, false); box(0.34, 0.02, 0.26, mat(lam, 'paper', { color: 0xf4f0e4 }), cx + 0.3, 0.935, cz + 0.1, root, false); } },
    // a desk: beech top, a beige monitor with the stock list on it, keyboard, papers squared to the edge
    d: { h: 0.76, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz }) => {
      box(n - 0.06, 0.05, 0.92, mat(lam, 'beech', { color: 0xc8a06a }), cx, 0.74, cz, root); box(n - 0.2, 0.7, 0.05, mat(lam, 'grey', { color: 0x9a9ea2 }), cx, 0.37, cz - 0.4, root, false); box(0.42, 0.5, 0.6, mat(lam, 'grey', { color: 0x9a9ea2 }), cx + n / 2 - 0.28, 0.45, cz, root, false);
      box(0.46, 0.36, 0.34, mat(lam, 'beige', { color: 0xd8d0b8 }), cx - 0.2, 1.0, cz - 0.2, root, false); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.26), new THREE.MeshBasicMaterial({ map: screenTex(THREE) })); scr.position.set(cx - 0.2, 1.01, cz - 0.025); root.add(scr);
      box(0.4, 0.02, 0.14, mat(lam, 'beige', { color: 0xd8d0b8 }), cx - 0.2, 0.78, cz + 0.2, root, false); box(0.22, 0.03, 0.3, mat(lam, 'paper', { color: 0xf4f0e4 }), cx + 0.5, 0.78, cz + 0.1, root, false); box(0.07, 0.1, 0.07, mat(lam, 'mug', { color: 0xc8202a }), cx + 0.25, 0.81, cz - 0.2, root, false); } },
    // filing cabinet, four drawers
    f: { h: 1.35, cover: true, draw: ({ box, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { const px = OX + x + k + 0.5; box(0.86, 1.32, 0.8, mat(lam, 'cab', { color: 0x8a9096 }), px, 0.66, cz, root); for (let i = 0; i < 4; i++) { box(0.76, 0.02, 0.02, mat(lam, 'dark', { color: 0x1e2024 }), px, 0.33 * i + 0.3, cz + 0.41, root, false); box(0.16, 0.03, 0.03, mat(lam, 'plate', { color: 0xc8ccd0 }), px, 0.33 * i + 0.17, cz + 0.42, root, false); } } } },
    // ordners to the ceiling
    y: { h: 2.2, cover: true, sight: true, draw: ({ THREE, lam, root, n, cx, cz }) => { const t = ordnerTex(THREE).clone(); t.needsUpdate = true; t.wrapS = THREE.RepeatWrapping; t.repeat.set(n / 2.4, 1);
      const side = mat(lam, 'ysd', { color: 0x5a4a3a }), top = mat(lam, 'ytp', { color: 0x4a3c2e }), face = lam({ map: t });
      const b = new THREE.Mesh(new THREE.BoxGeometry(n - 0.04, 2.2, 0.7), [side, side, top, top, face, face]); b.position.set(cx, 1.1, cz); b.castShadow = true; root.add(b); } },
    // the kantine counter: sink, the coffee machine, a rack of four mugs, Conny's tissues
    k: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.04, 0.9, 0.9, mat(lam, 'kwhite', { color: 0xe8e4dc }), cx, 0.45, cz, root); box(n, 0.05, 0.96, mat(lam, 'ktop', { color: 0x5a5046 }), cx, 0.925, cz, root, false);
      box(0.5, 0.02, 0.4, mat(lam, 'inox', { color: 0xb8bcc2 }), cx - n / 2 + 0.6, 0.955, cz, root, false);
      box(0.32, 0.42, 0.3, mat(lam, 'dark', { color: 0x1e2024 }), cx + n / 2 - 0.5, 1.16, cz - 0.15, root, false); box(0.04, 0.04, 0.02, mat(lam, 'led', { color: 0x6aff7a, emissive: 0x2a8a3a }), cx + n / 2 - 0.42, 1.3, cz + 0.01, root, false);
      for (let i = 0; i < 4; i++) box(0.08, 0.1, 0.08, mat(lam, 'mug' + (i % 2), { color: i % 2 ? 0xf4f0e4 : 0xc8202a }), cx - 0.3 + i * 0.16, 1.0, cz - 0.2, root, false);
      box(0.16, 0.1, 0.12, mat(lam, 'tissue', { color: 0xe8a8c0 }), cx + 0.2, 1.0, cz + 0.15, root, false); } },
    // a kantine table with chairs (2 x 2 cells: each row draws its half)
    t: { h: 0.76, cover: false, draw: ({ box, lam, root, n, cx, cz, z }) => { const lo = z % 2 === 0; box(n - 0.1, 0.05, 1.0, mat(lam, 'ttop', { color: 0xe8e0d0 }), cx, 0.74, cz, root); for (const dx of [-n / 2 + 0.15, n / 2 - 0.15]) box(0.06, 0.72, 0.06, mat(lam, 'steel', { color: 0x8a8e94 }), cx + dx, 0.36, cz + (lo ? -0.3 : 0.3), root, false); } },
    // the radio: an old portable on a crate
    r: { h: 0.9, cover: false, draw: ({ box, lam, root, cx, cz }) => { box(0.7, 0.6, 0.7, mat(lam, 'crate', { color: 0x9a7448 }), cx, 0.3, cz, root); box(0.46, 0.26, 0.16, mat(lam, 'radio', { color: 0x3a3c40 }), cx, 0.73, cz, root, false); box(0.16, 0.16, 0.02, mat(lam, 'plate', { color: 0xc8ccd0 }), cx - 0.12, 0.73, cz + 0.085, root, false); box(0.02, 0.4, 0.02, mat(lam, 'plate', { color: 0xc8ccd0 }), cx + 0.2, 1.0, cz, root, false); } },
    // the dock desk: a standing desk with the phone and the clipboard
    e: { h: 1.1, cover: false, draw: ({ box, lam, root, cx, cz }) => { box(0.8, 0.05, 0.6, mat(lam, 'beech', { color: 0xc8a06a }), cx, 1.08, cz, root); for (const dx of [-0.35, 0.35]) box(0.05, 1.06, 0.5, mat(lam, 'grey', { color: 0x9a9ea2 }), cx + dx, 0.53, cz, root, false);
      box(0.22, 0.07, 0.2, mat(lam, 'phone', { color: 0xd8d0b8 }), cx - 0.2, 1.14, cz, root, false); box(0.2, 0.04, 0.06, mat(lam, 'phone', { color: 0xd8d0b8 }), cx - 0.2, 1.2, cz - 0.04, root, false); box(0.24, 0.02, 0.32, mat(lam, 'clip', { color: 0x8a5a2a }), cx + 0.2, 1.12, cz, root, false); } },
    // the copier in the gang
    x: { h: 1.1, cover: true, draw: ({ box, lam, root, cx, cz }) => { box(0.8, 1.0, 0.75, mat(lam, 'beige', { color: 0xd8d0b8 }), cx, 0.5, cz, root); box(0.84, 0.08, 0.6, mat(lam, 'grey', { color: 0x9a9ea2 }), cx, 1.05, cz, root, false); } },
    // the skip on the lot
    j: { h: 1.3, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.1, 1.2, 0.95, mat(lam, 'skip', { color: 0x2a6a4a }), cx, 0.65, cz, root); box(n, 0.08, 1.0, mat(lam, 'dark', { color: 0x1e2024 }), cx, 1.28, cz, root, false); } },
    S: { color: 0x9a5a7a }, F: { color: 0xe8e8e0 },
  },
  rackGoods: [0xf4f2ec, 0xe8d8b8, 0xd8c8a8],
  noDress: true, // the hall has its own stock: no generic spice sacks on top
  floors: {
    // sealed warehouse floor: grey-green epoxy, tyre marks, a few spice stains
    epoxy: (g) => { g.fillStyle = '#6e7a78'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 260; i++) { const v = i % 2 ? 255 : 0; g.fillStyle = `rgba(${v},${v},${v},${Math.random() * 0.05})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 2); }
      g.strokeStyle = 'rgba(20,20,20,.22)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-4, 20); g.bezierCurveTo(20, 10, 40, 40, 70, 30); g.stroke();
      g.fillStyle = 'rgba(184,134,42,.28)'; g.beginPath(); g.ellipse(46, 50, 7, 4, 0.4, 0, 7); g.fill(); g.fillStyle = 'rgba(194,65,45,.2)'; g.beginPath(); g.ellipse(12, 44, 4, 3, 0, 0, 7); g.fill(); },
    // office carpet tiles, the cheapest grey
    carpet: (g) => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { g.fillStyle = (x + y) % 2 ? '#5a6470' : '#55606c'; g.fillRect(x * 32, y * 32, 32, 32); } for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.06})`; g.fillRect(Math.random() * 64, Math.random() * 64, 1, 2); } g.fillStyle = 'rgba(60,40,20,.25)'; g.beginPath(); g.ellipse(20, 40, 5, 4, 0, 0, 7); g.fill(); },
    // speckled lino, 1994
    lino: (g) => { g.fillStyle = '#c8bca0'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 380; i++) { g.fillStyle = ['rgba(120,100,70,.35)', 'rgba(240,230,210,.5)', 'rgba(90,110,120,.3)'][i % 3]; g.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } g.strokeStyle = 'rgba(90,80,60,.35)'; g.lineWidth = 1; g.strokeRect(0.5, 0.5, 63, 63); },
  },
  floorRep: { epoxy: 3.2, carpet: 1.0, lino: 1.6, tiles: 1.2, paving: 1.6 },
  hallCells: [[20, 23], [21, 23], [38, 23], [39, 23], [16, 17], [17, 17], [18, 17], [19, 17]],
  doorSigns: { '20,23': 'PERSONEEL', '26,11': 'KANTOOR', '4,17': 'WEEGKAMER', '35,11': 'ARCHIEF', '30,14': 'KANTINE', '38,23': 'BLOKAAS' },
  neon: { hal: 0x5a6a78, weegkamer: 0xb8c8d0, expeditie: 0x5a6a78, kantoor: 0xf2e6c0, gang: 0x8a8a80, archief: 0x6a6a60, kantine: 0xe8d8b0, lot: 0x3a3a40 },
  lights: LIGHTS, sensors: SENSORS,
  mood: { bg: 0x0a0e18, fogNear: 30, fogFar: 80, hemi: 1.15, sun: 0.55, sky: 0xa8b8d8, ground: 0x4a5058, wall: 0x4a6a96, cap: 0xc8ccd0, under: 0x24282c },
  van: { park: [10, 4.6], rot: Math.PI, from: W + 14, exit: [10.6, 3.0], solid: [6.7, 12.8, 3.45, 5.75] }, // world: on the road, lights off
  start: [18.5, -1.6],           // world: on the lot, by the side door
  bounds: [0.5, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [18, 26.5],      // cell: the lot
  // the folders (cell coords): opts.heist.docs picks which are still there tonight
  docs: { recepten: [2.5, 20.5], leveranciers: [40.5, 11.5], klanten: [40.5, 3.5], bestellingen: [40.5, 21.5], logboek: [31.5, 5.5] },
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, type
    [30.5, 4.5, 'fists', -Math.PI / 2, 'kantoor', false, 'hans'],
    [13.5, 9.5, 'fists', Math.PI / 2, 'hal', false, 'conny'],
  ],
  // the rounds: [cell x, cell z, seconds to stand there, the way they look (null: about), what they mutter]
  routes: {
    hans: [
      [30.5, 4.5, 11, -Math.PI / 2, ['Vierhonderdtwaalf komma nul kilo fenegriek. Klopt.', 'Tweehonderdveertien werkdagen. Tweehonderddertien na vandaag.', 'Hij bestelt te veel. Dat staat niet in artikel 4.']],
      [30.5, 11.5, 1, null], [22.5, 9.5, 4, Math.PI, ['Rek 5: zesentwintig zakken. Klopt.', 'Het licht is uit. Goed. Licht kost geld.']],
      [10.5, 9.2, 4, 0, ['Rek 2: vierentwintig zakken. Er waren er vierentwintig.', 'Pallet 14 staat twee centimeter scheef.']],
      [5.5, 19.2, 7, 0, ['Kalibreren. Nul komma nul nul. Goed.', 'Eén weegschaal is genoeg. Dat zeg ik al sinds 1998.']],
      [14.5, 9.2, 2, null], [30.5, 11.5, 1, null], [37.5, 5.5, 5, Math.PI, ['Ordner 4 staat recht. Ordner 5 staat recht.', 'Alles op alfabet. Zo hoort het.']],
    ],
    conny: [
      [13.5, 9.5, 4, Math.PI / 2, ['Wie tilt hier alles? Ik. Met mijn rug.', 'Altijd donker hier. Voor de stroomrekening. Mijn knie weet er alles van.']],
      [18.5, 20.5, 6, 0, ['Morgen wéér een bestelling van die Eddy. Veel te veel.', 'Niemand die vraagt of ík het red.']],
      [33.5, 16.6, 9, 0, ['Eén kopje thee. Eén. Dat gun ik mezelf.', 'Mijn zus heeft weer niet gebeld.']],
      [31, 11.5, 2, null], [22.5, 11.2, 4, -Math.PI / 2, ['Dertig jaar sta ik hier al. Dertig jaar.', 'En wie krijgt de schuld als er iets mis is? Wij.']],
      [6.5, 9.5, 3, Math.PI, ['Hans? ...Hij is weer aan het tellen.']],
    ],
  },
  story: [
    { k: 'board', at: [33.5, 1.5], wall: 'n', title: 'ROOSTER', lines: ['06:00 hal openen', '06:02 koffie (1 kop)', '10:00 koffie (1 kop)', '12:30 boterham', 'di/do: Eddy kijken', 'za: vliegtuigen'], read: ['ROOSTER', "Hans's schedule, to the minute. Tuesday and Thursday: \"Eddy kijken\". Saturday: \"vliegtuigen\". The coffee is rationed to one cup at a time."] },
    { k: 'poster', at: [30.5, 1.5], wall: 'n', title: 'LELYSTAD AIRPORT', lines: ['PH-BLK · gespot 14x', 'PH-KAS · gespot 9x', 'PH-EDY · nog nooit'], read: ['SPOTTERSPOSTER', "A poster of a Cessna over the polder, with Hans's own tally in ballpoint. PH-EDY: \"nog nooit\"."] },
    { k: 'board', at: [36.5, 1.5], wall: 'n', title: 'MEDEWERKER V/D MAAND', lines: ['jan: Hans', 'feb: Hans', 'mrt: Hans', 'apr: Hans', '(347 keer op rij)'], read: ['MEDEWERKER VAN DE MAAND', 'Hans. Three hundred and forty-seven months in a row. Conny has written "en ik dan?" underneath, in red.'] },
    { k: 'board', at: [31.5, 15.5], wall: 'n', style: 'chalk', title: 'KOFFIEPOT', lines: ['Hans: 0,40', 'Conny: 0,40', 'Personeel: 0,60', '(melk +0,05)'], read: ['KOFFIEPOT', 'The staff pay more for their coffee than the owners. Milk is five cents extra.'] },
    { k: 'poster', at: [39.5, 15.5], wall: 'n', title: 'NIEMAND DENKT AAN ONS', lines: ['(geborduurd door C.B.)'], read: ['BORDUURWERK', 'A framed cross-stitch over Conny\'s armchair: "Niemand denkt aan ons". Next to it, a second one, unfinished: "Waarom altijd w".'] },
    { k: 'board', at: [10.5, 1.5], wall: 'n', title: 'VEILIGHEID', lines: ['0 dagen zonder klacht', '(van Conny)', 'heftruck: alleen Hans', 'licht uit = geld aan'], read: ['VEILIGHEIDSBORD', '"Aantal dagen zonder klacht: 0." The zero is painted on. It was never meant to change.'] },
    { k: 'sign', at: [22.5, 18.5], wall: 'n', title: 'max. 12 kg per dag', read: ['EXPEDITIE', '"Maximaal 12 kg per klant per dag (artikel 4)." Underneath, in Conny\'s hand: "ook voor Eddy!!!"'] },
    { k: 'board', at: [4.5, 18.5], wall: 'n', title: 'POLDERKRUIDEN', lines: ['paprika  ███', 'komijn   ██', 'fenegriek ██', '?????    █', 'NIET LATEN SLINGEREN'], read: ['RECEPT', 'The recipe on the wall, with one line blacked out in marker. The folder under it has the rest.'] },
    { k: 'papers', at: [13.5, 11.5], read: ['KLACHTBRIEF', 'Draft letter from Conny to the gemeente Almere: "Wij worden al dertig jaar benadeeld." It is four pages. Page three is about her sister.'] },
    { k: 'papers', at: [29.5, 5.5], read: ['MEMO', 'Hans to Conny: "Eddy & Zn bestelde deze week 61 kg. Dat is 5,08 keer artikel 4. Voorstel: prijs omhoog of klant weigeren." Conny, in the margin: "of allebei".'] },
    { k: 'tv', at: [28.5, 9.5], read: ['BEVEILIGINGSCAMERA', 'A CCTV monitor showing snow. The sticker is still on it: "DUMMY · kringloop · W 2". Nothing in this building is recording you.'] },
    { k: 'cups', at: [34.5, 2.5], y: 0.79 }, { k: 'cups', at: [33.5, 18.5], y: 0.79 },
    { k: 'crates', at: [24.5, 13.5] }, { k: 'sacks', at: [7.5, 22.5] }, { k: 'bags', at: [7.5, 26.5] },
  ],
  loot: [[2.5, 15.5], [24.5, 3.5], [24.5, 20.5], [9.5, 1.5]], // cell: sacks of fenegriek
  text: {
    area: 'ALMERE · BLOKAAS SPECIJEREN',
    banner: ['BLOKAAS SPECIJEREN', 'Almere, two in the morning. The only light on is in the office.'],
    objective: 'Get their <b>paperwork</b> out without being seen.',
    objectiveOwned: 'Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: 'Drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'BLOKAAS SPECIJEREN',
    resultsHint: 'Back to the Oofmobiel.',
    ownedBanner: ['BLOKAAS SPECIJEREN', 'Back to the Oofmobiel.'],
    bossDown: ['', ''],
    tips: ['Hans walks the same round every time: desk, racks, scale, ordners. Count along.', 'The racks and the double-stacked bags block sight. The single bags do not.', 'Walk under a bewegingsmelder and it stays dark. Run and the lamp comes on.', 'The radio and the phone bring Conny. The coffee machine and the scale bring Hans.', 'Paperwork is light: it never fills your bag.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, floorW, T, WALL_H, signTex, foes, popup, player }) {
    const P = (x, z) => [OX + x, Z0 + z];
    const basic = (c, o = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: o < 1, opacity: o, depthWrite: o >= 1 });
    const flatM = (x0, z0, x1, z1, m, y = 0.022) => { const pl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m); pl.rotation.x = -Math.PI / 2; pl.position.set(OX + (x0 + x1) / 2, y, Z0 + (z0 + z1) / 2); root.add(pl); return pl; };
    // ---- outside: the road, the fence, the name board, their two bikes against the wall
    floorW(OX - 14, OX + W + 14, 0, 9, T.paving, 1.6);
    for (let x = OX - 12; x < OX + W + 12; x += 2.5) if (Math.abs(x - (OX + 14)) > 7) box(0.06, 1.8, 0.06, mat(lam, 'fence', { color: 0x5a6a5a }), x, 0.9, 0.4, root, false);
    { const s = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.3), lam({ map: signTex([{ t: 'BLOKAAS', size: 64 }, { t: 'specijeren · groothandel · Almere', size: 22 }], '#ffffff', '#1a3a7a', 512, 112) })); s.position.set(OX + 6, WALL_H - 0.75, Z0 + 24.03); root.add(s); }
    { const rib = tex(THREE, 'roller', 64, 64, (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = '#c8cace'; g.fillRect(0, y, 64, 6); g.fillStyle = '#8a8e92'; g.fillRect(0, y + 6, 64, 2); } }, [1, 3]);
      for (const zf of [24.03, 22.97]) { const d = new THREE.Mesh(new THREE.PlaneGeometry(4.4, WALL_H - 0.3), lam({ map: rib })); d.position.set(OX + 14.5, (WALL_H - 0.3) / 2, Z0 + zf); if (zf < 23) d.rotation.y = Math.PI; root.add(d); } } // the roller door, down for the night (both faces)
    for (const [bx, c] of [[23.4, 0x2a3a2a], [24.6, 0x4a2a3a]]) { const [x, z] = P(bx, 24.5); for (const dz of [-0.5, 0.5]) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 6, 16), mat(lam, 'dark', { color: 0x1e2024 })); w.position.set(x, 0.34, z + dz); w.rotation.y = Math.PI / 2; root.add(w); }
      box(0.04, 0.04, 1.0, mat(lam, 'bk' + c, { color: c }), x, 0.6, z, root, false); box(0.04, 0.5, 0.04, mat(lam, 'bk' + c, { color: c }), x, 0.8, z - 0.25, root, false); box(0.3, 0.04, 0.04, mat(lam, 'dark', { color: 0x1e2024 }), x, 1.02, z + 0.45, root, false); box(0.14, 0.05, 0.24, mat(lam, 'saddle', { color: 0x5a3418 }), x, 1.06, z - 0.25, root, false); }
    // ---- the hall floor: yellow walkways along the cross aisle, a hatched zone in the open bay, bay letters at the racks
    const yel = basic(0xe8c020, 0.75);
    for (const z of [7.9, 11.0]) flatM(1.2, z, 25.8, z + 0.1, yel);
    for (let x = 16.1; x < 20; x += 0.8) { const st = flatM(x, 16.9, x + 0.14, 18.1, yel); st.rotation.z = 0.5; }
    flatM(11.2, 18.9, 25.8, 19.0, yel);
    ['A', 'B', 'C', 'D', 'E'].forEach((ch, i) => { const t = tex(THREE, 'bay' + ch, 64, 64, (g) => { g.fillStyle = '#e8c020'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#1a1a1a'; g.font = '900 46px Arial'; g.textAlign = 'center'; g.fillText(ch, 32, 49); }); flatM(4 + i * 4, 7.05, 5 + i * 4, 7.85, new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.8 })); });
    // ---- hanging lamps where the lights are: a dish shade on a cord (the hall ones barely glow)
    for (const [x, z, c, k] of LIGHTS) { if (z > 23) continue; const [px, pz] = P(x, z); box(0.02, 0.5, 0.02, mat(lam, 'dark', { color: 0x1e2024 }), px, WALL_H + 0.1, pz, root, false);
      const sh = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.2, 14, 1, true), mat(lam, 'shade', { color: 0x3a3e44, side: THREE.DoubleSide })); sh.position.set(px, WALL_H - 0.2, pz); root.add(sh);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), basic(c, Math.min(1, 0.35 + k * 0.65))); bulb.position.set(px, WALL_H - 0.28, pz); root.add(bulb); }
    // ---- the office: Hans's plane-spotting shelf (a model Cessna, binoculars, the airband scanner)
    { const [x, z] = P(31.5, 1.3); box(1.6, 0.04, 0.3, mat(lam, 'beech', { color: 0xc8a06a }), x, 1.0, z, root, false);
      box(0.5, 0.07, 0.07, mat(lam, 'white', { color: 0xf4f4f0 }), x - 0.4, 1.12, z, root, false); box(0.1, 0.02, 0.6, mat(lam, 'white', { color: 0xf4f4f0 }), x - 0.45, 1.16, z, root, false); box(0.02, 0.12, 0.08, mat(lam, 'loop', { color: 0x3a6ab8 }), x - 0.17, 1.18, z, root, false);
      for (const dx of [0.2, 0.3]) box(0.08, 0.14, 0.08, mat(lam, 'dark', { color: 0x1e2024 }), x + dx, 1.09, z, root, false); box(0.2, 0.14, 0.1, mat(lam, 'radio', { color: 0x3a3c40 }), x + 0.62, 1.09, z, root, false); }
    // ---- wall clocks (two minutes fast, on purpose)
    { const ck = tex(THREE, 'clock', 64, 64, (g) => { g.fillStyle = '#f4f0e4'; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill(); g.strokeStyle = '#1a1a1a'; g.lineWidth = 3; g.stroke(); g.beginPath(); g.moveTo(32, 32); g.lineTo(32, 12); g.moveTo(32, 32); g.lineTo(44, 38); g.stroke(); });
      for (const [x, z] of [[35.5, 15.03], [32.5, 9.03]]) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), new THREE.MeshBasicMaterial({ map: ck })); m.position.set(OX + x, 1.9, Z0 + z); root.add(m); } }
    // ---- things to lure them with: use one and somebody comes to see (reusable after a while)
    const lure = (type, x, z, linger, line, nobody) => { const e = foes().find((q) => q.userData.foe.type === type), f = e && e.userData.foe;
      if (!e || !e.visible || !f.alive || f.down > 0 || f.state === 'chase') { popup(player.position, nobody, '#9fb0d8'); return; }
      f.state = 'search'; f.sx = OX + x; f.sz = Z0 + z; f.searchT = -linger; f.path = null; popup(e.position, line, '#cbb8ec'); };
    const mk = (x, z, label, act) => { const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.7, 24), basic(0xcbb8ec, 0.5)); ring.rotation.x = -Math.PI / 2; ring.position.set(OX + x, 0.035, Z0 + z); root.add(ring);
      return { pos: new THREE.Vector3(OX + x, 0, Z0 + z), obj: ring, label, optional: true, quiet: true, cd: 0, ring, act, reset() { this.cd = 0; ring.visible = true; } }; };
    const tasks = [
      mk(2.3, 13.5, 'Radio · switch it on (Conny comes to switch it off)', () => { popup(player.position, '♪ RADIO POLDER FM ♪', '#cbb8ec'); lure('conny', 2.6, 13.5, 7, 'Wie heeft de radio aangezet?! Stroom kost geld!', 'It plays. Nobody comes: Conny is not in tonight.'); }),
      mk(22.2, 21.6, 'Telefoon · let it ring (Conny thinks it is her sister)', () => { popup(player.position, 'TRRRING!', '#cbb8ec'); lure('conny', 22.4, 21.2, 10, 'Mijn zus! Eindelijk! ...Hallo? HALLO?', 'It rings and rings. Conny is not in tonight.'); }),
      mk(29.5, 16.6, 'Koffieapparaat · switch it on (Hans: it is not ten o\'clock)', () => { popup(player.position, 'PRRRRT · KOFFIE', '#cbb8ec'); lure('hans', 29.5, 16.8, 8, 'Koffie? Het is geen tien uur. Wie zet hier koffie?', 'It gurgles. Nobody comes: Hans is out spotting planes.'); }),
      mk(5.5, 21.2, 'Weegschaal · knock it out of calibration (Hans will be a while)', () => { popup(player.position, 'PIEP · 0,2 g', '#cbb8ec'); lure('hans', 5.5, 19.2, 16, 'De weegschaal! Nul komma twee gram afwijking!', 'It beeps to an empty hall. Hans is out spotting planes.'); }),
    ];
    return { tasks, tick(dt) { for (const t of tasks) { if (t.done) { t.cd += dt; t.ring.visible = false; if (t.cd > 28) { t.done = false; t.cd = 0; t.ring.visible = true; } } else t.ring.material.opacity = 0.35 + Math.sin(performance.now() * 0.005 + t.pos.x) * 0.2; } } };
  },
};
