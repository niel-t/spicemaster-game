// Story dressing and quiet side entrances for the hand-built acts (Act 1 Lampas, Act 2 Noshgey).
//
// 1. eastSide(def, opts): gives a level a second way in. The building gets a dark strip along its east wall: a back alley with bins
//    ('door'), a canal quay with a moored rowboat ('canal'), scaffolding ('scaffold') or a fire escape ('fire'), ending at a swing door
//    into a back room. No lamps, at most one guard who isn't looking. Swing doors make no noise, so it is the stealth way in.
//    The grid grows by three columns on the east; anything the level's decorate() drew east of the old edge (the neighbour house,
//    street props) is moved along with it, so the strip opens up between the building and its neighbour.
//    The engine (js/mission.js) reads def.side: walking in through that door before anyone has seen you pays a QUIET WAY IN bonus.
//
// 2. def.story: a list of props that tell what happens in a place, drawn by buildStory() after decorate(). Each one is
//    { k: kind, at: [x, z] (grid units, continuous: [12.5, 3.5] is the middle of cell 12,3), wall: 'n'|'s'|'e'|'w' (hangs on that
//    wall of its cell), y: (height of the table it sits on), read: [title, text] (walk up to it and Eddy reads it) }.
//    Floor props skip themselves if the cell turned out to be furniture (the spice sacks are placed per level seed).
//    { k: 'custom', draw(c) } is a level's own landmark: c has THREE, root, OX, Z0, W, H, box, cyl, lam, canvasTex, signTex, at(x, z),
//    plate(), glow(); it may return a tick(dt).

import { glowSprite } from './props.js';
import { mergeStatic } from '../richtex.js';

// ------------------------------------------------------------------ helpers
const WALL_ROT = { n: 0, s: Math.PI, w: Math.PI / 2, e: -Math.PI / 2 };
function wallPos(OX, Z0, at, wall, off = 0.012) {
  const cx = Math.floor(at[0]), cz = Math.floor(at[1]), fx = OX + at[0], fz = Z0 + at[1];
  if (wall === 'n') return [fx, Z0 + cz + off];
  if (wall === 's') return [fx, Z0 + cz + 1 - off];
  if (wall === 'w') return [OX + cx + off, fz];
  return [OX + cx + 1 - off, fz];
}
function wrapText(g, text, x, y, maxW, lh) {
  const words = String(text).split(' '); let line = '', yy = y;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = t; }
  if (line) g.fillText(line, x, yy); return yy + lh;
}
const STYLE = {
  cork: { bg: '#b8864e', fg: '#2a1a0e', title: '#8a1a10', paper: '#f3e6c8', pins: true },
  chalk: { bg: '#24382c', fg: '#f3ecd8', title: '#f2c14e', chalk: true },
  paper: { bg: '#f3e6c8', fg: '#2a1a0e', title: '#c2412d' },
  white: { bg: '#eef0ec', fg: '#1a2a3a', title: '#c2412d' },
  menu: { bg: '#1a0e08', fg: '#f3e6c8', title: '#e8a33d' },
  green: { bg: '#e8f0d8', fg: '#2a3a1a', title: '#4a8a2a' },
  kraft: { bg: '#c8a878', fg: '#2a1a0e', title: '#5a2a10' },
};
function boardTex(canvasTex, o) {
  const s = STYLE[o.style || 'cork'], W = 512, H = Math.round(512 * (o.h || 1) / (o.w || 1.4));
  return canvasTex(W, H, (g) => {
    g.fillStyle = s.bg; g.fillRect(0, 0, W, H);
    if (s.pins) for (let i = 0; i < 260; i++) { g.fillStyle = `rgba(60,30,10,${Math.random() * 0.25})`; g.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
    if (s.chalk) for (let i = 0; i < 40; i++) { g.strokeStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(Math.random() * W, Math.random() * H); g.lineTo(Math.random() * W, Math.random() * H); g.stroke(); }
    let y = 22;
    if (s.paper) { g.fillStyle = s.paper; g.save(); g.translate(W / 2, H / 2); g.rotate(-0.02); g.fillRect(-W / 2 + 26, -H / 2 + 20, W - 52, H - 40); g.restore(); y = 34; }
    g.textAlign = 'center'; g.textBaseline = 'top';
    if (o.title) { g.fillStyle = s.title; g.font = `900 ${o.big || 46}px Arial`; y = wrapText(g, o.title, W / 2, y, W - 70, (o.big || 46) + 4) + 6; }
    g.fillStyle = s.fg; g.font = `700 ${o.size || 30}px Arial`; g.textAlign = o.left ? 'left' : 'center';
    for (const l of o.lines || []) {
      const strike = l.startsWith('~'), t = strike ? l.slice(1) : l, x = o.left ? 48 : W / 2;
      const yy = wrapText(g, t, x, y, W - 90, (o.size || 30) + 4);
      if (strike) { const w = Math.min(W - 90, g.measureText(t).width); g.strokeStyle = s.title; g.lineWidth = 5; g.beginPath(); const x0 = o.left ? x : x - w / 2; g.moveTo(x0 - 6, y + (o.size || 30) * 0.55); g.lineTo(x0 + w + 6, y + (o.size || 30) * 0.55); g.stroke(); }
      y = yy;
    }
    if (s.pins) for (const [px, py] of [[34, 24], [W - 34, 24], [34, H - 26], [W - 34, H - 26]]) { g.fillStyle = '#c2412d'; g.beginPath(); g.arc(px, py, 7, 0, 7); g.fill(); }
    if (o.strings) { g.strokeStyle = '#c2412d'; g.lineWidth = 3; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(40 + Math.random() * (W - 80), 80 + Math.random() * (H - 120)); g.lineTo(40 + Math.random() * (W - 80), 80 + Math.random() * (H - 120)); g.stroke(); } }
    if (o.face) { // a photo pinned in the corner (o.face = caption)
      g.fillStyle = '#f8f4ea'; g.fillRect(W - 150, H - 170, 120, 140); g.fillStyle = '#5a4a3a'; g.fillRect(W - 140, H - 160, 100, 96);
      g.fillStyle = '#e8b890'; g.beginPath(); g.arc(W - 90, H - 118, 26, 0, 7); g.fill(); g.fillStyle = '#2a1a10'; g.fillRect(W - 116, H - 146, 52, 12);
      g.fillStyle = '#1a1a1a'; g.font = '700 16px Arial'; g.textAlign = 'center'; g.fillText(o.face, W - 90, H - 56);
    }
  });
}

