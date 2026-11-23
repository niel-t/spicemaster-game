// Het Naknik Uitzendbureau as a selection screen (Tristan 2026-11-23): every market day a few Naknikim come to solliciteren.
// Each one is a person: a name, a face and build of his own, three stats and a quirk.
//   Mengen     (1-5)  fewer mixing mistakes, better errands
//   Tempo      (1-5)  how many kilos he mixes a market day (and how fast he walks around De Loods)
//   Werkethiek (1-5)  how slowly his mood drops: a low one naps on the paprika within the week
// The pool is seeded per market day and lives in state.sollis; a hired candidate becomes a state.crew entry (js/crew.js)
// and his `look` builds the figure in the warehouse (naknikLook) and the cartoon on his card (drawFace).
import { LOOKS, hex01 } from './characters.js';

const FIRST = ['Sjonnie', 'Appie', 'Rinus', 'Japie', 'Tinus', 'Nelis', 'Sjef', 'Barend', 'Koos', 'Gijs', 'Daan', 'Wim', 'Truus', 'Toos', 'Mientje', 'Sjaakie', 'Fliep', 'Henkie', 'Joep', 'Knakkie', 'Dikkie', 'Ome Cor', 'Lange Leo', 'Kleine Karel', 'Bolle Bert', 'Rooie Ronnie', 'Manke Nelis', 'Tante Sjaan', 'Opa Kokkie', 'Zwarte Riek'];
const LAST = ['Komijn', 'Paprika', 'Kaneel', 'Gember', 'Bieslook', 'Mosterd', 'van de Gracht', 'van de Pijp', 'uit de Jordaan', 'van het Plein', 'Kruidnagel', 'de Haring', 'Stroopwafel', 'van de Wallenkant', 'Bitterbal', 'van de Pont', ''];
const FROM = ['stood on the haringkar at the Kaasmarkt', 'punched tickets on a rondvaartboot', 'fixed bikes under the bridge (other people\'s)', 'flipped poffertjes on the kermis', 'sold tulips to tourists, twice the same bunch', 'rolled cheeses in a pakhuis on the gracht', 'baked stroopwafels until the fire', 'drove the pont across the IJ, mostly straight', 'swept the Albert Kaasmarkt after closing', 'carried pianos up Amsterdam staircases', 'fished fietsen out of the gracht for the gemeente', 'painted bollards. All of them.', 'rang the bell on tram 13', 'guarded a bruin café from the inside'];
const QUIRKS = [
  ['Praat tegen de paprika', 'Talks to the paprika. It listens.'], ['Fluit de hele dag', 'Whistles Jordaan songs all day. The same one.'], ['Vroege vogel', 'Is there before the shutter opens. Nobody knows how.'],
  ['Broodje-halfom-pauze', 'Takes a broodje halfom break every hour.'], ['Bang voor de heftruck', 'Afraid of the heftruck. Salutes it.'], ['Telt alles', 'Counts every scoop out loud. In guilders.'],
  ['Niest van komijn', 'Sneezes from komijn. Works here anyway.'], ['Stiekeme proever', 'Tastes "to check". Often.'], ['Altijd te laat', 'Always late, except for lunch.'],
  ['Sterk als een bakfiets', 'Strong as a loaded bakfiets.'], ['Zingt smartlappen', 'Sings smartlappen into the mixer for the echo.'], ['Ruikt regen', 'Smells rain an hour ahead. In Amsterdam: always right.'],
];
const SAY = ['"I mix! I mix very good! Ask my moeder."', '"I can carry two vaten. One at a time."', '"I never sleep at work. I rest my eyes."', '"Boss, I bring my own spoon."', '"I worked hard once. I can do it again."', '"Is there soup? Then I am loyal."', '"Paprika is the red one. I know my stuff."', '"I am small but I am also slow. No wait."', '"My last boss cried when I left. From joy, he said."'];
const SKIN = [0xe8b890, 0xd8a07a, 0xf0c8a8, 0xc48a62, 0xa8744e, 0xf4d2b8, 0x8a5a3a];
const HAIR = [0xe8792a, 0xe8792a, 0x1d1510, 0x6a4424, 0xd8b45a, 0x9a9a94, 0xa83a1a];
const SHIRT = [0xa9c46a, 0xe8a33d, 0xc2412d, 0xf2ead8, 0x6aa8d8, 0xe2a21a, 0x8a5aa8, 0x4a9a8a];
const HATC = [0xe8a33d, 0xc2412d, 0x2a5aa8, 0x6a8a3a, 0xf2ead8, 0x7a4a22];
const HS = ['normal', 'normal', 'buzz', 'curly', 'slick', null];
const HAT = ['beanie', 'beanie', 'ballcap', null, null, 'chef'];
const BODY = ['stocky', 'stocky', 'fat', 'normal'];
export const STATS = [['skill', 'Mengen', 'Fewer mixing mistakes, better errands'], ['tempo', 'Tempo', 'Kilos mixed a market day'], ['ethic', 'Werkethiek', 'How long he keeps going before he naps']];

