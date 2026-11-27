// De snelwegpolitie (2026-11-27): police chases on the motorway of js/rit.js. Kaasland's police drive electric cars,
// the Kaasla K, and the gemeente had them capped at 160 km/u ("veiligheid, en de lease"). They come when Eddy gives
// them a reason: past a flitser far too fast, past a patrol car parked on the vluchtstrook at more than 130, a hard hit
// on another car, a wrecked gang car, or the claxon at a flitsbus with two agents inside. One to three stars, one car a
// star. They block his lane with STOP POLITIE lit on the roof, flank him and shove; stop with one of them next to the
// van and Eddy is arrested (the trip is over and there is a fine). Ways out: lead them into the roadworks or the back
// of a truck, wait for a flat accu, or fit Garage Mo's turbo (js/garage.js 'turbo') and simply pull away at 175+.
// Out of sight, the C2000 radio starts debating whether this is worth it. Usually it is not.
const VPOL = 160 / 3.6, ACC = 8.5; // electric: a brutal launch, then the limiter
const RLI = '⁧', PDI = '⁩';
export const SEE_NL = ['Godverdomme, blauw in m\'n spiegel!', 'Krijg de tering met je stekkerkar!', 'Tyfuspolitie! Ga je accu opladen, lul!', 'Kolere-elektrokarretjes! Pak me dan, eikels!', 'Rot op met je zwaailicht, mietjes!', 'Kankerzooi! Ik heb paprika achterin, geen lijken!', 'Honderdzestig? M\'n oma rijdt harder op d\'r scootmobiel, sukkels!', 'Wat moeten jullie nou weer, stelletje lantaarnpalen?!'];
export const SEE_HE = [['שוטרים בני זונות!', 'shotrim bnei zonot!', 'klootzakken van agenten!'], ['כוס אמא של המשטרה!', 'kus ima shel hamishtara!', 'godverdomme, politie!'], ['יא חמור על סוללה!', 'ya chamor al solela!', 'ezel op een batterij!'], ['לכו תטעינו את התחת שלכם!', "lechu tat'inu et hatachat shelachem!", 'ga je reet opladen!'], ['תתפסו אותי אם אתם גברים, יא מניאקים!', 'titfesu oti im atem gvarim, ya manyakim!', 'pak me dan als je een vent bent, eikels!'], ['מה אתם רוצים ממני, יא זבלים?!', 'ma atem rotsim mimeni, ya zvalim?!', 'wat willen jullie van me, stuk vuil?!']];
export const AWAY_NL = ['Doei, stekkertjes! Groeten aan je laadpaal!', 'Honderdzestig, klootzakken? Kaaskanon, bitches!', 'Zie je m\'n uitlaat nog? Nee? Precies, lul!', 'Ga maar lekker opladen, mietjes! Twee uur bij de Kaasolie!', 'Haha! Bel de ANWB maar, sukkels!'];
export const AWAY_HE = [['ביי ביי, יא לוזרים!', 'bye bye, ya luzerim!', 'doei doei, losers!'], ['אכלו אבק, בני זונות!', 'achlu avak, bnei zonot!', 'vreet stof, klootzakken!'], ['יאללה, לכו להטעין, יא אפסים!', "yalla, lechu lehat'in, ya afasim!", 'hup, ga opladen, nullen!']];
export const RAM_NL = ['Daar, een kus van de Oofmobiel, eikel!', 'Oeps. Nee hoor, geen oeps. Lul!', 'Uit m\'n baan, kutkarretje!'];
// the C2000 portofoon: Kaasland-Noord, eenheden 17-21, 17-22 and 17-23, the meldkamer and the officier van dienst
const MK = 'Meldkamer', OVD = 'OvD';
const START = [
  [['17-21', 'Meldkamer, 17-21. Bestelbus, "{van}" op de zijkant, rijdt ons voorbij alsof we stilstaan. We gaan erachteraan.'], [MK, '17-21, begrepen. Rijd veilig. En denk aan de accu.']],
  [['17-21', 'Meldkamer, 17-21. Busje vol kruiden, {route} richting {to}. Zwaailicht aan, we gaan.'], [MK, 'Begrepen 17-21. Het ruikt hier op de meldkamer al naar kipkruiden.']],
  [['17-22', 'Meldkamer, 17-22. Die bus toeterde naar ons. Toeterde. Wij gaan erachteraan.'], [MK, 'Begrepen. Het is jullie avond, 17-22.']],
];
const MORE = [[MK, 'Extra eenheid onderweg. 17-2{n}, sluit aan.'], [MK, 'Hij maakt het erger. 17-2{n} komt erbij.'], ['17-2{n}', '17-2{n} hier, ik kom eraan. Heb nog negenenvijftig procent.']];
const CHAT = [['17-21', 'Hij rijdt honderdvijftig op de linkerbaan. Met een bestelbus. Respect, eigenlijk.'], ['17-22', 'Er waait paprikapoeder uit zijn achterdeur. M\'n ruitenwissers staan aan.'], ['17-21', 'Kenteken is half weggeroest. Ik lees K-A-A-S en dan een sticker van Ajax.'], [MK, 'Is het een witte Kangoo? Want die zoeken we ook.'], ['17-23', 'Negatief, blauw. Of grijs. Het is donker en ik rijd honderdzestig.'], ['17-22', 'Hij steekt z\'n middelvinger op. Met een kipkruidenzakje erin.'], [MK, 'Niet laten provoceren. Denk aan de cursus.'], ['17-21', 'Waarom hebben wij een begrenzer en hij niet?'], [MK, 'Omdat de gemeente niet wil dat jullie het leuk hebben.']];
const DEBATE = [
  [['17-21', 'Meldkamer, 17-21. Hij loopt weg. Die bus trekt echt door, hoor.'], ['17-22', 'Accu op eenendertig procent. Als we doorrijden staan we straks in Kaasstelveen aan een laadpaal.'], [MK, 'Is het de moeite? Wat heeft hij gedaan?'], ['17-21', 'Te hard. En hij toeterde. En ik denk dat hij "tering" riep.'], [OVD, 'OvD hier. Het is een busje met kruiden. We hebben het kenteken. Het CJIB stuurt wel een acceptgiro.']],
  [['17-22', 'Wij zitten op honderdzestig. Hij op honderdvijfenzeventig. In een bestelbus. Ik schaam me kapot.'], ['17-23', 'Ik zeg doorrijden. Ik heb deze Kaasla niet voor niks gekregen.'], [MK, 'Negatief, 17-23. Het bonnenquotum is al gehaald deze maand.'], ['17-22', 'Mijn dienst zit er om vijf uur op en ik heb een verjaardag in Purmerkaas.'], [OVD, 'Veiligheid gaat voor. En de lease ook. Laat maar lopen.']],
  [['17-21', 'Hij is uit zicht. Ik zie alleen nog een wolk saffraan.'], [MK, 'Kunnen jullie hem nog bijhouden?'], ['17-21', 'Met de wind mee misschien. Maar we hebben de wind tegen.'], ['17-22', 'Eerlijk? Ik ruik nog naar z\'n kipkruiden. Ik heb trek.'], [OVD, 'Prima. Afbreken. Kenteken naar het CJIB, die zijn veel enger dan wij.']],
  [['17-23', 'Meldkamer, we verliezen hem. Ik herhaal: we verliezen een bestelbus.'], [MK, 'Dat gaat in het jaarverslag, 17-23.'], ['17-21', 'Kunnen we geen helikopter vragen?'], [MK, 'De helikopter staat bij de Zandvoortse Kaasmarathon.'], [OVD, 'Dan sturen we gewoon een brief. Daar schrikken ze in Kaasland het meest van.']],
];
const CALLOFF = [[[MK, 'Meldkamer aan alle eenheden: achtervolging afbreken. Ik herhaal: afbreken.'], ['17-21', 'Begrepen. Wij gaan laden bij de Kaasolie. Wie heeft er een pasje?']], [[MK, 'Alle eenheden: afbreken. Koffie bij de Kaasolie, de meldkamer trakteert.'], ['17-22', 'Eindelijk. Accu op twaalf procent, ik zat al te zweten.']], [[MK, 'Afbreken, iedereen. Hij krijgt een brief.'], ['17-23', 'Een brief. Die gaat hij heel erg vinden.']]];
const RESUME = [['17-21', 'Wacht, wacht! Hij hangt achter een vrachtwagen. We hebben hem weer!'], ['17-22', 'Laat maar, meldkamer, hij remt! We zitten er weer op!'], ['17-23', 'Hij heeft z\'n afrit gemist, haha. We zijn er weer.']];
const OUT = { works: ['We staan in de wegwerkzaamheden. Niemand gewond. De bumper wel.', 'We hebben een pijlwagen geraakt. De pijl wijst nu naar ons.'], truck: ['Achterkant van een vrachtwagen geraakt. Ik herhaal: wij zitten in de kaas.', 'Aanrijding met een vrachtwagen. Hij heeft het niet eens gemerkt.'], car: ['We hebben een caravan geraakt. Er staat een man in z\'n onderbroek op de vluchtstrook te schelden.', 'Een auto geraakt. Hij mag zijn verzekering bellen. Wij de onze.'], battery: ['Accu leeg. We rollen uit op de vluchtstrook. Kan iemand de ANWB bellen?', 'Nul procent. Het scherm zegt "zoek een laadpaal". Op de A10. Ja hoor.'] };
const ALLOUT = [[MK, 'Meldkamer aan... aan wie eigenlijk nog? Iedereen staat stil. Afbreken.'], [OVD, 'Drie Kaasla\'s uit de running voor een busje kruiden. Ik wil morgen een verklaring.']];
const RAMMED = [['17-2{n}', 'Hij ramt ons! Hij RAMT ons! Met een bestelbus!'], ['17-2{n}', 'Aanrijding met de dienstauto. Dit wordt een hoop papierwerk.'], [MK, 'Geweld tegen de politie. Nu menen we het.']];
const ARREST = [['17-21', 'Staande gehouden. Hij zegt dat het "voor de buurt" is.'], [MK, 'Mooi werk. Neem de kruiden in beslag. Behalve de kipkruiden, die zijn voor de kantine.']];

