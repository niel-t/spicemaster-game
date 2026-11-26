// De rit (2026-11-26, free roaming step 2): every drive in the Oofmobiel is now driven in 3D, in the same world and
// with the same pedals as the borrowed cars (js/bikes.js). It replaces the top-down drive (the old js/drive.js).
//   1. De straat: Eddy pulls out of his parking at the warehouse and drives the home street east, through Kroketkade,
//      to the ring road (the yellow light and the arrow on the screen edge point the way).
//   2. De ring: a 520 m road to the district he is going to, dressed for it (Oud-Vettenburg brick, Hipsterheuvel,
//      the docks, De Zandwijk's dunes, Schiptagat airport): oncoming traffic, skips and delivery vans parked in his
//      lane, slow traffic to overtake, zebras with people on them (smartengeld), and past half-way a rival gang's
//      cars that try to ram him: lead them into a skip or the oncoming traffic and they wreck (a bounty).
//   3. Park in the yellow ring at the end: the raid, the delivery or the pick-up starts.
// The same contract as the old drive, so every caller kept working: start({ van, from, to, theme, mission, noPay,
// airport, arrived, doneLabel, johan, grip, onEvent, onDone }) and onDone({ arrived, pay, time, wrecked, bumped }).
// Events for the passenger (js/freddy.js) and the wear (js/garage.js): start, ped, crash, wreck, ambush, arrive, fail.
const PAR = 85, SMART = 15, BOUNTY = 50, BASE_PAY = 250;
const X0 = 1000, Z0 = 600, LEN = 520, LANE = 1.65, HALF = 8.5; // the ring road: from X0 east, its centre line at Z0
const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
const THEMES = {
  lampas: { ground: 0x8a8478, name: 'Lampas', props: 'brick' }, nosh: { ground: 0x7a9a5a, name: 'Noshgey Kariot', props: 'hip' },
  docks: { ground: 0x6a6e72, name: 'Abdavissies', props: 'docks' }, sand: { ground: 0xd8b878, name: 'Paravim', props: 'sand' }, air: { ground: 0x7a9a5a, name: '', props: 'air' },
};

