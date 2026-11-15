// Upbeat procedural synth-pop loop (WebAudio), in the spirit of Neon Vice's soundtrack. No audio files needed.
export class Music {
  constructor() { this.ctx = null; this.on = false; this.step = 0; this.bpm = 116; this.key = 0; }
  // radio stations (the radio in Eddy's woning, js/woning.js): same song, another tempo and key
  setStation(st) { this.bpm = st.bpm; this.key = st.key; if (this.delay) this.delay.delayTime.value = 60 / this.bpm * 0.75; }
  init() {
    if (this.ctx) return;
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain(); this.master.gain.value = 0.22;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 4;
    this.master.connect(comp).connect(ctx.destination);
    // short stereo-ish echo for the lead
    this.delay = ctx.createDelay(); this.delay.delayTime.value = 60 / this.bpm * 0.75;
    const fb = ctx.createGain(); fb.gain.value = 0.28; this.delay.connect(fb).connect(this.delay);
    const dw = ctx.createGain(); dw.gain.value = 0.35; this.delay.connect(dw).connect(this.master);
    const len = ctx.sampleRate; const buf = ctx.createBuffer(1, len, ctx.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
  }
  toggle() { this.on ? this.stop() : this.start(); return this.on; }
  start() {
    this.init(); if (this.ctx.state === 'suspended') this.ctx.resume();
    if (this.on) return; this.on = true; this.next = this.ctx.currentTime + 0.05;
    this.timer = setInterval(() => this.schedule(), 25);
  }
  stop() { this.on = false; clearInterval(this.timer); }
  // ---- instruments
  env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  kick(t) { const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14); this.env(g, t, 0.002, 0.9, 0.28); o.connect(g).connect(this.master); o.start(t); o.stop(t + 0.32); }
  noiseHit(t, type, freq, peak, dec) { const c = this.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noise; f.type = type; f.frequency.value = freq; this.env(g, t, 0.001, peak, dec); s.connect(f).connect(g).connect(this.master); s.start(t, Math.random() * 0.5); s.stop(t + dec + 0.05); }
  tone(t, midi, dur, type, peak, cutoff, dest = this.master, detune = 0) {
    const c = this.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain();
    o.type = type; o.frequency.value = 440 * Math.pow(2, (midi + this.key - 69) / 12); o.detune.value = detune;
    f.type = 'lowpass'; f.frequency.setValueAtTime(cutoff * 2.2, t); f.frequency.exponentialRampToValueAtTime(cutoff, t + dur * 0.6); f.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f).connect(g).connect(dest); o.start(t); o.stop(t + dur + 0.02);
  }
  // ---- song: C - G - Am - F, funky bass, offbeat stabs, a sunny hook
  schedule() {
    const spb = 60 / this.bpm / 4; // seconds per 16th
    while (this.next < this.ctx.currentTime + 0.12) { this.play(this.step, this.next, spb); this.next += spb; this.step = (this.step + 1) % 128; }
  }
  play(step, t, spb) {
    const bar = Math.floor(step / 16) % 8, s = step % 16;
    const prog = [[48, [60, 64, 67, 71]], [43, [59, 62, 67, 71]], [45, [60, 64, 69, 72]], [41, [60, 65, 69, 72]]];
    const [root, chord] = prog[bar % 4];
    const swing = s % 2 ? spb * 0.12 : 0; t += swing;
    // drums
    if (s % 4 === 0) this.kick(t);
    if (s === 10 && bar % 2 === 1) this.kick(t);
    if (s === 4 || s === 12) { this.noiseHit(t, 'bandpass', 1900, 0.5, 0.16); this.noiseHit(t + 0.012, 'bandpass', 1400, 0.3, 0.12); }
    this.noiseHit(t, 'highpass', 8000, s % 4 === 2 ? 0.22 : 0.09, s % 4 === 2 ? 0.12 : 0.035);
    if (bar === 7 && s >= 12) this.noiseHit(t, 'bandpass', 1200 + s * 120, 0.35, 0.08);
    // bass (octave-jumping funk)
    const bp = { 0: 0, 3: 12, 6: 0, 7: 12, 10: 0, 11: 7, 13: 12, 14: 10 };
    if (bp[s] !== undefined) this.tone(t, root + bp[s] - 12, spb * 1.6, 'sawtooth', 0.32, 420);
    // offbeat chord stabs
    if (s === 2 || s === 6 || s === 10 || s === 14) for (const n of chord) this.tone(t, n, spb * 1.2, 'square', 0.045, 1800, this.master, (Math.random() - 0.5) * 12);
    // hook: sunny lead from bar 2 on, with echo
    const hook = [[0, 72], [3, 74], [6, 76], [8, 79], [10, 76], [12, 74], [14, 72]];
    const hook2 = [[0, 71], [3, 72], [6, 74], [8, 71], [11, 67], [14, 69]];
    if (bar >= 2) { const h = (bar % 2 ? hook2 : hook).find(([st]) => st === s); if (h) { const n = h[1] + (bar >= 6 ? 12 : 0) - (bar % 4 === 2 ? 0 : 0); this.tone(t, n, spb * 2.2, 'triangle', 0.16, 3200, this.delay); this.tone(t, n, spb * 2.2, 'square', 0.05, 2600); } }
    // sparkly arpeggio in bars 4-7
    if (bar >= 4 && s % 2 === 0) this.tone(t, chord[(s / 2) % 4] + 12, spb * 0.9, 'square', 0.03, 4200, this.delay);
  }
}
