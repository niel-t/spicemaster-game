// Freddy Sr. comes back (Tristan 2026-11-22): once Kipkruidenkwartier is Eddy's, Pa calls from Costa del Kaas. He lands at
// Schiptagat, the little airport south of Kaaspark, and Eddy fetches him in the Oofmobiel (a drive to the airport: js/rit.js
// opts.airport). From then on he rides along: he walks behind Eddy in the street, sits in the van on every drive and waits
// outside every raid, and he says what he thinks, good or bad. He joins the meetings too: Nabil, Schmatzel, The Russian,
// Ome Joop, Shooki and the rest get a word from him (chime() adds his line to their dialogue).
// state.freddy = { called, back, follow, met: { who: true }, said: { key: n }, day }
import { createPortraits } from './portrait.js';

const rnd = (a) => a[Math.floor(Math.random() * a.length)];

// what Pa says on the job. Each key is a moment; the lines are picked at random, without repeating the last one
const SAY = {
  driveStart: ['Seatbelt, jongen. I did not fly back from Costa del Kaas to die in my own van.', 'Mirrors. Signal. Then gas. Your mother never signalled either.', 'Left at the snackbar. No, the OTHER snackbar.', 'Put the radio on. Not that. Not that either. Turn it off.', 'Thirty years I drove this street. Every pothole is a friend.'],
  ped: ['You hit a man! ...Was he Lampas? No? Then say sorry next time.', 'SMARTENGELD. You know what that costs? I know what that costs.', 'Eddy! That was Mevrouw De Vries! She buys paprika from us!', 'Toeter first, jongen. Then drive. In that order.'],
  wreck: ['HA! That one is for 1998!', 'Lampas in the ditch. Beautiful. Do it again.', 'Your grandfather would cry. Happy tears.', 'That is how we say "nee dank je" in Kipkruidenkwartier.'],
  crash: ['The VAN, Eddy! Thirty years without a scratch!', 'Au. My back. My other back.', 'Was that a wall? That was a wall.', 'Is the paprika okay? Forget me, is the PAPRIKA okay?'],
  canal: ['The Grote Gracht is not a car wash!', 'I am wet. My sombrero is wet. Everything is wet, Eddy.', 'Your mother asked me one thing: keep him out of the canal.'],
  ambush: ['Lampas! Ram them, jongen, I have insurance! ...I had insurance.', 'Here they come. Hold the wheel like you hold a broodje: firm, but with love.', 'Duck! No, drive. Drive AND duck.'],
  arriveFast: ['Under par. You drive like your mother, and I mean that as a compliment.', 'Fast! I left my stomach two streets back.', 'Now THAT is Eddy & Zn service.'],
  arriveSlow: ['My grandmother delivered faster. On a bakfiets. Uphill.', 'Did we stop for a kapsalon on the way? It felt like we stopped for a kapsalon.', 'We are here. Finally. I grew a beard.'],
  fail: ['The van is kapot. I am telling Monteur Mo it was you.', 'Thirty years that van survived me. Three weeks with you.'],
  raid: ['I wait in the van. If you are not back in an hour I call Schmatzel.', 'Go. Make them remember the name Eddy & Zn.', 'Remember: they hit first, you hit last.', 'Engine is running, jongen. Go do your thing.'],
  heist: ['A night job? Quiet like a mouse, Eddy. A mouse with a Maboota.', 'Lights off, mouth shut. I keep watch. I see nothing, I am an old man.'],
  siege: ['They come to OUR warehouse? Over my dead body. Preferably over theirs.', 'Defend the loods, jongen! Thirty years nobody got through that shutter!'],
  great: ['That is my boy! Clean work. Like in eighty-seven.', 'S? S for Spectaculair. Or S for Spekkoper. Both.', 'I watched from the van. I cried a little. Do not tell Schmatzel.', 'Now everybody in Kaasland knows: the son is worse than the father.'],
  ok: ['Not bad, not good. Like Schmatzel\'s knoflooksaus.', 'It is done. That is what counts. ...It is not all that counts.', 'Hm. In my time we did it with half the noise.'],
  bad: ['D? Even the Lampas laughed, jongen.', 'You got the joint. You also got half the street in the hospital.', 'I have seen Naknikim do it better. Asleep.'],
  dead: ['Eddy! Get up! Your mother will kill me!', 'Up, jongen! A Van der Kaas does not lie on the floor! ...Our name is not Van der Kaas. Up anyway!', 'Again. And this time duck.'],
  civilian: ['Eddy! You do not hit customers! You SELL to customers!', 'That man has a mother. And a lawyer. Mostly a lawyer.', 'In my day we waved at people. Try it.', 'What did he do? Nothing? Then why the stick?'],
  inspector: ['A CONTROLE man? Hah! Okay, that one I understand.', 'Hit the parking man... Your mother will be so proud. Secretly.'],
};
// what Pa adds when Eddy talks to someone with him around: a first meeting (several lines), then now and then an aside
const MEET = {
  Nabil: { first: [['Freddy Sr.', 'NABIL. You still sit at that table? I lent you two hundred guilders in 1984.'], ['Nabil', 'Freddy! And I paid you back four hundred! Nabil always pays.'], ['Freddy Sr.', 'You paid me back in kroketten, Nabil.'], ['Nabil', 'Very good kroketten.']],
    aside: ['He always pays back. That is what worries me.', 'Do not look at his cards, jongen. He looks at yours.', 'Nabil, if you lose my son\'s Wilders I tell your mother.', 'Tony, sit down. Nobody wants your chair.'] },
  Schmatzel: { first: [['Schmatzel', 'FREDDY?! Freddy van de paprika! Come here, you old cheese!'], ['Freddy Sr.', 'Schmatzel. You got fat.'], ['Schmatzel', 'And you got a sombrero. Sit! Two broodjes shoarma, on the house. With YOUR spice, like 1971.'], ['Freddy Sr.', 'On credit?'], ['Schmatzel', 'Never again on credit.']],
    aside: ['Extra knoflooksaus, Schmatzel. For my nerves.', 'The doner turns slower than in 1990. Everything turns slower.', 'Best shoarma in Kaasland. With our spice. Do not tell him I said that.'] },
  'The Russian': { first: [['The Russian', 'Freddy! You are alive! I bet against you. I lost twenty Wilders.'], ['Freddy Sr.', 'You still sell those dolphin shirts?'], ['The Russian', 'Dolphin shirts sell themselves, Freddy. Like Maboota.']],
    aside: ['Do not buy the golden one, jongen. It is golden, it is not good.', 'Discount for family, Sergei. I am family.', 'He sold me a car once. It had no engine. Very good car.'] },
  'Ome Joop': { first: [['Ome Joop', 'Freddy. You came back.'], ['Freddy Sr.', 'Joop. You are still feeding those ducks?'], ['Ome Joop', 'They are not the same ducks, Freddy. Forty years. These are the grandchildren.']],
    aside: ['Joop ground every gram of spice I ever sold. Listen to him.', 'Joop, the boy is doing it right. Tell him. He does not believe me.'] },
  Shooki: { first: [['Shooki', 'OOM FREDDY! Bro! Uncle! Bro-uncle!'], ['Freddy Sr.', 'Shooki. You still sell ringtones?'], ['Shooki', 'Logistics, oom. Shooki Koerier. 24/7. Familieprijs.'], ['Freddy Sr.', 'Familieprijs means I pay, yes?']],
    aside: ['Shooki, that Kangoo has more dents than my Oofmobiel.', 'Good boy, Shooki. Bit loud. Good boy.'] },
  'Monteur Mo': { first: [['Monteur Mo', 'Freddy. That grill I fixed for you in 2003. Still working?'], ['Freddy Sr.', 'Like the day you fixed it, Mo. Broken.']],
    aside: ['Mo can fix anything. Except his prices.'] },
  Naknik: { aside: ['Is he working or is he sleeping standing up?', 'Good Naknik. Small. Stirs well. Does he have papers? ...Never mind.', 'In my day, I was the Naknik.'] },
  Razim: { aside: ['Who is this? ...He calls you how many times a day?', 'Razim, give my son some air.'] },
  'De Fluisteraar': { aside: ['(whispers) Fifty Wilders for gossip? I tell you gossip for free.'] },
  Kevin: { aside: ['A Lampas on a break? In my day the Lampas did not get breaks.'] },
  'Henk Cijfer': { aside: ['A man with numbers. I never trusted numbers. They always went down.'] },
};

