// Kaasdows Mediaspeler: the PC's music player. Five original tracks, all generated live in WebAudio (no files, nothing
// sampled or copied): glassy early-2000s desktop ambience, chill downtempo and a bit of bubbly future-pop. A visualiser
// draws rising aqua bubbles or glossy bars from an AnalyserNode. The music keeps playing while you use other programs;
// a note in the taskbar tray shows what is on and opens the player again. It stops when you log off.
//
// deps: { $, duck(k) (the street song, 0..1), refresh() }

const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
// chord helpers (midi)
const maj7 = (r) => [r, r + 4, r + 7, r + 11], min7 = (r) => [r, r + 3, r + 7, r + 10], add9 = (r) => [r, r + 4, r + 7, r + 14], sus2 = (r) => [r, r + 2, r + 7, r + 12], min9 = (r) => [r, r + 3, r + 7, r + 10, r + 14];

// each track: bpm, swing, bars of [bass, chord], and which instruments play (see play())
export const TRACKS = [
  { id: 'polder', name: 'Polderochtend', by: 'Kaasland Geluidsstudio', bpm: 82, swing: 0.06, mood: 'Aqua morning, bells over a wide pad',
    bars: [[41, maj7(65)], [43, [67, 71, 74, 78]], [40, min7(64)], [45, min7(69)]], // Fmaj7  G(#11)  Em7  Am7 (F Lydian)
    inst: { pad: 1, bells: 1, kick: 0.6, shaker: 1, sub: 1, lead: 'polder' } },
  { id: 'gracht', name: 'Glazen Gracht', by: 'Kaasland Geluidsstudio', bpm: 94, swing: 0.14, mood: 'Downtempo along the canal, marimba and soft claps',
    bars: [[38, add9(62)], [35, min9(59)], [43, maj7(67)], [45, sus2(69)]], // Dadd9  Bm9  Gmaj7  Asus2
    inst: { pad: 0.7, marimba: 1, kick: 1, clap: 1, shaker: 0.6, sub: 1, lead: 'gracht' } },
  { id: 'molen', name: 'Molenwiek', by: 'Kaasland Geluidsstudio', bpm: 116, swing: 0, mood: 'Bubbly future-pop, the windmill at full tilt',
    bars: [[36, [60, 64, 67, 72]], [45, [60, 64, 69, 72]], [41, [60, 65, 69, 72]], [43, [62, 67, 71, 74]]], // C  Am  F  G
    inst: { pad: 0.5, stabs: 1, kick: 1, clap: 1, hats: 1, sub: 1, bubbles: 1, bassline: 1, lead: 'molen' } },
  { id: 'stroop', name: 'Stroopwafel Sky', by: 'Kaasland Geluidsstudio', bpm: 104, swing: 0.1, mood: 'Sunny, a little funky, warm as a fresh stroopwafel',
    bars: [[40, min7(64)], [45, [64, 67, 69, 72]], [38, add9(62)], [43, [62, 67, 71, 74]]], // Em7  A7sus  Dadd9  G
    inst: { pad: 0.6, marimba: 0.6, kick: 1, clap: 1, hats: 0.7, sub: 1, bassline: 1, bells: 0.5, lead: 'stroop' } },
  { id: 'nacht', name: 'Kaasbel Nachtrust', by: 'Kaasland Geluidsstudio', bpm: 64, swing: 0, mood: 'Ambient. Wind over the polder, a far-off bell',
    bars: [[39, maj7(63)], [44, [63, 68, 72, 75]], [36, min7(60)], [41, sus2(65)]], // Ebmaj7  Ab  Cm7  Fsus2
    inst: { pad: 1.3, wind: 1, farbell: 1, sub: 0.6 } },
];
// melodies: per bar, [16th step, midi, length in 16ths]
const LEADS = {
  polder: [[[0, 77, 6], [6, 76, 2], [8, 72, 8]], [[0, 74, 4], [4, 78, 4], [8, 79, 8]], [[0, 76, 6], [6, 74, 2], [8, 71, 8]], [[0, 72, 4], [4, 76, 4], [8, 74, 6], [14, 72, 2]]],
  gracht: [[[2, 78, 2], [4, 81, 4], [10, 78, 2], [12, 76, 4]], [[2, 74, 2], [4, 78, 6], [12, 74, 4]], [[2, 79, 2], [4, 78, 2], [6, 76, 2], [8, 74, 8]], [[0, 76, 4], [6, 81, 6], [12, 79, 4]]],
  molen: [[[0, 79, 2], [2, 79, 2], [4, 76, 2], [6, 79, 4], [10, 81, 2], [12, 79, 4]], [[0, 76, 2], [2, 76, 2], [4, 72, 2], [6, 76, 4], [10, 77, 2], [12, 76, 4]], [[0, 77, 2], [2, 77, 2], [4, 74, 2], [6, 77, 4], [10, 79, 2], [12, 81, 4]], [[0, 79, 4], [4, 83, 4], [8, 84, 8]]],
  stroop: [[[0, 79, 3], [3, 78, 1], [4, 76, 4], [10, 74, 2], [12, 76, 4]], [[0, 76, 2], [2, 79, 2], [4, 81, 6], [12, 79, 4]], [[0, 78, 3], [3, 76, 1], [4, 74, 4], [10, 73, 2], [12, 74, 4]], [[0, 71, 2], [2, 74, 2], [4, 79, 4], [8, 78, 4], [12, 74, 4]]],
};

