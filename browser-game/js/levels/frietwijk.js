// Act 1, mission 1: Frietwijk (Oud-Vettenburg). Friettent De Vette Hap, the Lampas' busiest snack corner, on a rainy plaza.
// Level data for the mission engine (js/mission.js); see spekbuurt.js for the coordinate conventions. Built after the concept art
// (01_Act1_Frietwijk): a corner snackbar with a fries sign and terrace tables on the plaza, a small shop with a counter and
// menu boards, then a huge open kitchen divided by glass partitions (four döner spits, fry stations, steel prep islands),
// a storeroom of boxes, and a wood-panelled back office with a safe, a green-screen PC and stacks of Wilders.
// The twist: glass everywhere. The kitchen partitions and the office window let you and the Lampas see each other across rooms.
//   terrace → shop → kitchen (behind the counter) → staff room → office
//   side alley → storeroom (deliveries) → kitchen → mixing room → cold store → office
//   terrace → PERSONEEL door → staff room

import { rain, puddles, glowSprite, STREET_FURN } from './props.js';
import { plate } from './story.js';

const W = 46, H = 27;

export default {
  id: 'frietwijk', name: 'Frietwijk', W, H,
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['store', 6, 1, 15, 11, 'concrete'], ['mixing', 17, 1, 24, 7, 'tiles'], ['cold', 26, 1, 34, 7, 'cold'], ['office', 36, 1, 44, 11, 'panel'],
    ['shop', 6, 13, 15, 20, 'friettile'], ['kitchen', 17, 9, 34, 20, 'kitchen'], ['staff', 36, 13, 44, 20, 'lino'],
    ['side', 1, 1, 4, 21, 'cobble'], ['terrace', 1, 22, 44, 26, 'cobble'],
  ],
  layout({ carve, put, putR }) {
    // doors and openings
    carve(9, 21, 10, 21);       // the front door under the fries sign (open)
    putR(5, 3, 5, 4, 'D');      // side alley ↔ storeroom (deliveries)
    putR(5, 17, 5, 18, 'D');    // side alley ↔ shop
    putR(10, 12, 11, 12, 'D');  // shop ↔ storeroom
    putR(16, 13, 16, 14, 'D');  // shop (behind the counter) ↔ kitchen
    putR(16, 9, 16, 10, 'D');   // storeroom ↔ kitchen
    putR(23, 8, 24, 8, 'D');    // kitchen ↔ mixing room
    putR(25, 3, 25, 4, 'D');    // mixing room ↔ cold store
    putR(30, 8, 31, 8, 'D');    // kitchen ↔ cold store
    putR(35, 3, 35, 4, 'D');    // cold store ↔ office
    putR(35, 16, 35, 17, 'D');  // kitchen ↔ staff room
    putR(40, 12, 41, 12, 'D');  // staff room ↔ office
    putR(42, 21, 43, 21, 'D');  // staff room ↔ terrace (PERSONEEL)
    carve(0, 1, 0, 26); carve(45, 22, 45, 26); // the alley and the plaza run on past the level
    // glass: the storefront, the pass window, the kitchen partitions, the office window onto the kitchen
    putR(6, 21, 8, 21, '%'); putR(11, 21, 15, 21, '%'); putR(36, 21, 40, 21, '%');
    putR(16, 16, 16, 19, '%');
    putR(25, 10, 25, 12, '%'); putR(25, 17, 25, 20, '%');
    putR(27, 15, 29, 15, '%'); putR(32, 15, 34, 15, '%');
    putR(35, 9, 35, 11, '%');
    // shop: the counter, fridges, a few tables
    putR(8, 15, 15, 15, 'K'); put(6, 13, 'F'); put(8, 18, 'T'); put(13, 18, 'T'); put(6, 20, 'p');
    // kitchen: four döner spits, the fry line, steel prep islands
    putR(19, 9, 21, 9, 'Y'); putR(26, 9, 29, 9, 'Z'); putR(32, 9, 34, 9, 'Z');
    putR(19, 12, 22, 13, 'w'); putR(19, 18, 22, 19, 'w'); putR(28, 12, 31, 12, 'w'); putR(28, 18, 31, 19, 'w');
    put(34, 20, 'X'); put(17, 20, 'C');
    // storeroom: racks of boxes, potato sacks, a barrel
    putR(8, 3, 13, 3, 'R'); putR(7, 6, 13, 6, 'R'); putR(7, 9, 12, 9, 'R'); putR(12, 1, 13, 1, 'n'); put(15, 1, 'X'); putR(6, 11, 7, 11, 'C');
    // mixing room: the mixing table and spice drums
    putR(19, 3, 22, 4, 'w'); putR(17, 7, 18, 7, 'C'); put(24, 1, 'C');
    // cold store: hanging meat, freezers
    putR(28, 2, 32, 2, 'm'); putR(28, 5, 32, 5, 'm'); put(34, 7, 'F'); put(26, 7, 'F');
    // office: the desk with the PC, the safe, a filing cabinet, the boss's sofa
    putR(38, 4, 41, 4, 'O'); putR(43, 1, 44, 1, 'V'); put(36, 1, 'F'); putR(43, 7, 43, 9, 'S'); put(44, 11, 'p');
    // staff room: lockers, a bench, the break table
    putR(36, 13, 38, 13, 'L'); putR(43, 13, 44, 13, 'L'); putR(38, 16, 40, 16, 'G'); putR(41, 18, 42, 18, 'T'); put(44, 20, 'F');
    // the alley: bins and crates; the terrace: bistro tables, planters, lamps, bollards
    put(2, 2, 'C'); putR(1, 7, 2, 7, 'C'); put(3, 12, 'X');
    putR(2, 23, 4, 23, 'v'); putR(12, 23, 15, 23, 'v'); put(6, 24, 't'); put(13, 25, 't'); put(17, 24, 't'); put(21, 25, 't'); put(25, 24, 't');
    putR(30, 23, 33, 23, 'v'); put(36, 24, 't'); putR(28, 25, 29, 25, 'h');
    put(27, 24, 'o'); // the foot of the giant fries cone (story)
    put(1, 26, 'l'); put(19, 26, 'l'); put(38, 26, 'l'); for (const x of [8, 24, 32, 44]) put(x, 26, 'o');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { // the shop counter: paprika front, cream top
      box(n - 0.06, 1.0, 0.9, lam({ color: 0xc2412d }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false);
    } },
    F: { color: 0xd8dcdc },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz, x, z, OX, Z0, G }) => { // steel prep tables (2 rows deep: one box per run)
      box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false);
      for (let k = 0; k < n; k += 2) box(0.5, 0.06, 0.35, lam({ color: [0xe8a33d, 0xf3e6c8, 0xc2412d][(x + k + z) % 3] }), OX + x + k + 0.6, 0.98, cz, root, false); // trays of fries, onions, sauce
    } },
    R: { color: 0x6a4a2a },
    S: { color: 0x5a3020 },
    O: { color: 0x4a2a14 },
    Y: { h: 1.05, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz, x, OX }) => { // the döner line: a steel counter with a vertical spit per cell
      box(n - 0.04, 1.0, 0.9, lam({ color: 0xa8b0b8 }), cx, 0.5, cz, root);
      box(n - 0.04, 1.4, 0.12, lam({ color: 0x8a3a24 }), cx, 1.7, cz - 0.4, root, false); // the burner wall, glowing
      for (let k = 0; k < n; k++) {
        const spit = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.95, 12), lam({ color: [0x9a5a2a, 0xa8642e, 0x8a4a22][(x + k) % 3] }));
        spit.position.set(OX + x + k + 0.5, 1.5, cz); spit.userData.spit = true; root.add(spit);
        const g = glowSprite(THREE, 0xff7a1a, 1.0, 1.4, 0.45); g.position.set(OX + x + k + 0.5, 1.6, cz - 0.3); root.add(g);
      }
    } },
    Z: { h: 1.0, cover: true, draw: ({ THREE, root, box, lam, n, cx, cz, x, OX }) => { // fryers: steel cabinets with bubbling oil baskets
      box(n - 0.04, 0.95, 0.9, lam({ color: 0x9aa2aa }), cx, 0.475, cz, root);
      for (let k = 0; k < n; k++) {
        const oil = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5), new THREE.MeshBasicMaterial({ color: 0xe8a33d })); oil.rotation.x = -Math.PI / 2; oil.position.set(OX + x + k + 0.5, 0.96, cz + 0.05); root.add(oil);
        box(0.5, 0.04, 0.4, lam({ color: 0xd8c070 }), OX + x + k + 0.5, 1.02, cz + 0.05, root, false);
      }
      box(n - 0.04, 0.5, 0.7, lam({ color: 0xc8ccd0 }), cx, 2.1, cz - 0.1, root, false); // the extractor hood
    } },
    m: { h: 1.6, cover: false, sight: true, draw: ({ THREE, root, box, lam, n, cz, x, OX }) => { // hanging meat on a rail
      box(n, 0.05, 0.05, lam({ color: 0x8a8a8a }), OX + x + n / 2, 2.15, cz, root, false);
      for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.7, 4, 8), lam({ color: [0xc86a5a, 0xb85a4a, 0xd8806a][(x + k) % 3] })); m.position.set(OX + x + k + 0.5, 1.4, cz); root.add(m); }
    } },
    n: { h: 0.9, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { // potato sacks
      for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6), lam({ color: [0xb89a6a, 0xa8885a][(x + k + j) % 2] })); s.scale.set(1, 0.8, 1.2); s.position.set(OX + x + k + 0.5, 0.3 + j * 0.42, cz + (j ? 0.1 : -0.1)); root.add(s); }
    } },
    L: { h: 1.9, cover: true, draw: ({ box, lam, root, n, cx, cz, x, OX }) => { // staff lockers
      box(n - 0.04, 1.9, 0.6, lam({ color: 0x5a6a5a }), cx, 0.95, cz - 0.15, root);
      for (let k = 0; k < n; k++) box(0.04, 1.7, 0.02, lam({ color: 0x2a3028 }), OX + x + k + 1, 0.95, cz + 0.16, root, false);
    } },
  },
  hazard: { ch: 'Z', text: 'DEEP FRIED!', death: 'Shoved into the frituur.' }, // knock a Lampas into the fry line and he is done
  rackGoods: [0xd8c8a0, 0xe8a33d, 0xc2412d],
  floors: {
    friettile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#c2412d'; g.fillRect(x * 16, y * 16, 16, 16); } },
    kitchen: (g) => { g.fillStyle = '#d8d4c8'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#9a9488'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(200,150,60,.12)'; g.beginPath(); g.arc(Math.random() * 64, Math.random() * 64, 4 + Math.random() * 6, 0, 7); g.fill(); } },
    cold: (g) => { g.fillStyle = '#b8c4cc'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#9aa8b2'; for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) g.fillRect(x, y, 3, 3); },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 5) % 64, y, 1, 8); } },
    lino: (g) => { g.fillStyle = '#5a5a3a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 200; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.15})`; g.fillRect(Math.random() * 64, Math.random() * 64, 3, 2); } g.fillStyle = '#e8a33d'; g.fillRect(0, 62, 64, 2); },
    cobble: (g) => { g.fillStyle = '#34363c'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#4a4844', '#55524c', '#44423e'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  },
  floorRep: { cobble: 1.6, panel: 1.5, friettile: 1.2, kitchen: 1.4, cold: 1.2 },
  hallCells: [[9, 21], [10, 21]],
  doorSigns: { '42,21': 'PERSONEEL', '5,3': 'LEVERINGEN', '35,3': 'KANTOOR' },
  neon: { store: 0xffd8a0, mixing: 0xf2c14e, cold: 0xd8e8f0, office: 0xe8a33d, shop: 0xe8862c, kitchen: 0xf2c14e, staff: 0xf2c14e, side: 0xe8a33d, terrace: 0xe8862c },
  lights: [[10, 17, 0xe8862c, 1.8], [21, 11, 0xff8a3a, 1.8], [30, 11, 0xf2c14e, 1.4], [21, 17, 0xf3e6c8, 1.4], [30, 18, 0xf3e6c8, 1.4], [10, 6, 0xffd8a0, 1.4], [20, 4, 0xf2c14e, 1.4], [30, 4, 0xc8dcf0, 1.2], [40, 5, 0xe8a33d, 1.7], [40, 17, 0xf2c14e, 1.1], [9, 24, 0xe8862c, 1.4], [27, 24, 0xe8a33d, 1.2], [38, 24, 0xe8a33d, 1.2]],
  mood: { bg: 0x0e0c10, fogNear: 30, fogFar: 74, hemi: 0.55, sun: 0.65, sky: 0xfff0dc, ground: 0x5a4a3a, wall: 0x6a3a2a, cap: 0xe8d8c0, under: 0x3a2a24 },
  van: { park: [14, 4.6], rot: Math.PI, from: W + 14, exit: [14.6, 3.0], solid: [10.7, 16.8, 3.45, 5.75] }, // world; drives in along the plaza, nose first
  start: [10, -0.8],              // world: on the terrace in front of the shop
  bounds: [0.5, W - 0.3, -H, 10], // world: x0, x1, z0, z1
  validateFrom: [10, 25],         // cell: the terrace
  bossLook: { cap: 0xc2412d, shirt: 0xf3e6c8, front: '#f3e6c8', pants: 0x2a2a2a, belly: 0.9, head: { hair: '#5a3a1a', brow: '#3a2414', hairLine: 46, iris: '#4a3a1a' } }, // Friet-Fred: paper hat red, cream chef's whites
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss
    [5, 24, 'bat', Math.PI / 2, 'terrace'], [22, 23, 'makarov', Math.PI, 'terrace'], [34, 25, 'bat', -Math.PI / 2, 'terrace'],
    [2, 15, 'makarov', Math.PI, 'side'], [9.5, 10.5, 'bat', Math.PI / 2, 'store'],
    [11, 14, 'makarov', 0, 'shop'], [9, 19, 'bat', Math.PI / 2, 'shop'], [14, 17, 'bat', -Math.PI / 2, 'shop'],
    [19, 10.5, 'bat', 0, 'kitchen'], [23, 14, 'makarov', Math.PI / 2, 'kitchen'], [27, 10.5, 'makarov', 0, 'kitchen'], [31, 14, 'bat', -Math.PI / 2, 'kitchen'],
    [20, 16.5, 'makarov', Math.PI / 2, 'kitchen'], [29, 17, 'bat', Math.PI, 'kitchen'], [33, 19, 'shotgun', -Math.PI / 2, 'kitchen'],
    [10, 4.5, 'bat', Math.PI / 2, 'store'], [14, 7.5, 'makarov', -Math.PI / 2, 'store'],
    [20, 6, 'bat', Math.PI, 'mixing'], [29, 3.5, 'makarov', Math.PI / 2, 'cold'], [33, 6, 'bat', -Math.PI / 2, 'cold'],
    [39.5, 2.2, 'shotgun', 0, 'office', true], [42, 6, 'makarov', -Math.PI / 2, 'office'],
    [38, 18, 'bat', Math.PI / 2, 'staff'], [43, 15.5, 'makarov', -Math.PI / 2, 'staff'],
  ],
  // the quiet way in: up the dark side alley (one Lampas on a smoke break, his back to the plaza) to the delivery door
  side: { doors: [[5, 3], [5, 4]], name: 'LEVERINGEN', kind: 'door' },
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a giant fibreglass cone of fries on a pole over the plaza, slowly turning
      const { THREE, root, box, cyl, lam, canvasTex } = c, p = c.at(27.5, 24.5);
      cyl(0.09, 0.12, 4.2, lam({ color: 0x2a2a2e }), p.x, 2.1, p.z, root, 10);
      const g = new THREE.Group(); g.position.set(p.x, 4.9, p.z); root.add(g);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.85, 1.7, 20, 1, true), lam({ color: 0xc2412d, side: THREE.DoubleSide })); cone.rotation.x = Math.PI; g.add(cone);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.6, 0.34, 20, 1, true), lam({ map: canvasTex(256, 32, (x) => { x.fillStyle = '#f3e6c8'; x.fillRect(0, 0, 256, 32); x.fillStyle = '#c2412d'; x.font = '900 22px Arial'; x.textAlign = 'center'; x.fillText('DE VETTE HAP · FRIET', 128, 24); }), side: THREE.DoubleSide })); band.position.y = 0.2; g.add(band);
      for (let i = 0; i < 16; i++) { const a = i * 2.4, rr = 0.25 + (i % 4) * 0.13; box(0.13, 1.1 + (i % 3) * 0.3, 0.13, lam({ color: i % 5 ? 0xf2c14e : 0xe8a33d }), Math.cos(a) * rr, 0.95, Math.sin(a) * rr, g, false); }
      const mayo = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 8), lam({ color: 0xf8f2dc })); mayo.scale.y = 0.45; mayo.position.set(0.15, 1.15, 0.1); g.add(mayo);
      const gl = c.glow(0xf2c14e, 4, 4, 0.35); gl.position.set(p.x, 4.9, p.z); root.add(gl);
      return (dt) => { g.rotation.y += dt * 0.35; };
    } },
    { k: 'board', at: [36.5, 18.5], wall: 'w', title: 'WIE BETAALT NIET?', lines: ['~Snackbar Bram', 'Kapsalon Koning: W 400', 'Lunchroom Ans: W 250', 'Shoarma Ali: W 600', 'EDDY JR.: ALLES'], read: ['WIE BETAALT NIET?', "Friet-Fred's list of shops behind on their Lampas 'frituurvet'. Bram is crossed out. At the bottom, in red: Eddy Jr. owes everything."] },
    { k: 'poster', at: [6.5, 16.5], wall: 'w', w: 0.9, h: 1.2, title: 'GEZOCHT', lines: ['EDDY JR.', 'W 2.000', 'voor zijn kruidenkist'], face: 'EDDY', read: ['GEZOCHT', "A Lampas poster: W 2.000 for Eddy Jr.'s spice chest. Somebody drew a moustache on the photo."] },
    { k: 'papers', at: [40.5, 6.5], read: ['TWEE BOEKHOUDINGEN', 'Two sets of books. The one for the tax office says De Vette Hap sold 40 portions of fries last year. The other one smells of frying oil.'] },
    { k: 'cups', at: [13.5, 25.5], y: 0.77, read: ['BONNETJE', 'A receipt under a cold portion of fries: "Bescherming, week 46: W 250. Betaald." Signed with a fry-fork: the Lampas.'] },
    { k: 'spill', at: [29.5, 10.6], color: 0xe8a33d, r: 0.6 }, { k: 'chair', at: [33.5, 13.5], color: 0x9aa2aa },
    { k: 'sign', at: [4.5, 2.5], wall: 'e', title: 'LEVERINGEN NA 22:00', lines: ['deur klemt: duwen'], w: 0.9, h: 0.5, style: 'paper', hy: 1.5, read: ['LEVERINGEN', '"Deliveries after 22:00. The door sticks: just push." Nobody watches the delivery door at night.'] },
    { k: 'mattress', at: [1.5, 9.5], color: 0x3a5a7a }, { k: 'bags', at: [3.5, 19.5] }, { k: 'chalk', at: [2.5, 21.2], dir: 0, free: true }, { k: 'chalk', at: [2.5, 13.5], dir: 0, free: true },
  ],
  loot: [[13.5, 4.5], [8.5, 7.5], [22.5, 1.5], [27.5, 6.5], [44, 3.5], [36.5, 20], [2.5, 3.5]], // cell
  text: {
    area: 'OUD-VETTENBURG · FRIETWIJK',
    banner: ['FRIETTENT DE VETTE HAP', 'Frietwijk. The Lampas fry everything here, even the books.'],
    objective: 'Take <b>Friettent De Vette Hap</b> from the Lampas. The kitchen is all glass: <b>they can see you coming</b>, and you can see them. Friet-Fred runs it from the back office. <span style="color:#ffd36b">Leave nobody standing.</span>',
    objectiveOwned: 'Frietwijk is <b>yours</b>. Your first foothold in Oud-Vettenburg. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Frietwijk is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'FRIETWIJK TAKEN',
    resultsHint: 'Your first joint in Oud-Vettenburg. The Lampas heartland just got smaller. Grab the spice crates (E), then drive home.',
    ownedBanner: ['FRIETWIJK IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['FRIET-FRED IS DOWN', 'Fried.'],
    tips: ['The kitchen is glass: the Lampas see you through every partition. Use the steel islands and the fry line for cover.', 'Three ways in: the front door, the PERSONEEL door at the end of the terrace, and the quiet one: up the dark side alley to the delivery door.', 'The office window looks onto the kitchen. Friet-Fred will see you coming.', 'Knock a Lampas into the fry line: deep fried. Mind your own fingers.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the plaza street, its pavement and the alley
    floorW(OX - 14, OX + W + 14, 2.6, 12, T.asphalt, 4); floorW(OX - 14, OX + W + 14, 0, 2.6, T.cobble, 1.6); floorW(OX - 14, OX, Z0, 0, T.cobble, 1.6);
    for (let x = -12; x < W + 14; x += 4) box(2, 0.01, 0.14, lam({ color: 0xf3e6c8 }), OX + x, 0.03, 7.3, root, false);
    // brick canal houses with stepped gables: across the alley, across the plaza, beyond the building
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      for (let s = 0; s < 3; s++) box(w * (0.8 - s * 0.25), 0.9, d * 0.9, lam({ color: c }), x, h + 0.45 + s * 0.9, z, root, false); // the stepped gable
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 3) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xf2c14e, 0xe8a33d, 0x2a3040][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 4; i++) house(OX - 4.5, Z0 + 3 + i * 6, 6, 5.8, 9 + (i % 2) * 2, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i], 1);
    for (let i = 0; i < 10; i++) house(OX - 12 + i * 6.4, 16, 6.2, 6, 9 + (i * 3) % 4, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i % 4], -1);
    box(10, 8, H - 5, lam({ color: 0x4a2a24 }), OX + W + 5, 4, Z0 + (H - 5) / 2, root);
    // wall skins: wood panels in the office, white tiles in the kitchen and the cold store
    const skin = (x0, z0, x1, z1, color) => {
      const m = lam({ color }), add = (x, z, rot) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1, WALL_H - 0.1), m); p.position.set(x, (WALL_H - 0.1) / 2, z); p.rotation.y = rot; root.add(p); };
      for (let x = x0; x <= x1; x++) { if (G[z0 - 1][x] === '#') add(OX + x + 0.5, Z0 + z0 + 0.012, 0); if (G[z1 + 1][x] === '#') add(OX + x + 0.5, Z0 + z1 + 1 - 0.012, Math.PI); }
      for (let z = z0; z <= z1; z++) { if (G[z][x0 - 1] === '#') add(OX + x0 + 0.012, Z0 + z + 0.5, Math.PI / 2); if (G[z][x1 + 1] === '#') add(OX + x1 + 1 - 0.012, Z0 + z + 0.5, -Math.PI / 2); }
    };
    skin(36, 1, 44, 11, 0x6a4426); skin(17, 9, 34, 20, 0xe8e4d8); skin(26, 1, 34, 7, 0xd8e4ec); skin(6, 13, 15, 20, 0xf3e6c8);
    // the facade: the fries sign on the corner, the name plate, neon in the windows
    sign('DE VETTE HAP', 6.5, 0.8, '#1a0e08', '#e8a33d', OX + 11, 2.75, Z0 + 21.02, 0, 80); neonRect(root, OX + 11, 2.75, 6.7, 0.95, Z0 + 21.06, 0xe8a33d);
    const fries = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.6), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(96, 128, (g) => {
      g.fillStyle = '#f2c14e'; for (let i = 0; i < 7; i++) g.fillRect(14 + i * 10, 8 + (i % 3) * 8, 7, 70);
      g.fillStyle = '#c2412d'; g.beginPath(); g.moveTo(8, 56); g.lineTo(88, 56); g.lineTo(76, 124); g.lineTo(20, 124); g.closePath(); g.fill();
      g.fillStyle = '#f3e6c8'; g.font = '900 18px Arial'; g.textAlign = 'center'; g.fillText('FRIET', 48, 96);
    }) }));
    fries.position.set(OX + 5.4, 2.6, Z0 + 21.6); fries.rotation.y = -Math.PI / 4; root.add(fries);
    const friesGlow = glowSprite(THREE, 0xf2c14e, 2.6, 2.6, 0.5); friesGlow.position.set(OX + 5.4, 2.6, Z0 + 21.8); root.add(friesGlow);
    const neon = (t, x, w, c, hex) => { sign(t, w, 0.5, '#0a0a10', hex, OX + x, 1.9, Z0 + 21.04, 0, 56); neonRect(root, OX + x, 1.9, w + 0.15, 0.62, Z0 + 21.08, c); };
    neon('FRIET', 7.3, 2.4, 0xf2c14e, '#f2c14e'); neon('DÖNER', 13.4, 2.6, 0xe8862c, '#e8862c'); neon('OPEN', 38.5, 1.8, 0xa9c46a, '#a9c46a');
    sign('EIGENDOM VAN DE LAMPAS', 3.4, 0.3, '#1a0e08', '#f3e6c8', OX + 11, 2.2, Z0 + 21.03, 0, 30);
    box(9, 0.1, 1.3, lam({ color: 0xc2412d }), OX + 11, 2.2, Z0 + 21.7, root, false); // awning edge
    // menu boards above the counter
    [['FRIET W 3', '#f2c14e'], ['DÖNER W 6', '#e8a33d'], ['KAPSALON W 8', '#f3e6c8'], ['FRIKANDEL W 2', '#c2412d']].forEach(([t, c], i) => sign(t, 2.1, 0.6, '#1a0e08', c, OX + 7.2 + i * 2.3, 1.95, Z0 + 13.03, 0, 40));
    // the office: a green-screen PC, stacks of Wilders on the desk, a framed photo of Jan van Kaas
    box(0.5, 0.4, 0.4, lam({ color: 0xd8d0b8 }), OX + 39.5, 1.0, Z0 + 4.4, root, false);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.38, 0.28), new THREE.MeshBasicMaterial({ color: 0x6ad86a })); scr.position.set(OX + 39.5, 1.02, Z0 + 4.61); root.add(scr);
    const scrGlow = glowSprite(THREE, 0x6ad86a, 1.2, 1.0, 0.35); scrGlow.position.set(OX + 39.5, 1.1, Z0 + 4.8); root.add(scrGlow);
    for (let k = 0; k < 5; k++) box(0.3, 0.06 + (k % 3) * 0.05, 0.16, lam({ color: 0x6a9a4a }), OX + 40.4 + (k % 2) * 0.35, 0.83, Z0 + 4.2 + Math.floor(k / 2) * 0.2, root, false);
    const jvk = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), lam({ map: canvasTex(128, 96, (g) => { g.fillStyle = '#d8b040'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#2a1a1a'; g.fillRect(6, 6, 116, 84); g.fillStyle = '#f2c8a0'; g.beginPath(); g.arc(64, 44, 22, 0, 7); g.fill(); g.fillStyle = '#e8862c'; g.fillRect(36, 66, 56, 24); g.fillStyle = '#f2c14e'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText('JAN VAN KAAS', 64, 88); }) }));
    jvk.position.set(OX + 40, 1.7, Z0 + 1.02); root.add(jvk);
    // the kitchen: fluorescent tubes, a steaming fry line
    for (const [x, z] of [[21, 11.5], [30, 11.5], [21, 17.5], [30, 17.5]]) { box(2.2, 0.06, 0.16, new THREE.MeshBasicMaterial({ color: 0xfff4d8 }), OX + x, WALL_H - 0.1, Z0 + z, root, false); }
    const steamM = new THREE.MeshBasicMaterial({ color: 0xf3e6c8, transparent: true, opacity: 0.08, depthWrite: false }), steam = [];
    for (let k = 0; k < 10; k++) { const s = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), steamM); s.rotation.x = -Math.PI / 2; s.position.set(OX + 26.5 + Math.random() * 8, 1.3 + Math.random() * 0.8, Z0 + 9.3 + Math.random() * 0.8); root.add(s); steam.push(s); }
    // rain on the plaza and the alley
    const pl = []; for (let z = 0; z < H; z++) for (let x = 0; x < W; x++) if (G[z][x] === '.' && (z >= 22 || x <= 4) && Math.random() < 0.05) pl.push([OX + x + Math.random(), Z0 + z + Math.random(), 0.3 + Math.random() * 0.4]);
    for (let i = 0; i < 12; i++) pl.push([OX - 10 + Math.random() * (W + 20), 1 + Math.random() * 10, 0.4 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, Z0 + 22, OX + W + 6, 12], [OX - 12, Z0, OX + 5, Z0 + 22]], 900));
    const spits = []; root.traverse((o) => { if (o.userData.spit) spits.push(o); });
    let t = 0;
    return { tick(dt) {
      t += dt; for (const s of spits) s.rotation.y += dt * 0.8; for (const f of ticks) f(dt);
      steam.forEach((s, i) => { s.position.y += dt * 0.3; s.rotation.z += dt * 0.1 * (i % 2 ? 1 : -1); if (s.position.y > 2.6) s.position.y = 1.2; });
      friesGlow.material.opacity = 0.45 + Math.sin(t * 3) * 0.08;
    } };
  },
};
