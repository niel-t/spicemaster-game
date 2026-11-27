// De vaste gezichten (Tristan 2026-11-27): eight street regulars of the Kipkruidenkwartier, each with a cartoon portrait made
// from Tristan's own pictures (assets/face_<key>.jpg), a 3D figure with their prop at a fixed spot, and a reason to stop:
//   Tante Truus     stoep chair, binoculars: one tip a day about the Lampas, the market or the street
//   De Haringman    herring cart by the bridge: a broodje haring (W 4) = faster healing on your next raid
//   Bram            bakfiets with a sleeping toddler and a spice tin: run the tin to a shop before the nap ends (once a day)
//   Sjonnie         bottle collector with a trolley: W 15 for a rumour about the next joint (its boss and a tip)
//   Mevrouw Visser  the VvE: she complains about the warehouse; flowers (W 10) win the street over, brushing her off costs you
//   Lotte           vlogger: pose for her once a day (buurt rep up); walk up with the Maboota out and she films it (rep down)
//   Draaiorgel Dirk street organ: tip him (W 5) and he plays the Mediaspeler and the street smiles (once a day)
//   Rinus           locksmith on a scooter: W 40 for the quiet side door into the next joint
// Spots are on the home street (main.js coordinates: shop fronts at z -6.5, road -3.4..6.6, south walk to ~12, canal 12.9..20.4,
// Kipkruidenkade from 22). State lives in state.vaste = { day, used: { key: day }, haring }.
import { mk } from './buurtfolk.js';

