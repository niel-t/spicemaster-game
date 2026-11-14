// Real gun recordings, the way Neon Vice plays them (weapons.js GUNCLIP / GUNSND, index.html gclip / rlStep / rlFinish / gunDry).
// assets/audio/guns.mp3 is one CC0 sprite from the Free Firearm Sound Library (Still North Media, credits in assets/audio/CREDITS.md).
// Until it has loaded, or where it can't (file://, no fetch, decode failure), every call returns false and mission.js keeps its
// synth sounds. Recordings go through their own compressor so a room full of shots doesn't clip.
const GUNCLIP = { pistol1: [0.12, 0.55], pistol2: [0.79, 0.55], pistol3: [1.46, 0.55], silenced1: [2.13, 0.35], silenced2: [2.6, 0.35], revolver1: [3.07, 0.6], revolver2: [3.79, 0.6], shotgun1: [4.51, 0.7], shotgun2: [5.3299, 0.7], double1: [6.1499, 0.7], double2: [6.9699, 0.7], smg1: [7.7899, 0.4], smg2: [8.3099, 0.4], smg3: [8.8299, 0.4], rifle1: [9.3499, 0.55], rifle2: [10.0199, 0.55], ak1: [10.6899, 0.55], ak2: [11.3599, 0.55], ak3: [12.0299, 0.55], deagle1: [12.6999, 0.6], deagle2: [13.4199, 0.6], gl1: [14.1399, 0.6], gl2: [14.8599, 0.6], ppq_out: [15.5799, 0.4], ppq_in: [16.0999, 0.35], ppq_slide: [16.5698, 0.3], ppq_dry: [16.9898, 0.15], sw_open: [17.2598, 0.5], sw_eject: [17.8798, 0.85], sw_load: [18.8498, 0.8], sw_close: [19.7698, 0.4], sw_dry: [20.2898, 0.2], pump_shell: [20.6098, 0.65], pump_cycle: [21.3798, 0.6], pump_dry: [22.0998, 0.15], brk_open: [22.3698, 0.35], brk_shell: [22.8398, 0.4], brk_close: [23.3598, 0.45], smg_out: [23.9298, 0.3], smg_in: [24.3498, 0.4], smg_bolt: [24.8698, 0.4], ar_out: [25.3898, 0.35], ar_in: [25.8598, 0.5], ar_bolt: [26.4798, 0.5], ar_dry: [27.0998, 0.15], ak_out: [27.3698, 0.3], ak_in: [27.7898, 0.3], ak_back: [28.2098, 0.4], ak_fwd: [28.7298, 0.35], m1911_out: [29.1998, 0.35], m1911_in: [29.6698, 0.35], m1911_slide: [30.1397, 0.4] };
const RL_PPQ = [[0.06, 'ppq_out'], [0.55, 'ppq_in'], [1, 'ppq_slide']], RL_BRK = [[0.04, 'brk_open'], [0.38, 'brk_shell'], [0.6, 'brk_shell'], [1, 'brk_close']];
// per sound key (WD[id].snd): fire clips, rack after the shot, reload steps [fraction of the reload, clip], dry click, volume, pitch
const GUNSND = {
  pistol: { fire: ['pistol1', 'pistol2', 'pistol3'], rl: RL_PPQ, dry: 'ppq_dry', v: 0.9 },
  silenced: { fire: ['silenced1', 'silenced2'], rl: RL_PPQ, dry: 'ppq_dry', v: 0.8 },
  dual: { fire: ['pistol1', 'pistol2', 'pistol3'], rl: [[0.04, 'ppq_out'], [0.3, 'ppq_in'], [0.48, 'ppq_out'], [0.74, 'ppq_in'], [1, 'ppq_slide']], dry: 'ppq_dry', v: 0.9 },
  revolver: { fire: ['revolver1', 'revolver2'], rl: [[0.03, 'sw_open'], [0.16, 'sw_eject'], [0.52, 'sw_load'], [1, 'sw_close']], dry: 'sw_dry', v: 1 },
  pump: { fire: ['shotgun1', 'shotgun2'], rack: 'pump_cycle', rl: [[0.1, 'pump_shell'], [0.3, 'pump_shell'], [0.5, 'pump_shell'], [0.7, 'pump_shell'], [1, 'pump_cycle']], dry: 'pump_dry', v: 1 },
  shotgun: { fire: ['double1', 'double2'], rl: RL_BRK, dry: 'pump_dry', v: 1 },
  smg: { fire: ['smg1', 'smg2', 'smg3'], rl: [[0.06, 'smg_out'], [0.55, 'smg_in'], [1, 'smg_bolt']], dry: 'ar_dry', v: 0.75 },
  rifle: { fire: ['rifle1', 'rifle2'], rl: [[0.06, 'ar_out'], [0.55, 'ar_in'], [1, 'ar_bolt']], dry: 'ar_dry', v: 0.9 },
  ak: { fire: ['ak1', 'ak2', 'ak3'], rl: [[0.06, 'ak_out'], [0.5, 'ak_in'], [0.82, 'ak_back'], [1, 'ak_fwd']], dry: 'ar_dry', v: 0.95 },
  deagle: { fire: ['deagle1', 'deagle2'], rl: [[0.04, 'm1911_out'], [0.3, 'm1911_in'], [0.48, 'm1911_out'], [0.74, 'm1911_in'], [1, 'm1911_slide']], dry: 'ppq_dry', v: 1, rate: 0.88 },
};
let AC = null, BUF = null, bus = null, tried = false, muted = false;
const CLIP = {};
const rr = (a, b) => a + Math.random() * (b - a);
function load() {
  if (tried || typeof fetch !== 'function' || location.protocol === 'file:') return; tried = true;
  try {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 6; comp.ratio.value = 4; comp.attack.value = 0.001; comp.release.value = 0.12;
    bus = AC.createGain(); bus.gain.value = 0.9; bus.connect(comp); comp.connect(AC.destination);
  } catch (e) { AC = null; return; }
  fetch('./assets/audio/guns.mp3').then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.arrayBuffer(); })
    .then((ab) => new Promise((ok, no) => { const p = AC.decodeAudioData(ab, ok, no); if (p && p.catch) p.catch(no); }))
    .then((buf) => {
      // each clip's real start (decoders pad MP3s differently): the first sample above 8% of the clip's peak, minus 4 ms
      const d = buf.getChannelData(0), sr = buf.sampleRate;
      for (const k in GUNCLIP) {
        const [o, l] = GUNCLIP[k], a = Math.max(0, Math.floor((o - 0.04) * sr)), b = Math.min(d.length, Math.floor((o + Math.min(l, 0.3)) * sr)); let pk = 0;
        for (let i = a; i < b; i++) { const v = Math.abs(d[i]); if (v > pk) pk = v; }
        let s = a; while (s < b && Math.abs(d[s]) < pk * 0.08) s++;
        CLIP[k] = [Math.max(Math.max(0, o - 0.04), Math.min(o + 0.04, s / sr - 0.004)), l];
      }
      BUF = buf;
    }).catch(() => { BUF = null; });
}
function clip(k, at, vol, rate) {
  const c = CLIP[k]; if (!c || !BUF || !AC || muted) return false;
  if (AC.state === 'suspended') AC.resume();
  const s = AC.createBufferSource(); s.buffer = BUF; s.playbackRate.value = rate || 1;
  const g = AC.createGain(); g.gain.value = vol; s.connect(g); g.connect(bus); s.start(AC.currentTime + (at || 0), c[0], c[1]); return true;
}
// vol: 1 = your own gun; Lampas shots pass ~0.5 (further away, same recordings)
export const gunAudio = {
  warm() { load(); if (AC && AC.state === 'suspended') AC.resume(); },
  ready: () => !!BUF,
  setMuted(m) { muted = !!m; },
  fire(snd, vol = 1) {
    load(); const S = GUNSND[snd]; if (!S) return false;
    if (!clip(S.fire[Math.floor(Math.random() * S.fire.length)], 0, S.v * vol, (S.rate || 1) * rr(0.96, 1.04))) return false;
    if (S.rack) clip(S.rack, 0.3, 0.55 * vol, rr(0.97, 1.03));
    return true;
  },
  // call every frame while reloading: plays each step as the bar passes it (r.t, r.dur; keeps its cursor in r.si)
  reloadStep(snd, r) { const S = GUNSND[snd]; if (!S || !BUF) return; r.si = r.si || 0; while (r.si < S.rl.length - 1 && r.t >= S.rl[r.si][0] * r.dur) { clip(S.rl[r.si][1], 0, 0.8, rr(0.97, 1.03)); r.si++; } },
  reloadDone(snd, r) {
    const S = GUNSND[snd]; if (!S || !BUF) return false; const n = S.rl.length;
    if ((r.si || 0) < n - 1 && n > 1) { clip(S.rl[n - 2][1], 0, 0.8, 1.05); return clip(S.rl[n - 1][1], 0.09, 0.85, 1.05); }
    return clip(S.rl[n - 1][1], 0, 0.85, rr(0.97, 1.03));
  },
  dry(snd) { const S = GUNSND[snd]; return !!(S && S.dry && clip(S.dry, 0, 0.7, rr(0.97, 1.03))); },
};
