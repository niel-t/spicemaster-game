// Dutch bikes (2026-11-20). Two parts:
//  · makeBikeModel(): the street's bikes rebuilt with real bike parts: round tubes, tyres on silver rims with wire spokes,
//    mudguards, chain guards, rear racks, wicker baskets and fruit crates, dynamo lamps, sprung leather saddles, upright
//    "omafiets" handlebars and a crank that turns. Kinds (same numbers main.js always used): 0 omafiets (step-through),
//    1 tricycle, 2 vierfiets, 3 tall bike, 4 bakfiets with a Gouda, 5 mini bike, 6 penny-farthing, 7 double-decker,
//    8 extra-tall, 9 stacked four, 10 opafiets (diamond frame, front crate), 11 transportfiets (big front carrier).
//    Local axes: +X forward, +Y up, Z sideways. userData: seats [[x, y, pose]], len (half length), wheels (spin on Z), crank.
//  · createFiets(): Eddy's own paprika-red omafiets outside the warehouse. Ride it like the van: W pedals, S brakes and
//    then walks it back, A/D steer, Shift stands up on the pedals; phone: TRAP / REM pedals and the steering bar from the
//    van drive, a BEL and AFSTAPPEN; controller: RT / LT and the left stick. E (or AFSTAPPEN) gets off, H (or BEL) rings.
//    The HUD follows the Lettertype setting: glass and gel under Aero, the brown van-drive pedals under Klassiek.
import { IS_PHONE } from './mobile.js';
import { mergeStatic } from './richtex.js';

// spice palette frames: saffron, paprika, cumin, cardamom, cream, turmeric, cinnamon, clove, nigella black
export const BIKE_PAINT = [0x1c1a18, 0xc8402a, 0xe8a33d, 0x6f8f4a, 0xefe3c8, 0xd8a420, 0x9a5a32, 0x5a2a1e, 0x2f4a5a];

const cache = {};
function mats(THREE) {
  if (cache.m) return cache.m;
  const L = (o) => new THREE.MeshLambertMaterial(o), S = (o) => new THREE.MeshStandardMaterial(o);
  cache.m = {
    tyre: L({ color: 0x141414 }), rim: S({ color: 0xc8ccd2, metalness: 0.8, roughness: 0.3 }), chrome: S({ color: 0xd8dce2, metalness: 0.9, roughness: 0.22 }),
    spoke: new THREE.LineBasicMaterial({ color: 0x9aa0a8, transparent: true, opacity: 0.85 }), black: L({ color: 0x1a1a1a }), leather: L({ color: 0x5a3418 }),
    wicker: L({ color: 0xc89a58 }), crate: L({ color: 0xb8864a }), wood: L({ color: 0x8a5a2a }), lamp: L({ color: 0xfff2c0, emissive: 0x8a6a20 }), red: L({ color: 0xc8102e, emissive: 0x400000 }),
    gouda: L({ color: 0xf2c43a }), rind: L({ color: 0xd8902a }),
  };
  return cache.m;
}
const paint = (THREE, c) => (cache['p' + c] || (cache['p' + c] = new THREE.MeshStandardMaterial({ color: c, metalness: 0.35, roughness: 0.42 })));
function spokeGeo(THREE, r) { // 18 wire spokes, hub to rim, crossing like a real wheel
  const k = 's' + r; if (cache[k]) return cache[k];
  const pts = [], n = 18, hub = 0.045;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2, b = a + (i % 2 ? 0.5 : -0.5); pts.push(Math.cos(a) * hub, Math.sin(a) * hub, (i % 2 ? 0.02 : -0.02), Math.cos(b) * (r - 0.04), Math.sin(b) * (r - 0.04), 0); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return (cache[k] = g);
}
const geo = (THREE, key, make) => cache[key] || (cache[key] = make());

