// The Maboota in public: a Russian police truncheon is not something you swing around a Kaasland street.
// Draw it on the street (not on a mission, not at home, not in the warehouse) and passers-by notice: first a
// startled bubble, and if Eddy keeps it out, they call the police (a hit on someone is reported straight away).
// The morning after a report, Wijkagent Bakker comes to Eddy's door. The first two visits are a chat and a warning.
// From the third on it costs: a fine, or deny everything and risk a huiszoeking (they take stock, the search eats
// the day's plan so no raid today, and word gets around to the gangs: heat +10).
// state.cops = { reports: [{ day, how }], visits, lastVisit } is saved with the game.

const NOTICE = 0.8, CALL = 3.0, COP_CALL = 2.2, SEE_R = 8.5; // seconds of exposure before a bubble / a phone call; metres
const STARTLED = ['Is dat een knuppel?!', 'Hé... wat heeft die vent vast?', 'Mama, die meneer heeft een stok!', 'Doe dat ding weg, man!', 'Is dat een wapenstok?'];
const CALLING = ['Hallo, politie? Er loopt hier een man met een knuppel!', 'Ik bel 112, hoor!', 'Ja, politie? Een grote man, blauw shirt, met een stok.', 'Ik heb je gefilmd! Politie komt eraan!'];
const COP_SEE = ['Meneer! Dat ding weg. Nu.', 'Wapenstok? Wegstoppen, meneer.'];
const COP_NOTE = ['Ik schrijf het op. U hoort nog van ons.', 'Genoteerd. We komen langs.'];
const RELIEF = ['Hm. Rare vent.', 'Pff. Gek.', '...Oké dan.'];
const rnd = (a) => a[Math.floor(Math.random() * a.length)];
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

