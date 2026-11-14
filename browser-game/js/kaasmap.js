// Map of Kaasland, on the Kaasdows 95 PC and in the Oofmobiel.
//
// Design: the map answers four questions, in this order of loudness:
//   1. Where can I go next?   gold "!" markers, a Next-up list, a route line from the warehouse (van)
//   2. What is mine?          saffron markers with a tick, solid saffron paths, act progress bars
//   3. What's locked and why? acts you haven't reached sit under fog with one plaque that says what opens them;
//                             inside an open act, locked joints are small grey padlocks on a dashed path
//   4. Where's trouble?       joints a faction took back are red "!" markers, and heat sits next to the act
// Colour is only spent on meaning (status). The land is quiet parchment; each act gets a faint tint and its
// faction colour on the coastline. Missions are shown as a path (who unlocks whom), like a campaign map.
//
// Drawn as SVG in the 1024x572 space of assets/kaasland_map.jpg. main.js keeps the game logic: it hands over
// each territory's kind and binds the [data-pin] clicks (bindMap), then calls bind() for pan/zoom/selection.

const W = 1024, H = 572, S = 0.64; // outlines were traced on the 1600 px painted map
const P = (pts) => pts.map(([x, y]) => [x * S, y * S]);
const REGIONS = {
  nosh: P([[190, 250], [230, 165], [390, 95], [590, 55], [840, 35], [1100, 45], [1330, 60], [1590, 15], [1597, 105], [1500, 140], [1420, 190], [1300, 240], [1100, 268], [900, 272], [700, 268], [480, 262], [420, 255], [395, 315], [300, 330], [245, 300]]),
  lampas: P([[100, 265], [160, 250], [245, 300], [330, 345], [985, 345], [975, 420], [860, 520], [790, 545], [255, 590], [255, 785], [130, 810], [65, 580], [75, 400]]),
  start: P([[255, 590], [790, 545], [790, 800], [500, 835], [140, 800], [255, 785]]),
  abd: P([[800, 545], [960, 440], [1000, 410], [1100, 345], [1500, 335], [1515, 385], [1490, 450], [1510, 620], [1480, 740], [1300, 800], [850, 830], [795, 800]]),
};
const MOLEN = { cx: 965 * S, cy: 318 * S, rx: 40 * S, ry: 17 * S };
const BRIDGES = [P([[440, 262], [420, 348]]), P([[735, 270], [735, 348]]), P([[1390, 245], [1392, 338]]), P([[-20, 890], [150, 795]]), P([[1590, 105], [1640, 150]])];

