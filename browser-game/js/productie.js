// De productielijn (Tristan 2026-11-23): what the Naknikim do all day, made visible, and Eddy can lend a hand.
//   OPSLAG     pallets along the shed's east wall (and on the floor of De Hal): fibre vaten of raw spice, 4 x 5 kg a pallet.
//              One pallet place = PLACE_KG (economy.js); the stock cap IS the number of places.
//   DE MENGER  a bakery floor mixer (kuipmenger), then a big drum mixer, a ribbon blender and De Reuzenmenger (Loods upgrades): vaten get tipped in.
//   INPAKKEN   a packing table (later the Inpakmachine): the blend goes into blue 2.5 kg bags with a label naming the spice.
//   Bags go back onto a pallet place as finished stock.
// The economy still does the real mixing overnight (economy.js mix()); this is the same batch, shown through the day:
// state.prod {day, vat, sc, out, mix, belt, eddy, pep} counts today's kilos through each step, up to what tonight's mix will make.
// Eddy tipping a vat himself adds HELP_KG to tonight's batch (at most HELP_MAX a day); stacking bags cheers the crew up.
import { PLACE_KG, GRADES } from './economy.js';

let MX = -2.4, MZ = -15.5; // the mixer (in the shed; it moves into De Hal once that is built)
let PX = 0.3, PZ = -8.3; // the packing table / Inpakmachine, against the east wall by the roller door
const SHED_SPOTS = [-15.0, -13.7, -12.4, -11.1, -9.8].map((z) => ({ x: 0.3, z, ry: Math.PI / 2, levels: 2, sx: -0.95, sz: 0 })); // east wall, stacked two high
const LID_TURN = Math.PI / 2; // turns the lid label to read from the door side
const VAT_KG = 5, BAG_KG = 2.5, HELP_KG = 5, HELP_MAX = 10, PEP_MAX = 5;
const ING_COL = { paprika: 0xc2412d, komijn: 0x8a5a2a, knoflook: 0xe8e0c8, koriander: 0x9aa04a, kurkuma: 0xe2a21a, kaneel: 0xa0562a, kardemom: 0x7a9a4a, saffraan: 0xe86a1a, raselhanout: 0xb0622a, sumak: 0x8a2a3a, zaatar: 0x6a7a3a, harissa: 0xd0301a };
const BLEND_COL = { kip: '#e8a01a', lams: '#9a6a2a', kebab: '#c2412d', slager: '#7a9a4a', speciaal: '#e86a1a', woestijn: '#b0622a', gouden: '#f2c21a' };
const TIER = [ // footprint half sizes, pour height, name
  { rx: 0.75, rz: 1.05, ty: 1.1, name: 'De kuipmenger' }, { rx: 1.05, rz: 1.0, ty: 1.15, name: 'De Mengmachine' },
  { rx: 1.3, rz: 0.8, ty: 1.2, name: 'De industriële menger' }, { rx: 1.25, rz: 1.25, ty: 1.2, name: 'De Reuzenmenger' },
];

