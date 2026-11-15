// Bakes CMU motion-capture BVH files into looping clips for the Neon Vice skeleton (js/ps2c.js) -> js/mocapclips.js.
//   node tools/mocap.mjs <folder with the .bvh files>
// Source: CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu), BVH conversion by Bruce Hahne (cgspeed).
// "This data is free for use in research and commercial projects worldwide." The database was created with funding from NSF EIA-0196217.
// Retargeting: every target bone takes the source segment's world rotation relative to its rest pose, corrected by the rotation that
// carries the target's rest direction onto the source's rest direction (handles CMU's T-pose vs our A-pose arms and splayed legs).
// The result is stored as local quaternions per bone plus a pelvis offset, cut to a seamless loop and resampled to 30 fps.
import fs from 'node:fs';
import path from 'node:path';
import * as THREE from '../vendor/three.module.min.js';

const SRC = process.argv[2];
const OUT = path.join(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..', 'js', 'mocapclips.js');
const FPS = 30;

// our skeleton (copy of ps2c BONES: name, parent, pivot, end)
const AA = 38 * Math.PI / 180, AD = [Math.sin(AA), -Math.cos(AA), 0];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], mir = (p) => [-p[0], p[1], p[2]];
const SH = [0.215, 1.425, -0.01], EL = add(SH, mul(AD, 0.3)), WR = add(EL, mul(AD, 0.27)), HT = add(WR, mul(AD, 0.18));
const BONES = [
  ['pelvis', -1, [0, 0.95, 0], [0, 1.06, 0]], ['spine', 0, [0, 1.06, 0], [0, 1.26, 0]], ['chest', 1, [0, 1.26, 0], [0, 1.47, 0]], ['neck', 2, [0, 1.47, 0], [0, 1.6, 0]], ['head', 3, [0, 1.6, 0], [0, 1.82, 0]],
  ['uarmL', 2, SH, EL], ['farmL', 5, EL, WR], ['handL', 6, WR, HT], ['uarmR', 2, mir(SH), mir(EL)], ['farmR', 8, mir(EL), mir(WR)], ['handR', 9, mir(WR), mir(HT)],
  ['thighL', 0, [0.1, 0.93, 0], [0.105, 0.51, 0.01]], ['shinL', 11, [0.105, 0.51, 0.01], [0.11, 0.1, -0.01]], ['footL', 12, [0.11, 0.1, -0.01], [0.115, 0.03, 0.17]],
  ['thighR', 0, [-0.1, 0.93, 0], [-0.105, 0.51, 0.01]], ['shinR', 14, [-0.105, 0.51, 0.01], [-0.11, 0.1, -0.01]], ['footR', 15, [-0.11, 0.1, -0.01], [-0.115, 0.03, 0.17]]];
// target bone -> [source joint whose rotation drives it, source joint at the far end (rest direction), or null = no alignment]
const MAP = {
  pelvis: ['Hips', null], spine: ['LowerBack', 'Spine1'], chest: ['Spine1', 'Neck'], neck: ['Neck', 'Head'], head: ['Head', null],
  uarmL: ['LeftArm', 'LeftForeArm'], farmL: ['LeftForeArm', 'LeftHand'], handL: ['LeftHand', 'LeftHandIndex1'],
  uarmR: ['RightArm', 'RightForeArm'], farmR: ['RightForeArm', 'RightHand'], handR: ['RightHand', 'RightHandIndex1'],
  thighL: ['LeftUpLeg', 'LeftLeg'], shinL: ['LeftLeg', 'LeftFoot'], footL: ['LeftFoot', 'LeftToeBase'],
  thighR: ['RightUpLeg', 'RightLeg'], shinR: ['RightLeg', 'RightFoot'], footR: ['RightFoot', 'RightToeBase'],
};

