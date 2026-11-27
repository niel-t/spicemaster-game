// Life on the new streets (Tristan 2026-11-26): cars that drive and people who walk on the Komijnstraat and in the
// other districts. A small pool that follows Eddy: whatever falls far behind him is put down again ahead, on one of
// the streets near him, so every street he turns into has traffic without one extra car in memory.
//
// set(streets | null): streets = [{ x0, x1, lanes: [z westbound, z eastbound], walks: [z north pavement, z south pavement],
//   rings?: [{ x, z }] rotondes on this street (js/rotonde.js), ring?: { car, walk, L, Lw, southTurn } radii round the island and swerve lengths }
// At a rotonde the cars swerve round the island (anticlockwise) and slow down; walkers on the plein side follow the pavement
// ring, walkers on the other side cross the side street on the zebra, or turn back where there is no room (southTurn).
// deps: THREE, scene, player, makeCar(opts), passerBy(seed), animate(person, speed, dt), solid(x0, x1, z0, z1),
//       eddy() -> { x, z, r } (Eddy, or the vehicle he is in), low

import { bend } from './rotonde.js';

export function createStraatLeven(deps) {
  const { player } = deps;
  const cars = [], folk = [];
  let streets = null, built = false, seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const PAINT = [0xc8102e, 0xf2e8c8, 0x1f4fa0, 0x2f6a3a, 0xe8b020, 0xd8d8d8, 0x5ac8c0, 0x3a3a6a];
  function build() {
    built = true;
    for (let i = 0; i < (deps.low ? 3 : 6); i++) { const g = deps.makeCar({ paint: PAINT[i % PAINT.length], model: [1, 0, 7, 4, 2, 3][i % 6] }); g.visible = false; deps.scene.add(g); cars.push({ g, half: g.userData.half || 2.2, v: 0, dir: 1, s: null, sol: Object.assign(deps.solid(0, 0, 0, 0), { off: true }), on: false }); }
    for (let i = 0; i < (deps.low ? 4 : 9); i++) { const p = deps.passerBy(140 + i * 3); p.visible = false; folk.push({ p, v: 1.0 + (i % 4) * 0.14, dir: 1, s: null, on: false, wait: 0 }); }
  }
  function drop(e, isCar, anywhere) { // put it down on a street near Eddy, out of sight if it can be
    const px = player.position.x, pz = player.position.z;
    const near = streets.filter((s) => Math.abs((s.lanes[0] + s.lanes[1]) / 2 - pz) < 60), s = (near.length ? near : streets)[Math.floor(rnd() * (near.length || streets.length))];
    e.dir = rnd() < 0.5 ? 1 : -1;
    let x = anywhere ? px + (rnd() * 2 - 1) * 70 : px - e.dir * (46 + rnd() * 30); // ahead of the screen edge it will come in from
    if (x < s.x0 + 4 || x > s.x1 - 4) { x = px + e.dir * (46 + rnd() * 30); if (x < s.x0 + 4 || x > s.x1 - 4) { hide(e, isCar); return; } }
    if (Math.abs(x - px) < 22 && Math.abs((s.lanes[0] + s.lanes[1]) / 2 - pz) < 18) { hide(e, isCar); return; } // never pop up in view
    e.s = s; e.on = true;
    if (isCar) { if (cars.some((c) => c !== e && c.on && c.s === s && c.dir === e.dir && Math.abs(c.g.position.x - x) < 14)) { hide(e, true); return; }
      e.z0 = s.lanes[e.dir > 0 ? 1 : 0]; e.g.position.set(x, 0, e.z0); e.g.rotation.y = e.dir > 0 ? 0 : Math.PI; e.g.visible = true; e.v = 6; }
    else { e.z0 = s.walks[rnd() < 0.5 ? 0 : 1] + (rnd() - 0.5) * 0.7; if (s.rings && s.ring && s.rings.some((r) => Math.abs(x - r.x) < s.ring.Lw)) { hide(e, false); return; } e.p.position.set(x, 0, e.z0); e.p.rotation.y = e.dir > 0 ? Math.PI / 2 : -Math.PI / 2; e.p.visible = true; }
  }
  function hide(e, isCar) { e.on = false; e.wait = 0.6 + rnd() * 2; if (isCar) { e.g.visible = false; e.sol.off = true; } else e.p.visible = false; }
  function set(list) {
    if (list === streets || (list && streets && list.length === streets.length && list[0].x0 === streets[0].x0 && list[0].lanes[0] === streets[0].lanes[0])) return;
    streets = list && list.length ? list : null;
    if (!built) { if (!streets) return; build(); }
    for (const c of cars) hide(c, true); for (const f of folk) hide(f, false);
    if (streets) { for (const c of cars) drop(c, true, true); for (const f of folk) drop(f, false, true); }
  }
  function update(dt) {
    if (!streets || !built) return;
    const E = deps.eddy(), px = player.position.x, pz = player.position.z;
    for (const c of cars) {
      if (!c.on) { c.wait = (c.wait || 0) - dt; if (c.wait <= 0) drop(c, true); continue; }
      const p = c.g.position;
      // brake for Eddy (on foot or at the wheel) and for the car in front
      let gap = 1e9; const dE = (E.x - p.x) * c.dir; if (dE > 0 && Math.abs(E.z - p.z) < 1.3 + E.r) gap = dE - c.half - E.r;
      for (const o of cars) if (o !== c && o.on && o.s === c.s && o.dir === c.dir) { const d = (o.g.position.x - p.x) * c.dir; if (d > 0) gap = Math.min(gap, d - c.half - o.half); }
      const B = c.s.rings && c.s.ring ? bend(c.s.rings, p.x + c.dir * 4, c.z0, c.s.ring.car, c.s.ring.L) : null, top = B ? 4.6 : 7.5; // slow into the rotonde
      const want = gap < 1.5 ? 0 : gap < 9 ? Math.min(top, gap * 0.9) : top; c.v += (want - c.v) * Math.min(1, dt * (want < c.v ? 5 : 1.2));
      p.x += c.dir * c.v * dt;
      if (c.s.rings && c.s.ring) { const b = bend(c.s.rings, p.x, c.z0, c.s.ring.car, c.s.ring.L); p.z = b ? b.z : c.z0; c.g.rotation.y = Math.atan2(-(b ? b.slope : 0) * c.dir, c.dir); }
      Object.assign(c.sol, { minx: p.x - c.half, maxx: p.x + c.half, minz: p.z - 0.85, maxz: p.z + 0.85, off: false });
      if (p.x < c.s.x0 || p.x > c.s.x1 || Math.abs(p.x - px) > 100 || Math.abs(p.z - pz) > 95) hide(c, true);
    }
    for (const f of folk) {
      if (!f.on) { f.wait = (f.wait || 0) - dt; if (f.wait <= 0) drop(f, false); continue; }
      const p = f.p.position, dE = (E.x - p.x) * f.dir, blocked = dE > 0 && dE < 1.1 + E.r && Math.abs(E.z - p.z) < 0.7 + E.r;
      const v = blocked ? 0 : f.v; p.x += f.dir * v * dt; deps.animate(f.p, v, dt);
      if (f.s.rings && f.s.ring) { const R = f.s.ring, side = f.z0 < (f.s.lanes[0] + f.s.lanes[1]) / 2 ? -1 : 1;
        if (side > 0 && R.southTurn) { const r = f.s.rings.find((q) => Math.abs(p.x + f.dir * 2 - q.x) < R.Lw); if (r && (r.x - p.x) * f.dir > 0) { f.dir = -f.dir; f.p.rotation.y = f.dir > 0 ? Math.PI / 2 : -Math.PI / 2; } } // no room past the corner: turn back
        else { const b = bend(f.s.rings, p.x, f.z0, R.walk, R.Lw); p.z = b ? b.z : f.z0; f.p.rotation.y = Math.atan2(f.dir, (b ? b.slope : 0) * f.dir); } }
      if (p.x < f.s.x0 + 1 || p.x > f.s.x1 - 1) { f.dir = -f.dir; f.p.rotation.y = f.dir > 0 ? Math.PI / 2 : -Math.PI / 2; p.x = Math.max(f.s.x0 + 1.1, Math.min(f.s.x1 - 1.1, p.x)); }
      if (Math.abs(p.x - px) > 100 || Math.abs(p.z - pz) > 95) hide(f, false);
    }
  }
  return { set, update, get cars() { return cars; }, get folk() { return folk; }, get on() { return !!streets; } };
}