// deps: THREE, scene, player, state, kit(), lam, signTex, makeCar(opts), makeVan(), passerBy(seed), animate(p, v, dt), fiets, oof, oofSolid,
//       solid(), setBounds(b), snapCam(), buurt(), toast, beep, choice, RC, exit: { x, z }, roadMat, isPaused(), blockedStart()
export function createRit(deps) {
  const { THREE, scene, player, state } = deps;
  const R = { active: false, phase: null, opts: null, t: 0, hp: 100, bumped: 0, wrecked: 0, smart: 0, ambush: 0, over: false };
  let van = null, veh = null, strip = null, scenery = null, ring = null;
  const cars = [], skips = [], peds = [], gang = [], sols = []; let johanCar = null, johanCue = null;
  // ---- the fade and the trip card
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40'; document.body.appendChild(fade);
  const fadeTo = (fn) => { fade.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { fade.style.opacity = '0'; }, 80); } }, 380); };
  const css = document.createElement('style');
  css.textContent = `#rit{position:fixed;left:16px;top:44px;z-index:9;display:none;min-width:230px;padding:8px 12px 9px;border-radius:12px;color:#fff;font:600 13px/1.35 Rubik,"Segoe UI",Arial,sans-serif;text-shadow:0 1px 2px #000;background:rgba(30,18,10,.72);border:1px solid rgba(255,226,170,.5)}
html.aero #rit{background:linear-gradient(180deg,rgba(120,80,48,.62),rgba(70,42,22,.66) 48%,rgba(42,25,13,.74) 52%,rgba(54,33,18,.7));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#rit b{color:#ffd36b}#rit .bar{height:9px;margin:5px 0 3px;border-radius:6px;background:rgba(0,0,0,.45);overflow:hidden;border:1px solid rgba(255,240,210,.5)}#rit .bar i{display:block;height:100%;background:#6ed36e;transition:width .2s}
#rit small{font-weight:400;color:#f3e6c8}#rit button{margin-top:5px;pointer-events:auto;font:600 11px Rubik,Arial;color:#fff;background:rgba(0,0,0,.35);border:1px solid rgba(255,226,170,.5);border-radius:8px;padding:2px 8px;cursor:pointer}
body.ritting #objective,body.ritting #area,body.ritting #ftsOff,body.ritting #fts .spd,body.ritting #kit,body.ritting #weapon,body.ritting #income{display:none!important}
@media (max-width:820px),(max-height:500px){#rit{left:8px;top:8px;min-width:0;font-size:11.5px;padding:6px 9px}}`;
  document.head.appendChild(css);
  const hudEl = document.createElement('div'); hudEl.id = 'rit'; document.body.appendChild(hudEl);
  hudEl.addEventListener('click', (e) => { if (e.target.closest('button')) { e.stopPropagation(); giveUp(); } });
  let hudKey = '';
  function hud() {
    const o = R.opts, goal = R.phase === 'street' ? `to the ring ${Math.max(0, Math.round(deps.exit.x - veh.B.x))} m` : `${o.to} ${Math.max(0, Math.round(X0 + LEN - 22 - veh.B.x))} m`;
    const h = `<b>${o.from} → ${o.to}</b><br>${fmtT(R.t)} <small>(par ${fmtT(PAR)})</small> · <b>${Math.round(Math.abs(veh.B.v) * 3.6)} km/u</b> · ${goal}<div class="bar"><i style="width:${R.hp}%;background:${R.hp > 60 ? '#6ed36e' : R.hp > 30 ? '#ffd36b' : '#ff4a4a'}"></i></div><small>Oofmobiel ${Math.round(R.hp)}%${R.smart ? ` · smartengeld W ${R.smart}` : ''}${R.wrecked ? ` · ${R.wrecked} wrecked` : ''}</small><br><button>Omkeren (give up)</button>`;
    if (h !== hudKey) { hudEl.innerHTML = h; hudKey = h; }
  }
  const ev = (type, data) => { const o = R.opts; if (o && o.onEvent) try { o.onEvent(type, data); } catch (e) { console.error(e); } };

  // ---- the ring road: built once, dressed per trip
  function buildStrip() {
    strip = new THREE.Group(); scene.add(strip);
    const road = new THREE.Mesh(new THREE.PlaneGeometry(LEN + 60, LANE * 4), deps.roadMat); { const uv = road.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (LEN + 60) / 200); }
    road.rotation.x = -Math.PI / 2; road.position.set(X0 + LEN / 2, 0.02, Z0); road.receiveShadow = true; strip.add(road);
    const K = deps.kit(), W = 0xf4f2ec;
    for (let x = X0 - 20; x < X0 + LEN + 20; x += 6) K.box(2.6, 0.01, 0.14, W, x, 0.035, Z0);
    for (const z of [Z0 - LANE * 2, Z0 + LANE * 2]) K.box(LEN + 60, 0.01, 0.12, W, X0 + LEN / 2, 0.035, z);
    for (const zx of [X0 + 150, X0 + 365]) for (let i = 0; i < 7; i++) K.box(3.0, 0.012, 0.5, W, zx, 0.036, Z0 - LANE * 2 + 0.5 + i * 0.95); // zebras
    { const px = X0 + LEN - 22; K.box(26, 0.012, 13, 0x4a4c52, px, 0.03, Z0 + LANE * 2 + 6.5); for (let i = -2; i <= 2; i++) K.box(0.12, 0.014, 5, W, px + i * 5, 0.04, Z0 + LANE * 2 + 9.5); } // the car park at the end
    const km = K.build(); if (km) strip.add(km);
    ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc83a, transparent: true, opacity: 0.85, fog: false })); ring.position.set(X0 + LEN - 22, 0.06, Z0 + LANE * 2 + 5.5); strip.add(ring);
    // traffic: oncoming cars in the far lane, two slow ones in Eddy's lane
    for (let i = 0; i < 8; i++) { const on = i < 6, g = deps.makeCar({}); strip.add(g); cars.push({ g, on, v: on ? 9 + (i % 3) * 1.5 : 5 + i % 2, sol: deps.solid(0, 0, 0, 0), half: g.userData.half }); }
    // skips and double-parked vans in Eddy's lane
    for (let i = 0; i < 5; i++) { const g = new THREE.Group(), kk = deps.kit(); if (i % 2) { kk.box(3.6, 1.2, 1.7, 0xd8a020, 0, 0.75, 0); kk.box(3.9, 0.12, 1.9, 0xb8861a, 0, 1.36, 0); kk.box(3.2, 0.5, 1.5, 0x6a5a4a, 0, 1.5, 0); } else { kk.box(4.4, 1.9, 1.9, 0xf2efe6, 0, 1.15, 0); kk.box(1.2, 1.3, 1.85, 0xd8d4cc, 2.4, 0.85, 0); kk.box(4.3, 0.5, 1.92, 0xc8402a, 0, 0.6, 0); for (const wx of [-1.5, 1.6]) kk.cyl(0.36, 0.36, 2.0, 0x1a1a1a, wx, 0.36, 0, 12, Math.PI / 2); }
      const m = kk.build(); m.castShadow = true; g.add(m); strip.add(g); skips.push({ g, sol: deps.solid(0, 0, 0, 0) }); }
    for (let i = 0; i < 6; i++) { const p = deps.passerBy(40 + i * 7); strip.add(p); peds.push({ p, zx: i < 3 ? X0 + 150 : X0 + 365, dir: i % 2 ? 1 : -1, v: 1.1 + (i % 3) * 0.25, down: 0 }); }
    for (let i = 0; i < 2; i++) { const g = deps.makeCar({ paint: 0xff7a1a, lampas: true, model: 0 }); strip.add(g); gang.push({ g, on: false, dead: false, v: 0, cool: 0 }); }
    for (const s of [deps.solid(X0 - 30, X0 + LEN + 30, Z0 - HALF - 1, Z0 - HALF), deps.solid(X0 - 30, X0 + LEN + 30, Z0 + HALF + 13, Z0 + HALF + 14), deps.solid(X0 - 6, X0 - 5, Z0 - HALF, Z0 + HALF + 13), deps.solid(X0 + LEN + 5, X0 + LEN + 6, Z0 - HALF, Z0 + HALF + 13), deps.solid(X0 - 30, X0 + LEN - 37, Z0 + HALF - 0.2, Z0 + HALF + 13)]) sols.push(s); // the last one: the building line on the south side, up to the car park
    strip.visible = false; solidsOff(true);
  }
  function solidsOff(off) { for (const s of sols) s.off = off; for (const c of cars) c.sol.off = off; for (const s of skips) s.sol.off = off; }
  const box2 = (s, x, z, hx, hz) => Object.assign(s, { minx: x - hx, maxx: x + hx, minz: z - hz, maxz: z + hz });
  function dress(theme) {
    if (scenery) { strip.remove(scenery); scenery.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
    scenery = new THREE.Group(); strip.add(scenery);
    const T = THEMES[theme] || THEMES.lampas, K = deps.kit(), rnd = (() => { let s = 7 + theme.length * 13; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })();
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(LEN + 200, 160), deps.lam({ color: T.ground })); gr.rotation.x = -Math.PI / 2; gr.position.set(X0 + LEN / 2, 0, Z0); gr.receiveShadow = true; scenery.add(gr);
    for (const side of [-1, 1]) for (let x = X0 - 10; x < X0 + LEN + 20; ) {
      const z = Z0 + side * (HALF + 1.2), w = 6 + rnd() * 8; const cx = x + w / 2;
      if (side > 0 && cx > X0 + LEN - 40) { x += w; continue; } // keep the car park open
      if (T.props === 'brick') { const h = 6 + rnd() * 6, c = [0x8a4a3a, 0x9a5a44, 0x6a3a30, 0xb08a6a][Math.floor(rnd() * 4)]; K.box(w - 0.3, h, 7, c, cx, h / 2, z + side * 3.5); for (let wx = cx - w / 2 + 1; wx < cx + w / 2 - 0.6; wx += 1.6) for (let wy = 2; wy < h - 1; wy += 2.2) K.box(0.8, 1.1, 0.1, 0xf2e6c0, wx, wy, z - side * 0.02); K.box(w, 0.5, 7.4, 0x3a2a24, cx, h + 0.25, z + side * 3.5); }
      else if (T.props === 'hip') { const h = 3 + rnd() * 3, c = [0xff8fb8, 0x5ac8c0, 0xf2c14e, 0x9ad06a, 0xff7a3a][Math.floor(rnd() * 5)]; K.box(w - 1, h, 5, c, cx, h / 2, z + side * 2.5); K.box(w - 0.6, 0.2, 5.6, 0xf4f2ec, cx, h + 0.1, z + side * 2.5); K.cyl(0.12, 0.16, 2.2, 0x5e4636, cx + w / 2, 1.1, z - side * 1.5, 8); K.cyl(1.2, 0.9, 1.6, 0x4f8a3c, cx + w / 2, 2.9, z - side * 1.5, 8); }
      else if (T.props === 'docks') { const n = 1 + Math.floor(rnd() * 3); for (let k = 0; k < n; k++) K.box(w - 0.5, 2.5, 2.5, [0xc8402a, 0x2a5a9a, 0xe8a020, 0x3a7a4a, 0x8a8a8a][Math.floor(rnd() * 5)], cx, 1.25 + k * 2.55, z + side * 1.5); if (rnd() < 0.25) { K.box(0.6, 18, 0.6, 0xf2c31a, cx, 9, z + side * 6); K.box(0.6, 0.6, 14, 0xf2c31a, cx, 17.5, z + side * 1); } }
      else if (T.props === 'sand') { K.geo(new THREE.SphereGeometry(1, 10, 6), 0xe0c088, cx, -0.6, z + side * 4, 0, rnd() * 3, 0, w * 0.7, 2 + rnd() * 2.5, 6); if (rnd() < 0.5) { K.cyl(0.14, 0.2, 4.5, 0x8a6a3a, cx, 2.25, z, 8); for (let a = 0; a < 6; a++) K.box(2.2, 0.06, 0.5, 0x3a8a3a, cx + Math.cos(a) * 1, 4.5, z + Math.sin(a) * 1, a, 0, 0.35); } else if (rnd() < 0.4) { K.box(3, 2, 3, 0xb83a1e, cx, 1, z + side * 2); K.box(3.4, 0.1, 3.4, 0xf2e6c0, cx, 2.1, z + side * 2); } }
      else { K.box(0.08, 2, 0.08, 0x9aa0a8, cx - w / 2, 1, z); K.box(w, 0.05, 0.05, 0x9aa0a8, cx, 1.9, z); K.box(w, 0.05, 0.05, 0x9aa0a8, cx, 1.0, z); if (rnd() < 0.2) { K.box(14, 2.2, 2.2, 0xf4f4f0, cx, 3, z + side * 18); K.box(3, 0.3, 16, 0xf4f4f0, cx, 3, z + side * 18); K.box(0.4, 3.5, 2.5, 0xe8202a, cx - 6.5, 5, z + side * 18); } K.box(0.3, 0.3, 0.3, 0x2a6aff, cx, 0.2, z + side * 6); }
      x += w;
    }
    for (const side of [-1, 1]) { K.box(LEN + 60, 0.12, 1.7, 0xb8b2a6, X0 + LEN / 2, 0.06, Z0 + side * (LANE * 2 + 1.0)); K.box(LEN + 60, 0.16, 0.16, 0xd8d4cc, X0 + LEN / 2, 0.08, Z0 + side * (LANE * 2 + 0.1)); } // kerbs and a strip of pavement
    for (let x = X0 + 10; x < X0 + LEN; x += 26) { K.cyl(0.07, 0.1, 5, 0x26282c, x, 2.5, Z0 - HALF + 0.6, 8); K.box(0.3, 0.1, 1.2, 0x26282c, x, 5, Z0 - HALF + 1.1); K.box(0.3, 0.08, 0.4, 0xfff4d0, x, 4.92, Z0 - HALF + 1.6); }
    const m = K.build(); if (m) { m.castShadow = true; m.receiveShadow = true; scenery.add(m); }
    const o = R.opts, sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.6), deps.lam({ map: deps.signTex([{ t: String(o.to).toUpperCase(), size: 54 }, { t: o.airport ? 'kiss & ride →' : 'parkeren →', size: 30, color: '#ffffff' }], '#1a4a9a', '#ffffff', 512, 120) }));
    sg.position.set(X0 + LEN - 60, 4.2, Z0 - HALF + 0.4); sg.rotation.y = -Math.PI / 2 + 0.5; scenery.add(sg);
    for (const px of [0, 0.6]) { const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.6, 0.14), deps.lam({ color: 0x8a8a8a })); post.position.set(X0 + LEN - 60 + px * 2 - 0.6, 1.8, Z0 - HALF + 0.5 + px); scenery.add(post); }
  }
  function layout() { // a different road every trip: where the skips stand and how the traffic is spread
    const o = R.opts, seed = (state.raids | 0) * 7 + (deps.day ? deps.day() : 1) * 13 + String(o.to).length; let s = seed % 2147483647 || 3; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    skips.forEach((k, i) => { const x = X0 + 70 + i * 82 + rnd() * 30; k.g.position.set(x, 0, Z0 + LANE); box2(k.sol, x, Z0 + LANE, i % 2 ? 2.0 : 3.1, 1.0); k.sol.off = false; });
    cars.forEach((c, i) => { c.g.position.set(X0 + 30 + rnd() * (LEN - 60), 0, Z0 + (c.on ? -LANE : LANE)); c.g.rotation.y = c.on ? Math.PI : 0; c.sol.off = false; c.wreck = false; });
    peds.forEach((q, i) => { q.p.position.set(q.zx + (i % 3 - 1) * 0.9, 0, Z0 + (q.dir > 0 ? -HALF + 1 : HALF - 1)); q.down = 0; q.p.rotation.x = 0; q.wait = rnd() * 4; });
    gang.forEach((g) => { g.on = false; g.dead = false; g.g.visible = false; if (g.g.userData.paint) g.g.userData.paint.color.setHex(0xff7a1a); });
    if (johanCar) johanCar.visible = false;
  }

  // ---- start
  function start(o) {
    if (R.active || (deps.blockedStart && deps.blockedStart())) return false;
    if (!strip) buildStrip();
    if (!van) { van = deps.makeVan(); van.visible = false; scene.add(van); veh = deps.fiets.adopt(van, { kind: 'car', name: 'Oofmobiel', own: true, quiet: true, half: 2.5, width: 2.0, locked: () => R.active && !R.over, k: { vmax: 19, acc: 7, brake: 16, rev: -5, turn: 1.5, grip: 4.5, r: 1.0, nose: 1.9 } }); }
    R.opts = o; Object.assign(R, { active: true, phase: 'street', t: 0, hp: 100, bumped: 0, wrecked: 0, smart: 0, ambush: 0, over: false });
    veh.k.vmax = Math.max(15, ((o.van && o.van.maxV) || 26) * 0.72); veh.gripMul = Math.max(0.35, o.grip || 1);
    johanCue = o.johan || null;
    fadeTo(() => {
      deps.oof.visible = false; deps.oofSolid.off = true; van.visible = true;
      van.position.copy(deps.oof.position); van.rotation.copy(deps.oof.rotation);
      deps.fiets.mount(veh); document.body.classList.add('ritting'); hudEl.style.display = 'block'; crashT = 0;
      { const hint = document.querySelector('#fts .hint'); if (hint) hint.innerHTML = '<b>W</b> gas · <b>S</b> remmen / achteruit · <b>A</b><b>D</b> sturen · <b>H</b> toeter'; }
      const B = deps.buurt(); if (B) B.setPoint(deps.exit.x, deps.exit.z, 'the ring road');
      deps.toast(`${o.from} → ${o.to}`, `Pull out and drive <b>east</b> down the street to the ring road: follow the yellow light.${o.mission ? ' ' + o.mission : ''}`, 4.5);
      deps.snapCam(); ev('start', { to: o.to });
    });
    return true;
  }
  function toRing() {
    R.phase = 'fade';
    fadeTo(() => {
      const o = R.opts; dress(o.airport ? 'air' : THEMES[o.theme] ? o.theme : 'lampas'); layout(); strip.visible = true; solidsOff(false);
      veh.B.x = X0 + 6; veh.B.z = Z0 + LANE; veh.B.h = Math.PI / 2; veh.B.v = 8; van.position.set(veh.B.x, 0, veh.B.z);
      deps.setBounds({ x0: X0 - 4, x1: X0 + LEN + 4, z0: Z0 - HALF, z1: Z0 + HALF + 12.5 });
      const B = deps.buurt(); if (B) B.setPoint(ring.position.x, ring.position.z, o.to);
      R.phase = 'ring'; deps.snapCam();
      deps.toast('DE RING', `${o.to}: ${LEN} m. Mind the skips in your lane and the traffic coming the other way. Park in the yellow ring.`, 3.5);
    });
  }
  function damage(n) { if (R.over) return; n *= (R.opts.van && R.opts.van.dmg) || 1; R.hp = Math.max(0, R.hp - n); if (R.hp <= 0) finish(false, 'OOFMOBIEL KAPOT', 'The van gave up. Freddy Sr. would have had words.'); }
  let crashT = 0;
  function crash(speed) { if (!R.active || R.over || R.t - crashT < 0.7) return; crashT = R.t; if (speed > 9) ev('crash'); damage(Math.max(0, speed - 5) * 1.3); } // a scrape costs little, a head-on a lot
  function giveUp() { if (!R.active || R.over) return; deps.choice('Eddy Jr.', 'Turn the Oofmobiel round and go home? The trip is lost.', ['Omkeren', 'Keep driving'], (i) => { if (i === 0) finish(false, 'OMGEKEERD', 'Back to the warehouse.'); }); }
  function finish(arrived, title, sub) {
    if (R.over) return; R.over = true;
    const o = R.opts, pay = !arrived ? 0 : o.noPay ? -R.smart : Math.max(0, BASE_PAY + R.wrecked * BOUNTY + Math.max(0, Math.round((PAR - R.t) * 3)) - R.smart);
    if (arrived) { ev('arrive', { t: R.t, par: PAR, bumped: R.bumped, dents: Math.round(100 - R.hp) }); deps.beep(523, 0.15, 'triangle', 0.06); setTimeout(() => deps.beep(784, 0.3, 'triangle', 0.06), 160); }
    else { ev('fail', { title }); deps.beep(160, 0.3, 'sawtooth', 0.06); }
    deps.toast(arrived ? 'AANGEKOMEN!' : title, arrived ? `${o.to} in ${fmtT(R.t)} (par ${fmtT(PAR)}). ${o.noPay ? (o.arrived || '') : `Fee W ${BASE_PAY}${R.wrecked ? ` · ${R.wrecked} wrecked +W ${R.wrecked * BOUNTY}` : ''}${R.smart ? ` · smartengeld −W ${R.smart}` : ''} · total W ${pay}.`}` : sub, 4.5);
    const res = { arrived, pay, time: R.t, wrecked: R.wrecked, bumped: R.bumped };
    setTimeout(() => fadeTo(() => { stop(); if (o.onDone) o.onDone(res); }), arrived ? 900 : 1400);
  }
  function stop() { // everything back where it was: the van on its parking, Eddy next to it
    if (!R.active) return;
    R.active = false; R.phase = null; hudEl.style.display = 'none'; document.body.classList.remove('ritting');
    if (deps.fiets.current === veh) { veh.locked = () => false; deps.fiets.dismount(); veh.locked = () => R.active && !R.over; }
    van.visible = false; if (veh.solid) veh.solid.off = true;
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
    // the ring: traffic
    for (const c of cars) {
      if (c.wreck) continue; const d = c.on ? -1 : 1; let x = c.g.position.x + d * c.v * dt;
      if (!c.on) for (const k of skips) if (k.g.position.x > x && k.g.position.x - x < 9) x = c.g.position.x; // the slow ones wait behind a skip
      if (x < X0 - 16) x = X0 + LEN + 14; if (x > X0 + LEN + 16) x = X0 - 14; c.g.position.x = x; box2(c.sol, x, c.g.position.z, c.half, 0.95);
      if (c.on && hitBox(x, c.g.position.z, c.half, 0.9, B.x, B.z, 2.1, 0.95) && sp + c.v > 6) { crash(sp + c.v * 0.5); B.v *= -0.2; c.g.position.x -= 4; } // head-on: the solid only stops the van, this is the dent
    }
    // people on the zebras
    for (const q of peds) {
      const p = q.p;
      if (q.down > 0) { q.down -= dt; if (q.down <= 0) p.rotation.x = 0; continue; }
      if (q.wait > 0) { q.wait -= dt; deps.animate(p, 0, dt); continue; }
      p.position.z += q.dir * q.v * dt; p.rotation.y = q.dir > 0 ? 0 : Math.PI; deps.animate(p, q.v, dt);
      if (Math.abs(p.position.z - Z0) > HALF - 0.8) { q.dir *= -1; q.wait = 1 + Math.random() * 5; }
      if (sp > 3 && Math.hypot(p.position.x - B.x, p.position.z - B.z) < 1.6) { q.down = 4; p.rotation.x = -Math.PI / 2; R.bumped++; R.smart += SMART; ev('ped'); deps.toast('SMARTENGELD', `−W ${SMART}. That was a zebra, Eddy.`, 1.8); deps.beep(240, 0.1, 'square', 0.05); }
    }
    // the gang: past half-way two of their cars come up from behind and ram
    const o = R.opts;
    if (!R.ambush && !o.noPay && !o.airport && !(o.van && o.van.tint && Math.random() < 1) && B.x > X0 + LEN * 0.45) {
      R.ambush = 1; ev('ambush'); gang.forEach((g, i) => { g.on = true; g.dead = false; g.v = sp + 3; g.cool = 0; g.g.visible = true; g.g.position.set(B.x - 34 - i * 12, 0, Z0 + (i ? -LANE : LANE)); g.g.rotation.y = 0; });
      deps.toast('HINDERLAAG!', `The ${(THEMES[o.theme] || THEMES.lampas).name || 'Lampas'} want their street back. Lead them into a skip or the oncoming traffic.`, 3.2); deps.beep(880, 0.1, 'square', 0.05);
    } else if (!R.ambush && o.van && o.van.tint && B.x > X0 + LEN * 0.45) R.ambush = 2; // tinted windows: they never spotted the van
    for (const g of gang) {
      if (!g.on) continue; const p = g.g.position;
      if (g.dead) continue;
      if (g.cool > 0) { g.cool -= dt; g.v += (Math.max(4, sp - 4) - g.v) * Math.min(1, dt * 2); } else g.v += (Math.min(veh.k.vmax + 3, sp + 6) - g.v) * Math.min(1, dt * 1.5);
      p.x += g.v * dt; p.z += (B.z - p.z) * Math.min(1, dt * 1.1);
      const hitSkip = skips.some((k) => hitBox(p.x, p.z, 2.1, 0.9, k.g.position.x, k.g.position.z, 2.4, 1.0)), hitCar = cars.find((c) => !c.wreck && hitBox(p.x, p.z, 2.1, 0.9, c.g.position.x, c.g.position.z, c.half, 0.9));
      if (hitSkip || hitCar) { g.dead = true; if (g.g.userData.paint) g.g.userData.paint.color.setHex(0x3a2a20); R.wrecked++; ev('wreck'); deps.toast('WRAK!', `One of theirs is done. +W ${BOUNTY}.`, 1.8); deps.beep(90, 0.3, 'sawtooth', 0.07); if (hitCar) hitCar.wreck = true; continue; }
      if (hitBox(p.x, p.z, 2.1, 0.9, B.x, B.z, 2.3, 1.0)) { damage(9); ev('crash'); B.v = Math.min(veh.k.vmax, B.v + 3); g.cool = 2.2; p.x -= 4; deps.beep(70, 0.16, 'sawtooth', 0.06); }
      if (p.x < B.x - 70) p.x = B.x - 40;
    }
    // park in the ring
    ring.material.opacity = 0.6 + Math.sin(R.t * 5) * 0.25;
    if (Math.hypot(B.x - ring.position.x, B.z - ring.position.z) < 3.4 && sp < 2.5) { finish(true); return; }
    hud();
  }
  return { start, stop, update, crash, giveUp, get active() { return R.active; }, get phase() { return R.phase; }, get run() { return R; }, vehicle: () => veh, X0, Z0, LEN, PAR };
}
