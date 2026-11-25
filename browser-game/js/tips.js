// Shooki's tips: cousin Shooki texts Eddy a short explanation the first time each topic comes up, from the very
// first minute (walking, listing Dad's junk) to every Kaasdows tab, the Russian's shop, missions, the drive, the
// phone, Nachtklussen and the siege. A message card in the corner, never blocking: OK (or H) closes it, it fades by
// itself after a while, and "no more tips" turns them off. Each tip shows once (state.tips.told), saved with the game.

import { cardBottom, touchWords, isTouchUI } from './mobile.js';
export const TIPS = {
  start: ['Welcome home, cuz', "Bro! Cousin Shooki here. I text you when something's new. <b>WASD</b> walk, <b>Shift</b> run, <b>E</b> talk or use, <b>mouse wheel</b> zoom. Your dad is waiting inside. Go."],
  'step:list': ["Dad's junk", 'Walk up to every old machine and press <b>E</b> to put it up for sale. Six things. The counter is top left.'],
  'step:sell': ['Selling', 'The <b>Kaasdows XL</b> PC is at the back of the warehouse. Log in with <b>E</b> and sell your listings on <b>Kaasplaats</b>. Take the best bid, bro.'],
  'step:hire': ['Start mixing', 'Money in your pocket? A <b>mixing table</b>, then a <b>Naknik</b>. Both on the PC. No table, no spice.'],
  'step:russian': ['The Russian', 'Pawn shop <b>Pandjeshuis Spasibo</b>, east end of the street. Dad\'s old friend. He sells guns, but guns only work on missions. In the street it\'s the stick.'],
  'step:free': ['How the trade works', 'Every <b>market day</b> you pick: a <b>raid</b> (that takes the whole day), or <b>warehouse work and deliveries</b> together. Then sleep: your Naknikim mix overnight, clients pay, prices move. Take joints, sell spice, get a name.'],
  'tab:sell': ['Kaasplaats', 'Second-hand market. Buyers bid on what you list, you pick. Later you buy and sell <b>shoarma machines</b> here too: sell one to a joint and they order more spice.'],
  'tab:shop': ['Mixing table', 'Steel table, bowls, sacks. It\'s where the Naknikim work. One table, up to three Naknikim, once you have the name for it.'],
  'tab:hire': ['Naknikim', 'Each Naknik mixes <b>10 kg</b> of blend every market day from the spice on your shelves. No spice, no blend, no money. The agency trusts a <b>Hulpje</b> with one Naknik, a <b>Mengmeester</b> with two, a <b>Kruidenhandelaar</b> with a full table. More room comes with extra warehouses.'],
  rest: ['Rest day', 'Bro, you already had a lazy day. Sleep comes after work: a <b>delivery run</b> in the Oofmobiel, a <b>Klusbord</b> job, racking pallets or a <b>raid</b>. One rest day every three days, that\'s the deal.'],
  shop: ['Pandjeshuis Spasibo', 'Guns, ammo, armour, attachments. <b>Cash only</b>. You can sell stuff back. Everything you buy goes into your kit for missions. Esc to leave.'],
  'tab:beurs': ['Kruidenbeurs', 'The spice market. Prices move every market day: buy low, bro. Orders come <b>two days</b> later, express tomorrow. <b>Lampas</b> grade is cheap and bad, <b>Standaard</b> is honest, <b>Bio</b> is expensive and five stars, and only for a <b>Kruidenhandelaar</b>. 25 kg orders open at <b>Mengmeester</b>. Your warehouse holds 200 kg.'],
  'tab:meng': ['Mengkamer', 'Pick <b>one blend</b> a day for the Naknikim. Quality is the average stars of what goes in. "Cheapest first" saves money, "best first" makes clients happy.'],
  'tab:rapport': ['Dagrapport', 'Who paid, who didn\'t. A missed order costs trust and control of that joint. Watch the <b>heat</b> bars too: angry gangs start price wars, lean on clients and take joints back.'],
  'tab:jobs': ['Klusbord', 'New jobs every market day. <b>Spoed</b> orders pay extra for blend you have, <b>deals</b> are cheap spice, <b>stash</b> jobs pay for a remix raid. Jobs give reputation too.'],
  'tab:ideas': ['Ideeënboek', 'People in the street have ideas. Someone with a <b>(!)</b> over their head has something new to say. Every idea opens or improves something.'],
  'tab:werk': ['De Werkplaats', 'Build shoarma machines from parts to the specs on the board, run the draaitest, deliver. Repair broken ones. And upgrade the Kaasdows itself: more jobs, free rumours.'],
  'tab:garage': ['Garage Mo', 'Better vans and add-ons: springs, a hidden compartment, chip tuning, tinted windows. Park badly and you get a <b>wheel clamp</b>. Carry a lot of cash and the <b>tax inspector</b> finds you.'],
  'tab:plan': ['Plannenbord', 'Night jobs. Sneak in, fill the bag, carry it to the van, drive home. Get seen and the alarm fills: then it\'s loud and the gang remembers. The Russian buys the hot crates.'],
  'tab:map': ['Map of Kaasland', 'Every district, who holds what, what\'s next. You drive there from the <b>Oofmobiel</b> out front.'],
  'tab:woning': ['Woning', 'Your own place upstairs. Furniture is not just pretty, bro: every piece gives a little perk.'],
  'tab:bank': ['My Wilders', 'Your money, your <b>rank</b> and your property. Rank comes from reputation: clients paying, raids, jobs. Higher rank, better gear and better parts.'],
  mission: ['First raid', '<b>Mouse</b> aims, <b>click</b> or <b>F</b> attacks. <b>1 2 3</b> weapons, <b>R</b> reload, <b>E</b> grab and throw. Three hits and you\'re down: <b>Backspace</b> tries again. Clear the floor and the joint is yours.'],
  remix: ['Remix raid', 'A joint you already own, but tonight it\'s different: other rules, other score. Stash jobs on the Klusbord pay for these.'],
  heist: ['Nachtklus', 'Stay out of the light and the sight cones. Walking is quiet, <b>Shift</b> is loud, shots are very loud. <b>N</b> for night vision if you have it. Full bag? Back to the van.'],
  siege: ['Spice war', 'They\'re coming for the warehouse. Three waves through the doors. Keep them away from the Naknikim under the tables. A barricade and an oil drum help.'],
  drive: ['Driving', '<b>W</b> gas, <b>S</b> brake, <b>A D</b> steer, <b>Shift</b> handbrake, <b>E</b> honk. Follow the arrow and park in the ring. Lampas cars ram you: the bar top left is the van.'],
  day: ['Plan your day', 'One day, one plan, bro. A <b>raid</b> takes the whole day, and only if you have not worked yet. <b>Racking pallets</b> and <b>deliveries</b> (one van run, Klusbord orders) fit together in one day. Done? <b>Sleep</b> in your bed or hit <b>Dag afsluiten</b> on the PC. A day with nothing done is a <b>rest day</b>: one every three days. The plan for today is under your objective.'],
  'tab:krant': ['Krant voor het Kaasvolk', 'The paper, bro. Every morning: what you did yesterday (yes, they write about you), the <b>weather</b> and the forecast, and the <b>Snackbarbarometer</b>: Friday, Saturday, sun and holidays mean bigger orders, Monday and rain mean smaller. Storm or snow? The truck comes a day late, so order early.'],
  weer: ['Weather', 'Look outside, cuz. The weather changes every day: rain and storms keep people home (smaller orders), sun fills the terraces, frost and snow make the Oofmobiel slide. The forecast is in <b>Krant voor het Kaasvolk</b> on the PC, or on the mat at home.'],
  order: ['Ordered', 'Nothing arrives the same day, bro. Spice comes on the morning <b>two days</b> later. In a hurry? <b>Express</b> brings it tomorrow for 25% extra. Plan ahead: order before the shelves run empty.'],
  phone: ['Phone', 'Your phone is ringing, bro. Press <b>T</b> to answer. Hakan wants kipkraud: say yes and I bring it tomorrow, if there\'s Kip Shoarma in stock.'],
  razim: ['Razim', 'That\'s Razim, bro. He wants shoarma. He always wants shoarma. His texts are under <b>Razim</b> in the Shmokia (<b>T</b>). Reply or don\'t, he texts again anyway.'],
  razimVisit: ['Razim, in person', 'Bro, he just shows up. Buy him a broodje and he goes home happy. Say you\'re working and he follows you around all day. I\'m only telling you.'],
  maboota: ['Put it away, bro', 'Somebody saw your stick and called the cops. On the street the <b>Maboota</b> stays holstered (<b>1</b>). Take it out on a mission, not in front of tourists. Hit somebody out here and they call for sure.'],
  wijkagent: ['Wijkagent', "That's Bakker, the wijkagent. First two times it's just a chat, bro. After that it's fines, and if you lie they search the warehouse and take spice. And the gangs hear about it."],
  shmokia: ['Shmokia', 'Your phone. Call people, trade a bit. <b>T</b> opens and closes it.'],
  haggle: ['Haggling', 'They want a deal. Offer, counter, walk away. Push too hard and they leave. Be too soft and you lose money.'],
  crew: ['Your Naknikim', 'Each Naknik has a name, a mood and three stats: <b>Mengen</b> (fewer mistakes), <b>Tempo</b> (kilos a day) and <b>Werkethiek</b> (how long before he naps). Send one on an <b>errand</b> (they skip mixing that day) or give a <b>day off</b> when they are tired. Watch them work the line: vaten from the pallets into the mixer, blend into blue bags. <b>Lift a vat</b> or <b>fill a bag</b> yourself and the batch of tonight grows.'],
  clamp: ['Wheel clamp', 'Parked like a tourist, bro. The parking office wants the fine <i>and</i> your open tickets. Mo cuts it off cheaper, but the tickets stay open.'],
  parking: ['Paid parking', 'Bro, that bay is <b>betaald parkeren</b>. The meter is cheap but it\'s right in front of their window. The app (<b>B</b>) costs a bit more. Skip it and the scan car writes you a ticket. Two open tickets and they clamp the van.'],
  inspector: ['Tax inspector', 'Van der Belasting. Pay, bribe, or offer him garlic sauce. A hidden compartment in the van keeps cash out of his sight.'],
};
const STEP_KEYS = ['start', 'step:list', 'step:sell', 'step:hire', 'step:russian', 'step:free'];