// ------------------------------------------------------------------ the props
function build(c, it0) {
  let it = it0;
  const { THREE, root, OX, Z0, box, cyl, lam, canvasTex, G } = c;
  if (!it.at) it = { ...it, at: [0, 0] };
  const x = OX + it.at[0], z = Z0 + it.at[1], y = it.y || 0, k = it.k, ticks = [];
  const flat = (w, d, mat, px, py, pz, rz = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.rotation.z = rz; m.position.set(px, py, pz); root.add(m); return m; };
  const onWall = (mesh, h) => { const [wx, wz] = wallPos(OX, Z0, it.at, it.wall || 'n'); mesh.position.set(wx, h, wz); mesh.rotation.y = WALL_ROT[it.wall || 'n']; root.add(mesh); return mesh; };
  const r = (i) => { const s = Math.sin((it.at[0] * 12.9898 + it.at[1] * 78.233 + i * 3.17) * 43758.5453); return s - Math.floor(s); }; // steady per prop
  if (k === 'board' || k === 'poster' || k === 'sign') {
    const w = it.w || (k === 'sign' ? 1.1 : 1.4), h = it.h || (k === 'sign' ? 0.36 : 1.0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lam({ map: boardTex(canvasTex, { ...it, w, h, style: it.style || (k === 'poster' ? 'paper' : k === 'sign' ? 'menu' : 'cork') }) }));
    onWall(m, it.hy || (k === 'sign' ? 2.0 : 1.45));
    if (k === 'board') { const fr = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.1, h + 0.1), lam({ color: 0x4a2a14 })); onWall(fr, it.hy || 1.45); fr.position.addScaledVector(new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), fr.rotation.y), 0.004); }
  } else if (k === 'cash') { // stacks of Wilders
    for (let i = 0; i < (it.n || 4); i++) box(0.32, 0.05 + r(i) * 0.12, 0.16, lam({ color: i % 3 ? 0x6a9a4a : 0x8ab05a }), x - 0.3 + (i % 3) * 0.3, y + 0.05, z - 0.12 + Math.floor(i / 3) * 0.22, root, false);
  } else if (k === 'cards') { // a game left in a hurry: cards, chips, glasses
    for (let i = 0; i < 9; i++) { const cd = flat(0.12, 0.17, lam({ color: i % 4 ? 0xf8f4ea : 0xc2412d }), x - 0.35 + r(i) * 0.7, y + 0.012 + i * 0.001, z - 0.3 + r(i + 9) * 0.6, r(i + 4) * 6); cd.castShadow = false; }
    for (let i = 0; i < 6; i++) cyl(0.04, 0.04, 0.02 + (i % 3) * 0.02, lam({ color: [0xc2412d, 0xe8a33d, 0x2a2a2a, 0xf3e6c8][i % 4] }), x - 0.25 + r(i + 20) * 0.5, y + 0.02, z - 0.25 + r(i + 30) * 0.5, root, 10);
    for (let i = 0; i < 2; i++) cyl(0.04, 0.035, 0.12, new THREE.MeshPhongMaterial({ color: 0xe8a33d, transparent: true, opacity: 0.7 }), x + 0.3 - i * 0.6, y + 0.06, z + 0.25, root, 8);
  } else if (k === 'cups') { // coffee cups and an ashtray
    for (let i = 0; i < 3; i++) cyl(0.045, 0.035, 0.1, lam({ color: i === 1 ? 0xc2412d : 0xf3e6c8 }), x - 0.2 + i * 0.2, y + 0.05, z + (i % 2) * 0.12, root, 8);
    cyl(0.09, 0.07, 0.03, lam({ color: 0x3a3a3a }), x + 0.25, y + 0.015, z - 0.15, root, 10);
  } else if (k === 'papers') { // sheets on the floor
    for (let i = 0; i < (it.n || 7); i++) flat(0.22, 0.3, lam({ color: i % 3 ? 0xf3ecd8 : 0xe8dcb8 }), x - 0.5 + r(i) * 1.0, 0.03 + i * 0.001, z - 0.5 + r(i + 7) * 1.0, r(i + 3) * 6);
  } else if (k === 'spill') { // a puddle: sauce, oil, kombucha...
    const m = new THREE.MeshPhongMaterial({ color: it.color || 0xc2412d, shininess: 90, transparent: true, opacity: 0.85, depthWrite: false });
    for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry((it.r || 0.5) * (1 - i * 0.25), 16), m); p.rotation.x = -Math.PI / 2; p.scale.set(1, 0.6 + r(i) * 0.4, 1); p.position.set(x + (r(i + 5) - 0.5) * 0.6, 0.027 + i * 0.001, z + (r(i + 8) - 0.5) * 0.6); root.add(p); }
  } else if (k === 'outline') { // a taped outline on the floor
    const t = canvasTex(128, 192, (g) => { g.strokeStyle = it.color || '#f3ecd8'; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); g.arc(64, 30, 18, 0, 7); g.moveTo(64, 48); g.lineTo(64, 120); g.moveTo(30, 60); g.lineTo(64, 70); g.lineTo(104, 50); g.moveTo(64, 120); g.lineTo(38, 180); g.moveTo(64, 120); g.lineTo(96, 176); g.stroke(); });
    const m = flat(0.9, 1.35, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }), x, 0.03, z, it.rot || 0.4);
    m.renderOrder = 1;
  } else if (k === 'holes') { // bullet holes in a wall
    const mt = new THREE.MeshBasicMaterial({ color: 0x1a1210 });
    for (let i = 0; i < (it.n || 6); i++) { const hole = new THREE.Mesh(new THREE.CircleGeometry(0.035, 8), mt); onWall(hole, 0.9 + r(i) * 1.0); hole.position.add(new THREE.Vector3((r(i + 3) - 0.5) * 0.9, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), hole.rotation.y)); }
  } else if (k === 'chair') { // a chair on its side
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r(1) * 6; root.add(g);
    box(0.45, 0.05, 0.45, lam({ color: it.color || 0x6a3a1e }), 0, 0.23, 0, g, false); box(0.45, 0.5, 0.05, lam({ color: it.color || 0x6a3a1e }), 0, 0.23, -0.47, g, false);
    g.rotation.z = Math.PI / 2; g.position.y = 0.22;
  } else if (k === 'bags') { // bin bags
    for (let i = 0; i < (it.n || 3); i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), lam({ color: it.color || 0x1a1c1e })); b.scale.set(1, 0.8, 1.1); b.position.set(x - 0.3 + r(i) * 0.6, 0.22, z - 0.3 + r(i + 4) * 0.6); root.add(b); }
  } else if (k === 'bin') { // a wheelie bin
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = it.rot || 0; root.add(g);
    box(0.6, 0.95, 0.6, lam({ color: it.color || 0x2a4a2a }), 0, 0.5, 0, g); box(0.64, 0.06, 0.66, lam({ color: 0x1a2a1a }), 0, 1.0, 0.02, g, false);
  } else if (k === 'crates') { // a stack of crates with a stencil
    const t = canvasTex(64, 64, (g) => { g.fillStyle = '#9a7040'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#6a4a28'; g.lineWidth = 4; g.strokeRect(2, 2, 60, 60); g.beginPath(); g.moveTo(2, 2); g.lineTo(62, 62); g.stroke(); g.fillStyle = it.color || '#c2412d'; g.font = '900 13px Arial'; g.textAlign = 'center'; g.fillText(it.label || 'SPICE', 32, 37); });
    for (let i = 0; i < (it.n || 3); i++) { const cr = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.55), lam({ map: t })); cr.position.set(x + (i === 2 ? 0.12 : (i - 0.5) * 0.58), 0.25 + (i === 2 ? 0.5 : 0), z); cr.rotation.y = r(i) * 0.3; cr.castShadow = true; root.add(cr); }
  } else if (k === 'mattress') { // somebody sleeps here
    box(0.9, 0.12, 1.9, lam({ color: 0x8a8a7a }), x, 0.06, z, root, false); box(0.5, 0.1, 0.3, lam({ color: 0xe8e0d0 }), x, 0.16, z - 0.7, root, false);
    box(0.92, 0.04, 1.1, lam({ color: it.color || 0x7a2a2a }), x, 0.14, z + 0.3, root, false);
  } else if (k === 'ladder') { // a ladder up a wall to the roof
    const g = new THREE.Group(); const [wx, wz] = wallPos(OX, Z0, it.at, it.wall || 'n', 0.25); g.position.set(wx, 0, wz); g.rotation.y = WALL_ROT[it.wall || 'n']; root.add(g);
    const al = lam({ color: 0xa8acb0 }), h = it.h || 3.4;
    for (const s of [-0.22, 0.22]) box(0.05, h, 0.05, al, s, h / 2, 0.08, g, false);
    for (let k2 = 0.3; k2 < h; k2 += 0.32) box(0.44, 0.03, 0.04, al, 0, k2, 0.08, g, false);
    g.rotation.x = 0; g.children.forEach((m) => { m.position.z -= m.position.y * 0.06; });
  } else if (k === 'lamp') { // a bare bulb on a wire, glowing (no real light)
    cyl(0.005, 0.005, 0.7, lam({ color: 0x1a1a1a }), x, 2.0, z, root, 4);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), new THREE.MeshBasicMaterial({ color: it.color || 0xffd890 })); b.position.set(x, 1.64, z); root.add(b);
    const gl = glowSprite(THREE, it.color || 0xffc870, 1.4, 1.4, 0.35); gl.position.set(x, 1.64, z); root.add(gl);
    if (it.flicker) { let t = 0; ticks.push((dt) => { t += dt; gl.material.opacity = Math.sin(t * 23) > 0.6 || Math.sin(t * 3.1) > 0.9 ? 0.05 : 0.35; }); }
  } else if (k === 'tv') { // an old television on the floor or a table, flickering
    box(0.6, 0.48, 0.45, lam({ color: 0x2a2a2a }), x, y + 0.24, z, root);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 0.36), new THREE.MeshBasicMaterial({ color: it.color || 0x8ad8ff })); scr.position.set(x, y + 0.26, z + 0.23); scr.rotation.y = 0; root.add(scr);
    if (it.rot) { scr.position.set(x + Math.sin(it.rot) * 0.23, y + 0.26, z + Math.cos(it.rot) * 0.23); scr.rotation.y = it.rot; }
    let t = 0; ticks.push((dt) => { t += dt; scr.material.color.setHSL(0.55, 0.4, 0.45 + Math.sin(t * 17) * 0.08 + (Math.sin(t * 2.3) > 0.95 ? 0.3 : 0)); });
  } else if (k === 'candles') { // a little shrine: candles round a photo
    const fl = [];
    for (let i = 0; i < (it.n || 5); i++) { const a = i / (it.n || 5) * Math.PI * 2, cx = x + Math.cos(a) * 0.3, cz = z + Math.sin(a) * 0.3; cyl(0.03, 0.03, 0.1 + r(i) * 0.1, lam({ color: 0xf3ecd8 }), cx, y + 0.07, cz, root, 8); const f = glowSprite(THREE, 0xffa040, 0.25, 0.35, 0.8); f.position.set(cx, y + 0.22, cz); root.add(f); fl.push(f); }
    if (it.photo) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.28), lam({ map: boardTex(canvasTex, { style: 'paper', w: 0.22, h: 0.28, title: '', face: it.photo }) })); p.position.set(x, y + 0.16, z); p.rotation.x = -0.9; root.add(p); }
    let t = 0; ticks.push((dt) => { t += dt; fl.forEach((f, i) => { f.material.opacity = 0.6 + Math.sin(t * 9 + i * 2) * 0.2; }); });
  } else if (k === 'dart') { // a dartboard with somebody's photo pinned on it
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), lam({ map: canvasTex(128, 128, (g) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? '#f3e6c8' : '#1a1a1a'; g.beginPath(); g.arc(64, 64, 62 - i * 10, 0, 7); g.fill(); } g.fillStyle = '#c2412d'; g.beginPath(); g.arc(64, 64, 6, 0, 7); g.fill(); g.fillStyle = '#f8f4ea'; g.fillRect(40, 30, 48, 60); g.fillStyle = '#e8b890'; g.beginPath(); g.arc(64, 54, 15, 0, 7); g.fill(); g.fillStyle = '#1a1a1a'; g.font = '700 10px Arial'; g.textAlign = 'center'; g.fillText(it.face || 'EDDY', 64, 84); }) }));
    onWall(m, 1.6);
  } else if (k === 'chalk') { // Shooki's chalk mark: an arrow on the ground pointing the quiet way
    const t = canvasTex(64, 64, (g) => { g.strokeStyle = 'rgba(242,193,78,.85)'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(32, 58); g.lineTo(32, 10); g.moveTo(16, 26); g.lineTo(32, 10); g.lineTo(48, 26); g.stroke(); g.beginPath(); g.arc(50, 52, 6, 0, 7); g.stroke(); });
    const m = flat(0.7, 0.7, new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false }), x, 0.031, z, it.dir || 0); m.renderOrder = 1;
  } else if (k === 'tape') { // a line of tape between two points
    const [x2, z2] = it.to, ax = OX + x2, az = Z0 + z2, len = Math.hypot(ax - x, az - z);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.08), new THREE.MeshBasicMaterial({ map: canvasTex(256, 16, (g) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? (it.color || '#e8a33d') : '#1a1a1a'; g.fillRect(i * 16, 0, 16, 16); } }), side: THREE.DoubleSide }));
    m.position.set((x + ax) / 2, 0.95, (z + az) / 2); m.rotation.y = -Math.atan2(az - z, ax - x); root.add(m);
  } else if (k === 'boat') { // a rowboat moored on the water
    const g = new THREE.Group(); g.position.set(x, -0.15, z); g.rotation.y = it.rot || 0; root.add(g);
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.38, 2.6, 10, 1, true, 0, Math.PI), lam({ color: it.color || 0x7a4a2a, side: THREE.DoubleSide }));
    hull.rotation.x = Math.PI / 2; hull.rotation.y = Math.PI; hull.scale.set(1, 1, 0.7); hull.position.y = 0.32; g.add(hull);
    box(1.0, 0.05, 0.25, lam({ color: 0x9a6a3a }), 0, 0.3, -0.3, g, false); box(1.0, 0.05, 0.25, lam({ color: 0x9a6a3a }), 0, 0.3, 0.5, g, false);
    box(0.06, 0.04, 1.6, lam({ color: 0xc8a060 }), 0.3, 0.38, 0, g, false); // an oar
    let t = r(3) * 6; ticks.push((dt) => { t += dt; g.position.y = -0.15 + Math.sin(t * 1.4) * 0.03; g.rotation.z = Math.sin(t * 1.1) * 0.04; });
  } else if (k === 'bollard') { // a mooring post with a rope
    cyl(0.12, 0.15, 0.55, lam({ color: 0x1a1c20 }), x, 0.27, z, root, 10); cyl(0.17, 0.17, 0.08, lam({ color: 0x1a1c20 }), x, 0.56, z, root, 10);
    if (it.rope) { const [rx, rz] = it.rope; const ax = OX + rx, az = Z0 + rz, len = Math.hypot(ax - x, az - z); const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 5), lam({ color: 0xc8a878 })); rope.position.set((x + ax) / 2, 0.35, (z + az) / 2); rope.rotation.z = Math.PI / 2; rope.rotation.y = -Math.atan2(az - z, ax - x); root.add(rope); }
  } else if (k === 'ring') { // a life ring on a wall
    const m = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 6, 16), lam({ color: 0xe8862c })); onWall(m, 1.4);
  } else if (k === 'scaffold') { // a scaffold tower: pipes, planks and a tarp, up to the roof
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = it.rot || 0; root.add(g);
    const pipe = lam({ color: 0x9aa0a4 }), plank = lam({ color: 0xb8864e }), h = it.h || 4.6, len = it.len || 3;
    for (const sx of [-0.45, 0.45]) for (let i = 0; i <= len; i += 1.5) box(0.05, h, 0.05, pipe, sx, h / 2, -len / 2 + i, g, false);
    for (let yy = 1.5; yy < h; yy += 1.5) { box(1.0, 0.05, len + 0.1, plank, 0, yy, 0, g, false); for (const sx of [-0.45, 0.45]) box(0.04, 0.04, len, pipe, sx, yy + 0.9, 0, g, false); }
    const tarp = new THREE.Mesh(new THREE.PlaneGeometry(len, h * 0.6), lam({ color: it.color || 0x3a6a8a, side: THREE.DoubleSide, transparent: true, opacity: 0.85 })); tarp.rotation.y = Math.PI / 2; tarp.position.set(0.5, h * 0.62, 0); g.add(tarp);
    let t = 0; ticks.push((dt) => { t += dt; tarp.rotation.z = Math.sin(t * 1.7) * 0.03; });
  } else if (k === 'escape') { // a black iron fire escape zig-zagging up a wall
    const g = new THREE.Group(); const [wx, wz] = wallPos(OX, Z0, it.at, it.wall || 'w', 0.6); g.position.set(wx, 0, wz); g.rotation.y = WALL_ROT[it.wall || 'w']; root.add(g);
    const iron = lam({ color: 0x1a1c20 }), len = it.len || 3;
    for (let lv = 1; lv <= 3; lv++) { box(len, 0.05, 1.0, iron, 0, lv * 1.5, 0.1, g, false); box(len, 0.5, 0.03, iron, 0, lv * 1.5 + 0.45, 0.6, g, false);
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.05, 1.9), iron); st.position.set((lv % 2 ? 1 : -1) * len * 0.25, lv * 1.5 - 0.75, 0.1); st.rotation.z = 0; st.rotation.x = 0; st.rotation.y = 0; st.rotation.set(0, 0, (lv % 2 ? -1 : 1) * 0.7); st.scale.set(1, 1, 0.5); g.add(st); }
  } else if (k === 'sacks') { // a few loose sacks (visual only, for quays and alleys)
    for (let i = 0; i < (it.n || 3); i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), lam({ color: it.color || 0xd8c8a0 })); s.scale.set(1.2, 0.7, 0.9); s.position.set(x - 0.3 + (i % 2) * 0.55, 0.2 + Math.floor(i / 2) * 0.32, z + (i % 2 ? 0.1 : -0.1)); root.add(s); }
  } else if (k === 'custom') {
    const tk = it.draw(c); if (tk) ticks.push(tk);
  }
  return ticks;
}

