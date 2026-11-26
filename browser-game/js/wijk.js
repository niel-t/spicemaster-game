// The other districts as open streets (Tristan 2026-11-26: "complete open world, but only per district it should be
// opened"). The snelweg used to end at a car park and drop Eddy straight into the raid. Now the afrit ends in the
// district itself: a grid of streets (two long ones, four dwarsstraten) where every joint of that clan has its own
// door. Eddy parks, walks or borrows a car, and kicks in the door he came for (or another one that is open to him).
// A district exists only once the story lets him drive there (the joints' own unlock rules), so the map opens
// district by district: Oud-Vettenburg, Hipsterheuvel, De Duistere Dokken, De Zandwijk.
//
// Each district is built the first time Eddy arrives, far from the home streets, and hidden again when he leaves.
// While he is there main.js treats him as "away" (the same gate as a trip), so nothing at home interrupts.

export const WIJKEN = {
  lampas: { name: 'Oud-Vettenburg', gang: 'Lampas', seed: 11, at: 0,
    signs: ['FRITUUR DE VETTE HAP', 'CAFE HET VETTE VARKEN', 'GOKHAL JACKPOT', 'SLAGERIJ VAN KAAS', 'TABAK & LOTTO', 'SNACKBAR OUD-VET', 'KROEG DE LAMP', 'PATAT SPECIAAL'] },
  nosh: { name: 'Hipsterheuvel', gang: 'Noshgey Kariot', seed: 23, at: 1, colors: [0xf2c8d0, 0xcfe8d8, 0xf6e7b0, 0xc8dcf2, 0xe8d0f0, 0xf4d4b8], tree: 2,
    signs: ['HAVERMELKBAR', 'YOGA & KOMBUCHA', 'FIETSCAFE DE KETTING', 'VINTAGE', 'BARBIER BAARD', 'PLANTENWINKEL', 'BROODJE AVOCADO', 'COWORKING'] },
  docks: { name: 'De Duistere Dokken', gang: 'Abdavissies', seed: 37, at: 2, colors: [0x3a4450, 0x4a4038, 0x2e3a44, 0x5a5048, 0x38424a], brick: true, tree: 0,
    signs: ['SCHEEPSHANDEL', 'HAVENCAFE HET ANKER', 'VISHAL', 'TOUW & ZEIL', 'DOUANE', 'CONTAINERVERHUUR', 'ZEEMANSHUIS', 'KRAANVERHUUR'] },
  sand: { name: 'De Zandwijk', gang: 'Paravim', seed: 53, at: 3, colors: [0xe8d2a0, 0xf2ead8, 0xd8a868, 0xc87848, 0xf0dcb0], ground: 0xd8b878, tree: 0,
    signs: ['THEEHUIS', 'SOUK', 'DADELS & NOTEN', 'TAPIJTEN', 'SHISHA LOUNGE', 'KRUIDENBAZAAR', 'BAKKERIJ PITA', 'KOPERSMID'] },
};
// the plan of every district, in its own coordinates: three long streets (z 0, 46, 92) and five dwarsstraten (four on a phone),
// so twelve blocks; the one in the middle of the first strip is the plein. The afrit is at the west end of the first street,
// the oprit at its east end.
const SZ = [0, 46, 92], RW = 4, PV = 2.5, HZ = 11; // road half width, pavement, house row centre
const SA = SZ[0], PLEIN = [0, 1]; // strip, block

