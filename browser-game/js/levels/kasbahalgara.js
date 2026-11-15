// De Zandwijk finale: Kasbah al Gara. Ras al Gara's fortress on the west quay. Built on the shared De Zandwijk compound
// (js/levels/zandwijk.js): a walled courtyard behind the gate, the guard room in the diwan, a watchtower in the store, and Ras's hall in
// the back house, pillars down both sides and his cushions on a dais at the end.
// The finale: Ras al Gara (seven hits) holds the hall behind a row of tray-shield guards and fires his long rifle down it; at three hits
// left he draws his scimitar and charges, and every Paravim still standing gets Wraak. The floor clears once you take the Paravim
// ledger (E) from the dais: Dad's handwriting on the paid shipments, Oom Gerrit's on the three that never came. The settlement.

import { souk } from './zandwijk.js';

export default souk({
  id: 'kasbahalgara', name: 'Kasbah al Gara', kiosk: 'POORTWACHT', sign: 'KASBAH AL GARA', taskName: 'LEDGER',
  courtName: 'Binnenhof', hallName: 'Hal van Ras', diwanName: 'Wachtkamer', storeName: 'Wachttoren',
  mood: { bg: 0x120806, sky: 0xe8a070, hemi: 0.55, sun: 0.5, wall: 0xa8481e },
  neon: { hall: 0xe8a33d },
  lights: [[5, 23, 0xffd8a0, 1.3], [5, 8, 0xffc878, 1.3], [16, 5, 0xffb060, 1.2], [28, 3, 0xe8a33d, 2.0], [40, 5, 0xffb060, 1.2], [17, 18, 0xffa050, 1.0], [28, 18, 0xffa050, 1.0], [22, 25, 0xffa050, 1.0], [40, 20, 0xffc878, 1.2]],
  diwanLayout({ put, putR }) { putR(2, 2, 8, 2, 'R'); putR(3, 7, 6, 8, 'T'); putR(1, 12, 1, 15, 'S'); put(10, 15, 'X'); },
  courtLayout({ put, putR }) {
    // inner battlements: low walls of crates and sandbags, a well, palms
    putR(15, 15, 17, 15, 'C'); putR(26, 15, 28, 15, 'C'); putR(14, 20, 15, 21, 'y'); putR(30, 20, 31, 21, 'y'); putR(19, 24, 20, 24, 'C'); putR(25, 24, 26, 24, 'C');
    put(22, 19, 'W'); put(23, 19, 'W'); put(13, 13, 'P'); put(32, 13, 'P');
  },
  hallLayout({ put, putR }) {
    for (const x of [16, 22, 34, 40]) { put(x, 4, '#'); put(x, 7, '#'); } // pillars
    putR(25, 1, 32, 1, 'd'); put(24, 1, 'p'); put(33, 1, 'p'); put(13, 1, 'X'); put(44, 10, 'X');
  },
  storeLayout({ putR, put }) { putR(37, 14, 38, 15, 'C'); putR(41, 18, 42, 19, 'C'); putR(37, 23, 38, 24, 'C'); put(44, 27, 'X'); },
  diwanSpawns: [[4, 4.5, 'makarov', 0, 'diwan'], [8, 10, 'machete', -Math.PI / 2, 'diwan', false, { shield: true }], [3, 11, 'revolver', Math.PI / 2, 'diwan']],
  courtSpawns: [
    [16, 16.5, 'makarov', Math.PI, 'court', false, { shield: true }], [27, 16.5, 'makarov', Math.PI, 'court', false, { shield: true }],
    [20, 13, 'revolver', 0, 'court'], [25, 13, 'revolver', 0, 'court'], [18, 21, 'machete', Math.PI / 2, 'court'], [28, 21, 'machete', -Math.PI / 2, 'court'],
    [21.5, 26, 'makarov', Math.PI / 2, 'court', false, { argue: 'poort' }], [22.7, 26, 'machete', -Math.PI / 2, 'court', false, { argue: 'poort' }], [32.5, 24, 'makarov', -Math.PI / 2, 'court'],
  ],
  hallSpawns: [
    [28.5, 3, 'revolver', 0, 'hall', true, 'rasalgara'],
    [25, 7.5, 'makarov', Math.PI, 'hall', false, { shield: true }], [27.5, 7.5, 'makarov', Math.PI, 'hall', false, { shield: true }], [30, 7.5, 'makarov', Math.PI, 'hall', false, { shield: true }], [32.5, 7.5, 'makarov', Math.PI, 'hall', false, { shield: true }],
    [19, 5.5, 'revolver', Math.PI / 2, 'hall'], [37, 5.5, 'revolver', -Math.PI / 2, 'hall'], [14, 8.5, 'machete', Math.PI / 2, 'hall'], [43, 3, 'machete', -Math.PI / 2, 'hall'],
  ],
  storeSpawns: [[39.5, 13, 'revolver', Math.PI / 2, 'store'], [40, 21.5, 'revolver', -Math.PI / 2, 'store'], [43, 25, 'machete', Math.PI, 'store']],
  loot: [[28.5, 9.5]],
  text: {
    area: 'DE ZANDWIJK · KASBAH AL GARA',
    banner: ['KASBAH AL GARA', 'Ras al Gara\'s fortress. Nobody has walked out of here smiling.'],
    objective: 'Storm <b>Kasbah al Gara</b>. Take down <b>Ras al Gara</b> in his hall (<b>seven hits</b>; at three he draws his scimitar and every Paravim goes wild) and <b>take the Paravim ledger</b> (E) from his dais. <span style="color:#ffd36b">This settles it with the Paravim.</span>',
    objectiveOwned: 'Kasbah al Gara is <b>yours</b>, and the Paravim are settled. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">The Kasbah has fallen.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'THE PARAVIM ARE SETTLED',
    resultsHint: 'Ras al Gara read the ledger: Dad paid his debts, Oom Gerrit never did. The Paravim are done with you, and they\'ll trade with you now. Grab the spice crates (E), then drive home.',
    ownedBanner: ['KASBAH AL GARA IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['RAS AL GARA IS DOWN', 'The Paravim are beaten. Take the ledger.'],
    taskHint: 'Take the Paravim ledger from the dais (E).', tasksDone: 'HET GROOTBOEK',
    tips: ['Ras al Gara takes seven hits. At three he drops the rifle and charges: keep moving.', 'The tray-shield guards in the hall stop bullets from the front. Go round the pillars.', 'The ledger lies on his cushions. The Kasbah only falls once you have it.'],
  },
  decorate({ THREE, root, OX, Z0, box, cyl, lam, sign, banner }) {
    // Ras's dais: a brass lamp, a tea tray, the ledger on a low table
    sign('RAS AL GARA', 2.6, 0.42, '#2a2e6a', '#e8a33d', OX + 28.5, 2.6, Z0 + 1.03, 0, 40);
    for (const x of [25.5, 31.5]) { const lamp = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), new THREE.MeshBasicMaterial({ color: 0xffc070 })); lamp.position.set(OX + x, 2.1, Z0 + 1.4); root.add(lamp); cyl(0.02, 0.02, 0.8, lam({ color: 0xc8a040 }), OX + x, 2.6, Z0 + 1.4, root, 6); }
    const book = new THREE.Group(); book.position.set(OX + 28.5, 0.36, Z0 + 1.55); root.add(book);
    box(0.5, 0.08, 0.36, lam({ color: 0x6a2a1a }), 0, 0.04, 0, book); box(0.46, 0.07, 0.34, lam({ color: 0xf3e6c8 }), 0, 0.075, 0, book, false); box(0.04, 0.09, 0.37, lam({ color: 0xe8a33d }), -0.23, 0.045, 0, book, false);
    const tasks = [{ pos: new THREE.Vector3(OX + 28.5, 0, Z0 + 2.9), obj: book, label: 'Take the Paravim ledger', score: 4000, doneText: 'HET GROOTBOEK!',
      act() {
        book.visible = false;
        // the settlement: Ras, on the floor, reads the ledger
        setTimeout(() => banner('HET GROOTBOEK', 'Dad\'s handwriting on every paid shipment. Oom Gerrit\'s on the three that never came.', 3), 400);
        setTimeout(() => banner('RAS AL GARA', '"Je vader betaalde. Gerrit niet." For the first time today, he is quiet.', 3.4), 3600);
      },
      reset(done) { book.visible = !done; } }];
    return { tasks };
  },
});
