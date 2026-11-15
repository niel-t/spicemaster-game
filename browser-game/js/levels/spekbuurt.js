// Mission 1: Spekbuurt. Slager & Shoarma Spekbuurt, a Lampas butcher-and-shoarma corner shop in Kipkruidenkwartier.
// Level data for the mission engine (js/mission.js). Grid cells are 1 m; cell (x, z) covers world
// [OX + x, OX + x + 1] × [Z0 + z, Z0 + z + 1] with Z0 = -H, so the bottom grid row sits on world z = 0 and the road lies south of it.
// Positions marked "world" use x relative to OX and absolute world z; everything else is in cells.
//
// Built after the concept art (01_References/05_Kaasland/00_Start_Spekbuurt): a red-and-white striped shop front on a cobbled
// corner, a white-tiled butcher's prep room full of steel tables and spice tubs, a cold room with meat on rails, and a brick back
// office with a CRT and a safe. Rebuilt 2026-11-15 to read at a glance: one hub room, every room one door from it.
//
//   street ─ front door ─ shop ─ PERSONEEL ─ PREP ROOM (the hub) ─ kantoor (Manager Kees) ─ opslag
//                           └─ koelcel ─────────┘        └─ gang ─ staff door ─ steeg (alley) ─ street
//
// Parking (def.parking): the Oofmobiel stops in a paid bay. Pay at the parkeermeter (in view of the shop window) or by app,
// or the gemeente scan car writes a ticket (js/garage.js keeps the tickets; two open ones bring a handhaver with a wheel clamp).
// Shootouts: quiet staff up front, the main fight between the steel tables, an ambush among the carcasses in the koelcel,
// and Kees behind his desk. The first loud shot calls a Lampas backup car to the street (spawns with { wave: 1 }).
// Spice tubs (u) burst when shot: a paprika cloud knocks down and blinds whoever stands next to them.

import { glowSprite, puddles, STREET_FURN } from './props.js';

const W = 38, H = 24;
const FZ = -H + 19; // world z of the shop front (the south face of facade row 18)
const PAPRIKA = [0xd8461e, 0xe8862c, 0xe8b020, 0xc8301a]; // spice tub colours: paprika, kerrie, kurkuma, chili
const SPICE = ['PAPRIKA!', 'KERRIE!', 'KURKUMA!', 'CHILI!'];

