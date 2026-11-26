// Johan: Eddy's childhood friend who sold him out. The worst of it was The Letter: everything that is wrong with Eddy,
// in bullet points, and point 3 was the forklift. Two moments:
//  1. Early game, on a drive in the Oofmobiel (js/rit.js asks driveCue()), Johan's red Mazda Miata overtakes the van,
//     cuts in front and brakes. "How's business? Got a forklift yet?" He hasn't. Johan laughs and roars off.
//  2. Once Eddy owns De Hal and the Heftruck (js/loods.js), Johan parks his Miata in the hall to have a look.
//     Eddy drives the heftruck at it, slides the forks under, lifts it and flips it onto its roof. Point 3: crossed off.
// state.johan = { met, metDay, drives, flipped, flipDay, hallSeen } is saved with the game.

export const LETTER = {
  open: 'Eddy,\nAs your oldest friend I owe you some honesty. This is what is wrong with you:',
  points: [
    'You still live behind your dad\'s shed.',
    'Your van smells of knoflooksaus. Permanently.',
    'You have no forklift. A real businessman has a forklift.',
    'You laugh at your own jokes before you finish them.',
    'You still owe me W 20 from groep 8.',
    'You call shoarma "a lifestyle".',
    'You will never be a Spice Master.',
  ],
  close: 'Sorry, but someone had to say it.\n— Johan',
  forklift: 2, // index of the forklift point (point 3)
};

// Johan's red 1990 Miata: low two-seater, top down, pop-up lights, roll hoops. Faces +z, length ~3.95 m, origin on the ground.
export function makeMiata(THREE, opts = {}) {
  const g = new THREE.Group(), lam = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const red = lam(0xc8141e), black = lam(0x141416), chrome = lam(0xb8bcc4), tan = lam(0xc8a878), glass = lam(0x8ab4d0, { transparent: true, opacity: 0.55 });
  const add = (geo, m, x, y, z, parent = g) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = true; parent.add(me); return me; };
  const box = (w, h, d, m, x, y, z, parent) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, parent);
  // side profile (z along the car, y up), extruded across the width
  const s = new THREE.Shape();
  [[-1.98, 0.32], [-2.0, 0.72], [-1.6, 0.86], [-0.55, 0.86], [-0.4, 0.78], [0.45, 0.78], [1.5, 0.74], [1.98, 0.58], [2.0, 0.34], [1.6, 0.26], [-1.6, 0.26]].forEach(([z, y], i) => (i ? s.lineTo(z, y) : s.moveTo(z, y)));
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.62, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }), red);
  body.rotation.y = -Math.PI / 2; body.position.x = 0.81; body.castShadow = true; g.add(body);
  g.userData.paint = red;
  box(1.5, 0.08, 1.3, tan, 0, 0.82, -0.25); // cockpit tub (tan seats)
  for (const x of [-0.38, 0.38]) { box(0.48, 0.5, 0.12, tan, x, 1.02, -0.72); } // seat backs
  for (const x of [-0.38, 0.38]) { const h = add(new THREE.TorusGeometry(0.22, 0.03, 6, 12, Math.PI), black, x, 1.2, -0.92); } // roll hoops
  box(1.42, 0.36, 0.04, glass, 0, 1.04, 0.42).rotation.x = -0.45; // windscreen
  box(1.46, 0.04, 0.06, black, 0, 1.2, 0.34);
  for (const x of [-0.5, 0.5]) box(0.42, 0.06, 0.32, black, x, 0.88, 1.55); // pop-up headlights (down)
  box(1.0, 0.1, 0.06, black, 0, 0.42, 2.0); // grille mouth
  for (const x of [-0.55, 0.55]) box(0.3, 0.1, 0.05, lam(0x801010, { emissive: 0x300000 }), x, 0.66, -2.0); // tail lights
  box(1.66, 0.12, 0.08, chrome, 0, 0.36, -2.02); // bumper
  box(0.36, 0.06, 0.04, lam(0xf2ead8), 0, 0.5, -2.03); // number plate
  for (const [x, z] of [[-0.76, 1.25], [0.76, 1.25], [-0.76, -1.2], [0.76, -1.2]]) {
    const w = add(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), black, x, 0.3, z); w.rotation.z = Math.PI / 2;
    const r = add(new THREE.CylinderGeometry(0.17, 0.17, 0.21, 10), chrome, x, 0.3, z); r.rotation.z = Math.PI / 2;
  }
  // the driver seen from above (the drive): Johan, dark hair, navy blazer
  const drv = new THREE.Group(); drv.position.set(-0.38, 0.85, -0.45); g.add(drv); g.userData.driver = drv; drv.visible = !!opts.driver;
  add(new THREE.SphereGeometry(0.16, 10, 8), lam(0xf0c8a8), 0, 0.42, 0, drv);
  add(new THREE.SphereGeometry(0.17, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), lam(0x3a2a1e), 0, 0.46, -0.02, drv); // dark swept-back hair
  box(0.5, 0.36, 0.3, lam(0x1e2a4a), 0, 0.18, 0, drv); // navy blazer
  box(0.14, 0.2, 0.02, lam(0xf2f0ea), 0, 0.24, 0.16, drv); // white shirt
  g.userData.half = 2.0; g.userData.height = 1.3;
  return g;
}