// the acts, in story order
const ACTS = [
  { r: 'start', name: 'Kipkruidenkwartier', tag: 'Prologue', faction: 'Lampas', heat: 'lampas', open: () => true, need: '' },
  { r: 'lampas', name: 'Oud-Vettenburg', tag: 'Act 1', faction: 'Lampas', heat: 'lampas', open: (d) => d.district1, need: 'Take all of Kipkruidenkwartier' },
  { r: 'nosh', name: 'Hipsterheuvel', tag: 'Act 2', faction: 'Noshgey Kariot', heat: 'noshgey', open: (d) => d.act1, need: 'Beat the Lampas in Oud-Vettenburg' },
  { r: 'abd', name: 'De Duistere Dokken', tag: 'Act 3', faction: 'Abdavissies', heat: 'abdavissies', open: (d) => d.act2, need: 'Beat the Noshgey Kariot first' },
  { r: 'fin', name: 'De Gouden Molen', tag: 'Finale', faction: 'everyone', heat: null, open: (d) => d.act3, need: 'Beat the Abdavissies first' },
];
const ACT = Object.fromEntries(ACTS.map((a) => [a.r, a]));
// where each act's name and fog plaque sit (1600 px coords)
const ACT_AT = { start: [522, 612], lampas: [600, 390], nosh: [800, 120], abd: [1180, 590], fin: [1200, 307] };
// which joint opens which (drawn as the mission path). One parent each keeps it a readable tree;
// the real rules ("two of these three") live in main.js and in the locked card's text.
const PARENT = {
  Kroketkade: 'Spekbuurt', Uitjesbuurt: 'Spekbuurt',
  Sauzenbuurt: 'Frietwijk', Knoflooksteeg: 'Frietwijk', Mayonaisemarkt: 'Frietwijk', 'Halve Kip Plein': 'Knoflooksteeg', Bitterbalbuurt: 'Mayonaisemarkt', Pindasausplein: 'Sauzenbuurt',
  Frikandelhaven: 'Joppiehaven', Havermelkhaven: 'Joppiehaven', 'Kombucha-kwartier': 'Havermelkhaven', Gembergracht: 'Kombucha-kwartier', 'Avocado-akkers': 'Gembergracht', 'Glutenvrije Gaarde': 'Gembergracht', Quinoaplantage: 'Avocado-akkers', 'Oat-oase': 'Glutenvrije Gaarde', Speltpolder: 'Oat-oase',
  "Kaneelsilo's": 'Komijnkade', Paprikapakhuis: 'Komijnkade', Kruidnagelkade: "Kaneelsilo's", Peperhaven: 'Paprikapakhuis', Kurkumaloods: 'Peperhaven', Smokkelsloot: 'Kurkumaloods', Saffraanpier: 'Kruidnagelkade', Nootmuskade: 'Saffraanpier', Containerchaos: 'Smokkelsloot', Kardemomdok: 'Containerchaos',
};
const BOSS = ['Pindasausplein', 'Speltpolder', 'Kardemomdok', 'De Gouden Molen'];
const HOME = [240, 442]; // the Eddy & Zn warehouse
const PEOPLE = [ // the street around the warehouse, shown when you zoom in on it
  ['Schmatzel', 'Shoarma Schmatzel: a free broodje and old stories', 262, 434],
  ['Nabil', 'at the card table in Schmatzel’s', 270, 449],
  ['The Russian', 'Pandjeshuis Spasibo, east end of the street', 292, 430],
  ['Garage Mo', 'Oofmobiel upgrades', 216, 454],
];

const C = { // quiet land, colour only for meaning (spice palette from project memory)
  water: '#2a4552', wave: '#33525f', land: '#e4d9c1', street: '#fbf6ea', ink: '#3b2c1f',
  tint: { start: '#eee4cf', lampas: '#ead0bd', nosh: '#d9e2bf', abd: '#cdd9dc', fin: '#efdf9f' },
  coast: { start: '#8a7a66', lampas: '#b5482f', nosh: '#6c8b3c', abd: '#3f6f87', fin: '#b8902a' },
  own: '#e8a33d', open: '#f2c14e', lost: '#cf3b28', locked: '#9b9284', fog: '#3a332d',
};
const STATUS = { own: 'own', lost: 'lost', m1: 'open', m2: 'open', m3: 'open' };
const statusOf = (k) => STATUS[k] || 'locked';
const path = (poly) => 'M' + poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const bbox = (r) => (r === 'fin' ? [MOLEN.cx - 70, MOLEN.cy - 40, MOLEN.cx + 120, MOLEN.cy + 40] : REGIONS[r].reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [1e9, 1e9, -1e9, -1e9]));

