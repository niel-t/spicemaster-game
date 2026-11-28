// Map of Kaasland on the Kaasdows XL PC and in the Oofmobiel: an illustrated city map (laid out in kaasgeo.js,
// painted by kaasaerial.js) with the places on it. Left: a plain list of every place per district (missions
// first) and the selected place's details and Drive button. Right: the map; drag to move, scroll to zoom, and
// it always opens on the whole city. main.js keeps the game logic: it hands over each territory's kind and
// binds the [data-pin] clicks (bindMap fills #pininfo), then calls bind().
import { paintKaasland } from './kaasaerial.js';
import * as G from './kaasgeo.js';

const ACTS = [
  { r: 'start', name: 'Kipkruidenkwartier', tag: 'Prologue', faction: 'Lampas', heat: 'lampas', open: () => true, need: '' },
  { r: 'lampas', name: 'Oud-Vettenburg', tag: 'Act 1', faction: 'Lampas', heat: 'lampas', open: (d) => d.district1, need: 'Take all of Kipkruidenkwartier first' },
  { r: 'nosh', name: 'Hipsterheuvel', tag: 'Act 2', faction: 'Noshgey Kariot', heat: 'noshgey', open: (d) => d.act1, need: 'Beat the Lampas in Oud-Vettenburg first' },
  { r: 'abd', name: 'De Duistere Dokken', tag: 'Act 3', faction: 'Abdavissies', heat: 'abdavissies', open: (d) => d.act2, need: 'Beat the Noshgey Kariot first' },
  { r: 'para', name: 'De Zandwijk', tag: 'Paravim', faction: 'Paravim', heat: 'paravim', open: (d) => d.act2, need: 'Beat the Noshgey Kariot first' },
  { r: 'fin', name: 'De Gouden Molen', tag: 'Finale', faction: 'everyone', heat: null, open: (d) => d.act3, need: 'Beat the Abdavissies first' },
];
const ACT = Object.fromEntries(ACTS.map((a) => [a.r, a]));
const PARENT = { // shown on the place card: "opens after ..."
  Kroketkade: 'Spekbuurt', Uitjesbuurt: 'Spekbuurt', Frietwijk: 'all of Kipkruidenkwartier',
  Sauzenbuurt: 'Frietwijk', Knoflooksteeg: 'Frietwijk', Mayonaisemarkt: 'Frietwijk', 'Halve Kip Plein': 'two of Sauzenbuurt, Knoflooksteeg, Mayonaisemarkt', Bitterbalbuurt: 'two of Sauzenbuurt, Knoflooksteeg, Mayonaisemarkt', Pindasausplein: 'the other six Lampas joints',
  Joppiehaven: 'the end of Act 1', Frikandelhaven: 'Joppiehaven', Havermelkhaven: 'Joppiehaven', 'Kombucha-kwartier': 'Joppiehaven', Gembergracht: 'two harbour joints', 'Avocado-akkers': 'two harbour joints', 'Glutenvrije Gaarde': 'two harbour joints', Quinoaplantage: 'two of Gembergracht, Avocado-akkers, Glutenvrije Gaarde', 'Oat-oase': 'two of Gembergracht, Avocado-akkers, Glutenvrije Gaarde', Speltpolder: 'the other nine Noshgey joints',
  Couscouskade: 'the end of Act 2', "Za'atarmarkt": 'Couscouskade', Sumaksteeg: 'Couscouskade', Harissahof: "Za'atarmarkt and Sumaksteeg", Dadelplein: "Za'atarmarkt and Sumaksteeg", 'Kasbah al Gara': 'the other five Paravim places',
  Komijnkade: 'the end of Act 2', "Kaneelsilo's": 'Komijnkade', Paprikapakhuis: 'Komijnkade', Kruidnagelkade: 'Komijnkade', Peperhaven: "two of Kaneelsilo's, Paprikapakhuis, Kruidnagelkade", Kurkumaloods: "two of Kaneelsilo's, Paprikapakhuis, Kruidnagelkade", Saffraanpier: 'Peperhaven or Kurkumaloods', Nootmuskade: 'Peperhaven or Kurkumaloods', Smokkelsloot: 'Peperhaven or Kurkumaloods', Containerchaos: 'two of Saffraanpier, Nootmuskade, Smokkelsloot', Kardemomdok: 'the other ten dock joints', 'De Gouden Molen': 'the end of Act 3',
};
// De Zandwijk opens with Act 2 done (a side act, optional). Until then these cards stand in for the mission briefings
const PARA_TEXT = {
  'Kasbah al Gara': "<b>Kasbah al Gara</b>: Ras al Gara's fortress on the west quay. The Paravim came out of the desert with nothing but a grudge, and they still have the grudge. Nobody has walked out of here smiling.",
  Couscouskade: "<b>Couscouskade</b>: the Paravim quay. Boats come in from the south at night and nobody asks what is under the couscous.",
  "Za'atarmarkt": "<b>Za'atarmarkt</b>: the Paravim souk. Za'atar, sumak, ras el hanout, and a lot of shouting. Every stall keeper is already angry with you.",
  Harissahof: "<b>Harissahof</b>: a courtyard of harissa pots, red and hot, with guards to match. Two of them are always arguing.",
  Sumaksteeg: "<b>Sumaksteeg</b>: an alley so narrow the Paravim can glare at you from both sides at once.",
  Dadelplein: "<b>Dadelplein</b>: a square of date palms around the oasis, where the Paravim count their Wilders. Loudly.",
};
const BOSS = ['Kasbah al Gara', 'Pindasausplein', 'Speltpolder', 'Kardemomdok', 'De Gouden Molen'];
const C = {
  water: '#a9d3e8', land: '#f3f0ea', street: '#ffffff', park: '#cde8c4', parkInk: '#3b7a3b',
  tint: { start: '#f3f0ea', lampas: '#f6eee8', nosh: '#eef3e6', abd: '#ebf0f3', fin: '#f6efd6' },
  edge: '#b9b2a6', road: '#fde9a4', roadCase: '#e5c46a', ink: '#3c4043', sub: '#70757a', blue: '#1a73e8',
  st: { open: '#e8710a', own: '#188038', lost: '#d93025', locked: '#80868b', para: '#b4542c', air: '#1a73e8', due: '#e8710a', blk: '#6a4a8a' },
};
const STATUS = { own: 'own', lost: 'lost', m1: 'open', m2: 'open', m3: 'open' };
const statusOf = (k) => STATUS[k] || 'locked';
const STLABEL = { open: 'Mission open', own: 'Yours', lost: 'Retaken', locked: 'Locked', para: 'Paravim turf', air: 'Airport', due: 'Pick up Pa', blk: 'Rival · Almere' };
const path = (poly) => 'M' + poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// place icons (screen px around 0,0)
function icon(kind, st) {
  const c = kind === 'wh' ? '#8d6e63' : kind === 'person' ? '#7b5ea7' : C.st[st];
  const r = kind === 'boss' ? 9 : st === 'open' || st === 'lost' ? 8 : 6.5;
  const g = kind === 'wh' ? '<path d="M-4,0.5 L0,-3.5 L4,0.5 V4 H-4Z" fill="#fff"/>'
    : kind === 'person' ? '<circle cy="-2" r="2.2" fill="#fff"/><path d="M-3.8,4 a3.8,3.4 0 0 1 7.6,0Z" fill="#fff"/>'
    : kind === 'air' ? '<path d="M0,-4.6 L0.9,-1.2 L4.4,0.8 V1.8 L0.9,0.6 L0.6,3 L1.8,4 V4.6 L0,4 L-1.8,4.6 V4 L-0.6,3 L-0.9,0.6 L-4.4,1.8 V0.8 L-0.9,-1.2Z" fill="#fff"/>'
    : kind === 'boss' ? '<path d="M-5,3 L-5,-2.5 L-2.5,0 L0,-4.5 L2.5,0 L5,-2.5 L5,3Z" fill="#fff"/>'
    : st === 'own' ? '<path d="M-3,0 L-0.8,2.4 L3.2,-2.4" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
    : (st === 'locked' || st === 'para') ? '<path d="M-2.2,-0.4 V-1.8 a2.2,2.2 0 0 1 4.4,0 V-0.4 M-3,-0.4 H3 V3.2 H-3Z" fill="#fff" stroke="#fff" stroke-width=".7"/>'
    : '<text y="4" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial Black, Arial" fill="#fff">!</text>';
  return `<circle r="${r + 1.5}" fill="#fff"/><circle r="${r}" fill="${c}"/>${g}`;
}
// Almere, across the IJmeer (kaasgeo ALMERE): drawn as vectors, the painted city stops at x = W
function almereSVG() {
  const A = G.ALMERE, pl = (p) => 'M' + p.map(([x, y]) => `${x},${y}`).join('L');
  const hw = G.HIGHWAYS.filter((h) => h.pts.some(([x]) => x > W));
  return `<g class="km-almere"><clipPath id="kmEast"><rect x="${W - 1}" y="-50" width="900" height="${H + 100}"/></clipPath>
<path d="${path(A.land)}" fill="#e4ecd2" stroke="#b8c49a" stroke-width="2"/>
${[0, 1, 2, 3, 4].map((i) => `<path d="M${1300 + i * 44},150 L${1300 + i * 44 + 30},500" stroke="#d2dcba" stroke-width="10" opacity=".55"/>`).join('')}
<ellipse cx="${A.water.cx}" cy="${A.water.cy}" rx="${A.water.rx}" ry="${A.water.ry}" fill="#94c9d7" stroke="#7ab4c4"/>
<rect x="${A.hal[0] - 30}" y="${A.hal[1] - 16}" width="60" height="32" rx="3" fill="#d8d2c4" stroke="#b0a890"/>${[0, 1, 2].map((i) => `<rect x="${A.hal[0] - 24 + i * 17}" y="${A.hal[1] - 11}" width="13" height="22" fill="#b8b0a0"/>`).join('')}
${A.roads.map((r) => `<path d="${pl(r)}" fill="none" stroke="#e5c46a" stroke-width="6" stroke-linecap="round"/><path d="${pl(r)}" fill="none" stroke="#fde9a4" stroke-width="4" stroke-linecap="round"/>`).join('')}
<g clip-path="url(#kmEast)">${hw.map((h) => `<path d="${pl(h.pts)}" fill="none" stroke="#6a2a1e" stroke-width="9.4" stroke-linecap="round"/><path d="${pl(h.pts)}" fill="none" stroke="#e8643a" stroke-width="7.6" stroke-linecap="round"/>`).join('')}</g>
${hw.filter((h) => h.bridge).map((h) => `<path d="${pl(h.bridge)}" fill="none" stroke="#f6f2e8" stroke-width="2" stroke-dasharray="4 3" transform="translate(5,4)"/>`).join('')}
${A.names.map(([t, x, y, f]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${f}" font-weight="${f > 12 ? 900 : 700}" font-family="Arial, sans-serif" fill="${t === 'IJmeer' ? '#4a7f94' : '#4a5a3a'}" letter-spacing="${f > 12 ? 3 : 0.5}" ${t === 'IJmeer' ? 'font-style="italic"' : ''}>${t}</text>`).join('')}
</g>`;
}
const ICON_DOT = `<circle class="km-halo" r="16" fill="rgba(26,115,232,.18)"/><circle r="7.5" fill="#fff"/><circle r="5.5" fill="${C.blue}"/>`;
const ICON_SEL = '<path d="M0,0 C-3,-8 -11,-13 -11,-22 A11,11 0 0 1 11,-22 C11,-13 3,-8 0,0Z" fill="#ea4335" stroke="#a52714" stroke-width="1"/><circle cy="-22" r="4" fill="#7a1a0e"/>';

const { W, H, PLACES, PARA_PLACES, HOME, REGIONS, ISLAND, ROADS, CANALS, CANAL_NAMES, ACT_AT, M_PER_UNIT, route, bboxOf, arc } = G;

// the city picture is painted once per session, then reused (a blob URL for an SVG <image>)
let aerialURL = null, aerialBusy = null;
function aerial() {
  if (aerialURL) return Promise.resolve(aerialURL);
  if (aerialBusy) return aerialBusy;
  aerialBusy = new Promise((done) => setTimeout(() => {
    try {
      const cv = paintKaasland({ R: 2.5 });
      cv.toBlob((b) => { aerialURL = b ? URL.createObjectURL(b) : cv.toDataURL('image/jpeg', 0.92); done(aerialURL); }, 'image/jpeg', 0.92);
    } catch (e) { console.error(e); done(null); }
  }, 0));
  return aerialBusy;
}
// one label per road name, on its longest piece, written left to right
const ROAD_LABELS = (() => {
  const best = {};
  for (const r of ROADS) { if (r.ring) continue; const [a, b] = [r.pts[0], r.pts[r.pts.length - 1]], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (l > 40 && (!best[r.name] || l > best[r.name].l)) best[r.name] = { l, pts: a[0] <= b[0] ? r.pts : r.pts.slice().reverse() }; }
  const ring = arc(160, 110, G.RING_R, 4);
  return [...Object.entries(best).map(([n, v]) => [n, v.pts]), ['Ringweg', ring], ['Ringweg', arc(70, 20, G.RING_R, 4)]];
})();

export function createKaasMap() {
  let cur = null, sel = null, view = null;

  function html(o) {
    const d = o.done || {};
    const openAct = (r) => !!ACT[r].open(d);
    const terr = o.terr.filter((t) => t.n !== 'Kipkruidenkwartier' && PLACES[t.n]).map((t) => ({ ...t, st: statusOf(t.k), boss: BOSS.includes(t.n), x: PLACES[t.n][0], y: PLACES[t.n][1] }));
    for (const [n, [x, y]] of Object.entries(PARA_PLACES)) { const pk = openAct('para') && o.para && o.para[n]; terr.push(pk ? { n, k: pk, st: statusOf(pk), region: 'para', boss: BOSS.includes(n), x, y } : { n, k: 'para', st: 'para', region: 'para', boss: BOSS.includes(n), x, y, para: true }); }
    if (o.air) terr.push({ n: 'Schiptagat', k: 'air', st: o.air, region: 'start', air: true, x: G.AIRPORT.pin[0], y: G.AIRPORT.pin[1] }); // the airport: a landmark, and where Pa lands
    if (o.almere && o.almere.known) terr.push({ n: 'Blokaas Specijeren', k: 'blk', st: 'blk', region: 'almere', almere: true, x: G.ALMERE.hal[0], y: G.ALMERE.hal[1] - 2 }); // the rivals' hall (js/blokaas.js)
    cur = { ...o, terr, openAct };
    let s = `<svg class="km-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