const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hx = (n) => '#' + n.toString(16).padStart(6, '0');
const shade = (n, k) => { const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * k)))); return `rgb(${c})`; };

export const feeOf = (c) => 90 + 40 * (c.skill + c.tempo + c.ethic);
export const DEFAULT_LOOK = { skin: 0xd8a07a, hair: 0x1d1510, hs: 'normal', hat: 'beanie', hatC: 0xe8a33d, shirt: 0xa9c46a, body: 'stocky', scale: 0.68 };

// the 3D figure: Naknik look C (dungarees, N badge) with this one's own skin, hair, hat, tee and build
export function naknikLook(l) {
  const k = { ...DEFAULT_LOOK, ...(l || {}) }, B = LOOKS.naknik, rgb = (n) => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const L = { ...B, skin: hex01(k.skin), hair: k.hs ? hex01(k.hair) : null, hs: k.hs || null, hat: k.hat || null, hatC: k.hat ? hex01(k.hatC) : undefined, body: k.body, shirt: hex01(k.shirt), jacket: hex01(k.shirt),
    shirtPaint: { ...B.shirtPaint, shirt: rgb(k.shirt), skin: rgb(k.skin) } };
  if (!k.hat) delete L.hat; if (k.stache) L.stache = 1; if (k.glasses) L.glasses = 1; if (k.beard) { L.beard = hex01(k.hair); L.fluff = false; }
  return L;
}