export function createJohan(deps) {
  const { THREE, scene, state, dialogue, toast, beep, save, player, loods } = deps;
  const S = () => { if (!state.johan || typeof state.johan !== 'object') state.johan = {}; const j = state.johan; j.drives = j.drives | 0; return j; };
  const day = () => deps.day();
  const far = new THREE.Vector3(0, -99, 0);

  // ------------------------------------------------------------------ the letter (an overlay you click away)
  let letterEl = null;
  function showLetter(done, crossed = !!S().flipped) {
    if (!letterEl) {
      letterEl = document.createElement('div'); letterEl.id = 'johanLetter';
      letterEl.style.cssText = 'position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:rgba(10,6,4,.72);cursor:pointer';
      document.body.appendChild(letterEl);
    }
    const pts = LETTER.points.map((p, i) => `<li style="margin:6px 0${crossed && i === LETTER.forklift ? ';text-decoration:line-through;text-decoration-color:#c2141e;text-decoration-thickness:3px' : ''}">${p}${crossed && i === LETTER.forklift ? ' <b style="color:#c2141e;font-family:Bungee,Arial Black;font-size:13px;text-decoration:none;display:inline-block;transform:rotate(-6deg)">DONE.</b>' : ''}</li>`).join('');
    letterEl.innerHTML = `<div style="width:min(520px,92vw);background:#f4eedc;color:#2a2a34;padding:26px 30px;border-radius:4px;box-shadow:0 12px 40px rgba(0,0,0,.6);transform:rotate(-1.2deg);font:17px/1.4 'Comic Sans MS','Segoe Print','Bradley Hand',cursive;background-image:repeating-linear-gradient(transparent 0 27px,rgba(90,120,200,.22) 27px 28px)">
      <div style="white-space:pre-line">${LETTER.open}</div><ul style="padding-left:22px;margin:10px 0">${pts}</ul><div style="white-space:pre-line">${LETTER.close}</div>
      <div style="margin-top:14px;font:700 12px Rubik,Arial;color:#8a7a5a;text-align:right">click to fold it up</div></div>`;
    letterEl.style.display = 'flex'; state.inDialogue = true; beep(900, 0.05, 'triangle', 0.03);
    letterEl.onclick = () => { letterEl.style.display = 'none'; state.inDialogue = false; if (done) done(); };
  }

  // ------------------------------------------------------------------ 1. the Miata on the road (js/rit.js)
  // driveCue(): handed to every drive. Early game only (no heftruck yet, Act 1 not done): a chance per drive, sure by the third.
  function driveCue() {
    const j = S();
    if (j.met || state.step !== 'free' || (loods && loods.has('heftruck')) || state.act1) return null;
    j.drives++;
    if (j.drives < 3 && Math.random() > 0.5) return null;
    return { onMeet: meetOnRoad };
  }
  function meetOnRoad(done) {
    const j = S();
    dialogue([
      ['Johan', 'EDDY! Eddy Jr.! Long time, man! Still driving the Oofmobiel? Haha, respect.'],
      ['Eddy Jr.', 'Johan.'],
      ['Johan', 'So how\'s business? Big spice baron now? Kruidenkoning of the Kipkruidenkwartier?'],
      ['Eddy Jr.', 'It\'s going fine.'],
      ['Johan', 'Fine. Fine is good. Quick question, though. Did you get a forklift yet?'],
      ['Eddy Jr.', '...No.'],
      ['Johan', 'HAHA! Point three, Eddy. Point three! It\'s all in the letter. A real businessman has a forklift.'],
      ['Eddy Jr.', '(Twenty years of friendship, and he sends me a list. I still have it. In the glovebox.)'],
    ], () => showLetter(() => dialogue([
      ['Johan', 'Anyway, love to Freddy! Ciao, bro!'],
      ['Eddy Jr.', 'One day, Johan. One day I\'ll have a forklift. And then...'],
    ], () => { j.met = 1; j.metDay = day(); if (save) save(); toast('JOHAN', 'Johan roared off in his Miata. Point 3 of the letter: you have no forklift. Yet.', 4); done(); }), false));
  }

  // ------------------------------------------------------------------ 2. revenge in De Hal
  const SPOT = { x: loods.hallAt[0] - 8.4, z: loods.hallAt[1] + 1.9 }; // the clear west end of the hall floor
  const car = makeMiata(THREE); car.visible = false; scene.add(car);
  const pivot = new THREE.Group(); // the flip turns the body around its own long axis
  car.rotation.y = -Math.PI / 2; car.position.set(SPOT.x, 0, SPOT.z); // nose west: he drove in through the dock door
  const sol = deps.solid(SPOT.x - 2.05, SPOT.x + 2.05, SPOT.z - 0.88, SPOT.z + 0.88); sol.off = true;
  let johan = null, flip = null, announced = false;
  const here = () => { const j = S(); return j.met && (!j.flipped || j.flipDay === day()) && loods.has('hal') && loods.has('heftruck') && state.step === 'free'; };
  function ensureJohan() {
    if (johan) return johan;
    johan = deps.makeJohan(); johan.position.set(SPOT.x + 0.4, 0, SPOT.z + 1.6); johan.rotation.y = Math.PI; scene.add(johan); return johan;
  }
  function show(on) {
    car.visible = on; sol.off = !on || !!flip;
    ensureJohan().visible = on;
    if (on && !flip) {
      if (!S().flipped) { car.position.set(SPOT.x, 0, SPOT.z); car.rotation.set(0, -Math.PI / 2, 0); }
      else { car.position.set(SPOT.x, car.userData.height, SPOT.z + 1.9); car.rotation.set(0, -Math.PI / 2, Math.PI); Object.assign(sol, { minz: SPOT.z + 1.02, maxz: SPOT.z + 2.78, off: false }); } // reloaded the same day: still on its roof
    }
  }
  deps.addInteract({
    pos: () => (johan && johan.visible && loods.inside() && !loods.driving() && !flip ? johan.position : far), r: 1.6,
    enabled: () => !!(johan && johan.visible && loods.inside() && !loods.driving() && !flip),
    label: () => (S().flipped ? 'Johan' : 'Talk to Johan'),
    act: () => {
      if (S().flipped) { dialogue([['Johan', 'Don\'t talk to me. My mum is on her way. She\'s FURIOUS.']]); return; }
      dialogue([
        ['Johan', 'Eddy! Look at you, a whole hall! Nice. Who did you borrow the money from?'],
        ['Eddy Jr.', 'Hi Johan. Did you see what\'s standing over there?'],
        ['Johan', '...Is that a forklift?'],
        ['Eddy Jr.', 'Point three, Johan. Point three.'],
        ['Johan', 'Haha, okay, cute. Second-hand, right? Does it even lift anything?'],
        ['Eddy Jr.', '(Get on the heftruck. Show him what it lifts.)'],
      ]);
    },
  });
  // js/loods.js asks this while Eddy drives the heftruck with empty forks: aim the forks at the Miata and lift it
  function forkExtra(tip, F) {
    if (!car.visible || S().flipped || flip || F.carry) return null;
    const d = Math.hypot(tip.x - car.position.x, tip.z - car.position.z);
    if (d > 2.3) return null;
    return { label: 'Lift Johan\'s Miata', act: () => startFlip(F) };
  }
  function startFlip(F) {
    const side = Math.sign(car.position.z - F.z) || 1; // roll it away from the heftruck
    flip = { t: 0, F, side, y0: 0, said: 0 }; F.busy = 5; F.liftTo = 1.35; sol.off = true;
    beep(240, 0.3, 'sawtooth', 0.04);
    if (johan) deps.bubble(johan, 'EDDY?! WHAT ARE YOU DOING?!');
  }
  function update(dt) {
    const on = here();
    if (on !== car.visible && !flip) show(on);
    if (!on) return;
    if (loods.inside() && !announced && !S().flipped) { announced = true; toast('A RED MIATA IN YOUR HALL', 'Johan drove in through the dock door to have a look. He\'s standing next to it. And you have a heftruck now.', 5); }
    if (johan && johan.visible && deps.animate) deps.animate(johan, dt, 0);
    if (!flip) return;
    const f = flip, F = f.F; f.t += dt;
    const lift = Math.max(0, F.lift - 0.12);
    if (f.t < 1.0) { car.position.y = lift * 0.95; car.rotation.x = 0; car.rotation.z = -f.side * Math.min(0.12, f.t * 0.12); } // up on the forks, tipping a little
    else if (f.t < 2.0) { // over she goes: a half roll away from the heftruck
      const k = (f.t - 1.0) / 1.0, a = Math.PI * k * k;
      car.rotation.z = -f.side * (0.12 + a * (1 - 0.12 / Math.PI));
      car.position.y = 1.3 + Math.sin(a) * 0.9; car.position.z = SPOT.z + f.side * k * 1.9;
      if (!f.said && k > 0.3) { f.said = 1; if (johan) deps.bubble(johan, 'NEE NEE NEE NEE!'); }
    } else if (!f.done) { // on its roof
      f.done = 1; car.rotation.z = -f.side * Math.PI; car.position.y = car.userData.height; F.liftTo = 0.12; F.busy = 0;
      beep(55, 0.5, 'sawtooth', 0.09); beep(90, 0.35, 'square', 0.06); setTimeout(() => beep(1400, 0.08, 'triangle', 0.03), 120); if (deps.shake) deps.shake(0.6);
      const cz = car.position.z; Object.assign(sol, { minx: SPOT.x - 2.05, maxx: SPOT.x + 2.05, minz: cz - 0.88, maxz: cz + 0.88, off: false });
      const j = S(); j.flipped = 1; j.flipDay = day(); if (save) save();
      dialogue([
        ['Johan', 'MY MIATA!! Are you INSANE?! That\'s a 1990 NA! Original paint!'],
        ['Eddy Jr.', 'A real businessman has a forklift, Johan. You wrote it yourself.'],
        ['Johan', 'I\'m calling my lawyer! ...And my mum!'],
        ['Eddy Jr.', 'Point three: crossed off.'],
      ], () => showLetter(() => { flip = null; toast('REVENGE', 'Point 3 of Johan\'s letter: crossed off. The Miata stays on its roof until the tow truck comes tomorrow.', 5); }, true));
    }
  }
  return { _flip: () => flip, driveCue, meetOnRoad, forkExtra, update, showLetter, car, letterRead: () => !!S().met };
}
