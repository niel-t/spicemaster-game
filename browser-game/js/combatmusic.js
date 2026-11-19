// Adaptive shootout score (WebAudio, generated live, no audio files). Original music in a spice-trader colour:
// D Hijaz (D Eb F# G A Bb C), darbuka and frame drums, an oud-ish pluck, a reedy ney/zurna lead, a synth bass from the
// Neon Vice side of the game, war drums and a low choir for the bosses.
//
// One loop, many layers. mission.js tells it every frame what the fight looks like and the layers fade in and out:
//   calm    (nobody knows you're there)   drone + soft frame drum + a slow oud figure, 92 bpm
//   search  (someone heard something)     + ticking and a high string tremolo, 104 bpm
//   combat  (someone is shooting at you)  + full darbuka, bass, the lead; 128 bpm, more lead the more of them there are
//   boss    (a boss has seen you)         + war drums and the choir on a darker progression, 136 bpm
//   phase 2 (the boss gets angry)         + double-time hats, sixteenth bass, a semitone up, 150 bpm
//   low hp  (one heart left)              everything goes muffled behind a heartbeat and a faint ringing
// Stingers on the way: spotted, boss intro, phase 2, floor clear, death.
// score.pulse (0..1) follows the beat, so the screen can throb in time.

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
const BPM = { calm: 92, search: 104, combat: 128, boss: 136, p2: 150 };
// chord per bar: [bass root, chord tones]
const PROG = [[38, [62, 66, 69]], [39, [63, 67, 70]], [38, [62, 66, 69]], [36, [60, 63, 67]]]; // D  Eb  D  Cm  (the Hijaz turn)
const PROG_BOSS = [[38, [62, 65, 69]], [34, [58, 62, 65]], [36, [60, 63, 67]], [39, [63, 67, 70]]]; // Dm  Bb  Cm  Eb
// the lead, per bar: [16th step, midi]; original lines in Hijaz
const LEAD = [
  [[0, 74], [3, 75], [6, 78], [8, 79], [10, 78], [12, 75], [14, 74]],
  [[0, 75], [2, 74], [4, 72], [6, 70], [8, 69], [12, 70], [14, 72]],
  [[0, 74], [2, 78], [4, 79], [6, 81], [8, 82], [10, 81], [12, 79], [14, 78]],
  [[0, 79], [4, 78], [6, 75], [8, 74], [11, 72], [12, 74]],
];
const LEAD_BOSS = [
  [[0, 74], [4, 77], [6, 75], [8, 74], [12, 69]],
  [[0, 70], [2, 69], [4, 70], [6, 74], [8, 77], [12, 75]],
  [[0, 72], [3, 75], [6, 79], [8, 78], [10, 75], [12, 72]],
  [[0, 75], [2, 78], [4, 79], [6, 82], [8, 81], [10, 79], [12, 78], [14, 75]],
];
const OUD = [0, 7, 12, 7, 3, 7, 12, 15]; // the calm figure, 8ths, semitones over the root

