// De Zandwijk, mission 2: Za'atarmarkt. The Paravim souk: striped awnings, spice pyramids, a weigh-house at the back and a lot of
// shouting. Built on the De Zandwijk compound outside (js/levels/zandwijk.js): the courtyard is the market, the back house the weigh-house
// where the market tax is counted, Marktmeester Mustafa in the diwan.
// The twist: the stall keepers. Each one is already angry with you; shoot his stall and he joins the fight. The striped awnings block
// sight both ways. Tray shields show up for the first time in the weigh-house.

import { souk, SOUK_FURN } from './zandwijk.js';

// market stalls: [x0, x1, z] (a run of 'm'); the ones with a keeper behind them (k) turn into fighters when shot
const STALLS = [[14, 16, 14, 1], [20, 22, 14, 0], [27, 29, 14, 1], [14, 16, 18, 0], [23, 25, 18, 1], [29, 31, 18, 0], [17, 19, 22, 1], [25, 27, 22, 1], [14, 16, 26, 0], [28, 30, 26, 1]];
const KEEPERS = STALLS.filter((s) => s[3]);

export default souk({
  id: 'zaatarmarkt', name: "Za'atarmarkt", kiosk: 'THEEHUIS ZA\'ATAR', sign: "ZA'ATARMARKT",
  // The ring: the souk spills all the way to the west wall and opens straight onto the street through its own market gate, Mustafa's
  // diwan sits over it in the north-west corner, and the tea house has moved across to the east side.
  mood: { wall: 0xc0703a },
  plan: {
    rooms: [['diwan', 1, 1, 10, 10, 'carpet'], ['hall', 12, 1, 44, 10, 'plaster'], ['court', 1, 12, 33, 28, 'sand'], ['theehuis', 35, 12, 44, 28, 'zellige']],
    gate: [20, 25], tea: 40,
    layout({ carve, put, putR }) {
      carve(4, 29, 7, 29); // the market's own gate, where you come in
      putR(36, 29, 38, 29, '%'); carve(39, 29, 40, 29); putR(41, 29, 43, 29, '%');
      putR(5, 11, 6, 11, 'D'); putR(11, 4, 11, 5, 'D'); putR(18, 11, 19, 11, 'D'); putR(28, 11, 29, 11, 'D'); putR(34, 18, 34, 19, 'D'); putR(40, 11, 41, 11, 'D');
      // the west end of the souk: more stalls (no keepers), spice pyramids
      putR(2, 15, 4, 15, 'm'); putR(7, 18, 9, 18, 'm'); putR(2, 22, 4, 22, 'm'); putR(7, 25, 9, 25, 'm'); put(9, 13, 'u'); put(1, 28, 'u');
      // Mustafa's diwan
      putR(2, 2, 8, 2, 'd'); putR(3, 6, 6, 7, 'O'); put(1, 1, 'V'); put(10, 1, 'p');
      // the tea house
      putR(42, 14, 43, 14, 'K'); put(44, 12, 'F'); put(37, 17, 'T'); put(42, 20, 'T'); put(37, 24, 'T'); putR(36, 27, 37, 27, 'd'); putR(42, 27, 43, 27, 'd');
    },
    hallCells: [[4, 29], [5, 29], [6, 29], [7, 29], [39, 29], [40, 29]],
    doorSigns: { '5,11': 'PRIVÉ' },
    spawns: [
      [38, 22, 'makarov', Math.PI, 'theehuis', false, { argue: 'tea' }], [39, 22.8, 'machete', 0, 'theehuis', false, { argue: 'tea' }],
      [5, 4, 'revolver', 0, 'diwan', true], [8, 9, 'makarov', -Math.PI / 2, 'diwan'],
      [6, 20, 'machete', Math.PI / 2, 'court'], [3, 26, 'makarov', 0, 'court'],
    ],
    loot: [[1.5, 9.5], [9.5, 1.5], [44, 1.5], [44, 27.5], [1.5, 26]],
  },
  courtName: 'Souk', hallName: 'Weeghuis',
  furn: { m: { ...SOUK_FURN.m, sight: true } }, // the awnings block sight both ways
  courtLayout({ put, putR }) {
    for (const [x0, x1, z] of STALLS) putR(x0, z, x1, z, 'm');
    put(12, 20, 'u'); put(33, 23, 'u'); put(21, 26, 'u'); put(24, 24, 'u');
  },
  hallLayout({ put, putR }) {
    // the weigh-house: the big scales, sacks waiting to be weighed, racks of spice tins, the tax counter
    putR(14, 2, 15, 3, 'y'); putR(14, 7, 15, 8, 'y'); putR(22, 1, 26, 1, 'R'); putR(31, 1, 35, 1, 'R');
    putR(21, 6, 23, 6, 'K'); putR(33, 5, 38, 5, 'K'); put(43, 2, 'C'); put(43, 8, 'C'); put(44, 10, 'X');
  },
  courtSpawns: [
    [18, 16, 'makarov', Math.PI / 2, 'court', false, { argue: 'markt' }], [19.2, 16, 'machete', -Math.PI / 2, 'court', false, { argue: 'markt' }],
    [26, 16.5, 'revolver', Math.PI, 'court'], [21, 20.5, 'machete', Math.PI / 2, 'court'], [31, 21, 'makarov', -Math.PI / 2, 'court'], [22.5, 27.5, 'makarov', Math.PI, 'court'], [13, 24, 'machete', 0, 'court'],
    ...KEEPERS.map(([x0, x1, z], i) => [(x0 + x1) / 2 + 0.5, z - 0.5, i % 2 ? 'makarov' : 'machete', Math.PI, 'court', false, { reserve: true }]),
  ],
  hallSpawns: [
    [17, 5, 'makarov', Math.PI / 2, 'hall'], [22, 8.5, 'makarov', Math.PI, 'hall', false, { shield: true }], [28, 3.5, 'revolver', 0, 'hall'], [35.5, 7.5, 'makarov', Math.PI, 'hall', false, { shield: true }],
    [40, 4, 'machete', -Math.PI / 2, 'hall'], [30, 8.5, 'machete', Math.PI, 'hall'],
  ],
  bossLook: { shirt: 0xb4542c, front: '#b4542c', pants: 0x3a2a1a, belt: 0xe8a33d, wrap: 0xf3e6c8, belly: 1.5, skin: 0xc8946a, head: { hair: '#3a2a1a', brow: '#2a1a10', hairLine: 60, iris: '#2a1a10', beard: '#3a2a1a' } }, // Marktmeester Mustafa
  text: {
    area: "DE ZANDWIJK · ZA'ATARMARKT",
    banner: ["ZA'ATARMARKT", 'The Paravim souk. Every stall keeper is already angry with you.'],
    objective: "Take the <b>Za'atarmarkt</b> from the Paravim. <b>Shoot a stall and its keeper joins the fight.</b> The awnings block sight. Take the <b>market tax box</b> (E) from the weigh-house; <b>tray shields</b> stop bullets from the front, so flank them or knock them over. <span style=\"color:#ffd36b\">Marktmeester Mustafa waits in the diwan.</span>",
    objectiveOwned: "The Za'atarmarkt is <b>yours</b>. Drive home in the <b>Oofmobiel</b>.",
    objectiveCleared: "<b style=\"color:#6ed36e\">The Za'atarmarkt is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.",
    resultsTitle: "ZA'ATARMARKT TAKEN",
    resultsHint: 'The souk is yours, and so is the market tax. Grab the spice crates (E), then drive home.',
    ownedBanner: ["ZA'ATARMARKT IS YOURS", 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['MARKTMEESTER MUSTAFA IS DOWN', 'The market falls quiet. For once.'],
    taskHint: 'Take the tax box from the weigh-house (E).', tasksDone: 'DE MARKTBELASTING!',
    tips: ['Shoot a stall and the keeper behind it joins the fight. Aim past them.', 'Tray shields stop bullets from the front. Flank them, or knock them over with the Maboota or a door.', 'The awnings block sight: they can\'t see you through a stall, and you can\'t see them.'],
  },
  decorate({ THREE, root, OX, Z0, box, lam, makePerson, reinforce, run, banner }) {
    // the stall keepers: standing behind their stalls, arms crossed, glaring
    const keepers = KEEPERS.map(([x0, x1, z], i) => {
      const p = makePerson({ shirt: [0xe8dcc0, 0xb4542c, 0x2a2e6a][i % 3], front: ['#e8dcc0', '#b4542c', '#2a2e6a'][i % 3], pants: 0x5a3a24, wrap: [0xb8301a, 0xe8a33d, 0xf3e6c8][i % 3], belly: 0.6 + (i % 3) * 0.3, skin: [0xc8946a, 0xb07a52, 0x9a6a46][i % 3], head: { hair: '#1a1410', brow: '#1a1410', iris: '#2a1a10', beard: '#2a1a10' } });
      if (p.parent) p.parent.remove(p); p.position.set(OX + (x0 + x1) / 2 + 0.5, 0, Z0 + z - 0.5); p.rotation.y = Math.PI; root.add(p);
      return { p, x0, x1, z, turned: false };
    });
    // the market tax box on the weigh-house counter
    const tax = new THREE.Group(); tax.position.set(OX + 35.5, 1.06, Z0 + 5.5); root.add(tax);
    box(0.5, 0.32, 0.36, lam({ color: 0x2a2e6a }), 0, 0.16, 0, tax); box(0.52, 0.05, 0.38, lam({ color: 0xe8a33d }), 0, 0.33, 0, tax, false);
    // the big scales
    const sc = new THREE.Group(); sc.position.set(OX + 22, 1.06, Z0 + 6.5); root.add(sc);
    box(0.08, 1.2, 0.08, lam({ color: 0xc8a040 }), 0, 0.6, 0, sc, false); const beam = box(1.6, 0.05, 0.05, lam({ color: 0xc8a040 }), 0, 1.2, 0, sc, false);
    let st = 0;
    const tasks = [{ pos: new THREE.Vector3(OX + 35.5, 0, Z0 + 6.5), obj: tax, label: 'Take the market tax box', score: 1500, doneText: 'DE MARKTBELASTING!',
      act() { tax.visible = false; }, reset(done) { tax.visible = !done; } }];
    return {
      tasks,
      onShot(ch, x, z) {
        if (ch !== 'm') return false;
        const k = keepers.find((s) => !s.turned && z === s.z && x >= s.x0 && x <= s.x1); if (!k) return false;
        k.turned = true; k.p.visible = false;
        reinforce(1, k.p.position.x, k.p.position.z, ['MIJN KRAAM!', 'Dat was mijn beste sumak!', 'Nu ben ik ECHT boos!']);
        banner('MIJN KRAAM!', 'You shot his stall. Now he wants you too.', 1.4);
        return false; // the bullet still stops in the counter
      },
      reset() { for (const k of keepers) { k.turned = false; k.p.visible = true; } },
      tick(dt) { st += dt; beam.rotation.z = Math.sin(st * 1.3) * 0.12; },
    };
  },
});