<defs>${ROAD_LABELS.map(([, p], i) => `<path id="kmRd${i}" d="${path(p).slice(0, -1)}"/>`).join('')}${CANALS.map((r, i) => `<path id="kmCn${i}" d="${path(arc(150, 30, r, 3)).slice(0, -1)}"/>`).join('')}<path id="kmRiver" d="M80,268 C300,262 500,286 760,276"/></defs>
<rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="#94c9d7"/>
<image class="km-air" href="${aerialURL || ''}" width="${W}" height="${H}" ${aerialURL ? '' : 'style="opacity:0"'}/>
<clipPath id="kmCity"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath><g class="km-locks" clip-path="url(#kmCity)">${ACTS.filter((a) => !openAct(a.r)).map((a) => (a.r === 'fin' ? `<ellipse cx="${ISLAND.cx}" cy="${ISLAND.cy}" rx="${ISLAND.rx}" ry="${ISLAND.ry}"/>` : `<path d="${path(REGIONS[a.r])}"/>`)).join('')}</g>
<g class="km-snelweg">${G.HIGHWAYS.map((h) => h.shields.map(([x, y]) => `<g transform="translate(${x},${y})"><rect x="-19" y="-10" width="38" height="20" rx="4.5" fill="#c8102e" stroke="#fff" stroke-width="1.8"/><text y="5" text-anchor="middle" font-size="13.5" font-weight="900" font-family="Arial, sans-serif" fill="#fff">${h.id}</text></g>`).join('')).join('')}</g>
<g class="km-roadnames">${ROAD_LABELS.map(([n], i) => `<text dy="3.4"><textPath href="#kmRd${i}" startOffset="50%" text-anchor="middle">${esc(n)}</textPath></text>`).join('')}</g>
<g class="km-canalnames">${CANAL_NAMES.map((n, i) => `<text dy="3.4"><textPath href="#kmCn${i}" startOffset="50%" text-anchor="middle">${esc(n)}</textPath></text>`).join('')}</g>
<text class="km-water"><textPath href="#kmRiver" startOffset="50%" text-anchor="middle">D e   K a a s</textPath></text>
${o.almere && o.almere.known ? almereSVG() : ''}
<path class="km-route-case" d="" fill="none"/><path class="km-route" d="" fill="none"/>
<g class="km-txt">${ACTS.filter((a) => a.r !== 'fin').map((a) => `<g class="km-t km-district km-d-${a.r}" data-x="${ACT_AT[a.r][0]}" data-y="${ACT_AT[a.r][1]}"><text text-anchor="middle">${a.name.toUpperCase()}</text>${openAct(a.r) ? '' : `<text text-anchor="middle" y="14" class="km-dsub">${a.r === 'para' ? 'PARAVIM · RAS AL GARA' : `LOCKED · ${a.tag.toUpperCase()}`}</text>`}</g>`).join('')}<g class="km-t km-district km-d-bay" data-x="1120" data-y="232"><text text-anchor="middle" class="km-bay">Kaasbaai</text></g></g>
<g class="km-places">`;
    for (const t of terr) s += `<g class="km-pl km-${t.st}${t.boss ? ' km-boss' : ''}" ${t.para ? 'data-para' : 'data-pin'}="${esc(t.n)}" data-k="${t.k}" data-x="${t.x}" data-y="${t.y}" data-pri="${t.st === 'open' || t.st === 'lost' || t.st === 'due' ? 3 : t.boss ? 2 : t.st === 'own' ? 1 : 0}"><circle r="12" fill="transparent"/>${icon(t.air ? 'air' : t.almere ? 'person' : t.boss ? 'boss' : 'joint', t.st)}<g class="km-lab"><rect x="10" y="-8" height="16" rx="8"/><text x="16" y="4">${esc(t.n)}${t.extra ? ` · ${esc(t.extra)}` : ''}</text></g></g>`;
    for (const w of o.warehouses || []) { const t = terr.find((x) => x.n === w.n); if (t) s += `<g class="km-pl km-wh" data-x="${t.x + 12}" data-y="${t.y - 12}" data-pri="-1"><title>${esc(w.name)}</title>${icon('wh')}</g>`; }
    s += `<g class="km-pl km-home" data-pin="Kipkruidenkwartier" data-k="own" data-x="${HOME[0]}" data-y="${HOME[1]}" data-pri="4"><circle r="14" fill="transparent"/>${ICON_DOT}<g class="km-lab"><rect x="11" y="-8" height="16" rx="8"/><text x="17" y="4">You are here</text></g></g>`;
    s += `<g class="km-selpin" style="display:none">${ICON_SEL}</g></g></svg>`;

    const row = (t) => `<button class="km-item km-i-${t.st}${sel === t.n ? ' on' : ''}" data-go="${esc(t.n)}"><svg width="20" height="20" viewBox="-10 -10 20 20">${icon(t.air ? 'air' : t.boss ? 'boss' : 'joint', t.st)}</svg><span>${esc(t.n)}</span><em>${STLABEL[t.st]}</em></button>`;
    const ord = { open: 0, lost: 0, due: 0, own: 1, air: 1, locked: 2, para: 2 };
    const groups = ACTS.map((a) => {
      const ts = terr.filter((t) => t.region === a.r).sort((x, y) => ord[x.st] - ord[y.st]), mine = ts.filter((t) => t.st === 'own').length + (a.r === 'start' ? 1 : 0), all = ts.filter((t) => !t.air).length + (a.r === 'start' ? 1 : 0);
      if (a.r === 'para') return `<div class="km-grp"><button class="km-gh km-gh-para" data-frame="para" title="Show on the map"><b>Paravim · De Zandwijk</b><small>${openAct('para') ? `${mine}/${all}` : 'side act'}</small></button><div class="km-pnote">Ras al Gara's desert clan. Always angry, the toughest crew in Kaasland.${openAct('para') ? ' Optional, and hard: three hits each.' : ' Opens once the Noshgey Kariot are beaten.'}</div>${ts.map(row).join('')}</div>`;
      if (!openAct(a.r)) return `<div class="km-grp km-shut" data-frame="${a.r}"><b>${a.tag} · ${esc(a.name)}</b><small>Locked: ${esc(a.need)}</small></div>`;
      return `<div class="km-grp"><button class="km-gh" data-frame="${a.r}" title="Show on the map"><b>${a.tag} · ${esc(a.name)}</b><small>${mine}/${all}</small></button>${ts.map(row).join('')}</div>`;
    }).join('') + terr.filter((t) => t.almere).map((t) => `<div class="km-grp"><button class="km-gh km-gh-blk" data-go="${esc(t.n)}" title="Show on the map"><b>Rivals · Almere</b><small>over the IJmeer</small></button><div class="km-pnote">Gert and Wilma Blokaas, of Blokaas Specijeren. Cheaper than you, and proud of it.</div>${row(t)}</div>`).join(''); // the rivals (js/blokaas.js)
    const own = terr.filter((t) => t.st === 'own').length + 1, nTerr = terr.filter((t) => !t.para && !t.air && !t.almere).length;
    return `<div class="kmap">
  <div class="km-side">
    <div class="well km-info"><div class="km-ihead"></div><div id="pininfo">${o.van ? 'Where to? Pick a place on the map or in the list.' : 'Click a place on the map or in the list.'}</div></div>
    <div class="km-list">${groups}</div>
  </div>
  <div class="km-main">
    <div class="km-tools"><button class="b95 km-b" data-z="in" title="Zoom in">+</button><button class="b95 km-b" data-z="out" title="Zoom out">−</button><button class="b95" data-z="fit">Whole city</button><button class="b95" data-z="home">You are here</button><span class="km-tip">${document.body.classList.contains('touch') ? 'Drag to move · pinch to zoom' : 'Drag to move · scroll to zoom'}</span></div>
    <div class="km-view" tabindex="0">${s}<div class="km-loading">Drawing Kaasland…</div></div>
    <div class="km-status"><span class="km-st km-hover">${own}/${nTerr + 1} territories yours</span><span class="km-st km-scale"><i></i><span></span></span></div>
  </div>
</div>`;
  }

  function bind(root) {
    const vp = root.querySelector('.km-view'), svg = vp && vp.querySelector('.km-svg'); if (!svg) return;
    const pls = [...svg.querySelectorAll('.km-pl')], txts = [...svg.querySelectorAll('.km-t')], selpin = svg.querySelector('.km-selpin');
    const rt = svg.querySelector('.km-route'), rtc = svg.querySelector('.km-route-case'), hov = root.querySelector('.km-hover'), hovIdle = hov.textContent;
    const rn = svg.querySelector('.km-roadnames'), cn = svg.querySelector('.km-canalnames'), wn = svg.querySelector('.km-water');
    const ihead = root.querySelector('.km-ihead'), sbar = root.querySelector('.km-scale i'), stxt = root.querySelector('.km-scale span');
    const ZMAX = 5; let sc = 1, s0 = 1, vw = 800, vh = 450;
    view = { cx: W / 2, cy: H / 2, z: 1 }; // always opens on the whole city
    const lw = new Map();
    function measure() { for (const g of pls) { const t = g.querySelector('.km-lab text'), r = g.querySelector('.km-lab rect'); if (!t) continue; try { const w = t.getComputedTextLength(); if (w) { lw.set(g, w); r.setAttribute('width', w + 12); } } catch (e) { /* hidden */ } } }
    function apply() {
      const r = vp.getBoundingClientRect(); vw = r.width || 800; vh = r.height || 450;
      s0 = Math.max(vw / W, vh / H); // fill the window: no empty bands around the city
      view.z = Math.max(1, Math.min(ZMAX, view.z)); sc = s0 * view.z;
      const bw = vw / sc, bh = vh / sc;
      const EW = cur && cur.almere && cur.almere.known ? G.ALMERE.east : W; // Almere lies east of the painted city
      view.cx = Math.max(bw / 2, Math.min(EW - bw / 2, view.cx)); view.cy = Math.max(bh / 2, Math.min(H - bh / 2, view.cy));
      const x0 = view.cx - bw / 2, y0 = view.cy - bh / 2;
      svg.setAttribute('viewBox', `${x0} ${y0} ${bw} ${bh}`);
      const k = 1 / sc;
      svg.style.setProperty('--k', k); svg.classList.toggle('km-z2', sc >= 1.6); svg.classList.toggle('km-z3', sc >= 2.6);
      rn.setAttribute('font-size', 10 * k); cn.setAttribute('font-size', 9.5 * k); wn.setAttribute('font-size', Math.max(13, 15 * k));
      for (const g of txts) g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`);
      const placed = [], hit = (b) => placed.some((p) => b[0] < p[2] && b[2] > p[0] && b[1] < p[3] && b[3] > p[1]);
      const pri = (g) => +g.dataset.pri + (g.classList.contains('km-sel') ? 9 : 0);
      const order = pls.slice().sort((a, b) => pri(b) - pri(a));
      for (const g of order) { g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`); const px = (g.dataset.x - x0) * sc, py = (g.dataset.y - y0) * sc; placed.push([px - 8, py - 8, px + 8, py + 8]); }
      for (const g of order) {
        const l = g.querySelector('.km-lab'); if (!l) continue;
        // the name goes right of the icon, or left when the right side is taken
        const px = (g.dataset.x - x0) * sc, py = (g.dataset.y - y0) * sc, w = lw.get(g) || 60, right = [px + 10, py - 8, px + 22 + w, py + 8], left = [px - 22 - w, py - 8, px - 10, py + 8];
        const side = !hit(right) ? 'r' : !hit(left) ? 'l' : pri(g) >= 3 ? 'r' : '', b = side === 'l' ? left : right;
        l.style.display = side ? '' : 'none'; if (!side) continue; placed.push(b);
        if (l.dataset.side !== side) { const rc = l.querySelector('rect'), tx = l.querySelector('text'); l.dataset.side = side; rc.setAttribute('x', side === 'l' ? -(w + 22) : 10); tx.setAttribute('x', side === 'l' ? -16 : 16); tx.setAttribute('text-anchor', side === 'l' ? 'end' : 'start'); }
      }
      if (sel) { const g = pls.find((x) => (x.dataset.pin || x.dataset.para) === sel); selpin.style.display = ''; selpin.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k})`); } else selpin.style.display = 'none';
      rt.setAttribute('stroke-width', 4.5 * k); rtc.setAttribute('stroke-width', 7.5 * k);
      { const mpp = M_PER_UNIT / sc, nice = [25, 50, 100, 200, 250, 500, 1000, 2000].find((m) => m / mpp >= 50) || 2000; sbar.style.width = (nice / mpp) + 'px'; stxt.textContent = nice >= 1000 ? String(nice / 1000).replace('.', ',') + ' km' : nice + ' m'; }
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
    function frame(r) { const [x0, y0, x1, y1] = bboxOf(r); flyTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(vw / ((x1 - x0) * s0), vh / ((y1 - y0) * s0)) * 0.92); }
    function drawRoute(t) {
      if (!t) { rt.setAttribute('d', ''); rtc.setAttribute('d', ''); return; }
      const d = 'M' + route([t.x, t.y], t.region).pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L'); rt.setAttribute('d', d); rtc.setAttribute('d', d);
    }
    function select(n) {
      sel = n === 'Kipkruidenkwartier' ? null : n;
      for (const g of pls) g.classList.toggle('km-sel', !!sel && (g.dataset.pin || g.dataset.para) === sel);
      root.querySelectorAll('.km-item').forEach((b) => b.classList.toggle('on', b.dataset.go === n));
      const t = sel && cur.terr.find((x) => x.n === sel);
      if (t && t.almere) {
        ihead.innerHTML = `<b>${esc(t.n)}</b><span class="km-tag km-tag-blk">${STLABEL.blk}</span><small>Rival spice mixer · Almere-Buiten · about 38 min drive (A10, A1, then the A6 over the IJmeer)</small>`;
        if (cur.van) { const r = route(G.NODES.re.slice(0, 2), 'abd').pts.concat(G.HIGHWAYS.find((h) => h.id === 'A6').pts, [G.ALMERE.hal]); const d = 'M' + r.map((p) => p.map((v) => v.toFixed(1)).join(',')).join('L'); rt.setAttribute('d', d); rtc.setAttribute('d', d); } else drawRoute(null);
      } else if (t) {
        const r = route([t.x, t.y], t.region);
        ihead.innerHTML = `<b>${esc(t.n)}</b><span class="km-tag km-tag-${t.st}">${STLABEL[t.st]}</span><small>${ACT[t.region].tag} · ${esc(ACT[t.region].name)} · ${Math.max(1, Math.round(r.km * 2.2))} min drive (${r.km.toFixed(1).replace('.', ',')} km${r.via ? ` via ${esc(r.via)}` : ''})${t.st === 'locked' ? `<br>Opens after ${esc(PARENT[t.n] || 'the one before it')}.` : ''}</small>`;
        drawRoute(cur.van ? t : null);
        if (t.para) { const pi = root.querySelector('#pininfo'); if (pi) pi.innerHTML = `${PARA_TEXT[t.n] || ''}<br><i>Paravim turf. Opens once the Noshgey Kariot are beaten.</i>`; }
      } else { ihead.innerHTML = '<b>Eddy &amp; Zn warehouse</b><span class="km-tag km-tag-home">You are here</span>'; drawRoute(null); }
      const it = root.querySelector('.km-item.on'); if (it) it.scrollIntoView({ block: 'nearest' });
      apply();
    }
    const clickPin = (n) => { const el = svg.querySelector(`.km-pl[data-pin="${CSS.escape(n)}"], .km-pl[data-para="${CSS.escape(n)}"]`); if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true })); };

    const pts = new Map(); let dragged = false, start = null, pinch = null;
    vp.addEventListener('pointerdown', (e) => {
      anim++; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { dragged = false; start = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy }; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z }; }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) { const tg = e.target.closest && e.target.closest('[data-pin],[data-para]'); hov.textContent = tg ? (tg.dataset.pin === 'Kipkruidenkwartier' ? 'Eddy & Zn warehouse · you are here' : tg.dataset.para ? `${tg.dataset.para} · Paravim turf` : tg.dataset.pin) : hovIdle; return; }
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
      const pl = e.target.closest('[data-pin],[data-para]'); if (pl) select(pl.dataset.pin || pl.dataset.para);
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
      if (z === 'in') zoomAt(1.6, mx, my); else if (z === 'out') zoomAt(1 / 1.6, mx, my); else if (z === 'fit') flyTo(W / 2, H / 2, 1); else flyTo(HOME[0], HOME[1], 3.2);
    });
    root.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { const t = cur.terr.find((x) => x.n === b.dataset.go); if (!t) return; clickPin(t.n); flyTo(t.x, t.y, Math.max(view.z, 2.6)); });
    root.querySelectorAll('[data-frame]').forEach((b) => b.onclick = () => frame(b.dataset.frame));

    const img = svg.querySelector('.km-air'), loading = root.querySelector('.km-loading');
    if (aerialURL) loading.remove();
    else aerial().then((u) => { if (!u || !img.isConnected) return; img.setAttribute('href', u); img.style.transition = 'opacity .35s'; img.style.opacity = 1; loading.remove(); });
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!vp.isConnected) { ro.disconnect(); return; } apply(); }); ro.observe(vp); }
    measure(); apply();
    if (sel && svg.querySelector(`.km-pl[data-pin="${CSS.escape(sel)}"], .km-pl[data-para="${CSS.escape(sel)}"]`)) setTimeout(() => clickPin(sel), 0); else sel = null;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (vp.isConnected) { measure(); apply(); } });
  }

  return { html, bind, warm: aerial };
}
