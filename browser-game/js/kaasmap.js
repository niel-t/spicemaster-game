// Map of Kaasland on the Kaasdows 95 PC and in the Oofmobiel: a sketched aerial view of the city (painted by
// kaasaerial.js: rowhouses, canals, villas, fields, sheds, containers, main roads, boats) with the places on it.
// Left: a plain list of every place per district (missions first) and the selected place's details and Drive
// button. Right: the map; drag to move, scroll to zoom, it always opens on the whole city.
//
// Drawn in the 1024x572 space of assets/kaasland_map.jpg. main.js keeps the game logic: it hands over each
// territory's kind and binds the [data-pin] clicks (bindMap fills #pininfo), then calls bind().
import { paintKaasland } from './kaasaerial.js';

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

// the aerial picture is painted once per session, then reused (a blob URL for an SVG <image>)
let aerialURL = null, aerialBusy = null;
function aerial() {
  if (aerialURL || aerialBusy) return aerialBusy || Promise.resolve(aerialURL);
  aerialBusy = new Promise((done) => setTimeout(() => {
    try {
      const cv = paintKaasland({ W, H, REGIONS, MOLEN, PARKS, ROADS, pt, S });
      cv.toBlob((b) => { aerialURL = b ? URL.createObjectURL(b) : cv.toDataURL('image/jpeg', 0.9); done(aerialURL); }, 'image/jpeg', 0.9);
    } catch (e) { done(null); }
  }, 0));
  return aerialBusy;
}
const LAND = [30, 6, 1024, 540]; // the part of the map with land on it: "fit" shows this, not the open sea

