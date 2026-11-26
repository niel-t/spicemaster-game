// The people behind the counters of Kipkruidenkwartier (js/buurt.js): one character for every shop that had no face yet,
// on both sides of the canal, and a doorman for Hotel Kaasland. Each has a look of their own (js/characters.js fields),
// stands by their shop door, turns to Eddy when he comes near and has a few things to say. On a closing day (the weekday
// from js/kaasweer.js) the shopkeeper stays home. Some of them know things: Fatima the barber calls tomorrow's weather,
// Annie the baker watches the kaneel price, Ravi counts the days.
import { hex01 } from './characters.js';
import { BIZ } from './buurt.js';

const rgb = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const mk = (o) => ({ tex: 512, skin: hex01(o.skin), hair: o.hair == null ? null : hex01(o.hair), hs: o.hs || 'normal', calm: o.calm ?? 0.8, smile: o.smile ?? 1, body: o.body || 'slim', B: { nowatch: !o.watch },
  ...(o.fem ? { fem: 1 } : {}), ...(o.beard != null ? { beard: hex01(o.beard), fluff: o.fluff ? 1 : 0 } : {}), ...(o.stubble ? { stubble: 1 } : {}), ...(o.stache ? { stache: 1 } : {}), ...(o.glasses ? { glasses: 1 } : {}),
  ...(o.hat ? { hat: o.hat, hatC: hex01(o.hatC ?? 0x1a1a1a) } : {}), ...(o.watch ? { watch: 1 } : {}), ...(o.heels ? { heels: 1 } : {}), ...(o.skirt != null ? { skirt: hex01(o.skirt) } : {}),
  shirt: hex01(o.shirt), jacket: hex01(o.jacket ?? o.shirt), pants: hex01(o.pants), shoes: hex01(o.shoes ?? 0x1a1410), tee: 1,
  shirtPaint: { shirt: rgb(o.shirt), pants: rgb(o.pants), skin: rgb(o.under ?? o.skin), belt: rgb(o.belt ?? 0x1a1410), vDepth: o.v ?? 1.4, chain: !!o.chain, sleeves: o.sleeves || 'long', buttons: !!o.buttons } });

