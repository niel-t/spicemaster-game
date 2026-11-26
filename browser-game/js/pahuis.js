// Freddy Sr.'s house (Tristan 2026-11-26): "it is filled with just a round suede bed with tvs around it, ashtray in it,
// packs of condoms lying everywhere and it rotates". So that is the whole interior: one room behind a front door on the
// Komijnstraat, a round camel-suede bed that turns slowly, seven televisions in a ring around it, a full ashtray in the
// middle of the bed, and little boxes of Kaasland's finest ("Extra Pittig", "Mild", "Familiepak") on every surface.
// The room is built far from the street the first time Eddy walks in, and reached with a fade (like the shops).
//
// deps: THREE, scene, player, state, box, cyl, lam, canvasTex, signTex, solid, addInteract, setBounds, snapCam, dialogue, toast, beep,
//       busy(), open() (Pa is back), door: { x, z } on the Komijnstraat, makePa() -> a figure of Pa, animate(p, v, dt), onFirst()

const OX = 80, OZ = -150, W = 10, D = 8.4, H = 3.2, BED = { x: OX, z: OZ - 0.4, r: 1.9 };

export function createPaHuis(deps) {
  const { THREE, scene, player, box, cyl, lam } = deps;
  let room = null, inside = false, t = 0;
  const M = {}; const mt = (c, o) => M[c] || (M[c] = lam({ color: c, ...(o || {}) }));
  const fadeEl = document.createElement('div');
  fadeEl.style.cssText = 'position:fixed;inset:0;background:#120a04;opacity:0;pointer-events:none;transition:opacity .35s;z-index:40';
  document.body.appendChild(fadeEl);
  const fadeTo = (fn) => { fadeEl.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { fadeEl.style.opacity = '0'; }, 60); } }, 380); };
  let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // what is on: Kaasland's seven channels, drawn once and scrolled a little so they flicker
  function screen(kind) {
    return deps.canvasTex(128, 96, (c, w, h) => {
      const bars = ['#e8e8e8', '#e8e020', '#20d8d8', '#20c820', '#d820d8', '#d82020', '#2020d8'];
      if (kind === 0) { bars.forEach((b, i) => { c.fillStyle = b; c.fillRect(i * w / 7, 0, w / 7 + 1, h * 0.7); }); c.fillStyle = '#111'; c.fillRect(0, h * 0.7, w, h * 0.3); c.fillStyle = '#fff'; c.font = '700 13px Arial'; c.textAlign = 'center'; c.fillText('KAASLAND 1', w / 2, h * 0.9); }
      else if (kind === 1) { c.fillStyle = '#2f8a3a'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(8, 8, w - 16, h - 16); c.beginPath(); c.moveTo(w / 2, 8); c.lineTo(w / 2, h - 8); c.stroke(); c.beginPath(); c.arc(w / 2, h / 2, 14, 0, 7); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(w * 0.62, h * 0.4, 3, 0, 7); c.fill(); c.fillStyle = '#111'; c.fillRect(0, 0, 58, 14); c.fillStyle = '#ffd23a'; c.font = '700 10px Arial'; c.fillText('AJAKS 2-1', 4, 11); }
      else if (kind === 2) { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6ab0e8'); g.addColorStop(1, '#2a5a9a'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.fillStyle = '#4a9a4a'; c.beginPath(); c.moveTo(40, 20); c.lineTo(84, 14); c.lineTo(96, 50); c.lineTo(70, 84); c.lineTo(44, 70); c.closePath(); c.fill(); c.fillStyle = '#fff'; for (const [x, y] of [[52, 34], [76, 52], [60, 64]]) { c.beginPath(); c.arc(x, y, 8, 0, 7); c.arc(x + 8, y + 2, 6, 0, 7); c.fill(); } c.font = '700 12px Arial'; c.fillText('HET WEER', 6, 14); }
      else if (kind === 3) { c.fillStyle = '#8a1a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffd23a'; c.font = '900 18px Arial'; c.textAlign = 'center'; c.fillText('TELEKOOP', w / 2, 26); c.fillStyle = '#fff'; c.font = '700 11px Arial'; c.fillText('KAASSCHAAF 3000', w / 2, 52); c.fillStyle = '#ffd23a'; c.font = '900 20px Arial'; c.fillText('W 19,95', w / 2, 80); }
      else if (kind === 4) { for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) { const v = Math.floor(rnd() * 255); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(x, y, 2, 2); } }
      else if (kind === 5) { c.fillStyle = '#1a1a2a'; c.fillRect(0, 0, w, h); c.fillStyle = '#e8b890'; c.beginPath(); c.arc(w / 2, 40, 16, 0, 7); c.fill(); c.fillStyle = '#3a3a5a'; c.fillRect(w / 2 - 24, 56, 48, 40); c.fillStyle = '#c8102e'; c.fillRect(0, h - 16, w, 16); c.fillStyle = '#fff'; c.font = '700 10px Arial'; c.fillText('JOURNAAL · KAAS DUURDER', 4, h - 5); }
      else { c.fillStyle = '#101a10'; c.fillRect(0, 0, w, h); c.fillStyle = '#40ff60'; c.font = '700 10px monospace'; ['P100 KAASTEKST', '101 NIEUWS', '201 SPORT', '601 WEER', '888 ONDERTITELS', '702 KRUIDENBEURS'].forEach((l, i) => c.fillText(l, 6, 14 + i * 14)); }
    });
  }
  function build() {
    if (room) return room;
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const b = (w, h, d, c, x, y, z, o) => box(w, h, d, typeof c === 'number' ? mt(c, o) : c, OX + x, y, OZ + z, g, false);
    // the room: wine-red shag, dark wood panelling, a mirror on the ceiling that nobody mentions
    const shag = lam({ map: deps.canvasTex(64, 64, (c) => { c.fillStyle = '#6a1626'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 500; i++) { c.fillStyle = ['#7c1c30', '#58101e', '#8a2238'][i % 3]; c.fillRect(Math.floor(rnd() * 64), Math.floor(rnd() * 64), 1, 3); } }) }); shag.map.wrapS = shag.map.wrapT = THREE.RepeatWrapping; shag.map.repeat.set(7, 6);
    box(W, 0.1, D, shag, OX, -0.05, OZ, g, false);
    b(W, H, 0.15, 0x4a2a1c, 0, H / 2, -D / 2); b(0.15, H, D, 0x4a2a1c, -W / 2, H / 2, 0); b(0.15, H, D, 0x4a2a1c, W / 2, H / 2, 0);
    for (let x = -W / 2 + 0.6; x < W / 2; x += 0.8) b(0.05, H, 0.04, 0x38200f, x, H / 2, -D / 2 + 0.1);
    b(1.0, 2.1, 0.08, 0x2a1a10, 0, 1.05, D / 2 - 0.05); b(0.08, 0.08, 0.06, 0xd8b040, 0.35, 1.0, D / 2 - 0.1); // the front door, on the camera side
    // the bed: a round camel-suede platform with a padded rim, a half-moon headboard, and it turns
    const bed = new THREE.Group(); bed.position.set(BED.x, 0, BED.z); g.add(bed);
    const suede = lam({ map: deps.canvasTex(64, 64, (c) => { c.fillStyle = '#b08450'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 700; i++) { c.fillStyle = i % 2 ? 'rgba(255,230,190,.08)' : 'rgba(60,30,10,.08)'; c.fillRect(Math.floor(rnd() * 64), Math.floor(rnd() * 64), 2, 1); } }) });
    const cy = (rt, rb, h, m, x, y, z, seg = 28, parent = bed) => { const q = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof m === 'number' ? mt(m) : m); q.position.set(x, y, z); parent.add(q); return q; };
    cy(BED.r + 0.12, BED.r + 0.16, 0.3, 0x3a2414, 0, 0.15, 0); cy(BED.r, BED.r + 0.05, 0.34, suede, 0, 0.47, 0);
    { const rim = new THREE.Mesh(new THREE.TorusGeometry(BED.r, 0.11, 8, 36), suede); rim.rotation.x = Math.PI / 2; rim.position.y = 0.62; bed.add(rim);
      const head = new THREE.Mesh(new THREE.CylinderGeometry(BED.r + 0.05, BED.r + 0.05, 0.95, 24, 1, true, Math.PI * 0.62, Math.PI * 0.76), new THREE.MeshLambertMaterial({ map: suede.map, side: THREE.DoubleSide })); head.position.y = 1.05; bed.add(head); }
    for (const [x, z, ry, c] of [[-0.55, -1.2, 0.2, 0xe8d8b8], [0.5, -1.25, -0.15, 0xe8d8b8], [0, -0.8, 0, 0x8a1a2a]]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.2, 0.45), mt(c)); p.position.set(x, 0.74, z); p.rotation.y = ry; bed.add(p); }
    { const sp = new THREE.Mesh(new THREE.CylinderGeometry(BED.r - 0.25, BED.r - 0.25, 0.03, 28, 1, false, 0, Math.PI), mt(0x7a1424)); sp.rotation.y = Math.PI / 2; sp.position.set(0, 0.655, 0.3); bed.add(sp); } // a satin spread, half thrown back
    // the ashtray in the middle of it: cut glass, full
    cy(0.19, 0.15, 0.07, new THREE.MeshPhongMaterial({ color: 0xbfe0e8, transparent: true, opacity: 0.75, shininess: 90 }), 0.15, 0.7, 0.25, 12); cy(0.14, 0.13, 0.03, 0x4a4640, 0.15, 0.71, 0.25, 12);
    for (let i = 0; i < 7; i++) { const q = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.09, 5), mt(i % 2 ? 0xf2ead8 : 0xd8862a)); q.position.set(0.15 + Math.cos(i * 0.9) * 0.08, 0.745, 0.25 + Math.sin(i * 0.9) * 0.08); q.rotation.set(1.2, i, 0.4); bed.add(q); }
    const smoke = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.9), new THREE.MeshBasicMaterial({ map: deps.canvasTex(32, 128, (c) => { const gr = c.createLinearGradient(0, 128, 0, 0); gr.addColorStop(0, 'rgba(230,230,230,.5)'); gr.addColorStop(1, 'rgba(230,230,230,0)'); c.strokeStyle = gr; c.lineWidth = 5; c.beginPath(); c.moveTo(16, 128); c.bezierCurveTo(2, 96, 30, 70, 14, 40); c.bezierCurveTo(6, 22, 22, 12, 16, 0); c.stroke(); }), transparent: true, depthWrite: false })); smoke.position.set(0.15, 1.2, 0.25); bed.add(smoke);
    // the little boxes. Everywhere. (Kaasland's own brand: nothing on them but a flavour.)
    const PACK = [0xc8102e, 0x14499a, 0xd8b040, 0x1a1a1a, 0xff5aa0, 0x2f8a3a], pg = new THREE.BoxGeometry(0.075, 0.022, 0.055);
    const pack = (parent, x, y, z, i) => { const q = new THREE.Mesh(pg, mt(PACK[i % PACK.length])); q.position.set(x, y, z); q.rotation.set((rnd() - 0.5) * 0.3, rnd() * 6.3, (rnd() - 0.5) * 0.3); parent.add(q); const s = new THREE.Mesh(new THREE.BoxGeometry(0.077, 0.006, 0.02), mt(0xf4f2ec)); s.position.set(0, 0.009, 0); q.add(s); };
    for (let i = 0; i < 26; i++) { const a = rnd() * 6.3, r = 0.3 + rnd() * (BED.r - 0.5); pack(bed, Math.cos(a) * r, 0.665 + (i % 5 === 0 ? 0.02 : 0), Math.sin(a) * r, i); }
    for (let i = 0; i < 60; i++) { let x, z; do { x = (rnd() - 0.5) * (W - 1); z = (rnd() - 0.5) * (D - 1); } while (Math.hypot(x, z + 0.4) < BED.r + 0.3); pack(g, OX + x, 0.012, OZ + z, i); }
    { const q = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.34, 0.34), mt(0xb89a6a)); q.position.set(OX + 3.9, 0.17, OZ + 2.6); q.rotation.y = 0.3; g.add(q); const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.2), lam({ map: deps.signTex([{ t: 'GROOTVERPAKKING', size: 60 }, { t: '144 stuks · Extra Pittig', size: 40 }], '#f4f2ec', '#c8102e', 256, 116) })); lb.position.set(0, 0.02, 0.172); q.add(lb); for (let i = 0; i < 9; i++) pack(g, OX + 3.9 + (rnd() - 0.5) * 0.9, 0.012 + (i < 3 ? 0.34 : 0), OZ + 2.6 + (rnd() - 0.5) * 0.9, i); }
    // seven televisions in a ring, every one on a different channel, all of them on
    const tvs = [], N = 7;
    for (let i = 0; i < N; i++) { const a = Math.PI * 0.5 + (i - (N - 1) / 2) * 0.62 + Math.PI, R = 3.75, x = BED.x + Math.cos(a) * R, z = BED.z + Math.sin(a) * R * 0.86, tv = new THREE.Group(); tv.position.set(x, 0, z); tv.rotation.y = Math.atan2(BED.x - x, BED.z - z); g.add(tv);
      const big = i % 3 === 0, w = big ? 0.95 : 0.72, h = big ? 0.72 : 0.56, top = big ? 0.55 : 0.72;
      box(w + 0.1, top, 0.5, mt(i % 2 ? 0x3a2414 : 0x8a8e94), 0, top / 2, 0, tv, false); box(w, h, 0.55, mt(i % 2 ? 0x1a1a1c : 0x5a3a22), 0, top + h / 2, 0, tv, false);
      const sm = new THREE.MeshBasicMaterial({ map: screen(i) }); sm.map.wrapS = sm.map.wrapT = THREE.RepeatWrapping; const sc = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.74, h * 0.74), sm); sc.position.set(-w * 0.07, top + h / 2, 0.28); tv.add(sc); tvs.push(sm);
      for (let k = 0; k < 2; k++) box(0.05, 0.05, 0.02, mt(0xc8ccd2), w * 0.38, top + h * (0.35 + k * 0.2), 0.28, tv, false);
      if (i % 2) { for (const s of [-1, 1]) { const an = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.5, 4), mt(0xc8ccd2)); an.position.set(s * 0.1, top + h + 0.22, 0); an.rotation.z = -s * 0.5; tv.add(an); } }
      deps.solid(x - 0.5, x + 0.5, z - 0.4, z + 0.4); }
    // and the rest of the furniture: a lava lamp, a mirror ball, one slipper
    cy(0.1, 0.13, 0.12, 0xd8b040, OX - 4.2, 0.06, OZ + 2.8, 12, g); cy(0.06, 0.1, 0.42, new THREE.MeshBasicMaterial({ color: 0xff5a2a }), OX - 4.2, 0.33, OZ + 2.8, 12, g); cy(0.03, 0.06, 0.08, 0xd8b040, OX - 4.2, 0.58, OZ + 2.8, 12, g);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 10), new THREE.MeshPhongMaterial({ color: 0xdfe6ee, shininess: 120, specular: 0xffffff, flatShading: true })); ball.position.set(BED.x, H - 0.35, BED.z); g.add(ball);
    b(0.26, 0.07, 0.1, 0x8a1a2a, -2.2, 0.035, 2.4);
    const light = new THREE.PointLight(0xffc890, 0, 16, 1.2); light.position.set(OX, H - 0.5, OZ + 0.6); scene.add(light);
    const glow = new THREE.PointLight(0x6aa0ff, 0, 9, 1.5); glow.position.set(BED.x, 1.4, BED.z - 2.2); scene.add(glow);
    deps.solid(BED.x - 1.55, BED.x + 1.55, BED.z - 1.55, BED.z + 1.55);
    const pa = deps.makePa(); pa.visible = false; pa.position.set(OX - 2.7, 0, OZ + 1.2); pa.rotation.y = Math.PI * 0.6;
    deps.addInteract({ pos: () => new THREE.Vector3(BED.x, 0, BED.z + BED.r + 0.2), r: 1.5, enabled: () => inside && !deps.busy(), label: () => "Pa's bed · have a look", act: look });
    deps.addInteract({ pos: () => new THREE.Vector3(OX, 0, OZ + D / 2 - 0.5), r: 1.2, enabled: () => inside && !deps.busy(), label: () => 'Naar buiten · Komijnstraat', act: () => leave() });
    deps.addInteract({ pos: () => pa.position, r: 1.6, enabled: () => inside && !deps.busy(), label: () => 'Talk to Pa', act: () => deps.dialogue([['Freddy Sr.', PA[(paN++) % PA.length]]]) });
    return (room = { g, bed, tvs, smoke, ball, light, glow, pa });
  }
  let paN = 0, lookN = 0;
  const PA = ['Seven televisions. One for every channel. You never have to choose, jongen. That is freedom.', 'The bed turns. It always turned. Your mother said it made her seasick. She was right.', 'Do not touch the remote controls. They are in an order. I know the order.', 'Suede, Eddy. Camel suede. You cannot clean it and you must never try.', 'The boxes? I bought in bulk. In 1986. A man must be an optimist.', 'Ash goes in the ashtray. The ashtray goes on the bed. The bed goes round. It is a system.'];
  const LOOK = [['Eddy Jr.', 'It turns. Why does it turn.'], ['Eddy Jr.', 'There is an ashtray IN the bed. On the suede.'], ['Eddy Jr.', '"Extra Pittig." "Mild." "Familiepak." Pa, how many of these are there?'], ['Eddy Jr.', 'I am not sitting on that.']];
  function look() { deps.dialogue([LOOK[(lookN++) % LOOK.length], ['Freddy Sr.', PA[(paN++) % PA.length]]]); }
  function enter() {
    if (inside || deps.busy()) return;
    deps.beep(440, 0.06, 'sine', 0.04);
    fadeTo(() => { const r = build(); inside = true; r.g.visible = true; r.pa.visible = true; r.light.intensity = 1.9; r.glow.intensity = 1.4;
      player.position.set(OX, 0, OZ + D / 2 - 1.1); player.rotation.y = Math.PI;
      deps.setBounds({ x0: OX - W / 2 + 0.4, x1: OX + W / 2 - 0.4, z0: OZ - D / 2 + 0.4, z1: OZ + D / 2 - 0.3 }); deps.snapCam();
      deps.toast("PA'S HUIS", 'One room. One bed. Seven televisions.', 3);
      if (deps.onFirst) setTimeout(() => deps.onFirst(), 700); });
  }
  function leave(quick) {
    if (!inside) return; const r = room;
    const go = () => { inside = false; r.g.visible = false; r.pa.visible = false; r.light.intensity = 0; r.glow.intensity = 0; deps.setBounds(null); player.position.set(deps.door.x, 0, deps.door.z + 1.0); player.rotation.y = 0; deps.snapCam(); };
    if (quick) go(); else fadeTo(go);
  }
  function update(dt) {
    if (!inside || !room) return; t += dt;
    room.bed.rotation.y += dt * 0.32; room.ball.rotation.y -= dt * 0.7; // it rotates
    room.smoke.rotation.y = -room.bed.rotation.y; room.smoke.position.x = 0.15 + Math.sin(t * 1.3) * 0.01;
    room.tvs.forEach((m, i) => { if (i === 4) { m.map.offset.set(Math.random(), Math.random()); } else if (i === 5 || i === 3) m.map.offset.x = Math.floor(t * (i === 5 ? 0.5 : 0.25)) % 2 ? 0.004 : 0; });
    room.glow.intensity = 1.2 + Math.sin(t * 9) * 0.15 + Math.sin(t * 23) * 0.1; // seven screens flicker on the walls
    deps.animate(room.pa, 0, dt);
  }
  // the front door on the Komijnstraat
  deps.addInteract({ pos: () => new THREE.Vector3(deps.door.x, 0, deps.door.z), r: 1.5, enabled: () => !inside && deps.open() && !deps.busy(), label: () => "Freddy Sr.'s huis · naar binnen", act: enter });
  const camFocus = (p) => new THREE.Vector3(OX * 0.6 + p.x * 0.4, 0, (OZ - 0.3) * 0.6 + p.z * 0.4);
  const camHeight = () => D * 1.1 + 4.2;
  return { enter, leave, update, camFocus, camHeight, inside: () => inside, get room() { return room; }, BED };
}
