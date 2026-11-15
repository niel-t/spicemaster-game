// Kaaskaart: the Map of Kaasland on the Kaasdows 95 PC and in the Oofmobiel, done as a modern street-map app
// inside the old Windows window: a light map with streets, parks and named main roads, places as small icons
// whose names give way when they would overlap, a search box, filter chips, a place card, a blue
// "you are here" dot, a route along the roads with distance and drive time, zoom buttons, and the painted
// map as the "Luchtfoto" layer.
//
// Drawn as SVG in the 1024x572 space of assets/kaasland_map.jpg. main.js keeps the game logic: it hands over
// each territory's kind and binds the [data-pin] clicks (bindMap fills #pininfo), then calls bind().

const W = 1024, H = 572, S = 0.64; // shapes were traced on the 1600 px painted map
const P = (pts) => pts.map(([x, y]) => [x * S, y * S]);
const REGIONS = {
  nosh: P([[190, 250], [230, 165], [390, 95], [590, 55], [840, 35], [1100, 45], [1330, 60], [1590, 15], [1597, 105], [1500, 140], [1420, 190], [1300, 240], [1100, 268], [900, 272], [700, 268], [480, 262], [420, 255], [395, 315], [300, 330], [245, 300]]),
  lampas: P([[100, 265], [160, 250], [245, 300], [330, 345], [985, 345], [975, 420], [860, 520], [790, 545], [255, 590], [255, 785], [130, 810], [65, 580], [75, 400]]),
  start: P([[255, 590], [790, 545], [790, 800], [500, 835], [140, 800], [255, 785]]),
  abd: P([[800, 545], [960, 440], [1000, 410], [1100, 345], [1500, 335], [1515, 385], [1490, 450], [1510, 620], [1480, 740], [1300, 800], [850, 830], [795, 800]]),
};
const MOLEN = { cx: 965 * S, cy: 318 * S, rx: 40 * S, ry: 17 * S };
const PARKS = [ // [name, cx, cy, rx, ry] in 1600 px coords
  ['Kaaspark', 470, 470, 46, 26], ['Granolabos', 1330, 130, 95, 30], ['Speltvelden', 1500, 75, 55, 18], ['Hofje van Eddy Sr.', 640, 715, 34, 16], ['Duinen', 110, 520, 26, 60],
];
// main roads: nodes (1600 px coords, region) and named edges. Routes run over this graph.
const N = {
  home: [375, 690, 'start'], hc: [530, 640, 'start'], hw: [262, 650, 'start'], he: [770, 690, 'start'],
  lsw: [160, 560, 'lampas'], lsn: [180, 330, 'lampas'], l1: [420, 365, 'lampas'], l2: [735, 365, 'lampas'], l3: [590, 470, 'lampas'], l4: [900, 410, 'lampas'],
  a1: [1000, 470, 'abd'], a2: [1210, 440, 'abd'], a3: [1390, 352, 'abd'], a4: [1100, 650, 'abd'], a5: [1350, 640, 'abd'], a6: [900, 700, 'abd'],
  n1: [445, 250, 'nosh'], n2: [735, 255, 'nosh'], n3: [1390, 235, 'nosh'], n4: [300, 205, 'nosh'], n5: [590, 200, 'nosh'], n6: [900, 185, 'nosh'], n7: [1150, 175, 'nosh'], n8: [1460, 110, 'nosh'],
};
const ROADS = [ // [from, to, name, bridge?]
  ['home', 'hc', 'Kipkruidenlaan'], ['hc', 'he', 'Kipkruidenlaan'], ['home', 'hw', 'Eddystraat'], ['hc', 'l3', 'Vettenburgerweg'], ['he', 'a6', 'Dokweg'],
  ['hw', 'lsw', 'Duinweg'], ['lsw', 'lsn', 'Duinweg'], ['lsn', 'l1', 'Frietkade'], ['l1', 'l3', 'Sausgracht'], ['l3', 'l2', 'Mayolaan'], ['l3', 'l4', 'Bitterbalweg'], ['l4', 'a1', 'Dokweg'],
  ['a1', 'a2', 'Kadeweg'], ['a2', 'a3', 'Kadeweg'], ['a1', 'a4', 'Containerweg'], ['a2', 'a4', 'Kruidenkade'], ['a4', 'a5', 'Havenstraat'], ['a5', 'a2', 'Havenstraat'], ['a4', 'a6', 'Containerweg'],
  ['l1', 'n1', 'Westerbrug', 1], ['l2', 'n2', 'Kaasbrug', 1], ['a3', 'n3', 'Oosterbrug', 1],
  ['lsn', 'n4', 'Havenpad'], ['n4', 'n1', 'Hipsterlaan'], ['n1', 'n5', 'Hipsterlaan'], ['n5', 'n2', 'Hipsterlaan'], ['n2', 'n6', 'Avocadoweg'], ['n6', 'n7', 'Avocadoweg'], ['n7', 'n3', 'Oatlaan'], ['n7', 'n8', 'Speltdijk'],
];
const ACTS = [
  { r: 'start', name: 'Kipkruidenkwartier', tag: 'Prologue', faction: 'Lampas', heat: 'lampas', open: () => true, need: '' },
  { r: 'lampas', name: 'Oud-Vettenburg', tag: 'Act 1', faction: 'Lampas', heat: 'lampas', open: (d) => d.district1, need: 'Take all of Kipkruidenkwartier first' },
  { r: 'nosh', name: 'Hipsterheuvel', tag: 'Act 2', faction: 'Noshgey Kariot', heat: 'noshgey', open: (d) => d.act1, need: 'Beat the Lampas in Oud-Vettenburg first' },
  { r: 'abd', name: 'De Duistere Dokken', tag: 'Act 3', faction: 'Abdavissies', heat: 'abdavissies', open: (d) => d.act2, need: 'Beat the Noshgey Kariot first' },
  { r: 'fin', name: 'De Gouden Molen', tag: 'Finale', faction: 'everyone', heat: null, open: (d) => d.act3, need: 'Beat the Abdavissies first' },
];
const ACT = Object.fromEntries(ACTS.map((a) => [a.r, a]));
const ACT_AT = { start: [522, 612], lampas: [600, 410], nosh: [800, 120], abd: [1180, 560], fin: [965, 292] };
const PARENT = { // shown on the place card: "opens after ..."
  Kroketkade: 'Spekbuurt', Uitjesbuurt: 'Spekbuurt', Frietwijk: 'all of Kipkruidenkwartier',
  Sauzenbuurt: 'Frietwijk', Knoflooksteeg: 'Frietwijk', Mayonaisemarkt: 'Frietwijk', 'Halve Kip Plein': 'two of Sauzenbuurt, Knoflooksteeg, Mayonaisemarkt', Bitterbalbuurt: 'two of Sauzenbuurt, Knoflooksteeg, Mayonaisemarkt', Pindasausplein: 'the other six Lampas joints',
  Joppiehaven: 'the end of Act 1', Frikandelhaven: 'Joppiehaven', Havermelkhaven: 'Joppiehaven', 'Kombucha-kwartier': 'Joppiehaven', Gembergracht: 'two harbour joints', 'Avocado-akkers': 'two harbour joints', 'Glutenvrije Gaarde': 'two harbour joints', Quinoaplantage: 'two of Gembergracht, Avocado-akkers, Glutenvrije Gaarde', 'Oat-oase': 'two of Gembergracht, Avocado-akkers, Glutenvrije Gaarde', Speltpolder: 'the other nine Noshgey joints',
  Komijnkade: 'the end of Act 2', "Kaneelsilo's": 'Komijnkade', Paprikapakhuis: 'Komijnkade', Kruidnagelkade: 'Komijnkade', Peperhaven: "two of Kaneelsilo's, Paprikapakhuis, Kruidnagelkade", Kurkumaloods: "two of Kaneelsilo's, Paprikapakhuis, Kruidnagelkade", Saffraanpier: 'Peperhaven or Kurkumaloods', Nootmuskade: 'Peperhaven or Kurkumaloods', Smokkelsloot: 'Peperhaven or Kurkumaloods', Containerchaos: 'two of Saffraanpier, Nootmuskade, Smokkelsloot', Kardemomdok: 'the other ten dock joints', 'De Gouden Molen': 'the end of Act 3',
};
const BOSS = ['Pindasausplein', 'Speltpolder', 'Kardemomdok', 'De Gouden Molen'];
const HOME = [240, 442];
const PEOPLE = [
  ['Schmatzel', 'Shoarma Schmatzel · free broodje, old stories', 262, 434],
  ['Nabil', 'Card table in Schmatzel’s · lends and borrows', 270, 449],
  ['The Russian', 'Pandjeshuis Spasibo · weapons', 292, 430],
  ['Garage Mo', 'Oofmobiel upgrades', 216, 454],
];
const C = {
  water: '#a9d3e8', land: '#f3f0ea', street: '#ffffff', park: '#cde8c4', parkInk: '#3b7a3b',
  tint: { start: '#f3f0ea', lampas: '#f6eee8', nosh: '#eef3e6', abd: '#ebf0f3', fin: '#f6efd6' },
  edge: '#b9b2a6', road: '#fde9a4', roadCase: '#e5c46a', ink: '#3c4043', sub: '#70757a', blue: '#1a73e8',
  st: { open: '#e8710a', own: '#188038', lost: '#d93025', locked: '#80868b' },
};
const STATUS = { own: 'own', lost: 'lost', m1: 'open', m2: 'open', m3: 'open' };
const statusOf = (k) => STATUS[k] || 'locked';
const STLABEL = { open: 'Mission open', own: 'Yours', lost: 'Retaken', locked: 'Locked' };
const path = (poly) => 'M' + poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const pt = (id) => [N[id][0] * S, N[id][1] * S];
const bbox = (r) => (r === 'fin' ? [MOLEN.cx - 60, MOLEN.cy - 34, MOLEN.cx + 60, MOLEN.cy + 34] : REGIONS[r].reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [1e9, 1e9, -1e9, -1e9]));
function inPoly([x, y], poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; } return c; }