// a free-standing name plate and a glow, for the landmarks
export function plate(c, text, x, y, z, ry = 0, w = 1.4, h = 0.36, bg = '#1a0e08', fg = '#e8a33d') {
  const { THREE, root, signTex } = c;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: signTex([{ t: text, size: 56 }], bg, fg, 512, Math.round(512 * h / w)) }));
  m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m;
}

// buildStory(def, ctx): draws def.story; returns { notes: [{ x, z, title, text }], tick }
export function buildStory(def, ctx) {
  const c = { ...ctx, at: (x, z, y = 0) => new ctx.THREE.Vector3(ctx.OX + x, y, ctx.Z0 + z), plate: (...a) => plate(c, ...a), glow: (...a) => glowSprite(ctx.THREE, ...a) };
  const ticks = [], notes = [], blocked = (x, z) => { const ch = (ctx.G[Math.floor(z)] || [])[Math.floor(x)]; return ch === undefined ? false : ch !== '.'; };
  const floorKinds = new Set(['papers', 'spill', 'outline', 'chair', 'bags', 'bin', 'crates', 'mattress', 'chalk', 'candles', 'sacks']);
  const sg = new ctx.THREE.Group(); ctx.root.add(sg); const cs = { ...c, root: sg }; // still props go in one group that is merged afterwards (cheap to draw)
  const moving = new Set(['tv', 'candles', 'boat', 'scaffold', 'custom']);
  for (const it of def.story || []) {
    if (floorKinds.has(it.k) && !it.y && !it.free && blocked(it.at[0], it.at[1])) continue; // a sack landed there: skip it
    try { ticks.push(...build(moving.has(it.k) || (it.k === 'lamp' && it.flicker) ? c : cs, it)); } catch (e) { console.warn('story prop', def.id, it.k, e); }
    if (it.read) notes.push({ x: ctx.OX + it.at[0], z: ctx.Z0 + it.at[1], title: it.read[0], text: it.read[1], seen: false });
  }
  mergeStatic(sg);
  return { notes, tick: ticks.length ? (dt) => { for (const f of ticks) f(dt); } : null };
}