export class CombatScore {
  constructor() {
    this.ctx = null; this.on = false; this.step = 0; this.bpm = BPM.calm; this.key = 0;
    this.lv = { drone: 0, pulse: 0, tension: 0, perc: 0, bass: 0, lead: 0, boss: 0, p2: 0, heart: 0 };
    this.st = { chase: 0, boss: 0, dead: false, done: false, lastSpot: -99 };
    this.hold = 0; this.pulse = 0; this.beats = []; this.mode = 'calm'; this.enabled = true;
  }
  init() {
    if (this.ctx) return true;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    const c = this.ctx;
    this.out = c.createGain(); this.out.gain.value = 0;
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2;
    this.muff = c.createBiquadFilter(); this.muff.type = 'lowpass'; this.muff.frequency.value = 18000; this.muff.Q.value = 0.7;
    this.bus = c.createGain(); this.bus.gain.value = 1;
    this.bus.connect(this.muff); this.muff.connect(comp); comp.connect(this.out); this.out.connect(c.destination);
    // a generated hall (decaying noise impulse), sent from the bus and the stingers
    const len = Math.floor(c.sampleRate * 2.4), ir = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); }
    this.verb = c.createConvolver(); this.verb.buffer = ir; const vg = c.createGain(); vg.gain.value = 0.32; this.verb.connect(vg); vg.connect(this.muff);
    this.send = c.createGain(); this.send.gain.value = 0.5; this.send.connect(this.verb);
    // echo for the lead
    this.dly = c.createDelay(1); const fb = c.createGain(); fb.gain.value = 0.3; const dw = c.createGain(); dw.gain.value = 0.28;
    this.dly.connect(fb); fb.connect(this.dly); this.dly.connect(dw); dw.connect(this.bus);
    // one gain per layer
    this.g = {}; for (const k in this.lv) { const g = c.createGain(); g.gain.value = 0; g.connect(this.bus); g.connect(this.send); this.g[k] = g; }
    this.stingBus = c.createGain(); this.stingBus.gain.value = 0.9; this.stingBus.connect(this.muff); this.stingBus.connect(this.send);
    const nl = c.sampleRate; this.noise = c.createBuffer(1, nl, c.sampleRate); const nd = this.noise.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
    // the ringing in your ears at one heart
    this.ring = c.createOscillator(); this.ring.frequency.value = 3950; this.ringG = c.createGain(); this.ringG.gain.value = 0; this.ring.connect(this.ringG); this.ringG.connect(this.out); this.ring.start();
    return true;
  }
  // ---------------------------------------------------------------- the per-frame hook
  // s: null when no mission is running, else { heist, chase, search, lowhp, boss (0/1/2), dead, done, left }
  update(dt, s, enabled = true, vol = 1) {
    this.pulse *= Math.exp(-dt * 7);
    if (this.ctx) { const now = this.ctx.currentTime; while (this.beats.length && this.beats[0][0] <= now) { const [, k] = this.beats.shift(); this.pulse = Math.max(this.pulse, k); } }
    const want = !!s && enabled;
    if (!want) { if (this.on) this.stop(); return; }
    if (!this.on && !this.start()) return;
    const c = this.ctx, now = c.currentTime;
    // fight state with a little hysteresis, so one guard turning his head doesn't flip the music back and forth
    if (s.chase > 0 || s.boss) this.hold = 5; else this.hold -= dt;
    const loud = !s.heist;
    let mode = s.done ? 'calm' : s.boss === 2 ? 'p2' : s.boss ? 'boss' : this.hold > 0 ? 'combat' : s.search > 0 ? 'search' : 'calm';
    if (s.dead) mode = 'calm';
    this.mode = mode;
    const fight = mode === 'combat' || mode === 'boss' || mode === 'p2', many = Math.min(1, ((s.chase || 0) - 1) / 3);
    const T = {
      drone: s.dead ? 0.4 : fight ? 0.55 : 0.9,
      pulse: s.dead || s.done ? 0 : mode === 'calm' ? 0.75 : mode === 'search' ? 1 : 0.55,
      tension: s.dead || s.done ? 0 : mode === 'search' ? 1 : fight ? 0.35 : 0,
      perc: s.dead || s.done ? 0 : fight ? 1 : 0,
      bass: s.dead || s.done ? 0 : fight ? 1 : mode === 'search' ? 0.35 : 0,
      lead: s.dead || s.done ? 0 : mode === 'combat' ? 0.45 + 0.55 * many : mode === 'boss' || mode === 'p2' ? 1 : 0,
      boss: s.dead || s.done ? 0 : mode === 'boss' || mode === 'p2' ? 1 : 0,
      p2: s.dead || s.done ? 0 : mode === 'p2' ? 1 : 0,
      heart: s.lowhp && !s.dead ? 1 : 0,
    };
    const quiet = s.heist ? 0.55 : 1;
    for (const k in T) { this.lv[k] = T[k]; this.g[k].gain.setTargetAtTime(T[k] * quiet, now, k === 'heart' ? 0.25 : fight ? 0.35 : 1.2); }
    this.target = (s.lowhp && !s.dead) ? 1 : 0;
    this.muff.frequency.setTargetAtTime(s.dead ? 500 : s.lowhp ? 950 : 18000, now, 0.3);
    this.ringG.gain.setTargetAtTime(s.lowhp && !s.dead ? 0.0035 : 0, now, 0.4);
    this.out.gain.setTargetAtTime(0.42 * vol, now, 0.6);
    const da = Math.min(0.5, now - (this.lastT || now)); this.lastT = now; // audio time: the tempo eases the same on a slow frame rate
    this.bpm += (BPM[mode] - this.bpm) * Math.min(1, da * 1.5);
    this.key = mode === 'p2' ? 1 : 0;
    this.dly.delayTime.setTargetAtTime(60 / this.bpm * 0.75, now, 0.2);
    // stingers on the way into each state
    const t = now;
    if (s.chase > 0 && this.st.chase === 0 && !s.boss && loud && t - this.st.lastSpot > 9) { this.stSpot(); this.st.lastSpot = t; }
    if (s.boss >= 1 && this.st.boss === 0) this.stBoss();
    if (s.boss === 2 && this.st.boss === 1) this.stPhase2();
    if (s.done && !this.st.done && !s.dead) this.stClear();
    if (s.dead && !this.st.dead) this.stDeath();
    Object.assign(this.st, { chase: s.chase, boss: s.boss, dead: s.dead, done: s.done });
  }
  start() {
    if (!this.init()) return false; if (this.ctx.state === 'suspended') this.ctx.resume();
    this.on = true; this.step = 0; this.next = this.ctx.currentTime + 0.08; this.hold = 0; this.bpm = BPM.calm;
    Object.assign(this.st, { chase: 0, boss: 0, dead: false, done: false });
    clearInterval(this.timer); this.timer = setInterval(() => this.schedule(), 25);
    return true;
  }
  stop() {
    this.on = false; clearInterval(this.timer); this.beats.length = 0;
    if (this.ctx) { const now = this.ctx.currentTime; this.out.gain.setTargetAtTime(0, now, 0.5); this.ringG.gain.setTargetAtTime(0, now, 0.1); }
  }
  // ---------------------------------------------------------------- instruments
  env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  osc(type, f, t, dur, peak, dest, { a = 0.006, cut = 0, q = 1, det = 0, glide = 0 } = {}) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + dur); o.detune.value = det;
    let n = o; if (cut) { const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.setValueAtTime(cut * 2.5, t); fl.frequency.exponentialRampToValueAtTime(cut, t + Math.min(dur, 0.25)); fl.Q.value = q; o.connect(fl); n = fl; }
    this.env(g, t, a, peak, dur); n.connect(g); g.connect(dest); o.start(t); o.stop(t + a + dur + 0.05);
  }
  hit(t, type, f, peak, dec, dest, q = 1) { const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; this.env(g, t, 0.001, peak, dec); s.connect(fl); fl.connect(g); g.connect(dest); s.start(t, Math.random() * 0.8); s.stop(t + dec + 0.05); }
  doum(t, d, k = 1) { this.osc('sine', 120, t, 0.32, 0.9 * k, d, { a: 0.002, glide: 0.45 }); this.hit(t, 'lowpass', 400, 0.25 * k, 0.06, d); }
  tek(t, d, k = 1) { this.hit(t, 'bandpass', 3200, 0.5 * k, 0.05, d, 3); this.osc('triangle', 820, t, 0.04, 0.12 * k, d, { a: 0.001 }); }
  ka(t, d, k = 1) { this.hit(t, 'bandpass', 2200, 0.25 * k, 0.035, d, 4); }
  frame(t, d, k = 1) { this.osc('sine', 85, t, 0.5, 0.5 * k, d, { a: 0.004, glide: 0.7 }); this.hit(t, 'bandpass', 900, 0.12 * k, 0.12, d, 1.5); }
  taiko(t, d, k = 1) { this.osc('sine', 62, t, 0.9, 1.0 * k, d, { a: 0.003, glide: 0.55 }); this.osc('triangle', 140, t, 0.2, 0.25 * k, d, { a: 0.002, glide: 0.5 }); this.hit(t, 'lowpass', 900, 0.5 * k, 0.25, d); }
  pluck(t, m, d, peak = 0.16, dur = 0.5) { const f = hz(m + this.key); this.osc('sawtooth', f, t, dur, peak, d, { a: 0.002, cut: 1100, q: 4, glide: 0.997 }); this.osc('square', f * 2, t, dur * 0.3, peak * 0.25, d, { a: 0.001, cut: 2400 }); }
  reed(t, m, dur, d, peak = 0.11) { // ney/zurna-ish: a nasal square with vibrato and a breath of noise
    const c = this.ctx, f = hz(m + this.key), o = c.createOscillator(), o2 = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), bp = c.createBiquadFilter(), g = c.createGain();
    o.type = 'square'; o2.type = 'sawtooth'; o.frequency.value = f; o2.frequency.value = f; o2.detune.value = 7;
    lfo.frequency.value = 5.6; lg.gain.value = f * 0.012; lfo.connect(lg); lg.connect(o.frequency); lg.connect(o2.frequency);
    bp.type = 'bandpass'; bp.frequency.value = Math.min(3200, f * 2.2); bp.Q.value = 1.6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.03); g.gain.setValueAtTime(peak, t + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(d); g.connect(this.dly);
    for (const x of [o, o2, lfo]) { x.start(t); x.stop(t + dur + 0.05); }
    this.hit(t, 'highpass', 5000, peak * 0.25, 0.08, d);
  }
  pad(t, notes, dur, d, peak, vowel) { // detuned saws; with a vowel it becomes a low choir (two formant peaks)
    const c = this.ctx, g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let into = g;
    if (vowel) { const m = c.createGain(); const f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter(); f1.type = f2.type = 'bandpass'; f1.frequency.value = vowel[0]; f2.frequency.value = vowel[1]; f1.Q.value = 5; f2.Q.value = 7; m.connect(f1); m.connect(f2); f1.connect(g); f2.connect(g); into = m; }
    else { const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(g); into = lp; }
    g.connect(d);
    for (const n of notes) for (const det of [-9, 0, 9]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(n + this.key); o.detune.value = det; o.connect(into); o.start(t); o.stop(t + dur + 0.05); }
  }
  heart(t) { const d = this.g.heart; this.osc('sine', 58, t, 0.16, 0.9, d, { a: 0.004, glide: 0.6 }); this.osc('sine', 52, t + 0.2, 0.2, 0.6, d, { a: 0.004, glide: 0.6 }); }
  gong(t, k = 1, d = this.stingBus) { for (const [r, a] of [[1, 0.35], [1.48, 0.22], [2.12, 0.16], [2.94, 0.1], [3.76, 0.07]]) this.osc('sine', 98 * r, t, 3.2, a * k, d, { a: 0.01, glide: 0.985 }); this.hit(t, 'bandpass', 600, 0.4 * k, 1.2, d, 0.8); }
  // ---------------------------------------------------------------- the sequencer
  schedule() {
    if (!this.on) return;
    while (this.next < this.ctx.currentTime + 0.12) { const spb = 60 / this.bpm / 4; this.play(this.step, this.next, spb); this.next += spb; this.step = (this.step + 1) % 64; }
  }
  play(step, t, spb) {
    const L = this.lv, G = this.g, bar = Math.floor(step / 16) % 4, s = step % 16, bossy = L.boss > 0.05;
    const [root, chord] = (bossy ? PROG_BOSS : PROG)[bar];
    const swing = s % 2 ? spb * 0.1 : 0; t += swing;
    if (s % 4 === 0) this.beats.push([t, s === 0 ? 1 : 0.55]);
    // drone: the root and fifth, re-struck every bar
    if (s === 0) this.pad(t, [root + 12, root + 19], spb * 17, G.drone, 0.05);
    // pulse: frame drum + the slow oud figure
    if (L.pulse > 0.02) {
      if (s === 0 || s === 10) this.frame(t, G.pulse);
      if (s % 2 === 0) this.pluck(t, root + 24 + OUD[s / 2], G.pulse, 0.07, 0.45);
    }
    // tension: ticking clock and a high tremolo on the second (the Eb that makes Hijaz sound uneasy)
    if (L.tension > 0.02) {
      this.ka(t, G.tension, s % 4 === 0 ? 0.9 : 0.45);
      if (s % 2 === 0) this.osc('sawtooth', hz(chord[1] + 12 + this.key), t, spb * 1.6, 0.025, G.tension, { a: 0.01, cut: 2600 });
      if (s === 0 && bar === 3) this.osc('sine', hz(75 + this.key), t, spb * 14, 0.05, G.tension, { a: spb * 8, glide: 1.06 }); // a slow rising whine into the loop
    }
    // percussion: maqsum on the darbuka, with fills that thicken in the last bar
    if (L.perc > 0.02) {
      if (s === 0 || s === 8 || (s === 7 && bar % 2)) this.doum(t, G.perc);
      if (s === 2 || s === 6 || s === 12) this.tek(t, G.perc);
      if (s % 2 === 1 || (bar === 3 && s > 11)) this.ka(t, G.perc, bar === 3 ? 0.9 : 0.6);
      if (s === 4 || s === 12) this.hit(t, 'bandpass', 1700, 0.35, 0.14, G.perc, 0.9); // a snare-ish slap for the synthwave side
    }
    // bass: octave-jumping saw on the root
    if (L.bass > 0.02) {
      const bp = { 0: 0, 3: 12, 6: 0, 8: 0, 10: 12, 11: 0, 14: 1 };
      if (bp[s] !== undefined) this.osc('sawtooth', hz(root + bp[s] + this.key), t, spb * 1.7, 0.3, G.bass, { a: 0.004, cut: 380, q: 6 });
    }
    // lead: the reed line, an octave down until the fight gets big
    if (L.lead > 0.02) {
      const ln = (bossy ? LEAD_BOSS : LEAD)[bar].find(([st]) => st === s);
      if (ln) { const nx = (bossy ? LEAD_BOSS : LEAD)[bar].find(([st]) => st > s); const dur = ((nx ? nx[0] : 16) - s) * spb * 0.95; this.reed(t, ln[1] - (L.lead < 0.6 && !bossy ? 12 : 0), Math.max(spb, dur), G.lead); }
      if (s % 4 === 2) for (const n of chord) this.pluck(t, n, G.lead, 0.035, 0.18); // offbeat oud stabs
    }
    // boss: war drums and the low choir
    if (L.boss > 0.02) {
      if (s === 0 || s === 8 || (s === 14 && bar % 2) || (s === 11 && bar === 3)) this.taiko(t, G.boss, s === 0 ? 1 : 0.7);
      if (s === 0) this.pad(t, chord.map((n) => n - 12), spb * 16, G.boss, 0.07, bar % 2 ? [400, 800] : [600, 1000]); // "oo" / "ah"
    }
    // phase 2: double-time hats, sixteenth bass, a gong every four bars
    if (L.p2 > 0.02) {
      this.hit(t, 'highpass', 8000, s % 2 ? 0.12 : 0.22, 0.03, G.p2);
      if (s % 2 === 1) this.osc('sawtooth', hz(root + this.key), t, spb * 0.8, 0.18, G.p2, { a: 0.003, cut: 500, q: 5 });
      if (step === 0) this.gong(t, 0.6, G.p2);
    }
    // heartbeat at one heart (once per beat at calm tempo, every two beats in a fight)
    if (L.heart > 0.02 && s % (this.bpm > 120 ? 8 : 4) === 0) this.heart(t);
  }
  // ---------------------------------------------------------------- stingers
  stSpot() { // a sharp intake: noise swell into a dissonant zurna stab (D against Eb)
    const c = this.ctx, t = c.currentTime + 0.02, d = this.stingBus;
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noise; f.type = 'bandpass'; f.Q.value = 2; f.frequency.setValueAtTime(400, t); f.frequency.exponentialRampToValueAtTime(5000, t + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.33); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); s.connect(f); f.connect(g); g.connect(d); s.start(t); s.stop(t + 0.45);
    this.reed(t + 0.36, 74, 0.5, d, 0.14); this.reed(t + 0.36, 75, 0.5, d, 0.09); this.doum(t + 0.36, d, 1.1); this.tek(t + 0.36, d);
    this.pulse = 1;
  }
  stBoss() { // war drum roll into a gong and the choir
    const t = this.ctx.currentTime + 0.05, d = this.stingBus;
    [0, 0.18, 0.32, 0.43, 0.52].forEach((x, i) => this.taiko(t + x, d, 0.5 + i * 0.12));
    this.gong(t + 0.62, 1.1); this.pad(t + 0.62, [50, 57, 62, 65], 3, d, 0.09, [600, 1000]); this.osc('sawtooth', hz(38), t + 0.62, 2.2, 0.25, d, { a: 0.01, cut: 300, q: 4 });
    this.pulse = 1;
  }
  stPhase2() { // a riser, then everything lands a semitone up
    const c = this.ctx, t = c.currentTime + 0.02, d = this.stingBus;
    this.osc('sawtooth', hz(50), t, 1.1, 0.12, d, { a: 0.9, cut: 900, glide: 2 }); this.osc('sawtooth', hz(57), t, 1.1, 0.08, d, { a: 0.9, cut: 900, glide: 2 });
    this.hit(t + 1.0, 'lowpass', 1800, 0.6, 0.5, d); this.taiko(t + 1.0, d, 1.3); this.gong(t + 1.0, 1.2);
    this.pulse = 1;
  }
  stClear() { // the tension resolves: oud run up the scale, then a major chord (Hijaz lands on its bright tonic)
    const t = this.ctx.currentTime + 0.05, d = this.stingBus;
    [62, 63, 66, 67, 69, 70, 72, 74].forEach((m, i) => this.pluck(t + i * 0.07, m, d, 0.13, 0.4));
    this.pad(t + 0.6, [62, 66, 69, 74], 2.6, d, 0.08); [74, 78, 81, 86].forEach((m, i) => this.osc('sine', hz(m), t + 0.6 + i * 0.05, 1.8, 0.07, d, { a: 0.004 })); this.frame(t + 0.6, d, 1.2);
  }
  stDeath() { // a slow downward bend into a thud, with the hall left ringing
    const t = this.ctx.currentTime + 0.02, d = this.stingBus;
    this.osc('sawtooth', hz(62), t, 1.6, 0.14, d, { a: 0.01, cut: 700, glide: 0.5 }); this.osc('sawtooth', hz(63), t, 1.6, 0.1, d, { a: 0.01, cut: 700, glide: 0.5 });
    this.taiko(t + 0.1, d, 1.2); this.gong(t + 0.1, 0.6);
  }
}
