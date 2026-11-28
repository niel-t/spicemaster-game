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
//   4. (2026-11-27) The afrit is a real ramp now. It climbs to a crossing road on a viaduct over the snelweg: turn right at the
//      top and you are off to the town, turn left and you cross over the snelweg, take the oprit down onto the other
//      carriageway and drive back the other way. At the knooppunt at its end: turn round for another go, or go home.
// The same contract as the old drive, so every caller kept working: start({ van, from, to, theme, mission, noPay,
// airport, arrived, doneLabel, johan, grip, onEvent, onDone }) and onDone({ arrived, pay, time, wrecked, bumped }).
// Events for the passenger (js/freddy.js) and the wear (js/garage.js): start, ped, crash, wreck, ambush, arrive, fail.
// 2026-11-27: the snelweg politie (js/snelpolitie.js) chases a van that gives them a reason; deps.onPolice(kind, data)
// hears 'chase', 'escape' and 'arrest'. Without Garage Mo's turbo (o.van.turbo) the van hits its begrenzer at 155 km/u.
import { createSnelPolitie } from './snelpolitie.js';
const PAR = 75, FINE = 25, BOUNTY = 50, BASE_PAY = 250, FLITS = 120 / 3.6;
const X0 = 1000, Z0 = 600, LEN = 980, LW = 3.4, EXIT0 = LEN - 230, EXIT1 = LEN - 110; // the motorway runs east from X0, centre lane on Z0; the afrit peels off between EXIT0 and EXIT1
const NEDGE = Z0 - LW * 1.5 - 0.9, SEDGE = Z0 + LW * 1.5 + 2.7; // the guard rail in the middle, and the outside of the vluchtstrook
// the afrit and the crossing road: XC is the road over the snelweg, J the junction at the top of the afrit, JN the one on
// the far side where the oprit goes down onto the other carriageway; everything up there is UP metres above the snelweg
const XC = X0 + LEN - 40, UP = 6, ZJ = SEDGE + 18, ZJN = NEDGE - 22, ZEND = ZJ + 26, RW2 = 4.4; // RW2: half the crossing road
const PARK = { x: XC, z: ZEND + 6 }; // where the exit road reaches the town: drive onto the yellow ring
const RX0 = X0 + EXIT1, RZS = Z0 + LW * 1.5 + 1.7, RZN = NEDGE - 13.1; // where the ramps leave and join the carriageways
const bez = (a, b, c, d, t) => { const u = 1 - t; return [u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1]]; };
const RAMP_S = Array.from({ length: 33 }, (_, i) => bez([RX0, RZS], [RX0 + 32, RZS], [XC - 26, ZJ], [XC - RW2, ZJ], i / 32)); // afrit: up from the uitvoegstrook to J
const RAMP_N = Array.from({ length: 33 }, (_, i) => bez([XC - RW2, ZJN], [XC - 26, ZJN], [RX0 + 32, RZN], [RX0, RZN], i / 32)); // oprit: from JN down to the invoegstrook
const ss = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
const rampY = (x) => UP * ss((x - RX0) / (XC - RW2 - RX0));
const nearRamp = (P, x, z, w) => { for (let i = 0; i < P.length - 1; i++) { const [ax, az] = P[i], [bx, bz] = P[i + 1], dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz))); if (Math.hypot(x - ax - dx * t, z - az - dz * t) < w) return true; } return false; };
const BEGRENZER = 155 / 3.6, TURBO_MIN = 56, TURBO_MAX = 60; // m/s on the motorway: the limiter without Mo's turbo; with it, ~190 km/u and up (the politie: 160)
const W_ = 0xf4f2ec;
const TURN_X = X0 + 420; // driving back the other way: the knooppunt where you turn round (or go home)
const fmtT = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
// where each trip goes: the motorway, the afrit number, the towns on the signs, the land beside the road
export const ROUTES = {
  lampas: { a: 'A10', afrit: 'S100', via: 'Centrum', other: ['A2', 'Uitkaas'], gang: 'Lampas', props: 'brick', ground: 0x7a8a5a },
  nosh: { a: 'A8', afrit: 2, via: 'Kaasdam', other: ['A7', 'Purmerkaas'], gang: 'Noshgey Kariot', props: 'hip', ground: 0x7a9a5a },
  docks: { a: 'A1', afrit: 4, via: 'Kaasfoort', other: ['A2', 'Uitkaas'], gang: 'Abdavissies', props: 'docks', ground: 0x6a6e72 },
  sand: { a: 'A5', afrit: 7, via: 'Haarlemmerkaas', other: ['A8', 'Kaasdam'], gang: 'Paravim', props: 'sand', ground: 0xd8b878 },
  pijp: { a: 'A10', afrit: 'S109', via: 'Kaas-Zuid', other: ['A2', 'Uitkaas'], gang: '', props: 'brick', ground: 0x7a8a5a }, // De Peperpijp, the spoed customers (js/spoed.js)
  air: { a: 'A4', afrit: 2, via: 'Den Kaas', other: ['A9', 'Kaasstelveen'], gang: '', props: 'air', ground: 0x7a9a5a },
  almere: { a: 'A6', afrit: 5, via: 'Almere', other: ['A1', 'Kaasfoort'], gang: 'Blokaas', props: 'polder', ground: 0x86a25a }, // over the IJmeer to Almere (js/blokaas.js)
};