export function createMedia(deps) {
  let A = null, out = null, bus = null, verb = null, dly = null, an = null, noise = null;
  let on = false, cur = 0, step = 0, next = 0, timer = 0, vol = 0.7, vis = 'bubbles', raf = 0, canvas = null, bubbles = [];
  function init() {
    if (A) return true;
    try { A = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return false; }
    out = A.createGain(); out.gain.value = 0;
    const comp = A.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    an = A.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = 0.8;
    bus = A.createGain(); bus.connect(comp); comp.connect(out); out.connect(an); an.connect(A.destination);
    const len = Math.floor(A.sampleRate * 3), ir = A.createBuffer(2, len, A.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    verb = A.createConvolver(); verb.buffer = ir; const vg = A.createGain(); vg.gain.value = 0.4; verb.connect(vg); vg.connect(comp);
    dly = A.createDelay(1.5); const fb = A.createGain(); fb.gain.value = 0.35; const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000; dly.connect(lp); lp.connect(fb); fb.connect(dly); lp.connect(verb); lp.connect(bus);
    const nl = A.sampleRate * 2; noise = A.createBuffer(1, nl, A.sampleRate); const nd = noise.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
    return true;
  }
  // ---- instruments
  function env(g, t, a, peak, dec) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + dec); }
  function tone(type, f, t, dur, peak, { a = 0.005, cut = 0, q = 0.8, wet = 0.3, echo = 0, det = 0, glide = 0 } = {}) {
    const o = A.createOscillator(), g = A.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (glide) o.frequency.exponentialRampToValueAtTime(f * glide, t + Math.min(dur, 0.2)); o.detune.value = det;
    let n = o; if (cut) { const fl = A.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; fl.Q.value = q; o.connect(fl); n = fl; }
    env(g, t, a, peak, dur); n.connect(g); g.connect(bus);
    if (wet) { const w = A.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); }
    if (echo) { const e = A.createGain(); e.gain.value = echo; g.connect(e); e.connect(dly); }
    o.start(t); o.stop(t + a + dur + 0.05);
  }
  function hit(t, type, f, peak, dec, q = 1, wet = 0.1) { const s = A.createBufferSource(), fl = A.createBiquadFilter(), g = A.createGain(); s.buffer = noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; env(g, t, 0.001, peak, dec); s.connect(fl); fl.connect(g); g.connect(bus); if (wet) { const w = A.createGain(); w.gain.value = wet; g.connect(w); w.connect(verb); } s.start(t, Math.random()); s.stop(t + dec + 0.05); }
  function pad(t, notes, dur, peak, cut = 1600) {
    const g = A.createGain(), lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(cut * 0.5, t); lp.frequency.linearRampToValueAtTime(cut, t + dur * 0.5); lp.frequency.linearRampToValueAtTime(cut * 0.6, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + dur * 0.3); g.gain.setValueAtTime(peak, t + dur * 0.75); g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.4);
    lp.connect(g); g.connect(bus); const w = A.createGain(); w.gain.value = 0.7; g.connect(w); w.connect(verb);
    for (const n of notes) for (const [type, det] of [['sawtooth', -8], ['sawtooth', 8], ['triangle', 0]]) { const o = A.createOscillator(); o.type = type; o.frequency.value = hz(n); o.detune.value = det; o.connect(lp); o.start(t); o.stop(t + dur + 0.5); }
  }
  const bell = (t, m, peak = 0.06, dur = 1.4) => { tone('sine', hz(m), t, dur, peak, { a: 0.003, echo: 0.4, wet: 0.5 }); tone('sine', hz(m) * 2.76, t, dur * 0.35, peak * 0.3, { a: 0.002, wet: 0.5 }); tone('sine', hz(m) * 5.4, t, dur * 0.12, peak * 0.15, { a: 0.001 }); };
  const marimba = (t, m, peak = 0.12) => { tone('sine', hz(m), t, 0.35, peak, { a: 0.002, wet: 0.25 }); tone('sine', hz(m) * 4, t, 0.06, peak * 0.4, { a: 0.001 }); };
  const kick = (t, k = 1) => tone('sine', 140, t, 0.3, 0.8 * k, { a: 0.002, glide: 0.33, wet: 0 });
  // ---- the sequencer
  function schedule() {
    const T = TRACKS[cur];
    while (next < A.currentTime + 0.15) { const spb = 60 / T.bpm / 4; play(T, step, next + (step % 2 ? spb * T.swing : 0), spb); next += spb; step = (step + 1) % 128; }
  }
  function play(T, st, t, spb) {
    const I = T.inst, bar = Math.floor(st / 16) % 4, s = st % 16, sect = Math.floor(st / 64); // two 4-bar sections: the second one adds more
    const [root, ch] = T.bars[bar];
    if (I.pad && s === 0) pad(t, ch.map((n) => n - 12), spb * 16, 0.028 * I.pad, T.id === 'nacht' ? 900 : 1700);
    if (I.sub && (s === 0 || (s === 8 && T.bpm > 70) || (s === 10 && I.bassline))) tone('sine', hz(root), t, spb * (I.bassline ? 1.5 : 7), 0.3 * I.sub, { a: 0.01, wet: 0 });
    if (I.bassline && [3, 6, 11, 14].includes(s)) tone('sawtooth', hz(root + (s === 6 ? 12 : s === 14 ? 7 : 0)), t, spb * 1.2, 0.12, { a: 0.004, cut: 520, q: 5, wet: 0 });
    if (I.kick && (s === 0 || s === 8 || (T.bpm > 100 && (s === 4 || s === 12)))) kick(t, I.kick);
    if (I.clap && (s === 4 || s === 12)) { hit(t, 'bandpass', 1500, 0.32, 0.12, 1.2, 0.35); hit(t + 0.011, 'bandpass', 1100, 0.2, 0.1, 1.2); }
    if (I.shaker && s % 2 === 0) hit(t, 'highpass', 7000, (s % 4 === 2 ? 0.1 : 0.05) * I.shaker, 0.05, 1, 0);
    if (I.hats && s % 4 === 2) hit(t, 'highpass', 9000, 0.14 * I.hats, 0.06, 1, 0);
    if (I.bells && s % 4 === 0 && (sect || bar % 2)) bell(t, ch[(s / 4 + bar) % ch.length] + 24, 0.045 * I.bells);
    if (I.marimba && s % 2 === 0 && s !== 8) marimba(t, ch[[0, 2, 1, 3, 2, 1, 3, 2][s / 2] % ch.length] + 12, 0.1 * I.marimba);
    if (I.stabs && (s === 2 || s === 7 || s === 10)) for (const n of ch) tone('sawtooth', hz(n), t, spb * 1.3, 0.035, { a: 0.003, cut: 2600, det: (Math.random() - 0.5) * 16, wet: 0.3 });
    if (I.bubbles && s % 2 === 1 && Math.random() < 0.5) tone('sine', hz(ch[Math.floor(Math.random() * ch.length)] + 24), t, 0.12, 0.05, { a: 0.003, glide: 1.6, echo: 0.5, wet: 0.4 });
    if (I.wind && s === 0 && bar % 2 === 0) { const sd = A.createBufferSource(), f = A.createBiquadFilter(), g = A.createGain(), d = spb * 32; sd.buffer = noise; sd.loop = true; f.type = 'bandpass'; f.Q.value = 3; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(900, t + d * 0.5); f.frequency.linearRampToValueAtTime(350, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06, t + d * 0.4); g.gain.linearRampToValueAtTime(0.0001, t + d); sd.connect(f); f.connect(g); g.connect(bus); sd.start(t); sd.stop(t + d + 0.1); }
    if (I.farbell && s === 8 && bar % 2 === 1) bell(t, ch[2] + 24, 0.05, 3);
    const L = I.lead && LEADS[I.lead]; if (L && (sect === 1 || T.id === 'molen' || T.id === 'stroop' || bar >= 2)) { const n = L[bar].find(([x]) => x === s); if (n) { const type = T.id === 'molen' ? 'square' : T.id === 'stroop' ? 'triangle' : 'sine'; tone(type, hz(n[1]), t, spb * n[2] * 0.9, type === 'square' ? 0.045 : 0.08, { a: 0.012, cut: type === 'square' ? 3200 : 0, echo: 0.45, wet: 0.35 }); if (type === 'sine') tone('sine', hz(n[1] + 12), t, spb * n[2] * 0.5, 0.015, { a: 0.01, wet: 0.5 }); } }
    if (s === 0 && bar === 0 && sect === 0 && st === 0) bubbles.push(...Array.from({ length: 6 }, () => newBubble(true)));
  }
  // ---- transport
  function play_() {
    if (!init()) return; if (A.state === 'suspended') A.resume();
    if (on) return; on = true; step = 0; next = A.currentTime + 0.1;
    out.gain.cancelScheduledValues(A.currentTime); out.gain.setTargetAtTime(vol * 0.55, A.currentTime, 0.3);
    timer = setInterval(schedule, 25); deps.duck(0); tray(); draw();
  }
  function pause() { if (!on) return; on = false; clearInterval(timer); if (A) out.gain.setTargetAtTime(0, A.currentTime, 0.15); deps.duck(1); tray(); }
  function stop() { pause(); step = 0; }
  function go(i) { pause(); cur = (i + TRACKS.length) % TRACKS.length; step = 0; setTimeout(() => { play_(); refreshUi(); }, 180); refreshUi(); } // picking a track plays it
  function setVol(v) { vol = v; if (A && on) out.gain.setTargetAtTime(vol * 0.55, A.currentTime, 0.05); }
  // ---- the tray note
  function tray() {
    const b = deps.$('pcmedia'); if (!b) return;
    b.style.display = on ? 'inline-flex' : 'none'; b.title = on ? `Now playing: ${TRACKS[cur].name}` : '';
  }
  // ---- the window
  const ICON_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5 L19 12 L8 19 Z" fill="currentColor"/></svg>', ICON_PAUSE = '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor"/></svg>';
  const ICON_STOP = '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>', ICON_PREV = '<svg viewBox="0 0 24 24"><path d="M18 6 L10 12 L18 18 Z M6 6 h2.5 v12 H6 Z" fill="currentColor"/></svg>', ICON_NEXT = '<svg viewBox="0 0 24 24"><path d="M6 6 L14 12 L6 18 Z M15.5 6 H18 v12 h-2.5 Z" fill="currentColor"/></svg>';
  function html() {
    const T = TRACKS[cur];
    return `<div class="kmp">
      <div class="kmp-screen"><canvas id="kmpvis" width="560" height="200"></canvas>
        <div class="kmp-now"><b>${T.name}</b><span>${T.by} · ${T.bpm} bpm</span><small>${T.mood}</small></div>
        <div class="kmp-vis"><button data-vis="bubbles" class="${vis === 'bubbles' ? 'on' : ''}">Bubbels</button><button data-vis="bars" class="${vis === 'bars' ? 'on' : ''}">Staven</button></div></div>
      <div class="kmp-ctl"><button class="kmp-b" data-a="prev" title="Previous">${ICON_PREV}</button><button class="kmp-b kmp-big" data-a="play" title="${on ? 'Pause' : 'Play'}">${on ? ICON_PAUSE : ICON_PLAY}</button><button class="kmp-b" data-a="stop" title="Stop">${ICON_STOP}</button><button class="kmp-b" data-a="next" title="Next">${ICON_NEXT}</button>
        <label class="kmp-vol">Volume <input type="range" min="0" max="100" value="${Math.round(vol * 100)}" data-a="vol"></label></div>
      <ol class="kmp-list">${TRACKS.map((t, i) => `<li class="${i === cur ? 'on' : ''}" data-i="${i}"><span>${i + 1}. ${t.name}</span><em>${t.bpm} bpm</em></li>`).join('')}</ol>
      <div class="kmp-foot">All music made live by Kaasdows, nothing recorded. Keeps playing while you use other programs.</div></div>`;
  }
  let body = null;
  function bind(el) {
    body = el;
    el.querySelectorAll('[data-a]').forEach((b) => {
      const a = b.dataset.a;
      if (a === 'vol') { b.oninput = () => setVol(b.value / 100); return; }
      b.onclick = () => { if (a === 'play') (on ? pause() : play_()); else if (a === 'stop') stop(); else if (a === 'prev') go(cur - 1); else if (a === 'next') go(cur + 1); refreshUi(); };
    });
    el.querySelectorAll('[data-i]').forEach((li) => li.ondblclick = li.onclick = () => go(+li.dataset.i));
    el.querySelectorAll('[data-vis]').forEach((b) => b.onclick = () => { vis = b.dataset.vis; refreshUi(); });
    canvas = el.querySelector('#kmpvis'); draw();
  }
  function refreshUi() { if (body && body.isConnected && body.querySelector('.kmp')) { body.innerHTML = html(); bind(body); } }
  // ---- visualiser: aqua bubbles that rise faster with the music, or glossy bars
  function newBubble(fresh) { return { x: Math.random(), y: fresh ? 0.3 + Math.random() * 0.7 : 1.1, r: 4 + Math.random() * 14, v: 0.02 + Math.random() * 0.05, w: Math.random() * 6 }; }
  const fbuf = new Uint8Array(128);
  function draw() {
    cancelAnimationFrame(raf);
    if (!canvas || !canvas.isConnected) return;
    const g = canvas.getContext('2d'), W = canvas.width, H = canvas.height;
    let lvl = 0; if (an) { an.getByteFrequencyData(fbuf); for (let i = 0; i < 48; i++) lvl += fbuf[i]; lvl /= 48 * 255; }
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#04315c'); sky.addColorStop(0.6, '#0a6fae'); sky.addColorStop(1, '#3fc0ee');
    g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,.07)'; g.beginPath(); g.moveTo(W * 0.1, 0); g.lineTo(W * 0.45, H); g.lineTo(W * 0.62, H); g.closePath(); g.fill();
    if (vis === 'bars') {
      const n = 32, bw = W / n;
      for (let i = 0; i < n; i++) { const v = an ? fbuf[Math.floor(Math.pow(i / n, 1.7) * 110)] / 255 : 0, h = Math.max(3, v * H * 0.9);
        const gr = g.createLinearGradient(0, H - h, 0, H); gr.addColorStop(0, '#d8fbff'); gr.addColorStop(0.5, '#4fd2ff'); gr.addColorStop(1, '#0a7ac0');
        g.fillStyle = gr; g.fillRect(i * bw + 2, H - h, bw - 4, h); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(i * bw + 3, H - h, (bw - 6) / 2, Math.min(h, 6)); }
    } else {
      if (bubbles.length < 40 && Math.random() < 0.08 + lvl * 0.5) bubbles.push(newBubble(false));
      for (let i = bubbles.length - 1; i >= 0; i--) { const b = bubbles[i]; b.y -= (b.v + lvl * 0.12) / 6; b.w += 0.04;
        const x = b.x * W + Math.sin(b.w) * 8, y = b.y * H, r = b.r * (1 + lvl * 0.6);
        if (y < -r) { bubbles.splice(i, 1); continue; }
        const bg = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); bg.addColorStop(0, 'rgba(255,255,255,.9)'); bg.addColorStop(0.3, 'rgba(200,245,255,.25)'); bg.addColorStop(0.85, 'rgba(120,220,255,.12)'); bg.addColorStop(1, 'rgba(255,255,255,.6)');
        g.fillStyle = bg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
      // a polder horizon that bounces with the bass
      g.fillStyle = '#5cc932'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 20) g.lineTo(x, H - 26 - Math.sin(x * 0.012) * 8 - lvl * 22); g.lineTo(W, H); g.fill();
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, H - 4, W, 4);
    }
    raf = requestAnimationFrame(draw);
  }
  return { html, bind, play: play_, pause, stop, go, get playing() { return on; }, get track() { return TRACKS[cur]; }, tray, _tap: () => ({ ctx: A, out }) };
}
