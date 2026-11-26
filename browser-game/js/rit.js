// De rit (2026-11-26, free roaming step 2): every drive in the Oofmobiel is driven in 3D, in the same world and with
// the same pedals as the borrowed cars (js/bikes.js). It replaces the top-down drive (the old js/drive.js).
//   1. De straat: Eddy pulls out of his parking at the warehouse and drives the home street east, through Kroketkade,
//      to the oprit (the yellow light and the arrow on the screen edge point the way).
//   2. De snelweg: Kaasland has Amsterdam's motorways. Every trip starts on the A10 ring and turns onto the motorway
//      for its district, as on the map (js/kaasgeo.js HIGHWAYS): the A4 for Schiptagat airport, the A8 for Hipsterheuvel, the A1
//      for the docks, the A5 for De Zandwijk, and afrit S100 of the ring itself for Oud-Vettenburg. Three lanes, a vluchtstrook, blue ANWB signs on gantries, trucks on the
//      right, fast cars on the left, wegwerkzaamheden that close a lane, a flitspaal, and past half-way a rival gang's
//      cars that ram the van: lead them into the roadworks or a truck and they wreck (a bounty).
//   3. Take the afrit on the right and park in the yellow ring: the raid, the delivery or the pick-up starts.
//      Miss the afrit and it is the next one and back: half a minute gone.
// The same contract as the old drive, so every caller kept working: start({ van, from, to, theme, mission, noPay,
// airport, arrived, doneLabel, johan, grip, onEvent, onDone }) and onDone({ arrived, pay, time, wrecked, bumped }).
// Events for the passenger (js/freddy.js) and the wear (js/garage.js): start, ped, crash, wreck, ambush, arrive, fail.
const PAR = 75, FINE = 25, BOUNTY = 50, BASE_PAY = 250, FLITS = 120 / 3.6;
const X0 = 1000, Z0 = 600, LEN = 980, LW = 3.4, EXIT0 = LEN - 230, EXIT1 = LEN - 110; // the motorway runs east from X0, centre lane on Z0; the afrit peels off between EXIT0 and EXIT1
const NEDGE = Z0 - LW * 1.5 - 0.9, SEDGE = Z0 + LW * 1.5 + 2.7; // the guard rail in the middle, and the outside of the vluchtstrook
const PARK = { x: X0 + LEN - 40, z: Z0 + 21 };
const W_ = 0xf4f2ec;
const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
// where each trip goes: the motorway, the afrit number, the towns on the signs, the land beside the road
export const ROUTES = {
  lampas: { a: 'A10', afrit: 'S100', via: 'Centrum', other: ['A2', 'Uitkaas'], gang: 'Lampas', props: 'brick', ground: 0x7a8a5a },
  nosh: { a: 'A8', afrit: 2, via: 'Kaasdam', other: ['A7', 'Purmerkaas'], gang: 'Noshgey Kariot', props: 'hip', ground: 0x7a9a5a },
  docks: { a: 'A1', afrit: 4, via: 'Kaasfoort', other: ['A2', 'Uitkaas'], gang: 'Abdavissies', props: 'docks', ground: 0x6a6e72 },
  sand: { a: 'A5', afrit: 7, via: 'Haarlemmerkaas', other: ['A8', 'Kaasdam'], gang: 'Paravim', props: 'sand', ground: 0xd8b878 },
  air: { a: 'A4', afrit: 2, via: 'Den Kaas', other: ['A9', 'Kaasstelveen'], gang: '', props: 'air', ground: 0x7a9a5a },
};

