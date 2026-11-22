// De Zandwijk, mission 5: Dadelplein. The oasis square under the date palms, where the Paravim count their Wilders. Loudly. Built on
// the shared De Zandwijk compound (js/levels/zandwijk.js): a pond with palms in the courtyard and the money tables round it, a counting
// room in the back house, Penningmeester Faris in the diwan.
// The twist: the sandstorm and the money. Every 45 s a sandstorm rolls in and for 12 s nobody sees further than an arm (you included).
// Three money chests stand on the counting tables (E); once the Paravim know you're here, the chests leave for the Kasbah in 40 s.

import { souk, sandstorm } from './zandwijk.js';
import { WATER_FURN, WATER_HAZARD } from './noshgey.js';

const TABLES = [[16, 20], [29, 20], [22, 25]];
const CHEST_T = 40;

export default souk({
  id: 'dadelplein', name: 'Dadelplein', kiosk: 'THEEHUIS DE OASE', sign: 'DADELPLEIN', taskName: 'CHEST',
  // The ring: you come in through the date store, a long barn of sacks down the west side; Penningmeester Faris keeps a small diwan
  // above it, and the tea house looks onto the oasis from the east.
  plan: {
    rooms: [['diwan', 1, 1, 10, 10, 'carpet'], ['store', 1, 12, 10, 28, 'planks'], ['hall', 12, 1, 44, 10, 'plaster'], ['court', 12, 12, 33, 28, 'sand'], ['theehuis', 35, 12, 44, 28, 'zellige']],
    gate: [20, 25], tea: 40,
    layout({ carve, put, putR }) {
      carve(5, 29, 6, 29); putR(36, 29, 38, 29, '%'); carve(39, 29, 40, 29); putR(41, 29, 43, 29, '%');
      putR(5, 11, 6, 11, 'D'); putR(11, 4, 11, 5, 'D'); putR(11, 17, 11, 18, 'D'); putR(11, 24, 11, 25, 'D'); putR(18, 11, 19, 11, 'D'); putR(28, 11, 29, 11, 'D'); putR(34, 20, 34, 21, 'D'); putR(40, 11, 41, 11, 'D');
      // the date store
      putR(2, 13, 3, 14, 'y'); putR(7, 13, 8, 14, 'y'); putR(2, 19, 3, 20, 'y'); putR(7, 21, 8, 22, 'y'); putR(1, 26, 2, 27, 'y'); put(10, 12, 'X'); putR(9, 27, 10, 28, 'C');
      // Faris's diwan
      putR(2, 2, 8, 2, 'd'); putR(3, 6, 6, 7, 'O'); put(1, 1, 'V'); put(10, 1, 'p');
      // the tea house
      putR(42, 14, 43, 14, 'K'); put(44, 12, 'F'); put(37, 17, 'T'); put(42, 21, 'T'); put(37, 25, 'T'); putR(36, 27, 37, 27, 'd'); putR(42, 27, 43, 27, 'd');
    },
    hallCells: [[5, 29], [6, 29], [39, 29], [40, 29]],
    doorSigns: { '5,11': 'PRIVÉ' },
    spawns: [
      [38, 22, 'makarov', Math.PI, 'theehuis', false, { argue: 'tea' }], [39, 22.8, 'machete', 0, 'theehuis', false, { argue: 'tea' }],
      [5, 4, 'revolver', 0, 'diwan', true], [8, 9, 'makarov', -Math.PI / 2, 'diwan'],
      [5, 17, 'machete', Math.PI / 2, 'store'], [6, 24, 'makarov', Math.PI, 'store'],
    ],
    loot: [[1.5, 9.5], [9.5, 1.5], [44, 1.5], [44, 27.5], [1.5, 23]],
  },
  courtName: 'Oase', hallName: 'Telkamer',
  hazard: WATER_HAZARD,
  furn: { ...WATER_FURN },
  mood: { sky: 0xf8d8a0, hemi: 0.66, sun: 0.7, wall: 0xc8925a },
  courtLayout({ put, putR }) {
    putR(21, 18, 24, 20, '~'); // the oasis pond
    for (const [x, z] of [[19, 17], [26, 17], [19, 22], [26, 22], [15, 14], [30, 14], [15, 26], [31, 26]]) put(x, z, 'P');
    for (const [x, z] of TABLES) put(x, z, 'T');
    put(13, 16, 'y'); put(32, 23, 'y'); put(22, 13, 'u'); put(27, 27, 'u');
  },
  hallLayout({ put, putR }) {
    // the counting room: tables of coins, a strongbox wall, sacks of dates
    for (const x of [15, 21, 27, 33]) putR(x, 4, x + 2, 4, 'T'); putR(38, 1, 41, 1, 'V'); putR(14, 8, 15, 9, 'y'); put(44, 10, 'X'); putR(42, 4, 43, 5, 'C');
  },
  courtSpawns: [
    [17, 21.5, 'makarov', Math.PI, 'court'], [30, 21.5, 'makarov', Math.PI, 'court'], [23, 26.5, 'makarov', Math.PI, 'court'], // the counters, by their tables
    [14, 18.5, 'machete', Math.PI / 2, 'court', false, { argue: 'dadel' }], [15.2, 18.5, 'revolver', -Math.PI / 2, 'court', false, { argue: 'dadel' }],
    [22.5, 15.5, 'revolver', 0, 'court', false, { shield: true }], [28, 25, 'machete', -Math.PI / 2, 'court'], [25.5, 13, 'machete', Math.PI, 'court'], [18, 27, 'makarov', Math.PI / 2, 'court'],
  ],
  hallSpawns: [
    [16, 6.5, 'makarov', Math.PI, 'hall'], [22, 6.5, 'makarov', Math.PI, 'hall', false, { argue: 'tel' }], [23.2, 6.5, 'makarov', Math.PI, 'hall', false, { argue: 'tel' }],
    [34, 6.5, 'revolver', Math.PI, 'hall', false, { shield: true }], [40, 3, 'machete', 0, 'hall'], [29, 8.5, 'machete', Math.PI, 'hall'],
  ],
  bossLook: { shirt: 0x2a2e6a, front: '#2a2e6a', pants: 0x3a2a1a, belt: 0xe8a33d, wrap: 0xe8a33d, belly: 1.0, skin: 0x9a6a46, head: { hair: '#2a2a2a', brow: '#1a1a1a', hairLine: 60, iris: '#2a1a10', beard: '#4a4a4a', glasses: true } }, // Penningmeester Faris
  text: {
    area: 'DE ZANDWIJK · DADELPLEIN',
    banner: ['DADELPLEIN', 'The oasis, where the Paravim count their Wilders. Loudly.'],
    objective: 'Take <b>Dadelplein</b> from the Paravim and <b>grab the three money chests</b> (E) from the counting tables. Once they know you\'re here, <b>the chests leave for the Kasbah in 40 seconds</b>. <b>Sandstorms</b> roll in: for a while nobody sees further than an arm. <span style="color:#ffd36b">Penningmeester Faris waits in the diwan.</span>',
    objectiveOwned: 'Dadelplein is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Dadelplein is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'DADELPLEIN TAKEN',
    resultsHint: 'The oasis is yours. Grab the spice crates (E), then drive home.',
    ownedBanner: ['DADELPLEIN IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['PENNINGMEESTER FARIS IS DOWN', 'He lost count.'],
    taskHint: 'Grab the money chests from the counting tables (E).', tasksDone: 'ALLE KISTEN!',
    tips: ['The chests leave 40 seconds after the first Paravim spots you. Go for the money first.', 'In a sandstorm they can\'t see you either. Use it to get close.', 'Knock a Paravim into the pond and he goes under.'],
  },
  decorate(ctx) {
    const { THREE, root, OX, Z0, box, lam, floorW, canvasTex, run, foes, banner, popup, checkClear } = ctx;
    const wt = canvasTex(64, 64, (g) => { g.fillStyle = '#1a5a6a'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(160,230,240,${0.05 + Math.random() * 0.15})`; g.fillRect(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 10, 1); } });
    const wm = floorW(OX + 21, OX + 25, Z0 + 18, Z0 + 21, wt, 2, 0xffffff, 0.03); let wk = 0;
    // money chests on the counting tables
    const chests = TABLES.map(([x, z]) => { const g = new THREE.Group(); g.position.set(OX + x + 0.5, 0.78, Z0 + z + 0.5); root.add(g);
      box(0.6, 0.4, 0.42, lam({ color: 0x5a3a1a }), 0, 0.2, 0, g); box(0.62, 0.08, 0.44, lam({ color: 0xe8a33d }), 0, 0.42, 0, g, false);
      for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), lam({ color: 0xe8c040, emissive: 0x2a2000 })); c.position.set(-0.5 + k * 0.2, 0.01 + (k % 2) * 0.02, 0.35); g.add(c); }
      return g; });
    let gone = false, timer = -1, last = 0, wonT = 0;
    const tasks = chests.map((g, i) => ({ pos: new THREE.Vector3(OX + TABLES[i][0] + 0.5, 0, Z0 + TABLES[i][1] + 1.5), obj: g, label: 'Grab the money chest', score: 1000, doneText: 'KASSA!',
      act() { if (gone) return; g.visible = false; }, reset(done) { g.visible = !done; } }));
    const storm = sandstorm(ctx, { every: 45, dur: 12, sight: 3, first: 25 });
    const reset = () => { gone = false; timer = -1; storm.reset(); };
    return {
      tasks,
      reset,
      tick(dt) {
        wk += dt; wm.material.map.offset.x = wk * 0.01;
        const R = run(); if (R.time < last) reset(); last = R.time;
        storm.tick(dt);
        if (R.results || gone) return;
        if (timer < 0 && (R.paraAlarm || foes().some((e) => { const f = e.userData.foe; return f.alive && f.state === 'chase'; }))) { timer = 0; banner('DE KISTEN!', `They are taking the money to the Kasbah. ${CHEST_T} seconds.`, 2); }
        if (timer >= 0) {
          const t0 = timer; timer += dt; const left = Math.ceil(CHEST_T - timer);
          if (left <= 10 && Math.ceil(CHEST_T - t0) !== left && left > 0) popup(new THREE.Vector3(ctx.player.position.x, 0, ctx.player.position.z), `KISTEN: ${left}`, '#ffd36b');
          if (timer >= CHEST_T) { gone = true; let n = 0; tasks.forEach((t) => { if (!t.done) { n++; t.done = true; t.score = 0; t.obj.visible = false; } });
            if (n) banner('TE LAAT!', `${n} chest${n > 1 ? 's' : ''} gone to the Kasbah. Finish the Paravim anyway.`, 2.4); checkClear(); }
        }
      },
    };
  },
});