// shortest way over the main roads, from the warehouse to a place
function route(to, region) {
  const adj = {}; for (const [a, b, name] of ROADS) { const d = Math.hypot(pt(a)[0] - pt(b)[0], pt(a)[1] - pt(b)[1]); (adj[a] = adj[a] || []).push([b, d, name]); (adj[b] = adj[b] || []).push([a, d, name]); }
  const near = Object.keys(N).filter((id) => N[id][2] === (region === 'fin' ? 'nosh' : region)).sort((a, b) => Math.hypot(pt(a)[0] - to[0], pt(a)[1] - to[1]) - Math.hypot(pt(b)[0] - to[0], pt(b)[1] - to[1]))[0];
  const dist = { home: 0 }, prev = {}, via = {}, todo = new Set(Object.keys(N));
  while (todo.size) {
    let u = null; for (const v of todo) if (dist[v] !== undefined && (u === null || dist[v] < dist[u])) u = v;
    if (u === null || u === near) break; todo.delete(u);
    for (const [v, d, name] of adj[u] || []) if (todo.has(v) && (dist[v] === undefined || dist[u] + d < dist[v])) { dist[v] = dist[u] + d; prev[v] = u; via[v] = name; }
  }
  const ids = [near]; while (prev[ids[0]]) ids.unshift(prev[ids[0]]);
  const pts = [HOME, ...ids.map(pt), to];
  const names = {}; for (const id of ids) if (via[id]) names[via[id]] = (names[via[id]] || 0) + 1;
  const main = Object.entries(names).sort((a, b) => b[1] - a[1])[0];
  let len = 0; for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return { pts, km: len * 6.2 / 1000, via: main ? main[0] : '' };
}

