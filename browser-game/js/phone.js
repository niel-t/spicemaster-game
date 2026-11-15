// Eddy's phone. It rings in the hub now and then (answer with T, a tap, or A on a controller):
// - Hakan from Hakan Et & Döner wants kipkruiden ("kipkraud"), today, abi. Eddy is "not in the Netherlands", so
//   cousin Shooki drops it off tomorrow: a small Kip Shoarma order that the next market day delivers from the blend
//   stock (econ.phoneOrder, paid in the Dagrapport). Hakan is a regular, friendly customer; the joke is the call.
// - Henk Cijfer rings the day before tax inspector Van der Belasting drops by (js/garage.js asks via warnHenk()).
// - Cousin Shooki calls for no reason at all, which is the reason.
// - Razim, Eddy's annoying friend (Game Bible: "keeps calling Eddy every time to meet, eat shoarma, or hang out"),
//   spams the Shmokia with texts in bursts and sometimes calls. Read them under Razim in the contacts. You can't block him.
// - Ras al Gara rings once, right after the Noshgey Kariot fall: the Paravim want the three shipments Dad never paid (main.js asks via callRas()).
// Press T to open the Shmokia yourself: call contacts and trade spice (buy at the Kruidenbeurs, Shooki sells blends).
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
  function talkHakan(eddyCalls) {
    hakanCalls++;
    const kg = rnd([5, 6, 8, 10, 12]), pay = econ.phoneQuote(kg);
    econ.ensure().phoneDay = econ.ensure().day;
    dialogue([[HAKAN, eddyCalls ? rnd(['Eddy abi! Ik wou je net bellen! Allesch goed? Ja, ik heb die kipkraud nodig, vandaag.', 'Alo? Eddy! Jij belt mij? Allah allah. Tamam, kipkraud, ja, ik heb nodig.']) : hakanCalls === 1 ? HELLO[0] : rnd(HELLO)], [HAKAN, rnd(HOW_MUCH).replace('{kg}', kg)]],
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
  // ------------------------------------------------------------------ Ras al Gara: the Paravim want their money (once, after Act 2)
  const RAS = 'Ras al Gara (telefoon)';
  function talkRas() {
    dialogue([
      [RAS, 'Eddy junior. Spreek ik met Eddy junior? Goed. Dan spreek ik met de schuldenaar.'],
      ['Eddy Jr.', 'Met wie spreek ik?'],
      [RAS, 'Ras al Gara. Paravim. Wij hebben jouw vader dertig jaar lang kruiden gebracht, op kamelen, door de woestijn. Za’atar, sumak, ras el hanout.'],
      [RAS, 'Drie zendingen. DRIE. Nooit betaald. Wij zijn de woestijn overgestoken voor dat geld, en het is hier koud, en het regent, en ik ben boos.'],
      ['Eddy Jr.', 'Mijn vader betaalde altijd. Altijd.'],
      [RAS, 'Dan heeft hij een hele rare manier van "altijd". Kom maar naar De Zandwijk, kaaskop. Breng geld mee. Met rente.'],
      ['Eddy Jr.', rnd(['Ik kom eraan. Maar niet met geld.', 'Ik ben niet in Nederland. ...Ok, ik kom.', 'Rente? Op een schuld die niet bestaat?'])],
      [RAS, 'Iedereen in De Zandwijk weet hoe je eruitziet. Iedereen is boos. Tot zo.'],
    ], () => { if (d.rasDone) d.rasDone(); d.save(); });
  }
  const rasVoicemail = () => { toast('VOICEMAIL: ONBEKEND NUMMER', '"Ras al Gara. Paravim. Je vader is ons drie zendingen schuldig. Kom naar De Zandwijk. Met geld. Met RENTE." De Zandwijk is open on the map.', 7); if (d.rasDone) d.rasDone(); };
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

  // ------------------------------------------------------------------ Razim: the annoying friend. Shoarma? Shoarma.
  // He texts in bursts (a little SMS card with his portrait, a Nokia double beep), keeps them in Eddy's inbox,
  // and now and then rings. Good-natured: he just really, really wants to eat shoarma with Eddy.
  const RAZIM = 'Razim (telefoon)', RAZ_IMG = './assets/face_razim.jpg';
  const SPAM = [
    ['eddy', 'eddy', 'EDDY', 'shoarma?'],
    ['yo eddy you free?', 'shoarma at Schmatzel?', 'i\'m already here', 'i ordered for you', 'you\'re paying btw'],
    ['eddy where are you', 'Hakan says you\'re "not in Nederland"', 'i can see the Oofmobiel from here', 'i\'m waving', 'wave back'],
    ['kapsalon tonight?', 'ok shoarma then', 'ok broodje then', 'ok just come sit with me then'],
    ['are you mad at me', 'you didn\'t reply in 4 minutes', 'it\'s fine', 'shoarma?'],
    ['eddy i had a dream', 'we opened a shoarma joint together', 'it was called RAZDY\'S', 'think about it'],
    ['eddy look', '[foto: broodje shoarma]', 'this one is for you', 'i ate it'],
    ['eddy ik sta voor je deur', 'grapje', 'of toch wel', 'doe open'],
    ['eddy u up', 'for shoarma'],
    ['can i come to the warehouse', 'i\'ll bring knoflooksaus', 'the good one', 'i\'m coming', 'ok i\'m not coming. shoarma?'],
    ['eddy what is a Naknik', 'Shooki told me but i didn\'t understand', 'do they eat shoarma'],
    ['eddy quick question', 'shoarma?', 'that was the question'],
    ['bro i got a new phone', 'it\'s the same phone', 'but i put a sticker on it', 'shoarma to celebrate?'],
  ];
  const SPAM_BACK = ['you back in Nederland yet?', 'how about now', 'and now?', 'i\'ll wait. at Schmatzel. eating.'];
  const SPAM_MISSED = ['why u no pick up', 'i called', 'it was about shoarma'];
  const smsEl = document.createElement('div');
  smsEl.id = 'razsms';
  smsEl.style.cssText = 'position:fixed;right:18px;bottom:180px;display:none;align-items:center;gap:10px;max-width:280px;padding:8px 12px 8px 8px;background:rgba(30,20,12,.94);border:2px solid #9bbf5a;border-radius:12px;color:#f3e6c8;font:400 14px Rubik,Arial,sans-serif;z-index:30;box-shadow:0 0 14px rgba(155,191,90,.4);cursor:pointer';
  smsEl.innerHTML = `<img src="${RAZ_IMG}" alt="Razim" style="width:40px;height:50px;object-fit:cover;border:2px solid #f2c14e;border-radius:6px;flex:none"><div><b style="display:block;color:#b4cc7a;font-weight:700;font-size:12px;letter-spacing:1px">SMS · RAZIM <span class="rz-n"></span></b><span class="rz-t"></span></div>`;
  document.body.appendChild(smsEl);
  const raz = () => { const e = econ.ensure(); if (!Array.isArray(e.razimSms)) e.razimSms = []; return e; };
  let smsQueue = [], smsGap = 0, smsShow = 0, smsBurst = 0;
  function razimText(lines) { smsQueue.push(...lines); }
  function popSms() {
    const t = smsQueue.shift(), e = raz();
    e.razimSms.push({ t, d: e.day }); if (e.razimSms.length > 40) e.razimSms.splice(0, e.razimSms.length - 40);
    e.razimUnread = (e.razimUnread || 0) + 1;
    smsEl.querySelector('.rz-t').textContent = t;
    smsEl.querySelector('.rz-n').textContent = e.razimUnread > 1 ? `(${e.razimUnread})` : '';
    smsEl.style.display = 'flex'; smsShow = 3.2; smsGap = 1.4 + Math.random() * 1.6;
    beep(1760, 0.07, 'square', 0.03); setTimeout(() => beep(1760, 0.07, 'square', 0.03), 120);
    if (d.tip) d.tip('razim');
  }
  smsEl.addEventListener('click', (ev) => { ev.stopPropagation(); smsEl.style.display = 'none'; smsShow = 0; });
  smsEl.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  function talkRazim(eddyCalls) {
    const e = raz(), n = e.razimSms.length;
    e.razimCalls = (e.razimCalls || 0) + 1;
    dialogue(eddyCalls ? [
      [RAZIM, rnd(['EDDY?! You called ME? Wait, let me sit down.', 'Eddy! You never call! Is it shoarma? Tell me it\'s shoarma.'])],
      ['Eddy Jr.', 'Hey Razim. Just checking in.'],
      [RAZIM, 'Checking in. Like friends do. Ok. So... shoarma?'],
    ] : [
      [RAZIM, n ? 'Eddy! Finally! Did you get my messages?' : 'Eddy! It\'s Razim! Long time! Like, since Tuesday!'],
      ...(n ? [['Eddy Jr.', `All ${n} of them.`], [RAZIM, 'So you read them. So you know. So... shoarma?']] : [[RAZIM, 'Shoarma? Today? Now? I\'m hungry, you\'re hungry, it\'s science.']]),
    ], () => choice(RAZIM, '<i>Razim wants to eat shoarma. Razim always wants to eat shoarma.</i>', ['Tamam, after work. You\'re buying.', 'I\'m not in Nederland, Razim.'], (i) => {
      if (i === 0) {
        dialogue([['Eddy Jr.', 'Tamam, after work. You\'re buying.'], [RAZIM, rnd([
          'YES. Schmatzel\'s, seven o\'clock. I\'ll be there at six. Just in case.',
          'Deal! I\'m buying! ...Can you lend me twenty Wilders?',
          'Eddy, this is the best day of my week. Don\'t be late. You\'re always late. Be late, I don\'t care, just come.',
        ])]], () => { razimText(['see you there!!', 'saving you a seat', rnd(['already eating btw', 'ok i started without you', 'they gave me extra knoflooksaus for you. i ate it'])]); d.save(); });
      } else {
        dialogue([['Eddy Jr.', 'I\'m not in Nederland, Razim.'], [RAZIM, rnd([
          'You said that last week. And the week before. Are you EVER in Nederland?',
          'Eddy. I\'m standing next to your van. I\'m touching it right now.',
          'Ok... shoarma when you\'re back. I\'ll text you. A little bit.',
        ])]], () => { razimText(SPAM_BACK.slice(0, 2 + Math.floor(Math.random() * 3))); d.save(); });
      }
    }));
  }
  const razimMissed = () => { toast('GEMISTE OPROEP', 'Razim. Third time today. He\'ll text.', 2.4); razimText(SPAM_MISSED); };

  // ------------------------------------------------------------------ the Shmokia: Eddy's own phone menu (T when it isn't ringing)
  // Contacts you can call yourself, and trade spice with: Hakan takes kipkraud, Shooki runs blends to the Groothandel,
  // the Kruidenbeurs line sells ingredients, Henk tips tomorrow's prices, De Fluisteraar sells a rumour.
  const shm = document.createElement('div');
  shm.id = 'shmokia';
  shm.innerHTML = '<div class="sm-ear"></div><div class="sm-logo">SHMOKIA</div><div class="sm-screen"><div class="sm-status"><span>&#9602;&#9603;&#9605;&#9607;</span><span class="sm-day"></span><span>&#9646;&#9646;&#9646;&#9647;</span></div><div class="sm-title"></div><div class="sm-list"></div><div class="sm-msg"></div></div>'
    + '<div class="sm-soft"><button data-sk="ok">Kies</button><button data-sk="back">Terug</button></div><div class="sm-nav"><button data-sk="up">&#9650;</button><button data-sk="down">&#9660;</button></div>'
    + '<div class="sm-keys">' + ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => `<button data-k="${k}">${k}</button>`).join('') + '</div>';
  const scss = document.createElement('style');
  scss.textContent = '#shmokia{position:fixed;right:28px;bottom:24px;width:236px;padding:14px 16px 18px;box-sizing:border-box;display:none;z-index:31;border-radius:46px 46px 40px 40px/70px 70px 50px 50px;background:linear-gradient(90deg,#8d939c,#d7dbe1 30%,#eef0f3 50%,#c9cdd4 75%,#868c95);box-shadow:0 10px 40px rgba(0,0,0,.6),inset 0 0 0 2px rgba(255,255,255,.35);font-family:VT323,monospace;user-select:none}'
    + '#shmokia .sm-ear{width:54px;height:6px;margin:4px auto 6px;border-radius:3px;background:#2a2d33;box-shadow:inset 0 1px 2px #000}'
    + '#shmokia .sm-logo{text-align:center;font:900 19px Rubik,Arial,sans-serif;letter-spacing:2px;color:#1d3a8e;transform:scaleX(1.25);margin-bottom:6px}'
    + '#shmokia .sm-screen{background:linear-gradient(160deg,#b4cc7a,#93ad5c);border:6px solid #2c3036;border-radius:10px 10px 18px 18px;box-shadow:inset 0 0 12px rgba(0,0,0,.35);color:#1e2a12;padding:3px 6px 4px;height:206px;box-sizing:border-box;display:flex;flex-direction:column;font-size:18px;line-height:18px}'
    + '#shmokia .sm-status{display:flex;justify-content:space-between;font-size:15px}'
    + '#shmokia .sm-title{text-align:center;border-bottom:2px solid #1e2a12;margin-bottom:2px;white-space:nowrap;overflow:hidden}'
    + '#shmokia .sm-list{flex:1;overflow:hidden}#shmokia .sm-it{display:flex;justify-content:space-between;gap:4px;padding:0 3px;cursor:pointer;white-space:nowrap}#shmokia .sm-it span:first-child{overflow:hidden;text-overflow:ellipsis}#shmokia .sm-it.sel{background:#1e2a12;color:#b4cc7a}'
    + '#shmokia .sm-msg{min-height:36px;border-top:2px solid #1e2a12;font-size:16px;line-height:16px;padding-top:2px}'
    + '#shmokia button{font:18px VT323,monospace;cursor:pointer;border:0;color:#e8eaee;background:linear-gradient(#4a4f57,#2b2f35);box-shadow:0 2px 0 #15171a}'
    + '#shmokia .sm-soft{display:flex;justify-content:space-between;margin:10px 4px 6px}#shmokia .sm-soft button{width:72px;height:22px;border-radius:11px}'
    + '#shmokia .sm-nav{display:flex;justify-content:center;gap:4px;margin-bottom:8px}#shmokia .sm-nav button{width:56px;height:20px;border-radius:10px}'
    + '#shmokia .sm-keys{display:grid;grid-template-columns:repeat(3,1fr);gap:6px 12px;padding:0 6px}#shmokia .sm-keys button{height:20px;border-radius:12px 12px 10px 10px/14px 14px 8px 8px;font-size:17px}'
    + '#shmbtn{position:fixed;right:18px;top:50%;display:none;z-index:29;padding:8px 10px;border-radius:10px;border:2px solid #e8a33d;background:rgba(30,20,12,.9);color:#f2c14e;font:900 12px Rubik,Arial,sans-serif;letter-spacing:1px}body.touch #shmbtn.on{display:block}';
  document.head.appendChild(scss); document.body.appendChild(shm);
  const tbtn = document.createElement('button'); tbtn.id = 'shmbtn'; tbtn.textContent = 'SHMOKIA'; document.body.appendChild(tbtn);

  let isOpen = false, stack = [], sel = 0, msg = '', qty = 5, grade = 'std', cur = null;
  const usable = () => ['russian', 'free'].includes(state.step);
  const say = (t) => { msg = t; render(); };
  const ingName = (id) => econ.INGREDIENTS.find((g) => g.id === id).name;
  const SCREENS = {
    contacts() {
      const e = econ.ensure(), list = [];
      if (met('shooki')) list.push({ l: 'Hakan Et&Döner', go: 'hakan' }, { l: 'Shooki', go: 'shooki' });
      if (met('shooki') || raz().razimSms.length) list.push({ l: 'Razim', r: raz().razimUnread ? `${raz().razimUnread} sms` : '', go: 'razim' });
      if (state.table) list.push({ l: 'Kruidenbeurs', go: 'beurs' });
      if (econ.has('prognose')) list.push({ l: 'Henk Cijfer', go: 'henk' });
      if (econ.has('geruchten')) list.push({ l: 'De Fluisteraar', go: 'fluist' });
      list.push({ l: 'Tante Gerda', go: 'gerda' });
      return { t: 'Contacten', items: list, foot: `W ${state.money.toLocaleString('nl-NL')}` };
    },
    hakan() {
      return { t: 'Hakan Et&Döner', items: [{ l: 'Bel: kipkraud?', act: () => {
        const e = econ.ensure();
        if (e.phoneOrder) return say('"Morgen abi, Shooki brengt. Tamam!"');
        if (e.phoneDay === e.day) return say('"Vandaag heb ik al, abi. Morgen bellen!"');
        close(); talkHakan(true);
      } }, { l: 'Kip op voorraad', r: `${Math.floor(econ.blendOf('kip').kg)}kg` }] };
    },
    shooki() {
      const e = econ.ensure();
      return { t: 'Shooki', items: [{ l: 'Bellen', act: () => { close(); talkShooki(); } }, { l: 'Blend wegbrengen', go: 'groot' }], foot: `Groothandel wil nog ${e.wholesaleLeft} kg` };
    },
    groot() {
      const e = econ.ensure(), items = econ.BLENDS.filter((b) => econ.blendOf(b.id).kg >= 1).map((b) => ({ l: b.name, r: `W${econ.wholesalePrice(b.id)}`, act: () => {
        const r = econ.sellBlend(b.id, Math.min(10, Math.floor(econ.blendOf(b.id).kg)));
        say(r.ok ? `Shooki: "Gedaan bro." ${r.kg}kg +W${r.pay}` : r.why);
      } }));
      return { t: 'Shooki > Groothandel', items: items.length ? items : [{ l: '(geen blends)' }], foot: `10 kg per keer, nog ${e.wholesaleLeft} kg` };
    },
    beurs() {
      const items = [
        { l: 'Per keer', r: `${qty} kg`, act: () => { qty = qty === 1 ? 5 : qty === 5 ? 25 : 1; render(); } },
        { l: 'Levering', r: econ.ensure().express ? 'morgen+25%' : '2 dagen', act: () => { const e = econ.ensure(); e.express = !e.express; d.save(); render(); } },
        { l: 'Kwaliteit', r: econ.GRADES.find((g) => g.id === grade).name.slice(0, 9), act: () => { const i = econ.GRADES.findIndex((g) => g.id === grade); grade = econ.GRADES[(i + 1) % econ.GRADES.length].id; render(); } },
        ...econ.INGREDIENTS.filter((g) => econ.ingOpen(g)).map((g) => ({ l: g.name, r: `W${econ.expressCost(econ.price(g.id, grade), econ.ensure().express)}${econ.has('prognose') ? (econ.forecast(g.id) > 0 ? '▲' : '▼') : ''}`, act: () => {
          const r = econ.buy(g.id, grade, qty);
          say(r.ok ? `${r.kg}kg ${g.name} -W${r.cost}, komt dag ${r.day}` : r.why);
        } })),
      ];
      return { t: 'Kruidenbeurs', items, foot: `Opslag ${econ.stockTotal()}+${econ.inboundKg()}/${econ.cap()} kg` };
    },
    henk() {
      return { t: 'Henk Cijfer', items: [{ l: 'Bel: tip?', act: () => {
        const ids = econ.INGREDIENTS.filter((g) => econ.ingOpen(g)).map((g) => g.id).sort((a, b) => Math.abs(econ.forecast(b)) - Math.abs(econ.forecast(a)));
        const up = econ.forecast(ids[0]) > 0;
        say(`Henk: "${ingName(ids[0])} ${up ? 'gaat omhoog. Koop vandaag.' : 'zakt. Wacht een dag.'}"`);
      } }] };
    },
    fluist() {
      return { t: 'De Fluisteraar', items: [{ l: 'Gerucht', r: 'W50', act: () => {
        const e = econ.ensure();
        if (e.whisperDay === e.day) return say(`(fluistert) ${econ.rumour()}.`);
        if (state.money < 50) return say('(fluistert) Vijftig. Niet negenenveertig.');
        d.addMoney(-50); e.whisperDay = e.day; d.save(); say(`(fluistert) ${econ.rumour()}.`);
      } }] };
    },
    razim() {
      const e = raz(); e.razimUnread = 0;
      return { t: 'Razim', items: [
        { l: 'Berichten', r: `${e.razimSms.length}`, go: 'razimsms' },
        { l: 'Bellen', act: () => { close(); talkRazim(true); } },
        { l: 'Blokkeren', act: () => say(rnd(['Razim: "did you just try to block me? lol. shoarma?"', 'Nummer geblokkeerd. ...Razim belt via Shooki.', 'Weet u het zeker? Razim weet het niet.'])) },
      ] };
    },
    razimsms() {
      const e = raz(), list = e.razimSms.slice().reverse();
      return { t: 'Razim > Berichten', items: list.length ? list.map((m) => ({ l: m.t, act: () => say(`dag ${m.d}: "${m.t}"`) })) : [{ l: '(nog niks... wacht maar)' }], foot: 'Antwoorden? Dat helpt niet.' };
    },
    gerda() {
      return { t: 'Tante Gerda', items: [{ l: 'Bellen', act: () => say(rnd(['"Eddy! Eet je wel?"', '"Shooki zegt dat je in het buitenland bent. Ik zie je busje, jongen."', '"Kom zondag eten. Neem kipkraud mee."'])) }] };
    },
  };
  function render() {
    const s = cur = SCREENS[stack.at(-1)]();
    sel = Math.max(0, Math.min(sel, s.items.length - 1));
    shm.querySelector('.sm-day').textContent = `dag ${econ.ensure().day}`;
    shm.querySelector('.sm-title').textContent = s.t;
    const start = Math.max(0, Math.min(sel - 2, s.items.length - 6)); // a window of 6 rows that follows the cursor
    shm.querySelector('.sm-list').innerHTML = s.items.slice(start, start + 6).map((it, k) => `<div class="sm-it${start + k === sel ? ' sel' : ''}" data-i="${start + k}"><span>${start + k + 1} ${it.l}</span><span>${it.r || (it.go ? '&gt;' : '')}</span></div>`).join('');
    shm.querySelector('.sm-msg').textContent = msg || s.foot || '';
  }
  function pick(i = sel) {
    const it = cur && cur.items[i]; if (!it) return;
    sel = i; beep(1400, 0.03, 'square', 0.03);
    if (it.go) { stack.push(it.go); sel = 0; msg = ''; render(); } else if (it.act) it.act(); else render();
  }
  const move = (k) => { sel = (sel + k + cur.items.length) % cur.items.length; render(); };
  function back() { beep(900, 0.03, 'square', 0.03); if (stack.length > 1) { stack.pop(); sel = 0; msg = ''; render(); } else close(); }
  function open() { if (isOpen || ringing || busy() || !usable()) return; isOpen = true; if (d.tip) d.tip('shmokia'); stack = ['contacts']; sel = 0; msg = ''; render(); shm.style.display = 'block'; beep(1200, 0.05, 'square', 0.03); }
  function close() { if (!isOpen) return; isOpen = false; shm.style.display = 'none'; }
  shm.addEventListener('click', (ev) => {
    ev.stopPropagation();
    const it = ev.target.closest('.sm-it'), b = ev.target.closest('button');
    if (it) return pick(+it.dataset.i);
    if (!b) return;
    if (b.dataset.k && /\d/.test(b.dataset.k)) return pick((+b.dataset.k || 10) - 1);
    const f = { ok: () => pick(), back, up: () => move(-1), down: () => move(1) }[b.dataset.sk]; if (f) f();
  });
  shm.addEventListener('pointerdown', (ev) => ev.stopPropagation());
  tbtn.addEventListener('click', (ev) => { ev.stopPropagation(); open(); });
  addEventListener('keydown', (ev) => {
    if (!isOpen) return;
    ev.stopImmediatePropagation(); ev.preventDefault();
    const c = ev.code;
    if (c === 'ArrowUp' || c === 'KeyW') move(-1);
    else if (c === 'ArrowDown' || c === 'KeyS') move(1);
    else if (c === 'Enter' || c === 'KeyE' || c === 'Space' || c === 'ArrowRight' || c === 'KeyD') pick();
    else if (c === 'Escape' || c === 'Backspace' || c === 'ArrowLeft' || c === 'KeyA') back();
    else if (c === 'KeyT') close();
    else { const m = /^(?:Digit|Numpad)(\d)$/.exec(c); if (m) pick((+m[1] || 10) - 1); }
  }, true);

  // ------------------------------------------------------------------ the phone itself
  const CALLERS = {
    hakan: { name: 'Hakan Et &amp; Döner', img: './assets/face_hakan.jpg', talk: talkHakan, missed: () => toast('GEMISTE OPROEP', 'Hakan Et & Döner. He\'ll call again another day.', 2.4) },
    henk: { name: 'Henk Cijfer', img: './assets/face_henk.jpg', talk: talkHenk, missed: henkVoicemail },
    ras: { name: 'Onbekend nummer', img: null, talk: talkRas, missed: rasVoicemail },
    razim: { name: 'Razim', img: RAZ_IMG, talk: talkRazim, missed: razimMissed },
    shooki: { name: 'Shooki', img: './assets/face_shooki.jpg', talk: talkShooki, missed: () => toast('GEMISTE OPROEP', 'Shooki. Probably nothing. It\'s always nothing.', 2.4) },
  };
  let razWait = 40 + Math.random() * 60;
  let ringing = 0, who = null, buzz = 0, wait = 60 + Math.random() * 90, henkDue = false, henkWait = 0, rasDue = false, rasWait = 0;
  const randomOk = () => state.step === 'free' && met('shooki') && !(state.tut && !state.tut.done) && econ.ensure().callDay !== econ.ensure().day;

  function ring(id = 'hakan') {
    if (ringing) return false;
    const c = CALLERS[id]; who = id; ringing = id === 'henk' || id === 'ras' ? 20 : 12; buzz = 0;
    el.querySelector('.ph-name').innerHTML = c.name;
    const face = el.querySelector('.ph-face'), img = face.querySelector('img');
    face.classList.toggle('noimg', !c.img); if (c.img) img.src = c.img;
    el.style.display = 'flex'; if (d.tip) d.tip('phone'); return true;
  }
  function stop() { ringing = 0; el.style.display = 'none'; }
  function answer() { if (!ringing || busy()) return; const id = who; stop(); CALLERS[id].talk(); }
  // garage.js calls this the day before the inspector comes; returns true when the phone takes over from the toast
  function warnHenk() { henkDue = true; henkWait = 3 + Math.random() * 4; return true; }
  function callRas() { rasDue = true; rasWait = 8 + Math.random() * 4; }

  const keyLabel = () => { el.querySelector('.ph-key').textContent = `[${inputMode() === 'pad' ? glyph('E') : 'T'}]`; };
  onInputMode(keyLabel); keyLabel();
  el.addEventListener('click', (ev) => { ev.stopPropagation(); answer(); });
  addEventListener('keydown', (ev) => {
    if (ringing && (ev.code === 'KeyT' || (inputMode() === 'pad' && ev.code === 'KeyE'))) { ev.stopImmediatePropagation(); answer(); }
    else if (ev.code === 'KeyT' && !isOpen && !ev.repeat) { ev.stopImmediatePropagation(); open(); }
  }, true);

  // Razim's texts run alongside everything else in the hub: bursts every few minutes, at most three a market day
  function updateSms(dt) {
    if (smsShow > 0 && (smsShow -= dt) <= 0) smsEl.style.display = 'none';
    if (busy()) { smsEl.style.display = 'none'; smsShow = 0; return; }
    if (ringing || isOpen || !usable()) return;
    if (smsQueue.length) { if ((smsGap -= dt) <= 0) popSms(); return; }
    if (state.step !== 'free' || !met('shooki') || (state.tut && !state.tut.done)) return;
    const e = raz();
    if (e.razimDay !== e.day) { e.razimDay = e.day; smsBurst = 0; }
    if (smsBurst >= 3 || (razWait -= dt) > 0) return;
    razWait = 120 + Math.random() * 150; smsBurst++;
    razimText(rnd(SPAM)); smsGap = 0;
  }

  function update(dt) {
    updateSms(dt);
    tbtn.classList.toggle('on', usable() && !busy() && !isOpen && !ringing);
    if (isOpen && (busy() || !usable())) close();
    if (isOpen) return; // no calls while Eddy is on his own phone
    if (ringing) {
      ringing -= dt; buzz -= dt;
      if (buzz <= 0) { buzz = 1.6; beep(1180, 0.12, 'sine', 0.05); setTimeout(() => beep(940, 0.12, 'sine', 0.05), 140); setTimeout(() => beep(1180, 0.12, 'sine', 0.05), 280); }
      if (ringing <= 0) { const id = who; stop(); CALLERS[id].missed(); }
      return;
    }
    if (busy()) return;
    if (henkDue) { henkWait -= dt; if (henkWait <= 0 && ring('henk')) henkDue = false; return; }
    if (rasDue) { rasWait -= dt; if (rasWait <= 0 && ring('ras')) rasDue = false; return; }
    if (!randomOk()) return;
    wait -= dt;
    if (wait > 0) return;
    wait = 90 + Math.random() * 120;
    const e = econ.ensure(), hakanOk = !e.phoneOrder && e.phoneDay !== e.day;
    e.callDay = e.day; // one random call a market day, answered or not
    const r = Math.random();
    ring(hakanOk && r < 0.5 ? 'hakan' : r < 0.75 ? 'razim' : 'shooki');
  }
  return { update, ring, answer, warnHenk, callRas, razimText, open, close, get isOpen() { return isOpen; }, get ringing() { return ringing > 0; }, get caller() { return ringing > 0 ? who : null; } };
}
