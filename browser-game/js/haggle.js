// Haggling: every deal with a real person is a little fight over the price.
// Customers in De Werkplaats always try to talk Eddy down; Eddy can hold firm, or claim the job took much longer
// than planned to squeeze out extra (to make up for the money he lost elsewhere). At the parts counter and the
// spice stall it's the other way round: Eddy is the one angling for a discount.
// A session is one negotiation. It lives in state.hg (saved by main.js), keyed per deal and per market day, so
// closing the PC and coming back continues the same fight instead of rolling a fresh opening offer.
// People remember: get caught lying and they open lower (or higher) next time; deal honestly and they soften.

// The cast (Tristan's characters, Drive 01_Characters). stingy: how hard they lean on the price at the start.
// patience: pushes they take before their offer is final. sharp: how well they see through a story.
export const PEOPLE = {
  fenna: { name: 'Fenna', place: 'Kaasland Auto Parts · parts counter', img: 'receptionist', stingy: 0.1, patience: 2, sharp: 0.7,
    bio: 'Runs the counter at Kaasland Auto Parts. Knows every part number by heart and has heard every story twice.' },
  zahra: { name: 'Oma Zahra', place: 'the Lady of Spices · back stall of the Kruidenbeurs', img: 'lady_of_spices', stingy: 0.12, patience: 3, sharp: 0.85,
    bio: 'Sold spice to Freddy Sr. before Eddy Jr. was born. Warm, patient, and impossible to fool.' },
  gerrit: { name: 'Gerrit', place: 'Pannenkoekenhuis De Gouden Pan', img: 'pancake_owner', stingy: 0.15, patience: 3, sharp: 0.3, types: ['oven', 'frituur'],
    bio: 'Flour to the elbows, stroop in his moustache. Believes almost anything if you say it with a straight face.' },
  mesut: { name: 'Mesut', place: 'Grillroom Mesut', img: 'shoarma_45', stingy: 0.3, patience: 1, sharp: 0.5,
    bio: 'Never puts the knife down. Not a threat. Probably.' },
  ali: { name: 'Ali', place: 'Grillroom Ali Baba', img: 'shoarma_48', stingy: 0.12, patience: 3, sharp: 0.35,
    bio: 'Friendly, always polishing a plate. Haggles because it would be rude not to.' },
  hasan: { name: 'Hasan', place: 'Shoarma Paleis', img: 'shoarma_50', stingy: 0.15, patience: 3, sharp: 0.2,
    bio: 'Big moustache, bigger heart. Knew Freddy Sr. and still calls Eddy Jr. "little Eddy".' },
  yusuf: { name: 'Yusuf', place: 'Kapsalon King', img: 'shoarma_52', stingy: 0.25, patience: 2, sharp: 0.55,
    bio: 'Gold rings, gold watch, gold tongs. Pays like a king, after a long argument.' },
  erol: { name: 'Erol', place: 'Döner Erol', img: 'shoarma_55', stingy: 0.22, patience: 3, sharp: 0.6,
    bio: 'Tracksuit, two chains, a deal for everything. He invented half the tricks Eddy tries on him.' },
  ahmet: { name: 'Ahmet', place: 'Grillroom Zuid', img: 'shoarma_58', stingy: 0.3, patience: 2, sharp: 0.75,
    bio: 'Arms crossed since 1987. Assumes every invoice is a lie, and is often right.' },
  karim: { name: 'Karim', place: 'Shoarma Karim', img: 'shoarma_60', stingy: 0.18, patience: 2, sharp: 0.9,
    bio: 'Calm, bald, beard like a wise man. Fair to honest people. Sees straight through the rest.' },
};
export const CLIENT_IDS = ['gerrit', 'mesut', 'ali', 'hasan', 'yusuf', 'erol', 'ahmet', 'karim'];
export const portrait = (id) => (PEOPLE[id] ? `./assets/people/${PEOPLE[id].img}.jpg` : null);

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const round5 = (n) => Math.round(n / 5) * 5;

