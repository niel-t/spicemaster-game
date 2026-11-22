// Act 1, mission 2: Sauzenbuurt (Oud-Vettenburg, the west quay). Sausfabriek Het Dunne Sausje: a stepped-gable shoarma shop on the
// canal, with the Lampas' dilution kitchen behind and below it. Level data for the mission engine (js/mission.js); see spekbuurt.js
// for the coordinate conventions. Built after the concept art (01_Act1_Sauzenbuurt): a rainy quay with vans, a narrow brick shop with
// a green "Halal Shoarma" sign, and a yellow-tiled factory full of steel kettles, pipes, flour sacks, spice drums and sauce bottles,
// worked by sauce workers in blue caps.
// The twist: sabotage. Kick over the four dilution kettles (E) as well as clearing the floor. The workers are not Lampas:
// they drop everything and run out of the loading bay as soon as trouble starts.
//   quay → shop → PERSONEEL → back hall → kettle hall → flour store → mixing room → bottling line → loading bay → quay
//   back hall → Sausmeester's office (glass wall onto the kettle hall)

import { rain, puddles, glowSprite, water, STREET_FURN } from './props.js';
import { eastSide } from './story.js';

const W = 40, H = 26;
const KETTLES = [[15, 4], [20, 4], [25, 4], [20, 10]]; // cell centre of each 2x2 kettle
const WORKERS = [[14, 7], [23, 7], [27, 10], [16, 18], [24, 22], [35, 4]]; // where the sauce workers stand (cells)
const EXIT = [21.5, 25.5]; // the loading bay: where they run to

