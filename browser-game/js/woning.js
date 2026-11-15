// Eddy's woning: homes, furniture, morning visitors, knacks (perks) and outfits.
// The systems come from Neon Vice (safehouses + furniture catalogue, morning events, RPG perks, suits); the look is Spice Master's:
// saffron, turmeric, paprika, cumin brown, cardamom green and cream, copper and kilims instead of neon and marble.
// Three homes: Het Hok (the back room of the warehouse, free), the Bovenwoning next to Eddy's parking, and the Grachtenpand past the pawnshop.
// Each home is a little room built far from the street (z = ROOM_Z); a door on the street (or in the warehouse) takes Eddy there.
// Furniture is bought per home on the Kaasdows (Woning tab) and most of it gives a small knack while you live there.
// Everything lives in state.eddy (saved by main.js); the hidden kruidenblikken from the raids are in state.tins (js/mission.js).

export const HOMES = [
  { id: 'hok', name: 'Het Hok', price: 0, w: 6, d: 5, desc: "The back room of the warehouse. A camp bed between the paprika sacks. Dad slept here in '87." },
  { id: 'boven', name: 'Bovenwoning', price: 8000, w: 9, d: 7, rank: 1, desc: 'Two rooms in the house next to your parking spot. Creaky stairs, a real bed, a window on the canal.' },
  { id: 'gracht', name: 'Grachtenpand', price: 35000, w: 12, d: 9, rank: 2, needs: 'district1', desc: 'The tall house past the pawnshop. A hoisting beam, high ceilings, the whole canal at your feet. Dad always wanted one.' },
];
// furniture: per home tier [name, price, desc] (null: not sold in that home). perk: the knack it gives while it stands in your home.
// comfort makes the morning visitors friendlier. global: bought once, it follows Eddy from home to home.
export const FURN = [
  { k: 'rug', comfort: 1, t: [['Jute sack rug', 60, 'Three paprika sacks stitched together. Mostly flat.'], ['Kilim', 800, 'Paprika red and cumin brown, from a cousin of Oma Zahra.'], ['Persian carpet', 3500, 'Hand-knotted. Never spill garlic sauce on it.']] },
  { k: 'radio', perk: 'adren', t: [['Transistor radio', 150, 'Radio Kaasland and one station in Turkish. Changes the music.'], ['Cassette deck', 900, "Auto-reverse, and a mixtape from Nabil. Changes the music."], ['Record player', 4000, 'Walnut cabinet, two big speakers. The bass rattles the jars.']] },
  { k: 'coffee', perk: 'fleet', t: [['Gas burner & cezve', 120, 'Turkish coffee on a camping stove. Rocket fuel.'], ['Copper samovar', 1500, 'Tea all day. Eddy runs on it.'], ['Espresso machine', 4500, 'Italian, chrome, louder than the Oofmobiel.']] },
  { k: 'bag', perk: 'grip', t: [['Rice-sack punching bag', 300, 'Twenty kilos of basmati on a rope.'], ['Punching bag', 1200, 'Real leather. Smells of the boxing club round the corner in Spekbuurt.'], ['Boxing corner', 5000, 'Bag, mat and gloves on a hook. Eddy Sr. would laugh.']] },
  { k: 'target', perk: 'steady', t: [['Target on the wall', 250, 'Drawn with a marker. The wall has seen things.'], ['Gun rack', 2000, 'Polished wood. Your guns look like tools.'], ['Gun cabinet', 6000, 'Glass doors, little lights, a lock that actually works.']] },
  { k: 'medic', perk: 'medic', t: [['First aid box', 200, 'Plasters, iodine and a mint.'], ['Medicine cabinet', 1200, 'With a mirror. Eddy looks tired.'], ['Massage chair', 5000, 'Eight programmes. Eddy only uses "kneading".']] },
  { k: 'rack', perk: 'shark', t: [['Plank of jars', 300, "Dad's old jars on a plank. The kruidenblikken you find go here."], ['Spice wall', 2500, 'Forty jars, labelled by hand. Clients get hungry looking at it.'], ['Brass spice cabinet', 9000, 'Brass and glass. Every tin you find gets its own shelf.']] },
  { k: 'weights', perk: 'tough', t: [null, ['Weight bench', 3000, 'Eddy lifts. Sometimes.'], ['Home gym', 8000, 'Bench, rack, a mirror. Tougher by the week.']] },
  { k: 'sofa', comfort: 2, t: [null, ['Cumin-brown sofa', 1400, 'Corduroy, 1979, deep enough to lose a remote in.'], ['Saffron chesterfield', 6500, 'Saffron velvet and brass studs.']] },
  { k: 'fish', comfort: 2, t: [null, ['Goldfish tank', 1800, 'Three goldfish: Kurkuma, Kaneel and Kees.'], ['Koi pond', 12000, 'Indoors. On the first floor. The neighbours have questions.']] },
  { k: 'portrait', comfort: 3, t: [null, null, ['Portrait of Eddy Sr.', 6000, 'In oils, in a gold frame. He would hate it. He would love it.']] },
  // Eddy's own things: Dad's trade, the spice, Kaasland. use: what pressing E next to it does (once per market day where it says so)
  { k: 'doner', comfort: 1, use: 'eat', t: [["Dad's old döner spit", 450, 'Rusty, on a crate, still turns. Eat a shoarma once a day: +1 hit on your next raid.'], ['Countertop döner grill', 2200, 'Stainless steel, two burners. Eat a shoarma once a day: +1 hit on your next raid.'], ['Golden döner tower', 9000, 'Gold-plated, a spit as tall as Eddy. Eat a shoarma once a day: +1 hit on your next raid.']] },
  { k: 'vijzel', comfort: 1, use: 'grind', t: [['Stone vijzel', 350, 'Mortar and pestle. Grind a jar once a day and the street smells it: +25 rep.'], ['Brass vijzel', 1600, 'Heavy, shiny, from the Kaasplaats. Grind once a day: +50 rep.'], ["Dad's grinder, restored", 7000, 'The big cast-iron one from 1987, red and brass. Grind once a day: +75 rep.']] },
  { k: 'kaasdows', comfort: 1, use: 'pc', t: [null, ['Kaasdows 95 desk', 2500, 'A beige PC at home: the whole Kaasdows without walking to the warehouse.'], ['Kaasdows 98 corner office', 6000, 'Tower, CD-ROM, leather chair. The whole Kaasdows from home.']] },
  { k: 'tv', comfort: 1, use: 'tv', t: [['Portable TV', 300, 'Black and white, on a milk crate. Kaasland TV, mostly snow.'], ['Wood-veneer TV', 1500, 'Colour! Kaasland TV and the cooking channel.', 2], ['Big-screen TV & VCR', 5000, 'A screen the size of a door.', 3]] },
  { k: 'plants', comfort: 1, use: 'water', t: [['Chillies on the windowsill', 120, 'Three pots of rawit. They like the warehouse heat.'], ['Cardamom plants', 900, 'In terracotta pots. The room smells like Speciaal.', 2], ['Saffron crocus bed', 4000, 'Purple flowers, red threads. A fortune in a planter box.', 3]] },
  { k: 'trophies', comfort: 1, t: [['Trophy plank', 300, 'One thing taken from every gang boss you beat.'], ['Trophy shelf', 1200, 'One thing taken from every gang boss you beat.'], ['Trophy cabinet', 4000, 'Glass and brass, one thing from every gang boss you beat.']] },
  { k: 'kaart', comfort: 1, use: 'map', t: [['Paper map of Kaasland', 300, 'Taped to the wall, a pin in every joint you hold. Opens the map.'], ['Cork board map', 1000, 'Pins, string, photos of the bosses. Opens the map.'], ['Framed atlas of Kaasland', 3500, 'Gold frame, hand-painted, your territories in red pins. Opens the map.']] },
  { k: 'kat', perk: 'sense', comfort: 1, global: true, t: [['Saffie the cat', 250, 'A ginger stray from the Kaasplaats. Follows you home, teaches you to move quietly.']] },
];
// knacks (Neon Vice PERKS): one pick of three every time Eddy's name grows (reputation milestones)
export const PERKS = {
  tough: { name: 'Taaie huid', max: 2, desc: '+1 hit you can take' },
  steady: { name: 'Vaste hand', max: 3, desc: 'Your shots spread 15% less' },
  fleet: { name: 'Snelle voeten', max: 3, desc: 'Move 6% faster' },
  sense: { name: 'Zesde zintuig', max: 3, desc: 'Guards react 15% slower to you' },
  grip: { name: 'Lange armen', max: 3, desc: 'Melee hits reach further' },
  shark: { name: 'Woekeraar', max: 3, desc: '+10% Wilders from every raid' },
  adren: { name: 'Adrenaline', max: 3, desc: 'Combos last 0.75 s longer' },
  medic: { name: 'Pleister & thee', max: 2, desc: 'Heal 1.5 s sooner out of fire' },
};
export const repFor = (n) => 100 * n * (n + 3) / 2; // rep for knack n: 200, 500, 900, 1400, 2000, ...
// outfits (Neon Vice SUITS): unlock by rank or story, each with a small knack bonus. Colours from the spice palette.
export const OUTFITS = {
  eigen: { name: 'Own look', desc: 'The blue shirt. Eddy being Eddy.', perk: {}, paint: null },
  schort: { name: 'Mengmeester apron', rank: 1, desc: 'Cream shirt, cumin trousers, the apron. Heal 1.5 s sooner.', perk: { medic: 1 },
    paint: { shirt: [0xf2, 0xea, 0xd8], pants: [0x6a, 0x4a, 0x2a], apron: true, sleeves: 'rolled', chain: false } },
  kurkuma: { name: 'Turmeric shirt', rank: 2, desc: 'Turmeric yellow, cumin brown. Faster, and guards react slower.', perk: { fleet: 1, sense: 1 },
    paint: { shirt: [0xd9, 0xa2, 0x1b], pants: [0x6a, 0x4a, 0x2a], chain: false } },
  paprika: { name: 'Paprika silk shirt', rank: 3, desc: 'Paprika red silk and a gold chain. Longer combos, +10% raid pay.', perk: { adren: 1, shark: 1 },
    paint: { shirt: [0xb8, 0x3a, 0x1e], pants: [0x2a, 0x1a, 0x10], chain: true } },
  kardemom: { name: 'Cardamom linen', act: 'act1', desc: 'Cardamom green linen, sleeves up. Faster, longer combos.', perk: { fleet: 1, adren: 1 },
    paint: { shirt: [0xa9, 0xc4, 0x6a], pants: [0xf2, 0xea, 0xd8], sleeves: 'rolled', chain: false } },
  saffraan: { name: 'Saffron & cream', rank: 4, desc: 'Saffron shirt, cream trousers, gold. +1 hit, +10% raid pay.', perk: { tough: 1, shark: 1 },
    paint: { shirt: [0xe8, 0xa3, 0x3d], pants: [0xf2, 0xea, 0xd8], belt: [0x6a, 0x30, 0x10], chain: true } },
};
export const STATIONS = [
  { name: 'Radio Kaasland', bpm: 116, key: 0 }, { name: 'Saz FM (slow and sweet)', bpm: 96, key: -3 },
  { name: 'Snackbar Disco', bpm: 128, key: 2 }, { name: 'Zaanse Nachtradio', bpm: 104, key: -5 },
];
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const RANK_NAMES = ['Hulpje', 'Mengmeester', 'Kruidenhandelaar', 'Kruidenbaron', 'Spice Master'];
const P = { saff: 0xe8a33d, turm: 0xd9a21b, papr: 0xb83a1e, cumin: 0x6a4a2a, card: 0xa9c46a, cream: 0xf2ead8, copper: 0xb8703a, brass: 0xd8b040, wood: 0x7a4a26, dark: 0x3a2412 };
const ROOM_Z = -72, ROOM_X = [-40, 0, 40];