// ------------------------------------------------------------------ quiet side entrances
const SIDE_LOOK = {
  door: { room: 'alley', name: 'ACHTERDEUR', floor: 'sidecobble' },
  canal: { room: 'quay', name: 'WATERDEUR', floor: 'sidequay' },
  scaffold: { room: 'alley', name: 'BOUWDEUR', floor: 'sidecobble' },
  fire: { room: 'alley', name: 'NOODTRAP', floor: 'sidecobble' },
};
const SIDE_FLOORS = {
  sidecobble: (g) => { g.fillStyle = '#3a3a40'; g.fillRect(0, 0, 64, 64); for (let y = 0; y < 64; y += 8) for (let x = (y / 8) % 2 ? 0 : 4; x < 64; x += 8) { g.fillStyle = ['#56524c', '#605a52', '#4c4844'][(x + y) % 3]; g.fillRect(x + 1, y + 1, 6, 6); } },
  sidequay: (g) => { g.fillStyle = '#4a4744'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#5e5954'; for (let y = 0; y < 64; y += 16) g.fillRect(0, y + 1, 64, 14); g.fillStyle = '#8a7a5a'; g.fillRect(56, 0, 8, 64); },
};
// canal water for a 'canal' side: flat, can't be walked on, bullets fly over it, doors swing over it
const SIDE_WATER = { h: 0.02, cover: false, draw: ({ THREE, root, n, cx, cz }) => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(n, 1), new THREE.MeshPhongMaterial({ color: 0x2a5a72, emissive: 0x0a1e2a, shininess: 120, specular: 0x8ab8d8, transparent: true, opacity: 0.92 }));
  m.rotation.x = -Math.PI / 2; m.position.set(cx, 0.035, cz); root.add(m);
} };