export function createFreddy(d) {
  const { state, dad, dadSolid, player, animate, dialogue, choice, toast, beep } = d;
  const F = () => (state.freddy && typeof state.freddy === 'object' ? state.freddy : (state.freddy = { called: false, back: false, follow: true, met: {}, said: {} }));
  const back = () => !!F().back;
  const due = () => !!F().called && !F().back;

  // ------------------------------------------------------------------ the comment card (a talking portrait, bottom centre)
  const css = document.createElement('style');
  css.textContent = `#freddyline{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:9998;display:none;align-items:center;gap:12px;max-width:min(520px,calc(100vw - 32px));padding:8px 16px 8px 8px;background:rgba(18,22,40,.9);border:2px solid #ffd36b;border-radius:14px;color:#f8efd8;font:500 15px/1.35 Rubik,Arial,sans-serif;box-shadow:0 6px 22px rgba(0,0,0,.45);pointer-events:none;animation:flIn .25s ease-out}
#freddyline .fl-face{width:58px;height:72px;flex:none;border-radius:10px;overflow:hidden;background:#3a3050}
#freddyline .fl-face img,#freddyline .fl-face canvas{width:58px;height:72px;object-fit:cover;display:block}
#freddyline b{display:block;font:800 12px Rubik,Arial;letter-spacing:.06em;color:#ffd36b;text-transform:uppercase}
body.driving #freddyline{bottom:calc(120px + env(safe-area-inset-bottom))}
#freddyline.fl-top,body.driving #freddyline.fl-top{bottom:auto;top:calc(16px + env(safe-area-inset-top))}
body.driving #freddyline.fl-top{top:calc(138px + env(safe-area-inset-top))}
@keyframes flIn{from{opacity:0;transform:translate(-50%,12px)}to{opacity:1;transform:translateX(-50%)}}`;
  document.head.appendChild(css);
  const card = document.createElement('div'); card.id = 'freddyline';
  card.innerHTML = '<div class="fl-face"><img alt="Freddy Sr." src="./assets/face_sr.jpg"></div><div><b>Freddy Sr.</b><span class="fl-t"></span></div>';
  document.body.appendChild(card);
  const face = createPortraits(card.querySelector('img'));
  let life = 0, gap = 0; const last = {};
  function show(text, top) {
    card.querySelector('.fl-t').textContent = text; card.style.display = 'flex'; card.classList.toggle('fl-top', !!top); // over a results screen: up top, clear of its buttons
    card.style.animation = 'none'; void card.offsetWidth; card.style.animation = '';
    face.show('./assets/face_sr.jpg', text);
    life = 3.2 + text.length / 20; beep(300, 0.05, 'triangle', 0.03);
  }
  function hide() { card.style.display = 'none'; face.hide(); life = 0; }
  // say(key): a line for this moment, if Pa is with Eddy. force skips the small gap between two remarks
  function say(key, force, top) {
    if (!back() || !SAY[key]) return false;
    if (!force && gap > 0) return false;
    let line = rnd(SAY[key]); if (SAY[key].length > 1) while (line === last[key]) line = rnd(SAY[key]);
    last[key] = line; const s = F().said || (F().said = {}); s[key] = (s[key] || 0) + 1;
    gap = 6; show(line, top); return true;
  }

  // ------------------------------------------------------------------ the call from Costa del Kaas, and the pick-up
  let callWait = 25;
  function canCall() { return state.step === 'free' && !!state.district1 && !F().called && !(state.tut && !state.tut.done) && !d.busy(); }
  function onCall() {
    dialogue([
      ['Freddy Sr. (telefoon)', 'Eddy? EDDY. It is your father. Can you hear me? I am calling from the hotel, it costs four Wilders a minute.'],
      ['Freddy Sr. (telefoon)', 'Schmatzel sent me a postcard. A POSTCARD, Eddy. "Your son took all of Kipkruidenkwartier." I read it nine times.'],
      ['Eddy Jr.', 'Pa? I thought you said: don\'t call unless I find De Gouden Mix.'],
      ['Freddy Sr. (telefoon)', 'Costa del Kaas is full of Lampas on holiday, jongen. Orange swimming shorts. Watered-down sangria. I cannot look at it anymore.'],
      ['Freddy Sr. (telefoon)', 'I land at Schiptagat. Come and get me with the Oofmobiel. And bring a broodje, the plane food is a crime.'],
    ], () => { F().called = true; F().day = d.econ.ensure().day; d.save(); d.objective(); toast('PICK UP PA', 'Freddy Sr. lands at Schiptagat. Get in the Oofmobiel and pick Schiptagat on the map.', 5); });
  }
  function onMissed() { callWait = 45; toast('GEMISTE OPROEP', 'Pa (Freddy Sr.). "Eddy, pick up! It is four Wilders a minute!"', 3); }
  function objective() { return due() ? '<b style="color:#ffd36b">Pa is coming home.</b> Freddy Sr. lands at <b>Schiptagat</b>. Get in the <b>Oofmobiel</b> and pick the airport on the map.' : null; }
  // the drive to the airport: no ambush, no pay, Pa on the kiss & ride with two suitcases and a sombrero
  // Pa is fetched for real: the A4 afrit ends on the Schiptagat forecourt (js/wijk.js buildAir), Eddy drives up to Aankomst,
  // Pa gets in with his suitcases and the sombrero, and the A4 takes them home, where Pa wants to see his own house first.
  const WELCOME = [
    ['Freddy Sr.', 'Ahh. Kipkruidenkwartier. Smell that? Cumin, diesel and frikandel. Home.'],
    ['Freddy Sr.', 'And my house. Look at it, jongen. One room, one bed, seven televisions. I designed it myself.'],
    ['Eddy Jr.', 'Pa. The bed is turning.'],
    ['Freddy Sr.', 'Of course it is turning. I left it on. Three years. You do not switch off a bed like that, you never get it going again.'],
    ['Eddy Jr.', 'So you\'re back for good?'],
    ['Freddy Sr.', 'Back to help. Not to boss you around. Mostly not. I ride with you: every job, every drive, every meeting. And I tell you when you do it wrong.'],
    ['Freddy Sr.', 'Also when you do it right. Less often, probably. Now show me the loods. And do not sit on the suede.'],
  ];
  const airJob = () => (due() ? { kind: 'pickup', who: 'Freddy Sr.', onHome: home, lines: [
    ['Freddy Sr.', 'Eddy! JONGEN! You came! In the Oofmobiel! With YOUR name on it!'],
    ['Eddy Jr.', 'Pa. What is on your head.'],
    ['Freddy Sr.', 'A sombrero. It was a long three years. Put the suitcases in the back, careful with the red one, it is all duty-free.'],
    ['Freddy Sr.', 'And drive past my house first. Komijnstraat. I want to see if it still turns.'],
  ] } : null);
  function home() { // the Oofmobiel is back on its parking, with Pa in it
    d.afterDrive(); F().back = true; F().follow = true; F().day = d.econ.ensure().day; F().welcome = true;
    appear(true); d.save(); d.objective();
    if (d.paHouse) { d.paHouse(); toast('PA IS HOME', 'First stop: his own house on the <b>Komijnstraat</b>, one street behind the kade. Follow the arrow and go in with him.', 6.5); }
    else welcome();
  }
  function welcome() { // the first time through his front door (or at once, where there is no house)
    if (!F().welcome) return; F().welcome = false; d.save();
    dialogue(WELCOME, () => toast('FREDDY SR. RIDES ALONG', 'Pa walks with you, rides in the van and has an opinion on everything. Talk to him to send him home or bring him along.', 5));
  }
  function pickup() {
    if (!due() || d.drive().active) return;
    d.drive().start({ van: d.van(), from: 'Kipkruidenkwartier', to: 'Schiptagat', target: [5, 3], airport: true, noPay: true,
      arrived: 'Now the forecourt: Pa is at Aankomst.', doneLabel: 'To the terminal',
      onDone: (res) => {
        d.afterDrive();
        if (!res.arrived) { toast('NO PA', 'The Oofmobiel never made it to Schiptagat. Pa is still waiting at Aankomst. Try again.', 4); d.save(); return; }
        if (res.pay < 0) d.addMoney(res.pay); // smartengeld
        if (d.airport && d.airport(airJob())) return; // the forecourt, in 3D
        home();
      } });
  }

  // ------------------------------------------------------------------ in the street: Pa walks behind Eddy
  const trail = []; let seen = false;
  const hidden = () => !back() || state.step !== 'free' || d.hidden();
  function appear(snap) { // put him a step behind Eddy (after a drive, a mission, a door)
    const fx = Math.sin(player.rotation.y), fz = Math.cos(player.rotation.y);
    if (snap || F().follow) { dad.position.set(player.position.x - fx * 1.5, 0, player.position.z - fz * 1.5); dad.rotation.y = player.rotation.y; }
    trail.length = 0; trail.push(player.position.clone());
  }
  function tick(dt) { // the comment card's clock (also runs on the drive, where main.js skips the street update)
    if (gap > 0) gap -= dt;
    if (life > 0 && ((life -= dt) <= 0 || state.inDialogue || state.inPC)) hide();
  }
  function update(dt) {
    tick(dt);
    if (canCall() && !(d.phone() && d.phone().ringing)) { callWait -= dt; if (callWait <= 0) { callWait = 40; if (d.phone() && d.phone().ring('freddy')) { /* ringing */ } else onCall(); } }
    if (!back()) return false;
    const off = hidden();
    dad.visible = !off; dad.userData.leaving = false; dad.userData.walkTo = null;
    if (off) { seen = false; dadSolid.off = true; return true; }
    if (!seen) { seen = true; appear(true); }
    const P = player.position;
    if (!F().follow) { // waiting where Eddy left him: a solid little man who turns to look at you
      dadSolid.off = false; Object.assign(dadSolid, { minx: dad.position.x - 0.35, maxx: dad.position.x + 0.35, minz: dad.position.z - 0.35, maxz: dad.position.z + 0.35 });
      const dx = P.x - dad.position.x, dz = P.z - dad.position.z;
      if (dx * dx + dz * dz < 36) { const want = Math.atan2(dx, dz); dad.rotation.y += Math.atan2(Math.sin(want - dad.rotation.y), Math.cos(want - dad.rotation.y)) * Math.min(1, dt * 4); }
      animate(dad, 0, dt); return true;
    }
    dadSolid.off = true;
    const lastP = trail[trail.length - 1];
    if (!lastP || Math.hypot(P.x - lastP.x, P.z - lastP.z) > 6) { appear(true); } // a door, a stair, the hall: he comes along
    else if (Math.hypot(P.x - lastP.x, P.z - lastP.z) > 0.3) { trail.push(P.clone()); if (trail.length > 80) trail.shift(); }
    // walk Eddy's own path back 1.7 m: he never cuts through a wall Eddy walked round
    let need = 1.7, tx = P.x, tz = P.z, px = P.x, pz = P.z;
    for (let i = trail.length - 1; i >= 0 && need > 0; i--) { const q = trail[i], L = Math.hypot(q.x - px, q.z - pz); if (L >= need) { tx = px + (q.x - px) * need / L; tz = pz + (q.z - pz) * need / L; need = 0; break; } need -= L; px = q.x; pz = q.z; tx = px; tz = pz; }
    const mx = tx - dad.position.x, mz = tz - dad.position.z, L = Math.hypot(mx, mz), dP = Math.hypot(P.x - dad.position.x, P.z - dad.position.z);
    if (L > 0.12 && dP > 1.25) {
      const sp = Math.min(7, 1.4 + L * 2.6), st = Math.min(L, sp * dt);
      dad.position.x += mx / L * st; dad.position.z += mz / L * st;
      const want = Math.atan2(mx, mz); dad.rotation.y += Math.atan2(Math.sin(want - dad.rotation.y), Math.cos(want - dad.rotation.y)) * Math.min(1, dt * 8);
      animate(dad, sp, dt);
    } else {
      const want = Math.atan2(P.x - dad.position.x, P.z - dad.position.z); dad.rotation.y += Math.atan2(Math.sin(want - dad.rotation.y), Math.cos(want - dad.rotation.y)) * Math.min(1, dt * 3);
      animate(dad, 0, dt);
    }
    return true;
  }
  // [E] on Pa while he follows: only when Eddy turns round to face him (he stands right behind you all day)
  function talkable() {
    if (!back()) return true; if (!F().follow) return true;
    const fx = Math.sin(player.rotation.y), fz = Math.cos(player.rotation.y), dx = dad.position.x - player.position.x, dz = dad.position.z - player.position.z, L = Math.hypot(dx, dz) || 1;
    return (fx * dx + fz * dz) / L > 0.55;
  }

  // ------------------------------------------------------------------ talking to Pa
  function review() { // how is Eddy doing? Good news first, then the bad
    const e = d.econ.ensure(), good = [], bad = [];
    const n = state.naknik || 0; if (n >= 3) good.push(`${n} Naknikim stirring the pot. I had one, and it was me.`); else bad.push(n ? `${n === 1 ? 'One Naknik' : 'Two Naknikim'}? The joints want more spice than that.` : 'No Naknikim? Who mixes the spice, the ducks?');
    if (state.money >= 10000) good.push(`W ${state.money.toLocaleString('nl-NL')} in the bank. Do not show Nabil.`); else if (state.money < 500) bad.push('Your wallet is thinner than Lampas spice, jongen.');
    const heat = (e.heat && e.heat.lampas) || 0; if (heat >= 70) bad.push('The Lampas are furious. Every one of them knows the Oofmobiel by now.'); else if (heat < 30) good.push('The Lampas are quiet. Too quiet. Enjoy it.');
    if (state.act1) good.push('Oud-Vettenburg is ours again. The old centre, Eddy. MY old centre.'); else if (state.district1) good.push('Kipkruidenkwartier is yours. Every joint, every street. Next: Oud-Vettenburg.');
    if (state.loan && state.loan.out) bad.push(`You lent Nabil W ${state.loan.amount}? ...He will pay. He always pays. It still makes me nervous.`);
    if (state.lastRaid && state.lastRaid.grade) (/^(S|A)/.test(state.lastRaid.grade) ? good : state.lastRaid.grade === 'D' ? bad : good).push(state.lastRaid.grade === 'D' ? 'That last raid, a D. We do not talk about it. We are talking about it now.' : `That last raid: ${state.lastRaid.grade}. ${/^(S|A)/.test(state.lastRaid.grade) ? 'Schmatzel heard about it before you were back.' : 'Fine. Fine is fine.'}`);
    return [...good.slice(0, 2).map((t) => ['Freddy Sr.', t]), ...bad.slice(0, 2).map((t) => ['Freddy Sr.', t]), ['Freddy Sr.', rnd(['Now get back to work. I am going to stand here and look proud.', 'Your mother would say: eat something first. Then work.', 'Remember: good spice, honest weight, and never let a Lampas see you sweat.'])]];
  }
  function talk() {
    if (!back()) return false;
    const f = F();
    choice('Freddy Sr.', rnd(['Ja, jongen?', 'What is it? I was counting Naknikim.', 'Eddy. My boy. What do you need?']), [f.follow ? 'Wait here, Pa' : 'Come along, Pa', 'How am I doing?', 'Nothing'], (i) => {
      if (i === 0) {
        f.follow = !f.follow; d.save();
        dialogue([['Freddy Sr.', f.follow ? rnd(['Finally. I was getting roots.', 'Coming! Not so fast, my knees are from 1958.']) : rnd(['Fine. I stand here. Like a lamppost. A proud lamppost.', 'Go, go. I wait. I am good at waiting, I was married thirty years.'])]]);
        if (f.follow) appear(false);
      } else if (i === 1) dialogue(review());
    });
    return true;
  }
  function chat() { // Pa on the Shmokia: a quick word, wherever he is
    if (!back()) return;
    dialogue([['Freddy Sr. (telefoon)', rnd(['Eddy? I am standing right behind you. ...Oh. Oh, I am not. Where am I?', 'Did you eat? Your mother made me promise to ask.', 'I found a coupon for the Kruidenbeurs. It expired in 1996. Still, a good coupon.', 'Schmatzel says hi. He says it every day. Every day, Eddy.'])]]);
  }

  // ------------------------------------------------------------------ on the job
  const near = (r = 9) => back() && dad.visible && dad.position.distanceTo(player.position) < r;
  function driveEvent(type, x) { // js/rit.js opts.onEvent: Pa is in the passenger seat on every drive
    if (!back()) return;
    if (type === 'start') { gap = 0; setTimeout(() => say('driveStart', true), 3600); }
    else if (type === 'arrive') say(x && x.t <= x.par ? 'arriveFast' : 'arriveSlow', true, true);
    else if (type === 'fail') say('fail', true, true);
    else if (SAY[type]) say(type);
  }
  function onMission(type, x) {
    if (!back()) return;
    if (type === 'enter') setTimeout(() => say(x && x.heist ? 'heist' : x && x.defend ? 'siege' : 'raid', true), 2600);
    else if (type === 'results') say(/^(S|A)/.test(x.grade) ? 'great' : x.grade === 'D' ? 'bad' : 'ok', true, true);
    else if (type === 'dead') say('dead', false, true);
  }
  function hit(kind) { if (near(14)) say(kind === 'inspector' ? 'inspector' : 'civilian'); }
  // chime(lines): Pa's word in someone else's conversation, if he is standing there with Eddy
  let chimeT = 0;
  function chime(lines) {
    if (!near(8) || !Array.isArray(lines) || !lines.length) return lines;
    const who = (lines.find(([w]) => w !== 'Eddy Jr.' && w !== 'Freddy Sr.') || [])[0]; const m = MEET[who]; if (!m) return lines;
    const f = F(); f.met = f.met || {};
    if (m.first && !f.met[who]) { f.met[who] = true; d.save(); chimeT = performance.now(); return [...m.first, ...lines]; }
    if (performance.now() - chimeT < 25000 || Math.random() > 0.55) return lines;
    chimeT = performance.now(); return [...lines, ['Freddy Sr.', rnd(m.aside)]];
  }

  // preChoice(who): someone asks Eddy something (a choice card) with Pa there for the first time: their reunion comes first
  function preChoice(who) {
    const m = MEET[who]; if (!m || !m.first || !near(8)) return null;
    const f = F(); f.met = f.met || {}; if (f.met[who]) return null;
    f.met[who] = true; d.save(); chimeT = performance.now(); return m.first;
  }
  return { airJob, welcome, preChoice, update, tick, say, talk, talkable, chat, pickup, onCall, onMissed, objective, due, back, driveEvent, onMission, hit, chime, appear, owns: back, mapState: () => (due() ? 'due' : 'air'), SAY, MEET };
}
