// De klok (2026-11-26): a market day now has hours. It starts at 08:00 when Eddy wakes up and runs to 03:00 at night
// while he is out on the street (not in the PC, a conversation, a mission or the drive): one hour takes about 45 seconds.
// The sky follows it together with the weather (js/kaasweer.js setTime): a warm dusk around eight, night after nine,
// lamps and windows on, fewer people out. Shops keep hours (HOURS below, on top of their closing days), and the
// Nachtklussen only start after dark. Sleeping (or a raid) starts the next morning. Nothing is forced: at 03:00 the
// clock just stops and Shooki tells you to go to bed.
// state.klok = { h } (hours since midnight of the day Eddy woke up; 25.5 = 01:30 at night)
export const START = 8, END = 27, SEC_PER_HOUR = 45;
// [open, close] in hours; close past 24 runs into the night
export const HOURS = { hotel: [0, 30], bitterbal: [12, 23], kapsalon: [9, 18], avond: [16, 25], fiets: [8.5, 17.5], bakker: [7, 17], bloem: [9, 18], kaas: [9, 18], bel: [10, 20], was: [8, 21], habibi: [16, 27], reis: [9.5, 17], makelaar: [9, 17],
  schmatzel: [11, 26], spasibo: [0, 30], dealer: [9, 18], club: [22, 28], eddy: [0, 30] };
const pad = (n) => String(n).padStart(2, '0');
export const hhmm = (h) => { const m = Math.round(h * 60) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };

// deps: state, running() (the street, nobody talking), onTime(tod), toast, tip(k), save()
export function createKlok(deps) {
  const { state } = deps;
  const S = () => { const k = state.klok && typeof state.klok === 'object' ? state.klok : (state.klok = {}); if (typeof k.h !== 'number' || !(k.h >= 0 && k.h <= END)) k.h = START; return k; };
  const hour = () => S().h;
  function tod(h = hour()) { // n: how dark (0 day .. 1 night), dusk: the orange in between
    const x = h % 24;
    const n = x < 5.5 ? 1 : x < 7.5 ? 1 - (x - 5.5) / 2 : x < 18.5 ? 0 : x < 21 ? (x - 18.5) / 2.5 : 1;
    const bump = (c, w) => Math.max(0, 1 - Math.abs(x - c) / w);
    return { h, n, dusk: Math.max(bump(19.6, 1.6), bump(6.6, 1.1)), night: n > 0.6, label: hhmm(h) };
  }
  const isNight = () => tod().night;
  const openNow = (id, days, wd) => { const H = HOURS[id], h = hour(); if (days && !days.includes(wd)) return false; if (!H) return true; return h >= H[0] && h < H[1]; };
  const hoursText = (id) => { const H = HOURS[id]; return !H || H[1] - H[0] >= 24 ? 'dag en nacht' : `${hhmm(H[0])}–${hhmm(H[1])}`; };
  let bucket = -1, late = false;
  function push(force) { const b = Math.floor(hour() * 4); if (force || b !== bucket) { bucket = b; deps.onTime(tod()); } }
  function update(dt) {
    const k = S();
    if (state.step === 'free' && deps.running() && k.h < END) { k.h = Math.min(END, k.h + dt / SEC_PER_HOUR); if (k.h >= END && !late) { late = true; deps.toast('03:00', 'Shooki: "Bro, even the Lampas are asleep. Go to bed." Sleep to start the next market day.', 4.5); } }
    push(false);
  }
  function newDay() { S().h = START; late = false; push(true); }
  function waitUntil(h) { const k = S(); if (k.h < h) { k.h = Math.min(END, h); push(true); if (deps.save) deps.save(); } }
  function pass(hours) { const k = S(); k.h = Math.min(END, k.h + hours); push(true); }
  return { update, newDay, waitUntil, pass, hour, tod, isNight, openNow, hoursText, label: () => hhmm(hour()), refresh: () => push(true), HOURS };
}
