// Eddy's phone. It rings in the hub now and then (answer with T, a tap, or A on a controller):
// - Hakan from Hakan Et & Döner wants kipkruiden ("kipkraud"), today, abi. Eddy is "not in the Netherlands", so
//   cousin Shooki drops it off tomorrow: a small Kip Shoarma order that the next market day delivers from the blend
//   stock (econ.phoneOrder, paid in the Dagrapport). Hakan is a regular, friendly customer; the joke is the call.
// - Henk Cijfer rings the day before tax inspector Van der Belasting drops by (js/garage.js asks via warnHenk()).
// - Cousin Shooki calls for no reason at all, which is the reason.
// At most one random call (Hakan or Shooki) a market day; Henk's warning always gets through.

import { inputMode, glyph, onInputMode } from './input.js';

export function initPhone(d) {
  const { state, econ, dialogue, choice, toast, beep, busy, met } = d;
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

  const el = document.createElement('div');
  el.id = 'phone';
  el.innerHTML = '<div class="ph-face"><img alt=""><span class="ph-ico">&#128241;</span></div><div><b class="ph-name"></b><small><span class="ph-key">[T]</span> opnemen</small></div>';
  el.style.cssText = 'position:fixed;right:18px;bottom:110px;display:none;align-items:center;gap:10px;padding:10px 14px;background:rgba(30,20,12,.92);border:2px solid #e8a33d;border-radius:12px;color:#f3e6c8;font:400 14px Rubik,Arial,sans-serif;cursor:pointer;z-index:30;box-shadow:0 0 18px rgba(232,163,61,.45)';
  const css = document.createElement('style');
  css.textContent = '#phone b{display:block;color:#f2c14e;font-weight:700}#phone small{display:block;margin-top:2px}#phone .ph-key{color:#e8a33d;font-weight:700}#phone .ph-face{position:relative;width:46px;height:56px}#phone .ph-face img{width:46px;height:56px;object-fit:cover;border:2px solid #f2c14e;border-radius:6px}#phone .ph-face.noimg img{display:none}#phone .ph-face.noimg .ph-ico{position:static;display:block;font-size:34px;line-height:56px;text-align:center}#phone .ph-ico{position:absolute;right:-8px;bottom:-6px;font-size:20px;animation:phbuzz .18s infinite alternate}@keyframes phbuzz{from{transform:rotate(-12deg)}to{transform:rotate(12deg)}}body.touch #phone .ph-key{display:none}';
  document.head.appendChild(css); document.body.appendChild(el);

  // ------------------------------------------------------------------ Hakan: kipkraud
  const HAKAN = 'Hakan (telefoon)';
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
  let hakanCalls = 0;
  function talkHakan() {
    hakanCalls++;
    const kg = rnd([5, 6, 8, 10, 12]), pay = econ.phoneQuote(kg);
    econ.ensure().phoneDay = econ.ensure().day;
    dialogue([[HAKAN, hakanCalls === 1 ? HELLO[0] : rnd(HELLO)], [HAKAN, rnd(HOW_MUCH).replace('{kg}', kg)]],
      () => choice(HAKAN, `<i>${kg} kg Kip Shoarma from your blend stock, delivered by Shooki at the next market day. About ${fmt(pay)}.</i>`, [EDDY, 'Sorry abi, deze week lukt het niet.'], (i) => {
        if (i === 0) {
          econ.phoneOrder(kg);
          dialogue([['Eddy Jr.', EDDY], [HAKAN, rnd(OK)]], () => toast('KIPKRAUD BESTELD', `${kg} kg Kip Shoarma for Hakan. Shooki drops it off at the next market day: keep enough in stock (Dagrapport).`, 4));
        } else dialogue([['Eddy Jr.', 'Sorry abi, deze week lukt het niet.'], [HAKAN, rnd(NO)]], () => d.save());
      }));
  }

  // ------------------------------------------------------------------ Henk Cijfer: the tax inspector is coming
  const HENK = 'Henk Cijfer (telefoon)';
  const HENK_OPEN = [
    'Eddy. Henk Cijfer. Are you sitting down? Sit down.',
    'Eddy, it\'s Henk. My spreadsheet just turned red. Not the good red.',
    'Henk here. I\'ll be brief, phone calls cost money.',
    'Eddy? Henk. Don\'t say anything. Just listen. And maybe write this down.',
  ];
  const HENK_CLOSE = [
    'Receipts, Eddy. Receipts are love.',
    'And if he offers you a mint, it\'s a trap.',
    'Your father always paid in cash. Then he paid again, in fines.',
    'I\'ll pray for you. In Excel.',
  ];
  function talkHenk() {
    const fine = d.inspectorFine ? d.inspectorFine() : 0, luik = d.hasLuik && d.hasLuik();
    dialogue([
      [HENK, rnd(HENK_OPEN)],
      [HENK, 'A tax inspector is coming tomorrow. Van der Belasting. I recognise his Volvo from 1998.'],
      [HENK, fine > 0 ? `With the cash you carry he'll write you up for about ${fmt(fine)}. Spend some of it, or hide it.${luik ? ' That hidden compartment in the Oofmobiel? Today it earns its money.' : ' Mo can build a hidden compartment in the van, you know.'}` : 'You don\'t carry much right now. Keep it that way and he leaves with nothing but a sore pen.'],
      ['Eddy Jr.', rnd(['Thanks, Henk. What would I do without you?', 'Henk, you\'re a hero.', 'Can\'t you just... do his books too?'])],
      [HENK, rnd(HENK_CLOSE)],
    ], () => d.save());
  }
  const henkVoicemail = () => toast('VOICEMAIL: HENK CIJFER', '"Eddy. Psst. A tax inspector is coming tomorrow. Van der Belasting. Spend some cash, or hide it."', 5);

  // ------------------------------------------------------------------ Shooki: just calling, bro
  const SHOOKI = 'Shooki (telefoon)';
  function shookiLines() {
    const e = econ.ensure(), pool = [
      [[SHOOKI, 'Bro! You busy? No? Good. Me neither.'], ['Eddy Jr.', 'Shooki, why are you calling?'], [SHOOKI, 'To check, bro. Checked. Ok bye.']],
      [[SHOOKI, 'Cousin! Tante Gerda asks if you eat. I said yes. Do you eat?'], ['Eddy Jr.', 'I eat, Shooki.'], [SHOOKI, 'Eat more, she says. I am only the messenger, bro.']],
      [[SHOOKI, 'Bro, Hakan says you are "not in the Netherlands". Where are you?'], ['Eddy Jr.', '...Abroad.'], [SHOOKI, 'Bro. I can see your van. I am standing next to it.']],
      [[SHOOKI, 'Bro, I\'m at Hakan\'s. He gave me tea. Then more tea. Then soup.'], [SHOOKI, 'I think I live here now. Tell Tante Gerda.']],
      [[SHOOKI, 'Quick question, bro. Kipkraud and kipkruiden. Same thing?'], ['Eddy Jr.', 'Same thing.'], [SHOOKI, 'Ok good. I have been nodding for three weeks.']],
      [[SHOOKI, 'Bro, my second phone died. I\'m calling from my third phone.'], [SHOOKI, 'Save the number. Actually, don\'t.']],
      [[SHOOKI, 'Bro! I sold a ringtone today. Ringtones are coming back, I told you.'], ['Eddy Jr.', 'To who?'], [SHOOKI, 'Tante Gerda. But still, bro.']],
      [[SHOOKI, 'Bro, a Lampas guy waved at me. Friendly wave. Or a fist. Hard to say from far.'], [SHOOKI, 'I waved back. With a fist. To be safe.']],
    ];
    if (e.phoneOrder) pool.push([[SHOOKI, `Bro, Hakan's kipkraud tomorrow, yes? ${e.phoneOrder.kg} kilo.`], [SHOOKI, 'Make sure there is Kip Shoarma on the shelf. Last time I stood there with empty hands drinking his tea like a criminal.']]);
    if ((e.jobs || []).some((j) => /Shooki/.test(j.title) && !j.done)) pool.push([[SHOOKI, 'Bro, check your Klusbord. I put a deal on it.'], [SHOOKI, 'The buyer asks no questions. I asked him one. He didn\'t answer. Perfect man.']]);
    return rnd(pool);
  }
  const talkShooki = () => dialogue(shookiLines(), () => d.save());

  // ------------------------------------------------------------------ the phone itself
  const CALLERS = {
    hakan: { name: 'Hakan Et &amp; Döner', img: './assets/face_hakan.jpg', talk: talkHakan, missed: () => toast('GEMISTE OPROEP', 'Hakan Et & Döner. He\'ll call again another day.', 2.4) },
    henk: { name: 'Henk Cijfer', img: null, talk: talkHenk, missed: henkVoicemail },
    shooki: { name: 'Shooki', img: null, talk: talkShooki, missed: () => toast('GEMISTE OPROEP', 'Shooki. Probably nothing. It\'s always nothing.', 2.4) },
  };
  let ringing = 0, who = null, buzz = 0, wait = 60 + Math.random() * 90, henkDue = false, henkWait = 0;
  const randomOk = () => state.step === 'free' && met('shooki') && econ.ensure().callDay !== econ.ensure().day;

  function ring(id = 'hakan') {
    if (ringing) return false;
    const c = CALLERS[id]; who = id; ringing = id === 'henk' ? 20 : 12; buzz = 0;
    el.querySelector('.ph-name').innerHTML = c.name;
    const face = el.querySelector('.ph-face'), img = face.querySelector('img');
    face.classList.toggle('noimg', !c.img); if (c.img) img.src = c.img;
    el.style.display = 'flex'; return true;
  }
  function stop() { ringing = 0; el.style.display = 'none'; }
  function answer() { if (!ringing || busy()) return; const id = who; stop(); CALLERS[id].talk(); }
  // garage.js calls this the day before the inspector comes; returns true when the phone takes over from the toast
  function warnHenk() { henkDue = true; henkWait = 3 + Math.random() * 4; return true; }

  const keyLabel = () => { el.querySelector('.ph-key').textContent = `[${inputMode() === 'pad' ? glyph('E') : 'T'}]`; };
  onInputMode(keyLabel); keyLabel();
  el.addEventListener('click', (ev) => { ev.stopPropagation(); answer(); });
  addEventListener('keydown', (ev) => { if (ringing && (ev.code === 'KeyT' || (inputMode() === 'pad' && ev.code === 'KeyE'))) { ev.stopImmediatePropagation(); answer(); } }, true);

  function update(dt) {
    if (ringing) {
      ringing -= dt; buzz -= dt;
      if (buzz <= 0) { buzz = 1.6; beep(1180, 0.12, 'sine', 0.05); setTimeout(() => beep(940, 0.12, 'sine', 0.05), 140); setTimeout(() => beep(1180, 0.12, 'sine', 0.05), 280); }
      if (ringing <= 0) { const id = who; stop(); CALLERS[id].missed(); }
      return;
    }
    if (busy()) return;
    if (henkDue) { henkWait -= dt; if (henkWait <= 0 && ring('henk')) henkDue = false; return; }
    if (!randomOk()) return;
    wait -= dt;
    if (wait > 0) return;
    wait = 90 + Math.random() * 120;
    const e = econ.ensure(), hakanOk = !e.phoneOrder && e.phoneDay !== e.day;
    e.callDay = e.day; // one random call a market day, answered or not
    ring(hakanOk && Math.random() < 0.6 ? 'hakan' : 'shooki');
  }
  return { update, ring, answer, warnHenk, get ringing() { return ringing > 0; }, get caller() { return ringing > 0 ? who : null; } };
}
