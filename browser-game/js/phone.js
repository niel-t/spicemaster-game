// Eddy's phone. Now and then it rings in the hub: Hakan from Hakan Et & Döner wants kipkruiden ("kipkraud"),
// today, abi. Eddy is "not in the Netherlands", so cousin Shooki drops it off tomorrow: a small Kip Shoarma order
// (answer with T, a tap, or A on a controller) that the next market day delivers from the blend stock (econ.phoneOrder, paid in the Dagrapport).
// Hakan is a regular, friendly customer; the joke is the call, not the man.

import { inputMode, glyph, onInputMode } from './input.js';

export function initPhone(d) {
  const { state, econ, dialogue, choice, toast, beep, busy, met } = d;
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];

  const el = document.createElement('div');
  el.id = 'phone';
  el.innerHTML = '<div class="ph-ico">&#128241;</div><div><b>Hakan Et &amp; Döner</b><small><span class="ph-key">[T]</span> opnemen</small></div>';
  el.style.cssText = 'position:fixed;right:18px;bottom:110px;display:none;align-items:center;gap:10px;padding:10px 14px;background:rgba(30,20,12,.92);border:2px solid #e8a33d;border-radius:12px;color:#f3e6c8;font:400 14px Rubik,Arial,sans-serif;cursor:pointer;z-index:30;box-shadow:0 0 18px rgba(232,163,61,.45)';
  const css = document.createElement('style');
  css.textContent = '#phone b{display:block;color:#f2c14e;font-weight:700}#phone small{display:block;margin-top:2px}#phone .ph-key{color:#e8a33d;font-weight:700}#phone .ph-ico{font-size:28px;animation:phbuzz .18s infinite alternate}@keyframes phbuzz{from{transform:rotate(-12deg)}to{transform:rotate(12deg)}}body.touch #phone .ph-key{display:none}';
  document.head.appendChild(css); document.body.appendChild(el);

  const HELLO = [ // Tristan's line first: it is the one Hakan says most
    'Hey Eddy, allesch goed? Tamam Abi, ik heb die kipkraud nodig, vandaag.',
    'Hey Eddy, allesch goed? Tamam Abi, ik heb die kipkraud nodig, vandaag.',
    'Alo? Eddy abi! Allesch goed? Familie goed? Goed goed. Luister, die kipkraud is op. Helemaal op. Ik heb vandaag nodig.',
    'Eddy! Hakan hier. Allesch goed abi? Mijn klanten vragen: waar is die kipkraud van Eddy? Ik heb vandaag nodig, abi.',
    'Abi, allesch goed? Kort vraagje. Kipkraud. Vandaag. Dat was het vraagje.',
  ];
  const HOW_MUCH = ['Doe maar {kg} kilo, abi.', '{kg} kilo, en Hakan is blij.', '{kg} kilo. Niet die meel van de Lampas, he? Die echte.'];
  const EDDY = 'Ik ben niet in Nederland, dus mijn Shooki brengt ze je morgen, ok abi?';
  const OK = [
    'Tamam tamam! Shooki morgen. Selam aan Shooki, abi!',
    'Niet in Nederland? Abi, ik hoor de tram achter je... Tamam, morgen is goed.',
    'Weer niet in Nederland? Jij bent meer op vakantie dan mijn oom. Tamam, Shooki morgen.',
    'Morgen? Ok abi. Jouw kipkraud is de beste, mijn döner huilt zonder.',
    'Tamam abi. Zeg Shooki: niet weer twee uur thee drinken in mijn zaak.',
  ];
  const NO = ['Yok? Ah abi... Tamam, volgende keer. Doe rustig.', 'Geen kipkraud? Dan maak ik vandaag patat. Tamam, volgende keer abi.'];

  let ringing = 0, missed = false, wait = 60 + Math.random() * 90, buzz = 0, calls = 0;
  const canRing = () => state.step === 'free' && met('shooki') && !econ.ensure().phoneOrder && econ.ensure().phoneDay !== econ.ensure().day;

  function ring() { if (ringing) return; ringing = 12; buzz = 0; el.style.display = 'flex'; }
  function stop() { ringing = 0; el.style.display = 'none'; }
  function answer() {
    if (!ringing || busy()) return;
    stop(); calls++;
    const e = econ.ensure(), kg = rnd([5, 6, 8, 10, 12]), pay = econ.phoneQuote(kg);
    e.phoneDay = e.day; // one call a market day
    dialogue([
      ['Hakan (telefoon)', calls === 1 ? HELLO[0] : rnd(HELLO)],
      ['Hakan (telefoon)', rnd(HOW_MUCH).replace('{kg}', kg)],
    ], () => choice('Hakan (telefoon)', `<i>${kg} kg Kip Shoarma from your blend stock, delivered by Shooki at the next market day. About W ${pay.toLocaleString('nl-NL')}.</i>`, [EDDY, 'Sorry abi, deze week lukt het niet.'], (i) => {
      if (i === 0) {
        econ.phoneOrder(kg);
        dialogue([['Eddy Jr.', EDDY], ['Hakan (telefoon)', rnd(OK)]], () => toast('KIPKRAUD BESTELD', `${kg} kg Kip Shoarma for Hakan. Shooki drops it off at the next market day: keep enough in stock (Dagrapport).`, 4));
      } else dialogue([['Eddy Jr.', 'Sorry abi, deze week lukt het niet.'], ['Hakan (telefoon)', rnd(NO)]], () => d.save());
    }));
  }
  const keyLabel = () => { el.querySelector('.ph-key').textContent = `[${inputMode() === 'pad' ? glyph('E') : 'T'}]`; };
  onInputMode(keyLabel); keyLabel();
  el.addEventListener('click', (ev) => { ev.stopPropagation(); answer(); });
  addEventListener('keydown', (ev) => { if (ringing && (ev.code === 'KeyT' || (inputMode() === 'pad' && ev.code === 'KeyE'))) { ev.stopImmediatePropagation(); answer(); } }, true);

  function update(dt) {
    if (ringing) {
      ringing -= dt; buzz -= dt;
      if (buzz <= 0) { buzz = 1.6; beep(1180, 0.12, 'sine', 0.05); setTimeout(() => beep(940, 0.12, 'sine', 0.05), 140); setTimeout(() => beep(1180, 0.12, 'sine', 0.05), 280); }
      if (ringing <= 0) { stop(); missed = true; econ.ensure().phoneDay = econ.ensure().day; toast('GEMISTE OPROEP', 'Hakan Et & Döner. He\'ll call again another day.', 2.4); }
      return;
    }
    if (!canRing() || busy()) return;
    wait -= dt;
    if (wait <= 0) { wait = 90 + Math.random() * 120; ring(); }
  }
  return { update, ring, answer, get ringing() { return ringing > 0; }, get missed() { return missed; } };
}
