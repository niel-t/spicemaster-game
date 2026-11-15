// The Naknikim as people: each one in the home warehouse has a name, a skill and a mood, and can be sent out on an
// errand for a market day. Low mood means naps at the mixing table and worse errands; a day off fixes it.
// Mixing mistakes from the economy (economy.js mix()) are shown in the warehouse as a bubble and a spice cloud.
// Lives in state.crew, one entry per home-warehouse Naknik, in the same order as the figures in main.js.

const NAMES = ['Knakkie', 'Kees Komijn', 'Bolle Bert', 'Sjaakie', 'Fliep', 'Toos', 'Dikkie', 'Henkie', 'Piet Paprika', 'Mientje', 'Joep', 'Kleine Karel'];
export const ERRANDS = [
  { id: 'part', need: 'werk', name: 'Scrounge Kaasplaats for a part', text: 'Comes back with a used machine part for the Werkplaats (or something weird).' },
  { id: 'sell', need: 'rank1', name: 'Sell spice door to door', text: 'Comes back with Wilders. Skill and mood decide how many.' },
  { id: 'scout', need: 'heist', name: "Scout tonight's Nachtklus", text: 'Hangs around a rival joint all day: a free floor plan on the Plannenbord.' },
];
const STORIES = {
  scout: ['"I counted the guards. Then I counted again. Same number!"', '"Nobody looks at a Naknik. It is our superpower."', '"I drew the map. It is also a horse."'],
  part: ['"The man said it is a motor. It goes vroem. Mostly."', '"I traded my lunch for it. Good deal, boss?"', '"It was just lying there. Next to a man. Sleeping."'],
  sell: ['"A lady bought three bags and gave me soup."', '"A dog chased me. I sold him nothing."', '"I said it was De Gouden Mix. Is ok?"'],
  flop: ['"I got lost. Kaasland is very big, boss."', '"I sat in the park. The ducks needed me."', '"I forgot what I was doing. Then I came back."'],
};

// deps: state, econ, ws (workshop, may be null), addMoney(n), toast(title, text, sec), save()
export function createCrew(deps) {
  const { state, econ } = deps;
  const day = () => econ.ensure().day;
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  function ensure() {
    const c = Array.isArray(state.crew) ? state.crew : (state.crew = []);
    const n = Math.max(0, Math.min(7, state.naknik || 0));
    while (c.length < n) {
      const used = new Set(c.map((x) => x.name)), free = NAMES.filter((x) => !used.has(x));
      c.push({ name: rnd(free.length ? free : NAMES), skill: 1 + Math.floor(Math.random() * 3), mood: 70, away: null });
    }
    if (c.length > n) c.length = n;
    return c;
  }
  const away = () => ensure().filter((x) => x.away).length;
  const napping = (i) => { const m = ensure()[i]; return !!m && !m.away && m.mood < 25; };
  const moodWord = (m) => (m >= 75 ? 'happy' : m >= 50 ? 'fine' : m >= 25 ? 'grumpy' : 'asleep on the sacks');
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  function send(i, kind) {
    const m = ensure()[i]; if (!m || m.away) return;
    m.away = { kind, back: day() + 1 };
    if (deps.toast) deps.toast('NAKNIK OUT', `${m.name} waddles off: ${ERRANDS.find((e) => e.id === kind).name.toLowerCase()}. Back after the next outing.`, 3);
    if (deps.save) deps.save();
  }
  function dayOff(i) {
    const m = ensure()[i]; if (!m || m.away) return;
    m.away = { kind: 'off', back: day() + 1 };
    if (deps.toast) deps.toast('DAY OFF', `${m.name} goes to the beach with a bag of crisps. Back tomorrow, happier.`, 3);
    if (deps.save) deps.save();
  }
  function onMarketDay(d) {
    const out = [];
    for (const m of ensure()) {
      if (m.away && m.away.back <= d) {
        const k = m.away.kind, odds = 0.45 + m.skill * 0.1 + (m.mood - 50) / 250; m.away = null;
        if (k === 'off') { m.mood = Math.min(100, m.mood + 35); out.push(`${m.name} is back from a day off, smiling.`); continue; }
        if (Math.random() > odds) { m.mood = Math.max(0, m.mood - 5); out.push(`${m.name}: ${rnd(STORIES.flop)}`); continue; }
        if (k === 'scout') { const hs = state.heists || (state.heists = {}); hs.freePlans = (+hs.freePlans || 0) + 1; out.push(`${m.name} scouted a rival joint: a free floor plan on the Plannenbord. ${rnd(STORIES.scout)}`); }
        else if (k === 'part' && deps.ws) {
          const ids = ['m_goedkoop', 'm_std', 'b_gas', 'c_spit15', 'c_spit30', 'f_klein', 'e_timer', 'e_vetbak', 'e_chroom'];
          const id = rnd(ids); deps.ws.ensure().parts.push({ id, wear: Math.round((0.1 + Math.random() * 0.2) * 100) / 100 });
          out.push(`${m.name} brought a part for the Werkplaats. ${rnd(STORIES.part)}`);
        } else {
          const w = Math.round((30 + m.skill * 25 + Math.random() * 40) * (0.6 + m.mood / 125) / 5) * 5;
          deps.addMoney(w); out.push(`${m.name} sold spice door to door: +W ${w}. ${rnd(STORIES.sell)}`);
        }
        m.mood = Math.min(100, m.mood + 3);
      } else if (!m.away) m.mood = Math.max(0, m.mood - (3 + Math.floor(Math.random() * 4))); // mixing all day wears them down
    }
    if (out.length && deps.toast) deps.toast('NAKNIKIM', out.join('<br>'), 5.5);
    if (deps.save) deps.save();
  }
  function dayCheck() { // returns the economy's mixing mistake of a new day (if any), for the warehouse to show
    const c = ensure(), d = day();
    if (state.crewDay === undefined) { state.crewDay = d; return null; }
    if (state.crewDay === d) return null;
    state.crewDay = d; onMarketDay(d);
    const lm = econ.ensure().lastMix; return lm && lm.oops ? lm.oops : null;
  }
  function info(i) {
    const m = ensure()[i]; if (!m) return null;
    return { ...m, stars: stars(m.skill), moodWord: moodWord(m.mood) };
  }
  const errands = () => ERRANDS.filter((e) => !e.need || (deps.can ? deps.can(e.need) : true));
  return { ensure, away, napping, send, dayOff, info, dayCheck, ERRANDS, errands };
}
