// The people of Kipkruidenkwartier who give Eddy Jr. ideas for the spice war.
// Each one turns up when the story is ready for them, talks in their own voice and writes an idea into the
// Ideeënboek (js/economy.js IDEAS), which unlocks or improves an economy system. Original parody characters,
// built on the same character engine as the rest of the cast (makePerson in main.js).

export function initNpcs(d) {
  const { tutorial, THREE, scene, makePerson, addInteract, dialogue, choice, toast, state, econ, player, addMoney, animate, solid, owns, mission, sit, rankOf } = d;
  const rank = () => rankOf(econ.ensure().rep).i;
  const met = (id) => !!(state.npcs && state.npcs[id]);
  const meet = (id) => { state.npcs = state.npcs && typeof state.npcs === 'object' ? state.npcs : {}; state.npcs[id] = true; };
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const name = (id) => econ.INGREDIENTS.find((g) => g.id === id).name;
  const B = () => econ.ensure().blends;

  const CAST = [
    { // Shooki: the cousin (Game Bible idea, Drive 06_Shooki)
      id: 'shooki', who: 'Shooki', label: 'Talk to cousin Shooki',
      look: { front: '#1e1f24a', shirt: 0x1e1f24, apron: 0x3a4248, pants: 0x34343a, head: { skin: 0xc8946c, hair: '#2a2420', brow: '#1a1410', hairLine: 64, mouth: 'laugh', iris: '#3a2a1a', beard: '#3a3430' }, belly: 0.3, skin: 0xc8946c }, // black tee, worn denim apron, stubble (assets/face_shooki.jpg)
      pos: () => (state.district1 && met('shooki') ? [8.3, -8.7, Math.PI * 0.8] : met('shooki') ? [-0.6, -8.6, Math.PI] : [3.2, -5.6, 0]), // by his Kangoo once the district is Eddy's
      show: () => met('shooki') || owns('spekbuurt') || (state.step === 'free' && tutorial && tutorial.at('shooki')),
      news: () => !met('shooki') || (owns('spekbuurt') && !econ.has('koerier')) || (!!state.district1 && !state.npcs.kangoo),
      talk() {
        if (!met('shooki') && tutorial && tutorial.at('shooki')) { meet('shooki'); return tutorial.shooki(() => d.save()); } // the tour starts here
        const tip = tutorial && tutorial.shookiTip(); if (tip) return dialogue([['Shooki', tip]]);
        if (met('shooki') && state.district1 && !state.npcs.kangoo) { // the first talk after the district falls: his new van
          state.npcs.kangoo = true;
          return dialogue([
            ['Shooki', 'Bro. BRO. Look outside. Next to your Oofmobiel.'],
            ['Eddy Jr.', 'Is that... a Renault Kangoo?'],
            ['Shooki', 'Renault Kangoo, diesel, two hundred eighty thousand kilometres, one owner. Well. Four owners. Now five.'],
            ['Shooki', 'The whole Kipkruidenkwartier is yours now, so your cousin needs a real company van. "Shooki Koerier, 24/7, familieprijs." I did the letters myself.'],
            ['Eddy Jr.', 'The K is backwards.'],
            ['Shooki', 'That is branding, bro. Hakan\'s kipkraud, the joints, the Klusbord jobs: Shooki delivers. Where Shooki is, the Kangoo is.'],
          ], () => { if (!econ.has('koerier')) econ.learn('koerier'); d.save(); });
        }
        if (met('shooki') && !econ.has('koerier') && owns('spekbuurt')) return dialogue([['Shooki', 'Bro! Spekbuurt! Respect. Now I run errands for you: pick-ups, drop-offs, whatever. Family price.'], ['Shooki', 'Every day I put one extra job on your Klusbord. You do the job, I take a little kebab. Deal? Deal.']], () => { econ.learn('koerier'); d.save(); });
        if (!met('shooki')) {
          meet('shooki');
          return dialogue([
            ['Shooki', 'Cousin! Eddy! I heard you took Spekbuurt. Respect, bro.'],
            ['Eddy Jr.', 'Shooki? Last time I saw you, you were selling ringtones.'],
            ['Shooki', 'Ringtones were the future, bro. Now spice is the future. I run errands for you: pick-ups, drop-offs, whatever. Family price.'],
            ['Shooki', 'Every day I put one extra job on your Klusbord. You do the job, I take a little kebab. Deal? Deal.'],
          ], () => { econ.learn('koerier'); d.save(); });
        }
        dialogue([['Shooki', rnd(['Bro, check the Klusbord. I found you something.', 'My second phone is for business. The first one is also for business.', 'Tante Gerda says hi. She says eat something.', 'I told the Lampas I am your cousin. They laughed. Then they stopped laughing.'])]]);
      },
    },
    { // Henk Cijfer: the accountant (Drive 03_Accountant)
      id: 'henk', who: 'Henk Cijfer', label: 'Talk to Henk Cijfer, bookkeeper',
      look: { front: '#1e2a46', shirt: 0x1e2a46, pants: 0x4a4a52, head: { skin: 0xeec4a4, hair: '#8a7658', brow: '#6a5a40', hairLine: 52, mouth: 'flat', glasses: true, iris: '#5a7a8a' }, belly: 0.3, skin: 0xeec4a4 }, // navy sweater, thin glasses (assets/face_henk.jpg)
      pos: () => [-13.6, -5.8, 0],
      show: () => met('henk') || state.money >= 5000,
      news: () => !met('henk'),
      talk() {
        if (!met('henk')) {
          meet('henk');
          return dialogue([
            ['Henk Cijfer', 'Excuse me. Eddy & Zn? Henk Cijfer, bookkeeper. I did your father\'s books for twenty-two years.'],
            ['Henk Cijfer', 'Your cash flow is... exciting. Too exciting. Let me help.'],
            ['Henk Cijfer', 'Spice prices aren\'t random. They only look random. I have a spreadsheet. From now on the Kruidenbeurs shows an arrow for every spice: up or down, tomorrow.'],
          ], () => { econ.learn('prognose'); d.save(); });
        }
        const ids = econ.INGREDIENTS.map((g) => g.id).sort((a, b) => Math.abs(econ.forecast(b)) - Math.abs(econ.forecast(a)));
        const id = ids[0], up = econ.forecast(id) > 0;
        dialogue([['Henk Cijfer', `${name(id)} goes ${up ? 'up' : 'down'} tomorrow. ${up ? 'Buy today.' : 'Wait a day.'} My spreadsheet is never wrong. Except in 1998.`]]);
      },
    },
    { // Slager Bram: the loyal butcher (Game Bible: loyal butcher perks)
      id: 'bram', who: 'Slager Bram', label: 'Talk to Slager Bram',
      look: { front: '#f2efe6a', shirt: 0xf2efe6, pants: 0x3a3a40, rolled: true, stache: true, head: { skin: 0xf0b898, bald: true, brow: '#8a5a3a', mouth: 'smile', iris: '#3a2a1a' }, belly: 1.4, scale: 1.12, skin: 0xf0b898 },
      pos: () => [5.6, 10.6, Math.PI],
      show: () => !!state.table,
      news: () => !met('bram') || (!econ.has('vasteklant') && (B().lams || { kg: 0 }).kg >= 10),
      talk() {
        if (econ.has('vasteklant')) return dialogue([['Slager Bram', `Trust ${econ.trustOf('bram')}. ${econ.trustOf('bram') >= 70 ? 'My Bio man gives you a price now. Tell him Bram sent you.' : 'Keep the spice coming and my Bio man will give you a price.'}`]]);
        const L = B().lams;
        if (L && L.kg >= 10) {
          if (L.q < 2.5) return dialogue([['Slager Bram', '*sniffs* ... Flour. Lampas flour. Three stars, jongen, or don\'t come back.']]);
          L.kg -= 10; if (L.kg <= 0) delete B().lams; meet('bram');
          return dialogue([
            ['Slager Bram', '*sniffs* ... *sniffs again* ... THIS. This is the smell of 1989.'],
            ['Slager Bram', 'From now on you supply my shop. Ten kilo a day. Keep me happy and my Bio supplier gives you a price.'],
          ], () => { econ.learn('vasteklant'); d.save(); });
        }
        meet('bram');
        dialogue([
          ['Slager Bram', 'You\'re Eddy\'s boy? Your father\'s lamb spice made grown men cry. My men cried. I cried.'],
          ['Slager Bram', 'Bring me 10 kg of Lams Shoarma. Three stars, no Lampas flour. Then we talk business.'],
        ]);
      },
    },
    { // Ome Joop: Eddy Sr.'s old grinder, keeper of the notebook (Game Bible: Eddy Sr.'s notebook)
      id: 'joop', who: 'Ome Joop', label: 'Talk to Ome Joop', seated: true,
      look: { front: '#6a5040', shirt: 0x6a5040, pants: 0x4a4038, ballcap: 0x5a4a3a, head: { skin: 0xf0c8a8, hair: '#d8d4cc', brow: '#c8c4bc', hairLine: 80, mouth: 'smile', glasses: true, iris: '#4a6a8a' }, belly: 0.6, skin: 0xf0c8a8 },
      pos: () => [-6, 11.9, Math.PI],
      show: () => ['russian', 'free'].includes(state.step),
      page() { if (!econ.has('recept1')) return (state.district1 || rank() >= 1) ? 'recept1' : null; if (!econ.has('recept2')) return rank() >= 2 ? 'recept2' : null; if (!econ.has('gouden1')) return rank() >= 3 ? 'gouden1' : null; return null; },
      news() { return !met('joop') || !!this.page(); },
      talk() {
        if (!met('joop')) {
          meet('joop');
          return dialogue([
            ['Ome Joop', 'Eh? Speak up, my hearing aid is whistling. ... Eddy? Little Eddy\'s boy?'],
            ['Ome Joop', 'I ground spice for your father for forty years. Before the machines. Before the Lampas.'],
            ['Ome Joop', 'He left his notebook with me. Pages for the right man. Make a name for yourself, then come back.'],
            ...(tutorial && tutorial.at('joop') ? [['Eddy Jr.', 'A name? How?'], ['Ome Joop', 'Sell good spice. Take joints. Do the jobs on that Klusbord. Kaasland talks, and every Wilder you earn the honest way is reputation. Your rank is on the PC, under My Wilders.'], ['Ome Joop', 'Hulpje first. Then Mengmeester, Kruidenhandelaar, Kruidenbaron. Each rank, people trust you with more. Come back a Mengmeester, or with the whole Kipkruidenkwartier, and you get page one.']] : []),
          ], () => { if (tutorial) tutorial.metJoop(); d.save(); });
        }
        if (tutorial && tutorial.at('joop')) return dialogue([['Ome Joop', 'Shooki sent you? Good boy, Shooki. Listen: sell good spice, take joints, do the jobs on that Klusbord. Every honest Wilder is reputation. Your rank is on the PC, under My Wilders.'], ['Ome Joop', 'Hulpje first. Then Mengmeester, Kruidenhandelaar, Kruidenbaron. Come back a Mengmeester, or with the whole Kipkruidenkwartier, and you get page one of the notebook.']], () => { tutorial.metJoop(); d.save(); });
        const pg = this.page();
        const T = {
          recept1: [['Ome Joop', 'They say the Kipkruidenkwartier listens to you now. Hm. Here, page one. Slagerskruiden. The butchers will love you.']],
          recept2: [['Ome Joop', 'Kruidenhandelaar, they call you. Your father was one too. Page two: Shoarma Speciaal. Don\'t be stingy with the kardemom.']],
          gouden1: [['Ome Joop', 'Kruidenbaron. Then it is time.'], ['Ome Joop', 'The last page. De Gouden Mix. Your father never finished it. Read it slowly. Then go to the docks.']],
        };
        if (pg) return dialogue(T[pg], () => { econ.learn(pg); d.save(); });
        const need = !econ.has('recept1') ? 'the Kipkruidenkwartier is yours, or you are a Mengmeester' : !econ.has('recept2') ? 'you are a Kruidenhandelaar' : !econ.has('gouden1') ? 'you are a Kruidenbaron' : null;
        dialogue([['Ome Joop', need ? `Not yet, jongen. Come back when ${need}. The ducks and I are not going anywhere.` : rnd(['The ducks like your father\'s paprika. Don\'t tell anyone.', 'In my day a kilo of saffraan cost a bicycle. Now it costs a car.', 'Go to the docks, boy. That is where the Gouden Mix comes from.'])]]);
      },
    },
    { // Monteur Mo: Dad's machine man
      id: 'mo', who: 'Monteur Mo', label: 'Talk to Monteur Mo',
      look: { front: '#2a4a6a', shirt: 0x2a4a6a, pants: 0x2a4a6a, rolled: true, head: { skin: 0xc89070, hair: '#1a1410', brow: '#14100c', hairLine: 70, mouth: 'smile', iris: '#3a2a1a', beard: '#241c16' }, belly: 0.9, skin: 0xc89070 },
      pos: () => [31.5, -5.6, 0],
      show: () => met('mo') || Object.values(econ.ensure().installed || {}).some((a) => a.length),
      news: () => !met('mo'),
      talk() {
        if (!met('mo')) {
          meet('mo');
          return dialogue([
            ['Monteur Mo', 'You sold a grill to that joint? I can smell it from here. Good grill. Your father\'s kind of grill.'],
            ['Monteur Mo', 'People throw away broken machines all the time. Buy them for scrap on Kaasplaats, I fix them overnight. Then you sell them like new.'],
            ['Monteur Mo', 'No phone. You want me, you come here.'],
          ], () => { econ.learn('opknappen'); d.save(); });
        }
        const e = econ.ensure(), lack = econ.activeClients().find((c) => !(e.installed[c.id] || []).includes('grill'));
        dialogue([['Monteur Mo', lack ? `${lack.name} still has no döner grill. Put one in and they order forty percent more spice.` : rnd(['Every joint has a grill now. Your father would cry.', 'Bring me something broken. I get bored.'])]]);
      },
    },
    { // De Fluisteraar: the rumour man under the bridge
      id: 'fluist', who: 'De Fluisteraar', label: 'Talk to the man under the bridge',
      look: { suit: true, shirt: 0x2a2a28, pants: 0x2a2a28, feltHat: 0x1a1a1a, stache: true, head: { skin: 0xe0b090, hair: '#2a2a2a', brow: '#1a1a1a', slick: true, mouth: 'smile', iris: '#2a2a2a' }, belly: 0.3, skin: 0xe0b090 },
      pos: () => [11.0, 11.4, -Math.PI / 2],
      show: () => met('fluist') || econ.ensure().day >= 5,
      news: () => !met('fluist'),
      talk() {
        const e = econ.ensure();
        const offer = () => {
          if (e.whisperDay === e.day) return dialogue([['De Fluisteraar', `(whispers) Already told you. ${econ.rumour()}.`]]);
          choice('De Fluisteraar', '(whispers) Fifty Wilders and you hear what happens on the market tomorrow.', ['Pay W 50', 'Not now'], (i) => {
            if (i !== 0) return dialogue([['De Fluisteraar', '(whispers) Your loss.']]);
            if (state.money < 50) return dialogue([['De Fluisteraar', '(whispers) Fifty. Not forty-nine.']]);
            addMoney(-50); e.whisperDay = e.day; d.save();
            dialogue([['De Fluisteraar', `(whispers) ${econ.rumour()}.`]]);
          });
        };
        if (!met('fluist')) {
          meet('fluist');
          return dialogue([
            ['De Fluisteraar', '(whispers) psst... Eddy...'],
            ['Eddy Jr.', 'Why are you whispering? It\'s the middle of the day.'],
            ['De Fluisteraar', '(whispers) The market has ears. I hear what happens tomorrow, before it happens.'],
          ], () => { econ.learn('geruchten'); d.save(); offer(); });
        }
        offer();
      },
    },
    { // Kevin: a fed-up Lampas foot soldier
      id: 'kevin', who: 'Kevin', label: 'Talk to the Lampas on his break',
      look: { lampas: true, front: '#e8862c', shirt: 0xe8862c, pants: 0x2a2a30, ballcap: 0xe8862c, cigarette: true, head: { skin: 0xf4d2bc, hair: '#d8c080', brow: '#a89060', hairLine: 40, mouth: 'smile', iris: '#3a3a3a' }, belly: 0.4, skin: 0xf4d2bc },
      pos: () => [-30.5, -5.4, Math.PI / 2],
      show: () => met('kevin') || econ.ensure().heat.lampas >= 40,
      news: () => !met('kevin'),
      talk() {
        const offer = () => {
          const e = econ.ensure();
          choice('Kevin', `"${econ.kevinTip()}" ${e.kevinBribe ? 'And your next retake is a quiet night, like we said.' : 'W 300 and I tell the boys the next job is cancelled. Half of them stay home.'}`, e.kevinBribe ? ['Thanks, Kevin', 'Bye'] : ['Pay W 300', 'Not now'], (i) => {
            if (e.kevinBribe || i !== 0) return;
            const m = econ.bribeKevin(); dialogue([['Kevin', m || 'Nice. Your next retake: half the crew stays home. You never saw me.']]);
          });
        };
        if (!met('kevin')) {
          meet('kevin');
          return dialogue([
            ['Kevin', 'Yo. Don\'t hit me. I\'m on my break.'],
            ['Kevin', 'I\'m Lampas, yeah, but the boss pays me in expired frikandellen. I\'m done, bro.'],
            ['Kevin', 'I hear stuff. When they\'re coming for you, I\'ll tell you. Check your Dagrapport, I\'ll leave a note.'],
          ], () => { econ.learn('lampastips'); d.save(); offer(); });
        }
        offer();
      },
    },
  ];

  for (const c of CAST) {
    const p = makePerson({ ...c.look });
    p.visible = false; scene.add(p); c.p = p;
    c.solid = solid(0, 0, 0, 0); c.solid.off = true;
    if (c.seated) { sit(p); const bench = new THREE.Group(); const wood = new THREE.MeshLambertMaterial({ color: 0x6a4428 }), iron = new THREE.MeshLambertMaterial({ color: 0x222222 });
      const seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), wood); seat.position.y = 0.45; bench.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.06), wood); back.position.set(0, 0.75, -0.24); bench.add(back);
      for (const x of [-0.8, 0.8]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.45), iron); l.position.set(x, 0.22, 0); bench.add(l); }
      c.bench = bench; scene.add(bench); bench.visible = false; }
    addInteract({ obj: p, pos: () => p.position, r: 2.0, enabled: () => p.visible && !(mission && mission.active), label: () => c.label + (c.news && c.news.call(c) ? '  (!)' : ''), act: () => c.talk() });
  }
  function place(c) {
    const [x, z, r] = c.pos(); c.p.position.set(x, 0, z); c.p.rotation.y = r; c.home = r;
    Object.assign(c.solid, { minx: x - 0.3, maxx: x + 0.3, minz: z - 0.3, maxz: z + 0.3 });
    if (c.bench) { c.bench.position.set(x, 0, z + 0.05); c.bench.rotation.y = r + Math.PI; }
  }
  let t = 0;
  function update(dt) {
    t -= dt;
    if (t <= 0) { // visibility and spots are cheap to re-check twice a second
      t = 0.5;
      for (const c of CAST) {
        const on = !(mission && mission.active) && c.show();
        if (on) place(c);
        c.p.visible = on; c.solid.off = !on; if (c.bench) c.bench.visible = on;
      }
    }
    for (const c of CAST) {
      if (!c.p.visible) continue;
      const dx = player.position.x - c.p.position.x, dz = player.position.z - c.p.position.z;
      if (!c.seated) {
        const want = dx * dx + dz * dz < 16 ? Math.atan2(dx, dz) : c.home;
        c.p.rotation.y += Math.atan2(Math.sin(want - c.p.rotation.y), Math.cos(want - c.p.rotation.y)) * Math.min(1, dt * 3);
        animate(c.p, 0, dt);
      }
    }
  }
  return { CAST, update, meet, met };
}