// deps: THREE, scene, box, cyl, lam, canvasTex, solid, addInteract, player, state, econ, loods, toast, beep, save, away(), frozen(), glyph, pep(n)
export function createProductie(deps) {
  const { THREE, scene, box, cyl, lam, canvasTex, solid, player, state, econ, loods } = deps;
  const M = {}; const mt = (c, o) => { const k = c + (o ? JSON.stringify(o) : ''); return M[k] || (M[k] = lam({ color: c, ...(o || {}) })); };
  const G = {}; const geo = (k, f) => G[k] || (G[k] = f());
  const steel = new THREE.MeshPhongMaterial({ color: 0xc8ced4, shininess: 90, specular: 0x888888 });
  const dark = mt(0x3a3e44);
  const day = () => econ.ensure().day;
  const ingName = (id) => (econ.INGREDIENTS.find((g) => g.id === id) || { name: id }).name;
  const blend = (id) => econ.BLENDS.find((b) => b.id === id) || econ.BLENDS[0];
  const [HX, HZ] = loods.hallAt;
  const HALL_SPOTS = [0, 1, 2, 3, 4].map((k) => ({ x: HX + 0.9 + k * 1.3, z: HZ + 6.3, ry: 0, levels: 1, sx: 0, sz: -1.0 }));
  // De Hal's line (Tristan 2026-11-23: scale up in the warehouse): the mixer and the packing stand on the hall floor, the heftruck sets
  // pallets of vaten on the two AANVOER places by the mixer, full pallets of bags go from the UIT place to the three by the dock
  const SITE = { shed: { mx: -2.4, mz: -15.5, px: 0.3, pz: -8.3 }, hall: { mx: HX - 1.0, mz: HZ + 0.3, px: HX + 3.0, pz: HZ + 1.2 } };
  const AISLE = HZ - 3.05; // the heftruck's lane in front of the racking
  const FEED_SPOTS = [-3.3, -4.6].map((x) => ({ x: HX + x, z: HZ - 0.5, ry: 0, levels: 1, sx: 0, sz: 1.0, stop: { x: HX + x, z: HZ - 2.4, h: 0, back: { x: HX + x, z: AISLE } } }));
  const OUT_SPOT = { x: HX + 3.0, z: HZ - 1.0, ry: Math.PI / 2, levels: 1, sx: -0.95, sz: 0, stop: { x: HX + 3.0, z: HZ - 2.9, h: 0, back: { x: HX + 3.0, z: AISLE } } };
  const UIT_SPOTS = [-1.6, -2.9, -4.2].map((z) => ({ x: HX + 10.2, z: HZ + z, ry: Math.PI / 2, levels: 1, sx: -0.95, sz: 0, stop: { x: HX + 8.3, z: HZ + z, h: Math.PI / 2, back: { x: HX + 7.0, z: HZ + z } } }));
  const TENT_SPOTS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((k) => ({ x: HX - 30 + k * 1.3, z: HZ + 6.3, ry: 0, levels: 1, sx: 0, sz: -1.0 }));
  const inHall = () => loods.has('hal');

  function P() {
    const p = state.prod && typeof state.prod === 'object' ? state.prod : (state.prod = {});
    if (p.day !== day()) Object.assign(p, { day: day(), vat: 0, sc: 0, out: 0, ship: 0, mix: Math.min(+p.mix || 0, 5), belt: 0, eddy: 0, pep: 0 });
    return p;
  }
  const helpKg = () => { const p = state.prod; return p && p.day === day() ? Math.min(HELP_MAX, (+p.eddy || 0) * HELP_KG) : 0; };
  const have = (id) => GRADES.reduce((a, g) => a + econ.stockOf(id, g.id), 0);
  function target() { // tonight's batch in kg: what the crew (and Eddy) can make from what's on the pallets
    const e = econ.ensure(), b = blend(e.order); if (!b.mix || !state.table) return 0;
    let kg = econ.dayKg(); for (const [id, w] of Object.entries(b.mix)) kg = Math.min(kg, Math.floor(have(id) * 10 / w));
    return Math.max(0, kg);
  }
  const tier = () => (loods.has('menger3') ? 3 : loods.has('menger2') ? 2 : loods.has('menger1') ? 1 : 0);
  const machine = () => loods.has('inpak');

  // ================================================================== props: vat, bucket, blue bag, pallet
  const vatMat = {}, lidMat = {};
  function vatSkin(id) { // kraft fibre drum: a band in the spice's colour and a label with its name
    if (vatMat[id]) return vatMat[id];
    const col = ING_COL[id] ?? 0xb08a4a, css = '#' + col.toString(16).padStart(6, '0'), name = ingName(id).toUpperCase();
    const t = canvasTex(256, 128, (g, w, h) => {
      g.fillStyle = '#c9a56c'; g.fillRect(0, 0, w, h);
      g.globalAlpha = 0.18; g.fillStyle = '#7a5a30'; for (let x = 0; x < w; x += 5) g.fillRect(x, 0, 2, h); g.globalAlpha = 1;
      g.fillStyle = '#8a8f96'; g.fillRect(0, 0, w, 9); g.fillRect(0, h - 9, w, 9); g.fillStyle = css; g.fillRect(0, 14, w, 18);
      for (const x0 of [14, 142]) { g.fillStyle = '#f6f0e0'; g.fillRect(x0, 44, 100, 62); g.strokeStyle = '#2a1a0e'; g.lineWidth = 2; g.strokeRect(x0, 44, 100, 62); g.fillStyle = css; g.fillRect(x0, 44, 100, 12); g.fillStyle = '#2a1a0e'; g.textAlign = 'center'; g.font = `900 ${name.length > 8 ? 15 : 19}px Arial`; g.fillText(name, x0 + 50, 80); g.font = '700 11px Arial'; g.fillText("5 KG · EDDY'S", x0 + 50, 98); }
    });
    const top = canvasTex(128, 128, (g) => { g.fillStyle = css; g.fillRect(0, 0, 128, 128); g.fillStyle = '#f6f0e0'; g.beginPath(); g.roundRect(14, 44, 100, 40, 8); g.fill(); g.strokeStyle = '#2a1a0e'; g.lineWidth = 3; g.stroke(); g.fillStyle = '#2a1a0e'; g.textAlign = 'center'; g.font = `900 ${name.length > 8 ? 15 : name.length > 6 ? 19 : 24}px Arial`; g.fillText(name, 64, 72); });
    lidMat[id] = [mt(col), lam({ map: top }), mt(col)];
    return (vatMat[id] = lam({ map: t }));
  }
  const vatGeo = () => geo('vat', () => new THREE.CylinderGeometry(0.235, 0.225, 0.6, 14)), lidGeo = () => geo('lid', () => new THREE.CylinderGeometry(0.245, 0.245, 0.045, 14));
  function makeVat(id = 'paprika') {
    const g = new THREE.Group(), b = new THREE.Mesh(vatGeo(), vatSkin(id)); b.position.y = 0.3; b.castShadow = true; g.add(b);
    const l = new THREE.Mesh(lidGeo(), lidMat[id]); l.position.y = 0.62; g.add(l);
    g.userData.set = (i) => { b.material = vatSkin(i); l.material = lidMat[i]; };
    return g;
  }
  const bagMat = {};
  function bagSkin(id) { // the blue bag: a cream label with Eddy's name and the spice that is in it
    if (bagMat[id]) return bagMat[id];
    const b = blend(id), acc = BLEND_COL[id] || '#e8a01a';
    const side = canvasTex(64, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#4a86d8'); gr.addColorStop(1, '#2450a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 2, w, 3); });
    const top = canvasTex(256, 192, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#3f7fd6'); gr.addColorStop(1, '#2450a0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, w, 14); g.fillStyle = 'rgba(0,0,40,.25)'; g.fillRect(0, h - 12, w, 12);
      g.fillStyle = '#fbf4e2'; g.beginPath(); g.roundRect(26, 30, w - 52, h - 62, 12); g.fill(); g.strokeStyle = '#1a2f6a'; g.lineWidth = 4; g.stroke();
      g.fillStyle = acc; g.fillRect(26, 30 + 26, w - 52, 8);
      g.fillStyle = '#1a2f6a'; g.textAlign = 'center'; g.font = '900 22px Arial'; g.fillText("EDDY'S KRUIDEN", w / 2, 52);
      const nm = b.name.toUpperCase(); g.fillStyle = '#2a1a0e'; g.font = `900 ${nm.length > 13 ? 24 : nm.length > 10 ? 29 : 34}px Arial`; g.fillText(nm, w / 2, 108);
      g.font = '700 16px Arial'; g.fillStyle = '#5a3a1a'; g.fillText('2,5 KG · KIPKRUIDENKWARTIER', w / 2, 132);
    });
    const s = lam({ map: side }), t = lam({ map: top });
    return (bagMat[id] = [s, s, t, s, s, s]);
  }
  const bagGeo = () => geo('bag', () => new THREE.BoxGeometry(0.5, 0.13, 0.38));
  function makeBag(id = 'kip') { const m = new THREE.Mesh(bagGeo(), bagSkin(id)); m.castShadow = true; m.userData.set = (i) => { m.material = bagSkin(i); }; return m; }
  function makeBucket() {
    const g = new THREE.Group(); const b = new THREE.Mesh(geo('emm', () => new THREE.CylinderGeometry(0.15, 0.12, 0.24, 12)), mt(0xf2ead8)); g.add(b);
    const t = new THREE.Mesh(geo('emt', () => new THREE.CylinderGeometry(0.14, 0.14, 0.02, 12)), mt(0xd0742a)); t.position.y = 0.11; g.add(t); return g;
  }
  // what the Naknikim carry (js/naknikwork.js): sized for a Naknik, repainted when he picks it up
  const carry = {
    vat: () => { const v = makeVat('paprika'); v.scale.setScalar(0.72); v.children.forEach((c) => { c.position.y -= 0.3; }); v.userData.paint = () => v.userData.set(carryVat); return v; },
    emmer: () => makeBucket(),
    zak: () => { const b = makeBag('kip'); b.scale.setScalar(0.8); b.userData.paint = () => b.userData.set(econ.ensure().order); return b; },
  };
  let carryVat = 'paprika';

  // ================================================================== pallet places
  const places = []; // {g, vats[4], bags[8], spot, level, shed}
  const outline = canvasTex(64, 64, (g) => { g.clearRect(0, 0, 64, 64); g.strokeStyle = '#f2b21a'; g.lineWidth = 5; g.strokeRect(3, 3, 58, 58); });
  const marks = new THREE.Group(); scene.add(marks); const hallMarks = new THREE.Group(); scene.add(hallMarks); const tentMarks = new THREE.Group(); scene.add(tentMarks);
  function addSpot(sp, zone) {
    const shed = zone === 'shed'; sp.zone = zone;
    const m = new THREE.Mesh(geo('mark', () => new THREE.PlaneGeometry(1.34, 1.14)), geo('markM', () => new THREE.MeshBasicMaterial({ map: outline, transparent: true, depthWrite: false })));
    m.rotation.x = -Math.PI / 2; m.rotation.z = sp.ry; m.position.set(sp.x, shed ? 0.045 : 0.03, sp.z); (shed ? marks : zone === 'tent' ? tentMarks : hallMarks).add(m);
    sp.sol = solid(sp.x - (sp.ry ? 0.5 : 0.6), sp.x + (sp.ry ? 0.5 : 0.6), sp.z - (sp.ry ? 0.6 : 0.5), sp.z + (sp.ry ? 0.6 : 0.5)); sp.sol.off = true;
    for (let lv = 0; lv < sp.levels; lv++) {
      const g = new THREE.Group(); g.position.set(sp.x, 0, sp.z); g.rotation.y = sp.ry; g.visible = false; scene.add(g);
      const deck = new THREE.Mesh(geo('deck', () => new THREE.BoxGeometry(1.2, 0.045, 1.0)), mt(0xc49a62)); deck.position.y = 0.125; g.add(deck);
      const feet = new THREE.Mesh(geo('feet', () => new THREE.BoxGeometry(1.12, 0.1, 0.92)), mt(0x8a6438)); feet.position.y = 0.05; g.add(feet);
      const vats = [], bags = [];
      for (let k = 0; k < 4; k++) { const v = makeVat('paprika'); v.position.set(k % 2 ? 0.28 : -0.28, 0.15, k < 2 ? -0.24 : 0.24); v.rotation.y = -sp.ry + (k - 1.5) * 0.12 + LID_TURN; g.add(v); vats.push(v); }
      for (let k = 0; k < 8; k++) { const b = makeBag('kip'); if (sp.ry) b.position.set(k % 2 ? 0.27 : -0.27, 0.215 + (k >> 2) * 0.135, (k >> 1) % 2 ? 0.255 : -0.255); else b.position.set(k % 2 ? 0.29 : -0.29, 0.215 + (k >> 2) * 0.135, (k >> 1) % 2 ? 0.24 : -0.24);
        b.rotation.y = -sp.ry + ((k * 7) % 5 - 2) * 0.03; /* the label reads from the door side */ g.add(b); bags.push(b); }
      places.push({ g, vats, bags, spot: sp, level: lv, shed, zone, load: null });
    }
  }
  SHED_SPOTS.forEach((s) => addSpot(s, 'shed')); HALL_SPOTS.forEach((s) => addSpot(s, 'hall')); FEED_SPOTS.forEach((s) => addSpot(s, 'feed')); addSpot(OUT_SPOT, 'out'); UIT_SPOTS.forEach((s) => addSpot(s, 'uit')); TENT_SPOTS.forEach((s) => addSpot(s, 'tent'));
  const ALL_SPOTS = [...SHED_SPOTS, ...HALL_SPOTS, ...FEED_SPOTS, OUT_SPOT, ...UIT_SPOTS, ...TENT_SPOTS];
  const zone = (z) => places.filter((p) => p.zone === z);
  const shedPlaces = zone('shed'), hallPlaces = zone('hall');
  // floor stencils in De Hal
  for (const [t, x, z, w] of [['AANVOER', HX - 3.95, HZ + 0.25, 2.4], ['UIT', HX + 3.0, HZ - 1.85, 1.0], ['UITGAAND', HX + 9.25, HZ - 2.9, 2.6]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.34), new THREE.MeshBasicMaterial({ map: deps.signTex([{ t, size: 60 }], 'rgba(0,0,0,0)', '#f2b21a', 64 * Math.round(w * 4), 96), transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; if (t === 'UITGAAND') m.rotation.z = Math.PI / 2; m.position.set(x, 0.032, z); hallMarks.add(m);
  }
  // a little OPSLAG sign on a post at the north end of the row
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.42), lam({ map: deps.signTex([{ t: 'OPSLAG · 10 PALLETS', size: 34 }], '#f2b21a', '#1a1a1a', 512, 144) })); s.position.set(0.82, 2.9, -12.4); s.rotation.y = -Math.PI / 2; marks.add(s); }

  let sig = '';
  function layout() { // which pallet place holds what: vaten from the north end, blue bags from the door end, overflow in De Hal
    const e = econ.ensure(), p = P(), b = blend(e.order), need = b.mix ? Object.keys(b.mix) : [];
    const raw = {}; for (const [k, kg] of Object.entries(e.stock)) { const id = k.split(':')[0]; raw[id] = (raw[id] || 0) + kg; }
    const ids = Object.keys(raw).sort((a, c) => (need.includes(a) ? 1 : 0) - (need.includes(c) ? 1 : 0) || a.localeCompare(c)); // tonight's spices last: they are taken first
    let vats = []; for (const id of ids) for (let k = 0; k < Math.ceil(raw[id] / VAT_KG - 0.01); k++) vats.push(id);
    const rawKg = Object.values(raw).reduce((a, c) => a + c, 0); vats = vats.slice(0, Math.max(Math.ceil(rawKg / VAT_KG), 0));
    // taken today: one vat of each spice in the blend in turn
    let take = Math.min(vats.length, Math.floor((p.vat + 0.01) / VAT_KG)), turn = 0;
    while (take > 0) { const id = need.length ? need[turn++ % need.length] : null; let i = id ? vats.lastIndexOf(id) : -1; if (i < 0) i = vats.length - 1; vats.splice(i, 1); take--; if (turn > 400) break; }
    const hall = inHall(), tent = loods.has('tent');
    // De Hal: the vaten standing ready at the mixer (p.feed) come off the stock, tonight's spices first
    let feed = []; if (hall) { if (p.feed === undefined) p.feed = 8; p.feed = Math.max(0, Math.min(p.feed, vats.length, 8)); feed = vats.splice(vats.length - p.feed, p.feed); }
    spare = vats.length;
    const bags = []; for (const bl of econ.BLENDS) { const kg = econ.blendOf(bl.id).kg; for (let k = 0; k < Math.ceil(kg / BAG_KG - 0.01); k++) bags.push(bl.id); }
    const made = Math.floor((p.out + 0.01) / BAG_KG), shipped = hall ? Math.max(0, (p.ship || 0) - transit) * 8 : made;
    for (let k = 0; k < Math.min(made, shipped); k++) bags.push(b.id);
    const outBags = hall ? Array.from({ length: Math.max(0, Math.min(8, made - (p.ship || 0) * 8)) }, () => b.id) : [];
    const s = `${vats.join()}|${bags.join()}|${hall}|${tent}|${feed.join()}|${outBags.length}`;
    if (s === sig) return; sig = s;
    const rawLoads = [], bagLoads = [];
    for (let i = 0; i < vats.length; i += 4) rawLoads.push({ vats: vats.slice(i, i + 4) });
    for (let i = 0; i < bags.length; i += 8) bagLoads.push({ bags: bags.slice(i, i + 8) });
    for (const pl of places) pl.load = null;
    const rawOrder = shedPlaces.slice(), bagOrder = [8, 9, 6, 7, 4, 5, 2, 3, 0, 1].map((i) => shedPlaces[i]);
    const put = (order, loads, max) => { let n = 0; while (loads.length && n < max) { const pl = order.find((x) => !x.load); if (!pl) break; pl.load = loads.shift(); n++; } };
    if (hall) {
      const fp = zone('feed'); for (let i = 0; i < feed.length; i += 4) fp[i >> 2].load = { vats: feed.slice(i, i + 4) };
      if (outBags.length) zone('out')[0].load = { bags: outBags };
      put(zone('uit'), bagLoads, 3); put(rawOrder, rawLoads, 99); put(hallPlaces.slice().reverse(), bagLoads, 2); put(hallPlaces, rawLoads, 99);
      if (tent) { put(zone('tent'), rawLoads, 99); put(zone('tent').slice().reverse(), bagLoads, 99); }
      put(hallPlaces.slice().reverse(), bagLoads, 99); put(bagOrder, bagLoads, 99);
    } else { put(bagOrder, bagLoads, 4); put(rawOrder, rawLoads, 99); put(bagOrder, bagLoads, 99); } // the door end keeps room for finished bags
    // a level-1 load with nothing under it drops to the floor
    for (const sp of SHED_SPOTS) { const ps = places.filter((x) => x.spot === sp); if (ps[1] && ps[1].load && !ps[0].load) { ps[0].load = ps[1].load; ps[1].load = null; } }
    for (const pl of places) {
      const l = pl.load; pl.g.visible = !!l && (pl.shed || (pl.zone === 'tent' ? tent : hall)); if (!l) continue;
      const under = pl.level ? places.find((x) => x.spot === pl.spot && x.level === 0).load : null;
      pl.g.position.y = under ? (under.vats ? 0.82 : 0.2 + Math.ceil(under.bags.length / 4) * 0.135) : 0;
      pl.vats.forEach((v, k) => { v.visible = !!(l.vats && l.vats[k]); if (v.visible) v.userData.set(l.vats[k]); });
      pl.bags.forEach((bg, k) => { bg.visible = !!(l.bags && l.bags[k]); if (bg.visible) bg.userData.set(l.bags[k]); });
    }
    for (const sp of ALL_SPOTS) sp.sol.off = !places.some((x) => x.spot === sp && x.g.visible);
    hallMarks.visible = hall; tentMarks.visible = tent;
  }
  let spare = 0, transit = 0; // vaten in stock beyond the ones at the mixer; a bag pallet riding the heftruck
  const floorKg = () => places.filter((x) => x.g.visible && x.zone !== 'feed' && x.zone !== 'out').length * PLACE_KG; // what stands on floor places (the racking shows the rest)
  const topOf = (sp) => { const ps = places.filter((x) => x.spot === sp && x.load); return ps[ps.length - 1] || null; };
  const vatSpots = () => (inHall() ? FEED_SPOTS : SHED_SPOTS).filter((sp) => { const t = topOf(sp); return t && t.load.vats && t.load.vats.length; });
  function outSpot() { // where the next blue bag goes: a bag pallet with room, else the first empty spot from the door end (De Hal: the UIT place by the packing)
    if (inHall()) return OUT_SPOT;
    const withRoom = SHED_SPOTS.slice().reverse().find((sp) => { const t = topOf(sp); return t && t.load.bags && t.load.bags.length < 8; });
    return withRoom || SHED_SPOTS.slice().reverse().find((sp) => !topOf(sp)) || SHED_SPOTS[SHED_SPOTS.length - 1];
  }
  const standAt = (sp) => ({ x: sp.x + sp.sx, z: sp.z + sp.sz });

  // ================================================================== the mixers
  const mixers = [0, 1, 2, 3].map(() => { const g = new THREE.Group(); g.position.set(MX, 0, MZ); g.visible = false; scene.add(g); return g; });
  const mixSol = TIER.map((t) => { const s = solid(MX - t.rx, MX + t.rx, MZ - t.rz, MZ + t.rz); s.off = true; return s; });
  const setSol = (o, x0, x1, z0, z1) => Object.assign(o, { minx: x0, maxx: x1, minz: z0, maxz: z1 });
  const spiceTex = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, '#e8862a'); gr.addColorStop(1, '#b0481a'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); g.strokeStyle = 'rgba(255,214,140,.5)'; g.lineWidth = 5; for (let a = 0; a < 3; a++) { g.beginPath(); for (let k = 0; k < 60; k++) { const r = k * 1.05, t = k * 0.12 + a * 2.1; g.lineTo(64 + Math.cos(t) * r, 64 + Math.sin(t) * r); } g.stroke(); } });
  const spiceMat = new THREE.MeshLambertMaterial({ map: spiceTex });
  const spin = [], gauges = [];
  { // tier 0, de kuipmenger: a second-hand bakery floor mixer. Enamel base and column, a head that hangs over a stainless bowl, a turning mixing arm
    const g = mixers[0]; g.scale.setScalar(1.25); const en = new THREE.MeshPhongMaterial({ color: 0xf2e6c4, shininess: 60 }), saf = mt(0xf2b21a);
    box(1.0, 0.24, 1.5, en, 0, 0.12, 0, g); box(1.04, 0.05, 1.54, dark, 0, 0.025, 0, g, false);
    box(0.62, 1.45, 0.46, en, 0, 0.96, -0.5, g); box(0.66, 0.06, 0.5, saf, 0, 0.5, -0.5, g, false); // the column
    box(0.56, 0.36, 1.05, en, 0, 1.66, -0.12, g); box(0.6, 0.06, 1.09, saf, 0, 1.86, -0.12, g, false); cyl(0.2, 0.2, 0.5, dark, 0, 1.66, -0.78, g, 12).rotation.x = Math.PI / 2; // the head and its motor
    const bw = new THREE.Group(); bw.position.set(0, 0.05, 0.22); g.add(bw);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.46, 0.66, 24, 1, true), new THREE.MeshPhongMaterial({ color: 0xc8ced4, shininess: 90, specular: 0x888888, side: THREE.DoubleSide })); bowl.position.y = 0.56; bowl.castShadow = true; bw.add(bowl);
    cyl(0.46, 0.46, 0.04, steel, 0, 0.23, 0, bw, 24); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.585, 0.022, 6, 30), steel); rim.rotation.x = Math.PI / 2; rim.position.y = 0.89; bw.add(rim);
    const s = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), spiceMat); s.rotation.x = -Math.PI / 2; s.position.y = 0.3; bw.add(s); spin.push({ o: s, ax: 'z', v: 0.8 }); g.userData.surf = s;
    // the mixing arm: a shaft down from the head with a paddle frame, turning in the bowl
    const arm = new THREE.Group(); arm.position.set(0, 0, 0.22); g.add(arm); spin.push({ o: arm, ax: 'y', v: 3.2 });
    cyl(0.035, 0.035, 0.75, steel, 0, 1.12, 0, arm, 8); box(0.7, 0.04, 0.04, steel, 0, 0.78, 0, arm, false); for (const x of [-0.33, 0.33]) box(0.04, 0.42, 0.06, steel, x, 0.58, 0, arm, false); box(0.5, 0.04, 0.04, steel, 0, 0.4, 0, arm, false);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; box(0.014, 0.3, 0.014, dark, Math.cos(a) * 0.6, 1.1, 0.22 + Math.sin(a) * 0.6, g, false); } // the safety cage
    const cage = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.014, 5, 30), dark); cage.rotation.x = Math.PI / 2; cage.position.set(0, 1.25, 0.22); g.add(cage);
    box(0.3, 0.4, 0.04, mt(0x2a2a2e), 0.5, 1.2, -0.3, g, false).rotation.y = Math.PI / 2; box(0.03, 0.08, 0.08, mt(0x40ff60, { emissive: 0x20a030 }), 0.53, 1.3, -0.36, g, false); box(0.03, 0.08, 0.08, mt(0xc2412d), 0.53, 1.3, -0.24, g, false); cyl(0.05, 0.05, 0.04, mt(0xc2412d), 0.54, 1.12, -0.3, g, 10).rotation.z = Math.PI / 2;
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.16), lam({ map: deps.signTex([{ t: 'KUIPMENGER 80', size: 40 }], '#1a2f6a', '#f6f0e0', 320, 100) })); sg.position.set(0, 1.66, 0.42); g.add(sg);
  }
  { // tier 1, de Mengmachine: a big tilted saffron drum on a steel frame, open to the south
    const g = mixers[1];
    for (const x of [-0.92, 0.92]) { for (const z of [-0.5, 0.5]) { const l = box(0.09, 1.5, 0.09, dark, x, 0.72, z * 0.9, g); l.rotation.x = z > 0 ? -0.22 : 0.22; } box(0.1, 0.1, 1.1, dark, x, 0.06, 0, g); box(0.16, 0.2, 0.2, dark, x, 1.42, 0, g); }
    box(1.9, 0.08, 0.1, dark, 0, 0.06, -0.5, g);
    const tilt = new THREE.Group(); tilt.position.set(0, 1.42, 0); tilt.rotation.x = 0.72; g.add(tilt);
    const drum = new THREE.Group(); tilt.add(drum); spin.push({ o: drum, ax: 'y', v: 1.6 });
    cyl(0.6, 0.78, 0.5, mt(0xf2b21a), 0, -0.5, 0, drum, 18); cyl(0.78, 0.78, 0.5, mt(0xf2b21a), 0, 0, 0, drum, 18); cyl(0.5, 0.78, 0.5, mt(0xe8a01a), 0, 0.5, 0, drum, 18);
    cyl(0.5, 0.5, 0.03, mt(0x2a1a10), 0, 0.745, 0, drum, 18); cyl(0.42, 0.42, 0.02, spiceMat, 0, 0.75, 0, drum, 18);
    for (let k = 0; k < 3; k++) { const a = k * 2.094; const f = box(0.05, 1.3, 0.12, mt(0xc8900e), Math.cos(a) * 0.79, 0, Math.sin(a) * 0.79, drum, false); f.rotation.y = -a; }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.035, 6, 26), dark); ring.rotation.x = Math.PI / 2; ring.position.y = -0.1; drum.add(ring);
    box(0.42, 0.42, 0.5, mt(0x2a6a3a), 1.2, 0.5, -0.3, g); box(0.2, 0.3, 0.06, mt(0xf2ead8), 1.2, 0.9, 0.0, g); box(0.06, 0.06, 0.03, mt(0x40ff60, { emissive: 0x20a030 }), 1.2, 0.96, 0.04, g, false);
  }
  { // tier 2, de industriële menger: a stainless ribbon blender with a low feed hopper on the south side
    const g = mixers[2];
    for (const [x, z] of [[-1.1, -0.45], [1.1, -0.45], [-1.1, 0.45], [1.1, 0.45]]) box(0.1, 0.95, 0.1, steel, x, 0.47, z, g);
    box(2.5, 0.7, 1.1, steel, 0, 1.55, 0, g); const tr = cyl(0.55, 0.55, 2.5, steel, 0, 1.2, 0, g, 18); tr.rotation.z = Math.PI / 2;
    box(2.56, 0.05, 1.16, mt(0xa8aeb4), 0, 1.92, 0, g); for (const x of [-0.7, 0.7]) box(0.5, 0.04, 0.3, dark, x, 1.96, 0, g, false);
    const hop = cyl(0.42, 0.16, 0.5, steel, -0.5, 1.12, 0.74, g, 4); hop.rotation.y = Math.PI / 4; box(0.3, 0.3, 0.3, steel, -0.5, 1.2, 0.56, g, false);
    box(0.5, 0.5, 0.6, mt(0x2a6a3a), 1.5, 1.25, 0, g); const sh = cyl(0.09, 0.09, 0.3, dark, 1.2, 1.25, 0, g, 8); sh.rotation.z = Math.PI / 2; const pul = cyl(0.2, 0.2, 0.06, mt(0xf2b21a), 1.3, 1.25, 0.36, g, 12); pul.rotation.x = Math.PI / 2; spin.push({ o: pul, ax: 'y', v: 4 });
    box(0.4, 0.6, 0.14, mt(0xf2ead8), 0.55, 1.5, 0.62, g); gauges.push(box(0.07, 0.4, 0.02, mt(0xe8862a, { emissive: 0x803000 }), 0.45, 1.5, 0.7, g, false));
    box(0.08, 0.08, 0.03, mt(0x40ff60, { emissive: 0x20a030 }), 0.66, 1.66, 0.7, g, false); box(0.08, 0.08, 0.03, mt(0xc2412d), 0.66, 1.52, 0.7, g, false);
    cyl(0.12, 0.09, 0.3, steel, -1.0, 0.55, 0, g, 8); // the discharge spout on the west end: the scoop place
  }
  { // tier 3, De Reuzenmenger: a tall stainless vessel on legs, a screw conveyor from a low hopper up to the lid, a ladder, a porthole
    const g = mixers[3];
    for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; box(0.14, 1.0, 0.14, steel, Math.cos(a) * 1.0, 0.5, Math.sin(a) * 1.0, g); }
    cyl(1.15, 0.3, 0.6, steel, 0, 0.75, 0, g, 22); const v = cyl(1.15, 1.15, 1.9, steel, 0, 2.0, 0, g, 22); v.castShadow = true; cyl(0.5, 1.15, 0.3, steel, 0, 3.1, 0, g, 22);
    for (const y of [1.25, 2.0, 2.75]) { const h = new THREE.Mesh(new THREE.TorusGeometry(1.16, 0.03, 6, 30), mt(0x8a9098)); h.rotation.x = Math.PI / 2; h.position.y = y; g.add(h); }
    box(0.5, 0.45, 0.5, mt(0x2a6a3a), 0, 3.48, 0, g); const fan = cyl(0.3, 0.3, 0.06, mt(0xf2b21a), 0, 3.74, 0, g, 12); spin.push({ o: fan, ax: 'y', v: 5 });
    const port = new THREE.Mesh(new THREE.CircleGeometry(0.26, 18), new THREE.MeshLambertMaterial({ map: spiceTex, emissive: 0x602000 })); port.position.set(0.55, 2.0, 1.03); port.rotation.y = 0.5; g.add(port); spin.push({ o: port, ax: 'z', v: 2 });
    const pr = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 6, 20), dark); pr.position.copy(port.position); pr.rotation.y = 0.5; g.add(pr);
    // feed hopper at Naknik height and the screw conveyor up to the lid
    const hop = cyl(0.42, 0.16, 0.5, steel, -0.35, 1.0, 1.6, g, 4); hop.rotation.y = Math.PI / 4; for (const x of [-0.6, -0.1]) box(0.05, 0.8, 0.05, steel, x, 0.4, 1.6, g, false);
    const tube = cyl(0.11, 0.11, 2.5, mt(0xa8aeb4), -0.35, 2.0, 1.12, g, 10); tube.rotation.x = -0.4; box(0.3, 0.26, 0.36, mt(0x2a6a3a), -0.35, 3.2, 0.62, g, false);
    // ladder on the west side
    for (const z of [-0.2, 0.2]) box(0.04, 3.0, 0.04, mt(0xf2b21a), -1.21, 1.5, z, g, false); for (let y = 0.3; y < 3.0; y += 0.3) box(0.03, 0.03, 0.4, mt(0xf2b21a), -1.21, y, 0, g, false);
    box(0.44, 0.7, 0.14, mt(0xf2ead8), 0.95, 1.3, 0.85, g).rotation.y = 0.85; gauges.push(box(0.07, 0.5, 0.02, mt(0xe8862a, { emissive: 0x803000 }), 0.92, 1.3, 0.95, g, false)); gauges[gauges.length - 1].rotation.y = 0.85;
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.34), lam({ map: deps.signTex([{ t: 'DE REUZENMENGER', size: 40 }], '#1a2f6a', '#f6f0e0', 512, 116) })); sg.position.set(0, 2.55, 1.17); g.add(sg);
  }
  const pourAt = () => { const t = TIER[tier()]; return t === TIER[2] ? { x: MX - 0.5, z: MZ + 1.55 } : t === TIER[3] ? { x: MX - 0.35, z: MZ + 2.35 } : { x: MX, z: MZ + t.rz + 0.5 }; };
  const scoopAt = () => { const t = TIER[tier()], sd = inHall() ? 1 : -1; return { x: MX + sd * (t.rx + (sd > 0 && tier() === 2 ? 1.0 : 0.5)), z: MZ + (tier() === 3 && sd < 0 ? 0.7 : 0.15) }; };

  // ================================================================== packing: the table, then the Inpakmachine
  const table = new THREE.Group(); table.position.set(PX, 0, PZ); table.visible = false; scene.add(table);
  const tableBags = [];
  { const top = new THREE.MeshPhongMaterial({ color: 0xb8bec4, shininess: 70 });
    box(0.9, 0.07, 1.6, top, 0, 0.84, 0, table); for (const [x, z] of [[-0.38, -0.72], [0.38, -0.72], [-0.38, 0.72], [0.38, 0.72]]) box(0.06, 0.84, 0.06, top, x, 0.42, z, table); box(0.8, 0.04, 1.5, mt(0x8a9098), 0, 0.25, 0, table, false);
    cyl(0.24, 0.2, 0.26, mt(0xf2ead8), 0.12, 1.0, -0.5, table, 14); cyl(0.22, 0.22, 0.02, spiceMat, 0.12, 1.12, -0.5, table, 14); // the tub of blend with a scoop
    const sc = box(0.07, 0.05, 0.22, steel, 0.0, 1.16, -0.42, table, false); sc.rotation.set(0.5, 0.6, 0);
    box(0.34, 0.06, 0.3, mt(0xf2ead8), 0.1, 0.9, 0.05, table); box(0.26, 0.012, 0.24, steel, 0.1, 0.94, 0.05, table, false); box(0.14, 0.12, 0.04, mt(0x2a2a2e), 0.1, 0.98, 0.21, table, false); box(0.1, 0.06, 0.01, mt(0x40ff60, { emissive: 0x20a030 }), 0.1, 0.99, 0.235, table, false); // the weegschaal
    for (let k = 0; k < 5; k++) box(0.42, 0.012, 0.3, mt(0x2f62b8), 0.14, 0.885 + k * 0.012, 0.52, table, false); // flat empty bags
    const roll = cyl(0.07, 0.07, 0.1, mt(0xfbf4e2), -0.25, 0.95, 0.6, table, 12); roll.rotation.z = Math.PI / 2; // the roll of labels
    for (let k = 0; k < 2; k++) { const b = makeBag('kip'); b.position.set(-0.2, 0.94 + k * 0.13, -0.1 + k * 0.03); b.rotation.y = k * 0.2; table.add(b); tableBags.push(b); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.36), lam({ map: deps.signTex([{ t: 'INPAKTAFEL', size: 44 }], '#1a2f6a', '#f6f0e0', 512, 140) })); sg.position.set(0.52, 2.6, 0); sg.rotation.y = -Math.PI / 2; table.add(sg);
  }
  const mach = new THREE.Group(); mach.position.set(PX, 0, PZ); mach.visible = false; scene.add(mach);
  const beltBags = [];
  { // the Inpakmachine: filler tower at the door end, a belt running north to the pallets
    const blue = mt(0x2a5aa8);
    box(0.85, 1.5, 0.8, steel, 0.02, 0.75, 0.55, mach); box(0.9, 0.08, 0.86, blue, 0.02, 1.54, 0.55, mach, false);
    const hop = cyl(0.46, 0.2, 0.5, steel, -0.05, 1.83, 0.55, mach, 4); hop.rotation.y = Math.PI / 4;
    const lowHop = cyl(0.3, 0.12, 0.36, steel, -0.6, 1.1, 0.55, mach, 4); lowHop.rotation.y = Math.PI / 4; const up = cyl(0.07, 0.07, 1.0, mt(0xa8aeb4), -0.38, 1.5, 0.55, mach, 8); up.rotation.z = -0.62; // feed hopper at Naknik height
    box(0.3, 0.42, 0.05, mt(0xf2ead8), -0.42, 1.2, 0.2, mach, false).rotation.y = Math.PI / 2; box(0.02, 0.08, 0.08, mt(0x40ff60, { emissive: 0x20a030 }), -0.45, 1.32, 0.12, mach, false);
    box(0.6, 0.06, 1.25, mt(0x2a2a2e), 0.05, 0.86, -0.45, mach); box(0.7, 0.1, 1.3, blue, 0.05, 0.78, -0.45, mach, false);
    for (const z of [-1.0, 0.0]) for (const x of [-0.24, 0.34]) box(0.06, 0.78, 0.06, steel, x, 0.39, z, mach);
    for (const z of [-1.05, 0.12]) { const r = cyl(0.06, 0.06, 0.62, steel, 0.05, 0.86, z, mach, 8); r.rotation.z = Math.PI / 2; spin.push({ o: r, ax: 'x', v: -5 }); }
    box(0.5, 0.36, 0.3, blue, 0.05, 1.25, 0.05, mach); cyl(0.08, 0.08, 0.12, mt(0xfbf4e2), 0.36, 1.3, 0.05, mach, 10).rotation.z = Math.PI / 2; // the sealer and its label roll
    for (let k = 0; k < 3; k++) { const b = makeBag('kip'); b.scale.setScalar(0.9); b.position.set(0.05, 0.96, 0); b.visible = false; mach.add(b); beltBags.push({ b, t: -1 }); }
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.36), lam({ map: deps.signTex([{ t: 'INPAKMACHINE', size: 42 }], '#1a2f6a', '#f6f0e0', 512, 124) })); sg.position.set(0.52, 2.6, -0.2); sg.rotation.y = -Math.PI / 2; mach.add(sg);
  }
  const packSol = solid(PX - 0.5, PX + 0.5, PZ - 0.85, PZ + 0.85); packSol.off = true;
  const machSol = solid(PX - 0.55, PX + 0.5, PZ - 1.15, PZ + 1.0); machSol.off = true;

  // ================================================================== the production board on the back wall
  const boardCv = document.createElement('canvas'); boardCv.width = 640; boardCv.height = 256;
  const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.32), new THREE.MeshBasicMaterial({ map: boardTex })); board.position.set(-0.75, 3.55, -18.8); board.visible = false; scene.add(board);
  let boardSig = '';
  function drawBoard() {
    const e = econ.ensure(), p = P(), T = target(), b = blend(e.order), n = econ.mixers();
    const s = [e.order, T, Math.round(p.out * 2), econ.placesUsed(), econ.places(), n, helpKg()].join();
    if (s === boardSig) return; boardSig = s;
    const g = boardCv.getContext('2d'), W = 640, H = 256;
    const bg = g.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#fffaf0'); bg.addColorStop(1, '#f1dfb0'); g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const hd = g.createLinearGradient(0, 0, 0, 62); hd.addColorStop(0, '#5b9ae8'); hd.addColorStop(0.5, '#2a5aa8'); hd.addColorStop(1, '#1a3f86'); g.fillStyle = hd; g.fillRect(0, 0, W, 62);
    g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, 0, W, 28);
    g.fillStyle = '#fff'; g.font = '900 34px Arial'; g.textAlign = 'left'; g.fillText('PRODUCTIE VANDAAG', 20, 44); g.textAlign = 'right'; g.font = '700 24px Arial'; g.fillText(`dag ${e.day}`, W - 20, 42);
    g.textAlign = 'left'; g.fillStyle = '#2a1a0e'; g.font = '900 40px Arial'; g.fillText(b.name, 20, 110);
    const done = Math.min(T, p.out), k = T ? done / T : 0;
    g.fillStyle = 'rgba(60,40,10,.18)'; g.beginPath(); g.roundRect(20, 128, W - 40, 44, 22); g.fill();
    if (k > 0) { const gr = g.createLinearGradient(0, 128, 0, 172); gr.addColorStop(0, '#ffd97a'); gr.addColorStop(0.5, '#f2a81a'); gr.addColorStop(1, '#d8820a'); g.fillStyle = gr; g.beginPath(); g.roundRect(20, 128, Math.max(44, (W - 40) * k), 44, 22); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.beginPath(); g.roundRect(26, 131, Math.max(32, (W - 40) * k - 12), 16, 8); g.fill(); }
    g.fillStyle = '#2a1a0e'; g.font = '900 26px Arial'; g.textAlign = 'center';
    g.fillText(T ? `${String(done).replace('.', ',')} / ${T} kg in blauwe zakken` : n || helpKg() ? 'Geen voorraad voor deze mix' : 'Nog geen Naknikim aan het werk', W / 2, 160);
    g.font = '700 24px Arial'; g.textAlign = 'left'; g.fillStyle = '#5a3a1a'; g.fillText(`Opslag: ${econ.placesUsed()} / ${econ.places()} palletplaatsen`, 20, 222);
    g.textAlign = 'right'; g.fillText(helpKg() ? `Eddy hielp mee: +${String(helpKg()).replace('.', ',')} kg` : `${n} Naknik${n === 1 ? '' : 'im'}`, W - 20, 222);
    boardTex.needsUpdate = true;
  }

  // ================================================================== Eddy helps
  const held = new THREE.Group(); held.position.set(0, 1.0, 0.44); held.visible = false; player.add(held);
  const heldVat = makeVat('paprika'); heldVat.children.forEach((c) => { c.position.y -= 0.3; }); held.add(heldVat);
  const heldBag = makeBag('kip'); held.add(heldBag);
  let hold = null; // {kind: 'vat'|'zak', id}
  const setHold = (h) => { hold = h; held.visible = !!h; heldVat.visible = !!h && h.kind === 'vat'; heldBag.visible = !!h && h.kind === 'zak'; if (h && h.kind === 'vat') heldVat.userData.set(h.id); if (h && h.kind === 'zak') heldBag.userData.set(h.id); };
  const V = (x, z) => new THREE.Vector3(x, 0, z), far = new THREE.Vector3(0, -99, 0);
  const active = () => state.table && !deps.away();
  const nearSpot = (list, r = 1.7) => { let best = null, bd = r; for (const sp of list) { const s = standAt(sp), d = Math.hypot(s.x - player.position.x, s.z - player.position.z); if (d < bd) { bd = d; best = sp; } } return best; };
  const streams = [];
  function stream(x, y, z, toY, col) { const m = new THREE.Mesh(geo('str', () => { const s = new THREE.CylinderGeometry(0.04, 0.07, 1, 6); s.translate(0, -0.5, 0); return s; }), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.85, depthWrite: false })); m.position.set(x, y, z); m.scale.y = Math.max(0.1, y - toY); scene.add(m); streams.push({ m, t: 1.1 }); }
  const comma = (n) => String(n).replace('.', ',');
  function liftVat(sp) {
    const p = P(), t = topOf(sp); if (!t || !t.load.vats) return;
    if (p.eddy * HELP_KG >= HELP_MAX) return deps.toast('GENOEG GESJOUWD', `You tipped ${p.eddy} vaten today (+${comma(HELP_MAX)} kg). The Naknikim do the rest; your back says thanks.`, 3);
    const b = blend(econ.ensure().order), need = b.mix ? Object.keys(b.mix) : [];
    const id = t.load.vats.slice().reverse().find((v) => need.includes(v)) || t.load.vats[t.load.vats.length - 1];
    p.vat += VAT_KG; if (inHall()) p.feed = Math.max(0, (p.feed || 0) - 1); setHold({ kind: 'vat', id }); deps.beep(300, 0.08, 'triangle', 0.04); sig = ''; layout();
  }
  function tipVat() {
    const p = P(), f = pourAt(), id = hold.id; setHold(null);
    stream(f.x, 1.5, f.z - 0.45, TIER[tier()].ty, ING_COL[id] ?? 0xc8641e);
    p.mix += VAT_KG; p.eddy++; deps.beep(180, 0.35, 'sawtooth', 0.03); deps.beep(520, 0.12, 'triangle', 0.04);
    const T = target();
    deps.toast('MEEHELPEN', T ? `A vat of ${ingName(id)} into ${TIER[tier()].name.toLowerCase()}: <b>+${comma(HELP_KG)} kg</b> in tonight's batch (${comma(helpKg())} / ${HELP_MAX} kg from your own hands today).` : `In it goes. But there is no stock for a full ${blend(econ.ensure().order).name}: order what's missing at the Kruidenbeurs.`, 3.2);
    deps.save();
  }
  function fillBag() {
    const p = P();
    if (machine()) { if (p.belt < 1) return deps.toast('INPAKMACHINE', p.mix >= BAG_KG ? 'The belt is empty: a Naknik has to feed the hopper first (or wait a moment).' : 'Nothing to pack: the mixer is empty. Tip a vat in first.', 2.6); p.belt--; }
    else { if (p.mix < BAG_KG) return deps.toast('INPAKTAFEL', 'The tub is empty: tip a vat into the mixer first.', 2.4); p.mix -= BAG_KG; p.sc += BAG_KG; }
    setHold({ kind: 'zak', id: econ.ensure().order }); deps.beep(700, 0.07, 'triangle', 0.04);
  }
  function stackBag() {
    const p = P(); setHold(null); p.out += BAG_KG; deps.beep(240, 0.1, 'square', 0.03); sig = ''; layout();
    if (p.pep < PEP_MAX && deps.pep) { p.pep++; deps.pep(1); deps.toast('ZAK OP DE PALLET', `${blend(econ.ensure().order).name}, 2,5 kg, label straight. The Naknikim see the boss work: mood up.`, 2.2); }
    deps.save();
  }
  deps.addInteract({ pos: () => { if (!active() || hold) return far; const sp = nearSpot(vatSpots()); return sp ? V(standAt(sp).x, standAt(sp).z) : far; }, r: 1.7, enabled: () => active() && !hold && !!nearSpot(vatSpots()),
    label: () => { const t = topOf(nearSpot(vatSpots())); return `Lift a vat · ${[...new Set(t.load.vats)].map(ingName).join(', ')}`; }, act: () => liftVat(nearSpot(vatSpots())) });
  deps.addInteract({ pos: () => (active() ? V(pourAt().x, pourAt().z) : far), r: 1.9, enabled: () => active(),
    label: () => (hold && hold.kind === 'vat' ? `Tip the vat of ${ingName(hold.id)} into ${TIER[tier()].name.toLowerCase()}` : `${TIER[tier()].name} · ${comma(Math.round(P().mix * 10) / 10)} kg of ${blend(econ.ensure().order).name} in it`),
    act: () => (hold && hold.kind === 'vat' ? tipVat() : deps.toast(TIER[tier()].name.toUpperCase(), 'The Naknikim tip vaten of raw spice in here; the blend goes to the packing table and into blue bags. Lift a vat from the pallets and help: every vat you tip adds to tonight\'s batch.', 4.5)) });
  deps.addInteract({ pos: () => (active() && !hold ? V(PX - 0.95, PZ + (machine() ? -0.7 : 0)) : far), r: 1.5, enabled: () => active() && !hold, label: () => (machine() ? `Take a blue bag off the belt (${P().belt})` : 'Fill a blue bag · scoop, weigh, label'), act: fillBag });
  deps.addInteract({ pos: () => { if (!active() || !hold) return far; const s = standAt(hold.kind === 'zak' ? outSpot() : (nearSpot(inHall() ? FEED_SPOTS : SHED_SPOTS, 99) || SHED_SPOTS[0])); return V(s.x, s.z); }, r: 1.7, enabled: () => active() && !!hold && (hold.kind === 'zak' || Math.hypot(pourAt().x - player.position.x, pourAt().z - player.position.z) > 1.9),
    label: () => (hold.kind === 'zak' ? 'Stack the bag on the pallet' : 'Put the vat back'), act: () => { if (hold.kind === 'zak') stackBag(); else { P().vat = Math.max(0, P().vat - VAT_KG); if (inHall()) P().feed = (P().feed || 0) + 1; setHold(null); sig = ''; layout(); } } });

  // ================================================================== what the Naknikim can do here (js/naknikwork.js)
  function stations() {
    if (!state.table) return [];
    const p = P(), T = target(), out = [], pa = pourAt(), sa = scoopAt(), t = TIER[tier()], hall = inHall(), area = hall ? 'hall' : 'shed', spots = hall ? FEED_SPOTS : SHED_SPOTS;
    if (p.vat < T - 0.01) for (const sp of vatSpots()) { const s = standAt(sp), top = topOf(sp);
      out.push({ key: `vat${spots.indexOf(sp)}`, prod: 'vat', carry: 'vat', kind: 'vat', area, far: true, x: s.x, z: s.z, fx: sp.x, fz: sp.z, h: top.level ? 'mid' : 'floor', grab: true,
        onGrab: () => { const b = blend(econ.ensure().order), need = b.mix ? Object.keys(b.mix) : []; carryVat = top.load.vats.slice().reverse().find((v) => need.includes(v)) || top.load.vats[top.load.vats.length - 1] || 'paprika'; P().vat += VAT_KG; if (hall) P().feed = Math.max(0, (P().feed || 0) - 1); sig = ''; return ING_COL[carryVat]; } }); }
    out.push({ key: 'menger', prod: 'mixer', kind: 'machine', area, far: true, x: pa.x, z: pa.z, fx: pa.x, fz: pa.z - 1, h: 'pour', pour: true, ty: t.ty, onPour: () => { P().mix += VAT_KG; } });
    if (p.mix >= BAG_KG && p.sc < T - 0.01) out.push({ key: 'schep', prod: 'scoop', carry: 'emmer', kind: 'machine', area, far: true, x: sa.x, z: sa.z, fx: MX, fz: sa.z, h: 'mid', grab: true, onGrab: () => { const q = P(); q.mix = Math.max(0, q.mix - BAG_KG); q.sc += BAG_KG; return 0xd0742a; } });
    if (machine()) {
      out.push({ key: 'trechter', prod: 'hopper', kind: 'machine', area, far: true, x: PX - 1.05, z: PZ + 0.55, fx: PX, fz: PZ + 0.55, h: 'pour', pour: true, ty: 1.1, onPour: () => { P().belt++; const f = beltBags.find((x) => x.t < 0); if (f) f.t = 0; } });
      if (p.belt >= 1) out.push({ key: 'band', prod: 'belt', carry: 'zak', kind: 'machine', area, far: true, x: PX - 0.95, z: PZ - 0.9, fx: PX, fz: PZ - 0.9, h: 'mid', grab: true, onGrab: () => { const q = P(); q.belt = Math.max(0, q.belt - 1); return 0x2a5aa8; } });
    } else out.push({ key: 'inpak', prod: 'pack', kind: 'machine', area, far: true, x: PX - 0.95, z: PZ, fx: PX, fz: PZ, h: 'mid' });
    const os = outSpot(), s = standAt(os), top = topOf(os);
    out.push({ key: 'uit', prod: 'out', kind: 'pile', area, far: true, x: s.x, z: s.z, fx: os.x, fz: os.z, h: top && top.level ? 'mid' : 'floor', onDrop: () => { P().out += BAG_KG; sig = ''; } });
    return out;
  }
  const lineBusy = () => state.table && P().out < target() - 0.01;

  // ================================================================== per frame
  // ---- De Hal: the heftruck keeps the line going (a Naknik drives it, js/loods.js forkJob). No heftruck, or Eddy on it: after a
  // moment the pallets get there anyway (a Naknik with the hand pallet truck)
  const jobs = { feed: 0, out: 0, feedWait: 0, outWait: 0, t: 0 };
  function logistics(dt) {
    jobs.t -= dt; if (jobs.t > 0) return; jobs.t = 1;
    const p = P(), T = target(), made = Math.floor((p.out + 0.01) / BAG_KG);
    if (!jobs.feed && (p.feed || 0) <= 4 && spare > 0 && p.vat < T - 0.01) {
      const from = loods.rackPick ? loods.rackPick() : null, sp = FEED_SPOTS[(p.feed || 0) > 0 ? 1 : 0], add = () => { const q = P(); q.feed = (q.feed || 0) + Math.min(4, spare); sig = ''; jobs.feed = 0; jobs.feedWait = 0; };
      const b = blend(econ.ensure().order), need = b.mix ? Object.keys(b.mix) : [];
      if (from && loods.forkJob({ from, to: sp.stop, col: ING_COL[need[0]] ?? 0xc2412d, onDrop: add, onAbort: () => { jobs.feed = 0; } })) jobs.feed = 1;
      else if ((jobs.feedWait += 1) > 7) add();
    }
    if (!jobs.out && made - (p.ship || 0) * 8 >= 8) {
      const to = UIT_SPOTS.find((u) => !topOf(u)) || UIT_SPOTS[0], go = () => { const q = P(); q.ship = (q.ship || 0) + 1; sig = ''; };
      if (loods.forkJob && loods.forkJob({ from: OUT_SPOT.stop, to: to.stop, col: 0x2a5aa8, onLift: () => { go(); transit = 1; }, onDrop: () => { transit = 0; sig = ''; jobs.out = 0; jobs.outWait = 0; }, onAbort: () => { transit = 0; sig = ''; jobs.out = 0; } })) jobs.out = 1;
      else if ((jobs.outWait += 1) > 7) { go(); jobs.outWait = 0; }
    }
  }
  let slow = 0, shown = -1, wasTable = null, wasMach = null, wasHall = null, run = 0;
  function update(dt) {
    const on = !!state.table, tr = tier(), mc = machine(), hl = inHall();
    if (on !== wasTable || tr !== shown || mc !== wasMach || hl !== wasHall) {
      wasTable = on; shown = tr; wasMach = mc; wasHall = hl;
      const S = SITE[hl ? 'hall' : 'shed']; MX = S.mx; MZ = S.mz; PX = S.px; PZ = S.pz; // the line stands in the shed, or on the hall floor
      mixers.forEach((g, i) => { g.position.set(MX, 0, MZ); setSol(mixSol[i], MX - TIER[i].rx, MX + TIER[i].rx, MZ - TIER[i].rz, MZ + TIER[i].rz); });
      table.position.set(PX, 0, PZ); mach.position.set(PX, 0, PZ); setSol(packSol, PX - 0.5, PX + 0.5, PZ - 0.85, PZ + 0.85); setSol(machSol, PX - 0.55, PX + 0.5, PZ - 1.15, PZ + 1.0); sig = '';
      mixers.forEach((g, i) => { g.visible = on && i === tr; mixSol[i].off = !(on && i === tr); });
      table.visible = on && !mc; packSol.off = !(on && !mc); mach.visible = on && mc; machSol.off = !(on && mc); board.visible = on;
    }
    if (deps.away()) { if (hold) setHold(null); return; }
    slow -= dt; if (slow <= 0) { slow = 0.4; layout(); if (on) drawBoard(); const o = econ.ensure().order; tableBags.forEach((b) => b.userData.set(o)); beltBags.forEach((x) => x.b.userData.set(o)); }
    if (!on) return;
    if (hl) logistics(dt);
    const p = P(), busy = (econ.mixers() > 0 && lineBusy()) || p.mix > 0.1;
    run += ((busy ? 1 : 0) - run) * Math.min(1, dt * 2);
    for (const s of spin) s.o.rotation[s.ax] += dt * s.v * run;
    const k = Math.min(1, p.mix / [30, 60, 100, 160][tr]);
    const surf = mixers[0].userData.surf; surf.position.y += (0.22 + Math.min(1, p.mix / 30) * 0.6 - surf.position.y) * Math.min(1, dt * 3);
    for (const g of gauges) { g.scale.y = 0.08 + 0.92 * k; }
    // bags riding the belt north, waiting at the end until someone takes them
    if (mc) { let wait = 0; for (const x of beltBags) { if (x.t < 0) { x.b.visible = false; continue; } x.t += dt * 0.5; const z = Math.max(-1.0 + wait * 0.42, 0.0 - x.t); if (z <= -1.0 + wait * 0.42 + 0.001) wait++; x.b.visible = true; x.b.position.z = z; }
      const shownBags = beltBags.filter((x) => x.t >= 0).length; if (shownBags > Math.max(0, Math.ceil(p.belt))) { const done = beltBags.filter((x) => x.t >= 0).sort((a, b) => b.t - a.t)[0]; if (done) done.t = -1; } }
    for (let i = streams.length - 1; i >= 0; i--) { const s = streams[i]; s.t -= dt; s.m.material.opacity = 0.85 * Math.min(1, s.t / 0.3); if (s.t <= 0) { scene.remove(s.m); s.m.material.dispose(); streams.splice(i, 1); } }
    if (hold) held.position.y = 1.0 + Math.sin(performance.now() * 0.008) * 0.012;
  }
  return { floorKg, jobs, FEED_SPOTS, OUT_SPOT, UIT_SPOTS, update, stations, carry, helpKg, target, lineBusy, layout, state: P, tier, places, holding: () => hold, liftVat, tipVat, fillBag, stackBag, vatSpots, outSpot, standAt, TIER, pourAt, SHED_SPOTS };
}
