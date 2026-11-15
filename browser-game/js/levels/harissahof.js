// De Zandwijk, mission 4: Harissahof. A courtyard of big harissa pots, red and hot, with guards to match. Built on the shared
// De Zandwijk compound (js/levels/zandwijk.js): pots in rows round the well, the kitchen in the back house, the cellar (store) where
// Ras al Gara's own harissa recipe is kept. Kok Kadir runs the kitchen from the diwan.
// The twist: the pots. Shoot one and burning harissa splashes everyone next to it, Paravim and Eddy alike. And the guards here argue
// more than anywhere else: three pairs bicker in the courtyard, which is the quiet way in.

import { souk } from './zandwijk.js';

const POTS = []; for (const z of [14, 17, 23, 26]) for (const x of [14, 17, 20, 25, 28, 31]) POTS.push([x, z]);

export default souk({
  id: 'harissahof', name: 'Harissahof', kiosk: 'THEEHUIS HARISSA', sign: 'HARISSAHOF',
  courtName: 'Hof', hallName: 'Keuken', storeName: 'Kelder',
  mood: { bg: 0x1a0806, sky: 0xf0b080, hemi: 0.58 },
  lights: [[5, 23, 0xffd8a0, 1.4], [5, 8, 0xe8a33d, 1.6], [18, 5, 0xff9a60, 1.4], [30, 5, 0xff9a60, 1.4], [40, 5, 0xffc878, 1.1], [17, 20, 0xff7040, 1.1], [28, 20, 0xff7040, 1.1], [40, 20, 0xd8a83a, 1.0]],
  courtLayout({ put }) { for (const [x, z] of POTS) put(x, z, 'h'); put(22, 20, 'W'); put(23, 20, 'W'); },
  hallLayout({ put, putR }) {
    // the kitchen: long prep counters, a stove, sacks of chillies
    putR(14, 3, 20, 3, 'K'); putR(24, 3, 30, 3, 'K'); putR(34, 2, 37, 2, 'F'); putR(14, 8, 15, 9, 'y'); putR(38, 7, 39, 8, 'y'); put(44, 10, 'X'); putR(42, 1, 43, 1, 'h');
  },
  storeLayout({ putR, put }) { for (const z of [14, 17, 20, 23]) putR(37, z, 42, z, 'R'); putR(43, 26, 44, 27, 'h'); put(44, 12, 'X'); },
  rackGoods: [0xb8301a, 0xa8481e, 0xd8461e],
  courtSpawns: [
    [15.5, 15.5, 'makarov', Math.PI / 2, 'court', false, { argue: 'a' }], [16.7, 15.5, 'machete', -Math.PI / 2, 'court', false, { argue: 'a' }],
    [26.5, 15.5, 'revolver', Math.PI / 2, 'court', false, { argue: 'b' }], [27.7, 15.5, 'makarov', -Math.PI / 2, 'court', false, { argue: 'b' }],
    [18.5, 24.5, 'machete', Math.PI / 2, 'court', false, { argue: 'c' }], [19.7, 24.5, 'makarov', -Math.PI / 2, 'court', false, { argue: 'c' }],
    [22.5, 18, 'revolver', Math.PI, 'court'], [30, 21, 'makarov', -Math.PI / 2, 'court'], [13, 20, 'machete', Math.PI / 2, 'court'],
  ],
  hallSpawns: [
    [17, 5.5, 'machete', Math.PI / 2, 'hall'], [27, 5.5, 'makarov', Math.PI, 'hall', false, { shield: true }], [33, 8, 'revolver', 0, 'hall'], [22, 8.5, 'makarov', Math.PI, 'hall'], [41, 5, 'machete', -Math.PI / 2, 'hall'],
  ],
  storeSpawns: [[39.5, 15.5, 'makarov', Math.PI / 2, 'store', false, { shield: true }], [40, 21.5, 'machete', -Math.PI / 2, 'store'], [36, 26, 'revolver', 0, 'store']],
  bossLook: { shirt: 0xf3e6c8, front: '#f3e6c8a', pants: 0x3a2a1a, belt: 0xb8301a, wrap: 0xb8301a, belly: 1.8, skin: 0xc8946a, head: { hair: '#2a2a2a', brow: '#1a1a1a', hairLine: 60, iris: '#2a1a10', beard: '#3a3a3a' } }, // Kok Kadir, in his apron
  text: {
    area: 'DE ZANDWIJK · HARISSAHOF',
    banner: ['HARISSAHOF', 'Red and hot, with guards to match. Two of them are always arguing.'],
    objective: 'Take the <b>Harissahof</b> from the Paravim and <b>steal Ras al Gara\'s harissa recipe</b> (E) from the cellar. <b>Shot pots splash burning harissa</b> on everyone next to them, you included. Three pairs of guards are <b>arguing</b>: they see nothing while they bicker. <span style="color:#ffd36b">Kok Kadir waits in the diwan.</span>',
    objectiveOwned: 'The Harissahof is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">The Harissahof is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'HARISSAHOF TAKEN',
    resultsHint: 'The courtyard is yours, and so is the recipe. Grab the spice crates (E), then drive home.',
    ownedBanner: ['HARISSAHOF IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['KOK KADIR IS DOWN', 'Too hot to handle.'],
    taskHint: 'Steal the recipe jar from the cellar (E).', tasksDone: 'HET RECEPT!',
    tips: ['Shoot a harissa pot next to a group: it burns everyone in reach. Keep your own distance.', 'Arguing Paravim see nothing past arm\'s length. Sneak up with the Maboota.', 'One loud shot and every Paravim in the courtyard stops arguing.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, spill }) {
    const jar = new THREE.Group(); jar.position.set(OX + 44, 0, Z0 + 15.6); root.add(jar);
    const j = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.42, 12), lam({ color: 0xc81e0e, emissive: 0x2a0400 })); j.position.y = 0.95; jar.add(j);
    box(0.4, 0.75, 0.4, lam({ color: 0x5a3a1a }), 0, 0.37, 0, jar); box(0.2, 0.06, 0.2, lam({ color: 0xe8a33d }), 0, 1.19, 0, jar, false);
    const tasks = [{ pos: new THREE.Vector3(OX + 43.5, 0, Z0 + 16.5), obj: jar, label: 'Steal the harissa recipe', score: 1500, doneText: 'HET RECEPT!', act() { j.visible = false; }, reset(done) { j.visible = !done; } }];
    const burst = new Set();
    return {
      tasks,
      onShot(ch, x, z) { if (ch !== 'h') return false; const k = x + ',' + z; if (burst.has(k)) return false; burst.add(k); spill(new THREE.Vector3(OX + x + 0.5, 0, Z0 + z + 0.5), 1.9, { text: 'HARISSA!', color: 0xc81e0e, kill: true, scorch: true }); return true; },
      reset() { burst.clear(); },
    };
  },
});