// phones: a bike is ~40 thin parts and the street has dozens, so they skip the shadow pass there (it was most of the draw calls)
const BIKE_SHADOW = !IS_PHONE;
export function makeBikeModel(THREE, kind = 0, color = 0x1c1a18, opt = {}) {
  const b = new THREE.Group(), M = mats(THREE), fm = paint(THREE, color), trim = opt.trim !== undefined ? paint(THREE, opt.trim) : M.black;
  const seats = [], wheels = [];
  const add = (mesh, x, y, z = 0) => { mesh.position.set(x, y, z); mesh.castShadow = BIKE_SHADOW; b.add(mesh); return mesh; };
  const tube = (x0, y0, x1, y1, z = 0, r = 0.022, m = fm) => {
    const len = Math.hypot(x1 - x0, y1 - y0), g = geo(THREE, `t${r}`, () => new THREE.CylinderGeometry(1, 1, 1, 7));
    const t = new THREE.Mesh(g, m); t.scale.set(r, len, r); t.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2; return add(t, (x0 + x1) / 2, (y0 + y1) / 2, z);
  };
  const ztube = (x, y, w, r = 0.02, m = fm) => { const t = new THREE.Mesh(geo(THREE, `t${r}`, () => new THREE.CylinderGeometry(1, 1, 1, 7)), m); t.scale.set(r, w, r); t.rotation.x = Math.PI / 2; return add(t, x, y, 0); };
  const wheel = (x, r = 0.34, z = 0) => {
    const w = new THREE.Group(); w.position.set(x, r + 0.02, z); w.userData.r = r;
    w.add(new THREE.Mesh(geo(THREE, `ty${r}`, () => new THREE.TorusGeometry(r, 0.032, 6, 22)), M.tyre));
    w.add(new THREE.Mesh(geo(THREE, `ri${r}`, () => new THREE.TorusGeometry(r - 0.034, 0.011, 4, 22)), M.rim));
    w.add(new THREE.LineSegments(spokeGeo(THREE, r), M.spoke));
    const hub = new THREE.Mesh(geo(THREE, 'hub', () => new THREE.CylinderGeometry(0.03, 0.03, 0.09, 8)), M.chrome); hub.rotation.x = Math.PI / 2; w.add(hub);
    w.children[0].castShadow = BIKE_SHADOW; b.add(w); wheels.push(w); return w;
  };
  const guard = (x, r) => { // a mudguard over the top of the wheel
    const m = new THREE.Mesh(geo(THREE, `mg${r}`, () => new THREE.TorusGeometry(r + 0.06, 0.028, 4, 14, Math.PI * 0.95)), trim); m.scale.z = 1.6; m.rotation.z = Math.PI * 0.03; return add(m, x, r + 0.02);
  };
  const saddle = (x, y, pose) => {
    const s = add(new THREE.Mesh(geo(THREE, 'sad', () => { const g = new THREE.SphereGeometry(0.12, 10, 6); g.scale(1.25, 0.32, 0.72); return g; }), M.leather), x, y);
    for (const z of [-0.05, 0.05]) add(new THREE.Mesh(geo(THREE, 'spr', () => new THREE.TorusGeometry(0.022, 0.007, 4, 8)), M.chrome), x - 0.08, y - 0.04, z).rotation.y = Math.PI / 2;
    seats.push([x, y + 0.02, pose]); return s;
  };
  const omaBars = (x, y) => { // upright handlebars that sweep back towards the rider, with grips and a bell
    tube(x, y - 0.1, x, y, 0, 0.018, M.chrome);
    for (const z of [-1, 1]) { tube(x, y, x - 0.16, y + 0.05, z * 0.18, 0.015, M.chrome); const g = add(new THREE.Mesh(geo(THREE, 'grip', () => new THREE.CylinderGeometry(0.02, 0.02, 0.1, 6)), M.black), x - 0.2, y + 0.06, z * 0.2); g.rotation.z = Math.PI / 2; }
    ztube(x, y, 0.38, 0.015, M.chrome);
    add(new THREE.Mesh(geo(THREE, 'bell', () => new THREE.SphereGeometry(0.03, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2)), M.chrome), x - 0.02, y + 0.02, 0.12);
  };
  const flatBars = (x, y) => { tube(x, y - 0.12, x, y, 0, 0.016, M.chrome); ztube(x, y, 0.5, 0.015, M.black); };
  const crank = (x, y) => { // chainring + two arms with pedals; spins on Z
    const c = new THREE.Group(); c.position.set(x, y, 0); c.userData.crank = true;
    const ring = new THREE.Mesh(geo(THREE, 'ring', () => new THREE.TorusGeometry(0.09, 0.012, 4, 16)), M.chrome); ring.position.z = 0.04; c.add(ring);
    for (const s of [1, -1]) { const arm = new THREE.Mesh(geo(THREE, 'arm', () => new THREE.BoxGeometry(0.03, 0.17, 0.02)), M.chrome); arm.position.set(0, -0.085 * s, 0.07 * s); c.add(arm);
      const pd = new THREE.Mesh(geo(THREE, 'pedal', () => new THREE.BoxGeometry(0.09, 0.02, 0.07)), M.black); pd.position.set(0, -0.17 * s, 0.11 * s); c.add(pd); }
    b.add(c); b.userData.crank = c; return c;
  };
  const chainGuard = (x0, x1, y) => { const g = add(new THREE.Mesh(geo(THREE, 'cg', () => new THREE.BoxGeometry(1, 0.1, 0.03)), trim), (x0 + x1) / 2, y, 0.07); g.scale.x = x1 - x0; };
  const rack = (x0, x1, y) => { for (const z of [-0.1, 0.1]) tube(x0, y, x1, y, z, 0.01, M.black); tube(x1, y, x1 + 0.05, y - 0.38, 0, 0.01, M.black); add(new THREE.Mesh(geo(THREE, 'rk', () => new THREE.BoxGeometry(1, 0.012, 0.22)), M.black), (x0 + x1) / 2, y + 0.005).scale.x = x1 - x0; };
  const lamp = (x, y) => { const l = add(new THREE.Mesh(geo(THREE, 'lamp', () => new THREE.CylinderGeometry(0.035, 0.03, 0.06, 8)), M.chrome), x, y); l.rotation.z = Math.PI / 2; add(new THREE.Mesh(geo(THREE, 'lens', () => new THREE.CircleGeometry(0.03, 8)), M.lamp), x + 0.031, y).rotation.y = Math.PI / 2; };
  const tail = (x, y) => add(new THREE.Mesh(geo(THREE, 'tail', () => new THREE.BoxGeometry(0.02, 0.04, 0.06)), M.red), x, y);
  const basket = (x, y, w = 0.32, kindB = 'wicker') => {
    const g = new THREE.Group(); g.position.set(x, y, 0); b.add(g); const m = kindB === 'crate' ? M.crate : M.wicker;
    const bx = (sx, sy, sz, px, py, pz) => { const q = new THREE.Mesh(geo(THREE, 'bx', () => new THREE.BoxGeometry(1, 1, 1)), m); q.scale.set(sx, sy, sz); q.position.set(px, py, pz); q.castShadow = BIKE_SHADOW; g.add(q); };
    bx(w, 0.02, w * 1.1, 0, 0, 0); for (const s of [-1, 1]) { bx(w, 0.2, 0.02, 0, 0.1, s * w * 0.55); bx(0.02, 0.2, w * 1.1, s * w * 0.5, 0.1, 0); }
    if (kindB === 'crate') for (const s of [-1, 1]) bx(w + 0.02, 0.03, 0.03, 0, 0.16, s * w * 0.56);
    return g;
  };
  const kick = (x) => tube(x, 0.3, x - 0.08, 0.02, 0.08, 0.01, M.black);

  if (kind === 1) { // tricycle: big front wheel, two small rear wheels, a wicker basket between them
    wheel(0.62, 0.42); wheel(-0.55, 0.28, 0.38); wheel(-0.55, 0.28, -0.38); guard(0.62, 0.42);
    ztube(-0.55, 0.3, 0.8); tube(-0.55, 0.3, 0.0, 0.42, 0, 0.026); tube(0.0, 0.42, 0.55, 0.98, 0, 0.026); tube(0.62, 0.44, 0.55, 0.98, 0, 0.02); tube(0.0, 0.42, -0.1, 0.86, 0, 0.022);
    saddle(-0.12, 0.92); omaBars(0.55, 1.05); crank(0.02, 0.42); basket(-0.6, 0.55, 0.5);
  } else if (kind === 2) { // vierfiets: four riders on one long frame, an orange flag
    wheel(-1.75); wheel(1.75); wheel(-0.6, 0.3); wheel(0.6, 0.3); guard(1.75, 0.34); guard(-1.75, 0.34);
    tube(-1.75, 0.36, 1.75, 0.36, 0, 0.03); tube(-1.6, 0.86, 1.6, 0.86, 0, 0.026);
    for (let i = 0; i < 4; i++) { const x = -1.35 + i * 0.9; tube(x, 0.36, x, 0.88); saddle(x, 0.92); flatBars(x + 0.45, 1.04); tube(x + 0.45, 0.86, x + 0.45, 0.92, 0, 0.016); }
    crank(-0.9, 0.4); tube(-1.75, 0.6, -1.75, 2.0, 0, 0.008, M.chrome);
    add(new THREE.Mesh(geo(THREE, 'flag', () => new THREE.PlaneGeometry(0.5, 0.3)), new THREE.MeshLambertMaterial({ color: 0xe8862c, side: THREE.DoubleSide })), -1.5, 1.88);
  } else if (kind === 3) { // tall bike: one frame welded on top of another
    wheel(-0.52); wheel(0.52); guard(-0.52, 0.34);
    tube(-0.52, 0.36, -0.1, 0.36); tube(-0.1, 0.36, 0.42, 0.82); tube(-0.18, 0.86, 0.42, 0.82); tube(-0.1, 0.36, -0.18, 0.86); tube(0.52, 0.36, 0.42, 0.82, 0, 0.018, M.chrome);
    tube(-0.18, 0.86, -0.1, 1.86); tube(0.42, 0.82, 0.48, 1.9); tube(-0.1, 1.86, 0.48, 1.9); tube(-0.1, 1.4, 0.45, 1.4);
    saddle(-0.12, 1.92); flatBars(0.48, 2.04); crank(-0.1, 1.42);
  } else if (kind === 4) { // bakfiets: long-john with a varnished wooden box up front and a whole Gouda in it
    wheel(-0.72); wheel(1.3, 0.24);
    tube(-0.72, 0.36, -0.2, 0.36); tube(-0.2, 0.36, 0.35, 0.32, 0, 0.03); tube(0.35, 0.3, 1.3, 0.26, 0, 0.03); tube(-0.28, 0.88, 0.32, 0.88); tube(-0.2, 0.36, -0.28, 0.88); tube(-0.72, 0.36, -0.28, 0.88, 0, 0.016);
    guard(-0.72, 0.34); chainGuard(-0.68, -0.2, 0.36); rack(-0.95, -0.55, 0.78); tail(-0.98, 0.74);
    saddle(-0.3, 0.94); omaBars(0.32, 1.06); tube(0.32, 0.88, 0.32, 0.96, 0, 0.02, M.chrome); crank(-0.2, 0.38); kick(-0.6);
    const bx = new THREE.Group(); bx.position.set(0.82, 0.62, 0); b.add(bx);
    const w = new THREE.Mesh(geo(THREE, 'bak', () => new THREE.BoxGeometry(0.86, 0.46, 0.7)), M.wood); w.castShadow = BIKE_SHADOW; bx.add(w);
    const ch = new THREE.Mesh(geo(THREE, 'gouda', () => new THREE.CylinderGeometry(0.28, 0.28, 0.2, 18)), M.gouda); ch.position.set(0, 0.32, 0); ch.rotation.z = 0.25; bx.add(ch);
    const rd = new THREE.Mesh(geo(THREE, 'rind', () => new THREE.TorusGeometry(0.28, 0.02, 4, 18)), M.rind); rd.rotation.set(Math.PI / 2, 0.25, 0); rd.position.copy(ch.position); bx.add(rd);
  } else if (kind === 5) { // mini bike: tiny wheels, rider squatting over it like a frog
    wheel(-0.32, 0.15); wheel(0.34, 0.15);
    tube(-0.32, 0.17, 0.0, 0.2); tube(0.0, 0.2, 0.3, 0.42); tube(0.34, 0.17, 0.28, 0.95, 0, 0.016, M.chrome); tube(-0.32, 0.17, -0.1, 0.5); tube(0.0, 0.2, -0.1, 0.5);
    saddle(-0.12, 0.54, 'squat'); flatBars(0.28, 1.0); crank(0, 0.2);
  } else if (kind === 6) { // penny-farthing: huge front wheel, tiny rear wheel, rider way up top
    wheel(0.15, 0.78); wheel(-0.95, 0.19);
    tube(-0.95, 0.21, -0.55, 1.15, 0, 0.026); tube(-0.55, 1.15, 0.05, 1.6, 0, 0.026); tube(0.15, 0.8, 0.12, 1.62, 0, 0.02, M.chrome);
    saddle(0.0, 1.66); flatBars(0.18, 1.8); tube(0.12, 1.62, 0.18, 1.78, 0, 0.016, M.chrome);
  } else if (kind === 7) { // double-decker: one rider on a tall frame, a second on a little bike tucked underneath
    wheel(-0.95, 0.36); wheel(0.95, 0.36);
    tube(-0.95, 0.38, -0.1, 2.35); tube(0.95, 0.38, 0.35, 2.4); tube(-0.95, 0.38, 0.95, 0.38); tube(-0.1, 2.35, 0.35, 2.4); tube(-0.5, 1.35, 0.6, 1.4);
    saddle(-0.12, 2.42); flatBars(0.4, 2.54); crank(-0.3, 1.38);
    wheel(-0.25, 0.13); wheel(0.3, 0.13); tube(-0.25, 0.15, 0.3, 0.15, 0, 0.016); tube(-0.1, 0.15, -0.12, 0.52, 0, 0.016); tube(0.3, 0.15, 0.25, 0.8, 0, 0.014, M.chrome);
    saddle(-0.12, 0.56, 'squat'); flatBars(0.25, 0.84);
  } else if (kind === 8) { // extra-tall bike: a long fork and a seat up at first-floor windows
    wheel(-0.95, 0.38); wheel(0.95, 0.38);
    tube(-0.95, 0.4, -0.45, 0.9); tube(-0.45, 0.9, -0.2, 2.25); tube(-0.45, 0.9, 0.62, 0.95); tube(0.95, 0.4, 0.6, 2.35, 0, 0.02, M.chrome); tube(-0.2, 2.25, 0.6, 2.35); tube(-0.2, 2.25, -0.95, 0.4);
    saddle(-0.25, 2.3); flatBars(0.62, 2.47); crank(-0.45, 0.92);
  } else if (kind === 9) { // stacked four: one frame, four riders at three heights
    wheel(-0.85); wheel(0.85);
    tube(-0.85, 0.36, 0.85, 0.36); tube(-0.3, 0.36, -0.3, 2.75); tube(0.3, 0.36, 0.3, 2.75); tube(-0.3, 2.0, 0.85, 2.05); tube(-0.85, 1.75, 0.3, 1.75); tube(-0.3, 2.75, 0.3, 2.75); tube(0.85, 0.36, 0.85, 2.05); tube(-0.85, 0.36, -0.85, 1.75);
    saddle(0.0, 0.9); flatBars(0.5, 1.02); saddle(-0.75, 1.82); flatBars(-0.32, 1.97); saddle(0.55, 2.12); flatBars(0.95, 2.27); saddle(-0.05, 2.82); flatBars(0.35, 2.97); crank(0, 0.4);
  } else if (kind === 10 || kind === 11) { // opafiets (diamond frame, a fruit crate on the front) / transportfiets (big front carrier)
    wheel(-0.56, 0.35); wheel(0.56, 0.35); guard(-0.56, 0.35); guard(0.56, 0.35);
    tube(-0.56, 0.37, -0.12, 0.36, 0, 0.02); tube(-0.12, 0.36, 0.44, 0.84, 0, 0.026); tube(-0.2, 0.9, 0.44, 0.86, 0, 0.024); tube(-0.12, 0.36, -0.2, 0.9, 0, 0.026); tube(-0.56, 0.37, -0.2, 0.9, 0, 0.016); tube(0.56, 0.37, 0.44, 0.86, 0, 0.02, M.chrome);
    chainGuard(-0.52, -0.1, 0.37); rack(-0.85, -0.38, 0.8); tail(-0.88, 0.76); lamp(0.52, 0.72);
    saddle(-0.22, 0.98); omaBars(0.44, 1.06); crank(-0.12, 0.38); kick(-0.4);
    if (kind === 10) basket(0.72, 0.82, 0.36, 'crate'); else { rack(0.5, 0.9, 0.78); basket(0.7, 0.8, 0.46, 'crate'); }
  } else { // 0: omafiets, the black Dutch step-through: low swooping down tube, mudguards, chain guard, rack, wicker basket, dynamo lamp
    wheel(-0.56, 0.35); wheel(0.56, 0.35); guard(-0.56, 0.35); guard(0.56, 0.35);
    tube(-0.56, 0.37, -0.12, 0.36, 0, 0.02); tube(-0.12, 0.36, 0.1, 0.32, 0, 0.026); tube(0.1, 0.32, 0.44, 0.86, 0, 0.026); // the step-through swoop
    tube(-0.12, 0.36, -0.2, 0.9, 0, 0.026); tube(-0.56, 0.37, -0.2, 0.9, 0, 0.016); tube(0.56, 0.37, 0.44, 0.86, 0, 0.02, M.chrome);
    chainGuard(-0.52, -0.1, 0.37); rack(-0.85, -0.38, 0.8); tail(-0.88, 0.76); lamp(0.52, 0.72);
    saddle(-0.22, 0.98); omaBars(0.44, 1.06); crank(-0.12, 0.38); kick(-0.4);
    if (opt.basket !== false) basket(0.66, 0.84, 0.3, opt.crate ? 'crate' : 'wicker');
  }
  b.userData.seats = seats; b.userData.wheels = wheels;
  { const turning = (o) => { for (let q = o; q && q !== b; q = q.parent) if (q.userData.r || q.userData.crank === true) return true; return false; };
    b.traverse((o) => { if (o !== b && o.isGroup && (o.userData.r || o.userData.crank === true)) mergeStatic(o); }); mergeStatic(b, turning); }
  b.userData.len = kind === 2 ? 2.2 : kind === 4 ? 1.6 : kind === 6 || kind === 7 || kind === 8 ? 1.3 : kind === 9 ? 1.2 : kind === 11 ? 1.05 : 0.95;
  return b;
}