// the cartoon on the card (and in the "talk to" popup): big nose, round cheeks, his own hat and hair
export function drawFace(cv, l, mood = 70) {
  const k = { ...DEFAULT_LOOK, ...(l || {}) }, g = cv.getContext('2d'), W = cv.width, s = W / 120;
  g.save(); g.scale(s, s); g.clearRect(0, 0, 120, 120);
  const bg = g.createLinearGradient(0, 0, 0, 120); bg.addColorStop(0, '#fff3cf'); bg.addColorStop(1, '#f2b21a'); g.fillStyle = bg; g.fillRect(0, 0, 120, 120);
  g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(60, -8, 90, 46, 0, 0, 7); g.fill(); // the Aero gloss
  const fat = k.body === 'fat' ? 1.14 : k.body === 'normal' ? 0.92 : 1, skin = hx(k.skin), line = '#3a2412';
  // shoulders: tee and dungaree straps with the N badge
  g.fillStyle = hx(k.shirt); g.beginPath(); g.ellipse(60, 126, 46 * fat, 30, 0, 0, 7); g.fill();
  g.fillStyle = '#6a4a2a'; g.fillRect(60 - 24 * fat, 100, 8, 22); g.fillRect(60 + 16 * fat, 100, 8, 22); g.fillRect(60 - 20, 110, 40, 12);
  g.fillStyle = '#ffd36b'; g.beginPath(); g.roundRect(52, 107, 16, 12, 3); g.fill(); g.fillStyle = '#7a3a0a'; g.font = '900 10px Arial'; g.textAlign = 'center'; g.fillText('N', 60, 117);
  g.fillStyle = shade(k.skin, 0.86); g.fillRect(52, 84, 16, 16);
  // hair behind
  if (k.hs && k.hs !== 'buzz') { g.fillStyle = hx(k.hair); g.beginPath(); g.ellipse(60, 52, 31 * fat, k.hs === 'curly' ? 34 : 31, 0, 0, 7); g.fill(); if (k.hs === 'curly') for (let a = 0; a < 9; a++) { g.beginPath(); g.arc(60 + Math.cos(Math.PI + a * 0.39) * 31 * fat, 50 + Math.sin(Math.PI + a * 0.39) * 31, 7, 0, 7); g.fill(); } }
  // head, ears
  g.fillStyle = skin; g.strokeStyle = line; g.lineWidth = 2;
  for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(60 + sx * 29 * fat, 60, 6, 9, 0, 0, 7); g.fill(); g.stroke(); }
  g.beginPath(); g.ellipse(60, 58, 28 * fat, 31, 0, 0, 7); g.fill(); g.stroke();
  if (k.hs === 'buzz') { g.fillStyle = shade(k.hair, 1); g.globalAlpha = 0.45; g.beginPath(); g.ellipse(60, 40, 26 * fat, 15, 0, Math.PI, 0); g.fill(); g.globalAlpha = 1; }
  else if (k.hs && !k.hat) { g.fillStyle = hx(k.hair); g.beginPath(); g.ellipse(60, 36, 27 * fat, k.hs === 'slick' ? 10 : 14, 0, Math.PI, 0); g.fill(); if (k.hs === 'slick') { g.beginPath(); g.moveTo(34, 36); g.quadraticCurveTo(60, 22, 88, 40); g.lineTo(86, 34); g.quadraticCurveTo(60, 14, 34, 30); g.fill(); } }
  // cheeks, eyes, brows
  g.fillStyle = 'rgba(226,90,60,.28)'; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(60 + sx * 17 * fat, 68, 7, 5, 0, 0, 7); g.fill(); }
  const sleepy = mood < 25;
  for (const sx of [-1, 1]) {
    const ex = 60 + sx * 11;
    if (sleepy) { g.strokeStyle = line; g.lineWidth = 2; g.beginPath(); g.arc(ex, 55, 4, 0.2, Math.PI - 0.2); g.stroke(); }
    else { g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex, 54, 5.5, 6.5, 0, 0, 7); g.fill(); g.strokeStyle = line; g.lineWidth = 1.2; g.stroke(); g.fillStyle = '#2a3a5a'; g.beginPath(); g.arc(ex + sx * 0.8, 55, 2.6, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex + sx * 0.8 - 1, 54, 0.9, 0, 7); g.fill(); }
    g.strokeStyle = shade(k.hs ? k.hair : 0x5a3a1a, 0.7); g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(ex - 6, 45 - (mood >= 60 ? 1 : -1) * sx * 1.5); g.lineTo(ex + 6, 45 + (mood >= 60 ? 1 : -1) * sx * 1.5); g.stroke();
  }
  if (k.glasses) { g.strokeStyle = '#2a2a2e'; g.lineWidth = 2; for (const sx of [-1, 1]) { g.beginPath(); g.arc(60 + sx * 11, 54, 8.5, 0, 7); g.stroke(); } g.beginPath(); g.moveTo(57.5, 54); g.lineTo(62.5, 54); g.stroke(); }
  // mouth
  g.strokeStyle = line; g.lineWidth = 2; g.fillStyle = '#7a2a1a';
  if (mood >= 60) { g.beginPath(); g.moveTo(47, 73); g.quadraticCurveTo(60, 88, 73, 73); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.fillRect(55, 74, 10, 3.5); }
  else if (mood >= 25) { g.beginPath(); g.moveTo(50, 77); g.quadraticCurveTo(60, 80, 70, 76); g.stroke(); }
  else { g.beginPath(); g.ellipse(60, 78, 4, 5, 0, 0, 7); g.fill(); g.stroke(); }
  if (k.beard) { g.fillStyle = hx(k.hair); g.globalAlpha = 0.9; g.beginPath(); g.moveTo(36, 66); g.quadraticCurveTo(60, 104, 84, 66); g.quadraticCurveTo(60, 84, 36, 66); g.fill(); g.globalAlpha = 1; }
  // the nose: a Naknik's pride
  g.fillStyle = shade(k.skin, 0.93); g.strokeStyle = line; g.lineWidth = 1.8; g.beginPath(); g.ellipse(60, 65, 7.5, 6.5, 0, 0, 7); g.fill(); g.stroke();
  if (k.stache) { g.fillStyle = hx(k.hs ? k.hair : 0x5a3a1a); g.beginPath(); g.moveTo(60, 71); g.quadraticCurveTo(48, 70, 44, 77); g.quadraticCurveTo(54, 77, 60, 74); g.quadraticCurveTo(66, 77, 76, 77); g.quadraticCurveTo(72, 70, 60, 71); g.fill(); }
  // hat
  if (k.hat === 'beanie') { g.fillStyle = hx(k.hatC); g.strokeStyle = line; g.lineWidth = 2; g.beginPath(); g.moveTo(32, 44); g.quadraticCurveTo(34, 12, 60, 12); g.quadraticCurveTo(86, 12, 88, 44); g.closePath(); g.fill(); g.stroke(); g.fillStyle = shade(k.hatC, 0.82); g.beginPath(); g.roundRect(30, 37, 60, 10, 4); g.fill(); g.stroke(); g.fillStyle = hx(k.hatC); g.beginPath(); g.arc(60, 11, 5, 0, 7); g.fill(); g.stroke(); }
  else if (k.hat === 'ballcap') { g.fillStyle = hx(k.hatC); g.strokeStyle = line; g.lineWidth = 2; g.beginPath(); g.moveTo(33, 42); g.quadraticCurveTo(36, 16, 60, 16); g.quadraticCurveTo(84, 16, 87, 42); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.ellipse(74, 42, 26, 5, 0.08, 0, 7); g.fill(); g.stroke(); }
  else if (k.hat === 'chef') { g.fillStyle = '#fbf8f0'; g.strokeStyle = line; g.lineWidth = 2; g.beginPath(); g.roundRect(38, 26, 44, 16, 3); g.fill(); g.stroke(); g.beginPath(); g.arc(46, 20, 12, 0, 7); g.arc(60, 14, 14, 0, 7); g.arc(74, 20, 12, 0, 7); g.fill(); g.beginPath(); g.arc(46, 20, 12, 2.4, 5.2); g.stroke(); g.beginPath(); g.arc(60, 14, 14, 3.6, 5.9); g.stroke(); g.beginPath(); g.arc(74, 20, 12, 4.2, 0.8); g.stroke(); }
  if (sleepy) { g.fillStyle = '#2a5aa8'; g.font = '900 15px Arial'; g.fillText('z', 96, 30); g.font = '900 11px Arial'; g.fillText('z', 106, 18); }
  g.restore();
}

