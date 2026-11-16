// The geography of Kaasland, for the Map of Kaasland (kaasmap.js) and its painter (kaasaerial.js).
// A Dutch river city laid out from scratch, in a 1200x800 map space (north is up):
//   - De Kaas, a river across the top third, widening east into the Kaasbaai with the windmill island
//   - Oud-Vettenburg (Act 1, Lampas): a half-ring of canals around the old centre on the south bank
//   - Kipkruidenkwartier (home): the 19th-century grid south-west of the canal ring
//   - Hipsterheuvel (Act 2, Noshgey Kariot): villas and gardens on the north bank, farmland further east
//   - De Duistere Dokken (Act 3, Abdavissies): harbour basins, sheds and container yards in the south-east
//   - De Zandwijk (Paravim): a walled desert quarter west of the old centre, Ras al Gara's turf
// One map unit is about 5 m.

export const W = 1200, H = 800, M_PER_UNIT = 5;
export const C0 = [600, 318]; // the old centre, on the south bank
const rad = (a) => a * Math.PI / 180;
export const polar = (a, r) => [C0[0] + r * Math.cos(rad(a)), C0[1] + r * Math.sin(rad(a))];
export function arc(a0, a1, r, step = 4) { const pts = [], s = a0 < a1 ? step : -step; for (let a = a0; s > 0 ? a <= a1 + 1e-6 : a >= a1 - 1e-6; a += s) pts.push(polar(a, r)); return pts; }

export const NORTH_BANK = [[-20, 232], [150, 240], [300, 228], [450, 238], [600, 250], [750, 240], [850, 222], [920, 186], [1000, 166], [1100, 158], [1220, 150]];
export const SOUTH_BANK = [[-20, 300], [150, 308], [300, 300], [450, 310], [600, 318], [750, 312], [850, 306], [920, 312], [1000, 300], [1100, 296], [1220, 300]];
export const RIVER = [...NORTH_BANK, ...SOUTH_BANK.slice().reverse()];
export const ISLAND = { cx: 1010, cy: 232, rx: 38, ry: 20 };
export const CANALS = [105, 150, 195, 240]; // canal rings of the old town (radius from C0), named in kaasmap
export const CANAL_NAMES = ['Zoutgracht', 'Pepergracht', 'Saffraangracht', 'Kaneelsingel'];
export const BASINS = [[915, 290, 30, 120], [1012, 290, 28, 230], [1108, 290, 26, 130]]; // harbour basins [x, y, w, h]
export const MARINA = [35, 200, 60, 45];
export const SLOOT = [[705, 722], [760, 692], [805, 668], [850, 652], [905, 646], [960, 652]]; // the smugglers' canal
export const YARDS = [[880, 670, 110, 70], [1050, 560, 120, 60], [1060, 740, 110, 50], [940, 450, 60, 70]]; // container yards
export const SILOS = [1160, 340];
export const RING_R = 274; // the Ringweg around the canal ring