// eastSide(def, { kind, door: [z0, z1], z0 (first strip row, default 1), street: [z0, z1] (street rows inside the grid, if any),
//   guard: [z, weapon, facing], tip, read: [title, text] (a note by the door), sign (door sign), extra: [story props] })
export function eastSide(def, o) {
  const look = SIDE_LOOK[o.kind] || SIDE_LOOK.door, W0 = def.W, H = def.H, z0 = o.z0 ?? 1, zEnd = o.street ? o.street[0] - 1 : H - 1;
  const canal = o.kind === 'canal', wide = canal ? 1 : 2;
  def.W = W0 + 3; def.bounds = [def.bounds[0], def.bounds[1] + 3, ...def.bounds.slice(2)];
  def.floors = { ...SIDE_FLOORS, ...(def.floors || {}) }; def.floorRep = { sidecobble: 1.6, sidequay: 2, ...(def.floorRep || {}) };
  if (canal && !(def.furn && def.furn['~'])) def.furn = { ...(def.furn || {}), '~': SIDE_WATER };
  def.rooms = [...def.rooms, [look.room, W0, z0, W0 + wide - 1, zEnd, look.floor]];
  if (o.street) def.rooms = def.rooms.map((rm) => (rm[2] <= o.street[1] && rm[4] >= o.street[0] && rm[3] >= W0 - 2 ? [rm[0], rm[1], rm[2], W0 + 2, rm[4], rm[5]] : rm));
  const lay = def.layout;
  def.layout = (a) => {
    lay(a); const { carve, put, G } = a;
    for (let z = 0; z < H; z++) for (let x = W0; x < W0 + 3; x++) G[z][x] = '#';
    carve(W0, z0, W0 + wide - 1, zEnd);
    if (canal) for (let z = z0; z <= zEnd; z++) { put(W0 + 1, z, '~'); put(W0 + 2, z, '~'); } // the canal runs on past the level
    if (o.street) carve(W0, o.street[0], W0 + 2, o.street[1]); // the street runs on past the level
    for (let z = o.door[0]; z <= o.door[1]; z++) put(W0 - 1, z, 'D');
  };
  def.doorSigns = { ...(def.doorSigns || {}), [`${W0 - 1},${o.door[0]}`]: o.sign || look.name };
  if (o.guard) def.spawns = [...def.spawns, [W0 + 0.5, o.guard[0], o.guard[1], o.guard[2] ?? Math.PI, look.room]];
  def.side = { doors: Array.from({ length: o.door[1] - o.door[0] + 1 }, (_, i) => [W0 - 1, o.door[0] + i]), name: o.sign || look.name, kind: o.kind };
  if (o.tip && def.text && def.text.tips) def.text.tips = [...def.text.tips, o.tip];
  // the dressing of the strip itself
  const dz = (o.door[0] + o.door[1]) / 2 + 0.5, mouth = zEnd + 0.5, S = [];
  S.push({ k: 'chalk', at: [W0 + 0.5, mouth - 0.6], dir: 0, free: true }, { k: 'chalk', at: [W0 + 0.5, Math.max(dz + 2, (dz + mouth) / 2)], dir: 0, free: true });
  // a dim lantern over the door and one at the mouth: just enough to find the way (glow only, no real light, so the dark still hides you)
  S.push({ k: 'lamp', at: [W0 + 0.35, dz], color: 0x9ab8e8 }, { k: 'lamp', at: [W0 + 0.5, mouth - 1.2], color: 0xffc870, flicker: true });
  if (o.kind === 'door') S.push({ k: 'bin', at: [W0 + 1.5, dz - 2.6], free: true }, { k: 'bin', at: [W0 + 1.5, dz + 2.4], color: 0x5a3a1a, free: true }, { k: 'bags', at: [W0 + 1.5, dz + 3.6], free: true }, { k: 'crates', at: [W0 + 1.5, dz - 4], label: 'RETOUR', free: true });
  if (o.kind === 'canal') S.push({ k: 'boat', at: [W0 + 1.6, dz + 1.5], rot: 0.05 }, { k: 'bollard', at: [W0 + 0.85, dz + 0.2], rope: [W0 + 1.35, dz + 0.9], free: true }, { k: 'bollard', at: [W0 + 0.85, dz + 4.5], free: true }, { k: 'ring', at: [W0 + 0.5, dz - 2], wall: 'w' });
  if (o.kind === 'scaffold') S.push({ k: 'scaffold', at: [W0 + 1.5, dz - 1], len: 4 }, { k: 'ladder', at: [W0 + 0.5, dz - 3.5], wall: 'w' }, { k: 'crates', at: [W0 + 1.5, dz + 3], label: 'BOUW', free: true });
  if (o.kind === 'fire') S.push({ k: 'escape', at: [W0 + 0.5, dz - 3], wall: 'w', len: 3 }, { k: 'bin', at: [W0 + 1.5, dz + 3], free: true });
  if (o.read) S.push({ k: 'sign', at: [W0 + 0.5, dz + 1.6], wall: 'w', title: o.read[0], w: 0.8, h: 0.5, style: 'paper', hy: 1.5, read: o.read });
  def.story = [...(def.story || []), ...S, ...(o.extra || [])];
  // whatever decorate() drew east of the old edge moves east with it
  const dec = def.decorate;
  def.decorate = (c) => {
    const before = new Set(c.root.children), out = dec ? dec(c) : {};
    const edge = c.OX + W0 - 0.05, bb = new c.THREE.Box3();
    for (const ch of [...c.root.children]) {
      if (before.has(ch)) continue;
      bb.setFromObject(ch); const minX = bb.isEmpty() ? ch.position.x : bb.min.x;
      if (minX >= edge) ch.position.x += 3;
    }
    return out;
  };
  return def;
}
