// Motion-capture locomotion for the Neon Vice characters.
// Clips (js/mocapclips.js, baked by tools/mocap.mjs from the CMU mocap database) play through three.js's AnimationMixer on a
// small invisible rig per character; each frame the rig's bone quaternions become the base pose that ps2c.pose() layers the
// game's own arm/leg overrides (aiming, melee, card hands...) on top of.
// Walk / jog / run share one gait phase, so blending between them keeps the feet in step, and the phase advances by the distance
// the character actually travels, which keeps the feet planted instead of sliding.
import * as THREE from '../vendor/three.module.min.js';
import { CLIPS } from './mocapclips.js';

export const BONE_NAMES = ['pelvis', 'spine', 'chest', 'neck', 'head', 'uarmL', 'farmL', 'handL', 'uarmR', 'farmR', 'handR', 'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR'];

// off with ?mocap=0 or localStorage spiceMasterEddy.mocap = '0' (the old procedural walk/idle)
let on = true;
try { if (/[?&]mocap=0/.test(location.search) || localStorage.getItem('spiceMasterEddy.mocap') === '0') on = false; } catch (e) { /* storage blocked */ }
export const mocap = { get on() { return on; }, set on(v) { on = !!v; try { localStorage.setItem('spiceMasterEddy.mocap', on ? '1' : '0'); } catch (e) { /* storage blocked */ } } };

const clips = {};
for (const [name, c] of Object.entries(CLIPS)) {
  const times = Array.from({ length: c.n }, (_, i) => Math.min(c.dur, i / c.fps));
  const tracks = BONE_NAMES.map((b) => new THREE.QuaternionKeyframeTrack(`${b}.quaternion`, times, c.q[b]));
  tracks.push(new THREE.VectorKeyframeTrack('hips.position', times, c.root));
  clips[name] = { clip: new THREE.AnimationClip(name, c.dur, tracks), dur: c.dur, speed: c.speed, stride: c.speed * c.dur };
}
// locomotion ladder: [clip, speed at which it plays at natural rate]
const LOCO = ['walk', 'jog', 'run'];

const qm = new THREE.Matrix4();
export class Gait {
  constructor(heavy) {
    this.rig = new THREE.Object3D();
    this.nodes = {};
    for (const b of [...BONE_NAMES, 'hips']) { const o = new THREE.Object3D(); o.name = b; this.rig.add(o); this.nodes[b] = o; }
    this.mixer = new THREE.AnimationMixer(this.rig);
    this.walkClip = heavy ? 'walkHeavy' : 'walk';
    this.act = {};
    for (const n of ['idle', 'sit', this.walkClip, 'jog', 'run']) { const a = this.mixer.clipAction(clips[n].clip); a.play(); a.setEffectiveWeight(0); this.act[n] = a; }
    this.w = { idle: 1, sit: 0, walk: 0, jog: 0, run: 0 };
    this.phase = Math.random(); this.t = Math.random() * 6;
    this.sv = 0; // smoothed travel speed
    this.lean = 0; this.bank = 0; this.lastYaw = null; this.lastV = 0;
    this.R = {}; this.root = [0, 0, 0];
  }
  // v: travel speed in m/s (already divided by the body scale), seated, dt; returns { R: name -> M4 array, root }
  update(v, seated, dt, yaw) {
    const k = 1 - Math.exp(-dt * 7);
    this.sv += (v - this.sv) * (v < this.sv ? Math.min(1, k * 1.6) : k); // speeding up eases in, stopping settles a bit faster
    const s = this.sv;
    // target weights
    const tw = { idle: 0, sit: 0, walk: 0, jog: 0, run: 0 };
    if (seated) tw.sit = 1;
    else if (s < 0.25) tw.idle = 1;
    else {
      const ws = clips[this.walkClip].speed;
      // the game's walkers move briskly (2-2.6 m/s): walk with a lengthened stride up to 2.6, jog until 5.2, run beyond
      if (s < ws) { const u = (s - 0.25) / (ws - 0.25); tw.walk = u; tw.idle = 1 - u; }
      else if (s < 2.6) tw.walk = 1;
      else if (s < 3.3) { const u = (s - 2.6) / 0.7; tw.walk = 1 - u; tw.jog = u; }
      else if (s < 5.2) tw.jog = 1;
      else if (s < 6.2) { const u = (s - 5.2) / 1.0; tw.jog = 1 - u; tw.run = u; }
      else tw.run = 1;
    }
    let sum = 0;
    for (const n in tw) { this.w[n] += (tw[n] - this.w[n]) * Math.min(1, dt * (seated || n === 'sit' ? 4 : 9)); sum += this.w[n]; }
    // shared gait phase: cycles per second = speed / blended stride length (stride grows a little when sped up past natural)
    let stride = 0, lw = 0;
    for (const n of LOCO) { const c = clips[n === 'walk' ? this.walkClip : n]; const w = this.w[n]; if (w > 0.001) { const over = Math.max(1, s / c.speed); stride += w * c.stride * Math.min(1.4, Math.sqrt(over)); lw += w; } }
    if (lw > 0.001) this.phase = (this.phase + dt * Math.max(s, 0.6) / (stride / lw)) % 1;
    this.t += dt;
    for (const n of ['idle', 'sit', 'walk', 'jog', 'run']) {
      const a = this.act[n === 'walk' ? this.walkClip : n], c = clips[n === 'walk' ? this.walkClip : n];
      a.setEffectiveWeight(this.w[n] / sum);
      a.time = c.speed ? this.phase * c.dur : this.t % c.dur;
    }
    this.mixer.update(0);
    // weight: lean into acceleration, bank into turns (no physics engine needed for a top-down camera)
    const acc = dt > 0 ? (s - this.lastV) / dt : 0; this.lastV = s;
    this.lean += (Math.max(-0.18, Math.min(0.22, acc * 0.035 + s * 0.012)) - this.lean) * Math.min(1, dt * 6);
    let turn = 0;
    if (yaw !== undefined && this.lastYaw !== null && dt > 0) { let d = yaw - this.lastYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); turn = d / dt; }
    this.lastYaw = yaw ?? null;
    this.bank += (Math.max(-0.2, Math.min(0.2, -turn * s * 0.012)) - this.bank) * Math.min(1, dt * 6);
    for (const b of BONE_NAMES) this.R[b] = qm.makeRotationFromQuaternion(this.nodes[b].quaternion).toArray();
    const h = this.nodes.hips.position; this.root[0] = h.x; this.root[1] = h.y; this.root[2] = h.z;
    return this;
  }
}