export default eastSide({
  id: 'sauzenbuurt', name: 'Sauzenbuurt', W, H,
  taskName: 'KETTLE',
  rooms: [ // name, x0, z0, x1, z1 (interior cells), floor
    ['office', 1, 1, 10, 7, 'panel'], ['hall', 1, 9, 10, 13, 'hall'], ['shop', 1, 15, 10, 24, 'shoptile'],
    ['kettles', 12, 1, 30, 13, 'yellow'], ['bottling', 12, 15, 30, 24, 'yellow'],
    ['flour', 32, 1, 38, 11, 'concrete'], ['mixing', 32, 13, 38, 24, 'tiles'],
  ],
  layout({ carve, put, putR }) {
    // doors and openings
    carve(4, 25, 5, 25);        // the shop door on the quay (open)
    carve(20, 25, 23, 25);      // the loading bay (roller door up)
    putR(5, 14, 6, 14, 'D');    // shop ↔ back hall (PERSONEEL)
    putR(5, 8, 6, 8, 'D');      // back hall ↔ office
    putR(11, 10, 11, 11, 'D');  // back hall ↔ kettle hall
    putR(11, 20, 11, 21, 'D');  // shop ↔ bottling line
    carve(15, 14, 17, 14); carve(25, 14, 27, 14); // kettle hall ↔ bottling line: two wide openings
    putR(31, 5, 31, 6, 'D');    // kettle hall ↔ flour store
    putR(31, 19, 31, 20, 'D');  // bottling line ↔ mixing room
    putR(35, 12, 36, 12, 'D');  // flour store ↔ mixing room
    // glass: the shop window, the office wall onto the kettle hall
    putR(1, 25, 3, 25, '%'); putR(6, 25, 9, 25, '%');
    putR(11, 2, 11, 5, '%');
    // shop: the counter with the döner, a drinks fridge, a table
    putR(2, 17, 8, 17, 'K'); put(10, 15, 'F'); put(3, 21, 'T'); put(8, 21, 'T'); put(1, 24, 'p');
    // back hall: crates of empty bottles
    putR(1, 9, 2, 9, 'C'); put(10, 13, 'C');
    // office: desk, safe, a sofa, a cabinet
    putR(4, 3, 7, 3, 'O'); putR(1, 1, 2, 1, 'V'); putR(9, 5, 10, 7, 'S'); put(10, 1, 'F');
    // kettle hall: four dilution kettles (2x2, drawn by decorate), spice drums, flour sacks along the wall
    for (const [x, z] of KETTLES) putR(x - 1, z - 1, x, z, 'U');
    putR(28, 1, 30, 1, 'e'); putR(12, 12, 13, 12, 'n'); put(30, 13, 'X'); putR(28, 7, 29, 8, 'n'); put(12, 1, 'e');
    // bottling line: two conveyors with bottles, crates of bottled sauce, a pallet stack
    putR(14, 18, 28, 18, 'q'); putR(14, 21, 19, 21, 'q'); putR(24, 21, 28, 21, 'q');
    putR(12, 24, 13, 24, 'C'); putR(28, 23, 30, 24, 'C'); put(12, 15, 'C');
    // flour store: rows of flour sacks
    putR(33, 2, 37, 2, 'n'); putR(34, 5, 37, 5, 'n'); putR(33, 8, 37, 8, 'n'); put(38, 11, 'X');
    // mixing room
    putR(34, 16, 36, 17, 'w'); putR(32, 24, 33, 24, 'C'); put(38, 13, 'F');
  },
  furn: {
    ...STREET_FURN,
    K: { h: 1.05, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 1.0, 0.9, lam({ color: 0x2a6a3a }), cx, 0.5, cz, root); box(n, 0.06, 1.0, lam({ color: 0xf3e6c8 }), cx, 1.03, cz, root, false); } },
    w: { h: 0.95, cover: true, draw: ({ box, lam, root, n, cx, cz }) => { box(n - 0.06, 0.9, 0.96, lam({ color: 0x7a7a74 }), cx, 0.45, cz, root); box(n, 0.05, 1.0, lam({ color: 0xb8b8b0 }), cx, 0.93, cz, root, false); } },
    U: { h: 1.4, cover: true, draw: () => {} }, // the kettles are drawn by decorate (they tip over)
    e: { h: 1.0, cover: true, draw: ({ cyl, lam, root, n, cz, x, OX }) => { for (let k = 0; k < n; k++) { cyl(0.38, 0.38, 1.0, lam({ color: [0xc2412d, 0xe8a33d, 0x7a2e1a][(x + k) % 3] }), OX + x + k + 0.5, 0.5, cz, root, 14); cyl(0.36, 0.36, 0.03, lam({ color: 0x2a2a2a }), OX + x + k + 0.5, 1.01, cz, root, 14); } } },
    n: { h: 0.9, cover: true, draw: ({ THREE, root, lam, n, cz, x, OX }) => { // flour sacks, stacked
      for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.32, 0.55), lam({ color: [0xf3ecdc, 0xe8e0cc][(x + k + j) % 2] })); s.position.set(OX + x + k + 0.5, 0.17 + j * 0.34, cz + (j ? 0.06 : -0.06)); s.rotation.y = (x + k + j) % 2 ? 0.08 : -0.06; root.add(s); }
    } },
    q: { h: 0.85, cover: false, draw: ({ THREE, box, lam, root, n, cx, cz, x, OX }) => { // a conveyor with sauce bottles
      box(n, 0.12, 0.7, lam({ color: 0x2a2a2a }), cx, 0.8, cz, root); for (const s of [-1, 1]) box(n, 0.8, 0.06, lam({ color: 0x8a8a84 }), cx, 0.4, cz + s * 0.33, root, false);
      for (let k = 0; k < n * 2; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.26, 8), lam({ color: [0xf3e6c8, 0xc2412d, 0xf2c14e][(x + k) % 3] })); b.position.set(OX + x + 0.25 + k * 0.5, 0.99, cz); b.userData.bottle = true; root.add(b); }
    } },
  },
  rackGoods: [0xc2412d, 0xf3e6c8, 0xf2c14e],
  floors: {
    yellow: (g) => { g.fillStyle = '#c8a040'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#8a6a24'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 64); g.moveTo(0, i); g.lineTo(64, i); g.stroke(); } for (let i = 0; i < 5; i++) { g.fillStyle = 'rgba(240,235,220,.25)'; g.beginPath(); g.arc(Math.random() * 64, Math.random() * 64, 3 + Math.random() * 6, 0, 7); g.fill(); } },
    shoptile: (g) => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = (x + y) % 2 ? '#f3e6c8' : '#2a6a3a'; g.fillRect(x * 16, y * 16, 16, 16); } },
    panel: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#6a4426', '#5a3a20', '#7a4e2a'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(0, y, 64, 1); g.fillRect((y * 5) % 64, y, 1, 8); } },
    hall: (g) => { g.fillStyle = '#4a3a2a'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#e8a33d'; g.fillRect(0, 28, 64, 3); },
  },
  floorRep: { yellow: 1.3, shoptile: 1.2, panel: 1.5, hall: 1.4 },
  hallCells: [[4, 25], [5, 25], [15, 14], [16, 14], [17, 14], [25, 14], [26, 14], [27, 14], [20, 25], [21, 25], [22, 25], [23, 25]],
  doorSigns: { '5,14': 'PERSONEEL', '5,8': 'SAUSMEESTER', '31,5': 'MEEL' },
  neon: { office: 0xe8a33d, hall: 0xf2c14e, shop: 0x6ad86a, kettles: 0xf2c14e, bottling: 0xf2c14e, flour: 0xffd8a0, mixing: 0xf2c14e },
  lights: [[5, 19, 0xf3e6c8, 1.6], [5, 4, 0xe8a33d, 1.6], [5, 11, 0xf2c14e, 1.0], [16, 6, 0xffe08a, 1.8], [25, 6, 0xffe08a, 1.8], [20, 11, 0xffe08a, 1.4], [17, 20, 0xffe08a, 1.5], [26, 20, 0xffe08a, 1.5], [35, 6, 0xffd8a0, 1.3], [35, 19, 0xf2c14e, 1.3], [21, 27, 0xe8a33d, 1.2]],
  mood: { bg: 0x0a0e18, fogNear: 30, fogFar: 74, hemi: 0.55, sun: 0.6, sky: 0xfff0dc, ground: 0x4a4038, wall: 0x6a3428, cap: 0xe8d8c0, under: 0x3a2a24 },
  van: { park: [12, 4.6], rot: Math.PI, from: W + 14, exit: [12.6, 3.0], solid: [8.7, 14.8, 3.45, 5.75] }, // world; along the quay, nose first
  start: [5, 1.4],               // world: on the quay in front of the shop
  bounds: [-4, W + 4, -H, 7.5],  // world: x0, x1, z0, z1 (the canal edge is the south limit)
  validateFrom: [4.5, 24.5],     // cell: inside the shop door
  bossLook: { cap: 0xf3e6c8, shirt: 0xf3e6c8, front: '#f3e6c8', pants: 0x2a2a3a, belly: 1.0, head: { hair: '#2a1a12', brow: '#2a1a12', hairLine: 52, glasses: true, iris: '#3a2a1a' } }, // Sausmeester Mayo-Mo: white coat, chef's cap
  spawns: [ // cell x, cell z, weapon, facing (0 = +z/south), room, boss, { cap }
    [3, 19, 'bat', Math.PI, 'shop'], [8, 15.5, 'makarov', 0, 'shop'], [6, 23, 'bat', Math.PI / 2, 'shop'],
    [3, 11, 'makarov', Math.PI / 2, 'hall'], [9, 10, 'bat', -Math.PI / 2, 'hall'],
    [5.5, 1.6, 'shotgun', 0, 'office', true], [8, 5.5, 'makarov', -Math.PI / 2, 'office'],
    [13, 3, 'bat', 0, 'kettles'], [17.5, 7, 'makarov', Math.PI, 'kettles'], [22.5, 2, 'bat', 0, 'kettles'], [28, 4, 'makarov', -Math.PI / 2, 'kettles'], [24, 11, 'bat', Math.PI, 'kettles'], [14, 11, 'makarov', Math.PI / 2, 'kettles'],
    [13, 16.5, 'bat', Math.PI / 2, 'bottling'], [21, 16.5, 'makarov', 0, 'bottling'], [29, 16.5, 'bat', -Math.PI / 2, 'bottling'], [21.5, 22.5, 'shotgun', Math.PI, 'bottling'], [16, 23, 'bat', Math.PI / 2, 'bottling'],
    [34, 3.5, 'bat', 0, 'flour'], [37.5, 6.5, 'makarov', -Math.PI / 2, 'flour'],
    [33, 21, 'makarov', Math.PI / 2, 'mixing'], [37, 15, 'bat', -Math.PI / 2, 'mixing'],
  ],
  story: [
    { k: 'custom', draw: (c) => { // the landmark: a giant squeeze bottle of watery garlic sauce on the roof behind the factory
      const { THREE, root, box, lam, canvasTex } = c, p = c.at(21, -1.6);
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.25, 3.4, 20), lam({ color: 0xf3ecd8 })); body.position.set(p.x, 4.0, p.z); root.add(body);
      const shoulder = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.0, 20), lam({ color: 0xf3ecd8 })); shoulder.position.set(p.x, 6.2, p.z); root.add(shoulder);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.4, 0.9, 12), lam({ color: 0x2f7a2a })); cap.position.set(p.x, 7.0, p.z); root.add(cap);
      const label = new THREE.Mesh(new THREE.CylinderGeometry(1.13, 1.27, 1.6, 20, 1, true, -Math.PI / 2, Math.PI), lam({ map: canvasTex(256, 96, (g) => { g.fillStyle = '#2f7a2a'; g.fillRect(0, 0, 256, 96); g.fillStyle = '#f3ecd8'; g.font = '900 30px Arial'; g.textAlign = 'center'; g.fillText('HET DUNNE', 128, 40); g.fillText('SAUSJE', 128, 76); }) }));
      label.position.set(p.x, 4.1, p.z); root.add(label);
      box(2.8, 1.5, 0.12, lam({ color: 0x3a3a3a }), p.x, 1.6, p.z, root, false); // the frame it stands on
      const drip = []; for (let i = 0; i < 4; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshPhongMaterial({ color: 0xe8f4f8, transparent: true, opacity: 0.7 })); d.position.set(p.x + 0.1, 7.4 - i, p.z + 0.2); root.add(d); drip.push(d); }
      return (dt) => { for (const d of drip) { d.position.y -= dt * 1.4; if (d.position.y < 2.3) d.position.y = 7.4; } };
    } },
    { k: 'board', at: [17.5, 1.5], wall: 'n', style: 'chalk', title: 'RECEPT', lines: ['1 deel knoflooksaus', '4 delen water', 'snuf behangplaksel', 'NIET AAN EDDY VERTELLEN'], read: ['RECEPT', "The dilution recipe, chalked up for the workers: one part garlic sauce, four parts water, a pinch of wallpaper paste. 'Don't tell Eddy.'"] },
    { k: 'board', at: [2.5, 13.5], wall: 's', style: 'paper', title: 'MEDEDELING', lines: ['Pauze: 3 minuten.', 'Wie praat, vliegt eruit.', 'Wie loopt, ook.', '- de Sausmeester'], read: ['MEDEDELING', 'A notice for the sauce workers: three-minute breaks, no talking, and "whoever walks out stays out". No wonder they run.'] },
    { k: 'papers', at: [19.5, 16.5], n: 9, read: ['ETIKETTEN', 'Rolls of labels: "100% ECHTE KNOFLOOKSAUS. Ambachtelijk bereid." The tubs they go on are 80% tap water.'] },
    { k: 'spill', at: [16.5, 8.5], color: 0xf3ecd8, r: 0.7 }, { k: 'spill', at: [25.5, 12.3], color: 0xf3ecd8, r: 0.45 },
    { k: 'cash', at: [5.5, 3.5], y: 0.81, n: 5 },
    { k: 'crates', at: [35.5, 9.5], label: 'BLOEM', color: '#8a6a3a' },
  ],
  loot: [[1.5, 2.5], [37.5, 3.5], [33.5, 10.5], [37.5, 23.5], [12.5, 23], [29.5, 2.5]], // cell
  text: {
    area: 'OUD-VETTENBURG · SAUZENBUURT',
    banner: ['HET DUNNE SAUSJE', 'Sauzenbuurt. Where the Lampas water down the sauce.'],
    objective: 'Shut down <b>Het Dunne Sausje</b>: kick over the <b>four dilution kettles</b> (E) and clear out the Lampas. The sauce workers in blue caps aren\'t Lampas; they\'ll run. <span style="color:#ffd36b">Sausmeester Mayo-Mo watches from his glass office.</span>',
    objectiveOwned: 'Sauzenbuurt is <b>yours</b>. No more watery garlic sauce. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Sauzenbuurt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'SAUZENBUURT TAKEN',
    resultsHint: 'The kettles are on the floor and the sauce runs into the canal. Grab the spice crates (E), then drive home.',
    ownedBanner: ['SAUZENBUURT IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['MAYO-MO IS DOWN', 'Too thin.'],
    taskHint: 'Kick over every dilution kettle (E).',
    tasksDone: 'ALL KETTLES DOWN',
    tips: ['The floor only clears when all four kettles are on their side. Walk up to one and press E.', 'The workers in blue caps run for the loading bay. Let them go.', 'Two wide openings join the kettle hall and the bottling line. Conveyors are low: bullets fly over them.'],
  },
  decorate({ THREE, root, OX, Z0, G, box, cyl, lam, floorW, T, WALL_H, neonRect, signTex, canvasTex, makePerson, animate, path, run }) {
    const ticks = [];
    const sign = (t, w, h, bg, fg, x, y, z, ry = 0, size = 60) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t, size }], bg, fg, 512, Math.round(512 * h / w)) })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    // the quay, its edge and the canal
    floorW(OX - 14, OX + W + 14, 0, 2.6, T.cobble || T.paving, 1.6); floorW(OX - 14, OX + W + 14, 2.6, 7.6, T.asphalt, 4);
    box(W + 28, 0.25, 0.4, lam({ color: 0x5a5048 }), OX + W / 2, 0.12, 7.8, root, false);
    for (let x = -12; x < W + 14; x += 5) cyl(0.14, 0.16, 0.6, lam({ color: 0x1a1a1a }), OX + x, 0.3, 7.55, root, 8); // bollards on the quay edge
    ticks.push(water(THREE, root, floorW, canvasTex, OX - 14, 8, OX + W + 14, 24));
    // stepped-gable canal houses either side and across the water
    const house = (x, z, w, d, h, c, face) => {
      box(w, h, d, lam({ color: c }), x, h / 2, z, root);
      for (let s = 0; s < 3; s++) box(w * (0.8 - s * 0.25), 0.9, d * 0.9, lam({ color: c }), x, h + 0.45 + s * 0.9, z, root, false);
      for (let k = 0; k < 2; k++) for (let r = 0; r < Math.floor(h / 2.4); r++) if ((k + r + Math.round(x)) % 3) box(0.9, 1.2, 0.05, new THREE.MeshBasicMaterial({ color: [0xf2c14e, 0xe8a33d, 0x2a3040][(k + r + Math.round(x)) % 3] }), x - w / 4 + k * w / 2, 1.6 + r * 2.4, z + face * (d / 2 + 0.03), root, false);
    };
    for (let i = 0; i < 3; i++) house(OX - 3 - i * 5.2, Z0 + 13, 5, 26, 9 + (i % 2) * 2, [0x6a3428, 0x4a2a24, 0x7a4430][i], 1);
    for (let i = 0; i < 3; i++) house(OX + W + 3 + i * 5.2, Z0 + 13, 5, 26, 10 - (i % 2) * 2, [0x5a3a30, 0x6a3428, 0x4a2a24][i], 1);
    for (let i = 0; i < 12; i++) house(OX - 14 + i * 6, 27, 5.8, 6, 9 + (i * 3) % 4, [0x6a3428, 0x4a2a24, 0x7a4430, 0x5a3a30][i % 4], -1);
    // the shop's stepped gable rises above the front wall
    for (let s = 0; s < 3; s++) box(10 - s * 3, 1.2, 0.6, lam({ color: 0x7a3a28 }), OX + 5.5, WALL_H + 0.6 + s * 1.2, Z0 + 25.4, root, false);
    // wall skins: yellow factory tiles, wood office
    const skin = (x0, z0, x1, z1, color) => {
      const m = lam({ color }), add = (x, z, rot) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(1, WALL_H - 0.1), m); p.position.set(x, (WALL_H - 0.1) / 2, z); p.rotation.y = rot; root.add(p); };
      for (let x = x0; x <= x1; x++) { if (G[z0 - 1][x] === '#') add(OX + x + 0.5, Z0 + z0 + 0.012, 0); if (G[z1 + 1][x] === '#') add(OX + x + 0.5, Z0 + z1 + 1 - 0.012, Math.PI); }
      for (let z = z0; z <= z1; z++) { if (G[z][x0 - 1] === '#') add(OX + x0 + 0.012, Z0 + z + 0.5, Math.PI / 2); if (G[z][x1 + 1] === '#') add(OX + x1 + 1 - 0.012, Z0 + z + 0.5, -Math.PI / 2); }
    };
    skin(12, 1, 30, 13, 0xe8c860); skin(12, 15, 30, 24, 0xe8c860); skin(1, 1, 10, 7, 0x6a4426); skin(32, 13, 38, 24, 0xe8e4d8);
    // the facade: the green HALAL SHOARMA sign, a round sign, the roller door
    sign('HALAL SHOARMA', 5.2, 0.6, '#0a140c', '#6ad86a', OX + 5, 2.7, Z0 + 25.02, 0, 64); neonRect(root, OX + 5, 2.7, 5.4, 0.75, Z0 + 25.06, 0x6ad86a);
    sign('HET DUNNE SAUSJE', 4, 0.32, '#1a0e08', '#f3e6c8', OX + 5, 2.15, Z0 + 25.03, 0, 34);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(0.5, 24), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { g.fillStyle = '#c2412d'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#f3e6c8'; g.beginPath(); g.arc(64, 64, 48, 0, 7); g.fill(); g.fillStyle = '#c2412d'; g.font = '900 22px Arial'; g.textAlign = 'center'; g.fillText('SAUS', 64, 72); }) }));
    disc.position.set(OX + 0.6, 2.6, Z0 + 25.5); disc.rotation.y = -Math.PI / 4; root.add(disc);
    sign('LOSSEN · LAMPAS SAUZEN BV', 4.2, 0.4, '#1a1a1a', '#f2c14e', OX + 21.5, 3.0, Z0 + 25.03, 0, 34);
    const roll = new THREE.Mesh(new THREE.PlaneGeometry(4, 0.8), lam({ map: canvasTex(64, 16, (g) => { for (let y = 0; y < 16; y += 4) { g.fillStyle = y % 8 ? '#8a8a86' : '#6a6a66'; g.fillRect(0, y, 64, 4); } }) }));
    roll.position.set(OX + 22, WALL_H - 0.4, Z0 + 25.02); root.add(roll); // the roller door, rolled up
    // pipes along the factory walls and over the kettles
    const pipeM = lam({ color: 0x9aa0a4 });
    for (const z of [1.2, 13.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 18.6, 10), pipeM); p.rotation.z = Math.PI / 2; p.position.set(OX + 21.5, WALL_H - 0.35, Z0 + z); root.add(p); }
    for (const [x] of KETTLES.slice(0, 3)) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.6, 8), pipeM); p.position.set(OX + x, WALL_H - 1.4, Z0 + 2.4); root.add(p); }
    // the kettles: steel pots of watery garlic sauce, on a frame. Each one is a task: E tips it over and floods the floor.
    const tasks = [];
    const sauceM = lam({ color: 0xf3ecdc }), spillM = new THREE.MeshPhongMaterial({ color: 0xf3ecdc, transparent: true, opacity: 0.85, shininess: 80 });
    for (const [x, z] of KETTLES) {
      const g = new THREE.Group(); g.position.set(OX + x, 0, Z0 + z); root.add(g);
      const pot = new THREE.Group(); g.add(pot);
      cyl(0.95, 0.85, 1.25, lam({ color: 0xb8bcc0 }), 0, 0.85, 0, pot, 20); cyl(0.98, 0.98, 0.08, lam({ color: 0x8a8e92 }), 0, 1.48, 0, pot, 20);
      const sauce = new THREE.Mesh(new THREE.CircleGeometry(0.88, 20), sauceM); sauce.rotation.x = -Math.PI / 2; sauce.position.y = 1.42; pot.add(sauce);
      for (const [dx, dz] of [[-0.7, -0.7], [0.7, -0.7], [-0.7, 0.7], [0.7, 0.7]]) cyl(0.06, 0.06, 0.4, lam({ color: 0x3a3a3a }), dx, 0.2, dz, g, 6);
      const gl = glowSprite(THREE, 0xffe08a, 2.2, 2.2, 0.25); gl.position.set(0, 1.6, 0); g.add(gl);
      const spill = new THREE.Mesh(new THREE.CircleGeometry(1, 24), spillM); spill.rotation.x = -Math.PI / 2; spill.position.set(0, 0.03, 0.9); spill.scale.setScalar(0.01); spill.visible = false; g.add(spill);
      const t = { pos: new THREE.Vector3(OX + x, 0, Z0 + z), obj: g, label: 'Kick over the kettle', doneText: 'KETTLE DOWN!', tip: 0,
        act() { t.tip = 0.001; spill.visible = true; gl.visible = false; },
        reset(done) { t.tip = done ? 1 : 0; pot.rotation.set(done ? Math.PI / 2.2 : 0, 0, 0); pot.position.set(0, done ? -0.3 : 0, done ? 0.4 : 0); spill.visible = !!done; spill.scale.setScalar(done ? 1.6 : 0.01); gl.visible = !done; } };
      t.tick = (dt) => { if (t.tip > 0 && t.tip < 1) { t.tip = Math.min(1, t.tip + dt * 2.5); const e = t.tip * t.tip; pot.rotation.x = e * Math.PI / 2.2; pot.position.y = -0.3 * e; pot.position.z = 0.4 * e; spill.scale.setScalar(0.01 + 1.6 * Math.min(1, t.tip * 1.3)); } };
      tasks.push(t);
    }
    // the sauce workers: blue caps, not Lampas. They work until trouble starts, then run out of the loading bay and are gone.
    const workers = WORKERS.map(([x, z], i) => {
      const p = makePerson({ shirt: 0x2a5aa8, front: '#2a5aa8', pants: 0x2a2a3a, ballcap: 0x2a6aff, belly: [0.3, 0.8, 0.5][i % 3], skin: [0xe4ab88, 0xc88a64, 0x9a6a4a][i % 3] });
      p.position.set(OX + x + 0.5, 0, Z0 + z + 0.5); p.rotation.y = Math.PI * (i % 2); root.add(p);
      return { p, home: [x, z], route: null, gone: false };
    });
    const exitV = new THREE.Vector3(OX + EXIT[0], 0, Z0 + EXIT[1]);
    let panic = false, lastT = 0;
    // rain on the quay
    const pl = []; for (let i = 0; i < 26; i++) pl.push([OX - 10 + Math.random() * (W + 20), Math.random() * 7, 0.3 + Math.random() * 0.5]);
    puddles(THREE, root, pl);
    ticks.push(rain(THREE, root, [[OX - 12, 0, OX + W + 12, 22]], 900));
    let t = 0;
    return { tasks, tick(dt) {
      t += dt; for (const f of ticks) f(dt); for (const k of tasks) k.tick(dt);
      const R = run();
      if (R.time < lastT) { panic = false; for (const w of workers) { w.gone = false; w.route = null; w.p.visible = true; w.p.position.set(OX + w.home[0] + 0.5, 0, Z0 + w.home[1] + 0.5); } } // a restart puts them back to work
      lastT = R.time;
      if (!panic && (R.shots > 0 || R.kills > 0 || tasks.some((k) => k.done))) panic = true;
      for (const w of workers) {
        if (w.gone) continue;
        if (!panic) { animate(w.p, 0, dt); w.p.rotation.y += Math.sin(t * 0.7 + w.home[0]) * dt * 0.3; continue; }
        if (!w.route) w.route = path(w.p.position, exitV) || [exitV.clone()];
        const nx = w.route[0]; if (!nx) { w.gone = true; w.p.visible = false; continue; }
        const dx = nx.x - w.p.position.x, dz = nx.z - w.p.position.z, d = Math.hypot(dx, dz), sp = 4.2;
        if (d < 0.2) { w.route.shift(); if (!w.route.length) { w.gone = true; w.p.visible = false; } continue; }
        w.p.position.x += dx / d * sp * dt; w.p.position.z += dz / d * sp * dt; w.p.rotation.y = Math.atan2(dx, dz); animate(w.p, sp, dt);
      }
    } };
  },
}, { kind: 'canal', door: [3, 4], guard: [12, 'bat', Math.PI / 2], tip: 'The quiet way in: a quay runs up the side canal along the east wall to the water door of the flour store. The flour comes in by boat. One Lampas keeps watch, but he watches the water.', read: ['WATERDEUR', 'A note on the water door: "Bloem: dinsdag, per boot. Deur niet op slot, de sleutel is kwijt."'] });