// d: THREE, kit(), lam, makeCar(opts), beep, toast, rant({nl, he}, extra), nightK(), onPolice(kind, data), Z0, LW, SEDGE, NEDGE
export function createSnelPolitie(d) {
  const { THREE, Z0, LW, SEDGE } = d;
  const units = []; let parent = null, on = false, stars = 0, cool = 0, hold = 0, sirT = 0, chatT = 0, rantT = 0, away = false, blink = 0, debate = null, debateCool = 0, vars = {}, ctxT = 0;
  // ---- the car: the Kaasla K, white, POLITIE striping, a blue light bar and a STOP POLITIE board facing back
  const EV = { n: 'Kaasla K', W: 1.86, r: 0.14, wr: 0.33, body: [[-2.35, 0.32], [2.35, 0.32], [2.42, 0.62], [1.5, 0.8], [0.45, 1.38], [-0.75, 1.4], [-1.95, 0.98], [-2.4, 0.86]], glass: [[1.38, 0.84], [0.45, 1.33], [-0.72, 1.35], [-1.82, 0.99]], lights: 'rect', d: { ws: [3, 4], rw: [6, 5], hood: [2, 3], boot: [7, 6] } };
  const tex = (w, h, draw) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  let sideMat = null, stopMat = null, glowMat = null;
  function mats() {
    if (sideMat) return;
    sideMat = d.lam({ map: tex(512, 96, (c, w, h) => { // the Dutch striping: POLITIE in blue, a band of blue and red-orange blocks under it
      c.clearRect(0, 0, w, h); c.fillStyle = '#16388f'; c.font = '900 40px Arial, sans-serif'; c.textBaseline = 'middle'; c.fillText('POLITIE', 150, 26);
      c.save(); c.beginPath(); c.rect(0, 52, w, 36); c.clip(); for (let x = -40, i = 0; x < w + 40; x += 34, i++) { c.fillStyle = i % 2 ? '#ff5a1a' : '#16388f'; c.beginPath(); c.moveTo(x, 88); c.lineTo(x + 34, 88); c.lineTo(x + 54, 52); c.lineTo(x + 20, 52); c.closePath(); c.fill(); } c.restore();
      c.fillStyle = '#16388f'; c.fillRect(0, 48, w, 4); c.font = '700 18px Arial'; c.fillText('112', 420, 26); c.beginPath(); c.arc(110, 26, 15, 0, 7); c.fill(); c.fillStyle = '#ffd34a'; c.font = '900 18px Arial'; c.fillText('★', 101, 27); }), transparent: true });
    stopMat = new THREE.MeshBasicMaterial({ map: tex(256, 64, (c, w, h) => { c.fillStyle = '#050505'; c.fillRect(0, 0, w, h); c.fillStyle = '#ff2a1a'; c.shadowColor = '#ff2a1a'; c.shadowBlur = 8; c.font = '900 30px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STOP POLITIE', w / 2, h / 2 + 1); c.shadowBlur = 0; c.fillStyle = '#050505'; for (let i = 0; i < w; i += 4) c.fillRect(i, 0, 1.3, h); for (let i = 0; i < h; i += 4) c.fillRect(0, i, w, 1.3); }), fog: false });
    const glow = tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.5, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    glowMat = new THREE.MeshBasicMaterial({ map: glow, color: 0x3a6aff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  }
  function makeUnit(i) {
    mats();
    const g = d.makeCar({ paint: 0xf6f6f2, profile: EV }), half = g.userData.half, zs = EV.W / 2 + 0.015;
    for (const s of [1, -1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 0.75), sideMat); p.position.set(-0.15, 0.62, s * zs); p.rotation.y = s > 0 ? 0 : Math.PI; g.add(p); }
    const K = d.kit(); K.box(0.36, 0.1, 1.2, 0x1a1c22, -0.2, 1.45, 0); K.box(0.1, 0.06, 1.0, 0x1a1c22, -0.2, 1.42, 0); K.box(0.06, 0.24, 0.9, 0x1a1c22, -0.4, 1.58, 0); // the bar and the STOP board's housing
    const km = K.build(); g.add(km);
    const blue = new THREE.MeshBasicMaterial({ color: 0x2a6aff, fog: false }), lens = (z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.12, 0.42), blue); m.position.set(-0.2, 1.54, z); g.add(m); return m; };
    const la = lens(0.33), lb = lens(-0.33);
    const fa = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.22), blue), fb = fa.clone(); fa.position.set(half + 0.01, 0.55, 0.45); fb.position.set(half + 0.01, 0.55, -0.45); g.add(fa, fb); // flashers in the grille
    const stop = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.22), stopMat); stop.position.set(-0.44, 1.58, 0); stop.rotation.y = -Math.PI / 2; stop.visible = false; g.add(stop);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(9, 7).rotateX(-Math.PI / 2), glowMat.clone()); glow.position.set(0, 0.1, 0); glow.renderOrder = 3; g.add(glow);
    g.visible = false; parent.add(g);
    return { g, half, la, lb, fa, fb, stop, glow, n: i + 1, mode: 'off', v: 0, batt: 60, bumpT: 0, duw: 0, tz: Z0 };
  }
  function build(p) { parent = p; for (let i = 0; i < 3; i++) units.push(makeUnit(i)); }
  // ---- the portofoon
  const css = document.createElement('style');
  css.textContent = `#ritRadio{position:fixed;right:16px;top:150px;z-index:10;display:none;width:min(330px,44vw);padding:6px 8px 8px;border-radius:10px;background:linear-gradient(180deg,#3a3d42,#1e2024);border:1px solid #0c0d0f;box-shadow:0 6px 18px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.15);font:600 12px/1.3 "Segoe UI",Tahoma,Arial,sans-serif;pointer-events:none}
#ritRadio .hd{display:flex;justify-content:space-between;color:#c8ccd2;font-size:10px;letter-spacing:.08em;margin:0 2px 4px}#ritRadio .hd i{font-style:normal;color:#ff6a5a}#ritRadio .hd i.b{color:#7ab0ff}
#ritRadio .lcd{background:linear-gradient(180deg,#b8d8a0,#9cc488);border-radius:5px;padding:5px 7px;color:#16260e;box-shadow:inset 0 1px 3px rgba(0,0,0,.5);min-height:30px}
#ritRadio .ln{margin:2px 0;animation:rr .25s ease-out}#ritRadio .ln b{color:#0a3a6a;margin-right:4px}#ritRadio .ln.old{opacity:.55}@keyframes rr{from{opacity:0;transform:translateY(4px)}to{opacity:1}}
@media (max-width:820px),(max-height:500px){#ritRadio{right:8px;top:auto;bottom:calc(150px + env(safe-area-inset-bottom));width:min(300px,58vw);font-size:10.5px}body.touch #ritRadio{bottom:auto;top:142px}#ritRadio .hd .k{display:none}}`;
  document.head.appendChild(css);
  const radio = document.createElement('div'); radio.id = 'ritRadio'; document.body.appendChild(radio);
  let queue = [], shown = [], sayT = 0, idleT = 0;
  const fill = (s) => s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  function say(lines) { for (const l of lines) queue.push(l); }
  function pump(dt) {
    if ((sayT -= dt) <= 0 && queue.length) {
      const [who, text] = queue.shift(); shown.push([fill(who), fill(text)]); if (shown.length > 3) shown.shift(); sayT = 1.7; idleT = 0;
      radio.innerHTML = `<div class="hd"><span>C2000<span class="k"> · KAASLAND-NOORD</span></span><span>${stars ? `<i class="b">${'●'.repeat(stars)}</i>` : ''} <i>${on ? 'ACHTERVOLGING' : 'KANAAL 17'}</i></span></div><div class="lcd">${shown.map((l, i) => `<div class="ln${i < shown.length - 1 ? ' old' : ''}"><b>${l[0]}:</b>${l[1]}</div>`).join('')}</div>`;
      radio.style.display = 'block'; d.beep(1200, 0.03, 'square', 0.015); // the squelch
    }
    if (!queue.length && radio.style.display === 'block' && (idleT += dt) > (on ? 9 : 5)) { radio.style.display = 'none'; shown = []; }
  }
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  // ---- the chase
  const active = () => units.filter((u) => u.mode === 'chase');
  function spawn(u, B) {
    u.g.visible = true; u.mode = 'chase'; u.batt = 35 + Math.random() * 55; u.bumpT = 1.5; u.duw = 0; u.stop.visible = false; u.grace = 2.5;
    const back = B.x - 75 - active().length * 24, clear = (x, z) => !(d.cars ? d.cars() : []).some((c) => Math.abs(c.g.position.z - z) < 1.6 && Math.abs(c.g.position.x - x) < c.half + 8) && !units.some((q) => q !== u && q.mode !== 'off' && Math.abs(q.g.position.z - z) < 1.6 && Math.abs(q.g.position.x - x) < 9);
    if (back > d.X0 - 40) { const z = [Z0 + LW, Z0, Z0 - LW, SEDGE - 1.3].find((zz) => clear(back, zz)) ?? SEDGE - 1.3; u.g.position.set(back, 0, z); u.v = Math.min(VPOL, Math.abs(B.v) + 6); } // from behind, in a lane that is free
    else u.g.position.set(B.x + 130, 0, SEDGE - 1.3), u.v = 8; // or waiting on the vluchtstrook ahead
    u.tz = u.g.position.z; u.g.rotation.y = 0;
  }
  // reason: 'flits', 'parked', 'hit', 'wreck', 'honk', 'ram'. ctx: { B, route, to, van }; fromU: the parked car that joins
  function trigger(reason, ctx, fromU) {
    if (!parent) return false;
    if (!on) {
      if (cool > 0 && reason !== 'ram' && reason !== 'parked') return false;
      on = true; stars = reason === 'ram' ? 2 : 1; hold = 0; away = true; // 'away' fires only after they were close once debate = null; debateCool = 0; chatT = 7; rantT = 0; ctxT = 0;
      vars = { van: ctx.van || 'Oofmobiel', route: ctx.route || 'A10', to: ctx.to || 'de stad' };
      const free = units.filter((u) => u.mode !== 'chase' && u !== fromU); let n = stars; if (fromU) { spawnFrom(fromU); n--; } for (let i = 0; i < n && i < free.length; i++) spawn(free[i], ctx.B);
      say(pick(START)); d.rant({ nl: SEE_NL, he: SEE_HE }); rantT = 9;
      d.toast('POLITIE!', `The snelweg politie is on you${stars > 1 ? ` (${stars} cars)` : ''}. Their Kaasla's top out at 160 km/u: outrun them, lead them into the works or a truck, or get caught.`, 4);
      d.onPolice('chase', { reason, stars }); return true;
    }
    if (stars >= 3) return false;
    stars++; const u = units.find((x) => x.mode !== 'chase'); if (u) { vars.n = u.n; spawn(u, ctx.B); say([pick(MORE)]); }
    d.toast('POLITIE ' + '★'.repeat(stars), reason === 'ram' ? 'You rammed a police car. Now they mean it.' : 'More units are joining.', 2.2);
    return true;
  }
  function end(how) {
    on = false; stars = 0; debate = null; cool = 25; hold = 0;
    for (const u of units) if (u.mode === 'chase') u.mode = 'leave';
    if (how === 'escape' || how === 'allout') { say(how === 'allout' ? ALLOUT : pick(CALLOFF)); d.rant({ nl: AWAY_NL, he: AWAY_HE }, 'Kwijt!'); d.toast('AFGEBROKEN!', 'The politie calls it off. You get a letter from the CJIB, some day.', 3.4); d.onPolice('escape', { how }); }
  }
  function out(u, why) { u.mode = 'out'; u.stop.visible = false; vars.n = u.n; say([['17-2' + u.n, pick(OUT[why])]]); d.beep(90, 0.25, 'sawtooth', 0.05); if (!active().length) end('allout'); }
  // all units off the road: a new trip
  function reset() { on = false; stars = 0; cool = 0; debate = null; hold = 0; queue = []; shown = []; radio.style.display = 'none'; for (const u of units) { u.mode = 'off'; u.g.visible = false; u.stop.visible = false; } }
  // a patrol car waiting on the vluchtstrook this trip (or not): it joins the moment Eddy blasts past
  function park(x) { const u = units[2]; if (!u) return; u.mode = x ? 'parked' : 'off'; u.g.visible = !!x; if (x) { u.g.position.set(x, 0, SEDGE - 1.3); u.g.rotation.y = 0; u.v = 0; u.tz = u.g.position.z; } }
  function shift(dx) { for (const u of units) u.g.position.x += dx; }
  const close = (B) => on && active().some((u) => Math.abs(u.g.position.x - B.x) < 110);
  const hb = (ax, az, ahx, ahz, bx, bz, bhx, bhz) => Math.abs(ax - bx) < ahx + bhx && Math.abs(az - bz) < ahz + bhz;
  const laneZ = (z) => Z0 + Math.max(-1, Math.min(1, Math.round((z - Z0) / LW))) * LW;
  // ctx: { B, sp, cars, works, damage(n), arrest(fine), t }
  function update(dt, ctx) {
    const { B } = ctx, sp = Math.abs(B.v); blink += dt; pump(dt);
    if (cool > 0) cool -= dt; if (debateCool > 0) debateCool -= dt;
    const ph = Math.floor(blink * 6) % 2, night = d.nightK ? d.nightK() : 0;
    for (const u of units) {
      if (u.mode === 'off') continue;
      const p = u.g.position, lit = u.mode === 'chase';
      u.la.visible = lit && !!ph; u.lb.visible = lit && !ph; u.fa.visible = lit && !ph; u.fb.visible = lit && !!ph; u.glow.visible = lit; if (lit) u.glow.material.opacity = (0.25 + night * 0.55) * (ph ? 1 : 0.35);
      if (u.mode === 'parked') { // waiting by a praatpaal, a man inside with a speed gun and a broodje kroket
        if (p.x < B.x - 2 && p.x > B.x - 30 && sp > 130 / 3.6) { if (on) { if (stars < 3) { stars++; spawnFrom(u); } else u.mode = 'off'; } else trigger('parked', ctx.info, u); }
        else if (hb(p.x, p.z, u.half, 1.0, B.x, B.z, 2.3, 1.0)) { ctx.damage(6); B.v *= 0.4; if (on) { stars = Math.min(3, stars + 1); spawnFrom(u); } else trigger('ram', ctx.info, u); }
        continue;
      }
      if (u.mode === 'leave' || u.mode === 'out') { // off the throttle, onto the vluchtstrook, gone once out of sight
        u.v = Math.max(u.mode === 'out' ? 0 : 20, u.v - (u.mode === 'out' ? 14 : 6) * dt); p.x += u.v * dt; p.z += (SEDGE - 1.3 - p.z) * Math.min(1, dt * (u.mode === 'out' ? 3 : 0.8)); u.stop.visible = false;
        if (Math.abs(p.x - B.x) > 220) { u.mode = 'off'; u.g.visible = false; } continue;
      }
      // chase: slot 1 blocks ahead, slot 2 flanks, slot 3 sits on the bumper
      const act0 = active(), idx = act0.indexOf(u), dx0 = B.x - p.x, side = laneZ(B.z) + (B.z > Z0 + 0.5 ? -LW : LW); let tx, tz = laneZ(B.z), stopping = false;
      if (idx === 0) { tx = B.x + 13; if (p.x > B.x + 4 && Math.abs(p.z - B.z) < 2.2) stopping = true; else if (p.x < B.x + 6) tz = side; } // overtake in the next lane, then cut in
      else if (idx === 1) { const blk = act0[0], passing = blk && blk.g.position.x < B.x + 6 && Math.abs(blk.g.position.x - p.x) < 30; tx = passing ? B.x - 9 : B.x + 0.5; tz = passing ? laneZ(B.z) : side; } // the flank waits while the blocker goes by
      else tx = B.x - 10;
      if (u.duw > 0) { u.duw -= dt; tz = B.z; } else if ((u.bumpT -= dt) <= 0 && Math.abs(dx0) < 4 && Math.abs(p.z - B.z) < LW * 1.3) { u.bumpT = 4 + Math.random() * 3; if (Math.random() < 0.55) u.duw = 0.7; } // the duw: shove him off the lane
      let vt = stopping ? Math.max(sp - 4, sp * 0.8) : Math.abs(B.v) + Math.max(-12, Math.min(30, (tx - p.x) * 0.9));
      // traffic: look ahead in the lane they are in and the lane they want; change lanes when one is free, otherwise slow down behind it
      const look = 7 + u.v * 0.32, VS = SEDGE - 1.3;
      const blockIn = (z) => { let best = null; for (const c of ctx.cars) { if (c.wreck) continue; const cp = c.g.position, ahead = cp.x - p.x; if (Math.abs(cp.z - z) < 2.0 && ahead > -(c.half + u.half + 1.5) && ahead < c.half + u.half + look && (!best || ahead < best.g.position.x - p.x)) best = c; } return best; };
      for (const w of ctx.works) { const wx = w.g.position.x, ahead = wx - 46 - p.x; if (Math.abs(tz - w.g.position.z) < 1.8 && ahead < 12 + u.v * 0.3 && wx + 33 > p.x) tz = Z0; } // they know where the works are (when they look up in time)
      const stay = Math.abs(p.z - VS) < 1 ? VS : laneZ(p.z);
      if (Math.abs(tz - p.z) > 0.6 && blockIn(tz)) tz = stay; // not into a lane with somebody in it
      const bc = blockIn(p.z);
      if (bc && bc.g.position.x > p.x) {
        const gapA = bc.g.position.x - p.x - bc.half - u.half;
        const alt = [stay - LW, stay + LW, ...(stay > Z0 + 1 && stay < VS - 0.5 ? [VS] : [])].filter((z) => z >= Z0 - LW - 0.1 && z <= VS + 0.1 && !blockIn(z));
        if (alt.length) { tz = alt.sort((a, b) => Math.abs(a - B.z) - Math.abs(b - B.z))[0]; vt = Math.min(vt, bc.vv + 2 + gapA * 0.6); } else { tz = stay; vt = Math.min(vt, bc.vv - 1 + (gapA - 4) * 0.4); }
      }
      vt = Math.max(0, Math.min(VPOL, vt)); u.v += Math.max(-16 * dt, Math.min(ACC * (1 - u.v / (VPOL + 4)) * dt * 1.6, vt - u.v)); p.x += u.v * dt;
      u.tz = tz; p.z += (tz - p.z) * Math.min(1, dt * (u.duw > 0 ? 3.2 : stopping ? 1.1 : 1.9)); // the blocker is a beat late on a swerve p.z = Math.max(Z0 - LW * 1.2, Math.min(SEDGE - 1.3, p.z)); u.g.rotation.y = -(tz - p.z) * 0.04;
      u.stop.visible = stopping;
      for (const q of act0) if (q !== u && Math.abs(q.g.position.z - p.z) < 1.8 && q.g.position.x > p.x && q.g.position.x - p.x < u.half * 2 + 1.5) { u.v = Math.min(u.v, q.v - 0.5); p.x = Math.min(p.x, q.g.position.x - u.half * 2 - 1.5); } // no stacking on each other
      // the accu: 160 km/u eats it
      u.batt -= dt * (0.12 + 0.6 * (u.v / VPOL) ** 2); if (u.batt <= 0) { out(u, 'battery'); continue; }
      // hits: traffic and the works end a car, Eddy gets shoved or rams back
      const hitWork = ctx.works.some((w) => hb(p.x, p.z, u.half, 0.9, w.g.position.x + 18.5, w.g.position.z, 14.5, 1.4) || hb(p.x, p.z, u.half, 0.9, w.g.position.x + 0.4, w.g.position.z, 4.2, 1.2));
      if (u.grace > 0) u.grace -= dt;
      if (hitWork && u.grace <= 0) { out(u, 'works'); continue; }
      const hc = ctx.cars.find((c) => !c.wreck && hb(p.x, p.z, u.half, 0.95, c.g.position.x, c.g.position.z, c.half, 1.0));
      if (hc) { if (u.v - hc.vv > 7 && p.x < hc.g.position.x && u.grace <= 0) { out(u, hc.truck ? 'truck' : 'car'); hc.vv *= 0.6; continue; } if (p.x < hc.g.position.x) { u.v = Math.min(u.v, hc.vv - 1); p.x = Math.min(p.x, hc.g.position.x - hc.half - u.half - 0.1); } else { hc.vv = Math.min(hc.vv, u.v - 1); hc.g.position.x = Math.min(hc.g.position.x, p.x - hc.half - u.half - 0.1); } }
      if (hb(p.x, p.z, u.half, 0.95, B.x, B.z, 2.3, 1.0)) {
        const behind = B.x < p.x - 1.5, side = Math.abs(B.z - p.z) > 1.3;
        if (side) { B.z += Math.sign(B.z - p.z) * 7 * dt; p.z -= Math.sign(B.z - p.z) * 3 * dt; if (u.duw > 0) { u.duw = 0; ctx.damage(4); d.beep(80, 0.14, 'sawtooth', 0.05); } }
        else if (behind) { const rel = B.v - u.v; if (rel > 7) { ctx.damage(3); vars.n = u.n; if (stars < 3) say([pick(RAMMED)]); trigger('ram', ctx.info); d.rant({ nl: RAM_NL, he: SEE_HE }); } B.v = Math.min(B.v, u.v - 0.5); B.x = Math.min(B.x, p.x - u.half - 2.35); }
        else { if (u.v - B.v > 3) { ctx.damage(4); d.beep(80, 0.14, 'sawtooth', 0.05); } u.v = Math.min(u.v, B.v - 1); p.x = Math.min(p.x, B.x - u.half - 2.35); B.v += 0.6; }
      }
    }
    if (!on) return;
    const act = active(); if (!act.length) { end('allout'); return; }
    ctxT += dt;
    const gap = Math.min(...act.map((u) => Math.abs(B.x - u.g.position.x)));
    // the siren: the Dutch two-tone, louder close by
    if ((sirT -= dt) <= 0) { sirT = 0.62; const hi = Math.floor(blink / 0.62) % 2; d.beep(hi ? 587 : 440, 0.5, 'triangle', gap < 40 ? 0.03 : gap < 120 ? 0.016 : 0.006); }
    // stopped with a police car alongside: arrested
    const near = act.some((u) => Math.abs(u.g.position.x - B.x) < 9 && Math.abs(u.g.position.z - B.z) < 4.5);
    if (near && sp < 3.5) { if ((hold += dt) > 1.6) { const fine = 150 * stars; say(ARREST); on = false; for (const u of units) if (u.mode === 'chase') { u.mode = 'leave'; u.v = 0; } const st = stars; stars = 0; ctx.arrest(fine, st); return; } } else hold = Math.max(0, hold - dt * 2);
    // out of sight: the radio debates it
    if (gap > 80 && !away && ctxT > 3) { away = true; d.rant({ nl: AWAY_NL, he: AWAY_HE }); rantT = 8; }
    if (gap < 50) away = false;
    if (!debate && gap > 90 && debateCool <= 0 && ctxT > 6) { debate = { lines: pick(DEBATE), t: 0 }; queue = debate.lines.slice(); }
    if (debate) {
      debate.t += dt;
      if (gap < 60) { debate = null; queue = []; say([pick(RESUME)]); debateCool = 8; }
      else if (debate.t > debate.lines.length * 1.7 + 1.0) { if (gap > 75) { end('escape'); return; } debate = null; debateCool = 4; }
    } else if ((chatT -= dt) <= 0 && !queue.length) { chatT = 8 + Math.random() * 5; say([pick(CHAT)]); }
    if ((rantT -= dt) <= 0 && gap < 60) { rantT = 9 + Math.random() * 5; d.rant({ nl: SEE_NL, he: SEE_HE }); }
  }
  function spawnFrom(u) { u.g.visible = true; u.mode = 'chase'; u.stop.visible = false; u.duw = 0; u.grace = 1.5; u.batt = 40 + Math.random() * 50; u.bumpT = 2; u.v = 0; }
  return { build, trigger, update, reset, park, shift, close, end, get on() { return on; }, get stars() { return on ? stars : 0; }, units, VPOL };
}