// What they say. {offer}, {ask} and {list} are filled in.
const LINES = {
  // Eddy sells (Werkplaats): the customer leans on the price
  open: {
    _: ['Nice work, brother. But {list}? I give you {offer}. Cash, today.', '{list}? For this? {offer}, and I tell my friends about you.', 'Business is slow, Eddy. {offer}, final... ok, almost final.'],
    gerrit: ['Ach jongen, lovely job! Only... {offer}? The pancake season was bad. Too much sun.', 'Gorgeous! Like a fresh stroopwafel. Would {offer} be terrible?'],
    mesut: ['{offer}.', '*taps the knife on the counter* {offer}. Good price. For you.'],
    ali: ['Eddy, my friend, my brother! {offer}, and you eat for free at Ali Baba this week.', 'Beautiful! Here, have a plate. And {offer}, yes?'],
    hasan: ['Little Eddy! Your father charged me less, you know. {offer}, for old times.', 'Ah, it shines like the old days. {offer}, habibi?'],
    yusuf: ['The King pays royally. {offer}. That IS royal. Look at my rings.', 'I paid less for this watch. {offer}.'],
    erol: ['Eddy, Eddy. You and I both know {list} is the tourist price. {offer}.', 'My cousin Ferhat does this for half. Half! But I like you. {offer}.'],
    ahmet: ['{list}. Ha. No. {offer}.', 'I counted your bolts. {offer}.'],
    karim: ['It is good work. It is not {list} work. {offer} is fair.', 'Let us be reasonable people. {offer}.'],
  },
  pushOk: {
    _: ['Pff. Ok, ok. {offer}. You are worse than your father.', 'Fine. {offer}. But you carry it in yourself.', 'You kill me, Eddy. {offer}.'],
    gerrit: ['Haha, you drive a hard bargain, lad! {offer} then.'],
    mesut: ['...{offer}. Don\'t push again.'],
    ali: ['For you, my brother, {offer}. My wife will be angry.'],
    hasan: ['Your father had the same stubborn face. {offer}.'],
    yusuf: ['A king is generous. {offer}. Tell people.'],
    karim: ['You argue well. {offer}.'],
  },
  pushNo: {
    _: ['No, no, no. {offer}. That\'s it.', 'Brother. {offer}. Don\'t insult me.', 'I said {offer}. My ears work fine.'],
    mesut: ['*the knife stops tapping* {offer}.'],
    ahmet: ['No.', 'Still no. {offer}.'],
    erol: ['Nice try. I invented that move. {offer}.'],
  },
  final: {
    _: ['{offer}, or I find someone else. Final.', 'Last word: {offer}. Take it or leave it.'],
    mesut: ['{offer}. We are done talking.'],
    ali: ['Eddy, please, {offer}, I have customers waiting!'],
  },
  storyOk: {
    _: ['Three nights? Ya Allah. Ok. {offer}. But next time you call first!', 'Mo had to come twice? Ok, ok, {offer}. Poor boy.'],
    gerrit: ['All night?! You poor lad, you must be starving. {offer}, and take a pancake.'],
    hasan: ['You worked so hard, just like your father. {offer}, habibi. Eat something.'],
    ali: ['My brother, you look tired. {offer}, and go sleep.'],
    yusuf: ['Fine, fine, a king respects suffering. {offer}.'],
  },
  storyNo: {
    _: ['Longer? My cousin saw you at the snackbar at eight. {offer}.', 'Eddy. I can smell a story. {offer}, and be glad I still pay.'],
    erol: ['Ha! That one is mine, I used it in 2009. {offer}.'],
    ahmet: ['Your van was parked at the Kroketkade all afternoon. {offer}.'],
    karim: ['Eddy. Look at me. {offer}. And I will remember this.'],
    mesut: ['*slowly puts down the knife* ...{offer}.'],
  },
  deal: { _: ['Deal. Pleasure, Eddy.', 'Ok. Done. Shake.'], mesut: ['*nods once*'], ahmet: ['Hm.'] },
  walk: { _: ['Fine, keep it. Call me when you are reasonable.'] },
  // Eddy buys (parts counter, spice stall): the seller holds the price
  bOpen: {
    fenna: ['That\'s {list}. Says so on the screen. The screen doesn\'t haggle.', 'New, in the box, {list}. Want a bag?'],
    zahra: ['For you, my child, {list}. Your father paid the same. Well. Almost.', 'The best I have, from under the counter. {list}.'],
  },
  bPushOk: {
    fenna: ['*sigh* I can do {offer}. Don\'t tell my boss.', 'Ok, staff discount, technically for staff. {offer}.'],
    zahra: ['You have your father\'s eyes. {offer}.', 'Hm. {offer}, because you ask nicely.'],
  },
  bPushNo: {
    fenna: ['Still {offer}. The computer won\'t let me.', 'Eddy, there\'s a queue behind you. {offer}.'],
    zahra: ['No, my child. {offer}. Saffraan doesn\'t grow on trees. Well, flowers.'],
  },
  bFinal: { fenna: ['{offer}. Last price, I mean it.'], zahra: ['{offer}. Now you buy, or you go.'] },
  bStoryOk: {
    fenna: ['Your dad\'s old account? Fine, I\'ll put it on that. {offer}.', 'Oh no, the Lampas again? Ugh. {offer}, go.'],
    zahra: ['Freddy Sr.\'s boy, struggling... come, {offer}. And eat something.'],
  },
  bStoryNo: {
    fenna: ['Your dad\'s account was closed in 1999. I closed it. {offer}.', 'That\'s the third sad story this week, and it\'s Tuesday. {offer}.'],
    zahra: ['My child, I sold spice to your grandfather. I know that face. {offer}.'],
  },
  bDeal: { fenna: ['Lovely. Receipt\'s in the bag.'], zahra: ['Use it well. Not too much salt.'] },
  bWalk: { fenna: ['Suit yourself. It\'ll still be {offer} tomorrow.'], zahra: ['Go, think. I am here every day.'] },
};
const say = (kind, who, vars) => {
  const set = LINES[kind] || {}, line = pick(set[who] || set._ || ['...']);
  return line.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? 'W ' + Math.round(vars[k]).toLocaleString('nl-NL') : ''));
};