// deps: THREE, scene, box, cyl, lam, canvasTex, signTex, solid, solids, addInteract, player, state, econ, rankOf, addMoney, toast,
// dialogue, choice, beep, save, repaint(player, look), music, setBounds(b), busy(), openPC(tab), doors: [{x,z,face,stand}] per home
export function createWoning(deps) {
  const { THREE, box, cyl, lam, canvasTex, signTex, solid, addInteract, player, state, econ } = deps;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  function ensure() {
    const e = state.eddy && typeof state.eddy === 'object' ? state.eddy : (state.eddy = {});
    if (!Number.isInteger(e.home)) e.home = 0;
    if (!Array.isArray(e.homes)) e.homes = [0];
    if (!e.furn || typeof e.furn !== 'object') e.furn = {};
    for (let i = 0; i < HOMES.length; i++) if (!e.furn[i] || typeof e.furn[i] !== 'object') e.furn[i] = {};
    if (!e.glob || typeof e.glob !== 'object') e.glob = {};
    if (!e.perks || typeof e.perks !== 'object') e.perks = {};
    if (!OUTFITS[e.outfit]) e.outfit = 'eigen';
    if (!Number.isInteger(e.station)) e.station = 0;
    if (!Number.isFinite(e.mornDay)) e.mornDay = -1;
    if (!state.tins || typeof state.tins !== 'object') state.tins = {};
    return e;
  }
  const rank = () => deps.rankOf(econ.ensure().rep).i;
  const owned = (k, tier = ensure().home) => { const it = FURN.find((f) => f.k === k); return it && it.global ? !!ensure().glob[k] : !!ensure().furn[tier][k]; };
  const itemFor = (it, tier) => (it.global ? it.t[0] : it.t[tier]);
  const outfitOK = (k) => { const o = OUTFITS[k]; return !!o && (o.act ? !!state[o.act] : rank() >= (o.rank || 0)); };
  // ---- knacks, outfit and furniture add up: mission.js asks perk('tough') etc.
  function perk(k) {
    const e = ensure(); let n = e.perks[k] || 0;
    const o = OUTFITS[e.outfit]; if (o && outfitOK(e.outfit)) n += o.perk[k] || 0;
    for (const it of FURN) if (it.perk === k && owned(it.k)) n += 1;
    if (k === 'tough' && e.fedDay === today()) n += 1; // a shoarma from the home döner: lasts until the next outing ends the market day
    return n;
  }
  const trophies = () => ['act1', 'act2', 'act3', 'finale'].filter((k) => !!state[k]);
  const comfortOf = (it, tier) => { const row = itemFor(it, tier); return it.k === 'trophies' ? trophies().length : (row && row[3]) || it.comfort || 0; };
  const comfort = () => FURN.reduce((a, it) => a + (owned(it.k) ? comfortOf(it, ensure().home) : 0), 0);
  const today = () => econ.ensure().day;
  const knackLevel = () => { const rep = econ.ensure().rep || 0; let n = 0; while (rep >= repFor(n + 1)) n++; return n; };
  const knacksTaken = () => Object.values(ensure().perks).reduce((a, b) => a + b, 0);
  const pending = () => Math.max(0, knackLevel() - knacksTaken());

  // ================================================================== 3D: the three rooms
  const fadeEl = document.createElement('div');
  fadeEl.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40';
  document.body.appendChild(fadeEl);
  const fadeTo = (fn) => { fadeEl.style.opacity = '1'; setTimeout(() => { fn(); setTimeout(() => { fadeEl.style.opacity = '0'; }, 60); }, 380); };
  const M = {}; const mt = (c) => M[c] || (M[c] = lam({ color: c }));
  const plankTex = (base, line, herring) => { const t = canvasTex(256, 256, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = line; g.lineWidth = 3;
    if (herring) { for (let y = -w; y < h + w; y += 32) for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + 32, y + 32); g.lineTo(x + 64, y); g.stroke(); } }
    else { for (let y = 0; y < h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); const o = (y / 32) % 2 ? 90 : 190; g.beginPath(); g.moveTo(o, y); g.lineTo(o, y + 32); g.stroke(); } }
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 20, 1); }
  }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const concTex = (() => { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9a948a'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { const v = 120 + Math.random() * 60 | 0; g.fillStyle = `rgba(${v},${v - 6},${v - 14},.25)`; g.fillRect(Math.random() * w, Math.random() * h, 2, 2); } g.strokeStyle = 'rgba(60,50,40,.3)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; })();
  const wallpaper = (bg, fg) => { const t = canvasTex(128, 128, (g, w, h) => { g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; for (let y = 8; y < h; y += 32) for (let x = (y / 32) % 2 ? 24 : 8; x < w; x += 32) { g.beginPath(); g.ellipse(x, y, 5, 9, 0, 0, 7); g.fill(); g.fillRect(x - 1, y + 9, 2, 6); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const LOOK = [
    { floor: () => { const t = concTex.clone(); t.needsUpdate = true; t.repeat.set(2, 2); return t; }, wall: 0xd8cfb8, wallTex: null, trim: P.cumin, light: 0xffd9a0 },
    { floor: () => { const t = plankTex('#8a5a32', 'rgba(50,28,12,.55)'); t.repeat.set(3, 3); return t; }, wall: 0xffffff, wallTex: () => wallpaper('#e0b45a', 'rgba(184,58,30,.35)'), trim: P.cream, light: 0xffd090 },
    { floor: () => { const t = plankTex('#6a3e1e', 'rgba(30,16,6,.6)', true); t.repeat.set(4, 3); return t; }, wall: 0xffffff, wallTex: () => wallpaper('#8a2a18', 'rgba(232,163,61,.4)'), trim: P.cream, light: 0xffc880 },
  ];
  const rooms = HOMES.map((h, i) => {
    const g = new THREE.Group(); g.position.set(ROOM_X[i], 0, ROOM_Z); g.visible = false; deps.scene.add(g);
    const L = LOOK[i], W = h.w, D = h.d, WH = i === 2 ? 3.2 : 2.7;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 30, D + 30), mt(0x1a120a)); ground.rotation.x = -Math.PI / 2; ground.position.y = 0.004; g.add(ground);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(W, D), lam({ map: L.floor() })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.01; fl.receiveShadow = true; g.add(fl);
    const wm = L.wallTex ? lam({ map: (() => { const t = L.wallTex(); t.repeat.set(W / 1.2, WH / 1.2); return t; })() }) : mt(L.wall);
    const wmS = L.wallTex ? lam({ map: (() => { const t = L.wallTex(); t.repeat.set(D / 1.2, WH / 1.2); return t; })() }) : mt(L.wall);
    box(W + 0.3, WH, 0.15, wm, 0, WH / 2, -D / 2 - 0.07, g); // back wall
    box(0.15, WH, D, wmS, -W / 2 - 0.07, WH / 2, 0, g); box(0.15, WH, D, wmS, W / 2 + 0.07, WH / 2, 0, g);
    box(W + 0.3, 0.12, 0.2, mt(L.trim), 0, 0.06, -D / 2 + 0.02, g, false); // skirting
    // the cutaway front: a low wall with the door gap on the left
    const gap0 = -W / 2 + 0.6, gap1 = gap0 + 1.1;
    box(gap0 + W / 2, 0.45, 0.15, wm, (-W / 2 + gap0) / 2, 0.22, D / 2 + 0.07, g); box(W / 2 - gap1, 0.45, 0.15, wm, (gap1 + W / 2) / 2, 0.22, D / 2 + 0.07, g);
    box(1.1, 0.03, 0.5, mt(P.papr), (gap0 + gap1) / 2, 0.02, D / 2 - 0.15, g, false); // doormat
    // windows on the back wall: canal light (cream frames, a deep evening blue)
    const nW = i === 0 ? 1 : i === 1 ? 2 : 3;
    for (let k = 0; k < nW; k++) {
      const wx = (k - (nW - 1) / 2) * (W / nW) + (i === 0 ? 0.8 : 0);
      box(1.2, 1.4, 0.06, mt(P.cream), wx, 1.65, -D / 2 + 0.02, g, false);
      box(1.0, 1.2, 0.07, lam({ color: 0x2a4a5a, emissive: 0x16303a }), wx, 1.65, -D / 2 + 0.04, g, false);
      box(0.06, 1.2, 0.09, mt(P.cream), wx, 1.65, -D / 2 + 0.06, g, false);
    }
    if (i === 0) for (let k = 0; k < 5; k++) { const sx = W / 2 - 0.45 - k * 0.45; cyl(0.2, 0.23, 0.6, mt([P.papr, P.turm, P.cumin][k % 3]), sx, 0.3, D / 2 - 0.45, g, 8); } // sacks along the front
    const light = new THREE.PointLight(L.light, 0, W * 1.4, 1.4); light.position.set(0, WH - 0.3, 0); g.add(light);
    const lamp = cyl(0.1, 0.16, 0.12, lam({ color: P.copper, emissive: 0x4a2a10 }), 0, WH - 0.12, 0, g, 10); lamp.castShadow = false;
    // walls block walking (local -> world)
    const ox = ROOM_X[i], oz = ROOM_Z, sol = [];
    sol.push(solid(ox - W / 2 - 0.3, ox + W / 2 + 0.3, oz - D / 2 - 0.3, oz - D / 2 + 0.05));
    sol.push(solid(ox - W / 2 - 0.3, ox - W / 2 + 0.05, oz - D / 2, oz + D / 2));
    sol.push(solid(ox + W / 2 - 0.05, ox + W / 2 + 0.3, oz - D / 2, oz + D / 2));
    sol.push(solid(ox - W / 2, ox + gap0, oz + D / 2 - 0.05, oz + D / 2 + 0.3));
    sol.push(solid(ox + gap1, ox + W / 2, oz + D / 2 - 0.05, oz + D / 2 + 0.3));
    const fg = new THREE.Group(); g.add(fg);
    return { g, fg, light, W, D, WH, ox, oz, door: { x: ox + (gap0 + gap1) / 2, z: oz + D / 2 - 0.55 }, sol, furnSol: [], spots: [] };
  });

  // ---- furniture models (box-built, spice palette). Each returns its footprint [w, d] for collision (0 = walk-through).
  const S = { // slots per home: [x, z, rotY]
    bed: [[-1.9, -1.6, 0], [-3.1, -2.3, 0], [-4.3, -3.0, 0]], ward: [[2.45, -1.95, 0], [-1.3, -3.1, 0], [-2.1, -4.1, 0]], cat: [[-2.4, 1.6, 0], [-3.8, 2.6, 0], [-5.2, 3.6, 0]],
    radio: [[-0.5, -2.15, 0], [0.5, -3.15, 0], [0.3, -4.1, 0]], coffee: [[0.5, -2.15, 0], [1.8, -3.15, 0], [2.1, -4.1, 0]], rack: [[1.5, -2.38, 0], [3.4, -3.38, 0], [4.3, -4.36, 0]],
    bag: [[2.3, 0.7, 0], [3.7, 1.8, 0], [4.9, 2.6, 0]], target: [[2.92, -0.6, -Math.PI / 2], [4.42, -1.0, -Math.PI / 2], [5.9, -1.4, -Math.PI / 2]],
    medic: [[-2.92, 1.0, Math.PI / 2], [-4.42, 0.2, Math.PI / 2], [-5.0, 0.7, 0]], rug: [[0, 0.1, 0], [0, 0.2, 0], [0.3, 0.2, 0]],
    weights: [null, [2.3, 0.3, 0], [3.0, 1.0, 0]], sofa: [null, [-0.4, 1.9, Math.PI], [-0.5, 2.4, Math.PI]], fish: [null, [-3.8, 0.4, Math.PI / 2], [-2.6, -0.3, 0]], portrait: [null, null, [-1.0, -4.43, 0]],
    doner: [[-2.5, 0.0, Math.PI / 2], [4.0, -3.0, 0], [5.3, -3.8, 0]], vijzel: [[1.25, -1.3, 0], [-2.3, -0.9, 0], [-4.8, -1.2, 0]], kaasdows: [null, [2.6, -1.7, 0], [3.6, -2.2, 0]],
    tv: [[0.3, 1.55, Math.PI], [-0.4, -1.2, 0], [0.3, -1.9, 0]], plants: [[0.8, -2.42, 0], [-2.25, -3.42, 0], [-3.0, 3.95, 0]],
    trophies: [[-2.92, -0.5, Math.PI / 2], [-4.42, 1.6, Math.PI / 2], [-5.92, -1.3, Math.PI / 2]], kaart: [[2.92, 1.4, -Math.PI / 2], [4.42, 0.9, -Math.PI / 2], [5.92, 1.0, -Math.PI / 2]],
  };
  const B = (g, w, h, d, c, x, y, z, sh = true) => box(w, h, d, typeof c === 'number' ? mt(c) : c, x, y, z, g, sh);
  const C = (g, rt, rb, h, c, x, y, z, seg = 10) => cyl(rt, rb, h, typeof c === 'number' ? mt(c) : c, x, y, z, g, seg);
  const jars = (g, n, x0, y, z, dx, tall = 0.16) => { for (let j = 0; j < n; j++) { const c = [P.papr, P.turm, P.cumin, P.card, P.saff, 0x8a3a5a][j % 6]; C(g, 0.045, 0.045, tall, c, x0 + j * dx, y + tall / 2, z, 8); C(g, 0.048, 0.048, 0.03, P.brass, x0 + j * dx, y + tall + 0.015, z, 8); } };
  const tinsOnShelf = (g, x0, y, z, max, dx) => { const n = Math.min(max, Object.keys(state.tins || {}).length); for (let j = 0; j < n; j++) { C(g, 0.06, 0.06, 0.12, 0xc8641e, x0 + j * dx, y + 0.06, z, 10); C(g, 0.062, 0.062, 0.025, P.brass, x0 + j * dx, y + 0.13, z, 10); } };
  const DRAW = {
    bed(g, t) {
      if (t === 0) { B(g, 1.95, 0.08, 0.8, 0x5a6a3a, 0, 0.42, 0); for (const sx of [-0.85, 0.85]) for (const sz of [-0.32, 0.32]) B(g, 0.05, 0.4, 0.05, 0x3a3a34, sx, 0.2, sz); B(g, 0.4, 0.1, 0.55, P.cream, -0.7, 0.51, 0); B(g, 1.0, 0.05, 0.78, 0x6a5a3a, 0.35, 0.48, 0); return [2, 0.85]; }
      const W2 = t === 1 ? 1.5 : 1.9, L2 = 2.1;
      B(g, L2, 0.32, W2, P.wood, 0, 0.2, 0); B(g, L2 - 0.1, 0.18, W2 - 0.1, P.cream, 0, 0.45, 0); B(g, 0.12, 1.0, W2 + 0.05, t === 2 ? P.dark : P.wood, -L2 / 2, 0.5, 0);
      for (const sz of [-W2 / 4, W2 / 4]) B(g, 0.35, 0.12, W2 / 2 - 0.12, 0xfff8ea, -L2 / 2 + 0.3, 0.6, sz);
      B(g, L2 * 0.6, 0.06, W2 - 0.06, t === 1 ? P.papr : P.saff, L2 * 0.18, 0.56, 0);
      if (t === 2) { for (const sx of [-L2 / 2, L2 / 2]) for (const sz of [-W2 / 2, W2 / 2]) B(g, 0.08, 2.2, 0.08, P.dark, sx, 1.1, sz); for (const sz of [-W2 / 2, W2 / 2]) { B(g, L2 + 0.1, 0.06, 0.08, P.dark, 0, 2.2, sz); B(g, L2, 0.45, 0.03, P.saff, 0, 1.95, sz, false); } for (const sx of [-L2 / 2, L2 / 2]) B(g, 0.08, 0.06, W2 + 0.1, P.dark, sx, 2.2, 0); for (const sz of [-W2 / 2 - 0.02, W2 / 2 + 0.02]) for (const sx of [-L2 / 2 + 0.15, L2 / 2 - 0.15]) B(g, 0.22, 1.7, 0.05, P.saff, sx, 1.15, sz, false); }
      return [L2, W2];
    },
    ward(g, t) {
      if (t === 0) { B(g, 1.0, 0.04, 0.04, 0x8a8a84, 0, 1.6, 0); for (const sx of [-0.5, 0.5]) B(g, 0.04, 1.6, 0.04, 0x8a8a84, sx, 0.8, 0); for (let k = 0; k < 4; k++) B(g, 0.06, 0.6, 0.35, [0x86acdf, P.turm, P.cream, P.papr][k], -0.33 + k * 0.22, 1.25, 0); return [1.05, 0.4]; }
      B(g, 1.2, 2.0, 0.55, t === 2 ? P.dark : P.wood, 0, 1.0, 0); B(g, 0.02, 1.8, 0.02, P.brass, 0, 1.0, 0.29); for (const sx of [-0.08, 0.08]) B(g, 0.03, 0.18, 0.03, P.brass, sx, 1.05, 0.29);
      if (t === 2) B(g, 1.24, 0.1, 0.58, P.saff, 0, 2.02, 0); return [1.2, 0.55];
    },
    cat(g) { // the catalogue: a crate with the phone and a pile of folders (order furniture here)
      B(g, 0.6, 0.55, 0.5, P.wood, 0, 0.27, 0); B(g, 0.22, 0.08, 0.16, 0x2a2a2a, -0.1, 0.59, 0); B(g, 0.2, 0.04, 0.05, 0x2a2a2a, -0.1, 0.65, 0); B(g, 0.22, 0.05, 0.3, P.saff, 0.15, 0.58, 0.02); B(g, 0.22, 0.04, 0.3, P.papr, 0.16, 0.62, -0.02);
      return [0.6, 0.5];
    },
    radio(g, t) {
      if (t === 0) { B(g, 0.5, 0.45, 0.4, P.wood, 0, 0.22, 0); B(g, 0.34, 0.2, 0.12, P.cumin, 0, 0.55, 0); C(g, 0.06, 0.06, 0.02, P.cream, 0.08, 0.56, 0.065).rotation.x = Math.PI / 2; B(g, 0.01, 0.3, 0.01, 0xaaaaaa, -0.12, 0.8, 0); return [0.5, 0.4]; }
      if (t === 1) { B(g, 0.9, 0.55, 0.42, P.cumin, 0, 0.27, 0); B(g, 0.6, 0.16, 0.32, 0x2a2a2a, 0, 0.63, 0); for (const sx of [-0.15, 0.15]) B(g, 0.2, 0.08, 0.02, 0x6a6a6a, sx, 0.64, 0.17); return [0.9, 0.42]; }
      B(g, 1.1, 0.7, 0.48, P.wood, 0, 0.35, 0); C(g, 0.18, 0.18, 0.02, 0x1a1a1a, 0, 0.72, 0, 20); C(g, 0.05, 0.05, 0.03, P.papr, 0, 0.74, 0, 10);
      for (const sx of [-0.9, 0.9]) { B(g, 0.4, 1.1, 0.38, P.dark, sx, 0.55, 0); C(g, 0.12, 0.12, 0.02, 0x2a1a10, sx, 0.75, 0.2, 14).rotation.x = Math.PI / 2; C(g, 0.08, 0.08, 0.02, 0x2a1a10, sx, 0.35, 0.2, 14).rotation.x = Math.PI / 2; }
      return [2.2, 0.48];
    },
    coffee(g, t) {
      B(g, 0.6, t === 2 ? 0.9 : 0.55, 0.45, t === 2 ? P.cream : P.wood, 0, t === 2 ? 0.45 : 0.27, 0);
      const y = t === 2 ? 0.9 : 0.55;
      if (t === 0) { C(g, 0.12, 0.12, 0.08, 0x3a3a3a, 0, y + 0.04, 0, 12); C(g, 0.05, 0.07, 0.12, P.copper, 0, y + 0.14, 0, 10); B(g, 0.14, 0.015, 0.02, P.copper, 0.1, y + 0.18, 0); }
      else if (t === 1) { C(g, 0.13, 0.16, 0.36, P.copper, 0, y + 0.18, 0, 12); C(g, 0.06, 0.08, 0.1, P.copper, 0, y + 0.41, 0, 10); C(g, 0.05, 0.05, 0.06, P.cream, 0.12, y + 0.04, 0.1, 8); }
      else { B(g, 0.42, 0.36, 0.3, 0xc8ccd0, 0, y + 0.18, 0); B(g, 0.44, 0.04, 0.32, P.papr, 0, y + 0.38, 0); C(g, 0.04, 0.04, 0.05, P.cream, 0, y + 0.02, 0.12, 8); }
      return [0.6, 0.45];
    },
    rack(g, t) {
      const w = [1.1, 1.8, 1.6][t], rows = [1, 3, 4][t];
      if (t === 2) { B(g, w, 2.0, 0.35, P.brass, 0, 1.0, 0); B(g, w - 0.12, 1.88, 0.3, 0x2a1a0e, 0, 1.0, 0.03); }
      for (let r = 0; r < rows; r++) {
        const y = t === 2 ? 0.35 + r * 0.45 : 1.15 + r * 0.38;
        B(g, w, 0.04, 0.24, t === 2 ? P.brass : P.wood, 0, y, 0.02, false);
        if (r === 0) tinsOnShelf(g, -w / 2 + 0.12, y + 0.02, 0.04, Math.floor(w / 0.15), 0.15); else jars(g, Math.floor(w / 0.13), -w / 2 + 0.08, y + 0.02, 0.04, 0.13);
      }
      return t === 2 ? [w, 0.35] : 0;
    },
    bag(g, t) {
      if (t === 0) { B(g, 0.08, 2.0, 0.08, P.wood, 0, 1.0, -0.45); B(g, 0.08, 0.08, 0.55, P.wood, 0, 2.0, -0.2); C(g, 0.2, 0.22, 0.7, 0xd8cfa8, 0, 1.15, 0.05, 10); B(g, 0.02, 0.5, 0.02, 0x8a7a5a, 0, 1.75, 0.05); return [0.6, 0.6]; }
      C(g, 0.2, 0.2, 0.9, t === 1 ? P.papr : 0x5a2a12, 0, 1.25, 0, 12); B(g, 0.02, 0.6, 0.02, 0x6a6a6a, 0, 1.95, 0);
      if (t === 2) { B(g, 1.6, 0.04, 1.6, 0x2a4a3a, 0, 0.02, 0, false); B(g, 0.12, 0.14, 0.1, P.papr, 0.55, 1.4, -0.7); } return [0.5, 0.5];
    },
    target(g, t) {
      if (t === 0) { const tx = canvasTex(64, 64, (c) => { for (let r = 30, k = 0; r > 0; r -= 6, k++) { c.fillStyle = k % 2 ? '#f2ead8' : '#b83a1e'; c.beginPath(); c.arc(32, 32, r, 0, 7); c.fill(); } }); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), lam({ map: tx })); m.position.set(0, 1.5, 0.01); g.add(m); return 0; }
      B(g, 1.4, 1.0, 0.08, t === 2 ? P.dark : P.wood, 0, 1.4, 0);
      for (let k = 0; k < 3; k++) { B(g, 1.1, 0.06, 0.08, 0x1a1a1c, 0, 1.15 + k * 0.25, 0.08); B(g, 0.2, 0.1, 0.08, P.wood, 0.42, 1.12 + k * 0.25, 0.08); }
      if (t === 2) { B(g, 1.44, 1.04, 0.02, lam({ color: 0xbfe0e8, transparent: true, opacity: 0.25 }), 0, 1.4, 0.16, false); B(g, 1.3, 0.03, 0.03, lam({ color: P.saff, emissive: 0x8a5a10 }), 0, 1.88, 0.12, false); }
      return 0;
    },
    medic(g, t) {
      if (t < 2) { B(g, t ? 0.6 : 0.4, t ? 0.7 : 0.35, 0.14, t ? P.cream : 0xf2f2ee, 0, 1.4, 0.07); B(g, 0.06, 0.2, 0.02, P.papr, 0, 1.4, 0.15); B(g, 0.2, 0.06, 0.02, P.papr, 0, 1.4, 0.15); if (t) B(g, 0.4, 0.3, 0.01, lam({ color: 0xcfe4ea, emissive: 0x334044 }), 0, 1.92, 0.08); return 0; }
      B(g, 0.8, 0.45, 0.85, P.cumin, 0, 0.3, 0); B(g, 0.8, 0.9, 0.2, P.cumin, 0, 0.95, -0.35); B(g, 0.16, 0.3, 0.8, P.dark, -0.42, 0.6, 0); B(g, 0.16, 0.3, 0.8, P.dark, 0.42, 0.6, 0); B(g, 0.5, 0.2, 0.3, P.cumin, 0, 0.1, 0.55);
      return [0.95, 0.9];
    },
    rug(g, t) {
      const w = [1.8, 2.8, 3.6][t], d = [1.2, 1.9, 2.4][t];
      const tx = canvasTex(128, 96, (c, W2, H2) => {
        if (t === 0) { c.fillStyle = '#b8a070'; c.fillRect(0, 0, W2, H2); c.strokeStyle = 'rgba(90,60,30,.4)'; for (let x = 0; x < W2; x += 4) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H2); c.stroke(); } c.fillStyle = '#7a3a1a'; c.font = '900 16px Arial'; c.fillText('PAPRIKA', 30, 54); return; }
        c.fillStyle = t === 1 ? '#a8331b' : '#5a1a22'; c.fillRect(0, 0, W2, H2); c.strokeStyle = t === 1 ? '#e8a33d' : '#d8b040'; c.lineWidth = 5; c.strokeRect(8, 8, W2 - 16, H2 - 16);
        c.fillStyle = t === 1 ? '#6a4a2a' : '#1e2a4a'; c.fillRect(18, 18, W2 - 36, H2 - 36);
        c.fillStyle = t === 1 ? '#f2ead8' : '#e8a33d'; for (let k = 0; k < 3; k++) { const cx = 34 + k * 30, cy = H2 / 2; c.beginPath(); c.moveTo(cx, cy - 18); c.lineTo(cx + 12, cy); c.lineTo(cx, cy + 18); c.lineTo(cx - 12, cy); c.closePath(); c.fill(); }
      });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), lam({ map: tx })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.receiveShadow = true; g.add(m); return 0;
    },
    weights(g, t) {
      B(g, 1.2, 0.08, 0.32, 0x2a2a2a, 0, 0.45, 0); for (const sx of [-0.5, 0.5]) B(g, 0.06, 0.45, 0.3, 0x5a5a5a, sx, 0.22, 0); B(g, 1.0, 0.1, 0.3, P.papr, 0, 0.52, 0);
      for (const sz of [-0.25, 0.25]) B(g, 0.05, 1.1, 0.05, 0x3a3a3a, 0.55, 0.55, sz); const bar = C(g, 0.02, 0.02, 1.5, 0xaaaaaa, 0.55, 1.05, 0, 8); bar.rotation.x = Math.PI / 2;
      for (const sz of [-0.6, 0.6]) { const pl = C(g, 0.18, 0.18, 0.05, 0x1a1a1a, 0.55, 1.05, sz, 14); pl.rotation.x = Math.PI / 2; }
      if (t === 2) B(g, 1.6, 1.4, 0.03, lam({ color: 0xcfe4ea, emissive: 0x2a3a3e }), 0, 1.2, -0.75, false);
      return [1.3, 0.9];
    },
    sofa(g, t) {
      const c = t === 1 ? P.cumin : P.saff, w = t === 1 ? 2.0 : 2.4;
      B(g, w, 0.4, 0.85, c, 0, 0.25, 0); B(g, w, 0.55, 0.2, c, 0, 0.62, -0.33); for (const sx of [-w / 2, w / 2]) B(g, 0.2, 0.55, 0.85, c, sx, 0.35, 0);
      for (let k = 0; k < (t === 1 ? 2 : 3); k++) B(g, w / (t === 1 ? 2 : 3) - 0.08, 0.1, 0.6, t === 1 ? 0x7a5a36 : 0xf0b84d, -w / 2 + (k + 0.5) * w / (t === 1 ? 2 : 3), 0.5, 0.06);
      if (t === 2) for (let k = 0; k < 9; k++) C(g, 0.015, 0.015, 0.01, P.brass, -w / 2 + 0.1 + k * (w - 0.2) / 8, 0.85, -0.22, 6).rotation.x = Math.PI / 2;
      B(g, 0.9, 0.35, 0.5, P.wood, 0, 0.18, 0.95); // low table in front
      return [w + 0.3, 1.0];
    },
    fish(g, t) {
      if (t === 1) { B(g, 1.0, 0.7, 0.4, P.wood, 0, 0.35, 0); B(g, 1.0, 0.55, 0.4, lam({ color: 0x5aa0b0, transparent: true, opacity: 0.55 }), 0, 0.98, 0, false); for (let k = 0; k < 3; k++) B(g, 0.08, 0.05, 0.03, P.saff, -0.3 + k * 0.28, 0.9 + (k % 2) * 0.15, 0.05); return [1.0, 0.4]; }
      const p = C(g, 1.0, 1.05, 0.3, 0x8a7a6a, 0, 0.15, 0, 20); p.scale.z = 0.7; const w2 = C(g, 0.9, 0.9, 0.04, lam({ color: 0x2a6a6a, emissive: 0x0a2a2a }), 0, 0.29, 0, 20); w2.scale.z = 0.7;
      for (let k = 0; k < 4; k++) B(g, 0.2, 0.04, 0.08, k % 2 ? P.cream : P.papr, -0.4 + k * 0.25, 0.32, (k % 2 ? 0.15 : -0.1));
      return [2.0, 1.4];
    },
    portrait(g) {
      const tx = canvasTex(96, 128, (c, w, h) => {
        c.fillStyle = '#3a2412'; c.fillRect(0, 0, w, h); c.fillStyle = '#232a40'; c.beginPath(); c.ellipse(48, 128, 42, 40, 0, 0, 7); c.fill();
        c.fillStyle = '#dc9c82'; c.beginPath(); c.ellipse(48, 58, 22, 27, 0, 0, 7); c.fill(); c.fillStyle = '#eceae4'; c.beginPath(); c.ellipse(48, 36, 23, 12, 0, Math.PI, 0); c.fill();
        c.fillStyle = '#eceae4'; c.fillRect(36, 68, 24, 5); c.fillStyle = '#2a1a10'; c.fillRect(39, 54, 5, 3); c.fillRect(52, 54, 5, 3);
      });
      B(g, 1.0, 1.3, 0.06, P.brass, 0, 1.9, 0); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 1.12), lam({ map: tx })); m.position.set(0, 1.9, 0.035); g.add(m);
      B(g, 0.5, 0.04, 0.06, lam({ color: P.saff, emissive: 0x6a4010 }), 0, 2.62, 0.08, false); return 0;
    },
  };
  // ---- Eddy's own things
  const screenTex = (lines, bg = '#0b2a2a', fg = '#e8a33d') => canvasTex(128, 96, (c, w) => { c.fillStyle = bg; c.fillRect(0, 0, w, 96); c.fillStyle = fg; c.font = '900 16px Arial'; c.textAlign = 'center'; lines.forEach((l, i) => c.fillText(l, w / 2, 40 + i * 22)); });
  const glow = (tex) => lam({ map: tex, emissive: 0xffffff, emissiveMap: tex });
  Object.assign(DRAW, {
    doner(g, t) { // a spit of meat, the glowing heater behind it, a knife, a stack of pita
      const base = [P.wood, 0xc8ccd0, P.brass][t], h0 = [0.55, 0.9, 0.9][t];
      B(g, 0.7, h0, 0.6, base, 0, h0 / 2, 0);
      if (t === 2) { for (const sx of [-0.33, 0.33]) B(g, 0.06, 1.9, 0.06, P.brass, sx, h0 + 0.95, -0.2); B(g, 0.72, 0.06, 0.1, P.brass, 0, h0 + 1.9, -0.2); }
      B(g, 0.5, [0.6, 0.75, 1.3][t], 0.06, lam({ color: 0x8a2a10, emissive: 0x6a1a04 }), 0, h0 + [0.3, 0.38, 0.65][t], -0.24);
      const meat = C(g, [0.12, 0.15, 0.2][t], [0.07, 0.09, 0.12][t], [0.5, 0.65, 1.2][t], 0x8a4a22, 0, h0 + [0.3, 0.37, 0.65][t], -0.02, 10); meat.userData.spin = 1;
      C(g, 0.012, 0.012, [0.7, 0.85, 1.5][t], 0xaaaaaa, 0, h0 + [0.35, 0.42, 0.75][t], -0.02, 6);
      B(g, 0.03, 0.02, 0.28, 0xd8dce0, 0.24, h0 + 0.02, 0.15); for (let k = 0; k < 3; k++) C(g, 0.1, 0.1, 0.015, 0xf2d8a0, -0.2, h0 + 0.01 + k * 0.018, 0.16, 10);
      return [0.7, 0.6];
    },
    vijzel(g, t) {
      if (t === 0) { B(g, 0.45, 0.45, 0.45, P.wood, 0, 0.22, 0); C(g, 0.14, 0.1, 0.16, 0x8a8a84, 0, 0.53, 0, 12); C(g, 0.11, 0.11, 0.02, 0xc8641e, 0, 0.6, 0, 12); const p = C(g, 0.025, 0.035, 0.26, 0x9a9a94, 0.04, 0.68, 0, 8); p.rotation.z = 0.4; return [0.45, 0.45]; }
      if (t === 1) { C(g, 0.18, 0.22, 0.75, P.wood, 0, 0.37, 0, 10); C(g, 0.16, 0.11, 0.18, P.brass, 0, 0.84, 0, 14); C(g, 0.13, 0.13, 0.02, P.turm, 0, 0.92, 0, 12); const p = C(g, 0.03, 0.04, 0.3, P.brass, 0.05, 1.0, 0, 8); p.rotation.z = 0.4; return [0.45, 0.45]; }
      B(g, 0.6, 0.8, 0.5, 0x5a1a10, 0, 0.4, 0); B(g, 0.62, 0.05, 0.52, P.brass, 0, 0.82, 0); C(g, 0.13, 0.09, 0.3, 0x2a2a2a, 0, 1.0, 0, 12); C(g, 0.14, 0.14, 0.02, P.papr, 0, 1.16, 0, 12);
      const wh = C(g, 0.28, 0.28, 0.04, 0xa8201a, 0.33, 0.95, 0, 18); wh.rotation.z = Math.PI / 2; B(g, 0.04, 0.04, 0.3, P.brass, 0.36, 1.05, 0.12);
      B(g, 0.2, 0.12, 0.2, P.cream, 0, 0.6, 0.27); return [0.8, 0.55];
    },
    kaasdows(g, t) {
      const w = t === 1 ? 1.2 : 1.5, wc = t === 1 ? P.wood : P.dark; B(g, w, 0.06, 0.65, wc, 0, 0.74, 0); for (const sx of [-w / 2 + 0.05, w / 2 - 0.05]) B(g, 0.05, 0.74, 0.6, wc, sx, 0.37, 0);
      B(g, 0.42, 0.36, 0.38, 0xd8d0b8, -0.1, 0.97, -0.08); const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.25), glow(screenTex(['KAASDOWS', t === 1 ? '95' : '98'], '#0b7b7b', '#ffffff'))); sc.position.set(-0.1, 0.99, 0.115); g.add(sc);
      B(g, 0.42, 0.03, 0.15, 0xd8d0b8, -0.1, 0.785, 0.2); B(g, 0.07, 0.02, 0.1, 0xd8d0b8, 0.22, 0.785, 0.2);
      if (t === 2) { B(g, 0.2, 0.45, 0.45, 0xd8d0b8, 0.55, 0.995, -0.05); B(g, 0.55, 0.1, 0.55, P.cumin, 0, 0.5, 0.7); B(g, 0.55, 0.6, 0.1, P.cumin, 0, 0.85, 0.95); C(g, 0.03, 0.03, 0.45, 0x2a2a2a, 0, 0.23, 0.7, 6); }
      return [w, t === 2 ? 1.1 : 0.65];
    },
    tv(g, t) {
      const ch = screenTex(t === 0 ? ['KAASLAND', 'TV'] : ['KOKEN MET', 'OMA ZAHRA'], t === 0 ? '#3a3a3a' : '#1a2a3a', t === 0 ? '#e8e8e8' : '#e8a33d');
      if (t === 0) { B(g, 0.5, 0.4, 0.45, P.wood, 0, 0.2, 0); B(g, 0.42, 0.34, 0.36, 0x2a2a2a, 0, 0.57, 0); const s2 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.24), glow(ch)); s2.position.set(0, 0.58, 0.185); g.add(s2); B(g, 0.01, 0.3, 0.01, 0xaaaaaa, 0.1, 0.88, 0); return [0.5, 0.45]; }
      if (t === 1) { B(g, 0.9, 0.75, 0.55, P.wood, 0, 0.38, 0); const s2 = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.42), glow(ch)); s2.position.set(-0.1, 0.45, 0.28); g.add(s2); for (let k = 0; k < 2; k++) C(g, 0.03, 0.03, 0.02, P.brass, 0.3, 0.55 - k * 0.12, 0.28, 8).rotation.x = Math.PI / 2; return [0.9, 0.55]; }
      B(g, 1.7, 0.45, 0.5, P.dark, 0, 0.22, 0); B(g, 0.4, 0.08, 0.3, 0x1a1a1a, -0.55, 0.49, 0.05); B(g, 1.5, 0.95, 0.12, 0x1a1a1a, 0, 0.95, -0.12); const s2 = new THREE.Mesh(new THREE.PlaneGeometry(1.36, 0.82), glow(ch)); s2.position.set(0, 0.95, -0.055); g.add(s2);
      return [1.7, 0.5];
    },
    plants(g, t) {
      if (t < 2) { // pots on the windowsill
        B(g, 1.1, 0.05, 0.22, P.cream, 0, 0.92, 0.06, false);
        for (let k = 0; k < 3; k++) { const x = -0.35 + k * 0.35; C(g, 0.08, 0.06, 0.13, 0xb8602a, x, 1.01, 0.08, 8); C(g, t ? 0.13 : 0.1, 0.06, t ? 0.28 : 0.18, 0x4a7a2a, x, t ? 1.22 : 1.16, 0.08, 7);
          if (!t) for (let j = 0; j < 3; j++) B(g, 0.02, 0.05, 0.02, 0xd82a1a, x - 0.04 + j * 0.04, 1.14 + (j % 2) * 0.05, 0.14, false); else for (let j = 0; j < 2; j++) C(g, 0.02, 0.02, 0.04, 0x9ac46a, x - 0.04 + j * 0.08, 1.36, 0.1, 6); }
        return 0;
      }
      B(g, 1.6, 0.35, 0.5, P.wood, 0, 0.17, 0); B(g, 1.5, 0.04, 0.42, 0x4a3020, 0, 0.35, 0, false);
      for (let k = 0; k < 14; k++) { const x = -0.65 + (k % 7) * 0.22, z = -0.1 + Math.floor(k / 7) * 0.2; C(g, 0.006, 0.006, 0.14, 0x5a8a3a, x, 0.43, z, 4); C(g, 0.045, 0.02, 0.06, 0x8a5ac8, x, 0.52, z, 6); B(g, 0.008, 0.04, 0.008, 0xd82a1a, x + 0.02, 0.55, z, false); }
      return [1.6, 0.5];
    },
    trophies(g, t) { // one thing from every boss Eddy beat
      const got = trophies(), wd = [1.0, 1.3, 1.5][t];
      if (t === 2) { B(g, wd, 1.2, 0.35, P.brass, 0, 1.55, 0.18); B(g, wd - 0.1, 1.1, 0.3, 0x2a1a0e, 0, 1.55, 0.2); B(g, wd, 1.2, 0.02, lam({ color: 0xbfe0e8, transparent: true, opacity: 0.22 }), 0, 1.55, 0.36, false); }
      B(g, wd, 0.04, 0.26, t === 2 ? P.brass : P.wood, 0, 1.25, 0.13, false);
      const at = (i) => -wd / 2 + 0.16 + i * ((wd - 0.32) / 3), y = 1.27;
      if (!got.length) { C(g, 0.07, 0.04, 0.14, P.brass, 0, y + 0.07, 0.13, 10); C(g, 0.06, 0.06, 0.02, P.wood, 0, y + 0.01, 0.13, 10); } // an old snackbar-bingo cup, until there's a boss to show
      got.forEach((k, i) => { const x = at(i);
        if (k === 'act1') { const f = C(g, 0.03, 0.03, 0.22, P.brass, x, y + 0.14, 0.13, 8); f.rotation.z = 0.3; B(g, 0.12, 0.04, 0.1, P.dark, x, y + 0.02, 0.13); } // Jan van Kaas: a golden frikandel
        else if (k === 'act2') { for (let j = 0; j < 9; j++) { const a = j / 9 * Math.PI * 2; C(g, 0.022, 0.022, 0.03, 0x9a6a3a, x + Math.cos(a) * 0.08, y + 0.1 + Math.sin(a) * 0.08, 0.13, 6); } } // Goeroe Granola's beads
        else if (k === 'act3') { C(g, 0.1, 0.1, 0.05, 0x1e2a4a, x, y + 0.04, 0.13, 12); C(g, 0.11, 0.11, 0.015, P.brass, x, y + 0.07, 0.13, 12); B(g, 0.12, 0.015, 0.06, 0x1a1a1a, x, y + 0.03, 0.2); } // De Abdavis's captain's cap
        else { B(g, 0.1, 0.18, 0.1, P.brass, x, y + 0.09, 0.13); for (let j = 0; j < 4; j++) { const v = B(g, 0.02, 0.2, 0.01, P.brass, x, y + 0.2, 0.19); v.rotation.z = j * Math.PI / 4; } } // Oom Gerrit's golden mill
      });
      return t === 2 ? [wd, 0.35] : 0;
    },
    kaart(g, t) { // Kaasland on the wall, a pin per territory
      const n = Math.min(30, Object.keys(state.owned || {}).length + (state.spekbuurt ? 1 : 0));
      const tx = canvasTex(160, 112, (c, w, h) => {
        c.fillStyle = t === 0 ? '#e8dcc0' : t === 1 ? '#c8a070' : '#f2ead8'; c.fillRect(0, 0, w, h); c.fillStyle = t === 1 ? '#efe4c8' : '#a9c46a';
        c.beginPath(); c.moveTo(20, 30); c.bezierCurveTo(50, 5, 110, 10, 140, 35); c.bezierCurveTo(150, 70, 120, 100, 80, 98); c.bezierCurveTo(40, 100, 10, 70, 20, 30); c.fill();
        c.strokeStyle = '#4a7a9a'; c.lineWidth = 3; c.beginPath(); c.moveTo(10, 60); c.bezierCurveTo(60, 50, 90, 75, 150, 62); c.stroke();
        let r = 7; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
        for (let i = 0; i < n; i++) { const x = 35 + rnd() * 95, y = 25 + rnd() * 65; c.fillStyle = '#b83a1e'; c.beginPath(); c.arc(x, y, 3.5, 0, 7); c.fill(); }
        c.fillStyle = '#3a2412'; c.font = '900 11px Arial'; c.fillText('KAASLAND', 52, 106);
      });
      const W2 = [0.9, 1.2, 1.4][t], H2 = W2 * 0.7;
      if (t) B(g, W2 + 0.1, H2 + 0.1, 0.04, t === 2 ? P.brass : 0xa07a4a, 0, 1.65, 0.02);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W2, H2), lam({ map: tx })); m.position.set(0, 1.65, 0.05); g.add(m); return 0;
    },
  });
  // ---- Saffie the cat: wanders the current home, sleeps on the rug
  const kat = new THREE.Group(); kat.visible = false; deps.scene.add(kat);
  B(kat, 0.36, 0.18, 0.16, 0xd8782a, 0, 0.2, 0); B(kat, 0.16, 0.15, 0.15, 0xd8782a, 0.22, 0.3, 0); for (const sz of [-0.05, 0.05]) B(kat, 0.04, 0.06, 0.03, 0xd8782a, 0.24, 0.4, sz);
  for (const sx of [-0.12, 0.12]) for (const sz of [-0.05, 0.05]) B(kat, 0.04, 0.12, 0.04, 0xf2ead8, sx, 0.06, sz);
  const tail = B(kat, 0.3, 0.04, 0.04, 0xd8782a, -0.28, 0.34, 0); tail.rotation.z = -0.7;
  kat.userData = { tx: 0, tz: 0, wait: 1, phase: 0 };

  function furnish(tier) {
    const r = rooms[tier], e = ensure();
    for (const s of r.furnSol) { const i = deps.solids.indexOf(s); if (i >= 0) deps.solids.splice(i, 1); }
    r.furnSol = []; r.spots = [];
    while (r.fg.children.length) { const o = r.fg.children.pop(); o.traverse((c) => { if (c.geometry) c.geometry.dispose(); }); }
    const put = (k, key) => {
      const sl = S[key || k][tier]; if (!sl) return;
      const g = new THREE.Group(); g.position.set(sl[0], 0, sl[1]); g.rotation.y = sl[2]; r.fg.add(g);
      const fp = DRAW[key || k](g, tier);
      if (fp) { const rot = Math.abs(Math.sin(sl[2])) > 0.5, w = rot ? fp[1] : fp[0], d = rot ? fp[0] : fp[1]; r.furnSol.push(solid(r.ox + sl[0] - w / 2, r.ox + sl[0] + w / 2, r.oz + sl[1] - d / 2, r.oz + sl[1] + d / 2)); r.spots.push([sl[0], sl[1], w / 2 + 0.25, d / 2 + 0.25]); }
    };
    put('bed'); put('ward'); put('cat');
    for (const it of FURN) if (!it.global && e.furn[tier][it.k] && DRAW[it.k]) put(it.k);
  }
  rooms.forEach((r, i) => furnish(i));

  // ================================================================== going in and out
  let inHome = -1, perkT = 1;
  const inRoom = (p, r) => p.x > r.ox - r.W / 2 - 0.5 && p.x < r.ox + r.W / 2 + 0.5 && p.z > r.oz - r.D / 2 - 0.5 && p.z < r.oz + r.D / 2 + 0.6;
  function show(tier) {
    rooms.forEach((r, i) => { r.g.visible = i === tier; r.light.intensity = i === tier ? 2.4 : 0; });
    kat.visible = tier >= 0 && !!ensure().glob.kat;
    if (kat.visible) { const r = rooms[tier], sl = S.rug[tier]; kat.position.set(r.ox + sl[0] + 0.6, 0, r.oz + sl[1] - 0.3); kat.userData.wait = 1.5; }
  }
  function enterHome(tier) {
    const e = ensure(); if (!e.homes.includes(tier)) return;
    deps.beep(300, 0.08, 'triangle', 0.04);
    fadeTo(() => {
      if (e.home !== tier) { e.home = tier; deps.toast('MOVED IN', `${HOMES[tier].name} is home now. You wake up here.`, 3); }
      const r = rooms[tier]; inHome = tier; show(tier);
      player.position.set(r.door.x, 0, r.door.z); player.rotation.y = Math.PI;
      deps.setBounds({ x0: r.ox - r.W / 2 + 0.3, x1: r.ox + r.W / 2 - 0.3, z0: r.oz - r.D / 2 + 0.3, z1: r.oz + r.D / 2 - 0.2 });
      if (deps.snapCam) deps.snapCam(); deps.save();
    });
  }
  function leaveHome() {
    const d = deps.doors[inHome]; deps.beep(260, 0.08, 'triangle', 0.04);
    fadeTo(() => { inHome = -1; show(-1); deps.setBounds(null); player.position.set(d.stand.x, 0, d.stand.z); player.rotation.y = d.face; if (deps.snapCam) deps.snapCam(); });
  }
  // street doors: Het Hok from the warehouse, the other two on the street with a TE KOOP board or a brass name plate
  const plates = deps.doors.map((d, i) => {
    if (!d.facade) return null;
    const g = new THREE.Group(); g.position.set(d.x, 0, d.z); deps.scene.add(g);
    const sale = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.75), lam({ map: signTex([{ t: 'TE KOOP', size: 46 }, { t: fmt(HOMES[i].price), size: 26, color: '#2a1a0e' }], '#f2ead8', '#b83a1e', 256, 148) }));
    sale.position.set(-0.95, 1.7, 0.12); g.add(sale);
    const own = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.22), lam({ map: signTex([{ t: 'E. JR.', size: 40 }], '#d8b040', '#3a2412', 256, 90), emissive: 0x2a1a00 }));
    own.position.set(0.68, 1.45, 0.1); g.add(own);
    return { sale, own };
  });
  function refreshPlates() { const e = ensure(); plates.forEach((p, i) => { if (!p) return; const mine = e.homes.includes(i); p.sale.visible = !mine; p.own.visible = mine; }); }
  refreshPlates();
  deps.doors.forEach((d, i) => addInteract({
    pos: () => new THREE.Vector3(d.stand.x, 0, d.stand.z), r: 1.3, enabled: () => inHome < 0 && (i > 0 || deps.inWarehouse()) && !deps.blocked(),
    label: () => { const e = ensure(); return e.homes.includes(i) ? (e.home === i ? `Go home · ${HOMES[i].name}` : `${HOMES[i].name} · yours · move back in`) : `${HOMES[i].name} · TE KOOP · ${fmt(HOMES[i].price)}`; },
    act: () => { const e = ensure(); if (e.homes.includes(i)) enterHome(i); else deps.toast('TE KOOP', `${HOMES[i].name}, ${fmt(HOMES[i].price)}. ${buyWhy(i) || 'Buy it on the Kaasdows, under Woning.'}`, 3.5); },
  }));
  // inside: the door, the bed, the wardrobe, the catalogue, the radio
  const here = (key) => () => { const r = rooms[inHome], sl = S[key][inHome]; return new THREE.Vector3(r.ox + sl[0], 0, r.oz + sl[1]); };
  addInteract({ pos: () => (inHome >= 0 ? new THREE.Vector3(rooms[inHome].door.x, 0, rooms[inHome].door.z + 0.3) : new THREE.Vector3(0, -99, 0)), r: 1.0, enabled: () => inHome >= 0, label: () => 'Go outside', act: leaveHome });
  addInteract({ pos: () => (inHome >= 0 ? here('bed')() : new THREE.Vector3(0, -99, 0)), r: 1.7, enabled: () => inHome >= 0, label: () => (deps.endDay && deps.state.step === 'free' ? `Sleep · end day ${econ.ensure().day}` : ensure().mornDay !== econ.ensure().day ? 'Sleep (somebody may knock in the morning)' : 'Take a nap'), act: sleep });
  addInteract({ pos: () => (inHome >= 0 ? here('ward')() : new THREE.Vector3(0, -99, 0)), r: 1.4, enabled: () => inHome >= 0, label: () => `Wardrobe · ${OUTFITS[ensure().outfit].name}`, act: wardrobe });
  addInteract({ pos: () => (inHome >= 0 ? here('cat')() : new THREE.Vector3(0, -99, 0)), r: 1.3, enabled: () => inHome >= 0, label: () => 'Catalogue & phone · order furniture', act: () => deps.openPC('woning') });
  addInteract({ pos: () => (inHome >= 0 ? here('radio')() : new THREE.Vector3(0, -99, 0)), r: 1.3, enabled: () => inHome >= 0 && owned('radio', inHome), label: () => `Radio · ${STATIONS[ensure().station].name} · change station`, act: nextStation });

  // ---- using Eddy's things: E next to a piece that has a use
  const TV_LINES = ['Kaasland Journaal: "The Lampas deny everything. Also the sawdust."', 'Koken met Oma Zahra: "Komijn is not a garnish, it is a lifestyle."', 'Weather: rain. Tomorrow: rain. The weekend: you guessed it.', 'Advert: "Frituur Het Gouden Frietje. Now with 10% less grease!"', 'Kaasland Got Talent: a man juggles three wheels of Gouda. The jury cries.', 'Late film: "De Gouden Mix III: Kardemom Rising". You fall asleep at the good part.', 'Police report: "a large man in a blue shirt" seen near a Lampas den. Eddy changes the channel.'];
  const usable = () => {
    if (inHome < 0) return null; const r = rooms[inHome]; let best = null, bd = 1.6;
    for (const it of FURN) {
      if (!it.use || it.global || !owned(it.k, inHome) || !itemFor(it, inHome)) continue; const sl = S[it.k] && S[it.k][inHome]; if (!sl) continue;
      const d = Math.hypot(r.ox + sl[0] - player.position.x, r.oz + sl[1] - player.position.z); if (d < bd) { bd = d; best = { it, row: itemFor(it, inHome), pos: new THREE.Vector3(r.ox + sl[0], 0, r.oz + sl[1]) }; }
    }
    return best;
  };
  const useLabel = (u) => {
    const e = ensure(), d = today();
    return { eat: e.fedDay === d ? `${u.row[0]} · you ate today (+1 hit on the next raid)` : `${u.row[0]} · eat a shoarma (+1 hit next raid)`, grind: e.grindDay === d ? `${u.row[0]} · you ground a jar today` : `${u.row[0]} · grind a jar (+${25 * (inHome + 1)} rep)`,
      pc: `${u.row[0]} · log in to Kaasdows`, tv: `${u.row[0]} · watch TV`, water: `${u.row[0]} · water the plants`, map: `${u.row[0]} · open the map` }[u.it.use];
  };
  function useItem(u) {
    const e = ensure(), d = today();
    if (u.it.use === 'eat') { if (e.fedDay === d) return deps.toast('VOL', 'One shoarma a day. Eddy Sr. would say two. Mama would say none.', 2.5); e.fedDay = d; deps.beep(520, 0.1, 'triangle', 0.04); deps.toast('LEKKER', 'Shoarma with extra garlic sauce. +1 hit on your next raid.', 3); deps.save(); }
    else if (u.it.use === 'grind') { if (e.grindDay === d) return deps.toast('VIJZEL', 'Your arms say no. Tomorrow.', 2.2); e.grindDay = d; const n = 25 * (inHome + 1); if (econ.addRep) econ.addRep(n); deps.beep(180, 0.25, 'sawtooth', 0.025); deps.toast('VERS GEMALEN', `The whole street smells your blend. +${n} rep.`, 3); deps.save(); }
    else if (u.it.use === 'pc') deps.openPC('sell');
    else if (u.it.use === 'map') deps.openPC('map');
    else if (u.it.use === 'tv') deps.toast('KAASLAND TV', pick(TV_LINES), 4);
    else if (u.it.use === 'water') deps.toast('GIETER', pick(['The plants say thank you. Quietly.', 'One chilli is ripe. You eat it. Your eyes water for ten minutes.', 'Saffie knocks a pot over. You blame the cat. The cat blames you.', 'They grow. Slowly. Like your empire.']), 3);
  }
  addInteract({ pos: () => { const u = usable(); return u ? u.pos : new THREE.Vector3(0, -99, 0); }, r: 1.6, enabled: () => !!usable(), label: () => useLabel(usable()), act: () => { const u = usable(); if (u) useItem(u); } });
  function nextStation() {
    const e = ensure(); e.station = (e.station + 1) % STATIONS.length; applyStation(); deps.beep(900, 0.04, 'square', 0.03);
    deps.toast('ON THE RADIO', STATIONS[e.station].name + (deps.music.on ? '' : ' · (music is off: M)'), 2.2); deps.save();
  }
  const applyStation = () => { const e = ensure(); deps.music.setStation(owned('radio', e.home) || e.station === 0 ? STATIONS[e.station] : STATIONS[0]); };
  function wardrobe() {
    const keys = Object.keys(OUTFITS).filter(outfitOK);
    if (keys.length < 2) return deps.toast('WARDROBE', 'Just the blue shirt for now. New clothes come with a bigger name (rank).', 3);
    const opts = keys.slice(0, 6);
    deps.choice('Eddy Jr.', 'What do I wear today?<br><small>' + opts.map((k) => `<b>${OUTFITS[k].name}</b>: ${OUTFITS[k].desc}`).join('<br>') + '</small>', opts.map((k) => OUTFITS[k].name + (ensure().outfit === k ? ' (on)' : '')), (i) => wear(opts[i]));
  }
  function wear(k) {
    if (!outfitOK(k)) return; const e = ensure(); e.outfit = k; applyOutfit(); deps.save();
    deps.toast('NEW LOOK', OUTFITS[k].name, 2);
  }
  function applyOutfit() {
    const o = OUTFITS[ensure().outfit]; if (!deps.repaint) return;
    const sp = o.paint ? { print: undefined, apron: false, sleeves: 'long', belt: [0x5a, 0x30, 0x18], ...o.paint } : {};
    deps.repaint(player, o.paint ? { shirt: o.paint.shirt.map((v) => v / 255), jacket: o.paint.shirt.map((v) => v / 255), pants: o.paint.pants.map((v) => v / 255), shirtPaint: sp } : {});
  }

  // ================================================================== sleeping and the morning visitors (Neon Vice MORNING)
  const MORNING = [
    { who: 'Schmatzel', good: 1, msg: "Eddy! I brought leftover shoarma. And this envelope: for the spice you forgot to charge me last week. Don't argue.", fx: () => { deps.addMoney(300); return '+W 300'; } },
    { who: 'Cousin Shooki', good: 1, msg: 'Remember the five hundred from 2019? Here. With interest. No interest. Here.', fx: () => { deps.addMoney(500); return '+W 500'; } },
    { who: 'Nabil', good: 1, need: () => !!state.metNabil, msg: 'Card night was good to me, habibi. Your share. Tell nobody.', fx: () => { deps.addMoney(400); return '+W 400'; } },
    { who: 'A crate on the doorstep', good: 1, msg: 'No note. A crate of Lampas spice, "slightly borrowed". Somebody likes you.', fx: () => { state.loot = (state.loot || 0) + 1; return '+1 crate of Lampas spice (sell it on Kaasplaats)'; } },
    { who: 'A note under the door', good: 1, msg: () => `In pencil, no name. "${econ.rumour ? econ.rumour() : 'Nothing. Tomorrow is a quiet day on the market'}."`, fx: () => 'A free rumour from the Fluisteraar' },
    { who: 'Ome Joop', good: 1, need: () => comfort() >= 3, msg: 'He brought appeltaart and looked at your place for a long time. "Your dad would like this. The rug, not the cat."', fx: () => { econ.addRep && econ.addRep(25); return '+25 rep'; } },
    { who: 'Saffie the cat', good: 1, need: () => !!ensure().glob.kat, msg: 'Saffie drags a soggy W 50 note out from under the sacks. And another. Whose? Who cares. Good cat.', fx: () => { deps.addMoney(150); return '+W 150'; } },
    { who: 'The neighbour downstairs', home: 1, msg: 'Knock knock. "The ceiling shakes when you walk. Rent goes up. Today."', fx: () => { deps.addMoney(-250); return '-W 250'; } },
    { who: 'Vereniging van Eigenaren', home: 2, msg: 'A letter: "The hoisting beam needs varnish. Your share is attached." It is attached.', fx: () => { deps.addMoney(-400); return '-W 400'; } },
    { who: 'Van der Belasting', need: () => owned('radio'), msg: 'A blue envelope. "Radio licence, unpaid since 1987." Dad again.', fx: () => { deps.addMoney(-200); return '-W 200'; } },
    { who: 'A seagull', home: 0, msg: 'It came in through the roof and ate your bread. Then it looked at you. You looked away first.', fx: () => 'Nothing. You lost to a seagull.' },
  ];
  function sleep() {
    const e = ensure(); let day = econ.ensure().day; deps.beep(220, 0.3, 'sine', 0.04);
    fadeTo(() => {
      if (deps.endDay && deps.state.step === 'free' && deps.endDay()) day = econ.ensure().day; // sleeping ends the market day (js/economy.js day plan)
      if (e.mornDay === day) { deps.toast('ZZZ...', 'A good nap. Nothing happens. Bliss.', 2.2); return; }
      e.mornDay = day;
      const c = comfort(), pool = MORNING.filter((m) => (!m.need || m.need()) && (m.home === undefined || m.home === e.home));
      const w = pool.map((m) => (m.good ? 1 + c * 0.15 : 1)), tot = w.reduce((a, b) => a + b, 0); let r = Math.random() * tot, ev = pool[0];
      for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { ev = pool[i]; break; } }
      const msg = typeof ev.msg === 'function' ? ev.msg() : ev.msg;
      setTimeout(() => deps.dialogue([['Eddy Jr.', '*yawn* ...who knocks at this hour?'], [ev.who, msg]], () => { const fx = ev.fx(); deps.toast('GOEDEMORGEN', fx, 3.2); deps.save(); }), 300);
    });
  }

  // ================================================================== knacks: one pick of three at every reputation milestone
  let picking = false;
  function offerKnack() {
    const e = ensure(), opts = Object.keys(PERKS).filter((k) => (e.perks[k] || 0) < PERKS[k].max).sort(() => Math.random() - 0.5).slice(0, 3);
    if (!opts.length) { e.perks._done = (e.perks._done || 0); return; }
    picking = true;
    const ro = ['', 'I', 'II', 'III'];
    deps.choice('Eddy Jr.', `People in Kaasland know my name now (${econ.ensure().rep} rep). I'm getting good at something. Pick a knack, it stays for good.<br><small>${opts.map((k) => `<b>${PERKS[k].name} ${ro[(e.perks[k] || 0) + 1]}</b>: ${PERKS[k].desc}`).join('<br>')}</small>`,
      opts.map((k) => `${PERKS[k].name} ${ro[(e.perks[k] || 0) + 1]}`), (i) => {
        picking = false; const k = opts[i]; e.perks[k] = (e.perks[k] || 0) + 1; deps.beep(880, 0.08, 'triangle', 0.05);
        deps.toast('NEW KNACK', `${PERKS[k].name}: ${PERKS[k].desc}`, 3); deps.save();
      });
  }

  // ================================================================== per frame
  function update(dt) {
    if (inHome >= 0 && !inRoom(player.position, rooms[inHome])) { inHome = -1; show(-1); } // a mission or drive took Eddy away
    if (inHome >= 0 && kat.visible) { // Saffie wanders between the furniture
      const r = rooms[inHome], u = kat.userData; u.wait -= dt;
      if (u.wait <= 0) {
        const dx = u.tx - kat.position.x, dz = u.tz - kat.position.z, d = Math.hypot(dx, dz);
        if (d < 0.08) {
          u.wait = 1.5 + Math.random() * 4;
          for (let k = 0; k < 8; k++) { const tx = r.ox + (Math.random() - 0.5) * (r.W - 1.2), tz = r.oz + (Math.random() - 0.5) * (r.D - 1.2); if (!r.spots.some(([sx, sz, hw, hd]) => Math.abs(tx - r.ox - sx) < hw && Math.abs(tz - r.oz - sz) < hd)) { u.tx = tx; u.tz = tz; break; } }
        } else { const st = Math.min(d, 0.7 * dt); kat.position.x += dx / d * st; kat.position.z += dz / d * st; kat.rotation.y = Math.atan2(dx, dz) - Math.PI / 2; u.phase += dt * 10; kat.position.y = Math.abs(Math.sin(u.phase)) * 0.02; }
      }
    }
    if (inHome >= 0) rooms[inHome].fg.traverse((o) => { if (o.userData.spin) o.rotation.y += dt * 1.5; else if (o.userData.spinX) o.rotation.x += dt * 0.8; });
    if ((perkT -= dt) <= 0) { perkT = 1; if (!picking && pending() > 0 && !deps.busy()) offerKnack(); }
  }

  // ================================================================== Kaasdows: the Woning tab
  function buyWhy(i) {
    const h = HOMES[i]; if (h.rank && rank() < h.rank) return `Needs rank ${RANK_NAMES[h.rank]}.`;
    if (h.needs && !state[h.needs]) return 'Take all of Kipkruidenkwartier first.';
    return null;
  }
  function buyHome(i, el) {
    const e = ensure(), h = HOMES[i]; if (e.homes.includes(i)) return null;
    const why = buyWhy(i); if (why) return why;
    if (state.money < h.price) return `Not enough Wilders (${fmt(h.price)}).`;
    deps.addMoney(-h.price, el); e.homes.push(i); e.home = i; refreshPlates(); deps.save();
    deps.toast('SOLD', `${h.name} is yours. The key is under the mat: go and have a look.`, 3.5); return null;
  }
  function buyFurn(k, el) {
    const e = ensure(), it = FURN.find((f) => f.k === k), tier = e.home, row = it && itemFor(it, tier);
    if (!row || owned(k, tier)) return null;
    if (state.money < row[1]) return `Not enough Wilders (${fmt(row[1])}).`;
    deps.addMoney(-row[1], el); if (it.global) e.glob[k] = 1; else e.furn[tier][k] = 1;
    furnish(tier); if (inHome === tier) show(tier); if (k === 'radio') applyStation(); deps.save();
    deps.toast('DELIVERED', `${row[0]}, to ${HOMES[tier].name}.`, 2.5); return null;
  }
  function html() {
    const e = ensure(), tier = e.home, ro = ['', 'I', 'II', 'III'];
    let h = `<div class="well" style="margin-bottom:8px"><b>Woning · Eddy's homes</b><br>You live in <b>${HOMES[tier].name}</b>. Furniture stands in the home you buy it for, and most of it gives a small knack while you live there. Sleep in your bed: somebody may knock in the morning.</div>`;
    h += '<table class="list"><tr><th>Home</th><th></th></tr>';
    HOMES.forEach((x, i) => {
      const mine = e.homes.includes(i), why = buyWhy(i);
      h += `<tr><td><b>${x.name}</b>${i === tier ? ' <small>(home)</small>' : ''}<br><small>${x.desc}</small></td><td>${mine ? (i === tier ? 'Living here' : `<button class="b95" data-wo="move:${i}">Move back in</button>`) : why ? `<small>${why}</small>` : `<button class="b95" data-wo="home:${i}" data-need="${x.price}"${state.money < x.price ? ' disabled' : ''}>Buy (${fmt(x.price)})</button>`}</td></tr>`;
    });
    h += `</table><div class="well" style="margin-top:8px"><b>Inrichting · ${HOMES[tier].name}</b> · comfort ${comfort()}</div><table class="list"><tr><th>Piece</th><th>Gives</th><th></th></tr>`;
    for (const it of FURN) {
      const row = itemFor(it, tier); if (!row) continue; const own = owned(it.k, tier);
      h += `<tr><td><b>${row[0]}</b><br><small>${row[2]}</small></td><td><small>${it.perk ? PERKS[it.perk].name + ': ' + PERKS[it.perk].desc : it.k === 'trophies' ? `Comfort +1 per boss trophy (${trophies().length} now)` : 'Comfort +' + comfortOf(it, tier)}${it.use ? '<br>Use it at home (E)' : ''}</small></td><td>${own ? 'Installed' : `<button class="b95" data-wo="furn:${it.k}" data-need="${row[1]}"${state.money < row[1] ? ' disabled' : ''}>Buy (${fmt(row[1])})</button>`}</td></tr>`;
    }
    const lv = knackLevel(), taken = knacksTaken(), rep = econ.ensure().rep || 0;
    const knacks = Object.keys(PERKS).filter((k) => e.perks[k]).map((k) => `${PERKS[k].name} ${ro[e.perks[k]]}`).join(' · ') || 'none yet';
    h += `</table><div class="well" style="margin-top:8px"><b>Eddy</b><br>Knacks: <b>${knacks}</b><br><small>${taken < lv ? 'A new knack is waiting: close the Kaasdows to pick it.' : `Next knack at ${repFor(lv + 1)} rep (now ${rep}).`}</small><br>`;
    h += 'Total from knacks, outfit and furniture: ' + Object.keys(PERKS).map((k) => [k, perk(k)]).filter(([, n]) => n).map(([k, n]) => `${PERKS[k].name} ${n}`).join(' · ') + '<br>';
    h += `Kruidenblikken found: <b>${Object.keys(state.tins).length}</b> <small>(one hidden in every raid level, worth W 400 each)</small></div>`;
    h += '<table class="list" style="margin-top:6px"><tr><th>Outfit</th><th></th></tr>';
    for (const [k, o] of Object.entries(OUTFITS)) {
      const ok = outfitOK(k), why = o.act ? 'After the Lampas are finished' : `Rank ${RANK_NAMES[o.rank || 0]}`;
      h += `<tr><td><b>${o.name}</b><br><small>${o.desc}</small></td><td>${e.outfit === k ? 'Wearing it' : ok ? `<button class="b95" data-wo="wear:${k}">Wear</button>` : `<small>${why}</small>`}</td></tr>`;
    }
    return h + '</table>';
  }
  function bind(body, rerender) {
    body.querySelectorAll('[data-wo]').forEach((b) => b.onclick = () => {
      const [act, id] = b.dataset.wo.split(':'); let m = null;
      if (act === 'home') m = buyHome(+id, b); else if (act === 'furn') m = buyFurn(id, b); else if (act === 'wear') wear(id);
      else if (act === 'move') { ensure().home = +id; deps.toast('MOVING', `Back to ${HOMES[+id].name}. Walk over and go in.`, 2.5); deps.save(); }
      if (m) deps.toast('WONING', m, 2.5); rerender();
    });
  }
  function loaded() { ensure(); refreshPlates(); rooms.forEach((r, i) => furnish(i)); applyOutfit(); applyStation(); }
  const camFocus = (p) => { const r = rooms[inHome]; return new THREE.Vector3(r.ox * 0.55 + p.x * 0.45, 0, (r.oz - 0.6) * 0.55 + p.z * 0.45); };
  const camHeight = () => rooms[Math.max(0, inHome)].D * 1.1 + 4.2; // bigger rooms: the camera goes up a bit
  return { camHeight, camFocus, ensure, perk, update, html, bind, loaded, applyOutfit, inside: () => inHome >= 0, home: () => inHome, enterHome, leaveHome, pending, knackLevel, comfort, rooms, sleep, wear, buyHome, buyFurn };
}