const blob = (cx, cy, rx, ry, seed) => Array.from({ length: 28 }, (_, i) => { const a = i / 28 * Math.PI * 2, k = 1 + 0.1 * Math.sin(3 * a + seed) + 0.06 * Math.sin(7 * a + seed * 2); return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
export const PARKS = [
  ['Granolabos', blob(300, 95, 95, 48, 1), true], ['Kaaspark', blob(530, 705, 46, 28, 2), true], ['Kipkruidenpark', blob(150, 762, 42, 24, 3), true], ['Dadeloase', blob(185, 455, 24, 16, 6), true],
  ['Hofje van Freddy Sr.', blob(372, 652, 15, 10, 4), false], ['Oosterpark', blob(760, 105, 40, 26, 5), true],
];
export const FIELDS = [[890, -10], [1220, -10], [1220, 150], [1100, 158], [1000, 166], [920, 186], [890, 190]]; // Speltpolder farmland

const ring = (a) => polar(a, RING_R);
export const REGIONS = {
  nosh: [[-20, -20], [1220, -20], ...NORTH_BANK.slice().reverse()],
  lampas: arc(0, 180, 262, 6),
  para: [[-20, 300], ...SOUTH_BANK.filter(([x]) => x > 0 && x < 338), [338, 305], [332, 420], [305, 535], [-20, 550]],
  start: [[-20, 550], [305, 535], [332, 420], [338, 305], ...arc(180, 80, 262, 6), [700, 610], [700, 820], [-20, 820]],
  abd: [[862, 318], ...SOUTH_BANK.filter(([x]) => x > 862), [1220, 820], [700, 820], [700, 610], ...arc(80, 0, 262, 6)],
};

// where each territory sits
export const PLACES = {
  Spekbuurt: [440, 700], Kroketkade: [90, 640], Uitjesbuurt: [200, 712],
  Mayonaisemarkt: [600, 352], Knoflooksteeg: [656, 398], Frietwijk: [520, 432], Sauzenbuurt: [420, 420], 'Halve Kip Plein': [690, 505], Bitterbalbuurt: [790, 402], Pindasausplein: [360, 330],
  Joppiehaven: [118, 206], Frikandelhaven: [232, 214], Havermelkhaven: [360, 192], 'Kombucha-kwartier': [500, 176], Gembergracht: [640, 206], 'Avocado-akkers': [560, 78], 'Glutenvrije Gaarde': [760, 165], Quinoaplantage: [945, 95], 'Oat-oase': [1060, 120], Speltpolder: [1145, 48],
  Komijnkade: [892, 345], "Kaneelsilo's": [1160, 365], Paprikapakhuis: [965, 420], Kruidnagelkade: [1058, 380], Peperhaven: [1100, 462], Kurkumaloods: [880, 485], Saffraanpier: [1160, 600], Nootmuskade: [1000, 600], Smokkelsloot: [830, 636], Containerchaos: [935, 705], Kardemomdok: [1110, 720],
  'De Gouden Molen': [ISLAND.cx, ISLAND.cy],
};
export const HOME = [300, 600]; // the Eddy & Zn warehouse
export const ACT_AT = { start: [250, 770], lampas: [600, 560], nosh: [690, 112], abd: [980, 785], para: [150, 528] };
// De Zandwijk: the Paravim came from the desert and took the west quay. Six missions (main.js PARA), open after Act 2.
export const KASBAH = { cx: 72, cy: 340, s: 34 }; // Ras al Gara's fortress
export const SOUK = [[150, 380], [178, 392], [205, 402], [232, 410], [262, 414]];
export const PARA_PLACES = {
  'Kasbah al Gara': [KASBAH.cx, KASBAH.cy], Couscouskade: [235, 322], "Za'atarmarkt": [180, 396], Harissahof: [96, 452], Sumaksteeg: [278, 432], Dadelplein: [244, 482],
};

// main roads: nodes and named edges (with their polyline). Routes run over these, and the painter draws them.
export const NODES = {
  home: [...HOME, 'start'], s1: [440, 660, 'start'], s2: [140, 600, 'start'], s3: [140, 360, 'para'], p1: [150, 478, 'para'],
  rw: [...ring(178), 'start'], rsw: [...ring(150), 'start'], rs: [...ring(90), 'start'], rse: [...ring(30), 'abd'], re: [...ring(2), 'abd'],
  wbs: [400, 318, 'lampas'], c: [600, 352, 'lampas'], ow: [...polar(150, 170), 'lampas'], os: [...polar(90, 150), 'lampas'], oe: [...polar(30, 170), 'lampas'],
  nwb: [400, 218, 'nosh'], nc: [600, 232, 'nosh'], neb: [878, 196, 'nosh'],
  n1: [150, 192, 'nosh'], n2: [400, 172, 'nosh'], n3: [600, 168, 'nosh'], n4: [800, 158, 'nosh'], n5: [960, 128, 'nosh'], n6: [1080, 82, 'nosh'], n7: [540, 60, 'nosh'],
  d1: [895, 392, 'abd'], d2: [985, 545, 'abd'], d3: [1165, 525, 'abd'], d4: [1080, 690, 'abd'], d5: [820, 600, 'abd'],
};
const R = (a, b, name, o = {}) => ({ a, b, name, ...o });
export const ROADS = [
  R('rw', 'rsw', 'Ringweg', { ring: [178, 150] }), R('rsw', 'rs', 'Ringweg', { ring: [150, 90] }), R('rs', 'rse', 'Ringweg', { ring: [90, 30] }), R('rse', 're', 'Ringweg', { ring: [30, 2] }),
  R('home', 'rsw', 'Vettenburgerweg'), R('home', 's1', 'Kipkruidenlaan'), R('s1', 'rs', 'Kipkruidenlaan'), R('home', 's2', 'Eddystraat'), R('s2', 'p1', 'Duinweg'), R('p1', 's3', 'Duinweg'), R('s3', 'rw', 'Kasbahkade'),
  R('rw', 'wbs', 'Frietkade'), R('wbs', 'ow', 'Sauslaan'), R('rsw', 'ow', 'Frietstraat'), R('ow', 'c', 'Frietstraat'), R('rs', 'os', 'Mayolaan'), R('os', 'c', 'Mayolaan'), R('rse', 'oe', 'Bitterbalstraat'), R('oe', 'c', 'Bitterbalstraat'),
  R('wbs', 'nwb', 'Westerbrug', { bridge: 1 }), R('c', 'nc', 'Kaasbrug', { bridge: 1 }), R('re', 'neb', 'Oosterbrug', { bridge: 1 }),
  R('n1', 'n2', 'Hipsterlaan'), R('n2', 'n3', 'Hipsterlaan'), R('n3', 'n4', 'Avocadoweg'), R('n4', 'n5', 'Oatlaan'), R('n5', 'n6', 'Speltdijk'), R('n3', 'n7', 'Akkerweg'),
  R('nwb', 'n2', 'Brugstraat'), R('nc', 'n3', 'Kombuchalaan'), R('neb', 'n4', 'Gemberdijk'),
  R('re', 'd1', 'Kadeweg'), R('d1', 'd2', 'Containerweg'), R('d2', 'd3', 'Havenstraat'), R('d2', 'd4', 'Containerweg'), R('rse', 'd5', 'Dokweg'), R('d5', 'd2', 'Dokweg'),
].map((r) => ({ ...r, pts: r.ring ? arc(r.ring[0], r.ring[1], RING_R, 4) : [NODES[r.a].slice(0, 2), NODES[r.b].slice(0, 2)] }));

export function inPoly(x, y, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }
export const regionOf = (x, y) => (inPoly(x, y, RIVER) ? 'water' : Object.keys(REGIONS).find((r) => inPoly(x, y, REGIONS[r])) || 'start');
export function bboxOf(r) {
  if (r === 'fin') return [ISLAND.cx - 70, ISLAND.cy - 45, ISLAND.cx + 70, ISLAND.cy + 45];
  return REGIONS[r].reduce((b, [x, y]) => [Math.max(0, Math.min(b[0], x)), Math.max(0, Math.min(b[1], y)), Math.min(W, Math.max(b[2], x)), Math.min(H, Math.max(b[3], y))], [1e9, 1e9, -1e9, -1e9]);
}

// shortest way over the main roads, from the warehouse to a place; returns the polyline, km and the main road
export function route(to, region) {
  const len = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); return s; };
  const adj = {}; for (const r of ROADS) { const d = len(r.pts); (adj[r.a] = adj[r.a] || []).push([r.b, d, r, false]); (adj[r.b] = adj[r.b] || []).push([r.a, d, r, true]); }
  const want = region === 'fin' ? 'nosh' : region;
  const near = Object.keys(NODES).filter((id) => NODES[id][2] === want).sort((a, b) => Math.hypot(NODES[a][0] - to[0], NODES[a][1] - to[1]) - Math.hypot(NODES[b][0] - to[0], NODES[b][1] - to[1]))[0];
  const dist = { home: 0 }, prev = {}, todo = new Set(Object.keys(NODES));
  while (todo.size) {
    let u = null; for (const v of todo) if (dist[v] !== undefined && (u === null || dist[v] < dist[u])) u = v;
    if (u === null || u === near) break; todo.delete(u);
    for (const [v, d, r, rev] of adj[u] || []) if (todo.has(v) && (dist[v] === undefined || dist[u] + d < dist[v])) { dist[v] = dist[u] + d; prev[v] = [u, r, rev]; }
  }
  const legs = []; let v = near; while (prev[v]) { legs.unshift(prev[v]); v = prev[v][0]; }
  let pts = [HOME]; const names = {};
  for (const [, r, rev] of legs) { const p = rev ? r.pts.slice().reverse() : r.pts; pts = pts.concat(p.slice(1)); names[r.name] = (names[r.name] || 0) + len(p); }
  pts.push(to);
  const main = Object.entries(names).sort((a, b) => b[1] - a[1])[0];
  return { pts, km: len(pts) * M_PER_UNIT / 1000, via: main ? main[0] : '' };
}