// biz: the shop they belong to; at: where along the shop front they stand (0 = left corner, 1 = right); scale: height
export const KEEPERS = [
  { biz: 'hotel', name: 'Portier Willem', at: 0.5, scale: 1.04, col: '#1f7a5e',
    look: mk({ skin: 0xe8c0a0, hair: 0x8a8a86, hs: 'slick', stache: 1, body: 'stocky', hat: 'peaked', hatC: 0x0f4a3a, shirt: 0x0f4a3a, pants: 0x0f4a3a, under: 0xf4f2ec, buttons: 1, shoes: 0x0a0a0a, calm: 1 }),
    lines: ['Welcome to Hotel Kaasland, meneer. Checking in? No? Then please don\'t lean on the brass.', 'Room 7 has the canal view. If you stand on the bed. On your toes.', 'Twenty-two years on this door. I have carried four thousand wheelie cases. I counted.', 'Your father once parked the Oofmobiel in our taxi bay. For a week.'] },
  { biz: 'bitterbal', name: 'Tante Riek', at: 0.2, scale: 0.9, col: '#b8651e',
    look: mk({ fem: 1, skin: 0xf0c8a8, hair: 0xd8d4cc, hs: 'big', glasses: 1, body: 'fat', shirt: 0xf4f0e6, jacket: 0xf4f0e6, pants: 0x3a3a40, skirt: 0x3a3a40, sleeves: 'short', calm: 1 }),
    lines: ['Eight bitterballen, W 5, mustard is free. The fryer has been on since 1983, jongen. Never switched it off.', 'You\'re Freddy\'s boy! You look thin. Here, eat. No, eat.', 'They\'re hot inside. Everybody knows. Everybody burns their mouth anyway.', 'Closed on Monday. On Monday I fry for myself.'] },
  { biz: 'kapsalon', name: 'Fatima', at: 0.85, scale: 0.92, col: '#3a5aa0', knows: 'weather',
    look: mk({ fem: 1, skin: 0xc89070, hair: 0x1a1410, hs: 'long', body: 'slim', shirt: 0x1d2a4a, pants: 0x1a1a1e, sleeves: 'short', heels: 1, calm: 0.5 }),
    lines: ['Knippen W 15, beard W 5. And you hear everything first. That part is free.', 'That hair, Eddy. Who did that to you? Sit down. No? Tomorrow then.', 'I know who parks where, who owes who and who is seeing who. Ask me nothing, I\'ll tell you anyway.'] },
  { biz: 'avond', name: 'Ravi', at: 0.15, scale: 0.98, col: '#e8202a', knows: 'day',
    look: mk({ skin: 0xa8704a, hair: 0x0d0b0a, hs: 'normal', stubble: 1, glasses: 1, body: 'slim', shirt: 0xc81a24, pants: 0x2a2c34, sleeves: 'short', calm: 0.3 }),
    lines: ['Altijd Open, my friend! Except when I sleep. I sleep from one to four. In the afternoon.', 'Crisps, cola, batteries, one onion. Somebody always needs one onion.', 'You work nights too? Then we are colleagues. Colleague discount: zero percent.'] },
  { biz: 'fiets', name: 'Wim', at: 0.85, scale: 1.0, col: '#1f6a44',
    look: mk({ skin: 0xe4b896, hair: 0xb8a078, hs: 'curly', beard: 0xa89068, fluff: 1, body: 'big', hat: 'beanie', hatC: 0x1f6a44, shirt: 0x3a5a7a, pants: 0x2a3a50, sleeves: 'short', calm: 1 }),
    lines: ['Flat tyre? Four minutes. But first I have to tell you about the tyre I fixed in 1996.', 'A bike without a bell is a weapon, jongen. A bike with a bell is also a weapon.', 'Everything rusts here. The air is half canal. Good for business.', 'That Oofmobiel of yours takes up six bikes of parking. I\'m just saying.'] },
  { biz: 'bakker', name: 'Annie', at: 0.15, scale: 0.9, col: '#c8873a', knows: 'kaneel',
    look: mk({ fem: 1, skin: 0xf2c8a8, hair: 0xb86a2a, hs: 'big', body: 'stocky', hat: 'chef', shirt: 0xfbf6ea, jacket: 0xfbf6ea, pants: 0x8a4a12, skirt: 0x8a4a12, sleeves: 'short' }),
    lines: ['Up at four, every day. The appeltaart comes out at seven. By eight it\'s gone.', 'A krentenbol for the road? You need it. Look at you.', 'My speculaas needs good kaneel. Not that dusty Lampas stuff. You know a supplier?'] },
  // across the canal, on the Kipkruidenkade
  { biz: 'bloem', name: 'Henny', at: 0.5, out: 1.5, scale: 0.92, col: '#c8102e',
    look: mk({ fem: 1, skin: 0xeec0a0, hair: 0xe8c46a, hs: 'long', body: 'slim', hat: 'beanie', hatC: 0xc8102e, shirt: 0x2f8a3a, jacket: 0x2f8a3a, pants: 0x3a4a6a, sleeves: 'long' }),
    lines: ['Ten tulips for W 5! For your mother. You do have a mother? Then twenty.', 'In winter they come from a greenhouse. Don\'t tell the tourists.', 'Red means love, yellow means sorry, white means I forgot your birthday.', 'My hands are always cold. Thirty years of buckets.'] },
  { biz: 'kaas', name: 'Gerard', at: 0.15, scale: 1.02, col: '#c88a0a',
    look: mk({ skin: 0xf0c4a2, hair: 0xd8d2c4, hs: 'slick', stache: 1, glasses: 1, body: 'fat', shirt: 0xfbf6ea, jacket: 0xf6c12a, pants: 0x3a2412, buttons: 1, calm: 1 }),
    lines: ['Jong, belegen, oud. Taste first, young man. Then taste again. Then buy.', 'A tourist asked me for cheese "without the smell". I showed him the door. It also smells.', 'Your father paid me in komijn once. Best komijnekaas I ever made.', 'Closed on Monday. The cheese needs rest. So do I.'] },
  { biz: 'bel', name: 'Yusuf', at: 0.15, scale: 0.97, col: '#5a2ad8',
    look: mk({ skin: 0xc09068, hair: 0x14100c, hs: 'buzz', stubble: 1, body: 'slim', shirt: 0x5a2ad8, jacket: 0x2a1a5a, pants: 0x1a1a22, shoes: 0xe8e8e8, watch: 1, chain: 1, calm: 0.2 }),
    lines: ['Screen broken? One hour. Water damage? One hour. Fell in the canal? ...One day.', 'That Shmokia in the window, bro. Eleven years. Battery still full.', 'Prepaid, covers, chargers. Everything original. Mostly original.', 'Your friend Razim owes me for three covers. Tell him.'] },
  { biz: 'was', name: 'Mevrouw Bos', at: 0.85, scale: 0.88, col: '#2a8ad8',
    look: mk({ fem: 1, skin: 0xe8c4ac, hair: 0xc8c8c4, hs: 'normal', glasses: 1, body: 'stocky', shirt: 0xbfe0ff, jacket: 0x7ab0e0, pants: 0x4a4a52, skirt: 0x4a4a52, sleeves: 'long', calm: 1, smile: 0 }),
    lines: ['Six machines. Four work. Don\'t use number three, it eats socks.', 'I fold for people I like. I haven\'t decided about you.', 'Spice stains. Paprika, kurkuma. I know exactly what you do for a living, jongeman.', 'Washing W 4, drying W 2. Exact change. I am not a bank.'] },
  { biz: 'habibi', name: 'Mo van Habibi', at: 0.85, scale: 1.0, col: '#0c5a40',
    look: mk({ skin: 0xb88058, hair: 0x0d0b0a, hs: 'slick', beard: 0x14100c, body: 'big', shirt: 0x0c5a40, pants: 0x1a1a1e, sleeves: 'short', chain: 1 }),
    lines: ['Habibi! Come eat! Kapsalon W 7,50, biggest in Kaasland. I measured.', 'I buy my spice where it\'s cheapest, my friend. Make me an offer I can taste.', 'Not Monteur Mo. Everybody asks. He fixes machines, I fix hunger.', 'Schmatzel across the water? Good man. Small portions.'] },
  { biz: 'reis', name: 'Sandra', at: 0.85, scale: 0.94, col: '#ff8a1c',
    look: mk({ fem: 1, skin: 0xd8a078, hair: 0x3a2418, hs: 'long', body: 'slim', shirt: 0xff8a1c, jacket: 0x1a2a5a, pants: 0x1a2a5a, skirt: 0x1a2a5a, heels: 1, buttons: 1 }),
    lines: ['Seven nights Costa del Kaas from W 299! Sun guaranteed. Mostly guaranteed.', 'I booked your father\'s trip. One way. He said he\'d send a card.', 'Everybody here wants to leave when it rains. It always rains. Business is wonderful.', 'I have never been to Costa del Kaas myself. I hear it\'s lovely.'] },
  { biz: 'makelaar', name: 'Mr. Duur', at: 0.15, scale: 1.06, col: '#d8b040',
    look: mk({ skin: 0xf0c8aa, hair: 0x2a2018, hs: 'slick', body: 'slim', shirt: 0x16161a, jacket: 0x16161a, pants: 0x16161a, under: 0xf6f6f2, buttons: 1, watch: 1, shoes: 0x3a2412, calm: 1, smile: 0 }),
    lines: ['Eighteen square metres, W 495.000. Charming. The bed folds into the kitchen.', 'I see a young entrepreneur. I see a mortgage. Shall we talk?', 'That shed of yours across the water? "Authentic industrial loft." I could get a million.', 'Viewings at nine. Forty people per viewing. Bring your payslip and your parents.'] },
];
const WEATHER_SAY = { zon: 'sun', bewolkt: 'grey and dry', motregen: 'that fine drizzle', buien: 'showers, bring a coat', storm: 'a storm, stay off the bridges', mist: 'fog as thick as pea soup', vorst: 'frost, the canals will creak', sneeuw: 'snow', hitte: 'a heatwave, God help us' };

