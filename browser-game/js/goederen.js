// Goederenverkeer (Tristan 2026-11-27): now that the day has hours, goods come and go in timeslots.
//   INKOMEND  09:00 - 11:30  the Groothandel's truck with the spice orders that are due today. The kilos are on the
//                            truck until it is unloaded: only then are they on the shelves (js/economy.js dockIn/receive).
//   UITGAAND  16:00 - 18:30  Kaasland Koerier collects the blends for the joints.
// The Naknikim do the work once their shift has started (08:00): the more of them, the quicker. Eddy can lend a hand
// (E at the truck), and with nobody on the payroll he does all of it. A truck that stands there until the end of its
// slot costs wachtgeld. And some nights the driver is early: the phone rings at 05:30, the truck is at the door, the
// Naknikim are still in bed, and Eddy does it himself in his pyjamas for a night bonus, or lets it ring and pays.
// Until De Hal is built the trucks stop in front of the shed; after that they back up to the hall's dock door and the
// shed's roller door is bricked up to an ordinary door (js/main.js shedFront).
// state.goed = { day, in: job | null, out: job | null, lastNight }, job = { st: 'due' | 'here' | 'done', prog, kg, night }

export const SLOTS = { in: [9, 11.5], out: [16, 18.5], night: [5.5, 7.5] };
const WACHTGELD = 30, NACHT = 40, STEPS = 6;