// place icons (screen px around 0,0)
function icon(kind, st) {
  const c = kind === 'wh' ? '#8d6e63' : kind === 'person' ? '#7b5ea7' : C.st[st];
  const r = kind === 'boss' ? 9 : st === 'open' || st === 'lost' ? 8 : 6.5;
  const g = kind === 'wh' ? '<path d="M-4,0.5 L0,-3.5 L4,0.5 V4 H-4Z" fill="#fff"/>'
    : kind === 'person' ? '<circle cy="-2" r="2.2" fill="#fff"/><path d="M-3.8,4 a3.8,3.4 0 0 1 7.6,0Z" fill="#fff"/>'
    : kind === 'boss' ? '<path d="M-5,3 L-5,-2.5 L-2.5,0 L0,-4.5 L2.5,0 L5,-2.5 L5,3Z" fill="#fff"/>'
    : st === 'own' ? '<path d="M-3,0 L-0.8,2.4 L3.2,-2.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    : st === 'locked' ? '<path d="M-2.2,-0.4 V-1.8 a2.2,2.2 0 0 1 4.4,0 V-0.4 M-3,-0.4 H3 V3.2 H-3Z" fill="#fff" stroke="#fff" stroke-width=".7"/>'
    : '<text y="4" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial Black, Arial" fill="#fff">!</text>';
  return `<circle r="${r + 1.5}" fill="#fff"/><circle r="${r}" fill="${c}"/>${g}`;
}
const ICON_DOT = `<circle class="km-halo" r="16" fill="rgba(26,115,232,.18)"/><circle r="7.5" fill="#fff"/><circle r="5.5" fill="${C.blue}"/>`;
const ICON_SEL = '<path d="M0,0 C-3,-8 -11,-13 -11,-22 A11,11 0 0 1 11,-22 C11,-13 3,-8 0,0Z" fill="#ea4335" stroke="#a52714" stroke-width="1"/><circle cy="-22" r="4" fill="#7a1a0e"/>';