export default {
  id: 'spekbuurt', name: 'Spekbuurt', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['koelcel', 1, 1, 10, 10, 'coldtile'], ['shop', 1, 12, 10, 17, 'shoptile'],
    ['kantoor', 12, 1, 20, 5, 'parquet'], ['opslag', 22, 1, 32, 5, 'concrete'],
    ['prep', 12, 7, 25, 17, 'tiles'], ['gang', 27, 7, 32, 17, 'hall'],
    ['steeg', 34, 1, 37, 18, 'cobble'], ['street', 0, 19, 37, 23, 'cobble'],
  ],
  roomNames: { koelcel: 'KOELCEL', shop: 'DE WINKEL', kantoor: 'KANTOOR', opslag: 'OPSLAG', prep: 'SLACHTERIJ', gang: 'ACHTERGANG', steeg: 'DE STEEG', street: 'SPEKSTRAAT' },
  minimap: true, guide: true,
  layout({ carve, put, putR }) {
    // ways in: the shop's front door on the street, or the staff door in the alley
    carve(6, 18, 7, 18);         // the front door (open)
    putR(33, 14, 33, 15, 'D');   // gang ↔ steeg: the staff door
    // inside, every door is a 2-cell swing door
    putR(11, 14, 11, 15, 'D');   // shop ↔ prep (PERSONEEL)
    putR(8, 11, 9, 11, 'D');     // shop ↔ koelcel
    putR(11, 8, 11, 9, 'D');     // koelcel ↔ prep
    putR(15, 6, 16, 6, 'D');     // prep ↔ kantoor
    putR(21, 2, 21, 3, 'D');     // kantoor ↔ opslag
    putR(26, 11, 26, 12, 'D');   // prep ↔ gang
    putR(29, 6, 30, 6, 'D');     // gang ↔ opslag
    // the shop windows
    putR(1, 18, 5, 18, '%'); putR(8, 18, 10, 18, '%');
    // shop: the glass meat counter, the döner grill, a drinks fridge, two tables, a plant
    putR(2, 14, 6, 14, 'K'); put(1, 12, 'Y'); put(10, 13, 'F'); putR(2, 16, 3, 16, 'T'); putR(8, 16, 9, 16, 'T'); put(10, 17, 'p');
    // koelcel: carcasses on rails (they block sight), a rack, freezer chests
    for (const x of [3, 6]) for (const z of [2, 4, 6, 8]) put(x, z, 'H');
    put(9, 4, 'H'); put(9, 6, 'H'); putR(1, 1, 1, 3, 'R'); putR(8, 1, 10, 1, 'C');
    // prep room, the hub: four steel tables, spice tubs in the middle and along the front, a scale cabinet
    putR(14, 9, 16, 10, 'w'); putR(20, 9, 22, 10, 'w'); putR(14, 14, 16, 15, 'w'); putR(20, 14, 22, 15, 'w');
    putR(18, 12, 19, 12, 'u'); putR(13, 17, 14, 17, 'u'); putR(23, 17, 24, 17, 'u'); put(25, 7, 'F');
    // kantoor: Kees's desk, the safe, a filing cabinet, a bookcase, the sofa
    putR(15, 3, 17, 3, 'O'); put(20, 1, 'V'); put(12, 1, 'F'); putR(12, 3, 12, 4, 'R'); putR(18, 5, 19, 5, 'S');
    // opslag: racks of Lampas spice, crates, a barrel
    putR(24, 1, 24, 3, 'R'); putR(27, 1, 27, 3, 'R'); putR(30, 1, 30, 3, 'R'); put(32, 5, 'C'); put(25, 5, 'C'); put(32, 1, 'X');
    // gang: crates, a vending machine, a barrel by the staff door
    put(27, 9, 'C'); put(32, 10, 'C'); put(32, 7, 'F'); put(32, 17, 'X');
    // steeg: big kliko containers, a lamp, a bike, a crate
    putR(36, 3, 37, 4, 'Z'); putR(36, 9, 37, 9, 'Z'); put(34, 6, 'l'); put(37, 16, 'k'); put(34, 1, 'C');
    // street: bollards, the parkeermeter (in view of the shop window), lamps, bikes, a bench
    for (const x of [12, 15, 18, 21, 24]) put(x, 19, 'o');
    put(5, 21, 'm'); put(1, 23, 'l'); put(30, 23, 'l'); putR(26, 19, 28, 19, 'k'); putR(2, 19, 3, 19, 'h');
  },
  furn: {
    ...STREET_FURN,
    // the glass meat counter: steel base, cold display full of meat
    K: { h: 1.1, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz, x, OX }) => {
      box(n - 0.06, 0.8, 0.9, lam({ color: 0xd8dcd8 }), cx, 0.4, cz, root);
      const gl = new THREE.Mesh(new THREE.BoxGeometry(n - 0.1, 0.32, 0.8), new THREE.MeshPhongMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.3, shininess: 120 })); gl.position.set(cx, 0.97, cz); root.add(gl);
      for (let k = 0; k < n * 2; k++) box(0.34, 0.08, 0.3, lam({ color: [0xc83a3a, 0xe8a0a0, 0xa8301e, 0xe0c090][(x + k) % 4] }), OX + x + 0.28 + k * 0.5, 0.85, cz + 0.05, root, false);
    } },
    // the döner grill: a steel cabinet with the spit turning on top (decorate spins it)
    Y: { h: 1.1, cover: true, draw: ({ box, lam, root, cx, cz }) => { box(0.94, 1.0, 0.9, lam({ color: 0xb8bcc0 }), cx, 0.5, cz, root); box(0.6, 0.9, 0.1, lam({ color: 0xff8a3a, emissive: 0x5a1a00 }), cx, 1.5, cz - 0.38, root, false); } },
    // a carcass on a rail: blocks walking, sight and bullets (it swings when shot)
    H: { h: 2.0, cover: true, sight: true, draw: ({ THREE, root, box, lam, cyl, n, x, cz, OX }) => {
      for (let k = 0; k < n; k++) {
        const px = OX + x + k + 0.5, g = new THREE.Group(); g.position.set(px, 2.25, cz); g.userData.sway = true; root.add(g);
        box(0.04, 0.35, 0.04, lam({ color: 0x9a9ca0 }), 0, -0.18, 0, g, false);
        const geo = THREE.CapsuleGeometry ? new THREE.CapsuleGeometry(0.3, 0.8, 4, 8) : new THREE.CylinderGeometry(0.32, 0.22, 1.3, 8);
        const m = new THREE.Mesh(geo, lam({ color: 0xb8443a })); m.position.y = -1.0; m.scale.set(1, 1, 0.75); m.castShadow = true; g.add(m);
        box(0.3, 0.5, 0.18, lam({ color: 0xf0d8c8 }), 0, -0.95, 0.1, g, false); // fat
        cyl(0.03, 0.03, 1.02, lam({ color: 0x6a6c70 }), px, 2.3, cz, root, 6).rotation.x = Math.PI / 2;
      }
    } },
    // a spice tub: knee-high white bin heaped with spice; cover, and a cloud when you shoot it open
    u: { h: 0.8, cover: true, draw: ({ THREE, root, cyl, lam, n, x, z, cz, OX }) => {
      for (let k = 0; k < n; k++) {
        const px = OX + x + k + 0.5, c = PAPRIKA[(x + k + z) % 4];
        cyl(0.4, 0.34, 0.72, lam({ color: 0xf2efe6 }), px, 0.36, cz, root, 14);
        const heap = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), lam({ color: c })); heap.scale.y = 0.45; heap.position.set(px, 0.72, cz); heap.userData.tub = `${x + k},${z}`; root.add(heap);
      }
    } },
    // kliko / alley container: green plastic, waist high, stops bullets
    Z: { h: 1.2, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.1, 1.1, 0.9, lam({ color: 0x2a5a32 }), cx, 0.55, cz, root); box(n, 0.08, 1.0, lam({ color: 0x1e4224 }), cx, 1.14, cz, root, false); } },
    // the parkeermeter: a grey post with a blue P on top (thin: no cover)
    m: { h: 1.4, cover: false, draw: ({ THREE, root, box, cyl, lam, cx, cz }) => {
      cyl(0.06, 0.07, 1.25, lam({ color: 0x4a4e54 }), cx, 0.62, cz, root, 8);
      box(0.32, 0.42, 0.24, lam({ color: 0x5a5e66 }), cx, 1.42, cz, root, false);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.12), new THREE.MeshBasicMaterial({ color: 0x9ad8a0 })); scr.position.set(cx, 1.48, cz + 0.125); root.add(scr);
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshBasicMaterial({ color: 0x1f4fa0 })); p.position.set(cx, 1.82, cz + 0.02); root.add(p);
      const pg = glowSprite(THREE, 0x6a9aff, 0.9, 0.9, 0.35); pg.position.set(cx, 1.82, cz + 0.1); root.add(pg);
    } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.88, 0.94, lam({ color: 0x9aa0a4 }), cx, 0.44, cz, root); box(n, 0.05, 1.0, lam({ color: 0xd8dce0 }), cx, 0.92, cz, root, false); } },
    O: { color: 0x5a3a20 }, R: { color: 0x6a4a2a }, C: { color: 0x9a7444 },
  },
  rackGoods: [0xd8461e, 0xe8b020, 0x9a5a2a],
  floors: {
    coldtile: (g) => { g.fillStyle = '#b8c8d0'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#7a8a94'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } g.fillStyle = 'rgba(160,30,30,.18)'; g.beginPath(); g.arc(40, 24, 7, 0, 7); g.fill(); },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#b8202a'; g.fillRect(x * 16, y * 16, 16, 16); } },
    tiles: (g) => { g.fillStyle = '#e8ecea'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#a8b4b4'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } g.fillStyle = 'rgba(200,90,30,.12)'; g.fillRect(6, 38, 20, 10); },
    cobble: (g) => { g.fillStyle = '#5a4a44'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = 0; x < 64; x += 16) { const o = (y / 8) % 2 ? 8 : 0; g.fillStyle = ['#8a5a44', '#7a4e3c', '#94644c'][(x + y) % 3]; g.fillRect(x + o + 1, y + 1, 14, 6); } }, // red klinkers, stretcher bond
  },
  floorRep: { coldtile: 1.3, shoptile: 1.2, tiles: 1.3, cobble: 1.4 },
  hallCells: [[6, 18], [7, 18]],
  doorSigns: { '11,14': 'PERSONEEL', '8,11': 'KOELCEL', '11,8': 'KOELCEL', '15,6': 'KANTOOR', '29,6': 'OPSLAG', '26,11': 'ACHTERGANG', '33,14': 'PERSONEEL' },
  neon: { koelcel: 0xbfe8ff, shop: 0xff7a1a, kantoor: 0xe8a33d, opslag: 0xffd8a0, prep: 0xf2e6c8, gang: 0xf2c14e, steeg: 0xe8862c },
  lights: [[6, 15, 0xffb070, 1.8], [6, 5, 0xbfe8ff, 1.4], [16, 3, 0xe8a33d, 1.6], [27, 3, 0xffd8a0, 1.3], [16, 12, 0xfff0dc, 1.7], [22, 12, 0xfff0dc, 1.7], [30, 12, 0xf2c14e, 1.2], [36, 10, 0xe8862c, 1.1], [6, 21, 0xff9a50, 1.2], [24, 21, 0xe8a33d, 1.0]],
  mood: { bg: 0x120c14, fogNear: 30, fogFar: 72, hemi: 0.55, sun: 0.7, sky: 0xfff0dc, ground: 0x4a3830, wall: 0x7a3a2a, cap: 0xf2e6d4, under: 0x3a2a24 },
  van: { park: [10, 4.6], rot: Math.PI, from: W + 14, exit: [10.8, 3.0], solid: [6.7, 12.8, 3.45, 5.75] }, // world; rot: nose west, the way it drives in
  parking: { meter: [5, 21], cost: 5, app: 7 }, // cell of the parkeermeter; the van stops in the bay out front (tickets: js/garage.js)
  waveCar: { from: [W + 18, 3.2], to: [32, 3.2], rot: Math.PI, color: 0xff7a1a }, // world: the Lampas backup pulls up by the alley
  waveAt: 3,                     // the backup also comes when only this many Lampas are left inside
  start: [10, -1.4],             // world: where Eddy stands after the drive in (and on a restart)
  bounds: [0.3, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [10.5, 22.5],    // cell: the pavement by the van
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, extra ({ wave: 1 }: the backup car)
    [4, 13, 'machete', 0, 'shop'], [7.5, 15.5, 'makarov', -Math.PI / 2, 'shop'],                           // the slager watches the meter; a regular
    [4.5, 5, 'bat', Math.PI / 2, 'koelcel'], [8, 7, 'makarov', -Math.PI / 2, 'koelcel'], [2, 9.5, 'knife', 0, 'koelcel'], // the cold-room ambush
    [13, 12, 'makarov', Math.PI / 2, 'prep'], [18.5, 8, 'machete', 0, 'prep'], [24, 12.5, 'shotgun', -Math.PI / 2, 'prep'], [18.5, 16, 'makarov', Math.PI, 'prep'], [23, 8, 'makarov', Math.PI, 'prep'],
    [30, 13, 'bat', Math.PI, 'gang'], [26, 4.5, 'makarov', Math.PI / 2, 'opslag'],
    [16.5, 1.8, 'shotgun', 0, 'kantoor', true], [19, 4.2, 'makarov', -Math.PI / 2, 'kantoor'],          // Manager Kees and his nephew
    [31.5, 21, 'makarov', -Math.PI / 2, 'street', false, { wave: 1 }], [33.5, 21.5, 'bat', -Math.PI / 2, 'street', false, { wave: 1 }],
  ],
  loot: [[23.5, 4.5], [31.5, 4.5], [13.5, 1.5], [9.5, 2.5], [28.5, 16.5], [36.5, 17.5]], // cell; the first sits in the opslag (a Nachtklus puts Dad's grill there)
  bossLook: { shirt: 0xf2efe6, front: '#f2efe6', pants: 0x2a2a3a, belly: 1.5, head: { hair: '#3a2a1a', brow: '#2a1a12', hairLine: 30, glasses: false, iris: '#3a2a1a' } }, // Manager Kees in a butcher's coat
  text: {
    area: 'KIPKRUIDENKWARTIER · SPEKBUURT',
    banner: ['SLAGER & SHOARMA SPEKBUURT', 'Lampas territory. Front door, or the alley round the side.'],
    objective: 'Take <b>Slager &amp; Shoarma Spekbuurt</b> from the Lampas. In through the shop, or the staff door in the <b>alley</b>. The <b>prep room</b> connects every room. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Spekbuurt is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Spekbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'SPEKBUURT UNLOCKED',
    resultsHint: 'The Lampas are out of Spekbuurt. Grab the spice crates (E), then drive home. You\'ll set up shop here later.',
    ownedBanner: ['SPEKBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['MANAGER KEES IS DOWN', 'Jan van Kaas won\'t like this.'],
    waveBanner: ['LAMPAS BACKUP', 'A car just pulled up by the alley.'],
    tips: ['The prep room in the middle connects every room. Lost? Head back there.', 'Shoot a spice tub: the paprika cloud knocks down everyone next to it.', 'The carcasses in the koelcel block sight, for you and for them.', 'The staff door in the alley skips the shop. The slager behind the counter never sees you coming.', 'The first loud shot calls Lampas backup to the street. The Maboota is quiet.', 'Pay for parking at the meter or by app (B). The scan car writes tickets.'],
  },
  // the unique props: road with the parking bay, Dutch gables with flags, the striped shop front, döner, meat rails, the office
  decorate({ THREE, root, OX, Z0, box, cyl, lam, solid, floorW, T, WALL_H, neonRect, signTex, canvasTex, spill, smokeAt }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60, sub) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex(sub ? [{ t, size }, sub] : [{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the road and the parking bay (the van stops in it)
    floorW(OX - 16, OX + W + 16, 0, 12, T.asphalt, 4);
    box(W + 32, 0.12, 0.25, lam({ color: 0x8a8a84 }), OX + W / 2, 0.06, 0.1, root, false); // kerb
    for (let x = -14; x < W + 14; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 7.2, root, false);
    for (const x of [5.5, 14.5]) box(0.12, 0.01, 2.6, lam({ color: 0xf2f2f2 }), OX + x, 0.03, 4.6, root, false); // bay lines
    box(9.1, 0.01, 0.12, lam({ color: 0xf2f2f2 }), OX + 10, 0.03, 5.9, root, false);
    const bayP = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), new THREE.MeshBasicMaterial({ map: signTex([{ t: 'P', size: 110 }], 'rgba(0,0,0,0)', '#f2f2f2', 128, 128), transparent: true }));
    bayP.rotation.x = -Math.PI / 2; bayP.position.set(OX + 13.6, 0.035, 5.1); root.add(bayP);
    cyl(0.04, 0.04, 2.4, lam({ color: 0x8a8c90 }), OX + 6.2, 1.2, -0.35, root, 6);
    sign('P', 0.5, 0.5, '#1f4fa0', '#ffffff', OX + 6.2, 2.3, -0.32, 0, 90);
    sign('BETAALD PARKEREN 09-23u', 0.9, 0.24, '#f2f2f2', '#1a1a1a', OX + 6.2, 1.9, -0.31, 0, 26);
    // Dutch gables: west of the shop, a block east of the alley, and a row across the road, with flags
    const gable = (x, z, w, d, h, c, face, roofed = true) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      if (roofed) { const roof = new THREE.Mesh(new THREE.ConeGeometry(w * 0.72, 2.4, 4), lam({ color: 0x2a2024 })); roof.rotation.y = Math.PI / 4; roof.scale.z = d / w; roof.position.set(x, h + 1.2, z); root.add(roof); }
      for (let r = 0; r < Math.floor(h / 2.4); r++) for (let k = 0; k < 2; k++) box(0.85, 1.15, 0.05, new THREE.MeshBasicMaterial({ color: [0xf2c14e, 0x2a3040, 0xe8a33d][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
      if (Math.abs(Math.round(x)) % 3 === 0) { const fl = new THREE.Group(); fl.position.set(x + w / 4, 3.6, z + face * (d / 2 + 0.05)); root.add(fl); // the Dutch flag on a pole
        cyl(0.025, 0.025, 1.4, lam({ color: 0xd8d8d8 }), 0, 0, 0.5 * face, fl, 6).rotation.x = face * 0.6;
        [0xae1c28, 0xf2f2f2, 0x21468b].forEach((col, i) => box(0.03, 0.18, 0.7, lam({ color: col }), 0, 0.28 - i * 0.18, 0.9 * face, fl, false));
        ticks.push((dt, t) => { fl.rotation.y = Math.sin(t * 1.3 + x) * 0.12; }); }
    };
    for (let i = 0; i < 9; i++) gable(OX - 12 + i * 7, 16, 6.6, 6, 8 + (i * 5) % 4, [0x6a3428, 0x4a3a44, 0x7a4430, 0x5a4a50][i % 4], -1);
    gable(OX - 4, Z0 + 9.5, 7.6, 19, 4.6, 0x6a3a30, 1, false); // the neighbour: low and flat-roofed, so it never hides the shop solid(OX - 8, OX, Z0, FZ);
    box(14, 4.6, 19, lam({ color: 0x4a3a44 }), OX + W + 7, 2.3, Z0 + 9.5, root);
    // the shop front: name board, striped awning, HALAL boards, an A-frame on the pavement
    sign('SLAGER & SHOARMA', 7.4, 0.9, '#f2efe6', '#c8202a', OX + 5.8, 2.85, FZ + 0.03, 0, 70);
    neonRect(root, OX + 5.8, 2.85, 7.6, 1.05, FZ + 0.06, 0xff3a2a);
    const stripes = canvasTex(64, 16, (g) => { for (let x = 0; x < 64; x += 16) { g.fillStyle = '#c8202a'; g.fillRect(x, 0, 8, 16); g.fillStyle = '#f2efe6'; g.fillRect(x + 8, 0, 8, 16); } });
    stripes.wrapS = THREE.RepeatWrapping; stripes.repeat.set(6, 1);
    const awn = new THREE.Mesh(new THREE.PlaneGeometry(10.4, 0.85), lam({ map: stripes, side: THREE.DoubleSide }));
    awn.rotation.x = -Math.PI / 2 + 0.45; awn.position.set(OX + 5.8, 2.25, FZ + 0.38); root.add(awn);
    sign('HALAL', 1.1, 0.5, '#1a3a1a', '#6ed36e', OX + 9.8, 1.0, FZ + 0.03, 0, 60);
    sign('EIGENDOM VAN DE LAMPAS', 3.4, 0.3, '#1a0a10', '#ff7a1a', OX + 5.8, 2.26, FZ + 0.04, 0, 30);
    const aframe = new THREE.Group(); aframe.position.set(OX + 9.2, 0, FZ + 1.4); root.add(aframe);
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.9), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, map: signTex([{ t: 'SHOARMA', size: 38 }, { t: 'W 5', size: 50, color: '#ffd36b' }, { t: '100% echt*', size: 22, color: '#ffffff' }], '#1a1a1a', '#f2efe6', 128, 192) })); b.position.set(0, 0.45, s * 0.12); b.rotation.x = s * 0.25; aframe.add(b); }
    // the slachterij's wall on the street: a roller door, and the deliveries sign by the alley
    const rollT = canvasTex(64, 64, (g) => { for (let y = 0; y < 64; y += 6) { g.fillStyle = y % 12 ? '#8a8a86' : '#6a6a66'; g.fillRect(0, y, 64, 6); } });
    const roll = new THREE.Mesh(new THREE.PlaneGeometry(4, WALL_H - 0.1), lam({ map: rollT })); roll.position.set(OX + 19, WALL_H / 2, FZ + 0.03); root.add(roll);
    sign('LEVERINGEN · ACHTEROM →', 3.2, 0.32, '#2a1a12', '#f2c14e', OX + 30.5, 2.0, FZ + 0.03, 0, 30);
    // inside the shop: döner spit, menu board over the counter
    const doner = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.9, 14), lam({ color: 0x9a5a2a })); doner.position.set(OX + 1.5, 1.55, Z0 + 12.5); root.add(doner);
    const dg = glowSprite(THREE, 0xff6a2a, 1.6, 1.6, 0.35); dg.position.set(OX + 1.5, 1.6, Z0 + 12.9); root.add(dg);
    sign('MENU', 3.2, 0.66, '#1a0a10', '#ff3a2a', OX + 4.6, 1.95, Z0 + 12.03, 0, 34, { t: 'SHOARMA W 5 · DÖNER W 6 · LAMPAS KRUIDEN 100% ECHT*', size: 18, color: '#f2c14e' }); // on the back wall, over the counter
    // the office: CRT on Kees's desk, a pinboard, the Jan van Kaas portrait
    box(0.44, 0.38, 0.4, lam({ color: 0xd8d0b8 }), OX + 16, 1.0, Z0 + 3.45, root, false);
    const crt = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), new THREE.MeshBasicMaterial({ color: 0x9ad8c8 })); crt.position.set(OX + 16, 1.02, Z0 + 3.24); crt.rotation.y = Math.PI; root.add(crt);
    const pin = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), lam({ map: canvasTex(128, 72, (g) => { g.fillStyle = '#b08a5a'; g.fillRect(0, 0, 128, 72); for (let i = 0; i < 9; i++) { g.fillStyle = ['#f2efe6', '#ffd36b', '#9ad8ff'][i % 3]; g.fillRect(6 + (i % 5) * 24, 6 + Math.floor(i / 5) * 32, 18, 24); g.fillStyle = '#c8202a'; g.fillRect(14 + (i % 5) * 24, 8 + Math.floor(i / 5) * 32, 3, 3); } }) }));
    pin.position.set(OX + 18.5, 1.6, Z0 + 1.02); root.add(pin);
    const jvk = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8b040'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2a1a1a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(64, 44, 22, 0, 7); g.fill(); g.fillStyle = '#d8b040'; g.fillRect(44, 18, 40, 10); g.fillStyle = '#f3ecdc'; g.fillRect(36, 66, 56, 24); g.fillStyle = '#ffd36b'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText('JAN VAN KAAS', 64, 88); }) }));
    jvk.position.set(OX + 14, 1.7, Z0 + 1.02); root.add(jvk);
    // the cold room: frosty air near the floor
    const frost = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.07, depthWrite: false })); frost.rotation.x = -Math.PI / 2; frost.position.set(OX + 6, 0.4, Z0 + 6); root.add(frost);
    // puddles on the street
    const pl = []; for (let i = 0; i < 10; i++) pl.push([OX + Math.random() * W, Z0 + 19 + Math.random() * 5, 0.3 + Math.random() * 0.4]);
    for (let i = 0; i < 8; i++) pl.push([OX - 10 + Math.random() * (W + 20), 1 + Math.random() * 10, 0.4 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    // swinging carcasses and spice tubs that burst (a hit rattles a carcass; a hit on a tub throws up a spice cloud)
    const sways = [], tubs = new Map(); root.traverse((o) => { if (o.userData.sway) sways.push({ g: o, a: 0, v: 0, ph: Math.random() * 6 }); if (o.userData.tub) tubs.set(o.userData.tub, o); });
    const burst = new Set(), clouds = [];
    const cloudM = new THREE.MeshBasicMaterial({ color: 0xd8561e, transparent: true, opacity: 0.5, depthWrite: false });
    let t = 0;
    return {
      onShot(ch, x, z) {
        if (ch === 'H') { for (const s of sways) if (Math.abs(s.g.position.x - (OX + x + 0.5)) < 0.6 && Math.abs(s.g.position.z - (Z0 + z + 0.5)) < 0.6) s.v += 2.5; return true; }
        if (ch !== 'u') return false;
        const k = `${x},${z}`; if (burst.has(k)) return true; burst.add(k);
        const heap = tubs.get(k), c = heap ? heap.material.color.getHex() : PAPRIKA[0], i = Math.max(0, PAPRIKA.indexOf(c)); if (heap) heap.visible = false;
        const at = new THREE.Vector3(OX + x + 0.5, 0, Z0 + z + 0.5);
        spill(at, 1.9, { text: SPICE[i], color: c });
        smokeAt(OX + x + 0.5 - OX, z + 0.5, 1.8, 5);
        const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), cloudM.clone()); m.material.color.setHex(c); m.position.set(at.x, 0.9, at.z); m.scale.setScalar(0.4); root.add(m); clouds.push({ m, t: 0 });
        return true;
      },
      reset() { burst.clear(); for (const h of tubs.values()) h.visible = true; for (const c of clouds) root.remove(c.m); clouds.length = 0; for (const s of sways) { s.a = s.v = 0; } },
      tick(dt) {
        t += dt; doner.rotation.y += dt * 0.8; dg.material.opacity = 0.3 + Math.sin(t * 3) * 0.05;
        for (const s of sways) { s.v += (-s.a * 9 - s.v * 1.2) * dt; s.a += s.v * dt; s.g.rotation.z = s.a * 0.25 + Math.sin(t * 0.7 + s.ph) * 0.03; }
        for (let i = clouds.length - 1; i >= 0; i--) { const c = clouds[i]; c.t += dt; c.m.scale.setScalar(Math.min(2.1, 0.4 + c.t * 3)); c.m.material.opacity = Math.max(0, 0.5 * (1 - c.t / 5)); if (c.t > 5) { root.remove(c.m); clouds.splice(i, 1); } }
        for (const f of ticks) f(dt, t);
      },
    };
  },
};