export const REG_FACES = {
  'Tante Truus': './assets/face_truus.jpg', 'De Haringman': './assets/face_haring.jpg', 'Bram met de Bakfiets': './assets/face_bram.jpg',
  'Sjonnie': './assets/face_sjonnie.jpg', 'Mevrouw Visser': './assets/face_visser.jpg', 'Lotte de Vlogger': './assets/face_lotte.jpg',
  'Draaiorgel Dirk': './assets/face_dirk.jpg', 'Rinus de Sleutelman': './assets/face_rinus.jpg',
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const CAST = [
  { key: 'truus', name: 'Tante Truus', at: [-41, -5.7], face: Math.PI * 0.05, sits: 1,
    look: mk({ fem: 1, skin: 0xf0c8a8, hair: 0xcfcac2, hs: 'big', glasses: 1, body: 'stocky', shirt: 0xd88a9a, jacket: 0x3a4a7a, pants: 0x6a4a5a, skirt: 0x8a5a6a, sleeves: 'long', calm: 1 }),
    hi: ['Sit down, jongen. No, not on my geraniums.', 'I see everything from this chair. Everything. Your father\'s van, for example. Parked like a drunk.', 'Forty years on this stoep. I have outlived three mayors and a bakery.'] },
  { key: 'haring', name: 'De Haringman', at: [23.8, 11.0], face: Math.PI,
    look: mk({ skin: 0xe8b896, hair: 0xb8b0a2, hs: 'normal', stache: 1, body: 'stocky', hat: 'peaked', hatC: 0x1a2240, shirt: 0x6a3a2a, pants: 0x2a2a30, under: 0xf4f2ec, sleeves: 'long', calm: 0.6 }),
    hi: ['Hollandse Nieuwe! Head back, tail in, swallow. Like a man.', 'Onions and pickles on top? Only if you want to be loved by nobody.', 'Fresh from the boat this morning. Which boat? A boat.'] },
  { key: 'bram', name: 'Bram met de Bakfiets', at: [-10, 10.6], face: Math.PI * 0.5,
    look: mk({ skin: 0xe8b896, hair: 0x8a6a4a, hs: 'curly', stubble: 1, body: 'slim', shirt: 0x74787c, jacket: 0x1e2a44, pants: 0x4a4a3a, sleeves: 'long', calm: 0.3 }),
    hi: ['Shh. She\'s asleep. If she wakes up I will cry, and then she will cry.', 'Second child. I haven\'t slept since 2019.', 'This bakfiets cost more than my first car. It also has a better suspension.'] },
  { key: 'sjonnie', name: 'Sjonnie', at: [37, -4.7], face: 0,
    look: mk({ skin: 0xdcae90, hair: 0x6a5a4a, hs: 'curly', stubble: 1, body: 'slim', shirt: 0x6a6a62, jacket: 0x1e2e6a, pants: 0x1a1a22, sleeves: 'long', calm: 0.2 }),
    hi: ['Fifteen cents a bottle, Eddy. Fifteen. I am a millionaire in bottles.', 'People throw away money every day. I just bend down.', 'I hear things. Bottles hear things. Under the tables, in the bins.'] },
  { key: 'visser', name: 'Mevrouw Visser', at: [3.4, -5.5], face: 0,
    look: mk({ fem: 1, skin: 0xf0c8aa, hair: 0xcbb98e, hs: 'normal', glasses: 1, body: 'slim', shirt: 0x6a4a3a, jacket: 0xc8b48a, pants: 0x3a3a3a, skirt: 0x3a3a3a, sleeves: 'long', calm: 1, smile: 0 }),
    hi: ['Meneer. The VvE has received complaints. From me.', 'Forklift beeps at six in the morning. SIX.', 'I have a folder on you. It is a thick folder.'] },
  { key: 'lotte', name: 'Lotte de Vlogger', at: [27.4, 11.6], face: Math.PI,
    look: mk({ fem: 1, skin: 0xf2c8a8, hair: 0xe2c270, hs: 'long', body: 'slim', shirt: 0xf4a8cc, jacket: 0xf04a9a, pants: 0x2aa8a8, sleeves: 'long', calm: 0.1 }),
    hi: ['Hiii guys, it\'s Lotte! Say hi to the chat, Eddy!', 'Smash that like, jongens. Literally smash it.', 'Three hundred followers! And my mum. Three hundred and one.'] },
  { key: 'dirk', name: 'Draaiorgel Dirk', at: [-13, 23.4], face: Math.PI,
    look: mk({ skin: 0xf0b090, hair: 0xc8c4bc, hs: 'normal', stache: 1, body: 'stocky', hat: 'peaked', hatC: 0x6a6658, shirt: 0x6a5a6a, jacket: 0x3a2a24, pants: 0x2a2420, sleeves: 'long', calm: 0.4 }),
    hi: ['Een centje voor de orgelman! Two centjes and I play it twice.', 'She\'s called De Gouden Engel. Built in 1924. Older than the bridge.', 'Every Saturday for thirty-one years. The pigeons know the tunes.'] },
  { key: 'rinus', name: 'Rinus de Sleutelman', at: [9, -4.5], face: -Math.PI * 0.25,
    look: mk({ skin: 0xe0b090, hair: 0x4a3424, hs: 'long', glasses: 1, body: 'slim', shirt: 0x2a3a6a, jacket: 0x2a3a6a, pants: 0x2a3a6a, sleeves: 'long', calm: 0.3 }),
    hi: ['Locked out? Locked in? Rinus does both. Mostly the first.', 'Every door has a way in, Eddy. Most people just use the handle.', 'Three hundred keys on this belt. I know which one is which. Mostly.'] },
];

const TRUUS_TIPS = [
  'When a Lampas stops walking and raises his gun, he\'s about to fire. Get behind something solid. A counter. Not a table.',
  'Shift makes you run, and running is loud. In a quiet joint, walk.',
  'Reload when it\'s quiet, not when they\'re in your face. Press R twice and hit the green: no fumbling.',
  'The Lampas sleep in on Sundays. The spice market doesn\'t.',
  'Grab their guns when they drop them. Same calibre? Strip the rounds into your pocket.',
  'A door kicked open fast knocks a man flat. My late husband learned that the hard way. Twice.',
  'Bikes and bistro tables don\'t stop bullets. Ovens do.',
  'Red barrels. Shoot them from far away. From very far away.',
  'If a Lampas sees his friend on the floor, he goes looking. Don\'t leave them where they can be found.',
  'Pay the parking. The handhaver with the scanner comes every few minutes, and he\'s worse than the Lampas.',
];

export function createRegulars(deps) {
  const { scene, player, state, box, cyl, lam } = deps;
  const S = () => (state.vaste = state.vaste || { used: {}, haring: 0 });
  const today = () => (deps.world && deps.world() ? deps.world().cal().d : 1);
  const usedToday = (k) => S().used[k] === today();
  const use = (k) => { S().used[k] = today(); deps.save(); };
  const pay = (n) => { if (state.money < n) { deps.toast('NOT ENOUGH WILDERS', `You need W ${n}.`, 1.8); return false; } deps.addMoney(-n); return true; };
  const people = [];

  // ---- props (a few boxes each; static, merged by nothing: 8 small groups)
  const M = (c, o = {}) => lam({ color: c, ...o });
  function solidL(x0, x1, z0, z1, g) { // a box in the group's own frame, as a world-space solid (the groups only turn, never scale)
    const c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y), xs = [], zs = [];
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) { xs.push(g.position.x + x * c + z * s); zs.push(g.position.z - x * s + z * c); }
    return deps.solid(Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs));
  }
  function prop(key, g) {
    if (key === 'truus') { // kitchen chair and the geraniums
      const w = M(0x8a6a44); box(0.48, 0.05, 0.46, w, 0, 0.46, -0.05, g); box(0.46, 0.5, 0.05, w, 0, 0.74, -0.27, g);
      for (const [x, z] of [[-0.2, 0.15], [0.2, 0.15], [-0.2, -0.25], [0.2, -0.25]]) box(0.04, 0.46, 0.04, w, x, 0.23, z, g);
      for (const x of [0.75, 1.05]) { cyl(0.13, 0.1, 0.22, M(0xb85a32), x, 0.11, -0.3, g); cyl(0.17, 0.17, 0.16, M(0x3a7a2a), x, 0.3, -0.3, g); box(0.08, 0.06, 0.08, M(0xe8343a), x + 0.04, 0.4, -0.27, g); }
    } else if (key === 'haring') { // the cart with its sign and the tricolour
      box(1.7, 0.85, 0.75, M(0x8a5a32), 0, 0.62, 0.62, g); box(1.75, 0.06, 0.8, M(0xd8d4cc), 0, 1.07, 0.62, g);
      const sg = new deps.THREE.Mesh(new deps.THREE.PlaneGeometry(1.5, 0.4), lam({ map: deps.signTex([{ t: 'HOLLANDSE NIEUWE', size: 40 }, { t: 'HARING', size: 64 }], '#f4f2ec', '#1a3a8a', 512, 160) }));
      sg.position.set(0, 0.66, 1.0); sg.rotation.y = 0; g.add(sg);
      for (const x of [-0.6, 0.6]) cyl(0.2, 0.2, 0.06, M(0x2a2a2a), x, 0.2, 1.0, g, 12).rotation.z = Math.PI / 2;
      cyl(0.015, 0.015, 0.7, M(0xcccccc), 0.78, 1.42, 0.85, g); box(0.02, 0.1, 0.24, M(0xae1c28), 0.78, 1.72, 0.97, g); box(0.02, 0.1, 0.24, M(0xf4f2ec), 0.78, 1.62, 0.97, g); box(0.02, 0.1, 0.24, M(0x21468b), 0.78, 1.52, 0.97, g);
      solidL(-0.9, 0.9, 0.2, 1.05, g);
    } else if (key === 'bram') { // the bakfiets: cargo box in front, a toddler under a blanket, the tin
      box(0.8, 0.45, 0.62, M(0x8a5a32), 0, 0.5, 0.95, g); box(0.5, 0.18, 0.5, M(0x4a8ad8), -0.12, 0.72, 0.95, g); cyl(0.11, 0.11, 0.1, M(0xf0c8a8), -0.12, 0.84, 0.75, g, 10);
      cyl(0.11, 0.11, 0.26, M(0xc8ccd0), 0.2, 0.86, 0.95, g, 12);
      for (const z of [0.95, -0.5]) cyl(0.3, 0.3, 0.05, M(0x1a1a1a), 0, 0.3, z, g, 14).rotation.z = Math.PI / 2;
      box(0.06, 0.06, 1.4, M(0x2a2a2a), 0, 0.42, 0.25, g); box(0.5, 0.04, 0.04, M(0x9a9a9a), 0, 1.05, -0.05, g);
      solidL(-0.45, 0.45, -0.75, 1.3, g);
    } else if (key === 'sjonnie') { // shopping trolley full of bottles
      const wire = M(0xb8bcc0); box(0.6, 0.45, 0.8, lam({ color: 0xb8bcc0, transparent: true, opacity: 0.45 }), 0.75, 0.75, 0.2, g);
      for (const [x, z] of [[0.5, -0.15], [1.0, -0.15], [0.5, 0.55], [1.0, 0.55]]) cyl(0.05, 0.05, 0.04, M(0x1a1a1a), x, 0.06, z, g, 8).rotation.z = Math.PI / 2;
      box(0.04, 0.5, 0.04, wire, 0.48, 0.3, 0.2, g); box(0.04, 0.5, 0.04, wire, 1.02, 0.3, 0.2, g);
      for (const [x, z] of [[0.62, 0.05], [0.9, 0.35], [0.75, 0.25]]) { const b = new deps.THREE.Mesh(new deps.THREE.SphereGeometry(0.24, 10, 8), lam({ color: 0xeef4f6, transparent: true, opacity: 0.8 })); b.position.set(x, 1.08, z); g.add(b); }
      solidL(0.4, 1.1, -0.25, 0.65, g);
    } else if (key === 'visser') { // clipboard: in her hand, so nothing on the ground
    } else if (key === 'lotte') { // ring light on a stand
      cyl(0.02, 0.02, 1.5, M(0x1a1a1a), 0.7, 0.75, 0.3, g); const ring = new deps.THREE.Mesh(new deps.THREE.TorusGeometry(0.22, 0.03, 8, 24), lam({ color: 0xffffff, emissive: 0xfff2e0 })); ring.position.set(0.7, 1.6, 0.3); g.add(ring);
    } else if (key === 'dirk') { // the street organ: a painted cabinet on a cart, pipes in the middle
      box(1.9, 1.6, 0.9, M(0xe8d8a8), -1.5, 1.1, 0, g); box(2.0, 0.12, 1.0, M(0x2a6a4a), -1.5, 0.28, 0, g);
      box(1.7, 0.25, 0.92, M(0x3a8a6a), -1.5, 1.95, 0, g); box(0.9, 0.7, 0.04, M(0xc89a4a), -1.5, 1.15, -0.46, g);
      for (let i = 0; i < 7; i++) cyl(0.035, 0.035, 0.3 + i * 0.05, M(0xd8a858), -1.84 + i * 0.11, 1.1, -0.49, g, 6);
      for (const x of [-2.25, -0.75]) { box(0.14, 1.3, 0.14, M(0xd85a5a), x, 1.1, -0.46, g); }
      for (const x of [-2.2, -0.8]) cyl(0.3, 0.3, 0.08, M(0x1a1a1a), x, 0.3, 0.5, g, 14).rotation.z = Math.PI / 2;
      solidL(-2.5, -0.5, -0.5, 0.5, g);
    } else if (key === 'rinus') { // blue scooter with a rusty toolbox on the back
      box(0.36, 0.42, 1.3, M(0x2a4a9a), 0.8, 0.5, 0, g); box(0.3, 0.12, 0.55, M(0x1a1a1a), 0.8, 0.78, -0.18, g);
      box(0.42, 0.28, 0.32, M(0x7a5a3a), 0.8, 0.98, -0.5, g); box(0.06, 0.55, 0.06, M(0x2a2a2a), 0.8, 0.95, 0.55, g); box(0.5, 0.04, 0.04, M(0x2a2a2a), 0.8, 1.2, 0.55, g);
      for (const z of [-0.5, 0.55]) cyl(0.2, 0.2, 0.1, M(0x1a1a1a), 0.8, 0.2, z, g, 12).rotation.z = Math.PI / 2;
      solidL(0.55, 1.05, -0.75, 0.8, g);
    }
  }

  for (const c of CAST) {
    const g = new deps.THREE.Group(); g.position.set(c.at[0], 0, c.at[1]); g.rotation.y = c.face; scene.add(g);
    const p = deps.makePerson(c.look, 1); g.add(p); prop(c.key, g);
    if (c.sits && deps.sit) { p.position.set(0, 0, -0.05); deps.sit(p, 0.5); }
    const r = { ...c, g, p, home: 0, n: 0 }; people.push(r);
    deps.addInteract({ obj: p, pos: () => g.position, r: 1.9, enabled: () => g.visible && !deps.busy(), label: () => `Talk to ${c.name}`, act: () => talk(r) });
  }

  // ---- what each of them does
  const say = (r, lines, done) => deps.dialogue(lines.map((l) => (Array.isArray(l) ? l : [r.name, l])), done);
  const E = 'Eddy Jr.';
  function nextJoint() { const id = deps.nextJoint && deps.nextJoint(), L = deps.levels(); return id && L[id] ? { id, def: L[id] } : null; }
  const jointName = (def) => (def.text && def.text.banner ? def.text.banner[0] : def.id).replace(/\b(\w)(\w*)/g, (m, a, b) => a + b.toLowerCase());

  const ACT = {
    truus(r) {
      if (usedToday('truus')) return say(r, [pick(r.hi), 'Come back tomorrow. I tell one thing a day. Otherwise people stop listening.']);
      use('truus'); say(r, [pick(r.hi), [E, 'Anything new, Tante Truus?'], 'Listen. ' + pick(TRUUS_TIPS)]);
    },
    haring(r) {
      if (S().haring) return say(r, ['You already had one. Your next fight, you\'ll feel it. Herring makes you strong.']);
      deps.choice(r.name, `${pick(r.hi)} <b>Broodje haring, W 4.</b> Eat it and your next raid you'll heal faster.`, ['Broodje haring (W 4)', 'No thanks'], (i) => {
        if (i !== 0 || !pay(4)) return; S().haring = 1; deps.save(); deps.beep(660, 0.08, 'triangle', 0.05);
        say(r, ['Head back. Tail in. Good boy. Now go and beat somebody.']); deps.toast('BROODJE HARING', 'Next raid: you heal much faster.', 2.4);
      });
    },
    bram(r) {
      if (job) return say(r, ['Go go go! The tin! Before she wakes up!']);
      if (usedToday('bram')) return say(r, ['She slept the whole way. You\'re a hero. Same time tomorrow?']);
      const shops = deps.shopSpots ? deps.shopSpots() : []; const to = shops.length ? pick(shops) : null;
      if (!to) return say(r, [pick(r.hi)]);
      deps.choice(r.name, `${pick(r.hi)} Can you take this spice tin to <b>${to.name}</b>? If I ride over there she wakes up. You have <b>60 seconds</b>. W 120.`, ['Give me the tin', 'Not now'], (i) => {
        if (i !== 0) return; use('bram'); job = { to, t: 60 }; if (deps.point) deps.point(to.x, to.z, to.name);
        deps.toast('THE SPICE TIN', `Run it to ${to.name}. 60 seconds.`, 2.2);
      });
    },
    sjonnie(r) {
      const nj = nextJoint();
      deps.choice(r.name, `${pick(r.hi)} <b>A rumour? W 15.</b>`, ['Pay W 15', 'No'], (i) => {
        if (i !== 0 || !pay(15)) return;
        if (!nj) return say(r, ['Nothing, Eddy. All quiet. You took everything. Keep the change. No, I keep the change.']);
        const t = nj.def.text || {}, tip = t.tips && t.tips.length ? pick(t.tips) : 'They keep the good stuff in the back.';
        say(r, [`${jointName(nj.def)}. That's where you're going next, right? I collect there on Tuesdays.`, (t.bossDown ? `The boss there is ${t.bossDown[0].replace(/ IS DOWN$/, '').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase())}. ` : '') + tip, [E, 'Sjonnie, you\'re worth every cent.'], 'Fifteen cents. A bottle. I know what I\'m worth.']);
      });
    },
    visser(r) {
      if (usedToday('visser')) return say(r, ['I have written it down. It is in the folder.']);
      deps.choice(r.name, `${pick(r.hi)} The trucks, the forklift, the smell of komijn in my curtains. What are you going to do about it?`, ['Flowers from Henny, sorry (W 10)', 'Mevrouw, go home'], (i) => {
        use('visser');
        if (i === 0 && pay(10)) { deps.rep(4, 'flowers for Mevrouw Visser'); say(r, ['...Tulips. Yellow. Yellow means sorry.', 'Fine. I will tell the VvE you are a polite young man. This time.']); }
        else { deps.rep(-3, 'brushed off the VvE'); say(r, ['GO HOME? I am going home. To write a letter. To everyone.']); }
      });
    },
    lotte(r) {
      if (state.armed) { use('lotte'); deps.rep(-3, 'Lotte filmed the Maboota'); return say(r, ['Oh. My. God. Guys. GUYS. He has a truncheon.', 'This is going straight on my story. Wijkagent Bakker follows me, by the way.']); }
      if (usedToday('lotte')) return say(r, ['You\'re in my last video! Twelve views. Eleven were me.']);
      deps.choice(r.name, `${pick(r.hi)} Can you do a little dance? Or just point at the camera and say "spice".`, ['Point and say "SPICE"', 'No cameras'], (i) => {
        use('lotte');
        if (i === 0) { deps.rep(2, 'went viral (a bit) with Lotte'); deps.beep(880, 0.06, 'triangle', 0.04); say(r, ['Iconic. ICONIC. Eddy the Spice Guy, guys. Link in bio.']); }
        else say(r, ['Mysterious. The chat loves mysterious.']);
      });
    },
    dirk(r) {
      deps.choice(r.name, `${pick(r.hi)}`, ['Tip him (W 5)', 'Walk on'], (i) => {
        if (i !== 0 || !pay(5)) return;
        if (deps.music) deps.music();
        if (!usedToday('dirk')) { use('dirk'); deps.rep(1, 'tipped the organ man'); }
        say(r, ['Dank je wel, jongen! This one is for you.']); deps.toast('DE GOUDEN ENGEL', 'Dirk winds up the organ.', 2);
      });
    },
    rinus(r) {
      const nj = nextJoint();
      deps.choice(r.name, `${pick(r.hi)} <b>W 40</b> and I tell you the way in nobody watches.`, ['Pay W 40', 'Use the front door'], (i) => {
        if (i !== 0 || !pay(40)) return;
        if (!nj) return say(r, ['You own every lock in town, Eddy. Nothing left to pick.']);
        const sd = nj.def.side, nm = jointName(nj.def);
        say(r, sd ? [`${nm}. Round the east side there's ${/^[aeiou]/i.test(sd.name) ? 'an' : 'a'} ${String(sd.name).toLowerCase()}. Nobody watches it.`, 'Go in there before anybody has seen you and you walk in like you own the place. Which you will.'] : [`${nm} has no back door. I checked. Twice.`, 'Front door, then. Kick it hard: a fast door knocks them flat.']);
      });
    },
  };
  function talk(r) { r.g.rotation.y = Math.atan2(player.position.x - r.g.position.x, player.position.z - r.g.position.z); ACT[r.key](r); }

  // ---- Bram's running job
  let job = null;
  function jobTick(dt) {
    if (!job || deps.busy()) return;
    job.t -= dt;
    if (Math.hypot(player.position.x - job.to.x, player.position.z - job.to.z) < 2.6) {
      const to = job.to; job = null; if (deps.clearPoint) deps.clearPoint(); deps.addMoney(120); deps.rep(3, 'ran Bram\'s spice tin');
      deps.dialogue([[to.name, 'The tin from Bram? Thank you, schat.'], ['Bram met de Bakfiets (telefoon)', 'She\'s still asleep! You legend. W 120 is on its way.']]); return;
    }
    if (job.t <= 0) { job = null; if (deps.clearPoint) deps.clearPoint(); deps.dialogue([['Bram met de Bakfiets (telefoon)', 'She\'s awake. She\'s screaming. I\'m screaming. Keep the tin, Eddy. Never mind.']]); return; }
    if (Math.ceil(job.t) !== Math.ceil(job.t + dt) && Math.ceil(job.t) % 10 === 0) deps.toast(`${Math.ceil(job.t)} S`, `The tin to ${job.to.name}`, 1.2);
  }

  function update(dt) {
    jobTick(dt);
    const busy = deps.busy();
    for (const r of people) { const vis = !busy; if (r.g.visible !== vis) r.g.visible = vis; }
    if (busy) return;
    for (const r of people) {
      const dx = player.position.x - r.g.position.x, dz = player.position.z - r.g.position.z, d2 = dx * dx + dz * dz;
      if (d2 > 900) continue;
      const want = d2 < 12 ? Math.atan2(dx, dz) - r.g.rotation.y : 0; // turn the head-and-body (not the props) to Eddy
      r.p.rotation.y += Math.atan2(Math.sin(want - r.p.rotation.y), Math.cos(want - r.p.rotation.y)) * Math.min(1, dt * 4);
      if (!r.sits) deps.animate(r.p, dt);
    }
  }
  // a broodje haring helps the raid you go into next (js/mission.js reads it as the 'medic' perk)
  const haringOn = () => !!(state.vaste && state.vaste.haringRaid);
  function raidStart() { const s = S(); s.haringRaid = s.haring ? 1 : 0; s.haring = 0; }
  return { people, update, raidStart, haringOn, talk, get job() { return job; } };
}
