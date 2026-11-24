// Upbeat procedural synth-pop loop (WebAudio), in the spirit of Neon Vice's soundtrack. No audio files needed.
export class Music {
  constructor() { this.ctx = null; this.on = false; this.step = 0; this.bpm = 116; this.key = 0; this.style = null; }
  // inside some buildings the same song is restyled (main.js picks it by where Eddy stands): 'disco' (Club Monique), 'arabic'
  // (Shoarma Schmatzel), 'bollywood' (Tryshtahn Auto), 'russian' (The Russian's pawnshop); null is the street version.
  // The step clock keeps running, so it changes on the beat; a short dip in the volume covers the switch.
  setStyle(st) {
    st = st || null; if (st === this.style) return; this.style = st;
    if (this.master && this.on) { const t = this.ctx.currentTime, g = this.master.gain, v = 0.22 * (this.duckK ?? 1); g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(v * 0.25, t + 0.15); g.linearRampToValueAtTime(v, t + 0.7); }
  }
  // radio stations (the radio in Eddy's woning, js/woning.js): same song, another tempo and key
  setStation(st) { this.bpm = st.bpm; this.key = st.key; if (this.delay) this.delay.delayTime.value = 60 / this.bpm * 0.75; }
  init() {
    if (this.ctx) return;
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain(); this.master.gain.value = 0.22 * (this.duckK ?? 1);
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
  // fade the street song under another score (combatmusic.js in a fight, the Kaasdows media player): k 0..1
  duck(k) { this.duckK = k; if (this.master) this.master.gain.setTargetAtTime(0.22 * k, this.ctx.currentTime, k < 1 ? 0.4 : 1.2); }
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
    const spb = 60 / (STYLE_BPM[this.style] || this.bpm) / 4; // seconds per 16th
    while (this.next < this.ctx.currentTime + 0.12) { this.play(this.step, this.next, spb); this.next += spb; this.step = (this.step + 1) % 128; }
  }
  play(step, t, spb) {
    if (this.style && STYLES[this.style]) { STYLES[this.style].call(this, step, t, spb); return; }
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

// ---- the restyled versions of the same song (same chords, same hook, other instruments and grooves)
const STYLE_BPM = { disco: 122, arabic: 108, bollywood: 112, russian: 100 };
const PROG = [[48, [60, 64, 67, 71]], [43, [59, 62, 67, 71]], [45, [60, 64, 69, 72]], [41, [60, 65, 69, 72]]];
const HOOK = [[0, 72], [3, 74], [6, 76], [8, 79], [10, 76], [12, 74], [14, 72]], HOOK2 = [[0, 71], [3, 72], [6, 74], [8, 71], [11, 67], [14, 69]];
const hookAt = (bar, s) => { const h = (bar % 2 ? HOOK2 : HOOK).find(([st]) => st === s); return h ? h[1] : null; };
const snapTo = (n, pcs) => { for (let d = 0; d < 6; d++) { if (pcs.includes(((n - d) % 12 + 12) % 12)) return n - d; if (pcs.includes(((n + d) % 12 + 12) % 12)) return n + d; } return n; };
const HIJAZ = [0, 1, 4, 5, 7, 8, 10], KAFI = [0, 2, 3, 5, 7, 9, 10], HMIN = [9, 11, 0, 2, 4, 5, 8]; // C hijaz, C kafi, A harmonic minor
// a pitched drum: a sine that drops in pitch (doum, dholak, timpani), a short bright one (tek, tabla na)
function drum(m, t, f0, f1, dec, peak) { const c = m.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dec * 0.8); m.env(g, t, 0.002, peak, dec); o.connect(g).connect(m.master); o.start(t); o.stop(t + dec + 0.05); }
// a slide into the note (sitar, shehnai, ney)
function slide(m, t, midi, dur, type, peak, cutoff, from = -1, dest) { const c = m.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(), hz = (n) => 440 * Math.pow(2, (n + m.key - 69) / 12);
  o.type = type; o.frequency.setValueAtTime(hz(midi + from), t); o.frequency.exponentialRampToValueAtTime(hz(midi), t + Math.min(0.08, dur * 0.3));
  const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.5; lg.gain.value = 6; lfo.connect(lg).connect(o.detune); lfo.start(t); lfo.stop(t + dur + 0.05);
  f.type = 'bandpass'; f.frequency.value = cutoff; f.Q.value = 1.4; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(dest || m.master); o.start(t); o.stop(t + dur + 0.05); }
// a bowed or blown pad: slow attack, slow release
function pad(m, t, midi, dur, type, peak, cutoff) { const c = m.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = type; o.frequency.value = 440 * Math.pow(2, (midi + m.key - 69) / 12); o.detune.value = (Math.random() - 0.5) * 14;
  f.type = 'lowpass'; f.frequency.value = cutoff; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + dur * 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(f).connect(g).connect(m.master); o.start(t); o.stop(t + dur + 0.05); }
const STYLES = {
  // Club Monique: 80s dance. Four on the floor, open hats on the offbeat, claps, an octave bass, big synth-brass stabs, the hook on a bright square with echo
  disco(step, t, spb) {
    const bar = Math.floor(step / 16) % 8, s = step % 16, [root, chord] = PROG[bar % 4];
    if (s % 4 === 0) this.kick(t);
    if (s % 4 === 2) this.noiseHit(t, 'highpass', 7000, 0.3, 0.14); else this.noiseHit(t, 'highpass', 9000, 0.07, 0.03);
    if (s === 4 || s === 12) { this.noiseHit(t, 'bandpass', 1500, 0.55, 0.12); this.noiseHit(t + 0.01, 'bandpass', 1100, 0.4, 0.1); this.noiseHit(t + 0.02, 'bandpass', 1300, 0.3, 0.1); }
    if (s % 2 === 0) this.tone(t, root - 12 + (s % 4 === 2 ? 12 : 0), spb * 1.3, 'sawtooth', 0.3, 520);
    if (s === 0 || s === 7 || s === 10) for (const n of chord) this.tone(t, n, spb * 2.5, 'sawtooth', 0.04, 2400, this.master, (Math.random() - 0.5) * 18);
    const h = bar >= 2 ? hookAt(bar, s) : null; if (h) { this.tone(t, h, spb * 2.4, 'square', 0.1, 3600, this.delay); this.tone(t, h + 12, spb * 1.4, 'square', 0.04, 5000, this.delay); }
    if (bar >= 4 && s % 2 === 1) this.tone(t, chord[(s >> 1) % 4] + 12, spb * 0.7, 'square', 0.025, 5200, this.delay);
  },
  // Shoarma Schmatzel: Middle Eastern. A maqsum on the darbuka (doum / tek), a low drone, oud plucks on the chord, the hook bent into hijaz on a ney-ish lead
  arabic(step, t, spb) {
    const bar = Math.floor(step / 16) % 8, s = step % 16, [root, chord] = PROG[bar % 4];
    const doum = { 0: 1, 6: 1, 8: 1 }, tek = { 3: 1, 4: 1, 10: 1, 12: 1, 14: 1, 15: 0.5 };
    if (doum[s]) drum(this, t, 140, 70, 0.32, 0.8);
    if (tek[s]) { this.noiseHit(t, 'bandpass', 3200, 0.38 * tek[s], 0.06); drum(this, t, 620, 480, 0.05, 0.2 * tek[s]); }
    if (s === 0 && bar % 2 === 0) pad(this, t, 36, spb * 32, 'sawtooth', 0.05, 380); // the drone
    if (s % 4 === 0 || s === 6 || s === 14) this.tone(t, snapTo(chord[(s >> 2) % 4], HIJAZ) - 12, spb * 2.2, 'triangle', 0.1, 1600); // oud
    const h = bar >= 2 ? hookAt(bar, s) : null; if (h) slide(this, t, snapTo(h, HIJAZ), spb * 3.2, 'sawtooth', 0.09, 1400, -2, this.delay);
    if (bar >= 4 && s % 2 === 0) this.tone(t, snapTo(chord[(s >> 1) % 4] + 12, HIJAZ), spb * 0.6, 'triangle', 0.04, 4200); // qanun runs
  },
  // Tryshtahn Auto: Bollywood. Tabla (dha, na, ge), a dholak bounce, a tanpura drone, string stabs, the hook on a sliding sitar-ish lead
  bollywood(step, t, spb) {
    const bar = Math.floor(step / 16) % 8, s = step % 16, [root, chord] = PROG[bar % 4];
    if (s === 0 || s === 6 || s === 10) drum(this, t, 110, 62, 0.28, 0.75); // ge
    if (s % 2 === 1 || s === 4 || s === 12) drum(this, t, 520 + (s % 3) * 40, 380, 0.07, 0.24); // na
    if (s === 4 || s === 12) this.noiseHit(t, 'bandpass', 2600, 0.3, 0.08);
    if (s % 4 === 2) drum(this, t, 200, 150, 0.12, 0.35); // dholak
    if (s === 0 && bar % 2 === 0) { pad(this, t, root - 12, spb * 32, 'sawtooth', 0.04, 600); pad(this, t, root - 5, spb * 32, 'sawtooth', 0.03, 600); } // tanpura: root and fifth
    if (s === 2 || s === 3 || s === 10 || s === 11) for (const n of chord) this.tone(t, n + 12, spb * 0.8, 'sawtooth', 0.03, 3000, this.master, (Math.random() - 0.5) * 10);
    const h = bar >= 2 ? hookAt(bar, s) : null; if (h) slide(this, t, snapTo(h, KAFI), spb * 2.6, 'sawtooth', 0.11, 2200, -3, this.delay);
    if (bar >= 4 && s % 2 === 0) slide(this, t, snapTo(chord[(s >> 1) % 4] + 12, KAFI), spb * 0.9, 'square', 0.035, 3200, -1);
  },
  // The Russian: an orchestra. Balalaika tremolo on the chord, string pads, timpani on the one, low brass on the bass, the hook on horns in harmonic minor
  russian(step, t, spb) {
    const bar = Math.floor(step / 16) % 8, s = step % 16, [root, chord] = PROG[bar % 4];
    if (s === 0) { drum(this, t, 95, 70, 0.6, 0.85); if (bar % 4 === 3) drum(this, t + spb * 8, 95, 70, 0.5, 0.6); }
    if (s === 12 && bar % 2 === 1) this.noiseHit(t, 'bandpass', 900, 0.45, 0.35); // a cymbal swell
    this.tone(t, snapTo(chord[(step >> 1) % 3], HMIN) + 12, spb * 0.55, 'triangle', 0.05, 3000); // balalaika tremolo
    if (s === 0) for (const n of chord.slice(0, 3)) pad(this, t, snapTo(n, HMIN), spb * 16, 'sawtooth', 0.035, 1400); // strings
    if (s === 0 || s === 8) pad(this, t, root - 12, spb * 7, 'sawtooth', 0.09, 500); // low brass
    const h = bar >= 2 ? hookAt(bar, s) : null; if (h) { pad(this, t, snapTo(h, HMIN), spb * 3, 'sawtooth', 0.12, 1800); pad(this, t, snapTo(h, HMIN) - 12, spb * 3, 'square', 0.05, 900); }
  },
};