// deps: THREE, scene, player, state, kit(), lam, signTex, makeCar(opts), makeVan(), fiets, oof, oofSolid,
//       solid(), setBounds(b), snapCam(), buurt(), toast, beep, choice, RC, exit: { x, z }, roadMat, day(), blockedStart()
export function createRit(deps) {
  const { THREE, scene, player, state } = deps;
  const R = { active: false, phase: null, opts: null, t: 0, hp: 100, bumped: 0, wrecked: 0, smart: 0, ambush: 0, over: false, route: ROUTES.lampas, flashed: false };
  let van = null, veh = null, strip = null, scenery = null, ring = null, flash = null;
  const cars = [], works = [], gang = [], sols = []; let johanCue = null, vBase = 19, crashT = 0;
  // ---- the fade and the trip card
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40'; document.body.appendChild(fade);
  const fadeTo = (fn) => { fade.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { fade.style.opacity = '0'; }, 80); } }, 380); };
  const css = document.createElement('style');
  css.textContent = `#rit{position:fixed;left:16px;top:44px;z-index:9;display:none;min-width:230px;padding:8px 12px 9px;border-radius:12px;color:#fff;font:600 13px/1.35 Rubik,"Segoe UI",Arial,sans-serif;text-shadow:0 1px 2px #000;background:rgba(30,18,10,.72);border:1px solid rgba(255,226,170,.5)}
html.aero #rit{background:linear-gradient(180deg,rgba(120,80,48,.62),rgba(70,42,22,.66) 48%,rgba(42,25,13,.74) 52%,rgba(54,33,18,.7));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#rit b{color:#ffd36b}#rit .an{display:inline-block;padding:0 5px;border-radius:4px;background:#c8102e;color:#fff;font-weight:800;text-shadow:none}
#rit .bar{height:9px;margin:5px 0 3px;border-radius:6px;background:rgba(0,0,0,.45);overflow:hidden;border:1px solid rgba(255,240,210,.5)}#rit .bar i{display:block;height:100%;background:#6ed36e;transition:width .2s}
#rit small{font-weight:400;color:#f3e6c8}#rit button{margin-top:5px;pointer-events:auto;font:600 11px Rubik,Arial;color:#fff;background:rgba(0,0,0,.35);border:1px solid rgba(255,226,170,.5);border-radius:8px;padding:2px 8px;cursor:pointer}
body.ritting #objective,body.ritting #area,body.ritting #ftsOff,body.ritting #fts .spd,body.ritting #kit,body.ritting #weapon,body.ritting #income{display:none!important}
@media (max-width:820px),(max-height:500px){#rit{left:8px;top:8px;min-width:0;font-size:11.5px;padding:6px 9px}}`;
  document.head.appendChild(css);
  const hudEl = document.createElement('div'); hudEl.id = 'rit'; document.body.appendChild(hudEl);
  hudEl.addEventListener('click', (e) => { if (e.target.closest('button')) { e.stopPropagation(); giveUp(); } });
  let hudKey = '';
  function hud() {
    const o = R.opts, rt = R.route, kmh = Math.round(Math.abs(veh.B.v) * 3.6);
    const where = R.phase === 'street' ? `oprit <span class="an">A10</span> ${Math.max(0, Math.round(deps.exit.x - veh.B.x))} m`
      : veh.B.x < X0 + LEN * 0.4 && rt.a !== 'A10' ? `<span class="an">A10</span> ring → <span class="an">${rt.a}</span>` : `<span class="an">${rt.a}</span> afrit ${rt.afrit} ${o.to} ${Math.max(0, Math.round(X0 + EXIT0 - veh.B.x))} m`;
    const h = `<b>${o.from} → ${o.to}</b><br>${fmtT(R.t)} <small>(par ${fmtT(PAR)})</small> · <b>${kmh} km/u</b> · ${where}<div class="bar"><i style="width:${R.hp}%;background:${R.hp > 60 ? '#6ed36e' : R.hp > 30 ? '#ffd36b' : '#ff4a4a'}"></i></div><small>Oofmobiel ${Math.round(R.hp)}%${R.smart ? ` · boetes W ${R.smart}` : ''}${R.wrecked ? ` · ${R.wrecked} wrecked` : ''}</small><br><button>Omkeren (give up)</button>`;
    if (h !== hudKey) { hudEl.innerHTML = h; hudKey = h; }
  }
  const ev = (type, data) => { const o = R.opts; if (o && o.onEvent) try { o.onEvent(type, data); } catch (e) { console.error(e); } };
  const box2 = (s, x, z, hx, hz) => Object.assign(s, { minx: x - hx, maxx: x + hx, minz: z - hz, maxz: z + hz });

  // ---- the motorway: built once, signed and dressed per trip
  function buildStrip() {
    strip = new THREE.Group(); scene.add(strip);
    const K = deps.kit(), cx = X0 + LEN / 2, L = LEN + 120;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(L, SEDGE - NEDGE), deps.roadMat); { const uv = road.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) { uv.setX(i, uv.getX(i) * L / 200); uv.setY(i, uv.getY(i) * 2.2); } }
    road.rotation.x = -Math.PI / 2; road.position.set(cx, 0.02, (NEDGE + SEDGE) / 2); road.receiveShadow = true; strip.add(road);
    // the afrit and the car park: one slab of the same tarmac
    const slab = new THREE.Mesh(new THREE.PlaneGeometry(LEN - EXIT0 + 20, 26), deps.roadMat); slab.rotation.x = -Math.PI / 2; slab.position.set(X0 + (EXIT0 + LEN) / 2 + 10, 0.018, SEDGE + 13); slab.receiveShadow = true; strip.add(slab);
    for (const z of [Z0 - LW / 2, Z0 + LW / 2]) for (let x = X0 - 50; x < X0 + LEN + 50; x += 12) K.box(3, 0.01, 0.15, W_, x, 0.035, z); // lane lines: 3 m on, 9 m off
    K.box(L, 0.01, 0.2, W_, cx, 0.035, Z0 - LW * 1.5); K.box(EXIT0 + 60, 0.01, 0.2, W_, X0 + EXIT0 / 2 - 30, 0.035, Z0 + LW * 1.5); // edge lines (the right one opens at the afrit)
    for (let x = X0 + EXIT0; x < X0 + EXIT1; x += 4) K.box(2, 0.01, 0.35, W_, x, 0.035, Z0 + LW * 1.5); // blokmarkering along the uitvoegstrook
    K.box(LEN - EXIT1 + 60, 0.01, 0.2, W_, X0 + (EXIT1 + LEN) / 2 + 30, 0.035, Z0 + LW * 1.5);
    // the middenberm: a guard rail on posts, and the far carriageway behind it
    K.box(L, 0.32, 0.08, 0xb8bcc2, cx, 0.62, NEDGE + 0.3); for (let x = X0 - 50; x < X0 + LEN + 50; x += 4) K.box(0.1, 0.7, 0.1, 0x8a8e94, x, 0.35, NEDGE + 0.36);
    K.box(L, 0.02, 11, 0x4a4c52, cx, 0.01, NEDGE - 6.5);
    // hectometre posts and reflector posts on the right
    for (let x = X0; x < X0 + EXIT0; x += 100) { K.box(0.5, 0.7, 0.06, 0x2a7a3a, x, 0.75, SEDGE + 0.5); K.box(0.06, 0.6, 0.06, 0x8a8e94, x, 0.3, SEDGE + 0.5); }
    for (let x = X0 - 40; x < X0 + EXIT0; x += 25) { K.box(0.1, 0.9, 0.1, W_, x, 0.45, SEDGE + 0.25); K.box(0.11, 0.14, 0.11, 0xd8202a, x, 0.72, SEDGE + 0.25); }
    // the car park: bays and a kerb
    for (let i = -3; i <= 3; i++) K.box(0.12, 0.012, 5, W_, PARK.x + i * 4.5, 0.04, PARK.z + 4);
    K.box(40, 0.2, 0.3, 0xb8b2a6, PARK.x, 0.1, SEDGE + 26.2);
    const km = K.build(); if (km) strip.add(km);
    ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc83a, transparent: true, opacity: 0.85, fog: false })); ring.position.set(PARK.x, 0.06, PARK.z); strip.add(ring);
    flash = new THREE.Mesh(new THREE.PlaneGeometry(26, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false })); flash.position.set(X0 + 520, 0.08, Z0); strip.add(flash);
    // traffic, all going Eddy's way: trucks on the right, cars in the middle, the fast ones on the left
    for (let i = 0; i < 12; i++) {
      const truck = i < 3, lane = truck ? 1 : i < 8 ? (i % 2 ? 0 : 1) : -1; let g, half;
      if (truck) { g = new THREE.Group(); const kk = deps.kit(), col = [0x2a5a9a, 0xc8402a, 0xf2efe6][i]; kk.box(9.5, 2.9, 2.5, col, -1.2, 2.05, 0); kk.box(2.3, 2.5, 2.4, 0xe8e4dc, 5.1, 1.75, 0); kk.box(0.1, 1.0, 2.2, 0x22262c, 6.26, 2.2, 0); kk.box(11.5, 0.4, 2.3, 0x2a2c30, 0, 0.7, 0); for (const wx of [-4.6, -3.4, 2.2, 5.0]) kk.cyl(0.5, 0.5, 2.5, 0x1a1a1a, wx, 0.5, 0, 12, Math.PI / 2); const m = kk.build(); m.castShadow = true; g.add(m); half = 6.3; }
      else { g = deps.makeCar({}); half = g.userData.half; }
      strip.add(g); cars.push({ g, lane, truck, half, v: truck ? 21 + i : lane < 0 ? 31 + (i % 3) : lane === 0 ? 26 + (i % 3) : 23, vv: 0 });
    }
    // wegwerkzaamheden: a pijlwagen, a row of cones and a closed right lane (two of them)
    for (let i = 0; i < 2; i++) { const g = new THREE.Group(), kk = deps.kit(); kk.box(4.2, 1.6, 2.2, 0xf2a01a, 0, 1.1, 0); kk.box(0.2, 2.4, 2.4, 0x1a1a1a, -2.1, 2.5, 0); for (let a = 0; a < 5; a++) kk.box(0.22, 0.3, 0.3, 0xffe14a, -2.22, 2.0 + (a < 3 ? a * 0.45 : (4 - a) * 0.45 + 0.45), -0.6 + a * 0.3 - (a > 2 ? 0.6 : 0)); for (const wx of [-1.3, 1.3]) kk.cyl(0.4, 0.4, 2.3, 0x1a1a1a, wx, 0.4, 0, 10, Math.PI / 2);
      for (let c = 0; c < 14; c++) { const x = -34 + c * 2.4, z = c < 6 ? (LW * 0.5) - c * (LW / 6) + 0.2 : -LW / 2 + 0.25; kk.cyl(0.05, 0.22, 0.6, 0xff6a1a, x, 0.3, z, 8); kk.cyl(0.12, 0.16, 0.12, W_, x, 0.38, z, 8); }
      kk.box(5, 0.5, 2.0, 0x8a6a4a, 12, 0.25, 0); kk.box(2.6, 1.3, 1.6, 0xf2c31a, 20, 0.8, 0.1); kk.box(0.3, 1.6, 0.3, 0xf2c31a, 21.3, 1.9, 0.1); // a heap of sand and a little digger
      const m = kk.build(); m.castShadow = true; g.add(m); strip.add(g); works.push({ g, sol: deps.solid(0, 0, 0, 0), sol2: deps.solid(0, 0, 0, 0) }); }
    for (let i = 0; i < 2; i++) { const g = deps.makeCar({ paint: 0xff7a1a, lampas: true, model: 0 }); strip.add(g); gang.push({ g, on: false, dead: false, v: 0, cool: 0 }); }
    // what the van can't drive through: the guard rail, the grass beyond the vluchtstrook (up to the afrit), the back of the car park, both ends
    for (const s of [deps.solid(X0 - 60, X0 + LEN + 60, NEDGE - 1, NEDGE + 0.2), deps.solid(X0 - 60, X0 + EXIT0, SEDGE, SEDGE + 30), deps.solid(X0 + EXIT0, X0 + LEN + 60, SEDGE + 26, SEDGE + 27),
      deps.solid(X0 - 8, X0 - 7, NEDGE, SEDGE), deps.solid(X0 + LEN + 20, X0 + LEN + 21, SEDGE, SEDGE + 27)]) sols.push(s);
    strip.visible = false; solidsOff(true);
  }
  function solidsOff(off) { for (const s of sols) s.off = off; for (const w of works) { w.sol.off = off; w.sol2.off = off; } }
  // a blue ANWB sign: lines of [text, size, colour]
  function sign(lines, w, h, x, y, z, ry = -Math.PI / 2) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), deps.lam({ map: deps.signTex(lines.map(([t, size, color]) => ({ t, size, color: color || '#ffffff' })), '#14499a', '#ffffff', 512, Math.round(512 * h / w)), emissive: 0x0a2040 })); m.position.set(x, y, z); m.rotation.y = ry; scenery.add(m); return m; }
  function gantry(K, x, lines) { K.box(0.5, 7, 0.5, 0x8a8e94, x, 3.5, NEDGE - 0.4); K.box(0.5, 7, 0.5, 0x8a8e94, x, 3.5, SEDGE + 0.6); K.box(0.4, 0.5, SEDGE - NEDGE + 1.6, 0x8a8e94, x, 6.9, (NEDGE + SEDGE) / 2); K.box(0.3, 0.3, SEDGE - NEDGE + 1.6, 0x8a8e94, x, 5.6, (NEDGE + SEDGE) / 2);
    lines.forEach((ln, i) => sign(ln, 5.6, 2.2, x - 0.3, 6.2, Z0 - LW + i * LW * 1.75)); }
  function dress(key) {
    if (scenery) { strip.remove(scenery); scenery.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map) o.material.map.dispose(); }); }
    scenery = new THREE.Group(); strip.add(scenery);
    const T = R.route, o = R.opts, K = deps.kit(), to = String(o.to); let s = 11 + key.length * 17; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(LEN + 300, 220), deps.lam({ color: T.ground })); gr.rotation.x = -Math.PI / 2; gr.position.set(X0 + LEN / 2, 0, Z0); gr.receiveShadow = true; scenery.add(gr);
    // the signs: the ring, the knooppunt, the afrit
    gantry(K, X0 + 70, [[['A10', 44, '#ff5a6a'], ['Ring Kaasland', 34]], [[T.a, 44, '#ff5a6a'], [T.via, 34], [to, 30, '#ffe14a']]]);
    gantry(K, X0 + LEN * 0.4, [[[T.other[0], 44, '#ff5a6a'], [T.other[1], 34], ['↖', 40]], [[T.a, 44, '#ff5a6a'], [`${T.via} · ${to}`, 30], ['↑', 40]]]);
    gantry(K, X0 + EXIT0 - 150, [[[T.a, 44, '#ff5a6a'], [T.via, 34], ['↑', 40]], [[`afrit ${T.afrit}`, 30, '#ffe14a'], [to, 38], ['600 m ↗', 34]]]);
    sign([[`${T.afrit}`, 30, '#ffe14a'], [to, 40], ['↗', 44]], 4.6, 2.6, X0 + EXIT0 + 6, 3.2, SEDGE + 1.6); for (const dz of [0.6, 2.6]) K.box(0.16, 2.2, 0.16, 0x8a8e94, X0 + EXIT0 + 6.1, 1.1, SEDGE + dz);
    sign([['UIT', 60]], 1.6, 1.0, X0 + EXIT1 + 2, 1.5, Z0 + LW * 1.5 + 1.2); K.box(0.12, 1.2, 0.12, 0x8a8e94, X0 + EXIT1 + 2.1, 0.6, Z0 + LW * 1.5 + 1.2);
    sign([['P', 70], [o.airport ? 'Kiss & Ride' : to, 30]], 3, 2.2, PARK.x - 22, 2.6, SEDGE + 25.5, Math.PI); K.box(0.14, 1.6, 0.14, 0x8a8e94, PARK.x - 22, 0.8, SEDGE + 25.6);
    // the flitspaal
    K.box(0.3, 3.2, 0.3, 0x5a5e62, X0 + 520, 1.6, SEDGE + 0.9); K.box(0.5, 0.7, 0.5, 0x3a3c40, X0 + 520, 3.3, SEDGE + 0.9); K.box(0.52, 0.3, 0.3, 0xf2c31a, X0 + 520, 3.3, SEDGE + 0.6);
    // the land beside the road
    for (let x = X0 - 30; x < X0 + LEN + 40; ) {
      const w = 8 + rnd() * 10, cx = x + w / 2, far = cx > X0 + EXIT0 - 10, zz = far ? SEDGE + 34 + rnd() * 8 : SEDGE + 7 + rnd() * 10;
      if (T.props === 'brick') { const h = 7 + rnd() * 7, c = [0x8a4a3a, 0x9a5a44, 0x6a3a30, 0xb08a6a][Math.floor(rnd() * 4)]; K.box(w - 0.6, h, 9, c, cx, h / 2, zz + 4.5); for (let wx = cx - w / 2 + 1.2; wx < cx + w / 2 - 0.8; wx += 1.8) for (let wy = 2.2; wy < h - 1; wy += 2.4) K.box(0.9, 1.2, 0.1, 0xf2e6c0, wx, wy, zz - 0.03); K.box(w - 0.3, 0.5, 9.4, 0x3a2a24, cx, h + 0.25, zz + 4.5); }
      else if (T.props === 'hip') { const h = 3 + rnd() * 4, c = [0xff8fb8, 0x5ac8c0, 0xf2c14e, 0x9ad06a, 0xff7a3a][Math.floor(rnd() * 5)]; K.box(w - 2, h, 6, c, cx, h / 2, zz + 3); K.box(w - 1.6, 0.2, 6.6, W_, cx, h + 0.1, zz + 3); K.cyl(0.14, 0.18, 2.6, 0x5e4636, cx + w / 2, 1.3, zz - 2, 8); K.cyl(1.5, 1.1, 2.0, 0x4f8a3c, cx + w / 2, 3.4, zz - 2, 8); }
      else if (T.props === 'docks') { const n = 1 + Math.floor(rnd() * 3); for (let k = 0; k < n; k++) K.box(w - 1, 2.6, 2.6, [0xc8402a, 0x2a5a9a, 0xe8a020, 0x3a7a4a, 0x8a8a8a][Math.floor(rnd() * 5)], cx, 1.3 + k * 2.65, zz + 2); if (rnd() < 0.22) { K.box(0.7, 22, 0.7, 0xf2c31a, cx, 11, zz + 9); K.box(0.7, 0.7, 18, 0xf2c31a, cx, 21.5, zz + 2); } }
      else if (T.props === 'sand') { K.geo(new THREE.SphereGeometry(1, 10, 6), 0xe0c088, cx, -0.8, zz + 5, 0, rnd() * 3, 0, w * 0.8, 2.5 + rnd() * 3, 7); if (rnd() < 0.45) { K.cyl(0.16, 0.22, 5, 0x8a6a3a, cx, 2.5, zz, 8); for (let a = 0; a < 6; a++) K.box(2.4, 0.06, 0.55, 0x3a8a3a, cx + Math.cos(a) * 1.1, 5, zz + Math.sin(a) * 1.1, a, 0, 0.35); } else if (rnd() < 0.3) K.geo(new THREE.SphereGeometry(1, 8, 5), 0x7a9a4a, cx, 0.2, zz - 2, 0, 0, 0, 1.4, 0.7, 1.2); } // dunes, palms, helmgras
      else { // the polder round Schiptagat: a ditch, cows, the odd windmill
        K.box(w, 0.02, 1.2, 0x3a6a7a, cx, 0.015, zz + 3); if (rnd() < 0.3) { K.box(1.6, 1.0, 0.7, W_, cx, 0.9, zz - 1); K.box(0.5, 0.5, 0.5, 0x1a1a1a, cx + 0.9, 1.3, zz - 1); for (const lx of [-0.5, 0.5]) K.box(0.14, 0.5, 0.14, W_, cx + lx, 0.25, zz - 1); }
        if (rnd() < 0.12) { K.cyl(1.2, 2.0, 7, 0x6a4a3a, cx, 3.5, zz + 12, 8); K.cyl(0.2, 1.4, 1.6, 0x3a2a24, cx, 7.8, zz + 12, 8); for (let a = 0; a < 4; a++) K.box(0.5, 6.5, 0.08, W_, cx - 1.3, 7 + Math.sin(a * Math.PI / 2) * 3.2, zz + 12 + Math.cos(a * Math.PI / 2) * 3.2, 0, a * Math.PI / 2, 0); }
      }
      x += w;
    }
    if (T.props === 'air') { const ax = X0 + EXIT0 + 60, az = SEDGE + 46; // Schiptagat: the terminal, the tower, two planes and the runway lights
      K.box(70, 7, 14, 0xdfe6ee, ax, 3.5, az); K.box(70, 0.6, 15, 0x2a6ad8, ax, 7.3, az); for (let wx = ax - 32; wx < ax + 33; wx += 4) K.box(2.6, 3.4, 0.1, 0x7ab8e8, wx, 3.2, az - 7.03);
      K.cyl(1.6, 2.0, 22, 0xcfd6de, ax + 46, 11, az + 4, 10); K.cyl(3.4, 2.6, 3, 0x2a3a4a, ax + 46, 23.5, az + 4, 10);
      for (const [px, pz, ry] of [[ax - 20, az + 26, 0.3], [ax + 22, az + 30, -0.4]]) { K.box(22, 2.6, 2.6, 0xf6f6f2, px, 3.2, pz, ry); K.box(4, 0.3, 24, 0xf6f6f2, px, 3, pz, ry); K.box(2.6, 4.4, 0.4, 0xe87a1a, px - 9.6 * Math.cos(ry), 6, pz + 9.6 * Math.sin(ry), ry); K.box(0.4, 0.3, 7, 0xf6f6f2, px - 9.4 * Math.cos(ry), 4.4, pz + 9.4 * Math.sin(ry), ry); }
      for (let i = 0; i < 16; i++) K.box(0.4, 0.3, 0.4, i % 2 ? 0x2a6aff : 0xffe14a, ax - 60 + i * 9, 0.2, az + 46);
      sign([['SCHIPTAGAT', 60], ['Vertrek · Departures', 26]], 16, 3, ax, 9.4, az - 7.1, Math.PI); }
    // sound barriers behind the far carriageway, and lamp masts in the middenberm
    for (let x = X0 - 40, i = 0; x < X0 + LEN + 40; x += 8, i++) K.box(7.8, 3.6, 0.3, i % 2 ? 0x5a8a6a : 0x4a7a5a, x + 4, 1.8, NEDGE - 13);
    for (let x = X0 + 20; x < X0 + LEN; x += 45) { K.cyl(0.1, 0.16, 11, 0x8a8e94, x, 5.5, NEDGE - 0.4, 8); K.box(0.3, 0.12, 3.4, 0x8a8e94, x, 10.9, NEDGE + 1.2); K.box(0.4, 0.1, 0.7, 0xfff4d0, x, 10.82, NEDGE + 2.7); }
    const m = K.build(); if (m) { m.castShadow = true; m.receiveShadow = true; scenery.add(m); }
  }
  function layout() { // a different motorway every trip: where the works are and how the traffic is spread
    const o = R.opts; let s = ((state.raids | 0) * 7 + (deps.day ? deps.day() : 1) * 13 + String(o.to).length) % 2147483647 || 3; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    works.forEach((w, i) => { const x = X0 + 230 + i * 300 + rnd() * 60, z = Z0 + LW; w.g.position.set(x, 0, z); box2(w.sol, x + 9, z, 13.5, 1.5); box2(w.sol2, x - 2.1, z, 2.3, 1.2); w.sol.off = w.sol2.off = false; });
    cars.forEach((c) => { c.g.position.set(X0 + 60 + rnd() * (LEN - 200), 0, Z0 + c.lane * LW); c.g.rotation.y = 0; c.wreck = false; c.vv = c.v; });
    gang.forEach((g) => { g.on = false; g.dead = false; g.g.visible = false; if (g.g.userData.paint) g.g.userData.paint.color.setHex(0xff7a1a); });
    R.flashed = false; flash.material.opacity = 0;
  }

  // ---- start
  function start(o) {
    if (R.active || (deps.blockedStart && deps.blockedStart())) return false;
    if (!strip) buildStrip();
    if (!van) { van = deps.makeVan(); van.visible = false; scene.add(van); veh = deps.fiets.adopt(van, { kind: 'car', name: 'Oofmobiel', own: true, quiet: true, half: 2.5, width: 2.0, locked: () => R.active && !R.over, k: { vmax: 19, acc: 7, brake: 16, rev: -5, turn: 1.5, grip: 4.5, r: 1.0, nose: 1.9 } }); }
    R.opts = o; R.route = o.airport ? ROUTES.air : ROUTES[o.theme] || ROUTES.lampas;
    Object.assign(R, { active: true, phase: 'street', t: 0, hp: 100, bumped: 0, wrecked: 0, smart: 0, ambush: 0, over: false });
    vBase = Math.max(15, ((o.van && o.van.maxV) || 26) * 0.72); Object.assign(veh.k, { vmax: vBase, acc: 7, turn: 1.5, grip: 4.5 }); veh.gripMul = Math.max(0.35, o.grip || 1);
    johanCue = o.johan || null;
    fadeTo(() => {
      deps.oof.visible = false; deps.oofSolid.off = true; van.visible = true;
      van.position.copy(deps.oof.position); van.rotation.copy(deps.oof.rotation);
      deps.fiets.mount(veh); document.body.classList.add('ritting'); hudEl.style.display = 'block'; crashT = 0;
      { const hint = document.querySelector('#fts .hint'); if (hint) hint.innerHTML = '<b>W</b> gas · <b>S</b> remmen / achteruit · <b>A</b><b>D</b> sturen · <b>H</b> claxon'; }
      const B = deps.buurt(); if (B) B.setPoint(deps.exit.x, deps.exit.z, 'oprit A10');
      deps.toast(`${o.from} → ${o.to}`, `Pull out and drive <b>east</b> down the street to the oprit of the <b>A10</b>, ${R.route.a === 'A10' ? '' : `then the <b>${R.route.a}</b>, `}afrit ${R.route.afrit}.${o.mission ? ' ' + o.mission : ''}`, 4.8);
      deps.snapCam(); ev('start', { to: o.to });
    });
    return true;
  }
  function toRing() {
    R.phase = 'fade';
    fadeTo(() => {
      const o = R.opts; dress(o.airport ? 'air' : o.theme || 'lampas'); layout(); strip.visible = true; solidsOff(false);
      Object.assign(veh.k, { vmax: vBase * 1.6, acc: 9, turn: 0.95, grip: 9 }); // the motorway: top gear, and steering that changes lanes instead of spinning the van
      veh.B.x = X0 + 4; veh.B.z = Z0 + LW; veh.B.h = Math.PI / 2; veh.B.v = 18; van.position.set(veh.B.x, 0, veh.B.z);
      deps.setBounds({ x0: X0 - 6, x1: X0 + LEN + 19, z0: NEDGE + 1.0, z1: SEDGE + 25.5 });
      const B = deps.buurt(); if (B) B.setPoint(PARK.x, PARK.z, o.to);
      R.phase = 'ring'; deps.snapCam();
      deps.toast(R.route.a === 'A10' ? 'A10 RING' : `A10 → ${R.route.a}`, `${o.to}: afrit ${R.route.afrit}, on the right at the end. Trucks keep right, the works close a lane, and there is a flitspaal at 120.`, 4);
    });
  }
  function damage(n) { if (R.over) return; n *= (R.opts.van && R.opts.van.dmg) || 1; R.hp = Math.max(0, R.hp - n); if (R.hp <= 0) finish(false, 'OOFMOBIEL KAPOT', 'The van gave up. Freddy Sr. would have had words.'); }
  function crash(speed) { if (!R.active || R.over || R.t - crashT < 0.7) return; crashT = R.t; if (speed > 9) ev('crash'); damage(Math.max(0, speed - 5) * (R.phase === 'ring' ? 0.9 : 1.3)); } // a scrape costs little, a wall at speed a lot
  function giveUp() { if (!R.active || R.over) return; deps.choice('Eddy Jr.', 'Turn the Oofmobiel round and go home? The trip is lost.', ['Omkeren', 'Keep driving'], (i) => { if (i === 0) finish(false, 'OMGEKEERD', 'Back to the warehouse.'); }); }
  function finish(arrived, title, sub) {
    if (R.over) return; R.over = true;
    const o = R.opts, pay = !arrived ? 0 : o.noPay ? -R.smart : Math.max(0, BASE_PAY + R.wrecked * BOUNTY + Math.max(0, Math.round((PAR - R.t) * 3)) - R.smart);
    if (arrived) { ev('arrive', { t: R.t, par: PAR, bumped: R.bumped, dents: Math.round(100 - R.hp) }); deps.beep(523, 0.15, 'triangle', 0.06); setTimeout(() => deps.beep(784, 0.3, 'triangle', 0.06), 160); }
    else { ev('fail', { title }); deps.beep(160, 0.3, 'sawtooth', 0.06); }
    deps.toast(arrived ? 'AANGEKOMEN!' : title, arrived ? `${o.to} in ${fmtT(R.t)} (par ${fmtT(PAR)}). ${o.noPay ? (o.arrived || '') : `Fee W ${BASE_PAY}${R.wrecked ? ` · ${R.wrecked} wrecked +W ${R.wrecked * BOUNTY}` : ''}${R.smart ? ` · boetes −W ${R.smart}` : ''} · total W ${pay}.`}` : sub, 4.5);
    const res = { arrived, pay, time: R.t, wrecked: R.wrecked, bumped: R.bumped };
    setTimeout(() => fadeTo(() => { stop(); if (o.onDone) o.onDone(res); }), arrived ? 900 : 1400);
  }
  function stop() { // everything back where it was: the van on its parking, Eddy next to it
    if (!R.active) return;
    R.active = false; R.phase = null; hudEl.style.display = 'none'; document.body.classList.remove('ritting');
    if (deps.fiets.current === veh) { veh.locked = () => false; deps.fiets.dismount(); veh.locked = () => R.active && !R.over; }
    van.visible = false;
    if (strip) { strip.visible = false; solidsOff(true); }
    deps.setBounds(null); const B = deps.buurt(); if (B) B.clearRoute();
    deps.oof.visible = true; deps.oofSolid.off = false;
    player.visible = true; player.position.set(deps.oof.position.x + 1.9, 0, deps.oof.position.z + 2.2); player.rotation.set(0, 0, 0); deps.snapCam();
  }

  // ---- per frame
  const hitBox = (ax, az, ahx, ahz, bx, bz, bhx, bhz) => Math.abs(ax - bx) < ahx + bhx && Math.abs(az - bz) < ahz + bhz;
  function update(dt) {
    if (!R.active || R.over || R.phase === 'fade' || !veh || deps.fiets.current !== veh) return;
    R.t += dt; const B = veh.B, sp = Math.abs(B.v);
    if (R.phase === 'street') {
      if (B.x >= deps.exit.x - 3 && Math.abs(B.z - deps.RC) < 6) toRing();
      else if (johanCue && R.t > 6 && B.x > 30 && sp < 1.2 && !state.inDialogue) { const c = johanCue; johanCue = null; if (c.onMeet) c.onMeet(() => {}); } // Johan pulls up when Eddy stops
      hud(); return;
    }
    // traffic: everybody keeps their lane and their speed, brakes for what is in front, and stays within sight of the van
    for (const c of cars) {
      const p = c.g.position; if (c.wreck) { if (p.x < B.x - 140) { c.wreck = false; p.x = B.x + 230; } continue; }
      let want = c.v;
      for (const q of cars) if (q !== c && Math.abs(q.g.position.z - p.z) < 1.5 && q.g.position.x > p.x && q.g.position.x - p.x < c.half + q.half + 12) want = Math.min(want, (q.wreck ? 0 : q.vv) - 1);
      if (c.lane === 1) { let tz = Z0 + LW; for (const w of works) { const d = w.g.position.x - p.x; if (d > -26 && d < 84) tz = Z0; } p.z += (tz - p.z) * Math.min(1, dt * 1.5); } // round the works and back
      if (Math.abs(B.z - p.z) < 1.6 && B.x > p.x && B.x - p.x < c.half + 2.6 + 10) want = Math.min(want, B.v - 1); // and for Eddy
      c.vv += Math.max(-14 * dt, Math.min(4 * dt, Math.max(0, want) - c.vv)); p.x += c.vv * dt;
      if (p.x < B.x - 150) { p.x = B.x + 210 + Math.random() * 60; p.z = Z0 + c.lane * LW; } else if (p.x > B.x + 290) { p.x = B.x - 120 - Math.random() * 20; p.z = Z0 + c.lane * LW; }
      if (hitBox(p.x, p.z, c.half, 1.0, B.x, B.z, 2.3, 1.0)) { // a touch: what counts is the difference in speed
        const rel = Math.abs(B.v - c.vv), behind = B.x < p.x;
        if (rel > 2 && R.t - crashT > 0.6) { crashT = R.t; if (rel > 8) ev('crash'); damage((rel - 2) * 1.6); deps.beep(70, 0.14, 'sawtooth', 0.06); }
        if (Math.abs(B.z - p.z) > 1.2) B.z += Math.sign(B.z - p.z) * 6 * dt; else if (behind) { B.v = Math.min(B.v, c.vv - 1.5); B.x = Math.min(B.x, p.x - c.half - 2.35); } else { c.vv = Math.min(c.vv, B.v - 1.5); p.x = Math.min(p.x, B.x - c.half - 2.35); }
      }
    }
    // the flitspaal
    if (!R.flashed && B.x > X0 + 520 && B.x < X0 + 545) { R.flashed = true; if (sp > FLITS) { R.smart += FINE; R.bumped++; flash.material.opacity = 0.9; deps.toast('FLITS!', `${Math.round(sp * 3.6)} km/u where 120 is allowed. −W ${FINE}, and a photo of you looking guilty.`, 2.6); deps.beep(1400, 0.05, 'square', 0.05); } }
    if (flash.material.opacity > 0) flash.material.opacity = Math.max(0, flash.material.opacity - dt * 4);
    // the gang: past half-way two of their cars come up from behind and ram
    const o = R.opts;
    if (!R.ambush && B.x > X0 + LEN * 0.42) {
      if (o.noPay || o.airport || (o.van && o.van.tint)) R.ambush = 2; // nobody is after a man fetching his father, and tinted windows hide the rest
      else { R.ambush = 1; ev('ambush'); gang.forEach((g, i) => { g.on = true; g.dead = false; g.v = sp + 3; g.cool = 0; g.g.visible = true; g.g.position.set(B.x - 40 - i * 14, 0, Z0 + (i ? -LW : LW)); g.g.rotation.y = 0; });
        deps.toast('HINDERLAAG!', `The ${R.route.gang || 'Lampas'} are on your bumper. Lead them into the roadworks or the back of a truck.`, 3.4); deps.beep(880, 0.1, 'square', 0.05); }
    }
    for (const g of gang) {
      if (!g.on || g.dead) continue; const p = g.g.position;
      if (g.cool > 0) { g.cool -= dt; g.v += (Math.max(6, sp - 5) - g.v) * Math.min(1, dt * 2); } else g.v += (Math.min(veh.k.vmax + 3, sp + 7) - g.v) * Math.min(1, dt * 1.5);
      p.x += g.v * dt; p.z += (B.z - p.z) * Math.min(1, dt * 0.9);
      const hitWork = works.some((w) => hitBox(p.x, p.z, 2.1, 0.9, w.g.position.x + 9, w.g.position.z, 13.5, 1.4) || hitBox(p.x, p.z, 2.1, 0.9, w.g.position.x - 2.1, w.g.position.z, 2.3, 1.2)), hitCar = cars.find((c) => !c.wreck && hitBox(p.x, p.z, 2.1, 0.9, c.g.position.x, c.g.position.z, c.half, 1.0) && g.v - c.vv > 4);
      if (hitWork || hitCar) { g.dead = true; if (g.g.userData.paint) g.g.userData.paint.color.setHex(0x3a2a20); R.wrecked++; ev('wreck'); deps.toast('WRAK!', `One of theirs is done. +W ${BOUNTY}.`, 1.8); deps.beep(90, 0.3, 'sawtooth', 0.07); continue; }
      if (hitBox(p.x, p.z, 2.1, 0.9, B.x, B.z, 2.3, 1.0)) { damage(8); ev('crash'); B.v = Math.min(veh.k.vmax, B.v + 2.5); g.cool = 2.4; p.x -= 5; deps.beep(70, 0.16, 'sawtooth', 0.06); }
      if (p.x < B.x - 90) p.x = B.x - 50;
    }
    // the afrit: slow down for the car park, or miss it and come back
    if (B.z > SEDGE + 1 && veh.k.vmax > vBase) Object.assign(veh.k, { vmax: vBase, turn: 1.5, grip: 4.5 });
    if (B.x > X0 + LEN + 12 && B.z < SEDGE) { R.t += 25; B.x = X0 + EXIT0 - 260; B.z = Z0 + LW; B.v = 20; deps.toast('AFRIT GEMIST', `That was afrit ${R.route.afrit}. The next one and back: 25 seconds gone.`, 3); deps.snapCam(); }
    ring.material.opacity = 0.6 + Math.sin(R.t * 5) * 0.25;
    if (Math.hypot(B.x - PARK.x, B.z - PARK.z) < 3.6 && sp < 2.8) { finish(true); return; }
    hud();
  }
  return { start, stop, update, crash, giveUp, get active() { return R.active; }, get phase() { return R.phase; }, get run() { return R; }, vehicle: () => veh, X0, Z0, LEN, PAR, PARK, ROUTES };
}