export function createKaasMap() {
  let view = { cx: W / 2, cy: H / 2, z: 1 };
  let layer = 'map', hide = {}; // hide: chip filters
  let hadSave = false;
  try { const s = JSON.parse(localStorage.getItem('sme.kmap3') || 'null'); if (s) { hadSave = true; view = { ...view, ...s.view }; layer = s.layer === 'photo' ? 'photo' : 'map'; hide = s.hide || {}; } } catch (e) { /* private window */ }
  const save = () => { try { localStorage.setItem('sme.kmap3', JSON.stringify({ view, layer, hide })); } catch (e) { /* ignore */ } };
  let cur = null, sel = null, opened = false;

  function html(o) {
    const d = o.done || {};
    const openAct = (r) => !!ACT[r].open(d);
    const terr = o.terr.filter((t) => t.n !== 'Kipkruidenkwartier').map((t) => ({ ...t, st: statusOf(t.k), boss: BOSS.includes(t.n), x: t.region === 'fin' ? MOLEN.cx : (t.box[0] + t.box[2]) / 2, y: t.region === 'fin' ? MOLEN.cy : (t.box[1] + t.box[3]) / 2 }));
    cur = { ...o, terr, openAct };
    const photo = layer === 'photo';

    let s = `<svg class="km-svg${photo ? ' km-photo-on' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
<defs>
  ${[['lampas', 11, 8, -8], ['start', 11, 8, 10], ['nosh', 18, 12, 4], ['abd', 17, 10, 0]].map(([r, w, h, a]) => `<pattern id="kmS-${r}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})"><path d="M0,0H${w}M0,0V${h}" stroke="${C.street}" stroke-width="1.3" fill="none"/></pattern>`).join('')}
  <pattern id="kmLock" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="7" height="7" fill="rgba(120,115,108,.07)"/><rect width="1.2" height="7" fill="rgba(120,115,108,.16)"/></pattern>
</defs>
<rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="${C.water}"/>
<image class="km-sat" href="./assets/kaasland_map.jpg" width="${W}" height="${H}"/>
<g class="km-base">`;
    for (const a of ACTS) {
      const shape = a.r === 'fin' ? `<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}"` : `<path d="${path(REGIONS[a.r])}"`;
      s += `${shape} class="km-area" data-area="${a.r}" fill="${C.tint[a.r]}"/>`;
    }
    s += `</g><g class="km-streets">${Object.keys(REGIONS).map((r) => `<path d="${path(REGIONS[r])}" fill="url(#kmS-${r})"/>`).join('')}</g>`;
    s += `<g class="km-parks">${PARKS.map(([n, x, y, rx, ry]) => `<ellipse cx="${x * S}" cy="${y * S}" rx="${rx * S}" ry="${ry * S}" fill="${C.park}"/>`).join('')}</g>`;
    s += `<g class="km-locks">${ACTS.filter((a) => !openAct(a.r)).map((a) => (a.r === 'fin' ? `<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}" fill="url(#kmLock)"/>` : `<path d="${path(REGIONS[a.r])}" fill="url(#kmLock)"/>`)).join('')}</g>`;
    s += `<g class="km-borders">${Object.values(REGIONS).map((p) => `<path d="${path(p)}" fill="none" stroke="${C.edge}" stroke-width="1.6" stroke-dasharray="6 3" vector-effect="non-scaling-stroke"/>`).join('')}<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}" fill="none" stroke="${C.edge}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></g>`;
    // main roads: casing, then fill; bridges grey
    const seg = ([a, b]) => { const [x1, y1] = pt(a), [x2, y2] = pt(b); return `M${x1},${y1}L${x2},${y2}`; };
    s += `<g class="km-roads"><path d="${ROADS.map(seg).join('')}" fill="none" stroke="${C.roadCase}" stroke-width="6.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`
      + `<path d="${ROADS.filter((r) => r[3]).map(seg).join('')}" fill="none" stroke="#9aa0a6" stroke-width="7" vector-effect="non-scaling-stroke"/>`
      + `<path d="${ROADS.map(seg).join('')}" fill="none" stroke="${C.road}" stroke-width="4" stroke-linecap="round" vector-effect="non-scaling-stroke"/>`
      + `${ROADS.map((r, i) => `<path id="kmR${i}" d="${pt(r[0])[0] < pt(r[1])[0] ? seg(r) : seg([r[1], r[0]])}" fill="none"/>`).join('')}</g>`;
    s += `<path class="km-route-case" d="" fill="none"/><path class="km-route" d="" fill="none"/>`;
    // text that keeps its screen size: road names, park names, district names (scaled in apply)
    s += `<g class="km-roadnames">${ROADS.map((r, i) => `<text dy="3.2"><textPath href="#kmR${i}" startOffset="50%" text-anchor="middle">${r[2]}</textPath></text>`).join('')}</g>`;
    s += `<g class="km-txt">${PARKS.map(([n, x, y]) => `<g class="km-t km-parkname" data-x="${x * S}" data-y="${y * S}"><text text-anchor="middle" y="4">${n}</text></g>`).join('')}`;
    s += ACTS.filter((a) => a.r !== 'fin').map((a) => `<g class="km-t km-district${openAct(a.r) ? '' : ' km-dlocked'}" data-x="${ACT_AT[a.r][0] * S}" data-y="${ACT_AT[a.r][1] * S}"><text text-anchor="middle">${a.name.toUpperCase()}</text>${openAct(a.r) ? '' : `<text text-anchor="middle" y="14" class="km-dsub">LOCKED · ${a.tag.toUpperCase()}</text>`}</g>`).join('') + '</g>';
    // places
    s += '<g class="km-places">';
    for (const t of terr) {
      const cat = t.st === 'lost' ? 'open' : t.st;
      s += `<g class="km-pl km-${t.st} km-c-${cat}${t.boss ? ' km-boss' : ''}" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${t.x}" data-y="${t.y}" data-pri="${t.st === 'open' || t.st === 'lost' ? 3 : t.boss ? 2 : t.st === 'own' ? 1 : 0}"><circle r="12" fill="transparent"/>${icon(t.boss ? 'boss' : 'joint', t.st)}<text class="km-lab" x="${t.boss ? 13 : 11}" y="4">${esc(t.n)}${t.extra ? ` · ${esc(t.extra)}` : ''}</text></g>`;
    }
    for (const w of o.warehouses || []) { const t = terr.find((x) => x.n === w.n); if (t) s += `<g class="km-pl km-c-wh km-wh" data-x="${t.x + 12}" data-y="${t.y - 12}" data-pri="-1"><title>${esc(w.name)}</title>${icon('wh')}</g>`; }
    s += PEOPLE.map(([n, dsc, x, y]) => `<g class="km-pl km-c-people km-person" data-person="${esc(n)}" data-x="${x}" data-y="${y}" data-pri="-2"><circle r="11" fill="transparent"/>${icon('person')}<text class="km-lab" x="10" y="4">${esc(n)}</text></g>`).join('');
    s += `<g class="km-pl km-home" data-pin="Kipkruidenkwartier" data-k="own" data-x="${HOME[0]}" data-y="${HOME[1]}" data-pri="4"><circle r="14" fill="transparent"/>${ICON_DOT}<text class="km-lab" x="12" y="4">Eddy &amp; Zn warehouse</text></g>`;
    s += `<g class="km-selpin" data-x="0" data-y="0" style="display:none">${ICON_SEL}</g></g></svg>`;

    // search results, chips, card
    const count = (st) => terr.filter((t) => (st === 'open' ? t.st === 'open' || t.st === 'lost' : t.st === st) && openAct(t.region)).length;
    const chip = (id, label, n) => `<button class="km-chip${hide[id] ? '' : ' on'}" data-chip="${id}">${label}${n !== undefined ? ` <b>${n}</b>` : ''}</button>`;
    const next = terr.filter((t) => (t.st === 'open' || t.st === 'lost') && openAct(t.region));
    const nextHTML = next.length ? next.map((t) => `<button class="km-row" data-go="${esc(t.n)}"><svg width="22" height="22" viewBox="-11 -11 22 22">${icon(t.boss ? 'boss' : 'joint', t.st)}</svg><span><b>${esc(t.n)}</b><small>${t.st === 'lost' ? 'Retaken · win it back' : `${ACT[t.region].name} · ${route([t.x, t.y], t.region).km.toFixed(1).replace('.', ',')} km`}</small></span></button>`).join('') : '<div class="km-empty">No missions open right now.</div>';
    const own = terr.filter((t) => t.st === 'own').length + 1;
    return `<div class="kmap">
  <div class="km-view" tabindex="0">${s}
    <div class="km-top">
      <div class="km-search"><svg width="18" height="18" viewBox="0 0 24 24"><circle cx="10" cy="10" r="6.5" fill="none" stroke="#5f6368" stroke-width="2.2"/><path d="M15,15 L21,21" stroke="#5f6368" stroke-width="2.4" stroke-linecap="round"/></svg><input class="km-q" type="text" placeholder="Search Kaasland" autocomplete="off" spellcheck="false"><button class="km-qx" title="Clear">×</button></div>
      <div class="km-results"></div>
      <div class="km-chips">${chip('open', 'Missions', count('open'))}${chip('own', 'Yours', own)}${chip('locked', 'Locked')}${chip('wh', 'Warehouses')}${chip('people', 'People')}</div>
    </div>
    <div class="km-card">
      <button class="km-cx" title="Close">×</button>
      <div class="km-c-start"><div class="km-ctitle">${o.van ? 'Where to?' : 'Kaasland'}</div><div class="km-csub">${own}/${terr.length + 1} territories yours</div><div class="km-sect">Missions you can do now</div>${nextHTML}</div>
      <div class="km-c-place"><div class="km-ctitle km-pname"></div><div class="km-csub km-psub"></div><div class="km-pill"></div><div class="km-dir"></div><div class="km-pinfo" id="pininfo"></div></div>
      <div class="km-c-area"></div>
    </div>
    <div class="km-ctrl">
      <button class="km-fab km-me" title="You are here"><svg width="20" height="20" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="${C.blue}"/><circle cx="12" cy="12" r="8" fill="none" stroke="#5f6368" stroke-width="2"/><path d="M12,1V4M12,20V23M1,12H4M20,12H23" stroke="#5f6368" stroke-width="2"/></svg></button>
      <div class="km-zoom"><button data-z="in" title="Zoom in">+</button><button data-z="out" title="Zoom out">−</button></div>
    </div>
    <button class="km-layer" title="Switch map layer"><span class="km-lthumb ${photo ? 'map' : 'sat'}"></span><span>${photo ? 'Kaart' : 'Luchtfoto'}</span></button>
    <div class="km-scale"><span></span><i></i></div>
  </div>
</div>`;
  }

  function bind(root) {
    const vp = root.querySelector('.km-view'), svg = vp && vp.querySelector('.km-svg'); if (!svg) return;
    const pls = [...svg.querySelectorAll('.km-pl')], txts = [...svg.querySelectorAll('.km-t')], selpin = svg.querySelector('.km-selpin');
    const rn = svg.querySelector('.km-roadnames'), rt = svg.querySelector('.km-route'), rtc = svg.querySelector('.km-route-case');
    const card = root.querySelector('.km-card'), cPlace = card.querySelector('.km-c-place'), cArea = card.querySelector('.km-c-area'), cStart = card.querySelector('.km-c-start');
    const sbar = root.querySelector('.km-scale i'), stxt = root.querySelector('.km-scale span');
    const ZMAX = 5; let sc = 1, s0 = 1, vw = 800, vh = 450, bw = W, bh = H;
    const lw = new Map(); // label widths in px
    function measure() { for (const g of pls) { const t = g.querySelector('.km-lab'); if (t) try { lw.set(g, t.getComputedTextLength()); } catch (e) { /* hidden */ } } }
    function apply() {
      const r = vp.getBoundingClientRect(); vw = r.width || 800; vh = r.height || 450;
      s0 = Math.min(vw / W, vh / H); view.z = Math.max(1, Math.min(ZMAX, view.z)); sc = s0 * view.z;
      bw = vw / sc; bh = vh / sc;
      view.cx = bw >= W ? W / 2 : Math.max(bw / 2, Math.min(W - bw / 2, view.cx));
      view.cy = bh >= H ? H / 2 : Math.max(bh / 2, Math.min(H - bh / 2, view.cy));
      const x0 = view.cx - bw / 2, y0 = view.cy - bh / 2;
      svg.setAttribute('viewBox', `${x0} ${y0} ${bw} ${bh}`);
      const k = 1 / sc;
      svg.style.setProperty('--k', k);
      svg.classList.toggle('km-z2', sc >= 1.5); svg.classList.toggle('km-z3', sc >= 2.4);
      rn.setAttribute('font-size', 10 * k);
      for (const g of txts) g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`);
      // places: icons always; names only where they fit (most important first), like a real map app
      const placed = [], hit = (b) => placed.some((p) => b[0] < p[2] && b[2] > p[0] && b[1] < p[3] && b[3] > p[1]);
      const order = pls.slice().sort((a, b) => (+b.dataset.pri + (b.classList.contains('km-sel') ? 9 : 0)) - (+a.dataset.pri + (a.classList.contains('km-sel') ? 9 : 0)));
      for (const g of order) {
        g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`);
        const vis = getComputedStyle(g).display !== 'none'; if (!vis) continue;
        const px = (g.dataset.x - x0) * sc, py = (g.dataset.y - y0) * sc;
        placed.push([px - 9, py - 9, px + 9, py + 9]);
      }
      for (const g of order) {
        const t = g.querySelector('.km-lab'); if (!t) continue;
        const px = (g.dataset.x - x0) * sc, py = (g.dataset.y - y0) * sc, w = lw.get(g) || 60;
        const b = [px + 10, py - 8, px + 14 + w, py + 8];
        const show = getComputedStyle(g).display !== 'none' && (g.classList.contains('km-sel') || +g.dataset.pri >= 3 || !hit(b)); // missions always keep their name
        t.style.display = show ? '' : 'none'; if (show) placed.push(b);
      }
      if (sel) { const g = pls.find((x) => x.dataset.pin === sel); if (g) { selpin.style.display = ''; selpin.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`); } } else selpin.style.display = 'none';
      rt.setAttribute('stroke-width', 5 * k); rtc.setAttribute('stroke-width', 8 * k);
      { const mpp = 6.2 / sc, nice = [50, 100, 200, 250, 500, 1000, 2000].find((m) => m / mpp >= 50) || 2000; sbar.style.width = (nice / mpp) + 'px'; stxt.textContent = nice >= 1000 ? String(nice / 1000).replace('.', ',') + ' km' : nice + ' m'; }
    }
    function zoomAt(f, px, py) {
      const r = vp.getBoundingClientRect(), mx = view.cx + (px - r.left - r.width / 2) / sc, my = view.cy + (py - r.top - r.height / 2) / sc;
      const z0 = view.z; view.z = Math.max(1, Math.min(ZMAX, view.z * f)); const g = z0 / view.z;
      view.cx = mx - (mx - view.cx) * g; view.cy = my - (my - view.cy) * g; apply(); save();
    }
    let anim = 0;
    function flyTo(cx, cy, z) {
      const a = { ...view }, b = { cx, cy, z: Math.max(1, Math.min(ZMAX, z)) }, t0 = performance.now(), id = ++anim;
      const step = (t) => { if (id !== anim) return; const u = Math.min(1, (t - t0) / 420), e = 1 - Math.pow(1 - u, 3); view.cx = a.cx + (b.cx - a.cx) * e; view.cy = a.cy + (b.cy - a.cy) * e; view.z = a.z + (b.z - a.z) * e; apply(); if (u < 1) requestAnimationFrame(step); else save(); };
      requestAnimationFrame(step);
    }
    // keep the card from covering the place: aim a bit right of it when the card is open on a wide screen
    const cardShift = () => (vw > 700 && card.classList.contains('open') ? (card.offsetWidth + 16) / 2 / sc : 0);
    function frame(r) { const [x0, y0, x1, y1] = bbox(r); const z = Math.min(vw / ((x1 - x0) * s0), vh / ((y1 - y0) * s0)) * 0.85; flyTo((x0 + x1) / 2 - (vw > 700 ? (card.offsetWidth + 16) / 2 / (s0 * z) : 0), (y0 + y1) / 2, z); }
    function setCard(mode) { card.classList.toggle('open', true); card.dataset.mode = mode; }
    function drawRoute(t) {
      if (!t) { rt.setAttribute('d', ''); rtc.setAttribute('d', ''); return null; }
      const r = route([t.x, t.y], t.region), d = 'M' + r.pts.map((p) => p.join(',')).join('L');
      rt.setAttribute('d', d); rtc.setAttribute('d', d); return r;
    }
    function selectPlace(n) {
      if (n === 'Kipkruidenkwartier') { sel = null; drawRoute(null); }
      else sel = n;
      for (const g of pls) g.classList.toggle('km-sel', !!sel && g.dataset.pin === sel);
      const t = sel && cur.terr.find((x) => x.n === sel), a = t && ACT[t.region];
      card.querySelector('.km-pname').textContent = t ? t.n : 'Eddy & Zn warehouse';
      card.querySelector('.km-psub').textContent = t ? `${a.name} · ${a.tag}${t.boss ? ' · faction boss' : ''}` : 'Kipkruidenkwartier · home';
      const pill = card.querySelector('.km-pill'); pill.textContent = t ? STLABEL[t.st] : 'You are here'; pill.className = `km-pill km-pill-${t ? t.st : 'home'}`;
      const dir = card.querySelector('.km-dir');
      if (t) {
        const r = cur.van ? drawRoute(t) : (drawRoute(null), route([t.x, t.y], t.region));
        const locked = t.st === 'locked' ? `<div class="km-need">Opens after ${esc(PARENT[t.n] || 'the one before it')}.</div>` : '';
        dir.innerHTML = `<div class="km-eta"><b>${Math.max(1, Math.round(r.km * 2.2))} min</b> (${r.km.toFixed(1).replace('.', ',')} km)${r.via ? ` via ${esc(r.via)}` : ''}</div>${cur.van ? '' : '<div class="km-hint">Get in the Oofmobiel to drive there.</div>'}${locked}`;
      } else dir.innerHTML = '';
      setCard('place'); apply();
    }
    function selectArea(r) {
      sel = null; drawRoute(null); for (const g of pls) g.classList.remove('km-sel');
      const a = ACT[r], ts = cur.terr.filter((t) => t.region === r), mine = ts.filter((t) => t.st === 'own').length + (r === 'start' ? 1 : 0), all = ts.length + (r === 'start' ? 1 : 0);
      const open = cur.openAct(r), h = a.heat && cur.heat ? Math.round(cur.heat[a.heat] || 0) : null;
      cArea.innerHTML = `<div class="km-ctitle">${esc(a.name)}</div><div class="km-csub">${a.tag} · ${esc(a.faction)} turf</div>`
        + `<div class="km-pill km-pill-${open ? (mine === all ? 'own' : 'open') : 'locked'}">${open ? (mine === all ? 'All yours' : 'Open') : 'Locked'}</div>`
        + `<div class="km-prog"><i style="width:${Math.round(mine / all * 100)}%"></i></div><div class="km-csub">${mine} of ${all} territories yours${h !== null && open && mine < all && r !== 'start' ? ` · ${esc(a.faction)} heat ${h}` : ''}</div>`
        + (open ? '' : `<div class="km-need">${esc(a.need)}.</div>`)
        + `<button class="km-btn" data-frame="${r}">Zoom to ${esc(a.name)}</button>`;
      cArea.querySelector('[data-frame]').onclick = () => frame(r);
      setCard('area'); apply();
    }
    const clickPin = (n) => { const el = svg.querySelector(`.km-pl[data-pin="${CSS.escape(n)}"]`); if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true })); };
    const goPlace = (n) => { const t = cur.terr.find((x) => x.n === n); const p = t ? [t.x, t.y] : HOME; clickPin(n); flyTo(p[0] - cardShift(), p[1], Math.max(view.z, 2.4)); };

    // pointer: drag to pan, pinch to zoom
    const pts = new Map(); let dragged = false, start = null, pinch = null;
    const onMap = (e) => !e.target.closest('.km-top,.km-card,.km-ctrl,.km-layer,.km-scale');
    vp.addEventListener('pointerdown', (e) => {
      if (!onMap(e)) return;
      anim++; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { dragged = false; start = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy }; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z }; }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; zoomAt((pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d) / view.z, (a.x + b.x) / 2, (a.y + b.y) / 2); dragged = true; return; }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragged && Math.hypot(dx, dy) > 5) { dragged = true; vp.setPointerCapture(e.pointerId); vp.classList.add('km-drag'); }
      if (dragged) { view.cx = start.cx - dx / sc; view.cy = start.cy - dy / sc; apply(); }
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { if (dragged) save(); start = null; vp.classList.remove('km-drag'); } };
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    vp.addEventListener('click', (e) => {
      if (!onMap(e)) return;
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; return; }
      const pl = e.target.closest('[data-pin]'); if (pl) { selectPlace(pl.dataset.pin); return; }
      const pe = e.target.closest('[data-person]');
      if (pe) { const p = PEOPLE.find((x) => x[0] === pe.dataset.person); sel = null; drawRoute(null); cArea.innerHTML = `<div class="km-ctitle">${esc(p[0])}</div><div class="km-csub">${esc(p[1])}</div><div class="km-pill km-pill-home">On your street</div><div class="km-hint">Walk over from the warehouse.</div>`; setCard('area'); apply(); return; }
      const ar = e.target.closest('[data-area]');
      if (ar) { selectArea(ar.dataset.area); return; }
      // water: back to the start card
      sel = null; drawRoute(null); for (const g of pls) g.classList.remove('km-sel'); card.dataset.mode = 'start'; apply();
    }, true);
    vp.addEventListener('dblclick', (e) => { if (!onMap(e)) return; e.preventDefault(); zoomAt(2, e.clientX, e.clientY); });
    vp.addEventListener('wheel', (e) => { if (!onMap(e)) return; e.preventDefault(); anim++; zoomAt(Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.002), e.clientX, e.clientY); }, { passive: false });
    vp.addEventListener('keydown', (e) => {
      if (e.target.closest('input')) { e.stopPropagation(); return; }
      const st = 60 / sc, k = e.key, r = vp.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      if (k === '+' || k === '=') zoomAt(1.4, mx, my); else if (k === '-') zoomAt(1 / 1.4, mx, my);
      else if (k.startsWith('Arrow')) { view.cx += k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0; view.cy += k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0; apply(); save(); } else return;
      e.preventDefault(); e.stopPropagation();
    });

    root.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => { const r = vp.getBoundingClientRect(); zoomAt(b.dataset.z === 'in' ? 1.6 : 1 / 1.6, r.left + r.width / 2, r.top + r.height / 2); });
    root.querySelector('.km-me').onclick = () => flyTo(HOME[0] - cardShift(), HOME[1], 3);
    root.querySelector('.km-layer').onclick = () => {
      layer = layer === 'photo' ? 'map' : 'photo'; save();
      svg.classList.toggle('km-photo-on', layer === 'photo');
      const b = root.querySelector('.km-layer'); b.querySelector('.km-lthumb').className = `km-lthumb ${layer === 'photo' ? 'map' : 'sat'}`; b.lastElementChild.textContent = layer === 'photo' ? 'Kaart' : 'Luchtfoto';
    };
    root.querySelector('.km-cx').onclick = () => { sel = null; drawRoute(null); for (const g of pls) g.classList.remove('km-sel'); card.dataset.mode = 'start'; apply(); };
    root.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => goPlace(b.dataset.go));
    // chips: show or hide a kind of place
    const applyChips = () => { for (const id of ['open', 'own', 'locked', 'wh', 'people']) svg.classList.toggle(`km-hide-${id}`, !!hide[id]); };
    root.querySelectorAll('[data-chip]').forEach((b) => b.onclick = () => { const id = b.dataset.chip; hide[id] = !hide[id]; b.classList.toggle('on', !hide[id]); save(); applyChips(); apply(); });
    applyChips();
    // search
    const q = root.querySelector('.km-q'), res = root.querySelector('.km-results');
    const items = [
      ...cur.terr.map((t) => ({ n: t.n, sub: `${ACT[t.region].name} · ${STLABEL[t.st]}`, ic: icon(t.boss ? 'boss' : 'joint', t.st), go: () => goPlace(t.n) })),
      ...ACTS.map((a) => ({ n: a.name, sub: `District · ${a.tag}`, ic: '<circle r="7" fill="#9aa0a6"/><path d="M-3,3 V-1 L0,-3.5 L3,-1 V3Z" fill="#fff"/>', go: () => { selectArea(a.r); frame(a.r); } })),
      ...PEOPLE.map(([n, dsc, x, y]) => ({ n, sub: dsc, ic: icon('person'), go: () => { const el = svg.querySelector(`[data-person="${CSS.escape(n)}"]`); if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true })); flyTo(x - cardShift(), y, 4); } })),
      ...PARKS.map(([n, x, y]) => ({ n, sub: 'Park', ic: '<circle r="7" fill="#188038"/><path d="M0,-4 L3.5,1.5 H-3.5Z M-0.8,1.5 H0.8 V4 H-0.8Z" fill="#fff"/>', go: () => flyTo(x * S - cardShift(), y * S, 3) })),
      ...[...new Set(ROADS.map((r) => r[2]))].map((n) => { const r = ROADS.find((x) => x[2] === n), [ax, ay] = pt(r[0]), [bx, by] = pt(r[1]); return { n, sub: r[3] ? 'Bridge' : 'Road', ic: '<circle r="7" fill="#e5c46a"/><path d="M-1,-4 H1 V4 H-1Z" fill="#fff"/>', go: () => flyTo((ax + bx) / 2 - cardShift(), (ay + by) / 2, 3) }; }),
      { n: 'Eddy & Zn warehouse', sub: 'Home · you are here', ic: ICON_DOT.replace('r="16"', 'r="0"'), go: () => goPlace('Kipkruidenkwartier') },
    ];
    const showRes = () => {
      const v = q.value.trim().toLowerCase(); root.querySelector('.km-qx').style.visibility = v ? 'visible' : 'hidden';
      if (!v) { res.innerHTML = ''; res.style.display = 'none'; return; }
      const hits = items.filter((i) => i.n.toLowerCase().includes(v) || i.sub.toLowerCase().includes(v)).slice(0, 7);
      res.innerHTML = hits.length ? hits.map((i, j) => `<button class="km-row" data-hit="${j}"><svg width="22" height="22" viewBox="-11 -11 22 22">${i.ic}</svg><span><b>${esc(i.n)}</b><small>${esc(i.sub)}</small></span></button>`).join('') : '<div class="km-empty">Nothing in Kaasland by that name.</div>';
      res.style.display = 'block';
      res.querySelectorAll('[data-hit]').forEach((b) => b.onclick = () => { const i = hits[+b.dataset.hit]; q.value = i.n; res.style.display = 'none'; i.go(); });
    };
    q.addEventListener('input', showRes);
    q.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') { const b = res.querySelector('[data-hit]'); if (b) b.click(); } if (e.key === 'Escape') { q.value = ''; showRes(); q.blur(); } });
    q.addEventListener('keyup', (e) => e.stopPropagation());
    root.querySelector('.km-qx').onclick = () => { q.value = ''; showRes(); q.focus(); };
    showRes();

    card.dataset.mode = 'start'; card.classList.add('open');
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!vp.isConnected) { ro.disconnect(); return; } apply(); }); ro.observe(vp); }
    measure(); apply();
    if (sel && svg.querySelector(`.km-pl[data-pin="${CSS.escape(sel)}"]`)) setTimeout(() => clickPin(sel), 0); else sel = null;
    if (!opened && !hadSave) { const t = cur.terr.find((x) => (x.st === 'open' || x.st === 'lost') && cur.openAct(x.region)); if (t) frame(t.region); }
    opened = true;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (vp.isConnected) { measure(); apply(); } });
  }

  return { html, bind };
}
