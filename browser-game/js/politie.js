// Politie (2026-11-26): borrow a car in front of witnesses, run somebody over, or keep waving the Maboota around and
// the police come looking. One to three stars; a patrol car drives the street after Eddy, faster with every star.
// It can only follow the road: get across a bridge to the far quay, or indoors (the warehouse, a shop, home), or
// simply out-drive it, and after ten seconds without contact they give up ("Kwijt!"). If the car stops next to Eddy
// he is arrested: a fine per star (more in a borrowed car), two hours gone, and the buurt talks.
// Nothing is saved: a new day starts clean. The wijkagent (js/maboota.js) still does his own rounds.
const SPEED = [0, 11, 13.5, 16.5];
const fmt = (n) => 'W ' + Math.round(n).toLocaleString('nl-NL');

// deps: THREE, scene, player, state, makeCar(opts), lam, RC, lifeWin(), reachable() (Eddy is on the street side the car can get to),
//       indoors(), busy(), riding() -> vehicle | null, dismount(), near(x, z, r) -> a witness walks there, toast, beep, dialogue,
//       addMoney, onArrest(fine), onEscape(), onChase(), passTime(h), speedOf() (Eddy's speed, m/s)
export function createPolitie(deps) {
  const { THREE, scene, player, state } = deps;
  let W = 0, car = null, lightL = null, lightR = null, dir = 1, v = 0, lost = 0, hold = 0, sirenT = 0, blink = 0, coolT = 0, on = false, leaving = false;
  const el = document.createElement('div'); el.id = 'wanted';
  const css = document.createElement('style');
  css.textContent = `#wanted{position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:13;display:none;padding:4px 14px;border-radius:14px;font:800 14px Rubik,"Segoe UI",Arial,sans-serif;color:#fff;letter-spacing:.06em;text-shadow:0 1px 2px #000;background:linear-gradient(90deg,rgba(30,70,200,.85),rgba(200,30,40,.85));border:1px solid rgba(255,255,255,.7);box-shadow:0 4px 14px rgba(0,0,0,.4);animation:wtd .7s steps(2) infinite}
#wanted b{color:#ffe14a;letter-spacing:.12em}@keyframes wtd{0%{background:linear-gradient(90deg,rgba(30,70,200,.9),rgba(200,30,40,.9))}100%{background:linear-gradient(90deg,rgba(200,30,40,.9),rgba(30,70,200,.9))}}
@media (max-width:600px){#wanted{top:auto;bottom:calc(64px + env(safe-area-inset-bottom));font-size:12px}}`;
  document.head.appendChild(css); document.body.appendChild(el);
  function ensureCar() {
    if (car) return car;
    car = deps.makeCar({ paint: 0xf4f4f0, model: 3 });
    const blue = deps.lam({ color: 0x1a4ad8 }), stripe = new THREE.Mesh(new THREE.BoxGeometry(car.userData.half * 1.5, 0.22, car.userData.width + 0.03), blue); stripe.position.set(0, 0.78, 0); car.add(stripe);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.08, 1.0), deps.lam({ color: 0x22242a })); bar.position.set(-0.1, 1.5, 0); car.add(bar);
    lightL = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.4), new THREE.MeshBasicMaterial({ color: 0x2a6aff })); lightL.position.set(-0.1, 1.6, -0.28); car.add(lightL);
    lightR = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.4), new THREE.MeshBasicMaterial({ color: 0xff2a2a })); lightR.position.set(-0.1, 1.6, 0.28); car.add(lightR);
    car.visible = false; scene.add(car); return car;
  }
  function hud() { if (W > 0 && on) { el.style.display = 'block'; const t = `POLITIE <b>${'★'.repeat(W)}${'☆'.repeat(3 - W)}</b>`; if (el.innerHTML !== t) el.innerHTML = t; } else el.style.display = 'none'; }
  function start() {
    const c = ensureCar(), [lo, hi] = deps.lifeWin(), px = player.position.x;
    const from = Math.abs(px - lo) > Math.abs(hi - px) ? lo + 6 : hi - 6; // from the far end of what is loaded
    dir = from < px ? 1 : -1; c.position.set(from, 0, deps.RC + (dir > 0 ? 1.5 : -1.5)); c.rotation.y = dir > 0 ? 0 : Math.PI; c.visible = true; v = 6; lost = 0; hold = 0; on = true; leaving = false;
    deps.toast('POLITIE!', 'Somebody called it in. A patrol car is coming down the street: get off the road. A bridge, a door, or just be faster.', 4); if (deps.onChase) deps.onChase();
  }
  // something happened in public: 'theft' (a borrowed car), 'hit' (ran somebody over), 'maboota' (the third report today)
  function witness(kind, x, z) {
    if (state.step !== 'free' || deps.busy()) return false;
    if (kind === 'theft' && !deps.near(x, z, 15) && Math.random() > 0.3) return false; // nobody saw it
    if (coolT > 0 && kind !== 'hit') return false;
    W = Math.min(3, W + 1); lost = 0;
    if (!on) start(); else deps.toast('POLITIE ' + '★'.repeat(W), kind === 'hit' ? 'You hit somebody. They are not letting this one go.' : 'More calls coming in.', 2.5);
    hud(); return true;
  }
  function end(how) {
    on = false; leaving = true; hud(); coolT = 25;
    if (how === 'escape') { deps.toast('KWIJT!', 'The patrol car gives up. Stay out of trouble for a bit.', 3); if (deps.onEscape) deps.onEscape(W); }
    W = 0;
  }
  function arrest() {
    const veh = deps.riding(), stolen = !!(veh && veh.kind === 'car'), fine = 120 * W + (stolen ? 80 : 0), stars = W;
    if (veh) deps.dismount();
    const paid = Math.min(state.money, fine); if (paid) deps.addMoney(-paid);
    end('arrest'); if (deps.onArrest) deps.onArrest(paid, stars); if (deps.passTime) deps.passTime(2);
    deps.dialogue([['Agent De Vries', stolen ? 'Uitstappen, meneer. Dat is niet uw auto. Dat weet u, dat weet ik, en de eigenaar weet het ook.' : 'Meneer. Blijft u even staan. We hebben meldingen.'], ['Eddy Jr.', '...Het was heel even.'], ['Agent De Vries', `${fmt(fine)} boete${paid < fine ? `. U heeft ${fmt(paid)}? Dan nemen we dat` : ''}. En twee uur op het bureau voor de papieren. Fijne dag verder.`]]);
  }
  function update(dt) {
    if (deps.paused && deps.paused()) return; // a conversation, the PC, the pause menu: the chase waits
    if (coolT > 0) coolT -= dt;
    if (!car) return;
    blink += dt; if (lightL) { const b = Math.floor(blink * 5) % 2; lightL.visible = on && !!b; lightR.visible = on && !b; }
    if (deps.busy()) { if (on) { on = false; W = 0; hud(); } car.visible = false; return; }
    if (leaving) { car.position.x += dir * 12 * dt; const [lo, hi] = deps.lifeWin(); if (car.position.x < lo - 5 || car.position.x > hi + 5 || Math.abs(car.position.x - player.position.x) > 70) { car.visible = false; leaving = false; } return; }
    if (!on) return;
    const px = player.position.x, dx = px - car.position.x, adx = Math.abs(dx), reach = deps.reachable() && !deps.indoors();
    const want = Math.sign(dx) || 1; if (want !== dir && adx > 4) { dir = want; car.rotation.y = dir > 0 ? 0 : Math.PI; v = Math.min(v, 3); }
    const tz = deps.RC + (dir > 0 ? 1.5 : -1.5); car.position.z += (tz - car.position.z) * Math.min(1, dt * 3);
    const top = SPEED[W] || 11, target = adx < 4.5 ? 0 : adx < 12 ? top * 0.45 : top;
    v += Math.max(-18 * dt, Math.min(7 * dt, target - v)); car.position.x += dir * v * dt;
    // the siren, when close enough to hear
    if (adx < 70 && (sirenT -= dt) <= 0) { sirenT = 0.55; deps.beep(Math.floor(blink * 2) % 2 ? 660 : 880, 0.22, 'sine', adx < 25 ? 0.035 : 0.018); }
    const contact = reach && adx < 45;
    if (contact) lost = 0; else if ((lost += dt) > 10) { end('escape'); return; }
    if (reach && adx < 5.5 && Math.abs(player.position.z - car.position.z) < 8 && deps.speedOf() < 4.5) { if ((hold += dt) > 1.0) arrest(); } else hold = Math.max(0, hold - dt * 2);
    hud();
  }
  return { witness, update, wanted: () => (on ? W : 0), chasing: () => on, get car() { return car; } };
}