// deps: state, day() current market day, toast, beep, save
export function createHaggle(deps) {
  const { state } = deps;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  let active = null; // { key, tab, cfg }: the open negotiation (the cfg holds the callbacks, so it lives in memory)

  function mem() {
    const h = state.hg && typeof state.hg === 'object' ? state.hg : (state.hg = {});
    h.trust = h.trust && typeof h.trust === 'object' ? h.trust : {};
    const day = deps.day();
    if (h.day !== day || !h.s || typeof h.s !== 'object') { h.day = day; h.s = {}; }
    return h;
  }
  const trustOf = (who) => clamp(+mem().trust[who] || 0, -3, 3);
  const nudgeTrust = (who, d) => { const h = mem(); h.trust[who] = clamp((+h.trust[who] || 0) + d, -3, 3); };

  // cfg: { key, tab, who, side: 'sell'|'buy', list, what, story: { label, line, ask, effort } | null,
  //        walk: label | null, onDeal(price), onWalk() }
  function open(cfg) {
    const h = mem(), p = PEOPLE[cfg.who], t = trustOf(cfg.who);
    let s = h.s[cfg.key];
    if (!s || s.list !== cfg.list) { // a fresh negotiation
      const sell = cfg.side === 'sell';
      const lean = clamp(p.stingy * (0.7 + Math.random() * 0.6) - t * 0.025, 0.03, 0.45);
      const offer = round5(sell ? cfg.list * (1 - lean) : cfg.list * (1 + Math.max(0, -t) * 0.03));
      s = h.s[cfg.key] = { list: cfg.list, offer, ask: sell ? cfg.list : round5(cfg.list * 0.8), patience: Math.max(1, p.patience + (t > 1 ? 1 : 0) - (t < -1 ? 1 : 0)), story: false, said: say(sell ? 'open' : 'bOpen', cfg.who, { offer, list: cfg.list }), eddy: '' };
    }
    active = { key: cfg.key, tab: cfg.tab, cfg };
    if (deps.beep) deps.beep(440, 0.05, 'triangle');
    if (deps.save) deps.save();
  }
  const sess = () => (active ? mem().s[active.key] : null);
  function close() { active = null; }

  function act(move) {
    const s = sess(); if (!s) return;
    const { cfg } = active, who = cfg.who, p = PEOPLE[who], sell = cfg.side === 'sell', b = sell ? '' : 'b';
    const K = (k) => (sell ? k : b + k[0].toUpperCase() + k.slice(1));
    const t = trustOf(who);
    if (move === 'accept') {
      const price = s.offer; close();
      nudgeTrust(who, s.story === 'caught' ? 0 : 0.5); if (deps.onDeal) deps.onDeal(who, s.story === 'caught' ? 'caught' : 'deal'); // word gets around (js/buurtrep.js)
      delete mem().s[cfg.key];
      if (deps.toast) deps.toast(p.name.toUpperCase(), say(K('deal'), who, {}), 2.5);
      cfg.onDeal(price);
      if (deps.save) deps.save();
      return;
    }
    if (move === 'walk') {
      s.eddy = sell ? '"Then I keep it."' : '"I\'ll think about it."';
      s.said = say(K('walk'), who, { offer: s.offer });
      const c = cfg; close(); if (c.onWalk) c.onWalk();
      if (deps.toast) deps.toast(p.name.toUpperCase(), s.said, 2.5);
      if (deps.save) deps.save();
      return;
    }
    if (s.patience <= 0) return;
    if (move === 'push') {
      s.eddy = sell ? `"${fmt(s.ask)}. The price is the price."` : `"Come on. ${fmt(s.ask)} and I'm out of your hair."`;
      s.patience--;
      const lev = cfg.leverage || 0; // e.g. a machine that beats the spec
      const chance = clamp(0.5 - p.sharp * 0.15 + t * 0.05 + lev * 0.25 - (s.story === 'caught' ? 0.2 : 0), 0.1, 0.9);
      if (Math.random() < chance) {
        const gap = s.ask - s.offer, step = gap * (0.4 + Math.random() * 0.45);
        s.offer = round5(s.offer + step); if (Math.abs(s.ask - s.offer) <= 10) s.offer = s.ask;
        s.said = say(K('pushOk'), who, { offer: s.offer });
        if (deps.beep) deps.beep(820, 0.06, 'triangle');
      } else {
        s.said = say(s.patience <= 0 ? K('final') : K('pushNo'), who, { offer: s.offer });
        if (deps.beep) deps.beep(220, 0.08, 'square', 0.03);
      }
    } else if (move === 'story' && cfg.story && !s.story) {
      const st = cfg.story; s.eddy = st.line; s.patience--;
      const chance = clamp(0.4 + (st.effort || 0) * 0.4 - p.sharp * 0.35 + t * 0.04, 0.05, 0.85);
      if (Math.random() < chance) {
        s.story = 'ok'; s.ask = st.ask;
        s.offer = round5(sell ? Math.max(s.offer, st.ask * (0.92 + Math.random() * 0.08)) : Math.min(s.offer, st.ask * (1 + Math.random() * 0.08)));
        s.said = say(K('storyOk'), who, { offer: s.offer });
        if (deps.beep) deps.beep(980, 0.08, 'triangle');
      } else {
        s.story = 'caught'; nudgeTrust(who, -1); s.patience = Math.max(0, s.patience - 1);
        s.offer = round5(sell ? s.offer * 0.92 : Math.max(s.offer, s.list) * 1.05);
        s.said = say(K('storyNo'), who, { offer: s.offer });
        if (deps.beep) deps.beep(160, 0.2, 'sawtooth', 0.03);
      }
    }
    if (s.patience <= 0 && !/final|last/i.test(s.said)) s.said += sell ? ' Final.' : ' Last price.';
    if (deps.save) deps.save();
  }

  // ---- rendering (inside the Kaasdows window; main.js shows it instead of the tab while a haggle is open)
  const tabOf = () => (active ? active.tab : null);
  const title = () => (active ? `Haggling with ${PEOPLE[active.cfg.who].name}` : '');
  function html() {
    const s = sess(); if (!s) return '';
    const { cfg } = active, p = PEOPLE[cfg.who], sell = cfg.side === 'sell', t = trustOf(cfg.who);
    const mood = t >= 2 ? 'likes you' : t >= 1 ? 'friendly' : t <= -2 ? 'doesn\'t trust you' : t <= -1 ? 'wary' : 'neutral';
    const pat = s.patience > 0 ? '●'.repeat(s.patience) : '<b style="color:#a00">final offer</b>';
    const diff = s.offer - s.list, diffTxt = diff ? ` <small style="color:${(sell ? diff > 0 : diff < 0) ? '#070' : '#a00'}">(${diff > 0 ? '+' : '−'}${fmt(Math.abs(diff))})</small>` : '';
    let h = `<style>@media (max-height:500px){.hg img{width:96px!important;height:108px!important}.hg .well small[style]{display:none}.hg .say{margin:4px 0!important;padding:5px 8px!important;font-size:14px!important}.hg table.list td{padding:1px 6px;font-size:12px}.hg .acts{margin-top:4px!important}}.hg{display:flex;gap:10px;flex-wrap:wrap}.hg img{width:180px;height:200px;object-fit:cover;border:2px solid;border-color:#808080 #fff #fff #808080;background:#000}.hg .say{position:relative;background:#ffffe8;border:2px solid #333;border-radius:10px;padding:8px 10px;margin:8px 0;font-size:15px}.hg .eddy{color:#335;font-style:italic;margin:4px 0}.hg .acts .b95{margin:3px 4px 3px 0}</style>`;
    h += `<div class="hg"><img src="./assets/people/${p.img}.jpg" alt="${p.name}"><div style="flex:1;min-width:220px">`;
    h += `<div class="well"><b>${p.name}</b> · ${p.place}<br><small>${cfg.what}</small><br><small style="color:#666">${p.bio}</small></div>`;
    if (s.eddy) h += `<div class="eddy">Eddy: ${s.eddy}</div>`;
    h += `<div class="say">${s.said}</div>`;
    h += `<table class="list"><tr><td>${sell ? 'Job price' : 'Price tag'}</td><td><b>${fmt(s.list)}</b></td></tr><tr><td>${sell ? 'Their offer' : 'Their price'}</td><td><b>${fmt(s.offer)}</b>${diffTxt}</td></tr><tr><td>Patience</td><td>${pat}</td></tr><tr><td>Mood</td><td>${mood}</td></tr></table>`;
    h += '<div class="acts" style="margin-top:8px">';
    h += `<button class="b95" data-hg="accept"><b>Deal at ${fmt(s.offer)}</b></button>`;
    if (s.patience > 0) {
      h += `<button class="b95" data-hg="push">${sell ? `Hold firm: ${fmt(s.ask)}` : `Ask for ${fmt(s.ask)}`}</button>`;
      if (cfg.story && !s.story) h += `<button class="b95" data-hg="story" title="Risky: if they see through it, they pay less and remember it">${cfg.story.label}</button>`;
    }
    if (cfg.walk) h += `<button class="b95" data-hg="walk">${cfg.walk}</button>`;
    h += '</div>';
    if (cfg.note) h += `<div style="margin-top:6px"><small style="color:#666">${cfg.note}</small></div>`;
    return h + '</div></div>';
  }
  function bind(body, rerender) {
    body.querySelectorAll('[data-hg]').forEach((b) => b.onclick = () => { act(b.dataset.hg); rerender(); });
  }
  return { open, act, close, tab: tabOf, title, html, bind, trustOf, active: () => active, session: sess, PEOPLE };
}