// markers, in screen pixels around (0,0); apply() scales them by 1/zoom so they keep their size
function marker(st, boss) {
  const fill = C[st], big = st === 'open' || st === 'lost', r = boss ? 9 : big ? 8 : st === 'own' ? 6.5 : 5.5;
  const body = boss ? `<rect x="${-r}" y="${-r}" width="${2 * r}" height="${2 * r}" rx="2.5" fill="${fill}" stroke="${C.ink}" stroke-width="1.6"/>` : `<circle r="${r}" fill="${fill}" stroke="${C.ink}" stroke-width="1.6"/>`;
  const glyph = st === 'own' ? `<path d="M${-r * 0.5},0 L${-r * 0.1},${r * 0.42} L${r * 0.55},${-r * 0.45}" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`
    : big ? `<text y="4.2" text-anchor="middle" font-size="12" font-weight="900" font-family="Arial Black, Arial" fill="${st === 'lost' ? '#fff' : C.ink}">!</text>`
    : boss ? '<path d="M-5,3 L-5,-2.5 L-2.5,0 L0,-4.5 L2.5,0 L5,-2.5 L5,3Z" fill="#fff"/>'
    : '<path d="M-2.4,-0.6 V-2 a2.4,2.4 0 0 1 4.8,0 V-0.6 M-3.2,-0.6 H3.2 V3.4 H-3.2Z" fill="#fff" stroke="#fff" stroke-width=".8"/>';
  const ring = big ? `<circle class="km-ring" r="${r + 3}" fill="none" stroke="${fill}" stroke-width="2.2"/>` : '';
  return ring + body + glyph;
}
const ICON_HERE = (van) => `<circle class="km-ring" r="11" fill="none" stroke="#e8432a" stroke-width="2.4"/>${van
  ? '<rect x="-9" y="-5.5" width="18" height="11" rx="3" fill="#2f6fb5" stroke="#fff" stroke-width="1.6"/><rect x="2" y="-3.5" width="5" height="7" rx="1" fill="#bfe3ff"/>'
  : '<path d="M0,-11 L7.5,7 L0,3 L-7.5,7Z" fill="#e8432a" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/>'}`;
const ICON_WH = '<path d="M-7,-0.5 L0,-7 L7,-0.5 L7,6.5 L-7,6.5Z" fill="#fbf6ea" stroke="#3b2c1f" stroke-width="1.5"/><rect x="-2.6" y="1.2" width="5.2" height="5.3" fill="#7a2e1a"/>';