export function createBuurtFolk(deps) {
  const { scene, player } = deps, byId = Object.fromEntries(BIZ.map((b) => [b.id, b]));
  const folk = [];
  for (const k of KEEPERS) {
    const b = byId[k.biz]; if (!b || b.x0 == null) continue;
    const far = b.side === 's', p = deps.makePerson(k.look, k.scale);
    const x = b.x0 + 0.7 + (b.x1 - b.x0 - 1.4) * k.at, z = far ? deps.far.front - (k.out || 0.95) : -6.5 + (k.out || 0.6);
    p.position.set(x, 0, z); p.rotation.y = far ? Math.PI : 0; scene.add(p);
    const f = { ...k, b, p, home: p.rotation.y, n: 0, met: false }; folk.push(f);
    deps.addInteract({ obj: p, pos: () => p.position, r: 1.7, enabled: () => p.visible && !deps.busy(), label: () => `Talk to ${k.name} · ${b.short || b.name}`, act: () => talk(f) });
  }
  function extra(f) { // what some of them know
    const W = deps.world && deps.world(); if (!W) return null;
    if (f.knows === 'weather') { const t = W.weather(W.cal().d + 1); return `My knee says tomorrow: ${WEATHER_SAY[t.id] || t.name}. My knee is never wrong.`; }
    if (f.knows === 'day') { const c = W.cal(); return `It's ${c.wdName}, day ${c.d}. I know because I never close. ${c.holi ? c.holi.name + ' today! Double the cola.' : 'The nights all look the same.'}`; }
    if (f.knows === 'kaneel') { const s = W.cal().season.id; return s === 'winter' ? 'It\'s speculaas season. Everybody wants kaneel, so the price goes up. If you have some on the shelf, now is the time.' : 'Come winter the whole street smells of speculaas. Buy your kaneel before that, it only gets dearer.'; }
    return null;
  }
  function talk(f) { // business first (js/winkels.js: a klusje, or their weekly order), small talk from the menu
    f.p.rotation.y = Math.atan2(player.position.x - f.p.position.x, player.position.z - f.p.position.z);
    if (deps.serve && deps.serve(f)) return;
    chat(f);
  }
  function chat(f) {
    const ex = (!f.met || f.n % 3 === 2) ? extra(f) : null, line = f.lines[f.n % f.lines.length]; f.n++; f.met = true;
    deps.dialogue(ex ? [[f.name, line], [f.name, ex]] : [[f.name, line]]);
  }
  let seenDay = -1;
  function update(dt) {
    const W = deps.world && deps.world(), d = W ? W.cal().d : 1;
    if (d !== seenDay) { seenDay = d; const wd = W ? W.cal().wd : 0; for (const f of folk) f.p.visible = f.b.open.includes(wd); } // closing day: nobody at the door
    if (deps.openNow) for (const f of folk) { const o = f.inside || deps.openNow(f.biz, f.b.open, W ? W.cal().wd : 0); if (f.p.visible !== o) f.p.visible = o; } // and outside their hours (js/klok.js)
    if (deps.busy()) return;
    for (const f of folk) {
      if (!f.p.visible) continue;
      const dx = player.position.x - f.p.position.x, dz = player.position.z - f.p.position.z, d2 = dx * dx + dz * dz;
      if (d2 > 1600) continue; // far away: no need to breathe
      const want = d2 < 16 ? Math.atan2(dx, dz) : f.home; // turn to Eddy when he walks up
      f.p.rotation.y += Math.atan2(Math.sin(want - f.p.rotation.y), Math.cos(want - f.p.rotation.y)) * Math.min(1, dt * 4);
      deps.animate(f.p, dt);
    }
  }
  return { folk, update, talk, chat };
}
