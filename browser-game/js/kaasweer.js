// Kaasland leeft: the week, the seasons, the weather and Krant voor het Kaasvolk, the daily paper.
// Every market day is a weekday (day 1 is a Monday) and every 14 market days the season turns (it starts in autumn).
// The weather is rolled per day from the save's own seed, leans on the season and likes to stay, so a reload shows the
// same sky. It changes the street (sky, fog, light, rain or snow, wet tarmac, umbrellas, fewer people out in a storm),
// the Oofmobiel's grip, what the clients order and when the truck comes. The paper reports what Eddy did yesterday,
// the forecast, the market and some small ads. state.weer = { seed, facts: [{ day, kind, ... }], read } is saved.

const WD = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'];
const SEASONS = [
  { id: 'herfst', name: 'Herfst', t: 12 },
  { id: 'winter', name: 'Winter', t: 3 },
  { id: 'lente', name: 'Lente', t: 13 },
  { id: 'zomer', name: 'Zomer', t: 22 },
];
export const SEASON_DAYS = 14;
// what the street orders on each weekday (snackbars live on the weekend)
const WD_VOL = [0.9, 1, 1, 1, 1.15, 1.25, 0.92];
const WD_WHY = ['Maandag: half of Kaasland is on a diet', null, null, null, 'Vrijdag: the snackbars run flat out', 'Zaterdag: all of Kaasland wants a broodje', 'Zondag: the city sleeps in'];
// holidays: season, day of the season (1-14)
const HOLIDAYS = [
  { id: 'sint', name: 'Pakjesavond', season: 1, d: 5, vol: 1.2, line: 'Sinterklaas! Speculaas everywhere: kaneel and kardemom fly off the shelves', price: { kaneel: 1.5, kardemom: 1.35 } },
  { id: 'oudnieuw', name: 'Oudejaarsdag', season: 1, d: 14, vol: 1.3, line: 'Oud en Nieuw: oliebollen, fireworks, and at three in the morning everybody wants shoarma' },
  { id: 'koning', name: 'Koningsdag', season: 2, d: 13, vol: 1.6, line: 'Koningsdag: the whole city in orange, a vrijmarkt on every pavement, and every snackbar orders extra' },
  { id: 'kermis', name: 'Zomerkermis', season: 3, d: 9, vol: 1.3, line: 'The summer fair is on the square: candyfloss, bumper cars and a queue at every snack stand' },
];
// the weather. vol: what clients order; out: share of passers-by who go out; grip: the Oofmobiel on the road;
// sky: what the pink street sky turns to and how far (k); fog: [near, far]; light: sun and sky strength; wet: tarmac
export const WEATHER = {
  zon: { name: 'Zonnig', icon: '☀️', vol: 1.1, out: 1, grip: 1, sky: [0xffc8a8, 0.15], fog: [70, 150], light: 1.08, wet: 0, line: 'Full terraces, everybody wants a broodje shoarma on a bench' },
  bewolkt: { name: 'Bewolkt', icon: '☁️', vol: 1, out: 0.95, grip: 1, sky: [0xb8b4c4, 0.4], fog: [60, 135], light: 0.85, wet: 0, line: 'Grey but dry. In Kaasland that counts as a nice day' },
  motregen: { name: 'Motregen', icon: '🌦️', vol: 0.95, out: 0.8, grip: 0.85, sky: [0x9ea4b0, 0.55], fog: [45, 115], light: 0.7, wet: 0.6, rain: 0.35, line: 'That fine drizzle that seems to come up from the ground' },
  buien: { name: 'Buien', icon: '🌧️', vol: 0.85, out: 0.6, grip: 0.72, sky: [0x8a92a0, 0.68], fog: [38, 100], light: 0.6, wet: 1, rain: 0.8, line: 'Downpours. Whoever can stays in' },
  storm: { name: 'Storm', icon: '🌬️', vol: 0.72, out: 0.35, grip: 0.62, sky: [0x5e6676, 0.82], fog: [28, 85], light: 0.45, wet: 1, rain: 1, wind: 1, line: 'Code orange: cyclists blow into the canal and the trucks stand still' },
  mist: { name: 'Mist', icon: '🌁', vol: 0.95, out: 0.8, grip: 0.9, sky: [0xd8d6dc, 0.72], fog: [5, 46], light: 0.72, wet: 0.3, line: 'Thick fog over the canals: your own bike disappears' },
  vorst: { name: 'Vorst', icon: '❄️', vol: 1.1, out: 0.7, grip: 0.55, sky: [0xc8dcf0, 0.38], fog: [70, 150], light: 1, wet: 0.2, line: 'Clear blue and freezing: hot food sells, the canals almost freeze over' },
  sneeuw: { name: 'Sneeuw', icon: '🌨️', vol: 0.85, out: 0.6, grip: 0.45, sky: [0xe0e4ec, 0.65], fog: [30, 95], light: 0.85, wet: 0.5, snow: 1, line: 'Snow! All of Kaasland slides, the trains stop, the kids go sledging' },
  hitte: { name: 'Hittegolf', icon: '🔥', vol: 1.22, out: 0.9, grip: 1, sky: [0xffc890, 0.3], fog: [60, 140], light: 1.2, wet: 0, line: 'Thirty degrees! A barbecue on every balcony, paprika and knoflook sell like hot cakes' },
};
const IDS = Object.keys(WEATHER);
// how likely each weather is in each season (zon, bewolkt, motregen, buien, storm, mist, vorst, sneeuw, hitte)
const ODDS = {
  herfst: [1.4, 3, 3, 2.6, 1.1, 1.6, 0.3, 0, 0],
  winter: [1, 3, 2, 1.4, 0.8, 1.6, 2.2, 1.4, 0],
  lente: [3, 3, 2, 2, 0.4, 0.8, 0.3, 0, 0],
  zomer: [4.5, 2.5, 1, 1.6, 0.4, 0.2, 0, 0, 1.3],
};
const STAY = { zon: 0.5, bewolkt: 0.4, motregen: 0.4, buien: 0.35, storm: 0.15, mist: 0.25, vorst: 0.5, sneeuw: 0.35, hitte: 0.5 };
const TEMP = { zon: 3, bewolkt: 0, motregen: -1, buien: -2, storm: -3, mist: -2, vorst: -9, sneeuw: -6, hitte: 11 };
// season price bias on the Kruidenbeurs (speculaas in winter, barbecue in summer)
const SEASON_PRICE = { winter: { kaneel: 1.3, kardemom: 1.2 }, zomer: { paprika: 1.15, knoflook: 1.12 }, lente: { koriander: 1.1 }, herfst: { komijn: 1.08 } };
const IMPORTED = ['kurkuma', 'kaneel', 'kardemom', 'saffraan']; // they come in by ship: a storm holds them up
const SEASON_LINE = { winter: 'Winter: kaneel and kardemom cost more (speculaas season)', zomer: 'Zomer: barbecue season, paprika and knoflook cost more', lente: 'Lente: fresh koriander in demand, a bit dearer', herfst: 'Herfst: stew weather, komijn a bit dearer' };