// deps: THREE, scene, player, state, econ, klok, kit, lam, signTex, solid, addInteract, toast, beep, addMoney, dialogue, phone(),
//       naknik() -> how many are employed, hal() -> De Hal is built, inHall() -> Eddy is in it, front: { x, z }, dock: { x, z },
//       ready() (free play, tutorial done), busy(), save(), setHour(h), fmt(h) -> 'HH:MM'
export function createGoederen(deps) {
  const { THREE, scene, player, state, econ } = deps;
  const G = () => { const g = state.goed && typeof state.goed === 'object' ? state.goed : (state.goed = {}); if (g.in === undefined) g.in = null; if (g.out === undefined) g.out = null; return g; };
  const KIND = { in: { nm: 'INKOMEND', verb: 'lossen', who: 'Groothandel Peper & Zn', col: 0xe8862c, bg: '#e8862c', fg: '#ffffff' }, out: { nm: 'UITGAAND', verb: 'laden', who: 'Kaasland Koerier', col: 0x14499a, bg: '#14499a', fg: '#ffd23a' } };
  const blendKg = () => Object.values(econ.ensure().blends || {}).reduce((a, b) => a + ((b && b.kg) || 0), 0);
  const dockKg = () => (econ.dockIn ? econ.dockIn().reduce((a, o) => a + o.kg, 0) : 0);

  // ---- the trucks: a 7.5-tonne box truck with a tail lift (in front of the shed), or its back in the hall's dock door.
  // Built to be looked at from behind and above (Tristan 2026-11-27: glass, wheels, depth in the cargo area): the box is
  // hollow, with a plywood-lined bay, lashing rails, a strip light and freight deep inside under a rolled-up shutter.
  const glassT = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, '#9fc4de'); gr.addColorStop(0.35, '#4a6f8c'); gr.addColorStop(1, '#12202c'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.moveTo(8, 64); x.lineTo(22, 64); x.lineTo(50, 0); x.lineTo(36, 0); x.fill(); x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.moveTo(30, 64); x.lineTo(36, 64); x.lineTo(64, 6); x.lineTo(64, 0); x.lineTo(58, 0); x.fill(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(); // the sky in the windows
  const glassM = new THREE.MeshStandardMaterial({ map: glassT, roughness: 0.08, metalness: 0.35, envMapIntensity: 1.4 });
  const lampM = new THREE.MeshBasicMaterial({ color: 0xfff2c8 }), bayLightM = new THREE.MeshBasicMaterial({ color: 0xfff6dc });
  function truck(kind) {
    const C = KIND[kind], g = new THREE.Group(), K = deps.kit(); g.visible = false; scene.add(g);
    const WHT = 0xf2f2ee, DARK = 0x24262a, STEEL = 0x9aa0a8, PLY = 0xc9a773, TYRE = 0x18181a, RIM = 0xc4c8ce;
    const X0 = -3.5, X1 = 1.72, W = 2.42, Y0 = 1.02, Y1 = 3.42, T = 0.06; // the box: rear, front, width, floor, roof, wall thickness
    // chassis: two rails, cross members, the fuel tank, a battery box, side underrun bars, mudflaps
    for (const s of [-1, 1]) K.box(7.0, 0.16, 0.1, DARK, 0.1, 0.62, s * 0.42);
    for (const x of [-3.0, -1.2, 0.4, 1.9]) K.box(0.1, 0.12, 0.84, DARK, x, 0.62, 0);
    K.cyl(0.26, 0.26, 0.9, STEEL, 0.55, 0.52, 0.86, 14, 0, 0, Math.PI / 2); K.box(0.6, 0.4, 0.5, 0x3a3e44, 0.5, 0.5, -0.92);
    for (const s of [-1, 1]) { K.box(1.5, 0.07, 0.05, STEEL, -0.45, 0.42, s * 1.2); K.box(1.5, 0.07, 0.05, STEEL, -0.45, 0.62, s * 1.2); for (const x of [-1.15, 0.25]) K.box(0.05, 0.3, 0.05, STEEL, x, 0.52, s * 1.2); }
    for (const s of [-1, 1]) { K.box(0.03, 0.42, 0.52, DARK, -2.92, 0.36, s * 0.93); K.box(0.03, 0.34, 0.42, DARK, 2.42, 0.34, s * 0.98); }
    // wheels: tyres with a rim, a hub and a ring of nuts; twins on the rear axle under black arches
    const wheel = (x, z, s) => { K.cyl(0.47, 0.47, 0.28, TYRE, x, 0.47, z, 18, Math.PI / 2); K.cyl(0.49, 0.49, 0.04, 0x0e0e10, x, 0.47, z, 18, Math.PI / 2); K.cyl(0.29, 0.29, 0.3, RIM, x, 0.47, z, 14, Math.PI / 2); K.cyl(0.2, 0.2, 0.31, 0x8a8e94, x, 0.47, z + s * 0.01, 12, Math.PI / 2); K.cyl(0.09, 0.09, 0.36, DARK, x, 0.47, z + s * 0.02, 8, Math.PI / 2);
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; K.box(0.035, 0.035, 0.04, 0x5a5e64, x + Math.cos(a) * 0.15, 0.47 + Math.sin(a) * 0.15, z + s * 0.155); } };
    for (const s of [-1, 1]) { wheel(2.72, s * 1.03, s); wheel(-2.2, s * 1.05, s); wheel(-2.2, s * 0.74, s); K.box(0.06, 0.26, 0.66, DARK, -2.82, 0.86, s * 0.9); K.box(0.06, 0.26, 0.66, DARK, -1.58, 0.86, s * 0.9); }
    // the cab: a tilt cab with a raked windscreen, doors with a step, big mirrors on arms, a grille, lamps, a wind deflector
    K.box(1.86, 1.12, 2.3, WHT, 2.78, 1.22, 0); K.box(1.86, 0.98, 2.26, WHT, 2.78, 2.25, 0); K.box(1.9, 0.07, 2.3, WHT, 2.78, 2.76, 0); // (an upright cab-over front: the windscreen sits flush in it)
    K.box(0.34, 0.34, 2.44, DARK, 3.62, 0.58, 0); K.box(0.06, 0.5, 1.5, 0x101214, 3.72, 1.1, 0); for (let y = 0.92; y < 1.32; y += 0.09) K.box(0.03, 0.025, 1.4, 0x5a5e64, 3.755, y, 0); K.box(0.03, 0.14, 0.4, STEEL, 3.76, 1.46, 0); // bumper, grille, badge
    for (const s of [-1, 1]) { K.box(0.05, 0.22, 0.38, DARK, 3.73, 1.05, s * 0.95); K.box(0.04, 0.08, 0.2, 0xffa01a, 3.74, 0.86, s * 1.02); K.box(0.05, 0.1, 0.22, 0x101214, 3.8, 0.56, s * 0.8); // lamp housings, indicators, fog lamps
      K.box(0.012, 1.0, 0.012, 0x101214, 2.0, 1.6, s * 1.16); K.box(0.012, 0.012, 0.012, 0x101214, 2.0, 1.6, s * 1.16); K.box(0.9, 0.012, 0.012, 0x101214, 2.5, 1.1, s * 1.158); // door shut lines
      K.box(0.14, 0.04, 0.03, DARK, 2.2, 1.34, s * 1.165); K.box(0.6, 0.05, 0.22, DARK, 2.75, 0.74, s * 1.14); K.box(0.6, 0.05, 0.22, DARK, 2.75, 0.5, s * 1.14); // handle, steps
      K.box(0.05, 0.05, 0.42, DARK, 3.5, 2.38, s * 1.34); K.box(0.05, 0.05, 0.42, DARK, 3.5, 1.78, s * 1.34); K.box(0.07, 0.72, 0.2, DARK, 3.5, 2.08, s * 1.56); K.box(0.02, 0.6, 0.15, 0xb8c4d0, 3.46, 2.08, s * 1.56); // the mirror
      K.box(0.03, 0.04, 0.04, 0xffa01a, 3.2, 2.8, s * 1.0); }
    K.box(1.0, 0.07, 2.2, WHT, 2.5, 3.05, 0, 0, 0, 0.42); for (const s of [-1, 1]) K.box(0.9, 0.36, 0.05, WHT, 2.45, 2.92, s * 1.08); // the wind deflector
    K.box(0.3, 0.05, 2.16, DARK, 3.84, 2.68, 0); // sun visor
    for (const s of [-1, 1]) K.box(0.02, 0.02, 0.62, 0x101214, 3.75, 2.0, s * 0.42 + 0.1, 0, 0.22, 0); // wipers, parked
    // the box: hollow. Outer skin in the firm's colour, aluminium corner rails, plywood inside
    K.box(X1 - X0, T, W, C.col, (X0 + X1) / 2, Y1, 0); K.box(X1 - X0, T, W, 0x6a6e74, (X0 + X1) / 2, Y0, 0); K.box(T, Y1 - Y0, W, C.col, X1, (Y0 + Y1) / 2, 0);
    for (const s of [-1, 1]) { K.box(X1 - X0, Y1 - Y0, T, C.col, (X0 + X1) / 2, (Y0 + Y1) / 2, s * (W / 2 - T / 2)); K.box(X1 - X0 - 0.1, Y1 - Y0 - 0.1, 0.02, PLY, (X0 + X1) / 2, (Y0 + Y1) / 2, s * (W / 2 - T - 0.012));
      K.box(X1 - X0 + 0.04, 0.07, 0.07, STEEL, (X0 + X1) / 2, Y1, s * (W / 2 - 0.02)); K.box(X1 - X0 + 0.04, 0.09, 0.07, STEEL, (X0 + X1) / 2, Y0, s * (W / 2 - 0.02));
      for (const y of [1.45, 2.25]) K.box(X1 - X0 - 0.3, 0.07, 0.03, 0x7a8088, (X0 + X1) / 2, y, s * (W / 2 - T - 0.035)); // lashing rails
      for (let x = X0 + 0.5; x < X1; x += 0.52) K.box(0.03, Y1 - Y0 - 0.15, 0.012, 0xb8935e, x, (Y0 + Y1) / 2, s * (W / 2 - T - 0.026)); } // the seams of the lining
    K.box(0.02, Y1 - Y0 - 0.1, W - 0.16, PLY, X1 - T, (Y0 + Y1) / 2, 0); K.box(X1 - X0 - 0.1, 0.02, W - 0.16, 0xd8dce2, (X0 + X1) / 2, Y1 - T, 0); // bulkhead and ceiling
    for (let z = -0.9; z <= 0.91; z += 0.3) K.box(X1 - X0 - 0.1, 0.012, 0.03, 0x8a8e94, (X0 + X1) / 2, Y0 + T / 2 + 0.008, z); // the ribbed aluminium floor
    // the rear frame: steel posts and header, the shutter rolled up under the roof, lamps, chevrons, the underrun bar, the plate
    for (const s of [-1, 1]) { K.box(0.1, Y1 - Y0 + 0.06, 0.1, STEEL, X0, (Y0 + Y1) / 2, s * (W / 2 - 0.05)); K.box(0.05, 0.42, 0.16, 0x7a0a10, X0 - 0.03, 1.12, s * 1.0); K.box(0.06, 0.12, 0.14, 0xff2a1a, X0 - 0.04, 1.2, s * 1.0); K.box(0.06, 0.1, 0.14, 0xffa01a, X0 - 0.04, 1.06, s * 1.0); K.box(0.04, 0.05, 0.05, 0xff2a1a, X0 - 0.02, Y1 + 0.02, s * 1.1);
      for (let k = 0; k < 5; k++) K.box(0.03, 0.2, 0.09, k % 2 ? 0xf2c31a : 0xd8202a, X0 - 0.05, 1.5 + k * 0.36, s * (W / 2 - 0.05)); }
    K.box(0.12, 0.14, W, STEEL, X0, Y1 - 0.02, 0); K.cyl(0.15, 0.15, W - 0.24, 0xb8bcc2, X0 + 0.22, Y1 - 0.24, 0, 12, Math.PI / 2); K.box(0.04, 0.3, W - 0.24, 0xc8ccd2, X0 + 0.08, Y1 - 0.36, 0); K.box(0.05, 0.05, 0.3, DARK, X0 + 0.06, Y1 - 0.52, 0);
    K.box(0.1, 0.1, 2.3, STEEL, X0 - 0.02, 0.5, 0); for (const s of [-1, 1]) K.box(0.08, 0.3, 0.08, STEEL, X0 + 0.02, 0.66, s * 0.6);
    // the tail lift: a ribbed platform down on the street, two arms, the roll-stops up, a control box
    K.box(1.55, 0.07, 2.3, 0x9aa0a8, X0 - 0.8, 0.3, 0); for (let x = X0 - 1.45; x < X0 - 0.1; x += 0.16) K.box(0.03, 0.012, 2.2, 0x6a6e74, x, 0.342, 0); K.box(0.08, 0.012, 2.3, 0xf2c31a, X0 - 1.52, 0.344, 0);
    for (const s of [-1, 1]) { K.box(0.62, 0.07, 0.08, DARK, X0 - 0.22, 0.52, s * 0.86, 0, 0, 0.7); K.box(0.05, 0.16, 0.5, 0xf2c31a, X0 - 1.5, 0.42, s * 0.75); K.box(0.04, 0.9, 0.04, 0xd8202a, X0 - 1.5, 0.78, s * 1.12); K.box(0.02, 0.16, 0.22, 0xf4f2ec, X0 - 1.5, 1.14, s * 1.12); }
    K.box(0.14, 0.22, 0.1, 0xf2c31a, X0 + 0.25, 0.9, -1.27);
    const m = K.build(); if (m) { m.castShadow = true; m.receiveShadow = true; g.add(m); }
    // glass, lamps and the strip light in the bay (their own materials)
    const add = (geo, mat, x, y, z, ry = 0, rz = 0) => { const q = new THREE.Mesh(geo, mat); q.position.set(x, y, z); q.rotation.set(0, ry, rz); g.add(q); return q; };
    add(new THREE.BoxGeometry(0.04, 0.7, 1.98), glassM, 3.715, 2.3, 0); // the windscreen, upright and flush
    for (const s of [-1, 1]) { add(new THREE.BoxGeometry(0.86, 0.62, 0.03), glassM, 2.66, 2.26, s * 1.135); add(new THREE.BoxGeometry(0.035, 0.16, 0.3), lampM, 3.765, 1.05, s * 0.95); }
    add(new THREE.BoxGeometry(3.6, 0.03, 0.14), bayLightM, (X0 + X1) / 2, Y1 - T - 0.03, 0);
    // the firm on both sides, over the cab doors and on the rear header; a Kaasland plate
    const tex = deps.signTex([{ t: C.who.toUpperCase(), size: 46 }, { t: kind === 'in' ? 'specerijen · groot en klein' : 'vandaag besteld, vandaag geladen', size: 24, color: C.fg }], C.bg, C.fg, 512, 180), lm = deps.lam({ map: tex });
    for (const s of [-1, 1]) { const p = add(new THREE.PlaneGeometry(4.5, 1.58), lm, (X0 + X1) / 2, 2.2, s * (W / 2 + 0.006), s < 0 ? Math.PI : 0); p.receiveShadow = true; }
    const small = deps.lam({ map: deps.signTex([{ t: C.who.split(' ')[0].toUpperCase(), size: 60 }], '#f2f2ee', C.bg, 256, 80) });
    for (const s of [-1, 1]) add(new THREE.PlaneGeometry(0.8, 0.25), small, 2.6, 1.5, s * 1.157, s < 0 ? Math.PI : 0);
    add(new THREE.PlaneGeometry(1.5, 0.2), deps.lam({ map: deps.signTex([{ t: kind === 'in' ? 'PEPER & ZN' : 'KAASLAND KOERIER', size: 44 }], C.bg, C.fg, 512, 68) }), X0 - 0.065, Y1 - 0.02, 0, -Math.PI / 2);
    add(new THREE.PlaneGeometry(0.5, 0.11), deps.lam({ map: deps.signTex([{ t: kind === 'in' ? 'BX-PP-88' : 'KK-01-RR', size: 46 }], '#f4c81c', '#111111', 256, 56) }), X0 - 0.075, 0.5, 0, -Math.PI / 2);
    // freight that stays in the bay: stacked deep against the bulkhead, strapped, with a hand pallet truck
    { const F = deps.kit(), vat = (x, y, z, c) => F.cyl(0.21, 0.21, 0.66, c, x, y, z, 10), bag = (x, y, z) => { F.box(0.86, 0.46, 0.96, 0x2f62b8, x, y, z); F.box(0.86, 0.05, 0.96, 0xf4f2ec, x, y + 0.25, z); };
      for (const [x, z] of [[1.05, -0.6], [1.05, 0.6], [-0.15, -0.6]]) { F.box(1.0, 0.12, 1.1, 0xb08a5a, x, Y0 + 0.1, z); if (kind === 'in') { for (const [dx, dz] of [[-0.25, -0.27], [0.25, -0.27], [-0.25, 0.27], [0.25, 0.27]]) { vat(x + dx, Y0 + 0.5, z + dz, 0xc8a05a); if (x > 0.5) vat(x + dx, Y0 + 1.18, z + dz, 0xb88a48); } } else { bag(x, Y0 + 0.4, z); if (x > 0.5) bag(x, Y0 + 0.92, z); } }
      F.box(0.02, 1.5, 2.2, 0xe8862c, 0.52, Y0 + 0.85, 0); F.box(0.9, 0.06, 0.5, 0xd8202a, -1.2, Y0 + 0.1, 0.62); F.box(0.05, 1.0, 0.05, 0xd8202a, -1.62, Y0 + 0.55, 0.62); F.box(0.05, 0.05, 0.3, 0x1a1a1a, -1.62, Y0 + 1.05, 0.62); // a strap, the pallet truck
      const fm = F.build(); if (fm) g.add(fm); }
    // what comes off (or goes on): pallets on the lift and on the street behind it
    const load = []; for (let i = 0; i < 4; i++) { const P = deps.kit(), onLift = i < 2, px = onLift ? X0 - 0.8 : X0 - 2.3, py = onLift ? 0.34 : 0.0, pz = (i % 2 ? 0.58 : -0.58);
      P.box(1.0, 0.12, 1.1, 0xb08a5a, px, py + 0.1, pz); for (const dz of [-0.45, 0, 0.45]) P.box(1.0, 0.08, 0.1, 0x9a7a4a, px, py + 0.04, pz + dz);
      if (kind === 'in') { for (const [dx, dz] of [[-0.25, -0.27], [0.25, -0.27], [-0.25, 0.27], [0.25, 0.27]]) { P.cyl(0.21, 0.21, 0.66, [0xc8a05a, 0xb88a48][(i + (dx > 0)) % 2], px + dx, py + 0.5, pz + dz, 10); P.cyl(0.215, 0.215, 0.04, 0x3a3e44, px + dx, py + 0.82, pz + dz, 10); } }
      else { P.box(0.9, 0.5, 1.0, 0x2f62b8, px, py + 0.42, pz); P.box(0.9, 0.06, 1.0, 0xf4f2ec, px, py + 0.7, pz); P.box(0.92, 0.5, 0.04, 0xf4f2ec, px, py + 0.42, pz, 0, 0, 0); }
      const pm = P.build(); pm.castShadow = true; g.add(pm); load.push(pm); }
    return { g, load, sol: Object.assign(deps.solid(0, 0, 0, 0), { off: true }) };
  }
  const T = { in: truck('in'), out: truck('out') };
  const site = () => (deps.hal() ? { hall: true, x: deps.dock.x, z: deps.dock.z } : { hall: false, x: deps.front.x, z: deps.front.z });
  function show(kind, on) {
    const t = T[kind], s = site(); t.g.visible = on; t.sol.off = !on; if (!on) return;
    if (s.hall) { t.g.position.set(s.x + 4.6, 0, s.z); t.g.rotation.y = 0; Object.assign(t.sol, { minx: s.x + 0.6, maxx: s.x + 8.6, minz: s.z - 1.3, maxz: s.z + 1.3 }); } // backed up to the dock door, nose east
    else { t.g.position.set(s.x, 0, s.z); t.g.rotation.y = 0; Object.assign(t.sol, { minx: s.x - 3.6, maxx: s.x + 3.8, minz: s.z - 1.25, maxz: s.z + 1.25 }); }
  }
  const spot = () => { const s = site(); return s.hall ? new THREE.Vector3(s.x - 1.2, 0, s.z) : new THREE.Vector3(s.x - 4.6, 0, s.z - 1.9); }; // where Eddy stands to help
  const far = new THREE.Vector3(0, -99, 0);
  let lastHand = 0, active = null;
  const here = (k) => { const j = G()[k]; return j && j.st === 'here' ? j : null; };
  const cur = () => (here('in') ? 'in' : here('out') ? 'out' : null);
  deps.addInteract({ pos: () => (cur() && (!site().hall || deps.inHall()) ? spot() : far), r: 2.4, enabled: () => !!cur() && !deps.busy() && (!site().hall || deps.inHall()),
    label: () => { const k = cur(), j = G()[k]; return `${KIND[k].who} · ${KIND[k].verb} (${Math.round(j.prog * 100)}%)`; },
    act: () => { const k = cur(), j = G()[k], now = performance.now(); if (now - lastHand < 650) return; lastHand = now; j.prog = Math.min(1, j.prog + 1 / STEPS); j.hand = (j.hand | 0) + 1; deps.beep(k === 'in' ? 300 : 360, 0.07, 'square', 0.04); if (j.prog >= 1) finish(k, true); } });

  function arrive(k, night) {
    const j = G()[k]; j.st = 'here'; j.prog = 0; j.night = !!night; show(k, true); active = k;
    const n = deps.naknik(), slot = night ? SLOTS.night : SLOTS[k], where = site().hall ? 'at the dock of De Hal' : 'in front of the shed';
    if (!night) deps.toast(KIND[k].nm, `${KIND[k].who} is ${where} until ${deps.fmt(slot[1])}: ${Math.round(j.kg)} kg to ${k === 'in' ? 'unload' : 'load'}. ${n ? `The Naknikim are on it${n > 1 ? '' : ', slowly: there is only one'}. Lend a hand at the truck if you like.` : 'Nobody on the payroll: do it yourself at the truck.'}`, 6);
    deps.beep(196, 0.25, 'sawtooth', 0.04);
  }
  function finish(k, byEddy) {
    const j = G()[k], K = KIND[k]; j.st = 'done'; let bonus = 0, got = 0;
    if (k === 'in') got = econ.receive ? econ.receive() : 0;
    if (j.night) bonus += NACHT; else if (j.hand >= 3) bonus += 10; // the driver tips a man who carries his own vaten
    if (k === 'out') bonus += Math.min(40, Math.round(j.kg * 0.2)); // on time: the joints pay the freight
    if (bonus) deps.addMoney(bonus);
    deps.toast(k === 'in' ? 'GELOST' : 'GELADEN', k === 'in' ? `${Math.round(got || j.kg)} kg on the shelves.${bonus ? ` +W ${bonus}${j.night ? ' night bonus' : ' from the driver'}.` : ''}` : `${Math.round(j.kg)} kg of blend on its way to the joints. +W ${bonus}${j.night ? ' with the night bonus' : ' freight'}.`, 4.5);
    deps.beep(523, 0.12, 'triangle', 0.05); setTimeout(() => deps.beep(784, 0.2, 'triangle', 0.05), 140);
    leaveAt = 2.5; leaving = k; deps.save();
  }
  let leaving = null, leaveAt = 0;
  function timeout(k) {
    const j = G()[k], K = KIND[k];
    if (j.night) { j.night = false; j.st = 'due'; j.prog = 0; show(k, false); deps.addMoney(-WACHTGELD); deps.toast('TE LAAT', `${K.who} has gone. He is back at ${deps.fmt(SLOTS[k][0])}, and he charges the second trip: −W ${WACHTGELD}.`, 5); deps.save(); return; }
    j.st = 'done'; show(k, false); deps.addMoney(-WACHTGELD);
    if (k === 'in') { const got = econ.receive ? econ.receive() : 0; deps.toast('WACHTGELD', `Nobody came out. The driver stacked ${Math.round(got || j.kg)} kg on the pavement himself and wrote a bill: −W ${WACHTGELD}.`, 5); }
    else deps.toast('WACHTGELD', `The koerier waited until ${deps.fmt(SLOTS.out[1])} and left empty. The joints get their blend late tonight: −W ${WACHTGELD}.`, 5);
    deps.save();
  }

  // ---- a new market day: what is due, and whether the driver is early tonight
  function onDay(day) {
    const g = G(); g.day = day; for (const k of ['in', 'out']) show(k, false); leaving = null;
    if (!deps.ready()) { g.in = g.out = null; if (econ.receive) econ.receive(); return; }
    const kin = dockKg(), kout = blendKg();
    g.in = kin > 0 ? { st: 'due', prog: 0, kg: kin, night: false } : null;
    g.out = kout >= 5 ? { st: 'due', prog: 0, kg: Math.min(kout, 240), night: false } : null;
    const k = g.in ? 'in' : g.out ? 'out' : null;
    if (k && day - (g.lastNight || 0) >= 3 && (Math.random() < 0.3 || window.__goedNight)) { g.lastNight = day; nightCall(k); }
  }
  function nightCall(k) {
    const K = KIND[k], j = G()[k];
    deps.setHour(SLOTS.night[0]); arrive(k, true);
    const still = () => { const q = G()[k]; return q === j && q.st === 'here' && q.night; }; // (a call that comes through late is about nothing)
    const talk = () => still() && deps.dialogue([
      ['Chauffeur', k === 'in' ? `Meneer Eddy? ${K.who}. I am at your door with ${Math.round(j.kg)} kilo. Your men are not there. It is half past five, I know what time it is.` : `Kaasland Koerier. I am early, the ring was empty. You have ${Math.round(j.kg)} kilo for me or not?`],
      ['Eddy Jr.', 'It is the middle of the night.'],
      ['Chauffeur', `It is the start of my day. I wait until ${deps.fmt(SLOTS.night[1])}. After that I come back in my normal slot and you pay the second trip.`],
    ], () => deps.toast(K.nm + ' · 05:30', `The truck is ${site().hall ? 'at the dock of De Hal' : 'in front of the shed'} until ${deps.fmt(SLOTS.night[1])}. The Naknikim start at 08:00: do it yourself for a night bonus of W ${NACHT}, or go back to bed and pay W ${WACHTGELD}.`, 7));
    const missed = () => still() && deps.toast('GEMISTE OPROEP · 05:30', `${K.who} is ${site().hall ? 'at the dock' : 'at the door'} until ${deps.fmt(SLOTS.night[1])}. Night bonus W ${NACHT} if you ${K.verb === 'lossen' ? 'unload' : 'load'} it yourself.`, 6);
    const ph = deps.phone && deps.phone();
    if (!(ph && ph.ringWith && ph.ringWith('truck', { name: `Chauffeur · ${K.who}`, img: null, talk, missed }))) setTimeout(talk, 900);
  }
  function update(dt) {
    const g = G(); if (!deps.ready()) return;
    if (leaving) { if ((leaveAt -= dt) <= 0) { show(leaving, false); leaving = null; } }
    const h = deps.klok.hour(), n = deps.naknik();
    for (const k of ['in', 'out']) {
      const j = g[k]; if (!j) continue; const t = T[k];
      if (j.st === 'due' && h >= SLOTS[k][0] && h < SLOTS[k][1]) arrive(k, false);
      else if (j.st === 'due' && h >= SLOTS[k][1]) timeout(k); // Eddy was away all through the slot
      if (j.st !== 'here') continue;
      if (!t.g.visible) show(k, true); // (after a reload)
      if (n && !j.night && h >= 8) { j.prog = Math.min(1, j.prog + dt * 0.0105 * Math.min(4, n)); if (j.prog >= 1) { finish(k, false); continue; } }
      const left = k === 'in' ? Math.ceil((1 - j.prog) * 4 - 1e-6) : Math.ceil(j.prog * 4 - 1e-6); t.load.forEach((m, i) => { m.visible = i < left; });
      if (h >= (j.night ? SLOTS.night[1] : SLOTS[k][1])) timeout(k);
    }
  }
  // what the PC and the day strip can say about today
  function line() {
    const g = G(), out = [];
    for (const k of ['in', 'out']) { const j = g[k]; if (!j) continue; out.push(`${KIND[k].nm.toLowerCase()} ${deps.fmt(SLOTS[k][0])}–${deps.fmt(SLOTS[k][1])}: ${Math.round(j.kg)} kg ${j.st === 'done' ? '✓' : j.st === 'here' ? `(${Math.round(j.prog * 100)}%)` : ''}`); }
    return out.join(' · ');
  }
  return { onDay, update, line, SLOTS, trucks: T, state: G, site, nightCall, finish };
}
