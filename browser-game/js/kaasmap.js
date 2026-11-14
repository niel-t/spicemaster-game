// Map of Kaasland: a flat, zoomable street-atlas map inside the Kaasdows 95 window (PC and Oofmobiel).
// Drawn as SVG in the 1024x572 space of assets/kaasland_map.jpg (the painted map stays as the optional
// "Luchtfoto" layer). Territory cells are a Voronoi split of each district outline around its label.
// main.js keeps the game logic: it hands over each territory's state (kind) and binds [data-pin] clicks.

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
// district names, GTA-atlas style: big, spaced, under the territory labels
const DISTRICTS = [
  ['start', 'KIPKRUIDENKWARTIER', 'Eddy & Zn · home base', 525, 612],
  ['lampas', 'OUD-VETTENBURG', 'Lampas', 740, 400],
  ['nosh', 'HIPSTERHEUVEL', 'Noshgey Kariot', 780, 175],
  ['abd', 'DE DUISTERE DOKKEN', 'Abdavissies', 1175, 600],
];
// spice palette (project memory): saffron, kurkuma, paprika, cardamom, cream, cumin brown
const FACTION = { start: '#f3e6c8', lampas: '#c2412d', nosh: '#8fae4f', abd: '#4f86a3', fin: '#f2c14e' };
const FNAME = { start: 'Kipkruidenkwartier', lampas: 'Lampas', nosh: 'Noshgey Kariot', abd: 'Abdavissies', fin: 'De Gouden Molen' };
const HOME = [240, 442]; // Eddy & Zn warehouse
// the street around the warehouse (the hub): people you can visit
const PEOPLE = [
  ['Schmatzel', 'S', 'Shoarma Schmatzel: free broodje, old stories', 262, 434],
  ['Nabil', 'N', 'Nabil, at the card table in Schmatzel’s', 268, 448],
  ['The Russian', 'R', 'Pandjeshuis Spasibo, east end of the street: weapons', 290, 430],
  ['Garage Mo', 'G', 'Garage Mo: Oofmobiel upgrades', 218, 452],
];
const SHOWN = { Kipkruidenkwartier: 'Eddy & Zn warehouse' }; // label text where the territory name would repeat the district
const HQ = ['Pindasausplein', 'Speltpolder', 'Kardemomdok', 'De Gouden Molen'];

// status of a cell from main.js' kinds
const STATUS = { own: 'own', lost: 'lost', m1: 'open', m2: 'open', m3: 'open' };
const statusOf = (k) => STATUS[k] || 'locked';

function clip(poly, a, b) { // keep the part of poly closer to a than to b (Voronoi half-plane)
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
  const side = (p) => (p[0] - mx) * dx + (p[1] - my) * dy;
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q);
    if (sp <= 0) out.push(p);
    if ((sp < 0 && sq > 0) || (sp > 0 && sq < 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
  }
  return out;
}
const path = (poly) => 'M' + poly.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L') + 'Z';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// icons, drawn in screen pixels around (0,0) and scaled back by 1/zoom so they stay the same size
const ICON = {
  joint: (c) => `<circle r="7.5" fill="${c}" stroke="#1e140c" stroke-width="1.5"/><path d="M-2.6,-4.2 L2.6,-4.2 L1.2,3.4 L-1.2,3.4Z" fill="#7a2e1a"/><path d="M0,-6 V5.5" stroke="#1e140c" stroke-width="1.2"/>`,
  hq: (c) => `<rect x="-8" y="-8" width="16" height="16" rx="2" fill="${c}" stroke="#1e140c" stroke-width="1.5"/><path d="M-5,3.5 L-5,-3 L-2.5,0 L0,-4.5 L2.5,0 L5,-3 L5,3.5Z" fill="#1e140c"/>`,
  wh: () => `<path d="M-8,-1 L0,-8 L8,-1 L8,7 L-8,7Z" fill="#f3e6c8" stroke="#1e140c" stroke-width="1.5"/><rect x="-3" y="1" width="6" height="6" fill="#7a2e1a"/>`,
  person: (l) => `<circle r="7" fill="#e8a33d" stroke="#1e140c" stroke-width="1.5"/><text y="3.6" text-anchor="middle" font-size="10" font-weight="900" fill="#1e140c" stroke="none">${l}</text>`,
  here: (van) => `<circle class="km-ping" r="10" fill="none" stroke="#ff5a3c" stroke-width="2.5"/>${van
    ? '<rect x="-9" y="-5" width="18" height="10" rx="3" fill="#2f6fb5" stroke="#fff" stroke-width="1.5"/><rect x="2" y="-3.5" width="5" height="7" rx="1" fill="#bfe3ff"/>'
    : '<path d="M0,-11 L7,7 L0,3 L-7,7Z" fill="#ff5a3c" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/>'}`,
};