// ---------------------------------------------------------------------------------------------------------------- riding
// deps: THREE, scene, player, keys, collide(p, r), addInteract, toast, beep, bell(), canvasTex, busy() (a mission, drive,
//       PC or dialogue), knocked() (Eddy got bumped), park: { x, z, h }
export function createFiets(deps) {
  const { THREE, scene, player, keys } = deps;
  const bike = makeBikeModel(THREE, 0, 0xc8402a, { trim: 0xefe3c8, crate: true }); // Eddy's: paprika red, cream mudguards, a fruit crate
  { // the crate wears the shop's name
    const t = deps.canvasTex(128, 48, (g) => { g.fillStyle = '#e8a33d'; g.fillRect(0, 0, 128, 48); g.fillStyle = '#5a2a1e'; g.font = '900 22px Arial Black, Impact'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('EDDY & ZN', 64, 25); });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.11), new THREE.MeshLambertMaterial({ map: t })); s.position.set(0.82, 0.94, 0); s.rotation.y = Math.PI / 2; bike.add(s);
  }
  scene.add(bike);
  // every rideable thing is a vehicle { obj, kind: 'bike' | 'car', B: its motion state }; Eddy's own omafiets is the first
  const own = { obj: bike, kind: 'bike', name: "Eddy's omafiets", seat: bike.userData.seats[0], tilt: 0.12, B: { x: deps.park.x, z: deps.park.z, h: deps.park.h, v: 0, on: false, phase: 0, lean: 0, ring: 0 } };
  const fleet = [own]; let cur = own, B = own.B, seat = own.seat;
  const place = () => { const o = cur.obj; o.position.set(B.x, 0, B.z); o.rotation.set(0, B.h - Math.PI / 2, 0); if (cur.kind !== 'car') o.rotateX(B.on ? B.lean : (cur.tilt || 0.12)); };
  place();

  // ---- HUD + touch pedals (the van drive's layout)
  const css = document.createElement('style');
  css.textContent = `
  #fts { position: fixed; inset: 0; z-index: 9; pointer-events: none; display: none; font-family: Bungee, "Arial Black", sans-serif; }
  #fts .spd { position: absolute; left: 50%; top: 14px; transform: translateX(-50%); padding: 4px 14px; border-radius: 14px; background: rgba(30,18,10,.72); color: #ffd36b; font-size: 15px; text-shadow: 0 2px 0 #000; }
  #fts .hint { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); padding: 5px 12px; border-radius: 10px; background: rgba(0,0,0,.5); color: #fff; font: 600 13px Rubik, Arial, sans-serif; white-space: nowrap; }
  #fts .hint b { display: inline-block; min-width: 16px; padding: 0 4px; margin: 0 1px; border: 1px solid rgba(255,255,255,.55); border-bottom-width: 3px; border-radius: 5px; }
  #fts .pd { display: none; position: absolute; pointer-events: auto; touch-action: none; user-select: none; -webkit-user-select: none; align-items: center; justify-content: center; flex-direction: column; color: #fff; text-shadow: 0 2px 0 rgba(0,0,0,.6);
    border: 2px solid rgba(255,226,170,.8); box-shadow: 0 6px 14px rgba(0,0,0,.45), inset 0 2px 0 rgba(255,255,255,.35); font-size: 13px; }
  body.touch #fts .pd { display: flex; } body.touch #fts .hint { display: none; }
  #fts .pd small { font-size: 10px; opacity: .9; } #fts .pd.on { filter: brightness(1.35); transform: scale(.96); }
  #ftsSteer { left: max(16px, env(safe-area-inset-left)); bottom: 16px; width: 236px; height: 96px; border-radius: 48px; flex-direction: row !important; justify-content: space-between !important; padding: 0 22px; box-sizing: border-box; font-size: 34px !important;
    background: linear-gradient(180deg, rgba(90,60,36,.75), rgba(40,24,14,.8) 50%, rgba(28,16,8,.85) 51%); }
  #ftsSteer i { font-style: normal; opacity: .55; } #ftsSteer i.on { opacity: 1; color: #ffd36b; } #ftsSteer .mid { font-size: 10px; opacity: .7; text-align: center; line-height: 1.2; }
  #ftsGas { right: max(16px, env(safe-area-inset-right)); bottom: 16px; width: 104px; height: 136px; border-radius: 22px; font-size: 20px !important; background: linear-gradient(180deg, #8fd36a, #3f8f2a 50%, #2f7a1e 51%, #3a8a26); }
  #ftsRev { right: calc(max(16px, env(safe-area-inset-right)) + 116px); bottom: 16px; width: 96px; height: 80px; border-radius: 20px; background: linear-gradient(180deg, #ff8a6a, #c8402a 50%, #a83020 51%, #b8382a); }
  #ftsBell { right: calc(max(16px, env(safe-area-inset-right)) + 128px); bottom: 108px; width: 72px; height: 44px; border-radius: 22px; font-size: 11px !important; background: linear-gradient(180deg, #ffe08a, #e8a33d 50%, #c8862a 51%, #d8962a); }
  #ftsOff { left: 50%; top: 52px; transform: translateX(-50%); width: 120px; height: 38px; border-radius: 19px; font-size: 11px !important; background: linear-gradient(180deg, rgba(90,60,36,.8), rgba(40,24,14,.85) 50%, rgba(28,16,8,.9) 51%); }
  @media (max-height: 420px) { #ftsGas { height: 116px; width: 96px; } #ftsRev { right: calc(max(16px, env(safe-area-inset-right)) + 106px); } #ftsBell { right: calc(max(16px, env(safe-area-inset-right)) + 118px); bottom: 104px; } #ftsSteer { width: 200px; height: 84px; } }
  @media (max-width: 480px) { #ftsSteer { width: 158px; height: 88px; padding: 0 14px; font-size: 28px !important; } #ftsRev { width: 78px; right: calc(max(16px, env(safe-area-inset-right)) + 112px); } #ftsBell { right: calc(max(16px, env(safe-area-inset-right)) + 112px); bottom: 104px; width: 78px; } } /* an upright phone: the pedals no longer sit on the steering bar */
  body.riding #help { display: none !important; }
  body.riding #touchUI .tzone, body.riding #touchUI .tb, body.riding #touchUI .tp:not([data-k=pause]) { display: none !important; }
  /* Aero: glass gel pedals and a glass speed pill */
  html.aero #fts .spd { background: linear-gradient(180deg, rgba(255,255,255,.92), rgba(205,232,248,.82) 48%, rgba(150,200,232,.78) 52%, rgba(185,222,244,.85)); color: #1d3a5a; text-shadow: 0 1px 0 rgba(255,255,255,.8); border: 1px solid rgba(255,255,255,.8); box-shadow: 0 4px 14px rgba(0,40,80,.25), inset 0 1px 0 #fff; font-family: "Aero Text", Selawik, Nunito, sans-serif; font-weight: 800; }
  html.aero #fts .pd { border: 1px solid rgba(255,255,255,.85); box-shadow: 0 6px 16px rgba(0,30,60,.3), inset 0 1px 0 rgba(255,255,255,.9); font-family: "Aero Text", Selawik, Nunito, sans-serif; font-weight: 800; }
  html.aero #ftsSteer, html.aero #ftsOff { background: linear-gradient(180deg, rgba(255,255,255,.9), rgba(200,228,246,.78) 48%, rgba(130,185,225,.74) 52%, rgba(170,214,240,.82)); color: #12304a; text-shadow: 0 1px 0 rgba(255,255,255,.7); }
  html.aero #ftsGas { background: linear-gradient(180deg, #c8f0a8, #6ac24a 48%, #3f9a2a 52%, #5ab83a); } html.aero #ftsRev { background: linear-gradient(180deg, #ffc8b0, #f07050 48%, #c84a2a 52%, #e06040); }
  html.aero #ftsBell { background: linear-gradient(180deg, #fff2c8, #f2c14e 48%, #d8962a 52%, #e8a83a); color: #4a2a08; text-shadow: 0 1px 0 rgba(255,255,255,.6); }`;
  document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'fts';
  hud.innerHTML = `<div class="spd" id="ftsSpd">0 km/u</div><div class="hint"><b>W</b> trappen · <b>S</b> remmen · <b>A</b><b>D</b> sturen · <b>Shift</b> staan op de trappers · <b>H</b> bel · <b>E</b> afstappen</div>
    <div class="pd" id="ftsSteer"><i id="ftsL">◀</i><span class="mid">STUUR<br>sleep</span><i id="ftsR">▶</i></div>
    <div class="pd" id="ftsBell">🔔 BEL</div><div class="pd" id="ftsRev">▼<small>REM</small></div><div class="pd" id="ftsGas">▲<br>TRAP</div><div class="pd" id="ftsOff">AFSTAPPEN</div>`;
  document.body.appendChild(hud);
  const $ = (id) => document.getElementById(id);
  const tp = { gas: 0, rev: 0, steer: 0 };
  function pedal(id, on, off) {
    const el = $(id), ptrs = new Set();
    const up = (e) => { if (!ptrs.delete(e.pointerId)) return; if (!ptrs.size) { el.classList.remove('on'); off && off(); } };
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); ptrs.add(e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (_) { /* fine */ } el.classList.add('on'); on(e); });
    el.addEventListener('pointermove', (e) => { if (ptrs.has(e.pointerId) && el._move) el._move(e); });
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); el.addEventListener('lostpointercapture', up);
    el.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
  }
  pedal('ftsGas', () => { tp.gas = 1; }, () => { tp.gas = 0; });
  pedal('ftsRev', () => { tp.rev = 1; }, () => { tp.rev = 0; });
  pedal('ftsBell', () => ring());
  pedal('ftsOff', () => dismount());
  const steerAt = (e) => { const r = $('ftsSteer').getBoundingClientRect(), k = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.3); tp.steer = -Math.max(-1, Math.min(1, Math.abs(k) < 0.12 ? 0 : k)); };
  pedal('ftsSteer', steerAt, () => { tp.steer = 0; }); $('ftsSteer')._move = steerAt;
  function padInput() {
    let gps = []; try { gps = navigator.getGamepads ? navigator.getGamepads() : []; } catch (e) { return null; }
    for (const g of gps) { if (!g || !g.connected) continue; const v = (i) => { const b = g.buttons[i]; return b ? Math.max(b.value || 0, b.pressed ? 1 : 0) : 0; }, ax = g.axes[0] || 0; return { thr: v(7) - v(6), st: Math.abs(ax) > 0.15 ? -ax : 0 }; }
    return null;
  }

  function ring() { if (B.ring > 0) return; B.ring = 0.5; if (cur.kind === 'car') { if (deps.honk) deps.honk(); } else if (deps.bell) deps.bell(); }
  function mount(v = own) {
    if (B.on || (deps.busy && deps.busy())) return;
    cur = v; B = v.B; seat = v.seat;
    if (v !== own) { const o = v.obj; B.x = o.position.x; B.z = o.position.z; B.h = o.rotation.y + Math.PI / 2; if (v.solid) v.solid.off = true; }
    B.on = true; B.v = 0; B.t0 = performance.now(); hud.style.display = 'block'; document.body.classList.add('riding'); hud.classList.toggle('car', v.kind === 'car');
    { const c2 = v.kind === 'car'; $('ftsGas').innerHTML = c2 ? '▲<br>GAS' : '▲<br>TRAP'; $('ftsOff').textContent = c2 ? 'UITSTAPPEN' : 'AFSTAPPEN'; $('ftsBell').textContent = c2 ? '📣 CLAXON' : '🔔 BEL';
      hud.querySelector('.hint').innerHTML = c2 ? '<b>W</b> gas · <b>S</b> remmen / achteruit · <b>A</b><b>D</b> sturen · <b>H</b> claxon · <b>E</b> uitstappen' : '<b>W</b> trappen · <b>S</b> remmen · <b>A</b><b>D</b> sturen · <b>Shift</b> staan op de trappers · <b>H</b> bel · <b>E</b> afstappen'; }
    if (v.kind === 'car') player.visible = false;
    const touch = document.body.classList.contains('touch');
    if (deps.toast && !v.quiet) deps.toast(v.kind === 'car' ? `IN DE ${String(v.name || 'auto').toUpperCase()}` : 'OP DE FIETS', v.kind === 'car' ? (touch ? 'GAS, REM and the bar to steer. UITSTAPPEN to get out. It is not yours: people notice.' : 'W gas · S brake / reverse · A/D steer · H horn · E get out. It is not yours: people notice.') : touch ? 'TRAP to pedal, REM to brake, slide on the bar to steer. AFSTAPPEN to get off.' : 'W pedal · S brake · A/D steer · H bell · E get off.', 3);
    if (v !== own && !v.own && deps.onBorrow) deps.onBorrow(v);
  }
  function dismount() {
    if (!B.on || (cur.locked && cur.locked())) return; // the Oofmobiel on a trip: no stepping out half-way (js/rit.js)
    const v = cur; B.on = false; B.v = 0; tp.gas = tp.rev = tp.steer = 0; hud.style.display = 'none'; document.body.classList.remove('riding');
    const side = new THREE.Vector3(Math.cos(B.h), 0, -Math.sin(B.h)), out = v.kind === 'car' ? (v.width || 1.7) / 2 + 0.55 : 0.75; // step off to the right
    player.visible = true; player.rotation.set(0, B.h, 0);
    player.position.set(B.x + side.x * out, 0, B.z + side.z * out); deps.collide(player.position, 0.38);
    const u = player.userData; if (u.legs) u.legs.forEach((l) => { l.rotation.x = 0; }); if (u.arms) u.arms.forEach((a) => { a.rotation.x = 0; }); if (u.body) u.body.rotation.x = 0;
    place();
    if (v.solid) { const fx = Math.abs(Math.sin(B.h)), fz = Math.abs(Math.cos(B.h)), L = v.half || 1, W2 = (v.width || 0.6) / 2, ex = L * fx + W2 * fz, ez = L * fz + W2 * fx; Object.assign(v.solid, { minx: B.x - ex, maxx: B.x + ex, minz: B.z - ez, maxz: B.z + ez, off: false }); deps.collide(player.position, 0.38); }
    if (deps.onLeave) deps.onLeave(v);
  }
  addEventListener('keydown', (e) => { // while riding, E gets off and H rings, before main.js sees them
    if ((deps.frozen && deps.frozen()) || (deps.talkedAt && performance.now() - deps.talkedAt() < 350)) return; // a dialogue is up, or this very key press just closed it: E belongs to the dialogue, not to the door handle
    if (!B.on || e.repeat || performance.now() - B.t0 < 300) return; // the touch ACTIE button sends E to window, where the mount handler may run first
    if (e.code === 'KeyE' || e.code === 'Enter') { e.stopImmediatePropagation(); dismount(); } else if (e.code === 'KeyH' || e.code === 'Space') { e.stopImmediatePropagation(); e.preventDefault(); ring(); }
  }, true);
  deps.addInteract({ obj: bike, pos: () => bike.position, r: 1.7, enabled: () => !B.on && !(deps.busy && deps.busy()), label: () => "Eddy's omafiets · opstappen", act: () => mount(own) });
  // any parked bike or car on the street can be borrowed (js/main.js adopts them): the same pedals, the same HUD
  function adopt(obj, cfg) {
    const v = { own: !!cfg.own, quiet: !!cfg.quiet, locked: cfg.locked || null, k: cfg.k || null, gripMul: 1, obj, kind: cfg.kind || 'bike', name: cfg.name || '', solid: cfg.solid || null, half: cfg.half, width: cfg.width, seat: cfg.seat || (obj.userData.seats && obj.userData.seats[0]) || [0, 0.95, 0],
      B: { x: obj.position.x, z: obj.position.z, h: obj.rotation.y + Math.PI / 2, v: 0, on: false, phase: 0, lean: 0, ring: 0 }, tilt: cfg.tilt || 0 };
    fleet.push(v); if (cfg.quiet) return v; // driven by a trip, never borrowed
    deps.addInteract({ obj, pos: () => obj.position, r: cfg.kind === 'car' ? 2.6 : 1.5, enabled: () => !B.on && obj.visible && !(deps.busy && deps.busy()) && (!cfg.enabled || cfg.enabled()),
      label: () => (cfg.kind === 'car' ? `${v.name || 'Auto'} · even lenen` : `${v.name || 'Fiets'} · even lenen`), act: () => mount(v) });
    return v;
  }

  // ---- per frame: returns true while Eddy rides (main.js then skips walking)
  let slide = 0;
  const K = { bike: { vmax: 7, acc: 5, brake: 11, rev: -1.1, turn: 2.3, grip: 2.2, r: 0.42, nose: 0.6 }, car: { vmax: 15, acc: 6.5, brake: 15, rev: -4.5, turn: 1.55, grip: 4, r: 0.95, nose: 1.45 } };
  function update(dt) {
    if (B.ring > 0) B.ring -= dt;
    if (!B.on) { if (cur === own) for (const w of bike.userData.wheels) w.rotation.z -= B.v * dt / w.userData.r; return false; }
    if ((deps.busy && deps.busy()) || (deps.knocked && deps.knocked())) { dismount(); return false; }
    const car = cur.kind === 'car', k = cur.k || K[car ? 'car' : 'bike'], ro = cur.obj, gm = cur.gripMul || 1; // gm < 1: a wet or frozen road (js/kaasweer.js)
    let thr = 0, st = 0;
    if (!(deps.frozen && deps.frozen())) {
      if (keys.KeyW || keys.ArrowUp) thr += 1; if (keys.KeyS || keys.ArrowDown) thr -= 1;
      if (keys.KeyA || keys.ArrowLeft) st += 1; if (keys.KeyD || keys.ArrowRight) st -= 1;
      thr += tp.gas - tp.rev; st += tp.steer; const pad = padInput(); if (pad) { thr += pad.thr; st += pad.st; }
      thr = Math.max(-1, Math.min(1, thr)); st = Math.max(-1, Math.min(1, st));
    }
    $('ftsL').classList.toggle('on', st > 0.1); $('ftsR').classList.toggle('on', st < -0.1);
    const stand = !car && (keys.ShiftLeft || keys.ShiftRight), vmax = stand ? 9.5 : k.vmax;
    if (thr > 0) B.v += (B.v < 0 ? 10 : k.acc * thr * (1 - Math.max(0, B.v) / vmax)) * dt;
    else if (thr < 0) B.v = B.v > 0.3 ? B.v - k.brake * gm * dt : Math.max(k.rev, B.v - 3 * dt); // brake, then back up
    else B.v -= Math.sign(B.v) * Math.min(Math.abs(B.v), (car ? 2.2 : 1.1) * dt); // roll out
    B.h += st * k.turn * (0.45 + 0.55 * gm) * Math.min(1, Math.abs(B.v) / k.grip) * Math.sign(B.v || 1) * dt;
    if (gm < 0.95 && Math.abs(B.v) > 6) { slide += (st * (1 - gm) * Math.abs(B.v) * 0.5 - slide) * Math.min(1, dt * 2); } else slide *= Math.max(0, 1 - dt * 3); // it keeps going where it was going
    const fx = Math.sin(B.h), fz = Math.cos(B.h), p = new THREE.Vector3(B.x + (fx * B.v - fz * slide) * dt, 0, B.z + (fz * B.v + fx * slide) * dt);
    const before = p.clone(); deps.collide(p, k.r);
    for (const sgn of car ? [1, -1] : [1]) { const nose = p.clone().addScaledVector(new THREE.Vector3(fx, 0, fz), k.nose * sgn), n0 = nose.clone(); deps.collide(nose, car ? 0.8 : 0.3); p.add(nose.sub(n0)); }
    const hit = p.distanceTo(before);
    if (hit > 0.02 && Math.abs(B.v) > 3) { if (deps.beep) deps.beep(car ? 70 : 90, car ? 0.14 : 0.08, car ? 'sawtooth' : 'square', 0.05); if (deps.onCrash) deps.onCrash(cur, Math.abs(B.v)); B.v *= car ? 0.25 : 0.35; } else if (hit > 0.02) B.v *= 0.7;
    const moved = Math.hypot(p.x - B.x, p.z - B.z); B.x = p.x; B.z = p.z;
    if (deps.onMove && moved > 0) deps.onMove(cur, moved, Math.abs(B.v));
    B.lean += ((car ? 0 : -st * Math.min(1, Math.abs(B.v) / 5) * 0.28) - B.lean) * Math.min(1, dt * 6);
    place();
    if (ro.userData.wheels) for (const w of ro.userData.wheels) if (w.parent) w.rotation.z -= B.v * dt / w.userData.r;
    const pedalling = !car && thr > 0 && B.v > -0.1; if (pedalling) B.phase += dt * (3 + B.v * 1.1) * (stand ? 1.25 : 1);
    if (ro.userData.crank && ro.userData.crank.parent) ro.userData.crank.rotation.z = -B.phase;
    if (car) { player.position.set(B.x, 0, B.z); player.rotation.set(0, B.h, 0); }
    else { // Eddy on the saddle: the bike's seat in world space, hands on the grips, legs going round with the cranks
      const sp = ro.localToWorld(new THREE.Vector3(seat[0] - 0.02, seat[1] - (stand ? 0.72 : 0.9), 0));
      player.position.copy(sp); player.rotation.set(0, B.h, -B.lean * 0.9);
      const u = player.userData;
      if (u.legs) { u.legs[0].rotation.x = -0.9 + Math.sin(B.phase) * 0.5; u.legs[1].rotation.x = -0.9 - Math.sin(B.phase) * 0.5; }
      if (u.arms) { u.arms[0].rotation.x = u.arms[1].rotation.x = -1.05; }
      if (u.body) u.body.rotation.x = stand ? 0.25 : 0.08;
    }
    $('ftsSpd').textContent = `${Math.round(Math.abs(B.v) * 3.6)} km/u${stand && thr > 0 ? ' · STAAN' : ''}`;
    return true;
  }
  return { update, riding: () => B.on, mount, dismount, bike, adopt, fleet, get current() { return B.on ? cur : null; }, get state() { return B; } };
}
