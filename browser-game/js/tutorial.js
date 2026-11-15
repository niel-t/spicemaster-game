// The first fifteen minutes after Chapter 0: cousin Shooki shows Eddy the spice loop one step at a time, and Ome Joop
// explains ranks. One objective at a time; the Kaasdows tabs appear as they are introduced, with a NEW badge until opened.
// Everything lives in state.tut ({ n: step, done, seen: { tab: true } }), which main.js saves. Old saves skip it.

const STEPS = [
  { id: 'shooki', obj: 'Cousin <b>Shooki</b> is waiting outside the warehouse. Talk to him.' },
  { id: 'beurs', tab: 'beurs', obj: 'Log in to the <b>Kaasdows 95</b> PC and open the <b>Kruidenbeurs</b>: that\'s the spice market, and Shooki\'s sack is in your stock.' },
  { id: 'meng', tab: 'meng', obj: 'Open the <b>Mengkamer</b> on the PC. Your Naknik mixes <b>Kip Shoarma</b> overnight, from what\'s on the shelves.' },
  { id: 'raid', obj: 'Take <b>Spekbuurt</b> from the Lampas. Get in the <b>Oofmobiel</b> and drive there. A raid takes the whole day: the market day turns when you get back.' },
  { id: 'rapport', tab: 'rapport', obj: 'A market day passed. Open the <b>Dagrapport</b> on the PC: Schmatzel paid for your Kip Shoarma.' },
  { id: 'jobs', tab: 'jobs', obj: 'Open the <b>Klusbord</b> on the PC. New jobs every market day: spoed orders, cheap deals, stashes to hit.' },
  { id: 'joop', obj: 'Visit <b>Ome Joop</b> on the bench by the canal. He ground spice for Dad for forty years.' },
];
// tabs that only show up once the tour has introduced them (the rest of the PC behaves as before)
const TOUR_TABS = ['beurs', 'meng', 'rapport', 'jobs', 'ideas', 'werk', 'garage', 'plan', 'woning'];
export const STARTER = { paprika: 12, knoflook: 9, komijn: 9 }; // 30 kg of Kip Shoarma (4 : 3 : 3 per 10 kg)

export function createTutorial(d) {
  const { state, econ, toast, beep, save, dialogue, choice } = d;
  const T = () => state.tut;
  const active = () => !!(T() && !T().done);
  const step = () => (active() ? STEPS[T().n] || null : null);
  const at = (id) => !!(step() && step().id === id);
  function begin() { state.tut = { n: 0, done: false, seen: {} }; }
  // a save from before the tour: anyone past Chapter 0 already knows the PC
  function migrate(saved) { if (saved && typeof saved === 'object') { state.tut = { n: +saved.n || 0, done: !!saved.done, seen: { ...(saved.seen || {}) } }; return; } state.tut = state.step === 'free' ? { n: STEPS.length, done: true, seen: {} } : { n: 0, done: false, seen: {} }; }
  function next() {
    const t = T(); t.n++;
    if (t.n >= STEPS.length) { t.done = true; toast('YOU KNOW THE TRADE', 'Buy spice, mix it, deliver it, take joints, earn your rank. The rest of Kaasland opens up as you grow.', 6); [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'triangle', 0.05), i * 110)); }
    else { const s = STEPS[t.n]; if (s.tab) t.seen[s.tab] = false; beep(880, 0.06, 'triangle', 0.05); }
    if (d.objective) d.objective(); if (save) save();
  }
  function skip() { const t = T(); t.n = STEPS.length; t.done = true; if (d.objective) d.objective(); if (save) save(); }
  // ---- hooks main.js calls
  function chapterDone() { if (active() && T().n === 0 && d.objective) d.objective(); } // the Russian's shop closed: Shooki turns up
  function opened(tab) { // a PC tab was opened
    const t = T(); if (!t) return;
    if (t.seen[tab] === false) t.seen[tab] = true;
    if (at('beurs') && tab === 'beurs') next();
    else if (at('meng') && tab === 'meng') next();
    else if (at('rapport') && tab === 'rapport') next();
    else if (at('jobs') && tab === 'jobs') next();
  }
  function owned(id) { if (at('raid') && id === 'spekbuurt') next(); } // the first joint is taken (a market day has passed)
  function metJoop() { if (at('joop')) next(); }
  // can this tab's icon be shown? During the tour only what it has introduced (and the Chapter 0 tabs)
  function showTab(id) {
    if (!active() || !TOUR_TABS.includes(id)) return true;
    const order = STEPS.map((s) => s.tab).filter(Boolean), k = order.indexOf(id);
    return k >= 0 && STEPS.findIndex((s) => s.tab === id) <= T().n;
  }
  const isNew = (id) => !!(T() && T().seen[id] === false);
  const markNew = (id) => { const t = T(); if (t && t.seen[id] === undefined) { t.seen[id] = false; if (save) save(); } }; // a tab unlocked later (Werkplaats, Garage, Plannenbord)
  const objective = () => (state.step === 'free' && step() ? `<span style="color:#ffd36b">TUTORIAL ${T().n + 1}/${STEPS.length}</span> · ${step().obj}` : null);
  // Shooki's first talk: the starter sack, or skip the tour
  function shooki(after) {
    dialogue([
      ['Shooki', 'Cousin! Eddy! Tante Gerda said you took over the warehouse. Respect, bro.'],
      ['Eddy Jr.', 'Shooki? Last time I saw you, you were selling ringtones.'],
      ['Shooki', 'Ringtones were the future, bro. Now spice is the future. Look, I brought you something: a sack of paprika, knoflook and komijn. Enough for thirty kilo Kip Shoarma.'],
      ['Shooki', 'Your Naknik mixes it, Shoarma Schmatzel buys it, you get Wilders. That\'s the whole trade, bro. Want me to show you on the PC?'],
    ], () => {
      const e = econ.ensure(); for (const [id, kg] of Object.entries(STARTER)) e.stock[`${id}:std`] = (e.stock[`${id}:std`] || 0) + kg;
      e.order = 'kip';
      toast('STARTER SACK', `${Object.entries(STARTER).map(([id, kg]) => `${kg} kg ${id}`).join(', ')}. In the warehouse now.`, 3.5);
      choice('Shooki', 'Quick tour of the spice trade? Five minutes, bro. Then I go, I have a cousin thing.', ['Show me', 'I know the trade'], (i) => {
        if (i === 0) { next(); dialogue([['Shooki', 'Go to the PC at the back. Open the Kruidenbeurs. I wait here, bro.']]); }
        else { skip(); dialogue([['Shooki', 'Respect. Klusbord, Kruidenbeurs, Mengkamer, it\'s all on the PC. Call me, bro.']]); }
        if (after) after();
      });
    });
  }
  // what Shooki says while the tour runs
  const shookiTip = () => ({
    beurs: 'The Kruidenbeurs, bro. On the PC at the back. Prices move every market day, buy low. What you order comes in two days.',
    meng: 'Now the Mengkamer. Your Naknik mixes ten kilo a night. Kip Shoarma is already picked.',
    raid: 'Time to work. The Oofmobiel is out front. Spekbuurt, Lampas joint, three of them. Go.',
    rapport: 'The Dagrapport, bro. On the PC. See who paid you.',
    jobs: 'Klusbord! I put jobs there. Every day, new ones.',
    joop: 'Ome Joop sits by the canal with the ducks. Old man, big brain. Go say hi.',
  }[step() && step().id] || null);
  return { STEPS, begin, migrate, active, step, at, next, skip, chapterDone, opened, owned, metJoop, showTab, isNew, markNew, objective, shooki, shookiTip };
}