const rng32 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const hashStr = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ---- Krant voor het Kaasvolk copy (generic Kaasland parody, nobody real named)
const FILLER = [
  ['Council installs 400 new bike racks', 'All 400 were full within the hour. "And those are just the abandoned bikes," says a spokesperson.'],
  ['Tourist falls in canal, mostly wants his photo back', 'The man stood on a houseboat roof "because it looked so stable".'],
  ['Kipkruidenkwartier bridge stuck open for three weeks', 'The bridge keeper is on holiday. "He took the key with him," says the council.'],
  ['Seagull steals kroket from alderman', 'The gull is still at large. Witnesses: "He had clearly done this before."'],
  ['Tram 5 diverted again', 'Nobody remembers why. "It has become a tradition," says a driver.'],
  ['Student lives in a bakfiets, pays W 900 rent', 'The landlord calls it "a compact flat with lots of outdoor space".'],
  ['Kaaslanders cycle 3 km a day into the wind', 'Research shows the wind always comes from the front, even when you turn round.'],
  ['New parking app asks for 47 permissions', 'Meanwhile the wardens just hand out paper tickets. "Like the old days."'],
  ['Canal house sinks another two centimetres', 'The residents only noticed when their marbles rolled into the kitchen by themselves.'],
  ['Canal boat stuck under low bridge', 'The passengers sat there for three hours. "Best view of the whole trip," says one.'],
];
const SMALL_ADS = [
  'TE KOOP: bakfiets, one wheel. Offers.', 'GEVONDEN: bunch of keys by the Kroketkade. With a bottle opener on it.', 'GEZOCHT: room for a Naknik, max W 400, no pets, a mortar is fine.',
  'TE KOOP: shoarma machine, smells of 1994. Bram (the other one).', 'VERMIST: grey cat, answers to "Saffie" or to the tin opener.', 'GRATIS: three crates of old stroopwafels. Slightly soft.',
  'BIJLES maths from Henk Cijfer. Spreadsheets on request.', 'TE HUUR: houseboat mooring, canal included.', 'GEZOCHT: someone who can switch off the bell on tram 5.',
  'TE KOOP: orange crown, worn once (Koningsdag). W 5.', 'GEVRAAGD: goldfish sitter, three days. The goldfish is calm.', 'TE RUIL: two fair tickets for one good raincoat.',
];
const MUTTER = {
  zon: ['Eindelijk zon! Snel, naar het terras!', 'Lekker weertje, hè?', 'Zonnebril op, jas nog aan. Kaasland.'],
  bewolkt: ['Droog! Ik neem het.', 'Grijs. Zoals altijd.', 'Het gaat zo regenen, let maar op.'],
  motregen: ['Die miezer gaat dwars door je jas.', 'Paraplu? Bij die wind? Nee joh.', 'Motregen. De officiële kleur van Kaasland.'],
  buien: ['Kletsnat! Mijn sokken!', 'Weer een bui. Wie had dat gedacht.', 'Ik ga gewoon een shoarma bestellen. Thuis.'],
  storm: ['Mijn paraplu staat binnenstebuiten!', 'Code oranje! Waarom ben ik buiten?!', 'Mijn fiets ligt in de gracht. Weer.'],
  mist: ['Is dat een fiets of een kat?', 'Ik zie geen hand voor ogen.', 'Mist. Net Londen, maar met kaas.'],
  vorst: ['Brrr! Gaan de grachten dicht?', 'Mijn fietsslot is bevroren.', 'Koud! Tijd voor erwtensoep.'],
  sneeuw: ['Sneeuw! Heel Kaasland staat stil.', 'Pas op, het is spekglad!', 'De NS rijdt weer niet, wedden?'],
  hitte: ['Dertig graden. Ik smelt.', 'Barbecue vanavond, kom je?', 'Is er ergens nog een ventilator te koop?'],
};
const HOLI_MUTTER = { sint: ['Heb jij al een surprise?', 'Pepernoten in mijn jaszak. Allemaal.'], oudnieuw: ['Oliebollen gehaald?', 'Nog één dag en dan stop ik met snacken. Zeker weten.'], koning: ['Oranje boven!', 'Vrijmarkt! Wie wil een oude broodrooster?'], kermis: ['Botsauto\'s! Ik ga drie keer.', 'Suikerspin aan mijn mouw. Weer.'] };