export function createKaasMap() {
  let view = { cx: W / 2, cy: H / 2, z: 1 };
  let layers = { photo: false, labels: true, icons: true, people: true };
  try { const s = JSON.parse(localStorage.getItem('sme.kmap') || 'null'); if (s) { view = { ...view, ...s.view }; layers = { ...layers, ...s.layers }; } } catch (e) { /* private window */ }
  const save = () => { try { localStorage.setItem('sme.kmap', JSON.stringify({ view, layers })); } catch (e) { /* ignore */ } };
  let cur = null; // the data of the last html() call
  let sel = null;

  // territories come in as [{ n, k, region, box:[x0,y0,x1,y1], dot:[x,y], extra }]
  function cells(terr) {
    const out = {};
    for (const r of Object.keys(REGIONS)) {
      const ts = terr.filter((t) => t.region === r), seed = (t) => [(t.box[0] + t.box[2]) / 2, (t.box[1] + t.box[3]) / 2];
      for (const t of ts) { let poly = REGIONS[r]; for (const o of ts) if (o !== t) poly = clip(poly, seed(t), seed(o)); out[t.n] = poly; }
    }
    return out;
  }

  function html(o) {
    for (const t of o.terr) if (t.region === 'fin') t.dot = [MOLEN.cx, MOLEN.cy];
    cur = o;
    const { terr, van } = o, cp = cells(terr);
    const own = terr.filter((t) => statusOf(t.k) === 'own').length;
    let s = `<svg class="km-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
<defs>
  <pattern id="kmWave" width="22" height="12" patternUnits="userSpaceOnUse"><path d="M0,8 q5.5,-4 11,0 t11,0" fill="none" stroke="#2a4248" stroke-width="1"/></pattern>
  <pattern id="kmHatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="#7a2e1a"/><rect width="3" height="6" fill="#c2412d"/></pattern>
  ${[['lampas', 13, 9, -8], ['start', 12, 9, 10], ['nosh', 22, 14, 4], ['abd', 20, 11, 0]].map(([r, w, h, a]) => `<pattern id="kmB-${r}" width="${w}" height="${h}" patternUnits="userSpaceOnUse" patternTransform="rotate(${a})"><path d="M0,0H${w}M0,0V${h}" stroke="#1e140c" stroke-opacity=".28" stroke-width=".7" fill="none"/></pattern>`).join('')}
  <filter id="kmShadow" x="-5%" y="-5%" width="110%" height="110%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity=".6"/></filter>
</defs>
<rect x="-2000" y="-2000" width="${W + 4000}" height="${H + 4000}" fill="#17282d"/><rect x="-2000" y="-2000" width="${W + 4000}" height="${H + 4000}" fill="url(#kmWave)"/>
<image class="km-photo" href="./assets/kaasland_map.jpg" width="${W}" height="${H}" ${layers.photo ? '' : 'style="display:none"'}/>
<g class="km-land" filter="url(#kmShadow)">${Object.values(REGIONS).map((p) => `<path d="${path(p)}" fill="#2b2118"/>`).join('')}<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}" fill="#2b2118"/></g>
<g class="km-bridges">${BRIDGES.map(([a, b]) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#8a8172" stroke-width="5"/><line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#4a443b" stroke-width="2.4" stroke-dasharray="3 3"/>`).join('')}</g>
<g class="km-cells">`;
    for (const t of terr) {
      const st = statusOf(t.k), f = FACTION[t.region], fill = st === 'own' ? FACTION.start : st === 'lost' ? 'url(#kmHatch)' : f;
      const shape = t.region === 'fin' ? `<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}"` : `<path d="${path(cp[t.n] || [])}"`;
      s += `${shape} class="km-cell km-${st}${sel === t.n ? ' km-sel' : ''}" data-pin="${esc(t.n)}" data-k="${t.k}" fill="${fill}"><title>${esc(t.n)} · ${st === 'own' ? 'yours' : st === 'lost' ? 'retaken by the Lampas' : st === 'open' ? 'mission open' : FNAME[t.region]}</title>${t.region === 'fin' ? '</ellipse>' : '</path>'}`;
    }
    s += `</g><g class="km-streets" pointer-events="none">${Object.entries(REGIONS).map(([r, p]) => `<path d="${path(p)}" fill="url(#kmB-${r})"/>`).join('')}</g><g class="km-borders">${Object.entries(REGIONS).map(([r, p]) => `<path d="${path(p)}" fill="none" stroke="${FACTION[r]}" stroke-width="2.4" stroke-linejoin="round"/>`).join('')}<ellipse cx="${MOLEN.cx}" cy="${MOLEN.cy}" rx="${MOLEN.rx}" ry="${MOLEN.ry}" fill="none" stroke="${FACTION.fin}" stroke-width="2.4"/></g>`;
    s += `<g class="km-districts">${DISTRICTS.map(([r, n, sub, x, y]) => `<text x="${x * S}" y="${y * S}" text-anchor="middle" fill="${r === 'start' ? '#f3e6c8' : FACTION[r]}"><tspan class="km-dn">${n}</tspan><tspan class="km-ds" x="${x * S}" dy="13">${sub}</tspan></text>`).join('')}</g>`;
    s += `<path class="km-route" d="" fill="none"/>`;
    // labels and icons get their size from zoom() so they stay readable at every zoom level
    s += `<g class="km-labels" ${layers.labels ? '' : 'style="display:none"'}>`;
    for (const t of terr) {
      const cx = (t.box[0] + t.box[2]) / 2, cy = (t.box[1] + t.box[3]) / 2;
      s += `<text class="km-lab km-l-${statusOf(t.k)}" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${cx}" data-y="${cy}" x="${cx}" y="${cy}" text-anchor="middle">${esc(SHOWN[t.n] || t.n)}${t.extra ? ` ${esc(t.extra)}` : ''}</text>`;
    }
    s += `</g><g class="km-icons" ${layers.icons ? '' : 'style="display:none"'}>`;
    for (const t of terr) {
      if (t.n === 'Kipkruidenkwartier') continue;
      const st = statusOf(t.k), c = st === 'own' ? '#f3e6c8' : st === 'lost' ? '#c2412d' : st === 'open' ? '#f2c14e' : '#8a8172';
      const kind = HQ.includes(t.n) ? 'hq' : 'joint';
      const lx = t.region === 'fin' ? '' : `data-lx="${(t.box[0] + t.box[2]) / 2}"`;
      s += `<g class="km-ic km-i-${st}" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${t.dot[0]}" data-y="${t.region === 'fin' ? t.dot[1] : (t.box[1] + t.box[3]) / 2}" ${lx}><title>${esc(t.n)} · ${kind === 'hq' ? 'faction headquarters' : 'shoarma joint'}</title>${ICON[kind](c)}</g>`;
    }
    for (const w of o.warehouses || []) {
      const t = terr.find((x) => x.n === w.n); if (!t) continue;
      s += `<g class="km-ic" data-pin="${esc(t.n)}" data-k="${t.k}" data-x="${t.dot[0]}" data-y="${t.dot[1] - 16}"><title>${esc(w.name)} · your warehouse</title>${ICON.wh()}</g>`;
    }
    s += `<g class="km-ic" data-pin="Kipkruidenkwartier" data-k="own" data-x="${HOME[0] - 18}" data-y="${HOME[1] + 2}"><title>Eddy &amp; Zn warehouse · home</title>${ICON.wh()}</g>`;
    s += `<g class="km-people" ${layers.people ? '' : 'style="display:none"'}>${PEOPLE.map(([n, l, d, x, y]) => `<g class="km-ic km-person" data-x="${x}" data-y="${y}"><title>${esc(n)} · ${esc(d)}</title>${ICON.person(l)}<text class="km-plab" x="10" y="3.5">${esc(n)}</text></g>`).join('')}</g>`;
    s += `</g><g class="km-ic km-here" data-x="${HOME[0]}" data-y="${HOME[1]}"><title>You are here${van ? ' · the Oofmobiel' : ' · the warehouse PC'}</title>${ICON.here(van)}<text class="km-herelab" y="-15" text-anchor="middle">YOU ARE HERE</text></g>`;
    s += `</svg>`;

    const opts = terr.slice().sort((a, b) => a.n.localeCompare(b.n));
    const grp = (r) => opts.filter((t) => t.region === r).map((t) => `<option value="${esc(t.n)}">${esc(t.n)}${statusOf(t.k) === 'own' ? ' ✓' : statusOf(t.k) === 'open' ? ' !' : ''}</option>`).join('');
    const chk = (id, label) => `<label class="km-chk"><input type="checkbox" data-layer="${id}" ${layers[id] ? 'checked' : ''}>${label}</label>`;
    const sw = (c, label, cls = '') => `<div class="km-row"><span class="km-sw ${cls}" style="background:${c}"></span>${label}</div>`;
    const icn = (svg, label) => `<div class="km-row"><svg width="20" height="20" viewBox="-10 -10 20 20">${svg}</svg>${label}</div>`;
    const heat = o.heat || {};
    const bar = (id, name, c, done) => `<div class="km-heat"><span>${name}</span>${done ? '<b style="color:#2e7d2e">beaten</b>' : `<span class="km-bar"><i style="width:${Math.max(0, Math.min(100, Math.round(heat[id] || 0)))}%;background:${c}"></i></span><b>${Math.round(heat[id] || 0)}</b>`}</div>`;
    return `<div class="kmap">
  <div class="km-main">
    <div class="km-tools">
      <button class="b95 km-btn" data-z="in" title="Zoom in">+</button><button class="b95 km-btn" data-z="out" title="Zoom out">−</button><button class="b95" data-z="fit" title="Show all of Kaasland">Fit</button><button class="b95" data-z="home" title="Back to the warehouse">Home</button>
      <span class="km-sep"></span>
      <select class="km-find" title="Find a territory"><option value="">Find territory…</option><optgroup label="Kipkruidenkwartier">${grp('start')}</optgroup><optgroup label="Oud-Vettenburg (Lampas)">${grp('lampas')}</optgroup><optgroup label="Hipsterheuvel (Noshgey)">${grp('nosh')}</optgroup><optgroup label="De Duistere Dokken (Abdavissies)">${grp('abd')}</optgroup><optgroup label="The island">${grp('fin')}</optgroup></select>
      <span class="km-sep"></span>
      ${chk('labels', 'Names')}${chk('icons', 'Icons')}${chk('people', 'People')}${chk('photo', 'Luchtfoto')}
    </div>
    <div class="km-view" tabindex="0">${s}</div>
    <div class="km-status"><span class="km-st km-zoom">100%</span><span class="km-st km-hover">${van ? 'Pick a destination for the Oofmobiel' : 'Drag to move · scroll to zoom'}</span><span class="km-st">${own}/${terr.length} territories yours</span></div>
  </div>
  <div class="km-side">
    <div class="well km-info" id="pininfo">${van ? 'Pick a destination for the Oofmobiel.' : 'Click a territory on the map.'}</div>
    <fieldset class="km-box"><legend>Legend</legend>
      ${sw('#f3e6c8', 'Yours (Eddy &amp; Zn)')}${sw('transparent', 'Mission open', 'km-sw-open')}${sw('', 'Retaken by a faction', 'km-hatch')}
      ${sw(FACTION.lampas, 'Lampas')}${sw(FACTION.nosh, 'Noshgey Kariot')}${sw(FACTION.abd, 'Abdavissies')}${sw(FACTION.fin, 'De Gouden Molen')}
      <hr>${icn(ICON.here(van), 'You are here')}${icn(ICON.joint('#f2c14e'), 'Shoarma joint')}${icn(ICON.hq('#c2412d'), 'Faction headquarters')}${icn(ICON.wh(), 'Your warehouse')}${icn(ICON.person('P'), 'People on your street')}
    </fieldset>
    <fieldset class="km-box"><legend>Faction heat</legend>
      ${o.turf ? `<div class="km-turf">${o.turf}</div>` : `${bar('lampas', 'Lampas', FACTION.lampas, o.done && o.done.act1)}${bar('noshgey', 'Noshgey', FACTION.nosh, o.done && o.done.act2)}${bar('abdavissies', 'Abdavissies', FACTION.abd, o.done && o.done.act3)}`}
    </fieldset>
  </div>
</div>`;
  }

  // ---- interaction: pan, zoom, select
  function bind(root) {
    const vp = root.querySelector('.km-view'), svg = vp && vp.querySelector('svg'); if (!svg) return;
    const zl = root.querySelector('.km-zoom'), hov = root.querySelector('.km-hover'), hovIdle = hov.textContent;
    const ics = [...svg.querySelectorAll('.km-ic')], labs = [...svg.querySelectorAll('.km-lab')];
    const dTxt = svg.querySelector('.km-districts'), route = svg.querySelector('.km-route');
    const ZMAX = 4;
    let sc = 1;
    function apply() {
      const r = vp.getBoundingClientRect(), vw = r.width || 800, vh = r.height || 450;
      const s0 = Math.min(vw / W, vh / H); view.z = Math.max(1, Math.min(ZMAX, view.z)); sc = s0 * view.z;
      const bw = vw / sc, bh = vh / sc;
      view.cx = bw >= W ? W / 2 : Math.max(bw / 2, Math.min(W - bw / 2, view.cx));
      view.cy = bh >= H ? H / 2 : Math.max(bh / 2, Math.min(H - bh / 2, view.cy));
      svg.setAttribute('viewBox', `${view.cx - bw / 2} ${view.cy - bh / 2} ${bw} ${bh}`);
      const k = 1 / sc, big = Math.min(1.25, 0.85 + view.z * 0.1); // icons grow a little when you zoom in
      for (const g of ics) g.setAttribute('transform', `translate(${g.dataset.x},${g.dataset.y}) scale(${k * big})`);
      const fs = (11.5 + Math.min(3, view.z - 1)) * k;
      const lw = {};
      for (const t of labs) { t.setAttribute('font-size', fs); t.setAttribute('y', +t.dataset.y + fs * 0.35); if (layers.labels) try { lw[t.dataset.pin] = t.getComputedTextLength(); } catch (e) { /* hidden */ } }
      for (const g of ics) {
        if (!g.dataset.lx) continue; // a territory icon: just left of its name, or on the spot when names are off
        const w = lw[g.dataset.pin], x = w ? +g.dataset.lx - w / 2 - 11 * k * big : +g.dataset.lx;
        g.setAttribute('transform', `translate(${x},${g.dataset.y}) scale(${k * big})`);
      }
      dTxt.style.opacity = Math.max(0, Math.min(0.55, 1.4 - view.z * 0.45));
      route.setAttribute('stroke-width', 3 * k); route.setAttribute('stroke-dasharray', `${8 * k} ${6 * k}`);
      svg.style.setProperty('--k', k);
      svg.classList.toggle('km-near', sc >= 2);
      zl.textContent = Math.round(view.z * 100) + '%';
      drawRoute();
    }
    function zoomAt(f, px, py) { // px,py in client coords, keep that map point under the cursor
      const r = vp.getBoundingClientRect(), mx = view.cx + (px - r.left - r.width / 2) / sc, my = view.cy + (py - r.top - r.height / 2) / sc;
      const z0 = view.z; view.z = Math.max(1, Math.min(ZMAX, view.z * f)); const g = z0 / view.z;
      view.cx = mx - (mx - view.cx) * g; view.cy = my - (my - view.cy) * g; apply(); save();
    }
    function centerOn(x, y, z) { view.cx = x; view.cy = y; if (z) view.z = Math.max(view.z, z); apply(); save(); }
    function drawRoute() {
      const t = sel && cur && cur.van && cur.terr.find((x) => x.n === sel);
      if (!t || t.n === 'Kipkruidenkwartier') { route.setAttribute('d', ''); return; }
      const [ax, ay] = HOME, [bx, by] = t.dot, mx = (ax + bx) / 2, my = (ay + by) / 2, dx = bx - ax, dy = by - ay;
      route.setAttribute('d', `M${ax},${ay} Q${mx - dy * 0.18},${my + dx * 0.18} ${bx},${by}`);
    }
    function select(n) {
      sel = n;
      svg.querySelectorAll('.km-sel').forEach((e) => e.classList.remove('km-sel'));
      svg.querySelectorAll('.km-cell').forEach((e) => { if (e.dataset.pin === n) e.classList.add('km-sel'); });
      drawRoute();
      const t = cur && cur.terr.find((x) => x.n === n);
      if (t && cur.van && n !== 'Kipkruidenkwartier') { const d = Math.hypot(t.dot[0] - HOME[0], t.dot[1] - HOME[1]) * 6.2 / 1000; hov.textContent = `Route to ${n}: about ${d.toFixed(1).replace('.', ',')} km`; }
    }

    // pointer: drag to pan, two fingers to pinch
    const pts = new Map(); let dragged = false, start = null, pinch = null;
    vp.addEventListener('pointerdown', (e) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { dragged = false; start = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy }; }
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: view.z }; }
    });
    vp.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) {
        const tg = e.target.closest && e.target.closest('[data-pin]');
        hov.textContent = tg ? tg.dataset.pin : (sel && cur && cur.van ? hov.textContent : hovIdle);
        return;
      }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 2 && pinch) {
        const [a, b] = [...pts.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        zoomAt((pinch.z * d / pinch.d) / view.z, (a.x + b.x) / 2, (a.y + b.y) / 2); dragged = true; return;
      }
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      if (!dragged && Math.hypot(dx, dy) > 5) { dragged = true; vp.setPointerCapture(e.pointerId); vp.classList.add('km-drag'); }
      if (dragged) { view.cx = start.cx - dx / sc; view.cy = start.cy - dy / sc; apply(); }
    });
    const up = (e) => {
      pts.delete(e.pointerId); if (pts.size < 2) pinch = null;
      if (!pts.size) { if (dragged) save(); start = null; vp.classList.remove('km-drag'); }
    };
    vp.addEventListener('pointerup', up); vp.addEventListener('pointercancel', up);
    // a drag must not count as a click on the territory under the pointer (main.js binds onclick on [data-pin])
    vp.addEventListener('click', (e) => {
      if (dragged) { e.stopPropagation(); e.preventDefault(); dragged = false; return; }
      const tg = e.target.closest && e.target.closest('[data-pin]'); if (tg) select(tg.dataset.pin);
    }, true);
    vp.addEventListener('dblclick', (e) => { e.preventDefault(); zoomAt(2, e.clientX, e.clientY); });
    vp.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(Math.exp(-Math.max(-120, Math.min(120, e.deltaY)) * 0.002), e.clientX, e.clientY); }, { passive: false });
    vp.addEventListener('keydown', (e) => {
      const step = 60 / sc, r = vp.getBoundingClientRect(), mid = [r.left + r.width / 2, r.top + r.height / 2];
      const k = e.key;
      if (k === '+' || k === '=') zoomAt(1.4, ...mid); else if (k === '-') zoomAt(1 / 1.4, ...mid);
      else if (k === 'ArrowLeft') centerOn(view.cx - step, view.cy); else if (k === 'ArrowRight') centerOn(view.cx + step, view.cy);
      else if (k === 'ArrowUp') centerOn(view.cx, view.cy - step); else if (k === 'ArrowDown') centerOn(view.cx, view.cy + step);
      else return;
      e.preventDefault(); e.stopPropagation();
    });

    root.querySelectorAll('[data-z]').forEach((b) => b.onclick = () => {
      const r = vp.getBoundingClientRect(), mx = r.left + r.width / 2, my = r.top + r.height / 2, z = b.dataset.z;
      if (z === 'in') zoomAt(1.5, mx, my); else if (z === 'out') zoomAt(1 / 1.5, mx, my);
      else if (z === 'fit') { view = { cx: W / 2, cy: H / 2, z: 1 }; apply(); save(); } else centerOn(HOME[0], HOME[1], 2.5);
    });
    root.querySelectorAll('[data-layer]').forEach((c) => c.onchange = () => {
      layers[c.dataset.layer] = c.checked; save();
      const m = { photo: '.km-photo', labels: '.km-labels', icons: '.km-icons', people: '.km-people' }[c.dataset.layer];
      const el = svg.querySelector(m); if (el) el.style.display = c.checked ? '' : 'none';
      svg.classList.toggle('km-photo-on', layers.photo);
    });
    svg.classList.toggle('km-photo-on', layers.photo);
    const find = root.querySelector('.km-find');
    find.onchange = () => {
      const n = find.value; if (!n) return; find.value = '';
      const t = cur.terr.find((x) => x.n === n); if (!t) return;
      centerOn((t.box[0] + t.box[2]) / 2, (t.box[1] + t.box[3]) / 2, 2.2);
      const el = svg.querySelector(`.km-cell[data-pin="${CSS.escape(n)}"]`); if (el) el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };
    if (sel) { const el = svg.querySelector(`.km-cell[data-pin="${CSS.escape(sel)}"]`); if (el) setTimeout(() => el.dispatchEvent(new MouseEvent('click', { bubbles: true })), 0); else sel = null; }
    if (typeof ResizeObserver !== 'undefined') { const ro = new ResizeObserver(() => { if (!vp.isConnected) { ro.disconnect(); return; } apply(); }); ro.observe(vp); }
    apply();
  }

  return { html, bind };
}