function roll(seed, i, rank, used) {
  const r = rng32(seed * 7919 + i * 104729 + 17), pk = (a) => a[Math.floor(r() * a.length)];
  let name = ''; for (let k = 0; k < 20 && (!name || used.has(name) || [...used].some((u) => u.split(' ')[0] === name.split(' ')[0] || (name.includes(' ') && u.endsWith(name.slice(name.indexOf(' ')))))); k++) { const f = pk(FIRST), l = f.includes(' ') ? '' : pk(LAST); name = l ? `${f} ${l}` : f; }
  // three stats 1..5: a better name at the agency (rank) shifts the dice up; nobody is good at everything on day one
  const st = () => Math.max(1, Math.min(5, 1 + Math.floor(r() * 3.2 + r() * 1.2 + rank * 0.45)));
  const hs = pk(HS), hat = pk(HAT), q = pk(QUIRKS);
  return { id: `${seed}:${i}`, name, skill: st(), tempo: st(), ethic: st(), from: pk(FROM), quirk: q[0], quirkText: q[1], say: pk(SAY),
    look: { skin: pk(SKIN), hair: pk(HAIR), hs, hat: !hs && !hat ? 'beanie' : hat, hatC: pk(HATC), shirt: pk(SHIRT), body: pk(BODY), stache: r() < 0.3, glasses: r() < 0.22, beard: r() < 0.12, scale: +(0.62 + r() * 0.12).toFixed(2) } };
}