// deps: THREE, scene, player, state, kit(), lam, signTex, makeCar(opts), makeVan(), fiets, oof, oofSolid,
//       solid(), setBounds(b), snapCam(), buurt(), toast, beep, choice, RC, exit: { x, z }, roadMat, day(), blockedStart()
export function createRit(deps) {
  const { THREE, scene, player, state } = deps;
  const R = { active: false, phase: null, opts: null, t: 0, hp: 100, bumped: 0, wrecked: 0, smart: 0, ambush: 0, over: false, route: ROUTES.lampas, flashed: false };
  let van = null, veh = null, strip = null, scenery = null, ring = null, flash = null;
  const cars = [], works = [], gang = [], sols = [], far = [], spinners = []; let lampPool = null, headPool = null; let johanCue = null, vBase = 19, crashT = 0;
  // ---- the fade and the trip card
  const fade = document.createElement('div'); fade.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40'; document.body.appendChild(fade);
  const fadeTo = (fn) => { fade.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { fade.style.opacity = '0'; }, 80); } }, 380); };
  const css = document.createElement('style');
  css.textContent = `#rit{position:fixed;left:16px;top:44px;z-index:9;display:none;min-width:230px;padding:8px 12px 9px;border-radius:12px;color:#fff;font:600 13px/1.35 Rubik,"Segoe UI",Arial,sans-serif;text-shadow:0 1px 2px #000;background:rgba(30,18,10,.72);border:1px solid rgba(255,226,170,.5)}
html.aero #rit{background:linear-gradient(180deg,rgba(120,80,48,.62),rgba(70,42,22,.66) 48%,rgba(42,25,13,.74) 52%,rgba(54,33,18,.7));-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}
#rit b{color:#ffd36b}#rit .an{display:inline-block;padding:0 5px;border-radius:4px;background:#c8102e;color:#fff;font-weight:800;text-shadow:none}
#rit .bar{height:9px;margin:5px 0 3px;border-radius:6px;background:rgba(0,0,0,.45);overflow:hidden;border:1px solid rgba(255,240,210,.5)}#rit .bar i{display:block;height:100%;background:#6ed36e;transition:width .2s}
#rit small{font-weight:400;color:#f3e6c8}#rit .pol{display:inline-block;margin-top:3px;padding:1px 8px;border-radius:9px;font-weight:800;letter-spacing:.06em;color:#fff;animation:ritpol .7s steps(2) infinite}#rit .pol i{font-style:normal;opacity:.3}@keyframes ritpol{0%{background:#1f4fd8}100%{background:#c8102e}}#rit button{margin-top:5px;pointer-events:auto;font:600 11px Rubik,Arial;color:#fff;background:rgba(0,0,0,.35);border:1px solid rgba(255,226,170,.5);border-radius:8px;padding:2px 8px;cursor:pointer}
body.ritting #objective,body.ritting #area,body.ritting #ftsOff,body.ritting #fts .spd,body.ritting #kit,body.ritting #weapon,body.ritting #income{display:none!important}
@media (max-width:820px),(max-height:500px){#rit{left:8px;top:8px;min-width:0;font-size:11.5px;padding:6px 9px}}`;
  document.head.appendChild(css);
  const hudEl = document.createElement('div'); hudEl.id = 'rit'; document.body.appendChild(hudEl);
  hudEl.addEventListener('click', (e) => { if (e.target.closest('button')) { e.stopPropagation(); giveUp(); } });
  let hudKey = '';
  function hud() {
    const o = R.opts, rt = R.route, kmh = Math.round(Math.abs(veh.B.v) * 3.6);
    const where = R.phase === 'street' ? `oprit <span class="an">A10</span> ${Math.max(0, Math.round(deps.exit.x - veh.B.x))} m`
      : R.west ? `<span class="an">${rt.a}</span> the other way · knooppunt ${Math.max(0, Math.round(veh.B.x - TURN_X))} m`
      : R.up || veh.B.z > SEDGE + 1 ? `top of the afrit: <b>right</b> ${o.to} · <b>left</b> over the snelweg, back the other way`
      : veh.B.x < X0 + 170 && rt.a !== 'A10' ? `<span class="an">A10</span> ring → <span class="an">${rt.a}</span>` : `<span class="an">${rt.a}</span> afrit ${rt.afrit} ${o.to} ${Math.max(0, Math.round(X0 + EXIT0 - veh.B.x))} m`;
    const h = `<b>${o.from} → ${o.to}</b><br>${fmtT(R.t)} <small>(par ${fmtT(PAR)})</small> · <b>${kmh} km/u</b> · ${where}<div class="bar"><i style="width:${R.hp}%;background:${R.hp > 60 ? '#6ed36e' : R.hp > 30 ? '#ffd36b' : '#ff4a4a'}"></i></div><small>Oofmobiel ${Math.round(R.hp)}%${R.smart ? ` · boetes W ${R.smart}` : ''}${R.bonus ? ` · claxon +W ${R.bonus}` : ''}${R.wrecked ? ` · ${R.wrecked} wrecked` : ''}</small>${pol.stars ? `<br><span class="pol">POLITIE ${'★'.repeat(pol.stars)}<i>${'★'.repeat(3 - pol.stars)}</i></span>` : ''}<br><button>Omkeren (give up)</button>`;
    if (h !== hudKey) { hudEl.innerHTML = h; hudKey = h; }
  }
  const ev = (type, data) => { const o = R.opts; if (o && o.onEvent) try { o.onEvent(type, data); } catch (e) { console.error(e); } };
  const box2 = (s, x, z, hx, hz) => Object.assign(s, { minx: x - hx, maxx: x + hx, minz: z - hz, maxz: z + hz });

  // ---- the other traffic (2026-11-26: real vehicles instead of boxes). Everything faces +x; one kit mesh per vehicle,
  // a livery plane on each side, and unlit red tail lights that read at any hour.
  const GL = 0x1c2630, TYRE = 0x16161a, HUB = 0xb8bcc2, CHROME = 0xc8ccd2;
  const tail = (g, x, y, zs, w = 0.34, h = 0.16) => { const m = new THREE.MeshBasicMaterial({ color: 0xff2a1a }); for (const z of zs) { const q = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, w), m); q.position.set(x, y, z); g.add(q); } };
  const livery = (g, text, sub, bg, fg, w, h, x, y, zHalf) => { const t = deps.signTex([{ t: text, size: 62 }, ...(sub ? [{ t: sub, size: 26, color: fg }] : [])], bg, fg, 512, Math.round(512 * h / w)); for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), deps.lam({ map: t })); p.position.set(x, y, s * zHalf); p.rotation.y = s > 0 ? 0 : Math.PI; g.add(p); } };
  const wheelSet = (K, xs, zHalf, r = 0.52) => { for (const x of xs) for (const s of [1, -1]) { K.cyl(r, r, 0.34, TYRE, x, r, s * zHalf, 14, Math.PI / 2); K.cyl(r * 0.5, r * 0.5, 0.36, HUB, x, r, s * zHalf, 10, Math.PI / 2); } };
  // a DAF-like cab-over tractor: the cab ends at x = nose, the fifth wheel sits behind it
  function tractor(K, nose, col) {
    const x = nose - 1.15;
    K.box(2.3, 2.1, 2.46, col, x, 2.15, 0); K.box(2.1, 0.5, 2.4, col, x - 0.1, 3.4, 0); K.box(1.6, 0.42, 2.3, col, x - 0.35, 3.78, 0, 0, 0, 0.16); // cab, roof, wind deflector
    K.box(0.06, 0.95, 2.1, GL, nose + 0.005, 2.55, 0); for (const s of [1, -1]) K.box(0.9, 0.7, 0.05, GL, x + 0.35, 2.55, s * 1.235); // windscreen and door glass
    K.box(0.08, 0.75, 1.9, 0x2a2e34, nose + 0.01, 1.55, 0); for (let i = 0; i < 3; i++) K.box(0.1, 0.07, 1.7, CHROME, nose + 0.02, 1.34 + i * 0.2, 0); // grille
    K.box(0.3, 0.42, 2.5, 0x2a2e34, nose - 0.1, 0.78, 0); for (const s of [1, -1]) { K.box(0.08, 0.2, 0.42, 0xfff6d8, nose + 0.06, 0.82, s * 0.92); K.box(0.12, 0.5, 0.12, 0x2a2e34, nose - 0.25, 2.75, s * 1.42); K.box(0.06, 0.42, 0.26, GL, nose - 0.25, 2.75, s * 1.5); K.box(0.7, 0.5, 0.5, 0x2a2e34, x - 0.2, 0.75, s * 1.02); }
    K.box(3.4, 0.36, 1.0, 0x2a2c30, x - 1.9, 0.86, 0); for (const s of [1, -1]) K.cyl(0.3, 0.3, 1.1, CHROME, x - 2.0, 0.78, s * 0.95, 12, 0, 0, Math.PI / 2); K.cyl(0.07, 0.07, 1.9, CHROME, x - 1.35, 2.9, 1.0, 8); // chassis, tanks, exhaust
    wheelSet(K, [x + 0.25, x - 3.3], 1.08);
  }
  function rearEnd(K, g, x, top, zh = 1.24) { // doors, the red and yellow chevrons, the underrun bar
    K.box(0.05, top - 1.25, zh * 2 - 0.1, 0xe8e6e0, x - 0.01, (top + 1.25) / 2, 0); K.box(0.07, top - 1.3, 0.05, 0x6a6e74, x - 0.02, (top + 1.25) / 2, 0);
    for (let i = 0; i < 6; i++) K.box(0.06, 0.2, zh * 2 / 6, i % 2 ? 0xe8202a : 0xf2c31a, x - 0.03, 1.12, -zh + zh / 6 + i * zh / 3);
    K.box(0.12, 0.14, zh * 2, 0x2a2c30, x - 0.05, 0.62, 0); tail(g, x - 0.05, 0.92, [zh - 0.22, -zh + 0.22], 0.36, 0.2);
  }
  function makeTruck(kind, i) {
    const g = new THREE.Group(), K = deps.kit(), nose = 8.2, cols = [0x2a5a9a, 0xc8402a, 0x2f7a4a, 0xf2efe6, 0xe8a020], col = cols[i % cols.length];
    tractor(K, nose, kind === 'tank' ? 0xf2efe6 : col);
    const x0 = -8.2, x1 = 4.5, L = x1 - x0, cx = (x0 + x1) / 2; // the trailer
    K.box(L, 0.3, 2.3, 0x2a2c30, cx, 1.1, 0); wheelSet(K, [x0 + 1.5, x0 + 2.85, x0 + 4.2], 1.08); for (const s of [1, -1]) K.box(4.2, 0.08, 0.5, 0x2a2c30, x0 + 2.85, 1.18, s * 1.06); K.box(0.18, 0.9, 0.18, 0x2a2c30, x1 - 2.6, 0.6, 0.6); K.box(0.18, 0.9, 0.18, 0x2a2c30, x1 - 2.6, 0.6, -0.6);
    if (kind === 'box') { const B = [['ALBERT KAAS', 'Elke dag vers', '#1a6ab8', '#ffffff'], ['KAASLAND LOGISTIEK', 'Kipkruidenkwartier · Europa', '#f2efe6', '#c8102e'], ['DE HARING VERS', 'Vis uit Kroketkade', '#12506a', '#ffe14a'], ['SPEKSLAGER & ZN', 'Worst op wielen', '#8a1a1a', '#fff2c8']][i % 4];
      K.box(L, 2.75, 2.5, parseInt(B[2].slice(1), 16), cx, 2.65, 0); K.box(L + 0.02, 0.1, 2.52, 0x8a8e94, cx, 1.3, 0); K.box(L + 0.02, 0.08, 2.52, 0x8a8e94, cx, 4.02, 0); rearEnd(K, g, x0, 4.0);
      const m = K.build(); m.castShadow = true; g.add(m); livery(g, B[0], B[1], B[2], B[3], L - 1.2, 2.3, cx, 2.65, 1.262); }
    else if (kind === 'tank') { K.cyl(1.22, 1.22, L - 0.4, 0xc8ccd2, cx, 2.5, 0, 18, 0, 0, Math.PI / 2); for (const dx of [-4.5, -1.5, 1.5, 4.5]) K.cyl(1.25, 1.25, 0.12, 0x9a9ea6, cx + dx, 2.5, 0, 18, 0, 0, Math.PI / 2); K.box(L - 1, 0.12, 0.6, 0x8a8e94, cx, 3.76, 0); for (const dx of [-3, 0, 3]) K.cyl(0.3, 0.3, 0.16, 0x8a8e94, cx + dx, 3.86, 0, 10);
      K.box(0.1, 0.5, 2.2, 0x2a2c30, x0 + 0.1, 1.4, 0); for (let k = 0; k < 6; k++) K.box(0.06, 0.2, 0.4, k % 2 ? 0xe8202a : 0xf2c31a, x0 - 0.02, 1.12, -1.0 + k * 0.4); tail(g, x0 - 0.02, 0.92, [0.95, -0.95], 0.36, 0.2);
      const m = K.build(); m.castShadow = true; g.add(m); livery(g, 'KAASMELK', 'Vers van de polder', '#e8ecf0', '#1a6ab8', 6.5, 1.3, cx, 2.55, 1.24); }
    else { const cc = [0xc8402a, 0x2a5a9a, 0xe8a020, 0x3a7a4a][i % 4]; K.box(L - 0.3, 2.6, 2.44, cc, cx, 2.55, 0); for (let rx = x0 + 0.5; rx < x1 - 0.3; rx += 0.42) for (const s of [1, -1]) K.box(0.16, 2.4, 0.05, cc, rx, 2.55, s * 1.245); K.box(L - 0.2, 0.14, 2.5, 0x4a4e54, cx, 1.28, 0); K.box(L - 0.2, 0.12, 2.5, 0x4a4e54, cx, 3.88, 0); rearEnd(K, g, x0 + 0.1, 3.85);
      const m = K.build(); m.castShadow = true; g.add(m); livery(g, ['KAASLINE', 'DOKKEN LLOYD', 'ABDAVISSIES & CO', 'CMA KGM'][i % 4], null, '#' + cc.toString(16).padStart(6, '0'), '#ffffff', 5.5, 1.3, cx, 3.0, 1.275); }
    return { g, half: 8.3 };
  }
  function makeCoach() { // a touring car: the Kaasliner to Costa del Kaas
    const g = new THREE.Group(), K = deps.kit(), L = 12, c = 0xf4f2ec;
    K.box(L, 2.5, 2.5, c, 0, 2.0, 0); K.box(L - 0.4, 0.5, 2.4, c, -0.1, 3.42, 0); K.box(L + 0.02, 0.5, 2.52, 0xff8a1c, 0, 1.35, 0); K.box(L + 0.02, 0.14, 2.52, 0x1a2a5a, 0, 1.7, 0);
    for (const s of [1, -1]) K.box(L - 2.4, 0.95, 0.05, GL, -0.4, 2.62, s * 1.26); K.box(0.06, 1.5, 2.3, GL, L / 2 + 0.01, 2.35, 0); K.box(0.06, 0.8, 2.0, GL, -L / 2 - 0.01, 2.7, 0);
    for (const s of [1, -1]) { K.box(0.08, 0.2, 0.44, 0xfff6d8, L / 2 + 0.04, 1.0, s * 0.9); K.box(0.14, 0.5, 0.14, 0x2a2e34, L / 2 - 0.2, 3.0, s * 1.42); }
    K.box(0.3, 0.4, 2.52, 0x2a2e34, L / 2 - 0.1, 0.72, 0); K.box(0.3, 0.4, 2.52, 0x2a2e34, -L / 2 + 0.1, 0.72, 0); K.box(1.6, 0.3, 1.2, 0xd8d4cc, -3, 3.8, 0); wheelSet(K, [4.1, -3.3, -4.5], 1.1, 0.5);
    const m = K.build(); m.castShadow = true; g.add(m); tail(g, -L / 2 - 0.03, 1.15, [0.95, -0.95], 0.4, 0.3);
    livery(g, 'KAASLINER', 'Costa del Kaas · elke vrijdag', '#f4f2ec', '#ff8a1c', 6, 0.62, -0.4, 1.72, 1.268);
    return { g, half: 6.1 };
  }
  function makeCaravanCombo() { // a family car towing the sleurhut: where there is a Dutch motorway, there is a caravan
    const g = new THREE.Group(), car = deps.makeCar({ model: 2 }), ch = car.userData.half; car.position.x = 3.4; g.add(car);
    const K = deps.kit(), cx = -1.9; K.box(4.4, 1.9, 2.1, 0xf6f4ee, cx, 1.55, 0); K.box(4.0, 0.3, 2.0, 0xf6f4ee, cx, 2.6, 0); K.box(4.42, 0.22, 2.12, 0x2a8ad8, cx, 1.25, 0); K.box(4.42, 0.08, 2.12, 0xe8a020, cx, 1.02, 0);
    for (const s of [1, -1]) { K.box(1.3, 0.6, 0.05, GL, cx + 0.6, 1.95, s * 1.06); K.box(0.7, 0.6, 0.05, GL, cx - 1.2, 1.95, s * 1.06); } K.box(0.05, 0.7, 1.4, GL, cx + 2.21, 1.95, 0); K.box(0.05, 0.6, 1.2, GL, cx - 2.21, 2.0, 0);
    K.box(1.5, 0.08, 0.08, 0x2a2c30, cx + 2.9, 0.55, 0); K.box(0.5, 0.5, 0.7, 0xd8d4cc, cx + 2.5, 0.85, 0); wheelSet(K, [cx - 0.2], 1.0, 0.34); K.box(0.3, 0.2, 1.6, 0xf6f4ee, cx - 0.2, 2.85, 0); // towbar, gas locker, wheels, roof vent
    const m = K.build(); m.castShadow = true; g.add(m); tail(g, cx - 2.24, 0.95, [0.85, -0.85]); tail(car, -ch - 0.02, 0.74, [0.55, -0.55], 0.3, 0.12);
    return { g, half: 5.6 };
  }
  // the far carriageway: cheap little cars coming the other way, there to be seen
  function farCar(i) {
    const g = new THREE.Group(), K = deps.kit(), c = [0xc8102e, 0xf2e8c8, 0x1f4fa0, 0x2d2d2d, 0xd8d8d8, 0x2f6a3a, 0xe8b020, 0x7a2a5a][i % 8], van = i % 4 === 3;
    K.box(van ? 4.8 : 4.2, van ? 1.5 : 0.75, 1.8, c, 0, van ? 1.1 : 0.7, 0); if (!van) { K.box(2.2, 0.6, 1.6, c, -0.2, 1.3, 0); K.box(2.25, 0.42, 1.5, GL, -0.2, 1.3, 0); K.box(2.0, 0.44, 1.62, GL, -0.2, 1.3, 0); } else K.box(0.06, 0.6, 1.6, GL, 2.41, 1.35, 0);
    for (const x of [1.35, -1.35]) for (const s of [1, -1]) K.cyl(0.33, 0.33, 0.24, TYRE, x, 0.33, s * 0.86, 10, Math.PI / 2);
    const m = K.build(); g.add(m); const hl = new THREE.MeshBasicMaterial({ color: 0xfff4c8 }); for (const s of [1, -1]) { const q = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.14, 0.32), hl); q.position.set(van ? 2.42 : 2.12, 0.72, s * 0.62); g.add(q); }
    g.rotation.y = Math.PI; return g;
  }
  // ---- flitsers (Tristan 2026-11-26): flitspalen on the verge and unmarked vans with a camera in the back, parked on the
  // vluchtstrook. Eddy can't see one without saying something, in Dutch or in Hebrew. Past one faster than 120 and it
  // flashes (a fine); sound the claxon at one and it is bonus Wilders on the trip.
  const RLI = '⁧', PDI = '⁩';
  const RANT_NL = ['Godverdomme, wéér een flitspaal!', 'Kutflitsers! Dieven met een camera!', 'Klootzakken! Ik betaal al erfpacht!', 'Rot op met je kastje, eikel!', 'Stelletje zakkenvullende lulhannesen!', 'Honderdtwintig is voor bejaarden, sukkels!', 'Flits je moeder, lul!', 'Kijk ze staan, die hufters. Langs de vluchtstrook nog wel.'];
  const RANT_HE = [['בן זונה!', 'ben zona!', 'klootzak!'], ['כוס אמק, עוד מצלמה!', 'kus emek, od matslema!', 'godverdomme, nog een camera!'], ['לך תזדיין עם המצלמה שלך!', 'lech tizdayen im hamatslema shelcha!', 'rot op met je camera!'], ['יא מניאק, אני רק נוסע עם פפריקה!', "ya manyak, ani rak nose'a im paprika!", 'klootzak, ik rij alleen maar met paprika!'], ['בני זונות, גנבים עם רישיון!', 'bnei zonot, ganavim im rishayon!', 'klootzakken, dieven met een vergunning!'], ['חרא של מדינה!', 'chara shel medina!', 'kutland!'], ['מה אתם רוצים מהחיים שלי, יא זבל?!', 'ma atem rotsim mehachayim sheli, ya zevel?!', 'wat willen jullie van mijn leven, stuk vuil?!']];
  const HONK_NL = ['TOEEET! Krijg de klere, flitsmeneer!', 'TOET! Flits dit, klootzak!', 'TOET TOET! Groeten van Eddy, lul!', 'TOEEET! Koffie over je broek? Mooi zo, eikel!'];
  const HONK_HE = [['תאכל חרא, בן זונה!', 'tochal chara, ben zona!', 'vreet stront, klootzak!'], ['יאללה ביי, יא מניאק!', 'yalla bye, ya manyak!', 'doei doei, eikel!'], ['כוס אמק, תתעוררו שם!', "kus emek, tit'oreru sham!", 'godverdomme, wakker worden daar!']];
  const cams = []; let rantT = 0;
  const rantEl = document.createElement('div'); rantEl.id = 'ritRant'; document.body.appendChild(rantEl);
  { const st = document.createElement('style'); st.textContent = `#ritRant{position:fixed;left:50%;bottom:118px;transform:translateX(-50%);z-index:10;display:none;max-width:min(520px,88vw);padding:8px 16px 9px;border-radius:16px 16px 16px 4px;text-align:center;color:#07304f;font:700 15px/1.3 "Segoe UI",Tahoma,Rubik,Arial,sans-serif;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(226,244,255,.94) 50%,rgba(204,236,255,.94) 52%,rgba(232,248,255,.96));box-shadow:0 0 0 2px rgba(80,170,230,.6),0 8px 22px rgba(0,40,80,.4);pointer-events:none}
#ritRant small{display:block;font-weight:400;font-size:12px;color:#3a6a8a}#ritRant b{color:#b8501a}#ritRant .he{font-size:18px;direction:rtl;unicode-bidi:isolate}
body.touch #ritRant{bottom:calc(196px + env(safe-area-inset-bottom));font-size:13.5px}`; document.head.appendChild(st); }
  function rant(set, extra) { const he = Math.random() < 0.4, pool = typeof set === 'object' ? (he ? set.he : set.nl) : set === 'honk' ? (he ? HONK_HE : HONK_NL) : he ? RANT_HE : RANT_NL, l = pool[Math.floor(Math.random() * pool.length)];
    rantEl.innerHTML = (Array.isArray(l) ? `<span class="he">${RLI}${l[0]}${PDI}</span><small>${l[1]} · ${l[2]}</small>` : l) + (extra ? `<small><b>${extra}</b></small>` : ''); rantEl.style.display = 'block'; rantT = 3.4; }
  const pol = createSnelPolitie({ THREE, kit: deps.kit, lam: deps.lam, makeCar: deps.makeCar, beep: deps.beep, toast: deps.toast, rant: (set, extra) => rant(set, extra), nightK: deps.nightK, cars: () => cars, Z0, LW, SEDGE, NEDGE, X0,
    onPolice: (k, data) => { ev('police', { kind: k, ...data }); if (deps.onPolice) try { deps.onPolice(k, data); } catch (e) { console.error(e); } } });
  const polInfo = () => ({ B: veh.B, van: (R.opts.van && R.opts.van.name) || 'Oofmobiel', route: R.route.a, to: R.opts.to });
  function makeFlitspaal() { const g = new THREE.Group(), K = deps.kit(); K.cyl(0.14, 0.18, 3.0, 0x6a6e74, 0, 1.5, 0, 10); K.box(0.62, 0.95, 0.62, 0x7a7e84, 0, 3.4, 0); K.box(0.66, 0.16, 0.66, 0xf2c31a, 0, 3.0, 0); K.box(0.66, 0.1, 0.66, 0x1a1a1a, 0, 3.86, 0);
    for (const [y, r] of [[3.58, 0.13], [3.26, 0.1]]) K.cyl(r, r, 0.08, 0x16161a, -0.32, y, 0, 12, 0, 0, Math.PI / 2); K.box(0.9, 0.05, 0.9, 0x9a9690, 0, 0.03, 0); const m = K.build(); m.castShadow = true; g.add(m); return g; }
  function makeFlitsbus() { // an unmarked grey van, back doors to the traffic, the camera behind the rear window and a radar on a tripod beside it
    const g = new THREE.Group(), K = deps.kit(), c = 0x5a5e66;
    K.box(4.6, 1.5, 1.9, c, 0, 1.15, 0); K.box(1.3, 0.9, 1.85, c, 1.6, 0.85, 0); K.box(0.06, 0.6, 1.6, GL, 2.27, 1.45, 0); for (const s of [1, -1]) K.box(0.9, 0.5, 0.05, GL, 1.3, 1.5, s * 0.96);
    K.box(0.05, 0.62, 1.5, GL, -2.31, 1.45, 0); K.box(0.3, 0.3, 0.4, 0x16161a, -2.2, 1.4, 0.3); K.cyl(0.11, 0.11, 0.16, 0x2a4a6a, -2.36, 1.4, 0.3, 12, 0, 0, Math.PI / 2); // the lens behind the glass
    K.box(0.3, 0.3, 2.0, 0x2a2c30, -2.28, 0.5, 0); for (const x of [1.45, -1.45]) for (const s of [1, -1]) K.cyl(0.36, 0.36, 0.26, TYRE, x, 0.36, s * 0.9, 12, Math.PI / 2);
    for (const a of [0, 2.1, 4.2]) K.cyl(0.025, 0.025, 1.3, 0x2a2c30, -3.4 + Math.cos(a) * 0.28, 0.6, 1.5 + Math.sin(a) * 0.28, 5, Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); K.box(0.4, 0.3, 0.3, 0x3a3e44, -3.4, 1.35, 1.5); K.cyl(0.1, 0.1, 0.1, 0x16161a, -3.62, 1.35, 1.5, 10, 0, 0, Math.PI / 2); // the radar on its tripod
    K.cyl(0.05, 0.22, 0.6, 0xff6a1a, -4.6, 0.3, 0.9, 8); K.cyl(0.05, 0.22, 0.6, 0xff6a1a, -6.2, 0.3, 0.4, 8); // two cones, for form's sake
    const m = K.build(); m.castShadow = true; g.add(m); return g; }
  // ---- matrix signs and wegwerkzaamheden, the Dutch way (Tristan 2026-11-26): LED boards over each lane that count the
  // speed down (90, 70 in a red ring), then the white arrow that sends the lane left, then the red cross over the closed
  // lane, and "einde" after the works; amber lights flash in the corners. On the road: yellow warning signs on the
  // verge, a taper of bakens, the pijlwagen with its lit arrow and crash cushion, schrikhekken, a digger, men in orange.
  const LED = {}, blinkA = [], blinkB = [];
  function led(key) {
    if (LED[key]) return LED[key];
    const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
    c.fillStyle = '#060606'; c.fillRect(0, 0, 128, 128); c.lineCap = c.lineJoin = 'round'; c.shadowBlur = 7;
    const stroke = (col, w, pts) => { c.strokeStyle = col; c.shadowColor = col; c.lineWidth = w; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); };
    if (/^\d+$/.test(key)) { c.strokeStyle = '#ff2a1a'; c.shadowColor = '#ff2a1a'; c.lineWidth = 11; c.beginPath(); c.arc(64, 64, 50, 0, 7); c.stroke(); c.fillStyle = '#ffffff'; c.shadowColor = '#ffffff'; c.font = `900 ${key.length > 2 ? 50 : 62}px Arial, sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(key, 64, 68); }
    else if (key === 'arrow') { stroke('#ffffff', 15, [[100, 26], [34, 96]]); stroke('#ffffff', 15, [[30, 52], [30, 100], [78, 100]]); } // the lane ends: move over to the left
    else if (key === 'cross') { stroke('#ff2a1a', 17, [[26, 26], [102, 102]]); stroke('#ff2a1a', 17, [[102, 26], [26, 102]]); }
    else if (key === 'green') { stroke('#3aff5a', 15, [[64, 20], [64, 100]]); stroke('#3aff5a', 15, [[34, 70], [64, 104], [94, 70]]); }
    else if (key === 'end') { c.strokeStyle = '#ffffff'; c.shadowColor = '#ffffff'; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 48, 0, 7); c.stroke(); for (const d of [-9, 0, 9]) stroke('#ffffff', 4, [[98 + d, 30 + d], [30 + d, 98 + d]]); }
    c.shadowBlur = 0; c.fillStyle = '#060606'; for (let i = 0; i < 128; i += 6) { c.fillRect(i, 0, 1.6, 128); c.fillRect(0, i, 128, 1.6); } // the dots of an LED board
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return (LED[key] = new THREE.MeshBasicMaterial({ map: t, fog: false }));
  }
  const amber = new THREE.MeshBasicMaterial({ color: 0xffb41a, fog: false });
  // one board over a lane: the black housing (kit), the LED face, and the four flashers when it warns
  function matrixBoard(parent, K, key, x, y, z, flash, S = 1.7) {
    const F = S - 0.2, e = S / 2 - 0.23;
    K.box(0.34, S, S, 0x121214, x, y, z); K.box(0.5, 0.08, S + 0.1, 0x121214, x - 0.2, y + S / 2 + 0.04, z); K.box(0.2, 0.5, 0.2, 0x8a8e94, x + 0.05, y + S / 2 + 0.2, z); // housing, sun hood, hanger
    const f = new THREE.Mesh(new THREE.PlaneGeometry(F, F), led(key)); f.position.set(x - 0.18, y, z); f.rotation.y = -Math.PI / 2; parent.add(f);
    if (flash) [[e, e], [-e, -e], [e, -e], [-e, e]].forEach(([dy, dz], i) => { const q = new THREE.Mesh(new THREE.CircleGeometry(S * 0.07, 10), amber); q.position.set(x - 0.185, y + dy, z + dz); q.rotation.y = -Math.PI / 2; parent.add(q); (i < 2 ? blinkA : blinkB).push(q); });
  }
  // a signaalportaal: two posts and a beam across the three lanes (zc: the middle lane, in the parent's own coordinates)
  function portal(parent, K, x, zc, keys, flash) {
    const zA = zc - LW * 1.5 - 1.4, zB = zc + LW * 1.5 + 3.4, c = 0x9a9ea6;
    for (const z of [zA, zB]) { K.box(0.3, 8.0, 0.3, c, x, 4.0, z); K.box(1.0, 0.3, 1.0, 0x8a8680, x, 0.15, z); }
    for (const y of [7.0, 7.9]) K.box(0.16, 0.16, zB - zA, c, x, y, (zA + zB) / 2); for (let z = zA + 0.6; z < zB; z += 1.2) K.box(0.08, 1.0, 0.08, c, x, 7.45, z, 0, Math.round(z) % 2 ? 0.7 : -0.7, 0);
    keys.forEach((k, i) => matrixBoard(parent, K, k, x - 0.3, 6.35, zc + (i - 1) * LW, flash, 2.7)); // big and low enough to read from the driving seat
  }
  const canvasSign = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = 128; cv.height = Math.round(128 * h / w); draw(cv.getContext('2d'), cv.width, cv.height); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return deps.lam({ map: t, transparent: true }); };
  let signWerk = null, signLane = null, sign70 = null;
  function roadSign(parent, K, mat, w, h, x, y, z) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x - 0.04, y, z); m.rotation.y = -Math.PI / 2; parent.add(m); K.box(0.1, y + h / 2, 0.1, 0x8a8e94, x + 0.04, (y + h / 2) / 2, z); }
  function worker(K, x, z, ry) { K.box(0.2, 0.75, 0.3, 0x2a3040, x, 0.38, z, ry); K.box(0.26, 0.6, 0.42, 0xff7a1a, x, 1.05, z, ry); K.box(0.27, 0.1, 0.43, 0xf2e86a, x, 1.0, z, ry); K.box(0.27, 0.1, 0.43, 0xf2e86a, x, 1.2, z, ry); K.geo(new THREE.SphereGeometry(0.14, 8, 6), 0xe8b890, x, 1.52, z); K.cyl(0.16, 0.17, 0.1, 0xf4f2ec, x, 1.62, z, 8); }
  // the whole closure as one group, standing on the right lane: x = 0 is the pijlwagen, the taper runs back to -46, the works on to +30
  function makeWorks() {
    const g = new THREE.Group(), K = deps.kit(), zc = -LW, zv = LW * 0.5 + 3.6; // zc: the middle lane, zv: the verge, seen from the right lane
    signWerk = signWerk || canvasSign(1, 0.9, (c, w, h) => { c.fillStyle = '#d8202a'; c.beginPath(); c.moveTo(w / 2, 2); c.lineTo(w - 2, h - 2); c.lineTo(2, h - 2); c.closePath(); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(w / 2, 22); c.lineTo(w - 22, h - 13); c.lineTo(22, h - 13); c.closePath(); c.fill();
      c.fillStyle = '#111'; c.beginPath(); c.arc(60, 58, 6, 0, 7); c.fill(); c.fillRect(54, 64, 11, 22); c.fillRect(52, 84, 5, 16); c.fillRect(62, 84, 5, 16); c.save(); c.translate(70, 70); c.rotate(0.7); c.fillRect(0, -2, 26, 4); c.restore(); c.beginPath(); c.moveTo(84, 96); c.lineTo(100, 96); c.lineTo(92, 84); c.closePath(); c.fill(); }); // a man with a shovel and his heap
    signLane = signLane || canvasSign(1, 1.2, (c, w, h) => { c.fillStyle = '#f2c31a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#111'; c.lineWidth = 4; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#111'; for (const x of [30, 62]) { c.fillRect(x - 5, 40, 10, 90); c.beginPath(); c.moveTo(x, 18); c.lineTo(x + 15, 44); c.lineTo(x - 15, 44); c.closePath(); c.fill(); } c.fillRect(89, 74, 10, 56); c.fillStyle = '#d8202a'; c.fillRect(78, 62, 32, 12); }); // two lanes go on, the right one ends
    sign70 = sign70 || canvasSign(1, 1, (c, w, h) => { c.fillStyle = '#f2c31a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.beginPath(); c.arc(64, 64, 54, 0, 7); c.fill(); c.strokeStyle = '#d8202a'; c.lineWidth = 13; c.beginPath(); c.arc(64, 64, 47, 0, 7); c.stroke(); c.fillStyle = '#111'; c.font = '900 56px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('70', 64, 68); });
    // the countdown over the road, and the yellow signs on the verge
    portal(g, K, -330, zc, ['90', '90', '90'], true); portal(g, K, -190, zc, ['70', '70', 'arrow'], true); portal(g, K, -70, zc, ['70', '70', 'cross'], true); portal(g, K, 64, zc, ['end', 'end', 'end'], false);
    roadSign(g, K, signWerk, 1.9, 1.7, -400, 2.3, zv); roadSign(g, K, signLane, 1.5, 1.8, -260, 2.3, zv); roadSign(g, K, sign70, 1.3, 1.3, -150, 2.2, zv); roadSign(g, K, sign70, 1.3, 1.3, -150, 2.2, zc - LW * 1.5 - 1.6);
    // the taper: geleidebakens (red and white, a lamp on top) from the edge line across the lane, then along the works
    for (let i = 0; i < 20; i++) { const x = -46 + i * 2.3, z = i < 12 ? LW * 0.5 - (i / 11) * (LW - 0.3) : -LW * 0.5 + 0.3; K.box(0.5, 0.12, 0.5, 0x2a2c30, x, 0.06, z); K.box(0.06, 0.95, 0.26, 0xf4f2ec, x, 0.6, z);
      for (let s = 0; s < 3; s++) K.box(0.07, 0.16, 0.27, 0xd8202a, x, 0.3 + s * 0.3, z, 0, 0.5, 0); const l = new THREE.Mesh(new THREE.SphereGeometry(0.07, 6, 5), amber); l.position.set(x, 1.14, z); g.add(l); (i % 2 ? blinkA : blinkB).push(l); }
    for (let x = 4; x < 32; x += 3.4) { K.cyl(0.05, 0.2, 0.55, 0xff6a1a, x, 0.28, -LW * 0.5 + 0.3, 8); K.cyl(0.11, 0.15, 0.1, 0xf4f2ec, x, 0.36, -LW * 0.5 + 0.3, 8); }
    // the pijlwagen: a yellow truck, back to the traffic, with the red and white crash cushion and the lit arrow board
    K.box(4.6, 1.5, 2.3, 0xf2a01a, 0.6, 1.25, 0); K.box(1.7, 1.9, 2.3, 0xf2a01a, 3.6, 1.45, 0); K.box(0.06, 0.7, 2.0, GL, 4.47, 1.95, 0); K.box(5.6, 0.3, 2.1, 0x2a2c30, 1.4, 0.55, 0); wheelSet(K, [3.4, -0.6], 1.02, 0.46);
    K.box(1.9, 0.9, 2.2, 0xe8e4dc, -2.7, 0.75, 0); for (let s = 0; s < 6; s++) K.box(0.06, 0.92, 0.37, s % 2 ? 0xd8202a : 0xf4f2ec, -3.66, 0.75, -0.92 + s * 0.37); K.box(0.9, 0.16, 0.16, 0x2a2c30, -1.5, 0.6, 0.7); K.box(0.9, 0.16, 0.16, 0x2a2c30, -1.5, 0.6, -0.7);
    K.box(0.16, 1.4, 0.16, 0x2a2c30, -1.6, 2.6, 0.9); K.box(0.16, 1.4, 0.16, 0x2a2c30, -1.6, 2.6, -0.9); K.box(0.22, 2.6, 2.6, 0x121214, -1.72, 4.0, 0);
    { const f = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), led('arrow')); f.position.set(-1.84, 4.0, 0); f.rotation.y = -Math.PI / 2; g.add(f); blinkA.push(f);
      for (const dz of [1.08, -1.08]) { const q = new THREE.Mesh(new THREE.CircleGeometry(0.15, 10), amber); q.position.set(-1.845, 5.08, dz); q.rotation.y = -Math.PI / 2; g.add(q); blinkB.push(q); }
      for (const dz of [0.55, -0.55]) { const q = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), amber); q.position.set(3.6, 2.52, dz); g.add(q); (dz > 0 ? blinkA : blinkB).push(q); } }
    // the works themselves: a schrikhek at each end, milled tarmac, a digger, a roller, a heap of sand, three men in orange
    for (const x of [7.5, 31]) { for (let s = 0; s < 5; s++) K.box(0.08, 0.3, 0.44, s % 2 ? 0xd8202a : 0xf4f2ec, x, 1.0, -0.88 + s * 0.44); K.box(0.08, 1.2, 0.08, 0x8a8e94, x, 0.6, 0.95); K.box(0.08, 1.2, 0.08, 0x8a8e94, x, 0.6, -0.95); }
    K.box(22, 0.012, LW - 0.5, 0x2e2f33, 19.5, 0.03, 0); K.box(4.5, 0.6, 2.0, 0xc8a878, 12, 0.3, 0.1); K.geo(new THREE.SphereGeometry(1, 8, 5), 0xc8a878, 12, 0.5, 0.1, 0, 0, 0, 2.0, 0.7, 0.9);
    K.box(3.0, 0.8, 2.0, 0x2a2c30, 19, 0.5, 0); K.box(2.2, 1.3, 1.8, 0xf2c31a, 18.8, 1.5, 0); K.box(1.2, 1.2, 1.2, GL, 19.6, 2.0, 0.2); K.box(3.2, 0.3, 0.3, 0xf2c31a, 21.3, 2.6, -0.4, 0, 0, 0.5); K.box(2.4, 0.26, 0.26, 0xf2c31a, 23.2, 2.3, -0.4, 0, 0, -0.9); K.box(0.7, 0.6, 0.7, 0x3a3c40, 24.0, 1.1, -0.4); // the digger
    K.cyl(0.6, 0.6, 1.7, 0x5a5e62, 27.2, 0.6, 0, 14, Math.PI / 2); K.cyl(0.5, 0.5, 1.7, 0x5a5e62, 29.3, 0.5, 0, 14, Math.PI / 2); K.box(1.9, 1.0, 1.5, 0xf2a01a, 28.3, 1.3, 0); K.box(0.9, 0.9, 1.2, GL, 28.6, 2.1, 0); // the wals
    worker(K, 14.6, 0.9, 0.4); worker(K, 16.2, -0.7, -0.8); worker(K, 25.6, 0.8, 1.9);
    const m = K.build(); m.castShadow = true; g.add(m); return g;
  }
  // ---- the motorway: built once, signed and dressed per trip
  function buildStrip() {
    strip = new THREE.Group(); scene.add(strip);
    const K = deps.kit(), cx = X0 + LEN / 2, L = LEN + 120;
    const road = new THREE.Mesh(new THREE.PlaneGeometry(L, SEDGE - NEDGE), deps.roadMat); { const uv = road.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) { uv.setX(i, uv.getX(i) * L / 200); uv.setY(i, uv.getY(i) * 2.2); } }
    road.rotation.x = -Math.PI / 2; road.position.set(cx, 0.02, (NEDGE + SEDGE) / 2); road.receiveShadow = true; strip.add(road);
    // the afrit and the car park: one slab of the same tarmac
    { const slab = new THREE.Mesh(new THREE.PlaneGeometry(EXIT1 - EXIT0 + 6, 1.4), deps.roadMat); slab.rotation.x = -Math.PI / 2; slab.position.set(X0 + (EXIT0 + EXIT1) / 2 + 3, 0.018, SEDGE + 0.5); strip.add(slab); } // the uitvoegstrook is a little wider than the vluchtstrook
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

    // a proper middenberm: a rail on each side, the anti-glare hedge between them, and the far carriageway's own lines
    K.box(L, 0.32, 0.08, 0xb8bcc2, cx, 0.62, NEDGE - 0.9); for (let x = X0 - 48; x < X0 + LEN + 50; x += 4) K.box(0.1, 0.7, 0.1, 0x8a8e94, x, 0.35, NEDGE - 0.84); K.box(L, 0.9, 0.5, 0x3e6a3a, cx, 0.55, NEDGE - 0.3);
    for (const z of [NEDGE - 4.85, NEDGE - 8.15]) for (let x = X0 - 50; x < X0 + LEN + 50; x += 12) K.box(3, 0.01, 0.15, W_, x, 0.035, z); for (const z of [NEDGE - 1.6, NEDGE - 11.4]) K.box(L, 0.01, 0.2, W_, cx, 0.035, z);
    K.box(EXIT0 + 60, 0.02, 2.5, 0x5a5c60, X0 + EXIT0 / 2 - 30, 0.024, SEDGE - 1.3); for (let x = X0 - 40; x < X0 + EXIT0; x += 0.9) K.box(0.3, 0.012, 0.12, 0x3a3c40, x, 0.04, Z0 + LW * 1.5 + 0.35); // the vluchtstrook is a paler tarmac, with a ribbelstrook along the line
    const km = K.build(); if (km) strip.add(km);
    ring = new THREE.Mesh(new THREE.RingGeometry(2.6, 3.1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffc83a, transparent: true, opacity: 0.85, fog: false })); ring.position.set(PARK.x, 0.06, PARK.z); strip.add(ring);
    flash = new THREE.Mesh(new THREE.PlaneGeometry(26, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, fog: false })); flash.position.set(X0 + 520, 0.08, Z0); strip.add(flash);
    // traffic, all going Eddy's way: trucks, a tanker, a container, a caravan and a coach on the right and in the middle, fast cars on the left
    const mk = [() => makeTruck('box', 0), () => makeTruck('tank', 1), () => makeTruck('cont', 2), () => makeTruck('box', 3), makeCaravanCombo, makeCoach];
    for (let i = 0; i < 15; i++) {
      const heavy = i < mk.length, lane = heavy ? (i === 5 ? 0 : 1) : i < 11 ? (i % 2 ? 0 : 1) : -1; let g, half;
      if (heavy) ({ g, half } = mk[i]()); else { g = deps.makeCar({}); half = g.userData.half; tail(g, -half - 0.02, 0.74, [0.55, -0.55], 0.3, 0.12); }
      strip.add(g); cars.push({ g, lane, truck: heavy, half, v: heavy ? (i === 5 ? 25 : i === 4 ? 22 : 21 + (i % 3)) : lane < 0 ? 31 + (i % 3) : lane === 0 ? 26 + (i % 3) : 23, vv: 0 });
    }
    for (let i = 0; i < 8; i++) { const g = farCar(i); g.position.set(X0 + i * 130, 0, NEDGE - 3.2 - (i % 3) * 3.3); strip.add(g); far.push({ g, v: 27 + (i % 4) * 2 }); } // and the other carriageway
    { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c2 = cv.getContext('2d'), gr = c2.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.4)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c2.fillStyle = gr; c2.fillRect(0, 0, 64, 64);
      const glow = new THREE.CanvasTexture(cv), n = Math.ceil(LEN / 45), m4 = new THREE.Matrix4(); // the lamp masts light the road at night: one additive quad a lamp
      lampPool = new THREE.InstancedMesh(new THREE.PlaneGeometry(34, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glow, color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), n);
      for (let i = 0; i < n; i++) { m4.makeTranslation(X0 + 20 + i * 45, 0.07, Z0 - 0.5); lampPool.setMatrixAt(i, m4); } lampPool.visible = false; lampPool.renderOrder = 3; strip.add(lampPool);
      headPool = new THREE.Mesh(new THREE.PlaneGeometry(16, 7).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: glow, color: 0xfff2d0, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); headPool.visible = false; headPool.renderOrder = 3; scene.add(headPool); }
    for (const kind of ['paal', 'paal', 'bus', 'bus']) { const g = kind === 'paal' ? makeFlitspaal() : makeFlitsbus(); strip.add(g); cams.push({ g, kind, x: 0, sol: kind === 'bus' ? deps.solid(0, 0, 0, 0) : null }); }
    // wegwerkzaamheden: one long closure of the right lane, with everything that leads up to it (makeWorks)
    { const g = makeWorks(); strip.add(g); works.push({ g, sol: deps.solid(0, 0, 0, 0), sol2: deps.solid(0, 0, 0, 0) }); }
    for (let i = 0; i < 2; i++) { const g = deps.makeCar({ paint: 0xff7a1a, lampas: true, model: 0 }); strip.add(g); gang.push({ g, on: false, dead: false, v: 0, cool: 0 }); }
    // what the van can't drive through: the guard rail, the grass beyond the vluchtstrook (up to the afrit), the back of the car park, both ends
    for (const s of [deps.solid(X0 - 60, XC - RW2 - 0.6, NEDGE - 1, NEDGE + 0.2), deps.solid(XC + RW2 + 0.6, X0 + LEN + 60, NEDGE - 1, NEDGE + 0.2), deps.solid(X0 - 60, X0 + EXIT0, SEDGE, SEDGE + 30),
      deps.solid(X0 - 8, X0 - 7, NEDGE, SEDGE), deps.solid(X0 + LEN + 20, X0 + LEN + 21, SEDGE, SEDGE + 27), deps.solid(X0 - 60, X0 + EXIT0 - 4, NEDGE - 13.3, NEDGE - 12.7)]) sols.push(s);
    buildRamps();
    pol.build(strip); // the snelweg politie: three Kaasla's, hidden until somebody calls it in
    strip.visible = false; solidsOff(true);
  }
  // ---- the afrit, the viaduct and the oprit on the far side (2026-11-27)
  const lowSols = [], upSols = []; // lowSols: only there when the van is down on the snelweg; upSols: only when it is up on the viaduct
  // a strip along a polyline at the height yOf(x, z) gives: off moves it sideways (+ is to the left of the direction of travel)
  function ribbon(P, w, yOf, mat, y0 = 0.03, off = 0) {
    const n = P.length, pos = new Float32Array(n * 6), uv = new Float32Array(n * 4), idx = []; let d = 0;
    for (let i = 0; i < n; i++) { const [x, z] = P[i], [ax, az] = P[Math.max(0, i - 1)], [bx, bz] = P[Math.min(n - 1, i + 1)], tx = bx - ax, tz = bz - az, l = Math.hypot(tx, tz) || 1, ux = tz / l, uz = -tx / l, y = yOf(x, z) + y0;
      const cx = x + ux * off, cz = z + uz * off; if (i) d += Math.hypot(x - P[i - 1][0], z - P[i - 1][1]);
      pos.set([cx + ux * w / 2, y, cz + uz * w / 2, cx - ux * w / 2, y, cz - uz * w / 2], i * 6); uv.set([d / 200, 0, d / 200, 1], i * 4); if (i) { const a = (i - 1) * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    let up = 0; for (let i = 0; i < g.attributes.normal.count; i++) up += g.attributes.normal.getY(i); if (up < 0) { g.setIndex(idx.map((_, i) => idx[i - (i % 3) + 2 - (i % 3)])); g.computeVertexNormals(); }
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; return m;
  }
  // the bank under a raised road: a flat top a little wider than the road and grass slopes down to the ground (1 : 1.6),
  // left out where skip(x, z) says so (over the snelweg the road is on the viaduct)
  function bank(P, w, yOf, skip) {
    const pos = [], col = [], c1 = new THREE.Color(0x6f9048), c2 = new THREE.Color(0x587a3a);
    const sec = (i) => { const [x, z] = P[i], [ax, az] = P[Math.max(0, i - 1)], [bx, bz] = P[Math.min(P.length - 1, i + 1)], tx = bx - ax, tz = bz - az, l = Math.hypot(tx, tz) || 1, ux = tz / l, uz = -tx / l, y = Math.max(0, yOf(x, z) - 0.04), s = w / 2 + 0.4, o = s + y * 1.6;
      return [[x + ux * o, 0, z + uz * o], [x + ux * s, y, z + uz * s], [x - ux * s, y, z - uz * s], [x - ux * o, 0, z - uz * o]]; };
    for (let i = 0; i < P.length - 1; i++) { if (skip && skip((P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2)) continue; const A = sec(i), Bq = sec(i + 1);
      for (let k = 0; k < 3; k++) { const c = k === 1 ? c1 : c2; for (const v of [A[k], Bq[k], A[k + 1], A[k + 1], Bq[k], Bq[k + 1]]) { pos.push(...v); col.push(c.r, c.g, c.b); } } }
    if (!pos.length) return null;
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = true; return m;
  }
  // a guard rail along a polyline: posts and a rail tilted with the slope, so it follows the road up
  function rail(K, P, yOf, off, from = 0, to = 1) {
    const n = P.length - 1;
    for (let i = Math.floor(n * from); i < Math.ceil(n * to); i++) { const [ax, az] = P[i], [bx, bz] = P[i + 1], l = Math.hypot(bx - ax, bz - az), ux = (bz - az) / l, uz = -(bx - ax) / l, ya = yOf(ax, az), yb = yOf(bx, bz);
      const mx = (ax + bx) / 2 + ux * off, mz = (az + bz) / 2 + uz * off, ry = -Math.atan2(bz - az, bx - ax), rz = Math.atan2(yb - ya, l), y = (ya + yb) / 2;
      K.box(Math.hypot(l, yb - ya) + 0.06, 0.32, 0.07, 0xb8bcc2, mx, y + 0.62, mz, ry, 0, rz); K.box(0.1, 0.72, 0.1, 0x8a8e94, ax + ux * off, ya + 0.36, az + uz * off); }
  }
  function buildRamps() {
    const K = deps.kit(), CON = 0xb4afa4, yS = (x) => rampY(x), roadM = deps.roadMat, lineM = new THREE.MeshLambertMaterial({ color: W_ });
    // the two ramps: tarmac on a grass bank, solid edge lines, a guard rail on both sides
    for (const P of [RAMP_S, RAMP_N]) {
      strip.add(ribbon(P, 4.8, yS, roadM)); const b = bank(P, 4.8, yS); if (b) strip.add(b);
      for (const sd of [-1, 1]) { strip.add(ribbon(P, 0.15, yS, lineM, 0.045, sd * 2.1)); rail(K, P, yS, sd * 2.75, 0.05, 1); }
    }
    // the crossing road as one line from the far side to the town: up on its bank, over both carriageways on the viaduct,
    // and down again to the town in the south (the far end runs down to the polder and is closed off)
    const zTop0 = ZJN - 7, zTop1 = ZJ + 6, deckA = NEDGE - 13.6, deckB = SEDGE + 1.6, zFar = ZJN - 30, zLow = PARK.z + 24;
    const yC = (x, z) => (z < zTop0 ? UP * ss((z - zFar) / (zTop0 - zFar)) : z <= zTop1 ? UP : UP * (1 - ss((z - zTop1) / (ZEND - zTop1))));
    const C = []; for (let z = zFar; z <= zLow + 0.01; z += 2) C.push([XC, z]);
    strip.add(ribbon(C, RW2 * 2, yC, roadM));
    { const b = bank(C, RW2 * 2, yC, (x, z) => z > deckA && z < deckB); if (b) strip.add(b); }
    for (const sd of [-1, 1]) strip.add(ribbon(C, 0.15, yC, lineM, 0.045, sd * (RW2 - 0.35)));
    for (let i = 0; i < C.length - 1; i += 2) { const [, z] = C[i], y = yC(XC, z + 1); K.box(0.15, 0.012, 1.9, W_, XC, y + 0.06, z + 1, 0, Math.atan2(yC(XC, z + 2) - yC(XC, z), 2)); } // the centre line, dashed
    // the viaduct: a concrete deck with edge beams, columns in the middenberm and the verges, abutments where the banks stop
    const dl = deckB - deckA, dz = (deckA + deckB) / 2;
    K.box(RW2 * 2 + 1.0, 0.8, dl, CON, XC, UP - 0.42, dz); for (const sd of [-1, 1]) { K.box(0.5, 1.15, dl, 0xd4d0c6, XC + sd * (RW2 + 0.55), UP - 0.3, dz); K.box(0.52, 0.12, dl, 0x2f6a8a, XC + sd * (RW2 + 0.56), UP - 0.62, dz); }
    for (let k = -2; k <= 2; k++) K.box(0.6, 0.55, dl, 0x9a958c, XC + k * 1.7, UP - 1.08, dz); // the beams under the deck
    for (const pz of [NEDGE - 0.3, deckA + 0.6, deckB - 0.6]) { K.box(RW2 * 2 - 0.6, 0.7, 1.1, CON, XC, UP - 1.6, pz); for (const dx of [-2.6, 2.6]) K.cyl(0.5, 0.55, UP - 1.95, CON, XC + dx, (UP - 1.95) / 2, pz, 12); }
    for (const z of [deckA, deckB]) K.box(RW2 * 2 + 1.6, UP - 0.8, 1.2, 0xa8a398, XC, (UP - 0.8) / 2, z + (z === deckA ? -0.6 : 0.6));
    // railings: a low concrete parapet with a steel rail along the whole raised stretch
    { const top = C.filter(([, z]) => z >= zTop0 - 12 && z <= ZEND); for (const sd of [-1, 1]) rail(K, top, yC, sd * (RW2 + 0.45)); }
    // at J: haaientanden across the end of the afrit, arrows left and right; at JN, the oprit traffic comes off the viaduct and turns left
    for (let v = -2.0; v <= 2.01; v += 0.6) { const s2 = new THREE.Shape(); s2.moveTo(0, -0.24); s2.lineTo(0, 0.24); s2.lineTo(-0.55, 0); s2.closePath(); K.geo(new THREE.ShapeGeometry(s2).rotateX(-Math.PI / 2), W_, XC - RW2 - 0.3, UP + 0.07, ZJ + v); }
    for (const [ax, sd] of [[XC - RW2 - 9, -1], [XC - RW2 - 9, 1]]) { const y = rampY(ax) + 0.07; K.box(2.4, 0.012, 0.3, W_, ax, y, ZJ + 0.9 * sd); K.box(0.3, 0.012, 1.2, W_, ax + 1.05, y, ZJ + 0.9 * sd + 0.6 * sd); } // ← and → painted in the lane
    // the uitvoegstrook's puntstuk and the invoegstrook on the far side, with blokmarkering, tapering into the carriageway
    for (let i = 0; i < 6; i++) K.box(2.4, 0.012, 0.3, W_, RX0 - 4 + i * 1.6, 0.05, SEDGE + 0.6 + i * 0.35, -0.6);
    { const x1 = RX0 + 2, x0 = X0 + EXIT0 - 20, len = x1 - x0, iz = RZN; const strip2 = new THREE.Mesh(new THREE.PlaneGeometry(len, 3.6), roadM); strip2.rotation.x = -Math.PI / 2; strip2.position.set((x0 + x1) / 2, 0.022, iz + 0.3); strip.add(strip2);
      for (let x = x0 + 40; x < x1; x += 4) K.box(2, 0.012, 0.35, W_, x, 0.05, NEDGE - 11.4);
    }
    { const g = new THREE.BufferGeometry(), x0 = X0 + EXIT0 - 20, xT = x0 - 40; g.setAttribute('position', new THREE.Float32BufferAttribute([x0, 0.022, RZN - 1.5, xT, 0.022, NEDGE - 11.4, x0, 0.022, NEDGE - 11.4 + 0.2], 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 0.2, 1, 0, 1], 2)); g.computeVertexNormals(); strip.add(new THREE.Mesh(g, roadM)); }
    const km = K.build(); if (km) { km.castShadow = true; km.receiveShadow = true; strip.add(km); }
    // what keeps the van on the viaduct while it is up there, and what keeps it out of the gap in the middenberm rail while it is down
    for (const sd of [-1, 1]) upSols.push(deps.solid(XC + sd * (RW2 + 0.2), XC + sd * (RW2 + 0.6), deckA - 0.5, deckB + 0.5));
    lowSols.push(deps.solid(XC - RW2 - 0.6, XC + RW2 + 0.6, NEDGE - 1, NEDGE + 0.2));
    for (const q of [...upSols, ...lowSols]) { q.off = true; }
  }
  function setLevel(up) { R.up = up; for (const q of upSols) q.off = !R.active || !up; for (const q of lowSols) q.off = !R.active || up; }
  function solidsOff(off) { if (off) { for (const q of [...upSols, ...lowSols]) q.off = true; } else setLevel(!!R.up); for (const s of sols) s.off = off; for (const w of works) { w.sol.off = off; w.sol2.off = off; } for (const c of cams) if (c.sol) c.sol.off = off; }
  // a blue ANWB sign: lines of [text, size, colour]
  function sign(lines, w, h, x, y, z, ry = -Math.PI / 2, bg = '#14499a') { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), deps.lam({ map: deps.signTex(lines.map(([t, size, color]) => ({ t, size, color: color || '#ffffff' })), bg, '#ffffff', 512, Math.round(512 * h / w)), emissive: bg === '#14499a' ? 0x0a2040 : 0x202020 })); m.position.set(x, y, z); m.rotation.y = ry; scenery.add(m); return m; }
  function gantry(K, x, lines, matrix) { // a steel truss portaal: lattice legs and beam, the blue boards, and a matrix board over each lane
    const zA = NEDGE - 0.6, zB = SEDGE + 0.8, span = zB - zA, zc = (zA + zB) / 2, c = 0x9a9ea6;
    for (const z of [zA, zB]) { for (const dx of [-0.45, 0.45]) K.box(0.16, 7.6, 0.16, c, x + dx, 3.8, z); for (let y = 0.6; y < 7; y += 1.3) K.box(1.0, 0.08, 0.08, c, x, y, z, 0, 0, y % 2.6 < 1.3 ? 0.9 : -0.9); K.box(1.3, 0.3, 0.7, 0x8a8680, x, 0.15, z); }
    for (const y of [6.2, 7.5]) for (const dx of [-0.45, 0.45]) K.box(0.14, 0.14, span, c, x + dx, y, zc); for (let z = zA; z < zB; z += 1.3) K.box(0.08, 1.4, 0.08, c, x - 0.45, 6.85, z, 0, (z / 1.3) % 2 < 1 ? 0.75 : -0.75, 0);
    lines.forEach((ln, i) => { const z = Z0 - LW + i * LW * 1.75; sign(ln, 5.6, 2.2, x - 0.62, 6.5, z); K.box(0.1, 2.3, 5.7, 0x6a6e74, x - 0.55, 6.5, z); });
    (matrix || ['100', '100', '100']).forEach((t, i) => matrixBoard(scenery, K, t, x - 0.55, 8.8, Z0 + (i - 1) * LW, false));
  }
  function turbine(x, z) { const K2 = deps.kit(); K2.cyl(0.7, 1.4, 44, 0xf4f4f0, x, 22, z, 12); K2.box(4.2, 1.8, 1.8, 0xf4f4f0, x + 0.6, 44.6, z); const m = K2.build(); scenery.add(m);
    const hub = new THREE.Group(), kb = deps.kit(); kb.cyl(0.9, 0.9, 1.2, 0xe8e8e4, 0, 0, 0, 10, 0, 0, Math.PI / 2); for (let a = 0; a < 3; a++) { const an = a * Math.PI * 2 / 3; kb.box(0.3, 17, 1.3, 0xf4f4f0, -0.2, Math.cos(an) * 8.5, Math.sin(an) * 8.5, 0, an, 0); }
    hub.add(kb.build()); hub.position.set(x - 1.7, 44.6, z); scenery.add(hub); spinners.push(hub); }
  function dress(key) {
    if (scenery) { strip.remove(scenery); scenery.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material && o.material.map) o.material.map.dispose(); }); }
    scenery = new THREE.Group(); strip.add(scenery); spinners.length = 0;
    const T = R.route, o = R.opts, K = deps.kit(), to = String(o.to); let s = 11 + key.length * 17; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    const gr = new THREE.Mesh(new THREE.PlaneGeometry(LEN + 300, 220), deps.lam({ color: T.ground })); gr.rotation.x = -Math.PI / 2; gr.position.set(X0 + LEN / 2, 0, Z0); gr.receiveShadow = true; scenery.add(gr);
    // the signs: the ring, the knooppunt, the afrit
    gantry(K, X0 + 70, [[['A10', 44, '#ff5a6a'], ['Ring Kaasland', 34]], [[T.a, 44, '#ff5a6a'], [T.via, 34], [to, 30, '#ffe14a']]], ['100', '100', '100']);
    gantry(K, X0 + 170, [[[T.other[0], 44, '#ff5a6a'], [T.other[1], 34], ['↖', 40]], [[T.a, 44, '#ff5a6a'], [`${T.via} · ${to}`, 30], ['↑', 40]]], ['100', '100', '100']);
    gantry(K, X0 + EXIT0 - 150, [[[T.a, 44, '#ff5a6a'], [T.via, 34], ['↑', 40]], [[`afrit ${T.afrit}`, 30, '#ffe14a'], [to, 38], ['600 m ↗', 34]]], ['green', 'green', 'green']);
    sign([[`${T.afrit}`, 30, '#ffe14a'], [to, 40], ['↗', 44]], 4.6, 2.6, X0 + EXIT0 + 6, 3.2, SEDGE + 1.6); for (const dz of [0.6, 2.6]) K.box(0.16, 2.2, 0.16, 0x8a8e94, X0 + EXIT0 + 6.1, 1.1, SEDGE + dz);
    sign([['UIT', 60]], 1.6, 1.0, X0 + EXIT1 + 2, 1.5, Z0 + LW * 1.5 + 1.2); K.box(0.12, 1.2, 0.12, 0x8a8e94, X0 + EXIT1 + 2.1, 0.6, Z0 + LW * 1.5 + 1.2);
    // at the top of the afrit: right to the town, left over the snelweg and back the other way
    sign([['↓ ' + (o.airport ? 'Schiptagat · Kiss & Ride' : to), 34, '#ffe14a'], ['↑ ' + T.a + ' ← terug', 34]], 5.4, 2.0, XC + RW2 + 1.6, UP + 2.6, ZJ, -Math.PI / 2); for (const dz of [-0.9, 0.9]) K.box(0.14, 2.0, 0.14, 0x8a8e94, XC + RW2 + 1.62, UP + 1.0, ZJ + dz);
    sign([[T.a, 40, '#ff5a6a'], ['← oprit · terug', 30]], 3.0, 1.3, XC - RW2 - 2.2, UP + 2.3, ZJN - 4, 0); K.box(0.14, 1.8, 0.14, 0x8a8e94, XC - RW2 - 2.2, UP + 0.9, ZJN - 4.06);
    sign([['P', 70], [o.airport ? 'Kiss & Ride' : to, 30]], 3, 2.2, PARK.x + 6, 2.6, PARK.z - 2, Math.PI); K.box(0.14, 1.6, 0.14, 0x8a8e94, PARK.x + 6, 0.8, PARK.z - 1.9);
    sign([['KNOOPPUNT', 34, '#ffe14a'], ['keren · of naar huis', 28]], 4.6, 1.8, TURN_X + 60, 3.0, NEDGE - 12.8, Math.PI / 2); K.box(0.16, 2.2, 0.16, 0x8a8e94, TURN_X + 60, 1.1, NEDGE - 12.8);
    // the land beside the road
    for (let x = X0 - 30; x < X0 + LEN + 40; ) {
      const w = 8 + rnd() * 10, cx = x + w / 2, far = cx > X0 + EXIT0 - 10, zz = far ? SEDGE + 34 + rnd() * 8 : SEDGE + 7 + rnd() * 10;
      if (far && Math.abs(cx - XC) < w / 2 + 9) { x += w; continue; } // the exit road runs through here
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
    // ---- roadside furniture (2026-11-26): what makes a Dutch snelweg look like one
    for (const [bx, n] of [[X0 + EXIT0 - 300, 3], [X0 + EXIT0 - 200, 2], [X0 + EXIT0 - 100, 1]]) { // afritbakens: three, two, one blue stripe
      K.box(0.1, 1.5, 0.1, 0x8a8e94, bx, 0.75, SEDGE + 1.1); K.box(0.06, 1.5, 0.46, W_, bx - 0.06, 1.9, SEDGE + 1.1); for (let i = 0; i < n; i++) K.box(0.07, 0.2, 0.5, 0x1a4ab8, bx - 0.08, 2.35 - i * 0.42, SEDGE + 1.1, 0, 0.5, 0); }
    for (let x = X0 + 110; x < X0 + EXIT0 - 60; x += 260) { K.box(0.34, 1.5, 0.34, 0xf2c31a, x, 0.75, SEDGE + 1.3); K.box(0.4, 0.3, 0.4, 0x1a4a9a, x, 1.62, SEDGE + 1.3); K.box(0.9, 0.05, 0.9, 0x9a9690, x, 0.03, SEDGE + 1.3); } // praatpalen
    for (const vx of [X0 + 215, X0 + EXIT0 - 60]) { // two viaducts: a deck high over the road, columns in the middenberm and the verge, the embankments, a railing
      const z0 = NEDGE - 20, z1 = SEDGE + 20, zc = (z0 + z1) / 2, zl = z1 - z0;
      K.box(11, 1.1, zl, 0xbdb8ae, vx, 11.3, zc); K.box(11.4, 0.3, zl, 0x9a968e, vx, 11.95, zc); K.box(9, 0.04, zl, 0x4a4c52, vx, 12.12, zc);
      for (const dx of [-5.5, 5.5]) { K.box(0.14, 0.9, zl, 0x6a8a9a, vx + dx, 12.6, zc); for (let z = z0 + 2; z < z1; z += 4) K.box(0.16, 1.0, 0.16, 0x5a6a74, vx + dx, 12.6, z); }
      for (const pz of [NEDGE - 1.1, NEDGE - 11.8, SEDGE + 1.9]) for (const dx of [-3.4, 3.4]) { K.cyl(0.6, 0.6, 10.8, 0xb0aba0, vx + dx, 5.4, pz, 14); K.box(1.8, 0.5, 1.8, 0xa8a398, vx + dx, 10.6, pz); }
      for (const [ez, s] of [[z0, -1], [z1, 1]]) { K.box(11, 1.0, 30, 0x6a8a4a, vx, 5.2, ez + s * 13.6, 0, s * -0.38, 0); K.box(9, 0.05, 30, 0x4a4c52, vx, 5.76, ez + s * 13.6, 0, s * -0.38, 0); }
      for (const [cx2, cz2, cc] of [[vx - 1.6, zc - 6, 0xc8102e], [vx + 1.7, zc + 9, 0xf2e8c8]]) { K.box(1.8, 0.7, 4.2, cc, cx2, 12.6, cz2); K.box(1.6, 0.55, 2.2, GL, cx2, 13.2, cz2 - 0.2); } // somebody crossing over the top
    }
    { const gx = X0 + 150, gz = SEDGE + 15; // a tankstation on the right: Kaasolie, with the shop, the canopy and the price totem
      K.box(46, 0.04, 20, 0x55575c, gx, 0.02, gz); K.box(18, 0.5, 10, W_, gx, 5.2, gz); K.box(18.2, 0.7, 10.2, 0xff8a1c, gx, 4.75, gz); for (const [dx, dz] of [[-7, -3.6], [7, -3.6], [-7, 3.6], [7, 3.6]]) K.cyl(0.22, 0.22, 4.5, 0xd8d4cc, gx + dx, 2.25, gz + dz, 10);
      for (const dx of [-5, 0, 5]) { K.box(1.2, 0.2, 3.2, 0x9a9690, gx + dx, 0.1, gz); for (const dz of [-0.9, 0.9]) { K.box(0.7, 1.5, 0.5, 0xf4f2ec, gx + dx, 0.95, gz + dz); K.box(0.72, 0.4, 0.52, 0xff8a1c, gx + dx, 1.5, gz + dz); K.box(0.5, 0.3, 0.05, GL, gx + dx, 1.15, gz + dz + 0.27); } }
      K.box(14, 3.6, 7, 0xe8e4dc, gx, 1.8, gz + 13); K.box(14.4, 0.5, 7.4, 0xff8a1c, gx, 3.85, gz + 13); K.box(9, 2.2, 0.08, 0x7ab8e8, gx, 1.5, gz + 9.48); K.box(1.6, 2.4, 0.1, 0x3a4a5a, gx + 5.4, 1.2, gz + 9.47);
      K.box(4.2, 0.75, 1.8, 0x2a5a9a, gx - 5, 0.7, gz + 4.2); K.box(2.2, 0.6, 1.6, 0x2a5a9a, gx - 5.2, 1.3, gz + 4.2); K.box(2.0, 0.44, 1.62, GL, gx - 5.2, 1.3, gz + 4.2); // somebody filling up
      K.box(0.5, 7.5, 0.5, 0x8a8e94, gx - 26, 3.75, gz - 6); sign([['KAASOLIE', 56, '#ffffff'], ['Euro95  1.98', 34, '#ffe14a'], ['Diesel  1.79', 34, '#ffe14a'], ['Koffie  W 2', 30]], 3.4, 4.4, gx - 26.3, 6.2, gz - 6, -Math.PI / 2, '#d86a10');
      sign([['KAASOLIE', 80, '#ffffff']], 9, 1.4, gx, 4.75, gz - 5.12, Math.PI, '#ff8a1c'); sign([['Tanken · Shop · WC', 40]], 5, 0.9, gx - 30, 2.4, SEDGE + 3.2); K.box(0.14, 2.0, 0.14, 0x8a8e94, gx - 29.9, 1.0, SEDGE + 3.2); }
    // the verge on the right: a sloot, and a row of trees that suits the land
    K.box(EXIT0 + 20, 0.03, 1.5, 0x35606a, X0 + EXIT0 / 2 - 20, 0.02, SEDGE + 3.6); K.box(EXIT0 + 20, 0.02, 0.5, 0x5a7a44, X0 + EXIT0 / 2 - 20, 0.04, SEDGE + 2.7);
    if (T.props !== 'sand' && T.props !== 'docks') for (let x = X0 - 20, i = 0; x < X0 + EXIT0 - 20; x += 13, i++) { if (Math.abs(x - (X0 + 150)) < 30 || Math.abs(x - (X0 + 215)) < 9) continue; const h = 9 + (i % 3) * 1.5, z = SEDGE + 5.6; K.cyl(0.16, 0.24, h * 0.45, 0x5e4a36, x, h * 0.22, z, 7);
      if (T.props === 'air' || T.props === 'polder') K.cyl(0.25, 1.25, h, [0x4f7a34, 0x5f8a3c, 0x46703a][i % 3], x, h * 0.62, z, 8); else K.geo(new THREE.SphereGeometry(1, 8, 6), [0x4f7a34, 0x5f8a3c, 0x46703a][i % 3], x, h * 0.62, z, 0, i, 0, 2.6, h * 0.36, 2.6); } // poplars by the polder, plane trees in town
    // far away: what tells you where you are
    if (T.props === 'brick' || T.props === 'hip') for (let x = X0 - 60, i = 0; x < X0 + LEN + 80; x += 22 + rnd() * 16, i++) { const h = 16 + rnd() * 30, w = 12 + rnd() * 10, z = SEDGE + 78 + rnd() * 24, c = T.props === 'hip' ? [0xe8d8c8, 0xd8c8e0, 0xc8e0d8, 0xf0d8a8][i % 4] : [0x8a7a70, 0x9a8a7a, 0x6a6a72, 0xa89a88][i % 4]; K.box(w, h, 12, c, x, h / 2, z); for (let wy = 3; wy < h - 2; wy += 3.4) K.box(w - 2, 1.3, 0.1, 0xf2e6c0, x, wy, z - 6.03); }
    if (T.props === 'docks') for (let x = X0 + 40; x < X0 + LEN; x += 120) { const z = SEDGE + 70; K.box(1.4, 40, 1.4, 0xf2c31a, x - 7, 20, z); K.box(1.4, 40, 1.4, 0xf2c31a, x + 7, 20, z); K.box(16, 1.6, 2, 0xf2c31a, x, 40, z); K.box(2, 1.6, 46, 0xf2c31a, x, 41.6, z - 12, 0, 0.14, 0); K.box(4, 3, 4, 0xe8e4dc, x, 37.6, z - 8); K.box(60, 14, 16, [0x2a3a5a, 0x5a2a2a, 0x2a4a3a][Math.round(x) % 3], x + 30, 7, z + 26); } // gantry cranes and a ship behind them
    if (T.props === 'sand') { K.cyl(1.6, 2.4, 22, 0xf4f2ec, X0 + EXIT0 - 80, 11, SEDGE + 80, 12); for (const y of [5, 11, 17]) K.cyl(2.0, 2.2, 2.2, 0xc8102e, X0 + EXIT0 - 80, y, SEDGE + 80, 12); K.cyl(1.2, 1.9, 2.6, 0x2a2e34, X0 + EXIT0 - 80, 23.3, SEDGE + 80, 10); } // the vuurtoren of De Zandwijk
    if (T.props === 'polder') for (let x = X0 + 60, i = 0; x < X0 + LEN; x += 70 + rnd() * 40, i++) { const w = 30 + rnd() * 26, z = SEDGE + 70 + rnd() * 20, c = [0xd8d4ca, 0xc8ccd0, 0xe2dccc, 0xb8c0c4][i % 4]; K.box(w, 7 + rnd() * 3, 22, c, x, 4, z); K.box(w + 0.4, 0.4, 22.4, [0x2a5a9a, 0x8a8e94, 0xc8402a][i % 3], x, 8.3, z); K.box(w * 0.3, 3, 0.1, 0x3a4a5a, x - w * 0.2, 1.5, z - 11.05); } // Almere: flat XXL halls on the bedrijventerreinen, and the IJmeer glinting behind
    if (T.props === 'polder') K.box(LEN + 200, 0.05, 60, 0x5a8aa0, X0 + LEN / 2, 0.03, SEDGE + 130);
    if (T.props === 'air' || T.props === 'sand' || T.props === 'docks' || T.props === 'polder') for (const [tx, tz] of [[X0 + 200, SEDGE + 60], [X0 + 430, SEDGE + 78], [X0 + 640, SEDGE + 64]]) turbine(tx, tz); // wind turbines, turning
    // sound barriers behind the far carriageway, and lamp masts in the middenberm
    for (let x = X0 - 40, i = 0; x < X0 + EXIT0 - 12; x += 8, i++) K.box(7.8, 3.6, 0.3, i % 2 ? 0x5a8a6a : 0x4a7a5a, x + 4, 1.8, NEDGE - 13);
    for (let x = X0 + 20; x < X0 + LEN; x += 45) { K.cyl(0.1, 0.18, 12, 0x8a8e94, x, 6, NEDGE - 0.6, 8); for (const s of [1, -1]) { K.box(0.2, 0.12, 3.6, 0x8a8e94, x, 11.9, NEDGE - 0.6 + s * 1.7, 0, s * -0.12, 0); K.box(0.5, 0.12, 0.9, 0xfff4d0, x, 11.95, NEDGE - 0.6 + s * 3.5); } } // double-armed masts, one arm over each carriageway
    const m = K.build(); if (m) { m.castShadow = true; m.receiveShadow = true; scenery.add(m); }
  }
  function layout() { // a different motorway every trip: where the works are and how the traffic is spread
    const o = R.opts; let s = ((state.raids | 0) * 7 + (deps.day ? deps.day() : 1) * 13 + String(o.to).length) % 2147483647 || 3; const rnd = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
    works.forEach((w) => { const x = X0 + 470 + rnd() * 16, z = Z0 + LW; w.g.position.set(x, 0, z); box2(w.sol, x + 18.5, z, 14.5, 1.5); box2(w.sol2, x + 0.4, z, 4.2, 1.2); w.sol.off = w.sol2.off = false; });
    cars.forEach((c) => { c.g.position.set(X0 + 60 + rnd() * (LEN - 200), 0, Z0 + c.lane * LW); c.g.rotation.y = 0; c.wreck = false; c.vv = c.v; });
    gang.forEach((g) => { g.on = false; g.dead = false; g.g.visible = false; if (g.g.userData.paint) g.g.userData.paint.color.setHex(0xff7a1a); });
    flash.material.opacity = 0;
    const cx = [X0 + 270 + rnd() * 30, X0 + 560 + rnd() * 30, X0 + 90 + rnd() * 30, X0 + 640 + rnd() * 40]; // two palen, two flitsbussen
    cams.forEach((c, i) => { c.x = cx[i]; c.seen = c.done = c.honked = false; if (c.kind === 'paal') c.g.position.set(c.x, 0, SEDGE + 1.0); else { c.g.position.set(c.x, 0, SEDGE - 1.25); box2(c.sol, c.x - 0.6, SEDGE - 1.25, 3.4, 1.0); c.sol.off = false; } });
    far.forEach((f, i) => { f.g.position.x = X0 + i * 130 + rnd() * 60; });
    pol.reset(); pol.park(rnd() < 0.55 ? X0 + 330 + rnd() * 240 : 0); // some days a patrol car waits on the vluchtstrook with a speed gun
  }

  // ---- start
  function start(o) {
    if (R.active || (deps.blockedStart && deps.blockedStart())) return false;
    if (!strip) buildStrip();
    if (!van) { van = deps.makeVan(); van.visible = false; scene.add(van); veh = deps.fiets.adopt(van, { kind: 'car', name: 'Oofmobiel', own: true, quiet: true, half: 2.5, width: 2.0, locked: () => R.active && !R.over, k: { vmax: 19, acc: 7, brake: 16, rev: -5, turn: 1.5, grip: 4.5, r: 1.0, nose: 1.9 } }); }
    R.opts = o; R.route = o.airport ? ROUTES.air : ROUTES[o.theme] || ROUTES.lampas;
    Object.assign(R, { active: true, phase: 'street', t: 0, hp: 100, bumped: 0, wrecked: 0, smart: 0, bonus: 0, ambush: 0, over: false, hard: 0, lim: false, parkWarn: false });
    vBase = Math.max(15, ((o.van && o.van.maxV) || 26) * 0.72); Object.assign(veh.k, { vmax: vBase, acc: 7, turn: 1.5, grip: 4.5 }); veh.gripMul = Math.max(0.35, o.grip || 1);
    johanCue = o.johan || null;
    fadeTo(() => {
      deps.oof.visible = false; deps.oofSolid.off = true; van.visible = true;
      van.position.copy(deps.oof.position); van.rotation.copy(deps.oof.rotation);
      deps.fiets.mount(veh); document.body.classList.add('ritting'); hudEl.style.display = 'block'; crashT = 0;
      { const hint = document.querySelector('#fts .hint'); if (hint) hint.innerHTML = '<b>W</b> gas · <b>S</b> remmen / achteruit · <b>A</b><b>D</b> sturen · <b>H</b> claxon'; }
      const B = deps.buurt(); if (B) B.setPoint(deps.exit.x, deps.exit.z, 'oprit A10');
      if (!o.skipStreet) deps.toast(`${o.from} → ${o.to}`, `Pull out and drive <b>east</b> down the street to the oprit of the <b>A10</b>, ${R.route.a === 'A10' ? '' : `then the <b>${R.route.a}</b>, `}afrit ${R.route.afrit}.${o.mission ? ' ' + o.mission : ''}`, 4.8);
      deps.snapCam(); ev('start', { to: o.to });
      if (o.skipStreet) enterRing(); // from another district: straight onto the snelweg (js/wijk.js)
    });
    return true;
  }
  function toRing() { R.phase = 'fade'; fadeTo(enterRing); }
  function enterRing() {
    {
      const o = R.opts; dress(o.airport ? 'air' : o.theme || 'lampas'); layout(); strip.visible = true; solidsOff(false);
      Object.assign(veh.k, { vmax: hwTop(), acc: o.van && o.van.turbo ? 14 : 9, turn: 0.95, grip: 9 }); // the motorway: top gear, and steering that changes lanes instead of spinning the van
      veh.B.x = X0 + 4; veh.B.z = Z0 + LW; veh.B.h = Math.PI / 2; veh.B.v = 18; van.position.set(veh.B.x, 0, veh.B.z);
      deps.setBounds({ x0: X0 - 6, x1: X0 + LEN + 19, z0: ZJN - 6, z1: PARK.z + 4 }); R.up = false; R.west = false; R.asking = false; setLevel(false);
      const B = deps.buurt(); if (B) B.setPoint(PARK.x, PARK.z, o.to);
      R.phase = 'ring'; deps.snapCam();
      deps.toast(R.route.a === 'A10' ? 'A10 RING' : `A10 → ${R.route.a}`, `${o.to}: afrit ${R.route.afrit}, on the right at the end. Up the ramp, then right for the town (left takes you over the snelweg and back). Trucks keep right, the works close a lane, and there is a flitspaal at 120.`, 4);
    }
  }
  // the motorway top speed: the van's own, up to the begrenzer at 155; Mo's turbo takes it out and adds a lot (js/garage.js)
  function hwTop() { const o = R.opts, own = vBase * 1.6; return o.van && o.van.turbo ? Math.min(TURBO_MAX, Math.max(TURBO_MIN, own + 10)) : Math.min(BEGRENZER / 0.95, own); }
  function damage(n) { if (R.over) return; n *= (R.opts.van && R.opts.van.dmg) || 1; R.hp = Math.max(0, R.hp - n); if (R.hp <= 0) finish(false, 'OOFMOBIEL KAPOT', 'The van gave up. Freddy Sr. would have had words.'); }
  function crash(speed) { if (!R.active || R.over || R.t - crashT < 0.7) return; crashT = R.t; if (speed > 9) ev('crash'); damage(Math.max(0, speed - 5) * (R.phase === 'ring' ? 0.9 : 1.3)); } // a scrape costs little, a wall at speed a lot
  function honked() { // Eddy's claxon: at a flitser within earshot it is worth something
    if (!R.active || R.over || R.phase !== 'ring' || !veh) return; const B = veh.B;
    for (const c of cams) if (!c.honked && c.x - B.x < 110 && c.x - B.x > -50) { c.honked = true; const b = c.kind === 'bus' ? 30 : 15; R.bonus += b; rant('honk', `+W ${b} claxonbonus`); deps.beep(1047, 0.1, 'triangle', 0.05); if (deps.onHonk) deps.onHonk(c.kind);
      if (c.kind === 'bus' && Math.random() < 0.25) setTimeout(() => { if (R.active && !R.over && R.phase === 'ring') pol.trigger('honk', polInfo()); }, 1400); // two agents in the flitsbus did not find it funny
      return; }
  }
  function giveUp() { if (!R.active || R.over) return; deps.choice('Eddy Jr.', 'Turn the Oofmobiel round and go home? The trip is lost.', ['Omkeren', 'Keep driving'], (i) => { if (i === 0) finish(false, 'OMGEKEERD', 'Back to the warehouse.'); }); }
  function finish(arrived, title, sub) {
    if (R.over) return; R.over = true;
    const o = R.opts, pay = !arrived ? 0 : o.noPay ? (R.bonus | 0) - R.smart : Math.max(0, BASE_PAY + R.wrecked * BOUNTY + Math.max(0, Math.round((PAR - R.t) * 3)) - R.smart) + (R.bonus | 0);
    if (arrived) { ev('arrive', { t: R.t, par: PAR, bumped: R.bumped, dents: Math.round(100 - R.hp) }); deps.beep(523, 0.15, 'triangle', 0.06); setTimeout(() => deps.beep(784, 0.3, 'triangle', 0.06), 160); }
    else { ev('fail', { title }); deps.beep(160, 0.3, 'sawtooth', 0.06); }
    deps.toast(arrived ? 'AANGEKOMEN!' : title, arrived ? `${o.to} in ${fmtT(R.t)} (par ${fmtT(PAR)}). ${o.noPay ? (o.arrived || '') : `Fee W ${BASE_PAY}${R.wrecked ? ` · ${R.wrecked} wrecked +W ${R.wrecked * BOUNTY}` : ''}${R.smart ? ` · boetes −W ${R.smart}` : ''}${R.bonus ? ` · claxonbonus +W ${R.bonus}` : ''} · total W ${pay}.`}` : sub, 4.5);
    const res = { arrived, pay, time: R.t, wrecked: R.wrecked, bumped: R.bumped };
    setTimeout(() => fadeTo(() => { stop(); if (o.onDone) o.onDone(res); }), arrived ? 900 : 1400);
  }
  function stop() { // everything back where it was: the van on its parking, Eddy next to it
    if (!R.active) return;
    R.active = false; R.phase = null; hudEl.style.display = 'none'; document.body.classList.remove('ritting');
    if (deps.fiets.current === veh) { veh.locked = () => false; deps.fiets.dismount(); veh.locked = () => R.active && !R.over; }
    van.visible = false; rantEl.style.display = 'none'; if (headPool) headPool.visible = false; pol.reset();
    if (strip) { strip.visible = false; solidsOff(true); }
    deps.setBounds(null); const B = deps.buurt(); if (B) B.clearRoute();
    deps.oof.visible = true; deps.oofSolid.off = false;
    player.visible = true; player.position.set(deps.oof.position.x + 1.9, 0, deps.oof.position.z + 2.2); player.rotation.set(0, 0, 0); deps.snapCam();
  }

  // ---- per frame
  const hitBox = (ax, az, ahx, ahz, bx, bz, bhx, bhz) => Math.abs(ax - bx) < ahx + bhx && Math.abs(az - bz) < ahz + bhz;
  function update(dt) {
    if (!R.active || R.over || R.phase === 'fade' || !veh || deps.fiets.current !== veh) return;
    if (!state.inDialogue && !state.inPC) R.t += dt; // the run clock stops while someone is talking (Johan) or the PC is open
    const B = veh.B, sp = Math.abs(B.v);
    { const n = deps.nightK ? deps.nightK() : 0; headPool.visible = n > 0.3; if (headPool.visible) { headPool.position.set(B.x + Math.sin(B.h) * 9, 0.09, B.z + Math.cos(B.h) * 9); headPool.rotation.y = B.h - Math.PI / 2; } } // the van's headlights on the road
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
      if (c.lane === 1) { let tz = Z0 + LW; for (const w of works) { const d = w.g.position.x - p.x; if (d > -40 && d < 110) tz = Z0; } p.z += (tz - p.z) * Math.min(1, dt * 1.5); } // round the works and back
      if (!R.up && Math.abs(B.z - p.z) < 1.6 && B.x > p.x && B.x - p.x < c.half + 2.6 + 10) want = Math.min(want, B.v - 1); // and for Eddy
      for (const u of pol.units) if (u.mode !== 'off' && Math.abs(u.g.position.z - p.z) < 1.6 && u.g.position.x > p.x && u.g.position.x - p.x < c.half + u.half + 12) want = Math.min(want, u.v - 1); // and for the politie
      c.vv += Math.max(-14 * dt, Math.min(4 * dt, Math.max(0, want) - c.vv)); p.x += c.vv * dt;
      if (p.x < B.x - 150) { p.x = B.x + 210 + Math.random() * 60; p.z = Z0 + c.lane * LW; } else if (p.x > B.x + 290) { const nx = B.x - 120 - Math.random() * 20; p.x = pol.units.some((u) => u.mode !== 'off' && Math.abs(u.g.position.x - nx) < 45) ? B.x + 210 + Math.random() * 60 : nx; p.z = Z0 + c.lane * LW; } // never drop a car on top of a police car
      if (!R.up && hitBox(p.x, p.z, c.half, 1.0, B.x, B.z, 2.3, 1.0)) { // a touch: what counts is the difference in speed
        const rel = Math.abs(B.v - c.vv), behind = B.x < p.x;
        if (rel > 2 && R.t - crashT > 0.6) { crashT = R.t; if (rel > 8) ev('crash'); damage((rel - 2) * 1.6); deps.beep(70, 0.14, 'sawtooth', 0.06);
          if (rel > 10 && !R.over && ((R.hard = (R.hard | 0) + 1) >= 2 || pol.on)) pol.trigger('hit', polInfo()); } // twice into somebody at speed: they call it in
        if (Math.abs(B.z - p.z) > 1.2) B.z += Math.sign(B.z - p.z) * 6 * dt; else if (behind) { B.v = Math.min(B.v, c.vv - 1.5); B.x = Math.min(B.x, p.x - c.half - 2.35); } else { c.vv = Math.min(c.vv, B.v - 1.5); p.x = Math.min(p.x, B.x - c.half - 2.35); }
      }
    }
    // the flitsers: Eddy sees one and says so; too fast past it and it flashes
    for (const c of cams) { const d = c.x - B.x;
      if (!c.seen && d > 0 && d < 140) { c.seen = true; rant('see'); }
      if (!c.done && d < 0) { c.done = true; if (sp > FLITS) { const fine = c.kind === 'bus' ? FINE + 15 : FINE; R.smart += fine; R.bumped++; flash.position.x = c.x; flash.material.opacity = 0.9; deps.toast('FLITS!', `${Math.round(sp * 3.6)} km/u where 120 is allowed. −W ${fine}, and a photo of you looking guilty.`, 2.6); deps.beep(1400, 0.05, 'square', 0.05);
        if (!pol.on && (sp > 140 / 3.6 || Math.random() < 0.3)) setTimeout(() => { if (R.active && !R.over && R.phase === 'ring') pol.trigger('flits', polInfo()); }, 1200); } } } // far too fast, or a patrol car happened to be near
    if (flash.material.opacity > 0) flash.material.opacity = Math.max(0, flash.material.opacity - dt * 4);
    if (rantT > 0 && (rantT -= dt) <= 0) rantEl.style.display = 'none';
    { const vx = B.v * Math.sin(B.h); // Eddy's speed along x (negative: driving west, the way the far carriageway goes)
      for (const f of far) { const q = f.g.position; let v = f.v;
        if (R.west && !R.up && Math.abs(q.z - B.z) < 1.7 && q.x > B.x && q.x - B.x < 16) v = Math.min(v, Math.max(0, -vx - 1));
        f.vv = (f.vv ?? f.v) + Math.max(-14 * dt, Math.min(4 * dt, v - (f.vv ?? f.v))); q.x -= f.vv * dt;
        if (R.west && !R.up && hitBox(q.x, q.z, 2.2, 1.0, B.x, B.z, 2.3, 1.0)) { const rel = Math.abs(-vx - f.vv); if (rel > 2 && R.t - crashT > 0.6) { crashT = R.t; damage((rel - 2) * 1.6); deps.beep(70, 0.14, 'sawtooth', 0.06); } q.x = Math.max(q.x, B.x + 4.6); f.vv = Math.min(f.vv, Math.max(0, -vx)); }
        if (q.x < B.x - 160) { q.x = B.x + 330 + Math.random() * 120; f.vv = f.v; } else if (q.x > B.x + 520) q.x = B.x + 300; } }
    for (const h of spinners) h.rotation.x += dt * 1.1;
    { const on = Math.floor(R.t * 2.2) % 2 === 0; for (const q of blinkA) q.visible = on; for (const q of blinkB) q.visible = !on; } // amber, left right left right
    { const n = deps.nightK ? deps.nightK() : 0; lampPool.visible = n > 0.05; lampPool.material.opacity = 0.5 * n; }
    // the gang: past half-way two of their cars come up from behind and ram
    const o = R.opts;
    if (!R.ambush && B.x > X0 + LEN * 0.42) {
      if (o.noPay || o.airport || (o.van && o.van.tint)) R.ambush = 2; // nobody is after a man fetching his father, and tinted windows hide the rest
      else { R.ambush = 1; ev('ambush'); gang.forEach((g, i) => { g.on = true; g.dead = false; g.v = sp + 3; g.cool = 0; g.g.visible = true; g.g.position.set(B.x - 40 - i * 14, 0, Z0 + (i ? -LW : LW)); g.g.rotation.y = 0; });
        deps.toast('HINDERLAAG!', `The ${R.route.gang || 'Lampas'} are on your bumper. Lead them into the roadworks or the back of a truck.`, 3.4); deps.beep(880, 0.1, 'square', 0.05); }
    }
    for (const g of gang) {
      if (!g.on || g.dead) continue; const p = g.g.position;
      if (pol.on) { g.v += (14 - g.v) * Math.min(1, dt * 1.2); p.x += g.v * dt; p.z += (SEDGE - 1.3 - p.z) * Math.min(1, dt); if (p.x < B.x - 80) { g.on = false; g.g.visible = false; } continue; } // blue lights: the gang lets go and takes the vluchtstrook
      if (g.cool > 0) { g.cool -= dt; g.v += (Math.max(6, sp - 5) - g.v) * Math.min(1, dt * 2); } else g.v += (Math.min(veh.k.vmax + 3, sp + 7) - g.v) * Math.min(1, dt * 1.5);
      p.x += g.v * dt; p.z += (B.z - p.z) * Math.min(1, dt * 0.9);
      const hitWork = works.some((w) => hitBox(p.x, p.z, 2.1, 0.9, w.g.position.x + 18.5, w.g.position.z, 14.5, 1.4) || hitBox(p.x, p.z, 2.1, 0.9, w.g.position.x + 0.4, w.g.position.z, 4.2, 1.2)), hitCar = cars.find((c) => !c.wreck && hitBox(p.x, p.z, 2.1, 0.9, c.g.position.x, c.g.position.z, c.half, 1.0) && g.v - c.vv > 4);
      if (hitWork || hitCar) { g.dead = true; if (g.g.userData.paint) g.g.userData.paint.color.setHex(0x3a2a20); R.wrecked++; ev('wreck'); deps.toast('WRAK!', `One of theirs is done. +W ${BOUNTY}.`, 1.8); deps.beep(90, 0.3, 'sawtooth', 0.07);
        if (!pol.on && Math.random() < 0.5) setTimeout(() => { if (R.active && !R.over && R.phase === 'ring') pol.trigger('wreck', polInfo()); }, 1800); continue; } // a wreck on the A10 brings blue lights
      if (!R.up && hitBox(p.x, p.z, 2.1, 0.9, B.x, B.z, 2.3, 1.0)) { damage(8); ev('crash'); B.v = Math.min(veh.k.vmax, B.v + 2.5); g.cool = 2.4; p.x -= 5; deps.beep(70, 0.16, 'sawtooth', 0.06); }
      if (p.x < B.x - 90) p.x = B.x - 50;
    }
    // the snelweg politie: chasing, debating, arresting
    pol.update(dt, { B, cars, works, info: polInfo(), damage, arrest: (fine, stars) => { if (deps.onPolice) try { deps.onPolice('arrest', { fine, stars }); } catch (e) { console.error(e); }
      finish(false, 'OPGEPAKT', `The snelweg politie pulls you off the ${R.route.a}. Fine W ${fine}, and the trip is over.`); } });
    if (R.over) return;
    if (!R.lim && !(o.van && o.van.turbo) && vBase * 1.6 > BEGRENZER && sp > BEGRENZER - 1.5) { R.lim = true; deps.toast('BEGRENZER', "155 km/u and the Oofmobiel won't give more: the speed limiter. Garage Mo knows a guy with a turbo.", 3.4); }
    // the afrit: slow down for the car park, or miss it and come back
    if ((B.z > SEDGE + 1 || B.z < NEDGE - 12.5 || R.up) && veh.k.vmax > vBase) Object.assign(veh.k, { vmax: vBase, turn: 1.5, grip: 4.5 });
    // up or down: on a ramp or the crossing road outside the snelweg it is up; on the snelweg away from the viaduct it is down;
    // under or over the viaduct it stays what it was, so the van never pops from one level to the other
    { const inBand = B.z > NEDGE - 12.5 && B.z < SEDGE + 0.5, inCorr = Math.abs(B.x - XC) < RW2 + 0.8 && B.z > ZJN - 8 && B.z < ZEND + 2;
      const onRamp = (B.z > SEDGE + 0.5 && nearRamp(RAMP_S, B.x, B.z, 3.2) && B.x > RX0 + 4) || (B.z < NEDGE - 12.5 && nearRamp(RAMP_N, B.x, B.z, 3.2) && B.x > RX0 + 4);
      const up = inBand ? (inCorr ? R.up : false) : (onRamp || inCorr);
      if (up !== R.up) setLevel(up);
      const y = !R.up ? 0 : inCorr ? (B.z <= ZJ + 6 ? UP : UP * (1 - ss((B.z - ZJ - 6) / (ZEND - ZJ - 6)))) : rampY(B.x);
      van.position.y = y; van.rotation.x = 0;
      if (!R.west && B.z < NEDGE - 1 && !R.up) { R.west = true; deps.toast('DE ANDERE KANT OP', `Back the other way on the ${R.route.a}. At the knooppunt you can turn round, or call it a day and go home.`, 3.6); const Bu = deps.buurt(); if (Bu) Bu.setPoint(TURN_X, NEDGE - 6.5, 'knooppunt'); }
      if (R.west && B.z > NEDGE + 0.5) { R.west = false; const Bu = deps.buurt(); if (Bu) Bu.setPoint(PARK.x, PARK.z, o.to); }
      if (R.west && !R.asking && B.x < TURN_X) { R.asking = true; B.v = 0;
        deps.choice('Knooppunt', `${R.route.a}, the other way. Turn round and try afrit ${R.route.afrit} again, or give up and drive home?`, [`Turn round to ${o.to}`, 'Go home'], (i) => {
          if (i === 1) { finish(false, 'OMGEKEERD', `You turned round and drove home. ${o.to} will have to wait.`); return; }
          fadeTo(() => { R.t += 15; R.west = false; R.asking = false; setLevel(false); B.x = X0 + EXIT0 - 300; B.z = Z0 + LW; B.h = Math.PI / 2; B.v = 18; Object.assign(veh.k, { vmax: hwTop(), turn: 0.95, grip: 9 }); pol.shift(B.x - TURN_X); const Bu = deps.buurt(); if (Bu) Bu.setPoint(PARK.x, PARK.z, o.to); deps.toast('GEKEERD', `Round the knooppunt and back on the ${R.route.a}: 15 seconds. Afrit ${R.route.afrit}, on the right.`, 3); deps.snapCam(); }); }); }
      if (R.west && veh.k.vmax < hwTop() && B.z > NEDGE - 12 && B.z < NEDGE - 1) Object.assign(veh.k, { vmax: hwTop(), turn: 0.95, grip: 9 }); // back on a carriageway: top gear again
    }
    if (B.x > X0 + LEN + 12 && B.z < SEDGE) { R.t += 25; pol.shift(X0 + EXIT0 - 260 - B.x); B.x = X0 + EXIT0 - 260; if (!pol.on) { B.z = Z0 + LW; B.v = 20; } deps.toast('AFRIT GEMIST', `That was afrit ${R.route.afrit}. The next one and back: 25 seconds gone.`, 3); deps.snapCam(); }
    ring.material.opacity = 0.6 + Math.sin(R.t * 5) * 0.25;
    if (Math.hypot(B.x - PARK.x, B.z - PARK.z) < 4.2 && sp < 9) { if (!pol.close(B)) { finish(true); return; } if (!R.parkWarn) { R.parkWarn = true; deps.toast('NIET NU', 'Park with the politie right behind you? Shake them off first.', 2.6); } }
    hud();
  }
  return { RAMP: { XC, ZJ, ZJN, UP, TURN_X, RX0, RZS, RZN }, pol, traffic: cars, honked, cams, start, stop, update, crash, giveUp, get active() { return R.active; }, get phase() { return R.phase; }, get run() { return R; }, vehicle: () => veh, X0, Z0, LEN, PAR, PARK, ROUTES };
}