// deps: THREE, scene, player, state, house, spanWidths, solid, solids, fadeables, car, kit, lam, lamp, tree, bollard, ST, kerbMat, groundMat,
//       signTex, addInteract, toast, dialogue, choice, setBounds, snapCam, setArea, makeVan, fadeTo(fn), route(x, z, label) / route(null),
//       joints(key) -> [{ name, id, open(), owned(), retaken() }], raid(id), clientLine(id), goHome(), dismount(), busy(), low,
//       adoptVan(van, solid) -> the ride system's vehicle, mount(v), riding() -> vehicle | null, isOpen(key), trip({ from, to, theme, onDone })
export function createWijk(deps) {
  const { THREE, scene, player } = deps;
  const towns = {};
  const XS = deps.low ? [0, 76, 152, 228] : [0, 76, 152, 228, 304], BLK = XS.slice(1).map((x, i) => [XS[i] + 6, x - 6]), XE = XS[XS.length - 1];
  const RECT = { x0: -5.6, x1: XE + 5.6, z0: SZ[0] - RW - PV + 0.4, z1: SZ[SZ.length - 1] + RW + PV - 0.4 };
  let T = null, back = null, wasMission = false, van = null, vanSol = null, veh = null, target = null, atOprit = false;
  const origin = (W) => ({ x: 3000 + W.at * 700, z: -1500 });

  function build(key) {
    const W = WIJKEN[key], O = origin(W), low = deps.low, ST = deps.ST, t = { key, W, O, objs: [], sols: [], houses: [], doors: [], vis: true };
    const n0 = scene.children.length, s0 = deps.solids.length, f0 = deps.fadeables.length;
    const g = new THREE.Group(), K = deps.kit(), WH = 0xf4f2ec, X0 = XS[0] - 6, X1 = XE + 6, L = X1 - X0, ZN = SZ[SZ.length - 1];
    const flat = (x0, x1, z0, z1, m, y, alongZ) => { const len = alongZ ? z1 - z0 : x1 - x0, wid = alongZ ? x1 - x0 : z1 - z0, geo = new THREE.PlaneGeometry(len, wid), uv = geo.attributes.uv, k = len / 200;
      for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * k);
      const p = new THREE.Mesh(geo, m); p.rotation.x = -Math.PI / 2; if (alongZ) p.rotation.z = Math.PI / 2; p.position.set(O.x + (x0 + x1) / 2, y, O.z + (z0 + z1) / 2); p.receiveShadow = true; g.add(p); return p; };
    const ground = W.ground ? deps.lam({ color: W.ground }) : deps.groundMat;
    flat(X0 - 60, X1 + 60, SA - 80, ZN + 80, ground, 0);
    // the long streets: tarmac with parking along the north kerb, klinker pavements
    for (const zs of SZ) {
      flat(X0, X1, zs - RW, zs + RW, ST.road, 0.02); flat(X0, X1, zs - RW, zs - RW + 2, ST.bay, 0.022);
      flat(X0, X1, zs - RW - PV, zs - RW, ST.paveN, 0.012); flat(X0, X1, zs + RW, zs + RW + PV, ST.paveN, 0.012);
      for (const z of [zs - RW - 0.1, zs + RW + 0.1]) { const q = new THREE.Mesh(new THREE.BoxGeometry(L, 0.16, 0.18), deps.kerbMat); q.position.set(O.x + (X0 + X1) / 2, 0.08, O.z + z); q.receiveShadow = true; g.add(q); }
      for (let x = X0 + 2; x < X1; x += 4) K.box(2, 0.01, 0.12, WH, O.x + x, 0.035, O.z + zs + 1);
      K.box(L, 0.01, 0.1, WH, O.x + (X0 + X1) / 2, 0.032, O.z + zs - RW + 2);
      for (let x = X0 + 2.8; x < X1; x += 5.6) K.box(0.1, 0.01, 1.9, WH, O.x + x, 0.032, O.z + zs - RW + 1);
    }
    // the dwarsstraten: klinkers from the Lange straat to the Achterstraat
    for (let si = 0; si < SZ.length - 1; si++) for (const X of XS) { flat(X - 3, X + 3, SZ[si] + RW, SZ[si + 1] - RW, ST.bay, 0.024, true); for (const s of [-1, 1]) flat(X + s * 4.5 - 1.5, X + s * 4.5 + 1.5, SZ[si] + RW + PV, SZ[si + 1] - RW - PV, ST.paveN, 0.014, true); }
    { const km = K.build(); if (km) g.add(km); }
    { const pts = []; for (const zs of SZ) for (let x = X0 + 9; x < X1; x += 18) pts.push([O.x + x, O.z + zs - RW + 0.6]); deps.lampPool(pts, g); } // light under the lamps at night
    // zebras where a dwarsstraat meets a long street
    { const KZ = deps.kit(); for (const zs of SZ) for (const X of XS) for (const s of [-1, 1]) for (let q = -3; q <= 3; q++) KZ.box(1.6, 0.012, 0.42, WH, O.x + X + s * 7.2, 0.034, O.z + zs + q * 0.95 + 0.5); const km = KZ.build(); if (km) g.add(km); }
    scene.add(g);
    // lamps, trees and Amsterdammertjes, a stretch at a time so what is off screen is not drawn
    for (let sa = X0; sa < X1; sa += 40) {
      const K2 = deps.kit(), T2 = deps.kit(), inS = (x) => x >= sa && x < sa + 40;
      for (const zs of SZ) {
        for (let x = X0 + 9; x < X1; x += 18) if (inS(x)) { deps.lamp(O.x + x, O.z + zs - RW - 0.5, K2); }
        if (W.tree !== 0) for (let x = X0 + 5; x < X1; x += W.tree === 2 ? 9 : 14) if (inS(x) && XS.every((X) => Math.abs(x - X) > 7)) deps.tree(O.x + x, O.z + zs + RW + 0.9, 0.8, T2);
        for (let x = X0 + 1.4; x < X1; x += 2.8) if (inS(x) && XS.every((X) => Math.abs(x - X) > 6.4)) deps.bollard(O.x + x, O.z + zs + RW + 0.25, K2);
      }
      const km = K2.build(), tm = T2.build(); if (km) scene.add(km); if (tm) { tm.castShadow = !low; scene.add(tm); }
    }
    // houses. Rows facing south (their fronts to the camera) carry the joints and the shops.
    const jl = deps.joints(key), spots = [];
    const opt = (k) => (W.colors ? { color: W.colors[(k * 7 + W.seed) % W.colors.length], brick: !!W.brick } : {});
    const row = (x0, x1, zc, facing, seed, shops) => { let x = x0, k = 0; for (const w of deps.spanWidths(x1 - x0, seed)) { const h = { x: x + w / 2, w, k, zc, facing }; x += w; k++;
      if (shops && h.k % 4 === 1 && w >= 5) spots.push(h); else place(h, shops && h.k % 4 === 3 ? W.signs[(h.k + seed) % W.signs.length] : null); } };
    const place = (h, sign, joint) => { const f0 = deps.fadeables.length; deps.house(O.x + h.x, O.z + h.zc, h.w, 9, joint ? 10.5 : 9 + ((h.k + W.seed) % 4) * 1.1, h.facing, h.k + W.seed, sign, opt(h.k)); if (h.facing) for (let i = f0; i < deps.fadeables.length; i++) deps.fadeables[i].userData.cut = true; }; // a row with its back to the camera is cut away where Eddy is
    const isPlein = (si, bi) => si === PLEIN[0] && bi === PLEIN[1];
    row(X0, X1, SA - HZ, 0, W.seed, true); // north of the first street
    for (let si = 0; si < SZ.length - 1; si++) BLK.forEach(([a, b], bi) => { if (isPlein(si, bi)) return; row(a, b, SZ[si] + HZ, Math.PI, W.seed + a + si * 5, false); row(a, b, SZ[si + 1] - HZ, 0, W.seed + a + 3 + si * 5, true); });
    row(X0, X1, ZN + HZ, Math.PI, W.seed + 9, false); // south of the last street
    // the joints take the shop fronts nearest the afrit first, the rest become ordinary shops
    spots.sort((p, q) => (p.x + Math.max(0, p.zc) * 0.9) - (q.x + Math.max(0, q.zc) * 0.9));
    const step = Math.max(1, Math.floor((spots.length - 1) / Math.max(1, jl.length)));
    spots.forEach((h, i) => { const j = i >= 1 && (i - 1) % step === 0 ? jl[(i - 1) / step] : null; // (the first shop front is right at the afrit: too easy)
      if (j) { place(h, j.name.toUpperCase(), true); const door = { x: O.x + h.x + (h.w * 0.9 / 2 - 0.72), z: O.z + h.zc + 4.5 + 0.6, j }; t.doors.push(door);
        deps.addInteract({ pos: () => new THREE.Vector3(door.x, 0, door.z), r: 1.6, enabled: () => T === t && !deps.busy(), label: () => `${j.name} · ${j.owned() && !j.retaken() ? 'your client' : j.open() ? 'raid this joint' : W.gang + ' turf'}`, act: () => knock(t, door) }); }
      else place(h, W.signs[(h.k + i) % W.signs.length]); });
    // the block interiors: gardens behind a wall along the dwarsstraten; the plein is open
    { const K3 = deps.kit(), T3 = deps.kit();
      for (let si = 0; si < SZ.length - 1; si++) BLK.forEach(([a, b], bi) => { const za = SZ[si], zb = SZ[si + 1], zm = (za + zb) / 2;
        if (isPlein(si, bi)) { // klinkers, lindens round the edge, benches, a bandstand in the middle and a herring cart
          flat(a, b, za + RW + PV, zb - RW - PV, ST.paveN, 0.013);
          for (let x = a + 5; x < b - 3; x += 9) for (const z of [za + RW + PV + 3, zb - RW - PV - 3]) deps.tree(O.x + x, O.z + z, 0.95, T3);
          const cx = O.x + (a + b) / 2, cz = O.z + zm;
          K3.cyl(4.2, 4.4, 0.6, 0xcfc8b8, cx, 0.3, cz, 8); for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2 + Math.PI / 8; K3.cyl(0.09, 0.09, 3.0, 0x2a5a3a, cx + Math.cos(an) * 3.8, 2.1, cz + Math.sin(an) * 3.8, 8); } K3.cyl(0.4, 4.6, 1.3, 0x2a5a3a, cx, 4.25, cz, 8); K3.cyl(0.12, 0.12, 0.7, 0xd8b040, cx, 5.2, cz, 6);
          deps.solid(cx - 3.2, cx + 3.2, cz - 3.2, cz + 3.2);
          for (const [dx, dz] of [[-14, -7], [14, -7], [-14, 7], [14, 7], [0, -10], [0, 10]]) { K3.box(1.9, 0.08, 0.5, 0x7a5a3a, cx + dx, 0.48, cz + dz); K3.box(1.9, 0.5, 0.08, 0x7a5a3a, cx + dx, 0.75, cz + dz - 0.24); for (const e of [-0.8, 0.8]) K3.box(0.08, 0.48, 0.5, 0x2a2c30, cx + dx + e, 0.24, cz + dz); }
          K3.box(2.6, 1.0, 1.4, 0xf4f2ec, cx - 22, 0.9, cz + 2); K3.box(3.0, 0.1, 1.9, 0xd8202a, cx - 22, 2.4, cz + 2); for (const e of [-1.2, 1.2]) K3.box(0.07, 1.1, 0.07, 0x8a8e94, cx - 22 + e, 1.85, cz + 2.6); K3.cyl(0.32, 0.32, 0.12, 0x1a1a1a, cx - 22.9, 0.32, cz + 2.75, 10, Math.PI / 2); K3.cyl(0.32, 0.32, 0.12, 0x1a1a1a, cx - 21.1, 0.32, cz + 2.75, 10, Math.PI / 2);
          deps.solid(cx - 23.4, cx - 20.6, cz + 1.2, cz + 2.8);
          const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.5), deps.lam({ map: deps.signTex([{ t: W.name === 'De Zandwijk' ? 'FALAFEL' : 'HOLLANDSE NIEUWE', size: 40 }], '#14499a', '#ffffff', 512, 100) })); sg.position.set(cx - 22, 2.05, cz + 2.72); scene.add(sg);
          return; }
        for (const x of [a, b]) K3.box(0.3, 2.3, zb - za - 2 * (HZ + 4.5) + 0.2, 0x8a4a3a, O.x + x + (x === a ? 0.15 : -0.15), 1.15, O.z + zm);
        deps.solid(O.x + a, O.x + b, O.z + za + RW + PV, O.z + zb - RW - PV); });
      const km = K3.build(), tm = T3.build(); if (km) { km.castShadow = !low; scene.add(km); } if (tm) { tm.castShadow = !low; scene.add(tm); } }
    // the ends of the district: a wall of houses, the afrit in the west and the oprit in the east
    for (const [x, f] of [[X0 - 4.5, Math.PI / 2], [X1 + 4.5, -Math.PI / 2]]) { let z = SA - HZ - 4.5, k = 0; for (const w of deps.spanWidths(ZN - SA + 2 * HZ + 9, W.seed + 2)) { deps.house(O.x + x, O.z + z + w / 2, w, 9, 9.5 + (k % 3), f, k + W.seed, null, { ...opt(k), simple: true }); z += w; k++; } }
    { const sg = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.3), deps.lam({ map: deps.signTex([{ t: 'A10  Kipkruidenkwartier', size: 34 }, { t: 'stap in de Oofmobiel', size: 22 }], '#14499a', '#ffffff', 512, 196) })); sg.position.set(O.x + XS[0] + 7.5, 3.2, O.z + SA + RW + 1.2); scene.add(sg);
      const pole = new THREE.Mesh(new THREE.BoxGeometry(0.12, 2.6, 0.12), deps.lam({ color: 0x8a8e94 })); pole.position.set(O.x + XS[0] + 7.5, 1.3, O.z + SA + RW + 1.14); scene.add(pole);
      const s2 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.5), deps.lam({ map: deps.signTex([{ t: 'A10  oprit', size: 44 }, { t: 'alle richtingen · rij hier de snelweg op', size: 20 }], '#14499a', '#ffffff', 512, 184) })); s2.position.set(O.x + XE - 1, 3.4, O.z + SA - RW - 1.6); scene.add(s2);
      const p2 = pole.clone(); p2.position.set(O.x + XE - 1, 1.3, O.z + SA - RW - 1.66); scene.add(p2);
      const ar = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.35, depthWrite: false })); ar.rotation.x = -Math.PI / 2; ar.position.set(O.x + XE, 0.05, O.z + SA + 1); scene.add(ar); }
    // parked cars to borrow, along the north kerbs
    { let k = W.seed; for (const zs of SZ) for (let x = X0 + 14; x < X1 - 6; x += 5.6) { k++; if ((k * 7) % (low ? 6 : 3) !== 0 || XS.some((X) => Math.abs(x - X) < 7)) continue; deps.car(O.x + x, O.z + zs - RW + 1, null, (k % 2) * Math.PI, true); } }
    for (let i = n0; i < scene.children.length; i++) t.objs.push(scene.children[i]);
    for (let i = s0; i < deps.solids.length; i++) t.sols.push(deps.solids[i]);
    for (let i = f0; i < deps.fadeables.length; i++) t.houses.push(deps.fadeables[i]);
    return (towns[key] = t);
  }
  function setVis(t, on) {
    if (t.vis === on) return; t.vis = on;
    for (const o of t.objs) o.visible = on;
    for (const s of t.sols) s.off = !on;
    const F = deps.fadeables;
    if (on) { for (const h of t.houses) if (!F.includes(h)) F.push(h); } else for (const h of t.houses) { const i = F.indexOf(h); if (i >= 0) F.splice(i, 1); }
  }
  function knock(t, door) {
    const j = door.j, W = t.W;
    if (j.owned() && !j.retaken()) { deps.dialogue([deps.clientLine(j.id) || [j.name, 'Open for business. Your spice, our kitchen.']]); return; }
    if (!j.open()) { deps.toast(j.name.toUpperCase(), `${W.gang} turf, and not a door you can kick in yet. Take the joints before it first.`, 3.5); return; }
    deps.choice('Eddy Jr.', `${j.name}. ${j.retaken() ? `The ${W.gang} took it back.` : `${W.gang} inside.`} Walk in and take it? <small>A raid takes the whole day.</small>`, ['Kick the door in', 'Not now'], (i) => { if (i === 0) { back = { x: door.x, z: door.z + 1.0 }; deps.dismount(); deps.raid(j.id); } });
  }
  function placeVan(t) {
    if (!van) { van = deps.makeVan(); scene.add(van); vanSol = deps.solid(0, 0, 0, 0); veh = deps.adoptVan(van, vanSol);
      deps.addInteract({ pos: () => van.position, r: 3.2, enabled: () => !!T && !deps.busy() && !deps.riding(), label: () => 'Oofmobiel · step in, or take the snelweg', act: () => deps.choice('Eddy Jr.', `The Oofmobiel, in ${T.W.name}.`, ['Step in and drive', 'Take the snelweg…', 'Stay'], (i) => { if (i === 0) deps.mount(veh); else if (i === 1) setTimeout(snelweg, 60); }) }); }
    const x = t.O.x + XS[0] + 1, z = t.O.z + SA + RW - 1.2; van.position.set(x, 0, z); van.rotation.y = 0; van.visible = true; // nose east, down the street
    Object.assign(veh.B, { x, z, h: Math.PI / 2, v: 0 });
    Object.assign(vanSol, { minx: x - 2.6, maxx: x + 2.6, minz: z - 1.05, maxz: z + 1.05, off: false });
  }
  // where the snelweg goes from here: home, or any other district the story has opened
  function snelweg() {
    if (!T || deps.busy()) return;
    const dests = [null, ...Object.keys(WIJKEN).filter((k) => k !== T.key && deps.isOpen(k))];
    deps.choice('A10', `From ${T.W.name}. Where to?`, [...dests.map((k) => (k ? `${WIJKEN[k].name} (${WIJKEN[k].gang})` : 'Kipkruidenkwartier (home)')), 'Stay here'], (i) => { if (i < dests.length) travel(dests[i]); });
  }
  function travel(dest) { // onto the snelweg in the Oofmobiel: to another district, or home
    if (!T) return; const from = T.W.name;
    deps.fadeTo(() => { quit(); deps.trip({ from, to: dest ? WIJKEN[dest].name : 'Kipkruidenkwartier', theme: dest || 'lampas', onDone: (res) => { if (dest && res && res.arrived) enter(dest); } }); }, 650);
  }
  function quit() { const t = T; if (!t) return; deps.dismount(); T = null; target = null; back = null; atOprit = false; setVis(t, false); if (van) { van.visible = false; vanSol.off = true; } deps.setBounds(null); deps.route(null); deps.goHome(); deps.setArea('KAASLAND · KIPKRUIDENKWARTIER'); deps.snapCam(); }
  const bounds = (t) => ({ x0: t.O.x + RECT.x0, x1: t.O.x + RECT.x1, z0: t.O.z + RECT.z0, z1: t.O.z + RECT.z1 });
  // arrive in a district (after the afrit). o.target: the joint Eddy came for (its door gets the route arrow)
  function enter(key, o = {}) {
    if (!WIJKEN[key] || T) return false;
    const t = towns[key] || build(key); setVis(t, true); T = t; target = o.target || null; back = null;
    placeVan(t); deps.setBounds(bounds(t));
    player.visible = true; player.position.set(van.position.x + 0.4, 0, van.position.z + 2.4); player.rotation.set(0, 0, 0); deps.snapCam();
    deps.setArea(`KAASLAND · ${t.W.name.toUpperCase()}`);
    const d = target && t.doors.find((q) => q.j.id === target);
    if (d) deps.route(d.x, d.z, d.j.name);
    deps.toast(t.W.name.toUpperCase(), d ? `${d.j.name} is down the street. Walk or drive there. The A10 oprit is at the east end of this street.` : `${t.W.gang} turf. Every joint has its own door. The A10 oprit is at the east end of this street.`, 5);
    return true;
  }
  function leave(quiet) { if (!T) return; if (quiet) quit(); else deps.fadeTo(quit); } // straight home, without the drive
  function update(dt, inMission) {
    if (!T) return;
    if (inMission) { wasMission = true; return; }
    if (wasMission) { // back from a raid: Eddy stands at the door he kicked in, the district around him again
      wasMission = false; deps.setBounds(bounds(T)); const p = back || { x: van.position.x + 0.4, z: van.position.z + 2.4 }; back = null;
      player.position.set(p.x, 0, p.z); deps.setArea(`KAASLAND · ${T.W.name.toUpperCase()}`); deps.route(null); deps.snapCam();
    }
    // the oprit: drive the Oofmobiel onto the yellow patch at the east end of the first street
    const near = deps.riding() === veh && Math.abs(veh.B.x - (T.O.x + XE)) < 3.2 && Math.abs(veh.B.z - (T.O.z + SA + 1)) < 3.2;
    if (near && !atOprit && !deps.busy()) { atOprit = true; veh.B.v = 0; snelweg(); } else if (!near) atOprit = false;
  }
  const streets = () => (T ? SZ.map((zs) => ({ x0: T.O.x - 4, x1: T.O.x + XE + 4, lanes: [T.O.z + zs - 0.5, T.O.z + zs + 2.5], walks: [T.O.z + zs - RW - 1.3, T.O.z + zs + RW + 1.5] })) : null);
  return { enter, leave, travel, snelweg, streets, update, WIJKEN, XS, SZ, vehicle: () => veh, get active() { return !!T; }, get town() { return T; }, towns, rect: RECT, origin: (key) => origin(WIJKEN[key]) };
}