export function createKaasMap() {
  let cur = null, sel = null, view = null;

  function html(o) {
    const d = o.done || {};
    const openAct = (r) => !!ACT[r].open(d);
    const terr = o.terr.filter((t) => t.n !== 'Kipkruidenkwartier').map((t) => ({ ...t, st: statusOf(t.k), boss: BOSS.includes(t.n), x: t.region === 'fin' ? MOLEN.cx : (t.box[0] + t.box[2]) / 2, y: t.region === 'fin' ? MOLEN.cy : (t.box[1] + t.box[3]) / 2 }));
    cur = { ...o, terr, openAct };
    let s = `<svg class="km-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${LAND[0]} ${LAND[1]} ${LAND[2] - LAND[0]} ${LAND[3] - LAND[1]}" preserveAspectRatio="xMidYMid meet">
<rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="#1f4656"/>
<g class="km-sketch">${Object.values(REGIONS).map((p) => `<path d="${path(p)}" fill="#8a8172"/>`).join('')}</g>
<image class="km-air" href="${aerialURL || ''}" width="${W}" height="${H}" ${aerialURL ? '' : 'style="opacity:0"'}/>
<g class="km-locks">${ACTS.filter((a) => !openAct(a.r)).map((a) => (a.r === 'fin' ? `<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}"/>` : `<path d="${path(REGIONS[a.r])}"/>`)).join('')}</g>
<path class="km-route-case" d="" fill="none"/><path class="km-route" d="" fill="none"/>
<g class="km-txt">${ACTS.filter((a) => a.r !== 'fin').map((a) => `<g class="km-t km-district" data-x="${ACT_AT[a.r][0] * S}" data-y="${ACT_AT[a.r][1] * S}"><text text-anchor="middle">${a.name.toUpperCase()}</text>${openAct(a.r) ? '' : `<text text-anchor="middle" y="15" class="km-dsub">LOCKED · ${a.tag.toUpperCase()}</text>`}</g>`).join('')}</g>
<g class="km-places">`;
    for (const t of terr) s += `<g class="km-pl km-${t.st}${t.boss ? ' km-boss' : ''}" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${t.x}" data-y="${t.y}" data-pri="${t.st === 'open' || t.st === 'lost' ? 3 : t.boss ? 2 : t.st === 'own' ? 1 : 0}"><circle r="12" fill="transparent"/>${icon(t.boss ? 'boss' : 'joint', t.st)}<g class="km-lab"><rect x="10" y="-8" height="16" rx="3"/><text x="14" y="4">${esc(t.n)}${t.extra ? ` · ${esc(t.extra)}` : ''}</text></g></g>`;
    for (const w of o.warehouses || []) { const t = terr.find((x) => x.n === w.n); if (t) s += `<g class="km-pl km-wh" data-x="${t.x + 12}" data-y="${t.y - 12}" data-pri="-1"><title>${esc(w.name)}</title>${icon('wh')}</g>`; }
    s += `<g class="km-pl km-home" data-pin="Kipkruidenkwartier" data-k="own" data-x="${HOME[0]}" data-y="${HOME[1]}" data-pri="4"><circle r="14" fill="transparent"/>${ICON_DOT}<g class="km-lab"><rect x="11" y="-8" height="16" rx="3"/><text x="15" y="4">You are here</text></g></g>`;
    s += `<g class="km-selpin" style="display:none">${ICON_SEL}</g></g></svg>`;

    // the list on the left: every place you can go, per district, missions first
    const row = (t) => `<button class="km-item km-i-${t.st}${sel === t.n ? ' on' : ''}" data-go="${esc(t.n)}"><svg width="20" height="20" viewBox="-10 -10 20 20">${icon(t.boss ? 'boss' : 'joint', t.st)}</svg><span>${esc(t.n)}</span><em>${STLABEL[t.st]}</em></button>`;
    const ord = { open: 0, lost: 0, own: 1, locked: 2 };
    const groups = ACTS.map((a) => {
      const ts = terr.filter((t) => t.region === a.r).sort((x, y) => ord[x.st] - ord[y.st]), mine = ts.filter((t) => t.st === 'own').length + (a.r === 'start' ? 1 : 0), all = ts.length + (a.r === 'start' ? 1 : 0);
      if (!openAct(a.r)) return `<div class="km-grp km-shut" data-frame="${a.r}"><b>${a.tag} · ${esc(a.name)}</b><small>Locked: ${esc(a.need)}</small></div>`;
      return `<div class="km-grp"><button class="km-gh" data-frame="${a.r}" title="Show on the map"><b>${a.tag} · ${esc(a.name)}</b><small>${mine}/${all}</small></button>${ts.map(row).join('')}</div>`;
    }).join('');
    const own = terr.filter((t) => t.st === 'own').length + 1;
    return `<div class="kmap">
  <div class="km-side">
    <div class="well km-info"><div class="km-ihead"></div><div id="pininfo">${o.van ? 'Where to? Pick a place on the map or in the list.' : 'Click a place on the map or in the list.'}</div></div>
    <div class="km-list">${groups}</div>
  </div>
  <div class="km-main">
    <div class="km-tools"><button class="b95 km-b" data-z="in" title="Zoom in">+</button><button class="b95 km-b" data-z="out" title="Zoom out">−</button><button class="b95" data-z="fit">Whole city</button><button class="b95" data-z="home">You are here</button><span class="km-tip">Drag to move · scroll to zoom</span></div>
    <div class="km-view" tabindex="0">${s}<div class="km-loading">Loading aerial photo…</div></div>
    <div class="km-status"><span class="km-st km-hover">${own}/${terr.length + 1} territories yours</span><span class="km-st km-scale"><i></i><span></span></span></div>
  </div>
</div>`;
  }

  function bind(root) {
    const vp = root.querySelector('.km-view'), svg = vp && vp.querySelector('.km-svg'); if (!svg) return;
    const pls = [...svg.querySelectorAll('.km-pl')], txts = [...svg.querySelectorAll('.km-t')], selpin = svg.querySelector('.km-selpin');
    const rt = svg.querySelector('.km-route'), rtc = svg.querySelector('.km-route-case'), hov = root.querySelector('.km-hover'), hovIdle = hov.textContent;
    const ihead = root.querySelector('.km-ihead'), sbar = root.querySelector('.km-scale i'), stxt = root.querySelector('.km-scale span');
    const ZMAX = 6; let sc = 1, s0 = 1, vw = 800, vh = 450;
    view = { cx: (LAND[0] + LAND[2]) / 2, cy: (LAND[1] + LAND[3]) / 2, z: 1 }; // always opens on the whole city
    const lw = new Map();
    function measure() { for (const g of pls) { const t = g.querySelector('.km-lab text'), r = g.querySelector('.km-lab rect'); if (!t) continue; try { const w = t.getComputedTextLength(); if (w) { lw.set(g, w); r.setAttribute('width', w + 8); } } catch (e) { /* hidden */ } } }
    function apply() {
      const r = vp.getBoundingClientRect(); vw = r.width || 800; vh = r.height || 450;
      const LW = LAND[2] - LAND[0], LH = LAND[3] - LAND[1];
      s0 = Math.min(vw / LW, vh / LH); view.z = Math.max(1, Math.min(ZMAX, view.z)); sc = s0 * view.z;
      const bw = vw / sc, bh = vh / sc;
      view.cx = bw >= LW ? LAND[0] + LW / 2 : Math.max(LAND[0] + bw / 2, Math.min(LAND[2] - bw / 2, view.cx));
      view.cy = bh >= LH ? LAND[1] + LH / 2 : Math.max(LAND[1] + bh / 2, Math.min(LAND[3] - bh / 2, view.cy));
      const x0 = view.cx - bw / 2, y0 = view.cy - bh / 2;
      svg.setAttribute('viewBox', `${x0} ${y0} ${bw} ${bh}`);
      const k = 1 / sc;
      svg.style.setProperty('--k', k); svg.classList.toggle('km-near', sc >= 2.6);
      for (const g of txts) g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`);
      // names: missions always, the rest only where they fit, most important first
      const placed = [], hit = (b) => placed.some((p) => b[0] < p[2] && b[2] > p[0] && b[1] < p[3] && b[3] > p[1]);
      const pri = (g) => +g.dataset.pri + (g.classList.contains('km-sel') ? 9 : 0);
      const order = pls.slice().sort((a, b) => pri(b) - pri(a));
      for (const g of order) { g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`); const px = (g.dataset.x - x0) * sc, py = (g.dataset.y - y0) * sc; placed.push([px - 8, py - 8, px + 8, py + 8]); }
      for (const g of order) {
        const l = g.querySelector('.km-lab'); if (!l) continue;
        const px = (g.dataset.x - x0) * sc, py = (g.dataset.y - y0) * sc, b = [px + 10, py - 8, px + 18 + (lw.get(g) || 60), py + 8];
        const show = pri(g) >= 3 || !hit(b); l.style.display = show ? '' : 'none'; if (show) placed.push(b);
      }
      if (sel) { const g = pls.find((x) => x.dataset.pin === sel); selpin.style.display = ''; selpin.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`); } else selpin.style.display = 'none';
      rt.setAttribute('stroke-width', 4.5 * k); rtc.setAttribute('stroke-width', 7.5 * k);
      { const mpp = 6.2 / sc, nice = [25, 50, 100, 200, 250, 500, 1000, 2000].find((m) => m / mpp >= 50) || 2000; sbar.style.width = (nice / mpp) + 'px'; stxt.textContent = nice >= 1000 ? String(nice / 1000).replace('.', ',') + ' km' : nice + ' m'; }
    }
    function zoomAt(f, px, py) {
      const r = vp.getBoundingClientRect(), mx = view.cx + (px - r.left - r.width / 2) / sc, my = view.cy + (py - r.top - r.height / 2) / sc;
      const z0 = view.z; view.z = Math.max(1, Math.min(ZMAX, view.z * f)); const g = z0 / view.z;
      view.cx = mx - (mx - view.cx) * g; view.cy = my - (my - view.cy) * g; apply();
    }
    let anim = 0;
    function flyTo(cx, cy, z) {
      const a = { ...view }, b = { cx, cy, z: Math.max(1, Math.min(ZMAX, z)) }, t0 = performance.now(), id = ++anim;
      const step = (t) => { if (id !== anim) return; const u = Math.min(1, (t - t0) / 450), e = 1 - Math.pow(1 - u, 3); view.cx = a.cx + (b.cx - a.cx) * e; view.cy = a.cy + (b.cy - a.cy) * e; view.z = a.z + (b.z - a.z) * e; apply(); if (u < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    }
    function frame(r) { const [x0, y0, x1, y1] = bbox(r), LW = LAND[2] - LAND[0], LH = LAND[3] - LAND[1]; flyTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(LW / (x1 - x0), LH / (y1 - y0)) * 0.9); }
    function drawRoute(t) {
      if (!t) { rt.setAttribute('d', ''); rtc.setAttribute('d', ''); return; }
      const d = 'M' + route([t.x, t.y], t.region).pts.map((p) => p.join(',')).join('L'); rt.setAttribute('d', d); rtc.setAttribute('d', d);
    }
    function select(n) {
      sel = n === 'Kipkruidenkwartier' ? null : n;
      for (const g of pls) g.classList.toggle('km-sel', !!sel && g.dataset.pin === sel);
      root.querySelectorAll('.km-item').forEach((b) => b.classList.toggle('on', b.dataset.go === n));
      const t = sel && cur.terr.find((x) => x.n === sel);
      if (t) {
        const r = route([t.x, t.y], t.region);
        ihead.innerHTML = `<b>${esc(t.n)}</b><span class="km-tag km-tag-${t.st}">${STLABEL[t.st]}</span><small>${ACT[t.region].tag} · ${esc(ACT[t.region].name)} · ${Math.max(1, Math.round(r.km * 2.2))} min drive (${r.km.toFixed(1).replace('.', ',')} km)${t.st === 'locked' ? `<br>Opens after ${esc(PARENT[t.n] || 'the one before it')}.` : ''}</small>`;
        drawRoute(cur.van ? t : null);
      } else { ihead.innerHTML = '<b>Eddy &amp; Zn warehouse</b><span class="km-tag km-tag-home">You are here</span>'; drawRoute(null); }
      const it = root.querySelector('.km-item.on'); if (it) it.scrollIntoView({ block: 'nearest' });
      apply();
    }
    const clickPin = (n) => { const el = svg.querySelector(`.km-pl[data-pin="${CSS.escape(n)}"]`); if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true })); };

    // drag to move, wheel or pinch to zoom; a drag never counts as a click
    const pts = new Map(); let dragged = false, start = null, pinch = null;
    vp.addEventListener('pointerdown', (e) => {
      anim++; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { dragged = false; start = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy }; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z }; }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) { const tg = e.target.closest && e.target.closest('[data-pin]'); hov.textContent = tg ? (tg.dataset.pin === 'Kipkruidenkwartier' ? 'Eddy & Zn warehouse · you are here' : tg.dataset.pin) : hovIdle; return; }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; zoomAt((pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d) / view.z, (a.x + b.x) / 2, (a.y + b.y) / 2); dragged = true; return; }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragged && Math.hypot(dx, dy) > 5) { dragged = true; vp.setPointerCapture(e.pointerId); vp.classList.add('km-drag'); }
      if (dragged) { view.cx = start.cx - dx / sc; view.cy = start.cy - dy / sc; apply(); }
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = null; if (!pts.size) { start = null; vp.classList.remove('km-drag'); } };
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    vp.addEventListener('click', (e) => {
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; return; }
      const pl = e.target.closest('[data-pin]'); if (pl) select(pl.dataset.pin);
    }, true);
    vp.addEventListener('dblclick', (e) => { e.preventDefault(); zoomAt(2, e.clientX, e.clientY); });
    vp.addEventListener('wheel', (e) => { e.preventDefault(); anim++; zoomAt(Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.0022), e.clientX, e.clientY); }, { passive: false });
    vp.addEventListener('keydown', (e) => {
      const st = 60 / sc, k = e.key, r = vp.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      if (k === '+' || k === '=') zoomAt(1.4, mx, my); else if (k === '-') zoomAt(1 / 1.4, mx, my);
      else if (k.startsWith('Arrow')) { view.cx += k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0; view.cy += k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0; apply(); } else return;
      e.preventDefault(); e.stopPropagation();
    });
    root.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => {
      const r = vp.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2, z = b.dataset.z;
      if (z === 'in') zoomAt(1.6, mx, my); else if (z === 'out') zoomAt(1 / 1.6, mx, my); else if (z === 'fit') flyTo(view.cx, view.cy, 1); else flyTo(HOME[0], HOME[1], 4);
    });
    root.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { const t = cur.terr.find((x) => x.n === b.dataset.go); if (!t) return; clickPin(t.n); flyTo(t.x, t.y, Math.max(view.z, 3)); });
    root.querySelectorAll('[data-frame]').forEach((b) => b.onclick = () => frame(b.dataset.frame));

    // the aerial photo: instant when it's been painted before, otherwise it fades in
    const img = svg.querySelector('.km-air'), loading = root.querySelector('.km-loading');
    if (aerialURL) loading.remove();
    else aerial().then((u) => { if (!u || !img.isConnected) return; img.setAttribute('href', u); img.style.transition = 'opacity .35s'; img.style.opacity = 1; loading.remove(); });
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!vp.isConnected) { ro.disconnect(); return; } apply(); }); ro.observe(vp); }
    measure(); apply();
    if (sel && svg.querySelector(`.km-pl[data-pin="${CSS.escape(sel)}"]`)) setTimeout(() => clickPin(sel), 0); else sel = null;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (vp.isConnected) { measure(); apply(); } });
  }

  return { html, bind, warm: aerial };
}