// clips to bake. loop: one gait cycle found between cyc[0]..cyc[1] seconds long; still: a window of `len` seconds
const CLIPS = [
  { name: 'walk', file: '16_15.bvh', kind: 'loop', cyc: [0.85, 1.4] },
  { name: 'walkHeavy', file: '17_08.bvh', kind: 'loop', cyc: [0.9, 1.6] },
  { name: 'jog', file: '16_35.bvh', kind: 'loop', cyc: [0.55, 0.9] },
  { name: 'run', file: '16_55.bvh', kind: 'loop', cyc: [0.5, 0.85] },
  { name: 'idle', file: process.env.IDLE || '40_10.bvh', kind: 'still', len: 6, relaxArms: true, calmHead: 0.3 },
  { name: 'sit', file: process.env.SIT || '86_15.bvh', kind: 'still', len: +(process.env.SITLEN || 4), seat: true, gaze: 0.2, upright: 0.3, handsLow: 12, calmHead: 0.5, lapArms: 0.2 },
];

// arms hanging loose at the sides with a little sway (the source actors fold their arms or hold their hips)
// lap: hands resting on the thighs, keeping `keep` of the actor's own arm movement
function relax(L, t, lap = false, keep = 0) {
  for (const sd of [1, -1]) {
    const n = sd > 0 ? 'L' : 'R', sw = Math.sin(t * 0.9 + (sd > 0 ? 0 : 1.7)) * 0.03;
    const hinge = new THREE.Vector3(AD[0] * sd, AD[1], 0).cross(AX.Z).normalize();
    const set = (b, q) => { L[b + n] = keep ? q.slerp(L[b + n], keep) : q; };
    set('uarm', new THREE.Quaternion().setFromAxisAngle(AX.X, (lap ? -0.42 : -0.04) + sw).multiply(new THREE.Quaternion().setFromAxisAngle(AX.Z, (lap ? -0.6 : -0.52) * sd)));
    set('farm', new THREE.Quaternion().setFromAxisAngle(hinge, (lap ? 0.95 : 0.28) + sw));
    set('hand', new THREE.Quaternion().setFromAxisAngle(hinge, lap ? 0.25 : 0.1));
  }
}
/* ---------------- BVH ---------------- */
function parseBVH(txt) {
  const tok = txt.split(/\s+/).filter(Boolean); let i = 0;
  const joints = [];
  function joint(parent) {
    const name = tok[i++]; const j = { name, parent, offset: [0, 0, 0], ch: [], kids: [] };
    joints.push(j); i++; // {
    while (tok[i] !== '}') {
      const t = tok[i++];
      if (t === 'OFFSET') { j.offset = [+tok[i++], +tok[i++], +tok[i++]]; }
      else if (t === 'CHANNELS') { const n = +tok[i++]; for (let k = 0; k < n; k++) j.ch.push(tok[i++]); }
      else if (t === 'JOINT') j.kids.push(joint(j));
      else if (t === 'End') { i++; const e = { name: name + '_end', parent: j, offset: [0, 0, 0], ch: [], kids: [], end: true }; i++; while (tok[i] !== '}') { if (tok[i++] === 'OFFSET') e.offset = [+tok[i++], +tok[i++], +tok[i++]]; } i++; joints.push(e); j.kids.push(e); }
    }
    i++; return j;
  }
  while (tok[i] !== 'ROOT') i++; i++; joint(null);
  while (tok[i] !== 'Frames:') i++; const nF = +tok[i + 1]; i += 2;
  while (tok[i] !== 'Time:') i++; const dt = +tok[i + 1]; i += 2;
  const nC = joints.reduce((s, j) => s + j.ch.length, 0), frames = [];
  for (let f = 0; f < nF; f++) { frames.push(tok.slice(i, i + nC).map(Number)); i += nC; }
  return { joints, frames, dt, by: Object.fromEntries(joints.map((j) => [j.name, j])) };
}
const AX = { X: new THREE.Vector3(1, 0, 0), Y: new THREE.Vector3(0, 1, 0), Z: new THREE.Vector3(0, 0, 1) };
// world rotation + position of every joint at frame f
function fk(B, f) {
  const vals = B.frames[f]; let c = 0; const out = new Map();
  for (const j of B.joints) {
    const q = new THREE.Quaternion(), p = new THREE.Vector3(...j.offset);
    for (const ch of j.ch) {
      const v = vals[c++];
      if (ch.endsWith('position')) p.setComponent('XYZ'.indexOf(ch[0]), v);
      else q.multiply(new THREE.Quaternion().setFromAxisAngle(AX[ch[0]], v * Math.PI / 180));
    }
    if (j.parent) { const P = out.get(j.parent.name); p.applyQuaternion(P.q).add(P.p); q.premultiply(P.q); }
    out.set(j.name, { q, p });
  }
  return out;
}
function restPos(B) { const out = new Map(); for (const j of B.joints) { const p = new THREE.Vector3(...j.offset); if (j.parent) p.add(out.get(j.parent.name)); else p.set(0, 0, 0); out.set(j.name, p); } return out; }

