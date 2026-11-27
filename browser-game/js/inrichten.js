// Inrichten (Tristan 2026-11-27): once the furniture is bought, Eddy decides where it stands. A top-down plan of the shed (or of
// De Hal): drag the mixer, the packing table / Inpakmachine and the Kruidenmolen to a new spot on a 25 cm grid. A spot is only
// taken when the machine stands free of walls, racking and pallets, its working sides stay reachable, and every Naknik can
// still walk from the door to every station. The point of it: the shorter the Naknikim's walk through the line (vaten from
// the pallets to the mixer, blend to the packing, bags to the pallet, sacks to the mill), the more they make a day.
// Gerrit's crew put everything in a sensible place, so the standard layout is 100%; a sharp layout gives up to +15% kilos per
// Naknik, a silly one costs up to 10%. state.inricht = { shed: { mixer: [x, z], pack: [x, z], mill: [x, z] }, hall: {...}, eff }
const GRID = 0.25, EFF_MIN = 0.9, EFF_MAX = 1.15, EFF_K = 0.6;
const near = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// deps: THREE, scene, camera, canvas, state, prod, loods, work, solids, shedRect, hallRect(), player, toast, beep, save, paint
//       { mixer, pack } (floor paint groups), mustReach(room) -> [{x,z}], door(room) -> {x,z}, inShed(), inHall(), snapCam()
export function createInrichten(deps) {
  const { THREE, scene, state, prod, loods } = deps;
  const L = () => { const s = state.inricht && typeof state.inricht === 'object' ? state.inricht : (state.inricht = {}); s.shed = s.shed || {}; s.hall = s.hall || {}; return s; };
  const lineRoom = () => (prod.inHall() ? 'hall' : 'shed');
  const PIECES = [
    { id: 'mixer', name: () => prod.TIER[prod.tier()].name, here: (room) => !!state.table && room === lineRoom() },
    { id: 'pack', name: () => (loods.has('inpak') ? 'De Inpakmachine' : 'De inpaktafel'), here: (room) => !!state.table && room === lineRoom() },
    { id: 'mill', name: () => 'De Kruidenmolen', here: (room) => room === 'shed' && loods.has('molen') },
  ];
  const piece = (id) => PIECES.find((p) => p.id === id);
  const defOf = (id, room) => (id === 'mill' ? loods.MILL_DEF : id === 'mixer' ? [prod.SITE_DEF[room].mx, prod.SITE_DEF[room].mz] : [prod.SITE_DEF[room].px, prod.SITE_DEF[room].pz]);
  const posOf = (id, room) => (id === 'mill' ? loods.millAt() : id === 'mixer' ? [prod.SITE[room].mx, prod.SITE[room].mz] : [prod.SITE[room].px, prod.SITE[room].pz]);
  function put(id, room, x, z) {
    if (id === 'mill') loods.setMill(x, z);
    else prod.setSite(room, id === 'mixer' ? { mx: x, mz: z } : { px: x, pz: z });
    const pg = deps.paint && deps.paint[id]; if (pg && room === 'shed') { const d = defOf(id, room); pg.position.set(x - d[0], 0, z - d[1]); }
  }
  const body = (id, room) => { const [x, z] = posOf(id, room), f = id === 'mill' ? [-0.6, 0.6, -0.5, 0.5] : prod.footprint()[id]; return { minx: x + f[0], maxx: x + f[1], minz: z + f[2], maxz: z + f[3] }; };
  const stands = (id, room) => { if (id === 'mill') { const [x, z] = loods.millAt(); return [{ x, z: z - 1.0 }]; } return prod.standPts()[id]; };
  const ownSols = (id) => (id === 'mill' ? [loods.millSol()] : prod.lineSols()[id]);
  const rectOf = (room) => (room === 'hall' ? deps.hallRect() : deps.shedRect);

  // ---- is the piece standing somewhere it may stand? (returns null, or why not)
  const hit = (a, b, pad = 0) => a.minx < b.maxx + pad && a.maxx > b.minx - pad && a.minz < b.maxz + pad && a.maxz > b.minz - pad;
  const ptIn = (p, b, pad = 0) => p.x > b.minx - pad && p.x < b.maxx + pad && p.z > b.minz - pad && p.z < b.maxz + pad;
  function why(id, room) {
    const R = rectOf(room), B = body(id, room), own = ownSols(id);
    if (B.minx < R.x0 + 0.2 || B.maxx > R.x1 - 0.2 || B.minz < R.z0 + 0.2 || B.maxz > R.z1 - 0.2) return 'against the wall';
    const dr = deps.door(room); if (near(dr, { x: Math.max(B.minx, Math.min(B.maxx, dr.x)), z: Math.max(B.minz, Math.min(B.maxz, dr.z)) }) < 1.3) return 'in front of the door';
    for (const s of deps.solids) { if (s.off || own.includes(s) || !hit(B, s)) continue; if (s.maxx - s.minx > 40 || s.maxz - s.minz > 40) continue; return 'on top of something'; }
    for (const p of stands(id, room)) {
      if (p.x < R.x0 + 0.35 || p.x > R.x1 - 0.35 || p.z < R.z0 + 0.35 || p.z > R.z1 - 0.35) return 'its working side is against the wall';
      for (const s of deps.solids) if (!s.off && !own.includes(s) && ptIn(p, s, 0.22)) return 'its working side is blocked';
    }
    for (const q of PIECES) { if (q.id === id || !q.here(room)) continue; for (const p of stands(q.id, room)) if (ptIn(p, B, 0.22)) return `in the way of ${q.name().toLowerCase()}`; }
    return null;
  }
  function reachable(room) { // after a drop: every station and every working side can still be walked to from the door
    deps.work.buildGrid(); const dr = deps.door(room);
    const pts = [...deps.mustReach(room)]; for (const q of PIECES) if (q.here(room)) pts.push(...stands(q.id, room));
    for (const p of pts) { const path = deps.work.findPath(dr, p); if (!path) return false; const end = path[path.length - 1]; if (near(end, p) > 0.6) return false; }
    return true;
  }

  // ---- the walk: how far the Naknikim go through the line in this room, in metres
  const plen = (a, b) => { const p = deps.work.findPath(a, b); if (!p) return near(a, b) * 2.5; let d = 0, c = a; for (const q of p) { d += near(c, q); c = q; } return d; };
  function walk(room) {
    deps.work.buildGrid(); let d = 0;
    if (room === lineRoom() && state.table) {
      const st = (sp) => prod.standAt(sp), pour = prod.pourAt(), sc = prod.scoopAt(), sp = prod.standPts().pack;
      const src = room === 'hall' ? prod.FEED_SPOTS.map(st) : prod.SHED_SPOTS.slice(0, 3).map(st), out = st(room === 'hall' ? prod.OUT_SPOT : prod.SHED_SPOTS[4]);
      d += src.reduce((a, s) => a + plen(s, pour), 0) / src.length * 2; // vaten to the mixer: the most trips
      d += plen(sc, sp[0]); d += plen(sp[sp.length - 1], out);
    }
    if (room === 'shed' && loods.has('molen')) { const [mx, mz] = loods.millAt(); d += plen({ x: -8.45, z: -12.9 }, { x: mx, z: mz - 1.0 }) * 0.5; } // sacks from the pile to the mill
    return d;
  }
  function ref(room) { // the walk with Gerrit's layout, measured now (the pallets on the floor change the paths a little)
    const cur = PIECES.filter((q) => q.here(room)).map((q) => [q.id, posOf(q.id, room)]);
    for (const [id] of cur) { const d = defOf(id, room); put(id, room, d[0], d[1]); }
    const r = walk(room); for (const [id, p] of cur) put(id, room, p[0], p[1]); deps.work.buildGrid();
    return r;
  }
  function measure(room) {
    const w = walk(room), r = ref(room); if (!r) return { walk: w, ref: r, eff: 1 };
    const eff = Math.max(EFF_MIN, Math.min(EFF_MAX, 1 + EFF_K * (r - w) / r));
    return { walk: w, ref: r, eff: Math.round(eff * 100) / 100 };
  }
  function recompute() { const S = L(); const m = measure(lineRoom()); S.eff = m.eff; return m; }
  const eff = () => { const e = +L().eff; return e > 0 ? e : 1; };

  // ---- applying the saved layout (on load, and whenever something new is bought: the mixer changes size)
  let sig = '';
  function tick() {
    const S = L(), s = JSON.stringify([S.shed, S.hall, lineRoom(), prod.tier(), loods.has('inpak'), loods.has('molen'), !!state.table]);
    if (s === sig) return; sig = s;
    for (const room of ['shed', 'hall']) for (const q of PIECES) { const p = S[room][q.id]; if (p && (q.id !== 'mill' || room === 'shed')) put(q.id, room, p[0], p[1]); }
    if (on) return; recompute();
  }

  // ================================================================== the planning view
  let on = false, room = 'shed', sel = null, drag = null, panel = null, msg = '';
  const outlines = new Map(); const mats = { idle: new THREE.MeshBasicMaterial({ color: 0xf4f2ec, depthTest: false, transparent: true }), sel: new THREE.MeshBasicMaterial({ color: 0xf2c31a, depthTest: false, transparent: true }), bad: new THREE.MeshBasicMaterial({ color: 0xe83a2a, depthTest: false, transparent: true }), dot: new THREE.MeshBasicMaterial({ color: 0x3aa0ff, depthTest: false, transparent: true }) };
  const barGeo = new THREE.BoxGeometry(1, 0.02, 1), dotGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.02, 12);
  function outline(id) {
    if (outlines.has(id)) return outlines.get(id);
    const g = new THREE.Group(); g.renderOrder = 10; scene.add(g); const bars = []; for (let i = 0; i < 4; i++) { const m = new THREE.Mesh(barGeo, mats.idle); m.renderOrder = 10; g.add(m); bars.push(m); }
    const dots = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(dotGeo, mats.dot); m.renderOrder = 10; g.add(m); dots.push(m); }
    const o = { g, bars, dots }; outlines.set(id, o); return o;
  }
  function drawOutlines() {
    for (const [id, o] of outlines) o.g.visible = false;
    if (!on) return;
    for (const q of PIECES) {
      if (!q.here(room)) continue; const o = outline(q.id), B = body(q.id, room), w = B.maxx - B.minx, d = B.maxz - B.minz, cx = (B.minx + B.maxx) / 2, cz = (B.minz + B.maxz) / 2, y = 0.1, t = 0.13;
      const m = drag && drag.id === q.id && drag.bad ? mats.bad : sel === q.id ? mats.sel : mats.idle;
      [[w + t, t, cx, B.minz], [w + t, t, cx, B.maxz], [t, d, B.minx, cz], [t, d, B.maxx, cz]].forEach(([sx, sz, x, z], i) => { const b = o.bars[i]; b.material = m; b.scale.set(sx, 1, sz); b.position.set(x, y, z); });
      const st = stands(q.id, room); o.dots.forEach((dm, i) => { dm.visible = !!st[i]; if (st[i]) dm.position.set(st[i].x, y, st[i].z); });
      o.g.visible = true;
    }
  }
  function cam() { // straight down, the room in the band between the HUD at the top and the panel at the bottom
    const R = rectOf(room), vh = innerHeight || 720, top = 0.07, bot = panel ? Math.min(0.55, (panel.offsetHeight + 24) / vh) : 0.3, f = 1 - top - bot;
    const t = Math.tan((deps.camera.fov * Math.PI / 180) / 2), W = R.x1 - R.x0 + 0.8, D = R.z1 - R.z0 + 0.8;
    const Hv = Math.max(D / f, W / deps.camera.aspect), h = Hv / 2 / t, cz = R.z0 - 0.4 - top * Hv + Hv / 2;
    return { pos: new THREE.Vector3((R.x0 + R.x1) / 2, h, cz + 0.01), look: new THREE.Vector3((R.x0 + R.x1) / 2, 0, cz) };
  }
  const pct = (e) => `${e >= 1 ? '+' : '−'}${Math.round(Math.abs(e - 1) * 100)}%`;
  function render() {
    if (!panel) return; const m = measure(room), list = PIECES.filter((q) => q.here(room));
    panel.innerHTML = `<div class="ir-h">INRICHTEN · ${room === 'hall' ? 'De Hal' : 'De schuur'}</div>
      <div class="ir-t">Drag a machine to a new spot${matchMedia('(pointer:fine)').matches ? ', or pick one and use the arrow keys' : ''}. The blue dots are where the Naknikim stand to work. A shorter walk means more kilos a day.</div>
      <div class="ir-c">${list.map((q) => `<button data-ir="${q.id}" class="${sel === q.id ? 'on' : ''}">${q.name()}</button>`).join('')}</div>
      <div class="ir-m">Walk through the line: <b>${m.walk.toFixed(1).replace('.', ',')} m</b> (standard ${m.ref.toFixed(1).replace('.', ',')} m) · <b style="color:${m.eff >= 1 ? '#7ee07e' : '#ff8a7a'}">${pct(m.eff)}</b> kilos per Naknik${room !== lineRoom() && !loods.has('molen') ? '' : ''}</div>
      ${msg ? `<div class="ir-w">${msg}</div>` : ''}
      <div class="ir-b"><button data-ir="reset">Standard layout</button><button data-ir="done" class="go">Done</button></div>`;
  }
  function css() {
    if (document.getElementById('irCss')) return; const st = document.createElement('style'); st.id = 'irCss';
    st.textContent = `#inricht{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(560px,calc(100vw - 24px));background:rgba(18,20,26,.9);color:#f4f2ec;border:2px solid #f2c31a;border-radius:12px;padding:10px 12px;font:14px/1.35 Nunito,Arial,sans-serif;z-index:60;box-shadow:0 6px 24px rgba(0,0,0,.45)}
#inricht .ir-h{font-weight:900;letter-spacing:.06em;color:#f2c31a;margin-bottom:4px}#inricht .ir-t{font-size:12.5px;opacity:.85}#inricht .ir-c,#inricht .ir-b{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#inricht button{font:700 13px Nunito,Arial,sans-serif;padding:7px 11px;border-radius:8px;border:1px solid #6a6e74;background:#2a2e36;color:#f4f2ec;cursor:pointer;min-height:36px}#inricht button.on{background:#f2c31a;color:#1a1a1a;border-color:#f2c31a}
#inricht button.go{margin-left:auto;background:#2f8a3a;border-color:#4ab05a}body.irOn #objective,body.irOn #area,body.irOn #vandaag,body.irOn #help,body.irOn #prompt{display:none!important}#inricht .ir-m{margin-top:8px}#inricht .ir-w{margin-top:6px;color:#ff9a8a;font-weight:700}`;
    document.head.appendChild(st);
  }
  function open(r) {
    room = r; if (!PIECES.some((q) => q.here(room))) { deps.toast('INRICHTEN', room === 'shed' ? 'Nothing to move here yet. The mixer and the packing stand in De Hal now; buy the Kruidenmolen and you can place it in the shed.' : 'Nothing to move here yet.', 4); return; }
    on = true; sel = PIECES.find((q) => q.here(room)).id; msg = ''; state.inPC = true; css(); document.body.classList.add('irOn');
    panel = document.createElement('div'); panel.id = 'inricht'; document.body.appendChild(panel);
    panel.addEventListener('click', (e) => { const b = e.target.closest('[data-ir]'); if (!b) return; const k = b.dataset.ir;
      if (k === 'done') return close(); if (k === 'reset') return reset(); sel = k; msg = ''; render(); });
    render(); drawOutlines(); deps.beep(520, 0.08, 'triangle', 0.04);
  }
  function close() {
    if (!on) return; on = false; state.inPC = false; drag = null; document.body.classList.remove('irOn'); if (panel) panel.remove(); panel = null; drawOutlines();
    const m = recompute(); deps.save(); if (deps.snapCam) deps.snapCam();
    deps.toast('INGERICHT', `Walk through the line ${m.walk.toFixed(1).replace('.', ',')} m: ${pct(m.eff)} kilos per Naknik a market day.`, 3.5);
  }
  function reset() {
    const S = L(); for (const q of PIECES) { if (!q.here(room)) continue; const d = defOf(q.id, room); put(q.id, room, d[0], d[1]); delete S[room][q.id]; }
    msg = ''; sig = ''; drawOutlines(); render(); deps.beep(330, 0.08, 'triangle', 0.04);
  }
  // a spot for the selected piece: taken if it is allowed and everything can still be reached, else back to where it was
  function settle(id, from) {
    const w = why(id, room); if (!w && reachable(room)) { const p = posOf(id, room); L()[room][id] = [p[0], p[1]]; msg = ''; deps.beep(600, 0.06, 'triangle', 0.04); }
    else { put(id, room, from[0], from[1]); msg = `${piece(id).name()} can't stand there: ${w || 'it cuts off a walkway'}.`; deps.beep(160, 0.15, 'square', 0.04); deps.work.buildGrid(); }
    render(); drawOutlines();
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  const floorAt = (e) => { const r = deps.canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, deps.camera); return ray.ray.intersectPlane(plane, hitP) ? { x: hitP.x, z: hitP.z } : null; };
  const snap = (v) => Math.round(v / GRID) * GRID;
  deps.canvas.addEventListener('pointerdown', (e) => {
    if (!on) return; e.stopImmediatePropagation(); e.preventDefault(); const p = floorAt(e); if (!p) return;
    const q = PIECES.filter((x) => x.here(room)).find((x) => ptIn(p, body(x.id, room), 0.35)); if (!q) return;
    sel = q.id; const at = posOf(q.id, room); drag = { id: q.id, from: at.slice(), off: [at[0] - p.x, at[1] - p.z], bad: false, pid: e.pointerId };
    try { deps.canvas.setPointerCapture(e.pointerId); } catch (er) { /* fine */ } msg = ''; render(); drawOutlines();
  }, true);
  deps.canvas.addEventListener('pointermove', (e) => {
    if (!on || !drag) return; e.stopImmediatePropagation(); const p = floorAt(e); if (!p) return;
    const x = snap(p.x + drag.off[0]), z = snap(p.z + drag.off[1]), cur = posOf(drag.id, room); if (x === cur[0] && z === cur[1]) return;
    put(drag.id, room, x, z); drag.bad = !!why(drag.id, room); drawOutlines();
  }, true);
  const up = (e) => { if (!on || !drag) return; e.stopImmediatePropagation(); const d = drag; drag = null; const cur = posOf(d.id, room); if (cur[0] !== d.from[0] || cur[1] !== d.from[1]) settle(d.id, d.from); else drawOutlines(); };
  deps.canvas.addEventListener('pointerup', up, true); deps.canvas.addEventListener('pointercancel', up, true);
  addEventListener('keydown', (e) => {
    if (!on) return; const mv = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1], KeyA: [-1, 0], KeyD: [1, 0], KeyW: [0, -1], KeyS: [0, 1] }[e.code];
    if (e.code === 'Escape' || e.code === 'Enter') { e.stopImmediatePropagation(); e.preventDefault(); close(); return; }
    if (mv && sel) { e.stopImmediatePropagation(); e.preventDefault(); const from = posOf(sel, room); put(sel, room, from[0] + mv[0] * GRID, from[1] + mv[1] * GRID); settle(sel, from); }
  }, true);
  function update() { if (on) drawOutlines(); }
  return { open, close, tick, update, cam, eff, recompute, measure, active: () => on, room: () => room, why, reachable, PIECES, posOf, put, settle };
}