// the same tips with the touch buttons (touchWords handles the simple key names; these say it differently)
const TOUCH_TIPS = {
  mission: "Your <b>right thumb</b> aims, push it past the ring to shoot (or tap <b>SLAAN</b>). <b>WISSEL</b> weapons, <b>RELOAD</b>, <b>ACTIE</b> grab and throw, <b>GRANAAT</b> held down and let go. Three hits and you're down: <b>OPNIEUW</b> tries again. Clear the floor and the joint is yours.",
  heist: 'Stay out of the light and the sight cones. Walking is quiet, <b>SPRINT</b> is loud, shots are very loud. <b>NACHTZICHT</b> for night vision if you have it. Full bag? Back to the van.',
  drive: '<b>GAS</b> drives, <b>ACHTERUIT</b> brakes and backs up, slide your thumb on the bar to steer, <b>TOETER</b> honks. Follow the arrow and park in the ring. Lampas cars ram you: the bar top left is the van.',
  phone: "Your phone is ringing, bro. <b>Tap the phone</b> to answer. Hakan wants kipkraud: say yes and I bring it tomorrow, if there's Kip Shoarma in stock.",
  shmokia: 'Your phone. Call people, trade a bit. The <b>SHMOKIA</b> button opens it, <b>Terug</b> closes it.',
};
export function createTips(d) {
  const { state, beep } = d;
  const T = () => (state.tips && typeof state.tips === 'object' ? state.tips : (state.tips = { told: {}, off: false }));
  const queue = []; let el = null, cur = null, life = 0;
  function build() {
    el = document.createElement('div'); el.id = 'shookitip';
    // Shooki: black tee, worn denim apron, stubble, the grin (cartoon of Tristan's photo, assets/face_shooki_sq.jpg)
    el.innerHTML = '<div class="st-av"><img src="./assets/face_shooki_sq.jpg" alt="Shooki"></div><div class="st-body"><div class="st-from">Shooki <span>· tip</span></div><div class="st-title"></div><div class="st-text"></div><div class="st-btns"><button class="st-ok">Tamam bro <small>[H]</small></button><button class="st-off">no more tips</button></div></div>';
    const css = document.createElement('style');
    css.textContent = `#shookitip{position:fixed;left:16px;bottom:44px;z-index:9999;display:none;gap:12px;align-items:flex-start;width:min(430px,calc(100vw - 32px));padding:12px 14px;background:rgba(40,24,14,.95);border:2px solid #e8a33d;border-radius:14px 14px 14px 4px;box-shadow:0 6px 24px rgba(0,0,0,.45);color:#f3e6c8;font:400 14px/1.4 Rubik,Arial,sans-serif;animation:stIn .25s ease-out}
#shookitip .st-av img{width:56px;height:56px;border-radius:50%;object-fit:cover;background:#b8642a;border:2px solid #e8a33d;display:block}
#shookitip .st-from{font-weight:700;color:#e8a33d;font-size:12px;letter-spacing:.04em;text-transform:uppercase}#shookitip .st-from span{color:#c8a47a;font-weight:400}
#shookitip .st-title{font:700 16px Rubik,Arial,sans-serif;color:#ffd36b;margin:2px 0 3px}#shookitip b{color:#fff}
#shookitip .st-btns{margin-top:8px;display:flex;gap:10px;align-items:center}
#shookitip .st-ok{font:700 13px Rubik,Arial;padding:5px 12px;border-radius:8px;border:2px solid #e8a33d;background:#a8431e;color:#fff;cursor:pointer}#shookitip .st-ok small{opacity:.7}
#shookitip .st-off{font:400 12px Rubik,Arial;background:none;border:none;color:#c8a47a;text-decoration:underline;cursor:pointer}
@keyframes stIn{from{transform:translateY(16px);opacity:0}to{transform:none;opacity:1}}`;
    document.head.appendChild(css); document.body.appendChild(el);
    el.querySelector('.st-ok').onclick = (e) => { e.stopPropagation(); close(); };
    el.querySelector('.st-off').onclick = (e) => { e.stopPropagation(); T().off = true; queue.length = 0; close(); if (d.save) d.save(); };
    el.addEventListener('click', (e) => e.stopPropagation());
    addEventListener('keydown', (e) => { if (cur && !away && e.code === 'KeyH' && !e.repeat) close(); });
  }
  function next() {
    if (cur || !queue.length || (d.busy && d.busy()) || (d.away && d.away())) return; // Shooki's guide card is up: wait for it
    const k = queue.shift(), t = TIPS[k]; if (!t || stale(k)) return next(); // a Chapter 0 step the player already left
    if (!el) build();
    cur = k; life = 9 + t[1].replace(/<[^>]+>/g, '').length / 14; // reading time
    el.querySelector('.st-title').textContent = t[0]; el.querySelector('.st-text').innerHTML = touchWords((isTouchUI() && TOUCH_TIPS[k]) || t[1]);
    el.style.bottom = cardBottom() + 'px'; el.style.display = 'flex'; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = '';
    if (beep) { beep(1180, 0.05, 'square', 0.03); setTimeout(() => beep(1480, 0.06, 'square', 0.03), 90); }
  }
  const stale = (k) => k.startsWith('step:') && state.step !== k.slice(5);
  function close() { if (!el) return; el.style.display = 'none'; cur = null; away = false; setTimeout(next, 350); }
  // show a topic's tip the first time it comes up
  function show(k) {
    const t = T(); if (t.off || !TIPS[k] || t.told[k]) return false;
    if (d.held && d.held(k)) { t.told[k] = true; return false; } // Shooki's guide card is explaining this right now
    t.told[k] = true; if (d.save) d.save();
    queue.unshift(k); // what's on screen now goes first
    if (cur && stale(cur)) close(); else next();
    return true;
  }
  // the Kaasdows Help menu: show a topic's tip again on request, even if it was seen or tips are off
  function again(k) { if (!TIPS[k]) return false; queue.unshift(k); if (cur) close(); else next(); return true; }
  // fades by itself; while a dialogue or choice is up the card steps aside and its reading time waits (it used to run out
  // behind the dialogue box, so a tip that popped up mid-conversation was gone before anyone could read it)
  let away = false;
  function update(dt) {
    if (cur && d.away && d.away()) { if (!away) { away = true; el.style.display = 'none'; } return; }
    if (away) { away = false; if (cur) { el.style.display = 'flex'; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; } }
    if (cur && (life -= dt) <= 0) close(); else if (!cur && queue.length) next();
  }
  // a save from before the tips: anything already past Chapter 0 doesn't need the Chapter 0 ones
  function migrate(saved) { state.tips = saved && typeof saved === 'object' ? { told: { ...(saved.told || {}) }, off: !!saved.off } : { told: {}, off: false }; if (state.step === 'free') for (const k of STEP_KEYS) state.tips.told[k] = true; }
  function reset() { state.tips = { told: {}, off: false }; }
  const showing = () => cur;
  return { show, again, update, migrate, reset, showing, close, TIPS };
}