export function createMabootaLaw(deps) {
  const { state, walkers, player, personBubble, toast, beep } = deps;
  let warnEl = null, idle = 0, cop = null, dayStart = -1, freeT = 0, toldToday = -1;

  function S() { if (!state.cops || typeof state.cops !== 'object') state.cops = {}; const c = state.cops; if (!Array.isArray(c.reports)) c.reports = []; c.visits = c.visits || 0; if (c.lastVisit == null) c.lastVisit = -1; return c; }
  const day = () => deps.econ.ensure().day;
  const live = () => state.step === 'free'; // chapter 0 is the tutorial: the Russian hands it over in the street
  const unvisited = () => S().reports.filter((r) => r.day > S().lastVisit);

  function report(how, by) {
    if (!live() || !deps.isPublic()) return false;
    const c = S(), d = day();
    if (c.reports.filter((r) => r.day === d).length >= 4) return false; // one street can only call so often
    c.reports.push({ day: d, how }); if (deps.onReport) deps.onReport(how); if (c.reports.length > 40) c.reports.splice(0, c.reports.length - 40);
    if (toldToday !== d) {
      toldToday = d; deps.tips.show('maboota');
      const v = c.visits;
      toast('SOMEONE CALLED THE POLICE', `${by || 'A passer-by'} reported a man with a truncheon on the street. ${v < 2 ? 'Expect the wijkagent at your door tomorrow.' : 'The wijkagent will be at your door tomorrow, and this time it costs.'} Keep the Maboota holstered in public (1).`, 5);
      beep(660, 0.12, 'square', 0.04); setTimeout(() => beep(520, 0.16, 'square', 0.04), 140);
    }
    if (deps.save) deps.save();
    return true;
  }

  // ---------------------------------------------------------------- witnesses
  const fwd = { x: 0, z: 0 };
  function watch(dt) {
    const pub = deps.isPublic(), out = state.armed && pub && state.kit.includes('maboota');
    showWarn(out);
    if (out && deps.touch()) { idle += dt; if (idle > 6) { deps.equip(false); idle = 0; } } else idle = 0; // touch has no holster key: Eddy tucks it away himself
    const now = performance.now() / 1000;
    for (const w of walkers) {
      const u = w.userData.walk; if (!u) continue;
      if (!out || !w.visible || u.flee || w.userData.down > 0 || (u.witCd || 0) > now) {
        if (u.wit > 0) { u.wit = Math.max(0, u.wit - dt * 1.5); if (u.wit === 0 && u.witStage === 1 && !u.police && w.visible && !u.flee) personBubble(w, rnd(RELIEF), '#9a9a9a'); if (u.wit === 0) u.witStage = 0; }
        continue;
      }
      const dx = player.position.x - w.position.x, dz = player.position.z - w.position.z, L = Math.hypot(dx, dz);
      fwd.x = Math.sin(w.rotation.y); fwd.z = Math.cos(w.rotation.y);
      const sees = L < SEE_R && (L < 3 || (fwd.x * dx + fwd.z * dz) / (L || 1) > -0.25); // anything but a back turned
      if (!sees) { u.wit = Math.max(0, (u.wit || 0) - dt * 0.6); continue; }
      u.wit = (u.wit || 0) + dt * (L < 4 ? 1.4 : 1);
      if (!u.witStage && u.wit >= NOTICE) { u.witStage = 1; personBubble(w, u.police ? rnd(COP_SEE) : rnd(STARTLED), u.police ? '#3a6aff' : '#e8a33d', u.police ? 'Politie' : ''); }
      else if (u.witStage === 1 && u.wit >= (u.police ? COP_CALL : CALL * (deps.callMult ? deps.callMult() : 1))) {
        u.witStage = 2; u.witCd = now + 90;
        if (u.police) { personBubble(w, rnd(COP_NOTE), '#3a6aff', 'Politie'); report('cop', 'A police officer on patrol'); }
        else { personBubble(w, rnd(CALLING), '#ff7a1a'); u.flee = true; u.dir = Math.sign(w.position.x - player.position.x) || 1; report('seen'); }
      }
    }
  }
  function showWarn(on) {
    if (!warnEl) { warnEl = document.createElement('div'); warnEl.id = 'mbWarn'; warnEl.className = 'hud'; document.body.appendChild(warnEl); }
    const k = on ? (deps.touch() ? '👁 Maboota out in public: people are watching' : '👁 Maboota out in public: press <b>1</b> to holster') : '';
    if (warnEl.dataset.k !== k) { warnEl.dataset.k = k; warnEl.innerHTML = k; warnEl.style.display = on ? 'block' : 'none'; }
  }

  // ---------------------------------------------------------------- Wijkagent Bakker at the door
  function busy() { return state.step !== 'free' || state.inPC || state.inDialogue || deps.busy(); }
  function knockKnock() { [0, 160, 320].forEach((t) => setTimeout(() => beep(140, 0.07, 'square', 0.08), t)); }
  function seizeStock() { // the huiszoeking: up to a quarter of every loose sack on the shelves, at most 40 kg in all
    const e = deps.econ.ensure(); let left = 40, took = 0;
    for (const k of Object.keys(e.stock).sort((a, b) => e.stock[b] - e.stock[a])) {
      const t = Math.min(left, Math.floor(e.stock[k] * 0.25)); if (t <= 0) continue;
      e.stock[k] = +(e.stock[k] - t).toFixed(2); if (e.stock[k] <= 0) delete e.stock[k]; left -= t; took += t; if (left <= 0) break;
    }
    return took;
  }
  function gangsHear() { // word gets around: the gang that's angriest already smells weakness
    const e = deps.econ.ensure(), h = e.heat || {}; let best = null;
    for (const f of Object.keys(h)) { if (f === 'lampas' && state.act1) continue; if ((h[f] || 0) > 0 && (!best || h[f] > h[best])) best = f; }
    if (best) h[best] = Math.min(100, h[best] + 10);
    return best;
  }
  function claimDay() { const t = deps.econ.today(); if (!t.plan) t.plan = 'werk'; t.did.politie = true; deps.onPlan(); }
  const NAMES = { lampas: 'Lampas', noshgey: 'Noshgey Kariot', abdavissies: 'Abdavissies', paravim: 'Paravim' };

  function talk(done) {
    const choice = deps.choice, c = S(), reps = unvisited(), n = c.visits + 1, hits = reps.filter((r) => r.how === 'hit').length, B = 'Wijkagent Bakker';
    c.visits = n; c.lastVisit = day() - 1; if (deps.save) deps.save();
    const what = hits ? `${hits > 1 ? `${hits} calls: people say` : 'a call: somebody says'} a big man in a blue shirt hit them with a black stick` : reps.length > 1 ? `${reps.length} calls about a big man walking down the street with a black stick` : 'a call about a big man walking down the street with a black stick';
    const end = () => { if (deps.save) deps.save(); done(); };
    if (n === 1) {
      choice(B, `Goedemorgen. Wijkagent Bakker, from the bureau on the corner. We had ${what}. That wouldn't be you, would it, meneer?`, ['"It\'s a souvenir. From Russia."', '"Never seen a stick in my life."'], (i) => {
        deps.dialogue([[B, i ? 'Hm. Of course not. Funny, because the description was very... you.' : 'A souvenir. Lovely. Souvenirs stay in the cupboard.'], [B, 'In Kaasland you don\'t walk the street with a wapenstok. Keep it put away in public. This is a friendly warning: no paperwork, no fine. Just a chat.'], ['Eddy Jr.', '(The Russian did not mention this part.)']], end);
      });
    } else if (n === 2) {
      choice(B, `Me again, meneer Eddy. We had ${what}. Again.`, ['"I was holding it for a friend."', '"It won\'t happen again."'], (i) => {
        deps.dialogue([[B, i ? 'That is what you said last time. More or less.' : 'A friend. With a truncheon. In Kipkruidenkwartier.'], [B, 'Second warning, and the last one. Next time it\'s not a chat: a <b>fine</b>, and we take a look inside your warehouse. Put. It. Away.']], end);
      });
    } else if (deps.pardon && deps.pardon()) { // the buurt put in a good word (js/buurtrep.js)
      choice(B, `Meneer Eddy. ${what[0].toUpperCase() + what.slice(1)}. By the book this is a fine.`, ['"The whole street knows me, Bakker."'], () => {
        deps.dialogue([[B, 'I know. Half the Kipkruidenkade called the bureau to say you’re a good lad who helps out. Mevrouw Bos even. Mevrouw Bos!'], [B, 'So: a warning, one more time. Don’t make me regret it.']], end);
      });
    } else {
      const fine = Math.min(3000, 250 * (n - 2) + 150 * (reps.length - 1) + 200 * hits), pSearch = Math.min(0.9, 0.5 + 0.1 * (n - 3) + 0.1 * hits);
      choice(B, `Meneer Eddy. ${what[0].toUpperCase() + what.slice(1)}. I warned you twice. That is a fine of <b>${fmt(fine)}</b>.`, [`Pay ${fmt(fine)}`, 'Deny everything'], (i) => {
        if (i === 0) {
          const paid = Math.min(state.money, fine); deps.addMoney(-paid); toast('FINE PAID', `${fmt(paid)} to the gemeente. Keep the Maboota holstered in public.`, 4);
          deps.dialogue([[B, 'Thank you. And meneer? Next time it\'s more. Keep it out of sight.']], end);
        } else if (Math.random() < pSearch) {
          const kg = seizeStock(), g = gangsHear(); claimDay(); if (deps.onReport) deps.onReport('search');
          deps.dialogue([[B, 'Deny everything. Fine. Then you won\'t mind if we look around. Huiszoeking, meneer.'], ['Eddy Jr.', '(Two more agents walk past him into the warehouse.)'], [B, kg ? `${kg} kg of unlabelled spice. "Evidence." And the fine stands.` : 'Nothing on the shelves. Suspicious. The fine stands.']], () => {
            deps.addMoney(-Math.min(state.money, fine));
            toast('HUISZOEKING', `The police searched the warehouse: ${kg ? `${kg} kg of spice seized, ` : ''}fine ${fmt(fine)}. The search took the morning: no raid today.${g ? ` Word gets around: ${NAMES[g] || g} heat +10.` : ''}`, 7);
            end();
          });
        } else {
          deps.dialogue([[B, '(long look) ...I can\'t prove it. Yet. The next call, I bring a warrant.']], end);
        }
      });
    }
  }

  function startVisit() {
    S(); deps.tips.show('wijkagent');
    if (deps.atHome()) { knockKnock(); toast('KNOCK KNOCK', '"Politie, doet u even open?"', 2.5); talk(() => {}); return; }
    const from = Math.random() < 0.5 ? -1 : 1, p = deps.makeCop();
    p.position.set(player.position.x + from * 16, 0, deps.laneZ()); deps.scene.add(p);
    cop = { p, talked: false, left: 0 };
    personBubble(p, 'Meneer Eddy? Politie. Even een praatje.', '#3a6aff', 'Politie');
  }
  function updateCop(dt) {
    const p = cop.p;
    if (cop.left) { p.position.x += cop.left * 1.8 * dt; p.rotation.y = cop.left > 0 ? Math.PI / 2 : -Math.PI / 2; deps.animate(p, 1.8, dt); if (Math.abs(p.position.x - player.position.x) > 40) { deps.scene.remove(p); cop = null; } return; }
    const dx = player.position.x - p.position.x, dz = player.position.z - p.position.z, L = Math.hypot(dx, dz);
    if (L > 1.6 && !cop.talked) { const k = Math.min(L - 1.5, 2.0 * dt) / L; p.position.x += dx * k; p.position.z += dz * k; p.rotation.y = Math.atan2(dx, dz); deps.animate(p, 2.0, dt); }
    else if (!cop.talked && !state.inDialogue && !state.inPC) { cop.talked = true; deps.animate(p, 0, dt); talk(() => { if (cop) cop.left = p.position.x > player.position.x ? 1 : -1; }); }
    else deps.animate(p, 0, dt);
  }

  function update(dt) {
    if (state.step === 'title') { showWarn(false); return; }
    watch(dt);
    if (cop) { updateCop(dt); return; }
    const d = day(); if (d !== dayStart) { dayStart = d; freeT = 0; }
    if (!unvisited().length || !unvisited().every((r) => r.day < d) || busy()) return;
    freeT += dt; if (freeT < 6) return; // let the morning settle (market day toast, Shooki's texts)
    startVisit();
  }

  // a hit on someone in the street: the victim calls it in, no grace
  function onHit(civilian) { return report('hit', civilian ? 'Someone you knocked over' : 'The ticket inspector you knocked over'); }
  return { update, onHit, report, state: S, get cop() { return cop; }, startVisit, visitDue: () => unvisited().length > 0 };
}
