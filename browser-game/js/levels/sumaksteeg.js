// De Zandwijk, mission 3: Sumaksteeg. An alley so narrow the Paravim can glare at you from both sides at once. Built on the De Zandwijk
// De Zandwijk compound (js/levels/zandwijk.js): the courtyard is filled with houses, leaving a winding alley from the gate to the back
// house, with carpets hung across it to dry. Sumak-Sami keeps the diwan.
// The twist: lookouts. Three Paravim stand in doorway niches along the alley; once one spots you he lights a sumak-red flare, and if it
// burns down (6 s) three more Paravim come running and the whole alley knows where you are. Get to the lookouts first.
// The carpets block sight both ways (you can walk under them).

import { souk } from './zandwijk.js';

const ALLEY = [ // carved out of the courtyard: [x0, z0, x1, z1]
  [12, 27, 26, 28], [19, 26, 26, 26], [21, 20, 22, 25], [12, 20, 22, 21], [12, 22, 13, 24], [14, 12, 15, 19], [14, 12, 30, 13],
  [29, 14, 30, 23], [29, 18, 33, 19], [25, 22, 30, 23], [25, 24, 26, 25],
];
const NICHES = [[16, 16], [24, 14], [31, 21]]; // lookout doorways
const CARPETS = [[21, 23, 22, 23], [14, 16, 15, 16], [20, 12, 20, 13], [29, 16, 30, 16], [27, 22, 27, 23]];
const FLARE_T = 6;