// deps: state, day(), rank(), cap() (Naknik places open now), homeCap(), canHire() (a mixing table), perNaknik(), addMoney, onHire(candidate), fmt, save
export function createSollicitanten(deps) {
  const { state } = deps;
  function pool() {
    const S = state.sollis && typeof state.sollis === 'object' ? state.sollis : (state.sollis = {});
    if (!S.seed) S.seed = 1 + Math.floor(Math.random() * 9000);
    const d = deps.day(), rank = deps.rank();
    if (S.day !== d || !Array.isArray(S.list)) {
      const used = new Set((state.crew || []).map((m) => m.name)), list = [];
      for (let i = 0; i < (rank >= 2 ? 4 : 3); i++) { const c = roll(S.seed + d, i, rank, used); used.add(c.name); list.push(c); }
      // the agency always sends one beginner a Hulpje can pay for
      if (!list.some((c) => feeOf(c) <= 450)) { const c = list[list.length - 1]; while (feeOf(c) > 450) { const k = ['tempo', 'skill', 'ethic'].sort((a, b) => c[b] - c[a])[0]; c[k]--; } }
      S.day = d; S.list = list;
    }
    return S.list;
  }
  const dots = (n, col) => `<span class="sol-dots">${[1, 2, 3, 4, 5].map((k) => `<i style="${k <= n ? `background:${col}` : ''}"></i>`).join('')}</span>`;
  const COL = { skill: 'linear-gradient(#ffd97a,#e8a01a)', tempo: 'linear-gradient(#ff9a7a,#c2412d)', ethic: 'linear-gradient(#b8e07a,#5a9a2a)' };
  const statRows = (c) => STATS.map(([k, n, tip]) => `<div class="sol-stat" title="${tip}"><span>${n}</span>${dots(c[k] || 3, COL[k])}</div>`).join('');
  const kgOf = (c) => Math.round(deps.perNaknik() * (0.7 + 0.1 * (c.tempo || 3)));
  const CSS = `<style>
    .sol-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:10px;margin-top:10px}
    .sol-card{position:relative;border-radius:12px;padding:10px;background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(255,244,214,.94) 46%,rgba(246,220,150,.92));border:1px solid rgba(160,110,20,.55);box-shadow:0 2px 10px rgba(80,50,0,.25),inset 0 1px 0 #fff;color:#2a1a0e;display:flex;flex-direction:column;gap:6px}
    .sol-card::before{content:"";position:absolute;left:1px;right:1px;top:1px;height:42%;border-radius:11px 11px 60% 60%/11px 11px 22% 22%;background:linear-gradient(rgba(255,255,255,.75),rgba(255,255,255,0));pointer-events:none}
    .sol-top{display:flex;gap:9px;align-items:center}.sol-top canvas{width:74px;height:74px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 5px rgba(80,50,0,.45);flex:none}
    .sol-name{font-weight:800;font-size:15px;line-height:1.15;color:#3a2208;text-shadow:0 1px 0 rgba(255,255,255,.7)}.sol-from{font-size:11px;opacity:.78;line-height:1.25}
    .sol-stat{display:flex;justify-content:space-between;align-items:center;font-size:12px;font-weight:700}
    .sol-dots{display:inline-flex;gap:3px}.sol-dots i{width:15px;height:9px;border-radius:5px;background:rgba(90,60,20,.16);box-shadow:inset 0 1px 1px rgba(0,0,0,.22)}
    .sol-quirk{font-size:11px;background:rgba(42,90,168,.1);border-radius:7px;padding:4px 6px;line-height:1.25}.sol-say{font-size:11px;font-style:italic;opacity:.85}
    .sol-card .b95{margin-top:auto}.sol-kg{font-size:11px;text-align:center;opacity:.8}
    .sol-crew{display:flex;flex-wrap:wrap;gap:8px;margin-top:6px}.sol-mini{display:flex;gap:6px;align-items:center;background:rgba(255,255,255,.6);border:1px solid rgba(160,110,20,.4);border-radius:22px;padding:3px 10px 3px 3px;font-size:11px;line-height:1.2}.sol-mini canvas{width:34px;height:34px;border-radius:50%}
  </style>`;
  function html() {
    const list = pool(), cap = deps.cap(), n = state.naknik || 0, full = n >= cap, crew = (state.crew || []).slice(0, n);
    let h = `${CSS}<div class="well"><b>Naknik Uitzendbureau Kaasland</b> · kantoor boven de viswinkel, drie trappen op · market day <b>${deps.day()}</b><br>
      Naknikim: hard workers, soft heads. Pick who you want: everyone who climbed the stairs today is below. <b>New faces every market day.</b><br>
      Employed <b>${n}</b> / ${cap}${deps.canHire() ? '' : ' · <span style="color:#a00">You need a mixing table first (Buy mixing table).</span>'}
      ${crew.length ? `<div class="sol-crew">${crew.map((m, i) => `<span class="sol-mini"><canvas width="68" height="68" data-crewface="${i}"></canvas><span><b>${m.name}</b><br>M ${m.skill || 3} · T ${m.tempo || 3} · W ${m.ethic || 3}</span></span>`).join('')}</div>` : ''}</div>`;
    if (full) h += `<div class="well" style="margin-top:8px;background:#ffffe0">${cap < deps.homeCap() ? `<b>The agency wants a bigger name first.</b> A ${['Hulpje', 'Mengmeester'][deps.rank()] || 'trader'} gets ${cap} Naknik${cap > 1 ? 'im' : ''}; a <b>${deps.rank() === 0 ? 'Mengmeester' : 'Kruidenhandelaar'}</b> gets more. Reputation comes from clients paying, raids and Klusbord jobs.` : '<b>No room for more Naknikim at home.</b> Build more mixing tables on the Loods tab, or hire at a warehouse in a territory (My Wilders).'} You can still look.</div>`;
    h += '<div class="sol-grid">';
    list.forEach((c, i) => {
      const fee = feeOf(c), off = c.hired || full || !deps.canHire();
      h += `<div class="sol-card"><div class="sol-top"><canvas width="148" height="148" data-solface="${i}"></canvas><div><div class="sol-name">${c.name}</div><div class="sol-from">Before this: ${c.from}.</div></div></div>
        ${statRows(c)}<div class="sol-quirk"><b>${c.quirk}</b> · ${c.quirkText}</div><div class="sol-say">${c.say}</div>
        <div class="sol-kg">mixes about <b>${kgOf(c)} kg</b> a market day</div>
        ${c.hired ? '<button class="b95" disabled>Hired</button>' : `<button class="b95" ${i === list.findIndex((x) => !x.hired) ? 'id="hireBtn"' : ''} data-hire="${i}" ${off ? 'disabled' : `data-need="${fee}"${state.money < fee ? ' disabled' : ''}`}>Hire ${c.name.split(' ')[0] === 'Ome' || c.name.split(' ').length > 2 ? c.name : c.name.split(' ')[0]} · ${deps.fmt(fee)}</button>`}</div>`;
    });
    h += '</div><p><small><b>Mengen</b>: fewer mistakes at the mixer. <b>Tempo</b>: kilos a day. <b>Werkethiek</b>: how long before he naps on the paprika. The fee is one-off; soup is expected.</small></p>';
    return h;
  }
  function bind(body, rerender) {
    const list = pool();
    body.querySelectorAll('[data-solface]').forEach((cv) => drawFace(cv, list[+cv.dataset.solface].look, 80));
    body.querySelectorAll('[data-crewface]').forEach((cv) => { const m = (state.crew || [])[+cv.dataset.crewface]; if (m) drawFace(cv, m.look, m.mood); });
    body.querySelectorAll('[data-hire]').forEach((b) => b.onclick = () => { if (hire(+b.dataset.hire, b)) rerender(); });
  }
  function hire(i, el) {
    const c = pool()[i]; if (!c || c.hired || !deps.canHire() || (state.naknik || 0) >= deps.cap()) return false;
    const fee = feeOf(c); if (state.money < fee) return false;
    deps.addMoney(-fee, el); c.hired = true;
    deps.onHire({ name: c.name, skill: c.skill, tempo: c.tempo, ethic: c.ethic, quirk: c.quirk, quirkText: c.quirkText, look: c.look, mood: 75, away: null });
    return true;
  }
  return { pool, html, bind, hire, feeOf, kgOf };
}