function bake(cfg) {
  const B = parseBVH(fs.readFileSync(path.join(SRC, cfg.file), 'utf8'));
  const rest = restPos(B);
  // alignment: target rest dir -> source rest dir
  const align = {};
  for (const [b, , pv, end] of BONES) {
    const m = MAP[b];
    if (!m[1]) { align[b] = new THREE.Quaternion(); continue; }
    const dt = new THREE.Vector3(end[0] - pv[0], end[1] - pv[1], end[2] - pv[2]).normalize();
    const ds = rest.get(m[1]).clone().sub(rest.get(m[0])).normalize();
    align[b] = new THREE.Quaternion().setFromUnitVectors(dt, ds);
  }
  const toeY = Math.min(rest.get('LeftToeBase_end')?.y ?? rest.get('LeftToeBase').y, rest.get('LeftFoot').y);
  const restH = -toeY; // hips height above the toes in the T-pose
  const s = 0.95 / restH; // source units -> our metres (leg length match)
  const step = Math.max(1, Math.round(1 / (FPS * B.dt)));
  const all = []; for (let f = 0; f < B.frames.length; f += step) all.push(fk(B, f));
  const N = all.length, sdt = step * B.dt;
  const toe = (w, sd) => (w.get(sd + 'ToeBase_end') || w.get(sd + 'ToeBase')).p.y;
  const floor = Math.min(...all.map((w) => Math.min(toe(w, 'Left'), toe(w, 'Right'))));
  // local rotations per frame (no heading correction yet: pelvis is world)
  const localsOf = () => all.map((w) => {
    const D = {}, L = {};
    for (const [b, par] of BONES) {
      D[b] = w.get(MAP[b][0]).q.clone().multiply(align[b]);
      L[b] = par < 0 ? D[b].clone() : D[BONES[par][0]].clone().invert().multiply(D[b]);
    }
    return L;
  });
  let locals = localsOf();
  const dist = (a, b) => { let d = 0; for (const [n] of BONES) if (n !== 'pelvis') d += 1 - Math.abs(locals[a][n].dot(locals[b][n])); return d; };
  let a0, a1;
  if (cfg.kind === 'loop') {
    // best cycle in the middle of the take (skip 20% at both ends: starts/stops)
    let best = Infinity; const lo = Math.floor(N * 0.2), hi = Math.floor(N * 0.8), c0 = Math.round(cfg.cyc[0] / sdt), c1 = Math.round(cfg.cyc[1] / sdt);
    const hpx = (f) => all[f].get('Hips').p;
    for (let a = lo; a < hi; a++) for (let L = c0; L <= c1 && a + L < hi; L++) { if (hpx(a + L).clone().sub(hpx(a)).setY(0).length() * s / (L * sdt) < 0.7) continue; const d = dist(a, a + L) + 0.5 * dist(a + 1, a + L + 1); if (d < best) { best = d; a0 = a; a1 = a + L; } }
    console.log(cfg.name, 'cycle', a0, a1, (a1 - a0) * sdt, 's, mismatch', best.toFixed(3));
  } else {
    // the stillest window of len seconds
    const L = Math.min(N - 2, Math.round(cfg.len / sdt)); let best = Infinity;
    // lean: how far the chest tips off vertical (sitters lean forward to stand up / backward when flopping down)
    const lean = all.map((w) => { const v = new THREE.Vector3(0, 1, 0).applyQuaternion(w.get('Spine1').q); return Math.acos(Math.min(1, v.y)); });
    // hands raised above the belly (scratching, waving) make a poor loop for a background sitter
    const high = all.map((w) => { const hy = w.get('Hips').p.y + 0.15 / s; return Math.max(0, w.get('LeftHand').p.y - hy) * s + Math.max(0, w.get('RightHand').p.y - hy) * s; });
    for (let a = 0; a + L < N; a += 2) { let m = 0; for (let f = a; f < a + L; f += 3) m += dist(f, Math.min(f + 3, N - 1)) + (cfg.upright || 0) * lean[f] + (cfg.handsLow || 0) * high[f] + (cfg.seat && all[f].get('Hips').p.y - floor > 0.95 * restH ? 50 : 0); m += 3 * dist(a, a + L); if (m < best) { best = m; a0 = a; a1 = a + L; } }
    console.log(cfg.name, 'window', a0, a1, (a1 - a0) * sdt, 's');
  }
  const hp = (f) => all[f].get('Hips').p;
  // heading: travel direction for loops, hips facing for still clips
  let yaw;
  if (cfg.kind === 'loop') { const d = hp(a1).clone().sub(hp(a0)); yaw = Math.atan2(d.x, d.z); }
  else { const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(all[a0].get('Hips').q); yaw = Math.atan2(fwd.x, fwd.z); }
  const unyaw = new THREE.Quaternion().setFromAxisAngle(AX.Y, -yaw);
  // CMU heads tilt down (see READMEFIRST) by a different amount per actor: level the average gaze to a slight downward look
  let pitch = 0;
  for (let f = a0; f < a1; f++) { const v = new THREE.Vector3(0, 0, 1).applyQuaternion(unyaw.clone().multiply(all[f].get('Head').q).multiply(align.head)); pitch += Math.atan2(-v.y, Math.hypot(v.x, v.z)); }
  pitch /= a1 - a0;
  const corr = new THREE.Quaternion().setFromAxisAngle(AX.X, -(pitch - (cfg.gaze ?? 0.1)));
  align.head.multiply(corr); align.neck.multiply(corr.clone().slerp(new THREE.Quaternion(), 0.5));
  console.log('  head pitch', pitch.toFixed(2), '-> corrected');
  locals = localsOf();
  const n = a1 - a0, frames = [];
  // calm the head: keep only some of the actor's looking around (idle actors watch for the bus)
  const calm = {};
  if (cfg.calmHead) for (const b of ['neck', 'head']) {
    const m = new THREE.Vector4(); for (let f = a0; f < a1; f++) { const q = locals[f][b], sg = q.w < 0 ? -1 : 1; m.x += q.x * sg; m.y += q.y * sg; m.z += q.z * sg; m.w += q.w * sg; }
    m.normalize(); calm[b] = new THREE.Quaternion(m.x, m.y, m.z, m.w);
  }
  const meanP = new THREE.Vector3(); for (let f = a0; f < a1; f++) meanP.add(hp(f)); meanP.divideScalar(n);
  for (let k = 0; k <= n; k++) {
    const f = a0 + k, u = k / n, L = {};
    for (const [b] of BONES) {
      let q = locals[f][b].clone();
      if (b === 'pelvis') q.premultiply(unyaw);
      // spread the loop seam error linearly over the cycle so the last frame equals the first
      let qa = locals[a0][b].clone(), qb = locals[a1][b].clone(); if (b === 'pelvis') { qa.premultiply(unyaw); qb.premultiply(unyaw); }
      const err = qb.clone().multiply(qa.clone().invert()); // qb = err * qa
      const fix = new THREE.Quaternion().slerp(err, u).invert();
      q.premultiply(fix);
      if (calm[b]) q = calm[b].clone().slerp(q, cfg.calmHead);
      L[b] = q;
    }
    // pelvis offset: detrended horizontal (in place), height relative to standing, all in our metres
    const trend = cfg.kind === 'loop' ? hp(a0).clone().lerp(hp(a1), u) : meanP;
    const off = hp(f).clone().sub(trend).applyQuaternion(unyaw);
    const y0 = hp(a0).y + (hp(a1).y - hp(a0).y) * u - hp(a0).y; // seam drift
    const root = [off.x * s, ((hp(f).y - y0) - floor - restH) * s, off.z * s];
    if (cfg.relaxArms) relax(L, f * sdt);
    if (cfg.lapArms !== undefined) relax(L, f * sdt, true, cfg.lapArms);
    frames.push({ L, root });
  }
  // seam on the root
  const r0 = frames[0].root, rn = frames[n].root;
  frames.forEach((fr, k) => { const u = k / n; for (let i = 0; i < 3; i++) fr.root[i] -= (rn[i] - r0[i]) * u; });
  if (cfg.seat) { const my = frames.reduce((t, fr) => t + fr.root[1], 0) / frames.length; frames.forEach((fr) => { fr.root[1] -= my; fr.root[0] = 0; fr.root[2] = 0; }); } // the game places seated bodies itself
  const dur = n * sdt;
  let fr2 = frames, fps = FPS;
  if (cfg.kind === 'loop') {
    // start the cycle on the left heel strike (left ankle furthest ahead of the right) so walk/jog/run blend in step
    let kb = 0, best = -Infinity;
    for (let k = 0; k < n; k++) { const w = all[a0 + k], lead = w.get('LeftFoot').p.clone().sub(w.get('RightFoot').p).applyQuaternion(unyaw).z; if (lead > best) { best = lead; kb = k; } }
    fr2 = frames.slice(kb, n).concat(frames.slice(0, kb)); fr2.push(fr2[0]);
  } else { fr2 = frames.filter((_, k) => k % 2 === 0); if ((n % 2)) fr2.push(frames[n]); fps = FPS / 2; } // still clips at 15 fps
  const speed = cfg.kind === 'loop' ? hp(a1).clone().sub(hp(a0)).setY(0).length() * s / dur : 0;
  const r3 = (v) => Math.round(v * 1000) / 1000;
  const q = {}; for (const [b] of BONES) q[b] = fr2.flatMap((fr) => { const v = fr.L[b]; return [r3(v.x), r3(v.y), r3(v.z), r3(v.w)]; });
  return { dur: r3(dur), speed: r3(speed), fps, n: fr2.length, root: fr2.flatMap((fr) => fr.root.map(r3)), q };
}

const out = {}; for (const c of CLIPS) { out[c.name] = bake(c); console.log(' ', c.name, 'dur', out[c.name].dur, 'speed', out[c.name].speed, 'm/s'); }
fs.writeFileSync(OUT, `// Generated by tools/mocap.mjs from the CMU Graphics Lab Motion Capture Database (mocap.cs.cmu.edu; BVH conversion by Bruce Hahne).\n// The database was created with funding from NSF EIA-0196217. Free for research and commercial use.\n// Per clip: dur (s), speed (m/s at 1.0 scale, 0 = in place), n frames at fps, root = pelvis offset xyz per frame, q[bone] = local quaternion xyzw per frame.\nexport const FPS = ${FPS};\nexport const CLIPS = ${JSON.stringify(out)};\n`);
console.log('wrote', OUT, (fs.statSync(OUT).size / 1024).toFixed(0), 'KB');