// Oma Zahra's stall at the back of the Kruidenbeurs: one sack under the counter each market day, at a price
// to haggle over. The spice goes into the warehouse through the normal market buy (space and money checks),
// and the haggled difference comes back as change.
export function createSpiceStall(deps) {
  const { state, econ, haggle } = deps;
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');
  function sack() {
    const e = econ.ensure(), h = state.hg || (state.hg = {});
    if (!h.stall || h.stall.day !== e.day) {
      let a = (e.day * 2654435761) >>> 0; const r = () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; };
      const open = econ.INGREDIENTS.filter((g) => !g.supply), g = open[Math.floor(r() * open.length)];
      const grade = r() < 0.45 ? 'bio' : 'std', kg = 10 + Math.floor(r() * 4) * 5;
      h.stall = { day: e.day, id: g.id, grade, kg, done: false };
    }
    const s = h.stall, g = econ.INGREDIENTS.find((x) => x.id === s.id), gr = econ.GRADES.find((x) => x.id === s.grade);
    return { ...s, name: `${s.kg} kg ${gr.name} ${g.name}`, list: Math.round(econ.price(s.id, s.grade) * s.kg * 0.9 / 5) * 5 }; // her own suppliers: a bit under the market
  }
  function html() {
    const s = sack();
    return `<div class="well" style="margin-bottom:8px;display:flex;gap:10px;align-items:center"><img src="${portrait('zahra')}" alt="" style="width:54px;height:60px;object-fit:cover;border:1px solid #888"><div style="flex:1"><b>Oma Zahra</b>, the Lady of Spices · back stall<br>${s.done ? '<small>"Come back tomorrow, my child. I have something else then."</small>' : `<small>Under the counter today: <b>${s.name}</b>, ${fmt(s.list)} (a bit under the market). She'll haggle, a little.</small>`}</div>${s.done ? '' : '<button class="b95" data-zahra>Talk to her</button>'}</div>`;
  }
  function bind(body, rerender) {
    const b = body.querySelector('[data-zahra]');
    if (b) b.onclick = () => {
      const s = sack();
      haggle.open({ key: `zahra:${s.day}`, tab: 'beurs', who: 'zahra', side: 'buy', list: s.list, what: `Under the counter: ${s.name}.`,
        story: { label: '"Business is bad, Oma..."', line: '"The Lampas took half my clients, Oma. The Naknikim ate the paprika. Dad would have wanted you to help me."', ask: Math.round(s.list * 0.7 / 5) * 5, effort: 0.3 },
        walk: 'Not today',
        onDeal: (price) => {
          const r = econ.buy(s.id, s.grade, s.kg);
          if (!r.ok) { if (deps.toast) deps.toast('OMA ZAHRA', `${r.why} "Make room, then come back."`, 3); return; }
          const back = Math.round((s.list - price) * r.kg / s.kg); if (back) deps.addMoney(back);
          state.hg.stall.done = true;
          if (deps.toast) deps.toast('OMA ZAHRA', `${r.kg} kg into the warehouse for ${fmt(r.cost - back)}.`, 3);
          if (deps.save) deps.save();
        } });
      rerender();
    };
  }
  return { html, bind, sack };
}