export function createKaasweer(deps) {
  const { THREE, state, scene } = deps;
  const S = () => { const w = state.weer && typeof state.weer === 'object' ? state.weer : (state.weer = {}); if (!w.seed) w.seed = 1 + Math.floor(Math.random() * 1e9); if (!Array.isArray(w.facts)) w.facts = []; return w; };
  const day = () => deps.day();

  // ---- calendar
  function cal(d = day()) {
    const n = Math.max(1, d) - 1, si = Math.floor(n / SEASON_DAYS) % 4, sd = (n % SEASON_DAYS) + 1;
    const holi = HOLIDAYS.find((h) => h.season === si && h.d === sd) || null;
    return { d, wd: n % 7, wdName: WD[n % 7], season: SEASONS[si], sd, week: Math.floor((sd - 1) / 7) + 1, year: Math.floor(n / (SEASON_DAYS * 4)) + 1, holi };
  }
  // ---- weather: a chain from day 1, each day rolled from the seed (memoised)
  const memo = new Map();
  function roll(d) {
    if (memo.has(d)) return memo.get(d);
    let prev = 'bewolkt', from = 1;
    for (let k = d - 1; k >= 1; k--) if (memo.has(k)) { prev = memo.get(k).id; from = k + 1; break; }
    let out = null;
    for (let k = from; k <= d; k++) {
      const r = rng32(hashStr(`weer#${S().seed}#${k}`)), c = cal(k), odds = ODDS[c.season.id];
      let id;
      if (k > 1 && r() < STAY[prev] && odds[IDS.indexOf(prev)] > 0) id = prev;
      else { let tot = 0; for (const o of odds) tot += o; let x = r() * tot; id = IDS[IDS.length - 1]; for (let i = 0; i < IDS.length; i++) { x -= odds[i]; if (x <= 0) { id = IDS[i]; break; } } }
      if (c.holi && c.holi.id === 'koning' && (id === 'storm' || id === 'sneeuw')) id = 'bewolkt'; // the king gets his parade
      const temp = Math.round(c.season.t + TEMP[id] + (r() * 2 - 1) * 3);
      out = { id, ...WEATHER[id], temp: id === 'vorst' ? Math.min(temp, -1) : id === 'sneeuw' ? Math.min(temp, 1) : id === 'hitte' ? Math.max(temp, 29) : temp };
      memo.set(k, out); prev = id;
    }
    return out;
  }
  const weather = (d = day()) => roll(Math.max(1, d));
  // the forecast the paper prints: right more often the closer it is
  function forecast(d, ahead) {
    const real = weather(d + ahead), r = rng32(hashStr(`voorspel#${S().seed}#${d}#${ahead}`));
    if (r() < [0, 0.88, 0.72, 0.58][ahead]) return real;
    const odds = ODDS[cal(d + ahead).season.id], opts = IDS.filter((id, i) => odds[i] > 0 && id !== real.id);
    const id = opts[Math.floor(r() * opts.length)]; return { id, ...WEATHER[id], temp: real.temp + Math.round((r() * 2 - 1) * 3) };
  }
  const forecastDays = () => (deps.rank() >= 1 ? 3 : 1); // a Mengmeester reads the whole weather page

  // ---- what it does to the trade
  function demand(d = day()) {
    const c = cal(d), w = weather(d);
    return clamp(WD_VOL[c.wd] * w.vol * (c.holi ? c.holi.vol : 1), 0.55, 1.8);
  }
  function demandWhy(d = day()) {
    const c = cal(d), w = weather(d), out = [];
    if (c.holi) out.push(`${c.holi.name}: ${c.holi.line}`);
    if (WD_WHY[c.wd]) out.push(WD_WHY[c.wd]);
    if (w.vol !== 1) out.push(`${w.name}: ${w.line.charAt(0).toLowerCase() + w.line.slice(1)}`);
    return out;
  }
  const truckLate = (d = day()) => ['storm', 'sneeuw'].includes(weather(d).id);
  function priceBias(id, d = day()) {
    const c = cal(d), w = weather(d);
    let f = (SEASON_PRICE[c.season.id] && SEASON_PRICE[c.season.id][id]) || 1;
    if (c.holi && c.holi.price && c.holi.price[id]) f *= c.holi.price[id];
    else if (c.season.id === 'winter' && c.sd <= 6 && (id === 'kaneel' || id === 'kardemom')) f *= 1.15; // the run-up to pakjesavond
    if (w.id === 'storm' && IMPORTED.includes(id)) f *= 1.15;
    return Math.min(f, 1.6);
  }
  const grip = () => (deps.active() ? weather().grip : 1);

  // ---- facts for the paper (kept three days)
  function note(kind, data = {}) {
    const w = S(); w.facts.push({ day: day(), kind, ...data });
    w.facts = w.facts.filter((f) => f.day >= day() - 3).slice(-30);
  }

  // ---------------------------------------------------------------- the street
  const base = { bg: scene.background.clone(), fog: scene.fog.color.clone(), near: scene.fog.near, far: scene.fog.far, hemi: deps.hemi.intensity, sun: deps.sun.intensity, env: scene.environmentIntensity };
  const wet = (deps.wetMats || []).map((m) => ({ m, r: m.roughness, c: m.color.clone() }));
  let applied = -1, cur = null, tod = null; // tod: { n: night 0..1, dusk 0..1 } from js/klok.js
  const NIGHT = new THREE.Color(0x0b1430), DUSK = new THREE.Color(0xff9a5a), sunBase = deps.sun.color.clone();
  function setTime(t) { tod = t; apply(true); }
  function apply(force) {
    const d = day(); if (!force && applied === d) return;
    if (deps.busy()) return; // a mission keeps its own sky; the street catches up afterwards
    applied = d; const w = cur = weather(d), c = cal(d);
    const sky = new THREE.Color(w.sky[0]);
    let k = w.sky[1];
    scene.background.copy(base.bg).lerp(sky, k); scene.fog.color.copy(base.fog).lerp(sky, Math.min(1, k + 0.1));
    scene.fog.near = w.fog[0]; scene.fog.far = w.fog[1];
    deps.hemi.intensity = base.hemi * hemiK(w); deps.sun.intensity = base.sun * Math.pow(w.light, 1.6);
    deps.sun.castShadow = w.light >= 0.6; // no hard shadows under storm clouds
    const nt = tod ? tod.n : 0, du = tod ? tod.dusk : 0;
    if (nt > 0 || du > 0) { // evening and night on top of the weather: an orange hour, then dark blue, lamps and windows carry the street
      scene.background.lerp(DUSK, du * 0.45 * (1 - nt)).lerp(NIGHT, nt * 0.94); scene.fog.color.lerp(DUSK, du * 0.35 * (1 - nt)).lerp(NIGHT, nt * 0.92);
      deps.hemi.intensity *= 1 - 0.66 * nt; deps.sun.intensity *= (1 - 0.93 * nt) * (1 - 0.25 * du); if (nt > 0.55) deps.sun.castShadow = false;
    }
    deps.sun.color.copy(sunBase).lerp(DUSK, Math.min(1, du * 0.7));
    if (base.env != null) scene.environmentIntensity = base.env * (0.35 + 0.65 * w.light) * (1 + 0.6 * w.wet) * (1 - 0.7 * nt); // wet tarmac mirrors the sky
    for (const x of wet) { x.m.roughness = x.r * (1 - 0.6 * w.wet); x.m.color.copy(x.c).multiplyScalar(1 - 0.38 * w.wet); }
    for (const x of wet) if (x.m.emissive) x.m.emissive.copy(WHITE).multiplyScalar(w.snow ? 0.34 : 0); // a white layer of snow on the street
    splash.visible = !!w.rain;
    rain.visible = !!w.rain; snow.visible = !!w.snow;
    rain.geometry.setDrawRange(0, Math.round(RAIN_N * (w.rain || 0)) * 2);
    rainMat.opacity = 0.4 + 0.3 * (w.rain || 0);
    crowd(w.out * (c.holi && c.holi.vol > 1.25 ? 1.15 : 1) * (1 - 0.6 * nt)); // the street empties at night
    umbrellas(!!w.rain || w.id === 'sneeuw');
    if (deps.onApply) deps.onApply(w, c, tod);
  }
  // rain: short falling streaks in a box that follows the camera's target; snow: drifting points
  const RAIN_N = 1600, BOX = { x: 34, y: 22, z: 22 };
  const rp = new Float32Array(RAIN_N * 6), rs = new Float32Array(RAIN_N);
  for (let i = 0; i < RAIN_N; i++) { const x = (Math.random() * 2 - 1) * BOX.x, y = Math.random() * BOX.y, z = (Math.random() * 2 - 1) * BOX.z; rp.set([x, y, z, x, y + 1.1, z], i * 6); rs[i] = 15 + Math.random() * 6; }
  const rainGeo = new THREE.BufferGeometry(); rainGeo.setAttribute('position', new THREE.BufferAttribute(rp, 3));
  const rainMat = new THREE.LineBasicMaterial({ color: 0xdde6f2, transparent: true, opacity: 0.5, depthWrite: false, fog: false });
  const rain = new THREE.LineSegments(rainGeo, rainMat); rain.frustumCulled = false; rain.visible = false; rain.renderOrder = 5; scene.add(rain);
  const SNOW_N = 1400, sp = new Float32Array(SNOW_N * 3), sph = new Float32Array(SNOW_N);
  for (let i = 0; i < SNOW_N; i++) { sp.set([(Math.random() * 2 - 1) * BOX.x, Math.random() * BOX.y, (Math.random() * 2 - 1) * BOX.z], i * 3); sph[i] = Math.random() * 6.28; }
  const snowGeo = new THREE.BufferGeometry(); snowGeo.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const flake = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d'); const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.5, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 32, 32); const t = new THREE.CanvasTexture(c); return t; })();
  const snow = new THREE.Points(snowGeo, new THREE.PointsMaterial({ size: 0.42, map: flake, transparent: true, depthWrite: false, color: 0xffffff, fog: false }));
  snow.frustumCulled = false; snow.visible = false; scene.add(snow);
  let flashT = 0, boltT = 8;
  const WHITE = new THREE.Color(0xf4f6fa), hemiK = (w) => 0.55 + 0.45 * w.light;
  // rings where the drops hit the street (reads well from the high camera); additive, so a dark instance colour fades it out
  const SPL_N = 260, splash = new THREE.InstancedMesh(new THREE.RingGeometry(0.68, 0.8, 16).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), SPL_N);
  const splT = new Float32Array(SPL_N), splX = new Float32Array(SPL_N), splZ = new Float32Array(SPL_N), m4 = new THREE.Matrix4(), col = new THREE.Color();
  for (let i = 0; i < SPL_N; i++) { splT[i] = Math.random(); splX[i] = (Math.random() * 2 - 1) * 16; splZ[i] = (Math.random() * 2 - 1) * 11; splash.setColorAt(i, col.setScalar(0)); }
  splash.frustumCulled = false; splash.visible = false; splash.renderOrder = 4; scene.add(splash);

  // fewer people out in bad weather: the ones who stay home step off the street (and come back the next dry day)
  function crowd(share) {
    const W = deps.walkers || []; let n = 0;
    W.forEach((p, i) => {
      const u = p.userData.walk; if (!u) return;
      const stay = !u.police && ((i * 0.618) % 1) >= share; // the same people stay in each time
      if (stay && !u.home) { u.home = { x: p.position.x, z: p.position.z }; p.visible = false; p.position.y = -60; if (u.comp && u.comp.obj) u.comp.obj.visible = false; if (u.comp && u.comp.line) u.comp.line.visible = false; }
      else if (!stay && u.home) { p.position.set(u.home.x, 0, u.home.z); p.visible = true; u.home = null; if (u.comp && u.comp.obj) u.comp.obj.visible = true; if (u.comp && u.comp.line) u.comp.line.visible = true; }
      if (!p.visible) n++;
    });
    return n;
  }
  // a Dutch umbrella over most heads in the rain (not on joggers, couriers, kids or the police)
  const UMB_COL = [0x1a1a1e, 0x1d3a8a, 0xc8102e, 0x2a6a4a, 0xe8862c, 0x6a3a8a, 0xd8d8d8];
  const canopyGeo = new THREE.ConeGeometry(0.62, 0.26, 8, 1, true), shaftGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.95, 5), tipGeo = new THREE.SphereGeometry(0.025, 5, 4);
  const shaftMat = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
  const umbs = [];
  function umbrellas(on) {
    for (const p of deps.walkers || []) {
      const u = p.userData.walk; if (!u || u.police) continue;
      const f = p.userData.folk; if (f && ['jogger', 'courier', 'kid', 'teen'].includes(f.id)) continue;
      let g = p.userData.umbrella;
      if (on && !g) {
        g = new THREE.Group(); const i = umbs.length;
        const can = new THREE.Mesh(canopyGeo, new THREE.MeshLambertMaterial({ color: UMB_COL[i % UMB_COL.length], side: THREE.DoubleSide })); can.position.y = 0.95 / 2 + 0.1; can.castShadow = true; g.add(can);
        g.add(new THREE.Mesh(shaftGeo, shaftMat)); const tip = new THREE.Mesh(tipGeo, shaftMat); tip.position.y = 0.95 / 2 + 0.24; g.add(tip);
        g.position.set(0.12, 1.85, 0.18); g.rotation.z = -0.12; g.userData.can = can; p.add(g); p.userData.umbrella = g; umbs.push(g);
      }
      if (g) g.visible = on;
    }
  }

  // per frame: precipitation follows the target, lightning in a storm
  const ctr = new THREE.Vector3();
  function update(dt, target, show) {
    if (applied !== day()) apply();
    const w = cur; if (!w) return;
    const vis = show && !deps.busy();
    rain.visible = vis && !!w.rain; snow.visible = vis && !!w.snow;
    if (!vis) { splash.visible = false; return; }
    ctr.set(target.x, 0, target.z);
    if (rain.visible) {
      rain.position.copy(ctr); const wind = (w.wind ? 5 : 1.2) * dt, n = Math.round(RAIN_N * w.rain), lean = w.wind ? 0.32 : 0.08;
      for (let i = 0; i < n; i++) {
        const o = i * 6; let y = rp[o + 1] - rs[i] * dt, x = rp[o] + wind;
        if (y < 0) { y += BOX.y; x = (Math.random() * 2 - 1) * BOX.x; rp[o + 2] = rp[o + 5] = (Math.random() * 2 - 1) * BOX.z; }
        if (x > BOX.x) x -= BOX.x * 2;
        rp[o] = x; rp[o + 1] = y; rp[o + 3] = x - lean; rp[o + 4] = y + 1.1;
      }
      rainGeo.attributes.position.needsUpdate = true;
      splash.visible = true; splash.position.set(ctr.x, 0.05, ctr.z); const ns = Math.round(SPL_N * w.rain);
      for (let i = 0; i < SPL_N; i++) {
        if (i >= ns) { m4.makeScale(0, 0, 0); splash.setMatrixAt(i, m4); continue; }
        splT[i] += dt * 2.6; if (splT[i] >= 1) { splT[i] -= 1; splX[i] = (Math.random() * 2 - 1) * 16; splZ[i] = (Math.random() * 2 - 1) * 11; }
        const k = 0.05 + 0.22 * splT[i]; m4.makeScale(k, 1, k).setPosition(splX[i], 0, splZ[i]); splash.setMatrixAt(i, m4); splash.setColorAt(i, col.setScalar(0.3 * (1 - splT[i])));
      }
      splash.instanceMatrix.needsUpdate = true; splash.instanceColor.needsUpdate = true;
    } else splash.visible = false;
    if (snow.visible) {
      snow.position.copy(ctr); const t = performance.now() / 1000;
      for (let i = 0; i < SNOW_N; i++) {
        const o = i * 3; let y = sp[o + 1] - (0.9 + (i % 5) * 0.12) * dt;
        sp[o] += Math.sin(t * 0.8 + sph[i]) * 0.35 * dt + 0.25 * dt;
        if (y < 0) { y += BOX.y; sp[o] = (Math.random() * 2 - 1) * BOX.x; }
        if (sp[o] > BOX.x) sp[o] -= BOX.x * 2;
        sp[o + 1] = y;
      }
      snowGeo.attributes.position.needsUpdate = true;
    }
    if (w.wind) { // umbrellas tug in the gusts, and now and then the sky cracks
      const t = performance.now() / 1000; for (const g of umbs) if (g.visible) g.rotation.z = -0.12 + Math.sin(t * 5 + g.id) * 0.18;
      boltT -= dt;
      if (boltT <= 0) { boltT = 9 + Math.random() * 16; flashT = 0.22; if (deps.thunder) setTimeout(() => deps.thunder(), 500 + Math.random() * 1500); }
    }
    if (flashT > 0) { flashT -= dt; const k = flashT > 0.12 || (flashT < 0.07 && flashT > 0.03) ? 1 : 0; deps.hemi.intensity = base.hemi * hemiK(w) * (1 + 2.5 * k); if (flashT <= 0) deps.hemi.intensity = base.hemi * hemiK(w); }
  }

  // ---------------------------------------------------------------- HUD + street talk
  const hud = () => { const w = weather(), c = cal(); return `<span class="weer">${w.icon} <b>${w.name}</b> ${w.temp}° · ${c.wdName}${c.holi ? ` · <b style="color:#ffb84a">${c.holi.name}</b>` : ''}</span>`; };
  function mutter() {
    if (!deps.active()) return null;
    const w = weather(), c = cal(), r = Math.random();
    if (c.holi && HOLI_MUTTER[c.holi.id] && r < 0.4) return HOLI_MUTTER[c.holi.id][Math.floor(Math.random() * HOLI_MUTTER[c.holi.id].length)];
    if (r < 0.7) return MUTTER[w.id][Math.floor(Math.random() * MUTTER[w.id].length)];
    const p = paper(); return p ? `Heb je de krant gezien? „${p.head}”` : null;
  }

  // ---------------------------------------------------------------- Krant voor het Kaasvolk
  // Built from what happened yesterday (facts, the day report, police, rivals) plus today's weather and the market.
  function paper(d = day()) {
    const r = rng32(hashStr(`krant#${S().seed}#${d}`)), pk = (a) => a[Math.floor(r() * a.length)];
    const y = S().facts.filter((f) => f.day === d - 1), c = cal(d), w = weather(d), e = deps.econ.ensure();
    const stories = [];
    const strike = y.find((f) => f.kind === 'strike');
    if (strike) stories.push({ p: 9, head: pk(['Gangs strike back in Kipkruidenkwartier', 'Night of revenge: snackbars turned over', 'Spice war flares up again']), body: `${strike.text} The neighbours have had enough. "It used to be about who had the best sauce," says a regular.` });
    const raid = y.find((f) => f.kind === 'raid');
    if (raid) stories.push({ p: 8, head: raid.grade === 'S' ? `${raid.name} snackbar "taken over" in fifteen minutes` : pk([`Chaos at ${raid.name}`, `Brawl at ${raid.name}: frying fat all over the pavement`, `Trouble in ${raid.name}`]), body: `${pk(['Witnesses speak of "a young man in a blue shirt".', 'A neighbour: "Afterwards it suddenly smelled lovely, of komijn."', 'The police say they have "no leads". One officer ate a broodje meanwhile.'])} ${raid.remix ? 'It is not the first time this year.' : 'The owner says he will buy from "a family business" from now on.'}` });
    const cops = state.cops && Array.isArray(state.cops.reports) ? state.cops.reports.filter((x) => x.day === d - 1) : [];
    if (cops.length) stories.push({ p: 7, head: 'Report: man waves truncheon in the street', body: `${cops.length > 1 ? `${cops.length} neighbours called` : 'A neighbour called'} the police. Wijkagent Bakker: "We know who it is. We will drop by."` });
    const brw = y.find((f) => f.kind === 'brawl'); // a fight with the picket (js/activists.js)
    if (brw) stories.push({ p: 9, head: brw.how === 'win' ? pk(['Spice trader floors four protesters', `Brawl outside the loods: ${brw.tag} picket flattened`, 'Truncheon ends protest at the Kipkruidenkade']) : brw.how === 'lose' ? pk(['Activists floor the kruidenbaas', `${brw.tag} “collects” from spice trader after scuffle`, 'Megaphone beats truncheon']) : pk(['Spice trader flees his own pavement', `${brw.tag} lay siege to a warehouse door`]), body: `${brw.by === 'them' ? 'Witnesses say the protesters went for him first.' : 'Witnesses say he swung first.'} ${brw.how === 'win' ? (brw.footage ? 'Wijkagent Bakker: “It has been settled on the spot.”' : 'Wijkagent Bakker: “There is no footage. Several phones were found in the gutter.”') : brw.how === 'lose' ? 'A spokesperson: “We regret nothing and we kept the receipt.”' : 'The doorbell is reported to be broken.'}` });
    const prot = y.find((f) => f.kind === 'protest') || (state.activists && state.activists.day === d - 1 && state.activists.seen); // the PRO picket (js/activists.js)
    if (prot) stories.push({ p: 6, head: 'Protesters outside the spice trader', body: 'With banners and a megaphone. A local: "No idea what it was about, but they had good coffee."' });
    const rep = e.report;
    if (rep && rep.rows && rep.rows.length > 1 && r() < 0.6) stories.push({ p: 4, head: rep.missed ? 'Snackbars complain: "No spice delivered"' : 'Snackbar owners happy with new supplier', body: rep.missed ? `${rep.missed} joint${rep.missed > 1 ? 's' : ''} went without spice yesterday. "Salt it is, then," sighs a grill master.` : '"On time, a fair price, and the knoflook is knoflook again," says a happy grill master.' });
    if (c.holi) stories.push({ p: 5, head: c.holi.name + '!', body: c.holi.line + '.' });
    if (w.id === 'storm' || w.id === 'sneeuw' || w.id === 'hitte') stories.push({ p: 5.5, head: { storm: 'Storm shuts Kaasland down', sneeuw: 'Snow chaos: Kaasland slides', hitte: 'Heatwave: Kaasland melts' }[w.id], body: `${w.line}.${truckLate(d) ? ' Trucks are stuck on the A-Kaas: deliveries come a day late.' : ''}` });
    const heat = e.heat || {}, hot = Object.entries(heat).sort((a, b) => b[1] - a[1])[0];
    if (hot && hot[1] >= 60) stories.push({ p: 3, head: `${{ lampas: 'The Lampas', noshgey: 'Noshgey Kariot', abdavissies: 'Abdavissies', paravim: 'Paravim' }[hot[0]] || 'The gangs'} restless`, body: 'Sources in the snack world: "Something is in the air, and it is not just frying fat."' });
    const news = (e.news || []).at(-1);
    if (news) stories.push({ p: 2, head: news.text, body: 'Prices on the Kruidenbeurs.' });
    const f1 = pk(FILLER), f2 = pk(FILLER.filter((x) => x !== f1));
    stories.push({ p: 1, head: f1[0], body: f1[1] }, { p: 0.5, head: f2[0], body: f2[1] });
    stories.sort((a, b) => b.p - a.p);
    const ads = []; while (ads.length < 3) { const a = pk(SMALL_ADS); if (!ads.includes(a)) ads.push(a); }
    return { d, c, w, head: stories[0].head, lead: stories[0], side: stories.slice(1, 4), ads };
  }
  function paperHTML() {
    const p = paper(), e = deps.econ.ensure(), n = forecastDays();
    const fc = []; for (let k = 1; k <= n; k++) { const f = forecast(p.d, k), cc = cal(p.d + k); fc.push(`<div class="kk-fc"><i>${cc.wdName.slice(0, 2)}</i><span>${f.icon}</span><b>${f.temp}°</b><small>${f.name}</small></div>`); }
    const why = demandWhy(p.d), dm = demand(p.d);
    const bias = Object.entries(SEASON_PRICE[p.c.season.id] || {}).length ? SEASON_LINE[p.c.season.id] : '';
    S().read = p.d;
    return `<div class="kk">
      <div class="kk-mast"><div class="kk-l">W 1,50</div><h1>Krant voor het Kaasvolk</h1><div class="kk-r">Since 1652 · independent · ish</div></div>
      <div class="kk-date">${p.c.wdName} · day ${p.d} · ${p.c.season.name}, week ${p.c.week}${p.c.year > 1 ? ` · year ${p.c.year}` : ''}${p.c.holi ? ` · <b>${p.c.holi.name}</b>` : ''}</div>
      <div class="kk-grid">
        <div class="kk-main"><h2>${p.lead.head}</h2><p>${p.lead.body}</p>
          ${p.side.map((s) => `<h3>${s.head}</h3><p>${s.body}</p>`).join('')}</div>
        <div class="kk-side">
          <div class="kk-box"><h4>Weerbericht</h4><div class="kk-now"><span>${p.w.icon}</span><div><b>${p.w.name}, ${p.w.temp}°</b><br><small>${p.w.line}.</small></div></div>
            <div class="kk-fcs">${fc.join('')}</div>${n < 3 ? '<small class="kk-dim">Three days ahead: for subscribers of Mengmeester rank.</small>' : '<small class="kk-dim">The further ahead, the more guesswork.</small>'}</div>
          <div class="kk-box"><h4>Snackbarbarometer</h4><div class="kk-baro"><b style="color:${dm > 1.02 ? '#1f7a2a' : dm < 0.98 ? '#a02020' : '#444'}">${dm > 1 ? '+' : ''}${Math.round((dm - 1) * 100)}%</b> snackbar orders today</div>${why.length ? `<ul>${why.map((x) => `<li>${x}</li>`).join('')}</ul>` : '<small class="kk-dim">An ordinary day.</small>'}${truckLate(p.d) ? '<p class="kk-warn">Trucks are stuck: what was due today comes tomorrow.</p>' : ''}</div>
          <div class="kk-box"><h4>Markt</h4>${(e.news || []).length ? e.news.map((x) => `<p>• ${x.text}</p>`).join('') : '<p>A quiet day on the Kruidenbeurs.</p>'}${bias ? `<p class="kk-dim">${bias}.</p>` : ''}</div>
          ${deps.ad ? `<div class="kk-box"><h4>Advertentie</h4>${deps.ad(p.d)}</div>` : ''}
          <div class="kk-box kk-ads"><h4>Kleintjes</h4>${p.ads.map((a) => `<p>${a}</p>`).join('')}</div>
        </div>
      </div></div>`;
  }
  const unread = () => deps.active() && S().read !== day();

  if (typeof document !== 'undefined' && !document.getElementById('kkcss')) {
    const css = document.createElement('style'); css.id = 'kkcss';
    css.textContent = `.kk{background:#f6f1e4;color:#222;font-family:Georgia,'Times New Roman',serif;padding:10px 14px 14px;border-radius:4px;box-shadow:inset 0 0 40px rgba(160,130,80,.18)}
.kk-mast{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;border-bottom:3px double #222;padding-bottom:4px}.kk-mast h1{margin:0;font:900 30px/1 Georgia,serif;letter-spacing:.3px;text-align:center;color:#1a1a1a}
.kk-l,.kk-r{font-size:10px;color:#555;font-style:italic}.kk-r{text-align:right}.kk-date{font-size:11px;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #222;padding:3px 0;margin-bottom:8px;text-align:center}
.kk-grid{display:grid;grid-template-columns:1.6fr 1fr;gap:14px}.kk-main h2{font:900 22px/1.1 Georgia,serif;margin:2px 0 6px}.kk-main h3{font:700 15px/1.15 Georgia,serif;margin:10px 0 3px;border-top:1px solid #bbb;padding-top:7px}
.kk p{margin:0 0 5px;font-size:13px;line-height:1.35}.kk-main>p:first-of-type::first-letter{float:left;font-size:34px;line-height:.9;padding:3px 4px 0 0;font-weight:900}
.kk-box{border:1px solid #c9bfa6;background:rgba(255,255,255,.5);border-radius:6px;padding:6px 8px;margin-bottom:8px}.kk-box h4{margin:0 0 5px;font:700 11px Arial,sans-serif;text-transform:uppercase;letter-spacing:1px;color:#8a5a14;border-bottom:1px solid #e0d4b4;padding-bottom:3px}
.kk-now{display:flex;gap:8px;align-items:center}.kk-now>span{font-size:30px}.kk-fcs{display:flex;gap:6px;margin:6px 0 3px}.kk-fc{flex:1;text-align:center;background:linear-gradient(#fff,#efe6cf);border:1px solid #d8cba8;border-radius:6px;padding:3px 2px;font-size:11px}
.kk-fc span{display:block;font-size:20px}.kk-fc i{display:block;font-style:normal;font-weight:700}.kk-fc small{display:block;color:#666;font-size:10px}.kk-dim{color:#777;font-size:11px}.kk-baro{font-size:13px}.kk-baro b{font-size:20px}
.kk ul{margin:4px 0 0 16px;padding:0;font-size:12px}.kk-warn{color:#a02020;font-weight:700}.kk-ads p{font-size:11.5px;border-bottom:1px dotted #c9bfa6;padding-bottom:3px}
@media (max-width:640px){.kk-grid{grid-template-columns:1fr}.kk-mast h1{font-size:21px}}
#objective .weer{display:block;margin-bottom:2px}`;
    document.head.appendChild(css);
  }

  function debugSet(id, d = day()) { const w = weather(d); memo.set(d, { temp: w.temp, id, ...WEATHER[id] }); for (const k of [...memo.keys()]) if (k > d) memo.delete(k); applied = -1; apply(); }
  return { setTime, debugSet, cal, weather, forecast, demand, demandWhy, truckLate, priceBias, grip, note, apply, update, hud, mutter, paper, paperHTML, unread, forecastDays, crowd, get current() { return cur; }, ensure: S };
}
