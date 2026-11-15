// De Zandwijk, mission 1: Couscouskade. The Paravim quay at night: boats come in from the south and nobody asks what is under the
// couscous. Built on the shared De Zandwijk compound (js/levels/zandwijk.js): the courtyard is a quay with a dock basin on its east side,
// sacks of couscous stacked everywhere, a warehouse in the back house and Havenmeester Hamid in the diwan.
// The twist: boats. Every 60 s a boat brings three more Paravim to the jetty until all three mooring lines are cut (E). Somewhere under
// the couscous in the store is the smuggled crate (E). Shot sacks burst: the couscous knocks over whoever stands next to them.

import { souk } from './zandwijk.js';
import { WATER_FURN, WATER_HAZARD } from './noshgey.js';

const LINES = [15, 20, 25]; // jetty rows with a bollard and a mooring line
const RES = ['makarov', 'machete', 'revolver', 'machete', 'makarov', 'makarov', 'revolver', 'machete', 'makarov'];

export default souk({
  id: 'couscouskade', name: 'Couscouskade', kiosk: 'THEEHUIS DE KADE', sign: 'COUSCOUSKADE',
  hazard: WATER_HAZARD,
  courtName: 'Kade',
  floors: {
    harbour: (g) => { g.fillStyle = '#081a2c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,170,255,${0.04 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 10, 1); } },
    quay: (g) => { for (let y = 0; y < 64; y += 8) { g.fillStyle = ['#5a4430', '#4e3a28', '#62492f'][(y / 8) % 3]; g.fillRect(0, y, 64, 8); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y, 64, 1); } },
  },
  court: 'quay', floorRep: { harbour: 4, quay: 2 },
  furn: { ...WATER_FURN },
  mood: { bg: 0x060a14, sky: 0x4a5a7a, ground: 0x3a3020, hemi: 0.42, sun: 0.3 },
  lights: [[5, 23, 0xffd8a0, 1.4], [5, 8, 0xe8a33d, 1.6], [18, 5, 0xffc878, 1.2], [30, 5, 0xffc878, 1.2], [40, 5, 0xffc878, 1.1], [17, 19, 0xffb060, 1.1], [24, 24, 0xffb060, 1.0], [30, 20, 0x6a8aa8, 0.7], [40, 20, 0xd8a83a, 1.2]],
  courtLayout({ put, putR }) {
    putR(28, 13, 32, 26, '~'); // the dock basin, with a quay all round it
    for (const z of LINES) put(27, z, 'o'); // bollards on the jetty edge
    putR(13, 17, 14, 18, 'y'); putR(18, 14, 19, 15, 'y'); putR(21, 18, 23, 18, 'y'); putR(15, 22, 16, 23, 'y'); putR(20, 24, 21, 25, 'y');
    put(24, 13, 'C'); put(24, 27, 'l');
  },
  hallLayout({ put, putR }) {
    putR(14, 1, 17, 1, 'R'); putR(22, 1, 26, 1, 'R'); putR(31, 1, 35, 1, 'R');
    putR(14, 6, 15, 7, 'C'); putR(22, 5, 23, 6, 'C'); putR(33, 6, 34, 7, 'C'); putR(38, 3, 39, 4, 'C'); putR(43, 4, 44, 5, 'y'); put(44, 10, 'X');
  },
  courtSpawns: [
    [15, 15, 'makarov', Math.PI / 2, 'court', false, { argue: 'kade' }], [16, 15.6, 'machete', -Math.PI / 2, 'court', false, { argue: 'kade' }],
    [20, 21, 'revolver', Math.PI, 'court'], [23.5, 15.5, 'machete', -Math.PI / 2, 'court'], [18, 26.5, 'makarov', Math.PI / 2, 'court'], [25.5, 22.5, 'makarov', -Math.PI / 2, 'court'],
    ...RES.map((w) => [26.5, 19.5, w, Math.PI / 2, 'court', false, { reserve: true }]), // the boats (three per boat)
  ],
  hallSpawns: [
    [16, 4.5, 'makarov', Math.PI / 2, 'hall'], [24.5, 7.5, 'machete', Math.PI, 'hall'], [32, 3.5, 'revolver', 0, 'hall'], [40, 7.5, 'makarov', -Math.PI / 2, 'hall'], [28.5, 8.5, 'machete', Math.PI, 'hall'],
    [36, 8.5, 'makarov', Math.PI / 2, 'hall', false, { argue: 'loods' }], [37.2, 8.5, 'makarov', -Math.PI / 2, 'hall', false, { argue: 'loods' }],
  ],
  bossLook: { shirt: 0xe8dcc0, front: '#e8dcc0', pants: 0x5a3a24, belt: 0x2a2e6a, wrap: 0x2a2e6a, belly: 1.3, skin: 0xb07a52, head: { hair: '#2a2a2a', brow: '#1a1a1a', hairLine: 60, iris: '#2a1a10', beard: '#2a2a2a' } }, // Havenmeester Hamid
  text: {
    area: 'DE ZANDWIJK · COUSCOUSKADE',
    banner: ['COUSCOUSKADE', 'The Paravim quay. They are already angry. They always are.'],
    objective: 'Take <b>Couscouskade</b> from the Paravim. <b>Three hits each</b>, and <b>one loud shot wakes the whole quay</b>. <b>Cut the three mooring lines</b> (E) before the boats bring more, and <b>find the smuggled crate</b> under the couscous in the store. <span style="color:#ffd36b">Havenmeester Hamid waits in the diwan.</span>',
    objectiveOwned: 'Couscouskade is <b>yours</b>. A foothold in De Zandwijk. Drive home in the <b>Oofmobiel</b>.',
    objectiveCleared: '<b style="color:#6ed36e">Couscouskade is yours.</b> Grab any spice crates (E), then drive home in the <b>Oofmobiel</b>.',
    resultsTitle: 'COUSCOUSKADE TAKEN',
    resultsHint: 'The Paravim quay is yours, and so is their crate. Grab the spice crates (E), then drive home.',
    ownedBanner: ['COUSCOUSKADE IS YOURS', 'Grab the spice crates, then drive home in the Oofmobiel.'],
    bossDown: ['HAVENMEESTER HAMID IS DOWN', 'He shouted until the very end.'],
    taskHint: 'Cut the mooring lines on the jetty and search the couscous in the store (E).', tasksDone: 'NO MORE BOATS',
    tips: ['Paravim take three hits and never calm down once they have seen you.', 'One loud shot and every Paravim on the quay comes running. The Maboota and a silencer stay quiet.', 'Two Paravim arguing see nothing. That is your way in.', 'Shoot a couscous sack and everyone next to it goes down.', 'A boat docks every minute until the lines are cut.'],
  },
  decorate({ THREE, root, OX, Z0, box, cyl, lam, spill, run, reinforce, reserves, banner, popup, floorW, canvasTex }) {
    // the basin water, drawn over the quay planks
    const wt = canvasTex(64, 64, (g) => { g.fillStyle = '#081a2c'; g.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(110,170,255,${0.04 + Math.random() * 0.12})`; g.fillRect(Math.random() * 64, Math.random() * 64, 5 + Math.random() * 10, 1); } });
    const wm = floorW(OX + 28, OX + 33, Z0 + 13, Z0 + 27, wt, 3, 0xffffff, 0.03); let wk = 0;
    for (let z = 13; z <= 27; z += 2) for (const x of [28, 33]) cyl(0.1, 0.1, 0.9, lam({ color: 0x3a2a1a }), OX + x, 0.3, Z0 + z, root, 6);
    // moored boats and their lines
    const boatMesh = (c) => { const g = new THREE.Group(); box(1.6, 0.6, 4.2, lam({ color: c }), 0, 0.15, 0, g, false); box(1.2, 0.5, 1.2, lam({ color: 0xf3e6c8 }), 0, 0.65, 0.6, g, false); box(0.08, 2.2, 0.08, lam({ color: 0x3a2a1a }), 0, 1.4, -0.6, g, false); root.add(g); return g; };
    const tasks = [];
    LINES.forEach((z, i) => {
      const b = boatMesh([0xb4542c, 0x2a6a7a, 0xe8dcc0][i]); b.position.set(OX + 30.3, -0.2, Z0 + z + 0.5); b.rotation.y = 0.08 * (i - 1);
      const a = new THREE.Vector3(OX + 27.5, 0.55, Z0 + z + 0.5), c = new THREE.Vector3(OX + 29.5, 0.45, Z0 + z + 0.5), len = a.distanceTo(c);
      const rope = cyl(0.03, 0.03, len, lam({ color: 0xd8c08a }), (a.x + c.x) / 2, (a.y + c.y) / 2, a.z, root, 6); rope.rotation.z = Math.PI / 2;
      let drift = 0;
      tasks.push({ pos: new THREE.Vector3(OX + 26.5, 0, Z0 + z + 0.5), obj: rope, label: 'Cut the mooring line', score: 600, doneText: 'LOS!',
        act() { rope.visible = false; drift = 1; }, reset(done) { rope.visible = !done; drift = done ? 2 : 0; b.position.x = OX + 30.3 + (done ? 1.2 : 0); }, b, tick(dt) { if (drift > 0 && drift < 2) { drift = Math.min(2, drift + dt * 0.3); b.position.x = OX + 30.3 + (drift - 1) * 1.2; } } });
    });
    // the smuggled crate under a couscous pile in the store
    const crate = new THREE.Group(); crate.position.set(OX + 39.5, 0, Z0 + 23.4); root.add(crate);
    box(0.6, 0.45, 0.6, lam({ color: 0x3a2a1a }), 0, 0.23, 0, crate); box(0.62, 0.06, 0.62, lam({ color: 0xe8a33d }), 0, 0.46, 0, crate, false);
    tasks.push({ pos: new THREE.Vector3(OX + 39.5, 0, Z0 + 23.5), obj: crate, label: 'Search the couscous', score: 1200, doneText: 'DE SMOKKELKIST!',
      act() { crate.visible = true; crate.position.y = 0; }, reset(done) { crate.visible = !!done; } });
    crate.visible = false;
    // the reinforcement boat: glides down the basin and drops three Paravim on the jetty
    const rb = boatMesh(0x5a3a24); rb.visible = false; let next = 45, rbT = -1, last = 0;
    const linesLeft = () => tasks.slice(0, 3).filter((t) => !t.done).length;
    // shot sacks burst once each
    const burst = new Set();
    return {
      tasks,
      onShot(ch, x, z) { if (ch !== 'y') return false; const k = x + ',' + z; if (burst.has(k)) return false; burst.add(k); spill(new THREE.Vector3(OX + x + 0.5, 0, Z0 + z + 0.5), 1.7, { text: 'COUSCOUS!', color: 0xe0cc98 }); return true; },
      reset() { burst.clear(); next = 45; rbT = -1; rb.visible = false; },
      tick(dt) {
        for (const t of tasks) if (t.tick) t.tick(dt);
        wk += dt; wm.material.map.offset.x = wk * 0.015;
        const R = run(); if (R.time < last) { next = 45; rbT = -1; rb.visible = false; } last = R.time;
        if (R.results || R.cleared) return;
        if (rbT < 0 && R.time >= next && linesLeft() && reserves()) { rbT = 0; rb.visible = true; banner('EEN BOOT!', `More Paravim on the water. ${linesLeft()} line${linesLeft() > 1 ? 's' : ''} still holding.`, 2); }
        if (rbT >= 0) { rbT += dt; const k = Math.min(1, rbT / 4); rb.position.set(OX + 30.5, -0.2, Z0 + 14 + k * 5.5);
          if (k >= 1) { reinforce(3, OX + 26.6, Z0 + 19.5, ['Daar is hij!', 'Wie heeft onze kade?!', 'Drie zendingen, en nu dit!']); popup(rb.position, 'AANGEMEERD', '#ff7a1a'); rbT = -1; next = R.time + 60; setTimeout(() => { rb.visible = false; }, 2500); } }
      },
    };
  },
});