export default souk({
  id: 'sumaksteeg', name: 'Sumaksteeg', kiosk: 'THEEHUIS DE STEEG', sign: 'SUMAKSTEEG',
  // The ring: a long tea house runs down the whole west side with a little tiled hamam above it; Sumak-Sami's diwan hides in the
  // south-east corner behind the store, so the alley is the only quick way to him.
  plan: {
    rooms: [['hamam', 1, 1, 10, 10, 'zellige'], ['theehuis', 1, 12, 10, 28, 'zellige'], ['hall', 12, 1, 44, 10, 'plaster'], ['court', 12, 12, 33, 28, 'cobble'], ['store', 35, 12, 44, 19, 'planks'], ['diwan', 35, 21, 44, 28, 'carpet']],
    layout({ carve, put, putR }) {
      carve(5, 29, 6, 29); putR(1, 29, 3, 29, '%'); putR(8, 29, 10, 29, '%');
      putR(5, 11, 6, 11, 'D'); putR(11, 4, 11, 5, 'D'); putR(11, 20, 11, 21, 'D'); putR(18, 11, 19, 11, 'D'); putR(28, 11, 29, 11, 'D'); putR(34, 18, 34, 19, 'D'); putR(40, 11, 41, 11, 'D'); putR(39, 20, 40, 20, 'D');
      // the tea house
      putR(2, 14, 7, 14, 'K'); put(10, 13, 'F'); put(3, 18, 'T'); put(8, 17, 'T'); put(3, 24, 'T'); put(8, 25, 'T'); putR(2, 27, 3, 27, 'd'); putR(8, 27, 9, 27, 'd');
      // the hamam: two basins, cushions
      put(3, 4, 'W'); put(7, 4, 'W'); putR(2, 8, 4, 8, 'd'); put(10, 1, 'p');
      // the store and Sami's diwan
      putR(37, 14, 42, 14, 'y'); putR(37, 17, 42, 17, 'y'); put(44, 12, 'X');
      putR(37, 27, 42, 27, 'd'); putR(38, 23, 41, 23, 'O'); putR(44, 22, 44, 26, 'S'); put(35, 28, 'V'); put(44, 28, 'p');
    },
    hallCells: [[5, 29], [6, 29]],
    doorSigns: { '39,20': 'PRIVÉ' },
    spawns: [
      [4, 22, 'makarov', Math.PI, 'theehuis', false, { argue: 'tea' }], [5, 22.8, 'machete', 0, 'theehuis', false, { argue: 'tea' }],
      [5, 6, 'makarov', Math.PI, 'hamam'], [8, 9, 'machete', Math.PI / 2, 'hamam'],
      [39, 16, 'machete', Math.PI / 2, 'store'], [42, 15.5, 'makarov', -Math.PI / 2, 'store'],
      [40, 25, 'revolver', 0, 'diwan', true], [37, 22, 'makarov', Math.PI / 2, 'diwan'],
    ],
    loot: [[1.5, 10], [9.5, 1.5], [44, 1.5], [44, 19], [1.5, 26]],
  },
  courtName: 'Steeg', court: 'cobble',
  floors: { cobble: (g) => { g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 10) for (let x = (y / 10) % 2 ? 0 : 8; x < 64; x += 16) { g.fillStyle = ['#a8845a', '#9a7650', '#b48e62'][(x + y) % 3]; g.beginPath(); g.ellipse(x + 6, y + 5, 6, 4, 0, 0, 6.3); g.fill(); } } },
  floorRep: { cobble: 2 },
  mood: { bg: 0x140a06, hemi: 0.5, sun: 0.45, wall: 0x9a3a2a },
  courtLayout({ carve, putR, put }) {
    putR(12, 12, 33, 28, '#');
    for (const [x0, z0, x1, z1] of ALLEY) carve(x0, z0, x1, z1);
    for (const [x, z] of NICHES) carve(x, z, x, z);
    put(19, 28, 'y'); put(26, 26, 'u');
  },
  hallLayout({ put, putR }) {
    putR(14, 2, 16, 2, 'd'); putR(22, 1, 26, 1, 'R'); putR(31, 1, 35, 1, 'R'); putR(20, 6, 21, 7, 'C'); putR(33, 6, 34, 7, 'C'); put(44, 10, 'X'); putR(42, 3, 43, 4, 'y');
  },
  courtSpawns: [
    [16, 27.5, 'makarov', Math.PI / 2, 'court', false, { argue: 'steeg' }], [17.2, 27.5, 'machete', -Math.PI / 2, 'court', false, { argue: 'steeg' }],
    [21.5, 22, 'machete', 0, 'court'], [17, 20.5, 'makarov', Math.PI / 2, 'court'], [14.5, 14, 'revolver', 0, 'court', false, { shield: true }], [26, 12.5, 'machete', -Math.PI / 2, 'court'],
    [29.5, 20, 'makarov', Math.PI, 'court'], [32, 18.5, 'machete', -Math.PI / 2, 'court'],
    [16.5, 16.5, 'revolver', -Math.PI / 2, 'court'], [24.5, 14.5, 'revolver', Math.PI, 'court'], [31.5, 21.5, 'revolver', Math.PI / 2, 'court'], // the lookouts (NICHES)
    ...['makarov', 'machete', 'makarov', 'machete', 'revolver', 'makarov', 'machete', 'makarov', 'machete'].map((w) => [22, 27.5, w, Math.PI, 'court', false, { reserve: true }]),
  ],
  hallSpawns: [
    [18, 4.5, 'makarov', Math.PI / 2, 'hall'], [25, 8, 'machete', Math.PI, 'hall'], [30, 4, 'revolver', 0, 'hall', false, { shield: true }], [39, 7.5, 'makarov', -Math.PI / 2, 'hall'],
    [36, 8.5, 'makarov', Math.PI / 2, 'hall', false, { argue: 'achter' }], [37.2, 8.5, 'machete', -Math.PI / 2, 'hall', false, { argue: 'achter' }],
  ],
  bossLook: { shirt: 0x8a1a2a, front: '#8a1a2a', pants: 0x2a1a1a, belt: 0xe8a33d, wrap: 0x2a2e6a, belly: 0.9, skin: 0xb07a52, head: { hair: '#1a1410', brow: '#1a1410', hairLine: 60, iris: '#2a1a10', beard: '#1a1410' } }, // Sumak-Sami
  text: {
    area: 'DE ZANDWIJK · SUMAKSTEEG',
    banner: ['SUMAKSTEEG', 'So narrow they can glare at you from both sides at once.'],
    objective: 'Take <b>Sumaksteeg</b> from the Paravim. Three <b>lookouts</b> stand in doorways along the alley: once one spots you he <b>lights a flare</b>, and if it burns down <b>more Paravim come running</b>. Get to them first. <b>Carpets</b> across the alley block sight. <span style="color:#ffd36b">Sumak-Sami waits in the diwan.</span>',
    objectiveOwned: 'Sumaksteeg is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Sumaksteeg is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'SUMAKSTEEG TAKEN',
    resultsHint: 'The alley is yours. Grab the spice crates (E), then drive home.',
    ownedBanner: ['SUMAKSTEEG IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['SUMAK-SAMI IS DOWN', 'Red to the end.'],
    tips: ['A lookout who spots you lights a red flare. Kill or knock him down before it burns out.', 'Carpets block sight: nobody sees through them, you included.', 'The alley is narrow. A door, a sack or a corner is all the cover you get.'],
  },
  decorate({ THREE, root, OX, Z0, lam, run, reinforce, reserves, foes, smokeAt, banner, popup, paraAlarm }) {
    // carpets hung across the alley to dry
    const cols = [0x8a1a1a, 0x2a2e6a, 0xe8a33d, 0x6a2a5a, 0xb4542c];
    CARPETS.forEach(([x0, z0, x1, z1], i) => {
      const horiz = z0 === z1, w = horiz ? x1 - x0 + 1 : z1 - z0 + 1;
      const c = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.2, 1.3), lam({ color: cols[i % cols.length], side: THREE.DoubleSide }));
      c.position.set(OX + (x0 + x1) / 2 + 0.5, 2.6, Z0 + (z0 + z1) / 2 + 0.5); if (!horiz) c.rotation.y = Math.PI / 2; root.add(c);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, w + 0.6, 6), lam({ color: 0x3a2a1a })); pole.rotation.z = Math.PI / 2; pole.position.set(c.position.x, 3.27, c.position.z); if (!horiz) pole.rotation.set(Math.PI / 2, 0, 0); root.add(pole);
    });
    const hang = () => { for (const [x0, z0, x1, z1] of CARPETS) for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) smokeAt(x + 0.5, z + 0.5, 0.4, 1e9); };
    // the lookouts and their flares
    let looks = null, last = 0;
    const flareM = new THREE.MeshBasicMaterial({ color: 0xff3a2a });
    const mkFlare = () => { const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), flareM); s.position.y = 2.1; g.add(s); const l = new THREE.PointLight(0xff2a1a, 0, 7, 1.5); l.position.y = 2.2; g.add(l); g.userData.l = l; g.visible = false; root.add(g); return g; };
    const find = () => NICHES.map(([x, z]) => ({ e: foes().find((o) => { const sp = o.userData.foe.spawn; return Math.floor(sp[0]) === x && Math.floor(sp[1]) === z; }), t: -1, done: false, fl: mkFlare() }));
    const resetLooks = () => { if (!looks) looks = find(); for (const L2 of looks) { L2.t = -1; L2.done = false; L2.fl.visible = false; L2.fl.userData.l.intensity = 0; } };
    return {
      reset() { hang(); resetLooks(); },
      tick(dt) {
        const R = run(); if (!looks) { resetLooks(); hang(); } if (R.time < last) resetLooks(); last = R.time;
        if (R.results) return;
        for (const L2 of looks) {
          const e = L2.e; if (!e || L2.done) continue; const f = e.userData.foe;
          if (!f.alive || f.down > 0) { if (L2.t >= 0) popup(e.position, 'FAKKEL UIT', '#b9d46e'); L2.t = -1; L2.fl.visible = false; if (!f.alive) L2.done = true; continue; }
          if (L2.t < 0 && (f.state === 'chase' || f.state === 'search')) { L2.t = 0; banner('DE FAKKEL!', 'A lookout is lighting a flare. Stop him before it burns out.', 1.6); }
          if (L2.t >= 0) {
            L2.t += dt; L2.fl.visible = true; L2.fl.position.copy(e.position); L2.fl.userData.l.intensity = 1.5 + Math.sin(R.time * 30) * 0.6 + L2.t * 0.4;
            if (Math.floor(L2.t) !== Math.floor(L2.t - dt)) popup(e.position, String(Math.max(0, Math.ceil(FLARE_T - L2.t))), '#ff3a2a');
            if (L2.t >= FLARE_T) { L2.done = true; L2.fl.visible = false; if (reserves()) reinforce(3, OX + 22.5, Z0 + 27.5, ['De fakkel! Waar is hij?!', 'Daar! In de steeg!', 'Sumaksteeg is van ons!']); paraAlarm(e.position); banner('TE LAAT!', 'The flare is up. More Paravim are coming.', 2); }
          }
        }
      },
    };
  },
});