export function createKaasMap() {
  let view = { cx: W / 2, cy: H / 2, z: 1 };
  let showAll = false; // names of your own and locked joints at every zoom level
  try { const s = JSON.parse(localStorage.getItem('sme.kmap2') || 'null'); if (s) { view = { ...view, ...s.view }; showAll = !!s.showAll; } } catch (e) { /* private window */ }
  const save = () => { try { localStorage.setItem('sme.kmap2', JSON.stringify({ view, showAll })); } catch (e) { /* ignore */ } };
  let cur = null, sel = null, opened = false;

  // o: { van, terr: [{ n, k, region, box, extra }], warehouses: [{ n, name }], heat, done: { district1, act1, act2, act3 }, turf }
  function html(o) {
    const d = o.done || {};
    const terr = o.terr.map((t) => ({ ...t, st: statusOf(t.k), x: t.region === 'fin' ? MOLEN.cx : (t.box[0] + t.box[2]) / 2, y: t.region === 'fin' ? MOLEN.cy : (t.box[1] + t.box[3]) / 2 }))
      .filter((t) => t.n !== 'Kipkruidenkwartier'); // home is the warehouse marker
    const openAct = (r) => !!ACT[r].open(d);
    cur = { ...o, terr };
    const by = Object.fromEntries(terr.map((t) => [t.n, t]));

    const few = terr.filter((t) => openAct(t.region)).length <= 12; // early game: show every name
    let s = `<svg class="km-svg${few ? ' km-few' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
<defs>
  <pattern id="kmWave" width="26" height="14" patternUnits="userSpaceOnUse"><path d="M0,9 q6.5,-4.5 13,0 t13,0" fill="none" stroke="${C.wave}" stroke-width="1.1"/></pattern>
  <pattern id="kmFog" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="${C.fog}"/><rect width="2" height="8" fill="#2c2621"/></pattern>
  ${[['lampas', 12, 9, -8], ['start', 12, 9, 10], ['nosh', 22, 14, 4], ['abd', 20, 11, 0]].map(([r, w, h, a]) => `<pattern id="kmB-${r}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})"><path d="M0,0H${w}M0,0V${h}" stroke="${C.street}" stroke-width="1.2" fill="none"/></pattern>`).join('')}
  <filter id="kmSh" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#0b1418" flood-opacity=".55"/></filter>
</defs>
<rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="${C.water}"/><rect x="-3000" y="-3000" width="${W + 6000}" height="${H + 6000}" fill="url(#kmWave)"/>
<g filter="url(#kmSh)">${Object.values(REGIONS).map((p) => `<path d="${path(p)}" fill="${C.land}"/>`).join('')}<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}" fill="${C.land}"/></g>
<g>${BRIDGES.map(([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#a89c86" stroke-width="6"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.street}" stroke-width="3.4"/>`).join('')}</g>
<g class="km-acts">`;
    for (const a of ACTS) {
      const shape = a.r === 'fin' ? `<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}"` : `<path d="${path(REGIONS[a.r])}"`;
      s += `${shape} class="km-act" data-act="${a.r}" fill="${C.tint[a.r]}" stroke="${C.coast[a.r]}" stroke-width="2.6" stroke-linejoin="round"/>`;
      if (a.r !== 'fin') s += `<path d="${path(REGIONS[a.r])}" fill="url(#kmB-${a.r})" opacity=".9" pointer-events="none"/>`;
    }
    s += '</g>';
    // act names: big, quiet, under everything that matters
    s += `<g class="km-actnames">${ACTS.filter((a) => a.r !== 'fin' && openAct(a.r)).map((a) => `<text x="${ACT_AT[a.r][0] * S}" y="${ACT_AT[a.r][1] * S}" text-anchor="middle" fill="${C.coast[a.r]}"${a.r === 'start' ? ' class="km-small"' : ''}>${a.name.toUpperCase()}</text>`).join('')}</g>`;
    // mission paths: solid saffron once both ends are yours, dashed otherwise
    s += '<g class="km-paths">';
    for (const t of terr) {
      const p = by[PARENT[t.n]]; if (!p || !openAct(t.region)) continue;
      s += `<line x1="${p.x}" y1="${p.y}" x2="${t.x}" y2="${t.y}" class="${t.st === 'own' && p.st === 'own' ? 'km-p-done' : 'km-p-todo'}"/>`;
    }
    s += '</g><path class="km-route" d="" fill="none"/>';
    // fog over the acts you haven't reached
    s += '<g class="km-fogs">';
    for (const a of ACTS) {
      if (openAct(a.r)) continue;
      const shape = a.r === 'fin' ? `<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx + 1}" ry="${MOLEN.ry + 1}"` : `<path d="${path(REGIONS[a.r])}"`;
      s += `<g class="km-fog" data-act="${a.r}">${shape} fill="url(#kmFog)" fill-opacity=".88" stroke="${C.coast[a.r]}" stroke-width="2.6"/></g>`;
    }
    s += '</g>';
    // fog plaques, under the markers so they never hide a mission
    s += `<g class="km-plaques">${ACTS.filter((a) => !openAct(a.r)).map((a) => `<g class="km-plaque" data-x="${ACT_AT[a.r][0] * S}" data-y="${ACT_AT[a.r][1] * S}" data-act="${a.r}"><rect x="-110" y="-24" width="220" height="48" rx="3"/><text y="-6" class="km-pq1">${a.tag.toUpperCase()} · ${esc(a.name.toUpperCase())}</text><text y="11" class="km-pq2">Locked: ${esc(a.need)}</text></g>`).join('')}</g>`;
    // markers and their names: sized in apply()
    s += '<g class="km-pins">';
    for (const t of terr) {
      if (!openAct(t.region)) continue;
      s += `<g class="km-pin km-${t.st}${BOSS.includes(t.n) ? ' km-boss' : ''}${sel === t.n ? ' km-sel' : ''}" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${t.x}" data-y="${t.y}"><title>${esc(t.n)}</title>`
        + `<circle class="km-hit" r="13" fill="transparent"/><circle class="km-selring" r="15" fill="none"/>${marker(t.st, BOSS.includes(t.n))}`
        + `<g class="km-name"><rect class="km-plate" x="11" y="-9" height="18" rx="2"/><text x="16" y="4.3">${esc(t.n)}${t.extra ? ` · ${esc(t.extra)}` : ''}</text></g></g>`;
    }
    for (const w of o.warehouses || []) { const t = by[w.n]; if (t) s += `<g class="km-pin km-wh" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${t.x}" data-y="${t.y}" data-dy="-17"><title>${esc(w.name)}</title>${ICON_WH}</g>`; }
    s += `<g class="km-people">${PEOPLE.map(([n, dsc, x, y]) => `<g class="km-pin km-person" data-x="${x}" data-y="${y}"><title>${esc(n)}: ${esc(dsc)}</title><circle r="4.5" fill="#fbf6ea" stroke="${C.ink}" stroke-width="1.4"/><text x="8" y="4" class="km-ptext">${esc(n)}</text></g>`).join('')}</g>`;
    s += `<g class="km-pin km-home" data-pin="Kipkruidenkwartier" data-k="own" data-x="${HOME[0]}" data-y="${HOME[1]}"><title>Eddy &amp; Zn warehouse: you are here</title><circle class="km-hit" r="14" fill="transparent"/>${ICON_HERE(o.van)}<g class="km-name"><rect class="km-plate km-plate-here" x="12" y="-9" height="18" rx="2"/><text x="17" y="4.3">YOU ARE HERE</text></g></g>`;
    s += '</g>';
    s += '</svg>';

    // ---- side panel
    const own = terr.filter((t) => t.st === 'own').length + 1, total = terr.length + 1;
    const ord = (r) => ACTS.findIndex((x) => x.r === r);
    const next = terr.filter((t) => (t.st === 'open' || t.st === 'lost') && openAct(t.region)).sort((a, b) => (b.st === 'lost') - (a.st === 'lost') || ord(a.region) - ord(b.region));
    const nextHTML = next.length ? next.slice(0, 5).map((t) => `<button class="km-next km-n-${t.st}" data-go="${esc(t.n)}"><svg width="20" height="20" viewBox="-10 -10 20 20">${marker(t.st, BOSS.includes(t.n))}</svg><span><b>${esc(t.n)}</b><small>${t.st === 'lost' ? 'Retaken! Win it back' : `${ACT[t.region].tag} · ${ACT[t.region].name}${BOSS.includes(t.n) ? ' · boss' : ''}`}</small></span></button>`).join('') + (next.length > 5 ? `<div class="km-more">+${next.length - 5} more on the map</div>` : '')
      : '<div class="km-more">No missions open right now.</div>';
    const heat = o.heat || {};
    const actRow = (a) => {
      const ts = terr.filter((t) => t.region === a.r), extra = a.r === 'start' ? 1 : 0, mine = ts.filter((t) => t.st === 'own').length + extra, all = ts.length + extra;
      const isOpen = openAct(a.r), done = mine === all, h = a.heat && isOpen && !done && a.r !== 'start' ? Math.round(heat[a.heat] || 0) : null;
      return `<button class="km-actrow${isOpen ? '' : ' km-shut'}" data-frame="${a.r}" title="Show on the map"><span class="km-sw" style="background:${isOpen ? C.tint[a.r] : C.fog};border-color:${C.coast[a.r]}"></span><span class="km-an"><span><b>${a.tag}</b> · ${esc(a.name)}</span><small>${isOpen ? (done ? 'All yours' : `${esc(a.faction)}${h !== null ? ` · heat ${h}` : ''}`) : 'Locked: ' + esc(a.need)}</small></span><span class="km-prog"><i style="width:${Math.round(mine / all * 100)}%"></i><em>${mine}/${all}</em></span></button>`;
    };
    const lg = (svg, label) => `<div class="km-lg"><svg width="22" height="22" viewBox="-11 -11 22 22">${svg}</svg>${label}</div>`;
    return `<div class="kmap">
  <div class="km-main">
    <div class="km-tools">
      <button class="b95 km-btn" data-z="in" title="Zoom in">+</button><button class="b95 km-btn" data-z="out" title="Zoom out">−</button><button class="b95" data-z="fit">All of Kaasland</button><button class="b95" data-z="home">You are here</button>
      <span class="km-sep"></span><label class="km-chk"><input type="checkbox" class="km-all" ${showAll ? 'checked' : ''}>Show all names</label>
      <span class="km-tip">Drag to move · scroll to zoom</span>
    </div>
    <div class="km-view" tabindex="0">${s}
      <svg class="km-compass" viewBox="-20 -20 40 40" aria-hidden="true"><circle r="16" fill="rgba(251,246,234,.92)" stroke="#3b2c1f" stroke-width="1.2"/><path d="M0,-14 L4,0 L0,3 L-4,0Z" fill="#cf3b28" stroke="#3b2c1f" stroke-width=".8"/><path d="M0,14 L4,0 L0,-3 L-4,0Z" fill="#fff" stroke="#3b2c1f" stroke-width=".8"/><text y="-5" x="7" font-size="8" font-weight="700" fill="#3b2c1f">N</text></svg>
      <div class="km-nav" title="Overview: click to jump"><svg viewBox="0 0 ${W} ${H}">${Object.entries(REGIONS).map(([r, p]) => `<path d="${path(p)}" fill="${openAct(r) ? C.tint[r] : C.fog}" stroke="${C.coast[r]}" stroke-width="7"/>`).join('')}<rect class="km-nav-r" x="0" y="0" width="${W}" height="${H}"/></svg></div>
    </div>
    <div class="km-status"><span class="km-st km-zoom">100%</span><span class="km-st km-hover">${o.van ? 'Where to? Pick a gold marker.' : 'Click a marker for details.'}</span><span class="km-st">${own}/${total} territories yours</span></div>
  </div>
  <div class="km-side">
    <fieldset class="km-box"><legend>Next up</legend>${nextHTML}</fieldset>
    <div class="well km-info" id="pininfo">${o.van ? 'Pick a destination for the Oofmobiel.' : 'Click a marker on the map.'}</div>
    <fieldset class="km-box"><legend>Kaasland</legend>${ACTS.map(actRow).join('')}</fieldset>
    ${o.turf ? `<fieldset class="km-box"><legend>Faction heat</legend><div class="km-turf">${o.turf}</div></fieldset>` : ''}
    <fieldset class="km-box"><legend>Legend</legend>
      ${lg(marker('open'), 'Mission open')}${lg(marker('own'), 'Yours')}${lg(marker('lost'), 'Retaken by a faction')}${lg(marker('locked'), 'Locked: take the one before it')}${lg(marker('locked', true), 'Faction boss (act finale)')}${lg(ICON_HERE(o.van), 'You are here')}${lg(ICON_WH, 'Your warehouse')}
    </fieldset>
  </div>
</div>`;
  }

  // ---- pan, zoom, select
  function bind(root) {
    const vp = root.querySelector('.km-view'), svg = vp && vp.querySelector('.km-svg'); if (!svg) return;
    const zl = root.querySelector('.km-zoom'), hov = root.querySelector('.km-hover'), hovIdle = hov.textContent;
    const pins = [...svg.querySelectorAll('.km-pin')], plaques = [...svg.querySelectorAll('.km-plaque')];
    const names = svg.querySelector('.km-actnames'), route = svg.querySelector('.km-route');
    const nav = root.querySelector('.km-nav'), navR = root.querySelector('.km-nav-r');
    const ZMAX = 4; let sc = 1, s0 = 1, vw = 800, vh = 450;
    function apply() {
      const r = vp.getBoundingClientRect(); vw = r.width || 800; vh = r.height || 450;
      s0 = Math.min(vw / W, vh / H); view.z = Math.max(1, Math.min(ZMAX, view.z)); sc = s0 * view.z;
      const bw = vw / sc, bh = vh / sc;
      view.cx = bw >= W ? W / 2 : Math.max(bw / 2, Math.min(W - bw / 2, view.cx));
      view.cy = bh >= H ? H / 2 : Math.max(bh / 2, Math.min(H - bh / 2, view.cy));
      svg.setAttribute('viewBox', `${view.cx - bw / 2} ${view.cy - bh / 2} ${bw} ${bh}`);
      const k = 1 / sc;
      // names: always for open/retaken missions and bosses; for yours and locked ones once you zoom in
      svg.classList.toggle('km-near', sc >= 1.5 || showAll); svg.classList.toggle('km-street', sc >= 2.2);
      for (const g of pins) g.setAttribute('transform', `translate(${g.dataset.x},${+g.dataset.y + (+g.dataset.dy || 0) * k}) scale(${k})`);
      const pk = k * Math.min(1, vw / 820); // plaques shrink on small screens
      for (const g of plaques) g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${pk})`);
      names.style.opacity = Math.max(0, Math.min(0.8, 1.7 - view.z * 0.6));
      route.setAttribute('stroke-width', 3 * k); route.setAttribute('stroke-dasharray', `${8 * k} ${6 * k}`);
      svg.style.setProperty('--k', k);
      zl.textContent = Math.round(view.z * 100) + '%';
      navR.setAttribute('x', view.cx - bw / 2); navR.setAttribute('y', view.cy - bh / 2); navR.setAttribute('width', bw); navR.setAttribute('height', bh);
      nav.style.display = view.z > 1.15 ? '' : 'none';
      drawRoute();
    }
    function plates() { // name plates take their width from the text
      for (const g of svg.querySelectorAll('.km-name')) { const t = g.querySelector('text'), p = g.querySelector('rect'); try { const w = t.getComputedTextLength(); if (w) p.setAttribute('width', w + 11); } catch (e) { /* not laid out yet */ } }
    }
    function zoomAt(f, px, py) { // keep the map point under (px,py) in place
      const r = vp.getBoundingClientRect(), mx = view.cx + (px - r.left - r.width / 2) / sc, my = view.cy + (py - r.top - r.height / 2) / sc;
      const z0 = view.z; view.z = Math.max(1, Math.min(ZMAX, view.z * f)); const g = z0 / view.z;
      view.cx = mx - (mx - view.cx) * g; view.cy = my - (my - view.cy) * g; apply(); save();
    }
    let anim = 0;
    function flyTo(cx, cy, z) { // a short eased glide, so you see where you went
      const a = { ...view }, b = { cx, cy, z: Math.max(1, Math.min(ZMAX, z)) }, t0 = performance.now(), id = ++anim;
      const step = (t) => { if (id !== anim) return; const u = Math.min(1, (t - t0) / 380), e = 1 - Math.pow(1 - u, 3); view.cx = a.cx + (b.cx - a.cx) * e; view.cy = a.cy + (b.cy - a.cy) * e; view.z = a.z + (b.z - a.z) * e; apply(); if (u < 1) requestAnimationFrame(step); else save(); };
      requestAnimationFrame(step);
    }
    function frame(r) { const [x0, y0, x1, y1] = bbox(r); flyTo((x0 + x1) / 2, (y0 + y1) / 2, Math.min(vw / ((x1 - x0) * s0), vh / ((y1 - y0) * s0)) * 0.88); }
    function drawRoute() {
      const t = sel && cur && cur.van && cur.terr.find((x) => x.n === sel);
      if (!t) { route.setAttribute('d', ''); return; }
      const [ax, ay] = HOME, bx = t.x, by = t.y, mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay;
      route.setAttribute('d', `M${ax},${ay} Q${mx - dy * 0.18},${my + dx * 0.18} ${bx},${by}`);
    }
    function select(n) {
      sel = n === 'Kipkruidenkwartier' ? null : n;
      for (const g of pins) g.classList.toggle('km-sel', !!sel && g.dataset.pin === sel && !g.classList.contains('km-wh'));
      drawRoute();
      const t = sel && cur.terr.find((x) => x.n === sel);
      if (t && cur.van) hov.textContent = `Route to ${t.n}: about ${(Math.hypot(t.x - HOME[0], t.y - HOME[1]) * 6.2 / 1000).toFixed(1).replace('.', ',')} km`;
    }
    const clickPin = (n) => { const el = svg.querySelector(`.km-pin[data-pin="${CSS.escape(n)}"]`); if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true })); };

    // pointer: drag to pan, pinch to zoom; a drag never counts as a click
    const pts = new Map(); let dragged = false, start = null, pinch = null;
    vp.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.km-nav')) return;
      anim++; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { dragged = false; start = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy }; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z }; }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) {
        const tg = e.target.closest && e.target.closest('[data-pin],.km-person,.km-fog,.km-plaque');
        if (!(sel && cur.van)) hov.textContent = !tg ? hovIdle : tg.dataset.pin ? tg.dataset.pin : tg.dataset.act ? `${ACT[tg.dataset.act].tag} · ${ACT[tg.dataset.act].name} is locked: ${ACT[tg.dataset.act].need}` : tg.querySelector('title').textContent;
        return;
      }
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
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; return; }
      const tg = e.target.closest && e.target.closest('[data-pin]'); if (tg) select(tg.dataset.pin);
      const fog = !tg && e.target.closest && e.target.closest('.km-fog,.km-plaque'); if (fog) frame(fog.dataset.act);
    }, true);
    vp.addEventListener('dblclick', (e) => { e.preventDefault(); zoomAt(2, e.clientX, e.clientY); });
    vp.addEventListener('wheel', (e) => { e.preventDefault(); anim++; zoomAt(Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.002), e.clientX, e.clientY); }, { passive: false });
    vp.addEventListener('keydown', (e) => {
      const st = 60 / sc, k = e.key, r = vp.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2;
      if (k === '+' || k === '=') zoomAt(1.4, mx, my); else if (k === '-') zoomAt(1 / 1.4, mx, my);
      else if (k.startsWith('Arrow')) { view.cx += k === 'ArrowLeft' ? -st : k === 'ArrowRight' ? st : 0; view.cy += k === 'ArrowUp' ? -st : k === 'ArrowDown' ? st : 0; apply(); save(); } else return;
      e.preventDefault(); e.stopPropagation();
    });
    nav.addEventListener('pointerdown', (e) => { e.stopPropagation(); const r = nav.getBoundingClientRect(); flyTo((e.clientX - r.left) / r.width * W, (e.clientY - r.top) / r.height * H, view.z); });

    root.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => {
      const r = vp.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2, z = b.dataset.z;
      if (z === 'in') zoomAt(1.5, mx, my); else if (z === 'out') zoomAt(1 / 1.5, mx, my); else if (z === 'fit') flyTo(W / 2, H / 2, 1); else flyTo(HOME[0] + 20, HOME[1], 3);
    });
    root.querySelector('.km-all').onchange = (e) => { showAll = e.target.checked; save(); apply(); };
    root.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => { const t = cur.terr.find((x) => x.n === b.dataset.go); if (!t) return; flyTo(t.x, t.y, Math.max(view.z, 2)); clickPin(t.n); });
    root.querySelectorAll('[data-frame]').forEach((b) => b.onclick = () => frame(b.dataset.frame));
    if (sel) { if (svg.querySelector(`.km-pin[data-pin="${CSS.escape(sel)}"]`)) setTimeout(() => clickPin(sel), 0); else sel = null; }
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!vp.isConnected) { ro.disconnect(); return; } apply(); }); ro.observe(vp); }
    plates(); apply();
    if (!opened && vw < 600) { const t = cur.terr.find((x) => x.st === 'open' || x.st === 'lost'); if (t) frame(t.region); }
    opened = true;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (vp.isConnected) plates(); });
  }

  return { html, bind };
}
